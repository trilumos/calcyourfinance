/**
 * Editorial demand ordering — which calculators people are most likely to want,
 * per category. Used to pick and order the subset shown on the homepage.
 *
 * WHY THIS EXISTS (read before changing):
 * Real per-keyword search volume is gated behind paid tools (Google Keyword
 * Planner / Ahrefs / Semrush) and is NOT retrievable programmatically — the
 * per-calculator `keywords.md` files say as much ("volumes are estimates, paid
 * SEO tools gated"), and for Amazon the tools state outright that genuine
 * search-volume data has never been released. Only ~13 configs carry a
 * researched `estVolume`, all but three of them personal-finance.
 *
 * So this list is an EXPLICIT EDITORIAL RANKING by well-known platform demand,
 * deliberately NOT fabricated volume numbers in `estVolume` (that field must
 * only ever hold researched figures, or the keyword workflow inherits garbage).
 *
 * UPGRADE PATH: once real volumes are available (export the primary keywords
 * from Keyword Planner), populate `keywords.estVolume` on each config. The
 * homepage sorter prefers a researched `estVolume` over this list automatically,
 * so accurate data takes over with no code change here.
 */
export const DEMAND_ORDER: Record<string, string[]> = {
  "payment-fees": [
    "paypal-fee-calculator",
    "stripe-fee-calculator",
    "cashapp-fee-calculator",
    "venmo-fee-calculator",
    "square-fee-calculator",
    "wise-fee-calculator",
    "razorpay-fee-calculator",
    "payoneer-fee-calculator",
    "paytm-fee-calculator",
    "paddle-fee-calculator",
    "lemon-squeezy-fee-calculator",
  ],
  "ecommerce-fees": [
    "amazon-fba-calculator",
    "ebay-fee-calculator",
    "etsy-fee-calculator",
    "shopify-fee-calculator",
    "amazon-seller-fee-calculator",
    "poshmark-fee-calculator",
    "mercari-fee-calculator",
    "depop-fee-calculator",
    "tiktok-shop-fee-calculator",
    "fiverr-fee-calculator",
    "upwork-fee-calculator",
    "printful-profit-calculator",
    "gumroad-fee-calculator",
    "patreon-fee-calculator",
    "vinted-fee-calculator",
    "stockx-fee-calculator",
    "printify-profit-calculator",
    "redbubble-profit-calculator",
    "walmart-seller-fee-calculator",
    "app-store-fee-calculator",
    "facebook-marketplace-fee-calculator",
    "teespring-profit-calculator",
    "ko-fi-fee-calculator",
    "buy-me-a-coffee-fee-calculator",
    "substack-fee-calculator",
    "teachable-fee-calculator",
    "podia-fee-calculator",
    "kajabi-fee-calculator",
    "bandcamp-fee-calculator",
    "reverb-fee-calculator",
    "whatnot-fee-calculator",
  ],
  // Personal finance already has researched estVolume on every config; this
  // mirrors that order so the two signals never disagree.
  "personal-finance": [
    "percentage-calculator",
    "sip-calculator",
    "salary-calculator",
    "gst-calculator",
    "rd-calculator",
    "loan-calculator",
    "compound-interest-calculator",
    "emi-calculator",
    "fd-calculator",
    "interest-calculator",
  ],
};

/** Rank within a category: lower is higher demand. Unlisted sorts last. */
export function demandRank(category: string, slug: string): number {
  const i = DEMAND_ORDER[category]?.indexOf(slug) ?? -1;
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}
