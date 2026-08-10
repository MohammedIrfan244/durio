"use server";

import { prisma } from "@/lib/prisma";

export async function getUserSummary(userId: string) {
  // Basic user record (non-sensitive by default)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      displayName: true,
      avatar: true,
      timezone: true,
      fancyMode: true,
      disabledModules: true,
      createdAt: true,
      fcmTokens: true,
    },
  });

  if (!user) return null;

  // Counts for related models
  const [
    todoCount,
    noteCount,
    notificationCount,
    eventCount,
    routineBlockCount,
    blockLogCount,
    resourceLinkCount,
    aiUsage,
    todoStreakCount,
  ] = await Promise.all([
    prisma.todo.count({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
    prisma.event.count({ where: { userId } }),
    prisma.routineBlock.count({ where: { userId } }),
    prisma.blockLog.count({ where: { routineBlock: { is: { userId } } } }).catch(() => 0),
    prisma.resourceLink.count({ where: { userId } }),
    prisma.aIUsage.findUnique({ where: { userId } }),
    prisma.todoStreak.count({ where: { userId } }),
  ]).catch(() => [0, 0, 0, 0, 0, 0, 0, null, 0]);

  // Latest items per module (limited)
  const [
    latestTodos,
    latestNotes,
    latestNotifications,
    latestEvents,
    latestRoutineBlocks,
    latestBlockLogs,
    latestResourceLinks,
  ] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, status: true, createdAt: true, updatedAt: true } }),
    prisma.note.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, heading: true, status: true, createdAt: true, updatedAt: true } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, message: true, read: true, createdAt: true } }),
    prisma.event.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, startDate: true, endDate: true, createdAt: true } }),
    prisma.routineBlock.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, isActive: true, createdAt: true } }),
    prisma.blockLog.findMany({ where: { routineBlock: { is: { userId } } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, date: true, status: true, createdAt: true } }),
    prisma.resourceLink.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const aiUsageSummary =
    aiUsage && typeof aiUsage !== "number" && aiUsage !== null
      ? { requestsToday: aiUsage.requestsToday, lastRequestAt: aiUsage.lastRequestAt }
      : null;

  return {
    user,
    counts: {
      todos: todoCount,
      notes: noteCount,
      notifications: notificationCount,
      events: eventCount,
      routineBlocks: routineBlockCount,
      blockLogs: blockLogCount,
      resourceLinks: resourceLinkCount,
      aiUsage: aiUsageSummary,
      todoStreaks: todoStreakCount,
    },
    latest: {
      todos: latestTodos,
      notes: latestNotes,
      notifications: latestNotifications,
      events: latestEvents,
      routineBlocks: latestRoutineBlocks,
      blockLogs: latestBlockLogs,
      resourceLinks: latestResourceLinks,
    },
  };
}

export async function getDashboardSummary() {
  const [
    userCount,
    todoCount,
    noteCount,
    eventCount,
    recentLogs,
    users,
    todosByStatus,
    aiUsages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.todo.count(),
    prisma.note.count(),
    prisma.event.count(),
    prisma.systemLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, disabledModules: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.todo.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.aIUsage.aggregate({ _sum: { requestsToday: true } }),
  ]);

  return {
    userCount,
    todoCount,
    noteCount,
    eventCount,
    recentLogs,
    users,
    todosByStatus,
    totalAiRequests: aiUsages._sum.requestsToday || 0,
  };
}