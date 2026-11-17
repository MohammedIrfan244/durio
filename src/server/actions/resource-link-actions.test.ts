import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: {
    resourceLink: { findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
    todo: { findFirst: vi.fn(), findMany: vi.fn() },
    note: { findFirst: vi.fn(), findMany: vi.fn() },
    event: { findFirst: vi.fn(), findMany: vi.fn() },
    menstrualCycle: { findFirst: vi.fn() },
    menstrualDailyLog: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUser: mocks.getUser }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { getLinkedResources, linkResources, searchLinkableResources, unlinkResources } from "./resource-link-actions";

const user = { id: "65e000000000000000000099" };
const todoId = "65e000000000000000000001";
const noteId = "65e000000000000000000002";
const linkId = "65e000000000000000000003";

describe("resource link server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getUser.mockResolvedValue(user);
  });

  it("creates a user-scoped link when neither direction already exists", async () => {
    const link = { id: linkId, userId: user.id };
    mocks.prisma.resourceLink.findFirst.mockResolvedValue(null);
    mocks.prisma.resourceLink.create.mockResolvedValue(link);

    const result = await linkResources({ fromId: todoId, fromType: "TODO", toId: noteId, toType: "NOTE" });

    expect(result).toEqual({ success: true, link });
    expect(mocks.prisma.resourceLink.create).toHaveBeenCalledWith({
      data: { userId: user.id, fromId: todoId, fromType: "TODO", toId: noteId, toType: "NOTE" },
    });
  });

  it("prevents duplicate links in either direction", async () => {
    mocks.prisma.resourceLink.findFirst.mockResolvedValue({ id: linkId });

    await expect(linkResources({ fromId: todoId, fromType: "TODO", toId: noteId, toType: "NOTE" })).resolves.toEqual({
      success: false,
      error: "These resources are already linked",
    });
    expect(mocks.prisma.resourceLink.create).not.toHaveBeenCalled();
  });

  it("only resolves linked records that belong to the current user", async () => {
    mocks.prisma.resourceLink.findMany.mockResolvedValue([{ id: linkId, fromId: todoId, fromType: "TODO", toId: noteId, toType: "NOTE", createdAt: new Date("2026-10-01") }]);
    mocks.prisma.note.findFirst.mockResolvedValue(null);

    await expect(getLinkedResources(todoId, "TODO")).resolves.toEqual([]);
    expect(mocks.prisma.note.findFirst).toHaveBeenCalledWith({ where: { id: noteId, userId: user.id } });
  });

  it("uses user-scoped queries when searching linkable notes", async () => {
    mocks.prisma.note.findMany.mockResolvedValue([{ id: noteId, heading: "Planning", description: "Private detail" }]);

    await expect(searchLinkableResources("plan", "NOTE")).resolves.toEqual([{ id: noteId, title: "Planning", subtitle: "Private detail" }]);
    expect(mocks.prisma.note.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: user.id }),
    }));
  });

  it("deletes a link using both its id and the current user's id", async () => {
    mocks.prisma.resourceLink.delete.mockResolvedValue({ id: linkId });

    await expect(unlinkResources(linkId)).resolves.toEqual({ success: true });
    expect(mocks.prisma.resourceLink.delete).toHaveBeenCalledWith({ where: { id: linkId, userId: user.id } });
  });
});
