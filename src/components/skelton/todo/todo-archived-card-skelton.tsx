"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function TodoArchiveCardSkeleton() {
  return (
    <Card className="bg-background/60 border-none shadow-sm py-1">
      <CardContent className="p-2 space-y-2">
        {/* Title + Badge */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-16 rounded-full shrink-0" />
        </div>

        <Separator className="my-2" />

        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 w-10 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

const TodoArchiveCardSkeletonList = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <TodoArchiveCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default TodoArchiveCardSkeletonList;
