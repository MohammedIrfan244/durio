"use server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { z } from "zod";

const aiListSchema = z.object({
    folderId: z.string().trim().min(1).optional(),
    startDate: z.union([z.string(), z.date()]).optional(),
    endDate: z.union([z.string(), z.date()]).optional(),
    limit: z.number().int().min(1).max(30).optional(),
    includeArchived: z.boolean().optional(),
}).optional();

export const getTodosForAI = withErrorWrapper<any, [{ limit?: number, includeArchived?: boolean } | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;
    
    const whereClause: any = { userId };
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

export const getNotesForAI = withErrorWrapper<any, [{ folderId?: string, limit?: number } | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;

    const whereClause: any = { 
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

export const getEventsForAI = withErrorWrapper<any, [{ startDate?: Date, endDate?: Date, limit?: number } | undefined]>(async (input) => {
    const validatedInput = aiListSchema.parse(input);
    const userId = await getUserId();
    const limit = validatedInput?.limit || 20;

    const whereClause: any = { userId };
    
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
