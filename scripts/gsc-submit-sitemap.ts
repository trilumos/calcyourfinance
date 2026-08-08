/**
 * `npm run gsc:submit` — resubmit /sitemap.xml to Search Console.
 *
 * Run this after EVERY deploy that changes the indexing allowlist. Google had
 * not re-read our sitemap in 16 days (2026-07-22 → 2026-08-07); without an
 * explicit resubmit it keeps acting on the stale read, so a shrink or a batch
 * widening simply never reaches it.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JWT } from "google-auth-library";

const SITEMAP = "https://calcyourfinance.com/sitemap.xml";

function loadKey(): { client_email: string; private_key: string } {
  const env = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const dir = join(process.cwd(), "secrets");
  const found = existsSync(dir) && readdirSync(dir).find((f) => f.endsWith(".json"));
  const path = env && existsSync(env) ? env : found ? join(dir, found) : null;
  if (!path) throw new Error("No service-account key in secrets/");
  return JSON.parse(readFileSync(path, "utf8"));
}

const key = loadKey();
// email + key, not keyFile — the keyFile option is broken in v11 (see stats.ts).
const auth = new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/webmasters"],
});

const { siteEntry = [] } = (
  await auth.request<{ siteEntry?: { siteUrl: string }[] }>({
    url: "https://www.googleapis.com/webmasters/v3/sites",
  })
).data;
const site = siteEntry.find((s) => s.siteUrl.includes("calcyourfinance"));
if (!site) throw new Error("service account sees no calcyourfinance property");

// Sanity-check what we're about to submit — resubmitting a sitemap that 404s or
// still holds the pre-deploy URL set is worse than not resubmitting at all.
const xml = await fetch(SITEMAP).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
console.log(`live sitemap: ${urls.length} URLs`);
for (const u of urls) console.log(`  ${u}`);

await auth.request({
  url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/sitemaps/${encodeURIComponent(SITEMAP)}`,
  method: "PUT",
});
console.log(`\nresubmitted ${SITEMAP} to ${site.siteUrl}`);
