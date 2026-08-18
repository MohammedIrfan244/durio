import type { JSONValue, ModelMessage, ToolChoice, ToolSet } from "ai";

export type DuriaProposalStatus = "pending" | "confirmed" | "cancelled" | "error";
export type DuriaProposalValue = string | number | boolean | string[] | number[] | null | undefined;
export type DuriaProposalPayload = Record<string, DuriaProposalValue>;

export interface DuriaTextPart {
  type: "text";
  text: string;
}

export interface DuriaToolPart {
  type: `tool-${string}`;
  toolCallId?: string;
  toolName?: string;
  input?: DuriaProposalPayload;
  output?: JSONValue;
  state?: string;
}

export interface DuriaToolInvocation {
  toolCallId?: string;
  toolName?: string;
  args?: DuriaProposalPayload;
  input?: DuriaProposalPayload;
  result?: JSONValue;
  output?: JSONValue;
  state?: string;
}

export interface DuriaMessage {
  role: "system" | "user" | "assistant";
  content?: string;
  parts?: Array<DuriaTextPart | DuriaToolPart>;
  toolInvocations?: DuriaToolInvocation[];
}

export interface DuriaToolCall {
  toolCallId: string;
  toolName: string;
  input: DuriaProposalPayload;
  output?: JSONValue;
  state?: string;
}

export interface DuriaChatRequestBody {
  messages?: DuriaMessage[];
  contextPayload?: {
    todos?: unknown[];
    notes?: unknown[];
    events?: unknown[];
    focusBlocks?: unknown[];
    docs?: { title: string; content: string }[];
  };
}

export type DuriaModelMessage = ModelMessage;
export type DuriaToolChoice<TOOLS extends ToolSet> = ToolChoice<TOOLS>;
