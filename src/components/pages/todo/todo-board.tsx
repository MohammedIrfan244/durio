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
import { TodoColumnSkeleton } from "@/components/skelton/todo-card-skelton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsColumnSkeleton from "@/components/skelton/stats-column";

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

  return loading ? (
    <TodoColumnSkeleton title={title} count={4} />
  ) : (
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

















function AchievementBadges({
  level,
}: {
  level: "none" | "bronze" | "silver" | "gold";
}) {
  // Define the Tailwind classes for each 'achieved' color
  const levelColors = {
    gold: "text-yellow-400 dark:text-yellow-300",
    silver: "text-gray-400 dark:text-gray-300", // Using gray for a standard silver look
    bronze: "text-amber-700 dark:text-amber-500", // Using a deeper amber/yellow-600 for bronze
    none: "text-muted",
  };

  // Define the base color for an inactive/muted badge
  const mutedColor = "text-muted-foreground/30";

  /**
   * Determines the color class for a specific badge slot (e.g., the 🥇 slot)
   * based on the user's current achievement level.
   *
   * The achieved level's color is used for active badges, and `mutedColor` for inactive ones.
   */
  const getBadgeColor = (
    badgeSlot: "gold" | "silver" | "bronze", // The position of the medal icon
    currentLevel: "none" | "bronze" | "silver" | "gold" // The user's achieved level
  ) => {
    // 1. Determine if the badge slot should be ACTIVE (not muted)
    let isActive = false;
    switch (badgeSlot) {
      case "gold":
        // Only active if the user has GOLD
        isActive = currentLevel === "gold";
        break;
      case "silver":
        // Active if the user has GOLD or SILVER
        isActive = currentLevel === "gold" || currentLevel === "silver";
        break;
      case "bronze":
        // Active if the user has GOLD, SILVER, or BRONZE
        isActive =
          currentLevel === "gold" ||
          currentLevel === "silver" ||
          currentLevel === "bronze";
        break;
      default:
        isActive = false;
    }

    // 2. Return the color: the ACHIEVED level's color if active, or muted if inactive
    if (isActive) {
      // Return the specific color for the user's achieved level
      return levelColors[currentLevel];
    }

    // If not active, return the muted color
    return mutedColor;
  };

  // The rendering logic remains the same, but the colors are now based on the new logic
  return (
    <div className="flex items-center space-x-0.5 text-lg">
      <span
        className={`transition-colors duration-300 ${getBadgeColor(
          "gold", // Slot 1: Gold Position (🥇)
          level
        )}`}
      >
        🥇
      </span>
      <span
        className={`transition-colors duration-300 ${getBadgeColor(
          "silver", // Slot 2: Silver Position (🥈)
          level
        )}`}
      >
        🥈
      </span>
      <span
        className={`transition-colors duration-300 ${getBadgeColor(
          "bronze", // Slot 3: Bronze Position (🥉)
          level
        )}`}
      >
        🥉
      </span>
    </div>
  );
}

// Helper component for the muted/shining star display
function ShineStars({
  activeStars,
  maxStars = 5,
}: {
  activeStars: number;
  maxStars?: number;
}) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const isActive = i <= activeStars;
    stars.push(
      <span
        key={i}
        className={`text-sm transition-colors duration-300 ${
          isActive
            ? "text-yellow-400 dark:text-yellow-300"
            : "text-muted-foreground/50 dark:text-muted-foreground/30"
        }`}
      >
        ⭐
      </span>
    );
  }
  return <div className="flex items-center space-x-[1px]">{stars}</div>;
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
        group flex items-center gap-2 p-2 rounded-lg
        bg-muted/40 hover:bg-muted/70
        transition-all duration-200
        hover:-translate-y-[1px] hover:shadow-sm
      "
    >
      <div className="flex-shrink-0">
        {Icon ? (
          <Icon className="w-4 h-4 text-primary transition-transform group-hover:scale-110 group-hover:-rotate-6" />
        ) : (
          <span className="text-lg transition-transform group-hover:scale-110">
            {emoji}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </div>

      {trend && (
        <div className="text-xs font-medium text-green-600">{trend}</div>
      )}
    </div>
  );
}

