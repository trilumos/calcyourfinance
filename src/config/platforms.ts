/**
 * Platform accents (PLAN: Option 2 + safe per-platform accent).
 * A small, tasteful brand-colour touch per calculator for recognition —
 * NOT a clone of the platform's site. We use the brand's accent colour on the
 * result headline + a labelled chip; no logos, no impersonation.
 */

export interface Platform {
  id: string;
  name: string;
  /** Brand accent used for the result number + chip. Tuned for contrast. */
  color: string;
  /** Optional brighter variant for dark backgrounds. */
  colorDark?: string;
}

export const platforms: Record<string, Platform> = {
  stripe: { id: "stripe", name: "Stripe", color: "#635BFF", colorDark: "#8B85FF" },
  paypal: { id: "paypal", name: "PayPal", color: "#0070E0", colorDark: "#3B9EFF" },
  etsy: { id: "etsy", name: "Etsy", color: "#E0571B", colorDark: "#FF7A3D" },
  // Deep navy (distinct from PayPal's azure) for Square, which has no strong
  // colour identity beyond black — recognition only.
  square: { id: "square", name: "Square", color: "#1351D8", colorDark: "#5C9DFF" },
  venmo: { id: "venmo", name: "Venmo", color: "#008CFF", colorDark: "#4DA8FF" },
  cashapp: { id: "cashapp", name: "Cash App", color: "#00A82D", colorDark: "#00D632" },
};

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? platforms[id] : undefined;
}
