/**
 * Fiverr fee calculator tests.
 *
 * Fiverr reuses computeMarketplaceFee for the seller-side calculation.
 * Buyer-side totals are computed separately in config.ts (informational only).
 *
 * Verified rates (2026-06-15):
 *   Seller commission: 20% flat on every completed order (including tips)
 *   Buyer service fee: 5.5% on all orders
 *   Buyer small order fee: $3 on orders under $100 USD
 *   Sources:
 *     https://help.fiverr.com/hc/en-us/articles/360011028477 (seller)
 *     https://help.fiverr.com/hc/en-us/articles/360010359797 (buyer)
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

/** Fiverr seller config: 20% commission, no separate processing fee. */
const FIVERR_SELLER = {
  sellingPercent: 20,
  feeOnShipping: false,
} as const;

// ---------------------------------------------------------------------------
// Helper: compute buyer-side total (informational, mirrors config.ts logic)
// ---------------------------------------------------------------------------
function buyerTotal(orderAmount: number): {
  buyerServiceFee: number;
  smallOrderFee: number;
  buyerTotal: number;
} {
  const BUYER_SERVICE_PERCENT = 5.5;
  const SMALL_ORDER_FEE = 3;
  const SMALL_ORDER_THRESHOLD = 100;

  const buyerServiceFee = Math.round(orderAmount * (BUYER_SERVICE_PERCENT / 100) * 100) / 100;
  const smallOrderFee = orderAmount < SMALL_ORDER_THRESHOLD ? SMALL_ORDER_FEE : 0;
  const total = +(orderAmount + buyerServiceFee + smallOrderFee).toFixed(2);
  return { buyerServiceFee, smallOrderFee, buyerTotal: total };
}

// ---------------------------------------------------------------------------
// Zero / empty input
// ---------------------------------------------------------------------------
describe("zero input returns zeros", () => {
  it("zero order amount", () => {
    const r = computeMarketplaceFee({ ...FIVERR_SELLER, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Seller: worked example — $100 order
//   Revenue       = $100.00
//   Selling fee   = $100 × 20% = $20.00
//   Processing    = $0.00 (Fiverr has no separate processing fee)
//   Total fees    = $20.00
//   Payout        = $80.00
// ---------------------------------------------------------------------------
describe("seller — $100 order", () => {
  const r = computeMarketplaceFee({ ...FIVERR_SELLER, itemPrice: 100 });

  it("revenue is $100.00", () => expect(r.revenue).toBe(100));
  it("selling fee is $20.00 (20%)", () => expect(r.sellingFee).toBe(20));
  it("processing fee is $0.00", () => expect(r.processingFee).toBe(0));
  it("total fees is $20.00", () => expect(r.totalFees).toBe(20));
  it("payout is $80.00", () => expect(r.payout).toBe(80));
  it("take rate is 20%", () => expect(r.takeRatePercent).toBe(20));
});

// ---------------------------------------------------------------------------
// Seller: $50 order
//   Revenue       = $50.00
//   Selling fee   = $50 × 20% = $10.00
//   Payout        = $40.00
// ---------------------------------------------------------------------------
describe("seller — $50 order", () => {
  const r = computeMarketplaceFee({ ...FIVERR_SELLER, itemPrice: 50 });

  it("selling fee is $10.00 (20%)", () => expect(r.sellingFee).toBe(10));
  it("payout is $40.00", () => expect(r.payout).toBe(40));
});

// ---------------------------------------------------------------------------
// Seller: profit with item cost
//   $100 order, seller cost $60 → profit = $80 - $60 = $20
// ---------------------------------------------------------------------------
describe("seller profit with item cost", () => {
  it("profit = payout - item cost", () => {
    const r = computeMarketplaceFee({ ...FIVERR_SELLER, itemPrice: 100, itemCost: 60 });
    expect(r.payout).toBe(80);
    expect(r.profit).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Seller: $5 order (very small gig)
//   Revenue       = $5.00
//   Selling fee   = $5 × 20% = $1.00
//   Payout        = $4.00
// ---------------------------------------------------------------------------
describe("seller — $5 order", () => {
  const r = computeMarketplaceFee({ ...FIVERR_SELLER, itemPrice: 5 });

  it("selling fee is $1.00", () => expect(r.sellingFee).toBe(1));
  it("payout is $4.00", () => expect(r.payout).toBe(4));
});

// ---------------------------------------------------------------------------
// Buyer: $100 order — no small order fee (at or above threshold)
//   Buyer service fee = $100 × 5.5% = $5.50
//   Small order fee   = $0 (order is exactly $100, NOT under threshold)
//   Buyer total       = $105.50
// ---------------------------------------------------------------------------
describe("buyer — $100 order (at threshold, no small order fee)", () => {
  const result = buyerTotal(100);

  it("buyer service fee is $5.50", () => expect(result.buyerServiceFee).toBe(5.50));
  it("small order fee is $0", () => expect(result.smallOrderFee).toBe(0));
  it("buyer total is $105.50", () => expect(result.buyerTotal).toBe(105.50));
});

// ---------------------------------------------------------------------------
// Buyer: $50 order — small order fee applies (under $100 threshold)
//   Buyer service fee = $50 × 5.5% = $2.75
//   Small order fee   = $3
//   Buyer total       = $55.75
// ---------------------------------------------------------------------------
describe("buyer — $50 order (under threshold, small order fee applies)", () => {
  const result = buyerTotal(50);

  it("buyer service fee is $2.75", () => expect(result.buyerServiceFee).toBe(2.75));
  it("small order fee is $3.00", () => expect(result.smallOrderFee).toBe(3));
  it("buyer total is $55.75", () => expect(result.buyerTotal).toBe(55.75));
});

// ---------------------------------------------------------------------------
// Buyer: $99.99 order — just under threshold, small order fee applies
//   Buyer service fee = $99.99 × 5.5% = $5.4995 → rounds to $5.50
//   Small order fee   = $3
//   Buyer total       = $99.99 + $5.50 + $3 = $108.49
// ---------------------------------------------------------------------------
describe("buyer — $99.99 order (just under threshold)", () => {
  const result = buyerTotal(99.99);

  it("buyer service fee is $5.50", () => expect(result.buyerServiceFee).toBe(5.50));
  it("small order fee is $3.00", () => expect(result.smallOrderFee).toBe(3));
  it("buyer total is $108.49", () => expect(result.buyerTotal).toBe(108.49));
});

// ---------------------------------------------------------------------------
// Buyer: $200 order — no small order fee
//   Buyer service fee = $200 × 5.5% = $11.00
//   Small order fee   = $0
//   Buyer total       = $211.00
// ---------------------------------------------------------------------------
describe("buyer — $200 order (above threshold, no small order fee)", () => {
  const result = buyerTotal(200);

  it("buyer service fee is $11.00", () => expect(result.buyerServiceFee).toBe(11));
  it("small order fee is $0", () => expect(result.smallOrderFee).toBe(0));
  it("buyer total is $211.00", () => expect(result.buyerTotal).toBe(211));
});
