"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface TodoDetailedSkeletonProps {
  isOpen?: boolean;
  setOpen?: (open: boolean) => void;
}

export default function TodoDetailedPopupSkeleton({
  isOpen = true,
  setOpen,
}: TodoDetailedSkeletonProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 px-2">
        <DialogTitle className="sr-only">Loading Todo Details</DialogTitle>

        {/* ---------------- HEADER ---------------- */}
        <div className="px-6 pt-6 pb-4 space-y-3">
          {/* Title */}
          <Skeleton className="h-7 w-3/4" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        <Separator />

        {/* ---------------- BODY ---------------- */}
        <div className="flex-1 overflow-y-auto hide-scrollbar-on-main">
          {/* Status selector */}
          <div className="space-y-2 p-6 lg:px-8 pb-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:px-8">
            {/* -------- LEFT COLUMN -------- */}
            <div className="space-y-5">
              {/* Due date */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Recurrence */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-4/5 rounded-md" />
              </div>

              {/* Completed date */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* -------- RIGHT COLUMN (CHECKLIST) -------- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>

              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-full rounded-md"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- TAGS ---------------- */}
          <div className="space-y-2 p-6 lg:px-8 pt-0">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-wrap gap-2 bg-muted/50 p-2 rounded-md">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-5 w-16 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- FOOTER ---------------- */}
        <div className="px-8 py-3 border-t bg-muted/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
