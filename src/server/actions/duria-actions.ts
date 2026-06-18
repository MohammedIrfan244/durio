"use server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { withErrorWrapper } from "@/lib/server/error-wrapper";

export const getTodosForAI = withErrorWrapper<any, [{ limit?: number, includeArchived?: boolean } | undefined]>(async (input) => {
    const userId = await getUserId();
    const limit = input?.limit || 20;
    
    const whereClause: any = { userId };
    if (!input?.includeArchived) {
        whereClause.status = { not: "ARCHIVED" };
    }

    const todos = await prisma.todo.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            heading: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            tags: true,
            checklists: { select: { title: true, isCompleted: true } }
        }
    });
    return todos;
});

export const getNotesForAI = withErrorWrapper<any, [{ folderId?: string, limit?: number } | undefined]>(async (input) => {
    const userId = await getUserId();
    const limit = input?.limit || 20;

    const whereClause: any = { 
        userId,
        status: { not: "ARCHIVED" } 
    };
    if (input?.folderId) {
        whereClause.folderId = input.folderId;
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
            tags: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return notes;
});

export const getEventsForAI = withErrorWrapper<any, [{ startDate?: Date, endDate?: Date, limit?: number } | undefined]>(async (input) => {
    const userId = await getUserId();
    const limit = input?.limit || 20;

    const whereClause: any = { userId };
    
    if (input?.startDate || input?.endDate) {
        whereClause.startDate = {};
        if (input.startDate) whereClause.startDate.gte = input.startDate;
        if (input.endDate) whereClause.startDate.lte = input.endDate;
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
            isSpecialOccasion: true,
            location: true,
            category: true,
            originalYear: true
        }
    });
    return events;
});
