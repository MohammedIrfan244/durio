"use client";

import { useState, useEffect } from "react";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Just Vibe",
  intermediate: "Normal Day",
  advanced: "Grind Mode",
};

export function useDifficulty() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("difficulty-level") as Difficulty;
    if (stored && Object.keys(DIFFICULTY_LABELS).includes(stored)) {
      setDifficulty(stored);
    }
    setMounted(true);
  }, []);

  const changeDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    localStorage.setItem("difficulty-level", level);
  };

  return {
    difficulty,
    setDifficulty: changeDifficulty,
    label: DIFFICULTY_LABELS[difficulty],
    mounted,
  };
}
