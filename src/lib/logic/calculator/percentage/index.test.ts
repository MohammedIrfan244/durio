import { describe, expect, it } from "vitest";
import { percentage } from "./index";

describe("percentage calculator", () => {
  it("handles standard percentage operations", () => {
    expect(percentage.percentOf(20, 500)).toBe(100);
    expect(percentage.addPercent(500, 20)).toBe(600);
    expect(percentage.subtractPercent(500, 15)).toBe(425);
  });

  it("does not divide by zero", () => {
    expect(percentage.percentIsOf(10, 0)).toBe(0);
  });
});
