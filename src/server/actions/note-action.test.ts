import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  logError: vi.fn(),
  prisma: {
    note: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
    noteFolder: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
    resourceLink: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/utils/logger", () => ({ error: mocks.logError }));

import { createNote, deleteNote, moveNote, updateNote } from "./note-action";

const userId = "65e000000000000000000099";
const noteId = "65e000000000000000000001";
const folderId = "65e000000000000000000002";

describe("note server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue(userId);
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
  });

  it("creates a note under the authenticated user and preserves its resource links", async () => {
    const note = { id: noteId, userId, heading: "Ideas" };
    mocks.prisma.note.create.mockResolvedValue(note);
    mocks.prisma.resourceLink.create.mockResolvedValue({ id: "link-1" });

    const result = await createNote({
      heading: "Ideas",
      description: "Keep this private.",
      linkedResources: [{ id: folderId, type: "PROJECT" }],
    });

    expect(result).toEqual({ success: true, data: note });
    expect(mocks.prisma.note.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId, status: "ACTIVE" }) }));
    expect(mocks.prisma.resourceLink.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId, fromId: noteId, fromType: "NOTE", toId: folderId, toType: "PROJECT" }),
    }));
  });

  it("does not update a note that the current user does not own", async () => {
    mocks.prisma.note.findFirst.mockResolvedValue(null);

    const result = await updateNote({ id: noteId, heading: "Changed" });

    expect(result).toMatchObject({ success: false, error: { message: "Note not found" } });
    expect(mocks.prisma.note.update).not.toHaveBeenCalled();
  });

  it("requires ownership of both the note and destination folder when moving", async () => {
    mocks.prisma.note.findFirst.mockResolvedValueOnce({ id: noteId, userId });
    mocks.prisma.noteFolder.findFirst.mockResolvedValue(null);

    const result = await moveNote({ noteId, folderId });

    expect(result).toMatchObject({ success: false, error: { message: "Folder not found" } });
    expect(mocks.prisma.note.update).not.toHaveBeenCalled();
  });

  it("archives an owned note instead of deleting it when soft deletion is requested", async () => {
    mocks.prisma.note.findFirst.mockResolvedValue({ id: noteId, userId });
    mocks.prisma.note.update.mockResolvedValue({ id: noteId, status: "ARCHIVED" });

    const result = await deleteNote({ id: noteId, softDelete: true });

    expect(result).toEqual({ success: true, data: undefined });
    expect(mocks.prisma.note.update).toHaveBeenCalledWith({ where: { id: noteId }, data: { status: "ARCHIVED" } });
    expect(mocks.prisma.note.delete).not.toHaveBeenCalled();
  });
});