function CompactRow({
  label,
  value,
  emoji,
  medal,
  achievementLevel, // NEW prop for the badge display
}: {
  label: string;
  value: string | number;
  emoji?: string;
  medal?: "🥇" | "🥈" | "🥉";
  achievementLevel?: "none" | "bronze" | "silver" | "gold"; // NEW type
}) {
  return (
    <div
      className="
        flex items-center justify-between py-1.5 px-2 rounded
        hover:bg-muted/50 transition-colors
      "
    >
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {emoji && <span>{emoji}</span>}
        {label}
        {/* Replace single medal with AchievementBadges component if level is provided */}
        {achievementLevel ? (
          <AchievementBadges level={achievementLevel} />
        ) : (
          medal && <span>{medal}</span>
        )}
      </span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function ProgressBar({
  value,
  max,
  emoji,
  colorClass = "bg-primary",
}: {
  value: number;
  max: number;
  emoji?: string;
  colorClass?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {emoji && (
        <div className="text-[10px] text-muted-foreground text-right">
          {emoji} {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export function StatsColumn({
  stats,
  loading,
}: {
  stats: any; // Using 'any' for the sake of example, replace with ITodoStatsResponsePayload
  loading: boolean;
}) {
  const formatDay = (day: string) =>
    day.charAt(0) + day.slice(1).toLowerCase();

  // Helper to calculate the star count (e.g., max 5 stars, 1 star per 2 tasks completed, capped at 5)
  const calculateStars = (completedCount: number) =>
    Math.min(Math.floor(completedCount / 2) + 1, 5);

  // Helper to determine the badge achievement level
  const getStreakLevel = (streakCount: number) => {
    if (streakCount >= 7) return "gold";
    if (streakCount >= 3) return "silver";
    if (streakCount >= 1) return "bronze";
    return "none";
  };

  if (loading || !stats) return <StatsColumnSkeleton />;

  // Get the active stars for the quick overview
  const quickWinStars = calculateStars(stats.overview.completedTodos);

  return (
    <div className="space-y-2 h-screen overflow-auto hide-scrollbar-on-main">
      {/* Quick Overview (First block's design/data) */}
      <Card className="p-1 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            ⚡ Quick Wins
          </CardTitle>
          {/* REPLACED single sparkle with muted/shining stars */}
          <ShineStars activeStars={quickWinStars} maxStars={5} />
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-2">
          {/* REMOVED stars prop from StatCard calls */}
          <StatCard
            icon={CheckCircle2}
            label="Done"
            value={stats.overview.completedTodos}
          />
          <StatCard icon={Circle} label="In Progress" value={stats.overview.activeTodos} />
          <StatCard
            icon={AlertCircle}
            label="Uh-oh"
            value={stats.overview.overdueTodos}
            emoji="⚠️"
          />
          <StatCard
            icon={Archive}
            label="Archived"
            value={stats.overview.cancelledOrArchived}
            emoji="📦"
          />
        </CardContent>
      </Card>

      {/* Streak (First block's design/data) */}
      <Card className="p-1">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold">
            🔥 Your Streak
          </CardTitle>
          {/* REPLACED single medal with AchievementBadges */}
          <AchievementBadges
            level={getStreakLevel(stats.streak.current.count)}
          />
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="text-center p-3 bg-muted/40 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">
              {stats.streak.current.count}
            </p>
            <p className="text-xs text-muted-foreground">days strong</p>
            <div className="mt-1 text-sm">
              {"⭐".repeat(Math.min(stats.streak.current.count, 5))}
            </div>
          </div>

          <CompactRow
            label="Best run"
            value={`${stats.streak.longest.count} days`}
            medal="🥇" // Still using single medal here, as the request only specified the top-right medal change.
          />
          <CompactRow
            label="Active days (30)"
            value={`${stats.streak.health.activeDaysLast30}/30`}
            medal="🥈" // Still using single medal here
          />

          <ProgressBar
            value={stats.streak.health.percentageActiveLast30}
            max={100}
            emoji="🔥"
            colorClass="bg-orange-600"
          />
        </CardContent>
      </Card>

      {/* Today & This Week (First block's design/data) */}
      <Card className="p-1">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-sm font-semibold">
            ☀️ Today & This Week
          </CardTitle>
          <span className="text-xl">📆</span>
        </CardHeader>

        <CardContent className="space-y-1">
          <CompactRow emoji="✅" label="Completed today" value={stats.today.completedToday} />
          <CompactRow emoji="📝" label="Due today" value={stats.today.dueToday} />
          <CompactRow
            emoji="🚀"
            label="Completed this week"
            value={stats.today.completedThisWeek}
          />
          <CompactRow emoji="➕" label="Created this week" value={stats.today.createdThisWeek} />

          {stats.today.completionRateToday !== undefined && (
            <ProgressBar
              value={stats.today.completionRateToday}
              max={100}
              emoji="⭐"
            />
          )}
        </CardContent>
      </Card>

      {/* 🎯 Priority Focus (NEW SECTION from Second Block's Data) */}
      <Card className="p-1">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-sm font-semibold">
            🎯 Priority Focus
          </CardTitle>
          <span className="text-xl">🚨</span>
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

            const emoji =
              priority === "HIGH"
                ? "🔴"
                : priority === "MEDIUM"
                ? "🟡"
                : "🔵";

            return (
              <div key={priority} className="space-y-1">
                {/* Custom compact row for priority stats */}
                <CompactRow
                  emoji={emoji}
                  label={`${
                    priority.charAt(0) + priority.slice(1).toLowerCase()
                  } tasks`}
                  value={`${count} / ${rate}% done ${
                    overdue > 0 ? ` • ${overdue} ⚠️` : ""
                  }`}
                />

                {/* Using the updated ProgressBar with custom color */}
                <ProgressBar
                  value={rate}
                  max={100}
                  colorClass={barColor}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Patterns (First block's design/data) */}
      <Card className="p-1">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-sm font-semibold">
            📈 Your Rhythm
          </CardTitle>
          <span className="text-xl">🎶</span>
        </CardHeader>

        <CardContent className="space-y-1 text-xs">
          <CompactRow
            label="Best day"
            value={
              stats.timePatterns.mostProductiveDay
                ? formatDay(stats.timePatterns.mostProductiveDay)
                : "—"
            }
            emoji="🚀"
          />
          <CompactRow
            label="Avg per day"
            value={`${stats.timePatterns.averageCompletedPerDay} tasks`}
            emoji="⚡"
          />
        </CardContent>
      </Card>

      {/* Insights (First block's design/data) */}
      {stats.insights.length > 0 && (
        <Card className="p-1">
          <CardHeader className="flex justify-between">
            <CardTitle className="text-sm font-semibold">
              💡 Friendly Nudges
            </CardTitle>
            <span className="text-xl">🌱</span>
          </CardHeader>

          <CardContent className="space-y-1">
            {stats.insights.map((insight: any) => (
              <div
                key={insight.id}
                className="text-xs p-2 rounded bg-muted/40 hover:bg-muted/70 transition"
              >
                {insight.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trend Insight (NEW SECTION from Second Block's Data) */}
      {stats.statusBreakdown.trendInsight && (
        <Card className="p-1 text-center bg-green-50 dark:bg-green-900/10">
          <CardContent>
            <p className="text-xs font-medium text-green-700 dark:text-green-300">
              ✨ {stats.statusBreakdown.trendInsight}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stat, setStat] = useState<ITodoStatsResponsePayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    const response = await withClientAction<ITodoStatsResponsePayload>(() =>
      getTodoStat()
    );
    if (response) setStat(response);
    setStatsLoading(false);
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
        loading={loading}
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
        loading={loading}
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
        loading={loading}
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
      <StatsColumn stats={stat} loading={statsLoading} />

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
