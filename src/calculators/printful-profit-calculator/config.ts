import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { computePodProfit } from "../_shared/podProfit";

export const printfulProfitCalculator: CalculatorConfig = {
  slug: "printful-profit-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "printful",
  title: "Printful Profit Calculator",
  metaDescription:
    "Free Printful profit calculator. Enter your retail price and Printful's product + shipping cost to see your exact profit, margin percentage, and revenue breakdown — for any product.",
  h1: "Printful Profit Calculator",
  intro:
    "Calculate your profit margin on any Printful product. Enter your retail price and the base cost Printful charges you (found in your Printful dashboard) to see your exact profit and margin — before you set a price or launch a product.",

  keywords: {
    primary: "printful profit calculator",
    secondary: [
      "printful fee calculator",
      "printful pricing calculator",
      "printful profit margin",
      "printful margin calculator",
      "printful calculator",
      "printful profit per item",
      "how much profit on printful",
    ],
    longTail: [
      "printful profit calculator uk",
      "printful profit calculator canada",
      "printful profit calculator australia",
      "printful shipping cost calculator",
      "printful base cost calculator",
      "how to calculate profit on printful",
      "printful t shirt profit margin",
      "printful etsy profit calculator",
      "printful shopify profit calculator",
      "printful how much do i keep",
      "printful seller profit",
      "printful fulfillment cost calculator",
      "how much does printful cost per item",
      "printful vs printify profit",
      "is printful worth it profit margin",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "retailPrice",
      label: "Retail price (what customer pays)",
      type: "currency",
      default: 25,
      min: 0,
      help: "The price you charge your customer for the item.",
    },
    {
      id: "shippingCharged",
      label: "Shipping charged to customer",
      type: "currency",
      default: 0,
      min: 0,
      help: "Shipping fee you charge the customer. Enter 0 if you offer free shipping.",
    },
    {
      id: "productCost",
      label: "Printful product / base cost",
      type: "currency",
      default: 12.5,
      min: 0,
      help: "The price Printful charges you per item — find it on the product page in your Printful dashboard. Example: a Bella+Canvas 3001 unisex tee is typically around $12–$15 depending on size and color.",
    },
    {
      id: "shippingCost",
      label: "Printful shipping cost (to you)",
      type: "currency",
      default: 4.99,
      min: 0,
      help: "What Printful charges you for shipping to the customer. Varies by product, weight, and destination — check your Printful product page or order estimate.",
    },
    {
      id: "quantity",
      label: "Quantity",
      type: "number",
      default: 1,
      min: 1,
      step: 1,
      help: "Number of units in this order.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const r = computePodProfit({
      retailPrice: Number(values.retailPrice) || 0,
      shippingCharged: Number(values.shippingCharged) || 0,
      productCost: Number(values.productCost) || 0,
      shippingCost: Number(values.shippingCost) || 0,
      quantity: Math.max(1, Math.floor(Number(values.quantity) || 1)),
    });

    const qty = Math.max(1, Math.floor(Number(values.quantity) || 1));
    const productCostTotal = (Number(values.productCost) || 0) * qty;
    const shippingCostTotal = (Number(values.shippingCost) || 0) * qty;

    return {
      headline: {
        label: "Profit",
        display: ctx.formatCurrency(r.profit),
        sub: `${ctx.formatPercent(r.marginPercent)} margin on ${ctx.formatCurrency(r.revenue)} revenue`,
      },
      rows: [
        {
          label: qty > 1 ? `Revenue (${qty} × retail + shipping)` : "Revenue (retail + shipping)",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: qty > 1 ? `Printful product cost (${qty} × base cost)` : "Printful product cost",
          display: ctx.formatCurrency(productCostTotal),
          kind: "deduction",
        },
        {
          label: qty > 1 ? `Printful shipping cost (${qty} × shipping)` : "Printful shipping cost",
          display: ctx.formatCurrency(shippingCostTotal),
          kind: "deduction",
        },
        {
          label: "Total Printful cost",
          display: ctx.formatCurrency(r.totalCost),
          kind: "deduction",
        },
        {
          label: "Profit",
          display: ctx.formatCurrency(r.profit),
          kind: "net",
        },
        {
          label: "Profit margin",
          display: ctx.formatPercent(r.marginPercent),
          kind: "muted",
        },
      ],
    };
  },

  howItWorks:
    "Printful is a print-on-demand fulfillment service. When a customer places an order in your store, Printful prints and ships the item directly to them and charges you a base/product cost plus a shipping cost. You keep everything above that — there is no commission or percentage Printful takes from your sale price.\n\nYour profit = the price your customer pays (retail + any shipping you charge) minus the price Printful charges you (product base cost + shipping to the customer). The margin percentage is your profit divided by total revenue.\n\nBecause Printful's base cost varies by product, size, colour, and printing technique, you must enter the specific base cost from your Printful dashboard for an accurate result. Use the product pricing page inside your Printful account, or the Printful product catalog, to find the exact cost for the item you're selling.",

  seoContent: `A Printful profit calculator is the essential tool for any print-on-demand seller who wants to price products correctly and understand their margins before going live. Printful is one of the world's most popular POD fulfilment platforms — but because its product costs vary by item, size, colour, and printing technique, working out your actual profit margin requires a calculation, not a guess. This free calculator does that instantly: enter your retail price and Printful's charges, and see your exact profit and margin percentage in real time.

## How Printful's pricing model works.

Unlike marketplaces such as Etsy or Amazon, Printful does not charge a commission on your sales. There is no percentage Printful takes from what your customer pays you. Instead, you pay Printful a flat per-item base cost (also called the product cost or fulfillment cost) plus a shipping cost for each order. Printful bills your payment method after each order is fulfilled.

Your profit is simply the difference between what your customer pays and what Printful charges you. The base cost covers printing and the cost of the blank product (T-shirt, hoodie, mug, etc.); the shipping cost covers delivery to the customer. That's it — no hidden fees on the free Printful plan for standard print-on-demand orders.

## Where to find your Printful base cost.

Because Printful's base costs vary by product, this calculator asks you to enter the specific cost rather than looking it up from a static table. To find your product's base cost:

1. Log in to your Printful dashboard and go to the Product catalog (or open the product you want to price).
2. Select the specific variant — size, colour, and printing placement — you plan to sell.
3. The product page shows the base price Printful will charge you per unit. This is the number to enter in the "Printful product / base cost" field.
4. For shipping costs, use Printful's shipping rate calculator on the same product page, or check the shipping section in your store's order settings for typical rates to your target markets.

As a reference point, a popular unisex T-shirt (such as the Bella+Canvas 3001) typically costs around $12–$15 base cost from Printful for standard sizes, plus $3–$7 shipping to the US depending on carrier and speed. These are illustrative defaults only — your actual cost will vary.

## What Printful Growth changes.

Printful's paid tier, Printful Growth ($24.99/month), gives up to 33% off product base costs and 9% off branding add-ons. If you are on the Growth plan, enter the discounted base cost shown in your dashboard — the calculator works the same way. The membership fee itself is a fixed monthly cost separate from per-order profit, so it is not factored into per-item calculations here. If you want to account for the monthly fee, divide it by your expected monthly order volume and add it to the base cost field.

## How to price for a target margin.

Most print-on-demand sellers aim for a 30–50% margin after all costs. To hit a 40% margin on a product with a $14 base cost and $5 shipping ($19 total Printful cost), you need a retail price of at least $19 / (1 − 0.40) = $31.67. Round up to $32 or $34.99 and use this calculator to confirm the exact margin. Adjust your retail price until the margin percentage shown reaches your target.

Keep in mind that if you sell through a marketplace — Etsy, eBay, Amazon Handmade — you will also pay marketplace transaction and listing fees on top of Printful's charges. The profit shown here is your margin before those fees. Use our Etsy Fee Calculator or Shopify fee calculator (see related links below) to layer in those costs if applicable.

## Shipping strategy: free vs. charged.

Many sellers absorb shipping into the retail price and offer "free shipping" to customers (it converts better). If you do this, your retail price must cover both the product and the shipping cost Printful charges you. Enter 0 in the "Shipping charged to customer" field and bump up the retail price until your margin is healthy. If you pass shipping costs to the customer, enter that charge in the dedicated field — the calculator separates revenue from the shipping charge for clarity.

## Why margin percentage matters more than raw profit.

Profit in dollars tells you the gain per unit. Margin percentage tells you how efficiently you're pricing. A $7 profit on a $25 retail price is a 28% margin — acceptable for high-volume basics. A $7 profit on a $14 retail price is 50% — excellent. Use margin percentage to compare products and decide which lines are worth promoting. Below 20% margin, most sellers find that costs like marketplace fees, returns, and occasional refunds erode profitability quickly.

## Accuracy and what this calculator does not cover.

This calculator models the core Printful POD profit calculation: retail revenue minus Printful's product and shipping costs. It does not account for: Printful Growth membership fee (a fixed monthly cost); one-time embroidery digitization fees (charged once per design, typically around $2.95–$6.95 depending on stitch count); extra branding add-ons (inside label printing, packing inserts); marketplace fees (Etsy, Amazon, eBay, Shopify subscription); payment processing fees; or sales tax and VAT. For the most accurate picture of a specific product line, combine this calculator with the relevant marketplace fee tool.`,

  workedExample: {
    scenario: "You sell a unisex T-shirt for $25 with free shipping. Printful charges you $12.50 base cost + $4.99 shipping.",
    steps: [
      { label: "Retail price", value: "$25.00" },
      { label: "Shipping charged to customer", value: "$0.00 (free shipping)" },
      { label: "Total revenue", value: "$25.00" },
      { label: "Printful product base cost", value: "$12.50" },
      { label: "Printful shipping cost", value: "$4.99" },
      { label: "Total Printful cost", value: "$17.49" },
    ],
    result: "Profit = $7.51 (30.04% margin)",
  },

  faqs: [
    {
      q: "Does Printful take a commission on my sales?",
      a: "No. Printful does not take a percentage of your sales revenue. On the free Printful plan, you pay only the base/product cost and shipping cost that Printful charges per fulfilled order. Your profit is everything above those costs. This is different from selling on a marketplace like Etsy or eBay, where the platform also charges a transaction fee on your selling price.",
    },
    {
      q: "Where do I find my Printful product base cost?",
      a: "Log in to your Printful dashboard and open the product you want to price. Select the specific variant (size, colour, print placement) and the base cost Printful charges you is shown on the product page. It varies by product, variant, and printing technique — so always check your own dashboard rather than relying on general estimates.",
    },
    {
      q: "What is a good profit margin for Printful products?",
      a: "Most print-on-demand sellers aim for 30–50% gross margin (before marketplace fees). Below 20% there is usually too little buffer for returns, marketplace transaction fees, and promotional discounts. A 40% margin is a practical target: on a product costing $15 in total Printful charges, you'd price at $25 (40% margin). Enter your costs and target retail price above to see your exact margin.",
    },
    {
      q: "Should I offer free shipping or charge for it?",
      a: "Free shipping generally increases conversion rates, but you must build the shipping cost into your retail price to maintain margin. For example, if Printful charges you $5 to ship, raise your retail price by $5–$6 and offer free shipping to customers. Enter 0 in the 'Shipping charged to customer' field and adjust the retail price in the calculator to see how margin changes.",
    },
    {
      q: "How does Printful Growth affect my profit calculation?",
      a: "Printful Growth ($24.99/month) gives up to 33% off product base costs. If you are on Growth, simply enter the discounted base cost from your Printful dashboard — the calculation is the same. To factor in the monthly membership fee, divide it by your expected monthly order volume and add that per-item cost to the base cost field.",
    },
    {
      q: "Does this calculator include Etsy or Shopify fees?",
      a: "No — this calculator shows profit from Printful's charges only. If you sell on Etsy, Etsy also charges a 6.5% transaction fee plus a $0.20 listing fee on top of Printful's costs. Use our Etsy Fee Calculator to calculate those fees separately, then combine the two to get your full net profit.",
    },
    {
      q: "What extra fees does Printful charge that aren't in this calculator?",
      a: "For standard print-on-demand orders on the free plan, the product base cost and shipping are the main charges. One-time embroidery digitization fees apply when you first set up an embroidery design (typically $2.95–$6.95 depending on stitch count, charged once per design). Branding add-ons (inside label, packing inserts) are also extra. The Printful Growth membership is $24.99/month. For the vast majority of product orders, only base cost + shipping apply.",
    },
  ],

  related: [
    "etsy-fee-calculator",
    "stripe-fee-calculator",
    "paypal-fee-calculator",
    "reverb-fee-calculator",
  ],

  sources: [
    {
      label: "Printful — How much does Printful cost?",
      url: "https://help.printful.com/hc/en-us/articles/360014010240-How-much-does-Printful-cost",
    },
    {
      label: "Printful — How does Printful's product pricing work?",
      url: "https://help.printful.com/hc/en-us/articles/360014068839-How-does-Printful-pricing-work-",
    },
    {
      label: "Printful — How Payments Work: A Guide to Printful Pricing",
      url: "https://www.printful.com/payments-guide",
    },
    {
      label: "Printful — Plans (Free vs. Growth)",
      url: "https://www.printful.com/plans",
    },
  ],

  feesVerifiedOn: "2026-06-11",
  lastUpdated: "2026-06-11",
};
