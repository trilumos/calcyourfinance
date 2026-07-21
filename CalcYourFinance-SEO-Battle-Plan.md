# CalcYourFinance — Per-Page SEO, Indexing & Ranking Battle Plan

**Goal:** give Google no reason *not* to index every page, and win the rankings that are actually winnable for a young domain — in a deliberate sequence, beachhead first, giants last.

**Core doctrine (read once, apply everywhere):** You do not beat a saturated commodity niche by being 5% better on every page. You win by (1) making every page pass the site-level quality gate so it indexes, (2) owning defensible topical *clusters* the giants ignore, (3) attacking winnable long-tail intent before head terms, and (4) earning real links so the domain gets trusted. Indexing and ranking are both downstream of trust + differentiation.

---

## PART A — THE UNIVERSAL PAGE BLUEPRINT (applies to all 60)

Do not re-invent this per page. Every calculator page ships with all of this. The per-page sections in Part C only add what is *specific* to that page on top of this baseline.

### A1. Per-page indexing checklist (technical — must pass before you expect indexing)
- [ ] **Content is in the server-rendered HTML.** The formula, worked example, comparison table, and FAQ must appear in "View Crawled Page" / "Test Live URL" HTML — not injected only after JS. This is the #1 silent killer for calculator SPAs. Verify each route.
- [ ] **Self-referencing canonical** tag pointing to the clean URL.
- [ ] **No accidental noindex** (you confirmed this; re-verify after any template change).
- [ ] **In the XML sitemap** with a real `lastmod`; sitemap contains only canonical, indexable URLs (exclude about/contact/thank-you).
- [ ] **Reachable in ≤2 clicks** from the homepage via its category hub. No orphans.
- [ ] **≥3 internal links pointing in** from other indexed/strong pages, with descriptive anchors (not "click here").
- [ ] **Fast LCP / stable CLS** — the calculator widget must not cause layout shift on load.
- [ ] **Unique title + meta description** using the primary keyword naturally (not a template clone of the next page).
- [ ] **Unique H1** that differs from the title tag wording.

### A2. The page anatomy (content sections, in this order)
1. **H1 + one-sentence value line** — what it does, for whom, in your currency.
2. **The calculator** — instant result, no signup, above the fold.
3. **The result insight** — one sentence the raw number can't give (e.g. effective rate, "what you actually keep," break-even). This is what separates you from a bare widget.
4. **"Last verified [DATE] · source: [official pricing link]"** — displayed prominently. This dated-and-cited signal is your single biggest trust edge; most competitors don't date their rates. Lean on it hard.
5. **How the fee/number is calculated** — the actual formula, written out, with a real worked example using concrete numbers (you already do this well on the RD page — replicate everywhere).
6. **Full fee breakdown / all the components** — every line item that applies, including the ones people forget (see per-page "Add" lists in Part C).
7. **Comparison block** — this platform vs 2–3 named alternatives at the same amount (link to your comparison pages where they exist).
8. **Country / currency variants** — at minimum name how the fee differs by region; ideally a small table. Your region-awareness is a moat if you actually surface it.
9. **Common mistakes / hidden costs** — a short callout list. High trust, high dwell time, great for AI answer citations.
10. **FAQ** — 4–6 real questions pulled from Google "People Also Ask" and autocomplete for that platform (per-page seeds in Part C). This captures long-tail and AI-answer traffic.
11. **Methodology + author line** — "Rates sourced from official pricing pages and verified on [date]. Built by Deep Kakadiya." Link to /methodology and /about.
12. **Related calculators** — 3–5 internal links to siblings + the cluster pillar.

### A3. Schema stack (every page)
- `WebApplication` (or `SoftwareApplication`) for the calculator itself.
- `FAQPage` for the FAQ block.
- `BreadcrumbList` (Home › Category › This page).
- Author / `Organization` with a stable "dateModified" that matches your "last verified" date.

### A4. Internal-linking rules (the indexing engine)
- Every page links **up** to its cluster pillar and category hub.
- Every page links **sideways** to 3–5 sibling calculators in the same cluster.
- Every single-platform page links to any **comparison** page it belongs to, and vice-versa.
- Category hubs link **down** to *every* calculator in the category (no page left orphaned).
- Use descriptive, keyword-relevant anchors.

### A5. The differentiation mandate (the ranking gate)
Before publishing/upgrading any page, answer in one sentence: **"What does this page have that the top 3 results don't?"** If the honest answer is "nothing," the page will keep getting *crawled – not indexed*. Acceptable wedges: dated/cited rates, a country variant nobody else covers, a proprietary chart or data point, a genuinely better FAQ, a reverse/gross-up mode, or a comparison the incumbents don't offer. Every page must have at least one.

> Note on rates: everywhere below I list fee **components** and **content angles**, not exact current percentages — those must come from your own dated source of truth so they stay accurate. The SEO value is in *which* components, edge cases, questions, and comparisons you cover.

---

## PART B — PRIORITY TIERS (the attack sequence)

- **Tier 1 — Beachhead (weeks 1–4).** Low incumbent authority; you can be the best result on the internet fast. → Creator/membership platforms, most resale marketplaces, print-on-demand, freelance platforms, and *all* comparison pages.
- **Tier 2 — Winnable with effort (weeks 3–8).** Mid competition; win via country-specificity, depth, and links. → Wise/Payoneer/Razorpay/Paytm/Paddle/Lemon Squeezy, Amazon calculators, Shopify, FD/RD/Salary/Simple Interest, India-specific GST.
- **Tier 3 — Long game (month 2+).** Dominated by giants; differentiate hard, target long-tail + country variants, do not expect head-term wins early. → Stripe, PayPal, Square, EMI, SIP, Loan, Compound Interest, Percentage.

Index and rank Tier 1 first. Wins there build the domain trust that makes Tier 2/3 possible.

---

## PART C — PER-PAGE REPORTS

Format per page — **Tier · Competition** / **Primary keyword** / **Winnable wedge keywords** / **Wedge** (why yours wins) / **Add** (page-specific content) / **Compare** / **FAQ seeds** / **Links**.

---

### CLUSTER A — Creator & Membership Platform Fees  *(Tier 1 — your strongest beachhead; build the pillar here first)*

