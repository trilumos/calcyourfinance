/**
 * EMI calculator formula tests.
 * Delegates to the shared emi() which has its own suite; these tests
 * verify the formula.ts re-export and add calculator-specific cases.
 * Run: npx vitest run src/calculators/emi-calculator/formula.test.ts
 */

import { describe, it, expect } from "vitest";
import { emi } from "./formula";

describe("emi (via formula.ts re-export)", () => {
  it("default inputs — 10 lakh at 9% for 20 years", () => {
    // The default scenario used on the calculator page.
    // Verified: i=0.0075, (1.0075)^240=6.00915..., EMI raw=8997.2595..., rounded 8997.26
    const result = emi(1000000, 9, 240);
    expect(result.emi).toBe(8997.26);
    expect(result.totalPayment).toBe(2159342.40);
    expect(result.totalInterest).toBe(1159342.40);
  });

  it("car loan — 500000 at 10.5% for 5 years (60 months)", () => {
    // i = 10.5/12/100 = 0.00875
    // (1.00875)^60: ln(1.00875)*60 = 0.008712*60 = 0.52272, e^0.52272 = 1.68699...
    // EMI raw = 500000 * 0.00875 * 1.68699 / (1.68699 - 1)
    //         = 7380.59 / 0.68699 = 10743.42 approx — compute precisely below
    const i = 10.5 / 12 / 100;
    const n = 60;
    const P = 500000;
    const pow = Math.pow(1 + i, n);
    const emiRaw = (P * i * pow) / (pow - 1);
    const emiExpected = Math.round((emiRaw + Number.EPSILON) * 100) / 100;
    const totalPaymentExpected = Math.round((emiExpected * n + Number.EPSILON) * 100) / 100;
    const totalInterestExpected = Math.round((totalPaymentExpected - P + Number.EPSILON) * 100) / 100;

    const result = emi(P, 10.5, n);
    expect(result.emi).toBe(emiExpected);
    expect(result.totalPayment).toBe(totalPaymentExpected);
    expect(result.totalInterest).toBe(totalInterestExpected);
  });

  it("zero interest rate — equal instalments", () => {
    const result = emi(120000, 0, 24);
    expect(result.emi).toBe(5000);
    expect(result.totalPayment).toBe(120000);
    expect(result.totalInterest).toBe(0);
  });
});
