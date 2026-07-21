/**
 * Value assertions: url -> strings that must still appear on that page.
 * Seeded from the manual WebSearch verification of 2026-07-21. Only the
 * numbers we PUBLISH go here, and only stable ones (a bare "%" or a figure
 * that also appears elsewhere on the page is a weak signal — see classify.ts).
 *
 * Most help-centre URLs below are Cloudflare-walled and will come back
 * `blocked` from a datacenter IP; their assertions still document what the page
 * should say and run the moment the page is reachable (proxy, or a human run).
 * Assertions matter most on the main pricing domains, which usually ARE
 * reachable. A url with no entry here is link-health + staleness only.
 */
export const EXPECT: Record<string, string[]> = {
  // Redbubble (official help centre — fixed 2026-07-21)
  "https://help.redbubble.com/hc/en-us/articles/50959863016724-How-does-my-Account-Tier-determine-my-platform-fee":
    ["20%", "50%"],
  "https://help.redbubble.com/hc/en-us/articles/50959535480212-What-is-the-excess-markup-fee": [
    "50%",
  ],

  // Course / creator platforms (main pricing pages are reachable)
  "https://teachable.com/pricing": ["7.5%"],
  "https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview": ["10%"],
  "https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost": [
    "10%",
  ],
  "https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees": ["5%"],

  // Marketplaces / freelance
  "https://help.fiverr.com/hc/en-us/articles/360011028477": ["20%"],
  "https://support.upwork.com/hc/en-us/articles/211062538": ["service fee"],
  "https://support.poshmark.com/s/article/297755057": ["$2.95", "20%"],
  "https://help.reverb.com/hc/en-us/articles/40917652290843-What-fees-will-I-pay-for-selling-on-Reverb":
    ["5%"],
  "https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule":
    ["8%"],
  "https://spring4creators.zendesk.com/hc/en-us/articles/17959394635149-How-Much-Products-Cost": [
    "20%",
  ],

  // Payments
  "https://help.venmo.com/cs/articles/business-profile-transaction-fees-vhel221": ["1.9%"],
  "https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee": ["5%"],
};

/**
 * Prettier platform labels for export names the auto-prettifier gets wrong.
 * Keyed by the fees.ts / ai-pricing.ts export name.
 */
export const LABEL: Record<string, string> = {
  depopFeesUS: "Depop (US)",
  depopFeesGB: "Depop (UK)",
  depopFeesROW: "Depop (Rest of world)",
  redbubbleInfo: "Redbubble",
  upworkFees: "Upwork",
};
