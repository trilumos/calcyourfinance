/**
 * SEO + structured-data builders (PLAN §6). All JSON-LD is generated from
 * config — never hand-written per page. Validates as schema.org types.
 */

import { SITE } from "../config/site";
import { CATEGORY_META, type CalculatorConfig } from "../calculators/_types";

export function absUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // The homepage canonical is the bare origin with NO trailing slash — that's the
  // canonical Google actually selected for "/", so we declare the same to avoid a
  // canonical mismatch. Every other path is "/slug" (already no trailing slash).
  return clean === "/" ? SITE.url : `${SITE.url}${clean}`;
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

/** The named, real author/maintainer as a schema.org Person (E-E-A-T). */
export function authorPerson() {
  return {
    "@type": "Person",
    name: SITE.author.name,
    url: absUrl(SITE.author.url),
    jobTitle: SITE.author.role,
    description: SITE.author.bio,
    ...(SITE.author.sameAs.length ? { sameAs: SITE.author.sameAs } : {}),
    worksFor: { "@type": "Organization", name: SITE.organization.parent.name, url: SITE.organization.parent.url },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.organization.name,
    url: SITE.url,
    logo: absUrl(SITE.organization.logo),
    description: SITE.description,
    founder: authorPerson(),
    parentOrganization: {
      "@type": "Organization",
      name: SITE.organization.parent.name,
      url: SITE.organization.parent.url,
    },
    ...(SITE.organization.sameAs.length ? { sameAs: SITE.organization.sameAs } : {}),
  };
}

/**
 * WebSite schema — the documented lever for the site name Google shows in
 * results (Search Central "Site names"). `name` is the preferred display name;
 * `alternateName` offers a fallback. Intentionally NO SearchAction: Google
 * deprecated the sitelinks search box (Nov 2024), so that markup does nothing.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: SITE.domain,
    url: SITE.url,
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
    author: authorPerson(),
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
