# Story 4.7: Replace Epic 2 `BlogPreviewsSection` placeholder with real `BlogPreviewCard` + `lib/content.ts` data

Status: ready-for-dev

## Story

As **a visitor on the Truvis landing page**,
I want **the blog previews section to show real articles I can actually click through to**,
so that **the "From the Truvis blog" section delivers on its promise instead of showing inert placeholder cards**.

## Context & Scope

This is a **cross-epic wiring story** with minimal scope. Epic 2 Story 2.7 shipped `BlogPreviewsSection` with a throwaway `_blog-preview-placeholder.astro` partial and hard-coded i18n-driven placeholder data. This story replaces those inert cards with real `BlogPreviewCard` components (Story 4.2) fed by `getFeaturedBlogPosts()` / `getAllBlogPosts()` from `lib/content.ts` (Story 4.1), and deletes the throwaway partial.

**Dependencies (must be complete before this story):**
- **Story 4.1** — provides `getFeaturedBlogPosts(limit?)`, `getAllBlogPosts()` in `src/lib/content.ts`, `BlogPostView` type in `src/lib/types/blog.ts`, and three seed articles in `src/content/blog/`.
- **Story 4.2** — provides `BlogPreviewCard` at `src/components/blog/blog-preview-card.astro` accepting `post: BlogPostView` and `priority?: boolean`.

**In scope:**
- Rewrite `src/components/sections/blog-previews-section.astro` to use real data and the real card component.
- Delete `src/components/sections/_blog-preview-placeholder.astro`.
- Remove unused `landing.blogPreviews.placeholderCards.*` i18n keys from `src/i18n/{en,fr,de}/landing.json`.

**Out of scope:**
- `src/pages/index.astro` — no change needed; it already composes `BlogPreviewsSection`.
- Any other Epic 2 section file.
- `src/lib/content.ts` or `src/content/` — Story 4.1 owns those.
- `src/components/blog/blog-preview-card.astro` — Story 4.2 owns that.
- Blog index, article pages, API endpoints — Stories 4.3, 4.4, 4.8.

## Acceptance Criteria (BDD)

### AC1 — Section fetches real blog data at build time

**Given** Epic 2 Story 2.7 shipped `blog-previews-section.astro` with hard-coded placeholder data,
**When** I update the section's frontmatter,
**Then**
- it imports `getFeaturedBlogPosts` and `getAllBlogPosts` from `@/lib/content`,
- it imports `BlogPreviewCard` from `@/components/blog/blog-preview-card.astro`,
- it calls `getFeaturedBlogPosts(3)` at build time,
- if the result contains fewer than 3 posts, it falls back to `getAllBlogPosts()` and takes the first 3 (most recent by publishDate descending),
- the `BlogPreviewPlaceholder` import is removed,
- the `TODO(epic-4)` comment block is removed.

### AC2 — Cards render as real `BlogPreviewCard` components

**Given** the section has fetched up to 3 posts,
**When** the section renders,
**Then**
- each post is rendered as `<BlogPreviewCard post={post} />` inside the existing responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`),
- none of the three cards pass `priority={true}` — the hero phone mockup remains the LCP candidate (NFR1),
- the "Read article" link on each card is a real clickable link pointing to the article's `webUrl` (e.g., `/blog/2026/03/slug`),
- the existing `SectionEyebrow`, heading, and section structure are preserved.

### AC3 — Throwaway placeholder partial is deleted

**Given** `_blog-preview-placeholder.astro` was scaffolding for Epic 2,
**When** this story is complete,
**Then** `src/components/sections/_blog-preview-placeholder.astro` is deleted from the repository.

### AC4 — Unused i18n keys cleaned up

**Given** the `landing.blogPreviews.placeholderCards.*` keys are no longer consumed,
**When** I clean up the i18n files,
**Then**
- the `placeholderCards` object is removed from `src/i18n/en/landing.json`, `src/i18n/fr/landing.json`, and `src/i18n/de/landing.json`,
- the `readArticleCta` key under `landing.blogPreviews` is also removed (the card's CTA text is now sourced from `blog.card.readArticle` via Story 4.2's i18n key),
- `landing.blogPreviews.eyebrow` and `landing.blogPreviews.headline` are **kept** — they are still used by the section heading.

### AC5 — Graceful handling when fewer than 3 posts exist

**Given** the content collection might have fewer than 3 featured posts,
**When** the fallback logic runs,
**Then**
- if `getFeaturedBlogPosts(3)` returns 0 posts, the section falls back to `getAllBlogPosts()` and slices the first 3,
- if even `getAllBlogPosts()` returns 0 posts (edge case), the grid renders empty with no runtime error — the section heading still renders,
- if only 1 or 2 posts are available, 1 or 2 cards render in the grid without layout breakage.

### AC6 — Landing page CI budgets still pass

**Given** this is a swap-in with no new JavaScript or new images,
**When** CI runs after this change,
**Then**
- `npx astro check` passes with zero errors,
- `npx eslint .` and `npx prettier --check .` pass,
- Lighthouse CI budgets pass (Performance >= 90, Accessibility >= 90, SEO >= 95, LCP < 2.5s, CLS < 0.1),
- axe-core reports zero new violations.

### AC7 — Minimal diff scope

**Given** this is a cross-epic wiring story,
**When** I verify the diff,
**Then**
- modified files: `src/components/sections/blog-previews-section.astro`, `src/i18n/en/landing.json`, `src/i18n/fr/landing.json`, `src/i18n/de/landing.json`,
- deleted file: `src/components/sections/_blog-preview-placeholder.astro`,
- no other Epic 2 files are touched,
- `src/pages/index.astro` is NOT modified.

## Tasks / Subtasks

### Task 1: Update `blog-previews-section.astro`

1. **Replace imports** in the frontmatter:
   - Remove: `import BlogPreviewPlaceholder from '@/components/sections/_blog-preview-placeholder.astro';`
   - Add: `import BlogPreviewCard from '@/components/blog/blog-preview-card.astro';`
   - Add: `import { getFeaturedBlogPosts, getAllBlogPosts } from '@/lib/content';`
2. **Add data-fetching logic** in the frontmatter (after existing locale/t() setup):
   ```ts
   let posts = await getFeaturedBlogPosts(3);
   if (posts.length < 3) {
     const allPosts = await getAllBlogPosts();
     posts = allPosts.slice(0, 3);
   }
   ```
3. **Remove the `readArticleCta` const** — no longer needed (the card handles its own CTA text via `blog.card.readArticle` i18n key from Story 4.2).
4. **Remove the entire `TODO(epic-4)` comment block** (lines 46-57 in current file).
5. **Replace the three `<BlogPreviewPlaceholder>` instances** with a map over posts:
   ```astro
   {posts.map((post) => (
     <BlogPreviewCard post={post} />
   ))}
   ```
6. **Preserve** the existing section wrapper, `SectionEyebrow`, heading, and grid container exactly as-is.

### Task 2: Delete the placeholder partial

1. Delete `src/components/sections/_blog-preview-placeholder.astro` from the repository (`git rm`).

### Task 3: Clean up i18n keys

1. In `src/i18n/en/landing.json`: remove the entire `placeholderCards` object and the `readArticleCta` key from the `blogPreviews` block. The result should be:
   ```json
   "blogPreviews": {
     "eyebrow": "From the Truvis blog",
     "headline": "Short reads that sharpen your eye before the test drive."
   }
   ```
2. Apply the same removal to `src/i18n/fr/landing.json` and `src/i18n/de/landing.json`.

### Task 4: Verify

1. `npm run dev` — visual check at `http://localhost:4321`. Confirm:
   - The blog previews section renders three cards with real seed content from Story 4.1.
   - Each card is clickable and links to a real article URL.
   - Section heading ("From the Truvis blog") and eyebrow still render.
   - Responsive grid behaves correctly: 1 col mobile, 2 col sm, 3 col lg.
