# Story 3.2: Provision Cloudflare Turnstile and wire site + secret keys

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **Cristian (the developer)**,
I want **Cloudflare Turnstile provisioned in invisible (managed) mode with both site and secret keys wired through `src/lib/env.ts`**,
so that **the waitlist form in Story 3.4 can embed the Turnstile widget and the API route in Story 3.3 can verify tokens server-side, without user-facing friction or secret leakage into the client bundle**.

## Context & scope

This is the **second story of Epic 3** (Waitlist Capture & Confirmation Flow). It provisions Cloudflare Turnstile — the invisible, privacy-friendly, CF-native anti-spam layer selected by AR13 — and wires the keys into the project's typed environment system. It is **independent from Story 3.1** (Loops ESP provisioning) and can be implemented in parallel. It is a **prerequisite for Story 3.3** (POST `/api/waitlist` route, which calls `siteverify`) and **Story 3.4** (form island, which loads the Turnstile widget script).

Scope boundaries:
- **In scope:** Creating the Turnstile site in the CF dashboard (invisible managed mode), configuring allowed hostnames, storing both keys as CF Pages env vars, adding a typed `getTurnstileConfig()` accessor to `src/lib/env.ts`, writing a Vitest unit test for that accessor, creating `docs/integrations/turnstile.md` with local-dev test keys and lazy-loading strategy documentation for the Story 3.4 implementer.
- **Out of scope:** Loading the Turnstile script on the client (Story 3.4), server-side token verification logic (Story 3.3), the waitlist form UI (Story 3.4), the honeypot field (Story 3.4), wiring Turnstile into the CTA slots (Story 3.5). Do **not** introduce these.

## Acceptance Criteria

### AC1 — Turnstile site created in invisible (managed) mode with correct allowed hostnames

**Given** AR13 selects Cloudflare Turnstile as the layer-2 anti-spam mechanism and NFR15 requires no user-facing friction (UX-DR16),
**When** the developer creates a Turnstile site in the Cloudflare dashboard,
**Then**
- the Turnstile widget type is **invisible (managed)** — NOT interactive checkbox, NOT non-interactive challenge,
- allowed hostnames include: the production domain (`truvis.app`), the `*.pages.dev` preview pattern (e.g., `truvis-landing-page.pages.dev`), and `localhost`,
- both `TURNSTILE_SITE_KEY` (the public site key) and `TURNSTILE_SECRET_KEY` (the private secret key) are captured from the CF dashboard for use in subsequent tasks.

### AC2 — Keys stored in CF Pages env vars with correct visibility scoping

**Given** NFR12 requires that secret keys never appear in the client bundle and the architecture requires all env vars provisioned per environment in CF Pages (Story 1.2),
**When** the developer stores the Turnstile keys in CF Pages,
**Then**
- `PUBLIC_TURNSTILE_SITE_KEY` is stored as a **public** env var in both **preview** and **production** environments in CF Pages (the `PUBLIC_` prefix is required because the client-side Turnstile widget needs the site key),
- `TURNSTILE_SECRET_KEY` is stored as a **secret** (encrypted) env var in both **preview** and **production** environments in CF Pages (no `PUBLIC_` prefix — never exposed to client code),
- `.env.example` already contains both `PUBLIC_TURNSTILE_SITE_KEY=` and `TURNSTILE_SECRET_KEY=` entries (verified, no edit needed).

### AC3 — Typed accessor `getTurnstileConfig()` added to `src/lib/env.ts`