**Pillar to build:** `/creator-platform-fees` — "Creator Platform Fees Compared (2026): Patreon vs Ko-fi vs Substack vs Gumroad & more." Big master table of every platform's cut at a sample $10 / $100 / $1,000 payout. Every page below links up to it; it links down to all.

**A1. Patreon Fee Calculator** — *Tier 1 · Medium*
- Primary: `patreon fee calculator`. Wedge kw: `patreon vs ko-fi fees`, `how much does patreon take`, `patreon payout after fees`.
- Wedge: model the **plan tiers** (different platform %), **payment processing** on top, **payout/currency fees**, and net-per-patron — most competitors only do one flat %.
- Add: platform fee by plan, processing fee, payout fees, currency conversion, annual vs monthly patron math, "what you keep per $5 patron."
- Compare: Ko-fi, Substack, Buy Me a Coffee.
- FAQ seeds: "How much does Patreon take in 2026?" · "Patreon vs Ko-fi — which pays creators more?" · "Do patrons see the fees?" · "Are there payout fees?"
- Links: pillar, Ko-fi, Buy Me a Coffee, Substack.

**A2. Ko-fi Fee Calculator** — *Tier 1 · Low*
- Primary: `ko-fi fee calculator`. Wedge kw: `ko-fi vs buy me a coffee fees`, `does ko-fi take a cut`.
- Wedge: Ko-fi's selling point is 0% on donations (free tier) vs Gold — model **free vs Gold**, plus the payment-processor cut that still applies. Nail that nuance nobody explains well.
- Add: donations vs shop vs memberships, PayPal/Stripe processing, Gold subscription math, break-even for Gold.
- Compare: Buy Me a Coffee, Patreon.
- FAQ seeds: "Does Ko-fi take a percentage?" · "Is Ko-fi Gold worth it?" · "Ko-fi vs Buy Me a Coffee fees" · "How do Ko-fi payouts work?"
- Links: pillar, Buy Me a Coffee, Patreon.

**A3. Buy Me a Coffee Fee Calculator** — *Tier 1 · Low*
- Primary: `buy me a coffee fee calculator`. Wedge kw: `buy me a coffee vs ko-fi`, `buy me a coffee payout fees`.
- Wedge: flat platform % + processing; show net per "coffee" and monthly membership math.
- Add: one-off vs membership, processing, payout timing, tax note for creators.
- Compare: Ko-fi, Patreon.
- FAQ seeds: "What percentage does Buy Me a Coffee take?" · "BMC vs Ko-fi" · "When do I get paid?"
- Links: pillar, Ko-fi, Patreon.

**A4. Substack Fee Calculator** — *Tier 1 · Low-Med*
- Primary: `substack fee calculator`. Wedge kw: `substack vs patreon fees`, `substack subscription payout calculator`.
- Wedge: Substack % **plus Stripe processing** — creators constantly forget the second layer. Show combined effective cut and annual-vs-monthly subscriber economics.
- Add: platform %, Stripe fee, annual vs monthly, "what you keep on a $50/yr sub," churn note.
- Compare: Patreon, Ghost (mention), Gumroad.
- FAQ seeds: "How much does Substack take?" · "Substack vs Patreon for paid newsletters" · "Does Substack charge on top of Stripe?"
- Links: pillar, Patreon, Gumroad.

**A5. Gumroad Fee Calculator** — *Tier 1 · Medium*
- Primary: `gumroad fee calculator`. Wedge kw: `gumroad fees 2026`, `gumroad vs lemon squeezy`, `gumroad payout after fees`.
- Wedge: Gumroad's flat % changed historically — your **dated/verified rate** is a genuine edge here. Add PayPal vs card, and the VAT/sales-tax handling angle.
- Add: platform flat fee, processing, PayPal payout, VAT handling, digital-product tax note.
- Compare: Lemon Squeezy, Payhip (mention), Etsy digital.
- FAQ seeds: "What are Gumroad's fees in 2026?" · "Gumroad vs Lemon Squeezy" · "Does Gumroad handle VAT?"
- Links: pillar, Lemon Squeezy comparison, Teachable.

**A6. Bandcamp Fee Calculator** — *Tier 1 · Low*
- Primary: `bandcamp fee calculator`. Wedge kw: `bandcamp revenue share`, `bandcamp fees for artists`.
- Wedge: digital vs physical/merch different rates + payment processing + Bandcamp Friday (0% days) angle. Cover the merch cut nobody calculates.
- Add: digital %, merch %, processing, Bandcamp Friday, payout.
- Compare: Ko-fi (music), Patreon.
- FAQ seeds: "What cut does Bandcamp take?" · "Bandcamp fees on merch vs music" · "What is Bandcamp Friday?"
- Links: pillar, Ko-fi, Patreon.

**A7. Teachable Fee Calculator** — *Tier 1 · Medium*
- Primary: `teachable fee calculator`. Wedge kw: `teachable transaction fees by plan`, `teachable vs kajabi vs podia`.
- Wedge: **transaction fee differs by plan** (higher on cheap plans) + processing. Model plan break-even (when upgrading to kill transaction fees pays off).
- Add: per-plan transaction fee, processing, monthly plan cost amortized per sale, break-even course volume.
- Compare: Kajabi, Podia, Gumroad.
- FAQ seeds: "Does Teachable charge transaction fees?" · "Teachable vs Kajabi vs Podia" · "Which Teachable plan is cheapest per sale?"
- Links: pillar, Kajabi, Podia.

**A8. Podia Fee Calculator** — *Tier 1 · Low*
- Primary: `podia fee calculator`. Wedge kw: `podia transaction fees`, `podia vs teachable fees`.
- Wedge: Podia's "no transaction fee on paid plans" selling point — model it honestly vs Teachable, plus processing.
- Add: plan fees, processing, migration break-even vs Teachable/Kajabi.
- Compare: Teachable, Kajabi.
- FAQ seeds: "Does Podia charge transaction fees?" · "Podia vs Teachable" · "Is Podia cheaper than Kajabi?"
- Links: pillar, Teachable, Kajabi.

