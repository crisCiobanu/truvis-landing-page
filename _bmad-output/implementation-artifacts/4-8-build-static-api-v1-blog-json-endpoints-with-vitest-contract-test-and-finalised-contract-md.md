# Story 4.8: Build static `/api/v1/blog/*` JSON endpoints with Vitest contract test and finalised `CONTRACT.md`

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As a **mobile app developer consuming the Truvis blog content API**,
I want **three static, cacheable, versioned JSON endpoints with a documented, stable shape and an automated contract test that fails the CI build if the shape ever changes**,
So that **the mobile app carousel never breaks because someone renamed a field on the web side**.

## Context & scope

This is Story 4.8 of Epic 4 ("Blog & Cross-Platform Content API"). It builds the three static JSON API endpoints that are the **only** data contract between the Truvis landing page and the Truvis mobile app (FR23-FR26). It also creates the Vitest contract test (AR10) that enforces the schema shape in CI, and finalises `CONTRACT.md` with real curl examples.

**Dependencies:**
- **Story 4.1** (MUST be complete): provides `src/lib/content.ts` with `getAllBlogPosts()`, `getBlogPost(slug)`, `getBlogPostsByCategory(category)` helpers; `src/lib/types/blog.ts` with `BlogPostView` interface, `BlogCategory` type, and `BlogPostViewSchema` Zod runtime schema; `CONTRACT.md` at repo root with placeholder endpoint section; three seed articles in `src/content/blog/`.
- **Story 4.4** (recommended complete): provides the blog article page at `/blog/[year]/[month]/[slug]` so `webUrl` deep links resolve. Not strictly blocking — endpoints can be built and tested without it, but the manual smoke test (AC5) requires it.
- **Story 4.9** (downstream): handles Cloudflare WAF rate limiting and CDN cache headers. This story does NOT set cache headers in the endpoint responses.

**Existing codebase state (at time of implementation):**
- `src/pages/api/` directory may not exist yet — create the full path `src/pages/api/v1/blog/posts/`.
- `vitest.config.ts` at project root includes only `src/**/*.test.ts`. The contract test lives in `tests/content.test.ts` at project root, so the vitest include pattern must be expanded.
- `tests/` directory does not exist at project root — create it.
- `CONTRACT.md` exists at repo root with a placeholder "Endpoints ship in Story 4.8" section.
- `PUBLIC_SITE_URL` env var is read via `getOptional('PUBLIC_SITE_URL', 'http://localhost:4321')` from `@/lib/env`.
- Astro `output: 'static'` — all endpoints are prerendered at build time.

**Scope boundaries:**
- **In scope:** Three `.json.ts` endpoint files, `tests/content.test.ts` contract test, vitest config update, `CONTRACT.md` finalisation.
- **Out of scope:** Cache headers (Story 4.9), WAF rate limiting (Story 4.9), CORS headers (not needed — same-origin CDN for web, mobile app fetches cross-origin but static JSON has no CORS restriction on GET), blog API authentication (AR: no API key needed for public content).

## Acceptance Criteria (BDD)

### AC1 — Three static JSON endpoints are created (AR8, FR23)

**Given** AR8 mandates static JSON endpoints generated at build time at three paths,
**When** I create the endpoints as Astro `.json.ts` routes,
**Then** `src/pages/api/v1/blog/posts.json.ts` exists and exports a `GET` handler that reads `getAllBlogPosts()` from `lib/content.ts` and returns a JSON array of `BlogPostView` objects with no wrapper (AR9),
**And** `src/pages/api/v1/blog/posts/[slug].json.ts` exists and exports a `GET` handler plus `getStaticPaths()` that generates one endpoint per post, returning a single `BlogPostView` object,
**And** `src/pages/api/v1/blog/categories.json.ts` exists and returns a JSON array of objects `{ category: BlogCategory, postCount: number }` derived from the full post list,
**And** all three endpoints are generated at build time as static JSON files in `dist/api/v1/blog/` — no server-side runtime execution,
**And** `astro build` succeeds with all three endpoints generated.

### AC2 — Response shape matches AR9 contract exactly

