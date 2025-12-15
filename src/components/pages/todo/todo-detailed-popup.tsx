"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { withClientAction } from "@/lib/helper/with-client-action";
import {
  getTodoById,
  markChecklistItem,
  changeTodoStatus,
} from "@/server/to-do-action";
import type { ITodo, ITodoStatusChangeable } from "@/types/todo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  CheckCheck,
  XCircle,
  Loader2,
  Calendar,
  Tag,
  FileText,
  Repeat,
  Flame,
  AlertCircle,
  Leaf,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import { statusColor, priorityColor } from "@/lib/color";
import { formatDate } from "@/lib/helper/date-formatter";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatName } from "@/lib/helper/name-formatter";

// --- TYPES ---
interface TodoDetailedProps {
  todoId: string;
  isOpen?: boolean;
  setOpen?: (open: boolean) => void;
  onUpdate?: () => void;
}

interface CommonProps {
  todo: ITodo;
  onUpdate?: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PLAN": return <Clock className="h-4 w-4" />;
    case "PENDING": return <PlayCircle className="h-4 w-4" />;
    case "DONE": return <CheckCheck className="h-4 w-4" />;
    case "CANCELLED": return <XCircle className="h-4 w-4" />;
    case "OVERDUE": return <AlertTriangle className="h-4 w-4" />;
    case "ARCHIVED": return <Layers className="h-4 w-4" />;
    default: return null;
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "HIGH": return <Flame className="h-4 w-4" />;
    case "MEDIUM": return <AlertCircle className="h-4 w-4" />;
    case "LOW": return <Leaf className="h-4 w-4" />;
    default: return <Layers className="h-4 w-4" />;
  }
};



const statusOptions = [
  { value: "PLAN", label: "Planning", icon: Clock, color: statusColor.PLAN },
  { value: "PENDING", label: "In Progress", icon: PlayCircle, color: statusColor.PENDING },
  { value: "DONE", label: "Done", icon: CheckCheck, color: statusColor.DONE },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle, color: statusColor.CANCELLED },
];

// --- MODULAR SUB-COMPONENTS ---

// Header Section (Title, Description, and Quick Pills)
const TodoHeaderSection: React.FC<CommonProps> = ({ todo }) => {
  const statusColors = Object.values(statusColor);
  const priorityColors = Object.values(priorityColor);
  const uniqueColorArray = useMemo(() => Array.from(new Set([...statusColors, ...priorityColors])), [statusColors, priorityColors]);

  const getColorForTag = useCallback((tag: string) => {
    const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return uniqueColorArray[hash % uniqueColorArray.length];
  }, [uniqueColorArray]);
  
  return (
    <div className="px-6 pt-6 pb-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="text-2xl font-semibold leading-tight flex-1">
          {formatName(todo.title)}
        </h2>
      </div>

      {todo.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {todo.description}
        </p>
      )}

      {/* Quick Info Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <span className={statusColor[todo.status as keyof typeof statusColor]}>
            {getStatusIcon(todo.status)}
          </span>
          <span className={`text-xs font-medium ${statusColor[todo.status as keyof typeof statusColor]}`}>
            {statusOptions.find(opt => opt.value === todo.status)?.label || todo.status}
          </span>
        </Badge>

        {todo.priority && (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <div className={`flex items-center gap-1 ${priorityColor[todo.priority as keyof typeof priorityColor]}`}>
              {getPriorityIcon(todo.priority)}
              <span className="text-xs font-medium capitalize">
                {todo.priority.toLowerCase()}
              </span>
            </div>
          </Badge>
        )}

        {todo.dueDate && (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">
              Due {formatDate(todo.dueDate)}
            </span>
          </Badge>
        )}
        
        {/* Render tags as quick pills if only a few exist */}
        {todo.tags?.slice(0, 3).map((tag, idx) => (
            <Badge
                key={idx}
                variant="secondary"
                className={`px-2.5 py-1 text-xs font-normal ${getColorForTag(tag)}`}
            >
                {tag}
            </Badge>
        ))}

      </div>
    </div>
  );
};

