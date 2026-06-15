/**
 * Gumroad fee calculator — unit tests (TDD).
 *
 * Fee model (verified 2026-06-15 from gumroad.com/help/article/66-gumroads-fees):
 *
 * DIRECT SALES:
 *   Gumroad fee = 10% of sale price + $0.50
 *   Stripe processing = 2.9% of sale price + $0.30  (charged SEPARATELY on top)
 *   Total fees = Gumroad fee + Stripe processing
 *
 * GUMROAD DISCOVER SALES:
 *   Fee = 30% of sale price (ALL-INCLUSIVE; Stripe processing is included)
 *   No separate processing fee.
 *
 * No monthly subscription fee. No volume tiers. USD only.
 */
import { describe, it, expect } from "vitest";
import { computeGumroadFee } from "./formula";

describe("computeGumroadFee — direct sales", () => {
  it("returns all zeros for zero input", () => {
    const r = computeGumroadFee({ salePrice: 0, source: "direct" });
    expect(r.gumroadFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });

  it("returns all zeros for negative input", () => {
    const r = computeGumroadFee({ salePrice: -10, source: "direct" });
    expect(r.gumroadFee).toBe(0);
    expect(r.payout).toBe(0);
  });

  it("calculates correct fees on a $25 direct sale (default worked example)", () => {
    // Gumroad fee: 10% × $25 + $0.50 = $2.50 + $0.50 = $3.00
    // Stripe processing: 2.9% × $25 + $0.30 = $0.725 + $0.30 = $1.025 → $1.03
    // Total: $3.00 + $1.03 = $4.03
    // Payout: $25.00 − $4.03 = $20.97
    const r = computeGumroadFee({ salePrice: 25, source: "direct" });
    expect(r.salePrice).toBe(25);
    expect(r.gumroadFee).toBe(3.00);
    expect(r.processingFee).toBe(1.03);
    expect(r.totalFees).toBe(4.03);
    expect(r.payout).toBe(20.97);
  });

  it("calculates correct fees on a $100 direct sale", () => {
    // Gumroad fee: 10% × $100 + $0.50 = $10.00 + $0.50 = $10.50
    // Stripe processing: 2.9% × $100 + $0.30 = $2.90 + $0.30 = $3.20
    // Total: $10.50 + $3.20 = $13.70
    // Payout: $100 − $13.70 = $86.30
    const r = computeGumroadFee({ salePrice: 100, source: "direct" });
    expect(r.gumroadFee).toBe(10.50);
    expect(r.processingFee).toBe(3.20);
    expect(r.totalFees).toBe(13.70);
    expect(r.payout).toBe(86.30);
  });

  it("calculates correct fees on a $9.99 direct sale (small item with fixed fees dominating)", () => {
    // Gumroad fee: 10% × $9.99 + $0.50 = $0.999 + $0.50 = $1.499 → $1.50
    // Stripe processing: 2.9% × $9.99 + $0.30 = $0.28971 + $0.30 = $0.58971 → $0.59
    // Total: $1.50 + $0.59 = $2.09
    // Payout: $9.99 − $2.09 = $7.90
    const r = computeGumroadFee({ salePrice: 9.99, source: "direct" });
    expect(r.gumroadFee).toBe(1.50);
    expect(r.processingFee).toBe(0.59);
    expect(r.totalFees).toBe(2.09);
    expect(r.payout).toBe(7.90);
  });

  it("includes itemCost in profit calculation for direct sales", () => {
    // $100 sale, $20 item cost
    // Payout = $86.30 (from $100 direct sale test above)
    // Profit = $86.30 − $20 = $66.30
    const r = computeGumroadFee({ salePrice: 100, source: "direct", itemCost: 20 });
    expect(r.payout).toBe(86.30);
    expect(r.profit).toBe(66.30);
  });
});

describe("computeGumroadFee — Gumroad Discover sales", () => {
  it("returns all zeros for zero input on Discover", () => {
    const r = computeGumroadFee({ salePrice: 0, source: "discover" });
    expect(r.gumroadFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });

  it("calculates correct fees on a $25 Discover sale", () => {
    // Discover fee: 30% × $25 = $7.50 (all-inclusive; no separate processing)
    // Processing fee: $0 (included in the 30%)
    // Total: $7.50
    // Payout: $25 − $7.50 = $17.50
    const r = computeGumroadFee({ salePrice: 25, source: "discover" });
    expect(r.gumroadFee).toBe(7.50);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(7.50);
    expect(r.payout).toBe(17.50);
    expect(r.takeRatePercent).toBe(30);
  });

  it("calculates correct fees on a $100 Discover sale", () => {
    // Discover fee: 30% × $100 = $30.00
    // Payout: $100 − $30 = $70.00
    const r = computeGumroadFee({ salePrice: 100, source: "discover" });
    expect(r.gumroadFee).toBe(30.00);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(30.00);
    expect(r.payout).toBe(70.00);
    expect(r.takeRatePercent).toBe(30);
  });

  it("includes itemCost in profit calculation for Discover sales", () => {
    // $100 Discover sale, $15 item cost
    // Payout = $70.00; Profit = $70 − $15 = $55.00
    const r = computeGumroadFee({ salePrice: 100, source: "discover", itemCost: 15 });
    expect(r.payout).toBe(70.00);
    expect(r.profit).toBe(55.00);
  });
});
