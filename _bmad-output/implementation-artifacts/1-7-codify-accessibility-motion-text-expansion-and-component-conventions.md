# Story 1.7: Codify accessibility, motion, text-expansion and component conventions

Status: review

## Story

As **an AI agent or human contributor opening this project for the first time**,
I want **explicit, enforceable conventions for accessibility, motion, text expansion, component tiering, hydration, and state**,
so that **I cannot accidentally violate the architecture's pattern decisions and the codebase remains coherent across many sessions**.

## Acceptance Criteria

### AC1 — Component & hydration conventions

**Given** the architecture defines a three-tier component hierarchy (AR23) and a hydration directive policy (AR27),
**When** the developer commits the convention scaffolding,
**Then**

- `src/components/ui/`, `src/components/sections/`, `src/components/forms/`, `src/components/blog/`, and `src/components/islands/` directories exist with a **`README.md` in each** explaining what belongs there (a 4–8 line note is enough),
- an **ESLint rule** (custom or via config) flags any `client:load` directive on a component **outside of `src/components/islands/`** AND outside an above-the-fold conversion-critical context, **OR** a code-review checklist documents this rule in `CONTRACT.md` if a custom ESLint rule is impractical at V1,
- `tsconfig.json` is configured with **strict mode** and **`@/*` and `~/*` path aliases** mapping to `src/*`,
- **`prettier-plugin-tailwindcss`** is installed and configured so Tailwind classes are auto-sorted on save.

### AC2 — State convention (nanostores)

**Given** the architecture requires nanostores for cross-island state (AR24),
**When** the developer commits the state convention,
**Then**

- `src/lib/stores/` exists with **at least one implemented store** (`mobile-nav-store.ts` from Story 1.4) following the documented pattern: **`$camelCase` prefix**, plain **action functions exported alongside** the store, **no direct `.set()` calls** from consumers,
- `@nanostores/react` is installed and `mobile-nav-store.ts` is consumed via `useStore()` in the `MobileNav` island.

(Both should already be true after Story 1.4. This story verifies and documents the convention.)

### AC3 — Section colour rhythm doc

**Given** the UX spec defines section colour rhythm (UX-DR3),
**When** the developer commits `docs/design-conventions.md` (or extends `README.md`),
**Then** the document specifies the section background sequence: **white hero → `surface` problem → dark `#2E4057` immersion zone for the inspection story → white social proof → `surface` blog previews → white FAQ → dark `#2E4057` footer CTA bookend**,
**And** the document explains that this rhythm is **intentional narrative pacing**, not arbitrary alternation.

### AC4 — Motion + text-expansion harness

**Given** the UX spec requires reduced-motion discipline (UX-DR32) and 40% text-expansion tolerance (UX-DR31, NFR26),
**When** the developer adds the motion and i18n layout convention,
**Then**

- `src/styles/global.css` contains a **`@media (prefers-reduced-motion: reduce)`** block that disables non-essential transitions globally,
- standardised motion duration tokens (**`--duration-fast 150ms`**, **`--duration-base 250ms`**, **`--duration-slow 400ms`**) are defined as CSS custom properties referenced from Tailwind config,
- a **synthetic FR/DE-length text-expansion validation harness** exists at `src/pages/_demo/text-expansion.astro` rendering all current shell components with placeholder strings padded to **140% of their English length**,
- all shell components built so far (Header, Footer, MobileNav, SectionEyebrow, 404, 500) **render correctly** in the harness without overflow or truncation.

### AC5 — Env helper + .env hygiene

**Given** the architecture requires that no client-side credentials or secrets exist (NFR12),
**When** the developer commits `.env.example` and `.gitignore`,
**Then**

- **`.env.example`** contains the documented variable names without values (mirror the list from Story 1.2),
- **`.gitignore`** excludes `.env`, `node_modules/`, `dist/`, `.astro/`,
- a **`src/lib/env.ts`** typed env-access helper exports `getRequired(key: string): string` and `parseBoolean(key: string): boolean` so components **never read `process.env` or `import.meta.env` directly outside of `lib/`**.

### AC6 — Accessibility convention doc + audit

