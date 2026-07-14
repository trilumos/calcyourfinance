import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { kofiFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const kofiFeeCalculator: CalculatorConfig = {
  slug: "ko-fi-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "kofi",
  title: "Ko-fi Fee Calculator",
  metaDescription:
    "Free Ko-fi fee calculator. See exactly how much Ko-fi takes on tips, shop sales, memberships and commissions — Free plan (0% tips, 5% shop) vs Ko-fi Gold (0% everything) — plus Stripe/PayPal processing.",
  h1: "Ko-fi Fee Calculator",
  intro:
    "Calculate exactly what Ko-fi takes from your earnings and what you keep. Choose your plan and income type — Ko-fi charges 0% on tips on the Free plan and 5% on shop sales, memberships, and commissions. Ko-fi Gold eliminates the platform fee entirely. Enter your amount to see the breakdown.",

  keywords: {
    primary: "ko-fi fee calculator",
    secondary: [
      "ko-fi fees calculator",
      "ko-fi fees",
      "ko-fi fee percentage",
      "does ko-fi take a cut",
      "how much does ko-fi take",
      "ko-fi gold worth it",
      "ko-fi payout calculator",
      "ko-fi profit calculator",
    ],
    longTail: [
      "ko-fi platform fee",
      "ko-fi free plan fees",
      "ko-fi gold plan fees",
      "ko-fi shop fees",
      "ko-fi membership fees",
      "ko-fi commission fees",
      "ko-fi tips fee",
      "ko-fi stripe processing fee",
      "ko-fi vs patreon fees",
      "ko-fi gold is it worth it",
      "how much does ko-fi take from donations",
      "ko-fi fee on shop sales",
      "ko-fi creator fee",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "amount",
      label: "Amount received",
      type: "currency",
      default: 25,
      min: 0,
      help: "The amount your supporter pays you.",
    },
    {
      id: "plan",
      label: "Ko-fi plan",
      type: "select",
      default: "free",
      options: [
        { value: "free", label: "Free plan" },
        { value: "gold", label: "Ko-fi Gold ($12/mo)" },
      ],
      help: "Free plan: 0% on tips, 5% on shop/memberships/commissions. Gold: 0% on everything.",
    },
    {
      id: "incomeType",
      label: "Income type",
      type: "select",
      default: "tips",
      options: [
        { value: "tips", label: "Tips / donations" },
        { value: "shop", label: "Shop sales, memberships or commissions" },
      ],
      help: "Affects the platform fee on the Free plan. Gold always charges 0%.",
    },
    {
      id: "processing",
      label: "Include payment processing fee",
      type: "toggle",
      default: true,
      help: "Stripe / PayPal processing (2.9% + $0.30). Always charged; toggle off to see platform fee only.",
    },
    {
      id: "itemCost",
      label: "Your item / content cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What it cost you to make or source this — to calculate your real profit.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const amount = Math.max(0, Number(values.amount) || 0);
    const plan = String(values.plan || "free");
    const incomeType = String(values.incomeType || "tips");
    const includeProcessing = Boolean(values.processing !== false);
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    // Ko-fi platform fee:
    // - Gold plan: always 0%
    // - Free plan, tips: 0%
    // - Free plan, shop/memberships/commissions: 5%
    const isGold = plan === "gold";
    const isShop = incomeType === "shop";
    const sellingPercent = isGold ? 0 : isShop ? kofiFees.shopPercent : kofiFees.tipsPercent;

    const processingPercent = includeProcessing ? kofiFees.processingPercent : 0;
    const processingFixed = includeProcessing ? kofiFees.processingFixed : 0;

    const r = computeMarketplaceFee({
      itemPrice: amount,
      itemCost,
      feeOnShipping: false,
      sellingPercent,
      processingPercent,
      processingFixed,
    });

    const hasCost = itemCost > 0;
    const planLabel = isGold ? "Ko-fi Gold" : "Free plan";
    const incomeLabel = isShop ? "shop/memberships/commissions" : "tips/donations";
    const feeLabel = sellingPercent === 0
      ? `0% Ko-fi platform fee (${planLabel}${!isGold && !isShop ? " — tips" : ""})`
      : `${ctx.formatPercent(sellingPercent)} Ko-fi platform fee (${planLabel})`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Ko-fi + processing takes ${ctx.formatCurrency(r.totalFees)} of your ${ctx.formatCurrency(r.revenue)} ${incomeLabel} payment`,
      },
      rows: [
        {
          label: "Amount received from supporter",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: feeLabel,
          display: ctx.formatCurrency(r.sellingFee),
          kind: r.sellingFee > 0 ? "deduction" : "muted",
        },
        ...(includeProcessing
          ? [
              {
                label: `Processing fee (${ctx.formatPercent(kofiFees.processingPercent)} + $${kofiFees.processingFixed.toFixed(2)} — Stripe/PayPal)`,
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
                label: "Profit after item / content cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Ko-fi has a simple, transparent fee model. On the Free plan, tips and direct donations carry a 0% Ko-fi platform fee — the platform earns nothing on those. Shop sales, memberships, and commissions on the Free plan are charged a 5% Ko-fi service fee. Ko-fi Gold, which costs $12 per month, removes that 5% entirely — all income types become 0% platform fee.\n\nOn top of Ko-fi's own fee, your chosen payment processor (Stripe or PayPal) charges a standard processing fee of 2.9% + $0.30 per transaction. Ko-fi does not add a processing markup — you connect your own Stripe or PayPal account and the processor charges you directly. This means on a $25 donation via the Free plan, your only deduction is the $1.03 Stripe/PayPal fee; Ko-fi takes nothing.\n\nFor the Gold plan to pay for itself, you need to be generating enough shop/membership/commission income that the 5% you save exceeds $12. That break-even point is $240/month in shop-type income (5% × $240 = $12). Above that, Gold saves you money every month.",

  seoContent: `Our Ko-fi fee calculator is a free tool that shows exactly what Ko-fi takes from your tips, shop sales, memberships, and commissions — and what you actually keep. Ko-fi is one of the most popular creator-support platforms for artists, illustrators, writers, streamers, and content creators who want a low-friction way to receive support from fans. Understanding its fee structure is essential for pricing digital products, memberships, and commissions correctly.

## How Ko-fi's fee structure works.

Ko-fi operates on two plans: a Free plan and Ko-fi Gold. The core distinction is what the platform charges on different types of income.

On the Free plan, tips and direct donations carry a 0% Ko-fi platform fee. When a supporter sends you a tip, Ko-fi takes nothing from that transaction — you only lose the payment processor's standard fee. This makes Ko-fi tips one of the lowest-fee ways for creators to accept direct support online.

Shop sales, memberships, and commissions on the Free plan are charged a 5% Ko-fi service fee. This applies to anything you sell through the Ko-fi Shop, any recurring membership payments, and any commission payments you receive through the platform.

Ko-fi Gold costs $12 per month (or a reduced rate annually) and removes all platform fees. Everything — tips, shop sales, memberships, commissions — becomes 0% Ko-fi fee. Only the underlying payment processor fee remains.

## What the payment processor charges.

Ko-fi doesn't process payments itself. You connect your own Stripe or PayPal account, and the processor charges you directly. The standard Stripe rate in the US is 2.9% + $0.30 per successful transaction (PayPal's rate for receiving payments is similar). Ko-fi does not add a surcharge on top of this.

This means on a $25 tip via the Free plan, your only deduction is the Stripe/PayPal processing fee — roughly $1.03. Ko-fi takes $0.00. On a $25 shop sale via the Free plan, you also pay the 5% Ko-fi fee ($1.25), bringing total fees to about $2.28 and your payout to $22.72.

## Does Ko-fi take a cut of donations and tips?

No — Ko-fi does not take a cut of tips and donations on the Free plan. This is one of Ko-fi's most prominent selling points and a key difference from platforms like Patreon (which charges 5–12% depending on the plan) and Buy Me a Coffee (which charges a flat 5% on everything). The 0% tip fee is why many creators use Ko-fi as a supplementary income stream alongside other platforms.

## Is Ko-fi Gold worth it?

Ko-fi Gold is worth it if your monthly Ko-fi income from shop sales, memberships, or commissions exceeds $240. Here's why: Ko-fi Gold costs $12/month and saves you the 5% platform fee on shop/membership/commission income. The break-even is $12 ÷ 0.05 = $240/month in those fee-bearing income types. If you're earning more than that from your Ko-fi shop or memberships, Gold saves you money. If you're primarily earning from tips, Gold makes no financial difference — you were already paying 0% on tips.

For example, if you earn $500/month in Ko-fi shop sales, the Free plan costs you $25 in Ko-fi fees. Gold costs $12. You save $13/month by switching. At $1,000/month in shop revenue, the saving grows to $38/month ($50 in fees vs $12 for Gold).

## Ko-fi fees compared to Patreon and Buy Me a Coffee.

Ko-fi's 0% tip fee is its defining advantage over comparable platforms. Patreon charges 5–12% of all creator income depending on the plan tier — there's no zero-fee option. Buy Me a Coffee charges a flat 5% on every transaction regardless of type. Substack takes 10% of paid subscription revenue. Ko-fi's Free plan is genuinely free for tip-based income, which is unusual in the creator economy.

For shop and membership income, Ko-fi's 5% Free plan rate is competitive with Gumroad (10% on the free plan) but higher than platforms like Etsy (6.5% transaction fee) for physical goods. For digital products, Ko-fi's 5% is broadly in line with the market.

## How to calculate your Ko-fi payout.

For a tip on the Free plan: your payout = amount − (amount × 2.9% + $0.30). For a shop sale on the Free plan: your payout = amount − (amount × 5%) − (amount × 2.9% + $0.30). For any income on Gold: your payout = amount − (amount × 2.9% + $0.30). Use the calculator above to run any scenario instantly.

## Accuracy and what this calculator covers.

All rates in this calculator are taken from Ko-fi's official help pages and pricing, verified on 2026-06-13. The Free plan fee (0% tips, 5% shop/memberships/commissions) and the Gold plan ($12/month, 0% platform fee on everything) are Ko-fi's current published fee structure. Payment processing (2.9% + $0.30, standard Stripe/PayPal US rate) is shown separately and can be toggled off if you want to isolate the Ko-fi platform fee. International payment processing may carry additional surcharges not modelled here. Check the sources below and your Stripe or PayPal dashboard for the exact figures before making pricing decisions.`,

  workedExample: {
    scenario: "You sell a $25 digital product in your Ko-fi shop on the Free plan.",
    steps: [
      { label: "Sale amount", value: "$25.00" },
      { label: "Ko-fi platform fee (5% — Free plan shop)", value: "$1.25" },
      { label: "Stripe processing (2.9% + $0.30)", value: "$1.03" },
      { label: "Total fees", value: "$2.28" },
    ],
    result: "You receive $22.72",
  },

  faqs: [
    {
      q: "Does Ko-fi take a cut of tips?",
      a: "No — Ko-fi charges 0% on tips and donations on the Free plan. When a supporter sends you a tip, Ko-fi takes nothing. You only pay the standard payment processor fee (Stripe or PayPal, typically 2.9% + $0.30). This makes Ko-fi tips one of the most creator-friendly ways to accept direct support online.",
    },
    {
      q: "What percentage does Ko-fi take from shop sales?",
      a: "On the Free plan, Ko-fi charges a 5% platform fee on shop sales, memberships, and commissions. On top of that, you pay the payment processor's standard fee (2.9% + $0.30 for Stripe or PayPal). On Ko-fi Gold ($12/month), the 5% platform fee is reduced to 0% on everything — you only pay the processor fee.",
    },
    {
      q: "Is Ko-fi Gold worth it?",
      a: "Ko-fi Gold is worth it financially if you earn more than $240/month from shop sales, memberships, or commissions. The Gold plan costs $12/month and removes Ko-fi's 5% platform fee on those income types. The break-even is $12 ÷ 5% = $240/month. If you earn more than that from fee-bearing income, Gold saves you money. If your Ko-fi income is mostly from tips, Gold makes no financial difference — tips are already 0% on the Free plan.",
    },
    {
      q: "What is Ko-fi's payment processing fee?",
      a: "Ko-fi does not process payments directly — you connect your own Stripe or PayPal account. Those processors charge a standard fee of around 2.9% + $0.30 per transaction in the US. Ko-fi adds no surcharge on top. The exact rate may differ outside the US or for international cards.",
    },
    {
      q: "How does Ko-fi compare to Patreon for fees?",
      a: "Ko-fi's Free plan charges 0% on tips, which is significantly better than Patreon's 5–12% platform fee on all creator income. For memberships and shop sales, Ko-fi's 5% Free plan fee is comparable to Patreon's Lite plan (5%). Ko-fi Gold at $12/month with 0% fees can be cheaper than Patreon for high-earning creators, since Patreon's fee never goes to zero regardless of revenue.",
    },
    {
      q: "Does Ko-fi charge fees on memberships?",
      a: "Yes — on the Free plan, Ko-fi charges 5% on recurring membership payments. This applies to monthly and annual memberships set up through Ko-fi. Ko-fi Gold removes this fee, reducing it to 0%. The payment processor (Stripe or PayPal) still charges its standard processing fee on each recurring payment.",
    },
    {
      q: "What fees does Ko-fi charge on commissions?",
      a: "Ko-fi charges 5% on commissions on the Free plan. Commissions are treated the same as shop sales for fee purposes. Ko-fi Gold reduces this to 0%. You also pay the payment processor's fee (2.9% + $0.30) on each commission payment received.",
    },
  ],

  related: [
    "etsy-fee-calculator",
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "buy-me-a-coffee-fee-calculator",
  ],

  sources: [
    {
      label: "Ko-fi — Does Ko-fi take a fee?",
      url: "https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee",
    },
    {
      label: "Ko-fi — Pricing & Plans",
      url: "https://ko-fi.com/pricing",
    },
    {
      label: "Ko-fi — What is Ko-fi Gold?",
      url: "https://help.ko-fi.com/hc/en-us/articles/360005506873-What-is-Ko-fi-Gold",
    },
  ],

  feesVerifiedOn: "2026-06-13",
  lastUpdated: "2026-06-13",
};
