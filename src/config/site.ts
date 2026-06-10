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
    "Free fee calculators for Stripe, PayPal, Etsy and more. Instantly calculate payment processing fees, seller fees and exactly what you keep — cited, dated rates. No signup.",
  locale: "en_US",
  language: "en",

  // Organization JSON-LD + E-E-A-T. Update author once finalized (see PLAN §13).
  organization: {
    name: "CalcYourFinance",
    logo: "/og/logo.png",
    sameAs: [] as string[], // CalcYourFinance's own social profiles, once created
    // Parent studio/entity behind the site.
    parent: { name: "Trilumos", url: "https://trilumos.in" },
  },

  // Search Console / site verification. Paste the token from the meta-tag
  // verification method (the value of `content=`), not the whole tag. Empty = off.
  verification: {
    google: "", // e.g. "AbCdEf123..." from <meta name="google-site-verification" content="...">
  },

  // Social handle (without @). Drives twitter:site / twitter:creator. Empty = off.
  social: {
    twitter: "", // e.g. "calcyourfinance"
  },

  // Visible author/methodology owner for YMYL trust (E-E-A-T). Named, real
  // person + corroborating profile links (sameAs) so Google can verify the entity.
  author: {
    name: "Deep Kakadiya",
    role: "Founder & developer, Trilumos",
    bio: "Deep Kakadiya is a software engineer and the founder of Trilumos, the studio behind CalcYourFinance. He designs, builds and maintains every calculator on the site — sourcing each platform's fees directly from its official pricing pages, encoding the math as unit-tested functions, and stamping every rate with the date it was last verified so the numbers stay accurate and accountable.",
    url: "/about",
    sameAs: [
      "https://www.linkedin.com/in/deep-kakadiya-5b258024b/",
      "https://trilumos.in",
    ] as string[],
  },

  // YMYL disclaimer rendered in the footer of every page.
  disclaimer:
    "For estimation only — not financial advice. Verify current fees and rates with the official source before making decisions.",

  // Contact + legal. Used by Contact / Privacy / Terms pages and footer.
  contactEmail: "trilumos.app@gmail.com",
  effectiveDate: "2026-06-08", // for legal pages "last updated"

  // Analytics — paste a GA4 Measurement ID to enable (gated; empty = off).
  analytics: {
    gaId: "G-CT3RKRWBTF",
  },

  // Monetization provider switch (PLAN §8). One line flips the whole site.
  ads: {
    enabled: false,
    provider: "none" as "none" | "adsense" | "ezoic" | "mediavine",
    adsenseClientId: "", // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  },
} as const;

export type SiteConfig = typeof SITE;
