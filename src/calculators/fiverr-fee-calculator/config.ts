import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { fiverrFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const fiverrFeeCalculator: CalculatorConfig = {
  slug: "fiverr-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "fiverr",
  title: "Fiverr Fee Calculator",
  metaDescription:
    "Free Fiverr fee calculator. See exactly how much Fiverr takes (20% seller commission) and what you keep. Includes buyer service fee breakdown and small order fee. Instant, accurate, 2026 rates.",
  h1: "Fiverr Fee Calculator",
  intro:
    "Calculate exactly what Fiverr takes from your order and what you keep as a seller. Enter your order amount to see Fiverr's 20% commission deducted and your net payout. Toggle buyer fees to see what your client pays on top — including the 5.5% service fee and the $3 small order fee on orders under $100.",

  keywords: {
    primary: "fiverr fee calculator",
    secondary: [
      "fiverr fees calculator",
      "fiverr fees",
      "fiverr seller fees",
      "fiverr 20% calculator",
      "fiverr commission calculator",
      "calculate fiverr fees",
      "fiverr payout calculator",
      "fiverr earnings calculator",
    ],
    longTail: [
      "how much does fiverr take",
      "how much does fiverr take from sellers",
      "what percentage does fiverr take",
      "fiverr 20 percent fee",
      "fiverr buyer service fee",
      "fiverr small order fee",
      "fiverr fees on $100",
      "fiverr fees on $50",
      "how much does fiverr charge buyers",
      "fiverr fee breakdown",
      "fiverr net payout calculator",
      "fiverr service fee percentage",
      "fiverr seller commission 2026",
      "how to calculate fiverr earnings",
      "fiverr fee calculator philippines",
      "fiverr fee calculator pakistan",
      "fiverr fee calculator india",
      "fiverr fee calculator bangladesh",
      "fiverr fee calculator nigeria",
      "fiverr fee calculator ukraine",
      "fiverr freelancer fee calculator",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "orderAmount",
      label: "Order amount",
      type: "currency",
      default: 100,
      min: 0,
      help: "The gig price the buyer pays (before buyer service fees). Fiverr takes 20% of this as the seller commission.",
    },
    {
      id: "showBuyerFees",
      label: "Show buyer total (what the client pays)",
      type: "toggle",
      default: false,
      help: "Toggle to see the buyer-side service fee (5.5%) and small order fee ($3 on orders under $100) added on top.",
    },
    {
      id: "itemCost",
      label: "Your cost / time value (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "Optional: enter your cost or the value of your time to see your real profit after Fiverr's cut.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const orderAmount = Math.max(0, Number(values.orderAmount) || 0);
    const showBuyer = Boolean(values.showBuyerFees);
    const itemCost = Math.max(0, Number(values.itemCost) || 0);

    // Seller side: Fiverr takes 20% commission; no separate processing fee on the platform level
    const r = computeMarketplaceFee({
      itemPrice: orderAmount,
      feeOnShipping: false,
      sellingPercent: fiverrFees.sellerCommissionPercent,
      itemCost,
    });

    // Buyer side (informational only — what client pays on top)
    const buyerServiceFee = +(orderAmount * (fiverrFees.buyerServicePercent / 100)).toFixed(2);
    const smallOrderFee = orderAmount < fiverrFees.buyerSmallOrderThreshold
      ? fiverrFees.buyerSmallOrderFee
      : 0;
    const buyerTotalAmount = +(orderAmount + buyerServiceFee + smallOrderFee).toFixed(2);

    const hasCost = itemCost > 0;

    return {
      headline: {
        label: hasCost ? "Your profit after Fiverr's cut" : "You keep",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Fiverr takes ${ctx.formatPercent(fiverrFees.sellerCommissionPercent)} (${ctx.formatCurrency(r.sellingFee)}) of your ${ctx.formatCurrency(orderAmount)} order`,
      },
      rows: [
        {
          label: "Order amount",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `Fiverr seller commission (${ctx.formatPercent(fiverrFees.sellerCommissionPercent)})`,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
        },
        {
          label: "You keep",
          display: ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasCost
          ? [
              {
                label: "Cost / time value",
                display: ctx.formatCurrency(itemCost),
                kind: "deduction" as const,
              },
              {
                label: "Profit after cost",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
        ...(showBuyer
          ? [
              {
                label: "— Buyer side (what your client pays) —",
                display: "",
              },
              {
                label: "Order price",
                display: ctx.formatCurrency(orderAmount),
              },
              {
                label: `Buyer service fee (${ctx.formatPercent(fiverrFees.buyerServicePercent)})`,
                display: ctx.formatCurrency(buyerServiceFee),
                kind: "deduction" as const,
              },
              ...(smallOrderFee > 0
                ? [
                    {
                      label: `Small order fee (orders under $${fiverrFees.buyerSmallOrderThreshold})`,
                      display: ctx.formatCurrency(smallOrderFee),
                      kind: "deduction" as const,
                      hint: "Fiverr charges buyers a $3 fixed fee on orders under $100.",
                    },
                  ]
                : []),
              {
                label: "Client pays in total",
                display: ctx.formatCurrency(buyerTotalAmount),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Fiverr charges sellers a flat 20% commission on every completed order, including add-ons and tips. There are no volume tiers or seller-level discounts — every freelancer on the platform pays the same 20% rate. If you complete a $100 gig, Fiverr keeps $20 and you receive $80.\n\nBuyers pay a separate service fee on top of the order price. The buyer service fee is 5.5% of the order amount on all orders. For orders under $100, Fiverr also adds a $3 small order fee. So a buyer placing a $50 order pays $50 + $2.75 + $3 = $55.75 in total, but you as the seller still receive 80% of the $50 order price — which is $40.\n\nWithdrawal fees are separate from platform fees and vary by payment method: bank transfer costs $1 per withdrawal, the Fiverr Revenue Card costs $3 per withdrawal, and PayPal withdrawal from Fiverr is free (though PayPal may charge its own currency conversion fees).",

  seoContent: `Our Fiverr fee calculator is a free tool that shows exactly how much Fiverr takes from each order and what you keep as a seller. Fiverr is the world's largest freelance marketplace, serving millions of buyers and sellers across design, writing, programming, marketing, video, and virtually every creative or digital service. Understanding Fiverr's fee structure is essential for pricing your gigs correctly and knowing your real take-home income before you accept work.

## How Fiverr's 20% seller commission works.

Fiverr charges a flat 20% service fee on every completed order — no exceptions, no volume tiers. If a buyer places a $100 order, Fiverr deducts $20 and you receive $80. This rate applies to the base gig price, any extra services (fast delivery, additional revisions, extra deliverables), and tips. There is no upper limit and no minimum that changes the rate — the commission is always 20%.

This is one of the highest seller commissions among major freelance platforms. Upwork charges 10% (currently a variable 0–15%), and older platforms used graduated rates that rewarded high-volume sellers with lower fees. Fiverr has maintained its flat 20% rate since its early days, arguing that the platform's massive buyer base justifies the cost.

For international sellers in the Philippines, Pakistan, Bangladesh, India, Nigeria, Ukraine, and other high-freelancer markets, the 20% rate means careful pricing is critical. If the going market rate for a service is $25, keeping $20 requires pricing at $31.25. This calculator helps you work that maths in reverse: enter what you want to keep and adjust until the payout matches your target.

## What buyers pay on top of your order price.

Fiverr charges buyers a separate service fee that you as the seller never see — it is added on top of your gig price. The buyer service fee is 5.5% of the order amount on all orders. For orders priced under $100, Fiverr also adds a $3 small order fee.

A buyer placing a $30 order for your logo design pays: $30 + $1.65 (5.5%) + $3 (small order fee) = $34.65. You receive 80% of $30 = $24. Fiverr keeps its 20% ($6) plus earns the buyer-side service fees. Toggle the "show buyer total" option in the calculator above to see the full buyer breakdown for any order amount.

The small order fee changed in June 2023: it was previously $2 on orders under $50. Fiverr raised it to $3 on orders under $100 at that time. Any source still showing the old $2 / $50 figures is outdated. The $3 / $100 threshold is the current (2026) structure.

## How to price your Fiverr gigs to hit a take-home target.

To net a specific amount, divide your target payout by 0.80. Want to keep $80? Price the order at $100 (80 ÷ 0.8 = 100). Want to keep $40? Price at $50. The formula is simple because the rate is flat.

For gigs that require materials or software costs, add your costs to the net amount first, then divide by 0.80. If a project costs you $20 in software and you want to profit $100, you need to keep $120 after Fiverr's cut — meaning you should price the gig at $150. Use the optional cost field in the calculator above to model this automatically.

## Fiverr vs. other freelance platforms.

Fiverr's 20% flat commission is higher than most competing platforms when compared directly. Upwork's current (2026) model is a variable 0–15% per contract, with 10% being the most common rate. Traditional agency platforms and direct client relationships carry no platform fees at all, but come with the cost of finding clients yourself.

The trade-off Fiverr offers is access to its massive buyer pool. For freelancers early in their career or those with productized, packaged services (logo packs, social media templates, voiceovers), Fiverr's marketplace discovery can outweigh the higher commission. For established freelancers with repeat clients or high hourly rates, the 20% cut becomes more painful and moving clients off-platform or using lower-fee alternatives becomes more attractive.

## Freelancers in the Philippines, Pakistan, India, Bangladesh, Nigeria, and Ukraine.

Fiverr has enormous freelancer communities in countries where the platform represents a significant income source relative to local wages. For sellers in these markets, even small differences in the effective take-home rate matter a great deal.

The 20% commission is the same worldwide — there are no country-specific discounts or regional plans. The calculator above helps sellers in any country quickly see their net payout in USD and decide whether a given order price makes sense for their situation.`,

  workedExample: {
    scenario: "You complete a $100 Fiverr order (logo design, web development, copywriting, or any service).",
    steps: [
      { label: "Order amount", value: "$100.00" },
      { label: "Fiverr seller commission (20%)", value: "−$20.00" },
      { label: "You keep", value: "$80.00" },
      { label: "— Buyer side (what the client paid) —", value: "" },
      { label: "Order price", value: "$100.00" },
      { label: "Buyer service fee (5.5%)", value: "+$5.50" },
      { label: "Small order fee (orders under $100)", value: "$0 (order is $100, not under threshold)" },
      { label: "Client paid in total", value: "$105.50" },
    ],
    result: "You keep $80.00; your client paid $105.50",
  },

  faqs: [
    {
      q: "How much does Fiverr take from sellers?",
      a: "Fiverr charges a flat 20% commission on every completed order, including add-ons and tips. This means sellers always keep 80% of the order amount. On a $100 order, Fiverr takes $20 and you receive $80. The 20% rate applies to all sellers equally — there are no volume tiers or seller-level discounts.",
    },
    {
      q: "What is the Fiverr buyer service fee?",
      a: "Buyers pay a 5.5% service fee on all orders, added on top of the seller's gig price. On orders under $100, Fiverr also adds a $3 small order fee. So a buyer placing a $50 order pays $50 + $2.75 (5.5%) + $3 (small order fee) = $55.75 total. Orders of $100 or more do not incur the $3 small order fee — only the 5.5% applies.",
    },
    {
      q: "What is the Fiverr small order fee?",
      a: "The small order fee is a fixed $3 charge added to buyers' orders under $100 USD. It is a buyer-side fee — sellers do not pay it and it does not reduce their payout. The threshold is $100: orders of exactly $100 or more are not subject to the small order fee. This fee was changed in June 2023 from $2 (on orders under $50) to the current $3 on orders under $100.",
    },
    {
      q: "Does Fiverr take 20% from tips?",
      a: "Yes. Fiverr's 20% commission applies to tips as well as the base order price and any extras. If a buyer tips you $20, Fiverr keeps $4 and you receive $16. This is one aspect of Fiverr's fee policy that surprises many new sellers — the commission is on your total earnings per order, not just the listed price.",
    },
    {
      q: "How do I calculate my take-home pay on Fiverr?",
      a: "Multiply the order amount by 0.80 (or subtract 20%). For a $150 order: $150 × 0.80 = $120. To reverse-engineer a price from a target payout, divide your target by 0.80: want to keep $100? Price the order at $125. The calculator above does this automatically — just enter your order amount.",
    },
    {
      q: "Are there withdrawal fees on Fiverr?",
      a: "Yes, but these are separate from the per-order commission and depend on your payment method. Bank transfers cost $1 per withdrawal. The Fiverr Revenue Card costs $3 per withdrawal. PayPal withdrawals from Fiverr are free on Fiverr's side, though PayPal may charge currency conversion fees if you're withdrawing in a non-USD currency. This calculator models the per-order commission only, not withdrawal fees.",
    },
    {
      q: "Does Fiverr charge differently for freelancers in India, Pakistan, the Philippines, or Nigeria?",
      a: "No — Fiverr's 20% seller commission is the same worldwide. There are no country-specific rates, regional plans, or local currency adjustments to the platform fee. The commission is always 20% of the order price in USD, regardless of where you're located. Withdrawal fees can vary by country depending on available payment methods, but the platform commission itself is uniform globally.",
    },
  ],

  related: [
    "upwork-fee-calculator",
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "wise-fee-calculator",
  ],

  sources: [
    {
      label: "Fiverr — Payment Terms of Service (20% seller commission)",
      url: "https://www.fiverr.com/legal-portal/legal-terms/payment-terms-of-service",
    },
    {
      label: "Fiverr Help — What is the service fee? (seller)",
      url: "https://help.fiverr.com/hc/en-us/articles/360011028477",
    },
    {
      label: "Fiverr Help — Buyer fees: what are they?",
      url: "https://help.fiverr.com/hc/en-us/articles/360010359797",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-15",
};
