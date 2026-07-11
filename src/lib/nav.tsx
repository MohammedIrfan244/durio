import { 
  Home, CheckCircle, StickyNote, CalendarDays, Dumbbell, 
  Calculator, Image as ImageIcon, Moon, Heart, 
  PenLine, Rocket, BookOpen, Hourglass
} from "lucide-react";
import Image from "next/image";
import { APP_REGISTRY } from "@/config/modules";
import images from "@/asset/images.json";
import { DuriaAvatar } from "@/components/shared/duria-avatar";

export interface NavItem {
  label: string;
  url: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  animationClass: string;
  subItems?: { label: string; url: string }[];
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    label: "Home",
    url: "/dashboard",
    description: "Your comfy starting point. Good vibes only.",
    icon: <Home size={18} />,
    color: "#F87171",
    animationClass: "animate-home",
    disabled: !APP_REGISTRY.MODULES.HOME.enabled || APP_REGISTRY.MODULES.HOME.systemDisabled
  },
  {
    label: "My To-Dos",
    url: "/todo",
    description: "Let's get that sweet, sweet done feeling.",
    icon: <CheckCircle size={18} />,
    color: "#60A5FA",
    animationClass: "animate-check",
    disabled: !APP_REGISTRY.MODULES.TODO.enabled || APP_REGISTRY.MODULES.TODO.systemDisabled
  },
    {
    label: "My Notes",
    url: "/notes",
    icon: <StickyNote size={18} />,
    description: "Catching those random brainstorms.",
    color: "#F472B6",
    animationClass: "animate-note",
    disabled: !APP_REGISTRY.MODULES.NOTES.enabled || APP_REGISTRY.MODULES.NOTES.systemDisabled
  },

  {
    label: "My Calendar",
    url: "/calendar",
    icon: <CalendarDays size={18} />,
    description: "Plotting the adventures and chilling time.",
    color: "#FBBF24",
    animationClass: "animate-calendar",
    disabled: !APP_REGISTRY.MODULES.CALENDAR.enabled || APP_REGISTRY.MODULES.CALENDAR.systemDisabled
  },
  {
    label: "Reading List",
    url: "/books",
    icon: <BookOpen size={18} />,
    description: "Escaping reality, one chapter at a time.",
    color: "#34D399",
    animationClass: "animate-book",
    disabled: !APP_REGISTRY.MODULES.BOOKS.enabled || APP_REGISTRY.MODULES.BOOKS.systemDisabled
  },
  {
    label: "My Journal",
    url: "/journal",
    icon: <PenLine size={18} />,
    description: "Your safe space to vent and reflect.",
    color: "#C084FC",
    animationClass: "animate-journal",
    disabled: !APP_REGISTRY.MODULES.JOURNAL.enabled || APP_REGISTRY.MODULES.JOURNAL.systemDisabled
  },
  {
    label: "Photo Album",
    url: "/album",
    icon: <ImageIcon size={18} />,
    description: "Memories are just a click away.",
    color: "#FCD34D",
    animationClass: "animate-photo",
    disabled: !APP_REGISTRY.MODULES.ALBUM.enabled || APP_REGISTRY.MODULES.ALBUM.systemDisabled
  },
  {
    label: "Workouts",
    url: "/workout",
    icon: <Dumbbell size={18} />,
    description: "Get those endorphins movin' and groovin'.",
    color: "#4ADE80",
    animationClass: "animate-dumbbell",
    disabled: !APP_REGISTRY.MODULES.WORKOUT.enabled || APP_REGISTRY.MODULES.WORKOUT.systemDisabled
  },
  {
    label: "Sleep Tracker",
    url: "/sleep",
    icon: <Moon size={18} />,
    description: "Optimizing rest for maximum chill.",
    color: "#6366F1",
    animationClass: "animate-moon",
    disabled: !APP_REGISTRY.MODULES.SLEEP.enabled || APP_REGISTRY.MODULES.SLEEP.systemDisabled
  },
  {
    label: "Cycle Tracker",
    url: "/menstruation",
    icon: <Heart size={18} />,
    description: "Staying in tune with the body's flow.",
    color: "#FB7185",
    animationClass: "animate-heart",
    disabled: !APP_REGISTRY.MODULES.MENSTRUATION.enabled || APP_REGISTRY.MODULES.MENSTRUATION.systemDisabled
  },
  {
    label: "My Projects",
    url: "/projects",
    icon: <Rocket size={18} />,
    description: "Where the magic and big things happen.",
    color: "#FB923C",
    animationClass: "animate-rocket",
    disabled: !APP_REGISTRY.MODULES.PROJECTS.enabled || APP_REGISTRY.MODULES.PROJECTS.systemDisabled
  },
  {
    label: "Focus Time",
    url: "/focus",
    icon: <Hourglass size={18} />,
    description: "Lock out the noise, lock in the flow.",
    color: "#A78BFA",
    animationClass: "animate-hourglass",
    disabled: !APP_REGISTRY.MODULES.FOCUS.enabled || APP_REGISTRY.MODULES.FOCUS.systemDisabled
  },
  {
    label: "Quick Calc",
    url: "/calculator",
    icon: <Calculator size={18} />,
    description: "Math? We just need fast answers.",
    color: "#818CF8",
    animationClass: "animate-calc",
    disabled: !APP_REGISTRY.MODULES.CALCULATOR.enabled || APP_REGISTRY.MODULES.CALCULATOR.systemDisabled,
    subItems: [
      { label: "Essential Toolkit", url: "/calculator/essential" },
      { label: "Scientific", url: "/calculator/scientific" },
      { label: "Graphing", url: "/calculator/graphing" },
      { label: "Statistics", url: "/calculator/statistics" },
      { label: "Matrix & Linear", url: "/calculator/matrix" },
      { label: "Complex Math", url: "/calculator/complex" }
    ]
  },
  {
    label: "Talk with DURIA",
    url: "/duria",
    icon: <DuriaAvatar size={18} />,
    description: "Your friendly AI companion.",
    color: "#22D3EE",
    animationClass: "animate-smile",
    disabled: !APP_REGISTRY.MODULES.DURIA.enabled || APP_REGISTRY.MODULES.DURIA.systemDisabled
  }
];
