/**
 * Indexing allowlist — the ONLY pages that omit `noindex` and appear in the sitemap.
 *
 * WHY THIS EXISTS (read before widening):
 * GSC on 2026-08-07, domain age 110 days (registered 2026-04-19), **external
 * links: 0** — Google had indexed 1 of 72 pages and filed 18 under "crawled -
 * currently not indexed" (a re-validation on 7/17 failed on 7/25). No manual
 * action, no security issue, sitemap read successfully. So this is not a
 * technical fault: an unlinked young domain gets a tiny index allowance, and 70
 * near-identical calculator pages both spread that allowance to nothing and
 * match the template-at-scale shape Google's scaled-content systems throttle.
 *
 * The fix is to shrink the indexable surface to a batch small enough to clear
 * the bar, prove it indexes, then widen one batch at a time.
 *
 * Pages NOT listed here stay live, linked and usable — they just carry
 * `noindex, follow` (crawl paths and link equity still flow) and are kept out
 * of the sitemap.
 *
 * TO WIDEN: only once the current batch is actually indexed in GSC, append the
 * next batch to INDEXABLE_CALCULATORS, rebuild, and resubmit /sitemap.xml.
 * Widening before the current batch indexes just recreates the problem.
 *
 * ⚠ IRON REMINDER — DO NOT SKIP WHEN WIDENING:
 * After every page is indexed and the clusters are built, `related` must be
 * re-derived SITE-WIDE from genuine topical relevance, and every calculator
 * re-checked. Batch-1's `related` links were chosen under an indexing
 * constraint that no longer applies once this allowlist is retired.
 */

/** Non-calculator pages that stay indexable. Trust/E-E-A-T pages only — thin
 *  boilerplate (privacy, terms, contact) and the category hubs are held back
 *  with the calculator long tail. */
export const INDEXABLE_PAGES = ["/", "/about", "/methodology", "/verification"];

/**
 * Batch 1 — Cluster A (creator & membership platforms), the beachhead
 * CalcYourFinance-SEO-Battle-Plan.md Part B designates: "Index and rank Tier 1
 * first. Wins there build the domain trust that makes Tier 2/3 possible."
 * All five are Tier 1, none has been crawled yet, so none carries a prior
 * negative judgment.
 *
 * Stripe and PayPal were the first pick and were dropped: the Battle Plan rates
 * both "Tier 3 · Brutal" ("don't fight the head term yet"), and Google already
 * crawled and declined them on 2026-07-15 and 2026-07-20. Volume is the wrong
 * criterion for a batch whose only job is proving a page CAN index.
 */
export const INDEXABLE_CALCULATORS = [
  "ko-fi-fee-calculator",
  "buy-me-a-coffee-fee-calculator",
  "gumroad-fee-calculator",
  "substack-fee-calculator",
  "bandcamp-fee-calculator",
];

const allowed = new Set([
  ...INDEXABLE_PAGES,
  ...INDEXABLE_CALCULATORS.map((slug) => `/${slug}`),
]);

/** True if `path` (a canonical path, e.g. "/stripe-fee-calculator") may be indexed. */
export function isIndexable(path: string): boolean {
  return allowed.has(path);
}
