"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Grid3x3, Plus, Minus, ArrowRight, RotateCw, Trash2, Equal } from "lucide-react";
import { matrixLogic, Matrix as MatrixType } from "@/lib/logic/calculator/matrix";

export default function MatrixCalculator() {
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [matrixA, setMatrixA] = useState<MatrixType>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);

  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);
  const [matrixB, setMatrixB] = useState<MatrixType>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);

  const [result, setResult] = useState<MatrixType | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateMatrix = (
    matrix: MatrixType, 
    setMatrix: (m: MatrixType) => void, 
    r: number, 
    c: number, 
    val: string
  ) => {
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[r][c] = parseFloat(val) || 0;
    setMatrix(newMatrix);
    setError(null);
  };

  const adjustDimensions = (
    type: 'A' | 'B', 
    dim: 'row' | 'col', 
    delta: number
  ) => {
    if (type === 'A') {
      if (dim === 'row') {
        const next = Math.max(1, Math.min(8, rowsA + delta));
        if (next === rowsA) return;
        setRowsA(next);
        const newM = Array(next).fill(0).map((_, i) => 
          i < rowsA ? [...matrixA[i]] : Array(colsA).fill(0)
        );
        setMatrixA(newM);
      } else {
        const next = Math.max(1, Math.min(8, colsA + delta));
        if (next === colsA) return;
        setColsA(next);
        const newM = matrixA.map(row => {
          const newRow = [...row];
          if (delta > 0) return [...newRow, 0];
          return newRow.slice(0, next);
        });
        setMatrixA(newM);
      }
    } else {
      if (dim === 'row') {
        const next = Math.max(1, Math.min(8, rowsB + delta));
        if (next === rowsB) return;
        setRowsB(next);
        const newM = Array(next).fill(0).map((_, i) => 
          i < rowsB ? [...matrixB[i]] : Array(colsB).fill(0)
        );
        setMatrixB(newM);
      } else {
        const next = Math.max(1, Math.min(8, colsB + delta));
        if (next === colsB) return;
        setColsB(next);
        const newM = matrixB.map(row => {
          const newRow = [...row];
          if (delta > 0) return [...newRow, 0];
          return newRow.slice(0, next);
        });
        setMatrixB(newM);
      }
    }
    setResult(null);
    setError(null);
  };

  const wrapOp = (op: () => MatrixType | number) => {
    try {
      setResult(op());
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    }
  };

  const renderMatrixInput = (m: MatrixType, setM: (m: MatrixType) => void, label: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg border border-border/50">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustDimensions(label as any, 'row', -1)}><Minus className="h-3 w-3"/></Button>
            <span className="text-xs font-mono w-4 text-center">{m.length}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustDimensions(label as any, 'row', 1)}><Plus className="h-3 w-3"/></Button>
          </div>
          <span className="text-muted-foreground text-[10px]">×</span>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustDimensions(label as any, 'col', -1)}><Minus className="h-3 w-3"/></Button>
            <span className="text-xs font-mono w-4 text-center">{m[0].length}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustDimensions(label as any, 'col', 1)}><Plus className="h-3 w-3"/></Button>
          </div>
        </div>
      </div>
      <div 
        className="grid gap-1.5 p-3 rounded-xl bg-secondary/10 border border-border/20 overflow-auto max-h-[300px]"
        style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(45px, 1fr))` }}
      >
        {m.map((row, i) => row.map((val, j) => (
          <Input
            key={`${i}-${j}`}
            type="number"
            value={val}
            onChange={(e) => updateMatrix(m, setM, i, j, e.target.value)}
            className="h-10 text-center font-mono text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
          />
        )))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            Matrix Algebra
          </CardTitle>
          <CardDescription>Advanced multidimensional transformations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderMatrixInput(matrixA, setMatrixA, 'A')}
            {renderMatrixInput(matrixB, setMatrixB, 'B')}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button onClick={() => wrapOp(() => matrixLogic.add(matrixA, matrixB))} variant="secondary" className="gap-2 font-bold shadow-sm">
                A + B
              </Button>
              <Button onClick={() => wrapOp(() => matrixLogic.subtract(matrixA, matrixB))} variant="secondary" className="gap-2 font-bold shadow-sm">
                A - B
              </Button>
              <Button onClick={() => wrapOp(() => matrixLogic.multiply(matrixA, matrixB))} variant="secondary" className="gap-2 font-bold shadow-sm">
                A × B
              </Button>
              <Button onClick={() => wrapOp(() => matrixLogic.multiplyScalar(matrixA, 2))} variant="outline" className="gap-2 font-medium">
                2 × A
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t pt-4 border-border/30">
              <Button variant="ghost" className="text-xs h-9 uppercase tracking-wider" onClick={() => wrapOp(() => matrixLogic.determinant(matrixA))}>det(A)</Button>
              <Button variant="ghost" className="text-xs h-9 uppercase tracking-wider" onClick={() => wrapOp(() => matrixLogic.inverse(matrixA))}>inv(A)</Button>
              <Button variant="ghost" className="text-xs h-9 uppercase tracking-wider" onClick={() => wrapOp(() => matrixLogic.transpose(matrixA))}>Trans(A)</Button>
              <Button variant="ghost" className="text-xs h-9 uppercase tracking-wider" onClick={() => wrapOp(() => matrixLogic.rref(matrixA))}>RREF(A)</Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-lg border border-destructive/20 animate-pulse">
              Error: {error}
            </div>
          )}

          {result !== null && (
            <div className="space-y-3 bg-secondary/20 p-6 rounded-2xl border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <ArrowRight className="h-3 w-3"/> Result
                </span>
                {typeof result !== 'number' && (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-[10px] text-muted-foreground uppercase hover:text-primary"
                    onClick={() => { setMatrixA(result); setResult(null); }}
                  >
                    Load into A
                  </Button>
                )}
              </div>
              
              {typeof result === 'number' ? (
                <div className="text-3xl font-mono font-bold text-center py-4">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
              ) : (
                <div 
                  className="grid gap-2 overflow-auto"
                  style={{ gridTemplateColumns: `repeat(${result[0].length}, minmax(40px, 1fr))` }}
                >
                  {result.map((row, i) => row.map((val, j) => (
                    <div key={`${i}-${j}`} className="h-10 flex items-center justify-center font-mono font-bold bg-background/40 rounded border border-border/20 text-sm">
                      {val.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                    </div>
                  )))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational Panel */}
      <Card className="bg-background/60 backdrop-blur-md border border-border/30 hover:shadow-lg transition-all duration-300 lg:col-span-1 h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Theory & Ops
          </CardTitle>
          <CardDescription>Linear Algebra reference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { 
              name: "Matrix Multiplication", 
              desc: "Inner dimensions must match ($n \\times k$) by ($k \\times m$). Results in ($n \\times m$)." 
            },
            { 
              name: "Determinant", 
              desc: "A scalar value describing properties of square matrices. det=0 means the matrix is singular (not invertible)." 
            },
            { 
              name: "RREF", 
              desc: "Reduced Row Echelon Form. Essential for solving simultaneous linear equations using Gaussian elimination." 
            },
            { 
              name: "Inverse Matrix", 
              desc: "A matrix $A^{-1}$ such that $A \\times A^{-1} = I$, where $I$ is the Identity matrix." 
            },
          ].map((item) => (
            <div key={item.name} className="flex flex-col p-4 rounded-xl bg-secondary/30 border border-border/50 gap-2 hover:bg-secondary/40 transition-colors">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.name}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}