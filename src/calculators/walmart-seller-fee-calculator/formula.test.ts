/**
 * Walmart Marketplace referral fee formula tests.
 *
 * Accuracy is the top priority. Tests pin the behaviour described in the
 * official Walmart Marketplace pricing page (https://marketplace.walmart.com/pricing/,
 * verified 2026-06-13):
 *
 * - "flat" categories (e.g. "Most categories" 15%, Consumer Electronics 8%)
 * - "switch" categories (e.g. Apparel: ≤$15 → 5%, $15–$20 → 10%, >$20 → 15%)
 * - "marginal" categories (e.g. Compact Appliances: first $300 @ 12%, rest @ 8%)
 * - Fee applies to item price + shipping combined (total sales price)
 * - Zero input returns zero output
 * - Profit calculation when itemCost is supplied
 *
 * Source: https://marketplace.walmart.com/pricing/
 */

import { describe, it, expect } from "vitest";
import { computeWalmartFee } from "./formula";
import { walmartFees } from "../../config/fees";

// Helper: find a category by id (throws if not found so tests fail loudly)
function cat(id: string) {
  const c = walmartFees.categories.find((c) => c.id === id);
  if (!c) throw new Error(`Category "${id}" not found in walmartFees`);
  return c;
}

// ─── Flat rate categories ───────────────────────────────────────────────────

describe("computeWalmartFee — flat rate (most categories, 15%)", () => {
  it("$100 item price → $15.00 referral fee, $85.00 payout", () => {
    const r = computeWalmartFee({ itemPrice: 100, category: cat("most") });
    expect(r.revenue).toBe(100);
    expect(r.referralFee).toBe(15);
    expect(r.payout).toBe(85);
  });

  it("$50 item + $10 shipping → fee on $60 total = $9.00, payout $51.00", () => {
    const r = computeWalmartFee({
      itemPrice: 50,
      shipping: 10,
      category: cat("most"),
    });
    expect(r.revenue).toBe(60);
    expect(r.referralFee).toBe(9);
    expect(r.payout).toBe(51);
  });

  it("$29.99 item → $4.50 fee (15% = 4.4985 → rounds to 4.50), payout $25.49", () => {
    const r = computeWalmartFee({ itemPrice: 29.99, category: cat("most") });
    expect(r.referralFee).toBe(4.5);
    expect(r.payout).toBe(25.49);
  });
});

describe("computeWalmartFee — flat rate (Consumer Electronics, 8%)", () => {
  it("$200 item → $16.00 referral fee, $184.00 payout", () => {
    const r = computeWalmartFee({ itemPrice: 200, category: cat("consumer_electronics") });
    expect(r.referralFee).toBe(16);
    expect(r.payout).toBe(184);
  });

  it("$99.99 item → 8% = $8.00 (rounded from $7.9992)", () => {
    const r = computeWalmartFee({ itemPrice: 99.99, category: cat("consumer_electronics") });
    expect(r.referralFee).toBe(8);
    expect(r.payout).toBe(91.99);
  });
});

describe("computeWalmartFee — flat rate (Personal Computers, 6%)", () => {
  it("$500 laptop → $30.00 fee, $470.00 payout", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("personal_computers") });
    expect(r.referralFee).toBe(30);
    expect(r.payout).toBe(470);
  });
});

// ─── Switch categories ──────────────────────────────────────────────────────

describe("computeWalmartFee — switch (Apparel, 3 bands: ≤$15 → 5%, $15–$20 → 10%, >$20 → 15%)", () => {
  it("$10 item (band 1) → 5% = $0.50 fee", () => {
    const r = computeWalmartFee({ itemPrice: 10, category: cat("apparel") });
    expect(r.referralFee).toBe(0.5);
    expect(r.payout).toBe(9.5);
  });

  it("$15.00 exact (boundary, ≤$15) → 5% = $0.75 fee", () => {
    const r = computeWalmartFee({ itemPrice: 15, category: cat("apparel") });
    expect(r.referralFee).toBe(0.75);
    expect(r.payout).toBe(14.25);
  });

  it("$18 item (band 2: $15–$20) → 10% = $1.80 fee", () => {
    const r = computeWalmartFee({ itemPrice: 18, category: cat("apparel") });
    expect(r.referralFee).toBe(1.8);
    expect(r.payout).toBe(16.2);
  });

  it("$20.00 exact (boundary, ≤$20) → 10% = $2.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 20, category: cat("apparel") });
    expect(r.referralFee).toBe(2);
    expect(r.payout).toBe(18);
  });

  it("$25 item (band 3: >$20) → 15% = $3.75 fee", () => {
    const r = computeWalmartFee({ itemPrice: 25, category: cat("apparel") });
    expect(r.referralFee).toBe(3.75);
    expect(r.payout).toBe(21.25);
  });

  it("$100 item (band 3: >$20) → 15% = $15.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 100, category: cat("apparel") });
    expect(r.referralFee).toBe(15);
    expect(r.payout).toBe(85);
  });
});

