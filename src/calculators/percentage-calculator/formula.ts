/**
 * Multi-mode percentage math. Pure; results rounded to 2 dp.
 * `a` and `b` are the two user-entered numbers; each mode interprets them.
 */
import { roundTo } from "../../lib/money";

export type PercentMode =
  | "percent_of" // a% of b
  | "is_what_percent" // a is what % of b
  | "percent_change" // % change from a to b
  | "increase_by" // a increased by b%
  | "decrease_by"; // a decreased by b%

export interface PercentResult {
  /** The numeric result. */
  value: number;
  /** True when `value` is itself a percentage (e.g. "12.5%"). */
  isPercent: boolean;
}

export function computePercentage(
  mode: PercentMode,
  a: number,
  b: number,
): PercentResult {
  const x = isFinite(a) ? a : 0;
  const y = isFinite(b) ? b : 0;

  switch (mode) {
    case "percent_of":
      return { value: roundTo(y * (x / 100), 2), isPercent: false };
    case "is_what_percent":
      return { value: y !== 0 ? roundTo((x / y) * 100, 2) : 0, isPercent: true };
    case "percent_change":
      return { value: x !== 0 ? roundTo(((y - x) / x) * 100, 2) : 0, isPercent: true };
    case "increase_by":
      return { value: roundTo(x * (1 + y / 100), 2), isPercent: false };
    case "decrease_by":
      return { value: roundTo(x * (1 - y / 100), 2), isPercent: false };
    default:
      return { value: 0, isPercent: false };
  }
}
