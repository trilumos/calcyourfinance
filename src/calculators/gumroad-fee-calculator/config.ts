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
    "Free Gumroad fee calculator. See exactly what Gumroad takes — 10% + $0.50 on direct sales plus Stripe processing, or 30% all-in for Gumroad Discover — and calculate your real payout.",
  h1: "Gumroad Fee Calculator",
  intro:
    "Calculate exactly what Gumroad takes from every sale and what you keep. Gumroad charges a flat 10% + $0.50 per direct sale, plus Stripe's processing fee on top. Sales through Gumroad Discover carry a flat 30% all-in fee. Enter your sale price and select your sale source to see the full breakdown.",

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
    "Gumroad charges a flat fee on every sale with no monthly subscription, no tiers, and no volume discounts. The fee you pay depends on where your customer found your product.\n\nFor direct sales — customers buying from a link you shared, your creator profile, or an embedded checkout — Gumroad takes 10% of the sale price plus a $0.50 per-transaction fee. On top of that, Stripe charges its standard card processing fee of 2.9% + $0.30 per transaction separately. So on a $25 direct sale, the Gumroad fee is $3.00 (10% + $0.50) and the Stripe processing fee is $1.03 (2.9% + $0.30), giving you a payout of $20.97.\n\nFor sales through Gumroad Discover — Gumroad's built-in discovery marketplace where customers browse and search for products on gumroad.com — the fee is a flat 30% of the sale price, with all payment processing included in that 30%. There is no separate Stripe fee added. On a $25 Discover sale, Gumroad takes $7.50 and you keep $17.50.\n\nThere is no monthly fee on Gumroad. You only pay when you make a sale.",

  seoContent: `Our Gumroad fee calculator is a free tool that shows exactly what Gumroad takes on every sale and what you keep. Gumroad is one of the most popular platforms for creators selling digital products — ebooks, courses, software, templates, music, and more. Its fee structure is simple by design, but the combination of a platform fee, a fixed per-transaction charge, and a separate Stripe processing fee on direct sales means your real payout is always less than the listed price. This calculator works it out instantly so you can price your products correctly.

## How Gumroad's fee structure works in 2026.

Gumroad operates on a flat fee model with no monthly subscription, no free vs. paid tier, and no volume discounts. The fee you pay depends on one thing: where did your customer come from?

**Direct sales** are sales made through a link you control — a link from your email list, your social media, your website, or your Gumroad creator profile. For these sales, Gumroad charges a platform fee of 10% of the sale price plus a fixed $0.50 per transaction. On top of that, Stripe (Gumroad's payment processor) charges its standard 2.9% + $0.30 per card payment. These two fees are separate: the 10% + $0.50 goes to Gumroad; the 2.9% + $0.30 goes to Stripe.

On a $100 direct sale: Gumroad fee = $10.50, Stripe processing = $3.20, total fees = $13.70, you keep $86.30. On a $25 direct sale: Gumroad fee = $3.00, Stripe processing = $1.03, total fees = $4.03, you keep $20.97.

**Gumroad Discover sales** are sales where a customer found your product by browsing or searching Gumroad's built-in marketplace at gumroad.com — the Discover section. For these sales, Gumroad charges a flat 30%, and that 30% is all-inclusive: payment processing is embedded, and no additional Stripe fee is charged. On a $100 Discover sale, Gumroad takes $30 and you keep $70.

## Why the Discover fee is so much higher.

The 30% Gumroad Discover fee reflects the traffic and distribution value Gumroad provides. When a customer finds your product through Gumroad's own marketplace — not through your own marketing effort — Gumroad is both the channel and the processor. The 30% all-in rate is intended to capture that customer acquisition value. By contrast, when you drive a sale yourself, you only pay the 10% + $0.50 + Stripe processing for using Gumroad's platform infrastructure.

For most serious Gumroad creators, the majority of sales come from direct links driven by their own audience — email lists, YouTube channels, social media, or SEO. Discover sales are an occasional bonus from organic search on Gumroad rather than the primary revenue driver for most sellers.

## Does Gumroad still charge separate processing fees?

Yes — for direct sales, Gumroad's 10% + $0.50 is their platform fee only. Stripe's card processing fee of 2.9% + $0.30 is charged separately on every direct sale. This is a common source of confusion because some platforms (like Mercari and Facebook Marketplace) have moved to an all-in fee model where processing is included. Gumroad has not done this for direct sales. The 30% Discover fee is all-in, but the standard direct-sale fee is not.

This means the effective rate on direct sales scales with the price. On a $10 product, Gumroad's effective take is about 18.8% of the sale. On a $100 product, the effective take drops to about 13.7%. The fixed components ($0.50 Gumroad + $0.30 Stripe = $0.80 total fixed) become proportionally smaller as the price rises.

## A brief history of Gumroad's fee changes.

Gumroad's fee structure has changed significantly over its history. In its early years, the platform charged a tiered model: higher percentages for lower-revenue creators (capped at 8.5%), lower percentages for higher earners (as low as 3.5%), plus a separate payment processing fee. This created a system where scale rewarded established creators.

In 2021, Gumroad moved to the current flat model — 10% for everyone, no tiers, no monthly fee. This was controversial among high-volume sellers who had previously paid lower rates, but it simplified pricing significantly and removed the monthly subscription requirement that had existed under the tiered plan. The current 10% + $0.50 rate has remained unchanged since then.

Since January 1, 2025, Gumroad has operated as a full Merchant of Record on all sales. This means Gumroad itself handles the calculation, collection, and remittance of sales tax, VAT, and GST for your customers around the world. You no longer need to manage sales tax compliance — Gumroad does it automatically and the tax is collected from the buyer on top of your listed price (not taken from your payout).

## Is there a monthly fee on Gumroad?

No. Gumroad has no monthly subscription fee. You can publish unlimited products, make unlimited sales, and build an audience on Gumroad without paying anything until you actually make a sale. The 10% fee (plus processing) only applies when a customer pays you. This makes Gumroad zero-risk for new creators or those with smaller audiences — you only pay when you earn.

## Gumroad fees compared to other creator platforms.

Gumroad's 10% direct fee is higher than some competitors. Ko-fi charges 5% on shop sales (on the Free plan), with 0% for Ko-fi Gold at $12/month. Substack charges a flat 10% (same as Gumroad) plus Stripe processing — nearly identical to Gumroad for subscription-based content. Patreon charges 5–12% depending on the plan. Buy Me a Coffee charges a flat 5%.

For digital product sellers specifically, Gumroad's 10% + processing is broadly competitive with similar platforms. Platforms like Paddle and Lemon Squeezy charge 5% + $0.50 but handle all tax compliance (as Gumroad now does too). The key advantage Gumroad offers is a large existing audience on Discover, brand recognition among digital product buyers, and deep integrations with creator workflows.

## Accuracy and what this calculator covers.

All fees in this calculator are taken from Gumroad's official help page and verified on 2026-06-15. The direct sale fee (10% + $0.50) and Discover fee (30%, all-in) are Gumroad's current published rates. Stripe's processing fee (2.9% + $0.30) represents the standard US domestic card rate. International card surcharges, PayPal payment options, or currency conversion fees are not modelled here. Check the sources below and your Gumroad dashboard for the complete picture before making pricing decisions.`,

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
      q: "What percentage does Gumroad take?",
      a: "On direct sales, Gumroad takes 10% of the sale price plus a fixed $0.50 per transaction — that's the Gumroad platform fee. Stripe charges an additional 2.9% + $0.30 on top for card processing. On a $25 sale, your total fees are $4.03 and you keep $20.97 (about 16.1% effective take). On sales through Gumroad Discover (the marketplace), the fee is a flat 30% all-inclusive, with no separate Stripe charge.",
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
      a: "No — Gumroad has no monthly subscription fee. You only pay fees when you make a sale. This makes Gumroad free to set up and use until you start earning. There are no plans, tiers, or paid upgrades — every seller pays the same 10% + $0.50 (plus Stripe processing) on direct sales regardless of revenue volume.",
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

  related: [
    "ko-fi-fee-calculator",
    "substack-fee-calculator",
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "paddle-fee-calculator",
    "etsy-fee-calculator",
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

  feesVerifiedOn: "2026-07-22",
  lastUpdated: "2026-06-15",
};
