import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { whatnotFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const COUNTRIES = ["US", "GB", "CA", "AU"] as const;

export const whatnotFeeCalculator: CalculatorConfig = {
  slug: "whatnot-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "whatnot",
  title: "Whatnot Fee Calculator",
  metaDescription:
    "Free Whatnot fee calculator. See exactly what Whatnot takes — 8% commission on item price plus payment processing — and calculate your real payout and profit on every sale. US, UK, Canada, Australia.",
  h1: "Whatnot Fee Calculator",
  intro:
    "Calculate Whatnot's seller fees on any sale and see your exact payout. Enter your item price and optional shipping to break down the 8% commission and payment processing fee — then add your item cost to see real profit. Supports US, UK, Canada, and Australia.",

  keywords: {
    primary: "whatnot fee calculator",
    secondary: [
      "whatnot fees calculator",
      "whatnot seller fees",
      "whatnot selling fees",
      "whatnot commission calculator",
      "whatnot payout calculator",
      "whatnot profit calculator",
      "calculate whatnot fees",
      "whatnot charges calculator",
    ],
    longTail: [
      "how much does whatnot take",
      "what percentage does whatnot take",
      "whatnot fees on $100",
      "whatnot seller fees explained",
      "whatnot commission percentage",
      "whatnot fee breakdown",
      "how to calculate whatnot fees",
      "whatnot payment processing fee",
      "whatnot take rate",
      "whatnot fees uk",
      "whatnot fees canada",
      "whatnot fees australia",
      "whatnot vs ebay fees",
      "whatnot vs mercari fees",
    ],
    competition: "E",
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
      help: "The price the buyer pays for the item. Whatnot's 8% commission applies to this amount only — not shipping.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer",
      type: "currency",
      default: 0,
      min: 0,
      help: "Shipping paid by the buyer. The commission does not apply to shipping, but the payment processing fee does.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you paid for the item — to calculate your profit after all fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const fees = whatnotFees[ctx.country] ?? whatnotFees.US!;
    const itemPrice = Number(values.itemPrice) || 0;
    const shipping = Number(values.shipping) || 0;
    const itemCost = Number(values.itemCost) || 0;

    // UK commission is VAT-exclusive: 6.67% + 20% VAT = 8.004% effective
    const effectiveCommission = fees.vatOnCommission
      ? fees.commissionPercent * (1 + (fees.vatPercent ?? 0) / 100)
      : fees.commissionPercent;

    const r = computeMarketplaceFee({
      itemPrice,
      shipping,
      itemCost,
      feeOnShipping: false, // commission on item price only; processing covers full order
      sellingPercent: effectiveCommission,
      processingPercent: fees.processingPercent,
      processingFixed: fees.processingFixed,
    });

    const hasCost = itemCost > 0;
    const commissionLabel = fees.vatOnCommission
      ? `Commission (${fees.commissionPercent}% + ${fees.vatPercent}% VAT)`
      : `Commission (${fees.commissionPercent}%)`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Whatnot takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows: [
        {
          label: `Item price`,
          display: ctx.formatCurrency(itemPrice),
        },
        ...(shipping > 0
          ? [{ label: "Shipping (buyer-paid)", display: ctx.formatCurrency(shipping) }]
          : []),
        {
          label: "Total revenue",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: commissionLabel,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction" as const,
          hint:
            fees.vatOnCommission
              ? `${fees.commissionPercent}% × ${ctx.formatCurrency(itemPrice)} item price + ${fees.vatPercent}% VAT`
              : `${fees.commissionPercent}% × ${ctx.formatCurrency(itemPrice)} item price`,
        },
        {
          label: `Processing fee (${fees.processingPercent}% + ${ctx.formatCurrency(fees.processingFixed)})`,
          display: ctx.formatCurrency(r.processingFee),
          kind: "deduction" as const,
          hint: `Applied to total order value (item + shipping)`,
        },
        {
          label: "Total fees",
          display: ctx.formatCurrency(r.totalFees),
          kind: "deduction" as const,
        },
        {
          label: "You receive",
          display: ctx.formatCurrency(r.payout),
          kind: "net" as const,
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
    "Whatnot charges sellers two separate fees on every completed sale. The first is a commission of 8% applied to the item's final sale price — not the shipping amount, not any taxes. This is Whatnot's platform take for running the live-auction marketplace and connecting you with buyers.\n\nThe second fee is a payment processing fee of 2.9% plus $0.30 per transaction. Unlike the commission, the processing fee is applied to the full order value the buyer pays, which includes the item price, any shipping, and applicable taxes. This distinction matters: if you sell a $100 item with $10 shipping, your commission is 8% of $100 = $8, but your processing fee is 2.9% of $110 + $0.30 = $3.49. Total fees are $11.49 and your payout is $98.51.\n\nIn the UK, the commission is structured as 6.67% plus 20% UK VAT — which works out to an effective rate of approximately 8% inclusive of VAT. The processing fee in the UK is 2.42% + £0.25. Canada and Australia use the same 8% + 2.9% + $0.30 structure as the US but in local currency.",

  seoContent: `Our Whatnot fee calculator is a free tool that shows exactly what Whatnot charges on every sale and what actually reaches your account. Whatnot is one of the fastest-growing live-stream shopping and auction marketplaces — popular for trading cards, sports memorabilia, collectibles, fashion, and electronics. While the fee model is straightforward, the fact that commission applies to the item price only while processing fees apply to the full order (including shipping) means the split is easy to miscalculate. This tool breaks both fees out clearly so you can price your lots correctly before you go live.

## How Whatnot's fee structure works.

Whatnot charges sellers two distinct fees per completed order. The first is a commission fee of 8% of the item's final sale price. This is Whatnot's marketplace take — it covers the platform's infrastructure, live-stream technology, buyer discovery, and seller tools. The commission is calculated on the item price only: shipping paid by the buyer and any applicable taxes are excluded. A $100 item always incurs an $8.00 commission regardless of what the buyer pays for shipping.

The second fee is a payment processing fee of 2.9% plus $0.30 per transaction. Unlike the commission, this fee is calculated on the total amount the buyer pays at checkout — which includes the item price, the shipping charge, and any taxes. On a $100 item with $10 shipping, the processing fee is 2.9% × $110 + $0.30 = $3.49. This mirrors how Stripe and other payment processors charge: the processor handles the buyer's card payment on the full checkout total.

## How the two fees combine.

Because the commission applies to the item price and the processing fee applies to the total order, the effective combined take rate depends on both the item price and the shipping amount. A seller charging $0 shipping faces a straightforward ~11.2% take rate on a $100 sale (8% commission + ~3.2% processing). A seller charging $20 shipping on a $100 item sees the commission stay at $8 (on the item) but the processing fee grow to account for the $120 checkout total — reducing payout slightly more than the no-shipping scenario. This calculator handles all combinations correctly: enter your item price and whatever shipping you charge, and it shows the precise fee breakdown.

## Whatnot fees in the United Kingdom.

In the UK and EU, Whatnot's commission is quoted as 6.67% + VAT. With UK VAT at 20%, that equates to an effective commission of 6.67% × 1.20 = approximately 8.004% — essentially the same net rate as in the US, just expressed differently for tax compliance. The payment processing fee in the UK is 2.42% + £0.25 per transaction, applied to the full order value. The calculator adjusts for UK sellers automatically when you select GB as your country.

## Whatnot fees in Canada and Australia.

Sellers in Canada and Australia are on the same standard fee structure as US sellers: an 8% commission on the item price and a 2.9% + $0.30 processing fee on the full order total. The fees are calculated in local currency (CAD and AUD respectively). Select your country using the selector above to see your local currency figures.

## Category-specific reduced rates and promotions.

While the standard rate is 8%, Whatnot runs several ongoing and promotional lower rates. Electronics currently carry a 5% commission rate (US only), and Coins & Money listings across all markets use a 4% commission. There is also a high-value order promotion: sellers in select categories (comics, trading card games, toys, hobbies, sports singles) pay 0% commission on the portion of any single order above $1,500 — they still pay 2.9% + $0.30 processing on the full amount. The Premier Shop program offers a 10% reduction in your commission rate (so 8% becomes 7.2%). These promotions and programs are not modelled individually in this calculator, which defaults to the standard 8% rate — the rate the vast majority of sellers pay on most categories. Check the Whatnot Help Center for the latest promotional rates and eligibility before pricing niche categories.

## From payout to profit.

Knowing your payout is useful, but knowing your profit is essential for anyone buying to resell. Enter your item cost — what you paid to acquire the item — in the optional field, and the calculator shows your gross profit after all Whatnot fees and your cost of goods. A trading card bought at $40 and sold live for $100 with $5 shipping yields: commission $8 (8% of $100), processing $3.35 (2.9% of $105 + $0.30), total fees $11.35, payout $93.65, profit $53.65. Knowing the split helps you decide how aggressively to start auctions.

## Accuracy and verification.

Every fee in this calculator is taken from Whatnot's official seller help pages and verified on 2026-06-12. The standard commission (8% on item price) and processing fee (2.9% + $0.30 on total order) reflect the published standard schedule for US, Canada, and Australia. The UK rate (6.67% + 20% VAT, 2.42% + £0.25 processing) reflects the published UK/EU schedule. Promotional category rates, high-value-order promotions, and Premier Shop discounts are not modelled. Always check the official source linked below for the most current rates before pricing decisions.`,

  workedExample: {
    scenario: "You sell a $100 item on Whatnot US with $10 shipping.",
    steps: [
      { label: "Item price", value: "$100.00" },
      { label: "Shipping charged to buyer", value: "$10.00" },
      { label: "Total revenue (item + shipping)", value: "$110.00" },
      { label: "Commission (8% × $100 item price only)", value: "$8.00" },
      { label: "Processing fee (2.9% × $110 + $0.30)", value: "$3.49" },
      { label: "Total fees", value: "$11.49" },
    ],
    result: "You receive $98.51",
  },

  faqs: [
    {
      q: "What percentage does Whatnot take?",
      a: "Whatnot charges an 8% commission on the item's final sale price (not including shipping or taxes), plus a 2.9% + $0.30 payment processing fee on the full order total (item + shipping). On a $100 sale with no shipping, total fees are approximately $11.20 — an effective take rate of 11.2%. With shipping added, the effective rate shifts slightly because the processing fee scales with the order total.",
    },
    {
      q: "Does Whatnot's commission apply to shipping?",
      a: "No. Whatnot's 8% commission applies to the item's final sale price only — shipping paid by the buyer is excluded from the commission calculation. However, the payment processing fee (2.9% + $0.30) does apply to the full order total, which includes shipping. So on a $100 item with $10 shipping: commission = 8% × $100 = $8.00, processing = 2.9% × $110 + $0.30 = $3.49, total fees = $11.49.",
    },
    {
      q: "What are Whatnot fees on a $100 sale?",
      a: "On a $100 item with no shipping (standard US rate): commission is $8.00 (8%) and payment processing is $3.20 (2.9% + $0.30), for total fees of $11.20. You keep $88.80. Use the calculator above to test any combination of item price and shipping.",
    },
    {
      q: "What is Whatnot's payment processing fee?",
      a: "The payment processing fee is 2.9% of the total order value (item price + shipping + taxes) plus $0.30 per transaction. This applies in the US, Canada, and Australia. In the UK and EU, the processing fee is 2.42% + £0.25 (or €0.25) per transaction. This fee is separate from the 8% commission and is charged on the buyer's full checkout total.",
    },
    {
      q: "Are Whatnot fees the same in the UK?",
      a: "Not quite. In the UK, the commission is 6.67% + 20% UK VAT — which equals an effective rate of approximately 8% inclusive of VAT, the same net impact as the US rate. The payment processing fee in the UK is 2.42% + £0.25, compared to 2.9% + $0.30 in the US. Select GB in the country selector above to see UK rates in pounds sterling.",
    },
    {
      q: "Does Whatnot have lower fees for certain categories?",
      a: "Yes. Electronics in the US carry a reduced 5% commission instead of the standard 8%. Coins & Money listings use a 4% commission in all markets. There is also a high-value order promotion: for select categories (trading cards, comics, toys, hobbies, sports singles), sellers pay 0% commission on the portion of any order above $1,500, though the 2.9% + $0.30 processing fee still applies to the full order. The Premier Shop program reduces your commission by 10% (e.g. 8% becomes 7.2%). These category-specific and promotional rates are not modelled in this calculator — it uses the standard 8% rate.",
    },
    {
      q: "How do I calculate my profit on Whatnot?",
      a: "Enter your item price, any shipping you charge, and your item cost in the calculator above. It automatically deducts the 8% commission (on item price) and 2.9% + $0.30 processing fee (on the full order), then subtracts your cost to show gross profit. For example: a collectible bought for $40 sold live for $100 with $5 shipping — commission $8, processing $3.35, payout $93.65, profit $53.65.",
    },
  ],

  related: [
    "ebay-fee-calculator",
    "mercari-fee-calculator",
    "poshmark-fee-calculator",
    "tiktok-shop-fee-calculator",
    "depop-fee-calculator",
  ],

  sources: [
    {
      label: "Whatnot — Seller Fees and Commissions Schedule",
      url: "https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule",
    },
    {
      label: "Whatnot — Reduced Commission on Electronics",
      url: "https://help.whatnot.com/hc/en-us/articles/25550923919757-Reduced-Commission-on-Electronics",
    },
    {
      label: "Whatnot — Reduced Commission on Coins & Money",
      url: "https://help.whatnot.com/hc/en-us/articles/14477076380941-Reduced-Commission-on-Coins-Money",
    },
    {
      label: "Whatnot — Reduced Commission on High-Value Orders",
      url: "https://help.whatnot.com/hc/en-us/articles/27912945518733-Reduced-Commission-on-High-Value-Orders-Promotion",
    },
  ],

  feesVerifiedOn: "2026-06-12",
  lastUpdated: "2026-06-12",
};
