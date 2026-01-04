"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { INote, INoteFolder } from "@/types/note";
import { 
    getFolders, 
    searchNotesAndFolders, 
    searchArchivedNotes,
    getArchivedFolders,
    bulkSoftDeleteNotes,
    bulkDeleteNotes,
    restoreNoteFromArchive,
    restoreAllFromArchive,
    moveNote,
    restoreNoteFolder,
} from "@/server/actions/note-action";
import { NoteHeader } from "./note-header";
import { FolderShelfSkeleton } from "@/components/skelton/note/folder-shelf-skeleton";
import { NoteGridSkeleton } from "@/components/skelton/note/note-grid-skeleton";
import { FolderShelf } from "./folder-shelf";

import { NoteGrid } from "./note-grid";
import NoteDialog from "./note-dialogue";
import FolderDialog from "./folder-dialogue";
import { toast } from "sonner";
import { NoteRestoreDialog } from "./note-restore-dialogue";
import { NoteMoveDialog } from "./note-move-dialogue";
import { FolderRestoreDialog } from "./folder-restore-dialogue";
import NoteDeleteDialog from "./note-delete-dialogue";
import FolderDeleteDialog from "./folder-delete-dialogue";
import NoteBulkDeleteDialog from "./note-bulk-delete-dialogue";

