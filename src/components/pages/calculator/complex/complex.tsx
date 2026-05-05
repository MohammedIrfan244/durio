"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BrainCircuit, Info, Calculator, FunctionSquare, Sigma, ArrowRight, AlertTriangle } from "lucide-react";
import { symbolicLogic } from "@/lib/logic/calculator/symbolic";
import { tokenize } from "@/lib/logic/calculator/core/engine/tokenizer";
import { parse } from "@/lib/logic/calculator/core/engine/parser";
import { matrixLogic } from "@/lib/logic/calculator/matrix";

// -----------------------------------------------
// SIDEBAR CONTENT — dynamic by tab
// -----------------------------------------------
const sidebarContent = {
  algebra: {
    theorem: {
      title: "Polynomial Theory",
      formula: "aₙxⁿ + ... + a₁x + a₀ = 0",
      description: "Every polynomial of degree n has exactly n roots (real or complex), as per the Fundamental Theorem of Algebra."
    },
    logs: [
      { color: "bg-primary", text: "Quadratic", desc: "Uses the discriminant (Δ = b²−4ac) to determine root types. Δ>0 → 2 real, Δ=0 → 1 repeated, Δ<0 → 2 complex." },
      { color: "bg-amber-500", text: "Cubic", desc: "Root found via Newton-Raphson iteration, then synthetic division reduces to a quadratic for the remaining roots." },
      { color: "bg-violet-500", text: "Quartic", desc: "Uses Ferrari's resolvent: reduces the quartic to two quadratics by finding a cubic resolvent first." },
      { color: "bg-emerald-500", text: "Complex Roots", desc: "When Δ<0, roots are expressed as a ± bi. These cannot be plotted on a real number line." },
    ]
  },
  calculus: {
    theorem: {
      title: "Fundamental Theorem of Calculus",
      formula: "∫ₐᵇ f(x) dx = F(b) − F(a)",
      description: "Integration and differentiation are inverse operations. The definite integral gives the signed area under the curve."
    },
    logs: [
      { color: "bg-primary", text: "Symbolic Diff", desc: "Applies Power, Product, Quotient & Chain rules. The output is an exact algebraic expression, not an approximation." },
      { color: "bg-violet-500", text: "2nd Derivative", desc: "Differentiates f'(x) again to find f''(x), used for concavity and inflection point analysis." },
      { color: "bg-amber-500", text: "Limits", desc: "Numerically approaches a point from both sides. If left ≈ right ≈ value, the limit exists." },
      { color: "bg-emerald-500", text: "Integration", desc: "Uses Simpson's 1/3 Rule (n=100). Integration result is approximate for discontinuous functions." },
    ]
  },
  systems: {
    theorem: {
      title: "Gaussian Elimination",
      formula: "[ A | b ] → Reduced Row Echelon Form",
      description: "A system Ax=b is solved by augmenting A with b and reducing it to the identity matrix, yielding the solution vector x."
    },
    logs: [
      { color: "bg-primary", text: "2-Variable Systems", desc: "Uses 2×2 matrix inverse or Cramer's rule: x = (d·a₂₂ - b·a₂₁) / det(A)." },
      { color: "bg-amber-500", text: "3-Variable Systems", desc: "Augments a 3×3 matrix with a right-hand-side vector and performs RREF." },
      { color: "bg-emerald-500", text: "What are Systems?", desc: "A system of equations finds values satisfying multiple constraints simultaneously, used in optimization and engineering." },
    ]
  }
};

