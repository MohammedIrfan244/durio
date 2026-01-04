"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Paintbrush, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const PREDEFINED_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Safe hex value for input
  const safeValue = value || "";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal pl-3",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 w-full">
             <div 
               className="h-4 w-4 rounded-full border border-muted-foreground/20"
               style={{ backgroundColor: value || "transparent" }}
             />
             <span className="flex-1 truncate">
               {value ? value : "Pick a color"}
             </span>
             <Paintbrush className="h-4 w-4 opacity-50 ml-auto" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1.5">
             <div className="font-medium text-xs text-muted-foreground mb-2">Preset Colors</div>
             <div className="grid grid-cols-5 gap-2">
               {PREDEFINED_COLORS.map((color) => (
                 <button
                   key={color}
                   type="button"
                   className={cn(
                     "h-8 w-8 rounded-full border border-muted-foreground/20 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                     value === color && "ring-2 ring-primary ring-offset-2 scale-105"
                   )}
                   style={{ backgroundColor: color }}
                   onClick={() => {
                     onChange(color);
                     // keep open for tweaking or close? User might usually just pick one. 
                     // Let's keep it user controlled or I can close.
                     // I'll leave it open so they can verify.
                   }}
                 >
                   {value === color && (
                     <Check className="h-4 w-4 text-white mx-auto drop-shadow-md" />
                   )}
                 </button>
               ))}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "h-8 w-8 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center transition-all hover:border-primary hover:text-primary",
                          !value && "border-primary text-primary"
                        )}
                        onClick={() => onChange("")}
                      >
                        <div className="h-0.5 w-full bg-destructive rotate-45 transform scale-x-75 origin-center" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear color</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
             </div>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-2">
             <div className="font-medium text-xs text-muted-foreground">Custom Hex</div>
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <div 
                    className="absolute left-2 top-2.5 h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: value || "transparent" }} 
                 />
                 <Input 
                   value={safeValue}
                   onChange={(e) => onChange(e.target.value)}
                   className="pl-8 h-9 font-mono uppercase"
                   placeholder="#000000"
                   maxLength={9}
                 />
               </div>
               {/* Native picker for good measure if they want gradients or wheels (native picker supports that usually) */}
               <div className="relative h-9 w-9 overflow-hidden rounded-md border border-input shadow-sm">
                 <input 
                   type="color" 
                   value={value?.startsWith("#") && value.length === 7 ? value : "#000000"}
                   onChange={(e) => onChange(e.target.value)}
                   className="absolute -top-2 -left-2 h-16 w-16 p-0 border-0 cursor-pointer"
                 />
               </div>
             </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
