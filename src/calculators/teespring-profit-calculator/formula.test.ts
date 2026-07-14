/**
 * Teespring / Spring profit calculator — formula integration test.
 * Verifies that the config's compute() wires correctly to computePodProfit,
 * and exercises hand-verified examples through the full config path.
 *
 * Spring (formerly Teespring) model (verified 2026-06-15):
 *   - NO platform commission. Spring's service fee is included in the base cost
 *     of the products — sellers do NOT pay a separate commission %.
 *   - Profit = retail price − base cost (Spring pays out the difference).
 *   - Shipping: Spring charges buyers separately for shipping at checkout.
 *     For sellers modelling shipping-inclusive pricing, the optional fields
 *     allow entering a shipping charge to the customer.
 *   Sources:
 *     https://spring4creators.zendesk.com/hc/en-us/articles/17959394635149
 *     https://spring4creators.zendesk.com/hc/en-us/articles/12423741560589
 */
import { describe, it, expect } from "vitest";
import { teespringProfitCalculator } from "./config";

/** Minimal ComputeCtx stub for testing. */
const ctx = {
  country: "US" as const,
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatPercent: (v: number) => `${v}%`,
  formatNumber: (v: number) => String(v),
};

describe("teespringProfitCalculator.compute()", () => {
  it("hand-verified: retail $24, base cost $10, no shipping fields — profit $14", () => {
    // Spring's own worked example: base $10, sell at $24 → keep $14
    // Margin: 14 / 24 * 100 = 58.33%
    const result = teespringProfitCalculator.compute(
      {
        retailPrice: 24,
        shippingCharged: 0,
        productCost: 10,
        shippingCost: 0,
        quantity: 1,
      },
      ctx,
    );

    expect(result.headline.label.toLowerCase()).toContain("profit");
    expect(result.headline.display).toBe("$14.00");
    expect(result.headline.sub).toContain("58.33");

    const rows = "rows" in result ? result.rows : [];
    const revenueRow = rows.find((r) => r.label.toLowerCase().includes("revenue"));
    expect(revenueRow?.display).toBe("$24.00");
  });

  it("retail $22, base cost $11, qty 1 — profit $11", () => {
    // Simple case with default inputs
    const result = teespringProfitCalculator.compute(
      {
        retailPrice: 22,
        shippingCharged: 0,
        productCost: 11,
        shippingCost: 0,
        quantity: 1,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$11.00");
  });

  it("loss scenario: base cost exceeds retail — profit is negative", () => {
    // Retail $8, base $12 → profit -$4
    const result = teespringProfitCalculator.compute(
      {
        retailPrice: 8,
        shippingCharged: 0,
        productCost: 12,
        shippingCost: 0,
        quantity: 1,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$-4.00");
  });

  it("quantity > 1 scales correctly", () => {
    // Retail $24, base $10, qty 5 → profit $14 * 5 = $70
    const result = teespringProfitCalculator.compute(
      {
        retailPrice: 24,
        shippingCharged: 0,
        productCost: 10,
        shippingCost: 0,
        quantity: 5,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$70.00");
  });

  it("shipping charged to customer adds to revenue and profit", () => {
    // Retail $22, shipping charged $4, base $11, shipping cost $0
    // Revenue: $26, cost: $11, profit: $15
    const result = teespringProfitCalculator.compute(
      {
        retailPrice: 22,
        shippingCharged: 4,
        productCost: 11,
        shippingCost: 0,
        quantity: 1,
      },
      ctx,
    );
    expect(result.headline.display).toBe("$15.00");
    const rows = "rows" in result ? result.rows : [];
    const revenueRow = rows.find((r) => r.label.toLowerCase().includes("revenue"));
    expect(revenueRow?.display).toBe("$26.00");
  });

  it("zero base cost — all retail is profit", () => {
    const result = teespringProfitCalculator.compute(
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
