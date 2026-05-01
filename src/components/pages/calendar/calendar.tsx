"use client";

import { useState } from 'react';
import CalendarSidebar from './sidebar/calendar-sidebar';
import CalendarGrid from './calendar-grid';
import { SectionHeaderWrapper } from '@/components/layout/section-header-wrapper';
import { HeaderSearch } from '@/components/shared/header-search';
import { ICalendarEvent, IEvent } from '@/types/calendar';
import EventManagerDialog from './dialogs/event-manager-dialog';

export default function CalendarDashboard({ 
    initialEvents,
    milestones = []
}: { 
    initialEvents: ICalendarEvent[],
    milestones?: IEvent[]
}) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="section-wrapper space-y-6">
            <SectionHeaderWrapper>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                                My Calendar
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                Plotting the adventures and chillin...
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <EventManagerDialog />
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
                    <CalendarSidebar milestones={milestones} />
                </div>

                {/* Main Calendar Area */}
                <div className="lg:col-span-9 bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 overflow-hidden shadow-sm flex flex-col relative z-10 transition-all duration-300 h-[calc(100vh-320px)] lg:h-full">
                    <CalendarGrid searchQuery={searchQuery} initialEvents={initialEvents} />
                </div>
            </div>
        </div>
    );
}