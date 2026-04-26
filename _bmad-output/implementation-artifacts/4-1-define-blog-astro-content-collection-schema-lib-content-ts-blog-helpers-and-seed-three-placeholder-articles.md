# Story 4.1: Define `blog` Astro Content Collection schema, `lib/content.ts` blog helpers and seed three placeholder articles

Status: done

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **Cristian**,
I want **a typed, schema-validated `blog` content collection with a small access-boundary helper module and three placeholder articles**,
so that **every downstream blog story (index page, article page, API endpoints, mobile contract) reads from one trusted source and the Zod schema fails the build if any article is missing a required field**.

## Context & scope

This is the **first story of Epic 4** ("Blog & Cross-Platform Content API"). Epic 2 built the full landing page conversion flow including a `BlogPreviewsSection` (Story 2.7) with inline placeholder cards. This story creates the foundational data layer that every subsequent Epic 4 story depends on: the Zod-typed `blog` Content Collection schema, the `lib/content.ts` helper module (the single gateway for all content queries), the `BlogPostView` type (the cross-platform contract type), three seed MDX articles, and the initial `CONTRACT.md` at the repo root.

**Existing codebase state:**
- `src/content/config.ts` exists with a **starter-template blog schema** (title, description, date, draft, image, author, tags, category enum ['tutorial','news','guide','review','article'], readingTime, featured). This must be **replaced** with the Truvis schema. The starter's `BlogSchema` type export must be removed.
- `src/lib/` has `env.ts`, `i18n.ts`, `reading-time.ts`, `utils.ts`, `stores/`, `middleware/`. No `content.ts` exists yet.
- `src/content/` has only `config.ts`. No `blog/` folder yet.
- `src/lib/types/` does not exist yet — create it.
- `.env.example` already has `PUBLIC_SITE_URL=` defined.
- `src/layouts/Blog.astro` exists from the starter template and references `entry.data.title`, `entry.data.description`, `entry.data.image`, `entry.data.category` — this layout will be rebuilt in later Epic 4 stories. Do NOT modify it in this story.

Scope boundaries:
- **In scope:** Replace `src/content/config.ts` blog schema with Truvis schema, create `src/lib/types/blog.ts` (BlogPostView type + BlogCategory type), create `src/lib/content.ts` (blog helper module), create three seed MDX files under `src/content/blog/`, create placeholder blog images under `src/assets/blog/`, create `CONTRACT.md` at repo root, create `src/lib/content.test.ts` (unit tests for the pure `buildBlogEntryView` function), create `docs/content-voice-review.md` (brief voice audit note for future authors).
- **Out of scope:** Keystatic config (Epic 5). The other four content collections — `faq`, `testimonials`, `stats`, `siteContent` (Epic 5 Story 5.1). Blog pages, blog index, article layout (Stories 4.3–4.5). BlogPreviewCard component (Story 4.2). API endpoints (Story 4.8). Any modification to `src/layouts/Blog.astro`, `blog-previews-section.astro`, or `_blog-preview-placeholder.astro` — those are Story 4.7's scope. ESLint rule for `getCollection` boundary enforcement — document it as a code-review checklist item instead.

## Acceptance Criteria

### AC1 — Replace starter blog schema with Truvis Zod schema in `src/content/config.ts` (AR6, FR18–FR26)

**Given** the starter template left a basic blog schema in `src/content/config.ts` with fields that do not match the Truvis architecture,
**When** I replace it with the Truvis schema,
**Then**
- `src/content/config.ts` declares exactly one collection named `blog` with `type: 'content'`,
- the other four collections (`faq`, `testimonials`, `stats`, `siteContent`) are **not** declared — they are Epic 5's scope,
- the `BlogSchema` type export from the starter is removed,
- the Zod schema enforces these fields:
  ```typescript
  const blogSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
    title: z.string().max(70, 'title must be ≤70 chars for SEO'),
    excerpt: z.string().max(200, 'excerpt must be ≤200 chars'),
    category: z.enum(['buying-guide', 'inspection-tips', 'case-study', 'deep-dive']),
    publishDate: z.date(),
    author: z.string(),
    readTime: z.string(),  // e.g. "6 min"
    featured: z.boolean().default(false),
    featuredImage: z.object({
      src: z.string(),
      alt: z.string().min(1, 'alt text is required'),
      width: z.number(),
      height: z.number(),
    }),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      socialImage: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }),
    relatedSlugs: z.array(z.string()).default([]),
  });
  ```
