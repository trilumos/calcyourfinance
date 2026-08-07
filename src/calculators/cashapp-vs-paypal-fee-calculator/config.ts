import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { cashappFees, paypalFees } from "../../config/fees";
import { compareFlat } from "../../lib/compare";

export const cashappVsPaypalCalculator: CalculatorConfig = {
  slug: "cashapp-vs-paypal-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["cashapp", "paypal"],

  comparisonGuide: {
    howToUse:
      "Enter the payment amount. The banner names which keeps you more and by how much; each card shows the fee and effective rate. Switch to “I want to keep this amount” to work backwards from a target take-home.",
    notes: [
      "Compares a Cash App for Business account (flat 2.75%, no fixed fee) against PayPal Goods & Services (2.99% + $0.49).",
      "US only — both are US-only services for commercial payments.",
      "Cash App's instant-deposit and credit-card rates, and PayPal's other products, differ — see each single calculator.",
      "Standard published rates; estimates only, not financial advice.",
    ],
  },

  title: "Cash App vs PayPal Fee Calculator",
  metaDescription:
    "Compare Cash App and PayPal fees side by side on any amount and see which keeps you more. Cash App business (2.75%) vs PayPal Goods & Services, with a reverse mode. US.",
  h1: "Cash App vs PayPal fee calculator",
  intro:
    "Compare Cash App and PayPal fees on the same payment, side by side, and see which keeps you more. We compare a Cash App for Business account against PayPal Goods & Services — the standard ways each charges to receive money — or work backwards from a target take-home.",

  keywords: {
    primary: "cash app vs paypal fees",
    secondary: [
      "cash app vs paypal fee calculator",
      "paypal vs cash app fees",
      "cash app or paypal cheaper",
      "cash app vs paypal for business",
      "is cash app cheaper than paypal",
      "cashapp vs paypal fees",
      "cash app vs paypal comparison",
    ],
    longTail: [
      "cash app vs paypal fees on $100",
      "which is cheaper cash app or paypal",
      "cash app vs paypal for selling",
      "cash app business vs paypal goods and services",
      "cash app or paypal for small business fees",
      "difference between cash app and paypal fees",
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
  ],

  compute(values: InputValues, ctx: ComputeCtx): ComparisonResult {
    const ca = cashappFees.US!.variants.find((v) => v.id === "business") ?? cashappFees.US!.variants[0];
    const pp = paypalFees.US!.variants.find((v) => v.id === "goods") ?? paypalFees.US!.variants[0];
    const mode = values.mode === "net" ? "net" : "charge";
    const amount = Number(values.amount) || 0;

    const r = compareFlat(
      amount,
      mode,
      { percent: ca.percent, fixed: ca.fixed },
      { percent: pp.percent, fixed: pp.fixed },
    );

    const netLabel = mode === "net" ? "You charge" : "You keep";
    const cashappCol: ComparisonColumn = {
      platform: "cashapp",
      name: "Cash App",
      net: ctx.formatCurrency(mode === "net" ? r.a.charge : r.a.net),
      netLabel,
      fee: ctx.formatCurrency(r.a.totalFee),
      rateLabel: `${ctx.formatPercent(ca.percent)}`,
      effective: `${ctx.formatPercent(r.a.effectiveRate)}`,
      isWinner: r.winner === "a",
      note: { text: "Cash App also has instant-deposit and credit-card rates.", href: "/cashapp-fee-calculator" },
    };
    const paypalCol: ComparisonColumn = {
      platform: "paypal",
      name: "PayPal",
      net: ctx.formatCurrency(mode === "net" ? r.b.charge : r.b.net),
      netLabel,
      fee: ctx.formatCurrency(r.b.totalFee),
      rateLabel: `${ctx.formatPercent(pp.percent)} + ${ctx.formatCurrency(pp.fixed)}`,
      effective: `${ctx.formatPercent(r.b.effectiveRate)}`,
      isWinner: r.winner === "b",
      note: { text: "PayPal also has Checkout and micropayments rates.", href: "/paypal-fee-calculator" },
    };

    let verdict: ComparisonResult["verdict"];
    if (r.winner === "tie") {
      verdict = { text: "Cash App and PayPal cost about the same here.", sub: "The fees come out within a cent on this amount." };
    } else {
      const winnerName = r.winner === "a" ? "Cash App" : "PayPal";
      verdict =
        mode === "net"
          ? { text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)}.`, sub: `To take home ${ctx.formatCurrency(amount)}, ${winnerName} needs a smaller charge.` }
          : { text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)} on ${ctx.formatCurrency(amount)}.`, sub: `${winnerName} leaves you ${ctx.formatCurrency(r.savings)} more after fees.` };
    }

    return { variant: "comparison", verdict, columns: [cashappCol, paypalCol] };
  },

  howItWorks:
    "Cash App and PayPal charge differently to receive money. We compare the standard commercial rate for each: a Cash App for Business account at a flat 2.75% (no fixed fee), against PayPal Goods & Services at 2.99% + $0.49. The tool runs both on the same payment and shows what you keep, then names the cheaper option and the exact gap.\n\nThe fee is: amount × rate% + fixed fee. Cash App's flat 2.75% and lack of a fixed fee make it cheaper on most amounts, and the gap is largest on small payments where PayPal's $0.49 fixed fee bites. Switch to reverse mode to find what to charge so you keep a target amount.\n\nBoth are US-only for commercial payments. Cash App also has instant-deposit and credit-card rates, and PayPal has Checkout and micropayments rates — see each calculator for those variants.",

  seoContent: `Cash App and PayPal are two of the most popular ways for US individuals and small businesses to send and receive money — and they price receiving payments quite differently. This Cash App vs PayPal fee calculator settles which keeps you more: enter an amount and it computes both fees side by side, shows your net on each, and names the cheaper option and the exact difference.

## The rates we compare
To compare like with like, we use each platform's standard commercial receiving rate: a Cash App for Business account at a flat 2.75% with no fixed fee, against PayPal Goods & Services at 2.99% plus a $0.49 fixed fee. Those are how a seller or business actually gets paid. Cash App also charges for instant deposits and credit-card-funded sends, and PayPal has separate Checkout and micropayments rates — but the comparison most people want is commercial-rate versus commercial-rate, which is the default here.

## Why Cash App usually wins — and where it's closest
Cash App's flat 2.75% with no fixed fee makes it cheaper than PayPal Goods & Services on virtually every amount. On a $100 payment, Cash App takes $2.75 (leaving $97.25) while PayPal takes $3.48 (leaving $96.52) — a $0.73 difference. The advantage grows on small payments because PayPal's $0.49 fixed fee is a big share of a small sale, while Cash App has no fixed fee at all. On larger amounts the two percentages (2.75% vs 2.99%) converge, so the gap narrows in percentage terms but Cash App still edges ahead. The calculator's effective-rate line shows exactly how the difference behaves at your amount.

## Where PayPal is still the better tool
Lower fees aren't everything. PayPal works internationally, integrates with nearly every online store, and offers established buyer and seller protection and dispute resolution — Cash App is US-only and built around fast, simple peer-to-peer and small-business payments. If you sell across borders, run a full e-commerce checkout, or want robust protection on higher-value transactions, PayPal's extra cost can be justified. For straightforward domestic payments where both sides use Cash App, the flat 2.75% is hard to beat.

## Reverse mode for pricing and invoices
If you quote a fixed take-home amount, switch to reverse mode. Each platform grosses the payment up independently — Cash App as charge = target ÷ (1 − 2.75%), PayPal as charge = (target + $0.49) ÷ (1 − 2.99%) — and the calculator shows which needs the smaller payment to land your net. That's the figure to put on an invoice or payment request.

## Accuracy and scope
Both platforms are US-only for commercial use, and their fees can change, so we keep every rate in a dated source file and stamp the page with a "fees last verified" date. These are standard published rates; eligibility, promotions, and edge cases vary, and costs such as refunds, disputes, instant cash-outs (Cash App) or credit-card funding apply on top. Using a personal account for ongoing business breaks both platforms' terms — a Cash App for Business account or a PayPal business account is the compliant route. Confirm the final number in your account before relying on it, but for a quick, honest read on which is cheaper, this side-by-side answers it in seconds.`,

  workedExample: {
    scenario: "A US customer pays you $100. We compare a Cash App for Business account against PayPal Goods & Services.",
    steps: [
      { label: "Cash App fee (2.75%)", value: "$2.75" },
      { label: "Cash App — you keep", value: "$97.25" },
      { label: "PayPal fee (2.99% + $0.49)", value: "$3.48" },
      { label: "PayPal — you keep", value: "$96.52" },
    ],
    result: "Cash App is cheaper by $0.73 on $100",
  },

  faqs: [
    {
      q: "Is Cash App or PayPal cheaper?",
      a: "For receiving money, Cash App is usually cheaper. Cash App for Business is a flat 2.75% with no fixed fee, versus PayPal Goods & Services at 2.99% + $0.49. On $100 that's $2.75 vs $3.48 — Cash App keeps you $0.73 more, and more on small sales.",
    },
    {
      q: "What are Cash App vs PayPal fees on $100?",
      a: "On $100, Cash App for Business charges 2.75% = $2.75 (you keep $97.25), and PayPal Goods & Services charges 2.99% + $0.49 = $3.48 (you keep $96.52). Cash App is $0.73 cheaper.",
    },
    {
      q: "Why is Cash App cheaper, especially on small payments?",
      a: "Cash App has no fixed per-transaction fee, while PayPal adds $0.49. On a small sale that fixed fee is a large share of the total, so Cash App's flat 2.75% pulls further ahead the smaller the payment.",
    },
    {
      q: "Which should I use for an online store?",
      a: "PayPal — it integrates with virtually every e-commerce platform, works internationally, and offers buyer/seller protection. Cash App is best for simple domestic payments. Use the calculator to see exactly what the convenience costs.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which needs the smaller payment to land your take-home.",
    },
  ],

  related: ["cashapp-fee-calculator", "paypal-fee-calculator", "paypal-vs-venmo-fee-calculator"],

  sources: [
    { label: "Cash App — Cash App for Business fees", url: "https://cash.app/help/us/en-us/6521-cash-app-for-business-fees" },
    { label: "PayPal — US merchant fees", url: "https://www.paypal.com/us/webapps/mpp/merchant-fees" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-10",
};
