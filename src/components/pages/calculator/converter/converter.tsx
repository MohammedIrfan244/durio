"use client";

import { useState } from "react";
import { converter } from "@/lib/logic/calculator/converter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

type ConverterType = "currency" | "length" | "mass" | "time" | "temperature";

export default function Converter() {
  const [type, setType] = useState<ConverterType>("length");
  const [value, setValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("cm");
  const [result, setResult] = useState<number | null>(null);

  const handleTypeChange = (newType: ConverterType) => {
    setType(newType);
    setResult(null);
    if (newType === "currency") {
      setFromUnit("USD"); setToUnit("INR");
    } else {
      setFromUnit(converter.units[newType][0]);
      setToUnit(converter.units[newType][1]);
    }
  };

  const getUnits = () => {
    if (type === "currency") return ["USD", "INR", "EUR"];
    return converter.units[type];
  };

  const run = () => {
    if (!value) return;
    const num = Number(value);
    
    switch (type) {
      case "length": setResult(converter.length(num, fromUnit, toUnit)); break;
      case "mass": setResult(converter.mass(num, fromUnit, toUnit)); break;
      case "time": setResult(converter.time(num, fromUnit, toUnit)); break;
      case "temperature": setResult(converter.temperature(num, fromUnit, toUnit)); break;
      case "currency": setResult(converter.currency(num, fromUnit, toUnit)); break;
    }
  };

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Converter
        </CardTitle>
        <CardDescription>Convert between common measurement units.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={type} onValueChange={(val: ConverterType) => handleTypeChange(val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="length">Length</SelectItem>
            <SelectItem value="mass">Mass / Weight</SelectItem>
            <SelectItem value="time">Time</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="currency">Currency</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
            <SelectContent>
              {getUnits().map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
            <SelectContent>
              {getUnits().map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Input 
            className="font-mono text-lg"
            type="number" 
            placeholder={`Value in ${fromUnit}`} 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={run} variant="secondary" className="w-full gap-2 font-bold shadow-sm">
            Convert
          </Button>
        </div>

        <div className="rounded-md bg-secondary/50 p-4 border border-border/50 text-center min-h-[4rem] flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Result ({toUnit})</span>
          <span className="text-2xl font-mono font-bold tracking-tight text-primary">
            {result !== null ? result.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