// -----------------------------------------------
// POLYNOMIAL CONFIGS — dynamic labels per degree
// -----------------------------------------------
const polyConfigs = {
  2: {
    label: "Quadratic",
    form: "ax² + bx + c = 0",
    coeffs: [
      { key: "a", exp: "x²", relevant: true },
      { key: "b", exp: "x",  relevant: true },
      { key: "c", exp: "const", relevant: true },
      { key: "d", exp: "—", relevant: false },
      { key: "e", exp: "—", relevant: false },
    ]
  },
  3: {
    label: "Cubic",
    form: "ax³ + bx² + cx + d = 0",
    coeffs: [
      { key: "a", exp: "x³", relevant: true },
      { key: "b", exp: "x²", relevant: true },
      { key: "c", exp: "x",  relevant: true },
      { key: "d", exp: "const", relevant: true },
      { key: "e", exp: "—", relevant: false },
    ]
  },
  4: {
    label: "Quartic",
    form: "ax⁴ + bx³ + cx² + dx + e = 0",
    coeffs: [
      { key: "a", exp: "x⁴", relevant: true },
      { key: "b", exp: "x³", relevant: true },
      { key: "c", exp: "x²", relevant: true },
      { key: "d", exp: "x",  relevant: true },
      { key: "e", exp: "const", relevant: true },
    ]
  }
} as const;

type PolyDeg = 2 | 3 | 4;

