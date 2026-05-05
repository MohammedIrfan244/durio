"use client";

import { useState } from "react";
import { programmer } from "@/lib/logic/calculator/programmer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BitwiseOp = "AND" | "OR" | "XOR" | "NOT" | "<<" | ">>";

export default function Programmer() {
  const [val1, setVal1] = useState<string>("");
  const [val2, setVal2] = useState<string>("");
  const [op, setOp] = useState<BitwiseOp>("AND");

  // Conversion of val1
  const number = Number(val1) || 0;
  const hex = programmer.toHex(number);
  const dec = number.toString(10);
  const oct = programmer.toOctal(number);
  const bin = programmer.toBinary(number);

  // Bitwise Result
  const num2 = Number(val2) || 0;
  let res = 0;
  switch (op) {
    case "AND": res = programmer.bitwiseAnd(number, num2); break;
    case "OR": res = programmer.bitwiseOr(number, num2); break;
    case "XOR": res = programmer.bitwiseXor(number, num2); break;
    case "NOT": res = programmer.bitwiseNot(number); break;
    case "<<": res = programmer.leftShift(number, num2); break;
    case ">>": res = programmer.rightShift(number, num2); break;
  }
  const resultBin = programmer.toBinary(res);

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 group cursor-pointer">
          <Terminal className="h-5 w-5 text-primary transition-transform group-hover:rotate-12 group-hover:scale-110" />
          Programmer
        </CardTitle>
        <CardDescription>Conversions and low-level bitwise math.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider block">Decimal Value</label>
          <Input 
            className="font-mono text-lg"
            type="number" 
            placeholder="0" 
            value={val1} 
            onChange={(e) => setVal1(e.target.value)} 
          />
        </div>

        <div className="bg-secondary/30 rounded border border-border/50 p-3 space-y-1 text-sm font-mono tracking-wider">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">HEX</span>
            <span>{hex}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">DEC</span>
            <span>{dec}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">OCT</span>
            <span>{oct}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">BIN</span>
            <span className="break-all text-right">{bin}</span>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4 mt-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Bitwise Operations</label>
          <div className="flex gap-2">
            <Select value={op} onValueChange={(v: BitwiseOp) => setOp(v)}>
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Op" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
                <SelectItem value="XOR">XOR</SelectItem>
                <SelectItem value="NOT">NOT</SelectItem>
                <SelectItem value="<<">{"<<"}</SelectItem>
                <SelectItem value=">>">{">>"}</SelectItem>
              </SelectContent>
            </Select>

            {op !== "NOT" && (
              <Input 
                className="font-mono flex-1"
                type="number" 
                placeholder="Value 2" 
                value={val2} 
                onChange={(e) => setVal2(e.target.value)} 
              />
            )}
          </div>
        </div>

        <div className="rounded-md bg-secondary/50 p-4 border border-border/50 text-center flex flex-col justify-center min-h-[4rem]">
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Result (BIN)</span>
          <span className="text-lg font-mono font-bold tracking-tight text-primary break-all">
            {resultBin}
          </span>
          <span className="text-xs text-muted-foreground mt-1">DEC: {res}</span>
        </div>

      </CardContent>
    </Card>
  );
}