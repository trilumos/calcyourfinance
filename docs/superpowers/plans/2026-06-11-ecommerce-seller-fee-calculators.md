# E-commerce & Seller Fee Calculators — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build out the full E-commerce & Seller Fees category (~32 marketplace + creator/POD platforms) as statically-generated, accurate, country-broad calculator pages, on the existing Etsy template.

**Architecture:** One shared, fully-tested pure formula (`computeMarketplaceFee`) powers the ~21 flat-fee platforms; bespoke pure formulas handle the 7 complex ones (Amazon FBA, eBay, Shopify, + 4 POD margin calcs). Fee data lives country-keyed in `src/config/fees.ts`; each page is generated from a `CalculatorConfig`. No template/routing/SEO/island changes.

**Tech Stack:** Astro + Preact islands, TypeScript, Tailwind v4, Vitest (TDD). Spec: [docs/superpowers/specs/2026-06-11-ecommerce-seller-fee-calculators-design.md](../specs/2026-06-11-ecommerce-seller-fee-calculators-design.md).

**Accuracy is the acceptance criterion (spec §7):** fees are web-verified from the official source and dated; every formula test asserts the platform's *own* published worked example plus boundaries (caps/floors/thresholds/tiers); Amazon/eBay outputs are cross-checked against their official calculators.

---

## File Structure

**Created (infrastructure, this plan):**
- `src/calculators/_shared/marketplaceFee.ts` — the shared pure formula (one responsibility: flat-marketplace fee math). Not a calculator folder (no `config.ts`), so the island glob ignores it.
- `src/calculators/_shared/marketplaceFee.test.ts` — its Vitest suite.

**Created per platform (rollout recipe, §Rollout):**
- `src/calculators/<slug>/config.ts` — metadata + `compute()` adapter. **Folder name MUST equal `slug`.**
- `src/calculators/<slug>/formula.ts` — only for bespoke platforms; shared-formula platforms import `computeMarketplaceFee`.
- `src/calculators/<slug>/formula.test.ts` — tests (shared platforms test their config values + published example through the shared fn; bespoke test their own fn).
- `src/calculators/<slug>/keywords.md` — co-located keyword cluster (human reference).

**Modified per platform:**
- `src/config/fees.ts` — add the platform's fee record/section (source + verifiedOn).
- `src/config/platforms.ts` — add the brand accent entry.
- `src/lib/rateCards.ts` — add a `*RateCards()` builder (country-aware platforms only).
- `src/calculators/index.ts` — import + register the config.
- `src/lib/countries.ts` — only if a high-search market is missing from `CountryCode` (spec §5).
- `PROGRESS.md` — changelog per batch. Root `keywords.md` is regenerated via `npm run keywords` (never hand-edited).

---

## Phase 0 — Keyword research & GO-GATE (blocks all building)

### Task 0: Research the full 1B+1C universe, then stop

**Files:** none (research deliverable + user gate).

- [ ] **Step 1: Research each candidate platform** (spec §3 list). For each: inspect the live SERP, confirm intent is **tool not article**, harvest long-tail + People-Also-Ask, estimate competition (E/M/H), note an RPM signal, and decide the **full** country set per spec §5 (broad — tier-1 + every high-search tier-2; flag any new `CountryCode` to add).

- [ ] **Step 2: Produce the prioritized table.** Columns: `platform | primary keyword | est. volume | competition | intent | RPM signal | proposed slug(s) | fee archetype (shared / bespoke) | country set (markets) | suggested batch`. Flag platforms warranting >1 page (e.g. Amazon FBA vs referral; Shopify cost vs payment fees) and any informational-intent platforms to deprioritize.

- [ ] **Step 3: HARD GATE — present the table to the user and STOP.** Do not build any calculator until the user approves the list, slugs, country sets, and batch order. (Phase 1 below — the shared engine — is research-independent and MAY be built in parallel with research, but no calculator pages ship before the gate.)

---

## Phase 1 — Shared fee engine (research-independent; build now)

