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
import { deleteNoteFolder } from "@/server/note-action";
import { Trash2, Loader2, CheckCircle2 } from "lucide-react";

interface FolderDeleteDialogueProps {
  folderId: string | null;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  isSoft?: boolean;
}

export default function FolderDeleteDialogue({
  folderId,
  isOpen,
  setOpen,
  onSuccess,
  isSoft = false,
}: FolderDeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    if (!folderId) return;
    setIsDeleting(true);
    await withClientAction(() => deleteNoteFolder({ id: folderId, softDelete: isSoft }), true);
    setIsDeleting(false);
    setShowSuccess(true);
    onSuccess();
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
                  {isSoft ? "Archive Folder" : "Delete Folder"}
                </AlertDialogTitle>
              </div>
            </AlertDialogHeader>
            <div className="space-y-2">
              <p className="text-base">
                Are you sure you want to {isSoft ? "archive" : "delete"} this folder?
              </p>
              <p className="text-sm text-muted-foreground">
                {isSoft
                  ? "This folder and its notes will be archived."
                  : "This action is permanent and cannot be undone. All notes in this folder will also be deleted."}
              </p>
            </div>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel disabled={isDeleting} className="transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="flex items-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group">
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSoft ? "Archiving..." : "Deleting..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Yes, {isSoft ? "archive" : "delete"} it
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
