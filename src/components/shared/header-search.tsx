import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; 
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) => {
  return (
    <div className={cn("flex-1 relative group nav-item-group", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary animate-zap" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-background/60 backdrop-blur-sm border-border/40 transition-all duration-300 hover:border-primary/50 focus:bg-background/80 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
      />
    </div>
  );
};
