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

// Eurozone PayPal: standard "commercial transaction / Checkout" rate + a
// micropayments plan. Cross-border is +1.29% (UK) / +1.99% (rest of world);
// EEA senders +0%. Currency conversion ~3%. Standard rate varies by country
// (DE 2.99%, FR/ES 2.90%, others 3.40%) so each is passed in explicitly.
const PAYPAL_EUR_NOTE =
  "Cross-border +1.29% (UK) or +1.99% (rest of world); EEA senders +0%. Currency conversion ~3%.";
const paypalEuro = (
  cc: string,
  std: [number, number],
  micro: [number, number],
): PayPalFees => ({
  currency: "EUR",
  variants: [
    { id: "checkout", label: "Commercial transaction / Checkout", percent: std[0], fixed: std[1] },
    { id: "micro", label: "Micropayments (small sales)", percent: micro[0], fixed: micro[1] },
  ],
  crossBorderPercent: 1.99,
  currencyConversionPercent: 3,
  notes: PAYPAL_EUR_NOTE,
  source: `https://www.paypal.com/${cc}/business/paypal-business-fees`,
  verifiedOn: VERIFIED,
});

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
  CA: {
    currency: "CAD",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 2.9, fixed: 0.3 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.05 },
    ],
    crossBorderPercent: 1.0, // US senders +0.80%; rest of world +1.00%
    currencyConversionPercent: 4,
    notes: "Cross-border +0.80% (US) or +1.00% (rest of world); currency conversion ~4%.",
    source: "https://www.paypal.com/ca/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  AU: {
    currency: "AUD",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 2.9, fixed: 0.3 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.05 },
    ],
    crossBorderPercent: 1.0,
    currencyConversionPercent: 4,
    notes: "Cross-border +1.00% for all international payments; currency conversion ~4%.",
    source: "https://www.paypal.com/au/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  SG: {
    currency: "SGD",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.9, fixed: 0.5 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.5, fixed: 0.08 },
    ],
    crossBorderPercent: 0.5,
    currencyConversionPercent: 3,
    notes: "Cross-border +0.50%; currency conversion ~3%.",
    source: "https://www.paypal.com/sg/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  JP: {
    currency: "JPY",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.6, fixed: 40 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 7 },
    ],
    crossBorderPercent: 0.5,
    currencyConversionPercent: 4,
    notes: "Cross-border +0.50%; currency conversion ~4%.",
    source: "https://www.paypal.com/jp/webapps/mpp/merchant-fees",
    verifiedOn: VERIFIED,
  },
  NZ: {
    currency: "NZD",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.4, fixed: 0.45 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.08 },
    ],
    crossBorderPercent: 1.0,
    currencyConversionPercent: 4,
    notes: "Cross-border +1.00%; currency conversion ~4%.",
    source: "https://www.paypal.com/nz/webapps/mpp/merchant-fees",
    verifiedOn: VERIFIED,
  },
  HK: {
    currency: "HKD",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.9, fixed: 2.35 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.39 },
    ],
    crossBorderPercent: 0.5,
    currencyConversionPercent: 4,
    notes: "Cross-border +0.50%; currency conversion ~4%.",
    source: "https://www.paypal.com/hk/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  MX: {
    currency: "MXN",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.95, fixed: 4 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.55 },
    ],
    crossBorderPercent: 0.5,
    currencyConversionPercent: 3.5,
    notes: "Cross-border +0.50%; currency conversion ~3.5%. Mexican IVA (VAT) applies on top of PayPal fees.",
    source: "https://www.paypal.com/mx/webapps/mpp/merchant-fees",
    verifiedOn: VERIFIED,
  },
  MY: {
    currency: "MYR",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.9, fixed: 2 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.5, fixed: 0.2 },
    ],
    crossBorderPercent: 0.5,
    currencyConversionPercent: 4,
    notes: "Cross-border +0.50%; currency conversion ~4%.",
    source: "https://www.paypal.com/my/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  SE: {
    currency: "SEK",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.4, fixed: 3.25 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.54 },
    ],
    crossBorderPercent: 1.99,
    currencyConversionPercent: 3,
    notes: PAYPAL_EUR_NOTE,
    source: "https://www.paypal.com/se/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  IN: {
    currency: "INR",
    variants: [
      { id: "checkout", label: "International commercial transaction", percent: 4.4, fixed: 3 },
      { id: "micro", label: "Micropayments (small sales)", percent: 6.0, fixed: 0.25 },
    ],
    crossBorderPercent: 0, // India PayPal supports international payments only — the base rate already reflects cross-border.
    currencyConversionPercent: 3,
    notes: "PayPal India supports international payments only; the 4.40% rate already reflects cross-border. Currency conversion ~3%.",
    source: "https://www.paypal.com/in/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  BR: {
    currency: "BRL",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 4.79, fixed: 0.6 },
      { id: "micro", label: "Micropayments (small sales)", percent: 9.5, fixed: 0.1 },
    ],
    crossBorderPercent: 1.61,
    currencyConversionPercent: 3.5,
    notes: "Cross-border +1.61%; currency conversion ~3.5%.",
    source: "https://www.paypal.com/br/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
  DE: paypalEuro("de", [2.99, 0.39], [4.99, 0.09]),
  FR: paypalEuro("fr", [2.9, 0.35], [5.0, 0.1]),
  ES: paypalEuro("es", [2.9, 0.35], [5.0, 0.05]),
  IT: paypalEuro("it", [3.4, 0.35], [5.0, 0.1]),
  NL: paypalEuro("nl", [3.4, 0.35], [5.0, 0.05]),
  IE: paypalEuro("ie", [3.4, 0.35], [5.0, 0.05]),
  BE: paypalEuro("be", [3.4, 0.35], [5.0, 0.05]),
  AT: paypalEuro("at", [3.4, 0.35], [5.0, 0.1]),
  EU: {
    currency: "EUR",
    variants: [
      { id: "checkout", label: "Commercial transaction / Checkout", percent: 3.4, fixed: 0.35 },
      { id: "micro", label: "Micropayments (small sales)", percent: 5.0, fixed: 0.05 },
    ],
    crossBorderPercent: 1.99,
    currencyConversionPercent: 3,
    notes:
      "Representative Eurozone rate; the standard rate varies by country (e.g. Germany 2.99% + €0.39, France/Spain 2.90% + €0.35). " +
      PAYPAL_EUR_NOTE,
    source: "https://www.paypal.com/ie/business/paypal-business-fees",
    verifiedOn: VERIFIED,
  },
};

/* ===========================================================================
   SQUARE — payment processing (free/standard plan)
   Source: official squareup.com/<cc> pricing/fee pages. Modeled as named rate
   variants (online / in-person / keyed) like PayPal, plus a foreign-card
   surcharge. The surcharge reflects the ONLINE (card-not-present) rate, which
   is this calculator's default and the one used in comparisons. Ireland adds
   VAT on top of the fee (modeled via taxOnFeePercent, like India GST on Stripe).
   =========================================================================== */
export interface SquareVariant {
  id: string;
  label: string;
  percent: number;
  fixed: number;
}
export interface SquareFees {
  currency: string;
  variants: SquareVariant[]; // [0] = online (default + comparison rate)
  /** Extra % for cards issued outside the country (online card-not-present). */
  intlSurchargePercent: number;
  /** Tax levied on the fee itself (e.g. 23% Irish VAT on Square fees). */
  taxOnFeePercent?: number;
  taxLabel?: string;
  notes?: string;
  source: string;
  verifiedOn: string;
}
export type SquareFeesByCountry = Partial<Record<CountryCode, SquareFees>>;

const SQUARE_SRC = (path: string) => `https://squareup.com/${path}`;
const sqVariants = (
  online: [number, number],
  inperson: [number, number],
  keyed: [number, number],
): SquareVariant[] => [
  { id: "online", label: "Online / e-commerce", percent: online[0], fixed: online[1] },
  { id: "inperson", label: "In person (tap, dip, swipe)", percent: inperson[0], fixed: inperson[1] },
  { id: "keyed", label: "Manually keyed / card on file", percent: keyed[0], fixed: keyed[1] },
];

export const squareFees: SquareFeesByCountry = {
  US: {
    currency: "USD",
    variants: sqVariants([3.3, 0.3], [2.6, 0.15], [3.5, 0.15]),
    intlSurchargePercent: 0,
    notes: "Free plan online rate 3.3% + $0.30 (paid plans / Web Payments API are 2.9% + $0.30). No published international surcharge.",
    source: SQUARE_SRC("us/en/payments/our-fees"),
    verifiedOn: VERIFIED,
  },
  CA: {
    currency: "CAD",
    variants: sqVariants([2.8, 0.3], [2.5, 0], [3.3, 0.15]),
    intlSurchargePercent: 1.5,
    notes: "+1.5% on cards issued outside Canada (all transaction types).",
    source: SQUARE_SRC("ca/en/pricing"),
    verifiedOn: VERIFIED,
  },
  AU: {
    currency: "AUD",
    variants: sqVariants([2.2, 0], [1.6, 0], [2.2, 0]),
    intlSurchargePercent: 0,
    notes: "No fixed per-transaction fee, no international surcharge. In-person 1.6% applies to accounts opened after 30 May 2024 (earlier accounts 1.9%).",
    source: SQUARE_SRC("au/en/payments/our-fees"),
    verifiedOn: VERIFIED,
  },
  JP: {
    currency: "JPY",
    variants: sqVariants([3.6, 0], [2.5, 0], [3.75, 0]),
    intlSurchargePercent: 0,
    notes: "No fixed per-transaction fee. In-person 2.5% applies to major brands under ¥30M/yr; higher-volume sellers pay more.",
    source: SQUARE_SRC("jp/ja/pricing"),
    verifiedOn: VERIFIED,
  },
  GB: {
    currency: "GBP",
    variants: sqVariants([1.4, 0.25], [1.75, 0], [2.5, 0]),
    intlSurchargePercent: 1.1, // online: UK 1.4% → non-UK 2.5% (+£0.25 either way)
    notes: "Online rate is for UK cards; non-UK online cards are 2.5% + £0.25. Card-present non-UK adds +1.5%.",
    source: SQUARE_SRC("gb/en/pricing"),
    verifiedOn: VERIFIED,
  },
  IE: {
    currency: "EUR",
    variants: sqVariants([1.4, 0.25], [1.75, 0], [2, 0]),
    intlSurchargePercent: 1.5, // online: EEA 1.4% → non-EEA 2.9%
    taxOnFeePercent: 23,
    taxLabel: "VAT",
    notes: "Irish VAT (23%) applies on top of Square's fee. Online rate is for EU/EEA cards; non-EEA online cards are 2.9% + €0.25.",
    source: SQUARE_SRC("ie/en/pricing"),
    verifiedOn: VERIFIED,
  },
  FR: {
    currency: "EUR",
    variants: sqVariants([1.4, 0.25], [1.65, 0], [2, 0]),
    intlSurchargePercent: 1.5, // online: EEA 1.4% → non-EEA 2.9%
    notes: "Online rate is for EU/EEA cards; non-EEA online cards are 2.9% + €0.25. Card-present non-EEA adds +1.5%.",
    source: SQUARE_SRC("fr/fr/pricing"),
    verifiedOn: VERIFIED,
  },
  ES: {
    currency: "EUR",
    variants: sqVariants([1.4, 0.25], [1.25, 0.05], [2, 0]),
    intlSurchargePercent: 1.5, // online: EEA 1.4% → non-EEA 2.9%
    notes: "Online rate is for EU/EEA cards; non-EEA online cards are 2.9% + €0.25. Card-present non-EEA adds +1.5%.",
    source: SQUARE_SRC("es/es/pricing"),
    verifiedOn: VERIFIED,
  },
};

/* ===========================================================================
   VENMO & CASH APP — US-only P2P/business wallets
   Flat percentage (+ small fixed for Venmo business) by transaction type.
   No per-country variation (US only). Source: official help/fees pages.
   =========================================================================== */
export interface WalletVariant {
  id: string;
  label: string;
  percent: number;
  fixed: number;
}
export interface WalletFees {
  currency: string;
  variants: WalletVariant[]; // [0] = the default/primary business rate
  notes?: string;
  source: string;
  verifiedOn: string;
}
export type WalletFeesByCountry = Partial<Record<CountryCode, WalletFees>>;

export const venmoFees: WalletFeesByCountry = {
  US: {
    currency: "USD",
    variants: [
      { id: "business", label: "Business profile payment", percent: 1.9, fixed: 0.1 },
      { id: "goods", label: "Goods & Services (personal account)", percent: 2.99, fixed: 0 },
      { id: "instant", label: "Instant transfer (cash out)", percent: 1.75, fixed: 0 },
    ],
    notes:
      "US-only. Business profile 1.9% + $0.10; a Goods & Services flag on a personal account is 2.99%. Instant transfer 1.75% (min $0.25, max $25); standard transfer is free.",
    source: "https://venmo.com/resources/our-fees",
    verifiedOn: "2026-06-10",
  },
};

export const cashappFees: WalletFeesByCountry = {
  US: {
    currency: "USD",
    variants: [
      { id: "business", label: "Business account payment", percent: 2.75, fixed: 0 },
      { id: "instant", label: "Instant deposit (cash out)", percent: 1.75, fixed: 0 },
      { id: "creditcard", label: "Sent with a credit card", percent: 3, fixed: 0 },
    ],
    notes:
      "US-only. Business accounts pay 2.75% per payment received (no fixed fee). Instant deposit 0.5%–1.75% (min $0.25); standard deposit is free. Sending funded by a credit card is 3%.",
    source: "https://cash.app/help/us/en-us/6521-cash-app-for-business-fees",
    verifiedOn: "2026-07-22",
  },
};

/* ===========================================================================
   WISE (ex-TransferWise) — international transfers
   total fee = fixed + (% × send amount), charged in the SOURCE currency, on
   top of the MID-MARKET rate (Wise adds no FX markup). The fixed fee tracks the
   funding/source currency (USD ≈ $7, GBP ≈ £0.6–1.1, EUR ≈ €1–1.5). We model
   the FEE (stable); the exchange rate is live, so we don't hardcode it.
   Source: Wise public comparison API + wise.com/pricing.
   =========================================================================== */
export interface WiseCorridor {
  from: string; // source (sending) currency
  to: string; // target (receiving) currency
  pct: number; // variable % on the send amount
  fixed: number; // fixed fee in the SOURCE currency
}
export const WISE_VERIFIED = "2026-06-11";
export const WISE_SOURCE = "https://wise.com/us/pricing/";

