import { 
  Home, CheckCircle, StickyNote, CalendarDays, Dumbbell, 
  Calculator, Image as ImageIcon, Moon, Heart, Zap, 
  PenLine, Rocket, BookOpen, Archive, Hourglass, SmilePlus 
} from "lucide-react";

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
    url: "/",
    description: "Your comfy starting point. Good vibes only.",
    icon: <Home size={18} />,
    color: "#F87171",
    animationClass: "animate-home"
  },
  {
    label: "My To-Dos",
    url: "/todo",
    description: "Let's get that sweet, sweet done feeling.",
    icon: <CheckCircle size={18} />,
    color: "#60A5FA",
    animationClass: "animate-check"
  },
    {
    label: "My Notes",
    url: "/notes",
    icon: <StickyNote size={18} />,
    description: "Catching those random brainstorms.",
    color: "#F472B6",
    animationClass: "animate-note"
  },

  {
    label: "My Calendar",
    url: "/calendar",
    icon: <CalendarDays size={18} />,
    description: "Plotting the adventures and chilling time.",
    color: "#FBBF24",
    animationClass: "animate-calendar"
  },
  {
    label: "Reading List",
    url: "/books",
    icon: <BookOpen size={18} />,
    description: "Escaping reality, one chapter at a time.",
    color: "#34D399",
    animationClass: "animate-book",
    disabled: true
  },
  {
    label: "My Journal",
    url: "/journal",
    icon: <PenLine size={18} />,
    description: "Your safe space to vent and reflect.",
    color: "#C084FC",
    animationClass: "animate-journal",
    disabled: true
  },
  {
    label: "Photo Album",
    url: "/album",
    icon: <ImageIcon size={18} />,
    description: "Memories are just a click away.",
    color: "#FCD34D",
    animationClass: "animate-photo",
    disabled: true
  },
  {
    label: "Workouts",
    url: "/workout",
    icon: <Dumbbell size={18} />,
    description: "Get those endorphins movin' and groovin'.",
    color: "#4ADE80",
    animationClass: "animate-dumbbell",
    disabled: true
  },
  {
    label: "Sleep Tracker",
    url: "/sleep",
    icon: <Moon size={18} />,
    description: "Optimizing rest for maximum chill.",
    color: "#6366F1",
    animationClass: "animate-moon",
    disabled: true
  },
  {
    label: "Cycle Tracker",
    url: "/menstruation",
    icon: <Heart size={18} />,
    description: "Staying in tune with the body's flow.",
    color: "#FB7185",
    animationClass: "animate-heart",
    disabled: true
  },
  {
    label: "My Projects",
    url: "/projects",
    icon: <Rocket size={18} />,
    description: "Where the magic and big things happen.",
    color: "#FB923C",
    animationClass: "animate-rocket",
    disabled: true
  },
  {
    label: "Focus Time",
    url: "/focus",
    icon: <Hourglass size={18} />,
    description: "Lock out the noise, lock in the flow.",
    color: "#A78BFA",
    animationClass: "animate-hourglass",
    disabled: true
  },
  {
    label: "Resources Stash",
    url: "/resources",
    icon: <Archive size={18} />,
    description: "My favorite digital tools and goodies.",
    color: "#2DD4BF",
    animationClass: "animate-archive",
    disabled: true
  },
  {
    label: "Quick Calc",
    url: "/calculator",
    icon: <Calculator size={18} />,
    description: "Math? We just need fast answers.",
    color: "#818CF8",
    animationClass: "animate-calc",
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
    icon: <SmilePlus size={18} />,
    description: "Your friendly AI companion.",
    color: "#22D3EE",
    animationClass: "animate-smile",
    disabled: true
  }
];