export default function Note() {
  // --- State ---
  const [activeNotes, setActiveNotes] = useState<INote[]>([]);
  const [folders, setFolders] = useState<INoteFolder[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<INote[]>([]);
  const [archiveMode, setArchiveMode] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Dialog States ---
  const [openCreateNote, setOpenCreateNote] = useState(false);
  const [openCreateFolder, setOpenCreateFolder] = useState(false);
  
  const [editingNote, setEditingNote] = useState<INote | null>(null);
  const [deletingNote, setDeletingNote] = useState<INote | null>(null);
  const [restoringNote, setRestoringNote] = useState<INote | null>(null);
  const [isRestoringAll, setIsRestoringAll] = useState(false);
  const [movingNote, setMovingNote] = useState<INote | null>(null);
  
  const [editingFolder, setEditingFolder] = useState<INoteFolder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<INoteFolder | null>(null);
  const [restoringFolder, setRestoringFolder] = useState<INoteFolder | null>(null);

  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // --- Data Loading ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        if (archiveMode) {
            // Load Archived Data
            const query = debouncedSearch || "";
            const archivedNotesRes = await searchArchivedNotes(query);
            const archivedFoldersRes = await getArchivedFolders();
            setArchivedNotes((archivedNotesRes.data as unknown as INote[]) || []);
            setFolders(archivedFoldersRes.data || []);
            setActiveNotes([]);
        } else {
            // Load Active Data
            if (debouncedSearch) {
                // Search Mode
                const searchRes = await searchNotesAndFolders(debouncedSearch);
                if (searchRes.data) {
                    setActiveNotes(searchRes.data.notes as unknown as INote[]);
                    setFolders(searchRes.data.folders);
                }
            } else {
                // Default View
                const foldersRes = await getFolders();
                setFolders(foldersRes.data || []);
                const mod = await import("@/server/actions/note-action");
                if (selectedFolderId) {
                  const notesRes = await mod.getNotes(selectedFolderId);
                  setActiveNotes(notesRes.data as unknown as INote[] || []);
                } else {
                  const notesRes = await mod.getNotes(undefined);
                  setActiveNotes(notesRes.data as unknown as INote[] || []);
                }
            }
        }
    } catch (e) {
        toast.error("Failed to load data");
    } finally {
        setLoading(false);
    }
  }, [archiveMode, debouncedSearch, selectedFolderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // --- Actions ---

  const handleCreateNote = () => {
      setEditingNote(null);
      setOpenCreateNote(true);
  };
  
  const handleCreateFolder = () => {
      setEditingFolder(null);
      setOpenCreateFolder(true);
  };

  const handleEditNote = (note: INote) => {
      setEditingNote(note);
      setOpenCreateNote(true);
  };

  const handleDeleteNote = (note: INote) => {
      setDeletingNote(note);
  };

  const handleEditFolder = (folder: INoteFolder) => {
      setEditingFolder(folder);
      setOpenCreateFolder(true);
  };

  const handleDeleteFolder = (folder: INoteFolder) => {
      setDeletingFolder(folder);
  };
  
  const handleRestoreFolder = (folder: INoteFolder) => {
     setRestoringFolder(folder);
  };
  
  const performRestoreFolder = async () => {
     if (!restoringFolder) return;
     await restoreNoteFolder(restoringFolder.id);
     toast.success("Folder restored");
     setRestoringFolder(null);
     loadData();
  };

  const handleToggleSelectNote = (id: string) => {
      setSelectedNoteIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const handleBulkDelete = () => {
      if (selectedNoteIds.length > 0) setConfirmBulkDelete(true);
  };

  const performBulkDelete = async () => {
      startTransition(async () => {
          if (archiveMode) {
              await bulkDeleteNotes(selectedNoteIds);
              toast.success("Notes permanently deleted");
          } else {
              await bulkSoftDeleteNotes(selectedNoteIds);
              toast.success("Notes archived");
          }
          setSelectedNoteIds([]);
          setSelectionMode(false);
          setConfirmBulkDelete(false);
          loadData(); // Reload
          // Or separate reload
          if(!debouncedSearch && !archiveMode) {
               // manual reload trigger? relying on useEffect deps might not be enough if state didn't change
               // I'll reuse the effect logic by toggling something or just force calling the internal fetch
               // Simplest: just call loadData() but loadData might be stale for active view if I used the separate effect.
               // I'll make loadData comprehensive or just reload page? No, reload state.
               const mod = await import("@/server/actions/note-action");
               const res = await mod.getNotes(selectedFolderId || undefined);
               setActiveNotes(res.data as unknown as INote[] || []);
          } else {
              loadData();
          }
      });
  };

  const handleRestoreNote = async (note: INote) => {
       setRestoringNote(note);
  };
  
  const performRestoreNote = async () => {
    if (!restoringNote) return;
    await restoreNoteFromArchive(restoringNote.id);
    toast.success("Note restored");
    setRestoringNote(null);
    loadData();
  };

  const handleRestoreAll = () => {
       setIsRestoringAll(true);
  };

  const performRestoreAll = async () => {
       await restoreAllFromArchive();
       toast.success("All notes restored");
       setIsRestoringAll(false);
       loadData();
  };

  const handleMoveNote = (note: INote) => {
      setMovingNote(note);
  };

  const performMoveNote = async (noteId: string, folderId: string | null) => {
       await moveNote({ noteId, folderId });
       toast.success("Note moved");
       loadData();
  };

  return (
    <div className="section-wrapper">
       <NoteHeader
        search={search}
        setSearch={setSearch}
        archiveMode={archiveMode}
        setArchiveMode={setArchiveMode}
        selectionMode={selectionMode}
        setSelectionMode={(val) => {
            setSelectionMode(val);
            if (!val) setSelectedNoteIds([]);
        }}
        selectedCount={selectedNoteIds.length}
        onOpenCreateNote={handleCreateNote}
        onOpenCreateFolder={handleCreateFolder}
        onBulkDelete={handleBulkDelete}
        onRestoreAll={handleRestoreAll}
        // onBulkRestore // Implement if needed
        headerTitle={selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "Notes"}
        onBack={selectedFolderId ? () => setSelectedFolderId(null) : undefined}
      />

      {(loading && !debouncedSearch) ? (
          <div className="space-y-6">
              <FolderShelfSkeleton />
              <NoteGridSkeleton />
          </div>
      ) : (
          <div className="space-y-6"> 
            
            {/* Folder Shelf logic ... keeping same */}
            {!archiveMode && !search && (
                <FolderShelf 
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                    onEditFolder={handleEditFolder}
                    onDeleteFolder={handleDeleteFolder}
                />
            )}
            
            {(search && folders.length > 0) && (
                 <FolderShelf 
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                    onEditFolder={handleEditFolder}
                    onDeleteFolder={handleDeleteFolder}
                />
            )}
            
            {(archiveMode && folders.length > 0) && (
                 <div className="mb-4">
                     <h3 className="tex-sm font-muted mb-2">Archived Folders</h3>
                     <FolderShelf 
                        folders={folders}
                        selectedFolderId={null} 
                        onSelectFolder={() => {}} 
                        onEditFolder={() => {}} 
                        onDeleteFolder={handleDeleteFolder} 
                        onRestoreFolder={handleRestoreFolder}
                     />
                 </div>
            )}

            <NoteGrid
                notes={archiveMode ? archivedNotes : activeNotes}
                selectionMode={selectionMode}
                selectedNoteIds={selectedNoteIds}
                onToggleSelectNote={handleToggleSelectNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                onRestoreNote={handleRestoreNote}
                onMoveNote={handleMoveNote} 
                isArchivedView={archiveMode}
            />
          </div>
      )}

      {/* Dialogs */}
      <NoteDialog 
        open={openCreateNote} 
        onOpenChange={setOpenCreateNote} 
        noteId={editingNote?.id}
        defaultFolderId={selectedFolderId}
        onSaved={() => {
             setOpenCreateNote(false);
             loadData();
        }}
      />

      <FolderDialog
        open={openCreateFolder}
        onOpenChange={setOpenCreateFolder}
        folderId={editingFolder?.id}
        onSaved={() => {
            setOpenCreateFolder(false);
            loadData();
        }}
      />
      
      {deletingNote && (
          <NoteDeleteDialog 
             isOpen={!!deletingNote}
             setOpen={(open) => !open && setDeletingNote(null)}
             noteId={deletingNote.id}
             isSoftDelete={!archiveMode} 
             onSuccess={() => {
                 setDeletingNote(null);
                  loadData();
             }}
          />
      )}

      {restoringNote && (
          <NoteRestoreDialog 
              isOpen={!!restoringNote}
              setOpen={(open) => !open && setRestoringNote(null)}
              onRestore={performRestoreNote}
              noteTitle={restoringNote.heading}
          />
      )}
      
       {deletingFolder && (
          <FolderDeleteDialog 
             isOpen={!!deletingFolder}
             setOpen={(open) => !open && setDeletingFolder(null)}
             folderId={deletingFolder.id}
             isSoft={!archiveMode}
             onSuccess={() => {
                 setDeletingFolder(null);
                 loadData();
             }}
          />
      )}

      {confirmBulkDelete && (
           <NoteBulkDeleteDialog
              isOpen={confirmBulkDelete}
              setOpen={setConfirmBulkDelete}
              ids={selectedNoteIds}
              onSuccess={() => {
                   setConfirmBulkDelete(false);
                   setSelectedNoteIds([]);
                   setSelectionMode(false);
                   loadData();
              }}
              isSoft={!archiveMode}
           />
      )}

      {isRestoringAll && (
          <NoteRestoreDialog 
             isOpen={isRestoringAll}
             setOpen={setIsRestoringAll}
             onRestore={performRestoreAll}
             noteTitle="all archived notes"
          />
      )}

       {restoringFolder && (
           <FolderRestoreDialog
              isOpen={!!restoringFolder}
              setOpen={(open) => !open && setRestoringFolder(null)}
              folderName={restoringFolder.name}
              onRestore={performRestoreFolder}
           />
       )}

      {movingNote && (
          <NoteMoveDialog 
              isOpen={!!movingNote}
              setOpen={(open) => !open && setMovingNote(null)}
              note={movingNote}
              folders={folders}
              onMove={performMoveNote}
          />
      )}

    </div>
  );
}
