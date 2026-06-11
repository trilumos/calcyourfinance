import { describe, it, expect } from "vitest";
import { computeWiseFee } from "./formula";

/**
 * Wise charges fixed + (% × send amount) in the source currency, then converts
 * the remainder at the mid-market rate. We compute the FEE (the stable part);
 * the live exchange rate is out of scope (it moves constantly).
 */
describe("computeWiseFee", () => {
  it("USD→EUR $1,000 at 0.289% + $6.98 → $9.87 fee", () => {
    const r = computeWiseFee({ amount: 1000, pct: 0.289, fixed: 6.98 });
    expect(r.fee).toBe(9.87);
    expect(r.converted).toBe(990.13); // amount − fee (converted at mid-market)
    expect(r.effectiveRate).toBe(0.99);
  });

  it("GBP→EUR £1,000 at 0.329% + £0.59 → £3.88 fee", () => {
    const r = computeWiseFee({ amount: 1000, pct: 0.329, fixed: 0.59 });
    expect(r.fee).toBe(3.88);
    expect(r.converted).toBe(996.12);
  });

  it("USD→PHP $500 at 0.567% + $6.98 → $9.82 fee", () => {
    const r = computeWiseFee({ amount: 500, pct: 0.567, fixed: 6.98 });
    expect(r.fee).toBe(9.82);
    expect(r.effectiveRate).toBe(1.96);
  });

  it("zero amount returns zeros", () => {
    const r = computeWiseFee({ amount: 0, pct: 0.289, fixed: 6.98 });
    expect(r.fee).toBe(0);
    expect(r.converted).toBe(0);
    expect(r.effectiveRate).toBe(0);
  });
});
