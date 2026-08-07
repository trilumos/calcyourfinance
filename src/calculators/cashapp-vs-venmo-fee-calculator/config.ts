import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { cashappFees, venmoFees } from "../../config/fees";
import { compareFlat } from "../../lib/compare";

export const cashappVsVenmoCalculator: CalculatorConfig = {
  slug: "cashapp-vs-venmo-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["cashapp", "venmo"],

  comparisonGuide: {
    howToUse:
      "Enter the payment amount. The banner names which keeps you more and by how much; each card shows the fee and effective rate. Switch to “I want to keep this amount” to work backwards from a target take-home.",
    notes: [
      "Compares a Cash App for Business account (2.75%) against a Venmo business profile (1.9% + $0.10) — the standard business receiving rate for each.",
      "US only — both are US-only services for commercial payments.",
      "Venmo usually wins on its lower percentage; Cash App's no-fixed-fee structure only narrows the gap on very small sales.",
      "Standard published rates; estimates only, not financial advice.",
    ],
  },

  title: "Cash App vs Venmo Fee Calculator",
  metaDescription:
    "Compare Cash App and Venmo fees side by side on any amount and see which keeps you more. Cash App business (2.75%) vs a Venmo business profile (1.9% + $0.10), with a reverse mode. US.",
  h1: "Cash App vs Venmo fee calculator",
  intro:
    "Compare Cash App and Venmo fees on the same payment, side by side, and see which keeps you more. We compare a Cash App for Business account against a Venmo business profile — the standard ways each charges to receive money — or work backwards from a target take-home.",

  keywords: {
    primary: "cash app vs venmo fees",
    secondary: [
      "cash app vs venmo fee calculator",
      "venmo vs cash app fees",
      "cash app or venmo cheaper",
      "cash app vs venmo for business",
      "is venmo cheaper than cash app",
      "cashapp vs venmo fees",
      "cash app vs venmo comparison",
    ],
    longTail: [
      "cash app vs venmo fees on $100",
      "which is cheaper cash app or venmo",
      "cash app vs venmo for selling",
      "cash app business vs venmo business",
      "cash app or venmo for small business fees",
      "difference between cash app and venmo fees",
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
    const vm = venmoFees.US!.variants.find((v) => v.id === "business") ?? venmoFees.US!.variants[0];
    const mode = values.mode === "net" ? "net" : "charge";
    const amount = Number(values.amount) || 0;

    const r = compareFlat(
      amount,
      mode,
      { percent: ca.percent, fixed: ca.fixed },
      { percent: vm.percent, fixed: vm.fixed },
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
      verdict = { text: "Cash App and Venmo cost about the same here.", sub: "The fees come out within a cent on this amount." };
    } else {
      const winnerName = r.winner === "a" ? "Cash App" : "Venmo";
      verdict =
        mode === "net"
          ? { text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)}.`, sub: `To take home ${ctx.formatCurrency(amount)}, ${winnerName} needs a smaller charge.` }
          : { text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)} on ${ctx.formatCurrency(amount)}.`, sub: `${winnerName} leaves you ${ctx.formatCurrency(r.savings)} more after fees.` };
    }

    return { variant: "comparison", verdict, columns: [cashappCol, venmoCol] };
  },

  howItWorks:
    "Cash App and Venmo both charge to receive commercial payments, and the rates are close. We compare a Cash App for Business account at a flat 2.75% (no fixed fee) against a Venmo business profile at 1.9% + $0.10. The tool runs both on the same payment and shows what you keep, then names the cheaper option and the exact gap.\n\nThe fee is: amount × rate% + fixed fee. Venmo's lower 1.9% percentage usually wins despite its small $0.10 fixed fee, but on very small payments Cash App's lack of a fixed fee can close or flip the gap — check your amount. Switch to reverse mode to find what to charge so you keep a target amount.\n\nBoth are US-only for commercial payments. Cash App also has instant-deposit and credit-card rates, and Venmo charges 2.99% on a personal-account Goods & Services payment — see each calculator for those variants.",

  seoContent: `Cash App and Venmo are the two dominant US mobile-payment apps, and both are increasingly used by small businesses and sellers to get paid. Their commercial fees are close enough that the winner isn't obvious — so this Cash App vs Venmo fee calculator computes both side by side, shows your net on each, and names the cheaper option and the exact difference.

## The rates we compare
For a fair comparison we use each platform's standard business receiving rate: a Cash App for Business account at a flat 2.75% with no fixed fee, against a Venmo business profile at 1.9% plus a $0.10 fixed fee. These are how a business actually accepts payment on each app. Cash App also charges for instant deposits and credit-card-funded sends, and Venmo charges 2.99% on a personal-account Goods & Services payment — but the headline comparison is business-rate versus business-rate, which is the default here.

## A close race that the amount can swing
Venmo's business profile has a lower percentage (1.9% vs 2.75%) but adds a $0.10 fixed fee; Cash App has a higher percentage but no fixed fee. On most amounts Venmo's much lower percentage wins: on a $100 payment, Venmo takes $2.00 (leaving $98.00) while Cash App takes $2.75 (leaving $97.25) — Venmo is $0.75 cheaper. The percentage difference (0.85 points) dominates at almost every realistic amount, so Venmo's $0.10 fixed fee rarely changes the outcome. Only on very small payments does Cash App's no-fixed-fee structure narrow the gap. The calculator's effective-rate line shows exactly where each lands for your amount.

## Choosing between them on more than fees
The two apps feel different in practice. Venmo leans into a social feed and is widely used among younger US consumers; Cash App pairs payments with investing and bitcoin features and a simple flat fee. Both are US-only and both require a business profile/account for compliant commercial use. If your customers strongly prefer one app, that convenience usually outweighs a sub-dollar fee difference on a typical payment. Where you're indifferent, this tool tells you which keeps more.

## Reverse mode for invoices
If you quote a fixed take-home amount, switch to reverse mode. Each platform grosses the payment up independently — Cash App as charge = target ÷ (1 − 2.75%), Venmo as charge = (target + $0.10) ÷ (1 − 1.9%) — and the calculator shows which needs the smaller payment to land your net. That's the figure to request.

## Accuracy and scope
Both apps are US-only for commercial use and their fees can change, so we store every rate in a dated source file and stamp the page with a "fees last verified" date. These are standard published rates; eligibility, promotions, and edge cases vary, and costs such as instant cash-outs, credit-card funding (Cash App), refunds or disputes apply on top. Using a personal account for ongoing business breaks both platforms' terms — a business profile (Venmo) or Cash App for Business account is the compliant route. Confirm the final number in your account before relying on it, but for a fast, honest read on which is cheaper, this side-by-side answers it in seconds.`,

  workedExample: {
    scenario: "A US customer pays you $100. We compare a Cash App for Business account against a Venmo business profile.",
    steps: [
      { label: "Cash App fee (2.75%)", value: "$2.75" },
      { label: "Cash App — you keep", value: "$97.25" },
      { label: "Venmo fee (1.9% + $0.10)", value: "$2.00" },
      { label: "Venmo — you keep", value: "$98.00" },
    ],
    result: "Venmo is cheaper by $0.75 on $100",
  },

  faqs: [
    {
      q: "Is Cash App or Venmo cheaper for business?",
      a: "Usually Venmo. A Venmo business profile charges 1.9% + $0.10, versus Cash App for Business at a flat 2.75%. On $100 that's $2.00 vs $2.75 — Venmo keeps you $0.75 more. Enter your amount above to confirm.",
    },
    {
      q: "What are Cash App vs Venmo fees on $100?",
      a: "On $100, a Venmo business profile charges 1.9% + $0.10 = $2.00 (you keep $98.00), and Cash App for Business charges 2.75% = $2.75 (you keep $97.25). Venmo is $0.75 cheaper.",
    },
    {
      q: "Does Cash App's lack of a fixed fee ever make it cheaper?",
      a: "Only on very small payments. Venmo's 1.9% is well below Cash App's 2.75%, so the percentage gap usually outweighs Venmo's $0.10 fixed fee. On tiny amounts the fixed fee matters more and the gap narrows, but Venmo still typically wins.",
    },
    {
      q: "Which app should I accept payments with?",
      a: "On fees, Venmo's business profile edges it. In practice, accept whichever your customers already use — a sub-dollar fee difference on a typical payment rarely outweighs customer convenience. Both require a business account for compliant commercial use.",
    },
    {
      q: "How do I work out what to charge to receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' Each platform grosses up independently using charge = (target + fixed) ÷ (1 − rate), and the calculator shows which needs the smaller payment to land your take-home.",
    },
  ],

  related: ["cashapp-fee-calculator", "venmo-fee-calculator", "paypal-vs-venmo-fee-calculator"],

  sources: [
    { label: "Cash App — Cash App for Business fees", url: "https://cash.app/help/us/en-us/6521-cash-app-for-business-fees" },
    { label: "Venmo — our fees", url: "https://venmo.com/resources/our-fees" },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-10",
};
