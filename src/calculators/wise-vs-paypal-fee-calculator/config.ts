import type {
  CalculatorConfig,
  ComparisonColumn,
  ComparisonResult,
  ComputeCtx,
  InputValues,
} from "../_types";
import { wiseCorridors, paypalIntlSend } from "../../config/fees";
import { compareWisePaypal } from "./formula";
import { formatByCurrency } from "../../lib/money";

const CORRIDOR_OPTIONS = Object.entries(wiseCorridors).map(([value, c]) => ({
  value,
  label: `${c.from} → ${c.to}`,
}));

export const wiseVsPaypalCalculator: CalculatorConfig = {
  slug: "wise-vs-paypal-fee-calculator",
  kind: "comparison",
  category: "payment-fees",
  comparisonOf: ["wise", "paypal"],

  comparisonGuide: {
    howToUse:
      "Pick your route (send → receive) and the amount you're sending. The banner names the cheaper service and the saving; each card shows the total cost and effective rate. The figures are the cost of sending — the recipient's exact amount depends on the live exchange rate at the moment you transfer.",
    notes: [
      "Compares total cost, not a live exchange rate: Wise's explicit fee at the mid-market rate vs PayPal's 5% transfer fee (capped $4.99) plus a ~4% markup hidden in a worse rate.",
      "Models a consumer cross-border send (friends & family), standard bank-funded. Card funding and PayPal's business/goods flows cost more.",
      "On small transfers (under roughly $60) Wise's fixed fee can make PayPal cheaper — the tool shows that flip honestly.",
      "Exchange rates move constantly and PayPal can vary its FX spread; estimates only — check the live rate when you send.",
    ],
  },

  title: "Wise vs PayPal Fee Calculator",
  metaDescription:
    "Compare Wise and PayPal fees for sending money abroad on any amount. See the real cost of each — Wise's mid-market rate vs PayPal's ~4% exchange-rate markup — and exactly how much you save.",
  h1: "Wise vs PayPal fee calculator",
  intro:
    "Compare what it really costs to send money abroad with Wise versus PayPal. Wise charges a small explicit fee at the mid-market rate; PayPal adds a ~4% markup hidden in a worse exchange rate. Pick your route and amount to see the true cost of each — and how much Wise saves.",

  keywords: {
    primary: "wise vs paypal fees",
    secondary: [
      "wise vs paypal",
      "paypal vs wise",
      "wise vs paypal international transfer",
      "is wise cheaper than paypal",
      "paypal vs wise fees",
      "wise or paypal cheaper",
    ],
    longTail: [
      "wise vs paypal fees on $1000",
      "wise vs paypal exchange rate markup",
      "how much cheaper is wise than paypal",
      "wise vs paypal for sending money abroad",
      "wise vs paypal for freelancers",
      "paypal vs wise international fees",
      "wise vs paypal which is cheaper",
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
      help: "The currency you're sending from and to.",
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

  compute(values: InputValues, ctx: ComputeCtx): ComparisonResult {
    const id = String(values.corridor || "USD-EUR");
    const c = wiseCorridors[id] ?? wiseCorridors["USD-EUR"]!;
    const amount = Number(values.amount) || 0;
    const fmt = (v: number) => formatByCurrency(v, c.from);

    const r = compareWisePaypal({
      amount,
      wise: { pct: c.pct, fixed: c.fixed },
      paypal: paypalIntlSend,
    });

    const wiseCol: ComparisonColumn = {
      platform: "wise",
      name: "Wise",
      net: fmt(r.wise.net),
      netLabel: "After fees",
      fee: fmt(r.wise.fee),
      rateLabel: `${ctx.formatPercent(c.pct)} + ${fmt(c.fixed)}, mid-market rate`,
      effective: `${ctx.formatPercent(r.wise.effectiveRate)}`,
      isWinner: r.winner === "wise",
      note: { text: "Uses the mid-market rate with no markup.", href: "/wise-fee-calculator" },
    };
    const paypalCol: ComparisonColumn = {
      platform: "paypal",
      name: "PayPal",
      net: fmt(r.paypal.net),
      netLabel: "After fees",
      fee: fmt(r.paypal.fee),
      rateLabel: `5% (max ${fmt(paypalIntlSend.sendFeeMax)}) + ${ctx.formatPercent(paypalIntlSend.fxMarkupPercent)} FX`,
      effective: `${ctx.formatPercent(r.paypal.effectiveRate)}`,
      isWinner: r.winner === "paypal",
      note: { text: "Adds a ~4% markup hidden in the exchange rate.", href: "/paypal-fee-calculator" },
    };

    let verdict: ComparisonResult["verdict"];
    if (r.winner === "tie") {
      verdict = { text: "Wise and PayPal cost about the same here.", sub: "The costs come out within a cent on this amount." };
    } else if (r.winner === "wise") {
      verdict = {
        text: `Wise is cheaper by ${fmt(r.savings)} on ${fmt(amount)}.`,
        sub: `PayPal's ~${paypalIntlSend.fxMarkupPercent}% exchange-rate markup is the hidden cost — Wise uses the real mid-market rate.`,
      };
    } else {
      verdict = {
        text: `PayPal is cheaper by ${fmt(r.savings)} on ${fmt(amount)}.`,
        sub: `On small transfers Wise's fixed fee can outweigh PayPal's markup — but on larger amounts Wise pulls well ahead.`,
      };
    }

    return { variant: "comparison", verdict, columns: [wiseCol, paypalCol] };
  },

  howItWorks:
    "Wise and PayPal both let you send money abroad, but they charge in completely different ways — which is why the gap can be large. Wise charges a small, explicit fee (a fixed amount plus a fraction of a percent) and converts your money at the real mid-market exchange rate, with no markup. PayPal charges a 5% transfer fee that's capped at $4.99 (so effectively a flat $4.99 on anything over ~$100), and then adds about a 4% markup to the exchange rate — a cost that's hidden in a worse rate rather than shown as a fee.\n\nThis tool computes the total cost of each on the same transfer, so you can compare like with like. On a $1,000 transfer, Wise costs roughly $10 while PayPal costs about $45 — the $4.99 fee plus $40 of hidden FX markup — so Wise saves around $35. The bigger the transfer, the bigger the saving, because PayPal's 4% markup is uncapped.\n\nOn very small transfers the picture can flip: Wise's fixed fee (around $7 from the US) is a large share of a tiny amount, so PayPal can be cheaper under roughly $60. Pick your route and amount above to see the real numbers.",

  seoContent: `Sending money abroad is exactly the situation where the headline fee hides the real cost — and the difference between Wise and PayPal is one of the clearest examples. This Wise vs PayPal fee calculator computes the true total cost of each on the same transfer, including the exchange-rate markup that PayPal doesn't show as a line item, so you can see precisely which is cheaper and by how much.

## Two very different ways to charge
Wise (formerly TransferWise) built its business on transparency: it charges a small, explicit fee — a fixed amount plus a fraction of a percent that varies by route — and converts your money at the mid-market rate, the real exchange rate you'd find on Google, with zero markup. PayPal works the opposite way. It charges a 5% international transfer fee that's capped at $4.99, which looks cheap, but then it adds roughly a 4% markup to the exchange rate it gives you. That 4% isn't shown as a fee — it's baked into a worse rate — so most people never see it. On a cross-border send where the recipient gets a different currency, that markup is the dominant cost.

## What the numbers actually look like
On a $1,000 transfer from US dollars to euros, Wise charges about $9.87. PayPal charges its $4.99 capped fee plus roughly $40 of exchange-rate markup (4% of $1,000) — about $44.99 in total. So Wise saves you around $35 on that single transfer, and because PayPal's 4% markup is uncapped, the saving grows with the amount: on $5,000 the hidden markup alone is about $200. The calculator shows the effective percentage cost for each, so you can see Wise sitting near 1% while PayPal sits near 4.5%. This is the gap the affiliate comparison articles describe but rarely quantify for your specific amount.

## When PayPal can actually be cheaper
It's not a clean sweep, and an honest calculator should say so. On very small transfers, Wise's fixed fee — around $7 when sending from the US — is a large share of the amount, while PayPal's costs scale down with the transfer. Below roughly $60, PayPal's capped fee plus markup can come out lower than Wise's fixed-fee-heavy cost. The calculator will show PayPal winning in that range. For the everyday case of sending hundreds or thousands of dollars, though, Wise is dramatically cheaper.

## Who this is for
Freelancers paid by overseas clients, people sending money to family abroad, and small businesses paying international contractors all face this choice. The instinct is to trust PayPal because the visible fee looks small, but the exchange-rate markup usually makes it the more expensive option by far. Running your real amount and route here turns that hidden cost into a concrete number. Note that this models a consumer cross-border send; PayPal's business and goods-and-services flows have their own fees, and the exact FX markup can vary slightly at checkout.

## Accuracy and notes
We model Wise's per-route fee from its published pricing and PayPal's 5%-capped transfer fee plus the 4% currency-conversion markup from PayPal's official consumer fee schedule, each stamped with a "fees last verified" date. Because the exchange rate itself moves constantly, we compare total cost (which is rate-independent) rather than quoting a live received amount — check the live rate on each service at the moment you send. These are standard published figures; PayPal reserves the right to vary its FX spread per transaction, so treat the result as a close estimate. For a fast, honest read on which service costs less to send money abroad, this side-by-side gives you the answer in seconds.`,

  workedExample: {
    scenario: "You send $1,000 from the US to a euro account.",
    steps: [
      { label: "Wise fee (0.289% + $6.98, mid-market rate)", value: "$9.87" },
      { label: "PayPal transfer fee (5%, capped)", value: "$4.99" },
      { label: "PayPal FX markup (4% of $1,000)", value: "$40.00" },
      { label: "PayPal total cost", value: "$44.99" },
    ],
    result: "Wise is cheaper by $35.12 on $1,000",
  },

  faqs: [
    {
      q: "Is Wise cheaper than PayPal?",
      a: "For sending a few hundred dollars or more abroad, yes — usually by a lot. On $1,000 USD→EUR, Wise costs about $9.87 while PayPal costs about $44.99 ($4.99 fee + ~$40 exchange-rate markup), so Wise saves around $35. On very small transfers (under ~$60) Wise's fixed fee can make PayPal cheaper.",
    },
    {
      q: "What are Wise vs PayPal fees on $1,000?",
      a: "Sending $1,000 USD→EUR, Wise charges about $9.87 (a small fee at the mid-market rate). PayPal charges its $4.99 capped transfer fee plus a ~4% exchange-rate markup ($40), about $44.99 total — so Wise keeps about $35 more in the recipient's hands.",
    },
    {
      q: "Why is PayPal so much more expensive for international transfers?",
      a: "Because of the exchange rate. PayPal's visible fee is capped at $4.99, but it adds roughly a 4% markup to the exchange rate, hidden in a worse rate rather than shown as a fee. Wise uses the real mid-market rate with no markup, so the 4% — about $40 on a $1,000 transfer — is the difference.",
    },
    {
      q: "Does this show the exact amount my recipient receives?",
      a: "It shows the total cost of each service (which doesn't depend on the live rate), not a live converted amount — exchange rates move every second. Wise uses the mid-market rate, so its cost is just the fee shown; check the live rate on each service for the exact received figure at the moment you send.",
    },
    {
      q: "Is PayPal ever cheaper than Wise?",
      a: "On very small transfers. Wise's fixed fee (around $7 from the US) is a big share of a small amount, while PayPal's cost scales down — so below roughly $60, PayPal can win. For typical transfers of hundreds or thousands, Wise is much cheaper.",
    },
  ],

  related: ["wise-fee-calculator", "paypal-fee-calculator", "payoneer-fee-calculator"],

  sources: [
    { label: "Wise — pricing", url: "https://wise.com/us/pricing/" },
    { label: "PayPal — consumer fees", url: paypalIntlSend.source },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-11",
};
