"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickNote {
  id: string;
  text: string;
}

interface QuickNoteItemProps {
  note: QuickNote;
  onEdit: (note: QuickNote) => void;
  onDelete: (id: string) => void;
}

export function QuickNoteItem({ note, onEdit, onDelete }: QuickNoteItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all hover:bg-accent/50 group"
      )}
    >
      <div className="text-muted-foreground">
         <FileText className="h-5 w-5" />
      </div>
      
      <span className="flex-1 text-sm font-medium break-all whitespace-pre-wrap">
        {note.text}
      </span>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
