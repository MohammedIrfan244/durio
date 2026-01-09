import { Skeleton } from "@/components/ui/skeleton";

export function FolderShelfSkeleton() {
  return (
    <section className="w-full max-w-[calc(100vw-2rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-2 mb-1">
         <Skeleton className="h-7 w-32 rounded-md" />
      </div>

      {/* Scroll container */}
      <div className="overflow-x-auto hide-scrollbar-on-main">
        <div className="flex flex-nowrap items-end gap-3 py-2 px-2 w-max">
           {/* Mock All Notes Card */}
           <div className="relative flex flex-col justify-center items-center h-[100px] min-w-[110px] rounded-xl border-2 border-dashed border-muted bg-card/50">
                <Skeleton className="h-12 w-12 rounded-full mb-2" />
                <Skeleton className="h-4 w-16 rounded" />
           </div>

          {/* Mock Folder Cards */}
           {Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="relative pt-3">
                 {/* Tab Hint */}
                 <div className="absolute top-1 left-2 h-3 w-10 z-0">
                    <Skeleton className="h-full w-full rounded-t-md opacity-50" />
                 </div>
                 
                 {/* Main Body */}
                 <div className="relative z-10 h-[100px] min-w-[110px] rounded-xl rounded-tl-none border-2 border-border/40 bg-card p-2.5 flex flex-col justify-between">
                     <div className="flex justify-between">
                        <Skeleton className="h-8 w-8 rounded-lg opacity-70" />
                     </div>
                     <div>
                        <Skeleton className="h-4 w-20 rounded mb-1.5 opacity-80" />
                        <Skeleton className="h-4 w-8 rounded-full opacity-60" />
                     </div>
                 </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
