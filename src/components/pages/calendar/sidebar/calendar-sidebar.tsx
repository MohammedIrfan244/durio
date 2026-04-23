"use client";

import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Heart, User, Briefcase, CalendarHeart, ListTodo } from 'lucide-react';
import { IStaticCategory, IEvent } from '@/types/calendar';
import { format, differenceInDays } from 'date-fns';

const STATIC_CATEGORIES: IStaticCategory[] = [
    { id: 'todos', label: 'To-Dos (Tasks)', color: 'bg-red-500', icon: ListTodo },
    { id: 'personal', label: 'Personal', color: 'bg-blue-500', icon: User },
    { id: 'work', label: 'Work', color: 'bg-green-500', icon: Briefcase },
    { id: 'birthdays', label: 'Birthdays', color: 'bg-purple-500', icon: Gift },
    { id: 'anniversaries', label: 'Anniversaries', color: 'bg-pink-500', icon: Heart },
];

export default function CalendarSidebar({ milestones = [] }: { milestones?: IEvent[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedCategories, setSelectedCategories] = useState<string[]>(STATIC_CATEGORIES.map(c => c.id));
    
    const toggleCategory = (id: string) => {
        setSelectedCategories(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const getDaysRemainingText = (eventDate: Date) => {
        const days = differenceInDays(new Date(eventDate), new Date());
        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        if (days < 7) return `In ${days} Days`;
        if (days < 14) return "Next Week";
        return format(eventDate, "MMM dd");
    };

    return (
        <div className="flex flex-col gap-6 w-full pb-8">
            {/* Mini Calendar Card */}
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-4 shadow-sm">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md flex justify-center"
                />
            </div>

            {/* Categories Filter */}
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-5 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-xs text-muted-foreground tracking-widest uppercase opacity-70">My Calendars</h3>
                <div className="flex flex-col gap-3">
                    {STATIC_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                            <div key={category.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleCategory(category.id)}>
                                <Checkbox 
                                    id={category.id} 
                                    checked={isSelected}
                                    onCheckedChange={() => toggleCategory(category.id)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`p-1 rounded-md ${category.color} bg-opacity-20`}>
                                        <Icon className={`w-3.5 h-3.5 ${category.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <label
                                        htmlFor={category.id}
                                        className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground/80 group-hover:text-foreground transition-colors"
                                    >
                                        {category.label}
                                    </label>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Upcoming Milestones Widget */}
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="font-bold text-xs text-foreground flex items-center gap-2 tracking-widest uppercase opacity-70">
                    <CalendarHeart className="w-4 h-4 text-primary" />
                    Milestones
                </h3>
                
                <div className="flex flex-col gap-3">
                    {milestones.length > 0 ? (
                        milestones.map((milestone) => (
                            <div key={milestone.id} className="bg-background/40 hover:bg-background/60 transition-colors p-3 rounded-xl border border-border/30 flex flex-col gap-1 group">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        milestone.category?.name === 'Birthdays' ? 'bg-purple-500/10 text-purple-500' : 'bg-pink-500/10 text-pink-500'
                                    }`}>
                                        {milestone.category?.name || 'Event'}
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        {getDaysRemainingText(milestone.startDate)}
                                    </span>
                                </div>
                                <p className="font-semibold text-sm mt-1 text-foreground leading-tight">{milestone.title}</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-xs text-muted-foreground italic">No upcoming milestones</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
