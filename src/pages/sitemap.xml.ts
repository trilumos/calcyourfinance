/**
 * Single, self-contained sitemap at /sitemap.xml (no sitemap index).
 * Lists every indexable page: content pages, category hubs, and every
 * calculator in the registry. Error pages are intentionally excluded.
 */
import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { isIndexable } from "../config/indexing";
import { calculators, activeCategories } from "../calculators";
import { CATEGORY_META } from "../calculators/_types";
import { verificationLog } from "../config/verification-log";

export const GET: APIRoute = () => {
  // Honest per-page lastmod (Google warns against fake freshness): each
  // calculator carries its own lastUpdated; the homepage and hubs reflect the
  // most recent calculator change (they list calculators); legal/static pages
  // use the site's effective date.
  const latestCalc = calculators
    .map((c) => c.lastUpdated)
    .sort()
    .at(-1) ?? SITE.effectiveDate;

  const entries: { path: string; lastmod: string; priority: string }[] = [
    { path: "/", lastmod: latestCalc, priority: "1.0" },
    { path: "/about", lastmod: SITE.effectiveDate, priority: "0.5" },
    { path: "/methodology", lastmod: SITE.effectiveDate, priority: "0.5" },
    // Data-accuracy log — lastmod tracks the newest verification session, so its
    // freshness is real (it changes every time we re-verify).
    { path: "/verification", lastmod: verificationLog[0]?.date ?? SITE.effectiveDate, priority: "0.6" },
    { path: "/contact", lastmod: SITE.effectiveDate, priority: "0.4" },
    { path: "/privacy", lastmod: SITE.effectiveDate, priority: "0.3" },
    { path: "/terms", lastmod: SITE.effectiveDate, priority: "0.3" },
    ...activeCategories().map((c) => ({
      path: `/${CATEGORY_META[c].slug}`,
      lastmod: latestCalc,
      priority: "0.7",
    })),
    ...calculators.map((c) => ({
      path: `/${c.slug}`,
      lastmod: c.lastUpdated,
      priority: "0.8",
    })),
  ];

  const urls = entries
    // Only the current indexing batch — a sitemap listing noindexed pages is a
    // contradictory signal, and the point of the batch is a small surface.
    .filter(({ path }) => isIndexable(path))
    .map(({ path, lastmod, priority }) => {
      const loc = path === "/" ? SITE.url : `${SITE.url}${path}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
