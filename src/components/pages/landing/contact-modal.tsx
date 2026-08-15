"use client";

import { MessageSquare, Mail, Twitter, Github } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import InfoModal from "@/components/shared/info-modal";
import Link from "next/link";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  return (
    <InfoModal
      open={open}
      onClose={onClose}
      title="Say Hello!"
      icon={<MessageSquare size={20} />}
      description={`How to reach out about ${APP_NAME}.`}
    >
      <div className="space-y-6">
        <p>
          Got ideas, bugs, or just want to chat? We&apos;re all ears and always around to help out!
        </p>

        <div className="space-y-4">
          <Link href="/feedback" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-foreground">
            <Mail className="text-[#ff6a00]" size={20} />
            <div>
              <div className="font-semibold">Shoot an email</div>
              <div className="text-xs text-muted-foreground">zemdevwork@gmail.com</div>
            </div>
          </Link>

          <Link href="https://mohammed-irfan.vercel.app" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-foreground">
            <Twitter className="text-[#ff6a00]" size={20} />
            <div>
              <div className="font-semibold">Meet the Dev</div>
              <div className="text-xs text-muted-foreground">mhd-irfan</div>
            </div>
          </Link>
          
          <Link href="https://github.com/MohammedIrfan244/durio" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-foreground">
            <Github className="text-[#ff6a00]" size={20} />
            <div>
              <div className="font-semibold">GitHub Repo</div>
              <div className="text-xs text-muted-foreground">Yell at us about bugs</div>
            </div>
          </Link>
        </div>
      </div>
    </InfoModal>
  );
}
