"use client";

import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarHeart, ListTodo, Tag } from 'lucide-react';
import { IEvent } from '@/types/calendar';
import { EventCategory } from '@prisma/client';
import { format, differenceInDays } from 'date-fns';
import CalendarWeatherWidget from './calendar-weather-widget';
import CustomMiniCalendar from './custom-mini-calendar';

export default function CalendarSidebar({ 
    milestones = [], 
    categories = [],
    selectedCategories,
    onCategoriesChange,
    selectedDate,
    onDateSelect
}: { 
    milestones?: IEvent[];
    categories?: EventCategory[];
    selectedCategories: string[];
    onCategoriesChange: (ids: string[]) => void;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}) {
    const toggleCategory = (id: string) => {
        onCategoriesChange(
            selectedCategories.includes(id) 
                ? selectedCategories.filter(c => c !== id) 
                : [...selectedCategories, id]
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
            {/* Weather Widget */}
            <CalendarWeatherWidget />

            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-4 shadow-sm">
                <CustomMiniCalendar
                    value={selectedDate}
                    onChange={onDateSelect}
                />
            </div>

            {/* Categories Filter — Dynamic from DB */}
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-5 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-xs text-muted-foreground tracking-widest uppercase opacity-70">My Calendars</h3>
                <div className="flex flex-col gap-3">
                    {/* To-Dos (always present, not a DB category) */}
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleCategory("todos")}>
                        <Checkbox 
                            id="todos" 
                            checked={selectedCategories.includes("todos")}
                            onCheckedChange={() => toggleCategory("todos")}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex items-center gap-2 flex-1">
                            <div className="p-1 rounded-md bg-red-500 bg-opacity-20">
                                <ListTodo className="w-3.5 h-3.5 text-red-500" />
                            </div>
                            <label htmlFor="todos" className="text-sm font-semibold leading-none cursor-pointer text-foreground/80 group-hover:text-foreground transition-colors">
                                To-Dos (Tasks)
                            </label>
                        </div>
                    </div>

                    {/* Dynamic DB Categories */}
                    {categories.map((category) => {
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
                                    <div className="p-1 rounded-md" style={{ backgroundColor: `${category.color}20` }}>
                                        <Tag className="w-3.5 h-3.5" style={{ color: category.color }} />
                                    </div>
                                    <label
                                        htmlFor={category.id}
                                        className="text-sm font-semibold leading-none cursor-pointer text-foreground/80 group-hover:text-foreground transition-colors"
                                    >
                                        {category.name}
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
