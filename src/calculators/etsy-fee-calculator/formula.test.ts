import { describe, it, expect } from "vitest";
import { computeEtsyFee } from "./formula";

const US = {
  listingFee: 0.2,
  transactionPercent: 6.5,
  processingPercent: 3,
  processingFixed: 0.25,
};

describe("computeEtsyFee", () => {
  it("US: $25 item + $5 shipping → $3.30 fees, $26.70 payout", () => {
    const r = computeEtsyFee({ itemPrice: 25, shipping: 5, ...US });
    expect(r.revenue).toBe(30);
    expect(r.listingFee).toBe(0.2);
    expect(r.transactionFee).toBe(1.95); // 6.5% of 30
    expect(r.processingFee).toBe(1.15); // 3% of 30 + 0.25
    expect(r.totalFees).toBe(3.3);
    expect(r.payout).toBe(26.7);
  });

  it("transaction fee applies to item + shipping", () => {
    const noShip = computeEtsyFee({ itemPrice: 30, shipping: 0, ...US });
    const withShip = computeEtsyFee({ itemPrice: 25, shipping: 5, ...US });
    // same revenue → same transaction fee
    expect(noShip.transactionFee).toBe(withShip.transactionFee);
  });

  it("subtracts item cost to show profit", () => {
    const r = computeEtsyFee({ itemPrice: 25, shipping: 5, itemCost: 8, ...US });
    expect(r.profit).toBe(18.7); // 26.70 payout − 8 cost
  });

  it("offsite ads adds 15% of revenue", () => {
    const r = computeEtsyFee({ itemPrice: 25, shipping: 5, offsiteAds: true, ...US });
    expect(r.offsiteAdsFee).toBe(4.5); // 15% of 30
    expect(r.totalFees).toBe(7.8); // 3.30 + 4.50
  });

  it("offsite ads is capped at $100 per order", () => {
    const r = computeEtsyFee({
      itemPrice: 1000, shipping: 0, offsiteAds: true, offsiteAdsPercent: 15, offsiteAdsCap: 100, ...US,
    });
    expect(r.offsiteAdsFee).toBe(100); // 15% of 1000 = 150, capped at 100
  });

  it("high-volume sellers use the 12% offsite ads rate", () => {
    const r = computeEtsyFee({
      itemPrice: 100, shipping: 0, offsiteAds: true, offsiteAdsPercent: 12, ...US,
    });
    expect(r.offsiteAdsFee).toBe(12);
  });

  it("UK processing is 4% + £0.20", () => {
    const r = computeEtsyFee({
      itemPrice: 25, shipping: 5, listingFee: 0.2, transactionPercent: 6.5,
      processingPercent: 4, processingFixed: 0.2,
    });
    expect(r.processingFee).toBe(1.4); // 4% of 30 + 0.20
  });

  it("regulatory operating fee is applied on revenue", () => {
    const r = computeEtsyFee({ itemPrice: 25, shipping: 5, ...US, regulatoryPercent: 0.32 });
    expect(r.regulatoryFee).toBe(0.1); // 0.32% of 30 = 0.096 → 0.10
  });

  it("currency conversion fee is 2.5% of revenue", () => {
    const r = computeEtsyFee({ itemPrice: 25, shipping: 5, ...US, currencyConversionPercent: 2.5 });
    expect(r.conversionFee).toBe(0.75); // 2.5% of 30
  });

  it("zero revenue returns zeros", () => {
    const r = computeEtsyFee({ itemPrice: 0, shipping: 0, ...US });
    expect(r.payout).toBe(0);
    expect(r.totalFees).toBe(0);
  });
});
