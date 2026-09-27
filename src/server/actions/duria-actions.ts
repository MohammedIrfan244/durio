"use server";
import { prisma } from "@/lib/prisma";
import { getUser, getUserId } from "@/lib/server/get-user";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { Prisma } from "@prisma/client";
import type {
    DuriaEventContext,
    DuriaListFilters,
    DuriaNoteContext,
    DuriaTodoContext,
    DuriaFocusBlockContext,
} from "@/types/duria";
import { aiListSchema } from "@/schema/duria";
import { getCyclePredictions } from "@/lib/logic/menstruation/cycle-predictions";
import { cycleLength } from "@/lib/logic/menstruation/cycle-calculations";
import type { MenstrualCycleData } from "@/types/menstruation";
import type { DuriaMenstrualContext } from "@/types/duria";
import { menstrualContextAttachmentSchema, type MenstrualContextAttachmentInput } from "@/schema/menstruation";


export const getTodosForAI = withErrorWrapper<DuriaTodoContext[], [DuriaListFilters | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;
    
    const whereClause: Prisma.TodoWhereInput = { userId };
    if (!validatedInput?.includeArchived) {
        whereClause.status = { not: "ARCHIVED" };
    }

    const todos = await prisma.todo.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            tags: true,
            checklist: { select: { text: true, marked: true } }
        }
    });
    return todos;
});

export const getNotesForAI = withErrorWrapper<DuriaNoteContext[], [DuriaListFilters | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;

    const whereClause: Prisma.NoteWhereInput = { 
        userId,
        status: { not: "ARCHIVED" } 
    };
    if (validatedInput?.folderId) {
        whereClause.folderId = validatedInput.folderId;
    }

    const notes = await prisma.note.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            heading: true,
            description: true,
            color: true,
            folder: { select: { name: true } },
            createdAt: true,
            updatedAt: true
        }
    });
    return notes;
});

export const getEventsForAI = withErrorWrapper<DuriaEventContext[], [DuriaListFilters | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;

    const whereClause: Prisma.EventWhereInput = { userId };
    
    if (validatedInput?.startDate || validatedInput?.endDate) {
        whereClause.startDate = {};
        if (validatedInput.startDate) whereClause.startDate.gte = new Date(validatedInput.startDate);
        if (validatedInput.endDate) whereClause.startDate.lte = new Date(validatedInput.endDate);
    }

    const events = await prisma.event.findMany({
        where: whereClause,
        orderBy: { startDate: "asc" },
        take: limit,
        select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isAllDay: true,
            location: true,
            category: true
        }
    });
    return events;
});

export const getFocusBlocksForAI = withErrorWrapper<DuriaFocusBlockContext[], [DuriaListFilters | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;

    const focusBlocks = await prisma.routineBlock.findMany({
        where: { userId, isActive: true },
        orderBy: { startTime: "asc" },
        take: limit,
        select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            daysOfWeek: true,
            priority: true,
            energyLevel: true,
            transitionRitual: true,
            isActive: true,
        }
    });
    return focusBlocks as DuriaFocusBlockContext[];
});

/** Only called after the user explicitly chooses to attach cycle context. */
export const getMenstrualSummaryForAI = withErrorWrapper<DuriaMenstrualContext, [MenstrualContextAttachmentInput?]>(async input => {
    const attachment = menstrualContextAttachmentSchema.parse(input)?.kind ?? "SUMMARY";
    const user = await getUser();
    const userId = user.id;
    const profile = await prisma.menstrualProfile.findUnique({ where: { userId } });
    if (!profile?.duriaAccessEnabled) throw new Error("Cycle sharing with DURIA is disabled in Cycle settings");
    const [cycles, logs] = await Promise.all([
        prisma.menstrualCycle.findMany({ where: { userId }, orderBy: { periodStartDate: "desc" }, take: 24 }),
        prisma.menstrualDailyLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 7, select: { date: true, symptoms: true, mood: true, energyLevel: true } }),
    ]);
    const timezone = user.timezone || "UTC";
    const predictions = getCyclePredictions(cycles as MenstrualCycleData[], profile.averageCycleLength, profile.fertileWindowEnabled, timezone);
    const active = cycles.find((cycle) => !cycle.periodEndDate);
    return {
        attachmentType: attachment,
        currentCycleDay: active ? cycleLength(active.periodStartDate, new Date(), timezone) + 1 : undefined,
        currentPhase: active ? "Period" : cycles.length ? "Between periods" : undefined,
        lastPeriodStart: cycles[0]?.periodStartDate,
        lastPeriodEnd: cycles[0]?.periodEndDate,
        predictedNextPeriod: predictions.nextPeriod,
        predictedOvulation: predictions.ovulation,
        averageCycleLength: predictions.averageCycleLength,
        recentSymptoms: [...new Set(logs.flatMap((log) => log.symptoms))],
        recentMood: logs[0]?.mood,
        recentEnergy: logs[0]?.energyLevel,
        predictionConfidence: predictions.confidence,
        recentDailyLogs: attachment === "RECENT_LOGS" ? logs.map(log => ({ date: log.date, symptoms: log.symptoms, mood: log.mood, energyLevel: log.energyLevel })) : undefined,
        cycleHistory: attachment === "CYCLE_HISTORY" ? cycles.map(cycle => ({ periodStartDate: cycle.periodStartDate, periodEndDate: cycle.periodEndDate, cycleLength: cycle.cycleLength, periodLength: cycle.periodLength, isIrregular: cycle.isIrregular })) : undefined,
    };
});
