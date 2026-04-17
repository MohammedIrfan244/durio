import React from 'react';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { BrainCircuit } from "lucide-react";
import ComplexMath from '@/components/pages/calculator/complex/complex';

export const metadata = {
    title: `${APP_NAME} - Complex Mathematics`,
    description: "Solve robust polynomial operations and systematic equations.",
};


export default function ComplexCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Complex Mathematics
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Harness the symbolic engine for calculus derivations and higher-order equation resolution.
        </p>
      </SectionHeaderWrapper>
      
      <div className="w-full">
        <ComplexMath />
      </div>
    </div>
  );
}