export default function ComplexMath() {
  const [activeTab, setActiveTab] = useState<"algebra" | "calculus" | "systems">("algebra");

  // --- SOLVER STATE ---
  const [polyDeg, setPolyDeg] = useState<PolyDeg>(2);
  const [coeffs, setCoeffs] = useState({ a: "1", b: "-5", c: "6", d: "0", e: "0" });
  const [roots, setRoots] = useState<(number | string)[] | null>(null);

  // --- CALCULUS STATE ---
  const [funcStr, setFuncStr] = useState("x^2 + 2*x + 1");
  const [diff1Result, setDiff1Result] = useState("");
  const [diff2Result, setDiff2Result] = useState("");
  const [limitPoint, setLimitPoint] = useState("0");
  const [limitResult, setLimitResult] = useState<number | null>(null);
  const [intLower, setIntLower] = useState("0");
  const [intUpper, setIntUpper] = useState("1");
  const [intResult, setIntResult] = useState<number | null>(null);
  const [int2Result, setInt2Result] = useState<number | null>(null);

  // --- SYSTEMS STATE ---
  const [sysSize, setSysSize] = useState<2 | 3>(2);
  const [sysA, setSysA] = useState([["2","1"],["1","3"]]);
  const [sysB, setSysB] = useState(["5","10"]);
  const [sysResult, setSysResult] = useState<number[] | string | null>(null);

  // -----------------------------------------------
  // HANDLERS
  // -----------------------------------------------
  const setCoeff = (key: string, val: string) => setCoeffs(prev => ({ ...prev, [key]: val }));

  const handleSolve = () => {
    const a = parseFloat(coeffs.a), b = parseFloat(coeffs.b), c = parseFloat(coeffs.c),
          d = parseFloat(coeffs.d), e = parseFloat(coeffs.e);
    let result: (number | string)[] = [];
    if (polyDeg === 2) result = symbolicLogic.solveQuadratic(a, b, c);
    else if (polyDeg === 3) result = symbolicLogic.solveCubic(a, b, c, d);
    else if (polyDeg === 4) {
      // Ferrari: find resolvent cubic, then decompose into two quadratics
      try {
        // Depress quartic by substituting x = t - b/(4a)
        const p = (-3*b*b/(8*a*a)) + c/a;
        const q = (b*b*b/(8*a*a*a)) - (b*c/(2*a*a)) + d/a;
        const r2 = (-3*b*b*b*b/(256*a*a*a*a)) + (c*b*b/(16*a*a*a)) - (b*d/(4*a*a)) + e/a;
        const cubicRoots = symbolicLogic.solveCubic(1, -p/2, -r2, (4*r2*p - q*q)/8);
        const m = Number(cubicRoots[0]);
        const sq = Math.sqrt(2*m - p);
        const r1 = symbolicLogic.solveQuadratic(1, sq, m + q/(2*sq));
        const r3 = symbolicLogic.solveQuadratic(1, -sq, m - q/(2*sq));
        const shift = -b/(4*a);
        result = [...r1, ...r3].map(v =>
          typeof v === "number" ? parseFloat((v + shift).toFixed(4)) : `${v} - b/4a`
        );
      } catch {
        result = ["Could not resolve (try numerical methods)"];
      }
    }
    setRoots(result);
  };

  const handleDiff = () => {
    try {
      const ast = parse(tokenize(funcStr));
      const d1 = symbolicLogic.simplify(symbolicLogic.diff(ast, "x"));
      const d2 = symbolicLogic.simplify(symbolicLogic.diff(d1, "x"));
      setDiff1Result(symbolicLogic.toString(d1));
      setDiff2Result(symbolicLogic.toString(d2));
    } catch {
      setDiff1Result("Error: Invalid formula");
      setDiff2Result("");
    }
  };

  const handleLimit = () => {
    const c = parseFloat(limitPoint);
    const delta = 1e-7;
    const left  = symbolicLogic.evaluateString(funcStr, c - delta);
    const right = symbolicLogic.evaluateString(funcStr, c + delta);
    setLimitResult((left + right) / 2);
  };

  const handleInt = (order: 1 | 2) => {
    const a = parseFloat(intLower), b = parseFloat(intUpper);
    const result = symbolicLogic.integral(funcStr, a, b);
    if (order === 1) setIntResult(result);
    else {
      // Second order: integrate once more over the same bounds
      // Build antiderivative numerically as f(x2) = ∫₀ˣ² f(x1) dx1 sampled at N points
      const N = 50;
      const step = (b - a) / N;
      let sum = 0;
      for (let i = 0; i <= N; i++) {
        const x2 = a + i * step;
        const inner = symbolicLogic.integral(funcStr, a, x2, 20);
        const weight = i === 0 || i === N ? 1 : (i % 2 === 0 ? 2 : 4);
        sum += weight * inner;
      }
      setInt2Result((step / 3) * sum);
    }
  };

  const handleSolveSystem = () => {
    try {
      const n = sysSize;
      const mat = sysA.slice(0, n).map((row, i) => {
        const rowCoeffs = Array.from({ length: n }, (_, c) => Number(sysA[i]?.[c] ?? 0));
        return [...rowCoeffs, Number(sysB[i] ?? 0)];
      });
      const rref = matrixLogic.rref(mat);
      // Extract the last column (solution vector) and guard against undefined
      const solution = rref.slice(0, n).map(row => {
        const val = row[n];
        return typeof val === "number" && !isNaN(val) ? val : 0;
      });
      setSysResult(solution);
    } catch (e: any) {
      setSysResult(`Error: ${e.message}`);
    }
  };

  // Dynamic sidebar
  const sidebar = sidebarContent[activeTab];
  const polyConfig = polyConfigs[polyDeg];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      {/* ── MAIN CARD ── */}
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-2 overflow-hidden">
        <CardHeader className="pb-0 bg-secondary/10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-4 pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 group cursor-pointer">
                <Calculator className="h-5 w-5 text-primary transition-transform group-hover:rotate-12 group-hover:scale-110" />
                Complex MathEngine
              </CardTitle>
              <CardDescription>Algebraic and Calculus workstation.</CardDescription>
            </div>

            <div className="flex bg-secondary/50 p-1 rounded-lg border text-xs font-semibold self-start sm:self-center">
              {([
                { id: "algebra",  label: "Solvers",  icon: <Calculator  className="h-3 w-3"/> },
                { id: "calculus", label: "Calculus", icon: <Sigma        className="h-3 w-3"/> },
                { id: "systems",  label: "Systems",  icon: <FunctionSquare className="h-3 w-3"/> },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-all flex items-center gap-2",
                    activeTab === t.id ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/40"
                  )}
                >{t.icon}{t.label}</button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">

          {/* ═══════════ ALGEBRA TAB ═══════════ */}
          {activeTab === "algebra" && (
            <div className="space-y-6">
              {/* Degree selector */}
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Equation Type</span>
                <div className="flex gap-2">
                  {([2, 3, 4] as PolyDeg[]).map(deg => (
                    <Button key={deg} size="sm"
                      variant={polyDeg === deg ? "secondary" : "ghost"}
                      onClick={() => { setPolyDeg(deg); setRoots(null); }}>
                      {polyConfigs[deg].label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Form label */}
              <div className="font-mono text-sm text-muted-foreground bg-secondary/20 px-4 py-2 rounded-lg border border-border/30">
                {polyConfig.form}
              </div>

              {/* Coefficient inputs — dynamic labels */}
              <div className={cn("grid gap-3", polyDeg === 4 ? "grid-cols-5" : polyDeg === 3 ? "grid-cols-4" : "grid-cols-3")}>
                {polyConfig.coeffs.filter(c => c.relevant).map(({ key, exp }) => (
                  <div key={key} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">{key} · {exp}</span>
                    <Input
                      type="number"
                      value={coeffs[key as keyof typeof coeffs]}
                      onChange={(e) => setCoeff(key, e.target.value)}
                      className="font-mono text-center h-11"
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleSolve} className="w-full font-bold shadow-md h-12 text-base bg-green-600 hover:bg-green-700 text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95">
                Resolve Roots
              </Button>

              {roots && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Solution Set — {roots.length} root(s)</span>
                  </div>
                  <div className={cn("grid gap-3", roots.length <= 2 ? "grid-cols-2" : "grid-cols-3")}>
                    {roots.map((r, i) => (
                      <div key={i} className={cn(
                        "p-3 rounded-lg border font-mono font-bold text-center text-sm",
                        typeof r === "string" && r.includes("i")
                          ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                          : "bg-background/80 border-border/50 text-primary"
                      )}>
                        <span className="text-[9px] block text-muted-foreground mb-1 uppercase tracking-wider">Root {i + 1}</span>
                        x = {r}
                      </div>
                    ))}
                  </div>
                  {roots.some(r => typeof r === "string" && r.includes("i")) && (
                    <div className="flex items-start gap-2 bg-violet-500/10 p-3 rounded-lg border border-violet-500/20 mt-2">
                      <AlertTriangle className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-violet-300">Complex roots are shown in <span className="font-mono font-bold">a ± bi</span> form. They cannot be plotted on a real number line.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ CALCULUS TAB ═══════════ */}
          {activeTab === "calculus" && (
            <div className="space-y-6">
              {/* Function input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Function f(x)</label>
                <Input
                  placeholder="e.g. x^3 - 2*x + 1"
                  value={funcStr}
                  onChange={(e) => setFuncStr(e.target.value)}
                  className="font-mono h-12 text-base px-4 bg-secondary/20"
                />
              </div>

              {/* Derivatives Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Symbolic Differentiation</span>
                  <Button size="sm" variant="secondary" className="font-bold" onClick={handleDiff}>
                    Differentiate
                  </Button>
                </div>
                {diff1Result && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-secondary/30 p-3 rounded-xl border border-border/50 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">f'(x) — First Derivative</span>
                      <p className="font-mono text-base font-bold text-primary break-all">{diff1Result}</p>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-xl border border-border/50 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">f''(x) — Second Derivative</span>
                      <p className="font-mono text-base font-bold text-violet-400 break-all">{diff2Result || "0"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Limits Section */}
              <div className="border-t pt-4 border-border/30 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Limit</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 font-mono text-sm text-muted-foreground">
                    lim
                    <span className="text-[10px]">x→</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="approach point (c)"
                    value={limitPoint}
                    onChange={(e) => setLimitPoint(e.target.value)}
                    className="flex-1 font-mono text-center bg-background/40"
                  />
                  <Button variant="outline" className="font-bold border-primary/20 text-primary" onClick={handleLimit}>
                    Evaluate
                  </Button>
                </div>
                {limitResult !== null && (
                  <div className="bg-secondary/10 p-4 rounded-xl border border-border/50 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">lim f(x) as x → {limitPoint}</span>
                    <span className="font-mono text-2xl font-bold text-primary">{isNaN(limitResult) ? "Does not exist" : limitResult.toFixed(6)}</span>
                  </div>
                )}
              </div>

              {/* Integration Section */}
              <div className="border-t pt-4 border-border/30 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Definite Integration</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-muted-foreground ml-1">Lower bound (a)</span>
                    <Input type="number" value={intLower} onChange={(e) => setIntLower(e.target.value)} className="bg-background/40" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-muted-foreground ml-1">Upper bound (b)</span>
                    <Input type="number" value={intUpper} onChange={(e) => setIntUpper(e.target.value)} className="bg-background/40" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="font-bold border-primary/20 text-primary hover:bg-primary/5" onClick={() => handleInt(1)}>
                    ∫ f(x) dx — 1st Order
                  </Button>
                  <Button variant="outline" className="font-bold border-violet-500/20 text-violet-400 hover:bg-violet-500/5" onClick={() => handleInt(2)}>
                    ∬ f(x) dx² — 2nd Order
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {intResult !== null && (
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/50 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">∫ f(x) dx</span>
                      <span className="font-mono text-2xl font-bold">{intResult.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span>
                    </div>
                  )}
                  {int2Result !== null && (
                    <div className="bg-violet-500/5 p-4 rounded-xl border border-violet-500/20 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">∬ f(x) dx²</span>
                      <span className="font-mono text-2xl font-bold text-violet-400">{int2Result.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ SYSTEMS TAB ═══════════ */}
          {activeTab === "systems" && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <Info className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  A <span className="font-bold">system of equations</span> finds values of x, y, (z) satisfying multiple constraints simultaneously.
                  Enter coefficients for each variable in each equation row, and their constant on the right.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Variables</span>
                <Button size="sm" variant={sysSize === 2 ? "secondary" : "ghost"} onClick={() => { setSysSize(2); setSysResult(null); }}>2 × 2</Button>
                <Button size="sm" variant={sysSize === 3 ? "secondary" : "ghost"} onClick={() => { setSysSize(3); setSysResult(null); }}>3 × 3</Button>
              </div>

              <div className="space-y-2">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${sysSize + 1}, 1fr)` }}>
                  {/* Header */}
                  {Array.from({ length: sysSize }, (_, i) => (
                    <div key={i} className="text-[10px] font-bold text-muted-foreground text-center pb-1">{"xyz"[i]}-coeff</div>
                  ))}
                  <div className="text-[10px] font-bold text-primary text-center pb-1">= const</div>

                  {/* Rows */}
                  {Array.from({ length: sysSize }, (_, r) =>
                    Array.from({ length: sysSize }, (_, c) => (
                      <Input
                        key={`${r}-${c}`}
                        type="number"
                        className="font-mono text-center h-10 text-sm"
                        value={sysA[r]?.[c] ?? "0"}
                        onChange={(e) => {
                          const next = sysA.map(row => [...row]);
                          if (!next[r]) next[r] = Array(sysSize).fill("0");
                          next[r][c] = e.target.value;
                          setSysA(next);
                        }}
                      />
                    )).concat(
                      <Input
                        key={`b-${r}`}
                        type="number"
                        className="font-mono text-center h-10 text-sm bg-primary/5 border-primary/20"
                        value={sysB[r] ?? "0"}
                        onChange={(e) => {
                          const next = [...sysB];
                          next[r] = e.target.value;
                          setSysB(next);
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <Button onClick={handleSolveSystem} className="w-full font-bold shadow-md h-12 bg-green-600 hover:bg-green-700 text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95">
                Solve System
              </Button>

              {sysResult && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Solution Vector</span>
                  {typeof sysResult === "string" ? (
                    <p className="text-destructive text-sm font-semibold">{sysResult}</p>
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${sysSize}, 1fr)` }}>
                      {sysResult.map((val, i) => (
                        <div key={i} className="bg-background/80 p-3 rounded-lg border border-border/50 text-center">
                          <span className="text-[10px] text-muted-foreground block mb-1">{"xyz"[i]}</span>
                          <span className="font-mono font-bold text-primary">{val.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* ── SIDEBAR — dynamic per tab ── */}
      <div className="space-y-6">
        <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 group cursor-pointer">
              <Info className="h-4 w-4 text-primary transition-transform group-hover:rotate-12 group-hover:scale-110" />
              Formula & Definitione Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sidebar.logs.map((log, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`h-2 w-2 rounded-full ${log.color} mt-1.5 flex-shrink-0`} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">{log.text}: </span>{log.desc}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">{sidebar.theorem.title}</h4>
            <div className="bg-primary/10 rounded-lg px-4 py-3 border border-primary/20">
              <p className="font-mono text-base font-bold text-primary">{sidebar.theorem.formula}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{sidebar.theorem.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
