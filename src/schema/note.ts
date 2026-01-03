import { z } from "zod";
import { MONGOID } from "./mongo";

const NoteStatusEnum = z.enum(['ACTIVE', 'ARCHIVED', 'DELETED']);

export const CreateNoteSchema = z.object({
  heading: z.string().min(1, "Heading is required").max(100),
  description: z.string().min(1, "Description is required"),
  color: z.string().optional(),
  folderId: MONGOID.optional(),
});

export const UpdateNoteSchema = z.object({
  id: MONGOID,
  heading: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  color: z.string().optional(),
  folderId: MONGOID.optional(),
  status: NoteStatusEnum.optional(),
});

export const DeleteNoteSchema = z.object({
  id: MONGOID,
  softDelete: z.boolean().default(true),
});

export const CreateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(50),
  color: z.string().min(1, "Color is required"),
  icon: z.string().optional(),
});

export const UpdateFolderSchema = z.object({
  id: MONGOID,
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const DeleteFolderSchema = z.object({
  id: MONGOID,
  softDelete: z.boolean().default(true),
});



export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type DeleteNoteInput = z.infer<typeof DeleteNoteSchema>;
export type CreateFolderInput = z.infer<typeof CreateFolderSchema>;
export type UpdateFolderInput = z.infer<typeof UpdateFolderSchema>;
export type DeleteFolderInput = z.infer<typeof DeleteFolderSchema>;

export const MoveNoteSchema = z.object({
  noteId: MONGOID,
  folderId: MONGOID.nullable(), // nullable for root
});
export type MoveNoteInput = z.infer<typeof MoveNoteSchema>;