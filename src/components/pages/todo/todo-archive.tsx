"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Archive,
  ArchiveRestore,
  Trash2,
  RefreshCw,
  Loader2,
  Package,
  PackageOpen,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getArchivedTodos,
  restoreAllFromArchive,
  searchArchivedTodos,
} from "@/server/actions/to-do-action";
import { IGetArchivedTodoListPayload } from "@/types/todo";
import { withClientAction } from "@/lib/helper/with-client-action";
import TodoArchiveCard from "./todo-archive-card";
import TodoBulkDeleteDialogue from "./todo-bulk-delete-dialogue";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";
import TodoArchiveCardSkeletonList from "@/components/skelton/todo/todo-archived-card-skelton";

interface TodoArchiveProps {
  onSuccess: () => void;
}

export default function TodoArchive({ onSuccess }: TodoArchiveProps) {
  const [archivedTodos, setArchivedTodos] =
    useState<IGetArchivedTodoListPayload>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [openBulkDelete, setOpenBulkDelete] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchArchivedTodos = async () => {
    setIsLoading(true);
    try {
      const response = await withClientAction<IGetArchivedTodoListPayload>(
        () => getArchivedTodos(),
        false
      );
      if (response) setArchivedTodos(response);
    } catch {
      toast.error("Failed to load archived todos");
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await withClientAction<IGetArchivedTodoListPayload>(
        () => searchArchivedTodos({ query }),
        false
      );
      if (response) setArchivedTodos(response);
    } catch {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAll = () => {
    if (archivedTodos.length === 0) return;

    startTransition(async () => {
      const response = await withClientAction(
        () => restoreAllFromArchive(),
        true
      );

      if (response !== undefined) {
        setArchivedTodos([]);
        toast.success("All todos restored!");
        onSuccess?.();
      }
    });
  };

  const handleRemoveFromList = (id: string) => {
    setArchivedTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    if (open) fetchArchivedTodos();
  }, [open]);

  // 🔍 SEARCH EFFECT (debounced)
  useEffect(() => {
    if (!open) return;

    if (!debouncedSearch.trim()) {
      fetchArchivedTodos();
    } else {
      performSearch(debouncedSearch.trim());
    }
  }, [debouncedSearch, open]);

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-2 nav-item-group w-full">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wider">
            <PackageOpen className="h-3 w-3 animate-zap" />
            Clean & Restore
          </Label>

          <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="border-border/60 w-full transition-all duration-300 hover:border-primary/30 group flex items-center gap-2 justify-start"
          >
            <Archive className="group-hover:-rotate-45 transition-all duration-300" />
            Archived Todos
          </Button>
        </DrawerTrigger>
        </div>

        <DrawerContent className="max-h-[85vh] border-t border-border">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader className="border-b border-border/50 space-y-2">
              <DrawerTitle className="flex items-center gap-2 text-xl font-semibold">
                <Archive className="h-5 w-5" />
                Archived Todos
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Restore or permanently delete your archived todos
              </DrawerDescription>

              {/* SEARCH */}
              <div className="relative mt-3 nav-item-group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground animate-check" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archived todos..."
                  className="pl-9 h-9"
                />
              </div>
            </DrawerHeader>

            {/* CONTENT */}
            <div className="px-4 pb-2">
              {archivedTodos.length > 0 && (
                <div className="flex flex-wrap gap-2 my-4 p-4 bg-accent/30 border-l-2 border-foreground/20">
                  <Button
                    size="sm"
                    onClick={handleRestoreAll}
                    disabled={isPending || isLoading}
                    className="gap-2 bg-foreground text-background hover:bg-foreground/90 nav-item-group"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArchiveRestore className="h-3.5 w-3.5 animate-calendar" />
                    )}
                    Restore All ({archivedTodos.length})
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpenBulkDelete(true)}
                    disabled={isPending || isLoading}
                    className="gap-2 text-destructive hover:bg-destructive/50 nav-item-group"
                  >
                    <Trash2 className="h-3.5 w-3.5 animate-note" />
                    Delete All
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchArchivedTodos}
                    disabled={isLoading}
                    className="gap-2 ml-auto hover:bg-accent/50 settings-button"
                  >
                    <RefreshCw
                      className={cn("h-3.5 w-3.5 settings-icon", isLoading && "animate-spin")}
                    />
                    Refresh
                  </Button>
                </div>
              )}

              {/* LIST */}
              <div className="max-h-[50vh] overflow-y-auto hide-scrollbar-on-main pr-2 space-y-16">
                {isLoading ? (
                  <TodoArchiveCardSkeletonList />
                ) : archivedTodos.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <Package className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-sm font-medium">
                      {debouncedSearch
                        ? "No matching archived todos"
                        : "No archived todos"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 pb-2 max-h-[50vh] overflow-y-auto hide-scrollbar-on-main">
                    {archivedTodos.map((todo) => (
                      <TodoArchiveCard
                        key={todo.id}
                        todo={todo}
                        onSuccess={onSuccess}
                        onRemoveFromList={handleRemoveFromList}
                        isPending={isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DrawerFooter className="border-t border-border/50 pt-4">
              <DrawerClose asChild>
                <Button variant="outline" className="hover:bg-accent/50">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <TodoBulkDeleteDialogue
        ids={[]}
        isOpen={openBulkDelete}
        setOpen={setOpenBulkDelete}
        isSoft={false}
        onSuccess={async () => {
          setArchivedTodos([]);
          onSuccess?.();
        }}
      />
    </>
  );
}
