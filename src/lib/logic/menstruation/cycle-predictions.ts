import type { CyclePredictions, MenstrualCycleData } from "@/types/menstruation";
import { cycleLength, isValidCompletedCycle } from "./cycle-calculations";
import { addUserCalendarDays } from "./cycle-dates";

export function getCyclePredictions(cycles: MenstrualCycleData[], configuredCycleLength?: number | null, fertileWindowEnabled = false, timezone = "UTC"): CyclePredictions {
  const chronological = [...cycles].sort((a, b) => a.periodStartDate.getTime() - b.periodStartDate.getTime());
  const completed = chronological.filter(isValidCompletedCycle);
  const lengths = completed.slice(1).map((cycle, index) => cycleLength(completed[index].periodStartDate, cycle.periodStartDate, timezone)).filter((length) => length >= 15 && length <= 90);
  const averageCycleLength = lengths.length ? Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length) : configuredCycleLength ?? null;
  const lastPeriod = completed.at(-1);
  if (!averageCycleLength || !lastPeriod) return { averageCycleLength, nextPeriod: null, ovulation: null, fertileWindow: null, confidence: "UNAVAILABLE" };
  const nextPeriod = addUserCalendarDays(lastPeriod.periodStartDate, averageCycleLength, timezone);
  const ovulation = addUserCalendarDays(nextPeriod, -14, timezone);
  const variation = lengths.length > 1 ? Math.max(...lengths) - Math.min(...lengths) : 0;
  return {
    averageCycleLength, nextPeriod, ovulation,
    fertileWindow: fertileWindowEnabled ? { start: addUserCalendarDays(ovulation, -5, timezone), end: addUserCalendarDays(ovulation, 1, timezone) } : null,
    confidence: lengths.length < 2 ? "NEW" : variation > 7 ? "VARIABLE" : "TYPICAL",
  };
}
