/**
 * Builds the check list by walking the REAL fee/price config and pulling every
 * `*source*` URL plus the `verifiedOn` next to it. Nothing is transcribed by
 * hand, so the watcher can never drift from fees.ts / ai-pricing.ts — add a
 * calculator and its sources are checked automatically. The only hand-authored
 * bits are the value assertions (expect.ts).
 */
import * as fees from "../../src/config/fees";
import * as aiPricing from "../../src/config/ai-pricing";
import { calculators } from "../../src/calculators";
import { EXPECT, LABEL } from "./expect";
import type { CheckTarget } from "./classify";

type Raw = { platform: string; field: string; url: string; verifiedOn?: string; auto: string[] };

/** Trim a JS number to how it reads on a pricing page: 2.9 -> "2.9", 20 -> "20". */
const numStr = (n: number) => String(n);

/**
 * Derive assertion strings from the LIVE numeric fields sitting next to a
 * `source`, so the watcher checks pages against the current rates file itself —
 * not a hand-copied list. Only unambiguous, conventionally-named fields:
 *   *Percent  -> "N%"   (this codebase stores percents as whole numbers)
 *   *Fixed    -> "$N.NN"
 * Fraction-encoded rates (tierFees 0.5 = 50%), caps and ranges are ambiguous to
 * format, so those stay curated in expect.ts.
 */
function autoAssertions(obj: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== "number") continue;
    if (/intl|international/i.test(k)) continue; // rarely on the headline page
    if (/percent$/i.test(k)) out.push(`${numStr(v)}%`);
    else if (/fixed$/i.test(k) && v > 0) out.push(`$${v.toFixed(2)}`);
  }
  return out;
}

function prettify(name: string): string {
  return (
    name
      .replace(/(Fees?|Info|Pricing|Config|Rates?)$/g, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || name
  );
}

/** Depth-first: collect string values whose key mentions "source" and looks
 *  like a URL, carrying the nearest enclosing `verifiedOn` down the tree. */
function scan(node: unknown, platform: string, inheritedVerified: string | undefined, out: Raw[]) {
  if (Array.isArray(node)) {
    for (const el of node) scan(el, platform, inheritedVerified, out);
    return;
  }
  if (!node || typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  const verifiedOn = typeof obj.verifiedOn === "string" ? obj.verifiedOn : inheritedVerified;

  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string" && /source/i.test(key) && /^https?:\/\//.test(val)) {
      // Auto-derive expected values only for the PRIMARY `source` (the page most
      // likely to state the headline numbers). Specialised *Source pages
      // (buyerSource, tierSource, …) rely on curated assertions to avoid false
      // "missing" flags when a sub-page doesn't repeat every figure.
      const auto = key.toLowerCase() === "source" ? autoAssertions(obj) : [];
      out.push({ platform, field: key, url: val, verifiedOn, auto });
    } else if (val && typeof val === "object") {
      scan(val, platform, verifiedOn, out);
    }
  }
}

export function getManifest(): CheckTarget[] {
  const raw: Raw[] = [];
  for (const mod of [fees, aiPricing]) {
    const record = mod as Record<string, unknown>;
    for (const [name, val] of Object.entries(record)) {
      if (val && typeof val === "object") {
        scan(val, LABEL[name] ?? prettify(name), undefined, raw);
      } else if (
        // Top-level source consts, e.g. `export const RAZORPAY_SOURCE = "…"`.
        // These live outside any object so the recursive scan misses them —
        // they're how Razorpay/Paytm/Wise/Payoneer/Walmart cite their pricing.
        typeof val === "string" &&
        /_(SOURCE|SRC)$/.test(name) &&
        /^https?:\/\//.test(val)
      ) {
        const base = name.replace(/_(SOURCE|SRC)$/, "");
        const verifiedOn = record[`${base}_VERIFIED`];
        raw.push({
          platform: LABEL[name] ?? prettify(base.toLowerCase()),
          field: name,
          url: val,
          verifiedOn: typeof verifiedOn === "string" ? verifiedOn : undefined,
          auto: [],
        });
      }
    }
  }

  // Every calculator's cited sources[] — the authoritative list of what each
  // page actually shows. Catches calcs that store rates inline in their config
  // (Shopify, App Store, Printful) rather than in fees.ts, so nothing a user
  // can click goes unwatched. Link-health + staleness only (no value to assert).
  for (const c of calculators) {
    const srcs = (c as { sources?: { url?: string }[] }).sources;
    if (!Array.isArray(srcs)) continue;
    const meta = c as { feesVerifiedOn?: string; lastUpdated?: string; title?: string };
    const verifiedOn = meta.feesVerifiedOn ?? meta.lastUpdated;
    for (const s of srcs) {
      if (s?.url && /^https?:\/\//.test(s.url)) {
        raw.push({ platform: meta.title ?? c.slug, field: `page:${c.slug}`, url: s.url, verifiedOn, auto: [] });
      }
    }
  }

  // Dedupe by URL; prefer the occurrence that carries a verifiedOn date, and
  // union the auto-derived assertions across occurrences.
  const byUrl = new Map<string, Raw>();
  for (const r of raw) {
    const prev = byUrl.get(r.url);
    if (!prev) byUrl.set(r.url, r);
    else {
      prev.auto = [...new Set([...prev.auto, ...r.auto])];
      if (!prev.verifiedOn && r.verifiedOn) prev.verifiedOn = r.verifiedOn;
    }
  }

  return [...byUrl.values()]
    .map(({ auto, ...r }) => ({
      ...r,
      // Live values from fees.ts (auto) + curated supplements for the shapes
      // auto can't format. Deduped.
      expect: [...new Set([...auto, ...(EXPECT[r.url] ?? [])])],
    }))
    .sort((a, b) => a.platform.localeCompare(b.platform) || a.url.localeCompare(b.url));
}
