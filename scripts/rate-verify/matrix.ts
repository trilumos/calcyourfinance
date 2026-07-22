/**
 * Generates rate-verification/matrix.md — the master checklist for the monthly
 * manual audit: every fee calculator × every country it covers × where to verify
 * it, with columns to record each manual check (date, credibility, status).
 *
 * The skeleton (calculator, country, source, data-verifiedOn) is auto-derived so
 * it can never drift from the code. The manual columns are preserved-by-hand as
 * you work through a cycle — regenerating refreshes the skeleton; copy your
 * check results forward. Personal-finance calculators are excluded: they're pure
 * unit-tested math with no external rate to verify.
 *
 * Run: npm run verify:matrix
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { calculators } from "../../src/calculators";
import { TIER1 } from "../../src/config/verification-tiers";
import { getManifest } from "./manifest";

type Cfg = {
  slug: string;
  kind?: string;
  category?: string;
  title?: string;
  countries?: { supported?: string[] };
  feesVerifiedOn?: string;
  lastUpdated?: string;
  sources?: { url?: string }[];
};

const manifest = getManifest();
// slug -> the source URLs + oldest verifiedOn the watcher knows for that calc
function sourcesFor(c: Cfg): { urls: string[]; verifiedOn?: string } {
  const urls = new Set<string>();
  for (const s of c.sources ?? []) if (s.url) urls.add(s.url);
  // manifest page:<slug> field ties config sources to the calc; also pull any
  // fees.ts source whose platform label matches the calc title loosely.
  for (const t of manifest) if (t.field === `page:${c.slug}`) urls.add(t.url);
  return { urls: [...urls], verifiedOn: c.feesVerifiedOn ?? c.lastUpdated };
}

const fee = (calculators as Cfg[]).filter(
  (c) => c.kind === "single" && c.category !== "personal-finance",
);
fee.sort(
  (a, b) =>
    (TIER1.has(a.slug) ? 0 : 1) - (TIER1.has(b.slug) ? 0 : 1) ||
    (a.category ?? "").localeCompare(b.category ?? "") ||
    a.slug.localeCompare(b.slug),
);

let points = 0;
const lines: string[] = [];
lines.push("# Rate-verification matrix — manual audit checklist");
lines.push("");
lines.push(
  "Every fee calculator × every country it covers. The monthly manual audit " +
    "(see `manual-verification-log.md`) works through this, triangulating each " +
    "value against its official source and recording the result. **Auto-generated " +
    "skeleton** (`npm run verify:matrix`) — do not hand-edit the Calculator/" +
    "Country/Source columns; fill the **Checked / Credibility / Status** columns as " +
    "you verify, and carry them forward when regenerating.",
);
lines.push("");
lines.push(
  "Credibility key: `official` (primary page) · `triangulated` (2+ converging 2026 " +
    "guides) · `single` (one source — treat as unverified) · `dynamic` (quoted live, " +
    "e.g. Wise). Status: `ok` · `changed` · `recheck`.",
);
lines.push("");
lines.push(
  `**Cadence.** 🔴 **Tier 1 (${[...TIER1].length}) — verified the 1st AND 15th** of ` +
    "each month. **Tier 2 (rest) — verified the 1st.** On any date, check what's due " +
    "for that anchor (1st = all; 15th = Tier 1); if a check runs late, do it as soon " +
    "as possible but keep the next date on the 1st/15th anchor. Every session is " +
    "logged in `src/config/verification-log.ts` and shown publicly at `/verification`.",
);
lines.push("");
lines.push("Tier 1: " + [...TIER1].map((s) => `\`${s}\``).join(", ") + ".");
lines.push("");

for (const c of fee) {
  const { urls, verifiedOn } = sourcesFor(c);
  const countries = c.countries?.supported ?? [];
  const rows = countries.length ? countries : ["—"];
  points += rows.length;
  const src = urls.length ? urls.map((u) => `[src](${u})`).join(" ") : "—";
  const tier = TIER1.has(c.slug) ? "🔴 Tier 1 — 1st + 15th" : "Tier 2 — 1st only";
  lines.push(`### ${c.slug} — ${c.category} · ${tier}`);
  lines.push(`Sources: ${src} · data verified ${verifiedOn ?? "?"}`);
  lines.push("");
  lines.push("| Country | Checked | Credibility | Status | Notes |");
  lines.push("|---|---|---|---|---|");
  for (const cc of rows) lines.push(`| ${cc} |  |  |  |  |`);
  lines.push("");
}

// Summary line right under the title (index 2, after "# title" + blank).
lines.splice(
  2,
  0,
  `**${fee.length} fee calculators · ${points} country rate-points.** ` +
    `🔴 ${TIER1.size} Tier 1 (twice-monthly) · ${fee.length - TIER1.size} Tier 2 (monthly).`,
  "",
);

mkdirSync("rate-verification", { recursive: true });
writeFileSync(join("rate-verification", "matrix.md"), lines.join("\n"), "utf8");
console.log(`matrix.md → ${fee.length} calculators, ${points} country rate-points`);
