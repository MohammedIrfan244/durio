"use client";

import { ShieldCheck, Mail } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import InfoModal from "@/components/shared/info-modal";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  return (
    <InfoModal
      open={open}
      onClose={onClose}
      title="The Privacy Stuff"
      icon={<ShieldCheck size={20} />}
      description="How we keep your stuff safe."
    >
      <p>
        When you log in with Google, we only peek at your{" "}
        <strong>username and email</strong>. We don't want or need anything else.
      </p>

      <p>
        Everything you build inside {APP_NAME} — tasks, notes, journal entries,
        calendar items, habit logs, and more — stays under lock and key.
      </p>

      <p>
        Your data is yours. Nobody else gets to see it.
      </p>

      <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Wiping Your Data & Help
        </p>
        <p className="text-xs">
          Want to burn it all down and delete your account? Or just have a question? Hit us up:
        </p>
        <a href="mailto:zemdevwork@gmail.com" className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-[#ff6a00] transition-colors">
          <Mail size={14} className="text-[#ff6a00]" />
          zemdevwork@gmail.com
        </a>
      </div>
    </InfoModal>
  );
}
