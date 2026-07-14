/**
 * Bandcamp fee formula — pure math, fully unit-tested.
 *
 * Verified rates (2026-06-15):
 *  - Digital: 15% revenue share, drops to 10% once $5,000 USD in lifetime
 *    digital sales (maintained on a rolling 12-month basis).
 *  - Physical/merch: flat 10% revenue share.
 *  - Bandcamp Friday: 0% revenue share (Bandcamp waives it entirely);
 *    payment processing still applies.
 *  - Processing: 2.9% + $0.30 per transaction (representative card rate).
 *
 * Source: https://get.bandcamp.help/en/articles/15263193-what-are-bandcamp-s-fees
 */

import { roundMoney } from "../../lib/money";
import { bandcampFees } from "../../config/fees";

export type BandcampSaleType = "digital" | "physical";

export interface BandcampFeeInput {
  saleType: BandcampSaleType;
  salePrice: number;
  /** True if the artist has surpassed $5,000 USD in lifetime digital sales (rolling 12-month). Ignored for physical. */
  overThreshold: boolean;
  /** True if this is a Bandcamp Friday sale — Bandcamp waives its revenue share. */
  bandcampFriday: boolean;
  /** Optional item cost to calculate profit. */
  itemCost?: number;
}

export interface BandcampFeeBreakdown {
  revenue: number;
  /** The active Bandcamp revenue share % (0, 10, or 15). */
  revenueSharePercent: number;
  revenueSharFee: number;
  processingFee: number;
  totalFees: number;
  payout: number;
  profit: number;
  takeRatePercent: number;
}

export function computeBandcampFee(input: BandcampFeeInput): BandcampFeeBreakdown {
  const { saleType, salePrice, overThreshold, bandcampFriday, itemCost = 0 } = input;

  const price = Math.max(0, Number.isFinite(salePrice) ? salePrice : 0);
  const cost  = Number.isFinite(itemCost) ? itemCost : 0;

  const zero: BandcampFeeBreakdown = {
    revenue: 0, revenueSharePercent: 0, revenueSharFee: 0,
    processingFee: 0, totalFees: 0, payout: 0, profit: 0, takeRatePercent: 0,
  };
  if (price <= 0) return zero;

  // Determine active revenue share rate
  let revenueSharePercent: number;
  if (bandcampFriday) {
    revenueSharePercent = bandcampFees.fridayPercent; // 0
  } else if (saleType === "physical") {
    revenueSharePercent = bandcampFees.physicalPercent; // 10
  } else {
    // Digital: tier depends on lifetime sales
    revenueSharePercent = overThreshold
      ? bandcampFees.digitalPercentTier    // 10%
      : bandcampFees.digitalPercentStandard; // 15%
  }

  const revenueSharFee = roundMoney(price * (revenueSharePercent / 100));
  const processingFee  = roundMoney(price * (bandcampFees.processingPercent / 100) + bandcampFees.processingFixed);
  const totalFees      = roundMoney(revenueSharFee + processingFee);
  const revenue        = roundMoney(price);
  const payout         = roundMoney(revenue - totalFees);
  const profit         = roundMoney(payout - cost);
  const takeRatePercent = revenue > 0
    ? Math.round((totalFees / revenue) * 10000) / 100
    : 0;

  return {
    revenue,
    revenueSharePercent,
    revenueSharFee,
    processingFee,
    totalFees,
    payout,
    profit,
    takeRatePercent,
  };
}
