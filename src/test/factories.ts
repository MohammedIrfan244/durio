import type { MenstrualCycleData, MenstrualDailyLogData } from "@/types/menstruation";

export function createCycle(overrides: Partial<MenstrualCycleData> = {}): MenstrualCycleData {
  return {
    id: "65e000000000000000000001",
    periodStartDate: new Date("2026-01-01T00:00:00.000Z"),
    periodEndDate: new Date("2026-01-05T00:00:00.000Z"),
    cycleLength: 28,
    periodLength: 5,
    isConfirmed: true,
    isIrregular: false,
    isSpotting: false,
    notes: null,
    ...overrides,
  };
}

export function createDailyLog(overrides: Partial<MenstrualDailyLogData> = {}): MenstrualDailyLogData {
  return {
    id: "65e000000000000000000002",
    cycleId: null,
    date: new Date("2026-01-01T00:00:00.000Z"),
    flow: null,
    painLevel: null,
    mood: null,
    energyLevel: null,
    symptoms: [],
    sleepQuality: null,
    temperature: null,
    medication: null,
    appetite: null,
    cervicalMucus: null,
    notes: null,
    ...overrides,
  };
}
