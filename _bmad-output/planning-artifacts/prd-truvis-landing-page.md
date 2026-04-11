---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: web_app
  domain: automotive_consumer_marketing
  complexity: medium
  projectContext: greenfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-truvis-landing-page.md
  - _bmad-output/planning-artifacts/research/market-car-inspection-companion-app-research-2026-02-18.md
  - _bmad-output/project-context.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 1
  projectDocs: 1
  brainstorming: 0
---

# Product Requirements Document - Truvis Landing Page

**Author:** Cristian
**Date:** 2026-04-07

## Executive Summary

The Truvis landing page is a conversion-optimized web presence that serves as the primary acquisition channel for Truvis — a mobile app that guides used-car buyers through vehicle inspections with severity scoring, model-specific intelligence, and behavioral guardrails. The landing page operates in two phases: pre-launch, it captures a waitlist of high-intent buyers through SEO content and an email drip series that delivers immediate value; post-launch, it becomes the download funnel, reinforced by real user stories and inspection success data.

The page targets buyers already searching for guidance — people Googling "how to inspect a used car" or "used car red flags" — and meets them with authority, free value, and the same 70/30 Inspector/Ally personality they'll find in the app. There is no expectation gap between the website and the product. The tone, the trust, and the expertise carry straight through from first scroll to first app session.

The landing page enters a market where zero consumer-facing guided inspection tools own the online conversation. It doesn't need to win a comparison — it defines a new category. Organic SEO, social media content, influencer partnerships, and paid acquisition feed the funnel, while the email drip series nurtures visitors into users before the app ships.

### What Makes This Special

No competitor owns the "guided car inspection for buyers" conversation online. Carfax sells history reports. Lemon Squad dispatches human inspectors. OBD2 apps require hardware dongles. Nobody is speaking directly to the anxious buyer at the earliest moment of uncertainty — when they're searching for help, not a product. The landing page captures that intent and builds trust through free value before asking for anything in return.

The brand voice is the differentiator on the web. Where competitor marketing is corporate and transactional, Truvis speaks like a trusted friend who happens to know everything about cars — steady authority when explaining risks, conspiratorial warmth when it's just you and the app. This personality starts on the landing page, not in the app store. By the time a visitor installs, they already know what Truvis sounds like.

The content strategy compounds: blog articles build SEO authority, social content drives traffic, the email drip series converts over time, and post-launch user stories feed back into all channels. Each layer reinforces the others, driving acquisition costs toward zero for organic visitors.

## Project Classification

| Field | Value |
|-------|-------|
| **Project Type** | Web application (static site with blog and dynamic elements) |
| **Domain** | Automotive consumer marketing |
| **Complexity** | Medium — SEO, i18n-ready architecture, GDPR compliance, email automation, analytics, but no safety-critical or heavily regulated systems |
| **Project Context** | Greenfield — new web property, independent of the existing Expo mobile app codebase |

## Success Criteria

### User Success

Visitors searching for used-car buying guidance find exactly what they're looking for on the Truvis landing page — actionable advice, not a sales pitch. The content answers their immediate question (how to inspect, what to watch for, how to negotiate) while positioning Truvis as the tool that makes it effortless. A successful visitor thinks "this is exactly what I needed" before they ever see a signup form.

- Bounce rate <40% for organic search visitors (page matches search intent)
- Average time-on-page >3 minutes for blog articles (readers engage deeply, not skimming)
- Blog readers engage with at least 2 articles per session on average
- Email drip subscribers stay engaged through the full series (unsubscribe rate <1% per email)
- Waitlist confirmation micro-survey captures visitor intent ("What brought you here today?") — validates we're attracting the right audience

### Business Success

**Pre-Launch (Waitlist Phase)**

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Waitlist signups | 1,000+ | Before launch day |
| Email capture rate | >3% of unique visitors | Ongoing |
| Blog organic traffic | 500+ monthly sessions | Within 3 months of first publish |
| Drip series open rate | 30-40% | Per email |
| Drip series click-through | 3-5% | Per email |
| Drip series unsubscribe rate | <1% | Per email |
| Drip series completion rate | >60% | Subscribers reaching final email |
| Email forward/share rate | Tracked as leading indicator | Ongoing |
| SEO keyword rankings | Page 1 for 2+ target keywords | Within 6 months of blog launch |
| Domain authority | DA 15+ | Within 6 months |

