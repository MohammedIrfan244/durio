import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  revalidatePath: vi.fn(),
  logError: vi.fn(),
  prisma: {
    routineBlock: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    blockLog: { deleteMany: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    note: { findMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUserId: mocks.getUserId }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/utils/logger", () => ({ error: mocks.logError }));

import {
  createFocusBlock,
  deleteFocusBlock,
  getFocusBlockById,
  updateFocusBlock,
} from "./focus-actions";

const userId = "65e000000000000000000099";
const blockId = "65e000000000000000000001";

describe("focus server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue(userId);
  });

  it("creates a block for the authenticated user with safe defaults", async () => {
    const created = { id: blockId, userId, title: "Deep work" };
    mocks.prisma.routineBlock.create.mockResolvedValue(created);

    const result = await createFocusBlock({ title: "Deep work", startTime: "09:00", endTime: "10:00" });

    expect(result).toEqual({ success: true, data: created });

    expect(mocks.prisma.routineBlock.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId, title: "Deep work", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], energyLevel: "MEDIUM" }),
    }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/focus");
  });

  it("does not update another user's focus block", async () => {
    mocks.prisma.routineBlock.findUnique.mockResolvedValue({ id: blockId, userId: "another-user" });

    const result = await updateFocusBlock({ id: blockId, title: "Changed" });

    expect(result).toMatchObject({ success: false, error: { message: "Not found or unauthorized" } });
    expect(mocks.prisma.routineBlock.update).not.toHaveBeenCalled();
  });

  it("deletes logs before an owned focus block", async () => {
    mocks.prisma.routineBlock.findUnique.mockResolvedValue({ id: blockId, userId });
    mocks.prisma.blockLog.deleteMany.mockResolvedValue({ count: 2 });
    mocks.prisma.routineBlock.delete.mockResolvedValue({ id: blockId });

    await expect(deleteFocusBlock({ id: blockId })).resolves.toEqual({ success: true, data: undefined });

    expect(mocks.prisma.blockLog.deleteMany).toHaveBeenCalledWith({ where: { routineBlockId: blockId } });
    expect(mocks.prisma.routineBlock.delete).toHaveBeenCalledWith({ where: { id: blockId } });
  });

  it("does not expose a focus block owned by another user", async () => {
    mocks.prisma.routineBlock.findUnique.mockResolvedValue({ id: blockId, userId: "another-user" });

    const result = await getFocusBlockById({ id: blockId });

    expect(result).toMatchObject({ success: false, error: { message: "Not found or unauthorized" } });
  });
});
