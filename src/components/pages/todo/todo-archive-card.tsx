"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { withClientAction } from "@/lib/helper/with-client-action";
import { restoreFromArchive } from "@/server/actions/to-do-action";
import { RestoreTodoFromArchiveInput } from "@/schema/todo";
import { IGetArchivedTodoList } from "@/types/todo";
import { formatName } from "@/lib/helper/name-formatter";
import TodoDeleteDialogue from "./todo-delete-dialogue";

interface TodoArchiveCardProps {
  todo: IGetArchivedTodoList;
  onRemoveFromList: (id: string) => void;
  isPending: boolean;
  onSuccess: () => void;
}

export default function TodoArchiveCard({
  todo,
  onRemoveFromList,
  isPending,
  onSuccess,
}: TodoArchiveCardProps) {
  const [isLocalPending, startTransition] = useTransition();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleRestore = () => {
    startTransition(async () => {
      const payload: RestoreTodoFromArchiveInput = { id: todo.id };
      const response = await withClientAction(
        () => restoreFromArchive(payload),
        true
      );

      if (response !== undefined) {
        onRemoveFromList(todo.id);
        toast.success("Todo restored!");
      }
    });
  };

  const isDisabled = isPending || isLocalPending;

  return (
    <>
      <Card className="bg-background/60 border-none hover:shadow-md shadow-sm transition-all duration-200 py-1">
        <CardContent className="p-2">
          {/* Title */}
          <div className="flex items-start justify-between">
            <h3 className="text-md font-bold leading-tight flex-1">
              {formatName(todo.title)}
            </h3>
            <Badge variant="outline" className="text-[10px] shrink-0">
              <Archive className="h-2.5 w-2.5 mr-1" />
              Archived
            </Badge>
          </div>

          <Separator className="my-2" />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRestore}
              disabled={isDisabled}
              className="flex-1 h-8 text-xs hover:scale-x-[0.98] transition-transform"
            >
              <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" />
              Restore
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setOpenDeleteDialog(true)}
              disabled={isDisabled}
              className="h-8 px-3 text-xs hover:scale-x-105 transition-transform"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permanent Delete Dialog */}
      <TodoDeleteDialogue
        todoId={todo.id}
        isOpen={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        isSoft={false}
        onSuccess={() => {
          onRemoveFromList(todo.id);
          onSuccess();
          toast.success("Todo deleted permanently");
        }}
      />
    </>
  );
}