**Post-Launch (Download Phase)**

| Metric | Target | Timeframe |
|--------|--------|-----------|
| App store click-through rate | >3% of landing page visitors | Ongoing |
| Launch-day waitlist activation | 15-25% of active subscribers click to app store | Launch day |
| Blog-to-download conversion | >1% of blog readers | Ongoing |
| User stories engagement | Most-read blog category | Within 6 months |
| Organic search traffic share | 30%+ of total traffic | Within 6 months |

### Technical Success

- All Core Web Vitals pass (see NFR1-NFR7 for specific targets)
- Lighthouse SEO >95 (NFR39), Accessibility >90 (NFR25), Performance >90 (NFR6)
- Zero downtime during pre-launch to post-launch transition (content swap, not rebuild)
- Email delivery rate >98% (no spam folder issues)
- GDPR-compliant from day one — cookie consent, explicit opt-in, privacy policy

### Measurable Outcomes

The landing page is working when: the waitlist grows steadily pre-launch, the drip series keeps subscribers warm (>60% completion rate), and on launch day a significant portion of the active list converts to downloads. Post-launch, organic traffic compounds month-over-month as blog content matures and SEO rankings climb, driving acquisition cost per user toward zero for organic visitors. The micro-survey confirms we're attracting high-intent buyers, not casual browsers.

## Product Scope

### In Scope

- **MVP (V1):** Conversion-optimized landing page (hero, problem, features, social proof, FAQ, footer), blog infrastructure with headless CMS, email waitlist capture with drip series, pre/post-launch content toggle, analytics with UTM support, GDPR compliance (cookie consent, double opt-in, privacy policy), i18n-ready URL architecture (English only at launch), responsive mobile-first design, SEO fundamentals, social media link integration, 5-8 seed blog articles
- **V1.1 (Post-Launch):** App store download buttons, user testimonials/stories, live inspection statistics widget, app store ratings showcase
- **V1.2 (Internationalisation):** French and German language support for landing page and blog

### Out of Scope

- User accounts or login functionality on the web
- In-browser inspection tools or demos
- Payment processing or subscription management
- Community forum or user-generated content
- B2B / "For Professionals" features
- Native mobile landing page (the app IS the mobile experience)

See **Project Scoping & Phased Development** for the complete MVP feature set, phased roadmap, and risk mitigation strategy.

## User Journeys

### Journey 1: Marco — The Anxious First-Time Buyer

**Who:** Marco, 28, software developer in Lisbon. Saving for his first car. Has never inspected a vehicle in his life. His budget is tight — €8,000 max — and he knows a bad purchase could set him back years.

**Opening Scene:** It's 11pm on a Tuesday. Marco found a promising Seat Ibiza on OLX for €7,200. The listing looks good, but something nags him. He Googles "what to check when buying a used car" and clicks a result titled "The 7 Red Flags That Cost Used-Car Buyers Thousands."

**Rising Action:** The article is genuinely useful — not a generic checklist, but specific, opinionated guidance written like a friend who knows cars. Marco reads through it, bookmarks it, then notices the sidebar: "Truvis — the app that puts a car inspector in your pocket." He clicks through to the landing page. The hero hits him immediately: "Used-car buyers lose an average of €640 to issues they didn't catch." That's almost 10% of his budget. He scrolls. The problem section describes his exact anxiety. The features section shows him things he didn't know existed — a severity calibrator that tells him what's serious vs. cosmetic, a model DNA briefing that knows Seat Ibiza weak points, a negotiation report he can use to push the price down.

**Climax:** Marco reaches the waitlist section. He's not being asked to pay. He's being asked for his email in exchange for a free drip series on how to inspect a used car — the exact thing he was searching for. He signs up. The confirmation page asks: "What brought you here today?" He selects "Looking for inspection tips."

**Resolution:** Over the next two weeks, Marco receives 5 emails — each one teaching him something specific about inspections, each one referencing Truvis features that would make the process easier. By the time the app launches, Marco doesn't just download it — he's been waiting for it. He uses Truvis on the Seat Ibiza and catches a suspension issue the seller didn't disclose. He negotiates €900 off the price. Marco tells two friends about the app before the week is out.

