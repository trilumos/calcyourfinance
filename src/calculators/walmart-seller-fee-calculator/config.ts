import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { walmartFees } from "../../config/fees";
import { computeWalmartFee } from "./formula";

// Build the category <select> options from the fees registry so rates and
// labels stay in sync automatically.
const CATEGORY_OPTIONS = walmartFees.categories.map((c) => ({
  value: c.id,
  label: c.label,
}));

const DEFAULT_CATEGORY_ID = "most";

export const walmartSellerFeeCalculator: CalculatorConfig = {
  slug: "walmart-seller-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "walmart",
  title: "Walmart Marketplace Seller Fee Calculator",
  metaDescription:
    "Free Walmart Marketplace seller fee calculator. See exactly what Walmart's referral fee is for your category — from 6% (computers) to 20% (jewelry) — your payout, and profit. Updated 2026.",
  h1: "Walmart Marketplace Seller Fee Calculator",
  intro:
    "Calculate the Walmart Marketplace referral fee for your sale and see your exact payout. Select your product category, enter your item price and shipping, and see what Walmart takes — rates range from 6% (personal computers) to 20% (jewelry). No monthly fee, no setup fee: you only pay when you sell.",

  keywords: {
    primary: "walmart seller fee calculator",
    secondary: [
      "walmart marketplace fees",
      "walmart referral fees",
      "walmart seller fees",
      "walmart commission calculator",
      "walmart seller fees by category",
      "walmart marketplace seller fees",
      "walmart fee calculator",
      "walmart marketplace fee calculator",
      "walmart selling fees",
    ],
    longTail: [
      "how much does walmart marketplace take",
      "what percentage does walmart take from sellers",
      "walmart referral fee by category",
      "walmart marketplace referral fee calculator",
      "walmart seller fee percentage",
      "walmart take rate calculator",
      "walmart marketplace payout calculator",
      "walmart marketplace profit calculator",
      "how to calculate walmart referral fees",
      "walmart seller fees electronics",
      "walmart marketplace fees jewelry",
      "walmart marketplace fees apparel",
      "walmart marketplace no monthly fee",
      "walmart vs amazon seller fees",
      "walmart wfs fees",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "category",
      label: "Product category",
      type: "select",
      default: DEFAULT_CATEGORY_ID,
      options: CATEGORY_OPTIONS,
      help: "Walmart's referral fee varies by category. Select the closest match to your product.",
    },
    {
      id: "itemPrice",
      label: "Item price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price the buyer pays for the item. Walmart's referral fee applies to the full sales price including shipping.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer",
      type: "currency",
      default: 0,
      min: 0,
      help: "Walmart's referral fee applies to shipping and handling charges too (total sales price).",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you paid for the item — to calculate your actual profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const categoryId = String(values.category || DEFAULT_CATEGORY_ID);
    const category =
      walmartFees.categories.find((c) => c.id === categoryId) ??
      walmartFees.categories[0]!;

    const itemPrice = Number(values.itemPrice) || 0;
    const shipping = Number(values.shipping) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const hasCost = itemCost > 0;

    const r = computeWalmartFee({ itemPrice, shipping, itemCost, category });

    // Build a human-readable rate description for the referral fee row.
    let rateLabel: string;
    if (category.mechanic === "flat") {
      rateLabel = ctx.formatPercent(category.percent);
    } else if (category.mechanic === "switch") {
      // Show the rate that actually applied for this price.
      const t1 = category.tier1Threshold ?? Infinity;
      const t2 = category.tier2Threshold ?? Infinity;
      const revenue = r.revenue;
      let appliedRate: number;
      if (revenue <= t1) {
        appliedRate = category.percent;
      } else if (revenue <= t2) {
        appliedRate = category.percent2 ?? category.percent;
      } else {
        appliedRate = category.percent3 ?? category.percent2 ?? category.percent;
      }
      rateLabel = `${ctx.formatPercent(appliedRate)} (tiered by price)`;
    } else {
      // marginal — show effective rate
      rateLabel = `${ctx.formatPercent(r.effectiveRatePercent)} effective (tiered brackets)`;
    }

    // Category note for the hint (rate structure detail).
    const categoryNote = category.note;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Walmart takes ${ctx.formatPercent(r.effectiveRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows: [
        {
          label: r.revenue === itemPrice
            ? "Item price"
            : "Total sales price (item + shipping)",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `Walmart referral fee — ${category.label} (${rateLabel})`,
          display: ctx.formatCurrency(r.referralFee),
          kind: "deduction",
          hint: categoryNote,
        },
        {
          label: "You receive",
          display: ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasCost
          ? [
              {
                label: "Item cost",
                display: ctx.formatCurrency(itemCost),
                kind: "deduction" as const,
              },
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
    "Walmart Marketplace charges sellers a referral fee — their term for a commission — on every completed sale. There is no monthly subscription fee, no setup fee, and no per-listing fee. You only pay when you sell.\n\nThe referral fee is calculated on the total sales price: the item price plus any shipping and handling charges the buyer pays. Rates vary by product category and range from 6% for personal computers up to 20% on the first $250 of jewelry sales.\n\nSome categories use a simple flat rate — for example, consumer electronics is always 8%, and most home and kitchen products are 15%. Other categories use a tiered structure. There are two kinds of tiers: a 'switch' tier (like Apparel) where the entire item is charged one rate based on which price band the total falls into — e.g. items priced above $20 are charged at 15% on the full price; and a 'marginal' tier (like Compact Appliances) where a lower rate applies only to the portion of the price above a threshold — e.g. the first $300 of a compact appliance is charged at 12%, and any amount above $300 is charged at the lower 8% rate.\n\nWalmart Fulfillment Services (WFS) is an optional, separate fulfillment program with its own cost schedule. This calculator models only the referral fee — the single fee Walmart deducts from every completed sale. If you use WFS, add those costs separately.",

  seoContent: `Our Walmart Marketplace seller fee calculator is a free tool that shows exactly what Walmart's referral fee costs you and what you actually keep from each sale. Whether you're listing household goods, electronics, apparel, or jewelry, rates differ significantly by category — and some categories use tiered pricing that changes your effective cost depending on the item price. This calculator does the correct math for every category and gives you an instant payout estimate so you can price your listings to hit your target margin.

## What is a Walmart Marketplace referral fee?

When you sell on Walmart Marketplace, Walmart charges a referral fee on every completed transaction. This is the primary — and often only — fee sellers pay on each sale. There is no monthly subscription fee, no setup fee, and no listing fee. Walmart deducts the referral fee from your sale proceeds and remits the remainder to your seller account.

The referral fee is calculated on the total sales price, which Walmart defines as the item price plus shipping and handling, gift wrap, and any other charges paid by the buyer. This means if you charge $80 for an item and $10 for shipping, Walmart calculates the fee on $90 — not just $80.

## Walmart Marketplace referral fees by category.

Referral fees vary widely depending on what you're selling. Here's a summary of the main rates:

- **Personal Computers: 6%** — the lowest referral fee on the platform, reflecting thin margins in this segment.
- **Major Appliances, Consumer Electronics, Camera & Photo, Video Game Consoles, Collectibles: 8%** — standard electronics and technology rate.
- **Automotive & Powersports, Base Power Tools, Industrial & Scientific, Musical Instruments: 12%** — mid-tier categories.
- **Most categories (Home, Kitchen, Toys, Books, Pet Supplies, Tools, Luggage, Shoes, Software, Video & DVD, Music): 15%** — the default catch-all rate.
- **Jewelry & Precious Metals: 20% on the first $250, then 5% above $250** — the highest headline rate, but the marginal structure makes high-value items significantly cheaper in percentage terms.

Some categories have dynamic, price-dependent rates described below.

## Tiered referral fees: switch vs. marginal categories.

Walmart uses two distinct tiering mechanisms, and it matters which one applies to your category.

**Switch tiers** (price-band flip): The entire item is charged at one flat rate based on which price band the total falls into. For example, Apparel uses three bands: items priced at or below $15 are charged 5%, items between $15 and $20 are charged 10%, and items above $20 are charged 15% on the full price — not just the portion above $20. This means a $20.01 apparel item costs noticeably more than a $20.00 item in percentage terms (15% vs 10%). The calculator handles these band boundaries precisely.

**Marginal tiers** (bracket math): Only the portion of the price above a threshold is charged the lower rate. This works like income tax brackets. For example, Compact Appliances: the first $300 of the total price is charged at 12%; any amount above $300 is charged at the lower 8% rate. So a $500 appliance costs ($300 × 12%) + ($200 × 8%) = $36 + $16 = $52 in referral fees, not a flat percentage of $500.

Categories using marginal tiers: Compact Appliances ($300 threshold), Electronics Accessories ($100 threshold), Indoor & Outdoor Furniture ($200 threshold), Jewelry & Precious Metals ($250 threshold), and Watches ($1,500 threshold).

## Is there a minimum referral fee?

No. Walmart Marketplace does not charge a minimum referral fee per item. You pay exactly the calculated percentage of the total sales price, down to the cent.

## Are there any monthly or setup fees?

No. Walmart Marketplace is free to join and has no monthly subscription fee, no setup fee, and no per-listing fee. Fees are only charged when a sale completes. This contrasts with Amazon Professional selling accounts, which charge $39.99/month regardless of sales volume.

## What about Walmart Fulfillment Services (WFS)?

Walmart Fulfillment Services (WFS) is an optional program where Walmart stores, picks, packs, and ships your inventory — similar to Amazon FBA. WFS fees are separate from the referral fee and depend on item size and weight. This calculator covers only the referral fee. If you use WFS, you should add WFS fulfillment costs to your total cost of selling. Walmart publishes the WFS fee schedule on their pricing page.

## From payout to real profit.

Payout and profit are not the same. Your payout is your sale price minus Walmart's referral fee. Your profit is your payout minus what you paid for the inventory (your cost of goods). Enter your item cost in the optional field and the calculator shows your gross profit — the figure that matters for evaluating whether a product is worth selling.

For example: a $100 consumer electronics item with a $60 cost of goods. Referral fee is 8% = $8. Payout = $92. Profit = $92 − $60 = $32. This is a 32% gross margin. Understanding this number helps you filter out low-margin products before you list them.

## Accuracy and what this calculator covers.

Every rate in this calculator is taken from the official Walmart Marketplace pricing page and verified on 2026-06-13. The calculator models the referral fee only — the sole per-transaction fee Walmart deducts from sellers. It does not model Walmart Fulfillment Services (WFS) fees, return shipping costs, chargeback deductions, or any promotional cost-per-click advertising fees. For the vast majority of standard Walmart Marketplace sellers, the referral fee shown here is the only deduction from your sale proceeds. Check the sources linked below and your Walmart Seller Center account for the complete picture before making pricing decisions.`,

  workedExample: {
    scenario:
      "You sell a $100 item in the 'Most categories' rate (15%) with no separate shipping charge.",
    steps: [
      { label: "Item price", value: "$100.00" },
      { label: "Shipping charged to buyer", value: "$0.00" },
      { label: "Total sales price", value: "$100.00" },
      { label: "Walmart referral fee (15%)", value: "$15.00" },
      { label: "You receive", value: "$85.00" },
    ],
    result: "You receive $85.00",
  },

  faqs: [
    {
      q: "What percentage does Walmart Marketplace take from sellers?",
      a: "Walmart charges a referral fee that varies by product category. Most categories are 15%. Lower rates apply in consumer electronics and tech (8%), major appliances (8%), personal computers (6%), and a few others. Some categories like jewelry have tiered pricing: 20% on the first $250 of the sale price, then 5% on the portion above. Enter your sale price and category in the calculator above to see the exact dollar amount.",
    },
    {
      q: "Is there a monthly fee to sell on Walmart Marketplace?",
      a: "No. Walmart Marketplace has no monthly subscription fee, no setup fee, and no listing fee. You only pay the referral fee when a sale completes. This is different from Amazon, which charges $39.99/month for a Professional seller account.",
    },
    {
      q: "Does the Walmart referral fee apply to shipping?",
      a: "Yes. Walmart calculates the referral fee on the total sales price, which includes the item price plus any shipping and handling charges paid by the buyer. If you sell an item for $80 and charge $10 shipping, Walmart's fee is calculated on $90.",
    },
    {
      q: "What are Walmart Marketplace fees on a $100 sale?",
      a: "It depends on the category. For most categories (home, garden, toys, books, etc.) the fee is 15%, so you'd receive $85. For consumer electronics, it's 8%, so you'd receive $92. For personal computers, it's 6%, giving you $94. Use the calculator above and select your category to get the exact figure.",
    },
    {
      q: "What is the Walmart referral fee for electronics?",
      a: "Consumer Electronics are charged an 8% referral fee on the total sales price. Electronics Accessories use a marginal tier: 15% on the first $100 and 8% on the portion above $100. Camera & Photo is a flat 8%. Personal Computers are 6%.",
    },
    {
      q: "What are Walmart Marketplace fees compared to Amazon?",
      a: "Both Walmart and Amazon charge category-based referral fees in a similar range (roughly 6–20%). However, Amazon charges $39.99/month for a Professional selling account, while Walmart Marketplace has no monthly fee. In categories where rates are similar, Walmart's lower overhead can result in a better overall take for sellers — especially those with moderate volume who don't benefit from Amazon's traffic scale.",
    },
    {
      q: "What is Walmart Fulfillment Services (WFS) and is it included in this calculator?",
      a: "WFS is Walmart's optional fulfillment program — similar to Amazon FBA — where Walmart stores, picks, packs, and ships your inventory. WFS fees are separate from the referral fee and depend on item size and weight. This calculator covers only the referral fee. If you use WFS, check the WFS fee schedule on Walmart's pricing page and add those costs separately.",
    },
    {
      q: "Does Walmart have a minimum referral fee?",
      a: "No. There is no minimum referral fee per item on Walmart Marketplace. You pay exactly the calculated percentage of the total sales price — no floor applies.",
    },
  ],

  related: [
    "ebay-fee-calculator",
    "etsy-fee-calculator",
    "mercari-fee-calculator",
    "poshmark-fee-calculator",
    "tiktok-shop-fee-calculator",
  ],

  sources: [
    {
      label: "Walmart Marketplace — Pricing (official referral fee table)",
      url: "https://marketplace.walmart.com/pricing/",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-13",
};
