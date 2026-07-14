/**
 * Podia fee calculator tests (TDD).
 *
 * Fee model (verified 2026-06-15 from podia.com/pricing + help.podia.com):
 *
 * Podia reuses computeMarketplaceFee — platform transaction fee varies by plan,
 * Stripe payment processing (2.9% + $0.30) is always separate on all plans.
 *
 * PLANS:
 *   Mover:       $39/mo (or $33/mo annual) — 5% transaction fee per sale
 *   Shaker:      $89/mo (or $75/mo annual) — 0% transaction fee
 *   Earthquaker: $179/mo (or $150/mo annual) — 0% transaction fee
 *
 * PER-SALE MATH:
 *   total fees = (sellingPercent% × price) + (2.9% × price + $0.30)
 *   payout     = price − total fees
 *
 * Sources:
 *   https://podia.com/pricing
 *   https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees
 *   https://help.podia.com/en/articles/11370888-podia-plans-pricing-faqs
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Plan constants (mirrors podiaFees in fees.ts) ─────────────────────────────

const STD_PROCESSING   = { processingPercent: 2.9, processingFixed: 0.30 } as const;
const MOVER            = { sellingPercent: 5, feeOnShipping: false } as const;
const SHAKER           = { sellingPercent: 0, feeOnShipping: false } as const;
const EARTHQUAKER      = { sellingPercent: 0, feeOnShipping: false } as const;

// ── Zero input ────────────────────────────────────────────────────────────────

describe("zero input returns zeros for all plans", () => {
  it("Mover — $0 sale price", () => {
    const r = computeMarketplaceFee({ ...MOVER, ...STD_PROCESSING, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });

  it("Shaker — $0 sale price", () => {
    const r = computeMarketplaceFee({ ...SHAKER, ...STD_PROCESSING, itemPrice: 0 });
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── Mover plan (5% transaction fee) ──────────────────────────────────────────

// $100 sale on Mover:
//   Transaction fee: 5% × $100           = $5.00
//   Processing:      2.9% × $100 + $0.30 = $2.90 + $0.30 = $3.20
//   Total fees:      $5.00 + $3.20        = $8.20
//   Payout:          $100 − $8.20         = $91.80

describe("Mover (5%) — $100 sale price", () => {
  const r = computeMarketplaceFee({ ...MOVER, ...STD_PROCESSING, itemPrice: 100 });

  it("transaction fee is $5.00", () => expect(r.sellingFee).toBe(5.00));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.20));
  it("total fees is $8.20", () => expect(r.totalFees).toBe(8.20));
  it("payout is $91.80", () => expect(r.payout).toBe(91.80));
  it("take rate is 8.2%", () => expect(r.takeRatePercent).toBe(8.20));
});

// $49 sale on Mover:
//   Transaction fee: 5% × $49            = $2.45
//   Processing:      2.9% × $49 + $0.30  = $1.421 + $0.30 = $1.721 → $1.72
//   Total fees:      $2.45 + $1.72        = $4.17
//   Payout:          $49 − $4.17          = $44.83

describe("Mover (5%) — $49 sale price", () => {
  const r = computeMarketplaceFee({ ...MOVER, ...STD_PROCESSING, itemPrice: 49 });

  it("transaction fee is $2.45", () => expect(r.sellingFee).toBe(2.45));
  it("processing fee is $1.72", () => expect(r.processingFee).toBe(1.72));
  it("total fees is $4.17", () => expect(r.totalFees).toBe(4.17));
  it("payout is $44.83", () => expect(r.payout).toBe(44.83));
});

// ── Shaker plan (0% transaction fee) ─────────────────────────────────────────

// $100 sale on Shaker:
//   Transaction fee: 0% × $100           = $0.00
//   Processing:      2.9% × $100 + $0.30 = $3.20
//   Total fees:      $0 + $3.20           = $3.20
//   Payout:          $100 − $3.20         = $96.80

describe("Shaker (0%) — $100 sale price", () => {
  const r = computeMarketplaceFee({ ...SHAKER, ...STD_PROCESSING, itemPrice: 100 });

  it("transaction fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.20));
  it("total fees is $3.20", () => expect(r.totalFees).toBe(3.20));
  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
});

// $197 sale on Shaker:
//   Transaction fee: 0
//   Processing:      2.9% × $197 + $0.30 = $5.713 + $0.30 = $6.013 → $6.01
//   Total fees:      $6.01
//   Payout:          $197 − $6.01 = $190.99

describe("Shaker (0%) — $197 sale price", () => {
  const r = computeMarketplaceFee({ ...SHAKER, ...STD_PROCESSING, itemPrice: 197 });

  it("transaction fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $6.01", () => expect(r.processingFee).toBe(6.01));
  it("total fees is $6.01", () => expect(r.totalFees).toBe(6.01));
  it("payout is $190.99", () => expect(r.payout).toBe(190.99));
});

// Earthquaker is identical to Shaker on per-sale fee math
describe("Earthquaker (0%) — $100 sale price — same as Shaker", () => {
  const r = computeMarketplaceFee({ ...EARTHQUAKER, ...STD_PROCESSING, itemPrice: 100 });

  it("transaction fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("total fees is $3.20", () => expect(r.totalFees).toBe(3.20));
  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
});

// ── Mover vs Shaker fee difference on $100 sale ───────────────────────────────
// Shaker payout: $96.80  vs  Mover payout: $91.80 → Shaker keeps $5.00 more per sale

describe("Mover vs Shaker fee difference on $100 sale", () => {
  it("Shaker payout is $5.00 more than Mover on a $100 sale", () => {
    const mover  = computeMarketplaceFee({ ...MOVER,  ...STD_PROCESSING, itemPrice: 100 });
    const shaker = computeMarketplaceFee({ ...SHAKER, ...STD_PROCESSING, itemPrice: 100 });
    const diff = +(shaker.payout - mover.payout).toFixed(2);
    expect(diff).toBe(5.00);
  });
});

// ── With item cost — profit calculation ───────────────────────────────────────

// $200 sale on Mover, $30 creation cost:
//   Transaction fee: 5% × $200           = $10.00
//   Processing:      2.9% × $200 + $0.30 = $5.80 + $0.30 = $6.10
//   Total fees:      $10.00 + $6.10       = $16.10
//   Payout:          $200 − $16.10        = $183.90
//   Profit:          $183.90 − $30        = $153.90

describe("Mover (5%) — $200 sale, $30 cost — profit", () => {
  const r = computeMarketplaceFee({ ...MOVER, ...STD_PROCESSING, itemPrice: 200, itemCost: 30 });

  it("payout is $183.90", () => expect(r.payout).toBe(183.90));
  it("profit is $153.90", () => expect(r.profit).toBe(153.90));
});
