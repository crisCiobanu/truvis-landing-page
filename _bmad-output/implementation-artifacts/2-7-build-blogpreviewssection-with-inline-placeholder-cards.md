# Story 2.7: Build `BlogPreviewsSection` with inline placeholder cards

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor who has just been convinced by the story above and wants proof Truvis has real expertise**,
I want **to see two or three blog article previews on the landing page so I can dip into Truvis's content without committing to the waitlist**,
so that **I can gauge Truvis's credibility and maybe bookmark the blog for later**.

## Context & scope

This is the **seventh story of Epic 2**. It builds the **`BlogPreviewsSection`** — a Tier-2 Astro composite that sits directly below `SocialProofSection` (Story 2.6) on `src/pages/index.astro`. The real `BlogPreviewCard` component, the `blog` Content Collection, and the `getBlogPreviews()` helper are intentionally built in Epic 4 (UX-DR20 stays in Epic 4) — so this story ships an **inline placeholder partial** whose only job is to validate the section layout at V1 while Epic 4's real card slots into exactly the same grid later.

Scope boundaries:
- **In scope:** `src/components/sections/blog-previews-section.astro` (Tier-2 Astro composite), a local-only `src/components/sections/_blog-preview-placeholder.astro` partial (underscore prefix flags it as throwaway scaffolding), three hard-coded placeholder preview cards inside `blog-previews-section.astro`, a new `landing.blogPreviews` i18n namespace in `src/i18n/en/landing.json` plus byte-for-byte FR/DE mirrors (FR52), mounting the section on `src/pages/index.astro` directly below `<SocialProofSection />`, text-expansion harness registration, a11y + contrast audit on the `--color-surface` background, responsive grid (1 / 2 / 3 columns at the three breakpoints), inert "Read article →" links (V1 cannot navigate to non-existent articles), `TODO(epic-4)` comments marking the Epic 4 migration points.
- **Out of scope:** any file under `src/content/` — the `blog` Content Collection is Epic 4 Story 4.1's scope; do NOT `getCollection('blog')`, do NOT create `src/content/config.ts` blog entries, do NOT seed MDX articles. Any edit to `src/lib/content.ts` — that helper's blog-read functions are Epic 4 Story 4.1; at V1 do NOT import a non-existent `getBlogPreviews()`. The real `BlogPreviewCard` Tier-2 composite — that is Epic 4 Story 4.2, and UX-DR20 explicitly scopes it there. Real blog article pages, category filter pills, related-articles navigation, the static JSON API — all Epic 4 stories. The `FaqSection` (Story 2.8) and `FooterCtaSection` / full page composition (Story 2.9). The mid-page CTA slot between `<InspectionStorySection />` and `<SocialProofSection />` (Story 2.9). Do **not** introduce any of these.

## Acceptance Criteria

### AC1 — Section shell on `--color-surface` background with eyebrow and `<h2>` (UX-DR7, Story 1.7 color rhythm)

**Given** UX-DR7 requires an inline blog-preview section and the Story 1.7 Epic-2 colour rhythm places it on the warm-grey `--color-surface` background (white social proof → **surface blog previews** → white FAQ),
**When** I create `src/components/sections/blog-previews-section.astro`,
**Then**
- the section is a **pure Astro file** with zero `client:*` directives and zero JavaScript — no islands, no hydration, no React,
- the file header comment mirrors `problem-section.astro` / `social-proof-section.astro` shape: component name, story / UX-DR / AR references, a one-sentence purpose statement, and a **prominent V1-scope note**: `// V1 ships inline placeholder cards. Real BlogPreviewCard + blog Content Collection + getBlogPreviews() land in Epic 4 (Stories 4.1, 4.2, 4.7). The _blog-preview-placeholder.astro partial below is throwaway scaffolding — Story 4.7 will delete it.`,
- the outer wrapper is `<section aria-labelledby="blog-previews-heading" class="bg-[var(--color-surface)]">` — the warm-grey brand token, matching the "surface" slot in the Story 1.7 colour rhythm,
- the inner container uses the Epic-2 recipe: `<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">`,
- the first child is `<SectionEyebrow variant="light" eyebrow={t('landing.blogPreviews.eyebrow', locale)} />` — confirm the exact prop name against `src/components/sections/section-eyebrow.astro` before rendering (may be `variant="light"`, `tone="light"`, etc.; use whatever the component exposes). The V1 eyebrow string is `"From the Truvis blog"`,
- the second child is `<h2 id="blog-previews-heading">` wired to `t('landing.blogPreviews.headline', locale)` with the standard Tier-2 heading classes: `font-display text-[length:var(--text-2xl)] leading-tight font-bold text-[var(--color-primary)]`. Suggested English copy: `"Short reads that sharpen your eye before the test drive."`,
- an optional `<p>` subheadline may sit below the `<h2>` wired to `t('landing.blogPreviews.subheadline', locale)` — include only if the dev agent authors a value-adding single-sentence bridge; otherwise omit the key.

