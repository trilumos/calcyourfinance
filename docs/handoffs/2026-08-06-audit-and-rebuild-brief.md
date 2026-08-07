# Handoff — 2026-08-06 · August audit done + brief for the calculator rebuild

Everything below is **merged to `main` and deployed**. Head after this session: see `git log`.
**72 pages · 716 tests · verify gate clean.**

The next session is the big one: **rebuilding the calculator pages** so they get indexed and rank.
This doc hands off (A) the audit state and (B) the strategic brief for that rebuild.

---

## A. Rate audit — state as of 2026-08-06

- **August full audit: DONE.** All 42 fee calculators verified against official pages. **Zero rate
  changes** since 22 Jul. 41/42 now read `verifiedOn: 2026-08-06`; **Wise** stays 2026-06-11 (its
  fees are live-quoted per corridor — a snapshot can't be honestly dated "today").
- **Fixes this cycle:** SIP dead link (AMFI 404 the weekly watcher caught on Aug 3); 5 reachability
  swaps to main-domain primaries (Reverb, Ko-fi, Upwork, Fiverr, Printful); manifest now **excludes
  the 10 personal-finance calcs** from the watcher (static formulas, no rates).
- **No real user rate reports** — only 2 test issues (both mine, closed).
- **Session-start audit protocol is now an iron rule** in `CLAUDE.md` (top) + memory
  `rate-audit-schedule`: every session, check the date, pull watcher + `rate-report` issues FIRST,
  do any missed audit before other work, monthly full audit never skipped.

### Known audit follow-ups (not blocking)
- **4 calcs still on Zendesk-only citations** (no reachable main-domain fee page found): Whatnot,
  Substack, Teespring, Redbubble. Fix if/when a main-domain page stating the fee is confirmed.
- **Watcher can't auto-open issues** — the `rate-verify` label doesn't exist in the repo, so
  `gh issue create --label rate-verify` silently fails. Create the label (or have the workflow
  create it) so dead-link findings actually notify. It DID commit the report (that's how Aug-3's
  AMFI 404 was found on pull), just no issue.
- **Wise** is the one genuinely-drifting calc — rethink in the rebuild (label as live estimate, or
  fetch live).
- Minor, low-traffic: Patreon legacy "Premium" shows 11% in one source vs our 12%; Podia plan
  prices now $49/$99/$179 (our transaction % is right; prices are informational); Kajabi had a
  Jan-2026 pricing update (processing fee — spot-check next cycle).

---

## B. THE REAL PROBLEM — indexing, and the rebuild brief

### The numbers (why the rebuild exists)
- **GSC: only the homepage is indexed. ~24 impressions / 28 days.** The other 71 pages are crawled-
  but-not-indexed → they can get zero organic traffic. Organic search — the scalable channel — is
  effectively OFF.
- **GA4: 183 users / 30 days (+144%).** NOT a contradiction with GSC: GA counts ALL traffic
  (direct, referral, Product Hunt, the owner's own visits); GSC impressions are Google-organic only.
  183 GA users + 24 search impressions = ~all traffic is non-organic, and organic is dead because
  pages aren't indexed. **The product works; distribution is the bottleneck.**

### The rebuild vision (user's words)
Each calculator "revamped and built into something genuinely good, non-templated, top-rankable, and
useful. **Each calculator becomes a cluster.**" i.e. a page Google indexes because it offers real
information gain, not a template reskin — with supporting content that makes it a topical cluster
hub, so the whole thing earns indexing + ranking.

### Why pages aren't indexed (diagnosed earlier, still the working theory)
Young YMYL-ish domain with **no backlinks** (trust gate) + **structural template sameness** across
60 calculators ("limited information gain" — Google sees 60 near-identical shells and indexes one).
The rebuild must attack the sameness; the user must attack the backlinks (off-site).

### What "cluster, non-templated, top-rankable" should mean per page (to brainstorm next session)
- **Genuine information gain**: real per-platform specifics, worked examples, edge cases, the "what
  this can't see" honesty — not the same boilerplate with a name swapped.
- **Distinct structure/among pages**: vary intros, FAQs, comparisons, supporting sections by
  platform so no two pages are structurally identical.
- **Cluster shape**: each calculator + its supporting long-tail content (how-tos, comparisons,
  country variants, "fees on $X") interlinked so it reads as a topic hub, not an orphan tool.
- Keep the config-driven engine + the verified rates + `/verification` trust layer (the moat) —
  the rebuild is about the CONTENT/structure/indexability around the tool, not the math.
- **START WITH BRAINSTORMING** (`superpowers:brainstorming`) before building — this is a big new
  direction (per CLAUDE.md + research-then-confirm iron rule). Do detailed keyword research first
  (memory `phase-b-keyword-research`). Confirm the per-page template/cluster model with the user,
  build ONE exemplar calculator end-to-end, get sign-off, then roll out.

### Analytics access (user asked for this — build it so I can see performance stat-by-stat)
The user wants me to pull GA4 + GSC data directly, not paste it. Both have free APIs; the blocker is
credentials, which only the user can set up. Proposed build (fits the existing Worker/Actions/Telegram
stack):
1. **Google Cloud service account** → enable **Search Console API** + **Analytics Data API (GA4)**.
2. Grant the service account access to the GSC property + the GA4 property; download the JSON key.
3. Store the key as a secret; add a `npm run stats` script (and/or a weekly Action → Telegram) that
   pulls: GSC impressions/clicks/queries/indexed-page count; GA4 users/sources/top pages.
4. Then I can report performance without the user pasting screenshots.
This is a next-session setup task (like the Telegram/PAT setup was).

---

## Guardrails for the rebuild (don't break these)
- Folder name === slug (`CalculatorIsland` lazy-loads `/${slug}/config`).
- Rates ONLY in `src/config/fees.ts` / `ai-pricing.ts` — never inline in a calc config.
- SSR the initial result (SEO + zero CLS); island hydrates.
- Geist design system (DESIGN.md). Tailwind v4. Run `web-design-guidelines` on UI changes.
- After any calc/source/country change: `npm run verify:matrix`, `npm run build`, `npm run verify`,
  `npm test` (716 pass). Keep `/verification` + `rate-history.ts` honest.

## Commands
```
npm run build          # 72 pages
npm test               # 716 tests
npm run verify         # post-build gate
npm run verify:rates   # rate watcher → rate-verification/<date>.md
npm run verify:matrix  # regenerate audit checklist
```

## Next session, in order
1. Run the **session-start audit protocol** (CLAUDE.md) — 15 Aug is a Tier-1 anchor; if it's on/after
   the 15th, do Tier-1 first. Pull watcher + `rate-report` issues.
2. **Brainstorm the calculator-cluster rebuild** with the user; keyword research; ONE exemplar first.
3. Optionally: set up **analytics access** (service account) so performance is visible.
