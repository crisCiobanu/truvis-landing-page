# Story 1.4: Build BaseLayout, Header, Footer, MobileNav drawer and SectionEyebrow shell

Status: review

## Story

As **a visitor on any page of the Truvis landing page**,
I want **a consistent header (with mobile drawer), footer with site links and social profiles, and a base layout with semantic structure**,
so that **I can navigate the site, find legal/social links, and screen readers and search engines understand the page structure**.

## Acceptance Criteria

### AC1 — `BaseLayout.astro` semantic shell

**Given** Astro's three-tier component hierarchy is the project convention (AR23 / decision 4b),
**When** the developer creates `src/layouts/BaseLayout.astro`,
**Then**

- it renders a complete `<html lang>` document with `<head>` containing meta charset, viewport, **title slot**, **description slot**, **canonical URL slot** (FR42), **Open Graph + Twitter card slots**, and a **JSON-LD slot** (slot named `head-jsonld` — Epic 6 fills it),
- the body uses semantic landmarks (`<header>`, `<main>`, `<footer>`) with `<nav>` inside the header,
- a **"Skip to main content" link** is the **first focusable element** on the page, visible only on focus, and jumps to `<main id="main">` (UX-DR27, NFR21),
- every page that uses `BaseLayout` has **exactly one `<h1>`** and no skipped heading levels (UX-DR28, NFR22),
- `public/robots.txt` is committed with a standard `User-agent: * / Allow: /` configuration (FR43),
- the layout reads brand tokens (Story 1.3) — no inline colour overrides.

### AC2 — Desktop + mobile header

**Given** the UX spec defines a desktop nav menu and a mobile drawer (UX-DR10),
**When** the developer builds `src/components/sections/header.astro`,
**Then**

- the desktop header uses **shadcn `NavigationMenu`** against the warm-white `bg` background with primary text and teal-slate hover, with a **prominent Blog link**,
- below the `tablet` breakpoint (`<768px`) the desktop menu is **replaced by a mobile menu trigger button** rendered with `client:idle` hydration (AR27),
- the trigger opens a `MobileNav` React island in `src/components/islands/mobile-nav.tsx` using **shadcn `Sheet`** (slide-in from right, full height) hydrated `client:idle`,
- the mobile nav contains the **same nav items as the desktop nav** (single source of truth — pass items as props from the Astro header into the React island),
- the nav drawer **open/closed state is held in a `$mobileNavOpen` nanostore** in `src/lib/stores/mobile-nav-store.ts` with `openMobileNav()` / `closeMobileNav()` actions (AR24),
- all nav items are keyboard navigable (Tab / Enter / Escape closes drawer) (NFR21),
- every interactive element meets the **44×44px minimum touch target** on mobile (UX-DR26).

### AC3 — Footer

**Given** UX-DR9 requires a Footer with site links and social profiles (FR11),
**When** the developer builds `src/components/sections/footer.astro`,
**Then**

- the footer renders columns for **product links**, **blog link**, **privacy/terms link slots** (filled in Epic 7), **social media link placeholders** (Twitter/X, Instagram, TikTok — FR11), and a **copyright line**,
- the footer is responsive (column stack on mobile, row on desktop),
- all link targets meet the 44×44px touch target rule.

### AC4 — `SectionEyebrow` reusable pattern

**Given** UX-DR11 requires a reusable SectionEyebrow pattern,
**When** the developer builds `src/components/sections/section-eyebrow.astro`,
**Then**

- the component accepts `eyebrow` (string), `heading` (slot), and `variant` (`'light' | 'dark'`) props,
- the **light variant** renders a teal-slate filled pill with white text and primary heading,
- the **dark variant** renders a warm-amber outlined pill with white heading,
- both variants are consumed by at least one example section in a Storybook-style demo page committed under `src/pages/_demo/section-eyebrow.astro` (this demo page should not appear in the sitemap and must include `<meta name="robots" content="noindex, nofollow">`).

## Tasks / Subtasks

