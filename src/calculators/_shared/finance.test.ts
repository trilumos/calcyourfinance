/**
 * Tests for shared finance formula core.
 * All expected values are hand-verified against standard textbook formulas.
 * Run: npx vitest run src/calculators/_shared/finance.test.ts
 */

import { describe, it, expect } from "vitest";
import { simpleInterest, compoundFutureValue, emi } from "./finance";

describe("simpleInterest", () => {
  it("computes interest and total correctly — standard case", () => {
    // I = P * r * t = 10000 * 0.08 * 5 = 4000; total = 14000
    const result = simpleInterest(10000, 8, 5);
    expect(result.interest).toBe(4000);
    expect(result.total).toBe(14000);
  });

  it("handles 1 year at 5%", () => {
    // I = 1000 * 0.05 * 1 = 50; total = 1050
    const result = simpleInterest(1000, 5, 1);
    expect(result.interest).toBe(50);
    expect(result.total).toBe(1050);
  });

  it("returns zeros for zero principal", () => {
    const result = simpleInterest(0, 8, 5);
    expect(result.interest).toBe(0);
    expect(result.total).toBe(0);
  });

  it("returns zeros for negative principal (guarded)", () => {
    const result = simpleInterest(-500, 8, 5);
    expect(result.interest).toBe(0);
    expect(result.total).toBe(0);
  });

  it("returns zeros for zero years", () => {
    const result = simpleInterest(10000, 8, 0);
    expect(result.interest).toBe(0);
    expect(result.total).toBe(10000);
  });

  it("returns zeros for non-finite inputs", () => {
    const r1 = simpleInterest(NaN, 8, 5);
    expect(r1.interest).toBe(0);
    const r2 = simpleInterest(10000, Infinity, 5);
    expect(r2.interest).toBe(0);
  });
});

describe("compoundFutureValue", () => {
  it("standard case — no contributions, monthly compounding, 10 years at 8%", () => {
    // A = 10000 * (1 + 0.08/12)^(12*10)
    // Raw: 22196.40234544711 → roundMoney → 22196.40
    const result = compoundFutureValue({
      principal: 10000,
      ratePercent: 8,
      years: 10,
      compoundsPerYear: 12,
    });
    expect(result.futureValue).toBe(22196.40);
    expect(result.totalContributions).toBe(0);
    expect(result.totalPrincipal).toBe(10000);
    expect(result.interest).toBe(12196.40);
  });

  it("monthly contributions, 12% rate, 1 year — end-of-period (ordinary annuity)", () => {
    // principal=0, PMT=1000, i=0.01, N=12
    // FV = 1000 * ((1.01^12 - 1) / 0.01)
    // Raw: 12682.503013196976 → roundMoney → 12682.50
    const result = compoundFutureValue({
      principal: 0,
      ratePercent: 12,
      years: 1,
      compoundsPerYear: 12,
      contribution: 1000,
    });
    expect(result.futureValue).toBe(12682.50);
    expect(result.totalContributions).toBe(12000);
    expect(result.totalPrincipal).toBe(12000);
    expect(result.interest).toBe(682.50);
  });

  it("zero rate edge — no interest; i === 0 branch", () => {
    // FV = P + PMT*N = 1000 + 100*12 = 2200; interest = 0
    const result = compoundFutureValue({
      principal: 1000,
      ratePercent: 0,
      years: 1,
      compoundsPerYear: 12,
      contribution: 100,
    });
    expect(result.futureValue).toBe(2200);
    expect(result.totalContributions).toBe(1200);
    expect(result.totalPrincipal).toBe(2200);
    expect(result.interest).toBe(0);
  });

  it("annuity-due (contributions at start of period) yields higher FV", () => {
    // FV_due = FV_ordinary * (1 + i)
    // For principal=0, PMT=1000, i=0.01, N=12:
    // FV_ordinary raw ≈ 12682.50; FV_due = 12682.50 * 1.01 = 12809.3253... → 12809.33
    const ordinary = compoundFutureValue({
      principal: 0,
      ratePercent: 12,
      years: 1,
      compoundsPerYear: 12,
      contribution: 1000,
      annuityDue: false,
    });
    const due = compoundFutureValue({
      principal: 0,
      ratePercent: 12,
      years: 1,
      compoundsPerYear: 12,
      contribution: 1000,
      annuityDue: true,
    });
    expect(due.futureValue).toBeGreaterThan(ordinary.futureValue);
    // Annuity-due exact: 12682.503013196976 * 1.01 = 12809.328043328946 → 12809.33
    expect(due.futureValue).toBe(12809.33);
  });

  it("annual compounding at 10% for 5 years, no contributions", () => {
    // A = 5000 * (1.10)^5 = 5000 * 1.61051 = 8052.55
    const result = compoundFutureValue({
      principal: 5000,
      ratePercent: 10,
      years: 5,
      compoundsPerYear: 1,
    });
    expect(result.futureValue).toBe(8052.55);
    expect(result.totalContributions).toBe(0);
    expect(result.interest).toBe(3052.55);
  });

  it("returns zeros for zero principal, zero contribution, any rate", () => {
    const result = compoundFutureValue({
      principal: 0,
      ratePercent: 10,
      years: 10,
      compoundsPerYear: 12,
      contribution: 0,
    });
    expect(result.futureValue).toBe(0);
    expect(result.interest).toBe(0);
  });

  it("returns safe zeros for negative principal (guarded)", () => {
    const result = compoundFutureValue({
      principal: -1000,
      ratePercent: 8,
      years: 10,
      compoundsPerYear: 12,
    });
    expect(result.futureValue).toBe(0);
  });

  it("returns safe zeros for non-finite inputs", () => {
    const result = compoundFutureValue({
      principal: NaN,
      ratePercent: 8,
      years: 10,
      compoundsPerYear: 12,
    });
    expect(result.futureValue).toBe(0);
  });

  it("quarterly compounding at 6% for 3 years", () => {
    // A = 2000 * (1 + 0.06/4)^(4*3) = 2000 * (1.015)^12
    // (1.015)^12 = 1.195618171... → A = 2391.2363... → 2391.24
    const result = compoundFutureValue({
      principal: 2000,
      ratePercent: 6,
      years: 3,
      compoundsPerYear: 4,
    });
    expect(result.futureValue).toBe(2391.24);
  });
});

