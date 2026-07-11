// app/layout.tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Patrick_Hand,
  Mali,
  DynaPuff,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import SessionProviderWrapper from "@/components/layout/session-provider";
import { APP_NAME } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const mali = Mali({
  variable: "--font-body",
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const dynaPuff = DynaPuff({
  variable: "--font-bubbly",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A simple Daily manager app",
  manifest: "/favicons/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${patrickHand.variable}
          ${mali.variable}
          ${dynaPuff.variable}
          antialiased
        `}
      >
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
