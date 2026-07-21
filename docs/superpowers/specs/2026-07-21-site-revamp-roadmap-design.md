# CalcYourFinance — Site Revamp & Growth Roadmap (design doc)

**Date:** 2026-07-21 · **Author:** Deep Kakadiya + Claude (Opus 4.8) · **Status:** proposed, awaiting review

**Companion docs:** `CalcYourFinance-SEO-Battle-Plan.md` (per-page SEO/content — do NOT duplicate it here),
`docs/SEO-ACTION-PLAN.md` (backlink playbook), `PLAN.md` (product roadmap), `DESIGN.md` (design system).

This doc is the **north star**. It decomposes an expanded vision — "revamp the UI/UX, make every
page best-in-class so Google indexes us, become the category king, and eventually a SaaS" — into
**four tracks in dependency order**, and specs **Milestone 1 (Foundation)** in enough detail to hand
to `writing-plans`. Later milestones get their own spec→plan cycle when we reach them.

---

## 0. North-star vision (user, 2026-07-21)

**The endgame:** CalcYourFinance becomes *the* source of truth for platform fees — authoritative and
accurate enough that even the platforms themselves (Stripe, PayPal, Etsy, Amazon…) would point people
here to check fees first, and that other tools, blogs, and AI answers cite it by default.

**What that positioning requires (and how it maps to the tracks):**
- **Unimpeachable accuracy, cited + dated.** Every rate from the official page, `verifiedOn` stamped,
  never stale. This is the moat competitors won't match overnight. → Track 1 E-E-A-T finish + a
  staleness process (flag rates >90 days old).
- **A canonical, citable artifact.** The **fee-rate changelog** (`/fee-changes`) and the **open rate
  dataset** (`/rates.json` + `/rates.csv`) make CalcYourFinance the thing others *link to and quote* —
  the mechanism by which a reference source earns its status. → Track 2.
- **Strict neutrality + trademark safety.** Recognition-only accents; **never clone a platform's
  site, never use their logos**. A neutral, non-infringing reference is one a platform can comfortably
  point to; an impersonation is one they'd send a C&D. (Already the standing rule in `CLAUDE.md`.)
- **Trust signals a platform would respect.** Named credentialed author, methodology, unit-tested
  math, no dark patterns, privacy-first ("we don't store your numbers"). → Tracks 1 & 4.

This is a *lagging outcome* of Tracks 1–3 (quality → authority → links/trust), not a task itself. It's
recorded here so every milestone is judged against it: "does this move us toward being the cited
source of truth?" See [[project-status]].

---

## 1. Diagnosis — why Google crawls but won't index (evidence-based, 2026-07-21)

We investigated the actual site rather than assuming. Findings:

**What is NOT the problem (verified):**
- **Not thin content.** Every calculator's `seoContent` alone is 526–1,207 unique words (median ~760),
  *plus* a separate `howItWorks` (~150–250 words), 5–8 unique FAQs, and a worked example. Real unique
  content per page is ~900–1,500 words. This clears the ~500-word / ≥60%-uniqueness bar comfortably.
- **Not orphans.** Category hubs (`CategoryHub`) map **all** children; the revamped homepage lists every
  single calculator by category plus all comparisons. In-site reachability is ≤2 clicks.
- **Not missing E-E-A-T scaffolding.** `lib/seo.ts` already emits `Person` (with `sameAs`:
  LinkedIn + Trilumos), `Organization` (founder + parent), `WebApplication` (author + publisher),
  `FAQPage`, `BreadcrumbList`, `WebSite`. Named credentialed author, dated/cited rates, methodology page.
- **Not technical.** SSR renders numbers into HTML, canonicals are self-referential, sitemap is valid,
  Cloudflare bot-block was fixed last session.

**What IS the problem (ranked by likelihood):**
1. **Young-domain trust gate in a YMYL/finance vertical + zero editorial backlinks.** This is the
   dominant cause. Google's 2026 quality system withholds indexing from low-authority YMYL domains until
   trust exists; finance is the highest E-E-A-T bar it sets. Confirmed by the March 2026 core-update
   pattern: "sites with strong author infrastructure **and** original content + links held; topical
   volume without trust did not." Compounded by the April de-index from historical URL churn.
   → **Unlock: 3–5 real editorial backlinks + referring domains. This is user-side and it is the #1 lever.**