describe("emi", () => {
  it("standard home-loan case — 10 lakh at 9% for 20 years (240 months)", () => {
    // i = 9 / 12 / 100 = 0.0075
    // (1.0075)^240 = 6.009151524472612
    // EMI = 1000000 * 0.0075 * 6.009151... / (6.009151... - 1)
    //     = 7507.76... / 5.009151... raw = 8997.259558... → roundMoney → 8997.26
    // totalPayment = 8997.26 * 240 = 2159342.40
    // totalInterest = 2159342.40 - 1000000 = 1159342.40
    const result = emi(1000000, 9, 240);
    expect(result.emi).toBe(8997.26);
    expect(result.totalPayment).toBe(2159342.40);
    expect(result.totalInterest).toBe(1159342.40);
  });

  it("zero rate — principal divided equally across months", () => {
    // emi(12000, 0, 12) → emi = 12000/12 = 1000, totalPayment = 12000, totalInterest = 0
    const result = emi(12000, 0, 12);
    expect(result.emi).toBe(1000);
    expect(result.totalPayment).toBe(12000);
    expect(result.totalInterest).toBe(0);
  });

  it("short personal loan — 10000 at 12% for 12 months", () => {
    // i = 0.01, (1.01)^12 = 1.12682503013197
    // EMI raw = 10000 * 0.01 * 1.12682503... / (1.12682503... - 1)
    //         = 112.682503... / 0.12682503... = 888.4878... → 888.49
    // totalPayment = 888.49 * 12 = 10661.88
    // totalInterest = 10661.88 - 10000 = 661.88
    const result = emi(10000, 12, 12);
    expect(result.emi).toBe(888.49);
    expect(result.totalPayment).toBe(10661.88);
    expect(result.totalInterest).toBe(661.88);
  });

  it("returns zero emi for zero principal", () => {
    const result = emi(0, 9, 240);
    expect(result.emi).toBe(0);
    expect(result.totalPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  it("returns zero emi for non-finite / negative inputs (guarded)", () => {
    const result = emi(NaN, 9, 240);
    expect(result.emi).toBe(0);
    expect(result.totalInterest).toBe(0);
  });
});
