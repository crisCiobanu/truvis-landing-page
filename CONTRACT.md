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

## 5. Blog API contract (FR / NFR31)

- `/api/v1/blog/*.json` is the **only** data contract with the Truvis mobile app.
- Every change to the endpoint payload is **additive-only**. Removing or renaming a field requires bumping to `/api/v2/...` and keeping `/v1/` frozen for at least one mobile release.
- Epic 4 story 4.8 lands the full schema here. Until then, no endpoint under `/api/v1/blog/` exists.

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
