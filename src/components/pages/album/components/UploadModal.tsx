"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  FileImage,
  Loader2,
  Plus,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { uploadMedia } from "@/server/actions/album-actions";
import { toast } from "sonner";

const MAX_MEDIA_UPLOAD_BYTES = 9 * 1024 * 1024;
const ALLOWED_TYPES = ["image/*", "video/*"];

interface UploadQueueItem {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albumId?: string;
  albumTitle?: string;
  onUploadComplete: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}

export function UploadModal({
  open,
  onOpenChange,
  albumId,
  albumTitle,
  onUploadComplete,
}: UploadModalProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
        errors.push(
          `${file.name} is too large (max ${formatBytes(
            MAX_MEDIA_UPLOAD_BYTES,
          )})`,
        );
        return;
      }
      const isValidType = ALLOWED_TYPES.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      if (!isValidType) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setGlobalError(errors.join(", "));
      toast.error(errors[0]);
    } else {
      setGlobalError(null);
    }

    return validFiles;
  }, []);

  const addFilesToQueue = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      status: "pending" as const,
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        addFilesToQueue(validFiles);
      }
      event.target.value = "";
    },
    [validateFiles, addFilesToQueue],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length === 0) return;
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        addFilesToQueue(validFiles);
      }
    },
    [validateFiles, addFilesToQueue],
  );

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setGlobalError(null);
  }, []);

  const uploadFiles = useCallback(async () => {
    console.log("UPLOAD CLICKED");
    const pendingItems = queue.filter(
      (item) => item.status === "pending" || item.status === "error",
    );
    console.log("PENDING ITEMS:", pendingItems);
    if (pendingItems.length === 0) return;
    const failedIds = new Set<string>();

    for (const item of pendingItems) {
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? ({ ...i, status: "uploading", progress: 0 } as UploadQueueItem)
            : i,
        ),
      );

      try {
        console.log("starting here");
        const result = await uploadMedia({
          file: item.file,
          capturedAt: new Date(item.file.lastModified),
          albumId,
        });

        console.log("called", result);

        if (!result.success) {
          console.log("didnt got result", result.error?.message);
          throw new Error(result.error?.message || "Upload failed");
        }

        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? ({ ...i, status: "success", progress: 100 } as UploadQueueItem)
              : i,
          ),
        );
      } catch (error) {
        failedIds.add(item.id);
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : i,
          ),
        );
      }
    }

    const finalQueue = queue.map((item) =>
      pendingItems.includes(item)
        ? failedIds.has(item.id)
          ? { ...item, status: "error" as const }
          : { ...item, status: "success" as const, progress: 100 }
        : item,
    );
    const allDone = finalQueue.every(
      (item) => item.status === "success" || item.status === "error",
    );

    if (allDone && finalQueue.some((item) => item.status === "success")) {
      toast.success(
        albumTitle ? `Added to "${albumTitle}"` : "Upload complete!",
      );
      onUploadComplete();
      setTimeout(() => {
        onOpenChange(false);
        clearQueue();
      }, 1500);
    }
  }, [queue, albumId, albumTitle, onUploadComplete, onOpenChange, clearQueue]);

  const hasUploading = queue.some((item) => item.status === "uploading");

  const hasPending = queue.some(
    (item) => item.status === "pending" || item.status === "error",
  );

  const hasErrors = queue.some((item) => item.status === "error");
  const allSuccess =
    queue.length > 0 && queue.every((item) => item.status === "success");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Add photos & videos
          </DialogTitle>
          <DialogDescription className="mt-1">
            {albumTitle
              ? `Uploading to "${albumTitle}"`
              : "Files will be added to your open media library"}
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <p className="font-medium">A quick heads-up</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  Max file size:{" "}
                  <strong>{formatBytes(MAX_MEDIA_UPLOAD_BYTES)}</strong> each
                </li>
                <li>
                  Supported: Photos (JPG, PNG, HEIC, WebP) & Videos (MP4, MOV,
                  WebM)
                </li>
                <li>
                  Large files may take a moment — we&apos;ll show progress
                </li>
              </ul>
            </div>
          </div>
        </div>

        {globalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">
                {globalError}
              </p>
            </div>
          </div>
        )}

        {/* Drop Zone / File Input */}
        <div className="mb-4">
          <label
            htmlFor="upload-modal-input"
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300",
              isDragging
                ? "border-primary bg-primary/5 bg-gradient-to-br from-primary/5 to-transparent"
                : "border-border/40",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="upload-modal-input"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={hasUploading}
            />
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
                  isDragging
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isDragging ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium">
                  {isDragging
                    ? "Drop files here"
                    : "Drag & drop photos & videos here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Upload Queue */}
        {queue.length > 0 && (
          <div className="mb-4 max-h-60 overflow-y-auto space-y-2 border rounded-xl p-3 bg-muted/30">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pb-2 border-b">
              <span>Ready to upload ({queue.length})</span>
              {hasErrors && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setQueue((prev) => prev.filter((i) => i.status !== "error"))
                  }
                >
                  Clear errors
                </Button>
              )}
            </div>
            {queue.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  item.status === "success" &&
                    "bg-green-50 dark:bg-green-900/20",
                  item.status === "error" && "bg-red-50 dark:bg-red-900/20",
                  item.status === "uploading" &&
                    "bg-blue-50 dark:bg-blue-900/20",
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center",
                    {
                      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400":
                        item.status === "success",
                      "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400":
                        item.status === "error",
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400":
                        item.status === "uploading",
                      "bg-muted text-muted-foreground":
                        item.status === "pending",
                    },
                  )}
                >
                  {item.status === "success" && (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  {item.status === "error" && <XCircle className="h-5 w-5" />}
                  {item.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  {item.status === "pending" && (
                    <FileImage className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(item.file.size)}</span>
                    {item.status === "uploading" && (
                      <>
                        <Progress
                          value={item.progress}
                          className="h-1.5 flex-1 max-w-xs"
                        />
                        <span>{Math.round(item.progress)}%</span>
                      </>
                    )}
                    {item.status === "error" && item.error && (
                      <span className="text-red-600 dark:text-red-400">
                        {item.error}
                      </span>
                    )}
                  </div>
                </div>
                {(item.status === "pending" || item.status === "error") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromQueue(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator className="mb-4" />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={clearQueue}
            disabled={queue.length === 0 || hasUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear all
          </Button>
          <Button
            variant="default"
            onClick={uploadFiles}
            disabled={queue.length === 0 || hasUploading || allSuccess}
            className="flex-1"
          >
            {hasUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : allSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                All done!
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Start upload (
                {hasPending
                  ? queue.filter((i) => i.status !== "success").length
                  : 0}
                )
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
