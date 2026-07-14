import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { stockxFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const LEVEL_OPTIONS = stockxFees.levels.map((l) => ({
  value: l.id,
  label: l.label,
}));

export const stockxFeeCalculator: CalculatorConfig = {
  slug: "stockx-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "stockx",
  title: "StockX Fee Calculator",
  metaDescription:
    "Free StockX fee calculator. Enter your sale price and seller level to see StockX's transaction fee (7–9%), 3% processing fee, and your exact payout — updated for 2026.",
  h1: "StockX Fee Calculator",
  intro:
    "Calculate StockX seller fees and see exactly what you keep after a sale. Enter your sale price, pick your seller level (Level 1–5), and add your item cost to see real profit. Updated for the current 2026 StockX Seller Program fee structure.",

  keywords: {
    primary: "stockx fee calculator",
    secondary: [
      "stockx seller fees",
      "stockx fees calculator",
      "stockx selling fees",
      "stockx payout calculator",
      "stockx profit calculator",
      "calculate stockx fees",
      "stockx charges calculator",
    ],
    longTail: [
      "how much does stockx take",
      "what percentage does stockx take",
      "stockx fees on $200",
      "stockx fees on $100",
      "stockx seller level fees",
      "stockx transaction fee percentage",
      "stockx payment processing fee",
      "stockx level 1 fees",
      "stockx level 2 fees",
      "stockx fee calculator sneakers",
      "stockx fee calculator streetwear",
      "how to calculate stockx payout",
      "stockx take rate",
      "stockx seller program fees",
      "stockx vs goat fees",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "salePrice",
      label: "Sale price",
      type: "currency",
      default: 200,
      min: 0,
      help: "The price at which your item sold on StockX (the ask price the buyer accepted).",
    },
    {
      id: "sellerLevel",
      label: "Your seller level",
      type: "select",
      default: "level1",
      options: LEVEL_OPTIONS,
      help: "Higher seller levels (earned through quarterly sales volume) get a lower transaction fee. New sellers start at Level 1.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you paid for the item — to calculate your actual profit after StockX fees.",
    },
  ],

  compute(values: InputValues, _ctx: ComputeCtx): CalcResult {
    const salePrice = Number(values.salePrice) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const levelId = String(values.sellerLevel ?? "level1");

    const level =
      stockxFees.levels.find((l) => l.id === levelId) ?? stockxFees.levels[0];

    const r = computeMarketplaceFee({
      itemPrice: salePrice,
      itemCost,
      feeOnShipping: false, // StockX fees apply to sale price only
      sellingPercent: level.transactionPercent,
      feeMin: stockxFees.feeMinUSD,
      processingPercent: stockxFees.processingPercent,
    });

    const hasCost = itemCost > 0;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: _ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `StockX takes ${_ctx.formatPercent(r.takeRatePercent)} of your ${_ctx.formatCurrency(r.revenue)} sale`,
      },
      rows: [
        {
          label: "Sale price",
          display: _ctx.formatCurrency(r.revenue),
        },
        {
          label: `Transaction fee (${_ctx.formatPercent(level.transactionPercent)} — ${level.label})`,
          display: _ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
          hint:
            r.sellingFee === stockxFees.feeMinUSD &&
            salePrice * (level.transactionPercent / 100) < stockxFees.feeMinUSD
              ? `Minimum fee of $${stockxFees.feeMinUSD} applied (raw fee would be ${_ctx.formatCurrency(salePrice * (level.transactionPercent / 100))})`
              : undefined,
        },
        {
          label: `Payment processing fee (${_ctx.formatPercent(stockxFees.processingPercent)})`,
          display: _ctx.formatCurrency(r.processingFee),
          kind: "deduction",
        },
        {
          label: "Total fees",
          display: _ctx.formatCurrency(r.totalFees),
          kind: "deduction",
        },
        {
          label: "You receive",
          display: _ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasCost
          ? [
              {
                label: "Profit after item cost",
                display: _ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "StockX charges sellers two fees on every completed sale: a transaction fee and a payment processing fee. The transaction fee depends on your Seller Level — a tier determined by your quarterly sales performance. New sellers start at Level 1 (9%), and higher-volume sellers can reach Level 5 (7%). The payment processing fee is a flat 3% for all sellers and all levels.\n\nBoth fees are calculated on the final sale price (your accepted ask price). Unlike some marketplaces, StockX does not charge a separate buyer-paid shipping fee that gets added to your revenue — StockX provides a prepaid shipping label and deducts a flat shipping charge from your payout outside of these two percentage fees.\n\nThere is a regional minimum fee: in the US, the transaction fee is floored at $5. This only affects very low-priced items — on a $40 sale the raw 9% transaction fee would be $3.60, but the $5 minimum kicks in instead.\n\nExample: A $200 sale at Level 1. Transaction fee = 9% × $200 = $18. Processing fee = 3% × $200 = $6. Total fees = $24. You receive $176 before the shipping deduction.",

  seoContent: `Our StockX fee calculator is a free tool that shows exactly what StockX deducts from a sale and how much money lands in your account. StockX is the world's largest authenticated marketplace for sneakers, streetwear, electronics, and collectibles, and its fee structure is level-dependent — meaning the more you sell quarterly, the lower your transaction fee. This calculator accounts for both the transaction fee and the 3% payment processing fee so you can see your real payout before you price your ask.

## How StockX seller fees work.

StockX charges sellers two distinct fees on every completed sale:

**Transaction fee** — this is the main commission StockX earns for the sale, and it depends on your Seller Level. Level 1 sellers (anyone new to the platform or with low quarterly volume) pay 9%. As your quarterly sales grow, you move up through five levels, with the rate dropping to as low as 7% at Level 5.

**Payment processing fee** — a flat 3% on the final sale price, charged to all sellers at all levels. This covers the cost of processing the buyer's payment.

There is no listing fee, no fixed per-order charge, and no separate category-based rate (unlike eBay). The total you pay StockX is always the transaction fee % plus 3%.

## StockX Seller Level fee table.

| Seller Level | Quarterly threshold | Transaction fee | Processing fee | Total |
|---|---|---|---|---|
| Level 1 (new) | No minimum | 9.0% | 3% | 12.0% |
| Level 2 | 12 sales or $1,500 | 8.5% | 3% | 11.5% |
| Level 3 | 40 sales or $5,000 | 8.0% | 3% | 11.0% |
| Level 4 | 200 sales or $25,000 | 7.5% | 3% | 10.5% |
| Level 5 | 800 sales or $100,000 | 7.0% | 3% | 10.0% |

The quarterly threshold means either condition qualifies you — 12 completed sales OR $1,500 in quarterly revenue (for Level 2), whichever you hit first. Performance metrics reset each quarter (January–March, April–June, July–September, October–December), but you retain your achieved level through the current quarter and the following one.

## What does StockX take from a sale?

On a $200 sale, a Level 1 seller pays $18 in transaction fees and $6 in processing fees — StockX takes $24 total, leaving you $176 before shipping. At Level 5, the same $200 sale costs you $14 + $6 = $20, leaving you $180. That 2% difference adds up significantly at volume: on $50,000 in annual sales, moving from Level 1 to Level 5 saves you $1,000 in transaction fees alone.

## StockX fees on common sale prices.

| Sale price | L1 total fees (12%) | L1 payout | L5 total fees (10%) | L5 payout |
|---|---|---|---|---|
| $100 | $12.00 | $88.00 | $10.00 | $90.00 |
| $150 | $18.00 | $132.00 | $15.00 | $135.00 |
| $200 | $24.00 | $176.00 | $20.00 | $180.00 |
| $300 | $36.00 | $264.00 | $30.00 | $270.00 |
| $500 | $60.00 | $440.00 | $50.00 | $450.00 |

## The $5 minimum fee.

StockX applies a regional minimum fee: in the US, the transaction fee will never be less than $5 per sale. On a $40 item at Level 1, the raw 9% transaction fee is $3.60 — but the $5 minimum kicks in, making it $5. The 3% processing fee ($1.20 on $40) is still applied on top of the minimum, for a total of $6.20. This minimum only matters on low-priced items — any sale over about $56 at Level 1 will naturally exceed the $5 floor.

## What about shipping on StockX?

StockX is different from peer-to-peer marketplaces like Poshmark or Mercari in one important way: the buyer does not pay shipping separately. StockX provides sellers with a prepaid shipping label to send the item to their authentication center, and the shipping cost is deducted from your payout as a flat charge separate from the percentage fees above.

As of March 1, 2026, the standard seller shipping fee for US sellers (non-Flex sales) is $5. This calculator does not include the shipping deduction in its fee calculation because it is a flat operational cost rather than a percentage of your sale — factor it into your margin separately. On a $200 sale at Level 1, you receive $176 from the fee calculator, minus the $5 shipping deduction, for a net of $171 before your item cost.

## What is StockX Flex?

StockX Flex (also called Flex Fulfillment) is an optional program where you ship your item directly to a StockX warehouse to be stored and shipped to buyers without requiring a fresh shipment for each sale. The $5 Flex fulfillment fee was removed on March 1, 2026; Flex transaction fees now match the same seller-level rates as standard sales. If you use Flex, your fees work the same way as in this calculator.

## From payout to real profit.

Your StockX payout is not the same as your profit. If you bought a pair of sneakers for $130 and sold them on StockX for $200 as a Level 1 seller, your payout before shipping is $176, but your actual profit is $176 − $130 = $46 (minus the shipping deduction). Enter your item cost in the optional field above and the calculator shows your gross profit after StockX fees and cost of goods.

## Accuracy and what this calculator covers.

Every rate in this calculator is taken from StockX's official help center and seller program pages, verified on 2026-06-12. The fee table (transaction 7–9% by level, processing 3%, minimum $5 USD) reflects the structure in effect following the March 1, 2026 Seller Program update. This calculator models USD sales only. Other currencies have their own regional minimum fees (e.g. EUR €5.00, GBP £4.50, CAD $7.00) but the percentage rates are the same globally. Authentication is built into the StockX model and is not a separate fee. The $5 seller shipping deduction (standard non-Flex US sales) is not modelled as a percentage fee — factor it separately. Check the sources linked below and your StockX seller dashboard for the most current numbers before making pricing decisions.`,

  workedExample: {
    scenario:
      "You sell a $200 pair of sneakers on StockX as a Level 1 seller (new seller, 9% transaction fee).",
    steps: [
      { label: "Sale price", value: "$200.00" },
      { label: "Transaction fee (9% — Level 1)", value: "$18.00" },
      { label: "Payment processing fee (3%)", value: "$6.00" },
      { label: "Total fees", value: "$24.00" },
    ],
    result: "You receive $176.00 (before the $5 shipping deduction)",
  },

  faqs: [
    {
      q: "How much does StockX take from a sale?",
      a: "StockX takes between 10% and 12% of your sale price depending on your Seller Level. That breaks down into a transaction fee of 7–9% (level-dependent) plus a flat 3% payment processing fee. At the default Level 1, StockX takes 12% in total. At the highest Level 5, it takes 10%. On a $200 sale, a Level 1 seller pays $24 in fees and receives $176.",
    },
    {
      q: "What are StockX seller levels and how do they affect fees?",
      a: "StockX has five seller levels based on quarterly performance. Level 1 is the default for new sellers (9% transaction fee). You reach Level 2 with 12 completed sales or $1,500 in quarterly revenue (8.5% transaction fee), Level 3 with 40 sales or $5,000 (8%), Level 4 with 200 sales or $25,000 (7.5%), and Level 5 with 800 sales or $100,000 (7%). All levels pay the same 3% processing fee. Levels reset quarterly but you retain your level through the current and following quarter.",
    },
    {
      q: "What is the StockX payment processing fee?",
      a: "StockX charges a 3% payment processing fee on every completed sale, at all seller levels. This is separate from the transaction fee. On a $200 sale, the processing fee is $6. It is applied to the final sale price (your accepted ask) and is not capped.",
    },
    {
      q: "Is there a minimum fee on StockX?",
      a: "Yes — in the US, the transaction fee is floored at a minimum of $5 per sale. On very cheap items where 7–9% of the sale price would be less than $5, StockX charges $5 instead. The 3% processing fee is still applied on top. This minimum only affects items priced below roughly $56–$72 depending on your seller level. For most sneaker and streetwear sales the minimum will not apply.",
    },
    {
      q: "How much does StockX take on a $200 sale?",
      a: "At the default Level 1, StockX takes $18 transaction fee (9%) and $6 processing fee (3%) for a total of $24 on a $200 sale, leaving you $176. At Level 5, the same sale costs $14 + $6 = $20, leaving you $180. Enter your exact sale price and seller level above to see the full breakdown.",
    },
    {
      q: "Does StockX charge shipping on top of these fees?",
      a: "Yes, separately from the percentage fees. StockX provides a prepaid shipping label for you to send the item to their authentication center, and the shipping cost is deducted from your payout as a flat charge. For US standard (non-Flex) sales, the shipping fee increased from $4 to $5 on March 1, 2026. This calculator does not include the shipping deduction — factor in $5 (or your region's equivalent) when calculating your net payout.",
    },
    {
      q: "How do StockX fees compare to other sneaker marketplaces?",
      a: "StockX's total take of 10–12% (depending on seller level) is broadly competitive with GOAT, which charges a seller fee of 9.5–15% plus a cash-out fee of 2.9%. eBay's sneaker category is a flat 8% for athletic shoes priced $150 or more (no per-order fee). The key StockX advantage is built-in authentication — you are selling a verified item in a trusted marketplace, which commands a price premium that often offsets the fees. Use the calculator above to compare exact payouts at your price point.",
    },
  ],

  related: [
    "ebay-fee-calculator",
    "mercari-fee-calculator",
    "poshmark-fee-calculator",
    "depop-fee-calculator",
  ],

  sources: [
    {
      label: "StockX — What are StockX's fees for sellers?",
      url: "https://stockx.com/help/articles/what-are-stockxs-fees-for-sellers",
    },
    {
      label: "StockX — What is the StockX Seller Program? What are Seller Levels?",
      url: "https://stockx.com/help/articles/What-is-the-StockX-Seller-Program-What-are-Seller-Levels",
    },
    {
      label: "StockX News — Updates to the StockX Seller Program (March 1, 2026)",
      url: "https://stockx.com/news/updates-to-the-stockx-seller-program/",
    },
  ],

  feesVerifiedOn: "2026-06-12",
  lastUpdated: "2026-06-12",
};
