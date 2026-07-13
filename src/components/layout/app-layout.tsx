"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import {
  SidebarProvider,
  Sidebar as ShadSidebar,
} from "@/components/ui/sidebar";

const FloatingCalculator = dynamic(
  () => import("@/components/shared/floating-calculator"),
  { ssr: false }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDuriaPage = pathname === "/duria";

  if (pathname.startsWith("/auth")) return <>{children}</>;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <ShadSidebar
          variant="floating"
          collapsible="icon"
          className="border-r border-foreground/10"
        >
          <Sidebar />
        </ShadSidebar>

        <div className="flex flex-col flex-1 p-2 min-w-0 min-h-0">
          {" "}
          <Header />
          <main
            style={{
              backgroundColor: "transparent",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
            className="flex-1 overflow-y-auto hide-scrollbar-on-main main-content-pattern"
          >
            {children}
          </main>
        </div>
        {!isDuriaPage && <FloatingCalculator />}
      </div>
    </SidebarProvider>
  );
}
