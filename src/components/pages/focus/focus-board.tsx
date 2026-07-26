"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineGrid from './timeline-grid';
import BlockDialog from './dialogs/block-dialog';

const DAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

export default function FocusBoard({ initialBlocks, availableNotes }: { initialBlocks: any[], availableNotes: any[] }) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  // Filter blocks for the selected day and order them by start time
  const activeBlocks = useMemo(() => {
    return initialBlocks
      .filter(block => block.isActive && block.daysOfWeek.includes(selectedDay))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [initialBlocks, selectedDay]);

  const handleEdit = (block: any) => {
    setEditingBlock(block);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingBlock(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background/50 relative">
      {/* Subtle dotted background */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

      {/* Header Area */}
      <div className="px-6 pt-8 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Focus Routine
            </h1>
            <p className="text-muted-foreground mt-1">Design your gamified 24-hour flow</p>
          </div>
          <Button onClick={handleCreate} className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
            <Plus size={18} className="mr-2" /> New Block
          </Button>
        </div>

        {/* Day Selector */}
        <div className="flex flex-col items-center justify-center">
           <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-full border border-border/40 backdrop-blur-md shadow-sm">
             {DAYS.map((day) => {
               const isSelected = selectedDay === day.value;
               const isSunday = day.value === 0;
               return (
                 <button
                   key={day.value}
                   onClick={() => setSelectedDay(day.value)}
                   className={`relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                     isSelected 
                       ? (isSunday ? 'text-destructive-foreground' : 'text-primary-foreground') 
                       : (isSunday ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')
                   }`}
                 >
                   {isSelected && (
                     <motion.div
                       layoutId="day-indicator"
                       className={`absolute inset-0 rounded-full ${isSunday ? 'bg-destructive' : 'bg-primary'}`}
                       transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                     />
                   )}
                   <span className="relative z-10">{day.label}</span>
                 </button>
               );
             })}
           </div>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide relative z-10">
        <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline Column */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                    <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mb-4 border border-border/50">
                      <Filter className="text-muted-foreground" size={24} />
                    </div>
                    <h3 className="text-lg font-medium">No routines scheduled</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      You don't have any focus blocks for this day. Click "New Block" to start designing your day.
                    </p>
                  </div>
                ) : (
                  <TimelineGrid blocks={activeBlocks} onEdit={handleEdit} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Daily Insights Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl border bg-card/60 backdrop-blur-xl shadow-lg shadow-black/5">
               <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                 <span className="bg-primary/10 text-primary p-2 rounded-xl"><Filter size={18} /></span>
                 Daily Insights
               </h3>
               
               <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center hover:bg-secondary/50 transition-colors">
                   <span className="text-muted-foreground font-medium">Scheduled Blocks</span>
                   <span className="text-2xl font-bold">{activeBlocks.length}</span>
                 </div>
                 
                 <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center hover:bg-secondary/50 transition-colors">
                   <span className="text-muted-foreground font-medium">Potential Flow Points</span>
                   <span className="text-2xl font-bold text-primary">+{activeBlocks.length * 50}</span>
                 </div>

                 <div className="pt-4 mt-4 border-t border-border/50">
                   <p className="text-xs text-muted-foreground text-center">
                     Flow Points and gamification sync will be fully unlocked in Phase 3!
                   </p>
                 </div>
               </div>
            </div>
            
            {activeBlocks.length > 0 && (
              <div className="p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl">
                <h4 className="font-semibold text-primary mb-2">Pro Tip</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Try attaching a Transition Ritual to your blocks. It helps your brain context-switch smoothly between different energy levels.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      <BlockDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={editingBlock} 
        availableNotes={availableNotes}
      />
    </div>
  );
}
