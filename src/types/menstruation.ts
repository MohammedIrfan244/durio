export type Flow = "NONE" | "SPOTTING" | "LIGHT" | "MEDIUM" | "HEAVY";
export type PainLevel = "NONE" | "MILD" | "MODERATE" | "SEVERE";
export type EnergyLevel = "LOW" | "NORMAL" | "HIGH";

export interface MenstrualProfileData {
  id: string;
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  trackingStartedAt: Date | null;
  predictionEnabled: boolean;
  fertileWindowEnabled: boolean;
  dashboardEnabled: boolean;
  duriaAccessEnabled: boolean;
}

export interface MenstrualCycleData {
  id: string;
  periodStartDate: Date;
  periodEndDate: Date | null;
  cycleLength: number | null;
  periodLength: number | null;
  isConfirmed: boolean;
  isIrregular: boolean;
  isSpotting: boolean;
  notes: string | null;
}

export interface MenstrualDailyLogData {
  id: string;
  cycleId: string | null;
  date: Date;
  flow: Flow | null;
  painLevel: PainLevel | null;
  mood: string | null;
  energyLevel: EnergyLevel | null;
  symptoms: string[];
  sleepQuality: string | null;
  temperature: number | null;
  medication: string | null;
  appetite: string | null;
  cervicalMucus: string | null;
  notes: string | null;
}

export type MenstrualReminderType = "EXPECTED_PERIOD" | "DAILY_LOG" | "MEDICATION" | "APPOINTMENT";

export interface MenstrualReminderData {
  id: string;
  type: MenstrualReminderType;
  enabled: boolean;
  time: string | null;
  daysBefore: number | null;
}

export type PredictionConfidence = "NEW" | "TYPICAL" | "VARIABLE" | "UNAVAILABLE";

export interface CyclePredictions {
  averageCycleLength: number | null;
  nextPeriod: Date | null;
  ovulation: Date | null;
  fertileWindow: { start: Date; end: Date } | null;
  confidence: PredictionConfidence;
}

export type MenstrualContextAttachment = "SUMMARY" | "RECENT_LOGS" | "CYCLE_HISTORY";
