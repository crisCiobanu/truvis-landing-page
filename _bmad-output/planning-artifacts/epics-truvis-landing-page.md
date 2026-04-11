---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd-truvis-landing-page.md
  - _bmad-output/planning-artifacts/prd-truvis-landing-page-validation-report.md
  - _bmad-output/planning-artifacts/architecture-truvis-landing-page.md
  - _bmad-output/planning-artifacts/ux-design-specification-truvis-landing-page.md
  - _bmad-output/planning-artifacts/ux-design-hybrid.html
  - _bmad-output/planning-artifacts/product-brief-truvis-landing-page.md
project_name: truvis-landing-page
---

# Truvis Landing Page - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the Truvis Landing Page, decomposing the requirements from the PRD, UX Design Specification (plus the chosen hybrid visual direction), and Architecture Decision Document into implementable stories.

The Truvis Landing Page is a greenfield Astro 5 + shadcn/ui static site (Cloudflare Pages, Loops, Plausible, Keystatic) operating in two phases — pre-launch (waitlist + drip series) and post-launch (app store funnel + user stories + live stats) — driven by a single `LAUNCH_PHASE` env flag. It also exposes a versioned blog content API consumed by the Truvis mobile app's home-screen carousel.

## Requirements Inventory

### Functional Requirements

**Landing Page Content & Conversion**

- **FR1:** Visitor can view a hero section that presents Truvis's value proposition and a primary CTA
- **FR2:** Visitor can view a problem section that outlines the risks and costs of uninspected used-car purchases
- **FR3:** Visitor can browse a showcase of Truvis's six core capabilities (Severity Calibrator, Model DNA, Personal Risk Calibration, Poker Face Mode, Hard Stop Protocol, Negotiation Report)
- **FR4:** Visitor can view curated market statistics as social proof (pre-launch)
- **FR5:** Visitor can view real user testimonials and success stories (post-launch)
- **FR6:** Visitor can read a FAQ section addressing common questions about Truvis (scope, privacy, cost, relationship to professional inspection)
- **FR7:** Visitor can access CTAs (waitlist signup or app store links) from multiple positions on the page (hero, mid-page, footer)
- **FR8:** Visitor can access explicit iOS App Store and Google Play Store download buttons (post-launch)
- **FR9:** Visitor can view app store ratings and review excerpts (post-launch)
- **FR10:** Visitor can view live inspection statistics — inspections completed, money saved, bad deals avoided (post-launch)
- **FR11:** Visitor can access Truvis social media profiles via links on the landing page

**Email Capture & Nurture**

- **FR12:** Visitor can submit their email address to join the Truvis waitlist
- **FR13:** System validates email input and provides specific error messages for invalid format, duplicate entry, and submission failure
- **FR14:** Visitor receives a double opt-in confirmation email after submitting their email (GDPR compliance)
- **FR15:** Confirmed subscriber automatically enters the email drip series (4-6 emails over 2-3 weeks)
- **FR16:** Subscriber can unsubscribe from the drip series via a link in every email
- **FR17:** Visitor can complete a single-question micro-survey on the waitlist confirmation page ("What brought you here today?")

**Blog & Content**

- **FR18:** Visitor can browse a list of blog articles on the landing page
- **FR19:** Visitor can read individual blog articles with full SEO metadata (title, description, social sharing image)
- **FR20:** Visitor can navigate between related blog articles via internal links
- **FR21:** Visitor can share a blog article via social media or direct link
- **FR22:** Blog articles are crawlable by search engines as static HTML with structured data markup for rich results
- **FR23:** Blog content is accessible via API for the Truvis mobile app home screen carousel (title, excerpt, featured image, category, publish date, slug, web URL)
- **FR24:** Blog content API supports filtering by category, date, and featured status
- **FR25:** Blog content API provides rate-limited access for authorized consumers (mobile app, web frontend)
- **FR26:** Mobile app user can tap a blog article preview card in the carousel and be directed to the full article on the Truvis landing page website
- **FR27:** Blog articles include CTAs that direct readers to the waitlist (pre-launch) or app store (post-launch)

**Content Management**

- **FR28:** Content admin can create, edit, and publish blog articles via a headless CMS without touching code
- **FR29:** Content admin can set SEO metadata per article (title tag, meta description, social sharing image, target keywords)
- **FR30:** Content admin can toggle between pre-launch mode (waitlist CTAs) and post-launch mode (app store CTAs) via a configuration change, not a code deployment
- **FR31:** Content admin can add, edit, and remove FAQ entries without code changes
- **FR32:** Content admin can add and manage user testimonials/stories (post-launch) without code changes
- **FR33:** Content admin can update social proof statistics without code changes
- **FR34:** Any content change in the CMS triggers an automated site rebuild and deployment

**Analytics & Tracking**

- **FR35:** System tracks page views, unique visitors, bounce rate, and time-on-page per landing page section and blog article
- **FR36:** System tracks conversion events: waitlist signups, app store clicks (post-launch), blog CTA clicks
- **FR37:** System supports UTM parameters for traffic source attribution (social, paid, organic, referral)
- **FR38:** System tracks micro-survey responses and aggregates results
- **FR39:** Content admin can view analytics data via an integrated dashboard or third-party analytics tool

**SEO & Discoverability**

- **FR40:** System generates an XML sitemap updated on each build
- **FR41:** System provides structured data markup for organization identity, site structure, blog articles, and FAQ content (supporting rich results in search engines)
- **FR42:** Each page and blog article has a canonical URL
- **FR43:** System generates robots.txt with standard crawl configuration
- **FR44:** All images include alt text and are lazy-loaded below the fold

**Compliance & Privacy**

- **FR45:** Visitor is presented with a cookie consent banner before any non-essential cookies or tracking scripts load
- **FR46:** Visitor can accept or reject non-essential cookies, and their preference is persisted
- **FR47:** Visitor can access a privacy policy page that documents data collection, processing, and retention practices
- **FR48:** System implements double opt-in for email capture (GDPR requirement for EU market)
- **FR49:** Subscriber can request deletion of their data (right to erasure)

**Internationalisation (Architecture Only at V1)**

- **FR50:** System supports URL-based locale routing (`/en/`, `/fr/`, `/de/`) in its architecture, even though only English content is available at launch
- **FR51:** System detects visitor's browser language preference and redirects to the appropriate locale URL, defaulting to English
- **FR52:** All user-facing strings are externalisable (not hardcoded) to support future translation

**Pre/Post-Launch Transition**

- **FR53:** System supports a feature flag that controls whether the page displays waitlist capture (pre-launch) or app store download buttons (post-launch)
- **FR54:** Transition between pre-launch and post-launch modes requires no code deployment and causes no downtime
- **FR55:** Analytics tracking continues without data loss or tracking gaps across the transition, with new conversion events (app store clicks) replacing old ones (waitlist signups)

**Error Handling**

- **FR56:** System displays a branded error page for invalid URLs with navigation back to the landing page and blog

### NonFunctional Requirements

**Performance**

- **NFR1:** Hero section achieves Largest Contentful Paint (LCP) <2.5s on 4G mobile connections
- **NFR2:** Page achieves First Input Delay (FID) <100ms
- **NFR3:** Page achieves Cumulative Layout Shift (CLS) <0.1
- **NFR4:** Time to First Byte (TTFB) <200ms via CDN edge cache
- **NFR5:** Total initial page weight <500KB transferred (excluding lazy-loaded images)
- **NFR6:** Lighthouse Performance score >90
- **NFR7:** Full page load <2s on 3G mobile connection
- **NFR8:** Blog content API responds in <300ms for carousel requests
- **NFR9:** Post-launch inspection statistics widget loads in <500ms

**Security**

- **NFR10:** All traffic served over HTTPS with TLS 1.2+ (enforced by CDN/hosting)
- **NFR11:** Email addresses transmitted over encrypted connections to email service provider
- **NFR12:** No user credentials or sensitive data stored in client-side code, local storage, or cookies
- **NFR13:** Cookie consent preferences stored client-side only — no server-side tracking without consent
- **NFR14:** Blog content API access controlled via API key or rate limiting to prevent abuse
- **NFR15:** Contact forms and email capture protected against automated spam submissions without user-facing friction

**Scalability**

- **NFR16:** Static content served via CDN with no origin server dependency for page loads
- **NFR17:** Email capture submissions are queued or retried if the email provider API is temporarily rate-limited — no submissions silently dropped
- **NFR18:** Blog content API supports 100 concurrent requests from mobile app users with <300ms response time at 95th percentile

**Accessibility**

- **NFR19:** WCAG 2.1 AA compliance across all pages
- **NFR20:** Color contrast ratio minimum 4.5:1 for normal text, 3:1 for large text
- **NFR21:** All interactive elements keyboard navigable (tab, enter, space, escape)
- **NFR22:** Screen reader compatible with ARIA labels where semantic HTML is insufficient
- **NFR23:** Focus indicators visible on all interactive elements
- **NFR24:** All form inputs have associated `<label>` elements
- **NFR25:** Lighthouse Accessibility score >90
- **NFR26:** All layouts tolerate 40% text expansion for future translations (FR/DE)

**Integration**

- **NFR27:** Email service provider integration supports double opt-in, drip series automation, and unsubscribe handling via API
- **NFR28:** Analytics integration loads asynchronously and does not block page render
- **NFR29:** Analytics respects cookie consent — no tracking scripts execute before user consent
- **NFR30:** Content updates trigger automated site rebuild and deployment within 5 minutes of content publish (includes sitemap regeneration)
- **NFR31:** Blog content API changes are additive only — no field removals or renames that would break mobile app carousel
- **NFR32:** Post-launch statistics API (from Truvis backend) provides cached data with 24-hour freshness — landing page does not query live database

**Reliability**

- **NFR33:** Hosting provider selected must offer ≥99.9% uptime SLA for static content delivery
- **NFR34:** Email capture form degrades gracefully if email provider API is unreachable — shows branded error message with retry option, does not lose submission silently
- **NFR35:** Post-launch statistics widget degrades gracefully if backend API is unreachable — shows last-known-good data or a placeholder, not an error
- **NFR36:** Blog content API returns cached responses if CMS is temporarily unreachable — mobile app carousel does not show empty state

**Monitoring & Operations**

- **NFR37:** System provides automated alerting for build failures, email delivery issues, and API availability degradation
- **NFR38:** Deployments can be rolled back to the previous version within 2 minutes via hosting provider's UI or CLI

**SEO Performance**

- **NFR39:** Lighthouse SEO score >95

**Content Quality**

- **NFR40:** All blog content maintains the 70/30 Inspector/Ally brand voice and provides actionable, specific guidance — no generic listicle filler

### Additional Requirements

> Sourced from `architecture-truvis-landing-page.md`. These are technical / infrastructural requirements that shape implementation work and must be reflected in epics and stories — particularly Epic 1 Story 1 (project initialization).

**Starter Template**

- **AR1:** Project must be initialized from the open-source `one-ie/astro-shadcn` starter (Astro 5 + Tailwind v4 + shadcn/ui + advanced blog system + SEO baseline). Pre-init verification checklist: confirm MIT/permissive license, repo activity within ~6 months, audit `package.json` for unwanted heavy deps, baseline Lighthouse run before custom code. **Fallback starter:** `onwidget/astrowind` if `one-ie/astro-shadcn` fails verification.
- **AR2:** Initialization sequence: clone starter → `rm -rf .git && git init` → `npm install` → prune unwanted dependencies → customize Tailwind config with Truvis brand tokens → first commit. This is the first implementation story.

**Hosting & CI/CD**

- **AR3:** Cloudflare Pages must be provisioned as the static host with edge functions enabled, environment variables scoped per environment (`local`, `preview`, `production`), instant-rollback capability (NFR38), and Cloudflare WAF rate limiting at the edge (NFR14).
- **AR4:** GitHub Actions CI workflow must run on every PR: `astro check` (TypeScript), ESLint, Prettier, Vitest unit tests, and Lighthouse CI. PR merges must be blocked when any Lighthouse budget threshold is breached (Performance ≥90, SEO ≥95, Accessibility ≥90, LCP <2.5s, CLS <0.1) — see NFR1, NFR3, NFR6, NFR25, NFR39.
- **AR5:** Cloudflare Pages must auto-deploy `main` to production and create unique preview deployments per PR.

**Content Source & CMS**

- **AR6:** All content (blog, FAQ, testimonials, stats, hero/problem/footer copy) must live in Astro Content Collections (`src/content/*`) with Zod schemas in `src/content/config.ts`, and a parallel Keystatic admin UI configured via `keystatic.config.ts` mirroring the same schemas. Five collections required: `blog`, `faq`, `testimonials`, `stats`, `siteContent`.
- **AR7:** Cloudflare Pages must rebuild and deploy automatically within 5 minutes of any push to `main` (NFR30), including sitemap regeneration.

**Blog Content API Contract**

- **AR8:** Static JSON endpoints must be generated at build time at `/api/v1/blog/posts.json`, `/api/v1/blog/posts/[slug].json`, and `/api/v1/blog/categories.json`. Schema is documented in `CONTRACT.md` at the repo root and is **additive-only** at the `/v1/` version (per NFR31). Field renames or removals require a new `/v2/` endpoint with `/v1/` kept alive for at least one mobile app release cycle.
- **AR9:** Blog API response shape: no wrapper, camelCase fields, ISO 8601 dates with timezone, absolute URLs, image references as `{src, alt, width, height}` objects. CDN cache headers `public, max-age=300, s-maxage=86400, stale-while-revalidate=604800` and Cloudflare WAF rate limit (e.g., 100 req/min per IP).
- **AR10:** A Vitest test (`tests/content.test.ts`) must assert blog API JSON output shape against the documented `CONTRACT.md` schema as a safety net against breaking the mobile app carousel contract.

**Email Service Provider — Loops**

- **AR11:** Loops must be selected as the ESP for waitlist capture, double opt-in, drip series automation, unsubscribe handling, and email delivery (per NFR27, FR12-FR16). The drip series content is authored in the Loops dashboard, not in the codebase.
- **AR12:** Waitlist submission must flow through a server-side Astro API route `POST /api/waitlist` that validates Cloudflare Turnstile token + honeypot + email format, then proxies to the Loops API. The Loops API key must NEVER be exposed to the client.

**Anti-Spam**

- **AR13:** Two-layer anti-spam on the waitlist form: (1) hidden honeypot field, rejected silently at the API route; (2) Cloudflare Turnstile invisible CAPTCHA validated server-side. Both required to satisfy NFR15 without user-facing friction.

**Analytics — Plausible**

- **AR14:** Plausible Cloud (EU region, Germany) must be the analytics platform — cookieless, GDPR-compliant, async-loading (NFR28). Custom events fired only via a single `lib/analytics.ts` `trackEvent()` wrapper. Events: `waitlist_signup`, `app_store_click` (post-launch), `blog_cta_click`, `micro_survey_completed`.

**Cookie Consent**

- **AR15:** `vanilla-cookieconsent` v3 library must be wired but **inactive at V1** (because Plausible is cookieless, no consent banner is legally required). A single env flag (`COOKIE_CONSENT_REQUIRED`) controls whether the banner mounts, ready to activate the moment any non-essential cookie is added.

**Pre/Post-Launch Toggle**

- **AR16:** A single environment variable `LAUNCH_PHASE` (`pre` | `post`) set in Cloudflare Pages dashboard controls all phase-conditional rendering. Read at build time only via `lib/launch-phase.ts` (`isPostLaunch()` helper). No `import.meta.env.LAUNCH_PHASE` reads scattered through components. Both phase variants must be designed, built, and QA'd before launch day — switching phases is a redeploy, not a code change.

**i18n Implementation**

- **AR17:** Astro 4+ built-in i18n routing must be configured in `astro.config.mjs` with `locales: ['en', 'fr', 'de']`, `defaultLocale: 'en'`, and `prefixDefaultLocale: false`. JSON message files at `src/i18n/{locale}/{namespace}.json` (namespaces: `common`, `landing`, `blog`, `faq`). Thin `t()` helper in `src/lib/i18n.ts`. No external i18n library.
- **AR18:** Astro middleware must perform browser language detection on first visit (`Accept-Language` header) and redirect to the appropriate locale URL, defaulting to English. Stored preference (cookie or localStorage) takes precedence on subsequent visits.

**Error Tracking**

- **AR19:** Sentry (EU region) must be integrated via the official Astro SDK for client-side error capture, build error tracking, and source map upload. Each Cloudflare Pages deploy is tagged with a Sentry release via `git rev-parse HEAD`.

**Operational / Pre-Launch Process**

- **AR20:** Email-domain SPF, DKIM, and DMARC DNS records must be configured at the DNS provider before Loops is allowed to deliver email. Domain warm-up performed with small batches and validated via mail-tester.com prior to first drip send.
- **AR21:** Production DNS must be moved onto Cloudflare (or pointed via CNAME) for Cloudflare Pages to serve the production domain.
- **AR22:** A documented launch checklist must exist covering: Lighthouse audit on production build, accessibility audit, cross-browser testing, GDPR compliance review, email deliverability validation, and DNS cutover.

**Project Structure & Pattern Enforcement**

- **AR23:** Three-tier component hierarchy enforced: Tier 1 primitives in `src/components/ui/` (shadcn/ui), Tier 2 composites in `src/components/sections/|forms/|blog/`, Tier 3 layouts/pages in `src/layouts/` and `src/pages/`. React islands isolated to `src/components/islands/`.
- **AR24:** Cross-island state must use `nanostores` (only) in `src/lib/stores/`. Persisted preferences (theme, locale) live in `localStorage` accessed via a thin wrapper.
- **AR25:** All Content Collection access must go through `src/lib/content.ts` helpers. No `getCollection()` calls outside `lib/`.
- **AR26:** All structured data must be generated via helpers in `src/lib/structured-data.ts` (`organizationJsonLd()`, `websiteJsonLd()`, `blogPostingJsonLd()`, `faqJsonLd()`). No inline JSON-LD in templates.
- **AR27:** Hydration directive discipline: `client:visible` is the default for below-the-fold islands, `client:idle` for above-fold non-critical, `client:load` ONLY for above-fold conversion-critical (the hero waitlist form). ESLint/code-review must flag violations.
- **AR28:** Post-launch inspection stats widget (V1.1, deferred) must use a Cloudflare Worker on a cron schedule fetching from the Truvis backend, normalising and writing to Cloudflare KV with 24h cache freshness (NFR32). The landing page reads from KV via a CF Pages Function, never querying the live database directly.

### UX Design Requirements

> Sourced from `ux-design-specification-truvis-landing-page.md` and the chosen visual direction in `ux-design-hybrid.html`. Each item is specific enough to generate a story with testable acceptance criteria.

**Design Tokens & Visual Foundation**

- **UX-DR1:** Implement Truvis design token set in `tailwind.config.ts` from the hybrid direction: warm editorial palette (`--bg #FFFDF9`, `--surface #F7F5F2`, `--surface-2 #FFF8EF`, `--surface-3 #EEF7F7`, `--text/primary #2E4057`, `--teal #3D7A8A`, `--teal-bright #2DA5A0`, `--amber #F5A623`, `--coral #FF6B6B`, severity green/yellow/red), warm tinted shadow scale, 4pt spacing grid (rem), radius scale (`sm 0.5 → full 999px`), divider `rgba(46,64,87,.12)`.
- **UX-DR2:** Implement fluid `clamp()` typography scale from the hybrid direction (`--text-xs` through `--text-hero`) and load Plus Jakarta Sans + Inter as variable fonts via `@font-face` with `font-display: swap`, subset to Latin + Latin Extended, preloaded in `<head>` for hero text to minimise CLS.
- **UX-DR3:** Implement section color rhythm: white hero → `surface` problem → **dark `#2E4057` immersive inspection-story zone** with white text and teal/amber accents → white social proof → `surface` blog previews → white FAQ → **dark `#2E4057` footer CTA bookend**. Color shifts must read as intentional narrative pacing.

**Section Components (Tier 2 composites)**

