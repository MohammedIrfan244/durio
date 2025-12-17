import { NoStats } from "@/components/skelton/todo/no-stats-skeoton";
import StatsColumnSkeleton from "@/components/skelton/todo/stats-column-skelton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITodoStatsResponsePayload } from "@/types/todo";
import { AlertCircle, Archive, CheckCircle2, Circle } from "lucide-react";

function AchievementBadges({
  level,
}: {
  level: "none" | "bronze" | "silver" | "gold";
}) {
  const levelColors = {
    gold: "text-yellow-400 dark:text-yellow-300",
    silver: "text-gray-400 dark:text-gray-300",
    bronze: "text-amber-700 dark:text-amber-500",
    none: "text-muted",
  };

  const mutedColor = "text-muted-foreground/30";

  const getBadgeColor = (
    badgeSlot: "gold" | "silver" | "bronze", 
    currentLevel: "none" | "bronze" | "silver" | "gold"
  ) => {
    let isActive = false;
    switch (badgeSlot) {
      case "gold":
        isActive = currentLevel === "gold";
        break;
      case "silver":
        isActive = currentLevel === "gold" || currentLevel === "silver";
        break;
      case "bronze":
        isActive =
          currentLevel === "gold" ||
          currentLevel === "silver" ||
          currentLevel === "bronze";
        break;
      default:
        isActive = false;
    }

    if (isActive) {
      return levelColors[currentLevel];
    }

    return mutedColor;
  };

  return (
    <div className="flex items-center space-x-0.5 text-lg animate-badge-entrance">
      <span
        className={`transition-all duration-300 hover:scale-125 ${getBadgeColor(
          "gold",
          level
        )}`}
      >
        🥇
      </span>
      <span
        className={`transition-all duration-300 hover:scale-125 ${getBadgeColor(
          "silver",
          level
        )}`}
      >
        🥈
      </span>
      <span
        className={`transition-all duration-300 hover:scale-125 ${getBadgeColor(
          "bronze",
          level
        )}`}
      >
        🥉
      </span>
    </div>
  );
}

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
        className={`text-sm transition-all duration-300 hover:scale-125 ${
          isActive
            ? "text-yellow-400 dark:text-yellow-300 animate-star-twinkle"
            : "text-muted-foreground/50 dark:text-muted-foreground/30"
        }`}
        style={{ animationDelay: `${i * 0.1}s` }}
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
        group flex items-center justify-between p-2 rounded-lg
        bg-muted/40 hover:bg-muted/70
        transition-all duration-200
        hover:-translate-y-[1px] hover:shadow-sm
        animate-fade-in-up
      "
    >
      <div className="flex gap-2 items-center">
        {Icon ? (
          <Icon className="w-4 h-4 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:animate-icon-pulse" />
        ) : (
          <span className="text-lg transition-transform duration-300 group-hover:scale-110 group-hover:animate-emoji-bounce">
            {emoji}
          </span>
        )}
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>

      <p className="text-sm font-semibold transition-all duration-300 group-hover:scale-105">{value}</p>

      {trend && (
        <div className="text-xs font-medium text-green-600 animate-slide-in-right">{trend}</div>
      )}
    </div>
  );
}

