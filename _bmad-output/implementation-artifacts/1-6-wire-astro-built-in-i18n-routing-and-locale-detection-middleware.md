# Story 1.6: Wire Astro built-in i18n routing and locale-detection middleware

Status: ready-for-dev

## Story

As **a visitor whose browser language is French or German**,
I want **the site to be ready for `/fr/` and `/de/` URLs even though only English content ships at V1**,
so that **adding translated content in V1.2 requires no rearchitecture and my browser language preference is respected from day one**.

## Acceptance Criteria

### AC1 — Astro built-in i18n routing configured

**Given** the architecture mandates Astro 4+ built-in i18n routing (AR17 / decision 4d),
**When** the developer configures `astro.config.mjs`,
**Then**

- the i18n block sets `defaultLocale: 'en'`, `locales: ['en', 'fr', 'de']`, and `routing: { prefixDefaultLocale: false }` so `/` serves English while `/fr/` and `/de/` are reserved for future content (FR50),
- stub directories `src/i18n/en/`, `src/i18n/fr/`, `src/i18n/de/` exist with placeholder JSON namespace files: `common.json`, `landing.json`, `blog.json`, `faq.json`,
- the **English JSON files contain real strings**; the **French and German files contain the same keys with identical English strings as placeholders** (FR52),
- `src/lib/i18n.ts` exports a **`t(key, locale)` helper** that accepts dot-notation keys (`landing.hero.headline`) and returns the matching string from the requested locale's JSON namespace, **falling back to English when missing**,
- `t()` supports **named placeholders** (`{amount}`) and never positional `{0}` placeholders.

### AC2 — Locale-detection middleware

**Given** AR18 requires browser language detection,
**When** the developer adds an Astro middleware at `src/middleware.ts` (Astro convention) that delegates to `src/lib/middleware/locale-detection.ts`,
**Then**

- the middleware checks the **`Accept-Language` header on first visit**,
- if a **stored locale preference exists in cookie or localStorage** it takes precedence over the header (FR51) — for first-visit redirect logic, the cookie is the only signal available server-side; localStorage handling lives client-side and is out of scope for this story (note in code comment),
- if neither indicates French or German, the visitor is **served English without redirect**,
- if the header indicates French or German, the visitor is **redirected to the matching locale URL** (which still serves English copy at V1 because no translated content exists yet),
- the middleware does **NOT redirect** requests to `/api/*` or `/keystatic/*` (or any path beginning with `/_demo/`).

## Tasks / Subtasks

- [ ] **T1 — `astro.config.mjs` i18n block** (AC: 1)
  - [ ] T1.1 Add the `i18n` block as specified
  - [ ] T1.2 Run `npm run build` to confirm Astro accepts the config
- [ ] **T2 — Translation file scaffolding** (AC: 1)
  - [ ] T2.1 Create `src/i18n/en/{common,landing,blog,faq}.json` with **real English strings** for the keys we already know we'll need (nav labels, footer labels, error-page strings, skip-link label, "Skip to main content", etc.)
  - [ ] T2.2 Create `src/i18n/fr/{common,landing,blog,faq}.json` and `src/i18n/de/{common,landing,blog,faq}.json` as **byte-for-byte copies** of the English files (placeholders per FR52)
  - [ ] T2.3 Use `camelCase` keys with namespace dots (e.g., `landing.hero.headline`)
- [ ] **T3 — `src/lib/i18n.ts` `t()` helper** (AC: 1)
  - [ ] T3.1 Implement `t(key: string, locale: 'en'|'fr'|'de', vars?: Record<string,string|number>): string`
  - [ ] T3.2 Lazy-load namespace JSON via `import.meta.glob('../i18n/**/*.json', { eager: true })`
  - [ ] T3.3 Resolve dot-notation `namespace.section.element` against the loaded namespace
  - [ ] T3.4 Fall back to `'en'` when the key is missing in the requested locale; **log a build-time warning** when fallback fires (helps catch missing translations once V1.2 ships real translations)
  - [ ] T3.5 Support named placeholder substitution: `"Buyers lose an average of {amount}."` + `vars: { amount: '€2,300' }` → `"Buyers lose an average of €2,300."`
  - [ ] T3.6 Reject positional placeholders (`{0}`) at runtime in dev with an error
