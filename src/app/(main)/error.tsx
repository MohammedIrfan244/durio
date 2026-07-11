"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <Card className="relative w-full max-w-lg overflow-hidden border-border/50 bg-card/90 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-primary/10" />
        <CardContent className="relative flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Something slipped.</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              DURIO hit a rough patch while loading this space. You can try again, or head back to the dashboard.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button asChild type="button" variant="outline" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
