import React from "react";
import { Sparkles, Layers, Leaf, AlertCircle, Flame } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TodoFilterInput } from "@/schema/todo";
import { priorityColor } from "@/lib/brand";

interface FilterComponentProps {
  filters: TodoFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilterInput>>;
}

export const PriorityFilter: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => (
  <div className="flex flex-col gap-2 nav-item-group">
    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-300">
      <Sparkles className="h-3 w-3 animate-zap" />
      Need to panic?
    </Label>
    <Select
      value={filters.priority ?? "ALL"}
      onValueChange={(value: string) =>
        setFilters((prev) => ({
          ...prev,
          priority:
            value === "ALL"
              ? undefined
              : (value as TodoFilterInput["priority"]),
        }))
      }
    >
      <SelectTrigger fullWidth className="bg-background/60 backdrop-blur-sm border-border/40 transition-all duration-300 hover:border-primary/50 focus:bg-background/80 focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder="Anything goes" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="ALL">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Layers className="h-4 w-4 text-muted-foreground hidden md:block" />
            Anything goes here
          </span>
        </SelectItem>
        <SelectItem value="LOW">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Leaf className={`h-4 w-4 ${priorityColor.LOW}`} />
            Chill and Do
          </span>
        </SelectItem>
        <SelectItem value="MEDIUM">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <AlertCircle className={`h-4 w-4 ${priorityColor.MEDIUM}`} />
            Meh, Maybe
          </span>
        </SelectItem>
        <SelectItem value="HIGH">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Flame className={`h-4 w-4 ${priorityColor.HIGH}`} />
            Oops, Urgent!
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
);