### AC2 — Local-only placeholder partial at `_blog-preview-placeholder.astro` (UX-DR7, Epic 4 scope guard)

**Given** the real `BlogPreviewCard` is Epic 4 Story 4.2's scope and this story needs a card shape just sufficient to validate the section layout without anticipating Epic 4's final visual direction,
**When** I create the placeholder partial,
**Then**
- the partial lives at `src/components/sections/_blog-preview-placeholder.astro` (same directory as `blog-previews-section.astro`, underscore prefix flags it as throwaway scaffolding that Epic 4 Story 4.7 will delete),
- the file header comment explicitly says:
  ```astro
  ---
  /**
   * _blog-preview-placeholder.astro — Story 2.7 throwaway partial
   *
   * Local-only placeholder card for the BlogPreviewsSection V1. The real
   * BlogPreviewCard Tier-2 composite ships in Epic 4 Story 4.2 and will
   * replace every consumer of this partial. The underscore prefix flags
   * this file as scaffolding — Epic 4 Story 4.7 deletes it and swaps the
   * BlogPreviewsSection's three placeholders for the real card + getBlogPreviews().
   *
   * Scope: validates the section's grid layout, responsive breakpoints,
   * card spacing, and text-expansion behaviour at V1. Does NOT anticipate
   * Epic 4's final visual design — UX-DR20 owns that.
   */
  ---
  ```
- the partial accepts the following typed props:
  ```ts
  interface Props {
    category: string;
    title: string;
    excerpt: string;
    readTime: string;
  }
  ```
  The prop shape is the **Epic 4 handoff contract** — the real `BlogPreviewCard` (Story 4.2) will at minimum expose these four fields (and more). Story 4.7 will replace the placeholder's render tree with the real card's, preserving the section's existing three call sites that pass this prop shape,
- the partial's render tree is a **simplified card layout**:
  - outer wrapper: `<article class="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)]">` (warm off-white card on surface-grey section — standard card pattern matching `StatCard`),
  - category pill at top: `<span class="inline-flex items-center rounded-full bg-[var(--color-teal)]/10 px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-[var(--color-teal)]">{category}</span>` (use the existing token-based pattern; if `bg-teal/10` is not a supported Tailwind arbitrary value in the repo, fall back to a brand token that provides a 10% teal tint, or use `bg-[var(--color-surface)]` with a teal text colour — prefer whatever already appears in the codebase),
  - title: `<h3 class="font-display text-[length:var(--text-lg)] leading-tight font-semibold text-[var(--color-primary)]">{title}</h3>`,
  - excerpt: `<p class="text-[length:var(--text-base)] leading-relaxed text-[var(--color-primary)] line-clamp-2">{excerpt}</p>` — 2-line truncation via Tailwind's `line-clamp-2`,
  - footer row: read-time on the left (`<span class="text-[length:var(--text-xs)] text-[var(--color-muted)]">{readTime}</span>`), inert "Read article →" anchor on the right (see AC4),
- the partial uses **Tailwind classes that already exist in the codebase** — if `line-clamp-2` is not yet configured in the Tailwind v4 theme block, check `src/styles/global.css` for the `@theme` block and the existing `line-clamp` plugin status before adding it. If missing, document the small addition in the dev record rather than silently introducing a new utility,
- the partial calls `t()` nowhere — it receives strings via props only, matching the Story 2.3 "primitives-take-strings-via-props" pattern. The consumer (`blog-previews-section.astro`) is the i18n boundary.

### AC3 — Three placeholder cards populated from hard-coded placeholder data with `TODO(epic-4)` comment (UX-DR7, Epic 4 migration marker)

**Given** the section layout needs to validate against three realistic card contents and Epic 4 will later swap the hard-coded data for `getBlogPreviews()` Content Collection reads,
**When** I render the three placeholder cards,
**Then**
- inside `blog-previews-section.astro`, three `<_BlogPreviewPlaceholder>` components are rendered in the grid (AC5 below), each with props sourced from `t('landing.blogPreviews.placeholderCards.card1..card3.*', locale)`,
- the three placeholder card contents (authored in English in the i18n file) are realistic enough to validate the layout without claiming real articles exist. Suggested English values:
  1. **Category** `"Buying guides"` · **Title** `"How to spot a rolled-back odometer in under 30 seconds."` · **Excerpt** `"Three visual tells most buyers miss — and the one service-history check that catches the fourth."` · **Read time** `"4 min read"`
  2. **Category** `"Inspection deep-dives"` · **Title** `"The 2017 Ford Focus EcoBoost coolant-line story, start to finish."` · **Excerpt** `"Why a €60 part is worth €1,200 in hidden repair risk, and what to listen for on the test drive."` · **Read time** `"7 min read"`
  3. **Category** `"Negotiation"` · **Title** `"Turning a failed inspection into a €500 price cut."` · **Excerpt** `"The three findings every seller respects, and the exact phrasing that gets you the discount without the argument."` · **Read time** `"5 min read"`
  The exact wording is the dev agent's call; the **shape** (category, title, excerpt, read time), the **realistic-but-placeholder** character, and the **Inspector-voice tone** are the contract,
