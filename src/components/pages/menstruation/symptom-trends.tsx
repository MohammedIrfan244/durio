import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MenstrualCycleData, MenstrualDailyLogData } from "@/types/menstruation";

export function SymptomTrends({ cycles, logs }: { cycles: MenstrualCycleData[]; logs: MenstrualDailyLogData[] }) {
  const completed = cycles.filter(cycle => cycle.periodEndDate && !cycle.isSpotting);
  const cycleLengths = completed.map(cycle => cycle.cycleLength).filter((value): value is number => value !== null);
  const periodLengths = completed.map(cycle => cycle.periodLength).filter((value): value is number => value !== null);
  const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  const symptoms = new Map<string, number>();
  logs.forEach(log => log.symptoms.forEach(symptom => symptoms.set(symptom, (symptoms.get(symptom) ?? 0) + 1)));
  const topSymptoms = [...symptoms.entries()].sort(([, a], [, b]) => b - a).slice(0, 3);
  const moods = logs.filter(log => log.mood).reduce<Record<string, number>>((values, log) => ({ ...values, [log.mood!]: (values[log.mood!] ?? 0) + 1 }), {});
  const topMood = Object.entries(moods).sort(([, a], [, b]) => b - a)[0];

  return <Card><CardHeader><CardTitle>Insights</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><Insight label="Average cycle" value={average(cycleLengths) ? `${average(cycleLengths)} days` : "More history needed"} sample={cycleLengths.length} /><Insight label="Average period" value={average(periodLengths) ? `${average(periodLengths)} days` : "More history needed"} sample={periodLengths.length} /><Insight label="Most logged mood" value={topMood ? topMood[0] : "No mood data"} sample={topMood?.[1] ?? 0} /><div className="sm:col-span-3"><p className="text-sm font-medium">Frequently logged symptoms</p>{topSymptoms.length ? <div className="mt-2 flex flex-wrap gap-2">{topSymptoms.map(([symptom, count]) => <span key={symptom} className="rounded-full bg-muted px-3 py-1 text-sm">{symptom}: {count} of {logs.length} logged days</span>)}</div> : <p className="mt-1 text-sm text-muted-foreground">No symptoms have been logged yet.</p>}</div><p className="text-xs text-muted-foreground sm:col-span-3">These are tracking summaries, not medical conclusions.</p></CardContent></Card>;
}

function Insight({ label, value, sample }: { label: string; value: string; sample: number }) {
  return <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">Based on {sample} tracked {sample === 1 ? "entry" : "entries"}</p></div>;
}
