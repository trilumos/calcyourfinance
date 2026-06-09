import { describe, it, expect } from "vitest";
import { compareFees } from "./formula";

/**
 * The comparison adds no NEW arithmetic — computeStripeFee / computePayPalFee
 * are already unit-tested. These tests pin the COMPOSITION + verdict logic:
 * winner selection, ties, reverse-mode parity, and surcharge pass-through.
 */
describe("compareFees", () => {
  const US_STRIPE = { percent: 2.9, fixed: 0.3, intlSurcharge: 1.5, fxPercent: 1 };
  const US_PAYPAL_CHECKOUT = { percent: 3.49, fixed: 0.49, crossBorderPercent: 1.5, conversionPercent: 3 };

  it("charge mode: on $100 US (Checkout) Stripe keeps more → Stripe wins", () => {
    const r = compareFees({
      amount: 100,
      mode: "charge",
      stripe: US_STRIPE,
      paypal: US_PAYPAL_CHECKOUT,
    });
    expect(r.stripe.net).toBe(96.8); // 100 − (2.9% + $0.30)
    expect(r.paypal.net).toBe(96.02); // 100 − (3.49% + $0.49)
    expect(r.winner).toBe("stripe");
    expect(r.savings).toBe(0.78); // 96.80 − 96.02
  });

  it("charge mode: small $5 sale flips to PayPal micropayments (low fixed fee)", () => {
    const r = compareFees({
      amount: 5,
      mode: "charge",
      stripe: US_STRIPE,
      paypal: { percent: 4.99, fixed: 0.09 }, // micropayments
    });
    expect(r.stripe.net).toBe(4.56); // 5 − (2.9% + $0.30)
    expect(r.paypal.net).toBe(4.66); // 5 − (4.99% + $0.09)
    expect(r.winner).toBe("paypal");
    expect(r.savings).toBe(0.1);
  });

  it("identical rates → tie (no misleading 'cheaper by $0.00')", () => {
    const r = compareFees({
      amount: 100,
      mode: "charge",
      stripe: { percent: 3, fixed: 0.3 },
      paypal: { percent: 3, fixed: 0.3 },
    });
    expect(r.winner).toBe("tie");
    expect(r.savings).toBe(0);
  });

  it("reverse mode: both gross up to net $100; lower charge (Stripe) wins", () => {
    const r = compareFees({
      amount: 100,
      mode: "net",
      stripe: US_STRIPE,
      paypal: US_PAYPAL_CHECKOUT,
    });
    expect(r.stripe.net).toBe(100);
    expect(r.paypal.net).toBe(100);
    expect(r.stripe.charge).toBe(103.3); // (100 + 0.30) / (1 − 2.9%)
    expect(r.paypal.charge).toBe(104.12); // (100 + 0.49) / (1 − 3.49%)
    expect(r.winner).toBe("stripe");
    expect(r.savings).toBe(0.82); // 104.12 − 103.30
  });

  it("international + conversion surcharges apply to BOTH platforms", () => {
    const r = compareFees({
      amount: 100,
      mode: "charge",
      international: true,
      conversion: true,
      stripe: US_STRIPE,
      paypal: US_PAYPAL_CHECKOUT,
    });
    expect(r.stripe.ratePercent).toBe(5.4); // 2.9 + 1.5 + 1
    expect(r.paypal.ratePercent).toBe(7.99); // 3.49 + 1.5 + 3
    expect(r.winner).toBe("stripe");
  });

  it("conversion is NOT applied to PayPal when the toggle is off", () => {
    const r = compareFees({
      amount: 100,
      mode: "charge",
      conversion: false,
      stripe: US_STRIPE,
      paypal: US_PAYPAL_CHECKOUT,
    });
    expect(r.paypal.ratePercent).toBe(3.49); // no +3 conversion
  });

  it("zero amount → tie with zero savings", () => {
    const r = compareFees({
      amount: 0,
      mode: "charge",
      stripe: US_STRIPE,
      paypal: US_PAYPAL_CHECKOUT,
    });
    expect(r.winner).toBe("tie");
    expect(r.savings).toBe(0);
  });
});
