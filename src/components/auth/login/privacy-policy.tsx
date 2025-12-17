"use client";

import { ShieldCheck, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { APP_NAME } from "@/lib/brand";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-border bg-background">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-foreground" size={20} />
            <DialogTitle className="text-lg font-semibold text-foreground">
              Privacy Policy
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Our Google sign-in privacy details.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-foreground/80 space-y-4">

          <p>
            When signing in with Google, we only receive your{" "}
            <strong>username and email address</strong>. No additional access is requested.
          </p>

          <p>
            Everything you create inside {APP_NAME} — tasks, notes, journal entries,
            calendar items, habit logs, and more — remains securely stored.
          </p>

          <p>
            Only you can access your data — authentication is required at every step.
          </p>

          <p>
            Need data deletion, export, or support? Contact us anytime:
          </p>

          <p className="flex items-center gap-2 text-foreground/70">
            <Mail size={16} />
            <span>zemdevwork@gmail.com</span>
          </p>

          <p>
            Thank you for trusting {APP_NAME} with your productivity!
          </p>
        </div>

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
