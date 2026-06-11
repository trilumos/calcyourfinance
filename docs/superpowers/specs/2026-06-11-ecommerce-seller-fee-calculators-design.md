# Design — E-commerce & Seller Fee Calculators (Phase 1B + 1C)

> **Status:** Draft for review — awaiting user approval before writing the implementation plan.
> **Date:** 2026-06-11
> **Owner:** User (product/SEO/fee-accuracy sign-off) + Claude (research + engineering)
> **Category:** `ecommerce-fees`

---

## 1. Goal

Build out the **E-commerce & Seller Fees** category fully. Today it has exactly one page
(Etsy). This effort adds the rest of the marketplace (**1B**) and creator/digital-product/POD
(**1C**) platforms as standalone, statically-generated calculator pages, each following the
existing Etsy template and the per-page Definition of Done in `PLAN.md` §5.

**The overriding requirement (user-stated): correctness.** A visitor who comes to compute a
real number must get the *accurate* number. Code structure is delegated to Claude; fee accuracy
is non-negotiable and is the primary acceptance criterion (see §7).

**Comparisons are out of scope for this spec** (Etsy vs Shopify, Amazon vs eBay, Gumroad vs
Patreon, etc.). They are a natural follow-on once the singles + shared fee data exist, and will
get their own spec. See §10.

---

## 2. Workflow & phase gates (matches the user's chosen "research first, then go")

```
Phase 0  Keyword research across the full 1B+1C universe
         → prioritized table (volume / competition / intent / RPM / archetype / country-aware)
         → ████ HARD GO-GATE: present to user, WAIT for approval before any build ████

Phase 1  Representative first batch — exercises BOTH formula types
         (≥1 shared-formula flat platform + 1 bespoke, e.g. eBay)
         → user reviews math + copy + design → approves the pattern

Phase 2…N  Scale by sub-group in ~4/week batches, each batch reviewed:
           2 = big marketplaces (Amazon, eBay, Shopify)   [bespoke + country-aware]
           3 = resale/marketplace flat-fee (Poshmark, Mercari, Depop, Whatnot, Reverb, StockX…)
           4 = creator/membership (Gumroad, Patreon, Ko-fi, BMaC, Substack, Bandcamp…)
           5 = POD profit (Printful, Printify, Redbubble, Spring)
           6 = course/freelance (Teachable, Podia, Kajabi, Fiverr, Upwork…) + long tail
           (Exact batch composition is finalized by Phase 0's priority ranking.)

Follow-on  E-commerce comparison calculators — SEPARATE spec (§10).
```

**Phase 0 is a true stop.** Nothing is built until the user says go.

---

## 3. Candidate universe (~32 platforms)

Final list + slugs + priority come from Phase 0 research; this is the seed and the fee-archetype
mapping that justifies the architecture. A platform may warrant **more than one page** where two
distinct high-volume intents exist (e.g. Amazon "FBA calculator" vs "seller/referral fees";
Shopify "what will Shopify cost" vs "payment processing fees") — Phase 0 decides. Country coverage
for the country-aware platforms is **broad by directive** — see §5.

### 1B — Marketplaces & seller platforms
| Platform | Fee archetype | Country-aware | Formula |
|---|---|---|---|
| Amazon (seller) | referral % by category + FBA size/weight tiers + monthly + storage | **Yes** | bespoke |
| eBay | final-value % by category + per-order fixed + intl fee + optional store/ad | **Yes** | bespoke |
| Shopify | plan monthly tier + per-plan processing + non-Shopify-Payments surcharge | **Yes** | bespoke |
| Walmart Marketplace | referral % by category | US-centric | shared + category table |
| Mercari | flat selling % + processing (+ fixed) | US/JP | shared |
| Poshmark | flat fee under threshold, else % | US (+CA/AU) | shared (flat-under-threshold) |
| Depop | selling % + processing **(verify: US sellers fee-free)** | US/UK | shared |
| Vinted | **seller-free; buyer-protection fee** (special framing) | EU/UK/US | shared (buyer-fee mode) |
| Whatnot | commission % + processing | US | shared |
| StockX | seller-level % + payment % | global | shared (level select) |
| Reverb | selling % + processing | US | shared |
| Bonanza | tiered final-offer % | US | shared |
| TikTok Shop | commission % + processing | US/UK | shared |
| Facebook/Instagram Shop | selling % per shipment, floor for small orders | US | shared (flat-under-threshold) |
| App Store | 30% / 15% (Small Business Program) | global | shared (tier toggle) |
| Google Play | 30% / 15% | global | shared (tier toggle) |
| AliExpress/Temu seller | commission % | global | shared (lower priority) |

