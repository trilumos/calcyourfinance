/**
 * Gumroad fee calculator — pure math (no I/O, fully unit-tested).
 *
 * Fee model (verified 2026-06-15 from gumroad.com/help/article/66-gumroads-fees):
 *
 * DIRECT SALES (sold via your profile link / embedded checkout):
 *   Gumroad fee = 10% × salePrice + $0.50  (Gumroad's own cut)
 *   Processing   = 2.9% × salePrice + $0.30  (Stripe, charged separately)
 *
 * GUMROAD DISCOVER SALES (found via Gumroad's built-in marketplace):
 *   Fee = 30% × salePrice (ALL-INCLUSIVE — Stripe processing is embedded)
 *   Processing = $0 (already within the 30%)
 *
 * Rounding: each monetary component is rounded to cents independently; totals
 * are derived from those rounded values so the breakdown always sums exactly.
 */

import { roundMoney, roundTo } from "../../lib/money";
import { gumroadFees } from "../../config/fees";

export type GumroadSaleSource = "direct" | "discover";

export interface GumroadFeeInput {
  salePrice: number;
  source: GumroadSaleSource;
  itemCost?: number;
}

export interface GumroadFeeBreakdown {
  salePrice: number;
  /** Gumroad's platform fee (10% + $0.50 for direct; 30% all-in for Discover). */
  gumroadFee: number;
  /** Stripe processing fee (direct sales only; 0 for Discover). */
  processingFee: number;
  totalFees: number;
  payout: number;
  /** Payout minus itemCost (0 if no itemCost provided). */
  profit: number;
  takeRatePercent: number;
}

export function computeGumroadFee(input: GumroadFeeInput): GumroadFeeBreakdown {
  const price = Math.max(0, Number.isFinite(input.salePrice) ? input.salePrice : 0);
  const itemCost = Math.max(0, Number.isFinite(input.itemCost ?? 0) ? (input.itemCost ?? 0) : 0);

  const zero: GumroadFeeBreakdown = {
    salePrice: 0, gumroadFee: 0, processingFee: 0, totalFees: 0,
    payout: 0, profit: 0, takeRatePercent: 0,
  };
  if (price <= 0) return zero;

  let gumroadFee: number;
  let processingFee: number;

  if (input.source === "discover") {
    // Discover: 30% flat, all-inclusive (no separate Stripe fee)
    gumroadFee = price * (gumroadFees.discoverPercent / 100);
    processingFee = 0;
  } else {
    // Direct: 10% + $0.50 Gumroad platform fee + Stripe 2.9% + $0.30 on top
    gumroadFee = price * (gumroadFees.directPercent / 100) + gumroadFees.directFixed;
    processingFee = price * (gumroadFees.directProcessingPercent / 100) + gumroadFees.directProcessingFixed;
  }

  const salePriceR = roundMoney(price);
  const gumroadFeeR = roundMoney(gumroadFee);
  const processingFeeR = roundMoney(processingFee);
  const totalFeesR = roundMoney(gumroadFeeR + processingFeeR);
  const payoutR = roundMoney(salePriceR - totalFeesR);
  const profitR = roundMoney(payoutR - itemCost);

  return {
    salePrice: salePriceR,
    gumroadFee: gumroadFeeR,
    processingFee: processingFeeR,
    totalFees: totalFeesR,
    payout: payoutR,
    profit: profitR,
    takeRatePercent: roundTo((totalFeesR / salePriceR) * 100, 2),
  };
}
