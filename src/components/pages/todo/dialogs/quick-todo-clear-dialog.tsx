"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface QuickTodoClearDialogProps {
  onConfirm: () => void;
}

export function QuickTodoClearDialog({ onConfirm }: QuickTodoClearDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-muted-foreground hover:text-destructive">
          Clear All Quick Tasks
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all your temporary quick tasks. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
            Yes, Clear All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
