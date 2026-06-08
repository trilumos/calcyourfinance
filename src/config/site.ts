/**
 * Site-wide configuration: domain, org identity, author, social handles.
 * Used for canonical URLs, Organization JSON-LD, and footer/about content.
 */

export const SITE = {
  name: "CalcYourFinance",
  domain: "calcyourfinance.com",
  url: "https://calcyourfinance.com",
  tagline: "Free finance & e-commerce calculators",
  description:
    "Free, fast calculators for e-commerce fees, payment processing, AI/API costs, freelancing, and personal finance. No signup. Works on mobile.",
  locale: "en_US",
  language: "en",

  // Organization JSON-LD + E-E-A-T. Update author once finalized (see PLAN §13).
  organization: {
    name: "CalcYourFinance",
    logo: "/og/logo.png",
    sameAs: [] as string[], // social profile URLs once created
  },

  // Visible author/methodology owner for YMYL trust. PLACEHOLDER — confirm.
  author: {
    name: "CalcYourFinance Editorial",
    role: "Finance & e-commerce tools team",
    bio: "We build and verify finance calculators, citing every formula and platform fee schedule with a last-verified date.",
    url: "/about",
  },

  // YMYL disclaimer rendered in the footer of every page.
  disclaimer:
    "For estimation only — not financial advice. Verify current fees and rates with the official source before making decisions.",

  // Monetization provider switch (PLAN §8). One line flips the whole site.
  ads: {
    enabled: false,
    provider: "none" as "none" | "adsense" | "ezoic" | "mediavine",
    adsenseClientId: "", // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  },
} as const;

export type SiteConfig = typeof SITE;
