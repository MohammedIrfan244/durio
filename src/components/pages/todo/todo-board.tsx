"use client";

import { IGetTodoListPayload, IGetTodoList } from "@/types/todo";
import { useState } from "react";
import TodoDetailedDialogue from "./todo-detailed-popup";
import TodoDeleteDialogue from "./todo-delete-dialogue";
import ToDoDialog from "./todo-dialogue";
import TodoCard from "./todo-card";
import { cn } from "@/lib/utils";
import {
  statusBgColorBoard,
  statusColorBoard,
  statusToneBoard,
} from "@/lib/color";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withClientAction } from "@/lib/helper/with-client-action";
import { bulkSoftDeleteTodos } from "@/server/to-do-action";
import { toast } from "sonner";

/* -------------------------------- COLUMN -------------------------------- */

interface TodoColumnProps {
  title: "PLAN" | "PENDING" | "DONE";
  todos: IGetTodoList[];
  fetchTodos: () => void;
  setSelectedId: (id: string | null) => void;
  setOpenDetail: (open: boolean) => void;
  setOpenDelete: (open: boolean) => void;
  setOpenEdit: (open: boolean) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

function TodoColumn({
  title,
  todos,
  fetchTodos,
  setSelectedId,
  setOpenDetail,
  setOpenDelete,
  setOpenEdit,
  selectedIds,
  onToggleSelect,
}: TodoColumnProps) {
  const statusKey = title as keyof typeof statusToneBoard;

  return (
    <section
      className={cn(
        "rounded-xl p-3 space-y-3 border",
        statusBgColorBoard[statusKey],
        `border-${statusToneBoard[statusKey]}/20`
      )}
    >
      <h2
        className={cn(
          "text-center text-sm font-semibold tracking-wide",
          statusColorBoard[statusKey]
        )}
      >
        {title}
      </h2>

      <div className="space-y-2">
        {todos.map((t) => (
          <TodoCard
            key={t.id}
            todo={t}
            selected={selectedIds.has(t.id)}
            onToggleSelect={onToggleSelect}
            onOpenDetail={(id) => {
              setSelectedId(id);
              setOpenDetail(true);
            }}
            onEdit={(id) => {
              setSelectedId(id);
              setOpenEdit(true);
            }}
            onDelete={(id) => {
              setSelectedId(id);
              setOpenDelete(true);
            }}
            fetchTodos={fetchTodos}
          />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- BOARD -------------------------------- */

interface TodoBoardProps {
  todos: IGetTodoListPayload;
  fetchTodos: () => void;
}

export default function TodoBoard({ todos, fetchTodos }: TodoBoardProps) {
  const { plan, pending, done } = todos;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div
      className="
        relative grid gap-4 w-full max-h-screen
        overflow-y-auto hide-scrollbar-on-main
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
      "
    >
      {/* BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onClear={clearSelection}
          onArchive={async () => {
            await withClientAction(
              () => bulkSoftDeleteTodos({ ids: Array.from(selectedIds) }),
              true
            );
            clearSelection();
            toast.success("Selected todos have been archived.");
            fetchTodos();
          }}
        />
      )}

      <TodoColumn
        title="PLAN"
        todos={plan}
        fetchTodos={fetchTodos}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <TodoColumn
        title="PENDING"
        todos={pending}
        fetchTodos={fetchTodos}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <TodoColumn
        title="DONE"
        todos={done}
        fetchTodos={fetchTodos}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {selectedId && (
        <TodoDetailedDialogue
          todoId={selectedId}
          isOpen={openDetail}
          setOpen={setOpenDetail}
          onUpdate={fetchTodos}
        />
      )}

      <TodoDeleteDialogue
        todoId={selectedId}
        isOpen={openDelete}
        setOpen={setOpenDelete}
        onSuccess={fetchTodos}
      />

      {openEdit && selectedId && (
        <ToDoDialog
          todoId={selectedId}
          open={openEdit}
          onOpenChange={setOpenEdit}
          onSaved={() => {
            setOpenEdit(false);
            setSelectedId(null);
            fetchTodos();
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------- BULK ACTION BAR ---------------------------- */

interface BulkActionBarProps {
  count: number;
  onArchive: () => void;
  onClear: () => void;
}

function BulkActionBar({ count, onArchive, onClear }: BulkActionBarProps) {
  return (
    <div className="sticky top-0 z-30 col-span-full mb-2 flex items-center justify-between
                    rounded-lg border bg-background/95 px-4 py-2 shadow-sm">
      <span className="text-sm font-semibold">{count} selected</span>

      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={onArchive}>
          <Trash2 className="h-4 w-4 mr-1" />
          Archive
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
