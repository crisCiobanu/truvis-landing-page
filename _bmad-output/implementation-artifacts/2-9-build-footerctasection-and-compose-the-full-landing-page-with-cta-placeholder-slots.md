# Story 2.9: Build `FooterCtaSection` and compose the full landing page with CTA placeholder slots

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor who has read the entire page and is now at the bottom**,
I want **one last clear invitation to join the waitlist before the site's small-print footer**,
so that **my conversion moment is obvious and not buried under legal links**.

## Context & scope

This is the **final story of Epic 2** and the **last story before Epic 3's waitlist mechanism lights up every CTA slot with real email capture**. It does two things: (1) builds the Tier-2 `FooterCtaSection` — a dark `#2E4057` bookend closing the page with one last "Join the waitlist" moment; (2) **composes the complete landing page** on `src/pages/index.astro` in the canonical order, inserts a **third CTA placeholder slot** (mid-page) between `<InspectionStorySection />` and `<SocialProofSection />`, and verifies that all three CTA slots (`hero`, `mid`, `footer`) use an **identical placeholder convention** so Epic 3 Story 3.5 can swap them with one find-and-replace.

Scope boundaries:
- **In scope:** `src/components/sections/footer-cta-section.astro` (Tier-2 Astro composite on dark `#2E4057` background matching UX-DR3 / UX-DR9), a named Astro `<slot name="cta">` with a default fallback that renders the same disabled placeholder button the hero already uses (AC3), a **new mid-page CTA band** rendered inline inside `src/pages/index.astro` between `<InspectionStorySection />` and `<SocialProofSection />` (AC4), final canonical page composition that adds `<SocialProofSection />` / `<BlogPreviewsSection />` / `<FaqSection />` / `<FooterCtaSection />` to `src/pages/index.astro` in order (Stories 2.6–2.8 each added their own section individually but did not lock the final canonical order — this story is the checkpoint that verifies it), verification that all three CTA slots use the same `data-cta-slot="..."` / `data-testid="...-cta-slot"` convention so Epic 3 can grep-replace them, a new `landing.footerCta` i18n namespace with byte-for-byte FR/DE mirrors, a new `landing.midCta` i18n namespace (shared between the mid-page band and the footer CTA subheadline), text-expansion harness registration, Lighthouse CI pass, the `TODO(epic-3)` comments marking the three CTA slot swap points, the `TODO(epic-5)` comment at the `<Footer>` call site flagging that social URLs will be wired from the `siteContent` collection.
- **Out of scope:** any change to `<Header>`, `<Footer>`, `<HeroSection>`, `<ProblemSection>`, `<InspectionStorySection>`, `<SocialProofSection>`, `<BlogPreviewsSection>`, `<FaqSection>` — all are frozen contracts from Stories 1.4 / 2.1 / 2.2 / 2.5 / 2.6 / 2.7 / 2.8. The real `EmailCaptureBlock` (Epic 3 Story 3.4) and the `/api/waitlist` route (Epic 3 Story 3.3) — this story ships **placeholder-only** CTA slots that Epic 3 Story 3.5 swaps. Real social URLs in `<Footer>` (Epic 5). Sentry / analytics / JSON-LD (Epics 6–7). Post-launch CTA variants with App Store / Google Play buttons (Epic 8 Story 8.1). Do **not** introduce these.

## Acceptance Criteria

### AC1 — `FooterCtaSection` on dark `#2E4057` background with eyebrow, `<h2>`, subheadline (UX-DR3, UX-DR9, Story 1.7 color rhythm)

