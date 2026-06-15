/**
 * Kajabi fee calculator tests (TDD).
 *
 * Fee model (verified 2026-06-15 from kajabi.com/pricing + help.kajabi.com):
 *
 * Kajabi charges ZERO platform transaction fees on ALL plans.
 * Payment processing is via Kajabi Payments (built on Stripe), with rates
 * that vary slightly by plan tier.
 *
 * PLANS (monthly billing; ~20% discount on annual billing):
 *   Starter: $89/mo  — Kajabi Payments: 2.9% + $0.30 (US cards)
 *   Basic:   $179/mo — Kajabi Payments: 2.9% + $0.30 (US cards)
 *   Growth:  $249/mo — Kajabi Payments: 2.8% + $0.30 (US cards)
 *   Pro:     $499/mo — Kajabi Payments: 2.7% + $0.30 (US cards)
 *
 * Note: sellingPercent = 0 for all Kajabi plans (no platform transaction fee).
 * The only per-sale fee is Kajabi Payments processing (modelled as processingFee).
 *
 * Third-party processor surcharge (NOT modelled in per-sale calc — informational only):
 *   If using Stripe/PayPal directly instead of Kajabi Payments:
 *   Starter +5%, Basic +2%, Growth +1%, Pro +0.5%.
 *
 * Sources:
 *   https://kajabi.com/pricing
 *   https://help.kajabi.com/hc/en-us/articles/23370972909851-Kajabi-Payments-Fees-United-States
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Plan constants (mirrors kajabiFees in fees.ts) ────────────────────────────
// All plans: sellingPercent = 0 (no platform fee). Only processing varies.

const NO_PLATFORM_FEE = { sellingPercent: 0, feeOnShipping: false } as const;

const STARTER_PROCESSING = { processingPercent: 2.9, processingFixed: 0.30 } as const;
const BASIC_PROCESSING   = { processingPercent: 2.9, processingFixed: 0.30 } as const;
const GROWTH_PROCESSING  = { processingPercent: 2.8, processingFixed: 0.30 } as const;
const PRO_PROCESSING     = { processingPercent: 2.7, processingFixed: 0.30 } as const;

// ── Zero input ────────────────────────────────────────────────────────────────

describe("zero input returns zeros for all plans", () => {
  it("Starter — $0 sale price", () => {
    const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...STARTER_PROCESSING, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });

  it("Pro — $0 sale price", () => {
    const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...PRO_PROCESSING, itemPrice: 0 });
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── Starter plan (2.9% + $0.30) ──────────────────────────────────────────────

// $100 sale on Starter:
//   Platform fee:  0%                      = $0.00
//   Processing:    2.9% × $100 + $0.30     = $2.90 + $0.30 = $3.20
//   Total fees:    $0 + $3.20              = $3.20
//   Payout:        $100 − $3.20            = $96.80

describe("Starter (0% + 2.9% + $0.30) — $100 sale", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...STARTER_PROCESSING, itemPrice: 100 });

  it("platform fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.20));
  it("total fees is $3.20", () => expect(r.totalFees).toBe(3.20));
  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
  it("take rate is 3.2%", () => expect(r.takeRatePercent).toBe(3.2));
});

// $197 sale on Starter:
//   Processing:    2.9% × $197 + $0.30 = $5.713 + $0.30 = $6.013 → $6.01
//   Payout:        $197 − $6.01 = $190.99

describe("Starter (0% + 2.9% + $0.30) — $197 sale", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...STARTER_PROCESSING, itemPrice: 197 });

  it("platform fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $6.01", () => expect(r.processingFee).toBe(6.01));
  it("total fees is $6.01", () => expect(r.totalFees).toBe(6.01));
  it("payout is $190.99", () => expect(r.payout).toBe(190.99));
});

// ── Basic plan (2.9% + $0.30 — same as Starter) ──────────────────────────────

describe("Basic (0% + 2.9% + $0.30) — $100 sale — same as Starter", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...BASIC_PROCESSING, itemPrice: 100 });

  it("platform fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.20));
  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
});

// ── Growth plan (2.8% + $0.30) ───────────────────────────────────────────────

// $100 sale on Growth:
//   Processing:    2.8% × $100 + $0.30 = $2.80 + $0.30 = $3.10
//   Payout:        $100 − $3.10 = $96.90

describe("Growth (0% + 2.8% + $0.30) — $100 sale", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...GROWTH_PROCESSING, itemPrice: 100 });

  it("platform fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.10", () => expect(r.processingFee).toBe(3.10));
  it("total fees is $3.10", () => expect(r.totalFees).toBe(3.10));
  it("payout is $96.90", () => expect(r.payout).toBe(96.90));
});

// $197 sale on Growth:
//   Processing:    2.8% × $197 + $0.30 = $5.516 + $0.30 = $5.816 → $5.82
//   Payout:        $197 − $5.82 = $191.18

describe("Growth (0% + 2.8% + $0.30) — $197 sale", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...GROWTH_PROCESSING, itemPrice: 197 });

  it("processing fee is $5.82", () => expect(r.processingFee).toBe(5.82));
  it("payout is $191.18", () => expect(r.payout).toBe(191.18));
});

// ── Pro plan (2.7% + $0.30) ──────────────────────────────────────────────────

// $100 sale on Pro:
//   Processing:    2.7% × $100 + $0.30 = $2.70 + $0.30 = $3.00
//   Payout:        $100 − $3.00 = $97.00

describe("Pro (0% + 2.7% + $0.30) — $100 sale", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...PRO_PROCESSING, itemPrice: 100 });

  it("platform fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.00", () => expect(r.processingFee).toBe(3.00));
  it("total fees is $3.00", () => expect(r.totalFees).toBe(3.00));
  it("payout is $97.00", () => expect(r.payout).toBe(97.00));
});

// $497 course on Pro:
//   Processing:    2.7% × $497 + $0.30 = $13.419 + $0.30 = $13.719 → $13.72
//   Payout:        $497 − $13.72 = $483.28

describe("Pro (0% + 2.7% + $0.30) — $497 course", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...PRO_PROCESSING, itemPrice: 497 });

  it("processing fee is $13.72", () => expect(r.processingFee).toBe(13.72));
  it("payout is $483.28", () => expect(r.payout).toBe(483.28));
});

// ── Kajabi plans never have a platform (selling) fee ─────────────────────────

describe("all Kajabi plans have zero platform fee", () => {
  it("Starter sellingFee is always $0", () => {
    const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...STARTER_PROCESSING, itemPrice: 299 });
    expect(r.sellingFee).toBe(0);
  });
  it("Growth sellingFee is always $0", () => {
    const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...GROWTH_PROCESSING, itemPrice: 299 });
    expect(r.sellingFee).toBe(0);
  });
  it("Pro sellingFee is always $0", () => {
    const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...PRO_PROCESSING, itemPrice: 299 });
    expect(r.sellingFee).toBe(0);
  });
});

// ── With item cost — profit calculation ───────────────────────────────────────

// $100 sale on Starter, $20 cost:
//   Processing:   $3.20
//   Payout:       $96.80
//   Profit:       $96.80 − $20 = $76.80

describe("Starter — $100 sale, $20 cost — profit", () => {
  const r = computeMarketplaceFee({ ...NO_PLATFORM_FEE, ...STARTER_PROCESSING, itemPrice: 100, itemCost: 20 });

  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
  it("profit is $76.80", () => expect(r.profit).toBe(76.80));
});
