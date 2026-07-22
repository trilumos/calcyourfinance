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
    date: "2026-07-22",
    startUTC: "04:40",
    endUTC: "05:30",
    slot: "ad-hoc",
    scope:
      "Set up the verification system (this public log, the 1st/15th schedule, and a watcher covering every cited source) and ran a correctness sweep across all 42 fee calculators against their official pages.",
    coverage:
      "Depop fully re-verified across all regions for today's change. Each other calculator's last full-scope verification date is shown per-calculator below; their next scheduled full-scope check is 1 Aug 2026.",
    result:
      "One change — Depop Australia 10% → 0% (effective today). No other platform's published rates had changed; three single-search false positives (Square, Facebook, Cash App) were caught and rejected by triangulation.",
    changes: ["depop-fee-calculator"],
    method: "Official pages, with 2+ independent 2026 sources triangulated wherever a page was JS-rendered or login-walled.",
  },
];
