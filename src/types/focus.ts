import type { Priority, RoutineBlock } from "@prisma/client";

export type FocusEnergyLevel = "HIGH" | "MEDIUM" | "LOW" | "RECOVERY";
export type FocusReviewStatus = "CRUSHED_IT" | "SURVIVED" | "TANGENT";

export interface FocusBlockInput {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek?: number[];
  energyLevel?: FocusEnergyLevel;
  priority?: Priority;
  transitionRitual?: string | null;
  color?: string | null;
  icon?: string | null;
  linkedNoteId?: string | null;
  isActive?: boolean;
}

export interface UpdateFocusBlockInput extends Partial<FocusBlockInput> {
  id: string;
}

export interface DeleteFocusBlockInput {
  id: string;
  reason?: string;
}

export interface FocusBlockLogInput {
  routineBlockId: string;
  status: FocusReviewStatus;
  flowPoints: number;
}

export interface FocusBlockWithNoteTitle extends RoutineBlock {
  linkedNoteTitle: string | null;
}

export interface FocusNoteOption {
  id: string;
  title: string;
  isFolder: false;
}

export interface FocusNoteFolderOption {
  id: string;
  title: string;
  isFolder: true;
  children: FocusNoteOption[];
}

export type FocusNotePickerOption = FocusNoteOption | FocusNoteFolderOption;
