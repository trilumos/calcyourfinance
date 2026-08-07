import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { lemonSqueezyFees } from "../../config/fees";
import { computeFlatFee } from "../../lib/flatFee";

export const lemonSqueezyFeeCalculator: CalculatorConfig = {
  slug: "lemon-squeezy-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "lemonsqueezy",
  title: "Lemon Squeezy Fee Calculator",
  metaDescription:
    "Free Lemon Squeezy fee calculator. Work out the 5% + 50¢ merchant-of-record fee (plus 1.5% on international cards) on any sale and exactly what you keep — tax compliance included.",
  h1: "Lemon Squeezy Fee Calculator",
  intro:
    "Calculate what Lemon Squeezy takes on a sale and what you keep. As a merchant of record, its 5% + 50¢ already includes payment processing and global tax compliance; international cards add 1.5%. Enter an amount or work backwards from a target payout.",

  keywords: {
    primary: "lemon squeezy fee calculator",
    secondary: [
      "lemon squeezy fees",
      "lemon squeezy pricing",
      "lemonsqueezy fees",
      "how much does lemon squeezy charge",
      "lemon squeezy transaction fees",
      "lemon squeezy merchant of record fees",
    ],
    longTail: [
      "lemon squeezy fee calculator with international fees",
      "lemon squeezy net payout calculator",
      "lemon squeezy vs paddle fees",
      "lemon squeezy vs stripe fees",
      "lemon squeezy fees on $100",
      "lemon squeezy 5% + 50 cents calculator",
      "lemon squeezy fees for digital products",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "mode",
      label: "What do you want to find?",
      type: "select",
      default: "charge",
      options: [
        { value: "charge", label: "I'm charging this amount" },
        { value: "net", label: "I want to keep this amount" },
      ],
    },
    {
      id: "amount",
      label: "Sale price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price your customer pays, or the amount you want to keep.",
    },
    {
      id: "international",
      label: "International (non-US) card",
      type: "toggle",
      default: false,
      help: "Lemon Squeezy adds 1.5% when the customer pays with a non-US card.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const intl = Boolean(values.international);
    const r = computeFlatFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: lemonSqueezyFees.percent,
      fixed: lemonSqueezyFees.fixed,
      extraPercent: intl ? lemonSqueezyFees.intlSurchargePercent : 0,
    });

    return {
      headline: {
        label: "You keep",
        display: ctx.formatCurrency(r.net),
        sub: `Effective fee ${ctx.formatPercent(r.effectiveRate)} — processing & tax compliance included`,
      },
      rows: [
        { label: "Sale price", display: ctx.formatCurrency(r.charge) },
        {
          label: `Lemon Squeezy fee (${ctx.formatPercent(r.ratePercent)} + ${ctx.formatCurrency(lemonSqueezyFees.fixed)})`,
          display: ctx.formatCurrency(r.totalFee),
          kind: "deduction",
          hint: intl ? `includes +${lemonSqueezyFees.intlSurchargePercent}% international card` : undefined,
        },
        { label: "You keep", display: ctx.formatCurrency(r.net), kind: "net" },
      ],
    };
  },

  howItWorks:
    "Lemon Squeezy is a merchant of record (MoR), so it sells your digital product to the customer on your behalf and handles the rest. Its base fee is 5% + 50¢ per transaction, which already includes card processing, fraud protection, and global sales-tax/VAT collection and remittance — you don't add a separate processing fee. When a customer pays with an international (non-US) card, Lemon Squeezy adds 1.5%, and certain features (subscriptions, PayPal, abandoned-cart recovery, affiliate orders) can add their own small surcharges.\n\nThe fee is: amount × 5% (+1.5% international) + $0.50. Because of the fixed 50¢, the effective rate is much higher on cheap products and approaches 5–6.5% on larger amounts. Switch to reverse mode to find what to price so you keep a target payout.\n\nLemon Squeezy was acquired by Stripe; the headline 5% + 50¢ rate is unchanged. These are standard published rates.",

  seoContent: `Our Lemon Squeezy fee calculator is a free tool that shows exactly what Lemon Squeezy takes on a sale and what you keep. Lemon Squeezy is a merchant of record (MoR) for digital products and software, popular with indie makers and small SaaS teams who want to sell globally without handling tax compliance themselves. Its fee bundles several things together and adds surcharges in some cases, so the real cost is easy to misjudge — this calculator makes it clear.

## What "merchant of record" means for the fee
Like Paddle, Lemon Squeezy is the legal seller of your product, not just a payment processor. That means its 5% + 50¢ base fee already includes card processing, fraud handling, and the calculation, collection and remittance of sales tax and VAT worldwide. You don't pay a separate Stripe fee on top, and you don't have to register for tax in dozens of jurisdictions. So comparing Lemon Squeezy's 5% against a plain processor's 2.9% isn't apples-to-apples — the processor's rate doesn't include the global tax compliance that an MoR handles for you.

## International cards and other surcharges
The headline 5% + 50¢ applies to standard US-card sales. When a customer pays with an international (non-US) card, Lemon Squeezy adds 1.5%, taking the effective rate to about 6.5% + 50¢ — toggle the international option above to see this. Lemon Squeezy also applies surcharges on some features: subscription payments and PayPal can add a small percentage, abandoned-cart recovery adds more, and affiliate-referred orders carry an additional cut. The base calculator here models the standard and international-card cases; the surcharge features are worth checking in your dashboard if you use them.

## How the fee is calculated
The math is: fee = sale price × 5% (plus 1.5% on international cards) + $0.50, and your payout = price − fee. Because of the fixed 50¢, low-priced products pay a much higher effective rate: a $5 sale costs $0.75 (15%), a $20 sale costs $1.50 (7.5%), and a $100 sale costs $5.50 (5.5%). The calculator shows the effective rate so you can see what each price point really costs. To net a specific amount, switch to reverse mode and it grosses the price up so your payout hits the target.

## Who this tool is for, and the Stripe acquisition
Indie developers, course creators and small SaaS teams use this to price products and model net revenue after Lemon Squeezy's cut. A common question is how Lemon Squeezy compares with Paddle: both are merchants of record at 5% + 50¢, so on a domestic sale they're identical — the difference is the international surcharge and add-ons, which our Paddle vs Lemon Squeezy calculator breaks down. Note that Stripe acquired Lemon Squeezy and has since introduced its own "Stripe Managed Payments" merchant-of-record product (also 5% + $0.50); Lemon Squeezy continues to operate, but if you're choosing for the long term it's worth weighing that direction too.

## Accuracy and important notes
Lemon Squeezy's base rate is 5% + 50¢ with a 1.5% international-card surcharge, and other feature surcharges can apply, so we store the rates in a dated file and stamp the page with a "fees last verified" date. The fee is genuinely all-in for an MoR — don't add a separate processing fee — but payout currency conversion and specific features can carry their own costs. Always confirm the final figure in your Lemon Squeezy dashboard before relying on it, but for fast, dependable estimates of what you'll keep on a sale, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "You sell a $100 digital product through Lemon Squeezy to a US customer.",
    steps: [
      { label: "Sale price", value: "$100.00" },
      { label: "Percentage fee (5%)", value: "$5.00" },
      { label: "Fixed fee", value: "$0.50" },
      { label: "Total Lemon Squeezy fee", value: "$5.50" },
    ],
    result: "You keep $94.50 (international card: $93.00)",
  },

  faqs: [
    {
      q: "How much does Lemon Squeezy charge?",
      a: "Lemon Squeezy charges a base 5% + 50¢ per transaction, which includes payment processing and global sales-tax/VAT compliance. International (non-US) cards add 1.5%. On a $100 US-card sale that's $5.50, leaving $94.50; on an international card it's $7.00, leaving $93.00.",
    },
    {
      q: "What are Lemon Squeezy's fees on $100?",
      a: "On a $100 sale paid by a US card, Lemon Squeezy charges 5% + 50¢ = $5.50, so you keep $94.50. With an international card the rate is 6.5% + 50¢ = $7.00, leaving $93.00. The effective rate is higher on cheaper products because of the fixed 50¢.",
    },
    {
      q: "Does Lemon Squeezy include tax compliance in its fee?",
      a: "Yes. As a merchant of record, Lemon Squeezy's fee includes calculating, collecting and remitting sales tax and VAT worldwide, plus card processing and fraud handling. That's why its 5% isn't directly comparable to a plain processor's 2.9%.",
    },
    {
      q: "Lemon Squeezy vs Paddle — which is cheaper?",
      a: "Both are merchants of record at 5% + 50¢, so on a domestic US sale they cost exactly the same. Lemon Squeezy adds 1.5% on international cards, where Paddle's flat rate can come out cheaper. See our Paddle vs Lemon Squeezy calculator for the side-by-side.",
    },
    {
      q: "Did the Stripe acquisition change Lemon Squeezy's fees?",
      a: "No. Stripe acquired Lemon Squeezy and the headline 5% + 50¢ rate is unchanged. Stripe has also launched its own merchant-of-record product (Stripe Managed Payments) at the same 5% + $0.50, which is worth considering for the long term.",
    },
  ],

  related: ["paddle-fee-calculator", "paddle-vs-lemon-squeezy-fee-calculator", "stripe-fee-calculator"],

  sources: [{ label: "Lemon Squeezy — fees", url: lemonSqueezyFees.source }],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-11",
};
