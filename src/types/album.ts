import type { MediaType } from "@/schema/album";

export interface IMedia {
  id: string;
  userId: string;
  filename: string;
  url: string;
  publicId: string;
  mediaType: MediaType;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  format?: string | null;
  location?: string | null;
  capturedAt?: Date | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  albumMemberships?: IAlbumMedia[];
}

export interface IAlbum {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  coverMediaId?: string | null;
  coverMedia?: IMedia | null;
  media?: IAlbumMedia[];
  _count?: {
    media: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlbumMedia {
  id: string;
  userId: string;
  albumId: string;
  mediaId: string;
  position: number;
  media?: IMedia;
  album?: IAlbum;
  createdAt: Date;
}

export interface IAlbumDashboard {
  media: IMedia[];
  albums: IAlbum[];
  recent: IMedia[];
  onThisDay: IMedia[];
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  resource_type: "image" | "video";
  bytes: number;
  original_filename?: string;
  created_at?: string;
}
