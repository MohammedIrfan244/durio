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


  // stats

  export interface ITodoStatsResponsePayload {
  overview: OverviewStats
  today: TodayStats
  streak: StreakStats
  statusBreakdown: StatusBreakdownStats
  priorityInsights: PriorityInsights
  timePatterns: TimePatternStats
  recurringAndChecklist: RecurringChecklistStats
  insights: PersonalInsight[]
}

export interface OverviewStats {
  totalTodos: number
  activeTodos: number // PLAN + PENDING
  completedTodos: number // DONE
  cancelledOrArchived: number // CANCELLED + ARCHIVED
  overdueTodos: number // current overdue count
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
  current: {
    isActive: boolean
    count: number // days
    lastCompletedDate?: string // ISO
    daysSinceLastCompletion?: number // only if broken
  }
  longest: {
    count: number
    from?: string // ISO
    to?: string // ISO
  }
  health: {
    averageCompletedPerStreakDay: number
    activeDaysLast30: number // days with >=1 completion
    percentageActiveLast30: number // 0–100
  }
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
