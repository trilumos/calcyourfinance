import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { stripeFees } from "../../config/fees";
import { computeStripeFee } from "./formula";

const COUNTRIES = ["US", "GB", "CA", "AU", "EU", "IN", "SG", "BR"] as const;

export const stripeFeeCalculator: CalculatorConfig = {
  slug: "stripe-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "stripe",
  title: "Stripe Fee Calculator",
  metaDescription:
    "Free Stripe fee calculator. See exactly what Stripe takes and what you keep on any sale — US, UK, EU, Canada, Australia, India and more, plus a reverse mode.",
  h1: "Stripe Fee Calculator",
  intro:
    "Work out the exact Stripe processing fee on a payment and what lands in your account. Pick your country, toggle international cards or currency conversion, or flip it around to find what to charge so you receive a target amount.",

  keywords: {
    primary: "stripe fee calculator",
    secondary: [
      "stripe fees calculator",
      "stripe processing fee calculator",
      "stripe payment fee calculator",
      "how much does stripe charge",
    ],
    longTail: [
      "stripe fee calculator uk",
      "how much does stripe charge per transaction",
      "stripe fees on $100",
      "stripe international card fee calculator",
      "how to calculate stripe fees",
      "what does stripe charge to receive $1000",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: [...COUNTRIES], default: "US" },

  inputs: [
    {
      id: "mode",
      label: "What do you want to find?",
      type: "select",
      default: "charge",
      options: [
        { value: "charge", label: "I'm charging this amount" },
        { value: "net", label: "I want to receive this amount" },
      ],
    },
    {
      id: "amount",
      label: "Amount",
      type: "currency",
      default: 100,
      min: 0,
      help: "The sale amount you charge, or the amount you want to keep.",
    },
    {
      id: "international",
      label: "International card",
      type: "toggle",
      default: false,
      help: "Customer's card was issued in another country.",
    },
    {
      id: "conversion",
      label: "Currency conversion required",
      type: "toggle",
      default: false,
      help: "Adds Stripe's currency-conversion surcharge.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const rate = stripeFees[ctx.country] ?? stripeFees.US!;
    const r = computeStripeFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: rate.percent,
      fixed: rate.fixed,
      intlSurcharge: rate.intlSurchargePercent,
      fxPercent: rate.fxPercent,
      taxOnFeePercent: rate.taxOnFeePercent,
      international: Boolean(values.international),
      conversion: Boolean(values.conversion),
    });

    const rows: CalcResult["rows"] = [
      { label: "Customer is charged", display: ctx.formatCurrency(r.charge) },
      {
        label: `Stripe fee (${ctx.formatPercent(rate.percent)} + ${ctx.formatCurrency(rate.fixed)})`,
        display: ctx.formatCurrency(r.processingFee),
        kind: "deduction",
        hint: r.ratePercent !== rate.percent ? `${ctx.formatPercent(r.ratePercent)} with surcharges` : undefined,
      },
    ];
    if (r.taxOnFee > 0) {
      rows.push({
        label: `${rate.taxLabel ?? "Tax"} on fee (${ctx.formatPercent(rate.taxOnFeePercent ?? 0)})`,
        display: ctx.formatCurrency(r.taxOnFee),
        kind: "deduction",
      });
    }
    rows.push({ label: "You receive", display: ctx.formatCurrency(r.net), kind: "net" });

    return {
      headline: {
        label: "You receive",
        display: ctx.formatCurrency(r.net),
        sub: `Effective fee ${ctx.formatPercent(r.effectiveRate)} of the charge`,
      },
      rows,
    };
  },

  howItWorks:
    "Stripe's standard online pricing is a percentage of the transaction plus a small fixed fee per successful charge. The exact rate depends on your country — for example 2.9% + $0.30 in the US, 1.5% + 20p in the UK, and 1.7% + A$0.30 in Australia.\n\nThe fee is: amount × rate% + fixed fee. International cards add a surcharge, and converting currencies adds another. To find what to charge so you receive a specific amount, we solve it in reverse: charge = (target + fixed) ÷ (1 − rate).\n\nThese are Stripe's published pay-as-you-go rates. High-volume businesses can negotiate custom pricing, and taxes such as GST/VAT may apply on the fees in some countries.",

  workedExample: {
    scenario: "You sell a $100 product in the US and the customer pays with a standard US card.",
    steps: [
      { label: "Sale amount", value: "$100.00" },
      { label: "Percentage fee (2.9%)", value: "$2.90" },
      { label: "Fixed fee", value: "$0.30" },
      { label: "Total Stripe fee", value: "$3.20" },
    ],
    result: "You receive $96.80",
  },

  faqs: [
    {
      q: "How much does Stripe charge per transaction?",
      a: "In the US, Stripe's standard rate is 2.9% + $0.30 per successful card charge. Rates differ by country (for example 1.5% + 20p in the UK and 1.7% + A$0.30 in Australia), and international cards or currency conversion add surcharges. There are no setup or monthly fees on standard pricing.",
    },
    {
      q: "What are Stripe's fees on $100?",
      a: "On a $100 US sale paid with a domestic card, Stripe charges 2.9% + $0.30 = $3.20, so you receive $96.80. Use the calculator above to check other amounts and countries.",
    },
    {
      q: "How do I calculate what to charge so I receive an exact amount?",
      a: "Switch the calculator to 'I want to receive this amount.' It grosses up the charge using charge = (target + fixed fee) ÷ (1 − rate). For example, to net $100 in the US you'd charge about $103.30.",
    },
    {
      q: "Does Stripe charge more for international cards?",
      a: "Yes. Most regions add a surcharge for cards issued in another country (commonly +1.5% in the US) and an additional currency-conversion fee when a conversion is required. Toggle those options above to include them.",
    },
    {
      q: "Are Stripe fees the same in every country?",
      a: "No. The base rate and fixed fee vary by country, and some countries add tax on the fees — for example 18% GST applies to Stripe fees in India. Select your country above for the correct rate.",
    },
  ],

  related: ["paypal-fee-calculator", "etsy-fee-calculator"],

  sources: [
    { label: "Stripe — official pricing (US)", url: "https://stripe.com/us/pricing" },
    { label: "Stripe — pricing by country", url: "https://stripe.com/pricing" },
  ],

  feesVerifiedOn: "2026-06-08",
  lastUpdated: "2026-06-08",
};
