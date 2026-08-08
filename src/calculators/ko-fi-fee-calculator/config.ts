import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { kofiFees, CREATOR_PROCESSORS, type CreatorProcessorId } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const kofiFeeCalculator: CalculatorConfig = {
  slug: "ko-fi-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "kofi",
  title: "Ko-fi Fee Calculator",
  metaDescription:
    "Free Ko-fi fee calculator. Ko-fi is '0% on tips' only if you switch off Contributor status — new accounts pay 5% on tips by default. See your real payout, compare Stripe vs PayPal Micropayments, and check if Gold ($12/mo) is worth it.",
  h1: "Ko-fi Fee Calculator",
  intro:
    "See what Ko-fi actually takes — including the 5% on tips most creators don't know they're paying. New accounts start with Contributor status on (5% of tips too); it's the default this calculator shows. Switch it off, pick your processor (Stripe vs PayPal Micropayments cross over near $10), or compare Gold, and see your exact payout.",

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
      default: "contributor",
      options: [
        { value: "contributor", label: "Contributor status — default (5% on tips too)" },
        { value: "free", label: "Contributor off (0% tips, 5% shop)" },
        { value: "gold", label: "Ko-fi Gold ($12/mo — 0% everything)" },
      ],
      help: "Every new Ko-fi account starts with Contributor status ON, which gives Ko-fi 5% of your tips as well. Turn it off in Settings → Payment to get 0% on tips (shop/memberships stay 5%). Gold removes all platform fees for $12/mo.",
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
      id: "processor",
      label: "Your payment processor",
      type: "select",
      default: "stripe",
      options: [
        { value: "stripe", label: "Stripe — 2.9% + $0.30" },
        { value: "paypal", label: "PayPal — 3.49% + $0.49" },
        { value: "paypal-micro", label: "PayPal Micropayments — 4.99% + $0.09" },
      ],
      help: "Ko-fi pays into YOUR OWN Stripe or PayPal, so this fee is your choice. On small tips, PayPal Micropayments (must be enabled on your PayPal account) beats Stripe — the two cross over near $10.",
    },
    {
      id: "processing",
      label: "Include payment processing fee",
      type: "toggle",
      default: true,
      help: "Processing is always charged (it's your processor's fee, not Ko-fi's). Toggle off to see Ko-fi's platform fee in isolation.",
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
    const plan = String(values.plan || "contributor");
    const incomeType = String(values.incomeType || "tips");
    const includeProcessing = Boolean(values.processing !== false);
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    // Ko-fi platform fee:
    // - Gold plan:      0% on everything
    // - Standard plan:  5% on EVERYTHING (tips included) — the default a new account is on
    // - Free plan:      0% on tips, 5% on shop/memberships/commissions
    const isGold = plan === "gold";
    const isContributor = plan === "contributor";
    const isShop = incomeType === "shop";
    // Contributor takes 5% on tips too; shop/memberships are 5% on any non-Gold plan.
    const sellingPercent = isGold
      ? 0
      : isShop
        ? kofiFees.shopPercent
        : isContributor
          ? kofiFees.contributorPercent
          : kofiFees.tipsPercent;

    // Processing fee is the creator's OWN processor (Stripe / PayPal), their choice.
    const proc = CREATOR_PROCESSORS[(values.processor as CreatorProcessorId)] ?? CREATOR_PROCESSORS.stripe;
    const processingPercent = includeProcessing ? proc.percent : 0;
    const processingFixed = includeProcessing ? proc.fixed : 0;

    const r = computeMarketplaceFee({
      itemPrice: amount,
      itemCost,
      feeOnShipping: false,
      sellingPercent,
      processingPercent,
      processingFixed,
    });

    const hasCost = itemCost > 0;
    const planLabel = isGold ? "Ko-fi Gold" : isContributor ? "Contributor" : "Contributor off";
    const incomeLabel = isShop ? "shop/memberships/commissions" : "tips/donations";
    const feeLabel = sellingPercent === 0
      ? `0% Ko-fi platform fee (${planLabel}${plan === "free" && !isShop ? " — tips" : ""})`
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
                label: `Processing fee (${ctx.formatPercent(proc.percent)} + $${proc.fixed.toFixed(2)} — ${proc.label.split(" — ")[0]})`,
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
    "Your Ko-fi payout is the amount minus two stacked fees: **Ko-fi's platform fee** and **your payment processor's fee** (Stripe or PayPal — your own account, billed directly, no Ko-fi markup).\n\nThe platform fee depends on one setting and the income type:\n\n- **Tips, Contributor on (the default):** 5%\n- **Tips, Contributor off:** 0%\n- **Shop, memberships, commissions:** 5% (any non-Gold account)\n- **Ko-fi Gold ($12/mo):** 0% on everything\n\nSo two levers decide your take-home: the **Contributor toggle** (Settings → Payment — on by default, so most new creators pay 5% on tips without realising) and your **processor** (PayPal Micropayments keeps more on small tips, Stripe on larger payments). Set both in the calculator above; the guide below works through each, with the exact rates and break-even points.",

  seoContent: `Ko-fi is famous as the "0% on tips" platform — but that's only true if you turned a setting off, and your payment processor quietly changes your payout more than Ko-fi's own cut does. This tool runs your real numbers; here's what actually comes out of each payment.

**The short version:**

- New accounts pay **5% on tips** by default (Contributor status is on) — turn it off in Settings → Payment for the real 0%.
- Shop, membership and commission income is **5%** regardless (0% only on Gold).
- Your processor is your choice: **PayPal Micropayments wins under ~$10, Stripe wins above it.**
- **Ko-fi Gold ($12/mo)** removes the 5% — worth it above ~$240/mo of fee-bearing income.

## Does Ko-fi really take 0% on tips?

Only if you switched it off. Every new Ko-fi account starts with **Contributor status ON**, which gives Ko-fi **5% of your tips** on top of the 5% it already takes on shop and membership income. It's opt-out: unless you visit Settings → Payment and turn it off, a $5 tip loses about $0.25 to Ko-fi before the processor fee.

Here's the full picture by plan:

| Plan | Fee on tips | Fee on shop / memberships | Monthly cost |
|---|---|---|---|
| Contributor **on** (default) | 5% | 5% | Free |
| Contributor **off** | 0% | 5% | Free |
| Ko-fi Gold | 0% | 0% | $12 |

Contributor is a legitimate "give 5% back to fund Ko-fi" feature — the only problem is it's on by default and quietly framed, so creators repeat "Ko-fi takes nothing on tips" while paying 5%. This calculator defaults to Contributor on for that reason; switch the plan to see the other rows.

## Stripe or PayPal: which should you use on Ko-fi?

Ko-fi never touches the money — you connect your **own** Stripe or PayPal, so the processing fee is your decision, and on small tips it's the bigger lever.

| Processor | Fee | Best for |
|---|---|---|
| Stripe | 2.9% + $0.30 | Payments over ~$10 |
| PayPal Micropayments | 4.99% + $0.09 | Tips under ~$10 |

It's the fixed fee that decides it. On a $4 tip, Stripe's $0.30 is 7.5% before the percentage even applies, while Micropayments' $0.09 barely registers. On a $50 sale the 4.99% rate costs far more than $0.30, so Stripe wins. They cross near **$10**. If your support is mostly small tips, enabling PayPal Micropayments can raise your take-home; toggle the processor above to test your own amount.

## Is Ko-fi Gold worth it?

Gold ($12/month) removes the 5% platform fee on everything, so it pays off once the 5% you'd otherwise lose exceeds $12 — i.e. **above ~$240/month of fee-bearing income** ($12 ÷ 5%).

- **Contributor off:** count only shop/membership/commission income toward the $240.
- **Contributor on:** tips count too, so Gold breaks even sooner.

At $500/month of fee-bearing income you'd pay $25 in Ko-fi fees versus $12 for Gold — a $13/month saving. Below ~$240, Gold costs more than it saves.

## How does Ko-fi compare to Patreon and Buy Me a Coffee?

Ko-fi's edge is real but conditional on that one setting:

| Platform | Fee on tips | Fee on shop / memberships |
|---|---|---|
| Ko-fi (Contributor off) | 0% | 5% |
| Ko-fi (Contributor on) | 5% | 5% |
| Buy Me a Coffee | 5% | 5% |
| Patreon | 5–12% | 5–12% |

With Contributor off, Ko-fi is the cheapest of the three on tips. Leave it on and Ko-fi matches Buy Me a Coffee. For shop income, Ko-fi's 5% sits below Gumroad's 10% free-plan rate.

## How your payout is calculated.

Your payout is the amount minus Ko-fi's platform fee (if any) minus your processor's fee:

- **Tip, Contributor off / Gold:** amount − processor fee
- **Tip, Contributor on:** amount − 5% − processor fee
- **Shop / membership (non-Gold):** amount − 5% − processor fee

Processor fee = 2.9% + $0.30 (Stripe) or 4.99% + $0.09 (PayPal Micropayments). The calculator runs any combination instantly.

## Accuracy and sources.

Rates verified against Ko-fi's own help pages on **2026-08-08** — the Contributor-status article ("everyone who joins Ko-fi now starts with Contributor status"), the fee overview, and the Gold page. Processor rates are the standard US Stripe and PayPal Micropayments rates; international cards may add surcharges not modelled here. Confirm the exact figures in your own Stripe/PayPal dashboard and Ko-fi settings before pricing decisions — and see our verification log for when each rate was last checked.`,

  workedExample: {
    scenario:
      "A supporter sends you a $5 tip on a new Ko-fi account — Contributor status is still on (the default), and you're using Stripe.",
    steps: [
      { label: "Tip amount", value: "$5.00" },
      { label: "Ko-fi fee (5% — Contributor status on)", value: "$0.25" },
      { label: "Stripe processing (2.9% + $0.30)", value: "$0.45" },
      { label: "Total fees", value: "$0.70" },
    ],
    result: "You receive $4.30 — not $4.55. The 'free on tips' platform took 5% because Contributor was left on.",
  },

  faqs: [
    {
      q: "Is Ko-fi really 0% on tips?",
      a: "Only if you turned it off. Every new Ko-fi account starts with Contributor status switched ON, and Contributor gives Ko-fi 5% of your tips too. It's opt-out: go to Settings → Payment and turn Contributor off to get the famous 0% on tips. Until you do, a $5 tip loses about $0.25 to Ko-fi on top of the payment-processor fee. That's the single most-missed thing about Ko-fi's pricing.",
    },
    {
      q: "What is Ko-fi Contributor status and should I turn it off?",
      a: "Contributor is a way to voluntarily give Ko-fi 5% of your tips to help fund the platform — and new accounts have it ON by default. If you'd rather keep 100% of tips (minus only the processor fee), turn it off in Settings → Payment; it takes seconds and applies to future tips. Leave it on only if you genuinely want to support Ko-fi. Shop, membership and commission income is charged 5% regardless of this setting.",
    },
    {
      q: "Should I use Stripe or PayPal to get paid on Ko-fi?",
      a: "Because Ko-fi pays into your OWN processor account, the processing fee is your choice — and it matters most on small tips. Stripe is 2.9% + $0.30; PayPal Micropayments is 4.99% + $0.09 (you have to enable Micropayments on your PayPal account). The low $0.09 fixed fee means Micropayments keeps you more on small payments and less on large ones — the two cross over around $10. If most of your support is small tips, Micropayments can be the better pick; for larger shop sales, Stripe wins. Use the processor selector above to compare your own amounts.",
    },
    {
      q: "What percentage does Ko-fi take from shop sales and memberships?",
      a: "5% on shop sales, memberships and commissions — this applies whether Contributor is on or off, on the standard (non-Gold) account. On top of that you pay your processor's fee (Stripe 2.9% + $0.30, or PayPal). Ko-fi Gold ($12/month) removes the 5% on everything, leaving only the processor fee.",
    },
    {
      q: "Is Ko-fi Gold worth it?",
      a: "Gold ($12/month) removes Ko-fi's 5% platform fee. With Contributor off, the break-even is $240/month of shop/membership/commission income ($12 ÷ 5%) — earn more than that and Gold saves you money. If you leave Contributor on, your tips are fee-bearing too, so add tips to that total: Gold breaks even sooner. If you earn little and keep Contributor off, Gold isn't worth it.",
    },
    {
      q: "How does Ko-fi compare to Patreon and Buy Me a Coffee for fees?",
      a: "With Contributor turned off, Ko-fi charges 0% on tips — better than Patreon (5–12% on all income) and Buy Me a Coffee (flat 5% on everything, always). But leave Contributor on and Ko-fi's 5% on tips matches Buy Me a Coffee. For shop/memberships, Ko-fi's 5% is comparable to Patreon's lower tiers. The real Ko-fi advantage is conditional — it depends on that one setting.",
    },
    {
      q: "Does Ko-fi charge fees on commissions?",
      a: "Yes — 5% on commissions on a standard account (same as shop sales), plus your processor's fee. Ko-fi Gold reduces the 5% to 0%. Commissions are treated as shop-type income, so the 5% applies regardless of the Contributor tip setting.",
    },
  ],

  // Batch-1 siblings first: concentrates crawl + link equity within the indexable
  // set (config/indexing.ts) while it's the only surface Google is indexing.
  related: [
    "buy-me-a-coffee-fee-calculator",
    "gumroad-fee-calculator",
    "substack-fee-calculator",
    "bandcamp-fee-calculator",
    "stripe-fee-calculator",
  ],

  sources: [
    {
      label: "Ko-fi — Pricing (0% free / 5% shop & memberships / Gold $12)",
      url: "https://ko-fi.com/pricing",
    },
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

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-13",
};