// Status Update Select Dropdown
const StatusUpdateSection: React.FC<CommonProps & {
  handleStatusChange: (status: ITodoStatusChangeable) => Promise<void>;
  updatingStatus: boolean;
}> = ({ todo, handleStatusChange, updatingStatus }) => {
  const currentStatusOption = statusOptions.find(opt => opt.value === todo.status);
  const isDisabled = updatingStatus || todo.status === "OVERDUE" || todo.status === "ARCHIVED";

  return (
    <div className="space-y-2 p-6 lg:px-8 pb-0">
      <label className="text-sm font-medium flex items-center gap-2">
        <div className={statusColor[todo.status as keyof typeof statusColor]}>
          {getStatusIcon(todo.status)}
        </div>
        What's happening with this?
      </label>
      <Select
        value={todo.status}
        onValueChange={(value) =>
          handleStatusChange(value as ITodoStatusChangeable)
        }
        disabled={isDisabled}
      >
        <SelectTrigger className="w-full h-10 bg-muted/50 border-0 hover:bg-muted">
          <SelectValue>
            {updatingStatus ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {currentStatusOption && (
                  <>
                    <currentStatusOption.icon className={`h-4 w-4 ${currentStatusOption.color}`} />
                    <span className="font-medium">{currentStatusOption.label}</span>
                  </>
                )}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <option.icon className={`h-4 w-4 ${option.color}`} />
                <span>{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Column for Due Date, Time, Recurrence, and Completion
const DetailsColumn: React.FC<CommonProps> = ({ todo }) => (
  <div className="space-y-5">
    {/* When's it due? */}
    {(todo.dueDate || todo.dueTime) && (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          When's this due?
        </label>
        <div className="space-y-2">
          {todo.dueDate && (
            <Card className="p-0 border-none overflow-hidden">
              <CardContent className="h-10 bg-muted/50 px-3 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(todo.dueDate)}</span>
              </CardContent>
            </Card>
          )}
          {todo.dueTime && (
            <Card className="p-0 border-none overflow-hidden">
              <CardContent className="h-10 bg-muted/50 px-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{todo.dueTime}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )}

    {/* Does it repeat? */}
    {todo.renewInterval && (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          Does this repeat?
        </label>
        <div className="space-y-2">
          <Card className="p-0 border-none overflow-hidden">
            <CardContent className="h-10 bg-muted/50 px-3 flex items-center gap-2 text-sm">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">
                {todo.renewInterval.toLowerCase()}
              </span>
            </CardContent>
          </Card>
          {todo.renewInterval === "CUSTOM" && todo.renewCustom && (
            <Card className="p-0 border-none overflow-hidden">
              <CardContent className="h-10 bg-muted/50 px-3 flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Custom pattern:
                </span>
                <span>{todo.renewCustom}</span>
              </CardContent>
            </Card>
          )}
          {todo.renewEvery && (
            <Card className="p-0 border-none overflow-hidden">
              <CardContent className="h-10 bg-muted/50 px-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Every</span>
                <span>{todo.renewEvery}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )}

    {/* When was it completed? */}
    {todo.completedAt && (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Finished on
        </label>
        <Card className="p-0 border-none overflow-hidden">
          <CardContent className="h-10 bg-muted/50 px-3 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(todo.completedAt)}</span>
          </CardContent>
        </Card>
      </div>
    )}
  </div>
);

// Column for Subtasks Checklist
const ChecklistColumn: React.FC<CommonProps & {
  handleChecklistToggle: (id: string) => Promise<void>;
  updatingChecklistId: string | null;
}> = ({ todo, handleChecklistToggle, updatingChecklistId }) => {
  if (!todo.checklist || todo.checklist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
        <CheckSquare className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No subtasks yet
        </p>
      </div>
    );
  }

  const doneCount = todo.checklist.filter((i) => i.marked).length;
  const totalCount = todo.checklist.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          Subtasks
        </label>
        <span className="text-xs text-muted-foreground">
          {doneCount} of{" "}
          {totalCount} done
        </span>
      </div>
      <div className="space-y-1">
        {todo.checklist.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start h-auto py-2.5 px-3 text-sm font-normal hover:bg-muted/50"
            onClick={() => handleChecklistToggle(item.id)}
            disabled={updatingChecklistId === item.id}
          >
            <div className="flex items-center gap-2.5 w-full">
              {updatingChecklistId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
              ) : item.marked ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={`text-left flex-1 ${
                  item.marked ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.text}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

// Tags Display Section
const TagsSection: React.FC<CommonProps> = ({ todo }) => {
  if (!todo.tags || todo.tags.length === 0) return null;

  const statusColors = Object.values(statusColor);
  const priorityColors = Object.values(priorityColor);
  const uniqueColorArray = useMemo(() => Array.from(new Set([...statusColors, ...priorityColors])), [statusColors, priorityColors]);

  const getColorForTag = useCallback((tag: string) => {
    const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return uniqueColorArray[hash % uniqueColorArray.length];
  }, [uniqueColorArray]);

  return (
    <div className="space-y-2 p-6 lg:px-8 pt-0">
      <label className="text-sm font-medium flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        Tagged as
      </label>
      <Card className="p-0 overflow-hidden border-none">
        <CardContent className="flex flex-wrap gap-1.5 bg-muted/50 p-2">
          {todo.tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className={`px-2.5 py-0.5 text-xs font-normal ${getColorForTag(tag)}`}
            >
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Footer Timestamps
const FooterTimestamps: React.FC<CommonProps> = ({ todo }) => (
  <div className="px-8 py-3 border-t bg-muted/20">
    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-1 sm:gap-0">
      <span className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        Created {formatDate(todo.createdAt)} at{" "}
        {new Date(todo.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
      <span className="hidden sm:block">•</span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        Updated {formatDate(todo.updatedAt)} at{" "}
        {new Date(todo.updatedAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  </div>
);

// Data Fetching and State Wrapper
const DataFetchingWrapper: React.FC<TodoDetailedProps> = ({ todoId, onUpdate }) => {
  const [todo, setTodo] = useState<ITodo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingChecklistId, setUpdatingChecklistId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch Todo data
  const fetchTodo = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await withClientAction(() => getTodoById({ id: todoId }));
    if (!data) {
      setError("Could not load Todo");
    } else {
      setTodo(data);
    }
    setLoading(false);
  }, [todoId]);

  // Handle Checklist Toggle
  const handleChecklistToggle = async (checklistItemId: string) => {
    if (!todo) return;
    setUpdatingChecklistId(checklistItemId);
    try {
      const updatedTodo = await withClientAction(
        () => markChecklistItem({ todoId: todo.id, checklistItemId }),
        true
      );
      if (updatedTodo) {
        setTodo(updatedTodo);
        toast.success("Subtask updated!");
        onUpdate?.();
      }
    } catch (err) {
      toast.error("Couldn't update that");
    } finally {
      setUpdatingChecklistId(null);
    }
  };

  // Handle Status Change
  const handleStatusChange = async (newStatus: ITodoStatusChangeable) => {
    if (!todo) return;
    setUpdatingStatus(true);
    try {
      const updatedTodo = await withClientAction(
        () => changeTodoStatus({ id: todo.id, status: newStatus }),
        true
      );
      if (updatedTodo) {
        setTodo(updatedTodo);
        toast.success("Status updated!");
        onUpdate?.();
      }
    } catch (err) {
      toast.error("Couldn't update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!todoId) return;
    fetchTodo();
  }, [todoId, fetchTodo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error || "Couldn't find that task"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Todo Header Section */}
      <TodoHeaderSection todo={todo} />

      <Separator />

      <div className="flex-1 overflow-y-auto">
        {/* Status Update Section */}
        <StatusUpdateSection 
          todo={todo} 
          handleStatusChange={handleStatusChange} 
          updatingStatus={updatingStatus} 
        />
        
        <div className="grid lg:grid-cols-2 gap-8 p-6 lg:px-8">
          {/* Details Column */}
          <DetailsColumn todo={todo} />

          {/* Checklist Column */}
          <ChecklistColumn
            todo={todo}
            handleChecklistToggle={handleChecklistToggle}
            updatingChecklistId={updatingChecklistId}
          />
        </div>

        {/* Tags Section */}
        <TagsSection todo={todo} />
      </div>

      {/* Footer Timestamps */}
      <FooterTimestamps todo={todo} />
    </>
  );
};

// --- MAIN COMPONENT ---
export default function TodoDetailedPopup({
  todoId,
  isOpen = true,
  setOpen,
  onUpdate,
}: TodoDetailedProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 px-2">
        <DialogTitle className="sr-only">Todo Details</DialogTitle>
        <DataFetchingWrapper todoId={todoId} onUpdate={onUpdate} />
      </DialogContent>
    </Dialog>
  );
}