# PLAN.md — calcyourfinance.com

> **Status:** Draft v1 — awaiting your approval before any scaffolding.
> **Last updated:** 2026-06-08
> **Owner:** You (product/SEO review) + Claude (engineering/SEO execution)

---

## 0. One-paragraph mission

Build a fast, static, config-driven library of finance/business calculators that wins **specific, low-competition long-tail "compute this exact thing" queries first**, monetized by display ads (AdSense → Ezoic → Mediavine as traffic grows). We avoid head terms (mortgage/loan/retirement) until the domain has earned authority. Each calculator is one standalone, statically-generated page sharing one template. All math runs client-side. Only running cost is the (already-owned) domain + free static hosting.

**Non-negotiables (from brief):**
- SEO-first, long-tail-first. Easy wins before head terms.
- One calculator = one page, one shared template.
- Config-driven: new calculator = a config object + a formula function + tests. Not a UI rebuild.
- Astro, statically rendered, minimal JS, Lighthouse 95+ mobile, no CLS from ads.
- YMYL discipline: correct + cited formulas, unit tests, methodology/author pages, disclaimers.

---

## 1. Tech stack & architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** | Best-in-class static HTML output, partial hydration ("islands"), zero JS by default — ideal for SEO + CWV. |
| Calculator interactivity | **Astro islands** (Preact or vanilla TS) | Only the calculator widget hydrates; the surrounding page ships as static HTML. Preact keeps the island ~3–4KB. |
| Styling | **Plain CSS + design tokens** (CSS custom properties) | No runtime CSS-in-JS, no Tailwind purge complexity, smallest payload. Tokens in one theme file. |
| Math | Pure TS functions, no dependencies | Testable, auditable, no network. |
| Money math | `Decimal`-safe helpers (avoid float drift on fees/currency) | Fees and currency must be exact; we round explicitly. |
| Tests | **Vitest** | Fast, TS-native unit tests for every formula. |
| Schema/SEO | Generated from config (JSON-LD) | Structured data is never hand-written per page. |
| Sitemap/robots | `@astrojs/sitemap` + generated `robots.txt` | Auto-maintained. |
| OG images | `astro-og-canvas` (or Satori) per calculator | One generated image per page, no manual design. |
| Hosting | **Cloudflare Pages** (recommended) — Vercel as alternative | See §10. |
| Analytics | Cloudflare Web Analytics or Plausible (privacy-friendly, no CLS) | Avoid heavy GA if possible; revisit. |

### Repo structure (proposed)

```
calcyourfinance/
├─ PLAN.md
├─ PROGRESS.md            # changelog + TODO
├─ keywords.md            # living keyword tracker (table)
├─ astro.config.mjs
├─ package.json
├─ src/
│  ├─ config/
│  │  ├─ site.ts          # domain, org info, author, social
│  │  ├─ fees.ts          # ALL platform fees + verified-on dates + source URLs
│  │  └─ theme.ts         # design tokens
│  ├─ calculators/        # THE REGISTRY — one folder per calculator
│  │  ├─ _types.ts        # CalculatorConfig type
│  │  ├─ index.ts         # registry: array of all calculators
│  │  ├─ stripe-fee/
│  │  │  ├─ config.ts     # inputs, copy, FAQ, schema, related, KEYWORDS
│  │  │  ├─ keywords.md   # this page's keyword research (SERP notes, PAA, labels)
│  │  │  ├─ formula.ts    # pure compute function
│  │  │  └─ formula.test.ts
│  │  ├─ stripe-vs-paypal/   # comparison calculator (kind:"comparison")
│  │  │  └─ ...
│  │  ├─ openai-api-cost/    # AI/API cost calculator
│  │  │  └─ ...
│  │  └─ ...
│  ├─ components/
│  │  ├─ CalculatorShell.astro      # frame: H1, intro, tool slot, sections
│  │  ├─ inputs/                    # CurrencyInput, PercentInput, NumberInput, Select
│  │  ├─ CalculatorIsland.tsx       # the hydrated widget (reads config)
│  │  ├─ FAQ.astro                  # renders FAQ + FAQPage JSON-LD
│  │  ├─ RelatedCalculators.astro
│  │  ├─ Breadcrumbs.astro          # + BreadcrumbList JSON-LD
│  │  ├─ AdSlot.astro               # toggleable, reserves space (no CLS)
│  │  └─ Schema.astro               # SoftwareApplication/Org JSON-LD
│  ├─ layouts/
│  │  └─ BaseLayout.astro           # <head> SEO: title/desc/canonical/OG/twitter
│  ├─ pages/
│  │  ├─ index.astro                # homepage
│  │  ├─ [calculator].astro         # dynamic route — generates every calc page from registry
│  │  ├─ ecommerce-fees.astro       # category hub
│  │  ├─ payment-fees.astro         # category hub
│  │  ├─ ai-api-costs.astro         # category hub
│  │  ├─ freelance.astro            # category hub
│  │  ├─ personal-finance.astro     # category hub
│  │  ├─ about.astro                # E-E-A-T: methodology + author
│  │  └─ methodology.astro
│  └─ lib/
│     ├─ money.ts        # rounding/format helpers
│     ├─ countries.ts    # country list + currency/locale map
│     └─ seo.ts          # title/desc/schema builders
├─ scripts/
│  └─ build-keywords.ts  # aggregates every page's keywords -> root keywords.md
└─ public/
   ├─ robots.txt (generated)
   └─ favicon, etc.
```

