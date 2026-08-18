"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Download,
  Eye,
  Filter,
  Heart,
  ImagePlus,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { HeaderSearch } from "@/components/shared/header-search";
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import {
  addMediaToAlbum,
  createAlbum,
  deleteAlbum,
  deleteMedia,
  getAlbumDashboard,
  removeMediaFromAlbum,
  reorderAlbumMedia,
  toggleFavoriteMedia,
  updateAlbum,
  uploadMedia,
} from "@/server/actions/album-actions";
import type { IAlbum, IMedia } from "@/types/album";

type ViewMode = "gallery" | "timeline";
type MediaTypeFilter = "ALL" | "IMAGE" | "VIDEO";

const breakpointColumns = {
  default: 5,
  1280: 4,
  1024: 3,
  768: 2,
  640: 1,
};

export default function Album() {
  const [media, setMedia] = useState<IMedia[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [recent, setRecent] = useState<IMedia[]>([]);
  const [onThisDay, setOnThisDay] = useState<IMedia[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>();
  const [selectedMedia, setSelectedMedia] = useState<IMedia | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<IAlbum | null>(null);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, 300);

  const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);

  const loadData = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    startTransition(async () => {
      const result = await getAlbumDashboard({
        search: debouncedSearch || undefined,
        albumId: selectedAlbumId,
        mediaType: mediaType === "ALL" ? undefined : mediaType,
        favoritesOnly,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(`${dateTo}T23:59:59`) : undefined,
      });

      if (result.data) {
        setMedia(result.data.media);
        setAlbums(result.data.albums);
        setRecent(result.data.recent);
        setOnThisDay(result.data.onThisDay);
      } else {
        toast.error(result.error?.message || "Failed to load album");
      }
      setLoading(false);
    });
  }, [dateFrom, dateTo, debouncedSearch, favoritesOnly, mediaType, selectedAlbumId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => loadData(false), 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const timeline = useMemo(() => {
    return media.reduce<Record<string, IMedia[]>>((groups, item) => {
      const date = new Date(item.capturedAt || item.createdAt);
      const key = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [media]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const uploading = toast.loading(`Uploading ${files.length} ${files.length === 1 ? "item" : "items"}...`);
    for (const file of files) {
      const result = await uploadMedia({ file, capturedAt: new Date(file.lastModified) });
      if (!result.success) toast.error(result.error?.message || `Failed to upload ${file.name}`);
    }
    toast.dismiss(uploading);
    toast.success("Upload complete");
    event.target.value = "";
    loadData();
  };

  const handleFavorite = async (item: IMedia) => {
    const result = await toggleFavoriteMedia({ id: item.id, isFavorite: !item.isFavorite });
    if (!result.data) {
      toast.error(result.error?.message || "Failed to update favorite");
      return;
    }
    setMedia((items) => items.map((mediaItem) => (mediaItem.id === item.id ? result.data! : mediaItem)));
    setRecent((items) => items.map((mediaItem) => (mediaItem.id === item.id ? result.data! : mediaItem)));
    setOnThisDay((items) => items.map((mediaItem) => (mediaItem.id === item.id ? result.data! : mediaItem)));
    setSelectedMedia((current) => (current?.id === item.id ? result.data! : current));
  };

  const handleDeleteMedia = async (item: IMedia) => {
    const confirmed = window.confirm(`Delete ${item.filename}?`);
    if (!confirmed) return;
    const result = await deleteMedia({ id: item.id });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to delete media");
      return;
    }
    setSelectedMedia(null);
    toast.success("Media deleted");
    loadData();
  };

  const handleAddToAlbum = async (albumId: string, mediaId: string) => {
    const result = await addMediaToAlbum({ albumId, mediaId });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to add media to album");
      return;
    }
    toast.success("Added to album");
    loadData();
  };

  const handleRemoveFromAlbum = async (mediaId: string) => {
    if (!selectedAlbumId) return;
    const result = await removeMediaFromAlbum({ albumId: selectedAlbumId, mediaId });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to remove media from album");
      return;
    }
    toast.success("Removed from album");
    loadData();
  };

  const handleMoveInAlbum = async (mediaId: string, direction: -1 | 1) => {
    if (!selectedAlbumId) return;
    const index = media.findIndex((item) => item.id === mediaId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= media.length) return;
    const next = [...media];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setMedia(next);
    const result = await reorderAlbumMedia({ albumId: selectedAlbumId, mediaIds: next.map((item) => item.id) });
    if (!result.success) toast.error(result.error?.message || "Failed to reorder album");
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <SectionHeaderWrapper className="mb-2">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 md:flex">
            <div className="flex-1">
              <HeaderSearch value={search} onChange={setSearch} placeholder="Search your library..." />
            </div>
            <Button asChild className="gap-2 font-semibold">
              <Label htmlFor="album-upload" className="cursor-pointer">
                <ImagePlus className="h-4 w-4" />
                Upload
              </Label>
            </Button>
            <Input
              id="album-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              className="col-span-2 gap-2 md:w-auto"
              onClick={() => {
                setEditingAlbum(null);
                setAlbumDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Album
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[auto_auto_auto_1fr_auto] md:items-end">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={mediaType} onValueChange={(value) => setMediaType(value as MediaTypeFilter)}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All media</SelectItem>
                  <SelectItem value="IMAGE">Photos</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
            <Card className="bg-secondary/30 border-border/40 md:w-[170px]">
              <CardContent className="flex h-10 items-center justify-between gap-3 px-3 py-0">
                <Label className="text-sm font-semibold">Favorites</Label>
                <Switch checked={favoritesOnly} onCheckedChange={setFavoritesOnly} />
              </CardContent>
            </Card>
            <div className="flex rounded-md border bg-background p-1">
              <Button size="sm" variant={viewMode === "gallery" ? "secondary" : "ghost"} onClick={() => setViewMode("gallery")}>
                Gallery
              </Button>
              <Button size="sm" variant={viewMode === "timeline" ? "secondary" : "ghost"} onClick={() => setViewMode("timeline")}>
                Timeline
              </Button>
            </div>
          </div>
        </div>
      </SectionHeaderWrapper>

      <AlbumShelf
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onSelect={setSelectedAlbumId}
        onEdit={(album) => {
          setEditingAlbum(album);
          setAlbumDialogOpen(true);
        }}
        onDelete={async (album) => {
          if (!window.confirm(`Delete album ${album.title}? Media files will stay in your library.`)) return;
          const result = await deleteAlbum({ id: album.id });
          if (!result.success) {
            toast.error(result.error?.message || "Failed to delete album");
            return;
          }
          if (selectedAlbumId === album.id) setSelectedAlbumId(undefined);
          toast.success("Album deleted");
          loadData();
        }}
      />

      {!selectedAlbumId && (
        <Highlights recent={recent} onThisDay={onThisDay} onOpen={setSelectedMedia} />
      )}

      {selectedAlbum && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h1 className="text-2xl font-bold">{selectedAlbum.title}</h1>
            {selectedAlbum.description && (
              <p className="text-sm text-muted-foreground">{selectedAlbum.description}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedAlbumId(undefined)}>
            All Media
          </Button>
        </div>
      )}

      {loading || isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <EmptyAlbumState hasFilters={!!debouncedSearch || favoritesOnly || mediaType !== "ALL" || !!dateFrom || !!dateTo} />
      ) : viewMode === "gallery" ? (
        <MediaMasonry
          media={media}
          albums={albums}
          selectedAlbumId={selectedAlbumId}
          onOpen={setSelectedMedia}
          onFavorite={handleFavorite}
          onDelete={handleDeleteMedia}
          onAddToAlbum={handleAddToAlbum}
          onRemoveFromAlbum={handleRemoveFromAlbum}
          onMoveInAlbum={handleMoveInAlbum}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(timeline).map(([label, items]) => (
            <section key={label} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold">{label}</h2>
              </div>
              <MediaMasonry
                media={items}
                albums={albums}
                selectedAlbumId={selectedAlbumId}
                onOpen={setSelectedMedia}
                onFavorite={handleFavorite}
                onDelete={handleDeleteMedia}
                onAddToAlbum={handleAddToAlbum}
                onRemoveFromAlbum={handleRemoveFromAlbum}
                onMoveInAlbum={handleMoveInAlbum}
              />
            </section>
          ))}
        </div>
      )}

      <AlbumDialog
        open={albumDialogOpen}
        onOpenChange={setAlbumDialogOpen}
        album={editingAlbum}
        media={media.length > 0 ? media : recent}
        onSaved={() => {
          setAlbumDialogOpen(false);
          setEditingAlbum(null);
          loadData();
        }}
      />

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          albums={albums}
          onClose={() => setSelectedMedia(null)}
          onFavorite={handleFavorite}
          onDelete={handleDeleteMedia}
          onAddToAlbum={handleAddToAlbum}
          onRemoveFromAlbum={selectedAlbumId ? () => handleRemoveFromAlbum(selectedMedia.id) : undefined}
        />
      )}
    </div>
  );
}

