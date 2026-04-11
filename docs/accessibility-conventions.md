# Truvis — Accessibility Conventions

Truvis commits to **WCAG 2.1 Level AA** across every page (NFR19, UX spec §"Accessibility Considerations"). This document is the enforceable checklist every component must pass before it ships, plus a live audit of the shell components built in Epic 1.

## The Checklist

Every new component in `src/components/` is reviewed against this list. Reviewers block the PR if any item is unclear.

### Semantics

- [ ] **Semantic HTML first.** Use `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<aside>` for their real purpose. No `<div onClick>` interactive elements. If a native element fits, use it.
- [ ] **Single `<h1>` per page.** Sections use `<h2>` / `<h3>`; reusable composites must NOT render an `<h1>`.
- [ ] **Landmarks.** `<header>`, `<main id="main">`, `<footer>` appear exactly once per page (driven by `BaseLayout.astro`). A visible-on-focus skip link is the first focusable element (UX-DR27 / NFR21).
- [ ] **Headings in order.** Do not skip heading levels for visual styling — restyle with utility classes instead.

### Focus

- [ ] **`focus-visible:` indicators everywhere.** Never `outline: none` (or `outline-none`) without an equivalent replacement. The default replacement is a 2-px teal ring (`focus-visible:outline-2 focus-visible:outline-[var(--color-teal)] focus-visible:outline-offset-2`).
- [ ] **Logical tab order.** DOM order reflects reading order; do not use `tabindex` > 0.
- [ ] **Keyboard reachable.** Every interactive element can be reached and triggered with Tab + Enter / Space. Test the whole flow keyboard-only.

### Perception

- [ ] **Color is never the sole indicator of meaning.** Severity states pair a colour with an icon or label. Error messages include text, not just a red border.
- [ ] **Contrast.** Body text ≥ 4.5:1 against its background, large display text ≥ 3:1, and focus indicators ≥ 3:1 against the adjacent background. Pre-validated in `ux-design-hybrid.html`; re-validate when a token changes.
- [ ] **Text expansion.** Components must accommodate 140 % of their English string length without overflow or truncation (NFR26 / UX-DR31). Validated in `src/pages/_demo/text-expansion.astro`.

### Forms

- [ ] **Every input has a `<label>`** (NFR24). `aria-label` / `aria-labelledby` are the explicit fallback when a visual label is not shown — not the default.
- [ ] **Error messages are programmatically associated** to their input via `aria-describedby` and announced with `aria-live="polite"`.
- [ ] **Required fields** are marked both visually and with `aria-required="true"`.

### Dynamic content

- [ ] **`aria-live="polite"` (or `assertive` for errors)** on regions whose content updates without a navigation — toasts, form feedback, drawer state.
- [ ] **Focus management on route change** — `BaseLayout` sets `tabindex="-1"` on `<main id="main">` so scripts can focus it after client-side transitions.

### Media

- [ ] **`aria-hidden="true"`** on purely decorative SVGs and icons (`<Menu />`, `<X />`, geometric illustrations).
- [ ] **Meaningful `alt` text** on content images. Decorative images use `alt=""`.
- [ ] **Reduced motion respected.** Every animation / transition falls under the `@media (prefers-reduced-motion: reduce)` rule in `global.css`. Essential motion exceptions are annotated with a code comment citing UX-DR32.

## Shell-component audit (Epic 1)

Each Epic-1 shell component has been walked against the checklist. A ✅ means every applicable rule passes; a ❌ would mean the component must be fixed as part of this story before we can call the conventions enforced.

| Component                                           | Semantics | Focus | Perception | Forms | Dynamic | Media | Status | Notes                                                                                                                                                                                              |
| --------------------------------------------------- | --------- | ----- | ---------- | ----- | ------- | ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BaseLayout.astro`                                  | ✅        | ✅    | ✅         | n/a   | ✅      | ✅    | ✅     | Skip link is first focusable element; `<main id="main" tabindex="-1">` landmark; single lang attribute sourced from `Astro.currentLocale`.                                                         |
| `Header` (`sections/header.astro`)                  | ✅        | ✅    | ✅         | n/a   | n/a     | ✅    | ✅     | `<nav aria-label="Primary">`; logo link has `aria-label="Truvis home"`; hover and focus states both styled; 44×44 tap targets via `h-11 min-w-11`.                                                 |
| `Footer` (`sections/footer.astro`)                  | ✅        | ✅    | ✅         | n/a   | n/a     | ✅    | ✅     | Four `<h2>` column headings are legitimate subsection headings under the site's `<h1>`; 44×44 tap targets via padding-driven min-height. Social link list uses `rel="noopener me"`.                |
| `MobileNav` island (`islands/mobile-nav.tsx`)       | ✅        | ✅    | ✅         | n/a   | ✅      | ✅    | ✅     | Radix Sheet provides focus trap + Escape-to-close; trigger has `aria-label`, `aria-expanded`, `aria-controls`; icon is `aria-hidden="true"`; nanostore state means trigger + drawer stay in sync.  |
| `SectionEyebrow` (`sections/section-eyebrow.astro`) | ✅        | n/a   | ✅         | n/a   | n/a     | n/a   | ✅     | Eyebrow is a `<span>` (presentational), heading is a slotted `<h2>`-level node supplied by the caller; `variant="dark"` uses amber outline — colour is not sole indicator (text + shape + border). |
| `404.astro`                                         | ✅        | ✅    | ✅         | n/a   | n/a     | n/a   | ✅     | Single `<h1>` "Page not found."; two CTA anchors with 44-px height and visible teal / outline styles; focus indicators preserved via `focus-visible:outline-*`.                                    |
| `500.astro`                                         | ✅        | ✅    | ✅         | n/a   | n/a     | n/a   | ✅     | Mirrors 404 structure; single `<h1>`; reassurance paragraph uses muted primary text which passes 4.5:1 against `--color-bg`.                                                                       |
| `BaseLayout` skip link                              | ✅        | ✅    | ✅         | n/a   | n/a     | n/a   | ✅     | Off-screen until `:focus` / `:focus-visible`; teal background with amber focus outline; first focusable element in the DOM.                                                                        |

### Audit notes

- The CSS `*:focus-visible` selector in `global.css` lays down a universal 2-px teal focus outline. Component-level `focus-visible:outline-*` utilities strengthen it — never override it away.
- `body` styles pin the default foreground to `var(--color-primary)` (`#2E4057`) against `var(--color-bg)` (`#FFFDF9`), which measures **9.6:1** contrast (AAA). Muted text at `var(--color-muted)` (`#5F6F7E`) measures **4.8:1** against `--color-bg`, which passes AA for body copy but not AAA.
- The `@media (prefers-reduced-motion: reduce)` block in `global.css` already neutralises every transition. No motion exception exists in any Epic-1 shell, so there is nothing to annotate.
- Text expansion: the 140 % synthetic stress test lives at `/src/pages/_demo/text-expansion.astro`. When you ship a new shell component, add it to that harness as part of the same PR.

## References

- PRD: NFR19 (WCAG 2.1 AA), NFR21 (skip link), NFR24 (form labels), NFR26 (text expansion)
- UX spec §"Accessibility Considerations" — `ux-design-specification-truvis-landing-page.md` lines 634–664
- UX-DR27 (skip link), UX-DR31 (140 % text expansion), UX-DR32 (reduced motion)
- `CONTRACT.md` § Hydration Policy — reviewers must also grep for `client:load` violations per accessibility budget