- `webUrl` is **not** in the schema — it is computed at build time in `buildBlogEntryView()`,
- the file exports the inferred type: `export type BlogEntry = z.infer<typeof blogSchema>;` for internal use only (consumers use `BlogPostView` from `lib/types/blog.ts`),
- `astro build` succeeds with the new schema.

### AC2 — Create `BlogPostView` type and `BlogCategory` type in `src/lib/types/blog.ts` (AR9, NFR31)

**Given** the architecture requires a single cross-platform type consumed by every blog surface,
**When** I create the types file,
**Then**
- `src/lib/types/blog.ts` is created (create the `src/lib/types/` directory),
- it exports `BlogCategory` as a union type matching the schema enum: `'buying-guide' | 'inspection-tips' | 'case-study' | 'deep-dive'`,
- it exports `BlogPostView` as the public-shape type matching the documented API contract:
  ```typescript
  export interface BlogPostView {
    slug: string;
    title: string;
    excerpt: string;
    category: BlogCategory;
    publishedAt: string;   // ISO 8601 with timezone, e.g. "2026-04-10T14:30:00+02:00"
    author: string;
    readTime: string;
    featured: boolean;
    featuredImage: {
      src: string;         // absolute URL
      alt: string;
      width: number;
      height: number;
    };
    webUrl: string;        // absolute URL: ${PUBLIC_SITE_URL}/blog/${year}/${month}/${slug}
    seo: {
      title?: string;
      description?: string;
      socialImage?: string;
      keywords?: string[];
    };
    relatedSlugs: string[];
  }
  ```
- field names are **camelCase** throughout,
- dates are ISO 8601 strings with timezone (not Date objects) — the API contract requires strings,
- URLs are absolute (never relative),
- `BlogPostView` is the **only** type that downstream consumers import — they never import the raw Zod-inferred type from `config.ts`.

### AC3 — Create `src/lib/content.ts` with blog helpers and `buildBlogEntryView()` (AR25, FR24)

**Given** the architecture mandates all Content Collection access goes through `lib/content.ts`,
**When** I create the module,
**Then**
- `src/lib/content.ts` is created as a new file,
- it imports `getCollection` from `'astro:content'` — this is the **only** file in the repo allowed to do so,
- it imports `getOptional` from `@/lib/env` to read `PUBLIC_SITE_URL` (never `import.meta.env` directly),
- it exports `buildBlogEntryView(entry)` as a **pure function** that transforms a raw Astro `CollectionEntry<'blog'>` into `BlogPostView`:
  - `slug` → from `entry.data.slug` (front-matter slug, not filename),
  - `title` → `entry.data.title`,
  - `excerpt` → `entry.data.excerpt`,
  - `category` → `entry.data.category`,
  - `publishedAt` → `entry.data.publishDate` converted to ISO 8601 string with timezone using `.toISOString()` (UTC `Z` suffix is acceptable; the epics mention `+02:00` as an example but UTC is the canonical stored timezone per architecture § "Date / Time Handling"),
  - `author` → `entry.data.author`,
  - `readTime` → `entry.data.readTime`,
  - `featured` → `entry.data.featured`,
  - `featuredImage` → `{ src: absoluteUrl(entry.data.featuredImage.src), alt: entry.data.featuredImage.alt, width: entry.data.featuredImage.width, height: entry.data.featuredImage.height }` — if `src` starts with `/`, prepend `PUBLIC_SITE_URL` to make it absolute,
  - `webUrl` → computed as `${siteUrl}/blog/${year}/${month}/${slug}` where `year` and `month` are derived from `publishDate` (4-digit year, 2-digit zero-padded month),
  - `seo` → passthrough of `entry.data.seo` (omit undefined fields),
  - `relatedSlugs` → `entry.data.relatedSlugs`,