### 1C — Creator / digital-product / POD
| Platform | Fee archetype | Country-aware | Formula |
|---|---|---|---|
| Gumroad | flat % **(verify current flat 10%)** | flat | shared |
| Patreon | plan tier % + processing | flat | shared (plan select) |
| Ko-fi | 0% platform + optional processing | flat | shared |
| Buy Me a Coffee | platform % + processing | flat | shared |
| Substack | platform % + Stripe processing | flat | shared |
| Bandcamp | revenue-share % (digital/merch, volume step) | flat | shared (tier) |
| Teachable | plan tier + per-txn (Basic) | flat | shared (plan select) |
| Podia | plan tier (% on free plan) | flat | shared (plan select) |
| Kajabi | monthly plan, 0% txn (processing only) | flat | shared (plan select) |
| Sellfy | monthly plan, 0% txn | flat | shared |
| Printful | POD: retail − base cost − shipping = profit | base in USD/EUR | bespoke (POD margin) |
| Printify | POD margin | base in USD | bespoke (POD margin) |
| Redbubble | POD: artist markup on base price | global | bespoke (POD margin) |
| Spring (Teespring) | POD margin | global | bespoke (POD margin) |
| Fiverr | flat seller service % (20%) | flat | shared |
| Upwork | flat freelancer % **(verify flat 10%, not old sliding)** | flat | shared |

**Tally:** ~21 platforms fit one **shared** formula; ~7 are **bespoke** (3 complex marketplaces +
4 POD). This split is exactly why Approach 1 (below) was chosen.

---

## 4. Architecture (Approach 1 — tiered by complexity)

No change to the page template, routing, SEO, or island system — they already generate every page
from `CalculatorConfig`. We extend three things and add formulas.

### 4.1 Shared formula — `src/calculators/_shared/marketplaceFee.ts`
A single PURE, fully-tested function powering all flat-fee platforms, driven entirely by config:

```ts
interface MarketplaceFeeInput {
  itemPrice: number;
  shipping?: number;            // included in fee base when the platform charges on it
  itemCost?: number;            // optional → profit
  feeOnShipping?: boolean;      // does the selling % apply to shipping?
  sellingPercent: number;       // platform commission %
  sellingFixed?: number;        // per-order fixed
  feeCap?: number;              // per-order cap (e.g. caps)
  feeMin?: number;              // minimum fee
  flatUnderThreshold?: { threshold: number; fee: number }; // Poshmark/FB-style
  processingPercent?: number;   // payment processing %
  processingFixed?: number;
}
// → { revenue, sellingFee, processingFee, totalFees, payout, profit, takeRatePercent }
```

This covers: simple %+fixed (Reverb, Whatnot, Substack…), caps, minimums, flat-under-threshold
(Poshmark, FB/IG Shop), processing-on-top, and profit. Platforms with a **plan/level select**
(Patreon, StockX, App Store 15/30, Teachable…) expose the choice as a config `select`/`toggle`
input that picks which rate is passed in — the shared formula stays unchanged.

### 4.2 Bespoke formulas — one `formula.ts` each (like Etsy)
- `amazon-*`: referral-by-category + FBA size/weight tier table + optional monthly + storage.
- `ebay-*`: category final-value % + per-order fixed + international fee + optional store/ad %.
- `shopify-*`: plan monthly + per-plan processing (online/in-person) + non-Shopify-Payments %.
- POD (`printful`, `printify`, `redbubble`, `spring`): `retail − base cost − shipping − fees = profit`,
  with margin/markup framing per platform.

