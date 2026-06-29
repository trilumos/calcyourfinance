import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { simpleInterest } from "../_shared/finance";

/** Broad country set for global personal-finance tools (currency display only). */
const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

export const interestCalculator: CalculatorConfig = {
  slug: "interest-calculator",
  kind: "single",
  category: "personal-finance",

  title: "Simple Interest Calculator",
  metaDescription:
    "Free simple interest calculator. Enter principal, annual interest rate and years to instantly calculate interest earned and total amount — with the formula explained step by step.",
  h1: "Simple Interest Calculator.",
  intro:
    "Calculate interest on a loan or savings account using the simple interest formula. Enter your principal, annual interest rate and time in years to see exactly how much interest accrues and what your total comes to.",

  keywords: {
    primary: "simple interest calculator",
    secondary: [
      "interest calculator",
      "simple interest formula",
      "how to calculate simple interest",
      "interest rate calculator",
      "loan interest calculator",
      "savings interest calculator",
      "calculate interest",
      "simple interest calculator with currency",
    ],
    longTail: [
      "simple interest formula P times R times T",
      "simple interest vs compound interest",
      "interest calculator for savings",
      "interest calculator for loans",
      "annual interest calculator",
      "how much interest will I earn",
      "how to calculate interest on a loan",
      "monthly interest calculator",
      "simple interest example",
      "what is simple interest",
    ],
    competition: "H",
    estVolume: 27100,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "US",
  },

  inputs: [
    {
      id: "principal",
      label: "Principal",
      type: "currency",
      default: 10000,
      min: 0,
      help: "The starting amount — the loan balance or initial deposit.",
    },
    {
      id: "ratePercent",
      label: "Annual interest rate",
      type: "percent",
      default: 8,
      min: 0,
      max: 100,
      step: 0.1,
      help: "The yearly interest rate as a percentage (e.g. enter 8 for 8%).",
    },
    {
      id: "years",
      label: "Time period (years)",
      type: "number",
      default: 5,
      min: 0,
      step: 0.5,
      help: "Duration in years. You can use decimals — enter 0.5 for six months, 1.5 for 18 months.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const principal = Math.max(0, Number(values.principal) || 0);
    const ratePercent = Math.max(0, Number(values.ratePercent) || 0);
    const years = Math.max(0, Number(values.years) || 0);

    const r = simpleInterest(principal, ratePercent, years);

    const growthPercent =
      principal > 0 ? ((r.interest / principal) * 100) : 0;

    return {
      headline: {
        label: "Total amount",
        display: ctx.formatCurrency(r.total),
        sub: `${ctx.formatCurrency(r.interest)} interest earned — ${ctx.formatNumber(growthPercent, 2)}% total growth`,
      },
      rows: [
        {
          label: "Principal",
          display: ctx.formatCurrency(principal),
          kind: "default",
        },
        {
          label: `Interest (${ctx.formatPercent(ratePercent)} × ${years} year${years === 1 ? "" : "s"})`,
          display: ctx.formatCurrency(r.interest),
          kind: "net",
        },
        {
          label: "Total amount",
          display: ctx.formatCurrency(r.total),
          kind: "net",
        },
      ],
    };
  },

  howItWorks:
    "Simple interest is calculated only on the original principal — not on any accumulated interest. The formula is I = P × r × t, where P is the principal, r is the annual rate expressed as a decimal, and t is the time in years.\n\nFor example, $10,000 at 8% for 5 years: I = 10,000 × 0.08 × 5 = $4,000. The total amount is $14,000. The interest is the same every year ($800), which is what makes it 'simple' — it grows linearly with time rather than exponentially.\n\nSimple interest is used in many short-term personal loans, auto loans, US Treasury notes, and some savings accounts. When interest compounds (is added to the principal and then earns interest itself), you get compound interest, which grows faster. For long-term savings and investments, compounding makes a significant difference.",

  seoContent: `The simple interest calculator above gives you an instant answer to one of the most fundamental questions in personal finance: if you lend or borrow a sum of money at a fixed rate, how much interest accrues over a set period? Simple interest is the most transparent, predictable form of interest calculation — it grows in a straight line, with no surprises. Understanding it is the essential starting point before tackling the more complex world of compound interest, mortgages, and bond pricing.

## The simple interest formula: I = P × r × t

Simple interest is calculated by multiplying three things:

- **P** — the **principal**, the original sum of money.
- **r** — the **annual interest rate** expressed as a decimal (divide the percentage by 100; 8% → 0.08).
- **t** — the **time** the money is lent or deposited, in years.

The result, I, is the total interest earned or owed. The full amount at the end (principal plus interest) is A = P + I = P × (1 + r × t).

**Example:** $10,000 at 8% per year for 5 years.
- I = 10,000 × 0.08 × 5 = **$4,000**
- Total amount = $10,000 + $4,000 = **$14,000**

Notice that the interest is exactly $800 per year in every year — it never changes, because it is always calculated on the original $10,000, not on the balance at the end of year 1, year 2, and so on. This predictability is what makes simple interest easy to work with and audit.

## Where simple interest is used in real life

Simple interest is more common than many people realise. **Short-term personal loans** — including many payday-style or instalment loans — charge simple interest on the original balance. **Automobile loans** in the United States are typically simple-interest loans: your monthly payment reduces the principal each time, and interest is charged only on the remaining balance (which also means paying early saves money). **US Treasury bills and notes** pay simple interest on the face value for shorter maturities. And many **savings bonds and fixed deposits** quoted as a flat annual rate are using simple interest over the stated period, with the rate confirmed at maturity.

## Simple interest vs. compound interest

The key difference is whether earned interest itself earns more interest. With simple interest, it does not — interest is always a fixed slice of the original principal. With compound interest, each period's interest is added to the balance and then earns interest in the next period. Over short time horizons, the difference is small. Over longer periods, compounding creates a dramatic gap.

At 8% for 10 years on $10,000:
- **Simple interest:** $8,000 interest → total $18,000.
- **Monthly compounding:** $12,196 interest → total $22,196.
- The compounding advantage: **$4,196 more**, from the same principal and rate.

For savings and investments, compounding is almost always better. For loans, compounding costs you more. Simple interest loans and savings products are easier to plan around precisely because the interest amount is fixed and predictable.

## How to calculate simple interest: step by step

1. Convert the rate to a decimal: divide the percentage by 100. (8% → 0.08.)
2. Multiply principal × rate: $10,000 × 0.08 = $800. This is your annual interest.
3. Multiply by years: $800 × 5 = $4,000. This is the total interest over the term.
4. Add to principal: $10,000 + $4,000 = $14,000. This is your total amount.

For periods shorter than a year, use the fraction of the year: 6 months = 0.5, 3 months = 0.25. So $10,000 at 8% for 6 months: I = 10,000 × 0.08 × 0.5 = $400.

## Practical uses of this calculator

**Checking a loan offer.** If a lender quotes a simple interest rate, enter the loan amount, rate and term. The calculator shows the total interest you will pay before any fees, which you can compare with other offers.

**Estimating savings returns.** For a fixed-term deposit or bond paying simple interest, enter the deposit amount, the quoted rate and the term to see exactly what you will receive at maturity.

**Financial education.** Students and anyone learning personal finance will find that understanding simple interest — and being able to quickly verify a calculation — builds the foundation for understanding mortgages, bonds, annuities and compound growth.

**Quick what-if analysis.** Change the years or rate field to see how sensitive your outcome is. Extending from 5 years to 10 doubles the interest earned with simple interest — a doubling that feels intuitive, because simple interest is linear.

## Limitations of this calculator

This calculator applies the classic simple interest formula I = P × r × t and assumes a fixed annual rate applied over the full term. It does not account for: taxes on interest income, account fees, inflation, prepayment effects on loan balances, or frequency of payment. For loans where payments reduce the outstanding principal each month (most auto and personal loans), interest is charged on the declining balance rather than the original amount — which slightly reduces total interest paid. For more complex scenarios including regular contributions or compounding, try our Compound Interest Calculator.`,

  workedExample: {
    scenario: "You deposit $10,000 in a fixed-term savings account paying 8% simple interest per year for 5 years.",
    steps: [
      { label: "Principal (P)", value: "$10,000.00" },
      { label: "Annual rate (r)", value: "8% = 0.08" },
      { label: "Time (t)", value: "5 years" },
      { label: "Interest: P × r × t", value: "$10,000 × 0.08 × 5 = $4,000.00" },
      { label: "Total amount: P + I", value: "$10,000 + $4,000 = $14,000.00" },
    ],
    result: "After 5 years you receive $14,000.00 — your $10,000 principal plus $4,000 in interest.",
  },

  faqs: [
    {
      q: "What is the simple interest formula?",
      a: "Simple interest is calculated as I = P × r × t, where P is the principal (starting amount), r is the annual interest rate as a decimal (e.g. 8% = 0.08), and t is the time in years. The total amount is A = P + I. Every year, the same amount of interest accrues because it's always calculated on the original principal, not on any accumulated interest.",
    },
    {
      q: "What is the difference between simple and compound interest?",
      a: "With simple interest, interest is calculated only on the original principal — so $10,000 at 8% earns exactly $800 every year. With compound interest, each period's interest is added to the principal, so the next period's interest is calculated on a larger base. Over 10 years, compound interest at 8% (monthly) produces $12,196 of gain on the same $10,000 — versus just $8,000 for simple interest. Simple interest is predictable and linear; compound interest grows exponentially.",
    },
    {
      q: "How do I calculate simple interest for months instead of years?",
      a: "Convert the period to a fraction of a year. Six months = 0.5, three months = 0.25, one month ≈ 0.0833. The formula stays the same: I = P × r × t. For $5,000 at 6% for 6 months: I = 5,000 × 0.06 × 0.5 = $150. Enter 0.5 in the 'Time period' field above — the calculator supports decimal years.",
    },
    {
      q: "Does this calculator work for loans?",
      a: "Yes, for simple-interest loans. Enter the loan balance as the principal, the quoted annual rate, and the loan term in years. The calculator shows total interest owed. Note that most instalment loans (including many auto loans) charge simple interest on the declining balance as payments are made, so actual total interest will be lower than this calculator shows if you make regular payments.",
    },
    {
      q: "What types of accounts use simple interest?",
      a: "Simple interest is used in many short-term personal loans, US Treasury bills, some fixed-term savings bonds and fixed deposits quoted as a flat rate, and auto loans (on the declining principal). Long-term savings accounts, ISAs, and most investment accounts compound interest — often monthly or daily — which produces higher returns over time.",
    },
    {
      q: "How much interest will I earn on $10,000 at 5% for 3 years?",
      a: "Using I = P × r × t: I = 10,000 × 0.05 × 3 = $1,500. Total amount = $11,500. You earn $500 per year in simple interest, for $1,500 over 3 years. Enter your own figures in the calculator above for an instant answer.",
    },
  ],

  related: ["compound-interest-calculator"],

  sources: [
    {
      label: "Investopedia — Simple Interest",
      url: "https://www.investopedia.com/terms/s/simple_interest.asp",
    },
    {
      label: "Khan Academy — Simple interest",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/interest-basics-tutorial/a/simple-interest-review",
    },
  ],

  lastUpdated: "2026-06-15",
};
