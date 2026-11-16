import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  getUserTimezone: vi.fn(),
  parseToUserDate: vi.fn(),
  validateDateNotBeforeToday: vi.fn(),
  logError: vi.fn(),
  auditLogger: { log: vi.fn(), info: vi.fn(), error: vi.fn() },
  prisma: {
    todo: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    checklistItem: { deleteMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    resourceLink: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/server/date-utils", () => ({
  getUserTimezone: mocks.getUserTimezone,
  getUserDateRanges: vi.fn(),
  parseToUserDate: mocks.parseToUserDate,
  validateDateNotBeforeToday: mocks.validateDateNotBeforeToday,
}));
vi.mock("@/lib/server/logger", () => ({ auditLogger: mocks.auditLogger }));
vi.mock("@/lib/utils/logger", () => ({ error: mocks.logError }));

import { createTodo, getTodoById, getTodoList } from "./to-do-action";

const userId = "65e000000000000000000099";
const todoId = "65e000000000000000000001";
const linkId = "65e000000000000000000002";
const dueDate = new Date("2026-10-05T00:00:00.000Z");

describe("todo server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue(userId);
    mocks.getUserTimezone.mockResolvedValue("Asia/Calcutta");
    mocks.parseToUserDate.mockResolvedValue(dueDate);
    mocks.validateDateNotBeforeToday.mockReturnValue(undefined);
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
  });

  it("creates a todo, checklist, and linked resources under the current user", async () => {
    const todo = { id: todoId, userId, title: "Plan release", checklist: [] };
    mocks.prisma.todo.create.mockResolvedValue(todo);
    mocks.prisma.resourceLink.create.mockResolvedValue({ id: "resource-link" });

    const result = await createTodo({
      title: "Plan release",
      priority: "HIGH",
      dueDate: "2026-10-05",
      checklist: [{ text: "Draft notes" }],
      linkedResources: [{ id: linkId, type: "NOTE" }],
    });

    expect(result).toEqual({ success: true, data: todo });
    expect(mocks.prisma.todo.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId, priority: "HIGH", priorityInt: 3, dueDate, checklist: { create: [{ text: "Draft notes" }] } }),
    }));
    expect(mocks.prisma.resourceLink.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId, fromId: todoId, fromType: "TODO", toId: linkId, toType: "NOTE" }),
    }));
  });

  it("does not disclose a todo that is not owned by the current user", async () => {
    mocks.prisma.todo.findFirst.mockResolvedValue(null);

    const result = await getTodoById({ id: todoId });

    expect(result).toMatchObject({ success: false, error: { message: "Todo not found", code: "TODO_NOT_FOUND" } });
  });

  it("groups only the current user's todos by their visible workflow state", async () => {
    mocks.prisma.todo.findMany.mockResolvedValue([
      { id: "plan", status: "PLAN" },
      { id: "pending", status: "OVERDUE" },
      { id: "done", status: "DONE" },
    ]);

    const result = await getTodoList({});

    expect(result).toEqual({ success: true, data: { plan: [{ id: "plan", status: "PLAN" }], pending: [{ id: "pending", status: "OVERDUE" }], done: [{ id: "done", status: "DONE" }] } });
    expect(mocks.prisma.todo.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ AND: [{ userId }] }),
    }));
  });
});
