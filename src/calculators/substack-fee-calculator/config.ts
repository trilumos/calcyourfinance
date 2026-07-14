import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { substackFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const substackFeeCalculator: CalculatorConfig = {
  slug: "substack-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "substack",
  title: "Substack Fee Calculator",
  metaDescription:
    "Free Substack fee calculator. See exactly what Substack and Stripe take — 10% platform fee plus 3.6% + $0.30 processing — and calculate your real monthly and annual revenue from paid subscriptions.",
  h1: "Substack Fee Calculator",
  intro:
    "Calculate exactly what Substack takes from your subscription revenue and what you keep. Substack charges a flat 10% platform fee on all paid subscriptions, plus Stripe's processing fee (2.9% + $0.30 + 0.7% recurring billing). Enter your subscription price to see the full fee breakdown.",

  keywords: {
    primary: "substack fee calculator",
    secondary: [
      "substack fees",
      "substack fees calculator",
      "how much does substack take",
      "substack revenue calculator",
      "substack platform fee",
      "substack subscription fees",
      "substack writer fees",
    ],
    longTail: [
      "substack 10% fee",
      "substack stripe fee",
      "substack vs patreon fees",
      "substack vs beehiiv fees",
      "substack earnings calculator",
      "substack payout calculator",
      "how much does substack charge creators",
      "substack fee percentage 2026",
      "substack monthly vs annual fees",
      "substack creator take rate",
      "does substack take a cut",
      "substack recurring billing fee",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "subscriptionPrice",
      label: "Subscription price",
      type: "currency",
      default: 10,
      min: 0,
      help: "Your monthly or annual subscription price. Substack's 10% fee is applied to each payment.",
    },
    {
      id: "isAnnual",
      label: "Annual subscription",
      type: "toggle",
      default: false,
      help: "Annual subscriptions are billed as one lump payment — the $0.30 fixed Stripe fee is charged once instead of 12 times, improving your effective yield.",
    },
    {
      id: "subscribers",
      label: "Number of paid subscribers",
      type: "number",
      default: 100,
      min: 0,
      help: "Scale your results: see total monthly revenue, fees, and payout across your full subscriber base.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const price = Math.max(0, Number(values.subscriptionPrice) || 0);
    const isAnnual = Boolean(values.isAnnual);
    const subscribers = Math.max(0, Math.round(Number(values.subscribers) || 0));

    // Per-payment: same rates whether monthly or annual; the annual benefit is
    // that the $0.30 fixed fee fires once on the full annual price vs monthly.
    const r = computeMarketplaceFee({
      itemPrice: price,
      feeOnShipping: false,
      sellingPercent: substackFees.platformPercent,
      processingPercent: substackFees.processingPercent,
      processingFixed: substackFees.processingFixed,
    });

    const periodLabel = isAnnual ? "annual" : "monthly";
    const perPaymentPayout = r.payout;

    // Annual payout per subscriber = r.payout (already full-year amount)
    // Monthly payout per subscriber = r.payout
    const totalPayout = +(perPaymentPayout * subscribers).toFixed(2);
    const totalFees = +(r.totalFees * subscribers).toFixed(2);
    const totalRevenue = +(r.revenue * subscribers).toFixed(2);

    const hasSubscribers = subscribers > 0;

    return {
      headline: {
        label: `You keep (per ${periodLabel} payment)`,
        display: ctx.formatCurrency(perPaymentPayout),
        sub: `Substack + Stripe takes ${ctx.formatCurrency(r.totalFees)} of your ${ctx.formatCurrency(price)} ${periodLabel} subscription price (${ctx.formatPercent(r.takeRatePercent)} effective rate)`,
      },
      rows: [
        {
          label: `Subscription price (${periodLabel})`,
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `Substack platform fee (${ctx.formatPercent(substackFees.platformPercent)})`,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
        },
        {
          label: `Stripe processing (${ctx.formatPercent(substackFees.processingPercent)} + $${substackFees.processingFixed.toFixed(2)} — includes ${ctx.formatPercent(substackFees.billingPercent)} recurring billing)`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: "Total fees per payment",
          display: ctx.formatCurrency(r.totalFees),
          kind: "deduction",
        },
        {
          label: `You keep per ${periodLabel} payment`,
          display: ctx.formatCurrency(perPaymentPayout),
          kind: "net",
        },
        ...(hasSubscribers
          ? [
              {
                label: `Gross revenue (${ctx.formatNumber(subscribers, 0)} subscribers)`,
                display: ctx.formatCurrency(totalRevenue),
              },
              {
                label: `Total fees (${ctx.formatNumber(subscribers, 0)} subscribers)`,
                display: ctx.formatCurrency(totalFees),
                kind: "deduction" as const,
              },
              {
                label: `Your total ${periodLabel} payout`,
                display: ctx.formatCurrency(totalPayout),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Substack charges a flat 10% of every paid subscription you receive — monthly or annual. This is Substack's only fee; there's no monthly platform cost, setup fee, or additional percentage tier. You only pay the 10% when readers pay you.\n\nOn top of the 10%, Stripe processes the actual card payment and charges a 2.9% + $0.30 transaction fee. Stripe also applies a 0.7% recurring billing fee (added in July 2024) for subscription charges. Combined, the Stripe component is 3.6% + $0.30 per payment. That means the total fee burden on a $10/month subscription is $1.66 — leaving you $8.34.\n\nAnnual subscriptions carry a meaningful fixed-fee advantage. A monthly $10 plan generates 12 payments at $0.30 each, totalling $3.60 in fixed Stripe fees per subscriber per year. An annual $100 plan generates a single $0.30 fixed fee. The annual subscriber who pays $100/yr saves you $3.30 in fixed Stripe fees compared to the equivalent 12 monthly payments.",

  seoContent: `Our Substack fee calculator is a free tool that shows exactly what Substack and Stripe charge on every paid subscription and what you keep. Substack is one of the largest newsletter and subscription content platforms, with hundreds of thousands of paid writers and millions of paying subscribers. Understanding the fee structure is essential for setting your subscription price, comparing Substack against alternatives, and modelling your monthly revenue.

## How Substack's fee structure works.

Substack charges a flat 10% of every paid subscription payment. This applies equally to monthly and annual subscriptions. There's no monthly platform fee for writers — you pay nothing until readers pay you. The 10% is Substack's entire platform take; there are no additional tiers, volume discounts, or plan upgrades that reduce it.

In addition to the 10% Substack fee, Stripe processes the payment and charges its standard credit card processing rate of 2.9% + $0.30 per transaction. Stripe also applies a 0.7% recurring billing fee (introduced in July 2024) for all subscription charges. Combined, the Stripe component is 3.6% + $0.30 per payment.

On a $10/month subscription, total fees are $1.66 (Substack $1.00 + Stripe $0.66), and you keep $8.34. On a $5/month subscription, fees are $0.98 and you keep $4.02.

## The Stripe recurring billing fee: what it is and when it applies.

Stripe introduced a 0.7% Billing fee in July 2024 for all subscription charges processed through Stripe Billing (which Substack uses). This fee applies to every recurring payment — monthly and annual. Creators who set up Substack payments before July 10, 2024 retained the previous 0.5% billing fee rate until June 30, 2025, at which point all accounts moved to 0.7%.

This fee is often overlooked because it's not prominently displayed by Substack in their fee documentation. Combined with the base 2.9% Stripe processing fee, the full Stripe cost is 3.6% + $0.30 per transaction. The calculator above includes this fee by default.

## Monthly vs annual subscriptions: the fixed-fee difference.

One of the most significant (and underappreciated) financial differences between monthly and annual subscriptions is the impact of the $0.30 fixed Stripe fee. For monthly subscribers, that $0.30 fires 12 times per year — $3.60 in fixed fees per subscriber annually. For annual subscribers, it fires once on the full annual payment — a single $0.30. This means an annual subscription at $100/year loses $3.30 less in fixed Stripe fees than the equivalent 12 × $10 monthly payments.

The percentage fees (10% Substack + 3.6% Stripe) are the same either way. But the fixed $0.30 component makes annual subscriptions meaningfully better for writer revenue at the same effective price point. Toggle the annual option in the calculator and compare.

## What Substack charges compared to Patreon and Ghost.

Substack's 10% platform fee is higher than some competitors. Patreon charges 5–12% depending on the plan (Lite 5%, Pro 8%, Premium 12%). Ghost is a self-hosted platform with no platform fee (only hosting costs, starting at $9/month). beehiiv charges a monthly fee ($42–$99/month on paid plans) with no platform percentage.

The trade-off is infrastructure and audience: Substack provides built-in discovery, payment processing, email delivery, and a growing reader ecosystem. For writers who want to reach new readers through Substack's network, the 10% may be worthwhile. For those who already have an audience and want to keep more revenue, alternatives like Ghost or Patreon Pro may be cheaper at scale.

## How to model your Substack revenue.

Use the subscriber count field in the calculator above to scale your results. Enter your subscription price, toggle monthly or annual, and set your subscriber count to see total gross revenue, total fees, and your actual payout across your full subscriber base. For example, 500 subscribers at $10/month = $5,000/month gross; after 10% Substack fee ($500) and Stripe processing (500 × $0.66 = $330), your total monthly payout is $4,170.

## Accuracy and what this calculator covers.

All rates are taken from Substack's official support documentation and verified on 2026-06-13. Substack's 10% platform fee, Stripe's 2.9% + $0.30 base, and the 0.7% Stripe Billing recurring fee are the published components. The calculator models USD subscriptions from US-based card holders. International card surcharges, currency conversion, or potential Stripe Connect account fees are not included. Check the sources below and your Stripe dashboard for a complete picture before making pricing decisions.`,

  workedExample: {
    scenario: "You have a $10/month paid Substack newsletter.",
    steps: [
      { label: "Subscription price", value: "$10.00" },
      { label: "Substack platform fee (10%)", value: "$1.00" },
      { label: "Stripe processing (2.9% + $0.30 + 0.7% billing)", value: "$0.66" },
      { label: "Total fees", value: "$1.66" },
    ],
    result: "You keep $8.34 per monthly subscriber",
  },

  faqs: [
    {
      q: "What percentage does Substack take?",
      a: "Substack takes a flat 10% of all paid subscription revenue. On top of that, Stripe charges 2.9% + $0.30 per transaction plus a 0.7% recurring billing fee (added July 2024). Combined, the total fee burden is about 13.6% + $0.30 per payment. On a $10/month subscription, you keep $8.34.",
    },
    {
      q: "What are Substack fees on a $10/month subscription?",
      a: "On a $10/month subscription: Substack takes $1.00 (10%), Stripe charges $0.66 (3.6% + $0.30 including the recurring billing fee), total fees are $1.66, and you keep $8.34. The effective take rate is 16.6% — higher than the headline 10% because of the processing fees.",
    },
    {
      q: "Does Substack charge fees on annual subscriptions?",
      a: "Yes — Substack charges the same 10% on annual payments as monthly ones. Stripe also charges 3.6% + $0.30 on the full annual payment. The financial advantage of annual subscriptions is that the $0.30 fixed Stripe fee fires once per year rather than 12 times for monthly. On a $100 annual subscription, total fees are $13.90 and you keep $86.10.",
    },
    {
      q: "What is the Stripe recurring billing fee on Substack?",
      a: "Stripe added a 0.7% Billing fee in July 2024 for all recurring/subscription charges. Combined with Stripe's standard 2.9% processing fee, the full Stripe component is 3.6% + $0.30 per transaction. This 0.7% billing fee is often missed in Substack fee discussions but is a real cost that the calculator includes.",
    },
    {
      q: "How does Substack compare to Patreon for fees?",
      a: "Substack charges a flat 10% on all paid subscriptions with no monthly fee. Patreon charges 5% (Lite), 8% (Pro), or 12% (Premium) plus payment processing (about 2.9% + $0.30). For most creators, Patreon Lite at 5% + processing is cheaper than Substack's 10% + processing. The trade-off is that Substack provides email/newsletter infrastructure and discoverability that Patreon doesn't. For content-focused writers, Substack's integrated platform may offset the higher fee.",
    },
    {
      q: "Is there a monthly fee for Substack?",
      a: "No — Substack has no monthly fee for writers. You only pay the 10% platform fee when subscribers pay you. Setting up a Substack, publishing free content, and growing your audience costs nothing. The 10% only kicks in when you enable paid subscriptions and a reader subscribes.",
    },
    {
      q: "How many subscribers do I need to make $1,000/month on Substack?",
      a: "At $10/month per subscriber, you keep $8.34 after fees. To net $1,000/month, you need approximately 120 paid subscribers ($1,000 ÷ $8.34 ≈ 119.9). At $5/month, you keep $4.02 per subscriber and need about 249 subscribers. Use the subscriber count field in the calculator above to model any combination of price and subscriber count.",
    },
  ],

  related: [
    "ko-fi-fee-calculator",
    "buy-me-a-coffee-fee-calculator",
    "stripe-fee-calculator",
    "paypal-fee-calculator",
  ],

  sources: [
    {
      label: "Substack — How much does Substack cost?",
      url: "https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost",
    },
    {
      label: "Substack — Going paid",
      url: "https://substack.com/going-paid",
    },
    {
      label: "Stripe — Billing pricing (recurring billing fee)",
      url: "https://stripe.com/billing/pricing",
    },
  ],

  feesVerifiedOn: "2026-06-13",
  lastUpdated: "2026-06-13",
};
