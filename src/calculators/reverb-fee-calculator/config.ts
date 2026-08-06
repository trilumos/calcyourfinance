import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { reverbFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const reverbFeeCalculator: CalculatorConfig = {
  slug: "reverb-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "reverb",
  title: "Reverb Fee Calculator",
  metaDescription:
    "Free Reverb fee calculator. Calculate Reverb's 5% selling fee (capped at $500), Reverb Payments processing fee, and see exactly what you keep — plus Preferred Seller rates.",
  h1: "Reverb Fee Calculator",
  intro:
    "Calculate Reverb seller fees on a sale and see your exact payout. Enter your item price and shipping to break down the 5% selling fee and Reverb Payments processing fee — and add your item cost to see real profit. Switch to Preferred Seller to compare rates.",

  keywords: {
    primary: "reverb fee calculator",
    secondary: [
      "reverb fees calculator",
      "reverb selling fees",
      "reverb seller fees",
      "reverb fee calculator guitar",
      "reverb fee calculator music gear",
      "calculate reverb fees",
      "reverb charges calculator",
      "reverb payout calculator",
      "reverb profit calculator",
    ],
    longTail: [
      "how much does reverb charge",
      "what percentage does reverb take",
      "reverb fees on $1000",
      "reverb fees on $500",
      "reverb preferred seller fees",
      "reverb fee cap $500",
      "reverb payment processing fee",
      "reverb selling fee percentage",
      "reverb fee calculator uk",
      "reverb fee calculator canada",
      "reverb take rate",
      "reverb commission percentage",
      "how to calculate reverb fees",
      "reverb vs ebay fees music gear",
      "how to net a target amount on reverb",
      "reverb fees for selling guitar",
    ],
    competition: "E",
    intent: "tool",
  },

  inputs: [
    {
      id: "itemPrice",
      label: "Item price",
      type: "currency",
      default: 1000,
      min: 0,
      help: "The price the buyer pays for the item.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer",
      type: "currency",
      default: 50,
      min: 0,
      help: "Reverb's 5% selling fee applies to shipping too.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you paid for the gear — to calculate your profit.",
    },
    {
      id: "preferredSeller",
      label: "I am a Reverb Preferred Seller",
      type: "toggle",
      default: false,
      help: "Lowers the processing fee from 3.19% to 2.99% + $0.49.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const isPreferred = Boolean(values.preferredSeller);
    const processingPercent = isPreferred
      ? reverbFees.preferredProcessingPercent
      : reverbFees.processingPercent;

    const r = computeMarketplaceFee({
      itemPrice: Number(values.itemPrice) || 0,
      shipping: Number(values.shipping) || 0,
      itemCost: Number(values.itemCost) || 0,
      feeOnShipping: true,
      sellingPercent: reverbFees.sellingPercent,
      feeCap: reverbFees.sellingFeeCap,
      feeMin: reverbFees.sellingFeeMin,
      processingPercent,
      processingFixed: reverbFees.processingFixed,
    });

    const hasCost = (Number(values.itemCost) || 0) > 0;
    const uncappedSellingFee = r.revenue * (reverbFees.sellingPercent / 100);
    const capNote = uncappedSellingFee > reverbFees.sellingFeeCap
      ? `Selling fee capped at $${reverbFees.sellingFeeCap} (would be ${ctx.formatCurrency(uncappedSellingFee)} without the cap)`
      : undefined;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Reverb takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows: [
        {
          label: "Sale revenue (item + shipping)",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `Selling fee (${ctx.formatPercent(reverbFees.sellingPercent)}, capped at $${reverbFees.sellingFeeCap})`,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
          hint: capNote,
        },
        {
          label: `Processing fee (${ctx.formatPercent(processingPercent)} + $${reverbFees.processingFixed.toFixed(2)}${isPreferred ? " — Preferred Seller" : ""})`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: "Total fees",
          display: ctx.formatCurrency(r.totalFees),
          kind: "deduction",
        },
        {
          label: "You receive",
          display: ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasCost
          ? [
              {
                label: "Profit after item cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Reverb charges two fees on every sale. First, a selling fee of 5% of the total the buyer pays — item price plus the shipping you charge — with a minimum of $0.50 and a cap of $500 per order. Second, a payment processing fee for Reverb Payments: 3.19% + $0.49 per transaction for standard sellers, or 2.99% + $0.49 for Reverb Preferred Sellers.\n\nThe selling fee is calculated on the entire order (item + shipping), so a $1,000 guitar with $50 shipping gives a selling fee of 5% × $1,050 = $52.50. The fee cap matters for high-value gear: anything over $10,000 in order value would trigger a selling fee above $500, but Reverb limits it there. On a $15,000 vintage amp your selling fee is $500, not $750.\n\nThe processing fee is calculated on the same revenue (item + shipping). For a $1,050 sale at the standard 3.19% + $0.49, the processing fee is $33.99. Your payout is the revenue minus both fees. Enter your cost of goods in the optional field to see your profit after fees and inventory.",

  seoContent: `Our Reverb fee calculator is a free tool that shows exactly what Reverb charges on a sale and what actually lands in your account. Reverb is the largest dedicated marketplace for musical instruments and gear, and while its fee structure is simpler than platforms like Etsy or eBay, the combination of a selling fee and a payment processing fee means your real payout is always less than the sale price. This calculator adds both up instantly so you can price your listings correctly and know what you'll make before you sell.

## How Reverb's selling fee works.

Reverb charges a selling fee of 5% on the total the buyer pays — that includes both the item price and the shipping you charge. This is the commission Reverb takes for connecting you with a buyer and managing the transaction. The fee has a floor (minimum) of $0.50 per order, so even a very cheap listing never costs less than fifty cents. More importantly for gear sellers, there is a cap: the selling fee will never exceed $500 on a single order, regardless of how high the sale price goes.

This cap is meaningful if you sell high-value instruments. Sell a vintage guitar for $12,000 and the uncapped fee would be $600 — but Reverb limits it to $500. Sell a $25,000 grand piano and the selling fee is still $500. The calculator always applies the cap automatically and shows you a note when it kicks in, so you can see both the capped fee and what it would have been without it.

## What Reverb Payments charges.

On top of the selling fee, Reverb charges a payment processing fee through its integrated Reverb Payments system. For standard sellers, this is 3.19% of the order total plus a $0.49 fixed fee per transaction. Reverb Preferred Sellers pay a slightly lower 2.99% plus the same $0.49 fixed fee.

Unlike the selling fee, the processing fee has no published cap — it scales with the order amount. On a $1,050 sale (a $1,000 guitar with $50 shipping), the standard processing fee works out to $33.99. Toggle the Preferred Seller option in the calculator to see the difference; on a $1,050 sale the saving is about $2.10.

## What is the Reverb Preferred Seller program?

Reverb's Preferred Seller program rewards high-performing sellers with a lower payment processing rate (2.99% instead of 3.19%). Qualification is based on metrics like sales volume, response rate, and positive feedback. The selling fee percentage remains 5% for all sellers — it is only the processing rate that changes. If you qualify for Preferred Seller status, the saving adds up meaningfully on volume: on $50,000 in annual sales, the 0.2% lower rate saves you $100.

## Why the fee applies to shipping, not just the item price.

Many sellers are surprised to learn that Reverb's 5% selling fee applies to the shipping you charge the buyer, not just the item price. This is standard across most marketplaces (Etsy does the same). It means offering high shipping rates is effectively more expensive: on a $500 item with $100 shipping, the selling fee is 5% × $600 = $30, not $25. The calculator includes this correctly — enter your actual shipping charge and it uses the right base.

## How to price to hit a target payout.

If you want to walk away with a specific amount, you need to work backwards from fees. For a standard seller targeting $900 on a $950 sale with $50 shipping (revenue $1,000): selling fee = $50, processing = $32.39, total fees = $82.39, payout = $917.61. Adjust your price upward until you reach your target, or use this calculator to test different price points quickly.

## From payout to real profit.

Payout is not the same as profit. Enter your item cost — what you paid to buy or make the gear — in the optional field and the calculator shows your gross profit after Reverb's fees and your cost of goods. This is especially useful for dealers, flippers, and anyone buying used gear to resell. A guitar bought at $700 and sold for $1,000 with $50 shipping yields a payout of $963.51, profit of $263.51. Knowing the real profit margin helps you decide which listings are worth your time to list, pack and ship.

## Accuracy and what this calculator covers.

Every rate in this calculator is taken from Reverb's official help pages and verified on 2026-06-11. The selling fee (5%, capped at $500, minimum $0.50) and Reverb Payments processing fee (3.19% standard, 2.99% Preferred Seller, both + $0.49) are the two fees that apply to all US Reverb Payments orders. Certain other costs exist that this calculator does not model: a 1% international processing surcharge if the buyer's bank is in a different country (outside the EEA), a 2.5% currency conversion fee if you list in a currency other than your payout currency, and potential chargeback fees. For the vast majority of US-based sellers receiving USD payouts, the two fees this calculator computes are all that apply. Check the sources linked below and your Reverb dashboard for the complete picture before making pricing decisions.`,

  workedExample: {
    scenario: "You sell a $1,000 guitar with $50 shipping as a standard seller.",
    steps: [
      { label: "Item price", value: "$1,000.00" },
      { label: "Shipping charged to buyer", value: "$50.00" },
      { label: "Total revenue (item + shipping)", value: "$1,050.00" },
      { label: "Selling fee (5%)", value: "$52.50" },
      { label: "Processing fee (3.19% + $0.49)", value: "$33.99" },
      { label: "Total fees", value: "$86.49" },
    ],
    result: "You receive $963.51",
  },

  faqs: [
    {
      q: "What percentage does Reverb take?",
      a: "Reverb charges a 5% selling fee on the total the buyer pays (item price plus shipping), with a minimum of $0.50 and a cap of $500 per order. On top of that, Reverb Payments charges a processing fee of 3.19% + $0.49 per transaction (or 2.99% + $0.49 for Preferred Sellers). So on a typical sale, Reverb's total take is a bit over 8% of the order value.",
    },
    {
      q: "What are Reverb fees on a $1,000 sale?",
      a: "On a $1,000 item with $50 shipping (revenue $1,050): the selling fee is $52.50 (5%) and the standard processing fee is $33.99 (3.19% + $0.49), for total fees of $86.49. You keep $963.51. Use the calculator above for any price and shipping combination.",
    },
    {
      q: "Is there a maximum fee on Reverb?",
      a: "Yes — but only on the selling fee. The 5% selling fee is capped at $500 per order. So if you sell a $15,000 guitar your selling fee is $500, not $750. The payment processing fee has no cap and continues to scale with the order amount.",
    },
    {
      q: "What is Reverb's payment processing fee?",
      a: "Reverb Payments charges 3.19% of the order total plus $0.49 per transaction for standard sellers. Reverb Preferred Sellers pay 2.99% + $0.49. This fee is separate from the 5% selling fee and applies to every Reverb Payments transaction.",
    },
    {
      q: "What is the Reverb Preferred Seller rate?",
      a: "Preferred Sellers pay a lower processing rate of 2.99% + $0.49 per transaction instead of the standard 3.19% + $0.49. The 5% selling fee (with its $500 cap) is the same for all sellers. The Preferred Seller program is based on account performance metrics including sales volume, response time, and buyer feedback.",
    },
    {
      q: "How do I calculate what to charge on Reverb to net a specific amount?",
      a: "To work backwards, start with your target payout and add back the fees. If you want to keep $900 and expect a $1,000 total sale (no separate shipping), your selling fee will be $50 and your standard processing fee about $32.39, totalling ~$82.39 — meaning you'd need to price at about $982 to net $900. Adjust the item price in the calculator above and watch your payout update in real time.",
    },
    {
      q: "Does Reverb charge fees on shipping?",
      a: "Yes. The 5% selling fee applies to the entire amount the buyer pays, including the shipping charge you set. So if you list free shipping and add the shipping cost to your item price, or charge shipping separately, the selling fee is the same either way — 5% of the total paid.",
    },
  ],

  related: [
    "etsy-fee-calculator",
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "square-fee-calculator",
  ],

  sources: [
    {
      label: "Reverb — Pricing & Payouts (5% selling fee)",
      url: "https://reverb.com/selling/selling-fees",
    },
    {
      label: "Reverb — What fees will I pay for selling on Reverb?",
      url: "https://help.reverb.com/hc/en-us/articles/40917652290843-What-fees-will-I-pay-for-selling-on-Reverb",
    },
    {
      label: "Reverb — What are my fees as a Reverb Preferred Seller?",
      url: "https://help.reverb.com/hc/en-us/articles/41988469262107-What-are-my-fees-as-a-Reverb-Preferred-Seller",
    },
    {
      label: "Reverb — Availability and processing fees for Reverb Payments",
      url: "https://help.reverb.com/hc/en-us/articles/41988473838491-Availability-and-processing-fees-for-Reverb-Payments",
    },
    {
      label: "Reverb — Pricing & Payouts",
      url: "https://reverb.com/selling/selling-fees",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-11",
};
