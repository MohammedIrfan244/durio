"use client";

import { useCapacitor } from "@/hooks/use-capacitor";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import images from "@/assets/images.json";

export default function MobileEntryWrapper({ children }: { children: React.ReactNode }) {
  const isCapacitor = useCapacitor();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isCapacitor === true) {
      if (status === "authenticated") {
        router.replace("/dashboard");
      } else if (status === "unauthenticated") {
        router.replace("/auth/login");
      }
    }
  }, [isCapacitor, status, router]);

  // While checking capacitor status or if it IS capacitor but we haven't redirected yet
  if (isCapacitor === null || isCapacitor === true) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="relative w-32 h-32 animate-pulse">
          <Image
            src={images.duria}
            alt="Duria"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // Not capacitor, render the marketing page normally
  return <>{children}</>;
}
