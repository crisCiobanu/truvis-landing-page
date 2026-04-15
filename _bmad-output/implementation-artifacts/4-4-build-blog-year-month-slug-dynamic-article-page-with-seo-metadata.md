# Story 4.4: Build `/blog/[year]/[month]/[slug]` dynamic article page with SEO metadata

Status: ready-for-dev

## Story

As **a visitor who clicked through to a specific article**,
I want **a clean, readable, mobile-friendly article page with proper SEO metadata and social sharing preview**,
so that **I can read Truvis's content comfortably and the article can be shared without showing a broken preview**.

## Acceptance Criteria (BDD)

### AC1 — Dynamic route with dated URL structure

**Given** FR19 requires individual blog articles with full SEO metadata and we agreed on a dated URL structure,
**When** I create `src/pages/blog/[year]/[month]/[slug].astro` as an Astro dynamic route,
**Then**

- the route exports `getStaticPaths()` which reads `getAllBlogPosts()` from `lib/content.ts` (Story 4.1),
- it returns one path per post with `{ year, month, slug }` derived from `publishDate` (four-digit year, zero-padded two-digit month) and `slug`,
- the URL structure is exactly `/blog/YYYY/MM/slug` (e.g., `/blog/2026/04/seven-things-to-check`),
- each path passes the full `BlogPostView` as `props` plus the raw Astro entry (needed for `entry.render()`),
- if a slug does not match any post, Astro's built-in 404 handling routes to the branded `404.astro` from Story 1.5,
- changing a post's `publishDate` in front matter changes its URL on next build (accepted trade-off; canonical URL is the new path).

### AC2 — Localised routes

**Given** Story 1.6 wired Astro built-in i18n routing with `prefixDefaultLocale: false`,
**When** I create localised route copies,
**Then**

- `src/pages/fr/blog/[year]/[month]/[slug].astro` and `src/pages/de/blog/[year]/[month]/[slug].astro` exist,
- each imports a shared `_blog-article.astro` partial or uses the same `getStaticPaths()` and rendering logic as the English route (DRY via a shared helper or a thin wrapper),
- the locale prefix is included in the canonical URL for FR/DE routes.

### AC3 — Full SEO metadata in `<head>`

**Given** FR19 requires full SEO metadata including title, description, and social sharing image,
**When** I render the page's `<head>` via `BaseLayout`,
**Then**

