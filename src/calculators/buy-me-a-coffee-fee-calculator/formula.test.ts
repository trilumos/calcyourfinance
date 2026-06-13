/**
 * Buy Me a Coffee fee calculator tests.
 *
 * BMaC reuses computeMarketplaceFee — these tests validate the platform's
 * specific config values through the shared formula.
 *
 * Verified rates (2026-06-13):
 *   Platform fee:        5% on all transactions
 *   Stripe processing:   2.9% + $0.30 per transaction
 *   Stripe payout fee:   0.5% (modelled together with processing as 3.4% + $0.30)
 *   International:       +1% surcharge on top of processing
 *   Subscription:        +0.5% surcharge for recurring payments
 *
 * Sources:
 *   https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment
 *   https://help.buymeacoffee.com/en/articles/10182730-what-is-buy-me-a-coffee-and-how-does-it-work
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Config objects ────────────────────────────────────────────────────────────

/** Standard domestic one-time payment: 5% + 3.4% + $0.30 */
const STANDARD = {
  sellingPercent: 5,
  feeOnShipping: false,
  processingPercent: 3.4,   // Stripe 2.9% + Stripe payout 0.5%
  processingFixed: 0.3,
} as const;

/** International payment: 5% + (3.4% + 1%) + $0.30 = 5% + 4.4% + $0.30 */
const INTERNATIONAL = {
  sellingPercent: 5,
  feeOnShipping: false,
  processingPercent: 4.4,   // 2.9% + 0.5% payout + 1% international
  processingFixed: 0.3,
} as const;

/** Subscription/recurring: 5% + (3.4% + 0.5%) + $0.30 = 5% + 3.9% + $0.30 */
const SUBSCRIPTION = {
  sellingPercent: 5,
  feeOnShipping: false,
  processingPercent: 3.9,   // 2.9% + 0.5% payout + 0.5% subscription
  processingFixed: 0.3,
} as const;

// ── Zero input returns zeros ──────────────────────────────────────────────────
describe("zero input returns zeros", () => {
  it("zero amount", () => {
    const r = computeMarketplaceFee({ ...STANDARD, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── Worked example: $15 one-time domestic payment ─────────────────────────────
// Revenue       = $15.00
// Platform fee  = $15 × 5%           = $0.75
// Processing    = $15 × 3.4% + $0.30 = $0.51 + $0.30 = $0.81
// Total fees    = $1.56
// Payout        = $13.44
describe("standard domestic — $15 one-time payment", () => {
  const r = computeMarketplaceFee({ ...STANDARD, itemPrice: 15 });

  it("revenue is $15", () => expect(r.revenue).toBe(15));
  it("platform fee is $0.75 (5%)", () => expect(r.sellingFee).toBe(0.75));
  it("processing fee is $0.81 (3.4% + $0.30)", () => expect(r.processingFee).toBe(0.81));
  it("total fees is $1.56", () => expect(r.totalFees).toBe(1.56));
  it("payout is $13.44", () => expect(r.payout).toBe(13.44));
});

// ── $5 coffee (the classic default) ──────────────────────────────────────────
// Revenue       = $5.00
// Platform fee  = $0.25
// Processing    = $5 × 3.4% + $0.30 = $0.17 + $0.30 = $0.47
// Total fees    = $0.72
// Payout        = $4.28
describe("standard domestic — $5 coffee payment", () => {
  const r = computeMarketplaceFee({ ...STANDARD, itemPrice: 5 });

  it("platform fee is $0.25", () => expect(r.sellingFee).toBe(0.25));
  it("processing fee is $0.47", () => expect(r.processingFee).toBe(0.47));
  it("total fees is $0.72", () => expect(r.totalFees).toBe(0.72));
  it("payout is $4.28", () => expect(r.payout).toBe(4.28));
});

// ── International payment ($15) ───────────────────────────────────────────────
// Revenue       = $15.00
// Platform fee  = $0.75
// Processing    = $15 × 4.4% + $0.30 = $0.66 + $0.30 = $0.96
// Total fees    = $1.71
// Payout        = $13.29
describe("international — $15 payment with +1% surcharge", () => {
  const r = computeMarketplaceFee({ ...INTERNATIONAL, itemPrice: 15 });

  it("processing fee is $0.96 (4.4% + $0.30)", () => expect(r.processingFee).toBe(0.96));
  it("total fees is $1.71", () => expect(r.totalFees).toBe(1.71));
  it("payout is $13.29", () => expect(r.payout).toBe(13.29));
});

// ── Subscription payment ($10/month) ──────────────────────────────────────────
// Revenue       = $10.00
// Platform fee  = $0.50
// Processing    = $10 × 3.9% + $0.30 = $0.39 + $0.30 = $0.69
// Total fees    = $1.19
// Payout        = $8.81
describe("subscription — $10/month recurring payment", () => {
  const r = computeMarketplaceFee({ ...SUBSCRIPTION, itemPrice: 10 });

  it("platform fee is $0.50", () => expect(r.sellingFee).toBe(0.5));
  it("processing fee is $0.69 (3.9% + $0.30)", () => expect(r.processingFee).toBe(0.69));
  it("total fees is $1.19", () => expect(r.totalFees).toBe(1.19));
  it("payout is $8.81", () => expect(r.payout).toBe(8.81));
});

// ── Profit with item cost ─────────────────────────────────────────────────────
// $50 sale, $10 item cost → profit = payout ($47.30) − $10 = $37.30
// payout: 50 - (50×5%) - (50×3.4%+0.30) = 50 - 2.50 - 2.00 = 45.50
//   wait: 50×3.4% = 1.70, +0.30 = 2.00; total fees = 2.50+2.00=4.50; payout=45.50
describe("profit with item cost — $50 sale, $10 cost", () => {
  it("profit = payout minus item cost", () => {
    const r = computeMarketplaceFee({ ...STANDARD, itemPrice: 50, itemCost: 10 });
    // processing: 50×0.034+0.30 = 1.70+0.30 = 2.00
    // platform: 50×0.05 = 2.50
    // payout: 50-4.50 = 45.50
    // profit: 45.50-10 = 35.50
    expect(r.payout).toBe(45.5);
    expect(r.profit).toBe(35.5);
  });
});

// ── $100 payment (larger amount to validate at scale) ────────────────────────
// Revenue       = $100.00
// Platform fee  = $5.00
// Processing    = $100 × 3.4% + $0.30 = $3.40 + $0.30 = $3.70
// Total fees    = $8.70
// Payout        = $91.30
describe("standard domestic — $100 payment", () => {
  const r = computeMarketplaceFee({ ...STANDARD, itemPrice: 100 });

  it("platform fee is $5.00", () => expect(r.sellingFee).toBe(5));
  it("processing fee is $3.70", () => expect(r.processingFee).toBe(3.7));
  it("total fees is $8.70", () => expect(r.totalFees).toBe(8.7));
  it("payout is $91.30", () => expect(r.payout).toBe(91.3));
});
