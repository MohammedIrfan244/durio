import React from 'react';
import { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import DuriaChat from '@/components/pages/duria/duria-chat';

export const metadata: Metadata = {
    title: `DURIA AI - ${APP_NAME}`,
    description: "Your intelligent daily assistant.",
};

export default function DuriaPage() {
  return (
    <div className="section-wrapper h-[calc(100vh-4rem)] flex flex-col p-4">
      <div className="flex-1 rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col">
        <DuriaChat />
      </div>
    </div>
  );
}