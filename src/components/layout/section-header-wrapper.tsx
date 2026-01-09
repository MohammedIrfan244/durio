"use client"
import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useThemeImage } from "@/hooks/use-theme-image";
import { cn } from "@/lib/utils";

interface SectionHeaderWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeaderWrapper({
  children,
  className,
}: SectionHeaderWrapperProps) {
  const backgroundImage = useThemeImage();

  return (
    <Card
      className={cn(
        "border w-full card overflow-hidden relative",
        className
      )}
    >
      {backgroundImage && (
        <div className="absolute inset-0 z-0 transition-all duration-700 ease-in-out">
          <Image
            src={backgroundImage}
            alt="Header Background"
            fill
            className="object-cover opacity-20 transition-all duration-700 ease-in-out animate-ken-burns"
          />
          <div className="absolute inset-0 bg-background/50 mix-blend-overlay" />
          <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
        </div>
      )}
      <div className="w-full p-4 sm:p-6 pb-4 relative z-10 transition-all duration-700 ease-in-out">
        {children}
      </div>
    </Card>
  );
}
