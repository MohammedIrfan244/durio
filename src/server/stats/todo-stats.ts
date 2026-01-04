'use server'
import { prisma } from "@/lib/prisma"
import { withErrorWrapper } from "@/lib/server-utils/error-wrapper"
import { getUserId } from "@/lib/server-utils/get-user"
import { ITodoStatsResponsePayload, Weekday } from "@/types/todo"
import { getUserTimezone, getUserDateRanges } from "@/lib/server-utils/date-utils"
import { generateInsights } from "@/lib/server-utils/generate-insight"

export const getTodoStat = withErrorWrapper<ITodoStatsResponsePayload | null, []>(
  async (): Promise<ITodoStatsResponsePayload | null> => {
    const userId = await getUserId()
    const timezone = await getUserTimezone(userId);
    const { now, startOfToday, startOfTomorrow, startOfWeek, startOfLast30Days, daysElapsedThisWeek } = getUserDateRanges(timezone)

    // 1. Initial check
    const totalCount = await prisma.todo.count({ where: { userId } })
    if (totalCount === 0) return null

    // 2. Aggregate Data in parallel
    const [counts, todayStats, streakData, completedLast30, statusRaw, priorityRaw] = await Promise.all([
      // Basic Overviews
      Promise.all([
        prisma.todo.count({ where: { userId, status: { in: ["PLAN", "PENDING"] } } }),
        prisma.todo.count({ where: { userId, status: "DONE" } }),
        prisma.todo.count({ where: { userId, status: { in: ["CANCELLED", "ARCHIVED"] } } }),
        prisma.todo.count({ where: { userId, status: { in: ["PLAN", "PENDING"] }, dueDate: { lt: now } } }),
      ]),
      // Today/Week Stats
      Promise.all([
        prisma.todo.count({ where: { userId, dueDate: { gte: startOfToday, lt: startOfTomorrow } } }),
        prisma.todo.count({ where: { userId, status: "DONE", completedAt: { gte: startOfToday, lt: startOfTomorrow } } }),
        prisma.todo.count({ where: { userId, status: "DONE", completedAt: { gte: startOfWeek, lt: startOfTomorrow } } }),
        prisma.todo.count({ where: { userId, createdAt: { gte: startOfToday, lt: startOfTomorrow } } }),
        prisma.todo.count({ where: { userId, createdAt: { gte: startOfWeek, lt: startOfTomorrow } } }),
        prisma.todo.count({ where: { userId, completedAt: { gte: startOfToday, lt: startOfTomorrow }, dueDate: { gte: startOfToday, lt: startOfTomorrow } } }),
      ]),
      prisma.todoStreak.findUnique({ where: { userId } }),
      prisma.todo.findMany({ 
        where: { userId, status: "DONE", completedAt: { gte: startOfLast30Days } },
        select: { completedAt: true } 
      }),
      prisma.todo.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } }),
      prisma.todo.groupBy({ by: ["priority"], where: { userId }, _count: { _all: true } }),
    ])

    // 3. Process Time Patterns & Status
    const weekdayCount: Record<Weekday, number> = { MONDAY: 0, TUESDAY: 0, WEDNESDAY: 0, THURSDAY: 0, FRIDAY: 0, SATURDAY: 0, SUNDAY: 0 };
    const activeDaySet = new Set<string>();
    const weekdayMap: Record<number, Weekday> = { 0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY", 4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY" };

    completedLast30.forEach(t => {
      if (t.completedAt) {
        const d = new Date(t.completedAt);
        activeDaySet.add(d.toDateString());
        weekdayCount[weekdayMap[d.getDay()]]++;
      }
    });

    // 4. Final Assembly (mapping logic)
    const [activeTodos, completedTodos, cancelledOrArchived, overdueTodos] = counts;
    const [dueToday, completedToday, completedThisWeek, createdToday, createdThisWeek, completedTodayOfDueToday] = todayStats;

    const statsPayload: ITodoStatsResponsePayload = {
      overview: { totalTodos: totalCount, activeTodos, completedTodos, cancelledOrArchived, overdueTodos },
      today: { 
        dueToday, overdueNow: overdueTodos, completedToday, completedThisWeek, 
        createdToday, createdThisWeek, 
        completionRateToday: dueToday > 0 ? Math.round((completedTodayOfDueToday / dueToday) * 100) : undefined 
      },
      streak: {
        current: {
          isActive: !!streakData?.lastCompleted && streakData.lastCompleted >= startOfToday,
          count: streakData?.count ?? 0,
          lastCompletedDate: streakData?.lastCompleted?.toISOString(),
          daysSinceLastCompletion: streakData?.lastCompleted && !(streakData.lastCompleted >= startOfToday) 
            ? Math.max(0, Math.floor((startOfToday.getTime() - new Date(streakData.lastCompleted).getTime()) / 86400000))
            : undefined
        },
        longest: { count: streakData?.longest ?? 0 },
        health: {
          averageCompletedPerStreakDay: (streakData?.count ?? 0) > 0 ? completedThisWeek / (streakData?.count || 1) : 0,
          activeDaysLast30: activeDaySet.size,
          percentageActiveLast30: Math.round((activeDaySet.size / 30) * 100)
        }
      },
      statusBreakdown: {
        counts: { PLAN: 0, PENDING: 0, DONE: 0, CANCELLED: 0, ARCHIVED: 0, OVERDUE: overdueTodos, ...Object.fromEntries(statusRaw.map(s => [s.status, s._count._all])) },
        trendInsight: completedThisWeek >= createdThisWeek ? "More tasks are getting completed than created." : "Task creation is outpacing completion."
      },
      priorityInsights: {
        counts: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0, ...Object.fromEntries(priorityRaw.map(p => [p.priority ?? "NONE", p._count._all])) },
        completionRate: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
        overdue: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 }
      },
      timePatterns: {
        mostProductiveDay: (Object.entries(weekdayCount).sort((a, b) => b[1] - a[1])[0]?.[0] as Weekday) || null,
        leastProductiveDay: (Object.entries(weekdayCount).filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1])[0]?.[0] as Weekday) || null,
        averageCompletedPerDay: Math.round((completedThisWeek / daysElapsedThisWeek) * 10) / 10,
        zeroActivityDaysLast30: 30 - activeDaySet.size
      },
      recurringAndChecklist: {
        recurring: { total: 0, completedOnTime: 0, overdueOrSkipped: 0 },
        checklist: { todosWithChecklist: 0, todosWithoutChecklist: totalCount, averageItemsPerTodo: 0, completionRate: 0 }
      },
      insights: [] // Assigned below
    }

    statsPayload.insights = generateInsights({
      overview: statsPayload.overview,
      today: statsPayload.today,
      streak: statsPayload.streak,
      priority: statsPayload.priorityInsights,
      time: statsPayload.timePatterns
    });

    return statsPayload;
  }
)