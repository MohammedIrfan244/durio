import { describe, expect, it } from "vitest";
import { eventCreateSchema } from "./calendar";
import { menstrualReminderSchema, startPeriodSchema } from "./menstruation";
import { CreateNoteSchema } from "./note";
import { createTodoSchema, todoFilterSchema } from "./todo";

describe("project input schemas", () => {
  it("accepts a minimal todo and rejects an empty title", () => {
    expect(createTodoSchema.safeParse({ title: "Buy tea" }).success).toBe(true);
    expect(createTodoSchema.safeParse({ title: "  " }).success).toBe(false);
  });

  it("enforces todo filtering limits", () => {
    expect(todoFilterSchema.safeParse({ limit: 100, page: 1 }).success).toBe(true);
    expect(todoFilterSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("requires meaningful note content", () => {
    expect(CreateNoteSchema.safeParse({ heading: "Thought", description: "Keep this." }).success).toBe(true);
    expect(CreateNoteSchema.safeParse({ heading: "Thought", description: " " }).success).toBe(false);
  });

  it("converts calendar dates to Date instances", () => {
    const result = eventCreateSchema.parse({ title: "Appointment", startDate: "2026-03-01T09:00:00Z", endDate: "2026-03-01T10:00:00Z" });
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("requires date-only menstrual inputs and valid reminder types", () => {
    expect(startPeriodSchema.safeParse({ date: "2026-03-01" }).success).toBe(true);
    expect(startPeriodSchema.safeParse({ date: "03/01/2026" }).success).toBe(false);
    expect(menstrualReminderSchema.safeParse({ type: "DAILY_LOG", enabled: true, time: "09:30" }).success).toBe(true);
    expect(menstrualReminderSchema.safeParse({ type: "UNKNOWN", enabled: true }).success).toBe(false);
  });
});
