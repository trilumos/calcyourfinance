/**
 * Stripe vs Square comparison — PURE. Composes the two unit-tested formulas on
 * their ONLINE card rate and decides the verdict via the shared comparison rule.
 */
import { decideComparison } from "../../lib/compare";
import { computeStripeFee, type StripeFeeBreakdown } from "../stripe-fee-calculator/formula";
import { computeSquareFee, type SquareFeeBreakdown } from "../square-fee-calculator/formula";

export interface CompareInput {
  amount: number;
  mode: "charge" | "net";
  international?: boolean;
  stripe: {
    percent: number;
    fixed: number;
    intlSurcharge?: number;
    fxPercent?: number;
    taxOnFeePercent?: number;
  };
  square: {
    percent: number;
    fixed: number;
    intlSurcharge?: number;
    taxOnFeePercent?: number;
  };
}

export interface CompareResult {
  stripe: StripeFeeBreakdown;
  square: SquareFeeBreakdown;
  winner: "stripe" | "square" | "tie";
  savings: number;
}

export function compareStripeSquare(input: CompareInput): CompareResult {
  const { amount, mode, international = false } = input;

  const stripe = computeStripeFee({
    amount,
    mode,
    percent: input.stripe.percent,
    fixed: input.stripe.fixed,
    intlSurcharge: input.stripe.intlSurcharge,
    fxPercent: input.stripe.fxPercent,
    taxOnFeePercent: input.stripe.taxOnFeePercent,
    international,
  });

  const square = computeSquareFee({
    amount,
    mode,
    percent: input.square.percent,
    fixed: input.square.fixed,
    intlSurcharge: input.square.intlSurcharge,
    taxOnFeePercent: input.square.taxOnFeePercent,
    international,
  });

  const { winner, savings } = decideComparison(stripe, square, mode);

  return {
    stripe,
    square,
    winner: winner === "a" ? "stripe" : winner === "b" ? "square" : "tie",
    savings,
  };
}
