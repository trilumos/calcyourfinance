# Rate-verification matrix — manual audit checklist

**42 fee calculators · 147 country rate-points.** 🔴 9 Tier 1 (twice-monthly) · 33 Tier 2 (monthly).

Every fee calculator × every country it covers. The monthly manual audit (see `manual-verification-log.md`) works through this, triangulating each value against its official source and recording the result. **Auto-generated skeleton** (`npm run verify:matrix`) — do not hand-edit the Calculator/Country/Source columns; fill the **Checked / Credibility / Status** columns as you verify, and carry them forward when regenerating.

Credibility key: `official` (primary page) · `triangulated` (2+ converging 2026 guides) · `single` (one source — treat as unverified) · `dynamic` (quoted live, e.g. Wise). Status: `ok` · `changed` · `recheck`.

**Cadence.** 🔴 **Tier 1 (9) — verified the 1st AND 15th** of each month. **Tier 2 (rest) — verified the 1st.** On any date, check what's due for that anchor (1st = all; 15th = Tier 1); if a check runs late, do it as soon as possible but keep the next date on the 1st/15th anchor. Every session is logged in `src/config/verification-log.ts` and shown publicly at `/verification`.

Tier 1: `stripe-fee-calculator`, `paypal-fee-calculator`, `etsy-fee-calculator`, `amazon-seller-fee-calculator`, `amazon-fba-calculator`, `ebay-fee-calculator`, `shopify-fee-calculator`, `depop-fee-calculator`, `tiktok-shop-fee-calculator`.

### amazon-fba-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98CX) [src](https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW) [src](https://sellercentral.amazon.com/help/hub/reference/GABBX6GZPA8MSZGW) [src](https://sellercentral.amazon.com/help/hub/reference/G7TMHPQGRQ54EWLU) · data verified 2026-07-14

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### amazon-seller-fee-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSY39Z98CX) [src](https://sellercentral.amazon.com/help/hub/reference/G64491) [src](https://sell.amazon.com/pricing) · data verified 2026-07-14

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### depop-fee-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/) [src](https://news.depop.com/company-news/evolving-our-fee-structure-with-zero-selling-fees-on-depop/) [src](https://depophelp.zendesk.com/hc/en-gb/articles/360001791127-Seller-fees-and-charges) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### ebay-fee-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822) [src](https://www.ebay.com/help/selling/fees-credits-invoices/international-fees-ebay-global-sellers?id=5224) [src](https://www.ebay.co.uk/help/selling/fees-credits-invoices/fees-business-sellers-activated-managed-payments?id=4809) [src](https://www.ebay.co.uk/help/buying/paying-items/buyer-protection-fee?id=5594) [src](https://www.ebay.com.au/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers-without-ebay-store?id=4822) [src](https://www.ebay.ca/help/selling/fees-credits-invoices/selling-fees-managed-payments-sellers?id=4822) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| AU |  |  |  |  |
| CA |  |  |  |  |

### etsy-fee-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://www.etsy.com/legal/fees/) [src](https://help.etsy.com/hc/en-us/articles/115015628847) · data verified 2026-06-09

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |
| EU |  |  |  |  |
| IN |  |  |  |  |
| DE |  |  |  |  |
| FR |  |  |  |  |
| ES |  |  |  |  |
| IT |  |  |  |  |
| NL |  |  |  |  |
| IE |  |  |  |  |
| BE |  |  |  |  |
| AT |  |  |  |  |
| SE |  |  |  |  |
| SG |  |  |  |  |
| HK |  |  |  |  |
| NZ |  |  |  |  |
| MX |  |  |  |  |

### shopify-fee-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://www.shopify.com/pricing) [src](https://help.shopify.com/en/manual/payments) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |
| EU |  |  |  |  |
| IN |  |  |  |  |
| SG |  |  |  |  |
| NZ |  |  |  |  |
| DE |  |  |  |  |
| FR |  |  |  |  |
| IE |  |  |  |  |

### tiktok-shop-fee-calculator — ecommerce-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018) [src](https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682) [src](https://seller-uk.tiktok.com/university/essay?knowledge_id=3337893683398432) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |

### paypal-fee-calculator — payment-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://www.paypal.com/us/webapps/mpp/merchant-fees) [src](https://www.paypal.com/uk/business/paypal-business-fees) [src](https://www.paypal.com/ca/business/paypal-business-fees) [src](https://www.paypal.com/au/business/paypal-business-fees) [src](https://www.paypal.com/de/business/paypal-business-fees) [src](https://www.paypal.com/ie/business/paypal-business-fees) [src](https://www.paypal.com/in/business/paypal-business-fees) · data verified 2026-06-09

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |
| EU |  |  |  |  |
| IN |  |  |  |  |
| SG |  |  |  |  |
| BR |  |  |  |  |
| JP |  |  |  |  |
| NZ |  |  |  |  |
| HK |  |  |  |  |
| MX |  |  |  |  |
| MY |  |  |  |  |
| SE |  |  |  |  |
| DE |  |  |  |  |
| FR |  |  |  |  |
| ES |  |  |  |  |
| IT |  |  |  |  |
| NL |  |  |  |  |
| IE |  |  |  |  |
| BE |  |  |  |  |
| AT |  |  |  |  |

