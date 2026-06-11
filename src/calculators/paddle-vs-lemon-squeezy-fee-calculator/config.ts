import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { paddleFees, lemonSqueezyFees } from "../../config/fees";
import { compareFlat } from "../../lib/compare";

export const paddleVsLemonSqueezyCalculator: CalculatorConfig = {
  slug: "paddle-vs-lemon-squeezy-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["paddle", "lemonsqueezy"],

  comparisonGuide: {
    howToUse:
      "Enter the sale price. By default both are 5% + $0.50, so a domestic sale is a tie — toggle “international card” to see Lemon Squeezy's +1.5% surcharge push Paddle ahead. Each card shows the fee and effective rate.",
    notes: [
      "Both are merchants of record at 5% + $0.50, so the fee already includes payment processing AND global sales-tax/VAT — don't add a separate processor fee.",
      "On a domestic (US-card) sale they're identical (a tie). The difference is Lemon Squeezy's +1.5% on international cards.",
      "Lemon Squeezy also has feature surcharges (subscriptions, PayPal, abandoned-cart, affiliates) not modelled here; Paddle routes sub-$10 products to custom pricing.",
      "Standard published rates; estimates only, not financial advice.",
    ],
  },

  title: "Paddle vs Lemon Squeezy Fee Calculator",
  metaDescription:
    "Compare Paddle and Lemon Squeezy fees side by side. Both merchants of record charge 5% + $0.50 — identical on domestic sales, but Lemon Squeezy adds 1.5% on international cards. See the gap.",
  h1: "Paddle vs Lemon Squeezy fee calculator",
  intro:
    "Compare Paddle and Lemon Squeezy fees on the same sale. Both are merchants of record at 5% + $0.50, so on a domestic sale they're identical — the difference shows up on international cards, where Lemon Squeezy adds 1.5%. Toggle it to see which keeps you more.",

  keywords: {
    primary: "paddle vs lemon squeezy",
    secondary: [
      "paddle vs lemon squeezy fees",
      "lemon squeezy vs paddle",
      "paddle vs lemon squeezy pricing",
      "paddle or lemon squeezy",
      "lemon squeezy vs paddle fees",
    ],
    longTail: [
      "paddle vs lemon squeezy for solo developers",
      "paddle vs lemon squeezy international fees",
      "paddle or lemon squeezy cheaper",
      "lemon squeezy vs paddle merchant of record",
      "paddle vs lemon squeezy fees on $100",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "amount",
      label: "Sale price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price your customer pays.",
    },
    {
      id: "international",
      label: "International (non-US) card",
      type: "toggle",
      default: false,
      help: "Lemon Squeezy adds 1.5% on non-US cards; Paddle's rate is flat.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): ComparisonResult {
    const intl = Boolean(values.international);
    const amount = Number(values.amount) || 0;

    const r = compareFlat(
      amount,
      "charge",
      { percent: paddleFees.percent, fixed: paddleFees.fixed },
      { percent: lemonSqueezyFees.percent, fixed: lemonSqueezyFees.fixed, extraPercent: intl ? lemonSqueezyFees.intlSurchargePercent : 0 },
    );

    const lsRate = lemonSqueezyFees.percent + (intl ? lemonSqueezyFees.intlSurchargePercent : 0);
    const paddleCol: ComparisonColumn = {
      platform: "paddle",
      name: "Paddle",
      net: ctx.formatCurrency(r.a.net),
      netLabel: "You keep",
      fee: ctx.formatCurrency(r.a.totalFee),
      rateLabel: `${ctx.formatPercent(paddleFees.percent)} + ${ctx.formatCurrency(paddleFees.fixed)}`,
      effective: `${ctx.formatPercent(r.a.effectiveRate)}`,
      isWinner: r.winner === "a",
      note: { text: "Paddle's rate is flat — no international surcharge.", href: "/paddle-fee-calculator" },
    };
    const lsCol: ComparisonColumn = {
      platform: "lemonsqueezy",
      name: "Lemon Squeezy",
      net: ctx.formatCurrency(r.b.net),
      netLabel: "You keep",
      fee: ctx.formatCurrency(r.b.totalFee),
      rateLabel: `${ctx.formatPercent(lsRate)} + ${ctx.formatCurrency(lemonSqueezyFees.fixed)}`,
      effective: `${ctx.formatPercent(r.b.effectiveRate)}`,
      isWinner: r.winner === "b",
      note: { text: "Adds 1.5% on international cards + some feature surcharges.", href: "/lemon-squeezy-fee-calculator" },
    };

    let verdict: ComparisonResult["verdict"];
    if (r.winner === "tie") {
      verdict = {
        text: "Paddle and Lemon Squeezy cost exactly the same here.",
        sub: "Both are 5% + $0.50 on a domestic sale — pick on features. Toggle an international card to see them diverge.",
      };
    } else {
      const winnerName = r.winner === "a" ? "Paddle" : "Lemon Squeezy";
      verdict = {
        text: `${winnerName} is cheaper by ${ctx.formatCurrency(r.savings)} on ${ctx.formatCurrency(amount)}.`,
        sub: `On an international card, Lemon Squeezy's +1.5% makes Paddle cheaper.`,
      };
    }

    return { variant: "comparison", verdict, columns: [paddleCol, lsCol] };
  },

  howItWorks:
    "Paddle and Lemon Squeezy are both merchants of record (MoR) for software and digital products, and they have the same headline fee: 5% + $0.50 per transaction, with global sales-tax/VAT compliance and payment processing included. So on a standard domestic (US-card) sale, they cost exactly the same — the verdict is a tie, and you should choose on features rather than price.\n\nThe difference appears on international cards: Lemon Squeezy adds 1.5% (taking it to 6.5% + $0.50), while Paddle keeps its flat 5% + $0.50. So for a business with a lot of overseas customers, Paddle comes out cheaper. Toggle the international option above to see the gap. Lemon Squeezy also applies surcharges on some features (subscriptions, PayPal, abandoned-cart recovery, affiliates) that Paddle folds into its flat rate.\n\nBecause both fees are all-in for an MoR, you don't add a separate processing fee to either.",

  seoContent: `Paddle and Lemon Squeezy are the two best-known merchant-of-record platforms for selling software and digital products — and choosing between them often comes down to fees and features. This Paddle vs Lemon Squeezy calculator settles the fee question by computing both on the same sale and showing exactly where (and whether) they differ.

## On domestic sales, they're identical
Here's the headline most comparison articles bury: Paddle and Lemon Squeezy charge the same base fee — 5% + $0.50 per transaction. Both are merchants of record, so that fee includes card processing, fraud protection, and global sales-tax/VAT compliance in every country you sell to. On a standard domestic (US-card) sale, the two are penny-for-penny identical, and our calculator will tell you so with a "they cost exactly the same" verdict. When the price is the same, the decision should rest on features, developer experience, and product direction — not cost.

## Where they diverge: international cards
The real fee difference is international payments. When a customer pays with a non-US card, Lemon Squeezy adds a 1.5% surcharge, taking its rate to 6.5% + $0.50, while Paddle keeps its flat 5% + $0.50. On a $100 international sale, that's $7.00 for Lemon Squeezy versus $5.50 for Paddle — Paddle keeps you $1.50 more. For a business whose customers are largely overseas, that 1.5% adds up quickly across a year, and it's the single most important number in this comparison. Toggle the international card option above and the calculator shows the gap on your amount.

## Beyond the headline rate
Lemon Squeezy applies a few additional surcharges that Paddle generally folds into its flat rate: subscription payments and PayPal can add a small percentage, abandoned-cart recovery adds more, and affiliate-referred orders carry an extra cut. Paddle, on the other hand, directs products priced under $10 to custom pricing. Neither difference is captured by the headline 5% + $0.50, which is exactly why a calculator that models the international case — and a clear explanation of the surcharges — is more useful than a static fee table.

## Choosing between them
On fees alone: if you sell mostly to US customers, it's a tie — pick on features. If a meaningful share of your customers pay with international cards, Paddle's flat rate is cheaper. Beyond fees, both offer subscriptions, global tax handling, and a checkout; Lemon Squeezy is known for a fast, indie-friendly setup, while Paddle has a longer enterprise track record. Note too that Stripe acquired Lemon Squeezy and now offers its own merchant-of-record product at the same 5% + $0.50 — worth factoring into a long-term choice. Run your real numbers above, then weigh the features that matter to how you sell.

## Accuracy and notes
Both platforms publish a 5% + $0.50 base rate; Lemon Squeezy's 1.5% international surcharge and feature surcharges are documented, and we stamp the page with a "fees last verified" date. These are standard published rates — large or scaling companies can negotiate custom pricing with either. Confirm the final figure in each dashboard before deciding, but for a fast, honest read on which merchant of record costs less on your sales, this side-by-side gives you the answer in seconds.`,

  workedExample: {
    scenario: "You sell a $100 product to a customer paying with an international (non-US) card.",
    steps: [
      { label: "Paddle fee (5% + $0.50)", value: "$5.50" },
      { label: "Paddle — you keep", value: "$94.50" },
      { label: "Lemon Squeezy fee (6.5% + $0.50)", value: "$7.00" },
      { label: "Lemon Squeezy — you keep", value: "$93.00" },
    ],
    result: "Paddle is cheaper by $1.50 on an international card (domestic is a tie)",
  },

  faqs: [
    {
      q: "Is Paddle or Lemon Squeezy cheaper?",
      a: "On a domestic (US-card) sale they're identical — both are 5% + $0.50. The difference is international cards: Lemon Squeezy adds 1.5% (6.5% + $0.50), while Paddle stays flat at 5% + $0.50, so Paddle is cheaper for overseas customers. Toggle the international option above to see it.",
    },
    {
      q: "What are Paddle vs Lemon Squeezy fees on $100?",
      a: "On a $100 US-card sale, both charge 5% + $0.50 = $5.50, so you keep $94.50 either way. On a $100 international-card sale, Paddle is still $5.50 (keep $94.50) but Lemon Squeezy is $7.00 (keep $93.00) — Paddle keeps you $1.50 more.",
    },
    {
      q: "Why do Paddle and Lemon Squeezy cost the same?",
      a: "Because they have the same base rate: both are merchants of record charging 5% + $0.50, with payment processing and global tax compliance included. On a domestic sale there's nothing to separate them on price, so the choice comes down to features and product direction.",
    },
    {
      q: "Which is better for international sales?",
      a: "Paddle, on fees — it keeps a flat 5% + $0.50 regardless of card origin, while Lemon Squeezy adds 1.5% on non-US cards. If a large share of your customers pay internationally, that surcharge makes Paddle the cheaper choice across a year.",
    },
    {
      q: "Do both include sales tax and VAT?",
      a: "Yes. Both are merchants of record, so their fee includes calculating, collecting and remitting sales tax and VAT worldwide, plus card processing and fraud handling. You don't add a separate processing fee to either.",
    },
  ],

  related: ["paddle-fee-calculator", "lemon-squeezy-fee-calculator", "stripe-vs-paypal-fee-calculator"],

  sources: [
    { label: "Paddle — pricing", url: paddleFees.source },
    { label: "Lemon Squeezy — fees", url: lemonSqueezyFees.source },
  ],

  feesVerifiedOn: "2026-06-11",
  lastUpdated: "2026-06-11",
};