**A9. Kajabi Fee Calculator** — *Tier 1 · Medium*
- Primary: `kajabi fee calculator`. Wedge kw: `kajabi fees vs teachable`, `kajabi payment processing fees`.
- Wedge: Kajabi's "0% transaction fees" but high monthly cost — model **effective cost per sale at different volumes**, the calc nobody offers.
- Add: monthly plan cost, processing, cost-per-sale curve, break-even vs Teachable.
- Compare: Teachable, Podia.
- FAQ seeds: "Does Kajabi take a percentage?" · "Kajabi vs Teachable total cost" · "Is Kajabi worth it for small course sellers?"
- Links: pillar, Teachable, Podia.

---

### CLUSTER B — Freelance / Service Marketplace Fees  *(Tier 1–2)*

**Pillar option:** fold into the seller-fees pillar or make `/freelance-platform-fees`.

**B1. Fiverr Fee Calculator** — *Tier 1 · Medium*
- Primary: `fiverr fee calculator`. Wedge kw: `fiverr seller fee calculator`, `fiverr 20 percent calculator`, `fiverr buyer fee`.
- Wedge: model **both sides** — seller 20% cut *and* the buyer service fee — and "what to charge to net $X." Reverse mode is a killer here.
- Add: seller 20%, buyer service fee, withdrawal fees (PayPal/Payoneer/bank), currency.
- Compare: Upwork.
- FAQ seeds: "How much does Fiverr take?" · "What to charge on Fiverr to earn $100?" · "Fiverr withdrawal fees" · "Fiverr vs Upwork fees."
- Links: Upwork, Payoneer, comparison pillar.

**B2. Upwork Fee Calculator** — *Tier 1 · Medium*
- Primary: `upwork fee calculator`. Wedge kw: `upwork service fee calculator`, `upwork 10 percent fee`, `upwork connects cost`.
- Wedge: model the flat service fee + **marketplace/contract initiation** + withdrawal + Connects cost — the total-cost-of-a-gig view.
- Add: service fee %, client marketplace fee, withdrawal fees, Connects, "net per $1,000 contract."
- Compare: Fiverr.
- FAQ seeds: "What percentage does Upwork take in 2026?" · "Upwork vs Fiverr for freelancers" · "How much are Upwork withdrawal fees?"
- Links: Fiverr, Payoneer, Wise.

---

### CLUSTER C — Resale & Marketplace Seller Fees  *(Tier 1–2 — big, winnable cluster)*

**Pillar to build:** `/marketplace-seller-fees` — "Where should you sell? Marketplace fees compared (Etsy vs eBay vs Poshmark vs Depop vs Mercari vs Vinted…)." Master table of total take-rate on a $30 sale.

**C1. Etsy Fee Calculator** — *Tier 1–2 · Medium-High*
- Primary: `etsy fee calculator`. Wedge kw: `etsy profit calculator`, `etsy fees with offsite ads`, `etsy fee calculator with shipping`.
- Wedge: full stack — listing, transaction (incl. **on shipping**), payment processing, **offsite ads (capped, 12% vs 15%)**, regulatory operating fee, currency conversion — plus **profit** (subtract COGS). Most Etsy calcs miss the regulatory fee and shipping-taxed nuance.
- Add: all components above + profit mode + reverse "price to net $X."
- Compare: eBay, Depop, Shopify (own-store break-even).
- FAQ seeds: "How much does Etsy take per sale in 2026?" · "Does Etsy charge fees on shipping?" · "What is Etsy's regulatory operating fee?" · "Etsy vs Shopify for small sellers."
- Links: pillar, eBay, Depop, Shopify.

**C2. eBay Fee Calculator** — *Tier 1–2 · Medium-High*
- Primary: `ebay fee calculator`. Wedge kw: `ebay final value fee calculator`, `ebay profit calculator`, `ebay fees by category`.
- Wedge: **final value fee varies by category** + fixed per-order + international fee + Promoted Listings + store-subscription discount. Category selector = the differentiator.
- Add: category-based FVF, per-order fee, international fee, promoted listings, store discount, profit mode.
- Compare: Etsy, Poshmark, Mercari.
- FAQ seeds: "How are eBay final value fees calculated?" · "eBay fees by category 2026" · "eBay vs Poshmark for reselling."
- Links: pillar, Etsy, Poshmark.

**C3. Poshmark Fee Calculator** — *Tier 1 · Low-Med*
- Primary: `poshmark fee calculator`. Wedge kw: `poshmark fee calculator 2026`, `poshmark vs mercari fees`.
- Wedge: the flat-under-$15 vs %-over structure trips people up — model the threshold precisely; add earnings-after-fee and reseller profit.
- Add: flat low-price fee, % fee, threshold logic, profit mode.
- Compare: Mercari, Depop, Vinted.
- FAQ seeds: "What is Poshmark's fee?" · "Poshmark vs Mercari fees" · "Poshmark fee on a $10 item."
- Links: pillar, Mercari, Depop.

**C4. Mercari Fee Calculator** — *Tier 1 · Low-Med*
- Primary: `mercari fee calculator`. Wedge kw: `mercari selling fee calculator`, `mercari payout calculator`.
- Wedge: selling fee + payment processing + instant-pay fee + shipping options; show true net.
- Add: selling fee, processing, instant pay, shipping deduction, profit mode.
- Compare: Poshmark, Depop, eBay.
- FAQ seeds: "How much does Mercari take?" · "Mercari vs Poshmark" · "Mercari instant pay fee."
- Links: pillar, Poshmark, eBay.

**C5. Depop Fee Calculator** — *Tier 1 · Low*
- Primary: `depop fee calculator`. Wedge kw: `depop fees 2026`, `depop vs vinted fees`.
- Wedge: Depop dropped its selling fee historically — your **dated** rate is a real edge; model remaining payment-processing cut + boosting.
- Add: current selling fee status (dated), processing, Boosted listings, payout.
- Compare: Vinted, Poshmark, Etsy.
- FAQ seeds: "Does Depop still charge a 10% fee?" · "Depop vs Vinted" · "Depop payment processing fees."
- Links: pillar, Vinted, Poshmark.

**C6. Vinted Fee Calculator** — *Tier 1 · Low-Med*
- Primary: `vinted fee calculator`. Wedge kw: `vinted buyer protection fee calculator`, `vinted fees for sellers`.
- Wedge: sellers pay ~nothing; the **buyer protection fee** is the thing to model. Build it from the *buyer's* perspective — unusual, high-intent, low competition.
- Add: buyer protection fee (fixed + %), shipping, "total buyer cost."
- Compare: Depop, Poshmark.
- FAQ seeds: "How is Vinted's buyer protection fee calculated?" · "Does Vinted charge sellers?" · "Vinted vs Depop."
- Links: pillar, Depop.