**Given** UX-DR3 requires a dark `#2E4057` footer CTA bookend and UX-DR9 places the `FooterCtaSection` in Epic 2's scope, and the Story 1.7 Epic-2 colour rhythm closes with the dark primary slot (white FAQ → **dark primary footer CTA** → `<Footer>` from Story 1.4 is on its own background),
**When** I create `src/components/sections/footer-cta-section.astro`,
**Then**
- the section is a **pure Astro file** with zero `client:*` directives and zero JavaScript. The default CTA placeholder is a disabled `<button>`, not an interactive form,
- the file header comment mirrors the `problem-section.astro` / `social-proof-section.astro` shape, with a prominent V1-scope note: `// V1 ships the disabled "Join the waitlist" placeholder as the default <slot name="cta"> fallback. Epic 3 Story 3.5 replaces it with <EmailCaptureBlock slot="cta" variant="footer" /> via a find-and-replace of data-cta-slot="footer".`,
- the outer wrapper is `<section aria-labelledby="footer-cta-heading" class="bg-[var(--color-primary)]">` — the dark primary brand token (`#2E4057`),
- the inner container uses the Epic-2 recipe: `<div class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28 text-center">`. **Note two variances from Epic 2 default:** `max-w-3xl` (editorial width for a single-column CTA bookend, same rationale as Story 2.8 FAQ section) and **text-center** (UX-DR3 specifies a centred CTA bookend — the hero's CTA is left-aligned; the footer CTA is centred for rhetorical emphasis). Document these variances in the dev record,
- the first child is `<SectionEyebrow variant="dark" eyebrow={t('landing.footerCta.eyebrow', locale)} />` — **the dark-background variant** (warm-amber outlined pill on dark primary, from Story 1.4). Confirm the exact prop name against `src/components/sections/section-eyebrow.astro` before rendering — the hero and problem sections use `variant="light"`; this is the repo's first consumer of the dark variant, so verify the prop exists and works. If the component does not yet expose a `dark` variant, that is a Story 1.4 defect — file a follow-up and either extend `section-eyebrow.astro` minimally or hard-code an inline styled span for this section only, documenting the choice in the dev record. The V1 eyebrow string is `"Ready to buy smarter?"`,
- the second child is `<h2 id="footer-cta-heading">` in **white** (`text-white` or `text-[var(--color-bg)]` — whichever the brand token naming uses for "white-on-dark-primary") wired to `t('landing.footerCta.headline', locale)`. Suggested English copy: `"Your next car deserves a second opinion."`. Typography: `font-display text-[length:var(--text-2xl)] leading-tight font-bold`,
- the third child is a `<p>` subheadline wired to `t('landing.footerCta.subheadline', locale)` in a high-contrast muted-on-dark colour (`text-[var(--color-muted-on-dark)]` if the token exists, else `text-white/80` — confirm the brand-token name for "off-white muted on dark"). Typography: `text-[length:var(--text-lg)]`. Suggested English copy: `"Truvis is launching soon. Join the waitlist and get an early-access discount on the pocket inspector that pays for itself."`,
- the fourth child is the named `<slot name="cta">` with the default placeholder fallback described in AC3. The slot wrapper uses `mt-8 inline-flex justify-center` to centre the button / form horizontally below the subheadline.

### AC2 — Text contrast and a11y on the dark background (UX-DR30, WCAG 2.1 AA / AAA)

**Given** UX-DR30 requires WCAG 2.1 AA contrast on every shipping content and the epic specifies AAA contrast for the dark footer CTA bookend,
**When** I audit the section,
**Then**
- **white `#FFFDF9` text on dark primary `#2E4057`** — the `<h2>` and the default slot button label — must achieve ≥10:1 contrast (WCAG 2.1 AAA for normal text is ≥7:1 and for large text is ≥4.5:1; white-on-dark-primary at #FFFDF9/#2E4057 is ~11:1). Verify with a contrast calculator on the built preview. If the ratio is below 10:1, the brand tokens are wrong, not the story — file a Story 1.7 defect,
- **warm-amber `#F5A623` on dark primary `#2E4057`** — the eyebrow pill text — must achieve ≥4.5:1 (WCAG 2.1 AA for normal text). Amber-on-dark-primary is roughly 5.3:1 at the documented brand tokens. Verify,
- **muted-on-dark subheadline** (whichever token is used) must achieve ≥4.5:1. If the token's value is too close to the background (e.g., pure `white/50`), swap to a token that passes,
- the section's single `<h2>` is the only heading inside this boundary; no `<h3>` / `<h4>` inside. Page-level single `<h1>` invariant is preserved (hero owns `<h1>`),
- the section is keyboard-reachable: Tab from the FAQ section above flows naturally into the footer CTA slot (which contains the disabled placeholder button — see AC3 on how it handles Tab).

### AC3 — Default `<slot name="cta">` fallback renders the disabled placeholder button identical to hero (UX-DR3, Epic 3 handoff contract)

**Given** UX-DR3 requires the footer CTA to expose a named slot so Epic 3 Story 3.5 can inject the real `<EmailCaptureBlock slot="cta" variant="footer" />`, and the default fallback at V1 must render a placeholder visually consistent with the hero's CTA slot placeholder from Story 2.1,
**When** I render the default slot fallback,
**Then**
- the `<slot name="cta">` has an Astro default-fallback block that renders:
  ```astro
  <slot name="cta">
    <div data-cta-slot="footer" data-testid="footer-cta-slot">
      <button
        type="button"
        disabled
        aria-disabled="true"
        class="inline-flex items-center rounded-md bg-[var(--color-teal)] px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {t('landing.footerCta.ctaPlaceholder', locale)}
        <span class="sr-only"> — coming soon, form wires in Epic 3</span>
      </button>
    </div>
  </slot>
  ```
- the **wrapper `<div data-cta-slot="footer" data-testid="footer-cta-slot">`** is **exactly** the contract Story 2.1 uses for the hero CTA slot (with `data-cta-slot="hero"` / `data-testid="hero-cta-slot"`). Epic 3 Story 3.5 will target these two data attributes verbatim; do NOT rename them, do NOT drop the `data-testid`, do NOT change the wrapper element type from `<div>`,
- the button's `aria-disabled="true"` / `disabled` combination, the `<span class="sr-only"> — coming soon, form wires in Epic 3</span>` visually-hidden annotation, and the Tailwind classes all match the hero slot **byte-for-byte** except for the visible label (the hero uses `t('landing.hero.ctaPlaceholder', ...)` and this section uses `t('landing.footerCta.ctaPlaceholder', ...)`). The V1 label is `"Join the waitlist"` — identical to hero's,
- a `disabled` button is focusable by default (specifically, it is NOT in the tab order under most assistive-tech conventions, but the `tabindex` behaviour varies by browser). The hero's Story 2.1 implementation does not add `tabindex="-1"` — match that exactly. The `aria-disabled="true"` + `disabled` combination gives SR users the right signal, and `disabled:cursor-not-allowed` gives mouse users visual feedback,
- the default fallback is a plain Astro fallback — Astro's `<slot name="...">...</slot>` pattern renders the children of the slot element when the consumer does not provide slotted content. Verify this with a quick `npm run dev` — rendering `<FooterCtaSection />` without any `<... slot="cta">` child must show the disabled button,
- directly above the `<slot>` element, add an `// TODO(epic-3): <slot name="cta"> is replaced by <EmailCaptureBlock slot="cta" variant="footer" /> via find-and-replace of data-cta-slot="footer"` comment so Epic 3 Story 3.5 has the exact grep target.

### AC4 — Mid-page CTA placeholder band between `<InspectionStorySection />` and `<SocialProofSection />` (FR7)

**Given** FR7 requires multi-position CTAs (hero, mid-page, footer) and the epic explicitly places the mid-page CTA as a narrow full-width band between the inspection story and social proof sections,
**When** I compose `src/pages/index.astro`,
**Then**
- a new inline markup block is inserted **directly** into `src/pages/index.astro` between `<InspectionStorySection />` and `<SocialProofSection />` — this is **NOT** a new Tier-2 section component. The mid-page CTA is a small presentational band, scoped only to the landing page, so it lives inline in `index.astro` rather than as a reusable section component. Rationale: a reusable `<MidPageCtaSection />` would imply reuse that does not exist (the landing page is the only consumer; Epic 3 Story 3.5 swaps it with a different primitive; Epic 5 / 8 do not need it elsewhere),
- the band's markup is:
  ```astro
  <section aria-labelledby="mid-cta-heading" class="bg-[var(--color-bg)]">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-center">
      <h2
        id="mid-cta-heading"
        class="sr-only"
      >
        {t('landing.midCta.srHeading', locale)}
      </h2>
      <p class="mb-6 font-display text-[length:var(--text-lg)] font-medium text-[var(--color-primary)]">
        {t('landing.midCta.lede', locale)}
      </p>
      {/*
       * TODO(epic-3): <div data-cta-slot="mid" ...> wrapper is
       * replaced by <EmailCaptureBlock slot="cta" variant="mid" />
       * via find-and-replace of data-cta-slot="mid".
       */}
      <div data-cta-slot="mid" data-testid="mid-cta-slot" class="inline-flex justify-center">
        <button
          type="button"
          disabled
          aria-disabled="true"
          class="inline-flex items-center rounded-md bg-[var(--color-teal)] px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {t('landing.midCta.ctaPlaceholder', locale)}
          <span class="sr-only"> — coming soon, form wires in Epic 3</span>
        </button>
      </div>
    </div>
  </section>
  ```
- the **`<h2 class="sr-only">` trick** is deliberate: the mid-page CTA band is a marketing interstitial between two content sections, but WCAG 2.1 says every `<section>` with an `aria-labelledby` must have a corresponding heading. A visually-hidden `<h2>` satisfies the a11y requirement without adding a second visible heading to the page's rhetorical structure. Alternative: drop `aria-labelledby` and the `<h2>` entirely, leaving the band as a plain `<div>` — but the `<section>` + `aria-labelledby` pattern is the repo's convention. Pick the `sr-only` `<h2>` path,
- the heading hierarchy after the `sr-only` addition: `<h1>` (hero) → `<h2>` (hero via `SectionEyebrow`? confirm by inspecting hero-section.astro), `<h2>` per section (problem, inspection story, social proof, blog previews, FAQ, footer CTA), and **one `sr-only` `<h2>` for the mid-page CTA band**. The `sr-only` `<h2>` is at the same hierarchy level as the other `<h2>`s — it does not break the level ordering. The `<h1>` still appears exactly once on the page. Verify,
- the mid-page CTA band uses `bg-[var(--color-bg)]` (warm off-white) to visually separate it from the `<InspectionStorySection />` above (dark primary) and the `<SocialProofSection />` below (also warm off-white). The dark→light transition above the band is intentional; it signals "breath" between the dark inspection-story climax and the white social-proof section,
- the band is **shorter** than a full section (`py-12` = 48 px top/bottom vs the Epic-2 default `py-16` / `lg:py-24`) — it is a thin interstitial, not a full section. Match the 4pt spacing grid (`py-12`, `mb-6`),
- the band's `data-cta-slot="mid"` / `data-testid="mid-cta-slot"` wrapper **must match the hero and footer CTA conventions byte-for-byte** so Epic 3 Story 3.5 can grep-replace all three with a single pattern (AC6).

### AC5 — Final canonical landing-page composition on `src/pages/index.astro` (UX-DR2, FR7, Epic 2 checkpoint)

**Given** every Epic 2 section (2.1 through 2.8) added its own section to `src/pages/index.astro` individually and this story is the final checkpoint that verifies the full canonical order,
**When** I finalise `src/pages/index.astro`,
**Then**
- the page renders in this **exact** order inside `<BaseLayout>`:
  ```astro
  <BaseLayout title={...} description={...}>
    <HeroSection />
    <ProblemSection />
    <InspectionStorySection />
    {/* mid-page CTA band — AC4 */}
    <section aria-labelledby="mid-cta-heading" class="bg-[var(--color-bg)]">
      ...
    </section>
    <SocialProofSection />
    <BlogPreviewsSection />
    <FaqSection />
    <FooterCtaSection />
  </BaseLayout>
  ```
- `<Header>` and `<Footer>` are owned by `<BaseLayout>` (Story 1.4) — they are NOT imported or rendered directly in `src/pages/index.astro`. The page only touches the `default` slot between them,
- the `<h1>` invariant is preserved: exactly one `<h1>` on the page, owned by `<HeroSection>`,
- every section has its own `<h2>` except the mid-page CTA band whose `<h2>` is `sr-only`. The page's heading outline is:
  - `<h1>` hero
  - `<h2>` problem
  - `<h2>` inspection story
    - `<h3>` per scene (six)
  - `<h2 class="sr-only">` mid-page CTA
  - `<h2>` social proof
  - `<h2>` blog previews
    - `<h3>` per card (three)
  - `<h2>` FAQ
    - `<h3>` per accordion trigger (via Radix's `AccordionPrimitive.Header`)
  - `<h2>` footer CTA
- **scroll verification:** after `npm run build && npm run preview`, manually scroll from top to bottom of `/` and confirm:
  1. No layout shift (CLS <0.1 — NFR3),
  2. No broken images (the hero SVG phone from Story 2.1 and the inspection-story scene SVG phone frames from Story 2.5 all render),
  3. No console errors,
  4. All three CTA placeholders (`hero`, `mid`, `footer`) are visible,
  5. The inspection-story sticky behaviour activates at ≥768 px (Story 2.4 / 2.5 contract — AC9 below),
  6. The FAQ accordion hydrates on `client:idle` and responds to click + keyboard interaction after LCP (Story 2.8),
  7. No horizontal scroll at any breakpoint (<640 px, 640–1024 px, ≥1024 px),
- all three CTA slots (`hero`, `mid`, `footer`) are labelled as "coming soon" to screen readers via the `<span class="sr-only"> — coming soon, form wires in Epic 3</span>` inside each button (AC3 for hero, AC4 for mid, AC3 for footer). Verify by inspecting the rendered HTML.

### AC6 — Identical CTA placeholder convention across all three slots (Epic 3 Story 3.5 find-and-replace contract)

**Given** Epic 3 Story 3.5 will swap every CTA placeholder with a real `<EmailCaptureBlock slot="cta" variant="..." />` and the find-and-replace must succeed with minimum file edits,
**When** I audit the three CTA placeholders,
**Then**
- every CTA slot wrapper uses the exact same attribute shape:
  ```astro
  <div data-cta-slot="{{position}}" data-testid="{{position}}-cta-slot">
    <button type="button" disabled aria-disabled="true" class="{{teal-button-classes}}">
      {{label}}
      <span class="sr-only"> — coming soon, form wires in Epic 3</span>
    </button>
  </div>
  ```
  where `{{position}}` is `hero`, `mid`, or `footer`, and `{{teal-button-classes}}` is the exact Tailwind class string from `hero-section.astro` (AC3 byte-for-byte),
- the three `{{position}}` values are `hero`, `mid`, `footer` — three distinct grep targets. A reviewer running `grep -rn 'data-cta-slot=' src/` must find exactly three matches after this story ships,
- the three `{{label}}` values all route through `t()` with locale-scoped keys: `t('landing.hero.ctaPlaceholder', locale)`, `t('landing.midCta.ctaPlaceholder', locale)`, `t('landing.footerCta.ctaPlaceholder', locale)`. All three **V1 English labels are `"Join the waitlist"`**. Epic 3 Story 3.5 may later differentiate the labels per slot (e.g., "Get early access" for hero, "Join 400+ on the list" for mid) — that is Epic 3 scope; at V1 they are all identical for consistency,
- a developer at Epic 3 Story 3.5 must be able to run:
  ```
  grep -rn 'data-cta-slot=' src/
  ```
  and find exactly three hits (one per slot). Each hit's surrounding 10 lines is the exact block to replace with `<EmailCaptureBlock slot="cta" variant="{{position}}" />`. **This is the contract**; breaking it means Epic 3 Story 3.5 has to read the file instead of grep-replacing, and the find-and-replace intent is lost.

### AC7 — `TODO(epic-3)` comments at every CTA swap point + `TODO(epic-5)` for social URLs (Epic 3 + Epic 5 handoff contracts)

**Given** Epic 3 Story 3.5 owns the three CTA slot swaps and Epic 5 Story 5.4 owns the migration of hard-coded social URLs in `<Footer>` to `siteContent` collection reads,
**When** I finalise the composition,
**Then**
- each of the three CTA slot blocks (hero in `hero-section.astro`, mid in `index.astro`, footer in `footer-cta-section.astro`) is preceded by a `TODO(epic-3)` comment that:
  - starts with `TODO(epic-3):` (exact format — grep target),
  - names the target component (`<EmailCaptureBlock slot="cta" variant="hero|mid|footer" />`),
  - explains the find-and-replace anchor (`data-cta-slot="..."`),
  - references Story 3.5 by its story key: `(Story 3.5)`,
- `src/pages/index.astro` carries a `TODO(epic-5): wire real social URLs from siteContent collection` comment at the `<BaseLayout>` call site if Story 1.4's `<Footer>` does not already carry an equivalent comment at its own render site. This is **belt-and-braces** — the comment is Epic 5 Story 5.4's grep target. If Story 1.4 already has the comment inside `footer.astro`, do NOT duplicate it; just verify it is present,
- **do NOT** add the `TODO(epic-3)` comment to `hero-section.astro` — that file is a Story 2.1 frozen contract. Instead, verify the comment already exists (it should, per Story 2.1 AC5 — the hero CTA slot was always the Epic 3 handoff). If it does not, file a Story 2.1 defect rather than editing the frozen file.

### AC8 — i18n namespaces `landing.footerCta.*` + `landing.midCta.*` (FR52)

**Given** FR52 requires English strings at V1 and FR/DE byte-for-byte mirrors,
**When** I author the i18n content,
**Then**
- two new top-level blocks are added to `src/i18n/en/landing.json` (at the **end**, after `faq` from Story 2.8 — respect existing key order):
  ```json
  "midCta": {
    "srHeading": "Join the Truvis waitlist",
    "lede": "Like what you're reading? Join the waitlist — we'll let you know the moment Truvis lands.",
    "ctaPlaceholder": "Join the waitlist"
  },
  "footerCta": {
    "eyebrow": "Ready to buy smarter?",
    "headline": "Your next car deserves a second opinion.",
    "subheadline": "Truvis is launching soon. Join the waitlist and get an early-access discount on the pocket inspector that pays for itself.",
    "ctaPlaceholder": "Join the waitlist"
  }
  ```
- the `midCta.srHeading` is the visually-hidden `<h2>` content for the mid-page CTA band's `aria-labelledby` (AC4). Keep it short and functional — it is never rendered visibly,
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` receive **identical `midCta` and `footerCta` blocks** — byte-for-byte English copies per FR52. Do not machine-translate,
- every `t()` call in the new section / mid-page band resolves cleanly — `npx astro check` must be clean,
- the existing `landing.hero.ctaPlaceholder` key already exists from Story 2.1 and is reused by the hero slot — do NOT duplicate it under `midCta` or `footerCta`.

### AC9 — Lighthouse CI passes all Story 1.2 budget gates (NFR1, NFR3, NFR5, NFR6, NFR25, NFR39)

**Given** Story 1.2 codified the hard CI budget gates and every Epic 2 story is expected to keep the composed page under every threshold,
**When** the CI runs on the PR,
**Then**
- Lighthouse Performance ≥90 (NFR6),
- Lighthouse Accessibility ≥90 (NFR25),
- Lighthouse SEO ≥95 (NFR39),
- LCP <2.5 s (NFR1) — the hero phone SVG (Story 2.1) is the LCP candidate and is inlined at build time, so first paint + LCP are effectively the same frame on a warm cache,
- CLS <0.1 (NFR3) — no entrance animations in this story, no layout-triggering properties, no late-loading fonts (already handled by Story 1.3's font loading),
- Total initial weight <500 KB gzipped (NFR5) — the Story 2.8 FAQ accordion island is the largest JS chunk (~10 KB gzipped for Radix accordion); this story adds no new JS chunks,
- the CI Lighthouse run on the PR must be the PR-blocking gate — manual local verification is a first check but not sufficient. Run `npm run build && npx lhci autorun` (or whatever command the repo's `lighthouse/` folder exposes) locally before pushing the PR to ensure the budgets pass. Document the local Lighthouse scores in the dev record,
- if any budget fails, the primary remediation paths are (in order of preference): (1) delete unused Tailwind utilities via tree-shaking — check that every class used on `/` is in the JIT cache; (2) verify no unused islands are hydrated; (3) split the FAQ accordion to a more minimal accordion primitive if the Radix bundle is the culprit; (4) if all else fails, defer one or more Epic 2 features to a future story and document the deferral. Do NOT relax the budget in `lighthouse/budget.json` — that file is Story 1.2 contract and changing it is a governance decision, not a story fix.

### AC10 — Text-expansion harness final registration + mobile/tablet/desktop verification (UX-DR31, NFR26)

**Given** every Tier-2 section must render cleanly under 140 % padded FR/DE synthetic strings and this story is the final Epic 2 checkpoint,
**When** I update the harness and run a manual sweep,
**Then**
- `src/pages/_demo/text-expansion.astro` renders every Tier-2 section shipped by Epic 2 under 140 % padded strings: `<HeroSection>`, `<ProblemSection>`, `<InspectionStorySection>` (or its static mirror, since the island requires hydration and the harness's `_demo/` routing may not execute islands cleanly), `<SocialProofSection>`, `<BlogPreviewsSection>`, `<FaqSection>` (or static `<details>` mirror), and the new `<FooterCtaSection>`. The mid-page CTA band does NOT need a harness registration because its only user-visible content is a single `lede` paragraph and the placeholder button — 140 % padding on a single sentence is trivial,
- at mobile (<640 px), tablet (640–1024 px), and desktop (≥1024 px) breakpoints: open the harness page in `npm run dev` (which ignores the `_demo/` routing exclusion under dev mode) and verify no clipping, no overflow, no horizontal scroll, no broken layout in any section,
- pay particular attention to the `FooterCtaSection` centred text on the narrow `max-w-3xl` container under 140 % padding — long padded strings must wrap without breaking the eyebrow pill shape, the `<h2>` white-on-dark contrast, or the button's centred alignment,
- document any breakage found during the harness sweep in the dev record; fix at the smallest possible scope (adjust the section's internal padding / wrapping rules; do NOT widen the container beyond `max-w-3xl`).

### AC11 — Build, lint, type-check, bundle delta, no new dependencies (NFR5, AR23, AR27)

**Given** the repo's CI gates and NFR5's 500 KB initial weight budget,
**When** I finish the story,
**Then**
- `npx astro check` — 0 errors. All `t()` calls resolve. TypeScript recognises every new i18n key path,
- `npx eslint . && npx prettier --check .` — clean,
- `npx vitest run` — all existing tests pass; **no new Vitest files** (`lib/` utilities only),
- `npm run build && npm run preview` — clean. The built `/` route renders all eight sections (hero + problem + inspection story + mid-page CTA band + social proof + blog previews + FAQ + footer CTA) inside `<BaseLayout>` with `<Header>` + `<Footer>` bookends,
- inspect `dist/_astro/` — this story adds **zero new JavaScript chunks** (pure Astro section, inline CTA band, no new islands). Document the `/` initial-weight delta in the dev record; expect ~3 KB of new HTML per locale (eyebrow + h2 + subheadline + CTA button + mid-page band + i18n mirror) and 0 KB of new JS,
- `package.json` unchanged — no new dependencies. Every primitive needed (SectionEyebrow, button classes, i18n helper) is already in the repo,
- **the landing page is complete** — `src/pages/index.astro` now renders the full Epic 2 composition. No more Epic 2 sections will be added after this story. Every remaining change to `/` is an Epic 3+ concern.

## Tasks / Subtasks

- [ ] **Task 1 — Write the `midCta` and `footerCta` i18n blocks in English** (AC8)
  - [ ] 1.1 Add the top-level `midCta` block to `src/i18n/en/landing.json` with `srHeading`, `lede`, `ctaPlaceholder`.
  - [ ] 1.2 Add the top-level `footerCta` block with `eyebrow`, `headline`, `subheadline`, `ctaPlaceholder`.
  - [ ] 1.3 Author each string in Inspector/Ally voice; the `srHeading` is short and functional.
  - [ ] 1.4 Copy both blocks byte-for-byte into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` (FR52).

- [ ] **Task 2 — Create `footer-cta-section.astro`** (AC1, AC2, AC3, AC7)
  - [ ] 2.1 Create `src/components/sections/footer-cta-section.astro` with the V1-scope header comment per AC1.
  - [ ] 2.2 Import `t` + `Locale`, `SectionEyebrow`.
  - [ ] 2.3 Derive `const locale = (Astro.currentLocale ?? 'en') as Locale;`.
  - [ ] 2.4 Render the dark-background `<section>` wrapper with `aria-labelledby`, `max-w-3xl`, `text-center`, and increased padding (`py-20 lg:py-28`).
  - [ ] 2.5 Render `<SectionEyebrow variant="dark" ... />` — if the dark variant does not yet exist, file a Story 1.4 defect and either extend `section-eyebrow.astro` minimally or hardcode the inline eyebrow markup for this section only (document the choice).
  - [ ] 2.6 Render the white `<h2 id="footer-cta-heading">` and the muted-on-dark subheadline `<p>`.
  - [ ] 2.7 Render the named `<slot name="cta">` with the AC3 default fallback (disabled placeholder button with `data-cta-slot="footer"` + `data-testid="footer-cta-slot"` wrapper).
  - [ ] 2.8 Add the `TODO(epic-3)` comment directly above the `<slot>` element per AC7.
  - [ ] 2.9 Verify white-on-dark contrast ≥10:1, amber-on-dark ≥4.5:1, muted-on-dark ≥4.5:1 via a contrast calculator on the built preview.

- [ ] **Task 3 — Insert the mid-page CTA placeholder band in `src/pages/index.astro`** (AC4, AC6, AC7)
  - [ ] 3.1 In `src/pages/index.astro`, insert the inline `<section aria-labelledby="mid-cta-heading">` block between `<InspectionStorySection />` and `<SocialProofSection />`.
  - [ ] 3.2 Use the exact markup shape from AC4 — `sr-only <h2>`, lede `<p>`, `<div data-cta-slot="mid" data-testid="mid-cta-slot">`, disabled button with `t('landing.midCta.ctaPlaceholder', locale)` label.
  - [ ] 3.3 Add the `TODO(epic-3)` comment directly above the `<div data-cta-slot="mid" ...>` wrapper.

- [ ] **Task 4 — Finalise the canonical page composition on `src/pages/index.astro`** (AC5, AC7)
  - [ ] 4.1 Verify the import block at the top of `src/pages/index.astro` pulls every Epic 2 section component in render order (Hero, Problem, InspectionStory, SocialProof, BlogPreviews, Faq, FooterCta).
  - [ ] 4.2 Verify the render order inside `<BaseLayout>` matches the canonical order from AC5.
  - [ ] 4.3 Verify `<Header>` and `<Footer>` are NOT imported or rendered directly (they belong to `<BaseLayout>`).
  - [ ] 4.4 Add the `TODO(epic-5): wire real social URLs from siteContent collection` comment at the `<BaseLayout>` call site (or confirm it already exists in `footer.astro`).
  - [ ] 4.5 Verify the three CTA slot wrappers (`data-cta-slot="hero" | "mid" | "footer"`) are all byte-for-byte consistent per AC6 — run `grep -rn 'data-cta-slot=' src/` and confirm exactly three hits with consistent structure.

- [ ] **Task 5 — Register the section in the text-expansion harness** (AC10)
  - [ ] 5.1 Update `src/pages/_demo/text-expansion.astro` to import and render `<FooterCtaSection />` with padded synthetic strings.
  - [ ] 5.2 Verify the harness at mobile / tablet / desktop breakpoints — no clipping, no overflow; the narrow `max-w-3xl` centred layout holds under 140% padding; white-on-dark-primary contrast is still visible.

- [ ] **Task 6 — Full-page scroll verification** (AC5)
  - [ ] 6.1 `npm run build && npm run preview` — confirm `/` builds cleanly.
  - [ ] 6.2 Manual scroll from top to bottom at mobile, tablet, desktop breakpoints.
  - [ ] 6.3 Verify: no layout shift, no broken images, no console errors, all three CTA placeholders visible.
  - [ ] 6.4 Verify: inspection-story sticky-phone behaviour activates at ≥768 px.
  - [ ] 6.5 Verify: FAQ accordion hydrates on `client:idle` and responds to click + keyboard.
  - [ ] 6.6 Verify: no horizontal scroll at any breakpoint.

- [ ] **Task 7 — a11y, contrast, keyboard, text-expansion audit** (AC2, AC5, AC6, AC10)
  - [ ] 7.1 DevTools axe-core zero violations on `/`.
  - [ ] 7.2 White-on-dark-primary contrast ≥10:1 for footer CTA `<h2>` (AAA).
  - [ ] 7.3 Heading outline: single `<h1>`, nine `<h2>`s (eight visible + one `sr-only` mid CTA), `<h3>`s only inside inspection story scenes, blog preview cards, and FAQ accordion triggers.
  - [ ] 7.4 Tab through `/` from header to footer — confirm the three disabled placeholder buttons are reachable per Story 2.1's hero-slot convention (i.e., whatever Tab behaviour the hero slot has, the mid and footer slots match).
  - [ ] 7.5 Screen-reader verification (VoiceOver / NVDA) — the three CTA slots each announce "Join the waitlist — coming soon, form wires in Epic 3".

- [ ] **Task 8 — Lighthouse CI budget verification** (AC9)
  - [ ] 8.1 `npm run build && npm run preview` → run `npx lhci autorun` (or the repo-specific Lighthouse command) locally.
  - [ ] 8.2 Verify Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1, initial weight <500 KB gzipped.
  - [ ] 8.3 Document the local Lighthouse scores in the dev record.
  - [ ] 8.4 If any budget fails, investigate with DevTools Lighthouse panel — identify the culprit chunk / asset and remediate at the smallest-possible scope.

- [ ] **Task 9 — Build, lint, type-check, final review** (AC11)
  - [ ] 9.1 `npx astro check` — 0 errors.
  - [ ] 9.2 `npx eslint . && npx prettier --check .` — clean.
  - [ ] 9.3 `npx vitest run` — all tests pass (no new tests).
  - [ ] 9.4 `npm run build && npm run preview` — clean.
  - [ ] 9.5 `package.json` unchanged.
  - [ ] 9.6 Document `/` initial-weight delta in dev record (~3 KB HTML, 0 KB JS).
  - [ ] 9.7 Final visual review — the landing page is complete.

## Dev Notes

### Architecture compliance — the non-negotiables

- **Tier-2 Astro section, zero JavaScript.** `FooterCtaSection` is a pure Astro composite with a named slot. The default fallback is a disabled button — no form, no client state, no island. Epic 3 Story 3.5 injects the React form island via the slot. [Source: CLAUDE.md § Architectural boundaries]
- **Mid-page CTA band is inline, not a Tier-2 section.** Inserted directly into `src/pages/index.astro` rather than extracted to `src/components/sections/mid-cta-section.astro`. Rationale: single consumer, single rendering, single find-and-replace target. A Tier-2 component would imply reuse that doesn't exist. [Source: AC4 rationale]
- **Three-tier import rule.** `FooterCtaSection` imports from `@/lib/i18n`, `@/components/sections/section-eyebrow.astro`. `src/pages/index.astro` imports every Epic 2 section component plus `@/lib/i18n` plus `@/layouts/BaseLayout.astro`. No new cross-tier imports. [Source: AR23]
- **All CTA slot wrappers use identical `data-cta-slot` / `data-testid` convention.** Epic 3 Story 3.5's find-and-replace contract — three grep hits, byte-for-byte consistent wrapper. [Source: AC6; Story 2.1 AC5 for hero slot shape]
- **No new islands.** This story adds zero JavaScript to the page. The existing Epic 2 islands (`MobileNav` from Story 1.4, `InspectionStoryScroll` from Story 2.4 / consumer wrapper from 2.5, `FaqAccordion` from Story 2.8) are the complete island set for Epic 2. [Source: AR27; Epic 2 scope]
- **Frozen upstream section contracts.** Every `<HeroSection>`, `<ProblemSection>`, `<InspectionStorySection>`, `<SocialProofSection>`, `<BlogPreviewsSection>`, `<FaqSection>` component is frozen from its own story. Do NOT edit them to accommodate Story 2.9. If a section does not compose cleanly, file a defect on the original story, don't hack it here. [Source: Story 2.1–2.8 frozen contracts]
- **FR52 V1 policy.** FR and DE `midCta` / `footerCta` blocks are byte-for-byte English copies. [Source: FR52]
- **Brand tokens only — no raw hex.** `--color-primary`, `--color-bg`, `--color-amber`, `--color-teal`, and whichever muted-on-dark token exists in `global.css`. Motion: this section has no motion. [Source: Story 1.7]
- **4 pt spacing grid.** All gaps / paddings / margins in multiples of 4 px. [Source: CLAUDE.md § Key conventions]
- **Single `<h1>` invariant.** Hero owns `<h1>`. Every other section uses `<h2>`. The mid-page CTA band uses `<h2 class="sr-only">`. [Source: UX-DR28]
- **Epic 2 color rhythm closes with dark primary.** The last slot in the rhythm is dark primary `#2E4057`. `<FooterCtaSection>` is the rhetorical bookend. [Source: Story 1.7 colour rhythm documentation]

### Why `max-w-3xl` and centred text for the footer CTA

The footer CTA is a **single-column rhetorical bookend** — one eyebrow, one headline, one subheadline, one CTA button. At `max-w-6xl` (the Epic 2 default), the centred text would stretch to 1152 px wide on desktop, which is wrong for single-column rhetorical content (same rationale as Story 2.8's FAQ section). `max-w-3xl` ≈ 48 rem ≈ 768 px ≈ ~80 characters wide keeps the CTA bookend readable and focused. This is the second Epic 2 section to deviate from the default container width, and the rationale is identical: single-column editorial content reads best at constrained widths.

Centring the text is a UX-DR3 requirement — the footer CTA is the page's rhetorical peak and centred text is the most visually prominent alignment. The hero's CTA is left-aligned because the hero has a two-column layout; the footer CTA is single-column, so centring is not just available but actively better.

### Why the mid-page CTA band is inline instead of a component

Option A (rejected): Extract to `src/components/sections/mid-cta-section.astro`. **Rejected** because:
1. **Single consumer.** The mid-page CTA band appears exactly once, on `/`, between two specific sections. A component implies reuse that does not exist and would not exist in Epic 3+ — Epic 3 Story 3.5 swaps the placeholder with a React form island in place, not by parameterising a reusable section.
2. **Find-and-replace target.** Epic 3 Story 3.5 will grep `data-cta-slot="mid"` and expect to find it in `src/pages/index.astro` — the landing-page composition file — because that's where the mid-page CTA lives conceptually. Extracting to a component adds a layer of indirection that complicates Epic 3's refactor.
3. **No reusable concerns.** The mid-page CTA band has no props, no variants, no internal state — it is a small markup block. A component wrapper would add ~15 lines of Astro frontmatter for zero abstraction benefit.

Option B (chosen): Inline markup directly in `src/pages/index.astro`. Three CTA slots, one per consumer page file, three find-and-replace targets in two files (hero in `hero-section.astro`, mid in `index.astro`, footer in `footer-cta-section.astro`). Clean, simple, grep-friendly.

### Why zero new JavaScript

Every CTA slot ships a disabled `<button>` as the V1 placeholder. Disabled buttons are static HTML — no state, no event handlers, no hydration. Epic 3 Story 3.5 swaps each placeholder with `<EmailCaptureBlock slot="cta" variant="..." />`, which IS a React island with `client:load` (the hero form) or `client:visible` (the mid / footer forms). At Story 2.9's checkpoint, the page has **exactly four islands**: `MobileNav` (Story 1.4), `InspectionStoryScroll` consumer wrapper (Story 2.5), `FaqAccordion` (Story 2.8), and any other leftover — *none* are added or removed by this story. The JS budget delta is 0 KB.

### Previous-story intelligence

- **Story 1.4** (`BaseLayout`, `Header`, `Footer`, `SectionEyebrow`). The shell that owns `<Header>` and `<Footer>`. Do NOT touch. The `SectionEyebrow` component's `variant="dark"` is the first consumer of the dark variant — if the component does not expose it, file a Story 1.4 defect. [Source: src/components/sections/section-eyebrow.astro]
- **Story 2.1** (`HeroSection`, hero CTA slot). The canonical CTA slot pattern. `data-cta-slot="hero"`, `data-testid="hero-cta-slot"`, disabled button with `<span class="sr-only"> — coming soon, form wires in Epic 3</span>`. Match byte-for-byte for the mid and footer slots. [Source: src/components/sections/hero-section.astro; Story 2.1 AC5]
- **Story 2.2** (`ProblemSection`). Canonical pure-Astro Tier-2 section shape. Copy the header-comment structure. [Source: src/components/sections/problem-section.astro]
- **Story 2.4 / 2.5** (`InspectionStoryScroll` + scene consumer). Already mounted on `/` by Story 2.5. Do NOT re-mount or edit. [Source: Story 2.5 AC5]
- **Story 2.6 / 2.7 / 2.8** (social proof / blog previews / FAQ). Each already mounted on `/` by its own story. Do NOT re-mount or edit. This story's Task 4 is to **verify** the composition order, not to re-add sections. [Source: Stories 2.6 / 2.7 / 2.8 page-composition ACs]
- **Story 1.7** (colour rhythm, motion tokens, reduced-motion kill-switch, focus indicators, heading hierarchy). The design conventions every Epic 2 section inherits. [Source: src/styles/global.css; docs/design-conventions.md if present]

### Cross-epic contracts

- **Epic 3 Story 3.5** is the direct downstream consumer of this story. Its job is: swap every `<div data-cta-slot="hero|mid|footer" ...><button disabled>...</button></div>` with `<EmailCaptureBlock slot="cta" variant="hero|mid|footer" />`. Story 3.5 should touch exactly three files (`src/components/sections/hero-section.astro`, `src/pages/index.astro`, `src/components/sections/footer-cta-section.astro`) and should be a mechanical find-and-replace with minor formatting fixes. If Story 3.5's implementation cannot achieve this with a grep + edit, that is a Story 2.9 defect.
- **Epic 3 Story 3.4** creates the `<EmailCaptureBlock>` Tier-2 composite and the `WaitlistForm` React island. This story's placeholder buttons must NOT anticipate `<EmailCaptureBlock>`'s eventual prop shape — the only contract is the outer wrapper's `data-cta-slot` attribute, which Epic 3 Story 3.5 can inspect to pick the right `variant` prop.
- **Epic 5 Story 5.4** migrates hard-coded strings to `siteContent` collection reads. The `midCta` / `footerCta` i18n keys will migrate to the collection. The `TODO(epic-5)` comment in this story marks one such migration point (social URLs); the other migration points (`landing.hero.*`, `landing.problem.*`, etc.) are already documented in the relevant upstream stories.
- **Epic 8 Story 8.1** creates post-launch variants of `HeroSection` and `FooterCtaSection` with App Store / Google Play buttons replacing the waitlist CTA. The `FooterCtaSection` file ships a **pre-launch default** in this story; Story 8.1 will either add a `phase` prop or create a sibling `footer-cta-section--post.astro` — that is Epic 8's choice. This story does NOT ship the post-launch variant or any phase switch.

### Files you will create / modify

**Create:**
- `src/components/sections/footer-cta-section.astro`

**Modify:**
- `src/i18n/en/landing.json` (add `midCta` and `footerCta` blocks)
- `src/i18n/fr/landing.json` (byte-for-byte copies — FR52)
- `src/i18n/de/landing.json` (byte-for-byte copies — FR52)
- `src/pages/index.astro` (import `FooterCtaSection`, insert mid-page CTA band between `<InspectionStorySection />` and `<SocialProofSection />`, render `<FooterCtaSection />` at the end, add `TODO(epic-5)` comment for social URLs if not already present)
- `src/pages/_demo/text-expansion.astro` (register the new footer CTA section under 140 % padded synthetic strings)

**Do NOT touch:**
- `src/components/sections/hero-section.astro`, `problem-section.astro`, `inspection-story-section.astro`, `social-proof-section.astro`, `blog-previews-section.astro`, `faq-section.astro`, `_blog-preview-placeholder.astro`, `section-eyebrow.astro` (unless the dark variant is missing — then minimal extension only, documented in dev record), `header.astro`, `footer.astro`, `stat-card.astro`, `trust-quote-card.astro`
- `src/components/islands/*` — no new islands, no edits to `MobileNav` / `InspectionStoryScroll` / `FaqAccordion` / scene consumer wrapper
- `src/lib/stores/*`
- `src/layouts/BaseLayout.astro`
- `src/lib/i18n.ts`, `src/lib/env.ts`, `src/lib/utils.ts`
- `src/styles/global.css` (unless a missing brand token blocks progress — document any extension)
- `tailwind.config.ts`, `astro.config.mjs`, `lighthouse/budget.json`, `package.json`
- Any Vitest file

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** edit `hero-section.astro` to reword its CTA slot. The hero slot is a frozen Story 2.1 contract; just verify its `data-cta-slot="hero"` / `data-testid="hero-cta-slot"` convention matches the mid and footer slots.
- ❌ **Do NOT** create a `<MidPageCtaSection />` component. Inline markup in `src/pages/index.astro` is the deliberate choice.
- ❌ **Do NOT** add any `client:*` directive to the footer CTA or the mid-page band. Pure Astro, server-rendered placeholders.
- ❌ **Do NOT** introduce a new form, email input, honeypot, or Turnstile widget. All of that is Epic 3.
- ❌ **Do NOT** `import { EmailCaptureBlock } from '@/components/forms/email-capture-block.astro';` — that component does not exist yet.
- ❌ **Do NOT** add `phase` or `variant` props to `FooterCtaSection` for Epic 8 anticipation. Epic 8 Story 8.1 will extend or fork.
- ❌ **Do NOT** rename the `data-cta-slot` or `data-testid` attributes. Epic 3's find-and-replace contract depends on them.
- ❌ **Do NOT** differentiate the three CTA labels at V1 (all three read `"Join the waitlist"`). Epic 3 may A/B test labels later.
- ❌ **Do NOT** machine-translate FR / DE. Byte-for-byte English copies per FR52.
- ❌ **Do NOT** hard-code marketing strings. Every visible value routes through `t()`.
- ❌ **Do NOT** use `<Footer>` directly on `index.astro` — it belongs to `<BaseLayout>`.
- ❌ **Do NOT** use `max-w-6xl` for the footer CTA. `max-w-3xl` is the editorial width for a single-column bookend.
- ❌ **Do NOT** wrap the footer CTA's `<h2>` in a decorative container that breaks contrast — white-on-dark-primary must be ≥10:1.
- ❌ **Do NOT** add a new Vitest file.
- ❌ **Do NOT** add entrance animations to the footer CTA or the mid-page band. Static content. Epic 2's motion policy is CSS-only and scroll-driven, not mandatory.
- ❌ **Do NOT** hard-code real social URLs in `<Footer>` or anywhere else. The `TODO(epic-5)` comment is the handoff.
- ❌ **Do NOT** claim the story complete without running the full manual scroll + Lighthouse + axe audit on the built `/`.
- ❌ **Do NOT** relax `lighthouse/budget.json` if a budget fails. Investigate the root cause and remediate at the smallest-possible scope.
- ❌ **Do NOT** ship a clickable anchor or button that navigates anywhere in V1. Every CTA is a disabled placeholder.

### Project Structure Notes

- **Alignment with unified structure:** New section in `src/components/sections/`, i18n updates in `src/i18n/{en,fr,de}/landing.json`, page composition edits in `src/pages/index.astro`, harness update in `src/pages/_demo/text-expansion.astro`. No new directories. No new islands. No new libraries. No new dependencies.
- **Variances from plan:** `max-w-3xl` (not `max-w-6xl`) for the footer CTA and mid-page band — documented. Centred text for the footer CTA — per UX-DR3. No Tier-2 `<MidPageCtaSection />` component — inline in `index.astro` by design. `<h2 class="sr-only">` in the mid-page band to satisfy the `aria-labelledby` requirement without adding a second visible heading — standard a11y pattern.
- **Verification that this story is the Epic 2 checkpoint:** After this story ships, `sprint-status.yaml` has every Epic 2 story in `review` or `done` status, `src/pages/index.astro` renders the full canonical landing page, Lighthouse passes every budget, and Epic 3 is unblocked. A reviewer running `npm run build && npm run preview` should see a complete, coherent, visually finished landing page with three placeholder CTAs that will become real waitlist forms in Epic 3.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Architectural boundaries, § Hydration policy, § Key conventions, § Anti-patterns]
- [Source: epics-truvis-landing-page.md:1040-1075 — Story 2.9 complete BDD]
- [Source: epics-truvis-landing-page.md — UX-DR3 dark footer CTA bookend, UX-DR9 FooterCtaSection scope, UX-DR28 heading hierarchy, UX-DR29 focus indicators, UX-DR30 contrast, UX-DR31 text expansion]
- [Source: epics-truvis-landing-page.md — FR7 multi-position CTAs, FR11 social media profile links (deferred to Epic 5), FR52 V1 i18n policy, FR54 zero-downtime launch phase (Epic 8)]
- [Source: prd-truvis-landing-page.md NFR1 LCP, NFR3 CLS, NFR5 initial weight, NFR6 Lighthouse Performance, NFR25 accessibility, NFR26 text expansion, NFR39 SEO]
- [Source: architecture-truvis-landing-page.md § Component Tiers, § AR23, § AR27, § Palette rhythm]
- [Source: src/components/sections/hero-section.astro — canonical CTA slot wrapper shape (Story 2.1)]
- [Source: src/components/sections/problem-section.astro — canonical pure-Astro Tier-2 section shape (Story 2.2)]
- [Source: src/components/sections/section-eyebrow.astro — eyebrow component; confirm dark-variant prop name]
- [Source: src/components/sections/social-proof-section.astro, blog-previews-section.astro, faq-section.astro — upstream Epic 2 sections already mounted on `/`]
- [Source: src/layouts/BaseLayout.astro — shell owner of `<Header>` + `<Footer>`]
- [Source: src/i18n/en/landing.json — existing `landing.hero.ctaPlaceholder` pattern for the placeholder CTA string]
- [Source: src/lib/i18n.ts — `t()` helper, `Locale` type]
- [Source: src/pages/index.astro — current Epic 2 composition surface]
- [Source: src/pages/_demo/text-expansion.astro — harness registration pattern]
- [Source: src/styles/global.css — brand tokens; `--color-primary`, `--color-bg`, `--color-amber`, `--color-teal`, muted-on-dark]
- [Source: lighthouse/budget.json — Lighthouse CI budget gates (Story 1.2)]
- [Source: _bmad-output/implementation-artifacts/2-1-build-herosection-with-micro-story-headline-phone-mockup-and-cta-slot.md — canonical hero CTA slot convention]
- [Source: _bmad-output/implementation-artifacts/2-5 / 2-6 / 2-7 / 2-8 — upstream Epic 2 sections and their canonical page-composition ACs]
- [Source: _bmad-output/implementation-artifacts/1-4-build-baselayout-header-footer-mobilenav-drawer-and-sectioneyebrow-shell.md — BaseLayout, Header, Footer, SectionEyebrow contracts]
- [Source: _bmad-output/implementation-artifacts/1-6-wire-astro-built-in-i18n-routing-and-locale-detection-middleware.md — `t()` helper, FR52]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — colour rhythm, heading hierarchy, contrast conventions]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.

### File List

### Change Log

| Date | Change |
| ---- | ------ |
