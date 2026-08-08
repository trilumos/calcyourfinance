# CLAUDE.md — calcyourfinance.com

Project rules for every session. **These are mandatory.** Read `PLAN.md` (strategy/roadmap),
`DESIGN.md` (design source of truth), `PROGRESS.md` (changelog) before non-trivial work.

## ⚠️ RATE-AUDIT PROTOCOL — run this at the START of EVERY session, before anything else

Data accuracy is the product's whole moat. This runs first, always, before any other task:

1. **Check today's date.**
2. **Pull the inputs first — always, before auditing:**
   - `git pull` and read the newest watcher report in `rate-verification/<date>.md`
     (the weekly CI run — its dead-link/`actionable` flags).
   - Read open **user rate reports**: GitHub issues labelled `rate-report`
     (`gh issue list --label rate-report --state open`, or the API).
3. **Decide what's due (schedule anchors, `src/config/verification-tiers.ts`):**
   - **1st of month → FULL audit: ALL 42 fee calculators, every value.**
   - **15th → Tier-1 audit** (the 9 high-traffic/volatile calcs).
4. **Catch-up rule:** if today isn't an anchor, check whether the **last due anchor's
   audit actually happened** (look at `src/config/verification-log.ts` newest entry). If a
   due audit was missed, **do it now, first**, before any other work.
5. **The monthly FULL all-calculator audit MUST ALWAYS happen** — if missed on the 1st,
   run it late, but it is never skipped. Only after it's done do you continue with other work.
6. Verify each rate against the **official page**, triangulate JS/login-walled ones, apply any
   change to `fees.ts` + `rate-history.ts`, bump `verifiedOn` only where fully checked, and log
   the session (real UTC start/end) in `verification-log.ts`. Full scope always — never partial.

See memory `rate-audit-schedule`, `rate-verify-independent-check`,
`verification-method-and-credibility`, `exact-source-per-rate`.

## ⚠ SEARCH-DATA CHECK — also at the START of EVERY session, right after the date

Search Console and GA4 are wired to a service account; **the user has delegated both to
Claude entirely.** Never ask them to paste screenshots or read numbers out — pull the data.

1. `npm run stats` — GSC clicks/impressions/position, top pages, top queries; GA4 users,
   top pages, traffic channels. (28-day window.)
2. `npm run audit:gsc` — sitemap state as Google sees it, **per-URL indexing verdicts**
   (URL Inspection API), and drift checks of the live site vs the registry and the
   indexing allowlist.
3. **Report what CHANGED since last session, and anything newly broken** — new queries,
   a page that gained or lost indexing, a sitemap that stopped being read, a canonical
   Google disagrees with, a drift check that flipped to FAIL. Don't just dump the numbers.

Credentials: service-account JSON in `secrets/` (gitignored, never commit). GA4 property
`540631319`. GSC is a **domain property** (`sc-domain:calcyourfinance.com`).

Why this is mandatory: connecting GSC immediately exposed real problems that months of
guessing had not — the five batch-1 pages are "URL is unknown to Google" despite sitting in
a successfully-downloaded sitemap, and our sitemap contradicted our own canonical. Those are
only visible in the data. See memory `session-start-search-data`.

## What this is
A fast, static, **config-driven** library of finance / e-commerce / payment / AI-API calculators.
SEO-first, long-tail-first, monetized by display ads. Astro + Preact islands, statically generated,
all math client-side. One shared template; a new calculator = a config + a formula + tests.

---

## ALWAYS use these (tools / skills / MCP)

- **Astro** — for any Astro question or setup, use the **Astro MCP** (and the Vercel docs MCP, which
  covers Astro) for current docs. Don't answer Astro/build/config from memory.
- **Tailwind** — styling is **Tailwind v4** (`@tailwindcss/vite`, CSS-first `@theme`). Use the
  **`tailwind-4-docs` skill** when writing/refactoring/reviewing Tailwind. Follow its engineering
  playbook: compose with utilities in markup first; extract markup before CSS; tokens before repeated
  arbitrary values; only a few small, stable component classes.