- it exports these typed async helpers:
  ```typescript
  export async function getAllBlogPosts(): Promise<BlogPostView[]>
  // Sorted by publishDate descending. Filters out draft entries if a draft field is ever added.

  export async function getBlogPost(slug: string): Promise<BlogPostView | null>
  // Returns null if not found.

  export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPostView[]>
  // Sorted by publishDate descending.

  export async function getFeaturedBlogPosts(limit?: number): Promise<BlogPostView[]>
  // Filters featured === true. Sorted by publishDate descending. Default limit: 10.

  export async function getRelatedBlogPosts(slug: string, limit?: number): Promise<BlogPostView[]>
  // Reads relatedSlugs from the target post. Falls back to same-category posts
  // (excluding the current post) if relatedSlugs is empty. Default limit: 3.
  ```
- every helper calls `getCollection('blog')` internally, applies `buildBlogEntryView()` to each entry, and returns `BlogPostView[]` or `BlogPostView | null`,
- **no raw `getCollection('blog')` call leaks out** — the return type is always `BlogPostView`,
- the file has a header comment documenting: story reference (4.1), architecture reference (AR25), and the rule that no other file may call `getCollection('blog')`.

### AC4 — Three seed MDX files under `src/content/blog/` (FR18, NFR40)

**Given** three seed articles are needed to unblock all downstream Epic 4 stories,
**When** I create the seed files,
**Then**
- three MDX files exist under `src/content/blog/` with filenames matching `YYYY-MM-DD-slug.mdx`:
  1. `2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel.mdx` — category: `buying-guide`
  2. `2026-03-22-the-900-euro-problem-behind-a-7200-invoice.mdx` — category: `case-study`
  3. `2026-04-01-why-a-pre-purchase-inspection-pays-for-itself.mdx` — category: `deep-dive`
- every file has **all** required front-matter fields populated with placeholder-quality but render-ready content,
- front matter includes `TODO(epic-8-content)` as a comment or metadata marker flagging the article for rewrite by the launch-readiness pass,
- `relatedSlugs` on each article references the other two slugs (forming a complete cross-reference triangle),
- `featured: true` on at least one article (the buying-guide) so `getFeaturedBlogPosts()` returns results,
- `publishDate` uses a `Date` value parseable by Zod's `z.date()` (YAML date format: `2026-03-15`),
- `featuredImage` references a placeholder image in `src/assets/blog/` (see AC5),
- each article body is **600–1200 words** of MDX with at least:
  - one `## H2` heading,
  - one `### H3` heading,
  - one bulleted list (actionable checklist items),
  - one block quote (an "Inspector's note" or similar voice device),
  - one inline image reference using Astro's MDX image syntax or a standard Markdown `![alt](path)`,
- the opening paragraph of each article has a **specific, concrete hook** — numbers, named components, named failure modes (NOT "Buying a used car can be stressful"),
- each article provides at least one **actionable checklist or specific guidance item** the reader can apply,
- voice: **70/30 Inspector/Ally** — authoritative, specific, technically grounded, with approachable asides.

### AC5 — Placeholder blog images in `src/assets/blog/` (NFR3)

**Given** each seed article's `featuredImage` must reference a real file,
**When** I create placeholder images,
**Then**
- `src/assets/blog/` directory is created,
- at least one placeholder image exists (SVG is preferred for zero build-time image processing overhead; alternatively a small WebP),
- the image filename is descriptive (e.g., `placeholder-buying-guide.svg`),
- the `featuredImage` fields in the seed articles reference this image with correct `width` and `height` values matching the actual image dimensions (1200x630 is the recommended OG/social size),
- if using a shared placeholder for all three articles, that is acceptable at this stage — real images land in Epic 8.

### AC6 — `CONTRACT.md` at repo root (AR8, NFR31)

**Given** the architecture mandates a developer-facing contract document for mobile app consumers,
**When** I create the initial `CONTRACT.md`,
**Then**
- `CONTRACT.md` is created at the repo root (not in `docs/`, not in `_bmad-output/`),
- the document contains these sections:
  1. **Introduction** — who this document is for (mobile app developers), what guarantees we provide (schema stability, additive-only changes),
  2. **Base URL & Versioning** — `${PUBLIC_SITE_URL}/api/v1/blog/` as the base; versioning policy: "additive-only at `/v1/`; field renames or removals require a new `/v2/` endpoint with `/v1/` kept alive for at least one mobile app release cycle",
  3. **`BlogPostView` Type** — the full TypeScript interface block from AC2,
  4. **Field Table** — every field listed with: name, type, required/optional, example value, description,
  5. **Endpoints** — placeholder section: "Endpoints ship in Story 4.8. Curl examples will be added then." with placeholder curl stubs for `GET /api/v1/blog/posts.json` and `GET /api/v1/blog/posts/[slug].json`,
  6. **CDN Cache Headers** — `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`,
  7. **Rate Limits** — `100 req/min per IP` (Cloudflare WAF, NFR18),
  8. **How to Report Breaking Changes** — points to the GitHub issue tracker with a label `api-contract`,
