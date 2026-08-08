import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { bmacFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const bmacFeeCalculator: CalculatorConfig = {
  slug: "buy-me-a-coffee-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "bmac",
  title: "Buy Me a Coffee Fee Calculator",
  metaDescription:
    "Free Buy Me a Coffee fee calculator. BMaC's '5%' is really ~9–18% once Stripe stacks on — worst on small coffees. See your true payout and effective rate on any coffee, membership or one-time payment.",
  h1: "Buy Me a Coffee Fee Calculator",
  intro:
    "The '5% fee' is only half the story: Stripe's processing stacks on top, so your real cut is closer to 9% on a $15 coffee and ~18% on a $3 one. Enter your amount to see the true payout and effective rate — with toggles for international and membership payments, which push it higher still.",

  keywords: {
    primary: "buy me a coffee fee calculator",
    secondary: [
      "buy me a coffee fees",
      "buy me a coffee fees calculator",
      "bmac fees",
      "how much does buy me a coffee take",
      "buy me a coffee fee percentage",
      "buy me a coffee payout calculator",
      "buy me a coffee platform fee",
    ],
    longTail: [
      "buy me a coffee 5% fee",
      "buy me a coffee stripe fee",
      "bmac fee calculator",
      "buy me a coffee creator fees",
      "how much does bmac charge",
      "buy me a coffee membership fees",
      "buy me a coffee vs ko-fi fees",
      "buy me a coffee vs patreon fees",
      "does buy me a coffee charge fees",
      "buy me a coffee processing fee",
      "buy me a coffee take rate",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "amount",
      label: "Payment amount",
      type: "currency",
      default: 15,
      min: 0,
      help: "The amount your supporter pays you. BMaC's 5% fee is applied to this.",
    },
    {
      id: "isInternational",
      label: "International payment (non-US)",
      type: "toggle",
      default: false,
      help: "Adds a +1% Stripe international surcharge for payments from outside the US.",
    },
    {
      id: "isSubscription",
      label: "Subscription / recurring payment",
      type: "toggle",
      default: false,
      help: "Adds a +0.5% Stripe recurring billing fee for memberships and subscriptions.",
    },
    {
      id: "itemCost",
      label: "Your content / item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to create or source — to calculate your real profit.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const amount = Math.max(0, Number(values.amount) || 0);
    const isIntl = Boolean(values.isInternational);
    const isSub = Boolean(values.isSubscription);
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    // Processing: base 2.9% + 0.5% payout = 3.4%; +1% if intl; +0.5% if subscription
    const processingPercent =
      bmacFees.processingPercent +
      (isIntl ? bmacFees.intlSurchargePercent : 0) +
      (isSub ? bmacFees.subscriptionSurchargePercent : 0);

    const r = computeMarketplaceFee({
      itemPrice: amount,
      itemCost,
      feeOnShipping: false,
      sellingPercent: bmacFees.platformPercent,
      processingPercent,
      processingFixed: bmacFees.processingFixed,
    });

    const hasCost = itemCost > 0;

    const surchargeNotes: string[] = [];
    if (isIntl) surchargeNotes.push("+1% international");
    if (isSub) surchargeNotes.push("+0.5% subscription");
    const processingLabel = `Processing (${ctx.formatPercent(processingPercent)} + $${bmacFees.processingFixed.toFixed(2)}${surchargeNotes.length ? " — " + surchargeNotes.join(", ") : ""})`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `BMaC + Stripe takes ${ctx.formatCurrency(r.totalFees)} of your ${ctx.formatCurrency(r.revenue)} payment`,
      },
      rows: [
        {
          label: "Payment amount",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `BMaC platform fee (${ctx.formatPercent(bmacFees.platformPercent)})`,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
        },
        {
          label: processingLabel,
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
                label: "Profit after content cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "The 5% everyone quotes is only Buy Me a Coffee's own cut — Stripe's processing comes out separately, so more leaves each payment than the headline suggests:\n\n- **BMaC platform fee: 5%** — on everything (coffees, memberships, shop, extras). No monthly fee; you only pay when you earn.\n- **Stripe processing: 3.4% + $0.30** — 2.9% + $0.30 standard, plus 0.5% payout.\n- **+1%** if the supporter's card is non-US; **+0.5%** on recurring memberships.\n\nThe headline is 5%, but the fixed $0.30 is what really bites small payments: on a $3 coffee your effective cut is ~18%, on $15 it's ~10%, and it only settles near 9% on larger amounts. Toggle international/membership above to see how much higher it climbs. BMaC does let you pass the Stripe fee to supporters (in your dashboard settings) so you absorb only the 5% — this calculator shows the default, where you absorb both.",

  seoContent: `**Quick numbers:**

- **Platform fee: 5%** — flat, on everything (coffees, memberships, shop, extras). No monthly fee.
- **Plus Stripe: 3.4% + $0.30** — 2.9% + $0.30 standard, plus a 0.5% payout fee.
- **Real cut: ~9% to ~18%**, not 5% — the fixed $0.30 makes small coffees hurt most.
- **+1%** on non-US cards; **+0.5%** on recurring memberships — both stack.
- **No "Gold" plan exists.** Some guides claim a $5/month tier removes the fee — that's Ko-fi's model, not BMaC's. BMaC has one flat 5%.

## Why "5%" is really 9–18%.

The 5% is the platform's cut. Stripe takes a separate 3.4% + $0.30 to move the money — and that fixed 30 cents is a bigger slice of a small coffee than a large one. Here's what you actually keep on a US one-time payment:

| Payment | You keep | Effective fee |
|---|---|---|
| $3 | $2.45 | ~18% |
| $5 | $4.28 | ~14% |
| $15 | $13.44 | ~10% |
| $50 | $45.50 | ~9% |
| $100 | $91.30 | ~8.7% |

If most of your support comes in $3–$5 coffees, budget for ~15%, not 5%. The calculator above shows the exact figure for your amount.

## What pushes the fee even higher.

Two surcharges stack on top of the base rate, and they compound:

| Payment type | Extra | Combined take on $10 |
|---|---|---|
| US one-time | — | ~11% |
| International one-time | +1% | ~12% |
| Recurring membership | +0.5% | ~12% |
| International membership | +1.5% | ~13% |

A $10/month membership from an overseas supporter loses close to 13% — more than double the headline rate. Toggle **International** and **Membership** above to model your own mix.

## Buy Me a Coffee vs Ko-fi vs Patreon.

| Platform | Tips | Memberships | Monthly fee |
|---|---|---|---|
| **BMaC** | 5% | 5% | None |
| **Ko-fi (Free)** | 0% | 5% | None |
| **Ko-fi Gold** | 0% | 0% | $12/mo |
| **Patreon** | — | 8–12% | None |

If you mostly take small one-time tips, **Ko-fi's Free plan is cheaper** — it charges 0% on tips where BMaC charges 5%. BMaC's edge is simplicity: one flat rate, no plan to choose, no separate PayPal. At scale, Ko-fi Gold's flat $12/month beats BMaC's 5% once you clear about $240/month (5% of $240 = $12). See our [Ko-fi fee calculator](/ko-fi-fee-calculator) to compare side by side.

## Can I avoid the fee?

Partly. BMaC lets you **pass the Stripe processing fee to supporters** in your dashboard settings — they pay a little extra at checkout and you absorb only the 5% platform fee. You can't remove the 5% itself. There's no paid plan that waives it (despite what some third-party guides claim). This calculator shows the default, where you absorb both fees.

## Working out your take-home.

Your payout = amount − (amount × 5%) − (amount × 3.4% + $0.30). Add 1% to the Stripe rate for international cards, and 0.5% for recurring memberships. The calculator does this instantly — adjust the amount and toggles to model any scenario.

## How we sourced this.

Every figure here traces to Buy Me a Coffee's own help pages, last checked 2026-08-06 — the 5% platform cut and the Stripe stack (2.9% + $0.30, plus a 0.5% payout fee), along with the +1% international and +0.5% membership add-ons. One thing we don't model: Stripe's rates for creators based outside the US, which vary by country, so check your local Stripe pricing. The exact pages are linked below.`,

  workedExample: {
    scenario: "You receive a $15 one-time coffee from a US-based supporter.",
    steps: [
      { label: "Payment amount", value: "$15.00" },
      { label: "BMaC platform fee (5%)", value: "$0.75" },
      { label: "Stripe processing (3.4% + $0.30)", value: "$0.81" },
      { label: "Total fees", value: "$1.56" },
    ],
    result: "You receive $13.44",
  },

  faqs: [
    {
      q: "Is Buy Me a Coffee really just 5%?",
      a: "Not really — 5% is only the platform's share. Stripe adds 3.4% + $0.30 on top of it (2.9% + $0.30 plus a 0.5% payout fee), so a $15 coffee nets you $13.44, and a small $5 one is closer to ~14% than 5%. There's no monthly fee, though: you pay only when someone supports you.",
    },
    {
      q: "How much does Buy Me a Coffee charge on a $5 coffee?",
      a: "On a $5 one-time coffee from a US supporter: the BMaC fee is $0.25 (5%) and the Stripe processing fee is $0.47 (3.4% + $0.30), leaving you with $4.28. The effective take rate is about 14.4%, which is higher than on larger payments because the fixed $0.30 Stripe fee is more impactful on small transactions.",
    },
    {
      q: "Does Buy Me a Coffee charge fees on memberships?",
      a: "Yes — Buy Me a Coffee charges the same 5% platform fee on membership payments. Stripe also adds a +0.5% subscription billing surcharge for recurring payments, bringing the Stripe component to 3.9% + $0.30. Toggle the 'subscription' option in the calculator above to see the membership fee breakdown.",
    },
    {
      q: "Are there extra fees for international supporters?",
      a: "Yes — when a supporter pays with a non-US card, Stripe applies a +1% international processing surcharge on top of the base rate. So for an international payment, the Stripe component becomes 4.4% + $0.30 (plus the standard 5% BMaC platform fee). Toggle 'International' in the calculator to model this.",
    },
    {
      q: "Can I pass the Stripe processing fee to my supporters?",
      a: "Buy Me a Coffee gives creators the option to pass credit card processing fees to supporters, so the supporter pays a slightly higher amount and the creator absorbs only the 5% platform fee. This option is available in your BMaC creator settings. The calculator above models the default scenario where the creator absorbs all fees.",
    },
    {
      q: "How does Buy Me a Coffee compare to Ko-fi for fees?",
      a: "Ko-fi's Free plan charges 0% on tips and donations — BMaC charges 5% on everything including tips. For tip-based income, Ko-fi is cheaper. For memberships and shop sales, Ko-fi charges 5% too (same as BMaC) unless you're on Ko-fi Gold ($12/month, 0% platform fee). Ko-fi Gold beats BMaC financially once you earn more than $240/month from memberships/shop sales.",
    },
    {
      q: "Is there a monthly fee for Buy Me a Coffee?",
      a: "No monthly or setup fee — the 5% (plus Stripe) is charged only when a supporter actually pays. And if you'd rather not absorb the Stripe part, BMaC can pass those processing fees to your supporters at checkout (a setting in your dashboard), leaving you with just the 5% platform cut.",
    },
  ],

  // Batch-1 siblings first (see config/indexing.ts): keep crawl equity in the
  // indexable set while it's the only surface Google is indexing.
  related: [
    "ko-fi-fee-calculator",
    "gumroad-fee-calculator",
    "substack-fee-calculator",
    "bandcamp-fee-calculator",
    "stripe-fee-calculator",
  ],

  sources: [
    {
      label: "Buy Me a Coffee — How to calculate charges on your payment",
      url: "https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment",
    },
    {
      label: "Buy Me a Coffee — What is Buy Me a Coffee and how does it work?",
      url: "https://help.buymeacoffee.com/en/articles/10182730-what-is-buy-me-a-coffee-and-how-does-it-work",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-08-08",
};
