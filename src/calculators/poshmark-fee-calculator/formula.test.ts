/**
 * Poshmark fee tests — uses computeMarketplaceFee from the shared formula.
 * Poshmark fee model (US): flat $2.95 for sales strictly UNDER $15; 20% for
 * sales of $15 or above. Fee is on the sale price only (no shipping input;
 * feeOnShipping: false, no processingFee).
 *
 * Canada (CA): flat C$3.95 for sales strictly UNDER C$20; 20% for C$20+.
 */
import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── US ────────────────────────────────────────────────────────────────────────

describe("Poshmark US fees", () => {
  const US_PARAMS = {
    feeOnShipping: false,
    sellingPercent: 20,
    flatUnderThreshold: { threshold: 15, fee: 2.95 },
  };

  it("zero input → zero payout", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 0 });
    expect(r.payout).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.totalFees).toBe(0);
  });

  it("sale under threshold ($10) → flat $2.95 fee, payout $7.05", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 10 });
    expect(r.sellingFee).toBe(2.95);
    expect(r.payout).toBe(7.05);
    expect(r.totalFees).toBe(2.95);
    expect(r.processingFee).toBe(0);
  });

  it("sale just below threshold ($14.99) → flat $2.95 fee, payout $12.04", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 14.99 });
    expect(r.sellingFee).toBe(2.95);
    expect(r.payout).toBe(12.04);
  });

  it("sale exactly at threshold ($15) → 20% fee = $3.00, payout $12.00", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 15 });
    expect(r.sellingFee).toBe(3.0);
    expect(r.payout).toBe(12.0);
  });

  it("sale above threshold ($50) → 20% fee = $10.00, payout $40.00", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 50 });
    expect(r.sellingFee).toBe(10.0);
    expect(r.payout).toBe(40.0);
  });

  it("sale of $100 → 20% fee = $20.00, payout $80.00", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBe(20.0);
    expect(r.payout).toBe(80.0);
  });

  it("sale of $100 with item cost $60 → profit $20.00", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, itemCost: 60 });
    expect(r.sellingFee).toBe(20.0);
    expect(r.payout).toBe(80.0);
    expect(r.profit).toBe(20.0);
  });

  it("no separate processing fee (processingFee always 0)", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 75 });
    expect(r.processingFee).toBe(0);
  });
});

// ── Canada ────────────────────────────────────────────────────────────────────

describe("Poshmark Canada fees", () => {
  const CA_PARAMS = {
    feeOnShipping: false,
    sellingPercent: 20,
    flatUnderThreshold: { threshold: 20, fee: 3.95 },
  };

  it("zero input → zero payout", () => {
    const r = computeMarketplaceFee({ ...CA_PARAMS, itemPrice: 0 });
    expect(r.payout).toBe(0);
    expect(r.sellingFee).toBe(0);
  });

  it("sale under threshold (C$10) → flat C$3.95 fee, payout C$6.05", () => {
    const r = computeMarketplaceFee({ ...CA_PARAMS, itemPrice: 10 });
    expect(r.sellingFee).toBe(3.95);
    expect(r.payout).toBe(6.05);
  });

  it("sale just below threshold (C$19.99) → flat C$3.95 fee, payout C$16.04", () => {
    const r = computeMarketplaceFee({ ...CA_PARAMS, itemPrice: 19.99 });
    expect(r.sellingFee).toBe(3.95);
    expect(r.payout).toBe(16.04);
  });

  it("sale exactly at threshold (C$20) → 20% = C$4.00, payout C$16.00", () => {
    const r = computeMarketplaceFee({ ...CA_PARAMS, itemPrice: 20 });
    expect(r.sellingFee).toBe(4.0);
    expect(r.payout).toBe(16.0);
  });

  it("sale of C$100 → 20% = C$20.00, payout C$80.00", () => {
    const r = computeMarketplaceFee({ ...CA_PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBe(20.0);
    expect(r.payout).toBe(80.0);
  });
});
