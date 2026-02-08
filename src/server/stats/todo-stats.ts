'use server';
import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getUserId } from "@/lib/server/get-user";
import { end, start } from "@/lib/utils/today";
import { ITodoStatsResponsePayload } from "@/types/todo";
import { numberToDayOfWeek, thisWeekDate } from "@/lib/utils/date-formatter";
import { generateInsights } from "@/lib/server/generate-insight";

export const getTodoStat = withErrorWrapper<
  ITodoStatsResponsePayload | null,
  []
>(async (): Promise<ITodoStatsResponsePayload | null> => {
  console.log("called")
  const userId = await getUserId();
  const timeZone = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  }).then(user => user?.timezone || "UTC");



  const overviewData = await fetchOverviewData(userId);
  const streakData = await fetchStreakData(userId);
  const weeklyData = await fetchWeeklydata(userId, timeZone);
  const priorityFocusData = await fetchPriorityFocusData(userId);
  const yourRythmData = await fetchYourRythmData(userId, timeZone);

  /* 
    Calculate stats
  */
  const overview = buildOverviewStats(overviewData);
  const streak = buildStreakStats(streakData);
  const weekly = buildWeeklyStats(weeklyData);
  const priorityFocus = buildPriorityFocusStats(priorityFocusData);
  const yourRythm = buildYourRythmStats(yourRythmData);

  /* 
    Generate Insights & Fact
  */
  const { insights, fact } = generateInsights({
    overview,
    streak,
    weekly,
    priorityFocus,
    yourRythm,
  });

  console.log("overview", overview);
  console.log("streak", streak);
  console.log("weekly", weekly);
  console.log("priorityFocus", priorityFocus);
  console.log("yourRythm", yourRythm);

  return {
    overview,
    streak,
    weekly,
    priorityFocus,
    yourRythm,
    insights,
    fact,
  } as ITodoStatsResponsePayload;
});


async function fetchOverviewData(userId: string) {

  const [totalActiveCount, counts] = await Promise.all([
    prisma.todo.count({
      where: {
        userId,
        status: { in: ["PLAN", "PENDING", "OVERDUE", "DONE"] },
      },
    }),

    Promise.all([
      prisma.todo.count({ where: { userId, status: "DONE" } }),
      prisma.todo.count({
        where: { userId, status: { in: ["PLAN", "PENDING"] } },
      }),
      prisma.todo.count({ where: { userId, status: "OVERDUE" } }),
      prisma.todo.count({ where: { userId, status: "ARCHIVED" } }),
    ]),
  ]);

  return { totalActiveCount, counts};
}

function buildOverviewStats(data: {
  totalActiveCount: number;
  counts: [number, number, number, number];
}) {
  const [completedTodos, activeTodos, overdueTodos, archivedTodos] =
    data.counts;

  return {
    totalTodos: data.totalActiveCount,
    activeTodos,
    completedTodos,
    archivedTodos,
    overdueTodos,
  };
}

async function fetchStreakData(userId: string) {
    const userStreak = await prisma.todoStreak.findUnique({
    where: { userId },
    select: { count: true, longest: true, lastCompleted: true , active: true},
    });
    const { count, longest, lastCompleted, active } = userStreak || { count: 0, longest: 0, lastCompleted: null, active: 0 };

    return { count, longest, lastCompleted, active };
}

function buildStreakStats(data: {
  count: number;
  longest: number;
  active: number;
  lastCompleted: Date | null;
}) {
  if (!data) {
    return { count: 0, longest: 0, lastCompleted: null, inLastThirtyDays: 0 };
  }

  const inLastThirtyDays = Math.min(data.active, 30);

  return {
    count: data.count,
    longest: data.longest,
    lastCompleted: data.lastCompleted,
    inLastThirtyDays
  };
}

async function fetchWeeklydata(userId: string, timeZone: string) {
  const startOfWeek = thisWeekDate(timeZone).startOfWeek;
  const endOfWeek = thisWeekDate(timeZone).endOfWeek;
   const [completedTodayCount, dueTodayCount, completedThisWeekCount , createdThisWeekCount] = await Promise.all([
    prisma.todo.count({
      where: {
        userId,
        status: "DONE",
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        status: "OVERDUE",
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        status: "DONE",
        createdAt: {
          gte:startOfWeek,
          lt: endOfWeek,
        },
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        createdAt: {
          gte:startOfWeek,
          lt: endOfWeek,
        },
      },
    }),
  ]);

  return { completedTodayCount, dueTodayCount, completedThisWeekCount, createdThisWeekCount };
}

