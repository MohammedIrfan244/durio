import type { EventCategory, Prisma } from "@prisma/client";

export interface DuriaListFilters {
  folderId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  limit?: number;
  includeArchived?: boolean;
}

export type DuriaTodoContext = Prisma.TodoGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    status: true;
    priority: true;
    dueDate: true;
    tags: true;
    checklist: { select: { text: true; marked: true } };
  };
}>;

export type DuriaNoteContext = Prisma.NoteGetPayload<{
  select: {
    id: true;
    heading: true;
    description: true;
    color: true;
    folder: { select: { name: true } };
    createdAt: true;
    updatedAt: true;
  };
}>;

export interface DuriaEventContext {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location: string | null;
  category: EventCategory | null;
}

export interface DuriaFocusBlockContext {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  priority: string;
  energyLevel: string;
  transitionRitual: string | null;
  isActive: boolean;
}

// Deliberately summary-only: raw menstrual notes and medication details are
// never part of DURIA context.
export interface DuriaMenstrualContext {
  attachmentType: "SUMMARY" | "RECENT_LOGS" | "CYCLE_HISTORY";
  currentCycleDay?: number;
  currentPhase?: string;
  lastPeriodStart?: Date;
  lastPeriodEnd?: Date | null;
  predictedNextPeriod?: Date | null;
  predictedOvulation?: Date | null;
  averageCycleLength?: number | null;
  recentSymptoms: string[];
  recentMood?: string | null;
  recentEnergy?: string | null;
  predictionConfidence: string;
  recentDailyLogs?: { date: Date; symptoms: string[]; mood: string | null; energyLevel: string | null }[];
  cycleHistory?: { periodStartDate: Date; periodEndDate: Date | null; cycleLength: number | null; periodLength: number | null; isIrregular: boolean }[];
}
