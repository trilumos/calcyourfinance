import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { podiaFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// Plan id → config entry
const PLAN_MAP = Object.fromEntries(podiaFees.plans.map((p) => [p.id, p]));

export const podiaFeeCalculator: CalculatorConfig = {
  slug: "podia-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "podia",
  title: "Podia Fee Calculator",
  metaDescription:
    "Free Podia fee calculator. See exactly what Podia takes on every sale — 5% transaction fee on the Mover plan, 0% on Shaker and Earthquaker — plus Stripe payment processing, and calculate your real payout.",
  h1: "Podia Fee Calculator",
  intro:
    "Calculate exactly what Podia charges on every course or product sale and what you keep. The Mover plan charges a 5% transaction fee per sale; the Shaker and Earthquaker plans have no transaction fee. All plans also pay Stripe payment processing (2.9% + $0.30 for US cards). Enter your sale price and plan to see your full fee breakdown.",

  keywords: {
    primary: "podia fee calculator",
    secondary: [
      "podia transaction fees",
      "podia pricing",
      "how much does podia take",
      "podia fee percentage",
      "podia course fees",
      "podia seller fees",
      "podia payout calculator",
    ],
    longTail: [
      "podia 5% transaction fee",
      "podia mover plan fees",
      "podia shaker vs mover fees",
      "podia 0% transaction fee plan",
      "podia vs teachable fees",
      "podia vs kajabi fees",
      "podia payment processing fee",
      "how much does podia charge per sale",
      "podia fee calculator 2026",
      "podia creator take rate",
      "podia fee on $100 course",
      "podia earthquaker plan fees",
      "podia shaker plan fees",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "salePrice",
      label: "Sale price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price your customer pays. Podia's transaction fee (on Mover) and Stripe processing are both calculated on this amount.",
    },
    {
      id: "plan",
      label: "Podia plan",
      type: "select",
      default: "mover",
      options: [
        { value: "mover",       label: "Mover ($39/mo) — 5% transaction fee" },
        { value: "shaker",      label: "Shaker ($89/mo) — 0% transaction fee" },
        { value: "earthquaker", label: "Earthquaker ($179/mo) — 0% transaction fee" },
      ],
      help: "Mover charges 5% of each sale. Shaker and Earthquaker have no transaction fee — only Stripe payment processing applies.",
    },
    {
      id: "itemCost",
      label: "Creation cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to produce this course or product — to calculate your real profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const salePrice = Math.max(0, Number(values.salePrice) || 0);
    const planId = String(values.plan || "mover");
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    const plan = PLAN_MAP[planId] ?? PLAN_MAP["mover"];
    const hasCost = itemCost > 0;

    const r = computeMarketplaceFee({
      itemPrice: salePrice,
      feeOnShipping: false,
      sellingPercent: plan.transactionPercent,
      processingPercent: podiaFees.processingPercent,
      processingFixed: podiaFees.processingFixed,
      itemCost,
    });

    const hasTransaction = plan.transactionPercent > 0;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: hasTransaction
          ? `Podia + Stripe takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(salePrice)} sale (${plan.label})`
          : `Stripe processing takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(salePrice)} sale (${plan.label} — no transaction fee)`,
      },
      rows: [
        {
          label: "Sale price",
          display: ctx.formatCurrency(r.revenue),
        },
        ...(hasTransaction
          ? [
              {
                label: `Podia transaction fee (${ctx.formatPercent(plan.transactionPercent)} — ${plan.label})`,
                display: ctx.formatCurrency(r.sellingFee),
                kind: "deduction" as const,
              },
            ]
          : []),
        {
          label: `Stripe processing (${ctx.formatPercent(podiaFees.processingPercent)} + $${podiaFees.processingFixed.toFixed(2)} — US cards)`,
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
                label: "Profit after creation cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Podia charges two types of fees on every sale: a platform transaction fee (on the Mover plan only) and a Stripe payment processing fee (on all plans).\n\nThe transaction fee is Podia's platform cut. On the Mover plan ($39/month), Podia takes 5% of every sale. On the Shaker plan ($89/month) and Earthquaker plan ($179/month), the transaction fee is 0% — Podia does not take any percentage of your revenue at all.\n\nIn addition to the transaction fee, Stripe processes every payment and charges 2.9% + $0.30 for US domestic cards. This applies on all Podia plans and cannot be eliminated — it is the underlying card processing cost.\n\nThe monthly plan cost ($39, $89, $179) is not deducted per sale — it is a fixed monthly expense. This calculator shows per-sale fees only. Whether upgrading from Mover to Shaker is worthwhile depends on your sales volume: each sale on Shaker saves you 5% compared to Mover. On a $100 sale, each upgrade saves $5. The $50 extra monthly cost (Shaker vs Mover) pays off at 10 or more sales per month at $100.",

  seoContent: `Our Podia fee calculator is a free tool that shows exactly what Podia takes on every course or digital product sale, and what you keep. Podia is a popular all-in-one creator platform that supports online courses, digital downloads, coaching, memberships, and email marketing. Unlike some platforms, Podia's fee structure is transparent: you pay a flat transaction fee on the entry-level Mover plan, and nothing on higher plans beyond payment processing.

## How Podia's fee structure works.

Podia's fees on a per-sale basis consist of two components: a platform transaction fee and Stripe payment processing.

**Platform transaction fee:** This is Podia's cut of each sale. The Mover plan ($39/month) charges a 5% transaction fee on every sale. The Shaker plan ($89/month) and Earthquaker plan ($179/month) charge 0% — no transaction fee whatsoever. If you're on Shaker or Earthquaker, Podia takes nothing from your sale revenue.

**Stripe payment processing:** Stripe processes every payment on Podia and charges 2.9% + $0.30 for US domestic card transactions. This fee applies on all plans. International cards may carry a higher processing rate depending on the Stripe Connect account configuration.

On a $100 sale on the Mover plan: the 5% transaction fee is $5.00, Stripe processing is $3.20, total fees are $8.20, and you keep $91.80. On the Shaker plan at $100: no transaction fee, only the $3.20 Stripe processing, and you keep $96.80.

## Mover vs Shaker: when does upgrading pay off?

The Shaker plan costs $50 more per month than Mover ($89 vs $39) but eliminates the 5% transaction fee. Each sale on Shaker saves you 5% of the sale price compared to Mover.

**Break-even calculation:** Monthly savings on sales = 5% × sale price × number of sales. You break even when monthly savings = $50.

- $100 courses: savings per sale = $5.00. Break-even = $50 ÷ $5 = 10 sales per month. Above 10 sales at $100, Shaker is cheaper.
- $49 courses: savings per sale = $2.45. Break-even = $50 ÷ $2.45 ≈ 21 sales per month.
- $197 courses: savings per sale = $9.85. Break-even = $50 ÷ $9.85 ≈ 6 sales per month.
- $297 courses: savings per sale = $14.85. Break-even = $50 ÷ $14.85 ≈ 4 sales per month.

For high-ticket courses ($200+), upgrading to Shaker pays off quickly. For lower-priced digital products, you need higher volume before Shaker becomes economical.

## The monthly plan cost is not a per-sale fee.

The $39, $89, or $179 Podia plan fee is a fixed monthly overhead, not deducted from individual sales. This calculator shows only per-sale fees. Your actual monthly economics are:

**Net revenue = (sale price − per-sale fees) × sales volume − monthly plan cost**

For example: 15 sales at $100 on Mover = ($100 − $8.20) × 15 − $39 = $91.80 × 15 − $39 = $1,377 − $39 = $1,338 net. On Shaker: ($100 − $3.20) × 15 − $89 = $96.80 × 15 − $89 = $1,452 − $89 = $1,363 net. At 15 sales, Shaker earns $25 more per month.

## Podia fees compared to Teachable and Kajabi.

All three platforms use a monthly subscription model with transaction fees on entry-level plans.

**Podia Mover (5% + $39/mo)** has a lower transaction fee than Teachable Starter (7.5% + $39/mo) at the same monthly price — making Podia cheaper per sale on the entry tier. **Podia Shaker (0% + $89/mo)** and **Teachable Builder (0% + $89/mo)** are equivalent on per-sale costs — both eliminate transaction fees at the same price point. **Kajabi Starter ($89/mo, 0% platform fee)** starts with no transaction fee and only Stripe processing on all plans — but at $89/month even on the entry plan, it's more expensive to start than Podia Mover at $39/month.

## Accuracy and what this calculator covers.

All rates are taken from Podia's official pricing page and help documentation, verified on 2026-06-15. The calculator models US-card Stripe processing (2.9% + $0.30). International processing, PayPal, and currency conversion fees are not modelled here. The monthly plan cost is not included in the per-sale calculation. Check the sources below and your Podia dashboard for a complete picture before making plan and pricing decisions.`,

  workedExample: {
    scenario: "You sell a $100 digital product on the Podia Mover plan.",
    steps: [
      { label: "Sale price", value: "$100.00" },
      { label: "Podia transaction fee (5%)", value: "$5.00" },
      { label: "Stripe processing (2.9% + $0.30)", value: "$3.20" },
      { label: "Total fees", value: "$8.20" },
    ],
    result: "You receive $91.80 per sale",
  },

  faqs: [
    {
      q: "How much does Podia take per sale?",
      a: "It depends on your plan. On the Mover plan ($39/month), Podia charges a 5% transaction fee per sale, plus Stripe processing of 2.9% + $0.30. On a $100 sale, total fees are $8.20 and you keep $91.80. On the Shaker plan ($89/month) and Earthquaker plan ($179/month), Podia charges 0% transaction fee — only the 2.9% + $0.30 Stripe processing applies, so you keep $96.80 from a $100 sale.",
    },
    {
      q: "What is Podia's transaction fee?",
      a: "Podia charges a 5% transaction fee on every sale made through the Mover plan. This is Podia's cut, charged on top of Stripe payment processing. The Shaker and Earthquaker plans have a 0% transaction fee — Podia takes nothing from your sale price. Only Stripe processing (2.9% + $0.30) applies on those plans.",
    },
    {
      q: "Does Podia charge Stripe fees on all plans?",
      a: "Yes — Stripe payment processing applies on all Podia plans. The standard rate for US domestic cards is 2.9% + $0.30 per transaction. This is the Stripe card processing fee that Podia passes through; it cannot be eliminated regardless of your plan.",
    },
    {
      q: "Is it worth upgrading from Podia Mover to Shaker?",
      a: "The Shaker plan costs $50 more per month than Mover but eliminates the 5% transaction fee. Each sale on Shaker saves you 5% of the sale price. At $100 per sale, you save $5 per sale and need 10 sales per month to break even. At $197 per sale, you save $9.85 and need just 6 sales. For high-ticket products, upgrading to Shaker pays off quickly. For lower-priced items, you need higher volume.",
    },
    {
      q: "What are Podia fees on a $49 course?",
      a: "On the Mover plan: transaction fee is $2.45 (5%), Stripe processing is $1.72 (2.9% + $0.30), total fees are $4.17, and you keep $44.83. On the Shaker plan: no transaction fee, Stripe processing is $1.72, and you keep $47.28. Use the calculator above to check any price.",
    },
    {
      q: "How does Podia compare to Teachable for fees?",
      a: "On the entry-level plan, Podia Mover charges a 5% transaction fee at $39/month versus Teachable Starter's 7.5% at the same $39/month — Podia is cheaper per sale. Both platforms offer 0% transaction fees on their $89/month plans (Podia Shaker and Teachable Builder), making them equivalent at that tier. Beyond that, both platforms have higher-tier plans with 0% transaction fees at different monthly costs.",
    },
    {
      q: "Does Podia have a free plan?",
      a: "Podia does not currently offer a free plan. The entry-level option is the Mover plan at $39/month (or $33/month billed annually), which includes a 5% transaction fee per sale. There is no free tier as of 2026.",
    },
  ],

  related: [
    "teachable-fee-calculator",
    "kajabi-fee-calculator",
    "gumroad-fee-calculator",
    "stripe-fee-calculator",
    "patreon-fee-calculator",
  ],

  sources: [
    {
      label: "Podia — Pricing page",
      url: "https://podia.com/pricing",
    },
    {
      label: "Podia — Understanding transaction fees",
      url: "https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees",
    },
    {
      label: "Podia — Plans and pricing FAQs",
      url: "https://help.podia.com/en/articles/11370888-podia-plans-pricing-faqs",
    },
    {
      label: "Stripe — US card processing pricing",
      url: "https://stripe.com/us/pricing",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-15",
};
