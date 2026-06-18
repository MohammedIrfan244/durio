"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { getTodosForAI, getNotesForAI, getEventsForAI } from "@/server/actions/duria-actions";

interface AiPayload {
  todos: any[];
  notes: any[];
  events: any[];
  docs: { title: string, content: string }[];
}

interface DuriaContextType {
  aiPayload: AiPayload;
  isLoading: boolean;
  attachTodos: (filters?: any) => Promise<void>;
  attachNotes: (filters?: any) => Promise<void>;
  attachEvents: (filters?: any) => Promise<void>;
  attachDoc: (title: string, path: string) => Promise<void>;
  clearContext: () => void;
  removeContextItem: (type: keyof AiPayload, index: number) => void;
}

const DuriaContext = createContext<DuriaContextType | undefined>(undefined);

export function DuriaProvider({ children }: { children: ReactNode }) {
  const [aiPayload, setAiPayload] = useState<AiPayload>({
    todos: [],
    notes: [],
    events: [],
    docs: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const attachTodos = async (filters?: any) => {
    setIsLoading(true);
    const res = await getTodosForAI(filters);
    if (res.success && res.data) {
      setAiPayload(prev => ({ ...prev, todos: [...prev.todos, ...res.data] }));
    }
    setIsLoading(false);
  };

  const attachNotes = async (filters?: any) => {
    setIsLoading(true);
    const res = await getNotesForAI(filters);
    if (res.success && res.data) {
      setAiPayload(prev => ({ ...prev, notes: [...prev.notes, ...res.data] }));
    }
    setIsLoading(false);
  };

  const attachEvents = async (filters?: any) => {
    setIsLoading(true);
    const res = await getEventsForAI(filters);
    if (res.success && res.data) {
      setAiPayload(prev => ({ ...prev, events: [...prev.events, ...res.data] }));
    }
    setIsLoading(false);
  };

  const attachDoc = async (title: string, path: string) => {
    setIsLoading(true);
    try {
      // In a real app, we'd fetch this via an API route that reads the file.
      // For now, we'll hit a new internal API route /api/docs?path=...
      const res = await fetch(`/api/docs?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content) {
        setAiPayload(prev => ({ ...prev, docs: [...prev.docs, { title, content: data.content }] }));
      }
    } catch (e) {
      console.error("Failed to load doc", e);
    }
    setIsLoading(false);
  };

  const clearContext = () => {
    setAiPayload({ todos: [], notes: [], events: [], docs: [] });
  };

  const removeContextItem = (type: keyof AiPayload, index: number) => {
    setAiPayload(prev => {
      const updatedArray = [...prev[type]];
      updatedArray.splice(index, 1);
      return { ...prev, [type]: updatedArray };
    });
  };

  return (
    <DuriaContext.Provider value={{
      aiPayload,
      isLoading,
      attachTodos,
      attachNotes,
      attachEvents,
      attachDoc,
      clearContext,
      removeContextItem
    }}>
      {children}
    </DuriaContext.Provider>
  );
}

export function useDuria() {
  const context = useContext(DuriaContext);
  if (context === undefined) {
    throw new Error("useDuria must be used within a DuriaProvider");
  }
  return context;
}
