import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  getCycleSummary: vi.fn(),
  getDailyLog: vi.fn(),
}));

vi.mock("@/server/actions/menstruation-actions", () => ({
  getCycleSummary: mocks.getCycleSummary,
  getDailyLog: mocks.getDailyLog,
  startPeriod: vi.fn(), endPeriod: vi.fn(), updateCycle: vi.fn(), upsertDailyLog: vi.fn(),
  deleteCycle: vi.fn(), deleteDailyLog: vi.fn(), deleteAllMenstrualData: vi.fn(), updateMenstrualProfile: vi.fn(),
}));
vi.mock("@/server/actions/menstruation-reminder-actions", () => ({ upsertMenstrualReminder: vi.fn() }));
vi.mock("@/server/actions/resource-link-actions", () => ({ searchLinkableResources: vi.fn() }));
vi.mock("@/components/pages/menstruation/cycle-calendar", () => ({ CycleCalendar: () => <div data-testid="cycle-calendar" /> }));
vi.mock("@/components/pages/menstruation/symptom-trends", () => ({ SymptomTrends: () => <div data-testid="symptom-trends" /> }));
vi.mock("@/components/shared/resource-linker", () => ({ default: () => null }));
vi.mock("@/components/layout/section-header-wrapper", () => ({ SectionHeaderWrapper: ({ children }: { children: React.ReactNode }) => <header>{children}</header> }));
vi.mock("@/components/shared/info-modal", () => ({ default: ({ open, title, children }: { open: boolean; title: string; children: React.ReactNode }) => open ? <div role="dialog" aria-label={title}>{children}</div> : null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import Menstruation from "./menstruation";

const emptySummary = {
  timezone: "Asia/Calcutta",
  profile: null,
  cycles: [],
  activeCycle: null,
  todayLog: null,
  recentLogs: [],
  reminders: [],
  predictions: { nextPeriod: null, ovulation: null, fertileWindow: null, averageCycleLength: null, confidence: "LOW" },
};

describe("menstruation page", () => {
  it("gives a first-time user a clear starting state", async () => {
    mocks.getCycleSummary.mockResolvedValue({ success: true, data: emptySummary });

    render(<Menstruation />);

    expect(await screen.findByText("No cycle data yet")).toBeInTheDocument();
    expect(screen.getByText("Track your first period to start seeing your cycle pattern.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start period/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn how to start a period" })).toBeInTheDocument();
  });

  it("explains the start-period action in simple language through its help button", async () => {
    mocks.getCycleSummary.mockResolvedValue({ success: true, data: emptySummary });
    const user = userEvent.setup();

    render(<Menstruation />);
    await screen.findByText("No cycle data yet");
    await user.click(screen.getByRole("button", { name: "Learn how to start a period" }));

    expect(screen.getByRole("dialog", { name: "Start period" })).toHaveTextContent("first day you notice menstrual bleeding");
  });
});
