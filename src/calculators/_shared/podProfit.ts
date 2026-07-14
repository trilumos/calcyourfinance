/**
 * Shared print-on-demand (POD) profit formula — PURE, fully unit-tested.
 * Powers Printful, Printify, Teespring and any other POD profit calculator.
 *
 * Model: the POD platform charges you a per-item base/fulfillment cost + shipping.
 * There is no platform commission on your sales. Profit = what the customer pays
 * minus what the POD platform charges you.
 *
 * Rounding discipline (same as marketplaceFee.ts): round each money component to
 * cents first, then derive totals from those rounded components so the breakdown
 * shown to users always adds up exactly.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface PodProfitInput {
  /** Price the customer pays for the item. */
  retailPrice: number;
  /** Shipping you charge the customer (default 0 = free shipping to customer). */
  shippingCharged?: number;
  /** POD base/fulfillment cost you pay per item (the platform's charge). */
  productCost: number;
  /** Shipping the POD provider charges you per order (default 0). */
  shippingCost?: number;
  /** Optional per-order extras (e.g. embroidery digitization, branding inserts). */
  extraFees?: number;
  /** Number of units (default 1; values < 1 are treated as 1). */
  quantity?: number;
}

export interface PodProfitBreakdown {
  /** (retailPrice + shippingCharged) * qty */
  revenue: number;
  /** (productCost + shippingCost + extraFees) * qty */
  totalCost: number;
  /** revenue - totalCost */
  profit: number;
  /** profit / revenue * 100; 0 when revenue <= 0 */
  marginPercent: number;
}

/** Sanitise a raw input number: non-finite or negative → 0. */
function safe(n: number | undefined, allowNegative = false): number {
  const v = Number.isFinite(n) ? (n as number) : 0;
  return allowNegative ? v : Math.max(0, v);
}

export function computePodProfit(input: PodProfitInput): PodProfitBreakdown {
  const qty = Math.max(1, Number.isFinite(input.quantity) ? Math.floor(input.quantity as number) : 1);

  const retailPrice = safe(input.retailPrice);
  const shippingCharged = safe(input.shippingCharged);
  const productCost = safe(input.productCost);
  const shippingCost = safe(input.shippingCost);
  const extraFees = safe(input.extraFees);

  // Round per-unit components first.
  const unitRevenue = roundMoney(retailPrice + shippingCharged);
  const unitCost = roundMoney(productCost + shippingCost + extraFees);

  // Scale by quantity (round after scaling — avoids accumulating per-unit rounding).
  const revenue = roundMoney(unitRevenue * qty);
  const totalCost = roundMoney(unitCost * qty);
  const profit = roundMoney(revenue - totalCost);

  const marginPercent =
    revenue > 0 ? roundTo((profit / revenue) * 100, 2) : 0;

  return { revenue, totalCost, profit, marginPercent };
}
