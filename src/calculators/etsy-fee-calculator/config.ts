import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { etsyFees, ETSY_CURRENCY_CONVERSION_PERCENT } from "../../config/fees";
import { etsyRateCards } from "../../lib/rateCards";
import { computeEtsyFee } from "./formula";

export const etsyFeeCalculator: CalculatorConfig = {
  slug: "etsy-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "etsy",
  title: "Etsy Fee Calculator",
  metaDescription:
    "Free Etsy fee calculator. Calculate Etsy seller fees — listing, transaction, payment processing and Offsite Ads — plus your payout and profit, across 19 countries.",
  h1: "Etsy Fee Calculator",
  intro:
    "Calculate Etsy seller fees on a sale and see what lands in your bank. Enter your item price and shipping to break down the listing fee, 6.5% transaction fee, payment processing and Offsite Ads — and add your cost to see real profit.",

  // Cluster from the user's exports (etsy fee calculator.csv + etsy fees.csv),
  // all relevant terms vol >= 90.
  keywords: {
    primary: "etsy fee calculator", // 2,900
    secondary: [
      "etsy charges calculator", // 2,900
      "etsy fees", // 2,900
      "etsy seller fees", // 2,900
      "etsy sales fees", // 2,900
      "etsy sale fee", // 2,900
      "fees for etsy sellers", // 2,900
      "etsy calculator", // 1,000
      "etsy profit calculator", // 880
      "etsy fees calculator", // 480
      "etsy price calculator", // 320
    ],
    longTail: [
      "etsy inc seller fees", // 2,900
      "etsy shop cost", // 720
      "etsy charges for selling", // 720
      "cost for etsy shop", // 720
      "cost for etsy store", // 720
      "etsy charge to sell", // 720
      "etsy listing fee", // 590
      "etsy payments", // 590
      "cost to list on etsy", // 590
      "etsy pricing", // 480
      "etsy costs", // 320
      "cost to sell on etsy", // 320
      "etsy commissions", // 320
      "etsy cost to sell", // 210
      "etsy shop fees", // 210
      "etsy shop charges", // 210
      "fees for etsy shop", // 210
      "etsy payment processing", // 170
      "etsy percentage fee", // 170
      "etsy transaction fee", // 170
      "etsy monthly fee", // 140
      "etsy ads cost", // 140
      "etsy monthly cost", // 140
      "etsy commission rates", // 110
      "etsy charges", // 90
      "how much does etsy take per sale",
    ],
    competition: "M",
    estVolume: 2900,
    intent: "tool",
  },

  countries: {
    supported: [
      "US", "GB", "CA", "AU", "EU", "IN", "DE", "FR", "ES", "IT", "NL",
      "IE", "BE", "AT", "SE", "SG", "HK", "NZ", "MX",
    ],
    default: "US",
  },

  inputs: [
    { id: "itemPrice", label: "Item price", type: "currency", default: 25, min: 0, help: "Price the buyer pays for the item." },
    { id: "shipping", label: "Shipping charged to buyer", type: "currency", default: 5, min: 0, half: true, help: "Etsy's 6.5% transaction fee applies to shipping too." },
    { id: "itemCost", label: "Your item cost (optional)", type: "currency", default: 0, min: 0, half: true, help: "Cost of goods, to calculate profit." },
    { id: "offsiteAds", label: "This sale came from Offsite Ads", type: "toggle", default: false, half: true, help: "Adds the Offsite Ads fee (capped per order)." },
    { id: "highVolume", label: "I make over $10k/year on Etsy", type: "toggle", default: false, half: true, help: "Lowers the Offsite Ads rate from 15% to 12%." },
    { id: "conversion", label: "Currency conversion (different listing currency)", type: "toggle", default: false, help: "Adds Etsy's 2.5% currency-conversion fee." },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const f = etsyFees[ctx.country] ?? etsyFees.US!;
    const offsiteAds = Boolean(values.offsiteAds);
    const conversion = Boolean(values.conversion);
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
      regulatoryPercent: f.regulatoryPercent ?? 0,
      currencyConversionPercent: conversion ? ETSY_CURRENCY_CONVERSION_PERCENT : 0,
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
    if (r.regulatoryFee > 0) {
      rows.push({ label: `Regulatory operating fee (${ctx.formatPercent(f.regulatoryPercent ?? 0)})`, display: ctx.formatCurrency(r.regulatoryFee), kind: "deduction" as const });
    }
    if (conversion) {
      rows.push({ label: "Currency conversion (2.5%)", display: ctx.formatCurrency(r.conversionFee), kind: "deduction" as const });
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
    "Etsy charges several fees on every sale. A $0.20 listing fee each time an item sells, a 6.5% transaction fee on the total the buyer pays (item price plus the shipping you charge), and a payment-processing fee that varies by country — 3% + $0.25 in the US, 4% + 20p in the UK.\n\nIf the sale came from Etsy's Offsite Ads, there's an additional advertising fee: 15% of the order for most sellers, or 12% once you pass $10,000 in sales over 12 months, capped at $100 per order. Your payout is the sale total minus these fees; subtract your cost of goods to see profit.\n\nSome countries (such as the UK, France, Italy and Spain) also charge a mandatory regulatory operating fee, and Etsy adds a 2.5% currency-conversion fee when your listing and payment currencies differ — both are included above when applicable. These are Etsy's published rates.",

  seoContent: `Our Etsy fee calculator is a free, instant tool that breaks down every fee Etsy charges on a sale and shows your real payout and profit. Selling on Etsy looks simple, but the fees stack up from several directions at once — a listing fee, a transaction fee, payment processing, and sometimes an advertising fee — and it is easy to be surprised by how little is left. This calculator adds all of it up for you the moment you enter your item price and shipping, so you can price with confidence and protect your margin.

## Every Etsy fee, explained
Etsy charges three standard fees on every sale, plus one conditional one. First, a $0.20 listing fee each time an item sells (your listing is also renewed for another $0.20 when it sells if you have stock). Second, a 6.5% transaction fee calculated on the total the buyer pays — and crucially, that includes the shipping you charge, not just the item price, which many sellers forget. Third, a payment processing fee that varies by country: 3% plus $0.25 in the United States, and 4% plus 20p in the United Kingdom, for example. Our calculator applies the correct processing rate for the country you select.

## The Offsite Ads fee that catches sellers out
Etsy's Offsite Ads program advertises your products across the web, and when a shopper buys after clicking one of those ads, Etsy charges an advertising fee on that order. The rate is 15% for most shops, dropping to 12% once you have made over $10,000 in the last 12 months, and it is capped at $100 per order. This fee is mandatory for larger shops and optional for smaller ones, and because it only applies to specific orders it is easy to misjudge. Toggle "Offsite Ads" in the calculator to see its impact, and the high-volume option to switch to the 12% rate.

## From payout to real profit
Knowing your payout is only half the picture — what matters is profit. Enter your cost of goods (materials, blanks, packaging, or wholesale cost) in the optional field and the calculator subtracts it to show what you actually make on the sale. This turns the tool into a quick pricing assistant: adjust your item price or shipping until your profit margin looks healthy, then list with confidence. Sellers who price this way avoid the common trap of "busy but not profitable," where sales roll in but fees and costs quietly eat the margin.

## Who this calculator helps
New Etsy sellers use it to set their very first prices correctly. Established shops use it to audit margins across a catalogue and decide which products are worth promoting. Print-on-demand and handmade sellers use it to compare the true cost of free shipping versus charged shipping. Anyone considering Offsite Ads uses it to understand the real take-home on an advertised order. It works instantly in your browser on desktop or phone, with no signup and nothing to install.

## Accuracy and things to remember
We keep Etsy's rates in a single dated source file and stamp the page with a "fees last verified" date, updating both whenever Etsy changes its pricing. The results are estimates of standard published fees. A few extra factors can apply that a general calculator cannot know: some countries add a small regulatory operating fee, currency conversion has its own charge if you list and get paid in different currencies, and sales tax or VAT handling varies by location. Etsy also runs occasional promotions and offers. For day-to-day pricing decisions, though, this calculator gives you a fast, accurate picture of what Etsy takes and what you keep on every sale.`,

  rateCards: {
    heading: "Etsy fees by country",
    intro:
      "The $0.20 listing fee and 6.5% transaction fee are the same everywhere; only payment processing changes by country. Offsite Ads (12–15%, capped at $100/order) may also apply.",
    cards: etsyRateCards([
      "US", "GB", "CA", "AU", "EU", "IN", "DE", "FR", "ES", "IT", "NL",
      "IE", "BE", "AT", "SE", "SG", "HK", "NZ", "MX",
    ]),
  },

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
      q: "What are the seller fees on Etsy?",
      a: "Etsy's seller fees are: a $0.20 listing fee per item sold, a 6.5% transaction fee on the total the buyer pays (including shipping), and a payment processing fee that varies by country (3% + $0.25 in the US, 4% + 20p in the UK). Optional costs include Offsite Ads (12–15%, capped at $100/order) and Etsy Ads if you advertise. There is no monthly subscription on the standard plan. This calculator adds all the applicable seller fees together for you.",
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

  feesVerifiedOn: "2026-06-09",
  lastUpdated: "2026-06-09",
};
