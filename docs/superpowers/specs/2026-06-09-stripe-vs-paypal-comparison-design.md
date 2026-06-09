# Design — Stripe vs PayPal comparison calculator (+ comparison template)

> **Status:** Approved design, awaiting spec review → implementation plan.
> **Date:** 2026-06-09
> **Slug:** `stripe-vs-paypal-fee-calculator`

## 1. Purpose & scope

Build the **first `kind: "comparison"` calculator** and the reusable engine support every
future comparison page (Stripe vs Square, Wise vs PayPal, Lemon Squeezy vs Gumroad, …) will
share. Both platforms already live in `src/config/fees.ts` with **22 matching countries**, so
this is pure reuse of existing data and pure math — no new fee research, no new formulas.

This page also establishes the **standing pattern**: each new tool ships fully integrated
(config + formula + tests + SEO + internal links + hub + OG) before moving on, and when a new
tool can be compared against existing ones, the comparison pages are added too.

**In scope:** one comparison page + the generic `ComparisonResult` type + a new
`<ComparisonReadout>` branch in the shared island.
**Out of scope:** any new fee data; comparisons involving Etsy (a marketplace, not an
apples-to-apples processor); the N-way "payment processing fee comparison" hub (later).

## 2. Decisions locked (from brainstorming)

1. **Result layout:** side-by-side platform cards with a **winner banner** on top
   ("PayPal is cheaper by $0.30 on $100"). Defines the template for all comparisons.
2. **Input scope:** shared inputs drive the verdict, plus a static note under each card
   listing that platform's extras with a link to its single tool. **Exception:** PayPal
   transaction type IS exposed as an input (see #4) because it materially changes PayPal's rate.
3. **Reverse mode:** included — each card grosses up independently (charge ↔ net).
4. **PayPal rate basis:** user selects the PayPal **transaction type** (Goods & Services /
   Checkout / Micropayments). This is the single asymmetric, PayPal-only input; Stripe's side
   ignores it. The verdict is honest because the user controls the product being compared.

## 3. Architecture

### 3.1 New result type (`src/calculators/_types.ts`)

Add a discriminated `ComparisonResult` alongside the existing single `CalcResult`. The
existing `CalcResult` implicitly becomes the `variant: "single"` case (discriminant defaulted,
so the 3 existing single configs are **not** edited for the type change).

```ts
export interface ComparisonColumn {
  platform: string;          // "stripe" | "paypal" → drives accent color
  name: string;              // "Stripe"
  net: string;               // pre-formatted "You keep" figure
  fee: string;               // pre-formatted total fee
  rateLabel: string;         // "2.9% + $0.30"
  effective: string;         // "Effective 3.20%"
  isWinner: boolean;
  note?: { text: string; href: string };  // "Stripe also offers Billing +0.7%" → /stripe-fee-calculator
}

export interface ComparisonResult {
  variant: "comparison";
  verdict: { text: string; sub: string };  // winner sentence + context, or a tie message
  columns: ComparisonColumn[];             // exactly 2 for now; shape allows N later
}
```

`compute` signature widens to `(values, ctx) => CalcResult | ComparisonResult`. A small
`isComparisonResult(r)` type guard (checks `"variant" in r && r.variant === "comparison"`)
lets the island and shell discriminate.

### 3.2 Island (`src/components/CalculatorIsland.tsx`)

- Add `<ComparisonReadout result={...} />` (~80 lines): winner banner (uses the winner's
  platform accent) above two accent-tinted cards; each card shows net (large), fee, rate
  label, effective rate, winner check, and the optional note/link.
- `recompute()` / `ensureCompute()` / inputs form / country search dropdown / SSR-initial
  render are **unchanged**. The component picks `<ComparisonReadout>` vs `<Readout>` via the
  type guard on the current `result`.
- Reused brand accents come from `src/config/platforms.ts` (Stripe `#635BFF`, PayPal `#0070E0`).

### 3.3 Shell (`src/components/CalculatorShell.astro`)

No structural change — it already computes the initial result server-side (SSR → zero CLS,
SEO sees the numbers) and passes it to the island. A comparison result flows through the same
`initialResult` prop. (Confirm the single-platform accent chip in the header degrades sensibly
for a 2-platform page — likely show no single chip, or show both platform names.)

## 4. The calculator (`src/calculators/stripe-vs-paypal-fee-calculator/`)

Folder name **MUST equal the slug** (`import.meta.glob` matches `/${slug}/config`).

### 4.1 `config.ts`
- `slug: "stripe-vs-paypal-fee-calculator"`, `kind: "comparison"`,
  `category: "payment-fees"`, `comparisonOf: ["stripe", "paypal"]`.
- `countries.supported`: the 22 shared countries; `default: "US"`.
- **Inputs:** `mode` (charge/net select), `amount` (currency), `paypalTxType`
  (select: goods / checkout / micro), `international` (toggle), `conversion` (toggle).
- **compute():** reads `stripeFees[country]` + `paypalFees[country]`; calls `computeStripeFee`
  and `computePayPalFee` (selecting the PayPal variant from `paypalTxType`); builds two columns
  and the verdict. Lower net loses; equal/within-rounding nets → tie message. Each column's
  `note` links to that platform's single calculator and names its extras (Stripe: Billing
  +0.7% / Invoicing +0.4%; PayPal: other transaction types / micropayments).
