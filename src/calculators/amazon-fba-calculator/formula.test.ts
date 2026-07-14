import { describe, it, expect } from "vitest";
import {
  computeAmazonFba,
  computeAmazonReferral,
  fbaFulfilmentFee,
  fbaPriceBandIndex,
} from "./formula";
import { amazonFees } from "../../config/fees";

const cat = (id: string) => {
  const c = amazonFees.categories.find((x) => x.id === id);
  if (!c) throw new Error(`missing category ${id}`);
  return c;
};

const REFERRAL_MIN = amazonFees.referralMinimum;
const CLOSING = amazonFees.mediaClosingFee;
const BANDS = amazonFees.fba.priceBands;
const SMALL = amazonFees.fba.smallStandard;
const LARGE = amazonFees.fba.largeStandard;

describe("computeAmazonReferral", () => {
  it("flat 15% on 'most categories'", () => {
    const r = computeAmazonReferral(25, cat("most"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(3.75); // 15% × 25
    expect(r.closingFee).toBe(0);
  });

  it("flat 8% on Consumer Electronics", () => {
    const r = computeAmazonReferral(100, cat("electronics"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(8); // 8% × 100
  });

  it("per-item $0.30 minimum applies on tiny sales", () => {
    // 15% × $1.50 = $0.225, below the $0.30 minimum → charged $0.30.
    const r = computeAmazonReferral(1.5, cat("most"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(0.3);
  });

  it("marginal jewelry tier: 20% to $250, then 5% above", () => {
    // $400 → 250×20% + 150×5% = 50 + 7.50 = 57.50 (vs flat 20% = $80).
    const r = computeAmazonReferral(400, cat("jewelry"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(57.5);
  });

  it("marginal watches tier: 16% to $1,500, then 3% above", () => {
    // $2,000 → 1500×16% + 500×3% = 240 + 15 = 255.
    const r = computeAmazonReferral(2000, cat("watches"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(255);
  });

  it("marginal furniture tier: 15% to $200, then 10% above", () => {
    // $500 → 200×15% + 300×10% = 30 + 30 = 60.
    const r = computeAmazonReferral(500, cat("furniture"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(60);
  });

  it("banded clothing: whole price uses the band's rate", () => {
    expect(computeAmazonReferral(12, cat("clothing"), REFERRAL_MIN, CLOSING).referralFee).toBe(0.6); // ≤$15 → 5%
    expect(computeAmazonReferral(18, cat("clothing"), REFERRAL_MIN, CLOSING).referralFee).toBe(1.8); // $15–$20 → 10%
    expect(computeAmazonReferral(30, cat("clothing"), REFERRAL_MIN, CLOSING).referralFee).toBe(5.1); // >$20 → 17%
  });

  it("banded clothing boundary: exactly $15 and $20 use the lower band", () => {
    expect(computeAmazonReferral(15, cat("clothing"), REFERRAL_MIN, CLOSING).referralFee).toBe(0.75); // 5% × 15
    expect(computeAmazonReferral(20, cat("clothing"), REFERRAL_MIN, CLOSING).referralFee).toBe(2); // 10% × 20
  });

  it("banded baby: 8% up to $10, 15% above", () => {
    expect(computeAmazonReferral(10, cat("baby"), REFERRAL_MIN, CLOSING).referralFee).toBe(0.8); // 8% × 10
    expect(computeAmazonReferral(30, cat("baby"), REFERRAL_MIN, CLOSING).referralFee).toBe(4.5); // 15% × 30
  });

  it("media adds the $1.80 closing fee on top of 15% referral", () => {
    const r = computeAmazonReferral(20, cat("media"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(3); // 15% × 20
    expect(r.closingFee).toBe(1.8);
  });

  it("zero price → no fees", () => {
    const r = computeAmazonReferral(0, cat("most"), REFERRAL_MIN, CLOSING);
    expect(r.referralFee).toBe(0);
    expect(r.closingFee).toBe(0);
  });
});

describe("fbaPriceBandIndex", () => {
  it("splits under $10 / $10–$50 / over $50", () => {
    expect(fbaPriceBandIndex(9.99, BANDS)).toBe(0);
    expect(fbaPriceBandIndex(10, BANDS)).toBe(1);
    expect(fbaPriceBandIndex(50, BANDS)).toBe(1);
    expect(fbaPriceBandIndex(50.01, BANDS)).toBe(2);
  });
});

describe("fbaFulfilmentFee (rate-card lookup)", () => {
  it("small standard 12 oz, $10–$50 band = $3.78", () => {
    expect(fbaFulfilmentFee(SMALL, 12, 1)).toBe(3.78);
  });

  it("small standard 4 oz, under-$10 band = $2.49", () => {
    expect(fbaFulfilmentFee(SMALL, 4, 0)).toBe(2.49);
  });

  it("large standard 12 oz, $10–$50 band = $4.20", () => {
    expect(fbaFulfilmentFee(LARGE, 12, 1)).toBe(4.2);
  });

  it("large standard 3+ lb open band adds $0.08 per 4 oz above 48 oz", () => {
    // 3.5 lb = 56 oz, over-$50 band. base $7.23 + ceil((56-48)/4)=2 × $0.08 = $7.39.
    expect(fbaFulfilmentFee(LARGE, 56, 2)).toBe(7.39);
    // just over 3 lb = 49 oz, $10–$50 band. base $6.97 + ceil((49-48)/4)=1 × $0.08 = $7.05.
    expect(fbaFulfilmentFee(LARGE, 49, 1)).toBe(7.05);
    // exactly 3 lb = 48 oz belongs to the "2.75–3 lb" row (NOT the open band) = $6.67 mid.
    expect(fbaFulfilmentFee(LARGE, 48, 1)).toBe(6.67);
  });

  it("band boundary picks the correct weight row (>8 to 12 oz)", () => {
    // Large standard: 8 oz belongs to the '≤8' row ($3.95 mid), 8.1 oz to '≤12'.
    expect(fbaFulfilmentFee(LARGE, 8, 1)).toBe(3.95);
    expect(fbaFulfilmentFee(LARGE, 8.1, 1)).toBe(4.2);
  });
});

describe("computeAmazonFba (full receipt)", () => {
  const common = {
    category: cat("most"),
    referralMinimum: REFERRAL_MIN,
    mediaClosingFee: CLOSING,
    priceBands: BANDS,
    fuelSurchargePercent: amazonFees.fba.fuelSurchargePercent,
    smallStandard: SMALL,
    largeStandard: LARGE,
  };

  it("WORKED EXAMPLE cross-checked vs Amazon's official rate card", () => {
    // $25 item, Most categories (15%), large standard, 12 oz, cost $8.
    //   Referral   = 15% × $25                = $3.75
    //   FBA base   = large-std 12 oz, $10–$50 = $4.20   (official rate card)
    //   Fuel 3.5%  = 3.5% × $4.20             = $0.15
    //   FBA fee    = $4.20 + $0.15            = $4.35
    //   Total fees = $3.75 + $4.35            = $8.10
    //   Net        = $25 − $8.10             = $16.90
    //   Profit     = $16.90 − $8.00          = $8.90  (35.6% margin)
    const r = computeAmazonFba({
      ...common,
      salePrice: 25,
      productCost: 8,
      weightOz: 12,
      sizeTier: "large",
    });
    expect(r.referralFee).toBe(3.75);
    expect(r.fbaBaseFee).toBe(4.2);
    expect(r.fuelSurcharge).toBe(0.15);
    expect(r.fbaFee).toBe(4.35);
    expect(r.totalFees).toBe(8.1);
    expect(r.netProceeds).toBe(16.9);
    expect(r.profit).toBe(8.9);
    expect(r.marginPercent).toBe(35.6);
  });

  it("small-standard under-$10 example", () => {
    // $8 item, most (15%), small standard, 4 oz.
    //   Referral = 15% × $8 = $1.20
    //   FBA base = small-std 4 oz, under $10 = $2.49
    //   Fuel     = 3.5% × 2.49 = $0.087 → $0.09
    //   Total    = 1.20 + 2.49 + 0.09 = $3.78 ; net = $4.22
    const r = computeAmazonFba({ ...common, salePrice: 8, weightOz: 4, sizeTier: "small" });
    expect(r.referralFee).toBe(1.2);
    expect(r.fbaBaseFee).toBe(2.49);
    expect(r.fuelSurcharge).toBe(0.09);
    expect(r.totalFees).toBe(3.78);
    expect(r.netProceeds).toBe(4.22);
  });

  it("includes the media closing fee in total fees", () => {
    const r = computeAmazonFba({
      ...common,
      category: cat("media"),
      salePrice: 20,
      weightOz: 8,
      sizeTier: "small",
    });
    expect(r.referralFee).toBe(3); // 15% × 20
    expect(r.closingFee).toBe(1.8);
    // fba base small-std 8 oz $10–$50 = 3.54; fuel 3.5% = 0.12; total = 3+1.8+3.54+0.12
    expect(r.fbaBaseFee).toBe(3.54);
    expect(r.totalFees).toBe(8.46);
  });

  it("optional storage fee is added when volume + rate given", () => {
    const r = computeAmazonFba({
      ...common,
      salePrice: 25,
      weightOz: 12,
      sizeTier: "large",
      storageCubicFeet: 0.5,
      storagePerCubicFoot: amazonFees.storagePerCubicFoot, // 0.87
    });
    expect(r.storageFee).toBe(0.44); // 0.5 × 0.87 = 0.435 → 0.44
  });

  it("zero sale price → all zero, no negative fees", () => {
    const r = computeAmazonFba({ ...common, salePrice: 0, weightOz: 12, sizeTier: "large" });
    expect(r.totalFees).toBe(0);
    expect(r.netProceeds).toBe(0);
    expect(r.fbaBaseFee).toBe(0);
  });
});
