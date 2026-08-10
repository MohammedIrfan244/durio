"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPendingReviews, saveBlockLogs } from "@/server/actions/focus-actions";
import { withClientAction } from "@/lib/utils/with-client-action";
import { Zap, ShieldCheck, Flame, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewModal() {
  const [open, setOpen] = useState(false);
  const [pendingBlocks, setPendingBlocks] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, { status: string, points: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for pending reviews after a short delay so it doesn't block initial render
    const checkReviews = async () => {
      const res = await withClientAction(() => getPendingReviews());
      if (res && res.length > 0) {
        setPendingBlocks(res);
        setOpen(true);
      }
    };
    setTimeout(checkReviews, 1500);
  }, []);

  const handleRate = (blockId: string, status: string, energy: string) => {
    let points = 0;
    if (status === "CRUSHED_IT") {
      points = energy === "HIGH" ? 50 : energy === "MEDIUM" ? 30 : 10;
    } else if (status === "SURVIVED") {
      points = energy === "HIGH" ? 25 : energy === "MEDIUM" ? 15 : 5;
    }

    setRatings((prev) => ({
      ...prev,
      [blockId]: { status, points },
    }));
  };

  const submitReviews = async () => {
    const logsToSave = Object.entries(ratings).map(([id, rating]) => ({
      routineBlockId: id,
      status: rating.status,
      flowPoints: rating.points,
    }));

    setIsSubmitting(true);
    const res = await withClientAction(() => saveBlockLogs(logsToSave));
    setIsSubmitting(false);

    if (res) {
      setOpen(false);
    }
  };

  const allRated = pendingBlocks.length > 0 && Object.keys(ratings).length === pendingBlocks.length;
  const totalPoints = Object.values(ratings).reduce((acc, curr) => acc + curr.points, 0);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && setOpen(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="text-orange-500" />
            End of Day Review
          </DialogTitle>
          <DialogDescription>
            Let's review your focus blocks from yesterday. How did you do? Be honest!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2 pr-2 hide-scrollbar-on-main">
          {pendingBlocks.map((block) => (
            <div key={block.id} className="rounded-xl border border-border/50 bg-secondary/20 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{block.title}</h4>
                  <p className="text-xs text-muted-foreground">{block.startTime} - {block.endTime}</p>
                </div>
                <div className="text-[10px] font-bold px-2 py-1 rounded bg-background uppercase tracking-wide">
                  {block.energyLevel}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={ratings[block.id]?.status === "CRUSHED_IT" ? "default" : "outline"}
                  size="sm"
                  className={cn("h-16 flex flex-col gap-1", ratings[block.id]?.status === "CRUSHED_IT" && "bg-emerald-600 hover:bg-emerald-700")}
                  onClick={() => handleRate(block.id, "CRUSHED_IT", block.energyLevel)}
                >
                  <Zap size={16} />
                  <span className="text-xs">Crushed It</span>
                </Button>
                <Button
                  variant={ratings[block.id]?.status === "SURVIVED" ? "default" : "outline"}
                  size="sm"
                  className={cn("h-16 flex flex-col gap-1", ratings[block.id]?.status === "SURVIVED" && "bg-blue-600 hover:bg-blue-700")}
                  onClick={() => handleRate(block.id, "SURVIVED", block.energyLevel)}
                >
                  <ShieldCheck size={16} />
                  <span className="text-xs">Survived</span>
                </Button>
                <Button
                  variant={ratings[block.id]?.status === "TANGENT" ? "default" : "outline"}
                  size="sm"
                  className={cn("h-16 flex flex-col gap-1", ratings[block.id]?.status === "TANGENT" && "bg-destructive hover:bg-destructive")}
                  onClick={() => handleRate(block.id, "TANGENT", block.energyLevel)}
                >
                  <XCircle size={16} />
                  <span className="text-xs">Tangent</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4">
          <div className="text-sm font-semibold text-muted-foreground w-full sm:w-auto text-left">
            Total Flow Points: <span className="text-primary font-bold">{totalPoints} FP</span>
          </div>
          <Button 
            onClick={submitReviews} 
            disabled={!allRated || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
