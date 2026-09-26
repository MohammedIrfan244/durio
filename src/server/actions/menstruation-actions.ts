"use server";

import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/server/get-user";
import { parseToUserDate } from "@/lib/server/date-utils";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getCyclePredictions } from "@/lib/logic/menstruation/cycle-predictions";
import { cycleLength, periodLength } from "@/lib/logic/menstruation/cycle-calculations";
import { dailyLogByDateSchema, dailyLogSchema, deleteCycleSchema, deleteDailyLogSchema, endPeriodSchema, getCyclesSchema, startPeriodSchema, updateCycleSchema, updateProfileSchema, type DailyLogInput, type EndPeriodInput, type StartPeriodInput, type UpdateCycleInput, type UpdateProfileInput } from "@/schema/menstruation";
import type { MenstrualCycleData, MenstrualDailyLogData, MenstrualProfileData, MenstrualReminderData } from "@/types/menstruation";

async function currentUser() {
  const user = await getUser();
  return { id: user.id, timezone: user.timezone || "UTC" };
}
async function userDate(value: string, timezone: string) {
  const result = await parseToUserDate(value, timezone);
  if (!result || Number.isNaN(result.getTime())) throw new Error("Invalid date");
  return result;
}
function toCycle(cycle: Awaited<ReturnType<typeof prisma.menstrualCycle.findFirst>>): MenstrualCycleData | null {
  return cycle as MenstrualCycleData | null;
}

export const getMenstrualProfile = withErrorWrapper<MenstrualProfileData | null, []>(async () => {
  const { id } = await currentUser();
  return await prisma.menstrualProfile.findUnique({ where: { userId: id } }) as MenstrualProfileData | null;
});

export const updateMenstrualProfile = withErrorWrapper<MenstrualProfileData, [UpdateProfileInput]>(async (input) => {
  const data = updateProfileSchema.parse(input);
  const { id } = await currentUser();
  return await prisma.menstrualProfile.upsert({ where: { userId: id }, create: { userId: id, ...data }, update: data }) as MenstrualProfileData;
});

export const getCurrentCycle = withErrorWrapper<MenstrualCycleData | null, []>(async () => {
  const { id } = await currentUser();
  return toCycle(await prisma.menstrualCycle.findFirst({ where: { userId: id, periodEndDate: null }, orderBy: { periodStartDate: "desc" } }));
});

export const getCycles = withErrorWrapper<MenstrualCycleData[], [{ limit?: number }?]>(async (input) => {
  const options = getCyclesSchema.parse(input);
  const { id } = await currentUser();
  return await prisma.menstrualCycle.findMany({ where: { userId: id }, orderBy: { periodStartDate: "desc" }, take: options?.limit ?? 50 }) as MenstrualCycleData[];
});

export const startPeriod = withErrorWrapper<MenstrualCycleData, [StartPeriodInput]>(async (input) => {
  const data = startPeriodSchema.parse(input);
  const { id, timezone } = await currentUser();
  const periodStartDate = await userDate(data.date, timezone);
  const active = await prisma.menstrualCycle.findFirst({ where: { userId: id, periodEndDate: null } });
  if (active) throw new Error("A period is already active. End it before starting another one.");
  const prior = await prisma.menstrualCycle.findFirst({ where: { userId: id, periodStartDate: { lt: periodStartDate } }, orderBy: { periodStartDate: "desc" } });
  const created = await prisma.menstrualCycle.create({ data: { userId: id, periodStartDate, cycleLength: prior ? cycleLength(prior.periodStartDate, periodStartDate, timezone) : null, isIrregular: data.isIrregular ?? false, isSpotting: data.isSpotting ?? false, notes: data.notes ?? null } });
  await prisma.menstrualProfile.upsert({ where: { userId: id }, create: { userId: id, trackingStartedAt: periodStartDate }, update: {} });
  return created as MenstrualCycleData;
});

export const endPeriod = withErrorWrapper<MenstrualCycleData, [EndPeriodInput]>(async (input) => {
  const data = endPeriodSchema.parse(input);
  const { id, timezone } = await currentUser();
  const periodEndDate = await userDate(data.date, timezone);
  const cycle = await prisma.menstrualCycle.findFirst({ where: { id: data.id, userId: id } }) || await prisma.menstrualCycle.findFirst({ where: { userId: id, periodEndDate: null }, orderBy: { periodStartDate: "desc" } });
  if (!cycle) throw new Error("No active period found");
  if (periodEndDate < cycle.periodStartDate) throw new Error("Period end cannot be before its start");
  return await prisma.menstrualCycle.update({ where: { id: cycle.id }, data: { periodEndDate, periodLength: periodLength(cycle.periodStartDate, periodEndDate, timezone), isIrregular: data.isIrregular ?? cycle.isIrregular, notes: data.notes ?? cycle.notes } }) as MenstrualCycleData;
});

