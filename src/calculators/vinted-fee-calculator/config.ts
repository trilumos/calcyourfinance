import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { vintedFees } from "../../config/fees";
import { vintedRateCards } from "../../lib/rateCards";
import { computeVintedBuyerFee, computeVintedTransaction } from "./formula";
import type { CountryCode } from "../../lib/countries";

const COUNTRIES = ["GB", "FR", "DE", "NL", "BE", "ES", "IT", "AT", "IE", "PL"] as const;

export const vintedFeeCalculator: CalculatorConfig = {
  slug: "vinted-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "vinted",
  title: "Vinted Fee Calculator",
  metaDescription:
    "Free Vinted fee calculator. Vinted charges sellers zero fees — confirm what you keep (100% of your price) and calculate the Buyer Protection fee your buyer pays. Covers UK, France, Germany, Netherlands, Belgium, Spain, Italy, Austria, Ireland, Poland.",
  h1: "Vinted Fee Calculator",
  intro:
    "Vinted charges sellers no fees — you keep every penny of your listed price. This calculator confirms your full payout and shows the Buyer Protection fee that Vinted adds to your buyer's checkout total (paid entirely by the buyer, never deducted from you). Select your country, enter your item price, and see the complete picture.",

  keywords: {
    primary: "vinted fee calculator",
    secondary: [
      "vinted fees calculator",
      "vinted seller fees",
      "vinted fees",
      "vinted fee calculator uk",
      "vinted buyer protection fee",
      "does vinted charge sellers",
      "vinted payout calculator",
      "how much does vinted take",
    ],
    longTail: [
      "does vinted charge sellers any fees",
      "vinted buyer protection fee uk",
      "vinted buyer protection fee france",
      "vinted seller fee percentage",
      "vinted fee calculator germany",
      "vinted selling fees 2025",
      "vinted selling fees 2026",
      "how vinted buyer protection fee works",
      "vinted fees explained",
      "vinted take rate",
      "is vinted free to sell on",
      "vinted vs depop fees",
      "vinted vs poshmark fees",
      "vinted profit calculator",
    ],
    competition: "M",
    intent: "tool",
  },

  countries: { supported: [...COUNTRIES], default: "GB" },

  inputs: [
    {
      id: "itemPrice",
      label: "Your listing price",
      type: "currency",
      default: 20,
      min: 0,
      help: "The price you list the item for on Vinted. You receive this amount in full — Vinted charges you no selling fee.",
    },
    {
      id: "itemCost",
      label: "Your item cost (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "What you originally paid for the item — to calculate your profit after the sale. Leave at 0 if you don't know or it doesn't apply.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const country = (ctx.country ?? "GB") as CountryCode;
    const fees = vintedFees[country] ?? vintedFees.GB!;

    const itemPrice = Number(values.itemPrice) || 0;
    const itemCost = Number(values.itemCost) || 0;
    const hasCost = itemCost > 0;

    const result = computeVintedTransaction(itemPrice, itemCost, fees);

    const tierLabel = result.isHighValue
      ? `${fees.highValuePercent}% (high-value rate)`
      : `${fees.buyerProtectionPercent}% + ${ctx.formatCurrency(fees.buyerProtectionFixed)}`;

    const rows: CalcResult["rows"] = [
      {
        label: "Your listed price",
        display: ctx.formatCurrency(result.sellerPayout),
      },
      {
        label: "Vinted seller fee",
        display: ctx.formatCurrency(0),
        kind: "net",
        hint: "Vinted charges sellers nothing. You receive your full listed price.",
      },
      {
        label: "You receive",
        display: ctx.formatCurrency(result.sellerPayout),
        kind: "net",
      },
      ...(hasCost
        ? [
            {
              label: "Profit after item cost",
              display: ctx.formatCurrency(result.profit),
              kind: "net" as const,
            },
          ]
        : []),
    ];

    // Buyer side — clearly separated, clearly informational
    if (itemPrice > 0) {
      rows.push({
        label: `Buyer Protection fee (${tierLabel} — paid by buyer)`,
        display: ctx.formatCurrency(result.buyerFee),
        kind: "muted",
        hint: fees.dynamic
          ? "Vinted's UK Buyer Protection fee is dynamic and varies by item. This is a representative estimate (5% + £0.70). The exact fee is always shown at Vinted checkout before purchase."
          : "This fee is added to your listing price by Vinted when the buyer checks out. It does not reduce your payout.",
      });
      rows.push({
        label: "Total buyer pays",
        display: ctx.formatCurrency(result.buyerTotal),
        kind: "muted",
      });
    }

    return {
      headline: {
        label: hasCost ? "Your profit" : "You receive",
        display: ctx.formatCurrency(hasCost ? result.profit : result.sellerPayout),
        sub: "Vinted takes £0 from sellers — you keep 100% of your listed price",
      },
      rows,
    };
  },

  howItWorks:
    "Vinted operates a seller-free model: you list an item for a price, the buyer purchases it, and Vinted transfers the full listed price to you. There is no selling fee, no commission, and no payment processing fee deducted from sellers. A £20 listing pays you £20.\n\nInstead, Vinted charges the BUYER a Buyer Protection fee at checkout. This fee is calculated on the item price and added on top — the buyer sees the full total (item price + Buyer Protection fee) before completing the purchase. The fee is non-optional for buyers and covers purchase protection, secure payment escrow (Vinted holds the payment until you confirm delivery), and customer support for disputes.\n\nFor most European markets, the Buyer Protection fee is a fixed amount plus a percentage of your item price (e.g. €0.70 + 5% in France, Germany, and most EUR markets). For high-value items (€500 and above in EUR markets), only a lower percentage rate of 2% applies with no fixed fee. Poland uses PLN 2.90 + 5% (below PLN 2,500), or 2% above. The UK fee is dynamic and displayed at checkout per item.\n\nShipping is separate and is arranged between buyer and seller directly — it is not included in this calculator's Buyer Protection fee calculation.",

  seoContent: `Our Vinted fee calculator is a free tool that answers two of the most common questions sellers ask: "how much do I keep?" and "what does the buyer actually pay?" The answer to the first question is simple and constant — you keep 100% of your listed price, because Vinted charges sellers no fees at all. The second question is where this calculator helps, by computing the Buyer Protection fee that Vinted adds at buyer checkout.

## Does Vinted charge sellers any fees?

No. Vinted charges sellers absolutely zero fees. No selling commission, no listing fee, no payment processing fee, no withdrawal fee on the proceeds of your sale. If you list an item for £20 and it sells, you receive £20. If you list a jacket for €80 in France, you receive €80. This is Vinted's core model and the main reason it has grown to over 75 million registered members across Europe — sellers can price items to reflect their actual value without building in a platform cut.

This is in sharp contrast to platforms like Depop (0% in the US and UK but 3.3%+ processing), Poshmark (20% above the threshold), eBay (12.9–15% depending on category), and Etsy (6.5% transaction + listing + processing). The only cost to selling on Vinted is any time you choose to spend on optional paid features like "bumping" a listing to make it appear higher in search results.

## What is the Vinted Buyer Protection fee?

The Buyer Protection fee is a charge that Vinted adds to the buyer's checkout total — not to your payout. The buyer sees your listed price plus the Buyer Protection fee combined as their total before they confirm the purchase. The fee is mandatory for all Vinted transactions and covers three things: purchase protection (if an item arrives damaged, not as described, or doesn't arrive at all, the buyer receives a full refund via Vinted's resolution process); secure payment escrow (Vinted holds the buyer's payment during the transaction and only releases it to you after the buyer confirms receipt); and customer support (Vinted mediates any disputes between buyer and seller).

Because the fee is shown transparently at checkout, buyers know exactly what they're paying before committing. You cannot see the fee breakdown on your listing page — only the buyer sees it at checkout.

## Vinted Buyer Protection fee by country.

The Buyer Protection fee formula varies by market and currency. For most European countries using the Euro, the standard formula is €0.70 (fixed) plus 5% of your item price for items priced below €500. On a €20 item the buyer pays €1.70 in fees (€0.70 + €1.00), making their total €21.70. On a €100 item the buyer pays €5.70 (€0.70 + €5.00), making their total €105.70.

For high-value items priced at €500 or above, Vinted switches to a simpler 2% rate with no fixed fee. On a €500 item the buyer pays €10.00 in fees (2%), making their total €510. On a €1,000 item they pay €20.00 (2%), making their total €1,020.

Poland uses the same percentage structure (5% standard, 2% high-value) with a fixed amount of PLN 2.90 instead of €0.70, and a high-value threshold of approximately PLN 2,500.

For the United Kingdom, Vinted's official pricelist describes the fee as "usually 3% to 8% + £0.30 to £0.80" — this is dynamic and algorithmic, meaning Vinted calculates the exact fee per listing at the time of purchase based on factors including the item price and category. The calculator shows a representative estimate of 5% + £0.70 (matching the EUR published rate) to give you a ballpark figure, but the precise amount is always clearly displayed at Vinted checkout before the buyer completes their purchase.

## Buyer Protection fee vs. Buyer Protection Pro.

Vinted also offers an optional "Buyer Protection Pro" upgrade that buyers can add for a higher fee in exchange for extended protection (longer dispute windows, etc.). This is optional and not included in this calculator's default calculation. The standard Buyer Protection fee described above applies to all normal transactions automatically.

## Vinted fees table: what the buyer pays.

| Item price (EUR) | Standard buyer fee (5% + €0.70) | High-value fee (2%) |
|-----------------|-------------------------------|---------------------|
| €5              | €0.95                         | —                   |
| €10             | €1.20                         | —                   |
| €20             | €1.70                         | —                   |
| €50             | €3.20                         | —                   |
| €100            | €5.70                         | —                   |
| €200            | €10.70                        | —                   |
| €499            | €25.65                        | —                   |
| €500            | —                             | €10.00              |
| €1,000          | —                             | €20.00              |

All prices include VAT where applicable. Shipping costs are separate and set by the seller or Vinted's integrated parcel labels.

## Pricing your items on Vinted.

Because Vinted takes nothing from sellers, pricing is straightforward: your listed price is your payout. If you want to receive €30, list the item for €30. If you bought a jacket for €50 and want to break even, list it for €50. Use the optional item cost field in the calculator to see your profit margin.

The Buyer Protection fee is the buyer's concern, not yours — but understanding it helps you price competitively. A buyer comparing a €100 item on Vinted (they pay €105.70 including the Buyer Protection fee) with a £100 item on Depop UK (seller pays 0% selling fee but 2.9% + £0.30 processing; buyer pays no marketplace fee) is looking at different total costs. Understanding the full picture helps you frame your listings effectively.

## How Vinted makes money.

Vinted earns revenue from the Buyer Protection fee, from optional paid promotions (wardrobe spotlights, item bumps that temporarily increase listing visibility), and from Vinted Pro for businesses. The seller-free model is a deliberate strategy to attract supply — the more sellers list, the more buyers come, and the more Buyer Protection fees Vinted earns. As of 2026 the platform has over 75 million registered members across more than 18 countries in Europe and North America.

## Accuracy and what this calculator covers.

Verified on 2026-06-12 against Vinted's official pricelists and help pages. The zero-seller-fee model has been Vinted's core proposition since its European expansion and has not changed. The Buyer Protection fee structure (5% + fixed for EUR markets; 2% high-value tier) was confirmed from Vinted's global pricelist page and third-party sources including the French consumer publication blogmode.top, the retailed.io calculator, and the UOKiK (Polish consumer authority) regulatory case which specified the PLN 2.90 + 5% formula explicitly.

For UK: the dynamic nature of the fee (3–8% + £0.30–0.80 range) is documented on Vinted's official UK pricelist. Our 5% + £0.70 estimate is representative but the actual fee will always be shown at checkout. If you need the exact fee for a specific item, check the Vinted app or website directly.`,

  rateCards: {
    heading: "Vinted Buyer Protection fee by country",
    intro:
      "Sellers pay nothing. The Buyer Protection fee is paid by buyers and added on top of your listed price at checkout.",
    cards: vintedRateCards([...COUNTRIES]),
  },

  workedExample: {
    scenario: "You list a jacket for €50 on Vinted France. A buyer purchases it.",
    steps: [
      { label: "Your listed price", value: "€50.00" },
      { label: "Vinted seller fee", value: "€0.00" },
      { label: "You receive", value: "€50.00" },
      { label: "Buyer Protection fee (€0.70 + 5% = €3.20, paid by buyer)", value: "€3.20" },
      { label: "Total the buyer pays", value: "€53.20" },
    ],
    result: "You receive €50.00 — no deductions.",
  },

  faqs: [
    {
      q: "Does Vinted charge sellers any fees?",
      a: "No. Vinted charges sellers zero fees — no selling commission, no listing fee, no payment processing fee. You receive 100% of your listed price when an item sells. Vinted makes money by charging buyers a Buyer Protection fee at checkout instead.",
    },
    {
      q: "What is the Vinted Buyer Protection fee?",
      a: "The Buyer Protection fee is a charge Vinted adds to the buyer's checkout total. It is paid by the buyer and is not deducted from your payout. In EUR markets, the fee is €0.70 + 5% of the item price for items under €500, or 2% for items at €500 and above. In the UK the fee is dynamic (3–8% + £0.30–0.80 depending on the item) and is always shown exactly at checkout before the buyer confirms their purchase.",
    },
    {
      q: "How much does Vinted take from a sale?",
      a: "Vinted takes nothing from the seller. If you list an item for £20, you receive £20. If you list for €100, you receive €100. There is no deduction or commission. The Buyer Protection fee is added on top of your price at the buyer's checkout and is the buyer's cost, not yours.",
    },
    {
      q: "Is it free to sell on Vinted?",
      a: "Yes, selling on Vinted is free. There are no mandatory fees for sellers. Optional paid features exist — like bumping a listing to give it temporary visibility or running a wardrobe spotlight — but these are entirely optional and only relevant if you want to promote your listings. The act of listing and selling itself costs nothing.",
    },
    {
      q: "Does the Buyer Protection fee reduce what I receive?",
      a: "No. The Buyer Protection fee is paid by the buyer, on top of your listed price. It does not affect your payout in any way. When a buyer completes a purchase on your €50 listing, Vinted shows them a total of €53.20 (€50 + €3.20 Buyer Protection fee), and you receive €50. The fee is Vinted's revenue, collected from the buyer, not from you.",
    },
    {
      q: "How is the Vinted Buyer Protection fee calculated in the UK?",
      a: "Vinted UK's official pricelist states the fee is 'usually 3% to 8% + £0.30 to £0.80' and is dynamic — Vinted calculates it per listing at the time of purchase. The exact fee is always displayed at checkout before the buyer confirms. This calculator shows a representative estimate (5% + £0.70) consistent with the EUR formula, but for the precise amount on a specific item check the Vinted app directly.",
    },
    {
      q: "What is the high-value Buyer Protection fee on Vinted?",
      a: "For items priced at €500 or above (or the local-currency equivalent — PLN 2,500 in Poland, £500 in the UK estimate), Vinted applies a lower Buyer Protection fee of 2% of the item price with no fixed fee. This means a €500 item adds €10 to the buyer's total (2%), whereas a €499 item adds €25.65 (€0.70 + 5% × €499). The 2% tier reduces the proportional cost for buyers of higher-value items.",
    },
    {
      q: "What optional paid features does Vinted offer sellers?",
      a: "Vinted offers 'bumping' (temporarily boosting your listing's position in search results for 3 or 7 days, at a fee that varies by item price and duration) and 'wardrobe spotlights' (promoting your entire wardrobe to more buyers for a period). Both are optional and are only relevant if you want additional exposure. The fees for these features are shown at the time you choose to use them.",
    },
  ],

  related: [
    "depop-fee-calculator",
    "poshmark-fee-calculator",
    "etsy-fee-calculator",
  ],

  sources: [
    {
      label: "Vinted — Pricelist (global)",
      url: "https://www.vinted.com/pricelist",
    },
    {
      label: "Vinted UK — Price List",
      url: "https://www.vinted.co.uk/pricelist",
    },
    {
      label: "Vinted — Buyer Protection fee help article",
      url: "https://www.vinted.com/help/342-buyer-protection-fee-on-vinted",
    },
    {
      label: "Retailed.io — Vinted Fee Calculator (confirms tiered EUR structure)",
      url: "https://www.retailed.io/toolbox/vinted-fee-calculator",
    },
    {
      label: "UOKiK penalty case — Vinted Poland PLN fee confirmation (Newsendip, 2024)",
      url: "https://www.newsendip.com/vinted-fine-1-2-million-in-poland-for-a-lack-of-transparency-on-its-platform/",
    },
    {
      label: "Blogmode.top — Frais Vinted commission (FR: €0.70 + 5%)",
      url: "https://www.blogmode.top/frais-vinted-commission/",
    },
  ],

  feesVerifiedOn: "2026-06-12",
  lastUpdated: "2026-06-12",
};
