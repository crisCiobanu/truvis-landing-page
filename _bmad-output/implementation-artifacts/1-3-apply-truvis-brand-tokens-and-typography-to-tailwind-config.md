# Story 1.3: Apply Truvis brand tokens and typography to Tailwind config

Status: ready-for-dev

## Story

As **a visitor**,
I want **every page to render in the Truvis warm-editorial visual language with consistent typography**,
so that **the site feels like a single coherent brand from the very first byte**.

## Acceptance Criteria

### AC1 — Truvis design tokens in Tailwind config

**Given** the chosen visual direction in `ux-design-hybrid.html` defines the warm-editorial palette and the UX spec defines the type scale,
**When** the developer customises `tailwind.config.ts`,
**Then** the config exposes the **full hybrid colour palette** (UX-DR1):

| Token | Value |
|---|---|
| `bg` | `#FFFDF9` |
| `surface` | `#F7F5F2` |
| `surface-2` | `#FFF8EF` |
| `surface-3` | `#EEF7F7` |
| `text/primary` | `#2E4057` |
| `primary-light` | `#3B5068` |
| `muted` | `#5F6F7E` |
| `faint` | `#8E99A4` |
| `teal` | `#3D7A8A` |
| `teal-bright` | `#2DA5A0` |
| `amber` | `#F5A623` |
| `amber-light` | `#FFBA42` |
| `coral` | `#FF6B6B` |
| `severity.green` | `#22C55E` |
| `severity.yellow` | `#F59E0B` |
| `severity.red` | `#EF4444` |
| `divider` | `rgba(46,64,87,.12)` |

**And** the spacing scale uses the **4pt rem grid** (`1 = 0.25rem` … `24 = 6rem`),
**And** the radius scale is exposed (`sm 0.5rem`, `md 0.75rem`, `lg 1rem`, `xl 1.25rem`, `2xl 1.5rem`, `full 999px`),
**And** the warm-tinted shadow scale (`shadow-sm`, `shadow-md`) uses documented `rgba(46,64,87,.0X)` values,
**And** all tokens validate WCAG 2.1 AA contrast — **primary on `bg` ≥10:1 (AAA), teal on `bg` ≥4.5:1 (AA), white on primary ≥10:1 (AAA)** — with the validation report committed to `README.md` (NFR20, UX-DR30).

### AC2 — Fluid `clamp()` typography

**Given** the UX spec requires fluid `clamp()` typography (UX-DR2),
**When** the developer extends the Tailwind config with the type scale,
**Then** the scale matches the hybrid direction values:

| Class | Definition |
|---|---|
| `text-xs` | `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)` |
| `text-sm` | (continue the hybrid progression) |
| `text-base` | (continue) |
| `text-lg` | (continue) |
| `text-xl` | (continue) |
| `text-2xl` | (continue) |
| `text-hero` | `clamp(2.25rem, 1.4rem + 3.2vw, 3.5rem)` |

(Mid values: derive from `ux-design-hybrid.html` — open the file and copy the exact `--text-*` custom-property declarations. Do NOT improvise.)

