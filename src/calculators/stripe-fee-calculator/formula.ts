/**
 * Stripe fee math — PURE, no config imports, fully unit-tested.
 * total% = base + (international surcharge) + (currency-conversion surcharge),
 * plus a fixed per-charge fee. Some countries also levy a tax on the fee
 * itself (e.g. 18% GST in India) — modeled via taxOnFeePercent.
 *
 * Two directions:
 *   "charge" → you charge `amount`; we return the fee + what you net.
 *   "net"    → you want to RECEIVE `amount`; we return what to charge.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface StripeFeeInput {
  amount: number;
  mode: "charge" | "net";
  percent: number; // base domestic %
  fixed: number; // fixed fee in country currency
  intlSurcharge?: number; // extra % for international cards
  fxPercent?: number; // extra % when currency conversion applies
  addOnPercent?: number; // extra % from add-ons (Billing 0.7%, Invoicing 0.4%)
  taxOnFeePercent?: number; // tax levied on the fee itself (e.g. India GST 18%)
  international?: boolean;
  conversion?: boolean;
}

export interface StripeFeeBreakdown {
  /** Total % rate applied (base + surcharges), before tax-on-fee. */
  ratePercent: number;
  /** Gross amount charged to the customer. */
  charge: number;
  /** Stripe processing fee (before tax). */
  processingFee: number;
  /** Tax charged on the fee (e.g. GST). 0 when not applicable. */
  taxOnFee: number;
  /** processingFee + taxOnFee. */
  totalFee: number;
  /** Amount you keep. */
  net: number;
  /** Total fee as a % of the charge (the "effective rate"). */
  effectiveRate: number;
}

export function computeStripeFee(input: StripeFeeInput): StripeFeeBreakdown {
  const {
    amount,
    mode,
    percent,
    fixed,
    intlSurcharge = 0,
    fxPercent = 0,
    addOnPercent = 0,
    taxOnFeePercent = 0,
    international = false,
    conversion = false,
  } = input;

  const ratePercent =
    percent +
    (international ? intlSurcharge : 0) +
    (conversion ? fxPercent : 0) +
    addOnPercent;
  const r = ratePercent / 100;
  const tf = taxOnFeePercent / 100;

  const zero: StripeFeeBreakdown = {
    ratePercent: roundTo(ratePercent, 3),
    charge: 0,
    processingFee: 0,
    taxOnFee: 0,
    totalFee: 0,
    net: 0,
    effectiveRate: 0,
  };
  if (!Number.isFinite(amount) || amount <= 0 || r * (1 + tf) >= 1) return zero;

  let charge: number;
  if (mode === "net") {
    // charge − (charge*r + fixed)*(1+tf) = target
    charge = (amount + fixed * (1 + tf)) / (1 - r * (1 + tf));
  } else {
    charge = amount;
  }

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
