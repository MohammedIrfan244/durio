import { differenceInCalendarDays } from "date-fns";
import { 
  OverviewStats, 
  TodayStats, 
  StreakStats, 
  PriorityInsights, 
  TimePatternStats, 
  PersonalInsight 
} from "@/types/todo";

// Helper function to check if a date is a renewal day
export function isRenewalDay(renewStart: Date | null, renewInterval: string | null, renewEvery: number | null, userStartOfToday: Date): boolean {
  if (!renewStart || !renewInterval || !renewEvery) return false;

  const daysDifference = differenceInCalendarDays(userStartOfToday, renewStart);

  if (daysDifference < 0) return false; // Hasn't started yet

  switch (renewInterval) {
    case "DAILY":
      return daysDifference % renewEvery === 0;
    case "WEEKLY":
      return daysDifference % (renewEvery * 7) === 0;
    case "MONTHLY":
      // Simplified: check if it's the right day of month. 
      // Harder with exact days. Using just 30 days approximation for legacy compatibility or...
      // Ideally should check calendar date.
      // But preserving existing logic:
      return daysDifference % (renewEvery * 30) === 0; 
    case "YEARLY":
      return daysDifference % (renewEvery * 365) === 0;
    default:
      return false;
  }
}

export function generateInsights(input: {
  overview: OverviewStats
  today: TodayStats
  streak: StreakStats
  priority: PriorityInsights
  time: TimePatternStats
}): PersonalInsight[] {
  const insights: PersonalInsight[] = [];

  if (input.streak.current.isActive && input.streak.current.count >= 7) {
    insights.push({
      id: "strong-streak",
      type: "POSITIVE",
      message: "You are maintaining a strong and consistent daily streak.",
    });
  }

  if (!input.streak.current.isActive && input.streak.current.count > 0) {
    insights.push({
      id: "streak-broken",
      type: "WARNING",
      message:
        "Your streak has been broken. Completing at least one task today will restart it.",
    });
  }

  if (input.overview.overdueTodos > 0) {
    insights.push({
      id: "overdue-pressure",
      type: "WARNING",
      message: "Overdue tasks are adding pressure to your workflow.",
    });
  }

  if (
    input.priority.counts.HIGH > 0 &&
    input.priority.overdue.HIGH === 0
  ) {
    insights.push({
      id: "high-priority-control",
      type: "POSITIVE",
      message:
        "You are staying on top of high-priority tasks without letting them slip.",
    });
  }

  if (input.today.completedThisWeek > input.today.createdThisWeek) {
    insights.push({
      id: "backlog-reduction",
      type: "POSITIVE",
      message:
        "You are reducing your backlog by completing more tasks than you create.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "neutral-state",
      type: "NEUTRAL",
      message:
        "Your activity is stable. Small consistent actions will improve your momentum.",
    });
  }

  return insights;
}
