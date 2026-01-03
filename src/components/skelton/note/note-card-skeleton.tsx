
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function NoteCardSkeleton() {
  return (
    <div className={cn(
      "flex flex-col rounded-lg border bg-card/50 shadow-sm",
      "h-[280px] w-full"
    )}>
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Heading */}
        <Skeleton className="h-6 w-3/4 rounded-md" />
        
        {/* Description lines */}
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      
      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-border/40 flex justify-end gap-2">
         <Skeleton className="h-8 w-8 rounded-md" />
         <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
