/**
 * Substack fee calculator tests.
 *
 * Substack reuses computeMarketplaceFee — these tests validate the platform's
 * specific config values through the shared formula.
 *
 * Verified rates (2026-06-13):
 *   Platform fee:         10% on all paid subscriptions (monthly or annual)
 *   Stripe processing:    2.9% + $0.30 per transaction
 *   Stripe Billing:       0.7% recurring billing fee (added July 2024)
 *   Combined processing:  3.6% + $0.30 per payment
 *
 * Sources:
 *   https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost
 *   https://substack.com/going-paid
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Config objects ────────────────────────────────────────────────────────────

/** Monthly subscription: 10% + 3.6% + $0.30 */
const MONTHLY = {
  sellingPercent: 10,
  feeOnShipping: false,
  processingPercent: 3.6,   // Stripe 2.9% + Stripe Billing 0.7%
  processingFixed: 0.3,
} as const;

/**
 * Annual subscription: same % rates, but $0.30 is charged once on the
 * annual payment (not 12× monthly). The calculator passes the annual amount
 * directly — same config, different itemPrice.
 */
const ANNUAL = MONTHLY; // same rates, annual amount passed as itemPrice

// ── Zero input returns zeros ──────────────────────────────────────────────────
describe("zero input returns zeros", () => {
  it("zero amount", () => {
    const r = computeMarketplaceFee({ ...MONTHLY, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── Worked example: $10/month subscription ───────────────────────────────────
// Revenue       = $10.00
// Platform fee  = $10 × 10%          = $1.00
// Processing    = $10 × 3.6% + $0.30 = $0.36 + $0.30 = $0.66
// Total fees    = $1.66
// Payout        = $8.34
describe("monthly — $10/month subscription", () => {
  const r = computeMarketplaceFee({ ...MONTHLY, itemPrice: 10 });

  it("revenue is $10", () => expect(r.revenue).toBe(10));
  it("platform fee is $1.00 (10%)", () => expect(r.sellingFee).toBe(1));
  it("processing fee is $0.66 (3.6% + $0.30)", () => expect(r.processingFee).toBe(0.66));
  it("total fees is $1.66", () => expect(r.totalFees).toBe(1.66));
  it("payout is $8.34", () => expect(r.payout).toBe(8.34));
});

// ── $5/month subscription ────────────────────────────────────────────────────
// Revenue       = $5.00
// Platform fee  = $0.50
// Processing    = $5 × 3.6% + $0.30 = $0.18 + $0.30 = $0.48
// Total fees    = $0.98
// Payout        = $4.02
describe("monthly — $5/month subscription", () => {
  const r = computeMarketplaceFee({ ...MONTHLY, itemPrice: 5 });

  it("platform fee is $0.50", () => expect(r.sellingFee).toBe(0.5));
  it("processing fee is $0.48", () => expect(r.processingFee).toBe(0.48));
  it("total fees is $0.98", () => expect(r.totalFees).toBe(0.98));
  it("payout is $4.02", () => expect(r.payout).toBe(4.02));
});

// ── Annual subscription: $100/year ───────────────────────────────────────────
// Revenue       = $100.00
// Platform fee  = $100 × 10%          = $10.00
// Processing    = $100 × 3.6% + $0.30 = $3.60 + $0.30 = $3.90
// Total fees    = $13.90
// Payout        = $86.10
describe("annual — $100/year subscription (one payment)", () => {
  const r = computeMarketplaceFee({ ...ANNUAL, itemPrice: 100 });

  it("platform fee is $10.00", () => expect(r.sellingFee).toBe(10));
  it("processing fee is $3.90", () => expect(r.processingFee).toBe(3.9));
  it("total fees is $13.90", () => expect(r.totalFees).toBe(13.9));
  it("payout is $86.10", () => expect(r.payout).toBe(86.1));
});

// ── $50/year annual subscription ─────────────────────────────────────────────
// Revenue       = $50.00
// Platform fee  = $5.00
// Processing    = $50 × 3.6% + $0.30 = $1.80 + $0.30 = $2.10
// Total fees    = $7.10
// Payout        = $42.90
describe("annual — $50/year subscription", () => {
  const r = computeMarketplaceFee({ ...ANNUAL, itemPrice: 50 });

  it("platform fee is $5.00", () => expect(r.sellingFee).toBe(5));
  it("processing fee is $2.10", () => expect(r.processingFee).toBe(2.1));
  it("total fees is $7.10", () => expect(r.totalFees).toBe(7.1));
  it("payout is $42.90", () => expect(r.payout).toBe(42.9));
});

// ── $20/month subscription ───────────────────────────────────────────────────
// Revenue       = $20.00
// Platform fee  = $2.00
// Processing    = $20 × 3.6% + $0.30 = $0.72 + $0.30 = $1.02
// Total fees    = $3.02
// Payout        = $16.98
describe("monthly — $20/month subscription", () => {
  const r = computeMarketplaceFee({ ...MONTHLY, itemPrice: 20 });

  it("platform fee is $2.00", () => expect(r.sellingFee).toBe(2));
  it("processing fee is $1.02", () => expect(r.processingFee).toBe(1.02));
  it("total fees is $3.02", () => expect(r.totalFees).toBe(3.02));
  it("payout is $16.98", () => expect(r.payout).toBe(16.98));
});

// ── Annual vs monthly: annual saves the $0.30 × 11 extra fixed fees ──────────
// $10/month × 12 = $120 total (12 payments of $0.30 = $3.60 in fixed fees)
// $120/year (one payment) = $0.30 once in fixed fees
// Annual payout should be higher than 12× monthly payout
describe("annual vs monthly — annual saves on fixed per-payment fee", () => {
  it("annual payout on $120 > 12 × monthly payout on $10", () => {
    const annual = computeMarketplaceFee({ ...ANNUAL, itemPrice: 120 });
    const monthly = computeMarketplaceFee({ ...MONTHLY, itemPrice: 10 });
    const monthly12 = +(monthly.payout * 12).toFixed(2);
    expect(annual.payout).toBeGreaterThan(monthly12);
  });
});

// ── Take rate check: Substack + Stripe together ≈ 13–14% ────────────────────
describe("effective take rate on $10/month is approximately 16.6%", () => {
  it("take rate is 16.6% ($1.66/$10)", () => {
    const r = computeMarketplaceFee({ ...MONTHLY, itemPrice: 10 });
    expect(r.takeRatePercent).toBe(16.6);
  });
});
