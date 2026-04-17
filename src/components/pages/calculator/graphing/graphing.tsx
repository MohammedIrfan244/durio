"use client";

import { useState, useRef, useEffect } from "react";
import { calculate } from "@/lib/logic/calculator/basic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];

export default function Graphing() {
  const [mode, setMode] = useState<"cartesian" | "polar" | "parametric">("cartesian");
  const [funcStr, setFuncStr] = useState<string>("sin(x)");
  const [zoom, setZoom] = useState<number>(40); // pixels per unit
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return; // Await ResizeObserver callback
    }

    // Set actual resolution to match CSS size
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
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
      setError(null); return;
    }

    const functionsToPlot = mode === "parametric" ? [funcStr] : funcStr.split(",").map(s => s.trim()).filter(s => s);
    let hasLocalError = false;

    functionsToPlot.forEach((funcExpr, index) => {
      ctx.strokeStyle = COLORS[index % COLORS.length];
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (mode === "cartesian") {
        let isFirst = true;
        for (let px = 0; px <= width; px += 2) { 
          const logicalX = (px - originX) / zoom;
          try {
            const logicalY = calculate(funcExpr, { angleMode: "rad", variables: { x: logicalX, t: logicalX } });
            if (isNaN(logicalY)) { isFirst = true; continue; }
            const py = originY - (logicalY * zoom);
            if (isFirst) { ctx.moveTo(px, py); isFirst = false; } else { ctx.lineTo(px, py); }
          } catch (e) {
            hasLocalError = true; break;
          }
        }
      } else if (mode === "polar") {
        let isFirst = true;
        const resolution = 0.05;
        // Loop t (theta) from 0 to 12*PI to catch extended spirals
        for (let t = 0; t <= Math.PI * 12; t += resolution) {
          try {
            const r = calculate(funcExpr, { angleMode: "rad", variables: { x: t, t: t } });
            if (isNaN(r)) continue;
            // Convert to Cartesian
            const logicalX = r * Math.cos(t);
            const logicalY = r * Math.sin(t);
            const px = originX + (logicalX * zoom);
            const py = originY - (logicalY * zoom);
            if (isFirst) { ctx.moveTo(px, py); isFirst = false; } else { ctx.lineTo(px, py); }
          } catch (e) {
            hasLocalError = true; break;
          }
        }
      } else if (mode === "parametric") {
        const parts = funcExpr.split(",");
        if (parts.length >= 2) {
          const fx = parts[0].trim();
          const fy = parts[1].trim();
          let isFirst = true;
          // Loop parameter t from -20 to 20
          for (let t = -20; t <= 20; t += 0.05) {
            try {
              const logicalX = calculate(fx, { angleMode: "rad", variables: { t: t, x: t } });
              const logicalY = calculate(fy, { angleMode: "rad", variables: { t: t, x: t } });
              if (isNaN(logicalX) || isNaN(logicalY)) continue;
              const px = originX + (logicalX * zoom);
              const py = originY - (logicalY * zoom);
              if (isFirst) { ctx.moveTo(px, py); isFirst = false; } else { ctx.lineTo(px, py); }
            } catch (e) {
              hasLocalError = true; break;
            }
          }
        }
      }

      ctx.stroke();
    });

    if (hasLocalError) setError("Invalid execution syntax.");
    else setError(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      drawGraph();
    });

    // Start observing the container element for size changes
    resizeObserver.observe(container);

    // Initial draw
    drawGraph();

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, mode, funcStr]);

  return (
    <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 md:col-span-2 h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Graphing Planner
            </CardTitle>
            <CardDescription className="hidden md:block">Plot mathematical formulas using variables.</CardDescription>
          </div>
          <div className="flex bg-secondary/50 p-1 rounded-md border text-xs font-semibold">
            {["cartesian", "polar", "parametric"].map(m => (
              <button 
                key={m}
                type="button"
                className={cn("px-3 py-1 rounded transition-colors capitalize", mode === m ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                onClick={() => setMode(m as any)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4 pb-0 pl-1 pr-1 md:px-6">
        
        <div className="flex items-center gap-2 px-4 md:px-0">
          <span className="font-mono font-bold text-lg whitespace-nowrap">
            {mode === "cartesian" ? "f(x) =" : mode === "polar" ? "r(t) =" : "x(t),y(t) ="}
          </span>
          <Input 
            className="font-mono text-sm flex-1 bg-secondary/30"
            placeholder={mode === "cartesian" ? "sin(x)" : mode === "polar" ? "cos(2*t)" : "cos(t), sin(t)"} 
            value={funcStr} 
            onChange={(e) => setFuncStr(e.target.value)} 
          />
        </div>

        {/* Templates */}
        <div className="flex flex-wrap gap-2 px-4 md:px-0">
          {mode === "cartesian" && [
            { label: "Linear", eq: "2*x + 1" },
            { label: "Quadratic", eq: "x^2 - 4" },
            { label: "Cubic", eq: "0.1*(x^3 - 4*x)" },
            { label: "Trig", eq: "sin(x)" },
          ].map((t) => (
            <button key={t.label} onClick={() => setFuncStr(t.eq)} className="px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{t.label}</button>
          ))}
          {mode === "polar" && [
            { label: "Circle", eq: "4" },
            { label: "Rose (4 petals)", eq: "5*cos(2*t)" },
            { label: "Spiral", eq: "0.5*t" },
            { label: "Cardioid", eq: "4*(1-sin(t))" },
          ].map((t) => (
            <button key={t.label} onClick={() => setFuncStr(t.eq)} className="px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{t.label}</button>
          ))}
          {mode === "parametric" && [
            { label: "Circle", eq: "5*cos(t), 5*sin(t)" },
            { label: "Lissajous", eq: "5*sin(3*t), 4*sin(2*t)" },
            { label: "Butterfly", eq: "sin(t)*(exp(cos(t)) - 2*cos(4*t) - sin(t/12)^5), cos(t)*(exp(cos(t)) - 2*cos(4*t) - sin(t/12)^5)" },
          ].map((t) => (
            <button key={t.label} onClick={() => setFuncStr(t.eq)} className="px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{t.label}</button>
          ))}
        </div>

        {error && <div className="text-destructive text-sm font-semibold px-4 md:px-0">{error}</div>}

        <div className="flex-1 min-h-[60vh] w-full relative group">
          <div className="absolute inset-0 rounded-t-[1.5rem] md:rounded-xl border-t md:border border-border/50 bg-[#fafafa] dark:bg-[#111111] overflow-hidden shadow-inner">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full cursor-crosshair touch-none"
              onWheel={(e) => {
                e.preventDefault();
                setZoom(z => Math.max(5, Math.min(300, z - e.deltaY * 0.05)));
              }}
            />
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded-lg backdrop-blur-sm border shadow-sm">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(z => Math.min(300, z + 15))}>+</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(z => Math.max(5, z - 15))}>-</Button>
            </div>
            <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded shadow-sm border">
              Zoom: {Math.round(zoom)}px/unit
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}