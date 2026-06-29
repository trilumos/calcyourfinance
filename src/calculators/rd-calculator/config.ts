import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { rdMaturity } from "../_shared/finance";

const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

export const rdCalculator: CalculatorConfig = {
  slug: "rd-calculator",
  kind: "single",
  category: "personal-finance",

  title: "RD Calculator — Recurring Deposit Maturity",
  metaDescription:
    "Free RD calculator — find the maturity amount and interest on a recurring deposit. Enter your monthly deposit, annual interest rate, and tenure to see your maturity value. Uses the standard quarterly-compounding RD formula.",
  h1: "RD Calculator.",
  intro:
    "Calculate the maturity value of a recurring deposit (RD). Enter the amount you deposit each month, your bank's annual interest rate, and the tenure in years to see how much you'll have at maturity and how much of that is interest.",

  keywords: {
    primary: "rd calculator",
    secondary: [
      "recurring deposit calculator",
      "rd maturity calculator",
      "rd interest calculator",
      "rd calculator india",
      "post office rd calculator",
    ],
    longTail: [
      "how to calculate rd maturity amount",
      "recurring deposit interest calculator",
      "rd return calculator",
      "monthly rd calculator",
      "rd calculator with interest rate",
      "sbi rd calculator",
      "rd vs fd calculator",
      "how much interest will i earn on rd",
    ],
    competition: "H",
    estVolume: 90500,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "IN",
  },

  inputs: [
    {
      id: "monthlyDeposit",
      label: "Monthly deposit",
      type: "currency",
      default: 5000,
      min: 0,
      help: "The fixed amount you deposit into the RD every month.",
    },
    {
      id: "ratePercent",
      label: "Annual interest rate",
      type: "percent",
      default: 7,
      min: 0,
      max: 100,
      step: 0.05,
      help: "The annual interest rate offered by your bank for this RD tenure.",
    },
    {
      id: "years",
      label: "Tenure (years)",
      type: "number",
      default: 5,
      min: 0.25,
      max: 30,
      step: 0.25,
      help: "How long you'll keep depositing, in years (use decimals for part-years).",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const monthlyDeposit = Math.max(0, Number(values.monthlyDeposit) || 0);
    const ratePercent = Math.max(0, Number(values.ratePercent) || 0);
    const years = Math.max(0, Number(values.years) || 0);
    const months = Math.round(years * 12);

    const r = rdMaturity(monthlyDeposit, ratePercent, months);

    return {
      headline: {
        label: "Maturity amount",
        display: ctx.formatCurrency(r.maturity),
        sub: `${ctx.formatCurrency(r.interestEarned)} interest on ${ctx.formatCurrency(r.totalDeposited)} deposited over ${months} months`,
      },
      rows: [
        { label: "Total deposited", display: ctx.formatCurrency(r.totalDeposited), kind: "default" },
        { label: "Interest earned", display: ctx.formatCurrency(r.interestEarned), kind: "net" },
        { label: "Maturity value", display: ctx.formatCurrency(r.maturity), kind: "net" },
      ],
    };
  },

  howItWorks:
    "A recurring deposit (RD) is a bank savings product where you deposit a fixed amount every month for a set tenure, earning compound interest at a fixed rate. At maturity you receive every deposit back plus the accumulated interest. It suits people who want to save a fixed sum each month at a guaranteed return — a disciplined, low-risk alternative to investing.\n\nThe key thing about RD maturity is that each monthly deposit earns interest for a different length of time: your first deposit compounds for the whole tenure, while your last deposit earns interest for only one month. Indian banks compound RD interest quarterly, so this calculator grows each instalment at the quarterly rate (annual rate ÷ 4) for the number of quarters until maturity, then sums them. This matches the standard formula used by bank RD calculators.\n\nFor example, a ₹5,000 monthly deposit at 7% for 5 years (60 months) matures at about ₹3,59,664 — you deposited ₹3,00,000 and earned roughly ₹59,664 in interest. Because the deposits compound at a guaranteed rate, the maturity figure is fixed at the outset, unlike a market-linked SIP.",

  seoContent: `A recurring deposit (RD) calculator works out the maturity amount and interest on a recurring deposit — a bank product where you deposit a fixed sum every month for a fixed tenure at a fixed interest rate. This calculator shows your maturity value, how much you deposited in total, and how much of the final amount is interest.

## How RD maturity is calculated

An RD is trickier to calculate than a fixed deposit because each monthly instalment is deposited at a different time and therefore earns interest for a different length of time. Your first month's deposit earns interest for the full tenure; your last month's deposit earns interest for just one month.

Indian banks compound RD interest **quarterly**. This calculator grows each monthly deposit at the quarterly rate for the number of quarters remaining until maturity and sums all the instalments:

Maturity = Σ R × (1 + i)^(months remaining ÷ 3)

where R is the monthly deposit and i is the quarterly rate (annual rate ÷ 4 ÷ 100). This is mathematically equivalent to the standard closed-form bank RD formula and matches the figures produced by major bank and post-office RD calculators.

## Worked example

A 5,000 monthly deposit at 7% for 5 years (60 months):

- Quarterly rate i = 7 ÷ 4 ÷ 100 = 0.0175
- Each deposit grows at (1.0175) per quarter for its remaining time
- Total deposited = 5,000 × 60 = **300,000**
- Maturity ≈ **359,664**
- Interest earned ≈ **59,664**

So six years of disciplined 5,000 monthly deposits returns roughly 59,664 in interest on top of your 300,000.

## How tenure and rate affect your maturity

Both a longer tenure and a higher rate increase your interest, and the effect compounds. For a 5,000 monthly RD at 7%:

- **1 year:** maturity ≈ 62,330 — interest ≈ 2,330
- **3 years:** maturity ≈ 200,304 — interest ≈ 20,304
- **5 years:** maturity ≈ 359,664 — interest ≈ 59,664

Longer tenures give each early deposit more time to compound, so the interest grows faster than the deposits.

## RD vs FD vs SIP — which should you use?

These three are often confused:

- **Recurring deposit (RD):** fixed amount deposited **every month** into a bank at a **guaranteed** interest rate. Best for disciplined monthly saving with no risk. (This calculator.)
- **Fixed deposit (FD):** a **single lump sum** deposited once at a guaranteed rate. Best when you already have a lump sum. (Use the FD calculator.)
- **SIP:** a fixed amount invested **every month** into **market-linked mutual funds** — higher expected returns but with risk and no guarantee. (Use the SIP calculator.)

If you want to save a set amount each month with zero risk, an RD is the right tool. If you can accept market risk for higher potential returns, a SIP may grow more over the long term.

## Tax on RD interest

RD interest is taxable as income in most countries. In India, banks deduct TDS (tax deducted at source) on RD interest above a threshold, and the interest is added to your taxable income. This calculator shows the gross maturity value before tax; your post-tax return will be lower depending on your tax bracket and the current rules.

## "RD" is a South-Asian banking term

Recurring deposits are a standard product in India, Pakistan, Bangladesh, and neighbouring markets, and are offered by banks and post offices. The exact Western equivalent is less common, but a regular automatic savings plan into a fixed-rate account is the closest match. This calculator's currency display adjusts to your selected country and auto-defaults to your region; the maturity mathematics is currency-agnostic.

## Assumptions and limitations

This calculator assumes a fixed monthly deposit, a fixed interest rate for the whole tenure, and quarterly compounding (the Indian banking standard). It does not deduct TDS or other taxes, missed-instalment penalties, or premature-withdrawal charges. Individual banks may round or compound slightly differently, so the exact maturity figure on your account can differ by a small amount — confirm the rate and compounding convention with your bank.`,

  workedExample: {
    scenario: "A 5,000 monthly recurring deposit at 7% annual interest for 5 years (60 months), compounded quarterly.",
    steps: [
      { label: "Monthly deposit (R)", value: "5,000" },
      { label: "Quarterly rate (i = 7% ÷ 4)", value: "1.75%" },
      { label: "Tenure", value: "60 months" },
      { label: "Total deposited (5,000 × 60)", value: "300,000" },
      { label: "Maturity (each deposit compounded quarterly, summed)", value: "359,664" },
      { label: "Interest earned (maturity − deposited)", value: "59,664" },
    ],
    result: "A 5,000 monthly RD at 7% for 5 years matures at about 359,664 — roughly 59,664 of interest on the 300,000 deposited, thanks to quarterly compounding.",
  },

  faqs: [
    {
      q: "How is RD maturity amount calculated?",
      a: "Each monthly deposit earns compound interest for the time remaining until maturity. Indian banks compound RD interest quarterly, so each instalment grows at the quarterly rate (annual rate ÷ 4) for the number of quarters left, and all instalments are summed. For 5,000/month at 7% over 5 years, maturity ≈ 359,664.",
    },
    {
      q: "How is an RD different from an FD?",
      a: "A recurring deposit takes a fixed amount every month; a fixed deposit takes a single lump sum once. Both earn guaranteed compound interest. Use an RD when you want to save monthly out of income; use an FD when you already have a lump sum. Use the FD calculator for the lump-sum version.",
    },
    {
      q: "Is RD interest guaranteed?",
      a: "Yes. Unlike a market-linked SIP, an RD pays a fixed interest rate agreed when you open it, so the maturity amount is known in advance. This makes RDs low-risk and predictable, though the returns are typically lower than equity investments over the long term.",
    },
    {
      q: "How often is RD interest compounded?",
      a: "Indian banks and post offices compound recurring-deposit interest quarterly (every three months). This calculator uses quarterly compounding to match standard bank RD calculators. The exact figure can vary slightly between banks depending on their rounding and compounding conventions.",
    },
    {
      q: "Is RD interest taxable?",
      a: "Yes, in most countries RD interest is taxed as income. In India, banks deduct TDS on RD interest above a threshold, and the interest is added to your taxable income. This calculator shows the gross maturity value before tax; your actual return after tax will be lower.",
    },
    {
      q: "Can I use this RD calculator for a post office RD?",
      a: "Yes. Post office recurring deposits use the same monthly-deposit, quarterly-compounding structure as bank RDs, so this calculator works for them too — just enter the current post office RD interest rate and your monthly deposit and tenure.",
    },
  ],

  related: ["fd-calculator", "sip-calculator", "compound-interest-calculator"],

  sources: [
    {
      label: "India Post — Recurring Deposit scheme",
      url: "https://www.indiapost.gov.in/",
    },
  ],

  lastUpdated: "2026-06-15",
};