### The `CalculatorConfig` contract (the heart of "config-driven")

```ts
interface CalculatorConfig {
  slug: string;                 // "stripe-fee-calculator" -> /stripe-fee-calculator
  kind: "single" | "comparison";// single tool, or N platforms side-by-side
  category: "ecommerce-fees" | "payment-fees" | "ai-api-costs"
          | "freelance" | "personal-finance" | "general";
  title: string;                // <title> + H1 (contains exact target keyword)
  metaDescription: string;
  h1: string;
  intro: string;                // one short paragraph

  // --- Per-page keywords (this page OWNS its cluster; site tracker aggregates) ---
  keywords: {
    primary: string;            // the one exact-match target
    secondary: string[];        // close variants this page should also rank
    longTail: string[];         // captured from SERP + People-Also-Ask
    competition: "E" | "M" | "H";
    estVolume?: number;         // from your Ahrefs/Google exports when available
  };

  // --- Country-aware fees (Stripe/PayPal/Etsy etc. differ by country) ---
  countries?: {
    supported: CountryCode[];   // e.g. ["US","GB","CA","AU","EU","IN"]
    default: CountryCode;       // pre-selected (usually "US")
  };                            // omit when fees are country-flat

  inputs: InputSpec[];          // drives the UI AND the formula args
  compute: (values, ctx) => Result;   // pure fn; ctx carries selected country
  resultLayout: ResultSpec;     // how to display outputs (labels, formatting)

  // For kind:"comparison" — the platforms/configs being compared
  comparisonOf?: string[];      // e.g. ["stripe","paypal"] -> shared fee data

  howItWorks: string;           // formula in plain English
  workedExample: WorkedExample; // real numbers
  faqs: { q: string; a: string }[];   // long-tail + PAA answers
  related: string[];            // slugs for internal linking
  sources: { label: string; url: string }[];  // citations
  feesVerifiedOn?: string;      // for fee calculators
  lastUpdated: string;
}
```

**`fees.ts` is country-keyed** so one edit updates every dependent page + country:
```ts
// fees[platform][country] = { ...rates, source, verifiedOn }
fees.stripe.US  = { percent: 2.9, fixed: 0.30, currency: "USD",
                    source: "https://stripe.com/pricing", verifiedOn: "2026-06-08" };
fees.stripe.GB  = { percent: 1.5, fixed: 0.20, currency: "GBP", /* intl/amex differ */ ... };
```

Adding a calculator = create `config.ts` + `formula.ts` + `formula.test.ts`, register in `index.ts`. Page, schema, SEO tags, breadcrumbs, FAQ markup, country selector, and OG image all generate automatically. **Comparison pages** reuse the same fee data — no duplicated rates.

---

## 2. Phase roadmap (build in THIS order)

### Phase 1 — E-commerce, payment, platform-fee, comparison & AI/API-cost calculators
*Lowest competition, clearest "tool" intent, sellers/builders search constantly, big finance sites ignore these.*

**Operating principle: this list is a seed, not a cap.** There is *some* competition (dedicated single-purpose calculator sites exist), so we win by **breadth + depth + freshness + country coverage** they don't bother with. We build a calculator for *every* platform with a published fee structure, plus head-to-head comparisons, plus the AI/API-cost niche that is exploding and under-served. We keep discovering and adding.

Phase 1 splits into five sub-groups. Each row is a *candidate* — every one gets the §3-A keyword/SERP validation before build; some may be merged, dropped, or re-sliced based on what the SERP shows.

