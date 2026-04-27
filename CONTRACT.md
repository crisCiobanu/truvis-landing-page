# Truvis — Code & API Contracts

This document is the short, enforceable rulebook for contributors and code reviewers. It captures the hard project-wide rules that are not practical to enforce with ESLint alone in V1. Everything here is a **merge-blocking** check during code review.

## 1. Hydration Policy (AR27)

All React components that ship JavaScript to the browser MUST live in `src/components/islands/`.

- Prefer `client:idle` and `client:visible` for every island.
- `client:load` is reserved for **above-the-fold, conversion-critical islands** (e.g. the hero waitlist CTA, the hero headline A/B). Any other use is a convention violation.
- `client:load` on a component **outside** `src/components/islands/` is **forbidden**.
- A custom ESLint rule enforcing (a) and (b) is deferred (Story 1.7 follow-up). Until it lands, reviewers MUST grep each PR for `client:load` and reject placements outside `islands/`.

Code-review checklist line:

- [ ] No `client:load` appears outside `src/components/islands/`
- [ ] Every `client:load` in this PR is justified by the "above-the-fold, conversion-critical" rule
- [ ] Every hydrated React component in this PR lives under `src/components/islands/`

## 2. Content Access Boundary

- `getCollection()` and every other direct Astro Content Collections call MUST live **only** inside `src/lib/content.ts`.
- Pages, sections, blog components, and islands MUST import helpers from `lib/content.ts`; they MUST NOT import from `astro:content` directly.

Reviewer grep: `rg "from 'astro:content'" src/ --glob '!src/lib/content.ts' --glob '!src/content.config.ts'` must return zero results.

## 3. Environment Variable Access

- `src/lib/env.ts` is the **only** module allowed to read `process.env` or `import.meta.env`.
- Every other consumer calls `getRequired(key)` or `parseBoolean(key)` and treats missing values as fatal at build time.
- Variables exposed to the client MUST be prefixed `PUBLIC_*`. Never put a secret in a `PUBLIC_*` key.

Reviewer grep: `rg "process\.env|import\.meta\.env" src/ --glob '!src/lib/env.ts'` must return zero results.

## 4. Nanostores Convention (AR24)

- Every nanostore lives in `src/lib/stores/`.
- Store atoms MUST be named `$camelCase` (e.g. `$mobileNavOpen`).
- Consumers MUST only call the **action functions** exported alongside the atom (`openMobileNav`, `closeMobileNav`, `toggleMobileNav`) — never call `.set()` directly on the atom.

Reviewer grep: `rg "\$[a-z][a-zA-Z]*\.set\(" src/ --glob '!src/lib/stores/**'` must return zero results.

## 5. Blog API Contract (FR / NFR31)

> **Audience:** Mobile app developers consuming the Truvis blog API.
> **Guarantee:** This contract is additive-only at `/v1/`. Field renames or removals require a new `/v2/` endpoint, with `/v1/` kept alive for at least one mobile app release cycle.

### 5.1 Base URL & Versioning

```
${PUBLIC_SITE_URL}/api/v1/blog/
```

- All endpoints are versioned under `/v1/`.
- New fields may be added to existing responses at any time (additive-only).
- Existing fields will never be renamed, removed, or have their type changed within a version.
- If a breaking change is required, a new `/v2/` namespace will be introduced and `/v1/` will remain operational for at least one mobile app release cycle.

### 5.2 `BlogPostView` Type

The canonical TypeScript interface for every blog entry returned by the API:

```typescript
interface BlogPostView {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string; // ISO 8601 with timezone
  author: string;
  readTime: string;
  featured: boolean;
  featuredImage: {
    src: string; // absolute URL
    alt: string;
    width: number;
    height: number;
  };
  webUrl: string; // absolute URL
  seo: {
    title?: string;
    description?: string;
    socialImage?: string;
    keywords?: string[];
  };
  relatedSlugs: string[];
}

type BlogCategory =
  | 'buying-guide'
  | 'inspection-tips'
  | 'case-study'
  | 'deep-dive';
```

