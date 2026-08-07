import { describe, expect, it } from "vitest";
import { INDEXABLE_CALCULATORS, INDEXABLE_PAGES, isIndexable } from "./indexing";
import { calculators } from "../calculators";

describe("indexing allowlist", () => {
  // The dangerous failure: a typo'd slug silently noindexes a page AND drops it
  // from the sitemap, so the batch we're waiting on can never index.
  it("only lists slugs that exist in the registry", () => {
    const slugs = new Set(calculators.map((c) => c.slug));
    for (const slug of INDEXABLE_CALCULATORS) {
      expect(slugs, `"${slug}" is not a real calculator slug`).toContain(slug);
    }
  });

  it("allows the listed pages and holds back everything else", () => {
    for (const path of [...INDEXABLE_PAGES, ...INDEXABLE_CALCULATORS.map((s) => `/${s}`)]) {
      expect(isIndexable(path), path).toBe(true);
    }
    const heldBack = calculators
      .map((c) => `/${c.slug}`)
      .filter((p) => !INDEXABLE_CALCULATORS.includes(p.slice(1)));
    expect(heldBack.length).toBeGreaterThan(0);
    for (const path of heldBack) expect(isIndexable(path), path).toBe(false);
    expect(isIndexable("/privacy")).toBe(false);
  });
});
