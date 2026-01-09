// lib/todo/insight-service.ts
import { PersonalInsight, PriorityInsights, StreakStats, OverviewStats, TodayStats, TimePatternStats } from "@/types/todo";

export function generateInsights(input: {
  overview: OverviewStats;
  today: TodayStats;
  streak: StreakStats;
  priority: PriorityInsights;
  time: TimePatternStats;
}): PersonalInsight[] {
  const insights: PersonalInsight[] = [];

  if (input.streak.current.isActive && input.streak.current.count >= 7) {
    insights.push({ id: "strong-streak", type: "POSITIVE", message: "You are maintaining a strong and consistent daily streak." });
  }
  
  if (!input.streak.current.isActive && input.streak.current.count > 0) {
    insights.push({ id: "streak-broken", type: "WARNING", message: "Your streak has been broken. Completing at least one task today will restart it." });
  }

  if (input.overview.overdueTodos > 0) {
    insights.push({ id: "overdue-pressure", type: "WARNING", message: "Overdue tasks are adding pressure to your workflow." });
  }

  if (input.priority.counts.HIGH > 0 && input.priority.overdue.HIGH === 0) {
    insights.push({ id: "high-priority-control", type: "POSITIVE", message: "You are staying on top of high-priority tasks without letting them slip." });
  }

  if (input.today.completedThisWeek > input.today.createdThisWeek) {
    insights.push({ id: "backlog-reduction", type: "POSITIVE", message: "You are reducing your backlog by completing more tasks than you create." });
  }

  return insights.length > 0 ? insights : [{ id: "neutral-state", type: "NEUTRAL", message: "Your activity is stable. Small consistent actions will improve your momentum." }];
}