function AlbumShelf({
  albums,
  selectedAlbumId,
  onSelect,
  onEdit,
  onDelete,
}: {
  albums: IAlbum[];
  selectedAlbumId?: string;
  onSelect: (id: string | undefined) => void;
  onEdit: (album: IAlbum) => void;
  onDelete: (album: IAlbum) => void;
}) {
  if (albums.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Star className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold">Albums</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar-on-main">
        <button
          onClick={() => onSelect(undefined)}
          className={`min-h-[112px] w-[150px] shrink-0 rounded-lg border p-3 text-left transition-colors ${
            !selectedAlbumId ? "border-primary bg-primary/10" : "bg-secondary/30 hover:bg-secondary/50"
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <Filter className="h-5 w-5 text-primary" />
            <div>
              <p className="font-bold">All Media</p>
              <p className="text-xs text-muted-foreground">Full library</p>
            </div>
          </div>
        </button>
        {albums.map((album) => (
          <div
            key={album.id}
            className={`group relative min-h-[112px] w-[170px] shrink-0 overflow-hidden rounded-lg border ${
              selectedAlbumId === album.id ? "border-primary" : "border-border"
            }`}
          >
            <button className="h-full w-full text-left" onClick={() => onSelect(album.id)}>
              {album.coverMedia?.url ? (
                <MediaPreview item={album.coverMedia} className="absolute inset-0 h-full w-full object-cover" muted />
              ) : (
                <div className="absolute inset-0 bg-secondary" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                <p className="font-bold">{album.title}</p>
                <p className="text-xs text-white/80">{album._count?.media || 0} items</p>
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="absolute right-2 top-2 h-8 w-8 opacity-90">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(album)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(album)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </section>
  );
}

function Highlights({
  recent,
  onThisDay,
  onOpen,
}: {
  recent: IMedia[];
  onThisDay: IMedia[];
  onOpen: (media: IMedia) => void;
}) {
  if (recent.length === 0 && onThisDay.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <HighlightStrip title="Recent uploads" items={recent} onOpen={onOpen} />
      <HighlightStrip title="On this day" items={onThisDay} onOpen={onOpen} />
    </div>
  );
}

function HighlightStrip({ title, items, onOpen }: { title: string; items: IMedia[]; onOpen: (media: IMedia) => void }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-lg font-bold">{title}</h2>
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar-on-main">
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpen(item)} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-secondary">
            <MediaPreview item={item} className="h-full w-full object-cover" muted />
            {item.mediaType === "VIDEO" && <Video className="absolute right-1 top-1 h-4 w-4 text-white drop-shadow" />}
          </button>
        ))}
      </div>
    </section>
  );
}

function MediaMasonry({
  media,
  albums,
  selectedAlbumId,
  onOpen,
  onFavorite,
  onDelete,
  onAddToAlbum,
  onRemoveFromAlbum,
  onMoveInAlbum,
}: {
  media: IMedia[];
  albums: IAlbum[];
  selectedAlbumId?: string;
  onOpen: (media: IMedia) => void;
  onFavorite: (media: IMedia) => void;
  onDelete: (media: IMedia) => void;
  onAddToAlbum: (albumId: string, mediaId: string) => void;
  onRemoveFromAlbum: (mediaId: string) => void;
  onMoveInAlbum: (mediaId: string, direction: -1 | 1) => void;
}) {
  return (
    <Masonry breakpointCols={breakpointColumns} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
      {media.map((item, index) => (
        <div key={item.id} className="mb-4">
          <MediaTile
            item={item}
            albums={albums}
            selectedAlbumId={selectedAlbumId}
            isFirst={index === 0}
            isLast={index === media.length - 1}
            onOpen={onOpen}
            onFavorite={onFavorite}
            onDelete={onDelete}
            onAddToAlbum={onAddToAlbum}
            onRemoveFromAlbum={onRemoveFromAlbum}
            onMoveInAlbum={onMoveInAlbum}
          />
        </div>
      ))}
    </Masonry>
  );
}

function MediaTile({
  item,
  albums,
  selectedAlbumId,
  isFirst,
  isLast,
  onOpen,
  onFavorite,
  onDelete,
  onAddToAlbum,
  onRemoveFromAlbum,
  onMoveInAlbum,
}: {
  item: IMedia;
  albums: IAlbum[];
  selectedAlbumId?: string;
  isFirst: boolean;
  isLast: boolean;
  onOpen: (media: IMedia) => void;
  onFavorite: (media: IMedia) => void;
  onDelete: (media: IMedia) => void;
  onAddToAlbum: (albumId: string, mediaId: string) => void;
  onRemoveFromAlbum: (mediaId: string) => void;
  onMoveInAlbum: (mediaId: string, direction: -1 | 1) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      <button className="block w-full" onClick={() => onOpen(item)}>
        <MediaPreview item={item} className="max-h-[420px] min-h-[180px] w-full object-cover" muted />
      </button>
      <div className="absolute left-2 top-2 flex gap-1">
        <Badge variant="secondary" className="bg-background/85 backdrop-blur">
          {item.mediaType === "VIDEO" ? "Video" : "Photo"}
        </Badge>
        {item.isFavorite && (
          <Badge variant="secondary" className="bg-background/85 text-rose-500 backdrop-blur">
            <Heart className="mr-1 h-3 w-3 fill-current" />
            Favorite
          </Badge>
        )}
      </div>
      <div className="absolute right-2 top-2 flex gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onFavorite(item)}>
          <Heart className={`h-4 w-4 ${item.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </Button>
        <MediaMenu
          item={item}
          albums={albums}
          selectedAlbumId={selectedAlbumId}
          isFirst={isFirst}
          isLast={isLast}
          onAddToAlbum={onAddToAlbum}
          onRemoveFromAlbum={onRemoveFromAlbum}
          onMoveInAlbum={onMoveInAlbum}
          onDelete={onDelete}
        />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold">{item.filename}</p>
        <p className="text-xs text-muted-foreground">{formatDate(item.capturedAt || item.createdAt)}</p>
      </div>
    </div>
  );
}

function MediaMenu({
  item,
  albums,
  selectedAlbumId,
  isFirst,
  isLast,
  onAddToAlbum,
  onRemoveFromAlbum,
  onMoveInAlbum,
  onDelete,
}: {
  item: IMedia;
  albums: IAlbum[];
  selectedAlbumId?: string;
  isFirst: boolean;
  isLast: boolean;
  onAddToAlbum: (albumId: string, mediaId: string) => void;
  onRemoveFromAlbum: (mediaId: string) => void;
  onMoveInAlbum: (mediaId: string, direction: -1 | 1) => void;
  onDelete: (media: IMedia) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={item.url} download target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </DropdownMenuItem>
        {selectedAlbumId ? (
          <>
            <DropdownMenuItem disabled={isFirst} onClick={() => onMoveInAlbum(item.id, -1)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Move earlier
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onClick={() => onMoveInAlbum(item.id, 1)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Move later
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRemoveFromAlbum(item.id)}>
              <X className="mr-2 h-4 w-4" />
              Remove from album
            </DropdownMenuItem>
          </>
        ) : (
          albums.map((album) => (
            <DropdownMenuItem key={album.id} onClick={() => onAddToAlbum(album.id, item.id)}>
              <Plus className="mr-2 h-4 w-4" />
              {album.title}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MediaViewer({
  media,
  albums,
  onClose,
  onFavorite,
  onDelete,
  onAddToAlbum,
  onRemoveFromAlbum,
}: {
  media: IMedia;
  albums: IAlbum[];
  onClose: () => void;
  onFavorite: (media: IMedia) => void;
  onDelete: (media: IMedia) => void;
  onAddToAlbum: (albumId: string, mediaId: string) => void;
  onRemoveFromAlbum?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid bg-background/95 backdrop-blur md:grid-cols-[1fr_340px]">
      <div className="relative flex min-h-0 items-center justify-center bg-black">
        <Button size="icon" variant="secondary" className="absolute right-3 top-3 z-10" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <MediaPreview item={media} className="max-h-full max-w-full object-contain" controls />
      </div>
      <aside className="overflow-y-auto border-l bg-background p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">{media.filename}</h2>
            <p className="text-xs text-muted-foreground">{formatDate(media.capturedAt || media.createdAt)}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onFavorite(media)}>
            <Heart className={`mr-2 h-4 w-4 ${media.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            {media.isFavorite ? "Unfavorite" : "Favorite"}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={media.url} download target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(media)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
        <div className="mb-5 space-y-2">
          <Label>Add to album</Label>
          <Select onValueChange={(albumId) => onAddToAlbum(albumId, media.id)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose album" />
            </SelectTrigger>
            <SelectContent>
              {albums.map((album) => (
                <SelectItem key={album.id} value={album.id}>
                  {album.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {onRemoveFromAlbum && (
            <Button className="w-full" variant="outline" onClick={onRemoveFromAlbum}>
              Remove from current album
            </Button>
          )}
        </div>
        <div className="space-y-3 rounded-lg border p-3">
          <MetadataRow label="Type" value={media.mediaType === "VIDEO" ? "Video" : "Photo"} />
          <MetadataRow label="MIME" value={media.mimeType} />
          <MetadataRow label="Size" value={formatBytes(media.size)} />
          <MetadataRow label="Dimensions" value={media.width && media.height ? `${media.width} x ${media.height}` : "Unavailable"} />
          <MetadataRow label="Duration" value={media.duration ? `${Math.round(media.duration)}s` : "Unavailable"} />
          <MetadataRow label="Format" value={media.format || "Unavailable"} />
          <MetadataRow label="Location" value={media.location || "Unavailable"} />
          <MetadataRow label="Captured" value={media.capturedAt ? formatDate(media.capturedAt) : "Unavailable"} />
          <MetadataRow label="Uploaded" value={formatDate(media.createdAt)} />
        </div>
      </aside>
    </div>
  );
}

function AlbumDialog({
  open,
  onOpenChange,
  album,
  media,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: IAlbum | null;
  media: IMedia[];
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{album ? "Edit album" : "Create album"}</DialogTitle>
        </DialogHeader>
        <AlbumDialogForm
          key={`${open}-${album?.id || "new"}`}
          album={album}
          media={media}
          onCancel={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

function AlbumDialogForm({
  album,
  media,
  onCancel,
  onSaved,
}: {
  album: IAlbum | null;
  media: IMedia[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(album?.title || "");
  const [description, setDescription] = useState(album?.description || "");
  const [coverMediaId, setCoverMediaId] = useState<string>(album?.coverMediaId || "NONE");

  const handleSave = async () => {
    const payload = {
      title,
      description: description || undefined,
      coverMediaId: coverMediaId === "NONE" ? undefined : coverMediaId,
    };
    const result = album
      ? await updateAlbum({ id: album.id, ...payload, coverMediaId: coverMediaId === "NONE" ? null : coverMediaId })
      : await createAlbum(payload);

    if (!result.success) {
      toast.error(result.error?.message || "Failed to save album");
      return;
    }
    toast.success(album ? "Album updated" : "Album created");
    onSaved();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Summer trip" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label>Cover</Label>
          <Select value={coverMediaId} onValueChange={setCoverMediaId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">No cover</SelectItem>
              {media.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!title.trim()}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}

function MediaPreview({
  item,
  className,
  controls,
  muted,
}: {
  item: IMedia;
  className?: string;
  controls?: boolean;
  muted?: boolean;
}) {
  if (item.mediaType === "VIDEO") {
    return (
      <video
        src={item.url}
        className={className}
        controls={controls}
        muted={muted}
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <Image
      src={item.url}
      alt={item.filename}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, 50vw"
      className={className}
    />
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[190px] break-words text-right font-medium">{value}</span>
    </div>
  );
}

function EmptyAlbumState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      {hasFilters ? <Search className="mb-3 h-8 w-8 text-muted-foreground" /> : <Eye className="mb-3 h-8 w-8 text-muted-foreground" />}
      <h2 className="text-lg font-bold">{hasFilters ? "No media found" : "No media yet"}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasFilters ? "Try a different search, date, type, album, or favorite filter." : "Upload photos and videos to start your personal library."}
      </p>
    </div>
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
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