- **Content:** `title`, `metaDescription`, `h1`, `intro`, `howItWorks`, `workedExample`,
  `seoContent` (≥600 words), `faqs` (≥5 — the "is Stripe or PayPal cheaper", "Stripe vs PayPal
  fees on $100", "which is better for small payments" PAA cluster), `sources` (reuse both
  platforms' official fee pages), `feesVerifiedOn`, `lastUpdated`.
- Optional `rateCards`: a combined per-country Stripe-vs-PayPal reference grid (nice for SEO;
  may defer to a follow-up if it complicates the first build).

### 4.2 `formula.ts` (pure)
No new fee math. A pure `compareFees(input)` that calls the two existing pure formulas and
returns `{ stripe, paypal, winner, savings }` raw numbers. Keeps the verdict logic testable
independently of formatting.

### 4.3 `formula.test.ts` (TDD — write first)
Assert composition + verdict, not the underlying arithmetic (already covered):
- US $100, Checkout: known nets for both; correct winner + savings.
- Small amount where the higher fixed fee flips the winner.
- Tie within rounding → tie verdict.
- Reverse mode (`net`) parity: each platform grosses up to the requested take-home.
- International + conversion surcharges applied to both sides.

### 4.4 `keywords.md`
Primary: `stripe vs paypal fees` / `stripe vs paypal fee calculator`. Secondary +
long-tail from SERP/PAA. Country variants are auto-generated by `build-keywords.ts` via the
`countries` field — do **not** hand-add them.

## 5. Integration (ships fully)

- **Registry:** add to `src/calculators/index.ts`.
- **Internal links:** add to the `/payment-fees` hub; set the comparison's `related` to both
  single tools (+ Etsy where natural); **update `stripe-fee-calculator` and
  `paypal-fee-calculator` configs' `related`** to point back at the comparison.
- **Keywords:** run `npm run keywords` to regenerate root `keywords.md`.
- **OG image:** run `npm run og` to mint `/og/stripe-vs-paypal-fee-calculator.png`.
- **SEO/JSON-LD:** title/meta/canonical/OG + WebApplication + FAQPage + BreadcrumbList all
  generate from config via `lib/seo.ts` — no new SEO code.

## 6. Verification (definition of done)

- `npm test` — new comparison tests + existing 27 all pass.
- `npm run build` — clean; static HTML for the new page carries H1, both readout numbers, the
  verdict, canonical, OG, and the JSON-LD blocks.
- UI checked in browser, **light + dark**, country switch recompute, reverse mode, mobile
  (cards stack < ~640px), run the `web-design-guidelines` skill and fix findings.
- `PROGRESS.md` updated; `keywords.md` + OG regenerated.

## 7. Files touched

| File | Change |
|---|---|
| `src/calculators/_types.ts` | add `ComparisonResult` / `ComparisonColumn` + widen `compute` return + `isComparisonResult` guard |
| `src/components/CalculatorIsland.tsx` | add `<ComparisonReadout>` branch |
| `src/components/CalculatorShell.astro` | header accent/chip handling for 2-platform page (minor) |
| `src/calculators/index.ts` | register new config |
| `src/calculators/stripe-vs-paypal-fee-calculator/{config,formula,formula.test,keywords.md}` | new |
| `src/calculators/stripe-fee-calculator/config.ts` | `related` += comparison |
| `src/calculators/paypal-fee-calculator/config.ts` | `related` += comparison |
| `/payment-fees` hub | list the comparison |

## 8. Risks / notes

- **Accent for two brands:** the existing shell shows one platform chip; for a comparison,
  show both names or none. Confirm during build it degrades cleanly in light + dark.
- **Tie definition:** treat nets equal within a cent as a tie to avoid a misleading
  "cheaper by $0.00" banner.
- **PayPal variant availability per country:** some countries lack a separate micropayments
  variant; `compute()` falls back to the standard commercial variant (mirrors the single
  PayPal config's `variants.find(...) ?? variants[0]`).
