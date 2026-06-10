/**
 * Square fee math — PURE, fully unit-tested.
 * total% = base + (foreign-card surcharge); plus a per-transaction fixed fee
 * (zero in AU/JP). Some regions levy a tax on the fee itself (e.g. 23% Irish
 * VAT) — modeled via taxOnFeePercent, exactly like India GST on Stripe.
 *
 *   "charge" → you charge `amount`; we return the fee + what you net.
 *   "net"    → you want to RECEIVE `amount`; we return what to charge.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface SquareFeeInput {
  amount: number;
  mode: "charge" | "net";
  percent: number;
  fixed: number;
  intlSurcharge?: number; // extra % for foreign cards (online card-not-present)
  taxOnFeePercent?: number; // tax on the fee itself (e.g. Irish VAT 23%)
  international?: boolean;
}

export interface SquareFeeBreakdown {
  ratePercent: number;
  charge: number;
  processingFee: number;
  taxOnFee: number;
  totalFee: number;
  net: number;
  effectiveRate: number;
}

export function computeSquareFee(input: SquareFeeInput): SquareFeeBreakdown {
  const {
    amount,
    mode,
    percent,
    fixed,
    intlSurcharge = 0,
    taxOnFeePercent = 0,
    international = false,
  } = input;

  const ratePercent = percent + (international ? intlSurcharge : 0);
  const r = ratePercent / 100;
  const tf = taxOnFeePercent / 100;

  const zero: SquareFeeBreakdown = {
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
