"use client";

import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BasicCalculator from "@/components/pages/calculator/basic/basic";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FloatingCalculator() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut (Alt + C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt + C (or Option + C on Mac)
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 bg-primary/90 backdrop-blur-sm"
                >
                  <Calculator className="h-6 w-6 text-primary-foreground" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="left" className="mr-2">
              <p>Quick Calculator (Alt + C)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <PopoverContent 
          side="top" 
          align="end" 
          sideOffset={16}
          className="p-0 border-none shadow-2xl bg-transparent w-80"
        >
          <BasicCalculator />
        </PopoverContent>
      </Popover>
    </div>
  );
}
