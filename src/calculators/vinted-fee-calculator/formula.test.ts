/**
 * Vinted fee calculator tests.
 *
 * Vinted's model (ALL markets):
 *   SELLER: ZERO fees — sellers keep 100% of their listed price.
 *   BUYER:  Buyer Protection fee added at checkout (not deducted from seller).
 *
 * Buyer Protection fee formula (standard — items below high-value threshold):
 *   buyerFee = fixed + (percent/100 × itemPrice)
 *   buyerTotal = itemPrice + buyerFee
 *
 * HIGH-VALUE TIER (items at or above the threshold):
 *   buyerFee = tierPercent/100 × itemPrice   (no fixed fee)
 *   buyerTotal = itemPrice + buyerFee
 *
 * EUR markets (FR, DE, NL, BE, ES, IT, AT, IE):
 *   Standard: €0.70 + 5%  for items < €500
 *   High-value: 2%         for items ≥ €500
 *
 * GB market:
 *   Vinted's UK pricelist describes the fee as "usually 3% to 8% + £0.30 to
 *   £0.80" (dynamic/algorithmic). We model the representative rate of 5% + £0.70
 *   — consistent with the EUR equivalent — and document the dynamic nature.
 *   Standard: £0.70 + 5%  for items < £500
 *   High-value: 2%         for items ≥ £500
 *
 * PL market (PLN):
 *   Standard: PLN 2.90 + 5%  for items < PLN 2,500
 *   High-value: 2%            for items ≥ PLN 2,500
 *   (PLN threshold is approximate EUR 500 equivalent)
 *
 * Sources:
 *   https://www.vinted.com/pricelist
 *   https://www.vinted.co.uk/pricelist
 *   https://www.retailed.io/toolbox/vinted-fee-calculator (confirmed tiered EUR)
 *   https://www.newsendip.com/vinted-fine-1-2-million-in-poland-for-a-lack-of-transparency-on-its-platform/
 *   https://www.blogmode.top/frais-vinted-commission/ (FR: €0.70 + 5%)
 */

import { describe, it, expect } from "vitest";
import {
  computeVintedBuyerFee,
  computeVintedTransaction,
  type VintedMarketFees,
} from "./formula";

// ── Market fee configs used in tests ─────────────────────────────────────────

const EUR_FEES: VintedMarketFees = {
  buyerProtectionPercent: 5,
  buyerProtectionFixed: 0.7,
  highValueThreshold: 500,
  highValuePercent: 2,
};

const GB_FEES: VintedMarketFees = {
  buyerProtectionPercent: 5,
  buyerProtectionFixed: 0.7,
  highValueThreshold: 500,
  highValuePercent: 2,
};

const PL_FEES: VintedMarketFees = {
  buyerProtectionPercent: 5,
  buyerProtectionFixed: 2.9,
  highValueThreshold: 2500,
  highValuePercent: 2,
};

// ── Zero input ────────────────────────────────────────────────────────────────

describe("Vinted — zero item price returns zeros", () => {
  it("buyer fee is zero on €0 item (EUR)", () => {
    const r = computeVintedBuyerFee(0, EUR_FEES);
    expect(r.buyerFee).toBe(0);
    expect(r.buyerTotal).toBe(0);
  });

  it("seller payout is zero on €0 item", () => {
    const r = computeVintedTransaction(0, 0, EUR_FEES);
    expect(r.sellerFee).toBe(0);
    expect(r.sellerPayout).toBe(0);
  });
});

// ── Seller always keeps 100% of listed price ─────────────────────────────────
// This is the core invariant: Vinted charges sellers NOTHING.

describe("Vinted — seller keeps 100% of listed price (all markets)", () => {
  it("€20 item: seller payout = €20 (EUR market)", () => {
    const r = computeVintedTransaction(20, 0, EUR_FEES);
    expect(r.sellerFee).toBe(0);
    expect(r.sellerPayout).toBe(20);
  });

  it("£50 item: seller payout = £50 (GB market)", () => {
    const r = computeVintedTransaction(50, 0, GB_FEES);
    expect(r.sellerFee).toBe(0);
    expect(r.sellerPayout).toBe(50);
  });

  it("PLN 100 item: seller payout = PLN 100 (PL market)", () => {
    const r = computeVintedTransaction(100, 0, PL_FEES);
    expect(r.sellerFee).toBe(0);
    expect(r.sellerPayout).toBe(100);
  });

  it("€500 high-value item: seller payout = €500 (no seller fee)", () => {
    const r = computeVintedTransaction(500, 0, EUR_FEES);
    expect(r.sellerFee).toBe(0);
    expect(r.sellerPayout).toBe(500);
  });

  it("€1000 high-value item: seller payout = €1000", () => {
    const r = computeVintedTransaction(1000, 0, EUR_FEES);
    expect(r.sellerFee).toBe(0);
    expect(r.sellerPayout).toBe(1000);
  });
});

// ── EUR: standard tier (items < €500) ────────────────────────────────────────
// buyerFee = €0.70 + 5% × itemPrice
// Example: €20 item → €0.70 + €1.00 = €1.70 buyer fee → buyer pays €21.70

describe("Vinted EUR — €20 item (standard tier)", () => {
  // €0.70 + 5% × 20 = €0.70 + €1.00 = €1.70
  const r = computeVintedBuyerFee(20, EUR_FEES);

  it("buyer fee = €1.70", () => expect(r.buyerFee).toBe(1.7));
  it("buyer total = €21.70", () => expect(r.buyerTotal).toBe(21.7));
});

