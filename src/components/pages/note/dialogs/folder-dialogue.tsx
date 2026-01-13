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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreateFolderSchema } from "@/schema/note";
import type { CreateFolderInput } from "@/schema/note";
import { createNoteFolder, updateNoteFolder, getFolders, getFolderById } from "@/server/actions/note-action";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FolderDialogProps {
  folderId?: string;
  trigger?: React.ReactNode;
  onSaved?: (folder?: unknown) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type FolderFormContext = UseFormReturn<CreateFolderInput>;

import { Controller } from "react-hook-form";
import { ColorPicker } from "@/components/ui/color-picker";
import { IconPicker } from "@/components/ui/icon-picker";
import { error } from "@/lib/utils/logger";

const NameAndColorSection: React.FC<{ form: FolderFormContext }> = ({ form }) => {
  const { register, control, formState: { errors } } = form;
  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Folder Name</Label>
        <Input {...register("name")} placeholder="Folder name" className="text-sm h-10 bg-secondary/30 border-border/40 focus:bg-secondary/50 backdrop-blur-sm transition-all duration-300" />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color</Label>
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
            {errors.color && <p className="text-destructive text-xs">{errors.color.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Icon (optional)</Label>
            <Controller 
                control={control}
                name="icon"
                render={({ field }) => (
                    <IconPicker
                        value={field.value || ""}
                        onChange={field.onChange}
                    />
                )}
            />
          </div>
      </div>
    </>
  );
};

export default function FolderDialog({ folderId, trigger, onSaved, open: externalOpen, onOpenChange }: FolderDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CreateFolderInput>({
    resolver: zodResolver(CreateFolderSchema),
    defaultValues: {
      name: "",
      color: "",
      icon: undefined,
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open || !folderId) return;
    const loadFolderData = async () => {
      setIsLoading(true);
      try {
        const folderRes = await getFolderById(folderId);
        const folder = folderRes.data
        if (!folder) {
          toast.error("Failed to load folder");
          error("Folder not found:", folderRes.error);
          setOpen(false);
          return;
        }
        reset({
          name: folder.name || "",
          color: folder.color || "",
          icon: folder.icon || undefined,
        });
      } catch (error) {
        toast.error("Failed to load folder");
        setOpen(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadFolderData();
  }, [open, folderId, reset, setOpen]);

  const submitForm = (data: CreateFolderInput) => {
    startTransition(async () => {
      let res;
      if (folderId) {
        res = await updateNoteFolder({ id: folderId, ...data });
        toast.success("Folder updated!");
      } else {
        res = await createNoteFolder(data);
        toast.success("Folder created!");
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
          <DialogTitle>{folderId ? "Edit Folder" : "Create Folder"}</DialogTitle>
          <DialogDescription>{folderId ? "Update your folder details." : "Add a new folder."}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : (
          <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
            <NameAndColorSection form={form} />
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-10 px-6 text-sm bg-secondary/30 border-border/40 focus:bg-secondary/50 backdrop-blur-sm transition-all duration-300">Cancel</Button>
              <Button type="submit" disabled={isPending} className="h-10 px-6 text-sm">
                {isPending ? <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</span> : folderId ? "Update Folder" : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
