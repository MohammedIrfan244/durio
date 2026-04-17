"use client";

import { useState, useRef, useEffect } from "react";
import { calculate } from "@/lib/logic/calculator/basic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];

export default function Graphing() {
  const [funcStr, setFuncStr] = useState<string>("sin(x)");
  const [zoom, setZoom] = useState<number>(20); // pixels per unit
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = "rgba(150, 150, 150, 0.2)";
    ctx.beginPath();
    for (let x = originX % zoom; x < width; x += zoom) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = originY % zoom; y < height; y += zoom) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    if (!funcStr.trim()) {
      setError(null);
      return;
    }

    const functionsToPlot = funcStr.split(",").map(s => s.trim()).filter(s => s);
    let hasLocalError = false;

    functionsToPlot.forEach((funcExpr, index) => {
      // Draw function
      ctx.strokeStyle = COLORS[index % COLORS.length];
      ctx.lineWidth = 2;
      ctx.beginPath();

      let isFirst = true;

      // Evaluate function for each pixel on x axis
      for (let px = 0; px <= width; px++) {
        // Convert pixel X to logical X
        const logicalX = (px - originX) / zoom;
        
        try {
          const logicalY = calculate(funcExpr, { angleMode: "rad", variables: { x: logicalX } });
          
          if (isNaN(logicalY)) {
            isFirst = true;
            continue;
          }

          // Convert logical Y to pixel Y
          const py = originY - (logicalY * zoom);

          if (isFirst) {
            ctx.moveTo(py < 0 || py > height ? px : px, py);
            isFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        } catch (e) {
          hasLocalError = true;
          break;
        }
      }

      ctx.stroke();
    });

    if (hasLocalError) {
      setError("One or more invalid functions or variables.");
    } else {
      setError(null);
    }
  };

  useEffect(() => {
    // Initial draw
    drawGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 md:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Graphing Planner
        </CardTitle>
        <CardDescription>Plot mathematical formulas using variable 'x'. Separate multiple with commas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-lg">f(x) =</span>
          <Input 
            className="font-mono text-sm flex-1"
            placeholder="e.g. sin(x), cos(x)" 
            value={funcStr} 
            onChange={(e) => setFuncStr(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && drawGraph()}
          />
          <Button onClick={drawGraph} variant="secondary">Plot</Button>
        </div>
        
        {funcStr.split(",").filter(s => s.trim() !== "").length > 1 && (
          <div className="flex flex-wrap gap-2 text-xs font-mono font-bold px-1">
            {funcStr.split(",").filter(s => s.trim() !== "").map((f, i) => (
              <span key={i} className="px-2 py-1 rounded bg-secondary" style={{ color: COLORS[i % COLORS.length] }}>
                {f.trim()}
              </span>
            ))}
          </div>
        )}

        {error && <div className="text-destructive text-sm font-semibold text-right">{error}</div>}

        <div className="rounded-md border border-border/50 bg-[#fafafa] dark:bg-[#111111] overflow-hidden relative">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={300} 
            className="w-full h-auto cursor-crosshair"
            onWheel={(e) => {
              e.preventDefault();
              setZoom(z => Math.max(5, Math.min(200, z - e.deltaY * 0.05)));
            }}
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(200, z + 5))}>+</Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(5, z - 5))}>-</Button>
          </div>
          <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded shadow-sm">
            Scroll to zoom • Drag (NYI)
          </div>
        </div>

      </CardContent>
    </Card>
  );
}