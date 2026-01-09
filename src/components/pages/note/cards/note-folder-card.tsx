import { INoteFolder } from "@/types/note";
import { Folder, Edit2, Trash2, RotateCcw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteFolderCardProps {
  folder: INoteFolder;
  isSelected?: boolean;
  onClick: () => void;
  onEdit?: (folder: INoteFolder) => void;
  onDelete?: (folder: INoteFolder) => void;
  onRestore?: (folder: INoteFolder) => void;
}

export function NoteFolderCard({ folder, isSelected, onClick, onEdit, onDelete, onRestore }: NoteFolderCardProps) {
  const IconComponent = folder.icon && (LucideIcons as any)[folder.icon] 
    ? (LucideIcons as any)[folder.icon] 
    : Folder;

  const noteCount = folder._count?.notes ?? 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "group relative flex min-w-[110px] cursor-pointer flex-col pt-3",
        isSelected && "z-50 scale-95"
      )}
    >
      {/* Peeking Notes - Only show when selected and has notes */}
      <AnimatePresence>
        {isSelected && noteCount > 0 && (
          <>
            {/* Back note */}
            <motion.div 
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -16, opacity: 1 }}
              exit={{ y: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-[75%] rounded-t-lg bg-background/60 border-x border-t border-border/60 shadow-sm"
              style={{ zIndex: 1 }}
            />
            {/* Front note */}
            <motion.div 
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -10, opacity: 1 }}
              exit={{ y: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-[85%] rounded-t-lg bg-background border-x border-t shadow-sm flex items-center justify-center"
              style={{ 
                zIndex: 2,
                borderColor: folder.color ? `${folder.color}60` : undefined 
              }}
            >
              <FileText 
                className="h-3 w-3 opacity-50" 
                style={{ color: folder.color || undefined }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Folder Tab */}
      <div 
        className={cn(
          "absolute top-1 left-2 h-3 w-10 rounded-t-md border-t border-x transition-all duration-300",
          isSelected 
            ? "border-primary shadow-sm" 
            : "border-border/60 group-hover:border-primary/50"
        )}
        style={{ 
          backgroundColor: folder.color 
            ? `${folder.color}30` 
            : 'hsl(var(--card))',
          borderTopColor: isSelected && folder.color ? folder.color : undefined
        }}
      />

      {/* Main Folder Body */}
      <div
        className={cn(
          "nav-item-group relative z-10 flex h-[100px] w-full flex-col justify-between rounded-xl rounded-tl-none border-2 p-2.5 transition-all duration-300 shadow-sm",
          isSelected
            ? "border-primary ring-2 ring-primary/20 bg-background shadow-lg scale-105"
            : "border-border/60 bg-card hover:border-primary/30 hover:shadow-md"
        )}
        style={
          folder.color 
          ? { 
              backgroundColor: isSelected ? `${folder.color}15` : `${folder.color}08`,
              borderColor: isSelected ? folder.color : undefined
            } 
          : undefined
        }
      >
        <div className="flex items-start justify-between">
          <div 
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
              "bg-background/80 shadow-sm group-hover:scale-110 group-hover:rotate-6"
            )}
          >
            <IconComponent 
              className={cn(
                "h-4 w-4 transition-all duration-300",
                isSelected && "scale-110"
              )} 
              style={{ color: folder.color || "inherit" }} 
            />
          </div>

          <div 
            className={cn(
              "flex gap-0.5 transition-all duration-300",
              isSelected || onRestore 
                ? "opacity-100" 
                : "opacity-0 md:opacity-0 md:group-hover:opacity-100"
            )} 
            onClick={(e) => e.stopPropagation()}
          >
            {onRestore ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300" 
                  onClick={() => onRestore(folder)}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive hover:bg-destructive/10 transition-all duration-300" 
                    onClick={() => onDelete(folder)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            ) : (
              <>
                {onEdit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 active:scale-95" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(folder);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Folder ✏️</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {onDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 transition-all duration-300 active:scale-95" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(folder);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Folder 🗑️</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className={cn(
            "font-bold text-sm truncate leading-tight tracking-tight transition-all duration-300",
            isSelected && "text-foreground scale-105"
          )}>
            {folder.name}
          </h3>
          <div className="flex items-center gap-1 mt-1.5">
            <div 
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-300",
                "bg-background/60 text-[10px] font-bold tracking-wide",
                isSelected && "ring-1 ring-primary/30"
              )}
            >
              <FileText 
                className="h-2.5 w-2.5" 
                style={{ color: folder.color || undefined }}
              />
              <span className="text-muted-foreground/80">
                {noteCount}
              </span>
            </div>
            
            {/* Pulsing dot when selected */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: folder.color || 'hsl(var(--primary))' }}
              />
            )}
          </div>
        </div>

        {/* Bottom glow line when selected */}
        {isSelected && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${folder.color || 'hsl(var(--primary))'}, transparent)`
            }}
          />
        )}
      </div>
    </motion.div>
  );
}