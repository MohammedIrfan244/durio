import { NoteCardSkeleton } from "./note-card-skeleton";

export function NoteGridSkeleton() {

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-4">
            <NoteCardSkeleton />
          </div>
        ))}
    </div>
  );
}
