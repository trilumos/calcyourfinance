# Phase 0 — E-commerce & Seller Fee Calculators: Keyword Research

> Deliverable for the go-gate in [the design spec](./2026-06-11-ecommerce-seller-fee-calculators-design.md) §8.
> Volume figures are **directional** (SERP density / autocomplete / competing-calculator counts, not paid-tool exports).
> Competition: E=easy, M=medium, H=hard. Researched 2026-06-11.

## Marketplaces (1B)

| Platform | Primary keyword | Est. vol/mo | Comp | Intent | RPM | Proposed slug(s) | Archetype | Country approach | Batch |
|---|---|---|---|---|---|---|---|---|---|
| Amazon FBA | amazon fba calculator | 100k–500k | H | tool | High | `amazon-fba-calculator` | bespoke (FBA size/weight tiers + referral + storage) | country-aware, broad | 1 |
| Amazon referral | amazon seller fee calculator | 10k–50k | H | tool | High | `amazon-seller-fee-calculator` (2nd page) | bespoke (category % table) | country-aware, broad | 1 |
| eBay | ebay fee calculator | 50k–200k | M | tool | High | `ebay-fee-calculator` | shared (% + per-order fixed + store tier) | country-aware, broad | 1 |
| Shopify | shopify fee calculator | 10k–50k | M | tool | High | `shopify-fee-calculator` | shared (plan × gateway × txn fee) | country-aware, broad | 1 |
| Poshmark | poshmark fee calculator | 10k–50k | M | tool | High | `poshmark-fee-calculator` | shared (flat $2.95 <$15, else 20%) | US CA AU IN | 1 |
| Mercari | mercari fee calculator | 10k–50k | M | tool | High | `mercari-fee-calculator` | shared (10% + processing) | US JP | 1 |
| TikTok Shop | tiktok shop fee calculator | 10k–50k | E–M | tool | High | `tiktok-shop-fee-calculator` | shared (referral % + processing) | broad (US/UK/EU/SEA) | 1 |
| StockX | stockx fee calculator | 10k–50k | M | tool | High | `stockx-fee-calculator` | bespoke (seller-level tiers + 3% proc) | broad | 1 |
| Depop | depop fee calculator | 10k–50k | E–M | tool | Med-High | `depop-fee-calculator` | bespoke (US/UK 0% seller; ROW 10%) — **region toggle** | broad | 2 |
| Vinted | vinted fee calculator | 10k–50k | E | tool | Med | `vinted-fee-calculator` | bespoke (**seller 0%; buyer-protection fee** — reframe) | EU-heavy (FR DE GB NL PL CZ…) | 2 |
| Reverb | reverb fee calculator | 5k–20k | E | tool | High | `reverb-fee-calculator` | shared (5% + 3.19%+$0.49, $500 cap, Preferred tier) | US GB CA AU DE FR ES | 2 |
| Walmart | walmart seller fee calculator | 5k–20k | E–M | tool | High | `walmart-seller-fee-calculator` | bespoke (category referral + optional WFS) | US | 2 |
| Facebook/Meta | facebook marketplace fee calculator | 5k–20k | E–M | tool | Med | `facebook-marketplace-fee-calculator` (fold in IG) | shared (10% shipped, $0.80 min; local 0%) | broad | 2 |
| Whatnot | whatnot fee calculator | 1k–10k | E | tool | Med-High | `whatnot-fee-calculator` | shared (8% + 2.9%+$0.30; UK 10%) | US GB CA AU | 2 |
| App Store / Play | app store fee calculator | 5k–20k | M | tool | Very High | `app-store-fee-calculator` (combined first; split later) | bespoke (30%/15% tiers) | broad (dev EN markets) | 2 |
| Bonanza | bonanza fee calculator | 1k–5k | E | tool | Med | `bonanza-fee-calculator` | shared (FVF tiers + $0.25) | US GB CA AU | 3 |
| AliExpress | aliexpress seller fee calculator | 1k–5k | E | tool | Med | `aliexpress-fee-calculator` | shared (commission + processing) | thin | 3 |
| Temu | temu seller fee calculator | 1k–5k | E | mixed | Med | `temu-seller-fee-calculator` | bespoke (consignment vs semi-managed) | US | 3 |

## Creator / digital / POD / courses (1C)

