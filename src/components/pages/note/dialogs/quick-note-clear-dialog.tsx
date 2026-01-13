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

interface QuickNoteClearDialogProps {
  onConfirm: () => void;
}

export function QuickNoteClearDialog({ onConfirm }: QuickNoteClearDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-muted-foreground hover:text-destructive">
          Clear All Quick Notes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all your temporary quick notes. This action cannot be undone.
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