### 5.3 Field Table

| Field                  | Type           | Required | Example                                                   | Description                                                          |
| ---------------------- | -------------- | -------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `slug`                 | `string`       | Yes      | `"7-things-to-check-before-buying-a-10-year-old-diesel"`  | URL-safe kebab-case identifier                                       |
| `title`                | `string`       | Yes      | `"7 Things to Check Before Buying a 10-Year-Old Diesel"`  | Article title (max 70 chars)                                         |
| `excerpt`              | `string`       | Yes      | `"A pre-purchase checklist for older diesel vehicles..."` | Short description (max 200 chars)                                    |
| `category`             | `BlogCategory` | Yes      | `"buying-guide"`                                          | One of: `buying-guide`, `inspection-tips`, `case-study`, `deep-dive` |
| `publishedAt`          | `string`       | Yes      | `"2026-03-15T00:00:00.000Z"`                              | ISO 8601 datetime with timezone                                      |
| `author`               | `string`       | Yes      | `"Cristian Ciobanu"`                                      | Author display name                                                  |
| `readTime`             | `string`       | Yes      | `"6 min"`                                                 | Estimated reading time                                               |
| `featured`             | `boolean`      | Yes      | `true`                                                    | Whether the article is featured                                      |
| `featuredImage.src`    | `string`       | Yes      | `"https://truvis.app/assets/blog/placeholder.svg"`        | Absolute URL to the featured image                                   |
| `featuredImage.alt`    | `string`       | Yes      | `"A mechanic inspecting a diesel engine bay"`             | Alt text for accessibility                                           |
| `featuredImage.width`  | `number`       | Yes      | `1200`                                                    | Image width in pixels                                                |
| `featuredImage.height` | `number`       | Yes      | `630`                                                     | Image height in pixels                                               |
| `webUrl`               | `string`       | Yes      | `"https://truvis.app/blog/2026/03/7-things-to-check..."`  | Absolute URL to the web article                                      |
| `seo.title`            | `string`       | No       | `"7 Things to Check... \| Truvis"`                        | SEO title override                                                   |
| `seo.description`      | `string`       | No       | `"A pre-purchase checklist..."`                           | SEO meta description override                                        |
| `seo.socialImage`      | `string`       | No       | `"https://truvis.app/og/article.png"`                     | Social sharing image URL                                             |
| `seo.keywords`         | `string[]`     | No       | `["diesel inspection", "used car checklist"]`             | SEO keywords                                                         |
| `relatedSlugs`         | `string[]`     | Yes      | `["the-900-euro-problem...", "why-a-pre-purchase..."]`    | Slugs of related articles (may be empty)                             |

### 5.4 Endpoints

#### `GET /api/v1/blog/posts.json`

Returns all published blog posts sorted by `publishedAt` descending. Response is a raw JSON array of `BlogPostView` objects (no wrapper).

```bash
curl -s https://truvis.app/api/v1/blog/posts.json | jq '.[0].title'
```

#### `GET /api/v1/blog/posts/[slug].json`

Returns a single `BlogPostView` object by slug.

```bash
curl -s https://truvis.app/api/v1/blog/posts/7-things-to-check-before-buying-a-10-year-old-diesel.json | jq '.title'
```

#### `GET /api/v1/blog/categories.json`

Returns a JSON array of `{ category: string, postCount: number }` objects, sorted alphabetically by category.

```bash
curl -s https://truvis.app/api/v1/blog/categories.json | jq '.'
```

### 5.5 Versioning Policy

The `/v1/` path is stable for at least one mobile app release cycle.

