/**
 * eBay seller-fee math — PURE, fully unit-tested. BESPOKE (not the shared
 * marketplaceFee helper) because eBay's final value fee is TIERED: one rate on
 * the portion of the sale up to a breakpoint, a lower rate on the portion above
 * it. The fee base is the WHOLE sale (item + shipping/handling), per eBay.
 *
 * Components, in eBay's own order:
 *   1. Final value fee (FVF): tier1% up to breakpoint + tier2% on the excess,
 *      optionally capped at a per-item ceiling (e.g. AU A$440).
 *   2. Per-order fixed fee (e.g. $0.30 for orders ≤ $10, $0.40 above).
 *   3. International fee: a flat % of the sale total when the buyer is
 *      registered outside the seller's country (e.g. US +1.65%).
 *   4. Regulatory operating fee: a small % of the sale total (UK 0.35%, etc.).
 *   5. Promoted-listings ad fee: optional % of the sale total.
 *   6. Tax on the fees themselves (e.g. UK 20% VAT on eBay's fees). Applied to
 *      FVF + per-order + regulatory + ad (NOT the international fee, which eBay
 *      already states tax-inclusive where it applies). AU's 10% GST is already
 *      INCLUDED in the published rates, so AU passes taxOnFeePercent = 0.
 *
 * Private sellers in markets that abolished selling fees (UK, Germany) pay 0 —
 * the buyer pays a separate Buyer Protection fee instead. When privateSellerFree
 * is true and sellerType === "private", every seller-side fee is zero.
 *
 * Rounding discipline (mirrors _shared/marketplaceFee): round each money
 * component to cents first, then derive totals from the rounded parts so the
 * receipt the user sees always sums exactly.
 */
import { roundMoney, roundTo } from "../../lib/money";

export type SellerType = "business" | "private";

export interface EbayFeeInput {
  itemPrice: number;
  shipping?: number;
  itemCost?: number;
  /** Category final value fee % (tier-1, applied up to tierBreakpoint). */
  fvfPercent: number;
  /** Per-order fixed fee (already resolved for the ≤/> threshold). */
  perOrderFee: number;
  /** High-value tier: rate on the portion ABOVE the breakpoint. */
  tierBreakpoint?: number;
  tierPercent?: number;
  /** Optional per-item ceiling on the FVF (e.g. AU A$440). */
  fvfCap?: number;
  /** Extra % of the sale total for internationally-registered buyers. */
  internationalPercent?: number;
  international?: boolean;
  /** Regulatory operating fee % of the sale total (UK/EU markets). */
  regulatoryPercent?: number;
  /** Tax levied on eBay's fees (e.g. UK 20% VAT). 0 where fees are tax-inclusive. */
  taxOnFeePercent?: number;
  /** Optional promoted-listings ad rate, % of the sale total. */
  adPercent?: number;
  /** Where private sellers pay no selling fees (UK, DE). */
  sellerType?: SellerType;
  privateSellerFree?: boolean;
}

export interface EbayFeeBreakdown {
  revenue: number;
  finalValueFee: number;
  fixedFee: number;
  internationalFee: number;
  regulatoryFee: number;
  adFee: number;
  taxOnFee: number;
  totalFees: number;
  payout: number;
  profit: number;
  effectiveRatePercent: number;
  /** True when the result is zero because a private seller pays no fees. */
  privateFree: boolean;
}

export function computeEbayFee(input: EbayFeeInput): EbayFeeBreakdown {
  const {
    itemPrice,
    shipping = 0,
    itemCost = 0,
    fvfPercent,
    perOrderFee,
    tierBreakpoint,
    tierPercent,
    fvfCap,
    internationalPercent = 0,
    international = false,
    regulatoryPercent = 0,
    taxOnFeePercent = 0,
    adPercent = 0,
    sellerType = "business",
    privateSellerFree = false,
  } = input;

  const price = Math.max(0, Number.isFinite(itemPrice) ? itemPrice : 0);
  const ship = Math.max(0, Number.isFinite(shipping) ? shipping : 0);
  const cost = Number.isFinite(itemCost) ? itemCost : 0;
  const revenue = price + ship;

  const isPrivateFree = privateSellerFree && sellerType === "private";

  // No fees: payout = full revenue. Used for zero input and private-free markets.
  const noFees = (privateFree: boolean): EbayFeeBreakdown => ({
    revenue: roundMoney(revenue),
    finalValueFee: 0,
    fixedFee: 0,
    internationalFee: 0,
    regulatoryFee: 0,
    adFee: 0,
    taxOnFee: 0,
    totalFees: 0,
    payout: roundMoney(revenue),
    profit: roundMoney(revenue - cost),
    effectiveRatePercent: 0,
    privateFree,
  });

  if (revenue <= 0) return noFees(isPrivateFree);
  // Private seller in a zero-fee market: payout = full revenue, no fees.
  if (isPrivateFree) return noFees(true);

  // ── 1. Tiered final value fee ──────────────────────────────────────────
  let fvfRaw: number;
  if (tierBreakpoint != null && tierPercent != null && revenue > tierBreakpoint) {
    const base = tierBreakpoint * (fvfPercent / 100);
    const excess = (revenue - tierBreakpoint) * (tierPercent / 100);
    fvfRaw = base + excess;
  } else {
    fvfRaw = revenue * (fvfPercent / 100);
  }
  if (fvfCap != null) fvfRaw = Math.min(fvfRaw, fvfCap);

  // ── 2–5. Other fee components ──────────────────────────────────────────
  const fixedRaw = perOrderFee;
  const intlRaw = international ? revenue * (internationalPercent / 100) : 0;
  const regRaw = revenue * (regulatoryPercent / 100);
  const adRaw = revenue * (adPercent / 100);

  // Round components first.
  const finalValueFee = roundMoney(fvfRaw);
  const fixedFee = roundMoney(fixedRaw);
  const internationalFee = roundMoney(intlRaw);
  const regulatoryFee = roundMoney(regRaw);
  const adFee = roundMoney(adRaw);

  // ── 6. Tax on the fees (VAT). Applied to eBay's own fees: FVF + per-order
  //       + regulatory + ad. The international fee is excluded (eBay publishes
  //       it tax-inclusive where it applies). ───────────────────────────────
  const taxableFees = finalValueFee + fixedFee + regulatoryFee + adFee;
  const taxOnFee = roundMoney(taxableFees * (taxOnFeePercent / 100));

  const totalFees = roundMoney(
    finalValueFee + fixedFee + internationalFee + regulatoryFee + adFee + taxOnFee,
  );
  const revenueR = roundMoney(revenue);
  const payout = roundMoney(revenueR - totalFees);
  const profit = roundMoney(payout - cost);
  const effectiveRatePercent = revenueR > 0 ? roundTo((totalFees / revenueR) * 100, 2) : 0;

  return {
    revenue: revenueR,
    finalValueFee,
    fixedFee,
    internationalFee,
    regulatoryFee,
    adFee,
    taxOnFee,
    totalFees,
    payout,
    profit,
    effectiveRatePercent,
    privateFree: false,
  };
}
