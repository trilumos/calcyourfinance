/**
 * Country registry for country-aware calculators (PLAN §1).
 * Each entry maps an ISO-ish country code to its currency + display locale,
 * so a single `country` selection drives fee lookup, math, and formatting.
 *
 * Launch set + tier-2 markets per PLAN §2. "EU" is treated as a bloc for
 * platforms that publish one Eurozone rate (Stripe/PayPal often do).
 * Expand this list the same way we expand calculators.
 */

export interface Country {
  code: CountryCode;
  name: string;
  /** ISO 4217 currency code used for formatting + fee math. */
  currency: string;
  /** BCP-47 locale for Intl number/currency formatting. */
  locale: string;
  /** Sort/priority hint: lower = show higher in the selector. */
  tier: 1 | 2;
}

export type CountryCode =
  | "US"
  | "GB"
  | "CA"
  | "AU"
  | "EU"
  | "IN"
  | "SG"
  | "BR"
  | "DE"
  | "FR"
  | "NL"
  | "IE"
  | "NZ"
  | "MX"
  | "AE"
  | "PH"
  | "MY"
  | "ZA";

export const COUNTRIES: Record<CountryCode, Country> = {
  US: { code: "US", name: "United States", currency: "USD", locale: "en-US", tier: 1 },
  GB: { code: "GB", name: "United Kingdom", currency: "GBP", locale: "en-GB", tier: 1 },
  CA: { code: "CA", name: "Canada", currency: "CAD", locale: "en-CA", tier: 1 },
  AU: { code: "AU", name: "Australia", currency: "AUD", locale: "en-AU", tier: 1 },
  EU: { code: "EU", name: "Eurozone", currency: "EUR", locale: "en-IE", tier: 1 },
  IN: { code: "IN", name: "India", currency: "INR", locale: "en-IN", tier: 1 },
  SG: { code: "SG", name: "Singapore", currency: "SGD", locale: "en-SG", tier: 1 },
  BR: { code: "BR", name: "Brazil", currency: "BRL", locale: "pt-BR", tier: 1 },

  // Tier-2 — enabled per calculator where the platform publishes a distinct
  // rate AND there is search demand (validated during research).
  DE: { code: "DE", name: "Germany", currency: "EUR", locale: "de-DE", tier: 2 },
  FR: { code: "FR", name: "France", currency: "EUR", locale: "fr-FR", tier: 2 },
  NL: { code: "NL", name: "Netherlands", currency: "EUR", locale: "nl-NL", tier: 2 },
  IE: { code: "IE", name: "Ireland", currency: "EUR", locale: "en-IE", tier: 2 },
  NZ: { code: "NZ", name: "New Zealand", currency: "NZD", locale: "en-NZ", tier: 2 },
  MX: { code: "MX", name: "Mexico", currency: "MXN", locale: "es-MX", tier: 2 },
  AE: { code: "AE", name: "United Arab Emirates", currency: "AED", locale: "en-AE", tier: 2 },
  PH: { code: "PH", name: "Philippines", currency: "PHP", locale: "en-PH", tier: 2 },
  MY: { code: "MY", name: "Malaysia", currency: "MYR", locale: "en-MY", tier: 2 },
  ZA: { code: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA", tier: 2 },
};

/** Resolve a country's display + currency metadata, defaulting safely to US. */
export function getCountry(code: CountryCode | string | undefined): Country {
  if (code && code in COUNTRIES) return COUNTRIES[code as CountryCode];
  return COUNTRIES.US;
}

/** Ordered list (tier, then alpha) for rendering a selector. */
export function countriesFor(codes: CountryCode[]): Country[] {
  return codes
    .map((c) => COUNTRIES[c])
    .filter(Boolean)
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
