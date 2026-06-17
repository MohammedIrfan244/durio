"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserSettings } from "@/server/actions/settings-actions";

interface SettingsContextType {
  fancyMode: boolean;
  disabledModules: string[];
  setFancyMode: (val: boolean) => void;
  setDisabledModules: (modules: string[]) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fancyMode, setFancyModeState] = useState(true);
  const [disabledModules, setDisabledModulesState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getUserSettings();
        setFancyModeState(settings.fancyMode);
        setDisabledModulesState(settings.disabledModules);
      } catch (error) {
        console.error("Failed to load user settings", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const setFancyMode = (val: boolean) => {
    setFancyModeState(val);
  };

  const setDisabledModules = (modules: string[]) => {
    setDisabledModulesState(modules);
  };

  return (
    <SettingsContext.Provider value={{ fancyMode, disabledModules, setFancyMode, setDisabledModules, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