**Given** the architecture requires all env access through `src/lib/env.ts` (CLAUDE.md anti-pattern: no `process.env` / `import.meta.env` outside `lib/`),
**When** the developer adds a `getTurnstileConfig()` function to `src/lib/env.ts`,
**Then**
- the function returns `{ siteKey: string; secretKey: string }`,
- internally it uses the existing `getRequired()` helper: `getRequired('PUBLIC_TURNSTILE_SITE_KEY')` for `siteKey` and `getRequired('TURNSTILE_SECRET_KEY')` for `secretKey`,
- if either key is missing or empty, `getRequired()` throws a descriptive error at build time (the existing `getRequired()` behaviour satisfies this — no additional error handling needed),
- the function is exported and available for Story 3.3 (server-side verification) and Story 3.4 (client widget site key),
- for local dev, developers use the Cloudflare-published "always passes" test keys in their `.env` file (documented in AC4).

### AC4 — Local dev documentation with test keys and security warning

**Given** developers need to run the waitlist form locally without a real Turnstile site,
**When** the developer creates `docs/integrations/turnstile.md`,
**Then**
- the document specifies the Cloudflare-published "always passes" test keys:
  - Test site key: `1x00000000000000000000AA`
  - Test secret key: `1x0000000000000000000000000000000AA`
- the document includes an explicit warning that test keys must **never** be used in preview or production environments — only in local `.env`,
- the document explains how to add the keys to the local `.env` file (copy from `.env.example`, fill in test values),
- the document references the Cloudflare Turnstile documentation for additional test key variants (always fails, forces interactive challenge, etc.).

### AC5 — Lazy loading strategy and Turnstile script URL documented for Story 3.4

**Given** NFR5 requires total initial page weight under 500 KB and the Turnstile script (~30 KB) must not be loaded globally,
**When** the developer documents the loading strategy in `docs/integrations/turnstile.md`,
**Then**
- the document records the Turnstile script URL: `https://challenges.cloudflare.com/turnstile/v0/api.js`,
- the document specifies that the script is loaded **lazily** — only when the waitlist form island becomes visible (via `client:visible` hydration in Story 3.4), not as a global `<script>` in `<head>` or `BaseLayout`,
- the document records the Turnstile render pattern: the widget renders invisibly inside a container `<div>` using `turnstile.render()` with the site key and a callback,
- the document records the server-side verification endpoint: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with `{ secret, response }` body,
- the document notes that Story 3.4 owns the client-side implementation and Story 3.3 owns the server-side verification — this story only provisions the keys and documents the integration pattern.

## Tasks / Subtasks

- [ ] **Task 1 — Create Turnstile site in CF dashboard** (AC1)
  - [ ] 1.1 Navigate to Cloudflare Dashboard → Turnstile → Add Site.
  - [ ] 1.2 Set widget type to **Invisible (Managed)** — NOT interactive checkbox.
  - [ ] 1.3 Set site name to `truvis-landing-page` (or similar descriptive name).
  - [ ] 1.4 Configure allowed hostnames: `truvis.app`, `truvis-landing-page.pages.dev`, `localhost`.
  - [ ] 1.5 Capture the generated site key and secret key.

- [ ] **Task 2 — Store keys in CF Pages env vars** (AC2)
  - [ ] 2.1 In CF Pages → Settings → Environment Variables → Production: add `PUBLIC_TURNSTILE_SITE_KEY` (plaintext) with the real site key.
  - [ ] 2.2 In CF Pages → Settings → Environment Variables → Production: add `TURNSTILE_SECRET_KEY` (encrypt/secret) with the real secret key.
  - [ ] 2.3 Repeat for the Preview environment with the same values.
  - [ ] 2.4 Verify `.env.example` already contains both entries — confirm no edit needed.

- [ ] **Task 3 — Add `getTurnstileConfig()` to `src/lib/env.ts`** (AC3)
  - [ ] 3.1 Add the exported function `getTurnstileConfig()` that returns `{ siteKey: string; secretKey: string }`.
  - [ ] 3.2 Implement using existing `getRequired('PUBLIC_TURNSTILE_SITE_KEY')` for `siteKey` and `getRequired('TURNSTILE_SECRET_KEY')` for `secretKey`.
  - [ ] 3.3 Add a JSDoc comment explaining the two keys' visibility scoping (site key is client-readable via `PUBLIC_` prefix; secret key is server-only).
  - [ ] 3.4 Verify `npx astro check` passes after the addition.

