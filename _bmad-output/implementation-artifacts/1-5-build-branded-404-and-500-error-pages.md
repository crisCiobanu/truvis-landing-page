# Story 1.5: Build branded 404 and 500 error pages

Status: ready-for-dev

## Story

As **a visitor who lands on an invalid URL or hits a server error**,
I want **a branded error page that explains what happened and offers a way back**,
so that **I am not dumped onto an unbranded host page and I can find my way to useful content**.

## Acceptance Criteria

### AC1 — `404.astro`

**Given** Astro supports `src/pages/404.astro` for unmatched routes,
**When** the developer creates `src/pages/404.astro` using `BaseLayout` (Story 1.4),
**Then**

- the page renders with the Truvis brand visuals (warm `bg`, `text/primary`, hero typography from Story 1.3),
- the page contains a clear **"Page not found"** heading and a **friendly Inspector/Ally voice** message (single short paragraph; lean Inspector authority with one Ally warmth touch — see brand voice in `branding-truvis.md`),
- the page provides **at least two CTA links**: one **back to the landing page (`/`)** and one **to the blog index (`/blog`)** (FR56),
- the page **returns HTTP 404** when accessed via Cloudflare Pages (Astro + CF Pages does this automatically when the file is named `404.astro`; verify with `curl -I` against the deployed preview),
- the page is keyboard navigable and meets WCAG 2.1 AA contrast (UX-DR25, NFR19, NFR20),
- the page contains exactly one `<h1>` (NFR22).

### AC2 — `500.astro`

**Given** Astro supports `src/pages/500.astro` for server errors,
**When** the developer creates `src/pages/500.astro` using `BaseLayout`,
**Then**

- the page renders with the same brand visuals as the 404 page and offers the same nav-back CTAs,
- the page advises the visitor to **retry shortly**,
- the page is referenced from the **Cloudflare Pages error handling configuration** so it serves on 5xx responses (configure via `_routes.json` or CF Pages dashboard custom error pages — document the chosen mechanism in README),
- HTTP 500 status verified via a deliberate test (e.g., temporarily make an API route throw, deploy to preview, hit it, `curl -I`).

## Tasks / Subtasks

- [ ] **T1 — Copy / draft brand voice** (AC: 1, 2)
  - [ ] T1.1 Read `_bmad-output/planning-artifacts/branding-truvis.md` for the Inspector/Ally voice rules
  - [ ] T1.2 Draft two short paragraphs (one for 404, one for 500) — keep them under 30 words each
- [ ] **T2 — `404.astro`** (AC: 1)
  - [ ] T2.1 Create `src/pages/404.astro`, wrap in `BaseLayout` with `title="Page not found · Truvis"` and a relevant `description`
  - [ ] T2.2 Render the heading, paragraph, and two CTA links to `/` and `/blog`
  - [ ] T2.3 Style with brand tokens (no inline overrides)
  - [ ] T2.4 Add `<meta name="robots" content="noindex">` (don't surface error pages in search)
- [ ] **T3 — `500.astro`** (AC: 2)
  - [ ] T3.1 Create `src/pages/500.astro` mirroring the 404 structure
  - [ ] T3.2 Add the retry advice in the body
- [ ] **T4 — CF Pages error routing for 5xx** (AC: 2)
  - [ ] T4.1 Decide between `_routes.json` directives and CF Pages dashboard custom error pages
  - [ ] T4.2 Implement and verify with a deliberate failing API route on a preview deploy
  - [ ] T4.3 Document the choice in README under the existing `## Hosting` section from Story 1.2
- [ ] **T5 — Verification**
  - [ ] T5.1 Local: `npm run dev`, hit a non-existent path, confirm 404 page renders
  - [ ] T5.2 Preview deploy: `curl -I https://<preview>/does-not-exist` → expect HTTP/2 404
  - [ ] T5.3 Preview deploy: trigger the deliberate 500 → expect HTTP/2 500
  - [ ] T5.4 Lighthouse a11y on `/404` ≥90

## Dev Notes

### Architecture compliance

- Reuses **Story 1.4** `BaseLayout` and brand tokens from **Story 1.3**
- FR56 (branded error pages with nav-back CTAs)
- NFR19 / NFR20 (WCAG 2.1 AA), NFR21 (keyboard nav), NFR22 (heading hierarchy)
- UX-DR25 (focus indicators)

### Critical do-not-do list

- **Do NOT** introduce a new layout. Reuse `BaseLayout`.
- **Do NOT** add JS / React islands. Error pages must be pure static HTML so they render even if the JS bundle fails to load.
- **Do NOT** localise strings here — Story 1.6 wires i18n. Hardcoded English is fine for V1; Epic 5 / V1.2 will swap.

### Testing requirements

- Manual + `curl -I` per AC1 / AC2
- Lighthouse a11y ≥90 on `/404`

### Project Structure Notes

New files:

```
src/pages/404.astro
src/pages/500.astro
```

Possibly modified:

```
public/_routes.json   ← or CF Pages dashboard config (document the choice)
README.md             ← document 5xx routing under ## Hosting
```

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 1.5" lines 684–704]
- FR56 in PRD
- Brand voice: `_bmad-output/planning-artifacts/branding-truvis.md`

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
