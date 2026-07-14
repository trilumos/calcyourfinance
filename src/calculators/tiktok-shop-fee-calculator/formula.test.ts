import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

/**
 * TikTok Shop fee calculator — accuracy tests.
 *
 * TikTok Shop charges ONE fee to sellers per order: a REFERRAL FEE.
 * No separate payment-processing fee is charged to sellers.
 *
 * US rates (verified 2026-06-12):
 *   Standard:      6% of order value (effective April 1, 2024)
 *   Reduced cats:  5% (precious jewelry, pre-owned — effective Oct 31, 2024)
 *   New seller:    3% for first 30 days after first sale
 *
 * UK rate (verified 2026-06-12):
 *   Standard:      9% (VAT-inclusive)
 *
 * The referral fee base is the order total (item price + shipping).
 * Payout = Revenue − Referral fee.
 *
 * Source:
 *   https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018
 *   https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682
 *   https://seller-uk.tiktok.com/university/essay?knowledge_id=3337893683398432
 */

// TikTok Shop reuses computeMarketplaceFee from the shared module.
// sellingPercent = referral fee %; no processingPercent/Fixed.

describe("TikTok Shop US — standard 6% referral fee", () => {
  it("charges 6% on a $100 order with no shipping", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100,
      sellingPercent: 6,
    });
    expect(r.revenue).toBe(100);
    expect(r.sellingFee).toBe(6);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(6);
    expect(r.payout).toBe(94);
    expect(r.takeRatePercent).toBe(6);
  });

  it("applies 6% to item + shipping combined", () => {
    const r = computeMarketplaceFee({
      itemPrice: 90,
      shipping: 10,
      sellingPercent: 6,
    });
    // Revenue = $100; fee = 6% × $100 = $6.00
    expect(r.revenue).toBe(100);
    expect(r.sellingFee).toBe(6);
    expect(r.payout).toBe(94);
  });

  it("computes correct payout on a $50 order — TikTok Shop on $50", () => {
    const r = computeMarketplaceFee({
      itemPrice: 50,
      sellingPercent: 6,
    });
    // 6% × $50 = $3.00; payout = $47.00
    expect(r.sellingFee).toBe(3);
    expect(r.payout).toBe(47);
  });

  it("reports profit after item cost", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100,
      itemCost: 40,
      sellingPercent: 6,
    });
    // Payout $94; profit = $94 − $40 = $54
    expect(r.payout).toBe(94);
    expect(r.profit).toBe(54);
  });

  it("returns all zeros for zero input", () => {
    const r = computeMarketplaceFee({
      itemPrice: 0,
      sellingPercent: 6,
    });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.profit).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });
});

describe("TikTok Shop US — reduced 5% referral fee (precious jewelry / pre-owned)", () => {
  it("charges 5% on a $100 jewelry/pre-owned order", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100,
      sellingPercent: 5,
    });
    expect(r.sellingFee).toBe(5);
    expect(r.payout).toBe(95);
    expect(r.takeRatePercent).toBe(5);
  });

  it("correctly differentiates 5% vs 6% on the same $200 order", () => {
    const standard = computeMarketplaceFee({ itemPrice: 200, sellingPercent: 6 });
    const reduced = computeMarketplaceFee({ itemPrice: 200, sellingPercent: 5 });
    // Standard: $12 fee; reduced: $10 fee
    expect(standard.sellingFee).toBe(12);
    expect(reduced.sellingFee).toBe(10);
    expect(reduced.payout - standard.payout).toBe(2);
  });
});

describe("TikTok Shop US — new seller 3% promotional rate (first 30 days)", () => {
  it("charges 3% on a $100 order during the promo period", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100,
      sellingPercent: 3,
    });
    expect(r.sellingFee).toBe(3);
    expect(r.payout).toBe(97);
    expect(r.takeRatePercent).toBe(3);
  });

  it("saves exactly $3 vs the standard 6% rate on a $100 order", () => {
    const promo = computeMarketplaceFee({ itemPrice: 100, sellingPercent: 3 });
    const standard = computeMarketplaceFee({ itemPrice: 100, sellingPercent: 6 });
    expect(promo.payout - standard.payout).toBe(3);
  });
});

describe("TikTok Shop UK — standard 9% commission fee (VAT-inclusive)", () => {
  it("charges 9% on a £100 order", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100,
      sellingPercent: 9,
    });
    expect(r.sellingFee).toBe(9);
    expect(r.payout).toBe(91);
    expect(r.takeRatePercent).toBe(9);
  });

  it("applies 9% to item + shipping", () => {
    const r = computeMarketplaceFee({
      itemPrice: 80,
      shipping: 20,
      sellingPercent: 9,
    });
    // Revenue = £100; 9% × £100 = £9.00; payout = £91.00
    expect(r.revenue).toBe(100);
    expect(r.sellingFee).toBe(9);
    expect(r.payout).toBe(91);
  });

  it("UK vs US comparison: £/$ 100 order — UK seller keeps £7 less than US standard", () => {
    const uk = computeMarketplaceFee({ itemPrice: 100, sellingPercent: 9 });
    const us = computeMarketplaceFee({ itemPrice: 100, sellingPercent: 6 });
    expect(uk.sellingFee - us.sellingFee).toBe(3);
  });
});

describe("TikTok Shop — rounding", () => {
  it("rounds fee to cents on a non-round order total", () => {
    const r = computeMarketplaceFee({
      itemPrice: 33.33,
      sellingPercent: 6,
    });
    // 6% × $33.33 = $1.9998 → $2.00
    expect(r.sellingFee).toBe(2);
    expect(r.payout).toBe(31.33);
  });
});