**Given** AR9 specifies the exact response shape for the blog API,
**When** I verify the output of each endpoint,
**Then** every response is `Content-Type: application/json`,
**And** there is **no** envelope or wrapper — the response body is a raw JSON array or a raw object (no `{ data: ... }`, no `{ ok: true, data: ... }`),
**And** all fields are camelCase (`publishedAt`, not `published_at`),
**And** all dates are ISO 8601 with timezone (e.g., `2026-03-15T00:00:00.000Z`),
**And** all URLs (`webUrl`, `featuredImage.src`) are **absolute** — never relative — using `PUBLIC_SITE_URL` as the base,
**And** all image references are objects `{ src, alt, width, height }` — never bare string URLs,
**And** the endpoint bodies contain only `BlogPostView` fields — no Astro-internal fields, no raw file paths, no implementation details leaked.

### AC3 — Vitest contract test enforces schema shape (AR10, NFR31)

**Given** AR10 requires a Vitest contract test asserting the JSON output shape,
**When** I create the contract test,
**Then** `tests/content.test.ts` is created at the project root,
**And** the test imports the `BlogPostViewSchema` runtime Zod schema from `src/lib/types/blog.ts`,
**And** the test runs `astro build` in a subprocess to produce the three endpoint JSON files in `dist/`,
**And** the test parses each endpoint file and asserts:
  - Every post object in `dist/api/v1/blog/posts.json` passes `BlogPostViewSchema.safeParse()`,
  - Every `dist/api/v1/blog/posts/[slug].json` file passes `BlogPostViewSchema.safeParse()`,
  - Every entry in `dist/api/v1/blog/categories.json` validates against a `CategoriesEntrySchema` (defined in the test: `z.object({ category: z.string(), postCount: z.number().int().nonneg() })`),
**And** the test includes negative cases: a synthetic "bad" post with a snake_case field, a relative URL, a bare string image, and a non-ISO date must all **fail** `BlogPostViewSchema.safeParse()` — proving the schema enforces the contract,
**And** `vitest.config.ts` is updated to include `tests/**/*.test.ts` in the include pattern,
**And** the test runs in CI Vitest job — a contract violation fails the PR check.

### AC4 — `CONTRACT.md` is finalised with real examples

**Given** Story 4.1 drafted `CONTRACT.md` with placeholder curl examples,
**When** I finalise the contract document,
**Then** the placeholder "Endpoints ship in Story 4.8" section is replaced with real curl examples for all three endpoints using `PUBLIC_SITE_URL`,
**And** the document includes a "Versioning policy" section stating: "The `/v1/` path is stable for at least one mobile app release cycle. Field additions are safe. Field removals, renames, or type changes require a new `/v2/` endpoint with `/v1/` kept alive during migration.",
**And** the document includes a "How the contract is enforced" section referencing `tests/content.test.ts` and explaining that CI blocks any PR that breaks the shape,
**And** the document includes a "Deep linking" section documenting: "Every `webUrl` in the API response is a stable, canonical URL that will resolve to the full article HTML page. Mobile app deep links must use `webUrl` directly.",
**And** the document includes a "Resilience" section explaining that endpoints are built into the static bundle — a CMS outage cannot affect a live deploy, and the last successful build remains served until the next deploy succeeds (NFR36).

### AC5 — Deep-link `webUrl` values resolve to article pages (FR26)

**Given** FR26 requires mobile-app deep linking to full articles,
**When** I verify the linking contract,
**Then** every `webUrl` in every endpoint response is an absolute URL following the pattern `${PUBLIC_SITE_URL}/blog/${YYYY}/${MM}/${slug}`,
**And** the format matches the route defined in Story 4.4's `[slug].astro` page,
**And** the contract test asserts that every `webUrl` starts with the expected `PUBLIC_SITE_URL` prefix and matches the expected path pattern.

### AC6 — Static generation satisfies resilience requirements (NFR8, NFR36)

**Given** NFR8 requires <300ms response time and NFR36 requires cached responses if CMS is unreachable,
**When** I verify the resilience characteristics,
**Then** the static-generation architecture intrinsically satisfies both: CDN edge TTFB is well under 300ms, and because endpoints are static files, a CMS outage cannot affect a live deploy,
**And** `CONTRACT.md` documents this architectural property,
**And** NFR18 (100 concurrent requests at <300ms p95) is delegated to Story 4.9 — this story notes the dependency but does NOT set cache headers or rate limits.

