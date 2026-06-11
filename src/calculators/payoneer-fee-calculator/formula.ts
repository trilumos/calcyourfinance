/**
 * Payoneer fee — PURE. Models the RECEIVING fee (% + fixed, by how the client
 * pays) plus an optional 0.5% balance currency conversion. Withdrawal to bank
 * (flat 1.50 same-currency, or a 1.2–4% band with conversion) is NOT computed —
 * Payoneer doesn't publish it per route, so it's explained in copy instead.
 */
import { roundMoney, roundTo } from "../../lib/money";

export interface PayoneerFeeInput {
  amount: number;
  receivePercent: number; // receiving-method %
  receiveFixed: number; // receiving-method fixed fee
  conversion?: boolean; // convert balance to another currency (0.5%)
  conversionPercent?: number; // usually 0.5
}

export interface PayoneerFeeBreakdown {
  receivingFee: number;
  conversionFee: number;
  totalFee: number;
  net: number;
  effectiveRate: number;
}

export function computePayoneerFee(input: PayoneerFeeInput): PayoneerFeeBreakdown {
  const { amount, receivePercent, receiveFixed, conversion = false, conversionPercent = 0 } = input;

  const zero: PayoneerFeeBreakdown = {
    receivingFee: 0,
    conversionFee: 0,
    totalFee: 0,
    net: 0,
    effectiveRate: 0,
  };
  if (!Number.isFinite(amount) || amount <= 0) return zero;

  const receivingFee = roundMoney((amount * receivePercent) / 100 + receiveFixed);
  const afterReceiving = amount - receivingFee;
  const conversionFee = conversion ? roundMoney((afterReceiving * conversionPercent) / 100) : 0;
  const totalFee = roundMoney(receivingFee + conversionFee);
  const net = roundMoney(amount - totalFee);
  const effectiveRate = roundTo((totalFee / amount) * 100, 2);

  return { receivingFee, conversionFee, totalFee, net, effectiveRate };
}
