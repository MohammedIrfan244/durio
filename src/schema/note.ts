import { z } from "zod";
import { MONGOID } from "./mongo";

export const NoteStatusEnum = z.enum(['ACTIVE', 'ARCHIVED', 'DELETED']);
export type NoteStatus = z.infer<typeof NoteStatusEnum>;

const shortText = z.string().trim().min(1).max(200);
const longText = z.string().trim().min(1).max(10000);

export const CreateNoteSchema = z.object({
  heading: shortText,
  description: longText,
  color: z.string().optional(),
  folderId: MONGOID.optional(),
  linkedResources: z
    .array(
      z.object({
        id: MONGOID,
        type: z.enum(["TODO", "NOTE", "EVENT", "PROJECT"]),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      })
    )
    .optional(),
});

export const UpdateNoteSchema = z.object({
  id: MONGOID,
  heading: shortText.optional(),
  description: longText.optional(),
  color: z.string().optional(),
  folderId: MONGOID.optional(),
  status: NoteStatusEnum.optional(),
});

export const DeleteNoteSchema = z.object({
  id: MONGOID,
  softDelete: z.boolean().default(true),
});

export const CreateFolderSchema = z.object({
  name: shortText,
  color: z.string().min(1, "Color is required"),
  icon: z.string().optional(),
});

export const UpdateFolderSchema = z.object({
  id: MONGOID,
  name: shortText.optional(),
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
