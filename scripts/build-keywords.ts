/**
 * Aggregates every calculator's per-page keyword cluster into the site-wide
 * tracker (PLAN §11). The root keywords.md is GENERATED — never hand-edit it;
 * edit each calculator's `keywords` field in its config.ts instead.
 *
 *   npm run keywords
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { calculators } from "../src/calculators/index.ts";
import { SITE } from "../src/config/site.ts";
import { COUNTRY_SEARCH_NAME } from "../src/lib/countries.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "keywords.md");

interface Row {
  keyword: string;
  page: string;
  url: string;
  role: "primary" | "secondary" | "long-tail" | "country";
  intent: string;
  competition: string;
  status: string;
}

const rows: Row[] = [];
for (const c of calculators) {
  const url = `/${c.slug}`;
  const base = {
    page: c.title,
    url,
    intent: c.keywords.intent ?? "tool",
    competition: c.keywords.competition,
    status: "built",
  };

  const baseKeywords = [
    c.keywords.primary,
    ...c.keywords.secondary,
    ...c.keywords.longTail,
  ];

  rows.push({ ...base, keyword: c.keywords.primary, role: "primary" });
  for (const k of c.keywords.secondary) rows.push({ ...base, keyword: k, role: "secondary" });
  for (const k of c.keywords.longTail) rows.push({ ...base, keyword: k, role: "long-tail" });

  // Standing rule (PLAN §A): for every supported country, add a
  // "<keyword> for <country>" variant of each base keyword so the page can
  // rank for country-specific searches (e.g. "stripe fee calculator for uk").
  if (c.countries) {
    for (const code of c.countries.supported) {
      const country = COUNTRY_SEARCH_NAME[code];
      if (!country) continue;
      for (const k of baseKeywords) {
        rows.push({ ...base, keyword: `${k} for ${country}`, role: "country" });
      }
    }
  }
}

const header = `# Keyword tracker — ${SITE.name}

> **AUTO-GENERATED** by \`npm run keywords\` from each calculator's \`keywords\` field.
> Do not hand-edit. The whole-site list = the sum of every page's cluster (PLAN §11).
> Last generated: ${new Date().toISOString().slice(0, 10)}

Totals: ${calculators.length} pages · ${rows.length} keywords

| keyword | page | role | intent | competition | status |
| --- | --- | --- | --- | --- | --- |
`;

const body = rows
  .map(
    (r) =>
      `| ${r.keyword} | [${r.page}](${r.url}) | ${r.role} | ${r.intent} | ${r.competition} | ${r.status} |`,
  )
  .join("\n");

writeFileSync(OUT, header + body + "\n");
console.log(`Wrote ${rows.length} keywords across ${calculators.length} pages → keywords.md`);
