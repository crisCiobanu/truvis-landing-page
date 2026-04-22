# Story 5.2: Configure Keystatic admin UI with self-hosted GitHub OAuth and mirror all five Content Collections

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **Cristian**,
I want **a live Keystatic admin UI at `/keystatic` where I can create, edit and publish entries for all five Content Collections, commit changes to GitHub via a self-hosted OAuth app, and see my changes flow through the normal PR + deploy pipeline**,
so that **I can update any piece of content on the landing page without touching code and without trusting a third-party Keystatic Cloud service with our auth path**.

## Context & scope

This is the **second story of Epic 5**. Story 5.1 created the four new Content Collections (`faq`, `testimonials`, `stats`, `siteContent`) alongside the existing `blog` collection from Epic 4. This story installs Keystatic, creates `keystatic.config.ts` mirroring all five Zod schemas, wires GitHub OAuth for admin authentication, and ensures the admin UI is code-split away from the public landing page.

This story introduces a **hybrid output mode**: the landing page remains `output: 'static'` (prerendered), but the `/keystatic` admin route requires server-side rendering. The Astro Cloudflare adapter (already present for API routes like `/api/waitlist`) handles this. Keystatic pages use `export const prerender = false`.

Scope boundaries:
- **In scope:** Install `@keystatic/core` + `@keystatic/astro`, create `keystatic.config.ts`, wire GitHub OAuth (client ID/secret as env vars), mount admin routes, update `robots.txt`, update `.env.example`, add `getKeystaticConfig()` to `lib/env.ts`, document in `docs/integrations/keystatic.md`, verify no public bundle size regression.
- **Out of scope:** Swapping component data reads (Story 5.4), launch-phase toggle (Story 5.3), end-to-end pipeline verification (Story 5.5), actual content authoring beyond verifying the admin UI loads.

## Acceptance Criteria

### AC1 — Keystatic dependencies installed and Astro integration registered

**Given** AR6 mandates a Keystatic admin UI mirroring all five collection schemas,
**When** I install and configure Keystatic,
**Then**

- `@keystatic/core` and `@keystatic/astro` are added as dependencies,
- the Keystatic Astro integration is registered in `astro.config.mjs` alongside existing integrations (`@astrojs/react`, `@astrojs/sitemap`, `@astrojs/cloudflare`),
- `keystatic.config.ts` is created at the repo root.

### AC2 — Five collections/singletons mirror Zod schemas

**Given** Story 5.1 defined Zod schemas for all five collections,
**When** I configure Keystatic,
**Then**

- `keystatic.config.ts` declares: `blog` (collection), `faq` (collection), `testimonials` (collection), `stats` (collection), `siteContent` (singleton),
- each Keystatic field declaration mirrors its Zod counterpart: required/optional, type, enum options, min/max lengths,
- any drift between Keystatic config and Zod schemas is documented as a `TODO` comment in `keystatic.config.ts` plus a "Known drift" section in `docs/integrations/keystatic.md`.

### AC3 — Blog collection Keystatic form

**Given** FR28 requires CMS-driven blog article authoring and FR29 requires per-article SEO metadata,
**When** I configure the `blog` collection,
**Then**

- the form surfaces every field from the blog Zod schema including any `seo` nested object,
- the `featuredImage` field uses Keystatic's image-upload helper writing to `src/assets/blog/`,
- the `category` field is a dropdown from the same enum values as the Zod schema (`tutorial`, `news`, `guide`, `review`, `article`),
- the MDX body field uses Keystatic's rich document editor.

### AC4 — FAQ, testimonials, stats collection Keystatic forms

**Given** FR31/32/33 require FAQ/testimonials/stats managed without code changes,
**When** I configure those three collections,
**Then**

- each collection renders a list view with per-entry edit forms,
- every field from Story 5.1's Zod schemas is editable with the same validation constraints,
- the `testimonials` collection's conditional `authorImage` (required when `phase === 'post'`) is enforced via Keystatic's conditional field helper.

### AC5 — siteContent singleton Keystatic form

**Given** the `siteContent` singleton holds phase-conditional hero/CTA copy,
**When** I configure the singleton,
**Then**

- the form is organised into groups matching the schema: `hero`, `problem`, `footer`, `socialLinks`, `appStoreUrls`, `ctaLabels`,
- post-launch fields are grouped into a "Post-launch content" collapsed section with a callout "These fields are only rendered when `LAUNCH_PHASE=post`",
- `socialLinks.*` URL fields use Keystatic's URL field type with absolute-URL validation.

### AC6 — Self-hosted GitHub OAuth

**Given** self-hosted GitHub OAuth is required (not Keystatic Cloud),
**When** I set up the OAuth flow,
**Then**

- `keystatic.config.ts` uses `storage: {kind: 'github', repo: {owner: '<owner>', name: 'truvis-landing-page'}}`,
- the OAuth App's `client_id` and `client_secret` are stored as `KEYSTATIC_GITHUB_CLIENT_ID` (public) and `KEYSTATIC_GITHUB_CLIENT_SECRET` (private) in Cloudflare Pages env vars,
- both env vars are added to `.env.example` with empty values and a comment,
- `lib/env.ts` gains a typed `getKeystaticConfig()` accessor that reads both variables.

