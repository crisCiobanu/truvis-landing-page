---
title: "Product Brief Distillate: Truvis Landing Page"
type: llm-distillate
source: "product-brief-truvis-landing-page.md"
created: "2026-04-07"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: Truvis Landing Page

## Competitive Landscape (Web & App)

- **Pre-Purchase Pal** — iOS-only 68-point DIY checklist with per-vehicle profiles. No severity scoring, no model intelligence, no negotiation output. Pure checklist, no behavioral guardrails.
- **Lemon Squad** — On-demand mobile mechanic dispatch, $150-200+/inspection. Service-based not self-serve, no real-time buyer guidance during walkthrough.
- **Carly / OBD2 scanner apps** — Bluetooth dongle + app for engine codes and health data. Requires hardware, only covers electronic diagnostics, misses body/interior/mechanical visual inspection entirely.
- **SafetyCulture / GoAudits / Connecteam** — General-purpose inspection platforms adapted for vehicle fleets. Enterprise pricing ($5+/asset/month), complex UI, not consumer-facing.
- **InspectARide** — Professional vehicle inspection software starting at $40/month. Dealer/professional tool, not consumer-facing.
- **Carfax / AutoCheck / VinAudit** — VIN history reports only. Commoditized, no inspection guidance, no real-time support. Truvis integrates these as affiliates, not competitors.
- **Key gap**: Zero consumer-facing apps combine guided inspection + severity scoring + behavioral protection + negotiation reports. Truvis defines a new category.

## Landing Page Best Practices (From Research)

- Hero section decides fate in 3 seconds: clear headline with core value prop, app mockup, single CTA above fold
- Conversion architecture sequence: Stop the scroll (headline) → Earn trust (social proof) → Explain value (benefits) → Remove doubt (FAQ) → Make the ask (CTA)
- Social proof near CTA increases conversions 15-30%: trust bars, user counts, testimonial quotes, app store ratings
- Pre-launch waitlist with viral referral mechanics can be explosive (Robinhood pattern: 10K signups day 1, 1M within a year) — deferred for now but option to layer in later
- Mobile-first non-negotiable: single-column layout, 48px+ tap targets, 16px+ fonts, compressed images, sub-3-second load times
- Industry benchmarks: landing-page-to-app-store CTR typically 2-5% for well-optimized pages; email capture rates 2-5% typical

## Market Data Points

- Global used car market: $2.31T (2026), forecast $2.98T by 2031 (5.23% CAGR)
- Used car mobile apps segment: $9.27B, growing 9.3% CAGR
- Online platforms: ~29% of global used car transactions (2025), scaling at 13.26% CAGR
- Only 2% of buyers trust dealerships (Q4 2025 consumer survey)
- 40%+ of car buyers experience anxiety/stress during purchasing, especially Millennials/Gen Z
- 82% of consumers say vehicles less affordable than a year ago — every purchase higher-stakes
- 63% of Americans believe buying used is worth the risk — massive audience needing confidence tools
- France: ~5.5M annual private-sale transactions; Germany: ~7M — largest EU private-sale markets, zero consumer inspection apps

## User Sentiment & Pain Points (Messaging Angles)

- Information asymmetry: seller knows history, buyer doesn't — core emotional trigger
- 27% of buyers say biggest fear is future repair costs; 19% fear undisclosed history
- Post-purchase regret segment ("I bought a car and found problems") is highest-conviction evangelism source
- Professional inspections ($100-300) require scheduling days in advance — too slow for the moment of decision
- Gen Z entering peak car-buying age expects mobile-first, app-guided experiences over traditional mechanic visits

## Rejected Ideas & Decisions

