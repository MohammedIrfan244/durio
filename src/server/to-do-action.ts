"use server";
import { withErrorWrapper, AppError } from "@/lib/server-utils/error-wrapper";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server-utils/get-user";
import { ITodo , IGetTodoListPayload, ITodoStatus , IGetTodoTagsPayload , prioritySortValues, IPriority, IGetTodoList, ITodoStatsResponsePayload, OverviewStats, TodayStats, StreakStats, PriorityInsights, TimePatternStats, PersonalInsight, IGetArchivedTodoListPayload } from "@/types/todo";
import { 
  createTodoSchema, 
  getTodoByIdSchema,
  todoFilterSchema,
  updateTodoSchema,
  deleteTodoSchema,
  bulkDeleteTodoSchema,
  changeTodoStatusSchema,
  bulkChangeTodoStatusSchema,
  markChecklistItemSchema,
  restoreTodoFromArchiveSchema,
  CreateTodoInput,
  TodoFilterInput,
  GetTodoByIdInput,
  UpdateTodoInput,
  DeleteTodoInput,
  BulkDeleteTodoInput,
  ChangeTodoStatusInput,
  BulkChangeTodoStatusInput,
  MarkChecklistItemInput,
  RestoreTodoFromArchiveInput,
  SearchArchiveTodosInput
} from "@/schema/todo";
import type { Prisma } from "@prisma/client";
import { today } from "@/lib/helper/today";

// Helper function to check if a date is a renewal day
function isRenewalDay(renewStart: Date | null, renewInterval: string | null, renewEvery: number | null): boolean {
  if (!renewStart || !renewInterval || !renewEvery) return false;

  const currentDate = today();
  const startDate = new Date(renewStart);
  startDate.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDifference < 0) return false; // Hasn't started yet

  switch (renewInterval) {
    case "DAILY":
      return daysDifference % renewEvery === 0;
    case "WEEKLY":
      return daysDifference % (renewEvery * 7) === 0;
    case "MONTHLY":
      // Simplified: check if it's the right day of month
      return currentDate.getDate() === startDate.getDate() && daysDifference % (renewEvery * 30) === 0;
    case "YEARLY":
      return daysDifference % (renewEvery * 365) === 0;
    default:
      return false;
  }
}

function getPrioritySortValue(priority?: string): number {
  if(!priority)return 0;
  return prioritySortValues[priority as IPriority];
}

function generateInsights(input: {
  overview: OverviewStats
  today: TodayStats
  streak: StreakStats
  priority: PriorityInsights
  time: TimePatternStats
}): PersonalInsight[] {
  const insights: PersonalInsight[] = [];

  if (input.streak.current.isActive && input.streak.current.count >= 7) {
    insights.push({
      id: "strong-streak",
      type: "POSITIVE",
      message: "You are maintaining a strong and consistent daily streak.",
    });
  }

  if (!input.streak.current.isActive && input.streak.current.count > 0) {
    insights.push({
      id: "streak-broken",
      type: "WARNING",
      message:
        "Your streak has been broken. Completing at least one task today will restart it.",
    });
  }

  if (input.overview.overdueTodos > 0) {
    insights.push({
      id: "overdue-pressure",
      type: "WARNING",
      message: "Overdue tasks are adding pressure to your workflow.",
    });
  }

  if (
    input.priority.counts.HIGH > 0 &&
    input.priority.overdue.HIGH === 0
  ) {
    insights.push({
      id: "high-priority-control",
      type: "POSITIVE",
      message:
        "You are staying on top of high-priority tasks without letting them slip.",
    });
  }

  if (input.today.completedThisWeek > input.today.createdThisWeek) {
    insights.push({
      id: "backlog-reduction",
      type: "POSITIVE",
      message:
        "You are reducing your backlog by completing more tasks than you create.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "neutral-state",
      type: "NEUTRAL",
      message:
        "Your activity is stable. Small consistent actions will improve your momentum.",
    });
  }

  return insights;
}

