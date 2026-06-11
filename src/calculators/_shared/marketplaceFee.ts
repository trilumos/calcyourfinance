/**
 * Shared marketplace/seller fee math — PURE, fully unit-tested. Powers every
 * flat-fee platform (selling % ± fixed, optional cap/floor, optional
 * flat-fee-under-threshold, optional payment processing, optional profit).
 * Platforms with a plan/level choice pass the chosen rate in via config.
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

  const price = Number.isFinite(itemPrice) ? itemPrice : 0;
  const ship = Number.isFinite(shipping) ? shipping : 0;
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
  const totalFees = sellingFee + processingFee;
  const payout = revenue - totalFees;
  const profit = payout - itemCost;

  return {
    revenue: roundMoney(revenue),
    sellingFee: roundMoney(sellingFee),
    processingFee: roundMoney(processingFee),
    totalFees: roundMoney(totalFees),
    payout: roundMoney(payout),
    profit: roundMoney(profit),
    takeRatePercent: roundTo((totalFees / revenue) * 100, 2),
  };
}
