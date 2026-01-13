import React from "react";
import ToDoDialog from "../dialogs/todo-dialogue";
import TodoArchive from "../todo-archive";
import { HeaderSearch } from "@/components/shared/header-search";
import { TodoFilterInput } from "@/schema/todo";
import { QuickTodoDrawer } from "../quick-todo/quick-todo-drawer";

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

      <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-2 w-full md:w-auto">
        <div className="contents md:hidden">
            {/* Mobile Order: Archive, Quick, Dialog (Full) */}
        </div>
        <div className="col-span-1 md:w-auto order-1 md:order-none">
             <TodoArchive onSuccess={() => load(filters)} />
        </div>
        <div className="col-span-1 md:w-auto order-2 md:order-none">
             <QuickTodoDrawer />
        </div>
        <div className="col-span-2 md:w-auto order-3 md:order-none">
             <ToDoDialog onSaved={() => load(filters)} />
        </div>
      </div>
    </div>
  </div>
);
