/**
 * Verification cadence tiers — the single source of truth for how often each
 * calculator's rates are re-checked. Imported by both the audit-matrix generator
 * (scripts/rate-verify/matrix.ts) and the public /verification page so they can
 * never disagree.
 *
 * Tier 1 = twice a month (1st AND 15th): payment processors spanning many
 * countries, top-traffic marketplaces, and actively-changing platforms — where
 * an unnoticed change is most costly. Everything else (Tier 2) = monthly (1st).
 */
export const TIER1_SLUGS = [
  "stripe-fee-calculator",
  "paypal-fee-calculator",
  "etsy-fee-calculator",
  "amazon-seller-fee-calculator",
  "amazon-fba-calculator",
  "ebay-fee-calculator",
  "shopify-fee-calculator",
  "depop-fee-calculator",
  "tiktok-shop-fee-calculator",
] as const;

export const TIER1 = new Set<string>(TIER1_SLUGS);

/** Verified twice a month (1st + 15th) vs monthly (1st). */
export const tierOf = (slug: string): 1 | 2 => (TIER1.has(slug) ? 1 : 2);
