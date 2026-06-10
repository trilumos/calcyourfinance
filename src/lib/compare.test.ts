import { describe, it, expect } from "vitest";
import { compareFlat } from "./compare";

/** Flat-vs-flat comparison verdict (used by PayPal vs Venmo, Cash App vs PayPal, etc.). */
describe("compareFlat", () => {
  const PAYPAL_GS = { percent: 2.99, fixed: 0.49 };
  const VENMO_BIZ = { percent: 1.9, fixed: 0.1 };
  const CASHAPP_BIZ = { percent: 2.75, fixed: 0 };

  it("PayPal G&S vs Venmo business on $100: Venmo (b) wins", () => {
    const r = compareFlat(100, "charge", PAYPAL_GS, VENMO_BIZ);
    expect(r.a.net).toBe(96.52); // PayPal 2.99% + $0.49
    expect(r.b.net).toBe(98); // Venmo 1.9% + $0.10
    expect(r.winner).toBe("b");
    expect(r.savings).toBe(1.48);
  });

  it("Cash App vs PayPal G&S on $100: Cash App (a) wins", () => {
    const r = compareFlat(100, "charge", CASHAPP_BIZ, PAYPAL_GS);
    expect(r.a.net).toBe(97.25); // Cash App 2.75%
    expect(r.b.net).toBe(96.52); // PayPal
    expect(r.winner).toBe("a");
    expect(r.savings).toBe(0.73);
  });

  it("identical rates → tie", () => {
    const r = compareFlat(100, "charge", VENMO_BIZ, VENMO_BIZ);
    expect(r.winner).toBe("tie");
    expect(r.savings).toBe(0);
  });

  it("reverse mode: lower required charge wins (Venmo over Cash App to net $100)", () => {
    const r = compareFlat(100, "net", CASHAPP_BIZ, VENMO_BIZ);
    expect(r.a.charge).toBe(102.83); // Cash App: 100 / (1 − 2.75%)
    expect(r.b.charge).toBe(102.04); // Venmo: (100 + 0.10) / (1 − 1.9%)
    expect(r.winner).toBe("b");
    expect(r.savings).toBe(0.79);
  });
});
