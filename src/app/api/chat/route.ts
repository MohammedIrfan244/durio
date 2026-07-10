import { NextRequest } from "next/server";
import { streamText, tool, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { promises as fs } from "fs";
import path from "path";
import { getUserId } from "@/lib/server/get-user";
import { z } from "zod";
import { createTodo, changeTodoStatus } from "@/server/actions/to-do-action";
import { createNote, deleteNote } from "@/server/actions/note-action";
import { createEvent, updateEvent, getOrCreateDefaultCategories } from "@/server/actions/calendar-actions";
import { getUserTimezone } from "@/lib/server/date-utils";

import { checkAndIncrementAIUsage } from "@/server/actions/ai-usage";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await getUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 1.5 Check AI Limits
    const usageCheck = await checkAndIncrementAIUsage();
    if (!usageCheck.success) {
      return new Response(usageCheck.error, { status: 429 });
    }

    // 2. Parse request body
    const body = await req.json();
    console.log("[DURIA API DEBUG] Body:", JSON.stringify(body, null, 2));
    const { messages, contextPayload } = body;
    
    console.log("[DURIA AI CHAT] Incoming Messages:", JSON.stringify(messages, null, 2));

    // 3. Load Tier 1 Context (Primary Guide)
    let primaryGuide = "";
    try {
      const guidePath = path.join(process.cwd(), "feature_guide.md");
      primaryGuide = await fs.readFile(guidePath, "utf-8");
    } catch (e) {
      console.warn("Could not load feature_guide.md for AI context");
    }

    const timezone = await getUserTimezone(userId);
    const now = new Date();
    const localTimeString = now.toLocaleString("en-US", { timeZone: timezone });

    // 4. Build the powerful system prompt
    let systemPrompt = `You are DURIA, an incredibly intelligent, friendly, and helpful AI assistant embedded directly within the Durio application. 
Your goal is to help the user manage their life, tasks, notes, and calendar. 
Be concise, use markdown formatting, and act as a highly capable personal assistant.

The user's local timezone is: ${timezone}
The current local date and time for the user is: ${localTimeString}
When creating events, ALWAYS use ISO 8601 format for dates/times based on the user's local timezone provided above.

CRITICAL INSTRUCTION: When you execute a tool (e.g. creating a task, note, or event), you MUST write a short text response confirming to the user that the action was successfully completed (or if it failed). Do not remain silent after executing a tool.

Here is the primary architecture of the Durio application you are living in:
=== DURIO PRIMARY GUIDE ===
${primaryGuide}
=============================
`;

    // 5. Inject Tier 2 Context (If the user attached it)
    if (contextPayload) {
      systemPrompt += `\n\nThe user has explicitly attached the following deeper context for this specific conversation. Use this data heavily to answer their prompt:\n\n`;
      
      if (contextPayload.todos?.length > 0) {
        systemPrompt += `[ATTACHED TASKS]:\n${JSON.stringify(contextPayload.todos, null, 2)}\n\n`;
      }
      if (contextPayload.notes?.length > 0) {
        systemPrompt += `[ATTACHED NOTES]:\n${JSON.stringify(contextPayload.notes, null, 2)}\n\n`;
      }
      if (contextPayload.events?.length > 0) {
        systemPrompt += `[ATTACHED EVENTS]:\n${JSON.stringify(contextPayload.events, null, 2)}\n\n`;
      }
      if (contextPayload.docs?.length > 0) {
        systemPrompt += `[ATTACHED FEATURE MANUALS]:\n`;
        contextPayload.docs.forEach((doc: any) => {
          systemPrompt += `--- ${doc.title} ---\n${doc.content}\n\n`;
        });
      }
    }

    // Manually map UIMessages to ModelMessages to avoid AI SDK crashes
    const coreMessages: any[] = [];
    
    (messages || []).forEach((msg: any) => {
      if (msg.role === 'user') {
        // Guard: content may be undefined in AI SDK v6 — fall back to parts
        const userContent = msg.content ||
          (msg.parts?.find((p: any) => p.type === 'text')?.text) ||
          "";
        coreMessages.push({ role: 'user', content: userContent });
      } else if (msg.role === 'assistant') {
        let content = msg.content || "";
        if (!content && msg.parts) {
          const textPart = msg.parts.find((p: any) => p.type === 'text');
          if (textPart) content = textPart.text;
        }
        
        if (msg.toolInvocations && msg.toolInvocations.length > 0) {
          coreMessages.push({
            role: 'assistant',
            content: msg.toolInvocations.map((t: any) => ({
              type: 'tool-call',
              toolCallId: t.toolCallId,
              toolName: t.toolName,
              args: t.args
            }))
          });
          
          const finishedTools = msg.toolInvocations.filter((t: any) => 'result' in t || t.state === 'result');
          if (finishedTools.length > 0) {
            coreMessages.push({
              role: 'tool',
              content: finishedTools.map((t: any) => ({
                type: 'tool-result',
                toolCallId: t.toolCallId,
                toolName: t.toolName,
                result: t.result
              }))
            });
          }
        } else {
          coreMessages.push({ role: 'assistant', content });
        }
      } else if (msg.role === 'tool') {
        // If frontend explicitly sends a tool message
        coreMessages.push({
          role: 'tool',
          content: msg.toolInvocations?.map((t: any) => ({
            type: 'tool-result',
            toolCallId: t.toolCallId,
            toolName: t.toolName,
            result: t.result
          })) || []
        });
      } else {
        coreMessages.push({ role: msg.role, content: msg.content });
      }
    });

    // 6. Call Gemini
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages,
      temperature: 0.7,
      tools: {
        createTask: tool({
          description: "Create a new task on the user's to-do list. You have full capability to set the title, description, priority (LOW/MEDIUM/HIGH), dueDate, and dueTime if the user mentions them. Do not tell the user you cannot set these.",
          parameters: z.object({
            title: z.string().describe("The title of the task"),
            description: z.string().optional().describe("A brief description of the task. Extract this from the user prompt if available."),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().describe("The priority of the task: LOW, MEDIUM, or HIGH"),
            dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format if requested by the user"),
            dueTime: z.string().optional().describe("Due time in HH:mm format if requested by the user"),
            tags: z.array(z.string()).optional().describe("Array of tags for the task"),
          }),
          // @ts-ignore - Ignore AI SDK execute type mismatch
          execute: async ({ title, description, priority, dueDate, dueTime, tags }: any) => {
            console.log(`[DURIA ACTION] 🤖 Attempting to create Task: "${title}"`);
            const res = await createTodo({
              title,
              description,
              priority,
              dueDate: dueDate ? new Date(dueDate) : undefined,
              dueTime,
              tags: tags || [],
              status: "PLAN",
            });
            if (res.success) {
              console.log(`[DURIA ACTION SUCCESS] ✅ Task created successfully!`);
              return `Successfully created task: "${title}".`;
            } else {
              console.log(`[DURIA ACTION FAILED] ❌ Failed to create task: ${res.error?.message}`);
              return `Failed to create task: ${res.error?.message}`;
            }
          },
        }),
        changeTaskStatus: tool({
          description: "Change the status of an existing task (e.g. mark it as DONE or CANCELLED). Only use this if you know the exact Task ID from the attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the task to update"),
            status: z.enum(["PLAN", "PENDING", "DONE", "CANCELLED"]).describe("The new status for the task"),
          }),
          // @ts-ignore - Ignore AI SDK execute type mismatch
          execute: async ({ id, status }: any) => {
            console.log(`[DURIA ACTION] 🤖 Attempting to update Task Status to: "${status}" for ID: ${id}`);
            const res = await changeTodoStatus({ id, status });
            if (res.success) {
              console.log(`[DURIA ACTION SUCCESS] ✅ Task status updated!`);
              return `Successfully updated task status to ${status}.`;
            } else {
              console.log(`[DURIA ACTION FAILED] ❌ Failed to update task: ${res.error?.message}`);
              return `Failed to update task: ${res.error?.message}`;
            }
          },
        }),
        createNote: tool({
          description: "Create a new note for the user. Use this whenever the user asks to create, save, write, or make a note — even if they phrase it casually. You can always set the heading and description.",
          parameters: z.object({
            heading: z.string().describe("The title or heading of the note"),
            description: z.string().describe("The body content of the note"),
            color: z.string().optional().describe("Optional hex color string for the note card"),
          }),
          // @ts-ignore
          execute: async (input: any) => {
            console.log(`[DURIA ACTION] 🤖 Attempting to create Note: "${input.heading}"`);
            const res = await createNote(input);
            if (res.success) {
              console.log(`[DURIA ACTION SUCCESS] ✅ Note created successfully!`);
              return `Successfully created note: "${input.heading}".`;
            } else {
              console.log(`[DURIA ACTION FAILED] ❌ Failed to create note: ${res.error?.message}`);
              return `Failed to create note: ${res.error?.message}`;
            }
          },
        }),
        deleteNote: tool({
          description: "Delete a note. Only use this if you know the exact Note ID from the attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the note to delete"),
          }),
          // @ts-ignore
          execute: async ({ id }: any) => {
            console.log(`[DURIA ACTION] 🤖 Attempting to delete Note ID: ${id}`);
            const res = await deleteNote({ id, softDelete: true });
            if (res.success) {
              console.log(`[DURIA ACTION SUCCESS] ✅ Note deleted!`);
              return `Successfully deleted note.`;
            } else {
              console.log(`[DURIA ACTION FAILED] ❌ Failed to delete note: ${res.error?.message}`);
              return `Failed to delete note: ${res.error?.message}`;
            }
          },
        }),
        createEvent: tool({
          description: "Create a new calendar event. Use this when the user asks to schedule something, add a birthday, anniversary, meeting, or reminder. Always try to infer the correct categoryName from context: use 'Birthdays' for birthdays, 'Anniversaries' for anniversaries, 'Meetings' for meetings, 'Reminders' for reminders, 'Work' for work events, and 'Personal' for everything else.",
          parameters: z.object({
            title: z.string().describe("The title of the event"),
            description: z.string().optional().describe("Description of the event"),
            location: z.string().optional().describe("Location of the event"),
            isAllDay: z.boolean().optional().describe("Whether the event is all day"),
            startDate: z.string().describe("The start date/time in ISO 8601 format based on the user's timezone"),
            endDate: z.string().describe("The end date/time in ISO 8601 format. If not specified, set it 1 hour after startDate."),
            categoryName: z.string().optional().describe("The category for the event. Must be one of: Personal, Work, Birthdays, Anniversaries, Meetings, Reminders"),
          }),
          // @ts-ignore
          execute: async (input: any) => {
            console.log(`[DURIA ACTION] 🤖 Attempting to create Event: "${input.title}" in category: "${input.categoryName}"`);
            
            // Resolve categoryName to a categoryId from the user's categories
            let categoryId: string | undefined;
            if (input.categoryName) {
              const categories = await getOrCreateDefaultCategories();
              const matched = categories.find(
                (c: any) => c.name.toLowerCase() === input.categoryName.toLowerCase()
              );
              if (matched) categoryId = matched.id;
            }

            const res = await createEvent({
              title: input.title,
              description: input.description,
              location: input.location,
              isAllDay: input.isAllDay,
              startDate: new Date(input.startDate),
              endDate: new Date(input.endDate),
              categoryId,
            });
            if (res.success) {
              console.log(`[DURIA ACTION SUCCESS] ✅ Event created! Category resolved: ${categoryId || 'none'}`);
              return `Successfully created event: "${input.title}"${categoryId ? ` in the ${input.categoryName} category` : ''}.`;
            } else {
              console.log(`[DURIA ACTION FAILED] ❌ Failed to create event: ${res.error}`);
              return `Failed to create event: ${res.error}`;
            }
          },
        }),
        updateEvent: tool({
          description: "Update an existing calendar event (e.g. reschedule it). Only use this if you know the exact Event ID from the attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the event to update"),
            startDate: z.string().optional().describe("The new start date/time in ISO 8601 format"),
            endDate: z.string().optional().describe("The new end date/time in ISO 8601 format"),
          }),
          // @ts-ignore
          execute: async ({ id, startDate, endDate }: any) => {
            console.log(`[DURIA ACTION] 🤖 Attempting to update Event ID: ${id}`);
            const updateData: any = {};
            if (startDate) updateData.startDate = new Date(startDate);
            if (endDate) updateData.endDate = new Date(endDate);
            const res = await updateEvent(id, updateData);
            if (res.success) {
              console.log(`[DURIA ACTION SUCCESS] ✅ Event updated!`);
              return `Successfully updated event.`;
            } else {
              console.log(`[DURIA ACTION FAILED] ❌ Failed to update event: ${res.error}`);
              return `Failed to update event: ${res.error}`;
            }
          },
        })
      }
    });

    // 7. Stream response back to client
    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("DURIA API Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
