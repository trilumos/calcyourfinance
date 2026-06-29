/**
 * Loan calculator formula tests.
 * Western framing: "monthly payment", amortization. Same math as emi().
 * Run: npx vitest run src/calculators/loan-calculator/formula.test.ts
 */

import { describe, it, expect } from "vitest";
import { emi } from "./formula";

describe("loan monthly payment (via emi formula)", () => {
  it("default inputs — $25,000 at 7% for 5 years (60 months)", () => {
    // i = 7/12/100 = 0.005833...
    // (1.005833...)^60: compute precisely
    const i = 7 / 12 / 100;
    const n = 60;
    const P = 25000;
    const pow = Math.pow(1 + i, n);
    const emiRaw = (P * i * pow) / (pow - 1);
    const emiExpected = Math.round((emiRaw + Number.EPSILON) * 100) / 100;
    const totalPaymentExpected = Math.round((emiExpected * n + Number.EPSILON) * 100) / 100;
    const totalInterestExpected = Math.round((totalPaymentExpected - P + Number.EPSILON) * 100) / 100;

    const result = emi(P, 7, n);
    expect(result.emi).toBe(emiExpected);
    expect(result.totalPayment).toBe(totalPaymentExpected);
    expect(result.totalInterest).toBe(totalInterestExpected);
  });

  it("auto loan — $20,000 at 5% for 4 years (48 months)", () => {
    // i = 5/12/100 ≈ 0.004167
    const i = 5 / 12 / 100;
    const n = 48;
    const P = 20000;
    const pow = Math.pow(1 + i, n);
    const emiRaw = (P * i * pow) / (pow - 1);
    const emiExpected = Math.round((emiRaw + Number.EPSILON) * 100) / 100;

    const result = emi(P, 5, n);
    expect(result.emi).toBe(emiExpected);
  });

  it("zero interest — equal monthly payments", () => {
    const result = emi(12000, 0, 12);
    expect(result.emi).toBe(1000);
    expect(result.totalPayment).toBe(12000);
    expect(result.totalInterest).toBe(0);
  });
});
