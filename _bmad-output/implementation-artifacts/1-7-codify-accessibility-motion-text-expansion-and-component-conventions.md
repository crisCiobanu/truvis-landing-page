# Story 1.7: Codify accessibility, motion, text-expansion and component conventions

Status: ready-for-dev

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

- [ ] **T1 — Component folder READMEs** (AC: 1)
  - [ ] T1.1 Create `src/components/{ui,sections,forms,blog,islands}/README.md` — 4–8 lines each describing the tier, what goes in, what doesn't, and (for `islands/`) the hydration cost reminder
- [ ] **T2 — TypeScript strict + path aliases** (AC: 1)
  - [ ] T2.1 Verify `tsconfig.json` has `"strict": true` (the starter likely already does; assert and don't loosen)
  - [ ] T2.2 Add `paths: { "@/*": ["src/*"], "~/*": ["src/*"] }` if not already present
  - [ ] T2.3 Run `npx astro check` — must pass
- [ ] **T3 — Prettier + tailwindcss plugin** (AC: 1)
  - [ ] T3.1 `npm install -D prettier prettier-plugin-tailwindcss`
  - [ ] T3.2 Create `.prettierrc.cjs` referencing the plugin
  - [ ] T3.3 Run `npx prettier --write .` once to canonicalise the codebase
  - [ ] T3.4 Confirm Story 1.2 CI's `prettier --check .` step still passes
- [ ] **T4 — Hydration ESLint rule (or CONTRACT.md fallback)** (AC: 1)
  - [ ] T4.1 Try the ESLint approach first: write a custom rule (or use `eslint-plugin-astro` rule if one exists) flagging `client:load` on files outside `src/components/islands/`
  - [ ] T4.2 If a custom rule proves too involved for V1, fall back: create `CONTRACT.md` at the repo root with a "Hydration policy" section documenting the rule as a code-review checklist item, **and** add a Story-1.7 follow-up note that the ESLint enforcement is deferred
- [ ] **T5 — `docs/design-conventions.md`** (AC: 3)
  - [ ] T5.1 Create the doc with the section colour rhythm and the rationale paragraph
- [ ] **T6 — Motion tokens + reduced-motion CSS** (AC: 4)
  - [ ] T6.1 Add the three `--duration-*` CSS custom properties to `src/styles/global.css` `:root`
  - [ ] T6.2 Add the `@media (prefers-reduced-motion: reduce)` block disabling all `transition` and `animation`
  - [ ] T6.3 Reference the tokens from Tailwind config so utility classes can use them (`theme.extend.transitionDuration`)
- [ ] **T7 — Text-expansion harness** (AC: 4)
  - [ ] T7.1 Create `src/pages/_demo/text-expansion.astro`, wrap in `BaseLayout`
  - [ ] T7.2 Render `Header`, `Footer`, both `SectionEyebrow` variants, and a couple of buttons / links from the shadcn primitives, populated with placeholder strings padded to 140% of natural English length
  - [ ] T7.3 `<meta name="robots" content="noindex, nofollow">`
  - [ ] T7.4 Manually verify across breakpoints (mobile, tablet, desktop) that nothing overflows or truncates
- [ ] **T8 — Env helper + hygiene** (AC: 5)
  - [ ] T8.1 Create `src/lib/env.ts` with `getRequired` and `parseBoolean`
  - [ ] T8.2 Create `.env.example` mirroring the Story 1.2 var list
  - [ ] T8.3 Verify `.gitignore` includes `.env`, `node_modules/`, `dist/`, `.astro/`
- [ ] **T9 — Accessibility convention doc + audit** (AC: 6)
  - [ ] T9.1 Create `docs/accessibility-conventions.md`
  - [ ] T9.2 Audit each shell component against the checklist; record results inline
  - [ ] T9.3 Fix any ❌ items in this story before declaring done — they are definitionally part of the conventions enforcement scope

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
### Debug Log References
### Completion Notes List
### File List
