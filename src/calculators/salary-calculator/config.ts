import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { computeSalary, type PayFrequency } from "./formula";

const BROAD_COUNTRIES: CountryCode[] = [
  "US", "GB", "CA", "AU", "EU", "IN", "SG", "NZ", "ZA", "AE",
  "PH", "MY", "JP", "BR", "DE", "FR", "ES", "IT", "NL", "IE",
];

export const salaryCalculator: CalculatorConfig = {
  slug: "salary-calculator",
  kind: "single",
  category: "personal-finance",

  title: "Salary Calculator — Take-Home Pay & Pay-Period Converter",
  metaDescription:
    "Free salary calculator — convert your salary between annual, monthly, weekly, and hourly, and estimate take-home pay after deductions. Enter your pay, the period, hours per week, and your deduction rate.",
  h1: "Salary Calculator.",
  intro:
    "Convert a salary between annual, monthly, weekly, and hourly, and estimate your take-home pay. Enter your pay and how often you're paid, your weekly hours, and your total deduction rate (tax plus any retirement or other withholdings) to see what you actually keep.",

  keywords: {
    primary: "salary calculator",
    secondary: [
      "take home pay calculator",
      "salary to hourly calculator",
      "hourly to salary calculator",
      "in hand salary calculator",
      "annual salary calculator",
    ],
    longTail: [
      "convert annual salary to hourly",
      "monthly take home pay calculator",
      "how much is my salary per hour",
      "gross to net salary calculator",
      "ctc to in hand salary calculator",
      "weekly pay calculator",
      "salary after tax calculator",
      "what is my hourly rate from salary",
    ],
    competition: "H",
    estVolume: 246000,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "IN",
  },

  inputs: [
    {
      id: "amount",
      label: "Pay amount",
      type: "currency",
      default: 60000,
      min: 0,
      help: "Your pay for the period selected below (e.g. annual salary, hourly rate).",
    },
    {
      id: "frequency",
      label: "This amount is per",
      type: "select",
      default: "annual",
      options: [
        { value: "annual", label: "Year (annual salary)" },
        { value: "monthly", label: "Month" },
        { value: "weekly", label: "Week" },
        { value: "hourly", label: "Hour" },
      ],
    },
    {
      id: "hoursPerWeek",
      label: "Hours per week",
      type: "number",
      default: 40,
      min: 1,
      max: 168,
      step: 1,
      help: "Used to convert to and from an hourly rate.",
    },
    {
      id: "deductionPercent",
      label: "Total deductions",
      type: "percent",
      default: 20,
      min: 0,
      max: 100,
      step: 0.5,
      help: "Your combined tax + retirement/PF + other withholdings as a percentage. This varies by country — enter your effective rate for an accurate take-home figure.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const amount = Math.max(0, Number(values.amount) || 0);
    const frequency = String(values.frequency || "annual") as PayFrequency;
    const hoursPerWeek = Math.max(1, Number(values.hoursPerWeek) || 40);
    const deductionPercent = Math.max(0, Number(values.deductionPercent) || 0);

    const r = computeSalary({ amount, frequency, hoursPerWeek, deductionPercent });

    return {
      headline: {
        label: "Annual take-home",
        display: ctx.formatCurrency(r.annualNet),
        sub: `${ctx.formatCurrency(r.monthlyNet)} per month · ${ctx.formatCurrency(r.hourlyNet)} per hour`,
      },
      rows: [
        { label: "Annual gross", display: ctx.formatCurrency(r.annualGross), kind: "default" },
        { label: `Deductions (${deductionPercent}%)`, display: ctx.formatCurrency(r.deductions), kind: "deduction" },
        { label: "Annual take-home", display: ctx.formatCurrency(r.annualNet), kind: "net" },
        { label: "Monthly take-home", display: ctx.formatCurrency(r.monthlyNet), kind: "net" },
        { label: "Equivalent hourly (gross)", display: ctx.formatCurrency(r.hourlyGross), kind: "muted" },
      ],
    };
  },

  howItWorks:
    "This salary calculator does two things: it converts pay between periods, and it estimates take-home pay after deductions.\n\nTo convert pay periods, everything is normalised to an annual figure first. A monthly amount is multiplied by 12; a weekly amount by 52; an hourly rate by your weekly hours and by 52. From the annual figure, the monthly equivalent is annual ÷ 12, the weekly is annual ÷ 52, and the hourly is annual ÷ (hours per week × 52). With a 40-hour week, a 52,000 annual salary equals 1,000 per week and 25.00 per hour.\n\nTo estimate take-home, the calculator applies your total deduction percentage to the gross: deductions = gross × rate, and take-home = gross − deductions. Because income tax, social security, and retirement contributions differ enormously by country (and by income within a country), you enter your own effective deduction rate. For example, an Indian employee converting CTC to in-hand pay would include PF and income tax in that percentage; a US employee would include federal and state tax plus FICA. This keeps the result accurate for your situation rather than relying on one country's tax table.",

  seoContent: `A salary calculator converts pay between annual, monthly, weekly, and hourly figures, and estimates your take-home pay after deductions. It answers the two questions people ask most about their pay: "what does this work out to per hour (or per month)?" and "how much do I actually keep?"

## Converting between pay periods

The calculator normalises whatever you enter to an annual salary, then derives every other period from it:

- **Monthly → annual:** × 12
- **Weekly → annual:** × 52
- **Hourly → annual:** × hours per week × 52
- **Annual → monthly:** ÷ 12
- **Annual → weekly:** ÷ 52
- **Annual → hourly:** ÷ (hours per week × 52)

Example: a 52,000 annual salary on a 40-hour week is 52,000 ÷ (40 × 52) = 25.00 per hour, 1,000 per week, and about 4,333 per month. Conversely, 25 per hour at 40 hours a week is 52,000 a year.

The number of working weeks matters. This calculator uses 52 weeks, which counts paid leave as working time (the standard approach for salaried roles). If you are paid hourly and take unpaid time off, your actual annual earnings will be lower.

## Estimating take-home pay

Gross pay is what you earn before deductions; take-home (net) pay is what lands in your account. The calculator applies your total deduction percentage:

- Deductions = gross × (rate ÷ 100)
- Take-home = gross − deductions

Example: on a 60,000 salary with 20% total deductions, you keep 48,000 a year — 4,000 a month.

## Why you enter your own deduction rate

Income tax, social security, and retirement contributions vary enormously between countries, and within a country they vary by income, filing status, and region. Rather than hard-coding one country's tax brackets (which would be wrong for everyone else, and quickly out of date), this calculator asks for your **effective deduction rate** — the combined percentage of gross that goes to tax and other withholdings. This makes the take-home figure accurate for your specific situation.

What to include in your deduction percentage:

- **India:** employee provident fund (PF), professional tax, and income tax (per your slab). To go from CTC to in-hand, also account for the employer's PF contribution, which is part of CTC but not paid to you as salary.
- **United States:** federal income tax, state income tax (where applicable), and FICA (Social Security and Medicare).
- **United Kingdom:** income tax and National Insurance, plus any pension contribution.
- **Australia, Canada, and others:** income tax plus any superannuation/retirement and social-insurance contributions.

If you don't know your effective rate, check a recent payslip: divide your total deductions by your gross pay for that period and multiply by 100.

## CTC vs. gross vs. in-hand (India)

In India, salaries are often quoted as **CTC** (Cost to Company) — the total the employer spends, including their PF contribution, gratuity, and sometimes benefits. Your **gross salary** is lower than CTC (it excludes the employer's contributions), and your **in-hand (take-home)** is lower still after employee PF, professional tax, and income tax. When using this calculator with a CTC figure, set your deduction percentage to cover all of these so the take-home reflects what actually reaches your account.

## Hourly, weekly, and contract workers

If you are paid by the hour or are comparing a contract rate to a salaried role, enter your hourly rate and weekly hours to see the annual equivalent — useful for comparing offers. Remember that salaried roles often include paid leave, health cover, and retirement contributions that an hourly or contract rate may not, so compare the total package, not just the headline numbers.

## Assumptions and limitations

This calculator assumes 52 weeks per year, a constant deduction percentage applied to the whole salary, and the weekly hours you enter. It does not apply progressive tax brackets, tax-free allowances, or country-specific rules automatically — you supply the effective deduction rate. For an exact net-pay figure, use your country's official tax tables or a payslip. Currency display adjusts to your selected country and auto-defaults to your region.`,

  workedExample: {
    scenario: "A 60,000 annual salary, 40 hours a week, with 20% total deductions.",
    steps: [
      { label: "Annual gross", value: "60,000" },
      { label: "Deductions (20%)", value: "12,000" },
      { label: "Annual take-home", value: "48,000" },
      { label: "Monthly take-home (÷ 12)", value: "4,000" },
      { label: "Hourly gross (÷ 2,080 hours)", value: "28.85" },
      { label: "Hourly take-home", value: "23.08" },
    ],
    result: "A 60,000 salary with 20% deductions is 48,000 take-home a year — about 4,000 a month, or an effective 23.08 per hour after deductions on a 40-hour week.",
  },

  faqs: [
    {
      q: "How do I convert my annual salary to an hourly rate?",
      a: "Divide your annual salary by your total working hours in a year (hours per week × 52). On a 40-hour week, a 52,000 salary is 52,000 ÷ 2,080 = 25.00 per hour. Enter your salary as 'per year' and the calculator shows the hourly equivalent.",
    },
    {
      q: "How do I calculate take-home pay?",
      a: "Subtract your total deductions from your gross pay. Take-home = gross × (1 − deduction rate). On 60,000 with 20% deductions, take-home is 48,000. Enter your effective deduction percentage (tax plus retirement and other withholdings) to estimate net pay.",
    },
    {
      q: "Why do I have to enter my own tax/deduction rate?",
      a: "Because tax rules differ hugely by country and by income, and change every year. Hard-coding one country's brackets would be wrong for most users. Entering your effective deduction rate — which you can find by dividing total deductions by gross pay on a recent payslip — gives an accurate result for your situation.",
    },
    {
      q: "What is the difference between CTC, gross, and in-hand salary?",
      a: "CTC (Cost to Company) is the total an employer spends, including their retirement contributions and benefits. Gross salary excludes the employer's contributions. In-hand (take-home) is what's left after your own tax, provident fund, and other deductions. In-hand is always lower than gross, which is lower than CTC.",
    },
    {
      q: "How many weeks does this calculator use per year?",
      a: "52 weeks, which treats paid leave as working time — the standard for salaried roles. If you are paid hourly and take unpaid leave, your actual annual earnings will be lower than the figure shown.",
    },
    {
      q: "Can I compare an hourly contract rate to a salary?",
      a: "Yes. Enter the hourly rate and your weekly hours to see the annual equivalent, then compare. Bear in mind a salaried role often includes paid leave, retirement contributions, and benefits an hourly rate may not, so compare the whole package rather than the headline figure.",
    },
  ],

  related: ["percentage-calculator", "gst-calculator", "loan-calculator"],

  sources: [],

  lastUpdated: "2026-06-15",
};
