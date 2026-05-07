"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, MapPin, AlignLeft, Tag, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { deleteEvent } from '@/server/actions/calendar-actions';
import { toast } from 'sonner';
import { ICalendarEvent, IEvent } from '@/types/calendar';

interface EventDetailsDialogProps {
    event: ICalendarEvent | null;
    open: boolean;
    onClose: () => void;
}

export default function EventDetailsDialog({ event, open, onClose }: EventDetailsDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!event) return null;

    const isTodo = event.type === "todo";
    const raw = event.raw as IEvent;

    const handleDelete = async () => {
        if (isTodo) {
            toast.info("Navigate to To-Dos to manage tasks");
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteEvent(event.id);
            if (result.success) {
                toast.success("Event deleted");
                onClose();
            } else {
                toast.error(result.error || "Failed to delete event");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="sm:max-w-[420px] overflow-hidden p-0 border-border/50 bg-background/80 backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background -z-10" />
                
                {/* Color accent bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: event.color }} />

                <DialogHeader className="px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span 
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ 
                                backgroundColor: `${event.color}20`, 
                                color: event.color 
                            }}
                        >
                            {isTodo ? "Task" : (raw.category?.name || "Event")}
                        </span>
                    </div>
                    <DialogTitle className="text-xl leading-tight">{event.title}</DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-5 flex flex-col gap-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">
                            {format(new Date(event.start), "EEEE, MMMM d, yyyy")}
                        </span>
                    </div>

                    {!event.isAllDay && (
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground">
                                {format(new Date(event.start), "h:mm a")} — {format(new Date(event.end), "h:mm a")}
                            </span>
                        </div>
                    )}

                    {/* Location */}
                    {!isTodo && raw.location && (
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground">{raw.location}</span>
                        </div>
                    )}

                    {/* Category */}
                    {!isTodo && raw.category && (
                        <div className="flex items-center gap-3">
                            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full" 
                                    style={{ backgroundColor: raw.category.color }} 
                                />
                                <span className="text-sm text-foreground">{raw.category.name}</span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {!isTodo && raw.description && (
                        <div className="flex gap-3">
                            <AlignLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{raw.description}</p>
                        </div>
                    )}

                    {/* Todo status indicator */}
                    {isTodo && (
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground">
                                Status: <span className="font-medium capitalize">{"status" in event.raw ? String(event.raw.status).toLowerCase() : "pending"}</span>
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-1">
                        <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
                        {!isTodo && (
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
