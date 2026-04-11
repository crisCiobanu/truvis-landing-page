---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
startedAt: '2026-04-10'
completedAt: '2026-04-10'
inputDocuments:
  - _bmad-output/planning-artifacts/prd-truvis-landing-page.md
  - _bmad-output/planning-artifacts/prd-truvis-landing-page-validation-report.md
  - _bmad-output/planning-artifacts/product-brief-truvis-landing-page.md
  - _bmad-output/planning-artifacts/product-brief-truvis-landing-page-distillate.md
  - _bmad-output/planning-artifacts/ux-design-specification-truvis-landing-page.md
  - _bmad-output/planning-artifacts/ux-design-hybrid.html
  - _bmad-output/planning-artifacts/ux-design-directions.html
  - _bmad-output/planning-artifacts/branding-truvis.md
  - _bmad-output/planning-artifacts/architecture.md  # Mobile app architecture — reference only
workflowType: 'architecture'
project_name: 'truvis-landing-page'
user_name: 'Cristian'
date: '2026-04-10'
---

# Architecture Decision Document — Truvis Landing Page

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

<!-- Architectural decisions will be appended below as we progress through the workflow. -->

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
56 functional requirements across 11 capability domains. The architectural weight concentrates in five areas:

1. **Landing Page Conversion Surface (FR1–FR11)** — hero, problem, 6-feature showcase, social proof, FAQ, CTAs, footer. Content-heavy, read-only, SSG-friendly. The architectural question is composition and content sourcing, not runtime complexity. Post-launch additions (app store buttons FR8, ratings FR9, live stats FR10) must coexist with pre-launch content in a single build.

2. **Email Capture & Nurture (FR12–FR17)** — single-field email form, double opt-in (GDPR), drip series enrollment, unsubscribe, confirmation page + micro-survey. No user accounts, no in-app inbox. This entire domain is a client-side integration with a third-party ESP. The only architectural decision is which ESP and how to fail gracefully if its API is unreachable (NFR34).

3. **Blog & Dual-Consumer Content API (FR18–FR27)** — blog list, article pages with SEO metadata, cross-linking, sharing, structured data, **plus a content API consumed by both the web landing page and the Truvis mobile app home screen carousel** (FR23–FR26). The blog is the single cross-system integration point in the architecture and the most consequential contract to get right. API changes must be additive-only (NFR31). Content must remain available to the mobile app even when the CMS is temporarily unreachable (NFR36).

4. **Content Management (FR28–FR34)** — CMS-driven publish flow for articles, FAQ, testimonials, stats, and the pre/post-launch toggle. Every content change triggers automated rebuild & deploy (FR34, NFR30). No code deploys for content operations. This domain defines the boundary between "code" and "content" and determines who can change what without engineering.

5. **Pre/Post-Launch Transition (FR53–FR55)** — a single configuration flag toggles the entire page between waitlist mode (email capture, market stats) and download mode (app store buttons, testimonials, live stats). Zero-downtime, zero SEO disruption, continuous analytics with event replacement rather than tracking gap. Both variants are built and deployed from day one; the toggle is a content/config action, not a release.

Supporting domains:
- **Analytics & Tracking (FR35–FR39)** — page views, conversion events, UTM attribution, micro-survey aggregation. Must respect cookie consent (NFR29) and load async without blocking render (NFR28).
- **SEO & Discoverability (FR40–FR44)** — sitemap, structured data (Organization, WebSite, BlogPosting, FAQ), canonical URLs, robots.txt, image SEO. Built into the SSG output.
- **Compliance & Privacy (FR45–FR49)** — cookie consent banner, privacy policy, double opt-in, right to erasure. GDPR-driven, non-negotiable.
- **Internationalization (FR50–FR52)** — URL-based locale routing, browser language detection with English default, fully externalized strings. V1 ships English only but the architecture must support FR/DE in V1.2 without rework.
- **Error Handling (FR56)** — branded 404 with navigation back to landing page and blog.

**Non-Functional Requirements:**
40 NFRs with several that directly constrain architectural choices:

- **Performance budget is a design constraint (NFR1–NFR9):** LCP <2.5s on 4G, FID <100ms, CLS <0.1, TTFB <200ms, total initial page weight <500KB transferred (excluding lazy-loaded images), Lighthouse Performance >90, full page load <2s on 3G, blog content API <300ms, post-launch stats widget <500ms. These targets dictate SSG + CDN, modern image formats (WebP/AVIF), font subsetting with `font-display: swap`, no heavy hero media, no runtime CSS-in-JS, and strict third-party script discipline.
- **Accessibility at WCAG 2.1 AA (NFR19–NFR26):** keyboard navigable, ARIA where semantic HTML is insufficient, focus indicators, labeled inputs, Lighthouse Accessibility >90, and layouts tolerating 40% text expansion for future FR/DE translations.
- **Security (NFR10–NFR15):** HTTPS/TLS 1.2+ enforced by hosting, no secrets in client code, cookie preferences client-side only until consent, API key / rate limiting on the blog content API, anti-spam on forms without user friction.
- **Scalability via managed services (NFR16–NFR18):** CDN-served static content with no origin dependency for page loads; email capture must queue/retry on ESP rate limits (no silent drops); blog API must handle 100 concurrent mobile-app requests at <300ms p95.
- **Integration constraints (NFR27–NFR32):** ESP must support double opt-in + drip automation + unsubscribe via API; analytics must load async and respect cookie consent; content publish → rebuild+deploy within 5 minutes; blog API changes must be additive-only to protect mobile app consumers; post-launch stats use cached backend data with 24h freshness (landing page never queries a live database).
- **Reliability (NFR33–NFR36):** ≥99.9% hosting uptime SLA; email form degrades gracefully (no silent drops) if ESP is unreachable; stats widget shows last-known-good data or placeholder if backend is unreachable; blog API returns cached responses if CMS is down so the mobile carousel never shows empty state.
- **Monitoring & Ops (NFR37–NFR38):** automated alerting on build failures, email delivery issues, and API availability; 2-minute rollback capability via hosting provider.
- **SEO score >95 (NFR39)** and **content quality NFR40** anchoring the organic-growth engine.

**Scale & Complexity:**

- Primary domain: **Static web application (SSG + headless CMS + managed SaaS integrations)**
- Complexity level: **Medium** — no safety-critical systems, no custom backend, no user accounts, but non-trivial across performance budget, GDPR compliance, dual-consumer blog API contract, pre/post-launch dual-build, i18n-ready architecture, and cross-platform brand/design consistency with the mobile app.
- Estimated architectural components: ~8–10 major subsystems — landing page SSG build, blog SSG build, headless CMS, blog content API (public + mobile-consumer), email capture integration (ESP), drip series (managed by ESP), analytics integration, cookie consent layer, pre/post-launch configuration/feature-flag system, post-launch stats widget integration.

### Technical Constraints & Dependencies

| Constraint | Source | Architectural Impact |
|---|---|---|
| Static site generation + CDN hosting | PRD web-app requirements, NFR1–NFR9 performance budget | No SSR or server-side compute on page load; framework choice constrained to SSG-capable options |
| Blog API must serve both web and Truvis mobile app | PRD FR23–FR26, NFR31 | Single content source, versioned/additive-only schema; CMS choice must expose a stable typed API |
| Performance budget <500KB initial + LCP <2.5s | PRD NFR1–NFR9 | No heavy hero media, no runtime CSS-in-JS, no render-blocking scripts; forces image format, font-loading, and animation discipline |
| GDPR + ePrivacy compliance required at launch | PRD FR45–FR49, NFR10–NFR15 | Cookie consent gate before any non-essential script; double opt-in; EU data residency for stored personal data; privacy policy |
| Pre/post-launch content toggle without code deploy | PRD FR53–FR55, NFR30 | Both variants built together; single config flag (CMS-driven or env var); CMS-triggered rebuild pipeline |
| i18n-ready URL architecture at V1 (EN only) | PRD FR50–FR52, NFR26 | URL-based locale routing and externalized strings must exist in V1; layouts must tolerate 40% text expansion |
| Solo developer with AI assistance, no design or ops team | Product brief, PRD scoping | Architecture must minimize custom code and infrastructure; managed SaaS for email, analytics, CMS, hosting; preference for open-source starter templates over hand-rolled scaffolding |
| Content operations must not require code changes | PRD FR28–FR34 | CMS owns articles, FAQ, testimonials, stats, pre/post toggle; code owns page structure; automated rebuild on CMS publish |
| Design DNA shared with existing Expo mobile app | UX spec, mobile app architecture | Tailwind + shadcn/ui selected to mirror mobile's NativeWind + @rn-primitives; shared color/spacing/severity tokens; unified brand voice across platforms |
| Shared visual identity already committed in UX spec | UX design hybrid direction | Warm white base #FFFDF9, Plus Jakarta Sans + Inter, sticky-phone inspection story, dark immersive section, fluid clamp() typography — these are fixed inputs to implementation |
| Scroll-as-inspection-story is the central interaction | UX spec core UX | Needs Intersection Observer based scene switching with sticky positioning on ≥tablet, stacked scenes on mobile, reduced-motion fallback — drives component strategy |

### Cross-Cutting Concerns Identified

1. **Performance budget as a design constraint.** Every decision — framework, image pipeline, font loading, animation, analytics script, CMS rendering path — must be evaluated against LCP <2.5s, <500KB initial, Lighthouse Perf >90, <2s on 3G. This is not a post-hoc optimization concern; it shapes technology selection from the first decision onward.

2. **Content/code separation and rebuild pipeline.** All content (articles, FAQ, testimonials, stats, pre/post flag) lives in a headless CMS. Code owns page structure and components. CMS publish → webhook → SSG rebuild → CDN deploy within 5 minutes, with sitemap regeneration. This loop must be reliable, observable (alerting on build failures), and reversible (2-minute rollback).

3. **Blog content API as a cross-platform contract.** The blog API is consumed by the landing page at build time AND by the Truvis mobile app at runtime (home screen carousel). Schema changes must be additive-only, the API must return cached data if CMS is unreachable, and rate-limiting protects against abuse. This is the single integration point where a breaking change on the landing page can silently break the mobile app — it needs explicit contract discipline.

4. **Pre/post-launch dual-build.** Both phases must be designed, built, and QA'd together. The toggle is a single configuration value (likely CMS field or build env var) that swaps CTAs, hero subheadline, stat source, social proof, and footer content — without touching URLs, page titles, meta descriptions, or analytics plumbing. Analytics conversion events swap from `waitlist_signup` to `app_store_click` without a tracking gap.

5. **GDPR / ePrivacy consent as a render-path gate.** No non-essential cookies or tracking scripts load before user consent. Consent state is client-side (localStorage) until the user opts in. Analytics must be consent-aware. The double opt-in flow for email capture is an ESP integration concern but must surface in the UX without leaking delivery detail. Privacy policy and right-to-erasure flows are documented but not necessarily automated at V1.

6. **Accessibility at WCAG 2.1 AA across all content surfaces.** Semantic HTML, focus management, keyboard navigation, 4.5:1 contrast, ARIA for the accordion FAQ and mobile nav drawer, `aria-live` on the sticky phone scene changes, reduced-motion respect, layouts stable at 200% zoom and 40% text expansion. Must carry through to the blog layout, not just the landing page.

7. **i18n readiness at V1.** URL-based locale routing (`/en/`, `/fr/`, `/de/`), browser language detection with English default, fully externalized strings in a translation-friendly format. V1 ships English only — but adding FR/DE in V1.2 must be content + translation work, not a rearchitecture. Layouts must be tested with 40% text expansion during V1.

8. **Brand voice consistency across web and mobile.** The 70/30 Inspector/Ally voice that appears in app copy must also appear in landing page copy, blog articles, drip emails, and confirmation pages. This is a content discipline concern but creates an architectural implication: the CMS schema (or content conventions) should make voice drift hard by providing prompts, examples, or structured fields.

9. **Graceful degradation at every third-party integration boundary.** ESP unreachable → branded error + retry, no silent drops. CMS unreachable → blog API returns cached content, mobile carousel never empty. Post-launch stats backend unreachable → last-known-good data or placeholder, not an error. Analytics blocked → page still fully functional. Each of these is a specific NFR (NFR34, NFR35, NFR36), and each dictates a specific fallback mechanism.

10. **Email deliverability as a pre-launch concern.** New domain starts with no sender reputation. SPF, DKIM, DMARC must be configured before first send. Domain warm-up required. This is a process concern, not a code concern — but it must be part of the launch checklist and is surfaced here to ensure it isn't overlooked.


## Starter Template Evaluation

### Primary Technology Domain

Static web application (SSG + headless content layer + managed SaaS integrations) — confirmed from the Project Context Analysis. Performance budget (NFR1–NFR9), i18n-readiness (FR50–FR52), accessibility (NFR19–NFR26), and dual-consumer blog API (FR23–FR26) are the constraints driving framework selection.

### Framework Family Decision: Astro (over Next.js)

Astro is selected over Next.js as the framework family because:

- **Performance by default.** Astro's island architecture ships zero JavaScript by default and only hydrates the components that need interactivity. This directly serves NFR1 (LCP <2.5s), NFR5 (<500KB initial weight), NFR6 (Lighthouse Perf >90), and NFR7 (<2s on 3G) without active discipline. Next.js can hit these targets but only with deliberate pruning of its hydration-everything defaults.
- **Built-in i18n routing.** Astro 4.0+ ships with native i18n routing — locale configuration in `astro.config.mjs`, `/[locale]/` folder convention, and `getRelativeLocaleUrl()` / `getAbsoluteLocaleUrl()` helpers. This maps directly to FR50–FR52 (`/en/`, `/fr/`, `/de/` URL routing) with no extra dependency. Next.js's App Router i18n is workable but heavier (custom middleware + `[locale]` segments).
- **Content Collections for the blog.** Astro Content Collections give type-safe Markdown/MDX content with Zod schemas — exactly the shape we need to satisfy FR22 (crawlable static HTML with structured data) and to feed FR23–FR26 (blog content API consumed by both web and the Truvis mobile app). The CMS decision (file-based collections vs headless CMS like Sanity/Storyblok/Hygraph) is decoupled from this starter decision and will be made in Step 4.
- **shadcn/ui official Astro support.** The shadcn/ui CLI now has first-class Astro install support, so the UX spec's Tailwind + shadcn/ui commitment is honored without forcing Next.js. React islands hydrate the small set of interactive components (cookie consent, mobile nav drawer, FAQ accordion, sticky-phone scene switcher) and nothing else.
- **Solo-developer ergonomics.** No RSC, no server actions, no App Router / Pages Router split. One mental model. Lower risk of misconfiguring a feature into runtime cost.

### Open-Source Starter Options Considered

