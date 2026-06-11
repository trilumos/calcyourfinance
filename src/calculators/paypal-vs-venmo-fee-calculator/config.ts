import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { paypalFees, venmoFees } from "../../config/fees";
import { compareFlat } from "../../lib/compare";

export const paypalVsVenmoCalculator: CalculatorConfig = {
  slug: "paypal-vs-venmo-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["paypal", "venmo"],

  comparisonGuide: {
    howToUse:
      "Enter the payment amount. The banner names which keeps you more and by how much; each card shows the fee and effective rate. Switch to “I want to keep this amount” to work backwards from a target take-home.",
    notes: [
      "Compares PayPal Goods & Services (2.99% + $0.49) against a Venmo business profile (1.9% + $0.10) — the standard ways each charges to receive money.",
      "US only — both are US-only services for commercial payments.",
      "Venmo's personal-account Goods & Services rate (2.99%) and PayPal's other products differ — see each single calculator for those.",
      "Standard published rates; estimates only, not financial advice.",
    ],
  },

  title: "PayPal vs Venmo Fee Calculator",
  metaDescription:
    "Compare PayPal and Venmo fees side by side on any amount and see which keeps you more. PayPal Goods & Services vs a Venmo business profile, with a reverse mode. US.",
  h1: "PayPal vs Venmo fee calculator",
  intro:
    "Compare PayPal and Venmo fees on the same payment, side by side, and see which keeps you more. We compare PayPal Goods & Services against a Venmo business profile — the standard ways each charges to receive money — or work backwards from a target take-home.",

  keywords: {
    primary: "paypal vs venmo fees",
    secondary: [
      "paypal vs venmo fee calculator",
      "venmo vs paypal fees",
      "paypal or venmo cheaper",
      "paypal vs venmo for business",
      "paypal vs venmo business fees",
      "is venmo cheaper than paypal",
      "paypal vs venmo comparison",
    ],
    longTail: [
      "paypal vs venmo fees on $100",
      "which is cheaper paypal or venmo",
      "paypal vs venmo for selling",
      "paypal goods and services vs venmo",
      "venmo or paypal for small business fees",
      "difference between paypal and venmo fees",
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
    const pp = paypalFees.US!.variants.find((v) => v.id === "goods") ?? paypalFees.US!.variants[0];
    const vm = venmoFees.US!.variants.find((v) => v.id === "business") ?? venmoFees.US!.variants[0];
    const mode = values.mode === "net" ? "net" : "charge";
    const amount = Number(values.amount) || 0;

    const r = compareFlat(
      amount,
      mode,
      { percent: pp.percent, fixed: pp.fixed },
      { percent: vm.percent, fixed: vm.fixed },
    );

    const netLabel = mode === "net" ? "You charge" : "You keep";
    const paypalCol: ComparisonColumn = {
      platform: "paypal",
      name: "PayPal",
      net: ctx.formatCurrency(mode === "net" ? r.a.charge : r.a.net),
      netLabel,
      fee: ctx.formatCurrency(r.a.totalFee),
      rateLabel: `${ctx.formatPercent(pp.percent)} + ${ctx.formatCurrency(pp.fixed)}`,
      effective: `${ctx.formatPercent(r.a.effectiveRate)}`,
      isWinner: r.winner === "a",
      note: { text: "PayPal also has Checkout and micropayments rates.", href: "/paypal-fee-calculator" },
    };
    const venmoCol: ComparisonColumn = {
      platform: "venmo",
      name: "Venmo",
      net: ctx.formatCurrency(mode === "net" ? r.b.charge : r.b.net),
      netLabel,
      fee: ctx.formatCurrency(r.b.totalFee),
      rateLabel: `${ctx.formatPercent(vm.percent)} + ${ctx.formatCurrency(vm.fixed)}`,
      effective: `${ctx.formatPercent(r.b.effectiveRate)}`,
      isWinner: r.winner === "b",
      note: { text: "Venmo's personal Goods & Services rate is 2.99%.", href: "/venmo-fee-calculator" },
    };

    let verdict: ComparisonResult["verdict"];
    if (r.winner === "tie") {
      verdict = { text: "PayPal and Venmo cost about the same here.", sub: "The fees come out within a cent on this amount." };
    } else {
      const winnerName = r.winner === "a" ? "PayPal" : "Venmo";
      verdict =
        mode === "net"
          ? { text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)}.`, sub: `To take home ${ctx.formatCurrency(amount)}, ${winnerName} needs a smaller charge.` }
          : { text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)} on ${ctx.formatCurrency(amount)}.`, sub: `${winnerName} leaves you ${ctx.formatCurrency(r.savings)} more after fees.` };
    }

    return { variant: "comparison", verdict, columns: [paypalCol, venmoCol] };
  },

  howItWorks:
    "PayPal and Venmo are both owned by PayPal, but they charge differently to receive money. We compare the standard commercial rate for each: PayPal Goods & Services at 2.99% + $0.49, against a Venmo business profile at 1.9% + $0.10. The tool runs both on the same payment and shows what you keep, then names the cheaper option and the exact gap.\n\nThe fee is: amount × rate% + fixed fee. On typical amounts Venmo's lower percentage and much smaller fixed fee make it cheaper, but you can check any amount. Switch to reverse mode to find what to charge so you keep a target amount — the platform needing the smaller charge wins.\n\nBoth are US-only for commercial payments. PayPal also offers Checkout and micropayments rates, and Venmo charges 2.99% on a personal-account Goods & Services payment — see each calculator for those variants.",

  seoContent: `PayPal and Venmo are the two biggest names in US peer-to-peer and small-business payments — and, despite both being owned by PayPal, they charge very different fees to receive money. This PayPal vs Venmo fee calculator settles which keeps you more: enter an amount, and it computes both fees side by side, shows your net on each, and names the cheaper option and the exact difference.

## Which rates we compare, and why
A fair comparison has to line up the equivalent products. For receiving commercial payments, the standard rates are PayPal Goods & Services at 2.99% plus a $0.49 fixed fee, and a Venmo business profile at 1.9% plus a $0.10 fixed fee. Those are the two this tool compares by default, because they're how a business or seller actually gets paid on each platform. PayPal also has a Checkout rate (3.49% + $0.49) and a micropayments plan, and Venmo charges 2.99% on a personal-account Goods & Services payment — but the headline comparison most people want is commercial-rate versus commercial-rate, which is what you see here.

## Why Venmo usually wins on fees
Venmo's business-profile rate is both a lower percentage (1.9% vs 2.99%) and a far smaller fixed fee ($0.10 vs $0.49), so on almost any normal payment Venmo keeps you more. On a $100 payment, PayPal Goods & Services takes $3.48 (leaving $96.52) while a Venmo business profile takes $2.00 (leaving $98.00) — a $1.48 difference. The gap is widest on small payments, where PayPal's $0.49 fixed fee dominates: on a $10 sale that fixed fee alone is nearly 5% before the percentage applies. The calculator shows each platform's effective rate so you can see exactly how the difference scales with the amount.

## When PayPal still makes sense
Cheaper isn't the whole story. PayPal offers broader buyer and seller protections, works internationally, integrates with virtually every e-commerce platform, and is trusted by customers worldwide — Venmo is US-only and built around a social, mobile-first experience. If you sell across borders, need a full online checkout, or want the dispute infrastructure PayPal provides, the extra fee may be worth it. For domestic, person-to-business payments where both parties already use the app, Venmo's lower fee is hard to beat. This tool answers the cost question; weigh the features against your own needs.

## Reverse mode for invoicing
If you quote a fixed take-home figure, switch to reverse mode. Each platform grosses the payment up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which one needs the smaller payment to land your net. That's the number to put on an invoice or request, and it tells you instantly whether asking to be paid by PayPal or Venmo costs less.

## Accuracy and scope
Both services are US-only for commercial use and their fees can change, so we store every rate in a dated source file and stamp the page with a "fees last verified" date. These are standard published rates; account eligibility, promotions, and edge cases can vary, and costs such as refunds (where the fixed fee may not be returned) or instant-transfer cash-outs apply on top. Using a personal account for ongoing business breaks both platforms' terms — a business profile (Venmo) or business account (PayPal) is the compliant route. Confirm the final figure in your account before relying on it, but for a fast, honest read on which is cheaper, this side-by-side gives you the answer in seconds.`,

  workedExample: {
    scenario: "A US customer pays you $100. We compare PayPal Goods & Services against a Venmo business profile.",
    steps: [
      { label: "PayPal fee (2.99% + $0.49)", value: "$3.48" },
      { label: "PayPal — you keep", value: "$96.52" },
      { label: "Venmo fee (1.9% + $0.10)", value: "$2.00" },
      { label: "Venmo — you keep", value: "$98.00" },
    ],
    result: "Venmo is cheaper by $1.48 on $100",
  },

  faqs: [
    {
      q: "Is PayPal or Venmo cheaper?",
      a: "For receiving money, Venmo is usually cheaper. A Venmo business profile charges 1.9% + $0.10, versus PayPal Goods & Services at 2.99% + $0.49. On $100 that's $2.00 vs $3.48 — Venmo keeps you $1.48 more. Enter your amount above to check.",
    },
    {
      q: "What are PayPal vs Venmo fees on $100?",
      a: "On a $100 payment, PayPal Goods & Services charges 2.99% + $0.49 = $3.48 (you keep $96.52), and a Venmo business profile charges 1.9% + $0.10 = $2.00 (you keep $98.00). Venmo is $1.48 cheaper.",
    },
    {
      q: "Why is Venmo cheaper than PayPal if PayPal owns Venmo?",
      a: "They target different uses. Venmo is US-only and mobile/social-first with a lower business rate; PayPal charges more but adds international support, full checkout integration, and broader buyer/seller protection. The fee difference reflects those different feature sets.",
    },
    {
      q: "Which should I use to get paid for a small sale?",
      a: "On fees, Venmo — its tiny $0.10 fixed fee beats PayPal's $0.49, and the gap is largest on small amounts. But if the buyer is international or you need purchase protection and checkout tools, PayPal may still be worth the higher fee.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which needs the smaller payment to land your take-home.",
    },
  ],

  related: ["venmo-fee-calculator", "paypal-fee-calculator", "cashapp-vs-paypal-fee-calculator"],

  sources: [
    { label: "PayPal — US merchant fees", url: "https://www.paypal.com/us/webapps/mpp/merchant-fees" },
    { label: "Venmo — our fees", url: "https://venmo.com/resources/our-fees" },
  ],

  feesVerifiedOn: "2026-06-10",
  lastUpdated: "2026-06-10",
};
