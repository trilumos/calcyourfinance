import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// App Store / Google Play commission is a flat % of the price (all-inclusive).
describe("app-store-fee-calculator", () => {
  it("standard 30% on $4.99 → keep $3.49", () => {
    const r = computeMarketplaceFee({ itemPrice: 4.99, sellingPercent: 30 });
    expect(r.sellingFee).toBe(1.5);
    expect(r.payout).toBe(3.49);
  });

  it("Small Business 15% on $4.99 → keep $4.24", () => {
    const r = computeMarketplaceFee({ itemPrice: 4.99, sellingPercent: 15 });
    expect(r.sellingFee).toBe(0.75);
    expect(r.payout).toBe(4.24);
  });

  it("reduced 20% on $100 → keep $80", () => {
    const r = computeMarketplaceFee({ itemPrice: 100, sellingPercent: 20 });
    expect(r.payout).toBe(80);
  });

  it("zero price → zeros", () => {
    expect(computeMarketplaceFee({ itemPrice: 0, sellingPercent: 30 }).payout).toBe(0);
  });
});