| Starter | Framework | Blog | shadcn/ui | i18n | SEO | License | Verdict |
|---|---|---|---|---|---|---|---|
| **`one-ie/astro-shadcn`** ("ONE") | Astro 5 + React 19 + Tailwind v4 + shadcn/ui | Advanced (search, tags, categories, ToC, RSS) | ✅ 50+ components preconfigured | ❌ (add via Astro built-in i18n routing) | sitemap, RSS, OG, canonical, 100/100 Lighthouse claimed | MIT (verify on init) | **SELECTED** |
| `onwidget/astrowind` | Astro 5 + Tailwind | ✅ blog included | ❌ (add via shadcn CLI) | ⚠️ config exists but undocumented | ✅ excellent | MIT | Strong fallback if ONE has issues |
| `surjithctly/astroship` | Astro + Tailwind | ✅ blog | ❌ | ❌ | ✅ 99/100 PageSpeed | MIT | Leaner alternative; less to prune, more to add |
| `AREA44/astro-shadcn-ui-template` | Astro + Tailwind + shadcn/ui | ❌ minimal | ✅ | ❌ | basic | MIT | Too bare — would require building blog and SEO from scratch |
| `Scorpio3310/astro-i18n-starter` | Astro 4+ i18n routing | ❌ | ❌ | ✅ comprehensive | basic | MIT | Reference only — useful pattern source for i18n setup |
| Luminescent (Shadcnblocks) | Astro + shadcn/ui + Tailwind 4 | ✅ | ✅ | ❌ | ✅ | **$79 paid** | Excluded — open source only |
| Ink (Shadcn Studio) | Astro + Next.js editions, Tailwind 4 | ✅ blog-focused | ✅ | ❌ | ✅ | "Free" but ambiguous license | Excluded — license unverified |
| `nobruf/shadcn-landing-page`, `anibalalpizar/nextjs-shadcn-landing`, `kpedrok/the-boring-page`, Waitly | Next.js + shadcn/ui | partial | ✅ | ❌ | basic | MIT | Excluded — Next.js loses to Astro on the perf budget for this project |

### Selected Starter: `one-ie/astro-shadcn` ("ONE - Astro 5 Shadcn UI Starter Template")

**Rationale for Selection:**

`one-ie/astro-shadcn` is the closest single-starter match to our constraints. It pre-integrates the four highest-cost-to-build pieces of the project — Astro 5, Tailwind v4, shadcn/ui (50+ components), and an advanced blog system with search/tags/categories/ToC/RSS — along with SEO fundamentals (sitemap, RSS feed, OG tags, canonical URLs) and a WCAG 2.1 AA accessibility baseline. It claims 100/100 Lighthouse scores, which is consistent with our NFR1–NFR9 and NFR39 targets.

What we get for free:

- Astro 5 + Tailwind v4 + TypeScript + React island setup
- shadcn/ui component library preconfigured with theme switching
- Blog system with search, tags, categories, table of contents, RSS
- SEO baseline: sitemap, OG/Twitter card meta, canonical URLs
- Accessibility baseline (WCAG 2.1 AA) — keyboard nav, focus management
- Light/dark theme switching (optional for V1; useful infrastructure)

What we still need to add (and will design in Step 4 / 5 / 6):

- **Astro built-in i18n routing** (`/en/`, `/fr/`, `/de/`) configured in `astro.config.mjs` with externalized strings for FR50–FR52
- **Email waitlist capture** wired to the chosen ESP (decision deferred to Step 4)
- **Cookie consent banner** + analytics gating for FR45–FR46 and NFR29
- **Headless CMS integration** OR formalized Astro Content Collections workflow for FR28–FR34 (decision deferred to Step 4)
- **Blog content API endpoint** for the Truvis mobile app carousel (FR23–FR26) — small Astro API route reading from the same Content Collections / CMS source
- **Pre/post-launch content toggle** mechanism (FR53–FR55) — single config flag pattern, decision deferred to Step 4
- **Sticky-phone inspection-story scroll** as a React island with Intersection Observer (custom component per UX spec)
- **JSON-LD structured data** for Organization, WebSite, BlogPosting, FAQ (FR41) — likely Astro components emitting `<script type="application/ld+json">`

**Initialization Command:**

```bash
# Clone the starter (verify license + maintenance status before relying on it)
git clone https://github.com/one-ie/astro-shadcn truvis-landing-page
cd truvis-landing-page
rm -rf .git && git init
npm install
npm run dev
```

**Pre-init verification checklist** (run before committing to this starter):

1. Confirm `LICENSE` file is MIT/Apache/BSD-permissive
2. Confirm `package.json` last commit + repo activity is within ~6 months
3. Audit `package.json` for unwanted heavy deps (AI SDKs, analytics with bundled scripts) — prune on day 1
4. Run `npm run build && npx lighthouse <local-url>` to confirm baseline performance scores match the README claims before adding any custom code

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- TypeScript (strict)
- Astro 5.x (latest at install time)
- React 19 for interactive islands only
- Node.js for build-time only — no runtime server

**Styling Solution:**

- Tailwind CSS v4 (modern CSS-based config, HSL color tokens)
- shadcn/ui components with Radix UI primitives for accessibility
- Theme switching via CSS custom properties + `data-theme` attribute

**Build Tooling:**

- Astro's built-in Vite-powered build pipeline
- Static output (`output: 'static'`) targeting CDN deployment
- Image optimization via Astro Assets (`<Image>` component, WebP/AVIF)
- Asset hashing, CSS purging, and JS code splitting handled by default

**Code Organization:**

- `src/pages/` — file-based routing (Astro convention)
- `src/components/` — Astro + React components
- `src/components/ui/` — shadcn/ui primitives (copied in, owned by us)
- `src/content/` — Astro Content Collections (blog posts, type-safe via Zod schemas)
- `src/layouts/` — page layouts and wrappers
- `src/lib/` — shared utilities

**Development Experience:**

- Hot reloading via Astro dev server
- TypeScript type checking
- Tailwind v4 JIT compilation
- shadcn/ui CLI for adding new components on demand

**Fallback Plan:**

If `one-ie/astro-shadcn` fails the verification checklist (stale, license issue, hidden dependencies, performance regression), the fallback is **`onwidget/astrowind`** — the most-starred Astro theme three years running, MIT-licensed, with a battle-tested blog and SEO setup. We would then add shadcn/ui via the official Astro install path (`npx shadcn@latest init`) and configure Astro built-in i18n routing manually. This is more work than ONE but lower risk on maintenance.

**Note:** Project initialization (clone, verify, prune, first commit) should be the first implementation story.


## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (block implementation):**
- Content source (Astro Content Collections + Keystatic)
- Blog content API contract for the mobile app (static JSON at `/api/v1/blog/*`)
- Email service provider (Loops)
- Hosting (Cloudflare Pages)
- Analytics (Plausible Cloud EU)
- Pre/post-launch toggle mechanism (`LAUNCH_PHASE` env var)
- i18n implementation (Astro built-in routing + JSON message files)

**Important Decisions (shape architecture significantly):**
- State management for islands (`nanostores`)
- Cookie consent (`vanilla-cookieconsent` v3, conditional on having any non-essential cookies)
- Form handling pattern (native form → Astro API route → Loops API)
- Error tracking (Sentry EU)
- CI/CD (GitHub Actions for checks + Cloudflare Pages auto-deploy)

**Deferred Decisions (post-MVP, acknowledged here for future):**
- Stats widget (post-launch only, FR10): Cloudflare Worker + cached JSON
- Real testimonials with photos (V1.1 only): collection schema designed in V1, content added post-launch
- Multi-language content (V1.2 only): infrastructure ready in V1, FR/DE content added later
- Referral mechanics, retargeting, A/B testing (Phase 2)
- Self-hosting Plausible (only if traffic volume justifies)

### Data Architecture

**1a. Content Source — Astro Content Collections + Keystatic admin UI**
- **Decision:** All content lives in `src/content/*` as Markdown / MDX / YAML / JSON files, schema-enforced via Astro Content Collections (Zod schemas). Keystatic provides a non-developer admin UI (`/keystatic` route, dev-only or gated in production via env var) for authoring without touching VS Code.
- **Rationale:** Solo developer with Cristian as the only content author at MVP. File-based content gives us version control, free hosting (no CMS bill), git-based review, and zero runtime CMS dependency — which automatically satisfies NFR36 (blog API never empty if CMS is down, because there IS no runtime CMS). Keystatic gives a polished admin UI for editing markdown + structured fields when sitting in front of a browser feels nicer than a text editor. Headless CMS (Sanity, Storyblok, Contentful) would add cost, runtime dependency, and complexity that doesn't pay back at solo-dev scale.
- **Affects:** Content workflow, FR28–FR34 (CMS-driven content management), blog API generation, rebuild trigger.
- **Alternative considered:** Sanity (free tier generous, EU dataset, excellent Astro SDK) — kept as fallback if Keystatic fails to meet authoring needs. Decap CMS (older alternative to Keystatic) — rejected, less actively maintained.

**1b. Content Collections Schema**
- **Decision:** Five collections defined in `src/content/config.ts`:
  - `blog` — articles. Fields: `title`, `slug`, `excerpt`, `featuredImage`, `category`, `publishedAt`, `updatedAt`, `author`, `tags[]`, `readingTime`, `featured` (boolean), `body` (markdown).
  - `faq` — questions. Fields: `question`, `answer` (markdown), `category`, `order`.
  - `testimonials` — user stories. Fields: `quote`, `author`, `context` (e.g., "first-time buyer in Lisbon"), `photo` (optional), `rating` (optional), `phase` (`pre` | `post`).
  - `stats` — market stats / live metrics. Fields: `value`, `label`, `source`, `category` (`product` | `financial` | `trust`), `phase` (`pre` | `post`).
  - `siteContent` — singletons for hero, problem, features, footer copy. Each entry has `phase`-conditional variants where applicable.
- **Schema enforcement:** All Zod schemas live in `src/content/config.ts`. Keystatic config in `keystatic.config.ts` mirrors these schemas — both files must stay in sync, enforced via type checks at build time.
- **Rationale:** Five collections cover every content surface in the PRD (FR1–FR6, FR18–FR27, FR31–FR33). Schemas prevent missing fields, broken images, or malformed metadata reaching production.
- **Affects:** Content authoring, all page templates, blog API output, CMS UI structure.

**1c. Pre/Post-Launch Content Toggle**
- **Decision:** Single environment variable `LAUNCH_PHASE` with values `pre` or `post`, set in Cloudflare Pages dashboard per environment. Read at build time via `import.meta.env.LAUNCH_PHASE`. Components conditionally render content variants based on the phase. Both variants are designed and built from day one.
- **Toggle operation:** Change env var in CF Pages dashboard → trigger rebuild (~2 minutes) → new build deploys with the new phase. No code change, no manual content swap.
- **Where it's read:** A single helper `lib/launch-phase.ts` exports `LAUNCH_PHASE` and `isPostLaunch()`. All conditional rendering goes through this helper — no scattered `import.meta.env` calls in components.
- **Rationale:** Simplest possible implementation. One source of truth. Atomic switch. Both variants always exist in the codebase, so QA happens before launch day, not on launch day.
- **Affects:** Hero CTA, hero subheadline, social proof section, footer CTA, stat cards, testimonial cards, analytics conversion event names. FR53–FR55 satisfied.

**1d. Blog Content API Contract (for mobile app consumption)**
- **Decision:** Static JSON endpoints generated at build time, served from the CDN as immutable assets:
  - `GET /api/v1/blog/posts.json` — full list, supports query-string filtering at the consumer layer (mobile app filters client-side from the cached payload)
  - `GET /api/v1/blog/posts/[slug].json` — individual article detail
  - `GET /api/v1/blog/categories.json` — category list
- **Schema (versioned at `/v1/`, additive-only per NFR31):**
  ```json
  {
    "slug": "string",
    "title": "string",
    "excerpt": "string",
    "featuredImage": { "src": "string", "alt": "string", "width": 1200, "height": 630 },
    "category": "string",
    "publishedAt": "ISO-8601 string",
    "updatedAt": "ISO-8601 string",
    "readingTime": 5,
    "featured": false,
    "webUrl": "string"
  }
  ```
- **Caching:** CDN edge caches with `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`. ETag headers from CF for client-side cache validation. Mobile app caches locally and refreshes opportunistically.
- **Rate limiting:** Cloudflare WAF rate limit at the edge (e.g., 100 req/min per IP) for NFR14. No API key required for read access.
- **Implementation:** Astro static API endpoints (`src/pages/api/v1/blog/posts.json.ts`, etc.) iterate the `blog` Content Collection and emit JSON during the build. Zero runtime cost. NFR18 (100 concurrent requests, <300ms p95) satisfied automatically by CDN. NFR36 (graceful when CMS down) is automatic — there is no runtime CMS to fail.
- **Versioning policy:** Schema changes are additive only. Field renames or removals require a new `/v2/` endpoint with `/v1/` kept alive for at least one mobile app release cycle. Documented in a `CONTRACT.md` checked into the repo.
- **Affects:** Mobile app home screen carousel (epics 11–12), build pipeline, blog content schema. FR23–FR26, NFR18, NFR31, NFR36.

### Authentication & Security

**2a. No User Authentication**
- **Decision:** The landing page has zero user accounts. No login, no signup beyond email-only waitlist capture, no session management. The waitlist email is stored only in Loops (the ESP), not in any database we own.
- **Rationale:** PRD explicitly excludes user accounts. Eliminates an entire category of complexity, security surface, and GDPR data-handling overhead.
- **Affects:** Architecture surface area, GDPR scope (limited to ESP-stored emails only).

**2b. Secrets Management — Cloudflare Pages Environment Variables**
- **Decision:** All secrets (Loops API key, Sentry DSN, Keystatic Cloud token if used, future Truvis backend stats API key) live in Cloudflare Pages environment variables, scoped per environment (production, preview). Local `.env` file (gitignored) for dev. No secrets in the client bundle — server-only secrets are accessed only from Astro API routes which run on Cloudflare Workers at request time (not at static build time).
- **Important:** Loops API key must NEVER be exposed to the client. The waitlist form posts to a server-side Astro API route (`POST /api/waitlist`) which proxies to Loops with the secret key.
- **Rationale:** Standard CF Pages pattern, no infrastructure to set up, per-environment scoping, free.
- **Affects:** Local dev onboarding, deploy pipeline, all integrations.