### AC7 — Admin route mounted and protected

**Given** Keystatic's admin route must be server-rendered and auth-gated,
**When** I wire the admin route,
**Then**

- Keystatic admin pages render at `/keystatic` via the Keystatic Astro integration,
- the admin UI is NOT statically prerendered — it runs as SSR on Cloudflare Pages Functions,
- unauthenticated visits redirect to GitHub OAuth flow,
- only GitHub users with push access to the repo can authenticate,
- `robots.txt` is updated to disallow `/keystatic`.

### AC8 — No public bundle regression

**Given** hydration discipline and NFR5 (500KB budget),
**When** I audit the Keystatic integration,
**Then**

- Keystatic's admin-UI JavaScript is code-split and only loads on `/keystatic/**`,
- the landing page's initial bundle weight is unchanged,
- `astro build` succeeds, `astro check` reports zero errors.

## Tasks / Subtasks

- [ ] **Task 1 — Install Keystatic dependencies** (AC: 1)
  - [ ] T1.1 Run `npm install @keystatic/core @keystatic/astro`
  - [ ] T1.2 Register the Keystatic Astro integration in `astro.config.mjs` — add `keystatic()` to the `integrations` array. Consult latest `@keystatic/astro` docs for the correct integration function name and import path
  - [ ] T1.3 Verify the integration does not conflict with existing `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/cloudflare` integrations

- [ ] **Task 2 — Create `keystatic.config.ts`** (AC: 2, 3, 4, 5, 6)
  - [ ] T2.1 Import `config`, `collection`, `singleton`, `fields` from `@keystatic/core`
  - [ ] T2.2 Configure storage: `storage: { kind: 'github', repo: { owner: 'crisCiobanu', name: 'truvis-landing-page' } }`
  - [ ] T2.3 Define `blog` collection: mirror blog Zod schema fields — `title` (text), `description` (text), `date` (date), `draft` (checkbox), `image` (image to `src/assets/blog/`), `author` (text, default 'ONE'), `tags` (multiselect/array of text), `category` (select from enum), `readingTime` (integer), `featured` (checkbox). Add `body` as document field for MDX content
  - [ ] T2.4 Define `faq` collection: `id` (slug), `question` (text, max 200), `answer` (text/markdown), `order` (integer), `featured` (checkbox), `category` (text, optional). Path: `src/content/faq/`
  - [ ] T2.5 Define `testimonials` collection: `id` (slug), `quote` (text), `attribution` (text), `context` (text, optional), `phase` (select: pre/post), `featured` (checkbox), `authorImage` (conditional on phase=post — use Keystatic conditional field), `rating` (integer 1-5, optional). Path: `src/content/testimonials/`
  - [ ] T2.6 Define `stats` collection: `id` (slug), `value` (text), `label` (text), `source` (text, conditional required on phase=pre), `category` (select: teal/amber/coral), `phase` (select: pre/post), `order` (integer). Path: `src/content/stats/`
  - [ ] T2.7 Define `siteContent` singleton: nested field groups for `hero`, `problem`, `footer`, `socialLinks`, `appStoreUrls`, `ctaLabels`. Post-launch fields in a distinct group section. URL fields use Keystatic URL type. Path: `src/content/siteContent/`

- [ ] **Task 3 — Wire GitHub OAuth and env vars** (AC: 6)
  - [ ] T3.1 Add to `.env.example`: `KEYSTATIC_GITHUB_CLIENT_ID=` and `KEYSTATIC_GITHUB_CLIENT_SECRET=` with comments pointing to GitHub OAuth App registration
  - [ ] T3.2 Add `getKeystaticConfig()` to `src/lib/env.ts`: reads both vars via `getRequired()`, returns typed `{ clientId: string; clientSecret: string }`. Only throw in production — in dev, return empty strings with a warning so local dev isn't blocked

- [ ] **Task 4 — Mount admin routes and update robots.txt** (AC: 7)
  - [ ] T4.1 Verify Keystatic Astro integration auto-generates the admin route at `/keystatic/[...params]` and the API auth handlers. If manual route files are needed, create `src/pages/keystatic/[...params].astro` with `export const prerender = false`
  - [ ] T4.2 Add `Disallow: /keystatic` to `public/robots.txt`

- [ ] **Task 5 — Create `docs/integrations/keystatic.md`** (AC: 2)
  - [ ] T5.1 Document: overview, authoring workflow (edit → PR → merge → deploy), GitHub OAuth setup steps, "Known drift" section for any Zod/Keystatic schema mismatches, link to Keystatic docs

- [ ] **Task 6 — Verify no public bundle regression** (AC: 8)
  - [ ] T6.1 Run `astro build` — must succeed
  - [ ] T6.2 Run `astro check` — zero errors
  - [ ] T6.3 Verify Keystatic JS is not present in the landing page bundle (check `dist/` output for keystatic chunks — they should only appear in keystatic route chunks)
  - [ ] T6.4 Run `npx eslint .` and `npx prettier --check .`

