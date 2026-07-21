import { describe, it, expect } from "vitest";
import { classify, normalize, daysSince, type CheckTarget, type FetchOutcome } from "./classify";

const NOW = new Date("2026-07-21T00:00:00Z");
const target = (over: Partial<CheckTarget> = {}): CheckTarget => ({
  platform: "Stripe",
  field: "source",
  url: "https://stripe.com/pricing",
  verifiedOn: "2026-06-21",
  expect: ["2.9%", "$0.30"],
  ...over,
});

describe("normalize", () => {
  it("strips tags, scripts and collapses whitespace, lowercased", () => {
    const html = `<div>Fee is <b>2.9%</b>\n + $0.30</div><script>var x="9.9%"</script>`;
    const out = normalize(html);
    expect(out).toContain("fee is 2.9% + $0.30");
    expect(out).not.toContain("9.9%"); // script content dropped
  });
});

describe("daysSince", () => {
  it("counts whole days and handles missing/bad dates", () => {
    expect(daysSince("2026-06-21", NOW)).toBe(30);
    expect(daysSince(undefined, NOW)).toBeNull();
    expect(daysSince("not-a-date", NOW)).toBeNull();
  });
});

describe("classify", () => {
  const ok = (body: string): FetchOutcome => ({ ok: true, status: 200, body });

  it("unchanged when every expected string is present", () => {
    const r = classify(target(), ok("<p>Pricing: 2.9% + $0.30 per charge</p>"), NOW);
    expect(r.category).toBe("unchanged");
    expect(r.missing).toEqual([]);
    expect(r.daysSinceVerified).toBe(30);
  });

  it("unconfirmed when an expected value is absent, listing what's missing", () => {
    const r = classify(target(), ok("<p>Pricing: 3.4% + $0.30</p>"), NOW);
    expect(r.category).toBe("unconfirmed");
    expect(r.missing).toEqual(["2.9%"]);
  });

  it("reached-no-assertion when expect[] is empty", () => {
    const r = classify(target({ expect: [] }), ok("<p>anything</p>"), NOW);
    expect(r.category).toBe("reached-no-assertion");
  });

  it("blocked on 403/401/429 (Cloudflare/WAF)", () => {
    for (const status of [401, 403, 429]) {
      expect(classify(target(), { ok: false, status }, NOW).category).toBe("blocked");
    }
  });

  it("dead on 404/410", () => {
    expect(classify(target(), { ok: false, status: 404 }, NOW).category).toBe("dead");
    expect(classify(target(), { ok: false, status: 410 }, NOW).category).toBe("dead");
  });

  it("unreachable on network error (status 0)", () => {
    const r = classify(target(), { ok: false, status: 0, error: "timeout" }, NOW);
    expect(r.category).toBe("unreachable");
  });

  it("http-error on other 5xx/4xx", () => {
    expect(classify(target(), { ok: false, status: 500 }, NOW).category).toBe("http-error");
  });

  it("value split across markup can't be confirmed (documents the ceiling)", () => {
    const r = classify(target({ expect: ["2.9%"] }), ok("<td>2.9<span>%</span></td>"), NOW);
    // The <span> splits "2.9%" so the substring isn't found — a known limit of
    // HTTP-only verification. It lands in the search-verify worklist, not an alarm.
    expect(r.category).toBe("unconfirmed");
  });
});
