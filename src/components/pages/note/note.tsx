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
import NoteDialog from "./dialogs/note-dialogue";
import FolderDialog from "./dialogs/folder-dialogue";
import { toast } from "sonner";
import { NoteRestoreDialog } from "./dialogs/note-restore-dialogue";
import { NoteMoveDialog } from "./dialogs/note-move-dialogue";
import { FolderRestoreDialog } from "./dialogs/folder-restore-dialogue";
import NoteDeleteDialog from "./dialogs/note-delete-dialogue";
import FolderDeleteDialog from "./dialogs/folder-delete-dialogue";
import NoteBulkDeleteDialog from "./dialogs/note-bulk-delete-dialogue";

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
  
  const [loading, setLoading] = useState(true); // Initial load
  const [loadingMoreNotes, setLoadingMoreNotes] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Pagination State
  const [notePage, setNotePage] = useState(1);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);
  const [folderPage, setFolderPage] = useState(1);
  // Folder pagination might be less critical but let's be consistent
  
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
  
  // Reset pagination when view context changes
  useEffect(() => {
    setNotePage(1);
    setHasMoreNotes(true);
    setFolderPage(1);
    // Trigger load
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveMode, debouncedSearch, selectedFolderId]);

  const loadData = useCallback(async (reset = false) => {
    if (reset) {
        setLoading(true);
    }
    
    try {
        if (archiveMode) {
            // Load Archived Data (No pagination implemented for archive search yet in backend properly for this view, keeping as is/simple)
            // But we modified backend actions? No, we modified 'getNotes' and 'getFolders'. 
            // 'searchArchivedNotes' was not modified. 'getArchivedFolders' was not modified.
            // So we effectively fetch all archived. That's consistent with "whichever is faster".
            
            const query = debouncedSearch || "";
            const archivedNotesRes = await searchArchivedNotes(query);
            const archivedFoldersRes = await getArchivedFolders();
            setArchivedNotes((archivedNotesRes.data as unknown as INote[]) || []);
            setFolders(archivedFoldersRes.data || []);
            setActiveNotes([]);
        } else {
            // Active Data
            const noteLimit = 20;
            const folderLimit = 20;

            if (debouncedSearch) {
                // Search Mode (Backend search doesn't paginate yet, returns all/limited)
                const searchRes = await searchNotesAndFolders(debouncedSearch);
                if (searchRes.data) {
                    setActiveNotes(searchRes.data.notes as unknown as INote[]);
                    setFolders(searchRes.data.folders);
                }
                setHasMoreNotes(false); // Disable infinite scroll for search for now
            } else {
                // Default View
                const mod = await import("@/server/actions/note-action");
                
                // Load Folders (only on reset/initial)
                if (reset) {
                    const foldersRes = await getFolders({ page: 1, limit: folderLimit });
                    setFolders(foldersRes.data || []);
                }
                
                // Load Notes
                const currentPage = reset ? 1 : notePage;
                const notesRes = await mod.getNotes({ 
                    folderId: selectedFolderId || undefined, 
                    page: currentPage, 
                    limit: noteLimit 
                });
                
                const newNotes = notesRes.data as unknown as INote[] || [];
                
                if (reset) {
                    setActiveNotes(newNotes);
                } else {
                    setActiveNotes(prev => [...prev, ...newNotes]);
                }
                
                if (newNotes.length < noteLimit) {
                    setHasMoreNotes(false);
                } else {
                    setHasMoreNotes(true);
                }
            }
        }
    } catch (e) {
        toast.error("Failed to load data");
    } finally {
        setLoading(false);
        setLoadingMoreNotes(false);
    }
  }, [archiveMode, debouncedSearch, selectedFolderId, notePage]);

  const handleLoadMoreNotes = async () => {
      if (!hasMoreNotes || loadingMoreNotes || loading) return;
      setLoadingMoreNotes(true);
      setNotePage(prev => prev + 1);
      // loadData will be triggered by effect? No, effect depends on mode/search/folder.
      // We need to call load specifically for next page.
      // Actually, relying on state 'notePage' in dependency of loadData might trigger it?
      // "notePage" IS in dependency of loadData.
      // So setting notePage + 1 triggers loadData(false).
  };

  // We need to ensure loadData uses the *updated* notePage. 
  // State updates are async. "loadData" closes over current state.
  // We should rely on useEffect for notePage changes OR call load explicitly with new page.
  // Using useEffect on notePage is cleaner but need to differentiate "reset" vs "next page".
  // Let's add notePage to useEffect dependencies? 
  // Wait, the main useEffect has [archiveMode, debouncedSearch, selectedFolderId]. 
  // If I add notePage, it triggers on every page change.
  // But the main effect forces reset=true. That's wrong for pagination.
  
  // Separate effect for pagination:
  useEffect(() => {
      if (notePage > 1) {
          loadData(false);
      }
  }, [notePage]); // eslint-disable-next-line react-hooks/exhaustive-deps


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
     loadData(true);
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
          loadData(true); 
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
    loadData(true);
  };

  const handleRestoreAll = () => {
       setIsRestoringAll(true);
  };

  const performRestoreAll = async () => {
       await restoreAllFromArchive();
       toast.success("All notes restored");
       setIsRestoringAll(false);
       loadData(true);
  };

  const handleMoveNote = (note: INote) => {
      setMovingNote(note);
  };

  const performMoveNote = async (noteId: string, folderId: string | null) => {
       await moveNote({ noteId, folderId });
       toast.success("Note moved");
       loadData(true);
  };

  // Scroll Handler for Infinite Scroll
  useEffect(() => {
      const handleScroll = () => {
          if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
              if (hasMoreNotes && !loading && !loadingMoreNotes) {
                  handleLoadMoreNotes();
              }
          }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMoreNotes, loading, loadingMoreNotes]);

  return (
    <div className="section-wrapper pb-20"> 
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
        headerTitle={selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "Notes"}
        onBack={selectedFolderId ? () => setSelectedFolderId(null) : undefined}
      />

      {(loading && !debouncedSearch) ? (
          <>
              <FolderShelfSkeleton />
              <NoteGridSkeleton />
          </>
      ) : (
          <>
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
                 <>
                     <h3 className="tex-sm font-muted mb-2">Archived Folders</h3>
                     <FolderShelf 
                        folders={folders}
                        selectedFolderId={null} 
                        onSelectFolder={() => {}} 
                        onEditFolder={() => {}} 
                        onDeleteFolder={handleDeleteFolder} 
                        onRestoreFolder={handleRestoreFolder}
                     />
                 </>
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
                isSearch={!!debouncedSearch}
            />
            {loadingMoreNotes && (
                 <div className="py-4 flex justify-center w-full">
                     <span className="text-sm text-muted-foreground animate-pulse">Loading more notes...</span>
                 </div>
            )}
          </>
      )}

      {/* Dialogs */}
      <NoteDialog 
        open={openCreateNote} 
        onOpenChange={setOpenCreateNote} 
        noteId={editingNote?.id}
        defaultFolderId={selectedFolderId}
        onSaved={() => {
             setOpenCreateNote(false);
             loadData(true);
        }}
      />

      <FolderDialog
        open={openCreateFolder}
        onOpenChange={setOpenCreateFolder}
        folderId={editingFolder?.id}
        onSaved={() => {
            setOpenCreateFolder(false);
            loadData(true);
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
                  loadData(true);
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
                 loadData(true);
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
                   loadData(true);
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
