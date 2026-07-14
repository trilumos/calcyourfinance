import { describe, it, expect } from "vitest";
import { computeAmazonSellerFee } from "./formula";
import { amazonFees } from "../../config/fees";

const cat = (id: string) => {
  const c = amazonFees.categories.find((x) => x.id === id);
  if (!c) throw new Error(`missing category ${id}`);
  return c;
};

const base = {
  referralMinimum: amazonFees.referralMinimum,
  mediaClosingFee: amazonFees.mediaClosingFee,
};

describe("computeAmazonSellerFee", () => {
  it("flat 15% referral, no shipping", () => {
    const r = computeAmazonSellerFee({ ...base, itemPrice: 100, category: cat("most") });
    expect(r.referralFee).toBe(15);
    expect(r.netProceeds).toBe(85);
    expect(r.effectiveFeeRatePercent).toBe(15);
  });

  it("referral applies to item + shipping", () => {
    // $90 item + $10 shipping → referral is 15% of $100 = $15, not $13.50.
    const r = computeAmazonSellerFee({ ...base, itemPrice: 90, shipping: 10, category: cat("most") });
    expect(r.revenue).toBe(100);
    expect(r.referralFee).toBe(15);
    expect(r.netProceeds).toBe(85);
  });

  it("per-item $0.30 minimum applies", () => {
    const r = computeAmazonSellerFee({ ...base, itemPrice: 1.5, category: cat("most") });
    expect(r.referralFee).toBe(0.3);
  });

  it("media category adds the $1.80 closing fee", () => {
    // $20 book: 15% referral ($3) + $1.80 closing = $4.80 total fees.
    const r = computeAmazonSellerFee({ ...base, itemPrice: 20, category: cat("media") });
    expect(r.referralFee).toBe(3);
    expect(r.closingFee).toBe(1.8);
    expect(r.totalFees).toBe(4.8);
    expect(r.netProceeds).toBe(15.2);
  });

  it("8% electronics category", () => {
    const r = computeAmazonSellerFee({ ...base, itemPrice: 200, category: cat("electronics") });
    expect(r.referralFee).toBe(16);
  });

  it("marginal jewelry tier via shared referral logic", () => {
    // $400 → 250×20% + 150×5% = 57.50.
    const r = computeAmazonSellerFee({ ...base, itemPrice: 400, category: cat("jewelry") });
    expect(r.referralFee).toBe(57.5);
  });

  it("profit and margin with product cost", () => {
    // $50 item, most (15%) → referral $7.50, net $42.50, cost $20 → profit $22.50 (45% margin).
    const r = computeAmazonSellerFee({ ...base, itemPrice: 50, productCost: 20, category: cat("most") });
    expect(r.referralFee).toBe(7.5);
    expect(r.netProceeds).toBe(42.5);
    expect(r.profit).toBe(22.5);
    expect(r.marginPercent).toBe(45);
  });

  it("zero price → no fees", () => {
    const r = computeAmazonSellerFee({ ...base, itemPrice: 0, category: cat("most") });
    expect(r.referralFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.netProceeds).toBe(0);
  });
});
