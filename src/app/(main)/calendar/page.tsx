import { Metadata } from "next";
import CalendarDashboard from "@/components/pages/calendar/calendar";
import { getUnifiedCalendarData, getUpcomingMilestones, getOrCreateDefaultCategories } from "@/server/actions/calendar-actions";
import { ICalendarEvent, IEvent } from "@/types/calendar";
import { EventCategory } from "@prisma/client";

export const metadata: Metadata = {
    title: "Calendar - Durio",
    description: "Manage your schedule, tasks, and upcoming events.",
};

export default async function CalendarPage() {
    // current month daa
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    const [events, milestones, categories]: [ICalendarEvent[], IEvent[], EventCategory[]] = await Promise.all([
        getUnifiedCalendarData(start, end),
        getUpcomingMilestones(),
        getOrCreateDefaultCategories(),
    ]);

    return (
        <CalendarDashboard initialEvents={events} milestones={milestones} categories={categories} />
    );
}