**Requirements revealed:** SEO-optimized blog content, landing page hero with financial hook, feature showcase, email capture with drip series integration, waitlist confirmation micro-survey, mobile-responsive design, clear CTA flow from blog → landing page → signup.

---

### Journey 2: Elena — The Skeptical Burned Buyer

**Who:** Elena, 38, marketing manager in Dublin. Two years ago she bought a BMW 3 Series that turned out to have a hidden gearbox issue — €2,800 repair within three months. She swore she'd never go in blind again. She's now looking for a Volkswagen Golf for her daily commute.

**Opening Scene:** Elena is scrolling through Google results for "how to avoid buying a bad used car." She's already tried one of those generic PDF checklists — useless. She clicks a Truvis blog article titled "How I Avoided a €3,000 Repair by Knowing What to Look For" (post-launch, this is a real user story; pre-launch, it's a scenario-based article).

**Rising Action:** Elena reads the article with her arms crossed. She's heard promises before. But the article is specific — it mentions exact things to check on the model she's considering, references real repair costs, and doesn't try to sell her anything in the first 800 words. At the bottom, there's a link: "Want this level of guidance on your phone, at the car?" She clicks through to the landing page. She scans quickly — she's not the type to read every word. She sees "Only 2% of buyers trust dealerships" and thinks "damn right." She sees the six features and pauses on Poker Face Mode — the idea that the app shows her the real findings privately while showing the seller a neutral checklist. That's the feature that hooks her. Someone *understands* what it's like to stand in front of a seller and feel exposed.

**Climax:** Elena is interested but not ready to commit. She doesn't sign up immediately. She reads the FAQ — "Is this a replacement for a mechanic?" (No, it's a first line of defence). "What data do you collect?" (GDPR-compliant, minimal, explained clearly). The transparency earns her trust. She signs up for the waitlist.

**Resolution:** Elena receives the drip series but only opens 3 of 5 emails — she's busy. But the subject lines are good enough that she remembers the brand. When she sees the launch email, she downloads immediately. She uses Truvis on three Golfs before buying one. The negotiation report saves her €450. She shares the app with her sister, who's also car shopping.

**Requirements revealed:** Blog content that earns skeptical readers' trust (no hard sell early), Poker Face Mode as a conversion-driving feature in the showcase, transparent FAQ section addressing privacy and scope, GDPR compliance visible and clear, drip series with compelling subject lines (content must work even if not every email is opened), post-launch user stories section.

---

### Journey 3: Dani — The Social Visitor Caught by a TikTok

**Who:** Dani, 22, university student in Amsterdam, scrolling TikTok at midnight. Not actively car shopping yet, but thinking about getting a car after graduation in a few months.

**Opening Scene:** Dani sees a 45-second TikTok: "This car has 3 hidden red flags — would you buy it?" The video walks through a used car inspection, pointing out things Dani never would have noticed — mismatched paint on the door frame, a suspicious coolant smell, uneven tire wear. The caption says "Truvis — your pocket car inspector" with a link in bio.

**Rising Action:** Dani clicks the link. The landing page loads fast on mobile. The hero doesn't assume Dani knows anything about cars — it leads with the problem ("Buying a used car blind costs buyers an average of €640") and immediately makes it personal. Dani scrolls past the features section quickly — too detailed for now — but the social proof section catches their eye: the market statistics feel real, not fabricated. Dani thinks "I should remember this for when I'm actually buying."

**Climax:** Dani isn't ready for the waitlist. But the blog section on the landing page shows an article title that matches their curiosity: "What to Check When Buying Your First Car — A Complete Guide for Beginners." Dani clicks, reads half the article, and bookmarks it.

**Resolution:** Three months later, Dani is actively shopping. They remember Truvis — partly from the bookmarked article, partly because they've seen two more TikToks since. This time they sign up for the waitlist (or download the app if post-launch). The initial TikTok visit planted a seed; the blog content and repeated social exposure converted them over time.

**Requirements revealed:** Fast mobile load time (<2s on 3G), landing page that works for low-intent visitors (not just high-intent searchers), blog content visible on the landing page itself (not buried), social media link integration, UTM tracking for social traffic attribution, content that serves beginners without alienating experienced buyers.

---

### Journey 4: Sofia — The Referral Visitor