- the document explicitly lists the `BlogPostView` shape as emitted by the API: camelCase, ISO 8601 with timezone, absolute URLs, image objects with `{src, alt, width, height}`.

### AC7 — Unit tests for `buildBlogEntryView()` in `src/lib/content.test.ts` (AR25)

**Given** the `buildBlogEntryView()` function is the single type-transformation boundary between raw Astro entries and the public API shape,
**When** I write unit tests,
**Then**
- `src/lib/content.test.ts` is created (co-located with source per architecture § test placement),
- tests use Vitest (`import { describe, it, expect } from 'vitest'`),
- test cases cover:
  - correct `webUrl` computation from `publishDate` and `slug` (year/month extraction, zero-padding),
  - `publishedAt` is a valid ISO 8601 string,
  - `featuredImage.src` is an absolute URL when the input `src` starts with `/`,
  - `featuredImage.src` passes through unchanged when already absolute,
  - all required fields are present in the output,
  - `seo` optional fields are omitted (not `null`) when not provided,
- tests mock `PUBLIC_SITE_URL` via `process.env` assignment in `beforeEach`,
- tests do NOT call `getCollection()` — they test the pure `buildBlogEntryView()` function with a synthetic entry object,
- `npx vitest run` passes.

### AC8 — Voice audit note in `docs/content-voice-review.md` (NFR40)

**Given** NFR40 requires consistent 70/30 Inspector/Ally voice in blog content,
**When** I create the voice audit note,
**Then**
- `docs/content-voice-review.md` is created (create `docs/` directory if needed),
- it is a brief (1-page) reference for future content authors covering:
  - the 70/30 Inspector/Ally voice ratio (70% authoritative technical inspector, 30% friendly ally),
  - what makes a good opening hook (specific numbers, named components, named failure modes),
  - what to avoid ("Buying a used car can be stressful" — generic, passive, no specificity),
  - the requirement for at least one actionable checklist per article,
- it references NFR40 and the three seed articles as examples.

### AC9 — Build succeeds with Zod validation (AR6)

**Given** Zod schema validation runs at build time and fails the build if any required field is missing,
**When** I run `astro build`,
**Then**
- the build succeeds with zero content validation errors,
- if any seed article is missing a required field, the build fails with a Zod error message — this validates the schema itself,
- `npx astro check` passes with zero errors.

## Tasks / Subtasks

### Task 1: Replace starter blog schema in `src/content/config.ts` [AC1, AC9]

- [x] 1.1. Open `src/content/config.ts` and remove the entire starter `BlogSchema` definition and its type export.
- [x] 1.2. Write the Truvis `blogSchema` Zod object with all fields from AC1.
- [x] 1.3. Declare the `blog` collection using `defineCollection({ type: 'content', schema: blogSchema })`.
- [x] 1.4. Export the collection in the `collections` object.
- [x] 1.5. Export `type BlogEntry = z.infer<typeof blogSchema>` for internal use by `lib/content.ts`.
- [x] 1.6. Do NOT add any other collections — leave the `collections` export with only `blog`.

### Task 2: Create `BlogPostView` and `BlogCategory` types [AC2]

- [x] 2.1. Create directory `src/lib/types/` if it does not exist.
- [x] 2.2. Create `src/lib/types/blog.ts` with the `BlogCategory` type and `BlogPostView` interface exactly as specified in AC2.
- [x] 2.3. Ensure all field names are camelCase, dates are string type (not Date), URLs are string type.

### Task 3: Create `src/lib/content.ts` with blog helpers [AC3]