describe("Vinted EUR — €100 item (standard tier)", () => {
  // €0.70 + 5% × 100 = €0.70 + €5.00 = €5.70
  const r = computeVintedBuyerFee(100, EUR_FEES);

  it("buyer fee = €5.70", () => expect(r.buyerFee).toBe(5.7));
  it("buyer total = €105.70", () => expect(r.buyerTotal).toBe(105.7));
});

describe("Vinted EUR — €50 item (standard tier)", () => {
  // €0.70 + 5% × 50 = €0.70 + €2.50 = €3.20
  const r = computeVintedBuyerFee(50, EUR_FEES);

  it("buyer fee = €3.20", () => expect(r.buyerFee).toBe(3.2));
  it("buyer total = €53.20", () => expect(r.buyerTotal).toBe(53.2));
});

describe("Vinted EUR — €499.99 (just below high-value threshold, standard tier)", () => {
  // €0.70 + 5% × 499.99 = €0.70 + €25.00 = €25.70 (rounded to cents)
  const r = computeVintedBuyerFee(499.99, EUR_FEES);

  it("buyer fee = €25.70", () => expect(r.buyerFee).toBe(25.7));
});

// ── EUR: high-value tier (items ≥ €500) ──────────────────────────────────────
// buyerFee = 2% × itemPrice (no fixed fee)

describe("Vinted EUR — €500 item (high-value threshold, 2% tier)", () => {
  // 2% × €500 = €10.00
  const r = computeVintedBuyerFee(500, EUR_FEES);

  it("buyer fee = €10.00", () => expect(r.buyerFee).toBe(10));
  it("buyer total = €510.00", () => expect(r.buyerTotal).toBe(510));
});

describe("Vinted EUR — €1,000 item (high-value, 2% tier)", () => {
  // 2% × €1,000 = €20.00
  const r = computeVintedBuyerFee(1000, EUR_FEES);

  it("buyer fee = €20.00", () => expect(r.buyerFee).toBe(20));
  it("buyer total = €1,020.00", () => expect(r.buyerTotal).toBe(1020));
});

// ── GB: standard tier (items < £500) ─────────────────────────────────────────
// Representative: £0.70 + 5% × itemPrice (Vinted's actual fee is dynamic)

describe("Vinted GB — £20 item (standard tier, representative 5% + £0.70)", () => {
  // £0.70 + 5% × 20 = £0.70 + £1.00 = £1.70
  const r = computeVintedBuyerFee(20, GB_FEES);

  it("buyer fee = £1.70", () => expect(r.buyerFee).toBe(1.7));
  it("buyer total = £21.70", () => expect(r.buyerTotal).toBe(21.7));
});

describe("Vinted GB — £100 item (standard tier)", () => {
  // £0.70 + 5% × 100 = £0.70 + £5.00 = £5.70
  const r = computeVintedBuyerFee(100, GB_FEES);

  it("buyer fee = £5.70", () => expect(r.buyerFee).toBe(5.7));
  it("buyer total = £105.70", () => expect(r.buyerTotal).toBe(105.7));
});

// ── PL: standard tier (items < PLN 2500) ─────────────────────────────────────
// PLN 2.90 + 5% × itemPrice

describe("Vinted PL — PLN 100 item (standard tier)", () => {
  // PLN 2.90 + 5% × 100 = PLN 2.90 + PLN 5.00 = PLN 7.90
  const r = computeVintedBuyerFee(100, PL_FEES);

  it("buyer fee = PLN 7.90", () => expect(r.buyerFee).toBe(7.9));
  it("buyer total = PLN 107.90", () => expect(r.buyerTotal).toBe(107.9));
});

describe("Vinted PL — PLN 2,500 item (high-value threshold)", () => {
  // 2% × 2500 = PLN 50.00
  const r = computeVintedBuyerFee(2500, PL_FEES);

  it("buyer fee = PLN 50.00", () => expect(r.buyerFee).toBe(50));
  it("buyer total = PLN 2,550.00", () => expect(r.buyerTotal).toBe(2550));
});

// ── Profit: seller payout minus item cost ────────────────────────────────────

describe("Vinted — profit calculation", () => {
  it("€100 item, €60 item cost → profit = €40", () => {
    const r = computeVintedTransaction(100, 60, EUR_FEES);
    expect(r.sellerPayout).toBe(100); // seller keeps full price
    expect(r.profit).toBe(40);        // profit = payout - cost
  });

  it("£200 item, £80 cost → profit = £120", () => {
    const r = computeVintedTransaction(200, 80, GB_FEES);
    expect(r.sellerPayout).toBe(200);
    expect(r.profit).toBe(120);
  });
});

// ── Boundary: rounding correctness ───────────────────────────────────────────

describe("Vinted EUR — rounding: €33.33 item", () => {
  // €0.70 + 5% × 33.33 = €0.70 + €1.67 = €2.37 (rounded)
  // buyer total = €33.33 + €2.37 = €35.70
  const r = computeVintedBuyerFee(33.33, EUR_FEES);

  it("buyer fee = €2.37", () => expect(r.buyerFee).toBe(2.37));
  it("buyer total = €35.70", () => expect(r.buyerTotal).toBe(35.7));
});