### 4.3 Fee data — `src/config/fees.ts`
Add typed e-commerce sections following the existing pattern (each entry carries `source` +
`verifiedOn`):
- **Flat platforms:** a compact record per platform (percent, fixed, cap, min, processing, notes).
- **Category platforms (Amazon/eBay/Walmart):** a category→rate table.
- **Country-aware (Amazon/eBay/Shopify):** keyed `[platform][country]` like Stripe/Etsy.
- **POD:** base-cost references are illustrative defaults only; the user enters their own base/retail
  (we never hardcode a full product catalogue).

### 4.4 Rate cards — `src/lib/rateCards.ts`
Add a `*RateCards()` builder for each **country-aware** platform (Amazon/eBay/Shopify), mirroring
`etsyRateCards`/`stripeRateCards`, so a fee edit updates the on-page country grid automatically.
Flat platforms don't need a country grid.

### 4.5 Brand accents — `src/config/platforms.ts`
Add one entry per platform (id, name, tuned `color` + `colorDark`). **Recognition only — no logos,
no site cloning** (trademark / AdSense safety). Reuse the existing `.calc-accent` mechanism.

### 4.6 Registry — `src/calculators/index.ts`
Register each new config. Folder name **MUST equal slug** (hard rule — the island lazy-loads
`/${slug}/config`; a mismatch silently breaks live recompute).

---

## 5. Country handling — maximize coverage (match the payment-fee calculators)

**Directive (user):** match or exceed the country breadth of the payment-fee calculators — Etsy
ships **19** countries, Stripe **~22**. Do **not** ship a token 5–6 majors. For every country-aware
platform, include **all** markets where the platform publishes a distinct rate **and** there is real
search demand — *including tier-2 markets that have high search volume even if they aren't "major"
economies.* When in doubt between including a market or not, include it.

- **Country-aware (Amazon, eBay, Shopify):** broad `country` selector via the `COUNTRIES` registry,
  targeting **~19–25 markets per platform** (tier-1 + every high-search tier-2 the platform serves).
  Phase 0 sets each platform's exact list, erring toward inclusion.
- **The registry will likely need extending.** If Phase 0 finds a high-search market not yet in the
  `CountryCode` union (strong candidates: **PL, TR, ID, KR, SA**, alongside the existing AE/PH/ZA),
  add it to `lib/countries.ts` (`CountryCode`, `COUNTRIES`, `COUNTRY_SEARCH_NAME`) — that file is
  explicitly designed to grow ("expand this list the same way we expand calculators"). Don't drop a
  high-volume country just because it's missing today; add the country.
- **Flat / single-market platforms:** the fee is identical everywhere the platform operates, so we
  do **not** add a rate selector (one would falsely imply per-country rates — an accuracy issue). We
  still capture international long-tail demand (`"<platform> fees uk"`, `"… india"`, etc.) in the
  page's `keywords` cluster wherever research shows volume. If a flat platform bills in **local
  currency** across many countries, a **currency-only** selector is allowed (switches formatting,
  not rates).
- `build-keywords.ts` auto-adds a `"<keyword> for <country>"` variant for **every** country in a
  calc's `countries.supported`. So a broad selector also broadens country-keyword targeting for
  free — another reason to be generous with the supported list.

---

## 6. Page pattern & per-page Definition of Done

Identical to Etsy. Each calculator ships with:
- `config.ts` (metadata, keyword cluster, `inputs`, `compute` adapter, `howItWorks`,
  ≥600-word `seoContent`, `rateCards` for country-aware, `workedExample`, ≥5 FAQs, `related`,
  `sources`, `feesVerifiedOn`, `lastUpdated`), `formula.ts` (pure) or shared-formula import,
  `formula.test.ts`, co-located `keywords.md`.
- Registered in `index.ts`; brand accent added; `related[]` cross-links populated; appears on the
  `ecommerce-fees` hub.
- SSR'd initial result; JSON-LD (`WebApplication` + `FAQPage` + `BreadcrumbList`); per-page
  title/meta/canonical/OG.
- `npm test` green; `npm run build` clean; `web-design-guidelines` pass (light + dark).

---