- [x] 3.1. Create `src/lib/content.ts` with a file header comment referencing Story 4.1 and AR25.
- [x] 3.2. Import `getCollection` from `'astro:content'` and `type CollectionEntry` from `'astro:content'`.
- [x] 3.3. Import `getOptional` from `@/lib/env` for reading `PUBLIC_SITE_URL`.
- [x] 3.4. Import `BlogPostView` and `BlogCategory` from `@/lib/types/blog`.
- [x] 3.5. Implement `buildBlogEntryView(entry: CollectionEntry<'blog'>): BlogPostView`.
- [x] 3.6. Implement `getAllBlogPosts()`.
- [x] 3.7. Implement `getBlogPost(slug)`.
- [x] 3.8. Implement `getBlogPostsByCategory(category)`.
- [x] 3.9. Implement `getFeaturedBlogPosts(limit = 10)`.
- [x] 3.10. Implement `getRelatedBlogPosts(slug, limit = 3)`.
- [x] 3.11. Export the `buildBlogEntryView` function.

### Task 4: Create placeholder blog images [AC5]

- [x] 4.1. Create `src/assets/blog/` directory.
- [x] 4.2. Create at least one placeholder SVG image (1200x630 dimensions).
- [x] 4.3. Optionally create distinct placeholder SVGs per article category.

### Task 5: Create three seed MDX articles [AC4]

- [x] 5.1. Create `src/content/blog/` directory.
- [x] 5.2. Write `2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel.mdx`.
- [x] 5.3. Write `2026-03-22-the-900-euro-problem-behind-a-7200-invoice.mdx`.
- [x] 5.4. Write `2026-04-01-why-a-pre-purchase-inspection-pays-for-itself.mdx`.
- [x] 5.5. Verify each article's `slug` field matches the kebab-case portion of the filename.
- [x] 5.6. Verify `publishDate` uses YAML date format compatible with Zod's `z.date()`.

### Task 6: Create `CONTRACT.md` [AC6]

- [x] 6.1. CONTRACT.md already existed at repo root — expanded with full Blog API contract sections.
- [x] 6.2. Write all sections specified in AC6: introduction, base URL/versioning, BlogPostView type, field table, placeholder endpoints, cache headers, rate limits, breaking change reporting.
- [x] 6.3. Mark the endpoints section clearly with "Endpoints ship in Story 4.8".

### Task 7: Write unit tests [AC7]

- [x] 7.1. Create `src/lib/content.test.ts`.
- [x] 7.2. Write tests for `buildBlogEntryView()` using synthetic entry objects.
- [x] 7.3. Mock `PUBLIC_SITE_URL` via `process.env.PUBLIC_SITE_URL = 'https://truvis.app'` in `beforeEach`.
- [x] 7.4. Test cases: webUrl computation, ISO 8601 publishedAt, absolute image URL, field presence, seo field omission.
- [x] 7.5. Run `npx vitest run` and verify all tests pass (12 tests, all green).

### Task 8: Create voice audit note [AC8]

- [x] 8.1. Create `docs/` directory if needed.
- [x] 8.2. Create `docs/content-voice-review.md` with the brief voice reference for authors.

### Task 9: Build verification [AC9]

- [x] 9.1. Run `npx astro check` — zero errors.
- [x] 9.2. Run `npx astro build` — zero errors, Zod validates all three seed articles.
- [x] 9.3. Build verified — all three articles rendered successfully at `/blog/*`.

### Review Findings

- [x] [Review][Decision] **`slug` field is `.optional()` — spec AC1 requires it to be required** — Accepted: Astro 5 strips `slug` from `entry.data`, making `.optional()` necessary. `buildBlogEntryView` has a robust fallback via `entry.id`. Spec deviation documented. [src/content/config.ts:13-16]
- [x] [Review][Patch] **`featuredImage.src` has no `.min(1)` — empty string passes validation** — Fixed: added `.min(1, 'src is required')`. [src/content/config.ts:30]
- [x] [Review][Patch] **`featuredImage.width`/`height` accept zero or negative values** — Fixed: added `.int().positive()`. [src/content/config.ts:32-33]
- [x] [Review][Defer] **`getCollection()` called directly in `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro`** — violates Content Access Boundary (AR25, CLAUDE.md). Pre-existing starter template pages; will be rebuilt in Stories 4.3–4.5. [src/pages/blog/index.astro:3, src/pages/blog/[...slug].astro:2] — deferred, pre-existing
- [x] [Review][Defer] **`BlogSearch.tsx` uses raw `CollectionEntry` instead of `BlogPostView`** — imports `CollectionEntry` from `astro:content` and operates on `entry.data.*` fields directly. Should consume `BlogPostView[]` per the Content Access Boundary. Pre-existing component; will be refactored when blog pages are rebuilt. [src/components/BlogSearch.tsx:6-8] — deferred, pre-existing
- [x] [Review][Defer] **`BlogSearch.tsx` lives outside `src/components/islands/` but uses `client:load`** — per CLAUDE.md, `client:load` components must live in `islands/`. Pre-existing component location; not in this story's scope. [src/components/BlogSearch.tsx, src/pages/blog/index.astro:63] — deferred, pre-existing
- [x] [Review][Defer] **`Blog.astro` imports `CollectionEntry` from `astro:content`** — should use `BlogPostView` from `lib/types/blog.ts`. Pre-existing layout; will be rebuilt in Stories 4.3–4.5. [src/layouts/Blog.astro:7] — deferred, pre-existing
- [x] [Review][Defer] **`webUrl` pattern `/blog/year/month/slug` doesn't match current Astro routes** — current `[...slug].astro` generates flat routes like `/blog/2026-03-15-slug`. The `webUrl` format is the intended URL structure; blog pages will be built to match in Stories 4.3–4.5. [src/lib/content.ts:63] — deferred, known design gap

