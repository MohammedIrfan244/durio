"use client";

import {
  IGetTodoListPayload,
  IGetTodoList,
  ITodoStatsResponsePayload,
} from "@/types/todo";
import React, { useEffect, useState } from "react";
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

import {
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Archive,
  AlertCircle,
  Flame,
  Calendar,
  Target,
  Repeat,
  Zap,
  Trophy,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { withClientAction } from "@/lib/helper/with-client-action";
import { bulkSoftDeleteTodos, getTodoStat } from "@/server/to-do-action";
import { toast } from "sonner";
import TodoBoardSkeleton from "@/components/skelton/todo-card-skelton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  emoji,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
  label: string;
  value: string | number;
  trend?: string;
  emoji?: string;
}) {
  return (
    <div
      className="
        group flex items-center gap-2 p-2 rounded
        bg-muted/50 hover:bg-muted/70
        transition-all duration-200 ease-out
        hover:-translate-y-[1px] hover:shadow-sm
      "
    >
      <div className="flex-shrink-0">
        {Icon ? (
          <Icon
            className="
              w-4 h-4 text-primary
              transition-transform duration-200 ease-out
              group-hover:scale-110 group-hover:-rotate-3
            "
          />
        ) : (
          <span className="text-lg transition-transform duration-200 group-hover:scale-110">
            {emoji}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>

      {trend && (
        <div className="text-xs text-green-600 font-medium">{trend}</div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPACT ROW                                 */
/* -------------------------------------------------------------------------- */

interface CompactRowProps {
  label: string;
  value: string | number;
  emoji?: string;
}

function CompactRow({ label, value, emoji }: CompactRowProps) {
  return (
    <div
      className="
        flex items-center justify-between py-1.5 px-1 rounded
        transition-colors duration-150
        hover:bg-muted/40
      "
    >
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {emoji && (
          <span className="transition-transform duration-200 hover:scale-110">
            {emoji}
          </span>
        )}
        {label}
      </span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PROGRESS BAR                                 */
/* -------------------------------------------------------------------------- */

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

function ProgressBar({ value, max, color = "bg-primary" }: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full h-1.5 bg-muted overflow-hidden rounded">
      <div
        className={`
          h-full ${color}
          transition-all duration-700 ease-out
        `}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

export function StatsColumn({
  stats,
}: {
  stats: ITodoStatsResponsePayload | null;
}) {
  if (!stats) return null;

  const formatDay = (day: string) =>
    day.charAt(0) + day.slice(1).toLowerCase();

  const animatedCard =
    "transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-md";

  return (
    <div className="space-y-2 h-screen overflow-auto hide-scrollbar-on-main">
      <Card
        className={`${animatedCard} bg-gradient-to-br from-primary/5 to-primary/10 p-1 space-y-0`}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 transition-transform duration-200 hover:rotate-6" />
            Quick Overview
          </CardTitle>
          <span className="text-xl transition-transform duration-200 hover:scale-110">
            📊
          </span>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-2">
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.overview.completedTodos}
          />
          <StatCard
            icon={Circle}
            label="Active"
            value={stats.overview.activeTodos}
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={stats.overview.overdueTodos}
          />
          <StatCard
            icon={Archive}
            label="Archived"
            value={stats.overview.cancelledOrArchived}
          />
        </CardContent>
      </Card>
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
            Your Streak
          </CardTitle>
          <span className="text-2xl transition-transform hover:scale-110">
            🔥
          </span>
        </CardHeader>

        <CardContent className="space-y-1">
          <div className="text-center p-3 bg-background/50 rounded transition-all hover:shadow-sm">
            <p className="text-3xl font-bold text-orange-600">
              {stats.streak.current.count}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              days in a row!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Best Streak</p>
              <p className="font-semibold">
                {stats.streak.longest.count} days 🏆
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Active Days</p>
              <p className="font-semibold">
                {stats.streak.health.activeDaysLast30}/30
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Consistency</span>
              <span className="font-medium">
                {stats.streak.health.percentageActiveLast30}%
              </span>
            </div>
            <ProgressBar
              value={stats.streak.health.percentageActiveLast30}
              max={100}
              color="bg-orange-600"
            />
          </div>
        </CardContent>
      </Card>
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 transition-transform hover:rotate-3" />
            Today & This Week
          </CardTitle>
          <span className="text-xl transition-transform hover:scale-110">
            📅
          </span>
        </CardHeader>

        <CardContent className="space-y-0.5">
          <CompactRow
            emoji="☀️"
            label="Completed today"
            value={stats.today.completedToday}
          />
          <CompactRow
            emoji="📝"
            label="Due today"
            value={stats.today.dueToday}
          />
          <CompactRow
            emoji="📈"
            label="Completed this week"
            value={stats.today.completedThisWeek}
          />
          <CompactRow
            emoji="➕"
            label="Created this week"
            value={stats.today.createdThisWeek}
          />

          {stats.today.completionRateToday !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  Today's completion rate
                </span>
                <span className="font-medium">
                  {stats.today.completionRateToday}%
                </span>
              </div>
              <ProgressBar
                value={stats.today.completionRateToday}
                max={100}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 transition-transform hover:scale-110" />
            Priority Focus
          </CardTitle>
          <span className="text-xl transition-transform hover:scale-110">
            🎯
          </span>
        </CardHeader>

        <CardContent className="space-y-2">
          {(["HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
            const count = stats.priorityInsights.counts[priority];
            const rate = stats.priorityInsights.completionRate[priority];
            const overdue = stats.priorityInsights.overdue[priority];

            const barColor =
              priority === "HIGH"
                ? "bg-red-500"
                : priority === "MEDIUM"
                ? "bg-yellow-500"
                : "bg-blue-500";

            return (
              <div key={priority} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${barColor}`} />
                    {priority.charAt(0) +
                      priority.slice(1).toLowerCase()}
                  </span>
                  <span className="text-muted-foreground">
                    {count} tasks • {rate}% done
                    {overdue > 0 && ` • ${overdue} ⚠️`}
                  </span>
                </div>
                <ProgressBar value={rate} max={100} color={barColor} />
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card className={`${animatedCard} p-1 pb-2 space-y-0`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 transition-transform hover:scale-110" />
            Patterns
          </CardTitle>
          <span className="text-xl transition-transform hover:scale-110">
            📉
          </span>
        </CardHeader>

        <CardContent className="space-y-1 text-xs">
          <div className="flex justify-between p-2 bg-muted/50 rounded transition-colors hover:bg-muted/70">
            <span className="text-muted-foreground">Most productive</span>
            <span className="font-medium">
              {stats.timePatterns.mostProductiveDay
                ? formatDay(stats.timePatterns.mostProductiveDay)
                : "—"}{" "}
              🚀
            </span>
          </div>

          <div className="flex justify-between p-2 bg-muted/50 rounded transition-colors hover:bg-muted/70">
            <span className="text-muted-foreground">Avg per day</span>
            <span className="font-medium">
              {stats.timePatterns.averageCompletedPerDay} tasks ⚡
            </span>
          </div>
        </CardContent>
      </Card>
      {stats.insights.length > 0 && (
        <Card className={`${animatedCard} p-1 space-y-0`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 transition-transform hover:rotate-6" />
              Insights for You
            </CardTitle>
            <span className="text-xl transition-transform hover:scale-110">
              💡
            </span>
          </CardHeader>

          <CardContent className="space-y-1">
            {stats.insights.map((insight) => (
              <div
                key={insight.id}
                className={`
                  text-xs p-2 rounded
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  ${
                    insight.type === "POSITIVE"
                      ? "dark:bg-green-900/20 text-green-800 dark:text-green-200"
                      : insight.type === "WARNING"
                      ? "dark:bg-amber-900/20 text-amber-800 dark:text-amber-200"
                      : "dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                  }
                `}
              >
                {insight.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {stats.statusBreakdown.trendInsight && (
        <Card
          className={`${animatedCard} p-1 text-center dark:from-green-950/20 dark:to-emerald-950/20`}
        >
          <CardContent>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {stats.statusBreakdown.trendInsight}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------- BOARD -------------------------------- */

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stat, setStat] = useState<ITodoStatsResponsePayload | null>(null);

  const fetchStats = async () => {
    const response = await withClientAction<ITodoStatsResponsePayload>(() =>
      getTodoStat()
    );
    if (response) setStat(response);
    console.log("Stats", response);
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

  return loading ? (
    <TodoBoardSkeleton isLoading={loading} />
  ) : (
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
      <StatsColumn stats={stat} />

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
    <div
      className="sticky top-0 z-30 col-span-full mb-2 flex items-center justify-between
                     border bg-background/95 px-4 py-2 shadow-sm"
    >
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
