import { IPriorityWithNone, ITodoStatusWithNone } from "@/types/todo";
import { Plus_Jakarta_Sans } from "next/font/google";

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const priorityColor: Record<IPriorityWithNone, string> = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
  NONE: "text-muted-foreground",
};  

export const statusColor: Record<ITodoStatusWithNone, string> = {
  PLAN: "text-blue-500",
  PENDING: "text-orange-500",
  DONE: "text-green-600",
  CANCELLED: "text-gray-400",
  OVERDUE: "text-red-600",
  ARCHIVED: "text-muted-foreground",
  NONE: "text-muted-foreground",
};

export const statusToneBoard: Record<ITodoStatusWithNone, string> = {
  PLAN: "blue-500",
  PENDING: "orange-500",
  DONE: "green-600",
  CANCELLED: "gray-400",
  OVERDUE: "red-600",
  ARCHIVED: "muted",
  NONE: "muted",
} as const;

export const statusColorBoard: Record<ITodoStatusWithNone, string> = {
  PLAN: "text-blue-500",
  PENDING: "text-orange-500",
  DONE: "text-green-600",
  CANCELLED: "text-gray-400",
  OVERDUE: "text-red-600",
  ARCHIVED: "text-muted-foreground",
  NONE: "text-muted-foreground",
};

export const statusBgColorBoard: Record<ITodoStatusWithNone, string> = {
  PLAN: "bg-blue-500/10",
  PENDING: "bg-orange-500/10",
  DONE: "bg-green-600/10",
  CANCELLED: "bg-gray-400/10",
  OVERDUE: "bg-red-600/10",
  ARCHIVED: "bg-muted/10",
  NONE: "bg-muted/10",
};

export const APP_NAME = "DURIO";