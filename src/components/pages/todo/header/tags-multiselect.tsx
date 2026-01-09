import React, { useState, useEffect } from "react";
import { Tag, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { TodoFilterInput } from "@/schema/todo";
import { IGetTodoTagsPayload } from "@/types/todo";
import { withClientAction } from "@/lib/utils/with-client-action";
import { getTodoTags } from "@/server/actions/to-do-action";

interface FilterComponentProps {
  filters: TodoFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilterInput>>;
}

export const TagsMultiselect: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => {
  const [availableTags, setAvailableTags] = useState<
    IGetTodoTagsPayload[]
  >([]);
  const [openTags, setOpenTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
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
            className="justify-start font-medium border-border/40 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 focus:bg-background/80"
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
              <span className="text-foreground">Pick some tags...</span>
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
