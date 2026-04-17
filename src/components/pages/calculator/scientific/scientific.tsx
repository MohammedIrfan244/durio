"use client";

import { useState } from "react";
import { calculate } from "@/lib/logic/calculator/basic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const keys = [
  "sin(", "cos(", "tan(", "C", "AC",
  "log(", "ln(", "sqrt(", "(", ")",
  "fact(", "PI", "E", "/", "*",
  "7", "8", "9", "-", "^",
  "4", "5", "6", "+", "%",
  "1", "2", "3", ".", "=",
  "0"
];

export default function Scientific() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("rad");

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

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 md:col-span-2">
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
          "rounded-md bg-secondary/50 p-4 border flex flex-col justify-end text-right min-h-[6rem]",
          error ? "border-destructive text-destructive" : "border-border/50 text-foreground"
        )}>
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
              variant={["/", "*", "-", "+", "=", "^", "%"].includes(key) ? "default" : ["C", "AC"].includes(key) ? "destructive" : "secondary"}
              className={cn(
                "h-12 font-semibold shadow-sm",
                key === "0" ? "col-span-4" : ""
              )}
              onClick={() => handleKeyClick(key)}
            >
              {key}
            </Button>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}