- [ ] **Task 4 — Add Vitest unit test for `getTurnstileConfig()`** (AC3)
  - [ ] 4.1 Add test cases to `tests/lib/env.test.ts` (or create if it does not exist).
  - [ ] 4.2 Test: when both env vars are set, `getTurnstileConfig()` returns `{ siteKey, secretKey }` with correct values.
  - [ ] 4.3 Test: when `PUBLIC_TURNSTILE_SITE_KEY` is missing, `getTurnstileConfig()` throws with a descriptive error mentioning the variable name.
  - [ ] 4.4 Test: when `TURNSTILE_SECRET_KEY` is missing, `getTurnstileConfig()` throws with a descriptive error mentioning the variable name.
  - [ ] 4.5 Test: when both are missing, `getTurnstileConfig()` throws (for the first missing key).
  - [ ] 4.6 Verify `npx vitest run` passes with all new tests green.

- [ ] **Task 5 — Create `docs/integrations/turnstile.md`** (AC4, AC5)
  - [ ] 5.1 Create `docs/integrations/` directory if it does not exist.
  - [ ] 5.2 Write the local dev section: test keys, `.env` setup instructions, security warning about test keys in non-local environments.
  - [ ] 5.3 Write the integration architecture section: Turnstile script URL, lazy loading strategy rationale (NFR5), render pattern, server-side verification endpoint.
  - [ ] 5.4 Document which downstream stories own which integration pieces (Story 3.3 = server verification, Story 3.4 = client widget).
  - [ ] 5.5 Reference Cloudflare's official Turnstile documentation URLs for additional test key variants and API reference.

- [ ] **Task 6 — Build, lint, type-check, test verification** (all ACs)
  - [ ] 6.1 `npx astro check` — 0 errors.
  - [ ] 6.2 `npx eslint .` — clean (or only pre-existing warnings).
  - [ ] 6.3 `npx prettier --check .` — clean.
  - [ ] 6.4 `npx vitest run` — all tests pass including the new `getTurnstileConfig()` tests.
  - [ ] 6.5 `npm run build` — clean.

## Dev Notes

### Architecture compliance — the non-negotiables

- **All env access through `src/lib/env.ts`.** The new `getTurnstileConfig()` accessor uses the existing `getRequired()` helper internally. No direct `import.meta.env` or `process.env` access anywhere else. [Source: CLAUDE.md § Anti-patterns; NFR12]
- **NFR12: No secrets in client bundle.** `TURNSTILE_SECRET_KEY` has no `PUBLIC_` prefix — Astro strips it from client bundles at build time. The `getTurnstileConfig()` accessor returns both keys, but consumers must only pass `siteKey` to client code and `secretKey` to server-side code. Story 3.3 (server route) uses `secretKey`; Story 3.4 (React island) receives only `siteKey` as a prop from the Astro parent. [Source: AR12; NFR12]
- **NFR15: No user-facing friction.** Invisible (managed) mode means the Turnstile widget renders with zero visible UI — no checkbox, no challenge. The user never sees it. [Source: AR13; UX-DR16]
- **NFR5: Lazy loading to protect 500 KB budget.** The Turnstile script (~30 KB) is NOT loaded globally. It is loaded only when the waitlist form island hydrates (via `client:visible` in Story 3.4). This story documents the pattern; Story 3.4 implements it. [Source: NFR5; lighthouse/budget.json]
- **AR13: Two-layer anti-spam.** Layer 1 is a honeypot field (Story 3.4). Layer 2 is Cloudflare Turnstile (this story provisions the keys; Story 3.3 verifies server-side; Story 3.4 renders client-side). Both layers are invisible to the user. [Source: architecture-truvis-landing-page.md § Decision 2c]

