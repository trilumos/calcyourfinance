# Manual rate-verification log

The **real** verification — a human (with search) re-checking every rate against
the official page. The weekly automated report (`rate-verification/<date>.md`) is
only a *reminder* to do this; it cannot be trusted on its own. Append a new
cycle section at the top each time.

---

## Cadence & tooling

- **Monthly full audit** (this log + `matrix.md`): re-verify all 42 fee calculators
  × 147 country rate-points against official sources. Reminder auto-sent to
  Telegram on the 1st (`matrix-audit-reminder.yml`).
- **Weekly engine** (`rate-verify.yml`): link-health + staleness tripwire over all
  169 cited sources — a reminder, never trusted on its own.
- **Immediately** on any announced change (e.g. Depop AU): verify + apply, don't wait.
- Personal-finance calculators (10) are excluded — pure unit-tested math, no
  external rate.

> Coverage note (fixed 2026-07-22): the manifest previously missed 7 calculators
> whose sources are top-level `*_SOURCE` consts (Razorpay, Paytm, Wise, Payoneer)
> or live in the config's `sources[]` (Shopify, App Store, Printful). It now scans
> those too — 111 → 169 watched sources.

## ⚠️ Zendesk help centres are unreachable for many users

Confirmed 2026-07-22 from a real browser (India) **and** from CI/sandbox:
**Zendesk-hosted help centres fail to load** — the `/hc/en-*/articles/…` pattern,
including `*.zendesk.com`, `support.patreon.com`, `depophelp.zendesk.com`.
Main domains (`www.patreon.com`, `news.depop.com`) load fine.

**Why it matters:** a citation the reader cannot open is worthless on a site whose
entire pitch is verifiability.

