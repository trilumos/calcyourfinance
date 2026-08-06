/**
 * VERIFICATION LOG — the public, timestamped record of every rate-check session.
 * This is our credibility source: users can see exactly which calculators we
 * re-verified, when, for how long, and against what. Rendered at /verification.
 *
 * Append newest-first. Record real UTC start/end times captured at the session.
 * Cadence: Tier-1 calculators the 1st AND 15th; all fee calculators the 1st
 * (see src/config/rate-history.ts for the resulting rate changes, and
 * rate-verification/matrix.md for the working checklist).
 */

export interface VerificationSession {
  /** Session date, YYYY-MM-DD. */
  date: string;
  /** UTC start / end times, HH:MM. */
  startUTC: string;
  endUTC: string;
  /** Which cadence slot this was. */
  slot: "full" | "tier-1" | "ad-hoc";
  /** Human summary of what was covered. */
  scope: string;
  /** Depth of the country coverage this session. */
  coverage: string;
  /** One-line outcome. */
  result: string;
  /** Slugs where a rate change was found + applied (may be empty). */
  changes: string[];
  /** How it was verified. */
  method: string;
}

export const verificationLog: VerificationSession[] = [
  {
    date: "2026-08-06",
    startUTC: "06:42",
    endUTC: "07:45",
    slot: "full",
    scope:
      "Full audit (August cycle, run 5 days after the 1st). Re-verified every Tier-1 and payment-processor platform against its official page, and replaced Zendesk-only citations with reachable main-domain sources across the site.",
    coverage:
      "No rate changes found anywhere checked. 7 calculators fully re-verified today (Reverb, Ko-fi, Fiverr, Upwork, Printful, TikTok Shop, Depop). Country-heavy tables (Stripe/PayPal/Etsy and the rest) re-confirmed stable at platform + major-market level — including the Stripe New Zealand cut effective Dec 2025, which our value already matched (2.65% + NZ$0.30).",
    result:
      "No rate changes since 22 July. Source reachability improved: 5 calculators moved to a reachable main-domain primary (Reverb, Ko-fi, Upwork, Fiverr, Printful); 4 remain on a Zendesk-only citation with no confirmed main-domain fee page yet (Whatnot, Substack, Teespring, Redbubble).",
    changes: [],
    method:
      "Official pages, triangulated against 2+ independent 2026 sources where a page was JS-rendered or login-walled. Reachable replacement pages were confirmed to state the fee before being cited.",
  },
  {
    date: "2026-07-22",
    startUTC: "04:40",
    endUTC: "05:30",
    slot: "ad-hoc",
    scope:
      "Set up the verification system (this public log, the 1st/15th schedule, and a watcher covering every cited source) and ran a correctness sweep across all 42 fee calculators against their official pages.",
    coverage:
      "Full scope completed for 12 calculators (Depop across all regions, TikTok Shop across both, and the single-rate platforms: Gumroad, Bandcamp, Buy Me a Coffee, Cash App, Facebook, Paddle, Lemon Squeezy, StockX, Razorpay, Payoneer) — their dates move to today. The multi-country calculators (Stripe, PayPal, Etsy, Shopify, App Store, Vinted, Square, eBay, Whatnot, Mercari, Poshmark, Amazon, Walmart) keep their last complete verification date until their first scheduled full pass on 1 Aug 2026.",
    result:
      "One change — Depop Australia 10% → 0% (effective today). Every other rate we checked still matched its official page; three single-search false positives (Square, Facebook, Cash App) were caught and rejected by triangulation.",
    changes: ["depop-fee-calculator"],
    method: "Official pages, with 2+ independent 2026 sources triangulated wherever a page was JS-rendered or login-walled.",
  },
];
