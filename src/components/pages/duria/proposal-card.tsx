import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Trash2, Edit3, PlusCircle, AlertTriangle } from 'lucide-react';
import { createTodo, updateTodo, deleteTodo, getTodoById } from '@/server/actions/to-do-action';
import { createNote, updateNote, deleteNote, getNoteById } from '@/server/actions/note-action';
import { createEvent, updateEvent, deleteEvent, getOrCreateDefaultCategories, getEventById } from '@/server/actions/calendar-actions';
import { getTodosForAI, getNotesForAI, getEventsForAI } from '@/server/actions/duria-actions';

interface ProposalCardProps {
  toolName: string;
  args: Record<string, any>;
  onConfirm: (finalPayload: any, resultMessage: string) => void;
  onCancel: (cancelMessage: string) => void;
  status: 'pending' | 'confirmed' | 'cancelled' | 'error';
}

type TargetType = 'Task' | 'Note' | 'Event';

interface ActionTarget {
  id: string;
  title: string;
  subtitle?: string;
}

function normalizeProposalPayload(toolName: string, args: Record<string, any>) {
  const normalized = { ...args };

  if (toolName.includes('Task')) {
    if (typeof normalized.priority === 'string') {
      normalized.priority = normalized.priority.toUpperCase();
    }
    if (typeof normalized.dueTime === 'string') {
      normalized.dueTime = normalized.dueTime.slice(0, 5);
    }
  }

  if (toolName.includes('Note')) {
    normalized.heading = normalized.heading ?? normalized.title;
    normalized.description = normalized.description ?? normalized.content;
    delete normalized.title;
    delete normalized.content;
  }

  if (toolName.includes('Event')) {
    normalized.startDate = normalized.startDate ?? normalized.startTime;
    normalized.endDate = normalized.endDate ?? normalized.endTime;
    delete normalized.startTime;
    delete normalized.endTime;
  }

  return normalized;
}

function getInitialTargetType(toolName: string): TargetType {
  if (toolName.includes('Note')) return 'Note';
  if (toolName.includes('Event')) return 'Event';
  return 'Task';
}

function getActionMode(toolName: string) {
  if (toolName.includes('Create')) return 'Create';
  if (toolName.includes('Update')) return 'Update';
  if (toolName.includes('Delete')) return 'Delete';
  return 'Proposal';
}

function formatTargetDate(value: any) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateInput(value: any) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatDateTimeInput(value: any) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function getProposedDirtyFields(args: Record<string, any>) {
  return Object.keys(args || {}).filter((key) => !['id', 'reason'].includes(key) && args[key] !== undefined);
}

function getAllowedUpdateFields(targetType: TargetType) {
  if (targetType === 'Task') return ['title', 'description', 'priority', 'dueDate', 'dueTime', 'tags', 'status'];
  if (targetType === 'Note') return ['heading', 'description', 'color', 'folderId'];
  return ['title', 'description', 'location', 'isAllDay', 'startDate', 'endDate', 'categoryName'];
}

function valuesMatch(a: any, b: any) {
  return String(a ?? '') === String(b ?? '');
}

function pickDirtyPayload(payload: Record<string, any>, dirtyFields: string[], originalPayload?: Record<string, any> | null, allowedFields?: string[]) {
  return dirtyFields.reduce((acc: Record<string, any>, field) => {
    if (allowedFields && !allowedFields.includes(field)) return acc;
    if (!originalPayload || !valuesMatch(payload[field], originalPayload[field])) {
      acc[field] = payload[field];
    }
    return acc;
  }, {});
}

