import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getUserId: vi.fn(),
  logError: vi.fn(),
  prisma: {
    todo: { findMany: vi.fn() },
    note: { findMany: vi.fn() },
    event: { findMany: vi.fn() },
    routineBlock: { findMany: vi.fn() },
    menstrualProfile: { findUnique: vi.fn() },
    menstrualCycle: { findMany: vi.fn() },
    menstrualDailyLog: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUser: mocks.getUser, getUserId: mocks.getUserId }));
vi.mock("@/lib/utils/logger", () => ({ error: mocks.logError }));

import { getMenstrualSummaryForAI, getNotesForAI, getTodosForAI } from "./duria-actions";

const user = { id: "65e000000000000000000099", timezone: "Asia/Calcutta" };

describe("Duria context actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue(user);
    mocks.getUserId.mockResolvedValue(user.id);
  });

  it("scopes todo context to the current user and excludes archived items by default", async () => {
    mocks.prisma.todo.findMany.mockResolvedValue([]);

    await expect(getTodosForAI()).resolves.toEqual({ success: true, data: [] });
    expect(mocks.prisma.todo.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: user.id, status: { not: "ARCHIVED" } },
      take: 20,
    }));
  });

  it("uses a user-scoped folder filter when notes are explicitly requested", async () => {
    const folderId = "65e000000000000000000001";
    mocks.prisma.note.findMany.mockResolvedValue([]);

    await expect(getNotesForAI({ folderId, limit: 10 })).resolves.toEqual({ success: true, data: [] });
    expect(mocks.prisma.note.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: user.id, status: { not: "ARCHIVED" }, folderId },
      take: 10,
    }));
  });

  it("refuses menstrual context unless the user has explicitly enabled Duria access", async () => {
    mocks.prisma.menstrualProfile.findUnique.mockResolvedValue({ duriaAccessEnabled: false });

    const result = await getMenstrualSummaryForAI({ kind: "SUMMARY" });

    expect(result).toMatchObject({ success: false, error: { message: expect.stringMatching(/disabled/i) } });
    expect(mocks.prisma.menstrualCycle.findMany).not.toHaveBeenCalled();
  });

  it("only includes recent daily logs when that attachment type is chosen", async () => {
    const logDate = new Date("2026-10-02T00:00:00.000Z");
    mocks.prisma.menstrualProfile.findUnique.mockResolvedValue({ duriaAccessEnabled: true, averageCycleLength: 28, fertileWindowEnabled: false });
    mocks.prisma.menstrualCycle.findMany.mockResolvedValue([]);
    mocks.prisma.menstrualDailyLog.findMany.mockResolvedValue([{ date: logDate, symptoms: ["Cramps"], mood: "LOW", energyLevel: "LOW" }]);

    const result = await getMenstrualSummaryForAI({ kind: "RECENT_LOGS" });

    expect(result).toMatchObject({ success: true, data: { attachmentType: "RECENT_LOGS", recentSymptoms: ["Cramps"], recentDailyLogs: [{ date: logDate, symptoms: ["Cramps"] }] } });
  });
});
