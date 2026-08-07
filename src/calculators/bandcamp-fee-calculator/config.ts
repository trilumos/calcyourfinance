import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { bandcampFees } from "../../config/fees";
import { computeBandcampFee } from "./formula";

export const bandcampFeeCalculator: CalculatorConfig = {
  slug: "bandcamp-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "bandcamp",
  title: "Bandcamp Fee Calculator",
  metaDescription:
    "Free Bandcamp fee calculator. See exactly what Bandcamp takes — 15% revenue share (drops to 10% after $5,000 in sales), 10% on physical merch, 0% on Bandcamp Friday — plus payment processing, and calculate your real artist payout.",
  h1: "Bandcamp Fee Calculator",
  intro:
    "Calculate exactly what Bandcamp takes from every digital download or physical merch sale. Bandcamp charges a 15% revenue share on digital sales that drops to 10% once you've sold $5,000 in music. Physical merch carries a flat 10%. On Bandcamp Friday, Bandcamp waives its share entirely — you pay only payment processing. Enter your sale price to see the full breakdown.",

  keywords: {
    primary: "bandcamp fee calculator",
    secondary: [
      "bandcamp fees",
      "how much does bandcamp take",
      "bandcamp revenue share",
      "bandcamp cut calculator",
      "bandcamp payout calculator",
      "bandcamp selling fees",
      "bandcamp creator fees",
    ],
    longTail: [
      "bandcamp friday fees",
      "bandcamp fee percentage",
      "bandcamp 15 percent fee",
      "bandcamp 10 percent fee",
      "bandcamp digital vs physical fees",
      "bandcamp merch fees",
      "how much does bandcamp take from digital sales",
      "bandcamp vs gumroad fees",
      "bandcamp vs patreon fees",
      "bandcamp fee calculator 2026",
      "bandcamp revenue share explained",
      "bandcamp fee after 5000",
      "does bandcamp waive fees on bandcamp friday",
      "bandcamp processing fee",
      "bandcamp artist payout",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "salePrice",
      label: "Sale price",
      type: "currency",
      default: 10,
      min: 0,
      help: "The price your fan pays. Bandcamp calculates its revenue share and payment processing on this amount.",
    },
    {
      id: "saleType",
      label: "Sale type",
      type: "select",
      default: "digital",
      options: [
        { value: "digital",  label: "Digital (music / downloads)" },
        { value: "physical", label: "Physical (vinyl, merch, CDs)" },
      ],
      help: "Digital sales: 15% (or 10% after $5,000 lifetime) + processing. Physical / merch: flat 10% + processing.",
    },
    {
      id: "overThreshold",
      label: "I've reached $5,000 in lifetime digital sales",
      type: "toggle",
      default: false,
      help: "Once you've sold $5,000 in music on Bandcamp (maintained on a rolling 12-month basis), Bandcamp's digital revenue share drops from 15% to 10%. This toggle only affects digital sales.",
    },
    {
      id: "bandcampFriday",
      label: "Bandcamp Friday sale",
      type: "toggle",
      default: false,
      help: "On Bandcamp Friday, Bandcamp waives its revenue share entirely (0%). Payment processing fees still apply. Toggle this on to see your Bandcamp Friday payout.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to produce or manufacture this item — to calculate your real profit after all fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const salePrice       = Math.max(0, Number(values.salePrice) || 0);
    const saleType        = String(values.saleType || "digital") as "digital" | "physical";
    const overThreshold   = Boolean(values.overThreshold);
    const bandcampFriday  = Boolean(values.bandcampFriday);
    const itemCost        = Math.max(0, Number(values.itemCost) || 0);

    const r = computeBandcampFee({ saleType, salePrice, overThreshold, bandcampFriday, itemCost });

    const hasCost    = itemCost > 0;
    const isPhysical = saleType === "physical";
    const isFriday   = bandcampFriday;

    // Label for the revenue share row
    let shareLabel: string;
    if (isFriday) {
      shareLabel = "Bandcamp revenue share (0% — Bandcamp Friday)";
    } else if (isPhysical) {
      shareLabel = `Bandcamp revenue share (${ctx.formatPercent(bandcampFees.physicalPercent)} — physical)`;
    } else if (overThreshold) {
      shareLabel = `Bandcamp revenue share (${ctx.formatPercent(bandcampFees.digitalPercentTier)} — over $${bandcampFees.digitalTierThreshold.toLocaleString()} threshold)`;
    } else {
      shareLabel = `Bandcamp revenue share (${ctx.formatPercent(bandcampFees.digitalPercentStandard)} — standard)`;
    }

    const subLine = isFriday
      ? `Bandcamp waives its fee — you pay only processing (${ctx.formatPercent(r.takeRatePercent)} effective rate)`
      : `Bandcamp takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: subLine,
      },
      rows: [
        {
          label: "Sale price",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: shareLabel,
          display: ctx.formatCurrency(r.revenueSharFee),
          kind: "deduction",
        },
        {
          label: `Payment processing (${ctx.formatPercent(bandcampFees.processingPercent)} + $${bandcampFees.processingFixed.toFixed(2)})`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: "Total fees",
          display: ctx.formatCurrency(r.totalFees),
          kind: "deduction",
        },
        {
          label: "You receive",
          display: ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasCost
          ? [
              {
                label: "Profit after item cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Bandcamp charges artists two fees on every sale: a revenue share and a payment processing fee.\n\nThe revenue share is Bandcamp's cut of the sale price. For digital music and download sales, the standard rate is 15%. Once you've earned $5,000 USD in lifetime digital sales — maintained on a rolling 12-month basis — the rate drops permanently to 10% (as long as you continue to earn at least $5,000 in each trailing 12-month window). For physical merchandise including vinyl, CDs, and apparel, the revenue share is a flat 10% regardless of your sales volume.\n\nThe payment processing fee covers the cost of the card transaction. Bandcamp uses 2.9% + $0.30 as the representative card processing rate. This applies on top of the revenue share on every sale.\n\nOn Bandcamp Friday — a recurring one-day event where Bandcamp waives its revenue share — the platform fee drops to 0%. Fans still pay the listed price, but Bandcamp's entire cut goes directly to you. Only the payment processing fee applies on Bandcamp Friday sales.\n\nBandcamp does not charge listing fees, monthly subscription fees, or discovery fees on your own profile sales.",

  seoContent: `Our Bandcamp fee calculator is a free tool for artists, bands, and independent musicians that shows exactly what Bandcamp takes on every sale — and what you actually receive. Bandcamp is one of the most creator-friendly music platforms on the internet, but understanding its revenue share structure, the $5,000 threshold, and how Bandcamp Friday changes your payout is important for pricing your music and merchandise correctly.

## How Bandcamp's fee structure works in 2026.

Bandcamp charges artists two separate fees on each sale: a revenue share and a payment processing fee. These are stacked: both apply to the sale price, and your payout is what remains after both are deducted.

**Digital sales (music, EPs, albums, downloads):**

The standard Bandcamp revenue share on digital sales is **15%**. However, once an artist's cumulative digital sales reach **$5,000 USD**, the rate drops to **10%**. This lower rate is maintained on a rolling 12-month basis — meaning Bandcamp expects you to have earned at least $5,000 in the preceding 12 months for the reduced rate to stay active. If your sales fall below that threshold in any 12-month window, the rate reverts to 15%.

On a $10 digital sale at the standard 15% rate: Bandcamp takes $1.50 (revenue share) plus $0.59 (processing), totalling $2.09 in fees. You receive $7.91. At the lower 10% tier: Bandcamp takes $1.00 plus $0.59 processing, totalling $1.59 in fees. You receive $8.41.

**Physical / merchandise sales:**

Bandcamp charges a flat **10% revenue share** on physical goods — vinyl records, CDs, cassettes, T-shirts, posters, and other merchandise. This flat rate applies regardless of your total sales volume; there is no threshold step-down for physical goods. Payment processing of 2.9% + $0.30 applies on top.

On a $30 vinyl record sale: Bandcamp takes $3.00 (10% revenue share) plus $1.17 (processing), totalling $4.17 in fees. You receive $25.83.

## What is Bandcamp Friday?

Bandcamp Friday is a recurring one-day event on which Bandcamp **waives its entire revenue share**. On Bandcamp Friday, 100% of every sale — minus only the payment processing fee — goes directly to the artist. Bandcamp absorbs its own cut.

Payment processing fees (2.9% + $0.30 per transaction) still apply on Bandcamp Friday, because those fees go to the payment processor, not to Bandcamp. On a $10 sale during Bandcamp Friday: you pay $0.59 in processing and receive $9.41 — versus $7.91 on a regular day at the standard 15% rate.

Bandcamp Friday is scheduled on specific dates throughout the year. In 2026, scheduled dates include February 6, March 6, May 1, August 7, September 4, October 2, November 6, and December 4. Sales must be completed within the 12:00am–11:59pm Pacific Time window to count.

## Digital vs physical: which has lower fees?

Physical merch has a lower revenue share than standard digital sales: 10% versus 15%. However, once you cross the $5,000 digital sales threshold, digital and physical carry the same 10% revenue share. For artists just starting out, merch actually carries a lower platform fee than digital downloads.

## Payment processing on Bandcamp.

Bandcamp's payment processing fees depend on the payment method used by the buyer. The published rates for Enhanced Payments (Bandcamp's built-in checkout):

- **Credit/debit card:** 2.2% + $0.30 per transaction
- **PayPal:** 1.9% + $0.30 per transaction
- **Gift card:** 2.9% + $0.30 per transaction

This calculator uses **2.9% + $0.30** as the representative card rate — a conservative estimate that covers the highest commonly encountered standard transaction rate. Your actual processing fee may be slightly lower depending on the buyer's payment method. For transactions under $8.07, Bandcamp applies a microtransaction rate.

## How Bandcamp compares to other creator platforms.

Bandcamp is unusually transparent and artist-friendly compared to streaming services. Spotify pays artists fractions of a cent per stream; Bandcamp pays artists a direct percentage of every transaction, with the remainder going to the artist immediately (or within a short payout window).

Compared to other direct-to-fan platforms: Ko-fi charges 0% on its free plan (or 5% on Ko-fi Gold shop sales); Gumroad charges 10% + $0.50 per sale; Substack charges 10% on subscriptions; Patreon charges 5–10% depending on the plan. Bandcamp's 15% standard digital rate is slightly higher than Gumroad's 10%, but Bandcamp brings significant organic music-fan discovery that general digital product platforms do not.

## Accuracy and what this calculator covers.

All rates in this calculator are sourced from Bandcamp's official help pages and verified on 2026-06-15. The revenue share rates (15% standard, 10% over-threshold for digital; 10% flat for physical; 0% on Bandcamp Friday) and the processing fee structure (2.9% + $0.30 representative card rate) are Bandcamp's currently published rates. Microtransaction rates for sales under $8.07, PayPal payout fees, gift card rates, and currency conversion fees are not modelled. The $5,000 rolling 12-month requirement for the lower digital tier is described in Bandcamp's terms; this calculator models whether you have crossed it via the threshold toggle. Always verify with your Bandcamp dashboard and the official sources listed below before making pricing decisions.`,

  workedExample: {
    scenario: "You sell a $10 digital album to a fan (standard 15% rate, credit card payment).",
    steps: [
      { label: "Sale price", value: "$10.00" },
      { label: "Bandcamp revenue share (15%)", value: "$1.50" },
      { label: "Payment processing (2.9% + $0.30)", value: "$0.59" },
      { label: "Total fees", value: "$2.09" },
    ],
    result: "You receive $7.91",
  },

  faqs: [
    {
      q: "How much does Bandcamp take?",
      a: "Bandcamp takes a revenue share plus payment processing. For digital sales, the revenue share is 15% — dropping to 10% once you've reached $5,000 USD in lifetime digital sales (maintained on a rolling 12-month basis). For physical merch, the revenue share is a flat 10%. Payment processing (2.9% + $0.30 for card payments) applies on top of the revenue share for all sale types. On a $10 digital sale at 15%, total fees are $2.09 and you receive $7.91.",
    },
    {
      q: "What is Bandcamp Friday and how does it affect fees?",
      a: "Bandcamp Friday is a recurring one-day event on which Bandcamp waives its entire revenue share. Your effective Bandcamp cut drops to 0%. Payment processing fees (2.9% + $0.30) still apply because those go to the payment processor, not Bandcamp. On a $10 sale on a regular day (15% share), you receive $7.91. On Bandcamp Friday, you receive $9.41 — because the $1.50 Bandcamp share is eliminated entirely.",
    },
    {
      q: "When does Bandcamp's fee drop from 15% to 10%?",
      a: "Bandcamp's digital revenue share drops from 15% to 10% once an artist has reached $5,000 USD in lifetime digital sales. Bandcamp maintains this reduced rate on a rolling 12-month basis — you need to have earned at least $5,000 in the trailing 12 months for the 10% rate to stay active. If sales fall below $5,000 in any 12-month window, the rate reverts to 15%.",
    },
    {
      q: "What are Bandcamp's fees on physical merch?",
      a: "Bandcamp charges a flat 10% revenue share on all physical goods — vinyl, CDs, cassettes, clothing, posters. Unlike digital sales, there is no threshold step-down for physical; the 10% rate applies regardless of your total sales volume. Payment processing of 2.9% + $0.30 applies on top. On a $30 vinyl record, total fees are $4.17 (Bandcamp $3.00 + processing $1.17) and you receive $25.83.",
    },
    {
      q: "Does Bandcamp charge listing fees or monthly fees?",
      a: "No. Bandcamp does not charge listing fees, monthly account fees, discovery surcharges, or any upfront costs. You only pay when you make a sale — Bandcamp's revenue share and the payment processing fee are both deducted per transaction. There are no tiers or paid upgrades required to sell on Bandcamp.",
    },
    {
      q: "How do Bandcamp fees compare to Gumroad or Patreon?",
      a: "Bandcamp's standard digital revenue share (15%) is higher than Gumroad's flat 10% + $0.50. However, Bandcamp's 10% reduced tier (after $5,000 in sales) is comparable to Gumroad's rate without the fixed per-transaction surcharge. Compared to Patreon's new flat 10% plan, Bandcamp's standard 15% is higher — but Bandcamp Friday (0% share) dramatically shifts the math on those days. For physical goods, Bandcamp's 10% is competitive. The key differentiator is that Bandcamp is a dedicated music platform with organic music-fan discovery built in.",
    },
    {
      q: "What payment processing fees does Bandcamp charge?",
      a: "Bandcamp's processing fees depend on the payment method. Credit/debit card: 2.2% + $0.30. PayPal: 1.9% + $0.30. Gift card: 2.9% + $0.30. This calculator uses 2.9% + $0.30 as a conservative representative card rate. For very small transactions (under $8.07), Bandcamp applies a microtransaction rate. These fees go to the payment processor, not to Bandcamp — which is why even Bandcamp Friday sales have a small processing fee.",
    },
  ],

  related: [
    "substack-fee-calculator",
    "ko-fi-fee-calculator",
    "gumroad-fee-calculator",
    "patreon-fee-calculator",
  ],

  sources: [
    {
      label: "Bandcamp — What are Bandcamp's fees? (official help page)",
      url: "https://get.bandcamp.help/en/articles/15263193-what-are-bandcamp-s-fees",
    },
    {
      label: "Bandcamp — Payment processor fees for digital sales",
      url: "https://get.bandcamp.help/en/articles/15263218-how-much-are-payment-processor-fees-for-digital-sales",
    },
    {
      label: "Bandcamp — Payment processor fees for physical sales",
      url: "https://get.bandcamp.help/en/articles/15263264-how-much-are-payment-processor-fees-for-physical-sales",
    },
    {
      label: "Bandcamp — Bandcamp Friday help",
      url: "https://get.bandcamp.help/en/articles/15263119-bandcamp-friday-help",
    },
    {
      label: "Bandcamp — Fair trade music policy",
      url: "https://bandcamp.com/fair_trade_music_policy",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-15",
};
