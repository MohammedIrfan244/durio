import React from 'react';
import Statistics from '@/components/pages/calculator/statistics/statistics';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { LineChart } from "lucide-react";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Statistics Calculator - ${APP_NAME}`,
  description:
    "Analyze datasets with ease — evaluate variations, modes, permutations, standard deviations, and regression logic.",
  openGraph: {
    title: `Statistics Calculator - ${APP_NAME}`,
    description: "Statistical analysis tools: variations, modes, permutations, and regression.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Statistics Calculator - ${APP_NAME}`,
    description: "Statistical analysis tools: variations, modes, permutations, and regression.",
  },
};


export default function StatisticsCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <LineChart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            Statistics Analysis
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Evaluate variations, modes, permutations, and regression logic instantly.
        </p>
      </SectionHeaderWrapper>
      
      <div className="w-full mt-6">
        <Statistics />
      </div>
    </div>
  );
}
