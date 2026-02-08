"use client";

import { useState } from "react";
import { TodoFilterInput } from "@/schema/todo";
import { useDebounce } from "@/hooks/use-debounce";
import TodoHeader from "./todo-header";
import TodoBoard from "./todo-board";

function Todo() {
  // Moved state management to columns, but we need filters here
  const [todayMode, setTodayMode] = useState(false);

  const [filters, setFilters] = useState<TodoFilterInput>({
    status: undefined,
    priority: undefined,
    tags: [],
    query: undefined,
    sortBy: undefined,
    sortOrder: undefined,
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = async () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const effectiveFilters: TodoFilterInput = {
      ...filters,
      query: debouncedSearch || undefined,
  };

  return (
    <div className="section-wrapper">
      <TodoHeader
        load={handleRefresh} 
        filters={filters}
        setFilters={setFilters}
        search={search}
        setSearch={setSearch}
        todayMode={todayMode}
        setTodayMode={setTodayMode}
      />

      <TodoBoard 
          filters={effectiveFilters} 
          todayMode={todayMode}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
      />
    </div>
  );
}

export default Todo;