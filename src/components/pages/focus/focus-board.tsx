"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Filter, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineGrid from './timeline-grid';
import BlockDialog from './dialogs/block-dialog';
import { SectionHeaderWrapper } from '@/components/layout/section-header-wrapper';
import { DAYS, getInsightForDay } from '@/lib/focus-constants';

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

  // Insights Calculations
  const highEnergyCount = activeBlocks.filter(b => b.energyLevel === 'HIGH').length;
  const recoveryCount = activeBlocks.filter(b => b.energyLevel === 'RECOVERY').length;
  const potentialPoints = activeBlocks.length * 50; // Tease gamification

  const [insightMessage, setInsightMessage] = useState("");
  useEffect(() => {
    setInsightMessage(getInsightForDay(activeBlocks.length, highEnergyCount, recoveryCount));
  }, [activeBlocks.length, highEnergyCount, recoveryCount]);

  const handleEdit = (block: any) => {
    setEditingBlock(block);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingBlock(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="section-wrapper overflow-y-auto hide-scrollbar-on-main">
      <SectionHeaderWrapper>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
             <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
               <Target className="text-primary" size={24} />
               Focus Routine
             </h2>
             <p className="text-sm text-muted-foreground">
               Design your gamified 24-hour flow
             </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Day Selector */}
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-full border border-border/40 backdrop-blur-md shadow-inner">
              {DAYS.map((day) => {
                const isSelected = selectedDay === day.value;
                const isSunday = day.value === 0;
                return (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDay(day.value)}
                    className={`relative h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
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

            <Button onClick={handleCreate} className="rounded-full shadow-lg transition-all hidden sm:flex">
              <Plus size={16} className="mr-2" /> New Block
            </Button>
            <Button onClick={handleCreate} size="icon" className="rounded-full shadow-lg transition-all sm:hidden">
              <Plus size={16} />
            </Button>
          </div>

        </div>
      </SectionHeaderWrapper>

      {/* Main Timeline Area */}
      <div className="flex-1 w-full mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Timeline Column */}
        <div className="lg:col-span-8 pb-20 px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-70">
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
        <div className="lg:col-span-4 space-y-6 pb-20 px-2">
          <div className="p-6 rounded-3xl border bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                <span className="bg-primary/10 text-primary p-2 rounded-xl"><Filter size={18} /></span>
                Daily Insights
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center transition-colors">
                  <span className="text-sm text-muted-foreground font-medium">Scheduled Blocks</span>
                  <span className="text-xl font-bold">{activeBlocks.length}</span>
                </div>
                
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center transition-colors">
                  <span className="text-sm text-muted-foreground font-medium">Potential Points</span>
                  <span className="text-xl font-bold text-primary">+{potentialPoints} FP</span>
                </div>

                <div className="pt-4 mt-2">
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
                    <p className="text-sm font-medium text-foreground leading-relaxed italic">
                      "{insightMessage}"
                    </p>
                  </div>
                </div>
              </div>
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
