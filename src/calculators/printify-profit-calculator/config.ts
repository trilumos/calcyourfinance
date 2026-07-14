import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { computePodProfit } from "../_shared/podProfit";

export const printifyProfitCalculator: CalculatorConfig = {
  slug: "printify-profit-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "printify",
  title: "Printify Profit Calculator",
  metaDescription:
    "Free Printify profit calculator. Enter your retail price and Printify's product + shipping cost to see your exact profit, margin percentage, and revenue breakdown — for any product.",
  h1: "Printify Profit Calculator",
  intro:
    "Calculate your profit margin on any Printify product. Enter your retail price and the base cost Printify charges you (found in your Printify dashboard) to see your exact profit and margin — before you set a price or launch a product.",

  keywords: {
    primary: "printify profit calculator",
    secondary: [
      "printify fee calculator",
      "printify profit margin",
      "printify pricing calculator",
      "printify calculator",
      "how much profit on printify",
      "printify margin calculator",
      "printify profit per item",
    ],
    longTail: [
      "printify profit calculator uk",
      "printify profit calculator canada",
      "printify profit calculator australia",
      "printify profit calculator india",
      "printify profit calculator germany",
      "printify shipping cost calculator",
      "printify base cost calculator",
      "how to calculate profit on printify",
      "printify t shirt profit margin",
      "printify etsy profit calculator",
      "printify shopify profit calculator",
      "printify how much do i keep",
      "printify seller profit",
      "printify fulfillment cost calculator",
      "how much does printify cost per item",
      "printify vs printful profit",
      "is printify worth it profit margin",
      "printify premium discount calculator",
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
      label: "Printify product / base cost",
      type: "currency",
      default: 9,
      min: 0,
      help: "The price Printify charges you per item — find it on the product page in your Printify dashboard. If you are on Printify Premium, enter the discounted base cost shown there (Premium gives up to 33% off).",
    },
    {
      id: "shippingCost",
      label: "Printify shipping cost (to you)",
      type: "currency",
      default: 4.5,
      min: 0,
      help: "What Printify charges you for shipping to the customer. Varies by product, weight, and destination — check your Printify product page or order estimate.",
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
          label: qty > 1 ? `Printify product cost (${qty} × base cost)` : "Printify product cost",
          display: ctx.formatCurrency(productCostTotal),
          kind: "deduction",
        },
        {
          label: qty > 1 ? `Printify shipping cost (${qty} × shipping)` : "Printify shipping cost",
          display: ctx.formatCurrency(shippingCostTotal),
          kind: "deduction",
        },
        {
          label: "Total Printify cost",
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
    "Printify is a print-on-demand fulfillment platform. When a customer places an order in your store, Printify prints and ships the item directly to them and charges you a base/product cost plus a shipping cost. You keep everything above that — there is no commission or percentage Printify takes from your sale price on the free plan.\n\nYour profit = the price your customer pays (retail + any shipping you charge) minus the price Printify charges you (product base cost + shipping to the customer). The margin percentage is your profit divided by total revenue.\n\nBecause Printify's base cost varies by product, size, colour, printing technique, and which print provider fulfils the order, you must enter the specific base cost from your Printify dashboard for an accurate result. Use the product pricing page inside your Printify account to find the exact cost for the item you're selling.",

  seoContent: `A Printify profit calculator is the essential tool for any print-on-demand seller who wants to price products correctly and understand their margins before going live. Printify is one of the world's largest POD platforms — connecting sellers with a global network of print providers and offering one of the widest product catalogues in the industry. But because its product costs vary by item, print provider, size, and technique, working out your actual profit margin requires a calculation, not a guess. This free calculator does that instantly: enter your retail price and Printify's charges, and see your exact profit and margin percentage in real time.

## How Printify's pricing model works.

Unlike marketplaces such as Etsy or Amazon, Printify does not charge a commission on your sales. There is no percentage Printify takes from what your customer pays you. Instead, you pay Printify a flat per-item base cost (also called the product cost or fulfillment cost) plus a shipping cost for each order. Printify bills your payment method after each order is fulfilled.

Your profit is simply the difference between what your customer pays and what Printify charges you. The base cost covers printing and the cost of the blank product (T-shirt, hoodie, mug, tote bag, etc.); the shipping cost covers delivery to the customer. That's it — no hidden fees on the free Printify plan for standard print-on-demand orders.

## Where to find your Printify base cost.

Because Printify's base costs vary by product and print provider, this calculator asks you to enter the specific cost rather than looking it up from a static table. To find your product's base cost:

1. Log in to your Printify dashboard and open the product you want to price.
2. Select the specific variant — size, colour, and printing placement — you plan to sell.
3. The product page shows the base price Printify will charge you per unit. This is the number to enter in the "Printify product / base cost" field.
4. For shipping costs, Printify shows estimated shipping rates on the product page when you select a delivery destination.

As a reference point, a basic unisex T-shirt from a popular US-based print provider typically costs around $7–$12 base cost from Printify, plus $3–$6 shipping to the US depending on the provider and speed. These are illustrative defaults only — your actual cost depends on the specific print provider, product, and variant you select.

## What Printify Premium changes.

Printify's paid tier, Printify Premium ($39/month, or $24.99/month billed annually), gives up to 33% off product base costs. If you are on the Premium plan, enter the discounted base cost shown in your dashboard — the calculator works the same way. The monthly fee itself is a fixed cost separate from per-order profit, so it is not factored into per-item calculations here. If you want to account for the monthly fee, divide it by your expected monthly order volume and add that amount to the base cost field.

For example, if you sell 50 orders per month and pay $39/month for Premium, that's $0.78 per order in fixed cost. Add $0.78 to the base cost field in the calculator to see your real per-item margin.

## How to price for a target margin.

Most print-on-demand sellers aim for a 30–50% margin after all costs. To hit a 40% margin on a product with a $9 base cost and $4.50 shipping ($13.50 total Printify cost), you need a retail price of at least $13.50 / (1 − 0.40) = $22.50. Round up to $23 or $24.99 and use this calculator to confirm the exact margin. Adjust your retail price until the margin percentage shown reaches your target.

If you sell through a marketplace — Etsy, eBay, Amazon Handmade — you will also pay marketplace transaction and listing fees on top of Printify's charges. The profit shown here is your margin before those marketplace fees.

## Shipping strategy: free vs. charged.

Many sellers absorb shipping into the retail price and offer "free shipping" to customers — it converts better. If you do this, your retail price must cover both the product and the shipping cost Printify charges you. Enter 0 in the "Shipping charged to customer" field and bump up the retail price until your margin is healthy. If you pass shipping costs to the customer, enter that charge in the dedicated field — the calculator separates revenue from the shipping charge for clarity.

## Printify vs. Printful: which has better margins.

Printify's competitive advantage is its print provider network model: by connecting you to multiple providers globally, it can offer lower base costs on many products compared to single-provider services. Printful tends to have higher base costs but more consistent quality controls and in-house fulfilment. For maximising margin on high-volume basics (T-shirts, hoodies), Printify's lower base costs typically produce better per-item margins. Use this calculator alongside the Printful Profit Calculator to compare your specific product on both platforms.

## Why margin percentage matters more than raw profit.

Profit in dollars tells you the gain per unit. Margin percentage tells you how efficiently you're pricing. A $11.50 profit on a $25 retail price is a 46% margin — excellent for POD. Use margin percentage to compare products and decide which lines are worth promoting. Below 20% margin, most sellers find that costs like marketplace fees, returns, and promotional discounts erode profitability quickly.

## Accuracy and what this calculator does not cover.

This calculator models the core Printify POD profit calculation: retail revenue minus Printify's product and shipping costs. It does not account for: Printify Premium membership fee (a fixed monthly cost); marketplace fees (Etsy, Amazon, eBay, Shopify subscription); payment processing fees; sales tax and VAT; or per-order extra charges such as branded inserts. For the most accurate picture of a specific product line, combine this calculator with the relevant marketplace fee tool.`,

  workedExample: {
    scenario:
      "You sell a unisex T-shirt for $25 with free shipping. Printify charges you $9 base cost + $4.50 shipping.",
    steps: [
      { label: "Retail price", value: "$25.00" },
      { label: "Shipping charged to customer", value: "$0.00 (free shipping)" },
      { label: "Total revenue", value: "$25.00" },
      { label: "Printify product base cost", value: "$9.00" },
      { label: "Printify shipping cost", value: "$4.50" },
      { label: "Total Printify cost", value: "$13.50" },
    ],
    result: "Profit = $11.50 (46% margin)",
  },

  faqs: [
    {
      q: "Does Printify take a commission on my sales?",
      a: "No. Printify does not take a percentage of your sales revenue on the free plan. You pay only the base/product cost and shipping cost that Printify charges per fulfilled order. Your profit is everything above those costs. This is different from selling on a marketplace like Etsy or eBay, where the platform also charges a transaction fee on your selling price.",
    },
    {
      q: "Where do I find my Printify product base cost?",
      a: "Log in to your Printify dashboard and open the product you want to price. Select the specific variant (size, colour, print placement) and the base cost Printify charges you is shown on the product page. It varies by product, print provider, variant, and printing technique — so always check your own dashboard rather than relying on general estimates.",
    },
    {
      q: "What is Printify Premium and how does it affect my profit?",
      a: "Printify Premium ($39/month, or $24.99/month billed annually) gives up to 33% off product base costs. If you are on Premium, simply enter the discounted base cost from your Printify dashboard — the calculation is the same. To factor in the monthly membership fee, divide it by your expected monthly order volume and add that per-item cost to the base cost field. For example, 50 orders/month at $39/month = $0.78 extra per order.",
    },
    {
      q: "What is a good profit margin for Printify products?",
      a: "Most print-on-demand sellers aim for 30–50% gross margin (before marketplace fees). Below 20% there is usually too little buffer for returns, marketplace transaction fees, and promotional discounts. A 40–50% margin is a practical target: on a product costing $13.50 in total Printify charges, you'd price at $22.50–$27 to hit that range. Enter your costs and target retail price above to see your exact margin.",
    },
    {
      q: "How does Printify handle shipping — does the seller pay for it separately?",
      a: "Yes. Printify charges you a per-order shipping cost separately from the base/product cost. This shipping cost covers delivery of the item to your customer. The amount varies by product, weight, print provider, and destination country. You can find estimated shipping rates on the product page in your Printify dashboard. Enter that shipping cost in the 'Printify shipping cost' field in the calculator.",
    },
    {
      q: "Does this calculator work for Printify on Etsy or Shopify?",
      a: "This calculator shows your Printify profit before marketplace or platform fees. If you sell on Etsy, Etsy also charges a 6.5% transaction fee plus a $0.20 listing fee. If you sell on Shopify, there is a monthly Shopify subscription cost. Use our Etsy Fee Calculator or other relevant fee tools to layer in those costs and arrive at your full net profit.",
    },
    {
      q: "How is Printify different from Printful for profit margins?",
      a: "Printify connects you to multiple print providers globally, which often results in lower base costs than single-provider platforms like Printful. This typically means higher per-item margins on commodity products like T-shirts and hoodies. However, base costs vary widely between Printify's different print providers. Always check the specific provider's cost in your Printify dashboard, as the cheapest provider isn't always the best choice for quality or shipping speed.",
    },
  ],

  related: [
    "printful-profit-calculator",
    "etsy-fee-calculator",
    "stripe-fee-calculator",
    "paypal-fee-calculator",
  ],

  sources: [
    {
      label: "Printify — Pricing (Free vs. Premium plans)",
      url: "https://printify.com/pricing/",
    },
    {
      label: "Printify — How It Works",
      url: "https://printify.com/how-it-works/",
    },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