- directly above the three card render calls in `blog-previews-section.astro`, add the **Epic 4 migration comment**:
  ```astro
  {/*
   * TODO(epic-4): replace this placeholder block with real
   *   import BlogPreviewCard from '@/components/blog/blog-preview-card.astro';
   *   import { getBlogPreviews } from '@/lib/content';
   *
   *   const previews = await getBlogPreviews(locale, { limit: 3 });
   *
   * Epic 4 Story 4.7 owns this migration. It will also delete
   * _blog-preview-placeholder.astro and the landing.blogPreviews.placeholderCards
   * i18n block (real blog data comes from the blog Content Collection, not i18n).
   */}
  ```
- **critical anti-pattern:** do NOT `import BlogPreviewCard from '@/components/blog/blog-preview-card.astro';` or `import { getBlogPreviews } from '@/lib/content';` at V1 — neither the component nor the helper function exists yet and importing non-existent modules will break the Astro build,
- the three placeholder cards render in document order (card1 first, card2 second, card3 third). The grid (AC5) handles the responsive reflow.

### AC4 — Inert "Read article →" links that cannot navigate (UX-DR7 V1 guardrail)

**Given** the V1 placeholder cards reference articles that do not yet exist and a visitor clicking through would hit a 404,
**When** I render the "Read article →" affordance,
**Then**
- the "Read article →" text is rendered as an `<a>` element with the following attributes applied so it is **inert** — it is visually present, looks like a link, but cannot be navigated or tab-focused:
  ```astro
  <a
    href="#"
    aria-disabled="true"
    tabindex="-1"
    class="inline-flex items-center gap-1 text-[length:var(--text-sm)] font-semibold text-[var(--color-teal)]/60 pointer-events-none cursor-not-allowed"
    onclick="return false"
  >
    {t('landing.blogPreviews.readArticleCta', locale)} →
  </a>
  ```
  If the repo's CSP or ESLint config disallows inline `onclick`, drop the attribute — `pointer-events-none` + `tabindex="-1"` is enough to make the link inert without it. Document the chosen approach in the dev record,
- **exact attribute rationale:**
  - `href="#"` — valid anchor target, does not 404,
  - `aria-disabled="true"` — screen readers announce the link as disabled,
  - `tabindex="-1"` — keyboard tab order skips the link entirely (NFR21 — no focus on an affordance that does nothing),
  - `pointer-events-none` — mouse clicks and touch events ignore the link,
  - `cursor-not-allowed` — the hover cursor visibly signals the link is inert (UX-DR29 visual feedback),
  - `text-teal/60` (or similar reduced-opacity teal) — visual de-emphasis hints "not yet clickable" without screaming it,
- the "Read article →" arrow is a literal `→` character (not an SVG, not an emoji, not a Unicode arrow that renders inconsistently across platforms — the right-single-arrow `→` (U+2192) is standard and widely supported),
- the V1 `readArticleCta` i18n string is `"Read article"` in English; the arrow is appended as a static character in the template so translators do not accidentally localise or remove the directional cue,
- **critical UX guardrail:** the card's outer `<article>` wrapper itself is NOT a clickable region — do NOT wrap the whole card in an `<a>` tag or attach `onclick` to `<article>`. A card that looks clickable but goes nowhere is worse than an inert "Read article →" link — it breaks buyer trust before Truvis has earned any. Epic 4 Story 4.3 ships the real card with working card-wrapping links.

### AC5 — Responsive three-column grid (1 / 2 / 3 columns at mobile / tablet / desktop) (UX-DR7)

**Given** UX-DR7 requires a responsive grid that renders as three columns ≥1024 px, two columns 640–1024 px, and a single column <640 px,
**When** I render the grid,
**Then**
- the grid wrapper sits directly below the `<h2>` / optional subheadline: `<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">`,
- **breakpoint mapping:**
  - `<640 px` (mobile): single column — no grid prefix → default `grid-cols-1`,
  - `≥640 px` (tablet, `sm:` prefix): two columns — `sm:grid-cols-2`,
  - `≥1024 px` (desktop, `lg:` prefix): three columns — `lg:grid-cols-3`,
