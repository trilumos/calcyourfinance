/**
 * Stripe vs PayPal comparison — PURE. Adds NO new fee arithmetic: it composes
 * the two already-unit-tested formulas and decides the verdict.
 *
 *   charge mode → both keep a cut of the same charge; the HIGHER net wins.
 *   net mode    → both gross up to the same take-home; the LOWER charge wins.
 *
 * A difference that rounds to zero is a tie (no misleading "cheaper by $0.00").
 */
import { roundMoney } from "../../lib/money";
import { computeStripeFee, type StripeFeeBreakdown } from "../stripe-fee-calculator/formula";
import { computePayPalFee, type PayPalFeeBreakdown } from "../paypal-fee-calculator/formula";

export interface CompareInput {
  amount: number;
  mode: "charge" | "net";
  international?: boolean;
  conversion?: boolean;
  stripe: {
    percent: number;
    fixed: number;
    intlSurcharge?: number;
    fxPercent?: number;
    taxOnFeePercent?: number;
  };
  paypal: {
    percent: number;
    fixed: number;
    crossBorderPercent?: number;
    /** Full conversion %; applied only when `conversion` is true. */
    conversionPercent?: number;
  };
}

export interface CompareResult {
  stripe: StripeFeeBreakdown;
  paypal: PayPalFeeBreakdown;
  winner: "stripe" | "paypal" | "tie";
  /** Absolute gap in the decisive metric (net in charge mode, charge in net mode). */
  savings: number;
}

export function compareFees(input: CompareInput): CompareResult {
  const { amount, mode, international = false, conversion = false } = input;

  const stripe = computeStripeFee({
    amount,
    mode,
    percent: input.stripe.percent,
    fixed: input.stripe.fixed,
    intlSurcharge: input.stripe.intlSurcharge,
    fxPercent: input.stripe.fxPercent,
    taxOnFeePercent: input.stripe.taxOnFeePercent,
    international,
    conversion,
  });

  const paypal = computePayPalFee({
    amount,
    mode,
    percent: input.paypal.percent,
    fixed: input.paypal.fixed,
    crossBorderPercent: input.paypal.crossBorderPercent,
    conversionPercent: conversion ? input.paypal.conversionPercent ?? 0 : 0,
    international,
  });

  const stripeMetric = mode === "net" ? stripe.charge : stripe.net;
  const paypalMetric = mode === "net" ? paypal.charge : paypal.net;
  const savings = roundMoney(Math.abs(stripeMetric - paypalMetric));

  let winner: CompareResult["winner"];
  if (savings === 0) {
    winner = "tie";
  } else if (mode === "net") {
    winner = stripeMetric < paypalMetric ? "stripe" : "paypal";
  } else {
    winner = stripeMetric > paypalMetric ? "stripe" : "paypal";
  }

  return { stripe, paypal, winner, savings };
}
