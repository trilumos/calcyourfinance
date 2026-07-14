/**
 * Reverb fee calculator tests.
 *
 * Reverb reuses computeMarketplaceFee directly — these tests validate the
 * platform's specific config values through the shared formula.
 *
 * Verified rates (2026-06-11):
 *   Selling fee:  5% of (item price + shipping), min $0.50, capped at $500
 *   Processing:   3.19% + $0.49 (standard) | 2.99% + $0.49 (Preferred Seller)
 *   Sources:
 *     https://help.reverb.com/hc/en-us/articles/40917652290843
 *     https://help.reverb.com/hc/en-us/articles/41988469262107
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

/** Standard seller config */
const STANDARD = {
  sellingPercent: 5,
  feeCap: 500,
  feeMin: 0.5,
  processingPercent: 3.19,
  processingFixed: 0.49,
  feeOnShipping: true,
} as const;

/** Preferred Seller config (lower processing rate) */
const PREFERRED = {
  sellingPercent: 5,
  feeCap: 500,
  feeMin: 0.5,
  processingPercent: 2.99,
  processingFixed: 0.49,
  feeOnShipping: true,
} as const;

// ---------------------------------------------------------------------------
// Zero / empty input
// ---------------------------------------------------------------------------
describe("zero input returns zeros", () => {
  it("zero item price", () => {
    const r = computeMarketplaceFee({ ...STANDARD, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Worked example: $1,000 guitar + $50 shipping (standard seller)
//   Revenue       = $1,050.00
//   Selling fee   = $1,050 × 5%          = $52.50
//   Processing fee= $1,050 × 3.19% + $0.49 = $33.99
//   Total fees    = $86.49
//   Payout        = $963.51
// ---------------------------------------------------------------------------
describe("worked example — $1,000 guitar + $50 shipping", () => {
  const r = computeMarketplaceFee({
    ...STANDARD,
    itemPrice: 1000,
    shipping: 50,
  });

  it("revenue is $1,050", () => expect(r.revenue).toBe(1050));
  it("selling fee is $52.50", () => expect(r.sellingFee).toBe(52.5));
  it("processing fee is $33.99", () => expect(r.processingFee).toBe(33.99));
  it("total fees is $86.49", () => expect(r.totalFees).toBe(86.49));
  it("payout is $963.51", () => expect(r.payout).toBe(963.51));
});

// ---------------------------------------------------------------------------
// Profit included: same guitar, item cost $400
//   Profit = payout ($963.51) − item cost ($400) = $563.51
// ---------------------------------------------------------------------------
describe("profit with item cost", () => {
  it("profit = payout - item cost", () => {
    const r = computeMarketplaceFee({
      ...STANDARD,
      itemPrice: 1000,
      shipping: 50,
      itemCost: 400,
    });
    expect(r.profit).toBe(563.51);
  });
});

// ---------------------------------------------------------------------------
// Fee cap boundary: $10,500 item (5% = $525, capped at $500)
//   Revenue       = $10,500
//   Selling fee   = $500 (capped — would be $525 without cap)
//   Processing fee= $10,500 × 3.19% + $0.49 = $335.44
//   Total fees    = $835.44
//   Payout        = $9,664.56
// ---------------------------------------------------------------------------
describe("fee cap — $10,500 item exceeds $500 cap", () => {
  const r = computeMarketplaceFee({
    ...STANDARD,
    itemPrice: 10500,
    shipping: 0,
  });

  it("selling fee is capped at $500, not $525", () => expect(r.sellingFee).toBe(500));
  it("processing fee is $335.44", () => expect(r.processingFee).toBe(335.44));
  it("total fees is $835.44", () => expect(r.totalFees).toBe(835.44));
  it("payout is $9,664.56", () => expect(r.payout).toBe(9664.56));
});

// ---------------------------------------------------------------------------
// Fee minimum: very cheap item where 5% < $0.50
//   $5 item, no shipping → 5% = $0.25 → min kicks in → $0.50
// ---------------------------------------------------------------------------
describe("fee minimum — $5 item, selling fee floored at $0.50", () => {
  const r = computeMarketplaceFee({
    ...STANDARD,
    itemPrice: 5,
    shipping: 0,
  });

  it("selling fee is $0.50 (not $0.25)", () => expect(r.sellingFee).toBe(0.5));
});

// ---------------------------------------------------------------------------
// Preferred Seller: same guitar, lower processing rate
//   Processing = $1,050 × 2.99% + $0.49 = $31.39 + $0.49 = $31.88 (need to verify)
//   Actually: 1050 * 0.0299 = 31.395, + 0.49 = 31.885 → rounds to $31.89
//   Total fees = $52.50 + $31.89 = $84.39
//   Payout     = $1,050 − $84.39 = $965.61
// ---------------------------------------------------------------------------
describe("preferred seller — lower processing rate", () => {
  const r = computeMarketplaceFee({
    ...PREFERRED,
    itemPrice: 1000,
    shipping: 50,
  });

  it("selling fee is same $52.50", () => expect(r.sellingFee).toBe(52.5));
  it("processing fee is $31.89 (2.99% + $0.49)", () => {
    // 1050 * 0.0299 + 0.49 = 31.395 + 0.49 = 31.885 → roundMoney → 31.89
    expect(r.processingFee).toBe(31.89);
  });
  it("payout is higher than standard seller", () => expect(r.payout).toBeGreaterThan(963.51));
});

// ---------------------------------------------------------------------------
// Shipping is included in both selling fee and processing fee bases
// ---------------------------------------------------------------------------
describe("shipping included in fee base", () => {
  it("selling fee applies to shipping", () => {
    const withShipping = computeMarketplaceFee({ ...STANDARD, itemPrice: 100, shipping: 20 });
    const withoutShipping = computeMarketplaceFee({ ...STANDARD, itemPrice: 100, shipping: 0 });
    // Revenue with shipping = $120 → selling fee = $6.00 vs $5.00 without
    expect(withShipping.sellingFee).toBeGreaterThan(withoutShipping.sellingFee);
    expect(withShipping.sellingFee).toBe(6);
  });
});