export const updateCycle = withErrorWrapper<MenstrualCycleData, [UpdateCycleInput]>(async (input) => {
  const data = updateCycleSchema.parse(input);
  const { id, timezone } = await currentUser();
  const cycle = await prisma.menstrualCycle.findFirst({ where: { id: data.id, userId: id } });
  if (!cycle) throw new Error("Period not found");
  const periodStartDate = await userDate(data.periodStartDate, timezone);
  const periodEndDate = data.periodEndDate ? await userDate(data.periodEndDate, timezone) : null;
  if (periodEndDate && periodEndDate < periodStartDate) throw new Error("Period end cannot be before its start");
  return await prisma.menstrualCycle.update({ where: { id: cycle.id }, data: { periodStartDate, periodEndDate, periodLength: periodEndDate ? periodLength(periodStartDate, periodEndDate, timezone) : null, notes: data.notes ?? null, isIrregular: data.isIrregular ?? false, isSpotting: data.isSpotting ?? false } }) as MenstrualCycleData;
});

export const deleteCycle = withErrorWrapper<void, [{ id: string }]>(async (input) => {
  const { id: cycleId } = deleteCycleSchema.parse(input);
  const { id } = await currentUser();
  const cycle = await prisma.menstrualCycle.findFirst({ where: { id: cycleId, userId: id } });
  if (!cycle) throw new Error("Period not found");
  await prisma.$transaction([prisma.menstrualDailyLog.updateMany({ where: { cycleId, userId: id }, data: { cycleId: null } }), prisma.menstrualCycle.delete({ where: { id: cycleId } })]);
});

export const getDailyLog = withErrorWrapper<MenstrualDailyLogData | null, [{ date: string }]>(async (input) => {
  const { date } = dailyLogByDateSchema.parse(input);
  const { id, timezone } = await currentUser();
  return await prisma.menstrualDailyLog.findUnique({ where: { userId_date: { userId: id, date: await userDate(date, timezone) } } }) as MenstrualDailyLogData | null;
});

export const upsertDailyLog = withErrorWrapper<MenstrualDailyLogData, [DailyLogInput]>(async (input) => {
  const data = dailyLogSchema.parse(input);
  const { id, timezone } = await currentUser();
  const date = await userDate(data.date, timezone);
  let cycleId = data.cycleId ?? null;
  if (cycleId) {
    const cycle = await prisma.menstrualCycle.findFirst({ where: { id: cycleId, userId: id } });
    if (!cycle) throw new Error("Period not found");
  } else {
    const cycle = await prisma.menstrualCycle.findFirst({
      where: { userId: id, periodStartDate: { lte: date }, OR: [{ periodEndDate: null }, { periodEndDate: { gte: date } }] },
      orderBy: { periodStartDate: "desc" },
    });
    cycleId = cycle?.id ?? null;
  }
  const { date: _date, ...log } = data;
  void _date;
  return await prisma.menstrualDailyLog.upsert({ where: { userId_date: { userId: id, date } }, create: { userId: id, date, cycleId: cycleId ?? null, ...log }, update: { cycleId: cycleId ?? null, ...log } }) as MenstrualDailyLogData;
});

export const deleteDailyLog = withErrorWrapper<void, [{ id: string }]>(async (input) => {
  const { id: logId } = deleteDailyLogSchema.parse(input);
  const { id } = await currentUser();
  const log = await prisma.menstrualDailyLog.findFirst({ where: { id: logId, userId: id } });
  if (!log) throw new Error("Daily log not found");
  await prisma.menstrualDailyLog.delete({ where: { id: logId } });
});

export const getCycleSummary = withErrorWrapper(async () => {
  const { id, timezone } = await currentUser();
  const [profile, cycles, activeCycle, todayLog, recentLogs, reminders] = await Promise.all([
    prisma.menstrualProfile.findUnique({ where: { userId: id } }),
    prisma.menstrualCycle.findMany({ where: { userId: id }, orderBy: { periodStartDate: "desc" }, take: 24 }),
    prisma.menstrualCycle.findFirst({ where: { userId: id, periodEndDate: null }, orderBy: { periodStartDate: "desc" } }),
    prisma.menstrualDailyLog.findUnique({ where: { userId_date: { userId: id, date: await userDate(formatInTimeZone(new Date(), timezone, "yyyy-MM-dd"), timezone) } } }),
    prisma.menstrualDailyLog.findMany({ where: { userId: id }, orderBy: { date: "desc" }, take: 90 }),
    prisma.menstrualReminder.findMany({ where: { userId: id }, orderBy: { type: "asc" } }),
  ]);
  return { timezone, profile: profile as MenstrualProfileData | null, cycles: cycles as MenstrualCycleData[], activeCycle: activeCycle as MenstrualCycleData | null, todayLog: todayLog as MenstrualDailyLogData | null, recentLogs: recentLogs as MenstrualDailyLogData[], reminders: reminders as MenstrualReminderData[], predictions: getCyclePredictions(cycles as MenstrualCycleData[], profile?.averageCycleLength, profile?.fertileWindowEnabled, timezone) };
});

export const deleteAllMenstrualData = withErrorWrapper<void, []>(async () => {
  const { id } = await currentUser();
  await prisma.$transaction([prisma.menstrualDailyLog.deleteMany({ where: { userId: id } }), prisma.menstrualCycle.deleteMany({ where: { userId: id } }), prisma.menstrualReminder.deleteMany({ where: { userId: id } }), prisma.menstrualProfile.deleteMany({ where: { userId: id } })]);
});
