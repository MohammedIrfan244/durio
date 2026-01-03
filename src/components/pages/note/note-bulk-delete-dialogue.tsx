"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { withClientAction } from "@/lib/helper/with-client-action";
import { bulkDeleteNotes, bulkSoftDeleteNotes } from "@/server/note-action";
import { Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface NoteBulkDeleteDialogueProps {
  ids: string[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  isSoft?: boolean;
}

export default function NoteBulkDeleteDialogue({
  ids,
  isOpen,
  setOpen,
  onSuccess,
  isSoft = false,
}: NoteBulkDeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    if (!ids.length) return;
    setIsDeleting(true);
    await withClientAction(() => isSoft ? bulkSoftDeleteNotes(ids) : bulkDeleteNotes(ids), true);
    setIsDeleting(false);
    setShowSuccess(true);
    onSuccess();
    toast.success(isSoft ? "Notes archived!" : "Notes deleted!");
    setTimeout(() => {
      setShowSuccess(false);
      setOpen(false);
    }, 1000);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <CheckCircle2 className="h-16 w-16 animate-in zoom-in duration-500" />
              <div className="absolute inset-0 h-16 w-16 animate-ping opacity-75">
                <CheckCircle2 className="h-16 w-16" />
              </div>
            </div>
            <p className="text-lg font-medium animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isSoft ? "Archived!" : "Deleted!"}
            </p>
          </div>
        ) : (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 transition-transform duration-300 hover:scale-110">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <AlertDialogTitle className="text-xl">
                    {isSoft ? "Archive Notes" : "Delete Notes"}
                </AlertDialogTitle>
              </div>
            </AlertDialogHeader>
            <div className="space-y-2">
              <p className="text-base">You’re about to {isSoft ? "archive" : "delete"} <strong>{ids.length}</strong> notes.</p>
              <p className="text-sm text-muted-foreground">{isSoft ? "These notes will be moved to archive." : "This action is permanent and cannot be undone."}</p>
            </div>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel disabled={isDeleting} className="transition-all duration-300 hover:scale-105 active:scale-95">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="flex items-center transition-all duration-300 hover:scale-105 active:scale-95 group">
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSoft ? "Archiving..." : "Deleting..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Yes, {isSoft ? "archive" : "delete"} all
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
