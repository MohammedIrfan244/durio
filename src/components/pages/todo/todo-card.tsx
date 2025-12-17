"use client";

import { IGetTodoList, ITodoStatusChangeable } from "@/types/todo";
import { formatDate } from "@/lib/helper/date-formatter";
import { changeTodoStatus } from "@/server/to-do-action";
import { ChangeTodoStatusInput } from "@/schema/todo";
import { useTransition } from "react";
import { priorityColor, statusColor } from "@/lib/brand";
import { withClientAction } from "@/lib/helper/with-client-action";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  AlertTriangle,
  Flame,
  MinusCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatName } from "@/lib/helper/name-formatter";

interface TodoCardProps {
  todo: IGetTodoList;
  onOpenDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  fetchTodos: () => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

/* ---------------- ICON MAPS ---------------- */

const statusIconMap = {
  DONE: CheckCircle2,
  PENDING: Clock,
  CANCELLED: XCircle,
  PLAN: MinusCircle,
  OVERDUE: AlertTriangle,
  ARCHIVED: MinusCircle,
} as const;

const priorityIconMap = {
  HIGH: Flame,
  MEDIUM: AlertTriangle,
  LOW: MinusCircle,
} as const;

/* ---------------- COMPONENT ---------------- */

export default function TodoCard({
  todo,
  onOpenDetail,
  onEdit,
  onDelete,
  fetchTodos,
  selected,
  onToggleSelect,
}: TodoCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: ITodoStatusChangeable) => {
    startTransition(async () => {
      const payload: ChangeTodoStatusInput = { id: todo.id, status };
      await withClientAction(() => changeTodoStatus(payload), true);
      fetchTodos();
    });
  };

  const StatusIcon = statusIconMap[todo.status];
  const PriorityIcon = todo.priority ? priorityIconMap[todo.priority] : null;

  return (
    <Card
      onClick={() => onOpenDetail(todo.id)}
      className="
        bg-background/60
        group cursor-pointer
        border-none shadow-none
        transition-all duration-300
        hover:shadow-lg hover:z-10
        animate-tilt-once
        pb-2
      "
    >
      <CardContent className="px-3 pt-2 pb-0 space-y-2">

        {/* ---------- TITLE + ACTIONS ---------- */}
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold leading-tight truncate">
            {formatName(todo.title)}
          </h3>

          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant={selected ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-6 w-6 hover:scale-110 transition border",
                selected ? "border-primary bg-primary/10" : "border-transparent"
              )}
              onClick={() => onToggleSelect(todo.id)}
              aria-label={selected ? "Deselect todo" : "Select todo"}
            >
              {selected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:scale-110 transition"
              onClick={() => onEdit(todo.id)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:scale-110 transition"
              onClick={() => onDelete(todo.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ---------- META INFO ---------- */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 font-semibold",
              statusColor[todo.status]
            )}
          >
            <StatusIcon className="h-3 w-3 transition-transform group-hover:rotate-6" />
            {todo.status}
          </Badge>

          {todo.priority && PriorityIcon && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 font-semibold",
                priorityColor[todo.priority]
              )}
            >
              <PriorityIcon className="h-3 w-3 transition-transform group-hover:-rotate-6" />
              {todo.priority}
            </Badge>
          )}

          {todo.dueDate && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(new Date(todo.dueDate))}
            </span>
          )}
        </div>

        <Separator />

        {/* ---------- STATUS ACTIONS ---------- */}
        <div
          className="flex flex-wrap gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {todo.status !== "DONE" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => handleStatusChange("DONE")}
              className="h-7 gap-1 text-xs hover:scale-105 transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
          )}

          {todo.status !== "PENDING" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => handleStatusChange("PENDING")}
              className="h-7 gap-1 text-xs hover:scale-105 transition"
            >
              <Clock className="h-3.5 w-3.5" />
              Pending
            </Button>
          )}

          {todo.status !== "CANCELLED" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => handleStatusChange("CANCELLED")}
              className="h-7 gap-1 text-xs hover:scale-105 transition"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
