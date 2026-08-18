"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminWipeDataDialog from "./wipe-data-dialog";

interface AdminUserDeletionSectionProps {
  user: {
    id: string;
    email: string;
    isActive: boolean;
    isDeleted: boolean;
    deactivatedAt: string | Date | null;
    deletedAt: string | Date | null;
  };
}

export default function AdminUserDeletionSection({
  user,
}: AdminUserDeletionSectionProps) {
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false);

  if (!user.isActive && !user.isDeleted && user.deactivatedAt) {
    // Soft deleted
    return (
      <section>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Account Deactivated</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This account has been temporarily deactivated (soft delete). The user can request reactivation.
              </p>
              <p className="text-xs text-muted-foreground">
                Deactivated: {new Date(user.deactivatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (user.isDeleted && user.deletedAt) {
    // Hard deleted
    return (
      <section>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="text-destructive mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Marked for Permanent Deletion
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This account has been marked for permanent deletion. All data is scheduled for removal.
                </p>
                <p className="text-xs text-muted-foreground">
                  Deletion requested: {new Date(user.deletedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-destructive/20">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setWipeDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <AlertTriangle size={16} className="mr-2" />
              Wipe All Data Now
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Click to immediately and permanently delete all associated data for this user.
              This user record will also be removed and cannot be recovered.
            </p>
          </div>

          <AdminWipeDataDialog
            userId={user.id}
            userEmail={user.email}
            open={wipeDialogOpen}
            onClose={() => setWipeDialogOpen(false)}
          />
        </div>
      </section>
    );
  }

  return null;
}
