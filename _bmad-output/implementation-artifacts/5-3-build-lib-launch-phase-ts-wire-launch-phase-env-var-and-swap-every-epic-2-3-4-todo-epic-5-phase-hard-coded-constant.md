# Story 5.3: Build `lib/launch-phase.ts`, wire `LAUNCH_PHASE` env var and swap every Epic 2/3/4 `TODO(epic-5-phase)` hard-coded constant

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **Cristian**,
I want **a single, typed, well-tested `isPostLaunch()` helper that reads the `LAUNCH_PHASE` env var at build time, and every hard-coded `'pre'` constant scattered through Epic 2/3/4 replaced with a call to that helper**,
so that **flipping pre/post-launch is a single env-var change and the codebase has exactly one source of truth for phase state**.

## Context & scope

This is the **third story of Epic 5**. It creates the `LAUNCH_PHASE` mechanism that the architecture document (AR16) designates as the single source of truth for pre/post-launch state. Currently, several components use hard-coded `'pre'` assumptions with `TODO(epic-5)` markers. This story replaces all of them with real `isPostLaunch()` calls.

The helper reads `LAUNCH_PHASE` at build time via `lib/env.ts`. The value is fixed per build — switching phases requires a redeploy, not a runtime toggle.

Scope boundaries:
- **In scope:** Create `src/lib/launch-phase.ts`, write Vitest tests, sweep and replace all `TODO(epic-5)` phase markers in `src/`, update `lib/content.ts` phase defaults (from Story 5.1), update `.env.example`, create `docs/integrations/launch-phase.md`, add CI matrix build for both phases, update `docs/design-conventions.md`.
- **Out of scope:** Swapping content reads to collection data (Story 5.4 — but this story wires the phase mechanism those reads will use), Keystatic admin UI (Story 5.2), post-launch content authoring (Epic 8).

## Acceptance Criteria

### AC1 — `src/lib/launch-phase.ts` created with typed helpers

**Given** AR16 mandates a single `LAUNCH_PHASE` env var (`'pre' | 'post'`) read at build time via `lib/launch-phase.ts`,
**When** I create the module,
**Then**

- the module exports `isPostLaunch(): boolean` and `getLaunchPhase(): 'pre' | 'post'`,
- both helpers read the env var exactly once at module load via `lib/env.ts` (not directly via `import.meta.env`),
- if `LAUNCH_PHASE` is missing in `production`, the build **throws** with message `Missing required env var LAUNCH_PHASE — must be 'pre' or 'post'`,
- if `LAUNCH_PHASE` is any value other than `'pre'` or `'post'`, the build throws,
- if `LAUNCH_PHASE` is missing in local `dev`, the helper defaults to `'pre'` with a single dev-only console warning.

### AC2 — Single-entry-point enforcement

**Given** the helper is the only sanctioned way to read phase state per AR16,
**When** I enforce the rule,
**Then**

- `docs/design-conventions.md` gains an entry: "Phase state. Do not read `import.meta.env.LAUNCH_PHASE` or `process.env.LAUNCH_PHASE` outside of `lib/launch-phase.ts`. Call `isPostLaunch()` from components.",
- an ESLint rule or code-review checklist line flags `LAUNCH_PHASE` occurrences outside `lib/launch-phase.ts` and `lib/env.ts`.

### AC3 — Vitest unit tests

**Given** correctness of phase switching is load-bearing for launch day,
**When** I write tests at `tests/launch-phase.test.ts`,
**Then**

- tests cover: `'pre'` → `isPostLaunch()` returns `false`, `'post'` → returns `true`, missing in prod → throws, invalid value → throws, missing in dev → defaults to `'pre'` with warning.

### AC4 — All `TODO(epic-5)` phase markers replaced

**Given** Epic 2/3/4 stories left `TODO(epic-5)` markers where phase-conditional logic was needed,
**When** I sweep the repo,
**Then**

- every `TODO(epic-5)` marker related to phase switching is replaced by a real `isPostLaunch()` call,
- specifically:
  - **`src/components/sections/social-proof-section.astro` (line 77)**: the commented-out `isPostLaunch()` block becomes real code — import `isPostLaunch` from `@/lib/launch-phase`, compute `phase`, pass to content helpers or conditionally render pre/post variants,
  - **Any `LAUNCH_PHASE_V1 = 'pre'` constants** in blog CTA or other components are deleted and replaced with `isPostLaunch()` branches,
