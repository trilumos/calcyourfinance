import { describe, it, expect } from "vitest";
import { compareWisePaypal } from "./formula";

/**
 * Wise vs PayPal for sending money abroad. Wise = explicit fee at the mid-market
 * rate. PayPal = capped 5% transfer fee ($4.99 max) + a 4% FX markup hidden in a
 * worse rate. Cost comparison (no live rate needed); higher net wins.
 */
const PAYPAL = { sendFeePercent: 5, sendFeeMin: 0.99, sendFeeMax: 4.99, fxMarkupPercent: 4 };

describe("compareWisePaypal", () => {
  it("$1,000 USD→EUR: Wise ($9.87) crushes PayPal ($44.99)", () => {
    const r = compareWisePaypal({ amount: 1000, wise: { pct: 0.289, fixed: 6.98 }, paypal: PAYPAL });
    expect(r.wise.fee).toBe(9.87);
    expect(r.paypal.sendFee).toBe(4.99); // 5% capped at $4.99
    expect(r.paypal.fxCost).toBe(40); // 4% of 1000
    expect(r.paypal.fee).toBe(44.99);
    expect(r.winner).toBe("wise");
    expect(r.savings).toBe(35.12); // 44.99 − 9.87
  });

  it("small $50 transfer flips to PayPal (Wise's fixed fee dominates)", () => {
    const r = compareWisePaypal({ amount: 50, wise: { pct: 0.289, fixed: 6.98 }, paypal: PAYPAL });
    expect(r.wise.fee).toBe(7.12); // 6.98 + 0.289% of 50
    expect(r.paypal.sendFee).toBe(2.5); // 5% of 50, under the cap
    expect(r.paypal.fee).toBe(4.5); // 2.50 + 2.00 FX
    expect(r.winner).toBe("paypal");
    expect(r.savings).toBe(2.62);
  });

  it("$200: send fee already capped; Wise wins", () => {
    const r = compareWisePaypal({ amount: 200, wise: { pct: 0.289, fixed: 6.98 }, paypal: PAYPAL });
    expect(r.paypal.sendFee).toBe(4.99); // 5% of 200 = 10 → capped
    expect(r.paypal.fee).toBe(12.99); // 4.99 + 8.00
    expect(r.wise.fee).toBe(7.56); // 6.98 + 0.578
    expect(r.winner).toBe("wise");
    expect(r.savings).toBe(5.43);
  });

  it("zero amount → tie, zeros", () => {
    const r = compareWisePaypal({ amount: 0, wise: { pct: 0.289, fixed: 6.98 }, paypal: PAYPAL });
    expect(r.winner).toBe("tie");
    expect(r.wise.fee).toBe(0);
    expect(r.paypal.fee).toBe(0);
  });
});
