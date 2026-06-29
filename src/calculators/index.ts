/**
 * THE REGISTRY. A new calculator = add its config import here.
 * Pages, hubs, sitemap, internal links and keyword aggregation all read this.
 */

import type { CalculatorConfig, Category } from "./_types";

import { stripeFeeCalculator } from "./stripe-fee-calculator/config";
import { paypalFeeCalculator } from "./paypal-fee-calculator/config";
import { etsyFeeCalculator } from "./etsy-fee-calculator/config";
import { squareFeeCalculator } from "./square-fee-calculator/config";
import { venmoFeeCalculator } from "./venmo-fee-calculator/config";
import { cashappFeeCalculator } from "./cashapp-fee-calculator/config";
import { wiseFeeCalculator } from "./wise-fee-calculator/config";
import { payoneerFeeCalculator } from "./payoneer-fee-calculator/config";
import { razorpayFeeCalculator } from "./razorpay-fee-calculator/config";
import { paytmFeeCalculator } from "./paytm-fee-calculator/config";
import { paddleFeeCalculator } from "./paddle-fee-calculator/config";
import { lemonSqueezyFeeCalculator } from "./lemon-squeezy-fee-calculator/config";
import { stripeVsPaypalCalculator } from "./stripe-vs-paypal-fee-calculator/config";
import { stripeVsSquareCalculator } from "./stripe-vs-square-fee-calculator/config";
import { squareVsPaypalCalculator } from "./square-vs-paypal-fee-calculator/config";
import { paypalVsVenmoCalculator } from "./paypal-vs-venmo-fee-calculator/config";
import { cashappVsPaypalCalculator } from "./cashapp-vs-paypal-fee-calculator/config";
import { cashappVsVenmoCalculator } from "./cashapp-vs-venmo-fee-calculator/config";
import { paddleVsLemonSqueezyCalculator } from "./paddle-vs-lemon-squeezy-fee-calculator/config";
import { wiseVsPaypalCalculator } from "./wise-vs-paypal-fee-calculator/config";
import { compoundInterestCalculator } from "./compound-interest-calculator/config";
import { interestCalculator } from "./interest-calculator/config";
import { emiCalculator } from "./emi-calculator/config";
import { loanCalculator } from "./loan-calculator/config";
import { fdCalculator } from "./fd-calculator/config";
import { sipCalculator } from "./sip-calculator/config";
import { rdCalculator } from "./rd-calculator/config";

export const calculators: CalculatorConfig[] = [
  stripeFeeCalculator,
  paypalFeeCalculator,
  etsyFeeCalculator,
  squareFeeCalculator,
  venmoFeeCalculator,
  cashappFeeCalculator,
  wiseFeeCalculator,
  payoneerFeeCalculator,
  razorpayFeeCalculator,
  paytmFeeCalculator,
  paddleFeeCalculator,
  lemonSqueezyFeeCalculator,
  stripeVsPaypalCalculator,
  stripeVsSquareCalculator,
  squareVsPaypalCalculator,
  paypalVsVenmoCalculator,
  cashappVsPaypalCalculator,
  cashappVsVenmoCalculator,
  paddleVsLemonSqueezyCalculator,
  wiseVsPaypalCalculator,
  compoundInterestCalculator,
  interestCalculator,
  emiCalculator,
  loanCalculator,
  fdCalculator,
  sipCalculator,
  rdCalculator,
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