## Tasks / Subtasks

### Task 1: Create directory structure for API endpoints [AC1]

1.1. Create directory path `src/pages/api/v1/blog/posts/` (the nested `posts/` directory is needed for `[slug].json.ts`).
1.2. Verify the directory exists and the Astro file-routing will generate the expected URL paths.

### Task 2: Build `posts.json.ts` endpoint [AC1, AC2]

2.1. Create `src/pages/api/v1/blog/posts.json.ts`.
2.2. Import `APIRoute` type from `'astro'`.
2.3. Import `getAllBlogPosts` from `@/lib/content`.
2.4. Export a `GET` handler:

```typescript
import type { APIRoute } from 'astro';
import { getAllBlogPosts } from '@/lib/content';

export const GET: APIRoute = async () => {
  const posts = await getAllBlogPosts();
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

2.5. The response is a raw JSON array of `BlogPostView` objects — no wrapper, no envelope.
2.6. Content access is exclusively through `lib/content.ts` — no `getCollection()` call in this file.

### Task 3: Build `posts/[slug].json.ts` endpoint [AC1, AC2, AC5]

3.1. Create `src/pages/api/v1/blog/posts/[slug].json.ts`.
3.2. Import `APIRoute` and `GetStaticPaths` types from `'astro'`.
3.3. Import `getAllBlogPosts`, `getBlogPost` from `@/lib/content`.
3.4. Export `getStaticPaths()` that generates one path per post:

```typescript
import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllBlogPosts, getBlogPost } from '@/lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const post = await getBlogPost(params.slug!);
  if (!post) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

3.5. The `getStaticPaths()` ensures Astro generates a static JSON file for every blog post at build time.
3.6. The 404 branch is a safety net — in static mode, only known slugs are generated, so this should never be reached. Include it for robustness.

### Task 4: Build `categories.json.ts` endpoint [AC1, AC2]

4.1. Create `src/pages/api/v1/blog/categories.json.ts`.
4.2. Import `getAllBlogPosts` from `@/lib/content`.
4.3. Import `BlogCategory` from `@/lib/types/blog`.
4.4. Derive category counts from the full post list:

```typescript
import type { APIRoute } from 'astro';
import { getAllBlogPosts } from '@/lib/content';

export const GET: APIRoute = async () => {
  const posts = await getAllBlogPosts();
  const categoryMap = new Map<string, number>();

  for (const post of posts) {
    categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
  }

  const categories = Array.from(categoryMap.entries()).map(([category, postCount]) => ({
    category,
    postCount,
  }));

  return new Response(JSON.stringify(categories), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

4.5. Response is a raw JSON array of `{ category: string, postCount: number }` objects — no wrapper.
4.6. Sort the array alphabetically by category name for deterministic output.

### Task 5: Verify build produces static JSON files [AC1, AC6]

5.1. Run `npx astro build` and verify:
  - `dist/api/v1/blog/posts.json` exists and contains a JSON array.
  - `dist/api/v1/blog/posts/<slug>.json` exists for each seed article.
  - `dist/api/v1/blog/categories.json` exists and contains a JSON array.
5.2. Verify response shapes match AC2 requirements: no envelope, camelCase fields, ISO dates, absolute URLs, image objects.
5.3. Run `npx astro check` — zero errors.

### Task 6: Add `BlogPostViewSchema` Zod runtime schema to `src/lib/types/blog.ts` (if not already present from Story 4.1) [AC3]

6.1. Check whether Story 4.1 already created `BlogPostViewSchema` in `src/lib/types/blog.ts`.
6.2. If not present, add it alongside the existing `BlogPostView` interface:

```typescript
import { z } from 'zod';

