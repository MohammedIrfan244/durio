"use client";

import { useState, useEffect } from "react";
import { TodoFilterInput } from "@/schema/todo";
import { IGetTodoListPayload } from "@/types/todo";
import { withClientAction } from "@/lib/utils/with-client-action";
import { getTodoList, getTodayTodos } from "@/server/actions/to-do-action";
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
  // Note: debouncedSearch is actually needed by the columns, so we pass it down?
  // Or we pass 'search' and they debounce it?
  // Better to debounce here and pass 'debouncedSearch' as 'query' in filters.
  const debouncedSearch = useDebounce(search, 300);

  // We no longer fetch "todos" big object here. 
  // We just pass the current filters to the board.
  
  // Refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = async () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const applyFilters = () => {
      // Logic if needed, currently effects handle filter changes
  };

  // Construct effective filters
  const effectiveFilters: TodoFilterInput = {
      ...filters,
      query: debouncedSearch || undefined,
  };

  return (
    <div className="section-wrapper">
      <TodoHeader
        applyFilters={applyFilters}
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