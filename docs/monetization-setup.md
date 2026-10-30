# GSMHUB Monetization Setup Guide

Step-by-step setup for AdSense, Amazon Associates, and the Jumia affiliate
program. Code-side integration is already built (see "Code state" below);
this guide covers the account work and what to paste where.

Verified against official sources in October 2026. Volatile details
(payment rails, exact signup URLs) are flagged "verify during signup" —
these change often.

---

## Code state (already done)

| Piece | Where |
| --- | --- |
| AdSense script loader (only when env var set) | `frontend/src/app/layout.tsx` |
| Ad component with dev placeholder | `frontend/src/components/ads/AdUnit.tsx` |
| Ad placements | `app/client-layout.tsx`, `app/devices/[slug]/page.tsx` (slot `device-details-mid`), `app/compare/page.tsx`, `app/categories/[category]/page.tsx` |
| Affiliate link generator (admin) | `frontend/src/lib/affiliate.ts`, `frontend/src/components/admin/AffiliateLinkGenerator.tsx` (used in DeviceForm affiliate tab; IDs remembered per browser in localStorage) |
| Buy Now buttons + affiliate disclosure | `frontend/src/components/prices/PriceComparison.tsx`, device page "Buy on {platform}" links |
| Price/affiliate data model | `PriceHistory.affiliateUrl`, `Device.affiliateLinks` |

What the code still needs from you (Stage 4 below): the AdSense publisher
ID, per-unit slot IDs, and your affiliate tracking IDs.

---

## Stage 0 — Site prerequisites (do BEFORE applying anywhere)

Both AdSense and Amazon review the live site. Approval fails without these.

1. **Deploy to production on a custom domain** (roadmap Phases 18–19).
   `localhost` and `*.vercel.app` subdomains are routinely rejected. You
   need `gsmhub.<yourdomain>` (or similar) serving the frontend, with the
   backend API reachable.
2. ~~Add the policy pages~~ **Done** — `/privacy`, `/terms`, `/about`,
   `/contact` are live, and the footer carries a site-wide affiliate
   disclosure (the price widget has its own per-widget disclosure too).
3. ~~Hide `/test-devices`~~ **Done** — the route was removed from the
   app entirely; `robots.txt`/sitemaps don't list admin routes.
4. **Content volume**: reviewers look for substantial original content.
   Spec sheets help, but a handful of original buying guides/reviews
   ("Best phones under ₦200,000", etc.) materially improves approval odds.
   Community consensus: apply once the site has real content and has been
   live ~2–3 months.

---

## Stage 1 — Google AdSense

1. **Create the account**: sign in at <https://adsense.google.com> with a
   Google account → *Add site* → enter your production domain.
2. **Verify site ownership**. For this codebase the script path is
   already wired: set
   ```
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```
   - Locally: `frontend/.env.local`
   - Production: hosting provider env settings (e.g. Vercel → Project →
     Settings → Environment Variables), then redeploy.
   `layout.tsx` injects the AdSense loader script automatically when the
   variable exists — the "paste this script in <head>" instruction from
   AdSense needs no code change.
3. **ads.txt**: from AdSense → *Sites* → site info, copy your publisher ID
   (`pub-XXXXXXXXXXXXXXXX`), then serve an ads.txt at the domain root:
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
   In Next.js App Router this is a metadata route (`frontend/src/app/ads.txt/route.ts`
   returning `text/plain`). Deploy, then click *Verify* in AdSense. The UI
   says ~1 day; Google's docs allow up to a month.
4. **Create ad units**: AdSense → *Ads* → *By ad unit* → Display ads.
   Create one unit per placement and copy each 10-digit slot ID into the
   `AdUnit` calls (`slot="..."` — the current values like
   `device-details-mid` are internal placeholder names, not real IDs).
5. **Payments**: complete identity verification and the address PIN step
   under *Payments* when prompted. Payout threshold is $100. Nigerian
   publishers typically receive via USD wire transfer or Payoneer —
   confirm the options shown in your *Payments* settings.
