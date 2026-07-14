import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { amazonFees } from "../../config/fees";
import { computeAmazonSellerFee } from "./formula";

export const amazonSellerFeeCalculator: CalculatorConfig = {
  slug: "amazon-seller-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "amazon",
  title: "Amazon Seller Fee Calculator",
  metaDescription:
    "Free Amazon seller fee calculator (US, 2026). Work out Amazon's referral fee (commission) by category, the $0.30 per-item minimum and the media closing fee — and see exactly what you keep on each sale.",
  h1: "Amazon Seller Fee Calculator",
  intro:
    "Calculate exactly how much Amazon takes from a sale. Pick your category, enter your price (and any shipping you charge), and see the referral fee, the $0.30 per-item minimum, the media closing fee where it applies, and your net proceeds and profit. Built for FBM and general sellers who just want Amazon's commission — no FBA fulfilment fees.",

  keywords: {
    primary: "amazon seller fee calculator",
    secondary: [
      "amazon referral fee calculator",
      "amazon commission calculator",
      "how much does amazon take",
      "amazon fee calculator",
      "amazon selling fee calculator",
      "amazon fbm fee calculator",
      "amazon seller commission calculator",
    ],
    longTail: [
      "amazon seller fee calculator usa",
      "amazon referral fee by category",
      "amazon fees on $100",
      "amazon fees on a $50 sale",
      "how much commission does amazon take",
      "amazon 15 percent referral fee calculator",
      "amazon media closing fee calculator",
      "amazon per item minimum referral fee",
      "amazon seller profit calculator",
      "amazon fee calculator with shipping",
      "what percentage does amazon take from sellers",
      "amazon jewelry referral fee calculator",
      "amazon clothing referral fee calculator",
      "amazon fbm profit calculator",
      "how to calculate amazon seller fees",
    ],
    competition: "H",
    intent: "tool",
  },

  inputs: [
    {
      id: "itemPrice",
      label: "Item price",
      type: "currency",
      default: 40,
      min: 0,
      help: "The price the buyer pays for the item.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "Amazon's referral fee applies to shipping you charge too, so include it here if you set your own shipping (FBM).",
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
      id: "productCost",
      label: "Your product cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What the item cost you — to calculate your profit and margin.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const categoryId = String(values.category ?? "most");
    const category =
      amazonFees.categories.find((c) => c.id === categoryId) ?? amazonFees.categories[0];

    const itemPrice = Number(values.itemPrice) || 0;
    const shipping = Number(values.shipping) || 0;
    const productCost = Number(values.productCost) || 0;

    const r = computeAmazonSellerFee({
      itemPrice,
      shipping,
      productCost,
      category,
      referralMinimum: amazonFees.referralMinimum,
      mediaClosingFee: amazonFees.mediaClosingFee,
    });

    const hasCost = productCost > 0;
    const refRate = r.revenue > 0 ? (r.referralFee / r.revenue) * 100 : 0;

    const rows: CalcResult["rows"] = [
      {
        label: shipping > 0 ? "Sale revenue (item + shipping)" : "Item price",
        display: ctx.formatCurrency(r.revenue),
      },
      {
        label: `Referral fee (${ctx.formatPercent(refRate)})`,
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

    rows.push({ label: "Total Amazon fees", display: ctx.formatCurrency(r.totalFees), kind: "deduction" });
    rows.push({ label: "Net proceeds", display: ctx.formatCurrency(r.netProceeds), kind: "net" });

    if (hasCost) {
      rows.push({ label: "Product cost", display: ctx.formatCurrency(productCost), kind: "deduction" });
      rows.push({ label: "Profit", display: ctx.formatCurrency(r.profit), kind: "net" });
      rows.push({ label: "Net margin", display: ctx.formatPercent(r.marginPercent), kind: "muted" });
    }

    return {
      headline: {
        label: hasCost ? "Profit" : "Net proceeds",
        display: ctx.formatCurrency(hasCost ? r.profit : r.netProceeds),
        sub: `Amazon takes ${ctx.formatCurrency(r.totalFees)} (${ctx.formatPercent(r.effectiveFeeRatePercent)}) of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows,
    };
  },

  howItWorks:
    "The main fee Amazon charges every seller is the referral fee — its commission for selling on the marketplace. It is a percentage of the total sales price: the item price plus any shipping and gift wrap you charge the buyer. You pay the referral fee whether you fulfil the order yourself (FBM) or use FBA; the difference is that FBA sellers also pay a separate fulfilment fee, which this calculator does not include.\n\nMost categories charge a 15% referral fee, but several differ. Consumer electronics, computers, cell phone devices and video game consoles are 8%; automotive and industrial products are 12%. Some categories are price-banded — the rate for the whole price depends on which band it falls in, such as Clothing (5% up to $15, 10% to $20, then 17%) — and a few are tiered, applying a headline rate up to a breakpoint and a lower rate above (Jewelry 20% then 5% over $250; Watches 16% then 3% over $1,500; Furniture 15% then 10% over $200).\n\nEvery referral fee is subject to a $0.30 per-item minimum, so on very cheap items you pay $0.30 rather than the percentage. Media categories — Books, Music, Video, DVD, Software and Video Games — add a $1.80 variable closing fee on top of the 15% referral. Enter your category and price above and the calculator applies the right rule, then subtracts the fees (and your product cost, if you add it) to show your net proceeds, profit and margin.",

  seoContent: `An Amazon seller fee calculator answers the question every seller asks first: how much does Amazon actually take, and what do I keep? For sellers who fulfil their own orders (FBM) or who simply want to understand Amazon's commission, the fee that matters is the referral fee. This free calculator applies Amazon's current US referral rates by category — including the price-banded and tiered categories, the $0.30 per-item minimum and the $1.80 media closing fee — so you can price correctly and know your payout before you list.

## What the referral fee is.
The referral fee is Amazon's commission for selling on its marketplace. It is charged as a percentage of the total sales price — the item price plus any shipping and gift-wrap charges you set — and it applies to every sale, whether you ship the order yourself or use Fulfilment by Amazon. On a straightforward $40 item in a standard 15% category, the referral fee is $6.00 and you keep $34.00 before your own product cost. If you also charge $5 shipping, the fee is 15% of the full $45, not just the item price, because Amazon's commission always includes shipping you charge.

## Referral rates by category.
Most categories — Home & Kitchen, Toys & Games, Sports & Outdoors, Office Products, Pet Supplies, Beauty, Health & Household and many others — are **15%**. The notable lower rates are:

- **8%**: Consumer Electronics, Computers, Cell Phone Devices, Video Game Consoles
- **12%**: Automotive & Powersports, Industrial & Scientific

A few categories are **price-banded**, meaning the whole price is charged at the rate of the band it falls into:

- **Clothing & Accessories**: 5% up to $15, 10% from $15 to $20, 17% above $20
- **Baby Products**: 8% up to $10, 15% above $10
- **Grocery & Gourmet**: 8% up to $15, 15% above $15

And a few are **tiered**, charging a headline rate up to a breakpoint and a lower rate on the portion above it:

- **Jewelry**: 20% up to $250, then 5% on the amount above $250
- **Watches**: 16% up to $1,500, then 3% above
- **Furniture**: 15% up to $200, then 10% above

Choosing the right category above matters, because the difference between 8% and 17% is large on the same sale.

## The $0.30 per-item minimum.
Amazon applies a minimum referral fee of $0.30 per item in most categories. If a percentage-based fee would come to less than $0.30 — for example 15% of a $1.50 item is only $0.225 — you pay the $0.30 minimum instead. This is why the effective fee rate on very cheap products is much higher than the headline percentage, and it is an important detail for anyone selling low-priced items in volume.

## The media closing fee.
If you sell in a media category — Books, Music, Video, DVD, Software or Video Games — Amazon charges a **$1.80 variable closing fee** on every item, on top of the 15% referral fee. So a $20 book is charged $3.00 (15%) plus $1.80, for $4.80 in total fees. This closing fee applies to media whether you sell FBM or FBA, and the calculator adds it automatically when you pick the media category.

## FBM vs FBA — what this calculator covers.
This calculator models the referral fee (plus the media closing fee), which is the fee you pay as a Fulfilled-by-Merchant seller who ships orders yourself. If you use FBA, you pay this same referral fee plus a separate FBA fulfilment fee based on your product's size and weight — for that, use our dedicated Amazon FBA calculator, which adds the fulfilment fee, the 2026 price bands and the fuel surcharge. Either way, the referral commission shown here is the starting point for every Amazon sale.

## Other costs to keep in mind.
The referral fee is the core selling fee, but it is not the only cost of doing business on Amazon. Most sellers pay the **$39.99/month Professional selling plan**, a flat subscription regardless of sales volume (the Individual plan instead charges $0.99 per item sold). Advertising (Sponsored Products), returns, and — for FBA sellers — storage and fulfilment all add up. Because the Professional plan is a fixed monthly cost rather than a per-sale fee, it is not deducted from any individual sale here; spread it across your monthly order count to see its true per-unit impact. To model your real bottom line, take the net proceeds from this calculator, subtract your product cost, and then account for advertising and overheads separately.

## Working out your profit.
Add your product cost in the optional field and the calculator shows your **profit** and **net margin** as well as your net proceeds. This is the number that tells you whether a listing is worth it: a $40 product in a 15% category nets $34.00 after Amazon's referral fee, and if it cost you $18 to source, your profit is $16.00 — a 40% margin before advertising and overheads. Run your own price, category and cost through the tool to check any product before you commit.

## Accuracy and scope.
Every referral rate here comes from Amazon's official US Seller Central fee schedule and was verified on ${amazonFees.verifiedOn}. This calculator covers the United States (USD) and the referral fee (plus the media closing fee); it does not include FBA fulfilment fees, storage, advertising or non-US marketplaces, which use separate schedules. For FBA fulfilment costs, use our Amazon FBA calculator. Always confirm the final figure in Amazon Seller Central before pricing, but for a fast, reliable estimate of Amazon's commission and what you keep, this calculator gives you the real number.`,

  workedExample: {
    scenario:
      "You sell a $40 item in a standard 15% category (FBM, no separate shipping) that cost you $18.",
    steps: [
      { label: "Item price", value: "$40.00" },
      { label: "Referral fee (15%)", value: "−$6.00" },
      { label: "Total Amazon fees", value: "−$6.00" },
      { label: "Net proceeds", value: "$34.00" },
      { label: "Less product cost", value: "−$18.00" },
    ],
    result: "Profit = $16.00 (40% net margin)",
  },

  faqs: [
    {
      q: "How much does Amazon take from a sale?",
      a: "Amazon's core selling fee is the referral fee — a percentage of the total sales price (item + shipping you charge). Most categories are 15%, so on a $40 sale Amazon takes $6.00 and you keep $34.00 before your product cost. Some categories are lower (electronics 8%, automotive 12%) and a few are banded or tiered. A $0.30 per-item minimum applies, and media items add a $1.80 closing fee. FBA sellers pay this referral fee plus a separate fulfilment fee.",
    },
    {
      q: "What percentage does Amazon take from sellers?",
      a: "For most categories the referral fee is 15%. The main exceptions are Consumer Electronics, Computers, Cell Phone Devices and Video Game Consoles at 8%, and Automotive & Powersports and Industrial & Scientific at 12%. Clothing is banded (5% up to $15, 10% to $20, 17% above), and Jewelry (20% then 5% over $250) and Watches (16% then 3% over $1,500) are tiered. Pick your category above for the exact rate.",
    },
    {
      q: "What is Amazon's referral fee minimum?",
      a: "Amazon charges a minimum referral fee of $0.30 per item in most categories. If the percentage fee works out to less than $0.30 — for example 15% of a $1.50 item is $0.225 — you pay the $0.30 minimum instead. This makes the effective fee rate on very low-priced items higher than the headline percentage, which matters if you sell cheap products in volume.",
    },
    {
      q: "Does Amazon charge a fee on shipping?",
      a: "Yes, for seller-fulfilled (FBM) orders where you set the shipping charge, Amazon's referral fee is calculated on the item price plus the shipping you charge the buyer. So a $30 item with $8 shipping is charged the referral fee on the full $38. Include your shipping charge in the optional field above to see the correct fee.",
    },
    {
      q: "What is the media closing fee?",
      a: "Amazon charges a $1.80 variable closing fee on every item sold in a media category — Books, Music, Video, DVD, Software and Video Games — on top of the standard 15% referral fee. So a $20 book costs $3.00 (15%) plus $1.80, for $4.80 in fees. The closing fee applies to media whether you sell FBM or FBA. Select the Books & Media category above to include it.",
    },
    {
      q: "What is the difference between this and the FBA calculator?",
      a: "This calculator shows Amazon's referral fee — the commission every seller pays, and the only Amazon selling fee for FBM sellers who ship their own orders. The Amazon FBA calculator adds the FBA fulfilment fee (by size tier and weight), the 2026 price bands and the 3.5% fuel surcharge, for sellers who store and ship through Amazon. Use this page for referral/commission math and the FBA page when Amazon fulfils your orders.",
    },
    {
      q: "Is the $39.99 monthly seller fee included?",
      a: "No. The $39.99/month Professional selling plan is a flat subscription you pay regardless of sales volume, so it is not a per-sale fee and is not deducted from an individual sale here. To gauge its impact, divide $39.99 by your expected monthly orders. Sellers on the Individual plan pay no monthly fee but are charged $0.99 per item sold instead of the subscription.",
    },
  ],

  related: [
    "amazon-fba-calculator",
    "ebay-fee-calculator",
    "etsy-fee-calculator",
  ],

  sources: [
    {
      label: "Amazon Seller Central — Referral fees by category (US)",
      url: "https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98CX",
    },
    {
      label: "Amazon Seller Central — Selling plan pricing (Professional vs Individual)",
      url: "https://sellercentral.amazon.com/help/hub/reference/G64491",
    },
    {
      label: "Amazon — Sell on Amazon: pricing and fees",
      url: "https://sell.amazon.com/pricing",
    },
  ],

  feesVerifiedOn: amazonFees.verifiedOn,
  lastUpdated: amazonFees.verifiedOn,
};