- every replacement includes a brief comment explaining the two branches,
- **Note**: The `TODO(epic-5)` markers related to content collection reads (lines 23, 44 in social-proof and faq sections, line 10 in index.astro) are **Story 5.4's scope** — this story only resolves phase-toggle markers.

### AC5 — `lib/content.ts` phase defaults updated

**Given** Story 5.1's `getTestimonials(phase?)` and `getStats(phase?)` used a hard-coded `'pre'` default with a TODO comment,
**When** I update `lib/content.ts`,
**Then**

- the default parameters now call `isPostLaunch() ? 'post' : 'pre'` instead of hard-coded `'pre'`,
- the `TODO(epic-5-phase)` comments at those default sites are removed.

### AC6 — `.env.example` and documentation updated

**Given** Cloudflare Pages env vars are per-scope,
**When** I update documentation,
**Then**

- `.env.example` has `LAUNCH_PHASE=pre` with a comment explaining allowed values (`pre` | `post`),
- `docs/integrations/launch-phase.md` is created describing: how to flip the flag (Cloudflare Pages dashboard → Settings → Environment variables → change value → trigger redeploy), expected rebuild time (<5 min per NFR30), and that the flip is a redeploy not a code change.

### AC7 — CI matrix build for both phases

**Given** correctness must be verified for both phases,
**When** I add CI verification,
**Then**

- the CI job gains a matrix run that builds with `LAUNCH_PHASE=pre` and `LAUNCH_PHASE=post`,
- both builds must succeed (no type errors, no missing-content errors),
- any build-time error related to missing post-launch content (e.g., `appStoreUrls.ios` still blank) is surfaced clearly — this is desired behaviour: post-launch builds fail fast if required content is missing.

## Tasks / Subtasks

- [ ] **Task 1 — Create `src/lib/launch-phase.ts`** (AC: 1)
  - [ ] T1.1 Import `getOptional` from `@/lib/env` (not `getRequired`, since dev mode should be lenient)
  - [ ] T1.2 Read `LAUNCH_PHASE` via `getOptional('LAUNCH_PHASE', '')` at module load
  - [ ] T1.3 Implement validation: if value is empty and `import.meta.env.PROD === true` → throw descriptive error. If value is not `'pre'` or `'post'` and not empty → throw. If empty in dev → default to `'pre'` with `console.warn('[launch-phase] LAUNCH_PHASE not set, defaulting to "pre"')`
  - [ ] T1.4 Export `getLaunchPhase(): 'pre' | 'post'` that returns the validated value
  - [ ] T1.5 Export `isPostLaunch(): boolean` that returns `getLaunchPhase() === 'post'`
  - [ ] T1.6 Store the resolved value in a module-level `const` so the env var is read only once

- [ ] **Task 2 — Write Vitest tests** (AC: 3)
  - [ ] T2.1 Create `tests/launch-phase.test.ts`
  - [ ] T2.2 Test: `LAUNCH_PHASE=pre` → `isPostLaunch()` returns `false`, `getLaunchPhase()` returns `'pre'`
  - [ ] T2.3 Test: `LAUNCH_PHASE=post` → `isPostLaunch()` returns `true`, `getLaunchPhase()` returns `'post'`
  - [ ] T2.4 Test: `LAUNCH_PHASE` missing + `PROD=true` → throws with descriptive message
  - [ ] T2.5 Test: `LAUNCH_PHASE=invalid` → throws
  - [ ] T2.6 Test: `LAUNCH_PHASE` missing + `PROD=false` → defaults to `'pre'`, emits console warning
  - [ ] T2.7 Use `vi.stubEnv()` or `process.env` manipulation for env var mocking. Reset module cache between tests via `vi.resetModules()` since the module reads the env var at load time

- [ ] **Task 3 — Sweep and replace `TODO(epic-5)` phase markers** (AC: 4)
  - [ ] T3.1 Replace `src/components/sections/social-proof-section.astro` line 77 TODO: uncomment and wire `isPostLaunch()` — import `{ isPostLaunch } from '@/lib/launch-phase'`, compute `const phase = isPostLaunch() ? 'post' : 'pre'`, use phase value in the conditional render logic. Add comment explaining pre vs post branch
  - [ ] T3.2 Search for any `LAUNCH_PHASE_V1` constants or similar hard-coded phase values across the codebase and replace with `isPostLaunch()` calls
  - [ ] T3.3 Do NOT touch `TODO(epic-5)` markers that are about content collection reads (social-proof line 23, faq-section line 44, index.astro line 10) — those are Story 5.4 scope
  - [ ] T3.4 After sweep, verify with `grep -r 'TODO(epic-5-phase)' src/` that no phase-related TODOs remain (content-related TODOs may still exist)

