import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { gumroadFees } from "../../config/fees";
import { computeGumroadFee } from "./formula";

export const gumroadFeeCalculator: CalculatorConfig = {
  slug: "gumroad-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "gumroad",
  title: "Gumroad Fee Calculator",
  metaDescription:
    "Free Gumroad fee calculator. Direct sales cost ~14% (10% + $0.50 + Stripe); Gumroad Discover costs a flat 30%. See the real payout on both — and why cheap products barely beat the Discover rate.",
  h1: "Gumroad Fee Calculator",
  intro:
    "Gumroad has two very different prices. A sale from your own link costs about 14% once Stripe is added; a sale Gumroad's marketplace sends you costs a flat 30%. On cheap products the gap almost vanishes — a $5 direct sale already loses ~29%. Enter your price and sale source to see exactly what you keep.",

  keywords: {
    primary: "gumroad fee calculator",
    secondary: [
      "gumroad fees calculator",
      "gumroad fees",
      "how much does gumroad take",
      "gumroad selling fees",
      "gumroad transaction fee",
      "gumroad payout calculator",
      "gumroad profit calculator",
      "gumroad fee percentage",
    ],
    longTail: [
      "gumroad fees on $100",
      "gumroad discover fee",
      "gumroad 10 percent fee",
      "gumroad vs patreon fees",
      "gumroad vs ko-fi fees",
      "gumroad vs substack fees",
      "gumroad vs gumroad discover",
      "does gumroad still charge processing fees",
      "gumroad flat fee explained",
      "gumroad creator fees 2026",
      "how much does gumroad charge per sale",
      "gumroad take rate",
      "gumroad fee structure history",
      "gumroad no monthly fee",
      "gumroad stripe processing fee",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "salePrice",
      label: "Sale price",
      type: "currency",
      default: 25,
      min: 0,
      help: "The price your customer pays. Gumroad applies its fee to this amount.",
    },
    {
      id: "source",
      label: "Sale source",
      type: "select",
      default: "direct",
      options: [
        { value: "direct", label: "Direct sale (your link / profile)" },
        { value: "discover", label: "Gumroad Discover (marketplace)" },
      ],
      help: "Direct sales: 10% + $0.50 Gumroad fee plus Stripe processing. Discover sales: 30% flat, all-inclusive (no separate Stripe fee).",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to create or source this product — to calculate your real profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const salePrice = Math.max(0, Number(values.salePrice) || 0);
    const source = String(values.source || "direct") as "direct" | "discover";
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    const r = computeGumroadFee({ salePrice, source, itemCost });

    const hasCost = itemCost > 0;
    const isDiscover = source === "discover";

    const gumroadFeeLabel = isDiscover
      ? `Gumroad Discover fee (${ctx.formatPercent(gumroadFees.discoverPercent)} — all-in)`
      : `Gumroad platform fee (${ctx.formatPercent(gumroadFees.directPercent)} + $${gumroadFees.directFixed.toFixed(2)})`;

    const subLine = isDiscover
      ? `Gumroad takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.salePrice)} Discover sale (processing included)`
      : `Gumroad + Stripe takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.salePrice)} direct sale`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: subLine,
      },
      rows: [
        {
          label: "Sale price",
          display: ctx.formatCurrency(r.salePrice),
        },
        {
          label: gumroadFeeLabel,
          display: ctx.formatCurrency(r.gumroadFee),
          kind: "deduction",
        },
        ...(!isDiscover
          ? [
              {
                label: `Stripe processing (${ctx.formatPercent(gumroadFees.directProcessingPercent)} + $${gumroadFees.directProcessingFixed.toFixed(2)})`,
                display: ctx.formatCurrency(r.processingFee),
                kind: "deduction" as const,
              },
            ]
          : []),
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
    "Gumroad has no monthly fee, no tiers, and no volume discounts — you pay only when you sell. What you pay depends entirely on where the customer came from:\n\n- **Direct sale** (your link, profile, or embed): **10% + $0.50** to Gumroad, plus **Stripe 2.9% + $0.30** charged separately. On a $25 sale that's $3.00 + $1.03 = $4.03, so you keep **$20.97**.\n- **Gumroad Discover** (a buyer found you in Gumroad's marketplace): a flat **30%, all-in** — processing is included, nothing extra. On a $25 Discover sale you keep **$17.50**.\n\nBecause the direct fee has a fixed 80¢ built in ($0.50 + Stripe's $0.30), it bites hardest on cheap products: a $5 direct sale loses ~29%, nearly the 30% Discover rate. The bigger the price, the closer direct sales get to their ~13.7% floor. Toggle the sale source above to compare.",

  seoContent: `**Before you price anything:**

- **Two prices.** A sale you drive costs **10% + $0.50 + Stripe (2.9% + $0.30)**; a sale from Gumroad Discover costs a flat **30%, all-in**.
- **Direct sales run ~14%** on a $100 product — but **~29% on a $5 one**, because of the fixed 80¢.
- **No monthly fee, no tiers.** Everyone pays the same rate; you only pay when you sell.
- **Gumroad is now Merchant of Record** — it handles VAT/sales tax, charged to the buyer on top, not from your payout.

## The two Gumroad fees — the cliff between them.

Gumroad charges based on how the customer found you, and the gap is large:

| Sale source | Fee on a $100 sale | You keep |
|---|---|---|
| **Direct** (your link / profile) | ~13.7% ($13.70) | $86.30 |
| **Gumroad Discover** (marketplace) | 30% ($30.00) | $70.00 |

Direct sales are ones you drive — from your email list, social posts, website, or profile link. Discover sales are ones Gumroad's own marketplace sends you. The 30% is the price of that traffic; if you brought the customer yourself, you never pay it.

## What you really keep on a direct sale.

The "10%" isn't the whole story: Stripe adds 2.9% + $0.30, and Gumroad's own $0.50 is fixed. Those fixed cents dominate small sales, so the effective rate falls as your price rises:

| Sale price | You keep | Effective fee |
|---|---|---|
| $5 | $3.55 | ~29% |
| $10 | $7.91 | ~21% |
| $25 | $20.97 | ~16% |
| $50 | $42.75 | ~14.5% |
| $100 | $86.30 | ~13.7% |

The striking line is the top one: a **$5 direct sale loses ~29% — almost the 30% Discover rate.** On cheap products, driving your own traffic barely beats letting Gumroad's marketplace do it. Price higher, bundle, or add an order bump so the fixed 80¢ is a smaller slice.

## Why Discover costs 30%.

When a buyer finds you through Gumroad's marketplace, Gumroad is the channel and the processor, so the 30% all-in rate is its cut for the customer it acquired. For most established sellers, Discover is an occasional bonus — the bulk of revenue comes from their own audience at the direct rate. Treat any Discover sale as found money, not your pricing baseline.

## Gumroad vs Ko-fi vs Substack.

| Platform | Fee on a digital sale | Processing | Monthly |
|---|---|---|---|
| **Gumroad** (direct) | 10% + $0.50 | + 2.9% + $0.30 | None |
| **Gumroad** (Discover) | 30% all-in | included | None |
| **Ko-fi** (Free) | 5% shop | + Stripe | None |
| **Substack** | 10% | + Stripe | None |
| **Patreon** | 8–12% | + Stripe | None |

For one-off digital products, [Ko-fi's shop](/ko-fi-fee-calculator) at 5% is cheaper than Gumroad's 10% direct rate — but Gumroad handles global sales tax and has a built-in marketplace Ko-fi doesn't. For subscription content, [Substack](/substack-fee-calculator) matches Gumroad at 10% + Stripe. Paddle and Lemon Squeezy sit lower at ~5% + $0.50 and also act as merchant of record.

## Is there a monthly fee?

No. Gumroad has no subscription, no plan tiers, and no volume minimums — you can publish unlimited products and pay nothing until a sale happens. Every seller pays the same 10% + $0.50 (plus Stripe) on direct sales regardless of how much they earn.

## What "Merchant of Record" means for you.

Since 1 January 2025 Gumroad is the merchant of record on every sale. It calculates, collects, and remits VAT, GST, and US sales tax worldwide, and that tax is added to the buyer's total — it does not come out of your payout. You don't file or track it; Gumroad does. (It does not change the fees above.)

## Doing the math on a sale.

Direct payout = price − (price × 10% + $0.50) − (price × 2.9% + $0.30). Discover payout = price × 70% (nothing else is deducted). The calculator above does both instantly — switch the sale source and enter your price.

## What these numbers include.

We pull the direct rate (10% + $0.50), the 30% Discover rate, and Stripe's US card rate (2.9% + $0.30) straight from Gumroad's fee page, last confirmed 2026-08-06. Not included: international card surcharges, PayPal, and currency conversion. Everything's cited below so you can check it against the source yourself.`,

  workedExample: {
    scenario: "You sell a $25 digital product through a direct link (your own audience).",
    steps: [
      { label: "Sale price", value: "$25.00" },
      { label: "Gumroad platform fee (10% + $0.50)", value: "$3.00" },
      { label: "Stripe processing (2.9% + $0.30)", value: "$1.03" },
      { label: "Total fees", value: "$4.03" },
    ],
    result: "You receive $20.97",
  },

  faqs: [
    {
      q: "Why is Gumroad taking more than 10%?",
      a: "Because 10% + $0.50 is only the direct-sale platform fee — Stripe's 2.9% + $0.30 is charged separately on top, so a $25 sale really costs $4.03 (~16%) and you keep $20.97. And if the buyer found you through Gumroad Discover rather than your own link, the fee jumps to a flat 30%, all-in.",
    },
    {
      q: "Does Gumroad still charge separate processing fees?",
      a: "Yes, for direct sales. Gumroad's 10% + $0.50 is their platform fee only. Stripe's card processing fee of 2.9% + $0.30 is charged separately on every direct sale. So the total cost of a direct sale has two components: the Gumroad fee and the Stripe fee. For Gumroad Discover sales, the 30% fee is all-inclusive — no separate Stripe fee applies.",
    },
    {
      q: "What is the Gumroad Discover fee?",
      a: "Sales made through Gumroad Discover — the built-in marketplace where customers browse and search for products on gumroad.com — are charged a flat 30% fee, and this rate includes all payment processing. There is no additional Stripe fee. On a $50 Discover sale, Gumroad takes $15 and you keep $35. The higher rate compared to direct sales reflects the customer acquisition value that Gumroad's discovery engine provides.",
    },
    {
      q: "What are Gumroad fees on a $100 sale?",
      a: "On a $100 direct sale: Gumroad fee is $10.50 (10% + $0.50) and Stripe processing is $3.20 (2.9% + $0.30), totalling $13.70 in fees. You keep $86.30. On a $100 Gumroad Discover sale: the fee is $30.00 (30% all-in) and you keep $70.00. Use the calculator above for any price.",
    },
    {
      q: "Is there a monthly fee on Gumroad?",
      a: "No — no subscription, no tiers, no minimums; you pay only when a sale happens. Every seller is on the same 10% + $0.50 (plus Stripe) for direct sales, whether you sell once a year or a thousand times. The one thing that changes your rate is where the buyer came from: a Gumroad Discover sale costs a flat 30% instead.",
    },
    {
      q: "How does Gumroad compare to Ko-fi and Substack for fees?",
      a: "Gumroad charges 10% + $0.50 + Stripe processing (2.9% + $0.30) on direct sales — an effective rate of about 16.1% on a $25 product. Ko-fi's Free plan charges 5% + Stripe processing on shop sales (11.8% effective on $25), making Ko-fi cheaper for shop-type digital products. Substack also charges 10% + Stripe processing (3.6% + $0.30 with the recurring billing fee), essentially identical to Gumroad for subscription content. The main difference is platform focus: Gumroad suits one-time product sales, Substack suits newsletters and subscriptions, and Ko-fi suits tip-jar-style creator support.",
    },
    {
      q: "Did Gumroad change its fee structure recently?",
      a: "Yes — Gumroad has changed its fees several times. It originally ran a tiered model (3.5–8.5% depending on lifetime sales volume), with higher rates for lower-earning creators and lower rates for high-volume sellers. In 2021, Gumroad eliminated the tiered system and moved to the current flat 10% + $0.50 for everyone, removing the monthly subscription that had previously been required. The 30% Gumroad Discover fee has been a separate, all-inclusive rate since the Discover marketplace launched. Since January 1, 2025, Gumroad has also taken over all global sales tax compliance as the Merchant of Record.",
    },
  ],

  // Batch-1 siblings first (see config/indexing.ts): keep crawl equity in the
  // indexable set while it's the only surface Google is indexing.
  related: [
    "ko-fi-fee-calculator",
    "buy-me-a-coffee-fee-calculator",
    "substack-fee-calculator",
    "bandcamp-fee-calculator",
    "paddle-fee-calculator",
  ],

  sources: [
    {
      label: "Gumroad — Gumroad's fees (official help page)",
      url: "https://gumroad.com/help/article/66-gumroads-fees",
    },
    {
      label: "Stripe — US card processing pricing",
      url: "https://stripe.com/us/pricing",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-08-08",
};
