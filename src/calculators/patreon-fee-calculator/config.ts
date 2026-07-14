import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { patreonFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// Plan id → platform fee %
const PLAN_PERCENT: Record<string, number> = {
  new:     patreonFees.newPlanPercent,     // 10%
  lite:    patreonFees.litePlanPercent,    // 5%
  pro:     patreonFees.proPlanPercent,     // 8%
  premium: patreonFees.premiumPlanPercent, // 12%
};

const PLAN_LABELS: Record<string, string> = {
  new:     "New plan (flat 10%)",
  lite:    "Legacy Lite (5%)",
  pro:     "Legacy Pro (8%)",
  premium: "Legacy Premium (12%)",
};

export const patreonFeeCalculator: CalculatorConfig = {
  slug: "patreon-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "patreon",
  title: "Patreon Fee Calculator",
  metaDescription:
    "Free Patreon fee calculator. See exactly what Patreon takes — new flat 10% plan or legacy Lite/Pro/Premium 5–12% — plus payment processing, and calculate your real monthly creator payout.",
  h1: "Patreon Fee Calculator",
  intro:
    "Calculate exactly what Patreon charges on every patron pledge and what you keep. New creators (after August 4, 2025) pay a flat 10% platform fee. Legacy creators stay on Lite (5%), Pro (8%), or Premium (12%). All plans also pay payment processing: 2.9% + $0.30 per pledge above $3, or 5% + $0.10 for pledges of $3 or less.",

  keywords: {
    primary: "patreon fee calculator",
    secondary: [
      "patreon fees",
      "how much does patreon take",
      "patreon cut calculator",
      "patreon earnings calculator",
      "patreon fee calculator",
      "patreon creator fees",
      "patreon platform fee",
    ],
    longTail: [
      "patreon 10% fee calculator",
      "patreon lite pro premium fee comparison",
      "patreon payment processing fee",
      "patreon micropayment fee",
      "patreon vs substack fees",
      "patreon vs ko-fi fees",
      "patreon payout calculator",
      "how much does patreon take from creators",
      "patreon fee calculator for uk",
      "patreon fee calculator for india",
      "patreon fee calculator for canada",
      "patreon fee calculator for australia",
      "patreon new plan fee 2025 2026",
      "patreon legacy plan fees",
      "patreon creator take rate",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "pledgeAmount",
      label: "Pledge amount (per patron)",
      type: "currency",
      default: 5,
      min: 0,
      help: "The monthly pledge price your patron pays. Patreon's platform fee and processing are both calculated on this amount.",
    },
    {
      id: "plan",
      label: "Creator plan",
      type: "select",
      default: "new",
      options: [
        { value: "new",     label: "New plan (flat 10%) — after Aug 4, 2025" },
        { value: "lite",    label: "Legacy Lite (5%)" },
        { value: "pro",     label: "Legacy Pro (8%)" },
        { value: "premium", label: "Legacy Premium (12%)" },
      ],
      help: "New creators after August 4, 2025 are on the flat 10% plan. Creators before that date keep their legacy plan rate.",
    },
    {
      id: "micropayment",
      label: "Micropayment rate (pledge ≤ $3)",
      type: "toggle",
      default: false,
      help: "Enable for pledges of $3 or less. Patreon uses a higher-percentage but lower-fixed fee (5% + $0.10) instead of the standard 2.9% + $0.30.",
    },
    {
      id: "patronCount",
      label: "Number of patrons",
      type: "number",
      default: 50,
      min: 0,
      help: "Scale your results to see total monthly revenue, fees, and payout across your whole patron base.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const pledge       = Math.max(0, Number(values.pledgeAmount)  || 0);
    const planId       = String(values.plan || "new");
    const isMicro      = Boolean(values.micropayment);
    const patronCount  = Math.max(0, Math.round(Number(values.patronCount) || 0));

    const platformPercent = PLAN_PERCENT[planId] ?? patreonFees.newPlanPercent;
    const planLabel       = PLAN_LABELS[planId]  ?? "New plan (flat 10%)";

    const processingPercent = isMicro
      ? patreonFees.microProcessingPercent
      : patreonFees.standardProcessingPercent;
    const processingFixed = isMicro
      ? patreonFees.microProcessingFixed
      : patreonFees.standardProcessingFixed;

    const processingLabel = isMicro
      ? `${ctx.formatPercent(patreonFees.microProcessingPercent)} + $${patreonFees.microProcessingFixed.toFixed(2)} (micropayment ≤ $${patreonFees.microThreshold})`
      : `${ctx.formatPercent(patreonFees.standardProcessingPercent)} + $${patreonFees.standardProcessingFixed.toFixed(2)} (standard)`;

    const r = computeMarketplaceFee({
      itemPrice: pledge,
      feeOnShipping: false,
      sellingPercent: platformPercent,
      processingPercent,
      processingFixed,
    });

    const hasPatrons = patronCount > 0;
    const totalPayout  = +(r.payout    * patronCount).toFixed(2);
    const totalFees    = +(r.totalFees * patronCount).toFixed(2);
    const totalRevenue = +(r.revenue   * patronCount).toFixed(2);

    return {
      headline: {
        label: "You keep (per patron, per month)",
        display: ctx.formatCurrency(r.payout),
        sub: `Patreon takes ${ctx.formatCurrency(r.totalFees)} of your ${ctx.formatCurrency(pledge)} pledge (${ctx.formatPercent(r.takeRatePercent)} effective rate) — ${planLabel}`,
      },
      rows: [
        {
          label: "Pledge amount",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `Patreon platform fee (${ctx.formatPercent(platformPercent)} — ${planLabel})`,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
        },
        {
          label: `Payment processing (${processingLabel})`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: "Total fees per pledge",
          display: ctx.formatCurrency(r.totalFees),
          kind: "deduction",
        },
        {
          label: "You keep per patron",
          display: ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasPatrons
          ? [
              {
                label: `Gross revenue (${ctx.formatNumber(patronCount, 0)} patrons)`,
                display: ctx.formatCurrency(totalRevenue),
              },
              {
                label: `Total fees (${ctx.formatNumber(patronCount, 0)} patrons)`,
                display: ctx.formatCurrency(totalFees),
                kind: "deduction" as const,
              },
              {
                label: "Your total monthly payout",
                display: ctx.formatCurrency(totalPayout),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Patreon charges two separate fees on every patron pledge: a platform fee and a payment processing fee.\n\nThe platform fee goes to Patreon. New creators (those who started after August 4, 2025) pay a flat 10% on every pledge. Legacy creators who were on the platform before that date keep their old plan rate — Lite at 5%, Pro at 8%, or Premium at 12%. These legacy plan rates are locked in as long as the creator page stays published.\n\nThe payment processing fee covers the cost of the card transaction. For pledges above $3, Patreon uses a standard rate of 2.9% + $0.30 per transaction — similar to Stripe's published rate. For pledges of $3 or less, Patreon applies a micropayment rate of 5% + $0.10. The micropayment rate has a higher percentage but a much smaller fixed fee, which makes it more economical for tiny pledges. A $1 pledge would cost $0.33 under the standard rate (making it nearly worthless after fees), but only $0.15 under the micropayment rate.\n\nBoth fees apply to the patron's pledge amount. There are no separate listing fees, monthly subscription fees for the creator account, or payout fees for standard bank/Stripe payouts to US creators.",

  seoContent: `Our Patreon fee calculator is a free tool that shows exactly what Patreon and its payment processor take from every patron pledge, and what you keep. Whether you are a new creator on Patreon's flat 10% plan or an existing creator holding a legacy Lite, Pro, or Premium plan, this calculator gives you an accurate per-patron and total-monthly fee breakdown.

## How Patreon's fee structure works.

Patreon charges creators two distinct fees on every pledge received: a platform fee and a payment processing fee. These are separate charges that together determine your actual payout.

The platform fee is Patreon's revenue. It is charged as a percentage of the patron's pledge. The processing fee covers the cost of the underlying card or payment transaction.

## The new flat 10% plan (after August 4, 2025).

On August 4, 2025, Patreon introduced a consolidated flat platform fee for new creators: a single 10% rate that applies to all pledges, regardless of tier price or membership level. This replaces the previous tiered plan system (Lite/Pro/Premium) for anyone who creates a new Patreon page after that date.

The move simplified Patreon's pricing at the cost of making the entry-level plan more expensive for new creators. Previously, a new creator could choose the Lite plan at 5% — now that option is no longer available for new signups.

## Legacy plans: Lite (5%), Pro (8%), Premium (12%).

Creators who had an active Patreon page before August 4, 2025 are grandfathered into their existing legacy plan rates, as long as they keep their page published:

- **Lite plan (5%)**: The lowest-cost legacy option. Creators on Lite pay 5% of every pledge in platform fees. This plan offered fewer features than Pro (no monthly patron relationship tools, no merchandising integration), but carried the cheapest fee structure. New creators can no longer sign up for Lite.
- **Pro plan (8%)**: The mid-tier legacy plan, which included the full suite of Patreon creator tools — post scheduling, patron relationship manager, and integrations. The 8% rate is the most common legacy rate for established creators.
- **Premium plan (12%)**: The top-tier legacy plan, which included a dedicated partner manager, co-marketing opportunities, and merchandise support. The 12% rate is the highest platform fee of any Patreon plan. Most Premium creators switched to Pro or accepted the Premium rate in exchange for the platform support.

Legacy plan rates are preserved as long as the creator's page remains published. Patreon has confirmed that existing creators will not be forced onto the new 10% plan.

## Payment processing fees: standard vs micropayment.

On top of the platform fee, Patreon charges a payment processing fee for every pledge transaction. There are two tiers:

**Standard processing (pledges above $3):** 2.9% + $0.30 per transaction. This is the card-processing rate that Patreon passes through. It is applied to the full pledge amount.

**Micropayment processing (pledges of $3 or less):** 5% + $0.10 per transaction. For very small pledges, the $0.30 fixed fee under the standard rate would consume a disproportionately large share of the pledge. The micropayment rate replaces the high fixed fee with a much smaller $0.10 one, at the cost of a higher percentage. For a $1 pledge, micropayment processing costs $0.15 versus $0.33 for the standard rate — a significant difference.

Use the micropayment toggle in the calculator above if your tier is priced at $3 or less.

## Worked example: new plan creator, $5 pledge.

A creator on the new 10% plan receives a $5 pledge from a patron. Patreon charges a 10% platform fee ($0.50) and a standard processing fee of 2.9% + $0.30 ($0.145 + $0.30 = $0.45, rounded to $0.45). Total fees are $0.95, and the creator receives $4.05. The effective take rate — total fees as a share of the pledge — is 19%.

## How the micropayment rate compares for $1 and $2 pledges.

For a $1 pledge under the new plan: standard processing would cost $0.10 (platform) + $0.33 (2.9% + $0.30) = $0.43 in total fees, leaving the creator $0.57. With the micropayment rate, processing is $0.10 (platform) + $0.15 (5% + $0.10) = $0.25 in total fees, leaving the creator $0.75. The micropayment rate saves $0.18 on a $1 pledge.

For a $2 pledge under the new plan: standard processing costs $0.20 (platform) + $0.36 (2.9% + $0.30) = $0.56, leaving $1.44. Micropayment rate costs $0.20 (platform) + $0.20 (5% + $0.10) = $0.40, leaving $1.60. Micropayment saves $0.16 on a $2 pledge.

The micropayment rate is always better for pledges at or below the $3 threshold.

## Scaling to your full patron base.

Use the patron count field to project your total monthly income. For example, a creator on the new 10% plan with 50 patrons each pledging $5 earns $5.00 × 50 = $250 gross, pays $0.95 × 50 = $47.50 in fees, and takes home $202.50. A legacy Pro creator (8%) at the same numbers pays less in platform fees: $0.40 (platform) + $0.45 (processing) = $0.85 in fees per patron, and takes home $207.50 for the same 50 patrons at $5 — a $5 monthly advantage over the new plan.

## Patreon fees vs Substack and Ko-fi.

Patreon's new 10% plan is identical to Substack's 10% platform fee, but Patreon's processing fee structure differs. Substack uses Stripe Billing, which adds a 0.7% recurring billing fee on top of the 2.9% + $0.30 base. Patreon does not add this billing surcharge, making Patreon marginally cheaper in processing costs on standard pledges.

Ko-fi charges 0% platform fee on its free plan (5% on Gold tier), but Ko-fi's processing fees are the same underlying card rates. For creators primarily seeking to minimise platform fees on larger pledges, Ko-fi's free plan or Patreon's legacy Lite (5%) are strong alternatives to Substack or the new Patreon 10% plan.

## Accuracy and scope of this calculator.

All rates are taken from Patreon's official support documentation and verified on 2026-06-15. The calculator models USD pledges. A 2.5% currency conversion fee applies when patrons pay in a currency different from the creator's payout currency — this is not modelled here. PayPal payout fees are also not modelled. The platform fee and processing fee breakdowns above cover the standard payout path for US-based creators receiving Stripe/bank payouts.`,

  workedExample: {
    scenario: "New plan creator (10%) with a $5/month patron pledge, standard processing.",
    steps: [
      { label: "Pledge amount", value: "$5.00" },
      { label: "Patreon platform fee (10%)", value: "$0.50" },
      { label: "Payment processing (2.9% + $0.30)", value: "$0.45" },
      { label: "Total fees", value: "$0.95" },
    ],
    result: "You keep $4.05 per patron",
  },

  faqs: [
    {
      q: "How much does Patreon take?",
      a: "Patreon takes a platform fee plus a payment processing fee on every pledge. New creators (after August 4, 2025) pay a flat 10% platform fee. Legacy creators pay 5% (Lite), 8% (Pro), or 12% (Premium). On top of the platform fee, Patreon charges payment processing: 2.9% + $0.30 for pledges above $3, or 5% + $0.10 for pledges of $3 or less. On a $5 pledge under the new plan, total fees are $0.95 and you keep $4.05.",
    },
    {
      q: "What is the difference between the new Patreon plan and legacy plans?",
      a: "Patreon introduced a flat 10% platform fee for new creators starting August 4, 2025. Before that date, creators could choose from three tiered plans: Lite (5%), Pro (8%), or Premium (12%). Existing creators who had active pages before August 4, 2025 keep their legacy plan rates as long as their page stays published. New creators can no longer access Lite (5%) or Pro (8%) — they are placed on the flat 10% plan.",
    },
    {
      q: "What is Patreon's micropayment fee?",
      a: "For pledges of $3 or less, Patreon applies a micropayment processing rate of 5% + $0.10 per transaction instead of the standard 2.9% + $0.30. The micropayment rate has a higher percentage but a much smaller fixed fee. For a $1 pledge, the micropayment fee is $0.15 versus $0.33 under the standard rate — saving $0.18. For a $2 pledge, it saves $0.16. The micropayment rate is always better for pledges at the $3 threshold or below.",
    },
    {
      q: "Does Patreon charge a monthly fee for creators?",
      a: "No. Patreon does not charge creators a monthly account fee. You only pay fees when patrons pledge to you. The platform fee and processing fee are deducted per transaction — you pay nothing if no pledges come in.",
    },
    {
      q: "What does Patreon take on a $10 pledge?",
      a: "Under the new 10% plan: Patreon takes $1.00 (10% platform fee) plus $0.59 (2.9% + $0.30 processing) = $1.59 total fees. You keep $8.41. Under legacy Pro (8%): platform fee $0.80, processing $0.59, total $1.39, you keep $8.61. Under legacy Lite (5%): platform fee $0.50, processing $0.59, total $1.09, you keep $8.91.",
    },
    {
      q: "How much does Patreon take compared to Ko-fi and Substack?",
      a: "Patreon's new flat 10% plan matches Substack's 10% platform fee, but Patreon's processing costs are slightly lower because Substack uses Stripe Billing, which adds a 0.7% recurring billing fee (making Substack's effective processing 3.6% + $0.30 vs Patreon's 2.9% + $0.30). Ko-fi charges 0% platform fees on its free plan with the same underlying card processing rates, making Ko-fi the most creator-friendly option for minimising platform fees. Legacy Patreon Lite at 5% sits between Ko-fi and the new Patreon/Substack 10%.",
    },
    {
      q: "Are Patreon fees the same worldwide?",
      a: "Patreon's platform fee percentages (10% new plan, or legacy 5/8/12%) apply globally. Payment processing fees are published as USD rates (2.9% + $0.30 standard; 5% + $0.10 micropayment). A 2.5% currency conversion fee applies when patrons pay in a currency that differs from the creator's payout currency. PayPal payout fees may also apply if you choose PayPal as your payout method. This calculator models the USD standard path.",
    },
  ],

  related: [
    "substack-fee-calculator",
    "ko-fi-fee-calculator",
    "gumroad-fee-calculator",
    "buy-me-a-coffee-fee-calculator",
  ],

  sources: [
    {
      label: "Patreon — Creator fees overview",
      url: "https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview",
    },
    {
      label: "Patreon — Standard platform fee for new creators (effective after August 4, 2025)",
      url: "https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025",
    },
    {
      label: "Patreon — Creator Plans (Lite, Pro, Premium)",
      url: "https://support.patreon.com/hc/en-us/articles/360024952552-Patreon-Creator-Plans",
    },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
