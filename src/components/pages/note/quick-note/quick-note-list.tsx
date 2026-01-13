"use client";

import React from "react";
import { QuickNoteItem, QuickNote } from "./quick-note-item";
import { QuickNoteClearDialog } from "../dialogs/quick-note-clear-dialog";

interface QuickNoteListProps {
  notes: QuickNote[];
  onEdit: (note: QuickNote) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function QuickNoteList({ notes, onEdit, onDelete, onClear }: QuickNoteListProps) {
  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto px-1">
      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No quick notes yet. Add one above!
        </div>
      ) : (
        <>
          {notes.map((note) => (
            <QuickNoteItem
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          
          <div className="flex justify-center pt-2">
            <QuickNoteClearDialog onConfirm={onClear} />
          </div>
        </>
      )}
    </div>
  );
}
