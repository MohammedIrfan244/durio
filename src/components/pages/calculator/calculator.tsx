import Basic from "./basic/basic";
import Converter from "./converter/converter";
import Percentage from "./percentage/percentage";
import Business from "./business/business";
import Scientific from "./scientific/scientific";
import Programmer from "./programmer/programmer";
import Statistics from "./statistics/statistics";
import Graphing from "./graphing/graphing";
import { SectionHeaderWrapper } from "@/components/layout/section-header-wrapper";
import { Calculator as CalculatorIcon } from "lucide-react";

export default function Calculator() {
  return (
    <div className="section-wrapper space-y-6">
      <SectionHeaderWrapper>
        <div className="flex items-center gap-3">
          <CalculatorIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Calculator Suite
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          A comprehensive suite of tools for all your mathematical and conversion needs.
        </p>
      </SectionHeaderWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <Basic />
        <Percentage />
        <Converter />
        <Business />
        <Programmer />
        <Statistics />
        <Scientific />
        <Graphing />
      </div>
    </div>
  );
}
