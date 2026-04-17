"use client";

import { useState } from "react";
import { statistics } from "@/lib/logic/calculator/statistics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart as LineChartIcon } from "lucide-react";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Statistics() {
  const [inputStr, setInputStr] = useState<string>("");
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
  
  const [nStr, setNStr] = useState<string>("");
  const [rStr, setRStr] = useState<string>("");
  const [combResult, setCombResult] = useState<number | null>(null);

  const calcComb = (type: 'nCr' | 'nPr') => {
    const n = parseInt(nStr);
    const r = parseInt(rStr);
    if (isNaN(n) || isNaN(r)) {
      setCombResult(NaN);
      return;
    }
    const res = type === 'nCr' ? statistics.nCr(n, r) : statistics.nPr(n, r);
    setCombResult(res);
  };

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
      setChartData([]);
      return;
    }

    const mean = statistics.mean(data);
    const stdDev = statistics.stdDev(data);

    setResults({
      count: statistics.count(data),
      sum: statistics.sum(data),
      min: statistics.min(data),
      max: statistics.max(data),
      mean: mean,
      median: statistics.median(data),
      mode: statistics.mode(data),
      variance: statistics.variance(data),
      stdDev: stdDev
    });

    if (stdDev > 0) {
      const curveData = [];
      // Plot from -4 sigma to +4 sigma
      const step = (8 * stdDev) / 50; 
      for (let x = mean - 4 * stdDev; x <= mean + 4 * stdDev; x += step) {
        // PDF formula for normal distribution
        const exponent = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
        const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * exponent;
        curveData.push({ name: x.toFixed(1), value: density });
      }
      setChartData(curveData);
    } else {
      setChartData([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
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
            <>
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

              {chartData.length > 0 && results.stdDev > 0 && (
                <div className="mt-6 pt-4 border-t border-border/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    Normal Distribution (Bell Curve)
                  </h3>
                  <div className="h-48 w-full bg-secondary/10 rounded-xl p-2 border border-border/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(2)} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} 
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          labelStyle={{ fontWeight: 'bold' }}
                          formatter={(value: any) => [Number(value).toFixed(4), "Density"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={false}
                          activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-border/30">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              Combinatorics
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground block">Items (n)</label>
                <Input type="number" placeholder="n" value={nStr} onChange={(e) => setNStr(e.target.value)} />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground block">Select (r)</label>
                <Input type="number" placeholder="r" value={rStr} onChange={(e) => setRStr(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => calcComb('nCr')} variant="outline" className="flex-1 border-primary/20 text-primary">nCr (Combinations)</Button>
              <Button onClick={() => calcComb('nPr')} variant="outline" className="flex-1 border-primary/20 text-primary">nPr (Permutations)</Button>
            </div>
            {combResult !== null && (
              <div className="mt-4 bg-secondary/50 p-4 rounded-xl border border-border/50 flex flex-col items-center">
                <span className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Result</span>
                <span className="text-2xl font-mono font-bold text-primary">{isNaN(combResult) ? "Invalid input" : combResult.toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formula Cheat Sheet */}
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-1 h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Formula Reference
          </CardTitle>
          <CardDescription>Mathematical foundations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Mean (μ)", eq: "μ = (Σx) / n" },
            { name: "Variance (σ²)", eq: "σ² = Σ(x - μ)² / n" },
            { name: "Standard Deviation (σ)", eq: "σ = √σ²" },
            { name: "Permutations (nPr)", eq: "P(n,r) = n! / (n - r)!" },
            { name: "Combinations (nCr)", eq: "C(n,r) = n! / (r! * (n - r)!)" },
          ].map((f) => (
            <div key={f.name} className="flex flex-col p-3 rounded-lg bg-secondary/30 border border-border/50 gap-1.5 hover:bg-secondary/50 transition-colors">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{f.name}</span>
              <span className="font-mono text-sm font-semibold tracking-tight text-primary whitespace-nowrap overflow-x-auto hide-scrollbar">
                {f.eq}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}