**And** Plus Jakarta Sans (display) and Inter (body) variable fonts are loaded via `@font-face` from `src/assets/fonts/` with `font-display: swap`,
**And** both fonts are subset to Latin + Latin Extended (each variable file ≤ ~30KB),
**And** the hero display font is preloaded via `<link rel="preload">` in `<head>` to minimise CLS (NFR3),
**And** a system-font fallback stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` is declared,
**And** total CSS + font weight on the home page remains under the 500KB initial budget (NFR5) — verified by re-running Lighthouse against the dev page after the change.

## Tasks / Subtasks

- [ ] **T1 — Customise `tailwind.config.ts` with brand colours** (AC: 1)
  - [ ] T1.1 Replace the starter's `theme.extend.colors` with the Truvis hybrid palette table above (use the structured object form for severity sub-tokens)
  - [ ] T1.2 Add `theme.extend.spacing` with the 4pt rem grid 1–24 (Tailwind defaults already follow this; explicitly declare to lock it as project policy)
  - [ ] T1.3 Add `theme.extend.borderRadius` matching the table
  - [ ] T1.4 Add `theme.extend.boxShadow` with warm-tinted `rgba(46,64,87,.0X)` values
  - [ ] T1.5 Note: Tailwind v4 uses CSS-first config — depending on what the starter ships, this may live in `src/styles/global.css` `@theme` block instead of `tailwind.config.ts`. **Use whichever pattern the starter uses.** Do not mix.
- [ ] **T2 — Add fluid type scale** (AC: 2)
  - [ ] T2.1 Open `_bmad-output/planning-artifacts/ux-design-hybrid.html`, find the `--text-*` CSS custom properties block, and copy the exact `clamp()` declarations
  - [ ] T2.2 Add them to `theme.extend.fontSize` (or to the `@theme` block if Tailwind v4 CSS-first)
  - [ ] T2.3 Add a `text-hero` token explicitly even though it's only used by the hero — Story 2.1 will consume it
- [ ] **T3 — Self-hosted variable font loading** (AC: 2)
  - [ ] T3.1 Create `src/assets/fonts/`
  - [ ] T3.2 Download Plus Jakarta Sans variable WOFF2 (Latin + Latin Extended subset only) and place at `plus-jakarta-sans-variable.woff2`
  - [ ] T3.3 Same for Inter — `inter-variable.woff2`
  - [ ] T3.4 Verify each file is ≤ ~30KB; if not, re-subset with `glyphhanger` or pyftsubset
  - [ ] T3.5 In `src/styles/global.css`, declare `@font-face` rules for both with `font-display: swap`
  - [ ] T3.6 Set `font-family: 'Plus Jakarta Sans', system-font-fallback-stack` for the display font in Tailwind config
  - [ ] T3.7 Set `font-family: 'Inter', system-font-fallback-stack` for body
- [ ] **T4 — Preload the hero font** (AC: 2)
  - [ ] T4.1 In whatever layout component the starter uses for `<head>` (will become `BaseLayout.astro` in Story 1.4 — for now, the starter's existing layout), add a `<link rel="preload" href="/fonts/plus-jakarta-sans-variable.woff2" as="font" type="font/woff2" crossorigin>`
  - [ ] T4.2 Verify the fonts are served from `dist/` after `npm run build` (Astro Assets pipeline should handle this)
- [ ] **T5 — Contrast validation report** (AC: 1)
  - [ ] T5.1 Use a tool (e.g., https://webaim.org/resources/contrastchecker/ or `wcag-contrast` npm) to verify each pair listed in AC1
  - [ ] T5.2 Add a `## Contrast Validation` section to README with the results table
- [ ] **T6 — Re-run Lighthouse for budget compliance** (AC: 2)
  - [ ] T6.1 `npm run build` then `npx lighthouse <local-url> --preset=mobile`
  - [ ] T6.2 Verify total transferred resource weight is still under 500KB
  - [ ] T6.3 If it isn't, re-subset fonts more aggressively or remove unused starter CSS

## Dev Notes

### Architecture compliance

- **UX-DR1 / UX-DR2 / UX-DR30** — colour palette, fluid type, contrast — see UX spec and `ux-design-hybrid.html`
- **NFR3 (CLS<0.1), NFR5 (<500KB), NFR20 (WCAG AA contrast)**
- Tailwind v4 is the styling solution per [`architecture-truvis-landing-page.md` § Architectural Decisions Provided by Starter, line 195]

### Critical references

- `_bmad-output/planning-artifacts/ux-design-hybrid.html` is the **source of truth** for both the palette values and the `clamp()` declarations. Open it. Copy from it. Do not improvise values from the abstract UX spec — that file uses the older pure-white palette; the hybrid file is what we ship.
- `_bmad-output/planning-artifacts/branding-truvis.md` may have additional brand voice / logo guidance — read it for context but the colour values come from the hybrid HTML.

### What this story does NOT do

- ❌ It does **not** build any components. Story 1.4 builds the layout shells. This story only configures the tokens those components will consume.
- ❌ It does **not** touch the Header / Footer / pages. The starter's existing pages will visually shift after this story — that's expected; Story 1.4 then replaces them.
- ❌ It does **not** add `prettier-plugin-tailwindcss` (Story 1.7) or any custom ESLint rules (Story 1.7).

### Testing requirements

- Visual smoke check: `npm run dev`, open `/`, confirm the page picks up the new colours and fonts (it will look weird because the starter's content is still there — that's fine)
- Lighthouse weight check per T6
- Contrast validation per T5

### Project Structure Notes

New / modified files:

```
tailwind.config.ts                 ← MODIFIED (or src/styles/global.css @theme block, depending on starter)
src/styles/global.css              ← MODIFIED (font-face rules)
src/assets/fonts/
  plus-jakarta-sans-variable.woff2 ← NEW
  inter-variable.woff2             ← NEW
README.md                          ← MODIFIED (Contrast Validation section)
```

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 1.3" lines 620–643]
- UX hybrid mockup: `_bmad-output/planning-artifacts/ux-design-hybrid.html` (open and copy `--text-*` and palette)
- UX spec colour system: [`ux-design-specification-truvis-landing-page.md` §"Color System" lines 503–552] (background only — hybrid values override)
- UX spec typography: [`ux-design-specification-truvis-landing-page.md` §"Typography System" lines 554–579]
- Architecture stack [`architecture-truvis-landing-page.md` lines 192–197]

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
