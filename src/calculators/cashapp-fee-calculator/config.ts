import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { cashappFees } from "../../config/fees";
import { computeFlatFee } from "../../lib/flatFee";

export const cashappFeeCalculator: CalculatorConfig = {
  slug: "cashapp-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "cashapp",
  title: "Cash App Fee Calculator",
  metaDescription:
    "Free Cash App fee calculator. Work out Cash App's business fee (2.75%), instant deposit (up to 1.75%) and credit-card fees and exactly what you keep, with a reverse mode.",
  h1: "Cash App Fee Calculator",
  intro:
    "Calculate what Cash App takes on a payment and what you actually keep. Choose the payment type — business payment, instant deposit, or a credit-card-funded send — or work backwards to find what to charge so you receive a target amount after Cash App's fees.",

  keywords: {
    primary: "cash app fee calculator",
    secondary: [
      "cashapp fee calculator",
      "cash app business fees",
      "cash app transaction fees",
      "calculate cash app fees",
      "cash app fees calculator",
      "cash app instant deposit fee",
      "how much does cash app charge",
      "cash app 2.75% calculator",
    ],
    longTail: [
      "cash app fees on $100",
      "cash app business fee calculator",
      "how much does cash app charge for business",
      "cash app instant deposit fee calculator",
      "cash app credit card fee",
      "cash app fee on $1000",
      "does cash app charge a fee to receive money",
      "cash app for business fee 2.75",
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
        { value: "business", label: "Business account payment" },
        { value: "instant", label: "Instant deposit (cash out)" },
        { value: "creditcard", label: "Sent with a credit card" },
      ],
      help: "Business accounts pay 2.75% per payment received. Instant deposit is up to 1.75%; standard deposit is free.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const fees = cashappFees[ctx.country] ?? cashappFees.US!;
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
          label: `Cash App fee (${ctx.formatPercent(variant.percent)}${variant.fixed > 0 ? ` + ${ctx.formatCurrency(variant.fixed)}` : ""})`,
          display: ctx.formatCurrency(r.totalFee),
          kind: "deduction",
        },
        { label: "You receive", display: ctx.formatCurrency(r.net), kind: "net" },
      ],
    };
  },

  howItWorks:
    "Cash App charges a fee on commercial activity. A Cash App for Business account pays 2.75% on each payment it receives, with no fixed fee. Cashing out instantly to a linked bank or debit card costs 0.5%–1.75% (with a $0.25 minimum); a standard deposit is free and takes 1–3 business days. Sending money funded by a credit card adds 3%.\n\nThe fee is: amount × rate%. Pick the payment type above and the calculator applies the matching rate. To find what to ask for so you keep a target amount, switch to reverse mode: charge = target ÷ (1 − rate).\n\nCash App is a US-only service from Block (the company behind Square). Personal payments between individuals funded by a Cash App balance, a linked bank, or a debit card are free; the fees here apply to business payments, instant cash-outs, and credit-card-funded sends.",

  seoContent: `Our Cash App fee calculator is a free, instant tool that shows exactly how much Cash App deducts from a payment and how much you actually keep. Cash App is hugely popular for sending money between friends, but more and more small businesses, sellers, and creators use it to get paid — and once a payment is commercial, Cash App takes a cut. Enter an amount, choose how you're getting paid, and see your net payout and the effective fee instantly.

## When Cash App charges a fee
The key thing to understand is that personal payments between individuals are free, but commercial activity is not. A Cash App for Business account is charged 2.75% on every payment it receives — a flat percentage with no fixed per-transaction fee, which makes Cash App simple to reason about compared with processors that add a fixed cents charge. Sending money funded by a linked bank account, a Cash App balance, or a debit card is free for personal use, while paying with a credit card adds a 3% fee. Choosing the right payment type above makes the result match exactly what Cash App will deduct.

## How the fee is calculated
Because the business rate is a flat 2.75% with no fixed fee, the math is straightforward: fee = amount × 2.75%, and your net is the amount minus that fee. On a $100 business payment that's $2.75, so you keep $97.25; on $1,000 it's $27.50. The absence of a fixed fee means small payments aren't penalized the way they are on platforms that add a flat cents charge — so Cash App can be attractive for low-value sales. If you need to receive an exact amount after fees, switch to reverse mode and the calculator grosses the charge up using charge = target ÷ (1 − rate).

## Instant deposit vs standard deposit
Getting your money out has its own cost. A standard deposit from Cash App to your linked bank is free but takes one to three business days. An instant deposit to an eligible debit card or bank account costs between 0.5% and 1.75% (with a $0.25 minimum), depending on the destination. If you select "Instant deposit" above, the calculator estimates that cost using the upper 1.75% figure so you see a conservative number. Many sellers use the free standard deposit and only pay for instant when they need funds immediately.

## Who this tool is for
Freelancers and gig workers who accept Cash App use it to price work so they keep enough after the 2.75% business fee. Social and marketplace sellers use it to check margins before listing. Creators taking tips and small vendors at events use it to estimate true take-home and to decide whether an instant cash-out is worth the fee. Everything runs in your browser with no signup and no data leaving your device, so it's fast, private, and works on a phone wherever you sell.

## Accuracy and important notes
Cash App is a US-only service from Block (the company behind Square), and its fees can change, so we keep every rate in a dated source file and stamp the page with a "fees last verified" date. Treat the results as estimates of standard published rates: business eligibility, promotions, and edge cases can vary, and additional costs such as refunds or disputes can apply. Using a personal account for ongoing business is against Cash App's terms — a Cash App for Business account is the compliant route and the one this calculator assumes for the 2.75% rate. Always confirm the final number in your Cash App account before relying on it, but for quick, dependable estimates of what you'll actually keep, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "A customer pays your Cash App for Business account $100.",
    steps: [
      { label: "Payment amount", value: "$100.00" },
      { label: "Business fee (2.75%)", value: "$2.75" },
      { label: "Fixed fee", value: "$0.00" },
      { label: "Total Cash App fee", value: "$2.75" },
    ],
    result: "You receive $97.25",
  },

  faqs: [
    {
      q: "How much does Cash App charge for business?",
      a: "A Cash App for Business account is charged 2.75% on each payment received, with no fixed fee. On a $100 payment that's $2.75, so you keep $97.25.",
    },
    {
      q: "What are Cash App's fees on $100?",
      a: "On a $100 business payment, Cash App's fee is 2.75% = $2.75, leaving $97.25. There's no fixed per-transaction fee. Use the calculator above for other amounts and payment types.",
    },
    {
      q: "Does Cash App charge a fee to receive money?",
      a: "Only for business accounts (2.75% per payment) and certain funding methods. Personal payments between individuals funded by a balance, linked bank, or debit card are free. Sending with a credit card adds 3%.",
    },
    {
      q: "How much is Cash App's instant deposit fee?",
      a: "Instant deposits cost 0.5%–1.75% of the amount (minimum $0.25), depending on the destination. A standard deposit is free but takes 1–3 business days. Select 'Instant deposit' above to estimate it (we use the 1.75% upper figure).",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Because the business rate has no fixed fee, charge = target ÷ (1 − 2.75%). For example, to keep $100 you'd ask for about $102.83.",
    },
  ],

  related: ["paypal-fee-calculator", "venmo-fee-calculator", "cashapp-vs-paypal-fee-calculator", "cashapp-vs-venmo-fee-calculator"],

  sources: [
    { label: "Cash App — Cash App for Business fees", url: "https://cash.app/help/us/en-us/6521-cash-app-for-business-fees" },
    { label: "Cash App — cash out speed & fees", url: "https://cash.app/help/us/en-us/3073-cash-out-speed-options" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-10",
};
