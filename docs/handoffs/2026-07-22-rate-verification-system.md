# Handoff — 2026-07-22 · Rate-verification system + public transparency page

Everything below is **merged to `main` and deployed**. Head: `23c6f26`.
**72 pages · 716 tests · verify gate clean.**

Next session's work: **the calculator revamp (v3)** — see "What's next".

---

## What shipped this session

### 1. Rate-verification engine (automated tripwire)
- `scripts/rate-verify/` — `manifest.ts` (collects sources), `classify.ts` (+ 10 unit tests),
  `run.ts` (fetch → classify → report), `matrix.ts` (audit checklist generator).
- `npm run verify:rates` → dated report in `rate-verification/<date>.md` + `latest.json`.
- `.github/workflows/rate-verify.yml` — **weekly, Mondays 06:00 UTC** + `workflow_dispatch`.
  Commits the report, opens an issue only on dead links, sends the report to Telegram.
- **Coverage fix:** the manifest originally missed 7 calculators whose sources are top-level
  `*_SOURCE` consts (Razorpay, Paytm, Wise, Payoneer) or live in a config's `sources[]`
  (Shopify, App Store, Printful). Now scans both → **111 → 169 watched sources**.

**The engine is a REMINDER, not verification.** Over plain HTTP it cannot read JS-rendered or
Cloudflare-walled pricing pages, so `unconfirmed` never means "changed". The only reliable
automated alarm is a dead link.

### 2. Manual audit system (the real verification)
- `rate-verification/matrix.md` (`npm run verify:matrix`) — **42 fee calculators / 147 country
  rate-points**, tiered, with columns to record each check.
- `rate-verification/manual-verification-log.md` — the method, credibility tiers, and the
  **false-positive traps** table. Read this before any audit.
- **Cadence** (`src/config/verification-tiers.ts`, single source of truth):
  - **Tier 1 (9)** — stripe, paypal, etsy, amazon-seller, amazon-fba, ebay, shopify, depop,
    tiktok-shop → verified **1st AND 15th**.
  - **Tier 2 (33)** → verified **1st**.
  - **Always full scope**: every country and variant. Tiers change frequency, never depth.
- `.github/workflows/matrix-audit-reminder.yml` — Telegram nudge on the **1st and 15th**, naming
  the calculators due (read from `verification-tiers.ts` at run time).

### 3. Public transparency — `/verification`
The credibility artifact. Renders live from data:
- Stats · **Look up a calculator** / **Report a rate change** buttons
- **Most recent check** + **most recent rate change** pinned side by side (full histories lower,
  so neither drifts down the page as they grow)
- Method · schedule · full-scope guarantee
- **Searchable table**: Last checked · Last changed · Check frequency · Coverage. **Click any row**
  → what changed + that calculator's official sources. **●** marks only rates changed in the
  **last 90 days** (not "ever changed"); those lead, then sorted by last checked. With nothing
  recent the flag is uniformly false and it degrades to a plain last-checked list, no markers.
- **Report form** → Cloudflare Worker → labelled GitHub issue + Telegram ping.
- Data: `src/config/verification-log.ts` (sessions) · `src/config/rate-history.ts` (changes).
- Linked from footer, homepage (button + freshness + long-form), and in the sitemap.

### 4. Telegram control (`telegram/`)
Worker `cyf-rate-verify-bot` @ `https://cyf-rate-verify-bot.trilumos-app.workers.dev`
- `/verify` in Telegram → dispatches `rate-verify.yml`
- `POST /report` → the site's report form → GitHub issue + ping (verified end-to-end, UTF-8 safe)
- Secrets: `BOT_TOKEN`, `CHAT_ID` (5597392397), `GH_PAT`, `WEBHOOK_SECRET`.
- **PAT expires** — rotation is `npx wrangler secret put GH_PAT`, no redeploy. Needs
  `Actions: R/W` + `Issues: R/W`. See `telegram/README.md`.

### 5. Data corrections made
- **Depop Australia 10% → 0%** (effective 2026-07-22) — new `depopFeesAU` (0% seller, 2.6% +
  A$0.30 processing, buyer marketplace fee ≤5% + ≤A$1) + an AU region in the calculator. Logged.
- 3 dead citations repaired (Redbubble ×2, Teachable) → live official pages.
- 12 calculators re-dated `2026-07-22` (genuinely full-scope verified).
- Homepage hero anchored to top (removed the empty band that made GSC screenshots look blank).

---

## ⚠️ Verification state — read before the next audit

**Only 12 calculators are verified as of 2026-07-22**: Depop (all regions), TikTok Shop (both
countries), and the single-rate platforms (Gumroad, Bandcamp, Buy Me a Coffee, Cash App, Facebook,
Paddle, Lemon Squeezy, StockX, Razorpay, Payoneer).

**The multi-country ones still hold June build-time dates** and are due their **first full-scope
pass on 1 Aug 2026**: Stripe (22 countries), PayPal (22), Etsy (19), Shopify (11), App Store (11),
Vinted (10), Square (8), eBay (4), Whatnot (4), Mercari (2), Poshmark (2), Amazon, Walmart.

Today's sweep was headline-level for those — deliberately **not** dated as checked, because a
partial check must never be recorded as a check.

---

## Iron rules established this session (also in memory)

1. **Never trust the scraper — or a single search.** Re-verify every source yourself each cycle,
   including ones marked ✅. Three single-search results were WRONG today (Square "6%", Facebook
   "5%", Cash App "2.6%") and acting on any would have corrupted correct data.
2. **Triangulate**, but a **dated official announcement outranks any number of stale secondary
   guides** (Depop AU: third-party guides still said 10% hours after the official 0% announcement).
3. **Cite the exact page** a number came from — never a generic domain. Same URL into `rate-history`.
4. **Record method + credibility** every cycle in `manual-verification-log.md`.
5. **On "recheck", check today's date** and verify what's due (1st = all, 15th = Tier 1),
   **always full scope**, then log the session with real UTC start/end times.

---

## What's next

### Immediate: 1 Aug 2026 — first full-scope audit
Telegram will nudge. User says "recheck"; work `rate-verification/matrix.md` platform by platform,
triangulating each country. Then update `fees.ts` + `rate-history.ts` + `verification-log.ts` and
bump `feesVerifiedOn` **only** where the check was complete.

### Main line: the calculator revamp (v3)
All 60 calculator pages + the 3 category hubs, in the v2/Geist design language. Branch off `main`,
Cloudflare preview, user confirms, merge. Roadmap:
`docs/superpowers/specs/2026-07-21-site-revamp-roadmap-design.md` (M1-W1 + M2.5 hub depth).

**Do not break these when revamping:**
- Folder name **must equal** the slug (`CalculatorIsland` lazy-loads `/${slug}/config`).
- Rates stay in `src/config/fees.ts` — never inline a rate in a calculator config.
- SSR the initial result (SEO + zero CLS); island hydrates.
- If a calculator's `sources[]` or country list changes, `matrix.md` and the watcher follow
  automatically — but re-run `npm run verify:matrix`.

### Open items
- User plans to make the **repo private**. Nothing on the site claims reports are public. Actions
  minutes become metered (2,000/mo free) — current usage is a couple of minutes/month.
- Deferred: the embed-widget backlink engine (build only on request).
- User-side SEO: GSC request-indexing + backlinks (`docs/SEO-ACTION-PLAN.md`).

## Commands
```
npm run build          # 72 pages
npm test               # 716 tests
npm run verify         # post-build gate (chrome, SSR, region selectors)
npm run verify:rates   # rate watcher → rate-verification/<date>.md
npm run verify:matrix  # regenerate the audit checklist
```
