import { useState } from "react";
import { INote } from "@/types/note";
import { NoteCard } from "./note-card";
import Masonry from "react-masonry-css";

interface NoteGridProps {
  notes: INote[];
  selectionMode: boolean;
  selectedNoteIds: string[];
  onToggleSelectNote: (noteId: string) => void;
  onEditNote: (note: INote) => void;
  onDeleteNote: (note: INote) => void;
  onRestoreNote?: (note: INote) => void;
  onMoveNote?: (note: INote) => void;
  isArchivedView?: boolean;
}

export function NoteGrid({
  notes,
  selectionMode,
  selectedNoteIds,
  onToggleSelectNote,
  onEditNote,
  onDeleteNote,
  onRestoreNote,
  onMoveNote,
  isArchivedView
}: NoteGridProps) {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const handleToggleExpand = (noteId: string) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  const breakpointColumns = {
    default: 6, // xl and above
    1280: 5, // lg
    1024: 4, // md
    768: 2,  // sm
    640: 1   // xs
  };

  if (notes.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
        <p>{isArchivedView ? "No archived notes" : "No notes found"}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {notes.map(note => (
          <div key={note.id} className="mb-4">
            <NoteCard
              note={note}
              isExpanded={expandedNoteId === note.id}
              onToggleExpand={() => handleToggleExpand(note.id)}
              selectionMode={selectionMode}
              isSelected={selectedNoteIds.includes(note.id)}
              onToggleSelect={() => onToggleSelectNote(note.id)}
              onEdit={onEditNote}
              onDelete={onDeleteNote}
              onRestore={onRestoreNote}
              onMove={onMoveNote}
              isArchivedView={isArchivedView}
            />
          </div>
        ))}
      </Masonry>
      

    </div>
  );
}