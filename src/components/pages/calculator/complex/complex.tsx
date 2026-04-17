"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BrainCircuit, Info, Calculator, FunctionSquare, Sigma, ArrowRight } from "lucide-react";
import { symbolicLogic } from "@/lib/logic/calculator/symbolic";
import { tokenize } from "@/lib/logic/calculator/core/engine/tokenizer";
import { parse } from "@/lib/logic/calculator/core/engine/parser";

export default function ComplexMath() {
  const [activeTab, setActiveTab] = useState<"algebra" | "calculus" | "systems">("algebra");
  
  // SOLVERS STATE
  const [polyA, setPolyA] = useState("1");
  const [polyB, setPolyB] = useState("-5");
  const [polyC, setPolyC] = useState("6");
  const [polyD, setPolyD] = useState("0");
  const [polyOrder, setPolyOrder] = useState<2 | 3>(2);
  const [roots, setRoots] = useState<(number | string)[] | null>(null);

  // CALCULUS STATE
  const [funcStr, setFuncStr] = useState("x^2 + 2*x + 1");
  const [diffResult, setDiffResult] = useState("");
  const [intLower, setIntLower] = useState("0");
  const [intUpper, setIntUpper] = useState("1");
  const [intResult, setIntResult] = useState<number | null>(null);

  // CALC ACTIONS
  const handleDiff = () => {
    try {
      const tokens = tokenize(funcStr);
      const ast = parse(tokens);
      const derived = symbolicLogic.diff(ast, "x");
      const simplified = symbolicLogic.simplify(derived);
      setDiffResult(symbolicLogic.toString(simplified));
    } catch {
      setDiffResult("Error: Invalid Formula");
    }
  };

  const handleInt = () => {
    const res = symbolicLogic.integral(funcStr, parseFloat(intLower), parseFloat(intUpper));
    setIntResult(res);
  };

  const handleSolve = () => {
    const a = parseFloat(polyA);
    const b = parseFloat(polyB);
    const c = parseFloat(polyC);
    const d = parseFloat(polyD);
    if (polyOrder === 2) {
      setRoots(symbolicLogic.solveQuadratic(a, b, c));
    } else {
      setRoots(symbolicLogic.solveCubic(a, b, c, d));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-2 overflow-hidden">
        <CardHeader className="pb-0 bg-secondary/10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-4 pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Symbolic Engine
              </CardTitle>
              <CardDescription>Algebraic and Calculus workstation.</CardDescription>
            </div>
            
            <div className="flex bg-secondary/50 p-1 rounded-lg border text-xs font-semibold self-start sm:self-center">
              {[
                { id: "algebra", label: "Solvers", icon: <Calculator className="h-3 w-3"/> },
                { id: "calculus", label: "Calculus", icon: <Sigma className="h-3 w-3"/> },
                { id: "systems", label: "Systems", icon: <FunctionSquare className="h-3 w-3"/> }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-all flex items-center gap-2",
                    activeTab === t.id ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/40"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          
          {activeTab === "algebra" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Polynomial Parameters</label>
                <div className="flex gap-2">
                   <Button size="sm" variant={polyOrder === 2 ? "secondary" : "ghost"} onClick={() => setPolyOrder(2)}>Quadratic</Button>
                   <Button size="sm" variant={polyOrder === 3 ? "secondary" : "ghost"} onClick={() => setPolyOrder(3)}>Cubic</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground ml-1">a (x³)</span>
                  <Input type="number" value={polyA} onChange={(e) => setPolyA(e.target.value)} className="font-mono text-center" disabled={polyOrder === 2} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground ml-1">b (x²)</span>
                  <Input type="number" value={polyB} onChange={(e) => setPolyB(e.target.value)} className="font-mono text-center" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground ml-1">c (x)</span>
                  <Input type="number" value={polyC} onChange={(e) => setPolyC(e.target.value)} className="font-mono text-center" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground ml-1">d (const)</span>
                  <Input type="number" value={polyD} onChange={(e) => setPolyD(e.target.value)} className="font-mono text-center" />
                </div>
              </div>

              <Button onClick={handleSolve} className="w-full font-bold shadow-md h-12 text-base">
                Resolve Roots
              </Button>

              {roots && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Solution Set</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roots.map((r, i) => (
                      <div key={i} className="bg-background/80 p-3 rounded-lg border border-border/50 font-mono font-bold text-center text-primary">
                        x{i+1} = {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "calculus" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Function Input f(x)</label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. x^3 - 2*x + 1" 
                    value={funcStr} 
                    onChange={(e) => setFuncStr(e.target.value)} 
                    className="font-mono h-12 text-lg px-4 bg-secondary/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button size="sm" variant="secondary" className="h-8 text-xs font-bold" onClick={handleDiff}>Symb-Diff</Button>
                  </div>
                </div>
              </div>

              {diffResult && (
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ArrowRight className="h-3 w-3"/> Symbolic Derivative f'(x)
                  </span>
                  <span className="font-mono text-lg font-bold text-primary break-all">{diffResult}</span>
                </div>
              )}

              <div className="border-t pt-6 border-border/30 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Numerical Integration</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1.5">
                      <span className="text-[10px] text-muted-foreground ml-1">Lower (a)</span>
                      <Input type="number" value={intLower} onChange={(e) => setIntLower(e.target.value)} className="bg-background/40" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <span className="text-[10px] text-muted-foreground ml-1">Upper (b)</span>
                      <Input type="number" value={intUpper} onChange={(e) => setIntUpper(e.target.value)} className="bg-background/40" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full font-bold border-primary/20 text-primary hover:bg-primary/5" onClick={handleInt}>Calculate Area</Button>
                </div>

                {intResult !== null && (
                  <div className="bg-secondary/10 p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Definite Integral</span>
                    <span className="text-3xl font-mono font-bold">{intResult.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "systems" && (
             <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-center space-y-4">
               <FunctionSquare className="h-10 w-10 opacity-20" />
               <p className="text-sm font-medium max-w-xs">System solvers utilizes Gaussian elimination for 2 or 3 variable expressions.</p>
               <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-secondary/50 rounded-full">Standard for Engineering</span>
             </div>
          )}

        </CardContent>
      </Card>

      {/* Educational & Warning Sidebar */}
      <div className="space-y-6 h-full">
         <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Math Engine Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start group">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0 animate-pulse" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Symbolic Differentiation:</span> Applies Product, Quotient, and Chain rules. If output is complex, use the simplifier toggle.
                </p>
              </div>
              <div className="flex gap-3 items-start group">
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Numerical Precision:</span> Integration uses Simpson's 1/3 rule ($n=100$). Discontinuous functions may vary.
                </p>
              </div>
              <div className="flex gap-3 items-start group">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Complex Roots:</span> Solvers will automatically detect negative discriminants and return results in $a+bi$ form.
                </p>
              </div>
            </CardContent>
         </Card>

         <Card className="bg-primary/5 border border-primary/20">
            <CardContent className="p-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">Fundamental Theorem</h4>
               <span className="font-mono text-xs italic text-primary font-semibold">
                 ∫ f(x) dx = F(b) - F(a)
               </span>
               <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                 Calculates the exact area between the function curve and the x-axis.
               </p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