- [ ] **Task 4 — Update `lib/content.ts` phase defaults** (AC: 5)
  - [ ] T4.1 Import `{ isPostLaunch } from '@/lib/launch-phase'` in `src/lib/content.ts`
  - [ ] T4.2 Change `getTestimonials(phase?: 'pre' | 'post')` default from hard-coded `'pre'` to `isPostLaunch() ? 'post' : 'pre'`
  - [ ] T4.3 Change `getStats(phase?: 'pre' | 'post')` default similarly
  - [ ] T4.4 Remove the `// TODO(epic-5-phase)` comments at those sites

- [ ] **Task 5 — Update docs and `.env.example`** (AC: 2, 6)
  - [ ] T5.1 Add phase-state rule to `docs/design-conventions.md`: "Phase state. Do not read `import.meta.env.LAUNCH_PHASE` outside of `lib/launch-phase.ts`. Call `isPostLaunch()` from components."
  - [ ] T5.2 Verify `.env.example` already has `LAUNCH_PHASE=pre` (it does — line 26). If not, add it. Update the comment to include allowed values and a reference to `src/lib/launch-phase.ts`
  - [ ] T5.3 Create `docs/integrations/launch-phase.md` with: how to flip the flag (CF Pages dashboard steps), expected rebuild time, and that the flip is a redeploy

- [ ] **Task 6 — Add CI matrix build for both phases** (AC: 7)
  - [ ] T6.1 Edit `.github/workflows/ci.yml` to add a matrix strategy on the build step: `matrix: { launch_phase: ['pre', 'post'] }`
  - [ ] T6.2 Set `LAUNCH_PHASE` env var from the matrix value for the build step
  - [ ] T6.3 Both builds must pass — if `LAUNCH_PHASE=post` fails due to missing post-launch content, that is expected and acceptable at V1 (the content is blank). Handle this by ensuring the siteContent schema allows empty optional post-launch fields

- [ ] **Task 7 — Build verification** (AC: 1)
  - [ ] T7.1 Run `astro build` with `LAUNCH_PHASE=pre` — must succeed
  - [ ] T7.2 Run `astro build` with `LAUNCH_PHASE=post` — must succeed (or document expected failures if post-launch content is incomplete)
  - [ ] T7.3 Run `astro check` — zero errors
  - [ ] T7.4 Run `npx vitest run` — all tests pass including new launch-phase tests
  - [ ] T7.5 Run `npx eslint .` and `npx prettier --check .`

## Dev Notes

### Implementation approach

**Module-level evaluation**: The env var is read once at module load, not on every `isPostLaunch()` call. This is safe because Astro rebuilds the entire site when env vars change — there's no scenario where the value changes mid-build.

```ts
// src/lib/launch-phase.ts
import { getOptional } from '@/lib/env';

const raw = getOptional('LAUNCH_PHASE', '');

function resolve(): 'pre' | 'post' {
  if (raw === 'pre' || raw === 'post') return raw;
  
  if (raw === '') {
    // Check if we're in production
    const isProd = typeof import.meta !== 'undefined' 
      && import.meta.env?.PROD === true;
    if (isProd) {
      throw new Error(
        'Missing required env var LAUNCH_PHASE — must be \'pre\' or \'post\''
      );
    }
    console.warn('[launch-phase] LAUNCH_PHASE not set, defaulting to "pre"');
    return 'pre';
  }
  
  throw new Error(
    `Invalid LAUNCH_PHASE value "${raw}" — must be 'pre' or 'post'`
  );
}

const phase = resolve();

export function getLaunchPhase(): 'pre' | 'post' {
  return phase;
}

export function isPostLaunch(): boolean {
  return phase === 'post';
}
```

**Testing strategy**: Since the module reads the env var at load time, tests must use `vi.resetModules()` before each test and dynamically import the module to get fresh evaluation. Use `vi.stubEnv('LAUNCH_PHASE', 'pre')` or direct `process.env` assignment.

**Exact TODO markers to resolve (verified via grep)**:
1. `src/components/sections/social-proof-section.astro:77` — `TODO(epic-5): once src/lib/launch-phase.ts ships (Story 5.3)` — this is the phase-toggle TODO
2. No `TODO(epic-5-phase)` markers exist — the codebase uses `TODO(epic-5)` for all Epic 5 items

