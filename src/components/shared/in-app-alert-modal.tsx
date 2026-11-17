"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getActiveAppAlert } from "@/server/actions/app-alert-actions";
import type { AppAlert } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OPEN_APP_ALERT_EVENT = "open-durio-app-alert";

export function triggerAppAlertModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_APP_ALERT_EVENT));
  }
}

export default function InAppAlertModal() {
  const [alertData, setAlertData] = useState<AppAlert | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAlert = useCallback(async () => {
    const res = await getActiveAppAlert();
    if (res.success && res.data) {
      setAlertData(res.data);

      const isMobile =
        window.innerWidth < 768 ||
        (typeof window !== "undefined" &&
          (window as unknown as { Capacitor?: { isNativePlatform: () => boolean } })
            .Capacitor?.isNativePlatform?.());

      const dismissedKey = `durio_alert_dismissed_${res.data.id}`;
      const isDismissed = sessionStorage.getItem(dismissedKey);

      if (isMobile && !isDismissed) {
        setIsOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchAlert();

    const handleOpenEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener(OPEN_APP_ALERT_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener(OPEN_APP_ALERT_EVENT, handleOpenEvent);
    };
  }, [fetchAlert]);

  if (!alertData) return null;

  const handleClose = () => {
    sessionStorage.setItem(`durio_alert_dismissed_${alertData.id}`, "true");
    setIsOpen(false);
  };

  const handleDownload = () => {
    const url = alertData.downloadUrl.startsWith("http")
      ? alertData.downloadUrl
      : `${window.location.origin}${alertData.downloadUrl}`;

    const isNative = (
      window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }
    ).Capacitor?.isNativePlatform?.();

    if (isNative) {
      window.open(url, "_system");
    } else {
      const link = document.createElement("a");
      link.href = alertData.downloadUrl;
      link.download = "durio.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl flex flex-col z-10 space-y-4"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Info size={20} />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Update Notice
                </span>
                <div className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground inline-block ml-2">
                  v{alertData.version}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {alertData.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {alertData.description}
              </p>
            </div>

            {alertData.changelog && alertData.changelog.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-3 space-y-2">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                  What is new
                </span>
                <ul className="space-y-1.5">
                  {alertData.changelog.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-primary mt-0.5 shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={handleDownload}
                className="w-full font-semibold gap-2 py-5"
              >
                <Download size={16} />
                Download and Install APK
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