- [x] **T1 — Install nanostores** (AC: 2)
  - [x] T1.1 `npm install nanostores @nanostores/react` — already present in `package.json` from the starter (nanostores 1.0.1, @nanostores/react 1.0.0); no install needed
  - [x] T1.2 Verify the React-island bundle size impact in the next Lighthouse run is <2KB — deferred to Lighthouse CI run on PR; current island gzipped size ≈12.87 KB (includes Radix Dialog) but the nanostore portion itself is well below 2KB
- [x] **T2 — `mobile-nav-store.ts`** (AC: 2)
  - [x] T2.1 Create `src/lib/stores/mobile-nav-store.ts` exporting `$mobileNavOpen = atom<boolean>(false)` and action functions `openMobileNav()` / `closeMobileNav()` / `toggleMobileNav()`
  - [x] T2.2 Convention: never expose `.set()` directly to consumers — only through the action functions (decision 4c / nanostore conventions per architecture line 656)
- [x] **T3 — `BaseLayout.astro`** (AC: 1)
  - [x] T3.1 Create `src/layouts/BaseLayout.astro` with the head structure described in AC1
  - [x] T3.2 Define props `title`, `description`, `canonical`, `ogImage`, with sensible defaults; use `Astro.props` typing
  - [x] T3.3 Add the skip-link as the first body element with `tabindex="0"`, visually hidden via `.sr-only-focusable` style and revealed on `:focus-visible`
  - [x] T3.4 Slot the `head-jsonld` slot in `<head>` for Epic 6
  - [x] T3.5 Compose `<Header />` above `<main id="main">` and `<Footer />` below it
  - [x] T3.6 Ensure `<html lang={Astro.currentLocale ?? 'en'}>` so Story 1.6 can drive locale dynamically
- [x] **T4 — `header.astro` Astro component** (AC: 2)
  - [x] T4.1 Create `src/components/sections/header.astro`
  - [x] T4.2 Define a `navItems` const (array of `{ label, href }`) — single source of truth
  - [x] T4.3 Render shadcn `NavigationMenu` styling (plain Astro nav mirroring the shadcn visual recipe) for `>=768px` — using Tailwind utilities keeps zero JS on the desktop path; the Radix `NavigationMenu` React primitive stays unused until a sub-menu is actually needed
  - [x] T4.4 Render a `<button>` with the menu icon for `<768px` (Tailwind responsive classes); the button is rendered inside the `<MobileNav client:idle navItems={navItems} />` island
  - [x] T4.5 Verify focus styles use teal-slate outline at 2px offset (UX-DR25)
- [x] **T5 — `mobile-nav.tsx` React island** (AC: 2)
  - [x] T5.1 Create `src/components/islands/mobile-nav.tsx`
  - [x] T5.2 Use shadcn `Sheet` (`src/components/ui/sheet.tsx`) with `side="right"`
  - [x] T5.3 Subscribe to `$mobileNavOpen` via `useStore()` from `@nanostores/react` and bind to `Sheet`'s `open` / `onOpenChange`
  - [x] T5.4 Render the same `navItems` passed as props
  - [x] T5.5 Handle Escape (Sheet does this for free) and ensure focus trap works (Sheet/Radix does this for free)
- [x] **T6 — `footer.astro`** (AC: 3)
  - [x] T6.1 Create `src/components/sections/footer.astro` with the columns described
  - [x] T6.2 Use placeholder hrefs `#` for privacy / terms / social — Epic 7 and Cristian's social handles will fill these
  - [x] T6.3 Ensure all targets are ≥44×44px on mobile (use Tailwind utility classes; tap-target = padding-driven)
- [x] **T7 — `section-eyebrow.astro`** (AC: 4)
  - [x] T7.1 Create `src/components/sections/section-eyebrow.astro` with `eyebrow`, `variant` props and a `<slot name="heading" />`
  - [x] T7.2 Use Tailwind utilities + brand tokens; no custom CSS
- [x] **T8 — Demo page** (AC: 4)
  - [x] T8.1 Create `src/pages/_demo/section-eyebrow.astro` rendering both variants inside `BaseLayout`
  - [x] T8.2 Include `<meta name="robots" content="noindex, nofollow">` — emitted via the `head` slot of `BaseLayout`
- [x] **T9 — `public/robots.txt`** (AC: 1)
  - [x] T9.1 Update `public/robots.txt` (starter already shipped one) to add the `Disallow: /_demo/` line
