"use client";

import { useState } from "react";
import { converter } from "@/lib/logic/calculator/converter";

export default function Converter() {
  const [ price , setPrice ] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const run = () => {
    const value = converter.currency(price, "USD", "INR");
    setResult(value);
  };

  return (
    <div>
      <h2>Converter</h2>
      <input type="number" className="border-black border-2" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <button onClick={run}>Convert {price} USD → INR</button>
      <p>{result}</p>
    </div>
  );
}
