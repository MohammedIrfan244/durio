import { INoteFolder } from "@/types/note";
import { NoteFolderCard } from "./cards/note-folder-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Home, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface FolderShelfProps {
  folders: INoteFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onEditFolder: (folder: INoteFolder) => void;
  onDeleteFolder: (folder: INoteFolder) => void;
  onRestoreFolder?: (folder: INoteFolder) => void;
}

export function FolderShelf({
  folders,
  selectedFolderId,
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
  onRestoreFolder
}: FolderShelfProps) {
  
  if (folders.length === 0) return null;

  return (
    <div>
      <div className="flex items-center group nav-item-group">
        <h2 className="text-lg font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          Your Folders
        </h2>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max space-x-4 pr-4 sm:pr-1 items-end py-2 relative">
          {/* All Notes Home Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "nav-item-group relative flex min-w-[110px] cursor-pointer flex-col justify-center items-center rounded-xl border-2 p-3 transition-all duration-300 h-[100px] group",
              "border-dashed hover:border-primary",
              selectedFolderId === null 
                ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-95" 
                : "border-border/60 bg-card/50 hover:bg-card"
            )}
            onClick={() => onSelectFolder(null)}
          >
            {/* Decorative circles */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" 
                 style={{ animationDelay: '0.5s' }} 
            />
            
            {/* Home Icon */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 mb-2",
              "bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm",
              "group-hover:scale-110 group-hover:rotate-6"
            )}>
              <Home className={cn(
                "h-6 w-6 transition-all duration-300",
                selectedFolderId === null ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            
            <span className={cn(
              "font-bold text-sm transition-all duration-300",
              selectedFolderId === null ? "text-primary" : "text-foreground/80 group-hover:text-primary"
            )}>
              All Notes
            </span>
            
            {/* Animated underline when selected */}
            {selectedFolderId === null && (
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
              />
            )}

            {/* Hover glow effect */}
            <div 
              className={cn(
                "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none blur-xl -z-10",
                "group-hover:opacity-100"
              )}
              style={{
                background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.3), transparent 70%)'
              }}
            />
          </motion.div>

          {/* Folder Cards */}
          {folders.map((folder) => (
            <NoteFolderCard
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              onClick={() => onSelectFolder(folder.id === selectedFolderId ? null : folder.id)}
              onEdit={onEditFolder}
              onDelete={onDeleteFolder}
              onRestore={onRestoreFolder}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}