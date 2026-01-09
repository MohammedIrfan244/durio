"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUserClient } from "@/lib/utils/get-user-client";
import {
  LogOut,
  Mail,
  User,
  Settings,
  Clock,
  Calendar,
  ChevronDown,
  Sparkles,
  LoaderPinwheelIcon,
} from "lucide-react";

import { navItems } from "@/lib/nav";
import { formatName } from "@/lib/utils/name-formatter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { flagTimestamp } from "@/server/flag-time-stamp";
import { withClientAction } from "@/lib/utils/with-client-action";
import { toast } from "sonner";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Decorations & Dialogs
import PookieFlowers from "../decoration/pookie-flowers";
import NaturalDecor from "../decoration/natural-decor";
import GothicDecor from "../decoration/gothic-decor";
import DarkDecor from "../decoration/dark-decor";
import LightDecor from "../decoration/light-decor";
import LogoutConfirmDialog from "../auth/logout-dialogue";

export default function Header() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const user = useUserClient();

  // State
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);

  const username = formatName(user?.name);
  const userEmail = user?.email;
  const item = navItems.find((i) => i.url === pathname);
  const title = item?.label || "Page";
  const description = item?.description || "Manage your daily activities";

  // Logic: Timestamp flagging
  const handleFlag = async (path: string) => {
    setLoading(true);
    const response = await withClientAction(() => flagTimestamp(path), true);
    if (response === "DONE") toast.success("Your datas has been updated!");
    setLoading(false);
  };

  // Logic: Clock & Initialization
  useEffect(() => {
    setMounted(true);
    flagTimestamp(pathname || "/");

    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );

      const hrs = now.getHours();
      if (3 <= hrs && hrs < 12) setGreeting("Good Morning");
      else if (12 <= hrs && hrs < 18) setGreeting("Good Afternoon");
      else if (18 <= hrs && hrs < 22) setGreeting("Good Evening");
      else if (22 <= hrs && hrs < 1) setGreeting("Good Night");
      else setGreeting("Get some sleep bro !");
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (!mounted) return <Card className="border bg-background h-16" />;

  return (
    <Card className="border card header-pattern">
      <CardContent className="px-6 flex items-center justify-between relative">
        <NavSection title={title} description={description} />

        <TimeDisplay
          greeting={greeting}
          username={username}
          date={date}
          time={time}
        />

        <div className="flex gap-3 shrink-0">
          <ActionButton
            loading={loading}
            onClick={() => handleFlag(pathname || "/")}
          />
          <ModeToggle />
          <UserMenu
            username={username}
            userEmail={userEmail}
            theme={theme}
            onLogout={() => setConfirmLogout(true)}
          />
        </div>
      </CardContent>

      <LogoutConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
      />
    </Card>
  );
}

/* --- SUB-COMPONENTS --- */

const NavSection = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex items-center gap-4 shrink-0">
    <div className="hover:scale-105 active:scale-95 transition-transform duration-300">
      <SidebarTrigger className="text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" />
    </div>
    <Separator
      orientation="vertical"
      className="h-6 hidden sm:block opacity-30"
    />
    <div className="flex flex-col justify-between group cursor-default">
      <h1 className="text-sm md:text-base font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
        {title}
      </h1>
      <p className="text-[11px] text-muted-foreground hidden lg:block font-medium truncate max-w-[200px]">
        {description}
      </p>
    </div>
  </div>
);

interface TimeDisplayProps {
  greeting: string;
  username: string;
  date: string;
  time: string;
}

export const TimeDisplay = ({
  greeting,
  username,
  date,
  time,
}: TimeDisplayProps) => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex select-none">
      <Card
        className="
          group
          relative
          flex items-center justify-center
          overflow-hidden
          border-0 shadow-none
          bg-secondary/40 backdrop-blur
          transition-all duration-500 ease-out
          
          /* idle size */
          h-9 w-[88px]
          
          /* expanded size */
          hover:h-[72px] hover:w-[300px]
        "
      >
        {/* IDLE VIEW — time bubble */}
        <div
          className="
            flex items-center gap-1.5
            text-xs font-semibold
            text-foreground/80
            transition-all duration-500 ease-out
            group-hover:opacity-0 group-hover:scale-75
          "
        >
          <Clock size={12} className="text-primary/70" />
          <span>{time}</span>
        </div>

        {/* EXPANDED VIEW */}
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            gap-2
            opacity-0 translate-y-3
            transition-all duration-500 ease-out delay-75
            group-hover:opacity-100 group-hover:translate-y-0
          "
        >
          {/* Greeting */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-500">
            <Sparkles
              size={10}
              className="text-yellow-500/80 transition-transform duration-700 group-hover:rotate-180"
            />
            <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {greeting}, {username}
            </span>
            <Sparkles
              size={10}
              className="text-yellow-500/80 transition-transform duration-700 group-hover:-rotate-180"
            />
          </div>

          {/* Date & time */}
          <div className="flex items-center gap-3 text-xs font-semibold text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-primary/70" />
              {date}
            </span>

            <span className="w-1 h-1 rounded-full bg-primary/30" />

            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-primary/70" />
              {time}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ActionButton = ({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          onClick={onClick}
          className="h-9 px-3 border-border/60 flex items-center settings-button gap-2 transition-all duration-300 ease-out hover:bg-accent hover:border-primary/30 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <LoaderPinwheelIcon
            size={16}
            className={clsx(loading ? "animate-spin" : "settings-icon")}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Update your current datas
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface UserMenuProps {
  username: string;
  userEmail: string;
  theme?: string;
  onLogout: () => void;
}

const UserMenu = ({ username, userEmail, theme, onLogout }: UserMenuProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 pl-2 pr-3 border-border/60 flex items-center gap-2 transition-all duration-300 ease-out hover:bg-accent hover:border-primary/30 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            <User size={14} />
          </div>
          <span className="text-sm font-medium hidden sm:block">{username}</span>
          <ChevronDown
            size={12}
            className="text-muted-foreground/70 hidden sm:block transition-transform duration-300 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden"
      >
        {theme === "pookie" && <PookieFlowers />}
        {theme === "natural" && <NaturalDecor />}
        {theme === "gothic" && <GothicDecor />}
        {theme === "dark" && <DarkDecor />}
        {theme === "light" && <LightDecor />}

        <DropdownMenuLabel className="font-normal p-2 relative z-10">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none flex items-center gap-2">
              <User size={14} className="text-primary" />
              {username}
            </p>
            <p className="text-xs leading-none text-muted-foreground flex items-center gap-2">
              <Mail size={14} />
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="relative z-10" />

        <DropdownMenuSeparator className="relative z-10" />

        <DropdownMenuItem
          onClick={() => (window.location.href = "/settings")}
          className="cursor-pointer py-2.5 focus:bg-accent settings-button group relative z-10"
        >
          <Settings
            size={16}
            className="mr-2 text-muted-foreground settings-icon group-hover:text-foreground transition-colors"
          />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="relative z-10" />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 py-2.5 logout-button relative z-10"
          onClick={onLogout}
        >
          <LogOut size={16} className="mr-2 logout-icon" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
