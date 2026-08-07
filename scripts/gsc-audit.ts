/**
 * `npm run audit:gsc` — what Google actually thinks, cross-checked against what
 * we actually ship. Companion to `stats.ts` (performance); this one is
 * diagnostics: sitemap state, per-URL indexing verdicts, and drift checks.
 *
 * Run it after every deploy that changes the indexing allowlist, and weekly
 * while watching a batch.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JWT } from "google-auth-library";
import { calculators } from "../src/calculators";
import { INDEXABLE_CALCULATORS, INDEXABLE_PAGES, isIndexable } from "../src/config/indexing";

const SITE = "https://calcyourfinance.com";
const GA4_PROPERTY_ID = "540631319";

function loadKey(): { client_email: string; private_key: string } {
  const env = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const dir = join(process.cwd(), "secrets");
  const found = existsSync(dir) && readdirSync(dir).find((f) => f.endsWith(".json"));
  const path = env && existsSync(env) ? env : found ? join(dir, found) : null;
  if (!path) throw new Error("No service-account key in secrets/");
  return JSON.parse(readFileSync(path, "utf8"));
}

const key = loadKey();
// email + key, not keyFile — see stats.ts.
const auth = new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: [
    "https://www.googleapis.com/auth/webmasters",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await auth.request<T>({ url, method: body ? "POST" : "GET", data: body });
  return res.data;
}

const ok = (b: boolean) => (b ? "OK  " : "FAIL");

async function main() {
  /* ---- 1. property + permission ---------------------------------------- */
  console.log("\n=== 1. PROPERTY\n");
  const { siteEntry = [] } = await api<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>(
    "https://www.googleapis.com/webmasters/v3/sites",
  );
  for (const s of siteEntry) console.log(`  ${s.siteUrl}  —  ${s.permissionLevel}`);
  const site = siteEntry.find((s) => s.siteUrl.includes("calcyourfinance"));
  if (!site) throw new Error("service account sees no calcyourfinance property");
  const enc = encodeURIComponent(site.siteUrl);

  /* ---- 2. sitemaps ------------------------------------------------------ */
  console.log("\n=== 2. SITEMAPS (as Google sees them)\n");
  const { sitemap = [] } = await api<{
    sitemap?: {
      path: string;
      lastSubmitted?: string;
      lastDownloaded?: string;
      isPending?: boolean;
      errors?: string;
      warnings?: string;
      contents?: { submitted: string; indexed?: string }[];
    }[];
  }>(`https://www.googleapis.com/webmasters/v3/sites/${enc}/sitemaps`);

  for (const s of sitemap) {
    console.log(`  ${s.path}`);
    console.log(`    submitted=${s.lastSubmitted?.slice(0, 10)} downloaded=${s.lastDownloaded?.slice(0, 10)} pending=${!!s.isPending}`);
    console.log(`    errors=${s.errors ?? 0} warnings=${s.warnings ?? 0} urls=${s.contents?.[0]?.submitted ?? "?"}`);
  }

  /* ---- 3. drift: live sitemap vs registry vs allowlist ------------------- */
  console.log("\n=== 3. DRIFT CHECKS (live site vs our source of truth)\n");
  const liveXml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
  const liveUrls = [...liveXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const expected = [...INDEXABLE_PAGES, ...INDEXABLE_CALCULATORS.map((s) => `/${s}`)].length;
  const gscCount = Number(sitemap[0]?.contents?.[0]?.submitted ?? 0);

  console.log(`  ${ok(liveUrls.length === expected)} live sitemap ${liveUrls.length} urls, allowlist expects ${expected}`);
  console.log(`  ${ok(gscCount === liveUrls.length)} GSC read ${gscCount} urls, live sitemap has ${liveUrls.length}`);
  if (gscCount !== liveUrls.length) console.log("       (expected until the shrink deploys — GSC still holds the old read)");

  const badSlug = INDEXABLE_CALCULATORS.filter((s) => !calculators.some((c) => c.slug === s));
  console.log(`  ${ok(badSlug.length === 0)} every allowlisted slug exists in the registry${badSlug.length ? ": " + badSlug : ""}`);

  const notAllowed = liveUrls.filter((u) => !isIndexable(u.replace(SITE, "") || "/"));
  console.log(`  ${ok(notAllowed.length === 0)} no sitemap URL is noindexed${notAllowed.length ? ` (${notAllowed.length} stale, pre-deploy)` : ""}`);

  const robots = await fetch(`${SITE}/robots.txt`).then((r) => r.text());
  console.log(`  ${ok(robots.includes("Allow: /") && !/Disallow: \/\s*$/m.test(robots))} robots.txt allows crawling`);
  console.log(`  ${ok(robots.includes("/sitemap.xml"))} robots.txt advertises the sitemap`);

  /* ---- 4. per-URL inspection ------------------------------------------- */
  console.log("\n=== 4. URL INSPECTION (Google's verdict per page)\n");
  const targets = [
    "/",
    ...INDEXABLE_CALCULATORS.map((s) => `/${s}`),
    "/verification",
    "/venmo-fee-calculator", // held back, but our only page with real query demand
  ];

  for (const path of targets) {
    try {
      const r = await api<{
        inspectionResult?: {
          indexStatusResult?: {
            verdict?: string;
            coverageState?: string;
            robotsTxtState?: string;
            indexingState?: string;
            lastCrawlTime?: string;
            pageFetchState?: string;
            googleCanonical?: string;
            userCanonical?: string;
            sitemap?: string[];
            referringUrls?: string[];
          };
        };
      }>("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
        inspectionUrl: `${SITE}${path === "/" ? "" : path}`,
        siteUrl: site.siteUrl,
      });

      const i = r.inspectionResult?.indexStatusResult ?? {};
      const canonicalMatch =
        !i.googleCanonical || !i.userCanonical || i.googleCanonical === i.userCanonical;
      console.log(`  ${path}`);
      console.log(`    verdict=${i.verdict}  coverage="${i.coverageState}"`);
      console.log(`    robots=${i.robotsTxtState} indexing=${i.indexingState} fetch=${i.pageFetchState}`);
      console.log(`    lastCrawl=${i.lastCrawlTime?.slice(0, 10) ?? "never"}  inSitemap=${(i.sitemap ?? []).length > 0}  refUrls=${(i.referringUrls ?? []).length}`);
      if (!canonicalMatch) console.log(`    !! canonical mismatch: google=${i.googleCanonical} ours=${i.userCanonical}`);
    } catch (e) {
      console.log(`  ${path}  INSPECT FAILED: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /* ---- 5. GA4 sanity ---------------------------------------------------- */
  console.log("\n=== 5. GA4 SANITY\n");
  const ga = await api<{ rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] }>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      limit: 12,
    },
  );
  for (const r of ga.rows ?? []) {
    console.log(`  ${r.dimensionValues[0].value.padEnd(22)} ${r.metricValues[0].value}`);
  }
}

main().catch((e) => {
  console.error("\nAUDIT FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
