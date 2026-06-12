/**
 * Vinted fee formula — PURE math, fully unit-tested.
 *
 * Vinted's fee model:
 *   SELLER: £0 / €0 / PLN 0 — sellers keep 100% of their listed price.
 *   BUYER:  Buyer Protection fee added by Vinted at checkout.
 *
 * Buyer Protection fee tiers:
 *   Standard (item < highValueThreshold): fixed + percent% × itemPrice
 *   High-value (item ≥ highValueThreshold): highValuePercent% × itemPrice
 *
 * Each market carries its own rates; all are stored in fees.ts and passed in.
 */

import { roundMoney } from "../../lib/money";

export interface VintedMarketFees {
  /** Buyer Protection % applied on items BELOW highValueThreshold. */
  buyerProtectionPercent: number;
  /** Fixed fee (in local currency) added to buyer fee on standard-tier items. */
  buyerProtectionFixed: number;
  /** Item price at or above which the high-value rate applies (no fixed). */
  highValueThreshold: number;
  /** Lower % applied on high-value items (no fixed fee). */
  highValuePercent: number;
}

export interface VintedBuyerFeeResult {
  /** Buyer Protection fee charged to the buyer at checkout. */
  buyerFee: number;
  /** Item price + buyerFee. */
  buyerTotal: number;
  /** Whether the high-value tier was applied. */
  isHighValue: boolean;
}

export interface VintedTransactionResult {
  /** Item price (seller receives this in full — Vinted charges sellers nothing). */
  sellerPayout: number;
  /** Always 0 — Vinted charges no seller fee. */
  sellerFee: number;
  /** sellerPayout − itemCost (0 if no cost provided). */
  profit: number;
  /** Buyer Protection fee (paid by buyer, not deducted from seller). */
  buyerFee: number;
  /** Item price + buyerFee. */
  buyerTotal: number;
  /** Whether the high-value tier applied. */
  isHighValue: boolean;
}

/**
 * Compute the Buyer Protection fee for a given item price and market fees.
 * Returns zeros for zero or negative item prices.
 */
export function computeVintedBuyerFee(
  itemPrice: number,
  fees: VintedMarketFees,
): VintedBuyerFeeResult {
  const price = Math.max(0, Number.isFinite(itemPrice) ? itemPrice : 0);

  if (price <= 0) {
    return { buyerFee: 0, buyerTotal: 0, isHighValue: false };
  }

  const isHighValue = price >= fees.highValueThreshold;

  let buyerFee: number;
  if (isHighValue) {
    // High-value tier: percentage only, no fixed fee
    buyerFee = roundMoney(price * (fees.highValuePercent / 100));
  } else {
    // Standard tier: fixed + percentage
    buyerFee = roundMoney(fees.buyerProtectionFixed + price * (fees.buyerProtectionPercent / 100));
  }

  const buyerTotal = roundMoney(price + buyerFee);

  return { buyerFee, buyerTotal, isHighValue };
}

/**
 * Compute a full Vinted transaction: seller side + buyer side.
 *
 * @param itemPrice   The listed item price.
 * @param itemCost    What the seller paid for the item (for profit calc; 0 if unknown).
 * @param fees        Market-specific fee config.
 */
export function computeVintedTransaction(
  itemPrice: number,
  itemCost: number,
  fees: VintedMarketFees,
): VintedTransactionResult {
  const price = Math.max(0, Number.isFinite(itemPrice) ? itemPrice : 0);
  const cost = Number.isFinite(itemCost) ? Math.max(0, itemCost) : 0;

  if (price <= 0) {
    return {
      sellerPayout: 0,
      sellerFee: 0,
      profit: 0,
      buyerFee: 0,
      buyerTotal: 0,
      isHighValue: false,
    };
  }

  // Seller always keeps 100% — no deductions
  const sellerFee = 0;
  const sellerPayout = roundMoney(price);
  const profit = roundMoney(sellerPayout - cost);

  const { buyerFee, buyerTotal, isHighValue } = computeVintedBuyerFee(price, fees);

  return {
    sellerPayout,
    sellerFee,
    profit,
    buyerFee,
    buyerTotal,
    isHighValue,
  };
}
