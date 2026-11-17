import { describe, expect, it } from "vitest";
import { createCycle } from "@/test/factories";
import { getCyclePredictions } from "./cycle-predictions";

describe("cycle predictions", () => {
  it("predicts the next period from completed cycles", () => {
    const result = getCyclePredictions([
      createCycle({ id: "1", periodStartDate: new Date("2026-01-01T00:00:00Z"), periodEndDate: new Date("2026-01-05T00:00:00Z") }),
      createCycle({ id: "2", periodStartDate: new Date("2026-01-29T00:00:00Z"), periodEndDate: new Date("2026-02-02T00:00:00Z") }),
      createCycle({ id: "3", periodStartDate: new Date("2026-02-26T00:00:00Z"), periodEndDate: new Date("2026-03-02T00:00:00Z") }),
    ], null, true, "UTC");

    expect(result.averageCycleLength).toBe(28);
    expect(result.nextPeriod?.toISOString()).toBe("2026-03-26T00:00:00.000Z");
    expect(result.fertileWindow).not.toBeNull();
    expect(result.confidence).toBe("TYPICAL");
  });

  it("does not predict without history or a configured length", () => {
    expect(getCyclePredictions([], null, false, "UTC").nextPeriod).toBeNull();
  });

  it("uses a configured length when completed history is unavailable", () => {
    const result = getCyclePredictions([createCycle({ periodEndDate: null })], 30, false, "UTC");
    expect(result.averageCycleLength).toBe(30);
    expect(result.nextPeriod?.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});
