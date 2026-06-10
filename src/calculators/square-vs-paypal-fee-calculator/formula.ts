/**
 * Square vs PayPal comparison — PURE. Square on its online rate vs the chosen
 * PayPal product. Verdict via the shared comparison rule.
 */
import { decideComparison } from "../../lib/compare";
import { computeSquareFee, type SquareFeeBreakdown } from "../square-fee-calculator/formula";
import { computePayPalFee, type PayPalFeeBreakdown } from "../paypal-fee-calculator/formula";

export interface CompareInput {
  amount: number;
  mode: "charge" | "net";
  international?: boolean;
  square: {
    percent: number;
    fixed: number;
    intlSurcharge?: number;
    taxOnFeePercent?: number;
  };
  paypal: {
    percent: number;
    fixed: number;
    crossBorderPercent?: number;
  };
}

export interface CompareResult {
  square: SquareFeeBreakdown;
  paypal: PayPalFeeBreakdown;
  winner: "square" | "paypal" | "tie";
  savings: number;
}

export function compareSquarePaypal(input: CompareInput): CompareResult {
  const { amount, mode, international = false } = input;

  const square = computeSquareFee({
    amount,
    mode,
    percent: input.square.percent,
    fixed: input.square.fixed,
    intlSurcharge: input.square.intlSurcharge,
    taxOnFeePercent: input.square.taxOnFeePercent,
    international,
  });

  const paypal = computePayPalFee({
    amount,
    mode,
    percent: input.paypal.percent,
    fixed: input.paypal.fixed,
    crossBorderPercent: input.paypal.crossBorderPercent,
    international,
  });

  const { winner, savings } = decideComparison(square, paypal, mode);

  return {
    square,
    paypal,
    winner: winner === "a" ? "square" : winner === "b" ? "paypal" : "tie",
    savings,
  };
}
