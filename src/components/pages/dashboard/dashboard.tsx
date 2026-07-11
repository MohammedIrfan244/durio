"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CloudSun,
  Equal,
  Settings,
  Sparkles,
  StickyNote,
  Target,
  Trophy,
} from "lucide-react";
import { APP_REGISTRY } from "@/config/modules";
import { navItems, type NavItem } from "@/lib/nav";
import { useUserClient } from "@/lib/utils/get-user-client";
import { formatName } from "@/lib/utils/name-formatter";
import { getDashboardStats, type DashboardStats } from "@/server/stats/dashboard-stats";
import { getWeatherForecast } from "@/server/actions/weather-actions";
import { useSettings } from "@/components/providers/settings-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type WeatherCurrent = {
  temp: number;
  feelsLike: number;
  label: string;
};

const DEFAULT_STATS: DashboardStats = {
  activeTodos: 0,
  pendingTodos: 0,
  overdueTodos: 0,
  dueTodayTodos: 0,
  completedToday: 0,
  todoStreak: {
    count: 0,
    active: 0,
    longest: 0,
  },
  activeNotes: 0,
  upcomingEvents: 0,
  eventsToday: 0,
  nextEvent: null,
  aiUsage: {
    used: 0,
    limit: 150,
  },
};

const SETTINGS_NAV_ITEM: NavItem = {
  label: "Settings",
  url: "/settings",
  description: "Tune DURIO to match how you work.",
  icon: <Settings size={18} />,
  color: "#94A3B8",
  animationClass: "settings-icon",
  disabled: !APP_REGISTRY.MODULES.SETTINGS.enabled || APP_REGISTRY.MODULES.SETTINGS.systemDisabled,
};

const MESSAGE_POOLS = {
  notesLight: [
    "A few notes, nicely breathable. Good room for new thoughts.",
    "Your note garden is still cozy. Perfect time to capture small ideas.",
    "Lean notes setup. Nothing noisy, nothing lost.",
  ],
  notesModerate: [
    "Healthy note rhythm. You are building a useful second brain.",
    "Nice archive forming. Your ideas are starting to connect.",
    "Steady note keeper energy. The good kind of organized.",
  ],
  notesHeavy: [
    "That is a serious knowledge vault. Search is your best friend now.",
    "Heavy note user mode unlocked. Your brain has backup storage.",
    "Your notes have become a small library. Respectfully powerful.",
  ],
  todoClear: [
    "The board is behaving. Keep the next move small and obvious.",
    "No overdue noise right now. Nice little window to make progress.",
    "Things look manageable. Future-you may actually approve.",
  ],
  todoOverdue: [
    "A few tasks need rescue. Start with the smallest overdue one.",
    "Overdue items are waving from the corner. Time for a quick sweep.",
    "The board has some heat on it. Pick one overdue task and cool it down.",
  ],
  calendarEmpty: [
    "Nothing important coming huh ?",
    "Calendar looks quiet. Suspiciously peaceful.",
    "No big dates ahead. That is either freedom or a trap.",
  ],
  duriaLow: [
    "DURIA is fresh and ready. Ask freely.",
    "Plenty of AI room left for planning, sorting, and tiny rescues.",
    "Usage is light. DURIA is basically stretching at the starting line.",
  ],
  duriaMedium: [
    "You have used a decent chunk. Keep prompts focused for best mileage.",
    "DURIA has been busy today. Still enough room for useful help.",
    "Middle of the tank. Good time to ask the questions that matter.",
  ],
  duriaHigh: [
    "Close to the daily ceiling. Save the remaining queries for the important stuff.",
    "DURIA is running hot today. Short prompts, sharp requests.",
    "Almost at the limit. Choose the next questions like premium snacks.",
  ],
  fancyOn: [
    "Fancy Mode is on. DURIO gets to keep the sparkle.",
    "Visual richness enabled. The app is dressed for the occasion.",
    "Fancy Mode active. Smoothness and personality are invited in.",
  ],
  fancyOff: [
    "Fancy Mode is off. Lean, calm, battery-friendly.",
    "Performance-first mode. DURIO is traveling light.",
    "Animations are tucked away. Quiet mode engaged.",
  ],
};

