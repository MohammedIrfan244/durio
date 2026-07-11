"use server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CreateNoteSchema, UpdateNoteSchema, DeleteNoteSchema, CreateFolderSchema, UpdateFolderSchema, DeleteFolderSchema, CreateNoteInput } from "@/schema/note";
import { MONGOID } from "@/schema/mongo";
import { INote, INoteFolder, IGetNoteList, IGetArchivedNoteListPayload, IGetNoteListPayload } from "@/types/note";
import { withErrorWrapper } from "@/lib/server/error-wrapper"; 
import { getUserId } from "@/lib/server/get-user"; 

export const createNote = withErrorWrapper<INote, [CreateNoteInput]>(async (input) => {
	const validatedInput = CreateNoteSchema.parse(input);

	const userId = await getUserId();
	const note = await prisma.$transaction(async (tx) => {
		const newNote = await tx.note.create({
			data: {
				userId,
				heading: validatedInput.heading,
				description: validatedInput.description,
				color: validatedInput.color,
				folderId: validatedInput.folderId,
				status: "ACTIVE",
			},
		});

		if (validatedInput.linkedResources && validatedInput.linkedResources.length > 0) {
			await Promise.all(
				validatedInput.linkedResources.map((link) =>
					tx.resourceLink.create({
						data: {
							userId,
							fromId: newNote.id,
							fromType: "NOTE",
							toId: link.id,
							toType: link.type,
						},
					})
				)
			);
		}

		return newNote;
	});
	return note as INote;
});

export const getFolders = withErrorWrapper<INoteFolder[], [{ page?: number; limit?: number } | undefined]>(async (input) => {
	const userId = await getUserId();
    const page = input?.page || 1;
    const limit = Math.min(input?.limit || 20, 100);
    const skip = (page - 1) * limit;

	const folders = await prisma.noteFolder.findMany({
		where: { 
          userId,
          status: "ACTIVE"
        },
		orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
        _count: {
            select: {
            notes: {
                where: { status: "ACTIVE" }
            }
            }
        }
    }
	});
	return folders as unknown as INoteFolder[];
});

export const getFolderById = withErrorWrapper<INoteFolder | null, [string]>(async (id) => {
	const folderId = MONGOID.parse(id);
	const userId = await getUserId();
	const folder = await prisma.noteFolder.findFirst({
		where: { id: folderId, userId },
	});
	return folder as INoteFolder | null;
});

export const getNotes = withErrorWrapper<IGetNoteList[], [{ folderId?: string; page?: number; limit?: number } | undefined]>(async (input) => {
	const userId = await getUserId();
    const folderId = input?.folderId ? MONGOID.parse(input.folderId) : undefined;
    const page = input?.page || 1;
    const limit = Math.min(input?.limit || 20, 100);
    const skip = (page - 1) * limit;

	const whereClause : Prisma.NoteWhereInput = {
		userId,
		status: { not: "ARCHIVED" },
	}

	if (folderId) {
		whereClause.folderId = folderId;
	}else{
		whereClause.OR = [
			{ folderId: null },
			{ folderId: {isSet: false} }
		]
	}

	const notes = await prisma.note.findMany({
		where: whereClause,
		orderBy: { createdAt: "desc" },
        skip,
        take: limit,
	});
	return notes as IGetNoteList[];
});

