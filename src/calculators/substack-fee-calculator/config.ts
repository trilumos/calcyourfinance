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
    "Free Substack fee calculator. The '10%' is really ~14–20% once Stripe's 3.6% + $0.30 is added — worst on small monthly subs. See your real payout, and how annual billing saves the repeated $0.30.",
  h1: "Substack Fee Calculator",
  intro:
    "Substack's headline is 10%, but Stripe quietly adds 3.6% + $0.30 on every payment — so a $5/month subscriber really costs you ~20%, and even a $10 one ~17%. Annual billing claws some of it back. Enter your price to see your true take rate, monthly vs annual, across your whole subscriber base.",

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
    "Two fees come out of every paid subscription — and the second one is the one writers forget:\n\n- **Substack platform fee: 10%** — flat, monthly or annual, no tiers, no monthly cost.\n- **Stripe: 3.6% + $0.30** — 2.9% + $0.30 standard, plus a 0.7% recurring-billing fee Substack doesn't spell out.\n\nSo a $10/month subscription loses $1.66, not $1.00 — you keep **$8.34**. The fixed $0.30 is the sting on small, frequent payments: at $5/month your real take rate is ~20%.\n\n**Annual billing is the lever.** The percentages are identical, but a monthly plan pays that $0.30 twelve times a year while an annual plan pays it once. On the same $120/year subscriber, annual billing keeps **$3.30 more** than 12 monthly charges. Toggle annual above, and use the subscriber field to scale it across your list.",

  seoContent: `**The short version:**

- **10% is only Substack's cut.** Stripe adds **3.6% + $0.30** on every payment — 2.9% + $0.30 standard plus a 0.7% recurring-billing fee.
- **Real take: ~14% annual, ~17–20% on small monthly subs.** The fixed $0.30 dominates cheap, frequent payments.
- **Annual billing wins.** Same percentages, but the $0.30 fires once a year instead of 12× — worth $3.30/subscriber on a $120 plan.
- **No monthly fee, no tiers.** You pay only when a reader pays you.

## Why "10%" is really 14–20%.

The 10% you read about is Substack's platform fee. Stripe takes a separate 3.6% + $0.30 to run the card, and that fixed 30 cents is a big slice of a small monthly charge. Here's what you actually keep:

| Subscription | You keep | Effective fee |
|---|---|---|
| $5 / month | $4.02 | ~20% |
| $8 / month | $6.61 | ~17% |
| $10 / month | $8.34 | ~17% |
| $50 / year | $42.90 | ~14% |
| $100 / year | $86.10 | ~14% |

Monthly subscribers priced under $10 are where the gap is widest — plan for ~17–20%, not 10%. The calculator shows the exact figure for your price and subscriber count.

## Monthly vs annual: the hidden $0.30 tax.

The percentages are identical monthly or annual — the difference is purely that fixed 30 cents. A monthly subscriber pays it 12 times a year; an annual subscriber pays it once. On the same $120/year subscriber:

| Same $120/year | Fees | You keep | Effective |
|---|---|---|---|
| Billed monthly ($10 × 12) | $19.92 | $100.08 | ~17% |
| Billed annually ($120) | $16.62 | $103.38 | ~14% |

That's **$3.30 more per subscriber, per year**, for nothing but the billing cadence — and it compounds across your list. It's why most established writers nudge readers toward the annual plan (usually by pricing it at ~10 months' worth).

## The 0.7% fee nobody mentions.

In July 2024 Stripe added a 0.7% recurring-billing fee on every subscription charge — the fee Substack's own pricing page glosses over. Accounts created before then kept the old 0.5% rate until 30 June 2025; everyone is on 0.7% now. Combined with base processing, the full Stripe cost is 3.6% + $0.30, and this calculator includes it by default. If a "Substack takes 10%" claim surprised you at payout time, this is usually why.

## Substack vs Patreon vs Ghost.

| Platform | Platform fee | Processing | Monthly cost |
|---|---|---|---|
| **Substack** | 10% | + 3.6% + $0.30 | None |
| **Patreon Lite** | 5% | + ~2.9% + $0.30 | None |
| **Patreon Pro** | 8% | + processing | None |
| **Ghost** | 0% | + Stripe (paid to you) | $9+/mo hosting |
| **Ko-fi** (memberships) | 5% | + Stripe | None |

Substack is rarely the cheapest — [Patreon](/patreon-fee-calculator) at 5% (Lite) and [Ko-fi memberships](/ko-fi-fee-calculator) at 5% both undercut it. What you pay the extra for is the bundle: newsletter delivery, the Substack app, recommendations, and its discovery network. Ghost flips the model — 0% platform fee, but you pay flat monthly hosting, so it only wins once your revenue is high enough that 10% would exceed the hosting bill.

## How many subscribers to make $1,000/month?

At $10/month you keep $8.34 after fees, so you need about **120 paid subscribers** to net $1,000/month ($1,000 ÷ $8.34 ≈ 120). At $5/month you keep $4.02, so you need about **249**. Pricing higher, or converting readers to annual, lowers the count you need. Use the subscriber field above to model your own mix.

## Is there a monthly fee?

No. Substack has no writer subscription, setup fee, or tier upgrades. Publishing free posts and growing an audience costs nothing; the 10% (plus Stripe) applies only once you turn on paid subscriptions and a reader pays.

## Accuracy and scope.

Rates come from Substack's official support docs and Stripe's Billing pricing, verified on 2026-08-06: the 10% platform fee, Stripe's 2.9% + $0.30 base, and the 0.7% recurring-billing fee. The calculator models USD subscriptions on US cards; international card surcharges and currency conversion aren't included. Sources are linked below.`,

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

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-08-08",
};
