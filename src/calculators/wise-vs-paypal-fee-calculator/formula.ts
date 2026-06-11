/**
 * Wise vs PayPal for international transfers — PURE.
 * Wise: an explicit fee (fixed + %) at the mid-market rate, no markup.
 * PayPal: a 5% transfer fee capped at $4.99 PLUS a ~4% FX markup baked into a
 * worse exchange rate. We compare total COST (rate-free); the higher net wins.
 */
import { roundMoney, roundTo, clamp } from "../../lib/money";
import { decideComparison } from "../../lib/compare";

export interface WisePaypalInput {
  amount: number;
  wise: { pct: number; fixed: number };
  paypal: {
    sendFeePercent: number;
    sendFeeMin: number;
    sendFeeMax: number;
    fxMarkupPercent: number;
  };
}

export interface WisePaypalResult {
  wise: { fee: number; net: number; effectiveRate: number };
  paypal: { sendFee: number; fxCost: number; fee: number; net: number; effectiveRate: number };
  winner: "wise" | "paypal" | "tie";
  savings: number;
}

export function compareWisePaypal(input: WisePaypalInput): WisePaypalResult {
  const { amount } = input;

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      wise: { fee: 0, net: 0, effectiveRate: 0 },
      paypal: { sendFee: 0, fxCost: 0, fee: 0, net: 0, effectiveRate: 0 },
      winner: "tie",
      savings: 0,
    };
  }

  const wiseFee = roundMoney(input.wise.fixed + (input.wise.pct / 100) * amount);
  const wiseNet = roundMoney(amount - wiseFee);

  const p = input.paypal;
  const sendFee = roundMoney(clamp((amount * p.sendFeePercent) / 100, p.sendFeeMin, p.sendFeeMax));
  const fxCost = roundMoney((amount * p.fxMarkupPercent) / 100);
  const ppFee = roundMoney(sendFee + fxCost);
  const ppNet = roundMoney(amount - ppFee);

  const { winner, savings } = decideComparison(
    { charge: amount, net: wiseNet },
    { charge: amount, net: ppNet },
    "charge",
  );

  return {
    wise: { fee: wiseFee, net: wiseNet, effectiveRate: roundTo((wiseFee / amount) * 100, 2) },
    paypal: { sendFee, fxCost, fee: ppFee, net: ppNet, effectiveRate: roundTo((ppFee / amount) * 100, 2) },
    winner: winner === "a" ? "wise" : winner === "b" ? "paypal" : "tie",
    savings,
  };
}
