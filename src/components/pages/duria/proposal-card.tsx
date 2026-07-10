import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Trash2, Edit3, PlusCircle, AlertTriangle } from 'lucide-react';
import { createTodo, updateTodo, deleteTodo } from '@/server/actions/to-do-action';
import { createNote, updateNote, deleteNote } from '@/server/actions/note-action';
import { createEvent, updateEvent, deleteEvent, getOrCreateDefaultCategories } from '@/server/actions/calendar-actions';

interface ProposalCardProps {
  toolName: string;
  args: Record<string, any>;
  onConfirm: (finalPayload: any, resultMessage: string) => void;
  onCancel: (cancelMessage: string) => void;
  status: 'pending' | 'confirmed' | 'cancelled' | 'error';
}

export default function ProposalCard({ toolName, args, onConfirm, onCancel, status }: ProposalCardProps) {
  const [payload, setPayload] = useState<any>(args);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update state if args change
  useEffect(() => {
    setPayload(args);
  }, [args]);

  const handleChange = (field: string, value: any) => {
    setPayload((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    let resultMessage = "";
    try {
      if (toolName === 'proposeCreateTask') {
        const res = await createTodo(payload);
        if (!res.success) throw new Error(res.error?.message || "Failed to create task");
        resultMessage = `Task "${payload.title}" created successfully.`;
      } 
      else if (toolName === 'proposeUpdateTask') {
        const res = await updateTodo(payload);
        if (!res.success) throw new Error(res.error?.message || "Failed to update task");
        resultMessage = `Task "${payload.title || 'updated'}" updated successfully.`;
      } 
      else if (toolName === 'proposeDeleteTask') {
        const res = await deleteTodo({ id: payload.id });
        if (!res.success) throw new Error(res.error?.message || "Failed to delete task");
        resultMessage = `Task deleted successfully.`;
      } 
      else if (toolName === 'proposeCreateNote') {
        const res = await createNote(payload);
        if (!res.success) throw new Error(res.error?.message || "Failed to create note");
        resultMessage = `Note "${payload.heading}" created successfully.`;
      } 
      else if (toolName === 'proposeUpdateNote') {
        const res = await updateNote(payload);
        if (!res.success) throw new Error(res.error?.message || "Failed to update note");
        resultMessage = `Note "${payload.heading || 'updated'}" updated successfully.`;
      } 
      else if (toolName === 'proposeDeleteNote') {
        const res = await deleteNote({ id: payload.id, softDelete: true });
        if (!res.success) throw new Error(res.error?.message || "Failed to delete note");
        resultMessage = `Note deleted successfully.`;
      } 
      else if (toolName === 'proposeCreateEvent') {
        let categoryId = undefined;
        if (payload.categoryName) {
           const categories = await getOrCreateDefaultCategories();
           const matched = categories.find((c: any) => c.name.toLowerCase() === payload.categoryName.toLowerCase());
           if (matched) categoryId = matched.id;
        }
        const res = await createEvent({
            ...payload,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            categoryId
        });
        if (!res.success) throw new Error(res.error || "Failed to create event");
        resultMessage = `Event "${payload.title}" created successfully.`;
      } 
      else if (toolName === 'proposeUpdateEvent') {
        const updateData: any = { ...payload };
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
        const res = await updateEvent(payload.id, updateData);
        if (!res.success) throw new Error(res.error || "Failed to update event");
        resultMessage = `Event "${payload.title || 'updated'}" updated successfully.`;
      } 
      else if (toolName === 'proposeDeleteEvent') {
        const res = await deleteEvent(payload.id);
        if (!res.success) throw new Error(res.error || "Failed to delete event");
        resultMessage = `Event deleted successfully.`;
      }
      
      onConfirm(payload, resultMessage);
    } catch (e: any) {
      onCancel(`Error executing action: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Render content based on tool
  const renderFields = () => {
    if (toolName.includes('Delete')) {
      return (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 border border-destructive/20">
           <AlertTriangle size={18} />
           <span className="text-sm font-medium">Are you sure you want to delete this {toolName.replace('proposeDelete', '')}?</span>
        </div>
      );
    }

    if (toolName.includes('Task')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={payload.title || ''} onChange={(e) => handleChange('title', e.target.value)} disabled={status !== 'pending'} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={payload.description || ''} onChange={(e) => handleChange('description', e.target.value)} disabled={status !== 'pending'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select disabled={status !== 'pending'} value={payload.priority || 'LOW'} onValueChange={(val) => handleChange('priority', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {toolName === 'proposeUpdateTask' && (
               <div className="space-y-1">
                <Label>Status</Label>
                <Select disabled={status !== 'pending'} value={payload.status || 'PLAN'} onValueChange={(val) => handleChange('status', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLAN">Plan</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input type="date" value={payload.dueDate || ''} onChange={(e) => handleChange('dueDate', e.target.value)} disabled={status !== 'pending'} />
            </div>
            <div className="space-y-1">
              <Label>Due Time</Label>
              <Input type="time" value={payload.dueTime || ''} onChange={(e) => handleChange('dueTime', e.target.value)} disabled={status !== 'pending'} />
            </div>
          </div>
        </div>
      );
    }

    if (toolName.includes('Note')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Heading</Label>
            <Input value={payload.heading || ''} onChange={(e) => handleChange('heading', e.target.value)} disabled={status !== 'pending'} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea rows={4} value={payload.description || ''} onChange={(e) => handleChange('description', e.target.value)} disabled={status !== 'pending'} />
          </div>
        </div>
      );
    }

    if (toolName.includes('Event')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={payload.title || ''} onChange={(e) => handleChange('title', e.target.value)} disabled={status !== 'pending'} />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select disabled={status !== 'pending'} value={payload.categoryName || 'Personal'} onValueChange={(val) => handleChange('categoryName', val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Birthdays">Birthdays</SelectItem>
                <SelectItem value="Anniversaries">Anniversaries</SelectItem>
                <SelectItem value="Meetings">Meetings</SelectItem>
                <SelectItem value="Reminders">Reminders</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Start Date (ISO)</Label>
            <Input value={payload.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} disabled={status !== 'pending'} />
          </div>
          <div className="space-y-1">
            <Label>End Date (ISO)</Label>
            <Input value={payload.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} disabled={status !== 'pending'} />
          </div>
        </div>
      );
    }

    return null;
  };

  const getTitle = () => {
    if (toolName.includes('Create')) return <span className="flex items-center gap-2"><PlusCircle size={18} /> New Proposal</span>;
    if (toolName.includes('Update')) return <span className="flex items-center gap-2"><Edit3 size={18} /> Update Proposal</span>;
    if (toolName.includes('Delete')) return <span className="flex items-center gap-2"><Trash2 size={18} /> Delete Proposal</span>;
    return "Proposal";
  };

  return (
    <Card className="my-2 bg-card overflow-hidden shadow-sm border-primary/20">
      <CardHeader className="bg-secondary/50 py-3 px-4 border-b">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-primary">
          {getTitle()}
          {status === 'confirmed' && <CheckCircle2 size={18} className="text-green-500" />}
          {status === 'cancelled' && <XCircle size={18} className="text-destructive" />}
          {status === 'error' && <XCircle size={18} className="text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {renderFields()}
      </CardContent>
      {status === 'pending' && (
        <CardFooter className="flex justify-end gap-2 p-4 pt-0">
          <Button variant="outline" size="sm" onClick={() => onCancel("User cancelled the proposed action")} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? "Saving..." : "Confirm & Save"}
          </Button>
        </CardFooter>
      )}
      {status !== 'pending' && (
        <div className="px-4 pb-4 text-xs font-medium opacity-70">
           Status: {status.toUpperCase()}
        </div>
      )}
    </Card>
  );
}
