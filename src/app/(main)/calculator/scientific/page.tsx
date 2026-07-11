import React from 'react';
import Scientific from '@/components/pages/calculator/scientific/scientific';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Calculator as CalculatorIcon } from "lucide-react";

import { APP_NAME } from '@/lib/brand';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Scientific Calculator - ${APP_NAME}`,
  description:
    "Advanced scientific calculator with trigonometric, logarithmic, and exponential functions.",
  openGraph: {
    title: `Scientific Calculator - ${APP_NAME}`,
    description: "Advanced trig, log, and exponent functions in an isolated environment.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Scientific Calculator - ${APP_NAME}`,
    description: "Advanced trig, log, and exponent functions in an isolated environment.",
  },
};


export default function ScientificCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <CalculatorIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            Scientific Calculator
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Advanced trigonometric, logarithmic, and exponent functions in an isolated environment.
        </p>
      </SectionHeaderWrapper>
      
      <div className="w-full mt-6">
        <Scientific />
      </div>
    </div>
  );
}