**1A — Payment processors / gateways** (`category: payment-fees`)
Stripe, PayPal, Square, Wise, Payoneer, Venmo (business), Cash App, Skrill, Braintree, Authorize.net, Adyen, Mollie, Razorpay, Paddle, Lemon Squeezy, FastSpring, 2Checkout/Verifone, Klarna, Afterpay, Apple Pay / Google Pay (where fee logic applies).

**1B — Marketplaces & seller platforms** (`category: ecommerce-fees`)
Etsy, Amazon (FBA + referral/FBM), Shopify, eBay, Walmart Marketplace, Mercari, Poshmark, Depop, Vinted, TikTok Shop, Facebook/Instagram Shop, StockX, Reverb, Bonanza, Whatnot, AliExpress/Temu seller, App Store (30/15%), Google Play.

**1C — Creator / digital-product / POD platforms** (`category: ecommerce-fees`)
Gumroad, Patreon, Ko-fi, Buy Me a Coffee, Substack, Teachable, Podia, Kajabi, Sellfy, Bandcamp, Printful, Printify, Redbubble, Spring (Teespring), Fiverr, Upwork (freelancer-side fees).

**1D — Comparison calculators** (`kind: "comparison"`) — high-intent, low-supply
Stripe vs PayPal, Stripe vs Square, PayPal vs Venmo, Square vs Stripe, Etsy vs Shopify, Shopify vs eBay, Amazon vs eBay, Gumroad vs Patreon, Wise vs PayPal, Paddle vs Stripe, Lemon Squeezy vs Gumroad — plus an N-way "payment processing fee comparison" hub tool.

**1E — AI token-cost & API-cost calculators** (`category: ai-api-costs`) — fast-growing, under-served
OpenAI API cost (GPT-4o / GPT-4.1 / o-series, per-1M input/output tokens), Anthropic Claude API cost (Opus/Sonnet/Haiku), Google Gemini API cost, plus: LLM token-cost comparison (OpenAI vs Claude vs Gemini), token counter → cost, embeddings cost, image-gen cost (DALL·E / Midjourney / Stable Diffusion), Whisper/transcription cost, fine-tuning cost; and infra API costs (Twilio SMS, SendGrid/email, AWS S3/egress, etc.). Model prices live in a `config/ai-pricing.ts` mirroring the fees pattern (price + `source` + `verifiedOn`).

