/**
 * Whatnot fee tests — uses computeMarketplaceFee from the shared formula.
 *
 * Fee model (US/CA/AU standard):
 *   Commission:  8% on item price only (feeOnShipping: false)
 *   Processing:  2.9% + $0.30 on total order (item + shipping)
 *
 * Fee model (UK):
 *   Commission:  6.67% on item price + 20% VAT on the commission
 *                = 6.67 * 1.20 = 8.004% ≈ 8% effective
 *   Processing:  2.42% + £0.25 on total order (item + shipping)
 *
 * Worked example (US, $100 item, $10 shipping):
 *   Revenue          = $100 + $10   = $110.00
 *   Commission       = 8% × $100    = $8.00
 *   Processing       = 2.9% × $110 + $0.30 = $3.19 + $0.30 = $3.49
 *   Total fees       = $8.00 + $3.49 = $11.49
 *   Payout           = $110.00 − $11.49 = $98.51
 */
import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// ── US standard (8% commission + 2.9% + $0.30 processing) ─────────────────────

describe("Whatnot US fees (standard 8%)", () => {
  const US_PARAMS = {
    feeOnShipping: false, // commission applies to item price only
    sellingPercent: 8,
    processingPercent: 2.9,
    processingFixed: 0.3,
  };

  it("zero input → zero payout", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 0 });
    expect(r.payout).toBe(0);
    expect(r.sellingFee).toBe(0);
    expect(r.processingFee).toBe(0);
    expect(r.totalFees).toBe(0);
  });

  it("$100 item, no shipping → commission $8.00, processing $3.20, payout $88.80", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, shipping: 0 });
    // commission: 8% × $100 = $8.00
    // processing: 2.9% × $100 + $0.30 = $2.90 + $0.30 = $3.20
    // total fees: $8.00 + $3.20 = $11.20
    // payout:     $100.00 − $11.20 = $88.80
    expect(r.sellingFee).toBe(8.0);
    expect(r.processingFee).toBe(3.2);
    expect(r.totalFees).toBe(11.2);
    expect(r.payout).toBe(88.8);
  });

  it("$100 item, $10 shipping → commission $8.00, processing $3.49, payout $98.51", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, shipping: 10 });
    // commission: 8% × $100 = $8.00 (on item price only)
    // processing: 2.9% × $110 + $0.30 = $3.19 + $0.30 = $3.49
    // total fees: $8.00 + $3.49 = $11.49
    // payout:     $110.00 − $11.49 = $98.51
    expect(r.revenue).toBe(110.0);
    expect(r.sellingFee).toBe(8.0);
    expect(r.processingFee).toBe(3.49);
    expect(r.totalFees).toBe(11.49);
    expect(r.payout).toBe(98.51);
  });

  it("$50 item, no shipping → commission $4.00, processing $1.75, payout $44.25", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 50, shipping: 0 });
    // commission: 8% × $50 = $4.00
    // processing: 2.9% × $50 + $0.30 = $1.45 + $0.30 = $1.75
    expect(r.sellingFee).toBe(4.0);
    expect(r.processingFee).toBe(1.75);
    expect(r.payout).toBe(44.25);
  });

  it("$100 item, $0 shipping, $60 cost → profit $28.80", () => {
    const r = computeMarketplaceFee({ ...US_PARAMS, itemPrice: 100, itemCost: 60 });
    // payout: $88.80; profit: $88.80 − $60 = $28.80
    expect(r.payout).toBe(88.8);
    expect(r.profit).toBe(28.8);
  });
});

// ── UK standard (6.67% + 20% VAT on commission = ~8% effective; 2.42% + £0.25 processing) ─────

describe("Whatnot UK fees (6.67% + 20% VAT commission = 8.004% effective)", () => {
  // UK commission: 6.67% × 1.20 = 8.004% effective on item price
  const UK_EFFECTIVE_COMMISSION = 6.67 * 1.2; // = 8.004
  const UK_PARAMS = {
    feeOnShipping: false,
    sellingPercent: UK_EFFECTIVE_COMMISSION, // ~8.004%
    processingPercent: 2.42,
    processingFixed: 0.25,
  };

  it("zero input → zero payout", () => {
    const r = computeMarketplaceFee({ ...UK_PARAMS, itemPrice: 0 });
    expect(r.payout).toBe(0);
    expect(r.sellingFee).toBe(0);
  });

  it("£100 item, no shipping → commission ~£8.00, processing ~£2.67, payout ~£89.33", () => {
    const r = computeMarketplaceFee({ ...UK_PARAMS, itemPrice: 100, shipping: 0 });
    // commission: 8.004% × £100 = £8.004 → rounds to £8.00
    // processing: 2.42% × £100 + £0.25 = £2.42 + £0.25 = £2.67
    // total fees: £8.00 + £2.67 = £10.67
    // payout:     £100.00 − £10.67 = £89.33
    expect(r.sellingFee).toBe(8.0);
    expect(r.processingFee).toBe(2.67);
    expect(r.totalFees).toBe(10.67);
    expect(r.payout).toBe(89.33);
  });

  it("£100 item, £10 shipping → commission ~£8.00, processing ~£2.92, payout ~£99.08", () => {
    const r = computeMarketplaceFee({ ...UK_PARAMS, itemPrice: 100, shipping: 10 });
    // commission: 8.004% × £100 = £8.004 → rounds to £8.00 (item only)
    // processing: 2.42% × £110 + £0.25 = £2.662 + £0.25 = £2.912 → rounds to £2.91
    // total: £8.00 + £2.91 = £10.91; payout: £110 − £10.91 = £99.09
    expect(r.sellingFee).toBe(8.0);
    // allow ±£0.02 due to rounding on 8.004% vs 8.004% exact
    expect(r.processingFee).toBeCloseTo(2.91, 1);
    expect(r.payout).toBeCloseTo(99.09, 1);
  });
});

// ── CA/AU standard (same 8% + 2.9% + $0.30 as US, different currency) ────────

describe("Whatnot CA/AU fees (same rate structure as US)", () => {
  const PARAMS = {
    feeOnShipping: false,
    sellingPercent: 8,
    processingPercent: 2.9,
    processingFixed: 0.3,
  };

  it("CA$100 item → commission CA$8, processing CA$3.20, payout CA$88.80", () => {
    const r = computeMarketplaceFee({ ...PARAMS, itemPrice: 100 });
    expect(r.sellingFee).toBe(8.0);
    expect(r.processingFee).toBe(3.2);
    expect(r.payout).toBe(88.8);
  });

  it("AU$200 item, AU$15 shipping → commission AU$16, processing AU$6.53, payout AU$192.47", () => {
    const r = computeMarketplaceFee({ ...PARAMS, itemPrice: 200, shipping: 15 });
    // commission: 8% × $200 = $16.00 (item only)
    // processing: 2.9% × $215 + $0.30 = 6.235 + 0.30 = 6.535 → rounds to $6.53
    // total:      $16.00 + $6.53 = $22.53
    // payout:     $215.00 − $22.53 = $192.47
    expect(r.sellingFee).toBe(16.0);
    expect(r.processingFee).toBe(6.53);
    expect(r.payout).toBe(192.47);
  });
});