export const BlogPostViewSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T/, 'must be ISO 8601'),
  author: z.string(),
  readTime: z.string(),
  featured: z.boolean(),
  featuredImage: z.object({
    src: z.string().url('must be absolute URL'),
    alt: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  webUrl: z.string().url('must be absolute URL'),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    socialImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
  relatedSlugs: z.array(z.string()),
});
```

6.3. Ensure `BlogPostViewSchema` is exported for consumption by the contract test.
6.4. The Zod schema is the **runtime** equivalent of the `BlogPostView` TypeScript interface — both must stay in sync.

### Task 7: Update `vitest.config.ts` to include `tests/` directory [AC3]

7.1. Open `vitest.config.ts` and update the `include` pattern to include both `src/**/*.test.ts` and `tests/**/*.test.ts`:

```typescript
test: {
  include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  environment: 'node',
  globals: false,
},
```

7.2. This ensures the contract test in `tests/content.test.ts` is discovered by the CI Vitest job.

### Task 8: Create contract test `tests/content.test.ts` [AC3]

8.1. Create `tests/` directory at project root.
8.2. Create `tests/content.test.ts` with the following structure:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { BlogPostViewSchema } from '../src/lib/types/blog';

const distDir = resolve(__dirname, '..', 'dist');

// Schema for the categories endpoint
const CategoriesEntrySchema = z.object({
  category: z.string(),
  postCount: z.number().int().nonneg(),
});

describe('Blog API contract tests', () => {
  beforeAll(() => {
    // Build the site to generate static endpoint JSON files
    execSync('npx astro build', {
      cwd: resolve(__dirname, '..'),
      stdio: 'pipe',
      timeout: 120_000,
    });
  }, 180_000); // 3-minute timeout for beforeAll

  describe('GET /api/v1/blog/posts.json', () => {
    it('produces a valid JSON file', () => { /* ... */ });
    it('is a raw array with no wrapper', () => { /* ... */ });
    it('every post validates against BlogPostViewSchema', () => { /* ... */ });
    it('all URLs are absolute', () => { /* ... */ });
    it('all dates are ISO 8601', () => { /* ... */ });
    it('all image refs are objects with src/alt/width/height', () => { /* ... */ });
    it('all field names are camelCase', () => { /* ... */ });
  });

  describe('GET /api/v1/blog/posts/[slug].json', () => {
    it('generates a JSON file for each known slug', () => { /* ... */ });
    it('each file validates against BlogPostViewSchema', () => { /* ... */ });
  });

  describe('GET /api/v1/blog/categories.json', () => {
    it('produces a valid JSON file', () => { /* ... */ });
    it('every entry validates against CategoriesEntrySchema', () => { /* ... */ });
    it('postCount values are positive integers', () => { /* ... */ });
  });

  describe('negative cases — schema rejects invalid shapes', () => {
    it('rejects a post with snake_case field names', () => {
      const bad = {
        slug: 'test', title: 'Test', excerpt: 'Test', category: 'buying-guide',
        published_at: '2026-01-01T00:00:00Z', // snake_case — wrong
        author: 'A', read_time: '5 min', featured: false,
        featured_image: { src: 'https://x.com/img.jpg', alt: 'a', width: 1, height: 1 },
        web_url: 'https://x.com/blog/2026/01/test',
        seo: {}, related_slugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a post with relative URL in webUrl', () => {
      const bad = {
        slug: 'test', title: 'Test', excerpt: 'Test', category: 'buying-guide',
        publishedAt: '2026-01-01T00:00:00Z', author: 'A', readTime: '5 min',
        featured: false,
        featuredImage: { src: 'https://x.com/img.jpg', alt: 'a', width: 1, height: 1 },
        webUrl: '/blog/2026/01/test', // relative — wrong
        seo: {}, relatedSlugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a post with bare string image instead of object', () => {
      const bad = {
        slug: 'test', title: 'Test', excerpt: 'Test', category: 'buying-guide',
        publishedAt: '2026-01-01T00:00:00Z', author: 'A', readTime: '5 min',
        featured: false,
        featuredImage: '/img.jpg', // bare string — wrong
        webUrl: 'https://x.com/blog/2026/01/test',
        seo: {}, relatedSlugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a post with non-ISO date', () => {
      const bad = {
        slug: 'test', title: 'Test', excerpt: 'Test', category: 'buying-guide',
        publishedAt: 'March 15, 2026', // not ISO 8601 — wrong
        author: 'A', readTime: '5 min', featured: false,
        featuredImage: { src: 'https://x.com/img.jpg', alt: 'a', width: 1, height: 1 },
        webUrl: 'https://x.com/blog/2026/01/test',
        seo: {}, relatedSlugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });
  });
});
```

