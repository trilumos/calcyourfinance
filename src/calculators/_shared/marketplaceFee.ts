/**
 * Shared marketplace/seller fee math — PURE, fully unit-tested. Powers every
 * flat-fee platform (selling % ± fixed, optional cap/floor, optional
 * flat-fee-under-threshold, optional payment processing, optional profit).
 * Platforms with a plan/level choice pass the chosen rate in via config.
 *
 * Rounding: each money component is rounded to cents first, then the totals are
 * summed from those rounded components, so a breakdown shown to the user always
 * adds up exactly (no "rows don't match the total" off-by-a-cent).
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface MarketplaceFeeInput {
  itemPrice: number;
  shipping?: number;
  itemCost?: number;
  /** Does the selling % apply to shipping too? Most marketplaces: yes (default). */
  feeOnShipping?: boolean;
  sellingPercent: number;
  sellingFixed?: number;
  /** Per-order ceiling on the selling fee. */
  feeCap?: number;
  /** Per-order floor on the selling fee (percentage path only). */
  feeMin?: number;
  /** Flat fee when feeBase is strictly below `threshold` (Poshmark/FB-style). */
  flatUnderThreshold?: { threshold: number; fee: number };
  processingPercent?: number;
  processingFixed?: number;
}

export interface MarketplaceFeeBreakdown {
  revenue: number;
  sellingFee: number;
  processingFee: number;
  totalFees: number;
  payout: number;
  profit: number;
  takeRatePercent: number;
}

export function computeMarketplaceFee(input: MarketplaceFeeInput): MarketplaceFeeBreakdown {
  const {
    itemPrice,
    shipping = 0,
    itemCost = 0,
    feeOnShipping = true,
    sellingPercent,
    sellingFixed = 0,
    feeCap,
    feeMin,
    flatUnderThreshold,
    processingPercent = 0,
    processingFixed = 0,
  } = input;

  const price = Math.max(0, Number.isFinite(itemPrice) ? itemPrice : 0);
  const ship = Math.max(0, Number.isFinite(shipping) ? shipping : 0);
  const cost = Number.isFinite(itemCost) ? itemCost : 0;
  const revenue = price + ship;

  const zero: MarketplaceFeeBreakdown = {
    revenue: 0, sellingFee: 0, processingFee: 0, totalFees: 0, payout: 0, profit: 0, takeRatePercent: 0,
  };
  if (revenue <= 0) return zero;

  const feeBase = feeOnShipping ? revenue : price;

  let sellingFee: number;
  if (flatUnderThreshold && feeBase < flatUnderThreshold.threshold) {
    sellingFee = flatUnderThreshold.fee;
  } else {
    sellingFee = feeBase * (sellingPercent / 100) + sellingFixed;
    if (feeMin != null) sellingFee = Math.max(sellingFee, feeMin);
    if (feeCap != null) sellingFee = Math.min(sellingFee, feeCap);
  }

  const processingFee = revenue * (processingPercent / 100) + processingFixed;

  // Round components first, then derive totals from the rounded parts so the
  // breakdown the user sees always sums exactly.
  const revenueR = roundMoney(revenue);
  const sellingFeeR = roundMoney(sellingFee);
  const processingFeeR = roundMoney(processingFee);
  const totalFeesR = roundMoney(sellingFeeR + processingFeeR);
  const payoutR = roundMoney(revenueR - totalFeesR);
  const profitR = roundMoney(payoutR - cost);

  return {
    revenue: revenueR,
    sellingFee: sellingFeeR,
    processingFee: processingFeeR,
    totalFees: totalFeesR,
    payout: payoutR,
    profit: profitR,
    takeRatePercent: roundTo((totalFeesR / revenueR) * 100, 2),
  };
}