- **Referral-powered waitlist (Robinhood-style)** — Deferred, not rejected. Start with simple email + content hook. Can layer in referral mechanics later if traction warrants. Reason: reduces V1 complexity.
- **Interactive "Rate This Listing" widget on landing page** — Reviewer suggested a lightweight tool where visitors paste a listing URL for instant red-flag summary. Rejected for V1 — explicitly out of scope ("in-browser inspection tools or demos"). Revisit post-launch if conversion data supports it.
- **B2B "For Professionals" entry point** — Reviewer suggested mechanics/dealers as distribution partners with "Truvis Verified" badge. Explicitly out of scope for now. Cristian wants to focus purely on consumer play first.
- **Leading with Poker Face / Hard Stop as hero features** — Reviewer suggested disproportionate visual weight. Cristian: these are equal with other features on the landing page; they'll be highlighted in ad campaigns and social content instead.
- **Simultaneous EN/FR/DE launch** — Rejected for V1. English-first, i18n-ready architecture. FR/DE added in V1.2. Reason: triples content creation and QA burden.
- **Auto club partnerships (ADAC, UFC-Que Choisir)** — Surfaced by reviewer as high-leverage trust signal. Not rejected but not in V1 scope. Worth exploring for V1.2 when entering FR/DE markets.

## Requirements Hints

- Hero must lead with financial/money-saved framing, not anxiety/emotional framing — Cristian confirmed this converts better
- All six app features (Severity Calibrator, Model DNA, Personal Risk Calibration, Poker Face Mode, Hard Stop Protocol, Negotiation Report) treated with equal visual weight on landing page
- Content hook = free "Used Car Buyer's Guide" (what to check, red flags, negotiation tactics) — delivered automatically on email signup
- Blog needs CMS-like infrastructure for ongoing article publishing, not just static pages
- Page must be responsive, mobile-first design
- i18n architecture baked in from V1 (string externalization, locale routing) even though only EN ships initially
- GDPR compliance required from V1: cookie consent banner, explicit email opt-in, privacy policy, data processing documentation
- Analytics must support UTM parameters for tracking paid/social/organic channel attribution
- Social media links (TikTok, Instagram) integrated into landing page
- Post-launch: real user stories are a key content type — "How [persona] saved €X" / "How [persona] avoided buying a lemon"

## Technical Context & Open Questions

- **Tech stack undecided** — No framework chosen for the landing page yet. Options to evaluate: Next.js (SSR/SSG, React ecosystem continuity with app), Astro (static-first, fast, good for content sites), plain HTML/CSS. Blog infrastructure needs CMS consideration (headless CMS vs markdown-based).
- **Email provider undecided** — Needs automated welcome + guide delivery sequence. Options: Resend, Mailchimp, ConvertKit, Loops. Must support GDPR-compliant consent tracking.
- **Hosting undecided** — Vercel, Netlify, Cloudflare Pages, or self-hosted. Should support preview deployments and fast global CDN.
- **Content operations undefined** — Blog positioned as "compounding growth engine" but no publishing cadence, content ownership, or editorial workflow defined. Needs: target articles/month, who creates (in-house/freelance/AI-assisted), first 10 target keywords, content pipeline owner.
- **Social proof pre-launch** — What goes in the social proof section before real users exist? Options: beta tester quotes, expert endorsements, market statistics, or omit section until real proof exists.
- **Email nurture sequence undefined** — What happens between signup and launch day? Minimum: welcome + guide delivery, then periodic updates. Cadence and content TBD.
- **Live inspection stats integration (V1.1)** — Requires data pipeline from app backend to website. Engineering scope, data freshness, and what to show with small numbers all TBD.
- **SEO cold start risk** — New domain, zero authority. Ranking for competitive keywords takes 6-18 months. Paid + social channels must carry the pre-launch traffic load. Keyword research with search volume estimates needed during PRD phase.

## Brand Voice Reference

- 70% Inspector / 30% Ally — same as app
- Cheeky co-pilot personality: steady authority for risks, conspiratorial warmth for "it's just us" moments
- Tagline candidates: "See the car the seller hopes you won't" (marketing), "True vision before you sign" (app store)
- Not corporate SaaS marketing. Trusted friend who knows everything about cars.
- Color palette: Primary warm indigo-slate (#2E4057), Accent teal-slate (#3D7A8A), Severity codes (green/yellow/red)

## Scope Signals Summary

- **V1 (Pre-Launch)**: Landing page + waitlist + content hook + blog infra + analytics + GDPR + i18n-ready (EN only)
- **V1.1 (Post-Launch)**: App store CTAs + user stories + live stats + ratings showcase
- **V1.2 (Internationalisation)**: FR/DE language support + localised SEO content
- **Not now**: B2B features, in-browser tools, referral mechanics, auto club partnerships, payment/subscriptions
