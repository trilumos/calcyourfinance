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
    date: "2026-08-08",
    startUTC: "05:30",
    endUTC: "07:15",
    slot: "ad-hoc",
    scope:
      "Ad-hoc primary-source re-verification of Ko-fi during the batch-1 page rebuild, focused on its plan tiers.",
    coverage:
      "Ko-fi re-read against its own help centre (primary): the Contributor-status article, the fee overview, and the Gold page. Confirmed that a new account starts with Contributor status ON — which takes 5% of tips too, not the widely-repeated 0% — with 0% only if the creator opts out; shop/memberships stay 5% (0% on Gold at $12/mo). Its verified date moves to today.",
    result:
      "No rate-value changes. The tier the fee applies to was corrected to Ko-fi's own term 'Contributor' with the 5%-on-tips default; processor rates (Stripe, PayPal Micropayments) confirmed as standard US rates.",
    changes: [],
    method:
      "Ko-fi's official help-centre articles (primary source), cross-checked against the on-page fee overview and the Gold pricing page.",
  },
  {
    date: "2026-08-06",
    startUTC: "06:42",
    endUTC: "07:45",
    slot: "full",
    scope:
      "Full monthly audit (August cycle, run 5 days after the 1st). Every one of the 42 fee calculators re-verified against its official page, and Zendesk-only citations replaced with reachable main-domain sources.",
    coverage:
      "All 42 checked; no rate changes found on any of them. Single-rate and low-country calculators fully re-read; country-heavy tables (Stripe/PayPal/Etsy/Square/eBay/Shopify/App Store) verified by platform-level change-detection against the official pages plus major-market confirmation — including the Stripe New Zealand cut (Dec 2025), which our value already matched (2.65% + NZ$0.30). Printify Premium ($39/$24.99, 33%) already reflected the Feb-2026 increase. Watcher's Aug-3 dead link (AMFI, on the formula-only SIP calc) fixed, and personal-finance calcs removed from the watcher (they have no rates to check).",
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
