import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { squareFees } from "../../config/fees";
import { squareRateCards } from "../../lib/rateCards";
import { computeSquareFee } from "./formula";

const COUNTRIES = ["US", "CA", "AU", "GB", "IE", "FR", "ES", "JP"] as const;

export const squareFeeCalculator: CalculatorConfig = {
  slug: "square-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "square",
  title: "Square Fee Calculator",
  metaDescription:
    "Free Square fee calculator. Work out Square's online, in-person and keyed-in processing fees and exactly what you keep — US, UK, Canada, Australia and more, with a reverse mode.",
  h1: "Square Fee Calculator",
  intro:
    "Calculate what Square charges on a sale and what actually lands in your account. Pick your country and payment type — online, in person, or keyed in — add a foreign card, or work backwards to find what to charge so you keep a target amount after Square's fees.",

  keywords: {
    primary: "square fee calculator",
    secondary: [
      "square fees calculator",
      "square processing fees",
      "square payment fees",
      "square transaction fees",
      "calculate square fees",
      "square credit card processing fees",
      "square pricing",
      "square cost calculator",
      "square charges calculator",
    ],
    longTail: [
      "square fees on $100",
      "how much does square charge per transaction",
      "square online fees",
      "square in person fees",
      "square keyed in fees",
      "square card on file fees",
      "square invoice fees",
      "square reader fees",
      "square fee calculator uk",
      "what percentage does square take",
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
      id: "paymentType",
      label: "Payment type",
      type: "select",
      default: "online",
      options: [
        { value: "online", label: "Online / e-commerce" },
        { value: "inperson", label: "In person (tap, dip, swipe)" },
        { value: "keyed", label: "Manually keyed / card on file" },
      ],
      help: "Square charges different rates for online, in-person and keyed-in payments.",
    },
    {
      id: "international",
      label: "Foreign card",
      type: "toggle",
      default: false,
      help: "Card issued in another country. Adds Square's foreign-card surcharge on the online rate.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const rate = squareFees[ctx.country] ?? squareFees.US!;
    const variant = rate.variants.find((v) => v.id === values.paymentType) ?? rate.variants[0];

    const r = computeSquareFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: variant.percent,
      fixed: variant.fixed,
      intlSurcharge: rate.intlSurchargePercent,
      taxOnFeePercent: rate.taxOnFeePercent,
      international: Boolean(values.international),
    });

    const rows: CalcResult["rows"] = [
      { label: "Customer is charged", display: ctx.formatCurrency(r.charge) },
      {
        label: `Square fee (${ctx.formatPercent(variant.percent)}${variant.fixed > 0 ? ` + ${ctx.formatCurrency(variant.fixed)}` : ""})`,
        display: ctx.formatCurrency(r.processingFee),
        kind: "deduction",
        hint: r.ratePercent !== variant.percent ? `${ctx.formatPercent(r.ratePercent)} with foreign-card surcharge` : undefined,
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
    "Square charges a percentage of each sale plus, in most countries, a small fixed fee — and the rate depends on how the payment is taken. In the US on the free plan, online/e-commerce payments are 3.3% + $0.30, in-person taps are 2.6% + $0.15, and manually keyed-in cards are 3.5% + $0.15. In the UK the online rate is 1.4% + 20p for UK cards, and in Australia it's a flat 2.2% with no fixed fee.\n\nThe fee is: amount × rate% + fixed fee. Pick the payment type above and the calculator uses the matching rate. Cards issued in another country can carry a foreign-card surcharge on the online rate (for example +1.5% in Canada, Ireland, France and Spain), and in Ireland 23% VAT is added on top of the fee.\n\nTo find what to charge so you keep a target amount, switch to reverse mode: charge = (target + fixed) ÷ (1 − rate). These are Square's standard published rates on the free plan; paid plans and high-volume custom pricing can be lower.",

  seoContent: `Our Square fee calculator is a free, instant tool that shows exactly how much Square deducts from a payment and how much money reaches your account. Square is popular precisely because it has no monthly fee on its standard plan and no long-term contract — you only pay per transaction. But that per-transaction rate is not a single number: it changes with how you take the payment, which country you're in, and where the customer's card was issued. This calculator removes the guesswork so you can price correctly and protect your margin.

## Square's rates depend on how you take the payment
The single most important thing to understand about Square's pricing is that the same sale costs different amounts depending on the payment method. In the United States on the free plan, an online or e-commerce payment is 3.3% plus $0.30, an in-person tap, dip or swipe is 2.6% plus $0.15, and a card you key in by hand (or charge from a saved card on file) is 3.5% plus $0.15. Keyed-in and online payments cost more because the card isn't physically present, which carries more fraud risk. Choose the payment type above and the calculator applies the exact matching rate, so the result reflects how you actually get paid.

## How the fee is calculated
The math is straightforward: fee = (amount × rate%) + fixed fee, and your net is the amount minus that fee. The fixed component matters most on small sales — on a $4 coffee paid in person, the $0.15 fixed fee is already part of the cost before the percentage applies — which is why the effective rate on tiny transactions is higher than the headline percentage. The calculator surfaces this effective rate so you can see the true cost of each sale. If you need to receive an exact amount after fees, switch to reverse mode and it grosses the charge up for you using charge = (target + fixed) ÷ (1 − rate).

## Country differences, foreign cards and tax
Square publishes different rates in each country it operates in — the United States, Canada, Australia, Japan, the United Kingdom, Ireland, France and Spain. Some markets have no fixed fee at all (Australia is a flat 2.2%, Japan a flat 3.6%), while others are lower on percentage but add a fixed fee (the UK online rate is just 1.4% + 20p for UK cards). Cards issued outside your country can cost more: Canada, Ireland, France and Spain add a foreign-card surcharge, and in the UK a non-UK card moves the online rate from 1.4% to 2.5%. Ireland also applies 23% VAT on top of Square's fee, which the calculator shows as a separate line. Select your country and toggle the foreign-card option to see the accurate figure.

## Who this tool is for
Retailers and cafés use it to understand the real cost of in-person card taps. Online sellers and service businesses use the online rate to price products and subscriptions. Freelancers and trades who key in card numbers or send invoices use it to check what keyed-in payments really cost. And anyone quoting a fixed take-home amount can use reverse mode to work out what to charge. Everything runs in your browser — no signup, no data leaves your device, and it works on a phone at the counter.

## Keeping the numbers accurate
Payment pricing changes, so every Square rate here is taken from Square's official country pricing pages, stored in one dated source file, and stamped with a "fees last verified" date that's shown on the page. These figures reflect Square's standard free-plan pricing; paid plans (Plus and Premium) and high-volume sellers can negotiate lower rates, and additional costs such as chargebacks, refunds and currency conversion can apply. Always confirm the final figure in your Square Dashboard before making pricing decisions — but for fast, reliable everyday estimates of what you'll actually keep, this calculator gives you the real cost of getting paid with Square.`,

  rateCards: {
    heading: "Square fees by country",
    intro:
      "Square's standard free-plan rates for the countries this calculator covers, by payment type. Foreign-card surcharges and Irish VAT are noted where they apply.",
    cards: squareRateCards([...COUNTRIES]),
  },

  workedExample: {
    scenario: "You sell a $100 product online in the US and the customer pays with a standard US card.",
    steps: [
      { label: "Sale amount", value: "$100.00" },
      { label: "Percentage fee (3.3%)", value: "$3.30" },
      { label: "Fixed fee", value: "$0.30" },
      { label: "Total Square fee", value: "$3.60" },
    ],
    result: "You receive $96.40",
  },

  faqs: [
    {
      q: "How much does Square charge per transaction?",
      a: "It depends on how you take the payment. In the US on the free plan, online payments are 3.3% + $0.30, in-person taps are 2.6% + $0.15, and manually keyed-in cards are 3.5% + $0.15. There's no monthly fee on the standard plan. Rates differ by country — for example the UK online rate is 1.4% + 20p for UK cards.",
    },
    {
      q: "What are Square's fees on $100?",
      a: "On a $100 online US sale, Square charges 3.3% + $0.30 = $3.60, so you receive $96.40. Taken in person it's 2.6% + $0.15 = $2.75, leaving $97.25. Use the calculator above to check other amounts, payment types and countries.",
    },
    {
      q: "Why is Square's online rate higher than in-person?",
      a: "Online and keyed-in payments are 'card-not-present,' which carries more fraud risk, so Square (like all processors) charges more for them. In-person tap/dip/swipe payments are 'card-present' and cost less. Pick the payment type above to see the right rate.",
    },
    {
      q: "Does Square charge a monthly fee?",
      a: "No. Square's standard plan has no monthly fee and no contract — you only pay the per-transaction processing fee. Optional paid plans (Plus/Premium) add features and can lower the in-person and online rates, and high-volume sellers can request custom pricing.",
    },
    {
      q: "Does Square cost more for foreign cards?",
      a: "In several countries, yes. Canada, Ireland, France and Spain add a foreign-card surcharge, and in the UK a non-UK card raises the online rate from 1.4% to 2.5%. The US, Australia and Japan don't publish an international surcharge. Toggle 'Foreign card' above to include it.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch the calculator to 'I want to receive this amount.' It grosses up the charge using charge = (target + fixed) ÷ (1 − rate). For example, to net $100 on a US online sale you'd charge about $103.72.",
    },
  ],

  related: ["stripe-fee-calculator", "paypal-fee-calculator", "stripe-vs-square-fee-calculator", "square-vs-paypal-fee-calculator"],

  sources: [
    { label: "Square — US fees", url: "https://squareup.com/us/en/payments/our-fees" },
    { label: "Square — UK pricing", url: "https://squareup.com/gb/en/pricing" },
    { label: "Square — Canada pricing", url: "https://squareup.com/ca/en/pricing" },
    { label: "Square — Australia fees", url: "https://squareup.com/au/en/payments/our-fees" },
    { label: "Square — Ireland pricing", url: "https://squareup.com/ie/en/pricing" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-10",
};
