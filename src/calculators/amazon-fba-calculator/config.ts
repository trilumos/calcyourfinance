import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { amazonFees } from "../../config/fees";
import { computeAmazonFba, type AmazonSizeTier } from "./formula";

export const amazonFbaCalculator: CalculatorConfig = {
  slug: "amazon-fba-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "amazon",
  title: "Amazon FBA Calculator",
  metaDescription:
    "Free Amazon FBA calculator (US, 2026 fees). Enter your sale price, category, size tier and weight to see the referral fee, FBA fulfilment fee, fuel surcharge and your real profit and margin per unit.",
  h1: "Amazon FBA Calculator",
  intro:
    "Work out your true profit on an Amazon FBA sale. Enter your sale price, category, product size tier, unit weight and cost — and the calculator breaks down Amazon's referral fee, the FBA fulfilment fee (with the 2026 price bands and fuel surcharge) and shows exactly what you keep and your net margin.",

  keywords: {
    primary: "amazon fba calculator",
    secondary: [
      "amazon fba fee calculator",
      "amazon fba profit calculator",
      "fba calculator",
      "amazon seller calculator",
      "amazon fulfillment fee calculator",
      "amazon referral fee calculator",
      "amazon fba revenue calculator",
      "amazon profit calculator",
    ],
    longTail: [
      "amazon fba calculator usa",
      "amazon fba fee calculator 2026",
      "amazon fba profit margin calculator",
      "how much does amazon fba take",
      "amazon fba fulfilment fee by weight",
      "amazon standard size fba fee",
      "amazon fba fee small standard",
      "amazon fba fee large standard",
      "amazon fba fuel surcharge calculator",
      "amazon fba calculator with product cost",
      "amazon fba net profit calculator",
      "amazon referral fee by category",
      "amazon fba storage fee calculator",
      "what is my amazon fba profit",
      "amazon fba break even calculator",
    ],
    competition: "H",
    intent: "tool",
  },

  inputs: [
    {
      id: "salePrice",
      label: "Sale price",
      type: "currency",
      default: 25,
      min: 0,
      help: "The price the customer pays for the item. Amazon's referral fee and the FBA price band are both based on this.",
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      default: "most",
      options: amazonFees.categories.map((c) => ({ value: c.id, label: c.label })),
      help: "Referral fee rate depends on the product category. Most categories are 15%; several differ.",
    },
    {
      id: "sizeTier",
      label: "Size tier",
      type: "select",
      default: "large",
      options: [
        { value: "small", label: "Small standard (≤ 16 oz)" },
        { value: "large", label: "Large standard (≤ 20 lb)" },
      ],
      help: "This v1 covers standard-size products only. Oversize and bulky items use a different (higher) rate card and are not modelled here.",
    },
    {
      id: "weightOz",
      label: "Unit weight (ounces)",
      type: "number",
      default: 12,
      min: 0,
      step: 1,
      suffix: "oz",
      help: "Total shipping weight of the unit in ounces (16 oz = 1 lb). The FBA fulfilment fee is charged by weight band.",
    },
    {
      id: "productCost",
      label: "Your product cost (optional)",
      type: "currency",
      default: 8,
      min: 0,
      help: "What the unit costs you landed (manufacturing + inbound shipping). Used to calculate your profit and margin.",
    },
    {
      id: "storageCubicFeet",
      label: "Storage volume per unit (optional, cu ft)",
      type: "number",
      default: 0,
      min: 0,
      step: 0.01,
      suffix: "cu ft",
      help: `Optional monthly storage estimate. Enter the unit's volume in cubic feet to add the standard-size non-peak storage fee (${amazonFees.storagePerCubicFoot.toFixed(2)}/cu ft, Jan–Sep). Leave at 0 to ignore.`,
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const categoryId = String(values.category ?? "most");
    const category =
      amazonFees.categories.find((c) => c.id === categoryId) ?? amazonFees.categories[0];
    const sizeTier: AmazonSizeTier = values.sizeTier === "small" ? "small" : "large";

    const salePrice = Number(values.salePrice) || 0;
    const productCost = Number(values.productCost) || 0;
    const storageCubicFeet = Number(values.storageCubicFeet) || 0;

    const r = computeAmazonFba({
      salePrice,
      productCost,
      weightOz: Number(values.weightOz) || 0,
      sizeTier,
      category,
      referralMinimum: amazonFees.referralMinimum,
      mediaClosingFee: amazonFees.mediaClosingFee,
      priceBands: amazonFees.fba.priceBands,
      fuelSurchargePercent: amazonFees.fba.fuelSurchargePercent,
      smallStandard: amazonFees.fba.smallStandard,
      largeStandard: amazonFees.fba.largeStandard,
      storageCubicFeet,
      storagePerCubicFoot: amazonFees.storagePerCubicFoot,
    });

    const hasCost = productCost > 0;

    const rows: CalcResult["rows"] = [
      { label: "Sale price", display: ctx.formatCurrency(r.revenue) },
      {
        label: `Referral fee (${ctx.formatPercent(r.referralFee > 0 && r.revenue > 0 ? (r.referralFee / r.revenue) * 100 : 0)})`,
        display: ctx.formatCurrency(r.referralFee),
        kind: "deduction",
        hint:
          r.referralFee === amazonFees.referralMinimum
            ? `Per-item minimum of ${ctx.formatCurrency(amazonFees.referralMinimum)} applied`
            : undefined,
      },
    ];

    if (r.closingFee > 0) {
      rows.push({
        label: "Media closing fee",
        display: ctx.formatCurrency(r.closingFee),
        kind: "deduction",
      });
    }

    rows.push({
      label: `FBA fulfilment fee (${sizeTier === "small" ? "small" : "large"} standard)`,
      display: ctx.formatCurrency(r.fbaBaseFee),
      kind: "deduction",
    });

    if (r.fuelSurcharge > 0) {
      rows.push({
        label: `Fuel & logistics surcharge (${ctx.formatPercent(amazonFees.fba.fuelSurchargePercent)})`,
        display: ctx.formatCurrency(r.fuelSurcharge),
        kind: "deduction",
      });
    }

    if (r.storageFee > 0) {
      rows.push({
        label: `Monthly storage (${ctx.formatCurrency(amazonFees.storagePerCubicFoot)}/cu ft)`,
        display: ctx.formatCurrency(r.storageFee),
        kind: "deduction",
      });
    }

    rows.push({ label: "Total Amazon fees", display: ctx.formatCurrency(r.totalFees), kind: "deduction" });
    rows.push({ label: "Net proceeds", display: ctx.formatCurrency(r.netProceeds), kind: "net" });

    if (hasCost) {
      rows.push({ label: "Product cost", display: ctx.formatCurrency(productCost), kind: "deduction" });
      rows.push({ label: "Profit", display: ctx.formatCurrency(r.profit), kind: "net" });
      rows.push({ label: "Net margin", display: ctx.formatPercent(r.marginPercent), kind: "muted" });
    }

    return {
      headline: {
        label: hasCost ? "Profit per unit" : "Net proceeds",
        display: ctx.formatCurrency(hasCost ? r.profit : r.netProceeds),
        sub: `Amazon takes ${ctx.formatCurrency(r.totalFees)} (${ctx.formatPercent(r.effectiveFeeRatePercent)}) of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows,
    };
  },

  howItWorks:
    "Selling on Amazon with Fulfilment by Amazon (FBA) means two main charges come out of every sale: the referral fee and the FBA fulfilment fee. The referral fee is Amazon's commission — a percentage of the total sales price (item price plus any shipping and gift wrap). Most categories are 15%, but several differ: consumer electronics, computers, cell phone devices and video game consoles are 8%; automotive and industrial are 12%; and a handful use price-banded or tiered rates. Every referral fee is subject to a $0.30 per-item minimum.\n\nThe FBA fulfilment fee is what Amazon charges to pick, pack and ship the unit from its warehouse. It is based on the product's size tier (small standard or large standard) and its unit weight, looked up from Amazon's rate card. For 2026 Amazon split standard-size fees into three price bands based on the item's sale price — under $10, $10 to $50, and over $50 — so the same physical product costs a different amount to fulfil depending on how it is priced. On top of the base fulfilment fee, a 3.5% fuel and logistics surcharge applies (effective 17 April 2026).\n\nYour net proceeds are the sale price minus the referral fee, the FBA fulfilment fee and the surcharge (plus any optional monthly storage). Subtract your product cost to see your real profit and margin. Note that the $39.99/month Professional selling plan is a flat subscription, not a per-unit fee, so it is not deducted from an individual sale here. This calculator covers standard-size products in the United States; oversize items use a different, higher rate card and are out of scope for this version.",

  seoContent: `An Amazon FBA calculator is the single most important tool for anyone selling on Amazon with Fulfilment by Amazon. Before you launch a product — or when you are deciding whether an existing product is still worth selling — you need to know exactly what Amazon takes and what you actually keep. Amazon's fee structure is layered: a category referral fee, a weight-and-size-based fulfilment fee, a fuel surcharge, and optional storage costs. Get any one of them wrong and a product that looks profitable on paper can quietly lose money on every unit. This free calculator applies Amazon's current US 2026 fees so you can see your true net proceeds, profit and margin per unit in seconds.

## The two fees that matter most.
Every FBA sale carries two core charges. The first is the **referral fee**, Amazon's commission for using the marketplace, charged as a percentage of the total sales price. The second is the **FBA fulfilment fee**, what Amazon charges to store-adjacent pick, pack and ship your unit to the customer. Together these usually make up the large majority of what Amazon deducts. On a typical $25 standard-size product, you might pay a $3.75 referral fee (15%) and roughly $4.35 in fulfilment fees including the surcharge — so about $8.10, or 32%, before your own product cost.

## How the referral fee works.
The referral fee is a percentage of the item price plus any shipping and gift-wrap charges, subject to a **$0.30 per-item minimum**. Most categories — Home & Kitchen, Toys & Games, Sports & Outdoors, Office Products, Pet Supplies and many more — are **15%**. The main exceptions are lower: Consumer Electronics, Computers, Cell Phone Devices and Video Game Consoles are **8%**, while Automotive & Powersports and Industrial & Scientific are **12%**.

Some categories are **price-banded**, where the rate for the whole price depends on the band the price falls in: Clothing & Accessories is 5% up to $15, 10% from $15 to $20, and 17% above $20; Baby Products and Grocery are 8% up to their thresholds and 15% above. A few categories are **marginal-tiered**, applying a headline rate up to a breakpoint and a lower rate on the portion above: Jewelry is 20% up to $250 then 5%, Watches are 16% up to $1,500 then 3%, and Furniture is 15% up to $200 then 10%. Media items (Books, Music, Video, DVD, Software and Video Games) add a **$1.80 variable closing fee** on top of the 15% referral. Choose your category above and the calculator applies the correct rule.

## How the FBA fulfilment fee works.
The fulfilment fee depends on your product's **size tier** and **unit weight**. This calculator covers the two standard-size tiers: **small standard** (light items up to 16 ounces) and **large standard** (up to 20 pounds). Amazon publishes a per-unit fee for each weight band — 2-ounce steps for small standard, 4-ounce steps for large standard — and for 2026 it split these into three **price bands** based on your sale price: under $10, $10 to $50, and over $50. A cheaper item is cheaper for Amazon to fulfil relative to its value, so items under $10 pay a lower fulfilment fee, and items over $50 pay a higher one, for the exact same weight.

For example, a large-standard unit weighing 12 ounces priced between $10 and $50 has a base fulfilment fee of $4.20. The same unit priced under $10 would be $3.38, and over $50 would be $4.46. Enter your size tier and weight and the calculator reads the right cell from Amazon's rate card.

## The 2026 fuel and logistics surcharge.
As of 17 April 2026, Amazon applies a **3.5% fuel and logistics surcharge** on top of every base FBA fulfilment fee in the US and Canada. It is not baked into the published rate card — it stacks on the base fee — so the calculator shows it as a separate line. On a $4.20 base fee that adds about $0.15 per unit. Small on one sale, but meaningful across thousands of units.

## Storage and the Professional plan.
Amazon also charges a **monthly storage fee** per cubic foot of inventory. For standard-size items in the non-peak January–September period this is around $${amazonFees.storagePerCubicFoot.toFixed(2)} per cubic foot, rising sharply to $${amazonFees.storagePeakPerCubicFoot.toFixed(2)} in the October–December peak. Storage is billed on your average inventory, not per sale, so it is optional here — enter your unit's cubic-foot volume to fold in a rough per-unit monthly estimate. Separately, most sellers pay the **$39.99/month Professional selling plan**. That is a flat subscription regardless of how much you sell, so it is not deducted from any individual sale in this calculator; spread it across your monthly units to see its true per-unit impact.

## Working out your real profit.
Your **net proceeds** are the sale price minus the referral fee, the fulfilment fee and the surcharge (plus storage if you include it). Subtract your **landed product cost** — manufacturing plus inbound freight to Amazon — to get your **profit per unit**, and the calculator also shows your **net margin** as a percentage of the sale price. This is the number that tells you whether a product is worth selling: many new sellers discover that after Amazon's fees and their cost of goods, a $25 product nets only a few dollars, which then has to cover PPC advertising, returns and long-term storage. Use the calculator to pressure-test your pricing before you commit to inventory.

## Accuracy and scope.
Every rate in this calculator comes from Amazon's official US Seller Central fee pages and was verified on ${amazonFees.verifiedOn}. The 2026 standard-size fulfilment rate card was cross-checked against two independent full reproductions of Amazon's published table, which agreed on every weight and price-band value, and the worked example matches Amazon's own fee schedule. This version covers **standard-size products in the United States**. Oversize and bulky-item tiers, low-inventory and aged-inventory surcharges, removal and returns-processing fees, and non-US marketplaces are not modelled — they use separate rate cards we have not verified here, and we would rather leave them out than show a guessed number. Always confirm the final figure in Amazon's own Revenue Calculator in Seller Central before committing to a product, but for a fast, reliable estimate of what an FBA sale really earns you, this calculator gives you the real picture.`,

  workedExample: {
    scenario:
      "You sell a $25 item (Most categories, 15%) that is large-standard size, weighs 12 oz, and costs you $8 landed.",
    steps: [
      { label: "Sale price", value: "$25.00" },
      { label: "Referral fee (15%)", value: "−$3.75" },
      { label: "FBA fulfilment fee (large standard, 12 oz, $10–$50)", value: "−$4.20" },
      { label: "Fuel & logistics surcharge (3.5% of $4.20)", value: "−$0.15" },
      { label: "Total Amazon fees", value: "−$8.10" },
      { label: "Net proceeds", value: "$16.90" },
      { label: "Less product cost", value: "−$8.00" },
    ],
    result: "Profit = $8.90 per unit (35.6% net margin)",
  },

  faqs: [
    {
      q: "How much does Amazon FBA take per sale?",
      a: "Two main fees. The referral fee is a percentage of the sale price — 15% for most categories (8% for electronics/computers, 12% for automotive/industrial) with a $0.30 per-item minimum. The FBA fulfilment fee is a per-unit charge based on your size tier and weight, plus a 3.5% fuel surcharge. On a typical $25 standard-size item that is about $3.75 referral plus roughly $4.35 fulfilment, so around $8.10 (32%) before your product cost. Enter your own numbers above for an exact figure.",
    },
    {
      q: "What is the difference between the referral fee and the FBA fee?",
      a: "The referral fee is Amazon's sales commission — a percentage of the total sales price, charged on every sale whether you fulfil it yourself (FBM) or use FBA. The FBA fulfilment fee is separate: it is what Amazon charges to pick, pack and ship the unit from its warehouse, based on the product's size and weight. FBM sellers pay the referral fee but not the FBA fulfilment fee (they ship it themselves). This calculator models both because FBA sellers pay both.",
    },
    {
      q: "How is the FBA fulfilment fee calculated?",
      a: "By size tier and unit weight, read from Amazon's rate card. This calculator covers small standard (up to 16 oz) and large standard (up to 20 lb). For 2026 Amazon also splits standard-size fees into three price bands based on your sale price — under $10, $10 to $50, and over $50 — so a cheaper item costs less to fulfil and a pricier one costs more, for the same weight. A 3.5% fuel and logistics surcharge is then added on top of the base fee.",
    },
    {
      q: "What is the 3.5% fuel and logistics surcharge?",
      a: "From 17 April 2026, Amazon applies a 3.5% surcharge to all FBA fulfilment fees in the US and Canada to cover fuel and logistics costs. It is not included in the published fulfilment rate card — it stacks on top of the base fee — so this calculator shows it as its own line. On a $4.20 fulfilment fee it adds about $0.15 per unit.",
    },
    {
      q: "Does this include Amazon's monthly storage fee?",
      a: "Optionally. Amazon charges a monthly storage fee per cubic foot of inventory — around $" + amazonFees.storagePerCubicFoot.toFixed(2) + " for standard-size items from January to September, rising to $" + amazonFees.storagePeakPerCubicFoot.toFixed(2) + " in the October–December peak. Storage is billed on your average stored inventory, not per sale, so it is off by default. Enter your unit's cubic-foot volume to include a rough per-unit monthly estimate. Aged-inventory and low-inventory surcharges are not modelled.",
    },
    {
      q: "Is the $39.99 monthly Professional plan included?",
      a: "No. The $39.99/month Professional selling plan is a flat subscription you pay regardless of how many units you sell, so it is not a per-sale fee and is not deducted from an individual sale here. To see its real impact, divide $39.99 by your expected monthly unit sales and treat that as a per-unit overhead. (The Individual plan has no monthly fee but charges $0.99 per item sold instead.)",
    },
    {
      q: "Does the Amazon FBA calculator cover oversize items?",
      a: "Not in this version. It covers standard-size products only — small standard (up to 16 oz) and large standard (up to 20 lb). Oversize and bulky-item tiers use a separate, higher rate card that we have not verified here, so they are intentionally excluded rather than estimated. If your product is oversize, use Amazon's own Revenue Calculator in Seller Central for the exact fulfilment fee.",
    },
    {
      q: "Which countries does this calculator support?",
      a: "This version covers the United States (USD) only. Amazon publishes different fulfilment rate cards, referral rates and currencies for the UK, Germany, Canada and other marketplaces, and we have not verified those tables for this release — so we left them out rather than show a number we could not confirm. All figures here reflect the US 2026 fee schedule, verified on " + amazonFees.verifiedOn + ".",
    },
  ],

  related: [
    "ebay-fee-calculator",
    "etsy-fee-calculator",
    "walmart-seller-fee-calculator",
    "printful-profit-calculator",
  ],

  sources: [
    {
      label: "Amazon Seller Central — Referral fees by category (US)",
      url: "https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98CX",
    },
    {
      label: "Amazon Seller Central — 2026 US FBA fulfilment fee changes",
      url: "https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW",
    },
    {
      label: "Amazon Seller Central — FBA fulfilment fees (standard-size)",
      url: "https://sellercentral.amazon.com/help/hub/reference/GABBX6GZPA8MSZGW",
    },
    {
      label: "Amazon Seller Central — Monthly inventory storage fees",
      url: "https://sellercentral.amazon.com/help/hub/reference/G7TMHPQGRQ54EWLU",
    },
  ],

  feesVerifiedOn: amazonFees.verifiedOn,
  lastUpdated: amazonFees.verifiedOn,
};
