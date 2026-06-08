import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { etsyFees } from "../../config/fees";
import { computeEtsyFee } from "./formula";

export const etsyFeeCalculator: CalculatorConfig = {
  slug: "etsy-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "etsy",
  title: "Etsy Fee Calculator",
  metaDescription:
    "Free Etsy fee calculator. See your exact selling fees — listing, transaction, processing and Offsite Ads — plus payout and profit. US, UK, EU, CA, AU.",
  h1: "Etsy Fee Calculator",
  intro:
    "See exactly what Etsy takes on a sale and what lands in your bank. Enter your item price and shipping to break down the listing fee, 6.5% transaction fee, payment processing and Offsite Ads — and add your cost to see real profit.",

  keywords: {
    primary: "etsy fee calculator",
    secondary: [
      "etsy fees calculator",
      "etsy profit calculator",
      "etsy selling fees calculator",
      "how much does etsy take",
    ],
    longTail: [
      "etsy fee calculator uk",
      "how much does etsy take per sale",
      "etsy fees on $100 sale",
      "etsy transaction fee calculator",
      "etsy offsite ads fee calculator",
      "etsy profit margin calculator",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: ["US", "GB", "CA", "AU", "EU"], default: "US" },

  inputs: [
    { id: "itemPrice", label: "Item price", type: "currency", default: 25, min: 0, help: "Price the buyer pays for the item." },
    { id: "shipping", label: "Shipping charged to buyer", type: "currency", default: 5, min: 0, help: "Etsy's 6.5% transaction fee applies to shipping too." },
    { id: "itemCost", label: "Your item cost (optional)", type: "currency", default: 0, min: 0, help: "Cost of goods, to calculate profit." },
    { id: "offsiteAds", label: "This sale came from Offsite Ads", type: "toggle", default: false, help: "Adds the Offsite Ads fee (capped per order)." },
    { id: "highVolume", label: "I make over $10k/year on Etsy", type: "toggle", default: false, help: "Lowers the Offsite Ads rate from 15% to 12%." },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const f = etsyFees[ctx.country] ?? etsyFees.US!;
    const offsiteAds = Boolean(values.offsiteAds);
    const r = computeEtsyFee({
      itemPrice: Number(values.itemPrice) || 0,
      shipping: Number(values.shipping) || 0,
      itemCost: Number(values.itemCost) || 0,
      listingFee: f.listingFee,
      transactionPercent: f.transactionPercent,
      processingPercent: f.processing.percent,
      processingFixed: f.processing.fixed,
      offsiteAds,
      offsiteAdsPercent: values.highVolume ? f.offsiteAds.over10k : f.offsiteAds.under10k,
      offsiteAdsCap: f.offsiteAds.capPerOrder,
    });

    const hasCost = (Number(values.itemCost) || 0) > 0;
    const rows = [
      { label: "Listing fee", display: ctx.formatCurrency(r.listingFee), kind: "deduction" as const },
      { label: `Transaction fee (${ctx.formatPercent(f.transactionPercent)})`, display: ctx.formatCurrency(r.transactionFee), kind: "deduction" as const },
      { label: `Payment processing (${ctx.formatPercent(f.processing.percent)} + ${ctx.formatCurrency(f.processing.fixed)})`, display: ctx.formatCurrency(r.processingFee), kind: "deduction" as const },
    ];
    if (offsiteAds) {
      rows.push({ label: "Offsite Ads fee", display: ctx.formatCurrency(r.offsiteAdsFee), kind: "deduction" as const });
    }
    rows.push({ label: "Your payout", display: ctx.formatCurrency(r.payout), kind: "net" as const });
    if (hasCost) {
      rows.push({ label: "Profit after item cost", display: ctx.formatCurrency(r.profit), kind: "net" as const });
    }

    return {
      headline: {
        label: hasCost ? "Profit" : "Your payout",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Etsy keeps ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows,
    };
  },

  howItWorks:
    "Etsy charges several fees on every sale. A $0.20 listing fee each time an item sells, a 6.5% transaction fee on the total the buyer pays (item price plus the shipping you charge), and a payment-processing fee that varies by country — 3% + $0.25 in the US, 4% + 20p in the UK.\n\nIf the sale came from Etsy's Offsite Ads, there's an additional advertising fee: 15% of the order for most sellers, or 12% once you pass $10,000 in sales over 12 months, capped at $100 per order. Your payout is the sale total minus these fees; subtract your cost of goods to see profit.\n\nSome countries also add a small regulatory operating fee not shown here. These are Etsy's published rates.",

  workedExample: {
    scenario: "You sell a $25 item with $5 shipping to a US buyer (not from Offsite Ads).",
    steps: [
      { label: "Sale total (item + shipping)", value: "$30.00" },
      { label: "Listing fee", value: "$0.20" },
      { label: "Transaction fee (6.5%)", value: "$1.95" },
      { label: "Payment processing (3% + $0.25)", value: "$1.15" },
      { label: "Total Etsy fees", value: "$3.30" },
    ],
    result: "Your payout is $26.70",
  },

  faqs: [
    {
      q: "How much does Etsy take per sale?",
      a: "Etsy charges a $0.20 listing fee, a 6.5% transaction fee on the item price plus shipping, and payment processing (3% + $0.25 in the US). On a $25 item with $5 shipping that's $3.30 in fees, so you keep $26.70 — roughly 11% of the sale. Offsite Ads, if applicable, add more.",
    },
    {
      q: "What are Etsy's fees on a $100 sale?",
      a: "On a $100 US sale with free shipping: $0.20 listing + $6.50 transaction (6.5%) + $3.25 processing (3% + $0.25) = $9.95, leaving about $90.05 before any Offsite Ads fee. Enter your numbers above for an exact figure.",
    },
    {
      q: "Does Etsy charge fees on shipping?",
      a: "Yes. The 6.5% transaction fee applies to the total the buyer pays, including the shipping you charge. The calculator above includes shipping in the fee base.",
    },
    {
      q: "What is the Etsy Offsite Ads fee?",
      a: "If a buyer reaches your listing through an Etsy Offsite Ad and buys within 30 days, Etsy charges 15% of the order (12% once you've made over $10,000 in the last 12 months), capped at $100 per order. Toggle 'Offsite Ads' above to include it.",
    },
    {
      q: "Are Etsy fees different in the UK and EU?",
      a: "The $0.20 listing fee and 6.5% transaction fee are the same, but payment processing differs — for example 4% + 20p in the UK and 4% + €0.30 in much of the EU — and some countries add a small regulatory operating fee. Select your country above.",
    },
  ],

  related: ["stripe-fee-calculator", "paypal-fee-calculator"],

  sources: [
    { label: "Etsy — Fees & Payments Policy", url: "https://www.etsy.com/legal/fees/" },
    { label: "Etsy Help — payment processing fees", url: "https://help.etsy.com/hc/en-us/articles/115015628847" },
  ],

  feesVerifiedOn: "2026-06-08",
  lastUpdated: "2026-06-08",
};
