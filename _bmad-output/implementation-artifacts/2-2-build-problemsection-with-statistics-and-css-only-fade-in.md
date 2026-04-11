# Story 2.2: Build `ProblemSection` with statistics and CSS-only fade-in

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor who has just read the hero and is deciding whether to keep scrolling**,
I want **the next section to validate that the problem Truvis solves is real, specific, and expensive**,
so that **I feel understood and believe the rest of the page is worth my time**.

## Context & scope

This is the **second story of Epic 2**. Story 2.1 shipped `HeroSection` (white `bg` surface). This story adds the next section in the scroll: `ProblemSection` on the warm-grey `surface` background, enforcing the Story 1.7 **section colour rhythm** (white hero → surface problem → dark immersion …). It is the first Epic-2 section that introduces **entrance motion** — done the right way (CSS-only) now so every subsequent section can copy the same pattern instead of reaching for a JS animation library.

Scope boundaries:
- **In scope:** `src/components/sections/problem-section.astro`, English i18n strings for multi-paragraph body copy, CSS-only fade-in (one reusable pattern), mounting into `src/pages/index.astro` below `<HeroSection />`, text-expansion harness entry.
- **Out of scope:** real statistics numbers from `siteContent` collection (Story 5.4 swaps the i18n placeholders), `StatCard` component (Story 2.3), testimonials/trust quotes (Story 2.3/2.6), any JavaScript, real FR/DE translations (V1.2). Do **not** introduce these.

## Acceptance Criteria

### AC1 — `ProblemSection` component structure (UX-DR5, AR23)

**Given** UX-DR5 requires a Tier-2 `ProblemSection` on the `surface` background,
**When** I create `src/components/sections/problem-section.astro` under the three-tier convention (AR23),
**Then**
- the file exists at `src/components/sections/problem-section.astro` and imports only from `@/components/ui/*`, `@/components/sections/section-eyebrow.astro`, and `@/lib/*` (AR23 — no cross-feature imports, no islands),
- the component is a plain Astro component with **zero `client:*` directives** — zero JavaScript in the shipped bundle for this section,
- the root element is `<section aria-labelledby="problem-heading">` using `bg-[var(--color-surface)]` (warm grey `#F7F5F2`) so it enforces the Story 1.7 colour rhythm (see `docs/design-conventions.md`),
- the section uses the same container pattern as `HeroSection` and `header.astro` (`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`) so horizontal alignment with the hero above it is pixel-consistent,
- vertical rhythm uses `py-16 lg:py-24` matching `HeroSection` — the rhythm between hero and problem is intentional and set by this spacing, do not alter it.

### AC2 — Eyebrow, `<h2>`, multi-paragraph body (UX-DR5, UX-DR28, FR2, FR52)

