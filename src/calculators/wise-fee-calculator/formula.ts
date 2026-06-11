/**
 * Wise (ex-TransferWise) transfer fee — PURE.
 * Wise charges fixed + (% × send amount) in the SOURCE currency, then converts
 * the remaining amount at the mid-market rate (no FX markup). This computes the
 * FEE and the amount that gets converted; the live exchange rate is deliberately
 * out of scope (it moves constantly, so we never present a stale rate as fact).
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface WiseFeeInput {
  amount: number; // amount being sent, in the source currency
  pct: number; // corridor variable %
  fixed: number; // corridor fixed fee, in the source currency
}

export interface WiseFeeBreakdown {
  fee: number; // total Wise fee in the source currency
  converted: number; // amount − fee (this is converted at the mid-market rate)
  effectiveRate: number; // fee as a % of the amount sent
}

export function computeWiseFee(input: WiseFeeInput): WiseFeeBreakdown {
  const { amount, pct, fixed } = input;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { fee: 0, converted: 0, effectiveRate: 0 };
  }
  const fee = roundMoney(fixed + (pct / 100) * amount);
  const converted = roundMoney(amount - fee);
  const effectiveRate = roundTo((fee / amount) * 100, 2);
  return { fee, converted, effectiveRate };
}