8.3. The `beforeAll` runs `astro build` as a subprocess to generate the static JSON files in `dist/`.
8.4. Positive tests read the generated files from `dist/api/v1/blog/` and parse them with `BlogPostViewSchema.safeParse()`.
8.5. Negative tests use synthetic bad objects to prove the schema rejects invalid shapes.
8.6. Run `npx vitest run` and verify all tests pass.

### Task 9: Finalise `CONTRACT.md` [AC4, AC5, AC6]

9.1. Open `CONTRACT.md` at repo root.
9.2. Replace the placeholder endpoints section with real curl examples:

```markdown
## Endpoints

### List all posts

```bash
curl https://truvis.app/api/v1/blog/posts.json
```

Returns: JSON array of `BlogPostView` objects, sorted by `publishedAt` descending.

### Get a single post

```bash
curl https://truvis.app/api/v1/blog/posts/7-things-to-check-before-buying-a-10-year-old-diesel.json
```

Returns: single `BlogPostView` object.

### List categories

```bash
curl https://truvis.app/api/v1/blog/categories.json
```

Returns: JSON array of `{ category: string, postCount: number }` objects.
```

9.3. Add or update the "Versioning policy" section:

```markdown
## Versioning policy

The `/v1/` path is stable for at least one mobile app release cycle.

- **Additions** are safe: new fields can be added at any time. Consumers must tolerate unknown fields.
- **Removals, renames, or type changes** require a new `/v2/` endpoint. The `/v1/` endpoint will be kept alive during the migration period (at least one full mobile app release cycle).
- The TypeScript interface (`BlogPostView`) and runtime Zod schema (`BlogPostViewSchema`) in `src/lib/types/blog.ts` are the single source of truth for the schema shape.
```

9.4. Add a "How the contract is enforced" section:

```markdown
## How the contract is enforced

A Vitest contract test at `tests/content.test.ts` runs in CI on every pull request:

1. Builds the site via `astro build` to generate the static JSON endpoints.
2. Parses every generated endpoint file.
3. Validates every object against `BlogPostViewSchema` (Zod runtime schema).
4. Includes negative test cases proving the schema rejects snake_case fields, relative URLs, bare string images, and non-ISO dates.

Any contract violation fails the PR check — changes cannot be merged until the shape is restored or `BlogPostViewSchema` is intentionally updated.
```

9.5. Add a "Deep linking" section:

```markdown
## Deep linking

Every `webUrl` in the API response is a stable, canonical URL that resolves to the full article HTML page (e.g., `https://truvis.app/blog/2026/03/7-things-to-check-before-buying-a-10-year-old-diesel`).

Mobile app deep links **must** use `webUrl` directly. Do not construct URLs client-side from slug or date fields.
```

9.6. Add a "Resilience" section:

```markdown
## Resilience

All three endpoints are static JSON files generated at build time and served from the Cloudflare Pages CDN edge. There is no runtime server or CMS dependency per request.

- **Latency:** CDN edge TTFB is typically <50ms, well under the 300ms budget (NFR8).
- **CMS outage:** A CMS outage cannot affect a live deploy. The last successful build remains served until the next deploy succeeds (NFR36).
- **Concurrency:** Static CDN-served files can handle arbitrary concurrent load. Rate limiting (100 req/min/IP) is enforced at the Cloudflare WAF edge layer (Story 4.9).
```

9.7. Ensure the existing sections (introduction, BlogPostView type, field table, cache headers, rate limits) are preserved and consistent with the new sections.

### Task 10: Build and smoke test [AC1, AC2, AC5]

10.1. Run `npx astro check` — zero errors.
10.2. Run `npx astro build` — zero errors, three endpoint JSON files produced.
10.3. Inspect `dist/api/v1/blog/posts.json` — valid JSON array, correct shape.
10.4. Inspect a `dist/api/v1/blog/posts/<slug>.json` — valid JSON object, correct shape.
10.5. Inspect `dist/api/v1/blog/categories.json` — valid JSON array, correct shape.
10.6. Run `npx vitest run` — all tests pass (both positive and negative).
10.7. If Story 4.4 is complete: take a `webUrl` from the posts endpoint, run `npm run dev`, and open the URL in a browser to confirm the article page loads.

## Dev Notes

### Astro static endpoint pattern

Astro static endpoints use file-based routing under `src/pages/`. A file at `src/pages/api/v1/blog/posts.json.ts` generates `dist/api/v1/blog/posts.json`. The file must export a named `GET` function (not default export) typed as `APIRoute`:

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

For parameterized static routes, export `getStaticPaths()` alongside `GET`:

```typescript
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const post = await getBlogPost(params.slug!);
  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

