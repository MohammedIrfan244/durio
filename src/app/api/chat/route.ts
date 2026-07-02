import { NextRequest } from "next/server";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { promises as fs } from "fs";
import path from "path";
import { getUserId } from "@/lib/server/get-user";
import { z } from "zod";
import { createTodo, changeTodoStatus } from "@/server/actions/to-do-action";
import { createNote, deleteNote } from "@/server/actions/note-action";
import { createEvent, updateEvent } from "@/server/actions/calendar-actions";

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
    const { messages, contextPayload } = await req.json();
    
    console.log("[DURIA AI CHAT] Incoming Messages:", JSON.stringify(messages, null, 2));

    // 3. Load Tier 1 Context (Primary Guide)
    let primaryGuide = "";
    try {
      const guidePath = path.join(process.cwd(), "feature_guide.md");
      primaryGuide = await fs.readFile(guidePath, "utf-8");
    } catch (e) {
      console.warn("Could not load feature_guide.md for AI context");
    }

    // 4. Build the powerful system prompt
    let systemPrompt = `You are DURIA, an incredibly intelligent, friendly, and helpful AI assistant embedded directly within the Durio application. 
Your goal is to help the user manage their life, tasks, notes, and calendar. 
Be concise, use markdown formatting, and act as a highly capable personal assistant.

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

    // 6. Call Gemini
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      tools: {
        createTask: tool({
          description: "Create a new task on the user's to-do list. Use this when the user explicitly asks to create a task.",
          parameters: z.object({
            title: z.string().describe("The title of the task"),
            description: z.string().optional().describe("A brief description of the task"),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().describe("The priority of the task"),
          }),
          // @ts-ignore - Ignore AI SDK execute type mismatch
          execute: async ({ title, description, priority }: any) => {
            const res = await createTodo({
              title,
              description,
              priority,
              status: "PLAN",
            });
            if (res.success) {
              return `Successfully created task: "${title}".`;
            } else {
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
            const res = await changeTodoStatus({ id, status });
            if (res.success) {
              return `Successfully updated task status to ${status}.`;
            } else {
              return `Failed to update task: ${res.error?.message}`;
            }
          },
        }),
        createNote: tool({
          description: "Create a new note. Use this when the user explicitly asks to save or create a note, for example saving a summary as a note.",
          parameters: z.object({
            heading: z.string().describe("The title or heading of the note"),
            description: z.string().describe("The content of the note (can be markdown)"),
            color: z.string().optional().describe("Optional hex color string"),
          }),
          // @ts-ignore
          execute: async (input: any) => {
            const res = await createNote(input);
            if (res.success) {
              return `Successfully created note: "${input.heading}".`;
            } else {
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
            const res = await deleteNote({ id, softDelete: true });
            if (res.success) {
              return `Successfully deleted note.`;
            } else {
              return `Failed to delete note: ${res.error?.message}`;
            }
          },
        }),
        createEvent: tool({
          description: "Create a new calendar event. Use this when the user asks to schedule something.",
          parameters: z.object({
            title: z.string().describe("The title of the event"),
            description: z.string().optional().describe("Description of the event"),
            location: z.string().optional().describe("Location of the event"),
            isAllDay: z.boolean().optional().describe("Whether the event is all day"),
            startDate: z.string().describe("The start date/time in ISO 8601 format"),
            endDate: z.string().describe("The end date/time in ISO 8601 format"),
          }),
          // @ts-ignore
          execute: async (input: any) => {
            const res = await createEvent({
              ...input,
              startDate: new Date(input.startDate),
              endDate: new Date(input.endDate),
            });
            if (res.success) {
              return `Successfully created event: "${input.title}".`;
            } else {
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
            const updateData: any = {};
            if (startDate) updateData.startDate = new Date(startDate);
            if (endDate) updateData.endDate = new Date(endDate);
            const res = await updateEvent(id, updateData);
            if (res.success) {
              return `Successfully updated event.`;
            } else {
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
