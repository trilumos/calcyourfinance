/**
 * FD (Fixed Deposit) calculator formula tests.
 * All expected values are hand-verified.
 * Run: npx vitest run src/calculators/fd-calculator/formula.test.ts
 */

import { describe, it, expect } from "vitest";
import { compoundFutureValue } from "./formula";

describe("FD maturity (compoundFutureValue, no contributions)", () => {
  it("default — ₹1,00,000 at 7% quarterly for 5 years", () => {
    // i = 7/100/4 = 0.0175, N = 4*5 = 20
    // (1.0175)^20 = 1.4147781957... → FV = 1,41,477.82, interest = 41,477.82
    const result = compoundFutureValue({
      principal: 100000,
      ratePercent: 7,
      years: 5,
      compoundsPerYear: 4,
    });
    expect(result.futureValue).toBe(141477.82);
    expect(result.totalContributions).toBe(0);
    expect(result.totalPrincipal).toBe(100000);
    expect(result.interest).toBe(41477.82);
  });

  it("annual compounding — 50000 at 6% for 3 years", () => {
    // i = 0.06, N = 3
    // (1.06)^3 = 1.191016 → FV = 59550.80, interest = 9550.80
    const result = compoundFutureValue({
      principal: 50000,
      ratePercent: 6,
      years: 3,
      compoundsPerYear: 1,
    });
    expect(result.futureValue).toBe(59550.8);
    expect(result.interest).toBe(9550.8);
  });

  it("monthly compounding — 100000 at 7% monthly for 1 year", () => {
    // i = 7/100/12 = 0.005833..., N = 12
    // (1.005833)^12 → compute precisely
    const i = 7 / 100 / 12;
    const N = 12;
    const growth = Math.pow(1 + i, N);
    const fvExpected = Math.round((100000 * growth + Number.EPSILON) * 100) / 100;
    const interestExpected = Math.round((fvExpected - 100000 + Number.EPSILON) * 100) / 100;

    const result = compoundFutureValue({
      principal: 100000,
      ratePercent: 7,
      years: 1,
      compoundsPerYear: 12,
    });
    expect(result.futureValue).toBe(fvExpected);
    expect(result.interest).toBe(interestExpected);
  });

  it("half-yearly compounding — 200000 at 8% for 2 years", () => {
    // i = 8/100/2 = 0.04, N = 4
    // (1.04)^4 = 1.16985856 → FV = 233971.71, interest = 33971.71
    const result = compoundFutureValue({
      principal: 200000,
      ratePercent: 8,
      years: 2,
      compoundsPerYear: 2,
    });
    // compute expected precisely
    const growth = Math.pow(1.04, 4);
    const fvExpected = Math.round((200000 * growth + Number.EPSILON) * 100) / 100;
    expect(result.futureValue).toBe(fvExpected);
  });
});
