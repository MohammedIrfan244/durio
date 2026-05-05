"use client";

import { useState } from "react";
import { business } from "@/lib/logic/calculator/business";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";

type BusinessMode = "simple" | "compound" | "emi" | "roi";

export default function Business() {
  const [mode, setMode] = useState<BusinessMode>("emi");
  
  // Inputs
  const [val1, setVal1] = useState<string>(""); // Principal / Investment
  const [val2, setVal2] = useState<string>(""); // Rate / Final Value
  const [val3, setVal3] = useState<string>(""); // Time
  
  const [result, setResult] = useState<number | null>(null);

  const run = () => {
    const p = Number(val1);
    const r = Number(val2);
    const t = Number(val3);

    switch (mode) {
      case "simple":
        setResult(business.simpleInterest(p, r, t));
        break;
      case "compound":
        setResult(business.compoundInterest(p, r, t)); // defaults to yearly compounding
        break;
      case "emi":
        setResult(business.emi(p, r, t));
        break;
      case "roi":
        setResult(business.roi(p, r)); // p = initial, r = final
        break;
    }
  };

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 group cursor-pointer">
          <Briefcase className="h-5 w-5 text-primary transition-transform group-hover:rotate-12 group-hover:scale-110" />
          Business & Financial
        </CardTitle>
        <CardDescription>Loans, interest, and investment analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Select value={mode} onValueChange={(val: BusinessMode) => { setMode(val); setResult(null); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emi">Loan EMI</SelectItem>
              <SelectItem value="simple">Simple Interest</SelectItem>
              <SelectItem value="compound">Compound Interest</SelectItem>
              <SelectItem value="roi">Return on Investment (ROI)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider block">
            {mode === "roi" ? "Initial Investment" : "Principal Amount"}
          </label>
          <Input 
            className="font-mono text-lg"
            type="number" 
            placeholder="0" 
            value={val1} 
            onChange={(e) => setVal1(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              {mode === "roi" ? "Final Value" : "Rate (%)"}
            </label>
            <Input 
              className="font-mono text-lg"
              type="number" 
              placeholder="0" 
              value={val2} 
              onChange={(e) => setVal2(e.target.value)} 
            />
          </div>
          {mode !== "roi" && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                {mode === "emi" ? "Months" : "Years"}
              </label>
              <Input 
                className="font-mono text-lg"
                type="number" 
                placeholder="0" 
                value={val3} 
                onChange={(e) => setVal3(e.target.value)} 
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={run} variant="secondary" className="w-full gap-2 font-bold shadow-sm">
            Calculate
          </Button>
        </div>

        <div className="rounded-md bg-secondary/50 p-4 border border-border/50 text-center min-h-[4rem] flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Result</span>
          <span className="text-2xl font-mono font-bold tracking-tight text-primary">
            {result !== null ? result.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "—"}
            {mode === "roi" && result !== null ? "%" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}