// Action to create a new to-do item , done
export const createTodo = withErrorWrapper<ITodo , [CreateTodoInput]>(async (input: CreateTodoInput): Promise<ITodo> => {
  const validatedInput = createTodoSchema.parse(input);
  
  const userId = await getUserId();

  const priorityInt = getPrioritySortValue(validatedInput.priority);

  const todo = await prisma.todo.create({
    data: {
      userId,
      title: validatedInput.title,
      description: validatedInput.description,
      status: (validatedInput.status || "PLAN") as ITodoStatus,
      priority: validatedInput.priority,
      priorityInt,
      tags: validatedInput.tags || [],
      dueDate: validatedInput.dueDate ? new Date(validatedInput.dueDate) : undefined,
      dueTime: validatedInput.dueTime,
      renewStart: validatedInput.renewStart ? new Date(validatedInput.renewStart) : undefined,
      renewInterval: validatedInput.renewInterval,
      renewEvery: validatedInput.renewEvery,
      renewCustom: validatedInput.renewCustom,
      checklist: validatedInput.checklist ? {
        create: validatedInput.checklist.map(item => ({
          text: item.text,
        })),
      } : undefined,
    },
    include: {
      checklist: true,
    },
  });

  return todo as ITodo;
}); 

// Action to get a list of to-do items with optional filtering and sorting , done
export const getTodoList = withErrorWrapper<IGetTodoListPayload, [TodoFilterInput]>(async (filters: TodoFilterInput):Promise<IGetTodoListPayload> => {
    const validatedFilters = todoFilterSchema.parse(filters);
    const userId = await getUserId();

    const andConditions: Prisma.TodoWhereInput[] = [{ userId }];

    if (validatedFilters.status) {
      andConditions.push({ status: validatedFilters.status });
    }

    if (validatedFilters.priority) {
      andConditions.push({ priority: validatedFilters.priority });
    }

    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      andConditions.push({ tags: { hasSome: validatedFilters.tags } });
    }

    if (validatedFilters.query) {
      const q = validatedFilters.query;
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      });
    }

    const sortFieldMap = {
      CREATED_AT: "createdAt",
      DUE_DATE: "dueDate",
      PRIORITY: "priorityInt",
    } as const;

    const prismaSortField =
      validatedFilters.sortBy ? sortFieldMap[validatedFilters.sortBy] : "createdAt";

    const prismaSortOrder = validatedFilters.sortOrder?.toLowerCase() || "desc";

    const todos = await prisma.todo.findMany({
      where: { AND: andConditions , NOT: { status: "ARCHIVED" } },
      orderBy: {
        [prismaSortField]: prismaSortOrder,
      },
    });

    const grouped: IGetTodoListPayload = {
      plan: [],
      pending: [],
      done: [],
    };

    for (const todo of todos) {
      switch (todo.status) {
        case "PLAN":
          grouped.plan.push(todo);
          break;

        case "PENDING":
        case "OVERDUE":
          grouped.pending.push(todo);
          break;

        case "DONE":
        case "CANCELLED":
          grouped.done.push(todo);
          break;

        default:
          grouped.plan.push(todo);
      }
    }

    return grouped;
  }
);

