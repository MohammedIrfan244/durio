"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickTodo {
  id: string;
  text: string;
  completed: boolean;
}

interface QuickTodoItemProps {
  todo: QuickTodo;
  onToggle: (id: string) => void;
  onEdit: (todo: QuickTodo) => void;
  onDelete: (id: string) => void;
}

export function QuickTodoItem({ todo, onToggle, onEdit, onDelete }: QuickTodoItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all hover:bg-accent/50 group",
        todo.completed && "opacity-60 bg-muted/50"
      )}
    >
      <button 
        onClick={() => onToggle(todo.id)}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        {todo.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      
      <span className={cn(
        "flex-1 text-sm font-medium break-all",
        todo.completed && "line-through text-muted-foreground"
      )}>
        {todo.text}
      </span>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => onEdit(todo)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
