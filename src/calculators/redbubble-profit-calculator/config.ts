import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { computeRedbubbleEarnings, type RedbubbleAccountTier } from "./formula";

export const redbubbleProfitCalculator: CalculatorConfig = {
  slug: "redbubble-profit-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "redbubble",
  title: "Redbubble Profit Calculator",
  metaDescription:
    "Free Redbubble profit calculator. Enter your base price, markup %, and account tier to see your exact artist earnings and net profit after Redbubble's platform fees — instantly.",
  h1: "Redbubble Profit Calculator",
  intro:
    "Calculate exactly how much you earn on each Redbubble sale. Enter Redbubble's base price, your markup %, and your account tier — and see your gross earnings, platform fee, and net profit in seconds.",

  keywords: {
    primary: "redbubble profit calculator",
    secondary: [
      "redbubble margin calculator",
      "redbubble earnings calculator",
      "how much does redbubble pay",
      "redbubble markup",
      "redbubble fees",
      "redbubble artist earnings",
      "redbubble markup percentage",
    ],
    longTail: [
      "redbubble profit calculator uk",
      "redbubble profit calculator canada",
      "redbubble profit calculator australia",
      "redbubble profit calculator india",
      "redbubble profit calculator germany",
      "redbubble how much do i earn per sale",
      "redbubble 20 percent markup earnings",
      "redbubble platform fee calculator",
      "redbubble standard premium pro tier fee",
      "redbubble excess markup fee calculator",
      "redbubble base price markup calculator",
      "redbubble artist margin calculator",
      "how to calculate redbubble earnings",
      "redbubble net earnings after fees",
      "is redbubble worth it profit",
      "redbubble vs printful profit",
      "redbubble how much do artists keep",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "basePrice",
      label: "Redbubble base price",
      type: "currency",
      default: 20,
      min: 0,
      help: "Redbubble sets this per product. Find it on the pricing page when you set up or edit a product in your Redbubble dashboard (e.g. a classic T-shirt base is typically around $18–$22).",
    },
    {
      id: "marginPercent",
      label: "Your markup %",
      type: "percent",
      default: 20,
      min: 0,
      help: "Your markup on top of the base price. Redbubble's default and recommended threshold is 20%. Raising it above 20% triggers an excess markup fee for Standard and Premium accounts.",
    },
    {
      id: "accountTier",
      label: "Account tier",
      type: "select",
      default: "standard",
      options: [
        { value: "standard", label: "Standard (50% platform fee)" },
        { value: "premium", label: "Premium (20% platform fee)" },
        { value: "pro", label: "Pro (0% — no fees)" },
      ],
      help: "Redbubble introduced three account tiers in September 2025. Standard artists pay 50% of earnings as a platform fee; Premium 20%; Pro artists pay nothing.",
    },
    {
      id: "quantity",
      label: "Quantity",
      type: "number",
      default: 1,
      min: 1,
      step: 1,
      help: "Number of units sold. Use this to estimate earnings for a batch of sales.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const qty = Math.max(1, Math.floor(Number(values.quantity) || 1));
    const tier = (values.accountTier as RedbubbleAccountTier) || "standard";

    const r = computeRedbubbleEarnings({
      basePrice: Number(values.basePrice) || 0,
      marginPercent: Number(values.marginPercent) || 0,
      quantity: qty,
      accountTier: tier,
    });

    const hasExcessFee = r.excessMarkupFee > 0;
    const hasPlatformFee = r.platformFee > 0;

    const tierLabel =
      tier === "standard" ? "Standard (50%)"
      : tier === "premium" ? "Premium (20%)"
      : "Pro (0%)";

    const marginPercent = Number(values.marginPercent) || 0;

    const subParts: string[] = [];
    if (hasPlatformFee) {
      subParts.push(`${tierLabel} platform fee applied`);
    }
    if (hasExcessFee) {
      subParts.push(`excess markup fee on ${marginPercent}% markup`);
    }
    const sub = subParts.length > 0
      ? `${ctx.formatCurrency(r.retailPrice)} retail · ${subParts.join(" · ")}`
      : `${ctx.formatCurrency(r.retailPrice)} retail price · no platform fee deducted`;

    const rows = [
      {
        label: qty > 1 ? `Retail price per unit` : "Retail price (what customer pays)",
        display: ctx.formatCurrency(r.retailPrice),
      },
      {
        label: "Redbubble base price",
        display: ctx.formatCurrency(Number(values.basePrice) || 0),
        kind: "deduction" as const,
      },
      {
        label: qty > 1 ? `Gross earnings per unit (${marginPercent}% markup)` : `Gross earnings (${marginPercent}% markup)`,
        display: ctx.formatCurrency(r.grossEarnings),
      },
    ];

    if (hasPlatformFee) {
      rows.push({
        label: qty > 1
          ? `Platform fee per unit (${tierLabel})`
          : `Platform fee (${tierLabel})`,
        display: `−${ctx.formatCurrency(r.platformFee)}`,
        kind: "deduction" as const,
      });
    }

    if (hasExcessFee) {
      rows.push({
        label: qty > 1
          ? `Excess markup fee per unit (markup > 20%)`
          : `Excess markup fee (markup > 20%)`,
        display: `−${ctx.formatCurrency(r.excessMarkupFee)}`,
        kind: "deduction" as const,
      });
    }

    rows.push({
      label: qty > 1 ? `Net earnings per unit` : "Net earnings per sale",
      display: ctx.formatCurrency(r.netEarnings),
      kind: "net" as const,
    });

    rows.push({
      label: "Net margin on retail",
      display: ctx.formatPercent(r.netMarginOnRetailPercent),
      kind: "muted" as const,
    });

    if (qty > 1) {
      rows.push({
        label: `Total retail (${qty} units)`,
        display: ctx.formatCurrency(r.retailPriceTotal),
      });
      rows.push({
        label: `Total net earnings (${qty} units)`,
        display: ctx.formatCurrency(r.netEarningsTotal),
        kind: "net" as const,
      });
    }

    return {
      headline: {
        label: qty > 1 ? "Net earnings" : "Net earnings per sale",
        display: ctx.formatCurrency(qty > 1 ? r.netEarningsTotal : r.netEarnings),
        sub,
      },
      rows,
    };
  },

  howItWorks:
    "Redbubble works differently from platforms like Printful or Printify. Rather than charging you a base cost per fulfilled order, Redbubble sets a base price for each product internally. You (the artist) set a markup percentage on top of that base — and the retail price your customer pays is: base price × (1 + markup %). Your gross earnings per sale equal the markup amount: base price × markup %.\n\nFor example, with a $20 base price and a 20% markup, the retail price is $24 and your gross earnings are $4. The base price covers Redbubble's costs (production, fulfilment, platform services) and everything above it is your cut — before any account-tier fees.\n\nFrom September 2025, Redbubble introduced three artist account tiers with different platform fees applied to your gross monthly earnings: Standard (50% fee), Premium (20% fee), and Pro (0% fee). There is also an Excess Markup Fee of 50% applied to any earnings generated from markup above 20%, for Standard and Premium accounts. Combined fees are capped at $150 per payment period.",

  seoContent: `A Redbubble profit calculator is the essential tool for any artist selling on Redbubble who wants to understand exactly how much they earn per sale — and how Redbubble's markup model and account tier fees affect their bottom line. Redbubble is one of the world's leading print-on-demand art marketplaces, but its earnings structure is unique and can be confusing. This free calculator models the complete picture: gross earnings from your markup, minus the platform fee for your account tier, minus any excess markup fee — so you see your true net profit per sale.

## How Redbubble's earnings model works.

Redbubble's earnings structure is fundamentally different from POD fulfilment services like Printful or Printify. Instead of paying a production cost per order and keeping the retail price minus that cost, on Redbubble the math works as follows:

- Redbubble sets a **base price** for every product (a T-shirt, sticker, mug, print, etc.). This covers Redbubble's production and fulfilment costs.
- You set a **markup percentage** on top of that base price. Redbubble's default — and the threshold that avoids the excess markup fee — is **20%**.
- The **retail price** your customer pays = base price × (1 + markup %).
- Your **gross earnings** = base price × markup % — i.e. exactly the markup amount.

So at a $20 base price with a 20% markup: retail price = $24, gross earnings = $4. The base price always belongs to Redbubble; only the markup amount is yours (before platform fees).

## Where to find the base price.

When you add or edit a product in your Redbubble shop, the pricing page shows you the current base price for that item. Because Redbubble's base prices vary by product type, this calculator asks you to enter it directly rather than relying on a fixed product catalogue. Common examples (illustrative, verify in your dashboard):

- Classic T-shirt: approximately $18–$22 base
- Sticker (small): approximately $1.40–$2.50 base
- Art print (A4): approximately $8–$14 base
- Throw pillow cover: approximately $16–$22 base

Always enter the exact base price shown in your Redbubble pricing dashboard, as Redbubble adjusts these periodically.

## Account tier fees (from September 2025).

Redbubble introduced a three-tier account system on September 1, 2025. Your account tier determines what percentage of your gross monthly earnings Redbubble takes as a platform fee:

**Standard tier** — 50% of your gross earnings. This is the default for new or low-activity accounts. At 20% markup and a $20 base, your $4 gross earnings become $2 net. This is a significant deduction and is widely considered the least favourable tier for profitability.

**Premium tier** — 20% of your gross earnings. A better outcome for active sellers. At 20% markup and a $20 base, your $4 gross earnings become $3.20 net after the 20% platform fee.

**Pro tier** — 0% platform fees. Pro status is awarded to artists with consistently high sales and strong engagement on Redbubble. Pro artists keep their full gross earnings and are also exempt from the excess markup fee.

The monthly fee cap means Standard and Premium accounts are never charged more than $150 in combined platform fees per payment period. This cap cannot be modelled per-sale and is not shown in this calculator — the calculator shows the fee as if you are below the cap.

## The excess markup fee explained.

Standard and Premium account artists who set a markup above 20% face an additional deduction: the **Excess Markup Fee**. This is 50% of any earnings generated by markup above the 20% threshold.

For example, if you set a 30% markup on a $20 base product:
- Gross earnings = $20 × 30% = $6.00
- Earnings at the 20% threshold = $20 × 20% = $4.00 (no excess fee here)
- Earnings above the threshold = $20 × 10% = $2.00 → excess markup fee = 50% × $2.00 = $1.00
- Platform fee (Standard) = 50% × $6.00 = $3.00
- Net earnings = $6.00 − $3.00 − $1.00 = **$2.00**

Importantly, **if you keep your markup at or below 20%, the excess markup fee does not apply.** The calculator models both fees so you can see exactly how different markup levels affect your net earnings for your account tier.

Pro tier artists are exempt from the excess markup fee entirely — they can set any markup without the 50% penalty.

## Should you raise or lower your markup?

The optimal markup depends on your account tier and competitive pricing on Redbubble:

For **Standard** accounts, raising markup above 20% is often counterproductive — the combined 50% platform fee plus 50% excess markup fee means only 25% of the excess earnings reach you. At 20% markup, you keep 50% of gross (the platform fee only applies). Staying at 20% and focusing on volume may be more effective.

For **Premium** accounts, exceeding 20% markup is slightly more viable — you keep 50% of the excess earnings after the excess fee, and 80% of earnings within the 20% threshold. But the excess markup fee still reduces the benefit significantly.

**Pro** accounts face no such constraints — artists in this tier can set higher markups and keep all earnings, giving them a major competitive and profitability advantage.

The default 20% markup is Redbubble's recommended starting point. Many artists price at exactly 20% to avoid the excess markup fee, relying on Redbubble's own promotional traffic rather than pricing competitively above the base.

## Comparing Redbubble to Printful and Printify.

The key difference between Redbubble and fulfilment-first POD platforms:

- **Printful / Printify**: You set any retail price, pay a base cost per order, and keep the difference. No platform percentage of your earnings. Your pricing and marketing drive all sales.
- **Redbubble**: You set a markup % (not a free retail price), and Redbubble handles marketing, customer acquisition, and fulfilment. In return, Redbubble takes a significant share of your earnings via the account tier fee. You trade higher margin control for marketplace exposure.

For many artists, Redbubble is attractive because Redbubble brings the buyers — you upload designs and Redbubble's organic traffic sells them. For higher-volume sellers, the tier fee can be substantial. The calculator above lets you model which scenario gives you the best net outcome.

## Accuracy and what this calculator does not cover.

This calculator models the per-sale Redbubble earnings calculation: gross markup earnings, minus account-tier platform fee, minus excess markup fee (if applicable). It does not account for: the $150/month fee cap (a monthly aggregate benefit that reduces fees above the cap); Redbubble's promotional discounts on product prices that may temporarily reduce earnings; currency conversion if you are based outside the US (Redbubble pays in your local currency); or any taxes on your Redbubble income (consult a local tax adviser). For the most complete view of your Redbubble income, multiply your per-sale net earnings by your expected monthly sale volume.`,

  workedExample: {
    scenario:
      "You are on the Standard tier. You sell a classic T-shirt with a $20 base price at a 20% markup.",
    steps: [
      { label: "Base price (set by Redbubble)", value: "$20.00" },
      { label: "Your markup", value: "20%" },
      { label: "Retail price (base × 1.20)", value: "$24.00" },
      { label: "Gross earnings (base × 20%)", value: "$4.00" },
      { label: "Excess markup fee (markup ≤ 20% → none)", value: "$0.00" },
      { label: "Platform fee (Standard: 50% × $4.00)", value: "−$2.00" },
    ],
    result: "Net earnings = $2.00 (8.33% of the $24 retail price)",
  },

  faqs: [
    {
      q: "How does Redbubble calculate my earnings?",
      a: "Your gross earnings per sale = Redbubble's base price × your markup %. For example, a $20 base price with a 20% markup earns you $4 gross. From that, Redbubble deducts your account tier's platform fee (50% for Standard, 20% for Premium, 0% for Pro) and — if your markup exceeds 20% — an excess markup fee of 50% on any earnings above the 20% threshold. Your net earnings are what remains after those deductions.",
    },
    {
      q: "What is the default Redbubble markup percentage?",
      a: "Redbubble sets a default markup of 20% for new accounts. This is also the threshold below which the excess markup fee does not apply. You can change your markup at any time on the Product Pricing page in your Redbubble dashboard. You can set it higher or lower, but be aware that markups above 20% trigger an excess markup fee for Standard and Premium accounts.",
    },
    {
      q: "What are Redbubble's account tiers and how do they affect earnings?",
      a: "Redbubble introduced three tiers in September 2025. Standard accounts pay 50% of their gross monthly earnings as a platform fee — the least favourable for profitability. Premium accounts pay 20% of gross monthly earnings. Pro accounts pay 0% — no platform fee and no excess markup fee. Tier upgrades are based on sales performance and account engagement; Redbubble notifies artists of tier changes by email.",
    },
    {
      q: "What is the excess markup fee?",
      a: "The excess markup fee is charged to Standard and Premium artists who set a product markup above 20%. It equals 50% of the earnings generated by any markup percentage above the 20% threshold. For example, at a 30% markup on a $20 base, the extra 10% earns $2 — and the excess markup fee is 50% × $2 = $1. The fee is applied per sale, on top of the account tier platform fee. Pro artists are exempt from this fee entirely.",
    },
    {
      q: "Is there a maximum fee Redbubble charges per month?",
      a: "Yes. Combined account fees (platform fee + excess markup fee) are capped at $150 per payment period for Standard and Premium accounts. This means high-volume sellers in those tiers stop accruing fees once the cap is reached in a given month. This per-month cap cannot be modelled in a per-sale calculator — the figures shown here assume you are below the monthly cap.",
    },
    {
      q: "Should I set my Redbubble markup above or below 20%?",
      a: "For Standard and Premium accounts, staying at or below 20% avoids the excess markup fee entirely, meaning only the tier's platform fee applies to your earnings. Raising markup above 20% increases gross earnings but the excess markup fee (50% on earnings above the threshold) eats heavily into the gain — especially combined with the 50% Standard tier fee. For Pro accounts, there is no excess markup fee, so higher markups are fully profitable. Use this calculator to compare net earnings at different markup levels for your tier.",
    },
    {
      q: "How is Redbubble different from Printful or Printify for profit?",
      a: "Printful and Printify are fulfilment platforms where you set any retail price, pay a per-order base/product cost, and keep the full difference — no platform percentage of your revenue. Redbubble is a marketplace where Redbubble sets the base price, you set a markup %, and Redbubble takes a significant platform fee from your earnings in return for handling production, fulfilment, and customer acquisition through their marketplace. Redbubble's model trades control and margin for Redbubble's built-in traffic.",
    },
    {
      q: "Does this calculator include shipping or VAT?",
      a: "No. Redbubble handles all shipping and charges buyers for it separately at checkout — it is not part of the artist earnings calculation. VAT and other sales taxes are also handled by Redbubble for applicable transactions. Your earnings (gross and net) are unaffected by shipping costs. If you pay income tax on your Redbubble earnings, consult a local tax adviser for guidance on how to report and pay that.",
    },
  ],

  related: [
    "printful-profit-calculator",
    "printify-profit-calculator",
    "teespring-profit-calculator",
    "etsy-fee-calculator",
  ],

  sources: [
    {
      label: "Redbubble — How is my payment calculated?",
      url: "https://help.redbubble.com/hc/en-us/articles/202270799-How-is-my-payment-calculated",
    },
    {
      label: "Redbubble — How does my Account Tier determine my platform fee?",
      url: "https://help.redbubble.com/hc/en-us/articles/50959863016724-How-does-my-Account-Tier-determine-my-platform-fee",
    },
    {
      label: "Redbubble — What is the excess markup fee?",
      url: "https://help.redbubble.com/hc/en-us/articles/50959535480212-What-is-the-excess-markup-fee",
    },
    {
      label: "Redbubble Help — What are Redbubble's account fees?",
      url: "https://help.redbubble.com/hc/en-us/articles/4412593541908-What-are-Redbubble-s-account-fees",
    },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
