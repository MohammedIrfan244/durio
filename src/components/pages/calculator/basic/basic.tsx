"use client";

import { useState } from "react";
import { calculate } from "@/lib/logic/calculator/basic";

export default function Basic() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const run = () => {
    try {
      setResult(calculate(input));
    } catch {
      setResult(null);
    }
  };

  return (
    <div>
      <h2>Basic</h2>
      <input className="border-black border-2" value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={run}> calculate </button>
      <p>Result: {result}</p>
    </div>
  );
}
