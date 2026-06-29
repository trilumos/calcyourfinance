import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { compoundFutureValue } from "../_shared/finance";

/** Broad country set for global personal-finance tools (currency display only). */
const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

/** Compounding frequency options: value = compoundsPerYear. */
const FREQ_OPTIONS = [
  { value: "1",   label: "Annually (1×/year)" },
  { value: "2",   label: "Semi-annually (2×/year)" },
  { value: "4",   label: "Quarterly (4×/year)" },
  { value: "12",  label: "Monthly (12×/year)" },
  { value: "365", label: "Daily (365×/year)" },
];

export const compoundInterestCalculator: CalculatorConfig = {
  slug: "compound-interest-calculator",
  kind: "single",
  category: "personal-finance",

  title: "Compound Interest Calculator",
  metaDescription:
    "Free compound interest calculator. Enter your principal, interest rate, years and compounding frequency — with optional monthly contributions — to see your future value, total interest earned and growth breakdown.",
  h1: "Compound Interest Calculator.",
  intro:
    "See how your money grows over time. Enter your starting amount, annual interest rate, time horizon and compounding frequency — and add a regular contribution per period — to find your future balance, total interest earned and what the compounding effect adds on top.",

  keywords: {
    primary: "compound interest calculator",
    secondary: [
      "compound interest formula",
      "compound interest calculator with monthly contributions",
      "daily compound interest calculator",
      "monthly compound interest calculator",
      "compound interest calculator with contributions",
      "calculate compound interest",
      "compounding interest calculator",
      "compound interest rate calculator",
    ],
    longTail: [
      "how to calculate compound interest",
      "compound interest formula with contributions",
      "daily vs monthly compounding calculator",
      "annual compound interest calculator",
      "quarterly compound interest calculator",
      "compound interest vs simple interest",
      "how does compound interest work",
      "compound interest calculator savings",
      "compound interest example",
      "compound interest growth calculator",
    ],
    competition: "H",
    estVolume: 60500,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "US",
  },

  inputs: [
    {
      id: "principal",
      label: "Starting principal",
      type: "currency",
      default: 10000,
      min: 0,
      help: "The lump sum you are investing or depositing today.",
    },
    {
      id: "ratePercent",
      label: "Annual interest rate",
      type: "percent",
      default: 8,
      min: 0,
      max: 100,
      step: 0.1,
      help: "The annual rate of return or interest rate, as a percentage.",
    },
    {
      id: "years",
      label: "Time period (years)",
      type: "number",
      default: 10,
      min: 1,
      max: 100,
      step: 1,
      help: "How many years to grow the investment.",
    },
    {
      id: "compoundsPerYear",
      label: "Compounding frequency",
      type: "select",
      default: "12",
      options: FREQ_OPTIONS,
      help: "How often interest is calculated and added to your balance.",
    },
    {
      id: "contribution",
      label: "Contribution per period",
      type: "currency",
      default: 0,
      min: 0,
      help: "Regular amount added each compounding period (e.g. monthly if compounding monthly). Leave 0 for no contributions.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const principal = Math.max(0, Number(values.principal) || 0);
    const ratePercent = Math.max(0, Number(values.ratePercent) || 0);
    const years = Math.max(0, Number(values.years) || 0);
    const compoundsPerYear = Math.max(1, Number(values.compoundsPerYear) || 12);
    const contribution = Math.max(0, Number(values.contribution) || 0);

    const r = compoundFutureValue({
      principal,
      ratePercent,
      years,
      compoundsPerYear,
      contribution,
    });

    const hasContributions = contribution > 0;

    const rows: CalcResult["rows"] = [
      {
        label: "Starting principal",
        display: ctx.formatCurrency(principal),
        kind: "default",
      },
    ];

    if (hasContributions) {
      rows.push({
        label: `Total contributions (${compoundsPerYear * years} periods)`,
        display: ctx.formatCurrency(r.totalContributions),
        kind: "default",
      });
      rows.push({
        label: "Total money invested",
        display: ctx.formatCurrency(r.totalPrincipal),
        kind: "default",
      });
    }

    rows.push({
      label: "Interest earned",
      display: ctx.formatCurrency(r.interest),
      kind: "net",
    });

    rows.push({
      label: "Future value",
      display: ctx.formatCurrency(r.futureValue),
      kind: "net",
    });

    const growthPercent =
      r.totalPrincipal > 0
        ? ((r.interest / r.totalPrincipal) * 100)
        : 0;

    return {
      headline: {
        label: "Future value",
        display: ctx.formatCurrency(r.futureValue),
        sub: `${ctx.formatCurrency(r.interest)} interest earned — ${ctx.formatNumber(growthPercent, 1)}% total growth`,
      },
      rows,
    };
  },

  howItWorks:
    "Compound interest means that the interest you earn in each period is added to your principal, so next period you earn interest on a larger balance. Over time this creates exponential growth — a process Einstein reportedly called the eighth wonder of the world.\n\nThe formula is: A = P × (1 + i)^N, where P is the principal, i is the periodic rate (annual rate ÷ compoundsPerYear), and N is the total number of periods (years × compoundsPerYear). If you add regular contributions each period, those are added using the ordinary annuity formula: FV_contributions = PMT × [((1 + i)^N − 1) / i]. The two terms are summed for the total future value.\n\nCompounding frequency matters: monthly compounding at 8% beats annual compounding at 8% because interest is credited more often, giving it more time to compound. Daily compounding adds a small additional edge over monthly. The real power comes from time — doubling the years roughly squares the effect of compounding.",

  seoContent: `A compound interest calculator is one of the most powerful tools in personal finance. It answers a question that is deceptively simple: if you put money to work at a given rate, for a given time, how much will you have? The answer is almost always larger than people expect, because compounding multiplies not just your starting capital but every dollar of interest you have already earned.

## The compound interest formula explained

The core formula is A = P × (1 + i)^N, where:

- **P** is the principal — the amount you start with.
- **i** is the periodic interest rate: annual rate ÷ compoundsPerYear. At 8% compounded monthly, i = 0.08 ÷ 12 ≈ 0.006667.
- **N** is the total number of compounding periods: years × compoundsPerYear. At 10 years monthly, N = 120.

So $10,000 at 8% for 10 years, compounded monthly: A = 10,000 × (1.006667)^120 ≈ $22,196.40. Your money more than doubles without adding a single extra dollar. The $12,196 gain comes entirely from compounding — interest earning interest.

## Why compounding frequency matters

The same 8% annual rate produces different results depending on how often it compounds:

- **Annually:** $10,000 → $21,589.25 after 10 years.
- **Quarterly:** $10,000 → $22,080.40 after 10 years.
- **Monthly:** $10,000 → $22,196.40 after 10 years.
- **Daily:** $10,000 → $22,253.46 after 10 years.

The differences narrow as frequency increases — going from monthly to daily adds less than $60 here — but the jump from annual to monthly adds over $600. For savings accounts and bonds where the rate is fixed, monthly compounding is the standard to look for.

## Adding regular contributions

Most savers do not deposit a lump sum and walk away. They add money every month — a savings deposit, a pension contribution, an index fund purchase. When you add a regular contribution each compounding period, the future value of those contributions is calculated using the ordinary annuity formula: FV = PMT × [((1 + i)^N − 1) / i]. This is added to the future value of your principal.

Example: $10,000 at 8% monthly for 10 years, plus $200 per month:

- Future value of the $10,000 principal: $22,196.40
- Future value of $200/month contributions: $36,589.21
- **Total future value: $58,785.61**
- Total invested: $10,000 + $24,000 = $34,000
- **Total interest earned: $24,785.61**

The $200/month nearly triples the outcome compared with the lump sum alone, and almost $25,000 of the final balance is growth rather than deposits. This is why starting early and contributing regularly is so consistently recommended: even modest regular contributions compound powerfully over a decade or more.

## Compound interest vs. simple interest

Simple interest calculates interest only on the original principal: I = P × r × t. At 8% for 10 years, $10,000 earns exactly $8,000 in simple interest — total $18,000. Compound interest on the same principal, compounded monthly, yields $22,196.40 — a $4,196 difference. That gap widens dramatically at longer time horizons: at 30 years, the compound result is over $109,000 versus $34,000 for simple interest.

## Practical uses of this calculator

**Savings goals.** Enter your current savings, your bank's interest rate, and how long until you need the money. The calculator shows whether your savings will reach your target, and how much you need to add each month to close a gap.

**Investment projections.** Use your expected annual return (e.g. 7–10% for a diversified stock index over long periods) to project a retirement pot. Adjust years and contributions to see what changes.

**Comparing accounts.** Put two savings rates side by side to quantify which account earns more over your time horizon — a difference that looks tiny on paper can compound into thousands.

**Debt compounding (in reverse).** Compound interest works against you on credit cards and loans. The same formula applies: a $5,000 balance at 24% monthly compounds to $59,218 if left untouched for 10 years. Understanding compounding makes the urgency of paying down high-rate debt concrete.

## Assumptions and limitations

This calculator uses standard textbook compound-interest formulas. It assumes a fixed rate of return applied consistently over the time period — real investment returns vary. It does not account for taxes on interest or gains, inflation, or fees. Currency display adjusts to your selected country but the mathematics is currency-agnostic. For investment projections, past returns do not guarantee future results; consult a financial adviser before making major decisions.`,

  workedExample: {
    scenario: "You invest $10,000 at 8% annual interest, compounded monthly, for 10 years with no additional contributions.",
    steps: [
      { label: "Principal (P)", value: "$10,000.00" },
      { label: "Periodic rate (i = 8% ÷ 12)", value: "0.6667%" },
      { label: "Total periods (N = 12 × 10)", value: "120" },
      { label: "Growth factor (1.006667)^120", value: "×2.2196" },
      { label: "Future value (P × growth factor)", value: "$22,196.40" },
    ],
    result: "Your $10,000 grows to $22,196.40 — you earn $12,196.40 in compound interest.",
  },

  faqs: [
    {
      q: "What is the compound interest formula?",
      a: "The standard formula is A = P × (1 + i)^N, where P is the principal, i is the periodic interest rate (annual rate ÷ number of compounding periods per year), and N is the total number of periods (years × periods per year). With regular contributions, the annuity component PMT × [((1 + i)^N − 1) / i] is added to that result.",
    },
    {
      q: "How does compounding frequency affect growth?",
      a: "More frequent compounding means interest is added to your balance sooner, so subsequent interest is calculated on a larger base. $10,000 at 8% for 10 years grows to about $21,589 compounded annually, $22,080 compounded quarterly, and $22,196 compounded monthly. The gap between monthly and daily is small, but annual vs. monthly adds up to several hundred dollars on a $10,000 base over a decade.",
    },
    {
      q: "What does 'contribution per period' mean?",
      a: "It's the fixed amount you add at the end of each compounding period. If you compound monthly and enter $200, the calculator assumes you deposit $200 every month. If you compound annually and enter $1,000, you add $1,000 once a year. This lets you model regular savings alongside a starting lump sum.",
    },
    {
      q: "What is the Rule of 72?",
      a: "The Rule of 72 is a quick mental shortcut: divide 72 by the annual interest rate to estimate how many years it takes to double your money with compound interest. At 8%, 72 ÷ 8 = 9 years — close to the precise answer of about 8.99 years for monthly compounding. At 6% it's roughly 12 years, at 12% roughly 6 years.",
    },
    {
      q: "What is the difference between compound and simple interest?",
      a: "Simple interest is calculated only on the original principal each period: I = P × r × t. Compound interest is calculated on the principal plus accumulated interest, so interest earns interest. On $10,000 at 8% for 10 years, simple interest gives $8,000 extra ($18,000 total), while monthly compounding gives $12,196 extra ($22,196 total) — a 52% higher gain from compounding alone.",
    },
    {
      q: "Why does time matter so much in compounding?",
      a: "The exponent N in (1 + i)^N means growth is exponential, not linear. The gain in the final years of a long investment is far greater than in the early years — most of the growth occurs in the second half of the time horizon. This is why starting early — even with a small amount — outperforms starting late with a larger amount. Ten extra years of compounding at 8% roughly doubles the outcome.",
    },
    {
      q: "Is this calculator accurate for savings accounts and ISAs?",
      a: "Yes, for standard accounts with a fixed Annual Equivalent Rate (AER) compounded monthly or daily. Enter the AER as your annual rate. For accounts with variable rates, the result is an estimate based on the rate you enter. The calculator does not account for tax on interest, inflation, or account fees — for a net-of-tax view, reduce the rate by your marginal tax rate on savings income.",
    },
  ],

  related: ["interest-calculator"],

  sources: [
    {
      label: "Investopedia — Compound Interest",
      url: "https://www.investopedia.com/terms/c/compoundinterest.asp",
    },
    {
      label: "Khan Academy — Compound interest basics",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/compound-interest-tutorial/a/compound-interest-basics",
    },
  ],

  lastUpdated: "2026-06-15",
};
