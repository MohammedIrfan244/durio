"use client";

import {
  IGetTodoListPayload,
  IGetTodoList,
  ITodoStatsResponsePayload,
} from "@/types/todo";
import { useEffect, useState } from "react";
import TodoDetailedDialogue from "./todo-detailed-popup";
import TodoDeleteDialogue from "./todo-delete-dialogue";
import ToDoDialog from "./todo-dialogue";
import TodoCard from "./todo-card";
import { cn } from "@/lib/utils";
import {
  statusBgColorBoard,
  statusColorBoard,
  statusToneBoard,
} from "@/lib/brand";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withClientAction } from "@/lib/helper/with-client-action";
import { getTodoStat } from "@/server/stats/todo-stats";
import { TodoColumnSkeleton } from "@/components/skelton/todo/todo-card-skelton";
import { Card } from "@/components/ui/card";
import { StatsColumn } from "./todo-streak";
import { NoTodos } from "@/components/skelton/todo/no-todo-skeoton";
import TodoBulkDeleteDialogue from "./todo-bulk-delete-dialogue";

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
  loading: boolean;
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
  loading,
}: TodoColumnProps) {
  const statusKey = title as keyof typeof statusToneBoard;

  if (loading) return <TodoColumnSkeleton title={title} count={4} />;
  if (todos.length === 0) return <NoTodos status={title} />;
  return (
    <Card
      className={cn(
        " p-2 border nav-item-group",
        statusBgColorBoard[statusKey],
        `border-${statusToneBoard[statusKey]}/20 max-h-screen overflow-y-auto hide-scrollbar-on-main`
      )}
    >
      <h2
        className={cn(
          "text-center text-sm font-semibold tracking-wide animate-photo",
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
    </Card>
  );
}

interface TodoBoardProps {
  todos: IGetTodoListPayload;
  fetchTodos: () => void;
  loading: boolean;
}

export default function TodoBoard({
  todos,
  fetchTodos,
  loading,
}: TodoBoardProps) {
  const { plan, pending, done } = todos;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stat, setStat] = useState<ITodoStatsResponsePayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    const response = await withClientAction<ITodoStatsResponsePayload | null>(
      () => getTodoStat()
    );
    if (response) setStat(response);
    setStatsLoading(false);
  };

  const handleRefresh = () => {
    fetchTodos();
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
        relative grid gap-2 w-full max-h-screen
        overflow-y-auto hide-scrollbar-on-main
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
      "
    >
      {/* BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onClear={clearSelection}
          onArchive={() => {
            setOpenBulkDelete(true);
          }}
          onDelete={() => {
            setOpenBulkDelete(true);
          }}
        />
      )}

      <TodoColumn
        loading={loading}
        title="PLAN"
        todos={plan}
        fetchTodos={handleRefresh}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <TodoColumn
        loading={loading}
        title="PENDING"
        todos={pending}
        fetchTodos={handleRefresh}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <TodoColumn
        loading={loading}
        title="DONE"
        todos={done}
        fetchTodos={handleRefresh}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />
      <StatsColumn stats={stat} loading={statsLoading} />

      {selectedId && (
        <TodoDetailedDialogue
          todoId={selectedId}
          isOpen={openDetail}
          setOpen={setOpenDetail}
          onUpdate={handleRefresh}
        />
      )}

      <TodoDeleteDialogue
        isSoft
        todoId={selectedId}
        isOpen={openDelete}
        setOpen={setOpenDelete}
        onSuccess={handleRefresh}
      />

      {openEdit && selectedId && (
        <ToDoDialog
          todoId={selectedId}
          open={openEdit}
          onOpenChange={setOpenEdit}
          onSaved={() => {
            setOpenEdit(false);
            setSelectedId(null);
            handleRefresh();
          }}
        />
      )}

      <TodoBulkDeleteDialogue
        ids={Array.from(selectedIds)}
        isOpen={openBulkDelete}
        setOpen={setOpenBulkDelete}
        isSoft={true}
        onSuccess={() => {
          clearSelection();
          handleRefresh();
        }}
      />
    </div>
  );
}

interface BulkActionBarProps {
  count: number;
  onArchive: () => void;
  onDelete: () => void;
  onClear: () => void;
}

function BulkActionBar({ count, onArchive, onClear }: BulkActionBarProps) {
  return (
    <div
      className="sticky top-0 z-30 col-span-full mb-2 flex items-center justify-between
                 border bg-background/95 px-4 py-2 shadow-sm"
    >
      <span className="text-sm font-semibold">{count} selected</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onArchive}>
          Archive
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