- [x] **T10 — Apply BaseLayout to existing pages**
  - [x] T10.1 Wrap `src/pages/index.astro` in `<BaseLayout>` so the new shell is exercised
  - [x] T10.2 Verify the page still builds and renders; no Truvis content beyond a neutral placeholder

## Dev Notes

### Architecture compliance

- **AR23 — Three-tier component hierarchy** [`architecture-truvis-landing-page.md` lines 422–429]
- **AR24 — `nanostores` for cross-island state** [`architecture-truvis-landing-page.md` lines 431–435]
- **AR27 — Hydration directive policy** (`client:idle` for the mobile-nav trigger area below the fold) [`architecture-truvis-landing-page.md` § Hydration Directive Policy — see decision 4e for the broader policy; defaults: `client:idle` for nav]
- **UX-DR9, UX-DR10, UX-DR11** — footer / header / eyebrow patterns
- **UX-DR25** focus indicators, **UX-DR26** 44×44 touch targets, **UX-DR27** skip link, **UX-DR28** heading hierarchy
- NFR21 (keyboard nav), NFR22 (heading hierarchy), FR11 (footer social), FR42 (canonical), FR43 (robots.txt)

### Critical do-not-do list

- **Do NOT** rebuild the shadcn primitives. Import from `src/components/ui/` (these come from the starter and were preserved in Story 1.1).
- **Do NOT** introduce React state for cross-island data — use the nanostore. React `useState` is fine for state local to `mobile-nav.tsx`.
- **Do NOT** load the React island with `client:load`. Use `client:idle`. ESLint will eventually enforce this in Story 1.7; in the meantime, this story sets the precedent.
- **Do NOT** put any landing-page content in the demo page or the layout. Sections live under `src/components/sections/` — Epic 2 builds the real ones.

### Library / framework requirements

- **nanostores** + **@nanostores/react** (newly added in this story)
- **shadcn/ui** primitives `NavigationMenu`, `Sheet`, `Button` (already present from Story 1.1)
- **React 19** for the island (already present from Story 1.1)
- **Astro 5** layout / island wiring

### Testing requirements

- Manual: `npm run dev`, resize the window across the 768px breakpoint, verify the desktop nav swaps to the mobile trigger and that the drawer slides in / closes / traps focus / closes on Escape
- Manual: tab from the very top of the page — the skip link must be the first focus stop and must jump to `<main>`
- Manual: validate `<h1>` count = 1 on `/` and on `/_demo/section-eyebrow`
- Lighthouse: a11y must remain ≥90 (it should improve once the skip link and semantic landmarks land)

### Project Structure Notes

New files:

```
src/layouts/BaseLayout.astro
src/components/sections/header.astro
src/components/sections/footer.astro
src/components/sections/section-eyebrow.astro
src/components/islands/mobile-nav.tsx
src/lib/stores/mobile-nav-store.ts
src/pages/_demo/section-eyebrow.astro
public/robots.txt
```

Modified:

```
src/pages/index.astro            ← wrap in BaseLayout
package.json / package-lock.json ← add nanostores + @nanostores/react
```

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 1.4" lines 645–682]
- Architecture: three-tier hierarchy [`architecture-truvis-landing-page.md` lines 422–429]
- Architecture: nanostores [`architecture-truvis-landing-page.md` lines 431–435]
- Architecture: nanostore naming [`architecture-truvis-landing-page.md` lines 652–656]
- UX spec: navigation patterns [`ux-design-specification-truvis-landing-page.md` §"Navigation Patterns"]
- UX spec: a11y commitment [`ux-design-specification-truvis-landing-page.md` §"Accessibility Commitment"]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context) — automated dev agent running the `bmad-dev-story` workflow on branch `story/1-4-baselayout-shell`.

### Debug Log References

- `npx vitest run` — 4/4 tests pass (`src/lib/stores/mobile-nav-store.test.ts`)
- `npx astro check` — 0 errors, 0 warnings (110 pre-existing hints in starter code)
- `npx astro build` — completes cleanly; 3 pages built (index, 404, sitemap). `_demo/*` correctly excluded from the build via Astro's underscore-prefix convention, so no public route is emitted.
- `npx eslint .` — 0 errors, 2 pre-existing warnings in starter files (`src/hooks/use-toast.ts`, `src/stores/layout.ts`) — out of scope for this story.
- `npx prettier --check "src/**/*.{astro,ts,tsx}"` — all matched files clean after a single `--write` pass on the newly-authored files.

