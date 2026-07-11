"use client";

import { MessageSquare, Mail, Twitter, Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { APP_NAME } from "@/lib/brand";
import Link from "next/link";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-border bg-background">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="text-foreground" size={20} />
            <DialogTitle className="text-lg font-semibold text-foreground">
              Contact Us
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Contact information for {APP_NAME}.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-foreground/80 space-y-6 mt-4">
          <p>
            Have a question, feedback, or need support? We're here to help you get the most out of {APP_NAME}.
          </p>

          <div className="space-y-4">
            <a href="mailto:zemdevwork@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-foreground">
              <Mail className="text-[#ff6a00]" size={20} />
              <div>
                <div className="font-semibold">Email Us</div>
                <div className="text-xs text-muted-foreground">zemdevwork@gmail.com</div>
              </div>
            </a>

            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-foreground">
              <Twitter className="text-[#ff6a00]" size={20} />
              <div>
                <div className="font-semibold">Twitter / X</div>
                <div className="text-xs text-muted-foreground">@durio_app</div>
              </div>
            </a>
            
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-foreground">
              <Github className="text-[#ff6a00]" size={20} />
              <div>
                <div className="font-semibold">GitHub</div>
                <div className="text-xs text-muted-foreground">Report an issue</div>
              </div>
            </a>
          </div>
        </div>

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
