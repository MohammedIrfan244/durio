import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function NoteCardSkeleton() {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg transition-all duration-100 ease-in-out",
        "hover:shadow-md",
        "md:min-h-[280px] md:aspect-[1/1.4]",
        "min-h-[140px]"
      )}
      style={{
        backgroundColor: "hsl(var(--muted))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {/* Checkbox placeholder (selection mode spacing) */}
      <div className="absolute right-3 top-3 z-20">
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Heading */}
        <Skeleton className="h-5 w-3/4 rounded-md" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5 hidden md:block" />
        </div>

        {/* "Read more" hint */}
        <Skeleton className="h-3 w-32 mt-1" />
      </div>

      {/* Footer */}
      <div
        className="border-t px-4 py-2 flex justify-end gap-1 items-center rounded-b-lg"
        style={{ borderTopColor: "hsl(var(--border))" }}
      >
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}
