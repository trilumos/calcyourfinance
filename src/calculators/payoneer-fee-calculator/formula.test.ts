import { describe, it, expect } from "vitest";
import { computePayoneerFee } from "./formula";

/**
 * Payoneer's RECEIVING fee (% + fixed by method), plus an optional 0.5% balance
 * conversion. Withdrawal (flat $1.50 same-currency, or 1.2–4% with conversion)
 * is explained in copy, not computed — it's a range Payoneer doesn't publish per
 * route, so we don't fake precision.
 */
describe("computePayoneerFee", () => {
  it("client pays by card: $1,000 at 3.99% + $0.49 → $40.39 fee", () => {
    const r = computePayoneerFee({ amount: 1000, receivePercent: 3.99, receiveFixed: 0.49 });
    expect(r.receivingFee).toBe(40.39);
    expect(r.net).toBe(959.61);
    expect(r.effectiveRate).toBe(4.04);
  });

  it("ACH bank debit: $1,000 at 1% → $10.00 fee, $990 net", () => {
    const r = computePayoneerFee({ amount: 1000, receivePercent: 1, receiveFixed: 0 });
    expect(r.receivingFee).toBe(10);
    expect(r.net).toBe(990);
  });

  it("card + 0.5% currency conversion stacks correctly", () => {
    const r = computePayoneerFee({
      amount: 1000, receivePercent: 3.99, receiveFixed: 0.49,
      conversion: true, conversionPercent: 0.5,
    });
    expect(r.receivingFee).toBe(40.39);
    expect(r.conversionFee).toBe(4.8); // 0.5% of (1000 − 40.39)
    expect(r.totalFee).toBe(45.19);
    expect(r.net).toBe(954.81);
  });

  it("local-currency / Payoneer-to-Payoneer is free", () => {
    const r = computePayoneerFee({ amount: 1000, receivePercent: 0, receiveFixed: 0 });
    expect(r.totalFee).toBe(0);
    expect(r.net).toBe(1000);
  });

  it("zero amount returns zeros", () => {
    const r = computePayoneerFee({ amount: 0, receivePercent: 3.99, receiveFixed: 0.49 });
    expect(r.net).toBe(0);
    expect(r.totalFee).toBe(0);
  });
});
