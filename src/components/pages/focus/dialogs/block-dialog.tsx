"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Flame, Zap, BatteryCharging, Coffee, AlertCircle, Clock } from 'lucide-react';
import { createFocusBlock, updateFocusBlock, deleteFocusBlock } from '@/server/actions/focus-actions';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from 'sonner';
import { DAYS } from '@/lib/focus-constants';

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  availableNotes: any[];
}

export default function BlockDialog({ open, onOpenChange, initialData, availableNotes }: BlockDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1,2,3,4,5]);
  const [energyLevel, setEnergyLevel] = useState('MEDIUM');
  const [priority, setPriority] = useState('MEDIUM');
  const [transitionRitual, setTransitionRitual] = useState('');
  const [linkedNoteId, setLinkedNoteId] = useState<string>('none');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setDaysOfWeek(initialData.daysOfWeek || []);
        setEnergyLevel(initialData.energyLevel || 'MEDIUM');
        setPriority(initialData.priority || 'MEDIUM');
        setTransitionRitual(initialData.transitionRitual || '');
        setLinkedNoteId(initialData.linkedNoteId || 'none');
        setIsActive(initialData.isActive ?? true);
      } else {
        // Defaults
        setTitle('');
        setDescription('');
        setStartTime('09:00');
        setEndTime('10:00');
        setDaysOfWeek([1,2,3,4,5]);
        setEnergyLevel('MEDIUM');
        setPriority('MEDIUM');
        setTransitionRitual('');
        setLinkedNoteId('none');
        setIsActive(true);
      }
    }
  }, [open, initialData]);

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (!title || !startTime || !endTime || daysOfWeek.length === 0) {
      toast.error("Please fill required fields (Title, Times, and at least one Day).");
      return;
    }

    setIsSaving(true);
    const payload = {
      title,
      description,
      startTime,
      endTime,
      daysOfWeek,
      energyLevel,
      priority,
      transitionRitual,
      linkedNoteId: linkedNoteId === 'none' ? null : linkedNoteId,
      isActive,
    };

    try {
      let res;
      if (initialData?.id) {
        res = await updateFocusBlock({ id: initialData.id, ...payload });
      } else {
        res = await createFocusBlock(payload);
      }

      if (res.success) {
        toast.success(`Block ${initialData?.id ? 'updated' : 'created'} successfully!`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to save block");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (confirm("Are you sure you want to delete this block?")) {
      setIsSaving(true);
      const res = await deleteFocusBlock({ id: initialData.id });
      if (res.success) {
         toast.success("Block deleted");
         onOpenChange(false);
      } else {
         toast.error("Failed to delete");
      }
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Focus Block' : 'Design New Flow Block'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-1">
            <Label>Block Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Deep Work Session" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 relative">
              <Label>Start Time *</Label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div className="space-y-1 relative">
              <Label>End Time *</Label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Active Days *</Label>
            <div className="flex gap-2">
              {DAYS.map(day => {
                const selected = daysOfWeek.includes(day.value);
                const isSunday = day.value === 0;
                return (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      selected 
                        ? (isSunday ? 'bg-destructive text-destructive-foreground shadow-md scale-105' : 'bg-primary text-primary-foreground shadow-md scale-105') 
                        : (isSunday ? 'bg-secondary text-destructive hover:bg-destructive/10' : 'bg-secondary text-muted-foreground hover:bg-secondary/80')
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
             <Label>Energy Level</Label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'HIGH', label: 'High', icon: <Flame size={14} />, color: 'orange' },
                  { id: 'MEDIUM', label: 'Medium', icon: <Zap size={14} />, color: 'amber' },
                  { id: 'LOW', label: 'Low', icon: <BatteryCharging size={14} />, color: 'teal' },
                  { id: 'RECOVERY', label: 'Recovery', icon: <Coffee size={14} />, color: 'indigo' },
                ].map(energy => {
                  const selected = energyLevel === energy.id;
                  return (
                    <button
                      key={energy.id}
                      onClick={() => setEnergyLevel(energy.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        selected ? `border-${energy.color}-500 bg-${energy.color}-500/10 text-${energy.color}-600 dark:text-${energy.color}-400` : 'border-border/50 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {energy.icon}
                      <span className="text-xs mt-1 font-medium">{energy.label}</span>
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="space-y-1">
            <Label>Transition Ritual (Optional)</Label>
            <Input value={transitionRitual} onChange={e => setTransitionRitual(e.target.value)} placeholder="e.g. Brew tea and close Slack" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <Label>Priority</Label>
               <Select value={priority} onValueChange={setPriority}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="LOW">Low</SelectItem>
                   <SelectItem value="MEDIUM">Medium</SelectItem>
                   <SelectItem value="HIGH">
                     <span className="flex items-center text-red-500"><AlertCircle size={14} className="mr-1"/> High</span>
                   </SelectItem>
                 </SelectContent>
               </Select>
             </div>
             
             <div className="space-y-1">
               <Label>Linked Note (Workspace)</Label>
               <Select value={linkedNoteId} onValueChange={setLinkedNoteId}>
                 <SelectTrigger><SelectValue placeholder="No note linked" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="none">No note linked</SelectItem>
                   {availableNotes.map(note => {
                     if (note.isFolder) {
                       return (
                         <React.Fragment key={note.id}>
                           <SelectItem value={`folder_${note.id}`} disabled className="font-bold opacity-50">{note.title}</SelectItem>
                           {note.children.map((child: any) => (
                              <SelectItem key={child.id} value={child.id} className="pl-6">{child.title}</SelectItem>
                           ))}
                         </React.Fragment>
                       );
                     }
                     return <SelectItem key={note.id} value={note.id}>{note.title}</SelectItem>;
                   })}
                 </SelectContent>
               </Select>
             </div>
          </div>

          <div className="space-y-1">
             <Label>Description</Label>
             <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-secondary/20">
             <div className="space-y-0.5">
               <Label>Active Status</Label>
               <p className="text-xs text-muted-foreground">If disabled, this block won't appear on your timeline.</p>
             </div>
             <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

        </div>

        <DialogFooter className="flex items-center justify-between mt-4">
          {initialData ? (
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>Delete</Button>
          ) : <div/>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Block'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