## Dev Notes

### Zod date parsing in Astro Content Collections

Astro Content Collections parse YAML front-matter dates automatically. A YAML value like `publishDate: 2026-03-15` is parsed as a JavaScript `Date` object by the YAML parser before Zod validation. `z.date()` validates that it IS a Date object. Do NOT use `z.string()` with a transform — use `z.date()` directly.

### `getCollection` in tests

Astro's `getCollection` is only available at build time in the Astro pipeline. Unit tests for `buildBlogEntryView()` should create synthetic entry objects that mimic the shape of `CollectionEntry<'blog'>` without actually calling `getCollection`. The shape to mock:

```typescript
// Minimal mock shape for testing buildBlogEntryView
const mockEntry = {
  id: '2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel.mdx',
  slug: '2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel',
  body: '... markdown content ...',
  collection: 'blog' as const,
  data: {
    slug: '7-things-to-check-before-buying-a-10-year-old-diesel',
    title: 'Test Article',
    excerpt: 'Test excerpt',
    category: 'buying-guide' as const,
    publishDate: new Date('2026-03-15T00:00:00Z'),
    author: 'Cristian Ciobanu',
    readTime: '6 min',
    featured: true,
    featuredImage: { src: '/assets/blog/placeholder.svg', alt: 'Test image', width: 1200, height: 630 },
    seo: {},
    relatedSlugs: [],
  },
  render: async () => ({ Content: () => null, headings: [], remarkPluginFrontmatter: {} }),
};
```

### webUrl computation

The dated URL structure is: `${PUBLIC_SITE_URL}/blog/${YYYY}/${MM}/${slug}`. Extract year and month from `publishDate`:

```typescript
const date = entry.data.publishDate;
const year = date.getUTCFullYear().toString();
const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
const webUrl = `${siteUrl}/blog/${year}/${month}/${entry.data.slug}`;
```

Use UTC methods to avoid timezone-dependent month/year shifts.

### PUBLIC_SITE_URL access

Read via `getOptional('PUBLIC_SITE_URL', 'http://localhost:4321')` from `@/lib/env`. The fallback ensures `buildBlogEntryView` works in dev without requiring the env var to be set. Do NOT use `getRequired` — `PUBLIC_SITE_URL` may not be set in local dev.

### MDX front matter format

Astro Content Collections MDX files use YAML front matter delimited by `---`:

```mdx
---
slug: "my-article-slug"
title: "My Article Title"
excerpt: "Short description"
category: "buying-guide"
publishDate: 2026-03-15
author: "Cristian Ciobanu"
readTime: "6 min"
featured: true
featuredImage:
  src: "/assets/blog/placeholder-buying-guide.svg"
  alt: "A mechanic inspecting a diesel engine bay"
  width: 1200
  height: 630
seo:
  title: "7 Things to Check Before Buying a 10-Year-Old Diesel | Truvis"
  description: "A pre-purchase checklist for older diesel vehicles"
  keywords:
    - "diesel inspection"
    - "used car checklist"
relatedSlugs:
  - "the-900-euro-problem-behind-a-7200-invoice"
  - "why-a-pre-purchase-inspection-pays-for-itself"
# TODO(epic-8-content): Replace placeholder content with launch-ready copy
---

# Article content starts here...
```