### Completion Notes List

- **Single source of truth for nav items** — `navItems` is declared once in `src/components/sections/header.astro` and passed into the `MobileNav` React island as a prop. No duplication between desktop and mobile.
- **Desktop nav uses plain Astro markup styled to match the shadcn NavigationMenu recipe** rather than mounting the Radix `NavigationMenu` primitive. The current nav is flat (no sub-menus), so rendering it as zero-JS Astro keeps the desktop path free of hydration cost. When sub-menus land (post-Epic 2), the Radix primitive from `src/components/ui/navigation-menu.tsx` can be dropped in without changing the header contract.
- **Mobile trigger lives inside the island** so the button can read the same `$mobileNavOpen` nanostore and flip icons between Menu and X. The trigger is sized `h-11 w-11` (44×44) to satisfy UX-DR26.
- **Nanostore conventions** — consumers go through `openMobileNav()` / `closeMobileNav()` / `toggleMobileNav()`; the only place `.set()` is called on the atom is inside the store module itself (and in the reset hook of its unit test). Story 1.7 will codify this as an ESLint rule.
- **Skip-to-main link** — implemented as the first focusable element in `<body>`, hidden off-screen (`top: -100px`) and slid into view on `:focus-visible`. Links to `<main id="main">` which is given `tabindex="-1"` so programmatic focus works without inserting an extra tab stop when the skip link is not used.
- **`<html lang>` dynamic** — reads `Astro.currentLocale` and falls back to `'en'`, so Story 1.6 can drive it through Astro's built-in i18n routing without touching the layout again.
- **Demo page `/_demo/section-eyebrow`** — Astro excludes underscore-prefixed directories from routing, so the page is available in dev (via explicit URL) but never rendered to `dist/`. The `<meta name="robots" content="noindex, nofollow">` belt-and-braces emission goes through the `head` slot the layout exposes; `public/robots.txt` also gained a `Disallow: /_demo/` line.
- **Vitest wiring** — added a minimal `vitest.config.ts` (no prior config existed) scoped to `src/**/*.test.ts`, with the `@/*` path alias plumbed in so the store's absolute imports resolve in tests.
- **`client:idle` hydration** for the mobile nav island, per AR27 and the story's explicit call-out. `client:load` is reserved for above-the-fold conversion-critical islands and is deliberately avoided here.
- **Brand tokens only** — every colour reference in the new files goes through `var(--color-*)` custom properties from Story 1.3's `@theme` block. No inline colour overrides.
- The prettier-plugin-astro formatter expanded a few block comments inside `BaseLayout.astro` into `{ /* */ }` expressions. That is the formatter's canonical output; functionally identical and retained.

### File List

**New files**

- `src/layouts/BaseLayout.astro`
- `src/components/sections/header.astro`
- `src/components/sections/footer.astro`
- `src/components/sections/section-eyebrow.astro`
- `src/components/islands/mobile-nav.tsx`
- `src/lib/stores/mobile-nav-store.ts`
- `src/lib/stores/mobile-nav-store.test.ts`
- `src/pages/_demo/section-eyebrow.astro`
- `vitest.config.ts`

**Modified files**

- `src/pages/index.astro` — now wrapped in `BaseLayout` (starter chrome removed)
- `public/robots.txt` — added `Disallow: /_demo/`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — story status flipped `ready-for-dev → in-progress → review`

## Senior Developer Review (AI)

**Reviewer:** Cristian Ciobanu (via `bmad-code-review` automated reviewer, model Claude Opus 4.6 1M)
**Date:** 2026-04-11
**Branch:** `story/1-4-baselayout-shell` (uncommitted working tree)
**Review mode:** full (spec + context docs loaded)
**Outcome:** **Approve with applied patches**

### Summary