## 7. Accuracy assurance (primary acceptance criterion)

Because correctness is the stated top priority, every page must clear this bar before it's "done":

1. **Fees verified from the official source during research** — never from memory. Web-search the
   platform's current official fee page, store the numbers in `fees.ts` with the source URL + a
   `verifiedOn` date, and render "Fees last verified: <date>".
2. **Tests assert the platform's own published worked example.** Where a platform publishes an
   example ("on a $100 sale we charge…"), that exact case becomes a test. Plus boundary cases:
   caps, minimums, flat-under-threshold crossover, category-rate edges, FBA tier breakpoints,
   zero/empty input.
3. **Cross-check against the platform's official calculator where one exists** (Amazon has an
   official FBA revenue calculator; eBay publishes fee illustrations) during build — our output
   should match within rounding.
4. **Money math uses the existing `roundMoney`/`roundTo` helpers** (no float drift).
5. **Known fee-change traps to re-verify** (training data is likely stale on these):
   Gumroad (moved to a flat fee), Upwork (moved to flat 10% from the old sliding 20/10/5),
   Depop (US sellers reportedly fee-free; buyers pay), Vinted (no seller fees — buyer-protection
   model), Mercari (fee structure changed), Etsy regulatory fees (already dated), App/Play Store
   (15% Small Business tiers). Each gets explicit verification and, where the model differs from a
   plain "seller fee," honest on-page framing.

---

## 8. Keyword research (Phase 0 deliverable)

Per `PLAN.md` §3-A and the user's standing "research first" preference:
- For each candidate: inspect the live SERP, **confirm intent is *tool* not *article***, harvest
  long-tail + People-Also-Ask, estimate competition (E/M/H), note an RPM signal.
- Deliverable = one **prioritized table**: `platform | primary keyword | est. volume | competition |
  intent | RPM signal | proposed slug(s) | fee archetype | country set (markets to include) |
  suggested batch`. For country-aware platforms, the "country set" column lists the **full**
  generous market list per §5 (and flags any new `CountryCode`s to add to the registry).
- Flag any platform where intent is informational (→ deprioritize) or where two pages are warranted.
- Clusters later live in each `config.ts` `keywords` field; root `keywords.md` is regenerated via
  `npm run keywords` (never hand-edited).
- **Then stop and wait for the user's go.**

---

## 9. Risks & mitigations
- **Stale fee knowledge** → §7.1/§7.5: official-source verification is mandatory, dated on-page.
- **Amazon FBA complexity** (size/weight tiers, storage) → bespoke formula + cross-check vs Amazon's
  official calculator; scope the on-page tool to the common case and link out for edge tiers.
- **Models that aren't a simple "seller fee"** (Vinted buyer protection, Depop-US free, FB local
  free, POD margin) → explicit framing so the page is *honest*, not misleading; these are accuracy
  issues, not just copy.
- **Trademark / AdSense** → no logos, no site cloning; brand colour + name only.
- **Competition on head terms** (Amazon FBA, eBay) → win on country coverage, freshness, clean UX,
  and honest breakdowns; lead batches with lower-competition long-tail where research shows it.
- **Scope creep** → comparisons explicitly deferred (§10); batches are reviewed gates.

---

## 10. Out of scope (this spec)
- **E-commerce comparison calculators** (`kind:"comparison"`): Etsy vs Shopify, Amazon vs eBay,
  Shopify vs eBay, Gumroad vs Patreon, Lemon Squeezy vs Gumroad. Queued as a follow-on spec once
  the singles + shared fee data land; the existing comparison engine will already support them.
- Phase 2/3/4 calculators (freelance/business, personal finance, head terms).
- Building a full POD product catalogue (user enters their own base/retail).

---

## 11. Definition of done (whole effort)
- Phase 0 research table delivered and approved (go-gate passed).
- Every approved platform shipped as a page meeting §6 + §7.
- All formulas unit-tested (`npm test` green); `npm run build` clean.
- `ecommerce-fees` hub lists every new calculator; no orphans (≥3 inbound links each).
- `keywords.md` regenerated; `PROGRESS.md` updated per batch.
