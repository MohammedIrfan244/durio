"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/server/get-user";
import { revalidatePath } from "next/cache";
import { 
    IEventCreateInput, 
    ICalendarEvent, 
    ICalendarActionResponse, 
    IEvent 
} from "@/types/calendar";
import { Event } from "@prisma/client";

export async function createEvent(data: IEventCreateInput): Promise<ICalendarActionResponse<Event>> {
    try {
        const user = await getUser();
        if (!user || "error" in user) throw new Error("Unauthorized");

        const event = await prisma.event.create({
            data: {
                userId: user.id as string,
                ...data,
            },
        });

        await prisma.notification.create({
            data: {
                userId: user.id as string,
                message: `New event scheduled: ${event.title}`,
                date: event.startDate,
            }
        });

        revalidatePath("/calendar");
        return { success: true, event };
    } catch (error) {
        console.error("Failed to create event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

export async function updateEvent(id: string, data: Partial<IEventCreateInput>): Promise<ICalendarActionResponse<Event>> {
    try {
        const user = await getUser();
        if (!user || "error" in user) throw new Error("Unauthorized");

        const event = await prisma.event.update({
            where: { id, userId: user.id as string },
            data,
        });

        revalidatePath("/calendar");
        return { success: true, event };
    } catch (error) {
        console.error("Failed to update event:", error);
        return { success: false, error: "Failed to update event" };
    }
}

export async function deleteEvent(id: string): Promise<ICalendarActionResponse<void>> {
    try {
        const user = await getUser();
        if (!user || "error" in user) throw new Error("Unauthorized");

        await prisma.event.delete({
            where: { id, userId: user.id as string },
        });

        revalidatePath("/calendar");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

export async function searchEvents(query: string): Promise<Event[]> {
    try {
        const user = await getUser();
        if (!user || "error" in user) return [];

        const events = await prisma.event.findMany({
            where: {
                userId: user.id as string,
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 10,
        });
        return events;
    } catch (error) {
        console.error("Failed to search events:", error);
        return [];
    }
}

export async function getUnifiedCalendarData(startDate: Date, endDate: Date): Promise<ICalendarEvent[]> {
    try {
        const user = await getUser();
        if (!user || "error" in user) return [];

        const events = await prisma.event.findMany({
            where: {
                userId: user.id as string,
                startDate: { gte: startDate },
            },
            include: { category: true }
        });

        const todosWithDates = await prisma.todo.findMany({
            where: {
                userId: user.id as string,
                dueDate: { not: null, gte: startDate, lte: endDate },
                renewInterval: null
            },
            include: { checklist: true } // Include checklist to match ITodo interface
        });

        // Map events
        const mappedEvents: ICalendarEvent[] = events.map(e => ({
            id: e.id,
            title: e.title,
            start: e.startDate,
            end: e.endDate,
            isAllDay: e.isAllDay,
            type: "event",
            color: e.category?.color || "#3182ce",
            raw: e as IEvent
        }));

        // Map todos
        const mappedTodos: ICalendarEvent[] = todosWithDates.map(t => {
            const startStr = t.dueTime ? `${t.dueDate?.toISOString().split("T")[0]}T${t.dueTime}` : t.dueDate?.toISOString();
            const dateObj = new Date(startStr || new Date());
            
            return {
                id: t.id,
                title: t.title,
                start: dateObj,
                end: new Date(dateObj.getTime() + 60 * 60 * 1000),
                isAllDay: !t.dueTime,
                type: "todo",
                color: "#e53e3e",
                raw: t // t matches ITodo because we included checklist
            };
        });

        return [...mappedEvents, ...mappedTodos];
    } catch (error) {
        console.error("Failed to get unified data:", error);
        return [];
    }
}

export async function getUpcomingMilestones(): Promise<IEvent[]> {
    try {
        const user = await getUser();
        if (!user || "error" in user) return [];

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const milestones = await prisma.event.findMany({
            where: {
                userId: user.id as string,
                startDate: { gte: now, lte: thirtyDaysFromNow },
                category: {
                    name: { in: ["Birthdays", "Anniversaries"] }
                }
            },
            include: { category: true },
            orderBy: { startDate: "asc" },
            take: 5
        });

        return milestones as IEvent[];
    } catch (error) {
        console.error("Failed to get milestones:", error);
        return [];
    }
}