**2c. Anti-Spam on Waitlist Form**
- **Decision:** Two-layer:
  - **Layer 1 — Honeypot field** in the form HTML, hidden via CSS, invisible to humans. Any submission with that field populated is rejected silently at the Astro API route before hitting Loops.
  - **Layer 2 — Cloudflare Turnstile** (CF's free, privacy-friendly CAPTCHA alternative) embedded invisibly in the form. Validates on the server side at the API route. No friction for legitimate users.
- **Rationale:** NFR15 ("protected against automated spam submissions without user-facing friction"). Turnstile is free, CF-native (since we're hosting on CF Pages), GDPR-friendly, and invisible to humans. Honeypot is the cheap layer-1 belt.
- **Affects:** Waitlist form component, Astro API route, NFR15.

**2d. Blog Content API — Public, Rate-Limited at Edge**
- **Decision:** No API key required for read access to `/api/v1/blog/*`. Rate limiting via Cloudflare WAF rules (e.g., 100 req/min per IP). The content is public anyway — anyone can scrape the blog HTML.
- **Rationale:** Adding API key auth for public content is security theater and would force the mobile app to ship and rotate a secret. The mobile-app-readable JSON is the same content as the human-readable HTML pages. Edge rate limiting handles abuse (NFR14, NFR18).
- **Affects:** Mobile app integration (no key management on the client), CF WAF config.

**2e. HTTPS / TLS**
- **Decision:** Delegated to Cloudflare. TLS 1.3 by default, automatic certificate provisioning, HSTS enabled, automatic HTTPS upgrade.
- **Rationale:** NFR10 satisfied by hosting choice with zero config.
- **Affects:** None — automatic.

### API & Communication Patterns

**3a. Email Service Provider — Loops**
- **Decision:** **Loops** for waitlist capture, double opt-in, drip series automation, unsubscribe handling, and email delivery.
- **Rationale:**
  - Purpose-built for product-led waitlists and drip campaigns (vs. Resend which is transactional-first and would force us to build drip logic ourselves)
  - Drip automation is a first-class UX in Loops (visual flow editor) — Cristian can author and tune the series without code
  - GDPR-compliant, supports double opt-in, EU data option
  - Charges per contact with unlimited sends (vs. Resend's per-email pricing) — better fit for a waitlist that grows then fires once at launch
  - Simple, well-documented HTTP API
- **Integration shape:** Server-side Astro API route `POST /api/waitlist` accepts `{ email, microSurveyAnswer? }`, calls Loops API to add the contact, triggers double opt-in flow, returns success/error. The micro-survey answer is sent as a custom field on the contact for drip segmentation.
- **Drip series content** is authored entirely inside Loops, not in our codebase. We send the contact + segment metadata; Loops handles delivery, scheduling, opens, clicks, unsubscribes.
- **Affects:** FR12–FR16 (email capture, validation, double opt-in, drip series, unsubscribe), NFR27 (ESP integration), NFR34 (graceful degradation if ESP unreachable).
- **Alternatives considered:** Resend (rejected — transactional-focused, no drip automation), ConvertKit (rejected — creator-economy framing, heavier UX, more expensive), Mailchimp (rejected — heavy, dated DX), Buttondown (rejected — newsletter-focused).

**3b. Form Handling Pattern — Native HTML + Server API Route**
- **Decision:** All forms (waitlist, micro-survey, future contact) use native HTML `<form>` with progressive enhancement via a small React island for inline validation, loading states, and error toasts. Form submits to a server-side Astro API route under `src/pages/api/`.
- **No form libraries** (React Hook Form, Formik, etc.) — overkill for one-field forms.
- **Validation:** Client-side basic email format check on blur and submit (HTML5 + a single regex). Server-side validation in the API route as the source of truth.
- **Error handling per NFR34:** API failures keep the input populated, show a toast, and allow retry. Network errors detected and surfaced as "Available when online" without losing input.
- **Rationale:** Astro's strength is shipping minimal JS. Native forms work without JS (graceful degradation), enhanced with a small island for UX polish.
- **Affects:** Waitlist form component, micro-survey, all future forms.

**3c. Blog Content API — Static JSON at Build Time** (see decision 1d above for full contract)

**3d. Post-Launch Inspection Stats Widget API**
- **Decision (deferred to V1.1):** A Cloudflare Worker (separate from Pages) runs on a cron schedule (e.g., every 6 hours) to fetch live metrics from the Truvis backend (Supabase Edge Function), normalize the response, and write it to a Cloudflare KV cache. The landing page renders the widget via a tiny client-side fetch to a CF Pages function that reads from KV and returns cached JSON with 24h TTL.
- **Cache freshness:** 24h per NFR32. KV serves last-known-good if the upstream fetch fails (NFR35).
- **Rationale:** Decouples the landing page from the live database (NFR32), provides cheap edge-cached delivery, fails gracefully.
- **Affects:** FR10 (live stats post-launch), NFR9, NFR32, NFR35. **Built only when we approach launch.**

**3e. Error Handling Standards**
- **Decision:** Three-layer pragmatic approach (no centralized error bus):
  - **Layer 1 — Form / API errors:** Inline validation errors near the field. Network/API failures show a toast component (shadcn/ui `Toast` or `Sonner`). Input is never cleared on error.
  - **Layer 2 — Page rendering errors:** Astro's built-in error boundaries plus a custom branded 404 (`src/pages/404.astro`) and 500 page. FR56 satisfied.
  - **Layer 3 — Crash-level / unexpected:** Sentry catches client-side errors and build errors. Source maps uploaded on build. Sentry EU region for GDPR.
- **Rationale:** This is a marketing site with one form and a stats fetch. There is no need for a centralized error bus, retry queue, or exception hierarchy.
- **Affects:** All form components, Sentry integration, custom error pages.

### Frontend Architecture

**4a. Project Structure — Feature-Lite, Astro-Native**
- **Decision:** Astro's conventional structure, no over-engineering:
  ```
  src/
    pages/                    # Astro file-based routes (incl. api/)
      index.astro             # Landing page (delegates to sections)
      [...slug].astro         # Blog post template
      blog/                   # Blog index + category routes
      api/
        waitlist.ts           # Waitlist POST handler (server-side)
        v1/
          blog/
            posts.json.ts     # Static blog API endpoints
    components/
      ui/                     # shadcn/ui primitives (from starter)
      sections/               # Landing page sections (Hero, Problem, InspectionStory, ...)
      blog/                   # Blog-specific components
      forms/                  # WaitlistForm, MicroSurvey
      islands/                # React islands (StickyPhone, CookieConsent, MobileNav)
    content/                  # Astro Content Collections (blog/, faq/, testimonials/, stats/, siteContent/)
      config.ts               # Zod schemas
    layouts/                  # BaseLayout, BlogLayout
    lib/                      # Shared utilities
      launch-phase.ts         # isPostLaunch(), LAUNCH_PHASE
      i18n.ts                 # t() helper, locale detection
      analytics.ts            # trackEvent() wrapper
      loops.ts                # Loops API client (server-side only)
      structured-data.ts      # JSON-LD generators
    i18n/
      en/
        common.json
        landing.json
        blog.json
        faq.json
      fr/                     # Stub, populated in V1.2
      de/                     # Stub, populated in V1.2
    styles/
      global.css
  keystatic.config.ts         # Keystatic admin UI config
  astro.config.mjs            # Astro config (i18n, integrations, build options)
  ```
- **Rationale:** Mirrors the mobile app's three-tier intent (primitives → composites → screens) but using Astro's idiomatic structure. Sections for landing-page composition. Islands clearly isolated. Lib for shared utilities. No premature feature-module splitting — this is one page plus a blog.
- **Affects:** All implementation, code organization, import paths.

**4b. Component Tier Convention (mirrors mobile app)**
- **Decision:** Three tiers, mapped to folders:
  - **Tier 1 (Primitives):** `src/components/ui/` — shadcn/ui components, copied in, owned. No business logic. Customized with Truvis brand tokens.
  - **Tier 2 (Composites):** `src/components/sections/`, `src/components/forms/`, `src/components/blog/` — feature-specific compositions of Tier 1 primitives. Receive structured content from Astro Content Collections.
  - **Tier 3 (Screens / Layouts):** `src/pages/*.astro`, `src/layouts/*.astro` — thin shells composing Tier 2 components.
- **React islands** live in `src/components/islands/` — only the components that genuinely need client-side JS (sticky phone scroll, cookie consent, mobile nav drawer, FAQ accordion if shadcn version requires it).
- **Rationale:** Clear hierarchy, matches mobile app's mental model, prevents primitive bloat.
- **Affects:** Component development, code review standards.

**4c. State Management — `nanostores`**
- **Decision:** `nanostores` for any state that crosses island boundaries (cookie consent state, mobile nav open/closed, current inspection-story scene, light/dark theme). Local React state (`useState`) for state that lives inside a single island.
- **Why nanostores:** Astro-team-recommended for cross-island state. Framework-agnostic (works with React, Vue, Svelte islands — though we only use React). ~1KB total. Reactive subscriptions. No boilerplate.
- **Rejected alternatives:** Zustand (overkill, bigger), Jotai (atom model is more than we need), Redux (lol), React Context (doesn't cross island boundaries).
- **Affects:** Island development, state patterns.

**4d. i18n Implementation — Astro Built-in + JSON Message Files**
- **Decision:** Use Astro 4+ built-in i18n routing. Configure in `astro.config.mjs`:
  ```js
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de'],
    routing: { prefixDefaultLocale: false }  // / serves English; /fr/, /de/ serve translations
  }
  ```
- **Translation files:** `src/i18n/{locale}/{namespace}.json`. Namespaces: `common`, `landing`, `blog`, `faq`. Loaded via a thin `t(key, locale)` helper in `src/lib/i18n.ts`.
- **No `astro-i18next` dependency** — built-in routing + a thin helper covers our needs and avoids a maintained dependency.
- **Locale detection:** Astro middleware checks `Accept-Language` header on first visit, redirects to the appropriate locale URL if not English. Stored preference (cookie or localStorage) takes precedence on subsequent visits.
- **Layout testing:** All components must render correctly with 40% text expansion (NFR26). Validated in V1 with synthetic FR/DE-length placeholder strings.
- **Affects:** FR50–FR52, NFR26, all user-facing strings, all page templates.

**4e. Sticky-Phone Inspection Story — React Island with Intersection Observer**
- **Decision:** A single React island `<InspectionStoryScroll />` containing:
  - The sticky phone frame (SVG, ~2KB)
  - A scene-content slot that swaps based on scroll position
  - Six scene text blocks below (or beside, on desktop)
  - An Intersection Observer that updates a `currentScene` nanostore as each scene enters the viewport
  - CSS crossfade between scene contents (no heavy animation library)
  - `prefers-reduced-motion` fallback: instant content swap, no fade
- **Hydration directive:** `client:visible` — the island only hydrates when it scrolls into view, keeping initial JS budget under control.
- **Mobile fallback:** Sticky positioning is disabled below 768px; scenes stack inline with their own phone instances per the UX spec.
- **Rationale:** Keeps the heaviest interactive component isolated to one island, lazy-hydrated, with strict performance discipline. NFR1, NFR3, NFR5 protected.
- **Affects:** UX-critical inspection story section, performance budget.

**4f. Cookie Consent — `vanilla-cookieconsent` v3, Conditional**
- **Decision:** Use `orestbida/vanilla-cookieconsent` v3 for cookie consent UI. **However:** because we chose Plausible (cookieless analytics, see decision 5b), the consent banner is only required IF we add any non-essential cookies later (e.g., retargeting pixels, paid ad tracking, A/B testing tools).
- **V1 default:** Banner is **not shown** because the site sets no non-essential cookies. Only the strictly-necessary cookies (preference, locale) are used, which are exempt under ePrivacy.
- **Code is wired but inactive at V1.** A single env flag (`COOKIE_CONSENT_REQUIRED=false` at V1) controls whether the banner mounts. Flipping the flag activates it the moment we add a tracking script.
- **Rationale:** GDPR compliance without UX friction at V1. Architecture is ready for the moment we add advertising/retargeting (Phase 2 per PRD post-MVP).
- **Affects:** FR45–FR46, NFR29, all third-party script loading.

**4g. Performance Budget Enforcement — Lighthouse CI in PR Checks**
- **Decision:** Lighthouse CI runs on every PR via GitHub Actions, comparing against budget thresholds:
  - Performance ≥ 90 (NFR6)
  - SEO ≥ 95 (NFR39)
  - Accessibility ≥ 90 (NFR25)
  - LCP < 2.5s (NFR1)
  - CLS < 0.1 (NFR3)
  - Total bundle size + initial weight tracked
- **PR check fails** if any threshold is breached. Forces perf regression to be addressed before merge.
- **Rationale:** Treats the perf budget as a build-time gate, not a hope. The biggest risk to NFR1–NFR9 is gradual drift; CI prevents it.
- **Affects:** GitHub Actions workflow, every PR, definition of "done".

### Infrastructure & Deployment

**5a. Hosting — Cloudflare Pages**
- **Decision:** **Cloudflare Pages** for static hosting + edge functions.
- **Rationale:**
  - Best EU TTFB (~40-50ms) — directly serves NFR4 (TTFB <200ms by a wide margin)
  - Unlimited bandwidth on free tier (vs Vercel/Netlify 100GB cap)
  - Built-in WAF + rate limiting at edge — needed for NFR14 (blog API rate limit)
  - 500 build minutes/month free — sufficient for solo dev cadence
  - Native GitHub integration with preview deployments per PR
  - Instant rollbacks via dashboard (NFR38: <2 min)
  - Cloudflare Workers + KV available for the post-launch stats widget without leaving the platform
  - Cloudflare Turnstile available for invisible CAPTCHA (decision 2c)
  - ≥99.9% uptime SLA (NFR33)
- **Alternatives considered:** Vercel (better DX but more expensive at scale, weaker EU edge for our market focus), Netlify (solid but slower EU TTFB and weaker rate-limiting story).
- **Affects:** All deployment, env vars, build pipeline, CDN behavior. NFR1–NFR9, NFR14, NFR16, NFR18, NFR33, NFR38.

**5b. Analytics — Plausible Cloud (EU)**
- **Decision:** **Plausible Cloud**, hosted in the EU (Germany).
- **Rationale:**
  - Cookieless → no consent banner needed for analytics → eliminates the biggest source of GDPR friction
  - GDPR/CCPA/PECR compliant, EU-hosted, anonymizes data after 24h
  - Lightweight script (<1KB), async, doesn't block render (NFR28)
  - UTM parameter support out of the box (FR37)
  - Custom event tracking for conversion events (FR36): `waitlist_signup`, `app_store_click` (post-launch), `blog_cta_click`
  - Goal tracking via the dashboard, not in code
  - Affordable (~$9-19/mo at expected V1 traffic)
- **Integration:** Single `<script>` tag in `BaseLayout.astro`, included only if user has not opted out. Custom events fired via a tiny `lib/analytics.ts` wrapper: `trackEvent('waitlist_signup', { source: 'hero' })`.
- **Alternatives considered:** Fathom (similar, slightly more expensive), Umami self-hosted (more ops overhead), Google Analytics (rejected — heavy, GDPR-painful, cookie-required, slower).
- **Affects:** FR35–FR39, NFR28, NFR29 (cookie consent simplification), entire analytics layer.

**5c. CI/CD — GitHub Actions for Checks + Cloudflare Pages Auto-Deploy**
- **Decision:**
  - **PR checks (GitHub Actions):** TypeScript (`astro check`), ESLint, Prettier, unit tests (if any), Lighthouse CI against the perf budget. Block merge on failure.
  - **Build & deploy (Cloudflare Pages):** Auto-trigger on push to `main` for production. Auto-trigger on every PR for preview deployment with a unique URL.
  - **Webhooks:** Keystatic Cloud (if used) or a manual `wrangler pages deploy` call triggers a rebuild on content change. Astro Content Collections from the repo trigger rebuild automatically on push.
- **Rebuild SLA:** NFR30 (<5 min from publish to live). Astro build for this site should land in 1-2 minutes; CF deploy adds ~30s.
- **Rationale:** Standard pattern, no infrastructure to manage, free for solo-dev usage, built-in preview deployments enable safe content review.
- **Affects:** Repository setup, GitHub Actions workflow, deployment cadence, content workflow.

**5d. Environment Configuration**
- **Decision:** Three environments — `local`, `preview` (any PR), `production` (`main` branch).
  - `local`: `.env` file (gitignored), `.env.example` template committed.
  - `preview` and `production`: Cloudflare Pages dashboard environment variables, scoped per environment.
- **Variables:** `LAUNCH_PHASE`, `LOOPS_API_KEY`, `LOOPS_AUDIENCE_ID`, `SENTRY_DSN`, `PLAUSIBLE_DOMAIN`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `KEYSTATIC_GITHUB_TOKEN` (if Keystatic Cloud used), `PUBLIC_SITE_URL`, future `STATS_API_KEY` (post-launch).
- **Public vs server-only:** Astro convention — `PUBLIC_*` prefix for client-readable vars, all others server-only.
- **Rationale:** Standard CF Pages pattern, no custom config service, three environments is the right number for solo dev.
- **Affects:** All integrations, local dev onboarding, deploy pipeline.

**5e. Monitoring & Error Tracking — Sentry (EU)**
- **Decision:** **Sentry** via official Astro SDK, EU region.
- **Captures:** Client-side errors, unhandled promise rejections, build errors. Source maps uploaded automatically on build.
- **Release tagging:** Each CF Pages deploy gets a Sentry release tag via `git rev-parse HEAD`.
- **No custom logging layer.** Sentry breadcrumbs (auto-captured navigation, fetch, console) are sufficient.
- **Build failure alerting:** Cloudflare Pages dashboard sends email on failed builds (NFR37). Plausible has an uptime checker as a paid add-on we can enable later if needed.
- **Email delivery monitoring:** Loops dashboard provides delivery rate, open rate, bounce, complaint. No need to duplicate this in our tooling.
- **Rationale:** Standard tool, EU region for GDPR, free tier covers solo-dev volume, integrates with Astro in 5 minutes.
- **Affects:** NFR37, debugging workflow, release tracking.

**5f. Scaling Strategy — Managed Services, No Custom Infrastructure**
- **Decision:** No scaling decisions needed at MVP. All services scale on their platform:
  - Cloudflare Pages: unlimited bandwidth on free tier, paid tier for build minutes if we exceed 500/month
  - Loops: per-contact pricing scales linearly with waitlist size
  - Plausible: per-pageview tier
  - Sentry: per-error tier
- **Cost thresholds to monitor:** Loops contact count, Cloudflare build minutes, Plausible monthly pageviews. Upgrade tier when limits approach. Total expected cost at MVP: <$30/month.
- **Rationale:** Solo dev, no ops capacity, managed everything.
- **Affects:** Budget planning, future scaling.

### Decision Impact Analysis

**Implementation Sequence (first stories, in dependency order):**

1. **Story 1 — Project initialization:** Clone `one-ie/astro-shadcn`, verify license + currency, prune unwanted deps, customize Tailwind config with Truvis brand tokens, first commit.
2. **Story 2 — Cloudflare Pages setup + CI/CD:** GitHub repo, CF Pages project, environment variables, GitHub Actions workflow with checks + Lighthouse CI, first deploy.
3. **Story 3 — Content Collections schemas + Keystatic admin UI:** Define `blog`, `faq`, `testimonials`, `stats`, `siteContent` schemas in `src/content/config.ts` and `keystatic.config.ts`, seed with placeholder content.
4. **Story 4 — i18n routing setup:** Configure Astro built-in i18n, locale detection middleware, message file structure, `t()` helper, English-only V1 content with externalized strings.
5. **Story 5 — Layout shells + brand tokens applied:** `BaseLayout.astro`, `BlogLayout.astro`, header, footer, mobile nav drawer (React island), shadcn theme customized to Truvis palette, font loading (Plus Jakarta Sans + Inter).
6. **Story 6 — Hero + Problem sections:** Static content, no interactivity, applies Truvis brand voice in copy.
7. **Story 7 — Inspection story scroll (React island):** Sticky phone, six scenes, Intersection Observer, nanostores integration, reduced-motion fallback.
8. **Story 8 — FAQ + Trust + Footer sections:** Accordion FAQ from shadcn, stat cards, blog preview cards.
9. **Story 9 — Waitlist form + Loops integration:** Waitlist form (native + island), `POST /api/waitlist` route, Loops API client, double opt-in flow, error handling, Turnstile integration, confirmation page + micro-survey.
10. **Story 10 — Blog content API endpoints:** `src/pages/api/v1/blog/*.json.ts`, schema versioning, CORS headers for mobile app, edge cache headers, contract documentation in `CONTRACT.md`.
11. **Story 11 — Blog index + article templates + structured data:** Blog index, category filtering, individual article layout with JSON-LD (BlogPosting), related articles, share buttons.
12. **Story 12 — Plausible analytics integration:** Script in BaseLayout, `lib/analytics.ts` wrapper, custom event tracking, goal configuration in dashboard.
13. **Story 13 — Sentry integration:** Astro SDK setup, EU region, release tagging, source map upload.
14. **Story 14 — SEO polish + structured data:** Sitemap (Astro integration), robots.txt, OG/Twitter card meta, Organization/WebSite/FAQ JSON-LD, canonical URLs validated.
15. **Story 15 — i18n layout testing:** Synthetic FR/DE-length strings, validate 40% text expansion across all components.
16. **Story 16 — Pre/post-launch toggle:** `lib/launch-phase.ts` helper, conditional rendering in hero/CTA/footer/stats/testimonials, env var wired to CF Pages.
17. **Story 17 — Final QA + launch checklist:** Lighthouse audit on production build, accessibility audit, cross-browser testing, GDPR compliance review, email deliverability (SPF/DKIM/DMARC), DNS cutover.

**Cross-Component Dependencies:**

- **Loops API key** must be set in CF Pages env vars before the waitlist form can be tested in preview deploys.
- **`LAUNCH_PHASE` env var** must be `pre` for all deploys until launch day; flipping it to `post` triggers the toggle.
- **Plausible domain** must be added to the Plausible dashboard before the analytics script will record events.
- **Cloudflare Turnstile site/secret keys** must be created in CF dashboard before the form's anti-spam works.
- **Sentry project** must be created in Sentry EU before error tracking captures anything.
- **DNS** for the production domain must be on Cloudflare for CF Pages to serve it (or pointed via CNAME).
- **Email domain SPF/DKIM/DMARC** must be configured at the DNS provider before Loops will deliver email reliably (pre-launch checklist item).

**Decisions DEFERRED with rationale:**

- **Sanity / headless CMS** — deferred unless Keystatic + Content Collections proves insufficient for content authoring. File-based content is reversible: if we ever migrate to Sanity, we run a one-time markdown → Sanity import.
- **Stats widget infrastructure (CF Worker + KV)** — deferred to V1.1 (post-launch). Built only when launch is imminent and Truvis backend has live data.
- **A/B testing infrastructure** — deferred to Phase 2 (per PRD post-MVP).
- **Self-hosting Plausible** — deferred unless monthly cost crosses a threshold or Plausible Cloud has reliability issues.
- **Real testimonial photos / user stories** — collection schema designed in V1, content authored post-launch.
- **FR/DE translations** — V1.2 only. V1 ensures architecture is ready (i18n routing, externalized strings, layout testing) but ships English content only.


## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

This section establishes the conventions every AI agent (and human) MUST follow when building this codebase. The rules are derived from the mobile app architecture (for cross-platform consistency) and adapted for Astro/web idioms. Where the mobile app has a convention that makes sense for web, we mirror it.

### Naming Patterns

**File Naming Conventions:**

- **Astro files:** `kebab-case.astro` — `inspection-story.astro`, `blog-preview.astro`
- **React island files:** `kebab-case.tsx` — `sticky-phone.tsx`, `cookie-consent.tsx`. (Lowercase filenames; PascalCase only inside the file for the component itself.)
- **shadcn/ui primitive files:** keep the library's existing PascalCase (`Button.tsx`, `Accordion.tsx`) — these are copy-paste from upstream and renaming would break shadcn CLI updates.
- **Layouts:** `BaseLayout.astro`, `BlogLayout.astro` — PascalCase by Astro convention for layout components.
- **API routes:** `kebab-case.ts` — `waitlist.ts`, `posts.json.ts`. Astro file-based routing converts the filename directly to the URL.
- **Content collection markdown files:** `kebab-case-slug.md` — `how-to-inspect-a-used-car.md`. The filename IS the slug.
- **Translation files:** `kebab-case.json` per namespace — `common.json`, `landing.json`, `faq.json`.
- **Lib utilities:** `kebab-case.ts` — `launch-phase.ts`, `analytics.ts`, `loops.ts`, `structured-data.ts`.
- **Test files** (if any): co-located, `*.test.ts` next to the source — `severity-helper.ts` + `severity-helper.test.ts`.

**Component Naming Conventions:**

- **All components:** `PascalCase` exported names — `<WaitlistForm />`, `<InspectionStoryScroll />`, `<BlogPreviewCard />`. Filename is `kebab-case`, exported name is `PascalCase`.
- **Astro components vs React components:** Visually indistinguishable from the consumer's perspective. Pick Astro by default; reach for React only when interactivity requires it (`client:*` directive).
- **Section components:** PascalCase suffix matches the section role — `HeroSection.astro`, `ProblemSection.astro`, `FaqSection.astro`. Always end in `Section` for landing-page sections.
- **Island components:** PascalCase, no special suffix — `StickyPhone.tsx`, `CookieConsent.tsx`. Live in `src/components/islands/` to make hydration cost visually obvious in the file tree.

**Content Collection Field Naming:**

- **Frontmatter and Zod schemas:** `camelCase` — `publishedAt`, `featuredImage`, `readingTime`, `microSurveyAnswer`. Never snake_case in content files. Astro Content Collections natively expose camelCase.
- **Slug fields:** Always `slug` (not `id`, not `permalink`). Astro derives slug from filename by default; explicit `slug` in frontmatter only when overriding.
- **Date fields:** `*At` suffix for timestamps — `publishedAt`, `updatedAt`. Always ISO 8601 strings.

**API Endpoint Naming:**

- **Versioned blog API:** `/api/v{N}/blog/{resource}.json` — `/api/v1/blog/posts.json`, `/api/v1/blog/posts/[slug].json`, `/api/v1/blog/categories.json`. Always JSON-suffixed; the file extension is the format declaration.
- **Server-side actions:** `/api/{verb-noun}` — `/api/waitlist`, `/api/contact` (future). Lowercase, kebab-case, no version prefix (server actions are not consumed by the mobile app and don't need versioning).
- **Route params:** `[param]` syntax (Astro convention) — `[slug]`, `[locale]`. Singular nouns.

**Translation Key Naming:**

- **Dot-notation, namespace.section.element:** `landing.hero.headline`, `landing.cta.primary`, `faq.privacy.question`, `common.nav.blog`.
- **Namespaces:** `common` (shared across all pages), `landing`, `blog`, `faq`. One JSON file per namespace per locale.
- **No interpolation magic strings.** Variables in translations use named placeholders: `landing.hero.priceTag = "Buyers lose an average of {amount}."` Never positional `{0}`, never raw template strings.

**Analytics Event Naming:**

- **`snake_case` with domain prefix:** `waitlist_signup`, `app_store_click` (post-launch), `blog_cta_click`, `micro_survey_completed`, `newsletter_unsubscribed`.
- **Event payload:** flat object, all keys `snake_case`, no nesting — `{ source: 'hero', cta_label: 'get_the_free_guide' }`.
- **All events through one wrapper:** `trackEvent(name, payload)` from `lib/analytics.ts`. Components never call Plausible directly.

**Environment Variable Naming:**

- **`UPPER_SNAKE_CASE`** — `LAUNCH_PHASE`, `LOOPS_API_KEY`, `SENTRY_DSN`, `PLAUSIBLE_DOMAIN`, `TURNSTILE_SITE_KEY`.
- **`PUBLIC_*` prefix** for client-readable vars (Astro convention). Anything without the prefix is server-only.
- **Boolean env vars:** strings `'true'` or `'false'`, parsed via a `lib/env.ts` helper. Never trust direct `process.env.X === 'true'` scattered through the codebase.

**Nanostore Naming:**

- **Stores:** `$camelCase` prefix (nanostore community convention) — `$cookieConsent`, `$mobileNavOpen`, `$currentScene`, `$theme`.
- **Files:** `kebab-case.ts` in `src/lib/stores/` — `cookie-consent-store.ts`, `mobile-nav-store.ts`.
- **Actions:** Plain functions in the same file as the store — `openMobileNav()`, `closeMobileNav()`, `setCurrentScene(n)`. Never expose direct `.set()` calls to consumers.

### Structure Patterns

**Project Organization** (full directory tree in next section):

- **Top-level rule:** `src/pages/` is for thin route files only. All non-trivial logic lives in `src/components/`, `src/lib/`, or `src/content/`. Pages compose, they don't implement.
- **Three-tier component hierarchy** (mirrors mobile app):
  - **Tier 1 — Primitives:** `src/components/ui/` — shadcn/ui components, no business logic, pure presentation.
  - **Tier 2 — Composites:** `src/components/sections/`, `src/components/forms/`, `src/components/blog/` — feature-specific compositions, accept domain objects (e.g., `post: BlogPost`, `faqEntry: FaqEntry`).
  - **Tier 3 — Layouts/Pages:** `src/layouts/*.astro`, `src/pages/*.astro` — thin shells composing Tier 2 components.
- **Islands isolation:** All React islands live in `src/components/islands/`. This makes the JS-cost-of-hydration visually obvious in the file tree. Anything outside `islands/` is assumed to be Astro (zero JS).

**Where to Put Images:**

- **`src/assets/`** for images that should be processed by Astro (optimization, format conversion to WebP/AVIF, srcset generation, hashing). Use `import` statements and `<Image>` from `astro:assets`.
- **`public/`** for raw passthrough assets — favicon, robots.txt, OG images that need stable URLs, static PDFs. Files here are served as-is, no processing.
- **Rule:** If an image is referenced by code, it goes in `src/assets/`. If an image is referenced by a fixed URL or external system, it goes in `public/`. **Never the reverse.**

**Where to Put Tests:**

- **Co-located with source:** `severity-helper.ts` + `severity-helper.test.ts` in the same folder. No top-level `__tests__/` folder.
- **Test framework:** Vitest (Astro's recommended test runner, integrates with Vite). Decision: only test pure utility functions in `lib/`, the `lib/launch-phase.ts` toggle helper, and the blog API JSON output shape. **Skip:** component tests, E2E tests, visual tests at MVP. Lighthouse CI in PR checks is the only "integration" test.
- **Test naming:** `describe('functionName')` blocks; `it('does X when Y')` cases. Plain English.

**Where to Put JSON-LD Structured Data:**

- **All structured data generators centralized in `src/lib/structured-data.ts`** — `organizationJsonLd()`, `websiteJsonLd()`, `blogPostingJsonLd(post)`, `faqJsonLd(entries)`.
- Layouts and pages call these helpers and render the result as `<script type="application/ld+json" set:html={JSON.stringify(schema)} />`.
- **Never inline structured data in a page template** — agents will diverge on schema shape.

### Format Patterns

**Blog Content API JSON Shape (the cross-platform contract):**

- **No wrapper** — the response IS the resource. `GET /api/v1/blog/posts.json` returns an array directly: `[{ slug, title, ... }, ...]`. `GET /api/v1/blog/posts/[slug].json` returns the object directly.
- **camelCase** field names throughout.
- **Dates:** ISO 8601 strings only. `publishedAt: "2026-04-10T14:30:00Z"`. Never UNIX timestamps, never date-only strings, always with timezone.
- **URLs:** Absolute URLs only in API responses. `webUrl: "https://truvis.app/blog/how-to-inspect-a-used-car"`. Relative URLs are forbidden in cross-platform contracts.
- **Image references:** Always an object with `src`, `alt`, `width`, `height`: `{ src: "https://...", alt: "...", width: 1200, height: 630 }`. Width/height enable mobile-side layout calculation without an image fetch.
- **Optional fields:** Omitted entirely from the response (not `null`). `featured: false` is default; only include `featured: true` when applicable. This keeps the payload small and the schema additive-friendly.
- **Booleans:** `true` or `false`. Never `1`/`0`, never `"true"`/`"false"` strings.
- **Versioning:** URL-versioned (`/v1/`). Schema is **additive-only** — new fields can be added without bumping the version, but never rename or remove fields without a `/v2/` endpoint. Documented in `CONTRACT.md` at the repo root.

**Server API Error Response Shape:**

- **Internal API routes** (`/api/waitlist`, etc.) return `{ ok: true, data: T }` on success and `{ ok: false, error: { code, message } }` on failure. Always JSON, always 200 HTTP status (errors are in the body, not the HTTP code) — except for true infrastructure failures (404, 500) which use HTTP codes.
- **Error codes:** `snake_case` strings — `invalid_email`, `duplicate_subscriber`, `loops_unreachable`, `turnstile_failed`. The client maps codes to user-friendly messages.

**Date / Time Handling:**

- **Storage:** ISO 8601 strings everywhere — content frontmatter, API responses, internal data flow.
- **Display:** Format only at the leaf component, via a single helper `lib/date.ts` — `formatDate(iso, locale)`, `formatRelativeDate(iso, locale)`. No inline `new Date(...).toLocaleDateString()` scattered in components.
- **Time zones:** All stored times are UTC. Display converts to viewer's local time at render. Never trust string parsing without an explicit timezone.

**Null vs Undefined:**

- **`null`** means "no value, intentionally" — use in content schemas and API responses.
- **`undefined`** means "not yet loaded / not yet computed" — use for async data states.
- **Components differentiate:** `undefined` → render skeleton or loading state; `null` → render empty state.

**Tailwind Class Organization:**

- **`cn()` helper** from shadcn/ui for any conditional or merged class lists. Never raw template strings concatenating classes.
- **Class order:** Enforced by `prettier-plugin-tailwindcss` (auto-sorted on save). Agents never hand-order Tailwind classes.
- **No `@apply` in CSS files** for V1 — utilities live in JSX/Astro markup. Reserve `@apply` only for shadcn theme tokens that genuinely need a single rule (e.g., focus rings used in many places).
- **Custom utilities:** add to `tailwind.config.ts` (as theme extensions) rather than inventing arbitrary CSS classes.

### Communication Patterns

**Hydration Directive Selection (CRITICAL — biggest perf risk):**

- **`client:visible`** is the **default** for any island that's below the fold. Inspection story scroll, FAQ accordion, blog preview interactivity, footer waitlist form — all `client:visible`.
- **`client:idle`** for above-the-fold islands that aren't critical to first interaction — header mobile nav button (the drawer slides in but the button itself doesn't need immediate JS).
- **`client:load`** ONLY for the hero waitlist form (above the fold, immediately interactive, conversion-critical).
- **`client:only="react"`** ONLY for components that genuinely cannot SSR (e.g., a component that uses `window` at module load). This is rare and should be a red flag in code review.
- **Forbidden:** Defaulting to `client:load` everywhere. This is the #1 perf budget killer and the most common AI-agent mistake. Code review must flag any `client:load` that isn't above-the-fold conversion-critical.

**Nanostore Update Patterns:**

- **Stores hold UI/ephemeral state only.** No persisted data in nanostores. Persisted preferences (theme, locale) live in `localStorage` accessed via a thin wrapper.
- **Actions are plain functions, exported from the store file.** Components never call `$store.set(...)` directly — always go through actions.
- **Cross-island state** (e.g., cookie consent state read by both the banner island and the analytics loader) goes through a shared nanostore. **Single-island state** stays in React `useState`.
- **Subscription pattern in React islands:** `import { useStore } from '@nanostores/react'; const value = useStore($cookieConsent);`

**Form State and Submission:**

- **Client validation timing:** on blur (first time) + on submit (always). Never on every keystroke (annoying).
- **Server validation:** the source of truth. Client validation is for UX, not security.
- **Submission flow:** disable submit button + show inline spinner → POST to `/api/{action}` → on success, redirect or show success state → on error, re-enable button + show toast or inline error.
- **Input is sacred:** errors NEVER clear the user's input. Network failures preserve the input. Validation failures preserve the input.

### Process Patterns

**Error Handling — Three Layers (mirrors mobile app, simplified for web):**

- **Layer 1 — Form / API errors:** Inline validation messages near the field, severity red color. Network/API failures show a `<Toast>` (shadcn/ui or Sonner). Input always preserved.
- **Layer 2 — Page rendering errors:** Astro's built-in error handling + custom branded `404.astro` and `500.astro` pages with navigation back to landing page and blog (FR56).
- **Layer 3 — Crash-level / unexpected:** Sentry catches uncaught client errors. Source maps uploaded on build. EU region.

**Loading State Patterns:**

- **Three states only:** `idle`, `loading`, `error`. No bespoke status strings per feature.
- **Never use full-screen loading overlays** — Astro is SSG, so the page itself never "loads". The only loading states are inside form submissions and the (post-launch) stats widget fetch.
- **Skeleton placeholders** for the post-launch stats widget while it fetches from KV. Inline button spinner for the waitlist form.

**Image Loading:**

- **Always use `<Image>` from `astro:assets`** for content images. Never raw `<img>` tags except for SVG inline graphics (the sticky phone frame).
- **Above-the-fold images:** `loading="eager"` (the hero phone mockup).
- **Below-the-fold images:** `loading="lazy"` (default for `<Image>`).
- **Always specify `width` and `height`** to prevent CLS (NFR3).

**Accessibility Patterns:**

- **Semantic HTML first.** Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` over generic `<div>`s. ARIA only fills gaps.
- **Heading hierarchy:** one `<h1>` per page, no skipped levels. The hero headline is the only `<h1>`. Section headings are `<h2>`. Sub-headings within sections are `<h3>`.
- **Skip-to-content link:** First focusable element on every page (BaseLayout responsibility).
- **Focus indicators:** Visible on every interactive element via `focus-visible:` Tailwind utilities. Never `outline: none` without a replacement.
- **`aria-live`:** On the sticky phone scene description (so screen readers announce scene changes). On form error messages (so they're announced when shown).
- **`aria-hidden="true"`:** On purely decorative SVGs (phone frame, blog preview illustrations).
- **Form labels:** Every `<input>` has an associated `<label>` (via `htmlFor` / `id`). Placeholders are NOT labels.
- **Color is never the sole indicator** of meaning. Severity colors always paired with text or icons.

**Internationalization in Components:**

- **Never hardcode user-facing strings.** Always go through the `t()` helper: `t('landing.hero.headline', locale)`.
- **Locale prop passing:** Pages receive locale from Astro routing (`Astro.currentLocale`), pass it down to section components as a prop. Components don't read globals.
- **Date and number formatting:** Use the locale parameter — `formatDate(iso, locale)`, `formatNumber(value, locale)`. Never hardcoded formats.
- **Layout flex tolerance:** All text containers must accommodate 40% expansion (NFR26). No fixed-width text containers, no `text-overflow: ellipsis` on critical content.

**Pre/Post-Launch Toggle in Components:**

- **All conditional rendering goes through `lib/launch-phase.ts`:**
  ```ts
  // src/lib/launch-phase.ts
  export const LAUNCH_PHASE = (import.meta.env.LAUNCH_PHASE ?? 'pre') as 'pre' | 'post';
  export const isPostLaunch = () => LAUNCH_PHASE === 'post';
  ```
- **Components import `isPostLaunch()` and branch:**
  ```astro
  import { isPostLaunch } from '@/lib/launch-phase';
  const cta = isPostLaunch() ? 'Download Now' : 'Get the Free Guide';
  ```
- **Never read `import.meta.env.LAUNCH_PHASE` directly in components.** Single source of truth.
- **No runtime toggle.** The phase is fixed at build time. Switching phases = redeploy.

**Content Collection Access Pattern:**

- **All content collection queries centralized in `src/lib/content.ts`:** `getAllPosts()`, `getPostBySlug(slug)`, `getFaqEntries()`, `getPrelaunchStats()`, `getPostLaunchStats()`, etc.
- **No inline `getCollection('blog')` calls scattered through page templates.** Forces consistent filtering, sorting, and phase-awareness in one place.
- **Each helper returns typed results** — Astro Content Collections give us TypeScript types from Zod schemas for free.

### Enforcement Guidelines

**All AI Agents (and humans) MUST:**

1. Use `kebab-case` for filenames; `PascalCase` for component exports. No exceptions outside of shadcn/ui primitives.
2. Place React islands in `src/components/islands/` and use the lowest-cost `client:*` directive — default `client:visible`, never `client:load` unless above-the-fold and conversion-critical.
3. Use `cn()` from shadcn/ui for all conditional Tailwind classes — never template-string concatenation.
4. Read `LAUNCH_PHASE` only via `lib/launch-phase.ts`'s `isPostLaunch()` helper. Never `import.meta.env.LAUNCH_PHASE` directly in components.
5. Read content only through `lib/content.ts` helpers. Never inline `getCollection()` calls outside of `lib/`.
6. Use `t()` from `lib/i18n.ts` for every user-facing string. Never hardcode English in components.
7. Use the `<Image>` component from `astro:assets` for content images. Never raw `<img>`. Always specify `width` and `height`.
8. Track analytics events only via `trackEvent()` from `lib/analytics.ts`. Never call `plausible(...)` directly.
9. Use `t()` keys in `dot.notation.format` and namespace JSON files in `src/i18n/{locale}/{namespace}.json`.
10. Generate JSON-LD only from helpers in `lib/structured-data.ts`. Never inline structured data in templates.
11. Format dates only via `lib/date.ts` helpers. Never inline `toLocaleDateString()`.
12. Place tests as `*.test.ts` co-located with the source file. Use Vitest. Test only pure utilities + the blog API JSON shape; no component tests at MVP.
13. Format JSON API responses with **camelCase** fields, **no wrapper** for blog API, ISO 8601 dates, absolute URLs for cross-platform contracts.
14. For blog API schema changes, ADD fields only — never rename or remove without bumping the URL version. Update `CONTRACT.md`.
15. For new shadcn/ui components: install via `npx shadcn@latest add <component>` (don't hand-write copies). Customize via `tailwind.config.ts`, not by editing the primitive directly.

**Pattern Enforcement Mechanisms:**

- **TypeScript strict mode:** Catches type drift at build time.
- **`astro check`:** Catches Astro-specific errors and missing props.
- **ESLint with Astro plugin:** Catches anti-patterns (raw `<img>`, missing alt, hardcoded strings flagged via custom rule, `client:load` outside above-the-fold check via custom rule).
- **`prettier-plugin-tailwindcss`:** Auto-sorts Tailwind classes on save.
- **Lighthouse CI in PR checks:** Hard gate on perf, accessibility, SEO budgets — catches drift even when individual code looks fine.
- **Code review:** Manual check on hydration directives, JSON API contract changes, new third-party scripts, accessibility regressions.

**Pattern Updates:**

- Pattern changes go in this section of `architecture-truvis-landing-page.md`. Never in code comments, never in README, never in chat history.
- A pattern change requires an explicit commit that updates this document AND any code that should newly conform.

### Pattern Examples

**Good — Hero CTA component (Astro, no JS):**

```astro
---
// src/components/sections/hero-section.astro
import { t } from '@/lib/i18n';
import { isPostLaunch } from '@/lib/launch-phase';
import { Image } from 'astro:assets';
import heroPhone from '@/assets/hero-phone.webp';
import { Button } from '@/components/ui/Button';
import WaitlistForm from '@/components/islands/waitlist-form';

const { locale } = Astro.props;
const ctaLabel = isPostLaunch() ? t('landing.hero.ctaPost', locale) : t('landing.hero.ctaPre', locale);
---
<section class="hero" aria-labelledby="hero-heading">
  <h1 id="hero-heading">{t('landing.hero.headline', locale)}</h1>
  <p>{t('landing.hero.subheadline', locale)}</p>
  <Image src={heroPhone} alt={t('landing.hero.phoneAlt', locale)} width={400} height={800} loading="eager" />
  {isPostLaunch()
    ? <Button as="a" href="https://apps.apple.com/...">{ctaLabel}</Button>
    : <WaitlistForm client:load locale={locale} source="hero" />
  }
</section>
```

**Good — React island with proper hydration:**

```tsx
// src/components/islands/inspection-story-scroll.tsx
import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $currentScene, setCurrentScene } from '@/lib/stores/inspection-story-store';

export default function InspectionStoryScroll() {
  const sceneRefs = useRef<HTMLDivElement[]>([]);
  const currentScene = useStore($currentScene);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sceneIndex = parseInt(entry.target.getAttribute('data-scene') ?? '0');
            setCurrentScene(sceneIndex);
          }
        });
      },
      { threshold: 0.5 }
    );
    sceneRefs.current.forEach(ref => observer.observe(ref));
    return () => observer.disconnect();
  }, []);
  // ...render scenes + sticky phone
}
```

Used in an Astro template with `client:visible` (NOT `client:load`):

```astro
<InspectionStoryScroll client:visible />
```

**Good — Blog API endpoint:**

```ts
// src/pages/api/v1/blog/posts.json.ts
import type { APIRoute } from 'astro';
import { getAllPosts } from '@/lib/content';

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const payload = posts.map(post => ({
    slug: post.slug,
    title: post.data.title,
    excerpt: post.data.excerpt,
    featuredImage: {
      src: post.data.featuredImage,
      alt: post.data.featuredImageAlt,
      width: 1200,
      height: 630,
    },
    category: post.data.category,
    publishedAt: post.data.publishedAt.toISOString(),
    updatedAt: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
    readingTime: post.data.readingTime,
    ...(post.data.featured && { featured: true }),
    webUrl: `https://truvis.app/blog/${post.slug}`,
  }));
  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
};
```

### Anti-Patterns (forbidden)

| ❌ Anti-pattern | ✅ Correct pattern |
|---|---|
| `<MyComponent client:load />` everywhere | `client:visible` for below-fold, `client:load` only for above-fold conversion-critical |
| `<img src="/hero.jpg" />` | `<Image src={hero} alt="..." width={1200} height={630} />` |
| `<h1>Get the Free Guide</h1>` (hardcoded) | `<h1>{t('landing.hero.headline', locale)}</h1>` |
| `import.meta.env.LAUNCH_PHASE === 'post'` in a component | `isPostLaunch()` from `lib/launch-phase.ts` |
| `getCollection('blog')` in a page | `getAllPosts()` from `lib/content.ts` |
| `plausible('signup')` in a form | `trackEvent('waitlist_signup', { source: 'hero' })` |
| `className={'btn ' + (active ? 'btn-active' : '')}` | `className={cn('btn', active && 'btn-active')}` |
| Inline `<script type="application/ld+json">{...}</script>` per page | `import { blogPostingJsonLd } from '@/lib/structured-data'` + helper |
| `new Date(post.publishedAt).toLocaleDateString()` in a component | `formatDate(post.publishedAt, locale)` from `lib/date.ts` |
| Renaming `featuredImage` to `coverImage` in the blog API | Add a new field; keep the old one. Schema is additive-only. |
| Returning `{ data: posts }` wrapper from blog API | Return `posts` directly (no wrapper for cross-platform contracts) |
| Storing dates as `"2026-04-10"` (no time, no zone) | `"2026-04-10T14:30:00Z"` ISO 8601 with timezone |
| Reading `localStorage` directly in 5 components | One nanostore-backed wrapper, all access through it |
| Adding a new shadcn primitive by hand-copying from the docs | `npx shadcn@latest add <component>` |
| `style={{ marginLeft: '12px' }}` | `class="ml-3"` (4pt grid: 12px = `ml-3`) |
| Hand-sorting Tailwind classes | Let `prettier-plugin-tailwindcss` sort them |


## Project Structure & Boundaries

### Complete Project Directory Structure

```
truvis-landing-page/
├── .github/
│   └── workflows/
│       └── ci.yml                          # PR checks: astro check, ESLint, Prettier, Vitest, Lighthouse CI
├── .vscode/
│   └── settings.json                       # Editor config (Tailwind IntelliSense, Astro extension)
├── public/                                 # Raw passthrough assets — served as-is at root
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── robots.txt                          # Auto-generated by Astro integration but lives here as the source
│   └── og/                                 # Static OG images that need stable URLs
│       └── default.png
├── src/
│   ├── pages/                              # File-based routes — THIN shells only
│   │   ├── index.astro                     # Landing page (composes section components)
│   │   ├── 404.astro                       # Branded 404 page (FR56)
│   │   ├── 500.astro                       # Branded server error page
│   │   ├── waitlist-confirmed.astro        # Post-signup confirmation page + micro-survey
│   │   ├── privacy.astro                   # GDPR privacy policy (FR47)
│   │   ├── terms.astro                     # Terms of service
│   │   ├── blog/
│   │   │   ├── index.astro                 # Blog index with category filter
│   │   │   ├── [slug].astro                # Individual blog article template
│   │   │   └── category/
│   │   │       └── [category].astro        # Category-filtered blog index
│   │   ├── api/
│   │   │   ├── waitlist.ts                 # POST — proxies to Loops API
│   │   │   └── v1/
│   │   │       └── blog/
│   │   │           ├── posts.json.ts       # GET — full post list (mobile app contract)
│   │   │           ├── posts/
│   │   │           │   └── [slug].json.ts  # GET — individual post detail
│   │   │           └── categories.json.ts  # GET — category list
│   │   └── keystatic/
│   │       └── [...params].astro           # Keystatic admin UI mount point (dev or gated)
│   ├── components/
│   │   ├── ui/                             # Tier 1 — shadcn/ui primitives (from starter, customized)
│   │   │   ├── Accordion.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── NavigationMenu.tsx
│   │   │   ├── Separator.tsx
│   │   │   ├── Sheet.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Sonner.tsx                  # Toast notifications
│   │   │   └── (...other shadcn primitives as needed)
│   │   ├── sections/                       # Tier 2 — landing page section composites
│   │   │   ├── header.astro                # Site header with nav (uses islands for mobile drawer)
│   │   │   ├── hero-section.astro          # Hero with financial micro-story + CTA
│   │   │   ├── problem-section.astro       # Problem validation + market stats
│   │   │   ├── inspection-story-section.astro # Wraps the StickyPhone island + scene text
│   │   │   ├── social-proof-section.astro  # Stat cards (pre or post-launch variant)
│   │   │   ├── blog-previews-section.astro # Inline blog cards on landing page
│   │   │   ├── faq-section.astro           # Wraps the FaqAccordion island
│   │   │   ├── footer-cta-section.astro    # Final CTA (waitlist or app store)
│   │   │   ├── footer.astro                # Site footer with links
│   │   │   └── section-eyebrow.astro       # Reusable eyebrow badge + heading pattern
│   │   ├── blog/                           # Tier 2 — blog-specific components
│   │   │   ├── blog-preview-card.astro     # Card used on landing + blog index
│   │   │   ├── blog-article-header.astro   # Article hero (title, date, reading time)
│   │   │   ├── blog-article-body.astro     # Article body styling wrapper
│   │   │   ├── blog-related-posts.astro    # Related articles at end of article
│   │   │   ├── blog-share-buttons.astro    # Social share row
│   │   │   ├── blog-category-filter.astro  # Category pill filter on blog index
│   │   │   └── blog-cta-inline.astro       # Mid-article CTA (waitlist or app store)
│   │   ├── forms/                          # Tier 2 — form composites
│   │   │   ├── waitlist-form.astro         # Static wrapper that mounts the WaitlistForm island
│   │   │   └── micro-survey.astro          # Wrapper for MicroSurvey island on confirmation page
│   │   └── islands/                        # All client-side hydrated React components
│   │       ├── waitlist-form.tsx           # Email capture island with validation + submit
│   │       ├── micro-survey.tsx            # Single-question survey on confirmation page
│   │       ├── inspection-story-scroll.tsx # Sticky phone + Intersection Observer scene switching
│   │       ├── faq-accordion.tsx           # Accordion island (if needed beyond Astro+CSS)
│   │       ├── mobile-nav.tsx              # Mobile navigation drawer (Sheet)
│   │       ├── cookie-consent.tsx          # vanilla-cookieconsent wrapper (inactive at V1)
│   │       └── stat-counter.tsx            # Animated number counter for stats (post-launch)
│   ├── content/                            # Astro Content Collections — type-safe content
│   │   ├── config.ts                       # Zod schemas for all collections
│   │   ├── blog/
│   │   │   ├── how-to-inspect-a-used-car.md
│   │   │   ├── seven-red-flags-on-used-cars.md
│   │   │   └── (...5-8 seed articles per PRD)
│   │   ├── faq/
│   │   │   ├── is-this-a-replacement-for-a-mechanic.md
│   │   │   ├── what-data-do-you-collect.md
│   │   │   └── (...other FAQ entries)
│   │   ├── testimonials/
│   │   │   └── (placeholder for V1 — populated post-launch)
│   │   ├── stats/
│   │   │   ├── pre-launch-market-loss.md
│   │   │   ├── pre-launch-dealership-trust.md
│   │   │   └── (...other stat entries with phase: pre|post)
│   │   └── site/
│   │       ├── hero.md                     # Hero copy (with pre/post phase variants)
│   │       ├── problem.md
│   │       ├── features.md
│   │       └── footer.md
│   ├── layouts/
│   │   ├── BaseLayout.astro                # Root HTML, head, header, footer, skip link, meta, JSON-LD
│   │   └── BlogLayout.astro                # Blog article layout (extends BaseLayout)
│   ├── lib/                                # Shared utilities and infrastructure
│   │   ├── content.ts                      # All Content Collection queries (single source)
│   │   ├── launch-phase.ts                 # LAUNCH_PHASE + isPostLaunch() helper
│   │   ├── i18n.ts                         # t() helper, locale detection, message loader
│   │   ├── analytics.ts                    # trackEvent() wrapper around Plausible
│   │   ├── loops.ts                        # Loops API client (server-side only)
│   │   ├── turnstile.ts                    # Cloudflare Turnstile validation helper (server-side)
│   │   ├── structured-data.ts              # JSON-LD generators (Organization, WebSite, BlogPosting, FAQ)
│   │   ├── date.ts                         # formatDate, formatRelativeDate
│   │   ├── number.ts                       # formatNumber, formatCurrency
│   │   ├── env.ts                          # Typed env var access (parseBoolean, getRequired)
│   │   ├── seo.ts                          # Meta tag generators, canonical URL helpers
│   │   ├── reading-time.ts                 # Compute reading time from markdown body
│   │   ├── cn.ts                           # Re-exports shadcn cn() helper
│   │   ├── stores/                         # Cross-island state (nanostores)
│   │   │   ├── cookie-consent-store.ts     # $cookieConsent + actions
│   │   │   ├── mobile-nav-store.ts         # $mobileNavOpen + actions
│   │   │   ├── inspection-story-store.ts   # $currentScene + setCurrentScene()
│   │   │   └── theme-store.ts              # $theme + toggleTheme() (V1.1 if dark mode ships)
│   │   └── middleware/
│   │       └── locale-detection.ts         # Astro middleware: redirect by Accept-Language
│   ├── i18n/                               # Translation message files
│   │   ├── en/
│   │   │   ├── common.json                 # Nav, buttons, errors, footer
│   │   │   ├── landing.json                # Hero, problem, features, social proof, FAQ section labels
│   │   │   ├── blog.json                   # Blog index + article UI strings
│   │   │   └── faq.json                    # FAQ-specific UI labels
│   │   ├── fr/                             # Stub directory; populated in V1.2
│   │   │   └── (mirrors en/)
│   │   └── de/                             # Stub directory; populated in V1.2
│   │       └── (mirrors en/)
│   ├── assets/                             # Astro-processed images and fonts
│   │   ├── hero-phone.webp                 # Hero phone mockup
│   │   ├── inspection-scenes/              # Six inspection story scene mockups
│   │   │   ├── scene-1-model-dna.webp
│   │   │   ├── scene-2-severity.webp
│   │   │   ├── scene-3-risk-calibration.webp
│   │   │   ├── scene-4-poker-face.webp
│   │   │   ├── scene-5-hard-stop.webp
│   │   │   └── scene-6-negotiation.webp
│   │   ├── blog-illustrations/             # Inline SVG illustrations for blog cards
│   │   │   └── (svg files)
│   │   ├── logos/
│   │   │   ├── truvis-wordmark.svg
│   │   │   ├── truvis-icon.svg
│   │   │   └── truvis-logo-full.svg
│   │   └── fonts/
│   │       ├── plus-jakarta-sans-variable.woff2
│   │       └── inter-variable.woff2
│   ├── styles/
│   │   └── global.css                      # Tailwind directives, font-face, brand CSS variables
│   └── env.d.ts                            # Astro env type definitions
├── tests/                                  # Vitest unit tests for lib utilities only
│   ├── launch-phase.test.ts
│   ├── content.test.ts                     # Validates blog API JSON shape
│   ├── date.test.ts
│   ├── reading-time.test.ts
│   └── structured-data.test.ts
├── lighthouse/                             # Lighthouse CI config
│   ├── lighthouserc.cjs                    # Budget thresholds (perf, a11y, SEO, CLS, LCP)
│   └── budget.json                         # Resource size budgets
├── scripts/                                # One-off scripts
│   ├── verify-blog-contract.ts             # Asserts blog API JSON matches CONTRACT.md schema
│   └── seed-content.ts                     # Bootstrap content collections with placeholder data
├── .env.example                            # Template for local env vars (commited)
├── .env                                    # Local secrets (gitignored)
├── .eslintrc.cjs                           # ESLint with Astro plugin
├── .prettierrc.cjs                         # Prettier + tailwindcss plugin config
├── .gitignore
├── astro.config.mjs                        # Astro config: integrations, i18n, build options
├── tailwind.config.ts                      # Tailwind v4 config: brand tokens, theme extensions
├── tsconfig.json                           # Strict TypeScript with path aliases (@/* → src/*)
├── keystatic.config.ts                     # Keystatic admin UI schema (mirrors Content Collections)
├── package.json
├── package-lock.json
├── vitest.config.ts                        # Vitest configuration
├── README.md                               # Project README (setup, scripts, conventions)
└── CONTRACT.md                             # Blog API contract documentation (versioned schema)
```

### Architectural Boundaries

**API Boundaries (the contracts crossing system edges):**

| Boundary | Owner | Consumers | Versioned? | Schema Discipline |
|---|---|---|---|---|
| `/api/v1/blog/posts.json` | Landing page build | Truvis mobile app (carousel), web blog index | Yes (`/v1/`) | Additive-only per NFR31. Documented in `CONTRACT.md`. |
| `/api/v1/blog/posts/[slug].json` | Landing page build | Truvis mobile app (deep link expansion) | Yes (`/v1/`) | Additive-only |
| `/api/v1/blog/categories.json` | Landing page build | Truvis mobile app, web blog filter | Yes (`/v1/`) | Additive-only |
| `/api/waitlist` (POST) | Landing page server | Landing page client only | No | Internal. Free to evolve. |
| `Loops HTTP API` | External (Loops) | Server-side only via `lib/loops.ts` | External | Pinned to current Loops API version; wrapper isolates breaking changes. |
| `Plausible /api/event` | External (Plausible) | Client via `lib/analytics.ts` wrapper | External | Plausible-stable. |
| `Cloudflare Turnstile API` | External (Cloudflare) | Server-side only via `lib/turnstile.ts` | External | CF-stable. |
| `Sentry SDK` | External (Sentry) | Client + build-time | External | SDK-versioned. |
| `Truvis backend stats API` (post-launch) | Truvis mobile backend | Cloudflare Worker via `wrangler.toml` config | External | Owned by mobile backend team; versioned at backend. |

**Component Boundaries:**

- **Tier 1 (Primitives) → Tier 2 (Composites) → Tier 3 (Layouts/Pages):** Strict downward dependency. Tier 1 never imports from Tier 2 or 3. Tier 2 imports from Tier 1 only. Tier 3 composes Tier 2.
- **Astro components vs React islands:** Astro components have zero JS by default. React islands hydrate via `client:*` directive. The Astro → React boundary is the `client:*` attribute on the island element.
- **Cross-island state:** ONLY via `nanostores` in `src/lib/stores/`. React islands import the store and use `useStore()`. Astro components cannot read nanostores at SSG time (they render to HTML before any state exists).
- **Section vs Layout boundary:** Sections are reusable feature blocks. Layouts are page chrome (header, footer, meta). Pages compose sections inside a layout.

**Data Boundaries:**

- **Content Collection access:** ONLY through `src/lib/content.ts`. No `getCollection()` calls outside `lib/`. This is the snake_case → camelCase boundary (though we use camelCase end-to-end here, it's still the type-conversion / filtering boundary).
- **Build-time vs Runtime data:** Astro Content Collections, blog API JSON, sitemap, RSS, structured data — all generated at **build time**. The only **runtime** data is (a) the email submission flow (`/api/waitlist` runs as a Cloudflare Pages Function on each request) and (b) the post-launch stats widget fetch (V1.1).
- **Persistent storage:** None owned by us. Email addresses live in Loops. Analytics events live in Plausible. Errors live in Sentry. Cookie consent state lives in client `localStorage`.
- **Mobile app contract:** The blog API JSON files are the ONLY data contract between the landing page and the mobile app. Any change must respect additive-only versioning (NFR31).

**Auth Boundaries:**

- **No user auth.** The only auth-adjacent surfaces are:
  - **Keystatic admin UI:** Dev-only at V1; gated in production via env flag. If production access needed later, mount via Keystatic Cloud (GitHub OAuth).
  - **`/api/waitlist`:** Server-side validation of Cloudflare Turnstile token before forwarding to Loops. No user identity, just bot mitigation.
  - **CMS / Content edits:** Live in git. Only Cristian has commit access to `main`. No runtime auth needed.

### Requirements to Structure Mapping

| PRD Domain | Functional Requirements | Lives In |
|---|---|---|
| Landing Page Conversion Surface | FR1–FR11 | `src/pages/index.astro`, `src/components/sections/*` |
| Email Capture & Nurture | FR12–FR17 | `src/components/forms/waitlist-form.astro`, `src/components/islands/waitlist-form.tsx`, `src/pages/api/waitlist.ts`, `src/pages/waitlist-confirmed.astro`, `src/components/islands/micro-survey.tsx`, `src/lib/loops.ts`, drip series authored entirely in Loops dashboard |
| Blog & Content | FR18–FR22, FR27 | `src/content/blog/*`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/components/blog/*`, `src/layouts/BlogLayout.astro` |
| Blog API for mobile app | FR23–FR26 | `src/pages/api/v1/blog/*.json.ts`, `src/lib/content.ts`, `CONTRACT.md` |
| Content Management | FR28–FR34 | `src/content/config.ts`, `keystatic.config.ts`, `src/pages/keystatic/[...params].astro`, Cloudflare Pages auto-deploy on push |
| Analytics & Tracking | FR35–FR39 | `src/lib/analytics.ts`, Plausible script in `src/layouts/BaseLayout.astro`, custom event calls scattered through islands |
| SEO & Discoverability | FR40–FR44 | `src/lib/structured-data.ts`, Astro `@astrojs/sitemap` integration in `astro.config.mjs`, `public/robots.txt`, `<Image>` from `astro:assets` for image SEO, `src/lib/seo.ts` for meta tags |
| Compliance & Privacy | FR45–FR49 | `src/components/islands/cookie-consent.tsx` (inactive at V1), `src/pages/privacy.astro`, double opt-in handled by Loops, right-to-erasure handled via Loops dashboard or contact email |
| Internationalization | FR50–FR52 | `astro.config.mjs` i18n config, `src/lib/middleware/locale-detection.ts`, `src/lib/i18n.ts`, `src/i18n/{locale}/*.json` |
| Pre/Post-Launch Transition | FR53–FR55 | `src/lib/launch-phase.ts`, `LAUNCH_PHASE` env var in Cloudflare Pages dashboard, conditional rendering throughout sections |
| Error Handling | FR56 | `src/pages/404.astro`, `src/pages/500.astro`, Sentry integration |

| PRD NFR Domain | Non-Functional Requirements | Architectural Support |
|---|---|---|
| Performance | NFR1–NFR9 | Astro SSG + Cloudflare Pages CDN, `<Image>` optimization, `client:visible` discipline, font subsetting, Lighthouse CI gating |
| Security | NFR10–NFR15 | Cloudflare TLS, server-side env vars, Turnstile + honeypot, CF WAF rate limiting, no client-side secrets |
| Scalability | NFR16–NFR18 | CDN edge caching, queued email submission (Loops handles retry), static blog API (CDN serves at scale) |
| Accessibility | NFR19–NFR26 | Radix primitives in shadcn, semantic HTML, focus management, ESLint a11y plugin, layout text-expansion testing |
| Integration | NFR27–NFR32 | `lib/loops.ts` wrapper, Plausible async script, Cloudflare Pages webhook on git push (NFR30), additive-only blog API (NFR31), CF Worker stats cache (NFR32, post-launch) |
| Reliability | NFR33–NFR36 | Cloudflare ≥99.9% SLA, Loops graceful degradation in `/api/waitlist`, post-launch stats fallback, no runtime CMS to fail |
| Monitoring | NFR37–NFR38 | Sentry + CF Pages email alerts on build failure, CF dashboard rollback |
| SEO Performance | NFR39 | Lighthouse CI gates SEO score |
| Content Quality | NFR40 | Brand voice guidelines in Keystatic schema descriptions; editorial review process (manual) |

### Integration Points

**External Integrations:**

- **Loops** — Email service. Server-side via `src/lib/loops.ts`. API key in CF Pages env var. Used by `/api/waitlist`.
- **Plausible Analytics (EU)** — Page view + event tracking. Client-side script in BaseLayout. Custom events via `src/lib/analytics.ts` wrapper.
- **Sentry (EU)** — Error tracking. Client SDK in BaseLayout, build-time SDK for source maps. Astro Sentry integration.
- **Cloudflare Turnstile** — Invisible CAPTCHA. Client widget in `WaitlistForm` island. Server-side validation in `/api/waitlist` via `src/lib/turnstile.ts`.
- **Cloudflare Pages** — Hosting + build pipeline + edge functions + KV (post-launch stats).
- **GitHub** — Source repo + Actions for PR checks + integrated with CF Pages for auto-deploy.
- **Keystatic Cloud** (optional, V1.1+) — Hosted admin UI with GitHub OAuth. Not needed for solo dev.
- **Truvis backend (Supabase Edge Function)** — Post-launch only (V1.1). Live inspection stats fetched by Cloudflare Worker on cron, cached in KV.

**Internal Communication:**

- **Pages → Sections:** Page templates import section components and pass `locale` prop. Sections receive structured content from `lib/content.ts` helpers.
- **Sections → Islands:** Astro section wraps the React island element with `client:*` directive. Props are JSON-serializable (no functions, no class instances).
- **Islands → Stores:** React islands subscribe to nanostores via `useStore()`. Actions are imported as plain functions and called directly.
- **Components → Lib:** All components (Astro and React) call `lib/*` helpers for content, i18n, analytics, dates, etc. Components NEVER import from each other across tiers.
- **API routes → Lib:** Server-side API routes use `lib/loops.ts`, `lib/turnstile.ts`, and `lib/content.ts`. API routes do not import from `components/`.

**Data Flow:**

```
Author publishes content (Keystatic UI or git push)
       ↓
Git commit to main branch
       ↓
Cloudflare Pages webhook fires
       ↓
Astro build runs:
  - Reads src/content/*.md via Content Collections
  - Generates static HTML pages (incl. blog articles, FAQ, landing page)
  - Generates static API JSON files at /api/v1/blog/*
  - Generates sitemap.xml, robots.txt, RSS feed, JSON-LD
  - Optimizes images via Astro Assets
  - Bundles JS for islands (tree-shaken, code-split per island)
  - Lighthouse CI runs against the build
       ↓
Cloudflare Pages deploys to global edge CDN
       ↓
Visitors served from nearest edge (TTFB ~40-50ms in EU)

Visitor submits waitlist form:
  Browser → /api/waitlist (CF Pages Function)
              ↓
              Validate Turnstile token (Cloudflare API)
              ↓
              Validate honeypot is empty
              ↓
              Validate email format
              ↓
              POST contact to Loops API (server-side)
              ↓
              Return { ok: true } or { ok: false, error: { code, message } }
              ↓
  Browser → redirect to /waitlist-confirmed
              ↓
              Loops triggers double opt-in email
              ↓
              User clicks confirm → enters drip series

Mobile app fetches blog carousel:
  App → GET https://truvis.app/api/v1/blog/posts.json
       ↓
       Cloudflare CDN edge cache hit (most requests)
       ↓
       Returns cached JSON with ETag headers
       ↓
       App caches locally + renders carousel
```

### File Organization Patterns

**Configuration Files:**

- All config files at the repo root, single-purpose:
  - `astro.config.mjs` — Astro config (integrations, i18n, build, image)
  - `tailwind.config.ts` — Brand tokens, theme extensions, content globs
  - `tsconfig.json` — Strict mode, path aliases (`@/*` → `src/*`)
  - `keystatic.config.ts` — Admin UI schema (mirrors `src/content/config.ts`)
  - `vitest.config.ts` — Test runner config
  - `lighthouse/lighthouserc.cjs` — Lighthouse CI thresholds (lives in `lighthouse/` to keep root tidy)

**Source Organization:** See full tree above. The driving rule: pages compose, components implement, lib shares.

**Test Organization:**

- **Unit tests in `tests/`** at the repo root. Co-location was considered but rejected for V1 — the test surface is small (~5 utility files), keeping them in one folder makes them easier to find and run. If the test surface grows, switch to co-location per the "test files" rule in patterns.
- **No integration tests, no E2E tests** at MVP. Lighthouse CI is the only "integration" test (and it gates merges).
- **`tests/content.test.ts`** asserts the blog API JSON output shape against the documented `CONTRACT.md` schema — this is the safety net that prevents accidental breaking changes to the mobile app contract.

**Asset Organization:**

- `src/assets/` for processed images and fonts (Astro pipeline)
- `public/` for raw passthrough (favicon, robots.txt, OG images at fixed URLs)
- Per-feature asset subfolders inside `src/assets/` (`inspection-scenes/`, `blog-illustrations/`, `logos/`)

### Development Workflow Integration

**Development Server:**

- `npm run dev` starts Astro dev server at `http://localhost:4321`
- Hot module reload for `.astro`, `.tsx`, and `.css` changes
- Keystatic admin UI at `http://localhost:4321/keystatic` (dev only)
- Tailwind v4 JIT compiles classes on demand
- TypeScript checked in-editor via `astro check`

**Build Process:**

- `npm run build` runs Astro build → outputs to `dist/`
- Build pipeline:
  1. Type-check via `astro check`
  2. Bundle Astro pages and React islands via Vite
  3. Generate Content Collection types
  4. Generate static API JSON files at `dist/api/v1/blog/*`
  5. Optimize images via Astro Assets
  6. Generate sitemap, robots.txt, RSS feed
  7. Tree-shake and minify JS
  8. Output static `dist/` directory ready for CDN
- Build target time: <2 minutes for ~20 blog articles + landing page

**Deployment:**

- Push to `main` branch → Cloudflare Pages auto-detects, runs `npm run build`, deploys `dist/` to edge
- PR push → preview deployment with unique URL (e.g., `https://abc123.truvis-landing-page.pages.dev`)
- Rollback via Cloudflare Pages dashboard: select previous deployment, click "Promote to production" — <2 minutes per NFR38
- DNS: production domain CNAME to CF Pages, managed in Cloudflare DNS dashboard

**Local Environment Setup (for new contributors / Cristian on a new machine):**

1. `git clone <repo-url>`
2. `npm install`
3. `cp .env.example .env` and fill in local secrets (Loops sandbox key, etc.)
4. `npm run dev`
5. Visit `http://localhost:4321` for the site, `http://localhost:4321/keystatic` for the admin UI
6. Optional: `npm run test` to run unit tests
7. Optional: `npm run build && npm run preview` to test the production build locally


## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All technology decisions form a compatible chain with no internal conflicts:

- **Astro 5 + React 19 + Tailwind v4 + shadcn/ui** — official Astro support for shadcn/ui via the Astro install path; React 19 is the supported island runtime; Tailwind v4 is the current major version with HSL color tokens that map cleanly to Truvis brand values. The `one-ie/astro-shadcn` starter ships this combination preconfigured.
- **Cloudflare Pages + Astro static output + Cloudflare Pages Functions** — Astro emits a static `dist/` directory plus `/api/*` Pages Functions. CF Pages auto-detects Astro builds. CF Pages Functions run the `/api/waitlist` server route at request time. No server runtime needed for the rest of the site.
- **Astro Content Collections + Keystatic** — Keystatic is officially supported by Astro and provides an admin UI on top of file-based collections. Schemas are mirrored between `src/content/config.ts` (Zod) and `keystatic.config.ts` (Keystatic schema DSL). Both must stay in sync; type checking at build time catches drift.
- **Astro built-in i18n routing + JSON message files** — Astro 4+ ships native i18n routing. The `t()` helper in `src/lib/i18n.ts` consumes JSON namespace files. No external i18n library, no version conflicts.
- **Plausible (cookieless) + vanilla-cookieconsent (inactive)** — because Plausible doesn't use cookies, the consent banner is not legally required for V1. The banner code is wired but disabled via env flag, ready to activate the moment we add any non-essential cookies (e.g., paid retargeting in Phase 2). No conflict, no UX friction at V1.
- **Loops + server-side Astro API route** — the API key stays on the server (CF Pages Functions environment), the client never sees it. The waitlist form is a React island that POSTs to `/api/waitlist`; the server route validates Turnstile + honeypot + email format and proxies to Loops. Three layers of decoupling.
- **nanostores + React islands** — Astro-team-recommended for cross-island state. Works only at runtime in hydrated islands (not at SSG time), which matches our use cases (cookie consent state, mobile nav drawer, current scene).
- **Sentry (EU) + Astro SDK** — official Astro Sentry integration handles client errors, build errors, and source map upload. EU region for GDPR data residency.

No contradictory decisions identified.

**Pattern Consistency:**

- **Naming conventions** are internally consistent: `kebab-case` for files, `PascalCase` for component exports (with the documented exception for shadcn primitives), `camelCase` for content collection fields, `snake_case` for analytics events, `dot.notation` for translation keys, `UPPER_SNAKE_CASE` for env vars, `$camelCase` for nanostore prefixes.
- **The snake_case → camelCase boundary** doesn't actually exist in this project (everything is camelCase end-to-end on the web side), but the pattern document explicitly notes this and tells agents to expect camelCase throughout.
- **Hydration directive policy** (`client:visible` default, `client:idle` for above-fold non-critical, `client:load` only for above-fold conversion-critical) is unambiguous and enforceable in code review.
- **Three-tier component hierarchy** maps cleanly to folder structure (`components/ui/`, `components/sections/`, `pages/`).
- **Single source of truth helpers** (`lib/launch-phase.ts`, `lib/content.ts`, `lib/i18n.ts`, `lib/analytics.ts`, `lib/structured-data.ts`, `lib/date.ts`) prevent the most common drift point — multiple agents implementing the same logic differently in different places.

**Structure Alignment:**

- **`src/pages/` is thin** — file-based routes contain only composition and prop wiring. Logic lives in `src/components/`, `src/lib/`, or `src/content/`. This matches Astro's idioms and the "pages compose, components implement, lib shares" rule.
- **Islands isolated to `src/components/islands/`** — makes hydration cost visually obvious and enforces the discipline that anything outside this folder ships zero JS.
- **`/api/v1/blog/*` endpoints live in `src/pages/api/v1/blog/`** — Astro file-based routing automatically generates the URLs from the file paths, so the URL structure and the source structure are isomorphic.
- **Translation files mirror namespace structure** — `src/i18n/{locale}/{namespace}.json` matches the `t('namespace.section.element', locale)` API.
- **Content Collection access boundary** is `src/lib/content.ts` — no `getCollection()` calls outside this file. Forces consistent filtering, sorting, and phase-awareness.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (FR1–FR56):**

| FR Range | Domain | Architectural Support |
|---|---|---|
| FR1–FR11 | Landing Page Conversion Surface | `src/pages/index.astro` composes section components. `LAUNCH_PHASE` env var + `isPostLaunch()` helper switches between waitlist content (pre-launch FR4, FR7) and app store / ratings / live stats content (post-launch FR8–FR10) without code change. Social media links (FR11) in footer section. |
| FR12 | Submit email | `WaitlistForm` island POSTs to `/api/waitlist`. |
| FR13 | Email validation + error messages | Client: HTML5 + regex on blur and submit. Server: validation in `/api/waitlist` with typed error codes (`invalid_email`, `duplicate_subscriber`, etc.). |
| FR14 | Double opt-in confirmation email | Loops handles double opt-in flow natively when contact is added via API. |
| FR15 | Drip series enrollment | Loops drip series authored entirely in Loops dashboard. The contact added by `/api/waitlist` automatically enters the configured series. |
| FR16 | Unsubscribe in every email | Loops adds unsubscribe link to every email automatically per ESP best practices. |
| FR17 | Micro-survey on confirmation | `MicroSurvey` island on `/waitlist-confirmed` page. Submits to `/api/waitlist` (or a dedicated `/api/micro-survey`) which updates the Loops contact custom field for drip segmentation. |
| FR18–FR22 | Blog UI + structured data | Content Collections (`src/content/blog/`), `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, JSON-LD generated by `lib/structured-data.ts` and embedded in the blog layout. |
| FR23 | Blog API for mobile | Static JSON at `/api/v1/blog/posts.json` with documented schema in `CONTRACT.md`. |
| FR24 | API filtering | Mobile app filters client-side from the cached payload. The full list endpoint enables this without server-side filtering. |
| FR25 | Rate-limited API access | Cloudflare WAF rate limit at edge (e.g., 100 req/min per IP). |
| FR26 | Mobile app deep link to article | Each post object includes `webUrl` (absolute URL) the mobile app uses for deep linking. |
| FR27 | Blog CTAs | `blog-cta-inline.astro` component uses `isPostLaunch()` to render waitlist or app store CTA. |
| FR28 | CMS-driven blog publishing | Keystatic admin UI at `/keystatic` (dev or gated) edits markdown files in `src/content/blog/`. |
| FR29 | SEO metadata per article | Content Collection schema enforces `title`, `excerpt`, `featuredImage`, `metaDescription` (add to schema), `tags`. |
| FR30 | Pre/post toggle without code deploy | `LAUNCH_PHASE` env var in CF Pages dashboard. Toggle = update env var + retrigger build. |
| FR31 | FAQ edit without code | `src/content/faq/*.md` edited via Keystatic. |
| FR32 | Testimonials add/edit/remove | `src/content/testimonials/*.md` edited via Keystatic. Schema supports `phase: 'pre' | 'post'`. |
| FR33 | Update social proof stats | `src/content/stats/*.md` edited via Keystatic. |
| FR34 | Auto rebuild on content change | Git push to `main` triggers Cloudflare Pages auto-build (Keystatic commits via GitHub API). |
| FR35–FR38 | Analytics tracking | Plausible page views automatic. Custom events (`waitlist_signup`, `app_store_click`, `blog_cta_click`, `micro_survey_completed`) via `lib/analytics.ts`. UTM params auto-captured by Plausible. Micro-survey aggregated in Loops dashboard (segments) + a Plausible custom event for raw count. |
| FR39 | Analytics dashboard | Plausible web dashboard. No custom dashboard built. |
| FR40 | XML sitemap | `@astrojs/sitemap` integration in `astro.config.mjs`, regenerated on every build. |
| FR41 | Structured data markup | `lib/structured-data.ts` generates JSON-LD for `Organization`, `WebSite`, `BlogPosting`, `FAQPage`. Embedded in BaseLayout and BlogLayout. |
| FR42 | Canonical URLs | `lib/seo.ts` generates canonical URL meta tag per page. |
| FR43 | robots.txt | `public/robots.txt` (or `@astrojs/sitemap` autogen). |
| FR44 | Image alt text + lazy loading | `<Image>` from `astro:assets` requires `alt` prop. Below-fold images get `loading="lazy"` by default. |
| FR45–FR46 | Cookie consent banner | `cookie-consent.tsx` island wired but inactive at V1 because Plausible is cookieless and no other non-essential cookies are set. Activated by env flag. |
| FR47 | Privacy policy page | `src/pages/privacy.astro`. |
| FR48 | Double opt-in for email | Handled by Loops natively (decision 3a). |
| FR49 | Right to erasure | Documented user-facing process on `privacy.astro`: contact email triggers manual removal from Loops via the dashboard. **Important gap noted below** — for V1 manual is acceptable, but the privacy policy must clearly document the process. |
| FR50–FR52 | i18n architecture | Astro built-in i18n routing in `astro.config.mjs`, `lib/middleware/locale-detection.ts` for browser language detection, `src/i18n/{locale}/*.json` for externalized strings. V1 ships English content only; FR/DE structure exists. |
| FR53–FR55 | Pre/post-launch transition | `LAUNCH_PHASE` env var + `lib/launch-phase.ts` helper. Both variants designed and built into the same codebase. Toggle is a CF Pages env var change + redeploy (~2 min). Analytics events transition: `waitlist_signup` (pre) and `app_store_click` (post) tracked separately so the funnel report shows both phases. URLs, page titles, meta descriptions stay stable. |
| FR56 | Branded 404 page | `src/pages/404.astro` with navigation back to landing page and blog. |

All 56 functional requirements have explicit architectural support.

**Non-Functional Requirements Coverage (NFR1–NFR40):**

| NFR | Requirement | Architectural Support |
|---|---|---|
| NFR1 | LCP <2.5s on 4G | Astro SSG + CF CDN + image optimization + `client:visible` discipline + Lighthouse CI gate at LCP <2.5s |
| NFR2 | FID <100ms | Minimal JS by default (Astro islands), only conversion-critical hero island uses `client:load` |
| NFR3 | CLS <0.1 | `<Image>` requires `width`/`height`, no layout-shifting fonts (font-display: swap with subset), Lighthouse CI gate |
| NFR4 | TTFB <200ms | CF Pages edge cache (~40-50ms in EU, well under target) |
| NFR5 | <500KB initial weight | Astro zero-JS default + `client:visible` lazy hydration + image optimization + Tailwind purging + tree-shaken islands; Lighthouse CI tracks bundle size |
| NFR6 | Lighthouse Perf >90 | Lighthouse CI hard gate in PR checks |
| NFR7 | <2s on 3G | Same as NFR1–NFR5 — minimal critical path, CDN edge delivery |
| NFR8 | Blog API <300ms | Static JSON served from CDN edge cache (no compute, no DB) |
| NFR9 | Stats widget <500ms | CF Worker + KV cache (post-launch only) |
| NFR10 | HTTPS/TLS 1.2+ | Cloudflare TLS 1.3 by default, HSTS, automatic cert |
| NFR11 | Email transmission encrypted | Loops API is HTTPS, server-side only |
| NFR12 | No client-side credentials | All secrets in CF Pages env vars (server-only). Client bundle has zero secrets. |
| NFR13 | Cookie consent client-side | `localStorage`-based, no server tracking before consent |
| NFR14 | Blog API rate-limited | CF WAF rate limit at edge |
| NFR15 | Anti-spam without friction | Cloudflare Turnstile (invisible) + honeypot field |
| NFR16 | Static content via CDN | Cloudflare Pages global edge |
| NFR17 | Email submissions queued/retried | Loops handles retry; if Loops API itself is down, `/api/waitlist` returns a typed error and the form preserves user input + shows retry toast |
| NFR18 | Blog API 100 concurrent <300ms p95 | CDN edge cache trivially handles this — static JSON has effectively unlimited concurrency |
| NFR19–NFR26 | WCAG 2.1 AA, contrast, keyboard, screen reader, focus, labels, Lighthouse a11y >90, 40% text expansion | Radix primitives in shadcn provide ARIA + keyboard nav. Semantic HTML + skip link in BaseLayout. ESLint a11y plugin. Lighthouse CI gate. Layout testing rule documented in patterns. |
| NFR27 | ESP integration with double opt-in + drip + unsubscribe via API | Loops decision 3a |
| NFR28 | Analytics async, non-blocking | Plausible script is async + lightweight (<1KB) |
| NFR29 | Analytics consent-aware | Cookieless Plausible doesn't require consent; no other tracking scripts at V1 |
| NFR30 | Content publish → rebuild + deploy <5 min | Git push → CF Pages auto-build (1-2 min) → deploy (30s) → live (~3 min worst case) |
| NFR31 | Blog API additive-only | Documented in `CONTRACT.md` + `tests/content.test.ts` validates JSON shape |
| NFR32 | Stats API cached 24h freshness | CF Worker cron writes to KV; Pages Function reads KV with 24h TTL (post-launch) |
| NFR33 | ≥99.9% uptime SLA | Cloudflare Pages SLA |
| NFR34 | Email form graceful degradation | `/api/waitlist` returns typed error, form preserves input + shows retry toast (decision 3b error handling) |
| NFR35 | Stats widget graceful degradation | KV serves last-known-good if upstream fetch fails (post-launch) |
| NFR36 | Blog API graceful degradation if CMS unreachable | Automatic — there is no runtime CMS to fail. Content is static JSON pre-rendered at build time. |
| NFR37 | Build/email/API alerting | Sentry for client errors + CF Pages email alerts for build failures + Loops dashboard for email delivery health |
| NFR38 | Rollback <2 min | Cloudflare Pages "Promote previous deployment" button |
| NFR39 | Lighthouse SEO >95 | Lighthouse CI hard gate |
| NFR40 | Brand voice content quality | Keystatic schema field descriptions reference brand voice guidelines; manual editorial review by Cristian; not automatable. |

All 40 non-functional requirements have explicit architectural support.

### Implementation Readiness Validation ✅

**Decision Completeness:**

- All critical decisions documented with current technology versions (verified via web search in steps 3 and 4: Astro 5, React 19, Tailwind v4, Plausible Cloud, Loops, Cloudflare Pages, Sentry Astro SDK, Keystatic, vanilla-cookieconsent v3).
- Each decision includes Decision / Rationale / Affects fields, plus alternatives considered for the high-stakes choices.
- 14 critical-and-important decisions made; 6 deferred decisions explicitly listed with rationale.

**Structure Completeness:**

- Full directory tree specified down to individual filenames.
- All 11 lib utility files defined with their responsibilities.
- All 7 nanostore files defined.
- All 5 content collections specified with Zod schema fields.
- All blog API endpoints specified with file paths and JSON schema.
- All form/island/section components enumerated.
- Test files listed (Vitest, lib utilities only).
- Lighthouse CI config + budget files specified.

**Pattern Completeness:**

- 15 enforced rules listed under "All AI Agents MUST"
- Anti-pattern table with 16 forbidden patterns and their correct counterparts
- Pattern enforcement mechanisms specified (TypeScript strict, `astro check`, ESLint, prettier-tailwindcss, Lighthouse CI, code review)
- Concrete code examples for: Hero CTA Astro component, React island with proper hydration, blog API endpoint
- Hydration directive policy explicitly addresses the #1 perf budget risk for AI agents

### Gap Analysis Results

**Critical Gaps:** None identified.

**Important Gaps (non-blocking, surfaced for awareness):**

1. **Right-to-erasure user-facing process (FR49)** — V1 architecture delegates erasure to "Loops dashboard or contact email," which is acceptable for solo-dev MVP but the actual user-facing process must be documented in `src/pages/privacy.astro` so visitors know how to request deletion. **Resolution:** Add an explicit `### Right to Erasure` section to the privacy policy content with a contact email and a 30-day SLA. This is content work, not architectural, but it's noted here so it doesn't slip.

2. **Email deliverability DNS records (SPF/DKIM/DMARC)** — Cross-cutting concern #10 from Step 2 surfaces this as a process concern, but no architectural artifact captures the specific DNS records needed at the domain registrar. **Resolution:** Add a `LAUNCH-CHECKLIST.md` to the repo root listing the required DNS records (Loops will provide the exact values during setup), to be configured before the first batch send. Becomes part of Story 17 (Final QA + launch checklist).

3. **Analytics goal naming continuity across pre/post-launch transition (FR55)** — The pattern document specifies `waitlist_signup` (pre) and `app_store_click` (post) as separate events. For Plausible "goal" reporting across the launch transition, the question is whether these are separate goals (cleaner separation) or a single unified goal (continuous funnel). **Resolution:** Recommend two separate goals in Plausible — `Waitlist Signup` and `App Store Click` — with both visible on the dashboard to show the launch-day cutover clearly. Documented as a configuration decision in Story 12.

4. **Locale detection middleware execution context** — Astro middleware runs at the edge for SSR routes but not for fully-static SSG routes. Since our locale routing depends on a one-time redirect from `/` to `/en/` (or future `/fr/`, `/de/`) based on Accept-Language, this needs to be handled at the Cloudflare Pages Functions layer, not Astro middleware. **Resolution:** Implement locale detection as a CF Pages Function (`functions/_middleware.ts`) instead of Astro middleware. This is a small implementation detail to validate in Story 4 (i18n routing setup), not an architectural blocker.

**Nice-to-Have Gaps:**

1. **Image art-direction strategy for the sticky-phone scenes** — Mobile vs desktop will need different framing of the same scene. The architecture doesn't specify whether we use Astro's built-in `<Picture>` for art direction or two separate `<Image>` components with CSS visibility. **Resolution:** Defer to Story 7 (inspection story scroll) where the choice has local context.

2. **Brand voice review checklist** — Pattern document mentions brand voice consistency as a content concern but doesn't provide a checklist authors can run against. **Resolution:** Add a brief brand voice cheat sheet to `CONTRACT.md` or Keystatic field descriptions in Story 3.

3. **Dark mode token strategy** — Deferred to V1.1 per UX spec, but no tokens are specified. **Resolution:** Acceptable to defer; tokens added in V1.1 if dark mode ships.

### Validation Issues Addressed

All four important gaps have proposed resolutions documented above. None block implementation; all are tracked in the implementation sequence (Story 4, 12, 17) or as content tasks (privacy policy, brand voice cheat sheet).

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (56 FRs across 11 domains, 40 NFRs across 10 categories)
- [x] Scale and complexity assessed (Medium — static web app with strict perf and i18n constraints)
- [x] Technical constraints identified (11 constraints documented in Step 2)
- [x] Cross-cutting concerns mapped (10 concerns documented in Step 2)

**✅ Architectural Decisions**

- [x] Critical decisions documented with verified versions
- [x] Technology stack fully specified (Astro 5, React 19, Tailwind v4, shadcn/ui, Cloudflare Pages, Loops, Plausible, Keystatic, Sentry, nanostores, vanilla-cookieconsent)
- [x] Integration patterns defined (ESP via server route, blog API as static JSON, stats via CF Worker post-launch)
- [x] Performance considerations addressed (SSG + CDN + island hydration discipline + Lighthouse CI gate)

**✅ Implementation Patterns**

- [x] Naming conventions established (files, components, content fields, API endpoints, translations, events, env vars, nanostores)
- [x] Structure patterns defined (three tiers, islands isolation, image vs assets, JSON-LD centralization)
- [x] Communication patterns specified (hydration directives, nanostore actions, form submission, error handling)
- [x] Process patterns documented (error handling layers, loading states, image loading, accessibility, i18n, pre/post toggle, content access)
- [x] 15 enforced "MUST" rules + 16 anti-patterns

**✅ Project Structure**

- [x] Complete directory structure defined (full tree with file-level detail)
- [x] Component boundaries established (three-tier hierarchy, islands isolation, content access boundary)
- [x] Integration points mapped (Loops, Plausible, Sentry, Turnstile, CF Pages, GitHub, Keystatic, Truvis backend)
- [x] Requirements to structure mapping complete (FR domains → file locations table, NFR domains → architectural support table)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**

- **Performance budget enforced as a build-time gate** via Lighthouse CI, not a hope. The biggest risk to a marketing site (perf drift) is structurally addressed.
- **Zero runtime backend dependencies** — content is build-time, blog API is static JSON, no CMS to fail at runtime, no database to scale. NFR36 satisfied automatically rather than via fallback logic.
- **Clear separation between code and content** — Cristian can publish, edit, and tune content without touching code. CMS toggle = env var. Content change = git commit + auto-deploy.
- **Cookieless analytics eliminates GDPR friction** — Plausible's choice removes the cookie consent banner from V1 entirely, simplifying both UX and compliance.
- **Strict hydration directive policy** prevents the most common AI-agent perf mistake (defaulting to `client:load`).
- **Single source of truth helpers** (`lib/launch-phase.ts`, `lib/content.ts`, `lib/i18n.ts`, `lib/analytics.ts`, `lib/structured-data.ts`, `lib/date.ts`) prevent agent drift on the most-touched concerns.
- **Cross-platform contract is explicit** (`CONTRACT.md` + `tests/content.test.ts`) — accidentally breaking the mobile app blog carousel is structurally hard.
- **Open-source starter (`one-ie/astro-shadcn`) front-loads the highest-cost work** — shadcn/ui setup, Tailwind v4 config, blog system, SEO baseline — all preintegrated.
- **Design DNA mirrored from mobile app** — same color tokens, spacing grid, component tier model, brand voice. Cross-platform consistency baked into the architecture.

**Areas for Future Enhancement:**

- **A/B testing infrastructure** (Phase 2) — would require activating the cookie consent banner; architecture is ready.
- **Self-hosted Plausible** if traffic volume justifies — straightforward swap, no architectural change.
- **Hosted Keystatic Cloud admin UI** if a non-developer content author joins — Keystatic supports this natively.
- **Headless CMS migration** (Sanity, Storyblok) if file-based content authoring becomes a bottleneck — markdown → CMS import is a one-time script.
- **Stats widget infrastructure** (CF Worker + KV) — designed but not built; activated at V1.1 launch.
- **Dark mode tokens** — deferred to V1.1, infrastructure (CSS custom properties) already in place via shadcn/ui defaults.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented in this file.
- Use implementation patterns consistently across all components — see the 15 "MUST" rules in the Patterns section.
- Respect project structure and boundaries — pages compose, components implement, lib shares.
- Use the centralized helpers (`lib/launch-phase.ts`, `lib/content.ts`, `lib/i18n.ts`, `lib/analytics.ts`, `lib/structured-data.ts`, `lib/date.ts`) — never duplicate their logic.
- Default to `client:visible` for islands. Use `client:load` only for above-fold conversion-critical components.
- Schema changes to `/api/v1/blog/*` are additive only. Document any change in `CONTRACT.md`.
- Refer to this document for all architectural questions.

**First Implementation Priority:**

```bash
git clone https://github.com/one-ie/astro-shadcn truvis-landing-page
cd truvis-landing-page
rm -rf .git && git init
npm install
npm run dev
```

Then run the pre-init verification checklist from the Starter Template Evaluation section before adding any custom code:

1. Confirm `LICENSE` is permissive (MIT/Apache/BSD)
2. Confirm `package.json` last commit is recent (~6 months)
3. Audit `package.json` for unwanted heavy deps; prune
4. Run `npm run build && npx lighthouse` to confirm the starter's baseline matches its README claims

The first implementation story is project initialization (Story 1 in the Decision Impact Analysis section). The remaining 16 stories follow the dependency order documented there.
