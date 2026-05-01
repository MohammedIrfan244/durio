import React from 'react';
import Graphing from '@/components/pages/calculator/graphing/graphing';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Activity } from "lucide-react";

export const metadata = {
    title: `${APP_NAME} - Graphing Calculator`,
    description: "Visual canvas plotter for mathematical equations.",
};

export default function GraphingCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Graphing Planner
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Visually plot polynomials, quadratics, and trig functions on a continuous canvas.
        </p>
      </SectionHeaderWrapper>
      
      <div className="w-full flex-1 flex flex-col mt-6 min-h-[80vh]">
        <Graphing />
      </div>
    </div>
  );
}
