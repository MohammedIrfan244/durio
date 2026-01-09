import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApplyFiltersGroupProps {
  applyFilters: () => void;
}

export const ApplyFiltersGroup: React.FC<ApplyFiltersGroupProps> = ({ applyFilters }) => {
  return (
    <div className="flex flex-col gap-2 w-full col-span-1">
      {/* Invisible label for alignment */}
      <Label className="text-xs font-semibold text-transparent select-none">
        &nbsp;
      </Label>
      <div className="group">
        <Button
          onClick={applyFilters}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center w-full group-hover:flex-row-reverse transition-all duration-300 font-semibold shadow-lg hover:shadow-primary/20"
        >
          <Filter className="h-4 w-4 mr-2 transition-all duration-300 group-hover:ml-2 group-hover:rotate-90 group-hover:mr-0" />
          <span className="transition-all duration-300 group-hover:mr-2">
            Apply Filters!
          </span>
        </Button>
      </div>
    </div>
  );
};
