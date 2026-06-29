/**
 * Tests for compound-interest-calculator via the shared compoundFutureValue core.
 * These represent the worked examples shown on the calculator page.
 * Run: npx vitest run src/calculators/compound-interest-calculator/formula.test.ts
 */

import { describe, it, expect } from "vitest";
import { compoundFutureValue } from "../_shared/finance";

describe("compound-interest-calculator — worked examples", () => {
  it("classic example: $10,000 at 8% for 10 years, compounded monthly", () => {
    // A = 10000 * (1 + 0.08/12)^120 ≈ 22196.40
    const r = compoundFutureValue({
      principal: 10000,
      ratePercent: 8,
      years: 10,
      compoundsPerYear: 12,
    });
    expect(r.futureValue).toBe(22196.40);
    expect(r.totalContributions).toBe(0);
    expect(r.totalPrincipal).toBe(10000);
    expect(r.interest).toBe(12196.40);
  });

  it("$10,000 at 8% for 10 years + $200/month contribution, monthly compounding", () => {
    // Principal FV: 10000 * (1+0.08/12)^120 = 22196.40
    // Annuity FV: 200 * ((1+0.08/12)^120 - 1) / (0.08/12)
    // = 200 * (2.21964... - 1) / 0.006666...
    // = 200 * (1.21964... / 0.006666...)
    // = 200 * 182.94603...
    // = 36589.21
    // Total FV ≈ 22196.40 + 36589.21 = 58785.61
    const r = compoundFutureValue({
      principal: 10000,
      ratePercent: 8,
      years: 10,
      compoundsPerYear: 12,
      contribution: 200,
    });
    // totalContributions = 200 * 120 = 24000
    expect(r.totalContributions).toBe(24000);
    expect(r.totalPrincipal).toBe(34000);
    // futureValue should be meaningfully higher than principal-only case
    expect(r.futureValue).toBeGreaterThan(22196.40);
    expect(r.interest).toBeGreaterThan(12196.40);
    // Exact value:
    const i = 0.08 / 12;
    const growth = Math.pow(1 + i, 120);
    const expected = Math.round(
      (10000 * growth + 200 * ((growth - 1) / i) + Number.EPSILON) * 100,
    ) / 100;
    expect(r.futureValue).toBe(expected);
  });

  it("compares compounding frequencies — more frequent = more growth", () => {
    const base = { principal: 10000, ratePercent: 6, years: 5 };
    const annual = compoundFutureValue({ ...base, compoundsPerYear: 1 });
    const quarterly = compoundFutureValue({ ...base, compoundsPerYear: 4 });
    const monthly = compoundFutureValue({ ...base, compoundsPerYear: 12 });
    const daily = compoundFutureValue({ ...base, compoundsPerYear: 365 });

    expect(monthly.futureValue).toBeGreaterThan(annual.futureValue);
    expect(quarterly.futureValue).toBeGreaterThan(annual.futureValue);
    expect(daily.futureValue).toBeGreaterThan(monthly.futureValue);
  });

  it("zero contribution behaves identically to omitting contribution", () => {
    const withZero = compoundFutureValue({
      principal: 5000,
      ratePercent: 7,
      years: 3,
      compoundsPerYear: 12,
      contribution: 0,
    });
    const withOmitted = compoundFutureValue({
      principal: 5000,
      ratePercent: 7,
      years: 3,
      compoundsPerYear: 12,
    });
    expect(withZero.futureValue).toBe(withOmitted.futureValue);
  });
});
