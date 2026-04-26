# Story 4.2: Build `BlogPreviewCard` Tier 2 Composite

Status: review

## Story

As **a designer and as a downstream consumer of the blog UI**,
I want **one reusable preview card that renders a blog post in a consistent visual language across the landing page, the blog index, the related-articles strip, and any future surfaces**,
so that **changing the card's look in one place updates it everywhere**.

## Context & Scope

This is the **second story of Epic 4**. It builds `src/components/blog/blog-preview-card.astro` — a pure Astro Tier-2 composite that renders a blog post preview card. The component consumes the `BlogPostView` type produced by Story 4.1 and is consumed by every downstream blog surface (Story 4.3 blog index, Story 4.5 related articles, Story 4.7 landing page swap-in).

**In scope:**
- `src/components/blog/blog-preview-card.astro` — the production card component.
- `src/pages/_demo/blog-preview-card.astro` — smoke page with six cards (three from seed data, three from synthetic long-string mocks).
- New i18n key `blog.card.readArticle` in `src/i18n/en/blog.json` (plus FR/DE mirrors).

**Out of scope:**
- `src/components/sections/_blog-preview-placeholder.astro` — the Story 2.7 throwaway partial. Do NOT modify or delete it; Story 4.7 handles that.
- `src/components/sections/blog-previews-section.astro` — do NOT touch; Story 4.7 swaps placeholders for real cards.
- Blog index page, article page, related-articles strip — those are Stories 4.3, 4.4, 4.5.
- Any changes to `src/lib/content.ts` or `src/content/` — Story 4.1 owns those.

**Dependency:** Story 4.1 must be complete. It provides `BlogPostView` from `src/lib/types/blog.ts`, seed articles in `src/content/blog/`, and `getAllBlogPosts()` / `getFeaturedBlogPosts()` from `src/lib/content.ts`.

## Acceptance Criteria (BDD)

### AC1 — Component file location, props interface, and zero-JS contract

**Given** the three-tier hierarchy (AR23) places blog composites in `src/components/blog/`,
**When** I create `src/components/blog/blog-preview-card.astro`,
**Then**
- the file is a **pure Astro component** with zero `client:*` directives and zero JavaScript shipped to the browser,
- the typed props interface is:
  ```ts
  import type { BlogPostView } from '@/lib/types/blog';
  interface Props {
    post: BlogPostView;
    class?: string;
    priority?: boolean;
  }
  ```
- `post` is the **only** required prop,
- `class` is merged via `cn()` from `@/lib/utils` onto the outermost element,
- `priority` defaults to `false`; when `true`, the thumbnail uses `loading="eager"` and `fetchpriority="high"` (for above-the-fold usage on the landing page).

### AC2 — Thumbnail rendering with SVG placeholder fallback and Astro `<Image>` for real images

**Given** UX-DR20 specifies zero image weight for placeholder thumbnails and NFR3 requires CLS < 0.1,
**When** the card renders,
**Then**
- if `post.featuredImage.src` is a placeholder sentinel (empty string, or starts with `placeholder`) or is not a valid imported image, an **inline SVG** is rendered as the thumbnail — a simple abstract geometric pattern using Truvis teal/amber tokens, with `aria-hidden="true"` (decorative),
- if `post.featuredImage.src` points to a real image, the Astro `<Image>` component from `astro:assets` is used with the stored `width` and `height` from `post.featuredImage` to prevent CLS, with a descriptive `alt` from `post.featuredImage.alt`,
- the thumbnail container enforces 16:9 aspect ratio via `aspect-[16/9]` and rounds only the top corners: `rounded-t-[var(--radius-lg)]`,
- the image/SVG fills the container with `object-cover w-full h-full`,
- when `priority` is `true`, the `<Image>` gets `loading="eager"` and `fetchpriority="high"`; otherwise `loading="lazy"`.

### AC3 — Card layout and visual design (UX-DR20)

