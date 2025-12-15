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
import { softDeleteTodo } from "@/server/to-do-action";
import { Trash2, Loader2, CheckCircle2 } from "lucide-react";

interface TodoDeleteDialogueProps {
  todoId: string | null;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

export default function TodoDeleteDialogue({
  todoId,
  isOpen,
  setOpen,
  onSuccess,
}: TodoDeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    if (!todoId) return;

    setIsDeleting(true);

    await withClientAction(
      () => softDeleteTodo({ id: todoId }),
      true
    );

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
              Gone! 👋
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
                  Hey, wait a sec...
                </AlertDialogTitle>
              </div>
            </AlertDialogHeader>

            <div className="space-y-2">
              <p className="text-base">
                Are you sure you want to delete this todo?
              </p>
              <p className="text-sm text-muted-foreground">
                Just checking because, you know, we can't bring it back once it's gone. No pressure though!
              </p>
            </div>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                disabled={isDeleting}
                className="transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
              >
                Nah, keep it
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Yeah, delete it
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
