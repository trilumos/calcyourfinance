import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { squareFees, paypalFees } from "../../config/fees";
import { compareSquarePaypal } from "./formula";

const COUNTRIES = ["US", "CA", "AU", "GB", "IE", "FR", "ES", "JP"] as const;

export const squareVsPaypalCalculator: CalculatorConfig = {
  slug: "square-vs-paypal-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["square", "paypal"],

  comparisonGuide: {
    howToUse:
      "Enter a sale amount and pick your country. The banner shows which keeps you more; each card shows the fee and effective rate. Choose the PayPal product, add a foreign card if it applies, or switch to “I want to keep this amount” to work backwards from a target take-home.",
    notes: [
      "Compares Square's standard online rate against PayPal Goods & Services (2.99% + $0.49) by default — switch the PayPal product to Checkout or Micropayments if needed.",
      "It's close: Square's lower fixed fee wins on small sales, PayPal's lower percentage on larger ones (the crossover is around $60).",
      "Covers the 8 countries Square operates in; foreign-card surcharges and Irish VAT are applied where relevant. This uses Square's online rate — its lower in-person rates aren't compared here.",
      "Standard published rates; estimates only, not financial advice.",
    ],
  },

  title: "Square vs PayPal Fee Calculator",
  metaDescription:
    "Compare Square and PayPal fees side by side on any amount, across the countries both support. See which is cheaper, what you keep on each, with foreign-card and reverse modes.",
  h1: "Square vs PayPal fee calculator",
  intro:
    "Compare Square and PayPal fees on the same sale, side by side, and see which keeps you more. Pick your country and the PayPal product, add a foreign card, or work backwards from a target take-home. Square is compared on its online rate.",

  keywords: {
    primary: "square vs paypal fees",
    secondary: [
      "square vs paypal fee calculator",
      "paypal vs square fees",
      "square or paypal cheaper",
      "square vs paypal pricing",
      "square vs paypal cost",
      "compare square and paypal fees",
      "square vs paypal comparison",
      "is square cheaper than paypal",
    ],
    longTail: [
      "square vs paypal fees on $100",
      "which is cheaper square or paypal",
      "square vs paypal for small business",
      "square vs paypal online payments",
      "square vs paypal processing fees",
      "difference between square and paypal fees",
      "square vs paypal for invoices",
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
      help: "Square has one online rate; PayPal's depends on the product. We default to Goods & Services (the standard rate most sellers pay) — switch to Checkout or Micropayments if that's what you use.",
    },
    {
      id: "international",
      label: "Foreign / cross-border card",
      type: "toggle",
      default: false,
      help: "Card or sender in another country. Adds each platform's surcharge.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): ComparisonResult {
    const sq = squareFees[ctx.country] ?? squareFees.US!;
    const pp = paypalFees[ctx.country] ?? paypalFees.US!;
    const sqOnline = sq.variants.find((v) => v.id === "online") ?? sq.variants[0];
    const variant = pp.variants.find((v) => v.id === values.txType) ?? pp.variants[0];
    const mode = values.mode === "net" ? "net" : "charge";
    const amount = Number(values.amount) || 0;

    const r = compareSquarePaypal({
      amount,
      mode,
      international: Boolean(values.international),
      square: {
        percent: sqOnline.percent,
        fixed: sqOnline.fixed,
        intlSurcharge: sq.intlSurchargePercent,
        taxOnFeePercent: sq.taxOnFeePercent,
      },
      paypal: {
        percent: variant.percent,
        fixed: variant.fixed,
        crossBorderPercent: pp.crossBorderPercent,
      },
    });

    const netLabel = mode === "net" ? "You charge" : "You keep";
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
    const paypalCol: ComparisonColumn = {
      platform: "paypal",
      name: "PayPal",
      net: ctx.formatCurrency(mode === "net" ? r.paypal.charge : r.paypal.net),
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
        text: "Square and PayPal cost about the same here.",
        sub: "The fees come out within a cent on this amount — pick on features, not price.",
      };
    } else {
      const winnerName = r.winner === "square" ? "Square" : "PayPal";
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

    return { variant: "comparison", verdict, columns: [squareCol, paypalCol] };
  },

  howItWorks:
    "Square and PayPal both charge a percentage of the sale plus a fixed fee, so the fair comparison is on the same amount, country and kind of transaction. This tool runs both at once — Square on its online rate, PayPal on the product you choose — and shows what you keep on each, then names the cheaper option and the exact gap.\n\nIn the US, Square's free-plan online rate is 3.3% + $0.30 while PayPal's standard Goods & Services rate is 2.99% + $0.49. They're close: PayPal's lower percentage edges ahead on larger sales, while Square's lower fixed fee wins on small ones (the crossover is around $60). PayPal Checkout (3.49% + $0.49) is pricier, so Square beats that one — pick the PayPal product above to compare the right one.\n\nForeign or cross-border cards add a surcharge on both sides, and you can switch to reverse mode to find what to charge so you keep a target amount. Square also has lower in-person rates; this comparison uses Square's online rate to match PayPal's online products.",

  seoContent: `Square and PayPal are both household names for taking payments, but they're built around different needs — and their fees reflect that. This Square vs PayPal fee calculator settles the cost question: enter an amount, pick your country and the PayPal product you use, and it computes both processors' fees at once, shows what you keep on each, and names the cheaper option and the exact difference.

## Comparing the right products
PayPal prices by product — Checkout (the branded online button), Goods & Services (receiving money), and a micropayments plan for very small sales — each with its own percentage and fixed fee. Square publishes online, in-person and keyed rates. To compare fairly, this tool puts Square's online rate against the PayPal product you select. That choice matters: PayPal Checkout and PayPal micropayments can give opposite verdicts against the same Square rate, so picking the product you actually use is what makes the answer trustworthy.

## Why the fixed fee decides the winner
Both processors charge a percentage plus a fixed fee, and against PayPal's standard Goods & Services rate the two are remarkably close. Square is 3.3% + $0.30; PayPal Goods & Services is 2.99% + $0.49. PayPal's percentage is lower but its fixed fee is higher, so Square's smaller $0.30 fixed fee wins on small sales while PayPal's lower 2.99% wins on larger ones — the crossover sits around $60, and on a $100 sale PayPal edges it by about $0.12. (Against PayPal Checkout at 3.49%, Square wins outright; PayPal's micropayments plan, with its tiny $0.09 fixed fee, beats Square on very small sales.) Because the calculator shows each platform's effective rate, you can see exactly where the crossover happens for your order sizes — and the PayPal product you pick changes the answer, so choose the one you actually use.

## Country differences and foreign cards
Neither processor charges one flat rate worldwide. Square operates in eight countries with distinct per-country rates, and PayPal's commercial rate varies by country too. Cards from another country add a surcharge on both — Square adds a foreign-card surcharge on its online rate, and PayPal adds a cross-border fee — and the amounts differ, which can change the winner. Select your country and toggle the foreign-card option to fold those costs in. In Ireland, Square adds VAT on top of its fee, which the calculator reflects.

## Reverse mode for invoicing
If you quote a fixed take-home figure, switch to reverse mode. Each platform grosses the charge up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which one needs the smaller charge to land your net — the number to put on the invoice or the price tag.

## Picking on more than price
Fees are only part of the story. PayPal offers instant brand recognition at checkout and buyer trust, which can lift conversion; Square is excellent if you also sell in person and want a free point-of-sale app and hardware, with no monthly fee. Square's online tools are simpler than Stripe's but cover most small-business needs, while PayPal is ubiquitous and easy for customers who already have an account. Use this calculator to settle the cost comparison with your real numbers, then weigh checkout experience, payout speed and the way you actually sell. These are standard published rates; negotiated or higher-volume pricing can differ, so confirm in each dashboard before deciding.`,

  workedExample: {
    scenario: "You charge a US customer $100. We compare Square's online rate against PayPal's standard Goods & Services rate.",
    steps: [
      { label: "Square fee (3.3% + $0.30)", value: "$3.60" },
      { label: "Square — you keep", value: "$96.40" },
      { label: "PayPal Goods & Services fee (2.99% + $0.49)", value: "$3.48" },
      { label: "PayPal — you keep", value: "$96.52" },
    ],
    result: "PayPal is cheaper by $0.12 on $100",
  },

  faqs: [
    {
      q: "Is Square or PayPal cheaper?",
      a: "It's close and depends on the amount. Against PayPal's standard Goods & Services rate (2.99% + $0.49), Square's lower fixed fee wins on small sales while PayPal's lower percentage wins on larger ones — the crossover is around $60, so on $100 PayPal edges it by about $0.12. Against PayPal Checkout (3.49%), Square wins. Pick the PayPal product and enter your amount for the exact answer.",
    },
    {
      q: "What are Square vs PayPal fees on $100?",
      a: "On a $100 US sale, Square charges 3.3% + $0.30 = $3.60 (you keep $96.40) and PayPal Goods & Services charges 2.99% + $0.49 = $3.48 (you keep $96.52) — PayPal keeps $0.12 more. Against PayPal Checkout (3.49% + $0.49 = $3.98), Square wins by $0.38.",
    },
    {
      q: "Why does the PayPal rate change the result so much?",
      a: "Because PayPal prices by product. Checkout, Goods & Services and Micropayments have different percentages and fixed fees, so against the same Square rate they can give different winners. Always compare the PayPal product you actually use — select it above.",
    },
    {
      q: "Does either charge a monthly fee?",
      a: "No. Both Square and PayPal are pay-as-you-go on their standard plans — no monthly fee, you pay per transaction. Each offers paid add-ons and volume pricing that can change the rate.",
    },
    {
      q: "Which is better for an online store?",
      a: "On fees, use the calculator for your country and product. On experience, PayPal's branded checkout can boost trust and conversion; Square is great if you also sell in person and want a free POS. Many sellers offer both at checkout.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which needs the smaller charge to land your take-home.",
    },
  ],

  related: ["square-fee-calculator", "paypal-fee-calculator", "stripe-vs-paypal-fee-calculator"],

  sources: [
    { label: "Square — US fees", url: "https://squareup.com/us/en/payments/our-fees" },
    { label: "PayPal — US merchant fees", url: "https://www.paypal.com/us/webapps/mpp/merchant-fees" },
    { label: "Square — UK pricing", url: "https://squareup.com/gb/en/pricing" },
  ],

  feesVerifiedOn: "2026-06-10",
  lastUpdated: "2026-06-10",
};
