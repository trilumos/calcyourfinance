/**
 * ───────────────────────────────────────────────────────────────────────────
 *  PLATFORM FEES — single source of truth (PLAN §1, §2 "Fees handling")
 * ───────────────────────────────────────────────────────────────────────────
 *  Keyed [platform][country]. Editing a number here updates every dependent
 *  single AND comparison calculator + country.
 *
 *  EVERY entry carries source (official pricing page) + verifiedOn (YYYY-MM-DD).
 *  When you re-verify, bump verifiedOn — the page renders it.
 * ───────────────────────────────────────────────────────────────────────────
 */

import type { CountryCode } from "../lib/countries";

const VERIFIED = "2026-06-09";

/* ===========================================================================
   STRIPE — standard online card processing (domestic cards)
   Source: per-country Stripe pricing pages (stripe.com/<cc>/pricing)
   intlSurchargePercent = extra % for non-domestic cards on top of `percent`.
   fxPercent = currency-conversion surcharge when conversion is required.
   =========================================================================== */
export interface FeeRate {
  percent: number;
  fixed: number;
  currency: string;
  intlSurchargePercent?: number;
  fxPercent?: number;
  /** Tax levied on the fee itself (e.g. 18% GST on Stripe fees in India). */
  taxOnFeePercent?: number;
  taxLabel?: string; // e.g. "GST", "VAT"
  notes?: string;
  source: string;
  verifiedOn: string;
}
export type PlatformFees = Partial<Record<CountryCode, FeeRate>>;

const STRIPE_SRC = (cc: string) => `https://stripe.com/${cc}/pricing`;

// Eurozone members share Stripe's standard EEA-card rate (1.5% + €0.25;
// international 3.25% + €0.25; +2% currency conversion).
const STRIPE_EURO = (cc: string): FeeRate => ({
  percent: 1.5,
  fixed: 0.25,
  currency: "EUR",
  intlSurchargePercent: 1.75,
  fxPercent: 2,
  notes: "Standard EEA cards 1.5% + €0.25; UK cards 2.5%; international 3.25% + €0.25.",
  source: STRIPE_SRC(cc),
  verifiedOn: VERIFIED,
});

export const stripeFees: PlatformFees = {
  US: { percent: 2.9, fixed: 0.3, currency: "USD", intlSurchargePercent: 1.5, fxPercent: 1, source: STRIPE_SRC("us"), verifiedOn: VERIFIED },
  GB: { percent: 1.5, fixed: 0.2, currency: "GBP", intlSurchargePercent: 1.75, fxPercent: 2, notes: "EEA cards 2.5% + 20p; international 3.25% + 20p.", source: STRIPE_SRC("gb"), verifiedOn: VERIFIED },
  CA: { percent: 2.9, fixed: 0.3, currency: "CAD", intlSurchargePercent: 0.8, source: STRIPE_SRC("ca"), verifiedOn: VERIFIED },
  AU: { percent: 1.7, fixed: 0.3, currency: "AUD", intlSurchargePercent: 1.8, fxPercent: 2, notes: "International cards 3.5% + A$0.30.", source: STRIPE_SRC("au"), verifiedOn: VERIFIED },
  EU: { percent: 1.5, fixed: 0.25, currency: "EUR", intlSurchargePercent: 1.75, fxPercent: 2, notes: "UK cards 2.5% + €0.25; international 3.25% + €0.25.", source: STRIPE_SRC("ie"), verifiedOn: VERIFIED },
  IN: { percent: 2, fixed: 0, currency: "INR", intlSurchargePercent: 1, fxPercent: 2, taxOnFeePercent: 18, taxLabel: "GST", notes: "Indian cards 2%; international 3%. 18% GST applies on Stripe fees.", source: STRIPE_SRC("in"), verifiedOn: VERIFIED },
  SG: { percent: 3.4, fixed: 0.5, currency: "SGD", intlSurchargePercent: 0.5, fxPercent: 2, source: STRIPE_SRC("sg"), verifiedOn: VERIFIED },
  BR: { percent: 3.99, fixed: 0.39, currency: "BRL", intlSurchargePercent: 2, source: STRIPE_SRC("br"), verifiedOn: VERIFIED },
  JP: { percent: 3.6, fixed: 0, currency: "JPY", intlSurchargePercent: 0, fxPercent: 2, notes: "International cards 3.6%; +2% on currency conversion.", source: STRIPE_SRC("jp"), verifiedOn: VERIFIED },
  NZ: { percent: 2.65, fixed: 0.3, currency: "NZD", intlSurchargePercent: 0.85, fxPercent: 2, notes: "International cards 3.5% + NZ$0.30.", source: STRIPE_SRC("nz"), verifiedOn: VERIFIED },
  HK: { percent: 3.4, fixed: 2.35, currency: "HKD", intlSurchargePercent: 0.5, fxPercent: 2, source: STRIPE_SRC("hk"), verifiedOn: VERIFIED },
  MX: { percent: 3.6, fixed: 3, currency: "MXN", intlSurchargePercent: 0.5, fxPercent: 2, source: STRIPE_SRC("mx"), verifiedOn: VERIFIED },
  MY: { percent: 3, fixed: 1, currency: "MYR", intlSurchargePercent: 1, fxPercent: 2, source: STRIPE_SRC("my"), verifiedOn: VERIFIED },
  SE: { percent: 1.5, fixed: 1.8, currency: "SEK", intlSurchargePercent: 1.75, fxPercent: 2, notes: "EEA cards 1.5% + 1.80 kr; international 3.25% + 1.80 kr.", source: STRIPE_SRC("se"), verifiedOn: VERIFIED },
  DE: STRIPE_EURO("de"),
  FR: STRIPE_EURO("fr"),
  ES: STRIPE_EURO("es"),
  IT: STRIPE_EURO("it"),
  NL: STRIPE_EURO("nl"),
  IE: STRIPE_EURO("ie"),
  BE: STRIPE_EURO("be"),
  AT: STRIPE_EURO("at"),
};

