import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { emi } from "../_shared/finance";

const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

const TENURE_UNIT_OPTIONS = [
  { value: "years",  label: "Years" },
  { value: "months", label: "Months" },
];

export const emiCalculator: CalculatorConfig = {
  slug: "emi-calculator",
  kind: "single",
  category: "personal-finance",

  title: "EMI Calculator",
  metaDescription:
    "Free EMI calculator — compute your Equated Monthly Installment for any home loan, car loan, or personal loan. Enter the loan amount, annual interest rate, and tenure to see the monthly payment, total interest, and total payment instantly.",
  h1: "EMI Calculator.",
  intro:
    "Calculate your Equated Monthly Installment (EMI) for any loan. Enter the loan amount, annual interest rate, and repayment tenure in years or months to see your monthly payment, total interest cost, and total amount payable.",

  keywords: {
    primary: "emi calculator",
    secondary: [
      "loan emi calculator",
      "home loan emi calculator",
      "car loan emi calculator",
      "how to calculate emi",
      "emi calculator with currency",
    ],
    longTail: [
      "emi formula calculator",
      "equated monthly installment calculator",
      "emi calculator india",
      "personal loan emi calculator",
      "home loan emi calculator india",
      "emi calculation formula",
      "how to reduce emi",
      "emi vs flat rate",
      "monthly loan payment calculator",
    ],
    competition: "H",
    estVolume: 40500,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "IN",
  },

  inputs: [
    {
      id: "principal",
      label: "Loan amount",
      type: "currency",
      default: 1000000,
      min: 0,
      help: "The total amount you are borrowing.",
    },
    {
      id: "ratePercent",
      label: "Annual interest rate",
      type: "percent",
      default: 9,
      min: 0,
      max: 100,
      step: 0.1,
      help: "The annual interest rate quoted by your lender.",
    },
    {
      id: "tenure",
      label: "Loan tenure",
      type: "number",
      default: 20,
      min: 1,
      step: 1,
      half: true,
      help: "Repayment period — pick the unit beside it.",
    },
    {
      id: "tenureUnit",
      label: "Tenure unit",
      type: "select",
      default: "years",
      options: TENURE_UNIT_OPTIONS,
      half: true,
      help: "Years or months for the tenure.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const principal = Math.max(0, Number(values.principal) || 0);
    const ratePercent = Math.max(0, Number(values.ratePercent) || 0);
    const tenure = Math.max(0, Number(values.tenure) || 0);
    const tenureUnit = String(values.tenureUnit || "years");
    const months = tenureUnit === "months" ? Math.round(tenure) : Math.round(tenure * 12);

    const result = emi(principal, ratePercent, months);

    return {
      headline: {
        label: "Monthly EMI",
        display: ctx.formatCurrency(result.emi),
        sub: `${ctx.formatCurrency(result.totalInterest)} total interest — ${months} monthly payments`,
      },
      rows: [
        {
          label: "Loan principal",
          display: ctx.formatCurrency(principal),
          kind: "default",
        },
        {
          label: "Total interest payable",
          display: ctx.formatCurrency(result.totalInterest),
          kind: "net",
        },
        {
          label: "Total amount payable",
          display: ctx.formatCurrency(result.totalPayment),
          kind: "net",
        },
      ],
    };
  },

  howItWorks:
    "An EMI (Equated Monthly Installment) is a fixed monthly payment that covers both the interest accrued and a portion of the principal, so that the loan is fully repaid by the end of the tenure. The payment is the same every month, but early instalments are mostly interest while later ones are mostly principal — this is called amortisation.\n\nThe formula is: EMI = P × i × (1 + i)^n ÷ ((1 + i)^n − 1), where P is the principal, i is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the loan tenure in months. Total payment = EMI × n; total interest = total payment − principal.\n\nThree levers control your EMI: the loan amount (higher principal → higher EMI), the interest rate (higher rate → higher EMI, more interest overall), and the tenure (longer tenure → lower EMI but more total interest paid). Reducing the tenure or making a part-prepayment are the two most effective ways to cut total interest cost.",

  seoContent: `An EMI calculator is the first tool to reach for before taking any loan — home loan, car loan, personal loan, or education loan. It answers the central question: given a loan amount, an interest rate, and a repayment period, what will your fixed monthly outgo be?

## What is EMI?

EMI stands for Equated Monthly Installment. It is the fixed amount you pay your lender every month for the duration of the loan. Each payment is split between interest and principal repayment in proportions that shift over time — early payments are mostly interest; later payments are mostly principal. This pattern is called amortisation. The word "equated" simply means the total monthly payment stays the same from the first instalment to the last.

The term EMI is standard in India, South Asia, and parts of the Middle East. In the United States, United Kingdom, and other Western markets, the same concept is typically called the "monthly payment" or the "monthly loan repayment." The underlying mathematics is identical — only the label differs. If you are using this calculator outside India, read "EMI" as "monthly payment."

## The EMI formula

EMI = P × i × (1 + i)^n ÷ ((1 + i)^n − 1)

Where:
- **P** = principal loan amount (the amount you borrow)
- **i** = monthly interest rate = annual rate ÷ 12 ÷ 100. At 9% per year, i = 0.0075.
- **n** = loan tenure in months. A 20-year home loan has n = 240.

Example: home loan of ₹10,00,000 (10 lakh) at 9% for 20 years.

- i = 0.09 ÷ 12 = 0.0075
- n = 20 × 12 = 240
- (1 + 0.0075)^240 = 6.00915…
- EMI = 10,00,000 × 0.0075 × 6.00915 ÷ (6.00915 − 1) = 8,997.26
- Total payment = 8,997.26 × 240 = ₹21,59,342.40
- Total interest = ₹21,59,342.40 − ₹10,00,000 = ₹11,59,342.40

So a 10-lakh home loan at 9% over 20 years costs an additional ₹11.59 lakh in interest — more than the loan itself. This is why tenure selection matters enormously.

## How interest rate affects EMI

The interest rate has a compounding effect on total interest cost. On the same 10-lakh loan over 20 years:

- **8% rate:** EMI ≈ ₹8,364 — total interest ≈ ₹10.07 lakh
- **9% rate:** EMI ≈ ₹8,997 — total interest ≈ ₹11.59 lakh
- **10% rate:** EMI ≈ ₹9,650 — total interest ≈ ₹13.16 lakh

A 1% increase in rate adds roughly ₹633 per month and ₹1.57 lakh in total interest. This is why borrowers who negotiate even a quarter-percent reduction save meaningfully over a long tenure.

## How tenure affects EMI and total cost

Tenure is a trade-off: longer tenure lowers your monthly EMI (making the loan more affordable month to month) but substantially increases the total interest you pay.

- **10 years (120 months):** EMI ≈ ₹12,668 — total interest ≈ ₹5.20 lakh
- **15 years (180 months):** EMI ≈ ₹10,143 — total interest ≈ ₹8.26 lakh
- **20 years (240 months):** EMI ≈ ₹8,997 — total interest ≈ ₹11.59 lakh

Cutting the tenure from 20 to 10 years more than doubles the monthly EMI, but saves ₹6.39 lakh in interest. The "right" tenure depends on your cash-flow situation — higher EMI is only sustainable if your income comfortably covers it with margin for other expenses.

## Strategies to reduce total interest

**1. Make part-prepayments.** Any extra lump-sum payment directly reduces the outstanding principal. Because future EMIs are calculated on the remaining principal, even a single large prepayment early in the loan can cut several months off the tenure and save a significant amount of interest.

**2. Choose a shorter tenure if affordable.** Run the calculator at a 15-year tenure versus 20-year — if the difference in EMI is within your budget, the shorter tenure is almost always better value.

**3. Negotiate your interest rate.** For home loans especially, even 0.25% can save lakhs over 20 years. Banks frequently offer rate reductions to customers with good credit scores or as part of a balance-transfer offer.

**4. Avoid missing EMI payments.** Late payments attract penalties and damage your credit score, making future borrowing more expensive.

## Fixed rate vs floating rate

This calculator uses a fixed annual rate. In practice, many home loans in India (and mortgages in the UK, US, and elsewhere) have floating or variable rates that reset periodically. A floating-rate loan may start lower but can increase — use the calculator with your current rate for the present EMI, and re-run it at a higher rate to stress-test affordability if rates rise.

## Assumptions and limitations

This calculator applies the standard reducing-balance EMI formula. It assumes: a fixed interest rate throughout the tenure; no processing fees, prepayment penalties, or insurance premiums (which lenders add on top); and that the first EMI is due one month after disbursement. For an exact repayment schedule, request an amortisation table from your lender. Currency display adjusts to your selected country; the mathematics is currency-agnostic.`,

  workedExample: {
    scenario: "Home loan of ₹10,00,000 at 9% annual interest for 20 years (240 months).",
    steps: [
      { label: "Principal (P)", value: "₹10,00,000" },
      { label: "Monthly rate (i = 9% ÷ 12 ÷ 100)", value: "0.0075" },
      { label: "Tenure (n)", value: "240 months" },
      { label: "(1 + 0.0075)^240", value: "6.00915" },
      { label: "EMI = P × i × (1+i)^n ÷ ((1+i)^n − 1)", value: "₹8,997.26" },
      { label: "Total payment (EMI × 240)", value: "₹21,59,342.40" },
      { label: "Total interest (total payment − principal)", value: "₹11,59,342.40" },
    ],
    result: "Your monthly EMI is ₹8,997.26. Over 20 years you pay ₹21,59,342.40 in total — ₹11,59,342.40 is interest on top of the ₹10,00,000 principal.",
  },

  faqs: [
    {
      q: "What does EMI stand for?",
      a: "EMI stands for Equated Monthly Installment. It is the fixed monthly payment made to a lender to repay a loan over a set period. Each payment covers both the interest accrued since the last payment and a portion of the outstanding principal. The term is standard in India, South Asia, and parts of the Middle East; in the West the same amount is simply called the monthly payment or monthly repayment.",
    },
    {
      q: "How is EMI calculated?",
      a: "EMI = P × i × (1 + i)^n ÷ ((1 + i)^n − 1), where P is the loan principal, i is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the tenure in months. For a 10-lakh loan at 9% for 20 years: i = 0.0075, n = 240, EMI ≈ ₹8,997.26.",
    },
    {
      q: "Does a longer loan tenure mean a lower EMI?",
      a: "Yes — a longer tenure reduces the monthly EMI because the principal is spread over more payments. However, you pay more total interest over the life of the loan. For example, a 10-lakh loan at 9% over 10 years has an EMI of about ₹12,668 and total interest of ₹5.2 lakh; over 20 years the EMI drops to ₹8,997 but total interest rises to ₹11.59 lakh.",
    },
    {
      q: "Does prepayment reduce EMI or tenure?",
      a: "Most lenders give you a choice: keep the EMI the same and reduce the remaining tenure, or reduce the EMI and keep the same tenure. Reducing tenure is generally better — it cuts total interest more effectively. Check your loan agreement for prepayment penalty clauses before making a part-payment.",
    },
    {
      q: "What is the difference between flat rate and reducing-balance EMI?",
      a: "A flat-rate loan calculates interest on the original principal for every month of the tenure (I = P × r × n / 12). A reducing-balance (diminishing-balance) loan calculates interest only on the outstanding principal after each payment — so the interest component falls every month. This calculator uses the reducing-balance method, which is how virtually all modern home loans, car loans, and personal loans work. A flat-rate of 5% is actually closer to a ~9% reducing-balance rate, so always compare loans on a reducing-balance basis.",
    },
    {
      q: "How does a credit score affect my EMI?",
      a: "Your credit score does not change the EMI formula — but it affects the interest rate your lender offers you. A higher score (750+ in India's CIBIL system; 700+ in Western bureaus) typically qualifies you for lower rates. Even a 1% rate reduction on a 20-year home loan can save lakhs in total interest.",
    },
  ],

  related: ["loan-calculator", "compound-interest-calculator"],

  sources: [
    {
      label: "Investopedia — Equated Monthly Installment (EMI)",
      url: "https://www.investopedia.com/terms/e/equated_monthly_installment.asp",
    },
  ],

  lastUpdated: "2026-06-15",
};
