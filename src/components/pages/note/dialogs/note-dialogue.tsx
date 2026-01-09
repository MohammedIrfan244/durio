"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreateNoteSchema } from "@/schema/note";
import type { CreateNoteInput } from "@/schema/note";
import { createNote, updateNote, getNoteById } from "@/server/actions/note-action";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Props for the dialogue
interface NoteDialogProps {
  noteId?: string;
  defaultFolderId?: string | null;
  onSaved?: (note?: unknown) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type NoteFormContext = UseFormReturn<CreateNoteInput>;

import { Controller } from "react-hook-form";
import { ColorPicker } from "@/components/ui/color-picker";

const TitleAndDescriptionSection: React.FC<{ form: NoteFormContext }> = ({ form }) => {
  const { register, control, formState: { errors } } = form;
  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Title</Label>
        <Input {...register("heading")} placeholder="Note title" className="text-sm h-10 bg-secondary/30 border-border/40 focus:bg-secondary/50 backdrop-blur-sm transition-all duration-300" />
        {errors.heading && <p className="text-destructive text-xs">{errors.heading.message}</p>}
      </div>
      
       <div className="space-y-2">
        <Label className="text-sm font-medium">Color (Optional)</Label>
         <Controller
            control={control}
            name="color"
            render={({ field }) => (
                <ColorPicker 
                    value={field.value || ""} 
                    onChange={field.onChange} 
                />
            )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea {...register("description")} placeholder="Write your note..." className="min-h-[80px] resize-y text-sm bg-secondary/30 border-border/40 focus:bg-secondary/50 backdrop-blur-sm transition-all duration-300" />
        {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
      </div>
    </>
  );
};

export default function NoteDialog({ noteId, defaultFolderId, onSaved, open: externalOpen, onOpenChange }: NoteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CreateNoteInput>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: {
      heading: "",
      description: "",
      color: undefined,
      folderId: defaultFolderId || undefined,
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open) return;
    
    if (noteId) {
      const loadNoteData = async () => {
        setIsLoading(true);
        try {
          const noteRes = await getNoteById(noteId);
          const note = noteRes?.data;
          if (!note) {
            toast.error("Failed to load note");
            setOpen(false);
            return;
          }
          reset({
            heading: note.heading || "",
            description: note.description || "",
            color: note.color || undefined,
            folderId: note.folderId || undefined,
          });
        } catch (error) {
          toast.error("Failed to load note");
          setOpen(false);
        } finally {
          setIsLoading(false);
        }
      };
      loadNoteData();
    } else {
      // Reset for creation
      reset({
        heading: "",
        description: "",
        color: undefined,
        folderId: defaultFolderId || undefined,
      });
    }
  }, [open, noteId, defaultFolderId, reset, setOpen]);

  const submitForm = (data: CreateNoteInput) => {
    startTransition(async () => {
      let res;
      if (noteId) {
        res = await updateNote({ id: noteId, ...data });
        toast.success("Note updated!");
      } else {
        res = await createNote(data);
        toast.success("Note created!");
        reset();
      }
      onSaved?.(res);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{noteId ? "Edit Note" : "Create Note"}</DialogTitle>
          <DialogDescription>{noteId ? "Update your note details." : "Add a new note."}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : (
          <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
            <TitleAndDescriptionSection form={form} />
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-10 px-6 text-sm bg-secondary/30 border-border/40 focus:bg-secondary/50 backdrop-blur-sm transition-all duration-300">Cancel</Button>
              <Button type="submit" disabled={isPending} className="h-10 px-6 text-sm">
                {isPending ? <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</span> : noteId ? "Update Note" : "Create Note"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