/** Keyed "FROM-TO". Standard bank-funded (ACH/SEPA/Faster Payments) transfers. */
export const wiseCorridors: Record<string, WiseCorridor> = {
  "USD-EUR": { from: "USD", to: "EUR", pct: 0.289, fixed: 6.98 },
  "USD-GBP": { from: "USD", to: "GBP", pct: 0.329, fixed: 7.0 },
  "USD-INR": { from: "USD", to: "INR", pct: 0.418, fixed: 7.08 },
  "USD-AUD": { from: "USD", to: "AUD", pct: 0.28, fixed: 7.14 },
  "USD-CAD": { from: "USD", to: "CAD", pct: 0.279, fixed: 7.36 },
  "USD-PHP": { from: "USD", to: "PHP", pct: 0.567, fixed: 6.98 },
  "USD-MXN": { from: "USD", to: "MXN", pct: 0.498, fixed: 7.1 },
  "GBP-EUR": { from: "GBP", to: "EUR", pct: 0.329, fixed: 0.59 },
  "GBP-USD": { from: "GBP", to: "USD", pct: 0.359, fixed: 1.09 },
  "EUR-USD": { from: "EUR", to: "USD", pct: 0.468, fixed: 1.53 },
  "EUR-GBP": { from: "EUR", to: "GBP", pct: 0.478, fixed: 0.99 },
};

/* ===========================================================================
   PAYONEER — receiving money (freelancers / sellers)
   Receiving fee varies by HOW the client pays; an optional 0.5% balance
   conversion. Withdrawal to bank (flat 1.50 same-currency, or a 1.2–4% band
   with conversion) is explained in copy, not modeled (not published per route).
   Source: payoneer.com/about/pricing. Annual fee $29.95 if low activity.
   =========================================================================== */
export interface PayoneerMethod {
  id: string;
  label: string;
  percent: number;
  fixed: number;
}
export const PAYONEER_VERIFIED = "2026-07-22";
export const PAYONEER_SOURCE = "https://www.payoneer.com/about/pricing/";
export const PAYONEER_CONVERSION_PERCENT = 0.5;

export const payoneerReceiving: PayoneerMethod[] = [
  { id: "card", label: "Client pays by card or PayPal", percent: 3.99, fixed: 0.49 },
  { id: "ach", label: "Client pays by ACH bank debit (US)", percent: 1, fixed: 0 },
  { id: "bank", label: "Client bank transfer / different currency", percent: 1, fixed: 0 },
  { id: "local", label: "Local-currency account or marketplace", percent: 0, fixed: 0 },
  { id: "p2p", label: "From another Payoneer account", percent: 0, fixed: 0 },
];

/* ===========================================================================
   RAZORPAY & PAYTM — India payment gateways (platform fee + 18% GST)
   The % is a PLATFORM fee charged even on zero-MDR UPI/RuPay (Razorpay), or 0%
   on UPI for Paytm's small-merchant tier. GST (18%) applies on the fee, not the
   transaction. Source: official pricing pages. fixed fee is ₹0 for all methods.
   =========================================================================== */
export interface MethodRate {
  id: string;
  label: string;
  percent: number;
}
export const INDIA_GST_PERCENT = 18;

export const RAZORPAY_SOURCE = "https://razorpay.com/pricing/";
export const razorpayMethods: MethodRate[] = [
  { id: "domestic", label: "Domestic cards / UPI / netbanking / wallets", percent: 2 },
  { id: "corporate", label: "Corporate / business cards", percent: 2.15 },
  { id: "intl", label: "International / Amex / Diners cards", percent: 3 },
];

export const PAYTM_SOURCE = "https://business.paytm.com/pricing";
export const paytmMethods: MethodRate[] = [
  { id: "upi", label: "UPI / RuPay debit", percent: 0 },
  { id: "debit", label: "Visa / Mastercard debit", percent: 0.4 },
  { id: "credit", label: "Credit cards", percent: 1.99 },
  { id: "amex", label: "American Express", percent: 2.75 },
  { id: "diners", label: "Diners / JCB / UnionPay", percent: 3.5 },
  { id: "intl", label: "International cards", percent: 2.99 },
];

/* ===========================================================================
   PADDLE & LEMON SQUEEZY — Merchant of Record (SaaS / digital products)
   The fee INCLUDES payment processing + sales-tax/VAT compliance (do not add a
   separate processor fee). Both are 5% + $0.50; Lemon Squeezy adds +1.5% on
   international cards. Source: official pricing pages.
   =========================================================================== */
export const MOR_VERIFIED = "2026-07-22";
export const paddleFees = {
  percent: 5,
  fixed: 0.5,
  source: "https://www.paddle.com/pricing",
  verifiedOn: MOR_VERIFIED,
};
export const lemonSqueezyFees = {
  percent: 5,
  fixed: 0.5,
  intlSurchargePercent: 1.5, // non-US cards
  source: "https://docs.lemonsqueezy.com/help/getting-started/fees",
  verifiedOn: MOR_VERIFIED,
};

/* ===========================================================================
   PAYPAL — international consumer send (for the Wise vs PayPal comparison)
   5% transfer fee (min $0.99, max $4.99 — effectively flat $4.99 over ~$100)
   PLUS a ~4% currency-conversion markup hidden in a worse exchange rate (vs
   Wise's mid-market rate). Source: paypal.com consumer fees.
   =========================================================================== */
export const paypalIntlSend = {
  sendFeePercent: 5,
  sendFeeMin: 0.99,
  sendFeeMax: 4.99,
  fxMarkupPercent: 4, // recipient gets a different currency → 4% (not 3%)
  source: "https://www.paypal.com/us/digital-wallet/paypal-consumer-fees",
  verifiedOn: "2026-06-11",
};

/* ===========================================================================
   POSHMARK — seller fees (fashion resale marketplace)
   ───────────────────────────────────────────────────────────────────────────
   Fee model: flat fee for sales STRICTLY BELOW the threshold; percentage (of
   sale price only — buyer pays shipping separately) for sales AT OR ABOVE the
   threshold. No separate payment-processing fee; the % is all-inclusive.

   Active markets as of 2026-06-12: US and Canada only.
   Australia and India shut down on 2023-11-02.

   US:  sales < $15  → $2.95 flat;  $15+  → 20%   (USD)
   CA:  sales < C$20 → C$3.95 flat; C$20+ → 20%   (CAD)

   Sources:
     https://support.poshmark.com/s/article/297755057  (US)
     https://poshmark.ca/fee_policy                    (CA)
   =========================================================================== */
export interface PoshmarkFees {
  /** Flat fee for sales strictly below `threshold` (in local currency). */
  flatFee: number;
  /** Sales threshold (exclusive): at this price and above, use `percent`. */
  threshold: number;
  /** Selling % applied to the sale price for sales >= threshold. */
  percent: number;
  currency: string;
  source: string;
  verifiedOn: string;
}
export type PoshmarkFeesByCountry = Partial<Record<CountryCode, PoshmarkFees>>;

export const POSHMARK_VERIFIED = "2026-06-12";

export const poshmarkFees: PoshmarkFeesByCountry = {
  US: {
    flatFee: 2.95,
    threshold: 15,
    percent: 20,
    currency: "USD",
    source: "https://support.poshmark.com/s/article/297755057",
    verifiedOn: POSHMARK_VERIFIED,
  },
  CA: {
    flatFee: 3.95,
    threshold: 20,
    percent: 20,
    currency: "CAD",
    source: "https://poshmark.ca/fee_policy",
    verifiedOn: POSHMARK_VERIFIED,
  },
  // AU: closed 2023-11-02 (https://techcrunch.com/2023/10/19/poshmark-is-shutting-down-in-australia-india-and-the-uk)
  // IN: closed 2023-11-02 (same announcement)
};

/* ===========================================================================
   REVERB — seller fees (music-gear marketplace, US-only Reverb Payments)
   Selling fee: 5% of (item price + shipping), min $0.50, capped at $500/order.
   Processing fee (standard seller):   3.19% + $0.49 per transaction.
   Processing fee (Preferred Seller):  2.99% + $0.49 per transaction.
   The $500 cap applies to the SELLING FEE only; processing is not capped.
   Sources:
     https://help.reverb.com/hc/en-us/articles/40917652290843
     https://help.reverb.com/hc/en-us/articles/41988469262107
   =========================================================================== */
export interface ReverbFees {
  /** Selling fee % on (item + shipping). */
  sellingPercent: number;
  /** Per-order minimum on the selling fee. */
  sellingFeeMin: number;
  /** Per-order cap on the selling fee (not on processing). */
  sellingFeeCap: number;
  /** Payment processing % (standard Reverb Payments seller). */
  processingPercent: number;
  /** Payment processing % (Reverb Preferred Seller program). */
  preferredProcessingPercent: number;
  /** Fixed per-transaction processing fee (same for standard and preferred). */
  processingFixed: number;
  currency: string;
  source: string;
  preferredSource: string;
  verifiedOn: string;
}

export const REVERB_VERIFIED = "2026-08-06";

export const reverbFees: ReverbFees = {
  sellingPercent: 5,
  sellingFeeMin: 0.5,
  sellingFeeCap: 500,
  processingPercent: 3.19,
  preferredProcessingPercent: 2.99,
  processingFixed: 0.49,
  currency: "USD",
  source: "https://help.reverb.com/hc/en-us/articles/40917652290843-What-fees-will-I-pay-for-selling-on-Reverb",
  preferredSource: "https://help.reverb.com/hc/en-us/articles/41988469262107-What-are-my-fees-as-a-Reverb-Preferred-Seller",
  verifiedOn: REVERB_VERIFIED,
};

/* ===========================================================================
   EBAY — seller final value fees (country-aware, category-tiered)
   ───────────────────────────────────────────────────────────────────────────
   eBay's "final value fee" (FVF) is a category-dependent % of the WHOLE sale
   (item + shipping/handling + tax) PLUS a fixed per-order fee. Most categories
   are TIERED: a headline rate up to a breakpoint, a much lower rate on the
   portion above it. Extras: an international fee when the buyer is registered
   abroad, a regulatory operating fee (UK/EU), and (UK) 20% VAT on the fees.

   PRIVATE vs BUSINESS: the UK (since Oct 2024) and Germany (since Mar 2023)
   abolished SELLING fees for PRIVATE sellers — the BUYER pays a separate Buyer
   Protection fee instead. Business sellers still pay the full FVF. Markets with
   privateSellerFree:true must show a private seller £0 seller fees.

   COUNTRY SET — we ship ONLY countries whose current rate card we could verify
   on 2026-06-11 (US, GB, AU, CA). Germany (mid-2026 category overhaul to flat
   5%/7% recommerce rates) and the other EU markets (fragmented per-category
   data) are intentionally EXCLUDED rather than ship a guessed number.

   Sources (per entry below):
     US: https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822
         + https://www.ebay.com/help/selling/fees-credits-invoices/international-fees-ebay-global-sellers?id=5224
     GB: https://www.ebay.co.uk/help/selling/fees-credits-invoices/fees-business-sellers-activated-managed-payments?id=4809
         + https://www.ebay.co.uk/help/buying/paying-items/buyer-protection-fee?id=5594 (private)
     AU: https://www.ebay.com.au/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers-without-ebay-store?id=4822
     CA: https://www.ebay.ca/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers?id=4822
   eBay's own US worked example cross-check: 13.6% × $210.50 + $0.40 = $29.03. ✓
   =========================================================================== */
export const EBAY_VERIFIED = "2026-06-11";

export interface EbayCategory {
  /** stable id for the category <select> */
  id: string;
  label: string;
  /** Headline final value fee % (applied up to `tierBreakpoint`). */
  percent: number;
  /** Rate on the portion of the sale ABOVE the breakpoint (high-value tier). */
  tierPercent?: number;
  /** Breakpoint where the rate drops to `tierPercent` (in the local currency). */
  tierBreakpoint?: number;
  /** Optional note shown on the category (e.g. price condition). */
  note?: string;
}

export interface EbayFees {
  currency: string;
  /** Per-order fixed fee: `low` for orders ≤ `threshold`, else `high`. */
  perOrder: { low: number; high: number; threshold: number };
  /** Extra % of the sale total for internationally-registered buyers. */
  internationalPercent: number;
  /** Regulatory operating fee % of the sale total (UK/EU). */
  regulatoryPercent?: number;
  /** Tax levied ON eBay's fees (UK VAT 20%). Omit where fees are tax-inclusive. */
  taxOnFeePercent?: number;
  taxLabel?: string;
  /** Optional per-item ceiling on the FVF (e.g. AU A$440). */
  fvfCap?: number;
  /** Whether PRIVATE sellers pay no selling fees in this market (UK, DE). */
  privateSellerFree?: boolean;
  categories: EbayCategory[]; // [0] = "most categories" default
  notes?: string;
  source: string;
  intlSource?: string;
  privateSource?: string;
  verifiedOn: string;
}
export type EbayFeesByCountry = Partial<Record<CountryCode, EbayFees>>;

const EBAY_US_SRC =
  "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822";
const EBAY_INTL_SRC =
  "https://www.ebay.com/help/selling/fees-credits-invoices/international-fees-ebay-global-sellers?id=5224";

