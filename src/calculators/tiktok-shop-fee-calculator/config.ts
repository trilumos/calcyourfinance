import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { tiktokShopFees } from "../../config/fees";
import { tiktokShopRateCards } from "../../lib/rateCards";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const COUNTRIES = ["US", "GB"] as const;

export const tiktokShopFeeCalculator: CalculatorConfig = {
  slug: "tiktok-shop-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "tiktokshop",
  title: "TikTok Shop Fee Calculator",
  metaDescription:
    "Free TikTok Shop fee calculator. See exactly what TikTok Shop's referral fee takes from a sale — US (6% standard, 3% new-seller promo) and UK (9%) — your net payout and profit. Updated June 2026.",
  h1: "TikTok Shop Fee Calculator",
  intro:
    "Calculate TikTok Shop's referral fee on a sale and see your exact payout. Enter your order amount and shipping, pick your country, and the calculator shows the commission deduction and what you keep. US sellers: switch on the new-seller promo rate to see your first-30-days saving.",

  keywords: {
    primary: "tiktok shop fee calculator",
    secondary: [
      "tiktok shop fees calculator",
      "tiktok shop seller fees",
      "tiktok shop commission",
      "tiktok shop referral fee",
      "tiktok shop selling fees",
      "tiktok shop fee calculator uk",
      "tiktok shop fees on $100",
      "tiktok shop payout calculator",
      "tiktok shop profit calculator",
    ],
    longTail: [
      "how much does tiktok shop take",
      "what percentage does tiktok shop take",
      "tiktok shop commission 2026",
      "tiktok shop referral fee percentage",
      "tiktok shop new seller promo rate",
      "tiktok shop fees uk 2026",
      "tiktok shop 6 percent fee",
      "tiktok shop 9 percent fee uk",
      "how to calculate tiktok shop fees",
      "tiktok shop seller fee percentage",
      "tiktok shop fees explained",
      "tiktok shop take rate",
      "does tiktok shop charge payment processing fee",
      "tiktok shop fee jewelry category",
      "tiktok shop seller profit after fees",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: [...COUNTRIES], default: "US" },

  inputs: [
    {
      id: "orderAmount",
      label: "Order amount (item price)",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price the buyer pays for the item. TikTok Shop's referral fee applies to the order total.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer",
      type: "currency",
      default: 0,
      min: 0,
      help: "Any shipping you charge the buyer. TikTok Shop's referral fee applies to shipping too.",
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      default: "standard",
      options: [
        { value: "standard", label: "Most categories (standard rate)" },
        { value: "reduced", label: "Precious jewelry / pre-owned (reduced rate — US only)" },
      ],
      help: "US only: precious jewelry and pre-owned items have a 5% rate instead of 6%. UK: all categories use the 9% flat rate.",
    },
    {
      id: "newSellerPromo",
      label: "New seller promotional rate (US only — first 30 days)",
      type: "toggle",
      default: false,
      help: "US new sellers pay 3% for the first 30 days after their first sale (requires at least 1 sale within 60 days of onboarding). Toggle on to see your promo-period payout.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What the item cost you — enter this to see your profit after TikTok Shop's fee.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const fees = tiktokShopFees[ctx.country] ?? tiktokShopFees.US!;
    const orderAmount = Number(values.orderAmount) || 0;
    const shipping = Number(values.shipping) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const hasCost = itemCost > 0;

    // Determine the effective referral fee rate:
    // 1. US new-seller promo overrides everything if active.
    // 2. Reduced category rate (US-only precious jewelry / pre-owned) applies next.
    // 3. Standard rate is the fallback.
    const isPromo = ctx.country === "US" && Boolean(values.newSellerPromo) && fees.promoPercent != null;
    const isReduced = ctx.country === "US"
      && String(values.category) === "reduced"
      && fees.reducedPercent != null;

    let referralPercent: number;
    let rateLabel: string;
    if (isPromo) {
      referralPercent = fees.promoPercent!;
      rateLabel = `New-seller promo rate (${ctx.formatPercent(referralPercent)} — first ${fees.promoDays} days)`;
    } else if (isReduced) {
      referralPercent = fees.reducedPercent!;
      rateLabel = `Referral fee — precious jewelry / pre-owned (${ctx.formatPercent(referralPercent)})`;
    } else {
      referralPercent = fees.referralPercent;
      rateLabel = `Referral fee (${ctx.formatPercent(referralPercent)})`;
    }

    const r = computeMarketplaceFee({
      itemPrice: orderAmount,
      shipping,
      itemCost,
      feeOnShipping: true,
      sellingPercent: referralPercent,
    });

    // Sub-line on the headline: note VAT-inclusive for UK
    const vatNote = ctx.country === "GB" ? " (VAT-inclusive)" : "";
    const promoNote = isPromo
      ? ` · Promo rate active: ${ctx.formatPercent(fees.promoPercent!)} for first ${fees.promoDays} days`
      : "";

    const rows: CalcResult["rows"] = [
      { label: "Order total (item + shipping)", display: ctx.formatCurrency(r.revenue) },
      { label: rateLabel, display: ctx.formatCurrency(r.sellingFee), kind: "deduction" },
      { label: "You receive", display: ctx.formatCurrency(r.payout), kind: "net" },
    ];

    if (hasCost) {
      rows.push({
        label: "Profit after item cost",
        display: ctx.formatCurrency(r.profit),
        kind: "net",
      });
    }

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `TikTok Shop takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale${vatNote}${promoNote}`,
      },
      rows,
    };
  },

  howItWorks:
    "TikTok Shop charges sellers a single fee per completed order called a referral fee (equivalent to a commission or selling fee on other platforms). In the United States, the standard referral fee is 6% of the order total — the item price plus any shipping you charge the buyer — effective April 1, 2024, when it moved up from the early-access promotional rate of around 2%. A reduced 5% rate applies to specific subcategories: precious jewelry (Diamond, Gold, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald) and pre-owned items (resale bags, collectible trading cards, watches, footwear, refurbished phones and electronics, fashion accessories and clothing, and similar). This reduction took effect on October 31, 2024.\n\nFor new US sellers, TikTok Shop offers a promotional referral fee of 3% for the first 30 days after their first sale. To qualify, you need to make at least one sale within 60 days of setting up your shop. After the 30-day window closes, the standard 6% (or reduced 5% for eligible categories) applies. There is no separate payment-processing fee charged to sellers — the referral fee is all-inclusive.\n\nIn the United Kingdom, the standard commission rate is 9%, and it is VAT-inclusive, meaning the VAT element is already baked into the 9% rather than being a surcharge on top. The UK rate has been at 9% since approximately September 2024, after rising from the platform's early introductory rates. Like the US, there is no additional per-order payment-processing fee for UK sellers.\n\nTo calculate your payout: multiply your order total (item + shipping) by the applicable fee percentage. Subtract that from your revenue. Add your item cost to see profit. The calculator does this automatically for both markets and shows the effective take rate.",

  seoContent: `Our TikTok Shop fee calculator is a free, instant tool that shows exactly what TikTok Shop deducts from a sale and how much money you actually keep. TikTok Shop is one of the fastest-growing social commerce platforms in the world, and while its fee structure is simpler than many older marketplaces, the rate has changed significantly since launch — and the difference between the US standard rate, the new-seller promotional rate, and the UK rate is large enough to meaningfully affect your pricing strategy. This calculator applies the correct verified rates so you know your real payout before you list.

## How TikTok Shop's referral fee works.

TikTok Shop charges sellers one fee per completed order: a referral fee. Unlike platforms such as Reverb or Depop (in the UK), there is no separate payment-processing fee sitting on top. The referral fee is TikTok Shop's all-in commission, calculated as a percentage of the total order amount — your item price plus any shipping you charge the buyer. In the United States, the standard referral fee is 6%. So on a $100 item with no shipping, TikTok Shop takes $6.00 and you keep $94.00. On a $100 item with $10 shipping, the order total is $110 and TikTok Shop takes $6.60, leaving you $103.40.

## The US rate history: from 2% to 6%.

TikTok Shop launched in the US with heavily discounted promotional rates (around 2%) to attract sellers during the platform's early-access period. These rates were explicitly temporary. On April 1, 2024, TikTok Shop raised the standard US referral fee to 6% across most categories. This was a significant change — it tripled the commission rate for many sellers who had built their pricing around the 2% early-access period. If you're still finding older calculators or blog posts quoting 2%, those numbers are out of date. The current standard rate is 6%.

## The new-seller promotional rate (US): 3% for the first 30 days.

For brand-new US sellers, TikTok Shop still offers a promotional rate as an onboarding incentive: 3% for the first 30 days after your first sale. To qualify, you need to complete at least one sale within 60 days of setting up your shop. Once that 30-day window closes, the standard 6% rate applies. On a $100 order this means your fee during the promo period is $3.00 instead of $6.00 — a saving of $3.00 per $100 order. Toggle "New seller promotional rate" in the calculator above to compare your promo-period payout against the standard rate and see exactly how much the promo window saves you.

## Reduced rates for precious jewelry and pre-owned items (US).

Effective October 31, 2024, TikTok Shop lowered the referral fee from 6% to 5% for two specific category groups in the US. The first is precious jewelry: specifically Diamond, Gold, Jade, Platinum/Carat Gold, and Ruby/Sapphire/Emerald subcategories. The second is pre-owned items: Bags, Collectible Trading Cards, Luggage & Travel, Watches, Footwear, Refurbished Phones & Electronics, Fashion Accessories, Menswear, Womenswear, Collectible Coins & Paper Money, Collectible Figures, and Collectible Comic Books. If you sell in one of these categories, switch to "Precious jewelry / pre-owned" in the category selector above to get the right 5% figure. All other categories — beauty, home, electronics, fashion, food, sports and the vast majority of the TikTok Shop catalogue — use the standard 6% rate.

## TikTok Shop UK fees: 9% commission.

TikTok Shop in the United Kingdom uses a different fee structure from the US. The standard commission rate for UK sellers is 9%, and it is VAT-inclusive — meaning the VAT element is already embedded in the 9% rather than being added on top as a surcharge. At 9%, the UK rate is noticeably higher than the US standard 6%, which matters for cross-market sellers comparing their payout across the two markets. On a £100 order, TikTok Shop takes £9.00 and you keep £91.00. There is no separate payment-processing fee for UK sellers. The calculator defaults to USD / US rates; switch the country selector to United Kingdom to work in GBP and apply the 9% rate.

## Is there a payment-processing fee on TikTok Shop?

This is a common question, especially from sellers coming from platforms like Reverb (which charges a separate 3.19% processing fee), Depop (3.3% + $0.45), or StockX (3% processing on top of the transaction fee). TikTok Shop does not charge sellers a separate payment-processing fee per order. The referral fee — 6% in the US, 9% in the UK — is the complete seller-side deduction. TikTok Shop handles card processing internally and absorbs that cost within its commission structure. What you see in this calculator is your complete payout.

There is a small withdrawal fee when you transfer your balance out of TikTok Shop: $0.05 per bank transfer for US sellers (minimum $2 payout threshold), and a 0.9% fee for PayPal withdrawals. These are cash-out fees on the transfer of your existing balance — they are not per-order selling fees — and are not modelled in this calculator.

## TikTok Shop fees vs. other marketplaces.

For context: TikTok Shop US at 6% is lower than Poshmark (20%), Etsy (combined ~9–11%), Mercari (10%), Vinted buyer fee (5% + fixed), or eBay (13.6% for most categories). It is comparable to or slightly above Depop in the US (0% selling fee, but 3.3% + $0.45 processing). StockX takes 9–12% total (transaction + processing). For US sellers used to older platforms, TikTok Shop's 6% all-in rate is genuinely competitive. The UK's 9% is higher than TikTok Shop US but similar to eBay UK's most-category business FVF (10.9%) and lower than Poshmark's 20%.

## Tips for pricing on TikTok Shop.

Work backwards from your target payout to set your listing price. For the standard US 6% rate: divide your target payout by 0.94. If you want to keep $47 on a sale, you need to list at $47 ÷ 0.94 = $50. For the UK 9% rate: divide by 0.91. For the new-seller US promo at 3%: divide by 0.97. Use the calculator above to test different price points quickly. Remember that TikTok Shop's "platform discount" — prices you discount through seller vouchers or platform promotions — reduces the referral fee base, which can be a useful lever for flash sales: you pay fees on the discounted price, not the original listing price.

## Accuracy and what this calculator covers.

Every rate in this calculator is sourced from TikTok Shop's official seller university and commission policy pages and was verified on 2026-06-12. We cover the United States and United Kingdom — the two markets where TikTok Shop's current fee structure is publicly documented without requiring a registered seller account to access. Southeast Asian markets (Indonesia, Malaysia, Thailand, Vietnam, Singapore, Philippines) and EU markets launched more recently with promotional zero-to-low rates that are still in transition as of mid-2026, so we have not included them rather than risk shipping an unverified number. Always confirm the current rate in your TikTok Shop Seller Center before making pricing decisions.`,

  rateCards: {
    heading: "TikTok Shop fees by market",
    intro:
      "TikTok Shop's referral fee (all-in seller commission) for each market this calculator covers. No separate payment-processing fee is charged to sellers.",
    cards: tiktokShopRateCards([...COUNTRIES]),
  },

  workedExample: {
    scenario:
      "You sell a $100 item on TikTok Shop US (standard category) with no separate shipping charge.",
    steps: [
      { label: "Order total", value: "$100.00" },
      { label: "Referral fee (6%)", value: "$6.00" },
    ],
    result: "You receive $94.00",
  },

  faqs: [
    {
      q: "What percentage does TikTok Shop take?",
      a: "In the US, TikTok Shop takes 6% of the order total (item + shipping) as a referral fee for most categories, effective April 1, 2024. Precious jewelry and pre-owned subcategories pay a reduced 5% (effective October 31, 2024). New sellers pay 3% for their first 30 days. In the UK, the commission is 9% (VAT-inclusive). There is no separate payment-processing fee on top of these rates.",
    },
    {
      q: "What is TikTok Shop's new seller promotional rate?",
      a: "US new sellers pay a 3% referral fee for the first 30 days after their first sale, down from the standard 6%. To qualify, you must complete at least one sale within 60 days of setting up your shop. After the 30-day promotional window closes, the standard 6% rate applies. On a $100 order this saves you $3.00 in fees compared to the standard rate.",
    },
    {
      q: "Does TikTok Shop charge a payment-processing fee?",
      a: "No. TikTok Shop does not charge sellers a separate payment-processing fee per order. The referral fee — 6% in the US, 9% in the UK — is the complete seller-side deduction per sale. TikTok handles card processing internally within that commission. There is a small cash-out fee when you transfer your balance ($0.05 per US bank transfer; 0.9% for PayPal withdrawals), but that is not a per-order selling fee.",
    },
    {
      q: "How much does TikTok Shop take on a $100 sale?",
      a: "On a standard US $100 sale: $6.00 in referral fees, leaving you $94.00. During the new-seller promo period: $3.00, leaving $97.00. For precious jewelry or pre-owned: $5.00, leaving $95.00. In the UK on a £100 sale: £9.00, leaving £91.00. Enter your own numbers in the calculator above for different amounts.",
    },
    {
      q: "Do TikTok Shop fees apply to shipping?",
      a: "Yes. TikTok Shop's referral fee is calculated on the total order amount, which includes any shipping charge you pass to the buyer. A $90 item with $10 shipping is treated as a $100 order for fee purposes: the 6% fee is $6.00 on the combined total, not $5.40 on the item alone. This mirrors how eBay and Mercari handle their seller fees.",
    },
    {
      q: "What is TikTok Shop's referral fee for jewelry?",
      a: "In the US, precious jewelry subcategories (Diamond, Gold, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald) pay a reduced 5% referral fee instead of the standard 6%, effective October 31, 2024. Pre-owned items in eligible subcategories also pay 5%. In the UK, all categories — including jewelry — pay the flat 9% commission with no category-specific reduced rates published.",
    },
    {
      q: "How do TikTok Shop fees compare to other marketplaces?",
      a: "TikTok Shop US at 6% is substantially lower than Poshmark (20%), Mercari (10%), Etsy (roughly 9–11% combined), and eBay (13.6% most categories). It is comparable to Depop US (0% selling fee but 3.3% + $0.45 processing = ~3.75% effective on a $100 order). TikTok Shop UK at 9% is lower than Poshmark's 20% and Mercari's 10%, and roughly comparable to eBay UK's most-category FVF for business sellers (10.9%).",
    },
  ],

  related: [
    "etsy-fee-calculator",
    "ebay-fee-calculator",
    "poshmark-fee-calculator",
    "mercari-fee-calculator",
    "depop-fee-calculator",
  ],

  sources: [
    {
      label: "TikTok Shop — Referral Fee Updates (US, 2024)",
      url: "https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018",
    },
    {
      label: "TikTok Shop — Referral Fees by Category (US)",
      url: "https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682",
    },
    {
      label: "TikTok Shop — Commission Rate Policy (UK)",
      url: "https://seller-uk.tiktok.com/university/essay?knowledge_id=3337893683398432",
    },
  ],

  feesVerifiedOn: "2026-06-12",
  lastUpdated: "2026-06-12",
};