### stripe-fee-calculator — payment-fees · 🔴 Tier 1 — 1st + 15th
Sources: [src](https://stripe.com/us/pricing) [src](https://stripe.com/pricing) · data verified 2026-06-08

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |
| EU |  |  |  |  |
| IN |  |  |  |  |
| SG |  |  |  |  |
| BR |  |  |  |  |
| JP |  |  |  |  |
| NZ |  |  |  |  |
| HK |  |  |  |  |
| MX |  |  |  |  |
| MY |  |  |  |  |
| SE |  |  |  |  |
| DE |  |  |  |  |
| FR |  |  |  |  |
| ES |  |  |  |  |
| IT |  |  |  |  |
| NL |  |  |  |  |
| IE |  |  |  |  |
| BE |  |  |  |  |
| AT |  |  |  |  |

### app-store-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://developer.apple.com/app-store/small-business-program/) [src](https://support.google.com/googleplay/android-developer/answer/112622) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |
| EU |  |  |  |  |
| IN |  |  |  |  |
| SG |  |  |  |  |
| DE |  |  |  |  |
| FR |  |  |  |  |
| JP |  |  |  |  |
| BR |  |  |  |  |

### bandcamp-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://get.bandcamp.help/en/articles/15263193-what-are-bandcamp-s-fees) [src](https://get.bandcamp.help/en/articles/15263218-how-much-are-payment-processor-fees-for-digital-sales) [src](https://get.bandcamp.help/en/articles/15263264-how-much-are-payment-processor-fees-for-physical-sales) [src](https://get.bandcamp.help/en/articles/15263119-bandcamp-friday-help) [src](https://bandcamp.com/fair_trade_music_policy) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### buy-me-a-coffee-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment) [src](https://help.buymeacoffee.com/en/articles/10182730-what-is-buy-me-a-coffee-and-how-does-it-work) · data verified 2026-06-13

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### facebook-marketplace-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://www.facebook.com/business/help/223030991929920) [src](https://www.facebook.com/help/773379109714742) [src](https://litcommerce.com/blog/facebook-marketplace-fees/) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### fiverr-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.fiverr.com/hc/en-us/articles/360011028477) [src](https://help.fiverr.com/hc/en-us/articles/360010359797) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### gumroad-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://gumroad.com/help/article/66-gumroads-fees) [src](https://stripe.com/us/pricing) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### kajabi-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://kajabi.com/pricing) [src](https://help.kajabi.com/hc/en-us/articles/23370972909851-Kajabi-Payments-Fees-United-States) [src](https://www.kajabi.com/updates/2025-pricing-updates) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### ko-fi-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee) [src](https://ko-fi.com/pricing) [src](https://help.ko-fi.com/hc/en-us/articles/360005506873-What-is-Ko-fi-Gold) · data verified 2026-06-13

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### mercari-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://www.mercari.com/us/help_center/article/169/) [src](https://www.mercari.com/us/help_center/article/2517/) [src](https://www.mercari.com/us/help_center/article/2518/) [src](https://help.jp.mercari.com/guide/articles/65/) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| JP |  |  |  |  |

### patreon-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview) [src](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025) [src](https://support.patreon.com/hc/en-us/articles/360024952552-Patreon-Creator-Plans) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### podia-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://podia.com/pricing) [src](https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees) [src](https://help.podia.com/en/articles/11370888-podia-plans-pricing-faqs) [src](https://stripe.com/us/pricing) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### poshmark-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://support.poshmark.com/s/article/297755057) [src](https://poshmark.ca/fee_policy) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| CA |  |  |  |  |

### printful-profit-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.printful.com/hc/en-us/articles/360014010240-How-much-does-Printful-cost) [src](https://help.printful.com/hc/en-us/articles/360014068839-How-does-Printful-pricing-work-) [src](https://www.printful.com/payments-guide) [src](https://www.printful.com/plans) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### printify-profit-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://printify.com/pricing/) [src](https://printify.com/how-it-works/) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### redbubble-profit-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.redbubble.com/hc/en-us/articles/202270799-How-is-my-payment-calculated) [src](https://help.redbubble.com/hc/en-us/articles/50959863016724-How-does-my-Account-Tier-determine-my-platform-fee) [src](https://help.redbubble.com/hc/en-us/articles/50959535480212-What-is-the-excess-markup-fee) [src](https://help.redbubble.com/hc/en-us/articles/4412593541908-What-are-Redbubble-s-account-fees) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### reverb-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.reverb.com/hc/en-us/articles/40917652290843-What-fees-will-I-pay-for-selling-on-Reverb) [src](https://help.reverb.com/hc/en-us/articles/41988469262107-What-are-my-fees-as-a-Reverb-Preferred-Seller) [src](https://help.reverb.com/hc/en-us/articles/41988473838491-Availability-and-processing-fees-for-Reverb-Payments) [src](https://reverb.com/selling/selling-fees) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### stockx-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://stockx.com/help/articles/what-are-stockxs-fees-for-sellers) [src](https://stockx.com/help/articles/What-is-the-StockX-Seller-Program-What-are-Seller-Levels) [src](https://stockx.com/news/updates-to-the-stockx-seller-program/) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### substack-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost) [src](https://substack.com/going-paid) [src](https://stripe.com/billing/pricing) · data verified 2026-06-13

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### teachable-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://teachable.com/pricing) [src](https://support.teachable.com/en/articles/11682553-teachable-fees) [src](https://stripe.com/us/pricing) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### teespring-profit-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://spring4creators.zendesk.com/hc/en-us/articles/17959394635149-How-Much-Products-Cost) [src](https://spring4creators.zendesk.com/hc/en-us/articles/12423741560589-How-Spring-works) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### upwork-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://support.upwork.com/hc/en-us/articles/211062538) [src](https://www.upwork.com/i/pricing/) · data verified 2026-06-15

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### vinted-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://www.vinted.com/pricelist) [src](https://www.vinted.co.uk/pricelist) [src](https://www.vinted.com/help/342-buyer-protection-fee-on-vinted) [src](https://www.retailed.io/toolbox/vinted-fee-calculator) [src](https://www.newsendip.com/vinted-fine-1-2-million-in-poland-for-a-lack-of-transparency-on-its-platform/) [src](https://www.blogmode.top/frais-vinted-commission/) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| GB |  |  |  |  |
| FR |  |  |  |  |
| DE |  |  |  |  |
| NL |  |  |  |  |
| BE |  |  |  |  |
| ES |  |  |  |  |
| IT |  |  |  |  |
| AT |  |  |  |  |
| IE |  |  |  |  |
| PL |  |  |  |  |

### walmart-seller-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://marketplace.walmart.com/pricing/) · data verified 2026-06-13

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### whatnot-fee-calculator — ecommerce-fees · Tier 2 — 1st only
Sources: [src](https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-Seller-Fees-and-Commissions-Schedule) [src](https://help.whatnot.com/hc/en-us/articles/25550923919757-Reduced-Commission-on-Electronics) [src](https://help.whatnot.com/hc/en-us/articles/14477076380941-Reduced-Commission-on-Coins-Money) [src](https://help.whatnot.com/hc/en-us/articles/27912945518733-Reduced-Commission-on-High-Value-Orders-Promotion) · data verified 2026-06-12

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| GB |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |

### cashapp-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://cash.app/help/us/en-us/6521-cash-app-for-business-fees) [src](https://cash.app/help/us/en-us/3073-cash-out-speed-options) · data verified 2026-06-10

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |

### lemon-squeezy-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://docs.lemonsqueezy.com/help/getting-started/fees) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### paddle-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://www.paddle.com/pricing) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### payoneer-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://www.payoneer.com/about/pricing/) [src](https://www.payoneer.com/resources/how-to-use-payoneer/how-payoneer-calculates-withdrawal-fees/) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |

### paytm-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://business.paytm.com/pricing) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| IN |  |  |  |  |

### razorpay-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://razorpay.com/pricing/) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| IN |  |  |  |  |

### square-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://squareup.com/us/en/payments/our-fees) [src](https://squareup.com/gb/en/pricing) [src](https://squareup.com/ca/en/pricing) [src](https://squareup.com/au/en/payments/our-fees) [src](https://squareup.com/ie/en/pricing) · data verified 2026-06-10

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |
| CA |  |  |  |  |
| AU |  |  |  |  |
| GB |  |  |  |  |
| IE |  |  |  |  |
| FR |  |  |  |  |
| ES |  |  |  |  |
| JP |  |  |  |  |

### venmo-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://venmo.com/resources/our-fees) [src](https://help.venmo.com/cs/articles/business-profile-transaction-fees-vhel221) · data verified 2026-06-10

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| US |  |  |  |  |

### wise-fee-calculator — payment-fees · Tier 2 — 1st only
Sources: [src](https://wise.com/us/pricing/) [src](https://wise.com/gb/pricing/) · data verified 2026-06-11

| Country | Checked | Credibility | Status | Notes |
|---|---|---|---|---|
| — |  |  |  |  |
