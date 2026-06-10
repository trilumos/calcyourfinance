import { describe, it, expect } from "vitest";
import { compareStripeSquare } from "./formula";

/**
 * Composition + verdict only — the two underlying formulas are already tested.
 * Both compared on their ONLINE card rate (apples-to-apples).
 */
describe("compareStripeSquare", () => {
  it("US online $100: Stripe (2.9% + $0.30) beats Square (3.3% + $0.30)", () => {
    const r = compareStripeSquare({
      amount: 100,
      mode: "charge",
      stripe: { percent: 2.9, fixed: 0.3 },
      square: { percent: 3.3, fixed: 0.3 },
    });
    expect(r.stripe.net).toBe(96.8);
    expect(r.square.net).toBe(96.4);
    expect(r.winner).toBe("stripe");
    expect(r.savings).toBe(0.4);
  });

  it("UK $100: Square (1.4% + £0.25) edges Stripe (1.5% + £0.20)", () => {
    const r = compareStripeSquare({
      amount: 100,
      mode: "charge",
      stripe: { percent: 1.5, fixed: 0.2 },
      square: { percent: 1.4, fixed: 0.25 },
    });
    expect(r.stripe.net).toBe(98.3);
    expect(r.square.net).toBe(98.35);
    expect(r.winner).toBe("square");
    expect(r.savings).toBe(0.05);
  });

  it("identical rates → tie", () => {
    const r = compareStripeSquare({
      amount: 100,
      mode: "charge",
      stripe: { percent: 2.5, fixed: 0.3 },
      square: { percent: 2.5, fixed: 0.3 },
    });
    expect(r.winner).toBe("tie");
    expect(r.savings).toBe(0);
  });

  it("reverse mode: both gross up to net $100; lower charge (Stripe) wins", () => {
    const r = compareStripeSquare({
      amount: 100,
      mode: "net",
      stripe: { percent: 2.9, fixed: 0.3 },
      square: { percent: 3.3, fixed: 0.3 },
    });
    expect(r.stripe.net).toBe(100);
    expect(r.square.net).toBe(100);
    expect(r.stripe.charge).toBe(103.3);
    expect(r.square.charge).toBe(103.72);
    expect(r.winner).toBe("stripe");
    expect(r.savings).toBe(0.42);
  });

  it("foreign card applies each platform's surcharge", () => {
    const r = compareStripeSquare({
      amount: 100,
      mode: "charge",
      international: true,
      stripe: { percent: 2.9, fixed: 0.3, intlSurcharge: 0.8 },
      square: { percent: 2.8, fixed: 0.3, intlSurcharge: 1.5 },
    });
    expect(r.stripe.ratePercent).toBe(3.7); // 2.9 + 0.8
    expect(r.square.ratePercent).toBe(4.3); // 2.8 + 1.5
    expect(r.winner).toBe("stripe");
  });
});
