"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { QuickNoteInput } from "./quick-note-input";
import { QuickNoteList } from "./quick-note-list";
import { QuickNote, Threshold } from "@/types/note";
import { toast } from "sonner";

export function QuickNoteDrawer() {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [threshold, setThreshold] = useState<Threshold>({value: 150, mode: "short"});

  const toggleMode = () => {
    setThreshold((prev) => ({value: prev.value === 150 ? 1000 : 150, mode: prev.mode === "short" ? "long" : "short"}));
  };

  // Initialize from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("quick-notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse quick notes", e);
      }
    }
  }, []);


  const filterNotesByThreshold = (notes: QuickNote[], threshold: Threshold) => {
    return notes.filter(note => note.threshold.mode === threshold.mode);
  }

  // Sync to local storage whenever notes change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("quick-notes", JSON.stringify(notes));
    }
  }, [notes, mounted]);

  const handleCreateOrUpdate = () => {
    if (!inputValue.trim()) return;

    if (editingId) {
      if(inputValue.length > threshold.value) {
        toast.error(`Note exceeds the ${threshold.mode} mode limit of ${threshold.value} characters.`);
        return;
      }
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? { ...n, text: inputValue } : n)),
      );
      setEditingId(null);
    } else {
      if(inputValue.length > threshold.value) {
        toast.error(`Note exceeds the ${threshold.mode} mode limit of ${threshold.value} characters.`);
        return;
      }
      const newNote: QuickNote = {
        id: crypto.randomUUID(),
        text: inputValue,
        threshold,
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    setInputValue("");
  };

  const handleEdit = (note: QuickNote) => {
    setInputValue(note.text);
    setEditingId(note.id);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setInputValue("");
    }
  };

  const clearAll = () => {
    setNotes([]);
    setInputValue("");
    setEditingId(null);
  };

  if (!mounted) return null;

  return (
    <Drawer direction="top" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="gap-2 nav-item-group">
          <Zap className="h-4 w-4 animate-zap" />
          <span className="hidden sm:inline">Quick Notes</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="flex flex-col items-center text-center">
            <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Quick Notes
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground max-w-md mx-auto">
              Temporary notes for quick access.
              <br />
              <span className="text-xs opacity-75">
                (These are stored locally and are NOT synced with your main
                Notes database)
              </span>
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col gap-6 pb-8">
            <QuickNoteInput
              value={inputValue}
              threshold={threshold}
              modeToggle={toggleMode}
              onChange={setInputValue}
              onSubmit={handleCreateOrUpdate}
              isEditing={!!editingId}
              onCancelEdit={() => {
                setEditingId(null);
                setInputValue("");
              }}
            />

            <QuickNoteList
              notes={filterNotesByThreshold(notes, threshold)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClear={clearAll}
            />
          </div>

          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="absolute top-4 right-4 rounded-full"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
