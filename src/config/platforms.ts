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
  // Ko-fi's brand is a warm coral-red (#FF5E5B). The raw hex is too light for
  // text contrast on near-white at small sizes, so we tune to #D94040 for light
  // mode (sufficient contrast, still clearly warm-red). Dark mode uses a
  // brighter #FF6B6B. Distinct from Mercari (#C0392B), Depop (#E52000),
  // Poshmark (#8B1A38), TikTok (#CC2244) and Etsy (#E0571B) — recognition only.
  kofi: { id: "kofi", name: "Ko-fi", color: "#D94040", colorDark: "#FF6B6B" },
  // Buy Me a Coffee's brand is a vivid yellow (#FFDD00). Pure yellow lacks
  // contrast on near-white, so we tune to #B89A00 for light mode (dark gold
  // with sufficient contrast). Distinct from Paddle (#A87900), Lemon Squeezy
  // (#B08900), and Whatnot (#C89A00) — all existing golds/ambers. Dark mode
  // uses #FFD700 (bright gold, readable on dark) — recognition only, no logo.
  bmac: { id: "bmac", name: "Buy Me a Coffee", color: "#B89A00", colorDark: "#FFD700" },
  // Substack's brand uses a warm orange (#FF6719). The Etsy accent is #E0571B
  // (darker orange-red), Payoneer is #F24E00 (vivid orange), and Reverb is
  // #C2470A (burnt-orange). Substack's orange is lighter/more vibrant. We tune
  // to #D95C0A for light-mode contrast on near-white — clearly orange but
  // distinct from all existing warm tones. Dark mode uses #FF7A2F for brightness
  // — recognition only, no logo.
  substack: { id: "substack", name: "Substack", color: "#D95C0A", colorDark: "#FF7A2F" },
  // Gumroad's brand pink is #FF90E8 (vivid pastel pink) — too light for contrast
  // on near-white. We tune to a deeper magenta-pink #B5299A for light mode
  // (sufficient contrast on near-white while retaining the brand feel). Dark mode
  // uses #E85FD0 (bright pink, readable on dark). Distinct from Poshmark's rose
  // (#8B1A38) and TikTok's magenta (#CC2244) — recognition only, no logo.
  gumroad: { id: "gumroad", name: "Gumroad", color: "#B5299A", colorDark: "#E85FD0" },
  // Patreon's brand coral-red is #FF424D. The raw hex is too vivid/light for text
  // contrast on near-white at small sizes. We tune to #D93040 for light mode
  // (sufficient contrast, clearly warm coral-red). Dark mode uses #FF5A63
  // (bright coral, readable on dark). Distinct from Mercari (#C0392B / #FF6B5B),
  // Depop (#E52000 / #FF4D2E), Ko-fi (#D94040 / #FF6B6B), TikTok (#CC2244),
  // and Etsy (#E0571B) — recognition only, no logo.
  patreon: { id: "patreon", name: "Patreon", color: "#D93040", colorDark: "#FF5A63" },
  // Bandcamp's brand uses a teal-blue palette around #1DA0C3 / #629AA9.
  // Existing teals/blues: Printful #0D6B74 (dark teal), Vinted #00878F (mid
  // teal), Wise #137A52 (teal-green), Paytm #0097D7 (sky blue), PayPal
  // #0070E0, Square #1351D8, eBay #0064D2, Facebook #1665D8, Walmart #005BBB,
  // Razorpay #2D6CDF, Venmo #008CFF. We choose a muted steel-teal #2E7D99 for
  // light mode (distinct from all above — cooler than Paytm, greener than PayPal,
  // darker than Venmo). Dark mode uses #3DB8D8 (bright sky-teal, readable on
  // dark) — recognition only, no logo.
  bandcamp: { id: "bandcamp", name: "Bandcamp", color: "#2E7D99", colorDark: "#3DB8D8" },
  // Kajabi's brand uses a deep navy blue (#1B1B52 / #003366 in some contexts) with
  // a secondary accent of gold (#D4A017). The dominant brand impression is the deep
  // blue. Existing blues: PayPal #0070E0, Square #1351D8, eBay #0064D2, Venmo
  // #008CFF, Razorpay #2D6CDF, Facebook #1665D8, Walmart #005BBB, Paytm #0097D7.
  // We use a deep cobalt-navy #1A3A6B for light mode (clearly distinct from the
  // brighter blues above — darker and more desaturated). Dark mode uses #4A80C8
  // (mid blue, readable on dark, distinct from all existing dark-mode blues).
  // Recognition only, no logo.
  kajabi: { id: "kajabi", name: "Kajabi", color: "#1A3A6B", colorDark: "#4A80C8" },
  // Podia's brand uses a vivid purple-violet (#6C63FF). The raw purple is
  // reasonably saturated but slightly too light for reliable text contrast on
  // near-white at small sizes. We tune to #5346D6 for light mode (darker,
  // WCAG AA compliant on white). Dark mode uses #8A84FF (bright violet, readable
  // on dark). Distinct from Stripe's purple (#635BFF / #8B85FF) — lighter and
  // more blue-purple — and all other existing accents. Recognition only, no logo.
  podia: { id: "podia", name: "Podia", color: "#5346D6", colorDark: "#8A84FF" },
  // Teachable's brand uses a vivid teal-green (#35D0BA / #37D5BE). The raw teal
  // is too light for text contrast on near-white at small sizes. We tune to
  // #1A9E8E for light mode (darker teal-green, sufficient contrast on white).
  // Dark mode uses #2EC9B8 (bright teal, readable on dark). Distinct from
  // Wise (#137A52 / #63D9A6), Printful (#0D6B74), Vinted (#00878F / #2EC8D2),
  // Cash App (#00A82D), and StockX (#005A38) — recognition only, no logo.
  teachable: { id: "teachable", name: "Teachable", color: "#1A9E8E", colorDark: "#2EC9B8" },
  // Fiverr's brand green is #1DBF73 (vivid mid-green). The raw hex is too light
  // for text contrast on near-white at small sizes. We tune to #0D9E5A for light
  // mode — a deeper, richer green that passes WCAG AA on white. Dark mode uses
  // #1DBF73 directly (the actual brand hex, vivid on dark). Distinct from:
  // Wise #137A52 (darker, blue-shifted), Cash App #00A82D (more yellow-green),
  // StockX #005A38 (dark forest), Teachable #1A9E8E (teal), Vinted #00878F
  // (blue-teal). Fiverr's accent is the brightest, most vivid mid-green in the
  // palette — recognition only, no logo.
  fiverr: { id: "fiverr", name: "Fiverr", color: "#0D9E5A", colorDark: "#1DBF73" },
  // Upwork's brand green is #14A800 (pure, deep lawn green). Compared to Fiverr
  // (#0D9E5A / #1DBF73, which is a saturated mid-green shifted slightly teal),
  // Upwork's green is more purely yellow-green with no blue component. We use
  // #0E8C00 for light mode (slightly deeper for AA contrast on near-white — the
  // raw #14A800 is borderline). Dark mode uses #14A800 directly (the brand hex,
  // vibrant on dark). Clearly distinct from Fiverr (teal-shifted),
  // Cash App #00A82D (blue-shifted), Wise #137A52 (dark teal-green),
  // StockX #005A38 (near-black forest green), and Teachable #1A9E8E (teal).
  // Recognition only, no logo.
  upwork: { id: "upwork", name: "Upwork", color: "#0E8C00", colorDark: "#14A800" },
  // Printify's brand uses a deep forest green (#4FA46A / #1D8348 range). Existing
  // greens: Wise #137A52 (dark teal-green), Cash App #00A82D (yellow-green), StockX
  // #005A38 (near-black forest), Vinted #00878F (blue-teal), Teachable #1A9E8E
  // (teal), Fiverr #0D9E5A (bright mid-green), Upwork #0E8C00 (lawn-green). We
  // use a medium forest green #2E7D4F for light mode (distinct from all — more
  // muted and grey-green than Fiverr/Upwork, lighter than StockX). Dark mode uses
  // #4FA46A (the on-brand Printify green, vivid on dark) — recognition only, no logo.
  printify: { id: "printify", name: "Printify", color: "#2E7D4F", colorDark: "#4FA46A" },
  // Teespring/Spring's brand palette uses a warm coral-red to orange in some contexts
  // but is primarily identified by a clean navy/dark brand in 2024. Looking at the
  // Spring logo and UI, the dominant identifiable brand color is a warm coral-orange
  // (#F4623A in older Teespring branding). Existing warm oranges: Etsy #E0571B,
  // Payoneer #F24E00, Reverb #C2470A, Substack #D95C0A. Spring's old coral sits
  // between Etsy orange and Substack. We use #C45020 for light mode — a dark burnt
  // coral, distinct from Etsy (#E0571B, more saturated red), Substack (#D95C0A,
  // darker/browner), and Reverb (#C2470A, more brown). Dark mode uses #F4714A
  // (bright coral-orange, readable on dark) — recognition only, no logo.
  teespring: { id: "teespring", name: "Spring (Teespring)", color: "#C45020", colorDark: "#F4714A" },
  // Redbubble's brand uses a distinctive teal (#00A8A9 / #009BA4 range). Existing
  // teals/blue-greens: Printful #0D6B74 (dark teal), Vinted #00878F (mid teal),
  // Teachable #1A9E8E (teal-green), Bandcamp #2E7D99 (steel-teal), Wise #137A52
  // (teal-green). Redbubble's teal is brighter/lighter than all existing teals.
  // We tune to #007D80 for light mode (darker than Redbubble's raw #00A8A9 for
  // AA contrast on near-white; clearly blue-teal, not green-shifted like Vinted
  // #00878F or Printful #0D6B74). Dark mode uses #00C4C6 (bright aqua-teal, vivid
  // on dark, distinct from Vinted's #2EC8D2 which is more blue/cyan-shifted).
  // Recognition only, no logo.
  redbubble: { id: "redbubble", name: "Redbubble", color: "#007D80", colorDark: "#00C4C6" },
  // Amazon's brand accent is the "smile" orange #FF9900. Pure #FF9900 is too
  // light for text contrast on near-white, so we tune to a deep amber-orange
  // #C56A00 for light mode (AA on white for the large result number). Dark mode
  // uses #FF9D1C (bright Amazon orange, vivid on dark). Distinct from all the
  // existing warm tones — it is a YELLOW-orange (amber), whereas Etsy #E0571B,
  // Payoneer #F24E00, Reverb #C2470A, Substack #D95C0A and Teespring #C45020
  // are all RED-oranges; and it is more orange than the golds Whatnot #C89A00,
  // Lemon Squeezy #B08900 and Paddle #A87900. Recognition only, no logo.
  amazon: { id: "amazon", name: "Amazon", color: "#C56A00", colorDark: "#FF9D1C" },
};

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? platforms[id] : undefined;
}
