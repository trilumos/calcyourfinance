import type {
  CalculatorConfig,
  InputValues,
  ComputeCtx,
  CalcResult,
} from "../_types";
import type { CountryCode } from "../../lib/countries";
import { computeGst } from "./formula";

const BROAD_COUNTRIES: CountryCode[] = [
  "IN", "AU", "NZ", "SG", "CA", "MY", "AE", "ZA", "GB", "US",
  "IE", "DE", "FR", "ES", "IT", "NL",
];

export const gstCalculator: CalculatorConfig = {
  slug: "gst-calculator",
  kind: "single",
  category: "personal-finance",

  title: "GST Calculator — Add or Remove GST",
  metaDescription:
    "Free GST calculator — add GST to a price or remove GST from a GST-inclusive amount. Supports India GST slabs (5%, 12%, 18%, 28%), Australia 10%, New Zealand 15%, Singapore 9%, and Canada 5%.",
  h1: "GST Calculator.",
  intro:
    "Add GST to a price or work out the GST already included in an amount. Pick your GST rate, enter the amount, and choose whether to add GST on top or strip it out — the calculator shows the base price, the GST, and the total.",

  keywords: {
    primary: "gst calculator",
    secondary: [
      "gst calculator india",
      "add gst calculator",
      "reverse gst calculator",
      "gst inclusive calculator",
      "gst tax calculator",
    ],
    longTail: [
      "how to calculate gst",
      "gst calculator 18 percent",
      "remove gst from total",
      "gst calculator australia",
      "gst calculator new zealand",
      "gst calculator singapore",
      "how to remove gst from a price",
      "gst amount calculator",
    ],
    competition: "H",
    estVolume: 165000,
    intent: "tool",
  },

  countries: {
    supported: BROAD_COUNTRIES,
    default: "IN",
  },

  inputs: [
    {
      id: "amount",
      label: "Amount",
      type: "currency",
      default: 1000,
      min: 0,
      help: "In 'Add GST' mode this is the price before GST; in 'Remove GST' mode it is the GST-inclusive total.",
    },
    {
      id: "mode",
      label: "What do you want to do?",
      type: "select",
      default: "add",
      options: [
        { value: "add", label: "Add GST (amount is exclusive of GST)" },
        { value: "remove", label: "Remove GST (amount includes GST)" },
      ],
    },
    {
      id: "rate",
      label: "GST rate",
      type: "select",
      default: "18",
      options: [
        { value: "5", label: "5% — India slab / Canada GST" },
        { value: "9", label: "9% — Singapore GST" },
        { value: "10", label: "10% — Australia GST" },
        { value: "12", label: "12% — India slab" },
        { value: "15", label: "15% — New Zealand GST" },
        { value: "18", label: "18% — India standard slab" },
        { value: "28", label: "28% — India luxury slab" },
      ],
      help: "Pick the GST rate that applies. India uses multiple slabs; most other countries use a single rate.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const amount = Math.max(0, Number(values.amount) || 0);
    const rate = Number(values.rate) || 0;
    const mode = values.mode === "remove" ? "remove" : "add";

    const r = computeGst(amount, rate, mode);

    return {
      headline: {
        label: mode === "add" ? "Total (incl. GST)" : "Price (excl. GST)",
        display: ctx.formatCurrency(mode === "add" ? r.total : r.base),
        sub: `${ctx.formatCurrency(r.gstAmount)} GST at ${rate}%`,
      },
      rows: [
        { label: "Base amount (excl. GST)", display: ctx.formatCurrency(r.base), kind: "default" },
        { label: `GST (${rate}%)`, display: ctx.formatCurrency(r.gstAmount), kind: "net" },
        { label: "Total (incl. GST)", display: ctx.formatCurrency(r.total), kind: "net" },
      ],
    };
  },

  howItWorks:
    "GST (Goods and Services Tax) is a consumption tax added to the price of most goods and services. This calculator does two jobs. To ADD GST, it multiplies your amount by the rate: GST = amount × rate%, and the total = amount + GST. To REMOVE GST from a GST-inclusive price, it works backwards: base = amount ÷ (1 + rate%), and GST = amount − base.\n\nFor example, on a ₹1,000 product at 18% GST, the GST is ₹180 and the total is ₹1,180. Going the other way, if a bill shows ₹1,180 inclusive of 18% GST, the base price is ₹1,180 ÷ 1.18 = ₹1,000 and the GST component is ₹180.\n\nIndia uses several GST slabs — 5%, 12%, 18% (the standard rate for most goods and services) and 28% (luxury and sin goods). Other countries use a single GST rate: Australia 10%, New Zealand 15%, Singapore 9%, and Canada 5% (federal GST, before any provincial tax). Pick the rate that applies to your transaction.",

  seoContent: `A GST calculator adds Goods and Services Tax to a price or removes it from a GST-inclusive amount. Whether you are a business issuing an invoice, a shopper checking a bill, or an accountant reconciling figures, this tool gives you the base price, the GST amount, and the total in one step.

## How to add GST

To add GST to a pre-tax price, multiply the amount by the GST rate and add it on:

- GST amount = price × (rate ÷ 100)
- Total = price + GST amount

Example: a 1,000 product at 18% GST → GST = 1,000 × 0.18 = 180, total = 1,180.

## How to remove GST (reverse GST)

If you have a GST-inclusive total and need to find the original price and the GST inside it, you divide rather than multiply:

- Base price = total ÷ (1 + rate ÷ 100)
- GST amount = total − base price

Example: a 1,180 total that includes 18% GST → base = 1,180 ÷ 1.18 = 1,000, GST = 180. A common mistake is to subtract 18% of the total (which would wrongly give 1,180 − 212.40 = 967.60). Always divide by 1.18, not subtract 18%, to reverse GST correctly.

## India GST slabs

India's GST is a multi-slab system. The main rates are:

- **5%** — essential goods, transport, small restaurants, and many daily-use items
- **12%** — processed foods, business-class air travel, and certain goods
- **18%** — the standard rate for most goods and services, including electronics, services, and restaurants
- **28%** — luxury and "sin" goods such as cars, tobacco, and aerated drinks (sometimes with an additional cess)

If you are unsure which slab applies, 18% is the most common for general goods and services. Select the correct slab above for your specific item.

## GST rates in other countries

GST is used in several countries, usually at a single rate rather than India's slabs:

- **Australia:** 10% GST on most goods and services
- **New Zealand:** 15% GST
- **Singapore:** 9% GST (raised from 8% in 2024)
- **Canada:** 5% federal GST (provinces may add PST or combine into HST)

The United Kingdom and the European Union use **VAT** (Value Added Tax) rather than GST — the maths is identical, so you can use this calculator with your VAT rate (for example, 20% in the UK). The United States uses **sales tax**, which is added at the point of sale and varies by state and city; again, the add/remove maths is the same.

## CGST, SGST and IGST (India)

In India, GST on an intra-state sale is split into **CGST** (Central GST) and **SGST** (State GST), each half of the total rate — so 18% GST is 9% CGST + 9% SGST. On an inter-state sale, the full rate is charged as **IGST** (Integrated GST). The total tax is the same either way; only the split differs. This calculator shows the total GST; for a tax invoice you would divide an intra-state figure equally into CGST and SGST.

## Who uses a GST calculator

Businesses use it to price products correctly and to issue compliant invoices. Shoppers use the reverse mode to see how much tax is baked into a price. Freelancers and consultants use it to add GST to their fees. Accountants use it to reconcile GST-inclusive and exclusive figures during bookkeeping and return filing.

## Assumptions and limitations

This calculator applies a single GST rate to the whole amount. It does not handle mixed-rate invoices (different items at different slabs), exemptions, input tax credits, reverse-charge mechanism, or any cess on top of the headline rate. For a tax invoice or a GST return, confirm the correct slab for each line item and follow your jurisdiction's filing rules. Currency display adjusts to your selected country; the percentage maths is the same everywhere.`,

  workedExample: {
    scenario: "Adding 18% GST to a 1,000 product, then removing it from the 1,180 total.",
    steps: [
      { label: "Base price", value: "1,000" },
      { label: "GST at 18% (1,000 × 0.18)", value: "180" },
      { label: "Total (1,000 + 180)", value: "1,180" },
      { label: "Reverse: base = 1,180 ÷ 1.18", value: "1,000" },
      { label: "Reverse: GST = 1,180 − 1,000", value: "180" },
    ],
    result: "Adding 18% GST to 1,000 gives a total of 1,180 (180 GST). Reversing it correctly divides by 1.18 — not subtracting 18% — to recover the 1,000 base and 180 GST.",
  },

  faqs: [
    {
      q: "How do I calculate GST on an amount?",
      a: "Multiply the amount by the GST rate as a decimal. For 18% GST on 1,000: GST = 1,000 × 0.18 = 180, and the total is 1,180. Select 'Add GST', enter your amount, and pick the rate to see it instantly.",
    },
    {
      q: "How do I remove GST from a total?",
      a: "Divide the GST-inclusive total by (1 + rate). For 18% GST: base = total ÷ 1.18. On a 1,180 inclusive total, the base is 1,000 and the GST is 180. Do not subtract 18% of the total — that gives the wrong answer. Use 'Remove GST' mode for this.",
    },
    {
      q: "What are the GST slabs in India?",
      a: "India has GST slabs of 5%, 12%, 18%, and 28%, plus 0% for exempt items. 18% is the standard rate for most goods and services; 28% applies to luxury and sin goods. Select the slab that applies to your item.",
    },
    {
      q: "What is the GST rate in Australia, New Zealand, Singapore and Canada?",
      a: "Australia charges 10% GST, New Zealand 15%, Singapore 9% (from 2024), and Canada 5% federal GST (provinces may add their own tax). Pick the matching rate in the calculator — the add/remove maths is identical across countries.",
    },
    {
      q: "What is the difference between CGST, SGST and IGST?",
      a: "On a sale within an Indian state, GST is split equally into CGST (central) and SGST (state) — so 18% is 9% + 9%. On an inter-state sale, the full rate is charged as IGST. The total tax is the same; this calculator shows the total, which you can split equally for an intra-state invoice.",
    },
    {
      q: "Can I use this for VAT or sales tax?",
      a: "Yes. VAT (used in the UK and EU) works exactly like GST — enter your VAT rate (e.g. 20% for the UK) and use add or remove mode. US sales tax is also a simple percentage added to the price, so the same maths applies.",
    },
  ],

  related: ["salary-calculator", "percentage-calculator", "loan-calculator"],

  sources: [
    {
      label: "Goods and Services Tax (GST) — Government of India",
      url: "https://www.gst.gov.in/",
    },
  ],

  feesVerifiedOn: "2026-06-15",
  lastUpdated: "2026-06-15",
};
