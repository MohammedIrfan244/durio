"use client";

import React, { useMemo } from "react";
import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // "HH:mm" in 24h format
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hour, minute] = useMemo(() => {
    if (!value) return ["09", "00"];
    return value.split(":");
  }, [value]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center h-12 w-full bg-secondary/30 rounded-md border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring transition-colors px-1">
        <Clock className="absolute left-3 text-muted-foreground/70" size={18} />
        
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className="h-full border-0 bg-transparent shadow-none focus:ring-0 pl-9 pr-2 w-[100px] text-lg font-medium">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {hours.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground font-bold px-1">:</span>

        <Select value={minute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="h-full border-0 bg-transparent shadow-none focus:ring-0 px-2 w-[90px] text-lg font-medium">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
