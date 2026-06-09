/**
 * Etsy fee math — PURE, fully unit-tested.
 * Etsy charges, per sale: a $0.20 listing fee, a 6.5% transaction fee on the
 * item price + shipping the buyer pays, a country-specific payment-processing
 * fee, and (optionally) an Offsite Ads fee capped per order. We also subtract
 * the seller's own item cost to show profit.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface EtsyFeeInput {
  itemPrice: number;
  shipping: number; // shipping charged to the buyer
  itemCost?: number; // seller's cost of goods (for profit)
  listingFee: number; // typically 0.20
  transactionPercent: number; // typically 6.5
  processingPercent: number;
  processingFixed: number;
  offsiteAds?: boolean;
  offsiteAdsPercent?: number; // 15 (<$10k/yr) or 12 (>$10k/yr)
  offsiteAdsCap?: number; // per-order cap, e.g. 100
  regulatoryPercent?: number; // mandatory regulatory operating fee % (some countries)
  currencyConversionPercent?: number; // 2.5% when shop/payment currency differ
}

export interface EtsyFeeBreakdown {
  revenue: number; // item + shipping (what the buyer pays you)
  listingFee: number;
  transactionFee: number;
  processingFee: number;
  offsiteAdsFee: number;
  regulatoryFee: number;
  conversionFee: number;
  totalFees: number;
  payout: number; // revenue − Etsy fees
  profit: number; // payout − item cost
  takeRatePercent: number; // fees as % of revenue
}

export function computeEtsyFee(input: EtsyFeeInput): EtsyFeeBreakdown {
  const {
    itemPrice,
    shipping,
    itemCost = 0,
    listingFee,
    transactionPercent,
    processingPercent,
    processingFixed,
    offsiteAds = false,
    offsiteAdsPercent = 15,
    offsiteAdsCap = 100,
    regulatoryPercent = 0,
    currencyConversionPercent = 0,
  } = input;

  const price = Number.isFinite(itemPrice) && itemPrice > 0 ? itemPrice : 0;
  const ship = Number.isFinite(shipping) && shipping > 0 ? shipping : 0;
  const revenue = roundMoney(price + ship);

  if (revenue <= 0) {
    return {
      revenue: 0, listingFee: 0, transactionFee: 0, processingFee: 0,
      offsiteAdsFee: 0, regulatoryFee: 0, conversionFee: 0,
      totalFees: 0, payout: 0, profit: 0, takeRatePercent: 0,
    };
  }

  const transactionFee = roundMoney(revenue * (transactionPercent / 100));
  const processingFee = roundMoney(revenue * (processingPercent / 100) + processingFixed);
  const offsiteAdsFee = offsiteAds
    ? roundMoney(Math.min(revenue * (offsiteAdsPercent / 100), offsiteAdsCap))
    : 0;
  const regulatoryFee = roundMoney(revenue * (regulatoryPercent / 100));
  const conversionFee = roundMoney(revenue * (currencyConversionPercent / 100));

  const totalFees = roundMoney(
    listingFee + transactionFee + processingFee + offsiteAdsFee + regulatoryFee + conversionFee,
  );
  const payout = roundMoney(revenue - totalFees);
  const profit = roundMoney(payout - (itemCost > 0 ? itemCost : 0));
  const takeRatePercent = roundTo((totalFees / revenue) * 100, 2);

  return {
    revenue,
    listingFee: roundMoney(listingFee),
    transactionFee,
    processingFee,
    offsiteAdsFee,
    regulatoryFee,
    conversionFee,
    totalFees,
    payout,
    profit,
    takeRatePercent,
  };
}
