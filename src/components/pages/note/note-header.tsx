import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Plus, 
    Archive, 
    CheckSquare, 
    Trash2, 
    FolderPlus, 
    FileText, 
    ArrowLeft, 
    RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { HeaderSearch } from "@/components/shared/header-search";

interface NoteHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  archiveMode: boolean;
  setArchiveMode: (value: boolean) => void;
  selectionMode: boolean;
  setSelectionMode: (value: boolean) => void;
  selectedCount: number;
  onOpenCreateNote: () => void;
  onOpenCreateFolder: () => void;
  onBulkDelete: () => void;
  onBulkRestore?: () => void;
  onRestoreAll?: () => void; 
  headerTitle?: string;
  onBack?: () => void; 
}

export function NoteHeader({
  search,
  setSearch,
  archiveMode,
  setArchiveMode,
  selectionMode,
  setSelectionMode,
  selectedCount,
  onOpenCreateNote,
  onOpenCreateFolder,
  onBulkDelete,
  onBulkRestore,
  onRestoreAll,
  onBack
}: NoteHeaderProps) {
  return (
    <SectionHeaderWrapper className="mb-6">
        <div className="flex flex-col gap-4">
          {/* Top Row: Back Button, Search & Primary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            
            {/* Search Bar with Back Button */}
            <div className="flex-1 relative group nav-item-group flex items-center gap-2">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack} 
                  className="shrink-0 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              
              <HeaderSearch 
                value={search}
                onChange={setSearch}
                placeholder={archiveMode ? "Search in archive..." : "What are you looking for?"}
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-row-reverse items-center justify-between gap-2 w-full md:w-auto">
              
              {/* Add Menu - Primary Action */}
              {!archiveMode && !selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 font-semibold group shadow-md hover:shadow-lg transition-all duration-300">
                      <Plus className="h-5 w-5 group-hover:rotate-180 ease-out transition-transform duration-600" />
                      <span className="hidden sm:inline">Add New</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onOpenCreateFolder} className="gap-2 cursor-pointer py-2">
                      <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                        <FolderPlus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Folder</span>
                        <span className="text-xs text-muted-foreground">Group your notes</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenCreateNote} className="gap-2 cursor-pointer py-2">
                      <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Note</span>
                        <span className="text-xs text-muted-foreground">Create a new note</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mode Toggle Cards */}
              <div className="flex items-center gap-2 flex-1 md:flex-initial">
                
                {/* Selection Mode Card */}
                <Card
                  className="flex-1 bg-secondary/30 p-2 border-border/40 transition-all cursor-pointer 
                         duration-300 hover:bg-secondary/50 hover:border-primary/20 group"
                  onClick={() => setSelectionMode(!selectionMode)}
                >
                  <CardContent className="flex items-center justify-between gap-3 py-0 px-1 md:px-2">
                    <Label
                      className="text-sm font-bold text-foreground/80 cursor-pointer 
                             transition-all duration-100 group-hover:scale-90 group-hover:text-primary whitespace-nowrap pointer-events-none"
                    >
                      Select Mode
                    </Label>
                    <Switch
                      checked={selectionMode}
                      className="pointer-events-none"
                    />
                  </CardContent>
                </Card>

                {/* Archive Mode Card */}
                {!selectionMode && (
                  <Card
                    className="flex-1 bg-secondary/30 p-2 border-border/40 transition-all cursor-pointer 
                           duration-300 hover:bg-secondary/50 hover:border-primary/20 group"
                    onClick={() => {
                      setArchiveMode(!archiveMode);
                      if (onBack) onBack();
                      setSelectionMode(false);
                    }}
                  >
                    <CardContent className="flex items-center justify-between gap-3 py-0 px-1 md:px-2">
                      <Label
                        className="text-sm font-bold text-foreground/80 cursor-pointer 
                               transition-all duration-100 group-hover:scale-90 group-hover:text-primary whitespace-nowrap pointer-events-none"
                      >
                        {archiveMode ? "Active Notes" : "Archive"}
                      </Label>
                      <Switch
                        checked={archiveMode}
                        className="pointer-events-none"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Selection Actions Bar */}
          <AnimatePresence>
            {selectionMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-secondary/30 border-border/40">
                  <CardContent className="flex items-center justify-between gap-4 py-3 px-4">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-primary" />
                      <span className="text-sm font-bold">
                        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {archiveMode && onBulkRestore && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={onBulkRestore} 
                          disabled={selectedCount === 0}
                          className="gap-2 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">Restore</span>
                        </Button>
                      )}

                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onBulkDelete} 
                        disabled={selectedCount === 0}
                        className="gap-2 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {archiveMode ? "Delete Permanently" : "Delete"}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Restore All Button - Only in Archive Mode */}
          {archiveMode && !selectionMode && onRestoreAll && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onRestoreAll}
                className="gap-2 transition-all duration-300 hover:bg-primary/10 hover:text-primary font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                Restore All Archived
              </Button>
            </div>
          )}
        </div>
    </SectionHeaderWrapper>
  );
}
