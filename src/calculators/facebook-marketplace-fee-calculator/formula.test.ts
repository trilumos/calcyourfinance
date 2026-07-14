/**
 * Facebook Marketplace fee tests — uses computeMarketplaceFee from the shared formula.
 *
 * Fee model (effective April 15, 2024):
 *   Shipped order (item price < $8):  flat $0.80 fee (minimum)
 *   Shipped order (item price ≥ $8):  10% of item price
 *   Local pickup:                     $0 (no fee)
 *
 * No separate payment processing fee — the 10% is all-inclusive.
 * Fee applies to item price only (feeOnShipping: false; buyers pay shipping via Facebook).
 *
 * Worked example — shipped, $100 item:
 *   Selling fee = 10% × $100 = $10.00
 *   Payout      = $100.00 − $10.00 = $90.00
 *
 * Small order — shipped, $5 item:
 *   Selling fee = $0.80 (minimum, because $5 < $8 threshold)
 *   Payout      = $5.00 − $0.80 = $4.20
 *
 * Exact threshold — shipped, $8 item:
 *   Selling fee = 10% × $8 = $0.80 (percentage kicks in at $8)
 *   Payout      = $8.00 − $0.80 = $7.20
 *
 * Local pickup — any price:
 *   Selling fee = $0
 *   Payout      = full item price
 */
import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── Shipped orders ────────────────────────────────────────────────────────────

const SHIPPED_PARAMS = {
  feeOnShipping: false,
  sellingPercent: 10,
  flatUnderThreshold: { threshold: 8, fee: 0.80 },
};

describe("Facebook Marketplace — shipped orders", () => {
  it("zero input → zero payout", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 0 });
    expect(r.payout).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.processingFee).toBe(0);
  });

  it("$5 item (below $8 threshold) → flat $0.80 fee, payout $4.20", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 5 });
    // below threshold → flat $0.80
    expect(r.sellingFee).toBe(0.80);
    expect(r.payout).toBe(4.20);
    expect(r.totalFees).toBe(0.80);
    expect(r.processingFee).toBe(0);
  });

  it("$7.99 item (just below threshold) → flat $0.80 fee, payout $7.19", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 7.99 });
    expect(r.sellingFee).toBe(0.80);
    expect(r.payout).toBe(7.19);
  });

  it("$8 item (at threshold) → 10% fee = $0.80, payout $7.20", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 8 });
    // at threshold: percentage applies → 10% × $8 = $0.80
    expect(r.sellingFee).toBe(0.80);
    expect(r.payout).toBe(7.20);
  });

  it("$10 item → 10% fee = $1.00, payout $9.00", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 10 });
    expect(r.sellingFee).toBe(1.00);
    expect(r.payout).toBe(9.00);
    expect(r.totalFees).toBe(1.00);
  });

  it("$100 item → 10% fee = $10.00, payout $90.00", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBe(10.00);
    expect(r.payout).toBe(90.00);
    expect(r.totalFees).toBe(10.00);
  });

  it("$100 item with $60 item cost → profit $30.00", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 100, itemCost: 60 });
    expect(r.sellingFee).toBe(10.00);
    expect(r.payout).toBe(90.00);
    expect(r.profit).toBe(30.00);
  });

  it("no separate processing fee (always 0 for Facebook Marketplace)", () => {
    const r = computeMarketplaceFee({ ...SHIPPED_PARAMS, itemPrice: 50 });
    expect(r.processingFee).toBe(0);
  });
});

// ── Local pickup (free — $0 fee) ──────────────────────────────────────────────

const LOCAL_PARAMS = {
  feeOnShipping: false,
  sellingPercent: 0,
  // no flatUnderThreshold — local pickup is always free
};

describe("Facebook Marketplace — local pickup (no fee)", () => {
  it("zero input → zero payout", () => {
    const r = computeMarketplaceFee({ ...LOCAL_PARAMS, itemPrice: 0 });
    expect(r.payout).toBe(0);
    expect(r.sellingFee).toBe(0);
  });

  it("$50 local pickup → $0 fee, payout $50.00", () => {
    const r = computeMarketplaceFee({ ...LOCAL_PARAMS, itemPrice: 50 });
    expect(r.sellingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(50.00);
  });

  it("$200 local pickup with $100 cost → profit $100.00", () => {
    const r = computeMarketplaceFee({ ...LOCAL_PARAMS, itemPrice: 200, itemCost: 100 });
    expect(r.sellingFee).toBe(0);
    expect(r.payout).toBe(200.00);
    expect(r.profit).toBe(100.00);
  });
});
