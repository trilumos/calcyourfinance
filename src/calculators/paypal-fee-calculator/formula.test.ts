import { describe, it, expect } from "vitest";
import { computePayPalFee } from "./formula";

describe("computePayPalFee", () => {
  it("US Goods & Services: $100 at 2.99% + $0.49 → $3.48 fee, $96.52 net", () => {
    const r = computePayPalFee({ amount: 100, mode: "charge", percent: 2.99, fixed: 0.49 });
    expect(r.feeAmount).toBe(3.48);
    expect(r.net).toBe(96.52);
  });

  it("US Checkout: $100 at 3.49% + $0.49 → $3.98 fee", () => {
    const r = computePayPalFee({ amount: 100, mode: "charge", percent: 3.49, fixed: 0.49 });
    expect(r.feeAmount).toBe(3.98);
    expect(r.net).toBe(96.02);
  });

  it("US micropayments: $5 at 4.99% + $0.09 → $0.34 fee", () => {
    const r = computePayPalFee({ amount: 5, mode: "charge", percent: 4.99, fixed: 0.09 });
    // 5*0.0499 = 0.2495 + 0.09 = 0.3395 → 0.34
    expect(r.feeAmount).toBe(0.34);
    expect(r.net).toBe(4.66);
  });

  it("cross-border adds the international surcharge", () => {
    const r = computePayPalFee({
      amount: 100, mode: "charge", percent: 3.49, fixed: 0.49,
      crossBorderPercent: 1.5, international: true,
    });
    expect(r.ratePercent).toBe(4.99); // 3.49 + 1.5
  });

  it("reverse: to net $100 via US G&S, charge ≈ $103.59", () => {
    // (100 + 0.49) / (1 - 0.0299) = 100.49 / 0.9701 = 103.587 → 103.59
    const r = computePayPalFee({ amount: 100, mode: "net", percent: 2.99, fixed: 0.49 });
    expect(r.net).toBe(100);
    expect(r.charge).toBe(103.59);
  });

  it("zero amount returns zeros", () => {
    expect(computePayPalFee({ amount: 0, mode: "charge", percent: 2.99, fixed: 0.49 }).net).toBe(0);
  });
});
