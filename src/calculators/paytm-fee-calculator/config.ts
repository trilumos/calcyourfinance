import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { paytmMethods, INDIA_GST_PERCENT, PAYTM_SOURCE } from "../../config/fees";
import { computeFlatFee } from "../../lib/flatFee";

export const paytmFeeCalculator: CalculatorConfig = {
  slug: "paytm-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "paytm",
  title: "Paytm Payment Gateway Fee Calculator",
  metaDescription:
    "Free Paytm Payment Gateway fee calculator. Work out Paytm's merchant charges by method — UPI free, debit 0.4%, credit 1.99%, international 2.99% — plus 18% GST, and what you receive.",
  h1: "Paytm Payment Gateway Fee Calculator",
  intro:
    "Calculate what the Paytm Payment Gateway charges merchants and what actually settles to you. UPI and RuPay debit are free; cards range from 0.4% to 3.5% plus 18% GST. Pick the payment method, or work backwards from a target settlement.",

  keywords: {
    primary: "paytm payment gateway fees calculator",
    secondary: [
      "paytm fee calculator",
      "paytm payment gateway charges",
      "paytm merchant charges",
      "paytm payment gateway charges per transaction",
      "paytm charges calculator",
      "how much does paytm charge merchants",
    ],
    longTail: [
      "paytm payment gateway charges percentage",
      "paytm merchant charges for credit card",
      "paytm merchant charges for upi",
      "paytm vs razorpay charges",
      "paytm gateway charges on 1000",
      "is paytm upi free for merchants",
      "paytm international transaction charges",
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
      default: "credit",
      options: paytmMethods.map((m) => ({ value: m.id, label: m.label })),
      help: "On Paytm's small-merchant tier, UPI and RuPay debit are free; other methods carry a fee plus 18% GST.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const method = paytmMethods.find((m) => m.id === values.method) ?? paytmMethods[0]!;
    const r = computeFlatFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: method.percent,
      fixed: 0,
      taxOnFeePercent: INDIA_GST_PERCENT,
    });

    const rows: CalcResult["rows"] = [
      { label: "Payment collected", display: ctx.formatCurrency(r.charge) },
    ];
    if (r.processingFee > 0) {
      rows.push(
        {
          label: `Paytm fee (${ctx.formatPercent(method.percent)})`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: `GST on fee (${ctx.formatPercent(INDIA_GST_PERCENT)})`,
          display: ctx.formatCurrency(r.taxOnFee),
          kind: "deduction",
        },
      );
    }
    rows.push({ label: "You receive", display: ctx.formatCurrency(r.net), kind: "net" });

    return {
      headline: {
        label: "You receive",
        display: ctx.formatCurrency(r.net),
        sub: r.totalFee > 0 ? `Effective fee ${ctx.formatPercent(r.effectiveRate)} of the payment` : "No gateway fee on this method",
      },
      rows,
    };
  },

  howItWorks:
    "The Paytm Payment Gateway charges merchants a fee that depends entirely on how the customer pays. On Paytm's small-merchant tier, UPI and RuPay debit cards are free (0%). Visa and Mastercard debit cards are 0.4%, credit cards are 1.99% (lower for some categories like groceries and utilities), American Express is 2.75%, Diners/JCB/UnionPay are 3.5%, and international cards are 2.99%. Wherever a fee applies, 18% GST is added on the fee itself.\n\nThe fee is: amount × rate%, then 18% GST on that fee. There's no setup or annual maintenance fee. Because UPI is free, steering customers to UPI can save you the card fee entirely — a real advantage over gateways that charge a flat platform fee on UPI.\n\nTo find what to collect so a specific amount settles, switch to reverse mode. These are Paytm's standard small-merchant rates (turnover under ₹20 lakh); larger merchants and negotiated plans can differ.",

  seoContent: `Our Paytm Payment Gateway fee calculator is a free tool that shows exactly what Paytm charges merchants on a payment and what settles to your account. Paytm is one of India's most widely used payment gateways, and its biggest draw for small businesses is simple: UPI and RuPay payments are free. But card payments carry a fee that varies a lot by card type, so the real cost depends on how your customers pay. Pick the method, enter the amount, and see the fee and your net instantly.

## Paytm's fee depends on the payment method
Unlike a flat-rate gateway, Paytm prices each method differently. On the small-merchant tier (for businesses with prior-year turnover under ₹20 lakh), UPI and RuPay debit cards are completely free. Visa and Mastercard debit cards are charged 0.4%, standard credit cards 1.99% (some categories such as groceries, utilities and education are lower at 1.2–1.4%), American Express 2.75%, Diners/JCB/UnionPay 3.5%, and international cards 2.99%. On every method that carries a fee, 18% GST is added to the fee. Choosing the right method above makes the result match what Paytm will actually deduct.

## Why free UPI matters
The single biggest cost lever on Paytm is that UPI is free. India's zero-MDR rule means no merchant discount rate on UPI, and on Paytm's small-merchant tier the gateway passes that through — so a UPI payment costs you nothing, while the same payment on a card could cost 2% or more. This is a genuine difference from gateways like Razorpay, which charge their own platform fee (around 2%) even on UPI. If most of your customers pay by UPI, Paytm can be materially cheaper; the calculator lets you see exactly how much each method costs so you can encourage the cheapest one.

## How the calculator works
The math is simple: fee = amount × rate%, then GST = fee × 18%, and your settlement = amount − fee − GST. On a ₹1,000 credit-card payment, that's ₹19.90 plus ₹3.58 GST, so ₹976.52 settles to you; the same ₹1,000 by UPI settles in full at ₹1,000. There's no fixed per-transaction fee. If you need a specific amount to land — for example invoicing a client for an exact figure — switch to reverse mode and the calculator grosses the collection up so the right amount settles after the fee and GST.

## Who this tool is for
Indian merchants and e-commerce sellers use it to understand which payment methods cost what, and to price products so margins survive card fees; founders use it to model the blended cost of their payment mix; and finance teams use it to reconcile settlements. Comparing Paytm against Razorpay on the same payment is a common question — the key difference is UPI (free on Paytm's small-merchant tier, ~2% on Razorpay) — and this calculator makes that gap concrete. Everything runs in your browser with no signup.

## Accuracy and important notes
Paytm's rates depend on your merchant tier (the ₹20 lakh turnover threshold) and can change, so we store every rate in a dated file and stamp the page with a "fees last verified" date. The 18% GST on the fee is standard for Indian gateways. These are published small-merchant rates — larger merchants, specific categories and negotiated plans can differ, and add-ons can carry their own charges. Always confirm the final figure in your Paytm dashboard before relying on it, but for fast, dependable estimates of what you'll receive, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "A customer pays you ₹1,000 by credit card through the Paytm Payment Gateway.",
    steps: [
      { label: "Payment collected", value: "₹1,000.00" },
      { label: "Paytm fee (1.99%)", value: "₹19.90" },
      { label: "GST on fee (18%)", value: "₹3.58" },
      { label: "Total deducted", value: "₹23.48" },
    ],
    result: "You receive ₹976.52 (UPI would be free)",
  },

  faqs: [
    {
      q: "What are Paytm Payment Gateway charges?",
      a: "On Paytm's small-merchant tier, UPI and RuPay debit are free; Visa/Mastercard debit is 0.4%, credit cards 1.99%, Amex 2.75%, Diners/JCB/UnionPay 3.5%, and international cards 2.99% — plus 18% GST on the fee. There's no setup fee.",
    },
    {
      q: "Is Paytm UPI free for merchants?",
      a: "Yes, on the small-merchant tier UPI and RuPay debit are free (0%). India's zero-MDR rule means no merchant fee on UPI, and Paytm passes that through — unlike some gateways that charge a platform fee on UPI. Card payments do carry a fee.",
    },
    {
      q: "What are Paytm's charges on ₹1,000?",
      a: "By UPI, ₹1,000 is free — you receive ₹1,000. By credit card it's 1.99% = ₹19.90 plus 18% GST = ₹3.58, so ₹976.52 settles. By debit card it's just 0.4% + GST. Use the calculator above for each method.",
    },
    {
      q: "Paytm vs Razorpay — which is cheaper?",
      a: "It depends on your payment mix. The big difference is UPI: free on Paytm's small-merchant tier, but charged ~2% as a platform fee on Razorpay. For card payments the rates are broadly similar. If most customers pay by UPI, Paytm is usually cheaper.",
    },
    {
      q: "Does Paytm charge GST on its fees?",
      a: "Yes, 18% GST applies on the gateway fee (not the transaction) for methods that carry a fee. Free methods like UPI have no fee and therefore no GST. The calculator shows GST as a separate line.",
    },
  ],

  related: ["razorpay-fee-calculator", "stripe-fee-calculator", "paypal-fee-calculator"],

  sources: [{ label: "Paytm — payment gateway pricing", url: PAYTM_SOURCE }],

  feesVerifiedOn: "2026-06-11",
  lastUpdated: "2026-06-11",
};