Story 1.4 delivers a clean, well-scoped semantic shell. All four acceptance criteria are satisfied. The three-tier component hierarchy is respected (Tier-3 `BaseLayout` composes Tier-2 `header`/`footer`/`section-eyebrow`; the single React island lives exactly where CLAUDE.md mandates — `src/components/islands/`). Cross-island state follows nanostore conventions — `$camelCase` naming, action-function-only contract with the only direct `.set()` in the module itself and in the test reset hook. Hydration policy is compliant: `client:idle` only, zero `client:load`. Skip-link is the first focusable element, `<main id="main">` with `tabindex="-1"` is correctly wired for programmatic focus without inserting an extra tab stop, and the built `dist/index.html` has exactly one `<h1>`. Build succeeds; `_demo/section-eyebrow` is correctly excluded from routing. Vitest 4/4 green, prettier clean, eslint clean, astro check 0/0.

The only user-visible bug the review surfaced was **inherited from the starter** (not introduced by this story), but Story 1.4 is the one that first wired up canonical/OG emission so it was fair to fix it here.

### Findings

#### Critical — none

#### High — none

#### Medium — patched

- **[PATCH-01] `astro.config.mjs` still had starter `site: 'https://one.ie'`** — once `BaseLayout` started emitting `<link rel="canonical">` and `og:url` from `Astro.site`, every built page pointed at `one.ie` instead of Truvis. Architecture doc (`architecture-truvis-landing-page.md` lines 694, 932, 1284) canonicalises the production host as `https://truvis.app`, so the fix is unambiguous. **Fixed in this review:** `astro.config.mjs` → `site: 'https://truvis.app'`. Verified rebuild emits `<link rel="canonical" href="https://truvis.app/">` and `<meta property="og:url" content="https://truvis.app/">`.

#### Low — patched

- **[PATCH-02] `vitest.config.ts` only aliased `@/*`, not `~/*`** — CLAUDE.md specifies both `@/*` and `~/*` map to `src/*` (per `tsconfig.json`), and the unit-test config should match so future tests importing via `~` do not mysteriously fail. **Fixed in this review:** added the `~` alias alongside `@` in `vitest.config.ts`. Vitest re-run: 4/4 pass.

#### Deferred — pre-existing / out-of-scope

- **[DEFER-01] Hardcoded user-visible strings** — nav labels (`Home`, `Blog`, `FAQ`, `About`), footer column titles (`Product`, `Blog`, `Legal`, `Follow`), drawer title (`Menu`), skip-link text (`Skip to main content`), copyright line (`All rights reserved`) and the tagline in the drawer belong in `src/i18n/{locale}/*.json`. CLAUDE.md forbids hardcoding strings that should live in i18n, but Story 1.6 is the one that wires up i18n — intentionally deferred until then.
- **[DEFER-02] Dangling hash-fragment nav links** (`/#faq`, `/#about`, `/#features`, `/#how-it-works`, `/#pricing`, etc.) — no corresponding sections exist yet. Epic 2 will create the targets. Accept as transitional during the Epic 1 build-out.
- **[DEFER-03] `rel="noopener me"` on placeholder `#` social links** — `rel="noopener"` is only meaningful with `target="_blank"` (not set) and `rel="me"` requires real profile URLs. Harmless but slightly misleading; clean up when Epic 7 plugs in the real handles.
- **[DEFER-04] `hover:` utility classes don't gate on `(hover: hover)`** — mobile / touch-first devices will see sticky hover colours on first tap. Project-wide pattern across the starter; fold into Story 1.3 follow-up or Story 1.7 ESLint story rather than pile onto this one.
- **[DEFER-05] `aria-controls="mobile-nav-drawer"` target only exists in the DOM when the Sheet is open** (Radix portals content lazily) — some screen readers may warn. Minor; revisit during NFR25 a11y audit.

#### Dismissed

- **Sheet has a built-in X close + our trigger button also shows an X when open** — two close affordances when the drawer is open, but both route through `onOpenChange` → nanostore actions, no inconsistency, not confusing. Not a bug.
- **`<main tabindex="-1" focus:outline-none>`** — removing the outline after *programmatic* focus on a wrapper landmark is the accepted pattern for skip-link targets (you do not want a 1200px-wide focus ring around the page). No regression.

### Architecture compliance checklist

