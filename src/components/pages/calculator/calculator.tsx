"use client";
import Basic from "./basic/basic";
import Converter from "./converter/converter";
import Percentage from "./percentage/percentage";
import Business from "./business/business";
import Programmer from "./programmer/programmer";
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Calculator as CalculatorIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Calculator() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <CalculatorIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Essential Toolkit
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Your daily calculators for straightforward answers.
        </p>
      </SectionHeaderWrapper>

      {/* Row 1: Basic | Fun Game | Programmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Basic />
        <MathGameWidget />
        <Programmer />
      </div>

      {/* Row 2: Percentage | Business | Converter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Percentage />
        <Business />
        <Converter />
      </div>
    </div>
  );
}

function MathGameWidget() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [op, setOp] = useState('+');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const newOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 20) + 1;
    let n2 = Math.floor(Math.random() * 20) + 1;
    
    if (newOp === '-' && n1 < n2) {
      [n1, n2] = [n2, n1]; // Avoid negatives for quick math
    } else if (newOp === '*') {
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
    }
    
    setNum1(n1);
    setNum2(n2);
    setOp(newOp);
    setAnswer('');
    setStatus('idle');
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) return;
    
    let correct = 0;
    if (op === '+') correct = num1 + num2;
    if (op === '-') correct = num1 - num2;
    if (op === '*') correct = num1 * num2;

    if (parseInt(answer) === correct) {
      setStatus('correct');
      setScore(s => s + 1);
      setTimeout(generateQuestion, 800);
    } else {
      setStatus('wrong');
      setTimeout(() => {
        setScore(0);
        generateQuestion();
      }, 1000);
    }
  };

  return (
    <div className="h-full flex flex-col items-center bg-card/60 backdrop-blur-md rounded-2xl border border-border/30 p-6 shadow-sm">
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CalculatorIcon className="h-4 w-4" /> Quick Math
        </span>
        <span className="text-sm font-bold px-2 py-1 bg-primary/10 text-primary rounded-md">
          Score: {score}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <div className={`text-4xl font-extrabold tracking-tighter mb-6 transition-colors ${
          status === 'correct' ? 'text-green-500' : status === 'wrong' ? 'text-red-500' : 'text-card-foreground'
        }`}>
          {num1} {op} {num2}
        </div>

        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <input
            type="number"
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={status !== 'idle'}
            className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="?"
          />
          <button 
            type="submit" 
            disabled={status !== 'idle' || !answer}
            className="bg-primary text-primary-foreground font-semibold px-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Go
          </button>
        </form>

        <div className="h-4 mt-3 text-xs font-medium">
          {status === 'correct' && <span className="text-green-500 animate-pulse">Nice! +1</span>}
          {status === 'wrong' && <span className="text-red-500 animate-pulse">Oops! Resetting...</span>}
        </div>
      </div>
    </div>
  );
}
