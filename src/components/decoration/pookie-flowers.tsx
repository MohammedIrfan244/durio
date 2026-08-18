"use client";
import React, { useState } from "react";
import { useIsMounted } from "@/hooks/use-is-mounted";

function PetalSVG({ white }: { white: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <path
        fill={white ? "#ffffff" : "#ff89b6"}
        d="M12 2c1.1 2 4 3 4 6s-2 6-4 8c-2-2-5-6-4-10S12 2 12 2z"
      />
    </svg>
  );
}

type Petal = {
  left: number;
  top: number;
  duration: number;
  delay: number;
  swirl: string;
  size: number;
  isWhite: boolean;
};

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: -10 - Math.random() * 10,
    duration: 12 + Math.random() * 10,
    delay: Math.random() * -14,
    swirl: Math.random() > 0.5 ? "swirl" : "",
    size: 10 + Math.random() * 14,
    isWhite: Math.random() < 0.65,
  }));
}

export default function PookieFlowers({ count = 24 }: { count?: number }) {
  const isMounted = useIsMounted();
  const [petals] = useState(() => generatePetals(count));

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      {petals.map((petal, i) => (
        <div
          key={i}
          className={`pookie-petal ${petal.swirl}`}
          style={{
            left: `${petal.left}%`,
            top: `${petal.top}vh`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            opacity: 0.95,
          }}
        >
          <PetalSVG white={petal.isWhite} />
        </div>
      ))}
    </div>
  );
}