### Task 1: `computeMarketplaceFee` — the shared flat-marketplace formula

**Files:**
- Create: `src/calculators/_shared/marketplaceFee.ts`
- Test: `src/calculators/_shared/marketplaceFee.test.ts`

**Semantics (locked):**
- `revenue = itemPrice + shipping` (shipping default 0).
- `feeBase = feeOnShipping ? revenue : itemPrice` (default `feeOnShipping = true` — most marketplaces charge their % on item + shipping).
- Selling fee: if `flatUnderThreshold` is set and `feeBase < threshold` → flat `fee` (no min/cap applied). Otherwise `feeBase × sellingPercent% + sellingFixed`, then apply `feeMin` (floor), then `feeCap` (ceiling).
- `processingFee = revenue × processingPercent% + processingFixed` (0 when neither set).
- `totalFees = sellingFee + processingFee`; `payout = revenue − totalFees`; `profit = payout − itemCost`; `takeRatePercent = totalFees / revenue × 100`.
- `revenue ≤ 0` → all zeros. All money via `roundMoney`, rate via `roundTo(_, 2)`.

- [ ] **Step 1: Write the failing test suite**

```ts
import { describe, it, expect } from "vitest";
import { computeMarketplaceFee } from "./marketplaceFee";

describe("computeMarketplaceFee", () => {
  it("simple % + processing (Reverb-style): $100 → 5% + 2.7%+$0.49", () => {
    const r = computeMarketplaceFee({
      itemPrice: 100, sellingPercent: 5, processingPercent: 2.7, processingFixed: 0.49,
    });
    expect(r.revenue).toBe(100);
    expect(r.sellingFee).toBe(5);
    expect(r.processingFee).toBe(3.19); // 100*2.7% + 0.49
    expect(r.totalFees).toBe(8.19);
    expect(r.payout).toBe(91.81);
    expect(r.takeRatePercent).toBe(8.19);
  });

  it("selling fee applies to item + shipping by default", () => {
    const r = computeMarketplaceFee({
      itemPrice: 25, shipping: 5, sellingPercent: 10, processingPercent: 2.9, processingFixed: 0.3,
    });
    expect(r.revenue).toBe(30);
    expect(r.sellingFee).toBe(3); // 10% of 30
    expect(r.processingFee).toBe(1.17); // 30*2.9% + 0.30
    expect(r.payout).toBe(25.83);
  });

  it("feeOnShipping:false charges the % on the item only", () => {
    const r = computeMarketplaceFee({
      itemPrice: 25, shipping: 5, sellingPercent: 10, feeOnShipping: false,
    });
    expect(r.sellingFee).toBe(2.5); // 10% of 25, not 30
    expect(r.payout).toBe(27.5);
  });

  it("flat-under-threshold fires below the threshold (Poshmark-style)", () => {
    const r = computeMarketplaceFee({
      itemPrice: 10, sellingPercent: 20, flatUnderThreshold: { threshold: 15, fee: 2.95 },
    });
    expect(r.sellingFee).toBe(2.95);
    expect(r.payout).toBe(7.05);
  });

  it("flat-under-threshold does NOT fire at/above the threshold", () => {
    const r = computeMarketplaceFee({
      itemPrice: 15, sellingPercent: 20, flatUnderThreshold: { threshold: 15, fee: 2.95 },
    });
    expect(r.sellingFee).toBe(3); // 20% of 15
    expect(r.payout).toBe(12);
  });

  it("feeCap limits the selling fee", () => {
    const r = computeMarketplaceFee({ itemPrice: 1000, sellingPercent: 10, feeCap: 50 });
    expect(r.sellingFee).toBe(50); // 100 capped at 50
    expect(r.payout).toBe(950);
  });

  it("feeMin floors the selling fee", () => {
    const r = computeMarketplaceFee({ itemPrice: 5, sellingPercent: 10, feeMin: 1 });
    expect(r.sellingFee).toBe(1); // 0.50 floored to 1
    expect(r.payout).toBe(4);
  });

  it("itemCost yields profit", () => {
    const r = computeMarketplaceFee({
      itemPrice: 25, shipping: 5, sellingPercent: 10, processingPercent: 2.9, processingFixed: 0.3, itemCost: 8,
    });
    expect(r.payout).toBe(25.83);
    expect(r.profit).toBe(17.83); // 25.83 − 8
  });

  it("zero revenue returns zeros", () => {
    const r = computeMarketplaceFee({ itemPrice: 0, sellingPercent: 10 });
    expect(r.payout).toBe(0);
    expect(r.totalFees).toBe(0);
    expect(r.takeRatePercent).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/calculators/_shared/marketplaceFee.test.ts`
