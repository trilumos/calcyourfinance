import { describe, it, expect } from "vitest";
import { computeRedbubbleEarnings } from "./formula";

describe("computeRedbubbleEarnings", () => {
  // ── Core formula: retail = base × (1 + margin/100); gross = base × margin/100 ──

  it("base $20, 20% margin → retail $24, gross earnings $4", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 1, accountTier: "standard" });
    expect(r.retailPrice).toBe(24);
    expect(r.grossEarnings).toBe(4);
  });

  it("base $20, 50% margin → retail $30, gross earnings $10", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 50, quantity: 1, accountTier: "standard" });
    expect(r.retailPrice).toBe(30);
    expect(r.grossEarnings).toBe(10);
  });

  // ── Quantity ──

  it("quantity > 1 multiplies retail and earnings totals", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 5, accountTier: "standard" });
    expect(r.retailPriceTotal).toBe(120);  // 24 × 5
    expect(r.grossEarningsTotal).toBe(20); // 4 × 5
  });

  // ── Platform fees (Standard tier = 50% of gross earnings) ──

  it("Standard tier, 20% margin: platform fee = 50% of gross earnings", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 1, accountTier: "standard" });
    // gross = $4, platformFee = 50% × 4 = $2
    expect(r.platformFee).toBe(2);
    expect(r.netEarnings).toBe(2); // 4 - 2 = 2
  });

  it("Premium tier, 20% margin: platform fee = 20% of gross earnings", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 1, accountTier: "premium" });
    // gross = $4, platformFee = 20% × 4 = $0.80
    expect(r.platformFee).toBe(0.80);
    expect(r.netEarnings).toBe(3.20);
  });

  it("Pro tier: no platform fee, full gross earnings kept", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 1, accountTier: "pro" });
    expect(r.platformFee).toBe(0);
    expect(r.netEarnings).toBe(4);
  });

  // ── Excess markup fee (Standard/Premium, markup > 20%) ──
  // Excess fee = 50% × (earnings from markup above 20%)
  // earnings above threshold = base × max(0, marginPercent - 20) / 100

  it("Standard tier, 30% margin: excess markup fee applies on earnings above 20% threshold", () => {
    // base = 20, margin = 30%
    // gross = 20 × 0.30 = $6
    // earnings at 20% = 20 × 0.20 = $4 (no excess fee)
    // earnings above 20% = 20 × 0.10 = $2 → excess fee = 50% × $2 = $1
    // platform fee = 50% × $6 = $3
    // net = $6 - $3 - $1 = $2
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 30, quantity: 1, accountTier: "standard" });
    expect(r.grossEarnings).toBe(6);
    expect(r.excessMarkupFee).toBe(1);
    expect(r.platformFee).toBe(3);
    expect(r.netEarnings).toBe(2);
  });

  it("Premium tier, 30% margin: excess markup fee applies", () => {
    // base = 20, margin = 30%
    // gross = $6
    // earnings above 20% = $2 → excess fee = 50% × $2 = $1
    // platform fee = 20% × $6 = $1.20
    // net = $6 - $1.20 - $1 = $3.80
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 30, quantity: 1, accountTier: "premium" });
    expect(r.excessMarkupFee).toBe(1);
    expect(r.platformFee).toBe(1.20);
    expect(r.netEarnings).toBe(3.80);
  });

  it("Pro tier, 30% margin: no excess markup fee and no platform fee", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 30, quantity: 1, accountTier: "pro" });
    expect(r.excessMarkupFee).toBe(0);
    expect(r.platformFee).toBe(0);
    expect(r.netEarnings).toBe(6);
  });

  it("Standard tier, exactly 20% margin: no excess markup fee", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 1, accountTier: "standard" });
    expect(r.excessMarkupFee).toBe(0);
  });

  // ── Edge / guard cases ──

  it("zero base price → all outputs 0", () => {
    const r = computeRedbubbleEarnings({ basePrice: 0, marginPercent: 20, quantity: 1, accountTier: "standard" });
    expect(r.retailPrice).toBe(0);
    expect(r.grossEarnings).toBe(0);
    expect(r.netEarnings).toBe(0);
  });

  it("negative base price → treated as 0", () => {
    const r = computeRedbubbleEarnings({ basePrice: -5, marginPercent: 20, quantity: 1, accountTier: "standard" });
    expect(r.retailPrice).toBe(0);
    expect(r.grossEarnings).toBe(0);
  });

  it("zero margin → retail = base, zero earnings", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 0, quantity: 1, accountTier: "standard" });
    expect(r.retailPrice).toBe(20);
    expect(r.grossEarnings).toBe(0);
    expect(r.netEarnings).toBe(0);
  });

  it("negative margin → treated as 0", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: -10, quantity: 1, accountTier: "standard" });
    expect(r.grossEarnings).toBe(0);
    expect(r.netEarnings).toBe(0);
  });

  it("quantity < 1 → treated as 1", () => {
    const r1 = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 0, accountTier: "standard" });
    const r2 = computeRedbubbleEarnings({ basePrice: 20, marginPercent: 20, quantity: 1, accountTier: "standard" });
    expect(r1.grossEarningsTotal).toBe(r2.grossEarningsTotal);
  });

  it("non-finite base → treated as 0", () => {
    const r = computeRedbubbleEarnings({ basePrice: NaN, marginPercent: 20, quantity: 1, accountTier: "standard" });
    expect(r.retailPrice).toBe(0);
    expect(r.grossEarnings).toBe(0);
  });

  it("non-finite margin → treated as 0", () => {
    const r = computeRedbubbleEarnings({ basePrice: 20, marginPercent: Infinity, quantity: 1, accountTier: "standard" });
    expect(r.grossEarnings).toBe(0);
  });

  // ── Rounding ──

  it("rounds to 2 decimal places correctly", () => {
    // base = 15.99, margin = 20% → gross = 15.99 × 0.20 = 3.198 → rounded 3.20
    const r = computeRedbubbleEarnings({ basePrice: 15.99, marginPercent: 20, quantity: 1, accountTier: "pro" });
    expect(r.grossEarnings).toBe(3.20);
    expect(r.retailPrice).toBe(19.19); // 15.99 × 1.20 = 19.188 → 19.19
  });
});
