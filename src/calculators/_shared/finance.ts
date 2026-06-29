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

/* ---- SIP future value (Systematic Investment Plan) ----------------------- */

export interface SipFutureValueResult {
  /** Total corpus at the end of the investment period. */
  futureValue: number;
  /** Total amount invested: monthlyInvestment × months. */
  totalInvested: number;
  /** futureValue − totalInvested (estimated market returns). */
  estimatedReturns: number;
}

/**
 * SIP future value — annuity-due (beginning-of-period) monthly investment.
 *
 * Formula: FV = P × [((1+i)^n − 1) / i] × (1+i)
 *   where i = annualReturnPercent / 12 / 100  (monthly rate)
 *         n = months (total number of monthly investments)
 *
 * When i = 0 (zero-rate): FV = P × n.
 *
 * The annuity-due model is used because SIP contributions are typically
 * debited at the start of each month.
 *
 * All money values are rounded to cents (roundMoney).
 *
 * @param monthlyInvestment   Fixed monthly SIP amount (P).
 * @param annualReturnPercent Expected annual return as a percentage (e.g. 12 for 12%).
 * @param months              Investment horizon in months (n).
 */
export function sipFutureValue(
  monthlyInvestment: number,
  annualReturnPercent: number,
  months: number,
): SipFutureValueResult {
  const P = isFinite(monthlyInvestment) && monthlyInvestment > 0 ? monthlyInvestment : 0;
  const r = isFinite(annualReturnPercent) && annualReturnPercent >= 0 ? annualReturnPercent : 0;
  const n = isFinite(months) && months > 0 ? Math.round(months) : 0;

  const totalInvested = roundMoney(P * n);

  if (P === 0 || n === 0) {
    return { futureValue: 0, totalInvested: 0, estimatedReturns: 0 };
  }

  const i = r / 12 / 100; // monthly periodic rate

  let futureValue: number;
  if (i === 0) {
    futureValue = roundMoney(P * n);
  } else {
    const growth = Math.pow(1 + i, n);
    // Annuity-due: PMT × [((1+i)^n − 1) / i] × (1+i)
    futureValue = roundMoney(P * ((growth - 1) / i) * (1 + i));
  }

  const estimatedReturns = roundMoney(futureValue - totalInvested);

  return { futureValue, totalInvested, estimatedReturns };
}

/* ---- RD maturity (Recurring Deposit — Indian quarterly compounding) ------- */

export interface RdMaturityResult {
  /** Maturity amount (total deposited + interest earned). */
  maturity: number;
  /** Total of all monthly deposits: monthlyDeposit × months. */
  totalDeposited: number;
  /** maturity − totalDeposited (interest earned). */
  interestEarned: number;
}

/**
 * RD maturity value — per-installment quarterly compounding (Indian bank convention).
 *
 * Each monthly deposit R earns quarterly-compounded interest from the day it is
 * deposited until maturity. Deposit made in month k (1-indexed) earns for
 * (n − k + 1) months = (n − k + 1) / 3 quarters.
 *
 *   Maturity = Σ(k=1..n) R × (1 + r_q)^((n − k + 1) / 3)
 *   where r_q = annualRatePercent / 4 / 100  (quarterly rate)
 *
 * This is mathematically equivalent to the standard Indian bank RD formula:
 *   M = R × [(1+i)^Q − 1] / [1 − (1+i)^(−1/3)]
 *   where i = r_q and Q = n/3 (total quarters).
 *
 * Compounding assumption: quarterly (the RBI / Indian banking standard for RDs).
 * Verified against bankbazaar.com RD calculator (5000/mo, 7%, 60 mo → ₹3,59,663.95).
 *
 * When annualRatePercent = 0: maturity = monthlyDeposit × months.
 *
 * All money values are rounded to cents (roundMoney).
 *
 * @param monthlyDeposit      Fixed monthly deposit amount (R).
 * @param annualRatePercent   Annual interest rate as a percentage (e.g. 7 for 7%).
 * @param months              Tenure in months (n).
 */
export function rdMaturity(
  monthlyDeposit: number,
  annualRatePercent: number,
  months: number,
): RdMaturityResult {
  const R = isFinite(monthlyDeposit) && monthlyDeposit > 0 ? monthlyDeposit : 0;
  const r = isFinite(annualRatePercent) && annualRatePercent >= 0 ? annualRatePercent : 0;
  const n = isFinite(months) && months > 0 ? Math.round(months) : 0;

  const totalDeposited = roundMoney(R * n);

  if (R === 0 || n === 0) {
    return { maturity: 0, totalDeposited: 0, interestEarned: 0 };
  }

  if (r === 0) {
    return { maturity: totalDeposited, totalDeposited, interestEarned: 0 };
  }

  const i_q = r / 4 / 100; // quarterly rate

  let rawMaturity = 0;
  for (let k = 1; k <= n; k++) {
    const remainingMonths = n - k + 1;
    const quarters = remainingMonths / 3; // may be fractional
    rawMaturity += R * Math.pow(1 + i_q, quarters);
  }

  const maturity = roundMoney(rawMaturity);
  const interestEarned = roundMoney(maturity - totalDeposited);

  return { maturity, totalDeposited, interestEarned };
}