**Who:** Sofia, 34, accountant in Milan. Her colleague Marco (Journey 1) just used Truvis to inspect a car and won't stop talking about it. He shares the Truvis inspection report link in their office WhatsApp group.

**Opening Scene:** Sofia clicks the shared inspection report link. She lands on a page that shows the inspection summary — severity scores, findings, the negotiation brief. It's impressive. There's a banner at the top: "This report was generated with Truvis. Want this for your next car purchase?"

**Rising Action:** Sofia clicks through to the main landing page. She already has social proof — Marco's excitement — so she skips the problem section and heads straight to the features. She spends time on the Model DNA Briefing (she's considering a Fiat 500, known for electrical quirks) and the Personal Risk Calibration (she has a strict budget). The page confirms what Marco told her: this is a real tool, not a gimmick.

**Climax:** Sofia signs up for the waitlist (or downloads, post-launch) within 2 minutes of landing. She doesn't need the drip series to be convinced — Marco already did that. But she signs up for it anyway because the "used car buyer's guide" email series sounds useful for her specific situation.

**Resolution:** Sofia becomes a user on her own terms. She later shares her own inspection report with her brother. The referral loop compounds.

**Requirements revealed:** Shareable inspection report pages (post-launch, linked from the app), clear CTA on report pages back to the main landing page, landing page that works for both cold visitors and warm referrals, fast path to signup for high-intent visitors (don't force them through the full scroll).

---

### Journey 5: Content Admin — Keeping the Engine Running

**Who:** Cristian (or a future content manager). Responsible for publishing blog articles, updating landing page content, monitoring analytics, and managing the pre-to-post-launch transition.

**Opening Scene:** It's Monday morning. Cristian needs to publish a new blog article targeting "used car negotiation tips," check last week's waitlist signups, review drip series performance, and update the FAQ with a new question that came in via social media.

**Rising Action:** Cristian logs into the CMS/admin interface. The blog editor supports markdown with SEO metadata (title tag, meta description, Open Graph image). He publishes the article, sets the canonical URL, and tags it with target keywords. He then checks the analytics dashboard — waitlist signups are tracking at 3.5% capture rate, blog traffic is up 12% week-over-week, and the latest drip email had a 34% open rate. One article is underperforming — he makes a note to update the title and meta description.

**Climax:** App launch is next week. Cristian initiates the pre-to-post-launch transition: swap waitlist CTA for app store buttons, replace market statistics with real user testimonials (3 stories ready), enable the live inspection statistics widget, and add app store ratings. This is a content configuration change, not a code deployment.

**Resolution:** The transition takes 30 minutes. The landing page is now in post-launch mode. Analytics continue tracking seamlessly with new conversion events (app store clicks replacing waitlist signups). No downtime, no broken links, no lost SEO equity.

**Requirements revealed:** CMS or headless content management for blog articles, SEO metadata fields per article, analytics dashboard or integration (Google Analytics, Plausible, or similar), drip series performance visibility, content toggle/feature flag system for pre/post-launch transition, ability to update FAQ, testimonials, and statistics without code deployments.

---

### Journey Requirements Summary

| Capability | Revealed By |
|-----------|-------------|
| SEO-optimized blog with CMS | Marco, Elena, Dani, Admin |
| Email waitlist capture + drip series | Marco, Elena |
| Landing page hero with financial hook | Marco, Dani |
| Feature showcase (6 capabilities) | Marco, Elena, Sofia |
| Social proof section (stats → testimonials) | Elena, Dani |
| FAQ section (transparent, trust-building) | Elena |
| GDPR compliance (visible, clear) | Elena |
| Mobile-first fast-loading design | Dani |
| UTM + analytics tracking | Dani, Admin |
| Micro-survey on confirmation page | Marco |
| Shareable inspection report pages | Sofia |
| Fast signup path for high-intent visitors | Sofia |
| Content management without code deploys | Admin |
| Pre/post-launch content toggle system | Admin |
| Blog visibility on landing page | Dani |
| Social media link integration | Dani |
| Drip series with strong subject lines | Elena |

## Domain-Specific Requirements

### Compliance & Regulatory

- **GDPR (EU):** Cookie consent banner, explicit email opt-in (double opt-in recommended for EU), privacy policy, right to erasure for waitlist subscribers, data processing documentation. Target markets include EU countries — GDPR is non-negotiable from day one.
- **ePrivacy Directive:** Email marketing requires explicit consent. Drip series must include unsubscribe link in every email. No pre-checked consent boxes.
- **Cookie Law:** Analytics and tracking cookies require informed consent before loading. Essential cookies only without consent.

### Technical Constraints

- **Email deliverability:** New domain starts with no sender reputation. SPF, DKIM, DMARC must be configured before first send. Warm up domain gradually.
- **SEO authority:** New domain starts at DA 0. Content quality + backlinks + time are the only path.
- **Data residency:** If using US-based email provider, Standard Contractual Clauses or equivalent required for EU data transfer compliance.

### Integration Requirements

- **Email service provider:** Drip series management, waitlist capture, unsubscribe handling, performance analytics (open rate, CTR, completion rate)
- **Analytics platform:** Privacy-respecting, GDPR-compliant — consider Plausible or Fathom as alternatives to Google Analytics
- **Headless CMS:** Blog content must be served via API to both the web landing page and the Truvis mobile app (home screen carousel, epic 11-12). Single source of truth for all blog content. Structured metadata per article: title, excerpt, featured image, category, publish date, slug.
- **Mobile app content sync:** Blog API consumed by the Expo app for home screen carousel display. Content updates reflected in-app on next refresh. Deep links from carousel items back to full articles on the web.
- **Post-launch API:** Connection to Truvis backend for live inspection statistics widget (inspections completed, money saved, bad deals avoided)

### Risk Mitigations

- **Email going to spam:** Warm up sending domain with small batches, authenticate all DNS records (SPF, DKIM, DMARC)
- **SEO penalties:** No keyword stuffing, no thin content, no duplicate content. Quality-first content strategy.
- **GDPR violations:** Implement cookie consent before any tracking loads. Double opt-in for waitlist. Privacy policy reviewed for completeness.
- **Brand voice drift:** Landing page tone drifts from app tone over time. Mitigation: documented brand voice guidelines referenced by all content creators.
- **Content sync failure:** Mobile app carousel shows stale or missing content. Mitigation: graceful fallback in app if API is unreachable, cache last-known-good content.

## Web Application Specific Requirements

### Project-Type Overview

Static site with blog — SSG (static site generation) for both the landing page and blog content. No server-side rendering needed. Content is managed via headless CMS and built at deploy time. The only dynamic elements are the email capture form (client-side API call to email provider) and the post-launch inspection statistics widget (client-side API call to Truvis backend, not real-time — fetched on page load or cached with periodic refresh).

### Browser Support

| Browser | Support Level |
|---------|--------------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile Safari (iOS) | Last 2 versions |
| Chrome Mobile (Android) | Last 2 versions |

No IE11 support. No legacy browser polyfills. Modern evergreen browsers only.

### Responsive Design

- Mobile-first approach — design for mobile, enhance for desktop
- Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- All content readable and all CTAs accessible on mobile without horizontal scrolling
- Images served in modern formats (WebP/AVIF) with responsive srcset
- Touch targets minimum 44x44px on mobile

### Performance Targets

SSG + CDN hosting makes aggressive performance targets achievable by default — no server compute on page load. See **Non-Functional Requirements NFR1-NFR9** for specific, measurable performance targets (Core Web Vitals, Lighthouse scores, API response times).

### SEO Strategy

- **Rendering:** SSG produces static HTML — fully crawlable by all search engines without JavaScript execution
- **Meta tags:** Title, description, Open Graph, Twitter Card per page and per blog article
- **Structured data:** JSON-LD for Organization, WebSite, BlogPosting, FAQ schemas
- **Sitemap:** Auto-generated XML sitemap updated on each build
- **Robots.txt:** Standard configuration allowing full crawl
- **Canonical URLs:** Set per page to prevent duplicate content issues
- **URL structure:** Clean, keyword-friendly slugs (`/blog/how-to-inspect-a-used-car`)
- **Internal linking:** Blog articles cross-link to each other and to landing page sections
- **Image SEO:** Alt text on all images, descriptive filenames, lazy loading below fold

### Accessibility

WCAG 2.1 AA compliance as baseline. Semantic HTML structure (proper heading hierarchy, landmark regions, nav elements). See **Non-Functional Requirements NFR19-NFR26** for specific, measurable accessibility targets.

### Implementation Considerations

- **Hosting:** Static hosting via CDN (Vercel, Netlify, Cloudflare Pages, or similar) — zero server management, automatic HTTPS, edge-cached globally
- **Build pipeline:** SSG build triggered on content publish from headless CMS (webhook) or on code push
- **i18n architecture:** URL-based locale routing (`/en/`, `/fr/`, `/de/`) built into SSG configuration from day one, even though only English content ships initially
- **Content/code separation:** Blog content lives in headless CMS, page structure lives in code. Content editors never touch code. Developers never write blog posts in markdown files.
- **Pre/post-launch toggle:** Environment variable or CMS-driven feature flag switches between waitlist mode and download mode without code deployment

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — deliver a complete, functional acquisition funnel that captures waitlist signups and nurtures them via email, while building SEO authority through blog content. The landing page must work end-to-end on day one: visitor arrives → reads content → signs up → receives drip series.

**Resource Requirements:** Solo developer (Cristian) working with Claude Code. Content (blog articles, drip series emails) produced in parallel by Cristian with AI assistance. No design team — use a component library or template system for consistent, professional UI.

### MVP Feature Set (Phase 1 — V1 + V1.1 Built Together)

**Core User Journeys Supported:**
- Marco (organic search → blog → landing page → waitlist signup)
- Elena (blog article → landing page → FAQ → waitlist signup)
- Dani (social link → landing page → blog → bookmark → later conversion)
- Admin (publish article → monitor analytics → manage pre/post-launch toggle)

**Must-Have Capabilities:**

| Capability | Justification |
|-----------|---------------|
| SSG landing page with hero, problem, features, social proof, FAQ, footer | Core conversion funnel — without this, nothing works |
| Blog infrastructure with headless CMS | SEO engine + mobile app content source — foundational |
| Blog content API for mobile app carousel | Cross-platform content sync (epic 11-12) — architectural dependency |
| Email waitlist capture + drip series integration | Primary conversion mechanism pre-launch |
| Waitlist confirmation page with micro-survey | Intent validation from day one |
| Pre/post-launch content toggle (feature flag) | Enables single codebase for both phases |
| Post-launch: app store buttons, user stories, live stats widget, ratings | Built alongside pre-launch, activated via toggle |
| Analytics integration with UTM support | Can't improve what you can't measure |
| GDPR compliance (cookie consent, double opt-in, privacy policy) | Legal requirement for EU market — non-negotiable |
| i18n-ready URL structure (`/en/`, `/fr/`, `/de/`) | Architecture must support it from day one even if only EN ships |
| Responsive mobile-first design | 60%+ of traffic will be mobile |
| SEO fundamentals (meta tags, structured data, sitemap, robots.txt) | Organic discovery is the growth engine |
| Social media link integration | Traffic channel |
| 5-8 seed blog articles (content, not code) | Blog without content is an empty restaurant |

**Traffic Acquisition (parallel to development):**
- Initial influencer partnership outreach for launch amplification
- Paid acquisition setup (Google Ads for high-intent keywords, social ads for waitlist)
- Social media content calendar aligned with blog seed articles

**Deferred from MVP (explicitly not built yet):**
- Shareable inspection report pages (Sofia's journey — requires app to be live and generating reports)
- Live inspection statistics with real data (placeholder/static numbers until app has real usage data)

### Post-MVP Features (Phase 2 — Growth)

- A/B testing on hero messaging and CTA placement
- Advanced blog features (related articles, reading time, content categories)
- Referral program integration (share Truvis, skip the waitlist)
- Retargeting pixel integration for paid acquisition optimization
- Multi-language blog content strategy
- Email forward/share tracking and optimization
- Shareable inspection report pages (when app generates reports)
- Live statistics with real data replacing placeholders

### Phase 3 — Vision (V1.2+)

- French and German language support for landing page and blog
- Localized SEO content strategy for FR/DE markets
- Region-specific social proof and user stories
- Localized paid acquisition campaigns

### Risk Mitigation Strategy

**Technical Risks:**
- **CMS choice lock-in:** Wrong CMS means painful migration. Mitigation: evaluate during Architecture phase with criteria weighted for Claude Code DX, API quality, and SSG integration. Spike the top 2 candidates before committing.
- **Email deliverability on new domain:** Mitigation: configure SPF/DKIM/DMARC before first send, warm up with small batches, test with mail-tester.com.
- **Mobile app API contract:** Blog API schema must satisfy both web rendering and mobile carousel. Mitigation: define API contract early in architecture, validate with both consumers before building.

**Market Risks:**
- **No traffic to a new domain:** Mitigation: seed articles target high-intent keywords with low competition. Parallel traffic acquisition (social content, paid ads) supplements organic while SEO matures.
- **Low waitlist conversion:** Mitigation: micro-survey provides early signal on visitor intent. If wrong audience is arriving, adjust content/targeting before investing more.

**Resource Risks:**
- **Solo developer bottleneck:** Mitigation: Claude Code as force multiplier. SSG + headless CMS minimizes infrastructure complexity. No custom backend to maintain (email and analytics are SaaS integrations).
- **Content production pace:** Mitigation: AI-assisted content creation for blog articles and drip series. Quality review by Cristian, not from-scratch writing.

## Functional Requirements

### Landing Page Content & Conversion

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

### Email Capture & Nurture

- **FR12:** Visitor can submit their email address to join the Truvis waitlist
- **FR13:** System validates email input and provides specific error messages for invalid format, duplicate entry, and submission failure
- **FR14:** Visitor receives a double opt-in confirmation email after submitting their email (GDPR compliance)
- **FR15:** Confirmed subscriber automatically enters the email drip series (4-6 emails over 2-3 weeks)
- **FR16:** Subscriber can unsubscribe from the drip series via a link in every email
- **FR17:** Visitor can complete a single-question micro-survey on the waitlist confirmation page ("What brought you here today?")

### Blog & Content

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

### Content Management

- **FR28:** Content admin can create, edit, and publish blog articles via a headless CMS without touching code
- **FR29:** Content admin can set SEO metadata per article (title tag, meta description, social sharing image, target keywords)
- **FR30:** Content admin can toggle between pre-launch mode (waitlist CTAs) and post-launch mode (app store CTAs) via a configuration change, not a code deployment
- **FR31:** Content admin can add, edit, and remove FAQ entries without code changes
- **FR32:** Content admin can add and manage user testimonials/stories (post-launch) without code changes
- **FR33:** Content admin can update social proof statistics without code changes
- **FR34:** Any content change in the CMS triggers an automated site rebuild and deployment

**Operational note:** Content admin monitors drip series performance (open rate, CTR, completion rate, unsubscribe rate) via the email service provider's own dashboard — not a capability built into the landing page.

### Analytics & Tracking

- **FR35:** System tracks page views, unique visitors, bounce rate, and time-on-page per landing page section and blog article
- **FR36:** System tracks conversion events: waitlist signups, app store clicks (post-launch), blog CTA clicks
- **FR37:** System supports UTM parameters for traffic source attribution (social, paid, organic, referral)
- **FR38:** System tracks micro-survey responses and aggregates results
- **FR39:** Content admin can view analytics data via an integrated dashboard or third-party analytics tool

### SEO & Discoverability

- **FR40:** System generates an XML sitemap updated on each build
- **FR41:** System provides structured data markup for organization identity, site structure, blog articles, and FAQ content (supporting rich results in search engines)
- **FR42:** Each page and blog article has a canonical URL
- **FR43:** System generates robots.txt with standard crawl configuration
- **FR44:** All images include alt text and are lazy-loaded below the fold

### Compliance & Privacy

- **FR45:** Visitor is presented with a cookie consent banner before any non-essential cookies or tracking scripts load
- **FR46:** Visitor can accept or reject non-essential cookies, and their preference is persisted
- **FR47:** Visitor can access a privacy policy page that documents data collection, processing, and retention practices
- **FR48:** System implements double opt-in for email capture (GDPR requirement for EU market)
- **FR49:** Subscriber can request deletion of their data (right to erasure)

### Internationalisation (Architecture Only)

- **FR50:** System supports URL-based locale routing (`/en/`, `/fr/`, `/de/`) in its architecture, even though only English content is available at launch
- **FR51:** System detects visitor's browser language preference and redirects to the appropriate locale URL, defaulting to English
- **FR52:** All user-facing strings are externalisable (not hardcoded) to support future translation

### Pre/Post-Launch Transition

- **FR53:** System supports a feature flag that controls whether the page displays waitlist capture (pre-launch) or app store download buttons (post-launch)
- **FR54:** Transition between pre-launch and post-launch modes requires no code deployment and causes no downtime
- **FR55:** Analytics tracking continues without data loss or tracking gaps across the transition, with new conversion events (app store clicks) replacing old ones (waitlist signups)

### Error Handling

- **FR56:** System displays a branded error page for invalid URLs with navigation back to the landing page and blog

## Non-Functional Requirements

### Performance

- **NFR1:** Hero section achieves Largest Contentful Paint (LCP) <2.5s on 4G mobile connections
- **NFR2:** Page achieves First Input Delay (FID) <100ms
- **NFR3:** Page achieves Cumulative Layout Shift (CLS) <0.1
- **NFR4:** Time to First Byte (TTFB) <200ms via CDN edge cache
- **NFR5:** Total initial page weight <500KB transferred (excluding lazy-loaded images)
- **NFR6:** Lighthouse Performance score >90
- **NFR7:** Full page load <2s on 3G mobile connection
- **NFR8:** Blog content API responds in <300ms for carousel requests
- **NFR9:** Post-launch inspection statistics widget loads in <500ms

### Security

- **NFR10:** All traffic served over HTTPS with TLS 1.2+ (enforced by CDN/hosting)
- **NFR11:** Email addresses transmitted over encrypted connections to email service provider
- **NFR12:** No user credentials or sensitive data stored in client-side code, local storage, or cookies
- **NFR13:** Cookie consent preferences stored client-side only — no server-side tracking without consent
- **NFR14:** Blog content API access controlled via API key or rate limiting to prevent abuse
- **NFR15:** Contact forms and email capture protected against automated spam submissions without user-facing friction

### Scalability

- **NFR16:** Static content served via CDN with no origin server dependency for page loads
- **NFR17:** Email capture submissions are queued or retried if the email provider API is temporarily rate-limited — no submissions silently dropped
- **NFR18:** Blog content API supports 100 concurrent requests from mobile app users with <300ms response time at 95th percentile

### Accessibility

- **NFR19:** WCAG 2.1 AA compliance across all pages
- **NFR20:** Color contrast ratio minimum 4.5:1 for normal text, 3:1 for large text
- **NFR21:** All interactive elements keyboard navigable (tab, enter, space, escape)
- **NFR22:** Screen reader compatible with ARIA labels where semantic HTML is insufficient
- **NFR23:** Focus indicators visible on all interactive elements
- **NFR24:** All form inputs have associated `<label>` elements
- **NFR25:** Lighthouse Accessibility score >90
- **NFR26:** All layouts tolerate 40% text expansion for future translations (FR/DE)

### Integration

- **NFR27:** Email service provider integration supports double opt-in, drip series automation, and unsubscribe handling via API
- **NFR28:** Analytics integration loads asynchronously and does not block page render
- **NFR29:** Analytics respects cookie consent — no tracking scripts execute before user consent
- **NFR30:** Content updates trigger automated site rebuild and deployment within 5 minutes of content publish (includes sitemap regeneration)
- **NFR31:** Blog content API changes are additive only — no field removals or renames that would break mobile app carousel
- **NFR32:** Post-launch statistics API (from Truvis backend) provides cached data with 24-hour freshness — landing page does not query live database

### Reliability

- **NFR33:** Hosting provider selected must offer ≥99.9% uptime SLA for static content delivery
- **NFR34:** Email capture form degrades gracefully if email provider API is unreachable — shows branded error message with retry option, does not lose submission silently
- **NFR35:** Post-launch statistics widget degrades gracefully if backend API is unreachable — shows last-known-good data or a placeholder, not an error
- **NFR36:** Blog content API returns cached responses if CMS is temporarily unreachable — mobile app carousel does not show empty state

### Monitoring & Operations

- **NFR37:** System provides automated alerting for build failures, email delivery issues, and API availability degradation
- **NFR38:** Deployments can be rolled back to the previous version within 2 minutes via hosting provider's UI or CLI

### SEO Performance

- **NFR39:** Lighthouse SEO score >95

### Content Quality

- **NFR40:** All blog content maintains the 70/30 Inspector/Ally brand voice and provides actionable, specific guidance — no generic listicle filler
