import { describe, expect, it } from "vitest";
import { generateInsights, isRenewalDay } from "./todo-insights";

describe("todo insights", () => {
  it("recognizes recurring daily and weekly tasks", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    expect(isRenewalDay(start, "DAILY", 2, new Date("2026-01-05T00:00:00Z"))).toBe(true);
    expect(isRenewalDay(start, "WEEKLY", 1, new Date("2026-01-08T00:00:00Z"))).toBe(true);
    expect(isRenewalDay(start, "WEEKLY", 1, new Date("2026-01-04T00:00:00Z"))).toBe(false);
  });

  it("returns useful warnings before the neutral fallback", () => {
    const insights = generateInsights({
      overview: { totalTodos: 2, activeTodos: 2, completedTodos: 0, archivedTodos: 0, overdueTodos: 1 },
      today: { dueToday: 0, overdueNow: 1, completedToday: 0, createdToday: 0, completedThisWeek: 0, createdThisWeek: 0 },
      streak: { count: 2, active: 0, longest: 5, lastCompleted: null, inLastThirtyDays: 2 },
      priority: { counts: { LOW: 0, MEDIUM: 0, HIGH: 0, NONE: 0 }, completionRate: { LOW: 0, MEDIUM: 0, HIGH: 0, NONE: 0 }, overdue: { LOW: 0, MEDIUM: 0, HIGH: 0, NONE: 0 } },
      time: { mostProductiveDay: null, leastProductiveDay: null, averageCompletedPerDay: 0, zeroActivityDaysLast30: 0 },
    });
    expect(insights.map(insight => insight.id)).toContain("overdue-pressure");
    expect(insights.map(insight => insight.id)).toContain("streak-broken");
  });
});