function CompactRow({
  label,
  value,
  emoji,
  medal,
  achievementLevel,
}: {
  label: string;
  value: string | number;
  emoji?: string;
  medal?: "🥇" | "🥈" | "🥉";
  achievementLevel?: "none" | "bronze" | "silver" | "gold";
}) {
  return (
    <div
      className="
        group flex items-center justify-between py-1.5 px-2 rounded
        hover:bg-muted/50 transition-all duration-200
        animate-fade-in
      "
    >
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {emoji && <span className="transition-transform duration-300 group-hover:scale-110 group-hover:animate-emoji-wiggle">{emoji}</span>}
        {label}
        {achievementLevel ? (
          <AchievementBadges level={achievementLevel} />
        ) : (
          medal && <span className="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">{medal}</span>
        )}
      </span>
      <span className="text-xs font-medium transition-all duration-300 group-hover:scale-105">{value}</span>
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
    <div className="space-y-1 group">
      <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${colorClass} animate-progress-fill`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {emoji && (
        <div className="text-[10px] text-muted-foreground text-right transition-transform duration-300 group-hover:scale-105">
          <span className="inline-block group-hover:animate-emoji-bounce">{emoji}</span> {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export function StatsColumn({
  stats,
  loading,
}: {
  stats: ITodoStatsResponsePayload | null;
  loading: boolean;
}) {
  const formatDay = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();
  const calculateStars = (completedCount: number) =>
    Math.min(Math.floor(completedCount / 2) + 1, 5);

  const getStreakLevel = (streakCount: number) => {
    if (streakCount >= 7) return "gold";
    if (streakCount >= 3) return "silver";
    if (streakCount >= 1) return "bronze";
    return "none";
  };

  if (loading) return <StatsColumnSkeleton />;
  if (!stats) return <NoStats />;

  const quickWinStars = calculateStars(stats.overview.completedTodos);

  return (
    <div className="space-y-1 h-screen overflow-auto hide-scrollbar-on-main select-none">
      <Card className="p-1 bg-gradient-to-br from-primary/5 to-primary/10 animate-card-entrance">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block animate-zap-pulse">⚡</span> Quick Wins
          </CardTitle>
          <ShineStars activeStars={quickWinStars} maxStars={5} />
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-1">
          <StatCard
            icon={CheckCircle2}
            label="Done"
            value={stats.overview.completedTodos}
          />
          <StatCard
            icon={Circle}
            label="In Progress"
            value={stats.overview.activeTodos}
          />
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

      {/* Streak */}
      <Card className="p-1 animate-card-entrance" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block animate-fire-flicker">🔥</span> Your Streak
          </CardTitle>
          <AchievementBadges
            level={getStreakLevel(stats.streak.current.count)}
          />
        </CardHeader>

        <CardContent className="space-y-1">
          <div className="text-center p-0 bg-muted/40 rounded-lg group hover:bg-muted/60 transition-all duration-300">
            <p className="text-3xl font-bold text-orange-600 transition-transform duration-300 group-hover:scale-110">
              {stats.streak.current.count}
            </p>
            <p className="text-xs text-muted-foreground">days strong</p>
            <div className="text-sm">
              {Array.from({ length: Math.min(stats.streak.current.count, 5) }, (_, i) => (
                <span key={i} className="inline-block animate-star-twinkle" style={{ animationDelay: `${i * 0.15}s` }}>⭐</span>
              ))}
            </div>
          </div>

          <CompactRow
            label="Best run"
            value={`${stats.streak.longest.count} days`}
            medal="🥇"
          />
          <CompactRow
            label="Active days (30)"
            value={`${stats.streak.health.activeDaysLast30}/30`}
            medal="🥈"
          />

          <ProgressBar
            value={stats.streak.health.percentageActiveLast30}
            max={100}
            emoji="🔥"
            colorClass="bg-orange-600"
          />
        </CardContent>
      </Card>

      <Card className="p-1 animate-card-entrance" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="flex justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block animate-sun-rotate">☀️</span> Today & This Week
          </CardTitle>
          <span className="text-xl inline-block hover:animate-calendar-flip">📆</span>
        </CardHeader>

        <CardContent>
          <CompactRow
            emoji="✅"
            label="Completed today"
            value={stats.today.completedToday}
          />
          <CompactRow
            emoji="📝"
            label="Due today"
            value={stats.today.dueToday}
          />
          <CompactRow
            emoji="🚀"
            label="Completed this week"
            value={stats.today.completedThisWeek}
          />
          <CompactRow
            emoji="➕"
            label="Created this week"
            value={stats.today.createdThisWeek}
          />

          {stats.today.completionRateToday !== undefined && (
            <ProgressBar
              value={stats.today.completionRateToday}
              max={100}
              emoji="⭐"
            />
          )}
        </CardContent>
      </Card>

      <Card className="p-1 animate-card-entrance" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="flex justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block animate-target-pulse">🎯</span> Priority Focus
          </CardTitle>
          <span className="text-xl inline-block hover:animate-alert-shake">🚨</span>
        </CardHeader>

        <CardContent>
          {(["HIGH", "MEDIUM", "LOW"] as const).map((priority, index) => {
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
              priority === "HIGH" ? "🔴" : priority === "MEDIUM" ? "🟡" : "🔵";

            return (
              <div key={priority} className="space-y-0 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CompactRow
                  emoji={emoji}
                  label={`${
                    priority.charAt(0) + priority.slice(1).toLowerCase()
                  } tasks`}
                  value={`${count} / ${rate}% done ${
                    overdue > 0 ? ` • ${overdue} ⚠️` : ""
                  }`}
                />

                <ProgressBar value={rate} max={100} colorClass={barColor} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="p-1 animate-card-entrance" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="flex justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block animate-chart-pulse">📈</span> Your Rhythm
          </CardTitle>
          <span className="text-xl inline-block hover:animate-music-bounce">🎶</span>
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

      {/* Insights */}
      {stats.insights.length > 0 && (
        <Card className="p-1 animate-card-entrance" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="inline-block animate-bulb-glow">💡</span> Friendly Nudges
            </CardTitle>
            <span className="text-xl inline-block hover:animate-plant-grow">🌱</span>
          </CardHeader>

          <CardContent className="space-y-1">
            {stats.insights.map((insight: any, index: number) => (
              <div
                key={insight.id}
                className="text-xs p-2 rounded bg-muted/40 hover:bg-muted/70 transition-all duration-300 hover:translate-x-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {insight.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {stats.statusBreakdown.trendInsight && (
        <Card className="p-1 text-center bg-green-50 dark:bg-green-900/10 animate-card-entrance animate-pulse-subtle" style={{ animationDelay: '0.6s' }}>
          <CardContent>
            <p className="text-xs font-medium text-green-700 dark:text-green-300 flex items-center justify-center gap-1">
              <span className="inline-block animate-sparkle">✨</span> {stats.statusBreakdown.trendInsight}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}