/**
 * Tests for Bandcamp fee formula.
 *
 * Verified rates (2026-06-15):
 *  - Digital revenue share: 15% standard, 10% once $5,000 USD lifetime digital sales reached
 *    (and maintained — rolling 12-month requirement to stay at 10%)
 *  - Physical/merch revenue share: 10% flat
 *  - Payment processing (standard sale ≥ $8.07): ~2.9% + $0.30 (credit/debit card)
 *    Note: we use 2.9% + $0.30 as the representative card rate
 *  - Bandcamp Friday: Bandcamp waives its revenue share (0%), processing still applies
 *
 * Source: https://get.bandcamp.help/en/articles/15263193-what-are-bandcamp-s-fees
 */

import { describe, it, expect } from "vitest";
import { computeBandcampFee } from "./formula";

describe("computeBandcampFee", () => {
  // --- Zero / edge cases ---

  it("returns all-zero breakdown for zero item price", () => {
    const r = computeBandcampFee({ saleType: "digital", salePrice: 0, overThreshold: false, bandcampFriday: false });
    expect(r.revenue).toBe(0);
    expect(r.revenueSharFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.payout).toBe(0);
  });

  // --- Digital: under $5,000 threshold (15% revenue share) ---

  it("digital sale under threshold: takes 15% revenue share + processing", () => {
    // $10 digital sale, standard creator (under $5k lifetime sales)
    // Revenue share: $10 * 0.15 = $1.50
    // Processing: $10 * 0.029 + $0.30 = $0.29 + $0.30 = $0.59
    // Total fees: $1.50 + $0.59 = $2.09
    // Payout: $10.00 - $2.09 = $7.91
    const r = computeBandcampFee({ saleType: "digital", salePrice: 10, overThreshold: false, bandcampFriday: false });
    expect(r.revenue).toBe(10.00);
    expect(r.revenueSharFee).toBe(1.50);
    expect(r.processingFee).toBe(0.59);
    expect(r.totalFees).toBe(2.09);
    expect(r.payout).toBe(7.91);
  });

  it("digital sale under threshold: $25 sale at 15%", () => {
    // $25 digital, standard (15%)
    // Revenue share: $25 * 0.15 = $3.75
    // Processing: $25 * 0.029 + $0.30 = $0.725 + $0.30 = $1.025 → $1.03 (rounded)
    // Total fees: $3.75 + $1.03 = $4.78
    // Payout: $25.00 - $4.78 = $20.22
    const r = computeBandcampFee({ saleType: "digital", salePrice: 25, overThreshold: false, bandcampFriday: false });
    expect(r.revenue).toBe(25.00);
    expect(r.revenueSharFee).toBe(3.75);
    expect(r.processingFee).toBe(1.03);
    expect(r.totalFees).toBe(4.78);
    expect(r.payout).toBe(20.22);
  });

  // --- Digital: over $5,000 threshold (10% revenue share) ---

  it("digital sale over threshold: takes 10% revenue share + processing", () => {
    // $10 digital, creator over $5k threshold (10%)
    // Revenue share: $10 * 0.10 = $1.00
    // Processing: $10 * 0.029 + $0.30 = $0.59
    // Total fees: $1.00 + $0.59 = $1.59
    // Payout: $10.00 - $1.59 = $8.41
    const r = computeBandcampFee({ saleType: "digital", salePrice: 10, overThreshold: true, bandcampFriday: false });
    expect(r.revenue).toBe(10.00);
    expect(r.revenueSharFee).toBe(1.00);
    expect(r.processingFee).toBe(0.59);
    expect(r.totalFees).toBe(1.59);
    expect(r.payout).toBe(8.41);
  });

  it("digital sale over threshold: $100 sale at 10%", () => {
    // $100 digital, over-threshold creator (10%)
    // Revenue share: $100 * 0.10 = $10.00
    // Processing: $100 * 0.029 + $0.30 = $2.90 + $0.30 = $3.20
    // Total fees: $10.00 + $3.20 = $13.20
    // Payout: $100.00 - $13.20 = $86.80
    const r = computeBandcampFee({ saleType: "digital", salePrice: 100, overThreshold: true, bandcampFriday: false });
    expect(r.revenue).toBe(100.00);
    expect(r.revenueSharFee).toBe(10.00);
    expect(r.processingFee).toBe(3.20);
    expect(r.totalFees).toBe(13.20);
    expect(r.payout).toBe(86.80);
  });

  // --- Physical/merch: flat 10% ---

  it("physical sale: takes 10% revenue share + processing", () => {
    // $30 physical/merch, flat 10% (overThreshold is ignored for physical)
    // Revenue share: $30 * 0.10 = $3.00
    // Processing: $30 * 0.029 + $0.30 = $0.87 + $0.30 = $1.17
    // Total fees: $3.00 + $1.17 = $4.17
    // Payout: $30.00 - $4.17 = $25.83
    const r = computeBandcampFee({ saleType: "physical", salePrice: 30, overThreshold: false, bandcampFriday: false });
    expect(r.revenue).toBe(30.00);
    expect(r.revenueSharFee).toBe(3.00);
    expect(r.processingFee).toBe(1.17);
    expect(r.totalFees).toBe(4.17);
    expect(r.payout).toBe(25.83);
  });

  it("physical sale: overThreshold flag has no effect (always 10%)", () => {
    // overThreshold should not change the rate for physical
    const rFalse = computeBandcampFee({ saleType: "physical", salePrice: 30, overThreshold: false, bandcampFriday: false });
    const rTrue  = computeBandcampFee({ saleType: "physical", salePrice: 30, overThreshold: true, bandcampFriday: false });
    expect(rFalse.revenueSharFee).toBe(rTrue.revenueSharFee);
    expect(rFalse.payout).toBe(rTrue.payout);
  });

  // --- Bandcamp Friday: 0% revenue share, processing only ---

  it("Bandcamp Friday: zero revenue share, only processing fee applies", () => {
    // $10 digital, Bandcamp Friday — 0% revenue share, processing only
    // Revenue share: $0.00
    // Processing: $10 * 0.029 + $0.30 = $0.59
    // Total fees: $0.59
    // Payout: $10.00 - $0.59 = $9.41
    const r = computeBandcampFee({ saleType: "digital", salePrice: 10, overThreshold: false, bandcampFriday: true });
    expect(r.revenue).toBe(10.00);
    expect(r.revenueSharFee).toBe(0.00);
    expect(r.processingFee).toBe(0.59);
    expect(r.totalFees).toBe(0.59);
    expect(r.payout).toBe(9.41);
  });

  it("Bandcamp Friday: also applies to physical sales (0% share)", () => {
    // $30 physical, Bandcamp Friday — 0% revenue share
    // Revenue share: $0.00
    // Processing: $30 * 0.029 + $0.30 = $1.17
    // Total fees: $1.17
    // Payout: $30.00 - $1.17 = $28.83
    const r = computeBandcampFee({ saleType: "physical", salePrice: 30, overThreshold: false, bandcampFriday: true });
    expect(r.revenue).toBe(30.00);
    expect(r.revenueSharFee).toBe(0.00);
    expect(r.processingFee).toBe(1.17);
    expect(r.totalFees).toBe(1.17);
    expect(r.payout).toBe(28.83);
  });

  // --- Profit with item cost ---

  it("computes profit correctly when item cost is provided", () => {
    // $30 physical, $10 cost, 10% share + processing
    // Payout: $25.83, profit: $25.83 - $10 = $15.83
    const r = computeBandcampFee({ saleType: "physical", salePrice: 30, overThreshold: false, bandcampFriday: false, itemCost: 10 });
    expect(r.profit).toBe(15.83);
  });

  // --- Revenue share rate is exposed ---

  it("exposes the active revenueSharPercent for labelling", () => {
    const rStandard  = computeBandcampFee({ saleType: "digital", salePrice: 10, overThreshold: false, bandcampFriday: false });
    const rTier      = computeBandcampFee({ saleType: "digital", salePrice: 10, overThreshold: true,  bandcampFriday: false });
    const rPhysical  = computeBandcampFee({ saleType: "physical", salePrice: 10, overThreshold: false, bandcampFriday: false });
    const rFriday    = computeBandcampFee({ saleType: "digital", salePrice: 10, overThreshold: false, bandcampFriday: true });
    expect(rStandard.revenueSharePercent).toBe(15);
    expect(rTier.revenueSharePercent).toBe(10);
    expect(rPhysical.revenueSharePercent).toBe(10);
    expect(rFriday.revenueSharePercent).toBe(0);
  });
});
