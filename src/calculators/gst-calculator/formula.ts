/**
 * GST / VAT / sales-tax add-or-remove math. Pure, rounded to cents.
 */
import { roundMoney } from "../../lib/money";

export interface GstResult {
  /** Amount before tax. */
  base: number;
  /** The GST / tax amount. */
  gstAmount: number;
  /** Amount including tax. */
  total: number;
}

/**
 * @param amount      In "add" mode this is the pre-tax (net) amount; in
 *                    "remove" mode it is the tax-inclusive (gross) amount.
 * @param ratePercent GST rate as a percentage (e.g. 18 for 18%).
 * @param mode        "add" → add GST on top; "remove" → strip GST out of a
 *                    GST-inclusive amount.
 */
export function computeGst(
  amount: number,
  ratePercent: number,
  mode: "add" | "remove",
): GstResult {
  const a = isFinite(amount) && amount > 0 ? amount : 0;
  const r = isFinite(ratePercent) && ratePercent >= 0 ? ratePercent : 0;

  if (a === 0) return { base: 0, gstAmount: 0, total: 0 };

  if (mode === "remove") {
    const base = a / (1 + r / 100);
    return {
      base: roundMoney(base),
      gstAmount: roundMoney(a - base),
      total: roundMoney(a),
    };
  }

  const gstAmount = a * (r / 100);
  return {
    base: roundMoney(a),
    gstAmount: roundMoney(gstAmount),
    total: roundMoney(a + gstAmount),
  };
}
