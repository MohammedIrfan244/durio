"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, FileText, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QuickNote } from "@/types/note";

interface QuickNoteItemProps {
  note: QuickNote;
  onEdit: (note: QuickNote) => void;
  onDelete: (id: string) => void;
}

export function QuickNoteItem({ note, onEdit, onDelete }: QuickNoteItemProps) {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(note.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 5000);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all hover:bg-accent/50 group",
      )}
    >
      <div className="text-muted-foreground">
        <FileText className="h-5 w-5" />
      </div>

      <span className="flex-1 text-sm font-medium break-all whitespace-pre-wrap">
        {note.text}
      </span>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-pointer">
              <Copy className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" onClick={handleCopy} />
            </TooltipTrigger>
            <TooltipContent>
              {isCopied ? "Copied" : "Copy"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => onEdit(note)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
