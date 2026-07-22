import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { depopFeesUS, depopFeesGB, depopFeesAU, depopFeesROW } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

// Depop supports 4 fee regions via a simple region selector.
// "US", "GB" and "AU" have 0% seller fee; all other countries use ROW (10%).
const REGIONS = ["US", "GB", "AU", "ROW"] as const;
type DepopRegion = (typeof REGIONS)[number];

function getRegionFees(region: DepopRegion) {
  if (region === "US") return depopFeesUS;
  if (region === "GB") return depopFeesGB;
  if (region === "AU") return depopFeesAU;
  return depopFeesROW;
}

export const depopFeeCalculator: CalculatorConfig = {
  slug: "depop-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "depop",
  title: "Depop Fee Calculator",
  metaDescription:
    "Free Depop fee calculator for 2026. See exactly what Depop charges — US, UK and Australia sellers pay 0% selling fee (buyer pays the Depop Marketplace fee); other countries pay 10%. Enter your sale price to see your exact payout.",
  h1: "Depop Fee Calculator",
  intro:
    "Calculate your Depop payout and see exactly what fees apply. US and UK sellers pay no selling fee — Depop removed the 10% seller fee in 2024, and Australia followed on 22 July 2026. You still pay a small payment-processing fee; the buyer pays a separate Marketplace fee at checkout that does not reduce your payout. Sellers outside these markets still pay the 10% selling fee. Enter your sale price to see the breakdown.",

  keywords: {
    primary: "depop fee calculator",
    secondary: [
      "depop fees calculator",
      "depop seller fees",
      "depop selling fees",
      "depop fee calculator 2026",
      "depop payout calculator",
      "depop profit calculator",
      "calculate depop fees",
      "depop earnings calculator",
    ],
    longTail: [
      "how much does depop take",
      "depop fees on $50",
      "depop fee calculator uk",
      "does depop charge fees",
      "does depop still charge a 10% fee",
      "depop seller fee percentage",
      "depop marketplace fee",
      "depop buyer fee",
      "depop zero seller fee",
      "depop processing fee",
      "depop fee change 2024",
      "depop vs poshmark fees",
      "depop vs mercari fees",
    ],
    competition: "M",
    intent: "tool",
  },

  // No CountryCode-based country selector — Depop's three regions (US, GB, ROW)
  // don't map cleanly to the CountryCode list (ROW is a catch-all). We use a
  // custom select input below instead.

  inputs: [
    {
      id: "region",
      label: "Where are you selling?",
      type: "select",
      default: "US",
      options: [
        { value: "US", label: "United States" },
        { value: "GB", label: "United Kingdom" },
        { value: "AU", label: "Australia" },
        { value: "ROW", label: "Other country (Canada, EU…)" },
      ],
      help: "US, UK and Australia sellers pay 0% selling fee. All other countries pay a 10% selling fee.",
    },
    {
      id: "itemPrice",
      label: "Item listing price",
      type: "currency",
      default: 50,
      min: 0,
      help: "The price you set for your item on Depop. Buyer pays shipping separately.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "Shipping the buyer pays. For US/UK/AU sellers, payment-processing fee applies to shipping too. ROW sellers: Depop's 10% selling fee is on item price only.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you originally paid for the item — to calculate your profit after all fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const region = (values.region as DepopRegion) ?? "US";
    const fees = getRegionFees(region);
    const isZeroSellerFee = region === "US" || region === "GB" || region === "AU";

    // Currency symbol and amounts — for non-US/GB ROW we show USD as a proxy
    // (Depop ROW sellers use their own local currency; exact amounts vary).
    const itemPrice = Number(values.itemPrice) || 0;
    const shipping = Number(values.shipping) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const hasCost = itemCost > 0;

    // ROW: selling fee on item price only (not on buyer-paid shipping).
    // US/GB: no selling fee; processing applies to whole transaction.
    const r = computeMarketplaceFee({
      itemPrice,
      shipping,
      itemCost,
      feeOnShipping: !isZeroSellerFee ? false : true,
      sellingPercent: fees.sellingPercent,
      processingPercent: fees.processingPercent,
      processingFixed: fees.processingFixed,
    });

    // For US and UK: compute informational buyer Marketplace fee.
    // "Up to 5% + up to $1/£1" — we show the maximum for transparency.
    const buyerFee =
      isZeroSellerFee && itemPrice > 0 && fees.buyerMarketplacePercent != null
        ? Math.round(
            (itemPrice * (fees.buyerMarketplacePercent / 100) +
              (fees.buyerMarketplaceFixedMax ?? 0)) *
              100,
          ) / 100
        : 0;
    const buyerTotal = isZeroSellerFee && itemPrice > 0 ? Math.round((itemPrice + buyerFee) * 100) / 100 : 0;

    // Currency label for ROW (no ctx.country, just show "~" prefix in copy)
    const currencyLabel = region === "GB" ? "GBP" : "USD";
    const isGBP = region === "GB";

    const rows: CalcResult["rows"] = [
      {
        label: `Your listed price${shipping > 0 ? " + shipping" : ""}`,
        display: ctx.formatCurrency(r.revenue),
      },
    ];

    if (isZeroSellerFee) {
      // US / UK: 0% selling fee — show it explicitly so the user sees it
      rows.push({
        label: "Depop selling fee (0% — you keep your full listing price)",
        display: ctx.formatCurrency(0),
        kind: "muted",
        hint: `Depop removed the ${region === "GB" ? "10%" : "10%"} selling fee for ${region === "GB" ? "UK" : "US"} sellers in 2024.`,
      });
      rows.push({
        label: `Depop Payments processing fee (${fees.processingPercent}% + ${isGBP ? "£" : "$"}${fees.processingFixed})`,
        display: ctx.formatCurrency(r.processingFee),
        kind: "deduction",
      });
    } else {
      // ROW: 10% selling fee (no processing modelled — PayPal varies)
      rows.push({
        label: "Depop selling fee (10%)",
        display: ctx.formatCurrency(r.sellingFee),
        kind: "deduction",
      });
    }

    rows.push({
      label: "You receive",
      display: ctx.formatCurrency(r.payout),
      kind: "net",
    });

    if (hasCost) {
      rows.push({
        label: "Profit after item cost",
        display: ctx.formatCurrency(r.profit),
        kind: "net",
      });
    }

    // US / UK: informational buyer fee rows
    if (isZeroSellerFee && itemPrice > 0) {
      rows.push({
        label: `Buyer Marketplace fee (up to ${fees.buyerMarketplacePercent}% + ${isGBP ? "£" : "$"}${fees.buyerMarketplaceFixedMax} — paid by buyer, not you)`,
        display: ctx.formatCurrency(buyerFee),
        kind: "muted",
        hint: "Depop adds this fee to your listing price at checkout. It does not reduce your payout.",
      });
      rows.push({
        label: "Total the buyer pays (est. max)",
        display: ctx.formatCurrency(buyerTotal),
        kind: "muted",
      });
    }

    const regionLabel = region === "US" ? "US" : region === "GB" ? "UK" : "international";

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: isZeroSellerFee
          ? `Processing fee: ${ctx.formatCurrency(r.processingFee)} — you keep ${ctx.formatCurrency(r.payout)} of your ${ctx.formatCurrency(r.revenue)} listing price`
          : `Depop takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(itemPrice)} item price`,
      },
      rows,
    };
  },

  howItWorks:
    "Depop's fee structure changed significantly in 2024 and now differs by region.\n\nFor US sellers, Depop removed its 10% selling fee on July 15, 2024. US sellers no longer pay any selling commission. Instead, you pay only a Depop Payments processing fee of 3.3% + $0.45 on the total transaction (item price + any shipping). At the same time (July 18, 2024), Depop introduced a Buyer Marketplace fee — up to 5% of your item price plus up to $1 — which Depop adds to the buyer's checkout. This buyer fee does not come out of your payout; it is an extra charge the buyer pays.\n\nFor UK sellers, the same shift happened earlier: the 10% selling fee was removed for new listings from March 20, 2024. UK sellers pay a Depop Payments processing fee of 2.9% + £0.30 per transaction. A Buyer Marketplace fee of up to 5% + up to £1 was introduced for buyers from April 15, 2024 — again, this does not reduce what the seller receives.\n\nFor all other countries (Australia, Canada, Europe, and the rest of the world), the 10% selling fee still applies. It is charged on the item price (not on shipping when buyers pay it separately). Payment processing in these markets is handled via PayPal and varies by country; it is not modelled in this calculator. No buyer Marketplace fee is documented for non-US/UK markets.\n\nThe processing fee (US/UK) is deducted from your payout; the buyer Marketplace fee (US/UK) is informational and shown separately. Enter your item cost to see gross profit.",

  seoContent: `Our Depop fee calculator is a free tool that shows exactly what you keep from a sale on Depop in 2026. Depop's fee model changed in 2024 — and stale information is everywhere online. This calculator reflects the verified current structure and explains the buyer-versus-seller split honestly, so you can price your listings confidently.

## Does Depop still charge a 10% selling fee?

It depends on where you are. As of 2024, US and UK sellers no longer pay a selling fee. The 10% selling fee was removed for US sellers on July 15, 2024 and for UK sellers on March 20, 2024 (for new listings). If you are selling from the United States or United Kingdom, Depop takes nothing from your sale price as a commission. You pay only a small payment-processing fee, and the buyer pays a separate Marketplace fee at checkout that does not come out of your earnings.

For sellers outside the US and UK — including Australia, Canada, Europe, and all other countries — the 10% selling fee still applies. This is deducted from your item price when the sale completes.

## How the US fee model works (2024 onwards).

US sellers on Depop pay a payment-processing fee of 3.3% of the total transaction (item price + shipping) plus a fixed $0.45 per order. On a $50 item with no separate shipping, the fee is $2.10 and your payout is $47.90. On a $100 item, the fee is $3.75 and your payout is $96.25.

At the same time, Depop introduced a Buyer Marketplace fee. When your buyer checks out, Depop adds a fee of up to 5% of your item price plus up to $1. This fee is paid by the buyer and does not reduce what you receive. On a $50 item, the buyer might pay up to $3.50 extra ($2.50 + $1.00), for a total of up to $53.50 at checkout. Your $47.90 payout is unchanged regardless.

The calculator shows the buyer Marketplace fee as clearly labelled informational rows so you understand the full picture of what a buyer sees — but those rows do not affect your payout.

## How the UK fee model works (2024 onwards).

UK sellers pay a processing fee of 2.9% + £0.30 per transaction. On a £50 item, that is £1.75 and your payout is £48.25. On a £100 item, the processing fee is £3.20 and you receive £96.80.

Buyers in the UK face the same Marketplace fee structure as in the US: up to 5% of the item price plus up to £1. On a £50 item, the buyer could pay up to £3.50 extra. This is separate from your payout.

## Rest-of-world sellers: the 10% fee still applies.

If you are selling from Australia, Canada, Germany, France, or any country other than the US and UK, your fee model has not changed. Depop charges a 10% selling fee on the item price. Payment processing is handled through PayPal, and the exact rate depends on your country and account type (typically 2.6%–3.9% + a fixed fee for most markets).

On a $100 item, Depop takes $10 and you receive $90 before PayPal's processing fee. On a $50 item, Depop takes $5 and you receive $45. Use the calculator above and select "Other country" to see the 10% selling-fee breakdown. PayPal processing is shown as an additional note rather than a calculated amount, since it varies significantly by country.

## Depop fees on common sale prices.

### US seller (0% selling fee)

| Sale price | Processing fee (3.3% + $0.45) | You receive | Buyer pays (est. max) |
|-----------|-------------------------------|-------------|----------------------|
| $20       | $1.11                         | $18.89      | $22.00               |
| $50       | $2.10                         | $47.90      | $53.50               |
| $100      | $3.75                         | $96.25      | $106.00              |
| $200      | $7.05                         | $192.95     | $211.00              |

### UK seller (0% selling fee)

| Sale price | Processing fee (2.9% + £0.30) | You receive | Buyer pays (est. max) |
|-----------|-------------------------------|-------------|----------------------|
| £20       | £0.88                         | £19.12      | £22.00               |
| £50       | £1.75                         | £48.25      | £53.50               |
| £100      | £3.20                         | £96.80      | £106.00              |
| £200      | £6.10                         | £193.90     | £211.00              |

### International seller (10% selling fee)

| Sale price | Depop selling fee | You receive (before PayPal) |
|-----------|-------------------|-----------------------------|
| $20       | $2.00             | $18.00                      |
| $50       | $5.00             | $45.00                      |
| $100      | $10.00            | $90.00                      |
| $200      | $20.00            | $180.00                     |

## Why did Depop change its fees?

Depop framed the 2024 fee restructuring as a move to "empower sellers to list more, sell more, and earn more." By removing the selling fee, Depop made listing and selling lower-risk for sellers — you only incur the fixed processing cost when you make a sale. The buyer Marketplace fee was introduced to fund continued investment in buyer protection, customer support, and the platform itself. The net effect is that the cost of selling on Depop shifted from seller to buyer.

Depop is owned by Etsy, which made this shift around the same time it was growing Depop as a standalone Gen-Z-focused resale platform. The zero-seller-fee model mirrors what happened on eBay UK in October 2024, when private eBay UK sellers also moved to a 0% selling fee with buyers absorbing a Buyer Protection fee.

## What does the buyer pay on Depop?

In the US and UK, buyers pay a Depop Marketplace fee on top of the listed price. The fee is described as "up to 5% of the item price, plus a fixed amount of up to $1 (US) or £1 (UK), excluding taxes and postage." The word "up to" means the actual buyer fee may be slightly lower than the maximum, but the calculator shows the maximum for a conservative buyer-total estimate. This fee is not something the seller sets or controls — Depop adds it automatically at checkout.

## Pricing your Depop listings.

For US and UK sellers, the absence of a selling fee means your pricing math is simpler than on Poshmark (20% commission) or Mercari (10% commission). Your main cost is the processing fee, which runs roughly 3.3–4.5% depending on the transaction size (the $0.45 fixed component is a larger percentage on small sales). On a $20 item the effective processing rate is about 5.6%; on a $100 item it is 3.75%. Price higher-value items and the processing cost becomes a smaller proportion.

Enter your item cost in the optional field to see your gross profit. If you bought a jacket for $15 and sell it for $50, your payout (after the processing fee) is $47.90 and your profit is $32.90.

## Accuracy.

Every rate in this calculator is taken from Depop's official newsroom and help pages and verified on 2026-06-12. The 0% selling fee for US and UK sellers, the processing fee rates, and the Buyer Marketplace fee are the fees that apply to standard Depop transactions. Additional charges that this calculator does not model: Boosted Listing fees (8% US/AU, 12% UK — only charged when a boosted item sells within 28 days of boosting) and country-specific PayPal processing for ROW sellers. Check the sources below and your Depop account for the full picture.`,

  workedExample: {
    scenario: "You sell a $50 item on Depop as a US seller.",
    steps: [
      { label: "Your listing price", value: "$50.00" },
      { label: "Depop selling fee (0% — US sellers pay no selling fee)", value: "$0.00" },
      { label: "Depop Payments processing (3.3% + $0.45)", value: "$2.10" },
      { label: "You receive", value: "$47.90" },
      { label: "Buyer Marketplace fee (up to 5% + $1, paid by buyer)", value: "up to $3.50" },
      { label: "Total the buyer pays", value: "up to $53.50" },
    ],
    result: "You receive $47.90",
  },

  faqs: [
    {
      q: "Does Depop still charge a 10% selling fee?",
      a: "Not for US or UK sellers. Depop removed the 10% selling fee for US sellers on July 15, 2024 and for UK sellers on March 20, 2024. If you are in the US or UK, you pay 0% selling commission — only a payment-processing fee of 3.3% + $0.45 (US) or 2.9% + £0.30 (UK). Sellers outside the US and UK still pay the 10% selling fee.",
    },
    {
      q: "How much does Depop take from a sale in the US?",
      a: "For US sellers, Depop takes no selling commission. You pay only a Depop Payments processing fee of 3.3% + $0.45 on your total transaction. On a $50 sale with no separate shipping, you pay $2.10 and receive $47.90. On a $100 sale, you pay $3.75 and receive $96.25.",
    },
    {
      q: "What is the Depop Buyer Marketplace fee?",
      a: "In the US and UK, Depop adds a Buyer Marketplace fee to the buyer's checkout. It is up to 5% of your item price plus up to $1 (US) or £1 (UK). The buyer pays this — it does not come out of your payout. On a $50 listing, the buyer might pay up to $3.50 extra, bringing their total to up to $53.50. Your $47.90 payout is unchanged regardless of what the buyer pays.",
    },
    {
      q: "Do Depop sellers outside the US and UK still pay fees?",
      a: "Yes. Sellers in Australia, Canada, Europe, and all other countries outside the US and UK still pay the 10% selling fee on the item price. Payment processing is handled through PayPal and varies by country. The fee-removal change in 2024 applied only to US and UK markets.",
    },
    {
      q: "Does the Depop processing fee apply to shipping?",
      a: "For US and UK sellers, the Depop Payments processing fee (3.3% + $0.45 or 2.9% + £0.30) applies to the full transaction amount — item price plus any shipping the buyer pays. If you charge $10 shipping on a $100 item, the processing fee is on $110. For international (ROW) sellers, the 10% selling fee applies to the item price only, not to buyer-paid shipping.",
    },
    {
      q: "What are Depop fees in the UK?",
      a: "UK sellers pay a 0% selling fee (removed March 20, 2024) and a Depop Payments processing fee of 2.9% + £0.30 per transaction. On a £50 item, the processing fee is £1.75 and you receive £48.25. Buyers in the UK also pay a Marketplace fee of up to 5% + £1 at checkout — this does not reduce your payout.",
    },
    {
      q: "Is Depop owned by Etsy?",
      a: "Yes — Etsy acquired Depop in 2021. Despite the common ownership, the two platforms operate independently with different fee structures. Etsy charges sellers a 6.5% transaction fee plus a payment-processing fee plus a $0.20 listing fee; Depop charges US and UK sellers no selling fee at all (just a processing fee). Use the Etsy Fee Calculator and this Depop calculator side by side to compare where to list your items.",
    },
  ],

  related: [
    "poshmark-fee-calculator",
    "etsy-fee-calculator",
    "mercari-fee-calculator",
    "ebay-fee-calculator",
  ],

  sources: [
    {
      label:
        "Depop newsroom — Depop makes selling free in Australia (22 July 2026)",
      url: "https://news.depop.com/company-news/depop-makes-selling-free-in-australia-helping-people-earn-more-from-fashion-resale/",
    },
    {
      label:
        "Depop newsroom — Depop removes selling fees in the United States, evolves fee structure (July 2024)",
      url: "https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/",
    },
    {
      label:
        "Depop newsroom — Evolving our fee structure, with zero selling fees on Depop (UK, March 2024)",
      url: "https://news.depop.com/company-news/evolving-our-fee-structure-with-zero-selling-fees-on-depop/",
    },
    {
      label: "Depop Help Centre — Seller fees and charges",
      url: "https://depophelp.zendesk.com/hc/en-gb/articles/360001791127-Seller-fees-and-charges",
    },
  ],

  feesVerifiedOn: "2026-07-22",
  lastUpdated: "2026-06-12",
};
