import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const USER_DATE_FORMAT = "yyyy-MM-dd";

/** Returns the calendar date for an instant in the user's configured timezone. */
export function getUserDateKey(date: Date | string, timezone: string): string {
  return formatInTimeZone(new Date(date), timezone, USER_DATE_FORMAT);
}

/** Stores a YYYY-MM-DD value as midnight in the user's configured timezone. */
export function userDateFromKey(dateKey: string, timezone: string): Date {
  return fromZonedTime(`${dateKey}T00:00:00`, timezone);
}

/** Calculates date differences without being affected by daylight-saving hour changes. */
export function differenceInUserCalendarDays(start: Date, end: Date, timezone: string): number {
  const startKey = getUserDateKey(start, timezone);
  const endKey = getUserDateKey(end, timezone);
  const startDay = new Date(`${startKey}T00:00:00Z`).getTime();
  const endDay = new Date(`${endKey}T00:00:00Z`).getTime();
  return Math.round((endDay - startDay) / 86_400_000);
}

/** Adds calendar days while preserving the user's local date semantics. */
export function addUserCalendarDays(date: Date, days: number, timezone: string): Date {
  const key = getUserDateKey(date, timezone);
  const shifted = addDays(new Date(`${key}T00:00:00Z`), days);
  return userDateFromKey(formatInTimeZone(shifted, "UTC", USER_DATE_FORMAT), timezone);
}
