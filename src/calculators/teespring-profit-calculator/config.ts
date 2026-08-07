import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { computePodProfit } from "../_shared/podProfit";

export const teespringProfitCalculator: CalculatorConfig = {
  slug: "teespring-profit-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "teespring",
  title: "Teespring Profit Calculator (Spring)",
  metaDescription:
    "Free Teespring profit calculator. Enter your retail price and Spring base cost to see your exact profit and margin percentage — for any product on Spring (formerly Teespring).",
  h1: "Teespring Profit Calculator",
  intro:
    "Calculate your profit on any Spring (formerly Teespring) product. Enter your retail price and the base cost shown in the Spring launcher to see your exact profit and margin — before you publish a listing.",

  keywords: {
    primary: "teespring profit calculator",
    secondary: [
      "spring profit calculator",
      "teespring fees",
      "how much does teespring pay",
      "spring creator earnings",
      "teespring profit margin",
      "teespring pricing calculator",
      "spring fee calculator",
    ],
    longTail: [
      "teespring profit calculator uk",
      "teespring profit calculator canada",
      "teespring profit calculator australia",
      "teespring profit calculator india",
      "teespring profit calculator germany",
      "how much profit can you make on teespring",
      "spring print on demand profit margin",
      "teespring base cost calculator",
      "teespring how much do i keep",
      "teespring seller earnings calculator",
      "spring vs teespring profit",
      "how does spring profit work",
      "teespring t shirt profit margin",
      "spring creator profit calculator",
      "teespring commission fee calculator",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "retailPrice",
      label: "Retail price (what customer pays)",
      type: "currency",
      default: 22,
      min: 0,
      help: "The price you charge your customer for the item. Set this above the base cost to earn a profit.",
    },
    {
      id: "shippingCharged",
      label: "Shipping charged to customer",
      type: "currency",
      default: 0,
      min: 0,
      help: "If you charge customers a separate shipping fee at checkout, enter it here. Spring handles shipping for buyers — many creators offer free shipping and build the cost into the retail price.",
    },
    {
      id: "productCost",
      label: "Spring base cost",
      type: "currency",
      default: 11,
      min: 0,
      help: "The base cost Spring charges you per item — shown in the Spring product launcher when you add a product. This already includes Spring's service fee. Example: a basic unisex T-shirt is typically around $10–$12.",
    },
    {
      id: "shippingCost",
      label: "Shipping cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "Spring handles shipping logistics and charges buyers directly at checkout. For most sellers this is $0 here — leave blank unless you have a specific per-item shipping cost to model.",
    },
    {
      id: "quantity",
      label: "Quantity",
      type: "number",
      default: 1,
      min: 1,
      step: 1,
      help: "Number of units to calculate profit for.",
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
          label: qty > 1 ? `Spring base cost (${qty} × base cost)` : "Spring base cost",
          display: ctx.formatCurrency(productCostTotal),
          kind: "deduction",
        },
        ...(shippingCostTotal > 0
          ? [
              {
                label: qty > 1 ? `Shipping cost (${qty} × shipping)` : "Shipping cost",
                display: ctx.formatCurrency(shippingCostTotal),
                kind: "deduction" as const,
              },
            ]
          : []),
        {
          label: "Total cost",
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
    "Spring (formerly Teespring) is a free creator commerce platform for selling custom merchandise. When a customer buys a product from your Spring store, Spring prints, packs, and ships the order directly to them. You keep the difference between what your customer paid and the base cost Spring charges you — there is no separate platform commission.\n\nSpring's service fee is built into the base cost of each product, not charged as a separate percentage on top of your sales. This means your profit calculation is straightforward: profit = retail price − base cost. Set a retail price in the Spring launcher that is comfortably above the base cost shown, and the profit is yours.\n\nSpring handles shipping logistics and charges buyers directly at checkout — it is not a separate deduction from your earnings. Your profit = what you earn from the sale price you set, minus the base cost shown in the Spring product launcher.",

  seoContent: `A Teespring profit calculator — or Spring profit calculator, as the platform is now officially named — is the quickest way to check whether your retail price leaves you enough margin before you publish a listing. Spring (formerly Teespring) is one of the most popular print-on-demand platforms for content creators, with integrations for YouTube, TikTok, Instagram, and Twitch. Because profit on Spring is simply the difference between your selling price and the product's base cost, the math is clean — but knowing exactly how much you'll earn per sale, and what margin that represents, helps you price with confidence.

## How Spring's (Teespring's) profit model works.

Spring does not charge sellers a commission on sales. There is no percentage Spring deducts from what your customer pays you. Instead, Spring includes its service fee in the base cost of each product. When you add a product in the Spring launcher, you see the base cost — that number already accounts for Spring's costs. You set a selling price above that base cost, and the difference is your profit.

For example, Spring's own help documentation uses this illustration: if the base cost of a T-shirt is $10 and you choose to sell it for $24, you keep $14 in profit. The platform takes nothing extra. This is the model this calculator is built on.

## Where to find your Spring base cost.

To find the base cost for a product:

1. Open the Spring launcher (app.spri.ng) and click "Add a product."
2. Select the product category and specific item you want to sell (e.g. a unisex T-shirt).
3. The launcher shows the base cost for that item — this is the number to enter in the "Spring base cost" field above.
4. Set your selling price in the launcher and Spring will show your profit per unit in real time.

As a general reference, basic unisex T-shirts on Spring typically have a base cost in the $10–$12 range, hoodies in the $25–$35 range, and mugs around $8–$10. These vary based on product variant and any design options. Always use the actual base cost shown in the launcher for your specific product — these are illustrative defaults only.

## How Spring handles shipping for sellers.

Spring manages all fulfilment and shipping logistics. Buyers pay for shipping at checkout — Spring adds a shipping fee to the customer's order total when they check out. This shipping charge goes to Spring to cover delivery; it is not paid by you as the seller, and it does not reduce your profit. Your earnings are based purely on the selling price you set minus the base cost.

Some creators choose to absorb shipping by advertising "free shipping" — in that case, they may price slightly higher to offset the customer's perception of value, but this is a marketing choice, not a financial one. From a calculation standpoint, your profit is still: retail price minus base cost.

If you run a promotion or discount code that reduces the selling price, your profit shrinks accordingly. Spring's promotions system lets you set a minimum profit floor to protect your earnings when running sales.

## Volume discounts and how they change your margin.

Spring offers volume discounts on base costs based on your sales volume from the previous month. If you sold a large number of units last month, your base costs may be lower this month — which means higher profit on the same retail price. These discounts are applied automatically; you do not need to configure anything. If your base cost appears lower than you expected, it may reflect a volume discount earned from prior month sales.

Because volume discounts change the base cost figure, always check the current base cost shown in your Spring launcher rather than relying on a fixed figure. Enter the current base cost into this calculator to get an accurate profit estimate.

## How to price for a good margin on Spring.

Most successful print-on-demand creators target a 40–60% gross margin on physical products. This leaves room for promotional discounts, occasional refunds, and marketplace transaction fees if you cross-list on Etsy or other platforms.

To hit a 50% margin on a product with an $11 base cost, you need a retail price of at least $11 / (1 − 0.50) = $22. At $22, profit = $11, margin = 50%. Use this calculator to check different price points until you find one that balances competitiveness with healthy margin.

Note that if you sell through external marketplaces — for example, linking to your Spring store from an Etsy listing, or selling through a Shopify storefront that fulfils via Spring — those platforms charge their own transaction and listing fees. The profit shown in this calculator is your Spring profit only.

## Spring vs. other print-on-demand platforms.

Spring's base cost structure is competitive on entry-level products and apparel. Compared to Printify (which uses a network of third-party print providers) and Printful (which uses its own fulfilment centres), Spring focuses heavily on creator-commerce integrations with social platforms, making it especially strong for creators with YouTube, TikTok, or Twitch audiences.

The key trade-off: Spring's product catalogue is somewhat narrower than Printify's or Printful's, but the direct social-platform integrations can drive higher organic sales volume for creators with engaged audiences. If you're comparing profit margins across platforms for the same product, use this calculator alongside the Printful Profit Calculator and Printify Profit Calculator to see which gives you the best per-item margin.

## Accuracy and what this calculator does not cover.

This calculator models the core Spring profit calculation: retail revenue minus base cost (and any optional shipping cost field you complete). It does not account for: marketplace fees if you cross-list on Etsy, Shopify, or other platforms; promotional discounts applied via Spring promo codes; payment processing fees on your payout (Spring handles payments and pays out your accumulated profit on a schedule); or volume discount changes to your base cost. For the most accurate per-product estimate, always use the live base cost from your Spring launcher.`,

  workedExample: {
    scenario:
      "You sell a unisex T-shirt on Spring for $22 with free shipping. The base cost shown in Spring's launcher is $11.",
    steps: [
      { label: "Retail price", value: "$22.00" },
      { label: "Shipping charged to customer", value: "$0.00 (Spring charges buyer separately)" },
      { label: "Total revenue", value: "$22.00" },
      { label: "Spring base cost (incl. Spring's service fee)", value: "$11.00" },
      { label: "Total Spring cost", value: "$11.00" },
    ],
    result: "Profit = $11.00 (50% margin)",
  },

  faqs: [
    {
      q: "Does Teespring (Spring) take a commission on my sales?",
      a: "No. Spring does not charge a separate commission percentage on your sales. Spring's service fee is included in the base cost of the products shown in the launcher. You set a retail price above the base cost and keep the entire difference as profit. This is confirmed in Spring's official help documentation: 'our service fee is included in the base cost of the products you sell.'",
    },
    {
      q: "How is my profit calculated on Spring (formerly Teespring)?",
      a: "Your profit = retail price − base cost. If the base cost of a T-shirt is $10 and you sell it for $24, your profit is $14. Spring's own help documentation uses this exact example. There is no additional platform fee deducted from your profit. If you enter a shipping charge to the customer, that amount is added to your revenue: profit = (retail + shipping charged) − base cost.",
    },
    {
      q: "Where do I find the base cost on Spring?",
      a: "The base cost for each product is shown in the Spring product launcher (app.spri.ng) when you add or edit a product. It is the cost Spring charges you per unit, and it already includes Spring's built-in service fee. Base costs vary by product type and variant. They can also decrease if you qualify for volume discounts based on previous-month sales — check the launcher for the current figure.",
    },
    {
      q: "How does shipping work for Spring sellers — does it come out of my profit?",
      a: "No — shipping is paid by the buyer at checkout and handled entirely by Spring. Spring adds a shipping fee to the customer's order total when they check out. This does not reduce your profit. Your earnings are based on the selling price you set minus the base cost. The 'Shipping cost' field in this calculator defaults to $0 for this reason — leave it blank unless you have a specific reason to model a per-item shipping deduction.",
    },
    {
      q: "What is a good profit margin for Spring / Teespring products?",
      a: "Most creators aim for a 40–60% margin on physical products. At $11 base cost and $22 retail, you earn 50% — a solid starting point for T-shirts. Below 30% margin there is too little cushion for promotional discounts, occasional refunds, or marketplace fees if you cross-list. Use this calculator to test different price points until the margin percentage shown reaches your target.",
    },
    {
      q: "Does Spring offer volume discounts on base costs?",
      a: "Yes. Spring provides volume discounts on base costs based on your sales volume from the previous month. Higher sales last month unlock lower base costs this month — automatically. If your launcher shows a base cost lower than the product's standard price, it may reflect a volume discount. Always use the current base cost from the launcher, not a historical figure, for accurate profit calculations.",
    },
    {
      q: "Is Spring (formerly Teespring) the same platform?",
      a: "Yes. Teespring rebranded to Spring in 2021. The platform, product catalogue, and profit model are the same — only the name changed. The URL dashboard.teespring.com still works for creators who used the old Teespring login. Search queries for 'teespring profit calculator' and 'spring profit calculator' both refer to this same platform.",
    },
  ],

  related: [
    "printful-profit-calculator",
    "printify-profit-calculator",
    "etsy-fee-calculator",
    "stripe-fee-calculator",
  ],

  sources: [
    {
      label: "Spring for Creators — How Much Products Cost",
      url: "https://spring4creators.zendesk.com/hc/en-us/articles/17959394635149-How-Much-Products-Cost",
    },
    {
      label: "Spring for Creators — How Spring Works",
      url: "https://spring4creators.zendesk.com/hc/en-us/articles/12423741560589-How-Spring-works",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-15",
};