2. **Structural template sameness → limited "information gain."** Every page is visually and structurally
   identical — same layout, same section order, same components, brand accent aside. Google's
   near-duplicate clustering and "low value-add" evaluation key off *structure and presentation*, not just
   word count. When the only differentiation is prose, a young domain's pages look like a scaled template.
   Stated in Google's own vocabulary (and independently confirmed by a second audit, §9):
   **the site-quality classifier is likely grouping the calculators as a templated collection with
   limited information gain.** This is the biggest **code-side** lever, and it's exactly where the UI/UX
   revamp and the SEO differentiation mandate meet.

   > **The information-gain bar (apply to every page):** *what does a visitor learn here that isn't
   > already on the 50 other pages ranking for this query?* If the honest answer is "nothing," the page
   > will keep getting crawled-not-indexed. This is the pass/fail test for M1–M3 work.
3. **Domain-level Helpful-Content proportion.** Google scores the *share* of genuinely value-adding
   pages across the whole domain. The 8 comparison pages are the lightest (526–632 words) and most
   structurally alike each other — the most likely to be filtered and to drag the average.

**Honest verdict:** differentiation + quality signals (this doc's code tracks) are *necessary* but not
*sufficient*; backlinks (SEO-ACTION-PLAN, user-side) make them sufficient. We build the code side to
**remove every excuse Google has and maximize the quality signal**, and we are clear-eyed that indexing
ultimately follows trust. No code change substitutes for the first few links.

---

## 2. The four tracks and why this order

| # | Track | Payoff | Depends on |
|---|-------|--------|-----------|
| **1** | **Foundation quality** — visible differentiation, Core Web Vitals, a11y, E-E-A-T finish | Removes technical/quality excuses; real ranking signals; unblocks the rest | — (the gate) |
| **2** | **Authority / "the king"** — cluster pillars, differentiation wedge per page, link-earning data study, backlinks | The traffic engine; executes the SEO Battle Plan | Track 1 |
| **3** | **UI/UX revamp** — design-system tightening, template variety, motion, polish | Conversion, brand, and (via structural variety) reinforces Track 1 | overlaps Track 1 |
| **4** | **SaaS / API / products** — embed widgets, API, pro features, accounts | Monetization + a moat | Tracks 1–2 (needs traffic) |

**The sequencing truth (why not SaaS first):** Track 4 monetizes traffic and trust the site does not
have yet. Building an API and pro features before the site indexes is building products for zero users —
the classic waste. The **one** Track-4 item that belongs early is the **embeddable widget**, because
each embed is a backlink (it feeds Track 2's trust gap) — but it was explicitly deferred last session
("don't build the embed engine yet"), so it stays parked until the user reopens it. Everything else in
Track 4 waits for measurable indexed traffic.

Tracks 1 and 3 overlap deliberately: making templates less clone-like (Track 3) *is* structural
differentiation (Track 1 lever #2). We do that overlap once, in Milestone 1.

---

## 3. Roadmap (milestones)

Each milestone is a separate spec→plan→build cycle. Only **M1 is fully specced below**; the rest are
scoped headlines to be detailed when we reach them.

- **M1 — Foundation quality** *(this doc, §4)*. Structural differentiation of page templates by type,
  Core Web Vitals + a11y pass, comparison-page depth, E-E-A-T finish. **Deploy gate for everything else.**
- **M2 — Authority clusters** *(from SEO Battle Plan)*. Build `/creator-platform-fees` pillar + upgrade
  Cluster A; ship Cluster H comparisons to full anatomy; differentiation wedge audit across all pages.
  Plus **fee-rate changelog page** (`/fee-changes`) — a public log of every processor pricing change with
  date + old→new delta, generated from the `verifiedOn`/rate history in `config/fees.ts`; a linkable,
  evergreen artifact. Plus **open rate dataset** (`/rates.json` + `/rates.csv`) exposing the single fees
  file as a cited "source of truth" for other tools to link back to (dev-SEO). Both are cheap and can ship
  as soon as M1 lands.
- **M2.5 — Category hubs + supporting guides** *(the topical-authority + link-earning engine)*.
  - **Deepen the category hubs.** `/payment-fees`, `/ecommerce-fees`, `/personal-finance` are currently
    near-thin link lists. Each needs substantial original educational content (~600+ words): how
    processors actually calculate fees, pricing models (flat vs % vs interchange+), international
    surcharges, a comparison table, then the calculators. Google rewards strong category pages.
  - **Supporting guides (non-calculator pages).** Publish explainer content per cluster — "Stripe fees
    explained", "interchange fees", "chargebacks", "MDR explained", "payment gateway comparison" —
    heavily interlinked with the calculators. **This is the point: guides attract backlinks; calculators
    generally don't.** It converts the site's story from "this site has calculators" to "this site is
    *about* payment processing", which is what topical authority means.

- **M3 — Link engine** *(user-side + light code)*. The original data study ("what 30 platforms take from
  creators in 2026") as link bait; **link-magnet guide formats** the calculators can't provide —
  "best payment processor for X", platform reviews, "hidden payment fees" round-ups; directory/outreach
  (incl. a free Viberank submission — skip the paid tier); **email fee-change digest** (owned channel;
  needs an ESP integration) seeded from the changelog; **decision point on the embed widget** (an
  independent second audit also lands on embeds as the highest-leverage link source).
- **M4 — UI/UX polish pass**. Motion, empty/loading/error states, responsive + dark-mode hardening,
  micro-interactions — the "delight" layer, after the structure is right.
- **M5 — SaaS foundation** *(only if traffic warrants)*. Embed widget productized, public API for rates,
  pro features (saved workspaces, alerts on rate changes, CSV/branded exports).

---

## 4. Milestone 1 — Foundation quality (detailed spec)

**Goal:** every page passes the site-level quality gate — visibly differentiated, fast, accessible,
trustworthy — so that when the first backlinks land, indexing follows with no technical excuse left.

**Definition of done:** all five workstreams below complete; `npm test` green; `npm run build` clean at
71 pages; Lighthouse (mobile) ≥ 90 Performance / 100 Accessibility on 3 sampled pages
(a calculator, a hub, the homepage); `web-design-guidelines` skill run with findings fixed.

### W1 — Structural differentiation by calculator type (the biggest code-side lever)

The problem is sameness, not thinness. Right now `[calculator].astro` renders one identical skeleton for
all 60 tools. Introduce **type-aware page modules** so a payment-fee page, a marketplace-profit page, a
comparison page, and a personal-finance page each *look and are structured differently* — surfacing the
value the top-3 competitors don't show:

- **Payment-fee pages:** add a visible **effective-rate readout** and a small **rate-vs-amount curve**
  (proprietary visual — the Battle Plan's named wedge for Stripe/PayPal). Surface reverse mode prominently.
- **Marketplace/seller pages:** lead with a **profit/"what you keep" breakdown** and a **fee-stack table**
  (every line item incl. the ones people forget), not just a total.
- **Comparison pages:** a real **side-by-side table on the same sample transaction** + a
  **"winner at $X / $Y / $Z" verdict** + "when to pick each" — not two calculators glued together.
  (These 8 pages are the weakest today; this is where depth is added first.)
- **Personal-finance pages:** **breakdown table + chart** (amortization for EMI/loan, growth for SIP/CI).

Implementation shape: keep the config contract; add an optional `pageModules`/`layoutVariant` hint on the
config consumed by `[calculator].astro`, and a few small, focused section components (chart, fee-stack
table, effective-rate readout) reused across the type that needs them. **Ponytail:** no new component
unless ≥3 pages use it; reuse `ResultRow`/`RateCards` where they already fit. This work doubles as
Track 3's start — it makes the site look less templated *and* adds indexable unique value.

### W2 — Core Web Vitals (real ranking signal + the "fast" ask)

- **CLS audit of the hydrating islands.** The homepage hero and every calculator SSR the initial result,
  but verify no layout shift when Preact hydrates or when the country auto-detect swaps values. The result
  card already reserves `min-h`; confirm inputs/selects don't reflow. Target CLS < 0.1.
- **LCP:** confirm the LCP element (hero H1 / first result number) isn't blocked by font loading; Geist is
  self-hosted — verify `font-display` and preload of the one critical weight.
- **INP / debounce (verified gap).** `recompute` currently runs synchronously on every keystroke
  (`onInput` → `recompute`, `CalculatorIsland.tsx`). Fine for today's light math, but W1 adds charts and
  amortization tables — debounce the *result* recompute (~120–150ms) while keeping the input itself
  responsive, and memoize currency formatting. Target INP < 200ms. (Raised by the 2026-07-21 external review.)
- Measure with Lighthouse mobile on 3 sampled routes; fix regressions.

### W3 — Accessibility pass (WCAG 2.2 AA — quality signal + your explicit ask)

Run the `web-design-guidelines` skill against homepage, a hub, and a calculator page, and fix findings.
Known focus areas from a first read: focus-visible rings on the custom `Select`, tab/keyboard semantics
on the hero tablist (already partly done), color contrast in dark mode for `text-mute` on `canvas-soft`,
form labels/`aria-describedby` on every input, and `prefers-reduced-motion` for any Track-3 motion added
in W1. Target Lighthouse a11y 100 + manual keyboard pass.

### W4 — Comparison-page depth + E-E-A-T finish (cheap, high-value)

- Bring the 8 comparison pages up to the anatomy in W1 (table + verdict + "when to pick each").
- Fill `SITE.organization.sameAs` (brand social profiles) and `SITE.social.twitter` once they exist;
  add a visible **"Rates verified by {author} on {date}"** line near each tool (dated-and-cited is your
  single biggest trust edge — surface it harder). Confirm schema `dateModified` == `feesVerifiedOn`.

### W5 — Shareable permalink scenario URLs (safe, from the 2026-07-21 review)

Read `?amount=`, `?currency=`/country, and mode from the query string to hydrate the calculator to an
exact scenario, and update the URL (via `history.replaceState`, no reload) as inputs change so users can
bookmark/share a specific calculation. **Every such URL uses `<link rel="canonical">` to the clean base
page** — bookmarkable and shareable with **zero index bloat**. Explicitly NOT a page-per-amount (see
§8); the canonical is non-negotiable.

### Out of scope for M1 (deliberately)
- New calculators (Battle Plan clusters) → M2.
- Backlinks / data study → M3 (user-side).
- Motion/delight polish beyond a11y-safe basics → M4.
- Any SaaS/API/account/embed code → M5, gated on traffic.

---

## 5. What is user-side vs code-side (so effort isn't misattributed)

| Lever | Owner | Milestone |
|-------|-------|-----------|
| Editorial backlinks / referring domains (**the #1 indexing unlock**) | **User** (outreach, Quora/Reddit, HARO, directories) | M3 |
| GSC Request Indexing / Bing + IndexNow submission | User | ongoing |
| Brand social profiles (fills `sameAs`) | User creates → Claude wires | M1/M3 |
| Everything in §4 (differentiation, CWV, a11y, E-E-A-T code) | **Claude** | M1 |
| Cluster pages, pillars, wedges | Claude | M2 |

---

## 6. Metrics (leading → lagging)

- **Leading:** Lighthouse Perf/A11y scores; CLS/LCP; # pages with a genuine per-page wedge; referring
  domains (the number that gates everything).
- **Lagging:** GSC "Crawled – currently not indexed" trend (should shrink cluster by cluster, Tier-1
  first); indexed-pages count; impressions on long-tail queries (weeks before rankings move).
- Do **not** spam Request Indexing — Google says resubmission isn't needed for this status; fix the cause.

---

## 7. Open decisions for the user

1. Approve this roadmap shape and the M1 scope (§4).
2. `CalcYourFinance-SEO-Battle-Plan.md` currently sits untracked at repo root — move into `docs/` and
   commit as the M2 source of truth? (Recommended.)
3. Embed widget stays parked until you reopen it (M3 decision point) — confirm.

---

## 8. External review triage (2026-07-21)

A cold "Viberank" outreach email (post-Product-Hunt lead-gen with a paid $4.99 upsell) included a
site review. Verified against the live code; recorded here so the decisions are durable.

**Already implemented — do not re-add:** dark/light toggle with no-FOUC script; `WebApplication` +
`FAQPage` + `BreadcrumbList` + `Person`/`Organization` JSON-LD; `inputmode="decimal"` on number inputs;
per-calculator "recently used" history (localStorage).

**Premise correction — the "21 languages" is NOT an SEO moat.** It is an on-demand Google-Translate
widget (`LanguageSwitcher.astro`), not 21 sets of uniquely translated indexable pages. So "add hreflang
to rank in non-English SERPs" has nothing to point at. Real localized pages are a large, *risky* project
(automated-translation filter) and are the wrong bet before English pages index. **Parked.**

**Rejected — actively harmful:**
- *"A unique indexable page per long-tail query (e.g. 'Stripe fee on $97 USD→INR')."* Scaled-content /
  doorway pages; for a young YMYL domain this dilutes the helpful-content proportion and worsens the exact
  indexing problem. The safe substitute is W5 (permalinks canonical to base). **Never ship page-per-amount.**
- *Exit-intent / interstitial popups.* Google penalizes intrusive mobile interstitials — hurts indexing.
- *Fabricated social-proof counters* ("used in 47 countries"). Only if backed by real analytics.
- *API / Pro tier now.* Stays M5 — monetizes traffic that doesn't exist yet.

**Accepted and folded in (user-approved 2026-07-21):** permalink scenario URLs → M1-W5; INP/debounce →
M1-W2; fee-rate changelog page + open rate dataset → M2; email fee-change digest → M3.

**Deferred / optional (not scheduled):** copy-results-as-table + CSV export; explicit "no ads, no
tracking, we don't store your numbers" privacy copy; default-dark by system preference (vs the deliberate
default-light in `DESIGN.md`); privacy-first analytics (Plausible/Umami) vs current GA4; PWA offline.

**Deferred — comparison picker (user idea, 2026-07-21).** A "pick platform A vs platform B → Compare"
control that routes to the matching comparison page. **Not built yet, deliberately.** Measured today:
8 platforms appear in comparisons, 8 pairs exist of 28 possible = **29% coverage**, so a naive picker
would dead-end **71%** of selections. And with only 8 comparisons — all already visible as cards, one
click away — a picker adds interaction cost to reach the same destinations, which fails the
"only what contributes" iron rule.
- **Build it when:** the comparison count reaches roughly 25+, where scanning cards stops being practical.
- **Required design constraint:** once platform A is chosen, the second selector must offer **only
  platforms that have an existing comparison with A** (and exclude A itself). That guarantees zero
  dead ends at any coverage level. Without that constraint, do not ship it.

---

## 9. Second audit triage (ChatGPT, 2026-07-21) — `calcyourfinance plan and report.md`

An independent audit the user commissioned. Valuable: it reached the **same diagnosis independently**
(technical SEO excellent; the blocker is quality/trust), which raises confidence in §1.

**Confirmed (no change needed):** technical SEO/schema/canonicals/SSR are strong · every calculator needs
a moat (= our differentiation mandate) · comparison pages are the biggest opportunity (= Battle Plan
Cluster H) · more internal linking · revision history (= our fee-rate changelog) · and critically:
**"don't build more calculators until Google trusts the site — more pages won't fix trust, better pages
will"**, which matches our milestone ordering exactly.

**Adopted (new, folded in above):**
1. **"Information gain"** as the explicit pass/fail bar for every page → §1.
2. **Category hubs need real educational depth** (~600+ words), not thin link lists → M2.5.
3. **Supporting guides as the backlink engine** — guides attract links, calculators don't. This closes the
   gap in our plan between "we need 3–5 editorial links" and "how do we actually earn them" → M2.5 + M3.

**Rejected — would deepen the very problem it diagnoses:**
- *"Every saved calculation becomes shareable at `/share/abc123` → that's indexable."* **No.** Thousands
  of near-identical share URLs is the scaled-content/doorway pattern that its own "templated collection"
  diagnosis warns against — the same reason we rejected page-per-amount in §8. Share/permalink URLs are
  good UX and **must stay `rel=canonical` to the base calculator page**, never separately indexed (M1-W5).

**Calibration:** its 10-phase SaaS vision (accounts → receipt scanner → plugins → AI assistant) is a
*vision*, not a near-term plan — it monetizes traffic that does not exist yet, so it stays behind
Tracks 1–3 exactly as §2 states. Its positioning ideas ("calculators are the free acquisition channel
inside a larger knowledge base"; "a programmable finance toolkit") are a useful complement to the §0
north star and are recorded as such. Its Phase 6 (embeddable calculators = free backlinks) independently
converges on the embed widget already parked in M3.

---

## 10. Homepage v2 structure (decided 2026-07-21)

The homepage becomes an **authority hub**, not a list of tools. Order (✓ = done on `v2`):

1. **Hero** ✓ — centered headline ("Fee and finance calculators you can trust."), one-viewport live
   calculator (input | result side by side), subtle dot-grid + glow backdrop.
2. **Browse by category** ✓ — chips with counts, directly under the fold.
3. **Featured comparisons** *(new)* — our fastest-ranking page type, surfaced early.
4. **Why trust these numbers** — cited/dated/tested/your-currency.
5. **How we verify rates** *(new)* — the E-E-A-T + methodology signal, surfaced not buried.
6. **Recently updated** *(new)* — freshness signal, fed by `verifiedOn`/`lastUpdated`.
7. **All calculators** — the full grouped internal-link index.
8. **Guides** *(new, once M2.5 guides exist)*.
9. **About / long-form** and **FAQ**.

Global chrome: slim navbar (Logo · ⌘K search · Language · Theme, deliberately **neutral** — no brand
colour, see §8 rationale) and the ⌘K command palette as primary navigation.

---

## 12. Release sequence + embed-engine architecture (decided 2026-07-21)

**Agreed order (revised 2026-07-21).** Ship in small, verifiable merges rather than one large one
onto a live site, grouped by *type of work* rather than split mid-stream:

1. a11y + light/dark pass on the homepage. ✅
2. **`v2` — homepage + chrome/legal pages:** About, Contact, Methodology, Privacy, Terms, 404, 500.
   Design and copy consistency with the new homepage.
3. **Pre-merge gate — verify all 60 calculators (§11).** Required because v2 already changed the
   *shared* `CalculatorIsland` (inline region selector, `half` field pairing, toggle layout), so
   merging ships those to every calculator page.
4. Merge `v2` → `main`.
5. **`v3` — all 60 calculator pages *and* the 3 category hubs together.** The hubs list the
   calculators and need their M2.5 content depth (~600 words of original educational content each),
   so they are the same body of work, not a separate one. This is also M1-W1 (per-type structural
   differentiation: effective-rate charts, fee-stack tables, real comparison anatomy).
6. Verify again, merge `v3`.
7. **Then** the embed engine.

**Why the embed comes last, and why "freeze the UI" is the wrong way to protect it.** The tempting
plan is "finalise the calculator UI so it never changes, then embeds are safe". That will not hold —
accessibility fixes, new calculator types and browser changes all force UI work, and M1-W1
*deliberately* changes calculator pages because that is what fixes the templated-collection indexing
problem. A freeze would block the work that makes pages index. The durable protection is a **stable
contract, not a frozen implementation**:

- **Script tag / web component — NOT an iframe.** An iframe produces **no backlink**: search engines
  attribute the framed content to *our* URL, so the attribution link is not a link *from* the host
  page. Since the backlink is the entire point of the embed, an iframe defeats it.
- **The attribution `<a>` must render into the host page's light DOM**, where crawlers can see it.
- **Depend on the calculation engine** (`config.ts` + `formula.ts`), never on the calculator page's
  presentation. Then site-side UI work can never break a live embed.
- **Semantic versioning with a pinned URL** (`widget.js?v=1`), long cache + cache-bust per version.
  Breaking changes across many third-party sites are expensive.

**Consequence worth stating plainly:** version pinning makes *bad data sticky*. A wrong rate on our
own page is one fix; a wrong rate pinned into third-party embeds cannot be force-updated. That is the
strongest reason the verification gate (§11) precedes any embed work, permanently.

---

## 11. ⚠️ PRE-MERGE GATE — full calculator verification before `v2` → `main`

**Mandatory. Do not merge `v2` into `main` until every box below passes.** The site is live and
trafficked, and accuracy is the product ([[accuracy-over-code-structure]]) — the whole "source of truth"
positioning (§0) collapses if a single number is wrong. v2 changed the **shared** calculator component
(inline region selector, `half` field pairing, toggle layout), so every calculator's inputs must be
re-checked even though the math itself was untouched.

> **Scope correction (2026-07-21).** This gate was originally written as "verify all 60 rates before
> merging v2", which over-scoped it. **v2 changes no rate data** — `config/fees.ts` and
> `config/ai-pricing.ts` are byte-identical to `main`, and the only calculator-config edits are
> `half: true` layout metadata on three configs. Merging v2 therefore *cannot* make rate accuracy
> worse. Split the gate accordingly:
>
> - **Merge blocker = regressions** from the shared `CalculatorIsland` changes. Fully automated below.
> - **Rate accuracy = a standing task**, not a v2 blocker. Rates drift with time, not with merges.
>   This is what the periodic rate watcher owns (§13).

**Automated — `npm run verify` (blocks the merge)**
- [ ] `npm test` — all formula tests green (706 at time of writing).
- [ ] `npm run build` — clean, expected page count.
- [ ] `npm run verify` — `scripts/verify-build.ts`, which asserts:
      - every global chrome element (navbar, `[data-cmdk-open]`, `#cmdk` palette + `#cmdk-data`
        index, theme toggle, skip link, `<main>`) on **every** built page — a component can render
        perfectly on the homepage and be missing elsewhere;
      - every calculator page SSRs its inputs and a result, with no `NaN`;
      - the region selector appears on multi-country calcs, is absent on single-country ones, and
        never appears twice on a multi-currency calc.
      It imports the real registry rather than regex-parsing config source, because configs declare
      countries via spreads (`[...COUNTRIES]`) and shared constants that no regex resolves.
      *(Run 2026-07-21: 71 pages / 60 calculators, zero issues.)*

**Rate accuracy (the critical one)**
- [ ] Re-verify **every** rate in `src/config/fees.ts` (and `config/ai-pricing.ts`) against the
      platform's **official pricing page**; re-stamp `verifiedOn`.
- [ ] Flag/refresh anything older than **90 days**; current dates cluster around 2026-06-10 → 07-14.
- [ ] Confirm each page's rendered "last verified" date matches its config.

**Per-calculator output check (all 60)**
- [ ] For each calculator: load the page and confirm the SSR'd initial result is arithmetically
      correct (hand-check against the worked example).
- [ ] Switch country on country-aware calcs → rate, currency symbol, grouping and worked example all
      update together.
- [ ] Reverse/alternate modes still produce correct figures.

**v2 regression risks specifically introduced by the shared-component work**
- [ ] Calcs **with** a currency input → inline region selector appears and switching it recomputes.
- [ ] Calcs **without** a currency input → the standalone country selector fallback still renders.
- [ ] Calcs with **multiple** currency inputs → only the first hosts the region selector; the rest show
      the static symbol.
- [ ] `half`-paired fields (EMI tenure/unit, Stripe toggles, Etsy shipping/item-cost) behave and submit
      correctly; no field lost.

**Presentation**
- [ ] Light + dark, mobile + desktop spot-check.
- [ ] `web-design-guidelines` skill run on a calculator page, a hub, and the homepage; findings fixed.
