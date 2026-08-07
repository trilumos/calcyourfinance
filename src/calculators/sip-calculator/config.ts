import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { sipFutureValue } from "../_shared/finance";

const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

export const sipCalculator: CalculatorConfig = {
  slug: "sip-calculator",
  kind: "single",
  category: "personal-finance",

  title: "SIP Calculator — Mutual Fund SIP Returns",
  metaDescription:
    "Free SIP calculator — estimate the future value of a monthly SIP investment. Enter your monthly amount, expected annual return, and time period to see your projected corpus, total invested, and estimated returns.",
  h1: "SIP Calculator.",
  intro:
    "Estimate how much your monthly SIP (Systematic Investment Plan) could grow to. Enter the amount you invest each month, the expected annual return, and how many years you'll stay invested to project your final corpus and the returns on top of what you put in.",

  keywords: {
    primary: "sip calculator",
    secondary: [
      "mutual fund sip calculator",
      "sip return calculator",
      "sip investment calculator",
      "systematic investment plan calculator",
      "sip maturity calculator",
    ],
    longTail: [
      "how to calculate sip returns",
      "monthly sip calculator",
      "sip calculator with annual increase",
      "sip future value calculator",
      "mutual fund return calculator",
      "sip vs lumpsum calculator",
      "how much will my sip grow",
      "sip calculator 10 years",
    ],
    competition: "H",
    estVolume: 301000,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "IN",
  },

  inputs: [
    {
      id: "monthlyInvestment",
      label: "Monthly investment",
      type: "currency",
      default: 10000,
      min: 0,
      help: "The fixed amount you invest every month.",
    },
    {
      id: "expectedReturn",
      label: "Expected annual return",
      type: "percent",
      default: 12,
      min: 0,
      max: 100,
      step: 0.5,
      help: "The average annual return you expect (equity mutual funds have historically averaged 10–12%, but returns are never guaranteed).",
    },
    {
      id: "years",
      label: "Investment period (years)",
      type: "number",
      default: 10,
      min: 1,
      max: 50,
      step: 1,
      help: "How many years you plan to keep investing.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const monthlyInvestment = Math.max(0, Number(values.monthlyInvestment) || 0);
    const expectedReturn = Math.max(0, Number(values.expectedReturn) || 0);
    const years = Math.max(0, Number(values.years) || 0);
    const months = Math.round(years * 12);

    const r = sipFutureValue(monthlyInvestment, expectedReturn, months);

    return {
      headline: {
        label: "Projected value",
        display: ctx.formatCurrency(r.futureValue),
        sub: `${ctx.formatCurrency(r.estimatedReturns)} estimated returns on ${ctx.formatCurrency(r.totalInvested)} invested`,
      },
      rows: [
        { label: "Total invested", display: ctx.formatCurrency(r.totalInvested), kind: "default" },
        { label: "Estimated returns", display: ctx.formatCurrency(r.estimatedReturns), kind: "net" },
        { label: "Projected corpus", display: ctx.formatCurrency(r.futureValue), kind: "net" },
      ],
    };
  },

  howItWorks:
    "A SIP (Systematic Investment Plan) is a way of investing a fixed amount in a mutual fund every month rather than all at once. Each instalment buys units at that month's price, so you automatically buy more units when prices are low and fewer when prices are high — a discipline known as rupee-cost (or dollar-cost) averaging.\n\nThe projected value uses the future value of an annuity-due: FV = P × [((1 + i)^n − 1) ÷ i] × (1 + i), where P is the monthly investment, i is the monthly rate (expected annual return ÷ 12 ÷ 100), and n is the number of months. Contributions are assumed to be made at the start of each month, which is the standard for SIP debits.\n\nThe power of a SIP is compounding over time. A ₹10,000 monthly SIP at an assumed 12% annual return grows to about ₹23.2 lakh in 10 years — of which ₹12 lakh is what you invested and roughly ₹11.2 lakh is growth. Over 20 years the same SIP could reach about ₹1 crore. Remember: market returns are not guaranteed, so this is a projection, not a promise.",

  seoContent: `A SIP calculator projects how much a regular monthly investment in a mutual fund could grow to over time. SIP stands for Systematic Investment Plan — instead of investing a lump sum, you invest a fixed amount automatically every month. This calculator shows your projected corpus, how much of it is your own contribution, and how much is estimated investment growth.

## How SIP returns are calculated

A SIP is mathematically a series of monthly investments, each of which grows for a different length of time. The standard formula is the future value of an annuity-due:

FV = P × [((1 + i)^n − 1) ÷ i] × (1 + i)

Where:
- **P** = your fixed monthly investment
- **i** = the expected monthly return = annual return ÷ 12 ÷ 100. At an expected 12% per year, i = 0.01.
- **n** = the number of monthly instalments. A 10-year SIP has n = 120.

The (1 + i) at the end reflects that SIP instalments are typically debited at the start of each month, so each one earns a little extra interest compared with an end-of-month model.

## Worked example

A 10,000 monthly SIP at an assumed 12% annual return for 10 years:

- i = 0.12 ÷ 12 = 0.01
- n = 120
- (1.01)^120 = 3.30039
- FV = 10,000 × ((3.30039 − 1) ÷ 0.01) × 1.01 = **2,323,391**
- Total invested = 10,000 × 120 = **1,200,000**
- Estimated returns = 2,323,391 − 1,200,000 = **1,123,391**

You invested 12 lakh and the projection shows roughly 11.2 lakh of growth on top — almost doubling your money — purely from staying invested and letting returns compound.

## Why time matters more than amount

Because returns compound, the length of time you stay invested has an outsized effect. A 10,000 monthly SIP at 12%:

- **5 years:** corpus ≈ 8.2 lakh (invested 6 lakh)
- **10 years:** corpus ≈ 23.2 lakh (invested 12 lakh)
- **15 years:** corpus ≈ 50 lakh (invested 18 lakh)
- **20 years:** corpus ≈ 1 crore (invested 24 lakh)

Doubling the time from 10 to 20 years more than quadruples the corpus, even though you only invested twice as much. This is why starting early is the single most powerful lever in SIP investing.

## Rupee-cost averaging and discipline

The two biggest advantages of a SIP are behavioural. First, **rupee-cost averaging**: by investing the same amount every month regardless of market level, you buy more units when prices fall and fewer when they rise, which smooths out your average purchase price. Second, **discipline**: an automated monthly investment removes the temptation to time the market, which even professionals struggle to do consistently.

## Returns are estimates, not guarantees

This is the most important caveat. Mutual fund returns are not fixed — they depend on market performance and vary year to year. The "expected annual return" you enter is an assumption. Equity mutual funds in India have historically averaged around 10–12% over long periods, but any individual year can be much higher or negative. Use a conservative assumption, and treat the projected corpus as a reasonable estimate rather than a promised amount. Past performance does not guarantee future results.

## SIP vs lumpsum vs recurring deposit

A **SIP** invests in market-linked mutual funds — higher expected returns, but with risk. A **recurring deposit (RD)** deposits a fixed amount monthly into a bank at a guaranteed but lower interest rate — use the RD calculator for that. A **lumpsum** invests everything at once. SIPs suit investors who want to invest a portion of monthly income, ride out market volatility, and build wealth over the long term.

## "SIP" is the Indian term — the concept is global

SIP is the everyday term in India for regular mutual-fund investing. In the United States and elsewhere the same practice is usually called **dollar-cost averaging** or an automatic investment plan. The mathematics — investing a fixed amount at regular intervals into a market-linked fund — is identical. This calculator's currency display adjusts to your selected country, and auto-defaults to your region; the formula is currency-agnostic.

## Assumptions and limitations

This calculator assumes a constant monthly investment, a constant expected annual return compounded monthly, and start-of-month instalments. It does not model annual step-ups (increasing your SIP each year), exit loads, expense ratios, or capital-gains tax — all of which affect your real return. For a genuine financial plan, factor in fund expenses and applicable taxes, and consult the fund's documents.`,

  workedExample: {
    scenario: "A 10,000 monthly SIP at an assumed 12% annual return for 10 years.",
    steps: [
      { label: "Monthly investment (P)", value: "10,000" },
      { label: "Monthly return (i = 12% ÷ 12)", value: "1%" },
      { label: "Number of instalments (n)", value: "120" },
      { label: "(1.01)^120", value: "3.30039" },
      { label: "FV = P × ((1+i)^n − 1)/i × (1+i)", value: "2,323,391" },
      { label: "Total invested (10,000 × 120)", value: "1,200,000" },
      { label: "Estimated returns", value: "1,123,391" },
    ],
    result: "A 10,000 monthly SIP projects to about 23.2 lakh after 10 years at 12% — roughly 11.2 lakh of estimated returns on the 12 lakh invested. Actual returns will vary with the market.",
  },

  faqs: [
    {
      q: "How is SIP return calculated?",
      a: "A SIP uses the future value of an annuity formula: FV = P × [((1+i)^n − 1)/i] × (1+i), where P is the monthly amount, i is the monthly return (annual return ÷ 12 ÷ 100), and n is the number of months. For 10,000/month at 12% for 10 years, the projected corpus is about 23,23,391.",
    },
    {
      q: "Is the SIP return guaranteed?",
      a: "No. SIPs invest in market-linked mutual funds, so returns vary with market performance and are not guaranteed. The 'expected annual return' is an assumption — equity funds have historically averaged around 10–12% over long periods, but any year can be higher or negative. Treat the projection as an estimate.",
    },
    {
      q: "What is rupee-cost averaging?",
      a: "Because you invest the same amount every month regardless of market level, you automatically buy more fund units when prices are low and fewer when prices are high. Over time this averages out your purchase price and removes the need to time the market.",
    },
    {
      q: "What return rate should I use in the calculator?",
      a: "Use a realistic long-term average for the type of fund. For diversified equity mutual funds, 10–12% is a commonly used long-term assumption in India; for debt or hybrid funds, use a lower figure (6–8%). When in doubt, use a conservative number so you don't overestimate your corpus.",
    },
    {
      q: "What is the difference between a SIP and a recurring deposit?",
      a: "A SIP invests in market-linked mutual funds with higher expected (but variable) returns. A recurring deposit (RD) is a bank product with a fixed, guaranteed but lower interest rate. SIPs are for long-term wealth building with some risk; RDs are for guaranteed savings. Use the RD calculator for the bank-deposit version.",
    },
    {
      q: "Does a longer SIP period really make a big difference?",
      a: "Yes — dramatically, because returns compound. A 10,000 SIP at 12% grows to about 23 lakh in 10 years but roughly 1 crore in 20 years. Doubling the time more than quadruples the corpus even though you only invested twice as much. Starting early is the most powerful factor.",
    },
  ],

  related: ["compound-interest-calculator", "fd-calculator", "rd-calculator"],

  sources: [
    {
      label: "AMFI — investor education on mutual funds and SIPs",
      url: "https://www.amfiindia.com/",
    },
  ],

  lastUpdated: "2026-06-15",
};
