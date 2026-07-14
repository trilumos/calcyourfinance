import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

describe("shopify-fee-calculator", () => {
  it("Basic + Shopify Payments (2.9% + $0.30): $100 → fee $3.20, keep $96.80", () => {
    const r = computeMarketplaceFee({ itemPrice: 100, processingPercent: 2.9, processingFixed: 0.3 });
    expect(r.totalFees).toBe(3.2);
    expect(r.payout).toBe(96.8);
  });

  it("Advanced + Shopify Payments (2.5% + $0.30): $100 → fee $2.80", () => {
    const r = computeMarketplaceFee({ itemPrice: 100, processingPercent: 2.5, processingFixed: 0.3 });
    expect(r.totalFees).toBe(2.8);
  });

  it("Basic + third-party surcharge (2%): $100 → Shopify fee $2.00", () => {
    const r = computeMarketplaceFee({ itemPrice: 100, sellingPercent: 2 });
    expect(r.totalFees).toBe(2);
    expect(r.payout).toBe(98);
  });

  it("zero order → zeros", () => {
    expect(computeMarketplaceFee({ itemPrice: 0, processingPercent: 2.9, processingFixed: 0.3 }).payout).toBe(0);
  });
});
