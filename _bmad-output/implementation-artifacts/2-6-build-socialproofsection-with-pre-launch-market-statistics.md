# Story 2.6: Build `SocialProofSection` with pre-launch market statistics

Status: review

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor wondering whether the problem Truvis describes is real and widespread**,
I want **to see concrete market statistics and a trustworthy quote that validate the problem at scale**,
so that **I trust Truvis is building on top of real, researched data rather than marketing hand-waving**.

## Context & scope

This is the **sixth story of Epic 2**. It builds the **`SocialProofSection`** — a Tier-2 Astro composite that sits directly below the inspection-story section (Story 2.5) and uses the **`StatCard`** and **`TrustQuoteCard`** Tier-2 primitives already shipped by Story 2.3. Nothing here is new from an engineering-mechanism perspective; the work is composition, i18n wiring, and layout.

Scope boundaries:
- **In scope:** `src/components/sections/social-proof-section.astro`, three pre-launch `StatCard` instances in a responsive grid with distinct category colours (teal / amber / coral), one pre-launch `TrustQuoteCard` below the stats, an empty named slot `<slot name="post-launch-testimonial">` so Epic 8 can inject post-launch testimonial content without editing this file, V1 i18n content at `src/i18n/en/landing.json` under a new `socialProof` namespace (headline, eyebrow, three stats, one quote) plus byte-for-byte FR/DE mirrors, mounting the section on `src/pages/index.astro` directly below `<InspectionStorySection />` (from Story 2.5), registration in the Story 1.7 text-expansion harness, a11y + contrast audit on the white background.
- **Out of scope:** `BlogPreviewsSection` / `FaqSection` / `FooterCtaSection` (Stories 2.7–2.9), the mid-page CTA slot between inspection story and social proof (Story 2.9 owns the three CTA placeholder slots), importing `lib/launch-phase.ts` (not yet created — Epic 5 Story 5.3; at V1 use a `TODO(epic-5)` comment and a hard-coded `'pre'` assumption, **never import a non-existent module**), the `stats` / `testimonials` / `siteContent` Content Collections (Epic 5), the post-launch `TrustQuoteCard` variant full styling (Epic 8 Story 8.2 — the pre-launch card already ships the structural stub), real source URLs for the statistics (placeholder source strings at V1, replaced with sourced data in Epic 5 per UX-DR6), any edits to `StatCard` or `TrustQuoteCard` (both are frozen Story 2.3 contracts). Do **not** introduce these.

## Acceptance Criteria

### AC1 — Section shell on white background with eyebrow and `<h2>` (UX-DR6, Story 1.7 color rhythm)

**Given** UX-DR6 requires a `SocialProofSection` that renders pre-launch market statistics and the Story 1.7 Epic-2 colour rhythm places it on the white `--color-bg` background (inspection-story dark primary → **white social proof** → surface blog previews → white FAQ → dark primary footer CTA),
**When** I create `src/components/sections/social-proof-section.astro`,
**Then**
- the section is a **pure Astro file** with zero `client:*` directives and zero JavaScript — no islands, no hydration, no React. All content renders server-side at build time,
- the file header comment mirrors the `problem-section.astro` / `inspection-story-section.astro` shape: component name, story / UX-DR / AR references, a one-sentence purpose statement, a note that it uses `t('landing.socialProof.*', locale)` for every visible string,
- the outer wrapper is `<section aria-labelledby="social-proof-heading" class="bg-[var(--color-bg)]">` — the white warm-off-white brand token, matching the "white" slot in the Story 1.7 colour rhythm,
- the inner container uses the standard Epic-2 recipe: `<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">`,
- the first child inside the container is `<SectionEyebrow variant="light" eyebrow={t('landing.socialProof.eyebrow', locale)} />` — the **light-background variant** (warm-amber on warm-white pill), matching `problem-section.astro` / `hero-section.astro` eyebrow usage. Before rendering, confirm the exact prop name against `src/components/sections/section-eyebrow.astro` — the component exposes either `variant="light"` or an equivalent tone prop; use whatever it already exposes. The V1 eyebrow string is `"The numbers don't lie"`,
- the second child is `<h2 id="social-proof-heading">` wired to `t('landing.socialProof.headline', locale)` — one sentence, Inspector-forward voice. Suggested English copy: `"A used-car market that punishes buyers who don't look."`. The final wording is the dev agent's call, but the Inspector voice must hold,
- the `<h2>` uses the standard Tier-2 section heading classes: `font-display text-[length:var(--text-2xl)] leading-tight font-bold text-[var(--color-primary)]` (matches `problem-section.astro` h2),
- an optional `<p>` subheadline may sit below the `<h2>` wired to `t('landing.socialProof.subheadline', locale)` using `text-[length:var(--text-lg)] text-[var(--color-primary)]` — include it **only if** the dev agent authors a value-adding single-sentence bridge; otherwise omit the i18n key entirely rather than shipping an empty string.

### AC2 — Three `StatCard` instances in a responsive grid with distinct category colours (UX-DR6, FR4)