- **UX-DR4:** Build `HeroSection` Astro component: pill eyebrow badge, micro-story headline with financial hook (e.g., "A buyer paid €7,200 for a car with a €900 problem he couldn't see"), one-sentence positioning subheadline, embedded `EmailCaptureBlock` (hero variant), and standalone phone-mockup image. Two-column on desktop (copy 55% / phone 45%), stacked on mobile. No load animation — fast LCP is the priority.
- **UX-DR5:** Build `ProblemSection` Astro component on the `surface` background: problem-validation copy with specific statistics, lightweight CSS-only fade-in on scroll (no JS animation libraries, no scroll-jacking).
- **UX-DR6:** Build `SocialProofSection` composite that renders pre-launch market `StatCard`s OR post-launch live-metric `StatCard`s based on `isPostLaunch()`, with `TrustQuoteCard` slots designed for both phases.
- **UX-DR7:** Build `BlogPreviewsSection` that surfaces 2-3 inline blog cards on the landing page (Dani's flow), linking to the full blog index.
- **UX-DR8:** Build `FaqSection` using shadcn/ui `Accordion`, sourced from the `faq` Content Collection, with warm-amber rotating chevron, `aria-expanded` states, and JSON-LD FAQ schema injected via `lib/structured-data.ts`.
- **UX-DR9:** Build `FooterCtaSection` (dark `#2E4057` background) and `Footer` (site links, social media links per FR11, privacy/terms links).
- **UX-DR10:** Build `Header` site header with a desktop `NavigationMenu` (warm white background, primary text, teal-slate hover, prominent blog link) and a `MobileNav` `Sheet` drawer island that slides in from the right.
- **UX-DR11:** Build a reusable `SectionEyebrow` (pill badge + heading) Tier 2 pattern with light-background variant (teal-slate pill, primary heading) and dark-background variant (warm-amber pill outline, white heading) — used across every section opener.

**Inspection Story (the page's defining experience)**

- **UX-DR12:** Build the `InspectionStoryScroll` React island (hydrated `client:visible`) implementing the sticky-phone-with-Intersection-Observer pattern: SVG phone frame (~2KB) with a content slot, six scene-content panels swapped via Intersection Observer, `currentScene` tracked in a `nanostores` store (`src/lib/stores/inspection-story-store.ts`), CSS `opacity + transform` crossfade (300ms ease) between scene contents, and `prefers-reduced-motion` fallback (instant swap, no fade). Sticky positioning is disabled below 768px — scenes stack inline with their own phone instances.
- **UX-DR13:** Build the six `InspectionStoryScene` content blocks (one per Truvis capability — Model DNA, Severity Calibrator, Personal Risk Calibration, Poker Face Mode, Hard Stop, Negotiation Report). Each scene: scene number + label, 70/30 Inspector/Ally narrative paragraph, feature name callout, feature benefit line. Standard layout (text-left/phone-right) for scenes 1-4 and 6; **climax variant** for scene 5 (Hard Stop) with centered layout, larger phone, red severity accent border.
- **UX-DR14:** Implement a scene progress indicator (dot row or thin bar) below the sticky phone showing current scene 1-6, with `aria-label="Scene X of 6"`. Scene content has `aria-live="polite"` so screen readers announce scene changes; the SVG phone frame has `aria-hidden="true"` (decorative).
- **UX-DR15:** Implement scene entrance animations: not yet scrolled = `opacity 0 / translateY 20px`, entering = fade-in + slide-up (400ms ease, CSS-only), past = remain visible (no fade-out). All entrance animations disabled under `prefers-reduced-motion`.

**Email Capture & Confirmation**

- **UX-DR16:** Build the reusable `EmailCaptureBlock` composite with three variants (hero / inline / footer) — single email field, submit button, contextual headline, and trust micro-copy ("No spam. Unsubscribe anytime. We respect your inbox like we respect your budget."). All variants share the same underlying `WaitlistForm` React island. States: empty, focused (teal-slate ring), validating, error (severity-red border + inline message, input retains text), submitting (button spinner, input disabled), success (redirect to confirmation page), API error (toast, input re-enabled, text preserved).
- **UX-DR17:** Build the `WaitlistForm` React island with hydration `client:load` only when in the hero (above-fold conversion-critical) and `client:visible` for inline/footer placements. HTML5 + regex client validation on blur and submit; server validation in `/api/waitlist` is the source of truth. Input min font size 16px to prevent iOS zoom.
- **UX-DR18:** Build the `ConfirmationPageLayout` (`/waitlist-confirmed`): teal-slate checkmark icon, "You're in" headline, subtext referencing the submitted email and spam-folder reminder, embedded `MicroSurvey` island, and a social-share prompt block ("Know someone who's car shopping?" with WhatsApp + copy-link buttons). Centered single column, max-width 560px.
- **UX-DR19:** Build the `MicroSurvey` React island: single-question radio-card form ("What brought you here today?") with options ("Looking for inspection tips" / "Been burned before" / "A friend recommended Truvis" / "Just curious for now" / "Other"), Send button, optional Skip link. Submission is non-blocking, posts to `/api/waitlist` (or `/api/micro-survey`) and updates the Loops contact custom field for drip segmentation. Submitted state shows "Thanks! This helps us help you." replacing the form.

**Content Components**

- **UX-DR20:** Build the `BlogPreviewCard` Tier 2 composite with inline-SVG thumbnail (zero image weight), category badge, H3 title, 2-line truncated excerpt, read-time estimate, and "Read article →" CTA link. States: default (`shadow-sm`), hover (`shadow-md`, title shifts to teal-slate), focus (full-card teal-slate outline, 44×44px minimum target). Reduced-motion variant has no shadow transition.
- **UX-DR21:** Build the `StatCard` component with a 4px colored top-border (teal / amber / coral) by category, large bold stat number, label, and source-citation micro-text. Used for both pre-launch market stats (with citations) and post-launch live metrics (same layout, different data via the `phase` prop).
- **UX-DR22:** Build the `TrustQuoteCard` component with two visual phases: pre-launch market-insight styling (warm-amber quote marks, italic editorial text, source attribution) and post-launch testimonial styling (more personal — photo placeholder, user name, context, optional star rating). Driven by the `testimonials` Content Collection and the `phase` field.

**Form Patterns, Feedback & Toast**

- **UX-DR23:** Implement consistent form feedback patterns: inline validation messages near the field (severity red), shadcn `Toast` (or `Sonner`) for network/API failures (severity-red background, bottom-center on mobile, top-right on desktop), input never cleared on error.

**Cookie Consent (wired but inactive at V1)**

- **UX-DR24:** Build a `CookieConsentBanner` React island wrapping `vanilla-cookieconsent` v3: brief explanation copy, privacy policy link, three actions (Accept all primary / Customize secondary / Reject non-essential ghost). Fixed to viewport bottom; full-width bar on mobile, max-width card on desktop. Mount-controlled by `COOKIE_CONSENT_REQUIRED` env flag — **does not display at V1** because Plausible is cookieless.

**404 / Error Pages**

- **UX-DR25:** Build branded `404.astro` and `500.astro` error pages with navigation back to landing page and blog (FR56), styled with the same visual language as the rest of the site.

**Responsive Design**

- **UX-DR26:** Implement mobile-first responsive breakpoints (`<640px` mobile, `640-1024px` tablet, `>1024px` desktop). All interactive elements have a minimum 44×44px touch target on mobile. Container max-widths defined per breakpoint. No horizontal scrolling at any viewport.

**Accessibility**

- **UX-DR27:** Implement a "Skip to content" link as the first focusable element on every page (BaseLayout responsibility), visible on focus.
- **UX-DR28:** Enforce single-`<h1>`-per-page heading hierarchy with no skipped levels (hero headline is the only `<h1>`; section headings are `<h2>`; sub-headings are `<h3>`). Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`) — ARIA only fills gaps.
- **UX-DR29:** All focus indicators must be visible via `focus-visible:` Tailwind utilities; never `outline: none` without a replacement. Color is never the sole indicator of meaning — severity colors always paired with text or icons.
- **UX-DR30:** Validate WCAG 2.1 AA color contrast (4.5:1 normal, 3:1 large) for the chosen palette: primary `#2E4057` on white = ~10.5:1 (AAA), accent teal-slate `#3D7A8A` on white ≥4.5:1 (AA), white on primary = ~10.5:1 (AAA). Document any palette exceptions and ensure compliance.

**Internationalisation Layout Tolerance**

- **UX-DR31:** All text containers must accommodate 40% text expansion for future FR/DE translations (NFR26). No fixed-width text containers, no `text-overflow: ellipsis` on critical content. Validated in V1 with synthetic FR/DE-length placeholder strings across every component.

**Motion**

- **UX-DR32:** Standardise transition durations and easing (per UX consistency patterns). All non-essential motion respects `prefers-reduced-motion` — entrance animations, scene crossfades, hover transitions, and shadow elevation changes all become instant or are removed under reduced motion.

### Requirements Coverage Map

**Functional Requirements**

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 2 | Hero section with value proposition + primary CTA |
| FR2 | Epic 2 | Problem section: risks and costs of uninspected purchases |
| FR3 | Epic 2 | Six-feature showcase via inspection-story scroll |
| FR4 | Epic 2 | Pre-launch market statistics social proof |
| FR5 | Epic 2 | Post-launch user testimonials (TrustQuoteCard post-launch variant lives in Epic 8) |
| FR6 | Epic 2 | FAQ section addressing scope/privacy/cost questions |
| FR7 | Epic 2 | Multi-position CTAs (hero, mid-page, footer) |
| FR8 | Epic 8 | Post-launch iOS App Store + Google Play Store buttons |
| FR9 | Epic 8 | Post-launch app store ratings + review excerpts |
| FR10 | Epic 8 | Post-launch live inspection statistics widget (V1 stub) |
| FR11 | Epic 2 | Social media profile links in footer |
| FR12 | Epic 3 | Email submission for waitlist |
| FR13 | Epic 3 | Email validation + specific error messages |
| FR14 | Epic 3 | Double opt-in confirmation email (via Loops) |
| FR15 | Epic 3 | Drip series enrolment on confirmation |
| FR16 | Epic 3 | Unsubscribe link in every drip email |
| FR17 | Epic 3 | Single-question micro-survey on confirmation page |
| FR18 | Epic 4 | Browse blog article list |
| FR19 | Epic 4 | Read individual articles with full SEO metadata |
| FR20 | Epic 4 | Navigate related blog articles |
| FR21 | Epic 4 | Share blog articles via social/direct link |
| FR22 | Epic 4 | Articles crawlable as static HTML with structured data |
| FR23 | Epic 4 | Blog content API for mobile app carousel |
| FR24 | Epic 4 | Blog API filter by category, date, featured |
| FR25 | Epic 4 | Blog API rate-limited access |
| FR26 | Epic 4 | Mobile carousel deep-link to full article |
| FR27 | Epic 4 | Blog article inline CTAs (waitlist/app store) |
| FR28 | Epic 5 | CMS-driven blog article authoring |
| FR29 | Epic 5 | Per-article SEO metadata in CMS |
| FR30 | Epic 5 | Pre/post-launch toggle via configuration (mechanism) |
| FR31 | Epic 5 | FAQ entries managed without code changes |
| FR32 | Epic 5 | Testimonials/stories managed without code |
| FR33 | Epic 5 | Social proof statistics managed without code |
| FR34 | Epic 5 | Any CMS change triggers automated rebuild + deploy |
| FR35 | Epic 6 | Page views, unique visitors, bounce rate, time-on-page tracking |
| FR36 | Epic 6 | Conversion event tracking (waitlist signup, app store click, blog CTA) |
| FR37 | Epic 6 | UTM parameter support for source attribution |
| FR38 | Epic 6 | Micro-survey response tracking + aggregation |
| FR39 | Epic 6 | Analytics dashboard access for content admin |
| FR40 | Epic 6 | XML sitemap generation per build |
| FR41 | Epic 6 | Structured data markup (Org, WebSite, BlogPosting, FAQ) |
| FR42 | Epic 1 | Canonical URLs per page (BaseLayout responsibility) |
| FR43 | Epic 1 | robots.txt with standard crawl configuration |
| FR44 | Epic 6 | Image alt text + lazy loading below fold |
| FR45 | Epic 7 | Cookie consent banner before non-essential cookies/tracking |
| FR46 | Epic 7 | Visitor cookie acceptance/rejection persisted |
| FR47 | Epic 7 | Privacy policy page documenting data practices |
| FR48 | Epic 7 | Double opt-in for email capture (GDPR) |
| FR49 | Epic 7 | Right to erasure for subscriber data |
| FR50 | Epic 1 | URL-based locale routing (`/en/`, `/fr/`, `/de/`) |
| FR51 | Epic 1 | Browser language detection middleware |
| FR52 | Epic 1 | Externalised user-facing strings via `t()` helper |
| FR53 | Epic 5 | Pre/post-launch feature flag (mechanism) |
| FR54 | Epic 8 | Phase transition with no code deploy or downtime (validation) |
| FR55 | Epic 6 | Analytics continuity through phase transition |
| FR56 | Epic 1 | Branded 404 error page with navigation |

**Non-Functional Requirements**

| NFR | Epic | Description |
|---|---|---|
| NFR1 | Epic 1 | Hero LCP <2.5s on 4G (Lighthouse CI gate) |
| NFR2 | Epic 1 | FID <100ms |
| NFR3 | Epic 1 | CLS <0.1 (Lighthouse CI gate) |
| NFR4 | Epic 1 | TTFB <200ms via CDN edge cache |
| NFR5 | Epic 1 | Initial page weight <500KB transferred |
| NFR6 | Epic 1 | Lighthouse Performance >90 (CI gate) |
| NFR7 | Epic 1 | Full page load <2s on 3G |
| NFR8 | Epic 4 | Blog content API <300ms response |
| NFR9 | Epic 8 | Post-launch stats widget <500ms load |
| NFR10 | Epic 1 | HTTPS / TLS 1.2+ (Cloudflare default) |
| NFR11 | Epic 3 | Email transmission encrypted to ESP |
| NFR12 | Epic 1 | No client-side credentials/secrets |
| NFR13 | Epic 7 | Cookie consent state client-side only |
| NFR14 | Epic 4 | Blog API key/rate-limit access control |
| NFR15 | Epic 3 | Anti-spam without user friction (honeypot + Turnstile) |
| NFR16 | Epic 1 | Static content via CDN with no origin dependency |
| NFR17 | Epic 3 | Email submission queue/retry on ESP failure |
| NFR18 | Epic 4 | Blog API ≥100 concurrent at <300ms p95 |
| NFR19 | Epic 1 | WCAG 2.1 AA across all pages |
| NFR20 | Epic 1 | Color contrast 4.5:1 normal / 3:1 large |
| NFR21 | Epic 1 | Keyboard navigation for all interactive elements |
| NFR22 | Epic 1 | Screen reader compatibility with ARIA |
| NFR23 | Epic 1 | Visible focus indicators |
| NFR24 | Epic 1 | Form inputs with associated labels |
| NFR25 | Epic 1 | Lighthouse Accessibility >90 (CI gate) |
| NFR26 | Epic 1 | 40% text expansion tolerance for FR/DE |
| NFR27 | Epic 3 | ESP supports double opt-in + drip + unsubscribe via API |
| NFR28 | Epic 6 | Analytics async, non-blocking |
| NFR29 | Epic 6 | Analytics respects cookie consent |
| NFR30 | Epic 5 | Content publish → rebuild + deploy <5 min |
| NFR31 | Epic 4 | Blog API additive-only schema |
| NFR32 | Epic 8 | Post-launch stats cached 24h, never live DB |
| NFR33 | Epic 1 | Hosting ≥99.9% uptime SLA |
| NFR34 | Epic 3 | Waitlist form graceful degradation on ESP failure |
| NFR35 | Epic 7 | Stats widget graceful degradation on backend failure |
| NFR36 | Epic 4 | Blog API cached if CMS unreachable |
| NFR37 | Epic 7 | Automated alerting on build/email/API failures |
| NFR38 | Epic 1 | Rollback <2 min via hosting provider |
| NFR39 | Epic 6 | Lighthouse SEO >95 (CI gate) |
| NFR40 | Epic 4 | Blog content quality (70/30 voice, no listicle filler) |

**Additional Requirements (Architecture)**

| AR | Epic | Description |
|---|---|---|
| AR1 | Epic 1 | Initialise from `one-ie/astro-shadcn` starter (verified) |
| AR2 | Epic 1 | Init sequence: clone → reset git → prune → brand tokens → first commit |
| AR3 | Epic 1 | Cloudflare Pages provisioning + env vars + WAF |
| AR4 | Epic 1 | GitHub Actions CI with Lighthouse budget gates |
| AR5 | Epic 1 | CF Pages auto-deploy main + per-PR previews |
| AR6 | Epic 5 | Five Astro Content Collections + Keystatic config mirroring |
| AR7 | Epic 5 | Auto rebuild + deploy <5 min on push |
| AR8 | Epic 4 | Static `/api/v1/blog/*` JSON endpoints + `CONTRACT.md` versioning |
| AR9 | Epic 4 | Blog API response shape (no wrapper, camelCase, ISO 8601, absolute URLs, image objects) + cache headers + rate limit |
| AR10 | Epic 4 | Vitest contract test asserting blog API JSON shape |
| AR11 | Epic 3 | Loops as ESP for waitlist/double opt-in/drip/unsubscribe |
| AR12 | Epic 3 | Server-side `/api/waitlist` route proxying to Loops |
| AR13 | Epic 3 | Honeypot + Cloudflare Turnstile two-layer anti-spam |
| AR14 | Epic 6 | Plausible Cloud (EU) + `lib/analytics.ts` `trackEvent()` wrapper |
| AR15 | Epic 7 | `vanilla-cookieconsent` v3 wired but inactive at V1 |
| AR16 | Epic 5 | `LAUNCH_PHASE` env var + `lib/launch-phase.ts` helper |
| AR17 | Epic 1 | Astro built-in i18n routing + JSON message files |
| AR18 | Epic 1 | Locale-detection middleware (Accept-Language) |
| AR19 | Epic 7 | Sentry EU integration + source maps + release tagging |
| AR20 | Epic 8 | SPF / DKIM / DMARC DNS records + domain warm-up |
| AR21 | Epic 8 | Production DNS cutover to Cloudflare |
| AR22 | Epic 8 | Documented launch checklist execution |
| AR23 | Epic 1 | Three-tier component hierarchy (primitives → composites → layouts) |
| AR24 | Epic 1 | nanostores convention for cross-island state |
| AR25 | Epic 5 | `lib/content.ts` Content Collection access boundary |
| AR26 | Epic 6 | `lib/structured-data.ts` JSON-LD helpers |
| AR27 | Epic 1 | Hydration directive discipline (`client:visible` default) |
| AR28 | Epic 8 | Post-launch stats CF Worker + KV (V1.1 stub at V1) |

**UX Design Requirements**

| UX-DR | Epic | Description |
|---|---|---|
| UX-DR1 | Epic 1 | Truvis design tokens in `tailwind.config.ts` (warm editorial palette + severity tokens + radius + shadow scales) |
| UX-DR2 | Epic 1 | Fluid `clamp()` typography + variable font loading |
| UX-DR3 | Epic 1 | Section color rhythm (white → surface → dark immersion → white → surface → white → dark CTA) |
| UX-DR4 | Epic 2 | `HeroSection` Astro component (micro-story headline + phone mockup + embedded EmailCaptureBlock slot) |
| UX-DR5 | Epic 2 | `ProblemSection` with CSS-only fade-in |
| UX-DR6 | Epic 2 | `SocialProofSection` with phase-conditional StatCards |
| UX-DR7 | Epic 2 | `BlogPreviewsSection` inline blog cards |
| UX-DR8 | Epic 2 | `FaqSection` shadcn Accordion + FAQ JSON-LD |
| UX-DR9 | Epic 1 | `FooterCtaSection` (dark) + Footer (links, social, privacy/terms) |
| UX-DR10 | Epic 1 | `Header` desktop NavigationMenu + `MobileNav` Sheet drawer |
| UX-DR11 | Epic 1 | Reusable `SectionEyebrow` (light + dark variants) |
| UX-DR12 | Epic 2 | `InspectionStoryScroll` React island (sticky phone, IO observer, nanostore) |
| UX-DR13 | Epic 2 | Six `InspectionStoryScene` blocks + Hard Stop climax variant |
| UX-DR14 | Epic 2 | Scene progress indicator + `aria-live` + `aria-hidden` phone frame |
| UX-DR15 | Epic 2 | Scene entrance animations + reduced-motion fallback |
| UX-DR16 | Epic 3 | `EmailCaptureBlock` with hero/inline/footer variants and full state machine |
| UX-DR17 | Epic 3 | `WaitlistForm` React island with hydration discipline |
| UX-DR18 | Epic 3 | `ConfirmationPageLayout` + social share prompt |
| UX-DR19 | Epic 3 | `MicroSurvey` React island |
| UX-DR20 | Epic 4 | `BlogPreviewCard` Tier 2 composite |
| UX-DR21 | Epic 2 | `StatCard` with category top-border colors |
| UX-DR22 | Epic 2 | `TrustQuoteCard` (pre-launch styling; post-launch styling completed in Epic 8) |
| UX-DR23 | Epic 3 | Form feedback + Toast pattern |
| UX-DR24 | Epic 7 | `CookieConsentBanner` (wired, inactive at V1) |
| UX-DR25 | Epic 1 | Branded `404.astro` + `500.astro` |
| UX-DR26 | Epic 1 | Mobile-first responsive breakpoints + 44×44px touch targets |
| UX-DR27 | Epic 1 | Skip-to-content link |
| UX-DR28 | Epic 1 | Single-`<h1>` heading hierarchy + semantic HTML |
| UX-DR29 | Epic 1 | `focus-visible:` indicators; color never sole indicator |
| UX-DR30 | Epic 1 | WCAG 2.1 AA contrast validation for chosen palette |
| UX-DR31 | Epic 1 | 40% text expansion layout tolerance |
| UX-DR32 | Epic 1 | Standardised motion durations + `prefers-reduced-motion` discipline |

## Epic List

### Epic 1: Foundation & Internationalisation-Ready Shell

A live URL serves a brand-true, accessible, fast-loading, internationalisation-ready Truvis site shell — header, footer, mobile nav drawer, base layout, branded 404/500, the SectionEyebrow pattern — with every PR automatically gated on Lighthouse perf/a11y/SEO budgets. The Truvis brand exists on the web for the first time, and every subsequent epic builds inside this shell.

**FRs covered:** FR42, FR43, FR50, FR51, FR52, FR56
**NFRs covered:** NFR1, NFR2, NFR3, NFR4, NFR5, NFR6, NFR7, NFR10, NFR12, NFR16, NFR19, NFR20, NFR21, NFR22, NFR23, NFR24, NFR25, NFR26, NFR33, NFR38
**ARs covered:** AR1, AR2, AR3, AR4, AR5, AR17, AR18, AR23, AR24, AR27
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR9, UX-DR10, UX-DR11, UX-DR25, UX-DR26, UX-DR27, UX-DR28, UX-DR29, UX-DR30, UX-DR31, UX-DR32

### Epic 2: Conversion Story — Hero Through Footer CTA

A visitor scrolling the landing page experiences the full pre-launch narrative — hero with financial micro-story, problem validation, six-scene inspection-story scroll (with the Hard Stop climax variant), social proof stat cards, inline blog previews, FAQ accordion, and footer CTA — and leaves understanding what Truvis is and why they need it. CTA placeholders are wired to the real waitlist form in Epic 3.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR11
**UX-DRs covered:** UX-DR4, UX-DR5, UX-DR6, UX-DR7, UX-DR8, UX-DR12, UX-DR13, UX-DR14, UX-DR15, UX-DR21, UX-DR22

### Epic 3: Waitlist Capture & Confirmation Flow

A visitor can submit their email from any of three CTA positions, pass invisible anti-spam, receive a double opt-in confirmation, land on a branded confirmation page, optionally complete a micro-survey, and be enrolled in the Loops drip series. The pre-launch conversion mechanism works end-to-end with graceful degradation on ESP failure.

**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17
**NFRs covered:** NFR11, NFR15, NFR17, NFR27, NFR34
**ARs covered:** AR11, AR12, AR13
**UX-DRs covered:** UX-DR16, UX-DR17, UX-DR18, UX-DR19, UX-DR23

### Epic 4: Blog & Cross-Platform Content API

A visitor can browse a blog index, read individual articles with full SEO metadata and structured data, navigate related articles, and share. In parallel, the Truvis mobile app can fetch the same blog content via a versioned, additive-only static JSON contract — the only cross-platform integration point in the architecture — guarded by a contract test.

**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27
**NFRs covered:** NFR8, NFR14, NFR18, NFR31, NFR36, NFR40
**ARs covered:** AR8, AR9, AR10
**UX-DRs covered:** UX-DR20

### Epic 5: Content Operations — CMS, Phase Toggle & Rebuild Pipeline

Cristian can author every piece of content (blog, FAQ, testimonials, stats, hero/problem/footer copy) in Keystatic without touching code, set SEO metadata per article, and flip pre/post-launch phase via a single environment variable. Any push to `main` rebuilds and deploys within 5 minutes including sitemap regeneration. Code never deploys for content changes.

**FRs covered:** FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR53
**NFRs covered:** NFR30
**ARs covered:** AR6, AR7, AR16, AR25

### Epic 6: Discoverability — SEO & Analytics

Search engines fully index the site (sitemap, robots.txt, JSON-LD for Organization/WebSite/BlogPosting/FAQ, canonical URLs, image SEO) and Cristian can monitor traffic, conversion events, UTM attribution, and micro-survey responses through a privacy-respecting, cookieless analytics dashboard. Lighthouse SEO ≥ 95.

**FRs covered:** FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR44, FR55
**NFRs covered:** NFR28, NFR29, NFR39
**ARs covered:** AR14, AR26

### Epic 7: Compliance, Privacy & Operational Reliability

The site is GDPR-compliant from day one, errors are tracked in Sentry EU, every third-party integration boundary degrades gracefully with documented fallbacks, and Cristian receives automated alerts when anything breaks. Visitors can trust the site; operations have visibility into failures.

**FRs covered:** FR45, FR46, FR47, FR48, FR49
**NFRs covered:** NFR13, NFR35, NFR37
**ARs covered:** AR15, AR19
**UX-DRs covered:** UX-DR24

### Epic 8: Launch Readiness — Post-Launch Variants & Launch Checklist

Every section's post-launch variant (app store buttons, real testimonial slot, app store ratings, live stats widget placeholder) is built, QA'd, and ready before launch day. SPF/DKIM/DMARC are configured, DNS is cut over, and Cristian can flip `LAUNCH_PHASE=post` and the page transitions with zero downtime, no SEO loss, and no analytics gap. The full Cloudflare Worker + KV stats implementation is intentionally deferred to V1.1 — V1 ships the layout slot and a stub.

**FRs covered:** FR8, FR9, FR10, FR54
**NFRs covered:** NFR9, NFR32
**ARs covered:** AR20, AR21, AR22, AR28

---

## Epic 1: Foundation & Internationalisation-Ready Shell

A live URL serves a brand-true, accessible, fast-loading, internationalisation-ready Truvis site shell with every PR automatically gated on Lighthouse perf/a11y/SEO budgets.

### Story 1.1: Initialise project from `one-ie/astro-shadcn` starter

As Cristian (the developer),
I want a verified, pruned, branded Astro 5 project initialised from the chosen open-source starter,
So that I have a known-good baseline to build the rest of the landing page on without scaffolding from scratch.

**Acceptance Criteria:**

**Given** the architecture mandates `one-ie/astro-shadcn` as the primary starter (AR1) with `onwidget/astrowind` as the documented fallback,
**When** I run the documented init sequence (`git clone https://github.com/one-ie/astro-shadcn truvis-landing-page` → `rm -rf .git && git init` → `npm install`),
**Then** the starter is verified against the pre-init checklist (MIT/permissive `LICENSE`, repo activity within ~6 months, `package.json` audited and any AI-SDK / heavy analytics deps pruned),
**And** `npm run dev` serves the starter at `http://localhost:4321` without errors,
**And** `npm run build && npx lighthouse <local-url>` produces a baseline report whose Performance, Accessibility, and SEO scores are recorded in `README.md` for future regression comparison,
**And** the first commit on the `main` branch contains the pruned starter snapshot with a `README.md` describing how to run the project,
**And** if the starter fails verification, the fallback `onwidget/astrowind` is initialised instead and the deviation is documented in `README.md` (AR1).

### Story 1.2: Provision Cloudflare Pages and CI/CD with Lighthouse budget gates

As Cristian,
I want every PR automatically deployed to a preview URL and blocked from merging when it breaches the perf / a11y / SEO budgets,
So that performance, accessibility, and SEO regressions cannot land on `main`.

**Acceptance Criteria:**

**Given** the project repo exists on GitHub from Story 1.1 and the architecture selects Cloudflare Pages as the host (AR3),
**When** I create the Cloudflare Pages project linked to the GitHub repo and configure environment variables scoped per environment (`local`, `preview`, `production`) with placeholders for `LAUNCH_PHASE`, `LOOPS_API_KEY`, `SENTRY_DSN`, `PLAUSIBLE_DOMAIN`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `PUBLIC_SITE_URL`,
**Then** push to `main` auto-builds and deploys to production (AR5),
**And** every PR receives a unique preview deployment URL (AR5),
**And** TLS 1.2+ is enforced via Cloudflare with HSTS enabled (NFR10),
**And** Cloudflare WAF rate limiting is configured at the edge with a placeholder rule ready for the blog API in Epic 4 (AR3, NFR14),
**And** rolling back to the previous deployment via the Cloudflare Pages dashboard completes in under 2 minutes (NFR38),
**And** the hosting plan documents ≥99.9% uptime SLA in `README.md` (NFR33).

**Given** the architecture requires PR checks gated on Lighthouse budgets (AR4),
**When** I add a `.github/workflows/ci.yml` GitHub Actions workflow,
**Then** the workflow runs on every PR and executes `astro check`, ESLint, Prettier --check, `vitest run`, and Lighthouse CI in sequence,
**And** Lighthouse CI is configured against `lighthouse/lighthouserc.cjs` with hard thresholds: Performance ≥ 90 (NFR6), Accessibility ≥ 90 (NFR25), SEO ≥ 95 (NFR39), LCP < 2.5s (NFR1), CLS < 0.1 (NFR3), and a `lighthouse/budget.json` with total initial weight < 500KB (NFR5),
**And** any threshold breach fails the PR check and blocks merge,
**And** the workflow status is visible on the PR before merge.

### Story 1.3: Apply Truvis brand tokens and typography to Tailwind config

As a visitor,
I want every page to render in the Truvis warm-editorial visual language with consistent typography,
So that the site feels like a single coherent brand from the very first byte.

**Acceptance Criteria:**

**Given** the chosen visual direction in `ux-design-hybrid.html` defines the warm-editorial palette and the UX spec defines the type scale,
**When** I customise `tailwind.config.ts` with the Truvis design tokens,
**Then** the config exposes the full color palette: `bg #FFFDF9`, `surface #F7F5F2`, `surface-2 #FFF8EF`, `surface-3 #EEF7F7`, `text/primary #2E4057`, `primary-light #3B5068`, `muted #5F6F7E`, `faint #8E99A4`, `teal #3D7A8A`, `teal-bright #2DA5A0`, `amber #F5A623`, `amber-light #FFBA42`, `coral #FF6B6B`, severity `green #22C55E`, `yellow #F59E0B`, `red #EF4444`, and divider `rgba(46,64,87,.12)` (UX-DR1),
**And** the spacing scale uses the 4pt rem grid (`1 = 0.25rem` through `24 = 6rem`),
**And** the radius scale is exposed (`sm 0.5rem`, `md 0.75rem`, `lg 1rem`, `xl 1.25rem`, `2xl 1.5rem`, `full 999px`),
**And** the warm-tinted shadow scale (`shadow-sm`, `shadow-md`) uses the documented `rgba(46,64,87,.0X)` values,
**And** all tokens validate WCAG 2.1 AA contrast: primary on `bg` ≥10:1 (AAA), teal on `bg` ≥4.5:1 (AA), white on primary ≥10:1 (AAA), with the validation report committed to `README.md` (NFR20, UX-DR30).

**Given** the UX spec requires fluid `clamp()` typography (UX-DR2),
**When** I extend the Tailwind config with the type scale,
**Then** the scale matches the hybrid direction values: `text-xs clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)` through `text-hero clamp(2.25rem, 1.4rem + 3.2vw, 3.5rem)`,
**And** Plus Jakarta Sans (display) and Inter (body) variable fonts are loaded via `@font-face` from `src/assets/fonts/` with `font-display: swap`,
**And** both fonts are subset to Latin + Latin Extended (each variable file ≤ ~30KB),
**And** the hero display font is preloaded via `<link rel="preload">` in `<head>` to minimise CLS (NFR3),
**And** a system-font fallback stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` is declared,
**And** the total CSS + font weight on the home page remains under the 500KB initial budget (NFR5).

### Story 1.4: Build BaseLayout, Header, Footer, MobileNav drawer and SectionEyebrow shell

As a visitor on any page of the Truvis landing page,
I want a consistent header (with mobile drawer), footer with site links and social profiles, and a base layout with semantic structure,
So that I can navigate the site, find legal/social links, and screen readers and search engines understand the page structure.

**Acceptance Criteria:**

**Given** Astro's three-tier component hierarchy is the project convention (AR23),
**When** I create `src/layouts/BaseLayout.astro`,
**Then** it renders a complete `<html lang>` document with `<head>` containing meta charset, viewport, title slot, description slot, canonical URL slot (FR42), Open Graph + Twitter card slots, and a JSON-LD slot,
**And** the body uses semantic landmarks (`<header>`, `<main>`, `<footer>`) with `<nav>` inside the header,
**And** a "Skip to main content" link is the first focusable element on the page, visible only on focus, and jumps to `<main>` (UX-DR27, NFR21),
**And** every page that uses BaseLayout has exactly one `<h1>` and no skipped heading levels (UX-DR28, NFR22),
**And** `public/robots.txt` is committed with a standard `User-agent: * / Allow: /` configuration (FR43).

**Given** the UX spec defines a desktop nav menu and a mobile drawer (UX-DR10),
**When** I build `src/components/sections/header.astro`,
**Then** the desktop header uses shadcn `NavigationMenu` against the warm-white background with primary text and teal-slate hover, with a prominent Blog link,
**And** below the `tablet` breakpoint (<768px) the desktop menu is replaced by a mobile menu trigger button rendered with `client:idle` hydration (AR27),
**And** the trigger opens a `MobileNav` React island in `src/components/islands/mobile-nav.tsx` using shadcn `Sheet` (slide-in from right, full height) hydrated `client:idle`,
**And** the mobile nav contains the same nav items as the desktop nav,
**And** the nav drawer open/closed state is held in a `$mobileNavOpen` nanostore in `src/lib/stores/mobile-nav-store.ts` with `openMobileNav()` / `closeMobileNav()` actions (AR24),
**And** all nav items are keyboard navigable (Tab / Enter / Escape closes drawer) (NFR21),
**And** every interactive element meets the 44×44px minimum touch target on mobile (UX-DR26).

**Given** UX-DR9 requires a Footer with site links and social profiles (FR11),
**When** I build `src/components/sections/footer.astro`,
**Then** the footer renders columns for product links, blog link, privacy/terms link slots (filled in Epic 7), social media link placeholders (Twitter/X, Instagram, TikTok — FR11), and a copyright line,
**And** the footer is responsive (column stack on mobile, row on desktop),
**And** all link targets meet the 44×44px touch target rule.

**Given** UX-DR11 requires a reusable SectionEyebrow pattern,
**When** I build `src/components/sections/section-eyebrow.astro`,
**Then** the component accepts `eyebrow` (string), `heading` (slot), and `variant` (`'light' | 'dark'`) props,
**And** the light variant renders a teal-slate filled pill with white text and primary heading,
**And** the dark variant renders a warm-amber outlined pill with white heading,
**And** both variants are consumed by at least one example section in a Storybook-style demo page (or smoke test markup committed under `src/pages/_demo/`).

### Story 1.5: Build branded 404 and 500 error pages

As a visitor who lands on an invalid URL or hits a server error,
I want a branded error page that explains what happened and offers a way back,
So that I am not dumped onto an unbranded host page and I can find my way to useful content.

**Acceptance Criteria:**

**Given** Astro supports a `src/pages/404.astro` for unmatched routes,
**When** I create `src/pages/404.astro` using BaseLayout,
**Then** the page renders with the Truvis brand visuals (warm bg, primary text, hero typography),
**And** the page contains a clear "Page not found" heading and a friendly Inspector/Ally voice message,
**And** the page provides at least two CTA links: one back to the landing page (`/`) and one to the blog index (`/blog`) (FR56),
**And** the page returns HTTP 404 status when accessed via Cloudflare Pages,
**And** the page is keyboard navigable and meets WCAG 2.1 AA contrast (UX-DR25, NFR19, NFR20).

**Given** Astro supports `src/pages/500.astro` for server errors,
**When** I create `src/pages/500.astro` using BaseLayout,
**Then** the page renders with the same brand visuals as the 404 page and offers the same nav-back CTAs,
**And** the page advises the visitor to retry shortly,
**And** the page is referenced from the Cloudflare Pages error handling configuration so it serves on 5xx responses.

### Story 1.6: Wire Astro built-in i18n routing and locale-detection middleware

As a visitor whose browser language is French or German,
I want the site to be ready for `/fr/` and `/de/` URLs even though only English content ships at V1,
So that adding translated content in V1.2 requires no rearchitecture and my browser language preference is respected from day one.

**Acceptance Criteria:**

**Given** the architecture mandates Astro 4+ built-in i18n routing (AR17),
**When** I configure `astro.config.mjs`,
**Then** the i18n block sets `defaultLocale: 'en'`, `locales: ['en', 'fr', 'de']`, and `routing: { prefixDefaultLocale: false }` so `/` serves English while `/fr/` and `/de/` are reserved for future content (FR50),
**And** stub directories `src/i18n/en/`, `src/i18n/fr/`, `src/i18n/de/` exist with placeholder JSON namespace files: `common.json`, `landing.json`, `blog.json`, `faq.json`,
**And** the English JSON files contain real strings; the French and German files contain the same keys with identical English strings as placeholders (FR52),
**And** `src/lib/i18n.ts` exports a `t(key, locale)` helper that accepts dot-notation keys (`landing.hero.headline`) and returns the matching string from the requested locale's JSON namespace, falling back to English when missing,
**And** `t()` supports named placeholders (`{amount}`) and never positional `{0}` placeholders.

**Given** AR18 requires browser language detection,
**When** I add an Astro middleware at `src/lib/middleware/locale-detection.ts` (or `src/middleware.ts` per Astro convention),
**Then** the middleware checks the `Accept-Language` header on first visit,
**And** if a stored locale preference exists in cookie or localStorage it takes precedence over the header (FR51),
**And** if neither indicates French or German, the visitor is served English without redirect,
**And** if the header indicates French or German, the visitor is redirected to the matching locale URL (which still serves English copy at V1 because no translated content exists yet),
**And** the middleware does NOT redirect requests to `/api/*` or `/keystatic/*`.

### Story 1.7: Codify accessibility, motion, text-expansion and component conventions

As an AI agent or human contributor opening this project for the first time,
I want explicit, enforceable conventions for accessibility, motion, text expansion, component tiering, hydration, and state,
So that I cannot accidentally violate the architecture's pattern decisions and the codebase remains coherent across many sessions.

**Acceptance Criteria:**

**Given** the architecture defines a three-tier component hierarchy (AR23) and a hydration directive policy (AR27),
**When** I commit the convention scaffolding,
**Then** `src/components/ui/`, `src/components/sections/`, `src/components/forms/`, `src/components/blog/`, and `src/components/islands/` directories exist with a `README.md` in each explaining what belongs there,
**And** an ESLint rule (custom or via config) flags any `client:load` directive on a component outside of `src/components/islands/` AND outside an above-the-fold conversion-critical context, OR a code-review checklist documents this rule in `CONTRACT.md` if a custom ESLint rule is impractical at V1,
**And** `tsconfig.json` is configured with strict mode and `@/*` and `~/*` path aliases mapping to `src/*`,
**And** `prettier-plugin-tailwindcss` is installed and configured so Tailwind classes are auto-sorted on save.

**Given** the architecture requires nanostores for cross-island state (AR24),
**When** I commit the state convention,
**Then** `src/lib/stores/` exists with at least one implemented store (`mobile-nav-store.ts` from Story 1.4) following the documented pattern: `$camelCase` prefix, plain action functions exported alongside the store, no direct `.set()` calls from consumers,
**And** `@nanostores/react` is installed and the `mobile-nav-store.ts` is consumed via `useStore()` in the MobileNav island.

**Given** the UX spec defines section color rhythm (UX-DR3),
**When** I commit a `docs/design-conventions.md` (or extend `README.md`),
**Then** the document specifies the section background sequence: white hero → `surface` problem → dark `#2E4057` immersion zone for the inspection story → white social proof → `surface` blog previews → white FAQ → dark `#2E4057` footer CTA bookend,
**And** the document explains that this rhythm is intentional narrative pacing, not arbitrary alternation.

**Given** the UX spec requires reduced-motion discipline (UX-DR32) and 40% text expansion tolerance (UX-DR31, NFR26),
**When** I add the motion and i18n layout convention,
**Then** `src/styles/global.css` contains a `@media (prefers-reduced-motion: reduce)` block that disables non-essential transitions globally,
**And** standardised motion duration tokens (`--duration-fast 150ms`, `--duration-base 250ms`, `--duration-slow 400ms`) are defined as CSS custom properties referenced from Tailwind config,
**And** a synthetic FR/DE-length text-expansion validation harness exists at `src/pages/_demo/text-expansion.astro` rendering all current shell components with placeholder strings padded to 140% of their English length,
**And** all shell components built so far (Header, Footer, MobileNav, SectionEyebrow, 404, 500) render correctly in the harness without overflow or truncation.

**Given** the architecture requires that no client-side credentials or secrets exist (NFR12),
**When** I commit `.env.example` and `.gitignore`,
**Then** `.env.example` contains the documented variable names without values,
**And** `.gitignore` excludes `.env`, `node_modules/`, `dist/`, and `.astro/`,
**And** a `lib/env.ts` typed env-access helper exports `getRequired(key)` and `parseBoolean(key)` so components never read `process.env` or `import.meta.env` directly outside of `lib/`.

**Given** WCAG 2.1 AA compliance is required across all pages (NFR19),
**When** I commit the accessibility convention,
**Then** `docs/accessibility-conventions.md` (or `README.md` section) lists the rules every component must follow: semantic HTML first, single `<h1>` per page, `focus-visible:` indicators, never `outline: none` without replacement, color never the sole indicator of meaning, all form inputs have associated `<label>` (NFR24), `aria-live` for dynamically updating content, `aria-hidden="true"` for decorative SVGs (UX-DR28, UX-DR29),
**And** all currently-built shell components (Header, Footer, MobileNav, 404, 500, BaseLayout skip link) have been audited against this checklist and the audit notes are committed.

## Epic 2: Conversion Story — Hero Through Footer CTA

A visitor scrolling the landing page experiences the full pre-launch narrative — hero with financial micro-story → problem validation → six-scene sticky-phone inspection-story scroll (with the Hard Stop climax variant) → social proof stat cards → inline blog previews → FAQ accordion → dark footer CTA bookend — and leaves understanding what Truvis is and why they need it. Every CTA is a named placeholder slot that Epic 3 fills with the real `WaitlistForm`, so Epic 2 is independently shippable as a static "coming soon" page.

### Story 2.1: Build `HeroSection` with micro-story headline, phone mockup and CTA slot

As a first-time visitor landing on the Truvis home page,
I want the first screen I see to tell me — in one line — what problem Truvis solves and for whom,
So that within three seconds I understand whether this is relevant to me and whether I should read further.

**Acceptance Criteria:**

**Given** UX-DR4 requires a `HeroSection` with a financial micro-story headline and phone mockup,
**When** I create `src/components/sections/hero-section.astro` as a Tier-2 composite under the three-tier convention (AR23),
**Then** the component renders inside a white-background `<section>` with the `SectionEyebrow` (light variant) pill reading "The pre-purchase inspection in your pocket",
**And** the `<h1>` (the only `<h1>` on the landing page per UX-DR28) contains a financial micro-story headline wired to the `landing.hero.headline` i18n key (FR52) with a default English string along the lines of "A buyer paid €7,200 for a car with a €900 problem he couldn't see.",
**And** a one-sentence positioning subheadline is rendered in `text-lg` below the headline, wired to the `landing.hero.subheadline` i18n key,
**And** the section uses the `text-hero` fluid `clamp()` token from Story 1.3 so the headline scales from mobile to desktop without layout shift (NFR3),
**And** on desktop (≥1024px) the section is a two-column grid (copy 55% / phone 45%); below 1024px it stacks with copy first, phone second (UX-DR26),
**And** there is no scroll-, load-, or entrance-animation anywhere in the hero — LCP is the priority (NFR1).

**Given** the hero must embed a waitlist CTA without depending on Epic 3,
**When** I wire the CTA area,
**Then** the hero exposes a named Astro `<slot name="cta">` inside the copy column,
**And** the default fallback content of the slot is a placeholder `<div data-cta-slot="hero">` containing a disabled `<button>` with the label "Join the waitlist" styled with the primary teal-slate treatment,
**And** the placeholder button has `aria-disabled="true"` and a visually-hidden explanation "Coming soon — form wires in Epic 3",
**And** Epic 3's `EmailCaptureBlock` (hero variant) drops into the same slot with no markup changes to `hero-section.astro`,
**And** the CTA area carries a `data-testid="hero-cta-slot"` attribute so Epic 3 tests can target it.

**Given** the hero uses a phone-mockup illustration,
**When** I add the phone artwork,
**Then** the phone image is a single optimised `<img>` (WebP with PNG fallback, or inline SVG if under ~6KB) stored in `src/assets/hero/`,
**And** the image has explicit `width` and `height` attributes matching the intrinsic aspect ratio to reserve layout (NFR3),
**And** the image is marked `loading="eager"` and `fetchpriority="high"` because it is above the fold,
**And** the image has a descriptive `alt` attribute (not decorative) summarising the on-screen Truvis scene (NFR22, FR44),
**And** the combined hero image payload is under 80KB transferred (contributes to NFR5 initial-weight budget).

**Given** WCAG 2.1 AA compliance and 40% text-expansion tolerance are required,
**When** I render the hero at the three breakpoints and with synthetic FR/DE-length placeholder strings from Story 1.7's harness,
**Then** nothing clips, truncates, or overflows at mobile / tablet / desktop,
**And** contrast of headline and subheadline against the white background is ≥4.5:1 (UX-DR30),
**And** the hero is keyboard navigable — Tab reaches the CTA placeholder button (NFR21),
**And** a Lighthouse run against a page containing only BaseLayout + HeroSection reports LCP < 2.5s and CLS < 0.1 in the CI Lighthouse job (NFR1, NFR3).

### Story 2.2: Build `ProblemSection` with statistics and CSS-only fade-in

As a visitor who has just read the hero and is deciding whether to keep scrolling,
I want the next section to validate that the problem Truvis solves is real, specific, and expensive,
So that I feel understood and believe the rest of the page is worth my time.

**Acceptance Criteria:**

**Given** UX-DR5 requires a `ProblemSection` on the `surface` background with lightweight CSS-only fade-in,
**When** I create `src/components/sections/problem-section.astro`,
**Then** the section renders on the `bg-surface` (`#F7F5F2`) background enforcing the Story 1.7 color-rhythm convention (white hero → surface problem),
**And** the section opens with a `SectionEyebrow` (light variant) reading "The cost of not knowing",
**And** the section contains an `<h2>` heading (no skipped levels per UX-DR28) wired to the `landing.problem.headline` i18n key,
**And** the body copy renders two to three paragraphs wired to `landing.problem.body` i18n keys, with specific statistics inline (e.g., average hidden-defect cost, percentage of used cars with undisclosed issues) — actual numbers sourced from the `siteContent` collection in Epic 5, but V1 uses hard-coded placeholder strings from the i18n JSON (FR2).

**Given** UX-DR5 requires CSS-only fade-in on scroll (no JS animation libraries, no scroll-jacking),
**When** I add the entrance motion,
**Then** the fade-in is implemented purely with CSS — either the `animation-timeline: view()` scroll-driven animations feature with a graceful fallback, or an IntersectionObserver-free `@keyframes` animation triggered on page load for above-fold detection,
**And** no JavaScript animation library (GSAP, Framer Motion, Motion One, etc.) is introduced,
**And** the entrance animation is wrapped in a `@media (prefers-reduced-motion: no-preference)` block so it is entirely skipped under reduced motion (UX-DR32),
**And** the animation never causes layout shift — only `opacity` and `transform: translateY(...)` are animated (NFR3).

**Given** accessibility and text-expansion requirements,
**When** I audit the section,
**Then** the body text contrast against `bg-surface` is ≥4.5:1 (UX-DR30),
**And** the section renders without clipping under 140% synthetic FR/DE placeholder strings in the Story 1.7 text-expansion harness (UX-DR31),
**And** the section has a semantic `<section aria-labelledby="...">` wrapper with the `<h2>` providing the label (UX-DR28).

### Story 2.3: Build `StatCard` and `TrustQuoteCard` Tier-2 primitives (pre-launch variants)

As a content author and a downstream section author,
I want a reusable stat card and a reusable quote card with strongly-typed props and a visual language that already matches the Truvis palette,
So that any section that needs "a number with a label" or "a trustworthy quote" can drop the component in without reinventing the design.

**Acceptance Criteria:**

**Given** UX-DR21 defines the `StatCard` visual language,
**When** I create `src/components/sections/stat-card.astro`,
**Then** the component accepts typed props: `value` (string), `label` (string), `source` (string, optional micro-citation), `category` (`'teal' | 'amber' | 'coral'`), and `phase` (`'pre' | 'post'`, default `'pre'`) for Epic 8 reuse,
**And** the card renders a 4px top border coloured by `category` — teal `#3D7A8A`, amber `#F5A623`, or coral `#FF6B6B`,
**And** the card body renders the `value` in the hero display font at a size roughly 2x the label, the `label` in primary text colour, and the `source` (when present) in `text-xs` muted colour with a preceding "Source: " prefix,
**And** the card uses the `surface` or white background with the Story 1.3 `shadow-sm` warm shadow and `radius-lg` corner,
**And** no click/hover behaviour is added — this is a purely presentational component,
**And** a smoke page at `src/pages/_demo/stat-card.astro` renders six StatCards (two of each category) so the component can be visually verified in the local dev server.

**Given** UX-DR22 requires `TrustQuoteCard` with two phase variants and V1 scope ends at the pre-launch variant,
**When** I create `src/components/sections/trust-quote-card.astro`,
**Then** the component accepts typed props: `quote` (string), `attribution` (string), `context` (string, optional), `phase` (`'pre' | 'post'`, default `'pre'`), and post-launch-only optional props `rating` (1-5 number) and `authorImage` (`{src, alt, width, height}` object),
**And** when `phase === 'pre'`, the card renders with warm-amber quote marks (large SVG quotation glyph top-left), italic editorial serif-adjacent treatment, quote body, and a small source-attribution line below,
**And** when `phase === 'post'`, the card is a structural stub that renders the same quote and attribution plus hidden `{rating}` and `{authorImage}` prop wiring — the full post-launch styling (author photo, star rating) is intentionally deferred to Epic 8 and a `TODO(epic-8)` comment is left in the template,
**And** the card uses the white or `surface` background with `shadow-sm` and `radius-lg` matching StatCard,
**And** a smoke page at `src/pages/_demo/trust-quote-card.astro` renders two pre-launch TrustQuoteCards so the component is visually verifiable.

**Given** both components will be consumed by Story 2.6 and later by Epic 8,
**When** I finalise both components,
**Then** both accept a `class` prop (merged with the component's default classes via the shadcn `cn()` pattern) so consumers can tweak spacing/width without editing the component,
**And** both render correctly under `prefers-reduced-motion` (they have no motion, so this is a no-op assertion),
**And** both pass an axe-core snapshot test (or manual WCAG AA audit) for contrast and semantic structure (NFR19, UX-DR30),
**And** neither component imports from another feature — only from `@/components/ui/*` and `@/lib/*` (AR23).

### Story 2.4: Build `InspectionStoryScroll` React island with sticky-phone mechanism and one placeholder scene

As a visitor encountering Truvis's six capabilities for the first time,
I want the page to show me what Truvis does with a single phone that evolves as I scroll instead of six disconnected marketing blocks,
So that the product feels like one coherent inspection experience, not a feature matrix.

**Acceptance Criteria:**

**Given** UX-DR12 requires a sticky-phone-with-Intersection-Observer scroll mechanism as a React island,
**When** I create `src/components/islands/inspection-story-scroll.tsx`,
**Then** the island is a React component exported as `default` and hydrated via `client:visible` directive when consumed (AR27),
**And** the island renders a two-column layout on ≥768px: left column = scrollable narrative scene slots, right column = a sticky phone frame (`position: sticky; top: 10vh`),
**And** below 768px the sticky behaviour is disabled — each scene stacks inline with its own phone instance (UX-DR12 mobile fallback),
**And** the phone frame is a single inline SVG (≤2KB) with an interior content slot that accepts React children,
**And** the SVG frame has `aria-hidden="true"` because it is decorative (UX-DR14).

**Given** UX-DR12 requires Intersection Observer scene tracking with state in a nanostore,
**When** I wire the observer,
**Then** `src/lib/stores/inspection-story-store.ts` exports a `$currentScene` nanostore (number, default `0`) and actions `setCurrentScene(index)` / `resetInspectionStory()` following the Story 1.7 nanostore conventions (AR24),
**And** the island uses `@nanostores/react` `useStore()` to read `$currentScene` and re-render the phone-interior content when it changes,
**And** an IntersectionObserver watches each scene slot with `rootMargin` and `threshold` tuned so the scene becomes "current" when its centre crosses the viewport midpoint,
**And** scene-content transitions are a pure CSS `opacity + transform` crossfade with a 300ms ease duration sourced from the `--duration-base` token (Story 1.7),
**And** under `prefers-reduced-motion` the crossfade is removed and content swaps instantly (UX-DR12, UX-DR32).

**Given** this story must be independently completable without Story 2.5,
**When** I ship the scaffold,
**Then** the island accepts a `scenes` prop typed as `{id: string; label: string; children: ReactNode}[]` and renders whatever scenes the caller passes,
**And** a placeholder consumer at `src/pages/_demo/inspection-story.astro` mounts the island with **one** hard-coded placeholder scene ("Scene 0 — Placeholder") so the mechanism can be manually tested end-to-end in the dev server,
**And** the placeholder demo page exercises: scrolling into view, crossfade timing, reduced-motion fallback, and mobile-stacked fallback below 768px,
**And** Story 2.5 populates the real six scenes by passing a different array to the same island — no changes to the island itself.

**Given** UX-DR14 requires a scene progress indicator and screen-reader announcements,
**When** I add the indicator and a11y hooks,
**Then** a progress indicator (dot row or thin bar) is rendered below or beside the sticky phone showing the current scene index 1 of N with `aria-label="Scene {n} of {total}"`,
**And** the scene-content container has `aria-live="polite"` so screen readers announce scene changes as the user scrolls,
**And** the indicator updates in sync with `$currentScene`,
**And** the island is keyboard-accessible — Tab skips through interactive elements inside scene content without being trapped (NFR21),
**And** the placeholder demo reports no axe-core violations.

**Given** UX-DR15 requires entrance animations with reduced-motion fallback,
**When** I add per-scene entrance motion,
**Then** scenes not yet scrolled are `opacity: 0; transform: translateY(20px)`,
**And** entering scenes fade in and slide up over 400ms ease (CSS-only, no JS),
**And** already-past scenes remain visible (no fade-out),
**And** all entrance animations are removed under `prefers-reduced-motion: reduce` (UX-DR32).

### Story 2.5: Build the six `InspectionStoryScene` content blocks with Hard Stop climax variant

As a visitor scrolling the inspection-story section,
I want each of Truvis's six capabilities to be told as a short, specific, voice-consistent mini-story — not a feature bullet — with the Hard Stop moment landing as the emotional peak,
So that I leave the section understanding what Truvis does and feeling that it would have my back.

**Acceptance Criteria:**

**Given** UX-DR13 requires six scenes, one per Truvis capability, in the documented scene order,
**When** I create `src/components/sections/inspection-story-scene.astro` (or a React component if its content needs to live in the island tree) and the six scene instances,
**Then** the six scenes are authored in this order: (1) Model DNA, (2) Severity Calibrator, (3) Personal Risk Calibration, (4) Poker Face Mode, (5) **Hard Stop Protocol (climax)**, (6) Negotiation Report — satisfying FR3,
**And** each scene contains: a scene number + label (`Scene 3 · Personal Risk Calibration`), a 70/30 Inspector/Ally narrative paragraph (Inspector-forward, Ally-softened) of 2–4 sentences, a feature name callout, and a one-line feature benefit,
**And** each scene's copy is sourced from the `landing.inspectionStory.scene{n}` i18n keys (FR52) with real English strings — French and German mirror the English strings as placeholders,
**And** scenes 1–4 and 6 use the standard layout (text-left column, phone-right sticky, on ≥768px),
**And** scene 5 (Hard Stop) uses the climax variant: centered column layout, a larger phone instance (or a `scale(1.05)` treatment on the sticky phone), and a severity-red accent border on the scene content (UX-DR13 climax variant).

**Given** the phone-interior content per scene,
**When** I design each scene's phone-interior,
**Then** each scene's phone-interior content is a small composition of Tier-1 primitives (badge, text, divider) representing the visual state of that Truvis feature — no real screenshots, no heavy images,
**And** the phone-interior for the Hard Stop scene renders the severity-red Hard Stop banner with text ("This car is a no-go") that matches the mobile-app's Hard Stop Protocol language (voice consistency),
**And** each phone-interior is under 2KB of inline SVG/markup (NFR5),
**And** the six scenes are passed to the Story 2.4 island's `scenes` prop from a landing-page consumer with no edits to the island itself.

**Given** a11y and text-expansion requirements,
**When** I audit the scenes,
**Then** each scene has a `<h3>` heading (sub-heading to the section's `<h2>`) respecting the Story 1.7 heading hierarchy (UX-DR28),
**And** every scene renders correctly under 140% synthetic FR/DE placeholder strings in the text-expansion harness (UX-DR31),
**And** every scene meets WCAG 2.1 AA contrast on the dark `#2E4057` section background (white / teal / amber text all ≥4.5:1, severity-red accents paired with text labels so colour is never the sole indicator) (UX-DR29, UX-DR30),
**And** the full inspection-story section is added to the landing-page composition at the expected position (replacing Story 2.4's `_demo/inspection-story.astro` as the canonical consumer).

### Story 2.6: Build `SocialProofSection` with pre-launch market statistics

As a visitor wondering whether the problem Truvis describes is real and widespread,
I want to see concrete market statistics and a trustworthy quote that validate the problem at scale,
So that I trust Truvis is building on top of real, researched data rather than marketing hand-waving.

**Acceptance Criteria:**

**Given** UX-DR6 requires a `SocialProofSection` that renders pre-launch market `StatCard`s with post-launch switching deferred to Epic 8,
**When** I create `src/components/sections/social-proof-section.astro`,
**Then** the section renders on the white background (maintaining the Story 1.7 color rhythm) with a `SectionEyebrow` (light variant) reading "The numbers don't lie",
**And** the section `<h2>` is wired to the `landing.socialProof.headline` i18n key,
**And** the section renders exactly three pre-launch `StatCard` instances (from Story 2.3) in a responsive grid (three-column on desktop, single-column stack on mobile) with data from the `landing.socialProof.stats` i18n array — placeholder values and source citations at V1, wired to the `stats` Content Collection in Epic 5 (FR4),
**And** each of the three StatCards uses a different `category` colour (teal / amber / coral) for visual rhythm.

**Given** UX-DR6 requires `TrustQuoteCard` slots for both phases,
**When** I add the quote slot,
**Then** one pre-launch `TrustQuoteCard` (from Story 2.3) is rendered below the stats grid with a quote sourced from the `landing.socialProof.quote` i18n key,
**And** an Astro `<slot name="post-launch-testimonial">` is declared but empty — Epic 8 fills it with the post-launch testimonial content (FR5),
**And** phase switching is a commented-out code path that reads `isPostLaunch()` from `src/lib/launch-phase.ts` (created in Epic 5, so at V1 this is a `TODO(epic-5)` comment — **no import of a non-existent module** — with a hard-coded `pre` assumption).

**Given** FR5 maps to the post-launch variant of the TrustQuoteCard (Epic 8),
**When** the V1 section ships,
**Then** the V1 section only covers FR4 (pre-launch market statistics) and FR5 is explicitly documented as "variant slot ready, post-launch content injected in Epic 8" in a code comment,
**And** the section passes WCAG 2.1 AA contrast, text-expansion, and keyboard-navigation audits (UX-DR30, UX-DR31, NFR21).

### Story 2.7: Build `BlogPreviewsSection` with inline placeholder cards

As a visitor who has just been convinced by the story above and wants proof Truvis has real expertise,
I want to see two or three blog article previews on the landing page so I can dip into Truvis's content without committing to the waitlist,
So that I can gauge Truvis's credibility and maybe bookmark the blog for later.

**Acceptance Criteria:**

**Given** UX-DR7 requires an inline blog-preview section,
**When** I create `src/components/sections/blog-previews-section.astro`,
**Then** the section renders on the `bg-surface` background (Story 1.7 color rhythm: white social proof → surface blog previews),
**And** the section opens with a `SectionEyebrow` (light variant) reading "From the Truvis blog",
**And** the section `<h2>` is wired to the `landing.blogPreviews.headline` i18n key,
**And** the section renders exactly three preview cards in a responsive grid (three-column ≥1024px, two-column 640–1024px, single-column <640px).

**Given** the real `BlogPreviewCard` component and the `blog` Content Collection are intentionally built in Epic 4 (UX-DR20 stays in Epic 4),
**When** I implement the V1 placeholder cards,
**Then** a local-only `src/components/sections/_blog-preview-placeholder.astro` partial is created inside this section's directory, prefixed with an underscore to flag it as throwaway,
**And** the placeholder accepts typed props `{category: string; title: string; excerpt: string; readTime: string}` and renders a simplified card layout (category badge, H3 title, 2-line truncated excerpt, read-time, "Read article →" disabled link) matching the visual direction of UX-DR20 just enough to validate the section layout,
**And** the three placeholder cards are populated from hard-coded placeholder data inside `blog-previews-section.astro` with a code comment `TODO(epic-4): replace placeholder partial with real BlogPreviewCard + getBlogPreviews() content helper`,
**And** the "Read article →" link is an inert `<a aria-disabled="true" tabindex="-1">` at V1 so visitors cannot click through to non-existent articles.

**Given** a11y and responsive requirements,
**When** I audit the section,
**Then** card text meets WCAG 2.1 AA contrast against `bg-surface` (UX-DR30),
**And** the section renders without clipping under 140% synthetic FR/DE text (UX-DR31),
**And** each placeholder card is keyboard-reachable (though inert), and focus indicators are visible (UX-DR29),
**And** the section is wrapped in `<section aria-labelledby="...">` with the `<h2>` as the label (UX-DR28).

### Story 2.8: Build `FaqSection` with shadcn `Accordion` and placeholder entries

As a visitor who still has objections (is this safe? does it replace a mechanic? what does it cost? what does it do with my data?),
I want a FAQ accordion on the landing page that answers my top questions without making me leave the page,
So that I can resolve my objections and come back to the CTA with fewer blockers.

**Acceptance Criteria:**

**Given** UX-DR8 requires a FAQ section using shadcn `Accordion`,
**When** I create `src/components/sections/faq-section.astro`,
**Then** the section renders on the white background (Story 1.7 color rhythm: surface blog previews → white FAQ),
**And** the section opens with a `SectionEyebrow` (light variant) reading "Frequently asked",
**And** the section `<h2>` is wired to the `landing.faq.headline` i18n key,
**And** the shadcn `Accordion` primitive from `src/components/ui/accordion` is consumed with `type="single"` (only one item open at a time) and is rendered as a server component (no hydration directive needed unless the primitive requires `client:idle`, in which case `client:idle` is used per AR27),
**And** the accordion renders 6–8 placeholder FAQ entries authored in `landing.faq.items` i18n array covering the canonical questions: scope, relationship to professional inspection, privacy, cost, platforms, accuracy, data retention (FR6),
**And** each accordion chevron rotates 180° on expand with the warm-amber accent color from the design tokens, and the rotation is removed under `prefers-reduced-motion` (UX-DR32).

**Given** FR41 (JSON-LD FAQ structured data) and the `lib/structured-data.ts` helper are intentionally Epic 6's scope,
**When** I ship V1,
**Then** no JSON-LD is injected from this component — a `TODO(epic-6): inject faqJsonLd() via BaseLayout JSON-LD slot` comment marks the insertion point,
**And** the FAQ content itself is placeholder-strings-in-i18n at V1, with a `TODO(epic-5): source from faq Content Collection via lib/content.ts` comment — no imports of non-existent modules,
**And** `lib/structured-data.ts` and the `faq` content collection are not created by this story.

**Given** accordion a11y is critical,
**When** I audit the section,
**Then** each accordion item has `aria-expanded` toggled correctly,
**And** keyboard navigation follows WAI-ARIA Accordion Pattern (Tab to focus, Enter/Space to toggle, Arrow keys between items where supported) (NFR21),
**And** focus indicators are visible on every interactive accordion trigger (UX-DR29),
**And** text contrast of question and answer meets WCAG 2.1 AA against white (UX-DR30),
**And** the section renders without clipping under 140% synthetic FR/DE text with expanded answers (UX-DR31),
**And** axe-core reports zero violations on a page containing the FAQ section.

### Story 2.9: Build `FooterCtaSection` and compose the full landing page with CTA placeholder slots

As a visitor who has read the entire page and is now at the bottom,
I want one last clear invitation to join the waitlist before the site's small-print footer,
So that my conversion moment is obvious and not buried under legal links.

**Acceptance Criteria:**

**Given** UX-DR3 requires a dark `#2E4057` footer CTA bookend and UX-DR9 's FooterCtaSection is in Epic 2's scope,
**When** I create `src/components/sections/footer-cta-section.astro`,
**Then** the section renders on the dark primary `#2E4057` background (Story 1.7 color rhythm: white FAQ → dark footer CTA bookend),
**And** the section opens with a `SectionEyebrow` (dark variant — warm-amber outlined pill) reading "Ready to buy smarter?",
**And** the `<h2>` (white) is wired to the `landing.footerCta.headline` i18n key with a default English string along the lines of "Your next car deserves a second opinion.",
**And** a one-sentence subheadline in `text-muted-on-dark` (or equivalent high-contrast off-white) is wired to `landing.footerCta.subheadline`,
**And** the section exposes a named Astro `<slot name="cta">` with a default fallback placeholder identical in contract to the hero slot (disabled "Join the waitlist" button, `data-cta-slot="footer"`, `data-testid="footer-cta-slot"`),
**And** text contrast of white on `#2E4057` is ≥10:1 (AAA) and warm-amber eyebrow on `#2E4057` is ≥4.5:1 (UX-DR30),
**And** the section renders correctly under 140% synthetic FR/DE text (UX-DR31).

**Given** FR7 requires multi-position CTAs (hero, mid-page, footer),
**When** I compose the landing page at `src/pages/index.astro`,
**Then** the page uses `BaseLayout` from Story 1.4 with the page title, description, and canonical URL slots populated,
**And** the page renders in this exact order: `<Header>` (from Story 1.4) → `<HeroSection>` (Story 2.1) → `<ProblemSection>` (Story 2.2) → `<InspectionStoryScroll>` with the six scenes from Story 2.5 → `<SocialProofSection>` (Story 2.6) → `<BlogPreviewsSection>` (Story 2.7) → `<FaqSection>` (Story 2.8) → `<FooterCtaSection>` (this story) → `<Footer>` (Story 1.4),
**And** a third CTA placeholder (`data-cta-slot="mid"`, `data-testid="mid-cta-slot"`) is inserted between the `InspectionStoryScroll` and the `SocialProofSection` as a narrow full-width band containing the same disabled "Join the waitlist" button treatment, satisfying FR7's mid-page CTA requirement,
**And** all three CTA slots (`hero`, `mid`, `footer`) use the same placeholder markup convention so Epic 3 can replace them with one find-and-replace,
**And** the composed page passes the CI Lighthouse thresholds from Story 1.2: Performance ≥90 (NFR6), Accessibility ≥90 (NFR25), SEO ≥95 (NFR39), LCP <2.5s (NFR1), CLS <0.1 (NFR3), initial-weight <500KB (NFR5).

**Given** FR11 (social media profile links) is already wired to placeholder URLs in Story 1.4's `Footer` and real social URLs are deferred to Epic 5's CMS,
**When** I ship this story,
**Then** no social URLs are hard-coded in this story — the Footer from Story 1.4 continues to render the Epic 1 placeholders, and a `TODO(epic-5): wire real social URLs from siteContent collection` comment is added at the Footer call site in `index.astro` if not already present,
**And** FR11 is therefore delivered in its "architecturally wired, content-pending" form at the end of Epic 2, and fully realised in Epic 5.

**Given** the full landing page is now composed,
**When** I run the dev server and walk through the page,
**Then** scrolling from top to bottom flows cleanly through every section with no layout shift, no broken images, and no console errors,
**And** all three CTA placeholders are visible, keyboard-reachable, and labelled as "coming soon" to screen readers,
**And** a manual end-to-end smoke check at the three breakpoints (mobile <640px, tablet 640–1024px, desktop ≥1024px) confirms no horizontal scroll, no overflow, and the inspection-story sticky behaviour activating correctly at ≥768px.

## Epic 3: Waitlist Capture & Confirmation Flow

A visitor can submit their email from any of the three Epic 2 CTA slots, pass invisible anti-spam (honeypot + Cloudflare Turnstile), receive a double opt-in confirmation, land on a branded confirmation page, optionally complete a single-question micro-survey, and be enrolled in the Loops drip series. The pre-launch conversion mechanism works end-to-end with graceful degradation on ESP failure.

### Story 3.1: Provision Loops ESP account, audience, double opt-in and drip series shell

As Cristian,
I want a configured Loops workspace with an API key, an audience, a double opt-in template, and a drip series shell already wired,
So that the `/api/waitlist` route built in Story 3.3 has a concrete ESP to proxy to and the end-to-end opt-in/drip flow is verifiable before launch.

**Acceptance Criteria:**

**Given** AR11 selects Loops as the ESP for waitlist capture, double opt-in, drip series automation, unsubscribe handling, and email delivery,
**When** I create the Loops workspace,
**Then** a Loops account is created on the paid or free tier that supports transactional + audience + automation features,
**And** a single audience named `waitlist-v1` (or equivalent) is created with custom fields `signupSource` (string), `microSurveyAnswer` (string), `locale` (string), and `launchPhase` (string, default `'pre'`),
**And** an API key scoped to the minimum permissions needed (add contact, update contact, send transactional) is generated,
**And** the API key is stored in Cloudflare Pages environment variables as `LOOPS_API_KEY` for `preview` and `production` scopes from Story 1.2 — **never committed to the repo** (NFR12),
**And** `LOOPS_API_KEY` is added to `.env.example` with an empty value and a comment pointing to the Loops dashboard,
**And** `LOOPS_AUDIENCE_ID` is also stored as an env var so the API route can target the audience without hard-coding.

**Given** FR14 requires double opt-in for GDPR compliance (also AR11),
**When** I configure Loops,
**Then** a transactional double opt-in confirmation email template is created in the Loops dashboard using Loops's built-in confirmation pattern,
**And** the template subject is authored in the 70/30 Inspector/Ally voice (e.g., "Confirm your Truvis waitlist spot"),
**And** the template body contains a single confirmation CTA button that calls the Loops-generated confirmation link,
**And** on successful confirmation, Loops is configured to move the contact from "pending" to "subscribed" and to fire the drip-series automation trigger,
**And** a test send to Cristian's own email address succeeds and the resulting email renders correctly in Gmail, Apple Mail, and Outlook web (manual smoke).

**Given** FR15 requires automatic drip enrolment on confirmation and per our agreed V1 scope only the opt-in template plus one placeholder drip email ship in this story,
**When** I set up the drip automation,
**Then** a Loops automation named `waitlist-drip-v1` is created and triggered by the "subscribed" event of the `waitlist-v1` audience,
**And** the automation contains exactly one placeholder drip email scheduled at `T+24h` with subject "Welcome to Truvis — here's what's next" and a short Inspector/Ally placeholder body,
**And** the remaining 3–5 drip emails are documented as `TODO(epic-8-content)` in a launch-readiness checklist file (`docs/launch-checklist.md` — created in this story if not present), to be authored in Loops before the launch cutover,
**And** the automation is enabled but sends only to the test audience at this story's completion — production traffic hits it only after Story 3.7's end-to-end verification.

**Given** FR16 requires unsubscribe from every drip email,
**When** I configure Loops,
**Then** Loops's built-in unsubscribe footer is enabled on the opt-in template and the placeholder drip email,
**And** a manual unsubscribe test (from Cristian's own email via the footer link) moves the contact to Loops's "unsubscribed" state and no further drip emails are sent,
**And** the unsubscribe URL structure is documented in `docs/launch-checklist.md` as a reference.

**Given** NFR27 requires ESP integration via API for double opt-in, drip, and unsubscribe,
**When** I audit the setup,
**Then** all four operations (add contact / confirm opt-in / enrol in drip / unsubscribe) are verifiably available via the Loops HTTP API or Loops's built-in automations,
**And** the Loops API base URL and endpoint shapes are noted in `docs/integrations/loops.md` (a thin dev note, not full documentation) for the Story 3.3 implementer.

### Story 3.2: Provision Cloudflare Turnstile and wire site + secret keys

As Cristian,
I want a Cloudflare Turnstile site configured and its keys wired into per-environment secrets,
So that Story 3.3's `/api/waitlist` route can verify Turnstile tokens server-side and the waitlist form can mount the invisible widget client-side.

**Acceptance Criteria:**

**Given** AR13 mandates Cloudflare Turnstile as the invisible CAPTCHA layer for the waitlist form,
**When** I create a Turnstile site in the Cloudflare dashboard,
**Then** the site is created in **invisible (managed)** mode, **not** interactive checkbox mode (UX-DR16 "no user-facing friction"),
**And** the allowed hostnames include the production domain, the `*.pages.dev` preview domain pattern, and `localhost` for local development,
**And** both the public `TURNSTILE_SITE_KEY` and the private `TURNSTILE_SECRET_KEY` are captured.

**Given** Story 1.2 provisioned Cloudflare Pages environment variables per environment,
**When** I wire the Turnstile keys,
**Then** `TURNSTILE_SITE_KEY` is stored as a **public** env var (`PUBLIC_TURNSTILE_SITE_KEY` per Astro's convention so it's exposed to the client) in `preview` and `production` scopes,
**And** `TURNSTILE_SECRET_KEY` is stored as a **private** env var (not prefixed `PUBLIC_`) in `preview` and `production` scopes — **never exposed to the client** (NFR12, AR12),
**And** both variables are added to `.env.example` with empty values and comments pointing to the Cloudflare Turnstile dashboard,
**And** a `lib/env.ts` (from Story 1.7) typed accessor `getTurnstileConfig()` returns `{siteKey, secretKey}` and throws a descriptive error at build time if either is missing in production.

**Given** Turnstile has documented test/development keys that always pass verification,
**When** I document the local-dev workflow,
**Then** `docs/integrations/turnstile.md` (thin dev note) records the Cloudflare-published "always passes" test site key and test secret key for local development use,
**And** the dev note explicitly warns that test keys must never be used in `preview` or `production` scopes — only in a developer's local `.env` file.

**Given** Turnstile sends telemetry and loads a small script from Cloudflare,
**When** I document the loading strategy,
**Then** the dev note specifies that the Turnstile script is loaded lazily (only when a waitlist form is in view) in Story 3.4 — not globally on every page — to keep the initial weight under the 500KB budget (NFR5),
**And** the Cloudflare Turnstile script URL and initialisation pattern are recorded for the Story 3.4 implementer.

### Story 3.3: Build `POST /api/waitlist` server route with honeypot, Turnstile verification, email validation, Loops proxy and retry

As the Truvis backend,
I want a single server-side endpoint that accepts waitlist submissions, enforces two-layer anti-spam, validates the email, proxies to Loops, and degrades gracefully on ESP failure,
So that every waitlist CTA on the site — regardless of position or variant — has one trusted, observable conversion path.

**Acceptance Criteria:**

**Given** AR12 requires a server-side Astro API route at `POST /api/waitlist` that proxies to Loops without exposing the API key,
**When** I create `src/pages/api/waitlist.ts` as an Astro API route,
**Then** the route exports `POST` matching Astro's API-route signature and reads `LOOPS_API_KEY`, `LOOPS_AUDIENCE_ID`, and `TURNSTILE_SECRET_KEY` exclusively via `lib/env.ts`,
**And** no secrets are logged, echoed in error responses, or exposed in any client-visible surface (NFR11, NFR12),
**And** the route accepts `application/json` with body `{email: string; honeypot?: string; turnstileToken: string; signupSource?: string; locale?: string}`,
**And** the route responds with a typed JSON body `{ok: boolean; code: 'success' | 'invalid_email' | 'duplicate' | 'spam' | 'turnstile_failed' | 'esp_unavailable' | 'server_error'; message?: string}` with appropriate HTTP status (`200` success, `400` validation/spam, `429` duplicate or rate limit, `502` ESP failure, `500` unexpected).

**Given** AR13 mandates two-layer anti-spam (honeypot + Turnstile),
**When** the route processes a request,
**Then** the honeypot field is checked **first** — if present and non-empty, the request is **silently rejected** with a `200 {ok: true, code: 'success'}` response so bots cannot differentiate success from rejection (UX-DR16: no user-facing friction per NFR15),
**And** the Turnstile token is verified next via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret key,
**And** a missing, expired, or invalid Turnstile token returns `400 {ok: false, code: 'turnstile_failed'}`,
**And** the honeypot-silent-success path does **not** call Loops, so bot traffic cannot poison the audience.

**Given** FR13 requires email validation with specific error messages,
**When** the route validates the email,
**Then** a regex check rejects obviously-malformed addresses with `400 {ok: false, code: 'invalid_email'}`,
**And** the Loops "add contact" API call handles the duplicate case — if Loops responds that the email already exists as a subscribed contact, the route responds `200 {ok: true, code: 'duplicate'}` so the client UI can show a friendly "You're already in — check your inbox" message instead of an error (a duplicate is not a failure),
**And** if Loops responds that the contact exists but is `pending` (unconfirmed), the route triggers a resend of the confirmation email and responds `200 {ok: true, code: 'duplicate'}`.

**Given** NFR34 requires graceful degradation on ESP failure and NFR17 requires retry-on-rate-limit,
**When** the Loops call fails,
**Then** the route performs in-memory exponential-backoff retry: up to 3 attempts at ~300ms / 700ms / 1500ms before giving up (total budget ~2.5s),
**And** 5xx responses and network errors are retried; 4xx responses other than `429` are not retried,
**And** `429` (rate limit) is retried respecting Loops's `Retry-After` header when present,
**And** on final failure the route responds `502 {ok: false, code: 'esp_unavailable'}` with a user-facing message like "We're having trouble reaching our mailing list. Please try again in a moment.",
**And** a `TODO(epic-7): Sentry.captureException with context` comment marks the failure branch for Epic 7's error-tracking wiring,
**And** a `TODO(v1.1): push to Cloudflare KV replay queue on esp_unavailable` comment marks the V1.1 KV-queue fallback per our agreed V1 scope (in-memory retry only at V1).

**Given** FR12 and the Loops audience contract from Story 3.1,
**When** Loops accepts the submission,
**Then** the contact is added to the `waitlist-v1` audience in the `pending` state with custom fields `signupSource` (passed from the client, e.g., `'hero'`, `'mid'`, `'footer'`), `locale` (passed from the request or inferred from `Accept-Language`), and `launchPhase: 'pre'`,
**And** Loops automatically sends the double opt-in confirmation email authored in Story 3.1,
**And** the route responds `200 {ok: true, code: 'success'}`.

**Given** FR7 requires multi-position CTAs and we want to track which position converts,
**When** the route logs analytics-relevant metadata,
**Then** the route writes a structured log line (console only at V1) with `{code, signupSource, responseTime, turnstileVerified}` so Epic 6's analytics wiring can reuse the shape,
**And** no PII (email) is included in the log line — only the signup source and the outcome code (NFR11).

**Given** correctness of this route is load-bearing,
**When** I add Vitest unit tests under `tests/api/waitlist.test.ts`,
**Then** tests cover: honeypot rejection (silent success), turnstile failure, invalid email, new subscribe success, duplicate, pending-resend, ESP 500 retry eventually-fails, ESP 429 with Retry-After eventually-succeeds, ESP network error eventually-fails,
**And** the tests mock `fetch` — they do **not** hit real Loops or Turnstile endpoints,
**And** all tests pass in the Story 1.2 CI Vitest job.

### Story 3.4: Build `EmailCaptureBlock` composite and `WaitlistForm` React island with full state machine

As a visitor who wants to join the waitlist from the hero, a mid-page CTA, or the footer,
I want a single, consistent email-capture experience with instant feedback, helpful error messages, and no zoom-on-focus on iOS,
So that I can sign up without friction regardless of where I am on the page.

**Acceptance Criteria:**

**Given** UX-DR16 requires a reusable `EmailCaptureBlock` composite with three variants (hero / inline / footer) sharing a single underlying form,
**When** I create `src/components/forms/email-capture-block.astro`,
**Then** the component accepts typed props `variant: 'hero' | 'inline' | 'footer'`, `headline?: string`, `trustMicroCopy?: string`, and `signupSource: 'hero' | 'mid' | 'footer'`,
**And** the `hero` variant renders a contextual headline slot above the form, the form horizontally aligned on desktop / stacked on mobile, and trust micro-copy below (default: "No spam. Unsubscribe anytime. We respect your inbox like we respect your budget." wired via `landing.waitlist.trustMicroCopy` i18n key),
**And** the `inline` variant renders a compact single-line form with no headline, suitable for the mid-page CTA band from Story 2.9,
**And** the `footer` variant renders on the dark `#2E4057` background with white text and a warm-amber-accent submit button suited to the `FooterCtaSection` from Story 2.9,
**And** all three variants embed the same `WaitlistForm` React island (defined below) so the behaviour is identical across positions.

**Given** UX-DR17 requires a `WaitlistForm` React island with hydration discipline,
**When** I create `src/components/islands/waitlist-form.tsx`,
**Then** the component is a React island that accepts `{signupSource, className, variant}` props,
**And** when consumed by `EmailCaptureBlock` in the `hero` variant it is hydrated with `client:load` (above-fold conversion-critical per AR27),
**And** in the `inline` and `footer` variants it is hydrated with `client:visible` (AR27),
**And** the island contains a single `<form>` with: a hidden `honeypot` input labelled `website` with `tabindex="-1"` and `autocomplete="off"` and CSS-hidden via `display: none` and `aria-hidden="true"`, a visible `email` input with `type="email"`, `autocomplete="email"`, `inputmode="email"`, `required`, min font size **16px** to prevent iOS zoom (UX-DR17), and a submit button with a loading spinner slot.

**Given** the Cloudflare Turnstile script is loaded lazily per Story 3.2's loading strategy,
**When** the waitlist island mounts,
**Then** the Turnstile script is injected via a `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer>` tag lazily on the first island mount (idempotent across multiple islands on the page — use a module-level flag),
**And** a hidden Turnstile widget is rendered using `PUBLIC_TURNSTILE_SITE_KEY` in invisible managed mode,
**And** the Turnstile token is read from the widget at submit time and included in the `POST /api/waitlist` request body (AR13),
**And** no form can submit before a Turnstile token is available — the submit button is disabled until the token resolves.

**Given** UX-DR16 defines a full state machine,
**When** I implement the island's state,
**Then** the island defines states `idle`, `focused`, `validating`, `submitting`, `success`, `client_error`, `api_error` and transitions between them via a small reducer or `useState` machine,
**And** `idle`: input empty, placeholder visible, submit button enabled when Turnstile is ready,
**And** `focused`: input has focus, teal-slate focus ring visible (`focus-visible:ring-teal` from Story 1.3) (UX-DR29),
**And** `validating`: HTML5 + regex client validation runs on blur and on submit; if invalid, transition to `client_error`,
**And** `client_error`: severity-red border on input, inline error message near the field (wired to `landing.waitlist.errors.invalidEmail` i18n key), **input text is NOT cleared** (UX-DR16, UX-DR23),
**And** `submitting`: submit button shows spinner, input is `disabled`, Turnstile token attached, `POST /api/waitlist` is called,
**And** `success`: on `{ok: true, code: 'success' | 'duplicate'}` — for `success` navigate to `/waitlist-confirmed?email=<encoded>`, for `duplicate` show an inline "You're already on the list — check your inbox." message and keep the form visible (UX-DR16),
**And** `api_error`: on any non-2xx — show a shadcn `Sonner`/`Toast` notification (severity-red background, bottom-centre on mobile, top-right on desktop), map each server code to a specific i18n error string (`landing.waitlist.errors.turnstileFailed`, `landing.waitlist.errors.espUnavailable`, `landing.waitlist.errors.serverError`), re-enable input, **preserve entered text** (UX-DR16, UX-DR23), and refresh the Turnstile token for retry.

**Given** FR13 requires specific error messages for invalid format, duplicate and submission failure,
**When** I author the i18n strings under `landing.waitlist.errors.*`,
**Then** at minimum these keys exist with English copy: `invalidEmail`, `duplicate`, `turnstileFailed`, `espUnavailable`, `serverError`, `honeypotTriggered` (not user-visible but reserved for logs),
**And** French and German files mirror the keys with placeholder English strings per the Story 1.6 convention.

**Given** accessibility and keyboard navigation are required,
**When** I audit the island,
**Then** the email input has an associated `<label>` (NFR24) with visible label text in the hero variant and a visually-hidden label in inline/footer variants,
**And** the form is keyboard-submittable via Enter (NFR21),
**And** `aria-invalid` is set on the input during `client_error`, and the error message is associated via `aria-describedby`,
**And** the submit button's loading state announces "Submitting" via `aria-live="polite"`,
**And** axe-core reports zero violations on a page containing all three `EmailCaptureBlock` variants,
**And** a `TODO(epic-6): trackEvent('waitlist_signup', {signupSource}) on success` comment is left at the success branch.

**Given** a demo/smoke harness is useful for visual QA independent of the landing page,
**When** I commit the demo page,
**Then** `src/pages/_demo/email-capture.astro` renders all three `EmailCaptureBlock` variants on one page,
**And** each variant uses a distinct `signupSource` so form submissions from the demo page are distinguishable from real landing-page submissions.

### Story 3.5: Replace Epic 2 CTA placeholder slots with real `EmailCaptureBlock`

As a visitor to the Truvis landing page,
I want the three "Join the waitlist" placeholder buttons from Epic 2 to be real, working email capture forms,
So that I can actually sign up — the conversion promise of the whole page becomes functional.

**Acceptance Criteria:**

**Given** Epic 2 shipped three CTA placeholder slots (`hero`, `mid`, `footer`) with a shared markup convention,
**When** I update `src/pages/index.astro` and the affected Epic 2 section components,
**Then** the `HeroSection` CTA slot (Story 2.1) is filled with `<EmailCaptureBlock variant="hero" signupSource="hero">`,
**And** the mid-page CTA band (Story 2.9) is filled with `<EmailCaptureBlock variant="inline" signupSource="mid">`,
**And** the `FooterCtaSection` CTA slot (Story 2.9) is filled with `<EmailCaptureBlock variant="footer" signupSource="footer">`,
**And** all `data-cta-slot="..."` placeholder markers and the "Coming soon — Epic 3" visually-hidden micro-copy are removed,
**And** the three `data-testid="{hero,mid,footer}-cta-slot"` attributes are preserved on the new components for downstream test targeting.

**Given** hydration directive discipline from AR27,
**When** I verify the final hydration strategy,
**Then** the hero `EmailCaptureBlock` mounts its `WaitlistForm` with `client:load` (above-fold conversion-critical),
**And** the mid and footer blocks mount with `client:visible`,
**And** Lighthouse CI performance score remains ≥90 on the composed landing page after the real form mounts (NFR6) — no regression from the placeholder baseline in Story 2.9.

**Given** the three forms share one underlying API route,
**When** I manually submit from each position in a local dev session,
**Then** each submission includes the correct `signupSource` (`hero`, `mid`, or `footer`) in the request body,
**And** each submission succeeds against the dev Turnstile test keys and the dev Loops audience (or a mocked API if Loops dev access is constrained),
**And** the browser network tab confirms `PUBLIC_TURNSTILE_SITE_KEY` is present in the page source **but** `TURNSTILE_SECRET_KEY` and `LOOPS_API_KEY` are **never** present (NFR12).

**Given** the full landing page conversion loop is now live,
**When** I run the Story 1.2 CI job on this PR,
**Then** Lighthouse budgets (Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1) all pass on `/`,
**And** no new axe-core violations are introduced,
**And** the initial page weight remains under the 500KB budget (NFR5) — the lazy Turnstile script contributes only when an island is hydrated and does not bloat the initial payload.

### Story 3.6: Build `/waitlist-confirmed` confirmation page with `ConfirmationPageLayout` and embedded `MicroSurvey`

As a visitor who just submitted the waitlist form,
I want a branded confirmation page that tells me what just happened, asks me one quick question about why I joined, and invites me to share Truvis with someone else,
So that my expectation is set (check your inbox), my "why" is captured for drip segmentation, and Truvis gets an organic referral opportunity.

**Acceptance Criteria:**

**Given** UX-DR18 requires a `ConfirmationPageLayout` for `/waitlist-confirmed`,
**When** I create `src/pages/waitlist-confirmed.astro` using `BaseLayout`,
**Then** the page renders at `/waitlist-confirmed` (and respects the Astro i18n routing from Story 1.6 so `/fr/waitlist-confirmed` and `/de/waitlist-confirmed` also work),
**And** the page uses a centered single-column layout with `max-width: 560px`,
**And** the page renders a teal-slate checkmark icon at the top (inline SVG, ≤1KB, `aria-hidden="true"`),
**And** the page `<h1>` is wired to `landing.confirmation.headline` i18n key with a default English string "You're in.",
**And** the subtext paragraph acknowledges the submitted email and reminds the visitor to check their spam folder — the email is read from the `?email=<encoded>` query parameter and rendered HTML-escaped to prevent XSS,
**And** if the `email` query parameter is missing or invalid, the subtext falls back to a generic "Check your inbox for our confirmation email" message (no crash, no empty placeholder),
**And** the page has a single `<h1>` and no skipped heading levels (UX-DR28).

**Given** the confirmation flow is triggered by Story 3.4's `WaitlistForm` navigating to this page on success,
**When** Loops sends the double opt-in email per Story 3.1,
**Then** the visitor lands on `/waitlist-confirmed` immediately after submission (before the email arrives) so the wait time is covered by the page's "Check your inbox" messaging,
**And** FR14 is fulfilled end-to-end at the landing-page level: submission → confirmation page → opt-in email → confirmation link → Loops "subscribed" state → drip trigger (the round trip is verified in Story 3.7).

**Given** UX-DR18 requires a social-share prompt block,
**When** I add the share block,
**Then** a section below the subtext renders a headline "Know someone who's car shopping?" (`landing.confirmation.shareHeadline` i18n key),
**And** two share actions are provided: a WhatsApp share link (`https://wa.me/?text=<url-encoded message>`) and a "Copy link" button that uses the async Clipboard API to copy `PUBLIC_SITE_URL` to the clipboard and briefly transitions the button label to "Copied!" for ~2 seconds,
**And** the share message copy is wired via `landing.confirmation.shareMessage` i18n key,
**And** both share actions are keyboard-accessible (Enter/Space activates) and meet the 44×44px touch target (UX-DR26, NFR21),
**And** a `TODO(epic-6): trackEvent('confirmation_share_click', {channel})` comment marks where Epic 6 wires analytics.

**Given** UX-DR19 requires an embedded `MicroSurvey` React island answering FR17 ("What brought you here today?"),
**When** I create `src/components/islands/micro-survey.tsx`,
**Then** the island renders a single-question radio-card form with options from an `options` prop (default: `"Looking for inspection tips"`, `"Been burned before"`, `"A friend recommended Truvis"`, `"Just curious for now"`, `"Other"` — wired via `landing.confirmation.microSurvey.options` i18n array),
**And** the island renders a primary "Send" button and a secondary "Skip" ghost link,
**And** the island is hydrated `client:visible` (below the fold — AR27),
**And** on submit the selected option is posted to `POST /api/waitlist` (or a new `POST /api/micro-survey` endpoint — see below) along with the visitor's confirmed email as a correlation key,
**And** the submission is non-blocking: the "Send" button shows a brief spinner, then the form is replaced by a "Thanks! This helps us help you." confirmation message (`landing.confirmation.microSurvey.thanks` i18n key),
**And** if submission fails, the island shows the same message anyway (non-blocking — losing a micro-survey answer is acceptable; frustrating the visitor is not).

**Given** the micro-survey answer needs to end up on the Loops contact for drip segmentation (per Story 3.1's `microSurveyAnswer` custom field),
**When** I decide the endpoint shape,
**Then** the micro-survey posts to a new `POST /api/micro-survey` route at `src/pages/api/micro-survey.ts` that accepts `{email: string; answer: string}` and updates the Loops contact's `microSurveyAnswer` custom field via the Loops "update contact" API,
**And** the route uses the same `lib/env.ts` accessor for `LOOPS_API_KEY` (NFR11, NFR12),
**And** the route does **not** re-run Turnstile verification (the visitor already passed Turnstile in Story 3.3 — the correlation key is the confirmed email),
**And** the route applies a soft rate-limit (e.g., reject more than 3 updates from the same email within 60 seconds) to prevent abuse without friction,
**And** a Vitest unit test mocks the Loops update and asserts the request shape.

**Given** FR17 requires the micro-survey to be a single question on the confirmation page,
**When** I audit,
**Then** the micro-survey is present on `/waitlist-confirmed` below the share block,
**And** the answer is persisted in Loops for drip segmentation,
**And** the page still renders correctly without the island if JavaScript is disabled (the island degrades to a `<noscript>` "Thanks for joining" message),
**And** axe-core reports zero violations on `/waitlist-confirmed`,
**And** the page passes the CI Lighthouse budgets for a non-hero page.

### Story 3.7: Verify end-to-end double opt-in, drip enrolment and unsubscribe via Loops test audience

As Cristian,
I want to run a documented end-to-end smoke test of the entire waitlist conversion loop — submission, opt-in, drip trigger, unsubscribe — against a real Loops test audience,
So that I know the pre-launch conversion mechanism is actually working before any production traffic hits it.

**Acceptance Criteria:**

**Given** Stories 3.1–3.6 are all complete and deployed to the Cloudflare Pages preview environment,
**When** I perform the end-to-end verification,
**Then** the verification is performed against a dedicated Loops test audience (if Loops offers a sandbox mode, use it; otherwise a prefix-filtered segment of the real audience using throwaway `+test@` email aliases — the approach is documented in `docs/launch-checklist.md` under "Waitlist verification"),
**And** the verification is not run against the production environment — only `preview` — until Epic 8's launch checklist (AR22) is executed.

**Given** the full loop is what needs verifying,
**When** I walk through the test script,
**Then** the following sequence is executed and each step is confirmed in writing in `docs/launch-checklist.md`:
  1. Open the preview URL in a private browser window and submit the hero waitlist form with a `+test-hero@` alias — confirm network tab shows `POST /api/waitlist` with 200 and no exposed secrets (NFR12),
  2. Confirm the browser navigates to `/waitlist-confirmed?email=...`,
  3. Confirm the double opt-in email arrives in the test inbox within ~2 minutes,
  4. Click the confirmation link and confirm Loops moves the contact from `pending` to `subscribed`,
  5. Confirm the drip automation fires and the placeholder drip email arrives at the scheduled `T+24h` mark (for this test, temporarily shorten to `T+2min` in Loops dashboard; revert after test),
  6. Click the unsubscribe footer link in the drip email and confirm Loops moves the contact to `unsubscribed`,
  7. Repeat steps 1–6 with `+test-mid@` from the mid-page CTA and `+test-footer@` from the footer CTA to confirm `signupSource` is correctly recorded for all three positions.

**Given** failure modes must also be verified,
**When** I test the error paths,
**Then** a submission with a malformed email (e.g., `"notanemail"`) shows the `invalid_email` client-side error without hitting Loops,
**And** a second submission with an already-subscribed alias shows the `duplicate` friendly message, not a hard error,
**And** a forced ESP failure (temporarily rotate `LOOPS_API_KEY` to an invalid value in the preview env, or mock via a DevTools request-override) surfaces the `esp_unavailable` toast to the user with input text preserved (NFR34, UX-DR16),
**And** a submission with the honeypot field filled (simulated via DevTools setting the hidden input's value) returns `200 ok: true` and the contact is **not** created in Loops (silent-success spam rejection per NFR15),
**And** each failure case is recorded with its outcome in the launch checklist.

**Given** the micro-survey must also make it all the way through,
**When** I complete the confirmation flow above,
**Then** after clicking a micro-survey option on `/waitlist-confirmed`, the Loops contact's `microSurveyAnswer` custom field updates within ~5 seconds,
**And** the updated value is visible in the Loops dashboard contact detail view.

**Given** this is a verification-only story with no new code,
**When** the story is complete,
**Then** `docs/launch-checklist.md` contains a dated section "Epic 3 verification" listing every step, outcome, and any deviations found,
**And** any bugs found are filed as follow-up stories against Epic 3 (or hotfix stories if blocking) — this story is not marked done until the happy path and all documented failure paths pass end-to-end,
**And** the test audience is cleared of test contacts after verification to keep the launch-day audience clean.

## Epic 4: Blog & Cross-Platform Content API

A visitor can browse a blog index, read individual articles with SEO metadata, navigate related articles, and share. In parallel, the Truvis mobile app can fetch the same blog content via a versioned, additive-only static JSON contract at `/api/v1/blog/*` — the only cross-platform integration point in the architecture — guarded by a Vitest contract test.

### Story 4.1: Define `blog` Astro Content Collection schema, `lib/content.ts` blog helpers and seed three placeholder articles

As Cristian,
I want a typed, schema-validated `blog` content collection with a small access-boundary helper module and three placeholder articles,
So that every downstream blog story (index page, article page, API endpoints, mobile contract) reads from one trusted source and the Zod schema fails the build if any article is missing a required field.

**Acceptance Criteria:**

**Given** AR6 mandates Astro Content Collections for blog content and Epic 5 is the canonical home for the Keystatic admin UI and the remaining four collections,
**When** I create the blog collection in Epic 4,
**Then** `src/content/config.ts` is created (or extended if Epic 1 left a stub) and declares exactly one collection named `blog` with a Zod schema — the other four collections (`faq`, `testimonials`, `stats`, `siteContent`) are **not** created in this story and remain Epic 5's scope,
**And** `keystatic.config.ts` is **not** created in this story — Keystatic is Epic 5's scope,
**And** the Zod schema enforces these required fields on every blog entry: `slug` (string, kebab-case regex), `title` (string, max 70 chars for SEO), `excerpt` (string, max 200 chars), `category` (enum: at minimum `'buying-guide' | 'inspection-tips' | 'case-study' | 'deep-dive'`), `publishDate` (Date, must parse to valid ISO 8601), `author` (string), `readTime` (string, e.g., `"6 min"`), `featured` (boolean, default `false`), `featuredImage` (object `{src, alt, width, height}` — **alt is required, empty string disallowed**), `seo` (object `{title?, description?, socialImage?, keywords?: string[]}`), and `relatedSlugs` (array of strings, default `[]`).

**Given** AR9 requires the blog API shape to be stable and additive-only at `/v1/`,
**When** I extend the Zod schema for API exposure,
**Then** the schema also captures `webUrl` — this is computed at build time as `${PUBLIC_SITE_URL}/blog/${year}/${month}/${slug}` using the dated URL structure approved for Epic 4, **not** stored in the front matter,
**And** a `buildBlogEntryView(entry)` pure function in `src/lib/content.ts` transforms a raw Astro entry into the public-shape `BlogPostView` TypeScript type exported from `src/lib/types/blog.ts` that matches the documented API shape: camelCase fields, ISO 8601 dates **with timezone** (e.g., `2026-04-10T14:30:00+02:00`), absolute URLs (never relative), and image references as `{src, alt, width, height}` objects,
**And** the `BlogPostView` type is the **single** type consumed by every downstream blog surface (index, article, preview card, API endpoints, mobile contract) — no consumer reads raw Astro entries directly.

**Given** AR25 requires all Content Collection access to go through `lib/content.ts` (Epic 5 scope in the coverage map, but Epic 4 starts it for the blog collection and Epic 5 extends it),
**When** I create `src/lib/content.ts`,
**Then** the module exports these typed async helpers: `getAllBlogPosts(): Promise<BlogPostView[]>` (sorted by `publishDate` descending), `getBlogPost(slug: string): Promise<BlogPostView | null>`, `getBlogPostsByCategory(category: BlogCategory): Promise<BlogPostView[]>`, `getFeaturedBlogPosts(limit?: number): Promise<BlogPostView[]>`, and `getRelatedBlogPosts(slug: string, limit?: number): Promise<BlogPostView[]>` (reads `relatedSlugs` and falls back to same-category posts if none),
**And** every helper applies `buildBlogEntryView()` before returning — raw `getCollection('blog')` calls never leak out of `lib/content.ts` (AR25),
**And** no other file in the repo calls `getCollection('blog')` — enforced by an ESLint rule or a code-review checklist line in `docs/design-conventions.md`.

**Given** three seed articles are needed to unblock downstream stories and Epic 8 authors real launch content per our agreed scope,
**When** I write the seed files under `src/content/blog/`,
**Then** three placeholder-quality MDX files exist with filenames matching `YYYY-MM-DD-slug.mdx` so the dated URL structure derives cleanly from the filename,
**And** the three articles cover distinct categories: one `buying-guide` ("7 things to check before buying a 10-year-old diesel"), one `case-study` ("The €900 problem behind a €7,200 invoice"), one `deep-dive` ("Why a pre-purchase inspection pays for itself in 3 minutes of haggling"),
**And** every file has all required front-matter fields populated with placeholder-quality but render-ready content in the 70/30 Inspector/Ally voice,
**And** each article body is 600–1200 words of Markdown/MDX with at least: one H2 heading, one H3 heading, one bulleted list, one block quote, and one inline image reference (the image itself can be a placeholder SVG in `src/assets/blog/` or a shared "coming soon" placeholder),
**And** `relatedSlugs` on each article references the other two so the related-article logic in Story 4.5 can be exercised,
**And** a `TODO(epic-8-content)` marker in each file's front matter flags it for rewrite by the launch-readiness pass,
**And** `astro build` succeeds — Zod validation fails the build if any required field is missing, which validates the schema itself.

**Given** AR8 mandates a `CONTRACT.md` at the repo root documenting the blog API schema,
**When** I draft the initial contract document,
**Then** `CONTRACT.md` is created at the repo root as a **developer-facing README for mobile app consumers** — not a minimal schema spec,
**And** the document contains these sections: a short introduction (who this is for, what guarantees we provide), base URL and versioning policy ("additive-only at `/v1/`; removals or renames require `/v2/`"), the `BlogPostView` TypeScript type block, a table of every field with type + required/optional + example + description, a curl example for each endpoint (endpoints themselves are built in Story 4.8 so curl examples are placeholder at this story with a clear "Endpoints ship in Story 4.8" note), CDN cache headers (`public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`), rate limits (`100 req/min per IP` from NFR18), and a "How to report breaking changes" section pointing to the GitHub issue tracker,
**And** the document explicitly lists the `BlogPostView` shape as it will be emitted by the API — camelCase, ISO 8601 with timezone, absolute URLs, image objects — so Story 4.8 and Story 4.11's contract test have a single source of truth to assert against.

**Given** NFR40 requires blog content to maintain the 70/30 Inspector/Ally voice and avoid generic listicle filler,
**When** I audit the three seed articles,
**Then** each article has a specific, concrete hook in its opening paragraph (numbers, named components, named failure modes — not "Buying a used car can be stressful"),
**And** each article provides at least one actionable checklist or specific guidance item the reader can apply to their next inspection — the voice audit is documented in a short `docs/content-voice-review.md` note for future authors to reference.

### Story 4.2: Build `BlogPreviewCard` Tier 2 composite

As a designer and as a downstream consumer of the blog UI,
I want one reusable preview card that renders a blog post in a consistent visual language across the landing page, the blog index, the related-articles strip, and any future surfaces,
So that changing the card's look in one place updates it everywhere.

**Acceptance Criteria:**

**Given** UX-DR20 defines the `BlogPreviewCard` visual contract,
**When** I create `src/components/blog/blog-preview-card.astro` under the three-tier hierarchy (AR23),
**Then** the component accepts a typed prop `post: BlogPostView` from Story 4.1 and no other required props,
**And** the component accepts optional props `class?: string` (merged via `cn()`) and `priority?: boolean` (default `false` — when `true`, the thumbnail image uses `loading="eager"` and `fetchpriority="high"` for above-the-fold usage),
**And** the component renders an inline-SVG thumbnail placeholder (zero image weight per UX-DR20) **unless** `post.featuredImage.src` points to a real image in `src/assets/blog/`, in which case the Astro `<Image>` component is used with the stored width/height to prevent CLS (NFR3),
**And** the card layout in order: thumbnail (16:9 aspect ratio, rounded top corners matching `radius-lg`), category badge (pill in `surface-3` background with teal text), H3 title in `text-lg` primary colour, 2-line-truncated excerpt in muted colour (`-webkit-line-clamp: 2`), a footer row with read-time estimate on the left and "Read article →" CTA link on the right.

**Given** UX-DR20 specifies three interaction states,
**When** I implement the states with Tailwind utilities from Story 1.3,
**Then** the default state has `shadow-sm` and a subtle border,
**And** the hover state lifts to `shadow-md` (uses the warm-tinted shadow scale) and the title text transitions to `teal-slate`,
**And** the focus state (triggered via `focus-visible` on the wrapping `<a>` — whole card is the click target) shows a 2px teal-slate outline with 2px offset,
**And** the transition between states respects the Story 1.7 `--duration-base` token,
**And** under `prefers-reduced-motion: reduce` the shadow transition is removed (hover and focus styles still apply instantly) (UX-DR32),
**And** the full card is keyboard-accessible — Tab reaches the wrapper `<a>`, Enter activates it, and the whole card (including thumbnail and metadata) is the click target,
**And** the wrapper `<a>` meets the 44×44px minimum touch target on mobile (UX-DR26).

**Given** a11y, semantic HTML, and text-expansion requirements,
**When** I audit the component,
**Then** the card is wrapped in `<article>` with the title inside an `<h3>` (sub-heading to the index/landing-page `<h2>`) respecting the Story 1.7 heading hierarchy (UX-DR28),
**And** the read-time estimate has a `<time>` wrapper with an appropriate `datetime` attribute (e.g., `datetime="PT6M"`),
**And** the thumbnail has an `aria-hidden="true"` attribute when it is a decorative placeholder SVG, or a descriptive `alt` when it is a real image (never empty alt on a real thumbnail),
**And** the card renders correctly under 140% synthetic FR/DE placeholder strings for title and excerpt in the Story 1.7 text-expansion harness (UX-DR31),
**And** `src/pages/_demo/blog-preview-card.astro` renders six cards — three from the seed articles from Story 4.1, three from synthetic long-string mocks — so the component is visually verifiable at all breakpoints.

### Story 4.3: Build `/blog` index page with category filter pills

As a visitor interested in Truvis's editorial content,
I want a dedicated `/blog` page that lists every published article with a way to filter by category,
So that I can browse all the content, not just the 2–3 previews on the landing page.

**Acceptance Criteria:**

**Given** FR18 requires a browsable blog list and Story 4.2's `BlogPreviewCard` exists,
**When** I create `src/pages/blog/index.astro` (and the corresponding localised routes `src/pages/fr/blog/index.astro`, `src/pages/de/blog/index.astro` per Story 1.6),
**Then** the page uses `BaseLayout` with title wired to `blog.index.title` i18n key, description wired to `blog.index.description` i18n key, and canonical URL set correctly,
**And** the page renders a `SectionEyebrow` (light variant) "The Truvis blog" and an `<h1>` wired to `blog.index.headline`,
**And** the page calls `getAllBlogPosts()` from `lib/content.ts` at build time and renders every returned post as a `BlogPreviewCard` in a responsive grid (three columns ≥1024px, two columns 640–1024px, single column <640px),
**And** the first card in the grid uses `priority={true}` so its thumbnail is eager-loaded (LCP candidate on this page) (NFR1),
**And** when zero posts are returned the page renders a branded empty-state message "No articles yet — subscribe to the waitlist to be notified when we start publishing" with a reused `EmailCaptureBlock` (inline variant) instead of a raw error (graceful degradation).

**Given** FR24 requires filtering by category,
**When** I add the filter UI,
**Then** a row of category filter "pills" is rendered above the grid with one pill per unique category extracted from the post list, plus an "All" pill that resets the filter,
**And** the filter is implemented **client-side only** via a small vanilla `<script>` block (no React island) that adds/removes a `data-filter-active` attribute on the page body and toggles `hidden` on cards not matching the selected category — per our agreed design decision, filtering reads from a single data render, not per-category endpoints,
**And** the selected pill has the `teal-slate` filled state, unselected pills have the `surface-3` ghost state (UX-DR1),
**And** the filter state is reflected in the URL via `?category=<category>` (via `history.pushState`) so direct links to a filtered view work and the browser back button restores the previous filter,
**And** on initial page load the `?category=` query parameter is read and the matching pill is pre-selected,
**And** the filter degrades gracefully without JavaScript — all cards remain visible and the pills fall back to regular anchor links pointing to the same page (they simply have no effect without JS, but the content remains readable).

**Given** FR24 also calls out filtering by `featured` status and the featured flag is present on every post,
**When** I extend the filter UI,
**Then** a "Featured" toggle (separate from the category pills) sits alongside the pill row,
**And** the toggle hides non-featured cards when active,
**And** the toggle is cumulative with the category filter (e.g., "Featured" + "buying-guide"),
**And** the toggle state is also reflected in the URL (`?category=buying-guide&featured=true`).

**Given** accessibility and performance,
**When** I audit the page,
**Then** the filter pills are rendered as a `<nav aria-label="Filter by category">` with `<button>` elements (not links) so keyboard users can Tab through them and Space/Enter to toggle,
**And** `aria-pressed` correctly reflects the active state on each pill,
**And** Lighthouse run on the blog index meets the CI budgets (Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1),
**And** the page renders correctly under 140% synthetic FR/DE strings (UX-DR31),
**And** axe-core reports zero violations.

### Story 4.4: Build `/blog/[year]/[month]/[slug]` dynamic article page with SEO metadata

As a visitor who clicked through to a specific article,
I want a clean, readable, mobile-friendly article page with proper SEO metadata and social sharing preview,
So that I can read Truvis's content comfortably and the article can be shared without showing a broken preview.

**Acceptance Criteria:**

**Given** FR19 requires individual blog articles with full SEO metadata and we agreed on a dated URL structure,
**When** I create `src/pages/blog/[year]/[month]/[slug].astro` as an Astro dynamic route,
**Then** the route exports `getStaticPaths()` which reads `getAllBlogPosts()` from `lib/content.ts` and returns one path per post with `{year, month, slug}` derived from the post's `publishDate` (zero-padded month) and `slug` fields,
**And** the URL structure is exactly `/blog/YYYY/MM/slug` (e.g., `/blog/2026/04/seven-things-to-check`),
**And** localised routes are generated at `/fr/blog/YYYY/MM/slug` and `/de/blog/YYYY/MM/slug` per Story 1.6,
**And** if a slug does not match any post, Astro's built-in 404 handling routes to the branded `404.astro` from Story 1.5,
**And** changing a post's `publishDate` in the front matter changes its URL on next build — this is an accepted trade-off (canonical URL is the new path; Epic 6 adds a redirect strategy if needed at that time).

**Given** FR19 requires full SEO metadata including title, description and social sharing image,
**When** I render the page's `<head>` via `BaseLayout`'s slots,
**Then** the page title is `${post.seo.title || post.title} — Truvis Blog` (respecting per-article overrides from the schema),
**And** the meta description is `post.seo.description || post.excerpt`,
**And** the canonical URL slot is set to `post.webUrl` (the absolute URL from Story 4.1's `buildBlogEntryView`) (FR42),
**And** Open Graph meta tags are populated: `og:type=article`, `og:title`, `og:description`, `og:image` (from `post.seo.socialImage` with fallback to `post.featuredImage.src`), `og:url`, `article:published_time` (ISO 8601 with TZ), `article:author`, `article:section` (category), `article:tag` (from `post.seo.keywords`),
**And** Twitter card meta tags are populated: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`,
**And** a `TODO(epic-6): inject blogPostingJsonLd() via BaseLayout JSON-LD slot` comment marks where Epic 6 adds the structured data — no JSON-LD is injected in this story.

**Given** FR22 requires articles to be crawlable as static HTML,
**When** I render the article body,
**Then** the page output is pure static HTML (no client-side hydration for content) — any interactive elements (share buttons, related-article clicks) are wrapped in small islands added in Stories 4.5 and 4.6 with `client:visible` hydration,
**And** the article body is rendered via Astro's built-in MDX pipeline with appropriate prose styling (Tailwind `prose` utility or a hand-rolled equivalent matching the Truvis design tokens — colours, headings in Plus Jakarta Sans, body in Inter),
**And** the prose styles respect the single-`<h1>`-per-page rule (UX-DR28): the page-level `<h1>` is the article title; the MDX content's top-level headings are rewritten or authored as `<h2>`,
**And** all images in the article use `loading="lazy"` below the fold (FR44 ships here; Epic 6 adds the enforcement audit) and include `alt` text (enforced by the Zod schema on `featuredImage` and by editorial discipline on in-body images — a `TODO(epic-6): enforce alt in body images via remark plugin` comment is left at the integration point).

**Given** the article page layout must feel editorial,
**When** I compose the page,
**Then** the page renders: `<Header>` (Story 1.4) → article hero (category badge, `<h1>` title, author + publish date + read-time metadata row, featured image with explicit width/height) → article body (Tailwind `prose` container, max-width `65ch` for readability) → (related-articles strip from Story 4.5) → (inline blog CTA from Story 4.6) → `<Footer>` (Story 1.4),
**And** the article hero uses `priority` for the featured image (eager load, `fetchpriority="high"`) so LCP is the featured image (NFR1),
**And** the page passes the CI Lighthouse budgets for content pages.

**Given** a11y and text-expansion requirements,
**When** I audit,
**Then** the article is wrapped in `<article itemscope itemtype="https://schema.org/BlogPosting">` (microdata hints that Epic 6's JSON-LD will supersede but that don't hurt at V1),
**And** the publish date uses `<time datetime="...">`,
**And** axe-core reports zero violations on a page containing a typical seed article,
**And** the page renders correctly under 140% synthetic FR/DE strings (UX-DR31),
**And** WCAG 2.1 AA contrast is validated for all article prose elements (UX-DR30).

### Story 4.5: Build related-articles navigation and social share buttons on the article page

As a visitor who just finished reading an article,
I want to see related articles I might enjoy next, and share this one to WhatsApp, Twitter/X, or via a copied link,
So that I can keep reading or pass it to a friend who is car shopping.

**Acceptance Criteria:**

**Given** FR20 requires navigation to related blog articles,
**When** I extend the article page from Story 4.4 with a related-articles strip,
**Then** the page calls `getRelatedBlogPosts(slug, 3)` from `lib/content.ts` (Story 4.1) at build time,
**And** the function returns up to three posts: first by matching the current post's `relatedSlugs` array, then backfilling with same-category posts if fewer than three matches, then backfilling with recent posts if fewer than three matches after category fallback,
**And** the strip is rendered as a `SectionEyebrow` "Keep reading" + a three-column grid (single column <640px) of `BlogPreviewCard` instances from Story 4.2,
**And** the strip is positioned after the article body and before the inline CTA from Story 4.6,
**And** if the related list is empty (only one article in the blog), the strip is not rendered at all — no empty-state placeholder.

**Given** FR21 requires sharing via social media or direct link and we agreed on WhatsApp + Copy link + Twitter/X,
**When** I add the share button block,
**Then** a share block is rendered at the end of the article body (above the related-articles strip) with the headline "Found this useful? Share it." wired to `blog.article.shareHeadline` i18n key,
**And** three buttons are rendered inline: WhatsApp (`https://wa.me/?text=<encoded title + url>`), Twitter/X (`https://twitter.com/intent/tweet?text=<encoded title>&url=<encoded url>&via=truvis`), and "Copy link" (async Clipboard API copies `post.webUrl` and briefly transitions label to "Copied!" for ~2 seconds),
**And** all three buttons render with an appropriate brand icon (inline SVG ≤1KB each) and a visible label,
**And** each button is keyboard-activatable (Enter/Space), meets the 44×44px touch target (UX-DR26), and has a descriptive `aria-label` (e.g., `aria-label="Share on WhatsApp"`),
**And** the three buttons are the only client-side interactive elements on the article page and are implemented in a single small React island at `src/components/islands/article-share.tsx` hydrated `client:visible` (AR27) — the vanilla JavaScript alternative is explicitly rejected because the Copy-link feedback state needs React state management,
**And** a `TODO(epic-6): trackEvent('blog_share_click', {channel, postSlug})` comment marks where Epic 6 wires analytics.

**Given** the Truvis Twitter/X handle may not yet exist at Epic 4 time,
**When** I wire the Twitter/X `via` parameter,
**Then** the handle is read from a `PUBLIC_TRUVIS_TWITTER_HANDLE` env var (added to `.env.example` with an empty value),
**And** if the env var is empty, the `&via=` segment is omitted from the share URL so the link still works,
**And** a `TODO(epic-5): move social handles to siteContent collection` comment marks the Epic 5 handoff.

**Given** accessibility and text-expansion,
**When** I audit,
**Then** the share buttons are wrapped in a `<nav aria-label="Share this article">`,
**And** the "Copied!" feedback transition also fires an `aria-live="polite"` announcement so screen readers confirm the action,
**And** the share block renders correctly under 140% synthetic FR/DE strings (UX-DR31),
**And** axe-core reports zero violations.

### Story 4.6: Build the inline blog-article CTA block with pre-launch waitlist variant and post-launch slot

As a visitor who just finished an article and is now a warmer lead than five minutes ago,
I want a clear, in-context invitation to join the waitlist (pre-launch) or download the app (post-launch),
So that the editorial content has a visible conversion path and I don't have to scroll back to the landing page to sign up.

**Acceptance Criteria:**

**Given** FR27 requires blog article CTAs that direct readers to the waitlist (pre-launch) or app store (post-launch),
**When** I create `src/components/blog/blog-inline-cta.astro`,
**Then** the component renders a visually distinct block below the article body and above the related-articles strip (from Story 4.5),
**And** the block uses the `surface-2` warm background with a teal-slate border accent so it stands out from the prose without jarring the editorial tone,
**And** the block is structured as: a short headline wired to `blog.article.inlineCta.headline` i18n key, a one-sentence body wired to `blog.article.inlineCta.body`, and a CTA area that phase-switches per the logic below.

**Given** per our agreed scope `isPostLaunch()` lives in Epic 5's `lib/launch-phase.ts` and Epic 4 must not import non-existent modules,
**When** I implement the phase switch,
**Then** the component **does not import** `lib/launch-phase.ts`,
**And** a constant `const LAUNCH_PHASE_V1: 'pre' | 'post' = 'pre';` is declared at the top of the component file with a `TODO(epic-5): replace with isPostLaunch() from lib/launch-phase.ts` comment,
**And** the component conditionally renders based on `LAUNCH_PHASE_V1`,
**And** when `'pre'` the component renders Epic 3's `<EmailCaptureBlock variant="inline" signupSource="blog-article">` with a `signupSource` that distinguishes blog conversions from landing-page conversions for analytics,
**And** when `'post'` the component renders a named Astro `<slot name="post-launch-cta">` with a fallback placeholder identical in contract to the Epic 2 placeholders: a disabled "Download the app" button with `aria-disabled="true"` and a visually-hidden "Coming soon — filled in Epic 8" note,
**And** Epic 8 swaps the constant for the real helper and fills the slot with the app store buttons in a single PR.

**Given** the CTA block is consumed by the article page from Story 4.4,
**When** I integrate it,
**Then** `/blog/[year]/[month]/[slug].astro` renders `<BlogInlineCta />` at the documented position,
**And** every article page renders the same CTA (no per-article override at V1 — author overrides are a V1.1 consideration).

**Given** a11y and performance,
**When** I audit,
**Then** the CTA block's `signupSource` is distinct (`'blog-article'`) so analytics in Epic 6 can separate blog-originated signups from landing-page signups (FR36),
**And** the block passes the CI Lighthouse budgets,
**And** the block renders correctly under 140% synthetic FR/DE strings (UX-DR31),
**And** axe-core reports zero violations.

### Story 4.7: Replace Epic 2 `BlogPreviewsSection` placeholder with real `BlogPreviewCard` + `lib/content.ts` data

As a visitor on the Truvis landing page,
I want the blog previews section to show real articles I can actually click through to,
So that the "From the Truvis blog" section delivers on its promise instead of showing inert placeholder cards.

**Acceptance Criteria:**

**Given** Epic 2 Story 2.7 shipped `BlogPreviewsSection` with a throwaway `_blog-preview-placeholder.astro` partial and hard-coded data,
**When** I update `src/components/sections/blog-previews-section.astro`,
**Then** the section calls `getFeaturedBlogPosts(3)` from `lib/content.ts` (Story 4.1) at build time,
**And** if `getFeaturedBlogPosts(3)` returns fewer than three featured posts, the section falls back to `getAllBlogPosts()` and takes the three most recent,
**And** the section renders each returned post as a `BlogPreviewCard` from Story 4.2 — replacing the placeholder partial entirely,
**And** the throwaway `_blog-preview-placeholder.astro` partial is **deleted** from the repo in the same commit,
**And** the `TODO(epic-4): replace placeholder partial with real BlogPreviewCard + getBlogPreviews() content helper` comment from Epic 2 is removed,
**And** the "Read article →" link is now a real clickable link pointing to the article page at `/blog/YYYY/MM/slug`.

**Given** the landing page's hero is above the fold and the blog previews section is below it,
**When** I set card priorities,
**Then** none of the three preview cards in this section use `priority={true}` — the hero phone mockup remains the LCP candidate (NFR1),
**And** the landing page's CI Lighthouse budgets still pass after this change.

**Given** this story is a cross-epic wiring story and nothing else should change,
**When** I verify,
**Then** the diff is limited to `blog-previews-section.astro`, the deleted placeholder partial, and any i18n key additions,
**And** no other Epic 2 files are touched,
**And** the landing page renders identically to before except the three cards now contain real seed content from Story 4.1 and are clickable,
**And** axe-core reports zero new violations.

### Story 4.8: Build static `/api/v1/blog/*` JSON endpoints with Vitest contract test and finalised `CONTRACT.md`

As a mobile app developer consuming the Truvis blog content API,
I want three static, cacheable, versioned JSON endpoints with a documented, stable shape and an automated contract test that fails the CI build if the shape ever changes,
So that the mobile app carousel never breaks because someone renamed a field on the web side.

**Acceptance Criteria:**

**Given** AR8 mandates static JSON endpoints generated at build time at three paths,
**When** I create the endpoints as Astro `.json.ts` routes,
**Then** `src/pages/api/v1/blog/posts.json.ts` is created and exports a `GET` handler that reads `getAllBlogPosts()` from `lib/content.ts` (Story 4.1) and returns a JSON array of `BlogPostView` objects with no wrapper (AR9),
**And** `src/pages/api/v1/blog/posts/[slug].json.ts` is created and exports a `GET` handler plus `getStaticPaths()` that generates one endpoint per post, returning a single `BlogPostView` object,
**And** `src/pages/api/v1/blog/categories.json.ts` is created and returns a JSON array of objects `{category: BlogCategory; postCount: number}` derived from the full post list,
**And** all three endpoints are generated at build time as static files — no server-side runtime execution per request — so they are served from the Cloudflare Pages CDN edge with the cache headers from Story 4.9.

**Given** AR9 specifies the exact response shape,
**When** I verify the output,
**Then** every response is `Content-Type: application/json`,
**And** there is **no** envelope or wrapper — the response is a raw array or a raw object (no `{data: ...}`, no `{ok: true, data: ...}`),
**And** all fields are camelCase (`publishDate`, not `publish_date`),
**And** all dates are ISO 8601 with timezone (e.g., `2026-04-10T14:30:00+02:00`),
**And** all URLs (including `webUrl` and `featuredImage.src`) are **absolute** — never relative — using `PUBLIC_SITE_URL` as the base,
**And** all image references are objects `{src, alt, width, height}` — never bare string URLs,
**And** the endpoint bodies are the exact `BlogPostView` type from Story 4.1's `lib/types/blog.ts` with no extra implementation-detail fields leaked (no Astro-internal fields, no raw file paths).

**Given** AR10 requires a Vitest contract test asserting the JSON output shape against `CONTRACT.md`,
**When** I create the contract test,
**Then** `tests/content.test.ts` is created and imports the `BlogPostView` type and a runtime Zod schema equivalent (e.g., `BlogPostViewSchema` defined alongside the TypeScript type in `src/lib/types/blog.ts`),
**And** the test runs `astro build` in a sub-process (or uses Astro's test utilities to generate the content programmatically) to produce the three endpoint JSON files,
**And** the test then parses each endpoint and asserts the shape against `BlogPostViewSchema` — every post in `posts.json` validates, every post in `posts/[slug].json` validates, and every category in `categories.json` validates against its own schema,
**And** the test asserts negative cases too: a synthetic "bad" post with a snake_case field, a relative URL, a bare string image, and a non-ISO date must all **fail** `BlogPostViewSchema.safeParse()` — this proves the schema is actually enforcing the contract, not just rubber-stamping,
**And** the test runs in the Story 1.2 CI Vitest job and a contract violation fails the PR check (NFR31 enforcement).

**Given** Story 4.1 drafted `CONTRACT.md` with placeholder curl examples,
**When** I finalise the contract document,
**Then** `CONTRACT.md` is updated with real curl examples for all three endpoints using `PUBLIC_SITE_URL`,
**And** the document includes a "Versioning policy" section stating: "The `/v1/` path is stable for at least one mobile app release cycle. Field additions are safe. Field removals, renames, or type changes require a new `/v2/` endpoint with `/v1/` kept alive during migration.",
**And** the document includes a "How the contract is enforced" section referencing `tests/content.test.ts` and explaining that CI blocks any PR that breaks the shape,
**And** the document is committed at the repo root as agreed in Story 4.1.

**Given** FR26 requires mobile-app deep linking to full articles,
**When** I verify the linking contract,
**Then** every `webUrl` in every endpoint response is a clickable, absolute URL that resolves to the Story 4.4 article page when opened in a browser,
**And** a manual smoke test confirms: take a `webUrl` from `/api/v1/blog/posts.json`, open it in a browser, and confirm the article page loads correctly,
**And** the `CONTRACT.md` explicitly documents this guarantee: "Every `webUrl` in the API response is a stable, canonical URL that will resolve to the full article HTML page. Mobile app deep links must use `webUrl` directly."

**Given** NFR8 requires the blog content API to respond in <300ms for carousel requests and NFR36 requires cached responses if CMS is unreachable,
**When** I verify the resilience characteristics,
**Then** the static-generation architecture intrinsically satisfies both NFRs: (a) endpoints are served from CDN edge with TTFB <50ms (well under the 300ms budget), and (b) because the endpoints are built into the static bundle, a CMS outage cannot affect a live deploy — the last successful build remains served until the next deploy succeeds (NFR36),
**And** a short paragraph in `CONTRACT.md` documents this architectural property so the mobile app team understands why the API is trustworthy,
**And** NFR18 (100 concurrent requests at <300ms p95) is addressed by Story 4.9's Cloudflare WAF + CDN configuration — this story delegates the concurrency + rate-limit enforcement to the next story and notes the dependency in the AC.

### Story 4.9: Configure Cloudflare WAF rate limiting and CDN cache headers for `/api/v1/blog/*`

As Cristian,
I want the blog content API endpoints protected by Cloudflare WAF rate limiting and served with explicit CDN cache headers,
So that the mobile app carousel has low-latency, resilient, abuse-resistant access to blog content and a runaway client cannot DoS the endpoints.

**Acceptance Criteria:**

**Given** NFR14 requires the blog content API to be access-controlled via rate limiting and per our agreed V1 rate is 100 req/min/IP,
**When** I configure the Cloudflare WAF rule (either via the dashboard or a `wrangler`-managed config file committed to the repo — approach documented in the story),
**Then** a rate limit rule is created that matches requests to `/api/v1/blog/*` (matches `/api/v1/blog/posts.json`, `/api/v1/blog/posts/*`, and `/api/v1/blog/categories.json`),
**And** the rule rejects requests exceeding 100 requests per minute per client IP with an HTTP 429 response,
**And** the rule is scoped to the production zone (and preview zones if Cloudflare Pages supports per-deployment WAF rules — if not, document the limitation),
**And** the rule is documented in `docs/integrations/cloudflare-waf.md` with its ID, matcher, threshold, action, and scope for future audit.

**Given** AR9 specifies the exact cache header policy,
**When** I configure the Cache-Control headers on the `/api/v1/blog/*` responses,
**Then** every response carries `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`,
**And** the headers are set via a Cloudflare Pages Functions middleware at `functions/api/v1/blog/_middleware.ts` (or equivalent Cloudflare Pages configuration) so the policy is version-controlled in the repo, not dashboard-configured,
**And** a `curl -I https://<preview-url>/api/v1/blog/posts.json` against a deployed preview confirms the header is present and correct.

**Given** NFR18 requires the API to support 100 concurrent requests at <300ms p95,
**When** I verify the concurrency characteristics,
**Then** a load-test run (using a simple tool like `wrk`, `k6`, or `hey`) hits the preview environment with 100 concurrent workers against `/api/v1/blog/posts.json` for 30 seconds,
**And** the 95th-percentile response time is <300ms,
**And** no requests are served by the origin — every response is a CDN cache hit after the first request per edge location,
**And** the load test methodology and results are recorded in `docs/integrations/cloudflare-waf.md`,
**And** if the load test fails, the WAF rule threshold is adjusted upward (or a separate rule is added specifically for mobile app user-agents) — this story does not ship until NFR18 is validated.

**Given** FR25 requires rate-limited access for authorised consumers,
**When** I document the access model,
**Then** `CONTRACT.md` is updated with a "Rate limits" section stating: "The `/api/v1/blog/*` endpoints are rate-limited to 100 requests per minute per client IP. Clients exceeding this limit receive a 429 response with a `Retry-After` header. The mobile app carousel should implement a 5-minute cache (matching `max-age=300`) to stay comfortably under the limit even on shared networks.",
**And** the `Retry-After` header behaviour is verified by a manual test: send 101 requests in rapid succession from a single IP and confirm the 101st returns `429` with `Retry-After` present.

**Given** corporate NAT and shared-wifi scenarios could cause false positives on the rate limit,
**When** I document the known limitation,
**Then** `docs/integrations/cloudflare-waf.md` includes a "Known limitations" section noting that clients behind a shared IP (corporate NAT, conference wifi) may hit the rate limit faster than individual users,
**And** the document references a V1.1 follow-up to consider an API-key-gated higher-rate lane if abuse reports arrive from legitimate shared-IP environments.

**Given** a11y and UX are not affected by this story but observability is,
**When** I complete the story,
**Then** `docs/launch-checklist.md` from Epic 3 is updated with a "Blog API verification" section listing the steps to re-validate the rate limit, cache headers, and load-test budget before launch,
**And** Story 4.8's `tests/content.test.ts` is not changed — contract enforcement is separate from transport enforcement, and this story is transport only.

## Epic 5: Content Operations — CMS, Phase Toggle & Rebuild Pipeline

Cristian can author every piece of content (blog, FAQ, testimonials, stats, hero/problem/footer copy, social URLs) in a Keystatic admin UI without touching code, set SEO metadata per article, and flip pre/post-launch phase via a single `LAUNCH_PHASE` environment variable. Any content change rebuilds and deploys within 5 minutes. Code never deploys for content changes.

### Story 5.1: Create `faq`, `testimonials`, `stats` and `siteContent` Content Collections with schemas, seeds and `lib/content.ts` helpers

As Cristian,
I want the four remaining Content Collections (beyond `blog` from Epic 4) created with strict Zod schemas, seed content, and typed access helpers,
So that every surface that currently reads placeholder i18n strings or hard-coded data has a real, schema-validated source to switch to in Story 5.4.

**Acceptance Criteria:**

**Given** AR6 mandates five Astro Content Collections and Epic 4 Story 4.1 already created the `blog` collection,
**When** I extend `src/content/config.ts`,
**Then** four additional collections are declared: `faq`, `testimonials`, `stats`, `siteContent`,
**And** the collection `type` for `faq`, `testimonials`, and `stats` is `'data'` (JSON / YAML) so each entry is a discrete record, not a markdown document,
**And** the collection `type` for `siteContent` is `'data'` with a single entry (`src/content/siteContent/landing.json` or similar) that holds all landing-page and global strings in one document — this single-entry convention keeps Keystatic's UI for global settings a single editable form rather than a list,
**And** `astro build` succeeds with the new collections declared and the seed content from the ACs below in place.

**Given** FR31 requires FAQ entries to be managed without code changes,
**When** I define the `faq` schema,
**Then** the schema enforces: `id` (string, stable slug for anchor linking — e.g., `what-does-truvis-cost`), `question` (string, ≤200 chars), `answer` (Markdown string — supports inline links and formatting), `order` (number, for admin-controlled sort), `featured` (boolean, default `false`, reserved for a future "most common questions" surface), and `category` (optional string, reserved for a future FAQ taxonomy),
**And** at least six seed entries are committed under `src/content/faq/` covering the canonical questions from Epic 2 Story 2.8: scope, relationship to professional inspection, privacy, cost, platforms, accuracy, data retention,
**And** per our agreed V1.2-deferral, the `faq` schema does **not** include a `locale` field — all V1 entries are English, and a `locale` field can be added additively in V1.2 without breaking the schema.

**Given** FR32 requires testimonials and user stories to be managed without code changes,
**When** I define the `testimonials` schema,
**Then** the schema enforces: `id` (string), `quote` (string), `attribution` (string), `context` (string, optional — e.g., "Bought a 2015 Audi A4"), `phase` (enum `'pre' | 'post'`, default `'pre'`), `featured` (boolean, default `false`, reserved for landing-page surfacing), `authorImage` (`{src, alt, width, height}` optional object, required only when `phase === 'post'`), and `rating` (number 1–5 optional, post-launch only),
**And** at least two seed entries are committed: one pre-launch "market insight" style quote (no author image, no rating) for Story 2.6's `TrustQuoteCard` slot, and one post-launch-ready placeholder testimonial that Epic 8 will refine,
**And** a Zod refinement rejects any `phase: 'post'` entry missing `authorImage` at build time (so the schema itself enforces post-launch completeness).

**Given** FR33 requires social proof statistics to be managed without code changes,
**When** I define the `stats` schema,
**Then** the schema enforces: `id` (string), `value` (string — freeform so "€7,200" and "47%" and "100k+" all fit), `label` (string), `source` (string, optional — for pre-launch citation), `category` (enum `'teal' | 'amber' | 'coral'` matching the `StatCard` prop from Story 2.3), `phase` (enum `'pre' | 'post'`, default `'pre'`), and `order` (number),
**And** at least three pre-launch seed entries are committed for Story 2.6's `SocialProofSection` with real market data citations,
**And** the Zod schema requires `source` when `phase === 'pre'` and does not when `phase === 'post'` (because post-launch stats are internal metrics, not cited third-party sources).

**Given** per our agreed scope the `siteContent` collection holds the editable global strings listed in the epic breakdown discussion,
**When** I define the `siteContent` schema,
**Then** the schema is a **single-entry** collection (`src/content/siteContent/landing.json` — or the collection's default single-entry filename) whose Zod schema enforces these top-level groups:
  - `hero`: `{headline: string; subheadline: string; postLaunchHeadline?: string; postLaunchSubheadline?: string}` — the post-launch variants are optional and default to the pre-launch value when absent so Story 5.3 can branch on `isPostLaunch()`,
  - `problem`: `{body: string[]; stats: {label: string; value: string; source: string}[]}` — `body` is an array of paragraphs and `stats` is an inline list to back the Story 2.2 inline statistics,
  - `footer`: `{tagline: string; smallPrint: string}`,
  - `socialLinks`: `{twitter?: string; instagram?: string; tiktok?: string; youtube?: string}` — all optional, each a valid absolute URL via a Zod `.url()` refinement,
  - `appStoreUrls`: `{ios?: string; android?: string}` — blank at V1, populated for launch in Epic 8,
  - `ctaLabels`: `{preLaunchPrimary: string; postLaunchPrimary: string}` — e.g., "Join the waitlist" / "Download the app",
**And** the seed `siteContent/landing.json` is committed with realistic Truvis V1 values for every pre-launch field and empty strings for the post-launch-only fields (`appStoreUrls.ios`, `appStoreUrls.android`),
**And** a build-time Zod refinement does **not** require `socialLinks.*` to be populated at V1 (because real URLs are filled in Story 5.4 and may not exist at the moment this story ships).

**Given** AR25 requires all Content Collection access to go through `lib/content.ts` and Epic 4 Story 4.1 created the module with blog helpers only,
**When** I extend `src/lib/content.ts`,
**Then** the module gains typed async helpers: `getFaqEntries(): Promise<FaqEntryView[]>` (sorted by `order` then by `id`), `getFeaturedFaqEntries(limit?: number): Promise<FaqEntryView[]>`, `getTestimonials(phase?: 'pre' | 'post'): Promise<TestimonialView[]>` (filters by phase, defaults to current phase from `lib/launch-phase.ts` — but because Story 5.3 hasn't shipped yet at this story's completion, the default-parameter call site uses a hard-coded `'pre'` with a `TODO(epic-5-phase)` comment that Story 5.3 removes), `getStats(phase?: 'pre' | 'post'): Promise<StatView[]>` (same pattern), and `getSiteContent(): Promise<SiteContentView>`,
**And** each helper applies a `build*View()` transform function from `src/lib/types/content.ts` that mirrors the `buildBlogEntryView()` pattern from Story 4.1 (camelCase, absolute URLs, image objects),
**And** no consumer in the repo (outside `lib/content.ts`) calls `getCollection('faq' | 'testimonials' | 'stats' | 'siteContent')` directly — the same boundary rule that applies to `blog` (AR25).

**Given** Story 4.1's ESLint rule (or code-review checklist) enforces the `lib/content.ts` boundary,
**When** I extend the boundary enforcement,
**Then** the rule is extended to cover the four new collection names,
**And** the `docs/design-conventions.md` entry for the access boundary is updated to list all five collections,
**And** the Epic 4 contract test file `tests/content.test.ts` is not modified in this story — FAQ / testimonials / stats / siteContent are internal-only collections (not exposed via the blog API) and do not share the `BlogPostView` contract.

### Story 5.2: Configure Keystatic admin UI with self-hosted GitHub OAuth and mirror all five Content Collections

As Cristian,
I want a live Keystatic admin UI at `/keystatic` where I can create, edit and publish entries for all five Content Collections, commit changes to GitHub via a self-hosted OAuth app, and see my changes flow through the normal PR + deploy pipeline,
So that I can update any piece of content on the landing page without touching code and without trusting a third-party Keystatic Cloud service with our auth path.

**Acceptance Criteria:**

**Given** AR6 mandates a Keystatic admin UI mirroring the Zod schemas of all five collections and per our agreed scope we use **self-hosted GitHub OAuth** (not Keystatic Cloud),
**When** I install and configure Keystatic,
**Then** `@keystatic/core` and `@keystatic/astro` are added as dependencies,
**And** the Keystatic Astro integration is registered in `astro.config.mjs` alongside the existing integrations,
**And** `keystatic.config.ts` is created at the repo root and exports a config with `storage: {kind: 'github', repo: {owner: '<github-user-or-org>', name: 'truvis-landing-page'}}`,
**And** the config declares five collections / singletons that mirror the Zod schemas from Story 5.1 and Story 4.1: `blog` (collection), `faq` (collection), `testimonials` (collection), `stats` (collection), `siteContent` (singleton — because it is a single-entry collection),
**And** each Keystatic field declaration exactly mirrors its Zod counterpart: required/optional, type, enum options, min/max lengths — any drift between the two is a `TODO` comment plus an entry in a short `docs/integrations/keystatic.md` "Known drift" section so future maintainers can reconcile.

**Given** FR28 requires content admin authoring of blog articles without touching code and FR29 requires per-article SEO metadata in the CMS,
**When** I configure the `blog` collection in Keystatic,
**Then** the form surfaces every field from the Story 4.1 Zod schema including the `seo` nested object (`title`, `description`, `socialImage`, `keywords`),
**And** the `featuredImage` field uses Keystatic's image-upload helper that writes to `src/assets/blog/` with the `{src, alt, width, height}` object shape preserved,
**And** the `category` field is a dropdown populated from the same enum values as the Zod schema,
**And** the `relatedSlugs` field is a multi-select populated from the existing blog posts so Cristian doesn't type slugs by hand,
**And** the MDX body field uses Keystatic's rich document editor so Cristian can write in a WYSIWYG pane without learning MDX syntax.

**Given** FR31/32/33 require FAQ / testimonials / stats to be managed without code changes,
**When** I configure those three collections in Keystatic,
**Then** each collection renders a list view with inline reordering (mapped to the `order` field) and per-entry edit forms,
**And** every field from Story 5.1's Zod schemas is editable via the admin UI with the same validation constraints (required/optional, enum/dropdown, min/max),
**And** the `testimonials` collection's conditional `authorImage` requirement (required when `phase === 'post'`) is enforced via a Keystatic `condition` helper so the image field is hidden-and-unrequired for pre-launch entries and shown-and-required for post-launch entries.

**Given** FR30 + FR53 require a pre/post-launch mechanism and the `siteContent` singleton holds the phase-conditional hero / CTA label copy,
**When** I configure the `siteContent` singleton in Keystatic,
**Then** the form is organised into the five tab-like groups matching the schema: `hero`, `problem`, `footer`, `socialLinks`, `appStoreUrls`, `ctaLabels`,
**And** the phase-conditional fields (`hero.postLaunchHeadline`, `hero.postLaunchSubheadline`, `ctaLabels.postLaunchPrimary`, `appStoreUrls.ios`, `appStoreUrls.android`) are grouped into a "Post-launch content" collapsed section with a prominent callout "These fields are only rendered when `LAUNCH_PHASE=post` — safe to leave blank pre-launch.",
**And** the `socialLinks.*` URL fields use Keystatic's URL field type with built-in absolute-URL validation so Cristian cannot save malformed URLs.

**Given** self-hosted GitHub OAuth is required,
**When** I set up the OAuth app,
**Then** a new GitHub OAuth App is registered by Cristian in his GitHub account settings with: homepage URL `https://<production-domain>/`, authorization callback URL `https://<production-domain>/api/keystatic/github/oauth/callback`, and an additional callback for the `*.pages.dev` preview URL pattern if GitHub permits,
**And** the OAuth App's `client_id` and `client_secret` are stored in Cloudflare Pages environment variables as `KEYSTATIC_GITHUB_CLIENT_ID` (public) and `KEYSTATIC_GITHUB_CLIENT_SECRET` (private) — secret **never** committed to the repo (NFR12),
**And** both env vars are added to `.env.example` with empty values and a comment pointing to the GitHub OAuth App registration page,
**And** `lib/env.ts` (from Story 1.7) gains a typed `getKeystaticConfig()` accessor that reads both variables and throws at build time if either is missing in production.

**Given** Keystatic's admin route must be mounted and server-side-protected,
**When** I wire the admin route,
**Then** `src/pages/keystatic/[...params].astro` (and the API auth handlers under `src/pages/api/keystatic/`) are generated by the Keystatic Astro integration at the repo-standard path `/keystatic`,
**And** the admin UI is **not** statically prerendered — it runs as a server-side-rendered surface on Cloudflare Pages Functions using the Cloudflare adapter (adding the Cloudflare adapter to `astro.config.mjs` if Epic 1 didn't already),
**And** unauthenticated visits to `/keystatic` redirect to the GitHub OAuth flow,
**And** only GitHub users with push access to the `truvis-landing-page` repo can authenticate — Keystatic's built-in authorization enforces this,
**And** `robots.txt` is updated to disallow `/keystatic` so search engines don't index the admin surface (the route remains visible to anyone who knows it exists, but that's acceptable because it is auth-gated).

**Given** FR34 requires any content change to trigger an automated rebuild + deploy,
**When** Cristian publishes an entry in Keystatic,
**Then** Keystatic commits the change to a new branch in GitHub and opens a pull request (the default Keystatic GitHub-mode workflow),
**And** Cristian merges the PR via the GitHub UI,
**And** the merge to `main` triggers the existing Story 1.2 Cloudflare Pages auto-deploy,
**And** the Story 1.2 Lighthouse CI gates run on the PR before merge so content changes that break perf/a11y/SEO budgets are blocked just like code changes,
**And** the flow is documented in `docs/integrations/keystatic.md` under "Authoring workflow" with step-by-step screenshots (or screenshot placeholders to be captured in Story 5.5).

**Given** hydration discipline and performance,
**When** I audit the Keystatic integration's impact on the public landing page,
**Then** Keystatic's admin-UI JavaScript is not shipped to any non-admin route — it is code-split and only loads on `/keystatic/**`,
**And** the landing page's initial bundle weight (NFR5) is unchanged after Keystatic is installed,
**And** a CI Lighthouse run on `/` confirms no regression from the Story 4.9 baseline.

### Story 5.3: Build `lib/launch-phase.ts`, wire `LAUNCH_PHASE` env var and swap every Epic 2/3/4 `TODO(epic-5-phase)` hard-coded constant

As Cristian,
I want a single, typed, well-tested `isPostLaunch()` helper that reads the `LAUNCH_PHASE` env var at build time, and every hard-coded `'pre'` constant scattered through Epic 2/3/4 replaced with a call to that helper,
So that flipping pre/post-launch is a single env-var change and the codebase has exactly one source of truth for phase state.

**Acceptance Criteria:**

**Given** AR16 mandates a single `LAUNCH_PHASE` env var (`'pre' | 'post'`) read at build time via `lib/launch-phase.ts`,
**When** I create `src/lib/launch-phase.ts`,
**Then** the module exports a single public function `isPostLaunch(): boolean` and a type-narrowed `getLaunchPhase(): 'pre' | 'post'` helper,
**And** both helpers read the env var exactly once at module load via `lib/env.ts`'s typed accessor (not directly via `import.meta.env`),
**And** if `LAUNCH_PHASE` is missing in `production` the build **throws** a descriptive error (`Missing required env var LAUNCH_PHASE — must be 'pre' or 'post'`),
**And** if `LAUNCH_PHASE` is any value other than `'pre'` or `'post'` the build throws,
**And** if `LAUNCH_PHASE` is missing in local `dev` the helper defaults to `'pre'` with a single dev-only console warning (so local development isn't blocked).

**Given** the helper is the only sanctioned way to read phase state per AR16,
**When** I enforce the single-entry-point rule,
**Then** `docs/design-conventions.md` gains an entry: "Phase state. Do not read `import.meta.env.LAUNCH_PHASE` or `process.env.LAUNCH_PHASE` outside of `lib/launch-phase.ts`. Call `isPostLaunch()` from components.",
**And** an ESLint rule (or code-review checklist line) flags `LAUNCH_PHASE` occurrences outside `lib/launch-phase.ts` and `lib/env.ts`,
**And** Vitest unit tests at `tests/launch-phase.test.ts` cover: `'pre'` → `isPostLaunch()` returns `false`, `'post'` → returns `true`, missing in prod → throws, invalid value → throws, missing in dev → defaults to `'pre'` with warning.

**Given** Epic 2/3/4 stories deliberately left `TODO(epic-5-phase)` markers where phase-conditional logic was needed,
**When** I sweep the repo for those markers,
**Then** every `TODO(epic-5-phase)` marker is replaced by a real `isPostLaunch()` call — in particular:
  - **Epic 2 Story 2.6 `SocialProofSection`**: the commented-out `isPostLaunch()` phase switch becomes real code; pre-launch renders the pre `StatCard`s and `TrustQuoteCard`, post-launch renders the post-launch variants (the post-launch content still lives in Epic 8's `siteContent.hero.postLaunchHeadline` / etc. — this story wires the mechanism, not the content),
  - **Epic 4 Story 4.6 `blog-inline-cta`**: the `const LAUNCH_PHASE_V1 = 'pre'` constant is deleted and replaced with an `isPostLaunch() ? ... : ...` render branch,
**And** every replacement is covered by a comment explaining what the two branches do so a reviewer can scan phase-conditional code without running it.

**Given** Cloudflare Pages env vars are per-scope,
**When** I configure `LAUNCH_PHASE` in the hosting environment,
**Then** `LAUNCH_PHASE=pre` is set in the `production` and `preview` scopes from Story 1.2,
**And** `.env.example` is updated with `LAUNCH_PHASE=pre` and a comment explaining the allowed values,
**And** `docs/integrations/launch-phase.md` is created (short dev note) describing: how to flip the flag ("Cloudflare Pages dashboard → Settings → Environment variables → change `LAUNCH_PHASE` from `pre` to `post` → trigger a redeploy"), the expected rebuild-and-deploy time (<5 min per NFR30), and the fact that the flip is a redeploy, not a code change (AR16).

**Given** correctness of the phase switch is load-bearing for launch day,
**When** I add integration verification to CI,
**Then** the Story 1.2 CI job gains a matrix run that sets `LAUNCH_PHASE=pre` and `LAUNCH_PHASE=post` and builds the site in each mode,
**And** both builds must succeed (no type errors, no missing-content errors),
**And** a small Vitest test asserts that the composed landing page renders *different* markup in the two phases by loading the compiled HTML and asserting the pre-launch CTA label differs from the post-launch CTA label,
**And** any build-time error related to missing post-launch content (e.g., `appStoreUrls.ios` still blank when `LAUNCH_PHASE=post`) is surfaced clearly — this is the desired behaviour: post-launch builds fail fast if the required content is missing.

### Story 5.4: Swap Epic 2/3 hard-coded strings and placeholder data to real Content Collection reads

As a visitor to the landing page,
I want the hero, problem section, social proof, FAQ, footer and social media links to be real content that Cristian can edit in Keystatic — not hard-coded placeholder i18n strings,
So that Cristian can refine launch copy without a code deploy and the landing page has its final V1 content.

**Acceptance Criteria:**

**Given** Epic 2 shipped with placeholder strings in `src/i18n/en/landing.json` for hero, problem, FAQ, social proof and footer-cta copy, and per our agreed scope those strings now move to the `siteContent` and `faq` / `stats` collections,
**When** I sweep Epic 2's section components,
**Then** `HeroSection` (Story 2.1) reads from `getSiteContent()` → `siteContent.hero` at build time and renders `hero.headline` / `hero.subheadline` when `isPostLaunch() === false` and the `postLaunchHeadline` / `postLaunchSubheadline` fields when `isPostLaunch() === true` (with the pre-launch values as the fallback when post-launch fields are blank),
**And** `ProblemSection` (Story 2.2) reads from `siteContent.problem.body` and `siteContent.problem.stats`, iterating over the stats array inline,
**And** `SocialProofSection` (Story 2.6) reads from `getStats(phase)` and `getTestimonials(phase)` — the hard-coded `'pre'` argument from Story 5.1's extended `lib/content.ts` defaults is now passed explicitly as `getStats()` (no argument) so it picks up the current phase via `isPostLaunch()`,
**And** `FaqSection` (Story 2.8) reads from `getFaqEntries()` and renders one accordion item per entry, replacing the `landing.faq.items` i18n array entirely,
**And** `FooterCtaSection` (Story 2.9) reads `siteContent.ctaLabels.preLaunchPrimary` / `postLaunchPrimary` for the CTA button label and `siteContent.hero.postLaunchHeadline` etc. if a post-launch footer headline is added to the schema (not required at V1).

**Given** FR11 requires social media profile links and Epic 1 wired placeholder URLs in the `Footer`,
**When** I finalise FR11,
**Then** `Footer` (Story 1.4) reads `siteContent.socialLinks` from `getSiteContent()` and renders one link per non-empty URL,
**And** if a social link URL is blank it is simply not rendered (no empty `<a href="">` tags),
**And** Cristian populates the real Truvis social URLs in Keystatic and commits them via the PR flow — if the URLs are not yet known at the moment this story ships, the `siteContent.socialLinks` field is left empty and the Footer renders no social icons, and a follow-up content task is added to `docs/launch-checklist.md`,
**And** the `TODO(epic-5): wire real social URLs from siteContent collection` comment from Epic 2 Story 2.9 is removed in the same commit.

**Given** every `TODO(epic-5-content)` marker in Epic 2/3/4 must be resolved,
**When** I sweep the repo for the markers,
**Then** every marker is either replaced with the appropriate `getSiteContent()` / `getFaqEntries()` / `getStats()` / `getTestimonials()` call,
**And** the corresponding placeholder i18n strings that are now owned by collections are **deleted** from `landing.json` (for the English locale file) to avoid drift between two sources of truth,
**And** the French and German JSON locale files retain the same deleted keys as blank strings with a comment `// Migrated to siteContent collection — re-add on V1.2 for locale content`,
**And** a compile-time check (not a runtime check) ensures that no landing-page component imports the deleted i18n keys — the TypeScript strict mode from Story 1.7 catches any stragglers.

**Given** Story 5.1's default-parameter `'pre'` workaround in `lib/content.ts` is now obsolete because `lib/launch-phase.ts` exists,
**When** I finalise `lib/content.ts`,
**Then** the `getTestimonials(phase?)` and `getStats(phase?)` default parameters now default to `isPostLaunch() ? 'post' : 'pre'`,
**And** the `TODO(epic-5-phase)` comment at those default sites is removed,
**And** Story 5.3's Vitest tests for `isPostLaunch()` continue to pass alongside new tests for `getTestimonials()` / `getStats()` honouring the phase default.

**Given** the landing page is now entirely content-driven,
**When** I verify the end-to-end result,
**Then** editing any field in Keystatic and merging the resulting PR updates the corresponding visible element on the deployed landing page — specifically verified for: hero headline, one FAQ entry's question, one social proof stat value, and a social media URL (the four categories),
**And** no landing-page content change requires touching a `.astro`, `.tsx`, `.ts`, or `landing.json` file — every content change flows through the `src/content/` tree via Keystatic commits,
**And** the landing page's CI Lighthouse budgets continue to pass after this swap (NFR5, NFR6),
**And** axe-core reports zero new violations,
**And** the landing page renders correctly under 140% synthetic FR/DE placeholder strings (UX-DR31) — critical because the real content may be longer than the Epic 2 placeholders.

### Story 5.5: Verify `Keystatic → PR → deploy` pipeline meets FR34 and NFR30 end-to-end

As Cristian,
I want a documented, dated verification that editing content in Keystatic actually triggers a PR, triggers a rebuild, and deploys the change to the live preview environment in under five minutes,
So that I know the content-operations loop is ready for launch day and the <5 minute SLA is not a theoretical claim.

**Acceptance Criteria:**

**Given** FR34 requires any CMS change to trigger an automated rebuild + deploy and NFR30 sets the budget at <5 minutes (with our agreed target of <3 minutes),
**When** I perform the verification,
**Then** the verification is performed against the Cloudflare Pages `preview` environment (never directly against `production`),
**And** the verification is run **twice** on different days to surface any intermittent CI or deployment latency.

**Given** the loop is what needs verifying,
**When** I walk through the verification script,
**Then** the following sequence is executed and each step is timed and recorded in `docs/launch-checklist.md` under "Epic 5 verification":
  1. Cristian logs into `/keystatic` on the preview environment using the GitHub OAuth flow from Story 5.2,
  2. Cristian edits the `siteContent.hero.headline` field to a unique verification string (e.g., `"Verification run 2026-04-10T14:30 — ignore"`),
  3. Cristian clicks "Publish" in Keystatic,
  4. A new branch and PR are automatically opened in the `truvis-landing-page` GitHub repo; the PR URL and time are recorded,
  5. Cristian merges the PR via the GitHub UI; the merge time is recorded,
  6. The Cloudflare Pages auto-deploy starts; the deploy start time is recorded,
  7. The deploy completes and the preview URL's hero headline reflects the new verification string; the deploy end time is recorded,
  8. The total elapsed time from Step 3 ("Publish" click) to Step 7 (verified on live preview) is computed and recorded.

**Given** NFR30 sets the hard budget at <5 minutes and our target at <3 minutes,
**When** the total elapsed time is measured,
**Then** if total < 3 minutes: **pass, on-target** — record the time and the story is complete,
**And** if 3 minutes ≤ total < 5 minutes: **pass, but above target** — record the time and file a follow-up optimisation task (likely the Astro build time or the Lighthouse CI step),
**And** if total ≥ 5 minutes: **fail** — the story is **not** complete until the cause is identified and resolved; the common causes to check in order are: Lighthouse CI cold-start latency, Astro build-time regression, content collection size growth, Cloudflare Pages deployment latency.

**Given** FR34 also requires the sitemap to regenerate on every build,
**When** I verify the rebuild,
**Then** the post-deploy smoke check includes a `curl -I https://<preview-url>/sitemap-index.xml` confirming the file exists and is served with fresh `Last-Modified` / `ETag` headers,
**And** a `docs/launch-checklist.md` note confirms the sitemap's timestamp updated after the content-change deploy.

**Given** rollback is also a content-operations concern,
**When** I verify the rollback path,
**Then** a second verification run edits `siteContent.hero.headline` back to the original value via Keystatic,
**And** the same <5 min budget applies to the rollback deploy,
**And** the entire round-trip (forward change + rollback) is completed in <10 minutes and recorded in the launch checklist.

**Given** this is a verification-only story with no new code,
**When** the story is complete,
**Then** `docs/launch-checklist.md` contains a dated "Epic 5 verification" section with all recorded timings, PR URLs, deploy URLs, and any observed issues,
**And** any issues surfaced are either fixed in a follow-up story (if non-blocking) or hotfixed before the story is marked complete (if blocking),
**And** the verification PR and any ancillary verification-string commits are reverted or garbage-collected so the preview environment is clean at the story's end.

## Epic 6: Discoverability — SEO & Analytics

Search engines fully index the site (sitemap, robots.txt enrichment, JSON-LD for Organization / WebSite / BlogPosting / FAQPage, canonical URLs already wired in Epic 1, image SEO) and Cristian can monitor traffic, conversion events, UTM attribution, and micro-survey responses through a privacy-respecting, cookieless Plausible Cloud (EU) dashboard. Lighthouse SEO ≥ 95 is enforced by the Story 1.2 CI gate. All structured data is generated through `lib/structured-data.ts` helpers (AR26) and all custom events go through a single `lib/analytics.ts` `trackEvent()` wrapper (AR14) — no inline JSON-LD and no scattered Plausible calls anywhere in the codebase.

### Story 6.1: Build `lib/structured-data.ts` helpers and wire global Organization + WebSite JSON-LD into BaseLayout

As Cristian (the developer),
I want a single typed module that produces every JSON-LD payload the site emits, with the global Organization and WebSite payloads injected into BaseLayout from day one,
So that search engines understand the Truvis brand identity and site structure on every page, and there is exactly one place to change structured-data shape when schema.org evolves.

**Acceptance Criteria:**

**Given** AR26 mandates that all structured data is generated via helpers in `src/lib/structured-data.ts` and forbids inline JSON-LD in templates,
**When** I create `src/lib/structured-data.ts`,
**Then** the module exports four pure functions: `organizationJsonLd()`, `websiteJsonLd()`, `blogPostingJsonLd(post: BlogPostView)`, and `faqJsonLd(entries: FaqEntryView[])`,
**And** each function returns a typed `Record<string, unknown>` object whose shape matches the corresponding schema.org type (`Organization`, `WebSite`, `BlogPosting`, `FAQPage`) including the mandatory `@context: 'https://schema.org'` and `@type` fields,
**And** no other file in the repo contains a literal `'@context'` or `'@type'` string — a Vitest `tests/structured-data.test.ts` enforces this via a glob scan that excludes `src/lib/structured-data.ts` itself,
**And** the helper functions are pure: same input → same output, no I/O, no `import.meta.env` reads (the site URL is passed in as a parameter or read from a typed config helper, not directly from env).

**Given** schema.org validation is non-negotiable,
**When** I add the helper unit tests,
**Then** `tests/structured-data.test.ts` includes a snapshot test for each helper with realistic input,
**And** every snapshot is hand-validated against the [Google Rich Results Test](https://search.google.com/test/rich-results) at story-completion time, with the validation timestamp + screenshot recorded under `docs/seo/structured-data-validation.md`,
**And** the test file additionally asserts that every required field for the corresponding schema.org type is present (`Organization.name`, `Organization.url`, `Organization.logo`; `WebSite.name`, `WebSite.url`, `WebSite.potentialAction.SearchAction` if a search surface ships at V1, otherwise omit the action field rather than ship a stub),
**And** any field whose value would be the empty string is omitted from the output object entirely (so no `"description": ""` in the rendered JSON).

**Given** FR41 requires Organization and WebSite JSON-LD on every page,
**When** I extend `src/layouts/BaseLayout.astro` (built in Story 1.4),
**Then** the head emits two `<script type="application/ld+json">` blocks before any other script: one from `organizationJsonLd()` and one from `websiteJsonLd()`,
**And** the `organizationJsonLd()` call is fed real Truvis values from `siteContent` (read via `getSiteContent()` — Story 5.1) so the brand name, URL, logo URL, and `sameAs` array of social profile URLs (FR11) are content-managed, not hard-coded,
**And** the helper outputs are JSON-stringified with `JSON.stringify(payload)` (no pretty-printing — no extra whitespace bytes shipped to the visitor) and HTML-escaped via Astro's built-in `set:html` only after a sanity check that no value contains a literal `</script>` substring (a Zod refinement at the helper boundary throws if so),
**And** both blocks are emitted on every page that uses BaseLayout — landing page, blog index, blog article, FAQ-only routes, 404, 500.

**Given** the warmup/sweep should not cost initial bundle weight (NFR5),
**When** I measure the page weight after wiring the global JSON-LD,
**Then** the combined `Organization` + `WebSite` payload size on the home page is < 2 KB gzipped,
**And** the existing Story 4.9 Lighthouse Performance score for `/` is unchanged (no regression),
**And** the JSON-LD blocks are not duplicated by any section component — a `data-jsonld-source="base-layout"` attribute is added on the BaseLayout blocks and a Vitest test asserts that no other component emits a script with that attribute.

**Given** developers will need to add new structured-data types in V1.x without re-reading this story,
**When** I document the helper module,
**Then** `docs/seo/structured-data.md` is created with: the AR26 boundary rule, the list of currently-supported types, a worked example of adding a new type (e.g., `breadcrumbJsonLd()`), the validation workflow (Vitest snapshot → Rich Results Test → record in `docs/seo/structured-data-validation.md`), and a note that any new type **must** ship with a unit test before merge.

### Story 6.2: Wire BlogPosting JSON-LD per article and FAQPage JSON-LD on the FAQ section

As a search engine crawler,
I want every Truvis blog article to expose `BlogPosting` structured data and every FAQ section instance to expose `FAQPage` structured data,
So that articles are eligible for rich-result treatment in search and FAQ entries can surface as expandable Q&A snippets in result pages.

**Acceptance Criteria:**

**Given** Story 6.1 created `blogPostingJsonLd(post)` and `faqJsonLd(entries)` and Epic 4 Story 4.3 created the blog article layout,
**When** I extend `src/layouts/BlogArticleLayout.astro` (or whatever the Epic 4 article layout is named),
**Then** the layout's `<head>` emits a `<script type="application/ld+json">` block built from `blogPostingJsonLd(post)`,
**And** the helper input is the same `BlogPostView` object the layout already receives from Story 4.1's `getBlogPost(slug)` — no new collection reads,
**And** the rendered payload includes `headline`, `description`, `image` (absolute URL of the featured image), `datePublished`, `dateModified`, `author` (an `Organization` reference to Truvis since articles are written under the Truvis byline, not personal authors at V1), `publisher` (the same Truvis Organization reference), `mainEntityOfPage` (canonical article URL), and `articleSection` (the `category` field),
**And** the `image` field uses the absolute URL produced by the Story 4.1 `buildBlogEntryView()` transform — never a relative path,
**And** any optional schema.org field whose source data is missing is omitted entirely (per the Story 6.1 contract).

**Given** FAQ structured data must avoid Google's rich-results penalty for hidden Q&A,
**When** I render `faqJsonLd(entries)` on the FAQ section (Story 2.8),
**Then** the JSON-LD is only emitted on pages where the FAQ section is **actually rendered to the visitor** — never on pages that link to the FAQ but don't render it (per Google's FAQPage guidelines that disqualify hidden FAQ markup),
**And** at V1 that means: emitted on `/` (landing page renders Story 2.8 inline), and not emitted on `/blog/**` or `/keystatic/**`,
**And** the entries fed into `faqJsonLd()` are the exact same `FaqEntryView[]` array Story 5.4's `FaqSection` already calls `getFaqEntries()` for — no second collection read,
**And** each emitted `Question` includes the plain-text `question`, and each emitted `Answer` includes the rendered Markdown `answer` converted to plain text (no HTML — Google rejects HTML in `acceptedAnswer.text`),
**And** a small Markdown-to-plain-text helper lives in `src/lib/markdown.ts` and is unit-tested for: link → "anchor text (URL)" expansion, bold/italic → plain text, list → newline-separated lines.

**Given** rich-result eligibility must be verified, not assumed,
**When** I complete the wiring,
**Then** the Story 6.1 snapshot test file is extended with snapshots of the BlogPosting payload (using a fixture article from `tests/factories/blog.ts`) and the FAQPage payload (using fixture FAQ entries),
**And** both rendered payloads are validated against the Google Rich Results Test at story-completion time and the timestamp + screenshots are appended to `docs/seo/structured-data-validation.md`,
**And** any validation warnings (not just errors) are recorded with a disposition: "fix in this story" or "deferred to V1.x with rationale".

**Given** content drift between collection and rendered HTML would silently break rich results,
**When** I add a contract test,
**Then** `tests/structured-data.contract.test.ts` loads the build output for `/blog/<seed-article-slug>/index.html`, parses the JSON-LD block, and asserts that the `BlogPosting.headline` matches the visible `<h1>` text and that `BlogPosting.image` equals the `<img>` `src` of the featured image element,
**And** a similar assertion runs for `/index.html` between the FAQ accordion items and the `FAQPage.mainEntity[].name` array,
**And** the contract test runs in CI alongside the Story 4.8 blog API contract test.

**Given** Lighthouse SEO score is gated at ≥95 (NFR39),
**When** I run Lighthouse against `/` and `/blog/<seed-article-slug>/` after wiring,
**Then** both pages report zero structured-data warnings in the Lighthouse SEO audit,
**And** the SEO score remains ≥95 on both pages.

### Story 6.3: Configure `@astrojs/sitemap` with i18n awareness and verify regeneration on every build

As a search engine crawler,
I want to discover every public page on the Truvis site through a single XML sitemap that updates on every deploy,
So that new blog articles and content changes are indexed within hours of publication, not weeks.

**Acceptance Criteria:**

**Given** FR40 requires an XML sitemap regenerated on every build and Story 1.6 declared `astro.config.mjs` with `defaultLocale: 'en'`, `locales: ['en', 'fr', 'de']`, `prefixDefaultLocale: false`,
**When** I install and configure `@astrojs/sitemap`,
**Then** `@astrojs/sitemap` is added as a dev dependency,
**And** the integration is registered in `astro.config.mjs` with: `site: process.env.PUBLIC_SITE_URL` (read via `lib/env.ts`), `i18n: { defaultLocale: 'en', locales: { en: 'en-US', fr: 'fr-FR', de: 'de-DE' } }`, and a `filter` function that excludes `/keystatic/**` and `/_demo/**`,
**And** running `npm run build` produces `dist/sitemap-index.xml` and one or more `dist/sitemap-*.xml` files,
**And** `dist/sitemap-index.xml` references every generated sub-sitemap.

**Given** the sitemap must include only canonical, indexable URLs,
**When** I inspect the generated sitemap,
**Then** it contains: `/` (home), every `/blog/<slug>` from the Story 4.1 collection, `/blog` (index), `/privacy` (Epic 7), `/404` and `/500` are **excluded**, `/keystatic/**` is **excluded**, `/_demo/**` is **excluded**,
**And** every URL uses HTTPS and the canonical absolute form (matching the Story 1.4 BaseLayout canonical slot),
**And** because V1 ships only English content, no `<xhtml:link rel="alternate" hreflang="...">` annotations are emitted at V1 — the i18n config exists for V1.2 but does not pollute the V1 sitemap with placeholder locale URLs (a code comment in `astro.config.mjs` explains this deliberate decision and points to the V1.2 follow-up).

**Given** the home page and recent blog articles deserve higher crawl priority,
**When** I customise the sitemap entries,
**Then** the integration's `serialize` callback sets `priority: 1.0` and `changefreq: 'weekly'` for `/`, `priority: 0.8` and `changefreq: 'weekly'` for `/blog`, `priority: 0.7` and `changefreq: 'monthly'` for individual blog articles, and the default for everything else,
**And** the `lastmod` field for blog articles is set from the `BlogPostView.dateModified` field from Story 4.1 (falling back to `datePublished` when unset).

**Given** Story 1.4 committed `public/robots.txt` with a basic config (FR43),
**When** I extend `public/robots.txt`,
**Then** the file gains a `Sitemap: https://<production-domain>/sitemap-index.xml` line at the bottom,
**And** the `Disallow: /keystatic/` line from Story 5.2 is preserved,
**And** the file is re-validated by visiting `/robots.txt` on the preview deployment after deploy.

**Given** sitemap regeneration must be verified end-to-end as part of NFR30 / FR34,
**When** I add a verification step,
**Then** Story 5.5's `docs/launch-checklist.md` "Epic 5 verification" section is extended with a sub-step: "After the verification content edit deploys, `curl -s https://<preview-url>/sitemap-index.xml | grep <new-blog-slug>` confirms the new article appears in the sitemap within the same deploy",
**And** a Vitest build-output test (`tests/sitemap.test.ts`) parses `dist/sitemap-index.xml` after `astro build` and asserts: at least one sub-sitemap is referenced; every blog seed slug is present; `/keystatic/` and `/_demo/` are absent; the `site` URL prefix matches `PUBLIC_SITE_URL`.

**Given** the sitemap must surface in Google Search Console at launch,
**When** I document the post-launch handoff,
**Then** `docs/seo/sitemap.md` is created describing: where the sitemap lives, how to manually re-trigger a build via the Cloudflare Pages dashboard if the auto-rebuild misses, and the GSC verification step that Epic 8's launch checklist will execute (submit `https://<production>/sitemap-index.xml` in GSC after DNS cutover).

### Story 6.4: Enforce image SEO conventions — alt text, native lazy-loading and responsive image pipeline

As a search engine crawler and a screen reader user,
I want every image on the site to carry meaningful alt text and load efficiently below the fold,
So that image search indexes Truvis content correctly, accessibility is preserved, and page weight stays under the NFR5 budget.

**Acceptance Criteria:**

**Given** FR44 requires alt text on all images and lazy-loading below the fold and NFR5 sets a 500 KB initial budget,
**When** I sweep every Astro/React component that emits an `<img>` or uses Astro's `<Image>` component,
**Then** every `<img>` and `<Image>` instance has an `alt` attribute (never absent — empty `alt=""` is allowed only on decorative images and must be paired with `aria-hidden="true"` per UX-DR29),
**And** an ESLint rule (`jsx-a11y/alt-text` plus an Astro-specific equivalent — or a custom `astro-eslint-parser` rule if needed) is enabled and configured to fail the Story 1.2 CI lint step on any missing `alt`,
**And** the rule is documented in `docs/accessibility-conventions.md` (Story 1.7) under "Image alt text".

**Given** Astro's `<Image>` component handles responsive sizing and format conversion,
**When** I audit current image usage,
**Then** every below-the-fold image (everything outside the hero section's LCP image) uses Astro `<Image>` from `astro:assets` rather than raw `<img>`,
**And** every `<Image>` instance specifies `width`, `height`, and `alt` props,
**And** every `<Image>` defaults to `loading="lazy"` and `decoding="async"` unless explicitly overridden for the LCP image,
**And** the hero image (Story 2.1's `HeroSection` phone mockup) uses `loading="eager"` and `fetchpriority="high"` and is preloaded via `<link rel="preload" as="image">` in BaseLayout's head — already established for fonts in Story 1.3, this story extends the preload pattern to the hero image.

**Given** WebP/AVIF reduce image bytes substantially,
**When** I configure Astro's image pipeline,
**Then** `astro.config.mjs` enables the built-in `astro:assets` Sharp service,
**And** every `<Image>` instance specifies `format={['avif', 'webp', 'png']}` (or the project-wide default is set in `astro.config.mjs`),
**And** an `<Image>` instance with `widths={[400, 800, 1200]}` and `sizes` matching the responsive layout is used wherever the image renders at variable display widths,
**And** the rendered HTML uses `<picture>` with `<source srcset>` entries for AVIF and WebP and an `<img>` fallback for PNG/JPEG.

**Given** uploaded blog imagery comes through Keystatic (Story 5.2),
**When** I verify the Keystatic upload path,
**Then** images uploaded via the Keystatic admin UI land in `src/assets/blog/` and are picked up by `astro:assets` at build time (no separate CDN upload step),
**And** the Story 5.1 `blog` Zod schema's `featuredImage` shape `{src, alt, width, height}` is preserved through Keystatic and the blog rendering code so `<Image>` always has the dimensions it needs to avoid CLS (NFR3),
**And** the Story 5.2 Keystatic config flags the `alt` field as required for the `featuredImage` upload — Cristian cannot publish a blog post without alt text on the hero image.

**Given** the audit must catch regressions in future PRs,
**When** I add a build-time guard,
**Then** `tests/images.test.ts` walks every `.astro`, `.tsx`, and `.jsx` file under `src/components/` and `src/pages/` and parses image usage,
**And** the test fails if any `<img>` is found that does not also have `alt` and (`loading="lazy"` OR an opt-out comment `// allow-eager-image: <reason>`),
**And** the test runs in the Story 1.2 CI Vitest job.

**Given** the audit cannot regress page weight,
**When** I run Lighthouse on `/` and `/blog/<seed-article>/` after the audit,
**Then** the total transferred bytes for each page remains < 500 KB initial (NFR5),
**And** Lighthouse Performance score remains ≥ 90 on both pages,
**And** the "Properly size images" and "Serve images in next-gen formats" Lighthouse audits both pass (no opportunities reported with > 5 KB savings).

### Story 6.5: Integrate Plausible Cloud (EU) and build the `lib/analytics.ts` `trackEvent()` wrapper

As Cristian,
I want a single, typed module that loads Plausible asynchronously, exposes one `trackEvent(name, props)` function for the rest of the codebase, and respects the NFR28/NFR29 async + consent rules,
So that there is exactly one place in the codebase that touches Plausible and every analytics call is type-checked against the AR14 event whitelist.

**Acceptance Criteria:**

**Given** AR14 mandates Plausible Cloud (EU region, Germany), cookieless and GDPR-compliant, async-loading (NFR28),
**When** I provision the Plausible account,
**Then** a Plausible site is created on `plausible.io` (EU region) for the production domain (the domain may not yet be cut over — that's Epic 8 — so the site is created with the planned production hostname),
**And** the account region is verified as `EU` in the Plausible dashboard and the verification screenshot is committed to `docs/integrations/plausible.md`,
**And** Cristian's Plausible login is documented in `docs/integrations/plausible.md` as "stored in 1Password under `Truvis - Plausible Analytics`" — credentials are **never** committed to the repo (NFR12),
**And** the `PLAUSIBLE_DOMAIN` env var placeholder added to Cloudflare Pages in Story 1.2 is now set to the actual domain in `production` and `preview` scopes.

**Given** the Plausible script must load asynchronously and not block render (NFR28),
**When** I create `src/components/analytics/plausible-script.astro`,
**Then** the component renders a single `<script defer data-domain={domain} src="https://plausible.io/js/script.tagged-events.js"></script>` block (the `tagged-events` variant is used so HTML `data-` attributes can fire events without JS, useful for Story 6.6),
**And** the `data-domain` value is read from `lib/env.ts`'s `getRequired('PLAUSIBLE_DOMAIN')` at build time (no client-side env access),
**And** the script tag is emitted from BaseLayout's head **only when** `import.meta.env.MODE === 'production'` OR an explicit `PLAUSIBLE_FORCE_ENABLED=true` env var is set (so local dev does not pollute production stats),
**And** the script's `defer` attribute guarantees it does not block parsing and the Lighthouse Total Blocking Time metric is unchanged from the Story 4.9 baseline.

**Given** AR14 requires all custom events to fire only via a single `lib/analytics.ts` `trackEvent()` wrapper,
**When** I create `src/lib/analytics.ts`,
**Then** the module exports a single function `trackEvent<K extends AnalyticsEventName>(name: K, props?: AnalyticsEventProps[K]): void`,
**And** `AnalyticsEventName` is a TypeScript string union of exactly `'waitlist_signup' | 'app_store_click' | 'blog_cta_click' | 'micro_survey_completed'` (matching the AR14 whitelist),
**And** `AnalyticsEventProps` is a typed map declaring the allowed properties per event (e.g., `waitlist_signup: { source: 'hero' | 'mid' | 'footer' }`, `blog_cta_click: { slug: string; placement: 'inline' | 'end' }`, `app_store_click: { store: 'ios' | 'android' }`, `micro_survey_completed: { answer: string }`),
**And** `trackEvent()` calls `window.plausible(name, { props })` only when `window.plausible` exists (client-side only, no-op on the server),
**And** `trackEvent()` swallows any Plausible runtime error silently (try/catch, no `console.error`) so analytics failures never break the page.

**Given** consent gating must respect NFR29 even though Plausible is cookieless and AR15 declares the cookie banner is wired-but-inactive at V1,
**When** I wire the consent check,
**Then** `trackEvent()` first checks `window.__truvisConsent?.analytics === false` and returns immediately if so,
**And** because AR15 means no consent UI ships at V1, `window.__truvisConsent` is undefined at V1 and the analytics calls flow through (correct cookieless default),
**And** Epic 7 Story 7.1's eventual cookie-banner activation only needs to set `window.__truvisConsent.analytics = false` to block tracking — no change to `lib/analytics.ts`,
**And** a code comment in `lib/analytics.ts` documents this AR14 + AR15 + NFR29 interaction so a future maintainer reading the consent gate understands why it looks "always allow" today.

**Given** the boundary rule is load-bearing,
**When** I enforce single-source-of-truth for analytics,
**Then** an ESLint rule (custom `no-restricted-globals` plus a no-restricted-imports rule for `'plausible'`) flags any reference to `window.plausible` or any direct Plausible script outside `src/lib/analytics.ts` and `src/components/analytics/plausible-script.astro`,
**And** `docs/design-conventions.md` gains an entry: "Analytics. Do not call `window.plausible(...)` directly. Import `trackEvent` from `@/lib/analytics` and call it with a typed event name from the AR14 whitelist.",
**And** Vitest unit tests at `tests/analytics.test.ts` cover: known event name → `window.plausible` called with correct args; unknown event name → TypeScript compile error (assertion via `// @ts-expect-error`); `window.plausible` undefined → no-op, no throw; `window.__truvisConsent.analytics === false` → no-op.

**Given** verifying real events arrive in the Plausible dashboard is part of "done",
**When** I verify the integration end-to-end,
**Then** I deploy to the preview environment, visit the site, and confirm a page view appears in the Plausible dashboard within 60 seconds,
**And** the verification timestamp and a dashboard screenshot are committed to `docs/integrations/plausible.md` under "Verification log",
**And** the `MODE === 'production'` gate is verified by running `npm run dev` locally and confirming **no** events arrive in the Plausible dashboard (i.e., local dev does not pollute analytics).

### Story 6.6: Wire conversion + UTM + micro-survey custom events and verify analytics continuity across phase flip

As Cristian,
I want every meaningful conversion on the site (waitlist signups, blog CTA clicks, app store clicks post-launch, micro-survey responses) to fire the matching AR14 custom event with UTM attribution, and I want to know that flipping `LAUNCH_PHASE=post` does not create an analytics gap,
So that I can measure funnel performance and traffic source ROI from day one and trust the data through the launch transition (FR55).

**Acceptance Criteria:**

**Given** Story 6.5's `lib/analytics.ts` exports a typed `trackEvent()` and Epic 3 Story 3.x ships the waitlist form,
**When** I wire the `waitlist_signup` event,
**Then** the Epic 3 waitlist form's success handler (the React island that handles form submission) calls `trackEvent('waitlist_signup', { source })` after the Loops API confirms enrollment,
**And** `source` is one of `'hero' | 'mid' | 'footer'` and is passed in as a prop to the form island from each of the three CTA placement parents (Hero in Story 2.1, mid-page in Story 2.x, footer in Story 2.9),
**And** the event fires only on success (HTTP 2xx from Loops) — never on validation failure or network error,
**And** a Vitest test for the waitlist form island stubs `trackEvent` and asserts it is called with the correct payload exactly once on a successful submission and zero times on a failed one.

**Given** Epic 4 Story 4.6 ships the inline blog CTA component with a `placement` prop,
**When** I wire the `blog_cta_click` event,
**Then** the blog CTA's button/link `onClick` handler calls `trackEvent('blog_cta_click', { slug, placement })` where `slug` is the current blog article slug (passed in as a prop) and `placement` is `'inline' | 'end'`,
**And** the event fires before the navigation happens (using the Plausible recommendation: fire the event, then `window.location.href = ...` after a 150 ms timeout) so events are not lost to navigation cancellation,
**And** the same Story 5.3 phase switch in `blog-inline-cta` continues to determine **what** the CTA links to (waitlist vs app store), but `blog_cta_click` fires regardless of phase — phase only affects the destination, not the tracking.

**Given** Epic 8 will ship the post-launch app store buttons (FR8) but the slot exists in Epic 2 from Story 2.6 / Footer,
**When** I prepare the `app_store_click` wiring,
**Then** Story 6.6 ships a `<AppStoreLink store="ios" | "android">` component that wraps an anchor and calls `trackEvent('app_store_click', { store })` on click,
**And** the component is **not** rendered anywhere at V1 because `LAUNCH_PHASE=pre` means no app store buttons are visible — but the component exists, is unit-tested, and is ready for Epic 8 to drop into the post-launch hero/footer variants without further analytics work,
**And** a code comment in the component points to Epic 8 Story 8.1 as the consumer.

**Given** FR38 requires micro-survey responses to be tracked and Epic 3 Story 3.x ships the confirmation page with the single-question micro-survey,
**When** I wire the `micro_survey_completed` event,
**Then** each micro-survey answer button on the confirmation page calls `trackEvent('micro_survey_completed', { answer })` where `answer` is one of the canonical Story 3.x answer options (e.g., `'social' | 'search' | 'friend' | 'paid' | 'other'`),
**And** the event fires once per answer click, the answer button shows a "thank you" success state, and the component cannot fire a second event from the same render (anti-double-click guard via local state),
**And** a Vitest test asserts: each answer option fires the correct event once; rapid double-click fires the event only once; the thank-you state renders after the click.

**Given** FR37 requires UTM attribution and Plausible automatically captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from the URL when its script loads,
**When** I document the UTM workflow,
**Then** `docs/integrations/plausible.md` gains a "UTM attribution" section listing the five standard parameters Plausible captures automatically with no extra code,
**And** a Vitest integration test loads `/?utm_source=twitter&utm_campaign=launch-week` in jsdom, calls a thin helper `getUtmParamsFromUrl()` from `lib/analytics.ts`, and asserts the helper returns the parsed object (the helper exists for any code that needs to read UTMs server-side — Plausible itself does not need it),
**And** the doc shows three example UTM-tagged URLs Cristian can use immediately at launch (Twitter, newsletter, Reddit) and points to the Plausible "Sources" report tab in the dashboard.

**Given** FR55 requires analytics tracking to continue without data loss across the pre/post-launch transition,
**When** I verify the phase-flip continuity,
**Then** Story 5.3's CI matrix run that builds the site with `LAUNCH_PHASE=pre` and `LAUNCH_PHASE=post` is extended with a check that `lib/analytics.ts` and the four event call sites compile and run in **both** modes (`waitlist_signup` and `blog_cta_click` in pre mode; `app_store_click` and `blog_cta_click` in post mode; `micro_survey_completed` in pre mode only since the post-launch confirmation flow does not have a micro-survey),
**And** `docs/integrations/plausible.md` documents the deliberate event-replacement behaviour: "On launch day, `waitlist_signup` events stop firing and `app_store_click` events start firing. The Plausible dashboard's funnel widget should be reconfigured at that moment — see Epic 8 launch checklist.",
**And** the doc explicitly warns: "Do **not** rename `waitlist_signup` or `app_store_click` post-launch — Plausible event history is keyed on the event name string, and renaming would orphan all pre-launch funnel data.",
**And** a final smoke test on the preview environment with `PLAUSIBLE_FORCE_ENABLED=true` confirms each of the four events appears in the Plausible dashboard "Goals" tab within 60 seconds of being fired manually — verification log appended to `docs/integrations/plausible.md`.

### Story 6.7: SEO Lighthouse ≥95 audit and analytics dashboard access documentation

As Cristian,
I want a documented one-time SEO audit pass against `/`, `/blog`, and `/blog/<seed-article>/` confirming Lighthouse SEO ≥ 95, and a short ops note explaining how I (and any future collaborator) access the Plausible dashboard,
So that NFR39 is verifiably satisfied at story-completion time and FR39's "view analytics data via integrated dashboard" requirement has a real handoff document.

**Acceptance Criteria:**

**Given** NFR39 requires Lighthouse SEO ≥ 95 and Story 1.2 wired Lighthouse CI with hard thresholds,
**When** I run `npx lighthouse <preview-url>/` against the latest preview deploy,
**Then** the SEO score is ≥ 95 on `/`, `/blog`, and `/blog/<seed-article-slug>/`,
**And** the audit reports zero failures in the SEO category — every "Document doesn't have a meta description" / "Page isn't blocked from indexing" / "Document has a valid `hreflang`" / "Document avoids plugins" / "Image elements have `[alt]` attributes" / "Links are crawlable" check passes,
**And** any non-zero "improvement opportunity" in the SEO audit is documented in `docs/seo/lighthouse-audit.md` with a disposition: "fixed in this story", "deferred to V1.x with rationale", or "not applicable".

**Given** the audit must surface regressions early in future PRs,
**When** I extend the Story 1.2 Lighthouse CI config,
**Then** `lighthouse/lighthouserc.cjs` is updated to assert SEO ≥ 95 explicitly (in addition to the Story 1.2 thresholds for Performance ≥ 90, Accessibility ≥ 90, LCP < 2.5s, CLS < 0.1) — the threshold may already exist from Story 1.2 (NFR39), in which case this story confirms it and does not duplicate it,
**And** the Lighthouse CI run is configured to test all three URLs (`/`, `/blog`, and a representative blog article URL) on every PR rather than just `/`,
**And** the configuration change is committed and verified by opening a no-op PR and confirming all three URLs are tested in the CI run.

**Given** FR39 requires content admins to view analytics data via an integrated dashboard,
**When** I document dashboard access,
**Then** `docs/integrations/plausible.md` gains a "Dashboard access" section listing: the Plausible dashboard URL (`https://plausible.io/<production-domain>`), the login flow (1Password vault entry), the four AR14 custom events and what they mean, the standard report tabs (Pages, Sources, Devices, Goals), how to filter by UTM campaign, and how to add a future team member if needed,
**And** the doc includes a screenshot of the dashboard showing real verification events from Story 6.5 / 6.6,
**And** a one-paragraph "Reading the funnel" section explains how to interpret pre-launch funnel metrics (visit → waitlist signup) and what Cristian should look at weekly during the pre-launch phase.

**Given** the JSON-LD validation evidence accumulated in Stories 6.1 and 6.2 needs to be consolidated,
**When** I finalise the SEO audit doc,
**Then** `docs/seo/lighthouse-audit.md` references `docs/seo/structured-data-validation.md` (Stories 6.1, 6.2) and `docs/seo/sitemap.md` (Story 6.3) and `docs/seo/structured-data.md` (Story 6.1) as the four pillars of the Epic 6 SEO surface,
**And** a single "How to re-run the full SEO audit" checklist exists at the top of `docs/seo/lighthouse-audit.md` listing every command and URL needed to reproduce the validation in under 10 minutes (Lighthouse CLI, Rich Results Test URL, GSC sitemap submission URL, Plausible verification page).

**Given** the audit is part of launch readiness,
**When** I cross-link to Epic 8,
**Then** Epic 8's launch checklist (Story 8.x) is updated with a "SEO + analytics readiness" section that references this Epic 6 audit as the entry point,
**And** the launch checklist explicitly lists the "Submit sitemap to Google Search Console" step as Epic 8 work, not Epic 6 work, because GSC submission requires the production domain to be live — which is Epic 8.

**Given** Epic 6 closes the discoverability surface,
**When** I confirm scope completion,
**Then** every FR claimed by Epic 6 (FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR44, FR55) is satisfied by at least one Epic 6 story and the satisfaction is recorded in a short comment block at the top of `docs/seo/lighthouse-audit.md`,
**And** every NFR claimed by Epic 6 (NFR28, NFR29, NFR39) is similarly verified and recorded,
**And** ARs (AR14, AR26) are recorded as satisfied with a pointer to the implementing story.

## Epic 7: Compliance, Privacy & Operational Reliability

The site is GDPR-compliant from day one (privacy policy, double opt-in already wired in Epic 3 verified, right-to-erasure procedure documented and rehearsed), the cookie-consent mechanism is wired but legally-inactive at V1 because Plausible is cookieless (AR15), errors are tracked in Sentry EU with source maps and release tagging (AR19), every third-party integration boundary has a documented graceful-degradation contract, and Cristian receives automated alerts when anything breaks. Visitors can trust the site; operations have visibility into failures.

### Story 7.1: Wire `vanilla-cookieconsent` v3 in inactive mode behind `COOKIE_CONSENT_REQUIRED` flag

As Cristian,
I want the cookie consent library installed, configured, and ready to activate the moment any non-essential cookie is added to the site, but **not mounted at V1** because Plausible is cookieless and no consent banner is legally required,
So that adding a tracking cookie in V1.x is a one-line env-flag change rather than a "ship a banner under deadline pressure" emergency.

**Acceptance Criteria:**

**Given** AR15 mandates `vanilla-cookieconsent` v3 wired but inactive at V1, controlled by a single `COOKIE_CONSENT_REQUIRED` env flag, and FR45/FR46 require accept/reject persistence when active,
**When** I install and configure the library,
**Then** `vanilla-cookieconsent` v3 is added as a dependency,
**And** the integration lives in `src/components/consent/cookie-consent.astro` (Astro shell) plus `src/components/consent/cookie-consent.tsx` (React island that owns the modal markup),
**And** the React island is hydrated `client:idle` per the AR27 hydration policy from Story 1.7 (the consent UI is interactive and below-the-fold-style — never `client:load`),
**And** the consent config declares two categories — `necessary` (always on, includes the consent decision cookie itself) and `analytics` (off by default; toggling this category controls Plausible) — with placeholder copy that points at Story 7.2's privacy policy page.

**Given** the banner must not mount at V1 (AR15),
**When** I wire the env-flag gate,
**Then** `lib/env.ts` (Story 1.7) gains a typed `parseBoolean('COOKIE_CONSENT_REQUIRED')` accessor,
**And** `src/components/consent/cookie-consent.astro` reads the env flag at build time and renders **nothing** when the flag is `false` (no markup, no script, no hydration boundary, no JS shipped to the client),
**And** the `COOKIE_CONSENT_REQUIRED` env var is set to `false` in `production`, `preview`, and `local` Cloudflare Pages scopes from Story 1.2,
**And** `.env.example` is updated with `COOKIE_CONSENT_REQUIRED=false` and a comment: "Set to `true` only when a non-essential cookie is added to the site. Plausible is cookieless and does not require this; see AR15.",
**And** a Vitest test loads BaseLayout in both modes and asserts: with `COOKIE_CONSENT_REQUIRED=false` no `cookie-consent` markup appears anywhere in the rendered HTML; with `COOKIE_CONSENT_REQUIRED=true` the consent island shell is present.

**Given** Story 6.5's `lib/analytics.ts` already checks `window.__truvisConsent?.analytics === false` before firing events,
**When** I wire the consent → analytics bridge,
**Then** the React consent island, when active, sets `window.__truvisConsent = { analytics: <user_choice> }` on mount and on every consent change,
**And** when `COOKIE_CONSENT_REQUIRED=false` the global `window.__truvisConsent` is **left undefined** (not set to a default object) so the Story 6.5 analytics gate falls through its "undefined → allow" branch,
**And** a Vitest test confirms: in inactive mode, `window.__truvisConsent` is `undefined` and `trackEvent` flows through; in active mode with the user rejecting analytics, `window.__truvisConsent.analytics === false` and `trackEvent` no-ops.

**Given** FR46 requires the user's consent preference to be persisted and NFR13 requires preferences stored client-side only,
**When** I configure the persistence,
**Then** `vanilla-cookieconsent` is configured to store the consent decision in a single first-party cookie (`cc_cookie`) with `SameSite=Lax`, `Secure`, and a 6-month expiry — this is the only cookie the site sets, and only when the banner is active,
**And** no consent state is ever sent to a server endpoint (NFR13),
**And** the Story 7.2 privacy policy explicitly documents this single cookie when the banner is active and notes that V1 ships zero cookies because the banner is inactive.

**Given** UX-DR24 requires the consent UI to match the warm-editorial visual direction when active,
**When** I style the consent modal,
**Then** the `vanilla-cookieconsent` v3 CSS is overridden via `src/styles/cookie-consent.css` to use the Story 1.3 design tokens (warm bg, primary text, teal-slate accent, 4pt spacing grid, fluid `clamp()` typography),
**And** the modal meets WCAG 2.1 AA contrast (NFR20), is keyboard navigable (NFR21), traps focus while open, restores focus on close, and respects `prefers-reduced-motion` (UX-DR32),
**And** the styled modal is rendered in a Storybook-style demo at `src/pages/_demo/cookie-consent.astro` (gated behind `COOKIE_CONSENT_REQUIRED=true` in dev) so the visual treatment can be reviewed without flipping the production env var,
**And** the demo page is excluded from the sitemap (Story 6.3) and from search-engine indexing.

**Given** the inactive-but-ready posture must be preserved across future PRs,
**When** I document the activation procedure,
**Then** `docs/integrations/cookie-consent.md` is created with: the AR15 inactive-at-V1 rationale, the one-step activation procedure ("set `COOKIE_CONSENT_REQUIRED=true` in Cloudflare Pages env vars and redeploy"), the activation post-checklist (verify the banner appears, verify rejecting analytics blocks Plausible, verify the cookie persists across page loads), and a warning: "Activating the banner does **not** automatically add any tracking cookie. Activation is only legally required when a non-essential cookie is actually being set — adding a tracking cookie is what triggers activation, not the other way around."

### Story 7.2: Build privacy policy page documenting data collection, processing, retention and visitor rights

As an EU visitor (or any privacy-conscious visitor),
I want a clear, plain-language privacy policy at `/privacy` that documents what Truvis collects on this landing page, why, how long it is retained, and what my rights are,
So that I can make an informed decision about submitting my email and so the site is GDPR-compliant from day one (FR47).

**Acceptance Criteria:**

**Given** FR47 requires a privacy policy page documenting data collection, processing, and retention practices,
**When** I create `src/pages/privacy.astro` using BaseLayout (Story 1.4),
**Then** the page renders at `/privacy` with semantic structure: a single `<h1>` ("Privacy policy"), `<h2>` section headings, and a "last updated" date displayed prominently below the `<h1>`,
**And** the page is included in the Story 6.3 sitemap and the Story 1.4 footer's legal-links column (replacing the placeholder slot Epic 1 reserved),
**And** the page has a real meta description and canonical URL via the BaseLayout slots from Story 1.4,
**And** the page meets WCAG 2.1 AA contrast (NFR20), is keyboard navigable (NFR21), and the body copy uses the type scale from Story 1.3 — not a wall of unstyled text.

**Given** the policy content must be content-managed (not hard-coded so legal updates require a code deploy),
**When** I source the policy text,
**Then** the page renders the policy from a Markdown source committed at `src/content/legal/privacy-policy.md` — either as a sixth single-entry Content Collection (extending Story 5.1's pattern) or as a static file imported via Astro's MDX pipeline; the choice is documented in `docs/integrations/keystatic.md` with the rationale,
**And** if a Content Collection is used, the Story 5.2 Keystatic config exposes it as a singleton form so Cristian can edit the policy without touching code (FR47 + AR6),
**And** the Markdown source file contains a YAML frontmatter `lastUpdated` field that the page reads and renders,
**And** every internal link in the policy (e.g., "see our cookie notice") resolves to a real anchor on the same page or to `/keystatic/`-style admin routes that exist.

**Given** GDPR Article 13 sets the minimum disclosure scope,
**When** I draft the policy content,
**Then** the policy includes — at minimum — these sections: **What we collect** (waitlist email + IP address temporarily for spam protection only; no cookies at V1; no advertising IDs ever); **Why we collect it** (waitlist enrolment + double-opt-in confirmation + drip series + spam prevention); **Who we share it with** (Loops as the email service provider, with a link to Loops's own privacy policy; Cloudflare as the host; Plausible as the analytics provider, with the cookieless + EU-region notes); **How long we keep it** (Loops retains email until unsubscribe or erasure request; Plausible retains aggregated stats indefinitely with no PII; Sentry retains error events 90 days); **Your rights** (access, rectification, erasure, portability, objection, withdrawal of consent — with a working contact email for each); **Children** (the site is not intended for under-16s); **Changes to this policy** (how updates are communicated, that the `lastUpdated` field is the source of truth); **Contact** (a real `privacy@<domain>` mailbox or routed forwarder),
**And** every external party named in the policy has a working hyperlink to that party's own privacy policy.

**Given** the policy must surface the right-to-erasure contact path independently of any internal runbook,
**When** I draft the "Your rights" section,
**Then** the section includes a clear "How to request erasure" instruction pointing to the `privacy@<domain>` mailbox and stating the canonical GDPR Article 12 response SLA: "We will acknowledge your request within 72 hours and action it within 30 days (extendable by a further 60 days for complex requests, with notification)",
**And** the SLA is sourced directly from GDPR Article 12 — not from any internal runbook — so this story is self-contained and Story 7.3's runbook is responsible for matching this published SLA, not the other way around.

**Given** the policy needs legal review eventually but should not block the V1 launch,
**When** I document the review status,
**Then** `docs/legal/privacy-policy-status.md` records: the V1 policy text was drafted by Cristian (not a lawyer), the policy is "good-faith plain-language" rather than "lawyer-reviewed", a follow-up V1.x task is filed to have the policy reviewed by a GDPR-competent lawyer before paid acquisition begins, and the lawyer-review checklist items are listed inline so the future review has a starting point,
**And** the doc explicitly notes which clauses are "Truvis-specific facts that must be re-verified" (e.g., "Loops EU data residency claim — verify against Loops's DPA before launch") versus "boilerplate that any GDPR lawyer can confirm in 10 minutes".

**Given** the privacy policy is content, not code,
**When** I verify the editing workflow,
**Then** editing the policy through Keystatic and merging the resulting PR updates the live page within the Story 5.5 NFR30 budget (<5 min preview deploy),
**And** the verification is performed once and recorded in `docs/launch-checklist.md` under "Epic 7 verification".

### Story 7.3: Build right-to-erasure operational runbook for Loops, Plausible and Sentry

As Cristian (the operator),
I want a documented, rehearsed procedure for actioning a GDPR right-to-erasure request across every system that holds visitor data,
So that when the first erasure email arrives in `privacy@<domain>` I can complete the deletion within the 30-day GDPR Article 12 SLA without scrambling to figure out which dashboard to log into.

**Acceptance Criteria:**

**Given** FR49 requires subscribers to be able to request deletion of their data and the site touches three personal-data systems (Loops for email, Plausible for analytics — though cookieless and aggregated, no PII expected — and Sentry for error events that may contain IP addresses),
**When** I document the per-system erasure procedure,
**Then** `docs/runbooks/right-to-erasure.md` is created with one section per system listing: the dashboard URL, the credentials location (1Password reference, never a literal credential), the exact click path to delete a contact / event / user record, the verification step proving the deletion took effect, and the timestamping convention ("record date + reason in `docs/runbooks/erasure-log.md`"),
**And** the Loops section explicitly covers: searching by email address, deleting the contact, removing them from any active drip campaign, and verifying via the Loops "Contacts" tab,
**And** the Plausible section explicitly notes: Plausible captures no PII at V1 (cookieless, no `props.email`, no `props.userId`), so an erasure request resolves to "no data to erase — confirmed in writing to the requester" rather than a Plausible dashboard action; the runbook records the cookieless rationale so this is not re-litigated on every request,
**And** the Sentry section covers: searching by IP address (the only PII Sentry captures by default), scrubbing the matching events via Sentry's data-scrubbing UI, and verifying the IP is no longer associated with any event in the last 90-day window.

**Given** an erasure request must be ack'd within 72 hours and actioned within 30 days (GDPR Article 12),
**When** I document the SLA workflow,
**Then** the runbook includes a "Triage" section: how to ack a request (template email reply with tracking ID), how to verify the requester's identity (a confirmation email back to the requester so a third party cannot trigger an erasure of someone else's data), and how to handle ambiguous requests (template asking for clarification),
**And** the ack and verification email templates are committed to `docs/runbooks/templates/erasure-ack.md` and `docs/runbooks/templates/erasure-verify.md` as ready-to-paste copy.

**Given** the procedure must be exercised, not just written,
**When** I rehearse the runbook,
**Then** I create a test contact in Loops with a recognisable test email (`erasure-test+<timestamp>@<domain>`), enrol it in the drip series, generate a synthetic Sentry error from the same email's session, then execute the full runbook end-to-end against the test data,
**And** the rehearsal end-to-end time is recorded in `docs/runbooks/erasure-log.md` (must be <30 minutes for a single request),
**And** any step that took longer than expected or required improvisation is corrected in the runbook before the story closes,
**And** the test contact + test events are themselves erased at the end of the rehearsal.

**Given** the right-to-erasure surface is referenced from the privacy policy (Story 7.2),
**When** I cross-link the runbook,
**Then** the Story 7.2 privacy policy "Your rights" section's contact email is verified as routed to a real inbox Cristian monitors,
**And** the SLA wording in the privacy policy matches the runbook ("acknowledgement within 72 hours, action within 30 days"),
**And** any drift between the two documents is treated as a bug in this story.

**Given** future systems may add more PII surfaces,
**When** I document the additive rule,
**Then** the runbook includes a "Adding a new system" section stating: any new third-party integration that touches user data must add a section to this runbook **before** it ships to production, and the launch checklist (Story 7.6 / Epic 8) verifies this is the case for any new integration since the last launch,
**And** the rule is added to `docs/design-conventions.md` so it surfaces in normal code review.

### Story 7.4: Integrate Sentry EU with Astro SDK, source maps and release tagging

As Cristian (the operator),
I want client-side errors and build errors automatically captured in Sentry EU with proper source maps and per-deploy release tags,
So that when something breaks for a real visitor I can see the actual stack trace in TypeScript source — not minified Cloudflare bundles — and know which deploy introduced the regression.

**Acceptance Criteria:**

**Given** AR19 mandates Sentry EU integration via the official Astro SDK with build error tracking and source map upload, and each Cloudflare Pages deploy must be tagged with a Sentry release via `git rev-parse HEAD`,
**When** I provision Sentry,
**Then** a Sentry organisation exists in the **EU** region (`https://sentry.io/organizations/<org>/` confirmed as EU by the Sentry account settings page),
**And** a project is created for the Truvis landing page with the platform set to `astro`,
**And** the Sentry DSN is recorded in 1Password (never committed) and added to Cloudflare Pages env vars as `SENTRY_DSN` in `production` and `preview` scopes (the placeholder existed from Story 1.2 and is now populated),
**And** a `SENTRY_AUTH_TOKEN` is generated with `project:write` and `release:write` scopes only (least-privilege) and added as a secret env var in the Story 1.2 GitHub Actions workflow — never exposed to runtime, never committed.

**Given** the official Astro SDK handles instrumentation,
**When** I install and register the SDK,
**Then** `@sentry/astro` is added as a dependency,
**And** the Sentry Astro integration is registered in `astro.config.mjs` with: `dsn` from `lib/env.ts`, `release` set to `process.env.SENTRY_RELEASE` (which the GitHub Actions workflow populates from `git rev-parse HEAD`), `environment` set to `'production' | 'preview' | 'development'` matching the Cloudflare scope, `tracesSampleRate: 0.1` (10% transaction sampling to stay within free-tier limits at V1), and `sendDefaultPii: false` (do not capture IP addresses by default — privacy-first, see Story 7.3 erasure note),
**And** the integration is **only** registered when `import.meta.env.MODE !== 'development'` so local dev does not pollute the Sentry project — same gate pattern as Story 6.5's Plausible script.

**Given** source maps must be uploaded during the build for stack traces to be useful,
**When** I extend the Story 1.2 CI workflow,
**Then** the GitHub Actions build step exports `SENTRY_RELEASE=$(git rev-parse HEAD)` before `astro build` runs,
**And** the Sentry Astro integration's source-map upload feature is enabled and authenticated via `SENTRY_AUTH_TOKEN`,
**And** after `astro build` completes, the source maps for the production bundle are uploaded to Sentry under the matching release tag,
**And** the source maps are **not** served from the public site — Astro's default of stripping `.map` files from `dist/` is preserved (verified by `curl https://<preview-url>/_astro/<some-bundle>.js.map` returning 404).

**Given** release tagging links errors to deploys,
**When** I verify the release flow,
**Then** the GitHub Actions workflow's Sentry step calls `sentry-cli releases new $SENTRY_RELEASE` and `sentry-cli releases finalize $SENTRY_RELEASE` around the source-map upload,
**And** every Cloudflare Pages deploy results in a corresponding Sentry release visible in the Sentry dashboard,
**And** a synthetic test error is fired from the preview deploy (e.g., a `client:idle` island that throws on a `?sentry-test=1` query param) and the error appears in Sentry within 60 seconds,
**And** the error's "Suspect Commits" panel correctly identifies the `git rev-parse HEAD` commit as the source.

**Given** Sentry must not regress page weight (NFR5) or block render (NFR28-style requirement, even though NFR28 is about analytics),
**When** I measure the impact,
**Then** the Sentry browser SDK is loaded asynchronously and lazy-initialised so it does not block the LCP path,
**And** the Story 4.9 Lighthouse Performance score for `/` is unchanged (no regression > 1 point),
**And** the initial bundle weight for `/` remains under 500 KB transferred (NFR5),
**And** the Sentry browser SDK's tree-shaking is verified to exclude the React/Vue/Replay integrations which are unused on this Astro-mostly-static site.

**Given** error noise must be controlled or the dashboard becomes useless,
**When** I configure Sentry filters,
**Then** the Astro integration's `beforeSend` hook in `sentry.client.config.ts` filters out: known browser-extension errors (`Script error.`, `Non-Error promise rejection captured`), errors originating from URLs not on the Truvis domain (third-party script errors), and any error with a message matching a denylist regex committed to `sentry.client.config.ts`,
**And** the filter list is documented in `docs/integrations/sentry.md` with the rationale per entry,
**And** Sentry alert rules (configured in the Sentry dashboard, not in code) are set to email Cristian when: a new issue type appears, an issue affects > 10 users in 1 hour, or the daily error count exceeds 100 — these thresholds are documented and revisited in Story 7.6.

### Story 7.5: Document integration boundary degradation matrix and verify each fallback works

As Cristian (the operator),
I want a single document listing every third-party integration the site depends on, what happens when each one fails, and a verified test that the documented fallback actually triggers,
So that every external dependency has a known-good degradation contract instead of producing a cryptic 500 page or a silently lost user action under failure.

**Acceptance Criteria:**

**Given** NFR34 (email capture degrades gracefully — Epic 3), NFR35 (post-launch stats widget degrades gracefully — Epic 8), NFR36 (blog content API cached fallback — Epic 4) all require graceful degradation, and Epic 7 owns the cross-cutting verification,
**When** I create `docs/runbooks/integration-degradation.md`,
**Then** the doc lists every external integration touched by the site: **Loops** (email submission + drip), **Plausible** (analytics), **Sentry** (error capture), **Cloudflare Pages** (hosting + functions), **Cloudflare Turnstile** (anti-spam, Epic 3), **Cloudflare KV / Worker** (post-launch stats — V1.1, but degradation pattern documented at V1), **GitHub** (Keystatic OAuth + content storage), **Truvis backend** (post-launch stats source — V1.1),
**And** for each integration the doc records: the failure modes (timeout, 5xx, rate limit, auth failure, total outage), what the user sees in each mode, whether the failure is logged to Sentry (yes/no), whether it pages Cristian (Story 7.6), and the link to the source-of-truth runbook for that integration (e.g., `docs/integrations/loops.md`).

**Given** Epic 3 already implemented Loops degradation (NFR34),
**When** I cross-reference the Epic 3 work,
**Then** the matrix entry for Loops links to the Epic 3 story that built the branded error message + retry path,
**And** I verify the Epic 3 fallback still works by running a manual test against the preview environment with `LOOPS_API_KEY` temporarily invalidated (set to a deliberately wrong value in the Cloudflare Pages preview env), submitting the waitlist form, and confirming: the user sees the branded error message (not a generic 500), the submission is not silently dropped (NFR17), the error is captured in Sentry, and `trackEvent('waitlist_signup', ...)` is **not** fired (Story 6.6),
**And** the env var is restored immediately after the test and the test is recorded with timestamp in `docs/runbooks/integration-degradation.md`.

**Given** Epic 4 already implemented blog API cache fallback (NFR36),
**When** I cross-reference the Epic 4 work,
**Then** the matrix entry for the blog API cache links to the Epic 4 story that built the cached fallback,
**And** the verification is recorded.

**Given** the post-launch stats widget (Epic 8) does not exist yet at V1 but its degradation contract must be in the matrix (NFR35),
**When** I document the V1.1 placeholder behaviour,
**Then** the matrix includes a "post-launch stats widget" entry stating: at V1 a stub layout slot exists; at V1.1 the Cloudflare Worker + KV path ships per AR28; the documented degradation is "stale-but-served" using the last successful KV value, and if KV is empty the slot renders a tasteful "—" placeholder rather than an error,
**And** the entry explicitly references Epic 8 Story 8.x (the slot story) so V1.1 has a known starting point.

**Given** Cloudflare Turnstile (Epic 3 anti-spam) is a dependency that can fail open or closed,
**When** I document the Turnstile fallback,
**Then** the matrix entry records the fail-open vs fail-closed decision Epic 3 made (likely fail-closed for security with a "please retry" message),
**And** the fail mode is verified by temporarily breaking the `TURNSTILE_SECRET_KEY` in the preview env and confirming the form rejects submissions with a clear message — and that Sentry captures the failure,
**And** the env var is restored.

**Given** GitHub OAuth + Keystatic admin is itself a degradable surface,
**When** I document the Keystatic fallback,
**Then** the matrix entry records: if GitHub OAuth fails Cristian cannot edit content via Keystatic, but the public landing page is unaffected because content is committed in the repo and rendered at build time — the degradation scope is "admin-only, public site OK",
**And** the entry notes the manual git workflow Cristian can fall back to ("`git checkout -b content/<slug>` + edit Markdown + `git push` + open PR via GitHub UI") and points to a one-page `docs/runbooks/keystatic-down.md` for that fallback.

**Given** the matrix is only useful if it is read on launch day,
**When** I cross-link from Epic 8,
**Then** Epic 8 Story 8.x's launch checklist explicitly includes "Re-verify the Story 7.5 degradation matrix is current and every integration's last-verified date is within 30 days",
**And** the matrix gains a "Last verified" date column populated by this story.

### Story 7.6: Wire automated alerting for build failures, email delivery issues and integration availability

As Cristian (the operator),
I want a single notification channel that pages me when something the visitor cannot tolerate breaks — failed deploys, Loops delivery degradation, Sentry error spikes, cookie banner accidentally shipping a tracking cookie — without flooding me with low-signal noise,
So that I learn about real outages from a real alert, not from a future visitor mentioning the site is broken.

**Acceptance Criteria:**

**Given** NFR37 requires automated alerting for build failures, email delivery issues, and API availability degradation, and AR19 establishes Sentry as the error channel,
**When** I set up the alert routing,
**Then** all alerts route to a single notification channel — `alerts@<domain>` (or Cristian's personal email if `alerts@` is not configured at story-completion time, with a TODO to switch later) — and the address is documented in `docs/runbooks/alerting.md`,
**And** the doc records the rationale for a single channel: "At V1 with one operator, paging multiple channels creates ack ambiguity. Multi-channel routing is a V1.x concern when a second operator joins.".

**Given** Cloudflare Pages can fail to build,
**When** I configure build-failure alerts,
**Then** Cloudflare Pages dashboard notifications are enabled for failed deploys to `production` and `preview` (the dashboard supports email notifications natively),
**And** GitHub Actions workflow failures (Story 1.2 CI) email Cristian via GitHub's built-in `notifications` settings,
**And** both alert paths are verified by deliberately introducing a build error in a throwaway PR, confirming both notifications fire, and reverting the error,
**And** the verification is recorded in `docs/runbooks/alerting.md`.

**Given** Loops delivery issues are not visible from the site itself,
**When** I configure Loops monitoring,
**Then** the Loops dashboard's built-in delivery monitoring is enabled with email alerts configured to `alerts@<domain>` (or the fallback address),
**And** the alert thresholds are documented: any individual delivery failure to a confirmed email should not page (it's expected), but a delivery failure rate > 5% over a 1-hour window pages immediately,
**And** the Loops alert configuration is screenshotted and committed to `docs/integrations/loops.md`,
**And** if Loops's free tier does not support custom alert thresholds at story-completion time, the doc records the limitation and adds a manual weekly Loops dashboard check to `docs/launch-checklist.md` as a temporary workaround.

**Given** Sentry alert rules were configured in Story 7.4 (new issue, > 10 users / 1 hour, > 100 errors / day),
**When** I verify the Sentry alerts route correctly,
**Then** the Sentry project's notification settings are configured to email `alerts@<domain>` for the three rules,
**And** a synthetic high-frequency error burst is fired from a throwaway preview deploy (a script that throws 11 errors in quick succession from 11 different fake user IDs) and the > 10 users / 1 hour alert email arrives within 5 minutes,
**And** the synthetic errors are immediately resolved and the test is recorded with a timestamp in `docs/runbooks/alerting.md`.

**Given** API availability degradation matters for the blog content API (Epic 4) and the post-launch stats endpoint (Epic 8),
**When** I configure availability monitoring,
**Then** Cloudflare's built-in health checks are configured against `https://<production-domain>/api/v1/blog/index.json` (Epic 4) with a 1-minute polling interval and an alert threshold of "3 consecutive failures",
**And** the alert routes to the same `alerts@<domain>` address,
**And** the post-launch stats endpoint is added to the same monitoring config as a TODO at V1 (the endpoint does not exist yet) with the AR28 V1.1 follow-up linked,
**And** a synthetic outage is created by temporarily disabling the `/api/v1/blog/index.json` route via a feature flag, the alert fires, and the route is restored.

**Given** cookie-consent regression would be a compliance bug,
**When** I add a cookie regression check,
**Then** a Vitest contract test (`tests/cookie-regression.test.ts`) loads `dist/index.html` after `astro build`, parses any `Set-Cookie`-equivalent meta or script content, and asserts that **no** cookie-setting code is present anywhere in the static output when `COOKIE_CONSENT_REQUIRED=false`,
**And** the test runs in the Story 1.2 CI Vitest job and fails the PR if any future change accidentally introduces a cookie-setting library,
**And** the test is documented in `docs/runbooks/alerting.md` as the "compliance regression alarm" that catches cookie issues at PR time, not at audit time.

**Given** alert noise must be tracked and tuned,
**When** I document the noise-management discipline,
**Then** `docs/runbooks/alerting.md` includes a "Tuning log" section where Cristian records every alert that fired in the first 30 days post-launch with a disposition: "real issue", "false positive — threshold raised", or "noise — rule removed",
**And** the doc commits to a 30-days-post-launch tuning review as a follow-up task in Epic 8's launch checklist.

### Story 7.7: Final GDPR + double-opt-in compliance close-out audit

As Cristian (the operator),
I want a single, dated audit document that walks every GDPR-relevant surface and confirms the site is launch-ready from a compliance perspective,
So that flipping `LAUNCH_PHASE=post` in Epic 8 is not blocked by an unanswered compliance question and FR48 is verifiably satisfied.

**Acceptance Criteria:**

**Given** FR48 requires double opt-in for email capture (GDPR) and Epic 3 implemented the double opt-in flow,
**When** I audit the Epic 3 implementation,
**Then** I perform a manual end-to-end double-opt-in test on the preview environment: submit an email through the waitlist form, confirm the confirmation email arrives within 60 seconds with a working confirmation link, click the link, confirm enrolment in the drip series via the Loops dashboard, and confirm the drip emails contain a working unsubscribe link (FR16),
**And** the test is repeated for an email that has already been confirmed previously to verify the duplicate-handling path (FR13),
**And** the test is recorded in `docs/legal/gdpr-audit.md` under "FR48 verification" with timestamps and the test email addresses.

**Given** FR49 (right to erasure) was rehearsed in Story 7.3,
**When** I confirm the Story 7.3 rehearsal log is current,
**Then** the audit doc references the Story 7.3 erasure rehearsal log and confirms the rehearsal was performed within the last 30 days,
**And** if the rehearsal is older, it is re-rehearsed and re-logged before the audit closes.

**Given** every GDPR Article 13 disclosure requirement must be explicitly verified,
**When** I walk the Story 7.2 privacy policy against Article 13,
**Then** the audit doc includes a checklist of every Article 13(1) and 13(2) item with a "Where in the policy" pointer and a pass/fail mark,
**And** any "fail" item is fixed in the privacy policy in the same story (not deferred),
**And** the checklist is committed to `docs/legal/gdpr-article-13-checklist.md` and referenced from the audit doc.

**Given** data residency must be EU-compliant,
**When** I verify the residency claims of every third-party,
**Then** the audit doc records the EU-residency status of: Loops (verify with Loops support or DPA), Plausible (EU verified in Story 6.5), Sentry (EU verified in Story 7.4), Cloudflare (EU data residency for the customer account verified in the Cloudflare dashboard), and GitHub (US — explicitly noted as a non-PII surface because the public repo contains only the site code and Markdown content, no visitor PII),
**And** any third-party that is **not** EU-resident has a legal basis recorded (e.g., GitHub: SCCs / DPF — "no PII transfer because the repo holds no visitor data").

**Given** the cookie banner is wired-but-inactive at V1 (AR15),
**When** I verify the AR15 posture,
**Then** the audit doc explicitly records: "Plausible is cookieless and the site sets zero cookies at V1. The `vanilla-cookieconsent` library is wired but `COOKIE_CONSENT_REQUIRED=false`. No consent banner is legally required at V1 because no non-essential cookies exist. Re-evaluate the moment any cookie-setting code is added.",
**And** the Story 7.6 cookie regression test is referenced as the automated guardrail for this claim.

**Given** the audit must be reproducible and dated,
**When** I close the audit,
**Then** `docs/legal/gdpr-audit.md` ends with: the audit date, the auditor name (Cristian), a summary verdict ("Launch-ready / Launch-ready with caveats / Not launch-ready"), and a list of any caveats with their dispositions,
**And** the doc commits to a re-audit on each major release (V1.1, V1.2, etc.) as a recurring task in `docs/launch-checklist.md`,
**And** Epic 8's launch checklist explicitly references this audit as a "go / no-go gate" — flipping `LAUNCH_PHASE=post` is blocked if the audit verdict is "Not launch-ready" or has unresolved blocking caveats.

## Epic 8: Launch Readiness — Post-Launch Variants & Launch Checklist

Every section's post-launch variant (app store buttons, real testimonial slot, app store ratings, live stats widget V1 stub) is built, QA'd, and ready behind `LAUNCH_PHASE=post`. SPF / DKIM / DMARC are configured and warmed, DNS is cut over to Cloudflare, the launch checklist (AR22) is executed end-to-end, and a phase-transition rehearsal verifies FR54's zero-downtime + zero-analytics-gap claim against the preview environment **before** Cristian flips the production env var. The full Cloudflare Worker + KV stats implementation is intentionally deferred to V1.1 — V1 ships the layout slot, the cached-fallback contract, and a tasteful stub.

### Story 8.1: Build post-launch Hero and Footer CTA variants with App Store + Google Play buttons

As a post-launch visitor,
I want the hero and footer CTAs to surface real iOS App Store and Google Play download buttons instead of the pre-launch waitlist form,
So that I can install Truvis in two clicks from the moment Cristian flips `LAUNCH_PHASE=post`.

**Acceptance Criteria:**

**Given** FR8 requires explicit iOS App Store and Google Play download buttons (post-launch) and Story 6.6 already shipped a `<AppStoreLink store="ios" | "android">` component (currently unmounted) with `trackEvent('app_store_click', { store })` wired,
**When** I build the post-launch hero CTA variant,
**Then** `src/components/sections/hero-cta-post-launch.astro` is created as a Tier-2 composite under the AR23 hierarchy,
**And** the component renders two `<AppStoreLink>` buttons side-by-side on desktop (≥768px) and stacked on mobile, each with the official Apple "Download on the App Store" and Google "Get it on Google Play" badge SVGs committed under `src/assets/badges/`,
**And** the badges are served as inline SVG (not raster) so they remain crisp at any density and contribute zero additional image-bytes to the LCP path,
**And** each button reads its `href` from `siteContent.appStoreUrls.ios` and `siteContent.appStoreUrls.android` via `getSiteContent()` (Story 5.1 / 5.4),
**And** if either URL is empty at build time the matching button is omitted entirely (no broken link, no empty badge) — and a build-time warning is logged so Cristian sees the omission in the Cloudflare Pages deploy log.

**Given** the Story 2.1 `HeroSection` exposes a named `<slot name="cta">` (the CTA placeholder slot),
**When** I wire the post-launch variant into the hero,
**Then** Story 5.3's `isPostLaunch()` switch in the hero composition selects between the Epic 3 `EmailCaptureBlock` (pre-launch slot fill) and `hero-cta-post-launch.astro` (post-launch slot fill),
**And** the slot fill happens at build time, not at runtime — there is no flash-of-pre-launch-content at the visitor,
**And** the same `data-testid="hero-cta-slot"` attribute (Story 2.1) is preserved so existing tests can target the slot in either phase.

**Given** Story 1.4's Footer renders columns including a CTA placeholder area in Epic 2 Story 2.9,
**When** I wire the post-launch footer CTA variant,
**Then** the Footer's CTA area uses the same `isPostLaunch()` switch and renders either the Epic 3 footer waitlist form or the same `hero-cta-post-launch.astro` content (sized for the footer context) in the post-launch case,
**And** the Footer's `siteContent.ctaLabels.postLaunchPrimary` field is read but ignored when the actual rendered CTA is the App Store + Google Play badge pair (the label is reserved for textual fallback contexts and the post-launch hero / footer use badges, not text buttons) — this exception is documented inline in `docs/design-conventions.md` so a future maintainer reading the Story 5.4 schema does not assume the label is always rendered.

**Given** Cristian must populate the real App Store and Google Play URLs before the phase flip,
**When** I document the content prerequisite,
**Then** `docs/launch-checklist.md` gains an "Epic 8.1 prerequisite" item: "Populate `siteContent.appStoreUrls.ios` and `appStoreUrls.android` in Keystatic with the live App Store Connect URL and the Google Play Console URL. Both URLs must resolve to publicly-listed apps before the phase flip — verify by visiting each URL in an incognito window.",
**And** the checklist entry includes the App Store Connect URL pattern (`https://apps.apple.com/us/app/<app-name>/id<numeric-id>`) and the Google Play Console URL pattern (`https://play.google.com/store/apps/details?id=<bundle-id>`) so Cristian knows exactly what to paste.

**Given** Story 6.6 already wired the `app_store_click` event,
**When** I verify the analytics integration,
**Then** clicking either badge fires `trackEvent('app_store_click', { store: 'ios' | 'android' })` exactly once,
**And** the navigation to the store URL happens after the same 150 ms timeout pattern used for `blog_cta_click` in Story 6.6 so the event is not lost to navigation,
**And** the click is verified end-to-end against the preview environment with `LAUNCH_PHASE=post` and the event is confirmed to arrive in the Plausible dashboard.

**Given** the post-launch variant must not regress page weight (NFR5) or accessibility (NFR19),
**When** I run Lighthouse against `/` with `LAUNCH_PHASE=post` set in the preview environment,
**Then** the Performance score remains ≥ 90 (NFR6),
**And** the Accessibility score remains ≥ 90 (NFR25) — both badge SVGs include the official alt text ("Download on the App Store", "Get it on Google Play") and the badge link targets meet the 44×44px touch target rule (UX-DR26),
**And** the SEO score remains ≥ 95 (NFR39) — the swap from form to badges does not change the structured data or canonical URL,
**And** the post-launch result is recorded in `docs/seo/lighthouse-audit.md` alongside the pre-launch result so the comparison is auditable.

### Story 8.2: Build post-launch `AppStoreRatings` component sourcing rating + review excerpts from a static cache

As a post-launch visitor on the social-proof section of the landing page,
I want to see Truvis's current App Store and Google Play star rating and a few representative review excerpts,
So that I have third-party social proof before installing the app — not just Truvis's own marketing claims (FR9).

**Acceptance Criteria:**

**Given** FR9 requires app store ratings and review excerpts post-launch and there is no V1 budget for a live App Store / Play Store API integration,
**When** I design the data source,
**Then** the ratings + review excerpts are stored in a new `appStoreRatings` Content Collection (extending the Story 5.1 pattern) — type `'data'`, single-entry — with a Zod schema enforcing: `lastUpdated` (ISO date), `ios: { rating: number ≥0 ≤5; reviewCount: number ≥0; excerpts: { author: string; rating: number; text: string }[] }`, `android: { rating; reviewCount; excerpts }`,
**And** the collection is mirrored in the Story 5.2 Keystatic config as a singleton form so Cristian can paste in fresh ratings + excerpts manually after each app-store update,
**And** the schema's `lastUpdated` field is required and a Zod refinement throws at build time if `lastUpdated` is more than 60 days in the past (the staleness budget — 60 days is documented in the schema with a code comment).

**Given** the data source is static (manually refreshed) at V1 with the option to automate later,
**When** I document the manual-refresh workflow,
**Then** `docs/integrations/app-store-ratings.md` is created with: the manual refresh procedure (visit App Store Connect → copy current rating + count → visit Play Console → same → paste into Keystatic → publish), the recommended refresh cadence ("monthly during stable post-launch operation, weekly in the first 30 days post-launch"), and a follow-up V1.x task to automate via the Apple App Store Connect API + Google Play Developer API,
**And** the doc explicitly notes the schema's 60-day staleness throw so a future maintainer understands why the build fails if the refresh is forgotten — this is intentional, not a bug.

**Given** AR23's three-tier component hierarchy applies,
**When** I build the component,
**Then** `src/components/sections/app-store-ratings.astro` is created as a Tier-2 composite,
**And** the component reads via a new `getAppStoreRatings()` helper added to `lib/content.ts` (Story 5.1 boundary rule applies),
**And** the rendered markup shows two side-by-side cards (iOS and Android) on desktop, stacked on mobile, each displaying: the platform logo (small inline SVG), the star rating (visual stars + numeric value), the review count, and 1–3 excerpt cards with the reviewer attribution and quote,
**And** the visual treatment matches the Story 2.6 `TrustQuoteCard` pattern from Epic 2 (warm bg, primary text, teal-slate accent) so the post-launch surface feels native to the existing social-proof section,
**And** the component meets WCAG 2.1 AA contrast (NFR20) and uses semantic markup (`<article>` for each excerpt, `aria-label` for the rating).

**Given** the component is post-launch-only,
**When** I wire it into the page,
**Then** `SocialProofSection` (Story 2.6) — already gated by `isPostLaunch()` from Story 5.3 — uses the post-launch branch to render `app-store-ratings.astro` alongside (or replacing) the Story 5.4 `getTestimonials('post')` testimonial cards, and the layout is verified at common breakpoints,
**And** if `appStoreRatings` collection is empty at build time the component renders nothing (graceful absence, no broken card),
**And** the post-launch CI matrix run from Story 5.3 builds with `LAUNCH_PHASE=post` and confirms the section renders without errors when the collection is populated with seed data.

**Given** the component must not regress page weight or LCP,
**When** I measure the impact,
**Then** the component contributes < 5 KB additional gzipped HTML/CSS to the post-launch home page,
**And** the platform logos and any embedded star icons are inline SVG (no additional image requests),
**And** running Lighthouse against `/` with `LAUNCH_PHASE=post` shows Performance ≥ 90 and the LCP element is unchanged (the LCP is still the hero, not the ratings card).

**Given** post-launch ratings are content-managed and the audit trail matters for trust,
**When** I document the trust posture,
**Then** the Story 7.2 privacy policy gains a one-sentence note: "App Store and Google Play ratings displayed on this site are sourced from publicly-visible reviews and refreshed manually. The reviewers' identities are as published on the respective stores; no data is processed by Truvis.",
**And** the Story 5.2 Keystatic admin form for the `appStoreRatings` singleton includes a callout reminding Cristian: "Only paste reviews that are publicly visible on the App Store / Play Store at the time of refresh.".

### Story 8.3: Build `LiveStatsWidget` V1 layout slot with stale-but-served fallback contract (Cloudflare Worker + KV deferred to V1.1)

As Cristian (the operator) and as a post-launch visitor,
I want a layout slot for the live inspection statistics widget (inspections completed, money saved, bad deals avoided) that is wired into the page in V1, ships a tasteful "—" placeholder until V1.1 lands the Cloudflare Worker + KV pipeline, and follows the AR28 stale-but-served degradation contract from day one,
So that V1.1 can drop in the real data fetch without rearchitecting the page and post-launch visitors see a deliberate, branded placeholder rather than a missing section (FR10).

**Acceptance Criteria:**

**Given** FR10 requires live inspection statistics post-launch (inspections completed, money saved, bad deals avoided) and AR28 defers the full Cloudflare Worker + KV implementation to V1.1,
**When** I design the V1 slot,
**Then** `src/components/sections/live-stats-widget.astro` is created as a Tier-2 composite that renders three numeric cards (inspections, money saved, bad deals avoided) using the same `StatCard` primitive from Story 2.3 / 2.6 so the visual language is consistent with the existing social-proof stats,
**And** each card shows the metric label, a numeric placeholder, and a "Last updated: <timestamp>" footnote in muted text,
**And** the V1 default values are the literal placeholder string `"—"` for each metric and a static `lastUpdated` of the most recent deploy time (read from `git rev-parse HEAD`'s commit date or `process.env.DEPLOY_TIMESTAMP`),
**And** a prominent code comment in the file lists the V1.1 work needed to wire real data: "Replace `getLiveStats()` stub in `lib/content.ts` with a Cloudflare Pages Function that reads from KV. See `docs/integrations/live-stats.md`.".

**Given** the data-fetching contract must be defined at V1 even though the implementation is deferred,
**When** I define the contract,
**Then** `lib/content.ts` (Story 5.1) gains an async helper `getLiveStats(): Promise<LiveStatsView>` whose return type is `{ inspections: number | null; moneySaved: number | null; badDealsAvoided: number | null; lastUpdated: string; source: 'kv' | 'fallback' | 'stub' }`,
**And** the V1 implementation returns `{ inspections: null, moneySaved: null, badDealsAvoided: null, lastUpdated: <deploy timestamp>, source: 'stub' }`,
**And** the `LiveStatsView` type is committed to `src/lib/types/content.ts` with a JSDoc block explaining each field — including the `null → render "—"` rule and the `source` field's three values,
**And** the component renders `null` values as `"—"` and shows a subtle visual indicator when `source !== 'kv'` (e.g., a small "preview" pill) so a future post-launch deploy that accidentally drops to fallback mode is visually distinguishable from the real thing.

**Given** AR28 + NFR35 require stale-but-served fallback when KV is unreachable,
**When** I document the V1.1 fallback contract,
**Then** `docs/integrations/live-stats.md` is created describing the V1.1 architecture: a Cloudflare Worker on a 1-hour cron fetches from the Truvis backend, normalises the response to `LiveStatsView`, and writes to Cloudflare KV under a known key; a Cloudflare Pages Function reads from KV at request time with `cache-control: max-age=600` (10-minute edge cache) and returns the cached value or the last-known-good value if KV is empty (`source: 'fallback'`),
**And** the doc enumerates the four V1.1 failure modes — Worker fails to run, Worker runs but Truvis backend errors, KV key missing, KV read fails — and the expected behaviour for each (always: serve last-known-good or `'stub'`, never throw to the visitor),
**And** the doc references Story 7.5's degradation matrix entry for "post-launch stats widget" and confirms the V1 stub honours the same contract.

**Given** NFR9 requires the post-launch statistics widget to load in <500 ms and NFR32 requires 24-hour cache freshness,
**When** I measure the V1 stub performance,
**Then** the stub adds zero additional network requests (data is inlined at build time),
**And** Lighthouse against `/` with `LAUNCH_PHASE=post` shows TBT and TTI unchanged from the pre-launch baseline,
**And** the V1.1 follow-up task in `docs/integrations/live-stats.md` records the NFR9 budget (<500 ms response time at the Pages Function edge, measured under realistic network conditions) and the NFR32 budget (KV write cron at 1-hour interval gives ≤1-hour data freshness — well within the 24-hour requirement).

**Given** the slot is post-launch-only,
**When** I wire it into the page composition,
**Then** the V1 landing page renders `LiveStatsWidget` only when `isPostLaunch()` returns `true`, gated via Story 5.3,
**And** the widget is positioned in the page composition between `SocialProofSection` and the FAQ section (or wherever the UX spec places it — confirmed against `ux-design-specification-truvis-landing-page.md` if a position is specified, otherwise documented as a deliberate Epic 8 choice),
**And** the post-launch CI matrix build (Story 5.3) confirms the widget renders in `LAUNCH_PHASE=post` builds with the stub data and no errors.

**Given** the V1.1 dependency must be tracked,
**When** I file the follow-up,
**Then** `docs/launch-checklist.md` records "V1.1 dependency: Live stats Worker + KV pipeline" with a pointer to `docs/integrations/live-stats.md`,
**And** Story 7.5's degradation matrix is updated to mark the post-launch stats widget entry as "V1: stub shipped, V1.1: real implementation pending" with the same pointer,
**And** the V1 stub explicitly does **not** ship with a fake "47,000 inspections" placeholder number — only `"—"`. Showing fake numbers post-launch would violate the Truvis brand-honesty principle and is forbidden by an inline code comment.

### Story 8.4: Configure email-domain SPF, DKIM and DMARC and complete domain warm-up

As Cristian (the operator),
I want every email Truvis sends from the production domain (double opt-in confirmation, drip series) to pass SPF, DKIM and DMARC checks at every major mailbox provider, and the domain to be warmed up with small-batch sends before the first real launch volume,
So that confirmation emails reach inboxes — not spam folders — on launch day and the FR48 / FR12-15 conversion path actually works at scale.

**Acceptance Criteria:**

**Given** AR20 mandates SPF, DKIM and DMARC DNS records before Loops is allowed to deliver email,
**When** I configure DNS records at the domain registrar / DNS provider,
**Then** an SPF TXT record is added at the apex of the email-sending domain (or subdomain if Loops uses one) authorising Loops's documented sending IPs / `include:` mechanism per Loops's setup docs,
**And** at least one DKIM CNAME (or TXT) record is added per Loops's per-domain DKIM setup instructions, with the selector value Loops provides,
**And** a DMARC TXT record is added at `_dmarc.<domain>` starting at `p=quarantine; rua=mailto:dmarc-reports@<domain>; pct=100` (not the more lenient `p=none` — quarantine from day one because the domain has zero legacy traffic to protect),
**And** all three records are verified via `dig TXT <domain>` and `dig CNAME <selector>._domainkey.<domain>` and the verification output is committed to `docs/integrations/email-dns.md`.

**Given** the records must be validated by an external mail-tester before Loops sends real volume,
**When** I run a deliverability check,
**Then** I send a test email through Loops to a [mail-tester.com](https://mail-tester.com) address,
**And** the resulting score is ≥ 9/10 with SPF, DKIM and DMARC all reporting "pass",
**And** the score report URL and timestamp are recorded in `docs/integrations/email-dns.md`,
**And** if the score is < 9/10 the failing items are remediated (typically: missing reverse DNS, missing List-Unsubscribe header in Loops's template, missing physical address in the email body) before the story closes.

**Given** AR20 also mandates domain warm-up,
**When** I execute the warm-up,
**Then** I send the first small batch (10 confirmation emails) to a personal pool of test addresses across Gmail, Outlook, ProtonMail, iCloud Mail, and Yahoo,
**And** I confirm each test email lands in the **inbox**, not spam, on each provider — the per-provider results are recorded in `docs/integrations/email-dns.md`,
**And** any provider that places the email in spam is investigated (typically: missing rDNS, sender reputation, content trigger words) before launch,
**And** a second batch (50 emails to the same pool plus a wider opt-in tester pool) is sent 48 hours after the first batch and the inbox-placement results are recorded.

**Given** DMARC reports will start arriving once the record is live,
**When** I configure DMARC reporting,
**Then** the `dmarc-reports@<domain>` mailbox referenced in the DMARC `rua=` is configured (either as a real mailbox or routed to a free DMARC report aggregator service like dmarcian's free tier),
**And** the doc records the chosen aggregator and the procedure for reading reports weekly during the first 30 days post-launch,
**And** Story 7.6's alerting tuning log gains a recurring "weekly DMARC report check" item.

**Given** Story 7.7's GDPR audit covers email compliance,
**When** I cross-check the audit,
**Then** every confirmation and drip email contains a working unsubscribe link (FR16), a physical address (CAN-SPAM + most EU jurisdictions require this), and a clear sender identity ("Truvis <hello@<domain>>"),
**And** the audit doc's "FR48 verification" section is updated to confirm the warm-up was completed and inbox placement is verified at the five named providers,
**And** any provider where placement remains uncertain is flagged in the launch checklist (Story 8.7) as "monitor on day 1".

**Given** DNS record changes can take hours to propagate,
**When** I time the work in the launch sequence,
**Then** Story 8.4 is completed at least 48 hours before Story 8.5 (DNS cutover) and at least 7 days before the planned launch — documented in the launch checklist as a hard ordering constraint,
**And** the SPF / DKIM / DMARC records are added to the **production** DNS zone, not just the preview, because email sends from the real production sender domain at launch.

### Story 8.5: Cut production DNS over to Cloudflare and verify zero-downtime serving

As Cristian (the operator),
I want the production domain pointed at Cloudflare Pages with TLS, HSTS and the Story 1.2 CI gates active on production traffic,
So that the site Cristian and visitors hit at the real domain is the same Cloudflare Pages deploy already verified on preview, with no DNS-induced downtime window.

**Acceptance Criteria:**

**Given** AR21 mandates production DNS moved onto Cloudflare (or pointed via CNAME) for Cloudflare Pages to serve the production domain,
**When** I plan the cutover,
**Then** the cutover plan is documented in `docs/runbooks/dns-cutover.md` listing: the current authoritative DNS provider, the proposed target (Cloudflare DNS as registrar OR a CNAME from the current provider to `<project>.pages.dev`), the chosen approach with rationale, the rollback procedure (point the apex / CNAME back), and the announcement plan (no announcement at V1 because there is no existing audience to announce to — the cutover is silent),
**And** the cutover plan is reviewed against Story 8.4's email DNS records to ensure SPF / DKIM / DMARC are not lost during the move (they live in the same zone if Cloudflare DNS is adopted as the registrar; they must be re-added in Cloudflare DNS if so),
**And** the chosen approach is the lowest-risk option that satisfies AR21 — typically a CNAME from the current provider, which preserves all existing TXT / MX records without re-creation.

**Given** the cutover must minimise downtime,
**When** I execute the cutover,
**Then** the TTL on the existing DNS records is reduced to 300 seconds **24 hours** before the cutover so caches drain quickly,
**And** the cutover itself is performed during a low-traffic window (which at V1 is "any time" since there is no existing traffic),
**And** Cloudflare Pages is configured with the production custom domain and Cloudflare auto-provisions a TLS certificate before the DNS records are pointed at it,
**And** the old DNS records are updated to the new target only after the Cloudflare custom-domain is in "Active" state with a valid certificate.

**Given** the visitor-facing surface must be verified post-cutover,
**When** I validate the live production domain,
**Then** I run the following checks within 15 minutes of the DNS change and record results in `docs/runbooks/dns-cutover.md`:
  - `dig <domain>` resolves to a Cloudflare IP,
  - `curl -I https://<domain>/` returns `200 OK` and `cf-ray` header is present,
  - `curl -I https://<domain>/` returns `strict-transport-security` header (HSTS) with a `max-age` ≥ 31536000 (1 year),
  - `https://<domain>/sitemap-index.xml` returns the Story 6.3 sitemap,
  - `https://<domain>/robots.txt` returns the Story 6.3-extended robots.txt with the sitemap reference,
  - `https://<domain>/keystatic` returns a redirect to the GitHub OAuth flow (Story 5.2),
  - `https://www.<domain>/` 301-redirects to `https://<domain>/` (or vice-versa per the chosen canonical host),
  - The Plausible dashboard records page views from the new domain within 5 minutes,
**And** any failed check blocks the story from closing.

**Given** Story 1.2 enforces TLS 1.2+ and HSTS,
**When** I verify TLS,
**Then** SSL Labs ([https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/)) reports a grade of A or A+ for the production domain,
**And** the SSL Labs report URL and timestamp are committed to `docs/runbooks/dns-cutover.md`,
**And** the HSTS header is verified to include `includeSubDomains` and `preload` if the apex strategy supports them (HSTS preload is opt-in via [hstspreload.org](https://hstspreload.org/) and is recommended but not required at V1 — the doc records whether preload was submitted and the date).

**Given** the cutover must not break Epic 4's blog API or Epic 6's analytics,
**When** I re-verify the dependent surfaces,
**Then** the Story 4.8 contract test for the blog API is run against the new production domain and passes,
**And** the Plausible dashboard's `data-domain` setting (Story 6.5) is verified to match the new production domain — if it does not, it is updated and the verification is re-run,
**And** the Story 6.6 verification fires `waitlist_signup`, `blog_cta_click` from the production domain and confirms each event arrives in the Plausible dashboard.

**Given** the rollback path must be documented and ready,
**When** I document rollback,
**Then** `docs/runbooks/dns-cutover.md` includes a "Rollback" section with the exact DNS changes to revert, the expected propagation time at the reduced TTL, and the criteria that trigger a rollback (e.g., "TLS certificate fails to provision within 30 minutes", "production domain returns 5xx for > 5 minutes", "Plausible records zero events for > 15 minutes after cutover"),
**And** the rollback procedure is rehearsed mentally before the cutover (no destructive rehearsal — DNS rehearsals are too risky at V1 with one operator).

### Story 8.6: Phase-transition rehearsal — verify FR54 zero-downtime + analytics continuity on preview

As Cristian (the operator),
I want a documented, dated rehearsal that flips `LAUNCH_PHASE=pre` → `LAUNCH_PHASE=post` on the preview environment, measures the downtime, verifies analytics continuity, and confirms every post-launch surface renders correctly,
So that the production phase flip on launch day is a known-known, not a hope-it-works moment — and FR54's "no downtime" claim is verifiably true (FR55).

**Acceptance Criteria:**

**Given** FR54 requires zero downtime during the pre/post-launch transition and FR55 requires no analytics gap, and Story 5.3 + Story 5.5 already verified the pipeline,
**When** I plan the rehearsal,
**Then** the rehearsal is performed against the Cloudflare Pages **preview** environment (never production) at least 7 days before the planned launch date,
**And** the rehearsal is performed twice — once in each direction (`pre → post` and `post → pre`) — to verify the transition is symmetric and the rollback path works,
**And** the rehearsal pre-conditions are met first: every Epic 8 story (8.1 hero/footer variants, 8.2 ratings, 8.3 stats stub) is merged to `main` and deployed to preview, every Epic 7 audit is closed, Story 8.4 email DNS is in place, Story 8.5 production DNS plan is documented (the actual cutover does not happen until Story 8.7).

**Given** the rehearsal must measure real downtime,
**When** I execute the flip,
**Then** I open a continuous monitoring loop in one terminal (`while true; do curl -o /dev/null -s -w '%{http_code} %{time_total}\n' https://<preview-url>/; sleep 1; done`) before flipping the env var,
**And** I flip `LAUNCH_PHASE` from `pre` to `post` in the Cloudflare Pages preview environment dashboard and trigger a redeploy,
**And** I record: the flip timestamp, the redeploy start time, the redeploy completion time, the first request that returns the post-launch HTML (visible in the curl loop because the response body changes), and the gap (if any) between any 200 response and any non-200 response during the flip,
**And** the recorded downtime must be **zero** non-200 responses — Cloudflare Pages atomic deploys swap the static assets at the edge without serving 5xx, so any non-200 is a regression that blocks the rehearsal from passing.

**Given** FR55 requires no analytics gap across the transition,
**When** I verify analytics continuity,
**Then** during the rehearsal I keep a tab open on the Plausible "Realtime" dashboard,
**And** I verify that page views from the preview environment continue to register before, during, and after the flip without a gap,
**And** I fire each of the AR14 events from the preview UI in the appropriate phase: `waitlist_signup` and `blog_cta_click` and `micro_survey_completed` in pre-launch mode, then `app_store_click` and `blog_cta_click` in post-launch mode (the micro-survey is pre-only),
**And** all events arrive in the Plausible dashboard with the correct event names and props within 60 seconds of firing,
**And** the rehearsal log records the per-event arrival timestamps.

**Given** the post-launch surfaces must render correctly,
**When** I walk the post-flip preview environment,
**Then** I verify the post-launch hero CTA (Story 8.1) shows real App Store + Google Play badges with working URLs from `siteContent.appStoreUrls`,
**And** the post-launch footer CTA (Story 8.1) shows the same badges,
**And** `SocialProofSection` shows the post-launch testimonials (Story 5.4) AND the `AppStoreRatings` cards (Story 8.2) with the seed data,
**And** `LiveStatsWidget` (Story 8.3) renders the three stat cards with `"—"` placeholders and the deploy-time `lastUpdated`,
**And** the FAQ, blog index, blog articles, privacy policy, 404 and 500 are unchanged from the pre-launch state,
**And** Lighthouse on `/` post-flip shows Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95 (NFR6, NFR25, NFR39).

**Given** the rollback rehearsal mirrors the forward rehearsal,
**When** I execute the reverse flip,
**Then** I flip `LAUNCH_PHASE` from `post` back to `pre` in the preview environment, redeploy, and re-run the same monitoring loop and surface walk,
**And** the reverse flip also produces zero downtime,
**And** the pre-launch hero CTA, social proof, and FAQ all render their pre-launch content,
**And** Plausible continues to record events without a gap.

**Given** this rehearsal is the launch-day playbook,
**When** I document the playbook,
**Then** `docs/runbooks/launch-day-phase-flip.md` is created from the rehearsal experience listing: the exact pre-flip checklist (every Story 8.x is shipped, every Epic 7 audit passes, Story 8.4 DNS is verified, Story 8.5 production DNS is cut over), the flip procedure (Cloudflare Pages dashboard → env vars → change → redeploy), the monitoring commands to run during the flip, the post-flip surface walk (every section to manually verify), the rollback trigger criteria, and the rollback procedure,
**And** any issue surfaced during the rehearsal is either fixed in this story (if a code/content issue) or documented as a known caveat with a workaround in the playbook (if a process issue),
**And** the rehearsal log (with all timestamps, screenshots, and any caveats) is committed to `docs/launch-checklist.md` under "Epic 8 phase-flip rehearsal".

### Story 8.7: Execute the launch checklist end-to-end and gate the production phase flip

As Cristian (the operator),
I want a single dated launch checklist document that walks every Epic 1–8 launch dependency in order, captures pass/fail per item, and explicitly gates the production `LAUNCH_PHASE=post` flip on a green sheet,
So that flipping the env var on launch day is a deliberate, verified action — not a hopeful click — and AR22 is satisfied with a real artifact.

**Acceptance Criteria:**

**Given** AR22 requires a documented launch checklist covering Lighthouse audit on production build, accessibility audit, cross-browser testing, GDPR compliance review, email deliverability validation, and DNS cutover,
**When** I consolidate the launch checklist,
**Then** `docs/launch-checklist.md` (which has been built up incrementally throughout Epics 3 / 5 / 6 / 7 / 8) is restructured into a single ordered execution sequence with these top-level sections, each with a pass/fail gate:
  - **0. Pre-flight content** — All `siteContent` fields populated for both pre and post phases (Story 5.4, 8.1); `appStoreRatings` seed data committed (Story 8.2); `appStoreUrls` populated and verified live (Story 8.1 prerequisite),
  - **1. Compliance gate** — Story 7.7 GDPR audit verdict is "Launch-ready" (no blocking caveats); Story 7.3 right-to-erasure rehearsal is < 30 days old; Story 7.2 privacy policy is current,
  - **2. Email gate** — Story 8.4 SPF/DKIM/DMARC verified at the five named providers; mail-tester score ≥ 9/10; warm-up batches placed in inbox; Story 7.7 email compliance items pass,
  - **3. SEO gate** — Story 6.7 Lighthouse SEO ≥ 95 on `/`, `/blog`, `/blog/<seed>/`; Story 6.1 / 6.2 structured data validated against Rich Results Test (< 30 days old); Story 6.3 sitemap regenerates on every build; Story 6.6 Plausible verification log < 30 days old,
  - **4. Performance + accessibility gate** — Story 1.2 CI Lighthouse budgets passing on the latest `main` build (Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95, LCP < 2.5 s, CLS < 0.1, initial weight < 500 KB); axe-core audit zero violations; Story 1.7 text-expansion harness (UX-DR31) passes,
  - **5. Cross-browser gate** — Manual smoke test on the latest stable Chrome, Safari (macOS), Firefox, and Edge against the preview environment with `LAUNCH_PHASE=pre` and again with `LAUNCH_PHASE=post`; mobile Safari + Chrome on a real iOS and Android device; results recorded with screenshots,
  - **6. Reliability gate** — Story 7.5 degradation matrix all "Last verified" dates < 30 days; Story 7.6 alert paths verified (synthetic build failure, synthetic Sentry error, Cloudflare health check); Story 7.4 Sentry release tagging working on the latest deploy,
  - **7. Phase-flip rehearsal** — Story 8.6 forward + reverse rehearsal complete with zero downtime and zero analytics gap; the launch-day playbook (`docs/runbooks/launch-day-phase-flip.md`) is current,
  - **8. DNS cutover** — Story 8.5 cutover complete; SSL Labs grade A/A+; HSTS active; Plausible recording from production domain; Story 8.4 email DNS preserved through cutover,
  - **9. Production phase flip (THE LAUNCH STEP)** — All gates 0–8 are green; Cristian flips `LAUNCH_PHASE` from `pre` to `post` in the production Cloudflare Pages env vars and redeploys; the Story 8.6 monitoring loop is run against the production URL during the flip; the post-flip surface walk is performed; Plausible Realtime is monitored for the first 30 minutes post-flip,
  - **10. Post-launch monitoring (first 24 hours)** — Sentry dashboard checked hourly for new issues; Plausible Realtime checked hourly for traffic; Loops dashboard checked twice for any delivery degradation; Cloudflare Pages dashboard checked for any 5xx spikes,
**And** every section explicitly gates the next: gate N must be green before gate N+1 begins.

**Given** any failed gate blocks the launch,
**When** I document the failure protocol,
**Then** the checklist includes a "Failure protocol" preamble: "If any gate fails, STOP. Do not proceed to the next gate. Investigate the failure, fix the root cause, re-run the gate, and only proceed when the gate is green. Launch is not a deadline; it is a state.",
**And** the protocol explicitly forbids skipping a gate "just for now" or marking a gate green based on hope rather than verification,
**And** if a fix requires a code change, the change is merged via a normal PR with the Story 1.2 CI gates passing — no `--no-verify` shortcuts, no force-pushes (per the project's git safety rules in `CLAUDE.md`).

**Given** the launch checklist must be auditable after the fact,
**When** I execute the checklist,
**Then** every gate is recorded with: the timestamp it was checked, the operator (Cristian), the result (pass/fail), and a link to the verification artifact (Lighthouse report, mail-tester URL, screenshot, log file),
**And** the executed checklist is committed to git as a snapshot under `docs/launch-history/launch-<YYYY-MM-DD>.md` so the launch artifact is preserved separately from the reusable template at `docs/launch-checklist.md`,
**And** the snapshot is the single source of truth for "did we actually do X before launch" — not memory.

**Given** the production phase flip is the irreversible step,
**When** I execute gate 9,
**Then** Cristian re-reads gates 0–8 one final time and confirms every item is green within the last 7 days (no stale verifications),
**And** the flip is performed at a low-traffic window (which at V1 means any time, but the launch playbook suggests a Tuesday or Wednesday morning UTC for psychological reasons — Mondays carry weekly-deploy risk and Fridays carry weekend-incident risk),
**And** the rollback path is `LAUNCH_PHASE=pre` redeploy — verified to work in Story 8.6's reverse rehearsal — and the rollback trigger criteria from the launch-day playbook are reviewed before the flip.

**Given** the launch is the end of Epic 8 and the start of post-launch operations,
**When** I close the launch-day execution,
**Then** the post-launch monitoring (gate 10) is executed for 24 hours,
**And** any issue surfaced in the first 24 hours is triaged using Story 7.5's degradation matrix and Story 7.6's alerting runbook,
**And** the launch snapshot (`docs/launch-history/launch-<YYYY-MM-DD>.md`) is updated with the 24-hour monitoring summary and any issues + dispositions,
**And** the Story 7.6 30-day alerting tuning review is scheduled for 30 days post-launch as a recurring task in `docs/launch-checklist.md`.

**Given** the FR / NFR / AR claims of every prior epic must be verifiably satisfied at launch,
**When** I add the final coverage check,
**Then** the launch snapshot includes a one-page coverage table mapping every FR1–FR56, NFR1–NFR40, AR1–AR28, and UX-DR1–UX-DR32 to the implementing story and the verification artifact,
**And** any unsatisfied requirement is either resolved before the flip or is explicitly documented as a "deferred to V1.x" item with its own follow-up task,
**And** the table is the final go/no-go artifact: if every row is green, the launch proceeds; if any row is red without a documented deferral, the launch is blocked.
