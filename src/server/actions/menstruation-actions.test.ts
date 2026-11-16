import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  parseToUserDate: vi.fn(),
  logError: vi.fn(),
  prisma: {
    menstrualProfile: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    menstrualCycle: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    menstrualDailyLog: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    menstrualReminder: { findMany: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUser: mocks.getUser }));
vi.mock("@/lib/server/date-utils", () => ({ parseToUserDate: mocks.parseToUserDate }));
vi.mock("@/lib/utils/logger", () => ({ error: mocks.logError }));

import { endPeriod, startPeriod, upsertDailyLog } from "./menstruation-actions";

const userId = "65e000000000000000000099";
const cycleId = "65e000000000000000000001";
const date = new Date("2026-03-01T00:00:00.000Z");

describe("menstruation server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ id: userId, timezone: "UTC" });
    mocks.parseToUserDate.mockImplementation(async (value: string) => new Date(`${value}T00:00:00.000Z`));
    mocks.prisma.menstrualCycle.findFirst.mockResolvedValue(null);
    mocks.prisma.menstrualProfile.upsert.mockResolvedValue({});
  });

  it("creates a period only for the authenticated user", async () => {
    mocks.prisma.menstrualCycle.create.mockResolvedValue({ id: cycleId, periodStartDate: date });

    const result = await startPeriod({ date: "2026-03-01", isSpotting: false });

    expect(result.success).toBe(true);
    expect(mocks.prisma.menstrualCycle.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId, periodStartDate: date, isSpotting: false }),
    }));
    expect(mocks.prisma.menstrualProfile.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId },
    }));
  });

  it("rejects a new period while one is active", async () => {
    mocks.prisma.menstrualCycle.findFirst.mockResolvedValueOnce({ id: cycleId });

    const result = await startPeriod({ date: "2026-03-01" });

    expect(result.success).toBe(false);
    expect(result.error?.message).toMatch(/already active/i);
    expect(mocks.prisma.menstrualCycle.create).not.toHaveBeenCalled();
  });

  it("rejects ending a period before its start date", async () => {
    mocks.prisma.menstrualCycle.findFirst.mockResolvedValueOnce({ id: cycleId, userId, periodStartDate: new Date("2026-03-05T00:00:00.000Z"), isIrregular: false, notes: null });

    const result = await endPeriod({ id: cycleId, date: "2026-03-01" });

    expect(result.success).toBe(false);
    expect(result.error?.message).toMatch(/before its start/i);
    expect(mocks.prisma.menstrualCycle.update).not.toHaveBeenCalled();
  });

  it("attaches an unlinked daily log to its matching user-owned cycle", async () => {
    mocks.prisma.menstrualCycle.findFirst.mockResolvedValueOnce({ id: cycleId });
    mocks.prisma.menstrualDailyLog.upsert.mockResolvedValue({ id: "65e000000000000000000002", date });

    const result = await upsertDailyLog({ date: "2026-03-01", symptoms: ["Cramps"] });

    expect(result.success).toBe(true);
    expect(mocks.prisma.menstrualCycle.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId }) }));
    expect(mocks.prisma.menstrualDailyLog.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ userId, cycleId, symptoms: ["Cramps"] }),
    }));
  });

  it("rejects a daily log that references another user’s cycle", async () => {
    mocks.prisma.menstrualCycle.findFirst.mockResolvedValueOnce(null);

    const result = await upsertDailyLog({ date: "2026-03-01", cycleId, symptoms: [] });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("Period not found");
    expect(mocks.prisma.menstrualDailyLog.upsert).not.toHaveBeenCalled();
  });
});
