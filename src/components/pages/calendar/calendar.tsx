"use client";

import { useState, useEffect } from 'react';
import CalendarSidebar from './sidebar/calendar-sidebar';
import CalendarGrid from './calendar-grid';
import { SectionHeaderWrapper } from '@/components/layout/section-header-wrapper';
import { HeaderSearch } from '@/components/shared/header-search';
import { ICalendarEvent, IEvent } from '@/types/calendar';
import EventManagerDialog from './dialogs/event-manager-dialog';
import { EventCategory } from '@prisma/client';
import { getUnifiedCalendarData } from '@/server/actions/calendar-actions';

export default function CalendarDashboard({ 
    initialEvents,
    milestones = [],
    categories = []
}: { 
    initialEvents: ICalendarEvent[],
    milestones?: IEvent[],
    categories?: EventCategory[]
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([
        "todos",
        ...categories.map(c => c.id)
    ]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [events, setEvents] = useState<ICalendarEvent[]>(initialEvents);
    const [fetchedMonth, setFetchedMonth] = useState<string>(
        `${new Date().getFullYear()}-${new Date().getMonth()}`
    );

    useEffect(() => {
        const currentMonthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
        if (currentMonthKey !== fetchedMonth) {
            const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
            const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 2, 0);
            
            getUnifiedCalendarData(start, end).then((newEvents) => {
                setEvents(newEvents);
                setFetchedMonth(currentMonthKey);
            });
        }
    }, [selectedDate, fetchedMonth]);

    return (
        <div className="section-wrapper space-y-6">
            <SectionHeaderWrapper>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                                My Calendar
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                Plotting the adventures and chillin...
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <EventManagerDialog categories={categories} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <HeaderSearch 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search events, birthdays, to-dos..."
                        />
                    </div>
                </div>
            </SectionHeaderWrapper>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Sidebar */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <CalendarSidebar 
                        milestones={milestones} 
                        categories={categories} 
                        selectedCategories={selectedCategories}
                        onCategoriesChange={setSelectedCategories}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                </div>

                {/* Main Calendar Area */}
                <div className="lg:col-span-9 bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 overflow-hidden shadow-sm flex flex-col relative z-10 transition-all duration-300 h-[calc(100vh-320px)] lg:h-full">
                    <CalendarGrid 
                        searchQuery={searchQuery} 
                        initialEvents={events} 
                        selectedCategories={selectedCategories}
                        date={selectedDate}
                        onNavigate={setSelectedDate}
                    />
                </div>
            </div>
        </div>
    );
}