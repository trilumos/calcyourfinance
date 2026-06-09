/**
 * PayPal fee math — PURE, fully unit-tested.
 * PayPal charges a percentage + fixed fee per commercial transaction, with the
 * percentage varying by product (Checkout / Goods & Services / Micropayments)
 * and an extra surcharge for cross-border (international) payments.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface PayPalFeeInput {
  amount: number;
  mode: "charge" | "net";
  percent: number; // selected variant's %
  fixed: number; // selected variant's fixed fee
  crossBorderPercent?: number; // extra % for international senders
  conversionPercent?: number; // extra % when currency conversion applies
  international?: boolean;
}

export interface PayPalFeeBreakdown {
  ratePercent: number;
  charge: number;
  feeAmount: number;
  net: number;
  effectiveRate: number;
}

export function computePayPalFee(input: PayPalFeeInput): PayPalFeeBreakdown {
  const {
    amount,
    mode,
    percent,
    fixed,
    crossBorderPercent = 0,
    conversionPercent = 0,
    international = false,
  } = input;

  const ratePercent =
    percent + (international ? crossBorderPercent : 0) + conversionPercent;
  const r = ratePercent / 100;

  if (!Number.isFinite(amount) || amount <= 0 || r >= 1) {
    return { ratePercent: roundTo(ratePercent, 3), charge: 0, feeAmount: 0, net: 0, effectiveRate: 0 };
  }

  let charge: number;
  let net: number;
  if (mode === "net") {
    charge = roundMoney((amount + fixed) / (1 - r));
    net = amount;
  } else {
    charge = amount;
    net = roundMoney(charge - (charge * r + fixed));
  }

  const feeAmount = roundMoney(charge - net);
  const effectiveRate = charge > 0 ? roundTo((feeAmount / charge) * 100, 2) : 0;

  return {
    ratePercent: roundTo(ratePercent, 3),
    charge: roundMoney(charge),
    feeAmount,
    net: roundMoney(net),
    effectiveRate,
  };
}
