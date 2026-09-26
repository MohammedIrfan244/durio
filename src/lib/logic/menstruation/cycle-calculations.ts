import { differenceInUserCalendarDays } from "./cycle-dates";

export function periodLength(start: Date, end: Date, timezone = "UTC"): number {
  return differenceInUserCalendarDays(start, end, timezone) + 1;
}

export function cycleLength(previousStart: Date, nextStart: Date, timezone = "UTC"): number {
  return differenceInUserCalendarDays(previousStart, nextStart, timezone);
}

export function isValidCompletedCycle(cycle: { periodStartDate: Date; periodEndDate: Date | null; isSpotting?: boolean }): boolean {
  return Boolean(!cycle.isSpotting && cycle.periodEndDate && cycle.periodEndDate >= cycle.periodStartDate);
}
