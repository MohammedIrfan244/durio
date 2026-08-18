"use client";
import React, { useState } from "react";
import { useIsMounted } from "@/hooks/use-is-mounted";

function LeafSVG() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <path
        fill="oklch(0.65 0.07 140)"
        d="M2 12c4-5 10-8 18-9-2 6-6 10-12 14C6 19 3 16 2 12z"
      />
    </svg>
  );
}

type Leaf = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

function generateLeaves(count: number): Leaf[] {
  return Array.from({ length: count }, () => ({
    left: 5 + Math.random() * 90,
    top: -20 - Math.random() * 40,
    size: 8 + Math.random() * 12,
    duration: 12 + Math.random() * 10,
    delay: Math.random() * -20,
  }));
}

export default function NaturalDecor({ leaves = 8 }: { leaves?: number }) {
  const isMounted = useIsMounted();
  const [items] = useState(() => generateLeaves(leaves));

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      {/* floating leaves */}
      {items.map((leaf, i) => (
        <div
          key={i}
          className="natural-leaf"
          style={{
            left: `${leaf.left}%`,
            top: `${leaf.top}vh`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            opacity: 0.92,
          }}
        >
          <LeafSVG />
        </div>
      ))}
    </div>
  );
}