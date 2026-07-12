"use client";

import { MessageSquare, Mail, Twitter, Github } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import InfoModal from "@/components/shared/info-modal";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  return (
    <InfoModal
      open={open}
      onClose={onClose}
      title="Contact Us"
      icon={<MessageSquare size={20} />}
      description={`Contact information for ${APP_NAME}.`}
    >
      <div className="space-y-6">
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
    </InfoModal>
  );
}