Astro requires `getStaticPaths()` for any route with `[param]` segments when `output: 'static'`. Without it, the build will fail.

### `BlogPostView` is the serialisation boundary

The endpoint handlers should return `BlogPostView` objects directly from `lib/content.ts` helpers. Do NOT re-transform or cherry-pick fields — `buildBlogEntryView()` in Story 4.1 already strips Astro internals and computes absolute URLs. The endpoint code should be thin:

```typescript
const posts = await getAllBlogPosts();
return new Response(JSON.stringify(posts), { ... });
```

If the endpoint leaks any fields beyond `BlogPostView`, the contract test will catch it only if `BlogPostViewSchema` uses `.strict()`. Consider whether `.strict()` is appropriate — it rejects unknown fields, which is desirable for preventing leakage but may need discussion. If `BlogPostViewSchema` does not use `.strict()`, add an explicit test that checks `Object.keys(post)` matches the expected set.

### Contract test approach — build-then-read

The contract test uses a "build the site, then read the output" approach rather than mocking Astro internals. This is the most reliable way to test the actual contract because it exercises the real build pipeline. The tradeoff is that the test is slower (~30-60 seconds for the build step), but it runs only once per test suite via `beforeAll`.

**Important considerations:**
- Set `timeout: 120_000` on the `execSync` call to allow for slow CI runners.
- Set `180_000` timeout on the `beforeAll` hook.
- Use `stdio: 'pipe'` to suppress build output noise in test output. Capture stderr and log it on failure for debugging.
- The `dist/` directory path should be resolved relative to `__dirname` or `process.cwd()` — not hardcoded.
- Set `PUBLIC_SITE_URL` in the environment passed to `execSync` to ensure absolute URLs are generated:
  ```typescript
  execSync('npx astro build', {
    cwd: resolve(__dirname, '..'),
    stdio: 'pipe',
    timeout: 120_000,
    env: { ...process.env, PUBLIC_SITE_URL: 'https://truvis.app' },
  });
  ```

### Categories endpoint — deriving from post list

The categories endpoint does not have its own content collection or data source. It derives category names and post counts from the full blog post list. This means:
- If a category has zero posts, it does NOT appear in the output.
- The category values come from the `BlogCategory` enum (`'buying-guide' | 'inspection-tips' | 'case-study' | 'deep-dive'`).
- Sort alphabetically by category name for deterministic output across builds.

### No cache headers in this story

Per the acceptance criteria, cache headers (`Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`) are NOT set in the endpoint response headers. Story 4.9 handles that via Cloudflare Pages Functions middleware at `functions/api/v1/blog/_middleware.ts`. The endpoints in this story return only `Content-Type: application/json`.

### Vitest config change

The current `vitest.config.ts` only includes `src/**/*.test.ts`. The contract test lives at `tests/content.test.ts` (project root `tests/` directory, per architecture spec). Update the include pattern to `['src/**/*.test.ts', 'tests/**/*.test.ts']`. Do NOT remove the existing `src/**/*.test.ts` pattern — Story 4.1's `src/lib/content.test.ts` depends on it.

### `__dirname` in ESM context

Vitest runs with ESM support, but `__dirname` may not be available natively. Use `fileURLToPath(new URL('.', import.meta.url))` if `__dirname` is not available, or rely on Vitest's node environment which typically provides it. Test this during development.

### Anti-patterns to avoid

