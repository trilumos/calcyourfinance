/**
 * Teachable fee calculator tests (TDD).
 *
 * Fee model (verified 2026-06-15 from teachable.com/pricing):
 *
 * Teachable reuses computeMarketplaceFee — platform fee varies by plan,
 * payment processing (Stripe US domestic) is always 2.9% + $0.30 separately.
 *
 * PLANS (all billed monthly; annual billing saves ~25%):
 *   Starter:  $39/mo  — 7.5% transaction fee
 *   Builder:  $89/mo  — 0%   transaction fee
 *   Growth:   $189/mo — 0%   transaction fee
 *   Custom:   contact — 0%   transaction fee
 *
 * PER-SALE MATH:
 *   total fees = (sellingPercent% × price) + (2.9% × price + $0.30)
 *   payout     = price − total fees
 *
 * Sources:
 *   https://teachable.com/pricing
 *   https://support.teachable.com/hc/en-us/articles/  (payment processing info)
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Plan constants (mirrors teachableFees in fees.ts) ─────────────────────────

const STD_PROCESSING = { processingPercent: 2.9, processingFixed: 0.30 } as const;

const STARTER  = { sellingPercent: 7.5, feeOnShipping: false } as const;
const BUILDER  = { sellingPercent: 0,   feeOnShipping: false } as const;
const GROWTH   = { sellingPercent: 0,   feeOnShipping: false } as const;

// ── Zero input ────────────────────────────────────────────────────────────────

describe("zero input returns zeros for all plans", () => {
  it("Starter plan — $0 course price", () => {
    const r = computeMarketplaceFee({ ...STARTER, ...STD_PROCESSING, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });

  it("Builder plan — $0 course price", () => {
    const r = computeMarketplaceFee({ ...BUILDER, ...STD_PROCESSING, itemPrice: 0 });
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ── Starter plan (7.5%) — standard processing ─────────────────────────────────

// $100 course on Starter:
//   Transaction fee: 7.5% × $100          = $7.50
//   Processing:      2.9% × $100 + $0.30  = $2.90 + $0.30 = $3.20
//   Total fees:      $7.50 + $3.20         = $10.70
//   Payout:          $100 − $10.70         = $89.30

describe("Starter (7.5%) — $100 course price", () => {
  const r = computeMarketplaceFee({ ...STARTER, ...STD_PROCESSING, itemPrice: 100 });

  it("transaction fee is $7.50", () => expect(r.sellingFee).toBe(7.50));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.20));
  it("total fees is $10.70", () => expect(r.totalFees).toBe(10.70));
  it("payout is $89.30", () => expect(r.payout).toBe(89.30));
});

// $29 course on Starter (low-priced, fixed fee significant):
//   Transaction fee: 7.5% × $29          = $2.175 → rounds to $2.17 (float precision)
//   Processing:      2.9% × $29 + $0.30  = $0.841 + $0.30 = $1.141 → $1.14
//   Total fees:      $2.17 + $1.14        = $3.31
//   Payout:          $29.00 − $3.31       = $25.69

describe("Starter (7.5%) — $29 course price", () => {
  const r = computeMarketplaceFee({ ...STARTER, ...STD_PROCESSING, itemPrice: 29 });

  it("transaction fee is $2.17", () => expect(r.sellingFee).toBe(2.17));
  it("processing fee is $1.14", () => expect(r.processingFee).toBe(1.14));
  it("total fees is $3.31", () => expect(r.totalFees).toBe(3.31));
  it("payout is $25.69", () => expect(r.payout).toBe(25.69));
});

// ── Builder/Growth plan (0% transaction fee) — processing only ────────────────

// $100 course on Builder/Growth:
//   Transaction fee: 0% × $100             = $0.00
//   Processing:      2.9% × $100 + $0.30   = $2.90 + $0.30 = $3.20
//   Total fees:      $0.00 + $3.20          = $3.20
//   Payout:          $100 − $3.20           = $96.80

describe("Builder (0%) — $100 course price", () => {
  const r = computeMarketplaceFee({ ...BUILDER, ...STD_PROCESSING, itemPrice: 100 });

  it("transaction fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.20", () => expect(r.processingFee).toBe(3.20));
  it("total fees is $3.20", () => expect(r.totalFees).toBe(3.20));
  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
});

// $197 course on Builder (higher-priced course):
//   Transaction fee: 0% × $197            = $0.00
//   Processing:      2.9% × $197 + $0.30  = $5.713 + $0.30 = $6.013 → $6.01
//   Total fees:      $0 + $6.01            = $6.01
//   Payout:          $197 − $6.01          = $190.99

describe("Builder (0%) — $197 course price", () => {
  const r = computeMarketplaceFee({ ...BUILDER, ...STD_PROCESSING, itemPrice: 197 });

  it("transaction fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $6.01", () => expect(r.processingFee).toBe(6.01));
  it("total fees is $6.01", () => expect(r.totalFees).toBe(6.01));
  it("payout is $190.99", () => expect(r.payout).toBe(190.99));
});

// Growth has identical fee math to Builder (both 0% transaction fee)
describe("Growth (0%) — $100 course price — same as Builder", () => {
  const r = computeMarketplaceFee({ ...GROWTH, ...STD_PROCESSING, itemPrice: 100 });

  it("transaction fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("total fees is $3.20", () => expect(r.totalFees).toBe(3.20));
  it("payout is $96.80", () => expect(r.payout).toBe(96.80));
});

// ── Starter plan savings vs Builder — $100 course ────────────────────────────
// Starter payout: $89.30  vs  Builder payout: $96.80 → Starter loses $7.50 per sale

describe("Starter vs Builder fee difference on $100 course", () => {
  it("Builder payout is $7.50 more than Starter on a $100 course", () => {
    const starter = computeMarketplaceFee({ ...STARTER, ...STD_PROCESSING, itemPrice: 100 });
    const builder = computeMarketplaceFee({ ...BUILDER, ...STD_PROCESSING, itemPrice: 100 });
    const diff = +(builder.payout - starter.payout).toFixed(2);
    expect(diff).toBe(7.50);
  });
});

// ── With item cost — profit calculation ───────────────────────────────────────

// $200 course on Starter, $50 course creation cost:
//   Transaction fee: 7.5% × $200           = $15.00
//   Processing:      2.9% × $200 + $0.30   = $5.80 + $0.30 = $6.10
//   Total fees:      $15.00 + $6.10         = $21.10
//   Payout:          $200 − $21.10          = $178.90
//   Profit:          $178.90 − $50          = $128.90

describe("Starter (7.5%) — $200 course, $50 cost — profit", () => {
  const r = computeMarketplaceFee({ ...STARTER, ...STD_PROCESSING, itemPrice: 200, itemCost: 50 });

  it("payout is $178.90", () => expect(r.payout).toBe(178.90));
  it("profit is $128.90", () => expect(r.profit).toBe(128.90));
});
