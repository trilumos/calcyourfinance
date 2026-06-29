import { describe, it, expect } from "vitest";
import { computeSalary } from "./formula";

describe("computeSalary", () => {
  it("annual 60,000 at 20% deductions", () => {
    const r = computeSalary({ amount: 60000, frequency: "annual", hoursPerWeek: 40, deductionPercent: 20 });
    expect(r.annualGross).toBe(60000);
    expect(r.deductions).toBe(12000);
    expect(r.annualNet).toBe(48000);
    expect(r.monthlyNet).toBe(4000);
    expect(r.weeklyNet).toBe(923.08);
    expect(r.hourlyGross).toBe(28.85);
    expect(r.hourlyNet).toBe(23.08);
  });

  it("hourly 25/hr at 40h/week annualises to 52,000 gross", () => {
    const r = computeSalary({ amount: 25, frequency: "hourly", hoursPerWeek: 40, deductionPercent: 0 });
    expect(r.annualGross).toBe(52000);
    expect(r.annualNet).toBe(52000);
  });

  it("monthly 5,000 → 60,000 annual gross", () => {
    const r = computeSalary({ amount: 5000, frequency: "monthly", hoursPerWeek: 40, deductionPercent: 0 });
    expect(r.annualGross).toBe(60000);
  });

  it("zero / invalid input → zeros", () => {
    expect(computeSalary({ amount: 0, frequency: "annual", hoursPerWeek: 40, deductionPercent: 20 }).annualNet).toBe(0);
  });
});
