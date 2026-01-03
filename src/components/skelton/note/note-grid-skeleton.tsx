
import Masonry from "react-masonry-css";
import { NoteCardSkeleton } from "./note-card-skeleton";

export function NoteGridSkeleton() {
  const breakpointColumns = {
    default: 6,
    1280: 5,
    1024: 4,
    768: 2,
    640: 1
  };

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-4">
            <NoteCardSkeleton />
          </div>
        ))}
      </Masonry>
    </div>
  );
}
