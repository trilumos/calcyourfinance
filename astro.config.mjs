// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Site URL drives canonical tags, sitemap, and OG absolute URLs.
const SITE = "https://calcyourfinance.com";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  integrations: [
    preact(),
    sitemap({
      // Calculators change as fees are re-verified; weekly is a sane default.
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      // Keep error/utility pages out of the sitemap.
      filter: (page) =>
        !/\/(404|500)\/?$/.test(page),
    }),
  ],
  build: {
    // Clean URLs: /stripe-fee-calculator (not /stripe-fee-calculator/index.html)
    format: "file",
    inlineStylesheets: "auto",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
