"use server";

import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getUserId } from "@/lib/server/get-user";
import { getEffectiveAIUsageForUser } from "@/server/actions/ai-usage";

export interface DashboardStats {
  activeTodos: number;
  pendingTodos: number;
  overdueTodos: number;
  dueTodayTodos: number;
  completedToday: number;
  todoStreak: {
    count: number;
    active: number;
    longest: number;
  };
  activeNotes: number;
  upcomingEvents: number;
  eventsToday: number;
  nextEvent: {
    title: string;
    startDate: Date;
    location: string | null;
  } | null;
  aiUsage: {
    used: number;
    limit: number;
  };
}

export const getDashboardStats = withErrorWrapper<DashboardStats, []>(async () => {
  const userId = await getUserId();
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const nextSevenDays = addDays(now, 7);

  const [
    activeTodos,
    pendingTodos,
    overdueTodos,
    dueTodayTodos,
    completedToday,
    todoStreak,
    activeNotes,
    upcomingEvents,
    eventsToday,
    nextEvent,
    aiUsage,
  ] = await Promise.all([
    prisma.todo.count({
      where: {
        userId,
        status: { in: ["PLAN", "PENDING"] },
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        status: "PENDING",
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        status: "OVERDUE",
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        status: { in: ["PLAN", "PENDING", "OVERDUE"] },
        dueDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),
    prisma.todo.count({
      where: {
        userId,
        status: "DONE",
        completedAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),
    prisma.todoStreak.findUnique({
      where: { userId },
      select: {
        count: true,
        active: true,
        longest: true,
      },
    }),
    prisma.note.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    }),
    prisma.event.count({
      where: {
        userId,
        startDate: {
          gte: now,
          lte: nextSevenDays,
        },
      },
    }),
    prisma.event.count({
      where: {
        userId,
        startDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),
    prisma.event.findFirst({
      where: {
        userId,
        startDate: {
          gte: now,
          lte: nextSevenDays,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      select: {
        title: true,
        startDate: true,
        location: true,
      },
    }),
    getEffectiveAIUsageForUser(userId),
  ]);

  return {
    activeTodos,
    pendingTodos,
    overdueTodos,
    dueTodayTodos,
    completedToday,
    todoStreak: todoStreak || {
      count: 0,
      active: 0,
      longest: 0,
    },
    activeNotes,
    upcomingEvents,
    eventsToday,
    nextEvent,
    aiUsage,
  };
});
