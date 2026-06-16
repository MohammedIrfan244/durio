"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, setMonth, setYear } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface CustomMiniCalendarProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function CustomMiniCalendar({ value, onChange }: CustomMiniCalendarProps) {
  const [viewDate, setViewDate] = useState(value || new Date());
  const [yearInput, setYearInput] = useState(format(viewDate, "yyyy"));

  useEffect(() => {
    setYearInput(format(viewDate, "yyyy"));
  }, [viewDate]);

  const nextMonth = () => setViewDate(addMonths(viewDate, 1));
  const prevMonth = () => setViewDate(subMonths(viewDate, 1));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 101 }, (_, i) => (new Date().getFullYear() - 50 + i).toString());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-3 border-b border-border/30 mb-2">
        <div className="flex items-center gap-1">
          {/* Month Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors focus:outline-none">
                {format(viewDate, "MMMM")}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start">
              <ScrollArea className="h-48">
                <div className="flex flex-col">
                  {months.map((m, idx) => (
                    <button
                      key={m}
                      onClick={() => setViewDate(setMonth(viewDate, idx))}
                      className={cn(
                        "text-left px-3 py-1.5 text-xs rounded-md transition-colors",
                        idx === viewDate.getMonth() ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Year Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none ml-1">
                {format(viewDate, "yyyy")}
                <ChevronDown className="w-3 h-3 opacity-30" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-3" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quick Year</label>
                  <Input 
                    value={yearInput}
                    onChange={(e) => {
                        setYearInput(e.target.value);
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 1000 && val < 9999) {
                            setViewDate(setYear(viewDate, val));
                        }
                    }}
                    className="h-8 text-xs font-mono"
                    placeholder="Enter year..."
                  />
                </div>
                <div className="w-full h-[1px] bg-border/40" />
                <ScrollArea className="h-32">
                    <div className="flex flex-col">
                        {years.map(y => (
                            <button
                                key={y}
                                onClick={() => setViewDate(setYear(viewDate, parseInt(y)))}
                                className={cn(
                                    "text-left px-3 py-1.5 text-xs rounded-md transition-colors",
                                    y === format(viewDate, "yyyy") ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                                )}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase opacity-50">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isToday = isSameDay(currentDay, new Date());
        const isSelected = isSameDay(currentDay, value);

        days.push(
          <button
            key={day.toString()}
            onClick={() => {
                onChange(currentDay);
                if (!isCurrentMonth) setViewDate(currentDay);
            }}
            className={cn(
              "relative flex items-center justify-center h-8 w-8 text-xs rounded-lg transition-all duration-200 focus:outline-none group",
              !isCurrentMonth && "text-muted-foreground/30",
              isSelected && "bg-primary text-primary-foreground shadow-md shadow-primary/30 font-bold",
              !isSelected && isCurrentMonth && "hover:bg-secondary/80",
              isToday && !isSelected && "border border-primary/50 text-primary font-bold"
            )}
          >
            {format(day, "d")}
            {isToday && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="pb-2">{rows}</div>;
  };

  return (
    <div className="w-full select-none">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      <div className="border-t border-border/30 pt-3 mt-1 flex justify-between items-center">
        <button 
          onClick={() => {
            const today = new Date();
            setViewDate(today);
            onChange(today);
          }}
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <CalendarIcon className="w-3 h-3" />
          Jump to Today
        </button>
        <span className="text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
            {format(viewDate, "MMM yy")}
        </span>
      </div>
    </div>
  );
}