export default function ProposalCard({ toolName, args, onConfirm, onCancel, status }: ProposalCardProps) {
  const [payload, setPayload] = useState<any>(() => normalizeProposalPayload(toolName, args));
  const [originalPayload, setOriginalPayload] = useState<any>(null);
  const [dirtyFields, setDirtyFields] = useState<string[]>(() => getProposedDirtyFields(args));
  const [isSaving, setIsSaving] = useState(false);
  const [targetType, setTargetType] = useState<TargetType>(() => getInitialTargetType(toolName));
  const [targets, setTargets] = useState<ActionTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState(args.id || '');
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [isLoadingSelectedTarget, setIsLoadingSelectedTarget] = useState(false);
  const actionMode = getActionMode(toolName);
  const needsTargetSelector = actionMode === 'Update' || actionMode === 'Delete';
  const selectedTarget = targets.find((target) => target.id === selectedTargetId);
  const fieldsDisabled = status !== 'pending' || isLoadingSelectedTarget;
  const allowedUpdateFields = getAllowedUpdateFields(targetType);
  const updatePayload = actionMode === 'Update' ? pickDirtyPayload(payload, dirtyFields, originalPayload, allowedUpdateFields) : {};
  const hasUpdateChanges = Object.keys(updatePayload).length > 0;
  
  // Update state if args change
  useEffect(() => {
    setPayload(normalizeProposalPayload(toolName, args));
    setOriginalPayload(null);
    setDirtyFields(getProposedDirtyFields(args));
    setTargetType(getInitialTargetType(toolName));
    setSelectedTargetId(args.id || '');
  }, [toolName, args]);

  useEffect(() => {
    if (!needsTargetSelector) return;

    let cancelled = false;
    const loadTargets = async () => {
      setIsLoadingTargets(true);
      try {
        let nextTargets: ActionTarget[] = [];

        if (targetType === 'Task') {
          const res = await getTodosForAI({ limit: 30 });
          if (res.success && res.data) {
            nextTargets = res.data.map((todo: any) => ({
              id: todo.id,
              title: todo.title,
              subtitle: [
                todo.status,
                todo.priority ? `${todo.priority} priority` : undefined,
                formatTargetDate(todo.dueDate),
              ].filter(Boolean).join(' - '),
            }));
          }
        }

        if (targetType === 'Note') {
          const res = await getNotesForAI({ limit: 30 });
          if (res.success && res.data) {
            nextTargets = res.data.map((note: any) => ({
              id: note.id,
              title: note.heading,
              subtitle: note.folder?.name || note.description,
            }));
          }
        }

        if (targetType === 'Event') {
          const res = await getEventsForAI({ limit: 30 });
          if (res.success && res.data) {
            nextTargets = res.data.map((event: any) => ({
              id: event.id,
              title: event.title,
              subtitle: [
                formatTargetDate(event.startDate),
                event.category?.name,
                event.location,
              ].filter(Boolean).join(' - '),
            }));
          }
        }

        if (!cancelled) {
          setTargets(nextTargets);
          setSelectedTargetId((current: string) => {
            if (current && nextTargets.some((target) => target.id === current)) return current;
            return '';
          });
        }
      } finally {
        if (!cancelled) setIsLoadingTargets(false);
      }
    };

    loadTargets();

    return () => {
      cancelled = true;
    };
  }, [needsTargetSelector, targetType]);

  useEffect(() => {
    if (actionMode !== 'Update' || selectedTargetId) return;
    setOriginalPayload(null);
    setDirtyFields(getProposedDirtyFields(args));
    setPayload(normalizeProposalPayload(toolName, args));
  }, [actionMode, selectedTargetId, toolName, args]);

  useEffect(() => {
    if (actionMode !== 'Update' || !selectedTargetId) return;

    let cancelled = false;
    const loadSelectedTarget = async () => {
      setIsLoadingSelectedTarget(true);
      try {
        const proposedPayload = normalizeProposalPayload(toolName, args);
        let basePayload: any = null;

        if (targetType === 'Task') {
          const res = await getTodoById({ id: selectedTargetId });
          if (res.success && res.data) {
            basePayload = {
              title: res.data.title,
              description: res.data.description || '',
              priority: res.data.priority || undefined,
              status: res.data.status,
              dueDate: formatDateInput(res.data.dueDate),
              dueTime: res.data.dueTime || '',
              tags: res.data.tags || [],
            };
          }
        }

        if (targetType === 'Note') {
          const res = await getNoteById(selectedTargetId);
          if (res.success && res.data) {
            basePayload = {
              heading: res.data.heading,
              description: res.data.description,
              color: res.data.color || undefined,
              folderId: res.data.folderId || undefined,
            };
          }
        }

        if (targetType === 'Event') {
          const res = await getEventById(selectedTargetId);
          if (res.success && res.event) {
            basePayload = {
              title: res.event.title,
              description: res.event.description || '',
              location: res.event.location || '',
              isAllDay: res.event.isAllDay,
              startDate: formatDateTimeInput(res.event.startDate),
              endDate: formatDateTimeInput(res.event.endDate),
              categoryName: res.event.category?.name || undefined,
            };
          }
        }

        if (!cancelled && basePayload) {
          const proposedFields = getProposedDirtyFields(proposedPayload).filter((field) => getAllowedUpdateFields(targetType).includes(field));
          setOriginalPayload(basePayload);
          setDirtyFields(proposedFields);
          setPayload({
            ...basePayload,
            ...pickDirtyPayload(proposedPayload, proposedFields),
          });
        }
      } finally {
        if (!cancelled) setIsLoadingSelectedTarget(false);
      }
    };

    loadSelectedTarget();

    return () => {
      cancelled = true;
    };
  }, [actionMode, selectedTargetId, targetType, toolName, args]);

  const handleChange = (field: string, value: any) => {
    setPayload((prev: any) => ({ ...prev, [field]: value }));
    setDirtyFields((prev) => {
      const shouldBeDirty = !originalPayload || !valuesMatch(value, originalPayload[field]);
      if (shouldBeDirty && !prev.includes(field)) return [...prev, field];
      if (!shouldBeDirty) return prev.filter((item) => item !== field);
      return prev;
    });
  };

  const handleConfirm = async () => {
    if (needsTargetSelector && !selectedTargetId) return;

    setIsSaving(true);
    let resultMessage = "";
    try {
      const finalPayload = actionMode === 'Update'
        ? { id: selectedTargetId, ...pickDirtyPayload(payload, dirtyFields, originalPayload, allowedUpdateFields) }
        : needsTargetSelector
          ? { ...payload, id: selectedTargetId }
          : payload;

      if (toolName === 'proposeCreateTask') {
        const res = await createTodo(payload);
        if (!res.success) throw new Error(res.error?.message || "Failed to create task");
        resultMessage = `Task "${payload.title}" created successfully.`;
      } 
      else if (actionMode === 'Update' && targetType === 'Task') {
        const res = await updateTodo(finalPayload);
        if (!res.success) throw new Error(res.error?.message || "Failed to update task");
        resultMessage = `Task "${selectedTarget?.title || payload.title || 'selected task'}" updated successfully.`;
      } 
      else if (actionMode === 'Delete' && targetType === 'Task') {
        const res = await deleteTodo({ id: selectedTargetId });
        if (!res.success) throw new Error(res.error?.message || "Failed to delete task");
        resultMessage = `Task "${selectedTarget?.title || 'selected task'}" deleted successfully.`;
      } 
      else if (toolName === 'proposeCreateNote') {
        const res = await createNote(payload);
        if (!res.success) throw new Error(res.error?.message || "Failed to create note");
        resultMessage = `Note "${payload.heading}" created successfully.`;
      } 
      else if (actionMode === 'Update' && targetType === 'Note') {
        const res = await updateNote(finalPayload);
        if (!res.success) throw new Error(res.error?.message || "Failed to update note");
        resultMessage = `Note "${selectedTarget?.title || payload.heading || 'selected note'}" updated successfully.`;
      } 
      else if (actionMode === 'Delete' && targetType === 'Note') {
        const res = await deleteNote({ id: selectedTargetId, softDelete: true });
        if (!res.success) throw new Error(res.error?.message || "Failed to delete note");
        resultMessage = `Note "${selectedTarget?.title || 'selected note'}" deleted successfully.`;
      } 
      else if (toolName === 'proposeCreateEvent') {
        let categoryId = undefined;
        if (payload.categoryName) {
           const categories = await getOrCreateDefaultCategories();
           const matched = categories.find((c: any) => c.name.toLowerCase() === payload.categoryName.toLowerCase());
           if (matched) categoryId = matched.id;
        }
        const { categoryName, ...eventPayload } = payload;
        const res = await createEvent({
            ...eventPayload,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            categoryId
        });
        if (!res.success) throw new Error(res.error || "Failed to create event");
        resultMessage = `Event "${payload.title}" created successfully.`;
      } 
      else if (actionMode === 'Update' && targetType === 'Event') {
        const updateData: any = { ...finalPayload };
        if (updateData.categoryName) {
          const categories = await getOrCreateDefaultCategories();
          const matched = categories.find((c: any) => c.name.toLowerCase() === updateData.categoryName.toLowerCase());
          if (matched) updateData.categoryId = matched.id;
          delete updateData.categoryName;
        }
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
        delete updateData.id;
        const res = await updateEvent(selectedTargetId, updateData);
        if (!res.success) throw new Error(res.error || "Failed to update event");
        resultMessage = `Event "${selectedTarget?.title || payload.title || 'selected event'}" updated successfully.`;
      } 
      else if (actionMode === 'Delete' && targetType === 'Event') {
        const res = await deleteEvent(selectedTargetId);
        if (!res.success) throw new Error(res.error || "Failed to delete event");
        resultMessage = `Event "${selectedTarget?.title || 'selected event'}" deleted successfully.`;
      }
      
      onConfirm(finalPayload, resultMessage);
    } catch (e: any) {
      onCancel(`Error executing action: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Render content based on tool
  const renderTargetSelector = () => {
    if (!needsTargetSelector) return null;

    return (
      <div className="space-y-3 mb-4 rounded-md border border-border/60 bg-secondary/20 p-3">
        <div className="space-y-1">
          <Label>Action Type</Label>
          <Select disabled={status !== 'pending' || isSaving} value={targetType} onValueChange={(val) => setTargetType(val as TargetType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Task">Todo</SelectItem>
              <SelectItem value="Note">Note</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Select {targetType === 'Task' ? 'Todo' : targetType}</Label>
          <Select disabled={status !== 'pending' || isSaving || isLoadingTargets || targets.length === 0} value={selectedTargetId} onValueChange={setSelectedTargetId}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingTargets ? "Loading items..." : `Choose a ${targetType.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {targets.map((target) => (
                <SelectItem key={target.id} value={target.id}>
                  <span className="flex flex-col">
                    <span>{target.title}</span>
                    {target.subtitle && <span className="text-xs text-muted-foreground">{target.subtitle}</span>}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isLoadingTargets && targets.length === 0 && (
            <p className="text-xs text-muted-foreground">No {targetType.toLowerCase()} items available.</p>
          )}
          {isLoadingSelectedTarget && (
            <p className="text-xs text-muted-foreground">Loading current {targetType.toLowerCase()} details...</p>
          )}
          {actionMode === 'Update' && selectedTarget && originalPayload && !isLoadingSelectedTarget && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-2 text-xs">
              <p className="font-medium text-primary">Editing: {selectedTarget.title}</p>
              <p className="text-muted-foreground">Current values are loaded below. Only changed fields will be saved.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFields = () => {
    if (actionMode === 'Delete') {
      return (
        <div className="space-y-3">
          {renderTargetSelector()}
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 border border-destructive/20">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              Are you sure you want to delete {selectedTarget ? `"${selectedTarget.title}"` : `the selected ${targetType.toLowerCase()}`}?
            </span>
          </div>
        </div>
      );
    }

    if ((needsTargetSelector ? targetType === 'Task' : toolName.includes('Task'))) {
      return (
        <div className="space-y-3">
          {renderTargetSelector()}
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={payload.title || ''} onChange={(e) => handleChange('title', e.target.value)} disabled={fieldsDisabled} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={payload.description || ''} onChange={(e) => handleChange('description', e.target.value)} disabled={fieldsDisabled} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select disabled={fieldsDisabled} value={payload.priority || (actionMode === 'Create' ? 'LOW' : undefined)} onValueChange={(val) => handleChange('priority', val)}>
                <SelectTrigger><SelectValue placeholder="No change" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {actionMode === 'Update' && (
               <div className="space-y-1">
                <Label>Status</Label>
                <Select disabled={fieldsDisabled} value={payload.status} onValueChange={(val) => handleChange('status', val)}>
                  <SelectTrigger><SelectValue placeholder="Choose status" /></SelectTrigger>
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
              <Input type="date" value={payload.dueDate || ''} onChange={(e) => handleChange('dueDate', e.target.value)} disabled={fieldsDisabled} />
            </div>
            <div className="space-y-1">
              <Label>Due Time</Label>
              <Input type="time" value={payload.dueTime || ''} onChange={(e) => handleChange('dueTime', e.target.value)} disabled={fieldsDisabled} />
            </div>
          </div>
        </div>
      );
    }

    if ((needsTargetSelector ? targetType === 'Note' : toolName.includes('Note'))) {
      return (
        <div className="space-y-3">
          {renderTargetSelector()}
          <div className="space-y-1">
            <Label>Heading</Label>
            <Input value={payload.heading || ''} onChange={(e) => handleChange('heading', e.target.value)} disabled={fieldsDisabled} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea rows={4} value={payload.description || ''} onChange={(e) => handleChange('description', e.target.value)} disabled={fieldsDisabled} />
          </div>
        </div>
      );
    }

    if ((needsTargetSelector ? targetType === 'Event' : toolName.includes('Event'))) {
      return (
        <div className="space-y-3">
          {renderTargetSelector()}
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={payload.title || ''} onChange={(e) => handleChange('title', e.target.value)} disabled={fieldsDisabled} />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select disabled={fieldsDisabled} value={payload.categoryName || (actionMode === 'Create' ? 'Personal' : undefined)} onValueChange={(val) => handleChange('categoryName', val)}>
              <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
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
            <Input value={payload.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} disabled={fieldsDisabled} />
          </div>
          <div className="space-y-1">
            <Label>End Date (ISO)</Label>
            <Input value={payload.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} disabled={fieldsDisabled} />
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input value={payload.location || ''} onChange={(e) => handleChange('location', e.target.value)} disabled={fieldsDisabled} />
          </div>
          {actionMode === 'Update' && (
            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <Label>All Day</Label>
              <Switch checked={!!payload.isAllDay} onCheckedChange={(val) => handleChange('isAllDay', val)} disabled={fieldsDisabled} />
            </div>
          )}
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
          <Button size="sm" onClick={handleConfirm} disabled={isSaving || isLoadingSelectedTarget || (needsTargetSelector && !selectedTargetId) || (actionMode === 'Update' && !hasUpdateChanges)}>
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
