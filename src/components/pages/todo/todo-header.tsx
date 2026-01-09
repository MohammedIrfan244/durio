"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Filter, Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TodoFilterInput } from "@/schema/todo";
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";

// Imported Sub-Components
import { StatusFilter } from "./header/status-filter";
import { PriorityFilter } from "./header/priority-filter";
import { TagsMultiselect } from "./header/tags-multiselect";
import { SortBySelect } from "./header/sort-by-select";
import { SortOrderSelect } from "./header/sort-order-select";
import { FocusOnTodayFilter } from "./header/focus-today-filter";
import { ApplyFiltersGroup } from "./header/apply-filters-group";
import { SearchAndCreateRow } from "./header/search-and-create-row";

interface TodoHeaderProps {
  filters: TodoFilterInput;
  setFilters: Dispatch<SetStateAction<TodoFilterInput>>;
  search: string;
  setSearch: (value: string) => void;
  applyFilters: () => void;
  todayMode: boolean;
  setTodayMode: (value: boolean) => void;
  load: (override?: TodoFilterInput) => Promise<void>;
}

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
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  return (
    <SectionHeaderWrapper>
        {/* Top Row: Search, Today Mode */}
        <SearchAndCreateRow
          search={search}
          setSearch={setSearch}
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
                {filtersExpanded ? "Less" : "More"}
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
              <ApplyFiltersGroup applyFilters={applyFilters} />
              <FocusOnTodayFilter todayMode={todayMode} setTodayMode={setTodayMode} />
            </div>
          </CollapsibleContent>
        </Collapsible>
    </SectionHeaderWrapper>
  );
}
