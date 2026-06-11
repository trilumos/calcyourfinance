/**
 * Money + rounding helpers. Fees and currency must be exact, so we round
 * explicitly at display boundaries rather than trusting float accumulation.
 */

import { getCountry, type CountryCode } from "./countries";

/** Round to cents (2 dp) using round-half-up on the integer cent value. */
export function roundMoney(value: number): number {
  // Avoid 1.005 -> 1.00 float errors: shift, round, shift back via epsilon nudge.
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round to an arbitrary number of decimal places (for %, ratios). */
export function roundTo(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Format a number as currency for a given country/currency. */
export function formatCurrency(
  value: number,
  country: CountryCode | string,
  opts: { maximumFractionDigits?: number } = {}
): string {
  const c = getCountry(country);
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.currency,
    maximumFractionDigits: opts.maximumFractionDigits ?? 2,
  }).format(value);
}

/** Format a percentage value (e.g. 2.9 -> "2.9%"). */
export function formatPercent(value: number, dp = 2): string {
  return `${roundTo(value, dp)}%`;
}

/** Format by ISO currency code directly (for tools not keyed to a country, e.g. Wise corridors). */
export function formatByCurrency(value: number, currency: string, locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${roundMoney(value)} ${currency}`;
  }
}

/** Format a plain number with locale grouping. */
export function formatNumber(value: number, country: CountryCode | string, dp = 0): string {
  const c = getCountry(country);
  return new Intl.NumberFormat(c.locale, {
    maximumFractionDigits: dp,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Clamp a value into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
