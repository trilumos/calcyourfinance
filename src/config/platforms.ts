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
  // Mercari's brand uses a deep red-coral. Tuned to be distinct from Etsy's
  // orange (#E0571B), Reverb's burnt-orange (#C2470A), and Poshmark's rose
  // (#8B1A38) — recognition only, no logo.
  mercari: { id: "mercari", name: "Mercari", color: "#C0392B", colorDark: "#FF6B5B" },
  // Depop's brand is a bold electric red (#FF2300). Tuned to #E52000 for
  // light-mode contrast on near-white — still clearly a vivid red but avoids
  // the harshness of pure #FF2300. Distinct from Mercari's coral (#C0392B),
  // Poshmark's rose (#8B1A38), Etsy's orange (#E0571B), and Reverb's
  // burnt-orange (#C2470A) — recognition only, no logo.
  depop: { id: "depop", name: "Depop", color: "#E52000", colorDark: "#FF4D2E" },
  // Vinted's brand uses a teal-green (#007782). Printful already uses #0D6B74
  // (dark teal), so Vinted's accent is tuned to a lighter, brighter teal-green
  // (#00878F for light, #2EC8D2 for dark) — clearly distinct from Printful,
  // Wise (#137A52 / #63D9A6), and Cash App (#00A82D) — recognition only.
  vinted: { id: "vinted", name: "Vinted", color: "#00878F", colorDark: "#2EC8D2" },
  // StockX's brand green is #006340 (dark forest green). Tuned to a slightly
  // brighter #005A38 for light mode (sufficient contrast on near-white), and a
  // vivid #00A86B for dark mode — clearly distinct from Wise (#137A52 / #63D9A6),
  // Cash App (#00A82D / #00D632), Printful (#0D6B74), and Vinted (#00878F).
  stockx: { id: "stockx", name: "StockX", color: "#005A38", colorDark: "#00A86B" },
  // TikTok's two brand colours are cyan #25F4EE and magenta #FE2C55 on black.
  // The magenta is chosen as the accent (more recognisable, higher contrast on
  // near-white). Tuned to #CC2244 for light-mode legibility (the raw #FE2C55
  // is too light at small sizes on white). For dark mode, the saturated #FE2C55
  // is used directly. Clearly distinct from all existing reds/pinks:
  // Mercari #C0392B, Depop #E52000, Poshmark #8B1A38, Etsy #E0571B.
  tiktokshop: { id: "tiktokshop", name: "TikTok Shop", color: "#CC2244", colorDark: "#FE2C55" },
  // Whatnot's brand uses a vivid yellow/gold (#FFDE00). The pure yellow is too
  // light for text contrast on near-white, so we use a tuned darker gold
  // #C89A00 for light mode (sufficient contrast) and bright #FFDE00 for dark.
  // Clearly distinct from Paddle's amber (#A87900) and Lemon Squeezy's gold
  // (#B08900) — recognition only, no logo.
  whatnot: { id: "whatnot", name: "Whatnot", color: "#C89A00", colorDark: "#FFDE00" },
  // Facebook/Meta's brand blue is #1877F2. Tuned to #1665D8 for light-mode
  // contrast on near-white (slightly darker). Clearly distinct from PayPal
  // (#0070E0), Square (#1351D8), eBay (#0064D2), Venmo (#008CFF), and
  // Razorpay (#2D6CDF) — recognition only, no logo.
  facebook: { id: "facebook", name: "Facebook Marketplace", color: "#1665D8", colorDark: "#4D9BFF" },
  // Walmart's brand blue is #0071DC (the "Walmart blue" from the spark logo).
  // All existing blues: PayPal #0070E0, Square #1351D8, eBay #0064D2,
  // Venmo #008CFF, Razorpay #2D6CDF, Facebook #1665D8, Paytm #0097D7.
  // Walmart blue is very close to PayPal; we use a slightly saturated
  // deeper blue #005BBB for light-mode legibility (sufficient contrast on
  // near-white), distinct from all existing blues. Dark mode uses #0071DC
  // directly (the actual brand hex, vivid on dark) — recognition only, no logo.
  walmart: { id: "walmart", name: "Walmart Marketplace", color: "#005BBB", colorDark: "#0071DC" },
};

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? platforms[id] : undefined;
}
