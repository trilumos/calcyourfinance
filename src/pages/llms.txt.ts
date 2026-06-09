/**
 * /llms.txt — an LLM-friendly summary of the site (llmstxt.org convention).
 * Generated from the calculator registry so it stays in sync as tools are
 * added. Helps AI assistants represent the site and its tools accurately.
 */
import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { calculators } from "../calculators";

export const GET: APIRoute = () => {
  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(
    "CalcYourFinance provides free, fast calculators for e-commerce fees, payment processing, AI/API costs, freelancing and personal finance. All calculations run client-side in the browser. Every platform fee is sourced from the provider's official pricing page and stamped with a 'verified on' date. Results are estimates, not financial advice — always confirm with the platform before making decisions.",
  );
  lines.push("");

  lines.push("## Calculators");
  for (const c of calculators) {
    lines.push(`- [${c.title}](${SITE.url}/${c.slug}): ${c.metaDescription}`);
  }
  lines.push("");

  lines.push("## About");
  lines.push(
    `- [About](${SITE.url}/about): Who builds CalcYourFinance and how we keep fees accurate.`,
  );
  lines.push(
    `- [Methodology](${SITE.url}/methodology): How we source, verify, date and unit-test every fee and formula.`,
  );
  lines.push(
    `- [Contact](${SITE.url}/contact): Report an out-of-date fee or suggest a calculator.`,
  );
  lines.push("");

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
