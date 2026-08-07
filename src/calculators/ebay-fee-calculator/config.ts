import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { ebayFees } from "../../config/fees";
import { ebayRateCards } from "../../lib/rateCards";
import { computeEbayFee } from "./formula";

const COUNTRIES = ["US", "GB", "AU", "CA"] as const;

export const ebayFeeCalculator: CalculatorConfig = {
  slug: "ebay-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "ebay",
  title: "eBay Fee Calculator",
  metaDescription:
    "Free eBay fee calculator. Work out eBay's final value fee, per-order fee, international fee and exactly what you keep — US, UK, Australia and Canada, with category rates and private vs business sellers.",
  h1: "eBay Fee Calculator",
  intro:
    "Calculate eBay seller fees on a sale and see your exact payout. Pick your country and category, add shipping and your item cost, and the calculator breaks down the final value fee, the fixed per-order fee, the international fee and your profit. UK private sellers correctly show £0 selling fees.",

  keywords: {
    primary: "ebay fee calculator",
    secondary: [
      "ebay fees calculator",
      "ebay seller fees",
      "ebay final value fee calculator",
      "ebay selling fees calculator",
      "calculate ebay fees",
      "ebay fee calculator usa",
      "ebay profit calculator",
      "ebay payout calculator",
      "ebay final value fee",
    ],
    longTail: [
      "how much does ebay take",
      "what percentage does ebay take",
      "ebay fees on $100",
      "ebay fees on $1000",
      "ebay business seller fees",
      "ebay private seller fees",
      "ebay final value fee 2026",
      "ebay international fee calculator",
      "ebay fee calculator uk",
      "ebay fee calculator australia",
      "ebay fee calculator canada",
      "ebay seller fees by category",
      "ebay fee calculator with shipping",
      "how to calculate ebay fees",
      "ebay high value item fee",
      "ebay buyer protection fee",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: [...COUNTRIES], default: "US" },

  inputs: [
    {
      id: "itemPrice",
      label: "Item price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price the buyer pays for the item.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer",
      type: "currency",
      default: 0,
      min: 0,
      help: "eBay's final value fee applies to shipping too.",
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      default: "most",
      // Union of categories across supported countries. compute() resolves the
      // selected id against the chosen country's table and falls back to "most"
      // when a category isn't offered in that country (so switching country is
      // always safe). US has the richest set; AU/CA/UK use a subset.
      options: [
        { value: "most", label: "Most categories" },
        { value: "books", label: "Books, DVDs, Music, Movies & TV" },
        { value: "coins", label: "Coins & Paper Money" },
        { value: "cards", label: "Trading Cards" },
        { value: "guitars", label: "Guitars & Basses" },
        { value: "bullion", label: "Bullion" },
        { value: "jewelry", label: "Jewelry & Watches" },
        { value: "handbags", label: "Women's Handbags" },
        { value: "sneakers", label: "Sneakers ($150+)" },
        { value: "nft", label: "NFTs" },
        { value: "clothing",   label: "Clothes, Shoes & Accessories (UK)" },
        { value: "industrial", label: "Business, Office & Industrial (UK)" },
        { value: "other",      label: "Pet Supplies / Crafts / Everything Else (UK)" },
        { value: "media",      label: "Books, Music, Films & Media (UK)" },
        { value: "tech",       label: "Computers / Cameras / Mobiles, banded (UK)" },
        { value: "jewellery",  label: "Jewellery & Watches, banded (UK)" },
      ],
      help: "Final value fee rates vary by category. Not every category exists in every country — unlisted ones use the 'most categories' rate.",
    },
    {
      id: "sellerType",
      label: "Seller type",
      type: "select",
      default: "business",
      options: [
        { value: "business", label: "Business seller" },
        { value: "private", label: "Private seller" },
      ],
      help: "In the UK, private sellers pay no selling fees — the buyer pays a separate Buyer Protection fee.",
    },
    {
      id: "international",
      label: "International buyer",
      type: "toggle",
      default: false,
      help: "Buyer registered outside your country. Adds eBay's international fee.",
    },
    {
      id: "adPercent",
      label: "Promoted listings ad rate (optional)",
      type: "percent",
      default: 0,
      min: 0,
      max: 100,
      step: 0.1,
      help: "If you use Promoted Listings, enter your ad rate as a % of the sale.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What the item cost you — to calculate your profit.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const fees = ebayFees[ctx.country] ?? ebayFees.US!;
    const categoryId = String(values.category ?? "most");
    const category =
      fees.categories.find((c) => c.id === categoryId) ?? fees.categories[0];

    const itemPrice = Number(values.itemPrice) || 0;
    const shipping = Number(values.shipping) || 0;
    const revenueForThreshold = itemPrice + shipping;
    const perOrderFee =
      revenueForThreshold <= fees.perOrder.threshold ? fees.perOrder.low : fees.perOrder.high;
    // Sneaker/flat categories override the per-order fee to zero.
    const flatNoPerOrder = category.id === "sneakers" || category.id === "nft";
    const sellerType = values.sellerType === "private" ? "private" : "business";

    const r = computeEbayFee({
      itemPrice,
      shipping,
      itemCost: Number(values.itemCost) || 0,
      fvfPercent: category.percent,
      perOrderFee: flatNoPerOrder ? 0 : perOrderFee,
      tierBreakpoint: category.tierBreakpoint,
      tierPercent: category.tierPercent,
      fvfCap: fees.fvfCap,
      internationalPercent: fees.internationalPercent,
      international: Boolean(values.international),
      regulatoryPercent: fees.regulatoryPercent,
      taxOnFeePercent: fees.taxOnFeePercent,
      adPercent: Number(values.adPercent) || 0,
      sellerType,
      privateSellerFree: fees.privateSellerFree,
    });

    const hasCost = (Number(values.itemCost) || 0) > 0;

    // Private seller in a zero-fee market: a distinct, simpler readout.
    if (r.privateFree) {
      return {
        headline: {
          label: "You receive",
          display: ctx.formatCurrency(r.payout),
          sub: "Private sellers pay no eBay selling fees — the buyer pays a separate Buyer Protection fee",
        },
        rows: [
          { label: "Sale revenue (item + shipping)", display: ctx.formatCurrency(r.revenue) },
          { label: "eBay selling fees (private seller)", display: ctx.formatCurrency(0), kind: "muted" },
          { label: "You receive", display: ctx.formatCurrency(r.payout), kind: "net" },
          ...(hasCost
            ? [{ label: "Profit after item cost", display: ctx.formatCurrency(r.profit), kind: "net" as const }]
            : []),
        ],
      };
    }

    const fvfLabel = category.tierPercent != null && category.tierBreakpoint != null
      ? `Final value fee (${ctx.formatPercent(category.percent)} to ${ctx.formatCurrency(category.tierBreakpoint)}, then ${ctx.formatPercent(category.tierPercent)})`
      : `Final value fee (${ctx.formatPercent(category.percent)})`;

    const capNote =
      fees.fvfCap != null && r.finalValueFee >= fees.fvfCap
        ? `Capped at ${ctx.formatCurrency(fees.fvfCap)} per item`
        : undefined;

    const rows: CalcResult["rows"] = [
      { label: "Sale revenue (item + shipping)", display: ctx.formatCurrency(r.revenue) },
      { label: fvfLabel, display: ctx.formatCurrency(r.finalValueFee), kind: "deduction", hint: capNote },
    ];
    if (r.fixedFee > 0) {
      rows.push({
        label: `Per-order fee (${ctx.formatCurrency(perOrderFee)})`,
        display: ctx.formatCurrency(r.fixedFee),
        kind: "deduction",
      });
    }
    if (r.internationalFee > 0) {
      rows.push({
        label: `International fee (${ctx.formatPercent(fees.internationalPercent)})`,
        display: ctx.formatCurrency(r.internationalFee),
        kind: "deduction",
      });
    }
    if (r.regulatoryFee > 0) {
      rows.push({
        label: `Regulatory operating fee (${ctx.formatPercent(fees.regulatoryPercent ?? 0)})`,
        display: ctx.formatCurrency(r.regulatoryFee),
        kind: "deduction",
      });
    }
    if (r.adFee > 0) {
      rows.push({
        label: `Promoted listings ad fee (${ctx.formatPercent(Number(values.adPercent) || 0)})`,
        display: ctx.formatCurrency(r.adFee),
        kind: "deduction",
      });
    }
    if (r.taxOnFee > 0) {
      rows.push({
        label: `${fees.taxLabel ?? "VAT"} on fees (${ctx.formatPercent(fees.taxOnFeePercent ?? 0)})`,
        display: ctx.formatCurrency(r.taxOnFee),
        kind: "deduction",
      });
    }
    rows.push({ label: "Total fees", display: ctx.formatCurrency(r.totalFees), kind: "deduction" });
    rows.push({ label: "You receive", display: ctx.formatCurrency(r.payout), kind: "net" });
    if (hasCost) {
      rows.push({ label: "Profit after item cost", display: ctx.formatCurrency(r.profit), kind: "net" });
    }

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `eBay takes ${ctx.formatPercent(r.effectiveRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows,
    };
  },

  howItWorks:
    "eBay's main charge is the final value fee (FVF), which is a percentage of the total amount of the sale — the item price plus any shipping and handling you charge (and, in the US, any sales tax collected) — plus a small fixed per-order fee. In most US categories the FVF is 13.6% of the sale up to $7,500, then just 2.35% on the portion above $7,500, plus a per-order fee of $0.30 for orders of $10 or less or $0.40 for orders over $10.\n\nThat tiered structure is the part most sellers get wrong on high-value items. On a $10,000 sale the fee isn't 13.6% of the whole amount — it's 13.6% of the first $7,500 ($1,020) plus 2.35% of the remaining $2,500 ($58.75), so $1,078.75 plus the $0.40 per-order fee. The breakpoint and rates vary by country and category: Australia is 13.4% up to A$4,000 then 2.4% (capped at A$440 per item), and categories like Books (15.3% in the US) or Guitars (6.7%) have their own rates. Pick your category above and the calculator uses the right numbers.\n\nThere are two common extras. If the buyer is registered in another country, eBay adds an international fee (1.65% of the sale in the US). And the seller type matters: in the UK, private sellers pay no selling fees at all since October 2024 — the buyer pays a separate Buyer Protection fee — while UK business sellers still pay a category FVF plus a 0.35% regulatory operating fee and 20% VAT on those fees. Add your item cost to see your real profit after everything.",

  seoContent: `Our eBay fee calculator is a free, instant tool that shows exactly what eBay deducts from a sale and how much money actually reaches your payout. eBay's pricing looks simple — "a percentage plus a small fixed fee" — but the real cost depends on your category, the sale value, where the buyer is registered, and whether you sell as a private or a business seller. Getting any of these wrong can turn a profitable listing into a loss, especially on high-value items. This calculator applies eBay's current, country-specific rates so you can price correctly and know your payout before you list.

## How eBay's final value fee works.
The final value fee (FVF) is eBay's commission for selling your item, and it's charged on the total amount of the sale: the item price, plus any shipping and handling you charge the buyer, plus (in the US) sales tax collected. In most US categories the FVF is 13.6%. On a straightforward $100 sale with no separate shipping, that's $13.60, and with the $0.40 per-order fee you pay $14.00 in total and keep $86.00. The fee always applies to shipping too, so charging high shipping doesn't dodge the commission — a $90 item with $10 shipping is taxed on the full $100.

## The fixed per-order fee.
On top of the percentage, eBay charges one fixed fee per order. In the US, UK, Australia and Canada this is $0.30 for orders totalling $10 or less and $0.40 for orders over $10 (£0.30/£0.40 in the UK, in the local currency elsewhere). It's charged once per order, not per item, and it's why the effective fee rate on very small sales is higher than the headline percentage. A couple of flat-rate categories — like US sneakers priced $150 and over, which are a flat 8% — waive the per-order fee entirely.

## High-value items and the tiered rate.
This is the detail that trips up sellers of expensive goods. eBay does not charge the full percentage on the entire sale price of a high-value item. Instead it uses a tier: the headline rate applies up to a breakpoint, and a much lower rate applies to the portion above it. In most US categories the breakpoint is $7,500, above which the rate drops to 2.35%. So a $10,000 camera isn't 13.6% of $10,000 ($1,360) — it's 13.6% of the first $7,500 ($1,020) plus 2.35% of the last $2,500 ($58.75), totalling $1,078.75. That tiering meaningfully lowers the effective rate on big-ticket items, and the calculator handles it automatically. Australia uses an A$4,000 breakpoint and a 2.4% upper rate, with an overall cap of A$440 per item; some categories (jewelry, handbags) have their own breakpoints.

## Category rates differ.
"Most categories" is the default, but several categories have their own FVF. In the US, Books, DVDs, Music and Movies are 15.3%; Coins & Paper Money and Trading Cards are 13.25%; Guitars & Basses are just 6.7%; Jewelry & Watches are 15% up to $5,000 then 9%; Women's Handbags are 15% up to $2,000 then 9%; and NFTs are a flat 5%. Choosing the right category in the calculator is important because the difference between 6.7% and 15.3% is large on the same sale.

## The international fee.
When the buyer's registered address is outside your country, eBay adds an international fee calculated as a percentage of the total sale. In the US and Canada this is 1.65%; in Australia it's 3% (GST included). It's charged whether or not the item physically ships abroad — what matters is where the buyer's account is registered. Toggle "International buyer" above to include it. Note that using eBay International Shipping can waive this fee in some programs.

## Private vs business sellers — and the UK change.
This is the biggest recent change and the most common source of wrong numbers. Since October 2024, UK private (casual, non-business) sellers pay no eBay selling fees at all on domestic sales — instead the buyer pays a separate Buyer Protection fee that's added to the listed price. Germany made a similar change for private sellers in 2023. UK business sellers, however, still pay the full final value fee, plus a 0.35% regulatory operating fee, plus 20% VAT on top of all eBay's fees (which VAT-registered businesses can reclaim). The calculator models this correctly: select "Private seller" in a market like the UK and you'll see £0 in selling fees, with a note that the buyer covers the Buyer Protection fee. In the US, Australia and Canada there is no private-seller fee exemption — everyone pays the FVF.

## Promoted Listings and other costs.
If you advertise with Promoted Listings, eBay charges an ad fee as a percentage of the sale (you set the rate, commonly 2–12%) only when the promoted listing leads to the sale. Enter your ad rate in the optional field to include it. Store subscriptions (which lower the FVF for high-volume sellers) and optional listing upgrades aren't modelled here — this calculator reflects the standard, no-store rates, which apply to the majority of sellers.

## Accuracy and what this calculator covers.
Every rate here comes from eBay's official fee pages for each country and was verified on 2026-06-11, cross-checked against eBay's own published worked example (13.6% of a $210.50 payment plus the $0.40 per-order fee equals $29.03). We deliberately ship only the countries whose current rate cards we could verify with confidence — the United States, United Kingdom, Australia and Canada. Other markets (including Germany, which overhauled its category rates mid-2026) are excluded rather than risk a guessed number. Always confirm the final figure in your eBay Seller Hub before pricing, but for fast, reliable estimates of what you'll actually keep, this calculator gives you the real cost of selling on eBay.`,

  rateCards: {
    heading: "eBay fees by country",
    intro:
      "eBay's standard (no-store) final value fee for most categories, the per-order fee, and the extras that apply, for the countries this calculator covers. Private-seller and VAT notes are shown where they apply.",
    cards: ebayRateCards([...COUNTRIES]),
  },

  workedExample: {
    scenario:
      "You sell a $100 item in the US (most categories, business seller) with no separate shipping, to a US buyer.",
    steps: [
      { label: "Item price", value: "$100.00" },
      { label: "Final value fee (13.6%)", value: "$13.60" },
      { label: "Per-order fee", value: "$0.40" },
      { label: "Total eBay fees", value: "$14.00" },
    ],
    result: "You receive $86.00",
  },

  faqs: [
    {
      q: "How much does eBay take from a sale?",
      a: "In most US categories eBay charges a final value fee of 13.6% of the total sale (item + shipping + tax) plus a per-order fee of $0.30 (orders $10 or less) or $0.40 (over $10). So on a $100 sale eBay takes $14.00 and you keep $86.00. Rates differ by category and country, and an extra 1.65% international fee applies to buyers registered outside the US.",
    },
    {
      q: "What percentage does eBay take?",
      a: "For most categories the headline final value fee is 13.6% in the US and Canada, 13.4% in Australia, and 10.9% for UK business sellers (most categories) — plus a fixed per-order fee. Some categories are much lower (US guitars are 6.7%, UK tech/cameras 6.9% banded) or higher (US books are 15.3%, UK jewellery 14.9% banded). High-value sales pay a reduced rate on the portion above a breakpoint (2.35% above $7,500 in most US categories).",
    },
    {
      q: "What are eBay fees on $100?",
      a: "On a $100 US sale in most categories (business seller, domestic buyer): the final value fee is $13.60 (13.6%) plus a $0.40 per-order fee, for $14.00 total — you keep $86.00. If the buyer is international, add 1.65% ($1.65), so total fees are $15.65 and you keep $84.35. Use the calculator above for other amounts, categories and countries.",
    },
    {
      q: "Do private sellers pay eBay fees?",
      a: "It depends on the country. In the UK, private (non-business) sellers have paid no eBay selling fees on domestic sales since October 2024 — instead the buyer pays a separate Buyer Protection fee added to the listed price. Germany made a similar change in 2023. But in the US, Australia and Canada there is no private-seller exemption: every seller pays the final value fee. Select your seller type above to see the right result.",
    },
    {
      q: "How does eBay's fee work on high-value items?",
      a: "eBay uses a tiered rate. In most US categories you pay 13.6% on the sale up to $7,500, then only 2.35% on the portion above $7,500. So a $10,000 item isn't 13.6% of $10,000 — it's 13.6% of $7,500 ($1,020) plus 2.35% of $2,500 ($58.75), totalling $1,078.75 plus the $0.40 per-order fee. Australia uses an A$4,000 breakpoint and caps the fee at A$440 per item. The calculator applies the right tier automatically.",
    },
    {
      q: "What is eBay's international fee?",
      a: "When the buyer's registered address is outside your country, eBay adds an international fee on the total sale: 1.65% in the US and Canada, and 3% (GST included) in Australia. It applies based on where the buyer's account is registered, not where the item ships. Toggle 'International buyer' above to include it. Some eBay International Shipping programs waive this fee.",
    },
    {
      q: "Do eBay fees apply to shipping?",
      a: "Yes. The final value fee is charged on the total amount the buyer pays, including the shipping and handling you charge. So a $90 item with $10 shipping is charged the FVF on the full $100. This is why building shipping into your item price rather than charging it separately makes no difference to your eBay fee.",
    },
    {
      q: "Does this include eBay Store and Promoted Listings fees?",
      a: "The calculator uses the standard no-store rates that apply to most sellers, and includes an optional Promoted Listings ad-rate field (an ad fee charged as a % of the sale only when a promoted listing drives the sale). It does not model eBay Store subscription discounts, which lower the FVF for high-volume sellers, or optional listing upgrades. Check your eBay Seller Hub for the exact figure if you have a Store plan.",
    },
  ],

  related: [
    "etsy-fee-calculator",
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "reverb-fee-calculator",
  ],

  sources: [
    {
      label: "eBay — Selling fees (US)",
      url: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
    },
    {
      label: "eBay — International fees for global sellers",
      url: "https://www.ebay.com/help/selling/fees-credits-invoices/international-fees-ebay-global-sellers?id=5224",
    },
    {
      label: "eBay UK — Fees for business sellers",
      url: "https://www.ebay.co.uk/help/selling/fees-credits-invoices/fees-business-sellers-activated-managed-payments?id=4809",
    },
    {
      label: "eBay UK — Buyer Protection fee (private-seller change)",
      url: "https://www.ebay.co.uk/help/buying/paying-items/buyer-protection-fee?id=5594",
    },
    {
      label: "eBay Australia — Selling fees",
      url: "https://www.ebay.com.au/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers-without-ebay-store?id=4822",
    },
    {
      label: "eBay Canada — Selling fees",
      url: "https://www.ebay.ca/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers?id=4822",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-11",
};