**TODOs to leave alone (Story 5.4 scope)**:
1. `src/components/sections/social-proof-section.astro:23` — `TODO(epic-5): source stats + testimonial from Content Collections`
2. `src/components/sections/faq-section.astro:44` — `TODO(epic-5): source FAQ items from the faq Content Collection`
3. `src/pages/index.astro:10` — `TODO(epic-5): wire real social URLs inside <Footer>`

**CI matrix considerations**: The `LAUNCH_PHASE=post` build may fail if `siteContent` has required post-launch fields that are empty in the seed data. Ensure the Zod schema for `siteContent` makes post-launch fields optional (they are — `postLaunchHeadline`, `postLaunchSubheadline` are `z.string().optional()` per Story 5.1). The build should succeed in both modes.

### Current codebase state (verified)

- `src/lib/launch-phase.ts` does NOT exist — create from scratch
- `src/lib/env.ts` has `getOptional(key, fallback)` at line 66-69 — use this
- `.env.example` already lists `LAUNCH_PHASE=pre` at line 26
- `src/lib/content.ts` should exist after Story 5.1 with `getTestimonials(phase?)` and `getStats(phase?)` using hard-coded `'pre'` defaults
- Four `TODO(epic-5)` markers in `src/` — only one (social-proof line 77) is phase-toggle related
- No `TODO(epic-5-phase)` or `LAUNCH_PHASE_V1` patterns found in codebase

### Architecture compliance

- **AR16**: Single `LAUNCH_PHASE` env var + `lib/launch-phase.ts` helper — this story implements it
- **Env var convention**: Read only via `lib/env.ts`, never directly via `import.meta.env` in components
- **Single source of truth**: Components call `isPostLaunch()`, never read the env var directly
- **Three-tier hierarchy**: `lib/launch-phase.ts` is a shared utility (Lib tier). No tier violations
- **NFR5 (500KB budget)**: No client-side impact — phase is resolved at build time. `isPostLaunch()` is tree-shaken away in the static output
- **NFR30 (<5 min rebuild)**: Phase flip is an env var change + rebuild. No code change needed

### Dependencies

- **Story 5.1** (`src/lib/content.ts` exists with `getTestimonials(phase?)` and `getStats(phase?)` that need default parameter update)
- **Story 1.7** (`src/lib/env.ts` exists with `getOptional()`)
- **Story 1.2** (CI workflow at `.github/workflows/ci.yml` — extend with matrix build)

### Existing patterns to follow

- **env.ts helpers**: See `getOptional()` at line 66-69, `getRequired()` at line 50-59 for error-throwing pattern
- **Test patterns**: See `tests/api/micro-survey.test.ts` for Vitest mocking patterns
- **Convention docs**: See `docs/design-conventions.md` for format of convention entries

### Project Structure Notes

New files:

```
src/lib/launch-phase.ts                     <- isPostLaunch() + getLaunchPhase() helpers
tests/launch-phase.test.ts                  <- Vitest unit tests
docs/integrations/launch-phase.md           <- How to flip the phase flag
```

Modified files:

```
src/lib/content.ts                          <- Update getTestimonials/getStats phase defaults
src/components/sections/social-proof-section.astro  <- Replace TODO(epic-5) phase marker with real isPostLaunch() call
docs/design-conventions.md                  <- Add phase-state convention entry
.env.example                               <- Update LAUNCH_PHASE comment if needed
.github/workflows/ci.yml                    <- Add LAUNCH_PHASE matrix build
```

### References

- [Source: epics-truvis-landing-page.md#Story 5.3 — Full acceptance criteria (lines 1896-1937)]
- [Source: architecture-truvis-landing-page.md#AR16 — LAUNCH_PHASE env var + lib/launch-phase.ts helper]
- [Source: architecture-truvis-landing-page.md#1c — Pre/post-launch content toggle decision]
- [Source: architecture-truvis-landing-page.md#Implementation Patterns — Pre/post-launch toggle in components (lines 787-801)]
- [Source: prd-truvis-landing-page.md#FR53 — Pre/post-launch feature flag mechanism]
- [Source: prd-truvis-landing-page.md#NFR30 — Content publish → rebuild + deploy <5 min]
- [Source: src/lib/env.ts — getOptional() helper (line 66-69)]
- [Source: src/components/sections/social-proof-section.astro — TODO(epic-5) phase marker (line 77)]
- [Source: .env.example — LAUNCH_PHASE already listed (line 26)]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
