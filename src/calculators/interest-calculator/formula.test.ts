/**
 * Tests for interest-calculator (simple interest) via the shared simpleInterest core.
 * These represent the worked examples shown on the calculator page.
 * Run: npx vitest run src/calculators/interest-calculator/formula.test.ts
 */

import { describe, it, expect } from "vitest";
import { simpleInterest } from "../_shared/finance";

describe("interest-calculator — simple interest worked examples", () => {
  it("classic example: $10,000 at 8% for 5 years", () => {
    // I = 10000 * 0.08 * 5 = 4000; total = 14000
    const r = simpleInterest(10000, 8, 5);
    expect(r.interest).toBe(4000);
    expect(r.total).toBe(14000);
  });

  it("$5,000 at 5% for 3 years", () => {
    // I = 5000 * 0.05 * 3 = 750; total = 5750
    const r = simpleInterest(5000, 5, 3);
    expect(r.interest).toBe(750);
    expect(r.total).toBe(5750);
  });

  it("$1,000 at 12% for 1 year", () => {
    // I = 1000 * 0.12 * 1 = 120; total = 1120
    const r = simpleInterest(1000, 12, 1);
    expect(r.interest).toBe(120);
    expect(r.total).toBe(1120);
  });

  it("zero rate produces zero interest", () => {
    const r = simpleInterest(10000, 0, 5);
    expect(r.interest).toBe(0);
    expect(r.total).toBe(10000);
  });

  it("zero principal produces zero interest and zero total", () => {
    const r = simpleInterest(0, 8, 5);
    expect(r.interest).toBe(0);
    expect(r.total).toBe(0);
  });

  it("fractional years: $2,000 at 6% for 1.5 years", () => {
    // I = 2000 * 0.06 * 1.5 = 180; total = 2180
    const r = simpleInterest(2000, 6, 1.5);
    expect(r.interest).toBe(180);
    expect(r.total).toBe(2180);
  });

  it("fractional rate: $10,000 at 3.5% for 2 years", () => {
    // I = 10000 * 0.035 * 2 = 700; total = 10700
    const r = simpleInterest(10000, 3.5, 2);
    expect(r.interest).toBe(700);
    expect(r.total).toBe(10700);
  });

  it("negative input is guarded to zero", () => {
    const r = simpleInterest(-500, 8, 5);
    expect(r.interest).toBe(0);
    expect(r.total).toBe(0);
  });
});