**C7. StockX Fee Calculator** — *Tier 1 · Low-Med*
- Primary: `stockx fee calculator`. Wedge kw: `stockx seller fee calculator`, `stockx payout calculator`, `stockx seller level fees`.
- Wedge: **fees drop by seller level** + processing + shipping; model level-based payout — the differentiator.
- Add: transaction fee by seller level, processing, shipping deduction, payout.
- Compare: eBay, GOAT (mention).
- FAQ seeds: "What are StockX seller fees?" · "How do StockX seller levels work?" · "StockX payout on a $200 sale."
- Links: pillar, eBay.

**C8. Reverb Fee Calculator** — *Tier 1 · Low*
- Primary: `reverb fee calculator`. Wedge kw: `reverb selling fees`, `reverb vs ebay for gear`.
- Wedge: music-gear niche; selling fee + payment processing + bump; profit for gear flippers.
- Add: selling fee, processing, Bump, shipping, profit mode.
- Compare: eBay, Bandcamp merch.
- FAQ seeds: "How much does Reverb take?" · "Reverb vs eBay for selling gear" · "Reverb Bump fees."
- Links: pillar, eBay, Bandcamp.

**C9. Whatnot Fee Calculator** — *Tier 1 · Low*
- Primary: `whatnot fee calculator`. Wedge kw: `whatnot seller fee calculator`, `whatnot commission calculator`.
- Wedge: live-selling commission + payment processing; model per-stream earnings. Fast-growing, thin competition — grab it now.
- Add: commission %, processing, payout, "earnings per $X of live sales."
- Compare: TikTok Shop, eBay Live.
- FAQ seeds: "What percentage does Whatnot take?" · "Whatnot vs TikTok Shop for live selling."
- Links: pillar, TikTok Shop.

**C10. Facebook Marketplace Fee Calculator** — *Tier 1 · Low-Med*
- Primary: `facebook marketplace fee calculator`. Wedge kw: `facebook marketplace selling fee`, `facebook shops fee calculator`.
- Wedge: local (no fee) vs **shipping orders (selling fee + processing)** — clarify the split most people get wrong.
- Add: local vs shipped, selling fee, processing, payout.
- Compare: eBay, Mercari.
- FAQ seeds: "Does Facebook Marketplace charge fees?" · "Facebook Marketplace shipping fees for sellers."
- Links: pillar, Mercari, eBay.

**C11. TikTok Shop Fee Calculator** — *Tier 1–2 · Medium (fast-growing)*
- Primary: `tiktok shop fee calculator`. Wedge kw: `tiktok shop seller fee calculator`, `tiktok shop commission calculator`, `tiktok shop profit calculator`.
- Wedge: commission (rising over time) + transaction fee + affiliate commission + **profit** for sellers. Model affiliate-inclusive margin.
- Add: platform commission, transaction fee, affiliate %, referral, profit mode.
- Compare: Whatnot, Amazon, Etsy.
- FAQ seeds: "What are TikTok Shop seller fees in 2026?" · "TikTok Shop affiliate commission" · "TikTok Shop vs Amazon fees."
- Links: pillar, Whatnot, Amazon Seller.

**C12. Walmart Marketplace Seller Fee Calculator** — *Tier 2 · Medium*
- Primary: `walmart marketplace fee calculator`. Wedge kw: `walmart referral fee by category`, `walmart seller fee calculator`.
- Wedge: **referral fee by category** + WFS (fulfillment) option; profit view. Category selector differentiator.
- Add: referral fee by category, WFS fees, profit mode, vs Amazon referral.
- Compare: Amazon Seller/FBA.
- FAQ seeds: "Walmart Marketplace referral fees by category" · "Walmart WFS vs Amazon FBA cost."
- Links: pillar, Amazon Seller, Amazon FBA.

---

### CLUSTER D — Print-on-Demand Profit  *(Tier 1–2)*

**Pillar to build:** `/print-on-demand-profit` — POD margin compared across platforms at the same retail price.

**D1. Printful Profit Calculator** — *Tier 1–2 · Medium*
- Primary: `printful profit calculator`. Wedge kw: `printful profit margin calculator`, `printful pricing calculator`, `printful vs printify profit`.
- Wedge: base cost + shipping + your retail − marketplace/store fees = **true margin**; add recommended-markup and break-even.
- Add: product base cost, shipping, retail price, platform fee (Etsy/Shopify), margin %, suggested markup.
- Compare: Printify, Redbubble, Teespring.
- FAQ seeds: "How to calculate Printful profit margin" · "Printful vs Printify — which is more profitable?" · "What markup should I use on Printful?"
- Links: pillar, Printify, Etsy, Shopify.

**D2. Printify Profit Calculator** — *Tier 1–2 · Medium*
- Primary: `printify profit calculator`. Wedge kw: `printify profit margin calculator`, `printify premium worth it calculator`.
- Wedge: model **Printify Premium** (lower base cost, monthly fee) break-even vs free — the unique calc.
- Add: base cost free vs Premium, shipping, retail, platform fee, Premium break-even volume, margin.
- Compare: Printful, Redbubble.
- FAQ seeds: "Is Printify Premium worth it?" · "Printify vs Printful profit" · "How to price Printify products."
- Links: pillar, Printful, Etsy.

**D3. Redbubble Profit Calculator** — *Tier 1 · Low-Med*
- Primary: `redbubble profit calculator`. Wedge kw: `redbubble margin calculator`, `redbubble earnings calculator`.
- Wedge: Redbubble sets base, you set **markup %** → earnings; model earnings vs markup and how markup affects sales. Simple but nobody does it well.
- Add: base price, markup %, artist margin, account-tier note.
- Compare: Teespring, Printify.
- FAQ seeds: "How much can you earn on Redbubble?" · "What markup is best on Redbubble?"
- Links: pillar, Teespring.

