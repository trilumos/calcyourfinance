/**
 * Printful profit calculator — formula integration test.
 * Verifies that the config's compute() wires correctly to computePodProfit,
 * and exercises the hand-verified worked example through the full config path.
 */
import { describe, it, expect } from "vitest";
import { printfulProfitCalculator } from "./config";

/** Minimal ComputeCtx stub for testing. */
const ctx = {
  country: "US" as const,
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatPercent: (v: number) => `${v}%`,
  formatNumber: (v: number) => String(v),
};

describe("printfulProfitCalculator.compute()", () => {
  it("hand-verified: retail $25, productCost $12.50, shippingCost $4.99, qty 1", () => {
    const result = printfulProfitCalculator.compute(
      {
        retailPrice: 25,
        shippingCharged: 0,
        productCost: 12.5,
        shippingCost: 4.99,
        quantity: 1,
      },
      ctx
    );

    // Headline should show the profit
    expect(result.headline.label.toLowerCase()).toContain("profit");
    expect(result.headline.display).toBe("$7.51");

    // Sub should mention the margin
    expect(result.headline.sub).toContain("30.04");

    // Rows: check revenue and totalCost appear
    const rows = "rows" in result ? result.rows : [];
    const revenueRow = rows.find((r) => r.label.toLowerCase().includes("revenue"));
    expect(revenueRow?.display).toBe("$25.00");
  });

  it("loss scenario: productCost exceeds retail — profit is negative", () => {
    const result = printfulProfitCalculator.compute(
      {
        retailPrice: 10,
        shippingCharged: 0,
        productCost: 15,
        shippingCost: 0,
        quantity: 1,
      },
      ctx
    );
    // Stub formatCurrency: `$${v.toFixed(2)}` → "$-5.00" for negatives (sign after symbol)
    expect(result.headline.display).toBe("$-5.00");
  });

  it("quantity > 1 scales correctly", () => {
    const result = printfulProfitCalculator.compute(
      {
        retailPrice: 25,
        shippingCharged: 0,
        productCost: 12.5,
        shippingCost: 4.99,
        quantity: 3,
      },
      ctx
    );
    expect(result.headline.display).toBe("$22.53");
  });
});
