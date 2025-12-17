"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { navItems } from "@/lib/nav";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  const router = useRouter();
  const { state } = useSidebar();
  const isOpen = state === "expanded";
  const { theme } = useTheme();

  return (
    <>
      <div className="relative overflow-hidden h-screen flex flex-col justify-between">
        <SidebarHeader className="px-5">
          {isOpen ? (
            <Link
              href="/"
              className="flex flex-col border-b pb-4 pt-2 space-y-1"
            >
              <h2
                className={`text-2xl md:text-3xl font-bold md:font-extrabold text-accent-foreground tracking-tight title-animate ${jakarta.className}`}
              >
                {APP_NAME}
              </h2>
              <p className="text-xs md:text-sm tracking-tight text-muted-foreground mt-1">
                Your personal daily companion
              </p>
            </Link>
          ) : (
            <Link
              href="/"
              className="text-2xl font-bold text-foreground tracking-tight transform -translate-x-1 title"
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
              const isActive = pathname === item.url;
              return (
                <div key={item.url}>
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      asChild
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 text-sm nav-item-group"
                      >
                        <span
                          style={{
                            color: item.color,
                            opacity: isActive ? 1 : 0.9,
                          }}
                          className={`flex-shrink-0 ${item.animationClass}`}
                        >
                          {item.icon}
                        </span>

                        {isOpen && (
                          <span className="relative top-[1px]">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