### Implementation guidance for `getTurnstileConfig()`

The function is intentionally simple — a thin wrapper around two `getRequired()` calls. The existing `getRequired()` already throws a descriptive error (`[env] Required environment variable "..." is not set. See .env.example for the full inventory.`) when a key is missing or empty. No additional error handling, validation, or type narrowing is needed.

```typescript
/**
 * Cloudflare Turnstile configuration — Story 3.2 (AR13, NFR12, NFR15)
 *
 * Returns the site key (client-readable, PUBLIC_ prefixed) and the
 * secret key (server-only, no PUBLIC_ prefix). Consumers MUST pass
 * only `siteKey` to client code; `secretKey` is for server-side
 * `siteverify` calls only.
 */
export function getTurnstileConfig(): { siteKey: string; secretKey: string } {
  return {
    siteKey: getRequired('PUBLIC_TURNSTILE_SITE_KEY'),
    secretKey: getRequired('TURNSTILE_SECRET_KEY'),
  };
}
```

### Cloudflare Turnstile test keys (for local development)

Cloudflare publishes "always passes" test keys for local development:
- **Test site key:** `1x00000000000000000000AA`
- **Test secret key:** `1x0000000000000000000000000000000AA`

These keys make the Turnstile widget always return a valid token and the `siteverify` endpoint always return `success: true`. They must NEVER be used in preview or production — only in the developer's local `.env` file.

Additional Cloudflare test keys (for edge-case testing in Stories 3.3/3.4):
- **Always fails** site key: `2x00000000000000000000AB` / secret key: `2x0000000000000000000000000000000AB`
- **Forces interactive challenge** site key: `3x00000000000000000000FF` / secret key: `3x0000000000000000000000000000000FF`

### Turnstile integration pattern (reference for Stories 3.3 and 3.4)

- **Script URL:** `https://challenges.cloudflare.com/turnstile/v0/api.js`
- **Client render:** `turnstile.render('#container', { sitekey: '...', callback: (token) => { ... } })` — the widget is invisible; no visible element appears.
- **Server verify:** `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with JSON body `{ secret: '...', response: '<token-from-client>' }` — returns `{ success: boolean, ... }`.
- **Loading strategy:** The script tag is injected dynamically by the `WaitlistForm` React island (Story 3.4) when it mounts — NOT as a static `<script>` in `<head>` or `BaseLayout`. This keeps the Turnstile script out of the initial page load, protecting the NFR5 500 KB budget.

### Previous-story intelligence

- **Story 1.2** provisioned CF Pages env vars per environment (preview + production) with placeholder values for `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. This story replaces the placeholders with real keys from the newly created Turnstile site. [Source: 1-2-provision-cloudflare-pages-and-ci-cd-with-lighthouse-budget-gates.md § T2.3]
- **Story 1.7** codified the typed env accessor pattern (`getRequired`, `getOptional`, `parseBoolean`) in `src/lib/env.ts`. This story extends that file with `getTurnstileConfig()`. [Source: src/lib/env.ts]
- **Story 3.1** (parallel) provisions Loops ESP keys. Independent — no code overlap.

### Cross-story contracts

- **Story 3.3** (POST `/api/waitlist` route) is the direct downstream consumer of `secretKey`. It will call `getTurnstileConfig().secretKey` to verify the Turnstile token server-side via the `siteverify` endpoint.
- **Story 3.4** (EmailCaptureBlock / WaitlistForm island) is the direct downstream consumer of `siteKey`. The Astro parent will call `getTurnstileConfig().siteKey` and pass it as a prop to the React island. The island dynamically loads the Turnstile script and calls `turnstile.render()` with the site key.
- **Story 3.5** (wire CTA slots) composes the form island into the three CTA slot positions. It does not directly consume Turnstile keys.

### Files you will create / modify

**Create:**
- `docs/integrations/turnstile.md`

