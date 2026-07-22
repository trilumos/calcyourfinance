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
fee.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.slug.localeCompare(b.slug));

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

for (const c of fee) {
  const { urls, verifiedOn } = sourcesFor(c);
  const countries = c.countries?.supported ?? [];
  const rows = countries.length ? countries : ["—"];
  points += rows.length;
  const src = urls.length ? urls.map((u) => `[src](${u})`).join(" ") : "—";
  lines.push(`### ${c.slug} — ${c.category}`);
  lines.push(`Sources: ${src} · data verified ${verifiedOn ?? "?"}`);
  lines.push("");
  lines.push("| Country | Checked | Credibility | Status | Notes |");
  lines.push("|---|---|---|---|---|");
  for (const cc of rows) lines.push(`| ${cc} |  |  |  |  |`);
  lines.push("");
}

lines.unshift(""); // spacer under title inserted later
lines.splice(
  4,
  0,
  `**${fee.length} fee calculators · ${points} country rate-points to verify each cycle.**`,
  "",
);

mkdirSync("rate-verification", { recursive: true });
writeFileSync(join("rate-verification", "matrix.md"), lines.join("\n"), "utf8");
console.log(`matrix.md → ${fee.length} calculators, ${points} country rate-points`);
