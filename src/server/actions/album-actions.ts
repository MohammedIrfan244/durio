"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getUserId } from "@/lib/server/get-user";
import {
  AlbumMediaInput,
  AlbumMediaSchema,
  CreateAlbumInput,
  CreateAlbumSchema,
  DeleteAlbumInput,
  DeleteAlbumSchema,
  DeleteMediaInput,
  DeleteMediaSchema,
  GetMediaInput,
  GetMediaSchema,
  ReorderAlbumMediaInput,
  ReorderAlbumMediaSchema,
  UpdateAlbumInput,
  UpdateAlbumSchema,
  UpdateMediaInput,
  UpdateMediaSchema,
  UploadMediaInput,
  UploadMediaSchema,
} from "@/schema/album";
import type { CloudinaryUploadResult, IAlbum, IAlbumDashboard, IMedia } from "@/types/album";


export const uploadMedia = withErrorWrapper<IMedia, [UploadMediaInput]>(
  async (input) => {
    console.log("called here")
    const validatedInput = UploadMediaSchema.parse(input);
    const userId = await getUserId();

    if (!validatedInput.file.type.startsWith("image/") && !validatedInput.file.type.startsWith("video/")) {
      throw new Error("Only image and video uploads are supported");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials not configured");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folderRoot = process.env.CLOUDINARY_FOLDER_NAME || "Durio";
    const folder = `${folderRoot}/album/${userId}`;
    const signature = await generateSignature({ folder, timestamp }, apiSecret);

    const formData = new FormData();
    formData.append("file", validatedInput.file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await readCloudinaryError(response);
      throw new Error(`Failed to upload media to Cloudinary: ${message}`);
    }

    const result: CloudinaryUploadResult = await response.json();
    const media = await prisma.media.create({
      data: {
        userId,
        filename: validatedInput.file.name || result.original_filename || "Untitled media",
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: result.resource_type === "video" ? "VIDEO" : "IMAGE",
        mimeType: validatedInput.file.type,
        size: result.bytes || validatedInput.file.size,
        width: result.width,
        height: result.height,
        duration: result.duration,
        format: result.format,
        location: validatedInput.location,
        capturedAt: validatedInput.capturedAt ?? (result.created_at ? new Date(result.created_at) : undefined),
      },
    });

    if (validatedInput.albumId) {
      await assertAlbumAndMedia(validatedInput.albumId, media.id, userId);
      await addMediaToAlbumInternal(validatedInput.albumId, media.id, userId);
    }

    return media as IMedia;
  }
);

export const getAlbumDashboard = withErrorWrapper<IAlbumDashboard, [GetMediaInput]>(
  async (input) => {
    const [media, albums, recent, onThisDay] = await Promise.all([
      getMediaInternal(input),
      getAlbumsInternal(),
      getRecentInternal(),
      getOnThisDayInternal(),
    ]);

    return { media, albums, recent, onThisDay };
  }
);

export const getMedia = withErrorWrapper<IMedia[], [GetMediaInput]>(getMediaInternal);

export const toggleFavoriteMedia = withErrorWrapper<IMedia, [UpdateMediaInput]>(
  async (input) => {
    const validatedInput = UpdateMediaSchema.parse(input);
    const userId = await getUserId();
    const existing = await prisma.media.findFirst({ where: { id: validatedInput.id, userId } });
    if (!existing) throw new Error("Media not found");

    const media = await prisma.media.update({
      where: { id: validatedInput.id },
      data: {
        isFavorite: validatedInput.isFavorite ?? !existing.isFavorite,
        filename: validatedInput.filename,
      },
    });

    return media as IMedia;
  }
);

export const updateMedia = withErrorWrapper<IMedia, [UpdateMediaInput]>(
  async (input) => {
    const validatedInput = UpdateMediaSchema.parse(input);
    const userId = await getUserId();
    const existing = await prisma.media.findFirst({ where: { id: validatedInput.id, userId } });
    if (!existing) throw new Error("Media not found");

    const media = await prisma.media.update({
      where: { id: validatedInput.id },
      data: {
        filename: validatedInput.filename,
        isFavorite: validatedInput.isFavorite,
      },
    });

    return media as IMedia;
  }
);

export const deleteMedia = withErrorWrapper<void, [DeleteMediaInput]>(async (input) => {
  const validatedInput = DeleteMediaSchema.parse(input);
  const userId = await getUserId();
  const media = await prisma.media.findFirst({ where: { id: validatedInput.id, userId } });
  if (!media) throw new Error("Media not found");

  await prisma.$transaction([
    prisma.album.updateMany({
      where: { userId, coverMediaId: validatedInput.id },
      data: { coverMediaId: null },
    }),
    prisma.albumMedia.deleteMany({ where: { userId, mediaId: validatedInput.id } }),
    prisma.media.delete({ where: { id: validatedInput.id } }),
  ]);
  await destroyCloudinaryResource(media.publicId, media.mediaType);
});

export const getAlbums = withErrorWrapper<IAlbum[], []>(getAlbumsInternal);

export const createAlbum = withErrorWrapper<IAlbum, [CreateAlbumInput]>(async (input) => {
  const validatedInput = CreateAlbumSchema.parse(input);
  const userId = await getUserId();
  await assertCoverBelongsToUser(validatedInput.coverMediaId, userId);

  const album = await prisma.album.create({
    data: {
      userId,
      title: validatedInput.title,
      description: validatedInput.description,
      coverMediaId: validatedInput.coverMediaId,
    },
    include: albumInclude,
  });

  return album as unknown as IAlbum;
});

export const updateAlbum = withErrorWrapper<IAlbum, [UpdateAlbumInput]>(async (input) => {
  const validatedInput = UpdateAlbumSchema.parse(input);
  const userId = await getUserId();
  const existing = await prisma.album.findFirst({ where: { id: validatedInput.id, userId } });
  if (!existing) throw new Error("Album not found");
  await assertCoverBelongsToUser(validatedInput.coverMediaId ?? undefined, userId);

  const album = await prisma.album.update({
    where: { id: validatedInput.id },
    data: {
      title: validatedInput.title,
      description: validatedInput.description,
      coverMediaId: validatedInput.coverMediaId,
    },
    include: albumInclude,
  });

  return album as unknown as IAlbum;
});

export const deleteAlbum = withErrorWrapper<void, [DeleteAlbumInput]>(async (input) => {
  const validatedInput = DeleteAlbumSchema.parse(input);
  const userId = await getUserId();
  const existing = await prisma.album.findFirst({ where: { id: validatedInput.id, userId } });
  if (!existing) throw new Error("Album not found");

  await prisma.$transaction([
    prisma.albumMedia.deleteMany({ where: { albumId: validatedInput.id, userId } }),
    prisma.album.delete({ where: { id: validatedInput.id } }),
  ]);
});

export const addMediaToAlbum = withErrorWrapper<void, [AlbumMediaInput]>(async (input) => {
  const validatedInput = AlbumMediaSchema.parse(input);
  const userId = await getUserId();
  await assertAlbumAndMedia(validatedInput.albumId, validatedInput.mediaId, userId);
  await addMediaToAlbumInternal(validatedInput.albumId, validatedInput.mediaId, userId);
});

export const removeMediaFromAlbum = withErrorWrapper<void, [AlbumMediaInput]>(async (input) => {
  const validatedInput = AlbumMediaSchema.parse(input);
  const userId = await getUserId();
  await prisma.albumMedia.deleteMany({
    where: {
      userId,
      albumId: validatedInput.albumId,
      mediaId: validatedInput.mediaId,
    },
  });
});

export const reorderAlbumMedia = withErrorWrapper<void, [ReorderAlbumMediaInput]>(async (input) => {
  const validatedInput = ReorderAlbumMediaSchema.parse(input);
  const userId = await getUserId();
  const album = await prisma.album.findFirst({ where: { id: validatedInput.albumId, userId } });
  if (!album) throw new Error("Album not found");

  await prisma.$transaction(
    validatedInput.mediaIds.map((mediaId, position) =>
      prisma.albumMedia.updateMany({
        where: { userId, albumId: validatedInput.albumId, mediaId },
        data: { position },
      })
    )
  );
});

async function getMediaInternal(input?: GetMediaInput): Promise<IMedia[]> {
  const validatedInput = GetMediaSchema.parse(input);
  const userId = await getUserId();
  const limit = Math.min(validatedInput?.limit || 60, 100);
  const page = validatedInput?.page || 1;
  const where: Prisma.MediaWhereInput = { userId };

  if (validatedInput?.search) {
    where.filename = { contains: validatedInput.search, mode: "insensitive" };
  }
  if (validatedInput?.mediaType) {
    where.mediaType = validatedInput.mediaType;
  }
  if (validatedInput?.favoritesOnly) {
    where.isFavorite = true;
  }
  if (validatedInput?.dateFrom || validatedInput?.dateTo) {
    const range: Prisma.DateTimeFilter<"Media"> = {};
    if (validatedInput.dateFrom) range.gte = validatedInput.dateFrom;
    if (validatedInput.dateTo) range.lte = validatedInput.dateTo;
    where.OR = [
      {
        capturedAt: range,
      },
      {
        createdAt: range,
      },
    ];
  }
  if (validatedInput?.albumId) {
    const memberships = await prisma.albumMedia.findMany({
      where: { userId, albumId: validatedInput.albumId },
      orderBy: { position: "asc" },
      select: { mediaId: true },
    });
    const ids = memberships.map((membership) => membership.mediaId);
    where.id = { in: ids };
  } else if (validatedInput?.openOnly) {
    const memberships = await prisma.albumMedia.findMany({
      where: { userId },
      select: { mediaId: true },
    });
    where.id = { notIn: memberships.map((membership) => membership.mediaId) };
  }

  const media = await prisma.media.findMany({
    where,
    orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      albumMemberships: {
        where: { userId },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!validatedInput?.albumId) return media as unknown as IMedia[];

  const positions = new Map(
    media.flatMap((item) =>
      item.albumMemberships
        .filter((membership) => membership.albumId === validatedInput.albumId)
        .map((membership) => [item.id, membership.position] as const)
    )
  );

  return (media as unknown as IMedia[]).sort(
    (a, b) => (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0)
  );
}

async function getAlbumsInternal(): Promise<IAlbum[]> {
  const userId = await getUserId();
  const albums = await prisma.album.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: albumInclude,
  });
  return albums as unknown as IAlbum[];
}

async function getRecentInternal(): Promise<IMedia[]> {
  const userId = await getUserId();
  const media = await prisma.media.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  return media as IMedia[];
}

async function getOnThisDayInternal(): Promise<IMedia[]> {
  const userId = await getUserId();
  const now = new Date();
  const candidates = await prisma.media.findMany({
    where: { userId, capturedAt: { not: null } },
    orderBy: { capturedAt: "desc" },
    take: 300,
  });

  return candidates
    .filter((media) => {
      const date = media.capturedAt;
      return date && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
    })
    .slice(0, 12) as IMedia[];
}

async function assertCoverBelongsToUser(mediaId: string | undefined, userId: string) {
  if (!mediaId) return;
  const media = await prisma.media.findFirst({ where: { id: mediaId, userId } });
  if (!media) throw new Error("Cover media not found");
}

async function assertAlbumAndMedia(albumId: string, mediaId: string, userId: string) {
  const [album, media] = await Promise.all([
    prisma.album.findFirst({ where: { id: albumId, userId } }),
    prisma.media.findFirst({ where: { id: mediaId, userId } }),
  ]);
  if (!album) throw new Error("Album not found");
  if (!media) throw new Error("Media not found");
}

async function addMediaToAlbumInternal(albumId: string, mediaId: string, userId: string) {
  const last = await prisma.albumMedia.findFirst({
    where: { albumId, userId },
    orderBy: { position: "desc" },
  });

  await prisma.albumMedia.upsert({
    where: {
      albumId_mediaId: {
        albumId,
        mediaId,
      },
    },
    create: {
      userId,
      albumId,
      mediaId,
      position: (last?.position ?? -1) + 1,
    },
    update: {},
  });
}

async function destroyCloudinaryResource(publicId: string, mediaType: "IMAGE" | "VIDEO") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const resourceType = mediaType === "VIDEO" ? "video" : "image";
  const signature = await generateSignature({ public_id: publicId, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: "POST",
    body: formData,
  }).catch((error) => console.error("Failed to delete media from Cloudinary:", error));
}

async function readCloudinaryError(response: Response) {
  try {
    const error = await response.json();
    return error?.error?.message || response.statusText;
  } catch {
    return response.text().catch(() => response.statusText);
  }
}

async function generateSignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const crypto = await import("crypto");
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${sortedParams}${apiSecret}`).digest("hex");
}

const albumInclude = {
  coverMedia: true,
  _count: {
    select: {
      media: true,
    },
  },
} satisfies Prisma.AlbumInclude;
