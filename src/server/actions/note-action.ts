"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateNoteSchema, UpdateNoteSchema, DeleteNoteSchema, CreateFolderSchema, UpdateFolderSchema, DeleteFolderSchema, CreateNoteInput } from "@/schema/note";
import { INote, INoteFolder, IGetNoteList, IGetArchivedNoteListPayload, IGetNoteListPayload } from "@/types/note";
import { withErrorWrapper } from "@/lib/server/error-wrapper"; 
import { getUserId } from "@/lib/server/get-user"; 

export const createNote = withErrorWrapper<INote, [CreateNoteInput]>(async (input) => {
	const validatedInput = CreateNoteSchema.parse(input);

	const userId = await getUserId();
	const note = await prisma.note.create({
		data: {
			userId,
			heading: validatedInput.heading,
			description: validatedInput.description,
			color: validatedInput.color,
			folderId: validatedInput.folderId,
			status: "ACTIVE",
		},
	});
	return note as INote;
});

export const getFolders = withErrorWrapper<INoteFolder[], []>(async () => {
	const userId = await getUserId();
	const folders = await prisma.noteFolder.findMany({
		where: { 
      userId,
      status: "ACTIVE"
    },
		orderBy: { createdAt: "desc" },
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

export const getNotes = withErrorWrapper<IGetNoteList[], [string | undefined]>(async (folderId) => {
	const userId = await getUserId();

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
	});
	return notes as IGetNoteList[];
});

export const searchNotesAndFolders = withErrorWrapper<{ notes: IGetNoteList[], folders: INoteFolder[] }, [string]>(async (query) => {
    const userId = await getUserId();
    
    // Search Notes
    const notes = await prisma.note.findMany({
        where: {
            userId,
            status: { not: "ARCHIVED" },
            OR: [
                { heading: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        },
        orderBy: { createdAt: "desc" },
    });

    // Search Folders (match name OR if it contains notes matching the query)
    const folders = await prisma.noteFolder.findMany({
        where: {
            userId,
            status: { not: "ARCHIVED" },
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                {
                    notes: {
                        some: {
                            OR: [
                                { heading: { contains: query, mode: "insensitive" } },
                                { description: { contains: query, mode: "insensitive" } }
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
        }
    });

    return {
        notes: notes as IGetNoteList[],
        folders: folders as unknown as INoteFolder[]
    };
});

export const getNoteById = withErrorWrapper<INote, [string]>(async (id) => {
	const userId = await getUserId();
	const note = await prisma.note.findFirst({
		where: { id, userId },
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
	const userId = await getUserId();
	await prisma.note.deleteMany({
		where: { id: { in: ids }, userId },
	});
});

// Bulk soft delete notes (archive)
export const bulkSoftDeleteNotes = withErrorWrapper<void, [string[]]>(async (ids) => {
	const userId = await getUserId();
	await prisma.note.updateMany({
		where: { id: { in: ids }, userId },
		data: { status: "ARCHIVED" },
	});
});

// Restore note from archive
export const restoreNoteFromArchive = withErrorWrapper<INote, [string]>(async (id) => {
	const userId = await getUserId();
	const note = await prisma.note.update({
		where: { id },
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
	});
	return notes as IGetNoteList[];
});

// Search archived notes
export const searchArchivedNotes = withErrorWrapper<IGetArchivedNoteListPayload, [string]>(async (query) => {
	const userId = await getUserId();
	const notes = await prisma.note.findMany({
		where: {
			userId,
			status: "ARCHIVED",
			heading: { contains: query, mode: "insensitive" },
		},
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
  
  if (validatedInput.softDelete) {
    await prisma.noteFolder.update({
      where: { id: validatedInput.id },
      data: { status: "ARCHIVED" }
    });
    // Archive all notes inside?
    await prisma.note.updateMany({
      where: { folderId: validatedInput.id, status: "ACTIVE" },
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
  const userId = await getUserId();
  await prisma.noteFolder.update({
    where: { id, userId },
    data: { status: "ACTIVE" }
  });
});

// Permanent Delete Folder
export const permanentDeleteFolder = withErrorWrapper<void, [string]>(async (id) => {
    const userId = await getUserId();
    // Delete all notes in this folder first (or use cascade if set up, but safer to do explicit)
    await prisma.note.deleteMany({
        where: { folderId: id, userId }
    });
    await prisma.noteFolder.delete({
        where: { id, userId }
    });
});

// Permanent Delete Note
export const permanentDeleteNote = withErrorWrapper<void, [string]>(async (id) => {
    const userId = await getUserId();
    await prisma.note.delete({
        where: { id, userId }
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
