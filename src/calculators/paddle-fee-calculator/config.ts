import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { paddleFees } from "../../config/fees";
import { computeFlatFee } from "../../lib/flatFee";

export const paddleFeeCalculator: CalculatorConfig = {
  slug: "paddle-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "paddle",
  title: "Paddle Fee Calculator",
  metaDescription:
    "Free Paddle fee calculator. Work out Paddle's 5% + $0.50 merchant-of-record fee on any sale and exactly what you keep — payment processing and global tax compliance included, with a reverse mode.",
  h1: "Paddle Fee Calculator",
  intro:
    "Calculate what Paddle takes on a sale and what you keep. Paddle is a merchant of record, so its 5% + $0.50 already includes payment processing and global sales-tax/VAT compliance — there's no separate Stripe fee to add. Enter an amount or work backwards from a target payout.",

  keywords: {
    primary: "paddle fee calculator",
    secondary: [
      "paddle fees",
      "paddle pricing",
      "paddle merchant of record fees",
      "paddle transaction fees",
      "how much does paddle charge",
      "paddle saas fees",
    ],
    longTail: [
      "paddle 5% + 50 cents calculator",
      "paddle fee calculator with vat",
      "paddle vs lemon squeezy fees",
      "paddle subscription fees",
      "paddle fees on $100",
      "paddle net payout calculator",
      "paddle fees for digital products",
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
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const r = computeFlatFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: paddleFees.percent,
      fixed: paddleFees.fixed,
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
          label: `Paddle fee (${ctx.formatPercent(paddleFees.percent)} + ${ctx.formatCurrency(paddleFees.fixed)})`,
          display: ctx.formatCurrency(r.totalFee),
          kind: "deduction",
        },
        { label: "You keep", display: ctx.formatCurrency(r.net), kind: "net" },
      ],
    };
  },

  howItWorks:
    "Paddle is a merchant of record (MoR), which means it sells your software or digital product to the customer on your behalf and handles everything in between. Its fee is 5% + $0.50 per transaction, and — crucially — that single fee already includes card processing, fraud protection, and the calculation, collection and remittance of sales tax and VAT worldwide. You do not add a separate Stripe or PayPal processing fee on top; the 5% + $0.50 is the all-in cost.\n\nThe fee is: amount × 5% + $0.50. Because of the $0.50 fixed component, the effective rate is much higher on cheap products — on a $5 sale the fee is $0.75, or 15% — and approaches 5% on larger amounts. Switch to reverse mode to find what to price so you keep a target payout.\n\nThis is Paddle's standard pay-as-you-go rate; products under $10 and large companies are directed to custom pricing. There's no monthly, setup or payout fee.",

  seoContent: `Our Paddle fee calculator is a free tool that shows exactly what Paddle takes on a sale and what lands in your payout. Paddle is a merchant of record (MoR) for software and digital products, which makes it popular with SaaS founders and indie developers who want to sell globally without becoming tax-compliance experts. But because Paddle's fee bundles several things together, it's easy to misjudge the real cost — this calculator makes it clear. Enter your price and see the fee and your net instantly.

## What "merchant of record" means for the fee
The most important thing to understand about Paddle is that it isn't just a payment processor — it's the legal seller of your product. That means Paddle's 5% + $0.50 fee already includes card processing, fraud and chargeback handling, and the calculation, collection and remittance of sales tax and VAT in every country you sell to. With a plain payment gateway you'd pay a processing fee and then separately handle global tax compliance yourself (or pay another service for it); with Paddle, it's one fee. So when you compare Paddle's 5% against a processor's 2.9%, you're not comparing like with like — the processor's number doesn't include tax compliance, which for a global software business is a significant hidden cost and risk.

## How the fee is calculated
The math is simple: fee = sale price × 5% + $0.50, and your payout = price − fee. Because of the fixed $0.50, the effective rate is much higher on low-priced products: a $5 sale costs $0.75 (15%), a $20 sale costs $1.50 (7.5%), and a $100 sale costs $5.50 (5.5%), approaching the headline 5% as prices rise. The calculator shows the effective rate so you can see exactly what a given price point costs. If you sell subscriptions or one-off products and want to net a specific amount, switch to reverse mode and it grosses the price up so your payout hits the target.

## Who this tool is for
SaaS founders use it to model net revenue after Paddle's cut; indie developers and digital-product creators use it to price products so the fixed fee doesn't eat small sales; and finance teams use it to reconcile payouts. A frequent question is "Paddle vs Lemon Squeezy" — both are merchants of record at 5% + $0.50, so on a domestic sale they cost the same; the difference shows up on international cards and add-ons, which our comparison calculator breaks down. Everything runs in your browser with no signup.

## Accuracy and important notes
Paddle's standard rate is 5% + $0.50, but products under $10 and large or scaling companies are directed to custom pricing, so we store the rate in a dated file and stamp the page with a "fees last verified" date. Remember the fee is genuinely all-in for an MoR — it would be a mistake to add a separate processing fee on top — but currency conversion on payouts and specific billing features can carry their own costs. Always confirm the final figure in your Paddle dashboard before relying on it, but for fast, dependable estimates of what you'll keep on a sale, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "You sell a $100 software licence through Paddle.",
    steps: [
      { label: "Sale price", value: "$100.00" },
      { label: "Percentage fee (5%)", value: "$5.00" },
      { label: "Fixed fee", value: "$0.50" },
      { label: "Total Paddle fee", value: "$5.50" },
    ],
    result: "You keep $94.50",
  },

  faqs: [
    {
      q: "How much does Paddle charge?",
      a: "Paddle charges 5% + $0.50 per transaction on its standard plan. That single fee includes card processing, fraud protection and global sales-tax/VAT compliance, so there's no separate processing fee to add. On a $100 sale that's $5.50, leaving $94.50.",
    },
    {
      q: "What are Paddle's fees on $100?",
      a: "On a $100 sale, Paddle charges 5% + $0.50 = $5.50, so you keep $94.50 — an effective 5.5%. The effective rate is higher on cheaper products (15% on a $5 sale) because of the fixed $0.50, and approaches 5% on larger sales.",
    },
    {
      q: "Is Paddle's 5% expensive compared to Stripe's 2.9%?",
      a: "They're not directly comparable. Paddle is a merchant of record, so its 5% + $0.50 includes global sales-tax/VAT compliance that Stripe's 2.9% + $0.30 does not. For a global software business, handling tax yourself (or paying a separate service) can easily close that gap.",
    },
    {
      q: "Does Paddle charge a monthly or setup fee?",
      a: "No. Paddle's standard plan has no monthly, setup or payout fee — you only pay 5% + $0.50 per transaction. Products under $10 and large companies are directed to custom pricing.",
    },
    {
      q: "Paddle vs Lemon Squeezy — which is cheaper?",
      a: "Both are merchants of record at 5% + $0.50, so on a domestic sale they cost exactly the same. The difference appears on international cards (Lemon Squeezy adds 1.5%) and certain add-ons. See our Paddle vs Lemon Squeezy calculator for the side-by-side.",
    },
  ],

  related: ["lemon-squeezy-fee-calculator", "paddle-vs-lemon-squeezy-fee-calculator", "stripe-fee-calculator"],

  sources: [{ label: "Paddle — pricing", url: paddleFees.source }],

  feesVerifiedOn: "2026-06-11",
  lastUpdated: "2026-06-11",
};