Expected: FAIL — `Failed to resolve import "./marketplaceFee"` / `computeMarketplaceFee is not a function`.

- [ ] **Step 3: Implement the formula**

```ts
/**
 * Shared marketplace/seller fee math — PURE, fully unit-tested. Powers every
 * flat-fee platform (selling % ± fixed, optional cap/floor, optional
 * flat-fee-under-threshold, optional payment processing, optional profit).
 * Platforms with a plan/level choice pass the chosen rate in via config.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface MarketplaceFeeInput {
  itemPrice: number;
  shipping?: number;
  itemCost?: number;
  /** Does the selling % apply to shipping too? Most marketplaces: yes (default). */
  feeOnShipping?: boolean;
  sellingPercent: number;
  sellingFixed?: number;
  /** Per-order ceiling on the selling fee. */
  feeCap?: number;
  /** Per-order floor on the selling fee (percentage path only). */
  feeMin?: number;
  /** Flat fee when feeBase is strictly below `threshold` (Poshmark/FB-style). */
  flatUnderThreshold?: { threshold: number; fee: number };
  processingPercent?: number;
  processingFixed?: number;
}

export interface MarketplaceFeeBreakdown {
  revenue: number;
  sellingFee: number;
  processingFee: number;
  totalFees: number;
  payout: number;
  profit: number;
  takeRatePercent: number;
}

export function computeMarketplaceFee(input: MarketplaceFeeInput): MarketplaceFeeBreakdown {
  const {
    itemPrice,
    shipping = 0,
    itemCost = 0,
    feeOnShipping = true,
    sellingPercent,
    sellingFixed = 0,
    feeCap,
    feeMin,
    flatUnderThreshold,
    processingPercent = 0,
    processingFixed = 0,
  } = input;

  const price = Number.isFinite(itemPrice) ? itemPrice : 0;
  const ship = Number.isFinite(shipping) ? shipping : 0;
  const revenue = price + ship;

  const zero: MarketplaceFeeBreakdown = {
    revenue: 0, sellingFee: 0, processingFee: 0, totalFees: 0, payout: 0, profit: 0, takeRatePercent: 0,
  };
  if (revenue <= 0) return zero;

  const feeBase = feeOnShipping ? revenue : price;

  let sellingFee: number;
  if (flatUnderThreshold && feeBase < flatUnderThreshold.threshold) {
    sellingFee = flatUnderThreshold.fee;
  } else {
    sellingFee = feeBase * (sellingPercent / 100) + sellingFixed;
    if (feeMin != null) sellingFee = Math.max(sellingFee, feeMin);
    if (feeCap != null) sellingFee = Math.min(sellingFee, feeCap);
  }

  const processingFee = revenue * (processingPercent / 100) + processingFixed;
  const totalFees = sellingFee + processingFee;
  const payout = revenue - totalFees;
  const profit = payout - itemCost;

  return {
    revenue: roundMoney(revenue),
    sellingFee: roundMoney(sellingFee),
    processingFee: roundMoney(processingFee),
    totalFees: roundMoney(totalFees),
    payout: roundMoney(payout),
    profit: roundMoney(profit),
    takeRatePercent: roundTo((totalFees / revenue) * 100, 2),
  };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/calculators/_shared/marketplaceFee.test.ts`
Expected: PASS (9 passing).

