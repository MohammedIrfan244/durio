"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, View, ToolbarProps, EventProps } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Button } from '@/components/ui/button';
import { ICalendarEvent, IWeatherData, IEvent } from '@/types/calendar';

export interface ICalendarGridProps {
    searchQuery?: string;
    initialEvents?: ICalendarEvent[];
    selectedCategories: string[];
    date: Date;
    onNavigate: (date: Date) => void;
}
import EventDetailsDialog from './dialogs/event-details-dialog';
import { rescheduleCalendarItem } from '@/server/actions/calendar-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<ICalendarEvent>(Calendar);

// Simple weather code to emoji mapping for Open-Meteo
const getWeatherEmoji = (code: number): string => {
    if (code === 0) return '☀️'; // Clear
    if (code === 1 || code === 2 || code === 3) return '⛅'; // Partly cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 67) return '🌧️'; // Drizzle/Rain
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code >= 80 && code <= 82) return '🌦️'; // Showers
    if (code >= 95) return '⛈️'; // Thunderstorm
    return '☁️';
};

export default function CalendarGrid({ 
    searchQuery, 
    initialEvents, 
    selectedCategories,
    date,
    onNavigate
}: ICalendarGridProps) {
    const [view, setView] = useState<View>(Views.MONTH);
    const [weather, setWeather] = useState<IWeatherData>({});

    // Fetch weather data for the next 7 days
    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
                const data = await res.json();
                if (data && data.daily) {
                    const newWeather: IWeatherData = {};
                    data.daily.time.forEach((t: string, idx: number) => {
                        newWeather[t] = {
                            max: Math.round(data.daily.temperature_2m_max[idx]),
                            min: Math.round(data.daily.temperature_2m_min[idx]),
                            code: data.daily.weather_code[idx]
                        };
                    });
                    setWeather(newWeather);
                }
            } catch (err) {
                console.error("Failed to fetch weather", err);
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather(51.5074, -0.1278) // Fallback
            );
        } else {
            fetchWeather(51.5074, -0.1278);
        }
    }, [date]);

    const events: ICalendarEvent[] = initialEvents ?? [];

    const filteredEvents = React.useMemo(() => {
        let result = events;

        // 1. Filter by category
        result = result.filter(e => {
            if (e.type === 'todo') return selectedCategories.includes('todos');
            if (e.type === 'event') {
                const catId = (e.raw as IEvent).categoryId;
                return !catId || selectedCategories.includes(catId);
            }
            return true;
        });

        // 2. Filter by search query
        if (!searchQuery) return result;
        const q = searchQuery.toLowerCase();
        return result.filter(e => {
            if (e.title.toLowerCase().includes(q)) return true;
            if (e.raw && "description" in e.raw) {
                const desc = (e.raw as { description?: string | null }).description;
                if (desc && desc.toLowerCase().includes(q)) return true;
            }
            return false;
        });
    }, [events, searchQuery, selectedCategories]);

    const handleNavigate = (newDate: Date) => onNavigate(newDate);
    const handleViewChange = (newView: View) => setView(newView);

    // Event details dialog state
    const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleSelectEvent = (event: ICalendarEvent) => {
        setSelectedEvent(event);
        setDetailsOpen(true);
    };

    // Drag-to-reschedule handler
    const handleEventDrop = useCallback(async ({ event, start, end }: EventInteractionArgs<ICalendarEvent>) => {
        const newStart = start instanceof Date ? start : new Date(start);
        const newEnd = end instanceof Date ? end : new Date(end);
        
        const result = await rescheduleCalendarItem(event.id, event.type, newStart, newEnd);
        if (result.success) {
            toast.success(`"${event.title}" rescheduled`);
        } else {
            toast.error(result.error || "Failed to reschedule");
        }
    }, []);

    // Custom Toolbar to match sleek design
    const CustomToolbar = (toolbar: ToolbarProps<ICalendarEvent, object>) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };
        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };
        const goToCurrent = () => {
            toolbar.onNavigate('TODAY');
        };

        const labelContent = () => {
            const date = moment(toolbar.date);
            return (
                <span className="text-lg font-semibold text-foreground">
                    {date.format('MMMM')} <span className="text-muted-foreground font-medium">{date.format('YYYY')}</span>
                </span>
            );
        };

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border/40 gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToCurrent} className="rounded-full h-8 px-4 font-medium text-xs">Today</Button>
                    <div className="flex items-center bg-secondary/50 rounded-full border border-border/50 overflow-hidden">
                        <button onClick={goToBack} className="px-3 py-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm">Prev</button>
                        <div className="w-[1px] h-4 bg-border/50"></div>
                        <button onClick={goToNext} className="px-3 py-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm">Next</button>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">{labelContent()}</div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-secondary/50 rounded-full p-1 border border-border/50">
                        {(['month', 'week', 'day', 'agenda'] as View[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => toolbar.onView(v)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${toolbar.view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Custom Event component to render Todos vs Events differently
    const CustomEvent = ({ event }: EventProps<ICalendarEvent>) => {
        const isTodo = event.type === 'todo';
        return (
            <div 
                className="w-full h-full text-xs font-medium px-1.5 py-0.5 truncate rounded overflow-hidden"
                style={{ 
                    backgroundColor: `${event.color}20`,
                    color: event.color,
                    borderLeft: `3px solid ${event.color}`
                }}
            >
                {isTodo ? (
                    <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm border-[1.5px] border-current opacity-70"></div>
                        <span className="truncate">{event.title}</span>
                    </div>
                ) : (
                    <span>{event.title}</span>
                )}
            </div>
        );
    };

    const CustomDateHeader = ({ date: headerDate, label }: { date: Date; label: string }) => {
        const dateStr = moment(headerDate).format("YYYY-MM-DD");
        const w = weather[dateStr];
        const isToday = moment(headerDate).isSame(moment(), 'day');

        return (
            <div className="flex flex-col items-center p-1 w-full relative">
                <span className={cn(
                    "font-semibold text-xs mb-0.5 flex items-center justify-center transition-all duration-300",
                    isToday ? "bg-primary text-primary-foreground w-6 h-6 rounded-full shadow-lg shadow-primary/40 scale-110" : "text-foreground"
                )}>
                    {label}
                </span>
                {w && (
                    <div className="flex items-center gap-1 text-[0.65rem] text-muted-foreground/80 mt-0.5 absolute right-1">
                        <span className="text-sm shadow-sm">{getWeatherEmoji(w.code)}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col w-full absolute inset-0 pb-16">
            <style jsx global>{`
                .rbc-calendar {
                    font-family: inherit;
                    color: inherit;
                    min-height: 500px;
                }
                .rbc-header {
                    padding: 12px 0;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.70rem;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid hsl(var(--border) / 0.4) !important;
                    color: hsl(var(--muted-foreground));
                }
                .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
                    border: none;
                    border-radius: 0;
                }
                .rbc-day-bg {
                    border-color: hsl(var(--border) / 0.2);
                    transition: background-color 0.2s ease;
                }
                .rbc-day-bg:hover {
                    background-color: hsl(var(--secondary) / 0.3);
                }
                .rbc-today {
                    background-color: hsl(var(--primary) / 0.08) !important;
                    position: relative;
                }
                .rbc-day-bg.rbc-today {
                    box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.05);
                }
                .rbc-today .rbc-button-link {
                    color: inherit !important;
                }
                .rbc-event {
                    background: transparent;
                    padding: 2px 4px;
                }
                .rbc-event-content {
                    font-size: 0.75rem;
                }
                .rbc-off-range-bg {
                    background-color: hsl(var(--secondary) / 0.1);
                }
                .rbc-date-cell {
                    padding: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .rbc-addons-dnd .rbc-addons-dnd-row-body {
                    position: relative;
                }
                .rbc-addons-dnd .rbc-addons-dnd-drag-row {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                }
                .rbc-addons-dnd-dragged-event {
                    opacity: 0.4;
                }
            `}</style>
            
            <DnDCalendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', width: '100%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                view={view}
                date={date}
                onView={handleViewChange}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                resizable
                draggableAccessor={() => true}
                components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent,
                    month: {
                        dateHeader: CustomDateHeader
                    }
                }}
            />

            <EventDetailsDialog 
                event={selectedEvent} 
                open={detailsOpen} 
                onClose={() => { setDetailsOpen(false); setSelectedEvent(null); }} 
            />
        </div>
    );
}
