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
  | "JP"
  | "NZ"
  | "HK"
  | "MX"
  | "MY"
  | "SE"
  | "DE"
  | "FR"
  | "ES"
  | "IT"
  | "NL"
  | "IE"
  | "BE"
  | "AT"
  | "AE"
  | "PH"
  | "ZA"
  | "PL"
  | "TR"
  | "KR"
  | "SA"
  | "ID"
  | "NG"
  | "PK"
  | "BD"
  | "UA"
  | "CZ"
  | "HU"
  | "RO";

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
  JP: { code: "JP", name: "Japan", currency: "JPY", locale: "ja-JP", tier: 2 },
  NZ: { code: "NZ", name: "New Zealand", currency: "NZD", locale: "en-NZ", tier: 2 },
  HK: { code: "HK", name: "Hong Kong", currency: "HKD", locale: "en-HK", tier: 2 },
  MX: { code: "MX", name: "Mexico", currency: "MXN", locale: "es-MX", tier: 2 },
  MY: { code: "MY", name: "Malaysia", currency: "MYR", locale: "en-MY", tier: 2 },
  SE: { code: "SE", name: "Sweden", currency: "SEK", locale: "sv-SE", tier: 2 },
  DE: { code: "DE", name: "Germany", currency: "EUR", locale: "de-DE", tier: 2 },
  FR: { code: "FR", name: "France", currency: "EUR", locale: "fr-FR", tier: 2 },
  ES: { code: "ES", name: "Spain", currency: "EUR", locale: "es-ES", tier: 2 },
  IT: { code: "IT", name: "Italy", currency: "EUR", locale: "it-IT", tier: 2 },
  NL: { code: "NL", name: "Netherlands", currency: "EUR", locale: "nl-NL", tier: 2 },
  IE: { code: "IE", name: "Ireland", currency: "EUR", locale: "en-IE", tier: 2 },
  BE: { code: "BE", name: "Belgium", currency: "EUR", locale: "nl-BE", tier: 2 },
  AT: { code: "AT", name: "Austria", currency: "EUR", locale: "de-AT", tier: 2 },
  AE: { code: "AE", name: "United Arab Emirates", currency: "AED", locale: "en-AE", tier: 2 },
  PH: { code: "PH", name: "Philippines", currency: "PHP", locale: "en-PH", tier: 2 },
  ZA: { code: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA", tier: 2 },
  PL: { code: "PL", name: "Poland", currency: "PLN", locale: "pl-PL", tier: 2 },
  TR: { code: "TR", name: "Turkey", currency: "TRY", locale: "tr-TR", tier: 2 },
  KR: { code: "KR", name: "South Korea", currency: "KRW", locale: "ko-KR", tier: 2 },
  SA: { code: "SA", name: "Saudi Arabia", currency: "SAR", locale: "ar-SA", tier: 2 },
  ID: { code: "ID", name: "Indonesia", currency: "IDR", locale: "id-ID", tier: 2 },
  NG: { code: "NG", name: "Nigeria", currency: "NGN", locale: "en-NG", tier: 2 },
  PK: { code: "PK", name: "Pakistan", currency: "PKR", locale: "en-PK", tier: 2 },
  BD: { code: "BD", name: "Bangladesh", currency: "BDT", locale: "bn-BD", tier: 2 },
  UA: { code: "UA", name: "Ukraine", currency: "UAH", locale: "uk-UA", tier: 2 },
  CZ: { code: "CZ", name: "Czech Republic", currency: "CZK", locale: "cs-CZ", tier: 2 },
  HU: { code: "HU", name: "Hungary", currency: "HUF", locale: "hu-HU", tier: 2 },
  RO: { code: "RO", name: "Romania", currency: "RON", locale: "ro-RO", tier: 2 },
};

/**
 * Search-friendly country names used to generate country-specific keyword
 * variants (e.g. "stripe fee calculator for uk"). These reflect how people
 * actually search, not the formal country name.
 */
export const COUNTRY_SEARCH_NAME: Record<CountryCode, string> = {
  US: "usa",
  GB: "uk",
  CA: "canada",
  AU: "australia",
  EU: "europe",
  IN: "india",
  SG: "singapore",
  BR: "brazil",
  JP: "japan",
  NZ: "new zealand",
  HK: "hong kong",
  MX: "mexico",
  MY: "malaysia",
  SE: "sweden",
  DE: "germany",
  FR: "france",
  ES: "spain",
  IT: "italy",
  NL: "netherlands",
  IE: "ireland",
  BE: "belgium",
  AT: "austria",
  AE: "uae",
  PH: "philippines",
  ZA: "south africa",
  PL: "poland",
  TR: "turkey",
  KR: "south korea",
  SA: "saudi arabia",
  ID: "indonesia",
  NG: "nigeria",
  PK: "pakistan",
  BD: "bangladesh",
  UA: "ukraine",
  CZ: "czech republic",
  HU: "hungary",
  RO: "romania",
};

/** Resolve a country's display + currency metadata, defaulting safely to US. */
export function getCountry(code: CountryCode | string | undefined): Country {
  if (code && code in COUNTRIES) return COUNTRIES[code as CountryCode];
  return COUNTRIES.US;
}

/** Ordered list (tier, then alpha) for rendering a selector. */
export function countriesFor(codes: CountryCode[]): Country[] {
  // Plain alphabetical, the convention for country selectors everywhere.
  // Sorting by `tier` first put tier 1 in A–Z order and then restarted the
  // alphabet at tier 2, which reads as random when you are scanning for one
  // country. `tier` stays as market metadata (PLAN §2); it just no longer
  // drives this order — the selector is searchable, so priority ordering buys
  // nothing and costs predictability.
  return codes
    .map((c) => COUNTRIES[c])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}
