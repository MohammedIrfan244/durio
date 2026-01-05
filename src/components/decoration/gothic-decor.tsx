"use client";
import React, { useEffect, useState } from "react";

function BatSVG() {
  return (
    <svg viewBox="0 0 24 12" width="100%" height="100%" aria-hidden>
      <path d="M0 8c3-4 5-4 7-2 2-2 4-3 7 2 2-3 4-3 6 0v4H0V8z" />
    </svg>
  );
}

export default function GothicDecor({ embers = 14, bats = 6 }) {
  const emberItems = Array.from({ length: embers });
  const batItems = Array.from({ length: bats });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      <div className="gothic-aura" />
      <div className="gothic-crack" />

      {emberItems.map((_, i) => {
        const left = Math.random() * 100;
        const top = 50 + Math.random() * 40;
        const size = 5 + Math.random() * 8;
        const duration = 3 + Math.random() * 2;
        const delay = Math.random() * -5;

        return (
          <div
            key={`e${i}`}
            className="gothic-ember"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      {batItems.map((_, i) => {
        const left = Math.random() * 90;
        const top = 70 - Math.random() * 50;
        const size = 20 + Math.random() * 14;
        const duration = 6 + Math.random() * 6;
        const delay = Math.random() * -8;

        return (
          <div
            key={`b${i}`}
            className="gothic-bat"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size * 0.6}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <BatSVG />
          </div>
        );
      })}
    </div>
  );
}

