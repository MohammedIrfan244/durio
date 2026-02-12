'use client";';
import { INote } from "@/types/note";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, FolderInput, RotateCcw , Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";

interface NoteCardProps {
  note: INote;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectionMode: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: (note: INote) => void;
  onDelete?: (note: INote) => void;
  onRestore?: (note: INote) => void;
  onMove?: (note: INote) => void;
  isArchivedView?: boolean;
}

export function NoteCard({
  note,
  isExpanded,
  onToggleExpand,
  selectionMode,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onRestore,
  onMove,
  isArchivedView,
}: NoteCardProps) {
  const noteColor = note.color || "#fbbf24";

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [note.description, isExpanded]);

  const copyDescription = ()=>{
    if(!descriptionRef.current) return;
    const text = descriptionRef.current.innerText;
    navigator.clipboard.writeText(text);

    setIsCopied(true);

    setTimeout(()=>{
      setIsCopied(false);
    },5000)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "group relative flex flex-col rounded-lg hover:scale-[1.02] hover:rotate-1 transition-all duration-100 ease-in-out",
        "hover:shadow-md",
        !selectionMode && "cursor-pointer",
        isSelected && "ring-2 ring-primary",
        "md:min-h-[280px] md:aspect-[1/1.4]",
        isExpanded ? "min-h-[280px]" : "min-h-[140px]",
      )}
      style={{
        backgroundColor: `${noteColor}15`,
        borderColor: `${noteColor}40`,
        borderWidth: "1px",
        borderStyle: "solid",
      }}
      onClick={selectionMode ? onToggleSelect : onToggleExpand}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute right-3 top-3 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.()}
            className="bg-background shadow-sm"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto hide-scrollbar-on-main">
        {/* Heading and Copy button*/}
        <div className="flex w-full items-center justify-start gap-5 hover:text-primary transition-colors">
        <h3
          className={cn(
            "font-bold tracking-tight break-words transition-all duration-300",
            isExpanded ? "text-lg" : "text-base",
            selectionMode && "pr-8",
          )}
        >
          {note.heading}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Copy className="h-4 w-4" onClick={copyDescription} />
            </TooltipTrigger>
            <TooltipContent>
              {isCopied ? "Copied" : "Copy"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <div
            ref={descriptionRef}
            className={cn(
              "text-sm text-foreground/80 break-words whitespace-pre-wrap transition-all duration-300",
              !isExpanded && "line-clamp-5 md:line-clamp-12",
            )}
          >
            {note.description}
          </div>

          {!isExpanded && isOverflowing && (
            <div className="text-xs text- font-semibold hover:text-primary transition-colors">
              Click to read more...
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <AnimatePresence mode="sync">
        {(isExpanded || isArchivedView) && !selectionMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="border-t px-4 py-2 flex justify-end gap-1 items-center bg-background/30 rounded-b-lg overflow-hidden"
            style={{ borderTopColor: `${noteColor}40` }}
            onClick={(e) => e.stopPropagation()}
          >
            {isArchivedView ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.(note);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(note);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(note);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit note ✏️</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-all active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove?.(note);
                        }}
                      >
                        <FolderInput className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Move to folder 📂</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-all active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(note);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete note 🗑️</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
