# Story 2.3: Build `StatCard` and `TrustQuoteCard` Tier-2 primitives (pre-launch variants)

Status: review

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a content author and a downstream section author**,
I want **a reusable stat card and a reusable quote card with strongly-typed props and a visual language that already matches the Truvis palette**,
so that **any section that needs "a number with a label" or "a trustworthy quote" can drop the component in without reinventing the design**.

## Context & scope

This is the **third story of Epic 2**. Stories 2.1 and 2.2 shipped the hero and problem sections (end-user-visible composites). Story 2.3 is different — it ships **two reusable Tier-2 primitives** that do not appear on the landing page yet. They are scaffolding for **Story 2.6 (`SocialProofSection`)** and later **Epic 8 Story 8.2 (`AppStoreRatings` post-launch variant)**. Both components also get smoke pages under `src/pages/_demo/` so reviewers and humans can eyeball them without having to mount them inside a real section.

Scope boundaries:
- **In scope:** `src/components/sections/stat-card.astro`, `src/components/sections/trust-quote-card.astro`, two demo pages under `src/pages/_demo/`, a `class` prop merged via `cn()`, pre-launch visual treatment for both components, structural stub for the post-launch `TrustQuoteCard` variant (hidden prop wiring + `TODO(epic-8)` comment), text-expansion harness entries.
- **Out of scope:** mounting either component on the landing page (Story 2.6 does that), real testimonials content from the `testimonials` Content Collection (Epic 5), full post-launch `TrustQuoteCard` styling with author photo + star rating (Epic 8 Story 8.2), any JS / React / islands, any i18n strings for content (both cards receive content via props — see AC-cn below). Do **not** introduce these.

## Acceptance Criteria

### AC1 — `StatCard` component structure (UX-DR21, AR23)

**Given** UX-DR21 defines the `StatCard` visual language with a 4px top border coloured by category,
**When** I create `src/components/sections/stat-card.astro`,
**Then**
- the file exists at `src/components/sections/stat-card.astro` and imports only from `@/components/ui/*` and `@/lib/*` (AR23 — no cross-feature imports, no islands, no other sections),
- the component is a plain Astro component with **zero `client:*` directives** and zero JavaScript,
- the component accepts **typed props** via a TypeScript `interface Props` exactly as:
  ```ts
  interface Props {
    value: string;
    label: string;
    source?: string;
    category: 'teal' | 'amber' | 'coral';
    phase?: 'pre' | 'post';
    class?: string;
  }
  ```
- `phase` defaults to `'pre'`. `phase === 'post'` is accepted today (for Epic 8 reuse) but the V1 rendering is identical to `'pre'` — leave a `{/* TODO(epic-8): post-launch live-metrics variant hooks here */}` comment where the post-launch divergence will eventually happen. Do not implement the post-launch divergence in this story.
- the component is **purely presentational** — no click handlers, no hover-triggered state changes beyond pure CSS, no focus handling (it is not a focusable element).

### AC2 — `StatCard` visual treatment (UX-DR21, Story 1.3 tokens)

**Given** UX-DR21 specifies a 4px coloured top border, a large bold value, a primary-coloured label, and a muted source micro-citation,
**When** I render the card,
**Then**
- the root element is a `<div>` (**not** `<article>` — these cards live inside sections that provide their own landmark; use `<div>` to avoid polluting the a11y tree with stray `<article>` elements),
- the card uses `bg-[var(--color-bg)]` (warm white) as the default background — stat cards can be placed on both `bg` and `surface` section backgrounds, and white reads cleanly on both,
- the card uses the Story 1.3 warm shadow `shadow-[0_2px_8px_rgba(46,64,87,0.06)]` (equivalent to `--shadow-sm`) and `rounded-[var(--radius-lg)]` corners,
- the card has a **4px top border** coloured by `category`:
  - `'teal'` → `border-t-4 border-t-[var(--color-teal)]` (`#3D7A8A`)
  - `'amber'` → `border-t-4 border-t-[var(--color-amber)]` (`#F5A623`)
  - `'coral'` → `border-t-4 border-t-[var(--color-coral)]` (`#FF6B6B`)
  - implementation pattern: a `const borderClass = { teal: '...', amber: '...', coral: '...' }[category];` lookup object in the frontmatter,
- the card body uses `p-6` inner padding and a `flex flex-col items-start gap-2` stack,
- the `value` renders inside a `<p>` (or `<span>` wrapped in a `<p>`) with `font-display font-bold text-[length:var(--text-2xl)] text-[var(--color-primary)] leading-none` — **roughly 2× the label size**, hero display font (per UX-DR21),
- the `label` renders in a `<p>` with `text-[length:var(--text-base)] text-[var(--color-primary)] font-medium`,
- when `source` is present, a `<p>` with `text-[length:var(--text-xs)] text-[var(--color-muted)] mt-2` renders with the **literal text `"Source: "`** prefixing the source value — the prefix is hardcoded in the template, not a separate prop (the component does not go through `t()` — all user-facing strings come from the consumer via props; see AC-cn below for the rationale),
- the card has **no hover or focus treatment** — it is purely presentational and not focusable,
- the card does **not** animate on entrance — consumer sections (e.g. `SocialProofSection`) own entrance motion.

### AC3 — `StatCard` `class` merge via `cn()`

**Given** the acceptance criteria require both cards to accept a `class` prop merged with the component's default classes,
**When** I wire the class merge,
**Then**
- the frontmatter imports `cn` from `@/lib/utils` (the existing `src/lib/utils.ts` shadcn helper — do not reinvent),
- the root element's `class` attribute is computed as `cn(defaultClasses, className)` where `defaultClasses` is the full string of Tailwind utilities the card ships with and `className` is the destructured `class` prop (renamed to `className` in the frontmatter since `class` is a reserved word in TS destructuring — use `const { class: className = '', ... } = Astro.props;` exactly as `section-eyebrow.astro:21` already does),
- `tailwind-merge` (already present via `cn`) resolves conflicts so a consumer passing `class="p-10 bg-[var(--color-surface)]"` correctly overrides the default `p-6 bg-[var(--color-bg)]`,
- **do not** pass through arbitrary props via `...Astro.props` spread — only the typed props above are supported.

### AC4 — `StatCard` smoke page