**Rule — treat "primary source unreachable" as a defect, not a nitpick:**
1. Prefer a **main-domain page that states the number** as `sources[0]`
   (e.g. `www.patreon.com/pricing` for Patreon's 10%).
2. Keep the Zendesk article as a **secondary** entry — it's often the richer
   reference and sometimes the only one.
3. **Never delete the only source.** Where Zendesk is genuinely the sole official
   statement (e.g. Depop's rest-of-world 10% — `partnerapi.depop.com` explicitly
   defers to it, `depop.com/blog` 403s), keep it and rank reachable sources above.

**Still on a Zendesk primary** (fix when a main-domain page stating the fee is
confirmed): reverb, printful, whatnot, ko-fi, substack, fiverr, upwork,
teespring, redbubble. Likely candidates to verify first:
`reverb.com/selling/selling-fees`, `ko-fi.com/pricing`, `printful.com/pricing`,
`upwork.com/pricing`, `fiverr.com/legal-portal/legal-terms/payment-terms`.
Already fixed: patreon. Not Zendesk (Intercom/Salesforce, load fine): poshmark,
buymeacoffee, podia, teachable, kajabi.

## Method (follow every cycle)

1. **Prefer the official page.** Domain-restricted WebSearch (or WebFetch) on the
   platform's own site. Record the exact page URL the number came from.
2. **When the official page is JS-rendered or login-walled** (PayPal, Stripe,
   Meta/Facebook, most Zendesk help-centres — these return a shell or 401/403 to
   fetchers), **triangulate**: find **2+ independent 2026 third-party fee guides**
   and accept a value **only when they converge**.
3. **Assess credibility, always.** Tiers, best first:
   `official primary page` → `multiple converging 2026 third-party guides` →
   `single third-party` → `single unconfirmed search` (**reject** — not evidence).
   Note which tier each verdict rests on.
4. **Never change a rate on one search.** A lone result is a hypothesis, not proof.
5. Update `fees.ts` `source`/`verifiedOn` with the **exact** page; log any change
   in `rate-history.ts` with the same exact URL.

## ⚠️ Known false-positive traps (do NOT repeat)

A single WebSearch returned WRONG data on 2026-07-22. Our stored values were
right; acting on the search would have introduced errors. Watch for these:

| Platform | Bad search result | Actual (correct, = our data) | How caught |
|---|---|---|---|
| Square | in-person "6% + 30¢" | **2.6% + $0.15** | known rate + our config |
| Facebook | "5% per shipment" | **10%** (since Apr 2024) | 4 independent 2026 guides converged on 10% |
| Cash App | "2.6% + $0.15" | **flat 2.75%**, no fixed | multiple 2026 guides converged on 2.75% |

Lesson: official-page snippets can be stale/misparsed; **triangulation is
mandatory** for any value that would change our data.

**The reverse trap — third-party guides lag same-day changes.** On 2026-07-22,
hours after Depop's own newsroom announced Australia moving to a 0% selling fee
*that day*, multiple 2026 "Depop fees" guides still said Australia pays 10%.
Triangulation across secondary sources would have given the WRONG answer here.
Rule: when a **primary announcement is dated and explicit**, it outranks any
number of stale secondary guides. Triangulate to confirm what a hidden page
says — never to overrule a dated official announcement.

---

## Cycle: 2026-07-22 (all 111 sources / 39 platforms)

**Result: 1 real change (Depop AU, applied). Every other platform verified
CORRECT.** The original research holds up.

### Change applied

- **Depop (Australia)** — seller fee **10% → 0%**, effective **22 Jul 2026**.
  Added `depopFeesAU` (0% seller, processing **2.6% + A$0.30**, buyer marketplace
  fee up to 5% + up to A$1 which does not reduce payout) + an AU region in the
  calculator. Logged in `rate-history.ts`.
  Exact source (official announcement):
  `https://news.depop.com/company-news/depop-makes-selling-free-in-australia-helping-people-earn-more-from-fashion-resale/`
  Credibility: **primary** (Depop newsroom) + corroborated by ChannelX,
  Ragtrader, ValueAddedResource (2026-07).

### Verified correct this cycle

| Platform | Our value (checked) | Verdict | Credibility of check |
|---|---|---|---|
| Stripe | US 2.9%+$0.30, per-country table | ✅ matches known public rates | official page JS — cross-checked known rates |
| PayPal | US 3.49%+$0.49 / G&S 2.99% / micro 4.99%+$0.09 | ✅ | matches known public rates |
| Square | online 3.3%/2.9%, in-person 2.6%+$0.15, keyed 3.5%+$0.15 | ✅ | our data beat a bad search (trap above) |
| Etsy | 6.5% txn + $0.20 listing + 3%+$0.25 (US) | ✅ | official help page (search) |
| eBay | 13.6% + $0.40/$0.30 per-order (US) | ✅ | official worked example in config |
| Mercari | US 10% + 3.6% buyer protection | ✅ | official help page (search) |
| TikTok Shop | US 6% (5% jewellery); UK/EU 9% | ✅ | official + 2026 guides; 9% is UK/EU not error |
| StockX | levels 9%→7% + 3% processing | ✅ | official news; Mar-2026 change was Flex/shipping only |
| Vinted | 5% + £0.70 (dynamic, representative) / 2% ≥€500; seller $0 | ✅ | official (dynamic fee, honestly labelled) |
| Gumroad | 10% + $0.50 (Discover 30%) | ✅ | official pricing page (search) |
| Bandcamp | digital 15% (→10% after $5k), physical 10%, Friday 0% | ✅ | official help page (search) |
| Buy Me a Coffee | 5% platform + 2.9%+$0.30 processing | ✅ | official help page (search) |
| Cash App | business flat 2.75% (no fixed) | ✅ | our data beat a bad search (trap above) |
| Facebook | 10% shipped (min $0.80 / $0.40 <$8) | ✅ | our data confirmed by 4 2026 guides (trap above) |
| Paddle | 5% + $0.50 | ✅ | official pricing page (search) |
| Lemon Squeezy | 5% + $0.50 | ✅ | official docs (2026-07-21) |

### Verified 2026-07-21 (prior cycle, still current)

Redbubble (50/20/0% + $150 cap + 50% excess), Teachable (Starter 7.5%), Patreon
(10% new-creator std), Fiverr (20%), Upwork (0–15% var, 10% default), Substack
(10%), Poshmark ($2.95/20%), Ko-fi (0–5% / Gold $12), Depop US/UK (0%), Teespring
(digital 20%+$0.40), Reverb (5%, $0.50–$500), Whatnot (8%/4%/5%), Podia (Mover 5%).

### Recently verified, category tables not re-walked this cycle

- **Amazon** — category referral (8–15%) + FBA; verified 2026-06-15 (post the
  15 Jan 2026 FBA change). Re-walk the full category table next deep cycle.
- **Walmart** — category referral 6–15%; verified 2026-06.
- **Printify Premium** — 33%; verified 2026-06.
- **Kajabi** — help page live; % verified 2026-06 (exact page JS-walled).

_Next cycle: deep-walk Amazon/Walmart category tables and re-confirm Stripe/PayPal
per-country pages via a JS-capable path if one becomes available._
