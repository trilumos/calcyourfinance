/**
 * The CalculatorConfig contract (PLAN §1). Everything generates from this:
 * page, schema, SEO tags, breadcrumbs, FAQ markup, country selector, OG image.
 *
 * Separation of concerns:
 *   - formula.ts  → PURE math returning raw numbers (this is what tests target)
 *   - config.ts   → metadata + a `compute()` adapter that maps raw numbers to
 *                   display rows using country-aware formatters from ComputeCtx
 */

import type { CountryCode } from "../lib/countries";

/* ---- Categories ---------------------------------------------------------- */
export type Category =
  | "ecommerce-fees"
  | "payment-fees"
  | "ai-api-costs"
  | "freelance"
  | "personal-finance"
  | "general";

export const CATEGORY_META: Record<
  Category,
  { slug: string; label: string; blurb: string }
> = {
  "payment-fees": {
    slug: "payment-fees",
    label: "Payment Fees",
    blurb: "Work out exactly what Stripe, PayPal, Square, Wise and other processors take.",
  },
  "ecommerce-fees": {
    slug: "ecommerce-fees",
    label: "E-commerce & Seller Fees",
    blurb: "Marketplace and creator-platform fees: Etsy, Amazon, Shopify, eBay, Gumroad and more.",
  },
  "ai-api-costs": {
    slug: "ai-api-costs",
    label: "AI & API Costs",
    blurb: "Estimate token and API costs for OpenAI, Claude, Gemini and other tools.",
  },
  freelance: {
    slug: "freelance",
    label: "Freelance & Business",
    blurb: "Rates, margins, break-even and SaaS metrics for independents and small businesses.",
  },
  "personal-finance": {
    slug: "personal-finance",
    label: "Personal Finance",
    blurb: "Budgeting, saving, debt payoff and compound-growth calculators.",
  },
  general: {
    slug: "general",
    label: "General",
    blurb: "Core financial calculators.",
  },
};

/* ---- Inputs -------------------------------------------------------------- */
export type InputType = "currency" | "percent" | "number" | "select" | "toggle";

export interface SelectOption {
  value: string;
  label: string;
}

export interface InputSpec {
  id: string;
  label: string;
  type: InputType;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  /** For select inputs. */
  options?: SelectOption[];
  /** Short helper text under the field. */
  help?: string;
  /** Visual prefix/suffix (e.g. "$", "%") when not derived from country. */
  prefix?: string;
  suffix?: string;
  /** Currency inputs render the selected country's symbol automatically. */
  placeholder?: string;
}

/* ---- Results ------------------------------------------------------------- */
export type RowKind = "default" | "deduction" | "net" | "muted";

export interface ResultRow {
  label: string;
  /** Pre-formatted display string (currency/percent already applied). */
  display: string;
  kind?: RowKind;
  hint?: string;
}

export interface CalcResult {
  /** The hero number shown large in the readout. */
  headline: { label: string; display: string; sub?: string };
  /** Line-item breakdown rendered as a receipt. */
  rows: ResultRow[];
}

/** Formatters + selected country handed to a config's compute() adapter. */
export interface ComputeCtx {
  country: CountryCode;
  formatCurrency: (value: number, opts?: { maximumFractionDigits?: number }) => string;
  formatPercent: (value: number, dp?: number) => string;
  formatNumber: (value: number, dp?: number) => string;
}

/** Raw input values keyed by InputSpec.id. */
export type InputValues = Record<string, number | string | boolean>;

/* ---- Keywords (per-page cluster; aggregates to site tracker) ------------- */
export interface KeywordCluster {
  primary: string;
  secondary: string[];
  longTail: string[];
  competition: "E" | "M" | "H";
  estVolume?: number;
  intent?: string;
}

/* ---- Content blocks ------------------------------------------------------ */
export interface WorkedExample {
  scenario: string;
  /** Ordered "label → value" lines walking through the math. */
  steps: { label: string; value: string }[];
  result: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Source {
  label: string;
  url: string;
}

/* ---- The config ---------------------------------------------------------- */
export interface CalculatorConfig {
  slug: string;
  kind: "single" | "comparison";
  category: Category;

  title: string; // <title> + drives H1 if h1 omitted
  metaDescription: string;
  h1: string;
  intro: string;

  /** Optional platform key (src/config/platforms.ts) for a brand-accent touch. */
  platform?: string;

  keywords: KeywordCluster;

  /** Present when fees/results are country-specific. */
  countries?: {
    supported: CountryCode[];
    default: CountryCode;
  };

  inputs: InputSpec[];
  /** Presentation adapter: calls pure formula(s), returns display-ready result. */
  compute: (values: InputValues, ctx: ComputeCtx) => CalcResult;

  /** For kind:"comparison" — platform keys being compared. */
  comparisonOf?: string[];

  howItWorks: string; // markdown-ish plain text (paragraphs split on \n\n)
  workedExample: WorkedExample;
  faqs: Faq[];
  related: string[]; // sibling slugs
  sources: Source[];

  feesVerifiedOn?: string; // YYYY-MM-DD for fee calculators
  lastUpdated: string; // YYYY-MM-DD
}