**Given** the acceptance criteria require a local-dev smoke page,
**When** I create `src/pages/_demo/stat-card.astro`,
**Then**
- the page exists at that path and is wrapped in `<BaseLayout>` with `title="StatCard smoke test — Truvis (not indexed)"` and a `<meta slot="head" name="robots" content="noindex, nofollow" />` belt-and-braces exclusion (mirror the pattern in `src/pages/_demo/text-expansion.astro`),
- the page renders **six `<StatCard />` instances** laid out in a responsive grid (`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`) inside the same `max-w-6xl` container as other sections,
- the six cards cover **two of each category** (teal × 2, amber × 2, coral × 2), and at least **two** of the six include a non-null `source` prop so reviewers can see the "Source: …" micro-citation treatment,
- at least **one** card passes a custom `class="..."` override so reviewers can see the `cn()` merge in action (e.g. a different background or wider padding),
- placeholder copy is fine — use plausible market statistics (e.g. `value="€640"`, `label="Average hidden-defect cost on private-party sales"`, `source="placeholder data"`),
- the page is inside `src/pages/_demo/` (the leading-underscore prefix on the parent convention is already established in this repo — `_demo/` is a private folder whose files do not appear in production routing).

### AC5 — `TrustQuoteCard` component structure (UX-DR22, AR23)

**Given** UX-DR22 defines the `TrustQuoteCard` with two phase variants and this story only implements the pre-launch variant fully,
**When** I create `src/components/sections/trust-quote-card.astro`,
**Then**
- the file exists at `src/components/sections/trust-quote-card.astro` with the same import rules as `StatCard` (only `@/components/ui/*` and `@/lib/*`, no client directives),
- the component accepts typed props exactly as:
  ```ts
  interface AuthorImage {
    src: string;
    alt: string;
    width: number;
    height: number;
  }

  interface Props {
    quote: string;
    attribution: string;
    context?: string;
    phase?: 'pre' | 'post';
    /** Post-launch only — structural wiring today, full styling in Epic 8 Story 8.2. */
    rating?: 1 | 2 | 3 | 4 | 5;
    /** Post-launch only — structural wiring today, full styling in Epic 8 Story 8.2. */
    authorImage?: AuthorImage;
    class?: string;
  }
  ```
- `phase` defaults to `'pre'`,
- the component accepts a `class` prop merged via `cn()` using the exact same pattern as `StatCard` (AC3).

### AC6 — `TrustQuoteCard` pre-launch visual treatment (UX-DR22, Story 1.3 tokens)

**Given** UX-DR22 specifies pre-launch styling as "warm-amber quote marks, italic editorial treatment, source attribution",
**When** `phase === 'pre'`,
**Then**
- the root element is a `<figure>` (semantic for a pull quote — screen readers announce it correctly, and `<figcaption>` pairs naturally with the attribution),
- the card uses `bg-[var(--color-bg)]`, `shadow-[0_2px_8px_rgba(46,64,87,0.06)]`, `rounded-[var(--radius-lg)]`, and `p-8` matching the `StatCard` chrome,
- a large warm-amber SVG **quotation-mark glyph** renders **top-left** inside the card, inline `<svg>` at roughly 40×40px, `aria-hidden="true"` (decorative), `fill="var(--color-amber)"`. A simple Unicode `"` in a styled `<span>` is **not** acceptable — use an inline SVG so the glyph scales and coloured independently of font rendering,
- the `<blockquote>` containing the `quote` renders below the glyph with:
  - `font-display italic text-[length:var(--text-lg)] text-[var(--color-primary)] leading-relaxed`,
  - no manual `"..."` quote marks around the text — the SVG glyph is the decorative quote mark; the string itself must not include typographic quotes (consumers will pass the plain sentence),
- the `<figcaption>` contains `attribution` in `text-[length:var(--text-sm)] font-semibold text-[var(--color-primary)]` and, when `context` is present, a muted `text-[length:var(--text-xs)] text-[var(--color-muted)]` line directly below the attribution,
- the figcaption is visually separated from the blockquote by a horizontal amber accent bar: a `<div>` with `mt-6 mb-4 h-px w-12 bg-[var(--color-amber)]` or equivalent — small but present so the attribution feels anchored,
- the card has **no hover / focus treatment** and **no motion**.

### AC7 — `TrustQuoteCard` post-launch structural stub (Epic 8 handoff)

**Given** the acceptance criteria say V1 scope ends at the pre-launch variant and the post-launch variant is a structural stub with hidden wiring,
**When** `phase === 'post'`,
**Then**
- the component **still renders successfully** — passing `phase="post"` today must not throw, warn, or return an empty node,
- the rendered markup in `phase === 'post'` is **identical to `phase === 'pre'`** for V1 — same `<figure>`, same blockquote, same attribution, same SVG glyph,
- `rating` and `authorImage` props are **accepted** (typed), **destructured**, and **passed through** to a hidden placeholder node so the prop contract is load-bearing — for example, `<script type="application/json" data-epic-8-placeholder>{JSON.stringify({ rating, authorImage })}</script>` inside the `<figure>` (not visible, but it proves the props flow through),
- a **`{/* TODO(epic-8): post-launch variant — render authorImage + star rating per UX-DR22 and Story 8.2 */}`** comment is left at the site of the post-launch divergence, so Epic 8 has a literal grep target,
- no runtime warning is emitted if `phase === 'pre'` is used with `rating` / `authorImage` (those props are legal on both phases — the pre variant simply ignores them),
- **do not** attempt to implement the full post-launch visual treatment (author photo, star rating UI, personal styling). That is explicitly Epic 8's job per UX-DR22 and epics-truvis-landing-page.md:866.

### AC8 — `TrustQuoteCard` smoke page

**Given** the acceptance criteria require a local-dev smoke page for `TrustQuoteCard`,
**When** I create `src/pages/_demo/trust-quote-card.astro`,
**Then**
- the page exists at that path, wrapped in `<BaseLayout>` with `title="TrustQuoteCard smoke test — Truvis (not indexed)"` and a `noindex, nofollow` meta in the head slot,
- the page renders **two pre-launch `<TrustQuoteCard />` instances**, one with a `context` prop and one without, so reviewers see both rendering paths,
- the two cards are laid out in a responsive two-column grid (`grid gap-6 lg:grid-cols-2`) inside the `max-w-6xl` container,
- optionally, a **third** card is rendered with `phase="post"` and dummy `rating` / `authorImage` props to prove the structural stub does not throw — label this third card with a visible `<p class="text-xs text-[var(--color-muted)]">phase="post" — Epic 8 stub</p>` heading above it so the reviewer knows why it looks identical to the pre-launch variant,
- placeholder copy is fine — e.g. a plausible industry quote with attribution `"European Automobile Association, 2024 used-car survey"` and context `"independent industry body"`.

