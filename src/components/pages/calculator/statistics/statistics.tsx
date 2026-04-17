"use client";

import { useState } from "react";
import { statistics } from "@/lib/logic/calculator/statistics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart } from "lucide-react";

export default function Statistics() {
  const [inputStr, setInputStr] = useState<string>("");
  
  const [results, setResults] = useState<{
    count: number;
    sum: number;
    min: number;
    max: number;
    mean: number;
    median: number;
    mode: number[];
    variance: number;
    stdDev: number;
  } | null>(null);

  const run = () => {
    // Parse comma or space separated numbers
    const data = inputStr
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter((s) => s.trim() !== "")
      .map((s) => Number(s))
      .filter((n) => !isNaN(n));

    if (data.length === 0) {
      setResults(null);
      return;
    }

    setResults({
      count: statistics.count(data),
      sum: statistics.sum(data),
      min: statistics.min(data),
      max: statistics.max(data),
      mean: statistics.mean(data),
      median: statistics.median(data),
      mode: statistics.mode(data),
      variance: statistics.variance(data),
      stdDev: statistics.stdDev(data)
    });
  };

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          Statistics
        </CardTitle>
        <CardDescription>Analyze datasets and distributions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider block">Data Input (comma separated)</label>
          <Input 
            className="font-mono text-sm"
            placeholder="e.g. 5, 8, 12, 5, 2" 
            value={inputStr} 
            onChange={(e) => setInputStr(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={run} variant="secondary" className="w-full gap-2 font-bold shadow-sm">
            Calculate Stats
          </Button>
        </div>

        {results && (
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm bg-secondary/30 p-3 rounded border border-border/50">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-semibold">Count</span>
              <span className="font-mono font-bold">{results.count}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-semibold">Sum</span>
              <span className="font-mono font-bold">{results.sum.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-muted-foreground text-xs font-semibold">Min</span>
              <span className="font-mono font-bold">{results.min.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-muted-foreground text-xs font-semibold">Max</span>
              <span className="font-mono font-bold">{results.max.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-muted-foreground text-xs font-semibold">Mean</span>
              <span className="font-mono font-bold">{results.mean.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-muted-foreground text-xs font-semibold">Median</span>
              <span className="font-mono font-bold">{results.median.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-muted-foreground text-xs font-semibold">Mode</span>
              <span className="font-mono font-bold">{results.mode.length > 0 ? results.mode.join(", ") : "None"}</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-muted-foreground text-xs font-semibold">Std Dev (Var)</span>
              <span className="font-mono font-bold">{results.stdDev.toLocaleString(undefined, { maximumFractionDigits: 3 })} ({results.variance.toLocaleString(undefined, { maximumFractionDigits: 3 })})</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}