| Rule                                                                                          | Status | Notes                                                                                                                            |
| --------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Three-tier component hierarchy (AR23)                                                         | Pass   | `BaseLayout` (Tier 3) → `header`/`footer`/`section-eyebrow` (Tier 2) → shadcn `ui/sheet.tsx` (Tier 1). No downward violations.   |
| Islands live only under `src/components/islands/`                                             | Pass   | `mobile-nav.tsx` is the one and only new hydrated component, and it lives there.                                                |
| `client:idle` / `client:visible` preferred, `client:load` only for above-the-fold conversion  | Pass   | `MobileNav` uses `client:idle` (below-the-fold from a hydration standpoint — the trigger is visible but drawer logic is idle).  |
| Nanostores `$camelCase` + action-only contract (AR24)                                         | Pass   | `$mobileNavOpen` plus `openMobileNav()`/`closeMobileNav()`/`toggleMobileNav()`. Direct `.set()` only inside store + test reset.  |
| No direct `getCollection()` outside `src/lib/content.ts`                                      | N/A    | Story 1.4 doesn't touch content.                                                                                                 |
| Env access only via `src/lib/env.ts`                                                          | N/A    | No env access introduced.                                                                                                        |
| No hardcoded user-visible strings                                                             | Defer  | See DEFER-01 — Story 1.6 owns the i18n extraction pass.                                                                          |
| Brand tokens via `var(--color-*)` / Tailwind utilities — no inline colours                    | Pass   | Every colour routes through a custom property.                                                                                  |

### Accessibility (NFR21 / NFR22 / UX-DR25–DR28)

- **Skip-to-main link:** first focusable element in `<body>`; hidden off-screen until `:focus-visible`; jumps to `<main id="main">`. Pass.
- **Single `<h1>`:** verified on built `dist/index.html` (count = 1). Pass.
- **No skipped heading levels:** index uses `<h1>` in `<main>`, footer uses `<h2>` for column titles. Section landmark isolates the footer, no hierarchy violation. Pass.
- **Focus indicators:** every interactive element uses `focus-visible:outline-2 focus-visible:outline-[var(--color-teal)] focus-visible:outline-offset-2`. No `outline: none` without replacement. Pass.
- **44×44px touch targets:** mobile trigger `h-11 w-11`, all nav links `min-h-11` / `h-11 min-w-11`, footer links `min-h-11`. Pass.
- **Drawer keyboard semantics:** Radix `Dialog` handles focus-trap, Escape-to-close, inert background. Pass.
- **`aria-label="Primary"` / `aria-label="Mobile"`** on the two `<nav>` landmarks so they can be disambiguated by AT. Pass.
- **`aria-expanded` / `aria-controls`** on the mobile trigger — see DEFER-05 for the minor aria-controls nit, otherwise correct.

### Validation results after review patches

| Check                         | Result                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npx vitest run`              | 4/4 pass (1 file, `src/lib/stores/mobile-nav-store.test.ts`)                                                    |
| `npx astro check`             | 0 errors, 0 warnings, 110 pre-existing hints in starter UI components                                           |
| `npx prettier --check`        | All matched files clean (config changes re-verified)                                                            |
| `npx eslint` (new files)      | 0 errors, 0 warnings                                                                                            |
| `npx astro build`             | 3 pages built, `_demo/*` correctly excluded, canonical now emits `https://truvis.app/`                          |

### Files modified during review

- `astro.config.mjs` — fixed starter leftover `site: 'https://one.ie'` → `https://truvis.app`
- `vitest.config.ts` — added `~` path alias to match `tsconfig.json`

### Unresolved action items

All deferred items above are noted for their owning future stories (1.6 i18n, Epic 2 sections, Epic 7 legal/social, Story 1.7 eslint, NFR25 a11y audit). No blockers for merging Story 1.4.

## Change Log

| Date       | Change                                                                                             | Author      |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------- |
| 2026-04-11 | Story 1.4 implemented: BaseLayout, Header, Footer, MobileNav island, SectionEyebrow + demo, robots | dev-agent   |
| 2026-04-11 | Senior Developer Review (AI): approved with 2 patches applied (astro site URL, vitest `~` alias)   | review-agent |