export const ebayFees: EbayFeesByCountry = {
  // ── United States ──────────────────────────────────────────────────────
  // Most categories 13.6% up to $7,500, 2.35% above; per-order $0.30 (≤$10)
  // / $0.40 (>$10); international +1.65% of the sale total.
  US: {
    currency: "USD",
    perOrder: { low: 0.3, high: 0.4, threshold: 10 },
    internationalPercent: 1.65,
    categories: [
      { id: "most", label: "Most categories", percent: 13.6, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "books", label: "Books, DVDs, Music, Movies & TV", percent: 15.3, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "coins", label: "Coins & Paper Money (most)", percent: 13.25, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "cards", label: "Trading Cards (most)", percent: 13.25, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "guitars", label: "Guitars & Basses", percent: 6.7, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "bullion", label: "Bullion", percent: 13.6, tierPercent: 7, tierBreakpoint: 7500 },
      { id: "jewelry", label: "Jewelry & Watches", percent: 15, tierPercent: 9, tierBreakpoint: 5000 },
      { id: "handbags", label: "Women's Handbags", percent: 15, tierPercent: 9, tierBreakpoint: 2000 },
      { id: "sneakers", label: "Sneakers selling for $150+", percent: 8, note: "Flat 8% on athletic shoes priced $150 or more; no per-order fee." },
      { id: "nft", label: "NFTs", percent: 5, note: "Flat 5%." },
    ],
    notes:
      "Most categories 13.6% on the total sale up to $7,500, then 2.35% on the portion above. Per-order fee $0.30 for orders $10 or less, $0.40 over $10. International fee +1.65% when the buyer is registered outside the US. Sneakers $150+ are a flat 8% with no per-order fee.",
    source: EBAY_US_SRC,
    intlSource: EBAY_INTL_SRC,
    verifiedOn: EBAY_VERIFIED,
  },

  // ── United Kingdom ─────────────────────────────────────────────────────
  // PRIVATE sellers: £0 selling fees since Oct 2024 — buyer pays a separate
  // Buyer Protection fee. BUSINESS sellers: category FVF + 0.35% regulatory
  // operating fee + £0.30/£0.40 per-order + 20% VAT ON the fees. Most
  // categories sit around 12.9% (clothing/most general goods).
  GB: {
    currency: "GBP",
    perOrder: { low: 0.3, high: 0.4, threshold: 10 },
    internationalPercent: 2, // representative rest-of-world rate; EU/N.Europe lower
    regulatoryPercent: 0.35,
    taxOnFeePercent: 20,
    taxLabel: "VAT",
    privateSellerFree: true,
    categories: [
      { id: "most",       label: "Most categories (home, garden, toys, sporting goods…)", percent: 10.9 },
      { id: "clothing",   label: "Clothes, Shoes & Accessories", percent: 11.9 },
      { id: "industrial", label: "Business, Office & Industrial", percent: 12.5 },
      { id: "other",      label: "Pet Supplies / Crafts / Event Tickets / Everything Else", percent: 12.9 },
      { id: "media",      label: "Books, Music, Films & Media", percent: 9.9 },
      { id: "tech",       label: "Computers, Cameras, Mobiles & Sound (banded)", percent: 6.9, tierPercent: 3, tierBreakpoint: 1000 },
      { id: "jewellery",  label: "Jewellery & Watches (banded)", percent: 14.9, tierPercent: 4, tierBreakpoint: 1000 },
    ],
    notes:
      "UK PRIVATE sellers pay £0 selling fees (since Oct 2024) — buyers pay a separate Buyer Protection fee instead. BUSINESS sellers pay a category final value fee (most categories 10.9% on item + postage; clothing 11.9%; tech/cameras 6.9% banded; jewellery 14.9% banded), plus a 0.35% regulatory operating fee, a £0.30/£0.40 per-order fee, and 20% VAT on top of those fees (reclaimable if VAT-registered). Some categories are 'banded' (a higher rate up to a threshold, a lower rate above). Most categories have a £250 per-item FVF cap (not modelled).",
    source:
      "https://www.ebay.co.uk/help/selling/fees-credits-invoices/fees-business-sellers-activated-managed-payments?id=4809",
    intlSource: EBAY_INTL_SRC,
    privateSource: "https://www.ebay.co.uk/help/buying/paying-items/buyer-protection-fee?id=5594",
    verifiedOn: EBAY_VERIFIED,
  },

  // ── Australia ──────────────────────────────────────────────────────────
  // Most categories 13.4% up to A$4,000, 2.4% above; per-item cap A$440;
  // per-order $0.30/$0.40; international +3% (incl GST, from 12 May 2026).
  // Selling fees are GST-INCLUSIVE (10% already baked in), so no VAT add-on.
  AU: {
    currency: "AUD",
    perOrder: { low: 0.3, high: 0.4, threshold: 10 },
    internationalPercent: 3,
    fvfCap: 440,
    categories: [
      { id: "most", label: "Most categories", percent: 13.4, tierPercent: 2.4, tierBreakpoint: 4000 },
    ],
    notes:
      "Most categories 13.4% on the total sale up to A$4,000, then 2.4% above, capped at A$440 per item. Per-order fee $0.30 ($10 or less) / $0.40 (over $10). International fee +3% (incl. GST) when the buyer is registered outside Australia. Fees are GST-inclusive (10% GST is already included in the rates).",
    source:
      "https://www.ebay.com.au/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers-without-ebay-store?id=4822",
    intlSource: EBAY_INTL_SRC,
    verifiedOn: EBAY_VERIFIED,
  },

  // ── Canada ─────────────────────────────────────────────────────────────
  // Mirrors the US structure: most categories 13.6% up to CAD 7,500, 2.35%
  // above; per-order $0.30/$0.40. International fee applies when selling abroad.
  CA: {
    currency: "CAD",
    perOrder: { low: 0.3, high: 0.4, threshold: 10 },
    internationalPercent: 1.65,
    categories: [
      { id: "most", label: "Most categories", percent: 13.6, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "books", label: "Books, DVDs, Music, Movies & TV", percent: 14.95, tierPercent: 2.35, tierBreakpoint: 7500 },
      { id: "guitars", label: "Guitars & Basses", percent: 6.35, tierPercent: 2.35, tierBreakpoint: 7500 },
    ],
    notes:
      "Most categories 13.6% on the total sale up to CAD 7,500, then 2.35% above. Per-order fee $0.30 (orders $10 or less) / $0.40 (over $10). An international fee applies when the buyer is registered outside Canada.",
    source: "https://www.ebay.ca/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers?id=4822",
    intlSource: EBAY_INTL_SRC,
    verifiedOn: EBAY_VERIFIED,
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
  IE: { ...ETSY_EU },
  BE: { ...ETSY_EU },
  AT: { ...ETSY_EU },
  SE: { ...ETSY_BASE, processing: { percent: 4, fixed: 3 }, currency: "SEK" },
  SG: { ...ETSY_BASE, processing: { percent: 4.4, fixed: 0.35 }, currency: "SGD" },
  HK: { ...ETSY_BASE, processing: { percent: 4.4, fixed: 2 }, currency: "HKD" },
  NZ: {
    ...ETSY_BASE,
    processing: { percent: 4, fixed: 0.3 },
    currency: "NZD",
    notes: "Etsy lists processing as 3–4% + NZ$0.30 depending on the card; the upper figure is shown for a conservative payout estimate.",
  },
  MX: { ...ETSY_BASE, processing: { percent: 4.5, fixed: 10 }, currency: "MXN" },
  IN: {
    ...ETSY_BASE,
    processing: { percent: 5, fixed: 25 },
    currency: "INR",
    regulatoryPercent: 0.29,
    notes:
      "Etsy lists processing as 3–5% + ₹25 depending on the card; the upper figure is shown for a conservative payout estimate. Payouts settle in USD via Payoneer. The 0.29% regulatory operating fee is scheduled to drop to 0.05% on 2026-06-22.",
    source: "https://www.etsy.com/in-en/sell",
  },
};

/* ===========================================================================
   MERCARI — marketplace seller & buyer fees
   ───────────────────────────────────────────────────────────────────────────
   US (mercari.com) — current structure effective January 6, 2025:
     SELLER: 10% flat selling fee on (item price + buyer-paid shipping).
             No separate payment processing fee (eliminated Jan 6, 2025).
     BUYER:  3.6% Buyer Protection fee on (item price + buyer-paid shipping).
             No payment processing fee (was $0.50 + 2.9%, removed Jan 6, 2025).
   NOTE: Between Mar 27, 2024 – Jan 5, 2025 Mercari ran a zero-seller-fee
   experiment; the 10% seller fee was reinstated on Jan 6, 2025.

   Japan (jp.mercari.com) — current:
     SELLER: 10% selling fee on the sale price.
     No separate buyer fee (buyer pays item price + optional payment surcharge
     for convenience store / ATM payments — not modelled here).

   Sources:
     https://www.mercari.com/us/help_center/article/169/  (Fees on Mercari US)
     https://www.mercari.com/us/help_center/article/2517/ (Fee structure change history)
     https://www.mercari.com/us/help_center/article/2518/ (FAQ — new fee structure)
     https://help.jp.mercari.com/guide/articles/65/       (Mercari Japan fees)
   =========================================================================== */
export interface MercariFees {
  /** Seller selling fee % on (item price + buyer-paid shipping). */
  sellingPercent: number;
  /**
   * Buyer Protection fee % (US only) — informational; does NOT reduce seller
   * payout. Displayed as "what the buyer pays on top of your listed price."
   */
  buyerProtectionPercent?: number;
  currency: string;
  source: string;
  verifiedOn: string;
}

export const MERCARI_VERIFIED = "2026-06-12";

export const mercariFeesUS: MercariFees = {
  sellingPercent: 10,
  buyerProtectionPercent: 3.6,
  currency: "USD",
  source: "https://www.mercari.com/us/help_center/article/169/",
  verifiedOn: MERCARI_VERIFIED,
};

export const mercariFeesJP: MercariFees = {
  sellingPercent: 10,
  currency: "JPY",
  source: "https://help.jp.mercari.com/guide/articles/65/",
  verifiedOn: MERCARI_VERIFIED,
};

/* ===========================================================================
   DEPOP — marketplace seller & buyer fees (fashion resale, Gen-Z)
   ───────────────────────────────────────────────────────────────────────────
   Depop has TWO distinct fee regimes depending on where the seller is based:

   US sellers  (USD sales, US-located):
     SELLER: 0% selling fee — removed July 15, 2024 for USD/US sellers.
             Payment processing fee: 3.3% + $0.45 (Depop Payments, US).
     BUYER:  Marketplace fee of up to 5% of item price + up to $1 fixed
             (added at checkout by Depop; does NOT reduce seller payout).
             Effective from July 18, 2024.

   UK sellers  (GBP sales, UK-located):
     SELLER: 0% selling fee — removed March 20, 2024 (new listings from
             that date). Payment processing fee: 2.9% + £0.30 (Depop Payments).
     BUYER:  Marketplace fee of up to 5% of item price + up to £1 fixed
             (added at checkout by Depop; does NOT reduce seller payout).
             Effective from April 15, 2024.

   Rest of world (all other countries / non-USD/GBP sales):
     SELLER: 10% flat selling fee on item price (and self-arranged shipping
             if not using Depop's prepaid label). Payment processing via
             PayPal (rates vary by country and account type).
     BUYER:  No separate Buyer Marketplace fee (known for US/UK only).

   NOTE: The 10% seller fee previously applied globally (including US and
   UK). The US zero-fee change took effect July 15, 2024; the UK change took
   effect March 20, 2024. International sellers (outside US/UK) still pay 10%.

   Sources:
     https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/
     https://news.depop.com/company-news/evolving-our-fee-structure-with-zero-selling-fees-on-depop/
     https://depophelp.zendesk.com/hc/en-gb/articles/360001791127-Seller-fees-and-charges
     https://crosslist.com/blog/depop-seller-fees  (secondary, verified numbers)
   =========================================================================== */
export interface DepopFees {
  /** Seller selling fee % on item price (0 for US/UK; 10 for rest-of-world). */
  sellingPercent: number;
  /** Payment processing fee % on total transaction (item + shipping + tax). */
  processingPercent: number;
  /** Payment processing fixed fee per transaction. */
  processingFixed: number;
  /**
   * Buyer Marketplace fee % — informational; does NOT reduce seller payout.
   * Depop adds this to the item price at buyer checkout. US/UK only.
   */
  buyerMarketplacePercent?: number;
  /**
   * Buyer Marketplace fee fixed cap per transaction (in local currency).
   * The buyer fee is "up to X% + up to $Y/£Y" — we model the maximums for
   * a conservative / realistic buyer-total display.
   */
  buyerMarketplaceFixedMax?: number;
  currency: string;
  notes?: string;
  source: string;
  verifiedOn: string;
}

export const DEPOP_VERIFIED = "2026-08-06";

/* ===========================================================================
   VINTED — buyer protection fee (platform-fee marketplace)
   ───────────────────────────────────────────────────────────────────────────
   Vinted charges SELLERS ZERO fees. Sellers keep 100% of their listed price.
   The BUYER pays a "Buyer Protection fee" at checkout — this is ADDED to the
   item price and does NOT reduce the seller's payout.

   Buyer Protection fee formula:
     Standard tier (item < highValueThreshold):
       buyerFee = buyerProtectionFixed + buyerProtectionPercent% × itemPrice
     High-value tier (item ≥ highValueThreshold):
       buyerFee = highValuePercent% × itemPrice  (no fixed fee)

   EUR markets (FR, DE, NL, BE, ES, IT, AT, IE):
     Standard: €0.70 + 5%   for items < €500
     High-value: 2%          for items ≥ €500
     Source: https://www.vinted.com/pricelist

   GB (UK):
     Vinted's official UK pricelist describes the fee as "usually 3% to 8% +
     £0.30 to £0.80" — the fee is dynamic/algorithmic and is displayed at
     checkout per item. We model the REPRESENTATIVE rate of 5% + £0.70
     (matching the EUR equivalent published for other markets) with the same
     high-value tier structure. The actual fee a buyer sees may differ.
     Source: https://www.vinted.co.uk/pricelist

   PL (Poland):
     Standard: PLN 2.90 + 5%  for items < PLN 2,500 (~EUR 500 equivalent)
     High-value: 2%             for items ≥ PLN 2,500
     Source: https://www.newsendip.com/vinted-fine-1-2-million-in-poland-for-a-lack-of-transparency-on-its-platform/
             (confirmed in UOKiK penalty case, 2024)

   EXCLUDED markets (not included because exact rates could not be verified
   against an official source):
     CZ: CZK rate not confirmed; Vinted.cz help page was inaccessible.
     LT: Vinted.lt returned HTTP 403 during verification.
     LU: No standalone pricelist found; likely same EUR formula.
   =========================================================================== */

export interface VintedFees {
  /** Buyer Protection % for standard-tier items (below highValueThreshold). */
  buyerProtectionPercent: number;
  /** Fixed fee (local currency) added to standard-tier buyer fee. */
  buyerProtectionFixed: number;
  /** Item price at/above which the high-value (lower) tier applies. */
  highValueThreshold: number;
  /** Buyer Protection % for high-value items (no fixed fee at this tier). */
  highValuePercent: number;
  currency: string;
  /**
   * If true, the fee formula is dynamic/algorithmic (like GB). The stored
   * values are representative; actual fees shown at Vinted checkout may differ.
   */
  dynamic?: boolean;
  notes?: string;
  source: string;
  verifiedOn: string;
}
export type VintedFeesByCountry = Partial<Record<CountryCode, VintedFees>>;

export const VINTED_VERIFIED = "2026-06-12";

const VINTED_EUR_SRC = "https://www.vinted.com/pricelist";

/** Standard EUR market config (FR, DE, NL, BE, ES, IT, AT, IE). */
const vintedEurFees = (_cc: string): VintedFees => ({
  buyerProtectionPercent: 5,
  buyerProtectionFixed: 0.7,
  highValueThreshold: 500,
  highValuePercent: 2,
  currency: "EUR",
  source: VINTED_EUR_SRC,
  verifiedOn: VINTED_VERIFIED,
});

export const vintedFees: VintedFeesByCountry = {
  GB: {
    buyerProtectionPercent: 5,
    buyerProtectionFixed: 0.7,
    highValueThreshold: 500,
    highValuePercent: 2,
    currency: "GBP",
    dynamic: true,
    notes:
      'Vinted UK\'s official pricelist states the fee is "usually 3% to 8% + £0.30 to £0.80" — the fee is dynamic and varies by item. This calculator shows a representative rate of 5% + £0.70 (matching the published EUR equivalent). The actual Buyer Protection fee is always clearly displayed at Vinted checkout before purchase.',
    source: "https://www.vinted.co.uk/pricelist",
    verifiedOn: VINTED_VERIFIED,
  },
  FR: vintedEurFees("fr"),
  DE: vintedEurFees("de"),
  NL: vintedEurFees("nl"),
  BE: vintedEurFees("be"),
  ES: vintedEurFees("es"),
  IT: vintedEurFees("it"),
  AT: vintedEurFees("at"),
  IE: vintedEurFees("ie"),
  PL: {
    buyerProtectionPercent: 5,
    buyerProtectionFixed: 2.9,
    highValueThreshold: 2500,
    highValuePercent: 2,
    currency: "PLN",
    notes:
      "PLN 2.90 + 5% for items below PLN 2,500; 2% for items at or above PLN 2,500 (approx. EUR 500 equivalent). Confirmed from UOKiK transparency case (2024).",
    source:
      "https://www.newsendip.com/vinted-fine-1-2-million-in-poland-for-a-lack-of-transparency-on-its-platform/",
    verifiedOn: VINTED_VERIFIED,
  },
};

/* ===========================================================================
   STOCKX — seller fees (sneaker/streetwear/collectibles authentication marketplace)
   ───────────────────────────────────────────────────────────────────────────
   StockX charges the SELLER two fees on every completed sale:

   1. Transaction fee — depends on the seller's LEVEL (quarterly performance):
      Level 1 (default / new): 9%
      Level 2 (≥12 quarterly sales or $1,500 quarterly revenue): 8.5%
      Level 3 (≥40 quarterly sales or $5,000 quarterly revenue): 8.0%
      Level 4 (≥200 quarterly sales or $25,000 quarterly revenue): 7.5%
      Level 5 (≥800 quarterly sales or $100,000 quarterly revenue): 7.0%

   2. Payment processing fee: 3% (flat, all levels)

   Regional minimum total fee (transaction component floored):
      USD $5.00 | CAD $7.00 | EUR €5.00 | GBP £4.50 | AUD $7.50 | JPY ¥800
      HKD $45.00 | SGD $7.00 | KRW ₩7,500 | CHF $4.50 | MXN $100 | NZD $16.00

   Fees apply to the final sale price. StockX provides a prepaid outbound shipping
   label — the shipping cost ($5 USD for standard non-Flex sales as of March 1, 2026)
   is deducted from the seller's payout separately (not modelled as a calculator fee;
   noted in copy).

   Seller levels reset quarterly (Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec). Sellers
   retain their achieved level through the current quarter plus the following quarter.

   Effective dates: the fee table above was in effect from the launch of the Seller
   Program through to the March 1, 2026 update. The Flex fulfillment fee ($5 USD) was
   removed on March 1, 2026; Flex transaction fees now match the standard rates above.

   Sources:
     https://stockx.com/help/articles/what-are-stockxs-fees-for-sellers
     https://stockx.com/help/articles/What-is-the-StockX-Seller-Program-What-are-Seller-Levels
     https://stockx.com/news/updates-to-the-stockx-seller-program/
   =========================================================================== */

export interface StockXLevel {
  id: string;
  label: string;
  /** Quarterly sales count required to reach/maintain this level (or 0 for L1). */
  quarterlySales: number;
  /** Quarterly revenue threshold (USD) — either sales count OR revenue qualifies. */
  quarterlyRevenue: number;
  /** Transaction fee % applied to the final sale price. */
  transactionPercent: number;
}

export interface StockXFees {
  levels: StockXLevel[];
  /** Payment processing fee % (all levels, applied to final sale price). */
  processingPercent: number;
  /** Minimum transaction fee per sale in USD (other currencies have their own min). */
  feeMinUSD: number;
  currency: string;
  source: string;
  levelSource: string;
  newsSource: string;
  verifiedOn: string;
}

export const STOCKX_VERIFIED = "2026-07-22";

export const stockxFees: StockXFees = {
  levels: [
    { id: "level1", label: "Level 1 (new seller)",           quarterlySales: 0,   quarterlyRevenue: 0,      transactionPercent: 9   },
    { id: "level2", label: "Level 2 (12 sales / $1,500)",    quarterlySales: 12,  quarterlyRevenue: 1500,   transactionPercent: 8.5 },
    { id: "level3", label: "Level 3 (40 sales / $5,000)",    quarterlySales: 40,  quarterlyRevenue: 5000,   transactionPercent: 8   },
    { id: "level4", label: "Level 4 (200 sales / $25,000)",  quarterlySales: 200, quarterlyRevenue: 25000,  transactionPercent: 7.5 },
    { id: "level5", label: "Level 5 (800 sales / $100,000)", quarterlySales: 800, quarterlyRevenue: 100000, transactionPercent: 7   },
  ],
  processingPercent: 3,
  feeMinUSD: 5,
  currency: "USD",
  source: "https://stockx.com/help/articles/what-are-stockxs-fees-for-sellers",
  levelSource: "https://stockx.com/help/articles/What-is-the-StockX-Seller-Program-What-are-Seller-Levels",
  newsSource: "https://stockx.com/news/updates-to-the-stockx-seller-program/",
  verifiedOn: STOCKX_VERIFIED,
};

/* ===========================================================================
   TIKTOK SHOP — seller referral (commission) fees
   ───────────────────────────────────────────────────────────────────────────
   TikTok Shop charges ONE fee per order to sellers: a REFERRAL FEE (their term
   for what other platforms call a commission or selling fee). There is no
   separate per-order payment-processing fee charged to sellers — the referral
   fee is all-inclusive for sellers.

   UNITED STATES
     Standard referral fee: 6% of (order value + platform discount − tax).
     Effective April 1, 2024 (raised from the early-access ~2% promotional rate).
     Category exceptions (effective October 31, 2024):
       Precious Jewelry subcategories (Diamond, Gold, Jade, Platinum/Carat Gold,
         Ruby/Sapphire/Emerald): 5%
       Pre-Owned subcategories (Bags, Collectible Trading Cards, Luggage & Travel,
         Watches, Footwear, Refurbished Phones & Electronics, Fashion Accessories,
         Menswear, Womenswear, Collectible Coins & Paper Money, Collectible Figures,
         Collectible Comic Books): 5% (3% on any portion above $10,000)
     New seller promotional rate: 3% for the first 30 days after first sale
       (requires at least 1 sale within 60 days of onboarding to qualify).
     Refund Administration Fee: 20% of the referral fee on refunded orders,
       capped at $5 per SKU (effective May 15, 2025). NOT modelled as a
       per-sale deduction (it applies to refunds, not completed sales).

   UNITED KINGDOM
     Standard commission fee: 9% (VAT-inclusive), established by September 2024.
     Applied to: (Net sales + Customer-paid shipping fee + Platform discount)
       minus refund amounts.
     No separate payment-processing fee for sellers.

   COUNTRIES EXCLUDED from this calculator:
     SEA (Indonesia, Malaysia, Thailand, Vietnam, Singapore, Philippines):
       TikTok Shop launched but published rates are highly promotional (0–2%)
       with transition timelines not yet confirmed beyond 2026.
     EU (Germany, France, Spain, Italy, Ireland): moved to 9% in Jan 2026 but
       the commission page was not publicly accessible without a seller account
       during verification on 2026-06-12.

   Sources:
     https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018
       (TikTok Shop Referral Fee Updates — 2024, US)
     https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682
       (TikTok Shop Referral Fees in 2024 by Category, US)
     https://seller-uk.tiktok.com/university/essay?knowledge_id=3337893683398432
       (TikTok Shop UK Commission Rate Policy)
   =========================================================================== */

export interface TikTokShopFees {
  /** Standard referral/commission fee % on the order total. */
  referralPercent: number;
  /**
   * Reduced referral fee % for special categories (precious jewelry, pre-owned).
   * Only populated for markets that publish a category discount.
   */
  reducedPercent?: number;
  /**
   * New-seller promotional referral fee % for the first `promodays` days.
   * Only US publishes a confirmed promo rate.
   */
  promoPercent?: number;
  /** Duration of the new-seller promotional rate (days). */
  promoDays?: number;
  currency: string;
  notes?: string;
  source: string;
  verifiedOn: string;
}

export type TikTokShopFeesByCountry = Partial<Record<CountryCode, TikTokShopFees>>;

export const TIKTOK_SHOP_VERIFIED = "2026-08-06";

export const tiktokShopFees: TikTokShopFeesByCountry = {
  // ── United States ──────────────────────────────────────────────────────
  // Standard 6% referral fee since Apr 1, 2024. 5% for precious jewelry and
  // pre-owned subcategories (effective Oct 31, 2024). New sellers pay 3% for
  // the first 30 days after their first sale.
  US: {
    referralPercent: 6,
    reducedPercent: 5,
    promoPercent: 3,
    promoDays: 30,
    currency: "USD",
    notes:
      "Standard 6% referral fee effective April 1, 2024. Precious jewelry (Diamond, Gold, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald) and pre-owned subcategories are 5% effective October 31, 2024. New sellers pay 3% for the first 30 days after their first sale (requires 1 sale within 60 days of onboarding). No separate payment-processing fee charged to sellers — the referral fee is all-inclusive. A Refund Administration Fee of 20% of the referral fee (capped at $5 per SKU) applies to refunded orders but is not a per-sale charge.",
    source: "https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018",
    verifiedOn: TIKTOK_SHOP_VERIFIED,
  },

  // ── United Kingdom ─────────────────────────────────────────────────────
  // Standard 9% commission fee (VAT-inclusive) since ~September 2024.
  // No category-level reduced rate published. No separate processing fee.
  GB: {
    referralPercent: 9,
    currency: "GBP",
    notes:
      "Standard 9% commission fee (VAT-inclusive). Applied to (net sales + customer-paid shipping + platform discount − refunds). No separate payment-processing fee charged to sellers. New-seller introductory rates were offered historically but are not a published standing promotional structure.",
    source: "https://seller-uk.tiktok.com/university/essay?knowledge_id=3337893683398432",
    verifiedOn: TIKTOK_SHOP_VERIFIED,
  },
};

/* ===========================================================================
   WHATNOT — live-auction marketplace seller fees
   ───────────────────────────────────────────────────────────────────────────
   Whatnot charges sellers TWO fees per completed sale:

   1. Commission (on the ITEM PRICE only — shipping and taxes excluded):
      US / CA / AU (standard): 8%
      UK / EU (standard):      6.67% + VAT (= ~8% inc. 20% UK VAT)
      Electronics (US/CA/AU):  5%
      Coins & Money (all):     4% (+ VAT in UK/EU)

   2. Payment processing fee (on the TOTAL ORDER VALUE — item + shipping + tax):
      US / CA / AU:  2.9% + $0.30 (USD/CAD/AUD)
      UK / EU:       2.42% + £0.25 / €0.25

   The standard 8% (US/CA/AU) or 6.67%+VAT (UK/EU) covers most categories.
   Category promotions (electronics 5%, coins 4%) and high-value promos
   (0% above $1,500 on certain categories) exist but are not modelled as
   the primary calculator — the standard rate is used. Sellers are advised
   to check the Help Center for the latest promotions.

   Premier Shop program: 10% reduction in commission (e.g. 8% → 7.2%).

   Note on UK VAT: the UK commission is quoted VAT-exclusive on the fee
   schedule (6.67% + VAT at 20% = effectively ~8%). We store the VAT-exclusive
   rate and surface the note in copy.

   Sources:
     https://help.whatnot.com/hc/en-us/articles/4847069165965
     https://crosslist.com/blog/whatnot-fees-for-sellers (secondary verification)
   =========================================================================== */
export interface WhatnotFees {
  /** Commission % on the item's final sale price (VAT-exclusive for UK). */
  commissionPercent: number;
  /** If true, the commissionPercent is VAT-exclusive (UK/EU). */
  vatOnCommission?: boolean;
  /** VAT rate applied to the commission (e.g. 20 for UK). */
  vatPercent?: number;
  /** Payment processing % on total order value (item + shipping + tax). */
  processingPercent: number;
  /** Fixed per-transaction processing fee (local currency). */
  processingFixed: number;
  currency: string;
  source: string;
  verifiedOn: string;
}
export type WhatnotFeesByCountry = Partial<Record<CountryCode, WhatnotFees>>;

export const WHATNOT_VERIFIED = "2026-06-12";

export const whatnotFees: WhatnotFeesByCountry = {
  // ── United States ──────────────────────────────────────────────────────
  // 8% commission on item price; 2.9% + $0.30 processing on full order.
  US: {
    commissionPercent: 8,
    processingPercent: 2.9,
    processingFixed: 0.30,
    currency: "USD",
    source: "https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule",
    verifiedOn: WHATNOT_VERIFIED,
  },
  // ── United Kingdom ─────────────────────────────────────────────────────
  // 6.67% + 20% UK VAT on commission (= ~8% inc. VAT); 2.42% + £0.25 processing.
  GB: {
    commissionPercent: 6.67,
    vatOnCommission: true,
    vatPercent: 20,
    processingPercent: 2.42,
    processingFixed: 0.25,
    currency: "GBP",
    source: "https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule",
    verifiedOn: WHATNOT_VERIFIED,
  },
  // ── Canada ─────────────────────────────────────────────────────────────
  // Same rate structure as US: 8% commission + 2.9% + $0.30 processing.
  CA: {
    commissionPercent: 8,
    processingPercent: 2.9,
    processingFixed: 0.30,
    currency: "CAD",
    source: "https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule",
    verifiedOn: WHATNOT_VERIFIED,
  },
  // ── Australia ──────────────────────────────────────────────────────────
  // Same rate structure as US: 8% commission + 2.9% + $0.30 processing.
  AU: {
    commissionPercent: 8,
    processingPercent: 2.9,
    processingFixed: 0.30,
    currency: "AUD",
    source: "https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule",
    verifiedOn: WHATNOT_VERIFIED,
  },
};

/* ===========================================================================
   FACEBOOK MARKETPLACE — selling fees for shipped orders (US)
   ───────────────────────────────────────────────────────────────────────────
   Facebook Marketplace charges sellers only on SHIPPED orders that use
   Facebook's checkout. LOCAL PICKUP orders are FREE (no selling fee).

   Fee model (effective April 15, 2024 — doubled from previous 5%/$0.40):
     Shipped order ≥ $8:  10% of the sale price
     Shipped order < $8:  $0.80 flat minimum fee

   The 10% covers payment processing, customer support, and Purchase
   Protection — there is NO separate processing fee on top.

   The fee applies per shipment (not per item), charged on the item price.
   Instagram Shop uses the same fee structure under Meta Checkout.

   LOCAL PICKUP: sellers pay $0 — no checkout fee whatsoever.

   Sources:
     https://www.facebook.com/business/help/223030991929920
     https://litcommerce.com/blog/facebook-marketplace-fees/  (secondary)
     https://www.accio.com/blog/facebook-marketplace-selling-fees-all-you-need-to-know (secondary)
   =========================================================================== */
export interface FacebookFees {
  /** Selling fee % for shipped orders at or above the threshold. */
  shippedPercent: number;
  /** Minimum flat fee per shipment for orders strictly below the threshold. */
  shippedMinFee: number;
  /** Price threshold below which the minimum flat fee applies (exclusive). */
  threshold: number;
  /** Local pickup fee — always 0. */
  localPickupFee: number;
  currency: string;
  source: string;
  verifiedOn: string;
}

export const FACEBOOK_VERIFIED = "2026-07-22";

export const facebookFees: FacebookFees = {
  shippedPercent: 10,
  shippedMinFee: 0.80,
  threshold: 8,
  localPickupFee: 0,
  currency: "USD",
  source: "https://www.facebook.com/business/help/223030991929920",
  verifiedOn: FACEBOOK_VERIFIED,
};

/* ===========================================================================
   WALMART MARKETPLACE — seller referral fees (US, USD only)
   ───────────────────────────────────────────────────────────────────────────
   Walmart Marketplace charges sellers a REFERRAL FEE (their term for the
   commission) on every completed sale. There is NO monthly subscription fee,
   no setup fee, and no per-listing fee — fees are only deducted when a sale
   is made.

   FEE BASIS: The referral fee is calculated on the TOTAL SALES PRICE, which
   Walmart defines as: item price + shipping and handling + gift wrap and any
   other charges paid by the buyer. There is NO minimum referral fee per item.

   FULFILLMENT: Walmart Fulfillment Services (WFS) is an optional, separate
   fulfilment program with its own cost schedule. WFS fees are NOT included
   in this calculator — only the referral fee is modelled here.

   RATE MECHANIC: Two distinct tiering styles exist:
     "switch"   — the ENTIRE item gets one flat rate based on which price
                  band the total falls into (like a tax bracket boundary flip).
                  e.g. Apparel ≤$15 → 5%; $15–$20 → 10%; >$20 → 15%.
     "marginal" — the PORTION of the price above the breakpoint is charged
                  the lower rate (true bracket math, like income tax).
                  e.g. Compact Appliances: first $300 at 12%, remainder at 8%.

   Source: https://marketplace.walmart.com/pricing/
   Verified: 2026-06-13
   =========================================================================== */

export type WalmartRateMechanic = "flat" | "switch" | "marginal";

export interface WalmartCategory {
  /** stable id used by the calculator's category <select> */
  id: string;
  /** Human-readable label shown in the select dropdown. */
  label: string;
  /** Primary referral fee % (applied up to `tier1Threshold` or to all). */
  percent: number;
  /**
   * For "switch": items priced strictly above this → second tier rate.
   *   - If a second threshold exists, `percent2` applies between the two thresholds.
   * For "marginal": the portion above this threshold → `percent2`.
   * Omit for plain flat-rate categories.
   */
  tier1Threshold?: number;
  /** Rate for the second band (required when tier1Threshold is set). */
  percent2?: number;
  /** For "switch" three-band categories (e.g. Apparel): items strictly above this → `percent3`. */
  tier2Threshold?: number;
  /** Rate for the third band (required when tier2Threshold is set). */
  percent3?: number;
  /**
   * "flat"     — single rate for all prices (default).
   * "switch"   — entire item is taxed at one rate based on which price band it falls in.
   * "marginal" — lower rate applies only to the PORTION above the threshold.
   */
  mechanic: WalmartRateMechanic;
  /** Optional display note (e.g. special sub-category exception). */
  note?: string;
}

export interface WalmartFees {
  currency: string;
  categories: WalmartCategory[];
  source: string;
  verifiedOn: string;
}

export const WALMART_VERIFIED = "2026-06-13";
export const WALMART_SOURCE = "https://marketplace.walmart.com/pricing/";

export const walmartFees: WalmartFees = {
  currency: "USD",
  source: WALMART_SOURCE,
  verifiedOn: WALMART_VERIFIED,
  categories: [
    // ── Flat rate — single % regardless of price ──────────────────────────
    {
      id: "most",
      label: "Most categories (default)",
      percent: 15,
      mechanic: "flat",
      note: "Applies to most categories not listed separately (e.g. Home, Kitchen, Toys, Books, Music, Pet Supplies, Tools & Home Improvement, Luggage, Shoes, Software, Video & DVD).",
    },
    {
      id: "appliances_major",
      label: "Appliances — Major",
      percent: 8,
      mechanic: "flat",
    },
    {
      id: "automotive",
      label: "Automotive & Powersports",
      percent: 12,
      mechanic: "flat",
    },
    {
      id: "camera_photo",
      label: "Camera & Photo",
      percent: 8,
      mechanic: "flat",
    },
    {
      id: "collectibles",
      label: "Collectibles (approved sellers)",
      percent: 8,
      mechanic: "flat",
    },
    {
      id: "consumer_electronics",
      label: "Consumer Electronics",
      percent: 8,
      mechanic: "flat",
    },
    {
      id: "industrial",
      label: "Industrial & Scientific Supplies",
      percent: 12,
      mechanic: "flat",
    },
    {
      id: "musical_instruments",
      label: "Musical Instruments",
      percent: 12,
      mechanic: "flat",
    },
    {
      id: "base_power_tools",
      label: "Base Power Tools",
      percent: 12,
      mechanic: "flat",
    },
    {
      id: "personal_computers",
      label: "Personal Computers",
      percent: 6,
      mechanic: "flat",
    },
    {
      id: "plumbing_hvac",
      label: "Plumbing, Heating, Cooling & Ventilation",
      percent: 10,
      mechanic: "flat",
    },
    {
      id: "tires_wheels",
      label: "Tires & Wheels",
      percent: 10,
      mechanic: "flat",
    },
    {
      id: "video_game_consoles",
      label: "Video Game Consoles",
      percent: 8,
      mechanic: "flat",
    },

    // ── Switch (entire item gets one rate based on total price band) ──────
    // Apparel: ≤$15 → 5%; $15–$20 → 10%; >$20 → 15%
    {
      id: "apparel",
      label: "Apparel & Accessories",
      percent: 5,
      tier1Threshold: 15,
      percent2: 10,
      tier2Threshold: 20,
      percent3: 15,
      mechanic: "switch",
      note: "Items ≤$15: 5%; items $15–$20: 10%; items >$20: 15%.",
    },
    // Baby: ≤$10 → 8%; >$10 → 15%
    {
      id: "baby",
      label: "Baby Products",
      percent: 8,
      tier1Threshold: 10,
      percent2: 15,
      mechanic: "switch",
      note: "Items ≤$10: 8%; items >$10: 15%.",
    },
    // Beauty / Health: ≤$10 → 8%; >$10 → 15%
    {
      id: "beauty_health",
      label: "Beauty, Health & Personal Care",
      percent: 8,
      tier1Threshold: 10,
      percent2: 15,
      mechanic: "switch",
      note: "Items ≤$10: 8%; items >$10: 15%.",
    },
    // Grocery: ≤$15 → 8%; >$15 → 15%
    {
      id: "grocery",
      label: "Grocery",
      percent: 8,
      tier1Threshold: 15,
      percent2: 15,
      mechanic: "switch",
      note: "Items ≤$15: 8%; items >$15: 15%.",
    },
    // Outdoor Power Tools: ≤$500 → 15%; >$500 → 8%
    {
      id: "outdoor_power_tools",
      label: "Outdoor Power Tools",
      percent: 15,
      tier1Threshold: 500,
      percent2: 8,
      mechanic: "switch",
      note: "Items ≤$500: 15%; items >$500: 8%.",
    },
    // Outdoors & Sports: 15% standard (8% for trail monitors, binoculars, etc.)
    {
      id: "outdoors_sports",
      label: "Outdoors & Sports",
      percent: 15,
      mechanic: "flat",
      note: "Standard 15%; select optics subcategories (trail monitors, binoculars, telescopes, spotting scopes, night vision) are 8%.",
    },

    // ── Marginal (lower rate on PORTION above the breakpoint) ────────────
    // Compact Appliances: first $300 → 12%; remainder → 8%
    {
      id: "appliances_compact",
      label: "Appliances — Compact",
      percent: 12,
      tier1Threshold: 300,
      percent2: 8,
      mechanic: "marginal",
      note: "12% on the portion of price ≤$300; 8% on the portion above $300.",
    },
    // Electronics Accessories: first $100 → 15%; remainder → 8%
    {
      id: "electronics_accessories",
      label: "Electronics Accessories",
      percent: 15,
      tier1Threshold: 100,
      percent2: 8,
      mechanic: "marginal",
      note: "15% on the portion of price ≤$100; 8% on the portion above $100.",
    },
    // Indoor & Outdoor Furniture: first $200 → 15%; remainder → 10%
    {
      id: "furniture",
      label: "Indoor & Outdoor Furniture",
      percent: 15,
      tier1Threshold: 200,
      percent2: 10,
      mechanic: "marginal",
      note: "15% on the portion of price ≤$200; 10% on the portion above $200.",
    },
    // Jewelry & Precious Metals: first $250 → 20%; remainder → 5%
    {
      id: "jewelry",
      label: "Jewelry & Precious Metals",
      percent: 20,
      tier1Threshold: 250,
      percent2: 5,
      mechanic: "marginal",
      note: "20% on the portion of price ≤$250; 5% on the portion above $250.",
    },
    // Watches: first $1,500 → 15%; remainder → 3%
    {
      id: "watches",
      label: "Watches",
      percent: 15,
      tier1Threshold: 1500,
      percent2: 3,
      mechanic: "marginal",
      note: "15% on the portion of price ≤$1,500; 3% on the portion above $1,500.",
    },
  ],
};

export const depopFeesUS: DepopFees = {
  sellingPercent: 0,
  processingPercent: 3.3,
  processingFixed: 0.45,
  buyerMarketplacePercent: 5,
  buyerMarketplaceFixedMax: 1,
  currency: "USD",
  notes:
    "US sellers pay 0% selling fee (removed July 15, 2024). Depop Payments processing: 3.3% + $0.45 on the total transaction. Buyers pay a marketplace fee of up to 5% of item price + up to $1 fixed at checkout (effective July 18, 2024) — this does NOT reduce the seller's payout.",
  source:
    "https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/",
  verifiedOn: DEPOP_VERIFIED,
};

export const depopFeesGB: DepopFees = {
  sellingPercent: 0,
  processingPercent: 2.9,
  processingFixed: 0.3,
  buyerMarketplacePercent: 5,
  buyerMarketplaceFixedMax: 1,
  currency: "GBP",
  notes:
    "UK sellers pay 0% selling fee (removed March 20, 2024 for new listings). Depop Payments processing: 2.9% + £0.30 on the total transaction. Buyers pay a marketplace fee of up to 5% of item price + up to £1 fixed at checkout (effective April 15, 2024) — this does NOT reduce the seller's payout.",
  source:
    "https://news.depop.com/company-news/evolving-our-fee-structure-with-zero-selling-fees-on-depop/",
  verifiedOn: DEPOP_VERIFIED,
};

/** Rest of world: 10% seller fee + PayPal processing (variable; not modelled here). */
export const depopFeesAU: DepopFees = {
  sellingPercent: 0,
  processingPercent: 2.6,
  processingFixed: 0.3,
  buyerMarketplacePercent: 5,
  buyerMarketplaceFixedMax: 1,
  currency: "AUD",
  notes:
    "Australian sellers pay 0% selling fee on AUD sales (removed July 22, 2026). Depop Payments processing (via Stripe): 2.6% + A$0.30 on item price plus shipping and any tax. Buyers pay a marketplace fee of up to 5% of item price + up to A$1 fixed at checkout (effective July 22, 2026) — this does NOT reduce the seller's payout.",
  source:
    "https://news.depop.com/company-news/depop-makes-selling-free-in-australia-helping-people-earn-more-from-fashion-resale/",
  verifiedOn: "2026-07-22",
};
export const depopFeesROW: DepopFees = {
  sellingPercent: 10,
  processingPercent: 0, // PayPal rates vary widely; modelled separately in copy
  processingFixed: 0,
  currency: "USD", // placeholder — ROW sellers sell in their local currency
  notes:
    "Sellers outside the US and UK still pay a 10% selling fee on item price (and self-arranged shipping if no Depop label). Payment processing is via PayPal and varies by country. No buyer Marketplace fee is documented for ROW markets.",
  source:
    "https://depophelp.zendesk.com/hc/en-gb/articles/360001791127-Seller-fees-and-charges",
  verifiedOn: DEPOP_VERIFIED,
};

/* ===========================================================================
   KO-FI — creator-support platform fees
   ───────────────────────────────────────────────────────────────────────────
   Ko-fi Free plan:
     Tips / donations:                  0% platform fee
     Shop sales / memberships / commissions: 5% platform fee
   Ko-fi Gold ($12/month):
     All income types:                  0% platform fee

   Payment processing (Stripe or PayPal — creator's own account):
     Standard US rate: 2.9% + $0.30 per transaction. Ko-fi does NOT process
     payments itself; creators connect their own Stripe/PayPal account and the
     processor charges them directly. No Ko-fi processing surcharge.

   Sources:
     https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee
     https://ko-fi.com/pricing
     https://help.ko-fi.com/hc/en-us/articles/360005506873-What-is-Ko-fi-Gold
   =========================================================================== */
export const KOFI_VERIFIED = "2026-08-06";

export interface KofiFees {
  /** Ko-fi platform fee % on tips/donations (Free plan). */
  tipsPercent: number;
  /** Ko-fi platform fee % on shop sales, memberships, commissions (Free plan). */
  shopPercent: number;
  /** Ko-fi Gold platform fee % on all income types. */
  goldPercent: number;
  /** Ko-fi Gold monthly cost (USD). */
  goldMonthlyCost: number;
  /** Standard payment processor % (Stripe/PayPal US domestic). */
  processingPercent: number;
  /** Standard payment processor fixed fee per transaction (USD). */
  processingFixed: number;
  currency: string;
  source: string;
  goldSource: string;
  verifiedOn: string;
}

export const kofiFees: KofiFees = {
  tipsPercent: 0,
  shopPercent: 5,
  goldPercent: 0,
  goldMonthlyCost: 12,
  processingPercent: 2.9,
  processingFixed: 0.3,
  currency: "USD",
  source: "https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee",
  goldSource: "https://help.ko-fi.com/hc/en-us/articles/360005506873-What-is-Ko-fi-Gold",
  verifiedOn: KOFI_VERIFIED,
};

/* ===========================================================================
   BUY ME A COFFEE (BMaC) — creator-support platform fees
   ───────────────────────────────────────────────────────────────────────────
   Platform fee:  5% flat on all transactions (one-time, memberships, extras).
   No monthly fee for creators.

   Payment processing (Stripe — all payments go through Stripe Connect):
     Base Stripe processing:   2.9% + $0.30 per transaction
     Stripe payout fee:        0.5%  (charged for payouts to creators)
     Combined standard:        3.4% + $0.30
     International surcharge:  +1.0% (non-US cards)
     Subscription surcharge:   +0.5% (recurring/membership payments — Stripe Billing)

   Sources:
     https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment
     https://help.buymeacoffee.com/en/articles/10182730-what-is-buy-me-a-coffee-and-how-does-it-work
   =========================================================================== */
export const BMAC_VERIFIED = "2026-07-22";

export interface BmacFees {
  /** BMaC platform fee % on all transactions. */
  platformPercent: number;
  /** Combined Stripe processing % (2.9% base + 0.5% payout). */
  processingPercent: number;
  /** Fixed Stripe processing fee per transaction (USD). */
  processingFixed: number;
  /** Extra % for non-US (international) card payments. */
  intlSurchargePercent: number;
  /** Extra % for recurring/subscription/membership payments (Stripe Billing). */
  subscriptionSurchargePercent: number;
  currency: string;
  source: string;
  verifiedOn: string;
}

export const bmacFees: BmacFees = {
  platformPercent: 5,
  processingPercent: 3.4,    // Stripe 2.9% + Stripe payout 0.5%
  processingFixed: 0.3,
  intlSurchargePercent: 1.0,
  subscriptionSurchargePercent: 0.5,
  currency: "USD",
  source: "https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment",
  verifiedOn: BMAC_VERIFIED,
};

/* ===========================================================================
   SUBSTACK — newsletter/subscription platform fees
   ───────────────────────────────────────────────────────────────────────────
   Platform fee:  10% of all paid subscription revenue (monthly or annual).
   No monthly platform fee; no volume discounts; same rate for all writers.

   Payment processing (Stripe, all subscriptions):
     Stripe base processing:   2.9% + $0.30 per transaction
     Stripe Billing (recurring billing fee, added July 2024): 0.7%
     Combined processing:      3.6% + $0.30 per payment

   Annual vs monthly: the fixed $0.30 fires once on the full annual payment
   vs 12× for monthly — a meaningful saving at the per-subscriber level.

   Sources:
     https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost
     https://substack.com/going-paid
     https://stripe.com/billing/pricing  (Stripe Billing 0.7% recurring fee)
   =========================================================================== */
export const SUBSTACK_VERIFIED = "2026-06-13";

export interface SubstackFees {
  /** Substack platform fee % on all paid subscriptions. */
  platformPercent: number;
  /**
   * Combined Stripe processing % per subscription payment:
   * 2.9% standard + 0.7% Stripe Billing recurring fee.
   */
  processingPercent: number;
  /** Fixed Stripe processing fee per payment (USD). */
  processingFixed: number;
  /** Stripe Billing recurring billing component (for display/reference). */
  billingPercent: number;
  currency: string;
  source: string;
  billingSource: string;
  verifiedOn: string;
}

export const substackFees: SubstackFees = {
  platformPercent: 10,
  processingPercent: 3.6,   // Stripe 2.9% + Stripe Billing 0.7%
  processingFixed: 0.3,
  billingPercent: 0.7,
  currency: "USD",
  source: "https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost",
  billingSource: "https://stripe.com/billing/pricing",
  verifiedOn: SUBSTACK_VERIFIED,
};

/* ===========================================================================
   GUMROAD — creator/digital-product platform fees
   ───────────────────────────────────────────────────────────────────────────
   Gumroad operates as Merchant of Record (since January 1, 2025) and charges
   a FLAT FEE MODEL with no monthly subscription fee, no volume tiers:

   DIRECT SALES (customer buys from your profile or a link you share):
     Platform fee:   10% of the sale price + $0.50 per transaction
     Processing:     Stripe standard (2.9% + $0.30) charged SEPARATELY on top
     Total on $100:  10% + $0.50 + 2.9% + $0.30 = $13.70 total fees → $86.30 net

   GUMROAD DISCOVER SALES (customer finds the product via Gumroad's built-in
   marketplace/discovery engine at gumroad.com):
     Fee:            30% FLAT, ALL-INCLUSIVE (processing is included)
     No separate Stripe fee is added — the 30% covers everything.
     Total on $100:  $30.00 → $70.00 net

   There is NO monthly subscription fee. There are no plan tiers or volume
   discounts. The fee structure changed over time: before 2021 Gumroad had
   a tiered 3.5–8.5% model. In 2021 it moved to the current flat 10% + $0.50
   structure. The 30% Discover fee has been in place since the Discover
   marketplace launched.

   Sources:
     https://gumroad.com/help/article/66-gumroads-fees  (official help page)
     https://help.gumroad.com/article/66-gumroadfees   (alternate URL, same content)
   =========================================================================== */
export const GUMROAD_VERIFIED = "2026-07-22";

export interface GumroadFees {
  /**
   * Gumroad platform fee % on direct sales (on top of Stripe processing).
   * This is the Gumroad cut only; Stripe processing is charged separately.
   */
  directPercent: number;
  /** Fixed per-transaction fee on direct sales (Gumroad component, not Stripe). */
  directFixed: number;
  /**
   * Stripe payment processing % applied on direct sales (2.9% standard US rate).
   * Separate from the Gumroad directPercent.
   */
  directProcessingPercent: number;
  /** Stripe fixed processing fee per direct sale ($0.30 standard US). */
  directProcessingFixed: number;
  /**
   * Gumroad Discover fee % — INCLUSIVE of all processing (30% covers everything).
   * No separate Stripe fee is charged on Discover sales.
   */
  discoverPercent: number;
  currency: string;
  source: string;
  verifiedOn: string;
}

export const gumroadFees: GumroadFees = {
  directPercent: 10,
  directFixed: 0.50,
  directProcessingPercent: 2.9,
  directProcessingFixed: 0.30,
  discoverPercent: 30,
  currency: "USD",
  source: "https://gumroad.com/help/article/66-gumroads-fees",
  verifiedOn: GUMROAD_VERIFIED,
};

/* ===========================================================================
   PATREON — creator membership platform fees
   ───────────────────────────────────────────────────────────────────────────
   PLATFORM FEE (% of processed membership + one-time purchase revenue):

   New plan (creators who published their page after August 4, 2025):
     10% flat platform fee. Patreon consolidated its Pro/Premium tiers into a
     single standard plan for all new creators at this date.

   Legacy plans (creators who published before August 4, 2025 — unchanged):
     Lite plan:    5%
     Pro plan:     8%
     Premium plan: 12%
   Legacy creators keep their existing rate unless they unpublish and
   republish, at which point they roll onto the standard 10% plan.

   PAYMENT PROCESSING (Patreon-operated, applied per transaction):
     Standard rate (pledge/tier price > $3 USD):  2.9% + $0.30
     Micropayment rate (pledge/tier price ≤ $3 USD): 5.0% + $0.10
   The micropayment rate has a lower fixed component, which makes it more
   fair for very small pledge amounts where $0.30 would be a large fraction.
   A 2.5% currency conversion fee applies to cross-currency payments
   (not modelled here — USD-only calculator).

   PAYOUT FEES: no Patreon payout fee for standard bank/Stripe payouts to
   US creators. PayPal payouts may carry PayPal's own fees — not modelled.

   Sources:
     https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview
     https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025
     https://support.patreon.com/hc/en-us/articles/360024952552-Patreon-Creator-Plans
   =========================================================================== */
export const PATREON_VERIFIED = "2026-06-15";

export interface PatreonFees {
  /** New plan platform fee % (for creators who published after Aug 4 2025). */
  newPlanPercent: number;
  /** Legacy Lite plan platform fee %. */
  litePlanPercent: number;
  /** Legacy Pro plan platform fee %. */
  proPlanPercent: number;
  /** Legacy Premium plan platform fee %. */
  premiumPlanPercent: number;
  /** Standard payment processing % — for pledges/tiers priced above $3 USD. */
  standardProcessingPercent: number;
  /** Standard payment processing fixed fee per transaction (USD). */
  standardProcessingFixed: number;
  /** Micropayment processing % — for pledges/tiers priced at $3 USD or less. */
  microProcessingPercent: number;
  /** Micropayment processing fixed fee per transaction (USD). */
  microProcessingFixed: number;
  /** Pledge threshold (USD) at or below which the micropayment rate applies. */
  microThreshold: number;
  currency: string;
  source: string;
  /** Help-centre article — richer detail, but blocked on some networks/regions. */
  helpCentreSource?: string;
  newPlanSource: string;
  verifiedOn: string;
}

export const patreonFees: PatreonFees = {
  newPlanPercent: 10,
  litePlanPercent: 5,
  proPlanPercent: 8,
  premiumPlanPercent: 12,
  standardProcessingPercent: 2.9,
  standardProcessingFixed: 0.30,
  microProcessingPercent: 5.0,
  microProcessingFixed: 0.10,
  microThreshold: 3,
  currency: "USD",
  // Main-domain pricing page: states the 10% platform fee and stays reachable
  // where support.patreon.com is blocked (some regions/networks). The help-centre
  // article is kept below as the detailed secondary reference.
  source: "https://www.patreon.com/pricing",
  helpCentreSource:
    "https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview",
  newPlanSource:
    "https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025",
  verifiedOn: PATREON_VERIFIED,
};

/* ===========================================================================
   KAJABI — online course + digital product platform fees
   ───────────────────────────────────────────────────────────────────────────
   Kajabi charges ZERO platform transaction fees on ALL plans.
   Revenue is processed through Kajabi Payments (built on Stripe under the hood),
   with processing rates that decrease slightly on higher plans.

   PLANS (monthly billing; ~20% discount on annual billing):
     Starter: $89/mo  (or $71/mo annual) — Kajabi Payments: 2.9% + $0.30
     Basic:   $179/mo (or $143/mo annual) — Kajabi Payments: 2.9% + $0.30
     Growth:  $249/mo (or $199/mo annual) — Kajabi Payments: 2.8% + $0.30
     Pro:     $499/mo (or $399/mo annual) — Kajabi Payments: 2.7% + $0.30

   Plan names and prices reflect the Q4 2025 pricing update effective
   January 13, 2026. Previous plan names were Kickstarter, Basic, Growth, Pro.

   THIRD-PARTY PROCESSOR SURCHARGE (if NOT using Kajabi Payments):
   Sellers who use Stripe or PayPal directly instead of Kajabi Payments are
   charged an additional platform surcharge per transaction:
     Starter: +5%, Basic: +2%, Growth: +1%, Pro: +0.5%
   PayPal is exempt from this surcharge (not modelled in per-sale calculator).

   Additional Kajabi Payments fees (US, informational — not modelled per-sale):
     International cards:          +1.5%
     Subscriptions/payment plans:  +0.7%
     ACH Direct Debit:             0.8% (capped at $5)
     Dispute fee:                  $15 per dispute

   Sources:
     https://kajabi.com/pricing
     https://help.kajabi.com/hc/en-us/articles/23370972909851-Kajabi-Payments-Fees-United-States
     https://www.kajabi.com/updates/2025-pricing-updates
   =========================================================================== */
export const KAJABI_VERIFIED = "2026-06-15";

export interface KajabiPlan {
  /** stable id for the plan <select> */
  id: string;
  label: string;
  /** Platform transaction fee % — always 0% on all Kajabi plans. */
  transactionPercent: 0;
  /** Kajabi Payments processing % (US domestic cards). */
  processingPercent: number;
  /** Kajabi Payments processing fixed fee per transaction (USD). */
  processingFixed: number;
  /** Approximate monthly cost in USD (mo-to-mo; for informational display). */
  monthlyCostUSD: number;
  /**
   * Surcharge % added if the seller uses a third-party processor (e.g. Stripe
   * directly) instead of Kajabi Payments. Informational only.
   */
  thirdPartyPercent: number;
}

export interface KajabiFees {
  plans: KajabiPlan[];
  currency: string;
  source: string;
  paymentsSource: string;
  verifiedOn: string;
}

export const kajabiFees: KajabiFees = {
  plans: [
    { id: "starter", label: "Starter ($89/mo)",  transactionPercent: 0, processingPercent: 2.9, processingFixed: 0.30, monthlyCostUSD: 89,  thirdPartyPercent: 5   },
    { id: "basic",   label: "Basic ($179/mo)",   transactionPercent: 0, processingPercent: 2.9, processingFixed: 0.30, monthlyCostUSD: 179, thirdPartyPercent: 2   },
    { id: "growth",  label: "Growth ($249/mo)",  transactionPercent: 0, processingPercent: 2.8, processingFixed: 0.30, monthlyCostUSD: 249, thirdPartyPercent: 1   },
    { id: "pro",     label: "Pro ($499/mo)",     transactionPercent: 0, processingPercent: 2.7, processingFixed: 0.30, monthlyCostUSD: 499, thirdPartyPercent: 0.5 },
  ],
  currency: "USD",
  source: "https://kajabi.com/pricing",
  paymentsSource: "https://help.kajabi.com/hc/en-us/articles/23370972909851-Kajabi-Payments-Fees-United-States",
  verifiedOn: KAJABI_VERIFIED,
};

/* ===========================================================================
   PODIA — online course + digital product platform fees
   ───────────────────────────────────────────────────────────────────────────
   Podia charges a PER-SALE TRANSACTION FEE on the Mover plan only.
   Shaker and Earthquaker plans have 0% transaction fees.
   Payment processing (Stripe, 2.9% + $0.30) is SEPARATE on ALL plans.

   PLANS (monthly billing; ~15% discount on annual billing):
     Mover:       $39/mo  (or $33/mo annual) — 5% transaction fee per sale
     Shaker:      $89/mo  (or $75/mo annual) — 0% transaction fee per sale
     Earthquaker: $179/mo (or $150/mo annual) — 0% transaction fee per sale

   PAYMENT PROCESSING (Stripe, separate on all plans):
     Standard rate (US domestic cards): 2.9% + $0.30 per transaction
     Stripe/PayPal standard rates vary by country; the 5% Podia fee on Mover
     is deducted first, then the processor fee is applied on the remainder.

   Note: the transaction fee (sellingPercent) is Podia's platform cut, charged
   BEFORE the processor fee is applied. Monthly plan costs are NOT per-sale fees
   and are not included in the per-sale calculator math.

   Sources:
     https://podia.com/pricing
     https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees
     https://help.podia.com/en/articles/11370888-podia-plans-pricing-faqs
   =========================================================================== */
export const PODIA_VERIFIED = "2026-06-15";

export interface PodiaPlan {
  /** stable id for the plan <select> */
  id: string;
  label: string;
  /** Podia transaction fee % on each sale (Podia's platform cut). */
  transactionPercent: number;
  /** Approximate monthly cost in USD (for informational display). */
  monthlyCostUSD: number;
}

export interface PodiaFees {
  plans: PodiaPlan[];
  /** Standard Stripe processing % per transaction (US domestic cards). */
  processingPercent: number;
  /** Standard Stripe processing fixed fee per transaction (USD). */
  processingFixed: number;
  currency: string;
  source: string;
  transactionFeeSource: string;
  verifiedOn: string;
}

export const podiaFees: PodiaFees = {
  plans: [
    { id: "mover",       label: "Mover ($39/mo)",       transactionPercent: 5, monthlyCostUSD: 39  },
    { id: "shaker",      label: "Shaker ($89/mo)",      transactionPercent: 0, monthlyCostUSD: 89  },
    { id: "earthquaker", label: "Earthquaker ($179/mo)", transactionPercent: 0, monthlyCostUSD: 179 },
  ],
  processingPercent: 2.9,
  processingFixed: 0.30,
  currency: "USD",
  source: "https://podia.com/pricing",
  transactionFeeSource: "https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees",
  verifiedOn: PODIA_VERIFIED,
};

/* ===========================================================================
   TEACHABLE — online course platform transaction fees
   ───────────────────────────────────────────────────────────────────────────
   Teachable charges a PER-SALE TRANSACTION FEE on the Starter plan only.
   Higher plans (Builder, Growth, Custom) have 0% transaction fees.
   Payment processing (Stripe US domestic) is SEPARATE on ALL plans.

   PLANS (monthly billing; ~25% discount on annual billing):
     Starter:  $39/mo  — 7.5% transaction fee per sale
     Builder:  $89/mo  — 0%   transaction fee per sale
     Growth:   $189/mo — 0%   transaction fee per sale
     Custom:   contact — 0%   transaction fee per sale

   PAYMENT PROCESSING (Stripe, separate on all plans):
     US cards:            2.9% + $0.30 per transaction
     International cards: 3.9% + $0.30 per transaction

   Note: the transaction fee (sellingPercent) is Teachable's platform cut;
   it is charged on top of Stripe payment processing. The monthly plan cost
   is NOT a per-sale fee and is not included in the per-sale calculator math.

   Sources:
     https://teachable.com/pricing
     https://support.teachable.com/en/articles/11682553-teachable-fees
   =========================================================================== */
export const TEACHABLE_VERIFIED = "2026-06-15";

export interface TeachablePlan {
  /** stable id for the plan <select> */
  id: string;
  label: string;
  /** Platform transaction fee % on each sale (Teachable's cut). */
  transactionPercent: number;
  /** Approximate monthly cost in USD (for informational display). */
  monthlyCostUSD: number;
}

export interface TeachableFees {
  plans: TeachablePlan[];
  /** Standard US domestic Stripe processing % per transaction. */
  processingPercent: number;
  /** Standard US domestic Stripe processing fixed fee per transaction (USD). */
  processingFixed: number;
  /** International card Stripe processing % (US sellers, non-US cards). */
  intlProcessingPercent: number;
  currency: string;
  source: string;
  verifiedOn: string;
}

export const teachableFees: TeachableFees = {
  plans: [
    { id: "starter", label: "Starter ($39/mo)",  transactionPercent: 7.5, monthlyCostUSD: 39  },
    { id: "builder", label: "Builder ($89/mo)",  transactionPercent: 0,   monthlyCostUSD: 89  },
    { id: "growth",  label: "Growth ($189/mo)",  transactionPercent: 0,   monthlyCostUSD: 189 },
    { id: "custom",  label: "Custom (enterprise)", transactionPercent: 0,  monthlyCostUSD: 0  },
  ],
  processingPercent: 2.9,
  processingFixed: 0.30,
  intlProcessingPercent: 3.9,
  currency: "USD",
  source: "https://teachable.com/pricing",
  verifiedOn: TEACHABLE_VERIFIED,
};

/* ===========================================================================
   BANDCAMP
   =========================================================================== */
export const BANDCAMP_VERIFIED = "2026-07-22";

export interface BandcampFees {
  /**
   * Bandcamp's revenue share on digital sales before the $5,000 threshold
   * (rolling 12-month). 15%.
   */
  digitalPercentStandard: number;
  /**
   * Bandcamp's revenue share on digital sales AFTER reaching $5,000 USD in
   * lifetime digital sales (maintained on a rolling 12-month basis). 10%.
   */
  digitalPercentTier: number;
  /**
   * Lifetime digital sales threshold (USD) at which the lower tier kicks in.
   * $5,000.
   */
  digitalTierThreshold: number;
  /** Bandcamp's revenue share on physical / merch sales. Flat 10%. */
  physicalPercent: number;
  /**
   * On Bandcamp Friday, Bandcamp waives its revenue share entirely (0%).
   * Payment processing still applies.
   */
  fridayPercent: number;
  /**
   * Standard card processing % (credit/debit card rate, transactions ≥ $8.07).
   * Bandcamp uses 2.2% + $0.30 for card; we use the slightly higher 2.9% + $0.30
   * as the representative/conservative card rate because it is listed for Gift Card
   * transactions and is the most commonly referenced processor rate.
   * Note: PayPal processing is 1.9% + $0.30 (lower). We model the card rate.
   */
  processingPercent: number;
  /** Standard processing fixed fee per transaction (USD). */
  processingFixed: number;
  currency: string;
  source: string;
  processingSource: string;
  verifiedOn: string;
}

export const bandcampFees: BandcampFees = {
  digitalPercentStandard: 15,
  digitalPercentTier: 10,
  digitalTierThreshold: 5000,
  physicalPercent: 10,
  fridayPercent: 0,
  processingPercent: 2.9,
  processingFixed: 0.30,
  currency: "USD",
  source: "https://get.bandcamp.help/en/articles/15263193-what-are-bandcamp-s-fees",
  processingSource:
    "https://get.bandcamp.help/en/articles/15263218-how-much-are-payment-processor-fees-for-digital-sales",
  verifiedOn: BANDCAMP_VERIFIED,
};

/* ===========================================================================
   FIVERR — freelance marketplace platform fees
   ───────────────────────────────────────────────────────────────────────────
   SELLER (freelancer) FEES:
     Service fee: 20% flat commission on every completed order, including tips.
     No volume tiers, no seller-level discounts. Sellers always keep 80%.

   BUYER FEES (what clients pay on top of the order price):
     Service fee:     5.5% of the order total (all orders)
     Small order fee: $3 fixed — charged on orders under $100 USD

   History note: before June 2023, the small order fee was $2 on orders
   under $50. Changed June 2023 to $3 on orders under $100. Unchanged since.

   Withdrawal fees (NOT modelled per-order):
     Bank transfer:  $1 per withdrawal
     Revenue Card:   $3 per withdrawal
     PayPal:         Free (PayPal's own conversion fees may apply)

   Sources:
     https://help.fiverr.com/hc/en-us/articles/360011028477 (seller fees)
     https://help.fiverr.com/hc/en-us/articles/360010359797 (buyer service fee)
   =========================================================================== */
export const FIVERR_VERIFIED = "2026-08-06";

export interface FiverrFees {
  /** Fiverr's commission on every seller order (including tips). 20%. */
  sellerCommissionPercent: number;
  /** Buyer service fee charged on all orders. 5.5%. */
  buyerServicePercent: number;
  /** Fixed small-order fee charged to buyers on orders below the threshold. $3. */
  buyerSmallOrderFee: number;
  /** Order total threshold (USD) below which the small-order fee applies. $100. */
  buyerSmallOrderThreshold: number;
  currency: string;
  sellerSource: string;
  buyerSource: string;
  verifiedOn: string;
}

export const fiverrFees: FiverrFees = {
  sellerCommissionPercent: 20,
  buyerServicePercent: 5.5,
  buyerSmallOrderFee: 3,
  buyerSmallOrderThreshold: 100,
  currency: "USD",
  sellerSource: "https://help.fiverr.com/hc/en-us/articles/360011028477",
  buyerSource: "https://help.fiverr.com/hc/en-us/articles/360010359797",
  verifiedOn: FIVERR_VERIFIED,
};

/* ===========================================================================
   UPWORK — freelance marketplace platform fees
   ───────────────────────────────────────────────────────────────────────────
   FREELANCER SERVICE FEE HISTORY:
     Pre-2023:    Sliding scale — 20% (first $500/client), 10% ($500–$10k),
                  5% (above $10k). Rewarded volume with one client.
     2023–Apr 2025: Flat 10% on all contracts.
     May 1, 2025 (current): Variable per-contract fee, 0%–15%.
       – Rate is set by Upwork's algorithm at proposal/offer stage and
         locked for the contract's lifetime.
       – Factors include skill demand, market supply, project type,
         and client relationship. Upwork does NOT publish the formula.
       – Freelancers see the exact % before submitting a proposal.
       – Typical range in practice: 10–15% for most categories;
         5–10% for scarce/high-demand skills; rarely 0%.
       – Contracts started before May 1, 2025 are grandfathered.

   CLIENT MARKETPLACE FEE:
     5% on all payments to freelancers (Basic/most common plan).
     Upwork Business Plus ($49.99/mo): 10% marketplace fee, initiation
     fees waived. Contract initiation fee: $0.99–$14.99 per new contract
     (waived on some plans and promotions). Not modelled per-order.

   OTHER FEES (NOT modelled per-order):
     Connects:          $0.15 each; proposals cost 4–16 Connects.
     Wire withdrawal:   $30 per wire.
     Currency conversion: up to 2%.
     Freelancer Plus:   $14.99–$19.99/month membership.

   DEFAULT for calculator: 10% (historical midpoint and most commonly
   cited "typical" rate; user can adjust to their actual contract rate).

   Sources:
     https://support.upwork.com/hc/en-us/articles/211062538
     https://www.upwork.com/i/pricing/
   =========================================================================== */
export const UPWORK_VERIFIED = "2026-08-06";

export interface UpworkFees {
  /**
   * Default freelancer service fee % to pre-fill the calculator.
   * 10% — the historical midpoint and most common rate observed in practice
   * after the May 2025 variable-fee change.
   */
  defaultServiceFeePercent: number;
  /** Minimum possible freelancer service fee % under the variable model. */
  minServiceFeePercent: number;
  /** Maximum possible freelancer service fee % under the variable model. */
  maxServiceFeePercent: number;
  /**
   * Client marketplace fee % charged on top of the freelancer's earnings.
   * 5% on Basic (most common) plan.
   */
  clientMarketplaceFeePercent: number;
  currency: string;
  source: string;
  pricingSource: string;
  verifiedOn: string;
}

export const upworkFees: UpworkFees = {
  defaultServiceFeePercent: 10,
  minServiceFeePercent: 0,
  maxServiceFeePercent: 15,
  clientMarketplaceFeePercent: 5,
  currency: "USD",
  source: "https://support.upwork.com/hc/en-us/articles/211062538",
  pricingSource: "https://www.upwork.com/i/pricing/",
  verifiedOn: UPWORK_VERIFIED,
};

/* ===========================================================================
   PRINTIFY — print-on-demand platform (profit calculator)
   ───────────────────────────────────────────────────────────────────────────
   Printify charges NO platform commission on sales. Sellers pay only:
     - A per-item base/product cost (varies by product + print provider)
     - A per-order shipping cost (varies by product, weight, destination)
   There is no per-sale platform fee on the free plan.

   Profit = (retail price + shipping charged to customer)
            − (base/product cost + shipping cost)

   PRINTIFY PREMIUM ($39/month, or $24.99/month billed annually):
     Gives up to 33% discount on product base costs. No per-sale fee changes.
     The monthly fee is a fixed cost, not per-sale — not modelled in the
     per-item calculator. Sellers enter the discounted base cost directly.

   Base costs are NOT hardcoded here because they are product- and
   print-provider-specific — sellers must enter them from their dashboard.

   Sources:
     https://printify.com/pricing/
     https://printify.com/how-it-works/
   =========================================================================== */
export const PRINTIFY_VERIFIED = "2026-06-15";

export interface PrintifyPremium {
  /** Maximum % discount on product base costs for Premium subscribers. */
  maxProductDiscountPercent: number;
  /** Monthly cost (USD, month-to-month billing). */
  monthlyUSD: number;
  /** Effective monthly cost on annual billing (USD). */
  annualMonthlyUSD: number;
  source: string;
  verifiedOn: string;
}

export const printifyPremium: PrintifyPremium = {
  maxProductDiscountPercent: 33,
  monthlyUSD: 39,
  annualMonthlyUSD: 24.99,
  source: "https://printify.com/pricing/",
  verifiedOn: PRINTIFY_VERIFIED,
};

/* ===========================================================================
   SPRING (formerly Teespring) — print-on-demand creator platform (profit calc)
   ───────────────────────────────────────────────────────────────────────────
   Spring charges NO platform commission on sales. The service fee is included
   in the base cost of each product shown in the Spring launcher.

   Profit = retail price − base cost (seller enters the base cost from the
   Spring product launcher; it varies by product and may decrease with volume).

   Volume discounts: Spring gives lower base costs based on the seller's
   previous-month sales volume — applied automatically, no configuration needed.

   Shipping: charged to buyers directly by Spring at checkout. Not a
   per-sale deduction from the seller's earnings.

   Sources:
     https://spring4creators.zendesk.com/hc/en-us/articles/17959394635149
       (How Much Products Cost — official Spring help article)
     https://spring4creators.zendesk.com/hc/en-us/articles/12423741560589
       (How Spring Works — official Spring help article)
   =========================================================================== */
export const TEESPRING_VERIFIED = "2026-06-15";

/**
 * Spring (Teespring) platform note.
 * No numeric fee rate to store — Spring's fee is baked into each product's
 * base cost which is product-specific and user-entered. This object stores
 * source attribution and verification date for the profit calculator.
 */
export interface TeespringInfo {
  /** Spring charges no separate commission on sales — 0%. */
  platformCommissionPercent: 0;
  /** Spring's fee is included in the product base cost shown in the launcher. */
  feeModel: "base-cost-inclusive";
  source: string;
  howItWorksSource: string;
  verifiedOn: string;
}

export const teespringInfo: TeespringInfo = {
  platformCommissionPercent: 0,
  feeModel: "base-cost-inclusive",
  source:
    "https://spring4creators.zendesk.com/hc/en-us/articles/17959394635149-How-Much-Products-Cost",
  howItWorksSource:
    "https://spring4creators.zendesk.com/hc/en-us/articles/12423741560589-How-Spring-works",
  verifiedOn: TEESPRING_VERIFIED,
};

/* ===========================================================================
   REDBUBBLE — print-on-demand artist marketplace (profit / earnings calc)
   ───────────────────────────────────────────────────────────────────────────
   Redbubble earnings model:
     Retail price = base price × (1 + markup %)
     Gross artist earnings = base price × markup %
   Default markup: 20 % (Redbubble-recommended; artists can raise/lower it).

   Account tier fees (effective September 1, 2025):
     Standard  — 50 % platform fee on gross monthly earnings
     Premium   — 20 % platform fee on gross monthly earnings
     Pro       — 0 % (exempt; consistently high-sales artists)
   Monthly fee cap: $150 per payment period (Standard & Premium).

   Excess markup fee (Standard & Premium only):
     50 % on any earnings from markup above the 20 % threshold.
     earningsAboveThreshold = base × max(0, markup − 20) / 100
     excessMarkupFee = 50 % × earningsAboveThreshold

   Sources (official Redbubble Help Centre):
     https://help.redbubble.com/hc/en-us/articles/202270799-How-is-my-payment-calculated
     https://help.redbubble.com/hc/en-us/articles/50959863016724-How-does-my-Account-Tier-determine-my-platform-fee
     https://help.redbubble.com/hc/en-us/articles/50959535480212-What-is-the-excess-markup-fee
     https://help.redbubble.com/hc/en-us/articles/50960130992916-What-account-fees-exist-on-Redbubble
   =========================================================================== */
export const REDBUBBLE_VERIFIED = "2026-07-21";

export interface RedbubbleInfo {
  /** Default markup % recommended by Redbubble (and the excess-fee threshold). */
  defaultMarkupPercent: 20;
  /** Markup threshold above which the excess markup fee applies. */
  excessMarkupThresholdPercent: 20;
  /** Rate of the excess markup fee on earnings above the threshold. */
  excessMarkupFeeRate: 0.5;
  /** Platform fee rates per account tier (fraction of gross earnings). */
  tierFees: {
    standard: 0.5;
    premium: 0.2;
    pro: 0;
  };
  /** Maximum combined monthly fee (USD) for Standard and Premium tiers. */
  monthlyFeeCap: 150;
  source: string;
  tierSource: string;
  excessFeeSource: string;
  verifiedOn: string;
}

export const redbubbleInfo: RedbubbleInfo = {
  defaultMarkupPercent: 20,
  excessMarkupThresholdPercent: 20,
  excessMarkupFeeRate: 0.5,
  tierFees: {
    standard: 0.5,
    premium: 0.2,
    pro: 0,
  },
  monthlyFeeCap: 150,
  source:
    "https://help.redbubble.com/hc/en-us/articles/202270799-How-is-my-payment-calculated",
  tierSource:
    "https://help.redbubble.com/hc/en-us/articles/50959863016724-How-does-my-Account-Tier-determine-my-platform-fee",
  excessFeeSource:
    "https://help.redbubble.com/hc/en-us/articles/50959535480212-What-is-the-excess-markup-fee",
  verifiedOn: REDBUBBLE_VERIFIED,
};

/* ===========================================================================
   AMAZON — US seller fees (referral fee + FBA fulfilment fee)
   ───────────────────────────────────────────────────────────────────────────
   Two charges most sellers care about:

   1. REFERRAL FEE — a % of the total sales price (item price + shipping the
      seller charges + gift wrap), by category, with a per-item MINIMUM of
      $0.30. Most categories are a flat 15%. Some are lower flat rates
      (Consumer Electronics / Computers / Cell Phone Devices / Video Game
      Consoles 8%; Automotive & Industrial 12%). A few are PRICE-BANDED — the
      WHOLE price uses the rate of the band it falls in (Clothing 5/10/17;
      Baby 8/15; Grocery 8/15). A few are MARGINAL-TIERED — a headline rate up
      to a breakpoint, a lower rate on the portion above (Jewelry 20% then 5%
      above $250; Watches 16% then 3% above $1,500; Furniture 15% then 10%
      above $200). Media categories (Books, Music, Video, DVD, Software, Video
      Games) add a $1.80 variable closing fee on top of the 15% referral,
      regardless of fulfilment method.

   2. FBA FULFILMENT FEE — a per-unit pick/pack/ship fee by SIZE TIER
      (small-standard / large-standard) and unit WEIGHT. As of the Jan 15 2026
      rate card, standard-size fees are split into three PRICE BANDS by the
      item's sale price: under $10, $10–$50, over $50. A 3.5% fuel & logistics
      surcharge applies ON TOP of the base fulfilment fee (effective Apr 17
      2026; active on today's date). This calculator scopes to STANDARD-SIZE
      only — oversize/bulky tiers are out of v1.

   Optional: monthly storage fee (standard-size, non-peak Jan–Sep, per cubic
   foot). The $39.99/mo Professional selling plan is a flat subscription, NOT a
   per-unit fee, so it is noted in copy but never deducted per sale.

   SCOPE: US only. Amazon publishes different FBA rate cards and currencies for
   the UK / Germany / Canada; those tables were NOT verified for this release
   and are intentionally EXCLUDED rather than ship a guessed number.

   The FBA rate card below is the non-peak period (Jan 15 – Oct 14, 2026) and
   was cross-checked across two independent full reproductions of Amazon's
   official 2026 US rate card (Goat Consulting + SellerApp), which agreed
   exactly on every weight × price-band cell.

   Sources:
     Referral fees:    https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98CX
     FBA 2026 changes: https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW
   =========================================================================== */
export const AMAZON_VERIFIED = "2026-07-14";

export interface AmazonReferralCategory {
  /** stable id for the category <select>. */
  id: string;
  label: string;
  /** Flat referral % (also the base rate for marginal-tier categories). */
  percent: number;
  /** Marginal tier: rate on the portion of price ABOVE `tierBreakpoint`. */
  tierPercent?: number;
  tierBreakpoint?: number;
  /**
   * Whole-price price bands (Clothing, Baby, Grocery). The band whose
   * `maxPrice` the price is at-or-below sets the rate for the WHOLE price.
   * The final band omits `maxPrice` (open-ended). When present, `bands`
   * overrides `percent`/tier fields.
   */
  bands?: { maxPrice?: number; percent: number }[];
  /** Adds the $1.80 media variable closing fee (Books/Music/Video/Software). */
  media?: boolean;
  note?: string;
}

/** One weight band of the FBA standard-size fulfilment fee table. */
export interface AmazonFbaFeeRow {
  /** Upper bound of this weight band, in ounces (inclusive). */
  maxOz: number;
  /** Per-unit base fee by price band: [under $10, $10–$50, over $50]. */
  fees: [number, number, number];
  /**
   * Open-ended top band only: for weight above `aboveOz`, add `perIntervalFee`
   * for every `intervalOz` (rounded up). Large-standard 3+ lb: +$0.08 per 4 oz.
   */
  aboveOz?: number;
  intervalOz?: number;
  perIntervalFee?: number;
}

export interface AmazonFees {
  currency: string;
  /** Per-item minimum referral fee (general categories). */
  referralMinimum: number;
  /** Media variable closing fee (Books/Music/Video/DVD/Software/Video Games). */
  mediaClosingFee: number;
  /** [0] = "most categories" default. */
  categories: AmazonReferralCategory[];
  fba: {
    /** Price-band boundaries [under-X, X-to-Y]: below [0] = band 0, ≤ [1] = band 1, else band 2. */
    priceBands: [number, number];
    /** Fuel & logistics surcharge % on the base fulfilment fee (Apr 17 2026). */
    fuelSurchargePercent: number;
    smallStandard: AmazonFbaFeeRow[];
    largeStandard: AmazonFbaFeeRow[];
  };
  /** Optional monthly storage, standard-size, non-peak (Jan–Sep), $/cu ft. */
  storagePerCubicFoot: number;
  /** Peak (Oct–Dec) standard-size storage, $/cu ft (shown in copy only). */
  storagePeakPerCubicFoot: number;
  /** Professional selling plan monthly subscription (flat, NOT per-unit). */
  professionalPlanMonthly: number;
  referralSource: string;
  fbaSource: string;
  verifiedOn: string;
}

export const amazonFees: AmazonFees = {
  currency: "USD",
  referralMinimum: 0.3,
  mediaClosingFee: 1.8,
  categories: [
    { id: "most", label: "Most categories (15%)", percent: 15 },
    { id: "electronics", label: "Consumer Electronics (8%)", percent: 8 },
    { id: "computers", label: "Computers (8%)", percent: 8 },
    { id: "cellphone", label: "Cell Phone Devices (8%)", percent: 8 },
    { id: "consoles", label: "Video Game Consoles (8%)", percent: 8 },
    { id: "automotive", label: "Automotive & Powersports (12%)", percent: 12 },
    { id: "industrial", label: "Industrial & Scientific (12%)", percent: 12 },
    {
      id: "clothing",
      label: "Clothing & Accessories (5/10/17%)",
      percent: 17,
      bands: [
        { maxPrice: 15, percent: 5 },
        { maxPrice: 20, percent: 10 },
        { percent: 17 },
      ],
      note: "5% up to $15, 10% from $15 to $20, 17% above $20 (whole-price rate).",
    },
    {
      id: "baby",
      label: "Baby Products (8/15%)",
      percent: 15,
      bands: [
        { maxPrice: 10, percent: 8 },
        { percent: 15 },
      ],
      note: "8% up to $10, 15% above $10 (whole-price rate).",
    },
    {
      id: "grocery",
      label: "Grocery & Gourmet (8/15%)",
      percent: 15,
      bands: [
        { maxPrice: 15, percent: 8 },
        { percent: 15 },
      ],
      note: "8% up to $15, 15% above $15 (whole-price rate).",
    },
    {
      id: "jewelry",
      label: "Jewelry (20% then 5%)",
      percent: 20,
      tierBreakpoint: 250,
      tierPercent: 5,
      note: "20% on the first $250, 5% on the portion above $250.",
    },
    {
      id: "watches",
      label: "Watches (16% then 3%)",
      percent: 16,
      tierBreakpoint: 1500,
      tierPercent: 3,
      note: "16% on the first $1,500, 3% on the portion above $1,500.",
    },
    {
      id: "furniture",
      label: "Furniture (15% then 10%)",
      percent: 15,
      tierBreakpoint: 200,
      tierPercent: 10,
      note: "15% on the first $200, 10% on the portion above $200.",
    },
    {
      id: "media",
      label: "Books & Media (15% + $1.80)",
      percent: 15,
      media: true,
      note: "15% referral plus a $1.80 variable closing fee per media item.",
    },
  ],
  fba: {
    priceBands: [10, 50],
    fuelSurchargePercent: 3.5,
    // Small-standard: up to 16 oz. Weight in ounce bands. [ <$10, $10–$50, >$50 ]
    smallStandard: [
      { maxOz: 2, fees: [2.43, 3.32, 3.58] },
      { maxOz: 4, fees: [2.49, 3.42, 3.68] },
      { maxOz: 6, fees: [2.56, 3.45, 3.71] },
      { maxOz: 8, fees: [2.66, 3.54, 3.8] },
      { maxOz: 10, fees: [2.77, 3.68, 3.94] },
      { maxOz: 12, fees: [2.82, 3.78, 4.04] },
      { maxOz: 14, fees: [2.92, 3.91, 4.17] },
      { maxOz: 16, fees: [2.95, 3.96, 4.22] },
    ],
    // Large-standard: up to 20 lb (320 oz). Top band is open-ended (+$0.08/4oz above 3 lb).
    largeStandard: [
      { maxOz: 4, fees: [2.91, 3.73, 3.99] },
      { maxOz: 8, fees: [3.13, 3.95, 4.21] },
      { maxOz: 12, fees: [3.38, 4.2, 4.46] },
      { maxOz: 16, fees: [3.78, 4.6, 4.86] },
      { maxOz: 20, fees: [4.22, 5.04, 5.3] }, // 1+ to 1.25 lb
      { maxOz: 24, fees: [4.6, 5.42, 5.68] }, // 1.25+ to 1.5 lb
      { maxOz: 28, fees: [4.75, 5.57, 5.83] }, // 1.5+ to 1.75 lb
      { maxOz: 32, fees: [5.0, 5.82, 6.08] }, // 1.75+ to 2 lb
      { maxOz: 36, fees: [5.1, 5.92, 6.18] }, // 2+ to 2.25 lb
      { maxOz: 40, fees: [5.28, 6.1, 6.36] }, // 2.25+ to 2.5 lb
      { maxOz: 44, fees: [5.44, 6.26, 6.52] }, // 2.5+ to 2.75 lb
      { maxOz: 48, fees: [5.85, 6.67, 6.93] }, // 2.75+ to 3 lb
      { maxOz: 320, fees: [6.15, 6.97, 7.23], aboveOz: 48, intervalOz: 4, perIntervalFee: 0.08 }, // 3+ to 20 lb
    ],
  },
  storagePerCubicFoot: 0.87,
  storagePeakPerCubicFoot: 2.4,
  professionalPlanMonthly: 39.99,
  referralSource:
    "https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98CX",
  fbaSource:
    "https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW",
  verifiedOn: AMAZON_VERIFIED,
};
