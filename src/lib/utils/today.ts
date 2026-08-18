import { startOfDay, addDays } from "date-fns"

/**
 * Get today's date at midnight UTC.
 * This is used for client-side date picker validation.
 * Note: For server-side validation, use getUserDateRanges() which respects user's timezone.
 */
export const today = (): Date => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export const start = startOfDay(new Date());
export const end = addDays(start, 1)
