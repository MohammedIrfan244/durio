"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsColumnSkeleton() {
  const animatedCard =
    "transition-all duration-200 ease-out";

  return (
    <div className="space-y-2 h-screen overflow-auto hide-scrollbar-on-main">
      {/* Quick Overview */}
      <Card className={`${animatedCard} p-1 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded bg-muted/40"
            >
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-10 ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="text-center p-3 bg-muted/40 rounded">
            <Skeleton className="h-8 w-16 mx-auto mb-2" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>

          <Skeleton className="h-2 w-full rounded" />
        </CardContent>
      </Card>

      {/* Today & This Week */}
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>

        <CardContent className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}

          <Skeleton className="h-2 w-full mt-3 rounded" />
        </CardContent>
      </Card>

      {/* Priority Focus */}
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>

        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Patterns */}
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>

        <CardContent className="space-y-2">
          <Skeleton className="h-7 w-full rounded" />
          <Skeleton className="h-7 w-full rounded" />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className={`${animatedCard} p-1 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>

        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
