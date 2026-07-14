/**
 * Upwork fee calculator tests.
 *
 * Upwork reuses computeMarketplaceFee for the freelancer-side calculation.
 * The service fee is variable per contract (0–15% since May 1, 2025).
 * Default in the calculator is 10% (historical midpoint / most common rate).
 *
 * Verified rates (2026-06-15):
 *   Freelancer service fee: 0–15% per contract (variable, set at proposal stage)
 *   Old flat 10% (2023–Apr 2025): replaced by variable model May 1, 2025
 *   Old sliding scale (pre-2023): 20%/$500 / 10%/$10k / 5% above $10k
 *   Client marketplace fee: 5% (informational)
 *   Sources:
 *     https://support.upwork.com/hc/en-us/articles/211062538
 *     https://www.upwork.com/i/pricing/
 */

import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

/** Build a config for a given service fee %. No processing fee at platform level. */
function upworkConfig(serviceFeePercent: number) {
  return {
    sellingPercent: serviceFeePercent,
    feeOnShipping: false,
  } as const;
}

// ---------------------------------------------------------------------------
// Zero input
// ---------------------------------------------------------------------------
describe("zero input returns zeros", () => {
  it("zero earnings at 10% fee", () => {
    const r = computeMarketplaceFee({ ...upworkConfig(10), itemPrice: 0 });
    expect(r.revenue).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Default rate: 10% — worked example $1,000 contract
//   Revenue       = $1,000.00
//   Service fee   = $1,000 × 10% = $100.00
//   You keep      = $900.00
// ---------------------------------------------------------------------------
describe("10% service fee — $1,000 contract (default rate)", () => {
  const r = computeMarketplaceFee({ ...upworkConfig(10), itemPrice: 1000 });

  it("revenue is $1,000.00", () => expect(r.revenue).toBe(1000));
  it("service fee is $100.00 (10%)", () => expect(r.sellingFee).toBe(100));
  it("you keep is $900.00", () => expect(r.payout).toBe(900));
  it("take rate is 10%", () => expect(r.takeRatePercent).toBe(10));
});

// ---------------------------------------------------------------------------
// Maximum rate: 15% (high-supply categories like VA, basic content)
//   Revenue       = $1,000.00
//   Service fee   = $1,000 × 15% = $150.00
//   You keep      = $850.00
// ---------------------------------------------------------------------------
describe("15% service fee — $1,000 contract (max rate, high-supply categories)", () => {
  const r = computeMarketplaceFee({ ...upworkConfig(15), itemPrice: 1000 });

  it("service fee is $150.00 (15%)", () => expect(r.sellingFee).toBe(150));
  it("you keep is $850.00", () => expect(r.payout).toBe(850));
  it("take rate is 15%", () => expect(r.takeRatePercent).toBe(15));
});

// ---------------------------------------------------------------------------
// Low rate: 5% (scarce/high-demand specialties)
//   Revenue       = $1,000.00
//   Service fee   = $1,000 × 5% = $50.00
//   You keep      = $950.00
// ---------------------------------------------------------------------------
describe("5% service fee — $1,000 contract (low rate, scarce skills)", () => {
  const r = computeMarketplaceFee({ ...upworkConfig(5), itemPrice: 1000 });

  it("service fee is $50.00 (5%)", () => expect(r.sellingFee).toBe(50));
  it("you keep is $950.00", () => expect(r.payout).toBe(950));
  it("take rate is 5%", () => expect(r.takeRatePercent).toBe(5));
});

// ---------------------------------------------------------------------------
// Zero rate: 0% (rare, very high-demand specialists / invited contracts)
//   Revenue       = $1,000.00
//   Service fee   = $0.00
//   You keep      = $1,000.00
// ---------------------------------------------------------------------------
describe("0% service fee — $1,000 contract (zero-fee contract)", () => {
  const r = computeMarketplaceFee({ ...upworkConfig(0), itemPrice: 1000 });

  it("service fee is $0.00", () => expect(r.sellingFee).toBe(0));
  it("you keep is $1,000.00", () => expect(r.payout).toBe(1000));
  it("take rate is 0%", () => expect(r.takeRatePercent).toBe(0));
});

// ---------------------------------------------------------------------------
// Smaller contract: $500 at 10%
//   Revenue       = $500.00
//   Service fee   = $50.00
//   You keep      = $450.00
// ---------------------------------------------------------------------------
describe("10% service fee — $500 contract", () => {
  const r = computeMarketplaceFee({ ...upworkConfig(10), itemPrice: 500 });

  it("service fee is $50.00", () => expect(r.sellingFee).toBe(50));
  it("you keep is $450.00", () => expect(r.payout).toBe(450));
});

// ---------------------------------------------------------------------------
// Fractional rate: 12.5% (mid-range variable rate)
//   Revenue       = $800.00
//   Service fee   = $800 × 12.5% = $100.00
//   You keep      = $700.00
// ---------------------------------------------------------------------------
describe("12.5% service fee — $800 contract (mid-range variable rate)", () => {
  const r = computeMarketplaceFee({ ...upworkConfig(12.5), itemPrice: 800 });

  it("service fee is $100.00 (12.5%)", () => expect(r.sellingFee).toBe(100));
  it("you keep is $700.00", () => expect(r.payout).toBe(700));
});

// ---------------------------------------------------------------------------
// Profit: $1,000 contract at 10%, expenses $200
//   Payout   = $900
//   Profit   = $900 - $200 = $700
// ---------------------------------------------------------------------------
describe("profit with expenses — $1,000 contract at 10%", () => {
  it("profit = payout - expenses", () => {
    const r = computeMarketplaceFee({ ...upworkConfig(10), itemPrice: 1000, itemCost: 200 });
    expect(r.payout).toBe(900);
    expect(r.profit).toBe(700);
  });
});