// Action to get a specific to-do item by ID , done
export const getTodoById = withErrorWrapper<ITodo, [GetTodoByIdInput]>(async (input: GetTodoByIdInput): Promise<ITodo> => {
  const validatedInput = getTodoByIdSchema.parse(input);
  const userId = await getUserId();

  const todo = await prisma.todo.findFirst({
    where: {
      id: validatedInput.id,
      userId,
    },
    include: {
      checklist: true,
    },
  });

  if (!todo) {
    const error = new Error("Todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }
  return todo as ITodo;
});

// Action to update a to-do item , done
export const updateTodo = withErrorWrapper<ITodo, [UpdateTodoInput]>(async (input: UpdateTodoInput): Promise<ITodo> => {
  const validatedInput = updateTodoSchema.parse(input);
  const userId = await getUserId();

  // Verify user owns this todo
  const existingTodo = await prisma.todo.findFirst({
    where: { id: validatedInput.id, userId },
  });

  if (!existingTodo) {
    const error = new Error("Todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }

  // Handle checklist updates
  if (validatedInput.checklist) {
    await prisma.checklistItem.deleteMany({
      where: { todoId: validatedInput.id },
    });
  }

  let priorityInt: number = existingTodo.priorityInt;
  if(validatedInput.priority !== existingTodo.priority && (typeof validatedInput.priority === "string")) {
    priorityInt = getPrioritySortValue(validatedInput.priority);
  }

  const todo = await prisma.todo.update({
    where: { id: validatedInput.id },
    data: {
      title: validatedInput.title,
      description: validatedInput.description,
      priority: validatedInput.priority,
      priorityInt,
      tags: validatedInput.tags,
      dueDate: validatedInput.dueDate ? new Date(validatedInput.dueDate) : undefined,
      dueTime: validatedInput.dueTime,
      renewStart: validatedInput.renewStart ? new Date(validatedInput.renewStart) : undefined,
      renewInterval: validatedInput.renewInterval,
      renewEvery: validatedInput.renewEvery,
      renewCustom: validatedInput.renewCustom,
      status: validatedInput.status as ITodoStatus,
      checklist: validatedInput.checklist ? {
        create: validatedInput.checklist.map(item => ({
          text: item.text,
        })),
      } : undefined,
    },
    include: {
      checklist: true,
    },
  });

  return todo as ITodo;
});

// Action to hard delete a to-do item (permanent deletion)  done
export const deleteTodo = withErrorWrapper<void, [DeleteTodoInput]>(async (input: DeleteTodoInput): Promise<void> => {
  const validatedInput = deleteTodoSchema.parse(input);
  const userId = await getUserId();

  const todo = await prisma.todo.findFirst({
    where: { id: validatedInput.id, userId },
  });

  if (!todo) {
    const error = new Error("Todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }

  // Delete checklist items first
  await prisma.checklistItem.deleteMany({
    where: { todoId: validatedInput.id },
  });

  // Delete the todo
  await prisma.todo.delete({
    where: { id: validatedInput.id },
  });
});

// Action to soft delete a to-do item (archive) , done
export const softDeleteTodo = withErrorWrapper<ITodo, [DeleteTodoInput]>(async (input: DeleteTodoInput): Promise<ITodo> => {
  const validatedInput = deleteTodoSchema.parse(input);
  const userId = await getUserId();

  const todo = await prisma.todo.findFirst({
    where: { id: validatedInput.id, userId },
  });

  if (!todo) {
    const error = new Error("Todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }
  return await prisma.todo.update({
    where: { id: validatedInput.id },
    data: { status: "ARCHIVED" },
    include: { checklist: true },
  }) as ITodo;
});

// Action to bulk delete to-do items (permanent deletion) done
export const bulkDeleteTodos = withErrorWrapper<void, []>(async (): Promise<void> => {
  const userId = await getUserId();

  const todosToDelete = await prisma.todo.findMany({
    where: { userId , status: "ARCHIVED" },
  });

  if (todosToDelete.length === 0) {
    const error = new Error("No archived todos found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }

  await prisma.todo.deleteMany({
    where: { id: { in: todosToDelete.map(todo => todo.id) } , userId , status: "ARCHIVED" },
  })
});

// Action to bulk soft delete to-do items (archive) done
export const bulkSoftDeleteTodos = withErrorWrapper<void, [BulkDeleteTodoInput]>(async (input: BulkDeleteTodoInput): Promise<void> => {
  const validatedInput = bulkDeleteTodoSchema.parse(input);
  const userId = await getUserId();

  const todos = await prisma.todo.findMany({
    where: { id: { in: validatedInput.ids }, userId },
  });

  if (todos.length !== validatedInput.ids.length) {
    const error = new Error("Some todos not found or don't belong to you") as AppError;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  await Promise.all(
    validatedInput.ids.map(id =>
      prisma.todo.update({
        where: { id },
        data: { status: "ARCHIVED" },
        include: { checklist: true },
      })
    )
  );
  return 
});

// Action to change status of a single to-do done
export const changeTodoStatus = withErrorWrapper<ITodo, [ChangeTodoStatusInput]>(async (input: ChangeTodoStatusInput): Promise<ITodo> => {
  const validatedInput = changeTodoStatusSchema.parse(input);
  const userId = await getUserId();

  const todo = await prisma.todo.findFirst({
    where: { id: validatedInput.id, userId },
  });

  if (!todo) {
    const error = new Error("Todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }

  // Update completedAt if status is DONE
  const completedAt = validatedInput.status === "DONE" ? new Date() : null;
  return await prisma.todo.update({
    where: { id: validatedInput.id },
    data: { status: validatedInput.status as ITodoStatus, completedAt },
    include: { checklist: true },
  }) as ITodo;
});

// Action to bulk change status cancelled
export const bulkChangeTodoStatus = withErrorWrapper<ITodo[], [BulkChangeTodoStatusInput]>(async (input: BulkChangeTodoStatusInput): Promise<ITodo[]> => {
  const validatedInput = bulkChangeTodoStatusSchema.parse(input);
  const userId = await getUserId();

  const todos = await prisma.todo.findMany({
    where: { id: { in: validatedInput.ids }, userId },
  });

  if (todos.length !== validatedInput.ids.length) {
    const error = new Error("Some todos not found or don't belong to you") as AppError;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const completedAt = validatedInput.status === "DONE" ? new Date() : null;

  const updatedTodos = await Promise.all(
    validatedInput.ids.map(id =>
      prisma.todo.update({
        where: { id },
        data: { status: validatedInput.status as ITodoStatus, completedAt },
        include: { checklist: true },
      })
    )
  );
  return updatedTodos as ITodo[];
});

// Action to mark/unmark a checklist item done 
export const markChecklistItem = withErrorWrapper<ITodo, [MarkChecklistItemInput]>(async (input: MarkChecklistItemInput): Promise<ITodo> => {
  const validatedInput = markChecklistItemSchema.parse(input);
  const userId = await getUserId();

  const todo = await prisma.todo.findFirst({
    where: { id: validatedInput.todoId, userId },
  });

  if (!todo) {
    const error = new Error("Todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }

  const checklistItem = await prisma.checklistItem.findUnique({
    where: { id: validatedInput.checklistItemId },
  });

  if (!checklistItem) {
    const error = new Error("Checklist item not found") as AppError;
    error.code = "CHECKLIST_ITEM_NOT_FOUND";
    throw error;
  }

  // Toggle the marked status
  await prisma.checklistItem.update({
    where: { id: validatedInput.checklistItemId },
    data: { marked: !checklistItem.marked },
  });
  return await prisma.todo.findUniqueOrThrow({
    where: { id: validatedInput.todoId },
    include: { checklist: true },
  }) as ITodo;
});

// Action to get today's todos (due today, overdue, and renewal tasks) , done
export const getTodayTodos = withErrorWrapper<IGetTodoListPayload,[]>(async (): Promise<IGetTodoListPayload> => {
  const userId = await getUserId();
  const currentDate = today();

  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todos = await prisma.todo.findMany({
    where: {
      userId,
      NOT: { status: "ARCHIVED" },
      OR: [
        {
          dueDate: {
            gte: currentDate,
            lt: tomorrow,
          },
        },
        {
          dueDate: { lt: currentDate },
          status: { not: "DONE" },
        },
      ],
    },
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      renewStart: true,
      renewInterval: true,
      renewEvery: true,
    },
  });

  const filtered = todos.filter((todo) => {
    if (todo.renewStart && todo.renewInterval && todo.renewEvery) {
      return isRenewalDay(
        todo.renewStart,
        todo.renewInterval,
        todo.renewEvery
      );
    }
    return true;
  });

  const grouped: IGetTodoListPayload = {
    plan: [],
    pending: [],
    done: [],
  };

  for (const todo of filtered) {
    switch (todo.status) {
      case "PLAN":
        grouped.plan.push(todo);
        break;

      case "PENDING":
      case "OVERDUE": 
        grouped.pending.push(todo);
        break;

      case "DONE":
      case "CANCELLED": 
        grouped.done.push(todo);
        break;

      default:
        grouped.plan.push(todo);
    }
  }
  return grouped;
});

// Action to get all archived todos done
export const getArchivedTodos = withErrorWrapper<IGetArchivedTodoListPayload,[]>(async (): Promise<IGetArchivedTodoListPayload> => {
  const userId = await getUserId();

  const todos = await prisma.todo.findMany({
    where: {
      userId,
      status: "ARCHIVED",
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
    },
  });
  return todos as IGetArchivedTodoListPayload;
});

// Action to restore a todo from archive done
export const restoreFromArchive = withErrorWrapper<ITodo, [RestoreTodoFromArchiveInput]>(async (input: RestoreTodoFromArchiveInput): Promise<ITodo> => {
  const validatedInput = restoreTodoFromArchiveSchema.parse(input);
  const userId = await getUserId();

  const todo = await prisma.todo.findFirst({
    where: { id: validatedInput.id, userId, status: "ARCHIVED" },
  });

  if (!todo) {
    const error = new Error("Archived todo not found") as AppError;
    error.code = "TODO_NOT_FOUND";
    throw error;
  }
  return await prisma.todo.update({
    where: { id: validatedInput.id },
    data: { status: "PLAN" },
    include: { checklist: true },
  }) as ITodo;
});

// Action to get restore all archived todos done
export const restoreAllFromArchive = withErrorWrapper<IGetTodoList[], []>(async (): Promise<IGetTodoList[]> => {
  const userId = await getUserId();
  await prisma.todo.updateMany({
    where: { userId, status: "ARCHIVED" },
    data: { status: "PLAN" },
  });
  const todos = await prisma.todo.findMany({
    where: { userId, status: "PLAN" },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      renewStart: true,
      renewInterval: true,
      renewEvery: true,
    }
  });
  return todos as IGetTodoList[];
});

// Action to get all todo tags , done
export const getTodoTags = withErrorWrapper<IGetTodoTagsPayload[], []>(async (): Promise<IGetTodoTagsPayload[]> => {
  const userId = await getUserId();
  const todos = await prisma.todo.findMany({
    where: { userId },
    select: { tags: true },
  });
  const tags = todos.flatMap(todo => todo.tags);
  const uniqueTags = Array.from(new Set(tags));
  const tagPayload : IGetTodoTagsPayload[] = uniqueTags.map(tag => ({ tag, label: tag.toUpperCase() }));
  return tagPayload;
});

// Action to search archived todos done
export const searchArchivedTodos = withErrorWrapper(async (input: SearchArchiveTodosInput) => {
    const userId = await getUserId();
    const { query } = input;

    const archivedTodos = await prisma.todo.findMany({
      where: {
        userId,
        status: "ARCHIVED",
        ...(query
          ? {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return archivedTodos;
})

// Action to get todo statistics done
export const getTodoStat = withErrorWrapper<ITodoStatsResponsePayload, []>(
  async (): Promise<ITodoStatsResponsePayload> => {
    const userId = await getUserId();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const last30Days = new Date(startOfToday);
    last30Days.setDate(last30Days.getDate() - 30);

    //  OVERVIEW

    const [
      totalTodos,
      activeTodos,
      completedTodos,
      cancelledOrArchived,
      overdueTodos,
    ] = await Promise.all([
      prisma.todo.count({ where: { userId } }),

      prisma.todo.count({
        where: {
          userId,
          status: { in: ["PLAN", "PENDING"] },
        },
      }),

      prisma.todo.count({
        where: { userId, status: "DONE" },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: { in: ["CANCELLED", "ARCHIVED"] },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
      }),
    ]);

    //  TODAY & SHORT TERM

    const [
      dueToday,
      completedToday,
      completedThisWeek,
      createdToday,
      createdThisWeek,
    ] = await Promise.all([
      prisma.todo.count({
        where: {
          userId,
          dueDate: {
            gte: startOfToday,
            lt: now,
          },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: "DONE",
          completedAt: { gte: startOfToday },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          status: "DONE",
          completedAt: { gte: startOfWeek },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          createdAt: { gte: startOfToday },
        },
      }),

      prisma.todo.count({
        where: {
          userId,
          createdAt: { gte: startOfWeek },
        },
      }),
    ]);

    const completionRateToday =
      dueToday > 0 ? Math.round((completedToday / dueToday) * 100) : undefined;

    // STREAK

    const streak = await prisma.todoStreak.findUnique({
      where: { userId },
    });

    const isStreakActive =
      streak?.lastCompleted &&
      streak.lastCompleted >= startOfToday;

    const daysSinceLastCompletion = streak?.lastCompleted
      ? Math.floor(
          (startOfToday.getTime() -
            new Date(streak.lastCompleted).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : undefined;

    const activeDaysLast30 = await prisma.todo.groupBy({
      by: ["completedAt"],
      where: {
        userId,
        status: "DONE",
        completedAt: { gte: last30Days },
      },
    });

    const percentageActiveLast30 = Math.round(
      (activeDaysLast30.length / 30) * 100
    );

    // STATUS BREAKDOWN

    const statusCountsRaw = await prisma.todo.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    });

    const statusCounts = {
      PLAN: 0,
      PENDING: 0,
      DONE: 0,
      CANCELLED: 0,
      OVERDUE: overdueTodos,
      ARCHIVED: 0,
    };

    for (const s of statusCountsRaw) {
      statusCounts[s.status] = s._count._all;
    }

    //  PRIORITY INSIGHTS

    const priorityCountsRaw = await prisma.todo.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { _all: true },
    });

    const priorityBase = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0,
    };

    for (const p of priorityCountsRaw) {
      priorityBase[p.priority ?? "NONE"] = p._count._all;
    }

    const insights = generateInsights({
  overview: {
    totalTodos,
    activeTodos,
    completedTodos,
    cancelledOrArchived,
    overdueTodos,
  },
  today: {
    dueToday,
    overdueNow: overdueTodos,
    completedToday,
    completedThisWeek,
    createdToday,
    createdThisWeek,
    completionRateToday,
  },
  streak: {
    current: {
      isActive: isStreakActive ?? false,
      count: streak?.count ?? 0,
      lastCompletedDate: streak?.lastCompleted?.toISOString(),
      daysSinceLastCompletion: isStreakActive
        ? undefined
        : daysSinceLastCompletion,
    },
    longest: {
      count: streak?.longest ?? 0,
    },
    health: {
      averageCompletedPerStreakDay:
        streak && streak.count > 0
          ? completedThisWeek / streak.count
          : 0,
      activeDaysLast30: activeDaysLast30.length,
      percentageActiveLast30,
    },
  },
  priority: {
    counts: priorityBase,
    completionRate: {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0,
    },
    overdue: {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0,
    },
  },
  time: {
    mostProductiveDay: null,
    leastProductiveDay: null,
    averageCompletedPerDay:
      Math.round((completedThisWeek / 7) * 10) / 10,
    zeroActivityDaysLast30: 30 - activeDaysLast30.length,
  },
});
    // FINAL RETURN

    return {
      overview: {
        totalTodos,
        activeTodos,
        completedTodos,
        cancelledOrArchived,
        overdueTodos,
      },

      today: {
        dueToday,
        overdueNow: overdueTodos,
        completedToday,
        completedThisWeek,
        createdToday,
        createdThisWeek,
        completionRateToday,
      },

      streak: {
        current: {
          isActive: isStreakActive ?? false,
          count: streak?.count ?? 0,
          lastCompletedDate: streak?.lastCompleted?.toISOString(),
          daysSinceLastCompletion: isStreakActive
            ? undefined
            : daysSinceLastCompletion,
        },
        longest: {
          count: streak?.longest ?? 0,
        },
        health: {
          averageCompletedPerStreakDay:
            streak && streak.count > 0
              ? completedThisWeek / streak.count
              : 0,
          activeDaysLast30: activeDaysLast30.length,
          percentageActiveLast30,
        },
      },

      statusBreakdown: {
        counts: statusCounts,
        trendInsight:
          completedThisWeek >= createdThisWeek
            ? "More tasks are getting completed than created."
            : "Task creation is outpacing completion.",
      },

      priorityInsights: {
        counts: priorityBase,
        completionRate: {
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0,
          NONE: 0,
        },
        overdue: {
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0,
          NONE: 0,
        },
      },

      timePatterns: {
        mostProductiveDay: null,
        leastProductiveDay: null,
        averageCompletedPerDay:
          Math.round((completedThisWeek / 7) * 10) / 10,
        zeroActivityDaysLast30: 30 - activeDaysLast30.length,
      },

      recurringAndChecklist: {
        recurring: {
          total: 0,
          completedOnTime: 0,
          overdueOrSkipped: 0,
        },
        checklist: {
          todosWithChecklist: 0,
          todosWithoutChecklist: 0,
          averageItemsPerTodo: 0,
          completionRate: 0,
        },
      },

      insights: insights,
    };
  }
);