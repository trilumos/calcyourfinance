import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { mercariFeesUS, mercariFeesJP } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

const COUNTRIES = ["US", "JP"] as const;

export const mercariFeeCalculator: CalculatorConfig = {
  slug: "mercari-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "mercari",
  title: "Mercari Fee Calculator",
  metaDescription:
    "Free Mercari fee calculator. See exactly what Mercari charges sellers (10% selling fee, US and Japan), your payout after fees, and what the buyer pays in Buyer Protection fees — updated for 2025.",
  h1: "Mercari Fee Calculator",
  intro:
    "Calculate Mercari seller fees and see your exact payout. Mercari charges sellers a 10% selling fee on the item price plus any buyer-paid shipping — enter your numbers to see the deduction and what you keep. The buyer pays a separate 3.6% Buyer Protection fee on top of your listing price (US); add your item cost to see profit.",

  keywords: {
    primary: "mercari fee calculator",
    secondary: [
      "mercari fees calculator",
      "mercari selling fees",
      "mercari seller fees",
      "mercari fee calculator 2025",
      "mercari payout calculator",
      "mercari profit calculator",
      "calculate mercari fees",
      "mercari charges calculator",
    ],
    longTail: [
      "how much does mercari take",
      "what percentage does mercari take",
      "mercari fees on $100",
      "mercari fees on $50",
      "does mercari charge seller fees",
      "mercari seller fee percentage",
      "mercari buyer protection fee",
      "mercari fee calculator japan",
      "mercari selling fee 10 percent",
      "mercari take rate",
      "how to calculate mercari fees",
      "mercari fee 2024 change",
      "mercari vs poshmark fees",
      "mercari vs ebay fees",
      "mercari fee calculator uk",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: [...COUNTRIES], default: "US" },

  inputs: [
    {
      id: "itemPrice",
      label: "Item price (your listing price)",
      type: "currency",
      default: 100,
      min: 0,
      help: "The price you list the item for. Mercari's 10% selling fee is applied to this amount plus any buyer-paid shipping.",
    },
    {
      id: "shipping",
      label: "Shipping charged to buyer",
      type: "currency",
      default: 0,
      min: 0,
      help: "Shipping your buyer pays. Mercari's selling fee applies to shipping too when the buyer pays it separately.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you paid for the item — to calculate your actual profit after fees.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const isUS = (ctx.country ?? "US") === "US";
    const fees = isUS ? mercariFeesUS : mercariFeesJP;

    const itemPrice = Number(values.itemPrice) || 0;
    const shipping = Number(values.shipping) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const hasCost = itemCost > 0;

    const r = computeMarketplaceFee({
      itemPrice,
      shipping,
      itemCost,
      feeOnShipping: true,
      sellingPercent: fees.sellingPercent,
      processingPercent: 0,
      processingFixed: 0,
    });

    // US only: compute buyer-side Buyer Protection fee (informational — does NOT
    // reduce seller payout). Buyer pays this on top of your listed price.
    const buyerProtectionPercent = isUS ? (fees.buyerProtectionPercent ?? 0) : 0;
    const buyerFee = isUS
      ? Math.round(r.revenue * (buyerProtectionPercent / 100) * 100) / 100
      : 0;
    const buyerTotal = isUS ? Math.round((r.revenue + buyerFee) * 100) / 100 : 0;

    const rows: CalcResult["rows"] = [
      {
        label: "Your listed price (item + shipping)",
        display: ctx.formatCurrency(r.revenue),
      },
      {
        label: `Mercari selling fee (${ctx.formatPercent(fees.sellingPercent)})`,
        display: ctx.formatCurrency(r.sellingFee),
        kind: "deduction",
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
    ];

    // US: append informational buyer-fee rows (clearly separated)
    if (isUS && r.revenue > 0) {
      rows.push({
        label: `Buyer Protection fee (${ctx.formatPercent(buyerProtectionPercent)} — paid by buyer, not deducted from you)`,
        display: ctx.formatCurrency(buyerFee),
        kind: "muted",
        hint: "This fee is added to your listing price by Mercari when the buyer checks out. It does not reduce your payout.",
      });
      rows.push({
        label: "Total buyer pays",
        display: ctx.formatCurrency(buyerTotal),
        kind: "muted",
      });
    }

    return {
      headline: {
        label: hasCost ? "Profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? r.profit : r.payout),
        sub: `Mercari takes ${ctx.formatPercent(r.takeRatePercent)} of your ${ctx.formatCurrency(r.revenue)} listing price`,
      },
      rows,
    };
  },

  howItWorks:
    "Mercari's current fee structure (effective January 6, 2025) charges sellers a flat 10% selling fee on the total amount the buyer pays for the item plus any shipping you charge. There is no separate payment processing fee for sellers — Mercari removed that charge in January 2025. On a $100 listing with no separate shipping, your payout is $90. On a $100 item with $10 shipping (buyer pays shipping), your revenue is $110 and your selling fee is $11, leaving you $99.\n\nSeparately, the buyer pays a 3.6% Buyer Protection fee that Mercari adds on top of your listed price at checkout. This fee does not come out of your payout — it is an extra charge the buyer pays. On your $100 item, the buyer is charged $103.60 total. Your payout is still $90 regardless of what the buyer pays.\n\nMercari Japan charges sellers the same 10% selling fee on the sale price, with no separate buyer fee modelled here (Japan buyers can incur surcharges for convenience store or ATM payment methods, but standard purchases are unaffected).",

  seoContent: `Our Mercari fee calculator is a free tool that shows exactly what Mercari deducts from your sale and how much money you actually keep. Mercari's fee model has changed significantly over the past two years, and many sellers are still working from outdated figures. This calculator reflects the current structure and explains the buyer-vs-seller fee split clearly so you can price your listings to hit your target payout.

## Does Mercari charge sellers fees?

Yes — Mercari charges US sellers a 10% selling fee on every completed sale. This is applied to the item price plus any shipping the buyer pays separately. On a $100 item, you receive $90. There is no separate payment processing fee for sellers; Mercari removed that charge effective January 6, 2025.

A common source of confusion is the 2024 experiment: between March 27, 2024 and January 5, 2025, Mercari ran a zero-seller-fee program where sellers paid no selling fee at all and buyers paid a $0.50 + 2.9% processing fee. That period ended. Since January 6, 2025, the 10% seller fee is back, alongside a new lower 3.6% Buyer Protection fee paid by the buyer.

## How Mercari's 10% selling fee works.

The selling fee is a flat 10% on the total the buyer pays for your item — including any buyer-paid shipping. If you list an item for $80 and charge $20 shipping, your revenue is $100 and Mercari takes $10, leaving you $90. If you offer free shipping and list the item at $100, the math is identical: Mercari takes $10 and you keep $90.

There is no minimum fee, no cap, and no category-based variation. Every seller on Mercari US pays 10% regardless of what category they sell in or how much experience they have. This simplicity makes Mercari easier to price for than platforms like eBay (which has tiered rates by category) or Etsy (which stacks a transaction fee, listing fee, and payment processing fee).

## What is the Mercari Buyer Protection fee?

The Buyer Protection fee is a 3.6% charge that Mercari adds to your listing price when the buyer checks out. The buyer pays it — it is not deducted from your payout. On a $100 listing, the buyer is charged $103.60. Your payout remains $90 regardless of what the buyer pays.

This fee replaced the old buyer-side payment processing fee ($0.50 + 2.9%) that Mercari introduced during its 2024 zero-seller-fee experiment. The new 3.6% Buyer Protection fee is slightly lower than the old combined buyer fee on most sale values, while the seller fee was reinstated at 10%.

The calculator shows the Buyer Protection fee as informational rows (clearly marked as paid by the buyer) so you understand the full picture of what a buyer sees at checkout — but these rows do not affect your payout calculation.

## What does Mercari take on $100?

On a $100 sale with no separate shipping, Mercari takes $10 from the seller (10%) and charges the buyer an additional $3.60 Buyer Protection fee. The seller receives $90; the buyer pays $103.60 total. If you entered your item cost, the calculator shows your profit after subtracting what you paid for the item.

## Mercari fees on common sale prices.

| Sale price | Mercari fee (seller) | Your payout | Buyer pays total |
|-----------|---------------------|-------------|-----------------|
| $20       | $2.00               | $18.00      | $20.72          |
| $50       | $5.00               | $45.00      | $51.80          |
| $100      | $10.00              | $90.00      | $103.60         |
| $200      | $20.00              | $180.00     | $207.20         |
| $500      | $50.00              | $450.00     | $518.00         |

## Mercari Japan: same 10% seller fee.

Mercari's Japanese marketplace (jp.mercari.com) also charges sellers a 10% selling fee on the sale price, deducted when the transaction completes. The calculator supports Japan (JPY) as a country option. Note that Japanese buyers may incur a convenience store / ATM payment surcharge (from ¥100 to ¥880 depending on the amount), but this does not affect the seller's 10% fee or payout.

## From payout to real profit.

Payout is not the same as profit. If you bought an item for $60 and sold it for $100 on Mercari, your payout is $90 but your profit is only $30 ($90 − $60 cost). Enter your item cost in the optional field and the calculator shows your gross profit. This is the number that matters for anyone reselling, thrifting, or running a casual side business.

## Accuracy and what this calculator covers.

Every rate in this calculator is taken from Mercari's official US help center and verified on 2026-06-12. The 10% seller selling fee and 3.6% Buyer Protection fee are the two fees that apply to all standard US Mercari transactions. Other costs exist that this calculator does not model: Instant Pay cash-out carries a $3 fee (standard ACH withdrawal is free once per day); excessive seller cancellations can trigger a cancellation penalty; and authentication listing fees apply to eligible luxury items. For the vast majority of casual and regular sellers, the 10% selling fee shown here is the only deduction from your sale proceeds. Check the sources linked below and your Mercari account for the complete picture.`,

  workedExample: {
    scenario: "You sell a $100 item on Mercari US with no separate shipping.",
    steps: [
      { label: "Your listing price", value: "$100.00" },
      { label: "Mercari selling fee (10%)", value: "$10.00" },
      { label: "You receive", value: "$90.00" },
      { label: "Buyer Protection fee (3.6%, paid by buyer)", value: "$3.60" },
      { label: "Total the buyer pays", value: "$103.60" },
    ],
    result: "You receive $90.00",
  },

  faqs: [
    {
      q: "Does Mercari charge seller fees?",
      a: "Yes. As of January 6, 2025, Mercari charges US sellers a 10% selling fee on the completed item price plus any buyer-paid shipping. There is no separate payment processing fee for sellers — that was eliminated in January 2025. On a $100 sale you receive $90.",
    },
    {
      q: "How much does Mercari take from a sale?",
      a: "Mercari takes 10% of your listed price (item price + buyer-paid shipping) as a selling fee. On a $50 sale you keep $45; on a $100 sale you keep $90; on a $200 sale you keep $180. The buyer also pays a separate 3.6% Buyer Protection fee on top of your price, but that does not come out of your payout.",
    },
    {
      q: "What is Mercari's Buyer Protection fee?",
      a: "The Buyer Protection fee is 3.6% of your listing price (including buyer-paid shipping), charged to the buyer at checkout on top of your listed price. It is added by Mercari and does not reduce your payout. On a $100 listing, the buyer sees $103.60 at checkout and you still receive $90.",
    },
    {
      q: "Did Mercari remove seller fees?",
      a: "Briefly, yes — between March 27, 2024 and January 5, 2025, Mercari ran a zero-seller-fee experiment where sellers paid no selling fee. That experiment ended. Since January 6, 2025, Mercari charges sellers the 10% selling fee again. The buyer-side fee changed at the same time from $0.50 + 2.9% to the current 3.6% Buyer Protection fee.",
    },
    {
      q: "What are Mercari fees on $100?",
      a: "On a $100 listing with no separate shipping: Mercari deducts $10 (10% selling fee) and you receive $90. The buyer is charged $103.60 at checkout (your $100 plus the 3.6% Buyer Protection fee of $3.60 that Mercari adds). Use the calculator above to see the breakdown for any amount.",
    },
    {
      q: "Do Mercari fees apply to shipping?",
      a: "Yes — when the buyer pays for shipping separately, Mercari's 10% selling fee applies to both the item price and the buyer-paid shipping amount. If you offer free shipping and build the cost into your item price, the fee is the same in practice: 10% of whatever the buyer pays you.",
    },
    {
      q: "What are Mercari Japan fees?",
      a: "Mercari Japan (jp.mercari.com) charges sellers a 10% selling fee on the sale price, deducted automatically when the transaction completes. There is no listing fee. Select Japan in the country selector above to calculate fees in JPY.",
    },
  ],

  related: [
    "poshmark-fee-calculator",
    "ebay-fee-calculator",
    "etsy-fee-calculator",
    "reverb-fee-calculator",
  ],

  sources: [
    {
      label: "Mercari US — Fees on Mercari",
      url: "https://www.mercari.com/us/help_center/article/169/",
    },
    {
      label: "Mercari US — Changes to our fee structure (Jan 6, 2025)",
      url: "https://www.mercari.com/us/help_center/article/2517/",
    },
    {
      label: "Mercari US — FAQs about our new fee structure",
      url: "https://www.mercari.com/us/help_center/article/2518/",
    },
    {
      label: "Mercari Japan — メルカリの手数料 (Mercari Japan fees)",
      url: "https://help.jp.mercari.com/guide/articles/65/",
    },
  ],

  feesVerifiedOn: "2026-06-12",
  lastUpdated: "2026-06-12",
};
