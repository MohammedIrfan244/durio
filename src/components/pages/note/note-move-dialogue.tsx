"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { INote, INoteFolder } from "@/types/note";
import { useState } from "react";
import { Loader2, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteMoveDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  note: INote | null;
  folders: INoteFolder[];
  onMove: (noteId: string, folderId: string | null) => Promise<void>;
}

export function NoteMoveDialog({
  isOpen,
  setOpen,
  note,
  folders,
  onMove,
}: NoteMoveDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    note?.folderId || null
  );
  const [isMoving, setIsMoving] = useState(false);

  const handleMove = async () => {
    if (!note) return;
    setIsMoving(true);
    await onMove(note.id, selectedFolderId);
    setIsMoving(false);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move Note</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Select a folder to move <span className="font-semibold text-foreground">"{note?.heading}"</span> to:
          </p>
          
          <RadioGroup
            value={selectedFolderId || "root"}
            onValueChange={(val) => setSelectedFolderId(val === "root" ? null : val)}
            className="grid gap-2 max-h-[300px] overflow-y-auto pr-2"
          >
             {/* Root Option */}
             <div className="">
                <RadioGroupItem value="root" id="folder-root" className="peer sr-only" />
                <Label
                  htmlFor="folder-root"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                    selectedFolderId === null && "border-primary bg-primary/5"
                  )}
                >
                    <div className="flex items-center gap-3 w-full">
                       <div className="p-2 rounded-full bg-secondary">
                          <Folder className="h-4 w-4" />
                       </div>
                       <span className="font-medium">No Folder (Root)</span>
                    </div>
                </Label>
              </div>

            {folders.map((folder) => (
              <div key={folder.id}>
                <RadioGroupItem value={folder.id} id={`folder-${folder.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`folder-${folder.id}`}
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                    selectedFolderId === folder.id && "border-primary bg-primary/5"
                  )}
                >
                    <div className="flex items-center gap-3 w-full">
                       <div 
                          className="p-2 rounded-full" 
                          style={{ backgroundColor: folder.color + '20', color: folder.color }}
                       >
                          {folder.icon ? <span className="text-lg leading-none">{folder.icon}</span> : <Folder className="h-4 w-4" />}
                       </div>
                       <span className="font-medium">{folder.name}</span>
                    </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isMoving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Moving...
              </>
            ) : (
              "Move"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
