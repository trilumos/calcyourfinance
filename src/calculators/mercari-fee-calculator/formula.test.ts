/**
 * Mercari fee calculator tests.
 *
 * Mercari US (effective January 6, 2025):
 *   SELLER: 10% selling fee on (item price + buyer-paid shipping).
 *           No separate payment processing fee.
 *   BUYER:  3.6% Buyer Protection fee (informational — does NOT reduce seller
 *           payout). Computed separately to show "what the buyer pays."
 *
 * Mercari Japan:
 *   SELLER: 10% selling fee on sale price. No separate processing fee.
 *
 * History note: Between Mar 27, 2024 – Jan 5, 2025, Mercari US had a
 * zero-seller-fee experiment. That period ended; current rate is 10%.
 *
 * Sources:
 *   https://www.mercari.com/us/help_center/article/169/
 *   https://www.mercari.com/us/help_center/article/2517/
 *   https://www.mercari.com/us/help_center/article/2518/
 *   https://help.jp.mercari.com/guide/articles/65/
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Mercari US params ─────────────────────────────────────────────────────────
// 10% seller fee on (item + shipping). No processing fee.
const US_PARAMS = {
  sellingPercent: 10,
  feeOnShipping: true,
  processingPercent: 0,
  processingFixed: 0,
} as const;

// ── Mercari Japan params ──────────────────────────────────────────────────────
// 10% seller fee on item price (JP shipping is separate; we model on item price
// same as US for simplicity, consistent with jp.mercari.com help page).
const JP_PARAMS = {
  sellingPercent: 10,
  feeOnShipping: true,
  processingPercent: 0,
  processingFixed: 0,
} as const;

// ── Zero input ────────────────────────────────────────────────────────────────

describe("Mercari US — zero input returns zeros", () => {
  it("zero item price", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── US worked example: $100 item, no shipping ─────────────────────────────────
//   Revenue       = $100.00
//   Seller fee    = $100 × 10%  = $10.00
//   Processing    = $0.00
//   Total fees    = $10.00
//   Payout        = $90.00
// ─────────────────────────────────────────────────────────────────────────────

describe("Mercari US — $100 item, no shipping", () => {
  const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100 });

  it("revenue is $100", () => expect(r.revenue).toBe(100));
  it("selling fee is $10.00 (10%)", () => expect(r.sellingFee).toBe(10));
  it("processing fee is $0", () => expect(r.processingFee).toBe(0));
  it("total fees is $10.00", () => expect(r.totalFees).toBe(10));
  it("payout is $90.00", () => expect(r.payout).toBe(90));
  it("take rate is 10%", () => expect(r.takeRatePercent).toBe(10));
});

// ── US: item + shipping — fee applies to both ─────────────────────────────────
//   $80 item + $20 shipping → revenue $100 → 10% = $10 → payout $90
// ─────────────────────────────────────────────────────────────────────────────

describe("Mercari US — $80 item + $20 shipping", () => {
  const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 80, shipping: 20 });

  it("revenue is $100", () => expect(r.revenue).toBe(100));
  it("selling fee is $10.00 (10% of $100)", () => expect(r.sellingFee).toBe(10));
  it("payout is $90.00", () => expect(r.payout).toBe(90));
});

// ── US: $50 item, no shipping ─────────────────────────────────────────────────
//   Revenue = $50 → 10% = $5.00 → payout $45.00
// ─────────────────────────────────────────────────────────────────────────────

describe("Mercari US — $50 sale (common low-value item)", () => {
  const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 50 });

  it("selling fee is $5.00", () => expect(r.sellingFee).toBe(5));
  it("payout is $45.00", () => expect(r.payout).toBe(45));
  it("no processing fee", () => expect(r.processingFee).toBe(0));
});

// ── US: profit with item cost ─────────────────────────────────────────────────
//   $100 sale, $10 fee → payout $90 → minus $60 cost → profit $30
// ─────────────────────────────────────────────────────────────────────────────

describe("Mercari US — profit with item cost", () => {
  it("profit = payout - item cost", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, itemCost: 60 });
    expect(r.payout).toBe(90);
    expect(r.profit).toBe(30);
  });
});

// ── US: buyer-side fee (informational — computed separately) ──────────────────
//   Buyer pays 3.6% on top of listed price: $100 × 3.6% = $3.60
//   Buyer total = $103.60
// ─────────────────────────────────────────────────────────────────────────────

describe("Mercari US — buyer Buyer Protection fee (3.6%, informational)", () => {
  it("buyer fee on $100 = $3.60", () => {
    // Computed separately from seller fee using same formula with buyerPercent
    const buyerFee = Math.round(100 * 0.036 * 100) / 100;
    expect(buyerFee).toBe(3.6);
  });

  it("buyer total on $100 = $103.60", () => {
    const itemPrice = 100;
    const buyerFee = Math.round(itemPrice * 0.036 * 100) / 100;
    const buyerTotal = Math.round((itemPrice + buyerFee) * 100) / 100;
    expect(buyerTotal).toBe(103.6);
  });

  it("buyer fee on $50 = $1.80", () => {
    const buyerFee = Math.round(50 * 0.036 * 100) / 100;
    expect(buyerFee).toBe(1.8);
  });
});

// ── Japan: $1,000 item ────────────────────────────────────────────────────────
//   Revenue = ¥1,000 → 10% = ¥100 → payout ¥900
// ─────────────────────────────────────────────────────────────────────────────

describe("Mercari Japan — ¥1,000 item (10% seller fee)", () => {
  const r = computeMarketplaceFee({ ...JP_PARAMS, itemPrice: 1000 });

  it("revenue is ¥1,000", () => expect(r.revenue).toBe(1000));
  it("selling fee is ¥100 (10%)", () => expect(r.sellingFee).toBe(100));
  it("payout is ¥900", () => expect(r.payout).toBe(900));
  it("no processing fee", () => expect(r.processingFee).toBe(0));
});

// ── No seller fee during zero-fee period is NOT the current model ─────────────
// This ensures we don't accidentally regress to the 2024 experiment (0% seller)
describe("Mercari US — seller is NOT zero-fee (Jan 2025+ model confirmed)", () => {
  it("$100 sale: seller pays $10, not $0", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBeGreaterThan(0);
    expect(r.sellingFee).toBe(10);
  });
});
