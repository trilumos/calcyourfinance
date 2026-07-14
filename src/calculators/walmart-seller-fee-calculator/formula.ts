/**
 * Walmart Marketplace referral fee formula — PURE, fully unit-tested.
 *
 * Walmart charges a referral fee on the TOTAL SALES PRICE (item price +
 * shipping + gift wrap + other charges). There is NO separate processing fee.
 *
 * Three rate mechanics exist (see WalmartRateMechanic in fees.ts):
 *   "flat"     — single % on the entire total sales price.
 *   "switch"   — the ENTIRE amount is charged at ONE rate determined by which
 *                price band the total falls into (like a on/off threshold).
 *   "marginal" — true bracket math: lower rate only on the PORTION above the
 *                breakpoint (like income tax brackets).
 *
 * Rounding: each component rounded to cents first; totals derived from the
 * rounded components so the receipt always sums exactly (no off-by-a-cent).
 */

import { roundMoney } from "../../lib/money";
import type { WalmartCategory } from "../../config/fees";

export interface WalmartFeeInput {
  /** Item price (the listed price the buyer pays for the item). */
  itemPrice: number;
  /** Shipping charged to the buyer (Walmart fees apply to this too). */
  shipping?: number;
  /** Optional cost of goods — used only for profit calculation. */
  itemCost?: number;
  /** The selected WalmartCategory from walmartFees.categories. */
  category: WalmartCategory;
}

export interface WalmartFeeBreakdown {
  /** Item price + shipping = total Walmart charges the referral fee against. */
  revenue: number;
  /** The referral fee in dollars. */
  referralFee: number;
  /** The effective referral rate as a percentage of revenue (for display). */
  effectiveRatePercent: number;
  /** Revenue minus referral fee. */
  payout: number;
  /** Payout minus itemCost (0 if no itemCost supplied). */
  profit: number;
}

/**
 * Compute the Walmart Marketplace referral fee for a given total sales price.
 *
 * @param input - see WalmartFeeInput
 * @returns WalmartFeeBreakdown with all values rounded to cents
 */
export function computeWalmartFee(input: WalmartFeeInput): WalmartFeeBreakdown {
  const {
    itemPrice,
    shipping = 0,
    itemCost = 0,
    category,
  } = input;

  const price = Math.max(0, Number.isFinite(itemPrice) ? itemPrice : 0);
  const ship = Math.max(0, Number.isFinite(shipping) ? shipping : 0);
  const cost = Number.isFinite(itemCost) ? itemCost : 0;

  const zero: WalmartFeeBreakdown = {
    revenue: 0,
    referralFee: 0,
    effectiveRatePercent: 0,
    payout: 0,
    profit: 0,
  };

  const revenue = price + ship;
  if (revenue <= 0) return zero;

  let referralFee: number;

  switch (category.mechanic) {
    case "flat": {
      // Single flat rate on the entire total sales price.
      referralFee = revenue * (category.percent / 100);
      break;
    }

    case "switch": {
      // The entire amount is charged at ONE rate based on price band.
      // Apparel has three bands (≤T1 → p1; T1–T2 → p2; >T2 → p3).
      // All other switch categories have two bands (≤T1 → p1; >T1 → p2).
      const t1 = category.tier1Threshold ?? Infinity;
      const t2 = category.tier2Threshold ?? Infinity;

      let rate: number;
      if (revenue <= t1) {
        rate = category.percent;
      } else if (revenue <= t2) {
        rate = category.percent2 ?? category.percent;
      } else {
        rate = category.percent3 ?? category.percent2 ?? category.percent;
      }
      referralFee = revenue * (rate / 100);
      break;
    }

    case "marginal": {
      // True bracket math: lower rate only on the PORTION above the threshold.
      // Currently all marginal categories have exactly two brackets.
      const t1 = category.tier1Threshold ?? Infinity;
      const p1 = category.percent;
      const p2 = category.percent2 ?? category.percent;

      if (revenue <= t1) {
        referralFee = revenue * (p1 / 100);
      } else {
        const feeOnFirstBracket = t1 * (p1 / 100);
        const feeOnRemainder = (revenue - t1) * (p2 / 100);
        referralFee = feeOnFirstBracket + feeOnRemainder;
      }
      break;
    }

    default: {
      // Fallback — should never happen with a correctly typed category.
      referralFee = revenue * (category.percent / 100);
    }
  }

  // Round each component first; derive totals from rounded parts.
  const revenueR = roundMoney(revenue);
  const referralFeeR = roundMoney(referralFee);
  const payoutR = roundMoney(revenueR - referralFeeR);
  const profitR = roundMoney(payoutR - cost);
  const effectiveRatePercent =
    revenueR > 0 ? roundMoney((referralFeeR / revenueR) * 100) : 0;

  return {
    revenue: revenueR,
    referralFee: referralFeeR,
    effectiveRatePercent,
    payout: payoutR,
    profit: profitR,
  };
}
