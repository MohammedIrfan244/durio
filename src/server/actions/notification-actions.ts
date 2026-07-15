"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/server/get-user";
import { revalidatePath } from "next/cache";
import { Notification } from "@prisma/client";
import { getUserTimezone, getUserDateRanges } from "@/lib/server/date-utils";
import { MONGOID } from "@/schema/mongo";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const user = await getUser();
    if (!user || "error" in user) return [];

    // Trigger check for due tasks before fetching
    await checkAndNotifyDueTasks();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id as string },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to 20 most recent
    });

    return notifications;
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const user = await getUser();
    if (!user || "error" in user) return 0;

    const count = await prisma.notification.count({
      where: {
        userId: user.id as string,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to count unread notifications:", error);
    return 0;
  }
}

export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user || "error" in user) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
      where: {
        userId: user.id as string,
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Revalidate the layout/header if necessary, though it might be handled client-side
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}

export async function markAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const notificationId = MONGOID.parse(id);
    const user = await getUser();
    if (!user || "error" in user) throw new Error("Unauthorized");

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id as string,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const notificationId = MONGOID.parse(id);
    const user = await getUser();
    if (!user || "error" in user) throw new Error("Unauthorized");

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: user.id as string,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function checkAndNotifyDueTasks(): Promise<void> {
  try {
    const user = await getUser();
    if (!user || "error" in user) return;

    const timezone = await getUserTimezone(user.id as string);
    const { startOfToday, startOfTomorrow } = getUserDateRanges(timezone);

    // Find todos due today (prevent daily spam for already overdue tasks)
    const dueTodos = await prisma.todo.findMany({
      where: {
        userId: user.id as string,
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: {
          gte: startOfToday,
          lt: startOfTomorrow, 
        },
      },
      select: {
        id: true,
        title: true,
      }
    });

    for (const todo of dueTodos) {
      const message = `Reminder: Task "${todo.title}" is due!`;
      
      // Check if we already notified about this today
      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id as string,
          message,
          createdAt: {
            gte: startOfToday,
          }
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: user.id as string,
            message,
            date: new Date(),
          }
        });

        // Send Push Notification
        const { adminMessaging } = await import("@/lib/server/firebase-admin");
        if (adminMessaging) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id as string },
            // Using type assertion to avoid TS errors if prisma client isn't fully generated yet
          });
          const tokens = (dbUser as any)?.fcmTokens as string[] | undefined;
          
          if (tokens && tokens.length > 0) {
            try {
              await adminMessaging.sendEachForMulticast({
                tokens: tokens,
                notification: {
                  title: 'Durio Reminder',
                  body: message,
                },
                data: {
                  url: '/duria',
                }
              });
            } catch (err) {
              console.error("FCM Push Error:", err);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to check due tasks:", error);
  }
}

export async function registerFCMToken(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user || "error" in user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id as string }
    });

    const currentTokens = (dbUser as any)?.fcmTokens as string[] || [];
    
    if (!currentTokens.includes(token)) {
      await prisma.user.update({
        where: { id: user.id as string },
        data: {
          // @ts-ignore - Ignore TS error until prisma generate runs
          fcmTokens: {
            push: token
          }
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to register FCM token:", error);
    return { success: false, error: "Failed to register token" };
  }
}