| Platform | Primary keyword | Est. vol/mo | Comp | Intent | RPM | Proposed slug(s) | Archetype | Country approach | Batch |
|---|---|---|---|---|---|---|---|---|---|
| Fiverr | fiverr fee calculator | 8k–20k | M | tool | High | `fiverr-fee-calculator` | shared (20% seller; 5.5% buyer) | broad + PH/PK/BD/NG | 1 |
| Upwork | upwork fee calculator | 6k–15k | M | tool | High | `upwork-fee-calculator` | shared (**variable 0–15%, default 10%** since May 2025) | broad + UA/PH | 1 |
| Patreon | patreon fee calculator | 5k–12k | M | tool | Med-High | `patreon-fee-calculator` | shared (**plan select: legacy 5/8/12% + new flat 10%** + processing) | broad | 1 |
| Gumroad | gumroad fee calculator | 4k–10k | M | tool | Med-High | `gumroad-fee-calculator` | shared (**10%+$0.50 direct / 30% Discover** — mode toggle) | broad | 1 |
| Printful | printful profit calculator | 4k–9k | M | tool | Med | `printful-profit-calculator` | bespoke (retail − base − shipping = profit) | broad | 1 |
| Printify | printify profit calculator | 3k–7k | M | tool | Med | `printify-profit-calculator` | bespoke (POD profit; Premium lowers base) | broad | 1 |
| Teachable | teachable fee calculator | 3k–6k | M | tool | High | `teachable-fee-calculator` | shared (plan select: 7.5% Starter / 0% Builder+) | broad | 1 |
| Substack | substack fee calculator | 3k–6k | M | tool | Med-High | `substack-fee-calculator` | shared (10% + Stripe 2.9%+$0.30 + 0.7% billing) | broad | 1 |
| Redbubble | redbubble profit calculator | 3k–6k | E–M | tool | Med | `redbubble-profit-calculator` | bespoke (artist margin % on base; excess-markup note) | broad | 1 |
| Kajabi | kajabi fee calculator | 2k–5k | M | tool | High | `kajabi-fee-calculator` | shared (0% txn; real cost = plan + processing) | broad | 1 |
| Ko-fi | ko-fi fee calculator | 2k–4k | E | tool | Med | `ko-fi-fee-calculator` | shared (Free 0% tips/5% shop; Gold 0%) | broad | 2 |
| Spring (Teespring) | teespring profit calculator | 2k–4k | E–M | tool | Med | `teespring-profit-calculator` (alias spring) | bespoke (retail − base = profit) | broad | 2 |
| Bandcamp | bandcamp fee calculator | 1k–3k | E | tool | Low-Med | `bandcamp-fee-calculator` | shared (15→10→5% by lifetime sales; BC Friday 0%) | broad | 2 |
| Podia | podia fee calculator | 1k–3k | E–M | tool | High | `podia-fee-calculator` | shared (Mover 5% / Shaker 0% + Stripe) | broad | 2 |
| Buy Me a Coffee | buy me a coffee fee calculator | 1k–2.5k | E | tool | Med | `buy-me-a-coffee-fee-calculator` | shared (5% + Stripe; +1% intl) | broad | 2 |
| Sellfy | sellfy fee calculator | 0.5k–1.5k | E | hybrid | Med | `sellfy-fee-calculator` | shared (0% txn; plan break-even) | thin | 3 |

## Country registry additions to make (spec §5)

High-search markets not yet in `CountryCode`, with where they matter:
- **PL** (Poland) — Amazon, eBay, Vinted, TikTok Shop, Upwork, Patreon
- **TR** (Turkey) — Amazon, eBay, AliExpress
- **KR** (South Korea) — Amazon, StockX, TikTok Shop
- **SA** (Saudi Arabia) — Amazon, TikTok Shop
- **ID** (Indonesia) — Shopify, TikTok Shop
- **PH** (Philippines) — already in registry; heavy for Fiverr/Upwork/Ko-fi
- **NG** (Nigeria), **PK** (Pakistan), **BD** (Bangladesh), **UA** (Ukraine) — Fiverr/Upwork freelance base
- **CZ, HU, RO** (Vinted EU markets)
- **NZ, ZA** — already in registry; relevant to several

## Key accuracy / framing flags (must handle, spec §7)
- **Amazon** → two pages (FBA vs referral). FBA is bespoke + highest competition; cross-check vs Amazon's official FBA calculator.
- **Depop** → US/UK sellers pay 0% (buyer pays 3.3%+$0.45); rest-of-world 10%. Needs a region toggle. (Etsy-owned.)
- **Vinted** → sellers pay **nothing**; buyers pay a Buyer Protection fee. Reframe as "what your buyer pays / what you net," not a seller fee.
- **Upwork** → flat 10% is wrong post-May-2025; it's a per-contract variable 0–15% (default 10, user-editable).
- **Patreon** → plan selector: legacy 5/8/12% vs new flat 10%, plus processing + micropayment tier.
- **Gumroad** → 10%+$0.50 direct vs 30% Discover — single page, mode toggle.
- **POD (Printful/Printify/Redbubble/Teespring)** → these are **profit** calculators (retail − base − shipping), not "fee" calculators. Title/H1 must say "profit calculator."
- **Bandcamp** → rate steps down by **lifetime** sales (15→10→5%); ask total all-time sales.
- **App Store + Play** → one combined page first; split once it ranks. Note June 2026 Epic/Play change.
- **Kajabi / Teachable / Podia** → "0% transaction fee" plans exist; real value is plan-cost + processing break-even.