**Country coverage:** Stripe, PayPal, Wise, Etsy, Square (and others) have **country-specific rates**. Those calculators get a **country selector**; `fees.ts` is keyed `[platform][country]`. Launch set: **US, UK, CA, AU, EU, IN, SG, BR**, plus additional **tier-2 high-search-volume markets** validated by research (candidates: DE, FR, NL, IE, NZ, MX, AE, PH, MY, ZA — included where the platform publishes a distinct rate *and* there's search demand). Country choice updates math, currency formatting, and the worked example live. We expand the country list over time the same way we expand calculators.

**Fees handling:** For each platform, web-search the *official current fee page* (per country where relevant), store numbers in `config/fees.ts` (AI prices in `config/ai-pricing.ts`) with `source` URL + `verifiedOn` date, and render a visible "Fees last verified: <date>" line. Editing one config updates every dependent single + comparison page.

**Phase 1 slice plan:** Ship **Stripe, PayPal, Etsy** end-to-end first (with country selectors), built + full SEO + tested + reviewed by you → you approve the pattern → then scale across 1A–1E in ~3–4/week batches, prioritizing Easy + decent-volume keywords surfaced by research.

### Phase 2 — Freelancer & business calculators
*Low YMYL sensitivity, good ad RPM.*

- Freelance hourly rate (from target salary) — `/freelance-hourly-rate-calculator`
- Day rate calculator — `/day-rate-calculator`
- Profit margin & markup — `/profit-margin-calculator`
- Break-even calculator — `/break-even-calculator`
- Cost-plus pricing — `/cost-plus-pricing-calculator`
- Invoice late-fee calculator — `/invoice-late-fee-calculator`
- Hourly ↔ salary converter — `/hourly-to-salary-calculator`
- SaaS metrics suite: MRR/ARR, churn, LTV, CAC, LTV:CAC, payback, runway/burn — likely **several focused pages** (e.g. `/mrr-calculator`, `/churn-rate-calculator`, `/ltv-calculator`, `/cac-calculator`, `/saas-runway-calculator`) rather than one mega-tool, because each targets a distinct keyword.

### Phase 3 — Specific personal-finance long-tail
*Rankable versions of YMYL terms.*

- Debt snowball vs avalanche — `/debt-snowball-vs-avalanche-calculator`
- Extra/biweekly mortgage payment savings — `/biweekly-mortgage-calculator`
- 50/30/20 budget — `/50-30-20-budget-calculator`
- Compound interest with monthly contributions — `/compound-interest-calculator`
- Coast-FIRE / FIRE number — `/coast-fire-calculator`, `/fire-number-calculator`
- Savings-goal "how long to save" — `/savings-goal-calculator`
- Rule of 72 — `/rule-of-72-calculator`
- Inflation-adjusted return — `/inflation-adjusted-return-calculator`

### Phase 4 — Generic / head terms (LAST, only after authority + backlinks)
- Mortgage, auto loan, personal loan, retirement, amortization schedule, etc. Deep content, added once Google trusts the domain.

### Publish cadence
- **3–4 new calculators/week** sustained (brief's target).
- Phase 1 front-loaded: first 3 as a reviewed slice, then ~4/week to finish the phase in ~2 weeks.
- Each batch: research → build → test → internal-link → publish → log in PROGRESS.md.

---

## 3. Per-phase workflow (repeat every phase)

For each phase, four steps with a definition of done:

### A. Keyword-research step — **per page, then aggregated**
Keywords are owned **per calculator page**, not as one global list. Each page targets **one primary keyword + a cluster** (secondary variants + long-tails answered in its FAQ). The site-wide tracker is the *combination* of all pages' clusters, generated automatically.

- You supply Google/Ahrefs exports (volume + difficulty) per keyword when available; I attach them to the owning page.
- **I independently** web-search each candidate to: inspect the live SERP (who ranks + apparent authority), confirm intent is **tool** not **article**, harvest long-tail variants + People-Also-Ask, estimate competition.
- Label each **Easy / Medium / Hard**; prioritize Easy + decent volume.
- Store each page's cluster in its **`config.ts` `keywords` field** + research notes in its co-located **`keywords.md`**.
- Run `scripts/build-keywords.ts` to regenerate the **root `keywords.md`** = every page's cluster combined (grouped by page, with primary flagged).
- **DoD:** every calculator has its own keyword cluster (1 primary + ≥3 secondary + ≥4 long-tail/PAA), intent confirmed = tool, competition labeled, and it appears in the aggregated root tracker.

### B. Build step
- Write `config.ts` + `formula.ts` + `formula.test.ts`; register in `index.ts`.
- Page auto-generates via the shared template.
- **DoD:** see §5 page Definition of Done.

### C. Internal-linking step
- Add the new calc to its **category hub** page.
- Populate `related[]` with 3–6 sibling slugs (and update siblings to point back where natural).
- Link from homepage if it's a flagship.
- **DoD:** no orphan pages — every calculator is reachable from a hub + has ≥3 inbound internal links.

### D. Publish + verify step
- Build, Lighthouse check, validate schema, deploy.
- Submit/verify in Google Search Console.
- **DoD:** page live, indexed-submitted, Lighthouse mobile 95+, schema validates, logged in PROGRESS.md.

---

## 4. Page template (every calculator page)

Exact order, top to bottom:

1. **Breadcrumbs** (Home › Category › Calculator) + `BreadcrumbList` schema.
2. **The calculator tool, above the fold** — instant, no signup, mobile-first, large tap targets, no layout shift. **Country selector** shown when fees are country-specific (updates math + currency + worked example live).
3. **H1** containing the exact target keyword.
4. **One short intro paragraph** — what it does, who it's for.
5. **"How it works" / the formula** in plain English.
6. **Worked example** with real numbers.
7. **Related calculators block** — internal links.
8. **FAQ** — answers long-tail variants + PAA, with `FAQPage` schema.
9. **Footer disclaimer** — "estimation, not financial advice" + "last updated" date (+ "fees verified on" for Phase 1).

**Clean URLs:** `/stripe-fee-calculator`, `/freelance-hourly-rate-calculator`, etc. No nesting, no trailing IDs.

---

## 5. Definition of Done — per calculator page

A page is "done" only when ALL of:

- [ ] Config + formula + passing unit tests (edge cases: zero, large numbers, currency rounding; **each supported country** for country-aware calcs).
- [ ] Formula/fees cited (official fee page or standard financial-formula source) in `sources[]`, rendered on page; **per-country source** where rates differ.
- [ ] Country selector present + working when fees are country-specific.
- [ ] Page owns a keyword cluster (1 primary + ≥3 secondary + ≥4 long-tail) in `config.ts`; appears in aggregated root `keywords.md`.
- [ ] H1 = exact primary keyword; `<title>`, meta description, canonical, OG + Twitter tags present.
- [ ] JSON-LD: `SoftwareApplication`/`WebApplication` + `FAQPage` + `BreadcrumbList`; validates on schema.org / Rich Results Test.
- [ ] Intro, How-it-works, worked example, FAQ (≥4 Qs from real long-tail/PAA) written.
- [ ] Related-calculators block populated; page added to category hub; ≥3 inbound internal links.
- [ ] OG image generated.
- [ ] Mobile Lighthouse **95+** (perf/SEO/best-practices/a11y), no CLS, ad slots reserve space.
- [ ] "Last updated" date (+ "fees verified on" for fee calcs).
- [ ] Page status set to `built` → `published` (regenerate root `keywords.md`); entry in PROGRESS.md.

---

## 5b. Website Checklist — verify before deploy / before each page ships

**Standing rule:** every calculator page must satisfy this **before** it's pushed to GitHub
(which auto-redeploys via Cloudflare Pages). Site-wide items are verified once before the first
deploy and re-checked when structure changes.

### Per page (every calculator)
- [ ] **Mobile responsive** — works and looks right at 360px → desktop; large tap targets; no horizontal scroll.
- [ ] **On-page SEO copy** — **≥ 600 words** of original content about the tool on the page
      (`seoContent` in the config), in addition to intro / how-it-works / worked example.
- [ ] **OG / Twitter meta tags** — title, description, canonical, `og:*`, `twitter:*`, and a
      **resolving `og:image`** (per-page generated PNG).
- [ ] **FAQ section with JSON-LD** — `FAQPage` schema (plus `WebApplication` + `BreadcrumbList`),
      validated in Google's Rich Results Test.
- [ ] Sources cited + `verifiedOn` date; "last updated" date; tested formula.
- [ ] Internal links (related block + category hub); added to sitemap automatically.

### Site-wide (before first deploy)
- [ ] **Legal/company pages:** Privacy Policy, Terms & Conditions, About Us, Contact Us (linked in footer).
- [ ] **Error pages:** 404 (+ generic 500/error).
- [ ] **`robots.txt`** (allows crawl, points at sitemap).
- [ ] **`sitemap.xml`** (auto-generated; excludes error pages).
- [ ] **Google Analytics** (GA4) wired (gated on `SITE.analytics.gaId`).
- [ ] **`_headers`** file for Cloudflare Pages (security + cache headers).
- [ ] After connecting the `.com` domain in Cloudflare Pages, **disable the `*.workers.dev` /
      `*.pages.dev` preview domain** from indexing (so only the canonical domain ranks).

---

## 6. Technical SEO baked into the framework

- Per-page `<title>`, meta description, canonical, Open Graph + Twitter card, generated OG image.
- Site-wide `Organization` schema; per-page `SoftwareApplication` + `FAQPage` + `BreadcrumbList`.
- Auto XML sitemap (`@astrojs/sitemap`) + generated `robots.txt`.
- Category hub pages (`/payment-fees`, `/ecommerce-fees`, `/ai-api-costs`, `/freelance`, `/personal-finance`) targeting broader terms, passing link equity to calculators.
- Performance budget: minimal JS (only the calc island hydrates), no layout shift, ad slots with reserved dimensions. Lighthouse 95+ mobile gate before publish.
- Mobile-first responsive, large tap targets, calc works with no network.

---

## 7. Content & E-E-A-T (YMYL)

- Correct, cited formulas; unit tests for every formula.
- `/about` (methodology + visible author info) and `/methodology` pages.
- "Last updated" date on every calculator; "fees verified on" for fee calcs.
- Footer disclaimer: **"For estimation only — not financial advice."**
- All fee/rate data in editable `config/fees.ts` with `verifiedOn` dates + source links.

---

## 8. Monetization milestone ladder

| Milestone | Trigger | Action |
|---|---|---|
| **Pre-ads** | < 15 quality pages | Build only. Ad slots exist as toggled-off components (reserved space ready). |
| **AdSense** | ~15–20 quality pages live + indexed | Apply to AdSense; flip ad slots on (header, in-content, footer). Watch CLS. |
| **Ezoic** | Meaningful traffic + AdSense approved (~ thousands of sessions/mo) | Swap ad provider via one-line config change; A/B placement. |
| **Mediavine** | **50,000 sessions/mo** | Migrate to Mediavine (highest RPM). One-line provider swap. |

Ad provider is abstracted behind `AdSlot.astro` + a single config flag so swapping AdSense → Ezoic → Mediavine is a one-line change. **Hook left** (not built) for a future "remove ads / save & export / API" paid tier.

---

## 9. Realistic timeline expectations

- **Months 1–2:** Low traffic. New domain + YMYL ramp = slow Google trust. Focus on shipping Phase 1 + 2 volume and clean technical SEO.
- **Month 3+:** First traction. **Fee/business calculators rank first** (lowest competition). Apply AdSense once 15–20 pages indexed.
- **Months 4–6:** Compounding — internal links + freshness + a few backlinks. Begin Phase 3.
- **Phase 4 head terms:** only after authority + backlinks are demonstrably present (likely 6+ months in).

---

## 10. Deployment (when we reach it) — **Cloudflare Pages (chosen)**

- Unlimited free static bandwidth/requests (ad-traffic sites benefit), fast global CDN, free.
- Connect: push repo to GitHub → Cloudflare Pages → build command `npm run build`, output `dist/` → add custom domain `calcyourfinance.com` (Cloudflare manages DNS if domain is on Cloudflare; otherwise point nameservers / add CNAME).

**Domain + AdSense connection** (step-by-step provided when we deploy): point DNS → verify in Google Search Console → submit sitemap → once 15–20 pages indexed, apply to AdSense, add the verification snippet, enable `AdSlot`s.

I'll give exact click-by-click instructions at deploy time.

---

## 11. Living trackers

- **Per-page keywords** — each calculator owns its cluster in `config.ts` (`keywords` field) + research notes in its co-located `keywords.md`. This is the source of truth.
- **Root `keywords.md`** — **auto-aggregated** from all pages by `scripts/build-keywords.ts`. Columns: `keyword | page (target URL) | role (primary/secondary/long-tail) | search intent | est. volume | competition (E/M/H) | status (todo/built/published/indexed) | notes`. Never hand-edited — regenerated so the whole-site list always equals the sum of page clusters.
- **`PROGRESS.md`** — changelog + TODO; one entry per calculator/slice shipped, with date and what's done/next.
- **`PLAN.md`** (this file) — updated if strategy shifts.

---

## 12. Immediate next steps (after your approval)

1. Scaffold Astro project + repo structure (§1), design tokens, `BaseLayout`, `CalculatorShell`, input primitives, `FAQ`/`Schema`/`Breadcrumbs`/`RelatedCalculators`/`AdSlot` components, sitemap/robots, registry plumbing.
2. Add `config/fees.ts` (country-keyed) + `config/ai-pricing.ts` scaffolds, `lib/countries.ts`, and `scripts/build-keywords.ts`; create `PROGRESS.md`.
3. **Per-page keyword research for Stripe, PayPal, Etsy**: SERP + intent + long-tail/PAA + competition labels → each page's `config.ts` + `keywords.md`; aggregate to root `keywords.md`.
4. Build **Stripe, PayPal, Etsy** end-to-end **with country selectors** (config + formula + tests per country + full SEO + internal links + OG), fetching live per-country fees into `config/fees.ts` with sources + verified date.
5. **Show you the 3 calculators for review** (math, country handling, copy, design) before scaling across 1A–1E.

---

## 13. Decisions locked / still open

**Locked:**
- Stack: Astro + islands, static, config-driven. ✅
- Phase 1 is **open-ended**: payments + marketplaces + creator platforms + comparisons + AI/API costs; country-specific rates with a selector; keep discovering. ✅
- Keywords are **per-page clusters**, aggregated into the site-wide tracker. ✅
- Hosting: **Cloudflare Pages**. ✅
- Design: I'll **propose a clean fintech design system**, reviewed on the first 3 calculators. ✅

**Still open (won't block scaffolding):**
1. **Author / E-E-A-T identity** — name + short bio for the About page (you, a brand persona, or a credentialed reviewer). Needed before the About page, not before scaffolding.
2. **Keyword exports** — share any Google/Ahrefs data for Stripe/PayPal/Etsy (and beyond) and I'll attach it to the owning pages; otherwise I do my own SERP research and you layer yours in later.
3. **Country launch set** — I'll start country-aware calcs with US, UK, CA, AU, EU, IN. Add/remove any?

> **Awaiting your final go.** Once you confirm, I scaffold the project + component library, then research + build the Stripe/PayPal/Etsy slice (with country selectors) for your review.
