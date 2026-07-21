/**
 * Pure classification for the rate watcher. No network, no fs — just
 * (target, fetch outcome, clock) -> a category. Kept separate so it's unit
 * tested; run.ts is the thin I/O shell around it.
 *
 * value-assert is a DISAPPEARANCE detector, not a correctness proof: it only
 * checks that the numbers we currently publish still literally appear on the
 * source page. If a page rewords "2.9%" to "2.90%" we get a false "possible
 * change" (a human glances and clears it); if a page keeps the string "20%"
 * elsewhere while the real fee moved we could miss it. That's the accepted
 * ceiling for a free, deterministic first pass — the human confirms every flag.
 */

export type Category =
  | "unchanged" // 2xx and every published value still present in the HTML
  | "unconfirmed" // 2xx but a value is absent from the raw HTML — usually the
  //                  page renders its fees via JS, or reworded them. NOT an
  //                  alarm: it can't be told apart from a real change over plain
  //                  HTTP, so it becomes a search-verify worklist item.
  | "reached-no-assertion" // 2xx, link healthy, but no expect[] configured
  | "blocked" // 401/403/429 — WAF/Cloudflare (expected for datacenter IPs)
  | "unreachable" // network error / timeout (status 0)
  | "dead" // 404/410 — citation URL is gone, fix it (the one reliable alarm)
  | "http-error"; // any other >=400

export interface FetchOutcome {
  ok: boolean; // response.ok (2xx)
  status: number; // 0 on network error / timeout
  error?: string; // message when status === 0
  body?: string; // raw HTML, only when ok
}

export interface CheckTarget {
  platform: string;
  field: string; // which source field it came from (source, tierSource, …)
  url: string;
  verifiedOn?: string; // YYYY-MM-DD from fees.ts, for staleness
  expect: string[]; // strings that must still appear on the page
}

export interface CheckResult {
  target: CheckTarget;
  category: Category;
  status: number;
  missing: string[]; // expected strings not found (drives "possible-change")
  daysSinceVerified: number | null;
}

/** Strip markup and collapse whitespace so substring checks are layout-proof. */
export function normalize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Whole days between a YYYY-MM-DD verify date and `now`. null if unparseable. */
export function daysSince(iso: string | undefined, now: Date): number | null {
  if (!iso) return null;
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function classify(target: CheckTarget, outcome: FetchOutcome, now: Date): CheckResult {
  const daysSinceVerified = daysSince(target.verifiedOn, now);
  const base = { target, status: outcome.status, missing: [] as string[], daysSinceVerified };

  if (!outcome.ok) {
    if (outcome.status === 0) return { ...base, category: "unreachable" };
    if (outcome.status === 404 || outcome.status === 410) return { ...base, category: "dead" };
    if ([401, 403, 429].includes(outcome.status)) return { ...base, category: "blocked" };
    return { ...base, category: "http-error" };
  }

  if (target.expect.length === 0) return { ...base, category: "reached-no-assertion" };

  const hay = normalize(outcome.body ?? "");
  const missing = target.expect.filter((e) => !hay.includes(e.toLowerCase()));
  return {
    ...base,
    category: missing.length === 0 ? "unchanged" : "unconfirmed",
    missing,
  };
}
