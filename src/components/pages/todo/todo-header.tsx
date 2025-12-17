"use client";

import React, { useEffect } from "react";
// Lucide Icons
import {
  Search,
  Filter,
  Tag,
  Calendar,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  Flame,
  AlertCircle,
  Leaf,
  Clock,
  PlayCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Layers,
  CalendarPlus,
  CalendarClock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Eye,
  Archive
} from "lucide-react";

// Shadcn UI Components
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { TodoFilterInput } from "@/schema/todo";
import { getTodoTags } from "@/server/to-do-action";
import { IGetTodoTagsPayload } from "@/types/todo";
import { withClientAction } from "@/lib/helper/with-client-action";
import { priorityColor, statusColor } from "@/lib/color";
import ToDoDialog from "./todo-dialogue";
import TodoArchive from "./todo-archive";


interface TodoHeaderProps {
  filters: TodoFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilterInput>>;
  search: string;
  setSearch: (value: string) => void;
  applyFilters: () => void;
  todayMode: boolean;
  setTodayMode: (value: boolean) => void;
  load: (override?: TodoFilterInput) => Promise<void>;
}

type FilterComponentProps = Pick<TodoHeaderProps, "filters" | "setFilters">;

// Modular Sub-Components

// --- Status Filter ---
const StatusFilter: React.FC<FilterComponentProps> = ({
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
      <SelectTrigger fullWidth className="bg-background border-border/60 transition-all duration-300 hover:border-primary/30">
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

// --- Priority Filter ---
const PriorityFilter: React.FC<FilterComponentProps> = ({
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
      <SelectTrigger fullWidth className="bg-background border-border/60 transition-all duration-300 hover:border-primary/30">
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

// --- Tags Multiselect Filter ---
const TagsMultiselect: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => {
  const [availableTags, setAvailableTags] = React.useState<
    IGetTodoTagsPayload[]
  >([]);
  const [openTags, setOpenTags] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>(
    filters.tags ?? []
  );

  // Load tags on mount
  useEffect(() => {
    const loadTags = async () => {
      const response = await withClientAction<IGetTodoTagsPayload[]>(() =>
        getTodoTags()
      );
      if (response) setAvailableTags(response);
    };
    loadTags();
  }, []);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      tags: selectedTags.length ? selectedTags : undefined,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);

  return (
    <div className="flex flex-col gap-2 nav-item-group lg:col-span-2">
      <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-300">
        <Tag className="h-3 w-3 animate-dumbbell" />
        Got any topics?
      </Label>

      <Popover open={openTags} onOpenChange={setOpenTags}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start font-medium border-border/60 transition-all duration-300 hover:border-primary/30"
          >
            {selectedTags.length ? (
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {selectedTags.length}
                </span>
                <span className="text-foreground/80">
                  {selectedTags.length === 1 ? "tag selected" : "tags selected"}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Pick some tags...</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>No tags found.</CommandEmpty>

            <CommandGroup>
              {availableTags.map((tag) => (
                <CommandItem
                  key={tag.tag}
                  onSelect={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.tag)
                        ? prev.filter((x) => x !== tag.tag)
                        : [...prev, tag.tag]
                    );
                  }}
                >
                  <CheckCircle2
                    className={`mr-2 h-4 w-4 transition-all duration-200 ${
                      selectedTags.includes(tag.tag)
                        ? "text-primary fill-primary/20"
                        : "text-muted-foreground/50"
                    }`}
                  />
                  {tag.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// --- Sort By Select ---
const SortBySelect: React.FC<FilterComponentProps> = ({
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
      <SelectTrigger fullWidth className="bg-background border-border/60 transition-all duration-300 hover:border-primary/30">
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

// --- Sort Order Select ---
const SortOrderSelect: React.FC<FilterComponentProps> = ({
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
      <SelectTrigger fullWidth className="bg-background border-border/60 transition-all duration-300 hover:border-primary/30">
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

// --- Apply Filters and More Button Group ---
interface ApplyGroupProps {
  applyFilters: () => void;
}

const ApplyFiltersGroup: React.FC<ApplyGroupProps> = ({ applyFilters }) => {
  return (
    <div className="flex flex-col gap-2 w-full col-span-2 sm:col-span-1 xl:col-span-1 self-end">
      {/* Invisible label for alignment */}
      <Label className="text-xs font-semibold text-transparent select-none">
        &nbsp;
      </Label>
      <div className="group">
        <Button
          onClick={applyFilters}
          className="bg-primary text-primary-foreground flex items-center w-full group-hover:flex-row-reverse transition-all duration-300 hover:bg-primary/90 font-semibold"
        >
          <Filter className="h-4 w-4 mr-2 transition-all duration-300 group-hover:ml-2 group-hover:rotate-90 group-hover:mr-0" />
          <span className="transition-all duration-300 group-hover:mr-2">
            Show Me The Tasks!
          </span>
        </Button>
      </div>
    </div>
  );
};

// --- Search and Today Mode Row ---
interface SearchAndCreateRowProps {
  search: string;
  setSearch: (value: string) => void;
  todayMode: boolean;
  setTodayMode: (value: boolean) => void;
  load: (override?: TodoFilterInput) => Promise<void>;
  filters: TodoFilterInput;
}

const SearchAndCreateRow: React.FC<SearchAndCreateRowProps> = ({
  search,
  setSearch,
  todayMode,
  setTodayMode,
  load,
  filters,
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col sm:flex-row items-stretch gap-4">
      {/* Search Bar */}
      <div className="flex-1 relative group nav-item-group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary animate-zap" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="What are you looking for?"
          className="pl-10 bg-background border-border/60 transition-all duration-300 hover:border-primary/30 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-row-reverse items-center justify-between gap-2 w-full md:w-auto">
        <ToDoDialog onSaved={() => load(filters)} />
        <Card
          className="flex-1 bg-secondary/30 p-2 border-border/40 transition-all cursor-pointer 
                 duration-300 hover:bg-secondary/50 hover:border-primary/20 group"
          onClick={() => setTodayMode(!todayMode)}
        >
          <CardContent className="flex items-center justify-between gap-3 py-0 px-1 md:px-2">
            {/* Label */}
            <Label
              htmlFor="today-mode"
              className="text-sm font-bold text-foreground/80 cursor-pointer 
                     transition-all duration-100 group-hover:scale-90 group-hover:text-primary whitespace-nowrap"
            >
              Focus on Today
            </Label>
            {/* Switch */}
            <Switch
              id="today-mode"
              checked={todayMode}
              onCheckedChange={setTodayMode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Parent Component

export default function TodoHeader({
  filters,
  setFilters,
  search,
  setSearch,
  applyFilters,
  todayMode,
  setTodayMode,
  load,
}: TodoHeaderProps) {
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  
  return (
    <Card className="border w-full card overflow-x-hidden">
      <div className="w-full p-4 sm:p-6 pb-0">
        {/* Top Row: Search, Today Mode */}
        <SearchAndCreateRow
          search={search}
          setSearch={setSearch}
          todayMode={todayMode}
          setTodayMode={setTodayMode}
          load={load}
          filters={filters}
        />

        {/* Collapsible Filters Section */}
        <Collapsible 
          open={filtersExpanded} 
          onOpenChange={setFiltersExpanded}
          className="mt-4"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="
                w-full flex items-center gap-3
                cursor-pointer select-none
                transition-all duration-300
                hover:text-primary
              "
            >
              <Filter className="h-5 w-5 text-primary" />

              <h3 className="text-lg font-extrabold tracking-tight">
                Quick Filters & Sorting
              </h3>

              <div className="flex-1 h-px bg-primary/20" />

              <span className="flex items-center gap-1 text-sm font-semibold">
                {filtersExpanded ? "Hide" : "Show"}
                {filtersExpanded ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </span>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 items-start pt-2">
              <StatusFilter filters={filters} setFilters={setFilters} />
              <PriorityFilter filters={filters} setFilters={setFilters} />
              <TagsMultiselect filters={filters} setFilters={setFilters} />
              <SortBySelect filters={filters} setFilters={setFilters} />
              <SortOrderSelect filters={filters} setFilters={setFilters} />
              <TodoArchive onSuccess={load} />
              <ApplyFiltersGroup applyFilters={applyFilters} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}