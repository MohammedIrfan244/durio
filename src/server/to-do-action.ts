"use server";
import { withErrorWrapper, AppError } from "@/lib/server-utils/error-wrapper";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server-utils/get-user";
import { ITodo , IGetTodoListPayload, ITodoStatus , IGetTodoTagsPayload , prioritySortValues, IPriority, IGetTodoList } from "@/types/todo";
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
  RestoreTodoFromArchiveInput
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

// Action to hard delete a to-do item (permanent deletion)  pending
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

// Action to bulk delete to-do items (permanent deletion) pending
export const bulkDeleteTodos = withErrorWrapper<void, [BulkDeleteTodoInput]>(async (input: BulkDeleteTodoInput): Promise<void> => {
  const validatedInput = bulkDeleteTodoSchema.parse(input);
  const userId = await getUserId();

  // Verify all todos belong to user
  const todos = await prisma.todo.findMany({
    where: { id: { in: validatedInput.ids }, userId },
  });

  if (todos.length !== validatedInput.ids.length) {
    const error = new Error("Some todos not found or don't belong to you") as AppError;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  // Delete checklist items
  await prisma.checklistItem.deleteMany({
    where: { todoId: { in: validatedInput.ids } },
  });

  // Delete todos
  await prisma.todo.deleteMany({
    where: { id: { in: validatedInput.ids } },
  });
});

// Action to bulk soft delete to-do items (archive) done
export const bulkSoftDeleteTodos = withErrorWrapper<ITodo[], [BulkDeleteTodoInput]>(async (input: BulkDeleteTodoInput): Promise<ITodo[]> => {
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

  const updatedTodos = await Promise.all(
    validatedInput.ids.map(id =>
      prisma.todo.update({
        where: { id },
        data: { status: "ARCHIVED" },
        include: { checklist: true },
      })
    )
  );

  return updatedTodos as ITodo[];
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

// Action to bulk change status pending
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

// Action to get all archived todos pending
export const getArchivedTodos = withErrorWrapper<IGetTodoListPayload,[]>(async (): Promise<IGetTodoListPayload> => {
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
      status: true,
      priority: true,
      dueDate: true,
    },
  });

  const grouped: IGetTodoListPayload = {
    plan: [],
    pending: [],
    done: [],
  };
  for (const todo of todos) {
    grouped.done.push(todo);
  }

  return grouped;
});

// Action to restore a todo from archive pending
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

// Action to get restore all archived todos pending
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