"use client";
import { useIsMounted } from "@/hooks/use-is-mounted";
import React, { useState } from "react";

type Star = {
  left: number;
  top: number;
  delay: number;
  duration: number;
};

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: 6 + Math.random() * 90,
    delay: Math.random() * -10,
    duration: 5 + Math.random() * 6,
  }));
}

export default function DarkDecor({ stars = 40 }: { stars?: number }) {
  const isMounted = useIsMounted();
  const [items] = useState(() => generateStars(stars));

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      <div className="dark-moon" />

      {items.map((star, i) => (
        <div
          key={i}
          className="dark-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}