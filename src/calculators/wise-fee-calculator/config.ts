import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { wiseCorridors, WISE_SOURCE } from "../../config/fees";
import { computeWiseFee } from "./formula";
import { formatByCurrency } from "../../lib/money";

const CORRIDOR_OPTIONS = Object.entries(wiseCorridors).map(([value, c]) => ({
  value,
  label: `${c.from} → ${c.to}`,
}));

export const wiseFeeCalculator: CalculatorConfig = {
  slug: "wise-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "wise",
  title: "Wise Fee Calculator",
  metaDescription:
    "Free Wise (ex-TransferWise) fee calculator. Work out the exact fee to send money abroad on any route — USD to EUR, GBP, INR and more — at the mid-market rate, with no FX markup.",
  h1: "Wise Fee Calculator",
  intro:
    "Work out exactly what Wise charges to send money abroad. Pick your route and amount and see the fee and effective rate. Wise converts what's left at the mid-market rate with no exchange-rate markup, so the fee you see is the whole cost.",

  keywords: {
    primary: "wise fee calculator",
    secondary: [
      "wise fees",
      "wise transfer fee",
      "wise calculator",
      "transferwise fees",
      "wise fee",
      "wise international transfer fee",
      "how much does wise charge",
    ],
    longTail: [
      "wise fees usd to eur",
      "wise fee usd to inr",
      "wise transfer fee calculator",
      "wise fees for sending money",
      "wise gbp to eur fee",
      "wise vs bank transfer fee",
      "wise mid-market rate fee",
      "wise fee to send $1000",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "corridor",
      label: "Route (send → receive)",
      type: "select",
      default: "USD-EUR",
      options: CORRIDOR_OPTIONS,
      help: "The currency you're sending from and to. Wise's fee varies by route.",
    },
    {
      id: "amount",
      label: "Amount you're sending",
      type: "number",
      default: 1000,
      min: 0,
      help: "In the sending (source) currency.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const id = String(values.corridor || "USD-EUR");
    const c = wiseCorridors[id] ?? wiseCorridors["USD-EUR"]!;
    const amount = Number(values.amount) || 0;

    const r = computeWiseFee({ amount, pct: c.pct, fixed: c.fixed });
    const fmt = (v: number) => formatByCurrency(v, c.from);

    return {
      headline: {
        label: "Wise fee",
        display: fmt(r.fee),
        sub: `${ctx.formatPercent(r.effectiveRate)} of ${fmt(amount)} — the rest converts at the mid-market rate, no markup`,
      },
      rows: [
        { label: "You send", display: fmt(amount) },
        {
          label: `Wise fee (${ctx.formatPercent(c.pct)} + ${fmt(c.fixed)})`,
          display: fmt(r.fee),
          kind: "deduction",
        },
        {
          label: `Converted to ${c.to}`,
          display: fmt(r.converted),
          kind: "net",
          hint: `Wise converts this at the live ${c.from}/${c.to} mid-market rate`,
        },
      ],
    };
  },

  howItWorks:
    "Wise charges a single, upfront fee to send money abroad: a small fixed fee plus a percentage of the amount, both in the currency you're sending. It then converts what's left using the mid-market exchange rate — the real rate you'd find on Google — with no markup added. That's the key difference from banks and PayPal, which bury a 3–4% margin in a worse exchange rate.\n\nThe fee is: fixed fee + (rate% × amount). The rate varies by route — for example about 0.29% + $6.98 on USD→EUR, 0.42% + $7.08 on USD→INR, and just 0.33% + £0.59 on GBP→EUR (the fixed fee is lower when you fund from a UK or EU bank). Pick your route above to see the exact figure and the effective percentage.\n\nThese are standard bank-funded (ACH/SEPA/Faster Payments) rates; paying by debit or credit card adds a card fee, and very large monthly volumes get a discount. The exchange rate itself is live and moves constantly, so we show the fee (which is stable) and how much gets converted, rather than a rate that would quickly go stale.",

  seoContent: `Our Wise fee calculator is a free tool that shows exactly what Wise (formerly TransferWise) charges to send money internationally — and, just as importantly, makes clear that the fee you see is the whole cost. Wise built its reputation on transparency: a single upfront fee plus the real mid-market exchange rate, with no hidden margin. This calculator lets you confirm that for your own transfer in seconds.

## How Wise's fee works
Wise charges a small fixed fee plus a percentage of the amount you're sending, both taken in the source currency, and then converts the remainder at the mid-market rate. The formula is simply fixed fee + (rate% × amount). The percentage and fixed fee depend on the route (the "corridor") — the currency you send from and to. For example, sending US dollars to euros costs roughly 0.29% + $6.98, dollars to Indian rupees about 0.42% + $7.08, and pounds to euros just 0.33% + £0.59. Pick your route above and the calculator applies the correct figures and shows the effective percentage, so you can see the true cost on your exact amount.

## Why the fixed fee changes with where you send from
You'll notice the fixed fee is around $7 on US-funded transfers but well under £1 or €1.50 when you send from the UK or eurozone. That's because the fixed portion reflects how Wise is funded: pulling dollars from a US bank via ACH costs more than a UK Faster Payment or a SEPA transfer, which are near-free. The percentage is broadly similar in both directions; it's the funding fixed fee that makes a US-originated transfer pricier. The calculator reflects this so freelancers and businesses funding from different countries get an accurate number.

## The mid-market rate is the real story
The single biggest reason people choose Wise is the exchange rate. Banks and services like PayPal typically advertise a "no fee" or low-fee transfer, then apply an exchange rate that's 3–4% worse than the real one — a hidden cost that dwarfs any visible fee. Wise uses the mid-market rate (the midpoint between buy and sell rates, the one you see on Google) with zero markup, and charges only the explicit fee shown here. That's why, on most international transfers, Wise works out substantially cheaper even when its visible fee looks similar to a competitor's. Because the live rate moves every second, this tool deliberately shows the fee and the amount that gets converted rather than quoting a rate that would be out of date moments later — check the live rate on Wise itself at the moment you send.

## Who uses this calculator
Freelancers paid by overseas clients use it to see what arrives after fees; small businesses paying international suppliers or contractors use it to budget transfer costs; and anyone sending money to family abroad uses it to compare Wise against their bank. The reverse question — "what should I ask my client to send so I receive enough?" — is easy too: the fee is small and predictable, so you can add it on top with confidence. Everything runs in your browser with no signup.

## Accuracy and important notes
Wise re-tunes its corridor rates periodically, so we store each route's fee in a dated file and stamp it with a "last verified" date. These figures are for standard bank-funded transfers; funding by debit or credit card adds a separate card fee, transfers above large monthly thresholds receive a discount, and correspondent banks can occasionally deduct their own fee on certain inbound routes. Always confirm the exact fee and live rate on Wise before you send — Wise shows both before you confirm a transfer — but for a fast, honest estimate of what an international transfer will cost, this calculator gives you the answer in seconds.`,

  workedExample: {
    scenario: "You send $1,000 from the US to a euro account with Wise.",
    steps: [
      { label: "Amount sent", value: "$1,000.00" },
      { label: "Percentage fee (0.289%)", value: "$2.89" },
      { label: "Fixed fee", value: "$6.98" },
      { label: "Total Wise fee", value: "$9.87" },
    ],
    result: "$990.13 is converted at the mid-market rate",
  },

  faqs: [
    {
      q: "How much does Wise charge to send money?",
      a: "A small fixed fee plus a percentage of the amount, in the currency you send. For example, USD→EUR is about 0.289% + $6.98, so sending $1,000 costs $9.87. Wise then converts the rest at the mid-market rate with no markup. Pick your route above for the exact figure.",
    },
    {
      q: "Does Wise really use the mid-market rate?",
      a: "Yes. Wise converts your money at the mid-market (interbank) rate — the real rate you can check on Google — and charges only the explicit upfront fee. There's no margin hidden in the exchange rate, which is the main way banks and PayPal make international transfers more expensive.",
    },
    {
      q: "Why is Wise's fixed fee higher when sending from the US?",
      a: "The fixed fee reflects funding cost. Pulling USD from a US bank via ACH costs Wise more (~$7) than a UK Faster Payment (~£0.6) or a SEPA transfer (~€1). The percentage is similar either way; the fixed fee is what differs by source country.",
    },
    {
      q: "Why doesn't the calculator show the exact amount received?",
      a: "Because the exchange rate is live and changes every second — quoting a fixed rate would be out of date immediately. We show the fee (which is stable) and the amount that gets converted; check the live rate on Wise at the moment you send for the exact received amount.",
    },
    {
      q: "Is Wise cheaper than my bank or PayPal?",
      a: "Usually, yes — mainly because of the exchange rate. A bank or PayPal may show a low fee but apply a rate 3–4% worse than the real one, which costs far more than Wise's visible fee on most transfers. Use this calculator to see Wise's true cost, then compare it against the rate your bank quotes.",
    },
  ],

  related: ["paypal-fee-calculator", "payoneer-fee-calculator", "stripe-fee-calculator"],

  sources: [
    { label: "Wise — pricing", url: WISE_SOURCE },
    { label: "Wise — how our fees work", url: "https://wise.com/gb/pricing/" },
  ],

  feesVerifiedOn: "2026-06-11",
  lastUpdated: "2026-06-11",
};
