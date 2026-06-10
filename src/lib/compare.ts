/**
 * Shared verdict logic for every fee-comparison calculator. Each comparison
 * computes both platforms with their own pure formula, then hands the two
 * results here to decide the winner — so the rule lives in ONE place.
 *
 *   charge mode → both keep a cut of the same charge; the HIGHER net wins.
 *   net mode    → both gross up to the same take-home; the LOWER charge wins.
 *
 * A difference that rounds to zero is a tie (no misleading "cheaper by $0.00").
 */
import { roundMoney } from "./money";
import { computeFlatFee, type FlatFeeBreakdown, type FlatFeeInput } from "./flatFee";

export type CompareMode = "charge" | "net";
export type Winner = "a" | "b" | "tie";

/** The two numbers any platform formula produces that the verdict needs. */
export interface Side {
  charge: number;
  net: number;
}

export interface Verdict {
  winner: Winner;
  /** Absolute gap in the decisive metric (net in charge mode, charge in net mode). */
  savings: number;
}

export function decideComparison(a: Side, b: Side, mode: CompareMode): Verdict {
  const aMetric = mode === "net" ? a.charge : a.net;
  const bMetric = mode === "net" ? b.charge : b.net;
  const savings = roundMoney(Math.abs(aMetric - bMetric));

  let winner: Winner;
  if (savings === 0) winner = "tie";
  else if (mode === "net") winner = aMetric < bMetric ? "a" : "b";
  else winner = aMetric > bMetric ? "a" : "b";

  return { winner, savings };
}

/** A flat-fee platform's rate params (everything computeFlatFee needs but the amount/mode). */
export type FlatParams = Omit<FlatFeeInput, "amount" | "mode">;

export interface FlatComparison {
  a: FlatFeeBreakdown;
  b: FlatFeeBreakdown;
  winner: Winner;
  savings: number;
}

/**
 * Compare two flat-rate platforms on the same amount: compute each with
 * computeFlatFee, then decide the winner. Used by the flat-processor
 * comparisons (PayPal vs Venmo, Cash App vs PayPal, Cash App vs Venmo, …).
 */
export function compareFlat(
  amount: number,
  mode: CompareMode,
  a: FlatParams,
  b: FlatParams,
): FlatComparison {
  const ra = computeFlatFee({ amount, mode, ...a });
  const rb = computeFlatFee({ amount, mode, ...b });
  const { winner, savings } = decideComparison(ra, rb, mode);
  return { a: ra, b: rb, winner, savings };
}
