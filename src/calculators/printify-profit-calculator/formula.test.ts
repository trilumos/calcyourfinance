/**
 * Printify profit calculator — formula integration test.
 * Verifies that the config's compute() wires correctly to computePodProfit,
 * and exercises hand-verified examples through the full config path.
 *
 * Printify model (verified 2026-06-15):
 *   - Free plan: NO platform commission. Seller pays base/product cost + shipping
 *     per fulfilled order. Profit = retail revenue − (base cost + shipping cost).
 *   - Printify Premium ($39/mo or $24.99/mo annual): up to 33% discount on base
 *     costs (enter the discounted cost from the Printify dashboard).
 *   Source: https://printify.com/pricing/ and https://printify.com/how-it-works/
 */
import { describe, it, expect } from "vitest";
import { printifyProfitCalculator } from "./config";

/** Minimal ComputeCtx stub for testing. */
const ctx = {
  country: "US" as const,
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatPercent: (v: number) => `${v}%`,
  formatNumber: (v: number) => String(v),
};

describe("printifyProfitCalculator.compute()", () => {
  it("hand-verified: retail $25, base cost $9, shipping cost $4.50, qty 1", () => {
    // Revenue: $25.00 | Cost: $9 + $4.50 = $13.50 | Profit: $11.50
    // Margin: 11.50 / 25.00 * 100 = 46%
    const result = printifyProfitCalculator.compute(
      {
        retailPrice: 25,
        shippingCharged: 0,
        productCost: 9,
        shippingCost: 4.5,
        quantity: 1,
      },
      ctx,
    );

    expect(result.headline.label.toLowerCase()).toContain("profit");
    expect(result.headline.display).toBe("$11.50");
    expect(result.headline.sub).toContain("46");

    const rows = "rows" in result ? result.rows : [];
    const revenueRow = rows.find((r) => r.label.toLowerCase().includes("revenue"));
    expect(revenueRow?.display).toBe("$25.00");
  });

  it("shipping charged to customer increases revenue and profit", () => {
    // Retail $25, shipping charged $5 → revenue $30
    // Base cost $9, shipping cost $4.50 → total cost $13.50
    // Profit: $30 - $13.50 = $16.50; Margin: 16.50/30 * 100 = 55%
    const result = printifyProfitCalculator.compute(
      {
        retailPrice: 25,
        shippingCharged: 5,
        productCost: 9,
        shippingCost: 4.5,
        quantity: 1,
      },
      ctx,
    );

    expect(result.headline.display).toBe("$16.50");
    const rows = "rows" in result ? result.rows : [];
    const revenueRow = rows.find((r) => r.label.toLowerCase().includes("revenue"));
    expect(revenueRow?.display).toBe("$30.00");
  });

  it("loss scenario: base cost exceeds retail — profit is negative", () => {
    // Retail $10, base cost $12, shipping $0 → profit -$2
    const result = printifyProfitCalculator.compute(
      {
        retailPrice: 10,
        shippingCharged: 0,
        productCost: 12,
        shippingCost: 0,
        quantity: 1,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$-2.00");
  });

  it("quantity > 1 scales correctly", () => {
    // Retail $25, base $9, shipping $4.50, qty 3
    // Revenue: $25 * 3 = $75 | Cost: $13.50 * 3 = $40.50 | Profit: $34.50
    const result = printifyProfitCalculator.compute(
      {
        retailPrice: 25,
        shippingCharged: 0,
        productCost: 9,
        shippingCost: 4.5,
        quantity: 3,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$34.50");
  });

  it("zero costs edge case — all revenue is profit", () => {
    const result = printifyProfitCalculator.compute(
      {
        retailPrice: 20,
        shippingCharged: 0,
        productCost: 0,
        shippingCost: 0,
        quantity: 1,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$20.00");
    expect(result.headline.sub).toContain("100");
  });
});