## Dev Notes

### Implementation approach

**Keystatic + Astro hybrid mode**: The project uses `output: 'static'` with the Cloudflare adapter for API routes. Keystatic requires SSR for its admin pages. The `@keystatic/astro` integration handles this by setting `prerender: false` on its generated routes. Verify this works with the existing Cloudflare adapter configuration. If the integration requires `output: 'hybrid'` or `output: 'server'`, update `astro.config.mjs` accordingly — but `output: 'static'` with per-route `prerender: false` overrides should work in Astro 5.

**IMPORTANT — Check latest Keystatic docs**: Before implementing, verify the current API for `@keystatic/core` and `@keystatic/astro`. The Keystatic API may have changed since the architecture document was written. Key things to verify:
- Import path and function names for the Astro integration
- Config format for GitHub storage mode
- How conditional fields work (for testimonials `authorImage` requirement)
- Whether singletons vs collections API has changed

**GitHub OAuth App registration**: Cristian needs to manually register the GitHub OAuth App before this story can be fully tested. The story creates the code infrastructure; the manual registration is a prerequisite for integration testing. Document the registration steps in `docs/integrations/keystatic.md`.

**`getKeystaticConfig()` in env.ts**: Follow the same pattern as `getTurnstileConfig()` at line 80-85 of `src/lib/env.ts`. Throw on missing values only in production; in dev, default to empty strings so local development works without GitHub OAuth configured.

**Conditional fields in Keystatic**: For the `testimonials` collection, the `authorImage` field is required only when `phase === 'post'`. Check Keystatic's API for conditional field visibility — it may be `fields.conditional()` or a `when` option on the field definition.

### Architecture compliance

- **AR6**: Keystatic config mirrors all five Zod schemas
- **Three-tier hierarchy**: `keystatic.config.ts` is a root-level config file (same tier as `astro.config.mjs`). No tier violations
- **NFR5 (500KB budget)**: Keystatic JS must be code-split to admin routes only. Verify via build output inspection
- **NFR12 (no client-side secrets)**: `KEYSTATIC_GITHUB_CLIENT_SECRET` is server-only (no `PUBLIC_` prefix). Only read in API auth handlers
- **Hydration policy**: Keystatic admin pages are fully server-rendered — no `client:load` impact on public pages
- **Env var convention**: Both Keystatic env vars follow `UPPER_SNAKE_CASE`, read via `lib/env.ts`

### Dependencies

- **Story 5.1** (`src/content/config.ts` has all five collection schemas — Keystatic config mirrors these)
- **Story 4.1** (blog collection exists in `src/content/config.ts`)
- **Story 1.2** (Cloudflare Pages adapter configured in `astro.config.mjs`)
- **Manual prerequisite**: Cristian registers GitHub OAuth App in GitHub account settings before integration testing

### Existing patterns to follow

- **astro.config.mjs**: See existing integrations array for registration pattern (React, Sitemap, Cloudflare)
- **env.ts accessors**: See `getTurnstileConfig()` at line 80-85 for the pattern of grouped env var accessors
- **`.env.example`**: See existing entries for comment/documentation style
- **`robots.txt`**: Check current content in `public/robots.txt` before appending `Disallow: /keystatic`

### Project Structure Notes

New files:

```
keystatic.config.ts                         <- Keystatic admin UI config (repo root)
docs/integrations/keystatic.md              <- Keystatic setup and authoring workflow docs
src/pages/keystatic/[...params].astro       <- Only if not auto-generated by integration
```

Modified files:

```
astro.config.mjs                            <- Register Keystatic integration
src/lib/env.ts                              <- Add getKeystaticConfig() accessor
.env.example                                <- Add KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET
public/robots.txt                           <- Add Disallow: /keystatic
package.json / package-lock.json            <- New deps: @keystatic/core, @keystatic/astro
```

### References

- [Source: epics-truvis-landing-page.md#Story 5.2 — Full acceptance criteria (lines 1831-1894)]
- [Source: architecture-truvis-landing-page.md#AR6 — Five Content Collections + Keystatic config mirroring]
- [Source: architecture-truvis-landing-page.md#1a — Keystatic admin UI rationale]
- [Source: architecture-truvis-landing-page.md#2b — Secrets management (env vars)]
- [Source: prd-truvis-landing-page.md#FR28 — CMS-driven blog authoring]
- [Source: prd-truvis-landing-page.md#FR29 — Per-article SEO metadata in CMS]
- [Source: prd-truvis-landing-page.md#FR34 — Content change triggers rebuild + deploy]
- [Source: prd-truvis-landing-page.md#NFR12 — No client-side secrets]
- [Source: src/lib/env.ts — getTurnstileConfig() pattern (line 80-85)]
- [Source: astro.config.mjs — Current integrations: React, Sitemap, Cloudflare]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