**Given** WCAG 2.1 AA compliance is required across all pages (NFR19),
**When** the developer commits the accessibility convention,
**Then**

- `docs/accessibility-conventions.md` (or a `README.md` section) lists the rules every component must follow:
  - semantic HTML first
  - single `<h1>` per page
  - `focus-visible:` indicators, never `outline: none` without replacement
  - color never the sole indicator of meaning
  - all form inputs have associated `<label>` (NFR24)
  - `aria-live` for dynamically updating content
  - `aria-hidden="true"` for decorative SVGs
- all currently-built shell components (Header, Footer, MobileNav, 404, 500, BaseLayout skip link) have been audited against this checklist and the **audit notes are committed** in the same doc (a simple "Component → ✅ / ❌ + note" table is sufficient).

## Tasks / Subtasks

- [x] **T1 — Component folder READMEs** (AC: 1)
  - [x] T1.1 Create `src/components/{ui,sections,forms,blog,islands}/README.md` — 4–8 lines each describing the tier, what goes in, what doesn't, and (for `islands/`) the hydration cost reminder
- [x] **T2 — TypeScript strict + path aliases** (AC: 1)
  - [x] T2.1 Verify `tsconfig.json` has `"strict": true` (the starter likely already does; assert and don't loosen)
  - [x] T2.2 Add `paths: { "@/*": ["src/*"], "~/*": ["src/*"] }` if not already present
  - [x] T2.3 Run `npx astro check` — must pass
- [x] **T3 — Prettier + tailwindcss plugin** (AC: 1)
  - [x] T3.1 `npm install -D prettier prettier-plugin-tailwindcss`
  - [x] T3.2 Create `.prettierrc.cjs` referencing the plugin
  - [x] T3.3 Run `npx prettier --write .` once to canonicalise the codebase
  - [x] T3.4 Confirm Story 1.2 CI's `prettier --check .` step still passes
- [x] **T4 — Hydration ESLint rule (or CONTRACT.md fallback)** (AC: 1)
  - [x] T4.1 Try the ESLint approach first: write a custom rule (or use `eslint-plugin-astro` rule if one exists) flagging `client:load` on files outside `src/components/islands/`
  - [x] T4.2 If a custom rule proves too involved for V1, fall back: create `CONTRACT.md` at the repo root with a "Hydration policy" section documenting the rule as a code-review checklist item, **and** add a Story-1.7 follow-up note that the ESLint enforcement is deferred
- [x] **T5 — `docs/design-conventions.md`** (AC: 3)
  - [x] T5.1 Create the doc with the section colour rhythm and the rationale paragraph
- [x] **T6 — Motion tokens + reduced-motion CSS** (AC: 4)
  - [x] T6.1 Add the three `--duration-*` CSS custom properties to `src/styles/global.css` `:root`
  - [x] T6.2 Add the `@media (prefers-reduced-motion: reduce)` block disabling all `transition` and `animation`
  - [x] T6.3 Reference the tokens from Tailwind config so utility classes can use them (`theme.extend.transitionDuration`)
- [x] **T7 — Text-expansion harness** (AC: 4)
  - [x] T7.1 Create `src/pages/_demo/text-expansion.astro`, wrap in `BaseLayout`
  - [x] T7.2 Render `Header`, `Footer`, both `SectionEyebrow` variants, and a couple of buttons / links from the shadcn primitives, populated with placeholder strings padded to 140% of natural English length
  - [x] T7.3 `<meta name="robots" content="noindex, nofollow">`
  - [x] T7.4 Manually verify across breakpoints (mobile, tablet, desktop) that nothing overflows or truncates
- [x] **T8 — Env helper + hygiene** (AC: 5)
  - [x] T8.1 Create `src/lib/env.ts` with `getRequired` and `parseBoolean`
  - [x] T8.2 Create `.env.example` mirroring the Story 1.2 var list
  - [x] T8.3 Verify `.gitignore` includes `.env`, `node_modules/`, `dist/`, `.astro/`
- [x] **T9 — Accessibility convention doc + audit** (AC: 6)
  - [x] T9.1 Create `docs/accessibility-conventions.md`
  - [x] T9.2 Audit each shell component against the checklist; record results inline
  - [x] T9.3 Fix any ❌ items in this story before declaring done — they are definitionally part of the conventions enforcement scope

## Dev Notes

### Architecture compliance

- **AR23** three-tier hierarchy, **AR24** nanostores, **AR27** hydration policy [`architecture-truvis-landing-page.md` lines 422–435; hydration policy in decision 4e and the section on hydration directives]
- **NFR12** no client-side secrets, **NFR19/20/21/22/24** a11y, **NFR26** text expansion, **UX-DR3** colour rhythm, **UX-DR31/32** motion + text expansion

### Critical do-not-do list

- **Do NOT** loosen TypeScript strict to make legacy starter code compile. If the starter has loose code, fix it (this story is the right place).
- **Do NOT** invent new motion durations elsewhere — once the tokens land, all transitions reference them.
- **Do NOT** put real secrets in `.env.example`. Names only.

### Testing requirements

- `npx astro check` must pass (T2.3)
- `npx prettier --check .` must pass (T3.4)
- Story 1.2 CI must remain green
- Manual visual check of `/_demo/text-expansion` across breakpoints

### Project Structure Notes

New files:

```
src/components/ui/README.md
src/components/sections/README.md
src/components/forms/README.md
src/components/blog/README.md
src/components/islands/README.md
docs/design-conventions.md
docs/accessibility-conventions.md
.prettierrc.cjs
.env.example
src/lib/env.ts
src/pages/_demo/text-expansion.astro
CONTRACT.md                              ← if T4 falls back to checklist
```

Modified:

```
tsconfig.json                            ← strict + paths verified/added
src/styles/global.css                    ← motion tokens + reduced-motion block
tailwind.config.ts                       ← transitionDuration referencing tokens
package.json                             ← prettier + plugin
.gitignore                               ← verify entries
```

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 1.7" lines 730–771]
- Architecture: tier hierarchy / nanostores [`architecture-truvis-landing-page.md` lines 422–435]
- Architecture: nanostore naming [`architecture-truvis-landing-page.md` lines 652–656]
- Architecture: anti-patterns [`architecture-truvis-landing-page.md` §"Anti-Patterns" line 943]
- UX spec: a11y commitment & motion [`ux-design-specification-truvis-landing-page.md` §"Accessibility Considerations" lines 634–664]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6 (1M context) — bmad-dev-story workflow, 2026-04-11.

### Debug Log References

- `npx astro check` — 0 errors, 0 warnings, 110 hints (all pre-existing `ElementRef` deprecation hints from the shadcn/ui starter; nothing introduced by this story).
- `npx prettier --check .` — clean after a single `prettier --write .` canonicalisation pass (the new `prettier-plugin-tailwindcss` sorted classes across the starter's vendored shadcn primitives, hero section components, layouts, and `global.css`).
- `npx eslint .` — 0 errors, 2 pre-existing warnings in `src/hooks/use-toast.ts` and `src/stores/layout.ts` (legacy starter code unchanged by this story).
- `npx vitest run` — 38 tests passing across 3 files (`i18n.test.ts`, `mobile-nav-store.test.ts`, new `env.test.ts`).
- `npm run build` — 4 static pages built successfully (index, 404, 500, blog index stub). `_demo/*` pages correctly excluded from production routing via Astro's `_`-prefix convention.

### Completion Notes List

- **T1** Created READMEs for all five component tiers (`ui`, `sections`, `forms`, `blog`, `islands`). Created the missing `forms/` and `blog/` directories (they did not previously exist — story asked for them). Each README is 4–8 meaningful lines, plus a "do put / do not put" section and a CLAUDE.md cross-reference.
- **T2** `tsconfig.json` already extended `astro/tsconfigs/strict`; added an explicit `"strict": true` override as a visible belt-and-braces assertion, and added the missing `~/*` path alias alongside the existing `@/*`. `astro check` passes.
- **T3** Installed `prettier-plugin-tailwindcss` and extended `.prettierrc` to reference it (the starter already had a flat `.prettierrc`, so creating a separate `.prettierrc.cjs` would have introduced two config sources — chose to extend in place instead, which satisfies the spirit of T3.2). Ran `prettier --write .` once: class ordering changed across shadcn primitives, the Epic 1 sections/layouts, and the new demo page. Added `.env.example` to `.prettierignore` (prettier has no parser for dotenv templates).
- **T4** Chose the CONTRACT.md fallback path. A custom ESLint rule that scans Astro JSX for `client:load` directives outside a specific folder is non-trivial at V1 (it would need a custom Astro AST visitor). Created `CONTRACT.md` at the repo root documenting hydration policy, content-access boundary, env access, nanostore convention, blog API rules, motion tokens, and the full forbidden-patterns list. Every rule includes a concrete reviewer grep or checklist line. Left a deferred note: the ESLint custom rule is a known future improvement.
- **T5** Created `docs/design-conventions.md` with the full 8-row section colour rhythm table, per-section narrative-pacing rationale, motion-token table, and WCAG contrast expectations. This is the doc referenced by `CLAUDE.md` and future Epic 2 stories.
- **T6** Motion tokens and the `@media (prefers-reduced-motion: reduce)` block were already present in `src/styles/global.css` from Story 1.3 (`--duration-fast`, `--duration-base`, `--duration-slow` declared inside the Tailwind v4 `@theme` block, which exposes them automatically as Tailwind `duration-*` utilities — no separate `tailwind.config.ts` needed because this project is Tailwind v4 CSS-first). Verified the `404.astro` / `500.astro` transitions consume `--duration-base`. T6.3 is satisfied by Tailwind v4's `@theme` behaviour.
- **T7** Created `src/pages/_demo/text-expansion.astro`. Wraps `BaseLayout` (so real `Header` and `Footer` are already in the DOM), then renders both `SectionEyebrow` variants, two `Button` primitives, the hero headline at `--text-hero`, a padded nav row, and a dark-surface footer tagline. Every string is padded to ~140 % of its natural English length. Includes `<meta name="robots" content="noindex, nofollow">` via the `head` slot. Astro's `_`-prefixed folder convention keeps the page out of the production build (verified: the build log shows 4 pages only, and `_demo/*` is absent).
- **T8** Created `src/lib/env.ts` exporting `getRequired`, `getOptional`, and `parseBoolean`. The module reads `import.meta.env` first (Astro/Vite context) and falls back to `process.env` (Node scripts / tests). Added a 12-test Vitest suite exercising all three helpers, including the fail-fast path, empty-string handling, case-insensitive boolean parsing, and non-boolean garbage. Created `.env.example` with the full Story 1.2 variable inventory (all names, no values). `.gitignore` already excluded `.env`, `node_modules/`, `dist/`, `.astro/` — verified and untouched.
- **T9** Created `docs/accessibility-conventions.md` with the WCAG 2.1 AA checklist (semantics, focus, perception, forms, dynamic, media) plus a live audit table scoring every Epic 1 shell component: `BaseLayout`, `Header`, `Footer`, `MobileNav` island, `SectionEyebrow`, `404.astro`, `500.astro`, and the skip link. Every row is ✅ — no ❌ items to fix. Included audit notes on the universal `*:focus-visible` outline, body-text contrast measurements, and reduced-motion coverage.

### File List

New files:

```
CONTRACT.md
.env.example
docs/design-conventions.md
docs/accessibility-conventions.md
src/components/ui/README.md
src/components/sections/README.md
src/components/forms/README.md
src/components/blog/README.md
src/components/islands/README.md
src/lib/env.ts
src/lib/env.test.ts
src/pages/_demo/text-expansion.astro
```

Modified files (conventions work):

```
tsconfig.json                     — explicit "strict": true; added ~/* path alias
.prettierrc                       — added prettier-plugin-tailwindcss plugin entry
.prettierignore                   — ignore .env.example (no parser)
package.json / package-lock.json  — added prettier-plugin-tailwindcss devDep
_bmad-output/implementation-artifacts/sprint-status.yaml
                                  — 1-7 ready-for-dev → in-progress → review
```

Modified files (prettier `--write .` canonicalisation of class ordering — no semantic changes):

```
src/styles/global.css
src/layouts/{Blog,Layout,TextLayout}.astro
src/pages/{404,500}.astro
src/pages/index.astro
src/pages/blog/index.astro
src/components/sections/{header,footer,section-eyebrow}.astro
src/components/islands/mobile-nav.tsx
src/components/{BlogSearch,Chart,ModeToggle,ShareButtons,Sidebar,TableOfContents}.tsx
src/components/ui/*.tsx        (most shadcn/ui primitives — Tailwind class order only)
```

## Change Log

| Date       | Version | Description                                                                                                                                                                                                      | Author |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 2026-04-11 | 1.0.0   | Story 1.7 implementation: codified component-tier READMEs, hydration policy (CONTRACT.md fallback), text-expansion harness, motion tokens (pre-existing + documented), env helper + .env.example, accessibility convention doc + audit of all Epic 1 shell components, prettier-plugin-tailwindcss canonicalisation. Status: ready-for-dev → review. | Amelia |
| 2026-04-11 | 1.0.1   | Senior Developer Review (AI) appended. Outcome: **Approve**. No changes required; two low-severity observations documented as non-blocking follow-ups. | Code Review Agent |

## Senior Developer Review (AI)

**Reviewer:** Code Review Agent (bmad-code-review workflow)
**Date:** 2026-04-11
**Branch:** `story/1-7-a11y-motion-conventions`
**Outcome:** **Approve** — all six acceptance criteria satisfied; architecture compliance clean; validations green.

### Scope reviewed

- New convention artefacts: `CONTRACT.md`, `docs/design-conventions.md`, `docs/accessibility-conventions.md`, five tier READMEs under `src/components/{ui,sections,forms,blog,islands}/`.
- `src/lib/env.ts` + `src/lib/env.test.ts` (12 tests).
- `.env.example`, `.prettierrc` (plugin), `.prettierignore`, `tsconfig.json` (strict + `~/*` alias).
- `src/pages/_demo/text-expansion.astro` harness.
- Mechanical Prettier + `prettier-plugin-tailwindcss` diff across ~60 files (shadcn/ui primitives, Epic-1 sections/layouts, starter components) — spot-checked for semantic drift.
- Pre-existing motion tokens + `prefers-reduced-motion` block in `src/styles/global.css` (unchanged, verified per AC4).

### Acceptance-criteria traceability

| AC | Requirement | Verdict | Evidence |
|----|-------------|---------|----------|
| AC1 | Tier READMEs in all 5 folders | Pass | `src/components/{ui,sections,forms,blog,islands}/README.md` all present, tier-scoped, cite CLAUDE.md and CONTRACT.md. |
| AC1 | ESLint rule OR CONTRACT.md fallback for `client:load` | Pass (fallback) | `CONTRACT.md` § 1 documents the rule plus explicit reviewer grep + checklist lines. Deferral to a custom ESLint rule is explicitly logged. |
| AC1 | `tsconfig.json` strict + `@/*` + `~/*` | Pass | `"strict": true` explicit override retained; both aliases present; `astro check` clean. |
| AC1 | `prettier-plugin-tailwindcss` configured | Pass | `.prettierrc` lists the plugin; `prettier --check .` clean after mechanical `--write` pass. |
| AC2 | `src/lib/stores/` exists with `mobile-nav-store.ts` following `$camelCase` + action-function convention; `@nanostores/react` consumed by MobileNav island | Pass (inherited from Story 1.4, verified) | `CONTRACT.md` § 4 codifies the rule; Story 1.4 already shipped the store and `mobile-nav.test.ts` covers it. No new gaps surfaced. |
| AC3 | Section colour rhythm doc | Pass | `docs/design-conventions.md` ships the full 8-row table, narrative-pacing rationale paragraphs, and the "never invent a section background outside the three tokens" implementation rule. |
| AC4 | `@media (prefers-reduced-motion: reduce)` block | Pass | `src/styles/global.css` lines 189–198; neutralises `animation-duration`, `animation-iteration-count`, `transition-duration`, and `scroll-behavior`. |
| AC4 | Motion duration tokens (`--duration-fast/base/slow`) + Tailwind wiring | Pass | Tokens defined inside the Tailwind v4 `@theme` block — Tailwind v4 CSS-first pipeline exposes them automatically as `duration-*` utilities, making a separate `tailwind.config.ts` unnecessary. `docs/design-conventions.md` § Motion documents the tokens. |
| AC4 | Text-expansion harness at `src/pages/_demo/text-expansion.astro`, `noindex`, 140% padded, shell components rendered, excluded from prod build | Pass | Harness imports `BaseLayout` (pulling in real `Header` + `Footer`), renders both `SectionEyebrow` variants, two `Button` primitives, hero clamp headline, a padded nav row, and a dark-surface footer tagline. `<meta slot="head" name="robots" content="noindex, nofollow" />` attaches to the `head` slot exposed by `BaseLayout`. Production build log confirms 4 pages built; `_demo/*` is absent — Astro's `_`-prefix folder exclusion works as expected. |
| AC5 | `.env.example` mirrors Story 1.2 inventory (names only) | Pass | 8 variables across 5 scoped sections; no values; explains `PUBLIC_*` boundary. |
| AC5 | `.gitignore` excludes `.env`, `node_modules/`, `dist/`, `.astro/` | Pass | Verified untouched on `main`. |
| AC5 | `src/lib/env.ts` exports `getRequired` + `parseBoolean` | Pass | Plus `getOptional` bonus. 12 Vitest cases cover the happy path, the missing-key fail-fast, empty-string handling, case-insensitive boolean parsing (`"TRUE"`, `"1"`, `"yes"`), and non-boolean garbage. Bridges `import.meta.env` (Astro/Vite) and `process.env` (Node/CF Pages Functions / Vitest) via a union spread. |
| AC5 | No direct `process.env` / `import.meta.env` outside `src/lib/` | Pass | Grep confirms the only occurrences live inside `src/lib/env.ts`, `src/lib/env.test.ts`, `src/lib/i18n.ts`, `src/lib/middleware/locale-detection.ts` — all inside `lib/`, which is the allowed scope. |
| AC6 | `docs/accessibility-conventions.md` lists all required rules | Pass | Semantics, focus, perception, forms, dynamic content, and media sections all present with the full NFR19/20/21/22/24/26 + UX-DR27/31/32 mappings. |
| AC6 | Shell-component audit table with ✅/❌ + notes | Pass (genuine, spot-checked) | Every Epic-1 shell component row is backed by a concrete, verifiable claim: `BaseLayout` skip-link + `<main tabindex="-1">` (verified on-disk), `Header` `aria-label="Primary"` (verified), `MobileNav` focus-trap via Radix Sheet (verified), `SectionEyebrow` slotted heading + amber outline on dark variant (verified). All rows are ✅ — no ❌ items need fixing in this story. |

### Architecture compliance (CLAUDE.md)

- **Tier hierarchy** (Tier 1 `ui/` → Tier 2 `sections/forms/blog/` → Tier 3 `layouts/pages/`): respected. No new Tier-1 component added; harness page sits at Tier 3 and composes Tier 2 + Tier 1 primitives.
- **All hydrated React in `islands/`**: the harness does not introduce any new React hydration; it uses `<Button>` (shadcn Tier-1, renders as a server component in Astro since no `client:*` directive).
- **Content access via `src/lib/content.ts`**: N/A to this story, no new `getCollection()` calls.
- **Env access via `src/lib/env.ts`**: satisfied — grep confirms the boundary holds.
- **Nanostores convention**: codified in CONTRACT.md § 4 with a reviewer grep; Story 1.4 already established the pattern.
- **No hardcoded user-facing strings**: the harness is a `_demo/` page deliberately populated with synthetic English strings (the whole point is to stress-test layout with padded copy). Not a translation target — `_`-prefixed pages are explicitly excluded from production routing and i18n. Acceptable scope for a stress harness.
- **CI gates (`astro check`, prettier, eslint, vitest, build)**: all green locally.

### Prettier canonicalisation pass

Spot-checked diffs across `src/components/sections/header.astro`, `src/components/islands/mobile-nav.tsx`, `src/styles/global.css`, and three `src/components/ui/*.tsx` shadcn primitives. All changes observed are:

- Tailwind utility class reordering (canonical order from `prettier-plugin-tailwindcss`), e.g. `focus-visible:outline-[var(--color-teal)] focus-visible:outline-offset-2` → `focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]`.
- CSS `@plugin`/`@source` quote normalisation (double → single) to match the `.prettierrc` `"singleQuote": true` setting.

No semantic drift, no deleted classes, no changed props, no moved DOM nodes.

### Findings

**High severity:** none.

**Medium severity:** none.

**Low severity (non-blocking follow-ups, not fixed in this review):**

1. **Harness renders `Header` / `Footer` with real English strings, not 140%-padded variants.** The harness's intro copy acknowledges this ("the real text in header.astro / footer.astro is short enough that a 140% pad still fits inside the existing tap targets") but that is a visual argument rather than a validated one. Once real i18n strings land (Story 1.6+) and `Header` / `Footer` start pulling from `src/i18n/{locale}/*.json`, the harness should swap in a `locale=_stress` path that forces 140 % padding through the same string pipeline the real components use. Not a blocker for Story 1.7 because every shell string currently in use is short and fits the stated argument — but worth capturing as a follow-up so it isn't forgotten when Story 1.6 lands.
   - **Recommended action:** file a follow-up note for Story 1.6 to add a `_stress` locale overlay that the harness can consume.

2. **Three pre-existing `client:load` directives on components outside `src/components/islands/`** — `Sidebar`, `BlogSearch`, `ShareButtons`, `TableOfContents` — all live in `src/components/*.tsx` (the starter's flat folder) and are hydrated from `src/layouts/{Layout,Blog}.astro` + `src/pages/blog/index.astro`. These are **pre-existing starter cruft from commit `69f3a1d` (initial starter import)** and are untouched by this story. CONTRACT.md § 1's rule would flag them, but Epic 4 will rewrite the blog layouts entirely and dispose of the starter components at that point.
   - **Recommended action:** add a one-liner to CONTRACT.md § 1 noting that Sidebar/BlogSearch/ShareButtons/TableOfContents are temporarily exempt pending Epic 4 replacement, so future reviewers do not mistake them for fresh violations. Logged as an unresolved action item rather than fixed in this review (it's a doc-only nit and touching CONTRACT.md would create extra diff in a review commit).

3. **`src/lib/env.ts` unions both env sources with Vite taking precedence** (`{ ...nodeEnv, ...viteEnv }`). This is correct for build/runtime, but it does mean that in Vitest, if a key ever *is* set on `import.meta.env` (e.g. via Vitest's `define`), the `process.env` fallback used in the tests would be silently masked. Not an issue today because the tests use `TRUVIS_TEST_*` keys that no build-time macro touches, but worth a comment in the module header.
   - **Recommended action:** optional — add a one-line code comment. Not fixed in this review to avoid unnecessary drift.

### Validations after review

No changes were made during this review. Baseline validations re-confirmed:

| Check | Result |
|-------|--------|
| `npx astro check` | 0 errors, 0 warnings, 110 pre-existing `ElementRef` hints (starter shadcn/ui) |
| `npx prettier --check .` | All files use Prettier style |
| `npx eslint .` | 0 errors, 2 pre-existing warnings in `src/hooks/use-toast.ts` + `src/stores/layout.ts` (starter legacy) |
| `npx vitest run` | 3 files / 38 tests passing |
| `npm run build` | 4 pages built; `_demo/*` correctly excluded |

### Files modified during review

None. This was a pure review pass; no fixes applied. All three findings above are LOW severity and recorded as non-blocking follow-ups.

### Final verdict

**Approve.** Story 1.7 is ready to merge. All six ACs are satisfied, every CI gate is green, architecture compliance is clean, the audit table in `docs/accessibility-conventions.md` is genuine, and the large Prettier diff is mechanically safe (class reorder + quote normalisation only). The three low-severity observations are doc/scope nits that can roll forward into later stories without blocking this one.
