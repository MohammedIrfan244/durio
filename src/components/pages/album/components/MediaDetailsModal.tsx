"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Heart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { IMedia } from "@/types/album";

interface MediaDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: IMedia | null;
  // onEdit: (media: IMedia) => void;
  onViewDetails: (media: IMedia) => void;
  onFavorite: (media: IMedia) => void;
  onDelete: (media: IMedia) => void;
  onRename: (media: IMedia, filename: string) => void;
}

export function MediaDetailsModal({
  open,
  onOpenChange,
  media,
  onFavorite,
  onDelete,
  onRename,
}: MediaDetailsModalProps) {
  const [filename, setFilename] = useState(media?.filename || "");
  const [expanded, setExpanded] = useState(false);

  if (!media) return null;

  const handleRename = () => {
    if (filename.trim() && filename !== media.filename) {
      onRename(media, filename);
    }
  };

  const handleClose = () => {
    setFilename("");
    setExpanded(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* p-0 so the image can bleed edge-to-edge; DialogTitle stays for a11y but is visually
          folded into the caption bar rather than a separate header block */}
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{media.filename}</DialogTitle>
        </DialogHeader>

        {/* Media — the only thing you see on open */}
        <div className="relative bg-black">
          <div className="aspect-square w-full">
            {media.mediaType === "VIDEO" ? (
              <video
                src={media.url}
                className="h-full w-full object-contain"
                playsInline
                controls
                preload="metadata"
              />
            ) : (
              <Image
                loading="eager"
                src={media.url}
                alt={media.filename}
                width={800}
                height={800}
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {/* Filename caption, overlaid at the bottom of the image.
              Photos only — for videos this would sit on top of the native
              controls bar and block clicks on it. */}
          {media.mediaType !== "VIDEO" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-8 pb-3">
              <p className="truncate text-sm font-medium text-white">
                {media.filename}
              </p>
            </div>
          )}
        </div>

        {/* Everything else lives here, collapsed by default */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {expanded ? (
            <>
              Hide details <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Details & actions <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        {expanded && (
          <div className="max-h-[45vh] overflow-y-auto px-4 pb-4 pt-1 space-y-4 animate-slide-down">
            {/* Filename — shown here for videos since the image caption
                overlay is suppressed for them */}
            {media.mediaType === "VIDEO" && (
              <p className="truncate text-sm font-medium">{media.filename}</p>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={media.isFavorite ? "secondary" : "outline"}
                className="h-10 gap-1.5"
                onClick={() => onFavorite(media)}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    media.isFavorite && "fill-rose-500 text-rose-500",
                  )}
                />
                <span className="text-xs">
                  {media.isFavorite ? "Loved" : "Love"}
                </span>
              </Button>
              <Button variant="outline" className="h-10 gap-1.5" asChild>
                <a href={media.url} download target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  <span className="text-xs">Save</span>
                </a>
              </Button>
              <Button
                className="text-accent-foreground"
                onClick={() => {
                  onDelete(media);
                  handleClose();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>

            <Separator />

            {/* Rename */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filename</Label>
              <div className="flex gap-2">
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Rename..."
                />
                <Button
                  size="icon"
                  variant={
                    filename.trim() && filename !== media.filename
                      ? "default"
                      : "outline"
                  }
                  className="h-10 w-10 shrink-0"
                  onClick={handleRename}
                  disabled={!filename.trim() || filename === media.filename}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Type</div>
              <div className="font-medium text-right">
                {media.mediaType === "VIDEO" ? "Video" : "Photo"}
              </div>
              <div className="text-muted-foreground">File size</div>
              <div className="font-medium text-right">
                {formatBytes(media.size)}
              </div>
              {media.width && media.height && (
                <>
                  <div className="text-muted-foreground">Dimensions</div>
                  <div className="font-medium text-right">
                    {media.width} × {media.height}
                  </div>
                </>
              )}
              {media.duration && (
                <>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium text-right">
                    {Math.round(media.duration)}s
                  </div>
                </>
              )}
              {media.format && (
                <>
                  <div className="text-muted-foreground">Format</div>
                  <div className="font-medium text-right">{media.format}</div>
                </>
              )}
              {media.mimeType && (
                <>
                  <div className="text-muted-foreground">MIME type</div>
                  <div className="font-medium text-right break-all">
                    {media.mimeType}
                  </div>
                </>
              )}
              {media.location && (
                <>
                  <div className="text-muted-foreground">Location</div>
                  <div className="font-medium text-right break-all">
                    {media.location}
                  </div>
                </>
              )}
              <div className="text-muted-foreground">Captured</div>
              <div className="font-medium text-right">
                {formatDate(media.capturedAt || media.createdAt)}
              </div>
              <div className="text-muted-foreground">Uploaded</div>
              <div className="font-medium text-right">
                {formatDate(media.createdAt)}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBytes(bytes: number) {
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