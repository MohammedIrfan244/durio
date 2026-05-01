import { Metadata } from "next";
import CalendarDashboard from "@/components/pages/calendar/calendar";
import { getUnifiedCalendarData, getUpcomingMilestones } from "@/server/actions/calendar-actions";
import { ICalendarEvent, IEvent } from "@/types/calendar";

export const metadata: Metadata = {
    title: "Calendar | Durio",
    description: "Manage your schedule, tasks, and upcoming events.",
};

export default async function CalendarPage() {
    // Fetch data for the current month roughly
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    const events: ICalendarEvent[] = await getUnifiedCalendarData(start, end);
    const milestones: IEvent[] = await getUpcomingMilestones();

    return (
        <CalendarDashboard initialEvents={events} milestones={milestones} />
    );
}