- page title: `${post.seo.title || post.title} — Truvis Blog`,
- meta description: `post.seo.description || post.excerpt`,
- canonical URL: `post.webUrl` (the absolute URL from Story 4.1's `buildBlogEntryView`),
- `BaseLayout` receives `ogType="article"`.

### AC4 — Open Graph article tags

**Given** the page must provide rich social sharing previews,
**When** I populate OG meta tags via `BaseLayout` props and the `head` slot,
**Then**

- `og:type=article`, `og:title`, `og:description`, `og:url` are set via BaseLayout props,
- `og:image` uses `post.seo.socialImage` with fallback to `post.featuredImage.src` (absolute URL),
- the `head` slot injects article-specific OG tags not covered by BaseLayout:
  - `article:published_time` — ISO 8601 with timezone (e.g., `2026-04-10T14:30:00+02:00`),
  - `article:author` — post author name,
  - `article:section` — post category,
  - `article:tag` — one `<meta>` per keyword from `post.seo.keywords`.

### AC5 — Twitter card tags

**Given** Twitter/X requires separate card meta tags,
**When** I render the `<head>`,
**Then**

- BaseLayout already emits `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image` from its props,
- these are populated with the same values as OG (title, description, image).

### AC6 — JSON-LD placeholder

**Given** Epic 6 will add BlogPosting structured data,
**When** I compose the article page,
**Then**

- a `<!-- TODO(epic-6): inject blogPostingJsonLd() via BaseLayout head-jsonld slot -->` comment is placed in the template at the `head-jsonld` slot location.

### AC7 — Static HTML article body with prose styling

**Given** FR22 requires articles to be crawlable as static HTML,
**When** I render the article body,
**Then**

- the article body is rendered via Astro's MDX pipeline (`entry.render()` / `<Content />`),
- no client-side hydration for the article content itself,
- the body is wrapped in a prose container with Tailwind `@tailwindcss/typography` prose classes,
- prose styling matches Truvis design tokens: headings in Plus Jakarta Sans (`font-display`), body text in Inter (`font-sans`), link colour uses `--color-teal`, max-width `65ch`,
- interactive elements (share buttons from 4.5, related articles from 4.5, inline CTA from 4.6) are wrapped in `client:visible` islands — those stories add them; this story leaves slot/placeholder comments.

### AC8 — Single H1 rule

**Given** UX-DR28 requires one `<h1>` per page,
**When** the page renders,
**Then**

- the page-level `<h1>` is the article title (rendered outside the prose container or as the first element),
- MDX content top-level headings are authored as `##` (H2) — the seed articles from Story 4.1 already follow this convention,
- a code comment documents this rule for future content authors.

### AC9 — Article page layout composition

**Given** the article page must feel editorial,
**When** I compose the page,
**Then** it renders in this order:

1. `<Header>` (from BaseLayout),
2. Article hero section: category badge, `<h1>` title, author + publish date + read-time metadata row, featured image with explicit `width`/`height`,
3. Article body: prose container at `max-w-[65ch]` centered,
4. `<!-- TODO(story-4.5): RelatedArticles component -->` placeholder,
5. `<!-- TODO(story-4.6): BlogInlineCta component -->` placeholder,
6. `<Footer>` (from BaseLayout).

### AC10 — Featured image LCP optimization

**Given** NFR1 requires LCP < 2.5s,
**When** I render the featured image,
**Then**

- the featured image uses Astro's `<Image>` component from `astro:assets`,
- it is rendered with `loading="eager"` and `fetchpriority="high"` (LCP candidate),
- explicit `width` and `height` attributes are set from `post.featuredImage.width` and `post.featuredImage.height` to prevent CLS.

### AC11 — Schema.org microdata and semantic time

**Given** a11y and SEO requirements,
**When** I render the article,
**Then**

- the article is wrapped in `<article itemscope itemtype="https://schema.org/BlogPosting">`,
- the publish date uses `<time datetime="ISO8601">` with a human-readable formatted date inside,
- these microdata hints will be superseded by Epic 6's JSON-LD but do not conflict.

### AC12 — Accessibility and text expansion

**Given** WCAG 2.1 AA and NFR25 (Accessibility >= 90),
**When** I audit the article page,
**Then**

- axe-core reports zero violations on a page containing a typical seed article,
- the page renders correctly under 140% synthetic FR/DE strings (UX-DR31),
- WCAG 2.1 AA contrast is validated for all prose elements (body text, headings, links, metadata row),
- all images have `alt` text (enforced by Zod on `featuredImage`; a `TODO(epic-6): enforce alt in body images via remark plugin` comment is left for in-body images).

### AC13 — Starter file cleanup

**Given** the starter template shipped `src/pages/blog/[...slug].astro` and `src/layouts/Blog.astro` with incompatible schemas,
**When** I implement the new article route,
**Then**

- `src/pages/blog/[...slug].astro` is **deleted** (replaced by the new `[year]/[month]/[slug].astro` route),
- `src/layouts/Blog.astro` is **deleted** (its concerns are absorbed by the new page + BaseLayout + blog Tier 2 components),
- `src/layouts/Layout.astro` (if it exists and is only consumed by Blog.astro) is evaluated for deletion,
- any starter components referenced only by Blog.astro (`TableOfContents`, `ShareButtons`) are evaluated — if not used elsewhere, delete them or leave a `TODO(story-4.5)` to replace them.

### AC14 — CI Lighthouse budgets pass

**Given** CI enforces Performance >= 90, Accessibility >= 90, SEO >= 95, LCP < 2.5s, CLS < 0.1,
**When** the article page is built and audited,
**Then** all thresholds pass.

## Tasks / Subtasks

- [ ] **Task 1 — Delete starter blog files** (AC: 13)
  - [ ] T1.1 Delete `src/pages/blog/[...slug].astro`
  - [ ] T1.2 Delete `src/layouts/Blog.astro`
  - [ ] T1.3 Evaluate `src/layouts/Layout.astro` — delete if only consumed by Blog.astro (BaseLayout is the Truvis layout)
  - [ ] T1.4 Evaluate starter components (`src/components/TableOfContents.tsx`, `src/components/ShareButtons.tsx`) — delete if unused or leave TODO for Story 4.5
  - [ ] T1.5 Verify `astro build` still succeeds after deletions

- [ ] **Task 2 — Create `getStaticPaths()` helper** (AC: 1, 2)
  - [ ] T2.1 Create `src/pages/blog/[year]/[month]/[slug].astro`
  - [ ] T2.2 Import `getAllBlogPosts` from `@/lib/content` (Story 4.1 dependency)
  - [ ] T2.3 Implement `getStaticPaths()`:
    ```ts
    export async function getStaticPaths() {
      const posts = await getAllBlogPosts();
      return posts.map((post) => {
        const date = new Date(post.datePublished);
        const year = String(date.getFullYear());
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return {
          params: { year, month, slug: post.slug },
          props: { post },
        };
      });
    }
    ```
  - [ ] T2.4 Also pass the raw Astro entry in props if `entry.render()` is needed (check if `BlogPostView` carries a `render()` method or if the raw entry must be fetched separately via `getBlogPost()` returning the entry alongside the view)
  - [ ] T2.5 Create `src/pages/fr/blog/[year]/[month]/[slug].astro` — thin wrapper importing shared logic
  - [ ] T2.6 Create `src/pages/de/blog/[year]/[month]/[slug].astro` — thin wrapper importing shared logic

- [ ] **Task 3 — Build article page template** (AC: 3, 4, 5, 6, 7, 8, 9)
  - [ ] T3.1 Import `BaseLayout` and pass SEO props:
    - `title={seoTitle}` where `seoTitle = (post.seo?.title || post.title) + ' — Truvis Blog'`
    - `description={post.seo?.description || post.excerpt}`
    - `canonical={post.webUrl}`
    - `ogImage={post.seo?.socialImage || post.featuredImage.src}`
    - `ogType="article"`
  - [ ] T3.2 Use BaseLayout's `head` slot to inject article-specific OG tags:
    ```astro
    <Fragment slot="head">
      <meta property="article:published_time" content={post.datePublished} />
      <meta property="article:author" content={post.author} />
      <meta property="article:section" content={post.category} />
      {post.seo?.keywords?.map((tag) => (
        <meta property="article:tag" content={tag} />
      ))}
    </Fragment>
    ```
  - [ ] T3.3 Add `<!-- TODO(epic-6): inject blogPostingJsonLd() via BaseLayout head-jsonld slot -->` comment
  - [ ] T3.4 Build article hero section inside `<article itemscope itemtype="https://schema.org/BlogPosting">`:
    - Category badge (styled span or Badge component)
    - `<h1>` with `font-display` heading style
    - Metadata row: author, `<time datetime={post.datePublished}>{formattedDate}</time>`, read time
    - Featured image via `<Image>` from `astro:assets` with `loading="eager"` + `fetchpriority="high"` + explicit `width`/`height`
  - [ ] T3.5 Render article body in prose container: `<div class="prose prose-truvis mx-auto max-w-[65ch]"><Content /></div>`
  - [ ] T3.6 Add placeholder comments for Story 4.5 and 4.6 integration points
  - [ ] T3.7 Add `TODO(epic-6): enforce alt in body images via remark plugin` comment

- [ ] **Task 4 — Configure Tailwind prose styling for Truvis tokens** (AC: 7)
  - [ ] T4.1 `@tailwindcss/typography` is already imported in `global.css` (`@plugin '@tailwindcss/typography'`)
  - [ ] T4.2 Add custom `prose-truvis` modifier or override default prose styles in `global.css` to match Truvis tokens:
    - Headings: `font-display` (Plus Jakarta Sans), `--color-primary` (#2E4057)
    - Body: `font-sans` (Inter), `--color-primary` for text
    - Links: `--color-teal` (#3D7A8A), underline on hover
    - Blockquotes: left border in `--color-teal`, italic, `--color-muted` text
    - Code blocks: `--color-surface` background, `--color-primary` text
    - `max-width: 65ch` on the prose container
    - HR: `--color-divider`
    - Lists: `--color-primary` markers
  - [ ] T4.3 Ensure prose headings render as H2+ (MDX content uses `##` for top-level)

- [ ] **Task 5 — Build Tier 2 blog article components** (AC: 9, 11)
  - [ ] T5.1 Create `src/components/blog/blog-article-header.astro` — accepts `BlogPostView` props, renders category badge + H1 + metadata row + featured image. This keeps the page file thin per architecture rules.
  - [ ] T5.2 Create `src/components/blog/blog-article-body.astro` — prose wrapper that renders a `<slot />` inside the styled prose container. Provides the `<article>` semantic wrapper with Schema.org microdata.
  - [ ] T5.3 Format date using `Intl.DateTimeFormat` with locale awareness (read from `Astro.currentLocale`)
  - [ ] T5.4 All user-facing strings (e.g., "min read", "By", category labels) sourced from `t()` helper via `@/lib/i18n`

- [ ] **Task 6 — Add i18n strings for blog article UI** (AC: 7, 12)
  - [ ] T6.1 Add keys to `src/i18n/en/blog.json`: `blog.article.byAuthor`, `blog.article.minRead`, `blog.article.publishedOn`, category display names
  - [ ] T6.2 Mirror keys in `src/i18n/fr/blog.json` with placeholder English values
  - [ ] T6.3 Mirror keys in `src/i18n/de/blog.json` with placeholder English values

- [ ] **Task 7 — Accessibility audit** (AC: 12, 14)
  - [ ] T7.1 Verify single `<h1>` per page
  - [ ] T7.2 Verify `<time datetime>` on publish date
  - [ ] T7.3 Verify all images have `alt` text
  - [ ] T7.4 Verify WCAG 2.1 AA contrast on all prose elements
  - [ ] T7.5 Run axe-core on a rendered seed article page
  - [ ] T7.6 Test with 140% text expansion strings (UX-DR31)
  - [ ] T7.7 Verify CI Lighthouse budgets pass

## Dev Notes

### Implementation approach

**`getStaticPaths()` pattern**: The key insight is that `getAllBlogPosts()` returns `BlogPostView[]` which includes `datePublished` (ISO 8601 string) and `slug`. Parse the date to extract `year` and zero-padded `month`. The raw Astro entry is also needed for `entry.render()` — Story 4.1's `lib/content.ts` should either return the entry alongside the view, or provide a `getBlogPostWithEntry(slug)` helper. If not, use `getCollection('blog')` inside `lib/content.ts` and expose a render-ready helper. **Never call `getCollection()` directly in the page file.**

**DRY locale routes**: Astro's file-based i18n routing requires separate files at `src/pages/fr/blog/...` and `src/pages/de/blog/...`. To avoid triplicating the template:

1. Extract the article rendering logic into a shared Astro component (e.g., `src/components/blog/blog-article-page.astro`) that accepts `post` + `entry` as props.
2. Each locale's `[slug].astro` file is a thin shell: exports `getStaticPaths()` and renders the shared component.
3. Alternatively, the `getStaticPaths()` logic can live in a shared `.ts` helper in `src/lib/content.ts`.

**Featured image handling**: The `BlogPostView.featuredImage` is an object `{ src, alt, width, height }`. The `src` may be a path to an image in `src/assets/blog/` or a placeholder. Use Astro's `<Image>` component which accepts either an imported image or a string URL. If `src` is a local asset path, dynamic import may be needed:

```astro
---
import { Image } from 'astro:assets';
// For local assets, Story 4.1 should provide the imported image object
// For now, assume post.featuredImage.src is usable by <Image>
---
<Image
  src={post.featuredImage.src}
  alt={post.featuredImage.alt}
  width={post.featuredImage.width}
  height={post.featuredImage.height}
  loading="eager"
  fetchpriority="high"
  class="w-full rounded-lg object-cover"
/>
```

**Prose customisation with Tailwind v4**: Since `global.css` already has `@plugin '@tailwindcss/typography'`, add prose token overrides. In Tailwind v4 CSS-first config, prose customisation can be done via CSS custom properties or by overriding the prose classes directly in `global.css`:

```css
/* Truvis prose overrides */
.prose {
  --tw-prose-body: var(--color-primary);
  --tw-prose-headings: var(--color-primary);
  --tw-prose-links: var(--color-teal);
  --tw-prose-bold: var(--color-primary);
  --tw-prose-quotes: var(--color-muted);
  --tw-prose-quote-borders: var(--color-teal);
  --tw-prose-code: var(--color-primary);
  --tw-prose-pre-bg: var(--color-surface);
  --tw-prose-hr: var(--color-divider);
  --tw-prose-bullets: var(--color-teal);
  --tw-prose-counters: var(--color-teal);
}

.prose :where(h1, h2, h3, h4):not(:where([class~="not-prose"] *)) {
  font-family: var(--font-display);
}
```

**Starter cleanup**: The existing `src/pages/blog/[...slug].astro` uses `getCollection('blog')` directly (violates AR25) and references `src/layouts/Blog.astro` which imports a `Layout.astro` (not `BaseLayout.astro`). Both must be deleted. Check that `src/layouts/Layout.astro` is not used by other pages — if `index.astro` or other pages still import it, leave it; otherwise delete.

**Date formatting**: Use `Intl.DateTimeFormat` with the current locale for human-readable dates. The ISO 8601 string goes in the `<time datetime>` attribute. Example:

```ts
function formatDate(isoDate: string, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate));
}
```

If `lib/date.ts` exists (architecture references it), use or create the helper there.

### Architecture compliance

- **Three-tier hierarchy**: Page file (`src/pages/blog/[year]/[month]/[slug].astro`) is Tier 3 — a thin shell. `blog-article-header.astro` and `blog-article-body.astro` are Tier 2 in `src/components/blog/`. They consume Tier 1 (`ui/`) primitives only. No cross-Tier-2 imports.
- **Content access (AR25)**: `getAllBlogPosts()` from `lib/content.ts` is the sole data source. No `getCollection('blog')` in the page file.
- **Hydration policy (AR27)**: Article body is zero-JS static HTML. Future islands (share buttons, related articles) use `client:visible`. No `client:load` on this page.
- **Env vars**: `post.webUrl` is computed by `buildBlogEntryView()` in `lib/content.ts` using `PUBLIC_SITE_URL` via `lib/env.ts`. The page file never reads env vars directly.
- **i18n**: All user-facing strings via `t()` from `lib/i18n.ts`. Category display names, date labels, metadata labels are all i18n keys.
- **Single H1**: Enforced by rendering the `<h1>` in the article header component; MDX content starts at H2.
- **Image optimization**: Astro `<Image>` component for featured image with eager loading (LCP). In-body images get `loading="lazy"` by default from the MDX pipeline.

### Dependencies

- **Story 4.1** (BLOCKING): Provides `lib/content.ts` with `getAllBlogPosts()`, `BlogPostView` type, `buildBlogEntryView()`, seed articles, and the blog Zod schema. This story cannot be implemented until 4.1 is done.
- **Story 1.4** (DONE): `BaseLayout.astro` with `title`, `description`, `canonical`, `ogImage`, `ogType` props and `head`, `head-jsonld` slots.
- **Story 1.5** (DONE): Branded `404.astro` for missing slugs.
- **Story 1.6** (DONE): Astro i18n routing with `prefixDefaultLocale: false`.
- **Story 4.5** (FUTURE): Adds related-articles strip and share buttons — this story leaves placeholder comments.
- **Story 4.6** (FUTURE): Adds inline blog CTA — this story leaves a placeholder comment.
- **Epic 6** (FUTURE): Adds `blogPostingJsonLd()` via the `head-jsonld` slot and image alt enforcement via remark plugin.

### Existing patterns to follow

- **BaseLayout usage**: See `src/pages/index.astro` for how BaseLayout is consumed with SEO props and head slots.
- **`<Image>` usage**: Check existing components (e.g., hero section) for the Astro `<Image>` import and usage pattern.
- **i18n pattern**: See `src/lib/i18n.ts` for the `t(key, locale)` helper.
- **Badge component**: `src/components/ui/badge.tsx` — use for category badge styling.

### Project Structure Notes

New files:

```
src/pages/blog/[year]/[month]/[slug].astro        <- Dynamic article route (EN)
src/pages/fr/blog/[year]/[month]/[slug].astro      <- Thin locale wrapper (FR)
src/pages/de/blog/[year]/[month]/[slug].astro      <- Thin locale wrapper (DE)
src/components/blog/blog-article-header.astro      <- Tier 2: article hero (badge, H1, meta, image)
src/components/blog/blog-article-body.astro        <- Tier 2: prose wrapper with Schema.org microdata
```

Modified files:

```
src/styles/global.css                               <- Truvis prose token overrides
src/i18n/en/blog.json                               <- Article UI strings
src/i18n/fr/blog.json                               <- Placeholder mirrors
src/i18n/de/blog.json                               <- Placeholder mirrors
```

Deleted files:

```
src/pages/blog/[...slug].astro                      <- Starter catch-all route (replaced)
src/layouts/Blog.astro                              <- Starter blog layout (replaced by BaseLayout + Tier 2 components)
src/layouts/Layout.astro                            <- Starter base layout (evaluate — delete if unused after Blog.astro removal)
src/components/TableOfContents.tsx                  <- Starter component (evaluate — delete if unused)
src/components/ShareButtons.tsx                     <- Starter component (evaluate — Story 4.5 builds the Truvis version)
```

### References

- [Source: epics-truvis-landing-page.md#Story 4.4 — Full acceptance criteria]
- [Source: epics-truvis-landing-page.md#Story 4.1 — BlogPostView type, lib/content.ts helpers, seed articles]
- [Source: architecture-truvis-landing-page.md#AR6 — Astro Content Collections]
- [Source: architecture-truvis-landing-page.md#AR8 — Blog content API contract]
- [Source: architecture-truvis-landing-page.md#AR9 — Additive-only schema at /v1/]
- [Source: architecture-truvis-landing-page.md#AR23 — Three-tier component hierarchy]
- [Source: architecture-truvis-landing-page.md#AR25 — Content access only via lib/content.ts]
- [Source: architecture-truvis-landing-page.md#AR27 — Hydration policy]
- [Source: ux-design-specification#UX-DR28 — Single H1 per page]
- [Source: ux-design-specification#UX-DR30 — WCAG 2.1 AA contrast]
- [Source: ux-design-specification#UX-DR31 — 140% text expansion]
- [Source: prd-truvis-landing-page.md#FR19 — Individual blog articles with SEO]
- [Source: prd-truvis-landing-page.md#FR22 — Static HTML crawlable articles]
- [Source: prd-truvis-landing-page.md#FR42 — Canonical URLs]
- [Source: prd-truvis-landing-page.md#FR44 — Image alt + lazy loading]
- [Source: prd-truvis-landing-page.md#NFR1 — LCP < 2.5s]
- [Source: prd-truvis-landing-page.md#NFR3 — CLS < 0.1]
- [Source: prd-truvis-landing-page.md#NFR25 — Accessibility >= 90]
- [Source: src/layouts/BaseLayout.astro — Props interface and slot names]
- [Source: src/styles/global.css — @tailwindcss/typography already imported, font tokens]
- [Source: src/pages/blog/[...slug].astro — Starter file to be deleted]
- [Source: src/layouts/Blog.astro — Starter layout to be deleted]

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
