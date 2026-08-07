import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import type { CountryCode } from "../../lib/countries";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const COUNTRIES: CountryCode[] = ["US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "DE", "FR", "IE"];

// Shopify US 2026: monthly plan, Shopify Payments online card rate, and the
// third-party-gateway surcharge (charged on top of an external processor).
const PLANS: Record<string, { label: string; card: number; surcharge: number; monthly: number }> = {
  basic: { label: "Basic", card: 2.9, surcharge: 2, monthly: 39 },
  grow: { label: "Grow", card: 2.7, surcharge: 1, monthly: 105 },
  advanced: { label: "Advanced", card: 2.5, surcharge: 0.5, monthly: 399 },
};
const CARD_FIXED = 0.3;

export const shopifyFeeCalculator: CalculatorConfig = {
  slug: "shopify-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",
  platform: "shopify",

  title: "Shopify Fee Calculator",
  metaDescription:
    "Free Shopify fee calculator. Work out Shopify's payment processing fees per plan (Basic, Grow, Advanced), the third-party gateway surcharge, and exactly what you keep on a sale — plus how the monthly plan adds up.",
  h1: "Shopify Fee Calculator.",
  intro:
    "See what Shopify takes on a sale and what actually reaches you. Pick your plan and whether you use Shopify Payments or a third-party gateway, enter the order value, and get the per-sale fee and your payout.",

  keywords: {
    primary: "shopify fee calculator",
    secondary: [
      "shopify transaction fees",
      "shopify payment fees",
      "shopify fees calculator",
      "shopify processing fee calculator",
      "shopify cost calculator",
    ],
    longTail: [
      "how much does shopify take per sale",
      "shopify transaction fee calculator",
      "shopify payments fees",
      "shopify third party gateway fee",
      "shopify basic plan fees",
      "shopify payout calculator",
      "shopify fee calculator uk",
      "what percentage does shopify take",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: COUNTRIES, default: "US" },

  inputs: [
    { id: "amount", label: "Order amount", type: "currency", default: 100, min: 0 },
    {
      id: "plan",
      label: "Shopify plan",
      type: "select",
      default: "basic",
      options: [
        { value: "basic", label: "Basic ($39/mo)" },
        { value: "grow", label: "Grow ($105/mo)" },
        { value: "advanced", label: "Advanced ($399/mo)" },
      ],
      help: "Higher plans have lower processing rates and a smaller third-party surcharge.",
    },
    {
      id: "gateway",
      label: "Payment method",
      type: "select",
      default: "shopify-payments",
      options: [
        { value: "shopify-payments", label: "Shopify Payments" },
        { value: "third-party", label: "Third-party gateway (Stripe, PayPal…)" },
      ],
      help: "Shopify Payments has no extra transaction fee. A third-party gateway adds Shopify's surcharge on top of that processor's own fee.",
    },
    { id: "cost", label: "Item cost (optional)", type: "currency", default: 0, min: 0, help: "Your cost of goods, to show profit." },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const amount = Math.max(0, Number(values.amount) || 0);
    const cost = Math.max(0, Number(values.cost) || 0);
    const plan = PLANS[String(values.plan)] ?? PLANS.basic;
    const thirdParty = values.gateway === "third-party";

    const r = thirdParty
      ? computeMarketplaceFee({ itemPrice: amount, sellingPercent: plan.surcharge, itemCost: cost })
      : computeMarketplaceFee({ itemPrice: amount, sellingPercent: 0, processingPercent: plan.card, processingFixed: CARD_FIXED, itemCost: cost });

    const feeLabel = thirdParty
      ? `Shopify surcharge (${ctx.formatPercent(plan.surcharge)})`
      : `Shopify Payments (${ctx.formatPercent(plan.card)} + ${ctx.formatCurrency(CARD_FIXED)})`;

    const rows: CalcResult["rows"] = [
      { label: "Order amount", display: ctx.formatCurrency(amount) },
      { label: feeLabel, display: ctx.formatCurrency(r.totalFees), kind: "deduction" },
      { label: "You keep", display: ctx.formatCurrency(r.payout), kind: "net" },
    ];
    if (cost > 0) rows.push({ label: "Profit (after item cost)", display: ctx.formatCurrency(r.profit), kind: "net" });
    if (thirdParty) rows.push({ label: "Plus your gateway's own fee", display: "separate", kind: "muted", hint: "Stripe/PayPal etc. charge their own % + fixed fee — use their calculator." });

    return {
      headline: {
        label: "You keep",
        display: ctx.formatCurrency(r.payout),
        sub: `${ctx.formatPercent(r.takeRatePercent)} of the sale · plan is ${ctx.formatCurrency(plan.monthly)}/mo on top`,
      },
      rows,
    };
  },

  howItWorks:
    "Shopify's cost has two parts: a fixed monthly plan, and a fee on every sale. This calculator focuses on the per-sale fee (the monthly plan is shown as context).\n\nIf you use Shopify Payments — the built-in processor — you pay a card rate per transaction and no extra transaction fee: 2.9% + 30¢ on Basic, 2.7% + 30¢ on Grow, and 2.5% + 30¢ on Advanced for online sales. So on a $100 order on Basic, Shopify takes $3.20 and you keep $96.80.\n\nIf you use a third-party gateway (Stripe, PayPal, etc.) instead, Shopify charges a surcharge on top of whatever that processor charges you: 2% on Basic, 1% on Grow, and 0.5% on Advanced. That surcharge is Shopify's cut; the external processor's own percentage-plus-fixed fee is separate and additional — which is why Shopify Payments is usually cheaper. Higher plans cost more per month but lower both the card rate and the surcharge, so the break-even depends on your sales volume.",

  seoContent: `This Shopify fee calculator shows what Shopify takes on a sale and what actually reaches your bank — the part most plan-price comparisons leave out. Choose your plan and payment method, enter an order value, and see the per-sale fee, your payout, and how the monthly plan stacks on top.

## Shopify's two costs: plan + per-sale fee

Shopify charges a fixed monthly subscription and a fee on every transaction. The monthly plans (billed monthly) are Basic at $39, Grow at $105, and Advanced at $399; annual billing lowers these to roughly $29, $79 and $299. The plan buys features and lower rates — but the per-sale fees are usually the bigger number once you're selling steadily, which is what this tool makes clear.

## Shopify Payments processing rates

If you use Shopify Payments (the built-in processor), you pay a card rate per online transaction and no separate transaction fee:

- **Basic:** 2.9% + 30¢
- **Grow:** 2.7% + 30¢
- **Advanced:** 2.5% + 30¢

On a $100 online order, that's $3.20 on Basic (you keep $96.80), $2.97 on Grow, and $2.80 on Advanced. In-person (POS) rates differ and are lower; this calculator uses the online rates.

## Third-party gateway surcharge

If you use an external payment gateway — Stripe, PayPal, Amazon Pay or another processor — instead of Shopify Payments, Shopify adds a surcharge on top of that processor's own fee: **2% on Basic, 1% on Grow, 0.5% on Advanced** (and 0.15% on Plus). Importantly, that surcharge is only Shopify's cut — the external processor still charges its own percentage-plus-fixed fee separately. So a third-party gateway usually costs more overall than Shopify Payments, which is exactly why Shopify prices it that way. When you pick "third-party gateway" here, the calculator shows Shopify's surcharge; add your processor's own fee (from its calculator) for the full picture.

## Which plan is cheapest for you?

Because higher plans cost more monthly but charge less per sale, the cheapest plan depends on your volume. A rough way to think about it: the extra monthly cost of moving up a plan is only worth it once the per-sale savings across all your orders exceed that difference. For example, moving from Basic to Grow costs $66 more per month but drops the card rate from 2.9% to 2.7% — a 0.2% saving, which breaks even at around $33,000 in monthly card sales. Run your typical order value and monthly volume through the calculator on each plan to find your break-even.

## What's included and what isn't

This calculator models Shopify's own fees: the Shopify Payments card rate or the third-party surcharge. It does not include the monthly plan in the per-sale figure (it's shown separately as context), nor app subscriptions, shipping labels, currency-conversion fees, or chargeback fees, which vary by store. For a third-party gateway, remember to add that processor's own fee. Rates are Shopify's published US online rates; in-person rates and non-US markets differ.

## Reading your real Shopify cost

Sellers consistently underestimate Shopify's cost because they anchor on the monthly plan price and forget the per-sale processing. A store doing $50,000/month on Basic pays roughly $1,450 in card fees plus $150 in fixed per-transaction fees plus the $39 plan — over $1,600, or more than 3% of revenue. Knowing the real per-sale fee lets you price products with the right margin instead of discovering the gap at payout. Confirm your exact rates in your Shopify admin, since Shopify occasionally updates pricing and offers plan-specific promotions.`,

  workedExample: {
    scenario: "A $100 online order on the Basic plan, paid through Shopify Payments.",
    steps: [
      { label: "Order amount", value: "$100.00" },
      { label: "Shopify Payments (2.9% + $0.30)", value: "$3.20" },
      { label: "You keep", value: "$96.80" },
      { label: "Plan cost (separate)", value: "$39.00/mo" },
    ],
    result: "On Basic with Shopify Payments you keep $96.80 of a $100 sale; the $39/month plan is on top, so your true cost depends on both the per-sale fee and your monthly volume.",
  },

  faqs: [
    { q: "How much does Shopify take per sale?", a: "With Shopify Payments on the Basic plan, 2.9% + 30¢ per online sale — so $3.20 on a $100 order, leaving you $96.80. Grow is 2.7% + 30¢ and Advanced is 2.5% + 30¢. The monthly plan ($39 / $105 / $399) is separate." },
    { q: "What are Shopify's transaction fees for third-party gateways?", a: "If you use an external processor (Stripe, PayPal, etc.) instead of Shopify Payments, Shopify adds a surcharge of 2% (Basic), 1% (Grow) or 0.5% (Advanced) on top of that processor's own fee. Using Shopify Payments avoids this surcharge." },
    { q: "Does the calculator include the monthly plan?", a: "No — the per-sale figure is Shopify's transaction fee only. The monthly plan ($39 / $105 / $399) is shown separately as context, because your true cost per order depends on how many sales you spread that monthly fee across." },
    { q: "Is Shopify Payments cheaper than Stripe or PayPal on Shopify?", a: "Usually yes. Shopify Payments charges only the card rate with no extra transaction fee, while a third-party gateway costs that processor's fee plus Shopify's surcharge (up to 2%). For most stores, Shopify Payments is the cheaper route." },
    { q: "Which Shopify plan is cheapest?", a: "It depends on volume. Higher plans cost more per month but charge lower per-sale rates, so they only pay off above a certain monthly sales figure. Run your typical order value and volume through the calculator on each plan to find your break-even." },
  ],

  related: ["etsy-fee-calculator", "stripe-fee-calculator", "paypal-fee-calculator", "ebay-fee-calculator"],

  sources: [
    { label: "Shopify — Pricing", url: "https://www.shopify.com/pricing" },
    { label: "Shopify — Payments & fees", url: "https://help.shopify.com/en/manual/payments" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-15",
};