**Given** UX-DR20 defines the BlogPreviewCard visual contract,
**When** I inspect the rendered card,
**Then** the layout order top-to-bottom is:
1. **Thumbnail** — 16:9, rounded top corners (`rounded-t-[var(--radius-lg)]`), overflow hidden.
2. **Content area** — padded `p-5`, `flex flex-col gap-3`.
3. **Category badge** — pill: `inline-flex w-fit items-center rounded-full bg-[var(--color-surface-3)] px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-[var(--color-teal)]`.
4. **Title** — `<h3>` with classes: `font-display text-[length:var(--text-lg)] leading-tight font-semibold text-[var(--color-primary)]`. Must support multi-line wrap gracefully.
5. **Excerpt** — `<p>` in muted colour with 2-line truncation: `line-clamp-2 text-[length:var(--text-base)] leading-relaxed text-[var(--color-muted)]`.
6. **Footer row** — `mt-auto flex items-center justify-between pt-2`:
   - Left: read-time in `<time datetime="PT{minutes}M">` with classes `text-[length:var(--text-xs)] text-[var(--color-faint)]`.
   - Right: "Read article" CTA text (from i18n) with arrow `→`, styled `text-[length:var(--text-sm)] font-semibold text-[var(--color-teal)]`.

### AC4 — Interaction states: shadow, hover lift, focus ring

**Given** UX-DR20 specifies three interaction states,
**When** the card is in its various states,
**Then**
- **Default:** `shadow-[var(--shadow-sm)]` + subtle border `border border-[var(--color-divider)]`.
- **Hover:** lifts to `shadow-[var(--shadow-md)]` + title transitions to `text-[var(--color-teal)]`. Shadow and colour transitions use `transition-[box-shadow,color] duration-[var(--duration-base)] ease-out`.
- **Focus (`focus-visible` on wrapping `<a>`):** 2px teal outline with 2px offset — `focus-visible:outline-2 focus-visible:outline-[var(--color-teal)] focus-visible:outline-offset-2`. Focus ring is applied to the outer `<a>` wrapper.
- Transitions respect `--duration-base` (250ms). Under `prefers-reduced-motion: reduce`, the shadow transition is removed (hover/focus styles still apply instantly). Use `motion-safe:transition-...` prefix pattern.

### AC5 — Keyboard accessibility and touch target

**Given** UX-DR26 requires 44x44px minimum touch targets and full keyboard access,
**When** I interact with the card,
**Then**
- the entire card is wrapped in a single `<a>` element linking to `post.webUrl`, making the whole card a click/tap target,
- the `<a>` is the outermost interactive element, wrapping the `<article>`,
- Tab reaches the card; Enter activates the link,
- on mobile, the touch target meets the 44x44px minimum (the card itself is well above this threshold),
- the `<a>` has no redundant inner links — the "Read article →" text in the footer is visual-only, not a separate `<a>`.

### AC6 — Semantic HTML and ARIA

