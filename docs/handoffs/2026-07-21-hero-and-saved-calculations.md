# Handoff — session of 2026-07-21: "hero calculator + saved calculations"

| | |
|---|---|
| **Session** | Claude Code session `aad616f6-8d5d-45b1-9e36-34bd6b0c00b7`, 2026-07-21 |
| **Ended because** | Context exhausted — long session, user called the handoff |
| **This session did** | Product Hunt launch support (footer badge, first comment) → homepage hero tabbed live calculators → comparison prominence → local input memory → **per-calculator saved-calculations history** → **hero calculator moved beside the copy** |
| **Left open** | Branch `hero-history` (commits `edbc4d6`, `6970dce`) **pushed + previewing, NOT merged** — awaiting the user's review. See §2. |
| **Handoff written by** | Claude Opus 4.8 |

Earlier in this same session (already merged to `main` and deployed): the full 30-calculator
e-commerce/seller-fee category, the legacy-10 personal-finance rebuild, the merge of
`ecommerce-seller-fee-calculators` into `main` (`24952e2`), the Product Hunt footer badge
(`45a537f`), and the first version of the hero tabs + local input memory (`a3ec71e`).

Read this first, then `CLAUDE.md` (rules), `PLAN.md` (roadmap), `DESIGN.md` (design source of
truth), `PROGRESS.md` (changelog).

---

## 1. State of the site

**Live and in public use.** Product Hunt launch is active (`post_id=1196479`) and getting
positive reviews. Treat production as a real, trafficked site — see the deploy rule in §4.

| | |
|---|---|
| Calculators | **60** (20 payment-fee: 12 single + 8 comparison · 10 personal-finance · 30 e-commerce/seller-fee) |
| Pages built | **71** |
| Tests | **706** (Vitest, all passing) |
| Host | Cloudflare Pages, project **`calcyourfinance`** |
| Prod | `https://calcyourfinance.com` (also `calcyourfinance.pages.dev`) |
| Branch previews | `https://<branch>.calcyourfinance.pages.dev` (auto-built on push) |

Everything above is merged to `main` and deployed.

---

## 2. OPEN RIGHT NOW — branch `hero-history`

Pushed, preview built, **NOT merged. Waiting on the user's review.**

Preview: **https://hero-history.calcyourfinance.pages.dev**

Commit `edbc4d6` — two changes, both from user feedback (Product Hunt reviewers +
the user's own notes):

1. **Per-calculator saved calculations** (`src/components/CalculatorIsland.tsx`)
   - localStorage `cyf-history-<slug>`, last **6** settled calculations, deduped,
     debounced 900ms. Click an entry to restore its inputs **and** country; **Clear** wipes it.
   - Gated behind a new **`showHistory`** prop. `CalculatorShell.astro` passes it;
     the homepage hero widgets deliberately do **not**, so the hero stays clean.
   - Replaces the earlier `cyf-inputs-<slug>` single-value key — restore-on-return now
     reads `history[0]`. (Old key is simply orphaned; harmless.)
   - Client-only, so it is absent from SSR HTML by design and can't be checked with curl —
     verify in a browser by changing an input and waiting ~1s.

2. **Hero calculator moved beside the copy** (`src/pages/index.astro`)
   - Was a full-width band under the hero, which read as "this site only has 5 calculators".
   - Now a 2-col hero at `lg` (`minmax(0,1fr) / minmax(0,26rem)`), short tab labels
     (GST · EMI · SIP · Stripe · Etsy), and "60 more →" / "Browse all 60 calculators" links.
   - The island's own `md:grid-cols-2` is viewport-based, so the hero column forces
     single-column at `lg` via `lg:[&_[data-slug]>div]:grid-cols-1`.

Verified before handoff: 706 tests pass · build clean at 71 pages · preview returns 200 on
homepage and calculator pages · production homepage confirmed **unchanged**.

**Next action:** user reviews the preview → then merge `hero-history` into `main`.

---

## 3. Pending work

**User-side (not code) — the real bottleneck for traffic:**
- GSC **Request Indexing** for top pages, including the new e-commerce + finance pages.
- Backlink playbook in **`docs/SEO-ACTION-PLAN.md`**: Quora → Reddit → Featured/HARO →
  Product Hunt → directories/outreach.
- Diagnosis on record: indexing is **not** a technical problem (robots OK, content SSR'd,
  canonicals self-referential, sitemap valid, Cloudflare bot-block fixed). Root cause is a
  new low-authority domain in a YMYL/finance vertical + an April de-index from URL churn.
  The unlock is **3–5 real editorial backlinks**, not more pages.

**Offered, never delivered — pick up if the user asks:**
- Ready-to-paste **Quora/Reddit answer templates** for the top 5 calculators
  (Stripe, Amazon FBA, EMI, GST, Etsy).

**Explicitly deferred by the user — do NOT build unprompted:**
- The **embed-widget backlink engine** ("Don't build the embed engine yet").

**Untracked file at repo root:** `CalcYourFinance-SEO-Battle-Plan.md` — left uncommitted
on purpose; decide with the user whether it belongs in `docs/`.

---

## 4. Rules learned the hard way (beyond CLAUDE.md)

- **Deploy flow, now that the site is live:** push to a **branch** → check the Cloudflare
  branch preview → **user confirms** → only then merge to `main`. Never push straight to `main`.
- **git push must go through the Bash tool** — it has the **trilumos** GitHub credentials.
  The PowerShell tool runs non-interactively and fails with
  `could not read Username for 'https://github.com'`. Never ask the user which account; it's
  always `trilumos`.
- **Commit messages: use `git commit -F <file>`.** PowerShell here-strings mangle `->` and
  similar characters (`error: unknown switch >`).
- **Accuracy over code structure** — the user's stated priority is that visitors get correct
  numbers. Verify rates against the official pricing page and stamp `verifiedOn`.
- **Long background agents get killed at session boundaries.** Building inline proved more
  reliable than delegating multi-file calculator builds.
- **`sellingPercent` is REQUIRED** in `_shared/marketplaceFee.ts` — omitting it yields `NaN`
  (this bit the Shopify Payments branch; caught only by a test). Fee-free branches must pass
  `sellingPercent: 0`.

---

## 5. Verify before claiming done

```bash
npm test          # 706 tests, must pass
npm run build     # must be clean, 71 pages
```
Plus: browser check in **light + dark**, and run the `web-design-guidelines` skill for UI changes.
Keep `PLAN.md`, `PROGRESS.md`, and `keywords.md` (via `npm run keywords`, never hand-edited) current.
