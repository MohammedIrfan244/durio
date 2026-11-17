"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/server/get-user";
import { revalidatePath } from "next/cache";
import { Notification } from "@prisma/client";
import { getUserTimezone, getUserDateRanges } from "@/lib/server/date-utils";
import { MONGOID } from "@/schema/mongo";
import { getCyclePredictions } from "@/lib/logic/menstruation/cycle-predictions";
import { addUserCalendarDays, getUserDateKey, userDateFromKey } from "@/lib/logic/menstruation/cycle-dates";
import { evaluateTodoDue } from "@/lib/logic/todo/todo-due";
import type { MenstrualCycleData } from "@/types/menstruation";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const user = await getUser();
    if (!user || "error" in user) return [];

    // Trigger check for due tasks before fetching
    await checkAndNotifyDueTasks();
    await checkAndNotifyMenstrualReminders();

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

export async function checkAndNotifyDueTasks(targetUserId?: string): Promise<void> {
  try {
    let userId = targetUserId;
    if (!userId) {
      const user = await getUser();
      if (!user || "error" in user) return;
      userId = user.id as string;
    }

    const timezone = await getUserTimezone(userId);
    const { startOfToday } = getUserDateRanges(timezone);

    // Find all active todos with a dueDate
    const candidateTodos = await prisma.todo.findMany({
      where: {
        userId,
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: { not: null },
      },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        dueTime: true,
        createdAt: true,
      },
    });

    if (candidateTodos.length === 0) return;

    // Load FCM tokens once if needed
    let fcmTokens: string[] = [];
    const { adminMessaging } = await import("@/lib/server/firebase-admin");
    if (adminMessaging) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmTokens: true },
      });
      fcmTokens = dbUser?.fcmTokens || [];
    }

    const sendPush = async (title: string, body: string, url: string = "/todo") => {
      if (adminMessaging && fcmTokens.length > 0) {
        try {
          await adminMessaging.sendEachForMulticast({
            tokens: fcmTokens,
            notification: { title, body },
            data: { url },
          });
        } catch (err) {
          console.error("FCM Push Error (due tasks):", err);
        }
      }
    };

    for (const todo of candidateTodos) {
      const dueStatus = evaluateTodoDue(todo.dueDate, todo.dueTime, timezone, {
        createdAt: todo.createdAt,
      });

      if (!dueStatus.hasDue) continue;

      // 1. Task has become OVERDUE
      if (dueStatus.isOverdue) {
        // Update database status to OVERDUE if not already marked
        if (todo.status !== "OVERDUE") {
          await prisma.todo.update({
            where: { id: todo.id },
            data: { status: "OVERDUE" },
          });
        }

        const message = `Alert: Task "${todo.title}" is now overdue!`;
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            message,
            createdAt: { gte: startOfToday },
          },
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              userId,
              message,
              date: new Date(),
            },
          });
          await sendPush("Durio Overdue Alert", message, "/todo");
        }
      }
      // 2. Task is due within the next 24 hours (pre-warning)
      else if (dueStatus.isDueWithin24Hours) {
        const message = `Reminder: Task "${todo.title}" is due in 24 hours.`;
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            message,
            createdAt: { gte: startOfToday },
          },
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              userId,
              message,
              date: new Date(),
            },
          });
          await sendPush("Durio Reminder", message, "/todo");
        }
      }
    }
  } catch (error) {
    console.error("Failed to check due tasks:", error);
  }
}

/** Uses the same in-app notification flow as the rest of the project. */
export async function checkAndNotifyMenstrualReminders(targetUserId?: string): Promise<void> {
  try {
    let userId = targetUserId;
    let userTimezone: string | null = null;

    if (!userId) {
      const user = await getUser();
      if (!user || "error" in user) return;
      userId = user.id as string;
      userTimezone = user.timezone || null;
    } else {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      });
      userTimezone = dbUser?.timezone || null;
    }

    const timezone = userTimezone || "UTC";
    const todayKey = getUserDateKey(new Date(), timezone);
    const today = userDateFromKey(todayKey, timezone);
    const reminders = await prisma.menstrualReminder.findMany({ where: { userId, enabled: true } });
    if (!reminders.length) return;
    const [profile, cycles, todayLog] = await Promise.all([
      prisma.menstrualProfile.findUnique({ where: { userId } }),
      prisma.menstrualCycle.findMany({ where: { userId }, orderBy: { periodStartDate: "desc" }, take: 24 }),
      prisma.menstrualDailyLog.findUnique({ where: { userId_date: { userId, date: today } } }),
    ]);
    const messages: string[] = [];
    const expected = reminders.find(reminder => reminder.type === "EXPECTED_PERIOD");
    if (expected && profile?.predictionEnabled) {
      const prediction = getCyclePredictions(cycles as MenstrualCycleData[], profile.averageCycleLength, profile.fertileWindowEnabled, timezone);
      const daysBefore = expected.daysBefore ?? 3;
      const reminderDate = prediction.nextPeriod ? addUserCalendarDays(prediction.nextPeriod, -daysBefore, timezone) : null;
      if (reminderDate && getUserDateKey(reminderDate, timezone) === todayKey) {
        messages.push("Heads up! Your next period is estimated to start in " + daysBefore + " day" + (daysBefore !== 1 ? "s" : "") + ". Take care of yourself");
      }
    }
    const dailyLog = reminders.find(reminder => reminder.type === "DAILY_LOG");
    const medication = reminders.find(reminder => reminder.type === "MEDICATION");
    const localTime = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
    if (dailyLog && !todayLog && localTime >= (dailyLog.time ?? "09:00")) messages.push("Cycle reminder: Add today’s entry when you’re ready.");
    if (medication && localTime >= (medication.time ?? "09:00")) messages.push("Scheduled reminder: Check your medication plan.");
    // Fetch FCM tokens once for push notifications
    let fcmTokens: string[] = [];
    const { adminMessaging } = await import("@/lib/server/firebase-admin");
    if (adminMessaging) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmTokens: true },
      });
      fcmTokens = dbUser?.fcmTokens ?? [];
    }
    for (const message of messages) {
      const existing = await prisma.notification.findFirst({ where: { userId, message, createdAt: { gte: today } } });
      if (!existing) {
        await prisma.notification.create({ data: { userId, message, date: new Date() } });
        // Send push notification if the user has registered FCM tokens
        if (adminMessaging && fcmTokens.length > 0) {
          try {
            await adminMessaging.sendEachForMulticast({
              tokens: fcmTokens,
              notification: {
                title: "Durio - Cycle Reminder",
                body: message,
              },
              data: {
                url: "/menstruation",
              },
            });
          } catch (err) {
            console.error("FCM Push Error (menstrual reminder):", err);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to check menstrual reminders:", error);
  }
}

/**
 * Runs background checks for all registered users.
 * Used by cron endpoints or background workers.
 */
export async function runGlobalNotificationChecks(): Promise<{ processedUsers: number }> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const u of users) {
      await checkAndNotifyDueTasks(u.id);
      await checkAndNotifyMenstrualReminders(u.id);
    }

    return { processedUsers: users.length };
  } catch (error) {
    console.error("Failed in runGlobalNotificationChecks:", error);
    return { processedUsers: 0 };
  }
}

export async function registerFCMToken(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user || "error" in user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id as string },
      select: { fcmTokens: true },
    });

    const currentTokens = dbUser?.fcmTokens || [];
    
    if (!currentTokens.includes(token)) {
      await prisma.user.update({
        where: { id: user.id as string },
        data: {
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
