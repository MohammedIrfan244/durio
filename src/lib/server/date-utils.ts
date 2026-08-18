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
    console.error(e);
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
/**
 * Parse a date value from the client, treating it as a date in the user's timezone
 * and converting it to UTC for storage in the database.
 * 
 * When a Date object comes from the client (e.g., from a calendar picker), it's
 * created at midnight in the browser's local time. We need to interpret it as
 * being midnight in the user's stored timezone and convert that to UTC.
 * 
 * @param val - A date string (YYYY-MM-DD) or Date object (interpreted as user's local time)
 * @param timezone - User's timezone (e.g., "Asia/Kolkata")
 * @returns UTC Date object, or undefined if input is falsy
 */
export async function parseToUserDate(val: string | Date | undefined, timezone: string): Promise<Date | undefined> {
  if (!val) return undefined;
  
  let dateStr: string;
  
  // If it's a Date object from the client, convert to ISO date string
  if (val instanceof Date) {
    // Browser Date objects are in UTC internally, but when created from a calendar picker,
    // they represent midnight in the browser's local time.
    // We need to extract just the date part: YYYY-MM-DD
    const year = val.getUTCFullYear();
    const month = String(val.getUTCMonth() + 1).padStart(2, '0');
    const day = String(val.getUTCDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else {
    dateStr = val;
  }
  
  // Parse the date string as midnight in the user's timezone
  // and convert to UTC
  const zonedDate = toZonedTime(new Date(`${dateStr}T00:00:00`), timezone);
  const zonedStartOfDay = startOfDay(zonedDate);
  const utcDate = fromZonedTime(zonedStartOfDay, timezone);
  
  return utcDate;
}

/**
 * Validate that a date is not before today in the user's timezone.
 * Returns error message if invalid, undefined if valid.
 */
export function validateDateNotBeforeToday(date: Date | undefined, timezone: string): string | undefined {
  if (!date) return undefined;
  
  const { startOfToday } = getUserDateRanges(timezone);
  
  if (date < startOfToday) {
    return "Due date cannot be before today";
  }
  
  return undefined;
}