- **SEO — ALWAYS use the `claude-seo` plugin** (skills + subagents) for anything SEO: audits,
  on-page/technical checks, schema, Core Web Vitals, content/E-E-A-T review, **keyword research**,
  **topic clustering** (`seo-cluster` for the calculator-cluster rebuild), comparison/alternatives
  pages, GEO/AI-Overviews, sitemaps, backlinks, drift checks. Prefer its skills/subagents over
  ad-hoc web search or from-memory SEO. This is mandatory — never do SEO work without it. It pairs
  with the GSC/GA4 data (already wired: `npm run stats`, `npm run audit:gsc`). See memory
  `always-use-claude-seo`.
- **UI review** — run the **`web-design-guidelines` skill** (Vercel Web Interface Guidelines) when
  building or changing any UI, and fix findings (a11y, forms, focus, overflow, i18n).
- **Formulas** — TDD. Use the **`superpowers:test-driven-development` skill**; write
  `formula.test.ts` and make it pass before wiring the config. Run `npm test`.
- **Creative/new features** — brainstorm with the user first (`superpowers:brainstorming`) before big
  new directions; for routine "add the next calculator" work, just follow the established pattern.

## ⚠ IRON RULE — NEVER DEGRADE RESPONSIVENESS
**Never ship a change that makes the site less responsive than it was. Always improve it.**
Every new or edited component must work from 320px up: no horizontal page scroll at any width,
wide content (tables, code, diagrams) scrolls inside its own `overflow-x:auto` container, touch
targets ≥44px, text never clipped or overlapping, no fixed pixel widths where a fluid unit works.
Check every viewport you touch — 320 / 375 / 768 / 1024 / 1440 — in **both** light and dark.
This applies to interaction responsiveness too: don't regress LCP/CLS/INP. SSR the initial
result, reserve space so nothing shifts, and keep islands small.
Run the `web-design-guidelines` skill on any UI change and fix what it finds. A layout that
"looks fine on my laptop" is not verified. See memory `never-degrade-responsiveness`.

## ⚠ IRON RULE — NEVER SHIP A TEMPLATED PAGE

Template-at-scale is why this domain wouldn't index (70 near-identical calc pages → Google's
scaled-content throttle → "unknown to Google"). **Every page — this batch and every future
batch/page — must be built so no two pages share their connective tissue.** The mandatory
per-page process (proven on batch 1):

