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

/* ===========================================================================
   Ko-fi tier + processor behaviour, driven through config.compute()
   ---------------------------------------------------------------------------
   These drive the real config rather than mirrored constants, because the bug
   we are guarding against lives in the tier-selection logic, not the shared
   engine.

   Verified 2026-08-08 against Ko-fi's own help pages (primary source):
     Contributor status (DEFAULT)    5% on tips too (shop stays 5%). "Everyone who
                                     joins Ko-fi now starts with Contributor status";
                                     opt out in Settings > Payment.
                                     help.ko-fi.com/.../25143210488477-Contributor-status
     Contributor off                 0% on tips; 5% on memberships/shop/commissions
     Gold ($12/mo)                   0% on everything
   "Contributor" IS Ko-fi's own term (an earlier note here wrongly said it wasn't).
   =========================================================================== */

import { kofiFeeCalculator } from "./config";

const ctx = {
  country: "US",
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatPercent: (v: number) => `${v}%`,
  formatNumber: (v: number) => String(v),
};

/** Net payout for a set of input values. */
const net = (values: Record<string, unknown>) => {
  const r = kofiFeeCalculator.compute(
    { amount: 25, plan: "free", incomeType: "tips", processing: true, itemCost: 0, processor: "stripe", ...values },
    ctx as never,
  );
  return Number(r.rows.find((x) => x.kind === "net")!.display.replace(/[^0-9.]/g, ""));
};

describe("Ko-fi plan tiers", () => {
  it("charges 5% on tips under Contributor status — the default a new account is on", () => {
    // The whole point: everyone repeats "Ko-fi is 0% on tips", but new accounts
    // start with Contributor status ON, which takes 5% of tips too. You must opt out.
    expect(net({ plan: "contributor", amount: 100 })).toBeCloseTo(net({ plan: "free", amount: 100 }) - 5, 2);
  });

  it("keeps tips at 0% with Contributor turned off", () => {
    const gross = 100;
    // 0% platform + Stripe 2.9% + $0.30
    expect(net({ plan: "free", amount: gross })).toBeCloseTo(gross - (gross * 0.029 + 0.3), 2);
  });

  it("charges 0% on every income type on Gold", () => {
    expect(net({ plan: "gold", incomeType: "shop", amount: 100 })).toBeCloseTo(
      net({ plan: "gold", incomeType: "tips", amount: 100 }),
      2,
    );
  });
});

describe("Ko-fi payment processor choice", () => {
  // Ko-fi pays into YOUR OWN Stripe or PayPal account, so the processor fee is
  // the creator's choice — and on small tips the difference is material.
  it("PayPal micropayments beats Stripe on a small tip", () => {
    expect(net({ processor: "paypal-micro", amount: 3 })).toBeGreaterThan(net({ processor: "stripe", amount: 3 }));
  });

  it("Stripe beats PayPal micropayments on a large payment", () => {
    expect(net({ processor: "stripe", amount: 100 })).toBeGreaterThan(net({ processor: "paypal-micro", amount: 100 }));
  });

  it("crosses over near $10 (0.0499x + 0.09 = 0.029x + 0.30)", () => {
    expect(net({ processor: "paypal-micro", amount: 9 })).toBeGreaterThan(net({ processor: "stripe", amount: 9 }));
    expect(net({ processor: "stripe", amount: 12 })).toBeGreaterThan(net({ processor: "paypal-micro", amount: 12 }));
  });
});