- **4 pt spacing grid alignment:** `gap-6` = 24 px (tablet), `lg:gap-8` = 32 px (desktop), `mt-10` = 40 px, `lg:mt-12` = 48 px. All multiples of 4,
- **expected reflow at 640 px:** the third card flows to the start of a new row (since two columns fit exactly two cards) and occupies the left column alone, leaving the right column empty. This is the documented behaviour — UX-DR7's 2-column breakpoint expects 2+1 cards, not a 3-across squeeze. Do NOT add `sm:col-span-2` or centre the third card; the natural reflow is correct,
- **expected reflow at 1024 px:** three cards fit in one row of three columns. No gutter adjustments needed,
- each card fills its grid cell naturally — do NOT pass explicit `class` prop values beyond the existing placeholder defaults,
- the cards' heights equalise naturally via `flex flex-col` on the placeholder's outer wrapper (no explicit `h-full` or `min-h-*` needed — Tailwind's grid auto-row-stretching keeps the cards at equal heights even if excerpts differ in length; verify this visually at 140% text expansion).

### AC6 — i18n namespace `landing.blogPreviews.*` with placeholder card content (FR52)

**Given** FR52 requires English strings at V1 and FR/DE byte-for-byte mirrors,
**When** I author the i18n content,
**Then**
- a new top-level `blogPreviews` block is added to `src/i18n/en/landing.json` **at the end** of the JSON (after `socialProof` from Story 2.6 — respect existing key order), shaped as:
  ```json
  "blogPreviews": {
    "eyebrow": "From the Truvis blog",
    "headline": "Short reads that sharpen your eye before the test drive.",
    "subheadline": "Optional bridge — omit the key if not value-adding.",
    "readArticleCta": "Read article",
    "placeholderCards": {
      "card1": {
        "category": "Buying guides",
        "title": "How to spot a rolled-back odometer in under 30 seconds.",
        "excerpt": "Three visual tells most buyers miss — and the one service-history check that catches the fourth.",
        "readTime": "4 min read"
      },
      "card2": { "category": "…", "title": "…", "excerpt": "…", "readTime": "…" },
      "card3": { "category": "…", "title": "…", "excerpt": "…", "readTime": "…" }
    }
  }
  ```
- the `placeholderCards` sub-block name is load-bearing: it signals to a future reader (and to Epic 4 Story 4.7) that these keys are V1 scaffolding and will be deleted when the real `getBlogPreviews()` reads land. Do NOT call it `cards` or `items` — the explicit `placeholderCards` name is the grep target for Epic 4 Story 4.7's deletion,
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` receive the **identical `blogPreviews` block** — byte-for-byte English copies per FR52. Do not machine-translate,
- every `t()` call in `blog-previews-section.astro` resolves cleanly; `npx astro check` is clean,
- do NOT add keys that the section never reads. Every key defined in this block has a corresponding `t()` call (or is explicitly omitted — in which case the JSON key is also omitted).

### AC7 — Landing-page composition: insert `<BlogPreviewsSection />` below `<SocialProofSection />` (UX-DR7)

**Given** Story 2.6 landed `<SocialProofSection />` directly below `<InspectionStorySection />` and the Epic 2 page order places blog previews immediately below social proof,
**When** I update `src/pages/index.astro`,
**Then**
- `src/pages/index.astro` imports `BlogPreviewsSection` alongside the existing section imports and renders `<BlogPreviewsSection />` directly below `<SocialProofSection />`. The page order after this story is:
  ```
  BaseLayout
  ├── Header (from BaseLayout slot)
  ├── HeroSection
  ├── ProblemSection
  ├── InspectionStorySection
  ├── SocialProofSection
  ├── BlogPreviewsSection     ← NEW IN THIS STORY
  └── Footer (from BaseLayout slot)
  ```
- Stories 2.8 (`FaqSection`) and 2.9 (`FooterCtaSection` + full composition) are NOT added in this story.

### AC8 — a11y, contrast, keyboard, text expansion (UX-DR28, UX-DR29, UX-DR30, UX-DR31, NFR21, NFR25, NFR26)

**Given** the section sits on `--color-surface` (warm grey) and must meet WCAG 2.1 AA,
**When** I audit the section,
**Then**
- the section's `<h2>` is the only `<h2>` inside its boundary. Each card uses `<h3>` (one per card, three total). The page's single `<h1>` invariant (hero-only) is preserved (UX-DR28),
- every text token against `--color-bg` (the card background, since cards are warm off-white on a surface-grey section) passes WCAG 2.1 AA ≥4.5:1. If any fails, swap to a brand token that passes — never introduce new hex (UX-DR30),
- each placeholder card is **keyboard-reachable via normal flow**, but **the "Read article →" link has `tabindex="-1"`** so keyboard users do not focus on a dead affordance. The card's outer `<article>` is not a focus target (not an interactive element). A Tab traversal of the section therefore places zero focus stops inside the cards. This is deliberate — V1 has no real reachable content,
- **focus indicators** remain visible on any tab stop that does exist (none in this section at V1, but the `focus-visible` token from Story 1.7 is already active globally). UX-DR29 compliance is inherited,
- text renders without clipping under 140% synthetic FR/DE text in the text-expansion harness at mobile / tablet / desktop breakpoints (UX-DR31, NFR26). The `line-clamp-2` on the excerpt is load-bearing here — under 140% expansion, a 2-sentence excerpt might balloon to 4+ lines without the clamp, breaking the card grid's equal-height intent,
- axe-core reports zero violations on `/` in the CI Lighthouse / axe run (NFR25),
- the section wrapper has `aria-labelledby="blog-previews-heading"` tying it to the `<h2>` — already in AC1 but worth re-confirming under the a11y audit lens (UX-DR28).

### AC9 — Text-expansion harness registration (UX-DR31, NFR26)

**Given** UX-DR31 requires every Tier-2 section to render cleanly under 140% padded FR/DE synthetic strings,
**When** I update the harness,
**Then**
- `src/pages/_demo/text-expansion.astro` gains an import and render of `<BlogPreviewsSection />` (or a padded static mirror if the harness already uses that approach for sections after Story 2.2),
- every string in the section (eyebrow, headline, three card categories / titles / excerpts / read-times, "Read article" CTA) is padded with the bracketed-filler convention to ~140% of English length,
- manually verify at mobile / tablet / desktop breakpoints — no clipping, no overflow, the `line-clamp-2` excerpt truncates correctly under 140% padding, the 2+1 reflow at the tablet breakpoint still lands cleanly, the 3-column desktop grid does not overflow the max-w-6xl container.

### AC10 — Build, lint, type-check, bundle delta (NFR5, AR23, AR27)

**Given** the repo's CI gates and NFR5's 500 KB initial weight budget,
**When** I finish the story,
**Then**
- `npx astro check` — 0 errors. Every `t()` call resolves, the new `_blog-preview-placeholder.astro` typed props compile, the JSON is valid,
- `npx eslint . && npx prettier --check .` — clean,
- `npx vitest run` — all existing tests pass; **no new Vitest files** (`lib/` utilities only policy),
- `npm run build && npm run preview` — clean, the built `/` route renders the new section,
- the new section adds **zero new JavaScript** to `/` (pure Astro, no islands, no `client:*`); expect ~2 KB of new HTML per locale. Document the before/after initial-weight numbers in the dev record,
- Lighthouse CI on the PR passes: Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1, initial weight <500 KB,
- `package.json` unchanged — no new dependencies.

## Tasks / Subtasks

- [ ] **Task 1 — Write the `blogPreviews` i18n block in English** (AC6)
  - [ ] 1.1 Add the top-level `blogPreviews` block to `src/i18n/en/landing.json` with `eyebrow`, `headline`, optional `subheadline`, `readArticleCta`, and `placeholderCards.card1..card3` sub-blocks (each with `category`, `title`, `excerpt`, `readTime`).
  - [ ] 1.2 Author three realistic-but-placeholder Inspector-voice card entries (buying guides, inspection deep-dives, negotiation) with 4–7 min read times.
  - [ ] 1.3 Copy the full `blogPreviews` block byte-for-byte into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` (FR52).

- [ ] **Task 2 — Create `_blog-preview-placeholder.astro` local partial** (AC2, AC4)
  - [ ] 2.1 Create `src/components/sections/_blog-preview-placeholder.astro` with the throwaway-scaffolding header comment.
  - [ ] 2.2 Declare typed props `{ category, title, excerpt, readTime }` (all strings).
  - [ ] 2.3 Render the card wrapper (`<article>` with warm-bg card pattern), category pill, `<h3>` title, `line-clamp-2` excerpt, footer row with read-time + inert "Read article →" link.
  - [ ] 2.4 Wire the inert link per AC4 — `href="#"`, `aria-disabled="true"`, `tabindex="-1"`, `pointer-events-none`, `cursor-not-allowed`, reduced-opacity teal.
  - [ ] 2.5 Confirm `line-clamp-2` Tailwind utility is available in the repo — if not, check `src/styles/global.css` for the `@theme` plugin status and add a minimal declaration if needed (document in dev record).

- [ ] **Task 3 — Create `blog-previews-section.astro`** (AC1, AC3, AC5, AC7)
  - [ ] 3.1 Create `src/components/sections/blog-previews-section.astro` with the V1-scope header comment per AC1.
  - [ ] 3.2 Import `t` + `Locale`, `SectionEyebrow`, and the local `_BlogPreviewPlaceholder` partial.
  - [ ] 3.3 Derive `const locale = (Astro.currentLocale ?? 'en') as Locale;`.
  - [ ] 3.4 Render the section wrapper (`bg-[var(--color-surface)]`, `aria-labelledby`, Epic-2 container recipe).
  - [ ] 3.5 Render `<SectionEyebrow />` (light variant), `<h2 id="blog-previews-heading">`, optional subheadline.
  - [ ] 3.6 Render the responsive grid with three `<_BlogPreviewPlaceholder>` instances, each with `t()`-sourced props.
  - [ ] 3.7 Add the `TODO(epic-4)` migration comment directly above the three-card block per AC3.

- [ ] **Task 4 — Mount the section on `src/pages/index.astro`** (AC7)
  - [ ] 4.1 Import `BlogPreviewsSection` and render `<BlogPreviewsSection />` directly below `<SocialProofSection />` in `src/pages/index.astro`.
  - [ ] 4.2 `npm run build && npm run preview` — confirm `/` renders all six sections in the correct order (Hero, Problem, InspectionStory, SocialProof, BlogPreviews, Footer).

- [ ] **Task 5 — Register the section in the text-expansion harness** (AC9)
  - [ ] 5.1 Update `src/pages/_demo/text-expansion.astro` to import and render `<BlogPreviewsSection />` with padded synthetic strings.
  - [ ] 5.2 Manually verify at mobile / tablet / desktop breakpoints — the 2+1 reflow at 640 px, the 3-column grid at ≥1024 px, the `line-clamp-2` truncation under 140% padding.

- [ ] **Task 6 — a11y, contrast, keyboard audit** (AC8)
  - [ ] 6.1 DevTools axe-core zero violations on `/`.
  - [ ] 6.2 Contrast check: card text on warm-off-white `--color-bg` against WCAG 2.1 AA ≥4.5:1.
  - [ ] 6.3 Tab through `/` — confirm no focus stops inside the `BlogPreviewsSection` cards (inert "Read article →" has `tabindex="-1"`).
  - [ ] 6.4 Heading hierarchy: `<h1>` (hero), `<h2>` per section, `<h3>` on each card and on each inspection-story scene. No out-of-order headings.

- [ ] **Task 7 — Build, lint, type-check** (AC10)
  - [ ] 7.1 `npx astro check` — 0 errors.
  - [ ] 7.2 `npx eslint . && npx prettier --check .` — clean.
  - [ ] 7.3 `npx vitest run` — all tests pass (no new tests).
  - [ ] 7.4 `npm run build && npm run preview` — clean.
  - [ ] 7.5 Document initial-weight delta for `/`.
  - [ ] 7.6 Lighthouse local run — Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1.
  - [ ] 7.7 `package.json` unchanged.

## Dev Notes

### Architecture compliance — the non-negotiables

- **Tier-2 Astro section, zero JavaScript.** Pure Astro. No islands, no `client:*`. [Source: CLAUDE.md § Architectural boundaries]
- **Throwaway partial clearly scoped.** `_blog-preview-placeholder.astro` is Story 2.7 scaffolding and Epic 4 Story 4.7 will delete it. The underscore prefix + `TODO(epic-4)` comment + header-comment disclosure make this unmissable. [Source: AC2; Epic 4 Story 4.7 scope]
- **Three-tier import rule.** The section imports from `@/lib/i18n`, `@/components/sections/*` (eyebrow + local partial). No `@/components/islands/*`, no `@/components/ui/*`, no `@/layouts/*`. [Source: AR23]
- **No imports of non-existent Epic 4 modules.** Do NOT `import BlogPreviewCard from '@/components/blog/blog-preview-card.astro';` or `import { getBlogPreviews } from '@/lib/content';`. Both are Epic 4 Story 4.1 / 4.2 scope. Importing non-existent modules breaks the Astro build. The `TODO(epic-4)` comment is the architectural intent. [Source: AC3]
- **No Content Collection reads.** Do NOT `getCollection('blog')`. The `blog` collection is Epic 4 Story 4.1. V1 reads hard-coded i18n strings only. [Source: CLAUDE.md § Content access; Epic 4 Story 4.1]
- **i18n routes through `t()` only.** Every visible string in `blog-previews-section.astro` calls `t()`. The placeholder partial receives strings via typed props (matching Story 2.3's pattern). [Source: Story 1.6; Story 2.3]
- **FR52 V1 policy.** FR and DE `blogPreviews` blocks are byte-for-byte English copies. [Source: FR52]
- **Brand tokens only — no raw hex.** `--color-surface`, `--color-bg`, `--color-primary`, `--color-teal`, `--color-muted`. [Source: Story 1.7]
- **4 pt spacing grid.** All gaps / paddings / margins in multiples of 4 px. [Source: CLAUDE.md § Key conventions]
- **Single `<h1>` per page invariant.** Hero owns `<h1>`. This section uses `<h2>`, cards use `<h3>`. [Source: UX-DR28]
- **Epic 2 color rhythm.** `--color-surface` slot (warm grey). [Source: Story 1.7 colour rhythm]
- **Inert "Read article →" is load-bearing.** A clickable-looking affordance pointing to non-existent articles destroys buyer trust before Truvis has earned any. The full attribute combination (`href="#"` + `aria-disabled="true"` + `tabindex="-1"` + `pointer-events-none` + `cursor-not-allowed`) is deliberate and must not be relaxed. [Source: AC4]

### Why a local throwaway partial instead of a Tier-2 composite

Option A (rejected): create a "real" `BlogPreviewCard` Tier-2 composite now and let Epic 4 enhance it. **Rejected** because:
1. UX-DR20 explicitly locates the real `BlogPreviewCard` in Epic 4, and Epic 4's visual direction (card-wrapping links, hover states, image treatment, related-articles navigation) is not yet specified at Story 2.7's checkpoint — building it now would either anticipate Epic 4 (scope creep) or hard-code a visual design Epic 4 will have to rewrite.
2. The V1 placeholder cards do not navigate, so the real card's click-the-whole-card UX pattern is actively counter-productive now — see AC4's guardrail.
3. A throwaway partial with an underscore prefix and a `TODO(epic-4)` comment is the cleanest possible handoff: Epic 4 Story 4.7 deletes one file, updates one import, and replaces three call sites.

Option B (chosen): local throwaway partial in `src/components/sections/_blog-preview-placeholder.astro`, hard-coded placeholder data in `blog-previews-section.astro`, explicit `TODO(epic-4)` migration comment. This is what UX-DR7 / Epic 4 scope prescribe.

### Why the "Read article →" link is inert rather than omitted

The card's visual pattern is load-bearing: a card without a visible CTA at the bottom reads as decorative. A visitor scrolling the page needs to see "oh, these are articles I could read later" and mentally bookmark the section. Hiding the link entirely would:
1. Break the card's visual grammar (card without CTA = ad / product promo),
2. Under-claim the blog's eventual role in buyer education,
3. Leave a visual hole that becomes very obvious at Epic 4 Story 4.7 when the inert link becomes real — the card's visual weight would shift.

Keeping the inert link preserves the visual grammar and makes Epic 4 Story 4.7's migration a one-attribute change (remove `aria-disabled`, `tabindex="-1"`, `pointer-events-none`, `cursor-not-allowed`, add real `href={`/blog/${slug}`}`).

### Previous-story intelligence

- **Story 2.2 (`problem-section.astro`).** Canonical pure-Astro Tier-2 section shape. Copy the header comment style, `Locale` typing, `aria-labelledby`, Epic-2 container recipe. This section has **no entrance motion** — do not copy Story 2.2's CSS fade-in block. [Source: src/components/sections/problem-section.astro]
- **Story 2.3 (`StatCard`, `TrustQuoteCard`).** The "primitives take strings via props" pattern. The placeholder partial follows it: typed props only, no `t()` inside. [Source: Story 2.3 Dev Notes]
- **Story 2.5 (`inspection-story-section.astro`).** The i18n namespace pattern (eyebrow / headline / subheadline + sub-blocks per item). Mirror the shape. [Source: Story 2.5]
- **Story 2.6 (`social-proof-section.astro`).** The immediate upstream section on `src/pages/index.astro`; insert this story's section below it. Also the canonical pattern for three-card grids with `t()`-sourced props. [Source: Story 2.6]
- **Story 1.6 (`t()` helper, FR52 V1 policy).** English authoritative; FR / DE byte-for-byte mirrors. [Source: src/lib/i18n.ts]
- **Story 1.7 (colour rhythm, motion tokens, text-expansion harness convention).** [Source: docs/design-conventions.md if present, else _bmad-output/implementation-artifacts/1-7-...]

### Cross-epic contracts

- **Epic 4 Story 4.1** creates the `blog` Content Collection schema in `src/content/config.ts`, seeds three placeholder MDX articles, and creates `src/lib/content.ts` helpers including `getBlogPreviews(locale, { limit })`.
- **Epic 4 Story 4.2** creates the real `BlogPreviewCard` Tier-2 composite at `src/components/blog/blog-preview-card.astro` per UX-DR20.
- **Epic 4 Story 4.7** is the canonical swap point: deletes `_blog-preview-placeholder.astro`, deletes the `landing.blogPreviews.placeholderCards` i18n block, updates `blog-previews-section.astro` to import `BlogPreviewCard` and `getBlogPreviews`, maps collection entries to cards. Story 4.7's story spec should reference the `TODO(epic-4)` comment in this story's section file as its grep target.
- **Epic 5 Story 5.4** is the hard-coded-strings → Content Collection migration for the landing page. The `blogPreviews` section's `eyebrow`, `headline`, `subheadline`, `readArticleCta` i18n keys are eligible for migration to the `siteContent` collection; the `placeholderCards` block is NOT (Epic 4 deletes it before Epic 5 Story 5.4 runs). Story 5.4's scope does not include Epic 4's work.

### Files you will create / modify

**Create:**
- `src/components/sections/blog-previews-section.astro`
- `src/components/sections/_blog-preview-placeholder.astro`

**Modify:**
- `src/i18n/en/landing.json` (add `blogPreviews` block)
- `src/i18n/fr/landing.json` (byte-for-byte copy — FR52)
- `src/i18n/de/landing.json` (byte-for-byte copy — FR52)
- `src/pages/index.astro` (import + render below `<SocialProofSection />`)
- `src/pages/_demo/text-expansion.astro` (harness registration)

**Do NOT touch:**
- Anything under `src/content/` or `src/lib/content.ts`
- `src/components/sections/stat-card.astro`, `trust-quote-card.astro`, `section-eyebrow.astro`, `hero-section.astro`, `problem-section.astro`, `inspection-story-section.astro`, `social-proof-section.astro`, `header.astro`, `footer.astro`
- `src/components/islands/*`, `src/lib/stores/*`
- `src/layouts/BaseLayout.astro`, `src/lib/i18n.ts`, `src/lib/env.ts`, `src/lib/utils.ts`
- `src/styles/global.css` (only extend if `line-clamp-2` is missing and must be declared; document in dev record)
- `tailwind.config.ts`, `astro.config.mjs`, `lighthouse/budget.json`, `package.json`

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** create a real `BlogPreviewCard` component in this story. That is Epic 4 Story 4.2's scope.
- ❌ **Do NOT** create `src/content/config.ts` blog entries, seed MDX articles, or touch anything under `src/content/`. Epic 4 Story 4.1.
- ❌ **Do NOT** `import { getBlogPreviews } from '@/lib/content';` or any other non-existent Epic 4 helper.
- ❌ **Do NOT** make the card clickable as a whole (no wrapping `<a>`, no `onclick` on `<article>`). A card that looks clickable but goes nowhere is a trust disaster.
- ❌ **Do NOT** remove any of the inert-link attributes. All five are load-bearing: `href="#"`, `aria-disabled="true"`, `tabindex="-1"`, `pointer-events-none`, `cursor-not-allowed`.
- ❌ **Do NOT** machine-translate FR / DE. Byte-for-byte English copies per FR52.
- ❌ **Do NOT** hard-code marketing strings. Every visible value in `blog-previews-section.astro` routes through `t()`.
- ❌ **Do NOT** add `client:*` anywhere in this section. Pure Astro.
- ❌ **Do NOT** add `<FaqSection />` or `<FooterCtaSection />` to `src/pages/index.astro`. Stories 2.8 / 2.9.
- ❌ **Do NOT** add the mid-page CTA slot. Story 2.9.
- ❌ **Do NOT** add a new Vitest file.
- ❌ **Do NOT** pass `phase` or `variant` props to the placeholder partial. V1 has only one visual state.
- ❌ **Do NOT** rename `placeholderCards` to `items` or `cards` in the i18n block. The explicit `placeholderCards` name is Epic 4 Story 4.7's grep target.
- ❌ **Do NOT** wrap the inert link in an SVG for the arrow. Use the literal `→` character appended in the template.
- ❌ **Do NOT** claim the story complete without running `npm run build && npm run preview` and visually confirming the 2+1 reflow at 640 px and the 3-column grid at ≥1024 px.

### Project Structure Notes

- **Alignment with unified structure:** New files in `src/components/sections/`, i18n updates in `src/i18n/{en,fr,de}/landing.json`, page composition edit in `src/pages/index.astro`, harness update in `src/pages/_demo/text-expansion.astro`. The underscore prefix on `_blog-preview-placeholder.astro` is an Astro convention that signals "internal / non-routable / may be deleted" — it does not affect build semantics for components (the underscore prefix only excludes files under `src/pages/`, but it is a useful semantic flag for readers).
- **Variance from plan:** None expected. If the dev agent discovers `line-clamp-2` is not in the repo's Tailwind v4 `@theme` block, extend `global.css` minimally to add it and document the extension. If `bg-teal/10` or a similar tint value is not directly supported, use a brand token that provides the tint — check `global.css` and `tailwind.config.ts` / the `@theme` block before adding anything new.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Architectural boundaries, § Key conventions, § Anti-patterns, § Content access]
- [Source: epics-truvis-landing-page.md:979-1006 — Story 2.7 complete BDD]
- [Source: epics-truvis-landing-page.md — UX-DR7 BlogPreviewsSection, UX-DR20 real BlogPreviewCard (Epic 4), UX-DR28 heading hierarchy, UX-DR29 focus, UX-DR30 contrast, UX-DR31 text expansion]
- [Source: epics-truvis-landing-page.md — FR52 V1 i18n policy]
- [Source: prd-truvis-landing-page.md NFR1 LCP, NFR3 CLS, NFR5 initial weight, NFR6 Lighthouse Performance, NFR21 keyboard, NFR25 accessibility, NFR26 text expansion, NFR39 SEO]
- [Source: architecture-truvis-landing-page.md § Component Tiers, § AR23, § Palette rhythm]
- [Source: src/components/sections/problem-section.astro — canonical pure-Astro Tier-2 section shape]
- [Source: src/components/sections/social-proof-section.astro — Story 2.6 upstream section; immediate sibling on `/`]
- [Source: src/components/sections/section-eyebrow.astro — confirm light-variant prop name]
- [Source: src/i18n/en/landing.json — existing namespace shape]
- [Source: src/lib/i18n.ts — `t()` helper, `Locale` type]
- [Source: src/pages/index.astro — current Epic 2 composition surface]
- [Source: src/pages/_demo/text-expansion.astro — harness registration pattern]
- [Source: src/styles/global.css — brand tokens]
- [Source: _bmad-output/implementation-artifacts/2-6-build-socialproofsection-with-pre-launch-market-statistics.md — Story 2.6 sibling section, canonical Epic 2 section pattern, FR52 V1 i18n policy application]
- [Source: _bmad-output/implementation-artifacts/2-3-build-statcard-and-trustquotecard-tier-2-primitives-pre-launch-variants.md — primitives-take-strings-via-props pattern]
- [Source: _bmad-output/implementation-artifacts/1-6-wire-astro-built-in-i18n-routing-and-locale-detection-middleware.md — `t()` helper, FR52]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — heading hierarchy, contrast, text-expansion harness]

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
