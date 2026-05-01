"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { navItems } from "@/lib/nav";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";
import clsx from "clsx";
import LogoutConfirmDialog from "../auth/logout-dialogue";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

/* decorations */
import PookieFlowers from "@/components/decoration/pookie-flowers";
import NaturalDecor from "@/components/decoration/natural-decor";
import GothicDecor from "@/components/decoration/gothic-decor";
import DarkDecor from "@/components/decoration/dark-decor";
import LightDecor from "@/components/decoration/light-decor";
import { APP_NAME, jakarta } from "@/lib/brand";

export default function Sidebar() {
  const pathname = usePathname();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const router = useRouter();
  const { state } = useSidebar();
  const isOpen = state === "expanded";
  const { theme } = useTheme();

  useEffect(() => {
    // Auto-collapse any manually opened groups when navigating out of their scope
    setOpenGroups((prev) => 
      prev.filter((url) => pathname === url || (url !== "/" && pathname.startsWith(url + "/")))
    );
  }, [pathname]);

  const toggleGroup = (url: string) => {
    setOpenGroups((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  return (
    <>
      <div className="relative overflow-hidden h-screen flex flex-col justify-between">
        <SidebarHeader className="px-5">
          {isOpen ? (
            <Link
              href="/"
              className="flex flex-col border-b cursor-pointer pb-4 pt-2 space-y-1"
            >
              <h2
                style={{ fontFamily: "var(--font-bubbly)" }}
                className={`text-2xl md:text-3xl lg:text-4xl cursor-pointer font-bold md:font-extrabold text-accent-foreground tracking-tight bubbly-text cursor-default`}
              >
                {APP_NAME.split("").map((char, index) => (
                  <span
                    key={index}
                    className="letter-bubble"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h2>
              <p className="text-xs md:text-sm tracking-tight text-muted-foreground mt-1">
                Your personal daily companion
              </p>
            </Link>
          ) : (
            <Link
              href="/"
              style={{ fontFamily: "var(--font-bubbly)" }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold cursor-pointer text-foreground tracking-tigh transform -translate-x-1 title"
            >
              <h1>{APP_NAME[0]}</h1>
            </Link>
          )}
        </SidebarHeader>

        <SidebarContent
          className={clsx(
            "pt-3 overflow-y-auto hide-scrollbar-on-main",
            isOpen ? "px-1" : "px-2"
          )}
        >
          <SidebarMenu className="space-y-2">
            {navItems.map((item) => {
              const inGroup = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url + "/"));
              const isExpanded = inGroup || openGroups.includes(item.url);
              const isStrictlyActive = pathname === item.url;
              
              // Define content for the navigation button to avoid duplication
              const ButtonContent = (
                <div className="flex items-center gap-3 text-sm nav-item-group w-full">
                  <span
                    style={{
                      color: item.color,
                      opacity: (item.subItems ? inGroup : isStrictlyActive) ? 1 : 0.9,
                    }}
                    className={`flex-shrink-0 ${item.animationClass}`}
                  >
                    {item.icon}
                  </span>

                  {isOpen && (
                    <span className="relative top-[1px] font-medium flex-1 text-left">
                      {item.label}
                    </span>
                  )}
                </div>
              );

              return (
                <div key={item.url} className={isExpanded && item.subItems ? "bg-secondary/20 rounded-md pb-1 mb-2 border border-border/10" : ""}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={item.disabled ? `${item.label} (Disabled)` : item.label}
                      isActive={item.subItems ? inGroup : isStrictlyActive}
                      asChild
                      className={item.disabled ? "opacity-50 pointer-events-none grayscale cursor-not-allowed" : ""}
                    >
                      {item.subItems ? (
                        <button
                          className="w-full text-left"
                          onClick={(e) => {
                            if (!isOpen) { /* Do nothing or expand sidebar */ }
                            toggleGroup(item.url);
                          }}
                          disabled={item.disabled}
                        >
                          {ButtonContent}
                        </button>
                      ) : item.disabled ? (
                        <div className="w-full text-left cursor-not-allowed">
                          {ButtonContent}
                        </div>
                      ) : (
                        <Link href={item.url}>
                          {ButtonContent}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Render Sub Items if this group is active and sidebar is open */}
                  {isOpen && isExpanded && item.subItems && (
                    <div className="pl-9 mt-1 pr-2 space-y-1 relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-5 top-0 bottom-2 w-px bg-border/40" />
                      
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.url;
                        return (
                          <SidebarMenuItem key={sub.url}>
                            <SidebarMenuButton
                              isActive={isSubActive}
                              asChild
                              className={`h-7 px-2 text-xs rounded transition-colors ${
                                isSubActive 
                                  ? "bg-primary/10 text-primary font-bold shadow-sm" 
                                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                              }`}
                            >
                              <Link href={sub.url} className="flex items-center relative">
                                {/* Horizontal connector dash */}
                                <div className="absolute -left-4 top-1/2 w-3 h-px bg-border/40" />
                                {sub.label}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator className="mt-2" />

          <SidebarMenuItem className="list-none ">
            <SidebarMenuButton
              className="text-foreground cursor-pointer settings-button flex items-center gap-3 text-sm"
              onClick={() => router.push("/settings")}
            >
              <Settings className="settings-icon" size={18} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="list-none">
            <SidebarMenuButton
              className="text-red-600 font-semibold cursor-pointer hover:text-red-700 logout-button"
              isActive={false}
              onClick={() => setShowSignOutModal(true)}
            >
              <LogOut className="logout-icon" size={18} />
              {isOpen && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarFooter>

        {/* Conditional decorations */}
        {theme === "pookie" && <PookieFlowers />}
        {theme === "natural" && <NaturalDecor />}
        {theme === "gothic" && <GothicDecor />}
        {theme === "dark" && <DarkDecor />}
        {theme === "light" && <LightDecor />}
      </div>

      <LogoutConfirmDialog
        open={showSignOutModal}
        onOpenChange={setShowSignOutModal}
      />
    </>
  );
}
