"use client";

import React, { useState, useEffect } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerTrigger,
  DrawerClose 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { QuickTodoInput } from "./quick-todo-input";
import { QuickTodoList } from "./quick-todo-list";
import { QuickTodo } from "./quick-todo-item";

export function QuickTodoDrawer() {
  const [todos, setTodos] = useState<QuickTodo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("quick-todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse quick todos", e);
      }
    }
  }, []);

  // Sync to local storage whenever todos change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("quick-todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const handleCreateOrUpdate = () => {
    if (!inputValue.trim()) return;

    if (editingId) {
      setTodos((prev) => 
        prev.map((t) => (t.id === editingId ? { ...t, text: inputValue } : t))
      );
      setEditingId(null);
    } else {
      const newTodo: QuickTodo = {
        id: crypto.randomUUID(),
        text: inputValue,
        completed: false,
      };
      setTodos((prev) => [newTodo, ...prev]);
    }
    setInputValue("");
  };

  const handleEdit = (todo: QuickTodo) => {
    setInputValue(todo.text);
    setEditingId(todo.id);
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setInputValue("");
    }
  };

  const toggleComplete = (id: string) => {
    setTodos((prev) => 
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const clearAll = () => {
    setTodos([]);
    setInputValue("");
    setEditingId(null);
  };

  if (!mounted) return null;

  return (
    <Drawer direction="top" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="gap-2 nav-item-group space-x-2 w-full">
          <Zap className="h-4 w-4 animate-zap" />
          <span>Quick Tasks</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="flex flex-col items-center text-center">
            <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Quick Tasks
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground max-w-md mx-auto">
              Temporary tasks for quick access. 
              <br />
              <span className="text-xs opacity-75">
                (These are stored locally and are NOT synced with your main Todos database)
              </span>
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col gap-6 pb-8">
            <QuickTodoInput 
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleCreateOrUpdate}
              isEditing={!!editingId}
              onCancelEdit={() => {
                setEditingId(null);
                setInputValue("");
              }}
            />

            <QuickTodoList 
              todos={todos}
              onToggle={toggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClear={clearAll}
            />
          </div>
          
          <DrawerClose asChild>
             <Button variant="ghost" className="absolute top-4 right-4 rounded-full" size="icon">
                <X className="h-4 w-4" />
             </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
