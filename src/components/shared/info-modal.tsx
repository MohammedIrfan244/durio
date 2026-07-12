"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}

export default function InfoModal({ open, onClose, title, icon, description, children }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-border bg-background">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="text-foreground">
              {icon}
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-foreground/80 space-y-4 mt-4">
          {children}
        </div>

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
