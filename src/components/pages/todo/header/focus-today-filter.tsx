import React from "react";
import { Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FocusOnTodayFilterProps { 
  todayMode: boolean; 
  setTodayMode: (val: boolean) => void 
}

export const FocusOnTodayFilter: React.FC<FocusOnTodayFilterProps> = ({
  todayMode,
  setTodayMode,
}) => (
  <div className="flex flex-col gap-2 group col-span-2 sm:col-span-1">
    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-300">
      <Clock className="h-3 w-3 group-hover:rotate-[1.5turn] transition-all duration-600 ease-out" />
      Today Mode
    </Label>
    <Button variant="outline" className="flex items-center gap-2 h-9 border border-border/60 bg-secondary/60 backdrop-blur-sm hover:bg-secondary/80 hover:border-primary/50 transition-all duration-300">
      <Switch id="focus-today-filter" checked={todayMode} onCheckedChange={setTodayMode} />
      <Label htmlFor="focus-today-filter" className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors duration-300 group-hover:font-bold">
        Focus on Today
      </Label>
    </Button>
  </div>
);
