"use client";

import { Filter, ImagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "@/components/shared/header-search";
import { cn } from "@/lib/utils";

interface HeaderSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  onCreateAlbum: () => void;
  onUploadMedia: () => void;
  selectedAlbumTitle?: string;
}

export function HeaderSection({
  searchValue,
  onSearchChange,
  filtersExpanded,
  onToggleFilters,
  onCreateAlbum,
  onUploadMedia,
  selectedAlbumTitle,
}: HeaderSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 2: Upload + Create Album */}
      <div className="flex flex-wrap justify-end items-center gap-2">
        <Button
          variant="default"
          className="gap-2 font-semibold transition-all duration-300 hover:shadow-lg flex-1 sm:flex-initial"
          onClick={onUploadMedia}
        >
          <ImagePlus className="h-4 w-4" />
          <span>
            {selectedAlbumTitle
              ? `Add to "${selectedAlbumTitle}"`
              : "Add photos & videos"}
          </span>
        </Button>
        <Button
          variant="outline"
          className="gap-2 transition-all duration-300 hover:bg-primary/10 hover:text-primary flex-1 sm:flex-initial"
          onClick={onCreateAlbum}
        >
          <Plus className="h-4 w-4" />
          <span>New album</span>
        </Button>
      </div>

      {/* Row 1: Search + Filter Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <HeaderSearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search your memories..."
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 transition-all duration-300",
            filtersExpanded && "bg-primary/10 text-primary",
          )}
          onClick={onToggleFilters}
          aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
          aria-expanded={filtersExpanded}
        >
          {filtersExpanded ? (
            <X className="h-4 w-4" />
          ) : (
            <Filter className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
