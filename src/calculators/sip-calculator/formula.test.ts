/**
 * SIP calculator formula tests.
 * The core sipFutureValue logic is tested exhaustively in
 * src/calculators/_shared/finance.test.ts.
 * This file tests the formula re-export to ensure the module boundary works.
 */

import { describe, it, expect } from "vitest";
import { sipFutureValue } from "./formula";

describe("sipFutureValue (via formula re-export)", () => {
  it("standard case -- Rs 10,000/mo, 12%, 120 months", () => {
    const result = sipFutureValue(10000, 12, 120);
    expect(result.futureValue).toBe(2323390.76);
    expect(result.totalInvested).toBe(1200000);
    expect(result.estimatedReturns).toBe(1123390.76);
  });
});
