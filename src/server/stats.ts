'use server'
import { prisma } from "@/lib/prisma"
import { withErrorWrapper } from "@/lib/server-utils/error-wrapper"
import { getUserId } from "@/lib/server-utils/get-user"
import { ITodoStatsResponsePayload, OverviewStats, PersonalInsight, PriorityInsights, StatusBreakdownStats, StreakStats, TimePatternStats, TodayStats, Weekday } from "@/types/todo"


function generateInsights(input: {
  overview: OverviewStats
  today: TodayStats
  streak: StreakStats
  priority: PriorityInsights
  time: TimePatternStats
}): PersonalInsight[] {
  const insights: PersonalInsight[] = [];

  if (input.streak.current.isActive && input.streak.current.count >= 7) {
    insights.push({
      id: "strong-streak",
      type: "POSITIVE",
      message: "You are maintaining a strong and consistent daily streak.",
    });
  }

  if (!input.streak.current.isActive && input.streak.current.count > 0) {
    insights.push({
      id: "streak-broken",
      type: "WARNING",
      message:
        "Your streak has been broken. Completing at least one task today will restart it.",
    });
  }

  if (input.overview.overdueTodos > 0) {
    insights.push({
      id: "overdue-pressure",
      type: "WARNING",
      message: "Overdue tasks are adding pressure to your workflow.",
    });
  }

  if (
    input.priority.counts.HIGH > 0 &&
    input.priority.overdue.HIGH === 0
  ) {
    insights.push({
      id: "high-priority-control",
      type: "POSITIVE",
      message:
        "You are staying on top of high-priority tasks without letting them slip.",
    });
  }

  if (input.today.completedThisWeek > input.today.createdThisWeek) {
    insights.push({
      id: "backlog-reduction",
      type: "POSITIVE",
      message:
        "You are reducing your backlog by completing more tasks than you create.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "neutral-state",
      type: "NEUTRAL",
      message:
        "Your activity is stable. Small consistent actions will improve your momentum.",
    });
  }

  return insights;
}