**D4. Teespring / Spring Profit Calculator** — *Tier 1 · Low*
- Primary: `teespring profit calculator` (+ `spring profit calculator`). Wedge kw: `spring by teespring earnings calculator`.
- Wedge: base cost vs your listed price = profit; handle the **rebrand (Teespring → Spring)** in copy to catch both queries.
- Add: base cost, retail, profit, platform boost, integrations.
- Compare: Redbubble, Printful.
- FAQ seeds: "How does Spring (Teespring) pay?" · "Teespring profit per shirt."
- Links: pillar, Redbubble.

---

### CLUSTER E — Big Retail / App Store  *(Tier 2–3)*

**E1. Amazon FBA Calculator** — *Tier 2–3 · High*
- Primary: `amazon fba calculator`. Wedge kw: `amazon fba profit calculator`, `amazon fba fee calculator by category`, `fba calculator uk/india`.
- Wedge: **referral fee by category + fulfillment by size/weight tier + monthly storage + your COGS = net profit & margin & ROI.** Depth + country marketplaces (US/UK/DE/IN) is the winnable angle vs Amazon's own tool.
- Add: referral by category, FBA fulfillment tiers, storage, COGS, profit, margin, ROI, country selector.
- Compare: Amazon Seller (FBM), Walmart WFS.
- FAQ seeds: "How to calculate Amazon FBA profit" · "Amazon FBA fees by category 2026" · "FBA vs FBM cost."
- Links: Amazon Seller, Walmart, Shopify.

**E2. Amazon Seller Fee Calculator (FBM)** — *Tier 2–3 · High*
- Primary: `amazon seller fee calculator`. Wedge kw: `amazon referral fee calculator`, `amazon fbm profit calculator`.
- Wedge: referral by category + closing fee + your ship cost; contrast with FBA (link across).
- Add: referral by category, per-item/closing fee, shipping, profit, FBM-vs-FBA note.
- Compare: Amazon FBA, Walmart, eBay.
- FAQ seeds: "Amazon referral fees by category" · "Selling on Amazon without FBA — total fees."
- Links: Amazon FBA, Walmart, eBay.

**E3. Shopify Fee Calculator** — *Tier 2–3 · High*
- Primary: `shopify fee calculator`. Wedge kw: `shopify fees calculator 2026`, `shopify payments vs third party gateway fee`, `shopify plan cost per sale`.
- Wedge: **plan monthly cost amortized per sale + Shopify Payments rate + the extra % if you use a third-party gateway** + apps. The "true cost per order at your volume" calc.
- Add: plan cost, Payments rate, third-party gateway surcharge, per-sale amortization, break-even vs Etsy.
- Compare: Etsy (marketplace vs own store), WooCommerce (mention).
- FAQ seeds: "What are Shopify's fees in 2026?" · "Shopify third-party payment gateway fees" · "Shopify vs Etsy total cost."
- Links: Etsy, Stripe, PayPal.

**E4. App Store & Google Play Fee Calculator** — *Tier 2 · Medium*
- Primary: `app store fee calculator` (+ `google play fee calculator`). Wedge kw: `apple 15 vs 30 percent calculator`, `small business program app store fee`.
- Wedge: model **15% (Small Business Program / post-year-1 subs) vs 30%**, side by side for Apple and Google — the decision calc devs actually search for.
- Add: 15% vs 30% tiers, Small Business Program eligibility, subscription year-2 drop, net-per-$X.
- Compare: Apple vs Google side by side (build as a mini-comparison).
- FAQ seeds: "Apple 15% vs 30% — which applies to me?" · "Google Play fees 2026" · "App Store Small Business Program."
- Links: Stripe (web payments alt), Paddle.

---

### CLUSTER F — Payment Processors  *(Tier 2–3 — differentiate hard, target long-tail + country)*

**Category hub:** `/payment-fees` (already exists — strengthen; link to all + all comparisons).

**F1. Stripe Fee Calculator** — *Tier 3 · Brutal*
- Primary: `stripe fee calculator` (long game). **Realistic wins:** `stripe fee calculator india/uk/australia`, `stripe billing fee calculator`, `stripe international card fee calculator`, `what to charge to receive X on stripe`.
- Wedge: don't fight the head term yet — win **country variants + add-ons** (Billing 0.7%, Invoicing 0.4%, international +%, currency conversion +%) + reverse mode + the effective-rate chart.
- Add: base rate, international, currency conversion, Billing, Invoicing, instant payout, disputes; country selector; effective-rate curve chart (proprietary visual).
- Compare: PayPal, Square (link comparison pages).
- FAQ seeds: "Stripe fees in India/UK 2026" · "How much does Stripe Billing add?" · "What to charge to net $100 on Stripe?"
- Links: Stripe-vs-PayPal, Stripe-vs-Square, Shopify.

**F2. PayPal Fee Calculator** — *Tier 3 · Brutal*
- Primary: `paypal fee calculator` (long game). **Wins:** `paypal goods and services fee calculator`, `paypal friends and family fee`, `paypal international fee calculator`, `paypal micropayments calculator`.
- Wedge: model **G&S vs F&F, micropayments rate, international +%, currency conversion, cross-border** — the variants incumbents flatten.
- Add: G&S rate, micropayments, international, currency conversion, fixed fee by currency; reverse mode.
- Compare: Venmo, Stripe, Wise.
- FAQ seeds: "PayPal fee on $100 goods and services" · "Does friends and family have a fee?" · "PayPal international fees 2026."
- Links: PayPal-vs-Venmo, Wise-vs-PayPal, Cash App-vs-PayPal.

**F3. Square Fee Calculator** — *Tier 2–3 · High*
- Primary: `square fee calculator`. Wedge kw: `square online vs in person fee`, `square invoice fee calculator`.
- Wedge: **in-person vs online vs invoice vs keyed** rates side by side — the multi-mode calc.
- Add: tap/chip rate, online rate, invoice rate, keyed rate, reverse mode.
- Compare: Stripe, PayPal.
- FAQ seeds: "Square fees in person vs online" · "Square invoice fees" · "Square vs Stripe."
- Links: Stripe-vs-Square, Square-vs-PayPal.