const buildWeeklyStats = (data: {
  completedTodayCount: number;
  dueTodayCount: number;
  completedThisWeekCount: number;
  createdThisWeekCount: number;
}) => {
  return {
    completedTodayCount: data.completedTodayCount,
    dueTodayCount: data.dueTodayCount,
    completedThisWeekCount: data.completedThisWeekCount,
    createdThisWeekCount: data.createdThisWeekCount,
  };
};

async function fetchPriorityFocusData(userId: string) {
  const [highPriorityCount, mediumPriorityCount, lowPriorityCount, highPriorityCompletedCount, mediumPriorityCompletedCount, lowPriorityCompletedCount,totalCompletedCount] = await Promise.all([
    prisma.todo.count({
      where: { userId, priority: "HIGH", status: { not: "ARCHIVED" } },
    }),
    prisma.todo.count({
      where: { userId, priority: "MEDIUM", status: { not: "ARCHIVED" } },
    }),
    prisma.todo.count({
      where: { userId, priority: "LOW", status: { not: "ARCHIVED" } },
    }),
    prisma.todo.count({
      where: { userId, priority: "HIGH", status: "DONE" },
    }),
    prisma.todo.count({
      where: { userId, priority: "MEDIUM", status: "DONE" },
    }),
    prisma.todo.count({
      where: { userId, priority: "LOW", status: "DONE" },
    }),
    prisma.todo.count({
      where: { userId, status: "DONE" },
    })
  ]);

  return { highPriorityCount, mediumPriorityCount, lowPriorityCount, highPriorityCompletedCount, mediumPriorityCompletedCount, lowPriorityCompletedCount, totalCompletedCount };
}

const buildPriorityFocusStats = (data: {
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  highPriorityCompletedCount: number;
  mediumPriorityCompletedCount: number;
  lowPriorityCompletedCount: number;
  totalCompletedCount: number;
}) => {
  const highCompletionRate =
    data.highPriorityCount > 0
      ? (data.highPriorityCompletedCount / data.highPriorityCount) * 100
      : 0;

  const mediumCompletionRate =
    data.mediumPriorityCount > 0
      ? (data.mediumPriorityCompletedCount / data.mediumPriorityCount) * 100
      : 0;

  const lowCompletionRate =
    data.lowPriorityCount > 0
      ? (data.lowPriorityCompletedCount / data.lowPriorityCount) * 100
      : 0;

  return {
    highPriorityCount: data.highPriorityCount,
    mediumPriorityCount: data.mediumPriorityCount,
    lowPriorityCount: data.lowPriorityCount,

    highCompletionRate,
    mediumCompletionRate,
    lowCompletionRate,
  };
};

async function fetchYourRythmData(userId: string, timeZone: string) {
  const startOfWeek = thisWeekDate(timeZone).startOfWeek;
  const endOfWeek = thisWeekDate(timeZone).endOfWeek;
  const [bestDayOfWeek, averagePerDay] = await Promise.all([
    prisma.todo.groupBy({
      by: ['completedAt'],
      where: {
        userId,
        completedAt: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      _count: {
        completedAt: true,
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        createdAt: {
          gte:startOfWeek,
          lt: endOfWeek,
        },
      },
    }),
    
  ]);

  return { bestDayOfWeek: bestDayOfWeek.filter((item) => item.completedAt !== null) as { completedAt: Date; _count: { completedAt: number } }[], averagePerDay };
}

const buildYourRythmStats = (data: {
  bestDayOfWeek: { completedAt: Date; _count: { completedAt: number } }[];
  averagePerDay: number;
}) => {
  
  if (data.bestDayOfWeek.length === 0) {
    return {
      bestDayOfWeek: "", // Returns empty string to match RythmStats type
      averagePerDay: 0,
    };
  }

  const bestDay = data.bestDayOfWeek.reduce((max, current) => {
    return current._count.completedAt > max._count.completedAt
      ? current
      : max;
  });

const bestDayOfWeekNumber = bestDay ? bestDay.completedAt.getDay() : null;

const bestDayOfWeek = numberToDayOfWeek(bestDayOfWeekNumber ?? -1);
const averagePerDay = data.averagePerDay / 7;

  return {
    bestDayOfWeek: bestDayOfWeek,
    averagePerDay: averagePerDay,
  };
};