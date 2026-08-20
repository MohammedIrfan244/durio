"use client";

import { CalendarDays, Filter, Heart, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MediaTypeFilter = "ALL" | "IMAGE" | "VIDEO";
type ViewMode = "gallery" | "timeline";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: MediaTypeFilter;
  onMediaTypeChange: (value: MediaTypeFilter) => void;
  favoritesOnly: boolean;
  onFavoritesChange: (value: boolean) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
}

export function FilterPanel({
  isOpen,
  mediaType,
  onMediaTypeChange,
  favoritesOnly,
  onFavoritesChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  viewMode,
  onViewModeChange,
}: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="animate-slide-down">
      {/* Filter Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Filters & sorting</h3>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <div className="flex gap-2">

        {/* Date From */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">From</Label>
          <CalendarFilter value={dateFrom} onChange={onDateFromChange} placeholder="Start date" />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">To</Label>
          <CalendarFilter value={dateTo} onChange={onDateToChange} placeholder="End date" />
        </div>
        </div>

<div className="flex gap-2">
          {/* Media Type */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">What type?</Label>
          <Select value={mediaType} onValueChange={onMediaTypeChange}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Everything" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Everything</SelectItem>
              <SelectItem value="IMAGE">Photos only</SelectItem>
              <SelectItem value="VIDEO">Videos only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Favorites */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">&nbsp;</Label>
          <Button
            variant={favoritesOnly ? "secondary" : "outline"}
            className={cn("h-10 gap-2 w-full justify-center transition-all duration-300")}
            onClick={() => onFavoritesChange(!favoritesOnly)}
          >
            <Heart className={cn("h-4 w-4", favoritesOnly && "fill-rose-500 text-rose-500")} />
            <span className="text-sm font-medium">Loved only</span>
          </Button>
        </div>

        {/* View Mode */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Layout</Label>
          <div className="flex rounded-md border bg-background p-1">
            <Button
              size="sm"
              variant={viewMode === "gallery" ? "secondary" : "ghost"}
              className="gap-1.5"
              onClick={() => onViewModeChange("gallery")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "timeline" ? "secondary" : "ghost"}
              className="gap-1.5"
              onClick={() => onViewModeChange("timeline")}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function CalendarFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start gap-2 bg-secondary/30 text-left font-normal hover:bg-secondary/50"
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {selected ? formatCalendarDate(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" matchTriggerWidth={false}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? toDateInputValue(date) : "")}
        />
        {value && (
          <div className="border-t border-border/40 p-2">
            <Button className="w-full" size="sm" variant="ghost" onClick={() => onChange("")}>
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function formatCalendarDate(value: Date) {
  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}