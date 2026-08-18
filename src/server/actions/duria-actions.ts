"use server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
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
