"use server";

import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getUserId } from "@/lib/server/get-user";
import { menstrualReminderSchema, type MenstrualReminderInput } from "@/schema/menstruation";
import type { MenstrualReminderData } from "@/types/menstruation";

export const getMenstrualReminders = withErrorWrapper<MenstrualReminderData[], []>(async () => {
  const userId = await getUserId();
  return await prisma.menstrualReminder.findMany({ where: { userId }, orderBy: { type: "asc" } }) as MenstrualReminderData[];
});

export const upsertMenstrualReminder = withErrorWrapper<MenstrualReminderData, [MenstrualReminderInput]>(async input => {
  const data = menstrualReminderSchema.parse(input);
  const userId = await getUserId();
  const existing = await prisma.menstrualReminder.findFirst({ where: { userId, type: data.type } });
  if (existing) return await prisma.menstrualReminder.update({ where: { id: existing.id }, data: { enabled: data.enabled, time: data.time ?? null, daysBefore: data.daysBefore ?? null } }) as MenstrualReminderData;
  return await prisma.menstrualReminder.create({ data: { userId, ...data } }) as MenstrualReminderData;
});
