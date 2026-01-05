"use client";
import React, { useEffect, useState } from "react";

export default function DarkDecor({ stars = 40 }: { stars?: number }) {
  const items = Array.from({ length: stars });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      <div className="dark-moon" />

      {items.map((_, i) => {
        const left = Math.random() * 100;
        const top = 6 + Math.random() * 90; 
        const delay = Math.random() * -10;
        const duration = 5 + Math.random() * 6;

        return (
          <div
            key={i}
            className="dark-star"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
