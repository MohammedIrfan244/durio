import React from 'react';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Grid3x3 } from "lucide-react";

import MatrixCalculator from '@/components/pages/calculator/matrix/matrix';

import { APP_NAME } from '@/lib/brand';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Matrix & Linear Algebra - ${APP_NAME}`,
  description:
    "Perform complex matrix arithmetic, determinants, inversions, and standard linear transformations.",
  openGraph: {
    title: `Matrix & Linear Algebra - ${APP_NAME}`,
    description: "Complex matrix arithmetic, determinants, and linear transformations.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Matrix & Linear Algebra - ${APP_NAME}`,
    description: "Complex matrix arithmetic, determinants, and linear transformations.",
  },
};


export default function MatrixCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <Grid3x3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            Matrix & Linear Algebra
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Perform complex matrix arithmetic, determinants, and standard linear transformations.
        </p>
      </SectionHeaderWrapper>
      
      <div className="w-full">
        <MatrixCalculator />
      </div>
    </div>
  );
}
