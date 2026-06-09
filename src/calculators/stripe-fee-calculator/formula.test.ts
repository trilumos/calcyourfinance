import { describe, it, expect } from "vitest";
import { computeStripeFee } from "./formula";

describe("computeStripeFee", () => {
  it("US: $100 charge at 2.9% + $0.30 → $3.20 fee, $96.80 net", () => {
    const r = computeStripeFee({ amount: 100, mode: "charge", percent: 2.9, fixed: 0.3 });
    expect(r.totalFee).toBe(3.2);
    expect(r.net).toBe(96.8);
    expect(r.effectiveRate).toBe(3.2);
    expect(r.charge).toBe(100);
    expect(r.taxOnFee).toBe(0);
  });

  it("UK: £50 charge at 1.5% + £0.20 → £0.95 fee, £49.05 net", () => {
    const r = computeStripeFee({ amount: 50, mode: "charge", percent: 1.5, fixed: 0.2 });
    expect(r.totalFee).toBe(0.95);
    expect(r.net).toBe(49.05);
  });

  it("reverse mode: to NET $100 in US, must charge $103.30", () => {
    const r = computeStripeFee({ amount: 100, mode: "net", percent: 2.9, fixed: 0.3 });
    expect(r.net).toBe(100);
    expect(r.charge).toBe(103.3);
    expect(r.totalFee).toBe(3.3);
  });

  it("international card adds the surcharge to the rate", () => {
    const r = computeStripeFee({
      amount: 100, mode: "charge", percent: 2.9, fixed: 0.3,
      intlSurcharge: 1.5, international: true,
    });
    expect(r.ratePercent).toBe(4.4); // 2.9 + 1.5
    expect(r.totalFee).toBe(4.7); // 100*0.044 + 0.30
  });

  it("currency conversion adds fx% on top of international", () => {
    const r = computeStripeFee({
      amount: 100, mode: "charge", percent: 2.9, fixed: 0.3,
      intlSurcharge: 1.5, fxPercent: 1, international: true, conversion: true,
    });
    expect(r.ratePercent).toBe(5.4); // 2.9 + 1.5 + 1
  });

  it("India: 2% + 18% GST on the fee → ₹2 fee + ₹0.36 GST on ₹100", () => {
    const r = computeStripeFee({
      amount: 100, mode: "charge", percent: 2, fixed: 0, taxOnFeePercent: 18,
    });
    expect(r.processingFee).toBe(2);
    expect(r.taxOnFee).toBe(0.36); // 18% of 2
    expect(r.totalFee).toBe(2.36);
    expect(r.net).toBe(97.64);
  });

  it("India reverse: to net ₹1000 with 2% + 18% GST, charge ≈ ₹1024.17", () => {
    const r = computeStripeFee({
      amount: 1000, mode: "net", percent: 2, fixed: 0, taxOnFeePercent: 18,
    });
    expect(r.net).toBe(1000);
    // charge = 1000 / (1 - 0.02*1.18) = 1000 / 0.9764 = 1024.17
    expect(r.charge).toBeCloseTo(1024.17, 1);
    expect(r.totalFee).toBeCloseTo(24.17, 1);
  });

  it("add-ons (Billing/Invoicing) add to the rate", () => {
    const r = computeStripeFee({
      amount: 100, mode: "charge", percent: 2.9, fixed: 0.3, addOnPercent: 0.7,
    });
    expect(r.ratePercent).toBe(3.6); // 2.9 + 0.7
    expect(r.totalFee).toBe(3.9); // 100*0.036 + 0.30
  });

  it("zero / invalid amount returns zeros", () => {
    expect(computeStripeFee({ amount: 0, mode: "charge", percent: 2.9, fixed: 0.3 }).net).toBe(0);
    expect(computeStripeFee({ amount: -5, mode: "charge", percent: 2.9, fixed: 0.3 }).totalFee).toBe(0);
  });

  it("handles large amounts without float drift", () => {
    const r = computeStripeFee({ amount: 1_000_000, mode: "charge", percent: 2.9, fixed: 0.3 });
    expect(r.totalFee).toBe(29000.3);
    expect(r.net).toBe(970999.7);
  });
});
