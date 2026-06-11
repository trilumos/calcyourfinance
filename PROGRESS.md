# PROGRESS.md — changelog & TODO

Living log of what's shipped and what's next (PLAN §11).

---

## 2026-06-11 — Phase B start (Wise, Payoneer) + homepage SEO rebuild + keyword research

### Keyword research (per standing rule — Ahrefs-style, est. volume/competition/CPC)
- Phase B: all 3 clear demand. **Wise** easiest (indie-calculator SERP, `wise fees` 5–12k/mo);
  **Payoneer** clears (`payoneer fees` 6–15k/mo); **Wise vs PayPal** highest demand but hardest
  (editorial authority page 1) → deferred. Exact volumes are estimates (paid tools gated);
  difficulty is SERP-observed (reliable). Heavy freelancer-corridor (India/PH/PK) demand.
- Homepage: **do NOT chase "finance calculator"** (authority wall: calculator.net/Bankrate/
  NerdWallet + wrong intent). Target **`fee calculator` + `seller fee calculator` + the payment-fee
  cluster**; feature high-CPC `credit card / payment fee calculator` for RPM. Homepage = hub.

### Done — Wise & Payoneer (PLAN 1A)
- **`/wise-fee-calculator`** — international transfers. Model from Wise's pricing/API: fee =
  fixed + (% × send amount) in the source currency, 11 corridors (USD→EUR/GBP/INR/AUD/CAD/PHP/MXN,
  GBP→EUR/USD, EUR→USD/GBP). Headlines the **fee** (stable); deliberately does NOT hardcode the
  live FX rate (mid-market, no markup — stated as Wise's selling point). Route dropdown; custom
  per-currency formatting via new `lib/money.ts` `formatByCurrency`.
- **`/payoneer-fee-calculator`** — receiving money. Method-based receiving fee (card 3.99% + $0.49,
  ACH/bank 1%, marketplace/local/P2P free) + optional 0.5% conversion, computed exactly. Withdrawal
  (flat $1.50 same-currency vs 1.2–4% band) and $29.95 annual fee **explained, not faked** (range
  not published per route — avoids false precision).
- **TDD:** `computeWiseFee` (4) + `computePayoneerFee` (5), RED-first. Platform accents added
  (Wise green, Payoneer orange). Registered; cross-linked.

### Done — homepage rebuild (SEO)
- Rewrote `src/pages/index.astro`: retargeted title/meta to the **fee-calculator cluster** (was
  "finance & e-commerce calculators"); mission-led hero (growing library, every needed calculator);
  **all 14 calculators** listed + linked grouped by category + a comparisons group (internal links
  + crawlability, was just 6 featured + hubs); kept "why trust"; added a **~600-word About/mission
  section** (H2/H3) and a **7-question homepage FAQ with FAQPage JSON-LD**; author E-E-A-T link.
  Removed the stale Stripe/PayPal/Etsy-only framing.

### Verified
- 70 tests pass (was 61); `astro build` clean (24 pages, was 22); `npm run keywords` → 3,462
  (14 pages); 15 OG images. SSR confirmed: Wise fee/route, Payoneer net, homepage title/FAQ-LD/
  full calculator index/mission/author.

### Next
- **Wise vs PayPal** — deferred; needs PayPal's international send + FX-markup (~3–4%) modeled
  accurately, then build via the comparison engine.
- **PayPal default-product fix** (still pending user OK): standardize comparison default from
  Checkout 3.49% → Goods & Services 2.99% for fairness/consistency.
- **Phase C:** Razorpay, Paytm (UPI-free + 18% GST), Paddle, Lemon Squeezy. Backlog: PhonePe,
  Braintree, BNPL.

---

## 2026-06-10 — Payment-fees scope locked + Phase A (Cash App, Venmo + 3 comparisons) + cross-links

### Scope decision (PLAN §2 1A)
Triaged the full 1A processor list against demand + model fit. **Defensible complete set (~10):**
Stripe/PayPal/Square (done) + Cash App, Venmo, Wise, Payoneer + Razorpay, **Paytm**, Paddle,
Lemon Squeezy. **Dropped:** Apple/Google Pay (no separate merchant fee — ride the underlying
processor), **Juspay** (orchestration layer, enterprise/negotiated, no public rate), standalone
UPI (zero-MDR → ₹0). **Deferred:** Braintree, Skrill, Authorize.net, Mollie, Adyen, FastSpring,
2Checkout, **PhonePe** (only a blended 1.95%, no official per-method breakdown), and BNPL
(Klarna/Afterpay). Comparisons = relevant/high-demand pairs only, not the full matrix.
- India research nugget: **UPI P2M is zero-MDR (free for merchants)** in India (still law June
  2026); Razorpay/Paytm's % is a *platform fee* applying even on UPI — to be stated on those pages.

### Done — cross-link feature
- **"Compare with other platforms" callout** below the result on every single calculator whose
  platform has comparison pages (auto-derived from `comparisonOf` via `comparisonsForPlatform`).
  Hidden on Etsy (no comparison) and on comparison pages themselves.

### Done — Phase A (US flat-rate wallets)
- **`/venmo-fee-calculator`** (1.9% + $0.10 business / 2.99% personal G&S / 1.75% instant) and
  **`/cashapp-fee-calculator`** (2.75% business flat / 1.75% instant / 3% credit-card), both
  US-only, payment-type selector + reverse mode. Country selector auto-hides (single country).
  Rates verified from official pages 2026-06-10 (corrected Cash App to **2.75%**, not the
  agent's mistaken 2.6% + $0.15).
- **3 comparisons:** `/paypal-vs-venmo-fee-calculator`, `/cashapp-vs-paypal-fee-calculator`,
  `/cashapp-vs-venmo-fee-calculator` (standard receiving rate each: PayPal G&S 2.99% + $0.49,
  Venmo business, Cash App business). Verdicts: Venmo beats PayPal by $1.48/$100; Cash App beats
  PayPal by $0.73; Venmo beats Cash App by $0.75.
- **Shared utils (DRY):** `lib/flatFee.ts` `computeFlatFee` (percent + fixed + extra% + tax-on-fee)
  and `lib/compare.ts` `compareFlat` — so flat processors don't each need a formula file. Venmo
  Cash App + the 3 comparisons all route through them. Platform accents added (Venmo blue, Cash
  App green).
- **TDD:** `computeFlatFee` (6) + `compareFlat` (4), RED-first.
- **Integration:** all 5 registered; auto on `/payment-fees` hub; PayPal `related[]` updated;
  `npm run keywords` → **3,430** (12 pages); `npm run og` → 13 images.
- **Verified:** 61 tests pass; `astro build` clean (22 pages, was 17); SSR numbers/verdict/byline/
  JSON-LD confirmed on all 5; US-only country selector correctly hidden.

### Next (paused here per request)
- **Phase B:** Wise (transfer/FX corridor model) + Wise vs PayPal; Payoneer (receiving/withdrawal).
- **Phase C:** Razorpay, Paytm (per-method, UPI-free + 18% GST), Paddle, Lemon Squeezy (+ Paddle vs
  Lemon Squeezy). Backlog: PhonePe, Braintree, BNPL, the rest.

---

## 2026-06-10 — Square calculator + Stripe vs Square & Square vs PayPal comparisons

### Done (PLAN §2 1A processors + 1D comparisons)
- **`/square-fee-calculator`** — Square across its **8 markets** (US, CA, AU, JP, GB, IE, FR, ES;
  Square doesn't operate beyond these). Rates researched from official `squareup.com/<cc>` pages
  (all HIGH confidence), stored in `fees.ts` as **named variants** (online / in-person / keyed)
  like PayPal, with a foreign-card surcharge and **Irish VAT-on-fee** (23%). Payment-type
  selector, foreign-card toggle, reverse mode; rate cards + keyword variants regenerate from data.
  - Gotchas captured: AU & JP have **no fixed fee** (pure %); US online is plan-dependent
    (free plan 3.3% + $0.30 modelled); GB/IE/FR/ES are two-tier (domestic vs foreign card);
    IE adds VAT on the fee.
- **Two comparisons** (engine reused): **`/stripe-vs-square-fee-calculator`** and
  **`/square-vs-paypal-fee-calculator`**. Both compare on the **online** rate (apples-to-apples);
  Square-vs-PayPal exposes the PayPal product selector. Verdict genuinely flips by country
  (e.g. Stripe wins US online, Square wins UK online) and by amount (PayPal micropayments wins
  tiny sales).
- **Refactor:** extracted the winner logic into a shared **`lib/compare.ts` `decideComparison()`**
  (charge → higher net wins; net → lower charge wins; sub-cent gap = tie) and routed all three
  comparisons through it. stripe-vs-paypal refactored to use it (its 7 tests still green).
- **Square accent** added to `platforms.ts` (deep navy, distinct from PayPal azure).
- **TDD:** `computeSquareFee` (7 tests) + `compareStripeSquare` (5) + `compareSquarePaypal` (5),
  all written failing-first. Test cases pin the per-country/per-amount winner flips.
- **Integration:** all three registered; auto on `/payment-fees` hub; Stripe/PayPal/Square
  `related[]` cross-link the new pages; `npm run keywords` → **3,278** keywords (7 pages, was 2,810
  /4); `npm run og` → 8 OG images.
- **Verified:** 51 tests pass; `astro build` clean (17 pages, was 14); SSR HTML on all three new
  pages carries the numbers, verdict, winner badge, byline and WebApplication/Breadcrumb JSON-LD.

---

## 2026-06-09 — SEO hardening (Google Search Central audit) + named YMYL author

### Done
- **Researched current Google Search Central guidance** (2024–2026: Search Essentials,
  helpful-content-now-core, E-E-A-T/YMYL, spam policies, structured-data gallery, Core Web
  Vitals/INP) and **audited the whole site** against it. Net: on-page SEO was already strong
  (unique content, cited+dated rates, SSR'd numbers, clean schema + internal links, no
  thin/scaled-content risk); gaps were a few missing signals + off-page actions.
- **Code wins shipped:**
  - **Google Search Console verification** wired (`SITE.verification.google`; emits the meta
    tag when set) — the key enabler for submitting the sitemap + requesting indexing.
  - **`WebSite` JSON-LD** added (controls the site-name display). Deliberately **no
    SearchAction** (Google deprecated the sitelinks search box, Nov 2024) and **no HowTo**
    (deprecated 2023) — research overruled the audit's suggestions on both.
  - **Named author (E-E-A-T):** replaced the "Editorial team" placeholder with **Deep Kakadiya
    — Founder & developer, Trilumos**. Emitted as a schema.org `Person` (with LinkedIn +
    trilumos.in `sameAs`, `worksFor` Trilumos), set as Organization `founder`, added
    `parentOrganization` (Trilumos), attached `author` to every calculator's WebApplication,
    and rendered a visible **"Written & verified by Deep Kakadiya"** byline on each calculator
    + profile links on `/about`. (Resolves PLAN §13 open item #1.)
  - **Honest per-page sitemap `lastmod`** (each calc uses its real `lastUpdated`; home/hubs use
    the latest calc date; legal pages use the effective date) — was one build timestamp for all.
  - **og:image width/height** (1200×630) + optional **twitter:site/creator** (`SITE.social.twitter`).
  - Organization schema enriched with `description`.
- **Verified:** 34 tests pass; `astro build` clean (14 pages); author Person/founder/
  parentOrganization + visible byline confirmed in built HTML; sitemap shows real dates;
  no SearchAction present.

### Next (non-code — needs the owner)
- **Verify in Google Search Console** (paste token into `SITE.verification.google`), submit
  `sitemap.xml`, Request Indexing on the 4 calculator pages.
- **Backlinks** — on-page is maxed; authority now comes from external links.
- Standing risk: if we ever generate **per-country pages** (not just keyword rows), each must
  carry materially distinct data to stay clear of scaled-content abuse.

---

## 2026-06-09 — First comparison calculator: Stripe vs PayPal (+ comparison engine)

### Done (PLAN §2 1D — comparison calculators)
- **`/stripe-vs-paypal-fee-calculator`** — the first `kind: "comparison"` page, and the
  reusable engine support every future comparison (Stripe vs Square, Wise vs PayPal, …) will
  share. Pure reuse of existing `config/fees.ts` data + the two unit-tested formulas — no new
  fee research, no new math.
- **Result UX:** side-by-side platform cards with a **winner banner** ("Stripe is cheaper by
  $0.78 on $100"). Each card shows what you keep, the fee, the rate label, effective rate, a
  "Cheaper" badge on the winner, and a note linking to that platform's single tool for its
  extras (Stripe Billing/Invoicing; PayPal G&S/micropayments). Winner banner + winning card
  adopt that platform's brand accent.
- **Engine:** added `ComparisonResult`/`ComparisonColumn` types + `isComparisonResult` guard
  to `_types.ts`; widened `compute` return; added a `<ComparisonReadout>` branch to the
  generic `CalculatorIsland` (the single-receipt `<Readout>`, inputs form, country search,
  SSR-initial-result and lazy recompute are all unchanged). No `CalculatorShell` change — a
  comparison config carries no single `platform`, so no header chip renders.
- **Inputs:** mode (charge/net), amount, **PayPal product** (Checkout / Goods & Services /
  Micropayments — the one asymmetric input, since Stripe has a single online rate), and shared
  international + currency-conversion toggles. Reverse mode grosses each platform up
  independently and the smaller required charge wins.
- **Math (TDD):** `compareFees()` composes `computeStripeFee` + `computePayPalFee` and decides
  the verdict (higher net wins in charge mode; lower charge wins in net mode; a sub-cent gap is
  a tie — no "cheaper by $0.00"). 7 new tests, written-failing-first: winner selection, the
  small-amount flip to PayPal micropayments, tie, reverse-mode parity, surcharge pass-through.
- **Integration:** registered in `index.ts`; auto-listed on the `/payment-fees` hub; Stripe &
  PayPal single configs' `related[]` now point back at the comparison; new keyword cluster +
  co-located `keywords.md`; `npm run keywords` → **2,810** keywords (was 2,396);
  `npm run og` mints `/og/stripe-vs-paypal-fee-calculator.png`.
- **Verified:** 34 tests pass (27 + 7); `astro build` clean (14 pages, was 13); SSR HTML
  carries both nets, the verdict, the winner badge, canonical, og:image and
  WebApplication/FAQPage/BreadcrumbList JSON-LD; new UI passed the web-design-guidelines review.
- Design spec: `docs/superpowers/specs/2026-06-09-stripe-vs-paypal-comparison-design.md`.

### Standing pattern (confirmed with user)
Build each tool **fully integrated** (config + formula + tests + SEO + internal links + hub +
OG) before moving on; when a new tool can be compared against existing ones, add those
comparison pages too. Comparisons involving Etsy are skipped (marketplace, not an
apples-to-apples processor) until more processors land.

---

## 2026-06-09 — PayPal & Etsy country coverage expanded to match Stripe

### Done
- **PayPal → 22 countries** (was 2: US, GB). Added CA, AU, EU (bloc), IN, SG, BR, JP, NZ,
  HK, MX, MY, SE, DE, FR, ES, IT, NL, IE, BE, AT — full parity with Stripe. Every rate read
  from the official `paypal.com/<cc>` business/merchant fee page (all HIGH confidence).
  Each country now carries a standard commercial/Checkout variant **plus a micropayments
  variant**, the correct cross-border surcharge, and currency-conversion %. Notable: India
  is international-only (base rate already reflects cross-border); Mexico fees attract IVA;
  Eurozone is **not** uniform (DE 2.99%+€0.39, FR/ES 2.90%+€0.35, others 3.40%+€0.35), so
  the `EU` bloc uses the most common 3.40% with a note.
- **Etsy → 19 countries** (was 10). Added IE, BE, AT, SE, SG, HK, NZ, MX, **IN**. Processing
  rates verified from official `etsy.com/<cc>/sell` (or `/payments`) pages.
  - **India**: charged in INR (5% + ₹25 + 0.29% regulatory operating fee, dropping to 0.05%
    on 2026-06-22). Fits the normal model — only the *payout* settles in USD via Payoneer,
    which is downstream of the fee math.
  - **Still excluded** (honest coverage, per the "official source + verifiedOn" rule):
    **Japan** (Etsy quotes it as 6% + **US$0.30** — genuinely USD-settled; representing it
    needs a per-(calculator, country) display-currency override, since JPY is hard-wired as
    Japan's currency for Stripe/PayPal — deferred as it risks FX inaccuracy for one country),
    **Brazil** (no rate published on any official Etsy page), **Malaysia** (every official MY
    page 404s; only secondary sources).
- Data-driven as always: only `fees.ts` (+ `paypalEuro` helper) and the two `config.ts`
  country lists / rate-card lists changed; selectors, rate cards and country-keyword
  variants regenerate from it. keywords.md now **2,396** keywords (was 1,363).
- Verified: 27 unit tests pass; `astro build` clean (13 pages); new countries confirmed
  rendering in the static HTML rate cards for both pages.

---

## 2026-06-09 — More countries, more fee options, custom searchable dropdown

### Done
- **Stripe → 22 countries** (verified): added Japan, New Zealand, Hong Kong, Mexico,
  Malaysia, Sweden + Eurozone members (DE/FR/ES/IT/NL/IE/BE/AT share the EEA rate).
  Country selector, rate-card grid and country-keyword variants all expand automatically.
- **New fee options:**
  - Stripe: "Recurring / subscription (Stripe Billing +0.7%)" and "Sent with Stripe
    Invoicing (+0.4%)" toggles (formula `addOnPercent`).
  - PayPal: "Currency conversion (~3%)" toggle.
  - Etsy: "Currency conversion (2.5%)" toggle + the per-country **regulatory operating
    fee** (UK 0.32%, FR 0.47%, ES 0.72%, IT 0.32%) now modeled and shown; Etsy expanded
    to 10 countries.
- **Custom searchable dropdown** replacing the plain native `<select>` everywhere in the
  calculator (DESIGN.md/Geist styling): button + popover, **type-to-search** for the
  country list (matches name/code/currency/search-alias, e.g. "uk" → United Kingdom),
  keyboard nav (↑/↓/Enter/Esc), click-outside close, selected shown in the platform
  accent, works in light + dark.
- Data-driven throughout: fees in `fees.ts` (new `stripeAddOns`, PayPal
  `currencyConversionPercent`, Etsy `regulatoryPercent` + `ETSY_CURRENCY_CONVERSION_PERCENT`),
  rate cards + keyword variants regenerate from it. keywords.md now 1,363 keywords.
- Verified: 27 unit tests pass (new add-on / conversion / regulatory tests); `astro build`
  clean; in-browser light + dark, country switch recompute, and search all confirmed.

### Notes
- PayPal still US/UK only (per-country PayPal rates need separate verification — next batch).
- Etsy regulatory fees increase on 2026-06-22; current rates used, re-verify then.

---

## 2026-06-08 — Pre-deploy checklist (Website Checklist) complete

### Done (PLAN §5b)
- **Checklist added to PLAN.md** as a standing pre-deploy gate + per-page DoD.
- **600-word on-page SEO copy** per calculator (`seoContent` in config, rendered as an
  "About the … calculator" guide section with proper H3 subheadings + body paragraphs).
  Fixed a parser bug that rendered heading+paragraph blocks as one bold H3.
- **Legal/company pages:** Privacy Policy, Terms & Conditions, Contact (About already existed);
  all linked from a 3-column footer (Calculators / About / Legal).
- **Error pages:** 404 (existing) + 500/generic.
- **OG images:** per-page + default 1200×630 PNGs generated by `scripts/make-og.ts`
  (`npm run og`, @resvg/resvg-js, Geist), committed; `og:image` resolves on every page.
  NOTE: resvg mis-instances the Geist variable weight axis ≥500, so OG titles render in a
  condensed synthesis — cosmetic only; refine later (static TTF or satori).
- **Google Analytics (GA4)** `G-CT3RKRWBTF` wired in BaseLayout, gated on `SITE.analytics.gaId`.
- **`robots.txt`** (sitemap ref) + **`sitemap.xml`** (auto; excludes 404/500, includes legal pages).
- **`public/_headers`** for Cloudflare Pages (security + immutable asset caching).
- Verified: 23 tests pass; `astro build` clean (13 pages); mobile layout stacks correctly;
  GA tag, per-page OG, 600-word content, and sitemap contents all confirmed in `dist`.

### Deploy reminder
After connecting the `.com` domain in Cloudflare Pages, disable indexing of the `*.pages.dev`
preview domain so only the canonical domain ranks.

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