describe("computeWalmartFee — switch (Baby Products, 2 bands: ≤$10 → 8%, >$10 → 15%)", () => {
  it("$8 item → 8% = $0.64 fee", () => {
    const r = computeWalmartFee({ itemPrice: 8, category: cat("baby") });
    expect(r.referralFee).toBe(0.64);
    expect(r.payout).toBe(7.36);
  });

  it("$10 exact (boundary, ≤$10) → 8% = $0.80 fee", () => {
    const r = computeWalmartFee({ itemPrice: 10, category: cat("baby") });
    expect(r.referralFee).toBe(0.8);
    expect(r.payout).toBe(9.2);
  });

  it("$25 item → 15% = $3.75 fee", () => {
    const r = computeWalmartFee({ itemPrice: 25, category: cat("baby") });
    expect(r.referralFee).toBe(3.75);
    expect(r.payout).toBe(21.25);
  });
});

describe("computeWalmartFee — switch (Outdoor Power Tools, 2 bands: ≤$500 → 15%, >$500 → 8%)", () => {
  it("$300 lawnmower → 15% = $45.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 300, category: cat("outdoor_power_tools") });
    expect(r.referralFee).toBe(45);
    expect(r.payout).toBe(255);
  });

  it("$500 exact (boundary, ≤$500) → 15% = $75.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("outdoor_power_tools") });
    expect(r.referralFee).toBe(75);
    expect(r.payout).toBe(425);
  });

  it("$800 riding mower (>$500) → 8% = $64.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 800, category: cat("outdoor_power_tools") });
    expect(r.referralFee).toBe(64);
    expect(r.payout).toBe(736);
  });
});

// ─── Marginal rate categories ───────────────────────────────────────────────

describe("computeWalmartFee — marginal (Compact Appliances: first $300 @ 12%, rest @ 8%)", () => {
  it("$200 item (below threshold) → 12% = $24.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 200, category: cat("appliances_compact") });
    expect(r.referralFee).toBe(24);
    expect(r.payout).toBe(176);
  });

  it("$300 exact (at threshold) → 12% = $36.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 300, category: cat("appliances_compact") });
    expect(r.referralFee).toBe(36);
    expect(r.payout).toBe(264);
  });

  it("$500 item → ($300 × 12%) + ($200 × 8%) = $36 + $16 = $52.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("appliances_compact") });
    expect(r.referralFee).toBe(52);
    expect(r.payout).toBe(448);
  });

  it("$1000 item → ($300 × 12%) + ($700 × 8%) = $36 + $56 = $92.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 1000, category: cat("appliances_compact") });
    expect(r.referralFee).toBe(92);
    expect(r.payout).toBe(908);
  });
});

describe("computeWalmartFee — marginal (Electronics Accessories: first $100 @ 15%, rest @ 8%)", () => {
  it("$50 item → 15% = $7.50 fee", () => {
    const r = computeWalmartFee({ itemPrice: 50, category: cat("electronics_accessories") });
    expect(r.referralFee).toBe(7.5);
    expect(r.payout).toBe(42.5);
  });

  it("$100 exact (at threshold) → 15% = $15.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 100, category: cat("electronics_accessories") });
    expect(r.referralFee).toBe(15);
    expect(r.payout).toBe(85);
  });

  it("$150 item → ($100 × 15%) + ($50 × 8%) = $15 + $4 = $19.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 150, category: cat("electronics_accessories") });
    expect(r.referralFee).toBe(19);
    expect(r.payout).toBe(131);
  });
});

