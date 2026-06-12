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
  wise: { id: "wise", name: "Wise", color: "#137A52", colorDark: "#63D9A6" },
  payoneer: { id: "payoneer", name: "Payoneer", color: "#F24E00", colorDark: "#FF8A4D" },
  razorpay: { id: "razorpay", name: "Razorpay", color: "#2D6CDF", colorDark: "#6BA1FF" },
  paytm: { id: "paytm", name: "Paytm", color: "#0097D7", colorDark: "#3FD0FF" },
  paddle: { id: "paddle", name: "Paddle", color: "#A87900", colorDark: "#F2C94C" },
  lemonsqueezy: { id: "lemonsqueezy", name: "Lemon Squeezy", color: "#B08900", colorDark: "#FDE047" },
  // Deep burnt-orange — distinct from Etsy (#E0571B) and Payoneer (#F24E00).
  // Reverb's own brand palette leans toward a warm, darker orange-red.
  reverb: { id: "reverb", name: "Reverb", color: "#C2470A", colorDark: "#F06A2B" },
  // eBay's logo is multi-colour (red/blue/yellow/green). We pick ONE tasteful
  // accent — eBay blue — tuned for contrast on light; brighter for dark.
  ebay: { id: "ebay", name: "eBay", color: "#0064D2", colorDark: "#4D9BFF" },
  // Printful's brand is near-black with a charcoal/teal identity. Using a dark
  // teal that is distinct from Wise (#137A52) — recognition only, no logo.
  printful: { id: "printful", name: "Printful", color: "#0D6B74", colorDark: "#1DB8C8" },
  // Poshmark's brand is a bold rose/magenta-maroon. Tuned to a dark rose that
  // is distinct from Etsy's orange (#E0571B) and all other accents — recognition
  // only, no logo.
  poshmark: { id: "poshmark", name: "Poshmark", color: "#8B1A38", colorDark: "#D95B7F" },
};

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? platforms[id] : undefined;
}
