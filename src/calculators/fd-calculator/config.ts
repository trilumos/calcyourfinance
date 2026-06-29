import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { compoundFutureValue } from "../_shared/finance";

const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

const COMPOUNDING_OPTIONS = [
  { value: "1",  label: "Annually (1×/year)" },
  { value: "2",  label: "Half-yearly (2×/year)" },
  { value: "4",  label: "Quarterly (4×/year)" },
  { value: "12", label: "Monthly (12×/year)" },
];

export const fdCalculator: CalculatorConfig = {
  slug: "fd-calculator",
  kind: "single",
  category: "personal-finance",

  title: "FD Calculator — Fixed Deposit Maturity Calculator",
  metaDescription:
    "Free FD calculator — compute the maturity amount and interest earned on any fixed deposit. Enter your deposit amount, annual interest rate, tenure, and compounding frequency to see your maturity value instantly.",
  h1: "FD Calculator.",
  intro:
    "Calculate the maturity amount of your Fixed Deposit (FD). Enter your deposit amount, annual interest rate, tenure in years, and compounding frequency to see your maturity value and total interest earned.",

  keywords: {
    primary: "fd calculator",
    secondary: [
      "fixed deposit calculator",
      "fd maturity calculator",
      "fd interest calculator",
      "fd calculator india",
      "how to calculate fd maturity",
    ],
    longTail: [
      "fd maturity amount calculator",
      "fixed deposit interest calculation formula",
      "quarterly compounding fd calculator",
      "bank fd calculator",
      "fd vs rd calculator",
      "best fd interest rate calculator",
      "fd calculator for 1 year",
      "fd calculator for 5 years",
    ],
    competition: "H",
    estVolume: 33100,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "IN",
  },

  inputs: [
    {
      id: "principal",
      label: "Deposit amount",
      type: "currency",
      default: 100000,
      min: 0,
      help: "The lump sum you are depositing in the FD.",
    },
    {
      id: "ratePercent",
      label: "Annual interest rate",
      type: "percent",
      default: 7,
      min: 0,
      max: 100,
      step: 0.1,
      help: "The annual interest rate offered by the bank.",
    },
    {
      id: "years",
      label: "Tenure (years)",
      type: "number",
      default: 5,
      min: 0.5,
      max: 50,
      step: 0.5,
      help: "The FD term in years. Decimal values accepted (e.g. 1.5 for 18 months).",
    },
    {
      id: "compoundsPerYear",
      label: "Compounding frequency",
      type: "select",
      default: "4",
      options: COMPOUNDING_OPTIONS,
      help: "How often interest is compounded. Quarterly is the Indian banking standard.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const principal = Math.max(0, Number(values.principal) || 0);
    const ratePercent = Math.max(0, Number(values.ratePercent) || 0);
    const years = Math.max(0, Number(values.years) || 0);
    const compoundsPerYear = Math.max(1, Number(values.compoundsPerYear) || 4);

    const result = compoundFutureValue({
      principal,
      ratePercent,
      years,
      compoundsPerYear,
    });

    const effectiveAnnualRate = compoundsPerYear > 0
      ? (Math.pow(1 + ratePercent / 100 / compoundsPerYear, compoundsPerYear) - 1) * 100
      : ratePercent;

    return {
      headline: {
        label: "Maturity amount",
        display: ctx.formatCurrency(result.futureValue),
        sub: `${ctx.formatCurrency(result.interest)} interest earned — effective annual rate ${ctx.formatNumber(effectiveAnnualRate, 2)}%`,
      },
      rows: [
        {
          label: "Principal deposited",
          display: ctx.formatCurrency(principal),
          kind: "default",
        },
        {
          label: "Interest earned",
          display: ctx.formatCurrency(result.interest),
          kind: "net",
        },
        {
          label: "Maturity value",
          display: ctx.formatCurrency(result.futureValue),
          kind: "net",
        },
      ],
    };
  },

  howItWorks:
    "A Fixed Deposit (FD) is a lump-sum deposit placed with a bank for a fixed tenure at a predetermined interest rate. Unlike a savings account, the rate is locked in at the time of deposit and does not fluctuate. Interest is compounded at a fixed frequency — quarterly is the Indian banking standard, though some banks offer half-yearly, monthly, or annual compounding.\n\nThe maturity formula is: A = P × (1 + r/n)^(n×t), where P is the principal, r is the annual rate as a decimal, n is the compounding frequency per year, and t is the tenure in years. This is the standard compound interest formula with no additional contributions.\n\nThe effective annual rate (EAR) — also called the annual equivalent rate (AER) — tells you the true annual return after compounding. EAR = (1 + r/n)^n − 1. At 7% compounded quarterly, EAR = (1.0175)^4 − 1 = 7.186%, meaning your deposit effectively earns 7.186% per year even though the stated rate is 7%.",

  seoContent: `An FD calculator (Fixed Deposit calculator) helps you find the maturity value of a bank fixed deposit before you open one. You enter the deposit amount, the bank's offered annual rate, the tenure, and the compounding frequency — the calculator returns the exact maturity amount and total interest you will earn.

## What is a Fixed Deposit?

A Fixed Deposit — often abbreviated as FD — is a savings instrument offered by banks in India, and by their equivalents in South Asia, the Middle East, and parts of Southeast Asia. You deposit a lump sum for a fixed period (the tenure) at an interest rate agreed at the time of deposit. The rate does not change during the tenure regardless of what happens to market rates. At maturity, you receive your principal back plus the accumulated interest.

In Western markets, the equivalent instruments go by different names: Certificate of Deposit (CD) in the United States, Term Deposit in the United Kingdom, Canada, and Australia. The mathematics is identical — the "FD" name is specific to India and its neighbouring markets.

## The FD maturity formula

A = P × (1 + r/n)^(n × t)

Where:
- **A** = maturity amount
- **P** = principal deposited
- **r** = annual interest rate (as a decimal, e.g. 0.07 for 7%)
- **n** = compounding frequency per year (4 for quarterly, 2 for half-yearly, 12 for monthly, 1 for annually)
- **t** = tenure in years

Example: ₹1,00,000 at 7% per annum, compounded quarterly, for 5 years.

- r/n = 0.07 ÷ 4 = 0.0175 (quarterly rate)
- n × t = 4 × 5 = 20 (total compounding periods)
- Growth factor = (1.0175)^20 = 1.41478
- Maturity amount = ₹1,00,000 × 1.41478 = **₹1,41,477.82**
- Interest earned = ₹1,41,477.82 − ₹1,00,000 = **₹41,477.82**

## Why compounding frequency matters for FDs

Indian banks typically compound quarterly, but it is worth understanding how frequency affects your return. At 7% for 5 years on ₹1,00,000:

- **Annually (1×/year):** maturity ≈ ₹1,40,255.17 — interest ≈ ₹40,255.17
- **Half-yearly (2×/year):** maturity ≈ ₹1,41,059.88 — interest ≈ ₹41,059.88
- **Quarterly (4×/year):** maturity ≈ ₹1,41,477.82 — interest ≈ ₹41,477.82
- **Monthly (12×/year):** maturity ≈ ₹1,41,763.14 — interest ≈ ₹41,763.14

The difference between quarterly and monthly compounding is about ₹285 on a 1-lakh deposit over 5 years — small but non-zero. Between annual and quarterly, the difference is about ₹1,223 — more noticeable on larger deposits or longer tenures.

## Effective annual rate (EAR)

The stated rate on an FD is the nominal annual rate. Because interest is compounded more than once a year, the true annual return is slightly higher — this is the Effective Annual Rate (EAR), also called the Annual Equivalent Rate (AER) in the UK.

EAR = (1 + r/n)^n − 1

At 7% compounded quarterly: EAR = (1.0175)^4 − 1 = 7.186%. This means your deposit effectively earns 7.186% per year even though the headline rate is 7%.

When comparing FDs across banks that compound at different frequencies, always compare EAR rather than nominal rate. A 7% quarterly-compounded FD beats a 7% annually-compounded FD.

## Tenure and tax considerations

FD tenures in India range from 7 days to 10 years. Tax-saving FDs have a mandatory 5-year lock-in and qualify for a deduction under Section 80C. The interest earned on FDs is taxable as ordinary income — the bank deducts TDS (Tax Deducted at Source) at 10% on interest exceeding ₹40,000 per year (₹50,000 for senior citizens). If your total income is below the taxable threshold, you can submit Form 15G (or 15H for senior citizens) to avoid TDS.

This calculator shows pre-tax interest. To estimate post-tax returns, subtract your marginal tax rate from the effective annual rate.

## FD vs. other savings instruments

**FD vs. RD (Recurring Deposit):** A Recurring Deposit allows you to deposit a fixed amount every month rather than a lump sum. The maturity is lower for the same rate and tenure because contributions are added progressively. Use an RD calculator if you plan to build the corpus gradually.

**FD vs. savings account:** FDs typically offer significantly higher rates than savings accounts (3.5–4% for most savings accounts vs. 6–8% for FDs at major banks as of 2026). The trade-off is liquidity — breaking an FD early usually incurs a penalty.

**FD vs. mutual funds:** FDs offer guaranteed returns with capital protection. Equity mutual funds offer no guarantee but historically higher long-term returns. The right mix depends on your risk appetite and time horizon.

## Assumptions and limitations

This calculator uses the standard compound interest formula. It assumes: the rate is fixed for the full tenure; interest is compounded at the frequency you select; and no early withdrawal penalty applies. For cumulative FDs (where interest is paid at maturity), this formula gives the exact maturity amount. For non-cumulative FDs (where interest is paid out periodically), the maturity value equals the principal since the interest is not reinvested. Currency display adjusts to your selected country; the mathematics is currency-agnostic.`,

  workedExample: {
    scenario: "₹1,00,000 fixed deposit at 7% annual interest, compounded quarterly, for 5 years.",
    steps: [
      { label: "Principal (P)", value: "₹1,00,000" },
      { label: "Quarterly rate (r/n = 7% ÷ 4)", value: "1.75%" },
      { label: "Total periods (n × t = 4 × 5)", value: "20" },
      { label: "Growth factor (1.0175)^20", value: "1.41478" },
      { label: "Maturity amount (P × growth factor)", value: "₹1,41,477.82" },
      { label: "Interest earned (maturity − principal)", value: "₹41,477.82" },
    ],
    result: "Your ₹1,00,000 FD matures to ₹1,41,477.82 after 5 years — you earn ₹41,477.82 in compound interest.",
  },

  faqs: [
    {
      q: "What is the formula for FD maturity amount?",
      a: "A = P × (1 + r/n)^(n×t), where P is the principal, r is the annual interest rate as a decimal (e.g. 0.07 for 7%), n is the compounding frequency per year, and t is the tenure in years. For ₹1,00,000 at 7% quarterly for 5 years: A = 1,00,000 × (1.0175)^20 = ₹1,41,477.82.",
    },
    {
      q: "How often do Indian banks compound FD interest?",
      a: "The standard for cumulative FDs in India is quarterly compounding. Some banks also offer monthly compounding for select products. The Reserve Bank of India does not mandate a specific compounding frequency — check your FD certificate for the exact terms. For non-cumulative FDs (monthly or quarterly payout), the stated rate applies without compounding on the paid-out portion.",
    },
    {
      q: "What is the difference between cumulative and non-cumulative FD?",
      a: "A cumulative FD reinvests the interest at each compounding period, so the interest compounds and you receive the full maturity amount at the end of the tenure. A non-cumulative FD pays out the interest at regular intervals (monthly, quarterly, or annually) — useful as a regular income stream. This calculator models cumulative FDs, where the full compounding effect applies.",
    },
    {
      q: "Is FD interest taxable in India?",
      a: "Yes. Interest earned on FDs is taxable as 'Income from other sources' at your applicable income tax slab rate. Banks deduct TDS at 10% if the annual interest exceeds ₹40,000 (₹50,000 for senior citizens). If your income is below the taxable threshold, submit Form 15G (or 15H for senior citizens) to prevent TDS deduction. The calculator shows pre-tax interest.",
    },
    {
      q: "What happens if I break an FD before maturity?",
      a: "Premature withdrawal is allowed at most banks but typically attracts a penalty — usually a reduction of 0.5–1% on the applicable rate for the period the deposit was held. For example, if the 5-year rate is 7% but you break the FD after 2 years, the bank may apply the 2-year rate minus a penalty. Check your bank's premature withdrawal policy before opening an FD.",
    },
    {
      q: "What is the Western equivalent of an FD?",
      a: "In the United States it is called a Certificate of Deposit (CD). In the United Kingdom, Canada, and Australia it is called a Term Deposit. In the European Union, term deposit or fixed-term deposit. The mechanics are identical: a fixed rate for a fixed period with a penalty for early withdrawal. The FD name is specific to India and neighbouring South Asian markets.",
    },
  ],

  related: ["compound-interest-calculator", "interest-calculator"],

  sources: [
    {
      label: "Reserve Bank of India — Master Direction: Interest Rate on Deposits",
      url: "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10296",
    },
  ],

  lastUpdated: "2026-06-15",
};