**F4. Venmo Fee Calculator** — *Tier 2 · Medium*
- Primary: `venmo fee calculator`. Wedge kw: `venmo goods and services fee calculator`, `venmo instant transfer fee`, `venmo business fee`.
- Wedge: personal (free) vs **G&S 1.9%+ / business** + instant-transfer fee + crypto — clarify what's actually charged.
- Add: G&S fee, business profile fee, instant transfer, personal-vs-business logic.
- Compare: Cash App, PayPal.
- FAQ seeds: "Does Venmo charge for goods and services?" · "Venmo instant transfer fee" · "Venmo vs Cash App fees."
- Links: PayPal-vs-Venmo, Cash App-vs-Venmo.

**F5. Cash App Fee Calculator** — *Tier 2 · Medium*
- Primary: `cash app fee calculator`. Wedge kw: `cash app business fee calculator`, `cash app instant deposit fee`, `cash app bitcoin fee`.
- Wedge: personal vs **business 2.75%** + instant deposit + BTC spread. Multi-mode.
- Add: business fee, instant deposit, ATM, Bitcoin spread note.
- Compare: Venmo, PayPal.
- FAQ seeds: "Cash App business fee" · "Cash App instant deposit fee" · "Cash App vs Venmo vs PayPal."
- Links: Cash App-vs-PayPal, Cash App-vs-Venmo.

**F6. Wise Fee Calculator** — *Tier 2 · Medium*
- Primary: `wise fee calculator`. Wedge kw: `wise transfer fee calculator`, `wise vs paypal international`, `wise mid-market rate calculator`.
- Wedge: **mid-market rate + variable % by currency corridor** — build a real corridor selector; contrast the hidden FX margin competitors bury.
- Add: transfer fee by corridor, mid-market rate, "you receive" amount, vs PayPal/bank FX margin.
- Compare: PayPal, Payoneer.
- FAQ seeds: "How are Wise fees calculated?" · "Wise vs PayPal for international transfers" · "What is the mid-market rate?"
- Links: Wise-vs-PayPal, Payoneer.

**F7. Payoneer Fee Calculator** — *Tier 2 · Low-Med*
- Primary: `payoneer fee calculator`. Wedge kw: `payoneer withdrawal fee calculator`, `payoneer currency conversion fee`, `payoneer vs wise`.
- Wedge: receiving fees + **currency conversion %** + withdrawal to bank + annual card fee. Freelancer-focused (link Fiverr/Upwork).
- Add: receiving %, conversion, withdrawal, card fee, "net from a $1,000 client payment."
- Compare: Wise, PayPal.
- FAQ seeds: "Payoneer withdrawal fees" · "Payoneer vs Wise" · "Payoneer currency conversion fee."
- Links: Wise, Fiverr, Upwork.

**F8. Razorpay Fee Calculator** — *Tier 2 · Medium (India)*
- Primary: `razorpay fee calculator`. Wedge kw: `razorpay charges calculator`, `razorpay fees on upi`, `razorpay international payment charges`, `razorpay gst on fees`.
- Wedge: **India specificity** — method-wise rates (UPI/cards/netbanking/wallets/international) + **18% GST on the fee** (everyone forgets this) + settlement.
- Add: method-wise %, GST on fee, international, settlement timing, reverse mode.
- Compare: Paytm gateway, Stripe (for Indian exporters).
- FAQ seeds: "Razorpay charges for UPI vs cards" · "Is GST charged on Razorpay fees?" · "Razorpay international transaction charges."
- Links: Paytm, Stripe, GST calculator.

**F9. Paytm Payment Gateway Fee Calculator** — *Tier 2 · Medium (India)*
- Primary: `paytm payment gateway charges calculator`. Wedge kw: `paytm gateway fees upi`, `paytm vs razorpay charges`.
- Wedge: same India depth — method-wise rates + GST on fee + settlement.
- Add: method-wise %, GST on fee, settlement, reverse mode.
- Compare: Razorpay.
- FAQ seeds: "Paytm gateway charges 2026" · "Paytm vs Razorpay fees" · "GST on Paytm gateway fee."
- Links: Razorpay, GST calculator.

**F10. Paddle Fee Calculator** — *Tier 2 · Low-Med*
- Primary: `paddle fee calculator`. Wedge kw: `paddle fees vs lemon squeezy`, `paddle merchant of record fee`, `paddle saas fee calculator`.
- Wedge: **Merchant-of-Record** model — flat % + fixed, VAT/sales-tax handled — contrast with Stripe (you handle tax). SaaS-founder framing.
- Add: MoR fee, fixed, tax-handling value, payout, vs Stripe total cost.
- Compare: Lemon Squeezy, Stripe.
- FAQ seeds: "Paddle fees explained" · "Paddle vs Lemon Squeezy" · "Is Paddle worth it for the tax handling?"
- Links: Paddle-vs-Lemon-Squeezy, Stripe, Gumroad.

**F11. Lemon Squeezy Fee Calculator** — *Tier 2 · Low-Med*
- Primary: `lemon squeezy fee calculator`. Wedge kw: `lemon squeezy fees vs paddle`, `lemon squeezy merchant of record`.
- Wedge: MoR flat % + fixed + payout; direct MoR comparison to Paddle and Gumroad.
- Add: MoR fee, fixed, PayPal surcharge, payout, tax handling.
- Compare: Paddle, Gumroad.
- FAQ seeds: "Lemon Squeezy fees 2026" · "Lemon Squeezy vs Paddle vs Gumroad."
- Links: Paddle-vs-Lemon-Squeezy, Gumroad, Paddle.

---

### CLUSTER G — Personal Finance  *(Tier 2–3 — win India-specific + long-tail; giants own head terms)*

**Category hub:** `/personal-finance` (exists — strengthen).

**G1. Compound Interest Calculator** — *Tier 3 · Brutal*
- Primary: `compound interest calculator` (long game). Wins: `daily compound interest calculator`, `monthly compound interest calculator`, `compound interest calculator with monthly contributions`, `compound interest calculator india`.
- Wedge: contribution frequency + **compounding frequency selector** + inflation-adjusted real return + a growth chart. Depth beats Investor.gov clones only via the extras.
- Add: contribution schedule, compounding frequency, inflation toggle, breakdown table, chart.
- Compare: simple vs compound (link).
- FAQ seeds: "Daily vs monthly compounding difference" · "Compound interest with monthly deposits formula."
- Links: Simple Interest, SIP, FD.

