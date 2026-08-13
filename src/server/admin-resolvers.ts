"use server";

import { prisma } from "@/lib/prisma";

interface AvatarHistoryItem {
  publicId: string;
  secureUrl: string;
  createdAt: string;
  width?: number;
  height?: number;
  format?: string;
  isCurrent: boolean;
}

async function getAvatarHistory(userId: string, currentAvatarUrl: string | null): Promise<AvatarHistoryItem[]> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folderName = process.env.CLOUDINARY_FOLDER_NAME;

  if (!cloudName || !apiKey || !apiSecret || !folderName) {
    return [];
  }

  const prefix = `${folderName}/avatars/${userId}`;
  const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
  const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`);
  url.searchParams.set("prefix", prefix);
  url.searchParams.set("max_results", "100");
  url.searchParams.set("direction", "desc");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Cloudinary avatar history load failed", res.status, res.statusText, body);
      return [];
    }

    const result = await res.json();
    if (!result.resources || !Array.isArray(result.resources)) {
      return [];
    }

    return result.resources.map((resource: any) => {
      const secureUrl = resource.secure_url as string;
      const normalizedCurrent = currentAvatarUrl?.replace(/^https?:/, "") ?? null;
      return {
        publicId: resource.public_id,
        secureUrl,
        createdAt: resource.created_at,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        isCurrent:
          normalizedCurrent !== null &&
          secureUrl.replace(/^https?:/, "") === normalizedCurrent,
      };
    });
  } catch (error) {
    console.error("Cloudinary avatar history error", error);
    return [];
  }
}

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
      isActive: true,
      isDeleted: true,
      deactivatedAt: true,
      deletedAt: true,
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

  // All items per module
  const [
    latestTodos,
    latestNotes,
    latestNotifications,
    latestEvents,
    latestRoutineBlocks,
    latestBlockLogs,
    latestResourceLinks,
  ] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true, createdAt: true, updatedAt: true } }),
    prisma.note.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, heading: true, status: true, createdAt: true, updatedAt: true } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, message: true, read: true, createdAt: true } }),
    prisma.event.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, startDate: true, endDate: true, createdAt: true } }),
    prisma.routineBlock.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, isActive: true, createdAt: true } }),
    prisma.blockLog.findMany({ where: { routineBlock: { is: { userId } } }, orderBy: { createdAt: "desc" }, select: { id: true, date: true, status: true, createdAt: true } }),
    prisma.resourceLink.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const aiUsageSummary =
    aiUsage && typeof aiUsage !== "number" && aiUsage !== null
      ? { requestsToday: aiUsage.requestsToday, lastRequestAt: aiUsage.lastRequestAt }
      : null;

  const avatars = await getAvatarHistory(userId, user.avatar);

  return {
    user,
    avatars,
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
    prisma.systemLog.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, disabledModules: true },
      orderBy: { createdAt: "desc" },
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