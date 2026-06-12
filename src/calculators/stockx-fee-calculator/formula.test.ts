/**
 * StockX fee calculator tests.
 *
 * StockX reuses computeMarketplaceFee directly — these tests validate the
 * platform's specific config values through the shared formula.
 *
 * Verified rates (2026-06-12):
 *   Transaction fee by seller level (quarterly):
 *     Level 1 (new):                           9.0%
 *     Level 2 (≥12 sales or $1,500 revenue):   8.5%
 *     Level 3 (≥40 sales or $5,000 revenue):   8.0%
 *     Level 4 (≥200 sales or $25,000 revenue): 7.5%
 *     Level 5 (≥800 sales or $100,000 revenue):7.0%
 *   Payment processing fee (all levels):       3.0%
 *   Minimum transaction fee (USD):             $5.00
 *
 *   Sources:
 *     https://stockx.com/help/articles/what-are-stockxs-fees-for-sellers
 *     https://stockx.com/help/articles/What-is-the-StockX-Seller-Program-What-are-Seller-Levels
 *     https://stockx.com/news/updates-to-the-stockx-seller-program/
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ---------------------------------------------------------------------------
// Shared config constants per seller level
// ---------------------------------------------------------------------------
const PROCESSING_PERCENT = 3;
const FEE_MIN = 5; // USD — minimum on the transaction fee component

/** Level 1 — default / new seller: 9% transaction */
const L1 = { sellingPercent: 9, processingPercent: PROCESSING_PERCENT, feeMin: FEE_MIN, feeOnShipping: false } as const;
/** Level 2 — 8.5% transaction */
const L2 = { sellingPercent: 8.5, processingPercent: PROCESSING_PERCENT, feeMin: FEE_MIN, feeOnShipping: false } as const;
/** Level 3 — 8.0% transaction */
const L3 = { sellingPercent: 8, processingPercent: PROCESSING_PERCENT, feeMin: FEE_MIN, feeOnShipping: false } as const;
/** Level 4 — 7.5% transaction */
const L4 = { sellingPercent: 7.5, processingPercent: PROCESSING_PERCENT, feeMin: FEE_MIN, feeOnShipping: false } as const;
/** Level 5 — 7.0% transaction */
const L5 = { sellingPercent: 7, processingPercent: PROCESSING_PERCENT, feeMin: FEE_MIN, feeOnShipping: false } as const;

