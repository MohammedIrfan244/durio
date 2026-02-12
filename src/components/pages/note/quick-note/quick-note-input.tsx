"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Threshold } from "@/types/note";
import { RotateCcw, X } from "lucide-react";
import { capitalize } from "@/lib/utils/name-formatter";

interface QuickNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
  onCancelEdit: () => void;
  threshold: Threshold;
  modeToggle: () => void;
}

export function QuickNoteInput({
  value,
  onChange,
  onSubmit,
  isEditing,
  onCancelEdit,
  threshold,
  modeToggle,
}: QuickNoteInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            placeholder="Type your quick note here..."
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, threshold.value))}
            className="pr-16 min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">
            {value.length}/{threshold.value} ({capitalize(threshold.mode)} Mode)
          </span>
        </div>
        <div className="flex flex-col justify-between items-end">
          <Button onClick={onSubmit}>{isEditing ? "Update" : "Create"}</Button>
          {isEditing ? (
            <Button variant="ghost" className="w-full" size="icon" onClick={onCancelEdit}>
              Cancel <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              size="icon"
              onClick={modeToggle}
            >
              Mode <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
