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
      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
        <div className="dvd-bounce">
          <Image
            src={images.duria}
            alt="Duria Loading"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // Not capacitor, render the marketing page normally
  return <>{children}</>;
}
