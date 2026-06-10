import { describe, it, expect } from "vitest";
import { computeFlatFee } from "./flatFee";

/**
 * Shared "percentage + fixed fee" engine used by flat-rate processors
 * (Cash App, Venmo, …). Same shape as the per-platform formulas; charge ↔ net.
 */
describe("computeFlatFee", () => {
  it("Cash App business: $100 at 2.75% (no fixed) → $2.75 fee, $97.25 net", () => {
    const r = computeFlatFee({ amount: 100, mode: "charge", percent: 2.75, fixed: 0 });
    expect(r.totalFee).toBe(2.75);
    expect(r.net).toBe(97.25);
    expect(r.effectiveRate).toBe(2.75);
  });

  it("Venmo business: $100 at 1.9% + $0.10 → $2.00 fee, $98.00 net", () => {
    const r = computeFlatFee({ amount: 100, mode: "charge", percent: 1.9, fixed: 0.1 });
    expect(r.totalFee).toBe(2);
    expect(r.net).toBe(98);
  });

  it("reverse: to net $100 on Venmo business, charge ≈ $102.04", () => {
    const r = computeFlatFee({ amount: 100, mode: "net", percent: 1.9, fixed: 0.1 });
    expect(r.net).toBe(100);
    expect(r.charge).toBe(102.04); // (100 + 0.10) / (1 − 1.9%)
  });

  it("extraPercent is added to the rate (e.g. a surcharge)", () => {
    const r = computeFlatFee({ amount: 100, mode: "charge", percent: 2, fixed: 0, extraPercent: 1 });
    expect(r.ratePercent).toBe(3);
    expect(r.totalFee).toBe(3);
  });

  it("taxOnFeePercent adds tax on the fee (e.g. 18% GST)", () => {
    const r = computeFlatFee({ amount: 100, mode: "charge", percent: 2, fixed: 0, taxOnFeePercent: 18 });
    expect(r.processingFee).toBe(2);
    expect(r.taxOnFee).toBe(0.36);
    expect(r.totalFee).toBe(2.36);
    expect(r.net).toBe(97.64);
  });

  it("zero amount returns zeros", () => {
    const r = computeFlatFee({ amount: 0, mode: "charge", percent: 2.75, fixed: 0 });
    expect(r.net).toBe(0);
    expect(r.totalFee).toBe(0);
  });
});
