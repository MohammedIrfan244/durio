"use client";

import { useState } from "react";
import { calculate } from "@/lib/logic/calculator/basic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const keys = [
  "MC", "MR", "M+", "M-", "C",
  "sin(", "cos(", "tan(", "AC", "%",
  "log(", "ln(", "sqrt(", "(", ")",
  "fact(", "PI", "E", "/", "*",
  "7", "8", "9", "-", "^",
  "4", "5", "6", "+", "=",
  "1", "2", "3", "0", "."
];

export default function Scientific() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("rad");
  const [memory, setMemory] = useState<number>(0);

  const getCurrentVal = () => {
    if (result !== null) return result;
    try {
      const res = calculate(input || "0", { angleMode });
      return isNaN(res) ? 0 : res;
    } catch {
      return 0;
    }
  };

  const handleKeyClick = (key: string) => {
    if (key === "=") {
      run();
    } else if (key === "C") {
      setInput((prev) => prev.slice(0, -1));
      setError(null);
    } else if (key === "AC") {
      setInput("");
      setResult(null);
      setError(null);
    } else if (key === "MC") {
      setMemory(0);
    } else if (key === "MR") {
      setInput((prev) => prev + memory.toString());
    } else if (key === "M+") {
      setMemory(prev => prev + getCurrentVal());
    } else if (key === "M-") {
      setMemory(prev => prev - getCurrentVal());
    } else {
      setInput((prev) => prev + key);
      setError(null);
    }
  };

  const run = () => {
    try {
      if (!input) return;
      setError(null);
      const res = calculate(input, { angleMode });
      if (isNaN(res)) throw new Error("Invalid");
      setResult(res);
    } catch (e) {
      setResult(null);
      setError("Error");
    }
  };

  const constants = [
    { symbol: "c", name: "Speed of Light", value: "299792458", unit: "m/s" },
    { symbol: "G", name: "Gravitational Constant", value: "6.6743e-11", unit: "m³/kg·s²" },
    { symbol: "h", name: "Planck Constant", value: "6.62607015e-34", unit: "J·s" },
    { symbol: "Na", name: "Avogadro's Number", value: "6.02214076e23", unit: "mol⁻¹" },
    { symbol: "k", name: "Boltzmann Constant", value: "1.380649e-23", unit: "J/K" },
    { symbol: "g", name: "Earth Gravity", value: "9.80665", unit: "m/s²" },
    { symbol: "e", name: "Elementary Charge", value: "1.602176634e-19", unit: "C" },
    { symbol: "me", name: "Electron Mass", value: "9.1093837e-31", unit: "kg" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-2">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Scientific
            </CardTitle>
            <CardDescription>Advanced mathematical expressions and functions.</CardDescription>
          </div>
          <div className="flex bg-secondary/50 p-1 rounded-md border text-xs font-semibold">
            <button 
              type="button"
              className={cn("px-3 py-1 rounded transition-colors", angleMode === "rad" ? "bg-background shadow-sm" : "text-muted-foreground")}
              onClick={() => setAngleMode("rad")}
            >
              RAD
            </button>
            <button 
              type="button"
              className={cn("px-3 py-1 rounded transition-colors", angleMode === "deg" ? "bg-background shadow-sm" : "text-muted-foreground")}
              onClick={() => setAngleMode("deg")}
            >
              DEG
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Display */}
          <div className={cn(
            "rounded-md bg-secondary/50 p-4 border flex flex-col justify-end text-right min-h-[6rem] relative",
            error ? "border-destructive text-destructive" : "border-border/50 text-foreground"
          )}>
            {memory !== 0 && (
              <div className="absolute top-2 left-3 text-xs font-bold text-primary flex items-center gap-1">
                <span className="opacity-70 bg-primary/10 px-1.5 py-0.5 rounded">M</span> {memory}
              </div>
            )}
            <div className="text-sm opacity-70 h-5 mb-1 overflow-hidden tracking-wider">{input || "0"}</div>
            <div className="text-4xl font-mono font-bold tracking-tight">
              {error ? "Error" : result !== null ? result : "0"}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-5 gap-2">
            {keys.map((key, i) => (
              <Button
                key={`${key}-${i}`}
                variant={["/", "*", "-", "+", "=", "^", "%"].includes(key) ? "default" : ["C", "AC"].includes(key) ? "destructive" : ["MC", "MR", "M+", "M-"].includes(key) ? "outline" : "secondary"}
                className={cn("h-12 font-semibold shadow-sm")}
                onClick={() => handleKeyClick(key)}
              >
                {key}
              </Button>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* Constants Directory */}
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-1 h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Physical Constants
          </CardTitle>
          <CardDescription>Click to insert value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {constants.map((constant) => (
            <button
              key={constant.symbol}
              onClick={() => handleKeyClick(constant.value)}
              className="w-full text-left bg-secondary/30 hover:bg-secondary border border-border/50 rounded-lg p-3 transition-colors flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{constant.name}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{constant.unit}</span>
              </div>
              <div className="font-mono font-bold text-primary text-sm bg-primary/10 px-2 py-1 rounded">
                {constant.symbol}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}