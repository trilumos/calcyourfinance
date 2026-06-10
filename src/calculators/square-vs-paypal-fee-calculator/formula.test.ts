import { describe, it, expect } from "vitest";
import { compareSquarePaypal } from "./formula";

/** Composition + verdict only — Square on its online rate vs the chosen PayPal product. */
describe("compareSquarePaypal", () => {
  it("US $100: Square online (3.3% + $0.30) beats PayPal Checkout (3.49% + $0.49)", () => {
    const r = compareSquarePaypal({
      amount: 100,
      mode: "charge",
      square: { percent: 3.3, fixed: 0.3 },
      paypal: { percent: 3.49, fixed: 0.49 },
    });
    expect(r.square.net).toBe(96.4);
    expect(r.paypal.net).toBe(96.02);
    expect(r.winner).toBe("square");
    expect(r.savings).toBe(0.38);
  });

  it("small $5 sale flips to PayPal micropayments (low fixed fee)", () => {
    const r = compareSquarePaypal({
      amount: 5,
      mode: "charge",
      square: { percent: 3.3, fixed: 0.3 },
      paypal: { percent: 4.99, fixed: 0.09 },
    });
    expect(r.square.net).toBe(4.54);
    expect(r.paypal.net).toBe(4.66);
    expect(r.winner).toBe("paypal");
    expect(r.savings).toBe(0.12);
  });

  it("identical rates → tie", () => {
    const r = compareSquarePaypal({
      amount: 100,
      mode: "charge",
      square: { percent: 2.9, fixed: 0.3 },
      paypal: { percent: 2.9, fixed: 0.3 },
    });
    expect(r.winner).toBe("tie");
    expect(r.savings).toBe(0);
  });

  it("reverse mode: both gross up to net $100; lower charge (Square) wins", () => {
    const r = compareSquarePaypal({
      amount: 100,
      mode: "net",
      square: { percent: 3.3, fixed: 0.3 },
      paypal: { percent: 3.49, fixed: 0.49 },
    });
    expect(r.square.net).toBe(100);
    expect(r.paypal.net).toBe(100);
    expect(r.square.charge).toBe(103.72);
    expect(r.paypal.charge).toBe(104.12);
    expect(r.winner).toBe("square");
    expect(r.savings).toBe(0.4);
  });

  it("foreign card applies each platform's surcharge (Canada)", () => {
    const r = compareSquarePaypal({
      amount: 100,
      mode: "charge",
      international: true,
      square: { percent: 2.8, fixed: 0.3, intlSurcharge: 1.5 },
      paypal: { percent: 2.9, fixed: 0.3, crossBorderPercent: 1.0 },
    });
    expect(r.square.ratePercent).toBe(4.3); // 2.8 + 1.5
    expect(r.paypal.ratePercent).toBe(3.9); // 2.9 + 1.0
    expect(r.winner).toBe("paypal");
  });
});