- [ ] **Step 5: Run the full suite + build to confirm nothing broke**

Run: `npm test` then `npm run build`
Expected: all green; build clean.

- [ ] **Step 6: Commit**

```bash
git add src/calculators/_shared/marketplaceFee.ts src/calculators/_shared/marketplaceFee.test.ts
git commit -m "feat: shared marketplaceFee formula for e-commerce seller-fee calcs"
```

---

## Rollout — the per-platform recipe (apply after the Phase 0 gate)

Each platform from the approved table is built by applying this recipe. It is the per-platform task definition; a subagent executes one platform end-to-end per pass. Batches (below) group platforms; review between platforms.

### Recipe R: build one platform `<slug>`

**Files:** create `src/calculators/<slug>/{config.ts,formula.test.ts,keywords.md}` (+ `formula.ts` if bespoke); modify `src/config/fees.ts`, `src/config/platforms.ts`, `src/calculators/index.ts` (+ `src/lib/rateCards.ts` and `src/lib/countries.ts` if country-aware).

- [ ] **R1: Verify fees from the official source.** Web-search the platform's current official fee page. Record every rate (selling %, fixed, caps/floors/thresholds, processing, per-country rates for country-aware platforms) with the source URL and today's date. **Do not use remembered numbers.** Re-check the spec §7.5 traps where relevant (Gumroad, Upwork, Depop-US, Vinted, Mercari, App/Play 15% tier).

- [ ] **R2: Add the fee data to `src/config/fees.ts`** as a typed record/section ending in `source` + `verifiedOn: "<today>"`, following the existing `stripeFees`/`squareFees` pattern (country-keyed for country-aware platforms).

- [ ] **R3: Write `formula.test.ts` (failing).**
  - Shared-formula platforms: assert the platform's **published worked example** (from R1) by calling `computeMarketplaceFee` with the platform's config values, plus any boundary case the platform has (cap/floor/threshold). Example shape:
    ```ts
    import { describe, it, expect } from "vitest";
    import { computeMarketplaceFee } from "../_shared/marketplaceFee";
    // values come from R1's verified fee record
    it("<platform>: <published example>", () => {
      const r = computeMarketplaceFee({ itemPrice: /*…*/, sellingPercent: /*…*/, /*…*/ });
      expect(r.totalFees).toBe(/* platform's published fee */);
      expect(r.payout).toBe(/* platform's published payout */);
    });
    ```
  - Bespoke platforms (Amazon/eBay/Shopify/POD): test the platform's own `formula.ts` against its published example and boundaries (FBA size/weight tiers, eBay category rates, Shopify plan/processing combos, POD `retail − base − shipping`).

- [ ] **R4: Run the test, verify it fails.** Run: `npx vitest run src/calculators/<slug>/formula.test.ts` → FAIL.

- [ ] **R5: Implement.** Shared platforms: no new formula — the config's `compute()` calls `computeMarketplaceFee`. Bespoke platforms: write the pure `formula.ts`.

- [ ] **R6: Run the test, verify it passes.** Same command → PASS. For Amazon/eBay, additionally cross-check one case against the platform's official calculator (spec §7.3) and note it in the test comment.

- [ ] **R7: Write `config.ts`** following the Square reference ([src/calculators/square-fee-calculator/config.ts](../../../src/calculators/square-fee-calculator/config.ts)): `slug` (== folder name), `kind:"single"`, `category:"ecommerce-fees"`, `platform`, title/metaDescription/h1/intro, `keywords` (from the approved Phase 0 cluster), `countries` (broad set, country-aware only), `inputs`, `compute()` adapter mapping raw numbers → `headline` + `rows`, `howItWorks`, `seoContent` (≥600 words), `rateCards` (country-aware only), `workedExample` (the R1 published example), ≥5 `faqs`, `related` (≥3 sibling slugs), `sources`, `feesVerifiedOn`, `lastUpdated`.

- [ ] **R8: Add the brand accent** to `src/config/platforms.ts` (`id`, `name`, tuned `color` + `colorDark`). Recognition only — no logos.

