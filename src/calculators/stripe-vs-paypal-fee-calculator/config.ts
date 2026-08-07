import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { stripeFees, paypalFees } from "../../config/fees";
import { compareFees } from "./formula";

const COUNTRIES = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "BR", "JP", "NZ", "HK",
  "MX", "MY", "SE", "DE", "FR", "ES", "IT", "NL", "IE", "BE", "AT",
] as const;

export const stripeVsPaypalCalculator: CalculatorConfig = {
  slug: "stripe-vs-paypal-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["stripe", "paypal"],

  comparisonGuide: {
    howToUse:
      "Enter a sale amount and pick your country. The banner names which platform keeps you more and by how much; each card shows the fee and effective rate. Choose the PayPal product to match how you get paid, add the international-card or currency-conversion surcharges if they apply, or switch to “I want to keep this amount” to work backwards from a target take-home.",
    notes: [
      "Compares Stripe's standard online card rate against PayPal Goods & Services (2.99% + $0.49) by default — the rate most sellers pay. Switch the PayPal product to Checkout (3.49%) or Micropayments if that's what you use.",
      "Covers 22 countries — the rate, currency and worked example update when you change country.",
      "The toggles add each platform's international-card surcharge and currency-conversion fee; reverse mode grosses each platform up independently.",
      "Standard published pay-as-you-go rates — high-volume or negotiated pricing differs. Estimates only, not financial advice.",
    ],
  },

  title: "Stripe vs PayPal Fee Calculator",
  metaDescription:
    "Compare Stripe and PayPal fees side by side on any amount across 22 countries. See which is cheaper, what you keep on each, with international, currency-conversion and reverse modes.",
  h1: "Stripe vs PayPal fee calculator",
  intro:
    "Compare Stripe and PayPal fees on the same payment, side by side, and see which one leaves you with more. Pick your country, choose the PayPal product, add international or currency-conversion surcharges, or work backwards from a target take-home.",

  keywords: {
    primary: "stripe vs paypal fees", // comparison head term
    secondary: [
      "stripe vs paypal fee calculator",
      "paypal vs stripe fees",
      "stripe vs paypal",
      "stripe or paypal cheaper",
      "is stripe cheaper than paypal",
      "stripe vs paypal pricing",
      "stripe vs paypal cost",
      "compare stripe and paypal fees",
      "stripe vs paypal comparison",
    ],
    longTail: [
      "stripe vs paypal fees on $100",
      "which is cheaper stripe or paypal",
      "stripe vs paypal for small business",
      "stripe vs paypal transaction fees",
      "stripe vs paypal processing fees",
      "stripe vs paypal for freelancers",
      "difference between stripe and paypal fees",
      "stripe vs paypal which is better for fees",
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
        { value: "net", label: "I want to keep this amount" },
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
      id: "txType",
      label: "PayPal product",
      type: "select",
      default: "goods",
      options: [
        { value: "goods", label: "Goods & Services (standard rate)" },
        { value: "checkout", label: "PayPal Checkout / branded card rate" },
        { value: "micro", label: "Micropayments (small sales)" },
      ],
      help: "Stripe has one online rate; PayPal's depends on the product. We default to Goods & Services (the standard rate most sellers pay) — switch to Checkout or Micropayments if that's what you use.",
    },
    {
      id: "international",
      label: "International card / cross-border",
      type: "toggle",
      default: false,
      help: "Customer's card or account is in another country. Adds each platform's surcharge.",
    },
    {
      id: "conversion",
      label: "Currency conversion required",
      type: "toggle",
      default: false,
      help: "Adds each platform's currency-conversion fee.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): ComparisonResult {
    const s = stripeFees[ctx.country] ?? stripeFees.US!;
    const pp = paypalFees[ctx.country] ?? paypalFees.US!;
    const variant = pp.variants.find((v) => v.id === values.txType) ?? pp.variants[0];
    const mode = values.mode === "net" ? "net" : "charge";
    const amount = Number(values.amount) || 0;

    const r = compareFees({
      amount,
      mode,
      international: Boolean(values.international),
      conversion: Boolean(values.conversion),
      stripe: {
        percent: s.percent,
        fixed: s.fixed,
        intlSurcharge: s.intlSurchargePercent,
        fxPercent: s.fxPercent,
        taxOnFeePercent: s.taxOnFeePercent,
      },
      paypal: {
        percent: variant.percent,
        fixed: variant.fixed,
        crossBorderPercent: pp.crossBorderPercent,
        conversionPercent: pp.currencyConversionPercent,
      },
    });

    const netLabel = mode === "net" ? "You charge" : "You keep";
    const stripeHeadline = mode === "net" ? r.stripe.charge : r.stripe.net;
    const paypalHeadline = mode === "net" ? r.paypal.charge : r.paypal.net;

    const stripeCol: ComparisonColumn = {
      platform: "stripe",
      name: "Stripe",
      net: ctx.formatCurrency(stripeHeadline),
      netLabel,
      fee: ctx.formatCurrency(r.stripe.totalFee),
      rateLabel: `${ctx.formatPercent(s.percent)} + ${ctx.formatCurrency(s.fixed)}`,
      effective: `${ctx.formatPercent(r.stripe.effectiveRate)}`,
      isWinner: r.winner === "stripe",
      note: { text: "Stripe also offers subscription billing and invoicing add-ons.", href: "/stripe-fee-calculator" },
    };

    const paypalCol: ComparisonColumn = {
      platform: "paypal",
      name: "PayPal",
      net: ctx.formatCurrency(paypalHeadline),
      netLabel,
      fee: ctx.formatCurrency(r.paypal.feeAmount),
      rateLabel: `${ctx.formatPercent(variant.percent)} + ${ctx.formatCurrency(variant.fixed)}`,
      effective: `${ctx.formatPercent(r.paypal.effectiveRate)}`,
      isWinner: r.winner === "paypal",
      note: { text: "PayPal has separate goods & services and micropayments rates.", href: "/paypal-fee-calculator" },
    };

    let verdict: ComparisonResult["verdict"];
    if (r.winner === "tie") {
      verdict = {
        text: "Stripe and PayPal cost about the same here.",
        sub: "The fees come out within a cent on this amount — pick on features, not price.",
      };
    } else {
      const winnerName = r.winner === "stripe" ? "Stripe" : "PayPal";
      verdict =
        mode === "net"
          ? {
              text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)}.`,
              sub: `To take home ${ctx.formatCurrency(amount)}, ${winnerName} needs a smaller charge.`,
            }
          : {
              text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)} on ${ctx.formatCurrency(amount)}.`,
              sub: `${winnerName} leaves you ${ctx.formatCurrency(r.savings)} more after fees.`,
            };
    }

    return { variant: "comparison", verdict, columns: [stripeCol, paypalCol] };
  },

  howItWorks:
    "Both Stripe and PayPal charge a percentage of the payment plus a small fixed fee, so the fairest way to compare them is on the same amount, in the same country, for the same kind of transaction. This tool runs both fee formulas at once and shows what you keep on each, then names the cheaper option and the exact gap.\n\nStripe has a single standard online card rate per country — for example 2.9% + $0.30 in the US. PayPal's rate depends on the product: in the US, PayPal Checkout is 3.49% + $0.49, Goods & Services is 2.99% + $0.49, and micropayments are 4.99% + $0.09. Because the fixed fee matters most on small payments, the cheaper platform can flip depending on the amount — which is exactly what the side-by-side makes visible.\n\nInternational cards and currency conversion add surcharges on both sides, applied to whichever platform they affect. Switch to reverse mode to solve the other direction: each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the one that needs the smaller charge to hit your take-home wins.",

  seoContent: `Choosing between Stripe and PayPal usually comes down to one practical question: which one takes less of your money? This Stripe vs PayPal fee calculator answers it directly. Enter an amount, choose your country, and it computes both processors' fees at the same time, shows what you keep on each, and tells you which is cheaper and by exactly how much. No spreadsheets, no toggling between two separate calculators — one screen, both answers, side by side.

## Why a side-by-side comparison matters
Stripe and PayPal publish their pricing differently, which makes a fair comparison surprisingly hard to do by hand. Stripe quotes a single standard online card rate for each country, while PayPal splits its pricing across several products — Checkout, Goods & Services, and a special micropayments plan — each with its own percentage and fixed fee. Comparing Stripe's headline number against the wrong PayPal product gives you a misleading answer. This tool lets you pick the PayPal product you actually use so the verdict reflects your real situation, then it lines both up against the same sale.

## The fixed fee is what flips the result
The percentage rates of Stripe and PayPal are often close, so the deciding factor is frequently the fixed per-transaction fee. On a large sale, a few tenths of a percent dominate and the lower-percentage processor wins. On a small sale, the fixed fee dominates: a $0.49 fee on a $5 payment is nearly 10% before any percentage applies, which is why PayPal's low-fixed-fee micropayments plan can beat Stripe on tiny transactions even though its percentage is much higher. Because our calculator shows the effective rate — the total fee as a percentage of the sale — for both platforms, you can see precisely where the crossover happens for your typical order value.

## Country, international and currency-conversion differences
Neither processor charges one flat rate worldwide. Stripe's base rate and fixed fee vary by country, and so do PayPal's. Both add a surcharge when the customer is in another country, and both add a further fee when a currency conversion is required — but the size of those surcharges differs between the two, which can change the winner. Select your country and toggle the international and conversion options to fold those costs into the comparison. We store every rate in a single dated source file and cite the official Stripe and PayPal pricing pages, so the figures stay honest and current.

## Reverse mode for invoicing and pricing
If you need to receive a specific amount after fees — the classic freelancer or agency problem — switch to reverse mode. Each platform independently grosses the charge up using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which one needs the smaller charge to land your take-home. This is the number you put on the invoice, and it tells you instantly whether asking your client to pay via Stripe or PayPal costs them (and you) less.

## Who should use this tool
Online sellers deciding which checkout to offer, freelancers choosing how to invoice, SaaS founders comparing the cost of collecting subscription revenue, and creators picking where to take payments all face the Stripe-versus-PayPal question. The honest answer is "it depends on the amount, the country, and the product" — which is exactly why a calculator beats a blog post here. Run your real numbers and you will see the gap in seconds. Remember that fees are only one part of the decision: payout speed, dispute handling, supported countries, and checkout experience matter too, and these are estimates of standard published pricing rather than a negotiated enterprise rate. For everyday pricing decisions, though, this side-by-side gives you a fast, dependable read on which processor keeps more money in your pocket.`,

  workedExample: {
    scenario:
      "You charge a US customer $100 and they pay with a standard US card. We compare Stripe's online rate against PayPal's standard Goods & Services rate.",
    steps: [
      { label: "Stripe fee (2.9% + $0.30)", value: "$3.20" },
      { label: "Stripe — you keep", value: "$96.80" },
      { label: "PayPal Goods & Services fee (2.99% + $0.49)", value: "$3.48" },
      { label: "PayPal — you keep", value: "$96.52" },
    ],
    result: "Stripe is cheaper by $0.28 on $100",
  },

  faqs: [
    {
      q: "Is Stripe or PayPal cheaper?",
      a: "It depends on the amount, country and PayPal product. In the US, Stripe's 2.9% + $0.30 online rate is cheaper than PayPal Checkout (3.49% + $0.49) and slightly cheaper than PayPal Goods & Services (2.99% + $0.49) on a typical sale — but PayPal's low-fixed-fee micropayments plan can win on very small payments. Enter your real amount above to see the exact winner.",
    },
    {
      q: "What are Stripe vs PayPal fees on $100?",
      a: "On a $100 US sale, Stripe charges 2.9% + $0.30 = $3.20, leaving $96.80. PayPal Checkout charges 3.49% + $0.49 = $3.98, leaving $96.02 — so Stripe keeps $0.78 more. PayPal Goods & Services (2.99% + $0.49 = $3.48) leaves $96.52, still $0.28 behind Stripe.",
    },
    {
      q: "Why does PayPal sometimes beat Stripe on small payments?",
      a: "Because of the fixed fee. PayPal's micropayments plan has a much smaller fixed fee ($0.09 in the US) than Stripe's $0.30, so on low-value sales the lower fixed fee outweighs the higher percentage. The calculator's effective-rate line shows exactly where the crossover happens for your order size.",
    },
    {
      q: "Do international cards change which is cheaper?",
      a: "Yes. Both Stripe and PayPal add a surcharge for cross-border payments, and a further fee for currency conversion — but the surcharges differ in size, so the winner can change. Toggle 'International' and 'Currency conversion' above to compare with those costs included.",
    },
    {
      q: "Which PayPal rate does the comparison use?",
      a: "Whichever product you select — PayPal Checkout (the standard online card rate), Goods & Services, or Micropayments. Stripe has a single online rate, so we compare it against the PayPal product you actually use to keep the verdict fair.",
    },
    {
      q: "How do I compare what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which one needs the smaller charge to land your take-home — the number to put on your invoice.",
    },
  ],

  related: ["stripe-fee-calculator", "paypal-fee-calculator", "etsy-fee-calculator"],

  sources: [
    { label: "Stripe — pricing by country", url: "https://stripe.com/pricing" },
    { label: "PayPal — US merchant fees", url: "https://www.paypal.com/us/webapps/mpp/merchant-fees" },
    { label: "PayPal — UK business fees", url: "https://www.paypal.com/uk/business/paypal-business-fees" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-09",
};
