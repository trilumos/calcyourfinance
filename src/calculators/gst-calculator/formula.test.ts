import { describe, it, expect } from "vitest";
import { computeGst } from "./formula";

describe("computeGst", () => {
  it("adds 18% GST (India standard slab)", () => {
    const r = computeGst(1000, 18, "add");
    expect(r.base).toBe(1000);
    expect(r.gstAmount).toBe(180);
    expect(r.total).toBe(1180);
  });

  it("removes 18% GST from a GST-inclusive amount", () => {
    const r = computeGst(1180, 18, "remove");
    expect(r.base).toBe(1000);
    expect(r.gstAmount).toBe(180);
    expect(r.total).toBe(1180);
  });

  it("adds 10% GST (Australia)", () => {
    const r = computeGst(200, 10, "add");
    expect(r.gstAmount).toBe(20);
    expect(r.total).toBe(220);
  });

  it("removes 5% GST (Canada / India 5% slab)", () => {
    const r = computeGst(105, 5, "remove");
    expect(r.base).toBe(100);
    expect(r.gstAmount).toBe(5);
  });

  it("zero / invalid input → zeros", () => {
    expect(computeGst(0, 18, "add").total).toBe(0);
    expect(computeGst(NaN, 18, "add").total).toBe(0);
  });
});
