/**
 * Rate watcher (roadmap M2) — the "rate watcher" verify-build.ts defers to.
 *
 * Reads every source URL from fees.ts / ai-pricing.ts, fetches each, and writes
 * a dated report to rate-verification/ that marks, explicitly:
 *   ✅ reached & unchanged   ⚠️ reached but a published value is gone (REVIEW)
 *   🔴 could not reach       💀 dead citation (404/410)   ⏳ stale
 * The committed dated file IS the deliverable — pull the folder from GitHub for
 * the full history. Human-in-the-loop: the watcher never edits a rate; it
 * reports, and a person confirms each flag (via search) and updates fees.ts +
 * rate-history.ts.
 *
 * Run: npm run verify:rates
 * Env: RATE_STALE_DAYS (default 90), RATE_TIMEOUT_MS (default 20000)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getManifest } from "./manifest";
import { classify, type CheckResult, type Category, type FetchOutcome } from "./classify";

const STALE_DAYS = Number(process.env.RATE_STALE_DAYS ?? 90);
const TIMEOUT_MS = Number(process.env.RATE_TIMEOUT_MS ?? 20_000);
const CONCURRENCY = 6;
const OUT_DIR = "rate-verification";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchTarget(url: string): Promise<FetchOutcome> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const body = res.ok ? await res.text() : "";
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      if (attempt === 1) return { ok: false, status: 0, error: (e as Error).message };
      await new Promise((r) => setTimeout(r, 1500)); // one polite retry on network error
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: 0, error: "unknown" };
}

/** Run `worker` over items, at most `limit` in flight. */
async function pool<T, R>(items: T[], limit: number, worker: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

const ORDER: Category[] = [
  "dead",
  "unconfirmed",
  "blocked",
  "unreachable",
  "http-error",
  "unchanged",
  "reached-no-assertion",
];
const HEADING: Record<Category, string> = {
  dead: "💀 Dead citation (404/410) — fix the URL now",
  unconfirmed: "❔ Reached, but our value wasn't in the raw HTML — verify via search",
  blocked: "🔴 Could not reach (blocked by WAF/Cloudflare) — verify via search",
  unreachable: "🔴 Could not reach (timeout / network) — verify via search",
  "http-error": "⛔ HTTP error — check",
  unchanged: "✅ Confirmed unchanged (every published value still on the page)",
  "reached-no-assertion": "ℹ️ Link healthy (no value assertion configured)",
};
// The one reliable alarm over plain HTTP is a broken link. Everything else is
// either a positive (unchanged) or a "couldn't confirm" worklist item — see the
// report intro for why `unconfirmed` is not a change signal.
const ACTIONABLE: Category[] = ["dead"];
// The search-verify worklist a human works through (prioritised by staleness).
const WORKLIST: Category[] = ["unconfirmed", "blocked", "unreachable", "http-error"];

function row(r: CheckResult): string {
  const t = r.target;
  const bits = [`\`${t.field}\``];
  if (r.status) bits.push(`HTTP ${r.status}`);
  if (t.expect.length) bits.push(`expects ${t.expect.map((e) => `“${e}”`).join(", ")}`);
  if (r.missing.length) bits.push(`**missing: ${r.missing.map((e) => `“${e}”`).join(", ")}**`);
  if (r.daysSinceVerified != null) bits.push(`verified ${r.daysSinceVerified}d ago`);
  return `- **${t.platform}** — ${bits.join(" · ")}\n  ${t.url}`;
}

function buildReport(results: CheckResult[], date: string): string {
  const by = (c: Category) => results.filter((r) => r.category === c);
  const stale = results.filter(
    (r) => r.daysSinceVerified != null && r.daysSinceVerified > STALE_DAYS,
  );
  const count = (c: Category) => by(c).length;

  const worklist = results.filter((r) => WORKLIST.includes(r.category));

  const lines: string[] = [];
  lines.push(`# Rate verification — ${date}`);
  lines.push("");
  lines.push(
    `Automated watcher over every source URL in \`fees.ts\` + \`ai-pricing.ts\`, ` +
      `checking each against the values that config currently holds. It never edits ` +
      `a rate — a human confirms and updates \`fees.ts\` + \`rate-history.ts\`.`,
  );
  lines.push("");
  lines.push(
    `> **IRON RULE — do not trust this report on its own.** Scrapers are wrong ` +
      `often: a JS page reads "unconfirmed" when nothing changed, and a stale ` +
      `cache or a coincidental string can read "unchanged" when a rate *did* ` +
      `move. Every cycle, independently re-verify **all ${results.length}** sources ` +
      `by search/official page — **including the ✅ unchanged ones** — before ` +
      `trusting any status here. This report only decides where to look first.`,
  );
  lines.push("");
  lines.push(
    `**How to read this.** Over plain HTTP the only reliable alarm is a **dead ` +
      `link** — fix those first. **❔ unconfirmed** does *not* mean a rate changed: ` +
      `most pricing pages render their fees with JavaScript (or sit behind ` +
      `Cloudflare), so our numbers aren't in the raw HTML the watcher can see. ` +
      `Treat ❔/🔴 as a **search-verify worklist**, and work the **stale** ones ` +
      `first. ✅ confirmed-unchanged is a genuine all-clear for that source.`,
  );
  lines.push("");
  lines.push(`- Sources checked: **${results.length}**`);
  lines.push(
    `- 💀 dead (fix now): **${count("dead")}** · ⏳ stale > ${STALE_DAYS}d: **${stale.length}**`,
  );
  lines.push(
    `- ✅ confirmed unchanged: ${count("unchanged")} · ℹ️ link-ok: ${count("reached-no-assertion")}`,
  );
  lines.push(
    `- ❔ worklist — verify via search: ${worklist.length} ` +
      `(❔ ${count("unconfirmed")} JS/reworded · 🔴 ${count("blocked")} blocked · ` +
      `🔴 ${count("unreachable")} unreachable · ⛔ ${count("http-error")} error)`,
  );
  lines.push("");

  for (const cat of ORDER) {
    const rows = by(cat);
    if (!rows.length) continue;
    lines.push(`## ${HEADING[cat]} — ${rows.length}`);
    lines.push("");
    for (const r of rows) lines.push(row(r));
    lines.push("");
  }

  if (stale.length) {
    lines.push(`## ⏳ Stale — verified more than ${STALE_DAYS} days ago (${stale.length})`);
    lines.push("");
    lines.push("_Cross-cuts the sections above; re-verify even if the link is healthy._");
    lines.push("");
    for (const r of stale.sort((a, b) => (b.daysSinceVerified ?? 0) - (a.daysSinceVerified ?? 0)))
      lines.push(row(r));
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const targets = getManifest();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  console.log(`rate-verify: checking ${targets.length} source URLs…`);
  const results = await pool(targets, CONCURRENCY, async (t) =>
    classify(t, await fetchTarget(t.url), now),
  );

  mkdirSync(OUT_DIR, { recursive: true });
  const report = buildReport(results, date);
  writeFileSync(join(OUT_DIR, `${date}.md`), report, "utf8");

  const actionable = results.filter((r) => ACTIONABLE.includes(r.category));
  const summary = {
    date,
    checked: results.length,
    counts: results.reduce<Record<string, number>>((a, r) => {
      a[r.category] = (a[r.category] ?? 0) + 1;
      return a;
    }, {}),
    actionable: actionable.length,
    reportFile: `${OUT_DIR}/${date}.md`,
  };
  writeFileSync(join(OUT_DIR, "latest.json"), JSON.stringify(summary, null, 2), "utf8");

  console.log(`\n${report.split("\n").slice(0, 9).join("\n")}\n`);
  console.log(`report → ${OUT_DIR}/${date}.md   (actionable: ${actionable.length})`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, report, "utf8");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