describe("computeWalmartFee — marginal (Jewelry: first $250 @ 20%, rest @ 5%)", () => {
  it("$100 ring → 20% = $20.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 100, category: cat("jewelry") });
    expect(r.referralFee).toBe(20);
    expect(r.payout).toBe(80);
  });

  it("$250 exact → 20% = $50.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 250, category: cat("jewelry") });
    expect(r.referralFee).toBe(50);
    expect(r.payout).toBe(200);
  });

  it("$500 ring → ($250 × 20%) + ($250 × 5%) = $50 + $12.50 = $62.50 fee", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("jewelry") });
    expect(r.referralFee).toBe(62.5);
    expect(r.payout).toBe(437.5);
  });

  it("$1000 necklace → ($250 × 20%) + ($750 × 5%) = $50 + $37.50 = $87.50 fee", () => {
    const r = computeWalmartFee({ itemPrice: 1000, category: cat("jewelry") });
    expect(r.referralFee).toBe(87.5);
    expect(r.payout).toBe(912.5);
  });
});

describe("computeWalmartFee — marginal (Watches: first $1500 @ 15%, rest @ 3%)", () => {
  it("$500 watch → 15% = $75.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("watches") });
    expect(r.referralFee).toBe(75);
    expect(r.payout).toBe(425);
  });

  it("$1500 exact → 15% = $225.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 1500, category: cat("watches") });
    expect(r.referralFee).toBe(225);
    expect(r.payout).toBe(1275);
  });

  it("$2000 watch → ($1500 × 15%) + ($500 × 3%) = $225 + $15 = $240.00 fee", () => {
    const r = computeWalmartFee({ itemPrice: 2000, category: cat("watches") });
    expect(r.referralFee).toBe(240);
    expect(r.payout).toBe(1760);
  });
});

// ─── Fee applies to item + shipping (total sales price) ────────────────────

describe("computeWalmartFee — fee applies to total sales price (item + shipping)", () => {
  it("$100 item + $15 shipping → 15% of $115 = $17.25 fee", () => {
    const r = computeWalmartFee({
      itemPrice: 100,
      shipping: 15,
      category: cat("most"),
    });
    expect(r.revenue).toBe(115);
    expect(r.referralFee).toBe(17.25);
    expect(r.payout).toBe(97.75);
  });
});

// ─── Zero input ─────────────────────────────────────────────────────────────

describe("computeWalmartFee — zero input", () => {
  it("$0 item → returns all zeros", () => {
    const r = computeWalmartFee({ itemPrice: 0, category: cat("most") });
    expect(r.revenue).toBe(0);
    expect(r.referralFee).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.profit).toBe(0);
    expect(r.effectiveRatePercent).toBe(0);
  });

  it("negative item price treated as zero", () => {
    const r = computeWalmartFee({ itemPrice: -50, category: cat("most") });
    expect(r.revenue).toBe(0);
    expect(r.referralFee).toBe(0);
  });
});

// ─── Profit calculation ─────────────────────────────────────────────────────

describe("computeWalmartFee — profit calculation", () => {
  it("$100 item, $15 fee, $60 item cost → profit = $25.00", () => {
    const r = computeWalmartFee({
      itemPrice: 100,
      itemCost: 60,
      category: cat("most"),
    });
    expect(r.payout).toBe(85);
    expect(r.profit).toBe(25);
  });

  it("$100 item (consumer electronics 8%), $20 cost → profit $72.00", () => {
    const r = computeWalmartFee({
      itemPrice: 100,
      itemCost: 20,
      category: cat("consumer_electronics"),
    });
    // 8% of $100 = $8; payout = $92; profit = $92 - $20 = $72
    expect(r.referralFee).toBe(8);
    expect(r.payout).toBe(92);
    expect(r.profit).toBe(72);
  });
});

// ─── Effective rate ─────────────────────────────────────────────────────────

describe("computeWalmartFee — effectiveRatePercent", () => {
  it("flat 15% category shows 15% effective rate", () => {
    const r = computeWalmartFee({ itemPrice: 100, category: cat("most") });
    expect(r.effectiveRatePercent).toBe(15);
  });

  it("marginal Jewelry $500 → effective rate = $62.50 / $500 = 12.5%", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("jewelry") });
    expect(r.effectiveRatePercent).toBe(12.5);
  });

  it("marginal Compact Appliances $500 → effective rate = $52 / $500 = 10.4%", () => {
    const r = computeWalmartFee({ itemPrice: 500, category: cat("appliances_compact") });
    expect(r.effectiveRatePercent).toBe(10.4);
  });
});
