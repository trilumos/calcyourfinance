import { describe, it, expect } from "vitest";
import { computeEbayFee } from "./formula";

/**
 * Accuracy is the top priority. These tests pin eBay's PUBLISHED behaviour:
 *  - US "most categories" = 13.6% of (item + shipping + tax) + per-order fee.
 *  - eBay's own worked example: 13.6% of a $210.50 payment + $0.40 = $29.03.
 *  - High-value tier: 13.6% up to $7,500, then 2.35% on the portion above.
 *  - International fee = +1.65% of the sale total (US).
 *  - Private sellers in zero-fee markets (UK/DE) pay 0% FVF.
 *  - AU caps the FVF at A$440 and includes 10% GST in the fee (no add-on).
 *  - UK business sellers pay 0.35% regulatory operating fee + 20% VAT on fees.
 */

describe("computeEbayFee — US most categories", () => {
  it("matches eBay's published worked example ($210.50 → $29.03 FVF)", () => {
    const r = computeEbayFee({
      itemPrice: 210.5,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
    });
    // 13.6% × 210.50 = 28.628; + 0.40 = 29.028 → 29.03
    expect(r.finalValueFee).toBe(28.63); // 13.6% component, rounded
    expect(r.fixedFee).toBe(0.4);
    expect(r.totalFees).toBe(29.03);
  });

  it("computes $14.00 total fee on a simple $100 sale", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
    });
    expect(r.finalValueFee).toBe(13.6);
    expect(r.fixedFee).toBe(0.4);
    expect(r.totalFees).toBe(14.0);
    expect(r.payout).toBe(86.0);
  });

  it("applies the FVF to item + shipping together", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 10,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
    });
    // 13.6% × 110 = 14.96; + 0.40 = 15.36
    expect(r.revenue).toBe(110);
    expect(r.finalValueFee).toBe(14.96);
    expect(r.totalFees).toBe(15.36);
    expect(r.payout).toBe(94.64);
  });
});

describe("computeEbayFee — high-value tier", () => {
  it("blends 13.6% up to $7,500 and 2.35% above the breakpoint", () => {
    const r = computeEbayFee({
      itemPrice: 10000,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
      tierBreakpoint: 7500,
      tierPercent: 2.35,
    });
    // 13.6% × 7500 = 1020; 2.35% × 2500 = 58.75; total FVF % part = 1078.75
    expect(r.finalValueFee).toBe(1078.75);
    expect(r.fixedFee).toBe(0.4);
    expect(r.totalFees).toBe(1079.15);
  });

  it("does not apply the tier when the sale is below the breakpoint", () => {
    const r = computeEbayFee({
      itemPrice: 5000,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
      tierBreakpoint: 7500,
      tierPercent: 2.35,
    });
    expect(r.finalValueFee).toBe(680); // 13.6% × 5000
  });
});

describe("computeEbayFee — international fee", () => {
  it("adds 1.65% of the sale total when the buyer is international", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
      internationalPercent: 1.65,
      international: true,
    });
    expect(r.internationalFee).toBe(1.65);
    // 13.60 + 0.40 + 1.65 = 15.65
    expect(r.totalFees).toBe(15.65);
    expect(r.payout).toBe(84.35);
  });

  it("does not add the international fee when toggle is off", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
      internationalPercent: 1.65,
      international: false,
    });
    expect(r.internationalFee).toBe(0);
    expect(r.totalFees).toBe(14.0);
  });
});

describe("computeEbayFee — private sellers (zero-fee markets)", () => {
  it("charges no FVF, no per-order, no reg fee for a private seller", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 5,
      fvfPercent: 12.9,
      perOrderFee: 0.4,
      regulatoryPercent: 0.35,
      taxOnFeePercent: 20,
      sellerType: "private",
      privateSellerFree: true,
    });
    expect(r.finalValueFee).toBe(0);
    expect(r.fixedFee).toBe(0);
    expect(r.regulatoryFee).toBe(0);
    expect(r.taxOnFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(105);
  });

  it("still charges a business seller in the same market", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 12.9,
      perOrderFee: 0.4,
      regulatoryPercent: 0.35,
      taxOnFeePercent: 20,
      sellerType: "business",
      privateSellerFree: true,
    });
    // FVF 12.90 + per-order 0.40 + reg 0.35 = 13.65 in fees, +20% VAT on fees
    expect(r.finalValueFee).toBe(12.9);
    expect(r.fixedFee).toBe(0.4);
    expect(r.regulatoryFee).toBe(0.35);
    // VAT on fees = 20% × (12.90 + 0.40 + 0.35) = 20% × 13.65 = 2.73
    expect(r.taxOnFee).toBe(2.73);
    expect(r.totalFees).toBe(16.38);
  });
});

describe("computeEbayFee — AU fee cap and GST-inclusive", () => {
  it("caps the FVF at the per-item cap (A$440)", () => {
    const r = computeEbayFee({
      itemPrice: 5000,
      shipping: 0,
      fvfPercent: 13.4,
      perOrderFee: 0.4,
      tierBreakpoint: 4000,
      tierPercent: 2.4,
      fvfCap: 440,
    });
    // 13.4% × 4000 = 536; 2.4% × 1000 = 24; raw = 560 → capped to 440
    expect(r.finalValueFee).toBe(440);
    expect(r.fixedFee).toBe(0.4);
  });
});

describe("computeEbayFee — promoted listings ad fee", () => {
  it("adds an ad fee as a percentage of the sale total", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
      adPercent: 5,
    });
    expect(r.adFee).toBe(5); // 5% × 100
    expect(r.totalFees).toBe(19.0); // 13.60 + 0.40 + 5.00
    expect(r.payout).toBe(81.0);
  });
});

describe("computeEbayFee — profit and effective rate", () => {
  it("subtracts item cost to give profit", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
      itemCost: 40,
    });
    expect(r.payout).toBe(86.0);
    expect(r.profit).toBe(46.0); // 86 − 40
  });

  it("reports the effective fee rate as a % of revenue", () => {
    const r = computeEbayFee({
      itemPrice: 100,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
    });
    expect(r.effectiveRatePercent).toBe(14.0); // 14.00 / 100
  });
});

describe("computeEbayFee — edge cases", () => {
  it("returns all zeros for zero input", () => {
    const r = computeEbayFee({
      itemPrice: 0,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.4,
    });
    expect(r.revenue).toBe(0);
    expect(r.finalValueFee).toBe(0);
    expect(r.fixedFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.profit).toBe(0);
    expect(r.effectiveRatePercent).toBe(0);
  });

  it("uses the lower per-order fee when there is one (e.g. $0.30 ≤ $10)", () => {
    const r = computeEbayFee({
      itemPrice: 8,
      shipping: 0,
      fvfPercent: 13.6,
      perOrderFee: 0.3,
    });
    expect(r.fixedFee).toBe(0.3);
  });
});
