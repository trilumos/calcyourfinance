/**
 * Ko-fi fee calculator tests.
 *
 * Ko-fi reuses computeMarketplaceFee — these tests validate the platform's
 * specific config values through the shared formula.
 *
 * Verified rates (2026-06-13):
 *   Free plan — tips/donations:        0% platform fee
 *   Free plan — shop/memberships/commissions: 5% platform fee
 *   Gold plan ($12/mo):                0% platform fee on everything
 *   Payment processing (Stripe):       2.9% + $0.30 per transaction
 *
 * Sources:
 *   https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee
 *   https://ko-fi.com/pricing
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Config objects (mirror what config.ts passes to computeMarketplaceFee) ──

/** Free plan — tips/donations: 0% platform fee + Stripe 2.9% + $0.30 */
const FREE_TIPS = {
  sellingPercent: 0,
  feeOnShipping: false,
  processingPercent: 2.9,
  processingFixed: 0.3,
} as const;

/** Free plan — shop/memberships/commissions: 5% platform fee + Stripe 2.9% + $0.30 */
const FREE_SHOP = {
  sellingPercent: 5,
  feeOnShipping: false,
  processingPercent: 2.9,
  processingFixed: 0.3,
} as const;

/** Gold plan — 0% platform fee on everything + Stripe 2.9% + $0.30 */
const GOLD = {
  sellingPercent: 0,
  feeOnShipping: false,
  processingPercent: 2.9,
  processingFixed: 0.3,
} as const;

// ── Zero input returns zeros ─────────────────────────────────────────────────
describe("zero input returns zeros", () => {
  it("zero amount on free tips", () => {
    const r = computeMarketplaceFee({ ...FREE_TIPS, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── Free plan — tips ($25 donation, no platform fee) ────────────────────────
// Revenue       = $25.00
// Platform fee  = $25 × 0%          = $0.00
// Processing    = $25 × 2.9% + $0.30 = $0.725 + $0.30 = $1.025 → $1.03
// Total fees    = $1.03
// Payout        = $23.97
describe("free plan tips — $25 donation", () => {
  const r = computeMarketplaceFee({ ...FREE_TIPS, itemPrice: 25 });

  it("revenue is $25", () => expect(r.revenue).toBe(25));
  it("platform fee is $0 (0% on tips)", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $1.03", () => expect(r.processingFee).toBe(1.03));
  it("total fees is $1.03", () => expect(r.totalFees).toBe(1.03));
  it("payout is $23.97", () => expect(r.payout).toBe(23.97));
});

// ── Free plan — shop sale ($25, 5% platform fee) ─────────────────────────────
// Revenue       = $25.00
// Platform fee  = $25 × 5%          = $1.25
// Processing    = $25 × 2.9% + $0.30 = $1.03
// Total fees    = $2.28
// Payout        = $22.72
describe("free plan shop — $25 shop sale", () => {
  const r = computeMarketplaceFee({ ...FREE_SHOP, itemPrice: 25 });

  it("revenue is $25", () => expect(r.revenue).toBe(25));
  it("platform fee is $1.25 (5%)", () => expect(r.sellingFee).toBe(1.25));
  it("processing fee is $1.03", () => expect(r.processingFee).toBe(1.03));
  it("total fees is $2.28", () => expect(r.totalFees).toBe(2.28));
  it("payout is $22.72", () => expect(r.payout).toBe(22.72));
});

// ── Gold plan — shop sale ($25, 0% platform fee) ────────────────────────────
// Revenue       = $25.00
// Platform fee  = $0 (Gold)
// Processing    = $1.03
// Total fees    = $1.03
// Payout        = $23.97
describe("gold plan — $25 shop sale (0% fee)", () => {
  const r = computeMarketplaceFee({ ...GOLD, itemPrice: 25 });

  it("platform fee is $0 (Gold has no Ko-fi fee)", () => expect(r.sellingFee).toBe(0));
  it("payout is $23.97 (same as free tips)", () => expect(r.payout).toBe(23.97));
});

// ── Free plan shop — profit with item cost ───────────────────────────────────
// $25 sale, $5 item cost → profit = payout ($22.72) − $5 = $17.72
describe("free plan shop — profit with item cost", () => {
  it("profit = payout minus item cost", () => {
    const r = computeMarketplaceFee({ ...FREE_SHOP, itemPrice: 25, itemCost: 5 });
    expect(r.profit).toBe(17.72);
  });
});

// ── Free plan shop — larger amount ($100) ────────────────────────────────────
// Revenue       = $100.00
// Platform fee  = $100 × 5%          = $5.00
// Processing    = $100 × 2.9% + $0.30 = $2.90 + $0.30 = $3.20
// Total fees    = $8.20
// Payout        = $91.80
describe("free plan shop — $100 shop sale", () => {
  const r = computeMarketplaceFee({ ...FREE_SHOP, itemPrice: 100 });

  it("platform fee is $5.00", () => expect(r.sellingFee).toBe(5));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.2));
  it("total fees is $8.20", () => expect(r.totalFees).toBe(8.2));
  it("payout is $91.80", () => expect(r.payout).toBe(91.8));
});

// ── Free tips vs free shop — difference is exactly 5% of amount ─────────────
describe("free tips vs free shop payout difference", () => {
  it("shop payout is lower than tips payout by exactly 5% of the amount", () => {
    const amount = 50;
    const tips = computeMarketplaceFee({ ...FREE_TIPS, itemPrice: amount });
    const shop = computeMarketplaceFee({ ...FREE_SHOP, itemPrice: amount });
    // Platform fee diff = 5% × 50 = $2.50
    expect(+(tips.payout - shop.payout).toFixed(2)).toBe(2.5);
  });
});
