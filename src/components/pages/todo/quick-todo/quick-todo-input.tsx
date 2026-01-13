"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface QuickTodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
  onCancelEdit: () => void;
}

export function QuickTodoInput({ value, onChange, onSubmit, isEditing, onCancelEdit }: QuickTodoInputProps) {
  return (
    <div className="space-y-2">
        <div className="flex gap-2">
        <div className="relative flex-1">
            <Input 
            placeholder="Type your quick task here..." 
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 150))}
            className="pr-16"
            onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
            }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
