"use client";
import React, { useEffect, useState } from "react";

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

export default function PookieFlowers({ count = 24 }: { count?: number }) {
  const petals = Array.from({ length: count });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sidebar-decorations" aria-hidden>
      {petals.map((_, i) => {
        const left = Math.random() * 100;
        const duration = 12 + Math.random() * 10;
        const delay = Math.random() * -14;
        const swirl = Math.random() > 0.5 ? "swirl" : "";
        const size = 10 + Math.random() * 14;
        const isWhite = Math.random() < 0.65;

        return (
          <div
            key={i}
            className={`pookie-petal ${swirl}`}
            style={{
              left: `${left}%`,
              top: `${-10 - Math.random() * 10}vh`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity: 0.95,
            }}
          >
            <PetalSVG white={isWhite} />
          </div>
        );
      })}
    </div>
  );
}
