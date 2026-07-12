import React from 'react';
import { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import DuriaChat from '@/components/pages/duria/duria-chat';

export const metadata: Metadata = {
  title: `DURIA - ${APP_NAME}`,
  description:
    "Chat with DURIA, your intelligent daily companion. Get help with planning, summarization, and everyday decisions.",
  openGraph: {
    title: `DURIA - ${APP_NAME}`,
    description: "Chat with DURIA, your intelligent companion for daily planning and productivity.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `DURIA - ${APP_NAME}`,
    description: "Chat with DURIA, your intelligent companion for daily planning and productivity.",
  },
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