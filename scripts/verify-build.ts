/**
 * Post-build gate check (roadmap §11, "Automated").
 *
 * Verifies the things that break silently across MANY pages when a shared
 * component changes — the class of bug a spot-check on one page will miss:
 *   1. every global chrome element is present on every built page
 *   2. every calculator page SSRs its inputs and a result (no NaN, no empty)
 *   3. the country/region selector appears exactly where it should
 *
 * It deliberately does NOT verify that a rate is *correct* — that requires the
 * platform's official pricing page and is the job of the rate watcher.
 *
 * Run: npm run verify   (after npm run build)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
// Import the real registry rather than regex-parsing config source: configs
// declare countries via spreads ([...COUNTRIES]) and shared constants
// (BROAD_COUNTRIES), which no regex resolves correctly.
import { calculators } from "../src/calculators";

const DIST = "dist";

type Issue = { page: string; problem: string };
const issues: Issue[] = [];

/* ---- 1. global chrome on every page ------------------------------------- */
const CHROME: Record<string, string> = {
  "navbar logo": "CalcYourFinance home",
  "search trigger": "data-cmdk-open",
  "command palette": 'id="cmdk"',
  "palette index": 'id="cmdk-data"',
  "theme toggle": 'id="theme-toggle"',
  "skip link": "Skip to content",
  "main landmark": '<main id="main"',
};

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.isFile() && e.name.endsWith(".html") ? [p] : [];
  });
}

const pages = htmlFiles(DIST);
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [name, needle] of Object.entries(CHROME)) {
    if (!html.includes(needle)) issues.push({ page, problem: `missing ${name}` });
  }
}

/* ---- 2 + 3. calculator pages render, and region selector is correct ----- */
let calcPages = 0;
for (const cfg of calculators) {
  const slug = cfg.slug;
  const pagePath = join(DIST, `${slug}.html`);
  if (!existsSync(pagePath)) {
    issues.push({ page: slug, problem: "no built page" });
    continue;
  }
  const html = readFileSync(pagePath, "utf8");
  calcPages++;

  const hasCurrencyInput = cfg.inputs.some((i) => i.type === "currency");

  // A selector only renders when there is a real choice (>1 supported country).
  const countryCount = cfg.countries?.supported.length ?? 0;
  const multiCountry = countryCount > 1;
  const hasRegion = html.includes('aria-label="Country or region"');

  const renderedInputs =
    (html.match(/class="[^"]*field-control/g) ?? []).length +
    (html.match(/type="checkbox"/g) ?? []).length +
    (html.match(/class="select-trigger"/g) ?? []).length;

  if (renderedInputs === 0) issues.push({ page: slug, problem: "no inputs rendered" });
  if (!html.includes("aria-live")) issues.push({ page: slug, problem: "no result readout" });
  if (html.includes("NaN")) issues.push({ page: slug, problem: "NaN in SSR output" });

  if (multiCountry && !hasRegion)
    issues.push({ page: slug, problem: `${countryCount} countries but no region selector` });
  if (!multiCountry && hasRegion)
    issues.push({ page: slug, problem: "region selector with only one country" });
  if (multiCountry && hasCurrencyInput) {
    // The selector rides on the FIRST currency input; there must be exactly one.
    const count = (html.match(/aria-label="Country or region"/g) ?? []).length;
    if (count > 1)
      issues.push({ page: slug, problem: `${count} region selectors (expected 1)` });
  }
}

/* ---- report -------------------------------------------------------------- */
console.log(`pages checked:       ${pages.length}`);
console.log(`calculator pages:    ${calcPages}`);
if (issues.length === 0) {
  console.log("\n✅ verify-build: no issues");
  process.exit(0);
}
console.log(`\n❌ verify-build: ${issues.length} issue(s)\n`);
for (const i of issues) console.log(`   ${i.page}  —  ${i.problem}`);
process.exit(1);