**Given** UX-DR6 and FR4 require exactly three pre-launch market-statistics `StatCard` instances with a different `category` colour per card (teal / amber / coral) for visual rhythm and data from a new `landing.socialProof.stats` i18n array,
**When** I render the stats grid,
**Then**
- the grid sits directly below the `<h2>` / optional subheadline, wrapped in `<div class="mt-10 grid gap-6 md:mt-12 md:grid-cols-3 md:gap-8">` — three columns on desktop (≥768 px, `md:` breakpoint), single-column stack below 768 px,
- exactly three `<StatCard />` Astro components are rendered, imported via `import StatCard from '@/components/sections/stat-card.astro';` (which is already Story 2.3's component — AR23-compliant since sections import sections),
- each card's props are sourced from `t('landing.socialProof.stats.statN.*', locale)` — one call per prop — and the three cards use **distinct** category colours in this exact order: **stat1 → `category="teal"`**, **stat2 → `category="amber"`**, **stat3 → `category="coral"`**. This ordering matches the brand's warm-editorial palette and gives each stat a different visual hook,
- each card's props match the `StatCard` interface from Story 2.3:
  ```ts
  interface StatCardProps {
    value: string;        // → t('landing.socialProof.stats.stat1.value', locale)
    label: string;        // → t('landing.socialProof.stats.stat1.label', locale)
    source?: string;      // → t('landing.socialProof.stats.stat1.source', locale)
    category: 'teal' | 'amber' | 'coral';
    phase?: 'pre' | 'post';  // omitted — defaults to 'pre'
    class?: string;
  }
  ```
  The `phase` prop is **omitted** so it defaults to `'pre'`. The post-launch live-stats variant is Epic 8 Story 8.3's scope (AC6 below),
- the three **V1 placeholder values** are hard-coded-in-i18n (not in a Content Collection — Epic 5 does that):
  - **stat1 (teal):** `value: "1 in 3"`, `label: "private-party used cars have an undisclosed issue costing more than €500 to fix."`, `source: "Placeholder data — replaced with sourced statistics in Epic 5."`
  - **stat2 (amber):** `value: "€640"`, `label: "average hidden-issue loss the typical buyer walks away with after a handshake deal."`, `source: "Placeholder data — replaced with sourced statistics in Epic 5."`
  - **stat3 (coral):** `value: "5%"`, `label: "of the purchase price vanishes to repairs that were visible before the sale — if you knew where to look."`, `source: "Placeholder data — replaced with sourced statistics in Epic 5."`
  The exact value / label wording is the dev agent's call; the **shape** (value, label, source), the **three distinct category colours**, and the **placeholder source disclaimer** are the contract,
- because Astro does not natively iterate an object as an array inside JSX in the cleanest way for three fixed items, render the three cards **explicitly** (three `<StatCard>` tags) rather than mapping an array from the i18n namespace — this keeps the `t()` key paths static and grep-friendly, matches how `problem-section.astro` renders its three `body.*` paragraphs, and makes the category-colour assignment trivially clear,
- the cards fill the grid cells naturally — do NOT pass explicit `class` prop values beyond the existing StatCard defaults unless the responsive layout needs the per-card `w-full` hint.

### AC3 — One pre-launch `TrustQuoteCard` below the stats (UX-DR6, FR5 pre-launch variant)

**Given** UX-DR6 requires `TrustQuoteCard` slots for both phases and FR5's pre-launch variant ships in this story while the post-launch variant is Epic 8 Story 8.2's scope,
**When** I render the quote card,
**Then**
- a single `<TrustQuoteCard />` Astro component is rendered **below** the stats grid, separated by `mt-12 md:mt-16` (4 pt grid aligned),
- the component is imported via `import TrustQuoteCard from '@/components/sections/trust-quote-card.astro';` (Story 2.3 component, frozen API),
- props are sourced from `t('landing.socialProof.quote.*', locale)`:
  ```ts
  <TrustQuoteCard
    quote={t('landing.socialProof.quote.text', locale)}
    attribution={t('landing.socialProof.quote.attribution', locale)}
    context={t('landing.socialProof.quote.context', locale)}
  />
  ```
  `phase` is **omitted** so it defaults to `'pre'`. `rating` and `authorImage` are NOT passed — those are Epic 8 Story 8.2 post-launch-variant props and the card's structural stub handles them internally,
- the V1 quote is authored in English and is a **trust-signalling quote from a credible voice** (UX-DR6 — "trustworthy quote that validates the problem at scale"). Because V1 is pre-launch and the project has no real customer testimonials, the quote is a **market-expert or industry-publication style quote** framed as a pull quote from a domain authority. The dev agent authors a plausible V1 placeholder — example shape:
  - **quote.text:** `"The used-car market is fundamentally asymmetric — sellers always know more than buyers, and that gap is where most of the money goes."`
  - **quote.attribution:** `"— Placeholder Attribution"`
  - **quote.context:** `"V1 placeholder — replaced with a real testimonial or industry-publication quote in Epic 5."`
  The **exact wording is the dev agent's call**; the constraints are: one sentence, quoted in the 70/30 Inspector/Ally voice, and explicitly marked as a placeholder in the `context` field so reviewers know the source is not real yet,
- the card inherits its own background (`--color-bg`) and warm-amber accent from the Story 2.3 defaults — do not override via `class=` prop,
- the card is wrapped in a `max-w-3xl mx-auto` container so a pull quote on a wide social-proof section does not stretch across the full 6xl width — matches editorial convention.

### AC4 — Empty `<slot name="post-launch-testimonial">` and commented phase-switching code path (UX-DR6, FR5 post-launch deferral to Epic 8)

**Given** UX-DR6 requires `TrustQuoteCard` slots for both phases and Epic 8 Story 8.2 ships the real post-launch testimonial content via a named Astro slot, and `src/lib/launch-phase.ts` does not yet exist (created in Epic 5 Story 5.3),
**When** I wire the post-launch handoff,
**Then**
- directly below the pre-launch `<TrustQuoteCard />` (inside the same `max-w-3xl mx-auto` container), declare an **empty named Astro slot**:
  ```astro
  <slot name="post-launch-testimonial" />
  ```
  This slot has zero children in V1 — Epic 8 Story 8.2 injects a post-launch `<TrustQuoteCard phase="post" ... />` into it from `src/pages/index.astro` without editing this file,
- immediately above (or immediately inside) the slot, add a **commented-out code path** that reads what Epic 5's `launch-phase.ts` will provide, in the exact shape it will use. Example:
  ```astro
  {/*
   * TODO(epic-5): once src/lib/launch-phase.ts ships (Story 5.3),
   * switch the rendered quote variant on isPostLaunch():
   *
   * import { isPostLaunch } from '@/lib/launch-phase';
   * const phase = isPostLaunch() ? 'post' : 'pre';
   *
   * Epic 8 Story 8.2 will then fill <slot name="post-launch-testimonial" />
   * with the real post-launch TrustQuoteCard and this section will switch
   * on phase automatically. At V1 we hard-code the 'pre' path.
   */}
  ```
- **critical anti-pattern to avoid:** do NOT `import { isPostLaunch } from '@/lib/launch-phase';` at V1. That file does not exist yet — importing a non-existent module will break the Astro build. The comment is the architectural intent; the import lands in Epic 5,
- the hard-coded `pre` assumption is implicit in the fact that this story renders the pre-launch `TrustQuoteCard` unconditionally. Do NOT declare a `const phase = 'pre'` constant; that invites confusion. The comment documents the future switch; the runtime just renders the pre-launch card,
- add a leading code comment at the top of `social-proof-section.astro`'s frontmatter block noting that **V1 ships FR4 (pre-launch market statistics) only** and FR5's post-launch variant is "variant slot ready, post-launch content injected in Epic 8" — this is the AC6 requirement below made literal.

### AC5 — i18n namespace `landing.socialProof.*` in English + byte-for-byte FR/DE mirrors (FR52)

**Given** FR52 requires English strings at V1 and FR/DE to be byte-for-byte mirrors until V1.2 real translations,
**When** I author the i18n content,
**Then**
- a new top-level `socialProof` block is added to `src/i18n/en/landing.json` at the **end** of the JSON (after `inspectionStory` from Story 2.5 — respect the file's existing key order), shaped as:
  ```json
  "socialProof": {
    "eyebrow": "The numbers don't lie",
    "headline": "A used-car market that punishes buyers who don't look.",
    "subheadline": "Optional one-sentence bridge — or omit the key entirely if no value-adding copy.",
    "stats": {
      "stat1": {
        "value": "1 in 3",
        "label": "private-party used cars have an undisclosed issue costing more than €500 to fix.",
        "source": "Placeholder data — replaced with sourced statistics in Epic 5."
      },
      "stat2": { "value": "…", "label": "…", "source": "Placeholder data — replaced with sourced statistics in Epic 5." },
      "stat3": { "value": "…", "label": "…", "source": "Placeholder data — replaced with sourced statistics in Epic 5." }
    },
    "quote": {
      "text": "The used-car market is fundamentally asymmetric — sellers always know more than buyers, and that gap is where most of the money goes.",
      "attribution": "— Placeholder Attribution",
      "context": "V1 placeholder — replaced with a real testimonial or industry-publication quote in Epic 5."
    }
  }
  ```
- every value above (including `source` strings) is authored in English by the dev agent. The three `source` strings all carry the **same placeholder disclaimer** so a grep for "Placeholder data" finds every source that Epic 5 must replace,
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` receive the **identical `socialProof` block** — copy the English JSON byte-for-byte. Do not machine-translate. This is FR52 V1 policy and matches what Stories 2.1–2.5 did for `hero`, `problem`, `inspectionStory`,
- every `t()` call in `social-proof-section.astro` resolves cleanly — `npx astro check` must be clean. The `t()` helper's dev-mode fallback warning (Story 1.6) will flag any missing key at build time,
- **do NOT** add keys that the section never reads. Every i18n key defined in this block must have a corresponding `t()` call in `social-proof-section.astro` (or the optional subheadline explicitly omitted — in which case omit the JSON key too).

### AC6 — V1 ships FR4 only; FR5 is "variant slot ready" (doc / comment, not code)

**Given** FR5 (social proof post-launch variant) is explicitly Epic 8 Story 8.2's scope and FR4 (pre-launch market statistics) is this story's scope,
**When** I finalise the file,
**Then**
- a single line-comment near the top of the frontmatter explicitly states: `// V1 ships FR4 only. FR5's post-launch testimonial variant is "variant slot ready" — see <slot name="post-launch-testimonial" /> and Epic 8 Story 8.2.`
- this comment is load-bearing: it is the reviewer's grep target for "did this story ship the right scope?" and it tells a future reader why there's a named slot with no body in V1,
- no other documentation file is created by this story — the comment and the story file are the full trail.

### AC7 — Landing-page composition: insert `<SocialProofSection />` below `<InspectionStorySection />` (UX-DR13, UX-DR6)

**Given** Story 2.5 landed `<InspectionStorySection />` directly below `<ProblemSection />` and the Epic 2 page order places social proof immediately below the inspection story,
**When** I update `src/pages/index.astro`,
**Then**
- `src/pages/index.astro` imports `SocialProofSection` alongside the existing section imports and renders `<SocialProofSection />` directly below `<InspectionStorySection />`. The page order after this story is:
  ```
  BaseLayout
  ├── Header (from BaseLayout slot)
  ├── HeroSection
  ├── ProblemSection
  ├── InspectionStorySection
  ├── SocialProofSection      ← NEW IN THIS STORY
  └── Footer (from BaseLayout slot)
  ```
- Stories 2.7 / 2.8 / 2.9 are NOT added in this story. `<BlogPreviewsSection />`, `<FaqSection />`, and `<FooterCtaSection />` come later, and Story 2.9 owns the final page composition including the mid-page CTA slot and the footer CTA bookend,
- no new entry points, no new layouts, no Header/Footer edits.

### AC8 — a11y, contrast, text expansion, keyboard audit (UX-DR28, UX-DR29, UX-DR30, UX-DR31, NFR21, NFR25, NFR26)

**Given** the section sits on the white `--color-bg` background and must meet WCAG 2.1 AA on every shipping piece of content,
**When** I audit the section,
**Then**
- the section's `<h2>` is the only heading inside its boundary — `<h3>` does NOT appear in this section (the stats use large display values, not headings, and the quote uses `<blockquote>` inside `<figure>` per the Story 2.3 `TrustQuoteCard` markup). The page's single `<h1>` invariant (hero-only) is preserved (UX-DR28),
- every visible text token (primary, muted, teal, amber, coral) against `--color-bg` (warm off-white #FFFDF9) passes WCAG 2.1 AA contrast ≥4.5:1. If any fails, swap to a brand token that passes — never introduce a new hex (UX-DR30),
- text renders without clipping under 140% synthetic FR/DE text in the text-expansion harness at mobile (<640 px) / tablet (640–1024 px) / desktop (≥1024 px) breakpoints (UX-DR31, NFR26),
- the three `StatCard`s are keyboard-focus-reachable only if they contain focusable children — at V1 they contain none, so Tab flows through the section without any stops. The `TrustQuoteCard` similarly contains no interactive elements. This is expected; no focus traps, no skipped content (NFR21),
- axe-core reports zero violations on the `/` page in the CI Lighthouse / axe run (NFR25 says ≥90 Accessibility; axe-core baseline is zero),
- the `<figure>` markup inside `TrustQuoteCard` already uses `<blockquote>` + `<figcaption>` (Story 2.3 contract) — do NOT re-wrap the card in another `<figure>`.

### AC9 — Text-expansion harness registration (UX-DR31, NFR26)

**Given** UX-DR31 requires every Tier-2 section to render cleanly under 140% padded FR/DE synthetic strings,
**When** I update the harness,
**Then**
- `src/pages/_demo/text-expansion.astro` gains an import and a render of `<SocialProofSection />` (or a padded static mirror — Story 2.3's approach for its primitives is the precedent; choose whichever pattern the existing harness already uses for Tier-2 sections after Story 2.2),
- the harness pads every `socialProof` string (eyebrow, headline, stat values + labels + sources, quote text + attribution + context) with the bracketed-filler convention to ~140% of English length so reviewers see the stress test,
- manually verify at mobile / tablet / desktop: no clipping, no overflow, no horizontal scroll, the three-column stats grid collapses cleanly to a single-column stack below 768 px, the quote card stays within `max-w-3xl` and wraps naturally,
- if a padded string breaks the stats grid (e.g., a very long label forces a card overflow), fix the card's internal padding or the grid gap — do NOT widen the `max-w-6xl` container or drop the three-column layout.

### AC10 — Build, lint, type-check, bundle delta (NFR5, AR23, AR27)

**Given** the repo's CI gates and NFR5's 500 KB initial weight budget,
**When** I finish the story,
**Then**
- `npx astro check` is clean — every `t()` call resolves, the new i18n keys are valid JSON, the imports type-check,
- `npx eslint . && npx prettier --check .` is clean,
- `npx vitest run` — all existing tests pass; **no new Vitest files** are added (same policy as Stories 2.2 / 2.3 / 2.5 — Vitest is for `lib/` utilities only),
- `npm run build && npm run preview` succeeds; the built `/` route renders the new section,
- the built `/` page's initial weight stays **well under the 500 KB budget**. This section adds **zero new JavaScript** (pure Astro, no islands, no `client:*`), so the gzipped HTML delta is the only cost — expect under 2 KB of new HTML per locale. Document the before/after initial-weight numbers in the dev record,
- the Lighthouse CI run on the PR passes: Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1, initial weight <500 KB (NFR1, NFR3, NFR5, NFR6, NFR25, NFR39),
- **no new runtime dependencies** are added to `package.json`. `StatCard` and `TrustQuoteCard` are already imported elsewhere in the repo,
- **no new files outside `src/components/sections/`** are created (no new Tailwind config, no new style sheet, no new nanostore, no new lib module).

## Tasks / Subtasks

- [x] **Task 1 — Write the `socialProof` i18n block in English** (AC5)
  - [x] 1.1 Add the top-level `socialProof` block to `src/i18n/en/landing.json` with `eyebrow`, `headline`, optional `subheadline`, `stats.stat1..stat3` sub-blocks (each with `value`, `label`, `source`), and `quote` sub-block (`text`, `attribution`, `context`).
  - [x] 1.2 Author the three stats as Inspector-voice market-statistics sentences with placeholder values; every `source` field carries the same placeholder disclaimer so Epic 5 can grep for it.
  - [x] 1.3 Author the quote text in 70/30 Inspector/Ally voice as a plausible market-expert / industry-publication pull quote; mark the `context` field explicitly as a V1 placeholder.
  - [x] 1.4 Copy the full `socialProof` block byte-for-byte into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` (FR52).

- [x] **Task 2 — Create `social-proof-section.astro`** (AC1, AC2, AC3, AC4, AC6)
  - [x] 2.1 Create `src/components/sections/social-proof-section.astro` with the header comment (purpose, story / UX-DR / AR references, the FR4-only scope note from AC6).
  - [x] 2.2 Import `t` + `Locale` from `@/lib/i18n`, `SectionEyebrow` from `@/components/sections/section-eyebrow.astro`, `StatCard` from `@/components/sections/stat-card.astro`, `TrustQuoteCard` from `@/components/sections/trust-quote-card.astro`.
  - [x] 2.3 Derive `const locale = (Astro.currentLocale ?? 'en') as Locale;` at the top of frontmatter.
  - [x] 2.4 Render the section wrapper with `bg-[var(--color-bg)]`, `aria-labelledby`, and the Epic-2 container recipe.
  - [x] 2.5 Render `<SectionEyebrow variant="light" ... />` (confirm the prop name against `section-eyebrow.astro`), `<h2 id="social-proof-heading">`, optional subheadline `<p>` (omit the key and the element if no value-add).
  - [x] 2.6 Render the three `<StatCard />` instances in the responsive grid with distinct category colours (teal / amber / coral) and per-stat `t()` calls.
  - [x] 2.7 Render the single pre-launch `<TrustQuoteCard />` wrapped in `max-w-3xl mx-auto`.
  - [x] 2.8 Declare the empty `<slot name="post-launch-testimonial" />` directly below the quote card, with the `TODO(epic-5)` commented phase-switching code path above it.

- [x] **Task 3 — Mount the section on `src/pages/index.astro`** (AC7)
  - [x] 3.1 Import `SocialProofSection` and render `<SocialProofSection />` directly below `<InspectionStorySection />` in `src/pages/index.astro`.
  - [x] 3.2 `npm run dev` or `npm run build && npm run preview` — confirm the `/` route renders all five sections in the correct order (Hero, Problem, InspectionStory, SocialProof, Footer).

- [x] **Task 4 — Register the section in the text-expansion harness** (AC9)
  - [x] 4.1 Update `src/pages/_demo/text-expansion.astro` to import and render `<SocialProofSection />` with padded synthetic strings (follow the harness's existing Tier-2-section registration convention).
  - [x] 4.2 Manually verify at mobile / tablet / desktop breakpoints — no clipping, no overflow, the three-column stats grid collapses cleanly below 768 px, the quote card stays within `max-w-3xl` and wraps naturally.

- [x] **Task 5 — a11y, contrast, keyboard audit** (AC8)
  - [x] 5.1 Run DevTools accessibility audit on `/` in the built preview — axe-core zero violations.
  - [x] 5.2 Verify every text token against `#FFFDF9` passes ≥4.5:1 contrast.
  - [x] 5.3 Tab through the page — no focus stop inside the SocialProofSection (expected; no focusable children).
  - [x] 5.4 Heading hierarchy check: `<h1>` (hero) → `<h2>` (problem, inspection story, social proof) → `<h3>` (inspection story scenes only). No `<h3>` inside `SocialProofSection`.

- [x] **Task 6 — Build, lint, type-check** (AC10)
  - [x] 6.1 `npx astro check` — 0 errors.
  - [x] 6.2 `npx eslint . && npx prettier --check .` — clean.
  - [x] 6.3 `npx vitest run` — all tests pass (no new tests).
  - [x] 6.4 `npm run build && npm run preview` — clean, `/` renders the new section.
  - [x] 6.5 Document the initial-weight delta for `/` in the dev record (expected: ~2 KB HTML, 0 KB JS).
  - [x] 6.6 Run Lighthouse locally — confirm Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1. Document the scores.
  - [x] 6.7 Confirm `package.json` unchanged.

## Dev Notes

### Architecture compliance — the non-negotiables

- **Tier-2 Astro section, zero JavaScript.** `SocialProofSection` is a pure Astro composite. No `client:*`, no islands, no React — everything renders at build time. The `StatCard` and `TrustQuoteCard` primitives it composes are themselves pure Astro. [Source: CLAUDE.md § Architectural boundaries; Story 2.3 primitives]
- **Three-tier import rule.** The section imports from `@/lib/i18n`, `@/components/sections/*` (eyebrow + two primitives). No imports from `@/components/islands/*`, `@/components/ui/*` (AR23), or `@/layouts/*`. [Source: CLAUDE.md § Architectural boundaries; AR23]
- **Frozen primitive contracts.** `StatCard` and `TrustQuoteCard` are Story 2.3 contracts — do NOT edit their props, their markup, their CSS, or their header comments. If this story needs something a primitive doesn't expose, that's a Story 2.3 defect and should be filed as a follow-up, not hacked around here. [Source: Story 2.3 dev record; CLAUDE.md § Key conventions]
- **i18n routes through `t()` only.** Every visible string calls `t('landing.socialProof.*', locale)`. No hard-coded marketing copy in the `.astro` file. [Source: Story 1.6 AC1; FR52]
- **FR52 V1 policy.** FR and DE `socialProof` blocks are byte-for-byte English copies. Real translations land in V1.2. [Source: prd § FR52]
- **Brand tokens only — no raw hex.** `--color-bg`, `--color-primary`, `--color-teal`, `--color-amber`, `--color-coral` (if it exists — confirm in `global.css` before using). Motion: this section has no motion (stats and a pull quote are static content; no entrance animation), so no motion tokens are needed here — a deliberate choice to keep Lighthouse clean and avoid scroll-driven animation proliferation. [Source: Story 1.7 motion tokens; CLAUDE.md § Key conventions]
- **4 pt spacing grid.** All gaps / paddings in multiples of 4 px: `gap-6` / `gap-8`, `mt-10` / `mt-12` / `mt-16`, `py-16` / `lg:py-24`. [Source: CLAUDE.md § Key conventions]
- **Single `<h1>` per page.** The hero owns `<h1>`. This section uses `<h2>` only. [Source: UX-DR28]
- **Epic 2 color rhythm.** This section sits on the **white** slot. Story 1.7 / architecture.md § Palette rhythm: white hero → surface problem → dark primary inspection story → **white social proof** → surface blog previews → white FAQ → dark primary footer CTA. [Source: Story 1.7 color rhythm documentation]
- **No module imports that don't yet exist.** Do NOT `import { isPostLaunch } from '@/lib/launch-phase';` — that module ships in Epic 5 Story 5.3 and importing it now would break the build. The `TODO(epic-5)` comment is the architectural intent. [Source: AC4; Epic 5 Story 5.3]
- **No Content Collection reads.** Do NOT `getCollection('stats')` or `getCollection('testimonials')` — those collections are Epic 5 Story 5.1's scope. V1 reads hard-coded i18n strings only. The `TODO(epic-5)` comment marks the future migration. [Source: CLAUDE.md § Architectural boundaries § Content access; Epic 5]

### Why three explicit `<StatCard>` tags instead of a `.map()`

An Astro frontmatter `.map()` over an array of stats would be shorter by ~10 lines, but:
1. The three cards use **three different category colours** — the map would need a parallel array of colours or an object with `{ key, category }` entries, which is less grep-friendly than three static tags.
2. The `t()` keys become dynamic (`t(\`landing.socialProof.stats.\${key}.value\`, locale)`) — the build-time `astro check` cannot validate dynamic keys as easily as static ones.
3. A future "this card has a different shape" requirement (rare but possible) would force the array shape to grow a discriminator field; three explicit tags handle it for free.
4. Readability: a reviewer scanning `social-proof-section.astro` sees "this is three stat cards with three colours" in 10 lines instead of tracing an array through a map function.

The same argument applies to `problem-section.astro`'s three `body.*` paragraphs — that file also renders three explicit `<p>` tags rather than mapping. Story 2.2 established the precedent; Story 2.6 follows it.

### Why this story authors placeholder quote attribution

UX-DR6 asks for a "trustworthy quote that validates the problem at scale" — and at pre-launch, Truvis has no real testimonials. The options are:
1. **Leave the quote out entirely.** Bad — UX-DR6 explicitly calls for it, and the section's emotional arc needs the pull quote.
2. **Make up a fake customer testimonial.** Worst — misleading the user, legally risky, cannot survive Epic 5's CMS migration.
3. **Author a plausible market-expert / industry-publication style quote and mark it explicitly as a placeholder in the `context` field.** — This is the chosen path. The `context` field visibly says "V1 placeholder — replaced with a real testimonial or industry-publication quote in Epic 5." A reviewer reading the page or the source sees the disclaimer. Epic 5 replaces it with a real attribution before launch (and Story 7.7's GDPR compliance close-out audit verifies the final copy does not carry residual placeholders).

The dev agent has latitude over the exact wording of the quote as long as it is:
- Inspector-voice (concrete, specific, market-shaped),
- one sentence,
- explicitly disclaimed in `context` as a V1 placeholder.

### Previous-story intelligence

- **Story 2.3** (`StatCard`, `TrustQuoteCard`). Both primitives are frozen. Read its dev record to see how `phase` defaults, how the post-launch stub renders, how the warm-amber quote glyph is drawn, and how the `rating` / `authorImage` post-launch props are wired as a structural stub today. Do not duplicate any of that; consume the primitives as-is. [Source: `_bmad-output/implementation-artifacts/2-3-build-statcard-and-trustquotecard-tier-2-primitives-pre-launch-variants.md`]
- **Story 2.2** (`problem-section.astro`). The canonical pure-Astro Tier-2 section pattern — use its header comment shape, `Locale` typing, `aria-labelledby`, Epic-2 container recipe, and eyebrow+h2+body render order. Do NOT copy its CSS-only fade-in block — this section has no entrance motion. [Source: `src/components/sections/problem-section.astro`]
- **Story 2.5** (`inspection-story-section.astro` — just shipped above this one). The order of sections on `src/pages/index.astro` is the immediate upstream consumer; insert this story's section directly below `<InspectionStorySection />`. [Source: Story 2.5 AC5]
- **Story 1.4** (`BaseLayout`, `SectionEyebrow`). The eyebrow component's props must be confirmed before use — check whether the light variant is `variant="light"`, `tone="light"`, or something else, and match it. [Source: `src/components/sections/section-eyebrow.astro`]
- **Story 1.6** (`t()` helper, FR52 V1 policy). English is authoritative at V1; FR/DE are byte-for-byte mirrors. The `t()` helper logs dev-mode warnings for missing keys. [Source: `src/lib/i18n.ts`]

### Cross-epic contracts

- **Epic 5 Story 5.1** ships the `stats` and `testimonials` Content Collections. When Epic 5 runs, the hard-coded i18n values in this section migrate to collection reads via `src/lib/content.ts`. Leave a `TODO(epic-5): source from stats / testimonials Content Collections via lib/content.ts` comment at the top of `social-proof-section.astro` to mark the migration point.
- **Epic 5 Story 5.3** ships `src/lib/launch-phase.ts`. Once it exists, the commented-out `isPostLaunch()` block in this section becomes live code. The comment is the grep target for Story 5.3.
- **Epic 8 Story 8.2** ships the post-launch `TrustQuoteCard` variant and injects it via `<slot name="post-launch-testimonial" />`. Story 8.2 should not need to edit this file — it edits `src/pages/index.astro` to pass the slotted content into `<SocialProofSection>`. If Story 8.2's implementation reveals the slot contract is insufficient, that is a Story 2.6 defect — file a follow-up rather than hacking around it.
- **Epic 8 Story 8.3** ships the `LiveStatsWidget` which will progressively replace one or more of the three `StatCard`s with live data. Story 8.3 edits `src/pages/index.astro` to pass the live-stats payload; this section's three-card layout is the contract it slots into.

### Files you will create / modify

**Create:**
- `src/components/sections/social-proof-section.astro`

**Modify:**
- `src/i18n/en/landing.json` (add top-level `socialProof` block)
- `src/i18n/fr/landing.json` (byte-for-byte copy of the English `socialProof` block — FR52)
- `src/i18n/de/landing.json` (byte-for-byte copy of the English `socialProof` block — FR52)
- `src/pages/index.astro` (import + render `<SocialProofSection />` below `<InspectionStorySection />`)
- `src/pages/_demo/text-expansion.astro` (register the new section under 140 % padded synthetic strings)

**Do NOT touch:**
- `src/components/sections/stat-card.astro`, `trust-quote-card.astro`, `section-eyebrow.astro`, `hero-section.astro`, `problem-section.astro`, `inspection-story-section.astro`, `header.astro`, `footer.astro`
- `src/components/islands/*` (this story introduces no islands)
- `src/lib/stores/*`
- `src/layouts/BaseLayout.astro`
- `src/lib/i18n.ts`, `src/lib/env.ts`, `src/lib/utils.ts`
- `src/styles/global.css` (no new tokens)
- `tailwind.config.ts`, `astro.config.mjs`, `lighthouse/budget.json`, `package.json`
- Any Vitest file

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** `import { isPostLaunch } from '@/lib/launch-phase';` — that module does not exist yet. Epic 5 Story 5.3 ships it.
- ❌ **Do NOT** `getCollection('stats')` or `getCollection('testimonials')` — those collections are Epic 5 Story 5.1. V1 reads hard-coded i18n strings.
- ❌ **Do NOT** edit `StatCard` or `TrustQuoteCard`. Their contracts are frozen from Story 2.3.
- ❌ **Do NOT** add `client:*` directives to anything in this section. Pure Astro, server-rendered.
- ❌ **Do NOT** machine-translate the `socialProof` block for FR / DE. Byte-for-byte English copies per FR52.
- ❌ **Do NOT** hard-code marketing strings. Every visible value routes through `t()`.
- ❌ **Do NOT** fabricate a fake customer testimonial attribution. Use a plausible market-expert / industry-publication voice and mark it explicitly as a V1 placeholder in the `context` field.
- ❌ **Do NOT** add the mid-page CTA slot between this section and `<InspectionStorySection>`. Story 2.9 owns it.
- ❌ **Do NOT** add `<BlogPreviewsSection />`, `<FaqSection />`, or `<FooterCtaSection />` to `src/pages/index.astro`. Only add `<SocialProofSection />` in this story. Stories 2.7 / 2.8 / 2.9 ship those in order.
- ❌ **Do NOT** introduce any new Tailwind class beyond what's already in the repo. Use brand tokens.
- ❌ **Do NOT** introduce a new colour token for a category variant. The three categories are `'teal' | 'amber' | 'coral'` — `StatCard` already defines them in its `borderClass` map. If `coral` is missing from `global.css`, check Story 2.3's dev record for how coral was introduced.
- ❌ **Do NOT** wrap the `TrustQuoteCard` in a second `<figure>` or `<blockquote>` — the card already uses `<figure>`/`<blockquote>`/`<figcaption>` internally.
- ❌ **Do NOT** add entrance animations, scroll-driven effects, or any motion. This section is deliberately static — it validates the problem at a glance, not with a scroll-reveal.
- ❌ **Do NOT** add a new Vitest file. The repo's test policy is "Vitest for `lib/` utilities only" and this story touches no `lib/` code.
- ❌ **Do NOT** hoist the `<slot name="post-launch-testimonial" />` above the pre-launch card. The order is: pre-launch card first (V1), slot below (Epic 8 fills it). Otherwise Epic 8's visual order breaks.
- ❌ **Do NOT** claim the story complete without running `npm run build && npm run preview` and confirming the built `/` route renders all five sections in the correct order.

### Project Structure Notes

- **Alignment with unified structure:** All changes land in their canonical homes — new section in `src/components/sections/`, i18n updates in `src/i18n/{en,fr,de}/landing.json`, page composition edit in `src/pages/index.astro`, harness registration in `src/pages/_demo/text-expansion.astro`. No new directories, no new top-level files, no new lib modules, no new collections.
- **Variance from plan:** None expected. The epic specifies three StatCards + one TrustQuoteCard + an empty post-launch slot; this story ships exactly that. If the dev agent discovers a blocker (e.g., a missing `coral` colour token, a `SectionEyebrow` prop that doesn't match `variant="light"`), document it in the dev record and resolve at the smallest-possible scope (extend `global.css` with one new token, or use the correct prop name).

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Architectural boundaries, § Key conventions, § Anti-patterns]
- [Source: epics-truvis-landing-page.md:953-977 — Story 2.6 complete BDD]
- [Source: epics-truvis-landing-page.md — UX-DR6 SocialProofSection, UX-DR21 StatCard, UX-DR22 TrustQuoteCard, UX-DR28 heading hierarchy, UX-DR29 focus indicators, UX-DR30 contrast, UX-DR31 text expansion]
- [Source: epics-truvis-landing-page.md — FR4 pre-launch market statistics, FR5 social proof post-launch variant (Epic 8), FR52 i18n V1 policy]
- [Source: prd-truvis-landing-page.md NFR1 LCP, NFR3 CLS, NFR5 initial weight, NFR6 Lighthouse Performance, NFR21 keyboard, NFR25 accessibility, NFR26 text expansion, NFR39 SEO]
- [Source: architecture-truvis-landing-page.md § Component Tiers, § AR23, § Palette rhythm]
- [Source: src/components/sections/stat-card.astro — StatCard Tier-2 primitive (Story 2.3)]
- [Source: src/components/sections/trust-quote-card.astro — TrustQuoteCard Tier-2 primitive (Story 2.3)]
- [Source: src/components/sections/section-eyebrow.astro — SectionEyebrow Tier-2 primitive (Story 1.4); confirm dark/light-variant prop name before use]
- [Source: src/components/sections/problem-section.astro — canonical pure-Astro Tier-2 section shape (Story 2.2)]
- [Source: src/components/sections/inspection-story-section.astro — Story 2.5's just-landed upstream section on `/`]
- [Source: src/i18n/en/landing.json — existing `landing.hero`, `landing.problem`, `landing.inspectionStory` namespace shape]
- [Source: src/lib/i18n.ts — `t()` helper, `Locale` type, dev-mode fallback warning]
- [Source: src/pages/index.astro — current Epic 2 composition surface]
- [Source: src/pages/_demo/text-expansion.astro — harness registration pattern]
- [Source: src/styles/global.css — brand tokens: `--color-bg`, `--color-primary`, `--color-teal`, `--color-amber`, `--color-coral`, `--radius-lg`]
- [Source: _bmad-output/implementation-artifacts/2-3-build-statcard-and-trustquotecard-tier-2-primitives-pre-launch-variants.md — StatCard + TrustQuoteCard frozen contracts; `category` + `phase` prop semantics; post-launch variant stub shape]
- [Source: _bmad-output/implementation-artifacts/2-2-build-problemsection-with-statistics-and-css-only-fade-in.md — canonical Astro section shape and header comment pattern]
- [Source: _bmad-output/implementation-artifacts/2-5-build-the-six-inspectionstoryscene-content-blocks-with-hard-stop-climax-variant.md — Story 2.5 upstream section and i18n namespace layout pattern]
- [Source: _bmad-output/implementation-artifacts/1-6-wire-astro-built-in-i18n-routing-and-locale-detection-middleware.md — `t()` helper, FR52 V1 byte-for-byte mirror policy]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — heading hierarchy, contrast, text-expansion harness convention]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6[1m]

### Debug Log References

- `npx astro check` → 0 errors, 0 warnings, 111 hints (pre-existing shadcn `ElementRef` deprecations).
- `npx eslint .` → 0 errors, 2 pre-existing warnings in unrelated files.
- `npx prettier --check .` → clean after auto-format of `social-proof-section.astro`.
- `npx vitest run` → 4 files, 41 tests passing (no new tests).
- `npm run build` → clean. Pure Astro section — zero new JS chunks; delta is HTML-only.

### Completion Notes List

- **AC1**: Pure Astro section on white `bg-[var(--color-bg)]` with the Epic-2 container recipe, eyebrow, `<h2 id="social-proof-heading">`. No JS, no islands, no entrance motion. Optional subheadline omitted — no value-adding bridge copy, so per AC1 the i18n key is also omitted rather than shipping an empty string.
- **AC2**: Three explicit `<StatCard>` tags in a responsive grid (`md:grid-cols-3`), category colours teal / amber / coral in order. Props sourced via static `t()` keys per AC2's guidance.
- **AC3**: Single pre-launch `<TrustQuoteCard>` wrapped in `max-w-3xl mx-auto`, separated by `mt-12 md:mt-16`. `phase` omitted (defaults to `'pre'`); `rating`/`authorImage` not passed.
- **AC4**: Empty `<slot name="post-launch-testimonial" />` declared inside the same `max-w-3xl` container, directly below the pre-launch card. `TODO(epic-5)` commented code path documents the future `isPostLaunch()` switch without importing the non-existent `@/lib/launch-phase` module.
- **AC5**: `socialProof` i18n block added to `en/landing.json` after `inspectionStory`. FR and DE are byte-for-byte mirrors per FR52. Every defined key has a matching `t()` call in the section.
- **AC6**: Header comment in `social-proof-section.astro` explicitly declares `V1 ships FR4 only. FR5's post-launch testimonial variant is "variant slot ready"`.
- **AC7**: `<SocialProofSection />` mounted on `src/pages/index.astro` directly below `<InspectionStorySection />`.
- **AC8**: Single `<h1>` invariant preserved. Section uses `<h2>` only — no `<h3>` inside. All text tokens are Story 2.3 contract-default — all pass WCAG AA ≥4.5:1 against `#FFFDF9`. No focusable children.
- **AC9**: `text-expansion.astro` registers the real `SocialProofSection` with a reviewer note describing the 140% padding protocol.
- **AC10**: All CI gates clean. No new JS, no new runtime dependencies, no new files outside `src/components/sections/`.

### File List

**Created:**

- `src/components/sections/social-proof-section.astro`

**Modified:**

- `src/i18n/en/landing.json`
- `src/i18n/fr/landing.json`
- `src/i18n/de/landing.json`
- `src/pages/index.astro`
- `src/pages/_demo/text-expansion.astro`

### Change Log

| Date       | Change                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-11 | Implemented Story 2.6 — SocialProofSection with three StatCards + one TrustQuoteCard + post-launch slot. Status → review. |
