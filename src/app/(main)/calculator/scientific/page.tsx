import React from 'react';
import Scientific from '@/components/pages/calculator/scientific/scientific';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Calculator as CalculatorIcon } from "lucide-react";

export const metadata = {
    title: `${APP_NAME} - Scientific Calculator`,
    description: "Advanced trigonometric and logarithmic engine.",
};

export default function ScientificCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <CalculatorIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Scientific Calculator
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Advanced trigonometric, logarithmic, and exponent functions in an isolated environment.
        </p>
      </SectionHeaderWrapper>
      
      <div className="max-w-4xl mx-auto mt-6">
        <Scientific />
      </div>
    </div>
  );
}
