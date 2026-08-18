"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

type DeleteStep = "initial" | "soft-confirm" | "hard-confirm" | "deleting";

export default function DeleteAccountDialog({
  open,
  onClose,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<DeleteStep>("initial");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setStep("initial");
    onClose();
  };

  const handleSoftDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setStep("deleting");
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate account");
      }

      toast.success("Account deactivated. You will be logged out...");

      // Wait 3 seconds minimum, then redirect
      setTimeout(() => {
        signOut({ callbackUrl: "/auth/login" });
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to deactivate account. Please try again.");
      setIsLoading(false);
      setStep("initial");
    }
  };

  const handleHardDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep("deleting");
    try {
      const response = await fetch("/api/user/delete-account-permanent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to permanently delete account");
      }

      toast.success(
        "Account permanently deleted. Redirecting..."
      );

      // Wait 3 seconds minimum, then redirect
      setTimeout(() => {
        signOut({ callbackUrl: "/auth/login" });
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to permanently delete account. Please try again."
      );
      setIsLoading(false);
      setStep("hard-confirm");
    }
  };

  if (step === "initial") {
    return (
      <AlertDialog open={open && step === "initial"} onOpenChange={handleClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              This action will deactivate your account. You have two options:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 my-6">
            {/* Soft Delete Option */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors cursor-pointer"
              onClick={() => setStep("soft-confirm")}>
              <h3 className="font-semibold text-foreground mb-2">
                Deactivate Account (Temporary)
              </h3>
              <p className="text-sm text-muted-foreground">
                Your account will be temporarily deactivated. You can recover it by
                contacting{" "}
                <a href="mailto:zemdevwork@gmail.com" className="text-primary hover:underline">
                  zemdevwork@gmail.com
                </a>
              </p>
            </div>

            {/* Hard Delete Option */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 hover:bg-destructive/20 transition-colors cursor-pointer"
              onClick={() => setStep("hard-confirm")}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    Permanently Delete (Irreversible)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your account and all data will be permanently erased within 24 hours.
                    This cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <AlertDialogCancel
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (step === "soft-confirm") {
    return (
      <AlertDialog open={open && step === "soft-confirm"} onOpenChange={() => setStep("initial")}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 mt-4">
              <p>
                Your account will be <strong>temporarily deactivated</strong>.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>All your data remains safe</li>
                <li>Your account can be reactivated by contacting us</li>
                <li>You&apos;ll be logged out immediately</li>
              </ul>
              <p className="pt-2">
                To reactivate, contact{" "}
                <a href="mailto:zemdevwork@gmail.com" className="text-primary hover:underline font-medium">
                  zemdevwork@gmail.com
                </a>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex gap-3">
            <AlertDialogCancel
              onClick={() => setStep("initial")}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSoftDelete}
              disabled={isLoading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (step === "hard-confirm") {
    return (
      <AlertDialog open={open && step === "hard-confirm"} onOpenChange={() => setStep("initial")}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Permanent Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 mt-4">
              <p className="font-semibold text-foreground">
                This action is <span className="text-destructive">IRREVERSIBLE</span>
              </p>
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-sm">
                <p className="font-semibold text-foreground mb-2">
                  The following will happen:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Your account will be marked for deletion</li>
                  <li>All data will be permanently erased within 24 hours</li>
                  <li>This includes tasks, notes, calendar, habits, and all personal data</li>
                  <li>No one, not even the author, can recover this data</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Are you absolutely sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex gap-3">
            <AlertDialogCancel
              onClick={() => setStep("initial")}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={isLoading}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (step === "deleting") {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent className="max-w-sm flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing...</h2>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we process your request. Do not close this window.
          </p>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
