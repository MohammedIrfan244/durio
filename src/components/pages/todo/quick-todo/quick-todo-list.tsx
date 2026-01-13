"use client";

import React from "react";
import { QuickTodoItem, QuickTodo } from "./quick-todo-item";
import { QuickTodoClearDialog } from "../dialogs/quick-todo-clear-dialog";

interface QuickTodoListProps {
  todos: QuickTodo[];
  onToggle: (id: string) => void;
  onEdit: (todo: QuickTodo) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function QuickTodoList({ todos, onToggle, onEdit, onDelete, onClear }: QuickTodoListProps) {
  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto px-1">
      {todos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No quick tasks yet. Add one above!
        </div>
      ) : (
        <>
          {todos.map((todo) => (
            <QuickTodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          
          <div className="flex justify-center pt-2">
            <QuickTodoClearDialog onConfirm={onClear} />
          </div>
        </>
      )}
    </div>
  );
}
