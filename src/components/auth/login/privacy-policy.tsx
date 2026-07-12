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
      title="Privacy Policy"
      icon={<ShieldCheck size={20} />}
      description="Our Google sign-in privacy details."
    >
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

      <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Data Deletion & Support
        </p>
        <p className="text-xs">
          If you wish to permanently delete your account and all associated data, or if you have any questions regarding your privacy, please contact us:
        </p>
        <a href="mailto:zemdevwork@gmail.com" className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-[#ff6a00] transition-colors">
          <Mail size={14} className="text-[#ff6a00]" />
          zemdevwork@gmail.com
        </a>
      </div>
    </InfoModal>
  );
}
