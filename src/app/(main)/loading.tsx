import { Loader2 } from "lucide-react";

export default function MainLoading() {
  return (
    <div className="flex h-full min-h-[280px] w-full items-center justify-center rounded-2xl border border-border/60 bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading module...</p>
      </div>
    </div>
  );
}
