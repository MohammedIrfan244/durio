import { TodoStatus, TodoPriority, RenewInterval } from "@/schema/todo";

export type ITodoStatus = TodoStatus;
export type ITodoStatusChangeable = Exclude<TodoStatus, 'OVERDUE' | 'ARCHIVED'>; // Derived dynamically
export type IPriority = TodoPriority;
export type IPriorityWithNone = IPriority | 'NONE';
export type ITodoStatusWithNone = ITodoStatus | 'NONE';
export type IRenewInterval = RenewInterval;

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

export interface IGetArchivedTodoList {
    id: string;
    title: string;
}

export type IGetArchivedTodoListPayload = IGetArchivedTodoList[];

export interface IGetTodoListPayload {
    plan: IGetTodoList[];
    pending: IGetTodoList[];
    done: IGetTodoList[];
  }

  export interface IGetTodoTagsPayload {
    tag: string;
    label: string;
  }


  // stats

  export interface ITodoStatsResponsePayload {
  overview: OverviewStats
  streak: StreakStats
  weekly: WeeklyStats
  priorityFocus: PriorityStats
  yourRythm: RythmStats
  insights: PersonalInsight[]
  fact: InterestingFact | null
}

export interface InterestingFact {
  id: string
  type: "FACT"
  message: string
}

export interface PriorityStats {
  highPriorityCount: number
  mediumPriorityCount: number
  lowPriorityCount: number
  highCompletionRate: number
  mediumCompletionRate: number
  lowCompletionRate: number
}

export interface RythmStats {
  bestDayOfWeek : string
  averagePerDay: number
}

export interface WeeklyStats {
  completedTodayCount: number
  dueTodayCount: number
  completedThisWeekCount: number
  createdThisWeekCount: number
}

export interface OverviewStats {
  totalTodos: number
  activeTodos: number 
  completedTodos: number 
  archivedTodos: number
  overdueTodos: number
}


export interface TodayStats {
  dueToday: number
  overdueNow: number
  completedToday: number
  completedThisWeek: number
  createdToday: number
  createdThisWeek: number
  completionRateToday?: number // 0–100, optional if no due today
}

export interface StreakStats {
  count: number
  longest: number
  lastCompleted: Date | null
  inLastThirtyDays: number
}

export interface StatusBreakdownStats {
  counts: {
    PLAN: number
    PENDING: number
    DONE: number
    CANCELLED: number
    OVERDUE: number
    ARCHIVED: number
  }
  trendInsight: string
}

export interface PriorityInsights {
  counts: {
    HIGH: number
    MEDIUM: number
    LOW: number
    NONE: number
  }

  completionRate: {
    HIGH: number
    MEDIUM: number
    LOW: number
    NONE: number
  }

  overdue: {
    HIGH: number
    MEDIUM: number
    LOW: number
    NONE: number
  }
}

export interface PriorityInsights {
  counts: {
    HIGH: number
    MEDIUM: number
    LOW: number
    NONE: number
  }

  completionRate: {
    HIGH: number
    MEDIUM: number
    LOW: number
    NONE: number
  }

  overdue: {
    HIGH: number
    MEDIUM: number
    LOW: number
    NONE: number
  }
}

export interface RecurringChecklistStats {
  recurring: {
    total: number
    completedOnTime: number
    overdueOrSkipped: number
  }

  checklist: {
    todosWithChecklist: number
    todosWithoutChecklist: number

    averageItemsPerTodo: number
    completionRate: number // 0–100
  }
}

export interface PersonalInsight {
  id: string
  type: "POSITIVE" | "WARNING" | "NEUTRAL"
  message: string
}

export interface TimePatternStats {
  mostProductiveDay: Weekday | null
  leastProductiveDay: Weekday | null

  averageCompletedPerDay: number

  zeroActivityDaysLast30: number

  bestStreakWeekday?: Weekday
}

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"
