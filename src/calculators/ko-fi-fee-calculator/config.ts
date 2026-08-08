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
    "\"Ko-fi is 0% on tips\" is the line everyone repeats — and it's only true if you turned a setting off. Every new Ko-fi account starts with Contributor status switched ON, which gives Ko-fi 5% of your tips too. It's opt-out, not opt-in: you disable it in Settings → Payment. So the honest default a new creator is on takes 5% of tips, 5% of shop/membership/commission income, plus the payment processor's fee. This calculator defaults to Contributor ON for that reason; switch the plan to \"Contributor off\" to see the true 0%-tips figure, or Gold to zero every platform fee.\n\nKo-fi never touches the money itself — you connect your OWN Stripe or PayPal, and the processor bills you directly, with no Ko-fi markup. Because it's your account, the processor fee is your choice, and on small tips it's the bigger lever than Ko-fi's cut. Stripe is 2.9% + $0.30; PayPal Micropayments (which you must enable on your PayPal account) is 4.99% + $0.09. The fixed $0.09 vs $0.30 means Micropayments wins on small payments and loses on large ones — they cross over near $10. On a $4 tip, Micropayments leaves you noticeably more; on a $50 sale, Stripe does.\n\nKo-fi Gold ($12/month) removes the 5% platform fee on everything. Whether it pays off depends on how much fee-bearing income you have: with Contributor off, the break-even is $240/month in shop/membership income (5% × $240 = $12). But if you leave Contributor ON, your tips are fee-bearing too, so Gold breaks even sooner — count tips + shop together against the $240.",

  seoContent: `Our Ko-fi fee calculator shows what Ko-fi actually takes from your tips, shop sales, memberships and commissions — including the 5% cut most creators don't realise they're paying. Ko-fi is famous as the "0% on tips" platform, but that number is conditional on a setting, and your choice of payment processor changes your real payout more than most people expect. This tool runs your exact numbers on both.

## The 5% on tips nobody mentions: Contributor status.

Here's the thing the "Ko-fi is free" articles skip. Every new Ko-fi account starts with **Contributor status turned ON**, and Contributor gives Ko-fi **5% of your tips** as well as the 5% it already takes on shop and membership income. It is opt-OUT, not opt-in: unless you go to Settings → Payment and switch it off, a supporter's $5 tip loses about $0.25 to Ko-fi on top of the payment-processor fee.

That's why this calculator defaults to "Contributor on" — it's the honest starting point for a real new creator. Switch the plan selector to **Contributor off** to see the genuine 0%-on-tips payout, or **Gold** to remove every platform fee. If you've never touched that setting, assume you're paying the 5%.

Contributor is a legitimate feature — some creators happily give 5% back to fund the platform. The problem is only that it's on by default and quietly framed, so people repeat "Ko-fi takes nothing on tips" while paying 5%.

## Your processor is your choice — and it's the bigger lever on small tips.

Ko-fi never handles the money. You connect your **own Stripe or PayPal account**, and the processor bills you directly with no Ko-fi markup. Because it's your account, the processing fee is a decision you make — and on small tips it moves your payout more than Ko-fi's own cut.

- **Stripe:** 2.9% + $0.30
- **PayPal Micropayments:** 4.99% + $0.09 (you must enable Micropayments on your PayPal account)

The trick is the fixed fee. On a $4 tip, Stripe's $0.30 is brutal (that's 7.5% before the percentage even applies), while Micropayments' $0.09 barely registers — so Micropayments wins. On a $50 sale, the 4.99% rate costs far more than the $0.30 fixed, so Stripe wins. The two **cross over around $10**. If most of your support comes as small tips, enabling PayPal Micropayments can quietly raise your take-home; if you mostly sell higher-priced products, stay on Stripe. Use the processor selector above to test your own typical amount.

## Is Ko-fi Gold worth it? (it depends on the Contributor setting)

Ko-fi Gold costs **$12/month** and removes the 5% platform fee on everything. The break-even depends on which fees you're actually paying:

- **Contributor off:** only shop/membership/commission income is charged 5%, so Gold breaks even at **$240/month** of that income ($12 ÷ 5%).
- **Contributor on:** your tips are fee-bearing too, so count tips + shop + memberships together against the $240 — Gold pays for itself sooner.

At $500/month of fee-bearing income you'd pay $25 in Ko-fi fees on a standard account versus $12 for Gold — a $13/month saving. Below ~$240 of fee-bearing income (with Contributor off), Gold costs more than it saves.

## Ko-fi vs Patreon vs Buy Me a Coffee.

Ko-fi's advantage is real but **conditional**. With Contributor off, Ko-fi takes 0% on tips — better than Patreon (5–12% on all creator income, never zero) and Buy Me a Coffee (a flat 5% on everything, always). But leave Contributor on and Ko-fi's 5% on tips is identical to Buy Me a Coffee. For shop and membership income, Ko-fi's 5% sits near Patreon's lower tiers and below Gumroad's 10% free-plan rate. The honest summary: Ko-fi can be the cheapest of the three — if you turn off the setting most people never see.

## How the payout is calculated.

Tip, Contributor off: payout = amount − processor fee. Tip, Contributor on: payout = amount − (amount × 5%) − processor fee. Shop/membership (any standard account): payout = amount − (amount × 5%) − processor fee. Gold: payout = amount − processor fee. The processor fee is 2.9% + $0.30 (Stripe) or 4.99% + $0.09 (PayPal Micropayments). The calculator above runs any combination instantly.

## Accuracy and sources.

Rates verified against Ko-fi's own help pages on 2026-08-08 — including the Contributor-status article ("everyone who joins Ko-fi now starts with Contributor status"), the fee overview, and the Gold page. Processor rates are the standard US Stripe and PayPal Micropayments rates. International cards may carry additional processor surcharges not modelled here. This tool estimates from published rates; confirm the exact figures in your own Stripe or PayPal dashboard and Ko-fi settings before pricing decisions. Every rate on this site carries the date we last checked it — see our verification log.`,

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

  related: [
    "etsy-fee-calculator",
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "buy-me-a-coffee-fee-calculator",
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
