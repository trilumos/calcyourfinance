import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { teachableFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// Plan id → config entry
const PLAN_MAP = Object.fromEntries(teachableFees.plans.map((p) => [p.id, p]));

export const teachableFeeCalculator: CalculatorConfig = {
  slug: "teachable-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "teachable",
  title: "Teachable Fee Calculator",
  metaDescription:
    "Free Teachable fee calculator. See exactly what Teachable takes on every course sale — 7.5% transaction fee on the Starter plan, 0% on Builder and Growth — plus Stripe payment processing, and calculate your real payout.",
  h1: "Teachable Fee Calculator",
  intro:
    "Calculate exactly what Teachable charges on every course sale and what you keep. The Starter plan charges a 7.5% transaction fee per sale; the Builder and Growth plans have no transaction fee. All plans also pay Stripe payment processing (2.9% + $0.30 for US cards). Enter your course price and plan to see your full fee breakdown.",

  keywords: {
    primary: "teachable fee calculator",
    secondary: [
      "teachable transaction fees",
      "how much does teachable take",
      "teachable pricing fees",
      "teachable fee percentage",
      "teachable course fees",
      "teachable seller fees",
      "teachable payout calculator",
    ],
    longTail: [
      "teachable 7.5% transaction fee",
      "teachable starter plan fees",
      "teachable builder vs starter fees",
      "teachable 0% transaction fee plan",
      "teachable vs kajabi fees",
      "teachable vs podia fees",
      "teachable vs thinkific fees",
      "teachable payment processing fee",
      "how much does teachable charge per sale",
      "teachable fee calculator 2026",
      "teachable creator take rate",
      "teachable fee on $100 course",
      "teachable growth plan fees",
      "teachable custom plan fees",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "coursePrice",
      label: "Course price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price your student pays. Teachable's transaction fee and Stripe processing are both calculated on this amount.",
    },
    {
      id: "plan",
      label: "Teachable plan",
      type: "select",
      default: "starter",
      options: [
        { value: "starter", label: "Starter ($39/mo) — 7.5% transaction fee" },
        { value: "builder", label: "Builder ($89/mo) — 0% transaction fee" },
        { value: "growth",  label: "Growth ($189/mo) — 0% transaction fee" },
        { value: "custom",  label: "Custom (enterprise) — 0% transaction fee" },
      ],
      help: "Starter charges 7.5% of each sale. Builder and higher plans have no transaction fee — only Stripe payment processing applies.",
    },
    {
      id: "itemCost",
      label: "Course creation cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to produce this course — to calculate your real profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const coursePrice = Math.max(0, Number(values.coursePrice) || 0);
    const planId = String(values.plan || "starter");
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    const plan = PLAN_MAP[planId] ?? PLAN_MAP["starter"];
    const hasCost = itemCost > 0;

    const r = computeMarketplaceFee({
      itemPrice: coursePrice,
      feeOnShipping: false,
      sellingPercent: plan.transactionPercent,
      processingPercent: teachableFees.processingPercent,
      processingFixed: teachableFees.processingFixed,
      itemCost,
    });

    const hasTransaction = plan.transactionPercent > 0;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: hasTransaction
          ? `Teachable + Stripe takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(coursePrice)} sale (${plan.label})`
          : `Stripe processing takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(coursePrice)} sale (${plan.label} — no transaction fee)`,
      },
      rows: [
        {
          label: "Course price",
          display: ctx.formatCurrency(r.revenue),
        },
        ...(hasTransaction
          ? [
              {
                label: `Teachable transaction fee (${ctx.formatPercent(plan.transactionPercent)} — ${plan.label})`,
                display: ctx.formatCurrency(r.sellingFee),
                kind: "deduction" as const,
              },
            ]
          : []),
        {
          label: `Stripe processing (${ctx.formatPercent(teachableFees.processingPercent)} + $${teachableFees.processingFixed.toFixed(2)} — US cards)`,
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
                label: "Profit after course creation cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Teachable charges two types of fees on every course sale: a platform transaction fee (on the Starter plan only) and a Stripe payment processing fee (on all plans).\n\nThe transaction fee is Teachable's platform cut. On the Starter plan ($39/month), Teachable takes 7.5% of every sale. On the Builder plan ($89/month), Growth plan ($189/month), and Custom (enterprise) plan, the transaction fee is 0% — Teachable does not take any percentage of your revenue.\n\nIn addition to the transaction fee, Stripe processes every payment and charges 2.9% + $0.30 for US domestic cards. This processing fee applies on all Teachable plans and cannot be eliminated. For international cards, the processing rate is 3.9% + $0.30.\n\nThe monthly plan cost ($39, $89, $189) is not deducted per sale — it is a fixed monthly expense regardless of how many courses you sell. This calculator shows the per-sale fee only. Whether the higher monthly plan cost pays off depends on how many sales you make: each sale on Builder saves you 7.5% compared to Starter, so at $100 per course, you need to sell more than about 16 courses per month for Builder's $89/month to be cheaper than Starter's $39/month plus the 7.5% per sale.",

  seoContent: `Our Teachable fee calculator is a free tool that shows exactly what Teachable charges on every course sale and what you keep. Teachable is one of the most popular online course platforms, with a plan structure that charges a transaction fee on the entry-level Starter plan and no transaction fee on higher plans. Understanding this fee structure is essential for choosing the right plan and setting your course prices.

## How Teachable's fee structure works.

Teachable's fees on a per-sale basis consist of two components: a platform transaction fee and a Stripe payment processing fee.

**Platform transaction fee:** This is Teachable's cut of each sale. The Starter plan ($39/month) charges a 7.5% transaction fee on every course sale. The Builder plan ($89/month), Growth plan ($189/month), and Custom enterprise plan charge 0% — no transaction fee at all. If you are on Builder or higher, Teachable takes nothing from your sale price.

**Stripe payment processing:** Regardless of your plan, Stripe processes the payment and charges 2.9% + $0.30 for US domestic cards. This cannot be avoided — it is the card processing cost that Teachable passes through. International cards are charged 3.9% + $0.30.

On a $100 course sale on the Starter plan: the 7.5% transaction fee is $7.50, Stripe processing is $3.20, total fees are $10.70, and you keep $89.30. On the Builder plan, there is no transaction fee, so you only pay the $3.20 Stripe fee and keep $96.80.

## Which Teachable plan should you choose?

The decision between Starter and Builder is fundamentally a break-even calculation: how many sales per month do you need to justify paying $50 extra per month (the price difference between Builder at $89/month and Starter at $39/month)?

Each sale on Builder saves you 7.5% of the course price compared to Starter. On a $100 course, each sale saves $7.50. To recover the $50 extra monthly cost at $100 per course, you need ⌈$50 ÷ $7.50⌉ = 7 additional sales per month. Above 7 sales per month at $100, Builder is cheaper overall.

For lower-priced courses ($29), each sale saves $2.17. You need ⌈$50 ÷ $2.17⌉ = 24 sales per month before Builder pays off. For higher-priced courses ($297), you only need 3 sales per month to justify Builder.

## The monthly plan cost is not a per-sale fee.

The $39, $89, or $189 monthly plan cost is a fixed overhead, not deducted from your sales. This calculator shows only the per-sale fee breakdown. Your actual monthly economics are:

**Net revenue = (course price − per-sale fees) × sales volume − monthly plan cost**

For example: 20 sales at $100 on the Starter plan = ($100 − $10.70) × 20 − $39 = $89.30 × 20 − $39 = $1,786 − $39 = $1,747 net. On Builder: ($100 − $3.20) × 20 − $89 = $96.80 × 20 − $89 = $1,936 − $89 = $1,847 net. Builder earns $100 more per month at 20 sales.

## Teachable fees compared to Kajabi and Podia.

All three platforms use a plan-based model where higher monthly plans eliminate per-sale transaction fees.

**Teachable Starter (7.5% + $39/mo)** is the entry-level option with the lowest monthly cost but highest per-sale fee. **Podia Mover (5% + $39/mo)** offers a lower transaction fee at the same monthly price — making Podia slightly cheaper per sale on the entry tier. **Kajabi Starter ($89/mo, 0% platform fee + ~2.9% + $0.30 Stripe processing)** eliminates transaction fees entirely but at a higher monthly cost.

For high-volume course sellers, Kajabi's 0% transaction fee across all plans (even the entry Starter plan) is compelling if you can justify the $89/month. For sellers at lower volume, Teachable's $39 Starter plan is accessible, though the 7.5% per-sale fee adds up quickly.

## Accuracy and what this calculator covers.

All rates are taken from Teachable's official pricing page and verified on 2026-06-15. The calculator models US-card Stripe processing (2.9% + $0.30). International card processing (3.9% + $0.30), PayPal, and currency conversion fees are not modelled here. The monthly plan cost is not included in the per-sale calculation. Check the sources below and your Teachable dashboard for a complete picture before making plan and pricing decisions.`,

  workedExample: {
    scenario: "You sell a $100 course on the Teachable Starter plan.",
    steps: [
      { label: "Course price", value: "$100.00" },
      { label: "Teachable transaction fee (7.5%)", value: "$7.50" },
      { label: "Stripe processing (2.9% + $0.30)", value: "$3.20" },
      { label: "Total fees", value: "$10.70" },
    ],
    result: "You receive $89.30 per sale",
  },

  faqs: [
    {
      q: "How much does Teachable take per sale?",
      a: "It depends on your plan. On the Starter plan ($39/month), Teachable charges a 7.5% transaction fee per sale, plus Stripe payment processing of 2.9% + $0.30. On a $100 course, total fees are $10.70 and you keep $89.30. On the Builder plan ($89/month) and higher, Teachable takes 0% — you only pay the 2.9% + $0.30 Stripe processing fee.",
    },
    {
      q: "What is Teachable's transaction fee?",
      a: "Teachable charges a 7.5% transaction fee on every sale made through the Starter plan. This is Teachable's platform cut, separate from payment processing. The Builder, Growth, and Custom plans have a 0% transaction fee — Teachable takes nothing from your sale price on those plans.",
    },
    {
      q: "Does Teachable charge Stripe fees on all plans?",
      a: "Yes — Stripe payment processing applies on all Teachable plans, regardless of which plan you're on. The standard rate for US domestic cards is 2.9% + $0.30 per transaction. For international cards, the rate is 3.9% + $0.30. This processing fee is charged by Stripe (not Teachable) and cannot be avoided.",
    },
    {
      q: "Is it worth upgrading from Teachable Starter to Builder?",
      a: "It depends on your sales volume and course price. The Builder plan costs $50 more per month than Starter but saves you 7.5% on each sale. On a $100 course, Builder saves $7.50 per sale. You need to sell at least 7 courses per month at $100 for Builder to be cheaper overall. At higher course prices, the break-even point is lower — at $297, you only need 3 sales to justify Builder.",
    },
    {
      q: "What are Teachable fees on a $97 course?",
      a: "On the Starter plan: transaction fee is $7.28 (7.5% of $97), Stripe processing is $3.11 (2.9% + $0.30), total fees are $10.39, and you keep $86.61. On the Builder plan: no transaction fee, only the $3.11 Stripe processing fee, and you keep $93.89. Use the calculator above to check any price.",
    },
    {
      q: "How does Teachable compare to Podia for fees?",
      a: "On the entry-level plan, Podia Mover charges a 5% transaction fee at $39/month versus Teachable Starter's 7.5% at $39/month. Podia is cheaper per sale at the base tier. Both platforms offer 0% transaction fees on their mid-tier plans (Podia Shaker at $89/month; Teachable Builder at $89/month). Above that, fees are nearly identical — only Stripe processing applies.",
    },
    {
      q: "Does Teachable have a free plan?",
      a: "Teachable does not currently offer a free plan. The entry-level option is the Starter plan at $39/month (or $29/month billed annually), which includes a 7.5% transaction fee per sale. There is no free tier as of 2026.",
    },
  ],

  related: [
    "podia-fee-calculator",
    "kajabi-fee-calculator",
    "gumroad-fee-calculator",
    "stripe-fee-calculator",
    "patreon-fee-calculator",
  ],

  sources: [
    {
      label: "Teachable — Pricing page",
      url: "https://teachable.com/pricing",
    },
    {
      label: "Teachable — Transaction fees explained",
      url: "https://support.teachable.com/hc/en-us/articles/4407133671963-Teachable-Transaction-Fees",
    },
    {
      label: "Stripe — US card processing pricing",
      url: "https://stripe.com/us/pricing",
    },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
