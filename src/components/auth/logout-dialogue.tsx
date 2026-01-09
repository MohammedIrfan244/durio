// components/ui/LogoutConfirmDialog.tsx
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LogoutConfirmDialog({
  open,
  onOpenChange,
}: LogoutConfirmDialogProps) {
  const handleLogout = () => {
    onOpenChange(false);
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogOut size={20} className="text-red-600" /> Ready to leave?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to log out of your account. Do you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer bg-secondary/30 border-border/40 focus:bg-secondary/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-secondary/50">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/20 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleLogout}
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}