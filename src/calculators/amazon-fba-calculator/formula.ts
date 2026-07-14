/**
 * Amazon FBA seller-economics math — PURE, fully unit-tested.
 *
 * Two Amazon charges are modelled here, plus optional storage:
 *
 *   1. REFERRAL FEE (`computeAmazonReferral`) — a % of the total sales price by
 *      category, with a per-item $0.30 minimum. Three category shapes:
 *        • flat        — one `percent` for the whole price (most, electronics…).
 *        • banded      — the WHOLE price uses the rate of the price band it
 *                        falls in (Clothing 5/10/17, Baby 8/15, Grocery 8/15).
 *        • marginal    — a headline `percent` up to `tierBreakpoint`, then
 *                        `tierPercent` on the portion above (Jewelry, Watches,
 *                        Furniture).
 *      Media categories add a separate $1.80 variable closing fee (returned as
 *      its own field so the receipt can show it distinctly; the $0.30 minimum
 *      applies to the referral portion only).
 *
 *   2. FBA FULFILMENT FEE (`fbaFulfilmentFee`) — a per-unit fee from Amazon's
 *      standard-size rate card, looked up by SIZE TIER × unit WEIGHT (ounce
 *      bands) × the item's PRICE BAND (under $10 / $10–$50 / over $50). A 3.5%
 *      fuel & logistics surcharge is applied ON TOP of that base fee.
 *
 * Rounding discipline (mirrors the other formulas): round each money component
 * to cents first, then derive totals from the rounded parts so the receipt the
 * user sees sums exactly.
 *
 * SCOPE: US, standard-size only (see fees.ts AMAZON_VERIFIED for sourcing).
 * The $39.99/mo Professional plan is a flat subscription, not a per-sale fee,
 * so it is never included here.
 */
import { roundMoney, roundTo } from "../../lib/money";
import type { AmazonReferralCategory, AmazonFbaFeeRow } from "../../config/fees";

/* ── Referral fee ─────────────────────────────────────────────────────────── */

export interface AmazonReferralResult {
  /** Referral fee after applying the per-item minimum. */
  referralFee: number;
  /** Media variable closing fee ($1.80) when the category is a media type. */
  closingFee: number;
  /** The effective referral rate actually applied (%, before the minimum). */
  appliedRatePercent: number;
}

/**
 * Referral fee for one sale. `price` is the total sales price the referral
 * applies to (item price + any seller-charged shipping + gift wrap).
 */
export function computeAmazonReferral(
  price: number,
  category: AmazonReferralCategory,
  referralMinimum: number,
  mediaClosingFee: number,
): AmazonReferralResult {
  const p = Math.max(0, Number.isFinite(price) ? price : 0);

  let rawFee: number;
  let appliedRatePercent: number;

  if (category.bands && category.bands.length > 0) {
    // Whole-price band: pick the first band whose maxPrice covers the price
    // (final band is open-ended). The chosen rate applies to the ENTIRE price.
    const band =
      category.bands.find((b) => b.maxPrice == null || p <= b.maxPrice) ??
      category.bands[category.bands.length - 1];
    appliedRatePercent = band.percent;
    rawFee = p * (band.percent / 100);
  } else if (
    category.tierBreakpoint != null &&
    category.tierPercent != null &&
    p > category.tierBreakpoint
  ) {
    // Marginal tier: headline rate up to the breakpoint, lower rate above it.
    const base = category.tierBreakpoint * (category.percent / 100);
    const excess = (p - category.tierBreakpoint) * (category.tierPercent / 100);
    rawFee = base + excess;
    appliedRatePercent = p > 0 ? roundTo((rawFee / p) * 100, 2) : category.percent;
  } else {
    appliedRatePercent = category.percent;
    rawFee = p * (category.percent / 100);
  }

  // The per-item minimum applies to the referral fee (only when there is a sale).
  const referralFee = p > 0 ? roundMoney(Math.max(rawFee, referralMinimum)) : 0;
  const closingFee = category.media && p > 0 ? roundMoney(mediaClosingFee) : 0;

  return { referralFee, closingFee, appliedRatePercent };
}

/* ── FBA fulfilment fee ───────────────────────────────────────────────────── */

