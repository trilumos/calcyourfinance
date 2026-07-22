import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { facebookFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const facebookMarketplaceFeeCalculator: CalculatorConfig = {
  slug: "facebook-marketplace-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "facebook",
  title: "Facebook Marketplace Fee Calculator",
  metaDescription:
    "Free Facebook Marketplace fee calculator. Instantly see the 10% selling fee on shipped orders (minimum $0.80), confirm local pickup is free, and calculate your exact payout and profit. Covers Instagram Shop too.",
  h1: "Facebook Marketplace Fee Calculator",
  intro:
    "Calculate Facebook Marketplace's selling fee on any shipped order and see exactly what you keep. The 10% fee (minimum $0.80) applies to shipped items only — local pickup is always free. Enter your sale price and optional item cost to see your payout and profit instantly.",

  keywords: {
    primary: "facebook marketplace fee calculator",
    secondary: [
      "facebook marketplace fees calculator",
      "facebook marketplace selling fees",
      "facebook marketplace seller fees",
      "facebook marketplace fee 2026",
      "facebook marketplace payout calculator",
      "facebook marketplace profit calculator",
      "facebook shop fees",
      "instagram shop fees",
    ],
    longTail: [
      "how much does facebook marketplace charge",
      "does facebook marketplace charge fees",
      "facebook marketplace fees on $100",
      "facebook marketplace 10% fee",
      "facebook marketplace selling fee shipped",
      "facebook marketplace local pickup fee",
      "facebook marketplace fee percentage",
      "instagram shop selling fees",
      "facebook marketplace vs ebay fees",
      "facebook marketplace fee calculator shipped",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "saleType",
      label: "Sale type",
      type: "select",
      default: "shipped",
      options: [
        { value: "shipped", label: "Shipped (with Facebook checkout)" },
        { value: "local", label: "Local pickup (no fee)" },
      ],
      help: "Shipped orders use Facebook's checkout and incur the 10% selling fee. Local pickup is completely free.",
    },
    {
      id: "itemPrice",
      label: "Item price",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price the buyer pays for the item (before shipping).",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you paid for the item — to calculate your profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const saleType = String(values.saleType || "shipped");
    const itemPrice = Number(values.itemPrice) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const isLocal = saleType === "local";

    const r = isLocal
      ? computeMarketplaceFee({
          itemPrice,
          itemCost,
          feeOnShipping: false,
          sellingPercent: 0,
        })
      : computeMarketplaceFee({
          itemPrice,
          itemCost,
          feeOnShipping: false,
          sellingPercent: facebookFees.shippedPercent,
          flatUnderThreshold: {
            threshold: facebookFees.threshold,
            fee: facebookFees.shippedMinFee,
          },
        });

    const hasCost = itemCost > 0;
    const isMinimum =
      !isLocal && itemPrice > 0 && itemPrice < facebookFees.threshold;
    const feeLabel = isLocal
      ? "Selling fee (local pickup)"
      : isMinimum
        ? `Selling fee (flat minimum — item under ${ctx.formatCurrency(facebookFees.threshold)})`
        : `Selling fee (${facebookFees.shippedPercent}%)`;

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: isLocal
          ? `Local pickup — no Facebook selling fee`
          : `Facebook takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} sale`,
      },
      rows: [
        {
          label: "Item price",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: feeLabel,
          display: ctx.formatCurrency(r.sellingFee),
          kind: isLocal ? "muted" : "deduction",
          hint: isLocal
            ? "No fee applies to local pickup — you keep the full amount."
            : isMinimum
              ? `Minimum $${facebookFees.shippedMinFee.toFixed(2)} fee applies for items under ${ctx.formatCurrency(facebookFees.threshold)}`
              : `${facebookFees.shippedPercent}% of item price (all-inclusive — covers payment processing + buyer protection)`,
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
    "Facebook Marketplace charges a selling fee only on shipped orders that go through Facebook's checkout. The fee is 10% of the item price, with a minimum of $0.80 that applies when an item is priced below $8.00 (since 10% of $8 = $0.80, the minimum only kicks in for items under $8).\n\nThis 10% is all-inclusive — it covers Facebook's payment processing, customer support infrastructure, and Purchase Protection for the buyer. There is no separate card processing fee on top; 10% is the only deduction from your sale price.\n\nLocal pickup sales are completely free. If you and the buyer arrange to meet in person and no Facebook checkout is involved, Facebook charges you nothing. The full item price goes to you. This makes Facebook Marketplace one of the cheapest options for local resale — the fee only applies when you ship.\n\nThe fee applies to the item price only, not to shipping. Shipping on Facebook Marketplace is handled separately; buyers see shipping costs at checkout, but the 10% selling fee is calculated on the item price you listed.\n\nInstagram Shop and Facebook Shops using Meta's checkout system apply the same 10% fee structure. If you sell through an independent checkout (your own website linked through Meta), these fees do not apply.",

  seoContent: `Our Facebook Marketplace fee calculator is a free tool that shows exactly what Facebook charges when you sell with shipping on Marketplace, and confirms that local pickup is always free. Facebook Marketplace is one of the largest consumer resale platforms in the world, and while the fee model is simple, the April 2024 increase from 5% to 10% caught many sellers off guard. This calculator applies the current rate so you can see your payout before you list.

## How Facebook Marketplace's selling fee works.

Facebook Marketplace charges a 10% selling fee on shipped orders. This fee was introduced at 5% in 2020 and doubled to 10% on April 15, 2024. The fee applies to the item price the buyer pays through Facebook's checkout — shipping charges are handled separately and are not subject to the 10% commission.

The fee structure has one minimum: for items priced below $8.00, the fee is a flat $0.80 rather than the percentage. This is because 10% of $8.00 is exactly $0.80, so the minimum only applies for items under $8. An item priced at $8.00 exactly triggers the 10% rate (which equals the same $0.80), and any item above $8 pays 10% of whatever you listed it for. On a $100 item, the selling fee is $10.00 and you keep $90.00.

## What the 10% fee covers.

Unlike platforms that charge a marketplace commission plus a separate payment-processing fee (like Etsy, eBay, or Reverb), Facebook's 10% is fully all-inclusive. It covers payment processing (credit cards, debit cards, and PayPal), buyer Purchase Protection, and Facebook's customer support. There is no additional card-processing fee on top. Your payout is simply 90% of your sale price for any item at $8 or above.

## Local pickup is completely free.

If you sell locally on Facebook Marketplace and arrange for the buyer to pick up the item in person — without using Facebook's checkout — there is no selling fee of any kind. Facebook charges $0. The full item price goes directly to you through whatever payment method you agree on with the buyer (cash, Venmo, PayPal, etc.). This makes Facebook Marketplace one of the most cost-effective platforms for local transactions, where you can list and sell without paying any fees to Facebook at all. The calculator defaults to shipped but lets you switch to local pickup to confirm the $0 fee.

## Facebook Shop and Instagram Shop fees.

Facebook Shops and Instagram Shops that use Meta's native checkout (not an external checkout integration) apply the same 10% selling fee. If you're a small business or creator selling through Instagram or Facebook Shop with Meta Checkout enabled, the fee is the same as Marketplace shipped orders. If your Shop links out to your own website for checkout, the 10% does not apply — you pay your own payment processor's rates instead.

## Is Facebook Marketplace cheaper than eBay or Etsy?

For local pickup, Facebook Marketplace is free — significantly cheaper than eBay's ~13.6% final value fee or Etsy's ~9.5% combined fee. For shipped orders, the comparison is closer: Facebook's 10% all-inclusive fee compares to eBay's 13.6% FVF + $0.30–$0.40 per order (effectively 14–15% at typical prices) and Etsy's 6.5% transaction + 3% processing + $0.25 listing = around 9.5–10%. Facebook's 10% is broadly in the same range as Etsy for most price points. If you're comparing platforms for selling shipped goods, the pricing is competitive, though eBay has far more buyer traffic for collectibles and higher-value items while Facebook excels at home goods, furniture, and everyday consumer products with local buyer pools.

## Tips for selling effectively.

For items under $8, be aware that the $0.80 minimum applies — the effective fee rate is actually higher than 10% at very low prices. A $3 item incurs a $0.80 fee, an effective take rate of about 26.7%. If you regularly sell low-priced items, local pickup avoids this entirely. For shipped items priced between $8 and $80, the 10% is straightforward. Use the optional item cost field to confirm whether any given sale is worth shipping after fees and your cost of goods.

## Accuracy and verified fees.

The fee in this calculator — 10% selling fee for shipped orders, $0.80 minimum for items under $8, and $0 for local pickup — reflects the rate that took effect on April 15, 2024 and has been in effect since. This was verified on 2026-06-12 from Meta's Business Help Center and multiple secondary sources that reported the increase. Facebook has not announced any further changes to this structure as of the verification date. Check the official source linked below for any updates before making pricing decisions.`,

  workedExample: {
    scenario: "You sell a $100 item on Facebook Marketplace with shipping.",
    steps: [
      { label: "Item price", value: "$100.00" },
      { label: "Selling fee (10%)", value: "$10.00" },
    ],
    result: "You receive $90.00",
  },

  faqs: [
    {
      q: "Does Facebook Marketplace charge fees?",
      a: "Yes, but only on shipped orders that go through Facebook's checkout. The selling fee is 10% of the item price (effective April 15, 2024), with a minimum of $0.80 for items priced below $8. Local pickup sales are completely free — Facebook charges $0 when no checkout is used.",
    },
    {
      q: "What is Facebook Marketplace's selling fee on shipped orders?",
      a: "The fee is 10% of the item price per shipment, with a minimum of $0.80 for items priced below $8.00. There is no separate payment processing fee — the 10% is all-inclusive, covering Facebook's payment processing, customer support, and Purchase Protection. On a $100 sale, the fee is $10.00 and you keep $90.00.",
    },
    {
      q: "Is local pickup free on Facebook Marketplace?",
      a: "Yes, completely. When you sell locally and the buyer picks up the item in person without using Facebook's checkout, there is no selling fee of any kind. You keep 100% of the agreed price. This applies regardless of the item price or value — local pickup on Facebook Marketplace is always fee-free.",
    },
    {
      q: "When did Facebook Marketplace's fee increase?",
      a: "Facebook Marketplace's selling fee doubled on April 15, 2024, going from 5% (with a $0.40 minimum) to 10% (with a $0.80 minimum) for shipped orders. The fee had been at 5% since Facebook introduced selling fees in 2020. Facebook cited covering payment processing, customer support, and Purchase Protection as the reason for the increase.",
    },
    {
      q: "Does the Facebook Marketplace fee apply to shipping costs?",
      a: "No. The 10% selling fee is calculated on the item price only, not on the shipping amount. Shipping on Facebook Marketplace is handled separately at checkout. The fee is per shipment, meaning if a buyer orders multiple items in one transaction, each shipment (item) has its own 10% fee calculated on that item's price.",
    },
    {
      q: "Do Instagram Shop fees work the same way?",
      a: "Yes. Instagram Shops and Facebook Shops using Meta's native checkout (Meta Checkout) apply the same 10% selling fee on shipped orders. The fee structure is identical. If your Instagram or Facebook Shop links to an external checkout on your own website, Meta's fee does not apply — instead, you pay your own payment processor's rates.",
    },
    {
      q: "How do I calculate my Facebook Marketplace profit?",
      a: "Enter your item price and your item cost in the calculator above. For shipped orders, it deducts the 10% selling fee (or $0.80 minimum for items under $8) and shows your net payout and profit after your cost of goods. For local pickup, there's no fee — your profit is the item price minus only what you paid for it.",
    },
  ],

  related: [
    "ebay-fee-calculator",
    "mercari-fee-calculator",
    "poshmark-fee-calculator",
    "depop-fee-calculator",
    "paypal-fee-calculator",
  ],

  sources: [
    {
      label: "Meta Business Help Center — About Fees for Sales",
      url: "https://www.facebook.com/business/help/223030991929920",
    },
    {
      label: "Facebook Help — Sell with Shipping on Marketplace",
      url: "https://www.facebook.com/help/773379109714742",
    },
    {
      label: "LitCommerce — Facebook Marketplace Fees: A Detailed Breakdown (fee change April 2024)",
      url: "https://litcommerce.com/blog/facebook-marketplace-fees/",
    },
  ],

  feesVerifiedOn: "2026-07-22",
  lastUpdated: "2026-06-12",
};