6. **Review**: expect days to ~2 weeks. Most common rejection is "low
   value content" — that's the Stage 0 content work. Do not click your
   own ads while waiting.

---

## Stage 2 — Amazon Associates

Note: each Amazon marketplace runs a **separate** Associates program
(22 marketplaces incl. US, UK, UAE, Egypt...). Pick the marketplace your
audience buys from — for a Nigerian/global audience that's usually
Amazon.com (US).

1. **Apply**: <https://affiliate-program.amazon.com> → *Sign up*.
   You'll need payee identity/address details (Nigeria is accepted as a
   payee country), your site URL, a description of what you promote and
   how you drive traffic.
2. **180-day rule**: you must make **3 qualifying sales within 180 days**
   of approval or the account closes (you may reapply afterwards). Have
   traffic flowing before you apply.
3. **Tracking ID**: once approved, create tracking IDs in Associates
   Central → *Tools* (format like `gsmhub-20`). That tag is exactly what
   the **Affiliate ID field for Amazon** in the admin link generator
   wants (`AffiliateLinkGenerator` remembers it per browser).
4. **Commissions**: flat rate card — 4.0% for most categories, 4.5% for
   books/kitchen/automotive (see the Standard Commission Income Statement
   in Associates Central for the current table; consumer electronics
   bands run lower). Bounties pay flat fees (e.g. Prime sign-ups).
5. **Payments**: check *Payment Settings* after joining — historically
   international associates outside direct-deposit countries are paid via
   Payoneer, gift cards, or USD checks. Verify what your account offers.
6. **Compliance essentials**:
   - Disclose the affiliation on every page with links (footer line +
     the widget's existing disclosure).
   - Amazon requires price displays to carry an "as of" timestamp and
     disclaims accuracy — if you show Amazon prices alongside Buy Now
     buttons, add that line; safer to show only retailer names + links.
   - No link shorteners or cloaking on Amazon links.

---

## Stage 3 — Jumia (via Kolibri)

Jumia's affiliate program runs through **Kolibri**
(<https://kolibriapp.com>); the old `jumia.com.ng/affiliate/` page is no
longer the entry point.

1. **Sign up as a publisher** via Kolibri (or your local Jumia partner
   page, e.g. `partner.jumia.<market>`). Registration asks for your site,
   traffic channels, and payout details. Tutorials mention a welcome
   bonus and profit-sharing terms — verify current terms during signup.
2. **Model**: CPA — you earn a commission when a user buys through your
   link. Rates vary by category; check the offer list in the Kolibri
   dashboard for phones/electronics.
3. **Generate links**: Kolibri provides deep links / search links per
   product. Paste them into either:
   - `PriceHistory.affiliateUrl` per price entry (admin → Prices → edit
     entry) — powers the widget's Buy Now buttons, or
   - `Device.affiliateLinks` (admin → Devices → edit → affiliate tab).
   The built-in generator's Jumia entry produces a catalog search URL as
   a fallback; prefer the tracked Kolibri deep link when you have it.

---

## Stage 4 — Wire everything into the code

| You obtained | Where it goes |
| --- | --- |
| AdSense publisher ID | `NEXT_PUBLIC_ADSENSE_ID` env var + `ads.txt` route |
| Ad unit slot IDs | `slot` prop of each `<AdUnit>` call (4 placements) |
| Amazon tracking ID (e.g. `gsmhub-20`) | Affiliate link generator's Amazon ID field (remembered in localStorage), or hardcode as a default in `lib/affiliate.ts` |
| Jumia/Kolibri deep links | `PriceHistory.affiliateUrl` / `Device.affiliateLinks` via admin UI |

**Suggested order**: Stage 0 → AdSense application (longest review) →
Amazon application in parallel → Jumia/Kolibri last (fastest turnaround).
