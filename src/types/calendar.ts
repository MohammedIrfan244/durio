import { Event, EventCategory, RoutineBlock } from "@prisma/client";
import { ITodo } from "./todo";
import { LucideIcon } from "lucide-react";

export type IEventCategory = EventCategory

export interface IEvent extends Event {
    category?: IEventCategory | null;
}

export interface ICalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    isAllDay: boolean;
    type: "event" | "todo" | "focus";
    color: string;
    raw: IEvent | ITodo | RoutineBlock;
}

export interface IEventCreateInput {
    title: string;
    description?: string;
    location?: string;
    isAllDay?: boolean;
    startDate: Date;
    endDate: Date;
    categoryId?: string;
    linkedResources?: Array<{ id: string; type: string }>;
}

export interface IWeatherData {
    [date: string]: {
        max: number;
        min: number;
        code: number;
    };
}

export interface ICalendarActionResponse<T> {
    success: boolean;
    event?: T;
    error?: string;
}

export interface ICalendarGridProps {
    searchQuery: string;
    initialEvents: ICalendarEvent[];
}

export interface IStaticCategory {
    id: string;
    label: string;
    color: string;
    icon: LucideIcon;
}
