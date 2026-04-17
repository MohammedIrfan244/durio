"use client";

import { useState } from "react";
import { percentage } from "@/lib/logic/calculator/percentage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Percent } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PercentMode = "percentOf" | "addPercent" | "subtractPercent" | "percentIsOf";

export default function Percentage() {
  const [mode, setMode] = useState<PercentMode>("percentOf");
  const [val1, setVal1] = useState<string>("");
  const [val2, setVal2] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  const run = () => {
    const num1 = Number(val1);
    const num2 = Number(val2);
    if (isNaN(num1) || isNaN(num2)) return;

    switch (mode) {
      case "percentOf":
        setResult(percentage.percentOf(num1, num2));
        break;
      case "addPercent":
        setResult(percentage.addPercent(num2, num1));
        break;
      case "subtractPercent":
        setResult(percentage.subtractPercent(num2, num1));
        break;
      case "percentIsOf":
        setResult(percentage.percentIsOf(num1, num2));
        break;
    }
  };

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Percentage
        </CardTitle>
        <CardDescription>Calculate tips, discounts, and portions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Select value={mode} onValueChange={(val: PercentMode) => setMode(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select calculation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentOf">What is X% of Y?</SelectItem>
              <SelectItem value="addPercent">Y + X% (e.g. tip)</SelectItem>
              <SelectItem value="subtractPercent">Y - X% (e.g. discount)</SelectItem>
              <SelectItem value="percentIsOf">X is what % of Y?</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Value X</label>
            <Input 
              className="font-mono text-lg"
              type="number" 
              placeholder="0" 
              value={val1} 
              onChange={(e) => setVal1(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Value Y</label>
            <Input 
              className="font-mono text-lg"
              type="number" 
              placeholder="0" 
              value={val2} 
              onChange={(e) => setVal2(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={run} variant="secondary" className="w-full gap-2 font-bold shadow-sm">
            Calculate
          </Button>
        </div>

        <div className="rounded-md bg-secondary/50 p-4 border border-border/50 text-center min-h-[4rem] flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Result</span>
          <span className="text-2xl font-mono font-bold tracking-tight text-primary">
            {result !== null ? result.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "—"}{mode === "percentIsOf" && result !== null ? "%" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}