1. **Verify the facts from primary sources first** — never build on unverified numbers;
   triangulate; kill myths (e.g. the BMaC "Gold tier" that doesn't exist). See the rate-audit
   iron rules.
2. **Lead with a distinct wedge** — the ONE non-obvious insight that makes the page worth
   reading (BMaC's hidden ~9–18%; Gumroad's Direct-vs-Discover cliff; Substack's hidden Stripe
   cost; Bandcamp's Friday 0%; Ko-fi's Contributor default). No two pages share a wedge.
3. **Scannable pattern** — TL;DR bullets, data tables, short answer-first paragraphs, clear H2s.
4. **VARY THE SCAFFOLDING per page** — the TL;DR opener label, the section headings
   ("How the math works" / "Accuracy and scope" etc.), the sources/closer sentence, and the
   generic FAQs ("is there a monthly fee?", "what percentage does X take?") must be UNIQUE to
   each page. Never reuse the same opener/heading/closer/FAQ skeleton across pages — fold each
   page's own wedge into them. This is the single biggest indexing risk; Ko-fi is the reference
   for how varied it should read.
5. **Run the `claude-seo` cross-page similarity + content audit BEFORE merge** — a shingle/
   similarity check across the whole batch, plus per-page E-E-A-T/citability. Fix everything it
   flags; verify in the build that NO template phrase is shared across the set.
6. **Internal-link mesh** — homepage → every indexable page, and each page → its siblings, with
   descriptive anchor text; internal `/slug` links are follow links (the crawl lever).
7. **Merge only after** the audit passes and a phrase sweep confirms zero shared scaffolding.

See memory `never-ship-templated-pages`. Also: on widening the indexing allowlist, re-derive
`related` site-wide (the `src/config/indexing.ts` iron reminder).

## Design (non-negotiable — see DESIGN.md)
- **DESIGN.md is the source of truth**: the **Vercel / Geist** system. Ink-on-near-white, **Geist +
  Geist Mono** (self-hosted via fontsource), mono uppercase eyebrows, **sentence-case,
  period-terminated headlines**, **pill CTAs** (black primary / white secondary), hairline borders,
  subtle **stacked** shadows (never one heavy drop), weight-600 display ceiling. Clean, professional,
  trustworthy — **not** flashy, no gradients-as-decoration at component scale, no graph-paper textures.
- **Light + dark theme toggle**, default **light**. Dark via `[data-theme="dark"]` (toggle sets it +
  `localStorage`; no-FOUC inline head script). `@custom-variant dark` + `@theme inline` map semantic
  CSS vars → utilities so the toggle swaps the whole palette.
- **Platform accents (Option 2 + accents):** each calculator carries an optional `platform` key →
  `config/platforms.ts` brand colour, applied as a theme-aware `--accent` (result number + a small
  brand chip) via the `.calc-accent` scope. Recognition only — **never clone a platform's site, never
  use their logos** (trademark / AdSense risk).
- Tokens live in `src/styles/global.css` (`@theme` + semantic vars). Small component classes only:
  `.card`, `.btn`/`.btn-primary`/`.btn-secondary`, `.field-control`, `.field-select`, `.eyebrow`,
  `.prose`, `.calc-accent`, `.tnum`.

---

## Architecture conventions (don't break these)
- **A calculator's folder name MUST equal its `slug`** (e.g. `src/calculators/stripe-fee-calculator/`).
  The generic `CalculatorIsland` lazy-loads each calc's `compute()` via
  `import.meta.glob("../calculators/*/config.ts")` matching `/${slug}/config`; a mismatch silently
  breaks live recompute.
- New calculator = `config.ts` (metadata + keyword cluster + platform + `compute` adapter) +
  `formula.ts` (**pure** math, unit-tested) + `formula.test.ts` + co-located `keywords.md`, then
  register in `src/calculators/index.ts`.
- Pure math in `formula.ts`; `config.compute(values, ctx)` is only the presentation adapter (formats
  raw numbers → result rows).
- **All platform fees in `src/config/fees.ts`** (country-keyed); AI prices in `config/ai-pricing.ts`.
  Every rate carries `source` (official page) + `verifiedOn` (YYYY-MM-DD). Editing one file updates all
  dependent pages. Web-search the official pricing page when adding/verifying fees; render the date.
- **Per-page keywords** live in each config's `keywords` field; the root `keywords.md` is
  **auto-generated** by `npm run keywords` — never hand-edit it.
- **Country keyword rule (standing):** `build-keywords.ts` automatically adds a
  `"<keyword> for <country>"` variant of **every** base keyword for **every** supported
  country (search-friendly names in `COUNTRY_SEARCH_NAME`, e.g. "uk", "india", "singapore"),
  so each page targets country-specific searches ("stripe fee calculator for uk"). This is
  automatic for any calculator with a `countries` field — don't hand-add these.
- Country-aware calcs use a country selector; rates/currency/worked example update together.
- **SSR the initial result** (CalculatorShell computes server-side) so static HTML has the numbers
  (SEO + zero CLS); the island hydrates for interactivity.
- Every calculator page: breadcrumbs → tool (above fold) → how-it-works → worked example → related →
  FAQ → sources/last-updated. Per-page `<title>`/meta/canonical/OG + `WebApplication` + `FAQPage` +
  `BreadcrumbList` JSON-LD (site-wide `Organization`). Generated from config in `lib/seo.ts`.

## Build phases (order — see PLAN.md)
Phase 1 e-commerce/payment/platform-fee + comparison + AI/API-cost calculators (open-ended) →
Phase 2 freelance/business → Phase 3 specific personal-finance long-tail → Phase 4 head terms (last).

## Verify before claiming done
- `npm test` (Vitest) — every formula has tests; they must pass.
- `npm run build` (Astro) — must be clean.
- For UI changes, check in the browser (light + dark) and run the `web-design-guidelines` skill.
- Keep `PLAN.md`, `keywords.md` (via `npm run keywords`), and `PROGRESS.md` updated.

## Deploy
Cloudflare Pages (chosen). Build `npm run build`, output `dist/`. Ads abstracted behind `AdSlot.astro` +
`SITE.ads` (one-flag swap AdSense → Ezoic → Mediavine).
