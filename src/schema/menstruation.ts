import { z } from "zod";
import { MONGOID } from "@/schema/mongo";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");
const optionalText = z.string().trim().max(2000).optional().nullable();

export const startPeriodSchema = z.object({ date: dateOnly, notes: optionalText, isIrregular: z.boolean().optional(), isSpotting: z.boolean().optional() });
export const endPeriodSchema = z.object({ id: MONGOID.optional(), date: dateOnly, notes: optionalText, isIrregular: z.boolean().optional() });
export const updateCycleSchema = z.object({ id: MONGOID, periodStartDate: dateOnly, periodEndDate: dateOnly.optional().nullable(), notes: optionalText, isIrregular: z.boolean().optional(), isSpotting: z.boolean().optional() });
export const deleteCycleSchema = z.object({ id: MONGOID });
export const getCyclesSchema = z.object({ limit: z.number().int().min(1).max(100).optional() }).optional();
export const dailyLogSchema = z.object({
  date: dateOnly, cycleId: MONGOID.optional().nullable(),
  flow: z.enum(["NONE", "SPOTTING", "LIGHT", "MEDIUM", "HEAVY"]).optional().nullable(),
  painLevel: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).optional().nullable(),
  mood: z.string().trim().max(50).optional().nullable(),
  energyLevel: z.enum(["LOW", "NORMAL", "HIGH"]).optional().nullable(),
  symptoms: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  sleepQuality: z.enum(["POOR", "FAIR", "GOOD"]).optional().nullable(),
  appetite: z.enum(["LOW", "NORMAL", "HIGH"]).optional().nullable(),
  cervicalMucus: z.enum(["NONE", "STICKY", "CREAMY", "WATERY", "EGG_WHITE"]).optional().nullable(),
  temperature: z.number().min(30).max(45).optional().nullable(),
  medication: z.string().trim().max(500).optional().nullable(),
  notes: optionalText,
});
export const dailyLogByDateSchema = z.object({ date: dateOnly });
export const deleteDailyLogSchema = z.object({ id: MONGOID });
export const updateProfileSchema = z.object({
  averageCycleLength: z.number().int().min(15).max(90).optional().nullable(),
  averagePeriodLength: z.number().int().min(1).max(20).optional().nullable(),
  predictionEnabled: z.boolean().optional(), fertileWindowEnabled: z.boolean().optional(),
  dashboardEnabled: z.boolean().optional(), duriaAccessEnabled: z.boolean().optional(),
});
export const menstrualReminderSchema = z.object({
  type: z.enum(["EXPECTED_PERIOD", "DAILY_LOG", "MEDICATION", "APPOINTMENT"]),
  enabled: z.boolean(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid time").optional().nullable(),
  daysBefore: z.number().int().min(0).max(30).optional().nullable(),
});
export const menstrualContextAttachmentSchema = z.object({ kind: z.enum(["SUMMARY", "RECENT_LOGS", "CYCLE_HISTORY"]).default("SUMMARY") }).optional();

export type StartPeriodInput = z.infer<typeof startPeriodSchema>;
export type EndPeriodInput = z.infer<typeof endPeriodSchema>;
export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;
export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type MenstrualReminderInput = z.infer<typeof menstrualReminderSchema>;
export type MenstrualContextAttachmentInput = z.infer<typeof menstrualContextAttachmentSchema>;
