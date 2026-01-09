"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";

interface FolderRestoreDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onRestore: () => Promise<void>;
  folderName?: string;
}

export function FolderRestoreDialog({ 
  isOpen, 
  setOpen, 
  onRestore, 
  folderName = "this folder" 
}: FolderRestoreDialogProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    await onRestore();
    setIsRestoring(false);
    setOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-primary/10 rounded-full">
                <RotateCcw className="h-5 w-5 text-primary" />
             </div>
             <AlertDialogTitle>Restore Folder?</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          Are you sure you want to restore <span className="font-medium text-foreground">"{folderName}"</span>? 
          It will be moved back to your active folders list.
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restoring...
              </>
            ) : (
              "Restore"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
