"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateUserProfile } from "@/server/actions/user-action";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

// We can add a full list if needed, or stick to common ones + auto-detected

export default function TimezoneOnboarding() {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState("");
  const router = useRouter();

  useEffect(() => {
    // If logged in and no timezone, show modal
    if (session?.user && !session.user.timezone) {
      setOpen(true);
      // Auto-detect
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
      }
    }
  }, [session]);

  const handleSave = async () => {
    if (!timezone) return;
    setLoading(true);
    try {
      await updateUserProfile({ timezone });
      await update({ timezone }); // update session client-side
      toast.success("Timezone set successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update timezone");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure options include the detected/selected timezone if it's not in the common list
  const allTimezones = Array.from(new Set([...COMMON_TIMEZONES, timezone])).filter(Boolean).sort();

  return (
    <Dialog open={open} onOpenChange={() => {}}> 
      {/* Empty onOpenChange prevents closing by clicking outside/ESC, making it blocking */}
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Welcome! Please set your Timezone</DialogTitle>
          <DialogDescription>
            To ensure your tasks and reminders are accurate, we need to know your local timezone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {allTimezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} disabled={loading || !timezone}>
            {loading ? "Saving..." : "Confirm Timezone"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
