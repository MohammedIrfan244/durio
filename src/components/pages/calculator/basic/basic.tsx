"use client";

import { useState } from "react";
import { calculate } from "@/lib/logic/calculator/basic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const keys = [
  "C", "(", ")", "/",
  "7", "8", "9", "*",
  "4", "5", "6", "-",
  "1", "2", "3", "+",
  "0", ".", "AC", "="
];

export default function Basic() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const res = calculate(input);
      if (isNaN(res)) {
        throw new Error("Invalid calculation");
      }
      setResult(res);
    } catch (e) {
      setResult(null);
      setError("Error");
    }
  };

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Basic
        </CardTitle>
        <CardDescription>Grid keypad calculator.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Display */}
        <div className={cn(
          "rounded-md bg-secondary/50 p-4 border flex flex-col justify-end text-right min-h-[5rem]",
          error ? "border-destructive text-destructive" : "border-border/50 text-foreground"
        )}>
          <div className="text-sm opacity-70 h-5 mb-1 overflow-hidden">{input || "0"}</div>
          <div className="text-3xl font-mono font-bold tracking-tight">
            {error ? "Error" : result !== null ? result : "0"}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          {keys.map((key) => (
            <Button
              key={key}
              variant={["/", "*", "-", "+", "="].includes(key) ? "default" : ["C", "AC"].includes(key) ? "destructive" : "secondary"}
              className="h-12 text-lg font-semibold shadow-sm"
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
