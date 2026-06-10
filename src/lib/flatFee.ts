/**
 * Shared fee math for flat-rate processors: percentage + fixed fee, with an
 * optional extra surcharge % and an optional tax-on-fee (e.g. 18% GST). PURE
 * and unit-tested here, so flat processors (Cash App, Venmo, Razorpay, …) don't
 * each need a near-identical formula file. charge ↔ net both directions.
 */
import { roundMoney, roundTo } from "./money";

export interface FlatFeeInput {
  amount: number;
  mode: "charge" | "net";
  percent: number;
  fixed: number;
  /** Any extra % already resolved by the caller (surcharge, etc.). */
  extraPercent?: number;
  /** Tax levied on the fee itself (e.g. 18% GST). */
  taxOnFeePercent?: number;
}

export interface FlatFeeBreakdown {
  ratePercent: number;
  charge: number;
  processingFee: number;
  taxOnFee: number;
  totalFee: number;
  net: number;
  effectiveRate: number;
}

export function computeFlatFee(input: FlatFeeInput): FlatFeeBreakdown {
  const { amount, mode, percent, fixed, extraPercent = 0, taxOnFeePercent = 0 } = input;

  const ratePercent = percent + extraPercent;
  const r = ratePercent / 100;
  const tf = taxOnFeePercent / 100;

  const zero: FlatFeeBreakdown = {
    ratePercent: roundTo(ratePercent, 3),
    charge: 0,
    processingFee: 0,
    taxOnFee: 0,
    totalFee: 0,
    net: 0,
    effectiveRate: 0,
  };
  if (!Number.isFinite(amount) || amount <= 0 || r * (1 + tf) >= 1) return zero;

  const charge = mode === "net" ? (amount + fixed * (1 + tf)) / (1 - r * (1 + tf)) : amount;

  const processingFee = charge * r + fixed;
  const taxOnFee = processingFee * tf;
  const totalFee = processingFee + taxOnFee;
  const net = charge - totalFee;
  const effectiveRate = charge > 0 ? roundTo((totalFee / charge) * 100, 2) : 0;

  return {
    ratePercent: roundTo(ratePercent, 3),
    charge: roundMoney(charge),
    processingFee: roundMoney(processingFee),
    taxOnFee: roundMoney(taxOnFee),
    totalFee: roundMoney(totalFee),
    net: roundMoney(net),
    effectiveRate,
  };
}
