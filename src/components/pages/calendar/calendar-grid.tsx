"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, View, ToolbarProps, EventProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { ICalendarEvent, ICalendarGridProps, IWeatherData } from '@/types/calendar';

const localizer = momentLocalizer(moment);

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

export default function CalendarGrid({ searchQuery, initialEvents }: ICalendarGridProps) {
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState<Date>(new Date());
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

    const events: ICalendarEvent[] = initialEvents?.length > 0 ? initialEvents : [];

    const filteredEvents = React.useMemo(() => {
        if (!searchQuery) return events;
        return events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [events, searchQuery]);

    const handleNavigate = (newDate: Date) => setDate(newDate);
    const handleViewChange = (newView: View) => setView(newView);

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

        return (
            <div className="flex flex-col items-center p-1 w-full relative">
                <span className="font-semibold text-xs mb-0.5">{label}</span>
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
                    background-color: hsl(var(--primary) / 0.15) !important;
                }
                .rbc-today .rbc-date-cell {
                    font-weight: 800;
                    color: hsl(var(--primary)) !important;
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
            `}</style>
            
            <Calendar<ICalendarEvent, object>
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
                components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent,
                    month: {
                        dateHeader: CustomDateHeader
                    }
                }}
            />
        </div>
    );
}