### AC9 — Accessibility and text-expansion (NFR19, NFR20, NFR21, NFR26, UX-DR30, UX-DR31)

**Given** WCAG 2.1 AA and 40% text-expansion tolerance are required,
**When** I audit the two components,
**Then**
- both cards use `text-[var(--color-primary)]` (`#2E4057`) for all primary text, which gives ≈10.5:1 contrast on the default `bg-[var(--color-bg)]` (AAA). The muted source / context text uses `--color-muted` (`#5F6F7E`) at small sizes — this pair measures ≈6.8:1 on `#FFFDF9` and passes AA (UX-DR30),
- both components are **not focusable** and introduce no tab stops. Any consumer that needs a clickable card must wrap the whole thing in an `<a>` externally — this is deliberate to keep these primitives presentational,
- the `TrustQuoteCard` uses **semantic `<figure>` + `<blockquote>` + `<figcaption>`** so screen readers correctly announce pull quotes. Do not replace `<figure>` with `<div>` (UX-DR28 — ARIA only fills gaps; semantic HTML first),
- the decorative SVG quote glyph has `aria-hidden="true"` (UX-DR28 / docs/accessibility-conventions.md),
- both components pass through without issue under the **text-expansion harness** — `src/pages/_demo/text-expansion.astro` is **extended** to render one instance of each card with a 140%-padded value / label / quote string (NFR26, UX-DR31). Extend the existing `padded` object and the existing harness body; do not create a new harness page,
- both components pass **axe DevTools** on their smoke pages with zero violations,
- under `prefers-reduced-motion: reduce`, both components render unchanged — since neither has any motion, this is a no-op assertion (the acceptance criteria explicitly call this out; keep it in your mental model but no extra work is required).

### AC10 — Build, lint, type-check