Note: `publishDate: 2026-03-15` (no quotes) is parsed as a Date by YAML. Do NOT quote the date.

### Existing `reading-time.ts` utility

The codebase already has `src/lib/reading-time.ts` with `calculateReadingTime(content)` and `formatReadingTime(content)`. The seed articles use a **front-matter `readTime` string** (e.g., `"6 min"`) rather than computing it dynamically. This is intentional — the architecture specifies `readTime` as a front-matter field for editorial control. Do NOT wire up the `reading-time.ts` utility to auto-compute — that can be done in a later story if desired.

### Image references in MDX body

For inline image references within the MDX body, use standard Markdown image syntax pointing to the assets folder:

```markdown
![Alt text describing the image](/assets/blog/placeholder.svg)
```

Or use Astro's `<Image>` component if MDX component imports are configured. For V1 placeholder content, standard Markdown image syntax is sufficient.

### Anti-patterns to avoid

- **Do NOT** call `getCollection()` outside of `src/lib/content.ts` — this is the #1 architectural rule for content access.
- **Do NOT** use `import.meta.env` or `process.env` directly — use `getOptional`/`getRequired` from `@/lib/env`.
- **Do NOT** create `keystatic.config.ts` — that is Epic 5.
- **Do NOT** create `faq`, `testimonials`, `stats`, or `siteContent` collections — those are Epic 5.
- **Do NOT** modify `src/layouts/Blog.astro`, `blog-previews-section.astro`, or `_blog-preview-placeholder.astro`.
- **Do NOT** return raw Astro `CollectionEntry` objects from helper functions — always transform to `BlogPostView`.
- **Do NOT** use `null` for optional seo fields — omit them entirely (use object spread or conditional inclusion).
- **Do NOT** hardcode `PUBLIC_SITE_URL` — always read from env.
- **Do NOT** store `webUrl` in front matter — it is computed.

### Project Structure Notes

Files created/modified by this story:

| File | Action | Tier |
|---|---|---|
| `src/content/config.ts` | Replace (existing) | Content schema |
| `src/lib/types/blog.ts` | Create (new directory + file) | Types |
| `src/lib/content.ts` | Create | Lib utility |
| `src/lib/content.test.ts` | Create | Tests |
| `src/content/blog/2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel.mdx` | Create | Content |
| `src/content/blog/2026-03-22-the-900-euro-problem-behind-a-7200-invoice.mdx` | Create | Content |
| `src/content/blog/2026-04-01-why-a-pre-purchase-inspection-pays-for-itself.mdx` | Create | Content |
| `src/assets/blog/placeholder-buying-guide.svg` | Create | Assets |
| `src/assets/blog/placeholder-case-study.svg` | Create (optional — can share one) | Assets |
| `src/assets/blog/placeholder-deep-dive.svg` | Create (optional — can share one) | Assets |
| `CONTRACT.md` | Create | Repo root |
| `docs/content-voice-review.md` | Create | Docs |

### References

- [Source: architecture-truvis-landing-page.md § Decision 1d — Blog Content API Contract]
- [Source: architecture-truvis-landing-page.md § "Blog Content API JSON Shape"]
- [Source: architecture-truvis-landing-page.md § AR6 — Content Collections, AR8 — CONTRACT.md, AR9 — additive-only API, AR25 — lib/content.ts boundary]
- [Source: architecture-truvis-landing-page.md § "Content Collection Access Pattern"]
- [Source: architecture-truvis-landing-page.md § "Date / Time Handling"]
- [Source: architecture-truvis-landing-page.md § Complete Project Directory Structure — src/lib/content.ts, src/lib/types/, CONTRACT.md]
- [Source: prd-truvis-landing-page.md FR18–FR27, NFR31, NFR36, NFR40]
- [Source: epics-truvis-landing-page.md § Story 4.1]
- [Source: src/content/config.ts — existing starter schema to replace]
- [Source: src/lib/env.ts — getOptional(), getRequired()]
- [Source: .env.example — PUBLIC_SITE_URL]
- [Source: CLAUDE.md — content access only through lib/content.ts, env via lib/env.ts only]

## Architecture compliance

