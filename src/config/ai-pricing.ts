/**
 * ───────────────────────────────────────────────────────────────────────────
 *  AI MODEL & API PRICING — single source of truth (PLAN §2 sub-group 1E)
 * ───────────────────────────────────────────────────────────────────────────
 *  Mirrors the fees.ts pattern: every model carries source + verifiedOn.
 *  Prices are USD per 1,000,000 tokens unless noted (the industry convention).
 *  Populated during the AI-cost calculator build with citations.
 * ───────────────────────────────────────────────────────────────────────────
 */

export interface ModelPricing {
  provider: "openai" | "anthropic" | "google" | string;
  /** Display name, e.g. "GPT-4o", "Claude Opus 4.8", "Gemini 2.5 Pro". */
  model: string;
  /** USD per 1M input tokens. */
  inputPerMTok: number;
  /** USD per 1M output tokens. */
  outputPerMTok: number;
  /** Optional cached-input price per 1M tokens. */
  cachedInputPerMTok?: number;
  notes?: string;
  source: string;
  verifiedOn: string; // YYYY-MM-DD
}

export const aiPricing: Record<string, ModelPricing> = {
  // filled during the AI-cost calculator build, e.g.:
  // "gpt-4o": { provider: "openai", model: "GPT-4o", inputPerMTok: 2.5,
  //   outputPerMTok: 10, source: "https://openai.com/api/pricing/", verifiedOn: "2026-06-08" },
};
