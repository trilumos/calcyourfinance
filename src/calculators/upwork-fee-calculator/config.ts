import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { upworkFees } from "../../config/fees";
import { computeMarketplaceFee } from "../_shared/marketplaceFee";

export const upworkFeeCalculator: CalculatorConfig = {
  slug: "upwork-fee-calculator",
  kind: "single",
  category: "ecommerce-fees",

  platform: "upwork",
  title: "Upwork Fee Calculator",
  metaDescription:
    "Free Upwork fee calculator. See exactly how much Upwork takes from your contract and what you keep. Supports the current variable 0–15% service fee (effective May 2025). Instant, accurate, 2026 rates.",
  h1: "Upwork Fee Calculator",
  intro:
    "Calculate your Upwork take-home pay after the platform's service fee. Since May 2025, Upwork charges a variable 0–15% freelancer service fee per contract — enter your contract rate and earnings to see your exact payout. Default is 10%, the most common rate observed in practice.",

  keywords: {
    primary: "upwork fee calculator",
    secondary: [
      "upwork fees calculator",
      "upwork fees",
      "upwork service fee",
      "upwork 10% fee",
      "upwork freelancer fees",
      "upwork commission calculator",
      "calculate upwork fees",
      "upwork payout calculator",
    ],
    longTail: [
      "how much does upwork take",
      "how much does upwork charge freelancers",
      "what percentage does upwork take",
      "upwork service fee percentage 2026",
      "upwork variable fee 2025",
      "upwork fee change 2025",
      "upwork 10 percent fee calculator",
      "upwork 15 percent fee calculator",
      "upwork earnings calculator",
      "upwork net pay calculator",
      "upwork freelancer take home pay",
      "upwork fee breakdown",
      "upwork service fee 0-15 percent",
      "upwork fee philippines",
      "upwork fee pakistan",
      "upwork fee india",
      "upwork fee bangladesh",
      "upwork fee nigeria",
      "upwork fee ukraine",
      "upwork freelancer fee calculator",
      "upwork vs fiverr fees comparison",
    ],
    competition: "M",
    intent: "tool",
  },

  inputs: [
    {
      id: "contractAmount",
      label: "Contract / earnings amount",
      type: "currency",
      default: 1000,
      min: 0,
      help: "The total amount billed to your client for this contract or milestone. Upwork's service fee is deducted from this.",
    },
    {
      id: "serviceFeePercent",
      label: "Your service fee rate (%)",
      type: "select",
      default: "10",
      options: [
        { value: "0",    label: "0% — zero-fee contract (rare; invited/specialty)" },
        { value: "5",    label: "5% — low rate (high-demand / scarce skills)" },
        { value: "10",   label: "10% — typical rate (most common)" },
        { value: "12.5", label: "12.5% — mid-range variable rate" },
        { value: "15",   label: "15% — high rate (high-supply categories)" },
      ],
      help: "Since May 2025, Upwork sets a variable fee per contract (0–15%). You see your exact rate before submitting a proposal. Default is 10%, the most commonly observed rate.",
    },
    {
      id: "expenses",
      label: "Expenses / cost of work (optional)",
      type: "currency",
      default: 0,
      min: 0,
      help: "Optional: enter any direct expenses (software, tools, subcontractors) to see your real profit after Upwork's fee and costs.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const contractAmount = Math.max(0, Number(values.contractAmount) || 0);
    const serviceFeePercent = Math.min(
      upworkFees.maxServiceFeePercent,
      Math.max(upworkFees.minServiceFeePercent, Number(values.serviceFeePercent) || upworkFees.defaultServiceFeePercent)
    );
    const expenses = Math.max(0, Number(values.expenses) || 0);

    const r = computeMarketplaceFee({
      itemPrice: contractAmount,
      feeOnShipping: false,
      sellingPercent: serviceFeePercent,
      itemCost: expenses,
    });

    const hasExpenses = expenses > 0;

    return {
      headline: {
        label: hasExpenses ? "Profit after Upwork's fee and expenses" : "You keep",
        display: ctx.formatCurrency(hasExpenses ? r.profit : r.payout),
        sub: `Upwork takes ${ctx.formatPercent(serviceFeePercent)} (${ctx.formatCurrency(r.sellingFee)}) from your ${ctx.formatCurrency(contractAmount)} contract`,
      },
      rows: [
        {
          label: "Contract amount",
          display: ctx.formatCurrency(r.revenue),
        },
        {
          label: `Upwork service fee (${ctx.formatPercent(serviceFeePercent)})`,
          display: ctx.formatCurrency(r.sellingFee),
          kind: "deduction",
        },
        {
          label: "You keep",
          display: ctx.formatCurrency(r.payout),
          kind: "net",
        },
        ...(hasExpenses
          ? [
              {
                label: "Expenses / cost of work",
                display: ctx.formatCurrency(expenses),
                kind: "deduction" as const,
              },
              {
                label: "Profit after expenses",
                display: ctx.formatCurrency(r.profit),
                kind: "net" as const,
              },
            ]
          : []),
      ],
    };
  },

  howItWorks:
    "Upwork charges freelancers a service fee that is deducted from each contract payment. Since May 1, 2025, this is a variable rate set per contract — ranging from 0% to 15%. Upwork's algorithm determines the fee at the proposal stage and locks it in for the contract's lifetime. You always see your exact rate before you submit a proposal or accept an offer.\n\nThe fee is based on factors like skill demand, market supply in your category, and project type. High-supply categories (virtual assistance, basic content writing, data entry) tend to attract higher rates, often 10–15%. Scarce or high-demand specialties (senior engineering, AI/ML, niche regulated work) may attract rates of 5–10% or occasionally 0% on invited contracts.\n\nBefore May 2025, Upwork used a flat 10% fee on all contracts (introduced in 2023). Before that, the platform used a sliding scale: 20% on the first $500 earned per client lifetime, 10% from $500 to $10,000, and 5% above $10,000. Contracts started before May 1, 2025 were grandfathered at their previous rate.\n\nClients also pay a 5% marketplace fee on top of what they pay freelancers (Basic plan, most common). This is not deducted from your earnings — it is paid by the client on top of your rate. Separate fees apply for Connects (proposals), withdrawals, and optional memberships, but these are not per-order deductions.",

  seoContent: `Our Upwork fee calculator is a free tool that shows exactly how much Upwork deducts from your contract earnings and what you keep. Upwork is one of the world's largest freelance platforms, used by millions of freelancers and clients worldwide across software development, design, writing, marketing, finance, and more. Understanding Upwork's fee structure is essential for setting competitive rates and knowing your real take-home income before you start a project.

## Upwork's current fee model: variable 0–15% (May 2025 change).

Upwork's freelancer service fee changed significantly on May 1, 2025. The previous flat 10% rate (in place since 2023) was replaced by a variable per-contract fee ranging from 0% to 15%. Your exact rate is determined by Upwork's algorithm at the time you submit a proposal or receive an offer, and it is locked in for the duration of that contract.

You always see your rate before committing — Upwork displays it on the proposal screen before you submit. This is an important practical difference from Fiverr's flat 20%: on Upwork, you know your exact cost before you take on work, and the rate can vary significantly depending on your category and the specific project.

Factors that influence your rate include the supply of available freelancers in your skill category, the demand for those skills among clients, the type of project, and how you were matched (direct invite vs. open proposal). High-supply categories like virtual assistance, content writing, and data entry tend to attract rates toward the higher end (10–15%). Scarce specialties like senior engineering, AI/ML development, and niche regulated fields may attract lower rates (5–10%), and invited contracts occasionally come with 0% fees.

## The history of Upwork's service fee.

**Pre-2023 (sliding scale):** Upwork used a tiered system based on lifetime earnings with each individual client: 20% on the first $500 earned with a client, 10% from $500 to $10,000, and 5% above $10,000. This rewarded long-term relationships with high-volume clients — a freelancer who built a sustained engagement could eventually pay only 5%.

**2023–April 2025 (flat 10%):** Upwork eliminated the sliding scale and introduced a flat 10% fee for all contracts, all freelancers. This simplified the math but removed the incentive for long-term client relationships.

**May 1, 2025–present (variable 0–15%):** The flat 10% was replaced by the current variable model. Contracts created before May 1, 2025 were grandfathered at the flat 10% rate for their remaining duration.

## How to use this calculator.

Enter your contract amount and select your service fee rate. If you have already submitted a proposal on Upwork, use the exact rate shown in your proposal screen. If you are estimating future work, use 10% as a conservative midpoint for most categories, or 15% if you work in a high-supply category like content writing or VA. Add any direct expenses in the optional field to see your real profit.

## Upwork vs. Fiverr: fee comparison.

Fiverr charges a flat 20% commission on all orders — simple and predictable, but high. Upwork's variable 0–15% is generally lower, but the actual rate depends on your category and can approach Fiverr's level (15%) for high-supply skills. For scarce, high-demand specialties, Upwork's lower rates (5–10%) make it meaningfully cheaper than Fiverr.

The deeper difference is the business model: Fiverr is a product marketplace where buyers browse and buy gigs; Upwork is a contract platform where clients post jobs and freelancers apply. Upwork also charges clients a separate 5% marketplace fee on top of your rate (Basic plan), which means the total platform cost to both parties is higher than the freelancer service fee alone.

## Other Upwork costs to factor in.

The service fee is the main per-contract deduction, but Upwork has other costs that affect your overall economics:

**Connects:** Upwork uses a virtual currency called Connects (each costs $0.15) to submit proposals. Each proposal costs 4–16 Connects depending on the job tier, meaning $0.60–$2.40 per bid. If you submit many proposals to win work, these costs add up.

**Withdrawal fees:** Wire transfers cost $30. ACH (US bank transfer) is generally free. PayPal charges Upwork's standard rate. Currency conversion adds up to 2%.

**Freelancer Plus membership:** $14.99–$19.99/month provides extra Connects, profile visibility, and rolling availability status. Not required, but some freelancers find it valuable for proposal volume.

None of these are modelled in this per-contract calculator, which focuses on the service fee deducted from your earnings.

## Freelancers in the Philippines, Pakistan, India, Bangladesh, Nigeria, and Ukraine.

Upwork has large freelancer communities in countries where the platform represents a major income source. For sellers in these markets, fee rates matter significantly. Upwork's variable rate applies to all freelancers regardless of location — there are no country-specific rates. The fee you see on your proposal screen is the fee you pay, whether you are in Manila, Lahore, Kyiv, Lagos, or Dhaka.

For freelancers withdrawing in local currencies, the currency conversion fee (up to 2%) is an additional cost on top of the service fee. Use the calculator above for your contract amount in USD and factor in conversion costs separately when planning your actual income.`,

  workedExample: {
    scenario: "You complete a $1,000 Upwork contract at the typical 10% service fee rate.",
    steps: [
      { label: "Contract amount", value: "$1,000.00" },
      { label: "Upwork service fee (10%)", value: "−$100.00" },
      { label: "You keep", value: "$900.00" },
      { label: "— At maximum rate (15%) —", value: "" },
      { label: "Upwork service fee (15%)", value: "−$150.00" },
      { label: "You keep at 15%", value: "$850.00" },
    ],
    result: "You keep $900.00 at 10% — or $850.00 at 15%",
  },

  faqs: [
    {
      q: "How much does Upwork take from freelancers in 2026?",
      a: "Since May 1, 2025, Upwork charges a variable service fee of 0–15% per contract. The rate is set by Upwork's algorithm when you submit a proposal and is locked in for that contract's lifetime. You can see the exact rate before submitting. The most common rate observed in practice is around 10%, though freelancers in high-supply categories (content writing, VA, data entry) often see 12–15%, while scarce specialists may get 5–10% or occasionally 0%.",
    },
    {
      q: "What happened to Upwork's flat 10% fee?",
      a: "Upwork introduced the flat 10% fee in 2023, replacing the old sliding scale (20%/10%/5%). That flat 10% was in place until April 30, 2025. On May 1, 2025, Upwork switched to the current variable 0–15% per-contract model. Contracts signed before May 1, 2025 were grandfathered at the flat 10% for their remaining duration.",
    },
    {
      q: "What was Upwork's old sliding scale fee structure?",
      a: "Before 2023, Upwork used a tiered sliding scale based on your lifetime earnings with each individual client: 20% on the first $500 earned with a client, 10% from $500 to $10,000, and 5% above $10,000. Long-term relationships with high-volume clients could eventually drop your effective rate to 5%. This structure was replaced by the flat 10% in 2023, which was then replaced by the variable model in May 2025.",
    },
    {
      q: "Do clients pay fees on Upwork too?",
      a: "Yes. Clients on Upwork's Basic plan (the most common) pay a 5% marketplace fee on all payments to freelancers. This is paid on top of your rate — it is not deducted from your earnings. So if you bill a client $1,000 and your service fee is 10%, you keep $900, and the client pays $1,000 + $50 (5%) = $1,050 total. Upwork Business Plus clients pay a higher 10% marketplace fee but with contract initiation fees waived.",
    },
    {
      q: "How do I find my exact Upwork service fee rate?",
      a: "Upwork shows your service fee for a specific contract on the proposal screen before you submit. It is also visible in the contract details once a contract is active. Since rates are set per contract, your rate can differ between different clients and projects. Check the proposal screen each time — do not assume your previous contract's rate will apply to new work.",
    },
    {
      q: "Does Upwork charge fees for Connects (proposals)?",
      a: "Yes, but Connects are separate from the service fee and not deducted from your contract earnings. Each Connect costs $0.15, and proposals require 4–16 Connects depending on the job level ($0.60–$2.40 per proposal). If you submit many proposals before landing work, these costs reduce your effective earnings. This calculator models the service fee only — factor Connects costs in separately if proposal volume is significant in your business.",
    },
    {
      q: "Is the Upwork fee the same for freelancers in the Philippines, Pakistan, India, Nigeria, and Ukraine?",
      a: "Yes — Upwork's service fee (0–15% variable) is the same for all freelancers globally. There are no country-specific rates. Your fee depends on your contract and skill category, not your location. Currency conversion costs (up to 2%) and withdrawal method fees are location-dependent and are not modelled in this calculator.",
    },
  ],

  related: [
    "fiverr-fee-calculator",
    "paypal-fee-calculator",
    "wise-fee-calculator",
    "stripe-fee-calculator",
  ],

  sources: [
    {
      label: "Upwork — Is Upwork Free? Pricing breakdown (0–15% service fee)",
      url: "https://www.upwork.com/resources/is-upwork-free",
    },
    {
      label: "Upwork — Learn about the Freelancer Service Fee",
      url: "https://support.upwork.com/hc/en-us/articles/211062538",
    },
    {
      label: "Upwork — Pricing and plans",
      url: "https://www.upwork.com/i/pricing/",
    },
  ],

  feesVerifiedOn: "2026-08-06",
  lastUpdated: "2026-06-15",
};
