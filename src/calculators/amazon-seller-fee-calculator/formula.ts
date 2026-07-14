/**
 * Amazon seller / referral fee math — PURE, unit-tested.
 *
 * For FBM (Fulfilled by Merchant) and general sellers who just want Amazon's
 * commission: the REFERRAL FEE (a % of the total sales price, item + shipping +
 * gift wrap, with a $0.30 per-item minimum) plus the $1.80 media variable
 * closing fee for media categories. No FBA fulfilment fee (the seller ships).
 *
 * The referral rate table and the referral computation are single-sourced:
 * this reuses `computeAmazonReferral` from the FBA calculator so both pages
 * always apply identical category rules. See amazon-fba-calculator/formula.ts.
 */
import { roundMoney, roundTo } from "../../lib/money";
import { computeAmazonReferral } from "../amazon-fba-calculator/formula";
import type { AmazonReferralCategory } from "../../config/fees";

export interface AmazonSellerFeeInput {
  itemPrice: number;
  /** Shipping the seller charges the buyer — referral applies to it too. */
  shipping?: number;
  productCost?: number;
  category: AmazonReferralCategory;
  referralMinimum: number;
  mediaClosingFee: number;
}

export interface AmazonSellerFeeBreakdown {
  revenue: number;
  referralFee: number;
  closingFee: number;
  totalFees: number;
  netProceeds: number;
  profit: number;
  marginPercent: number;
  effectiveFeeRatePercent: number;
}

export function computeAmazonSellerFee(input: AmazonSellerFeeInput): AmazonSellerFeeBreakdown {
  const price = Math.max(0, Number.isFinite(input.itemPrice) ? input.itemPrice : 0);
  const shipping = Math.max(0, Number.isFinite(input.shipping ?? 0) ? input.shipping ?? 0 : 0);
  const cost = Number.isFinite(input.productCost ?? 0) ? input.productCost ?? 0 : 0;
  const revenue = roundMoney(price + shipping);

  // Referral applies to the total sales price (item + shipping + gift wrap).
  const { referralFee, closingFee } = computeAmazonReferral(
    price + shipping,
    input.category,
    input.referralMinimum,
    input.mediaClosingFee,
  );

  const totalFees = roundMoney(referralFee + closingFee);
  const netProceeds = roundMoney(revenue - totalFees);
  const profit = roundMoney(netProceeds - cost);
  const marginPercent = revenue > 0 ? roundTo((profit / revenue) * 100, 2) : 0;
  const effectiveFeeRatePercent = revenue > 0 ? roundTo((totalFees / revenue) * 100, 2) : 0;

  return {
    revenue,
    referralFee,
    closingFee,
    totalFees,
    netProceeds,
    profit,
    marginPercent,
    effectiveFeeRatePercent,
  };
}
