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
  metadataBase: new URL("https://durio.vercel.app"),
  title: APP_NAME,
  description:
    "DURIO — Your personal daily companion. Manage your tasks, notes, calendar, and companion — all in one place.",
  keywords: [
    "personal productivity",
    "task manager",
    "daily planner",
    "companion",
    "notes",
    "calendar",
    "DURIO",
  ],
  authors: [{ name: "DURIO" }],
  verification: {
    google: "fv4gvgKrQ3owE9Zc-uAINkHPfHLgZwJm9NCXBMMFKs0"
  },
  alternates: {
    canonical: "/",
  },
  category: "productivity",
  themeColor: "#ff6a00",
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
  openGraph: {
    title: "DURIO",
    description: "Your personal daily companion",
    type: "website",
    locale: "en_US",
    siteName: "DURIO",
    images: [
      {
        url: "https://res.cloudinary.com/doseusf1y/image/upload/v1783781053/opengraph_sthvcq.png",
        width: 1200,
        height: 630,
        alt: "DURIO — Your personal daily companion",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "DURIO",
    description: "Your personal daily companion",
    images: ["https://res.cloudinary.com/doseusf1y/image/upload/v1783781053/opengraph_sthvcq.png"],
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