function Dashboard() {
  const user = useUserClient();
  const { fancyMode, disabledModules } = useSettings();
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const today = useMemo(() => formatToday(), []);
  const greeting = useMemo(() => getGreeting(), []);
  const displayName = formatName(user.displayName || user.name || "User");

  const loadStats = useCallback(async () => {
    setLoading(true);
    const response = await getDashboardStats();
    if (response.success && response.data) {
      setStats(response.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      setWeatherLoading(true);
      const response = await getWeatherForecast(lat, lon);
      if (response.success && response.data?.current) {
        setWeather({
          temp: Math.round(response.data.current.temperature_2m),
          feelsLike: Math.round(response.data.current.apparent_temperature),
          label: getWeatherLabel(response.data.current.weather_code),
        });
      }
      setWeatherLoading(false);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => fetchWeather(11.2588, 75.7804)
      );
    } else {
      fetchWeather(11.2588, 75.7804);
    }
  }, []);

  const topInsights = [
    {
      label: "Today Load",
      value: stats.pendingTodos + stats.dueTodayTodos + stats.eventsToday,
      detail: `${stats.pendingTodos} pending, ${stats.dueTodayTodos} due, ${stats.eventsToday} events`,
      icon: <Target size={18} />,
      tone: stats.overdueTodos > 0 ? "text-destructive" : "text-primary",
    },
    {
      label: "Momentum",
      value: stats.completedToday,
      detail: `${stats.todoStreak.count} day streak, best ${stats.todoStreak.longest}`,
      icon: <Trophy size={18} />,
      tone: "text-emerald-400",
    },
    {
      label: "Knowledge",
      value: stats.activeNotes,
      detail: getNotesMessage(stats.activeNotes),
      icon: <StickyNote size={18} />,
      tone: "text-pink-400",
    },
    {
      label: "AI Budget",
      value: `${stats.aiUsage.used}/${stats.aiUsage.limit}`,
      detail: getDuriaMessage(stats.aiUsage.used, stats.aiUsage.limit),
      icon: <Sparkles size={18} />,
      tone: getDuriaPercent(stats.aiUsage.used, stats.aiUsage.limit) > 95 ? "text-destructive" : "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card to-secondary/40" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles size={14} />
              Daily command center
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                {greeting}, {displayName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                The whole system at a glance: commitments, knowledge, calendar, tools, and DURIA.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/50 p-4 text-left shadow-sm backdrop-blur md:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{today}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {topInsights.map((card) => (
          <Card
            key={card.label}
            className="group dashboard-card h-full border-border/50 bg-card/80 py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/60 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${card.tone}`}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                {loading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className={`text-2xl font-bold leading-none transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5 origin-left ${card.tone}`}>
                    {card.value}
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold text-foreground">{card.label}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground/70">{card.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Modules</h2>
            <p className="text-sm text-muted-foreground">Useful snapshots from each space, with navigation kept close.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(APP_REGISTRY.MODULES)
            .filter(([moduleKey]) => moduleKey !== "HOME")
            .map(([moduleKey, module]) => {
              const navItem = getNavItem(module.path);
              const disabled = !module.enabled
                || module.systemDisabled
                || Boolean(navItem.disabled)
                || disabledModules.includes(moduleKey);

              return (
                <ModuleCard
                  key={moduleKey}
                  moduleKey={moduleKey}
                  navItem={navItem}
                  disabled={disabled}
                  stats={stats}
                  loading={loading}
                  weather={weather}
                  weatherLoading={weatherLoading}
                  fancyMode={fancyMode}
                />
              );
            })}
        </div>
      </section>
    </div>
  );
}

function ModuleCard({
  moduleKey,
  navItem,
  disabled,
  stats,
  loading,
  weather,
  weatherLoading,
  fancyMode,
}: {
  moduleKey: string;
  navItem: NavItem;
  disabled: boolean;
  stats: DashboardStats;
  loading: boolean;
  weather: WeatherCurrent | null;
  weatherLoading: boolean;
  fancyMode: boolean;
}) {
  const content = (
    <Card
      className={`relative h-full min-h-[238px] overflow-hidden border py-0 transition-all duration-300 ${
        disabled
          ? "cursor-not-allowed opacity-50 grayscale"
          : "hover:-translate-y-1 hover:shadow-xl hover:border-opacity-60"
      }`}
      style={{
        borderColor: `${navItem.color}33`,
        background: `linear-gradient(135deg, ${navItem.color}20, var(--card) 42%, ${navItem.color}10)`,
      }}
    >
      <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
        <div className="nav-item-group flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-background/55 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${navItem.animationClass}`}
            style={{
              color: navItem.color,
              borderColor: `${navItem.color}44`,
            }}
          >
            {navItem.icon}
          </div>
          {disabled ? (
            <Badge variant="secondary" className="bg-secondary/80 text-muted-foreground">
              Coming Soon
            </Badge>
          ) : (
            <ArrowUpRight
              size={16}
              className="text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary group-hover:scale-110"
            />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground">{navItem.label}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {navItem.description}
            </p>
          </div>

          {disabled ? (
            <ComingSoonContent />
          ) : (
            <ModuleInsight
              moduleKey={moduleKey}
              navItem={navItem}
              stats={stats}
              loading={loading}
              weather={weather}
              weatherLoading={weatherLoading}
              fancyMode={fancyMode}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (disabled || moduleKey === "CALCULATOR") {
    return content;
  }

  return (
    <Link href={navItem.url} className="group dashboard-card">
      {content}
    </Link>
  );
}

function ModuleInsight({
  moduleKey,
  navItem,
  stats,
  loading,
  weather,
  weatherLoading,
  fancyMode,
}: {
  moduleKey: string;
  navItem: NavItem;
  stats: DashboardStats;
  loading: boolean;
  weather: WeatherCurrent | null;
  weatherLoading: boolean;
  fancyMode: boolean;
}) {
  if (loading && moduleKey !== "CALCULATOR" && moduleKey !== "SETTINGS") {
    return <Skeleton className="h-20 w-full rounded-xl" />;
  }

  if (moduleKey === "TODO") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <MiniMetric label="Pending" value={stats.pendingTodos} />
          <MiniMetric label="Due" value={stats.dueTodayTodos} />
          <MiniMetric label="Streak" value={stats.todoStreak.count} />
        </div>
        <p className="rounded-lg border border-border/40 bg-background/45 p-3 text-xs leading-relaxed text-muted-foreground">
          {getTodoMessage(stats.overdueTodos, stats.completedToday)}
        </p>
      </div>
    );
  }

  if (moduleKey === "NOTES") {
    return (
      <div className="space-y-3">
        <MiniMetric label="Active notes" value={stats.activeNotes} />
        <p className="rounded-lg border border-border/40 bg-background/45 p-3 text-xs leading-relaxed text-muted-foreground">
          {getNotesMessage(stats.activeNotes)}
        </p>
      </div>
    );
  }

  if (moduleKey === "CALENDAR") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="Today" value={stats.eventsToday} />
          <MiniMetric label="7 days" value={stats.upcomingEvents} />
        </div>
        <p className="rounded-lg border border-border/40 bg-background/45 p-3 text-xs leading-relaxed text-muted-foreground">
          {stats.nextEvent
            ? `Next: ${stats.nextEvent.title} on ${formatEventDate(stats.nextEvent.startDate)}.`
            : getPooledMessage(MESSAGE_POOLS.calendarEmpty, stats.upcomingEvents)}
        </p>
        <WeatherStrip weather={weather} loading={weatherLoading} />
      </div>
    );
  }

  if (moduleKey === "CALCULATOR") {
    return <MiniCalculator navItem={navItem} />;
  }

  if (moduleKey === "DURIA") {
    const percentage = getDuriaPercent(stats.aiUsage.used, stats.aiUsage.limit);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/45 p-3">
          <span className="text-xs font-semibold text-muted-foreground">Usage</span>
          <span className={percentage > 95 ? "text-sm font-bold text-destructive" : "text-sm font-bold text-foreground"}>
            {stats.aiUsage.used}/{stats.aiUsage.limit}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-background/60">
          <div
            className={percentage > 95 ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-primary"}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{getDuriaMessage(stats.aiUsage.used, stats.aiUsage.limit)}</p>
      </div>
    );
  }

  if (moduleKey === "SETTINGS") {
    return (
      <div className="space-y-3">
        <MiniMetric label="Fancy Mode" value={fancyMode ? "On" : "Off"} />
        <p className="rounded-lg border border-border/40 bg-background/45 p-3 text-xs leading-relaxed text-muted-foreground">
          {getPooledMessage(fancyMode ? MESSAGE_POOLS.fancyOn : MESSAGE_POOLS.fancyOff, fancyMode ? 1 : 0)}
        </p>
      </div>
    );
  }

  return <ComingSoonContent />;
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/45 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function WeatherStrip({ weather, loading }: { weather: WeatherCurrent | null; loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-10 w-full rounded-lg" />;
  }

  if (!weather) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/45 p-3 text-xs text-muted-foreground">
        <CloudSun size={14} />
        Weather is taking a tiny detour.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/45 p-3">
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <CloudSun size={14} />
        {weather.label}
      </span>
      <span className="text-sm font-bold text-foreground">
        {weather.temp} C <span className="text-xs font-medium text-muted-foreground">feels {weather.feelsLike} C</span>
      </span>
    </div>
  );
}

function MiniCalculator({ navItem }: { navItem: NavItem }) {
  const [expression, setExpression] = useState("12+8");
  const result = useMemo(() => calculateExpression(expression), [expression]);
  const keys = ["7", "8", "9", "+", "4", "5", "6", "-", "1", "2", "3", "*", "C", "0", "=", "/"];

  const pressKey = (key: string) => {
    if (key === "C") {
      setExpression("");
      return;
    }
    if (key === "=") {
      setExpression(result === "Err" ? "" : result);
      return;
    }
    setExpression((current) => `${current}${key}`.slice(0, 18));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/40 bg-background/55 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{expression || "0"}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            <Equal size={13} />
            {result}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                pressKey(key);
              }}
              className="h-7 rounded-md border border-border/40 bg-card/70 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {navItem.subItems?.map((item) => (
          <Button key={item.url} asChild variant="outline" size="sm" className="h-8 justify-start px-2 text-xs">
            <Link href={item.url}>{item.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

function ComingSoonContent() {
  return (
    <div className="rounded-lg border border-border/40 bg-background/45 p-3 text-xs leading-relaxed text-muted-foreground">
      This space is parked for later, but it still belongs on the map.
    </div>
  );
}

function getNavItem(path: string) {
  return navItems.find((item) => item.url === path) || SETTINGS_NAV_ITEM;
}

function getNotesMessage(count: number) {
  if (count < 10) return getPooledMessage(MESSAGE_POOLS.notesLight, count);
  if (count < 50) return getPooledMessage(MESSAGE_POOLS.notesModerate, count);
  return getPooledMessage(MESSAGE_POOLS.notesHeavy, count);
}

function getTodoMessage(overdue: number, completedToday: number) {
  if (overdue > 0) {
    return `${overdue} overdue task${overdue === 1 ? "" : "s"}. ${getPooledMessage(MESSAGE_POOLS.todoOverdue, overdue)}`;
  }

  return `${completedToday} completed today. ${getPooledMessage(MESSAGE_POOLS.todoClear, completedToday)}`;
}

function getDuriaMessage(used: number, limit: number) {
  const percentage = getDuriaPercent(used, limit);
  if (percentage > 95) return getPooledMessage(MESSAGE_POOLS.duriaHigh, used);
  if (percentage >= 50) return getPooledMessage(MESSAGE_POOLS.duriaMedium, used);
  return getPooledMessage(MESSAGE_POOLS.duriaLow, used);
}

function getPooledMessage(messages: string[], seed: number | boolean) {
  const daySeed = new Date().getDate();
  const numericSeed = typeof seed === "boolean" ? Number(seed) : seed;
  return messages[Math.abs(daySeed + numericSeed) % messages.length];
}

function getDuriaPercent(used: number, limit: number) {
  return limit > 0 ? (used / limit) * 100 : 0;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getWeatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

function calculateExpression(expression: string) {
  if (!expression.trim()) return "0";
  if (!/^[\d+\-*/.()\s]+$/.test(expression)) return "Err";

  try {
    const value = evaluateBasicExpression(expression);
    return Number.isFinite(value) ? String(Number(value.toFixed(6))) : "Err";
  } catch {
    return "Err";
  }
}

function evaluateBasicExpression(expression: string) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.length === 0) throw new Error("Invalid expression");

  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

  const applyOperator = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (operator === undefined || right === undefined || left === undefined) {
      throw new Error("Invalid expression");
    }

    if (operator === "+") values.push(left + right);
    if (operator === "-") values.push(left - right);
    if (operator === "*") values.push(left * right);
    if (operator === "/") values.push(left / right);
  };

  tokens.forEach((token, index) => {
    if (/^\d/.test(token)) {
      values.push(Number(token));
      return;
    }

    if (index === 0 || operators.length + 1 > values.length) {
      throw new Error("Invalid expression");
    }

    while (
      operators.length > 0
      && precedence[operators[operators.length - 1]] >= precedence[token]
    ) {
      applyOperator();
    }
    operators.push(token);
  });

  while (operators.length > 0) {
    applyOperator();
  }

  if (values.length !== 1) throw new Error("Invalid expression");
  return values[0];
}

export default Dashboard;
