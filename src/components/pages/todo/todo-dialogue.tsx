"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm, UseFormReturn, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { createTodoSchema } from "@/schema/todo";
import type { CreateTodoInput, UpdateTodoInput } from "@/schema/todo";
import { IPriority, IRenewInterval } from "@/types/todo";
import { createTodo, updateTodo, getTodoById } from "@/server/to-do-action";
import { toast } from "sonner";
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Clock,
  Flag,
  Tag,
  FileText,
  Repeat,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/helper/date-formatter";
import { withClientAction } from "@/lib/helper/with-client-action";
import { today } from "@/lib/helper/today";

type Props = {
  todoId?: string;
  trigger?: React.ReactNode;
  onSaved?: (todo?: unknown) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type TodoFormContext = UseFormReturn<CreateTodoInput>;

// Title and Description
const TitleAndDescriptionSection: React.FC<{ form: TodoFormContext }> = ({
  form,
}) => {
  const { register, formState: { errors } } = form;
  return (
    <>
      {/* Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="w-3.5 h-3.5" />
          What do you need to do?
        </Label>
        <Input
          {...register("title")}
          placeholder="e.g., grab some coffee beans"
          className="text-sm h-10"
        />
        {errors.title && (
          <p className="text-destructive text-xs">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-3.5 h-3.5" />
          Any extra details?
        </Label>
        <Textarea
          {...register("description")}
          placeholder="Add notes, links, whatever helps..."
          className="min-h-[80px] resize-y text-sm"
        />
        {errors.description && (
          <p className="text-destructive text-xs">
            {errors.description.message}
          </p>
        )}
      </div>
    </>
  );
};

// Priority, Renew, and Tags Input
const MetadataRow: React.FC<{ form: TodoFormContext }> = ({ form }) => {
  const { watch, setValue } = form;
  const tags = watch("tags") || [];

  // Handle adding new tags
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (!value) return;
      // Prevent duplicates before adding
      if (!tags.includes(value)) {
        setValue("tags", [...tags, value], { shouldValidate: true });
      }
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Priority */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Flag className="w-3.5 h-3.5" />
          How urgent is it?
        </Label>
        <Select
          value={watch("priority") || ""}
          onValueChange={(v: string) => setValue("priority", v as IPriority, { shouldValidate: true })}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW" className="text-sm">Chill – whenever</SelectItem>
            <SelectItem value="MEDIUM" className="text-sm">Normal</SelectItem>
            <SelectItem value="HIGH" className="text-sm">Pretty urgent!</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RENEW INTERVAL */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Repeat className="w-3.5 h-3.5" />
          Does this repeat?
        </Label>
        <Select
          value={watch("renewInterval") || ""}
          onValueChange={(v: string) => setValue("renewInterval", v as IRenewInterval, { shouldValidate: true })}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Nope, just once" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY" className="text-sm">Every day</SelectItem>
            <SelectItem value="WEEKLY" className="text-sm">Every week</SelectItem>
            <SelectItem value="MONTHLY" className="text-sm">Every month</SelectItem>
            <SelectItem value="YEARLY" className="text-sm">Every year</SelectItem>
            <SelectItem value="CUSTOM" className="text-sm">Custom schedule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="w-3.5 h-3.5" />
          Tags (optional)
        </Label>
        <Input
          placeholder="Type and hit Enter"
          onKeyDown={addTag}
          className="h-10 text-sm"
        />
      </div>
    </div>
  );
};

// Tags Display
const TagsDisplay: React.FC<{ form: TodoFormContext }> = ({ form }) => {
  const tags = form.watch("tags") || [];
  if (tags.length === 0) return null;

  // Handle tag removal (currently not requested, but good practice)
  const removeTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  return (
    <div className="flex flex-wrap gap-2 -mt-2">
      {tags.map((t, i) => (
        <span
          key={i}
          className="px-2.5 py-1 bg-muted text-muted-foreground text-xs flex items-center gap-1.5 cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => removeTag(t)} // Allow removal by clicking
        >
          <Tag className="w-3 h-3" />
          {t}
          <X className="w-3 h-3 text-muted-foreground/70" />
        </span>
      ))}
    </div>
  );
};

// Date and Time Pickers
const DateTimeSection: React.FC<{ form: TodoFormContext }> = ({ form }) => {
  const { watch, setValue } = form;
  const dueDateValue = watch("dueDate");

  // Clear time if date is cleared
  useEffect(() => {
    if (!dueDateValue) {
      setValue("dueTime", undefined);
    }
  }, [dueDateValue, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-5">
      {/* DATE SELECTOR */}
      <div className="space-y-2 md:col-span-2 min-w-0">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <CalendarIcon className="w-3.5 h-3.5" />
          When's it due?
        </Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left h-10 text-sm"
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-2" />
              {dueDateValue
                ? formatDate(dueDateValue, 15)
                : "Pick a date"}
            </Button>
          </PopoverTrigger>

          <PopoverContent matchTriggerWidth={false} className="p-0">
            <div className="flex flex-col">
              <Calendar
                mode="single"
                disabled={{ before: today() }}
                selected={dueDateValue as Date | undefined}
                onSelect={(date: Date | undefined) =>
                  setValue("dueDate", date, { shouldValidate: true })
                }
              />

              {/* CLEAR DATE BUTTON */}
              {dueDateValue && (
                <Button
                  variant="ghost"
                  type="button"
                  className="text-sm w-full border-t rounded-none"
                  onClick={() => {
                    setValue("dueDate", undefined);
                    setValue("dueTime", undefined);
                  }}
                >
                  Clear Date
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* TIME SELECTORS */}
      <div className="space-y-2 md:col-span-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          What time?
        </Label>

        <div className="grid grid-cols-3 gap-2">
          {/* Hour */}
          <TimeSelect
            form={form}
            unit="hour"
            disabled={!dueDateValue}
            options={[...Array(12).keys()].map((h) => (h + 1).toString().padStart(2, "0"))}
            placeholder="Hour"
          />

          {/* Minute */}
          <TimeSelect
            form={form}
            unit="minute"
            disabled={!dueDateValue}
            options={["00", "15", "30", "45"]}
            placeholder="Min"
          />

          {/* AM / PM */}
          <TimeSelect
            form={form}
            unit="ampm"
            disabled={!dueDateValue}
            options={["AM", "PM"]}
            placeholder="AM/PM"
          />
        </div>
      </div>
    </div>
  );
};

// Helper component for time selects (to reduce duplication)
const TimeSelect: React.FC<{
  form: TodoFormContext;
  unit: "hour" | "minute" | "ampm";
  disabled: boolean;
  options: string[];
  placeholder: string;
}> = ({ form, unit, disabled, options, placeholder }) => {
  const { watch, setValue } = form;
  const currentDueTime = watch("dueTime") || "12:00 AM"; // Default value

  const [hour, minute, ampm] = currentDueTime.split(/[: ]/);

  let currentValue = "";
  if (unit === "hour") currentValue = hour;
  else if (unit === "minute") currentValue = minute;
  else if (unit === "ampm") currentValue = ampm;

  // Function to update the time string
  const updateTime = (v: string) => {
    let newHour = hour;
    let newMinute = minute;
    let newAmpm = ampm;

    if (unit === "hour") newHour = v;
    else if (unit === "minute") newMinute = v;
    else if (unit === "ampm") newAmpm = v;

    const newTime = `${newHour || "12"}:${newMinute || "00"} ${newAmpm || "AM"}`;
    setValue("dueTime", newTime, { shouldValidate: true });
  };

  return (
    <Select value={currentValue} onValueChange={updateTime}>
      <SelectTrigger className="h-10 text-sm" disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-sm">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};


// Checklist Management
const ChecklistSection: React.FC<{ form: TodoFormContext }> = ({ form }) => {
  const { control, register, watch, setValue, formState: { errors } } = form;
  const checklist = watch("checklist") || [];

  const addChecklistItem = useCallback(() => {
    setValue("checklist", [...checklist, { text: "" }], { shouldValidate: true });
  }, [checklist, setValue]);

  const removeChecklistItem = useCallback((index: number) => {
    setValue("checklist", checklist.filter((_, i) => i !== index), { shouldValidate: true });
  }, [checklist, setValue]);

  return (
    <div className="space-y-3 pt-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <CheckSquare className="w-3.5 h-3.5" />
        Break it down into steps?
      </Label>

      <div className="space-y-2">
        {checklist.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <Controller
                name={`checklist.${i}.text` as const}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={`Step ${i + 1}`}
                    className="flex-1 h-9 text-sm"
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChecklistItem(i)}
                className="h-9 w-9 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {errors.checklist?.[i]?.text && (
              <p className="text-destructive text-xs">
                {errors.checklist[i].text.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={addChecklistItem}
        className="w-full h-9 text-sm"
      >
        <Plus className="w-3.5 h-3.5 mr-2" />
        Add step
      </Button>
    </div>
  );
};

// Dialog Footer Buttons
const DialogFooterButtons: React.FC<{
  isPending: boolean;
  setOpen: (open: boolean) => void;
}> = ({ isPending, setOpen }) => (
  <DialogFooter className="gap-2 pt-4">
    <Button
      type="button"
      variant="outline"
      onClick={() => setOpen(false)}
      className="h-10 px-6 text-sm"
    >
      Nevermind
    </Button>

    <Button
      type="submit"
      disabled={isPending}
      className="h-10 px-6 text-sm"
    >
      {isPending ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </span>
      ) : (
        "Let's do it!"
      )}
    </Button>
  </DialogFooter>
);

export default function ToDoDialog({
  todoId,
  trigger,
  onSaved,
  open: externalOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: "",
      description: undefined,
      priority: undefined,
      tags: [],
      dueDate: undefined,
      dueTime: undefined,
      renewInterval: undefined,
      renewEvery: undefined,
      renewCustom: undefined,
      checklist: [],
      status: undefined,
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open || !todoId) return;

    const loadTodoData = async () => {
      setIsLoading(true);
      try {
        const todo = await withClientAction(
          () => getTodoById({ id: todoId }),
          false
        );

        if (!todo) {
          toast.error("Failed to load todo");
          setOpen(false);
          return;
        }

        const values: Partial<CreateTodoInput> = {
          title: todo.title || "",
          description: todo.description || undefined,
          priority: todo.priority || undefined,
          tags: todo.tags || [],
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          dueTime: todo.dueTime || undefined,
          renewInterval: todo.renewInterval || undefined,
          renewEvery: todo.renewEvery || undefined,
          renewCustom: todo.renewCustom || undefined,
          checklist:
            todo.checklist?.map((item: { text: string }) => ({
              text: item.text,
            })) || [],
          status: todo.status || undefined,
        };

        reset(values as CreateTodoInput);
      } catch (error) {
        toast.error("Failed to load todo");
        setOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodoData();
  }, [open, todoId, reset, setOpen]);

  const submitForm = (data: CreateTodoInput) => {
    startTransition(async () => {
      let res;
      if (todoId) {
        // Update operation
        const payload: UpdateTodoInput = {
          id: todoId,
          ...data,
          checklist: data.checklist?.map((item) => ({ text: item.text })),
        };
        res = await withClientAction(() => updateTodo(payload), true);
        toast.success("Nice! Todo updated 🎉");
      } else {
        // Create operation
        res = await withClientAction(() => createTodo(data), true);
        toast.success("Nice! Todo added 🎉");
        reset(); 
      }

      onSaved?.(res);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog Trigger */}
      {!todoId && (
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button className="transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 group">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-1000 ease-out" />{" "}
              New Todo
            </Button>
          )}
        </DialogTrigger>
      )}

      {/* Dialog Content */}
      <DialogContent className="text-foreground max-h-[90vh] overflow-y-auto overflow-x-hidden max-w-4xl hide-scrollbar-on-main">
        {/* Dialog Header */}
        <DialogHeader>
          <DialogTitle className="text-xl">
            {todoId ? "Update your todo" : "What's on your mind?"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {todoId
              ? "Make any changes you need"
              : "Let's get it down and make it happen ✨"}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
            <div className="text-sm text-muted-foreground">Loading todo...</div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
            {/* Title and Description */}
            <TitleAndDescriptionSection form={form} />

            {/* Priority + Renew + Tags Input Row */}
            <MetadataRow form={form} />

            {/* Tags Display */}
            <TagsDisplay form={form} />

            {/* Date + Time Row */}
            <DateTimeSection form={form} />

            {/* Checklist */}
            <ChecklistSection form={form} />

            {/* Footer Buttons */}
            <DialogFooterButtons isPending={isPending} setOpen={setOpen} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}