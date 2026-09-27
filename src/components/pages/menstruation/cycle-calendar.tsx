"use client";

import { addDays, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getUserDateKey } from "@/lib/logic/menstruation/cycle-dates";
import type { CyclePredictions, MenstrualCycleData } from "@/types/menstruation";

type Props = { cycles: MenstrualCycleData[]; predictions: CyclePredictions; timezone: string };

export function CycleCalendar({ cycles, predictions, timezone }: Props) {
  const [month, setMonth] = useState(() => new Date());
  const days = useMemo(() => {
    const firstKey = getUserDateKey(month, timezone).slice(0, 8) + "01";
    const first = new Date(`${firstKey}T00:00:00Z`);
    const start = addDays(first, -first.getUTCDay());
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [month, timezone]);
  const monthKey = getUserDateKey(month, timezone).slice(0, 7);

  const stateFor = (key: string) => {
    const confirmed = cycles.find(cycle => {
      const start = getUserDateKey(cycle.periodStartDate, timezone);
      const end = getUserDateKey(cycle.periodEndDate ?? new Date(), timezone);
      return !cycle.isSpotting && key >= start && key <= end;
    });
    if (confirmed) return { label: "Confirmed period", mark: "P", className: "bg-rose-500 text-white" };
    if (predictions.nextPeriod && key === getUserDateKey(predictions.nextPeriod, timezone)) return { label: "Estimated period", mark: "E", className: "border border-rose-400 bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200" };
    if (predictions.ovulation && key === getUserDateKey(predictions.ovulation, timezone)) return { label: "Estimated ovulation", mark: "O", className: "bg-violet-200 text-violet-800 dark:bg-violet-950 dark:text-violet-200" };
    if (predictions.fertileWindow && key >= getUserDateKey(predictions.fertileWindow.start, timezone) && key <= getUserDateKey(predictions.fertileWindow.end, timezone)) return { label: "Estimated fertile window", mark: "F", className: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200" };
    return null;
  };

  return <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Cycle calendar</CardTitle><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setMonth(value => subMonths(value, 1))}><ChevronLeft /></Button><Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setMonth(value => addMonths(value, 1))}><ChevronRight /></Button></div></CardHeader><CardContent><p className="mb-3 text-sm font-medium">{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: timezone }).format(month)}</p><div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">{"SMTWTFS".split("").map((day, index) => <span key={`${day}-${index}`} className="py-1">{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{days.map(day => { const key = getUserDateKey(day, "UTC"); const state = stateFor(key); const outsideMonth = !key.startsWith(monthKey); return <div key={key} title={state?.label} aria-label={state ? `${key}: ${state.label}` : key} className={cn("flex aspect-square min-h-9 items-center justify-center rounded-md text-sm", outsideMonth && "text-muted-foreground/40", state?.className)}>{state?.mark ?? Number(key.slice(-2))}</div>; })}</div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs"><span><b className="mr-1 text-rose-500">P</b>Confirmed period</span><span><b className="mr-1 text-rose-500">E</b>Estimated period</span><span><b className="mr-1 text-violet-500">O</b>Estimated ovulation</span><span><b className="mr-1 text-slate-500">F</b>Estimated fertile window</span></div></CardContent></Card>;
}
