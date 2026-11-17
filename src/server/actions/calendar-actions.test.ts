import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getUserTimezone: vi.fn(),
  validateDateNotBeforeToday: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: {
    eventCategory: { findMany: vi.fn(), createMany: vi.fn(), findUnique: vi.fn() },
    event: { update: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    todo: { update: vi.fn(), findMany: vi.fn() },
    routineBlock: { findMany: vi.fn() },
    menstrualProfile: { findUnique: vi.fn() },
    menstrualCycle: { findMany: vi.fn() },
    notification: { create: vi.fn() },
    resourceLink: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUser: mocks.getUser }));
vi.mock("@/lib/server/date-utils", () => ({ getUserTimezone: mocks.getUserTimezone, validateDateNotBeforeToday: mocks.validateDateNotBeforeToday }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { getOrCreateDefaultCategories, rescheduleCalendarItem } from "./calendar-actions";

const user = { id: "65e000000000000000000099", timezone: "Asia/Calcutta" };
const itemId = "65e000000000000000000001";

describe("calendar server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getUser.mockResolvedValue(user);
    mocks.getUserTimezone.mockResolvedValue(user.timezone);
  });

  it("seeds exactly the default categories for a first-time user", async () => {
    const categories = [{ id: "personal", userId: user.id, name: "Personal" }];
    mocks.prisma.eventCategory.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce(categories);
    mocks.prisma.eventCategory.createMany.mockResolvedValue({ count: 6 });

    await expect(getOrCreateDefaultCategories()).resolves.toEqual(categories);

    expect(mocks.prisma.eventCategory.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([expect.objectContaining({ userId: user.id, name: "Personal", isSystem: true })]),
    }));
  });

  it("does not seed categories again once the user has categories", async () => {
    const categories = [{ id: "work", userId: user.id, name: "Work" }];
    mocks.prisma.eventCategory.findMany.mockResolvedValue(categories);

    await expect(getOrCreateDefaultCategories()).resolves.toEqual(categories);
    expect(mocks.prisma.eventCategory.createMany).not.toHaveBeenCalled();
  });

  it("reschedules only the authenticated user's todo and updates its time", async () => {
    const start = new Date("2026-10-04T09:30:00.000Z");
    const end = new Date("2026-10-04T10:30:00.000Z");
    mocks.prisma.todo.update.mockResolvedValue({ id: itemId });

    await expect(rescheduleCalendarItem(itemId, "todo", start, end)).resolves.toEqual({ success: true });

    expect(mocks.prisma.todo.update).toHaveBeenCalledWith({
      where: { id: itemId, userId: user.id },
      data: { dueDate: start, dueTime: "15:00" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/todo");
  });

  it("returns a safe failure for an invalid reschedule request", async () => {
    await expect(rescheduleCalendarItem("not-an-id", "event", new Date(), new Date())).resolves.toEqual({
      success: false,
      error: "Failed to reschedule item",
    });
    expect(mocks.prisma.event.update).not.toHaveBeenCalled();
  });
});