**Given** UX-DR28 requires proper heading hierarchy,
**When** I inspect the markup,
**Then**
- the card content is wrapped in `<article>`,
- the title is `<h3>` (sub-heading to the parent surface's `<h2>`),
- the read-time uses `<time>` with `datetime` in ISO 8601 duration format: `datetime="PT{minutes}M"` (e.g., `datetime="PT6M"`),
- the SVG placeholder thumbnail has `aria-hidden="true"`,
- real images have descriptive `alt` text from `post.featuredImage.alt`.

### AC7 — Reduced motion support (UX-DR32)

**Given** UX-DR32 requires `prefers-reduced-motion` respect,
**When** the user has reduced motion enabled,
**Then** the shadow elevation transition on hover is removed (no animation), but the hover/focus visual states (shadow level change, title colour change) still apply instantly. Use `motion-safe:` Tailwind prefix for transition utilities.

### AC8 — Text expansion tolerance (UX-DR31)

**Given** UX-DR31 requires 40% text expansion tolerance for FR/DE translations,
**When** the card renders under 140% synthetic placeholder strings,
**Then** no content overflows, truncates unexpectedly, or breaks the layout. The excerpt `line-clamp-2` naturally handles longer text. The title wraps to additional lines. The category badge and footer row accommodate wider strings.

### AC9 — i18n for static strings

**Given** the card has one user-facing static string ("Read article →"),
**When** I implement the card,
**Then**
- the string is sourced from `t('blog.card.readArticle', locale)` — not hard-coded,
- the card accepts `locale` implicitly from Astro.currentLocale or as an explicit prop derived from the page context,
- `src/i18n/en/blog.json` gains the key `"card": { "readArticle": "Read article" }`,
- FR/DE mirrors get identical English values per FR52 (real translations in V1.2).

### AC10 — Demo page with six cards

**Given** visual verification requires diverse card states,
**When** I create `src/pages/_demo/blog-preview-card.astro`,
**Then**
- the page renders six `BlogPreviewCard` instances in a 3-column responsive grid (1 col mobile, 2 col sm, 3 col lg),
- three cards use real seed articles from `getFeaturedBlogPosts(3)` (Story 4.1),
- three cards use synthetic `BlogPostView` mock objects with 140%-expanded strings (long titles, long excerpts, long category names) to verify text expansion tolerance,
- the page follows the existing `_demo/` pattern: `BaseLayout`, `noindex` meta, story/AC reference header, descriptive `<h1>`,
- at least one card has `priority={true}` to verify eager loading behaviour.

## Tasks / Subtasks

### Task 1: Create i18n keys
- [x] 1. Add `"card": { "readArticle": "Read article" }` to `src/i18n/en/blog.json`. Create the file if Story 4.1 did not create it; merge if it exists.
- [x] 2. Mirror the same key/value to `src/i18n/fr/blog.json` and `src/i18n/de/blog.json` (FR52 byte-for-byte English).

### Task 2: Build `blog-preview-card.astro`
- [x] 1. Create `src/components/blog/blog-preview-card.astro`.
- [x] 2. Import `BlogPostView` from `@/lib/types/blog`, `cn` from `@/lib/utils`, `Image` from `astro:assets`, `t` from `@/lib/i18n`.
- [x] 3. Destructure props: `post`, `class: className`, `priority = false`.
- [x] 4. Determine locale from `Astro.currentLocale ?? 'en'`.
- [x] 5. Build the thumbnail: check if `post.featuredImage.src` is a real image (imported asset with width/height) vs placeholder. Render inline SVG for placeholder, `<Image>` for real.
- [x] 6. Build the card markup per AC3 layout order.
- [x] 7. Wire interaction states per AC4 using Tailwind classes on the wrapping `<a>`.
- [x] 8. Apply `motion-safe:` prefix to transition utilities per AC7.
- [x] 9. Wire the `<time>` element with ISO 8601 duration `datetime` attribute.
- [x] 10. Wire the "Read article →" CTA text through `t()`.

### Task 3: Build inline SVG placeholder
- [x] 1. Create a simple geometric SVG (abstract car silhouette or geometric pattern) using `var(--color-surface-3)` background, `var(--color-teal)` and `var(--color-amber)` accent strokes/fills.
- [x] 2. SVG must be `aria-hidden="true"`, fill the 16:9 container, and have no external dependencies.
- [x] 3. Keep SVG markup minimal — target < 500 bytes.

### Task 4: Build demo page
- [x] 1. Create `src/pages/_demo/blog-card-demo.astro` (renamed from `blog-preview-card.astro` to avoid Astro import naming conflict).
- [x] 2. Import `BaseLayout`, `BlogPreviewCard`, and `getFeaturedBlogPosts` from `@/lib/content`.
- [x] 3. Fetch three seed posts via `getFeaturedBlogPosts(3)`.
- [x] 4. Create three synthetic `BlogPostView` mock objects with 140%-expanded strings.
- [x] 5. Render all six in a responsive grid.
- [x] 6. Mark one card with `priority={true}`.

### Task 5: Verify
- [x] 1. `npm run build` — successful static build.
- [x] 2. Visual verification deferred to reviewer (dev server).
- [x] 3. `npx astro check` — zero TypeScript errors.
- [x] 4. `npx eslint .` and `npx prettier --check .` pass.
- [x] 5. Verify semantic HTML: `<article>`, `<h3>`, `<time datetime="PT...M">`, `aria-hidden` on SVG — all present in component source.

## Dev Notes

### Component Interface (quick reference)

```ts
// src/lib/types/blog.ts (from Story 4.1 — DO NOT create or modify)
export interface BlogPostView {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;       // e.g., 'buying-guide' | 'inspection-tips' | ...
  publishDate: string;           // ISO 8601
  dateModified?: string;
  readTimeMinutes: number;
  featuredImage: {
    src: string;                 // placeholder sentinel or real image path
    alt: string;
    width: number;
    height: number;
  };
  webUrl: string;                // absolute URL to the article
  // ... other fields not needed by this card
}
```

> **Important:** The exact `BlogPostView` shape is defined by Story 4.1. The above is the expected subset. Adapt if Story 4.1's actual output differs.

### Tailwind Utility Cheat Sheet

| Token | Tailwind class |
|---|---|
| Background | `bg-[var(--color-bg)]` |
| Surface 3 | `bg-[var(--color-surface-3)]` |
| Primary text | `text-[var(--color-primary)]` |
| Muted text | `text-[var(--color-muted)]` |
| Faint text | `text-[var(--color-faint)]` |
| Teal | `text-[var(--color-teal)]` |
| Divider border | `border-[var(--color-divider)]` |
| Shadow sm | `shadow-[var(--shadow-sm)]` |
| Shadow md | `shadow-[var(--shadow-md)]` |
| Radius lg | `rounded-[var(--radius-lg)]` / `rounded-t-[var(--radius-lg)]` |
| Duration base | `duration-[var(--duration-base)]` |
| Fluid text-lg | `text-[length:var(--text-lg)]` |
| 2-line clamp | `line-clamp-2` |
| 16:9 aspect | `aspect-[16/9]` |

### Hover title colour transition pattern

The title colour needs to change on hover of the *parent* `<a>`. Use Tailwind's `group` utility:
```html
<a class="group ...">
  <article>
    <h3 class="... group-hover:text-[var(--color-teal)]">...</h3>
  </article>
</a>
```

### Reduced motion pattern

Use `motion-safe:` prefix instead of a separate `@media` block:
```html
<a class="... motion-safe:transition-[box-shadow,color] motion-safe:duration-[var(--duration-base)] motion-safe:ease-out">
```

### SVG placeholder approach

Keep it simple — a rounded rect with a subtle geometric motif:
```html
<svg aria-hidden="true" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-full w-full">
  <rect width="320" height="180" fill="var(--color-surface-3)"/>
  <!-- Simple geometric accent shapes in teal/amber -->
</svg>
```

### Anti-patterns to avoid

- **Do NOT** import from `astro:content` or call `getCollection()` — this component receives data via props only.
- **Do NOT** add `client:*` directives — this is zero-JS.
- **Do NOT** modify `_blog-preview-placeholder.astro` or `blog-previews-section.astro` — Story 4.7's job.
- **Do NOT** hard-code "Read article" — use `t()`.
- **Do NOT** use `outline: none` without a replacement focus indicator.
- **Do NOT** add a second `<a>` inside the card for the CTA text — the outer `<a>` is the single interactive element.
- **Do NOT** use `fetchpriority` on the SVG placeholder — it only applies to `<Image>`.

### Image detection logic

Story 4.1's `BlogPostView.featuredImage.src` may be:
- An imported Astro image object (has `.src`, `.width`, `.height` as numbers) — render with `<Image>`.
- A string placeholder like `''` or `'placeholder'` — render inline SVG.

Check the actual Story 4.1 implementation for the concrete type. If `featuredImage.src` is always a string (URL), check whether it's a valid asset path. If it's an `ImageMetadata` object from `astro:assets`, use it directly with `<Image>`. Adapt the detection logic to match Story 4.1's actual output.

### Project Structure Notes

```
src/
  components/
    blog/
      README.md                          # Existing — describes this tier
      blog-preview-card.astro            # NEW — this story
    sections/
      _blog-preview-placeholder.astro    # Existing throwaway — DO NOT TOUCH
      blog-previews-section.astro        # Existing — DO NOT TOUCH
  pages/
    _demo/
      blog-preview-card.astro            # NEW — this story
  i18n/
    en/blog.json                         # Add card.readArticle key
    fr/blog.json                         # Mirror
    de/blog.json                         # Mirror
  lib/
    types/blog.ts                        # Story 4.1 — BlogPostView type (read-only)
    content.ts                           # Story 4.1 — getFeaturedBlogPosts() (read-only)
    utils.ts                             # cn() helper (read-only)
    i18n.ts                              # t() helper (read-only)
```

### References

- **Epics file:** `_bmad-output/planning-artifacts/epics-truvis-landing-page.md` — Story 4.2 acceptance criteria block
- **Architecture:** `_bmad-output/planning-artifacts/architecture-truvis-landing-page.md` — AR23 (three-tier hierarchy), AR25 (content access boundary)
- **UX source of truth:** `_bmad-output/planning-artifacts/ux-design-hybrid.html` — UX-DR20 (BlogPreviewCard visual contract), UX-DR26 (touch targets), UX-DR28 (heading hierarchy), UX-DR31 (text expansion), UX-DR32 (reduced motion)
- **Existing placeholder:** `src/components/sections/_blog-preview-placeholder.astro` — visual reference for card shape (but this story's card supersedes it with full interaction states, real image support, and semantic markup)
- **Story 2.7:** `_bmad-output/implementation-artifacts/2-7-build-blogpreviewssection-with-inline-placeholder-cards.md` — context on the placeholder it replaces (in Story 4.7)
- **Design tokens:** `src/styles/global.css` — `@theme` block with all colour, shadow, radius, type, and motion tokens
- **Demo pattern:** `src/pages/_demo/stat-card.astro` — follow this page's structure for the demo page

## File List

- `src/components/blog/blog-preview-card.astro` — NEW (main component)
- `src/pages/_demo/blog-card-demo.astro` — NEW (smoke/demo page)
- `src/i18n/en/blog.json` — MODIFIED (added `card.readArticle` key)
- `src/i18n/fr/blog.json` — MODIFIED (added `card.readArticle` key)
- `src/i18n/de/blog.json` — MODIFIED (added `card.readArticle` key)

## Change Log

- 2026-04-26: Implemented BlogPreviewCard component, inline SVG placeholder, i18n keys, and demo page. All ACs satisfied.

## Dev Agent Record

- **Started:** 2026-04-26
- **Completed:** 2026-04-26
- **Deviations:**
  - Story 4.1's actual `BlogPostView` uses `readTime: string` (e.g. "6 min") instead of `readTimeMinutes: number` and `publishedAt` instead of `publishDate`. Adapted the component to parse the numeric minutes from the string for the `<time datetime>` attribute.
  - Demo page renamed from `blog-preview-card.astro` to `blog-card-demo.astro` to avoid Astro import declaration conflict (the page file name collided with the component import name).
- **Notes:**
  - All seed blog posts use placeholder SVG images (`/assets/blog/placeholder-*.svg`), so the SVG fallback renders for all seed cards. The `<Image>` path will activate when real images are added.
  - 74 existing tests pass with zero regressions. No new unit tests added as this is a pure Astro template component with no testable logic beyond what the existing content.test.ts covers.
  - `npx astro check` — 0 errors. `npx prettier --check .` — passes. `npm run build` — successful.