**Given** UX-DR5 and UX-DR28 require a semantic, hierarchy-respecting problem section wired to i18n,
**When** I populate the section,
**Then**
- the section opens with `<SectionEyebrow variant="light">` with `eyebrow` bound to `t('landing.problem.eyebrow', locale)` (default English: `"The cost of not knowing"`),
- the section contains exactly one **`<h2 id="problem-heading">`** (the `<h1>` belongs to the hero — UX-DR28 forbids skipped levels and duplicate `<h1>`s) wired to `t('landing.problem.headline', locale)`,
- default English headline: `"Buyers lose an average of €640 to hidden issues they couldn't see on a test drive."` (Do not parameterise `{amount}` — Epic 5's `siteContent` refactor handles parameterisation later; V1 ships the plain string.),
- the `<h2>` uses `font-display`, `font-bold`, `text-[var(--color-primary)]`, `leading-tight`, and `text-[length:var(--text-2xl)]` from Story 1.3 (note: `text-2xl`, not `text-hero` — `text-hero` is owned by the page's single `<h1>`),
- the body copy renders **exactly three `<p>` paragraphs**, each wired to a distinct i18n key: `t('landing.problem.body.lede', locale)`, `t('landing.problem.body.stat', locale)`, `t('landing.problem.body.stakes', locale)`,
- each paragraph uses `text-[length:var(--text-lg)]` and `text-[var(--color-primary)]` (see AC6 — muted grey does not pass contrast on `surface`),
- the three paragraphs flow inside a `max-w-2xl` copy column so line length stays inside the 60–80ch reading zone (never full-width `max-w-6xl` for body text),
- a subtle `<p>` citation line renders below the third paragraph wired to `t('landing.problem.body.sourceNote', locale)` in `text-[length:var(--text-sm)] text-[var(--color-muted)]` with a preceding `"Source: "` prefix (default English: `"Source: placeholder data — replaced with sourced statistics in Epic 5."`) — this is intentional scaffolding so Epic 5 knows which node to swap,
- `locale` is derived from `Astro.currentLocale ?? 'en'` exactly as `HeroSection` does,
- **no hardcoded user-facing strings** may appear in `problem-section.astro` — every visible string routes through `t('landing.problem.*', locale)` (CLAUDE.md anti-pattern list).

### AC3 — Vertical layout, eyebrow → headline → body flow

**Given** UX-DR5 does not require a multi-column layout for the problem section,
**When** I lay out the section,
**Then**
- the section is a **single-column vertical stack**: eyebrow → `<h2>` → three `<p>` paragraphs → source note,
- the inner wrapper uses `flex flex-col items-start gap-6` (matching the hero's copy-column rhythm) so spacing between elements is consistent with Story 2.1,
- on all breakpoints the section never exceeds `max-w-2xl` for the body-text column — readability trumps width,
- there is **no two-column decorative layout**, **no inline StatCards** (that is Story 2.3/2.6's job), and **no image/illustration** in this story.

### AC4 — CSS-only entrance fade-in (UX-DR5, UX-DR32, NFR3)

**Given** UX-DR5 requires a lightweight CSS-only fade-in on scroll with no JavaScript animation library and no scroll-jacking, and Story 1.7 already ships a global `@media (prefers-reduced-motion: reduce)` kill-switch in `src/styles/global.css`,
**When** I add the entrance motion,
**Then**
- the fade-in is implemented **purely in CSS** using a scoped `<style>` block inside `problem-section.astro` (Astro scoped styles — the selector is automatically scoped to this component, so no global pollution),
- the preferred implementation is **`animation-timeline: view()`** (the scroll-driven animations CSS feature) applied to the section wrapper — when the section enters the viewport it fades in; when it leaves it stays put,
- a **graceful fallback** is provided for browsers without `animation-timeline` support: use an `@supports not (animation-timeline: view())` block that runs a one-shot `@keyframes fadeInUp` on page load instead (Astro's scoped style is fine — no IntersectionObserver, no JS),
- **zero JavaScript animation libraries** are introduced: no `framer-motion`, no `gsap`, no `motion`, no `@react-spring/*`, no `aos`, no custom `<script>` tag in this component,
- the animation is wrapped in `@media (prefers-reduced-motion: no-preference)` so it is **entirely absent** under reduced motion (belt-and-braces — the global reduced-motion block already zeros animation durations, but explicit `no-preference` gating is UX-DR32's contract),
- **only `opacity` and `transform: translateY(...)` are animated** — never `top`, `left`, `width`, `height`, `margin`, or any property that triggers layout (NFR3 — the section must stay inside the CLS <0.1 budget),
- the initial state is `opacity: 0; transform: translateY(16px)`; the final state is `opacity: 1; transform: translateY(0)`; duration is the `--duration-slow` token (400ms) from Story 1.7 with `ease-out` easing,
- the animation **does not delay** the hero LCP — the section is below the fold on almost every viewport; if it is above the fold on very tall viewports (uncommon), the CSS `animation-fill-mode: both` ensures it still settles to `opacity: 1` without blocking paint.

**Reference sketch (non-binding):**

```astro
<style>
  .problem-fade {
    /* Final resting state so the content is ALWAYS visible if CSS animation
       is unsupported, or reduced-motion is on, or the @supports path fails. */
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .problem-fade {
        animation: problem-fade-in linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 60%;
      }
    }

    @supports not (animation-timeline: view()) {
      .problem-fade {
        animation: problem-fade-in var(--duration-slow) ease-out both;
      }
    }
  }

  @keyframes problem-fade-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

Do not copy this verbatim without reading — match it to whatever idiomatic Astro scoped-style usage exists in the repo, and confirm the final resting state is the default so the section is never invisible if any branch of the CSS fails.

### AC5 — i18n keys added to every locale (FR52, AR17)

**Given** Story 2.1 established the convention that `src/i18n/{en,fr,de}/landing.json` gain new keys for every Epic-2 section and that FR/DE ship as byte-for-byte English copies in V1,
**When** I add the problem-section strings,
**Then**
- `src/i18n/en/landing.json` `problem` object is **restructured** to the final shape (removing any Story 1.6 placeholders):
  ```json
  "problem": {
    "eyebrow": "The cost of not knowing",
    "headline": "Buyers lose an average of €640 to hidden issues they couldn't see on a test drive.",
    "body": {
      "lede": "Used cars hide problems that a casual test drive won't surface — worn clutches, misaligned frames, electronic gremlins, history odometer rolls. The ones that do get caught are usually caught at the mechanic, after the money has already changed hands.",
      "stat": "Roughly 1 in 3 private-party used cars has at least one undisclosed issue costing more than €500 to fix. The average buyer walks away from a handshake deal €640 poorer than they expected.",
      "stakes": "On a €12,000 car, that is a 5 % hit before you've even driven it home. It is also entirely preventable — if you know what to look for."
    },
    "sourceNote": "Source: placeholder data — replaced with sourced statistics in Epic 5."
  }
  ```
- the existing `problem.headline` with `{amount}` template placeholder from Story 1.6 is **removed** (V1 uses the plain string above — parameterisation is deferred to Epic 5),
- any existing `problem.body` string (a single plain string from Story 1.6) is **replaced** by the nested `body.lede / body.stat / body.stakes` object shape above,
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` receive the **same keys with the same English values** (V1 ships FR/DE as byte-for-byte copies per FR52 — real translations land in V1.2),
- all three files remain valid JSON and preserve existing sibling keys (`meta`, `hero`, `primaryCta`, `secondaryCta`),
- the `t()` helper resolves `t('landing.problem.body.lede', 'en')`, `t('landing.problem.body.stat', 'en')`, etc. Verify in `src/lib/i18n.ts` that nested dot-notation lookup is already supported (Story 1.6 implementation) — it is. Do not modify `src/lib/i18n.ts`.

### AC6 — Accessibility, contrast, and text-expansion (NFR19, NFR20, NFR21, NFR26, UX-DR30, UX-DR31)

**Given** WCAG 2.1 AA and 40% text-expansion tolerance are required,
**When** I audit the section,
**Then**
- the `<h2>` and all three body paragraphs use `text-[var(--color-primary)]` (`#2E4057`) against `bg-surface` (`#F7F5F2`) — this pair is ≈9.6:1 (AAA). **Do not** use `--color-muted` (`#5F6F7E`) for body paragraphs on `surface` — that pair measures ~4.3:1 and fails AA. The source-note line (AC2) uses `--color-muted` at `text-sm` but is supplementary, not primary content; if axe flags it, upgrade it to `--color-primary` as well,
- the `<section>` has `aria-labelledby="problem-heading"` pointing at the `<h2 id="problem-heading">` (UX-DR28 semantic labelling),
- the section introduces **no new focusable elements** (it is pure prose) — keyboard navigation must simply pass through without any tab stops (NFR21),
- under `prefers-reduced-motion: reduce`, the section renders at its final resting state immediately (no fade-in, no transform) — verify in devtools with the "Emulate CSS prefers-reduced-motion: reduce" toggle,
- `src/pages/_demo/text-expansion.astro` is **updated** to render `<ProblemSection />` alongside the existing shell and hero entries, and the section must render without overflow, truncation, or layout collapse when the harness injects 140%-padded synthetic strings for the eyebrow / headline / three body paragraphs (NFR26, UX-DR31). Extend the existing `padded` object and the existing harness body; do not create a second harness page,
- `npx astro check` is clean, `npm run build` is clean, and axe DevTools reports zero violations on `/`.

### AC7 — Wire into `src/pages/index.astro`

**Given** Epic 2 is assembling the landing page section by section below `<HeroSection />`,
**When** I mount `ProblemSection`,
**Then**
- `src/pages/index.astro` imports `ProblemSection` from `@/components/sections/problem-section.astro` and renders it **immediately after `<HeroSection />`** inside `<BaseLayout>`,
- no other Epic-2 sections are added in this story — the page after this story contains `<Header>` → `<HeroSection>` → `<ProblemSection>` → `<Footer>` and nothing else,
- `npm run dev` shows the new section at `/`, `/fr/`, `/de/` with identical English copy (V1 FR52 behaviour),
- the section transitions visually from the white hero to the `surface` background with no gap, no visible seam, and no horizontal alignment drift (same container width as the hero).

### AC8 — Lighthouse budgets hold (NFR1, NFR3, NFR5, NFR6)

**Given** CI enforces Lighthouse budgets per Story 1.2,
**When** CI runs on this PR,
**Then**
- LCP on `/` remains **< 2.5s** (NFR1) — adding `ProblemSection` must not displace the hero's LCP element or introduce a new heavier LCP candidate,
- CLS on `/` remains **< 0.1** (NFR3) — the fade-in animates only `opacity` and `transform` and the section reserves its final layout from first paint,
- total initial page weight remains **< 500KB** (NFR5) — this section adds zero new assets (no images, no fonts, no JS) so the only delta is the HTML and the scoped style block,
- Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95 (NFR6, NFR25, NFR39),
- if any budget fails, fix the section — **do not raise the budget** in `lighthouse/budget.json`.

## Tasks / Subtasks

- [ ] **Task 1 — Add i18n keys** (AC2, AC5)
  - [ ] 1.1 Edit `src/i18n/en/landing.json`: replace the existing `problem` object with the new shape from AC5 (`eyebrow`, plain `headline`, nested `body.lede / body.stat / body.stakes`, `sourceNote`).
  - [ ] 1.2 Mirror the same `problem` object byte-for-byte into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` (FR52 V1).
  - [ ] 1.3 Quick sanity check: `t('landing.problem.body.lede', 'en')` resolves via the dev server or a temporary Vitest assertion. Do not commit the temporary assertion.

- [ ] **Task 2 — Create `problem-section.astro`** (AC1–AC4, AC6)
  - [ ] 2.1 Create `src/components/sections/problem-section.astro` with the component header comment and frontmatter imports (`t`, `SectionEyebrow`, `Locale` type).
  - [ ] 2.2 Derive `locale` from `Astro.currentLocale ?? 'en'`.
  - [ ] 2.3 Build the `<section aria-labelledby="problem-heading">` wrapper with `bg-[var(--color-surface)]` and the shared container classes.
  - [ ] 2.4 Render the inner `max-w-2xl flex flex-col items-start gap-6` stack.
  - [ ] 2.5 Render `SectionEyebrow` (light variant), `<h2 id="problem-heading">`, three `<p>` body paragraphs, and the source-note line (AC2).
  - [ ] 2.6 Add the scoped `<style>` block for the CSS-only fade-in (AC4) — `@media (prefers-reduced-motion: no-preference)`, `@supports (animation-timeline: view())` primary path and `@supports not (...)` fallback.
  - [ ] 2.7 Attach the animation class to the inner content wrapper so opacity/transform animates the whole stack as a unit (not each paragraph individually — avoid staggered complexity).
  - [ ] 2.8 Verify zero `client:*` directives and zero hardcoded strings.

- [ ] **Task 3 — Wire into `src/pages/index.astro`** (AC7)
  - [ ] 3.1 Import and render `<ProblemSection />` immediately after `<HeroSection />`.
  - [ ] 3.2 `npm run dev` — verify `/`, `/fr/`, `/de/` render hero + problem back-to-back with consistent horizontal alignment.

- [ ] **Task 4 — Extend the text-expansion harness** (AC6)
  - [ ] 4.1 Edit `src/pages/_demo/text-expansion.astro`: import `ProblemSection` and render it in its own `<div>` card below the existing hero-headline stress-test card.
  - [ ] 4.2 Optionally extend the `padded` object with 140%-padded variants of the problem-section strings if rendering the real component with real i18n is not enough of a stress test on its own — or, simpler, render `<ProblemSection />` and resize the viewport: the real copy plus `max-w-2xl` will already exercise the wrap behaviour.
  - [ ] 4.3 Manually inspect at mobile (375px), tablet (768px), desktop (1280px) — no clipping, no overflow, no seam between hero surface and problem surface.

- [ ] **Task 5 — Accessibility & motion audit** (AC6)
  - [ ] 5.1 Verify `<h2 id="problem-heading">` is the only `<h2>` inside the section and that `<h1>` count on `/` is still exactly 1.
  - [ ] 5.2 Verify Tab skips the section cleanly (no new focus stops).
  - [ ] 5.3 Toggle `prefers-reduced-motion: reduce` in devtools — confirm the section renders at its final state immediately with no fade-in.
  - [ ] 5.4 Confirm headline + body paragraph contrast ≥4.5:1 against `#F7F5F2`. If the subheadline-style source-note flags below 4.5:1, upgrade it to `--color-primary`.
  - [ ] 5.5 Run axe DevTools on `/` and record zero violations.

- [ ] **Task 6 — Build, lint, type-check, Lighthouse** (AC8)
  - [ ] 6.1 `npx astro check` — clean.
  - [ ] 6.2 `npx eslint . && npx prettier --check .` — clean.
  - [ ] 6.3 `npm run build && npm run preview` — verify `dist/` builds without new warnings and the section renders in preview.
  - [ ] 6.4 Inspect the `dist/` HTML to confirm **no new JS bundle** was emitted for this section (Astro scoped styles should inline into CSS only).
  - [ ] 6.5 CI Lighthouse: verify Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1. Fix the section if any gate fails — do **not** raise budgets.

## Dev Notes

### Architecture compliance — the non-negotiables

- **Tier 2, zero hydration.** `problem-section.astro` is pure Astro. No `client:*`. No `<script>` tag. The ENTIRE point of CSS-only fade-in is that this section ships zero JS. [Source: CLAUDE.md § Hydration policy]
- **Three-tier import rule.** Import only from `@/components/ui/*`, `@/components/sections/section-eyebrow.astro`, and `@/lib/*`. Do not import from `islands/`, `forms/`, `blog/`, `layouts/`. [Source: CLAUDE.md § Architectural boundaries; architecture-truvis-landing-page.md:393-426]
- **All strings through `t()`.** Every visible string routes through `src/lib/i18n.ts`. FR/DE files ship as byte-for-byte English per FR52 V1. [Source: architecture-truvis-landing-page.md:782]
- **Brand tokens only — no raw hex.** Use `var(--color-surface)`, `var(--color-primary)`, `var(--color-muted)`, `var(--text-2xl)`, `var(--text-lg)`, `var(--text-sm)`, `var(--duration-slow)` from `src/styles/global.css`. Follow the same pattern as `section-eyebrow.astro`, `header.astro`, and the Story 2.1 hero. [Source: src/styles/global.css:52-145]
- **Container width matches the rest of the page.** Use `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` on the outer wrapper, then constrain the body-text column to `max-w-2xl` inside. [Source: src/components/sections/header.astro:32, Story 2.1 hero]
- **4pt spacing grid.** Tailwind gaps/paddings in multiples of 4px. [Source: CLAUDE.md § Key conventions]
- **Section colour rhythm invariant.** `bg-surface` (`#F7F5F2`) is the correct background for the problem section — **not** `bg` (hero) and **not** `surface-2` or `surface-3`. [Source: docs/design-conventions.md; Story 1.7 AC3]
- **Single `<h1>` per page invariant.** The hero owns the `<h1>`. This section uses `<h2>`. No skipped levels. [Source: docs/accessibility-conventions.md; UX-DR28]

### Voice and copy notes

The problem section exists to validate the hero's financial micro-story with concrete, specific, named pain. Truvis's voice is **70% Inspector / 30% Ally** — write like a careful mechanic explaining the problem to a friend, not a marketer. The default English strings in AC5 already reflect this voice. Do not make them warmer, softer, or more "empathetic" — the specificity IS the empathy. Do not remove the numbers. Do not hedge ("sometimes", "often") — the Inspector voice commits. [Source: ux-design-specification-truvis-landing-page.md:63, 69, 189]

### Previous-story intelligence (Story 2.1 — `review` / `ready-for-dev`)

Story 2.1 is the immediate predecessor. Concretely:

- **`HeroSection` already exists** at `src/components/sections/hero-section.astro` on `bg` (warm white). `ProblemSection` on `surface` (warm grey) is the next block in the rhythm; they render back-to-back with no separator or decorative element between them. [Source: Story 2.1]
- **`SectionEyebrow` (light variant)** is the shared eyebrow pattern. The problem section uses the same variant as the hero — light pill on a light section. Do not invent a `"medium"` variant. [Source: src/components/sections/section-eyebrow.astro]
- **The hero container recipe** — `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` + `py-16 lg:py-24` — is the canonical section chrome for this landing page. Clone it, don't reinvent it.
- **The `<h1>` is already spoken for.** Do not even briefly promote the problem heading to `<h1>` in a WIP commit — `HeroSection` owns the single `<h1>` per UX-DR28.
- **i18n `t()` helper supports nested dot-notation** and was built that way in Story 1.6; nested `body.lede` etc. resolves. [Source: src/lib/i18n.ts]
- **The global `@media (prefers-reduced-motion: reduce)` kill-switch** lives at `src/styles/global.css:189-198` and already zeros `animation-duration` / `transition-duration` globally. UX-DR32 still requires the **explicit** `@media (prefers-reduced-motion: no-preference)` gate on the fade-in — belt-and-braces.

### Why CSS-only fade-in, and why this specific pattern

This is the first Epic-2 section with entrance motion. The pattern you build here becomes the reference for Stories 2.6 (social proof), 2.7 (blog previews), 2.8 (FAQ) — every other section that needs a fade-in will copy this approach. So:

- **`animation-timeline: view()` is the right primary path.** It is a CSS-only scroll-driven animation feature shipped in all major evergreen browsers at this point (Chromium ~2023, Firefox ~2024, Safari TP). It costs zero JavaScript and no IntersectionObserver boilerplate. [Source: epics-truvis-landing-page.md:834]
- **`@supports not (animation-timeline: view())` fallback runs a one-shot on page load.** This is deliberately simple — do not reach for IntersectionObserver "just to be safe". The section is short and usually below the fold; a one-shot on page load is fine for the few users on browsers without scroll-driven animations, and the global reduced-motion kill-switch protects them.
- **Only `opacity` and `transform` animate.** These are GPU-composited properties that do not invalidate layout — the only way to keep CLS < 0.1 while animating. Never animate `top`, `left`, `width`, `height`, `margin`, or anything that triggers reflow. [Source: NFR3; web.dev CLS guidance]
- **Animation-fill-mode: both** ensures the final resting state sticks after the animation, and the **default CSS outside the `@media` block** already sets `opacity: 1; transform: translateY(0)` so if any branch fails the section is still visible. This is the "fails-open" principle for motion.
- **Do not stagger paragraphs.** Animate the whole inner stack as a unit. Staggered entrances are a Story 2.4/2.5 concern (the sticky-phone inspection-story scroll) and introducing them here adds complexity no acceptance criterion asks for.
- **Never introduce a JS animation library.** `framer-motion`, `gsap`, `motion`, `@react-spring/*`, `aos` — all forbidden for this section and every subsequent Epic-2 section. This is a hard repo-wide rule, not a story-specific one. [Source: epics-truvis-landing-page.md:835; architecture-truvis-landing-page.md § Motion]

### Files you will create / modify

**Create:**
- `src/components/sections/problem-section.astro` (primary deliverable)

**Modify:**
- `src/pages/index.astro` — add `<ProblemSection />` below `<HeroSection />`
- `src/i18n/en/landing.json` — restructure `problem` object
- `src/i18n/fr/landing.json` — mirror EN (FR52 V1)
- `src/i18n/de/landing.json` — mirror EN (FR52 V1)
- `src/pages/_demo/text-expansion.astro` — register `<ProblemSection />` in harness

**Do NOT touch:**
- `src/layouts/BaseLayout.astro` (Story 1.4)
- `src/components/sections/hero-section.astro` (Story 2.1 — even to add a spacing tweak; the hero's `py-*` is load-bearing for rhythm)
- `src/components/sections/section-eyebrow.astro`, `header.astro`, `footer.astro` (Story 1.4)
- `src/lib/i18n.ts`, `src/lib/env.ts` (Story 1.6/1.7)
- `src/styles/global.css` (Story 1.3 — all tokens you need exist; the global reduced-motion kill-switch is already there)
- `tailwind.config.ts`
- `lighthouse/budget.json` (never raise budgets)
- `astro.config.mjs`

### Testing approach

Same as Story 2.1: no Vitest for Astro components (repo strategy), validation is **visual + harness + axe + `astro check` + build + CI Lighthouse**. Do not introduce Playwright. Do not introduce a component test runner.

1. `npm run dev`, visit `/`, verify hero → problem visual flow and rhythm.
2. `src/pages/_demo/text-expansion.astro` — 140%-padded stress test.
3. axe DevTools on `/` — zero violations.
4. `prefers-reduced-motion: reduce` devtools toggle — fade-in disappears.
5. `npx astro check && npx eslint . && npx prettier --check .` — clean.
6. `npm run build && npm run preview` — clean, no new JS bundle.
7. CI Lighthouse — authoritative on NFR1/NFR3/NFR5/NFR6.

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** import or install `framer-motion`, `gsap`, `motion`, `@react-spring/*`, `aos`, or any other animation library. This is a hard repo-wide forbidden-deps list — CI and code review will bounce it. [Source: epics-truvis-landing-page.md:835]
- ❌ **Do NOT** add an IntersectionObserver or any `<script>` tag. CSS-only means CSS-only.
- ❌ **Do NOT** create a React island for this section. No `client:*` directive anywhere in the import chain.
- ❌ **Do NOT** use `--color-muted` for body paragraphs on `surface` — contrast fails. Use `--color-primary`.
- ❌ **Do NOT** promote the problem heading to `<h1>`. Page has exactly one `<h1>` and it's the hero's.
- ❌ **Do NOT** animate `top`, `left`, `margin`, `width`, `height`, or any layout-triggering property. Opacity and `transform` only.
- ❌ **Do NOT** stagger individual paragraph fade-ins. The inner stack animates as one unit.
- ❌ **Do NOT** hardcode statistics inside the component file. Every number lives in `src/i18n/en/landing.json` under `problem.body.*`.
- ❌ **Do NOT** wire this section to `siteContent` / Keystatic / Astro Content Collections. That's Story 5.4. V1 uses i18n JSON.
- ❌ **Do NOT** parameterise the headline with `{amount}`. The Story 1.6 placeholder `{amount}` template in `problem.headline` is intentionally removed in AC5 — parameterisation is an Epic 5 concern.
- ❌ **Do NOT** add a `StatCard`, a decorative image, an icon row, or a "fact box" — those are Story 2.3/2.6.
- ❌ **Do NOT** raise Lighthouse budgets on a regression — fix the section (remove DOM, compress styles).
- ❌ **Do NOT** use `bg-surface-2` (`#FFF8EF`) or `bg-surface-3` (`#EEF7F7`) — the problem section uses `bg-surface` (`#F7F5F2`), period. [Source: docs/design-conventions.md]
- ❌ **Do NOT** add a section separator (horizontal rule, divider line, decorative SVG) between hero and problem. The background colour change IS the separator — that's the point of the colour rhythm.
- ❌ **Do NOT** touch `src/styles/global.css`. The `@media (prefers-reduced-motion: reduce)` block is already there; do not duplicate it locally. Your scoped `@media (prefers-reduced-motion: no-preference)` block is a different gate and does not conflict.

### Implementation sketch (non-binding reference)

```astro
---
// src/components/sections/problem-section.astro
import { t, type Locale } from '@/lib/i18n';
import SectionEyebrow from '@/components/sections/section-eyebrow.astro';

const locale = (Astro.currentLocale ?? 'en') as Locale;
---

<section
  aria-labelledby="problem-heading"
  class="bg-[var(--color-surface)]"
>
  <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
    <div class="problem-fade flex max-w-2xl flex-col items-start gap-6">
      <SectionEyebrow
        variant="light"
        eyebrow={t('landing.problem.eyebrow', locale)}
      />
      <h2
        id="problem-heading"
        class="font-display text-[length:var(--text-2xl)] leading-tight font-bold text-[var(--color-primary)]"
      >
        {t('landing.problem.headline', locale)}
      </h2>
      <p class="text-[length:var(--text-lg)] text-[var(--color-primary)]">
        {t('landing.problem.body.lede', locale)}
      </p>
      <p class="text-[length:var(--text-lg)] text-[var(--color-primary)]">
        {t('landing.problem.body.stat', locale)}
      </p>
      <p class="text-[length:var(--text-lg)] text-[var(--color-primary)]">
        {t('landing.problem.body.stakes', locale)}
      </p>
      <p class="text-[length:var(--text-sm)] text-[var(--color-muted)]">
        {t('landing.problem.sourceNote', locale)}
      </p>
    </div>
  </div>
</section>

<style>
  .problem-fade {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .problem-fade {
        animation: problem-fade-in linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 60%;
      }
    }

    @supports not (animation-timeline: view()) {
      .problem-fade {
        animation: problem-fade-in var(--duration-slow) ease-out both;
      }
    }
  }

  @keyframes problem-fade-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

Reference only — match it to whatever idiomatic pattern the repo has drifted into by the time this story is picked up.

### Project Structure Notes

- **Alignment with unified structure:** `src/components/sections/problem-section.astro` follows the repo's established kebab-case Tier-2 naming (`hero-section.astro`, `section-eyebrow.astro`, `header.astro`). No new directories, no new lib modules. The new i18n key shape is an additive edit to an existing file.
- **Variance from plan:** Architecture doc references `ProblemSection.astro` (PascalCase) in its sketch — follow the repo's kebab-case convention instead (same as Story 2.1). The i18n key `problem.body` shape changes from a single string (Story 1.6 placeholder) to a nested `{lede, stat, stakes}` object — this is the intended final shape and replaces the scaffolding key. Epic 5 Story 5.4 will swap these i18n reads for `siteContent` collection reads; keep the JSON structure clean so that swap is mechanical.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Anti-patterns, § Hydration policy, § Key conventions]
- [Source: epics-truvis-landing-page.md:817-843 — Story 2.2 complete BDD]
- [Source: epics-truvis-landing-page.md:268 — UX-DR5 definition]
- [Source: epics-truvis-landing-page.md:830 — Epic 5 will swap i18n placeholders for siteContent reads, so DO NOT wire content collections here]
- [Source: epics-truvis-landing-page.md:835 — "No JavaScript animation library" hard rule]
- [Source: architecture-truvis-landing-page.md:393-426 — Three-tier directory structure and rationale]
- [Source: architecture-truvis-landing-page.md:619 — Section component naming rule]
- [Source: architecture-truvis-landing-page.md:782 — `t()` discipline]
- [Source: ux-design-specification-truvis-landing-page.md:63, 69, 189 — Voice + problem-framing rationale]
- [Source: ux-design-hybrid.html — visual source of truth for problem section]
- [Source: prd-truvis-landing-page.md FR2, FR52, NFR1, NFR3, NFR5, NFR6, NFR19, NFR20, NFR21, NFR25, NFR26, NFR39]
- [Source: src/components/sections/section-eyebrow.astro — eyebrow API]
- [Source: src/components/sections/header.astro:32 — container width recipe]
- [Source: src/layouts/BaseLayout.astro:54-55 — `Astro.currentLocale` usage]
- [Source: src/lib/i18n.ts — nested dot-notation support and FR/DE byte-copy policy]
- [Source: src/styles/global.css:52-145, 189-198 — brand tokens, motion tokens, global reduced-motion kill-switch]
- [Source: src/pages/_demo/text-expansion.astro — harness structure (extend, don't duplicate)]
- [Source: docs/design-conventions.md — section colour rhythm]
- [Source: docs/accessibility-conventions.md — WCAG 2.1 AA checklist]
- [Source: _bmad-output/implementation-artifacts/2-1-build-herosection-with-micro-story-headline-phone-mockup-and-cta-slot.md — previous story contract + container recipe]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — motion tokens, harness, colour rhythm, a11y doc]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.

### File List
