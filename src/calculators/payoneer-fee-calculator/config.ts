import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { payoneerReceiving, PAYONEER_CONVERSION_PERCENT, PAYONEER_SOURCE } from "../../config/fees";
import { computePayoneerFee } from "./formula";

export const payoneerFeeCalculator: CalculatorConfig = {
  slug: "payoneer-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "payoneer",
  title: "Payoneer Fee Calculator",
  metaDescription:
    "Free Payoneer fee calculator. Work out what Payoneer takes when you get paid — card 3.99% + $0.49, ACH/bank 1%, marketplace free — plus currency conversion, and what you keep.",
  h1: "Payoneer Fee Calculator",
  intro:
    "Work out what Payoneer charges when you get paid and what actually lands in your balance. Pick how your client pays, add currency conversion if it applies, or see the fee on any amount. Withdrawal and annual fees are explained below.",

  keywords: {
    primary: "payoneer fee calculator",
    secondary: [
      "payoneer fees",
      "payoneer charges",
      "payoneer withdrawal fee",
      "payoneer calculator",
      "payoneer fee",
      "how much does payoneer charge",
      "payoneer receiving fee",
    ],
    longTail: [
      "payoneer fees for freelancers",
      "payoneer withdrawal fee to bank",
      "payoneer 1% fee",
      "payoneer card payment fee",
      "payoneer fees on $1000",
      "payoneer currency conversion fee",
      "payoneer fee to receive money",
      "payoneer annual fee",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "amount",
      label: "Amount received",
      type: "currency",
      default: 1000,
      min: 0,
      help: "What your client or marketplace pays you.",
    },
    {
      id: "method",
      label: "How you're paid",
      type: "select",
      default: "card",
      options: payoneerReceiving.map((m) => ({ value: m.id, label: m.label })),
      help: "Payoneer's receiving fee depends on how the money comes in.",
    },
    {
      id: "conversion",
      label: "Convert to another currency",
      type: "toggle",
      default: false,
      help: "Adds Payoneer's 0.5% balance currency-conversion fee.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const method = payoneerReceiving.find((m) => m.id === values.method) ?? payoneerReceiving[0]!;
    const r = computePayoneerFee({
      amount: Number(values.amount) || 0,
      receivePercent: method.percent,
      receiveFixed: method.fixed,
      conversion: Boolean(values.conversion),
      conversionPercent: PAYONEER_CONVERSION_PERCENT,
    });

    const rows: CalcResult["rows"] = [{ label: "Amount received", display: ctx.formatCurrency(Number(values.amount) || 0) }];
    if (r.receivingFee > 0) {
      rows.push({
        label: `Payoneer fee (${ctx.formatPercent(method.percent)}${method.fixed > 0 ? ` + ${ctx.formatCurrency(method.fixed)}` : ""})`,
        display: ctx.formatCurrency(r.receivingFee),
        kind: "deduction",
      });
    }
    if (r.conversionFee > 0) {
      rows.push({
        label: `Currency conversion (${ctx.formatPercent(PAYONEER_CONVERSION_PERCENT)})`,
        display: ctx.formatCurrency(r.conversionFee),
        kind: "deduction",
      });
    }
    rows.push({ label: "You keep", display: ctx.formatCurrency(r.net), kind: "net" });

    return {
      headline: {
        label: "You keep",
        display: ctx.formatCurrency(r.net),
        sub: r.totalFee > 0 ? `Effective fee ${ctx.formatPercent(r.effectiveRate)} before withdrawal` : "No receiving fee on this method",
      },
      rows,
    };
  },

  howItWorks:
    "Payoneer's fee depends mostly on how you get paid. Receiving into a local-currency receiving account, from a marketplace like Upwork or Amazon, or from another Payoneer account is generally free. A client paying you by ACH bank debit (US) or a regular bank transfer costs about 1%. The expensive option is a client paying your Payoneer payment request by card or PayPal — that's 3.99% + $0.49. Converting your balance to another currency adds 0.5% above the mid-market rate.\n\nThe receiving fee is: amount × rate% + fixed fee, then an optional 0.5% on what's left if you convert. This calculator shows that part exactly. Getting the money to your own bank is separate: a same-currency withdrawal is a flat $1.50, while withdrawing in a different currency (with conversion) runs roughly 1.2%–4% depending on the route — Payoneer shows your exact figure before you confirm, so we explain rather than guess it.\n\nPayoneer also charges a $29.95 annual account fee if you receive less than a country-dependent threshold (around $2,000–$6,000) in a year, plus separate card fees if you hold a Payoneer card. Those are periodic, not per-payment, so they're noted here rather than added to each transaction.",

  seoContent: `Our Payoneer fee calculator is a free tool that shows what Payoneer takes when you get paid and how much actually reaches your balance. Payoneer is a favourite of freelancers, agencies and online sellers who get paid by overseas clients and marketplaces — but its fees vary a lot depending on how the money arrives, which makes the real cost easy to misjudge. Pick how you're paid, enter the amount, and see the fee and your net instantly.

## Payoneer's fee depends on how you're paid
The single most important thing to understand about Payoneer is that there isn't one fee — there are several, and the method decides which applies. Receiving into a local-currency receiving account (your US, UK, EU or other receiving details), getting paid out by a marketplace such as Upwork, Fiverr or Amazon, or receiving from another Payoneer account is typically free. A client who pays you via ACH bank debit in the US, or by a regular bank transfer, is charged about 1%. The costly route is asking a client to pay a Payoneer "payment request" with a credit/debit card or PayPal — that carries a 3.99% + $0.49 fee. Selecting the right method above gives you the accurate figure for your situation.

## Currency conversion
If the money arrives in one currency and you need it in another, Payoneer converts your balance at a 0.5% fee above the mid-market rate — far cheaper than most banks. Toggle the conversion option to include it. Note this 0.5% applies to converting between your own Payoneer balances; if instead the conversion happens at the moment you withdraw to a foreign bank, it's bundled into the withdrawal fee band below rather than charged separately, so the calculator doesn't double-count it.

## Withdrawing to your bank — why it's a range
Receiving money is only the first step; moving it to your own bank account has its own cost, and this is where Payoneer is genuinely hard to pin to a single number. Withdrawing to a bank in the same currency as your balance is a flat $1.50. Withdrawing in a different currency — which involves a conversion — runs roughly 1.2% to 4% depending on the currencies and country, and Payoneer doesn't publish a fixed figure per route. Rather than show false precision, we model the receiving fee exactly and tell you the withdrawal band; Payoneer always displays your exact withdrawal fee before you confirm, so check it there.

## Who this tool is for
Freelancers comparing how to ask clients to pay (card versus bank transfer can be a 3-point swing), agencies budgeting the cost of getting paid by international clients, and sellers reconciling marketplace payouts all use this to see Payoneer's real cut. It's especially useful for deciding payment methods: steering a client from a card payment request to an ACH or bank transfer can save nearly 3% on every invoice. Everything runs in your browser with no signup.

## Accuracy and important notes
Payoneer updates its fee schedule periodically — the current schedule moved to a flat $1.50 same-currency withdrawal and a $29.95 annual account fee — so we store every rate in a dated file and stamp it with a "last verified" date. Remember the annual account fee ($29.95) applies only if you receive below a country-dependent threshold (commonly $2,000–$6,000) in a year, and Payoneer card holders pay separate card and ATM fees; these are periodic, not per-payment, so they're explained here rather than baked into each transaction. Always confirm the exact figure in your Payoneer account before relying on it, but for a fast, honest estimate of what you'll keep when you get paid, this calculator gives you a clear answer in seconds.`,

  workedExample: {
    scenario: "An overseas client pays a $1,000 invoice through a Payoneer card payment request.",
    steps: [
      { label: "Amount received", value: "$1,000.00" },
      { label: "Percentage fee (3.99%)", value: "$39.90" },
      { label: "Fixed fee", value: "$0.49" },
      { label: "Total Payoneer fee", value: "$40.39" },
    ],
    result: "You keep $959.61 (before withdrawal)",
  },

  faqs: [
    {
      q: "How much does Payoneer charge to receive money?",
      a: "It depends on how you're paid. A local-currency receiving account, marketplace payout, or Payoneer-to-Payoneer transfer is free; a client paying by ACH or bank transfer is about 1%; and a client paying a card/PayPal payment request is 3.99% + $0.49. Pick the method above for your exact fee.",
    },
    {
      q: "What are Payoneer's fees on $1,000?",
      a: "Paid by card, $1,000 costs 3.99% + $0.49 = $40.39, leaving $959.61. Paid by ACH or bank transfer it's 1% = $10.00, leaving $990. Received into a local-currency account or from a marketplace, it's usually free.",
    },
    {
      q: "What is Payoneer's withdrawal fee to my bank?",
      a: "Withdrawing in the same currency as your balance is a flat $1.50. Withdrawing in a different currency (with conversion) is roughly 1.2%–4% depending on the route — Payoneer shows your exact fee before you confirm. We model the receiving fee precisely and explain the withdrawal band rather than guess it.",
    },
    {
      q: "Does Payoneer charge an annual fee?",
      a: "Payoneer charges a $29.95 annual account fee only if you receive less than a country-dependent threshold (commonly $2,000–$6,000) in a 12-month period. If you receive above the threshold, it's waived. Payoneer card holders also pay a separate annual card fee.",
    },
    {
      q: "How can I reduce Payoneer fees?",
      a: "Ask clients to pay by ACH or bank transfer (about 1%) rather than a card payment request (3.99% + $0.49) — that alone saves nearly 3% per invoice. Receiving into a local-currency account or via a marketplace payout is typically free, and converting currency at Payoneer's 0.5% beats most banks.",
    },
  ],

  related: ["wise-fee-calculator", "paypal-fee-calculator", "stripe-fee-calculator"],

  sources: [
    { label: "Payoneer — pricing & fees", url: PAYONEER_SOURCE },
    { label: "Payoneer — how withdrawal fees work", url: "https://www.payoneer.com/resources/how-to-use-payoneer/how-payoneer-calculates-withdrawal-fees/" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-11",
};
