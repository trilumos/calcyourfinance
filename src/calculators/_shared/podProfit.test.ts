import { describe, it, expect } from "vitest";
import { computePodProfit } from "./podProfit";

describe("computePodProfit", () => {
  /**
   * Hand-verified example:
   *   retail 25, productCost 12.50, shippingCost 4.99, qty 1
   *   revenue = 25 + 0 = 25.00
   *   totalCost = 12.50 + 4.99 + 0 = 17.49
   *   profit = 25.00 - 17.49 = 7.51
   *   marginPercent = 7.51 / 25.00 * 100 = 30.04
   */
  it("hand-verified: retail 25, productCost 12.50, shippingCost 4.99, qty 1", () => {
    const r = computePodProfit({
      retailPrice: 25,
      productCost: 12.5,
      shippingCost: 4.99,
    });
    expect(r.revenue).toBe(25);
    expect(r.totalCost).toBe(17.49);
    expect(r.profit).toBe(7.51);
    expect(r.marginPercent).toBe(30.04);
  });

  it("free shipping (no shippingCharged, no shippingCost)", () => {
    const r = computePodProfit({ retailPrice: 30, productCost: 15 });
    expect(r.revenue).toBe(30);
    expect(r.totalCost).toBe(15);
    expect(r.profit).toBe(15);
    expect(r.marginPercent).toBe(50);
  });

  it("shipping charged to customer increases revenue but not cost", () => {
    const r = computePodProfit({
      retailPrice: 25,
      shippingCharged: 5,
      productCost: 12.5,
      shippingCost: 4.99,
    });
    // revenue = (25 + 5) * 1 = 30
    // totalCost = (12.50 + 4.99) * 1 = 17.49
    // profit = 30 - 17.49 = 12.51
    // marginPercent = 12.51 / 30 * 100 = 41.70
    expect(r.revenue).toBe(30);
    expect(r.totalCost).toBe(17.49);
    expect(r.profit).toBe(12.51);
    expect(r.marginPercent).toBe(41.7);
  });

  it("quantity > 1 scales revenue and cost", () => {
    const r = computePodProfit({
      retailPrice: 25,
      productCost: 12.5,
      shippingCost: 4.99,
      quantity: 3,
    });
    // revenue = 25 * 3 = 75
    // totalCost = 17.49 * 3 = 52.47
    // profit = 75 - 52.47 = 22.53
    // marginPercent = 22.53 / 75 * 100 = 30.04
    expect(r.revenue).toBe(75);
    expect(r.totalCost).toBe(52.47);
    expect(r.profit).toBe(22.53);
    expect(r.marginPercent).toBe(30.04);
  });

  it("loss case: productCost > retailPrice yields negative profit", () => {
    const r = computePodProfit({ retailPrice: 10, productCost: 15 });
    expect(r.revenue).toBe(10);
    expect(r.totalCost).toBe(15);
    expect(r.profit).toBe(-5);
    // margin = -5 / 10 * 100 = -50
    expect(r.marginPercent).toBe(-50);
  });

  it("extraFees are included in totalCost", () => {
    const r = computePodProfit({
      retailPrice: 30,
      productCost: 12,
      shippingCost: 3,
      extraFees: 2.5,
    });
    // totalCost = 12 + 3 + 2.5 = 17.50
    expect(r.totalCost).toBe(17.5);
    expect(r.profit).toBe(12.5);
  });

  it("zero / empty input returns all zeros (no crash, no NaN)", () => {
    const r = computePodProfit({ retailPrice: 0, productCost: 0 });
    expect(r.revenue).toBe(0);
    expect(r.totalCost).toBe(0);
    expect(r.profit).toBe(0);
    expect(r.marginPercent).toBe(0);
  });

  it("non-finite inputs are treated as 0", () => {
    const r = computePodProfit({
      retailPrice: NaN,
      productCost: Infinity,
      shippingCost: -5,
    });
    expect(r.revenue).toBe(0);
    expect(r.totalCost).toBe(0);
    expect(r.profit).toBe(0);
    expect(r.marginPercent).toBe(0);
  });

  it("quantity < 1 is treated as 1", () => {
    const r = computePodProfit({
      retailPrice: 25,
      productCost: 12.5,
      shippingCost: 4.99,
      quantity: 0,
    });
    // Same as qty=1
    expect(r.revenue).toBe(25);
    expect(r.totalCost).toBe(17.49);
    expect(r.profit).toBe(7.51);
  });

  it("marginPercent is 0 when revenue is 0 (avoid divide-by-zero)", () => {
    const r = computePodProfit({ retailPrice: 0, productCost: 5 });
    expect(r.marginPercent).toBe(0);
  });
});
