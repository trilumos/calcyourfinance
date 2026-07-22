/**
 * RATE-CHANGE HISTORY — the audit log for every fee/price we publish.
 * ---------------------------------------------------------------------------
 * One entry = one verified change to a rate, price, or its citation. This is
 * the single source of truth for the public `/fee-changes` changelog (PLAN M2)
 * and the append-target for the periodic rate-verification engine.
 *
 * RULES (mirror fees.ts discipline — these are what make the log trustworthy):
 *   1. An entry is added ONLY after the change is verified against the
 *      platform's OFFICIAL page. `source` MUST be that official URL.
 *   2. `from` / `to` are human-readable ("10%", "$2.95", "0.5%"), so the
 *      changelog page can render them verbatim with no formatting logic.
 *   3. Newest first. Append new entries at the TOP of `rateHistory`.
 *   4. When a rate changes, update fees.ts (or ai-pricing.ts) AND add an entry
 *      here in the same commit. The two must never drift.
 *   5. `verifiedBy: "engine"` means the verification run proposed it and a
 *      human confirmed it before it landed here — the engine never commits
 *      to this file unattended (human-in-the-loop, per PLAN M2).
 *
 * `kind`:
 *   "rate"    a published value changed (the important case).
 *   "added"   a platform/field we now model that we didn't before.
 *   "removed" a platform/field we stopped modelling.
 *   "source"  the value is unchanged but its citation URL was corrected
 *             (e.g. the platform moved its help article). Provenance only.
 */

export type RateChangeKind = "rate" | "added" | "removed" | "source";

export interface RateChange {
  /**
   * Date the change took effect on the PLATFORM (YYYY-MM-DD). For a "source"
   * fix, the date we corrected the citation. May be in the future for an
   * announced-but-not-yet-live change (see `note`).
   */
  effective: string;
  /** Date we verified and recorded this entry (YYYY-MM-DD). */
  recordedOn: string;
  kind: RateChangeKind;
  /** Display label for the platform, e.g. "Depop". */
  platform: string;
  /** Slugs of the calculators this touches (folder names in src/calculators/). */
  calculators: string[];
  /** Human-readable name of what changed, e.g. "Seller fee (Australia)". */
  field: string;
  /** Previous value, human-readable. null when kind === "added". */
  from: string | null;
  /** New value, human-readable. null when kind === "removed". */
  to: string | null;
  /** Official URL documenting the change. */
  source: string;
  /** How the entry was verified. "engine" still means a human confirmed it. */
  verifiedBy: "manual" | "engine";
  /** Optional context — announcement dates, scope, caveats. */
  note?: string;
}

/**
 * Seeded only with changes verifiable against official sources on 2026-07-21.
 * This is deliberately NOT a reconstruction of every historical change — an
 * incomplete guess would undermine the log's whole point. It grows forward
 * from here, one verified entry at a time.
 */
export const rateHistory: RateChange[] = [
  {
    effective: "2026-07-22",
    recordedOn: "2026-07-22",
    kind: "rate",
    platform: "Depop",
    calculators: ["depop-fee-calculator"],
    field: "Seller fee (Australia)",
    from: "10%",
    to: "0%",
    source:
      "https://news.depop.com/company-news/depop-makes-selling-free-in-australia-helping-people-earn-more-from-fashion-resale/",
    verifiedBy: "manual",
    note: "Effective 22 Jul 2026: AU sellers pay 0% selling fee on AUD sales (was 10% under rest-of-world). Depop Payments processing 2.6% + A$0.30; buyers now pay a marketplace fee up to 5% + up to A$1 (does not reduce seller payout). Added depopFeesAU + AU region to the calculator.",
  },
  {
    effective: "2025-08-04",
    recordedOn: "2026-07-21",
    kind: "rate",
    platform: "Patreon",
    calculators: ["patreon-fee-calculator"],
    field: "Platform fee (new creators)",
    from: "8% / 12% (Pro / Premium tiers)",
    to: "10% (single standard plan)",
    source:
      "https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators",
    verifiedBy: "manual",
    note: "Pro (8%) and Premium (12%) tiers consolidated into one 10% plan for creators who joined after 4 Aug 2025. Creators on/before that date keep their legacy rate.",
  },
  {
    effective: "2024-07-15",
    recordedOn: "2026-07-21",
    kind: "rate",
    platform: "Depop",
    calculators: ["depop-fee-calculator"],
    field: "Seller fee (United States)",
    from: "10%",
    to: "0%",
    source:
      "https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/",
    verifiedBy: "manual",
    note: "Selling fee removed for US sellers; a buyer marketplace fee (up to 5% + up to $1) was introduced and does not reduce the seller payout.",
  },
  {
    effective: "2024-03-20",
    recordedOn: "2026-07-21",
    kind: "rate",
    platform: "Depop",
    calculators: ["depop-fee-calculator"],
    field: "Seller fee (United Kingdom)",
    from: "10%",
    to: "0%",
    source:
      "https://news.depop.com/company-news/evolving-our-fee-structure-with-zero-selling-fees-on-depop/",
    verifiedBy: "manual",
    note: "Selling fee removed for new UK listings; a buyer marketplace fee (up to 5% + up to £1) was introduced and does not reduce the seller payout.",
  },
  {
    effective: "2026-07-21",
    recordedOn: "2026-07-21",
    kind: "source",
    platform: "Redbubble",
    calculators: ["redbubble-profit-calculator"],
    field: "Tier-fee & excess-markup citations",
    from: "blog.redbubble.com/2025/08/… (both 404)",
    to: "official Redbubble Help Centre articles",
    source:
      "https://help.redbubble.com/hc/en-us/articles/50959863016724-How-does-my-Account-Tier-determine-my-platform-fee",
    verifiedBy: "manual",
    note: "Values unchanged (Standard 50% / Premium 20% / Pro 0%, $150 cap, 50% excess markup). Two dead blog URLs replaced with the live official help pages that state the same numbers.",
  },
  {
    effective: "2026-07-21",
    recordedOn: "2026-07-21",
    kind: "source",
    platform: "Teachable",
    calculators: ["teachable-fee-calculator"],
    field: "Transaction-fee citation",
    from: "support.teachable.com/hc/en-us/articles/4407133671963 (404)",
    to: "support.teachable.com/en/articles/11682553-teachable-fees",
    source: "https://support.teachable.com/en/articles/11682553-teachable-fees",
    verifiedBy: "manual",
    note: "Teachable moved its help centre; the old article ID 404s. Value unchanged (Starter 7.5%, higher plans 0%).",
  },
];
