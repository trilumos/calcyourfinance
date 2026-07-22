import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { razorpayMethods, INDIA_GST_PERCENT, RAZORPAY_SOURCE } from "../../config/fees";
import { computeFlatFee } from "../../lib/flatFee";

export const razorpayFeeCalculator: CalculatorConfig = {
  slug: "razorpay-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "razorpay",
  title: "Razorpay Fee Calculator",
  metaDescription:
    "Free Razorpay fee calculator. Work out Razorpay's 2% platform fee (3% international) plus 18% GST and exactly what you receive in your settlement — per payment method, with a reverse mode.",
  h1: "Razorpay Fee Calculator",
  intro:
    "Calculate what Razorpay charges on a payment and what actually settles to your account. Razorpay's standard rate is 2% on domestic payments (3% international), plus 18% GST on the fee. Pick the payment method, or work backwards from a target settlement.",

  keywords: {
    primary: "razorpay fee calculator",
    secondary: [
      "razorpay charges calculator",
      "razorpay charges",
      "razorpay fees",
      "razorpay transaction charges",
      "razorpay charges per transaction",
      "razorpay fees calculator with gst",
      "how much does razorpay charge",
    ],
    longTail: [
      "razorpay charges on 1000",
      "razorpay charges on 1 lakh",
      "razorpay upi transaction charges",
      "razorpay net amount received calculator",
      "razorpay 2% fee calculator",
      "razorpay international transaction charges",
      "razorpay gst on fees",
      "razorpay settlement amount calculator",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: ["IN"], default: "IN" },

  inputs: [
    {
      id: "mode",
      label: "What do you want to find?",
      type: "select",
      default: "charge",
      options: [
        { value: "charge", label: "I'm collecting this amount" },
        { value: "net", label: "I want to settle this amount" },
      ],
    },
    {
      id: "amount",
      label: "Amount",
      type: "currency",
      default: 1000,
      min: 0,
      help: "The payment you collect, or the amount you want settled.",
    },
    {
      id: "method",
      label: "Payment method",
      type: "select",
      default: "domestic",
      options: razorpayMethods.map((m) => ({ value: m.id, label: m.label })),
      help: "Razorpay's 2% applies to domestic cards, UPI and netbanking alike — it's a platform fee, so UPI is not free.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const method = razorpayMethods.find((m) => m.id === values.method) ?? razorpayMethods[0]!;
    const r = computeFlatFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: method.percent,
      fixed: 0,
      taxOnFeePercent: INDIA_GST_PERCENT,
    });

    return {
      headline: {
        label: "You receive",
        display: ctx.formatCurrency(r.net),
        sub: `Effective fee ${ctx.formatPercent(r.effectiveRate)} of the payment`,
      },
      rows: [
        { label: "Payment collected", display: ctx.formatCurrency(r.charge) },
        {
          label: `Razorpay fee (${ctx.formatPercent(method.percent)})`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: `GST on fee (${ctx.formatPercent(INDIA_GST_PERCENT)})`,
          display: ctx.formatCurrency(r.taxOnFee),
          kind: "deduction",
        },
        { label: "You receive", display: ctx.formatCurrency(r.net), kind: "net" },
      ],
    };
  },

  howItWorks:
    "Razorpay charges a flat platform fee on every successful payment — 2% on standard domestic methods (cards, UPI, netbanking and wallets alike), 2.15% on corporate cards, and 3% on international or Amex/Diners cards. On top of that, 18% GST is charged on the fee itself (not on the transaction), so an effective 2% works out to about 2.36% all-in.\n\nThe fee is: amount × rate%, then 18% GST on that fee. There's no fixed per-transaction fee and no setup or annual fee on the standard plan. Importantly, the 2% is a platform fee, so it applies even to UPI — UPI's zero-MDR rule means banks don't charge merchants, but Razorpay still levies its 2% for the gateway.\n\nTo find what to collect so a specific amount settles to your account, switch to reverse mode. These are Razorpay's published standard rates; high-volume businesses can negotiate custom pricing.",

  seoContent: `Our Razorpay fee calculator is a free, instant tool that shows exactly how much Razorpay deducts from a payment and what finally settles into your bank account. Razorpay is one of India's most popular payment gateways, used by everyone from solo founders to large businesses — but between the platform fee and GST, the amount you actually receive is noticeably less than the amount collected. Enter the payment, pick the method, and see the fee and your net settlement instantly.

## How Razorpay's fee works
Razorpay charges a percentage of every successful payment as a platform fee. The standard rate is 2% for domestic payments — and this is the same whether the customer pays by card, UPI, netbanking or wallet. Corporate and business cards are 2.15%, and international cards (along with American Express and Diners) are charged 3%. There is no fixed per-transaction fee and no setup or annual maintenance charge on the standard plan. On top of the platform fee, the government levies 18% GST on the fee itself, which the calculator shows as a separate line so you can see the true all-in cost.

## Why UPI isn't free on Razorpay
A common misconception is that UPI payments are free for merchants. The government's zero-MDR rule does mean banks can't charge a merchant discount rate on UPI and RuPay, but a payment gateway like Razorpay still charges its own platform fee for providing the technology, settlement, dashboard and support — so on Razorpay, UPI is charged the same 2% as cards. This calculator reflects that, because assuming UPI is free is exactly where merchants under-estimate their costs. (If you want a gateway where UPI genuinely is free, that's where Paytm's small-merchant tier differs — worth comparing.)

## How the calculator works
The math is straightforward: fee = amount × rate%, then GST = fee × 18%, and your settlement = amount − fee − GST. On a ₹1,000 domestic payment, that's a ₹20 fee plus ₹3.60 GST, so ₹976.40 settles to you — an effective 2.36%. The fixed-fee-free structure means small and large payments cost the same percentage, which makes Razorpay simple to reason about. If you need a specific amount to settle — say you're invoicing a client for an exact figure — switch to reverse mode and the calculator grosses the collection up so the right amount lands after fees and GST.

## Who this tool is for
Indian startups and SaaS founders use it to understand the gap between revenue collected and cash settled; e-commerce sellers use it to price products so margins survive the gateway fee; freelancers and agencies invoicing clients through Razorpay use the reverse mode to collect the right amount; and finance teams use it to reconcile settlements. Because it runs entirely in your browser with no signup, it's fast and private, and works on a phone.

## Accuracy and important notes
Razorpay updates its pricing periodically and offers negotiated rates to high-volume businesses, so we store every rate in a dated file and stamp the page with a "fees last verified" date. The 18% GST is a statutory charge on the fee and applies to virtually all merchants. Remember these are standard published rates — your account may qualify for custom pricing, and additional charges such as instant settlement, payment links or specific methods can carry their own fees. Always confirm the final figure in your Razorpay dashboard before relying on it, but for fast, dependable estimates of what you'll actually receive, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "A customer pays you ₹1,000 by UPI or card through Razorpay.",
    steps: [
      { label: "Payment collected", value: "₹1,000.00" },
      { label: "Razorpay fee (2%)", value: "₹20.00" },
      { label: "GST on fee (18%)", value: "₹3.60" },
      { label: "Total deducted", value: "₹23.60" },
    ],
    result: "You receive ₹976.40",
  },

  faqs: [
    {
      q: "How much does Razorpay charge per transaction?",
      a: "Razorpay charges a 2% platform fee on standard domestic payments (cards, UPI, netbanking and wallets), 2.15% on corporate cards, and 3% on international/Amex/Diners cards, plus 18% GST on the fee. There's no fixed per-transaction fee and no setup fee. On ₹1,000 domestic that's ₹20 + ₹3.60 GST = ₹23.60.",
    },
    {
      q: "What are Razorpay's charges on ₹1,000?",
      a: "On a ₹1,000 domestic payment, Razorpay charges 2% = ₹20 plus 18% GST on the fee = ₹3.60, a total of ₹23.60, so ₹976.40 settles to you. Use the calculator above for other amounts and methods.",
    },
    {
      q: "Is UPI free on Razorpay?",
      a: "No. While the government's zero-MDR rule stops banks charging a merchant fee on UPI, Razorpay still charges its 2% platform fee for the gateway, so UPI costs the same as cards on Razorpay. Paytm's small-merchant tier is one option where UPI is genuinely 0%.",
    },
    {
      q: "Does Razorpay charge GST on its fees?",
      a: "Yes. 18% GST is charged on Razorpay's fee (not on the transaction amount), which the calculator shows as a separate line. So an effective 2% fee is about 2.36% once GST is included.",
    },
    {
      q: "How do I work out what to collect so an exact amount settles?",
      a: "Switch the calculator to 'I want to settle this amount.' It grosses up the collection so the right figure lands after the fee and GST — useful when invoicing a client for a precise amount.",
    },
  ],

  related: ["paytm-fee-calculator", "stripe-fee-calculator", "paypal-fee-calculator"],

  sources: [{ label: "Razorpay — pricing", url: RAZORPAY_SOURCE }],

  feesVerifiedOn: "2026-07-22",
  lastUpdated: "2026-06-11",
};
