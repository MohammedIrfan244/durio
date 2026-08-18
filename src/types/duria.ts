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
