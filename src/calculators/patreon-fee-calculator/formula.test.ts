/**
 * Patreon fee calculator tests.
 *
 * Patreon reuses computeMarketplaceFee — these tests validate the platform's
 * specific plan + processing config values through the shared formula.
 *
 * Verified rates (2026-06-15):
 *   Platform fee — new plan (post Aug 4 2025): 10%
 *   Platform fee — legacy Lite:                 5%
 *   Platform fee — legacy Pro:                  8%
 *   Platform fee — legacy Premium:             12%
 *   Standard processing (pledge > $3):         2.9% + $0.30
 *   Micropayment processing (pledge ≤ $3):     5%   + $0.10
 *
 * Sources:
 *   https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview
 *   https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Config constants (mirrors patreonFees in fees.ts) ────────────────────────

const NEW_PLAN = { sellingPercent: 10, feeOnShipping: false } as const;
const LITE     = { sellingPercent:  5, feeOnShipping: false } as const;
const PRO      = { sellingPercent:  8, feeOnShipping: false } as const;
const PREMIUM  = { sellingPercent: 12, feeOnShipping: false } as const;

const STD_PROCESSING  = { processingPercent: 2.9, processingFixed: 0.30 } as const;
const MICRO_PROCESSING = { processingPercent: 5.0, processingFixed: 0.10 } as const;

// ── Zero input returns zeros ──────────────────────────────────────────────────

describe("zero input returns zeros", () => {
  it("new plan, standard processing, $0 pledge", () => {
    const r = computeMarketplaceFee({ ...NEW_PLAN, ...STD_PROCESSING, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── New plan (10%) — standard processing — $5 pledge ─────────────────────────
// Revenue       = $5.00
// Platform fee  = $5 × 10%           = $0.50
// Processing    = $5 × 2.9% + $0.30  = $0.145 + $0.30 = $0.445 → $0.45
// Total fees    = $0.50 + $0.45      = $0.95
// Payout        = $5.00 − $0.95      = $4.05

describe("new plan — $5 pledge — standard processing", () => {
  const r = computeMarketplaceFee({ ...NEW_PLAN, ...STD_PROCESSING, itemPrice: 5 });

  it("revenue is $5.00", () => expect(r.revenue).toBe(5));
  it("platform fee is $0.50 (10%)", () => expect(r.sellingFee).toBe(0.5));
  it("processing fee is $0.45", () => expect(r.processingFee).toBe(0.45));
  it("total fees is $0.95", () => expect(r.totalFees).toBe(0.95));
  it("payout is $4.05", () => expect(r.payout).toBe(4.05));
});

// ── New plan (10%) — standard processing — $25 pledge ────────────────────────
// Revenue       = $25.00
// Platform fee  = $25 × 10%           = $2.50
// Processing    = $25 × 2.9% + $0.30  = $0.725 + $0.30 = $1.025 → $1.03
// Total fees    = $2.50 + $1.03       = $3.53
// Payout        = $25.00 − $3.53      = $21.47

describe("new plan — $25 pledge — standard processing", () => {
  const r = computeMarketplaceFee({ ...NEW_PLAN, ...STD_PROCESSING, itemPrice: 25 });

  it("platform fee is $2.50", () => expect(r.sellingFee).toBe(2.5));
  it("processing fee is $1.03", () => expect(r.processingFee).toBe(1.03));
  it("total fees is $3.53", () => expect(r.totalFees).toBe(3.53));
  it("payout is $21.47", () => expect(r.payout).toBe(21.47));
});

// ── New plan (10%) — micropayment — $2 pledge ─────────────────────────────────
// Revenue       = $2.00
// Platform fee  = $2 × 10%          = $0.20
// Processing    = $2 × 5% + $0.10   = $0.10 + $0.10 = $0.20
// Total fees    = $0.20 + $0.20     = $0.40
// Payout        = $2.00 − $0.40     = $1.60

describe("new plan — $2 pledge — micropayment processing (≤ $3)", () => {
  const r = computeMarketplaceFee({ ...NEW_PLAN, ...MICRO_PROCESSING, itemPrice: 2 });

  it("platform fee is $0.20 (10%)", () => expect(r.sellingFee).toBe(0.2));
  it("processing fee is $0.20 (5% + $0.10)", () => expect(r.processingFee).toBe(0.2));
  it("total fees is $0.40", () => expect(r.totalFees).toBe(0.4));
  it("payout is $1.60", () => expect(r.payout).toBe(1.6));
});

// ── Legacy Lite (5%) — standard processing — $10 pledge ──────────────────────
// Revenue       = $10.00
// Platform fee  = $10 × 5%           = $0.50
// Processing    = $10 × 2.9% + $0.30 = $0.29 + $0.30 = $0.59
// Total fees    = $0.50 + $0.59      = $1.09
// Payout        = $10.00 − $1.09     = $8.91

describe("legacy Lite (5%) — $10 pledge — standard processing", () => {
  const r = computeMarketplaceFee({ ...LITE, ...STD_PROCESSING, itemPrice: 10 });

  it("platform fee is $0.50 (5%)", () => expect(r.sellingFee).toBe(0.5));
  it("processing fee is $0.59", () => expect(r.processingFee).toBe(0.59));
  it("total fees is $1.09", () => expect(r.totalFees).toBe(1.09));
  it("payout is $8.91", () => expect(r.payout).toBe(8.91));
});

// ── Legacy Pro (8%) — standard processing — $10 pledge ───────────────────────
// Revenue       = $10.00
// Platform fee  = $10 × 8%           = $0.80
// Processing    = $10 × 2.9% + $0.30 = $0.29 + $0.30 = $0.59
// Total fees    = $0.80 + $0.59      = $1.39
// Payout        = $10.00 − $1.39     = $8.61

describe("legacy Pro (8%) — $10 pledge — standard processing", () => {
  const r = computeMarketplaceFee({ ...PRO, ...STD_PROCESSING, itemPrice: 10 });

  it("platform fee is $0.80 (8%)", () => expect(r.sellingFee).toBe(0.8));
  it("processing fee is $0.59", () => expect(r.processingFee).toBe(0.59));
  it("total fees is $1.39", () => expect(r.totalFees).toBe(1.39));
  it("payout is $8.61", () => expect(r.payout).toBe(8.61));
});

// ── Legacy Premium (12%) — standard processing — $10 pledge ──────────────────
// Revenue       = $10.00
// Platform fee  = $10 × 12%          = $1.20
// Processing    = $10 × 2.9% + $0.30 = $0.29 + $0.30 = $0.59
// Total fees    = $1.20 + $0.59      = $1.79
// Payout        = $10.00 − $1.79     = $8.21

describe("legacy Premium (12%) — $10 pledge — standard processing", () => {
  const r = computeMarketplaceFee({ ...PREMIUM, ...STD_PROCESSING, itemPrice: 10 });

  it("platform fee is $1.20 (12%)", () => expect(r.sellingFee).toBe(1.2));
  it("processing fee is $0.59", () => expect(r.processingFee).toBe(0.59));
  it("total fees is $1.79", () => expect(r.totalFees).toBe(1.79));
  it("payout is $8.21", () => expect(r.payout).toBe(8.21));
});

// ── Total monthly framing — new plan — 50 patrons at $5 ──────────────────────
// Per patron payout = $4.05 (from the $5 / new plan / standard processing case above)
// Total payout       = $4.05 × 50 = $202.50

describe("new plan — 50 patrons at $5 — total monthly payout", () => {
  it("50 × $4.05 per-patron payout = $202.50", () => {
    const r = computeMarketplaceFee({ ...NEW_PLAN, ...STD_PROCESSING, itemPrice: 5 });
    const total = +(r.payout * 50).toFixed(2);
    expect(total).toBe(202.5);
  });
});

// ── Micropayment rate is cheaper in fixed fee for small pledges ───────────────
describe("micropayment vs standard — $1 pledge: micropayment has lower processing fee", () => {
  it("$1 micropayment processing fee < $1 standard processing fee", () => {
    const micro = computeMarketplaceFee({ ...NEW_PLAN, ...MICRO_PROCESSING, itemPrice: 1 });
    const std   = computeMarketplaceFee({ ...NEW_PLAN, ...STD_PROCESSING,   itemPrice: 1 });
    // Micro: 1 × 5% + $0.10 = $0.05 + $0.10 = $0.15
    // Std:   1 × 2.9% + $0.30 = $0.03 + $0.30 = $0.33
    expect(micro.processingFee).toBeLessThan(std.processingFee);
    expect(micro.processingFee).toBe(0.15);
    expect(std.processingFee).toBe(0.33);
  });
});
