/**
 * Builders that turn the country-keyed fee data in config/fees.ts into
 * display-ready "rate cards" (one per country). Kept here so a fee change in
 * fees.ts automatically updates the on-page rate cards too.
 */
import { getCountry, type CountryCode } from "./countries";
import { roundTo } from "./money";
import { stripeFees, etsyFees, paypalFees, squareFees, ebayFees, poshmarkFees, vintedFees } from "../config/fees";
import type { RateCard } from "../calculators/_types";

/** Format a fixed fee in a country's own currency (e.g. "$0.30", "£0.20"). */
function fixed(amount: number, code: CountryCode): string {
  const c = getCountry(code);
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** "2.9% + $0.30", or just "2%" when there is no fixed fee. */
function pctPlusFixed(percent: number, fix: number, code: CountryCode): string {
  return fix > 0 ? `${percent}% + ${fixed(fix, code)}` : `${percent}%`;
}

const PAYPAL_LABEL: Record<string, string> = {
  goods: "Goods & Services",
  checkout: "Checkout",
  micro: "Micropayments",
};

export function stripeRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = stripeFees[code];
      if (!f) return null;
      const intlPct = roundTo(f.percent + (f.intlSurchargePercent ?? 0), 2);
      return {
        code,
        name: getCountry(code).name,
        rows: [
          { label: "Domestic", value: pctPlusFixed(f.percent, f.fixed, code) },
          { label: "International", value: pctPlusFixed(intlPct, f.fixed, code) },
        ],
        note: f.taxOnFeePercent
          ? `+${f.taxOnFeePercent}% ${f.taxLabel ?? "tax"} on fees`
          : undefined,
      };
    })
    .filter((c): c is RateCard => c !== null);
}

export function etsyRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = etsyFees[code];
      if (!f) return null;
      const rows = [
        { label: "Listing", value: fixed(f.listingFee, code) },
        { label: "Transaction", value: `${f.transactionPercent}%` },
        {
          label: "Processing",
          value: pctPlusFixed(f.processing.percent, f.processing.fixed, code),
        },
      ];
      if (f.regulatoryPercent) {
        rows.push({ label: "Regulatory", value: `${f.regulatoryPercent}%` });
      }
      return { code, name: getCountry(code).name, rows };
    })
    .filter((c): c is RateCard => c !== null);
}

const SQUARE_LABEL: Record<string, string> = {
  online: "Online",
  inperson: "In person",
  keyed: "Keyed",
};

export function squareRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = squareFees[code];
      if (!f) return null;
      const noteParts: string[] = [];
      if (f.intlSurchargePercent > 0) noteParts.push(`+${f.intlSurchargePercent}% foreign card (online)`);
      if (f.taxOnFeePercent) noteParts.push(`+${f.taxOnFeePercent}% ${f.taxLabel ?? "tax"} on fees`);
      return {
        code,
        name: getCountry(code).name,
        rows: f.variants.map((v) => ({
          label: SQUARE_LABEL[v.id] ?? v.label,
          value: pctPlusFixed(v.percent, v.fixed, code),
        })),
        note: noteParts.join(" · ") || undefined,
      };
    })
    .filter((c): c is RateCard => c !== null);
}

export function ebayRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = ebayFees[code];
      if (!f) return null;
      const most = f.categories[0];
      const tier =
        most.tierPercent != null && most.tierBreakpoint != null
          ? ` (to ${fixed(most.tierBreakpoint, code)}), then ${most.tierPercent}%`
          : "";
      const rows = [
        { label: "Most categories", value: `${most.percent}%${tier}` },
        {
          label: "Per-order fee",
          value: `${fixed(f.perOrder.low, code)} / ${fixed(f.perOrder.high, code)}`,
        },
        { label: "International", value: `+${f.internationalPercent}%` },
      ];
      if (f.regulatoryPercent) rows.push({ label: "Regulatory fee", value: `${f.regulatoryPercent}%` });
      if (f.fvfCap) rows.push({ label: "Fee cap / item", value: fixed(f.fvfCap, code) });

      const noteParts: string[] = [];
      if (f.privateSellerFree) noteParts.push("Private sellers pay £0 (buyer pays Buyer Protection)");
      if (f.taxOnFeePercent) noteParts.push(`+${f.taxOnFeePercent}% ${f.taxLabel ?? "VAT"} on fees`);
      return {
        code,
        name: getCountry(code).name,
        rows,
        note: noteParts.join(" · ") || undefined,
      };
    })
    .filter((c): c is RateCard => c !== null);
}

export function poshmarkRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = poshmarkFees[code];
      if (!f) return null;
      return {
        code,
        name: getCountry(code).name,
        rows: [
          {
            label: `Under ${fixed(f.threshold, code)}`,
            value: `${fixed(f.flatFee, code)} flat`,
          },
          {
            label: `${fixed(f.threshold, code)} and above`,
            value: `${f.percent}%`,
          },
        ],
        note: "Fee on sale price only; buyer pays shipping separately.",
      };
    })
    .filter((c): c is RateCard => c !== null);
}

export function vintedRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = vintedFees[code];
      if (!f) return null;
      const standardRate = `${pctPlusFixed(f.buyerProtectionPercent, f.buyerProtectionFixed, code)}`;
      const rows = [
        { label: "Seller fee", value: "None — sellers keep 100%" },
        {
          label: `Buyer Protection (under ${fixed(f.highValueThreshold, code)})`,
          value: standardRate,
        },
        {
          label: `Buyer Protection (${fixed(f.highValueThreshold, code)} and above)`,
          value: `${f.highValuePercent}%`,
        },
      ];
      return {
        code,
        name: getCountry(code).name,
        rows,
        note: f.dynamic
          ? "Fee is dynamic on this market — shown rate is representative."
          : undefined,
      };
    })
    .filter((c): c is RateCard => c !== null);
}

export function paypalRateCards(codes: CountryCode[]): RateCard[] {
  return codes
    .map((code): RateCard | null => {
      const f = paypalFees[code];
      if (!f) return null;
      return {
        code,
        name: getCountry(code).name,
        rows: f.variants.map((v) => ({
          label: PAYPAL_LABEL[v.id] ?? v.label,
          value: pctPlusFixed(v.percent, v.fixed, code),
        })),
        note: `+${f.crossBorderPercent}% cross-border`,
      };
    })
    .filter((c): c is RateCard => c !== null);
}
