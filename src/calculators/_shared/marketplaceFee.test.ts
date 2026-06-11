import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "./marketplaceFee";

describe("computeMarketplaceFee", () => {
  it("simple % + processing (Reverb-style): $100 → 5% + 2.7%+$0.49", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100, sellingPercent: 5, processingPercent: 2.7, processingFixed: 0.49,
    });
    expect(r.revenue).toBe(100);
    expect(r.sellingFee).toBe(5);
    expect(r.processingFee).toBe(3.19);
    expect(r.totalFees).toBe(8.19);
    expect(r.payout).toBe(91.81);
    expect(r.takeRatePercent).toBe(8.19);
  });

  it("selling fee applies to item + shipping by default", () => {
    const r = computeMarketplaceFee({
      itemPrice: 25, shipping: 5, sellingPercent: 10, processingPercent: 2.9, processingFixed: 0.3,
    });
    expect(r.revenue).toBe(30);
    expect(r.sellingFee).toBe(3);
    expect(r.processingFee).toBe(1.17);
    expect(r.payout).toBe(25.83);
  });

  it("feeOnShipping:false charges the % on the item only", () => {
    const r = computeMarketplaceFee({
      itemPrice: 25, shipping: 5, sellingPercent: 10, feeOnShipping: false,
    });
    expect(r.sellingFee).toBe(2.5);
    expect(r.payout).toBe(27.5);
  });

  it("flat-under-threshold fires below the threshold (Poshmark-style)", () => {
    const r = computeMarketplaceFee({
      itemPrice: 10, sellingPercent: 20, flatUnderThreshold: { threshold: 15, fee: 2.95 },
    });
    expect(r.sellingFee).toBe(2.95);
    expect(r.payout).toBe(7.05);
  });

  it("flat-under-threshold does NOT fire at/above the threshold", () => {
    const r = computeMarketplaceFee({
      itemPrice: 15, sellingPercent: 20, flatUnderThreshold: { threshold: 15, fee: 2.95 },
    });
    expect(r.sellingFee).toBe(3);
    expect(r.payout).toBe(12);
  });

  it("feeCap limits the selling fee", () => {
    const r = computeMarketplaceFee({ itemPrice: 1000, sellingPercent: 10, feeCap: 50 });
    expect(r.sellingFee).toBe(50);
    expect(r.payout).toBe(950);
  });

  it("feeMin floors the selling fee", () => {
    const r = computeMarketplaceFee({ itemPrice: 5, sellingPercent: 10, feeMin: 1 });
    expect(r.sellingFee).toBe(1);
    expect(r.payout).toBe(4);
  });

  it("itemCost yields profit", () => {
    const r = computeMarketplaceFee({
      itemPrice: 25, shipping: 5, sellingPercent: 10, processingPercent: 2.9, processingFixed: 0.3, itemCost: 8,
    });
    expect(r.payout).toBe(25.83);
    expect(r.profit).toBe(17.83);
  });

  it("zero revenue returns zeros", () => {
    const r = computeMarketplaceFee({ itemPrice: 0, sellingPercent: 10 });
    expect(r.payout).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });
});