**G2. Simple Interest Calculator** — *Tier 2 · Medium*
- Primary: `simple interest calculator`. Wins: `simple interest calculator india`, `simple vs compound interest`.
- Wedge: pair with compound (side-by-side toggle) + worked examples; loan/deposit context.
- Add: P·R·T, side-by-side vs compound, worked examples.
- Compare: Compound Interest.
- FAQ seeds: "Simple vs compound interest" · "Simple interest formula with example."
- Links: Compound Interest, Loan.

**G3. EMI Calculator** — *Tier 3 · Brutal (emicalculator.net, Groww, BankBazaar)*
- Primary: `emi calculator` (long game). **Wins:** `home loan emi calculator with prepayment`, `car loan emi calculator`, `emi calculator with moratorium`, `flat vs reducing emi calculator`.
- Wedge: **amortization schedule + prepayment/part-payment modeling + flat-vs-reducing toggle + moratorium** — the features the giants gate or omit; add total-interest-saved on prepayment.
- Add: full amortization table, prepayment, flat vs reducing, moratorium, processing fee, chart.
- Compare: Loan calculator, FD (invest vs prepay).
- FAQ seeds: "How much interest do I save by prepaying?" · "Flat vs reducing balance EMI" · "Home loan EMI with part payment."
- Links: Loan, FD, SIP.

**G4. Loan Calculator** — *Tier 3 · High*
- Primary: `loan calculator`. Wins: `personal loan calculator`, `loan payoff calculator`, `loan calculator with extra payments`.
- Wedge: amortization + extra-payment payoff + total interest; distinguish from EMI page by geography/use-case to avoid self-cannibalization (loan = global/US framing, EMI = India framing).
- Add: amortization, extra payments, payoff date, total interest.
- Compare: EMI.
- FAQ seeds: "How to pay off a loan faster" · "Loan calculator with extra payments."
- Links: EMI, Compound Interest.

**G5. FD Calculator** — *Tier 2 · Medium (India)*
- Primary: `fd calculator`. Wins: `fd calculator with quarterly compounding`, `senior citizen fd calculator`, `fd maturity calculator [bank]`, `post office fd calculator`.
- Wedge: **quarterly compounding + TDS + senior-citizen rate + post-tax yield** — the tax-aware maturity nobody surfaces cleanly.
- Add: quarterly compounding, TDS logic, senior rate, effective post-tax yield, premature-withdrawal note.
- Compare: RD, SIP.
- FAQ seeds: "How is FD interest calculated with quarterly compounding?" · "TDS on FD interest 2026" · "FD vs RD vs SIP."
- Links: RD, SIP, Compound Interest.

**G6. SIP Calculator** — *Tier 3 · Brutal (Groww, Zerodha)*
- Primary: `sip calculator` (long game). Wins: `step up sip calculator`, `sip calculator with inflation`, `lumpsum vs sip calculator`, `sip goal calculator`.
- Wedge: **step-up SIP + inflation-adjusted + lumpsum-vs-SIP toggle + goal (reverse) mode** — feature depth beats the giants' basic versions.
- Add: step-up %, inflation, lumpsum toggle, goal/reverse mode, chart, XIRR note.
- Compare: FD, RD, Compound Interest.
- FAQ seeds: "What is a step-up SIP?" · "SIP vs lumpsum" · "How much SIP to reach 1 crore?"
- Links: FD, RD, Compound Interest.

**G7. RD Calculator** — *Tier 2 · Medium (India) — already strong content*
- Primary: `rd calculator`. Wins: `post office rd calculator`, `rd calculator with tds`, `[bank] rd calculator`.
- Wedge: you already nail formula + tax + RD-vs-FD-vs-SIP. Add **post-office vs bank RD** and TDS toggle to widen long-tail; keep as the template quality bar for the rest of the site.
- Add: post office vs bank, TDS toggle, senior rate, comparison table (already good).
- Compare: FD, SIP.
- FAQ seeds: "Post office RD interest rate 2026" · "Is RD interest taxable?" · "RD vs FD."
- Links: FD, SIP, Compound Interest.

**G8. GST Calculator** — *Tier 2–3 · High (ClearTax etc.) but huge India volume*
- Primary: `gst calculator`. Wins: `gst calculator [slab]`, `reverse gst calculator`, `gst inclusive exclusive calculator`, `cgst sgst igst calculator`.
- Wedge: **add vs remove GST + slab selector + CGST/SGST/IGST split** — the intra-vs-inter-state split is a strong differentiator; keep global GST/VAT countries for international long-tail.
- Add: add/remove modes, slab presets, CGST/SGST/IGST breakdown, country selector, reverse mode.
- Compare: (VAT calculators, future).
- FAQ seeds: "How to remove GST from a total" · "CGST vs SGST vs IGST" · "GST slabs 2026."
- Links: Salary, Razorpay/Paytm (GST on fees), personal-finance hub.

**G9. Salary Calculator** — *Tier 2 · Medium*
- Primary: `salary calculator`. Wins: `take home salary calculator india`, `in hand salary calculator`, `hourly to annual salary calculator`, `ctc to in hand calculator`.
- Wedge: **CTC → in-hand with PF/tax/deductions (India)** *and* a pay-period converter (hourly↔annual) for global — two intents, two long-tail streams.
- Add: CTC breakdown, PF, professional tax, deductions, pay-period converter, region toggle.
- Compare: (tax calculators, future).
- FAQ seeds: "How to calculate in-hand salary from CTC" · "Convert hourly to annual salary."
- Links: GST, personal-finance hub.

**G10. Percentage Calculator** — *Tier 3 · Brutal but enormous volume*
- Primary: `percentage calculator` (long game). Wins: `percentage increase calculator`, `what is X percent of Y`, `percentage difference calculator`, `percentage change calculator`.
- Wedge: **multi-mode** (of, increase, decrease, change, difference, "X is what % of Y") on one page with worked examples + copyable steps. Utility breadth = the wedge; strong internal-link hub to finance calcs.
- Add: all modes, worked examples, step-by-step, quick-reference table.
- Compare: n/a.
- FAQ seeds: "How to calculate percentage increase" · "What is X% of Y" · "Percentage difference vs change."
- Links: GST, Compound Interest, hub.

---

### CLUSTER H — Comparison Pages  *(Tier 1 — high intent, low competition, build these fully)*

