import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import type { CountryCode } from "../../lib/countries";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const COUNTRIES: CountryCode[] = ["US", "GB", "CA", "AU", "EU", "IN", "SG", "DE", "FR", "JP", "BR"];

export const appStoreFeeCalculator: CalculatorConfig = {
  slug: "app-store-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",
  platform: "appstore",

  title: "App Store & Google Play Fee Calculator",
  metaDescription:
    "Free App Store & Google Play fee calculator. See exactly what Apple or Google takes from an app sale, in-app purchase or subscription — 30%, 15% (Small Business / subscriptions) or the 2026 reduced rates — and what you keep.",
  h1: "App Store & Google Play Fee Calculator.",
  intro:
    "Work out what Apple's App Store or Google Play takes from a sale, in-app purchase or subscription, and what actually reaches you. Pick your commission rate — the standard 30%, the 15% Small Business / subscription rate, or the reduced 2026 rates — and enter the price.",

  keywords: {
    primary: "app store fee calculator",
    secondary: [
      "apple app store commission calculator",
      "google play fee calculator",
      "in app purchase fee calculator",
      "app store commission calculator",
      "app store 30 percent calculator",
    ],
    longTail: [
      "how much does apple take from app sales",
      "how much does google play take",
      "small business program 15 percent calculator",
      "app subscription fee calculator",
      "app store cut calculator",
      "google play commission calculator",
      "app store fee calculator uk",
      "developer proceeds calculator",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: COUNTRIES, default: "US" },

  inputs: [
    {
      id: "store",
      label: "Store",
      type: "select",
      default: "apple",
      options: [
        { value: "apple", label: "Apple App Store" },
        { value: "google", label: "Google Play" },
      ],
      help: "Apple and Google use the same 30% / 15% commission tiers.",
    },
    {
      id: "price",
      label: "Price (or in-app purchase / subscription amount)",
      type: "currency",
      default: 4.99,
      min: 0,
    },
    {
      id: "commission",
      label: "Commission rate",
      type: "select",
      default: "30",
      options: [
        { value: "30", label: "Standard — 30%" },
        { value: "20", label: "Reduced IAP, US/UK/EEA 2026 — 20%" },
        { value: "15", label: "Small Business Program / subscriptions — 15%" },
        { value: "10", label: "Reduced subscriptions, US/UK/EEA 2026 — 10%" },
      ],
      help: "30% is the default; 15% applies under the Small Business Program (<$1M/yr) and to subscriptions after year one (day one on Google Play).",
    },
    { id: "units", label: "Units sold (optional)", type: "number", default: 1, min: 1, step: 1, help: "Multiply the result across this many sales." },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const price = Math.max(0, Number(values.price) || 0);
    const commission = Number(values.commission) || 30;
    const units = Math.max(1, Number(values.units) || 1);
    const store = values.store === "google" ? "Google Play" : "Apple";

    const r = computeMarketplaceFee({ itemPrice: price, sellingPercent: commission });
    const perUnitKeep = r.payout;

    return {
      headline: {
        label: units > 1 ? `You keep (${units} sales)` : "You keep",
        display: ctx.formatCurrency(perUnitKeep * units),
        sub: `${store} takes ${ctx.formatPercent(commission)} — ${ctx.formatCurrency(r.sellingFee * units)} in commission`,
      },
      rows: [
        { label: "Buyer pays", display: ctx.formatCurrency(price * units) },
        { label: `${store} commission (${ctx.formatPercent(commission)})`, display: ctx.formatCurrency(r.sellingFee * units), kind: "deduction" },
        { label: "Your proceeds", display: ctx.formatCurrency(perUnitKeep * units), kind: "net" },
      ],
    };
  },

  howItWorks:
    "Apple's App Store and Google Play both take a commission on paid apps, in-app purchases and subscriptions, and pay you the rest. The math is simple: proceeds = price × (1 − commission). At the standard 30%, a $4.99 sale nets you $3.49; Apple or Google keeps $1.50.\n\nThe rate depends on your situation. The standard commission is 30%. It drops to 15% under Apple's Small Business Program (for developers with under $1M in proceeds in the prior year) and Google Play's equivalent (Google charges 15% on the first $1M of earnings each year, 30% above). Subscriptions are 15% — on Apple after a subscriber's first year, and on Google Play from day one.\n\nFollowing the Epic settlement, from June 30 2026 the standard in-app-purchase commission is being reduced to 20% (and subscriptions from 15% to 10%) in the US, UK and EEA, rolling out globally by 2027 — pick the rate that matches your region and product. Commissions are taken from the price the buyer pays; the buyer's own payment processing is included in the store's cut, so there's no separate card fee for you to add.",

  seoContent: `This App Store and Google Play fee calculator shows exactly how much Apple or Google takes from a sale — a paid app, an in-app purchase, or a subscription — and how much reaches you as developer proceeds. Enter the price and choose your commission rate to see the split instantly.

## The commission rates, explained

Both Apple's App Store and Google Play run on a commission model: they process the payment, handle billing and refunds, and keep a percentage of every transaction. The rates are the same on both stores:

- **30% — the standard rate.** Applies to paid apps and in-app purchases for developers not in a reduced-rate program.
- **15% — the Small Business Program rate.** Apple applies 15% to all proceeds for developers who earned under $1 million in the prior calendar year and enrolled in the Small Business Program. Google Play applies 15% to the first $1 million of earnings you make each year automatically, and 30% only on revenue above that.
- **15% — subscriptions.** On Apple, a subscription drops from 30% to 15% after a subscriber has been paying for one year. On Google Play, subscriptions are 15% from day one.

## The 2026 reduction (US, UK, EEA)

Following Apple's settlement with Epic Games, from June 30 2026 the standard in-app-purchase commission is being reduced to **20%** (and subscriptions from 15% to **10%**) in the United States, United Kingdom and the European Economic Area, with a global rollout expected by 2027. If you sell in those regions, use the reduced rate that matches your product. Because the rollout is regional and staged, this calculator lets you pick the exact rate rather than guessing.

## How the calculation works

The math is a single line: your proceeds = price × (1 − commission rate). At 30% on a $4.99 purchase you keep $3.49; at 15% you keep $4.24; at 20% you keep $3.99. The commission is deducted from the price the buyer pays, and it already covers the store's payment processing — so unlike a standalone payment processor, there is no separate percentage-plus-fixed card fee to add on top. What you see here is your gross developer proceeds before your own income tax and any applicable local sales tax or VAT, which the stores typically collect and remit separately.

## Small Business Program vs. standard

For most indie and small developers, the single biggest lever on take-home is enrolling in Apple's Small Business Program (or benefiting from Google's automatic $1M threshold). Halving the commission from 30% to 15% doubles the effective margin on every sale below the $1M line. If you earned under $1 million last year and haven't enrolled with Apple, that is almost certainly worth doing — run the calculator at 30% and then 15% to see the difference on your typical price point.

## Alternative billing and external purchase links

Both stores now allow, in some regions, linking out to an external website for purchase or using alternative billing — which can reduce or change the commission (often to a lower rate plus the external processor's own fees). Those arrangements vary by country and are evolving quickly; this calculator models the standard in-store commission, which remains the default for the vast majority of transactions.

## Who this is for

App developers pricing a paid app or in-app purchase, subscription businesses modelling take-home per subscriber, and anyone estimating platform costs before launch. Pair it with a payment-processor calculator if you also sell the same product directly (for example through your own website), where a processor like Stripe or PayPal charges a percentage-plus-fixed fee instead of a flat store commission.

## Keeping it accurate

The 30% / 15% commission tiers are long-standing and were confirmed for 2026; the 20% / 10% reduced rates reflect the June 2026 Epic-settlement changes for the US, UK and EEA. Commission is the store's headline cut and is what this tool models; taxes, alternative-billing arrangements and any promotional credits are separate. Always confirm your exact rate and region in App Store Connect or the Google Play Console before pricing decisions.`,

  workedExample: {
    scenario: "A $4.99 in-app purchase at the standard 30% commission.",
    steps: [
      { label: "Buyer pays", value: "$4.99" },
      { label: "Store commission (30%)", value: "$1.50" },
      { label: "Your proceeds", value: "$3.49" },
      { label: "At 15% (Small Business) instead", value: "$4.24" },
    ],
    result: "At 30% you keep $3.49 of a $4.99 sale; enrolling in the 15% Small Business Program lifts that to $4.24 — a 21% increase in take-home per sale.",
  },

  faqs: [
    { q: "How much does the App Store take?", a: "Apple's standard commission is 30% of the price. It drops to 15% under the Small Business Program (for developers under $1M/year) and for subscriptions after a subscriber's first year. From June 30 2026, the standard in-app-purchase rate is being reduced to 20% in the US, UK and EEA." },
    { q: "How much does Google Play take?", a: "Google Play charges 15% on your first $1 million of earnings each year and 30% above that, automatically. Subscriptions are 15% from day one. The 2026 regional reductions apply to Google Play too." },
    { q: "What is the App Store Small Business Program?", a: "It reduces Apple's commission from 30% to 15% for developers who made under $1 million in proceeds in the prior calendar year. You have to enrol; if you qualify it roughly doubles your margin on every sale below the threshold." },
    { q: "Are subscriptions cheaper?", a: "Yes. Subscriptions are charged at 15% — on Apple after the subscriber's first year, and on Google Play from the start. Under the 2026 US/UK/EEA changes, subscriptions drop further to 10%." },
    { q: "Does the commission include payment processing?", a: "Yes. Unlike a standalone processor that charges a percentage plus a fixed fee, the store commission is all-inclusive — it covers payment processing, billing, and refunds. There is no separate card fee for you to add." },
    { q: "What are the 2026 fee changes?", a: "Following the Epic Games settlement, from June 30 2026 the standard in-app-purchase commission falls from 30% to 20%, and subscriptions from 15% to 10%, in the US, UK and EEA — with a global rollout expected by 2027. Pick the rate that matches your region." },
  ],

  related: ["etsy-fee-calculator", "stripe-fee-calculator", "paypal-fee-calculator", "ebay-fee-calculator"],

  sources: [
    { label: "Apple — App Store Small Business Program", url: "https://developer.apple.com/app-store/small-business-program/" },
    { label: "Google Play — Service fees", url: "https://support.google.com/googleplay/android-developer/answer/112622" },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
