import React from "react";
import ToDoDialog from "../dialogs/todo-dialogue";
import TodoArchive from "../todo-archive";
import { HeaderSearch } from "@/components/shared/header-search";
import { TodoFilterInput } from "@/schema/todo";

interface SearchAndCreateRowProps {
  search: string;
  setSearch: (value: string) => void;
  load: (override?: TodoFilterInput) => Promise<void>;
  filters: TodoFilterInput;
}

export const SearchAndCreateRow: React.FC<SearchAndCreateRowProps> = ({
  search,
  setSearch,
  load,
  filters,
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col sm:flex-row items-stretch gap-4">
      {/* Search Bar */}
      <HeaderSearch 
        value={search}
        onChange={setSearch}
        placeholder="What are you looking for?"
      />

      <div className="flex flex-row-reverse items-center justify-between gap-2 w-full md:w-auto">
        <ToDoDialog onSaved={() => load(filters)} />
        <TodoArchive onSuccess={() => load(filters)} />
      </div>
    </div>
  </div>
);