2. `npx astro check` — zero TypeScript errors.
3. `npx eslint .` and `npx prettier --check .` pass.
4. `npm run build` — static build succeeds.
5. Verify no broken imports referencing the deleted `_blog-preview-placeholder.astro`.

## Dev Notes

### Expected final state of `blog-previews-section.astro` frontmatter

```ts
import SectionEyebrow from '@/components/sections/section-eyebrow.astro';
import BlogPreviewCard from '@/components/blog/blog-preview-card.astro';
import { getFeaturedBlogPosts, getAllBlogPosts } from '@/lib/content';
import { t, type Locale } from '@/lib/i18n';

const locale = (Astro.currentLocale ?? 'en') as Locale;

let posts = await getFeaturedBlogPosts(3);
if (posts.length < 3) {
  const allPosts = await getAllBlogPosts();
  posts = allPosts.slice(0, 3);
}
```

### Expected final state of the grid

```astro
<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">
  {posts.map((post) => (
    <BlogPreviewCard post={post} />
  ))}
</div>
```

### What NOT to touch

- `src/pages/index.astro` — already composes `BlogPreviewsSection`, no change needed.
- `src/components/blog/blog-preview-card.astro` — owned by Story 4.2.
- `src/lib/content.ts` — owned by Story 4.1.
- `src/content/blog/` — owned by Story 4.1.
- Any other section component from Epic 2.

### No `priority={true}` on these cards

The blog previews section is well below the fold. The LCP candidate is the hero phone mockup. All three cards must render with the default `priority={false}` (lazy loading). Do NOT pass `priority` at all — the component defaults to `false`.

### Project Structure Notes

- **Three-tier hierarchy**: `BlogPreviewsSection` (Tier 2, `sections/`) composes `BlogPreviewCard` (Tier 2, `blog/`). Same-tier composition between different domain directories is permitted per AR23.
- **Content access boundary**: Data fetching uses only `getFeaturedBlogPosts()` and `getAllBlogPosts()` from `lib/content.ts`. No direct `getCollection()` calls.
- **No new `client:*` directives**: Both the section and the card are pure Astro components. Zero JavaScript shipped to the browser.
- **i18n boundary**: The section still uses `t()` for its own heading/eyebrow. The card component handles its own static strings internally via `t('blog.card.readArticle', locale)` (Story 4.2). Dynamic content (title, excerpt, category) comes from the Content Collection.

### References

| Ref | Location |
|---|---|
| Story 2.7 (original section) | `_bmad-output/implementation-artifacts/2-7-*` |
| Story 4.1 (content helpers) | `_bmad-output/implementation-artifacts/4-1-*` |
| Story 4.2 (BlogPreviewCard) | `_bmad-output/implementation-artifacts/4-2-*` |
| Epics file (AC source) | `_bmad-output/planning-artifacts/epics-truvis-landing-page.md` line 1645 |
| Architecture (AR23 tiers) | `_bmad-output/planning-artifacts/architecture-truvis-landing-page.md` |
| Current section file | `src/components/sections/blog-previews-section.astro` |
| Placeholder to delete | `src/components/sections/_blog-preview-placeholder.astro` |
| i18n keys (EN) | `src/i18n/en/landing.json` `blogPreviews` block |

## Dev Agent Record

<!-- Updated by the dev agent during implementation -->
