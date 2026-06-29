import { describe, it, expect } from "vitest";
import { computePercentage } from "./formula";

describe("computePercentage", () => {
  it("a% of b: 25% of 200 = 50", () => {
    expect(computePercentage("percent_of", 25, 200).value).toBe(50);
  });

  it("a is what % of b: 25 is 12.5% of 200", () => {
    const r = computePercentage("is_what_percent", 25, 200);
    expect(r.value).toBe(12.5);
    expect(r.isPercent).toBe(true);
  });

  it("% change from 200 to 250 = +25%", () => {
    expect(computePercentage("percent_change", 200, 250).value).toBe(25);
  });

  it("% change from 200 to 150 = -25%", () => {
    expect(computePercentage("percent_change", 200, 150).value).toBe(-25);
  });

  it("increase 200 by 25% = 250", () => {
    expect(computePercentage("increase_by", 200, 25).value).toBe(250);
  });

  it("decrease 200 by 25% = 150", () => {
    expect(computePercentage("decrease_by", 200, 25).value).toBe(150);
  });

  it("guards divide-by-zero", () => {
    expect(computePercentage("is_what_percent", 25, 0).value).toBe(0);
    expect(computePercentage("percent_change", 0, 100).value).toBe(0);
  });
});
