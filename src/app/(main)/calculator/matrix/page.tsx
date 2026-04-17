import React from 'react';
import { APP_NAME } from '@/lib/brand';
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Grid3x3 } from "lucide-react";

export const metadata = {
    title: `${APP_NAME} - Matrix Algebra`,
    description: "Transform multidimensional arrays rapidly.",
};

export default function MatrixCalculatorPage() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <Grid3x3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Matrix & Linear Algebra
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Component logic in development...
        </p>
      </SectionHeaderWrapper>
    </div>
  );
}