| Requirement | How this story satisfies it |
|---|---|
| AR6 — Content Collections | `blog` collection with Zod schema in `config.ts` |
| AR8 — CONTRACT.md | Created at repo root with full BlogPostView field table |
| AR9 — Additive-only API schema | BlogPostView type documented; CONTRACT.md versioning policy |
| AR25 — lib/content.ts boundary | All `getCollection('blog')` calls centralized in `content.ts` |
| NFR31 — No breaking API changes | CONTRACT.md versioning section; type is the single source of truth |
| NFR40 — 70/30 Inspector/Ally voice | Seed articles follow the voice; `docs/content-voice-review.md` reference |
| CLAUDE.md — env via lib/env.ts only | `getOptional('PUBLIC_SITE_URL')` — no direct `import.meta.env` |
| CLAUDE.md — no getCollection outside lib | `content.ts` is the only consumer; documented in file header |
| CLAUDE.md — three-tier hierarchy | `lib/` (utility tier) — no component or page imports |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Completion Notes List

- Replaced starter blog schema with Truvis Zod schema in `src/content/config.ts`. Note: `slug` field made optional because Astro 5 strips it from `data` and surfaces it as `entry.id`.
- Created `BlogPostView` and `BlogCategory` types in `src/lib/types/blog.ts`.
- Created `src/lib/content.ts` with `buildBlogEntryView()` and all five async helpers (`getAllBlogPosts`, `getBlogPost`, `getBlogPostsByCategory`, `getFeaturedBlogPosts`, `getRelatedBlogPosts`).
- Created three distinct placeholder SVGs (1200x630) in `src/assets/blog/` — one per category.
- Created three seed MDX articles (buying-guide, case-study, deep-dive) with 70/30 Inspector/Ally voice, specific opening hooks, H2/H3 headings, bulleted checklists, block quotes, and inline image references. Cross-references form a complete triangle.
- Expanded existing `CONTRACT.md` with full Blog API contract sections (5.1–5.7): base URL, BlogPostView type, field table, placeholder endpoints, cache headers, rate limits, breaking changes.
- Created 12 unit tests in `src/lib/content.test.ts` covering webUrl computation, ISO 8601 dates, absolute image URLs, field mapping, seo field omission, localhost fallback, trailing slash handling.
- Created `docs/content-voice-review.md` voice audit note for future authors.
- Installed `@astrojs/mdx@4` and added MDX integration to `astro.config.mjs` (required for `.mdx` content files).
- Fixed starter-template files (`BlogSearch.tsx`, `Blog.astro`, `rss.xml.ts`) that referenced old schema fields (`description`, `date`, `image`, `tags`) and broke the build after schema replacement. `rss.xml.ts` also migrated to use `lib/content.ts` helpers per the content access boundary rule.
- All 74 tests pass (12 new + 62 existing), `astro check` 0 errors, `astro build` succeeds, `prettier` passes.

### Change Log

- 2026-04-26: Story 4.1 implementation complete — blog content collection schema, types, helpers, seed articles, CONTRACT.md, unit tests, voice audit note.

### File List

- `src/content/config.ts` — Modified (replaced starter schema with Truvis blog schema)
- `src/lib/types/blog.ts` — Created (BlogPostView, BlogCategory types)
- `src/lib/content.ts` — Created (content access boundary module)
- `src/lib/content.test.ts` — Created (12 unit tests for buildBlogEntryView)
- `src/content/blog/2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel.mdx` — Created
- `src/content/blog/2026-03-22-the-900-euro-problem-behind-a-7200-invoice.mdx` — Created
- `src/content/blog/2026-04-01-why-a-pre-purchase-inspection-pays-for-itself.mdx` — Created
- `src/assets/blog/placeholder-buying-guide.svg` — Created
- `src/assets/blog/placeholder-case-study.svg` — Created
- `src/assets/blog/placeholder-deep-dive.svg` — Created
- `CONTRACT.md` — Modified (added Blog API contract sections 5.1–5.7)
- `docs/content-voice-review.md` — Created
- `astro.config.mjs` — Modified (added @astrojs/mdx integration)
- `src/components/BlogSearch.tsx` — Modified (migrated to new schema field names)
- `src/layouts/Blog.astro` — Modified (migrated to new schema field names)
- `src/pages/rss.xml.ts` — Modified (migrated to use lib/content.ts helpers + new schema)
- `package-lock.json` — Modified (added @astrojs/mdx dependency)

