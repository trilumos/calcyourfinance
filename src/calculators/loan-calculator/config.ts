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

export const loanCalculator: CalculatorConfig = {
  slug: "loan-calculator",
  kind: "single",
  category: "personal-finance",

  title: "Loan Calculator",
  metaDescription:
    "Free loan calculator — find your monthly payment, total interest, and total cost for any personal loan, auto loan, or mortgage. Enter the loan amount, annual interest rate, and term in years.",
  h1: "Loan Calculator.",
  intro:
    "Calculate your monthly loan payment and total interest for any loan. Enter the amount you want to borrow, the annual interest rate, and the repayment term in years to see your fixed monthly payment and the total cost of borrowing.",

  keywords: {
    primary: "loan calculator",
    secondary: [
      "monthly payment calculator",
      "loan payment calculator",
      "auto loan calculator",
      "personal loan calculator",
      "amortization calculator",
    ],
    longTail: [
      "how to calculate monthly loan payment",
      "loan repayment calculator",
      "car loan calculator monthly payment",
      "mortgage payment calculator",
      "loan interest calculator",
      "total interest on a loan",
      "loan amortization calculator",
      "how much will my loan cost",
    ],
    competition: "H",
    estVolume: 90500,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "US",
  },

  inputs: [
    {
      id: "principal",
      label: "Loan amount",
      type: "currency",
      default: 25000,
      min: 0,
      help: "The total amount you want to borrow.",
    },
    {
      id: "ratePercent",
      label: "Annual interest rate",
      type: "percent",
      default: 7,
      min: 0,
      max: 100,
      step: 0.1,
      help: "The annual percentage rate (APR) quoted by your lender.",
    },
    {
      id: "termYears",
      label: "Loan term (years)",
      type: "number",
      default: 5,
      min: 0.5,
      max: 50,
      step: 0.5,
      help: "How many years to repay the loan.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const principal = Math.max(0, Number(values.principal) || 0);
    const ratePercent = Math.max(0, Number(values.ratePercent) || 0);
    const termYears = Math.max(0, Number(values.termYears) || 0);
    const months = Math.round(termYears * 12);

    const result = emi(principal, ratePercent, months);

    return {
      headline: {
        label: "Monthly payment",
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
          label: "Total interest",
          display: ctx.formatCurrency(result.totalInterest),
          kind: "net",
        },
        {
          label: "Total amount repaid",
          display: ctx.formatCurrency(result.totalPayment),
          kind: "net",
        },
      ],
    };
  },

  howItWorks:
    "A loan calculator uses the standard reducing-balance amortisation formula to find the fixed monthly payment that exactly pays off a loan over a set term. Each monthly payment covers the interest that has accrued since the last payment plus a slice of principal. Early payments are mostly interest; later payments are mostly principal — but the payment amount stays the same every month.\n\nThe formula is: Monthly Payment = P × i × (1 + i)^n ÷ ((1 + i)^n − 1), where P is the loan principal, i is the monthly rate (annual rate ÷ 12 ÷ 100), and n is the number of months. This is the same equation used for EMI calculations in India and South Asia — only the terminology differs.\n\nTotal interest paid = (monthly payment × n) − principal. This is why the total interest figure often surprises people: at 7% over 5 years on a $25,000 loan, total interest is around $4,700 — nearly 19% of the original loan on top of the principal. A higher rate or longer term multiplies this substantially.",

  seoContent: `A loan calculator answers one of the most practical questions in personal finance: if I borrow a certain amount at a given interest rate for a set number of years, what will I pay each month — and how much will the loan cost in total?

## How monthly loan payments are calculated

The standard formula used by every bank, credit union, and fintech for reducing-balance loans is:

Monthly Payment = P × i × (1 + i)^n ÷ ((1 + i)^n − 1)

Where:
- **P** = the principal — the amount you borrow
- **i** = the monthly interest rate = annual rate ÷ 12 ÷ 100. At 7% per year, i = 0.005833.
- **n** = the loan term in months. A 5-year loan has n = 60.

Example: $25,000 at 7% for 5 years.

- i = 0.07 ÷ 12 = 0.005833
- n = 60
- (1.005833)^60 = 1.41763
- Monthly payment = 25,000 × 0.005833 × 1.41763 ÷ (1.41763 − 1) = **$495.03**
- Total repaid = $495.03 × 60 = $29,701.80
- Total interest = $29,701.80 − $25,000 = **$4,701.80**

This is the reducing-balance method. Interest is calculated only on the outstanding principal at each payment date, so the interest component shrinks every month as you pay down the loan. This is how virtually all modern consumer loans — personal loans, auto loans, mortgages, student loans — are structured.

## What is amortization?

Amortization is the process of paying off a loan through scheduled, equal monthly payments. Each payment is split between interest (on the outstanding balance) and principal repayment. In month 1, most of the payment is interest; in the final month, almost all of it is principal. The split shifts gradually over the life of the loan.

A full amortization schedule lists every month's payment, interest component, principal component, and remaining balance. Request one from your lender before you sign — it shows you exactly how much of each payment reduces your debt, which can be illuminating for long-term loans.

## How the loan term affects total cost

The term is the most powerful lever you control after the interest rate. Longer term = lower monthly payment but far more total interest.

For a $25,000 loan at 7%:

- **3 years (36 months):** monthly payment ≈ $772 — total interest ≈ $2,792
- **5 years (60 months):** monthly payment ≈ $495 — total interest ≈ $4,702
- **7 years (84 months):** monthly payment ≈ $378 — total interest ≈ $6,772

Going from 3 years to 7 years cuts the monthly payment by $394 but adds $3,980 in total interest. Whether the lower monthly payment is worth the extra cost depends on your cash flow and other financial priorities.

## How the interest rate affects total cost

Rates vary significantly by loan type, credit score, lender, and economic conditions. A small difference in rate adds up quickly over a long term.

For the same $25,000 over 5 years:

- **5% rate:** monthly payment ≈ $472 — total interest ≈ $3,307
- **7% rate:** monthly payment ≈ $495 — total interest ≈ $4,702
- **10% rate:** monthly payment ≈ $531 — total interest ≈ $6,874

A 3% rate difference (5% vs. 10%) adds $3,567 in total interest over five years on a $25,000 loan. On a $250,000 mortgage, the difference is tenfold. This is why improving your credit score before applying for a large loan is worth the effort.

## Auto loans, personal loans, and mortgages — the same formula

This calculator works for any amortising loan regardless of its purpose. Auto loans typically run 36–84 months. Personal loans typically run 12–60 months. Mortgages run 15 or 30 years. The same formula applies to all of them.

For mortgages, this calculator gives you the principal-and-interest (P&I) portion of the payment. Your total housing cost will also include property taxes, homeowner's insurance, and possibly PMI (private mortgage insurance) if your down payment is less than 20% — these are not included here.

## Tips for reducing total loan cost

**Shop for the lowest APR.** Even a 0.5% difference on a large loan is worth comparing across lenders.

**Make extra payments.** Any amount above the minimum payment reduces principal directly and saves interest over the remaining term.

**Choose the shortest affordable term.** Running this calculator at both a 3-year and 5-year term shows you the cash-flow cost of the shorter term and the interest savings — make an informed trade-off.

**Refinance when rates fall.** If market rates drop significantly after you take out a loan, refinancing at a lower rate can reduce both your monthly payment and total cost.

## EMI vs. monthly payment — the same thing

If you have encountered the term EMI (Equated Monthly Installment), it refers to the exact same monthly payment calculated by this tool. EMI is the standard terminology in India, South Asia, and parts of the Middle East; in the United States, United Kingdom, Canada, and Australia, lenders call it the monthly payment, monthly repayment, or instalment. The formula and the mathematics are identical. Use the EMI calculator on this site if you prefer the Indian-market framing; this calculator uses Western terminology throughout.

## Assumptions and limitations

This calculator uses the standard reducing-balance amortisation formula. It assumes: a fixed interest rate throughout the term; no origination fees, prepayment penalties, or insurance (check your loan documents for these); and monthly payments with the first due one month after disbursement. For adjustable-rate loans, the initial rate period can be modelled here but results will differ once the rate resets. Currency display adjusts to your selected country; the mathematics is currency-agnostic.`,

  workedExample: {
    scenario: "$25,000 personal loan at 7% annual interest over 5 years (60 monthly payments).",
    steps: [
      { label: "Principal (P)", value: "$25,000.00" },
      { label: "Monthly rate (i = 7% ÷ 12 ÷ 100)", value: "0.005833" },
      { label: "Term (n)", value: "60 months" },
      { label: "(1 + 0.005833)^60", value: "1.41763" },
      { label: "Monthly payment = P × i × (1+i)^n ÷ ((1+i)^n − 1)", value: "$495.03" },
      { label: "Total repaid (495.03 × 60)", value: "$29,701.80" },
      { label: "Total interest (total − principal)", value: "$4,701.80" },
    ],
    result: "Your fixed monthly payment is $495.03. Over 5 years you repay $29,701.80 in total — $4,701.80 is interest on top of the $25,000 borrowed.",
  },

  faqs: [
    {
      q: "How do I calculate my monthly loan payment?",
      a: "Use the formula: Monthly Payment = P × i × (1 + i)^n ÷ ((1 + i)^n − 1), where P is the loan amount, i is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of months. For a $25,000 loan at 7% over 5 years: i = 0.005833, n = 60, monthly payment ≈ $495.03.",
    },
    {
      q: "What is the difference between APR and interest rate?",
      a: "The interest rate is the annual cost of borrowing expressed as a percentage of the principal. The APR (Annual Percentage Rate) includes the interest rate plus any fees (origination fees, broker fees, etc.) expressed as a single annualised figure. For the purest comparison between lenders, use the APR. This calculator takes the rate you enter at face value — enter the APR for the most accurate total-cost estimate.",
    },
    {
      q: "Does paying extra each month reduce my total interest?",
      a: "Yes — any payment above the required monthly amount reduces the outstanding principal immediately, which reduces the interest calculated in every subsequent period. On a $25,000 loan at 7% over 5 years, paying an extra $100 per month saves roughly $600 in total interest and pays the loan off about 9 months early.",
    },
    {
      q: "What is amortization?",
      a: "Amortization is the process of gradually paying off a loan through equal periodic payments. Each payment covers the interest on the outstanding balance plus a portion of principal. Early payments are mostly interest; later payments are mostly principal. A fully amortized loan reaches a zero balance exactly at the end of the scheduled term.",
    },
    {
      q: "Is this the same as an EMI calculator?",
      a: "Yes, mathematically. EMI (Equated Monthly Installment) is the term used in India and South Asia for the exact same fixed monthly loan repayment. This calculator uses Western terminology (monthly payment, loan term) but computes the same figure using the same formula. If you prefer the Indian framing, use the EMI calculator on this site.",
    },
    {
      q: "What happens if I miss a loan payment?",
      a: "Missing a payment typically triggers a late fee, and the missed interest may be capitalised (added to your principal), increasing future payments. Persistent missed payments damage your credit score and can lead to default proceedings. Contact your lender proactively if you cannot make a payment — most lenders offer short-term forbearance arrangements.",
    },
  ],

  related: ["emi-calculator", "compound-interest-calculator"],

  sources: [
    {
      label: "Consumer Financial Protection Bureau — Understand loan options",
      url: "https://www.consumerfinance.gov/owning-a-home/loan-options/",
    },
  ],

  lastUpdated: "2026-06-15",
};