// ---------------------------------------------------------------------------
// Zero / empty input
// ---------------------------------------------------------------------------
describe("zero input returns zeros", () => {
  it("zero item price", () => {
    const r = computeMarketplaceFee({ ...L1, itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Primary worked example: $200 sale at Level 1
//   Transaction fee = $200 × 9%   = $18.00
//   Processing fee  = $200 × 3%   = $6.00
//   Total fees      = $24.00
//   Payout          = $200 − $24  = $176.00
// ---------------------------------------------------------------------------
describe("worked example — $200 sale at Level 1 (9%)", () => {
  const r = computeMarketplaceFee({ ...L1, itemPrice: 200 });

  it("revenue is $200", () => expect(r.revenue).toBe(200));
  it("transaction fee is $18.00 (9%)", () => expect(r.sellingFee).toBe(18));
  it("processing fee is $6.00 (3%)", () => expect(r.processingFee).toBe(6));
  it("total fees is $24.00", () => expect(r.totalFees).toBe(24));
  it("payout is $176.00", () => expect(r.payout).toBe(176));
});

// ---------------------------------------------------------------------------
// Level 2 rate: $200 sale at 8.5%
//   Transaction fee = $200 × 8.5% = $17.00
//   Processing fee  = $200 × 3%   = $6.00
//   Total fees      = $23.00
//   Payout          = $177.00
// ---------------------------------------------------------------------------
describe("Level 2 rate — $200 sale at 8.5%", () => {
  const r = computeMarketplaceFee({ ...L2, itemPrice: 200 });

  it("transaction fee is $17.00", () => expect(r.sellingFee).toBe(17));
  it("processing fee is $6.00", () => expect(r.processingFee).toBe(6));
  it("payout is $177.00", () => expect(r.payout).toBe(177));
});

// ---------------------------------------------------------------------------
// Level 5 rate (highest-volume sellers): $200 sale at 7%
//   Transaction fee = $200 × 7%   = $14.00
//   Processing fee  = $200 × 3%   = $6.00
//   Total fees      = $20.00
//   Payout          = $180.00
// ---------------------------------------------------------------------------
describe("Level 5 rate — $200 sale at 7%", () => {
  const r = computeMarketplaceFee({ ...L5, itemPrice: 200 });

  it("transaction fee is $14.00", () => expect(r.sellingFee).toBe(14));
  it("processing fee is $6.00", () => expect(r.processingFee).toBe(6));
  it("payout is $180.00", () => expect(r.payout).toBe(180));
});

// ---------------------------------------------------------------------------
// Minimum fee boundary: $40 sale at Level 1
//   Raw transaction fee = $40 × 9% = $3.60 → feeMin $5.00 kicks in → $5.00
//   Processing fee  = $40 × 3%  = $1.20
//   Total fees      = $6.20
//   Payout          = $33.80
// ---------------------------------------------------------------------------
describe("minimum fee — $40 sale (transaction fee floored at $5.00)", () => {
  const r = computeMarketplaceFee({ ...L1, itemPrice: 40 });

  it("transaction fee is $5.00 (min kicks in, not raw $3.60)", () => expect(r.sellingFee).toBe(5));
  it("processing fee is $1.20", () => expect(r.processingFee).toBe(1.2));
  it("total fees is $6.20", () => expect(r.totalFees).toBe(6.2));
  it("payout is $33.80", () => expect(r.payout).toBe(33.8));
});

// ---------------------------------------------------------------------------
// Min fee does NOT apply when transaction fee already exceeds $5
//   $100 sale at Level 1: 9% = $9.00 > $5 min — min is irrelevant
// ---------------------------------------------------------------------------
describe("minimum fee — $100 sale, min does not change result", () => {
  const r = computeMarketplaceFee({ ...L1, itemPrice: 100 });

  it("transaction fee is $9.00 (not bumped by min)", () => expect(r.sellingFee).toBe(9));
  it("processing fee is $3.00", () => expect(r.processingFee).toBe(3));
  it("total fees is $12.00", () => expect(r.totalFees).toBe(12));
  it("payout is $88.00", () => expect(r.payout).toBe(88));
});

// ---------------------------------------------------------------------------
// Profit: $200 sale, Level 1, item cost $100
//   Payout = $176.00; profit = $176 − $100 = $76.00
// ---------------------------------------------------------------------------
describe("profit with item cost — $200 sale, L1, cost $100", () => {
  it("profit = payout $176 − item cost $100 = $76", () => {
    const r = computeMarketplaceFee({ ...L1, itemPrice: 200, itemCost: 100 });
    expect(r.payout).toBe(176);
    expect(r.profit).toBe(76);
  });
});

// ---------------------------------------------------------------------------
// All level rates — verify each fee % changes correctly
// ---------------------------------------------------------------------------
describe("all seller levels — transaction fee % applied correctly on $300 sale", () => {
  it("L1 9%: transaction $27, processing $9, total $36, payout $264", () => {
    const r = computeMarketplaceFee({ ...L1, itemPrice: 300 });
    expect(r.sellingFee).toBe(27);
    expect(r.processingFee).toBe(9);
    expect(r.totalFees).toBe(36);
    expect(r.payout).toBe(264);
  });

  it("L2 8.5%: transaction $25.50, processing $9, total $34.50, payout $265.50", () => {
    const r = computeMarketplaceFee({ ...L2, itemPrice: 300 });
    expect(r.sellingFee).toBe(25.5);
    expect(r.processingFee).toBe(9);
    expect(r.totalFees).toBe(34.5);
    expect(r.payout).toBe(265.5);
  });

  it("L3 8%: transaction $24, processing $9, total $33, payout $267", () => {
    const r = computeMarketplaceFee({ ...L3, itemPrice: 300 });
    expect(r.sellingFee).toBe(24);
    expect(r.processingFee).toBe(9);
    expect(r.totalFees).toBe(33);
    expect(r.payout).toBe(267);
  });

  it("L4 7.5%: transaction $22.50, processing $9, total $31.50, payout $268.50", () => {
    const r = computeMarketplaceFee({ ...L4, itemPrice: 300 });
    expect(r.sellingFee).toBe(22.5);
    expect(r.processingFee).toBe(9);
    expect(r.totalFees).toBe(31.5);
    expect(r.payout).toBe(268.5);
  });

  it("L5 7%: transaction $21, processing $9, total $30, payout $270", () => {
    const r = computeMarketplaceFee({ ...L5, itemPrice: 300 });
    expect(r.sellingFee).toBe(21);
    expect(r.processingFee).toBe(9);
    expect(r.totalFees).toBe(30);
    expect(r.payout).toBe(270);
  });
});

// ---------------------------------------------------------------------------
// feeOnShipping: false — StockX fees apply to sale price only, not shipping
// (StockX uses prepaid labels; the buyer does not pay shipping separately)
// ---------------------------------------------------------------------------
describe("feeOnShipping: false — selling fee applies to item price only", () => {
  it("any shipping value does not change the selling fee", () => {
    const withoutShipping = computeMarketplaceFee({ ...L1, itemPrice: 200 });
    const withShipping = computeMarketplaceFee({ ...L1, itemPrice: 200, shipping: 15 });
    // Selling fee is the same — fee only on item price
    expect(withShipping.sellingFee).toBe(withoutShipping.sellingFee);
    // But revenue includes shipping, so processing fee is higher (3% × $215 vs $200)
    expect(withShipping.processingFee).toBeGreaterThan(withoutShipping.processingFee);
  });
});
