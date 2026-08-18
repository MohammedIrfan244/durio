"use client";
import { useIsMounted } from "@/hooks/use-is-mounted";
import React, { useState } from "react";

function BatSVG() {
  return (
    <svg viewBox="0 0 24 12" width="100%" height="100%" aria-hidden>
      <path d="M0 8c3-4 5-4 7-2 2-2 4-3 7 2 2-3 4-3 6 0v4H0V8z" />
    </svg>
  );
}

type Ember = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

type Bat = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

function generateEmbers(count: number): Ember[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: 50 + Math.random() * 40,
    size: 5 + Math.random() * 8,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * -5,
  }));
}

function generateBats(count: number): Bat[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 90,
    top: 70 - Math.random() * 50,
    size: 20 + Math.random() * 14,
    duration: 6 + Math.random() * 6,
    delay: Math.random() * -8,
  }));
}


export default function GothicDecor({ embers = 14, bats = 6 }: { embers?: number; bats?: number }) {
  const isMounted = useIsMounted();
  const [emberItems] = useState(() => generateEmbers(embers));
  const [batItems] = useState(() => generateBats(bats));

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      <div className="gothic-aura" />
      <div className="gothic-crack" />

      {emberItems.map((ember, i) => (
        <div
          key={`e${i}`}
          className="gothic-ember"
          style={{
            left: `${ember.left}%`,
            top: `${ember.top}%`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            animationDuration: `${ember.duration}s`,
            animationDelay: `${ember.delay}s`,
          }}
        />
      ))}

      {batItems.map((bat, i) => (
        <div
          key={`b${i}`}
          className="gothic-bat"
          style={{
            left: `${bat.left}%`,
            top: `${bat.top}%`,
            width: `${bat.size}px`,
            height: `${bat.size * 0.6}px`,
            animationDuration: `${bat.duration}s`,
            animationDelay: `${bat.delay}s`,
          }}
        >
          <BatSVG />
        </div>
      ))}
    </div>
  );
}