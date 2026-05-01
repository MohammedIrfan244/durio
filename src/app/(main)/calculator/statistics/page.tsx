import React from 'react';
import Statistics from '@/components/pages/calculator/statistics/statistics';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { LineChart } from "lucide-react";

export const metadata = {
    title: `${APP_NAME} - Statistics Calculator`,
    description: "Analyze datasets seamlessly.",
};

export default function StatisticsCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <LineChart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Statistics Analysis
          </h1>
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