export const searchNotesAndFolders = withErrorWrapper<{ notes: IGetNoteList[], folders: INoteFolder[] }, [string]>(async (query) => {
	const validatedQuery = z.string().trim().max(100).parse(query);
    const userId = await getUserId();
    
    // Search Notes
    const notes = await prisma.note.findMany({
        where: {
            userId,
            status: { not: "ARCHIVED" },
            OR: [
                { heading: { contains: validatedQuery, mode: "insensitive" } },
                { description: { contains: validatedQuery, mode: "insensitive" } },
            ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    // Search Folders (match name OR if it contains notes matching the query)
    const folders = await prisma.noteFolder.findMany({
        where: {
            userId,
            status: { not: "ARCHIVED" },
            OR: [
                { name: { contains: validatedQuery, mode: "insensitive" } },
                {
                    notes: {
                        some: {
                            OR: [
                                { heading: { contains: validatedQuery, mode: "insensitive" } },
                                { description: { contains: validatedQuery, mode: "insensitive" } }
                            ]
                        }
                    }
                }
            ]
        },
        include: {
            _count: {
                select: {
                    notes: { where: { status: "ACTIVE" } }
                }
            }
        },
        take: 20,
    });

    return {
        notes: notes as IGetNoteList[],
        folders: folders as unknown as INoteFolder[]
    };
});

export const getNoteById = withErrorWrapper<INote, [string]>(async (id) => {
	const noteId = MONGOID.parse(id);
	const userId = await getUserId();
	const note = await prisma.note.findFirst({
		where: { id: noteId, userId },
	});
	if (!note) throw new Error("Note not found");
	return note as INote;
});

// Update note
export const updateNote = withErrorWrapper<INote, [any]>(async (input) => {
	const validatedInput = UpdateNoteSchema.parse(input);
	const userId = await getUserId();
	const existingNote = await prisma.note.findFirst({
		where: { id: validatedInput.id, userId },
	});
	if (!existingNote) throw new Error("Note not found");
	const note = await prisma.note.update({
		where: { id: validatedInput.id },
		data: {
			heading: validatedInput.heading,
			description: validatedInput.description,
			color: validatedInput.color,
			folderId: validatedInput.folderId,
			status: validatedInput.status,
		},
	});
	return note as INote;
});

// Move note to folder
export const moveNote = withErrorWrapper<INote, [any]>(async (input) => {
    // Import dynamically to avoid circular dependencies if any are present in schema import
    const { MoveNoteSchema } = await import("@/schema/note");
	const validatedInput = MoveNoteSchema.parse(input);
	const userId = await getUserId();
	
    // Check if note exists
	const existingNote = await prisma.note.findFirst({
		where: { id: validatedInput.noteId, userId },
	});
	if (!existingNote) throw new Error("Note not found");

    // Check if folder exists if folderId is provided
    if (validatedInput.folderId) {
        const folder = await prisma.noteFolder.findFirst({
            where: { id: validatedInput.folderId, userId }
        });
        if (!folder) throw new Error("Folder not found");
    }

	const note = await prisma.note.update({
		where: { id: validatedInput.noteId },
		data: {
			folderId: validatedInput.folderId,
		},
	});
	return note as INote;
});

// Delete note (soft or hard)
export const deleteNote = withErrorWrapper<void, [any]>(async (input) => {
	const validatedInput = DeleteNoteSchema.parse(input);
	const userId = await getUserId();
	const note = await prisma.note.findFirst({
		where: { id: validatedInput.id, userId },
	});
	if (!note) throw new Error("Note not found");
	if (validatedInput.softDelete) {
		await prisma.note.update({
			where: { id: validatedInput.id },
			data: { status: "ARCHIVED" },
		});
	} else {
		await prisma.note.delete({
			where: { id: validatedInput.id },
		});
	}
});

// Bulk delete notes (hard)
export const bulkDeleteNotes = withErrorWrapper<void, [string[]]>(async (ids) => {
	const validatedIds = z.array(MONGOID).min(1).max(100).parse(ids);
	const userId = await getUserId();
	await prisma.note.deleteMany({
		where: { id: { in: validatedIds }, userId },
	});
});

// Bulk soft delete notes (archive)
export const bulkSoftDeleteNotes = withErrorWrapper<void, [string[]]>(async (ids) => {
	const validatedIds = z.array(MONGOID).min(1).max(100).parse(ids);
	const userId = await getUserId();
	await prisma.note.updateMany({
		where: { id: { in: validatedIds }, userId },
		data: { status: "ARCHIVED" },
	});
});

// Restore note from archive
export const restoreNoteFromArchive = withErrorWrapper<INote, [string]>(async (id) => {
	const noteId = MONGOID.parse(id);
	const userId = await getUserId();
	const existingNote = await prisma.note.findFirst({
		where: { id: noteId, userId, status: "ARCHIVED" },
	});
	if (!existingNote) throw new Error("Archived note not found");
	const note = await prisma.note.update({
		where: { id: noteId },
		data: { status: "ACTIVE" },
	});
	return note as INote;
});

// Restore all archived notes
export const restoreAllFromArchive = withErrorWrapper<IGetNoteList[], []>(async () => {
	const userId = await getUserId();
	await prisma.note.updateMany({
		where: { userId, status: "ARCHIVED" },
		data: { status: "ACTIVE" },
	});
	const notes = await prisma.note.findMany({
		where: { userId, status: "ACTIVE" },
		take: 100,
	});
	return notes as IGetNoteList[];
});

// Search archived notes
export const searchArchivedNotes = withErrorWrapper<IGetArchivedNoteListPayload, [string]>(async (query) => {
	const validatedQuery = z.string().trim().max(100).parse(query);
	const userId = await getUserId();
	const notes = await prisma.note.findMany({
		where: {
			userId,
			status: "ARCHIVED",
			heading: { contains: validatedQuery, mode: "insensitive" },
		},
		take: 50,
	});
	return notes as IGetArchivedNoteListPayload;
});

// Folder actions
export const createNoteFolder = withErrorWrapper<INoteFolder, [any]>(async (input) => {
	const validatedInput = CreateFolderSchema.parse(input);
	const userId = await getUserId();
	const folder = await prisma.noteFolder.create({
		data: {
			userId,
			name: validatedInput.name,
			color: validatedInput.color,
			icon: validatedInput.icon,
		},
	});
	return folder as INoteFolder;
});

export const updateNoteFolder = withErrorWrapper<INoteFolder, [any]>(async (input) => {
	const validatedInput = UpdateFolderSchema.parse(input);
	const userId = await getUserId();
	const existingFolder = await prisma.noteFolder.findFirst({
		where: { id: validatedInput.id, userId },
	});
	if (!existingFolder) throw new Error("Folder not found");
	const folder = await prisma.noteFolder.update({
		where: { id: validatedInput.id },
		data: {
			name: validatedInput.name,
			color: validatedInput.color,
			icon: validatedInput.icon,
		},
	});
	return folder as INoteFolder;
});

export const deleteNoteFolder = withErrorWrapper<void, [any]>(async (input) => {
	const validatedInput = DeleteFolderSchema.parse(input);
	const userId = await getUserId();
	const existingFolder = await prisma.noteFolder.findFirst({
		where: { id: validatedInput.id, userId },
	});
	if (!existingFolder) throw new Error("Folder not found");
  
  if (validatedInput.softDelete) {
    await prisma.noteFolder.update({
      where: { id: validatedInput.id },
      data: { status: "ARCHIVED" }
    });
    // Archive all notes inside?
    await prisma.note.updateMany({
      where: { folderId: validatedInput.id, userId, status: "ACTIVE" },
      data: { status: "ARCHIVED" }
    });
  } else {
	  await prisma.noteFolder.delete({
		  where: { id: validatedInput.id },
	  });
  }
});

// Restore Folder
export const restoreNoteFolder = withErrorWrapper<void, [string]>(async (id) => {
  const folderId = MONGOID.parse(id);
  const userId = await getUserId();
  await prisma.noteFolder.update({
    where: { id: folderId, userId },
    data: { status: "ACTIVE" }
  });
});

// Permanent Delete Folder
export const permanentDeleteFolder = withErrorWrapper<void, [string]>(async (id) => {
    const folderId = MONGOID.parse(id);
    const userId = await getUserId();
    // Delete all notes in this folder first (or use cascade if set up, but safer to do explicit)
    await prisma.note.deleteMany({
        where: { folderId, userId }
    });
    await prisma.noteFolder.delete({
        where: { id: folderId, userId }
    });
});

// Permanent Delete Note
export const permanentDeleteNote = withErrorWrapper<void, [string]>(async (id) => {
    const noteId = MONGOID.parse(id);
    const userId = await getUserId();
    await prisma.note.delete({
        where: { id: noteId, userId }
    });
});

// Get Archived Folders
export const getArchivedFolders = withErrorWrapper<INoteFolder[], []>(async () => {
  const userId = await getUserId();
  const folders = await prisma.noteFolder.findMany({
    where: { userId, status: "ARCHIVED" },
    orderBy: { createdAt: "desc" },
    include: { 
        _count: {
            select: {
                notes: true 
            }
        }
    }
  });
  return folders as unknown as INoteFolder[];
});
