/**
 * SEO + structured-data builders (PLAN §6). All JSON-LD is generated from
 * config — never hand-written per page. Validates as schema.org types.
 */

import { SITE } from "../config/site";
import { CATEGORY_META, type CalculatorConfig } from "../calculators/_types";

export function absUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

export function calculatorUrl(slug: string): string {
  return absUrl(`/${slug}`);
}

export function pageTitle(config: CalculatorConfig): string {
  // Keep the exact keyword first; brand suffix for recognition.
  return `${config.title} | ${SITE.name}`;
}

export function ogImageUrl(slug: string): string {
  return absUrl(`/og/${slug}.png`);
}

/* ---- JSON-LD ------------------------------------------------------------- */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.organization.name,
    url: SITE.url,
    logo: absUrl(SITE.organization.logo),
    ...(SITE.organization.sameAs.length ? { sameAs: SITE.organization.sameAs } : {}),
  };
}

export function softwareAppSchema(config: CalculatorConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: config.title,
    url: calculatorUrl(config.slug),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    description: config.metaDescription,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@type": "Organization", name: SITE.organization.name, url: SITE.url },
  };
}

export function faqSchema(config: CalculatorConfig) {
  if (!config.faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(config: CalculatorConfig) {
  const cat = CATEGORY_META[config.category];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: cat.label, item: absUrl(`/${cat.slug}`) },
      {
        "@type": "ListItem",
        position: 3,
        name: config.title,
        item: calculatorUrl(config.slug),
      },
    ],
  };
}

/** Combine all per-page schema into one array for a single <script> block. */
export function calculatorSchemas(config: CalculatorConfig) {
  return [
    softwareAppSchema(config),
    breadcrumbSchema(config),
    faqSchema(config),
  ].filter(Boolean);
}
