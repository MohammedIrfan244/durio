import React from 'react';
import Graphing from '@/components/pages/calculator/graphing/graphing';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Activity } from "lucide-react";

import { APP_NAME } from '@/lib/brand';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Graphing Calculator - ${APP_NAME}`,
  description:
    "Visually plot polynomials, quadratics, and trigonometric functions on a continuous mathematical canvas.",
  openGraph: {
    title: `Graphing Calculator - ${APP_NAME}`,
    description: "Plot and visualize mathematical equations on an interactive graphing canvas.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Graphing Calculator - ${APP_NAME}`,
    description: "Plot and visualize mathematical equations on an interactive graphing canvas.",
  },
};


export default function GraphingCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            Graphing Planner
          </h2>
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
