import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { venmoFees } from "../../config/fees";
import { computeFlatFee } from "../../lib/flatFee";

export const venmoFeeCalculator: CalculatorConfig = {
  slug: "venmo-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "venmo",
  title: "Venmo Fee Calculator",
  metaDescription:
    "Free Venmo fee calculator. Work out Venmo's business profile (1.9% + $0.10), Goods & Services (2.99%) and instant transfer fees and exactly what you keep, with a reverse mode.",
  h1: "Venmo Fee Calculator",
  intro:
    "Calculate what Venmo takes on a payment and what you actually keep. Choose the payment type — business profile, Goods & Services, or an instant transfer — or work backwards to see what to charge so you receive a target amount after Venmo's fees.",

  keywords: {
    primary: "venmo fee calculator",
    secondary: [
      "venmo fees calculator",
      "venmo business fees",
      "venmo goods and services fee",
      "venmo transaction fees",
      "calculate venmo fees",
      "venmo seller fees",
      "venmo instant transfer fee",
      "how much does venmo charge",
    ],
    longTail: [
      "venmo fees on $100",
      "venmo business fee calculator",
      "venmo goods and services fee calculator",
      "venmo 1.9% + $0.10 calculator",
      "how much does venmo charge for business",
      "venmo instant transfer fee calculator",
      "venmo seller fee on $100",
      "does venmo charge a fee to receive money",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: ["US"], default: "US" },

  inputs: [
    {
      id: "mode",
      label: "What do you want to find?",
      type: "select",
      default: "charge",
      options: [
        { value: "charge", label: "I'm receiving this amount" },
        { value: "net", label: "I want to keep this amount" },
      ],
    },
    {
      id: "amount",
      label: "Amount",
      type: "currency",
      default: 100,
      min: 0,
      help: "The payment amount, or the amount you want to keep.",
    },
    {
      id: "txType",
      label: "Payment type",
      type: "select",
      default: "business",
      options: [
        { value: "business", label: "Business profile payment" },
        { value: "goods", label: "Goods & Services (personal account)" },
        { value: "instant", label: "Instant transfer (cash out)" },
      ],
      help: "Business profiles pay 1.9% + $0.10; a Goods & Services flag on a personal account is 2.99%.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const fees = venmoFees[ctx.country] ?? venmoFees.US!;
    const variant = fees.variants.find((v) => v.id === values.txType) ?? fees.variants[0];

    const r = computeFlatFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: variant.percent,
      fixed: variant.fixed,
    });

    return {
      headline: {
        label: "You receive",
        display: ctx.formatCurrency(r.net),
        sub: `Effective fee ${ctx.formatPercent(r.effectiveRate)} of the payment`,
      },
      rows: [
        { label: "Payment amount", display: ctx.formatCurrency(r.charge) },
        {
          label: `Venmo fee (${ctx.formatPercent(variant.percent)}${variant.fixed > 0 ? ` + ${ctx.formatCurrency(variant.fixed)}` : ""})`,
          display: ctx.formatCurrency(r.totalFee),
          kind: "deduction",
        },
        { label: "You receive", display: ctx.formatCurrency(r.net), kind: "net" },
      ],
    };
  },

  howItWorks:
    "Venmo charges a fee on commercial payments — money you receive through a business profile, or a payment a sender marks as Goods & Services. A business profile pays 1.9% + $0.10 per payment, while a Goods & Services payment on a personal account costs 2.99%. Cashing out instantly to your bank or debit card is a separate 1.75% (minimum $0.25, maximum $25); a standard transfer is free and takes 1–3 days.\n\nThe fee is: amount × rate% + fixed fee. Pick the payment type above and the calculator applies the matching rate. To find what to ask for so you keep a target amount, switch to reverse mode: charge = (target + fixed) ÷ (1 − rate).\n\nVenmo is a US-only service owned by PayPal. Sending money to friends and family from your balance, bank, or debit card is free; paying with a credit card adds 3%. These fees apply to commercial activity, which is what this calculator covers.",

  seoContent: `Our Venmo fee calculator is a free, instant tool that shows exactly how much Venmo deducts from a payment and how much you actually keep. Venmo started as a way to split bills with friends, but it's now widely used by small businesses, sellers, and creators to get paid — and once money becomes commercial, Venmo takes a cut. This calculator removes the guesswork: choose how you're getting paid, enter the amount, and see your net and the effective fee instantly.

## Venmo's fees depend on how you get paid
The most important thing to understand is that Venmo only charges on commercial payments, and the rate depends on the type. A Venmo business profile — the official way for a business to accept Venmo — pays 1.9% plus a $0.10 fixed fee on each payment received. If you use a personal account and a sender marks the payment as "Goods & Services" (which gives them purchase protection), the seller is charged 2.99% instead, with no fixed fee. Ordinary payments between friends and family, funded by your Venmo balance, a linked bank account, or a debit card, remain free. Paying with a credit card adds a 3% sender fee. Choosing the right payment type above makes the result match exactly what Venmo will deduct.

## How the fee is calculated
The math is simple: fee = (amount × rate%) + fixed fee, and your net is the amount minus that fee. For a business profile the fixed $0.10 matters most on small payments — on a $5 sale it's already 2% before the percentage applies — which is why the effective rate on small amounts is higher than the headline number. The calculator surfaces this effective rate so you can see the true cost. If you need to receive an exact amount after fees, switch to reverse mode and it grosses the request up using charge = (target + fixed) ÷ (1 − rate).

## Cashing out: instant vs standard
Receiving money is only half the story — getting it to your bank has its own cost. A standard transfer out of Venmo is free but takes one to three business days. An instant transfer to an eligible debit card or bank account costs 1.75% (with a $0.25 minimum and a $25 maximum). If you select "Instant transfer" above, the calculator shows what that convenience costs on your balance. Many sellers leave funds to settle via the free standard transfer and only pay for instant when they need the cash immediately.

## Who this tool is for
Freelancers, tutors, and service providers who accept Venmo use it to price work so they keep enough after fees. Online and social sellers use it to understand the cost of a Goods & Services payment versus a business profile. Creators taking tips and small businesses at markets use it to estimate true take-home. Because the calculator runs entirely in your browser with no signup and no data leaving your device, it's fast, private, and works on your phone at the point of sale.

## Accuracy and important notes
Venmo is a US-only service owned by PayPal, and its fees can change, so we store every rate in a dated source file and stamp the page with a "fees last verified" date. Treat the results as estimates of standard published rates: business eligibility, certain promotions, and edge cases can vary, and additional costs such as refunds (where fees may not be returned) or chargebacks can apply. Note too that using a personal account for ongoing business is against Venmo's user agreement — a business profile is the compliant route. Always confirm the final figure in your Venmo account before relying on it, but for quick, dependable estimates of what you'll actually keep, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "A customer pays your Venmo business profile $100.",
    steps: [
      { label: "Payment amount", value: "$100.00" },
      { label: "Percentage fee (1.9%)", value: "$1.90" },
      { label: "Fixed fee", value: "$0.10" },
      { label: "Total Venmo fee", value: "$2.00" },
    ],
    result: "You receive $98.00",
  },

  faqs: [
    {
      q: "How much does Venmo charge for business?",
      a: "A Venmo business profile is charged 1.9% + $0.10 per payment received. On a $100 payment that's $2.00, so you keep $98.00. A Goods & Services payment on a personal account is charged 2.99% instead.",
    },
    {
      q: "What are Venmo's fees on $100?",
      a: "Through a business profile, $100 costs 1.9% + $0.10 = $2.00, leaving $98.00. As a personal-account Goods & Services payment it's 2.99% = $2.99, leaving $97.01. Use the calculator above for other amounts and types.",
    },
    {
      q: "Does Venmo charge a fee to receive money?",
      a: "Only for commercial payments. Money received through a business profile (1.9% + $0.10) or flagged Goods & Services (2.99%) is charged a fee. Personal payments from friends and family funded by balance, bank, or debit card are free.",
    },
    {
      q: "How much is Venmo's instant transfer fee?",
      a: "Instant transfers to an eligible bank or debit card cost 1.75% of the amount, with a $0.25 minimum and a $25 maximum. A standard transfer is free but takes 1–3 business days. Select 'Instant transfer' above to estimate it.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch the calculator to 'I want to keep this amount.' It grosses up the request using charge = (target + fixed) ÷ (1 − rate). For example, to keep $100 through a business profile you'd ask for about $102.04.",
    },
  ],

  related: ["paypal-fee-calculator", "cashapp-fee-calculator", "paypal-vs-venmo-fee-calculator", "cashapp-vs-venmo-fee-calculator"],

  sources: [
    { label: "Venmo — our fees", url: "https://venmo.com/resources/our-fees" },
    { label: "Venmo — business profile transaction fees", url: "https://help.venmo.com/cs/articles/business-profile-transaction-fees-vhel221" },
  ],

  feesVerifiedOn: "2026-06-10",
  lastUpdated: "2026-06-10",
};
