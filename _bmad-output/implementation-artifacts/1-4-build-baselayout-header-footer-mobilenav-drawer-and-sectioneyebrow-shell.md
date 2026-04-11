# Story 1.4: Build BaseLayout, Header, Footer, MobileNav drawer and SectionEyebrow shell

Status: ready-for-dev

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

- [ ] **T1 — Install nanostores** (AC: 2)
  - [ ] T1.1 `npm install nanostores @nanostores/react`
  - [ ] T1.2 Verify the React-island bundle size impact in the next Lighthouse run is <2KB
- [ ] **T2 — `mobile-nav-store.ts`** (AC: 2)
  - [ ] T2.1 Create `src/lib/stores/mobile-nav-store.ts` exporting `$mobileNavOpen = atom<boolean>(false)` and action functions `openMobileNav()` / `closeMobileNav()` / `toggleMobileNav()`
  - [ ] T2.2 Convention: never expose `.set()` directly to consumers — only through the action functions (decision 4c / nanostore conventions per architecture line 656)
- [ ] **T3 — `BaseLayout.astro`** (AC: 1)
  - [ ] T3.1 Create `src/layouts/BaseLayout.astro` with the head structure described in AC1
  - [ ] T3.2 Define props `title`, `description`, `canonical`, `ogImage`, with sensible defaults; use `Astro.props` typing
  - [ ] T3.3 Add the skip-link as the first body element with `tabindex="0"`, visually hidden via `.sr-only-focusable` style and revealed on `:focus-visible`
  - [ ] T3.4 Slot the `head-jsonld` slot in `<head>` for Epic 6
  - [ ] T3.5 Compose `<Header />` above `<main id="main">` and `<Footer />` below it
  - [ ] T3.6 Ensure `<html lang={Astro.currentLocale ?? 'en'}>` so Story 1.6 can drive locale dynamically
- [ ] **T4 — `header.astro` Astro component** (AC: 2)
  - [ ] T4.1 Create `src/components/sections/header.astro`
  - [ ] T4.2 Define a `navItems` const (array of `{ label, href }`) — single source of truth
  - [ ] T4.3 Render shadcn `NavigationMenu` (from `src/components/ui/`) with `navItems` for `>=768px`
  - [ ] T4.4 Render a `<button>` with the menu icon for `<768px` (Tailwind responsive classes); the button mounts `<MobileNav client:idle navItems={navItems} />`
  - [ ] T4.5 Verify focus styles use teal-slate outline at 2px offset (UX-DR25)
- [ ] **T5 — `mobile-nav.tsx` React island** (AC: 2)
  - [ ] T5.1 Create `src/components/islands/mobile-nav.tsx`
  - [ ] T5.2 Use shadcn `Sheet` (`src/components/ui/Sheet.tsx`) with `side="right"`
  - [ ] T5.3 Subscribe to `$mobileNavOpen` via `useStore()` from `@nanostores/react` and bind to `Sheet`'s `open` / `onOpenChange`
  - [ ] T5.4 Render the same `navItems` passed as props
  - [ ] T5.5 Handle Escape (Sheet does this for free) and ensure focus trap works (Sheet/Radix does this for free)
- [ ] **T6 — `footer.astro`** (AC: 3)
  - [ ] T6.1 Create `src/components/sections/footer.astro` with the columns described
  - [ ] T6.2 Use placeholder hrefs `#` for privacy / terms / social — Epic 7 and Cristian's social handles will fill these
  - [ ] T6.3 Ensure all targets are ≥44×44px on mobile (use Tailwind utility classes; tap-target = padding-driven)
- [ ] **T7 — `section-eyebrow.astro`** (AC: 4)
  - [ ] T7.1 Create `src/components/sections/section-eyebrow.astro` with `eyebrow`, `variant` props and a `<slot name="heading" />`
  - [ ] T7.2 Use Tailwind utilities + brand tokens; no custom CSS
- [ ] **T8 — Demo page** (AC: 4)
  - [ ] T8.1 Create `src/pages/_demo/section-eyebrow.astro` rendering both variants inside `BaseLayout`
  - [ ] T8.2 Include `<meta name="robots" content="noindex, nofollow">`
- [ ] **T9 — `public/robots.txt`** (AC: 1)
  - [ ] T9.1 Create `public/robots.txt` with `User-agent: * \n Allow: /` and a `Disallow: /_demo/` line
- [ ] **T10 — Apply BaseLayout to existing pages**
  - [ ] T10.1 Wrap the starter's `src/pages/index.astro` (or whatever the entry point currently is) in `<BaseLayout>` so the new shell is exercised
  - [ ] T10.2 Verify the page still builds and renders; do **not** introduce Truvis content yet — that's Epic 2

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
### Debug Log References
### Completion Notes List
### File List
