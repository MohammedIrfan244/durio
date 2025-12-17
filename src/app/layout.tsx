// app/layout.tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Pacifico,
  Lato,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AppLayout from "@/components/layout/app-layout";
import SessionProviderWrapper from "@/components/layout/session-provider";
import { APP_NAME } from "@/lib/brand";

// CURRENT FONTS
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// NEW FONTS
const pacifico = Pacifico({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-body",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A simple Daily manager app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${pacifico.variable}
          ${lato.variable}
          antialiased
        `}
      >
        <SessionProviderWrapper>
          <AppLayout>{children}</AppLayout>
        </SessionProviderWrapper>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