- **Additions** are safe: new fields can be added at any time. Consumers must tolerate unknown fields.
- **Removals, renames, or type changes** require a new `/v2/` endpoint. The `/v1/` endpoint will be kept alive during the migration period (at least one full mobile app release cycle).
- The TypeScript interface (`BlogPostView`) and runtime Zod schema (`BlogPostViewSchema`) in `src/lib/types/blog.ts` are the single source of truth for the schema shape.

### 5.6 How the Contract is Enforced

A Vitest contract test at `tests/content.test.ts` runs in CI on every pull request:

1. Builds the site via `astro build` to generate the static JSON endpoints.
2. Parses every generated endpoint file.
3. Validates every object against `BlogPostViewSchema` (Zod runtime schema).
4. Includes negative test cases proving the schema rejects snake_case fields, relative URLs, bare string images, and non-ISO dates.

Any contract violation fails the PR check — changes cannot be merged until the shape is restored or `BlogPostViewSchema` is intentionally updated.

### 5.7 Deep Linking

Every `webUrl` in the API response is a stable, canonical URL that resolves to the full article HTML page (e.g., `https://truvis.app/blog/2026/03/7-things-to-check-before-buying-a-10-year-old-diesel`).

Mobile app deep links **must** use `webUrl` directly. Do not construct URLs client-side from slug or date fields.

### 5.8 Resilience

All three endpoints are static JSON files generated at build time and served from the Cloudflare Pages CDN edge. There is no runtime server or CMS dependency per request.

- **Latency:** CDN edge TTFB is typically <50ms, well under the 300ms budget (NFR8).
- **CMS outage:** A CMS outage cannot affect a live deploy. The last successful build remains served until the next deploy succeeds (NFR36).
- **Concurrency:** Static CDN-served files can handle arbitrary concurrent load. Rate limiting (21 req/10s per IP, ~126 req/min) is enforced at the Cloudflare WAF edge layer (Story 4.9).

### 5.9 CDN Cache Headers

All `/api/v1/blog/*` responses include:

```
Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800
```

- `max-age=300` — browser cache: 5 minutes
- `s-maxage=86400` — CDN cache: 24 hours
- `stale-while-revalidate=604800` — serve stale for up to 7 days while revalidating in the background

### 5.10 Rate Limits

The `/api/v1/blog/*` endpoints are rate-limited to **21 requests per 10 seconds per client IP** (~126 requests/minute). Clients exceeding this limit receive an HTTP `429 Too Many Requests` response with a `Retry-After` header indicating when the client may retry (in seconds).

Enforced by Cloudflare WAF at the edge layer (NFR14). The shorter 10-second window provides tighter burst protection than a per-minute limit.

**Mobile app guidance:** The carousel should implement a 5-minute local cache (matching the `max-age=300` Cache-Control directive) to stay comfortably under the rate limit even on shared networks (e.g., corporate NAT, conference wifi).

### 5.11 How to Report Breaking Changes

If you discover a response that does not match this contract, or if you need a field that would require a breaking change:

1. Open a GitHub issue on this repository
2. Apply the label `api-contract`
3. Include the endpoint URL, the expected shape, and the actual shape

We will triage within 48 hours and coordinate any changes with a deprecation window.

## 6. CSS Motion Tokens

- All transitions and animations MUST reference `--duration-fast`, `--duration-base`, or `--duration-slow` (defined in `src/styles/global.css`). Inventing new duration values is forbidden.
- The global `@media (prefers-reduced-motion: reduce)` block in `global.css` cuts every transition to 0.01ms. Any exception (essential motion) must be opted-in explicitly with a code comment citing UX-DR32.

## 7. Anti-patterns (forbidden)

- `process.env` / `import.meta.env` outside `src/lib/env.ts`
- `getCollection()` outside `src/lib/content.ts`
- `.set()` on a nanostore atom outside `src/lib/stores/`
- `client:load` outside `src/components/islands/`
- Hand-editing `package-lock.json`
- Hardcoding user-facing strings that should live in `src/i18n/{locale}/*.json`
- Loosening `tsconfig.json` `"strict": true`
