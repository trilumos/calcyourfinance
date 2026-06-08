# PROGRESS.md — changelog & TODO

Living log of what's shipped and what's next (PLAN §11).

---

## 2026-06-08 — Migrate to Tailwind v4 + Geist (Vercel) design + platform accents

### Done
- **Adopted Tailwind v4** (`@tailwindcss/vite`) with CSS-first `@theme` config; `@custom-variant dark` drives the `[data-theme="dark"]` toggle; `@theme inline` maps semantic CSS vars → utilities so the toggle swaps the whole palette.
- **Implemented the Vercel/Geist system from DESIGN.md**: ink-on-near-white, Geist + Geist Mono (self-hosted), mono uppercase eyebrows, sentence-case period-terminated headlines, pill CTAs, subtle stacked shadows, hairline borders. Built a full dark theme.
- **Option 2 + safe platform accents**: `config/platforms.ts` (Stripe #635BFF, PayPal #0070E0, Etsy orange) drives a theme-aware `--accent` on each calculator — the result number + a small brand chip dot — for recognition without cloning. No logos/impersonation.
- **Refactored everything to Tailwind utilities** + a few stable component classes (`.card`, `.btn*`, `.field-control`, `.field-select`, `.eyebrow`, `.prose`, `.calc-accent`): BaseLayout, header (toggle), footer, breadcrumbs, FAQ, related, AdSlot, CategoryHub, CalculatorShell, CalculatorIsland, home, hubs, about, methodology, 404. Removed all old scoped `<style>` blocks + the old plain-CSS system; deleted `calculator.css`.
- **Web Interface Guidelines pass** (Vercel guidelines skill): added input `name`/`autocomplete`, native-select explicit colors (dark-safe), readout overflow guards (`min-w-0`/`whitespace-nowrap`), focus-visible skip link, `translate="no"` on the brand.
- Verified in-browser: Stripe (purple) light+dark, Etsy (orange) dark, homepage light; theme persists; 23 tests pass; `astro build` clean; CSS ~26KB single file.

### Notes
- Tooling: use Astro MCP, the Tailwind v4 docs skill, and the web-design-guidelines skill going forward (per user). DESIGN.md is the design source of truth.

---

## 2026-06-08 — Redesign: clean/professional + theme toggle + India GST

### Done
- **Full visual redesign** away from the dark-default/gradient "side-project" look to a **clean, light, professional, trustworthy** system: white surfaces, slate ink, single restrained emerald accent, no textures, no gradients. Dropped the Fraunces serif (Hanken Grotesk + IBM Plex Mono only).
- **Light/dark theme toggle** — default **light**; no-FOUC inline head script + header toggle button (sun/moon) + `localStorage` persistence; `color-scheme` set per theme.
- **Result card redesign** — clean bordered card (was emerald gradient receipt): "You receive" in accent, fee/GST as red deductions, bordered net row.
- **Compact calculator hero** — smaller H1, inline verified badge, shorter intro → tool sits above the fold. Fixed a container-query bug so inputs + result render **side-by-side** on desktop.
- **India GST (tax-on-fee) modeling** — Stripe formula now separates processing fee from tax-on-fee; India shows "Stripe fee (2%) −₹2.00" + "GST on fee (18%) −₹0.36". Data in `fees.ts` (`taxOnFeePercent`/`taxLabel`); 2 new tests (fwd + reverse). 23 tests pass.
- Verified in-browser (light + dark + India GST); `astro build` clean.

---

## 2026-06-08 — Scaffold + Phase 1 slice (Stripe / PayPal / Etsy)

### Done
- **Project scaffold:** Astro 5 + Preact islands + sitemap, Vitest, self-hosted fonts (Fraunces · Hanken Grotesk · IBM Plex Mono). Clean-URL static build.
- **Design system ("Ledger"):** warm-paper + ledger-emerald tokens, graph-paper texture, receipt-style readout, semantic deduction/net colors, light + dark. Tokens in `global.css` (+ mirror in `config/theme.ts`).
- **Config-driven framework:**
  - `CalculatorConfig` contract (`calculators/_types.ts`) — single/comparison, country-aware, per-page keyword cluster.
  - Country registry (`lib/countries.ts`, 18 markets), money/format helpers (`lib/money.ts`), SEO/JSON-LD builders (`lib/seo.ts`).
  - Country-keyed fees (`config/fees.ts`) + AI-pricing scaffold (`config/ai-pricing.ts`), every rate cited + `verifiedOn`.
  - Generic `CalculatorIsland` (SSR initial result → zero CLS; lazy-loads per-calculator compute, code-split).
  - Components: BaseLayout (full head SEO), CalculatorShell, FAQ, RelatedCalculators, Breadcrumbs, AdSlot (toggle), CategoryHub, header/footer.
  - Pages: dynamic `[calculator]`, hubs (`/payment-fees`, `/ecommerce-fees`), homepage, `/about`, `/methodology`, 404, robots.txt, sitemap.
- **3 calculators live (built + SEO + tested):**
  - **Stripe** — 8 countries (US/GB/CA/AU/EU/IN/SG/BR), intl-card + FX toggles, reverse mode.
  - **PayPal** — US + GB, transaction-type selector (G&S/Checkout/Micropayments), cross-border, reverse mode.
  - **Etsy** — US/GB/CA/AU/EU, listing + 6.5% transaction + processing + Offsite Ads + profit (item cost).
- **Keyword tracker:** per-page clusters in each config + research notes (`*/keywords.md`); aggregated to root `keywords.md` via `scripts/build-keywords.ts` (33 keywords / 3 pages).
- **Verification:** 22 unit tests passing; `astro build` clean (9 pages); SSR HTML carries H1, readout numbers, canonical, OG, and WebApplication/FAQPage/BreadcrumbList/Organization JSON-LD.

### Verified fee data (source + date in `config/fees.ts`, verified 2026-06-08)
- Stripe per-country rates from `stripe.com/<cc>/pricing`.
- PayPal US (`merchant-fees`) + UK (`business-fees`).
- Etsy (`etsy.com/legal/fees` + Help Center).

### Next
- **Awaiting review** of the 3 calculators (math / copy / design / country handling).
- Then scale Phase 1: more processors (Square, Wise, Payoneer…), marketplaces (Amazon FBA, Shopify, eBay…), creator platforms, comparison pages (Stripe vs PayPal…), and AI/API-cost calculators.
- Add remaining country rates for PayPal (CA/AU/EU) and more Etsy markets.
- OG image generation per calculator (currently references `/og/<slug>.png` — generator TODO).
- Add `ai-api-costs` / `freelance` / `personal-finance` hub pages when those phases start.

### Known TODOs / notes
- OG images not yet generated (meta points at `/og/*.png`; need the generator or a static default).
- `favicon.svg` placeholder mark (≈) — finalize brand mark.
- Author/E-E-A-T identity is a placeholder in `config/site.ts` — needs real name/bio before heavy promotion.
