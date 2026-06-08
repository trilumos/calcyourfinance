/**
 * Single, self-contained sitemap at /sitemap.xml (no sitemap index).
 * Lists every indexable page: content pages, category hubs, and every
 * calculator in the registry. Error pages are intentionally excluded.
 */
import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { calculators, activeCategories } from "../calculators";
import { CATEGORY_META } from "../calculators/_types";

export const GET: APIRoute = () => {
  const contentPaths = [
    "/",
    "/about",
    "/methodology",
    "/contact",
    "/privacy",
    "/terms",
  ];
  const hubPaths = activeCategories().map((c) => `/${CATEGORY_META[c].slug}`);
  const calcPaths = calculators.map((c) => `/${c.slug}`);

  const paths = [...contentPaths, ...hubPaths, ...calcPaths];
  const lastmod = new Date().toISOString();

  const urls = paths
    .map((p) => {
      const loc = p === "/" ? SITE.url : `${SITE.url}${p}`;
      const priority = p === "/" ? "1.0" : "0.8";
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