**Modify:**
- `src/lib/env.ts` (add `getTurnstileConfig()` function)
- `tests/lib/env.test.ts` (add unit tests for `getTurnstileConfig()`)

**Do NOT touch:**
- `src/components/sections/*` — no section changes in this story
- `src/components/islands/*` — no island changes in this story
- `src/pages/*` — no page changes in this story
- `src/lib/stores/*`
- `src/layouts/*`
- `src/i18n/*`
- `src/styles/global.css`
- `.env.example` (already has the entries)
- `package.json` (no new dependencies)
- `astro.config.mjs`
- `tailwind.config.ts`
- `lighthouse/budget.json`

### Anti-patterns to avoid (LLM mistake prevention)

- Do NOT add `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` anywhere outside `src/lib/env.ts`. All access goes through `getTurnstileConfig()`.
- Do NOT add the Turnstile `<script>` tag to `BaseLayout.astro` or any `<head>`. The script is loaded lazily by the form island in Story 3.4.
- Do NOT create a Turnstile widget component, a React hook for Turnstile, or any client-side Turnstile integration. That is Story 3.4's scope.
- Do NOT add server-side token verification logic. That is Story 3.3's scope.
- Do NOT add the test keys to `.env.example` — `.env.example` contains empty values only. Test keys go in the developer's local `.env` (git-ignored) and in `docs/integrations/turnstile.md`.
- Do NOT expose `secretKey` in any client-readable context (no `PUBLIC_` prefix, no passing as a prop to a React island, no embedding in HTML).
- Do NOT create a `src/lib/turnstile.ts` module — the typed accessor lives in `src/lib/env.ts` alongside the other env helpers (single source of truth per concern).
- Do NOT add conditional logic to `getTurnstileConfig()` that returns test keys when `NODE_ENV === 'development'`. The function always reads from the env — developers configure their local `.env` with test keys.
- Do NOT edit `.env.example` to add comments or reformat — it was finalised in Story 1.7.

### Project Structure Notes

- **Alignment with unified structure:** New function in `src/lib/env.ts` (existing file), new tests in `tests/lib/env.test.ts` (existing or new file in established test directory), new documentation in `docs/integrations/turnstile.md` (new directory and file). No new source directories under `src/`. No new dependencies.
- **Small code footprint:** This story's code change is ~10 lines in `env.ts` and ~40 lines of tests. The bulk of the work is CF dashboard provisioning and documentation.

### References

- [Source: architecture-truvis-landing-page.md § Decision 2c — Anti-Spam (AR13: two-layer anti-spam, Turnstile as layer 2)]
- [Source: epics-truvis-landing-page.md § Story 3.2 — complete BDD acceptance criteria]
- [Source: prd-truvis-landing-page.md § NFR5 (initial weight < 500 KB), NFR12 (no client-side credentials), NFR15 (anti-spam without friction)]
- [Source: CLAUDE.md § Anti-patterns (env access only through lib/env.ts)]
- [Source: src/lib/env.ts — existing typed env helpers (getRequired, getOptional, parseBoolean)]
- [Source: .env.example — existing entries for PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY]
- [Source: _bmad-output/implementation-artifacts/1-2-provision-cloudflare-pages-and-ci-cd-with-lighthouse-budget-gates.md § T2.3 — CF Pages env var provisioning]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — env.ts pattern]
- [Cloudflare Turnstile docs: https://developers.cloudflare.com/turnstile/]
- [Cloudflare Turnstile test keys: https://developers.cloudflare.com/turnstile/troubleshooting/testing/]

## Dev Agent Record

### Agent Model Used

<!-- filled after implementation -->

### Debug Log References

<!-- filled after implementation -->

### Completion Notes List

<!-- filled after implementation -->

### File List

<!-- filled after implementation -->

### Change Log

| Date | Change |
| ---- | ------ |
| 2026-04-15 | Story file created. Status: ready-for-dev. |
