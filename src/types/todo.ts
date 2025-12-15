export type ITodoStatus = 'PLAN' | 'PENDING' | 'DONE' | 'CANCELLED' | 'OVERDUE' | 'ARCHIVED';
export type ITodoStatusChangeable = 'PLAN' | 'PENDING' | 'DONE' | 'CANCELLED';
export type IPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type IPriorityWithNone = 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
export type ITodoStatusWithNone = 'PLAN' | 'PENDING' | 'DONE' | 'CANCELLED' | 'OVERDUE' | 'ARCHIVED' | 'NONE';
export type IRenewInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export const prioritySortValues : Record<IPriority, number> = {
  'HIGH': 3,
  'MEDIUM': 2,
  'LOW': 1,
};

export const statusValues = {
  PLAN: 'PLAN',
  PENDING: 'PENDING',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
  ARCHIVED: 'ARCHIVED',
}

export interface ITodo {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: ITodoStatus;
  priority?: IPriority | null;
  tags: string[];
  dueDate?: Date | null;
  dueTime?: string | null;
  renewInterval?: IRenewInterval | null;
  renewEvery?: number | null;
  renewCustom?: string | null;
  checklist: IChecklistItem[];
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChecklistItem {
  id: string;
  todoId: string;
  text: string;
  marked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITodoStreak {
  id: string;
  userId: string;
  count: number;
  longest: number;
  lastCompleted?: Date | null;
}

export interface ITodoNotification {
  id: string;
  userId: string;
  message: string;
  date: Date;
  read: boolean;
  createdAt: Date;
}


// payloads

export interface IGetTodoList {
  id: string;
  title: string;
  status: ITodoStatus;
  priority?: IPriority | null;
  dueDate?: Date | null;
  renewStart?: Date | null;
  renewInterval?: IRenewInterval | null;
  renewEvery?: number | null;
}

export interface IGetTodoListPayload {
    plan: IGetTodoList[];
    pending: IGetTodoList[];
    done: IGetTodoList[];
  }

  export interface IGetTodoTagsPayload {
    tag: string;
    label: string;
  }