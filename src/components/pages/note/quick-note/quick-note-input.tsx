"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface QuickNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
  onCancelEdit: () => void;
}

export function QuickNoteInput({ value, onChange, onSubmit, isEditing, onCancelEdit }: QuickNoteInputProps) {
  return (
    <div className="space-y-2">
        <div className="flex gap-2">
        <div className="relative flex-1">
            <Textarea 
            placeholder="Type your quick note here..." 
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 150))}
            className="pr-16 min-h-[80px] resize-none"
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                }
            }}
            />
            <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">
            {value.length}/150
            </span>
        </div>
        <Button onClick={onSubmit}>
            {isEditing ? "Update" : "Create"}
        </Button>
        {isEditing && (
            <Button variant="ghost" size="icon" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
            </Button>
        )}
        </div>
    </div>
  );
}
