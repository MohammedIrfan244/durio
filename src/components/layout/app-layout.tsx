"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import {
  SidebarProvider,
  Sidebar as ShadSidebar,
} from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authPages = ["/auth/login"];

  if (authPages.includes(pathname)) return <>{children}</>;

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

        <div className="flex flex-col flex-1 p-2">
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
      </div>
    </SidebarProvider>
  );
}