- **Do NOT** call `getCollection()` in the endpoint files — use `lib/content.ts` helpers exclusively.
- **Do NOT** use `import.meta.env` or `process.env` in the endpoint files — URL computation is handled by `buildBlogEntryView()` in `lib/content.ts`.
- **Do NOT** add cache headers to the endpoint responses — that is Story 4.9.
- **Do NOT** add CORS headers — static GET endpoints served from CDN do not need them.
- **Do NOT** create a wrapper/envelope around the response (no `{ data: [...] }`, no `{ ok: true }`).
- **Do NOT** modify `src/lib/content.ts` or `src/lib/types/blog.ts` unless adding `BlogPostViewSchema` (which Story 4.1 may have already created).
- **Do NOT** modify seed articles or blog schema — those are Story 4.1's artifacts.

### Project Structure Notes

Files created/modified by this story:

| File | Action | Purpose |
|---|---|---|
| `src/pages/api/v1/blog/posts.json.ts` | Create | All posts endpoint |
| `src/pages/api/v1/blog/posts/[slug].json.ts` | Create | Single post endpoint |
| `src/pages/api/v1/blog/categories.json.ts` | Create | Categories endpoint |
| `tests/content.test.ts` | Create | Contract test |
| `vitest.config.ts` | Modify | Add `tests/**/*.test.ts` to include |
| `CONTRACT.md` | Modify | Finalise with real examples |
| `src/lib/types/blog.ts` | Modify (conditional) | Add `BlogPostViewSchema` if not present |

### References

- [Source: architecture-truvis-landing-page.md § Decision 1d — Blog Content API Contract]
- [Source: architecture-truvis-landing-page.md § "Blog Content API JSON Shape" — no wrapper, camelCase, ISO 8601, absolute URLs]
- [Source: architecture-truvis-landing-page.md § AR8 — Static JSON endpoints at /api/v1/blog/*]
- [Source: architecture-truvis-landing-page.md § AR9 — Response shape rules]
- [Source: architecture-truvis-landing-page.md § AR10 — Vitest contract test]
- [Source: architecture-truvis-landing-page.md § "Good — Blog API endpoint" code example]
- [Source: epics-truvis-landing-page.md § Story 4.8 full acceptance criteria]
- [Source: epics-truvis-landing-page.md § Story 4.9 — downstream dependency for cache headers and rate limiting]
- [Source: prd-truvis-landing-page.md FR23–FR26 (blog API for mobile), NFR8 (<300ms), NFR18 (100 concurrent), NFR31 (additive-only), NFR36 (cached if CMS down)]
- [Source: Story 4.1 — lib/content.ts helpers, BlogPostView type, CONTRACT.md initial draft]
- [Source: CLAUDE.md — content access only through lib/content.ts, env via lib/env.ts only]
- [Source: vitest.config.ts — current include pattern: src/**/*.test.ts]

## Architecture compliance

| Requirement | How this story satisfies it |
|---|---|
| AR8 — Static JSON endpoints at `/api/v1/blog/*` | Three `.json.ts` files under `src/pages/api/v1/blog/` generate static JSON at build time |
| AR9 — Response shape: no wrapper, camelCase, ISO 8601, absolute URLs, image objects | Endpoints return raw `BlogPostView` from `lib/content.ts` — shape enforced by contract test |
| AR10 — Vitest contract test | `tests/content.test.ts` validates every endpoint output against `BlogPostViewSchema` with positive and negative cases |
| AR25 — Content access via `lib/content.ts` only | Endpoints import only from `@/lib/content` — no `getCollection()` calls in endpoint files |
| NFR8 — Blog content API <300ms | Static CDN-served files: TTFB <50ms. Documented in CONTRACT.md |
| NFR31 — Additive-only API schema | CONTRACT.md versioning policy; BlogPostViewSchema enforced in CI |
| NFR36 — Cached responses if CMS unreachable | Static files in CDN — no runtime CMS dependency. Documented in CONTRACT.md |
| FR23 — Blog API for mobile | Three endpoints serve blog content as JSON for the mobile app carousel |
| FR26 — Mobile deep link to article | Every `webUrl` is an absolute URL resolving to the article page |
| CLAUDE.md — env via lib/env.ts only | Endpoints do not read env directly — delegated to `buildBlogEntryView()` in `lib/content.ts` |
| CLAUDE.md — no getCollection outside lib | Endpoint files import helpers from `lib/content.ts` only |

## Dev Agent Record

### Agent Model Used


### Completion Notes List


### Change Log

### File List
