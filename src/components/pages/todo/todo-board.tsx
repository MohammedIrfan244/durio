"use client";

import {
  IGetTodoListPayload,
  IGetTodoList,
  ITodoStatsResponsePayload,
} from "@/types/todo";
import { useEffect, useState } from "react";
import TodoDetailedDialogue from "./dialogs/todo-detailed-popup";
import TodoDeleteDialogue from "./dialogs/todo-delete-dialogue";
import ToDoDialog from "./dialogs/todo-dialogue";
import TodoCard from "./cards/todo-card";
import { cn } from "@/lib/utils";
import {
  statusBgColorBoard,
  statusColorBoard,
  statusToneBoard,
} from "@/lib/brand";

import { X, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { withClientAction } from "@/lib/utils/with-client-action";
import { getTodoStat } from "@/server/stats/todo-stats";
import { TodoColumnSkeleton } from "@/components/skeleton/todo/todo-card-skelton";
import { Card } from "@/components/ui/card";
import { StatsColumn } from "./todo-streak";
import { NoTodos } from "@/components/skeleton/todo/no-todo-skeoton";
import TodoBulkDeleteDialogue from "./dialogs/todo-bulk-delete-dialogue";
import { getTodayTodos, getTodoList } from "@/server/actions/to-do-action";
import { getTodaysFocusBlocks } from "@/server/actions/focus-actions";
import { TodoFilterInput } from "@/schema/todo";

interface TodoColumnProps {
  title: "PLAN" | "PENDING" | "DONE";
  filters: TodoFilterInput;
  todayMode: boolean;
  triggerRefresh: number; 
  setSelectedId: (id: string | null) => void;
  setOpenDetail: (open: boolean) => void;
  setOpenDelete: (open: boolean) => void;
  setOpenEdit: (open: boolean) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRefreshBoard: () => void;
}

function TodoColumn({
  title,
  filters,
  todayMode,
  triggerRefresh,
  setSelectedId,
  setOpenDetail,
  setOpenDelete,
  setOpenEdit,
  selectedIds,
  onToggleSelect,
  onRefreshBoard,
  activeFocusBlocks
}: TodoColumnProps & { activeFocusBlocks?: any[] }) {
  const statusKey = title as keyof typeof statusToneBoard;
  const [todos, setTodos] = useState<IGetTodoList[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Initial Fetch / Filters Change
  useEffect(() => {
    fetchTodos(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, todayMode, triggerRefresh]);

  const createFocusTodoCards = (baseList: IGetTodoList[]) => {
    if (title !== "PENDING" || !activeFocusBlocks || activeFocusBlocks.length === 0) {
      return baseList;
    }

    const focusTodos = activeFocusBlocks.map((block) => ({
      id: `focus-${block.id}`,
      title: `Focus: ${block.title}`,
      status: "PENDING" as const,
      priority: "HIGH" as const,
      dueDate: new Date(),
      renewStart: null,
      renewInterval: null,
      renewEvery: null,
      readOnly: true,
    }));

    return [...baseList, ...focusTodos];
  };

  const fetchTodos = async (pageNum: number, reset: boolean) => {
    if (loading && !reset && pageNum > 1) return; // Prevent duplicate fetch
    
    setLoading(true);
    try {
      if (todayMode) {
        const action = getTodayTodos;
        const res = await withClientAction<IGetTodoListPayload>(() => action());
        if (res) {
          const list = title === "PLAN" ? res.plan : title === "PENDING" ? res.pending : res.done;
          setTodos(createFocusTodoCards(list));
          setHasMore(false); 
        }
      } else {
        const limit = 10;
        const res = await withClientAction<IGetTodoListPayload>(() => 
          getTodoList({ ...filters, status: title, page: pageNum, limit })
        );
        
        if (res) {
          const list = title === "PLAN" ? res.plan : title === "PENDING" ? res.pending : res.done;
          
          if (reset) {
            setTodos(createFocusTodoCards(list));
          } else {
            setTodos(prev => [...prev, ...createFocusTodoCards(list)]);
          }
          
          setHasMore(list.length === limit);
          setPage(pageNum);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // Simple infinite scroll trigger
      if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading && !todayMode) {
          fetchTodos(page + 1, false);
      }
  };

  if (loading && todos.length === 0) return <TodoColumnSkeleton title={title} count={4} />;
  if (todos.length === 0 && !loading) return <NoTodos status={title} />; 

  return (
    <Card
      onScroll={handleScroll}
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

      <div className="space-y-2 pb-4">
        {title === "PENDING" && (activeFocusBlocks?.length ?? 0) > 0 && (
          <div className="space-y-3 mb-3">
            {activeFocusBlocks?.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-primary/40 bg-primary/5 p-3 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-500"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Target size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">
                          {block.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {block.startTime} – {block.endTime} · High priority focus block
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1 border-primary/30 text-primary whitespace-nowrap bg-background/50">
                        FOCUS
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
            fetchTodos={onRefreshBoard} // If card updates, we might want to refresh.
          />
        ))}
        {loading && todos.length > 0 && (
             <div className="text-center py-2 text-xs text-muted-foreground">Loading more...</div>
        )}
      </div>
    </Card>
  );
}

interface TodoBoardProps {
  filters: TodoFilterInput;
  todayMode: boolean;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function TodoBoard({
  filters,
  todayMode,
  refreshTrigger,
  onRefresh,
}: TodoBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stat, setStat] = useState<ITodoStatsResponsePayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeFocusBlocks, setActiveFocusBlocks] = useState<any[]>([]);

  const fetchActiveFocus = async () => {
    const res = await withClientAction(() => getTodaysFocusBlocks());
    if (res) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const active = res.filter((b: any) => {
         if (b.priority !== "HIGH") return false;
         const [sh, sm] = b.startTime.split(':').map(Number);
         const [eh, em] = b.endTime.split(':').map(Number);
         const start = sh * 60 + sm;
         let end = eh * 60 + em;
         if (end <= start) end += 24 * 60;
         const current = currentMinutes;
         return current >= start && current < end;
      });
      setActiveFocusBlocks(active);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    console.log("fetching stats");
    const response = await withClientAction<ITodoStatsResponsePayload | null>(
      () => getTodoStat()
    );
    console.log(response,"stat res");
    if (response) setStat(response);
    setStatsLoading(false);
  };

  const handleRefresh = () => {
    onRefresh();
    fetchActiveFocus();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    fetchActiveFocus();
    
    // Check every minute if focus block status changed
    const interval = setInterval(() => {
       fetchActiveFocus();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshTrigger]); 

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
        title="PLAN"
        filters={filters}
        todayMode={todayMode}
        triggerRefresh={refreshTrigger}
        onRefreshBoard={handleRefresh}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <TodoColumn
        title="PENDING"
        filters={filters}
        todayMode={todayMode}
        triggerRefresh={refreshTrigger}
        onRefreshBoard={handleRefresh}
        setSelectedId={setSelectedId}
        setOpenDetail={setOpenDetail}
        setOpenDelete={setOpenDelete}
        setOpenEdit={setOpenEdit}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        activeFocusBlocks={activeFocusBlocks}
      />

      <TodoColumn
        title="DONE"
        filters={filters}
        todayMode={todayMode}
        triggerRefresh={refreshTrigger}
        onRefreshBoard={handleRefresh}
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
