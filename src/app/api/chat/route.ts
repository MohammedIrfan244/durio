import { NextRequest } from "next/server";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { promises as fs } from "fs";
import path from "path";
import { getUserId } from "@/lib/server/get-user";
import { z } from "zod";
import { getUserTimezone } from "@/lib/server/date-utils";

import { checkAndIncrementAIUsage } from "@/server/actions/ai-usage";

async function logToDebugFile(tag: string, data: any) {
  try {
    const logPath = path.join(process.cwd(), "duria-debug.log");
    const timestamp = new Date().toISOString();
    const logEntry = `\n--- [${timestamp}] ${tag} ---\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`;
    await fs.appendFile(logPath, logEntry, "utf-8");
  } catch (e) {
    console.error("Failed to write to duria-debug.log", e);
  }
}

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
    await logToDebugFile("RAW REQUEST BODY", body);
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

MANAGE MODE RULES:
- When the user asks to create, edit, or delete a task, note, or event, use the appropriate propose tool.
- Your propose tool ONLY returns the structured data. You do NOT confirm the action yourself.
- After you propose, the user will see an editable preview. They will click Confirm or Cancel.
- You will then receive a [SYSTEM] message telling you the result. React to it naturally.
- NEVER tell the user the action was completed before you receive the [SYSTEM] result message.

BOUNDARY RULES:
- You are an assistant specifically for managing the user's tasks, notes, and calendar within this application.
- Firmly but politely dodge ANY requests that are not relevant to this project (e.g., political questions, geographical facts, coding questions outside of this app, general knowledge trivia).
- Reply with a variation of: "I'm DURIA, your productivity assistant. I can only help you manage your tasks, notes, and calendar. I cannot answer questions about [Topic]."

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

    await logToDebugFile("MAPPED CORE MESSAGES (To Gemini)", coreMessages);

    // 6. Call Gemini
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages,
      temperature: 0.7,
      onFinish: async (event) => {
        await logToDebugFile("GEMINI RESPONSE (onFinish)", {
          text: event.text,
          toolCalls: event.toolCalls,
          usage: event.usage,
          finishReason: event.finishReason,
        });
      },
      tools: {
        // @ts-ignore
        proposeCreateTask: tool({
          description: "Propose a new task for the user's to-do list. You have full capability to set the title, description, priority, dueDate, and dueTime if mentioned.",
          parameters: z.object({
            title: z.string().describe("The title of the task"),
            description: z.string().optional().describe("A brief description of the task."),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().describe("The priority of the task"),
            dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
            dueTime: z.string().optional().describe("Due time in HH:mm format"),
            tags: z.array(z.string()).optional().describe("Array of tags for the task"),
          }),
        } as any),
        // @ts-ignore
        proposeUpdateTask: tool({
          description: "Propose updates to an existing task (e.g., mark as DONE, change priority). Requires exact Task ID from attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the task"),
            title: z.string().optional().describe("The new title of the task"),
            description: z.string().optional().describe("The new description of the task"),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().describe("The new priority"),
            dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
            dueTime: z.string().optional().describe("Due time in HH:mm format"),
            tags: z.array(z.string()).optional().describe("Array of tags"),
            status: z.enum(["PLAN", "PENDING", "DONE", "CANCELLED"]).optional().describe("The new status for the task"),
          }),
        } as any),
        // @ts-ignore
        proposeDeleteTask: tool({
          description: "Propose deleting a task. Requires exact Task ID from attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the task to delete"),
          }),
        } as any),
        // @ts-ignore
        proposeCreateNote: tool({
          description: "Propose a new note for the user. Use whenever the user asks to save or write a note.",
          parameters: z.object({
            heading: z.string().describe("The title or heading of the note"),
            description: z.string().describe("The body content of the note"),
            color: z.string().optional().describe("Optional hex color string for the note card"),
          }),
        } as any),
        // @ts-ignore
        proposeUpdateNote: tool({
          description: "Propose updates to an existing note. Requires exact Note ID from attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the note to update"),
            heading: z.string().optional().describe("The new heading of the note"),
            description: z.string().optional().describe("The new body content"),
            color: z.string().optional().describe("New optional hex color string"),
          }),
        } as any),
        // @ts-ignore
        proposeDeleteNote: tool({
          description: "Propose deleting a note. Requires exact Note ID from attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the note to delete"),
          }),
        } as any),
        // @ts-ignore
        proposeCreateEvent: tool({
          description: "Propose a new calendar event. Always try to infer the correct categoryName from context: use 'Birthdays', 'Anniversaries', 'Meetings', 'Reminders', 'Work', or 'Personal'.",
          parameters: z.object({
            title: z.string().describe("The title of the event"),
            description: z.string().optional().describe("Description of the event"),
            location: z.string().optional().describe("Location of the event"),
            isAllDay: z.boolean().optional().describe("Whether the event is all day"),
            startDate: z.string().describe("The start date/time in ISO 8601 format based on the user's timezone"),
            endDate: z.string().describe("The end date/time in ISO 8601 format. If not specified, set it 1 hour after startDate."),
            categoryName: z.string().optional().describe("The category for the event. Must be one of: Personal, Work, Birthdays, Anniversaries, Meetings, Reminders"),
          }),
        } as any),
        // @ts-ignore
        proposeUpdateEvent: tool({
          description: "Propose updates to an existing calendar event (e.g., reschedule). Requires exact Event ID from attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the event to update"),
            title: z.string().optional().describe("The new title of the event"),
            description: z.string().optional().describe("Description of the event"),
            startDate: z.string().optional().describe("The new start date/time in ISO 8601 format"),
            endDate: z.string().optional().describe("The new end date/time in ISO 8601 format"),
            categoryName: z.string().optional().describe("The category for the event"),
          }),
        } as any),
        // @ts-ignore
        proposeDeleteEvent: tool({
          description: "Propose deleting a calendar event. Requires exact Event ID from attached context.",
          parameters: z.object({
            id: z.string().describe("The unique ID of the event to delete"),
          }),
        } as any)
      }
    });

    // 7. Stream response back to client
    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("DURIA API Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
