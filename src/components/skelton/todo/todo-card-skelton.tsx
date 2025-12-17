"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  statusBgColorBoard,
  statusColorBoard,
  statusToneBoard,
} from "@/lib/color";

export function TodoCardSkeleton() {
  return (
    <Card
      className="
        bg-background/60
        border-none shadow-none
        pb-2
      "
    >
      <CardContent className="px-3 pt-2 pb-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-[65%]" />

          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-22 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

interface TodoColumnSkeletonProps {
  title: "PLAN" | "PENDING" | "DONE";
  count?: number;
}

export function TodoColumnSkeleton({
  title,
  count = 4,
}: TodoColumnSkeletonProps) {
  const statusKey = title as keyof typeof statusToneBoard;

  return (
    <section
      className={cn(
        "rounded-xl p-3 space-y-3 border",
        statusBgColorBoard[statusKey],
        `border-${statusToneBoard[statusKey]}/20`
      )}
    >
      <h2
        className={cn(
          "text-center text-sm font-semibold tracking-wide",
          statusColorBoard[statusKey]
        )}
      >
        {title}
      </h2>

      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <TodoCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default function TodoBoardSkeleton({
  isLoading,
}: {
  isLoading: boolean;
}) {
    if(!isLoading) return null;
  if (isLoading) {
    return (
      <div
        className="
          grid gap-2 w-full max-h-screen
          overflow-y-auto hide-scrollbar-on-main
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        "
      >
        <TodoColumnSkeleton title="PLAN" />
        <TodoColumnSkeleton title="PENDING" />
        <TodoColumnSkeleton title="DONE" />
      </div>
    );
  }
}
