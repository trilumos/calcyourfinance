/**
 * Redbubble profit / earnings formula.
 *
 * ── Redbubble earnings model (verified 2026-06-15) ─────────────────────────
 *
 * Redbubble is a print-on-demand marketplace. Unlike Printful/Printify (where
 * the artist pays a base cost and keeps the difference from a retail price they
 * set freely), on Redbubble:
 *
 *   1. Redbubble sets a BASE PRICE per product (varies by item).
 *   2. The artist sets a MARKUP % on top of that base (default 20%).
 *   3. RETAIL PRICE (customer pays) = base × (1 + margin / 100)
 *   4. GROSS ARTIST EARNINGS = base × (margin / 100)
 *      i.e. the artist earns exactly the markup amount, not the retail price.
 *
 * ── Account tier fees (effective September 1, 2025) ─────────────────────────
 *
 *  Standard  — 50 % of gross artist earnings taken as a platform fee.
 *  Premium   — 20 % of gross artist earnings taken as a platform fee.
 *  Pro       — 0 % (exempt from both platform fee and excess markup fee).
 *
 *  Additionally, Standard and Premium artists who set markup ABOVE 20 % are
 *  charged an EXCESS MARKUP FEE of 50 % on the earnings generated above 20 %:
 *
 *    earningsAboveThreshold = base × max(0, marginPercent − 20) / 100
 *    excessMarkupFee        = 0.50 × earningsAboveThreshold
 *
 *  Fee cap: combined fees are capped at $150/month (per payment period).
 *  The cap is a monthly aggregate and cannot be modelled per-sale — this
 *  calculator shows fees as if no cap applies (conservative/per-sale view).
 *
 * ── Sources ─────────────────────────────────────────────────────────────────
 *  https://help.redbubble.com/hc/en-us/articles/202270799
 *  https://blog.redbubble.com/2025/08/artist-account-tiers-and-fees/
 *  https://blog.redbubble.com/2025/08/excess-markup-fee-explained/
 *  https://help.redbubble.com/hc/en-us/articles/4412593541908
 */

import { roundMoney } from "../../lib/money";

export type RedbubbleAccountTier = "standard" | "premium" | "pro";

/** Platform fee rate per tier (on gross earnings). */
const PLATFORM_FEE_RATE: Record<RedbubbleAccountTier, number> = {
  standard: 0.50,
  premium: 0.20,
  pro: 0.00,
};

/** Markup threshold above which the excess markup fee applies (Standard/Premium). */
const EXCESS_MARKUP_THRESHOLD = 20; // %
/** Excess markup fee rate applied to earnings above the threshold. */
const EXCESS_MARKUP_FEE_RATE = 0.50; // 50 %

export interface RedbubbleInput {
  /** Redbubble's base price for the product (set by Redbubble). */
  basePrice: number;
  /** Artist markup % on top of base price. Default 20. */
  marginPercent: number;
  /** Number of units. Min 1. */
  quantity: number;
  /** Artist's account tier — affects platform fees deducted from earnings. */
  accountTier: RedbubbleAccountTier;
}

export interface RedbubbleResult {
  /** Per-unit retail price (what the customer pays). */
  retailPrice: number;
  /** Per-unit gross earnings before platform/excess fees. */
  grossEarnings: number;
  /** Per-unit excess markup fee (50% on earnings above 20% markup; 0 for Pro). */
  excessMarkupFee: number;
  /** Per-unit platform fee (% of gross earnings by tier). */
  platformFee: number;
  /** Per-unit net earnings after all fees. */
  netEarnings: number;

  /* ── Totals (× quantity) ── */
  retailPriceTotal: number;
  grossEarningsTotal: number;
  excessMarkupFeeTotal: number;
  platformFeeTotal: number;
  netEarningsTotal: number;

  /** Effective net margin on retail price (per unit). */
  netMarginOnRetailPercent: number;
}

export function computeRedbubbleEarnings(input: RedbubbleInput): RedbubbleResult {
  // ── Sanitise inputs ──────────────────────────────────────────────────────
  const base = isFinite(input.basePrice) && input.basePrice > 0 ? input.basePrice : 0;
  const margin = isFinite(input.marginPercent) && input.marginPercent > 0 ? input.marginPercent : 0;
  const qty = Math.max(1, Math.floor(isFinite(input.quantity) ? input.quantity : 1));
  const tier = input.accountTier;

  // ── Per-unit calculations ────────────────────────────────────────────────
  const retailPrice = roundMoney(base * (1 + margin / 100));
  const grossEarnings = roundMoney(base * (margin / 100));

  // Excess markup fee — only for Standard and Premium when margin > 20%
  let excessMarkupFee = 0;
  if (tier !== "pro" && margin > EXCESS_MARKUP_THRESHOLD) {
    const earningsAboveThreshold = roundMoney(base * (margin - EXCESS_MARKUP_THRESHOLD) / 100);
    excessMarkupFee = roundMoney(earningsAboveThreshold * EXCESS_MARKUP_FEE_RATE);
  }

  // Platform fee — percentage of gross earnings by tier
  const platformFeeRate = PLATFORM_FEE_RATE[tier];
  const platformFee = roundMoney(grossEarnings * platformFeeRate);

  const netEarnings = roundMoney(grossEarnings - platformFee - excessMarkupFee);

  // Net margin on retail (% of retail price the artist keeps net)
  const netMarginOnRetailPercent =
    retailPrice > 0 ? roundMoney((netEarnings / retailPrice) * 100) : 0;

  // ── Totals ───────────────────────────────────────────────────────────────
  const retailPriceTotal = roundMoney(retailPrice * qty);
  const grossEarningsTotal = roundMoney(grossEarnings * qty);
  const excessMarkupFeeTotal = roundMoney(excessMarkupFee * qty);
  const platformFeeTotal = roundMoney(platformFee * qty);
  const netEarningsTotal = roundMoney(netEarnings * qty);

  return {
    retailPrice,
    grossEarnings,
    excessMarkupFee,
    platformFee,
    netEarnings,
    retailPriceTotal,
    grossEarningsTotal,
    excessMarkupFeeTotal,
    platformFeeTotal,
    netEarningsTotal,
    netMarginOnRetailPercent,
  };
}
