# CalcYourFinance — Site Revamp & Growth Roadmap (design doc)

**Date:** 2026-07-21 · **Author:** Deep Kakadiya + Claude (Opus 4.8) · **Status:** proposed, awaiting review

**Companion docs:** `CalcYourFinance-SEO-Battle-Plan.md` (per-page SEO/content — do NOT duplicate it here),
`docs/SEO-ACTION-PLAN.md` (backlink playbook), `PLAN.md` (product roadmap), `DESIGN.md` (design system).

This doc is the **north star**. It decomposes an expanded vision — "revamp the UI/UX, make every
page best-in-class so Google indexes us, become the category king, and eventually a SaaS" — into
**four tracks in dependency order**, and specs **Milestone 1 (Foundation)** in enough detail to hand
to `writing-plans`. Later milestones get their own spec→plan cycle when we reach them.

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
2. **Structural template sameness.** Every page is visually and structurally identical — same layout,
   same section order, same components, brand accent aside. Google's near-duplicate clustering and
   "low value-add" evaluation key off *structure and presentation*, not just word count. When the only
   differentiation is prose, a young domain's pages look like a scaled template. This is the biggest
   **code-side** lever, and it's exactly where the UI/UX revamp and the SEO differentiation mandate meet.
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
- **M3 — Link engine** *(user-side + light code)*. The original data study ("what 30 platforms take from
  creators in 2026") as link bait; directory/outreach; **decision point on the embed widget**.
- **M4 — UI/UX polish pass**. Motion, empty/loading/error states, responsive + dark-mode hardening,
  micro-interactions — the "delight" layer, after the structure is right.
- **M5 — SaaS foundation** *(only if traffic warrants)*. Embed widget productized, public API for rates,
  pro features (saved workspaces, alerts on rate changes, CSV/branded exports).

---

## 4. Milestone 1 — Foundation quality (detailed spec)

**Goal:** every page passes the site-level quality gate — visibly differentiated, fast, accessible,
trustworthy — so that when the first backlinks land, indexing follows with no technical excuse left.

**Definition of done:** all four workstreams below complete; `npm test` green; `npm run build` clean at
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
