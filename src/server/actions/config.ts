"use server";

import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";

export const getGlobalAiLimit = withErrorWrapper<number, []>(async () => {
  const config = await prisma.systemConfig.findUnique({
    where: { key: "DAILY_AI_LIMIT" },
  });

  if (config) {
    return parseInt(config.value, 10) || 50;
  }

  // If it doesn't exist, create it with default value 50 so admin can see and edit it later
  try {
    await prisma.systemConfig.create({
      data: {
        key: "DAILY_AI_LIMIT",
        value: "50",
      }
    });
  } catch (e) {
    // Ignore race conditions if another request creates it at the same time
  }

  return 50;
});
