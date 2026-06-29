import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import { computePercentage, type PercentMode } from "./formula";

export const percentageCalculator: CalculatorConfig = {
  slug: "percentage-calculator",
  kind: "single",
  category: "personal-finance",

  title: "Percentage Calculator",
  metaDescription:
    "Free percentage calculator — find X% of a number, work out what percent one number is of another, or calculate the percentage increase or decrease between two values. Fast, accurate, and free.",
  h1: "Percentage Calculator.",
  intro:
    "Work out percentages every way: find X% of a number, see what percent one number is of another, or calculate the percentage increase or decrease between two values. Pick the operation, enter your two numbers, and get the answer instantly.",

  keywords: {
    primary: "percentage calculator",
    secondary: [
      "percent calculator",
      "percentage increase calculator",
      "percentage decrease calculator",
      "percentage change calculator",
      "percentage difference calculator",
    ],
    longTail: [
      "what is x percent of y",
      "how to calculate percentage",
      "percentage of a number calculator",
      "percent change calculator",
      "how to find what percentage one number is of another",
      "percentage increase formula",
      "calculate percentage between two numbers",
      "percent off calculator",
    ],
    competition: "H",
    estVolume: 1220000,
    intent: "tool",
  },

  inputs: [
    {
      id: "mode",
      label: "Operation",
      type: "select",
      default: "percent_of",
      options: [
        { value: "percent_of", label: "What is A% of B?" },
        { value: "is_what_percent", label: "A is what percent of B?" },
        { value: "percent_change", label: "Percentage change from A to B" },
        { value: "increase_by", label: "Increase A by B%" },
        { value: "decrease_by", label: "Decrease A by B%" },
      ],
    },
    {
      id: "a",
      label: "First number (A)",
      type: "number",
      default: 25,
      step: "any",
    },
    {
      id: "b",
      label: "Second number (B)",
      type: "number",
      default: 200,
      step: "any",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const mode = String(values.mode || "percent_of") as PercentMode;
    const a = Number(values.a) || 0;
    const b = Number(values.b) || 0;

    const r = computePercentage(mode, a, b);
    const display = r.isPercent ? ctx.formatPercent(r.value) : ctx.formatNumber(r.value, 2);

    const labels: Record<PercentMode, string> = {
      percent_of: `${a}% of ${b}`,
      is_what_percent: `${a} is what percent of ${b}`,
      percent_change: `Change from ${a} to ${b}`,
      increase_by: `${a} increased by ${b}%`,
      decrease_by: `${a} decreased by ${b}%`,
    };

    return {
      headline: {
        label: "Result",
        display,
        sub: labels[mode],
      },
      rows: [
        { label: "First number (A)", display: ctx.formatNumber(a, 2), kind: "default" },
        { label: "Second number (B)", display: ctx.formatNumber(b, 2), kind: "default" },
        { label: "Answer", display, kind: "net" },
      ],
    };
  },

  howItWorks:
    "A percentage is a fraction out of 100. This calculator covers the everyday percentage questions.\n\n• What is A% of B? Multiply: result = B × (A ÷ 100). So 25% of 200 = 200 × 0.25 = 50.\n\n• A is what percent of B? Divide and multiply by 100: result = (A ÷ B) × 100. So 25 is (25 ÷ 200) × 100 = 12.5% of 200.\n\n• Percentage change from A to B: result = ((B − A) ÷ A) × 100. A positive answer is an increase, negative is a decrease. From 200 to 250 is ((250 − 200) ÷ 200) × 100 = +25%.\n\n• Increase or decrease A by B%: multiply by (1 ± B ÷ 100). Increasing 200 by 25% gives 200 × 1.25 = 250; decreasing it by 25% gives 200 × 0.75 = 150.\n\nPick the operation above and the calculator applies the right formula and explains the result in words.",

  seoContent: `A percentage calculator handles the four or five percentage questions that come up constantly in everyday life, school, shopping, and business. Pick an operation, enter your two numbers, and get the answer with the calculation explained.

## What is A% of B?

This is the most common percentage question — finding a portion of a number. The formula is:

Result = B × (A ÷ 100)

Example: What is 25% of 200? → 200 × 0.25 = 50. This is how you work out a tip, a discount amount, a tax, or a commission. A 15% tip on an 80 bill is 80 × 0.15 = 12.

## A is what percent of B?

This reverses the question — you have two numbers and want to know what proportion one is of the other. The formula is:

Result = (A ÷ B) × 100

Example: 25 is what percent of 200? → (25 ÷ 200) × 100 = 12.5%. This is how you work out a test score (45 out of 60 = 75%), a market share, or how much of a budget a cost represents.

## Percentage change from A to B

This measures how much a value has gone up or down, as a percentage of the starting value:

Result = ((B − A) ÷ A) × 100

A positive result is an increase; a negative result is a decrease. Example: a price rising from 200 to 250 is ((250 − 200) ÷ 200) × 100 = +25%. A price falling from 200 to 150 is −25%. This is the right tool for price changes, salary rises, investment returns, and growth rates.

A key subtlety: percentage change is not symmetric. Going from 200 to 250 is a +25% change, but going back from 250 to 200 is a −20% change — because the base you divide by is different each time. Always divide by the starting value.

## Increase or decrease A by B%

This applies a percentage change to a number:

- Increase: Result = A × (1 + B ÷ 100)
- Decrease: Result = A × (1 − B ÷ 100)

Example: increasing 200 by 25% gives 250; decreasing it by 25% gives 150. Use the decrease mode for "percent off" sale prices — an item marked down 30% from 80 costs 80 × 0.70 = 56.

## Why "subtract the percentage" can mislead

A common error is to add a percentage and then subtract the same percentage expecting to return to the start. If you increase 100 by 10% you get 110; decreasing 110 by 10% gives 99, not 100 — because the 10% is taken from a larger base the second time. This calculator's separate increase and decrease modes make each step explicit so you avoid the trap.

## Everyday uses

- **Shopping:** discount amounts ("25% off"), final sale prices, and sales tax or VAT on top.
- **Tips and service charges:** a percentage of the bill.
- **Grades and scores:** marks out of a total, expressed as a percentage.
- **Finance:** interest, returns, growth rates, and percentage changes in prices or salaries.
- **Statistics:** what share one figure is of a total, and how figures change over time.

## Tips for mental math

To find 10% of a number, move the decimal one place left (10% of 250 = 25). To find 5%, halve the 10% figure. To find 20%, double the 10% figure. To find 15% (a common tip), add the 10% and 5% figures. These shortcuts let you estimate percentages quickly without a calculator, and this tool gives you the exact figure when you need it.

## How to use this calculator

Choose the operation that matches your question, enter the two numbers (labelled A and B to match each operation's wording), and read the answer and the plain-language description of the calculation. Switch the operation to ask a different question of the same numbers — for example, find 25% of 200, then ask what percent 25 is of 200, to see how the questions differ.`,

  workedExample: {
    scenario: "Four ways to use percentages with the numbers 25 and 200.",
    steps: [
      { label: "25% of 200", value: "50" },
      { label: "25 is what percent of 200", value: "12.5%" },
      { label: "Percentage change from 200 to 250", value: "+25%" },
      { label: "200 increased by 25%", value: "250" },
      { label: "200 decreased by 25%", value: "150" },
    ],
    result: "The same two numbers answer very different questions depending on the operation — 25% of 200 is 50, while 25 is 12.5% of 200.",
  },

  faqs: [
    {
      q: "How do I calculate a percentage of a number?",
      a: "Multiply the number by the percentage divided by 100. For 25% of 200: 200 × (25 ÷ 100) = 50. Select 'What is A% of B?', enter 25 and 200, and read the answer.",
    },
    {
      q: "How do I work out what percent one number is of another?",
      a: "Divide the part by the whole and multiply by 100. For example, 45 out of 60 is (45 ÷ 60) × 100 = 75%. Use the 'A is what percent of B?' mode.",
    },
    {
      q: "How do I calculate percentage increase or decrease?",
      a: "Subtract the old value from the new, divide by the old value, and multiply by 100: ((new − old) ÷ old) × 100. A positive result is an increase; a negative one is a decrease. Use the 'Percentage change from A to B' mode.",
    },
    {
      q: "Why isn't a percentage increase the same as the reverse decrease?",
      a: "Because the base changes. Going from 200 to 250 is +25% (50 ÷ 200), but going from 250 back to 200 is −20% (50 ÷ 250). The increase and decrease are measured against different starting values, so the percentages differ.",
    },
    {
      q: "How do I calculate a discount or 'percent off' price?",
      a: "Use the 'Decrease A by B%' mode. An item priced 80 with 30% off costs 80 × (1 − 0.30) = 56. The discount amount itself is 80 × 0.30 = 24.",
    },
    {
      q: "What is a quick way to estimate percentages in my head?",
      a: "Find 10% by moving the decimal one place left, then build from there: 5% is half of 10%, 20% is double, and 15% is 10% plus 5%. For a 15% tip on 60: 10% is 6, 5% is 3, so 15% is 9.",
    },
  ],

  related: ["gst-calculator", "compound-interest-calculator", "salary-calculator"],

  sources: [],

  lastUpdated: "2026-06-15",
};
