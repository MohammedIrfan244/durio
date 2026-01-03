
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FolderShelfSkeleton() {
  return (
    <div className="mb-8 py-2">
       <div className="mb-4">
         <Skeleton className="h-7 w-32 rounded-md" />
       </div>
       
       <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-4 px-1 items-end py-2">
          {/* Mock All Notes Card */}
          <Skeleton className="h-[100px] w-[110px] rounded-xl" />
          
          {/* Mock Folder Cards */}
          {Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="relative pt-3">
                 <Skeleton className="h-[100px] w-[110px] rounded-xl" />
                 {/* Little tab hint */}
                 <div className="absolute top-1 left-2 h-3 w-10">
                    <Skeleton className="h-full w-full rounded-t-md opacity-50" />
                 </div>
             </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
