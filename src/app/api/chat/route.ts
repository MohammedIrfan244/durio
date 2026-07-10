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

function getTextFromMessage(msg: any) {
  return msg.content ||
    (msg.parts?.find((part: any) => part.type === 'text')?.text) ||
    "";
}

function getToolCallsFromMessage(msg: any) {
  const legacyToolCalls = (msg.toolInvocations || []).map((toolInvocation: any) => ({
    toolCallId: toolInvocation.toolCallId,
    toolName: toolInvocation.toolName,
    input: toolInvocation.input ?? toolInvocation.args ?? {},
    output: toolInvocation.output ?? toolInvocation.result,
    state: toolInvocation.state,
  }));

  const partToolCalls = (msg.parts || [])
    .filter((part: any) => typeof part.type === 'string' && part.type.startsWith('tool-'))
    .map((part: any) => ({
      toolCallId: part.toolCallId,
      toolName: part.toolName || part.type.replace(/^tool-/, ''),
      input: part.input ?? {},
      output: part.output,
      state: part.state,
    }));

  return [...legacyToolCalls, ...partToolCalls].filter((toolCall: any) => toolCall.toolCallId && toolCall.toolName);
}

function inferManageToolChoice(messages: any[]) {
  const latestRawMessage = [...(messages || [])].reverse().find((msg: any) => getTextFromMessage(msg).trim());
  if (getTextFromMessage(latestRawMessage || {}).trim().startsWith("[SYSTEM]")) {
    return undefined;
  }

  const conversationMessages = (messages || []).filter((msg: any) => {
    const text = getTextFromMessage(msg).trim();
    return !text.startsWith("[SYSTEM]");
  });
  const latestUserText = getTextFromMessage(
    [...conversationMessages].reverse().find((msg: any) => msg.role === 'user') || {}
  );
  const recentText = conversationMessages
    .slice(-6)
    .map((msg: any) => getTextFromMessage(msg))
    .join("\n")
    .toLowerCase();
  const latest = String(latestUserText || '').toLowerCase();
  const textToClassify = `${recentText}\n${latest}`;

  const mentionsTask = /\b(todo|task|to-do|grocery|groceries)\b/.test(textToClassify);
  const mentionsNote = /\b(note|notes)\b/.test(textToClassify);
  const mentionsEvent = /\b(event|calendar|schedule|meeting|appointment|birthday|anniversary)\b/.test(textToClassify);

  const wantsDelete = /\b(delete|remove|discard)\b/.test(latest);
  const wantsUpdate = /\b(update|edit|change|set|mark|rename|reschedule|move|completed|complete|done|cancelled|canceled|pending|plan)\b/.test(latest);

  if (wantsDelete) {
    if (mentionsNote) return { type: 'tool' as const, toolName: 'proposeDeleteNote' };
    if (mentionsEvent) return { type: 'tool' as const, toolName: 'proposeDeleteEvent' };
    if (mentionsTask) return { type: 'tool' as const, toolName: 'proposeDeleteTask' };
  }

  if (wantsUpdate) {
    if (mentionsNote) return { type: 'tool' as const, toolName: 'proposeUpdateNote' };
    if (mentionsEvent) return { type: 'tool' as const, toolName: 'proposeUpdateEvent' };
    if (mentionsTask) return { type: 'tool' as const, toolName: 'proposeUpdateTask' };
  }

  return undefined;
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
- For edit or delete requests, do NOT ask the user for IDs. Propose the intended update/delete with the information you can infer. The application will show a separate selector so the user can choose the exact task, note, or event, and the application will perform the database operation.
- If the user asks to edit/update but omits a new value, still call the appropriate update propose tool with partial or empty fields so the app can show the selector and editable preview.
- If the user says a task is complete/completed/done, set task status to DONE.
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
        coreMessages.push({ role: 'user', content: getTextFromMessage(msg) });
      } else if (msg.role === 'assistant') {
        const content = getTextFromMessage(msg);
        const toolCalls = getToolCallsFromMessage(msg);

        if (toolCalls.length > 0) {
          const proposalSummary = toolCalls
            .map((toolCall: any) => `[DURIA proposed ${toolCall.toolName}: ${JSON.stringify(toolCall.input)}]`)
            .join("\n");

          coreMessages.push({
            role: 'assistant',
            content: [content, proposalSummary].filter(Boolean).join("\n"),
          });
        } else if (content) {
          coreMessages.push({ role: 'assistant', content });
        }
      } else if (msg.role === 'tool') {
        const toolCalls = getToolCallsFromMessage(msg);
        coreMessages.push({
          role: 'tool',
          content: toolCalls.map((toolCall: any) => ({
            type: 'tool-result',
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            output: toolCall.output,
          })),
        });
      } else {
        coreMessages.push({ role: msg.role, content: msg.content });
      }
    });

    await logToDebugFile("MAPPED CORE MESSAGES (To Gemini)", coreMessages);
    const toolChoice = inferManageToolChoice(messages);
    await logToDebugFile("INFERRED TOOL CHOICE", toolChoice || "auto");

    // 6. Call Gemini
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages,
      temperature: 0.7,
      toolChoice: toolChoice as any,
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
          inputSchema: z.object({
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
          description: "Propose updates to an existing task (e.g., mark as DONE, change priority). Do not ask for or require an ID; the app will let the user select the exact task.",
          inputSchema: z.object({
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
          description: "Propose deleting a task. Do not ask for or require an ID; the app will let the user select the exact task.",
          inputSchema: z.object({
            reason: z.string().optional().describe("Optional reason or context for the deletion."),
          }),
        } as any),
        // @ts-ignore
        proposeCreateNote: tool({
          description: "Propose a new note for the user. Use whenever the user asks to save or write a note.",
          inputSchema: z.object({
            heading: z.string().describe("The title or heading of the note"),
            description: z.string().describe("The body content of the note"),
            color: z.string().optional().describe("Optional hex color string for the note card"),
          }),
        } as any),
        // @ts-ignore
        proposeUpdateNote: tool({
          description: "Propose updates to an existing note. Do not ask for or require an ID; the app will let the user select the exact note.",
          inputSchema: z.object({
            heading: z.string().optional().describe("The new heading of the note"),
            description: z.string().optional().describe("The new body content"),
            color: z.string().optional().describe("New optional hex color string"),
          }),
        } as any),
        // @ts-ignore
        proposeDeleteNote: tool({
          description: "Propose deleting a note. Do not ask for or require an ID; the app will let the user select the exact note.",
          inputSchema: z.object({
            reason: z.string().optional().describe("Optional reason or context for the deletion."),
          }),
        } as any),
        // @ts-ignore
        proposeCreateEvent: tool({
          description: "Propose a new calendar event. Always try to infer the correct categoryName from context: use 'Birthdays', 'Anniversaries', 'Meetings', 'Reminders', 'Work', or 'Personal'.",
          inputSchema: z.object({
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
          description: "Propose updates to an existing calendar event (e.g., reschedule). Do not ask for or require an ID; the app will let the user select the exact event.",
          inputSchema: z.object({
            title: z.string().optional().describe("The new title of the event"),
            description: z.string().optional().describe("Description of the event"),
            location: z.string().optional().describe("Location of the event"),
            isAllDay: z.boolean().optional().describe("Whether the event is all day"),
            startDate: z.string().optional().describe("The new start date/time in ISO 8601 format"),
            endDate: z.string().optional().describe("The new end date/time in ISO 8601 format"),
            categoryName: z.string().optional().describe("The category for the event"),
          }),
        } as any),
        // @ts-ignore
        proposeDeleteEvent: tool({
          description: "Propose deleting a calendar event. Do not ask for or require an ID; the app will let the user select the exact event.",
          inputSchema: z.object({
            reason: z.string().optional().describe("Optional reason or context for the deletion."),
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
