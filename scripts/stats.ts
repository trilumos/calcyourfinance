/**
 * `npm run stats` — pull real performance data instead of reading screenshots.
 *
 * Search Console first (it speaks to the indexing problem), then GA4.
 * Auth: a Google Cloud service account with read access to both properties.
 * The key is any .json in secrets/ (gitignored) or $GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Setup, once: enable the Search Console API + Analytics Data API, create a
 * service account, add its email as a Full user in GSC and a Viewer in GA4.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JWT } from "google-auth-library";

const GA4_PROPERTY_ID = "540631319";
const DAYS = 28;

function loadKey(): { client_email: string; private_key: string } {
  const env = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const dir = join(process.cwd(), "secrets");
  const found = existsSync(dir) && readdirSync(dir).find((f) => f.endsWith(".json"));
  const path = env && existsSync(env) ? env : found ? join(dir, found) : null;
  if (!path) {
    throw new Error("No service-account key: put the .json in secrets/ or set GOOGLE_APPLICATION_CREDENTIALS");
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

const key = loadKey();

// Pass email + private key explicitly. The `keyFile` constructor option is
// broken in google-auth-library v11 — it authenticates as something else and
// Google answers "invalid_grant: account not found", which reads like a setup
// problem and isn't. Parsing the JSON ourselves keeps the credential explicit.
const auth = new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

/** Authenticated JSON call. GET when `body` is omitted. */
async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await auth.request<T>({
    url,
    method: body ? "POST" : "GET",
    data: body,
  });
  return res.data;
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date();
const startDate = ymd(new Date(today.getTime() - DAYS * 864e5));
const endDate = ymd(today);

function table(rows: (string | number)[][], head: string[]) {
  if (!rows.length) return console.log("  (no data)");
  const all = [head, ...rows.map((r) => r.map(String))];
  const w = head.map((_, i) => Math.max(...all.map((r) => String(r[i]).length)));
  for (const [n, r] of all.entries()) {
    console.log("  " + r.map((c, i) => String(c).padEnd(w[i])).join("  "));
    if (n === 0) console.log("  " + w.map((x) => "-".repeat(x)).join("  "));
  }
}

async function searchConsole() {
  console.log(`\n=== SEARCH CONSOLE  (${startDate} → ${endDate})\n`);

  // The property may be registered as a domain property or a URL prefix; ask.
  const { siteEntry = [] } = await api<{ siteEntry?: { siteUrl: string }[] }>(
    "https://www.googleapis.com/webmasters/v3/sites",
  );
  const site = siteEntry.find((s) => s.siteUrl.includes("calcyourfinance"));
  if (!site) {
    console.log("  Service account has no GSC property. Visible:", siteEntry.map((s) => s.siteUrl));
    return;
  }
  console.log(`property: ${site.siteUrl}\n`);

  const base = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`;
  const query = (dimensions: string[], rowLimit = 15) =>
    api<{ rows?: { keys: string[]; clicks: number; impressions: number; position: number }[] }>(base, {
      startDate,
      endDate,
      dimensions,
      rowLimit,
    });

  const totals = await query([], 1);
  const t = totals.rows?.[0];
  console.log(
    t
      ? `TOTALS: ${t.clicks} clicks · ${t.impressions} impressions · avg position ${t.position.toFixed(1)}`
      : "TOTALS: no impressions at all in this window.",
  );

  console.log("\nTop pages:");
  const pages = await query(["page"]);
  table(
    (pages.rows ?? []).map((r) => [
      r.keys[0].replace("https://calcyourfinance.com", "") || "/",
      r.clicks,
      r.impressions,
      r.position.toFixed(1),
    ]),
    ["page", "clicks", "impr", "pos"],
  );

  console.log("\nTop queries:");
  const queries = await query(["query"]);
  table(
    (queries.rows ?? []).map((r) => [r.keys[0], r.clicks, r.impressions, r.position.toFixed(1)]),
    ["query", "clicks", "impr", "pos"],
  );
}

async function analytics() {
  console.log(`\n=== GA4  (last ${DAYS} days)\n`);
  const run = (dimensions: string[], metrics: string[], limit = 15) =>
    api<{ rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] }>(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "today" }],
        dimensions: dimensions.map((name) => ({ name })),
        metrics: metrics.map((name) => ({ name })),
        limit,
      },
    );

  const totals = await run([], ["activeUsers", "sessions", "screenPageViews"]);
  const m = totals.rows?.[0]?.metricValues.map((v) => v.value) ?? [];
  console.log(`TOTALS: ${m[0] ?? 0} users · ${m[1] ?? 0} sessions · ${m[2] ?? 0} pageviews`);

  console.log("\nTop pages:");
  const pages = await run(["pagePath"], ["screenPageViews", "activeUsers"]);
  table(
    (pages.rows ?? []).map((r) => [r.dimensionValues[0].value, ...r.metricValues.map((v) => v.value)]),
    ["page", "views", "users"],
  );

  console.log("\nTraffic sources:");
  const src = await run(["sessionDefaultChannelGroup"], ["sessions", "activeUsers"], 10);
  table(
    (src.rows ?? []).map((r) => [r.dimensionValues[0].value, ...r.metricValues.map((v) => v.value)]),
    ["channel", "sessions", "users"],
  );
}

// Report both even if one fails — a permissions gap on one side shouldn't hide
// the other's data, and the error text is what tells you which grant is missing.
for (const [name, fn] of [
  ["Search Console", searchConsole],
  ["GA4", analytics],
] as const) {
  try {
    await fn();
  } catch (e) {
    console.error(`\n${name} FAILED: ${e instanceof Error ? e.message : String(e)}`);
  }
}
