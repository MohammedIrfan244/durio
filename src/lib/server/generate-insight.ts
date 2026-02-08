// lib/server/generate-insight.ts
import { 
  PersonalInsight, 
  prioritySortValues, 
  InterestingFact, 
  OverviewStats, 
  StreakStats, 
  WeeklyStats, 
  PriorityStats, 
  RythmStats 
} from "@/types/todo";

// Collection of interesting facts about productivity and todos
const interestingFacts: InterestingFact[] = [
  { id: "fact-1", type: "FACT", message: "Did you know? Completing tasks before noon increases your productivity by 20%!" },
  { id: "fact-2", type: "FACT", message: "Writing down your tasks can reduce anxiety and make you more efficient." },
  { id: "fact-3", type: "FACT", message: "The '2-minute rule' suggests if a task takes less than 2 minutes, do it immediately." },
  { id: "fact-4", type: "FACT", message: "Multitasking can lower your IQ by up to 15 points—focus on one task at a time!" },
  { id: "fact-5", type: "FACT", message: "Studies show that taking regular breaks helps maintain focus and prevents burnout." },
  { id: "fact-6", type: "FACT", message: "The most productive day of the week is often considered to be Tuesday." },
  { id: "fact-7", type: "FACT", message: "Grouping similar tasks together can save you hours each week." },
];

export function generateInsights(input: {
  overview: OverviewStats;
  streak: StreakStats;
  weekly: WeeklyStats;
  priorityFocus: PriorityStats;
  yourRythm: RythmStats;
}): { insights: PersonalInsight[], fact: InterestingFact } {
  const possibleInsights: PersonalInsight[] = [];

  // 1. Streak Insights
  if (input.streak.count >= 7) {
    possibleInsights.push({ id: "strong-streak", type: "POSITIVE", message: `You are on a roll! ${input.streak.count} day streak.` });
  } else if (input.streak.count > 3) {
    possibleInsights.push({ id: "building-momentum", type: "POSITIVE", message: "You're building good momentum with your current streak." });
  } else if (input.streak.count === 0 && input.streak.longest > 5) {
     possibleInsights.push({ id: "streak-broken", type: "WARNING", message: "Your streak ended. Start a new one today!" });
  }

  // 2. Overview / Workload Insights
  if (input.overview.overdueTodos > 5) {
    possibleInsights.push({ id: "overdue-pressure", type: "WARNING", message: `You have ${input.overview.overdueTodos} overdue tasks. tackle the easiest one first!` });
  }
  
  if (input.overview.completedTodos > input.overview.activeTodos * 2 && input.overview.activeTodos > 0) {
      possibleInsights.push({ id: "completion-master", type: "POSITIVE", message: "You've completed twice as many tasks as you have active!" });
  }

  // 3. Weekly Performance
  if (input.weekly.completedThisWeekCount > input.weekly.createdThisWeekCount && input.weekly.createdThisWeekCount > 0) {
    possibleInsights.push({ id: "backlog-crusher", type: "POSITIVE", message: "You cleared more tasks than you created this week!" });
  }
  
  if (input.weekly.dueTodayCount > 5) {
       possibleInsights.push({ id: "busy-day", type: "NEUTRAL", message: "Busy day ahead with multiple tasks due." });
  }

  // 4. Priority Insights
  if (input.priorityFocus.highPriorityCount > 0 && input.priorityFocus.highCompletionRate > 80) {
    possibleInsights.push({ id: "priority-pro", type: "POSITIVE", message: "Excellent work focusing on high-priority tasks." });
  }
  
  if (input.priorityFocus.lowCompletionRate > input.priorityFocus.highCompletionRate && input.priorityFocus.highPriorityCount > 0) {
      possibleInsights.push({ id: "focus-check", type: "WARNING", message: "You're clearing low priority tasks but high priority ones remain." });
  }

  // 5. Rhythm Insights
  if (input.yourRythm.bestDayOfWeek) {
      possibleInsights.push({ id: "peak-day", type: "NEUTRAL", message: `${input.yourRythm.bestDayOfWeek} seems to be your most productive day.` });
  }

  // Select top 3 distinct insights
  // Prioritize WARNINGS slightly to be helpful, then POSITIVE
  const sortedInsights = possibleInsights.sort((a, b) => {
      const priority = { WARNING: 3, POSITIVE: 2, NEUTRAL: 1 };
      return priority[b.type] - priority[a.type];
  });

  const selectedInsights = sortedInsights.slice(0, 3);
  
  // Fill with generic if less than 3
  if (selectedInsights.length < 3) {
      if (!selectedInsights.some(i => i.id === "keep-going")) {
          selectedInsights.push({ id: "keep-going", type: "NEUTRAL", message: "consistency is key. Keep checking off your list." });
      }
  }
    if (selectedInsights.length < 3) {
      if (!selectedInsights.some(i => i.id === "review-goals")) {
          selectedInsights.push({ id: "review-goals", type: "NEUTRAL", message: "Take a moment to review your goals for tomorrow." });
      }
  }
  
  // Select a random fact
  const randomFact = interestingFacts[Math.floor(Math.random() * interestingFacts.length)];

  return {
    insights: selectedInsights.slice(0, 3), // Ensure max 3
    fact: randomFact
  };
}