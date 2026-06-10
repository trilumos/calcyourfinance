/**
 * THE REGISTRY. A new calculator = add its config import here.
 * Pages, hubs, sitemap, internal links and keyword aggregation all read this.
 */

import type { CalculatorConfig, Category } from "./_types";

import { stripeFeeCalculator } from "./stripe-fee-calculator/config";
import { paypalFeeCalculator } from "./paypal-fee-calculator/config";
import { etsyFeeCalculator } from "./etsy-fee-calculator/config";
import { squareFeeCalculator } from "./square-fee-calculator/config";
import { stripeVsPaypalCalculator } from "./stripe-vs-paypal-fee-calculator/config";
import { stripeVsSquareCalculator } from "./stripe-vs-square-fee-calculator/config";
import { squareVsPaypalCalculator } from "./square-vs-paypal-fee-calculator/config";

export const calculators: CalculatorConfig[] = [
  stripeFeeCalculator,
  paypalFeeCalculator,
  etsyFeeCalculator,
  squareFeeCalculator,
  stripeVsPaypalCalculator,
  stripeVsSquareCalculator,
  squareVsPaypalCalculator,
];

/* ---- Lookups ------------------------------------------------------------- */
export function getCalculator(slug: string): CalculatorConfig | undefined {
  return calculators.find((c) => c.slug === slug);
}

export function calculatorsByCategory(category: Category): CalculatorConfig[] {
  return calculators.filter((c) => c.category === category);
}

export function relatedCalculators(config: CalculatorConfig): CalculatorConfig[] {
  return config.related
    .map((slug) => getCalculator(slug))
    .filter((c): c is CalculatorConfig => Boolean(c));
}

/** Categories that actually have calculators (for hub generation + nav). */
export function activeCategories(): Category[] {
  return [...new Set(calculators.map((c) => c.category))];
}

/**
 * Comparison pages that feature a given platform (e.g. "stripe" →
 * Stripe vs PayPal, Stripe vs Square). Drives the "compare with other
 * platforms" cross-link on each single calculator. Auto-derived from
 * `comparisonOf`, so adding a comparison surfaces the link automatically.
 */
export function comparisonsForPlatform(platform: string): CalculatorConfig[] {
  return calculators.filter(
    (c) => c.kind === "comparison" && (c.comparisonOf ?? []).includes(platform),
  );
}
