import { NextRequest } from "next/server";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { promises as fs } from "fs";
import path from "path";
import { getUserId } from "@/lib/server/get-user";
import { z } from "zod";
import { createTodo, changeTodoStatus } from "@/server/actions/to-do-action";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await getUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Parse request body
    const { messages, contextPayload } = await req.json();

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
      model: google("gemini-1.5-flash-latest"),
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
        })
      }
    });

    // 7. Stream response back to client
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("DURIA API Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
