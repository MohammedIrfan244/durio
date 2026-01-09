import { INoteFolder } from "@/types/note";
import { NoteFolderCard } from "./cards/note-folder-card";
import AllNoteHomeCard from "./cards/all-note-home-card";

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
  onRestoreFolder,
}: FolderShelfProps) {
  if (folders.length === 0) return null;

  return (
    <section className="w-full max-w-[calc(100vw-2rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center group nav-item-group px-2">
        <h2 className="text-lg font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          Your Folders
        </h2>
      </div>

      {/* Scroll container */}
      <div className="overflow-x-auto hide-scrollbar-on-main">
        <div className="flex flex-nowrap items-end gap-3 py-2 px-2 w-max">
          <AllNoteHomeCard
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />

          {folders.map((folder) => (
            <NoteFolderCard
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              onClick={() =>
                onSelectFolder(
                  folder.id === selectedFolderId ? null : folder.id
                )
              }
              onEdit={onEditFolder}
              onDelete={onDeleteFolder}
              onRestore={onRestoreFolder}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
