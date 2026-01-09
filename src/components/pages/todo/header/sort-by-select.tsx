import React from "react";
import { Calendar, CalendarPlus, CalendarClock, TrendingUp } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TodoFilterInput } from "@/schema/todo";

interface FilterComponentProps {
  filters: TodoFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilterInput>>;
}

export const SortBySelect: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => (
  <div className="flex flex-col gap-2 nav-item-group">
    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-300">
      <Calendar className="h-3 w-3 animate-calendar" />
      Order by...
    </Label>

    <Select
      value={filters.sortBy ?? "CREATED_AT"}
      onValueChange={(value: string) =>
        setFilters((prev) => ({
          ...prev,
          sortBy: value as TodoFilterInput["sortBy"],
        }))
      }
    >
      <SelectTrigger fullWidth className="bg-background/60 backdrop-blur-sm border-border/40 transition-all duration-300 hover:border-primary/50 focus:bg-background/80 focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="CREATED_AT">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <CalendarPlus className="h-4 w-4 text-blue-500" />
            Created Date
          </span>
        </SelectItem>
        <SelectItem value="DUE_DATE">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <CalendarClock className="h-4 w-4 text-orange-500" />
            Due Soon Tasks
          </span>
        </SelectItem>
        <SelectItem value="PRIORITY">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <TrendingUp className="h-4 w-4 text-red-500" />
            Priority Level
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
);