- [ ] **T4 — Locale-detection middleware** (AC: 2)
  - [ ] T4.1 Create `src/lib/middleware/locale-detection.ts` exporting an `onRequest` handler
  - [ ] T4.2 Create `src/middleware.ts` that imports and re-exports from the lib file (Astro convention requires the middleware entry at `src/middleware.ts`)
  - [ ] T4.3 Skip when path starts with `/api/`, `/keystatic/`, `/_demo/`, or `/.well-known/`
  - [ ] T4.4 Read cookie `truvis_locale`; if set to `fr`/`de`/`en`, redirect (or pass through if `en`)
  - [ ] T4.5 Otherwise parse `Accept-Language`, pick the highest-quality match against `['fr','de']`, and redirect to `/fr/` or `/de/` if matched
  - [ ] T4.6 Otherwise pass through to English at `/`
  - [ ] T4.7 On every redirect, set the `truvis_locale` cookie (HttpOnly=false so client JS can later sync it; SameSite=Lax; 1-year max-age) so subsequent visits short-circuit the header parse
  - [ ] T4.8 Add a clarifying comment that localStorage-based preference handling is client-side and lives in a future story (V1.2)
- [ ] **T5 — Apply locale to BaseLayout** (Cross-story polish for Story 1.4)
  - [ ] T5.1 Update `src/layouts/BaseLayout.astro` so `<html lang>` reads from `Astro.currentLocale ?? 'en'` (already done in 1.4 task T3.6, but re-verify here)
- [ ] **T6 — Verification**
  - [ ] T6.1 `curl -H "Accept-Language: fr" http://localhost:4321/` → 302 to `/fr/`
  - [ ] T6.2 `curl -H "Accept-Language: en" http://localhost:4321/` → 200, English
  - [ ] T6.3 `curl -H "Accept-Language: fr" http://localhost:4321/api/whatever` → not redirected (404 from Astro is fine here)
  - [ ] T6.4 Cookie precedence: send `Cookie: truvis_locale=en` with `Accept-Language: fr` → 200 English, no redirect

## Dev Notes

### Architecture compliance

- **AR17 / Decision 4d — Astro built-in i18n + JSON message files** [`architecture-truvis-landing-page.md` lines 437–450]
- **AR18 — Browser language detection middleware** (referenced in same section)
- FR50 (`/en/`, `/fr/`, `/de/`), FR51 (cookie/localStorage precedence), FR52 (placeholder mirrors), NFR26 (40% text expansion — Story 1.7 builds the demo harness)

### Critical do-not-do list

- **Do NOT** install `astro-i18next`. Architecture decision is "no extra dependency" — built-in i18n + thin helper only.
- **Do NOT** translate any content yet. The English JSON files are the source of truth; the FR/DE files are byte-for-byte copies until V1.2.
- **Do NOT** ship any user-visible "language switcher" UI. V1 is English-only; the redirect plumbing exists for visitors who specifically request French/German via their browser, not as a feature surfaced in the header. (Header language switcher is V1.2.)

### Testing requirements

- Manual `curl` tests in T6
- A small unit test in `tests/i18n.test.ts` (Vitest, no-op CI integration since 1.2 already runs `vitest run --passWithNoTests`):
  - `t('landing.hero.headline', 'en')` returns the English string
  - `t('landing.hero.headline', 'fr')` returns the same string (placeholder mirror)
  - Missing key falls back to English with a console warning
  - Named placeholder substitution works
  - Positional placeholder throws in dev

### Project Structure Notes

New files:

```
astro.config.mjs                              ← MODIFIED (i18n block)
src/i18n/en/{common,landing,blog,faq}.json    ← NEW
src/i18n/fr/{common,landing,blog,faq}.json    ← NEW (byte-for-byte EN copies)
src/i18n/de/{common,landing,blog,faq}.json    ← NEW (byte-for-byte EN copies)
src/lib/i18n.ts                               ← NEW
src/lib/middleware/locale-detection.ts        ← NEW
src/middleware.ts                             ← NEW
tests/i18n.test.ts                            ← NEW (the project's first unit test)
```

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 1.6" lines 706–728]
- Architecture i18n decision [`architecture-truvis-landing-page.md` lines 437–450]
- FR50 / FR51 / FR52 / NFR26 in PRD

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
