"use client";

import { useState, useEffect } from "react";
import { TodoFilterInput } from "@/schema/todo";
import { IGetTodoListPayload } from "@/types/todo";
import { withClientAction } from "@/lib/helper/with-client-action";
import { getTodoList, getTodayTodos } from "@/server/to-do-action";
import { useDebounce } from "@/hooks/useDebounce";
import TodoHeader from "./todo-header";
import TodoBoard from "./todo-board";

function Todo() {
  const [todos, setTodos] = useState<IGetTodoListPayload>({
    plan: [],
    pending: [],
    done: [],
  });

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

  const load = async (override?: TodoFilterInput) => {
    const finalFilters = override ?? filters;
    const action = todayMode ? getTodayTodos : getTodoList;

    const response = await withClientAction<IGetTodoListPayload>(() =>
      action(finalFilters)
    );

    if (response) setTodos(response);
  };

  const applyFilters = () => {
    load({
      ...filters,
      query: search || undefined,
    });
  };

  useEffect(() => {
    load({
      ...filters,
      query: debouncedSearch || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, todayMode]);

  return (
    <div className="section-wrapper">
      <TodoHeader
        applyFilters={applyFilters}
        load={load}
        filters={filters}
        setFilters={setFilters}
        search={search}
        setSearch={setSearch}
        todayMode={todayMode}
        setTodayMode={setTodayMode}
      />

      <TodoBoard fetchTodos={load} todos={todos} />
    </div>
  );
}

export default Todo;