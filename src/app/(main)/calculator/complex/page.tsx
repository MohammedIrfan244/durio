import React from 'react';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { BrainCircuit } from "lucide-react";
import ComplexMath from '@/components/pages/calculator/complex/complex';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Complex Mathematics - ${APP_NAME}`,
  description:
    "Solve polynomial operations, symbolic calculus derivations, and higher-order equation resolution with ease.",
  openGraph: {
    title: `Complex Mathematics - ${APP_NAME}`,
    description: "Advanced polynomial operations and symbolic equation solving.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Complex Mathematics - ${APP_NAME}`,
    description: "Advanced polynomial operations and symbolic equation solving.",
  },
};



export default function ComplexCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            Complex Mathematics
          </h2>
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