/** Price-band index for the FBA table: 0 = under bands[0], 1 = ≤ bands[1], else 2. */
export function fbaPriceBandIndex(price: number, bands: [number, number]): 0 | 1 | 2 {
  if (price < bands[0]) return 0;
  if (price <= bands[1]) return 1;
  return 2;
}

/**
 * Base FBA fulfilment fee (before the fuel surcharge) for a unit of the given
 * weight (ounces) in the given size-tier rate rows, at the given price band.
 * Weight above the last band's `maxOz` uses that (open-ended) row; if that row
 * carries a per-interval add-on, the extra weight is charged accordingly.
 */
export function fbaFulfilmentFee(
  rows: AmazonFbaFeeRow[],
  weightOz: number,
  bandIndex: 0 | 1 | 2,
): number {
  const w = Math.max(0, Number.isFinite(weightOz) ? weightOz : 0);
  const row = rows.find((r) => w <= r.maxOz) ?? rows[rows.length - 1];
  let fee = row.fees[bandIndex];
  if (row.perIntervalFee != null && row.aboveOz != null && row.intervalOz != null && w > row.aboveOz) {
    const intervals = Math.ceil((w - row.aboveOz) / row.intervalOz);
    fee += intervals * row.perIntervalFee;
  }
  return roundMoney(fee);
}

/* ── Full FBA receipt ─────────────────────────────────────────────────────── */

export type AmazonSizeTier = "small" | "large";

export interface AmazonFbaInput {
  salePrice: number;
  productCost?: number;
  /** Total unit weight in ounces (16 oz = 1 lb). */
  weightOz: number;
  sizeTier: AmazonSizeTier;
  /** Resolved referral category descriptor from amazonFees.categories. */
  category: AmazonReferralCategory;
  referralMinimum: number;
  mediaClosingFee: number;
  priceBands: [number, number];
  fuelSurchargePercent: number;
  smallStandard: AmazonFbaFeeRow[];
  largeStandard: AmazonFbaFeeRow[];
  /** Optional: item volume in cubic feet for a monthly storage estimate. */
  storageCubicFeet?: number;
  storagePerCubicFoot?: number;
}

export interface AmazonFbaBreakdown {
  revenue: number;
  referralFee: number;
  closingFee: number;
  fbaBaseFee: number;
  fuelSurcharge: number;
  fbaFee: number; // base + surcharge
  storageFee: number;
  totalFees: number;
  netProceeds: number;
  profit: number;
  marginPercent: number;
  effectiveFeeRatePercent: number;
}

export function computeAmazonFba(input: AmazonFbaInput): AmazonFbaBreakdown {
  const price = Math.max(0, Number.isFinite(input.salePrice) ? input.salePrice : 0);
  const cost = Number.isFinite(input.productCost ?? 0) ? input.productCost ?? 0 : 0;

  const { referralFee, closingFee } = computeAmazonReferral(
    price,
    input.category,
    input.referralMinimum,
    input.mediaClosingFee,
  );

  const bandIndex = fbaPriceBandIndex(price, input.priceBands);
  const rows = input.sizeTier === "small" ? input.smallStandard : input.largeStandard;
  const fbaBaseFee = price > 0 ? fbaFulfilmentFee(rows, input.weightOz, bandIndex) : 0;
  const fuelSurcharge = roundMoney(fbaBaseFee * (input.fuelSurchargePercent / 100));
  const fbaFee = roundMoney(fbaBaseFee + fuelSurcharge);

  const storageFee =
    input.storageCubicFeet && input.storagePerCubicFoot
      ? roundMoney(Math.max(0, input.storageCubicFeet) * input.storagePerCubicFoot)
      : 0;

  const totalFees = roundMoney(referralFee + closingFee + fbaFee + storageFee);
  const revenue = roundMoney(price);
  const netProceeds = roundMoney(revenue - totalFees);
  const profit = roundMoney(netProceeds - cost);
  const marginPercent = revenue > 0 ? roundTo((profit / revenue) * 100, 2) : 0;
  const effectiveFeeRatePercent = revenue > 0 ? roundTo((totalFees / revenue) * 100, 2) : 0;

  return {
    revenue,
    referralFee,
    closingFee,
    fbaBaseFee,
    fuelSurcharge,
    fbaFee,
    storageFee,
    totalFees,
    netProceeds,
    profit,
    marginPercent,
    effectiveFeeRatePercent,
  };
}