/** Stripe add-on product fees, added on top of the processing percentage. */
export const stripeAddOns = {
  billingPercent: 0.7, // Stripe Billing (recurring / subscriptions)
  invoicingPercent: 0.4, // Stripe Invoicing (one-time invoices)
  billingSource: "https://stripe.com/billing/pricing",
  invoicingSource: "https://stripe.com/invoicing/pricing",
};

/* ===========================================================================
   PAYPAL — commercial transactions (receiving money)
   Source: PayPal merchant/business fee pages per region.
   Modeled as named rate variants + a cross-border surcharge.
   =========================================================================== */
export interface PayPalVariant {
  /** stable id used by the calculator's transaction-type select */
  id: string;
  label: string;
  percent: number;
  fixed: number;
}
export interface PayPalFees {
  currency: string;
  variants: PayPalVariant[];
  /** extra % for international/cross-border senders (added to percent). */
  crossBorderPercent: number;
  /** spread added on top of the exchange rate when converting currency. */
  currencyConversionPercent: number;
  notes?: string;
  source: string;
  verifiedOn: string;
}
export type PayPalFeesByCountry = Partial<Record<CountryCode, PayPalFees>>;

export const paypalFees: PayPalFeesByCountry = {
  US: {
    currency: "USD",
    variants: [
      { id: "checkout", label: "PayPal Checkout / online store", percent: 3.49, fixed: 0.49 },
      { id: "goods", label: "Goods & Services (receive money)", percent: 2.99, fixed: 0.49 },
      { id: "micro", label: "Micropayments (small sales)", percent: 4.99, fixed: 0.09 },
    ],
    crossBorderPercent: 1.5,
    currencyConversionPercent: 3,
    notes: "US fixed fee $0.49; micropayments fixed $0.09. Cross-border +1.5%; currency conversion ~3%.",
    source: "https://www.paypal.com/us/webapps/mpp/merchant-fees",
    verifiedOn: VERIFIED,
  },
  GB: {
    currency: "GBP",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 2.9, fixed: 0.3 },
    ],
    crossBorderPercent: 1.99, // EEA senders +1.29%; rest of world +1.99%
    currencyConversionPercent: 3,
    notes: "Cross-border +1.29% (EEA) or +1.99% (rest of world); currency conversion ~3%.",
    source: "https://www.paypal.com/uk/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
};

/* ===========================================================================
   ETSY — seller fees
   Listing fee ($0.20) and transaction fee (6.5%) are global; payment
   processing varies by country. Source: Etsy Fees & Payments Policy + Help.
   =========================================================================== */
export interface EtsyFees {
  /** Per-item listing fee (USD-denominated globally, billed in shop currency). */
  listingFee: number;
  /** % of item price + shipping + gift wrap. */
  transactionPercent: number;
  /** Payment processing for this country. */
  processing: { percent: number; fixed: number };
  /** Offsite Ads fee tiers (mandatory >$10k/yr). Capped per order. */
  offsiteAds: { under10k: number; over10k: number; capPerOrder: number };
  /** Mandatory regulatory operating fee % (countries with digital-services tax). */
  regulatoryPercent?: number;
  currency: string;
  notes?: string;
  source: string;
  verifiedOn: string;
}
export type EtsyFeesByCountry = Partial<Record<CountryCode, EtsyFees>>;

/** Etsy currency-conversion fee when the shop and payment currency differ. */
export const ETSY_CURRENCY_CONVERSION_PERCENT = 2.5;

const ETSY_BASE = {
  listingFee: 0.2,
  transactionPercent: 6.5,
  offsiteAds: { under10k: 15, over10k: 12, capPerOrder: 100 },
  source: "https://www.etsy.com/legal/fees/",
  verifiedOn: VERIFIED,
};
const ETSY_EU = { ...ETSY_BASE, processing: { percent: 4, fixed: 0.3 }, currency: "EUR" };

export const etsyFees: EtsyFeesByCountry = {
  US: { ...ETSY_BASE, processing: { percent: 3, fixed: 0.25 }, currency: "USD" },
  GB: { ...ETSY_BASE, processing: { percent: 4, fixed: 0.2 }, currency: "GBP", regulatoryPercent: 0.32 },
  CA: { ...ETSY_BASE, processing: { percent: 3, fixed: 0.25 }, currency: "CAD" },
  AU: { ...ETSY_BASE, processing: { percent: 3, fixed: 0.25 }, currency: "AUD" },
  EU: { ...ETSY_EU, notes: "A regulatory operating fee applies in some EU countries (e.g. France, Italy, Spain)." },
  DE: { ...ETSY_EU },
  FR: { ...ETSY_EU, regulatoryPercent: 0.47 },
  ES: { ...ETSY_EU, regulatoryPercent: 0.72 },
  IT: { ...ETSY_EU, regulatoryPercent: 0.32 },
  NL: { ...ETSY_EU },
};
