import { z } from "zod";
import { MONGOID } from "./mongo";

export const MediaTypeEnum = z.enum(["IMAGE", "VIDEO"]);
export type MediaType = z.infer<typeof MediaTypeEnum>;

const shortText = z.string().trim().min(1).max(200);
const optionalText = z.string().trim().max(1000).optional();

export const UploadMediaSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 9 * 1024 * 1024, "Media must be 9 MB or smaller"),
  capturedAt: z.coerce.date().optional(),
  location: z.string().trim().max(200).optional(),
  albumId: MONGOID.optional(),
});

export const GetMediaSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    albumId: MONGOID.optional(),
    openOnly: z.boolean().optional(),
    mediaType: MediaTypeEnum.optional(),
    favoritesOnly: z.boolean().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
  })
  .optional();

export const UpdateMediaSchema = z.object({
  id: MONGOID,
  filename: shortText.optional(),
  isFavorite: z.boolean().optional(),
});

export const DeleteMediaSchema = z.object({
  id: MONGOID,
});

export const CreateAlbumSchema = z.object({
  title: shortText,
  description: optionalText,
  coverMediaId: MONGOID.optional(),
});

export const UpdateAlbumSchema = z.object({
  id: MONGOID,
  title: shortText.optional(),
  description: optionalText,
  coverMediaId: MONGOID.nullable().optional(),
});

export const DeleteAlbumSchema = z.object({
  id: MONGOID,
});

export const AlbumMediaSchema = z.object({
  albumId: MONGOID,
  mediaId: MONGOID,
});

export const ReorderAlbumMediaSchema = z.object({
  albumId: MONGOID,
  mediaIds: z.array(MONGOID).max(500),
});

export type UploadMediaInput = z.infer<typeof UploadMediaSchema>;
export type GetMediaInput = z.infer<typeof GetMediaSchema>;
export type UpdateMediaInput = z.infer<typeof UpdateMediaSchema>;
export type DeleteMediaInput = z.infer<typeof DeleteMediaSchema>;
export type CreateAlbumInput = z.infer<typeof CreateAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof UpdateAlbumSchema>;
export type DeleteAlbumInput = z.infer<typeof DeleteAlbumSchema>;
export type AlbumMediaInput = z.infer<typeof AlbumMediaSchema>;
export type ReorderAlbumMediaInput = z.infer<typeof ReorderAlbumMediaSchema>;
