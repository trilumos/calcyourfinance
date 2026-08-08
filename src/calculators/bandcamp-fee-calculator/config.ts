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
    "Free Bandcamp fee calculator. Digital is 15% (drops to 10% after $5,000 lifetime), merch is 10%, and on Bandcamp Friday the share is 0% — ~19% more in your pocket. See your real payout on any sale.",
  h1: "Bandcamp Fee Calculator",
  intro:
    "Bandcamp takes 15% of a digital sale — but that number moves. It falls to 10% once you've sold $5,000 of music, merch is 10% flat, and on Bandcamp Friday the share is 0%, putting about 19% more in your pocket on the same $10 sale. Enter your price and pick the scenario to see exactly what you keep.",

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
    "Every sale has two deductions: Bandcamp's revenue share, and a payment-processing fee. The share is the part that changes:\n\n- **Digital, standard: 15%** — the default on music and downloads.\n- **Digital, after $5,000: 10%** — once your digital sales pass $5,000 (kept on a rolling 12-month basis).\n- **Physical / merch: 10% flat** — vinyl, CDs, apparel, at any volume.\n- **Bandcamp Friday: 0%** — on those days Bandcamp waives its share entirely.\n- **Processing: ~2.9% + $0.30** — goes to the payment processor, so it applies even on Bandcamp Friday.\n\nOn a $10 digital sale that's $7.91 kept at the standard rate, $8.41 once you're past $5k, and **$9.41 on Bandcamp Friday** — about 19% more for the same sale. There are no listing, monthly, or discovery fees. Pick the sale type and toggles above to see your figure.",

  seoContent: `**The short version:**

- **Digital: 15%**, dropping to **10%** once your digital sales pass **$5,000** (rolling 12-month).
- **Physical / merch: 10% flat**, at any volume.
- **Bandcamp Friday: 0% share** — you keep everything but processing, ~19% more on a $10 sale.
- **Processing: ~2.9% + $0.30**, and it applies even on Bandcamp Friday (it goes to the card processor, not Bandcamp).
- **No listing, monthly, or discovery fees.**

## What you keep, by scenario.

The revenue share is the part that moves. Here's the same $10 digital sale under each rate (card processing included):

| Scenario | Bandcamp share | You keep |
|---|---|---|
| Digital — standard | 15% | $7.91 |
| Digital — after $5,000 | 10% | $8.41 |
| Physical / merch | 10% | $8.41 |
| **Any sale on Bandcamp Friday** | **0%** | **$9.41** |

Bandcamp Friday is the single biggest lever an artist has here — the $1.50 share on a $10 sale vanishes, so you keep about 19% more for doing nothing but timing the release. Only processing remains.

## What is Bandcamp Friday?

It's a recurring event — roughly monthly — where Bandcamp waives its entire revenue share for 24 hours (Pacific time). Fans pay the same price; Bandcamp's cut goes to you instead. Processing still applies because that money goes to the card processor, not Bandcamp. Dates are announced in advance and shift around, so check [Bandcamp's official schedule](https://get.bandcamp.help/en/articles/15263119-bandcamp-friday-help) before planning a drop rather than trusting a copied list. Artists routinely time album releases and merch drops to these days.

## The $5,000 tier drop.

Your digital share falls from 15% to 10% once your lifetime digital sales cross $5,000. Bandcamp keeps you on the lower rate as long as you've done at least $5,000 in the trailing 12 months; drop below that and it reverts to 15%. Merch is always 10%, so the threshold only affects digital. Toggle "reached $5,000" above to see the difference — on a $10 sale it's worth an extra $0.50 kept.

## Digital vs merch.

Starting out, **merch is actually cheaper than digital** — 10% flat vs 15% on downloads. Once you pass the $5,000 digital threshold the two even out at 10%. So a new artist selling a $10 download loses more to Bandcamp than one selling a $10 shirt.

## Processing depends on how the fan pays.

Bandcamp's built-in checkout charges different rates by method:

| Payment method | Processing fee |
|---|---|
| PayPal | 1.9% + $0.30 |
| Credit / debit card | 2.2% + $0.30 |
| Gift card | 2.9% + $0.30 |

This calculator uses **2.9% + $0.30** as a conservative representative rate — so your real payout is usually a touch higher than shown, not lower. Sales under $8.07 use a separate microtransaction rate.

## Bandcamp vs Gumroad vs Ko-fi vs Patreon.

| Platform | Fee on a digital sale | Processing | Best for |
|---|---|---|---|
| **Bandcamp** | 15% (10% after $5k) | + ~2.9% + $0.30 | Music, superfans |
| **Gumroad** | 10% + $0.50 | + 2.9% + $0.30 | One-off digital products |
| **Ko-fi** (Free) | 5% shop | + Stripe | Tips + small shop |
| **Patreon** | 5–12% | + processing | Recurring membership |

Bandcamp's standard 15% is higher than [Gumroad](/gumroad-fee-calculator) (10% + $0.50) or [Ko-fi](/ko-fi-fee-calculator) (5%), but it's a dedicated music marketplace with real fan discovery, and Bandcamp Friday plus the $5k tier drop close much of the gap for working musicians. For merch and post-threshold digital, its 10% is competitive with anyone.

## How the math works.

Payout = price − (price × share) − (price × 2.9% + $0.30), where the share is 15%, 10%, or 0% depending on sale type, threshold, and whether it's Bandcamp Friday. The calculator applies the right share automatically from your toggles.

## Accuracy and scope.

Rates come from Bandcamp's official help pages, verified on 2026-08-06: digital 15% / 10% over $5,000, physical 10%, Bandcamp Friday 0%, and processing (card 2.2% / PayPal 1.9% / gift 2.9% + $0.30, modelled at the conservative 2.9%). Microtransaction rates under $8.07 and currency conversion aren't modelled. Sources are linked below.`,

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
      a: "Bandcamp's standard digital revenue share (15%) is higher than Gumroad's flat 10% + $0.50. However, Bandcamp's 10% reduced tier (after $5,000 in sales) is comparable to Gumroad's rate without the fixed per-transaction surcharge. Compared to Patreon (5–12% depending on plan), Bandcamp's standard 15% is higher — but Bandcamp Friday (0% share) dramatically shifts the math on those days. For physical goods, Bandcamp's 10% is competitive. The key differentiator is that Bandcamp is a dedicated music platform with organic music-fan discovery built in.",
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
  lastUpdated: "2026-08-08",
};
