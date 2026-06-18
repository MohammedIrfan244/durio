"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useDuria } from '@/components/providers/duria-provider';
import { Loader2, CheckCircle2, FileText, CheckSquare, CalendarDays, BookOpen } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContextAttachDialog({ open, onOpenChange }: Props) {
  const { attachTodos, attachNotes, attachEvents, attachDoc, isLoading } = useDuria();
  const [successMsg, setSuccessMsg] = useState("");

  const handleAction = async (action: () => Promise<void>, msg: string) => {
    await action();
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Attach Context</DialogTitle>
          <DialogDescription>
            Select data or manuals to attach to DURIA's memory for this conversation.
          </DialogDescription>
        </DialogHeader>

        {successMsg ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-primary animate-in zoom-in duration-300">
            <CheckCircle2 size={48} />
            <p className="font-semibold">{successMsg}</p>
          </div>
        ) : (
          <Tabs defaultValue="data" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data">User Data</TabsTrigger>
              <TabsTrigger value="manuals">Feature Manuals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="space-y-4 py-4">
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-14" 
                  disabled={isLoading}
                  onClick={() => handleAction(() => attachTodos({ limit: 10 }), "Attached recent Tasks!")}
                >
                  <CheckSquare className="mr-3 h-5 w-5 text-blue-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Recent Tasks</span>
                    <span className="text-xs text-muted-foreground">Attach up to 10 active tasks</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-14"
                  disabled={isLoading}
                  onClick={() => handleAction(() => attachNotes({ limit: 10 }), "Attached recent Notes!")}
                >
                  <FileText className="mr-3 h-5 w-5 text-amber-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Recent Notes</span>
                    <span className="text-xs text-muted-foreground">Attach up to 10 recent notes</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-14"
                  disabled={isLoading}
                  onClick={() => handleAction(() => attachEvents({ limit: 10 }), "Attached upcoming Events!")}
                >
                  <CalendarDays className="mr-3 h-5 w-5 text-green-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Upcoming Events</span>
                    <span className="text-xs text-muted-foreground">Attach the next 10 scheduled events</span>
                  </div>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manuals" className="space-y-4 py-4">
               <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  disabled={isLoading}
                  onClick={() => handleAction(() => attachDoc("Calculator Guide", "docs/features/calculator.md"), "Attached Calculator Manual!")}
                >
                  <BookOpen className="mr-3 h-4 w-4 text-purple-500" />
                  Calculator Deep Context
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  disabled={isLoading}
                  onClick={() => handleAction(() => attachDoc("Calendar Guide", "docs/features/calendar.md"), "Attached Calendar Manual!")}
                >
                  <BookOpen className="mr-3 h-4 w-4 text-purple-500" />
                  Calendar Deep Context
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  disabled={isLoading}
                  onClick={() => handleAction(() => attachDoc("Todo Guide", "docs/features/todo.md"), "Attached Todo Manual!")}
                >
                  <BookOpen className="mr-3 h-4 w-4 text-purple-500" />
                  Todo Deep Context
                </Button>
               </div>
            </TabsContent>
          </Tabs>
        )}

        {isLoading && !successMsg && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-2 text-sm font-medium">Fetching Context...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
