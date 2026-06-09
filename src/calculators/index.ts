/**
 * THE REGISTRY. A new calculator = add its config import here.
 * Pages, hubs, sitemap, internal links and keyword aggregation all read this.
 */

import type { CalculatorConfig, Category } from "./_types";

import { stripeFeeCalculator } from "./stripe-fee-calculator/config";
import { paypalFeeCalculator } from "./paypal-fee-calculator/config";
import { etsyFeeCalculator } from "./etsy-fee-calculator/config";
import { stripeVsPaypalCalculator } from "./stripe-vs-paypal-fee-calculator/config";

export const calculators: CalculatorConfig[] = [
  stripeFeeCalculator,
  paypalFeeCalculator,
  etsyFeeCalculator,
  stripeVsPaypalCalculator,
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