- [ ] **R9 (country-aware only): Add a `*RateCards()` builder** to `src/lib/rateCards.ts` mirroring `etsyRateCards`; if R1 surfaced a market missing from `CountryCode`, add it to `src/lib/countries.ts` (`CountryCode`, `COUNTRIES`, `COUNTRY_SEARCH_NAME`).

- [ ] **R10: Register** the config in `src/calculators/index.ts` (import + add to the `calculators` array).

- [ ] **R11: Write `keywords.md`** in the calc folder (human reference cluster).

- [ ] **R12: Verify.** Run `npm test` (green), `npm run build` (clean), `npm run keywords` (regenerate root tracker). For the first calculator of each new UI shape (e.g. first POD calc, first plan-select calc), run the `web-design-guidelines` skill in light + dark.

- [ ] **R13: Commit.** `git add -A && git commit -m "feat: add <slug>"`.

### Batches (compose from the approved Phase 0 ranking — spec §2)
- **Batch 1 (pattern lock):** ≥1 shared flat platform + 1 bespoke (e.g. eBay). Review math + copy + design with the user before scaling.
- **Batch 2 — big marketplaces (bespoke + country-aware):** Amazon, eBay, Shopify. Each gets a dedicated TDD pass for its tier/category/plan tables (FBA size-weight tiers; eBay category final-value rates; Shopify plan × processing) and an official-calculator cross-check. These are the highest-effort, highest-accuracy-risk pages.
- **Batch 3 — resale/marketplace flat-fee (shared):** Poshmark, Mercari, Depop, Whatnot, Reverb, StockX, Bonanza, Vinted (buyer-protection framing), FB/IG Shop, TikTok Shop, Walmart, App Store, Google Play.
- **Batch 4 — creator/membership (shared, some plan-select):** Gumroad, Patreon, Ko-fi, Buy Me a Coffee, Substack, Bandcamp, Sellfy.
- **Batch 5 — POD profit (bespoke):** Printful, Printify, Redbubble, Spring.
- **Batch 6 — course/freelance + long tail (shared/plan-select):** Teachable, Podia, Kajabi, Fiverr, Upwork.

Each batch ends with: `npm test` green, `npm run build` clean, `npm run keywords` regenerated, `PROGRESS.md` updated, all new pages linked from the `ecommerce-fees` hub (≥3 inbound links each, no orphans).

---

## Self-Review

**Spec coverage:** Phase 0 (spec §2/§8) → Task 0. Shared engine / Approach 1 (§4.1) → Task 1. Bespoke formulas (§4.2) → Recipe R5 + Batches 2 & 5. Fee data + sources/dates (§4.3, §7) → R1/R2. Rate cards (§4.4) → R9. Accents (§4.5) → R8. Registry/slug rule (§4.6) → R10. Broad countries + registry growth (§5) → R1/R9. Page pattern + DoD (§6) → R7/R12. Accuracy assurance (§7) → R1/R3/R6. Keyword research (§8) → Task 0. Comparisons (§10) → explicitly out of scope (separate spec). ✓ No gaps.

**Placeholder scan:** Task 1 (the only research-independent build) is fully concrete — real code, hand-verified test numbers. The recipe's per-platform fee numbers are intentionally gathered in step R1 (a real research action), not left as planning placeholders; this is required because exact fees/keywords/countries are unknown until the Phase 0 gate and per-platform verification, and inventing them now would risk shipping wrong numbers (the one thing the user said must not happen). Detailed per-platform task numbers are produced as each platform passes R1.

**Type consistency:** `computeMarketplaceFee` / `MarketplaceFeeInput` / `MarketplaceFeeBreakdown` names and field names (`itemPrice`, `sellingPercent`, `feeOnShipping`, `flatUnderThreshold`, `payout`, `takeRatePercent`) are used identically in the test (Task 1 Step 1), the implementation (Step 3), and the recipe (R3/R5). `CalculatorConfig` usage in R7 matches `src/calculators/_types.ts`. ✓