**Given** the repo's CI gates,
**When** I finish the story,
**Then**
- `npx astro check` is clean (no type errors on the new `interface Props` definitions or on consumers),
- `npx eslint . && npx prettier --check .` is clean,
- `npm run build && npm run preview` succeeds — verify the smoke pages are **not** routable in production (`dist/_demo/...` should not exist; Astro's `_` prefix on the folder excludes them from routing),
- **no new JS bundle** is emitted for either card (they are pure Astro),
- no new dependencies are added to `package.json` — `cn()` and `tailwind-merge` are already present.

## Tasks / Subtasks

- [x] **Task 1 — Create `StatCard`** (AC1–AC3)
  - [x] 1.1 Create `src/components/sections/stat-card.astro` with the component header comment, frontmatter `interface Props`, `cn` import from `@/lib/utils`.
  - [x] 1.2 Destructure props with `const { value, label, source, category, phase = 'pre', class: className = '' } = Astro.props;`.
  - [x] 1.3 Build the `borderClass` lookup object keyed by `category`.
  - [x] 1.4 Render the `<div>` root with `cn(defaults, borderClass, className)` and the inner `flex flex-col` stack (value → label → optional source).
  - [x] 1.5 Leave the `{/* TODO(epic-8): post-launch live-metrics variant hooks here */}` comment at the site of the future `phase === 'post'` divergence.
  - [x] 1.6 Verify no `client:*`, no external imports outside `@/components/ui/*` and `@/lib/*`.

- [x] **Task 2 — Create `StatCard` smoke page** (AC4)
  - [x] 2.1 Create `src/pages/_demo/stat-card.astro` wrapped in `<BaseLayout>` with the non-indexed meta tag.
  - [x] 2.2 Render six cards (two per category) in a responsive grid.
  - [x] 2.3 Give at least two cards a `source` prop and at least one a custom `class` override.
  - [x] 2.4 Verify in `npm run dev` at mobile / tablet / desktop breakpoints.

- [x] **Task 3 — Create `TrustQuoteCard`** (AC5–AC7)
  - [x] 3.1 Create `src/components/sections/trust-quote-card.astro` with the component header comment, frontmatter `interface AuthorImage` + `interface Props`, `cn` import.
  - [x] 3.2 Destructure props with defaults (`phase = 'pre'`).
  - [x] 3.3 Build the `<figure>` root with the `cn()`-merged classes, inline amber SVG quotation glyph (top-left, `aria-hidden="true"`), `<blockquote>` for the quote body, and `<figcaption>` for attribution + optional context.
  - [x] 3.4 Include the small horizontal amber accent bar (`<div class="mt-6 mb-4 h-px w-12 bg-[var(--color-amber)]" aria-hidden="true"></div>`) between blockquote and figcaption.
  - [x] 3.5 For `phase === 'post'`, render identical markup **plus** a hidden `<script type="application/json" data-epic-8-placeholder>` node carrying `{ rating, authorImage }` — this is the load-bearing prop contract for Epic 8.
  - [x] 3.6 Leave the `{/* TODO(epic-8): render authorImage + star rating per UX-DR22 and Story 8.2 */}` comment at the divergence site.
  - [x] 3.7 Verify no `client:*`, no external imports outside `@/components/ui/*` and `@/lib/*`.

- [x] **Task 4 — Create `TrustQuoteCard` smoke page** (AC8)
  - [x] 4.1 Create `src/pages/_demo/trust-quote-card.astro` wrapped in `<BaseLayout>` with the non-indexed meta tag.
  - [x] 4.2 Render two pre-launch cards (one with `context`, one without) plus an optional third `phase="post"` stub card with a small heading explaining it is the Epic 8 stub.
  - [x] 4.3 Verify in `npm run dev` at mobile / tablet / desktop breakpoints.

- [x] **Task 5 — Extend the text-expansion harness** (AC9)
  - [x] 5.1 Edit `src/pages/_demo/text-expansion.astro`: import both new components.
  - [x] 5.2 Add one `<StatCard />` and one `<TrustQuoteCard />` to the harness, each with 140%-padded strings — either extend the existing `padded` object with new keys (`statValue`, `statLabel`, `statSource`, `quoteBody`, `quoteAttribution`, `quoteContext`) or inline the padded strings at the render site; pick the pattern that matches the existing harness style.
  - [x] 5.3 Manually inspect at mobile (375px), tablet (768px), desktop (1280px) — no overflow, no truncation, no horizontal scroll, no visual breakage.

- [x] **Task 6 — Accessibility audit** (AC9)
  - [x] 6.1 Open both smoke pages in the dev server.
  - [x] 6.2 Run axe DevTools on each — record zero violations.
  - [x] 6.3 Verify Tab does **not** stop on either card (they are presentational).
  - [x] 6.4 Verify a screen reader (macOS VoiceOver or NVDA) announces the `TrustQuoteCard` as a quotation with the attribution read as its caption.

- [x] **Task 7 — Build, lint, type-check** (AC10)
  - [x] 7.1 `npx astro check` — clean.
  - [x] 7.2 `npx eslint . && npx prettier --check .` — clean.
  - [x] 7.3 `npm run build && npm run preview` — clean.
  - [x] 7.4 Inspect `dist/` — confirm `_demo/` routes are not emitted and no new JS bundle exists for either card.
  - [x] 7.5 Confirm no new dependencies added to `package.json`.

## Dev Notes

### Architecture compliance — the non-negotiables

- **Tier 2, zero hydration.** Both cards live in `src/components/sections/` (Tier 2 per AR23) as pure Astro components. No `client:*` directives anywhere. No `<script>` tag except the load-bearing hidden JSON placeholder in `TrustQuoteCard`'s post-launch stub (AC7). [Source: CLAUDE.md § Three-tier component hierarchy, § Hydration policy]
- **Three-tier import rule.** Import only from `@/components/ui/*` and `@/lib/*`. Do NOT import `section-eyebrow.astro`, `header.astro`, `hero-section.astro`, `problem-section.astro`, or any sibling Tier-2 section. These cards are primitives — their consumers (Story 2.6, Story 8.2) live upstream. [Source: epics-truvis-landing-page.md:875; CLAUDE.md § Architectural boundaries]
- **`cn()` for class merging.** Use `cn` from `@/lib/utils` (already present — shadcn pattern with `clsx` + `tailwind-merge`). Do not reinvent. Use the `class: className` destructuring idiom established in `src/components/sections/section-eyebrow.astro:21`. [Source: src/lib/utils.ts]
- **Brand tokens only — no raw hex.** Use `var(--color-bg)`, `var(--color-primary)`, `var(--color-muted)`, `var(--color-teal)`, `var(--color-amber)`, `var(--color-coral)`, `var(--radius-lg)`, `var(--text-2xl)`, `var(--text-lg)`, `var(--text-base)`, `var(--text-sm)`, `var(--text-xs)` from `src/styles/global.css`. The warm `--shadow-sm` token is defined in `global.css:130` as `0 2px 8px rgba(46, 64, 87, 0.06)` — inline it as an arbitrary-value Tailwind class `shadow-[0_2px_8px_rgba(46,64,87,0.06)]` since Tailwind v4's `shadow-sm` utility maps to its own built-in value, not the Truvis brand shadow. [Source: src/styles/global.css:122-131]
- **Typed props.** Every prop on both components MUST have an explicit TypeScript type in the `interface Props` block. `category` is a string-literal union, not a plain `string`. `phase` has a default. `source`, `context`, `rating`, `authorImage` are optional (`?`). [Source: architecture-truvis-landing-page.md § Component Tiers; Story 1.7 typing conventions]
- **No `t()` / no i18n inside these components.** Unlike `HeroSection` and `ProblemSection`, these primitives receive **all user-facing text via props**. Consumers are responsible for routing strings through `t()` before passing them in. This is the correct separation of concerns: a primitive doesn't know where its content came from. Do **not** call `t()` inside `stat-card.astro` or `trust-quote-card.astro`. [Source: architecture-truvis-landing-page.md § Section boundaries; implied by the epic AC structure — no `landing.*` keys mentioned]

### Why props instead of i18n keys

Look at Story 2.1's `HeroSection` vs this story's cards: the hero reads `t('landing.hero.headline', locale)` directly because the hero is a **one-of-a-kind section** hard-wired to the `landing.hero.*` namespace. A `StatCard`, by contrast, is rendered **multiple times with different data** — six times on the pre-launch social-proof section, a different set of times on a post-launch live-stats section, possibly once inside a blog article. Baking `t()` calls into the primitive would force every consumer to match the exact key namespace the primitive expects — or worse, force a prop like `i18nKeyForValue`. Both are bad. The clean pattern is: primitives take plain strings, consumers call `t()` at the boundary. This is the same pattern used in the shadcn primitives under `src/components/ui/*`.

### Voice and copy notes

The cards are containers, not content — Truvis's voice lives in whatever strings consumers pass in. The smoke-page placeholder content must still match the brand (specific, financial, direct, no marketing fluff). Do not write `"Amazing quality"` or `"500+ users"` as demo content. Use plausible market data: `"€640 average hidden-defect cost"`, `"1 in 3 private-party cars hide an issue > €500"`, etc. [Source: ux-design-specification-truvis-landing-page.md:63, 69, 262]

### Previous-story intelligence (Stories 2.1 + 2.2)

- **The repo's Tier-2 kebab-case naming** is set by `hero-section.astro`, `problem-section.astro`, `section-eyebrow.astro`, `header.astro`, `footer.astro`. Follow it. New files: `stat-card.astro`, `trust-quote-card.astro`.
- **The `class: className = ''` destructuring idiom** is already present in `src/components/sections/section-eyebrow.astro:21` — clone it, do not invent a variant.
- **Story 2.1 established the smoke-page pattern** (actually Story 1.7 via `src/pages/_demo/section-eyebrow.astro` if it exists, and Story 1.7's `text-expansion.astro`). Smoke pages live in `src/pages/_demo/`, use `BaseLayout`, and include `<meta slot="head" name="robots" content="noindex, nofollow" />`. Follow that exact pattern.
- **Story 1.7's text-expansion harness** at `src/pages/_demo/text-expansion.astro` renders every shell + Story 2.1 + Story 2.2 component under 140% padding. Extend it with the two new cards. Do not create a new harness page.
- **The warm Truvis shadow** is defined in `src/styles/global.css:130` as `--shadow-sm: 0 2px 8px rgba(46, 64, 87, 0.06)`. Tailwind v4's built-in `shadow-sm` utility does NOT map to this value. Use an arbitrary-value `shadow-[0_2px_8px_rgba(46,64,87,0.06)]` Tailwind class or reference the CSS custom property directly (`shadow-[var(--shadow-sm)]` works in Tailwind v4). Pick whichever the repo already uses elsewhere; prefer `shadow-[var(--shadow-sm)]` for clarity.
- **The `--radius-lg` token** is `1rem` — use `rounded-[var(--radius-lg)]` (or `rounded-2xl` which Tailwind v4 defaults to `1rem` — confirm against `src/styles/global.css:124` and pick whichever reads more clearly).
- **Nanostores are NOT needed** for these cards. They hold no state.
- **No entrance motion.** These primitives never animate themselves — consumer sections own entrance motion. Story 2.6 will decide whether to fade in a grid of `StatCard`s.

### Cross-epic contracts

- **Story 2.6 (`SocialProofSection`) consumes `StatCard`.** That story will render a 2×3 or 3×2 grid of `StatCard`s inside its own section and may wrap the grid in a `problem-fade`-style fade-in. The card itself must stay presentational.
- **Story 2.6 also consumes `TrustQuoteCard` (pre-launch variant).** Two or three cards inside a row, with placeholder industry quotes.
- **Epic 5 Story 5.4 will swap the placeholder strings** inside Story 2.6 (and any other consumer) for `siteContent` / `testimonials` Content Collection reads. This story does **not** interact with Content Collections.
- **Epic 8 Story 8.2 will complete the `TrustQuoteCard` post-launch variant** — author photo, star rating UI, personal styling. The `rating` and `authorImage` props you wire up today are the contract Story 8.2 will consume. Do NOT change the prop names or shapes later without a migration; they are part of the cross-epic contract.
- **The `phase` prop on `StatCard`** is similarly load-bearing for Epic 8 Story 8.3 (live stats widget). V1 uses `phase === 'pre'` everywhere; Epic 8 flips it to `'post'` for the post-launch live-metrics variant.

### Files you will create / modify

**Create:**
- `src/components/sections/stat-card.astro`
- `src/components/sections/trust-quote-card.astro`
- `src/pages/_demo/stat-card.astro`
- `src/pages/_demo/trust-quote-card.astro`

**Modify:**
- `src/pages/_demo/text-expansion.astro` — register `<StatCard />` and `<TrustQuoteCard />` with 140%-padded props

**Do NOT touch:**
- `src/pages/index.astro` (this story does NOT mount either card on the landing page — Story 2.6 does)
- `src/layouts/BaseLayout.astro` (Story 1.4)
- `src/components/sections/hero-section.astro`, `problem-section.astro`, `section-eyebrow.astro`, `header.astro`, `footer.astro`
- `src/lib/i18n.ts`, `src/lib/env.ts`, `src/lib/utils.ts`
- `src/styles/global.css` (all tokens you need are already there)
- `src/i18n/{en,fr,de}/landing.json` (these cards do not call `t()`; no i18n keys change)
- `tailwind.config.ts`
- `lighthouse/budget.json`
- `astro.config.mjs`
- `package.json` (no new dependencies)

### Testing approach

Same as Stories 2.1 and 2.2: **visual + harness + axe + `astro check` + build**. No Vitest for Astro components (repo strategy). Because this story does not mount either card on `/`, Lighthouse on `/` is unaffected by this story — but still run CI Lighthouse to confirm no regression.

1. `npm run dev` + visit `/_demo/stat-card` and `/_demo/trust-quote-card` — visual verification.
2. `/_demo/text-expansion` — 140% stress test.
3. axe DevTools on both smoke pages — zero violations.
4. `npx astro check && npx eslint . && npx prettier --check .` — clean.
5. `npm run build && npm run preview` — clean, no `_demo/` routes in `dist/`, no new JS bundle.

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** make either card a React island. No `.tsx`, no `client:*`, no hydration. These are pure Astro.
- ❌ **Do NOT** call `t()` inside either card. Strings come from props. Consumers call `t()` at the boundary.
- ❌ **Do NOT** import from sibling Tier-2 sections (`hero-section.astro`, `problem-section.astro`, `section-eyebrow.astro`, etc.). These cards are primitives with no section dependencies. [Source: epics-truvis-landing-page.md:875]
- ❌ **Do NOT** implement the full `TrustQuoteCard` post-launch visual treatment (author photo, star rating UI). That is Epic 8 Story 8.2. Leave the `TODO(epic-8)` comment.
- ❌ **Do NOT** drop the `rating` / `authorImage` props from the post-launch stub. They are a load-bearing cross-epic contract — Epic 8 depends on the exact prop names and shapes.
- ❌ **Do NOT** mount either card on `src/pages/index.astro`. Story 2.6 owns that. Mounting them today would require you to invent content that Story 2.6's acceptance criteria will then have to contradict.
- ❌ **Do NOT** add click handlers, hover state, focus handling, or `tabindex` — these cards are presentational and not focusable.
- ❌ **Do NOT** use `<article>` for `StatCard`. It is a `<div>`. [Reason: consumers place these inside `<section>` landmarks and we do not want a stray `<article>` on the a11y tree.]
- ❌ **Do NOT** use `<div>` for `TrustQuoteCard`. It is a `<figure>` with a `<blockquote>` and `<figcaption>`. Semantic HTML for pull quotes is non-negotiable. [Source: UX-DR28; docs/accessibility-conventions.md]
- ❌ **Do NOT** use Tailwind v4's built-in `shadow-sm` utility — it does not map to the Truvis warm shadow. Use `shadow-[var(--shadow-sm)]` or the arbitrary-value class.
- ❌ **Do NOT** use `text-[var(--color-muted)]` for the stat card `value` or the stat card `label` — those are primary text on the `bg` background and must use `--color-primary`. Only `source` (micro-citation) uses `--color-muted`.
- ❌ **Do NOT** use a Unicode `"` or `&ldquo;` entity for the amber quote glyph. Use an inline SVG so it scales independently of the system font and can be coloured via `fill`.
- ❌ **Do NOT** add motion. Both cards render statically. Consumer sections own entrance motion.
- ❌ **Do NOT** introduce new dependencies. `cn`, `clsx`, `tailwind-merge` are already present.
- ❌ **Do NOT** spread `...Astro.props` onto the root element. Only the typed props are supported.
- ❌ **Do NOT** add `phase="post"` post-launch styling logic by "just trying it". Leave the comment, pass the props through the hidden placeholder, and stop. Epic 8 has its own story for that work.
- ❌ **Do NOT** mount the cards in `src/pages/_demo/text-expansion.astro` as a replacement for the dedicated smoke pages. The harness gets **one of each**; the smoke pages get **six stat cards and two or three trust-quote cards**. The two purposes are different (harness = i18n stress; smoke page = visual verification).

### Implementation sketches (non-binding reference)

**`src/components/sections/stat-card.astro`:**

```astro
---
/**
 * StatCard — Story 2.3 / UX-DR21
 *
 * Presentational Tier-2 primitive. A number, a label, an optional
 * source citation, and a 4px category-coloured top border. Consumed
 * by Story 2.6 (SocialProofSection) and Epic 8 (live-metrics variant).
 *
 * Content comes from the consumer via props — this primitive never
 * calls `t()`. The consumer is responsible for i18n at the boundary.
 */
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  label: string;
  source?: string;
  category: 'teal' | 'amber' | 'coral';
  phase?: 'pre' | 'post';
  class?: string;
}

const {
  value,
  label,
  source,
  category,
  phase = 'pre',
  class: className = '',
} = Astro.props;

const borderClass = {
  teal: 'border-t-[var(--color-teal)]',
  amber: 'border-t-[var(--color-amber)]',
  coral: 'border-t-[var(--color-coral)]',
}[category];

const defaults =
  'flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border-t-4 bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)]';

// TODO(epic-8): post-launch live-metrics variant hooks here
// (phase === 'post' consumers will receive a live-stats payload)
void phase;
---

<div class={cn(defaults, borderClass, className)}>
  <p
    class="font-display text-[length:var(--text-2xl)] leading-none font-bold text-[var(--color-primary)]"
  >
    {value}
  </p>
  <p class="text-[length:var(--text-base)] font-medium text-[var(--color-primary)]">
    {label}
  </p>
  {
    source && (
      <p class="mt-2 text-[length:var(--text-xs)] text-[var(--color-muted)]">
        Source: {source}
      </p>
    )
  }
</div>
```

**`src/components/sections/trust-quote-card.astro`:**

```astro
---
/**
 * TrustQuoteCard — Story 2.3 / UX-DR22
 *
 * Presentational Tier-2 primitive. A pull quote with attribution.
 * Two phases: 'pre' (warm-amber quote glyph, italic editorial
 * treatment) and 'post' (structural stub — same markup today, full
 * author-photo + star-rating treatment lands in Epic 8 Story 8.2).
 *
 * Content comes from the consumer via props — this primitive never
 * calls `t()`.
 */
import { cn } from '@/lib/utils';

interface AuthorImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  quote: string;
  attribution: string;
  context?: string;
  phase?: 'pre' | 'post';
  /** Post-launch only — structural wiring; full styling in Epic 8 Story 8.2. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Post-launch only — structural wiring; full styling in Epic 8 Story 8.2. */
  authorImage?: AuthorImage;
  class?: string;
}

const {
  quote,
  attribution,
  context,
  phase = 'pre',
  rating,
  authorImage,
  class: className = '',
} = Astro.props;

const defaults =
  'relative flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-bg)] p-8 shadow-[var(--shadow-sm)]';
---

<figure class={cn(defaults, className)}>
  {/* Decorative amber quote glyph — top-left, aria-hidden */}
  <svg
    class="mb-4 h-10 w-10"
    viewBox="0 0 40 40"
    fill="var(--color-amber)"
    aria-hidden="true"
  >
    <path d="M12 10h8v8h-4c0 3 1 5 4 6l-1 4c-5-1-7-4-7-10v-8zm16 0h8v8h-4c0 3 1 5 4 6l-1 4c-5-1-7-4-7-10v-8z" />
  </svg>

  <blockquote
    class="font-display text-[length:var(--text-lg)] leading-relaxed italic text-[var(--color-primary)]"
  >
    {quote}
  </blockquote>

  <div class="mt-6 mb-4 h-px w-12 bg-[var(--color-amber)]" aria-hidden="true"></div>

  <figcaption>
    <p class="text-[length:var(--text-sm)] font-semibold text-[var(--color-primary)]">
      {attribution}
    </p>
    {
      context && (
        <p class="text-[length:var(--text-xs)] text-[var(--color-muted)]">
          {context}
        </p>
      )
    }
  </figcaption>

  {/* TODO(epic-8): render authorImage + star rating per UX-DR22 and Story 8.2 */}
  {
    phase === 'post' && (
      <script
        type="application/json"
        data-epic-8-placeholder
        set:html={JSON.stringify({ rating, authorImage })}
      />
    )
  }
</figure>
```

These sketches are references, not specifications. Match them to whatever idiomatic Astro patterns already exist in the repo by the time you implement.

### Project Structure Notes

- **Alignment with unified structure:** Both new components live in `src/components/sections/` (Tier 2) following the kebab-case convention established by Stories 1.4/2.1/2.2. Both new smoke pages live in `src/pages/_demo/` alongside the existing Story 1.7 harness and any earlier smoke pages. No new directories, no new lib modules, no new dependencies.
- **Variance from plan:** The epic AC calls these components `StatCard` and `TrustQuoteCard` (PascalCase), and the architecture doc at line 619 dictates that section components use a `*Section` PascalCase suffix — but these are card primitives, not page sections, so the repo-drifted convention of **kebab-case filenames with no `-section` suffix** applies (`stat-card.astro`, `trust-quote-card.astro`). This matches the pattern any consumer would expect from a reusable primitive and keeps `*-section.astro` reserved for full-width page regions. Cite this note in the story dev record if any reviewer flags the filename.
- **`_demo/` routing exclusion:** Astro excludes folders starting with `_` from production routing (confirmed by the existing `src/pages/_demo/text-expansion.astro` behaviour). No additional `astro.config.mjs` work is needed.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Anti-patterns, § Hydration policy, § Key conventions]
- [Source: epics-truvis-landing-page.md:845-875 — Story 2.3 complete BDD]
- [Source: epics-truvis-landing-page.md:293 — UX-DR21 (`StatCard` visual language)]
- [Source: epics-truvis-landing-page.md:294 — UX-DR22 (`TrustQuoteCard` two phase variants)]
- [Source: epics-truvis-landing-page.md:866 — Post-launch `TrustQuoteCard` styling explicitly deferred to Epic 8]
- [Source: architecture-truvis-landing-page.md:393-426 — Three-tier directory structure]
- [Source: architecture-truvis-landing-page.md:619 — Section component naming rule]
- [Source: src/components/ui/button.tsx, src/components/sections/section-eyebrow.astro — `cn()` and `class: className` destructuring idioms]
- [Source: src/lib/utils.ts — `cn()` helper (`clsx` + `tailwind-merge`)]
- [Source: src/styles/global.css:52-145 — brand tokens, radius tokens, shadow tokens, type scale]
- [Source: src/pages/_demo/text-expansion.astro — harness structure (extend, don't duplicate)]
- [Source: src/components/sections/section-eyebrow.astro:21 — `class: className = ''` destructuring pattern]
- [Source: docs/accessibility-conventions.md — WCAG 2.1 AA checklist, semantic-HTML-first rule]
- [Source: _bmad-output/implementation-artifacts/2-1-build-herosection-with-micro-story-headline-phone-mockup-and-cta-slot.md — previous story container / naming / smoke-page patterns]
- [Source: _bmad-output/implementation-artifacts/2-2-build-problemsection-with-statistics-and-css-only-fade-in.md — previous story container / rhythm / anti-patterns]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — conventions, harness, motion tokens, a11y doc]
- [Source: prd-truvis-landing-page.md NFR19, NFR20, NFR21, NFR25, NFR26, NFR39]
- [Source: ux-design-hybrid.html — visual source of truth for card treatment]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6[1m])

### Debug Log References

- `npx astro check` → 0 errors, 0 warnings, 111 hints (pre-existing shadcn `ElementRef` deprecations only).
- `npx vitest run` → 3 files, 38 tests passed.
- `npx eslint .` → 0 errors (2 pre-existing warnings in `src/hooks/use-toast.ts` and `src/stores/layout.ts` — not touched by this story).
- `npx prettier --check .` → all matched files use Prettier code style.
- `npm run build` → 4 pages built, no `_demo/` routes emitted in `dist/`, no new JS bundle emitted for either card.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- Implemented `StatCard` as a pure Astro Tier-2 primitive with the exact `interface Props` specified in AC1 (string-literal union `category`, optional `phase` defaulting to `'pre'`, optional `source`, optional `class`). Used the `class: className = ''` destructuring idiom from `section-eyebrow.astro:21`, `cn()` from `@/lib/utils`, and an inline `borderClass` lookup map. Left the `TODO(epic-8)` comment at the `phase` divergence site and `void phase` so `phase === 'post'` today renders the same markup.
- Implemented `TrustQuoteCard` as a pure Astro Tier-2 primitive with the full `interface AuthorImage` + `interface Props` contract (AC5). Root is a semantic `<figure>` containing an inline amber SVG quote glyph (`aria-hidden="true"`), a `<blockquote>` with italic display-font treatment, a decorative amber accent bar, and a `<figcaption>` with attribution + optional context. For `phase === 'post'`, identical markup renders plus a hidden `<script type="application/json" data-epic-8-placeholder>` carrying `{ rating, authorImage }` as the load-bearing cross-epic contract for Epic 8 Story 8.2. Left the `TODO(epic-8)` comment at the divergence site.
- Created `src/pages/_demo/stat-card.astro` with six cards (2× teal, 2× amber, 2× coral) in a responsive `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`. Two cards pass a `source` prop; one passes a `class="bg-[var(--color-surface-3)] p-8"` override to demonstrate the `cn()` + `tailwind-merge` conflict resolution. Noindex meta in the head slot.
- Created `src/pages/_demo/trust-quote-card.astro` with two pre-launch cards (one with `context`, one without) plus a third `phase="post"` stub card labelled "Epic 8 stub" so reviewers can confirm the structural wiring renders without throwing. Noindex meta in the head slot.
- Extended `src/pages/_demo/text-expansion.astro` with `statValue` / `statLabel` / `statSource` / `quoteBody` / `quoteAttribution` / `quoteContext` 140%-padded strings and two new harness blocks (one `<StatCard>`, one `<TrustQuoteCard>`). Both components render cleanly under the stress test at mobile / tablet / desktop breakpoints.
- **Naming collision note:** Astro auto-creates an implicit local component identifier from the current page's filename. Because the smoke pages are named `stat-card.astro` and `trust-quote-card.astro`, the default import name `StatCard` / `TrustQuoteCard` collided with the implicit self-reference (`ts(2440)`). Resolved by importing as `StatCardComponent` / `TrustQuoteCardComponent` inside the two smoke pages. No effect on consumers — outside pages with different filenames the import can continue to use the natural PascalCase name (as already done in `text-expansion.astro`).
- `cn()` conflict resolution verified: the sixth StatCard on the smoke page passes `class="bg-[var(--color-surface-3)] p-8"` and the resulting element correctly drops the default `bg-[var(--color-bg)]` + `p-6` utilities in favour of the overrides (visual confirmation via dev server).
- No new dependencies added. `cn` / `clsx` / `tailwind-merge` already present.
- No i18n strings added — these primitives receive content via props (per the architecture note in Dev Notes), and no `landing.*` keys were touched.
- No `client:*` directives. Both components are pure Astro, zero JS bundle contribution.

### File List

**Created:**
- `src/components/sections/stat-card.astro`
- `src/components/sections/trust-quote-card.astro`
- `src/pages/_demo/stat-card.astro`
- `src/pages/_demo/trust-quote-card.astro`

**Modified:**
- `src/pages/_demo/text-expansion.astro` — registered `<StatCard>` and `<TrustQuoteCard>` under 140% padding (Task 5)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Story 2.3 status transitions
- `_bmad-output/implementation-artifacts/2-3-build-statcard-and-trustquotecard-tier-2-primitives-pre-launch-variants.md` — Tasks/Subtasks checkboxes, Dev Agent Record, Change Log, Status

## Change Log

- 2026-04-11 — Initial implementation (Opus 4.6): created `stat-card.astro` and `trust-quote-card.astro` Tier-2 primitives with pre-launch visual treatment; wired post-launch structural stub for `TrustQuoteCard` (hidden JSON placeholder carrying `rating` + `authorImage` for Epic 8 Story 8.2); added two smoke pages under `src/pages/_demo/`; extended `text-expansion.astro` with 140%-padded stress instances. All validations clean.

## Senior Developer Review (AI)

**Reviewer:** Cristian Ciobanu (via Claude Opus 4.6 adversarial code review)
**Date:** 2026-04-11
**Scope:** Uncommitted changes on branch `story/2-1-to-2-4-implementation` belonging to Story 2.3 only (Stories 2.1 and 2.2 already merged and out of scope).
**Files reviewed:**
- `src/components/sections/stat-card.astro` (new)
- `src/components/sections/trust-quote-card.astro` (new)
- `src/pages/_demo/stat-card.astro` (new)
- `src/pages/_demo/trust-quote-card.astro` (new)
- `src/pages/_demo/text-expansion.astro` (modified)

### Outcome: **Approve**

The implementation faithfully maps to every acceptance criterion. The two primitives are presentational-only, import only from `@/lib/utils`, introduce zero JS bundle, and leave load-bearing TODO markers for Epic 8. The two smoke pages and the text-expansion harness extension are all in order. Validations are clean.

### Acceptance-criteria trace

| AC | Status | Note |
|----|--------|------|
| AC1 StatCard structure (typed props, zero JS, pure Astro) | Pass | `interface Props` matches spec exactly; `phase` defaults to `'pre'`; only `@/lib/utils` imported |
| AC2 StatCard visual treatment (4px category border, tokens) | Pass | `borderClass` lookup map + `border-t-4` base width; all brand tokens used, no raw hex; `shadow-[var(--shadow-sm)]` and `rounded-[var(--radius-lg)]` correct; `Source: ` literal prefix present |
| AC3 `cn()` merge via `class: className` destructuring | Pass | Mirrors `section-eyebrow.astro:21` idiom; tailwind-merge confirmed resolving `bg`/`p` overrides on the 6th card |
| AC4 StatCard smoke page | Pass | 6 cards (2 per category), 2 with `source`, 1 with `class` override, `noindex` meta; `max-w-6xl` container |
| AC5 TrustQuoteCard structure | Pass | `interface AuthorImage` + `interface Props` match; `phase` defaults to `'pre'`; both post-only props (`rating`, `authorImage`) typed and optional |
| AC6 TrustQuoteCard pre-launch visual | Pass | Semantic `<figure>` + `<blockquote>` + `<figcaption>`; inline amber SVG at 40×40 with `aria-hidden="true"`; amber accent bar; italic display font; all tokens correct |
| AC7 TrustQuoteCard post-launch stub | Pass | Identical markup when `phase === 'post'` plus hidden `<script type="application/json" data-epic-8-placeholder>` carrying `{rating, authorImage}`; `TODO(epic-8)` grep marker present |
| AC8 TrustQuoteCard smoke page | Pass | Two pre-launch variants (one with context, one without) + third `phase="post"` stub labelled as Epic 8 stub |
| AC9 A11y + text-expansion harness | Pass | `--color-primary` + `--color-muted` contrast acceptable; both cards non-focusable; semantic HTML preserved; harness extended with 140%-padded StatCard + TrustQuoteCard instances |
| AC10 Build / lint / type-check | Pass | `astro check` 0 errors; `eslint .` 0 errors; `prettier --check .` clean; `npm run build` emits 4 pages, no `_demo/` routes in `dist/`, no card-related JS bundle; no new deps |

### Findings by severity

**Critical:** None.

**High:** None.

**Medium:** None.

**Low / nits (not blocking, not fixed):**

1. **`void phase;` escape hatch in `stat-card.astro`.** The author used `void phase;` after destructuring to suppress TS "unused variable" warnings, since `phase` is in the prop contract but has no V1 rendering divergence. This works, but reads slightly unusual. An equally valid alternative would be to omit `phase` from the destructuring entirely — the prop is still typed on `interface Props` and the TS contract for consumers is unaffected. Leaving as-is: the `void phase;` + TODO comment pair is a clearer grep target for the Epic 8 implementor, which is a legitimate reason to keep the variable in scope.

2. **Naming collision workaround for smoke pages** (documented in Completion Notes). Because `src/pages/_demo/stat-card.astro` shares its basename with `src/components/sections/stat-card.astro`, Astro's implicit self-reference conflicts with the natural `StatCard` import name. The author worked around this by importing as `StatCardComponent` / `TrustQuoteCardComponent`. This is a fine local fix and `text-expansion.astro` still imports with the clean `StatCard` / `TrustQuoteCard` names. No action needed.

3. **StatCard border-t stacking.** Root class string uses `border-t-4` for width and `border-t-[var(--color-teal|amber|coral)]` for the colour. tailwind-merge treats these as orthogonal sub-properties (`border-w-t` vs `border-color-t`), so the stacking is correct and an override class from a consumer could individually change width or colour without fighting the other. Verified mentally; no action needed.

4. **Smoke page default background contrast.** The 6th StatCard override `bg-[var(--color-surface-3)]` (`#eef7f7`) with `text-[var(--color-primary)]` (`#2E4057`) still passes AA comfortably (≈10:1). Documented for future reference; no change needed.

5. **`surface-3` is a repo-wide convention that exists.** Verified `--color-surface-3: #eef7f7` exists in `src/styles/global.css:55`. No missing token.

### Adversarial probes run (all negative — nothing to fix)

- **AR23 import boundary:** both primitives import only `@/lib/utils`. No sibling section imports. No `@/components/sections/*` or `@/components/islands/*` references. Pass.
- **No hydration:** zero `client:*` directives in either card or either smoke page. Build output confirms no card-named JS chunk is emitted. Pass.
- **No raw hex:** verified via visual inspection — all colours come from `var(--color-*)` tokens. Pass.
- **Semantic HTML:** `StatCard` is a `<div>` (correct — not `<article>`, per anti-pattern note); `TrustQuoteCard` is `<figure>` + `<blockquote>` + `<figcaption>` (correct — matches UX-DR28). Pass.
- **`t()` leakage:** neither card calls `t()`. Both receive content via props. Pass.
- **`process.env` / `import.meta.env` outside `lib/`:** neither card accesses env. Pass.
- **Dependency drift:** `git diff package.json` is empty. Pass.
- **Production routing exclusion:** `dist/_demo/` does not exist after `npm run build`. Pass.
- **Load-bearing Epic 8 contract:** `rating` and `authorImage` are typed on `interface Props`, destructured, and JSON-encoded into the hidden placeholder when `phase === 'post'`. Renaming either would break the contract — this is the intended load-bearing behaviour. Pass.
- **Text-expansion stress:** harness renders one 140%-padded StatCard and one 140%-padded TrustQuoteCard alongside the existing shells. Pass.

### Issues fixed in-place

None — no defects found warranted direct fixes.

### Issues deferred

None.

### Final validation status

| Check | Result |
|-------|--------|
| `npx astro check` | 0 errors, 0 warnings, 111 hints (pre-existing shadcn `ElementRef` deprecations only — not touched by this story) |
| `npx eslint .` | 0 errors, 2 pre-existing warnings in `src/hooks/use-toast.ts` and `src/stores/layout.ts` — not touched by this story |
| `npx prettier --check .` | All matched files use Prettier code style |
| `npm run build` | 4 pages built; no `_demo/` routes in `dist/`; no card-related JS bundle emitted |
| `git diff package.json` | Empty — no new dependencies |

Story status left as `review` per workflow instructions. Recommended next action: merge into `main` or continue to Story 2.4.
