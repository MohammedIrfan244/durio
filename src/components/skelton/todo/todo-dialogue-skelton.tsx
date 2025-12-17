"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface TodoDialogSkeletonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TodoDialogSkeleton({
  open = true,
  onOpenChange,
}: TodoDialogSkeletonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground max-h-[90vh] overflow-y-auto overflow-x-hidden max-w-4xl hide-scrollbar-on-main">
        {/* ---------------- HEADER ---------------- */}
        <DialogHeader className="space-y-2">
          <DialogTitle>
            <Skeleton className="h-6 w-48" />
          </DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-72" />
          </DialogDescription>
        </DialogHeader>

        {/* ---------------- FORM BODY ---------------- */}
        <div className="space-y-5 pt-2">
          {/* -------- TITLE -------- */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* -------- DESCRIPTION -------- */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>

          {/* -------- METADATA ROW -------- */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* -------- TAGS DISPLAY -------- */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-16 rounded-full"
              />
            ))}
          </div>

          {/* -------- DATE + TIME -------- */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-5">
            {/* Date */}
            <div className="space-y-2 md:col-span-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Time */}
            <div className="space-y-2 md:col-span-3">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>

          {/* -------- CHECKLIST -------- */}
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-52" />

            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              ))}
            </div>

            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* -------- FOOTER BUTTONS -------- */}
          <div className="flex justify-end gap-2 pt-4">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
