import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import React from "react";

interface NoteRestoreDialogProps {
  isOpen?: boolean;
  setOpen?: (open: boolean) => void;
  onRestore: () => void;
  trigger?: React.ReactNode;
  noteTitle?: string;
}

export function NoteRestoreDialog({ isOpen, setOpen, onRestore, trigger, noteTitle }: NoteRestoreDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Note</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restore{noteTitle ? ` "${noteTitle}"` : " this note"}? It will be moved back to your active notes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRestore}>Restore</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
