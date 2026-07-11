"use server";

import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getUserId } from "@/lib/server/get-user";
import { differenceInCalendarDays } from "date-fns";

const DAILY_LIMIT = 150;

export async function getEffectiveAIUsageForUser(userId: string): Promise<{ used: number; limit: number }> {
  const usage = await prisma.aIUsage.findUnique({
    where: { userId },
  });

  if (!usage) {
    return { used: 0, limit: DAILY_LIMIT };
  }

  const used = differenceInCalendarDays(new Date(), usage.lastRequestAt) > 0
    ? 0
    : usage.requestsToday;

  return { used, limit: DAILY_LIMIT };
}

export const getAIUsage = withErrorWrapper<{ used: number; limit: number }, []>(async () => {
  const userId = await getUserId();
  return getEffectiveAIUsageForUser(userId);
});

export async function checkAndIncrementAIUsage(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const usage = await prisma.aIUsage.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const now = new Date();
    let requestsToday = usage.requestsToday;

    // Reset counter if it's a new day
    if (differenceInCalendarDays(now, usage.lastRequestAt) > 0) {
      requestsToday = 0;
    }

    if (requestsToday >= DAILY_LIMIT) {
      return { success: false, error: "Daily limit of 150 AI requests reached. Please try again tomorrow." };
    }

    if (requestsToday + 1 === DAILY_LIMIT) {
      await prisma.notification.create({
        data: {
          userId,
          message: "You have reached your daily limit for Duria AI requests.",
          date: new Date(),
        }
      });
    }

    // Increment and update timestamp
    await prisma.aIUsage.update({
      where: { id: usage.id },
      data: {
        requestsToday: requestsToday + 1,
        lastRequestAt: now,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to check AI usage:", error);
    // Fail open if database is down so users aren't locked out entirely
    return { success: true };
  }
}
