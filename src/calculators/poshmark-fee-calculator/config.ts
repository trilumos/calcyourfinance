import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { poshmarkFees } from "../../config/fees";
import { poshmarkRateCards } from "../../lib/rateCards";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const COUNTRIES = ["US", "CA"] as const;

export const poshmarkFeeCalculator: CalculatorConfig = {
  slug: "poshmark-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "poshmark",
  title: "Poshmark Fee Calculator",
  metaDescription:
    "Free Poshmark fee calculator. Instantly see Poshmark's flat $2.95 fee (under $15) or 20% selling fee, your exact payout, and profit — US and Canada.",
  h1: "Poshmark Fee Calculator",
  intro:
    "Calculate exactly what Poshmark charges on a sale and what you actually keep. Enter your sale price and optional item cost to see Poshmark's flat fee or 20% commission, your net payout, and your profit. Supports US and Canada.",

  keywords: {
    primary: "poshmark fee calculator",
    secondary: [
      "poshmark fees calculator",
      "poshmark seller fees",
      "poshmark selling fees",
      "poshmark fee calculator 2026",
      "poshmark fees on $50",
      "poshmark earnings calculator",
      "poshmark payout calculator",
      "poshmark profit calculator",
      "poshmark commission calculator",
    ],
    longTail: [
      "how much does poshmark take",
      "what percentage does poshmark take",
      "poshmark fees explained",
      "poshmark flat fee under $15",
      "poshmark 20 percent fee",
      "how much does poshmark charge sellers",
      "poshmark net payout calculator",
      "poshmark fees on $100",
      "poshmark fees on $20",
      "poshmark fees on $10",
      "how to calculate poshmark fees",
      "poshmark selling fee percentage",
      "poshmark fee canada",
      "poshmark seller fee calculator canada",
      "does poshmark charge a payment processing fee",
      "poshmark take rate",
      "poshmark profit after fees",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: [...COUNTRIES], default: "US" },

  inputs: [
    {
      id: "itemPrice",
      label: "Sale price",
      type: "currency",
      default: 50,
      min: 0,
      help: "The price the buyer pays for the item. Poshmark's fee is on the sale price only — buyers pay shipping separately.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you originally paid for the item — to calculate your profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const fees = poshmarkFees[ctx.country] ?? poshmarkFees.US!;
    const itemPrice = Number(values.itemPrice) || 0;
    const itemCost = Number(values.itemCost) || 0;

    const r = computeMarketplaceFee({
      itemPrice,
      itemCost,
      feeOnShipping: false,
      sellingPercent: fees.percent,
      flatUnderThreshold: { threshold: fees.threshold, fee: fees.flatFee },
    });

    const hasCost = itemCost > 0;
    const isFlat = itemPrice > 0 && itemPrice < fees.threshold;
    const feeLabel = isFlat
      ? `Poshmark fee (flat — sale under ${ctx.formatCurrency(fees.threshold)})`
      : `Poshmark fee (${fees.percent}%)`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You earn",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: isFlat
          ? `Flat ${ctx.formatCurrency(fees.flatFee)} fee on a ${ctx.formatCurrency(r.revenue)} sale`
          : `Poshmark takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows: [
        {
          label: "Sale price",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: feeLabel,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
        },
        {
          label: "You earn",
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
    "Poshmark charges sellers one straightforward fee per sale. In the US, sales under $15 incur a flat $2.95 fee; for sales of $15 or more the fee is 20% of the sale price. There is no separate payment-processing fee — Poshmark's 20% commission is all-inclusive. The fee is charged on the sale price only: Poshmark provides a prepaid shipping label to the buyer, so shipping cost is not part of your selling revenue, and the fee does not apply to it.\n\nIn Canada, the same two-tier structure applies with local thresholds: sales under C$20 incur a flat C$3.95 fee, and sales of C$20 or above are charged at 20% of the sale price. GST/HST may apply to the Poshmark fee depending on the seller's province.\n\nTo find your payout, subtract the fee from your sale price. Optionally, enter what you originally paid for the item to see your gross profit after Poshmark's commission and your cost of goods.",

  seoContent: `Our Poshmark fee calculator is a free, instant tool that shows exactly what Poshmark charges on a sale and what actually lands in your account. Poshmark is the largest peer-to-peer fashion resale marketplace in the United States, and while its pricing is intentionally simple, the switch from a flat fee to a 20% commission at a threshold catches many sellers off guard. This calculator applies the correct rule for your country so you know your real payout before you list.

## How Poshmark's fee structure works.

Poshmark uses a two-tier fee system that depends on your sale price. In the United States, any item that sells for less than $15 is charged a flat fee of $2.95 — regardless of whether the item sells for $3, $8 or $14.99. That flat fee is clear and predictable. The moment the sale price reaches $15, the fee switches entirely to a percentage: Poshmark charges 20% of the sale price, and there is no flat component. So a $15 sale incurs a $3.00 fee, a $50 sale incurs a $10.00 fee, and a $100 sale incurs a $20.00 fee. The threshold is strictly "under $15" — a sale of exactly $15 or any higher amount uses the 20% rule, not the flat fee.

## No separate payment-processing fee.

A common question is whether Poshmark charges a payment-processing fee on top of the selling fee. It does not. The $2.95 flat fee or the 20% commission is the only deduction Poshmark makes from your sale. Poshmark handles payment processing internally and absorbs those costs within its commission structure. This makes the Poshmark fee simpler to calculate than platforms like Etsy, eBay or Reverb, which stack a selling fee and a separate payment-processing fee together. What this calculator shows is your complete payout — no hidden charges.

## Shipping is paid by the buyer, not the seller.

Poshmark's fee is calculated on the sale price (the item price) only. Buyers on Poshmark pay a flat shipping fee directly to Poshmark, and Poshmark provides the seller with a prepaid USPS Priority Mail label. Because the buyer's shipping payment goes to Poshmark and is not part of your sale revenue, it does not factor into the 20% commission or the flat fee. You simply enter the sale price of your item above — there is no shipping input needed in this calculator.

## Poshmark Canada: same model, local thresholds.

Poshmark Canada uses the same two-tier structure with thresholds adjusted for Canadian dollars. Sales under C$20 are charged a flat fee of C$3.95. Sales of C$20 or above are charged at 20% of the sale price. Sellers in Canada should also be aware that GST/HST may apply on top of Poshmark's commission, depending on their province, though Poshmark generally handles this as the marketplace facilitator. Use the country selector above to switch to Canadian dollars and see the correct fee and threshold.

## The threshold trap: pricing near $15 (or C$20).

The two-tier model creates a pricing consideration at the threshold. If you list an item for $14 your fee is $2.95 and your payout is $11.05 — a take rate of 21.1%. If you list for $15 your fee is $3.00 and your payout is $12.00 — a take rate of 20%, and you keep $0.95 more. This means listing at $15 (or C$20 in Canada) is generally preferable to listing just below the threshold, because the percentage fee at the boundary is actually lower as a proportion of the sale than the flat fee on items priced just below it. The calculator makes this visible: try $14.99 versus $15.00 and compare the payouts.

## From payout to profit.

Pashmark's payout is what you receive into your Poshmark balance after the commission. But your real profit also depends on what you paid for the item. Enter your cost of goods in the optional "Your item cost" field to see gross profit — the amount you net after both Poshmark's fee and your acquisition cost. For resellers and thrifters, this is the number that determines whether a sale is worthwhile. A $30 blouse bought for $5 at a thrift store yields a $24 payout (after the 20% Poshmark fee) and a $19 profit.

## Tips for pricing on Poshmark.

Work backwards from your target payout to set your listing price. For sales above $15, divide your target payout by 0.80 to find the price that yields it: if you want to keep $40, list at $50 (40 ÷ 0.80 = 50). For the flat-fee tier, simply add $2.95 to your target: if you want to keep $7, list at $9.95. Use the calculator above to test different price points quickly — enter a sale price, watch the payout update, and find the listing price that hits your goal.

## Accuracy and verified fees.

Every fee in this calculator is sourced from Poshmark's official help and fee-policy pages and verified on 2026-06-12. The US fee structure ($2.95 flat under $15, 20% at and above $15) and Canada fee structure (C$3.95 flat under C$20, 20% at and above C$20) are the only fees Poshmark charges sellers on a standard sale. Australia and India, where Poshmark previously operated, are not included because Poshmark shut down those markets on 2 November 2023. Always verify the current fee at the official source linked below before making pricing decisions.`,

  rateCards: {
    heading: "Poshmark seller fees by country",
    intro:
      "Poshmark's selling fee in each active market. Sales below the threshold pay a flat fee; sales at or above the threshold pay 20% of the sale price. No separate processing fee.",
    cards: poshmarkRateCards([...COUNTRIES]),
  },

  workedExample: {
    scenario: "You sell a $50 item on Poshmark US.",
    steps: [
      { label: "Sale price", value: "$50.00" },
      { label: "Poshmark fee (20% — sale is $15 or above)", value: "$10.00" },
    ],
    result: "You earn $40.00",
  },

  faqs: [
    {
      q: "What percentage does Poshmark take?",
      a: "Poshmark charges a flat $2.95 fee on sales under $15, and 20% of the sale price on sales of $15 or more. There is no separate payment-processing fee — the 20% commission is all-inclusive. On a $50 sale, Poshmark takes $10 and you keep $40.",
    },
    {
      q: "What is the Poshmark fee on sales under $15?",
      a: "Poshmark charges a flat fee of $2.95 on any sale with a listing price strictly under $15. So whether you sell an item for $3 or $14.99, the fee is always $2.95. Once the sale price reaches $15, the flat fee no longer applies — the 20% commission takes over instead.",
    },
    {
      q: "Does Poshmark charge a payment-processing fee?",
      a: "No. Poshmark does not charge a separate payment-processing fee. The $2.95 flat fee or 20% commission is the only deduction made from your sale. Poshmark handles card processing internally and covers those costs within its commission. Your payout is simply your sale price minus the one Poshmark fee.",
    },
    {
      q: "Do Poshmark fees apply to shipping?",
      a: "No. Poshmark's selling fee is calculated on the item sale price only. Buyers pay a flat shipping fee directly to Poshmark, and Poshmark provides the seller with a prepaid USPS Priority Mail shipping label. Shipping money does not flow through your seller account, so it is not part of your revenue and is not subject to the commission.",
    },
    {
      q: "What are Poshmark's fees in Canada?",
      a: "In Canada, Poshmark charges a flat C$3.95 fee on sales under C$20, and 20% of the sale price on sales of C$20 or above. The same all-inclusive structure applies — no separate processing fee. GST/HST may apply on Poshmark's commission depending on your province. Use the country selector above to calculate Canadian fees.",
    },
    {
      q: "Does Poshmark operate in Australia or India?",
      a: "No. Poshmark shut down its operations in Australia, India and the United Kingdom on 2 November 2023. The platform currently operates only in the United States and Canada. This calculator covers both active markets.",
    },
    {
      q: "Is it better to price an item at $14.99 or $15 on Poshmark?",
      a: "Pricing at $15 (or above) is generally better when comparing $14.99 to $15. At $14.99 your fee is $2.95 and your payout is $12.04, a take rate of 19.7%. At $15.00 your fee is $3.00 and your payout is $12.00. You earn $0.04 less at $15 — but the real insight is that setting a price just above $14.99 to, say, $18 or $20 gives a lower percentage fee than the flat fee on low-priced items. The threshold is not a cliff you should price below by a few cents.",
    },
  ],

  related: [
    "etsy-fee-calculator",
    "ebay-fee-calculator",
    "reverb-fee-calculator",
    "printful-profit-calculator",
  ],

  sources: [
    {
      label: "Poshmark — What are the fees for selling on Poshmark? (US)",
      url: "https://support.poshmark.com/s/article/297755057",
    },
    {
      label: "Poshmark Canada — Fee Policy",
      url: "https://poshmark.ca/fee_policy",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-12",
};
