import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TodoFilterInput } from "@/schema/todo";

interface FilterComponentProps {
  filters: TodoFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilterInput>>;
}

export const SortOrderSelect: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => (
  <div className="flex flex-col gap-2 nav-item-group">
    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-300">
      <ArrowUpDown className="h-3 w-3 animate-hourglass" />
      Direction
    </Label>

    <Select
      value={filters.sortOrder ?? "DESC"}
      onValueChange={(value: string) =>
        setFilters((prev) => ({
          ...prev,
          sortOrder: value as TodoFilterInput["sortOrder"],
        }))
      }
    >
      <SelectTrigger fullWidth className="bg-background/60 backdrop-blur-sm border-border/40 transition-all duration-300 hover:border-primary/50 focus:bg-background/80 focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder="Order" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="ASC">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <ArrowUp className="h-4 w-4 text-green-500" />
            Ascending
          </span>
        </SelectItem>
        <SelectItem value="DESC">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <ArrowDown className="h-4 w-4 text-purple-500" />
            Descending
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
);
