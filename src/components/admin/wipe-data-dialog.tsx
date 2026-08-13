"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminWipeDataDialogProps {
  userId: string;
  userEmail: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminWipeDataDialog({
  userId,
  userEmail,
  open,
  onClose,
  onSuccess,
}: AdminWipeDataDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWipeData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/wipe-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to wipe user data");
      }

      const data = await response.json();
      toast.success(data.message);
      onClose();
      onSuccess?.();

      // Optionally reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to wipe user data. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            Permanently Wipe All Data
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 mt-4">
            <p>
              This will permanently delete all data associated with{" "}
              <strong>{userEmail}</strong>.
            </p>
            <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-sm space-y-2">
              <p className="font-semibold text-foreground">
                This action is <span className="text-destructive">IRREVERSIBLE</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All tasks, notes, calendar, and personal data will be deleted</li>
                <li>All system logs for this user will be removed</li>
                <li>The user record itself will be permanently deleted</li>
                <li>This cannot be undone</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Confirm only if the user has explicitly requested permanent deletion.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 mt-6">
          <AlertDialogCancel disabled={isLoading} className="flex-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleWipeData}
            disabled={isLoading}
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wiping...
              </>
            ) : (
              "Wipe All Data"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
