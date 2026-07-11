import { z } from "zod";
import { MONGOID } from "./mongo";

// Shared Enums
export const TodoStatusEnum = z.enum(["PLAN", "PENDING", "DONE", "CANCELLED", "OVERDUE", "ARCHIVED"]);
export type TodoStatus = z.infer<typeof TodoStatusEnum>;

export const TodoPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type TodoPriority = z.infer<typeof TodoPriorityEnum>;

export const RenewIntervalEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]);
export type RenewInterval = z.infer<typeof RenewIntervalEnum>;

const shortText = z.string().trim().min(1).max(200);
const optionalLongText = z.string().trim().max(10000);
const tagSchema = z.string().trim().min(1).max(50);

// TODO THINGS

// Schema for creating a new to-do item
export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(10000, "Description cannot exceed 10000 characters")
    .optional(),

  priority: TodoPriorityEnum.optional(),

  tags: z.array(tagSchema).max(10, "You can add up to 10 tags").optional(),

  dueDate: z.union([z.string(), z.date()]).optional(),
  dueTime: z.string().optional(),

  renewStart: z.union([z.string(), z.date()]).optional(),
  renewInterval: RenewIntervalEnum.optional(),
  renewEvery: z.number().optional(),
  renewCustom: z.string().optional(),

  checklist: z
    .array(
      z.object({
        text: z
          .string()
          .trim()
          .min(1, "Checklist item cannot be empty")
          .max(200, "Checklist item too long"),
      })
    )
    .optional(),

  status: TodoStatusEnum.optional(),

  linkedResources: z
    .array(
      z.object({
        id: MONGOID,
        type: z.enum(["TODO", "NOTE", "EVENT", "PROJECT"]),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      })
    )
    .optional(),
});

// Schema for filtering and sorting to-do items
export const todoFilterSchema = z.object({
  status: TodoStatusEnum.optional(),
  priority: TodoPriorityEnum.optional(),
  tags: z.array(tagSchema).max(10).optional(),
  query : z.string().trim().max(100, "Search query too long").optional(),
  sortBy: z
    .enum([
      "CREATED_AT",
      "DUE_DATE",
      "PRIORITY",
    ]).optional(),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Schema for getting a specific to-do item by ID
export const getTodoByIdSchema = z.object({
  id: MONGOID,
});

// Schema for updating a to-do item
export const updateTodoSchema = z.object({
  id: MONGOID,
  title: shortText.optional(),
  description: optionalLongText.optional(),
  priority: TodoPriorityEnum.optional(),
  tags: z.array(tagSchema).max(10, "You can add up to 10 tags").optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
  dueTime: z.string().optional(),
  renewStart: z.union([z.string(), z.date()]).optional(),
  renewInterval: RenewIntervalEnum.optional(),
  renewEvery: z.number().optional(),
  renewCustom: z.string().optional(),
  checklist: z
    .array(
      z.object({
        id: MONGOID.optional(),
        text: z
          .string()
          .trim()
          .min(1, "Checklist item cannot be empty")
          .max(200, "Checklist item too long"),
      })
    ).optional(),
  status: TodoStatusEnum.optional(),
});

// Schema for deleting a to-do item
export const deleteTodoSchema = z.object({
    id: MONGOID,
  })

  // Schema for bulk deleting to-do items
export const bulkDeleteTodoSchema = z.object({ 
  ids: z.array(MONGOID).min(1, "At least one ID must be provided"),
});

// Schema for changing the status of a to-do item
export const changeTodoStatusSchema = z.object({
  id: MONGOID,
  status: z.enum(["PLAN", "PENDING", "DONE", "CANCELLED"]),
});

// Schema for bulk changing the status of to-do items
export const bulkChangeTodoStatusSchema = z.object({
  ids: z.array(MONGOID).min(1, "At least one ID must be provided"),
  status: TodoStatusEnum,
});

// Schema for marking/unmarking a checklist item
export const markChecklistItemSchema = z.object({
  todoId: MONGOID,
  checklistItemId: MONGOID,
});

// Schema for restore from archive
export const restoreTodoFromArchiveSchema = z.object({
  id: MONGOID,
});

export const searchArchiveTodosSchema = z.object({
  query: z.string().trim().max(100, "Search query too long").optional(),
})

// type aliases for inferred types
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type TodoFilterInput = z.infer<typeof todoFilterSchema>;
export type GetTodoByIdInput = z.infer<typeof getTodoByIdSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type DeleteTodoInput = z.infer<typeof deleteTodoSchema>;
export type BulkDeleteTodoInput = z.infer<typeof bulkDeleteTodoSchema>;
export type ChangeTodoStatusInput = z.infer<typeof changeTodoStatusSchema>;
export type BulkChangeTodoStatusInput = z.infer<typeof bulkChangeTodoStatusSchema>;
export type MarkChecklistItemInput = z.infer<typeof markChecklistItemSchema>;
export type RestoreTodoFromArchiveInput = z.infer<typeof restoreTodoFromArchiveSchema>;
export type SearchArchiveTodosInput = z.infer<typeof searchArchiveTodosSchema>;
