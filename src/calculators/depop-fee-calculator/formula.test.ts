/**
 * Depop fee calculator tests.
 *
 * Depop has TWO distinct fee regimes based on seller location:
 *
 * US sellers (USD sales, US-located):
 *   SELLER: 0% selling fee (removed July 15, 2024).
 *           Payment processing: 3.3% + $0.45 on the total transaction.
 *   BUYER:  Marketplace fee up to 5% of item price + up to $1 fixed
 *           (informational — does NOT reduce seller payout).
 *
 * UK sellers (GBP sales, UK-located):
 *   SELLER: 0% selling fee (removed March 20, 2024 for new listings).
 *           Payment processing: 2.9% + £0.30 on the total transaction.
 *   BUYER:  Marketplace fee up to 5% of item price + up to £1 fixed
 *           (informational — does NOT reduce seller payout).
 *
 * Rest-of-world (international) sellers:
 *   SELLER: 10% flat selling fee on item price.
 *           Payment processing via PayPal (varies — not modelled here).
 *   BUYER:  No documented separate buyer marketplace fee.
 *
 * KEY FACTS TO CONFIRM — every test deliberately asserts these facts:
 *   1. US and UK sellers pay NO selling fee (sellingPercent = 0).
 *   2. ROW sellers pay 10% selling fee.
 *   3. US/UK sellers DO pay payment-processing fees.
 *   4. Buyer marketplace fee is informational and does NOT reduce payout.
 *
 * Sources:
 *   https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/
 *   https://news.depop.com/company-news/evolving-our-fee-structure-with-zero-selling-fees-on-depop/
 *   https://depophelp.zendesk.com/hc/en-gb/articles/360001791127-Seller-fees-and-charges
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── US seller params ──────────────────────────────────────────────────────────
// 0% selling fee, 3.3% + $0.45 processing fee.
const US_PARAMS = {
  sellingPercent: 0,
  feeOnShipping: true,
  processingPercent: 3.3,
  processingFixed: 0.45,
} as const;

// ── UK seller params ──────────────────────────────────────────────────────────
// 0% selling fee, 2.9% + £0.30 processing fee.
const GB_PARAMS = {
  sellingPercent: 0,
  feeOnShipping: true,
  processingPercent: 2.9,
  processingFixed: 0.3,
} as const;

// ── ROW seller params ─────────────────────────────────────────────────────────
// 10% selling fee on item price. PayPal processing varies — not modelled.
const ROW_PARAMS = {
  sellingPercent: 10,
  feeOnShipping: false, // ROW: fee on item price only (not on buyer-paid shipping)
  processingPercent: 0,
  processingFixed: 0,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// US SELLER TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("Depop US seller — zero input returns zeros", () => {
  it("zero item price returns zero payout", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// US: $50 item, no shipping
//   Revenue         = $50.00
//   Selling fee     = $50 × 0% = $0.00  ← US sellers pay NO selling fee
//   Processing fee  = $50 × 3.3% + $0.45 = $1.65 + $0.45 = $2.10
//   Total fees      = $2.10
//   Payout          = $47.90
describe("Depop US seller — $50 item, no shipping (common listing)", () => {
  const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 50 });

  it("revenue is $50.00", () => expect(r.revenue).toBe(50));
  it("selling fee is $0.00 — US sellers pay NO selling fee", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $2.10 (3.3% + $0.45)", () => expect(r.processingFee).toBe(2.1));
  it("total fees is $2.10", () => expect(r.totalFees).toBe(2.1));
  it("payout is $47.90", () => expect(r.payout).toBe(47.9));
});

// US: $100 item, no shipping
//   Revenue         = $100.00
//   Selling fee     = $0.00
//   Processing fee  = $100 × 3.3% + $0.45 = $3.30 + $0.45 = $3.75
//   Total fees      = $3.75
//   Payout          = $96.25
describe("Depop US seller — $100 item, no shipping", () => {
  const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100 });

  it("revenue is $100.00", () => expect(r.revenue).toBe(100));
  it("selling fee is $0 — US sellers pay NO selling fee", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $3.75 (3.3% × $100 + $0.45)", () => expect(r.processingFee).toBe(3.75));
  it("total fees is $3.75", () => expect(r.totalFees).toBe(3.75));
  it("payout is $96.25", () => expect(r.payout).toBe(96.25));
});

// US: $100 item + $10 shipping — processing applies to both
//   Revenue         = $110.00
//   Selling fee     = $0.00
//   Processing fee  = $110 × 3.3% + $0.45 = $3.63 + $0.45 = $4.08
//   Total fees      = $4.08
//   Payout          = $105.92
describe("Depop US seller — $100 item + $10 shipping", () => {
  const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, shipping: 10 });

  it("revenue is $110.00", () => expect(r.revenue).toBe(110));
  it("selling fee is $0", () => expect(r.sellingFee).toBe(0));
  it("processing fee is $4.08 (3.3% × $110 + $0.45)", () => expect(r.processingFee).toBe(4.08));
  it("payout is $105.92", () => expect(r.payout).toBe(105.92));
});

// US: profit with item cost
//   $100 sale → payout $96.25 → minus $60 cost → profit $36.25
describe("Depop US seller — profit with item cost", () => {
  it("profit = payout - item cost", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, itemCost: 60 });
    expect(r.payout).toBe(96.25);
    expect(r.profit).toBe(36.25);
  });
});

// CONFIRMATION TEST: US sellers do NOT pay old 10% selling fee
describe("Depop US seller — confirms zero selling fee (NOT the old 10%)", () => {
  it("$100 sale: selling fee is $0, not $10", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBe(0);
  });
});

// US buyer marketplace fee — informational, does NOT reduce seller payout
//   Buyer fee = 5% of $100 + $1 cap = $5.00 + $1.00 = $6.00 (max)
//   (In practice Depop says "up to 5% + up to $1" — we display the max)
describe("Depop US buyer marketplace fee — informational (does NOT reduce seller payout)", () => {
  it("buyer fee on $50 = 5% × $50 + $1 = $3.50 (max)", () => {
    const buyerFee = Math.round((50 * 0.05 + 1) * 100) / 100;
    expect(buyerFee).toBe(3.5);
  });

  it("buyer fee on $100 = 5% × $100 + $1 = $6.00 (max)", () => {
    const buyerFee = Math.round((100 * 0.05 + 1) * 100) / 100;
    expect(buyerFee).toBe(6);
  });

  it("buyer total on $100 = $100 + $6.00 = $106.00", () => {
    const itemPrice = 100;
    const buyerFee = Math.round((itemPrice * 0.05 + 1) * 100) / 100;
    expect(Math.round((itemPrice + buyerFee) * 100) / 100).toBe(106);
  });

  it("seller payout on $100 is still $96.25 (buyer fee does NOT reduce payout)", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100 });
    expect(r.payout).toBe(96.25);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UK SELLER TESTS
// ─────────────────────────────────────────────────────────────────────────────

// UK: £50 item, no shipping
//   Revenue         = £50.00
//   Selling fee     = £0.00  ← UK sellers pay NO selling fee
//   Processing fee  = £50 × 2.9% + £0.30 = £1.45 + £0.30 = £1.75
//   Total fees      = £1.75
//   Payout          = £48.25
describe("Depop UK seller — £50 item, no shipping", () => {
  const r = computeMarketplaceFee({ ...GB_PARAMS, itemPrice: 50 });

  it("revenue is £50.00", () => expect(r.revenue).toBe(50));
  it("selling fee is £0.00 — UK sellers pay NO selling fee", () => expect(r.sellingFee).toBe(0));
  it("processing fee is £1.75 (2.9% + £0.30)", () => expect(r.processingFee).toBe(1.75));
  it("total fees is £1.75", () => expect(r.totalFees).toBe(1.75));
  it("payout is £48.25", () => expect(r.payout).toBe(48.25));
});

// UK: £100 item, no shipping
//   Revenue         = £100.00
//   Selling fee     = £0.00
//   Processing fee  = £100 × 2.9% + £0.30 = £2.90 + £0.30 = £3.20
//   Total fees      = £3.20
//   Payout          = £96.80
describe("Depop UK seller — £100 item, no shipping", () => {
  const r = computeMarketplaceFee({ ...GB_PARAMS, itemPrice: 100 });

  it("revenue is £100.00", () => expect(r.revenue).toBe(100));
  it("selling fee is £0 — UK sellers pay NO selling fee", () => expect(r.sellingFee).toBe(0));
  it("processing fee is £3.20 (2.9% × £100 + £0.30)", () => expect(r.processingFee).toBe(3.2));
  it("total fees is £3.20", () => expect(r.totalFees).toBe(3.2));
  it("payout is £96.80", () => expect(r.payout).toBe(96.8));
});

// CONFIRMATION: UK sellers do NOT pay 10% selling fee
describe("Depop UK seller — confirms zero selling fee (NOT the old 10%)", () => {
  it("£100 sale: selling fee is £0, not £10", () => {
    const r = computeMarketplaceFee({ ...GB_PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REST-OF-WORLD SELLER TESTS
// ─────────────────────────────────────────────────────────────────────────────

// ROW: $100 item
//   Revenue         = $100.00
//   Selling fee     = $100 × 10% = $10.00  ← ROW sellers still pay 10%
//   Processing fee  = $0.00  (PayPal — not modelled)
//   Total fees      = $10.00
//   Payout          = $90.00
describe("Depop ROW seller — $100 item (10% selling fee still applies)", () => {
  const r = computeMarketplaceFee({ ...ROW_PARAMS, itemPrice: 100 });

  it("revenue is $100.00", () => expect(r.revenue).toBe(100));
  it("selling fee is $10.00 (10%) — ROW sellers still pay this fee", () => expect(r.sellingFee).toBe(10));
  it("payout is $90.00", () => expect(r.payout).toBe(90));
  it("take rate is 10%", () => expect(r.takeRatePercent).toBe(10));
});

// ROW: $50 item
//   Revenue = $50 → 10% = $5 → payout $45
describe("Depop ROW seller — $50 item", () => {
  const r = computeMarketplaceFee({ ...ROW_PARAMS, itemPrice: 50 });

  it("selling fee is $5.00 (10%)", () => expect(r.sellingFee).toBe(5));
  it("payout is $45.00", () => expect(r.payout).toBe(45));
});

// ROW: profit with item cost
describe("Depop ROW seller — profit with item cost", () => {
  it("$100 sale, $60 cost → payout $90 → profit $30", () => {
    const r = computeMarketplaceFee({ ...ROW_PARAMS, itemPrice: 100, itemCost: 60 });
    expect(r.payout).toBe(90);
    expect(r.profit).toBe(30);
  });
});

// ROW: fee applies to item price only (not shipping — no Depop-label shipping)
describe("Depop ROW seller — 10% fee on item price only (not shipping)", () => {
  it("$100 item + $10 shipping: fee is $10 on item only, payout $100.00", () => {
    const r = computeMarketplaceFee({ ...ROW_PARAMS, itemPrice: 100, shipping: 10 });
    // Revenue = $110, feeOnShipping=false → fee base = $100 → fee = $10
    expect(r.sellingFee).toBe(10);
    expect(r.payout).toBe(100); // revenue $110 - fee $10
  });
});