Comparisons are your fastest ranking wins: high commercial intent, few good competitors, and they strengthen the whole cluster via links. Each needs a **side-by-side table on the same sample transaction**, a "winner at $X / $Y / $Z" verdict, and a "when to pick each" section — not just two calculators glued together.

- **H1. Stripe vs PayPal** — `stripe vs paypal fees`. Verdict by transaction size + card mix (Stripe wins large/international-lite; PayPal ubiquity). Links: Stripe, PayPal.
- **H2. Stripe vs Square** — `stripe vs square fees`. Online-first vs in-person/POS framing. Links: Stripe, Square.
- **H3. Square vs PayPal** — `square vs paypal fees`. Small-biz in-person vs online. Links: Square, PayPal.
- **H4. PayPal vs Venmo** — `paypal vs venmo fees`. G&S parity, audience, instant-transfer. Links: PayPal, Venmo.
- **H5. Cash App vs PayPal** — `cash app vs paypal fees`. Business rates + instant deposit vs G&S. Links: Cash App, PayPal.
- **H6. Cash App vs Venmo** — `cash app vs venmo fees`. Peer-to-peer + business + instant. Links: Cash App, Venmo.
- **H7. Paddle vs Lemon Squeezy** — `paddle vs lemon squeezy`. MoR for SaaS; tax handling, payout, integrations. High-intent, low competition — prioritize. Links: Paddle, Lemon Squeezy.
- **H8. Wise vs PayPal** — `wise vs paypal international`. FX margin exposed on a sample cross-border transfer. Links: Wise, PayPal.

**Add more comparisons** (cheap wins, all Tier 1): Razorpay vs Paytm, Printful vs Printify, Etsy vs Shopify, Fiverr vs Upwork, Teachable vs Kajabi vs Podia, FD vs RD vs SIP, Amazon FBA vs FBM. Each is a low-competition, high-intent page that reinforces its cluster.

---

### CATEGORY HUBS & INFO PAGES

- **/payment-fees, /ecommerce-fees, /personal-finance** — must link to *every* child calculator (kills orphans), carry a short unique intro (200–300 words, not boilerplate), a category comparison table, and the cluster pillars. These hubs are how crawl equity flows to deep pages — make them dense and useful, not thin link lists.
- **New pillars to build:** `/creator-platform-fees`, `/marketplace-seller-fees`, `/print-on-demand-profit` (+ optional `/freelance-platform-fees`). These are your topical-authority anchors — the flanking positions the giants ignore. Prioritize the creator-fees pillar; it's your most defensible.
- **/about, /methodology** — keep indexable and strong; they carry your E-E-A-T (author, sourcing process, verification dates). Link to methodology from every calculator's "how we verify" line. (You currently noindex about — reconsider: an indexable, substantive About/author page *helps* trust signals. Only noindex thin utility pages like contact/thank-you.)
- **/contact, /privacy, /terms** — noindex is fine.

---

## PART D — THE 6-WEEK ROLLOUT

**Week 1 — Indexing foundation (site-wide).**
- Fix internal linking to hub-and-spoke; ensure every calculator is ≤2 clicks deep with ≥3 inbound internal links.
- Clean XML sitemap (canonical indexable URLs only, real lastmod); submit in GSC; set up Bing Webmaster Tools + IndexNow.
- Verify SSR on 5 sample calculator routes (Test Live URL → confirm text is in HTML).
- Temporarily `noindex` any page you cannot yet differentiate from incumbents (a few payment-fee pages) so they stop dragging site quality; queue them for later.

**Week 2 — Build the flagship cluster.**
- Ship the `/creator-platform-fees` pillar + upgrade all 9 creator pages (Cluster A) to the full page anatomy.
- Ship 3–4 comparison pages (Cluster H), starting with Paddle vs Lemon Squeezy, Fiverr vs Upwork, Etsy vs Shopify.

**Week 3 — Seller + POD clusters.**
- Upgrade Cluster C (marketplace) top 6 + Cluster D (POD) + build `/marketplace-seller-fees` and `/print-on-demand-profit` pillars.
- Add the "common mistakes," country variants, and FAQ schema to everything upgraded so far.

**Week 4 — Links (the fuel).**
- Ship the **embeddable calculator widget** (auto backlink on every embed) — highest-leverage link source for a calculator site.
- Submit to relevant directories/launch platforms (BetaList, Indie Hackers, AlternativeTo, tool directories); answer real fee questions in r/Etsy, r/juststart, IndieHackers, Quora with the calculators.
- Publish one **original data study** ("What 30 platforms actually take from creators in 2026") as linkable/ego-bait content citing your own calculators.

**Week 5 — Payment + India finance depth.**
- Upgrade Cluster F Tier-2 pages (Wise, Payoneer, Razorpay, Paytm, Paddle, Lemon Squeezy, Square, Venmo, Cash App) with multi-mode + country + GST-on-fee (India) depth.
- Upgrade FD/RD/Salary/Simple Interest/GST with India-specific + long-tail depth.

**Week 6 — Giants (long game) + measure.**
- Upgrade Stripe/PayPal/EMI/SIP/Loan/Compound Interest/Percentage for **long-tail + country + feature-depth** (not head-term expectations yet).
- Re-include the paused pages now that domain trust is rising.
- In GSC: validate fixes on "Crawled – currently not indexed," watch indexed count climb cluster by cluster, and track first impressions on long-tail queries.

---

## PART E — WHAT TO MEASURE (so you know it's working)

- **Indexed pages count** in GSC Page Indexing (should climb cluster by cluster, Tier 1 first).
- **"Crawled – currently not indexed" trend** (should shrink as differentiation + links land). Don't spam Request Indexing — Google says resubmission isn't needed for this status; fix the cause instead.
- **Impressions on long-tail queries** in the Performance report — your leading indicator weeks before rankings move.
- **Referring domains** (the trust fuel) — the number that gates everything for a young domain.
- **Crawl stats** (Settings → Crawl stats) — rising crawl frequency signals growing trust.

---

## THE ONE-LINE PRIORITY

Get **Cluster A (creator fees) + Cluster H (comparisons)** indexed and ranking first — they're winnable now and build the domain trust that eventually forces the door open on Stripe, PayPal, EMI, and SIP. Own the flanks, then take the center.
