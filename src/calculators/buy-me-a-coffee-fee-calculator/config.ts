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
    "Free Buy Me a Coffee fee calculator. See exactly what BMaC takes — 5% platform fee plus Stripe processing — and calculate your real payout on every coffee, membership or one-time support payment.",
  h1: "Buy Me a Coffee Fee Calculator",
  intro:
    "Calculate exactly what Buy Me a Coffee takes from your earnings and what you keep. BMaC charges a flat 5% platform fee on every transaction, plus Stripe's processing fee. Enter your amount to see the full breakdown — toggle international or subscription surcharges for a more precise figure.",

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
    "Buy Me a Coffee charges a flat 5% platform fee on every transaction — one-time coffees, memberships, shop sales, and extras. There's no monthly fee; you only pay when you earn. On top of the 5%, Stripe processes the actual payment and charges a 2.9% + $0.30 transaction fee plus a 0.5% payout processing fee, bringing the Stripe component to 3.4% + $0.30.\n\nFor international payments (supporters outside the US), Stripe adds a further +1% international card surcharge. For recurring membership or subscription payments, Stripe adds a +0.5% billing fee. BMaC gives creators the option to pass Stripe's processing fees to supporters so they can absorb only the platform fee — check your BMaC dashboard settings for that option.\n\nOn a $15 payment from a US-based supporter, the BMaC fee is $0.75 and the Stripe processing fee is $0.81, leaving you with $13.44. On a $5 coffee, you keep $4.28 — the fixed $0.30 Stripe component makes small payments proportionally more expensive.",

  seoContent: `Our Buy Me a Coffee fee calculator is a free tool that shows exactly what the platform takes from every payment and what you keep. Buy Me a Coffee (often called BMaC) is one of the most widely used creator-support platforms, enabling artists, writers, podcasters, developers, and content creators to accept one-time tips and recurring memberships from their audience. Understanding its fee structure helps you price your support tiers correctly and know your real earnings before you withdraw.

## How Buy Me a Coffee's fees work.

Buy Me a Coffee charges a single flat platform fee of 5% on every transaction. This applies equally to one-time coffee payments, shop purchases, membership subscriptions, and any extras you sell. There's no monthly subscription fee for creators — the 5% is only charged when you receive money. This keeps the platform genuinely free to use until you start earning.

On top of the 5% platform fee, Stripe processes the payment and charges its standard rate. In the US, Stripe's base processing fee is 2.9% + $0.30 per transaction. BMaC also incurs a 0.5% Stripe payout fee when transferring funds to creators — bringing the total Stripe component to 3.4% + $0.30 for domestic transactions.

## Additional surcharges for international and subscription payments.

For payments made by supporters with non-US cards (international payments), Stripe applies a further +1% international processing surcharge. For recurring subscription and membership payments, Stripe's Billing product adds a +0.5% fee. These surcharges are additive, so an international recurring payment would add both +1% and +0.5% to the base Stripe rate.

Toggle the surcharges on in the calculator above to see their impact. On a $10/month international membership, the combined fee reaches about 14% — significantly more than the headline 5%.

## Buy Me a Coffee fees vs Ko-fi.

The most common comparison is Buy Me a Coffee vs Ko-fi. Ko-fi's Free plan charges 0% on tips and donations — BMaC charges 5% on everything, including tips. If you primarily rely on small one-time tips, Ko-fi's free plan is financially better. If you have a strong membership following or sell digital products, the difference narrows.

BMaC's 5% is lower than Patreon's Lite plan (5%) and significantly lower than Patreon's standard and Pro tiers (8–12%). For most creators, BMaC and Ko-fi Gold are the lowest-cost options in the creator support space.

## The impact of the fixed $0.30 processing fee on small payments.

On small payments, the $0.30 fixed Stripe fee is proportionally significant. On a $3 coffee: total fees are about $0.57 (5% = $0.15, Stripe = $0.40), leaving you $2.43 — an effective 19% take rate. On a $15 payment, the effective rate drops to about 10.4%. On $100, it's about 8.7%. The fixed fee always hurts small transactions more, which is why creators who primarily receive $3–$5 tips see a higher effective fee than the headline rates suggest.

## How to calculate your Buy Me a Coffee payout.

For a standard US one-time payment, your payout = amount − (amount × 5%) − (amount × 3.4% + $0.30). For a subscription, add 0.5% to the processing rate. For an international payment, add 1%. Use the calculator above for instant results — adjust the toggles and your amount to model any scenario.

## Accuracy and what this calculator covers.

All rates in this calculator are taken from Buy Me a Coffee's official help documentation, verified on 2026-06-13. The 5% platform fee and Stripe processing components (2.9% base + 0.5% payout = 3.4% + $0.30) reflect the published fee structure as of mid-2026. Surcharges for international (+1%) and subscription payments (+0.5%) are also sourced from the official help pages. Payment processing fees outside the US (different Stripe countries) are not modelled — international creators should check their local Stripe rates. Check the sources linked below before making pricing decisions.`,

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
      q: "What percentage does Buy Me a Coffee take?",
      a: "Buy Me a Coffee takes a flat 5% platform fee on every transaction. On top of that, Stripe charges a 3.4% + $0.30 processing fee (2.9% standard + 0.5% payout processing). For a $15 payment, you keep $13.44. There's no monthly fee for creators — the 5% only applies when you earn.",
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
      a: "No — Buy Me a Coffee has no monthly creator subscription fee. You only pay the 5% platform fee when you receive a payment. This makes it genuinely free to set up and maintain until you start earning, which is one reason it's popular for creators just starting to monetise their audience.",
    },
  ],

  related: [
    "ko-fi-fee-calculator",
    "stripe-fee-calculator",
    "paypal-fee-calculator",
    "etsy-fee-calculator",
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

  feesVerifiedOn: "2026-07-22",
  lastUpdated: "2026-06-13",
};
