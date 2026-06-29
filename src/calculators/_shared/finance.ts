/**
 * Shared finance formula core.
 * Pure functions — no formatting, no side effects.
 * Uses roundMoney / roundTo from lib/money for deterministic rounding.
 */

import { roundMoney } from "../../lib/money";

/* ---- Simple interest ------------------------------------------------------ */

export interface SimpleInterestResult {
  interest: number;
  total: number;
}

/**
 * Simple interest: I = P × r × t
 *
 * @param principal  Starting amount (P). Negative or non-finite → treated as 0.
 * @param ratePercent Annual interest rate as a percentage (e.g. 8 for 8%).
 * @param years       Time in years. Negative or non-finite → treated as 0.
 * @returns           interest (I) and total (P + I), both rounded to cents.
 */
export function simpleInterest(
  principal: number,
  ratePercent: number,
  years: number,
): SimpleInterestResult {
  // Guard non-finite / negative inputs.
  const P = isFinite(principal) && principal > 0 ? principal : 0;
  const r = isFinite(ratePercent) && ratePercent >= 0 ? ratePercent : 0;
  const t = isFinite(years) && years >= 0 ? years : 0;

  const interest = roundMoney(P * (r / 100) * t);
  const total = roundMoney(P + interest);

  return { interest, total };
}

/* ---- Compound future value ----------------------------------------------- */

export interface CompoundFVInput {
  /** Starting principal (P). Negative or non-finite → treated as 0. */
  principal: number;
  /** Annual interest rate as a percentage (e.g. 8 for 8%). */
  ratePercent: number;
  /** Investment horizon in years. */
  years: number;
  /** How many times interest is compounded per year (e.g. 12 = monthly). */
  compoundsPerYear: number;
  /**
   * Regular contribution made each compounding period.
   * Model: an ordinary annuity (end-of-period) by default.
   * Defaults to 0 if omitted.
   */
  contribution?: number;
  /**
   * When true, contributions are made at the START of each period
   * (annuity-due). Multiplies the annuity term by (1 + i).
   * Default: false (ordinary annuity, end-of-period).
   */
  annuityDue?: boolean;
}

export interface CompoundFVResult {
  /** Future value of the investment (P + contributions + interest). */
  futureValue: number;
  /** Total of all periodic contributions: contribution × N. */
  totalContributions: number;
  /** Principal + totalContributions (i.e. total money put in). */
  totalPrincipal: number;
  /** futureValue − totalPrincipal (interest / growth earned). */
  interest: number;
}

/* ---- EMI (Equated Monthly Installment / monthly loan payment) ------------ */

export interface EmiResult {
  /** Monthly instalment, rounded to cents. */
  emi: number;
  /** Total amount paid over the loan term (emi × months), rounded to cents. */
  totalPayment: number;
  /** Total interest paid (totalPayment − principal), rounded to cents. */
  totalInterest: number;
}

/**
 * EMI = P × i × (1 + i)^n / ((1 + i)^n − 1)
 * where i = annualRatePercent / 12 / 100  (monthly rate)
 *       n = months
 *
 * When i = 0 (zero-rate loan): EMI = P / n.
 *
 * All money values are rounded to cents (roundMoney).
 * Negative or non-finite principal / months are treated as 0.
 *
 * @param principal          Loan amount (P).
 * @param annualRatePercent  Annual interest rate as a percentage (e.g. 9 for 9%).
 * @param months             Loan tenure in months (n).
 */
export function emi(
  principal: number,
  annualRatePercent: number,
  months: number,
): EmiResult {
  const P = isFinite(principal) && principal > 0 ? principal : 0;
  const r = isFinite(annualRatePercent) && annualRatePercent >= 0 ? annualRatePercent : 0;
  const n = isFinite(months) && months > 0 ? Math.round(months) : 0;

  if (P === 0 || n === 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0 };
  }

  const i = r / 12 / 100; // monthly periodic rate

  let emiValue: number;
  if (i === 0) {
    emiValue = roundMoney(P / n);
  } else {
    const pow = Math.pow(1 + i, n);
    emiValue = roundMoney((P * i * pow) / (pow - 1));
  }

  const totalPayment = roundMoney(emiValue * n);
  const totalInterest = roundMoney(totalPayment - P);

  return { emi: emiValue, totalPayment, totalInterest };
}

/* ---- Compound future value ----------------------------------------------- */

/**
 * Compound future value with optional regular contributions.
 *
 * Formula (ordinary annuity, i ≠ 0):
 *   A = P × (1 + i)^N  +  PMT × [((1 + i)^N − 1) / i]
 *
 * Annuity-due variant (contributions at period start):
 *   A = P × (1 + i)^N  +  PMT × [((1 + i)^N − 1) / i] × (1 + i)
 *
 * When i = 0 (zero rate):
 *   A = P + PMT × N
 *
 * where i = ratePercent / 100 / compoundsPerYear
 *       N = compoundsPerYear × years
 *
 * All money values are rounded to cents (roundMoney).
 * Negative or non-finite principal / contributions are treated as 0.
 */
export function compoundFutureValue(input: CompoundFVInput): CompoundFVResult {
  const {
    ratePercent,
    years,
    compoundsPerYear,
    annuityDue = false,
  } = input;

  // Guard inputs.
  const P =
    isFinite(input.principal) && input.principal > 0 ? input.principal : 0;
  const PMT =
    isFinite(input.contribution ?? 0) && (input.contribution ?? 0) > 0
      ? (input.contribution as number)
      : 0;
  const r = isFinite(ratePercent) && ratePercent >= 0 ? ratePercent : 0;
  const n = isFinite(compoundsPerYear) && compoundsPerYear > 0 ? compoundsPerYear : 1;
  const t = isFinite(years) && years > 0 ? years : 0;

  const i = r / 100 / n; // periodic rate
  const N = n * t; // total compounding periods

  const totalContributions = roundMoney(PMT * N);
  const totalPrincipal = roundMoney(P + totalContributions);

  let futureValue: number;

  if (i === 0) {
    // Zero-rate branch: no growth, just accumulation.
    futureValue = roundMoney(P + PMT * N);
  } else {
    const growth = Math.pow(1 + i, N);
    const principalFV = P * growth;
    // Ordinary annuity factor: ((1+i)^N - 1) / i
    const annuityFactor = (growth - 1) / i;
    const dueMult = annuityDue ? 1 + i : 1;
    const contributionFV = PMT * annuityFactor * dueMult;
    futureValue = roundMoney(principalFV + contributionFV);
  }

  const interest = roundMoney(futureValue - totalPrincipal);

  return { futureValue, totalContributions, totalPrincipal, interest };
}
