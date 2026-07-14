import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { kajabiFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// Plan id → config entry
const PLAN_MAP = Object.fromEntries(kajabiFees.plans.map((p) => [p.id, p]));

export const kajabiFeeCalculator: CalculatorConfig = {
  slug: "kajabi-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "kajabi",
  title: "Kajabi Fee Calculator",
  metaDescription:
    "Free Kajabi fee calculator. Kajabi charges 0% transaction fees on all plans — you only pay Kajabi Payments processing (2.7–2.9% + $0.30 depending on plan). Calculate your real payout and monthly break-even.",
  h1: "Kajabi Fee Calculator",
  intro:
    "Calculate exactly what Kajabi takes from every sale. Kajabi charges zero platform transaction fees on all plans — unlike Teachable or Podia, Kajabi never takes a percentage cut of your revenue. You only pay Kajabi Payments processing: 2.9% + $0.30 on Starter and Basic, 2.8% + $0.30 on Growth, or 2.7% + $0.30 on Pro (US cards). Enter your sale price and plan to see your payout.",

  keywords: {
    primary: "kajabi fee calculator",
    secondary: [
      "kajabi transaction fees",
      "does kajabi charge transaction fees",
      "kajabi pricing calculator",
      "kajabi cost",
      "kajabi fee percentage",
      "kajabi payout calculator",
      "how much does kajabi take",
    ],
    longTail: [
      "kajabi 0% transaction fees",
      "kajabi no transaction fee",
      "kajabi payments fee",
      "kajabi starter plan fees",
      "kajabi growth plan fees",
      "kajabi pro plan fees",
      "kajabi vs teachable fees",
      "kajabi vs podia fees",
      "kajabi break even calculator",
      "how many sales to justify kajabi",
      "kajabi monthly plan cost calculator",
      "kajabi fee calculator 2026",
      "kajabi payments vs stripe fees",
      "kajabi processing fee",
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
      help: "The price your customer pays. Kajabi charges 0% platform fee — only Kajabi Payments processing is deducted.",
    },
    {
      id: "plan",
      label: "Kajabi plan",
      type: "select",
      default: "starter",
      options: [
        { value: "starter", label: "Starter ($89/mo) — 2.9% + $0.30" },
        { value: "basic",   label: "Basic ($179/mo) — 2.9% + $0.30" },
        { value: "growth",  label: "Growth ($249/mo) — 2.8% + $0.30" },
        { value: "pro",     label: "Pro ($499/mo) — 2.7% + $0.30" },
      ],
      help: "All Kajabi plans charge 0% platform transaction fees. Processing rates improve on higher plans: Growth saves 0.1%, Pro saves 0.2% vs Starter.",
    },
    {
      id: "monthlySales",
      label: "Monthly sales volume (optional)",
      type: "number",
      default: 0,
      min: 0,
      help: "Enter your expected monthly sales count to see your total monthly payout and how many sales you need to cover the plan cost.",
    },
    {
      id: "itemCost",
      label: "Creation cost per sale (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to produce this course or product — to calculate your real profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const salePrice   = Math.max(0, Number(values.salePrice)    || 0);
    const planId      = String(values.plan || "starter");
    const monthlySales = Math.max(0, Math.round(Number(values.monthlySales) || 0));
    const itemCost    = Math.max(0, Number(values.itemCost)    || 0);

    const plan = PLAN_MAP[planId] ?? PLAN_MAP["starter"];
    const hasCost = itemCost > 0;
    const hasSales = monthlySales > 0 && salePrice > 0;

    const r = computeMarketplaceFee({
      itemPrice: salePrice,
      feeOnShipping: false,
      sellingPercent: 0,                        // always 0 on all Kajabi plans
      processingPercent: plan.processingPercent,
      processingFixed: plan.processingFixed,
      itemCost,
    });

    const totalMonthlyRevenue = +(r.revenue   * monthlySales).toFixed(2);
    const totalMonthlyFees    = +(r.totalFees * monthlySales).toFixed(2);
    const totalMonthlyPayout  = +(r.payout    * monthlySales).toFixed(2);
    // Net after plan cost
    const netAfterPlan        = +(totalMonthlyPayout - plan.monthlyCostUSD).toFixed(2);
    // Break-even: how many sales to cover the monthly plan cost
    const breakEvenSales      = r.payout > 0
      ? Math.ceil(plan.monthlyCostUSD / r.payout)
      : null;

    return {
      headline: {
        label: hasCost ? "Profit per sale" : "You receive per sale",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Kajabi charges 0% transaction fee — only ${ctx.formatPercent(plan.processingPercent)} + $${plan.processingFixed.toFixed(2)} Kajabi Payments processing on your ${ctx.formatCurrency(salePrice)} sale (${plan.label})`,
      },
      rows: [
        {
          label: "Sale price",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: "Kajabi transaction fee",
          display: "$0.00 (0% on all plans)",
          kind: "deduction",
        },
        {
          label: `Kajabi Payments processing (${ctx.formatPercent(plan.processingPercent)} + $${plan.processingFixed.toFixed(2)} — US cards)`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: "Total per-sale fees",
          display: ctx.formatCurrency(r.totalFees),
          kind: "deduction",
        },
        {
          label: "You receive per sale",
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
        ...(hasSales
          ? [
              {
                label: `Gross revenue (${ctx.formatNumber(monthlySales, 0)} sales/mo)`,
                display: ctx.formatCurrency(totalMonthlyRevenue),
              },
              {
                label: `Total processing fees (${ctx.formatNumber(monthlySales, 0)} sales/mo)`,
                display: ctx.formatCurrency(totalMonthlyFees),
                kind: "deduction" as const,
              },
              {
                label: "Monthly payout before plan cost",
                display: ctx.formatCurrency(totalMonthlyPayout),
                kind: "net" as const,
              },
              {
                label: `Kajabi plan cost (${plan.label})`,
                display: `−$${plan.monthlyCostUSD.toFixed(2)}/mo`,
                kind: "deduction" as const,
              },
              {
                label: "Net monthly income after plan cost",
                display: ctx.formatCurrency(netAfterPlan),
                kind: netAfterPlan >= 0 ? ("net" as const) : ("deduction" as const),
              },
              ...(breakEvenSales !== null
                ? [
                    {
                      label: "Break-even sales needed to cover plan cost",
                      display: `${breakEvenSales} sales/mo`,
                    },
                  ]
                : []),
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Kajabi charges zero platform transaction fees on every plan — you never pay a percentage of your revenue to Kajabi as a platform cut. This is fundamentally different from Teachable (7.5% on Starter) or Podia (5% on Mover), which both take a piece of each sale on their entry plans.\n\nThe only per-sale fee on Kajabi is the Kajabi Payments processing fee, which covers the cost of the underlying Stripe card transaction. The rate depends on your plan: Starter and Basic pay 2.9% + $0.30 (the standard Stripe rate), Growth pays 2.8% + $0.30, and Pro pays 2.7% + $0.30. On a $100 course sale, the processing fee is $3.20 on Starter/Basic, $3.10 on Growth, or $3.00 on Pro.\n\nImportant: if you use a third-party processor (Stripe or PayPal directly, instead of Kajabi Payments), Kajabi adds a platform surcharge: 5% on Starter, 2% on Basic, 1% on Growth, and 0.5% on Pro. This surcharge does not apply if you use Kajabi Payments or PayPal. The calculator models the Kajabi Payments path.\n\nThe real cost of Kajabi is the monthly plan fee: $89 on Starter, $179 on Basic, $249 on Growth, and $499 on Pro. Unlike Teachable or Podia where a low monthly plan trades off against a high per-sale fee, Kajabi's monthly cost is the primary variable. The per-sale fee is competitive with (and often lower than) what you'd pay on other platforms once their transaction fees are included.\n\nThe break-even calculation shows how many sales per month you need to cover the monthly plan cost from your net payout.",

  seoContent: `Our Kajabi fee calculator is a free tool that shows exactly what Kajabi takes from every sale and what you keep — including your real monthly income and break-even sales target. Kajabi is one of the most comprehensive online course and creator platforms available, offering courses, coaching, podcasts, communities, email marketing, and websites under one roof. Its fee structure is often misunderstood: Kajabi is known for "no transaction fees," but understanding what that means in practice is important before committing to the platform.

## Does Kajabi charge transaction fees?

No — Kajabi charges 0% platform transaction fees on all plans. Unlike Teachable (7.5% on Starter) or Podia (5% on Mover), Kajabi never takes a percentage cut of your course or product revenue. This is true on the entry-level Starter plan at $89/month and on every higher plan.

The 0% transaction fee means Kajabi's only per-sale charge is the payment processing fee via Kajabi Payments, which is 2.9% + $0.30 for US domestic cards on the Starter and Basic plans.

## What does Kajabi actually charge per sale?

While Kajabi charges no platform transaction fee, you do pay a Kajabi Payments processing fee on every sale. This fee covers the cost of the Stripe card transaction:

- **Starter ($89/mo):** 2.9% + $0.30 per US card transaction
- **Basic ($179/mo):** 2.9% + $0.30 per US card transaction
- **Growth ($249/mo):** 2.8% + $0.30 per US card transaction
- **Pro ($499/mo):** 2.7% + $0.30 per US card transaction

On a $100 course sale: Starter/Basic processing = $3.20, Growth = $3.10, Pro = $3.00. On a $297 course: Starter processing = $8.91, Growth = $8.62, Pro = $8.32.

## The third-party processor surcharge: what to know.

Kajabi adds a surcharge if you choose to use Stripe or a third-party payment provider instead of Kajabi Payments. This surcharge is:

- Starter: 5% per sale
- Basic: 2% per sale
- Growth: 1% per sale
- Pro: 0.5% per sale

PayPal is exempt from this surcharge. If you process through Kajabi Payments (the default), there is no surcharge — only the standard processing fee listed above. This calculator models the Kajabi Payments path (no surcharge).

## Kajabi's real cost: the monthly plan fee.

Because Kajabi has no per-sale transaction fee, the primary cost driver is the monthly plan subscription:

- Starter: $89/month ($71/month billed annually)
- Basic: $179/month ($143/month billed annually)
- Growth: $249/month ($199/month billed annually)
- Pro: $499/month ($399/month billed annually)

These are significantly higher than comparable entry plans at Teachable ($39/month) or Podia ($39/month). The trade-off is that Kajabi never takes a cut of your revenue above the processing fee. At higher sales volumes, this can make Kajabi cheaper overall.

## Break-even: how many sales does Kajabi need to pay for itself?

The break-even is how many course sales per month you need to generate enough payout to cover the Kajabi plan cost. For example, on the Starter plan at $89/month, selling $100 courses at $3.20 processing fee each gives you $96.80 per sale. Break-even = ⌈$89 ÷ $96.80⌉ = 1 sale per month to cover the plan cost. This sounds low, but it means you need to be consistently selling to justify the subscription.

At $49 courses on Starter: payout per sale = $47.88. Break-even = ⌈$89 ÷ $47.88⌉ = 2 sales per month.
At $19 courses on Starter: payout per sale = $18.25. Break-even = ⌈$89 ÷ $18.25⌉ = 5 sales per month.

Use the monthly sales volume field in the calculator above to model your specific situation.

## Kajabi compared to Teachable and Podia.

| Platform | Entry Plan | Monthly Cost | Transaction Fee | Processing |
|---|---|---|---|---|
| Kajabi Starter | Starter | $89/mo | 0% | 2.9% + $0.30 |
| Teachable Starter | Starter | $39/mo | 7.5% | 2.9% + $0.30 |
| Podia Mover | Mover | $39/mo | 5% | 2.9% + $0.30 |

On a $100 course:
- Kajabi Starter: $3.20 per sale (0% transaction + $3.20 processing). You keep $96.80. But you pay $89/month regardless.
- Teachable Starter: $10.70 per sale (7.5% + $3.20 processing). You keep $89.30. You pay $39/month.
- Podia Mover: $8.20 per sale (5% + $3.20 processing). You keep $91.80. You pay $39/month.

At 10 sales per month at $100: Kajabi net = $96.80 × 10 − $89 = $879. Teachable net = $89.30 × 10 − $39 = $854. Podia net = $91.80 × 10 − $39 = $879. Kajabi and Podia (Shaker) are equivalent at this volume. Teachable trails.

At 20 sales per month at $100: Kajabi net = $96.80 × 20 − $89 = $1,847. Teachable net = $89.30 × 20 − $39 = $1,747. Podia Shaker ($89/mo, 0% fee) net = $96.80 × 20 − $89 = $1,847 — identical to Kajabi Starter at this level.

Kajabi is more expensive for low-volume sellers but becomes competitive above ~10 sales/month compared to Teachable Starter, and roughly equivalent to Podia Shaker (which costs the same $89/month) on per-sale economics.

## What features justify Kajabi's higher monthly cost?

Kajabi bundles features that other platforms charge for separately: email marketing (Kajabi Email), communities, podcasts, website/landing page builder, and analytics — all in one subscription with no additional tools required. Teachable and Podia focus primarily on courses and digital products, requiring third-party tools for email marketing, community, and websites.

For creators who would otherwise pay $50–$100/month separately for email marketing tools (e.g. ConvertKit, Mailchimp) plus a community platform, Kajabi's all-in-one nature can reduce total costs even at its higher price point.

## Accuracy and what this calculator covers.

All rates are taken from Kajabi's official pricing page and Kajabi Payments fee documentation, verified on 2026-06-15. The January 13, 2026 pricing update (new plan names and prices) is reflected. The calculator models US domestic card processing via Kajabi Payments. International cards (+1.5%), subscriptions/payment plans (+0.7%), ACH Direct Debit (0.8%, max $5), and dispute fees ($15) are not modelled in the per-sale calculation. The third-party processor surcharge is noted but not applied (Kajabi Payments path assumed). Check the sources below and your Kajabi dashboard for a complete picture.`,

  workedExample: {
    scenario: "You sell a $100 course on Kajabi's Starter plan.",
    steps: [
      { label: "Course price", value: "$100.00" },
      { label: "Kajabi transaction fee (0% — all plans)", value: "$0.00" },
      { label: "Kajabi Payments processing (2.9% + $0.30)", value: "$3.20" },
      { label: "Total per-sale fees", value: "$3.20" },
    ],
    result: "You receive $96.80 per sale (before monthly plan cost)",
  },

  faqs: [
    {
      q: "Does Kajabi charge transaction fees?",
      a: "No — Kajabi charges 0% platform transaction fees on all plans (Starter, Basic, Growth, and Pro). You never pay a percentage of your sale price to Kajabi as a platform cut. The only per-sale charge is Kajabi Payments processing: 2.9% + $0.30 on Starter and Basic, 2.8% + $0.30 on Growth, 2.7% + $0.30 on Pro (US domestic cards).",
    },
    {
      q: "How much does Kajabi take per sale?",
      a: "Kajabi takes 0% as a platform fee. The only deduction is Kajabi Payments processing. On a $100 course: Starter and Basic keep $96.80 (after $3.20 processing); Growth keeps $96.90 (after $3.10); Pro keeps $97.00 (after $3.00). The larger cost is the monthly plan: $89 on Starter, $179 on Basic, $249 on Growth, $499 on Pro.",
    },
    {
      q: "What is the Kajabi Payments processing fee?",
      a: "Kajabi Payments (built on Stripe) charges 2.9% + $0.30 per US domestic card transaction on the Starter and Basic plans, 2.8% + $0.30 on Growth, and 2.7% + $0.30 on Pro. International cards add +1.5%. Subscription/payment-plan sales add +0.7%. These are the only per-sale fees.",
    },
    {
      q: "What happens if I use Stripe or PayPal instead of Kajabi Payments?",
      a: "If you choose to use a third-party payment processor (e.g. Stripe directly) instead of Kajabi Payments, Kajabi adds a platform surcharge: 5% on Starter, 2% on Basic, 1% on Growth, 0.5% on Pro. PayPal is exempt from this surcharge. Using Kajabi Payments avoids the surcharge entirely.",
    },
    {
      q: "How many sales do I need to justify Kajabi's monthly cost?",
      a: "At $100 per course on Kajabi Starter ($89/month): you keep $96.80 per sale (after processing). Break-even = ⌈$89 ÷ $96.80⌉ = 1 sale per month to cover the plan. But profitability requires more: 5 sales/month at $100 nets $484 − $89 = $395. Use the 'monthly sales volume' field in the calculator above to model your specific situation.",
    },
    {
      q: "Is Kajabi cheaper than Teachable?",
      a: "It depends on your sales volume. At $100 courses and 10 sales/month: Kajabi Starter nets $879 ($96.80 × 10 − $89) vs Teachable Starter nets $854 ($89.30 × 10 − $39). Kajabi is slightly ahead. At 5 sales/month at $100: Kajabi nets $395 vs Teachable nets $407.50. Teachable is cheaper at very low volumes. The crossover typically happens around 8–10 sales per month at $100, depending on the course price.",
    },
    {
      q: "How does Kajabi compare to Podia for fees?",
      a: "Kajabi Starter ($89/mo, 0% transaction, 2.9% + $0.30 processing) and Podia Shaker ($89/mo, 0% transaction, 2.9% + $0.30 processing) have identical per-sale economics. The difference is platform features: Kajabi includes email marketing, community, podcast hosting, and website builder; Podia focuses on courses and memberships. At the entry level, Kajabi ($89) costs more than Podia Mover ($39) but has no per-sale transaction fee.",
    },
  ],

  related: [
    "teachable-fee-calculator",
    "podia-fee-calculator",
    "gumroad-fee-calculator",
    "stripe-fee-calculator",
    "patreon-fee-calculator",
  ],

  sources: [
    {
      label: "Kajabi — Pricing page",
      url: "https://kajabi.com/pricing",
    },
    {
      label: "Kajabi — Kajabi Payments fees (United States)",
      url: "https://help.kajabi.com/hc/en-us/articles/23370972909851-Kajabi-Payments-Fees-United-States",
    },
    {
      label: "Kajabi — 2025 pricing updates (effective January 13, 2026)",
      url: "https://www.kajabi.com/updates/2025-pricing-updates",
    },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
