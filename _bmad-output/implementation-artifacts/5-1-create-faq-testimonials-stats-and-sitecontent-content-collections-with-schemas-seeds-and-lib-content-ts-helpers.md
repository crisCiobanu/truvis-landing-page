# Story 5.1: Create `faq`, `testimonials`, `stats` and `siteContent` Content Collections with schemas, seeds and `lib/content.ts` helpers

Status: done

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **Cristian**,
I want **the four remaining Content Collections (beyond `blog` from Epic 4) created with strict Zod schemas, seed content, and typed access helpers**,
so that **every surface that currently reads placeholder i18n strings or hard-coded data has a real, schema-validated source to switch to in Story 5.4**.

## Context & scope

This is the **first story of Epic 5** ("Content Operations — CMS, Phase Toggle & Rebuild Pipeline"). Epic 4 Story 4.1 created the `blog` collection. This story adds the other four collections: `faq`, `testimonials`, `stats`, `siteContent`. It also creates `src/lib/content.ts` (which does not exist yet) with typed helpers for all five collections.

The collections are internal — they are NOT exposed via the blog API (`/api/v1/blog/*`). They power landing-page sections that currently use placeholder i18n strings (FAQ accordion, social proof stats/quote, hero headline, footer copy, social links).

Scope boundaries:
- **In scope:** Extend `src/content/config.ts` with four new collection schemas, create seed data files, create `src/lib/content.ts` with typed helpers, extend boundary enforcement in `docs/design-conventions.md`, ensure `astro build` succeeds.
- **Out of scope:** Keystatic admin UI (Story 5.2), `lib/launch-phase.ts` (Story 5.3), swapping Epic 2/3 placeholder strings to real collection reads (Story 5.4), blog helpers in `lib/content.ts` (already exists or is Epic 4 scope — create fresh if missing and Epic 4 hasn't created it yet).

## Acceptance Criteria

### AC1 — Four new collections declared in `src/content/config.ts`

**Given** AR6 mandates five Astro Content Collections and Epic 4 Story 4.1 already created the `blog` collection,
**When** I extend `src/content/config.ts`,
**Then**

- four additional collections are declared: `faq`, `testimonials`, `stats`, `siteContent`,
- the collection `type` for `faq`, `testimonials`, and `stats` is `'data'` (JSON/YAML),
- the collection `type` for `siteContent` is `'data'` with a single entry (`src/content/siteContent/landing.json`) that holds all landing-page and global strings in one document,
- `astro build` succeeds with the new collections declared and the seed content in place.

### AC2 — `faq` schema with six+ seed entries

**Given** FR31 requires FAQ entries to be managed without code changes,
**When** I define the `faq` schema,
**Then**

- the schema enforces: `id` (string, stable slug for anchor linking), `question` (string, <=200 chars), `answer` (Markdown string), `order` (number), `featured` (boolean, default `false`), `category` (optional string),
- at least six seed entries are committed under `src/content/faq/` covering: scope, relationship to professional inspection, privacy, cost, platforms, accuracy, data retention,
- the schema does NOT include a `locale` field (V1.2 deferral).

### AC3 — `testimonials` schema with two+ seed entries

**Given** FR32 requires testimonials/stories to be managed without code changes,
**When** I define the `testimonials` schema,
**Then**

- the schema enforces: `id` (string), `quote` (string), `attribution` (string), `context` (optional string), `phase` (enum `'pre' | 'post'`, default `'pre'`), `featured` (boolean, default `false`), `authorImage` (optional `{src, alt, width, height}` object), `rating` (optional number 1-5),
- a Zod refinement rejects any `phase: 'post'` entry missing `authorImage` at build time,
- at least two seed entries are committed: one pre-launch market-insight quote and one post-launch placeholder.

### AC4 — `stats` schema with three+ seed entries

**Given** FR33 requires social proof statistics to be managed without code changes,
**When** I define the `stats` schema,
**Then**

- the schema enforces: `id` (string), `value` (string — freeform), `label` (string), `source` (optional string), `category` (enum `'teal' | 'amber' | 'coral'`), `phase` (enum `'pre' | 'post'`, default `'pre'`), `order` (number),
- the Zod schema requires `source` when `phase === 'pre'` (third-party citations) and does not when `phase === 'post'`,
- at least three pre-launch seed entries with real market data citations are committed.

### AC5 — `siteContent` schema with seed landing.json

**Given** the `siteContent` collection holds editable global strings,
**When** I define the `siteContent` schema,
**Then**

- the schema is a single-entry collection with these top-level groups:
  - `hero`: `{headline, subheadline, postLaunchHeadline?, postLaunchSubheadline?}`,
  - `problem`: `{body: string[], stats: {label, value, source}[]}`,
  - `footer`: `{tagline, smallPrint}`,
  - `socialLinks`: `{twitter?, instagram?, tiktok?, youtube?}` (each optional URL with `.url()` refinement),
  - `appStoreUrls`: `{ios?, android?}` (blank at V1),
  - `ctaLabels`: `{preLaunchPrimary, postLaunchPrimary}`,
- the seed `siteContent/landing.json` is committed with realistic V1 values for pre-launch fields and empty strings for post-launch-only fields,
- `socialLinks.*` URLs are NOT required at V1.

### AC6 — `src/lib/content.ts` with typed helpers

**Given** AR25 requires all Content Collection access to go through `lib/content.ts`,
**When** I create `src/lib/content.ts`,
**Then**

- the module exports typed async helpers:
  - `getFaqEntries(): Promise<FaqEntryView[]>` (sorted by `order` then `id`),
  - `getFeaturedFaqEntries(limit?: number): Promise<FaqEntryView[]>`,
  - `getTestimonials(phase?: 'pre' | 'post'): Promise<TestimonialView[]>` (defaults to hard-coded `'pre'` with `// TODO(epic-5-phase): default to isPostLaunch() once Story 5.3 ships`),
  - `getStats(phase?: 'pre' | 'post'): Promise<StatView[]>` (same pattern),
  - `getSiteContent(): Promise<SiteContentView>`,
- each helper applies a `build*View()` transform function that mirrors the `buildBlogEntryView()` pattern from Epic 4 (camelCase, typed return objects),
- **if `lib/content.ts` does not exist yet** (Epic 4 didn't create it), also add blog helpers (`getAllPosts`, `getPostBySlug`, etc.) so the module is the single source of truth for all five collections,
- **if `lib/content.ts` already exists** from Epic 4, extend it — do not create a second file.

### AC7 — Boundary enforcement extended

**Given** Story 4.1's code-review checklist enforces the `lib/content.ts` boundary,
**When** I extend the boundary enforcement,
**Then**

- `docs/design-conventions.md` gains an entry: "Content Collection access. All `getCollection()` calls go through `src/lib/content.ts`. Collections: `blog`, `faq`, `testimonials`, `stats`, `siteContent`. No direct `getCollection()` calls outside `lib/content.ts`.",
- the Epic 4 contract test file `tests/content.test.ts` is NOT modified — FAQ/testimonials/stats/siteContent are internal-only collections.

## Tasks / Subtasks

- [x] **Task 1 — Extend `src/content/config.ts` with four new collection schemas** (AC: 1, 2, 3, 4, 5)
  - [x] T1.1 Define `FaqSchema` Zod object: `id` (string), `question` (string, max 200), `answer` (string — Markdown), `order` (number), `featured` (boolean, default false), `category` (optional string). Collection type: `'data'`
  - [x] T1.2 Define `TestimonialSchema` Zod object: `id` (string), `quote` (string), `attribution` (string), `context` (optional string), `phase` (enum `['pre', 'post']`, default `'pre'`), `featured` (boolean, default false), `authorImage` (optional `z.object({src: z.string(), alt: z.string(), width: z.number(), height: z.number()})`), `rating` (optional `z.number().min(1).max(5)`). Add `.refine()` to reject `phase: 'post'` without `authorImage`
  - [x] T1.3 Define `StatsSchema` Zod object: `id` (string), `value` (string), `label` (string), `source` (optional string), `category` (enum `['teal', 'amber', 'coral']`), `phase` (enum `['pre', 'post']`, default `'pre'`), `order` (number). Add `.refine()` to require `source` when `phase === 'pre'`
  - [x] T1.4 Define `SiteContentSchema` Zod object with nested groups: `hero` (`{headline: z.string(), subheadline: z.string(), postLaunchHeadline: z.string().optional(), postLaunchSubheadline: z.string().optional()}`), `problem` (`{body: z.array(z.string()), stats: z.array(z.object({label: z.string(), value: z.string(), source: z.string()}))}`), `footer` (`{tagline: z.string(), smallPrint: z.string()}`), `socialLinks` (`{twitter?: z.string().url(), instagram?: z.string().url(), tiktok?: z.string().url(), youtube?: z.string().url()}`), `appStoreUrls` (`{ios?: z.string(), android?: z.string()}`), `ctaLabels` (`{preLaunchPrimary: z.string(), postLaunchPrimary: z.string()}`). Collection type: `'data'`
  - [x] T1.5 Register all four collections in `export const collections = { ... }` alongside existing `blog`

- [x] **Task 2 — Create seed content files** (AC: 2, 3, 4, 5)
  - [x] T2.1 Create `src/content/faq/` directory with 6+ JSON/YAML seed files covering canonical questions (scope, professional inspection, privacy, cost, platforms, accuracy, data retention). Each file uses `id` matching the filename slug. Example: `src/content/faq/what-does-truvis-cost.json`
  - [x] T2.2 Create `src/content/testimonials/` directory with 2 seed files: one pre-launch market-insight quote (no authorImage, no rating), one post-launch placeholder (with authorImage placeholder)
  - [x] T2.3 Create `src/content/stats/` directory with 3 pre-launch seed entries matching the current StatCard values from `social-proof-section.astro` — use real market data with source citations. Categories: `teal`, `amber`, `coral` (one each)
  - [x] T2.4 Create `src/content/siteContent/landing.json` with realistic V1 values: hero headline/subheadline matching current i18n values, problem body paragraphs, footer tagline/smallPrint, empty `socialLinks`, empty `appStoreUrls`, CTA labels ("Join the waitlist" / "Download the app")

- [x] **Task 3 — Create `src/lib/content.ts` with typed helpers** (AC: 6)
  - [x] T3.1 Define view types: `FaqEntryView`, `TestimonialView`, `StatView`, `SiteContentView` — camelCase, typed
  - [x] T3.2 Implement `getFaqEntries()`: calls `getCollection('faq')`, sorts by `order` then `id`, maps through `buildFaqEntryView()`
  - [x] T3.3 Implement `getFeaturedFaqEntries(limit?)`: filters `featured === true`, applies optional limit
  - [x] T3.4 Implement `getTestimonials(phase?)`: filters by phase, defaults to `'pre'` with `// TODO(epic-5-phase): default to isPostLaunch() once Story 5.3 ships`
  - [x] T3.5 Implement `getStats(phase?)`: filters by phase and sorts by `order`, same default pattern
  - [x] T3.6 Implement `getSiteContent()`: calls `getEntry('siteContent', 'landing')`, returns typed view
  - [x] T3.7 If `lib/content.ts` doesn't exist, also add blog helpers (`getAllPosts`, `getPostBySlug`, `getPostsByCategory`, `getBlogCategories`) using `getCollection('blog')`. If it already exists, extend it

- [x] **Task 4 — Update boundary enforcement** (AC: 7)
  - [x] T4.1 Add Content Collection access rule to `docs/design-conventions.md`: list all five collections, state the `lib/content.ts` single-access-point rule
  - [x] T4.2 Verify no file outside `lib/content.ts` calls `getCollection('faq' | 'testimonials' | 'stats' | 'siteContent')` — if any exist, refactor them

- [x] **Task 5 — Build verification** (AC: 1)
  - [x] T5.1 Run `astro build` — must succeed with all four new collections and seed data
  - [x] T5.2 Run `astro check` — zero TypeScript errors
  - [x] T5.3 Run `npx eslint .` — no new errors
  - [x] T5.4 Run `npx prettier --check .` — no formatting issues

### Review Findings

- [x] [Review][Patch] statsSchema refinement allows empty-string source — added `.min(1)` to `source` field [src/content/config.ts:98] — FIXED

## Dev Notes

### Implementation approach

**Collection types**: `faq`, `testimonials`, `stats` use `type: 'data'` because they are structured records (JSON/YAML), not Markdown documents. `siteContent` also uses `type: 'data'` with a single entry convention.

**Seed file format**: Use JSON for all data collections (not YAML) for consistency with `siteContent/landing.json`. File naming: `src/content/faq/what-does-truvis-cost.json`, `src/content/stats/hidden-defect-cost.json`, etc.

**Important — `lib/content.ts` does not exist yet**: The codebase exploration confirmed this file is missing. You must create it from scratch. Include both the new collection helpers AND blog helpers if Epic 4 hasn't already created them. Check if any existing files import from `@/lib/content` — if so, ensure your exports match their expectations.

**Phase default workaround**: Since `lib/launch-phase.ts` does not exist yet (Story 5.3), `getTestimonials()` and `getStats()` must default their `phase` parameter to `'pre'` with a `TODO` comment. Do NOT import from a non-existent module. Story 5.3 will replace the hard-coded default.

**`siteContent` single-entry pattern**: Astro Content Collections supports single entries accessed via `getEntry('siteContent', 'landing')` rather than `getCollection()`. The entry ID is derived from the filename (`landing.json` → ID `landing`).

**Zod refinements**: Two critical refinements:
1. `testimonials`: `.refine(d => d.phase !== 'post' || d.authorImage !== undefined, { message: 'Post-launch testimonials require authorImage' })`
2. `stats`: `.refine(d => d.phase !== 'pre' || d.source !== undefined, { message: 'Pre-launch stats require source citation' })`

**socialLinks URL validation**: Use `z.string().url().optional()` for each social link. Since these are optional and blank at V1, the refinement should only validate when a value is present. Consider using `z.string().url().optional().or(z.literal(''))` to allow empty strings in the seed data.

### Current codebase state (verified)

- `src/content/config.ts` exists at line 1-31, defines only `blog` collection with `BlogSchema`
- `src/lib/content.ts` does NOT exist — must be created fresh
- `src/lib/env.ts` exists with `getRequired()`, `getOptional()`, `parseBoolean()`, `getTurnstileConfig()`
- `src/lib/launch-phase.ts` does NOT exist — do not import from it
- Current FAQ items are i18n strings in `landing.json` under `landing.faq.items`
- Current stats are i18n strings in `landing.json` under `landing.socialProof.stats.*`
- Current hero/footer copy is i18n strings in `landing.json`
- `docs/design-conventions.md` exists with section colour rhythm and motion tokens — extend, don't replace

### Architecture compliance

- **AR6**: Five Content Collections — `blog` (Epic 4) + `faq`, `testimonials`, `stats`, `siteContent` (this story)
- **AR25**: All `getCollection()` calls centralized in `lib/content.ts`
- **Three-tier hierarchy**: `lib/content.ts` is a shared utility (Lib tier). Seed data under `src/content/` is content tier. No cross-tier violations
- **Content access boundary**: Enforced via code review + `docs/design-conventions.md` documentation
- **NFR5 (500KB budget)**: No client-side impact — content collections are read at build time only

### Dependencies

- **Story 4.1** (`src/content/config.ts` exists with `blog` collection — extend, don't replace)
- **Story 1.7** (`src/lib/env.ts` exists, conventions documented)
- **Story 2.6** (StatCard categories: `teal`, `amber`, `coral` — seed data must match)
- **Story 2.8** (FAQ accordion currently reads from i18n — seed FAQ entries should cover the same canonical questions)

### Existing patterns to follow

- **Zod schema pattern**: See existing `BlogSchema` in `src/content/config.ts` at line 4-17 for reference
- **camelCase fields**: All schema fields use camelCase (e.g., `publishedAt`, `featuredImage`)
- **Collection registration**: See `export const collections = { blog }` at line 25-27

### Project Structure Notes

New files:

```
src/lib/content.ts                          <- Typed content access helpers (single source of truth)
src/content/faq/*.json                      <- 6+ FAQ seed entries
src/content/testimonials/*.json             <- 2+ testimonial seed entries
src/content/stats/*.json                    <- 3+ stat seed entries
src/content/siteContent/landing.json        <- Single-entry global strings
```

Modified files:

```
src/content/config.ts                       <- Add faq, testimonials, stats, siteContent schemas
docs/design-conventions.md                  <- Add Content Collection access boundary rule
```

### References

- [Source: epics-truvis-landing-page.md#Story 5.1 — Full acceptance criteria (lines 1774-1829)]
- [Source: architecture-truvis-landing-page.md#AR6 — Five Content Collections + Keystatic]
- [Source: architecture-truvis-landing-page.md#AR25 — lib/content.ts access boundary]
- [Source: architecture-truvis-landing-page.md#1b — Content Collections Schema definitions]
- [Source: prd-truvis-landing-page.md#FR31 — FAQ managed without code changes]
- [Source: prd-truvis-landing-page.md#FR32 — Testimonials managed without code changes]
- [Source: prd-truvis-landing-page.md#FR33 — Statistics managed without code changes]
- [Source: src/content/config.ts — Existing blog collection schema (lines 1-31)]
- [Source: src/components/sections/social-proof-section.astro — TODO(epic-5) markers at lines 23, 77]
- [Source: src/components/sections/faq-section.astro — TODO(epic-5) marker at line 44]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no blockers encountered.

### Completion Notes List

- Extended `src/content/config.ts` with four new collection schemas (`faq`, `testimonials`, `stats`, `siteContent`) with Zod validation and refinements (post-launch testimonials require authorImage, pre-launch stats require source citation)
- Created 7 FAQ seed entries, 2 testimonial seed entries, 3 stats seed entries, and 1 siteContent/landing.json — all matching existing i18n placeholder content with real market data source citations
- Extended existing `src/lib/content.ts` (from Epic 4) with typed view interfaces and helpers: `getFaqEntries()`, `getFeaturedFaqEntries()`, `getTestimonials()`, `getStats()`, `getSiteContent()` — all following the `build*View()` transform pattern established by `buildBlogEntryView()`
- Phase defaults hard-coded to `'pre'` with `TODO(epic-5-phase)` comments for Story 5.3
- Extended `docs/design-conventions.md` with Content Collection access boundary rule listing all five collections
- All verification passed: astro check (0 errors), astro build (complete), eslint (0 new errors), prettier (all formatted), vitest (90/90 tests passed, 0 regressions)

### Change Log

- 2026-04-27: Story 5.1 implemented — four new Content Collections with schemas, seeds, and typed lib/content.ts helpers

### File List

New files:
- src/content/faq/what-does-truvis-do.json
- src/content/faq/does-truvis-replace-mechanic.json
- src/content/faq/what-about-privacy.json
- src/content/faq/what-does-truvis-cost.json
- src/content/faq/which-phones.json
- src/content/faq/how-accurate.json
- src/content/faq/data-retention.json
- src/content/testimonials/market-insight-pre.json
- src/content/testimonials/user-review-post.json
- src/content/stats/hidden-defect-rate.json
- src/content/stats/average-hidden-cost.json
- src/content/stats/purchase-price-loss.json
- src/content/siteContent/landing.json

Modified files:
- src/content/config.ts
- src/lib/content.ts
- docs/design-conventions.md
