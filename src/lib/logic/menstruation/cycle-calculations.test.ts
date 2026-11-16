import { describe, expect, it } from "vitest";
import { cycleLength, isValidCompletedCycle, periodLength } from "./cycle-calculations";

describe("cycle calculations", () => {
  it("calculates an inclusive period length", () => {
    expect(periodLength(new Date("2026-02-27T18:30:00.000Z"), new Date("2026-03-02T18:30:00.000Z"), "Asia/Kolkata")).toBe(4);
  });

  it("calculates cycle length using user calendar days", () => {
    expect(cycleLength(new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-29T00:00:00.000Z"), "UTC")).toBe(28);
  });

  it("only accepts completed non-spotting cycles", () => {
    expect(isValidCompletedCycle({ periodStartDate: new Date("2026-01-01"), periodEndDate: new Date("2026-01-05") })).toBe(true);
    expect(isValidCompletedCycle({ periodStartDate: new Date("2026-01-01"), periodEndDate: null })).toBe(false);
    expect(isValidCompletedCycle({ periodStartDate: new Date("2026-01-01"), periodEndDate: new Date("2026-01-02"), isSpotting: true })).toBe(false);
  });
});
