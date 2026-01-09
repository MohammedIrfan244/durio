import React from "react";
import { CheckCircle2, Layers, Clock, PlayCircle, CheckCheck, XCircle, AlertTriangle } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TodoFilterInput } from "@/schema/todo";
import { statusColor } from "@/lib/brand";

interface FilterComponentProps {
  filters: TodoFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilterInput>>;
}

export const StatusFilter: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => (
  <div className="flex flex-col gap-2 nav-item-group w-full">
    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-300">
      <CheckCircle2 className="h-3 w-3 animate-check" />
      How's it going?
    </Label>
    <Select 
      value={filters.status ?? "ALL"}
      onValueChange={(value: string) =>
        setFilters((prev) => ({
          ...prev,
          status:
            value === "ALL" ? undefined : (value as TodoFilterInput["status"]),
        }))
      }
    >
      <SelectTrigger fullWidth className="bg-background/60 backdrop-blur-sm border-border/40 transition-all duration-300 hover:border-primary/50 focus:bg-background/80 focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder="See everything there" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL" className="whitespace-nowrap px-2">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground hidden md:block" />
            See everything
          </span>
        </SelectItem>
        <SelectItem value="PLAN" className="whitespace-nowrap px-2">
          <span className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${statusColor.PLAN}`} />
            What's coming
          </span>
        </SelectItem>
        <SelectItem value="PENDING" className="whitespace-nowrap px-2">
          <span className="flex items-center gap-2">
            <PlayCircle className={`h-4 w-4 ${statusColor.PENDING}`} />
            In progress
          </span>
        </SelectItem>
        <SelectItem value="DONE" className="whitespace-nowrap px-2">
          <span className="flex items-center gap-2">
            <CheckCheck className={`h-4 w-4 ${statusColor.DONE}`} />
            The wins
          </span>
        </SelectItem>
        <SelectItem value="CANCELLED" className="whitespace-nowrap px-2">
          <span className="flex items-center gap-2">
            <XCircle className={`h-4 w-4 ${statusColor.CANCELLED}`} />
            Dropped tasks
          </span>
        </SelectItem>
        <SelectItem value="OVERDUE" className="whitespace-nowrap px-2">
          <span className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${statusColor.OVERDUE}`} />
            Running late
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
);
