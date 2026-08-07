import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { stripeFees, stripeAddOns } from "../../config/fees";
import { stripeRateCards } from "../../lib/rateCards";
import { computeStripeFee } from "./formula";

const COUNTRIES = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "BR", "JP", "NZ", "HK",
  "MX", "MY", "SE", "DE", "FR", "ES", "IT", "NL", "IE", "BE", "AT",
] as const;

export const stripeFeeCalculator: CalculatorConfig = {
  slug: "stripe-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "stripe",
  title: "Stripe Fee Calculator",
  metaDescription:
    "Free Stripe fee calculator. Calculate Stripe processing fees and what you keep on any sale — US, UK, EU, India and more, with transaction fees, international cards and a reverse mode.",
  h1: "Stripe Fee Calculator",
  intro:
    "Calculate Stripe fees on any payment and see what lands in your account. Pick your country, include international cards or currency conversion, or flip it around to find what to charge so you receive a target amount after Stripe's processing fees.",

  // Cluster built from the user's Google Keyword Planner exports
  // (stripe fee calculator.csv + stripe fees.csv), all relevant terms vol >= 90.
  keywords: {
    primary: "stripe fee calculator", // 1,600
    secondary: [
      "calculate stripe fees", // 1,600
      "stripe fees", // 6,600
      "fees for stripe", // 6,600
      "stripe service charge", // 6,600
      "stripe processing fees", // 2,400
      "stripe pricing", // 3,600
      "stripe cost", // 3,600
      "stripe rates", // 3,600
      "stripe credit card processing fees", // 1,300
      "stripe payment processing fees", // 1,300
      "stripe transaction fee", // 1,000
      "stripe charges", // 880
    ],
    longTail: [
      "stripe payment fees", // 1,000
      "stripe credit card fees", // 1,000
      "stripe cc fees", // 1,000
      "stripe payment charges", // 1,000
      "stripe payment cost", // 1,000
      "stripe transaction charges", // 1,000
      "stripe charge fee", // 880
      "stripe fees per transaction", // 480
      "stripe percentage fee", // 260
      "stripe invoice fee", // 260
      "stripe invoice fees", // 170
      "stripe merchant fees", // 140
      "stripe merchant rates", // 140
      "stripe monthly fee", // 140
      "stripe surcharge", // 110
      "stripe currency conversion", // 110
      "stripe commission", // 90
      "stripe service fee", // 90
      "stripe card fees", // 90
      "stripe card processing fees", // 90
      "stripe cost per transaction", // 90
      "stripe card charges", // 90
      "stripe account cost", // 90
      "how much does stripe charge per transaction",
    ],
    competition: "M",
    estVolume: 6600,
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
      half: true,
      help: "Customer's card was issued in another country.",
    },
    {
      id: "conversion",
      label: "Currency conversion required",
      type: "toggle",
      default: false,
      half: true,
      help: "Adds Stripe's currency-conversion surcharge.",
    },
    {
      id: "recurring",
      label: "Recurring / subscription (Stripe Billing)",
      type: "toggle",
      default: false,
      half: true,
      help: "Adds Stripe Billing's 0.7% on recurring payments.",
    },
    {
      id: "invoicing",
      label: "Sent with Stripe Invoicing",
      type: "toggle",
      default: false,
      half: true,
      help: "Adds Stripe Invoicing's 0.4% per paid invoice.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const rate = stripeFees[ctx.country] ?? stripeFees.US!;
    const addOnPercent =
      (values.recurring ? stripeAddOns.billingPercent : 0) +
      (values.invoicing ? stripeAddOns.invoicingPercent : 0);

    const r = computeStripeFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: rate.percent,
      fixed: rate.fixed,
      intlSurcharge: rate.intlSurchargePercent,
      fxPercent: rate.fxPercent,
      addOnPercent,
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

  seoContent: `Our Stripe fee calculator is a free, instant tool that shows you exactly how much Stripe deducts from a payment and how much money actually reaches your bank account. Whether you run an online store, sell digital products, invoice clients, or take donations, knowing your true net payout is essential for pricing your products correctly and protecting your profit margin. Instead of guessing or doing the arithmetic by hand on every sale, you enter an amount, pick your country, and see the processing fee and your net deposit in real time.

## Why Stripe fees matter for your pricing
Stripe charges a percentage of every transaction plus a small fixed fee. In the United States the standard online rate is 2.9% plus $0.30 per successful card charge; in the United Kingdom it is 1.5% plus 20p, and in Australia it is 1.7% plus A$0.30. That fixed component is easy to overlook, but it has an outsized effect on small transactions. On a $5 sale, the $0.30 fixed fee alone is 6% of the price — so your effective rate can be far higher than the headline percentage suggests. This calculator surfaces that "effective rate" so you can see the real cost of every sale, not just the advertised number.

## How the calculator works
The math is simple and transparent: fee = (amount × rate%) + fixed fee, and your net = amount − fee. We apply the exact percentage and fixed fee for the country you select, then show the breakdown line by line. If you want to receive a specific amount after fees, switch the calculator to reverse mode ("I want to receive this amount") and it grosses the charge up for you using charge = (target + fixed) ÷ (1 − rate). This is perfect for freelancers and agencies who quote a fixed take-home figure and need to know what to invoice.

## International cards, currency conversion and taxes
Stripe's pricing is not one flat number everywhere. Cards issued in another country usually carry an international surcharge — commonly an extra 1.5% in the US — and converting between currencies adds a further fee. Toggle "International card" and "Currency conversion" to fold those surcharges into the result. Some countries also tax the processing fee itself: in India, for example, 18% GST is charged on top of Stripe's fee, which the calculator adds as a separate line. These details are exactly where simple fee tables go wrong, so we model them explicitly and cite the official Stripe pricing page for every country.

## Who this tool is for
E-commerce sellers use it to set prices that preserve margin after fees. SaaS founders use it to understand the gap between MRR billed and cash collected. Freelancers and consultants use the reverse mode to quote invoices that net the right amount. Nonprofits use it to estimate how much of a donation actually arrives. Because everything runs in your browser with no signup and no data leaving your device, it is fast, private, and works on mobile while you are pricing on the go.

## Keeping the numbers accurate
Payment pricing changes, so we store every rate in a single, dated source file and stamp each calculator with a "fees last verified" date. When Stripe updates its pricing, we update the figure and the date together. Remember that this tool provides estimates for standard pay-as-you-go pricing: high-volume businesses can negotiate custom rates, and additional costs such as chargebacks, refunds (where the fixed fee may not be returned), disputes, payout fees, or local taxes can apply. Always confirm the final figure against your Stripe dashboard before making pricing decisions — but for fast, reliable everyday estimates, this calculator gives you the real cost of getting paid.`,

  rateCards: {
    heading: "Stripe fees by country",
    intro:
      "Stripe's standard online card-processing rates for the countries this calculator covers. \"Domestic\" is a card issued in the same country; \"international\" is a card issued elsewhere.",
    cards: stripeRateCards([...COUNTRIES]),
  },

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
      q: "What are Stripe's credit card processing fees?",
      a: "Stripe's credit card processing fees are charged per successful transaction as a percentage plus a small fixed fee — 2.9% + $0.30 in the US for standard online card payments. The same rate covers Visa, Mastercard, American Express and Discover; there are no separate monthly or card-network charges on standard pay-as-you-go pricing. Enter an amount above to see the exact processing fee and your net payout.",
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

  related: ["paypal-fee-calculator", "square-fee-calculator", "stripe-vs-paypal-fee-calculator", "stripe-vs-square-fee-calculator"],

  sources: [
    { label: "Stripe — official pricing (US)", url: "https://stripe.com/us/pricing" },
    { label: "Stripe — pricing by country", url: "https://stripe.com/pricing" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-08",
};
