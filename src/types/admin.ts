export interface AdminRecord {
  id?: string;
  userId?: string | null;
  [key: string]: unknown;
}

export interface AdminRecordsResponse {
  records: AdminRecord[];
}


export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface CloudinaryResourceResponse {
  resources?: CloudinaryResource[];
}

export interface AvatarHistoryItem {
  publicId: string;
  secureUrl: string;
  createdAt: string;
  width?: number;
  height?: number;
  format?: string;
  isCurrent: boolean;
}
