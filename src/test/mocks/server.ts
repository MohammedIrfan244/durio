import { vi } from "vitest";

/** Reusable starting point for server-action tests. Extend only the methods a test uses. */
export const prismaMock = {
  todo: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  note: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  event: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  menstrualCycle: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  menstrualDailyLog: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
  $transaction: vi.fn(),
};

export const authenticatedUser = { id: "65e000000000000000000099", timezone: "Asia/Kolkata" };
