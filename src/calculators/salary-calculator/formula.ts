/**
 * Salary / wage converter + take-home. Pure, rounded to cents.
 * Tax varies by country, so deductions are supplied by the user as a single
 * effective percentage (income tax + retirement/PF + any other withholdings).
 */
import { roundMoney } from "../../lib/money";

export type PayFrequency = "annual" | "monthly" | "weekly" | "hourly";

export interface SalaryResult {
  annualGross: number;
  deductions: number;
  annualNet: number;
  monthlyNet: number;
  weeklyNet: number;
  hourlyGross: number;
  hourlyNet: number;
}

const WEEKS_PER_YEAR = 52;

export function computeSalary(input: {
  amount: number;
  frequency: PayFrequency;
  hoursPerWeek: number;
  deductionPercent: number;
}): SalaryResult {
  const amt = isFinite(input.amount) && input.amount > 0 ? input.amount : 0;
  const hpw = isFinite(input.hoursPerWeek) && input.hoursPerWeek > 0 ? input.hoursPerWeek : 40;
  const dpct =
    isFinite(input.deductionPercent) && input.deductionPercent >= 0
      ? Math.min(input.deductionPercent, 100)
      : 0;

  let annualGross: number;
  switch (input.frequency) {
    case "monthly":
      annualGross = amt * 12;
      break;
    case "weekly":
      annualGross = amt * WEEKS_PER_YEAR;
      break;
    case "hourly":
      annualGross = amt * hpw * WEEKS_PER_YEAR;
      break;
    default:
      annualGross = amt;
  }

  const deductions = annualGross * (dpct / 100);
  const annualNet = annualGross - deductions;
  const annualHours = hpw * WEEKS_PER_YEAR;

  return {
    annualGross: roundMoney(annualGross),
    deductions: roundMoney(deductions),
    annualNet: roundMoney(annualNet),
    monthlyNet: roundMoney(annualNet / 12),
    weeklyNet: roundMoney(annualNet / WEEKS_PER_YEAR),
    hourlyGross: roundMoney(annualHours > 0 ? annualGross / annualHours : 0),
    hourlyNet: roundMoney(annualHours > 0 ? annualNet / annualHours : 0),
  };
}
