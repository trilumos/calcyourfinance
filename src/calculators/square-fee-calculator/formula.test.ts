import { describe, it, expect } from "vitest";
import { computeSquareFee } from "./formula";

/**
 * Square fee math — percentage + (sometimes) a fixed fee, an optional
 * foreign-card surcharge, and an optional tax-on-fee (Ireland VAT). Mirrors the
 * Stripe shape; charge ↔ net both directions.
 */
describe("computeSquareFee", () => {
  it("US online: $100 at 3.3% + $0.30 → $3.60 fee, $96.40 net", () => {
    const r = computeSquareFee({ amount: 100, mode: "charge", percent: 3.3, fixed: 0.3 });
    expect(r.totalFee).toBe(3.6);
    expect(r.net).toBe(96.4);
    expect(r.effectiveRate).toBe(3.6);
  });

  it("Australia online: no fixed fee — $100 at 2.2% → $2.20 fee, $97.80 net", () => {
    const r = computeSquareFee({ amount: 100, mode: "charge", percent: 2.2, fixed: 0 });
    expect(r.totalFee).toBe(2.2);
    expect(r.net).toBe(97.8);
  });

  it("foreign card adds the surcharge (Canada +1.5%)", () => {
    const r = computeSquareFee({
      amount: 100, mode: "charge", percent: 2.8, fixed: 0.3,
      intlSurcharge: 1.5, international: true,
    });
    expect(r.ratePercent).toBe(4.3); // 2.8 + 1.5
    expect(r.totalFee).toBe(4.6); // 4.30 + 0.30
    expect(r.net).toBe(95.4);
  });

  it("does not apply the surcharge when international is false", () => {
    const r = computeSquareFee({
      amount: 100, mode: "charge", percent: 2.8, fixed: 0.3, intlSurcharge: 1.5,
    });
    expect(r.ratePercent).toBe(2.8);
  });

  it("Ireland: 23% VAT on the fee is a separate deduction", () => {
    const r = computeSquareFee({
      amount: 100, mode: "charge", percent: 1.4, fixed: 0.25, taxOnFeePercent: 23,
    });
    expect(r.processingFee).toBe(1.65); // 1.40 + 0.25
    expect(r.taxOnFee).toBe(0.38); // 1.65 × 23%
    expect(r.totalFee).toBe(2.03);
    expect(r.net).toBe(97.97);
  });

  it("reverse: to net $100 on US online, charge ≈ $103.72", () => {
    const r = computeSquareFee({ amount: 100, mode: "net", percent: 3.3, fixed: 0.3 });
    expect(r.net).toBe(100);
    expect(r.charge).toBe(103.72); // (100 + 0.30) / (1 − 3.3%)
  });

  it("zero amount returns zeros", () => {
    const r = computeSquareFee({ amount: 0, mode: "charge", percent: 3.3, fixed: 0.3 });
    expect(r.net).toBe(0);
    expect(r.totalFee).toBe(0);
  });
});
