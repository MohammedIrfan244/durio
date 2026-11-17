import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { convertToTime } from "@/lib/utils/date-formatter";

export interface TodoDueStatus {
  hasDue: boolean;
  dueDateTimeUtc: Date | null;
  isOverdue: boolean;
  isDueWithin24Hours: boolean;
}

/**
 * Calculates the exact UTC due timestamp by combining the user's selected
 * dueDate (calendar day) and optional dueTime ("hh:mm AM/PM" or "HH:mm") in their timezone.
 */
export function getTodoDueDateTimeUtc(
  dueDate: Date | string | null | undefined,
  dueTime: string | null | undefined,
  timezone: string = "UTC"
): Date | null {
  if (!dueDate) return null;

  let year: number;
  let month: number;
  let day: number;

  if (typeof dueDate === "string") {
    const dateMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      year = parseInt(dateMatch[1], 10);
      month = parseInt(dateMatch[2], 10);
      day = parseInt(dateMatch[3], 10);
    } else {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) return null;
      const zoned = toZonedTime(parsed, timezone);
      year = zoned.getFullYear();
      month = zoned.getMonth() + 1;
      day = zoned.getDate();
    }
  } else if (dueDate instanceof Date) {
    if (isNaN(dueDate.getTime())) return null;
    const zoned = toZonedTime(dueDate, timezone);
    year = zoned.getFullYear();
    month = zoned.getMonth() + 1;
    day = zoned.getDate();
  } else {
    return null;
  }

  let hours = 23;
  let minutes = 59;

  if (dueTime && typeof dueTime === "string") {
    const totalMinutes = convertToTime(dueTime);
    if (!isNaN(totalMinutes) && totalMinutes >= 0 && totalMinutes < 1440) {
      hours = Math.floor(totalMinutes / 60);
      minutes = totalMinutes % 60;
    }
  }

  const dateString = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  try {
    return fromZonedTime(dateString, timezone);
  } catch (error) {
    console.error("Failed to parse zoned time for todo due date:", error);
    return null;
  }
}

/**
 * Single source of truth for all Due & Overdue calculations across Durio.
 */
export function evaluateTodoDue(
  dueDate: Date | string | null | undefined,
  dueTime: string | null | undefined,
  timezone: string = "UTC",
  options?: {
    createdAt?: Date | string | null;
    now?: Date;
  }
): TodoDueStatus {
  const dueDateTimeUtc = getTodoDueDateTimeUtc(dueDate, dueTime, timezone);

  if (!dueDateTimeUtc) {
    return {
      hasDue: false,
      dueDateTimeUtc: null,
      isOverdue: false,
      isDueWithin24Hours: false,
    };
  }

  const now = options?.now || new Date();
  const diffMs = dueDateTimeUtc.getTime() - now.getTime();

  // Task is overdue if its exact due instant has passed
  const isOverdue = diffMs < 0;

  // Task is due within the next 24 hours if:
  // 1. It is not yet overdue (diffMs >= 0)
  // 2. It is within 24 hours (diffMs <= 24 * 60 * 60 * 1000)
  // 3. Rule: If total time between task creation and due date was < 24 hours,
  //    suppress pre-due warning so users don't get spammed on short-notice tasks.
  let isDueWithin24Hours = false;
  if (!isOverdue && diffMs <= 24 * 60 * 60 * 1000) {
    if (options?.createdAt) {
      const createdTime = new Date(options.createdAt).getTime();
      const totalLifespanMs = dueDateTimeUtc.getTime() - createdTime;
      // Only warn if task was scheduled with at least 24h lead time
      isDueWithin24Hours = totalLifespanMs >= 24 * 60 * 60 * 1000;
    } else {
      isDueWithin24Hours = true;
    }
  }

  return {
    hasDue: true,
    dueDateTimeUtc,
    isOverdue,
    isDueWithin24Hours,
  };
}
