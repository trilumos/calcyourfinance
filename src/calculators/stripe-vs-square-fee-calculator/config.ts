import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { stripeFees, squareFees } from "../../config/fees";
import { compareStripeSquare } from "./formula";

const COUNTRIES = ["US", "CA", "AU", "GB", "IE", "FR", "ES", "JP"] as const;

export const stripeVsSquareCalculator: CalculatorConfig = {
  slug: "stripe-vs-square-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["stripe", "square"],

  comparisonGuide: {
    howToUse:
      "Enter an online sale amount and pick your country. The banner names the cheaper platform and the gap; each card shows the fee and effective rate. Add a foreign card if it applies, or switch to “I want to keep this amount” to work backwards from a target take-home.",
    notes: [
      "Compares both platforms on their standard online card rate (apples-to-apples). Square also has lower in-person and keyed rates — those aren't compared here.",
      "The winner genuinely flips by country: Stripe wins in the US, Square edges it in the UK.",
      "Covers the 8 countries Square operates in; foreign-card surcharges and Irish VAT are applied where relevant.",
      "Square's online rate is its free-plan rate. Standard published rates; estimates only, not financial advice.",
    ],
  },

  title: "Stripe vs Square Fee Calculator",
  metaDescription:
    "Compare Stripe and Square processing fees side by side on any amount, across the countries both support. See which is cheaper, what you keep on each, with foreign-card and reverse modes.",
  h1: "Stripe vs Square fee calculator",
  intro:
    "Compare Stripe and Square fees on the same online sale, side by side, and see which keeps you more. Pick your country, add a foreign card, or work backwards from a target take-home. Both are compared on their standard online card rate.",

  keywords: {
    primary: "stripe vs square fees",
    secondary: [
      "stripe vs square fee calculator",
      "square vs stripe fees",
      "stripe or square cheaper",
      "stripe vs square pricing",
      "stripe vs square cost",
      "compare stripe and square fees",
      "stripe vs square comparison",
      "is stripe cheaper than square",
    ],
    longTail: [
      "stripe vs square fees on $100",
      "which is cheaper stripe or square",
      "stripe vs square for small business",
      "stripe vs square online payments",
      "stripe vs square processing fees",
      "difference between stripe and square fees",
      "stripe vs square for online store",
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
      help: "The online sale amount you charge, or the amount you want to keep.",
    },
    {
      id: "international",
      label: "Foreign card",
      type: "toggle",
      default: false,
      help: "Card issued in another country. Adds each platform's foreign-card surcharge.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): ComparisonResult {
    const s = stripeFees[ctx.country] ?? stripeFees.US!;
    const sq = squareFees[ctx.country] ?? squareFees.US!;
    const sqOnline = sq.variants.find((v) => v.id === "online") ?? sq.variants[0];
    const mode = values.mode === "net" ? "net" : "charge";
    const amount = Number(values.amount) || 0;

    const r = compareStripeSquare({
      amount,
      mode,
      international: Boolean(values.international),
      stripe: {
        percent: s.percent,
        fixed: s.fixed,
        intlSurcharge: s.intlSurchargePercent,
        fxPercent: s.fxPercent,
        taxOnFeePercent: s.taxOnFeePercent,
      },
      square: {
        percent: sqOnline.percent,
        fixed: sqOnline.fixed,
        intlSurcharge: sq.intlSurchargePercent,
        taxOnFeePercent: sq.taxOnFeePercent,
      },
    });

    const netLabel = mode === "net" ? "You charge" : "You keep";
    const stripeCol: ComparisonColumn = {
      platform: "stripe",
      name: "Stripe",
      net: ctx.formatCurrency(mode === "net" ? r.stripe.charge : r.stripe.net),
      netLabel,
      fee: ctx.formatCurrency(r.stripe.totalFee),
      rateLabel: `${ctx.formatPercent(s.percent)} + ${ctx.formatCurrency(s.fixed)}`,
      effective: `${ctx.formatPercent(r.stripe.effectiveRate)}`,
      isWinner: r.winner === "stripe",
      note: { text: "Stripe is online-first with subscriptions, invoicing and developer APIs.", href: "/stripe-fee-calculator" },
    };
    const squareCol: ComparisonColumn = {
      platform: "square",
      name: "Square",
      net: ctx.formatCurrency(mode === "net" ? r.square.charge : r.square.net),
      netLabel,
      fee: ctx.formatCurrency(r.square.totalFee),
      rateLabel: `${ctx.formatPercent(sqOnline.percent)}${sqOnline.fixed > 0 ? ` + ${ctx.formatCurrency(sqOnline.fixed)}` : ""}`,
      effective: `${ctx.formatPercent(r.square.effectiveRate)}`,
      isWinner: r.winner === "square",
      note: { text: "Square also does in-person (lower rate) and keyed payments.", href: "/square-fee-calculator" },
    };

    let verdict: ComparisonResult["verdict"];
    if (r.winner === "tie") {
      verdict = {
        text: "Stripe and Square cost about the same here.",
        sub: "The online fees come out within a cent on this amount — pick on features, not price.",
      };
    } else {
      const winnerName = r.winner === "stripe" ? "Stripe" : "Square";
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

    return { variant: "comparison", verdict, columns: [stripeCol, squareCol] };
  },

  howItWorks:
    "Stripe and Square both charge a percentage of each sale plus a small fixed fee, so the fair way to compare them is on the same amount, in the same country, for the same kind of payment. This tool runs both fee formulas at once on their standard online card rate and shows what you keep on each, then names the cheaper option and the exact gap.\n\nIn the US, Stripe's online rate is 2.9% + $0.30 and Square's free-plan online rate is 3.3% + $0.30, so Stripe usually wins online in the US. But it flips by country: in the UK, Square's 1.4% + 20p online rate undercuts Stripe's 1.5% + 20p, so Square edges ahead. Because both carry a fixed fee, the winner can also change with the amount.\n\nForeign cards add a surcharge on both sides (the rate differs by platform and country), and you can switch to reverse mode to find what to charge so you keep a target amount — the platform needing the smaller charge wins. Note that Square is the only one of the two with in-person card rates; this comparison uses the online rate for both.",

  seoContent: `Stripe and Square are two of the most popular ways to take card payments, and for an online business the practical question is simple: which one keeps more of your money? This Stripe vs Square fee calculator answers it directly. Enter an amount, choose your country, and it computes both processors' online fees at once, shows what you keep on each, and tells you which is cheaper and by exactly how much.

## Two different products, compared fairly
Stripe is an online-first payments platform built for websites, apps, subscriptions and developers. Square started with in-person retail and point-of-sale, then added online checkout and e-commerce. Because Square's strength is the physical counter, it publishes several rates — online, in-person and keyed-in — while Stripe's standard rate is for online card payments. To keep the comparison fair, this tool lines up Stripe's online rate against Square's online rate. If you mostly sell in person, see the dedicated Square calculator, where the lower card-present rate applies.

## Why the winner changes by country
There is no universal answer to "is Stripe or Square cheaper" — it depends on where you are. In the United States, Stripe's 2.9% + $0.30 beats Square's free-plan online rate of 3.3% + $0.30, so Stripe wins a typical online sale. In the United Kingdom, the situation reverses: Square's 1.4% + 20p online rate is slightly cheaper than Stripe's 1.5% + 20p. In Australia and the eurozone the gap is different again. This calculator stores each platform's official per-country rate, so the verdict reflects your actual market rather than a US-centric assumption.

## The fixed fee and the amount matter
Both processors charge a percentage plus a fixed fee, and the fixed component has an outsized effect on small sales. On a $5 sale a $0.30 fixed fee is 6% before the percentage even applies, so the effective rate on small transactions is much higher than the headline number. Because the two platforms sometimes differ on the fixed fee, the cheaper option can flip with the amount — which is exactly why a calculator beats a static comparison table. The tool shows each platform's effective rate so you can see where the crossover happens for your typical order value.

## Foreign cards, tax and reverse mode
Cards issued in another country can cost more on both platforms, and the surcharge differs by processor and country — toggle the foreign-card option to include it. In Ireland, Square adds VAT on top of its fee, which the calculator reflects. If you need to receive a specific amount after fees, switch to reverse mode: each platform grosses the charge up independently and the one that needs the smaller charge to hit your take-home wins — the number to put on an invoice.

## Beyond the fee
Price is only part of the decision. Stripe is the stronger choice for custom online checkouts, recurring billing and developer integrations; Square is hard to beat if you also sell in person and want hardware, a point-of-sale app and no monthly fee. Both are reputable and PCI-compliant. Use this tool to settle the cost question with your real numbers, then weigh the features that matter to how you actually sell. These figures are Square's standard free-plan rates and Stripe's standard online rates; negotiated or paid-plan pricing can differ, so confirm in each dashboard before committing.`,

  workedExample: {
    scenario: "You charge a US customer $100 for an online sale. We compare Stripe's online rate against Square's free-plan online rate.",
    steps: [
      { label: "Stripe fee (2.9% + $0.30)", value: "$3.20" },
      { label: "Stripe — you keep", value: "$96.80" },
      { label: "Square fee (3.3% + $0.30)", value: "$3.60" },
      { label: "Square — you keep", value: "$96.40" },
    ],
    result: "Stripe is cheaper by $0.40 on $100",
  },

  faqs: [
    {
      q: "Is Stripe or Square cheaper?",
      a: "It depends on the country. In the US, Stripe (2.9% + $0.30) is cheaper than Square's free-plan online rate (3.3% + $0.30). In the UK it flips — Square's 1.4% + 20p edges Stripe's 1.5% + 20p. Enter your amount and country above for the exact winner.",
    },
    {
      q: "What are Stripe vs Square fees on $100?",
      a: "On a $100 US online sale, Stripe charges 2.9% + $0.30 = $3.20 (you keep $96.80) and Square charges 3.3% + $0.30 = $3.60 (you keep $96.40), so Stripe keeps $0.40 more. The gap differs in other countries.",
    },
    {
      q: "Why does this compare online rates only?",
      a: "Stripe's standard rate is for online card payments, while Square publishes separate online, in-person and keyed rates. Comparing Stripe's online rate against Square's online rate is apples-to-apples. If you sell in person, Square's lower card-present rate applies — see the Square fee calculator.",
    },
    {
      q: "Does Square have a monthly fee and Stripe doesn't?",
      a: "Neither charges a monthly fee on its standard plan — both are pay-as-you-go per transaction. Square and Stripe each offer paid tiers and custom pricing for higher volumes, which can lower the rate.",
    },
    {
      q: "Which should I choose for an online store?",
      a: "On fees alone, use the calculator for your country. On features, Stripe is stronger for custom checkouts, subscriptions and developer APIs; Square is great if you also sell in person and want POS hardware. Many businesses pick on features once the fee gap is small.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which needs the smaller charge to land your take-home.",
    },
  ],

  related: ["square-fee-calculator", "stripe-fee-calculator", "stripe-vs-paypal-fee-calculator"],

  sources: [
    { label: "Stripe — pricing by country", url: "https://stripe.com/pricing" },
    { label: "Square — US fees", url: "https://squareup.com/us/en/payments/our-fees" },
    { label: "Square — UK pricing", url: "https://squareup.com/gb/en/pricing" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-10",
};
