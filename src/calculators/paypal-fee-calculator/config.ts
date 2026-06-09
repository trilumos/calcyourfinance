import type { CalculatorConfig, InputValues, ComputeCtx, CalcResult } from "../_types";
import { paypalFees } from "../../config/fees";
import { paypalRateCards } from "../../lib/rateCards";
import { computePayPalFee } from "./formula";

export const paypalFeeCalculator: CalculatorConfig = {
  slug: "paypal-fee-calculator",
  kind: "single",
  category: "payment-fees",

  platform: "paypal",
  title: "PayPal Fee Calculator",
  metaDescription:
    "Free PayPal fee calculator. Calculate PayPal goods & services, checkout and micropayment fees and what you'll receive — US & UK, with international fees and a reverse mode.",
  h1: "PayPal Fee Calculator",
  intro:
    "Calculate how much PayPal charges on a payment and what you'll actually receive. Choose the transaction type, add the international surcharge, or work backwards to see what to charge so you keep a target amount after PayPal's fees.",

  // Cluster from the user's export (paypal keywords.csv), all relevant
  // fee/calculator terms vol >= 90 (currency-exchange terms excluded — that's a
  // separate converter tool, a future page).
  keywords: {
    primary: "paypal fee calculator", // 18,100
    secondary: [
      "paypal charges calculator", // 18,100
      "paypal cost calculator", // 18,100
      "paypal commission calculator", // 18,100
      "paypal price calculator", // 18,100
      "paypal rate calculator", // 18,100
      "paypal service fee calculator", // 18,100
      "estimate paypal fees", // 18,100
      "paypal fee converter", // 18,100
      "paypal calculator", // 4,400
      "paypal estimator", // 4,400
      "paypal goods and services fee calculator", // 1,600
    ],
    longTail: [
      "calculate pp fees", // 18,100
      "fee calculator for paypal", // 18,100
      "figure out paypal fees", // 18,100
      "paypal calculate fee", // 18,100
      "paypal fee cal", // 18,100
      "paypal service charge calculator", // 18,100
      "paypalcalculator", // 4,400
      "paypal g&s fee calculator", // 880
      "paypal goods and services calculator", // 880
      "goods and services paypal calculator", // 880
      "paypal gs fee calculator", // 880
      "paypal g&s calculator", // 720
      "paypal gs calculator", // 720
      "wise paypal fee calculator", // 480
      "paypal fee calculator international", // 320
      "paypal invoice fee calculator", // 260
      "paypal tax calculator", // 170
      "online paypal fee calculator", // 170
      "paypal instant transfer fee calculator", // 140
      "paypal transaction fees calculator", // 110
      "calculate paypal transaction fee", // 110
      "paypal invoice calculator", // 110
      "how much does paypal charge to receive money",
    ],
    competition: "M",
    estVolume: 18100,
    intent: "tool",
  },

  countries: { supported: ["US", "GB"], default: "US" },

  inputs: [
    {
      id: "mode",
      label: "What do you want to find?",
      type: "select",
      default: "charge",
      options: [
        { value: "charge", label: "I'm receiving this amount" },
        { value: "net", label: "I want to keep this amount" },
      ],
    },
    {
      id: "amount",
      label: "Amount",
      type: "currency",
      default: 100,
      min: 0,
      help: "The payment amount, or the amount you want to keep.",
    },
    {
      id: "txType",
      label: "Transaction type",
      type: "select",
      default: "goods",
      options: [
        { value: "goods", label: "Goods & Services (receive money)" },
        { value: "checkout", label: "PayPal Checkout / online store" },
        { value: "micro", label: "Micropayments (small sales)" },
      ],
      help: "Rates vary by product. UK uses one standard commercial rate.",
    },
    {
      id: "international",
      label: "International / cross-border payment",
      type: "toggle",
      default: false,
      help: "Sender is in another country.",
    },
  ],

  compute(values: InputValues, ctx: ComputeCtx): CalcResult {
    const country = paypalFees[ctx.country] ?? paypalFees.US!;
    const variant =
      country.variants.find((v) => v.id === values.txType) ?? country.variants[0];

    const r = computePayPalFee({
      amount: Number(values.amount) || 0,
      mode: values.mode === "net" ? "net" : "charge",
      percent: variant.percent,
      fixed: variant.fixed,
      crossBorderPercent: country.crossBorderPercent,
      international: Boolean(values.international),
    });

    return {
      headline: {
        label: "You receive",
        display: ctx.formatCurrency(r.net),
        sub: `Effective fee ${ctx.formatPercent(r.effectiveRate)} of the payment`,
      },
      rows: [
        { label: "Payment amount", display: ctx.formatCurrency(r.charge) },
        {
          label: `PayPal fee (${ctx.formatPercent(variant.percent)} + ${ctx.formatCurrency(variant.fixed)})`,
          display: ctx.formatCurrency(r.feeAmount),
          kind: "deduction",
          hint: r.ratePercent !== variant.percent ? `${ctx.formatPercent(r.ratePercent)} with cross-border` : undefined,
        },
        { label: "You receive", display: ctx.formatCurrency(r.net), kind: "net" },
      ],
    };
  },

  howItWorks:
    "PayPal charges a percentage of the payment plus a small fixed fee on every commercial transaction. The percentage depends on the product: in the US, receiving money for goods & services is 2.99% + $0.49, PayPal Checkout is 3.49% + $0.49, and micropayments are 4.99% + $0.09. In the UK the standard commercial rate is 2.9% + £0.30.\n\nThe fee is: amount × rate% + fixed fee. International (cross-border) payments add a surcharge — about +1.5% in the US and +1.29%/+1.99% in the UK depending on where the sender is. To find what to ask for so you keep a target amount, we gross it up: charge = (target + fixed) ÷ (1 − rate).\n\nThese are PayPal's published standard rates; some accounts qualify for different pricing, and currency conversion can add a further fee.",

  seoContent: `Our PayPal fee calculator is a free, instant tool that tells you exactly how much PayPal takes from a payment and how much you actually keep. PayPal is one of the most widely used ways to get paid online, but its fee structure is genuinely confusing — the rate depends on the type of transaction, where the sender is located, and which country you receive money in. This calculator removes the guesswork: choose your transaction type, enter the amount, and see your net payout and the effective fee instantly.

## Understanding PayPal's transaction types
The single biggest source of confusion is that PayPal charges different rates for different products. In the United States, receiving money for goods and services is 2.99% plus a $0.49 fixed fee, PayPal Checkout (the branded button on an online store) is 3.49% plus $0.49, and micropayments — a special plan for low-value sales — are 4.99% plus a smaller $0.09 fixed fee. Sending money to friends and family domestically from your balance or bank is generally free, which is why it should never be used for commercial sales. Our calculator lets you pick the exact product so the result matches what PayPal will really deduct.

## How the fee is calculated
The formula is amount × rate% + fixed fee, and your net is the amount minus that fee. Because of the fixed component, small payments are disproportionately expensive: on a $5 goods-and-services payment, the $0.49 fee is nearly 10% before the percentage is even applied — which is exactly why the micropayments plan exists. The calculator shows your effective rate so you can see the true cost. If you need to receive an exact amount after fees, switch to reverse mode and it works out what to request using charge = (target + fixed) ÷ (1 − rate).

## Cross-border and currency considerations
PayPal adds a surcharge when the buyer is in another country. In the US this cross-border fee is roughly an extra 1.5%; in the UK it is about 1.29% for senders in the EEA and 1.99% for the rest of the world, layered on top of the standard 2.9% plus 30p commercial rate. Currency conversion adds a further percentage. Toggle the international option to include the cross-border surcharge in your result. These layered fees are where sellers most often underestimate their costs, so we model them directly and cite PayPal's official merchant and business fee pages.

## Who uses this calculator
Online sellers and marketplace merchants use it to price products so they keep enough after fees. Freelancers and service providers use the reverse mode to invoice clients for the right take-home amount. Resellers on platforms that settle through PayPal use it to check margins before listing. Creators accepting tips and supporters use it to estimate how much of each contribution arrives. It runs entirely in your browser — no account, no tracking of your numbers, and it works perfectly on a phone.

## Accuracy and important caveats
We keep every rate in a dated configuration file and stamp the page with a "fees last verified" date, updating both whenever PayPal changes its pricing. Treat the results as estimates of standard published rates: your account may qualify for different pricing, and additional costs can apply, including currency-conversion spreads, chargeback and dispute fees, and the fact that the fixed fee is not always returned on refunds. Different countries also have their own rate cards, and we are expanding country coverage over time. For anything mission-critical, confirm the final number in your PayPal account — but for quick, dependable estimates of what you will actually receive, this tool gives you a clear, honest answer in seconds.`,

  rateCards: {
    heading: "PayPal fees by country",
    intro:
      "PayPal's standard commercial rates for the countries this calculator covers. Cross-border (international) payments add a surcharge on top.",
    cards: paypalRateCards(["US", "GB"]),
  },

  workedExample: {
    scenario: "A US customer sends you $100 for goods & services.",
    steps: [
      { label: "Payment amount", value: "$100.00" },
      { label: "Percentage fee (2.99%)", value: "$2.99" },
      { label: "Fixed fee", value: "$0.49" },
      { label: "Total PayPal fee", value: "$3.48" },
    ],
    result: "You receive $96.52",
  },

  faqs: [
    {
      q: "How much does PayPal charge to receive money?",
      a: "For goods & services payments in the US, PayPal charges 2.99% + $0.49. So on $100 you receive $96.52. PayPal Checkout is 3.49% + $0.49 and micropayments are 4.99% + $0.09. In the UK the standard rate is 2.9% + £0.30.",
    },
    {
      q: "How much does PayPal charge for $100?",
      a: "On a $100 US goods & services payment, PayPal's fee is 2.99% + $0.49 = $3.48, leaving you $96.52. Use the calculator above for other amounts, transaction types and countries.",
    },
    {
      q: "Is there a fee for sending PayPal to friends and family?",
      a: "Sending money to friends and family within the same country with a linked bank or PayPal balance is usually free. Fees apply to goods & services payments and to card-funded or cross-border transfers. This calculator covers commercial (goods & services) fees.",
    },
    {
      q: "How do I calculate what to charge so I receive an exact amount?",
      a: "Switch to 'I want to keep this amount.' The calculator grosses up the request using charge = (target + fixed) ÷ (1 − rate). For example, to keep $100 on a US goods & services payment you'd ask for about $103.59.",
    },
    {
      q: "Does PayPal charge extra for international payments?",
      a: "Yes. Cross-border payments add a surcharge on top of the domestic rate — roughly +1.5% in the US. Currency conversion can add a further fee. Toggle 'international' above to include the surcharge.",
    },
  ],

  related: ["stripe-fee-calculator", "etsy-fee-calculator"],

  sources: [
    { label: "PayPal — US merchant fees", url: "https://www.paypal.com/us/webapps/mpp/merchant-fees" },
    { label: "PayPal — UK business fees", url: "https://www.paypal.com/uk/business/paypal-business-fees" },
  ],

  feesVerifiedOn: "2026-06-08",
  lastUpdated: "2026-06-08",
};
