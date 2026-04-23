"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock, Plus, MapPin, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import { createEvent } from '@/server/actions/calendar-actions';
import { toast } from 'sonner';
import { IEventCreateInput } from '@/types/calendar';

export default function EventManagerDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [isAllDay, setIsAllDay] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const startStr = `${date}T${startTime}:00`;
            const endStr = `${date}T${endTime}:00`;

            const eventData: IEventCreateInput = {
                title,
                description,
                location,
                isAllDay,
                startDate: new Date(isAllDay ? date : startStr),
                endDate: new Date(isAllDay ? date : endStr),
            };

            const result = await createEvent(eventData);

            if (result.success) {
                toast.success("Event created successfully");
                setOpen(false);
                // Reset form
                setTitle("");
                setDescription("");
                setLocation("");
            } else {
                toast.error(result.error || "Failed to create event");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 relative overflow-hidden group">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-border/50 bg-background/80 backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background -z-10" />
                
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
                    <DialogTitle className="text-xl">Create Event</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Add Title" 
                            autoFocus
                            required
                            className="text-lg font-medium border-none shadow-none focus-visible:ring-0 px-0 rounded-none bg-transparent placeholder:text-muted-foreground/60 h-auto" 
                        />
                        <div className="h-[1px] w-full bg-border/50" />
                    </div>

                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input 
                            type="date" 
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="h-9 border-border/50 bg-secondary/30" 
                        />
                    </div>

                    {!isAllDay && (
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex items-center gap-2 flex-1">
                                <Input 
                                    type="time" 
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="h-9 border-border/50 bg-secondary/30 flex-1" 
                                />
                                <span className="text-muted-foreground text-sm">to</span>
                                <Input 
                                    type="time" 
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="h-9 border-border/50 bg-secondary/30 flex-1" 
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input 
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            placeholder="Add Location" 
                            className="h-9 border-border/50 bg-secondary/30" 
                        />
                    </div>

                    <div className="flex gap-3">
                        <AlignLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-2.5" />
                        <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Add description or notes"
                            className="flex w-full rounded-md border border-border/50 bg-secondary/30 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-1">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/20">
                            {isLoading ? "Saving..." : "Save Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
