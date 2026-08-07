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
- **UI review** — run the **`web-design-guidelines` skill** (Vercel Web Interface Guidelines) when
  building or changing any UI, and fix findings (a11y, forms, focus, overflow, i18n).
- **Formulas** — TDD. Use the **`superpowers:test-driven-development` skill**; write
  `formula.test.ts` and make it pass before wiring the config. Run `npm test`.
- **Creative/new features** — brainstorm with the user first (`superpowers:brainstorming`) before big
  new directions; for routine "add the next calculator" work, just follow the established pattern.

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