// Action to get todo statistics done
export const getTodoStat = withErrorWrapper<ITodoStatsResponsePayload | null, []>(
  async (): Promise<ITodoStatsResponsePayload | null> => {
    const userId = await getUserId()

    const checkExist = await prisma.todo.findMany()
    if (checkExist.length === 0) {
      return null;
    }
    const now = new Date()

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

    const startOfWeek = new Date(startOfToday)
    const day = startOfWeek.getDay() || 7 // ISO week (Mon = 1)
    startOfWeek.setDate(startOfWeek.getDate() - (day - 1))

    const daysElapsedThisWeek =
      Math.floor(
        (startOfTomorrow.getTime() - startOfWeek.getTime()) /
          (1000 * 60 * 60 * 24)
      ) || 1

    const startOfLast30Days = new Date(startOfToday)
    startOfLast30Days.setDate(startOfLast30Days.getDate() - 29)

    const [
      totalTodos,
      activeTodos,
      completedTodos,
      cancelledOrArchived,
      overdueTodos,
    ] = await Promise.all([
      prisma.todo.count({ where: { userId } }),

      prisma.todo.count({
        where: {
          userId,
          status: { in: ["PLAN", "PENDING"] },
        },
      }),

      prisma.todo.count({
        where: { userId, status: "DONE" },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: { in: ["CANCELLED", "ARCHIVED"] },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: { in: ["PLAN", "PENDING"] },
          dueDate: { lt: now },
        },
      }),
    ])

    const [
      dueToday,
      completedToday,
      completedThisWeek,
      createdToday,
      createdThisWeek,
      completedTodayOfDueToday,
    ] = await Promise.all([
      prisma.todo.count({
        where: {
          userId,
          dueDate: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: "DONE",
          completedAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: "DONE",
          completedAt: {
            gte: startOfWeek,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          createdAt: {
            gte: startOfWeek,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          completedAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
          dueDate: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),
    ])

    const completionRateToday =
      dueToday > 0
        ? Math.round((completedTodayOfDueToday / dueToday) * 100)
        : undefined

    const streak = await prisma.todoStreak.findUnique({
      where: { userId },
    })

    const isStreakActive =
      !!streak?.lastCompleted &&
      streak.lastCompleted >= startOfToday

    const daysSinceLastCompletion =
      streak?.lastCompleted && !isStreakActive
        ? Math.max(
            0,
            Math.floor(
              (startOfToday.getTime() -
                new Date(streak.lastCompleted).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : undefined

    const completedLast30 = await prisma.todo.findMany({
      where: {
        userId,
        status: "DONE",
        completedAt: { gte: startOfLast30Days },
      },
      select: { completedAt: true },
    })

    const activeDaySet = new Set<string>()
    const weekdayCount: Record<string, number> = {
      MONDAY: 0,
      TUESDAY: 0,
      WEDNESDAY: 0,
      THURSDAY: 0,
      FRIDAY: 0,
      SATURDAY: 0,
      SUNDAY: 0,
    }

    for (const t of completedLast30) {
      if (!t.completedAt) continue

      const d = new Date(t.completedAt)
      d.setHours(0, 0, 0, 0)

      activeDaySet.add(d.toISOString())

      const weekday = d.getDay()
      const map: Record<number, Weekday> = {
        0: "SUNDAY",
        1: "MONDAY",
        2: "TUESDAY",
        3: "WEDNESDAY",
        4: "THURSDAY",
        5: "FRIDAY",
        6: "SATURDAY",
      }

      weekdayCount[map[weekday]]++
    }

    const activeDaysLast30 = activeDaySet.size
    const percentageActiveLast30 = Math.round(
      (activeDaysLast30 / 30) * 100
    )

    const statusRaw = await prisma.todo.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    })

    const statusCounts: StatusBreakdownStats["counts"] = {
      PLAN: 0,
      PENDING: 0,
      DONE: 0,
      CANCELLED: 0,
      ARCHIVED: 0,
      OVERDUE: overdueTodos,
    }

    for (const s of statusRaw) {
      statusCounts[s.status] = s._count._all
    }

    const priorityRaw = await prisma.todo.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { _all: true },
    })

    const priorityCounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0,
    }

    for (const p of priorityRaw) {
      priorityCounts[p.priority ?? "NONE"] = p._count._all
    }

    const mostProductiveDay =
      (Object.entries(weekdayCount).sort((a, b) => b[1] - a[1])[0]?.[0] as Weekday) ??
      null

    const leastProductiveDay =
      (Object.entries(weekdayCount)
        .filter(([, v]) => v > 0)
        .sort((a, b) => a[1] - b[1])[0]?.[0] as Weekday) ?? null

    return {
      overview: {
        totalTodos,
        activeTodos,
        completedTodos,
        cancelledOrArchived,
        overdueTodos,
      },

      today: {
        dueToday,
        overdueNow: overdueTodos,
        completedToday,
        completedThisWeek,
        createdToday,
        createdThisWeek,
        completionRateToday,
      },

      streak: {
        current: {
          isActive: isStreakActive,
          count: streak?.count ?? 0,
          lastCompletedDate: streak?.lastCompleted?.toISOString(),
          daysSinceLastCompletion,
        },
        longest: {
          count: streak?.longest ?? 0,
        },
        health: {
          averageCompletedPerStreakDay:
            streak && streak.count > 0
              ? completedThisWeek / streak.count
              : 0,
          activeDaysLast30,
          percentageActiveLast30,
        },
      },

      statusBreakdown: {
        counts: statusCounts,
        trendInsight:
          completedThisWeek >= createdThisWeek
            ? "More tasks are getting completed than created."
            : "Task creation is outpacing completion.",
      },

      priorityInsights: {
        counts: priorityCounts,
        completionRate: {
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0,
          NONE: 0,
        },
        overdue: {
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0,
          NONE: 0,
        },
      },

      timePatterns: {
        mostProductiveDay,
        leastProductiveDay,
        averageCompletedPerDay:
          Math.round(
            (completedThisWeek / daysElapsedThisWeek) * 10
          ) / 10,
        zeroActivityDaysLast30: 30 - activeDaysLast30,
      },

      recurringAndChecklist: {
        recurring: {
          total: 0,
          completedOnTime: 0,
          overdueOrSkipped: 0,
        },
        checklist: {
          todosWithChecklist: 0,
          todosWithoutChecklist: totalTodos,
          averageItemsPerTodo: 0,
          completionRate: 0,
        },
      },

      insights: generateInsights({
        overview: {
          totalTodos,
          activeTodos,
          completedTodos,
          cancelledOrArchived,
          overdueTodos,
        },
        today: {
          dueToday,
          overdueNow: overdueTodos,
          completedToday,
          completedThisWeek,
          createdToday,
          createdThisWeek,
          completionRateToday,
        },
        streak: {
          current: {
            isActive: isStreakActive,
            count: streak?.count ?? 0,
            lastCompletedDate: streak?.lastCompleted?.toISOString(),
            daysSinceLastCompletion,
          },
          longest: {
            count: streak?.longest ?? 0,
          },
          health: {
            averageCompletedPerStreakDay:
              streak && streak.count > 0
                ? completedThisWeek / streak.count
                : 0,
            activeDaysLast30,
            percentageActiveLast30,
          },
        },
        priority: {
          counts: priorityCounts,
          completionRate: {
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
            NONE: 0,
          },
          overdue: {
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
            NONE: 0,
          },
        },
        time: {
          mostProductiveDay,
          leastProductiveDay,
          averageCompletedPerDay:
            Math.round(
              (completedThisWeek / daysElapsedThisWeek) * 10
            ) / 10,
          zeroActivityDaysLast30: 30 - activeDaysLast30,
        },
      }),
    }
  }
)