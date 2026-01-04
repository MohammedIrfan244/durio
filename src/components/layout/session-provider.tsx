"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "../theme-provider";
import TimezoneOnboarding from "../auth/timezone-onboarding";

function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        themes={["light", "dark", "pookie", "gothic", "natural", "system"]}
        enableSystem
      >
        {children}
        <TimezoneOnboarding />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default SessionProviderWrapper;
