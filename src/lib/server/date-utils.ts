import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay, startOfWeek, subDays, differenceInCalendarDays, addDays } from "date-fns";
import { getUser } from "@/lib/server/get-user";

export async function getUserTimezone(userId?: string): Promise<string> {

  
  if (!userId) return "UTC";

  try {
    const user = await getUser();
    if(user.id === userId) {
        return user.timezone || "UTC";
    }
    return "UTC";
  } catch (e) {
    return "UTC";
  }
}

export function getStartOfDayInUserTime(timezone: string): Date {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const zonedStartOfDay = startOfDay(zonedNow);
  return fromZonedTime(zonedStartOfDay, timezone);
}

export function getUserDateRanges(timezone: string) {
  const now = new Date();
  
  const startOfToday = getStartOfDayInUserTime(timezone);
  
  const zonedNow = toZonedTime(now, timezone);
  const zonedTomorrow = addDays(startOfDay(zonedNow), 1); // 00:00 tomorrow in user time
  const startOfTomorrowUtc = fromZonedTime(zonedTomorrow, timezone);

  const zonedStartOfWeek = startOfWeek(zonedNow, { weekStartsOn: 1 }); // Monday start?
  const startOfWeekUtc = fromZonedTime(zonedStartOfWeek, timezone);

  const zonedLast30 = subDays(startOfToday, 29); // or 30?
  // Actually, we want (StartOfToday - 30 days)
  const startOfLast30DaysUtc = fromZonedTime(subDays(toZonedTime(startOfToday, timezone), 30), timezone);

  const daysElapsedThisWeek = differenceInCalendarDays(zonedNow, zonedStartOfWeek) + 1;

  return {
    now,
    startOfToday,
    startOfTomorrow: startOfTomorrowUtc,
    startOfWeek: startOfWeekUtc,
    startOfLast30Days: startOfLast30DaysUtc,
    daysElapsedThisWeek
  };
}

export function isDueTodayInUserTime(dueDate: Date, timezone: string): boolean {
  const { startOfToday, startOfTomorrow } = getUserDateRanges(timezone);
  return dueDate >= startOfToday && dueDate < startOfTomorrow;
}
export async function parseToUserDate(val: string | Date | undefined, timezone: string): Promise<Date | undefined> {
  if (!val) return undefined;
  if (val instanceof Date) return val; 
  
  // It's a string, so we convert it to the user's timezone
  return fromZonedTime(val, timezone); 
}
