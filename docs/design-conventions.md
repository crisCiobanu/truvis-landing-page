# Truvis — Design Conventions

Single-page reference for how sections fit together visually, how they pace the reader, and which brand tokens paint each surface. This is a contract between design (the `_bmad-output/planning-artifacts/ux-design-hybrid.html` visual source of truth) and implementation (`src/components/sections/`).

## Section Colour Rhythm (UX-DR3)

The landing page alternates background surfaces in a deliberate, narrative-pacing sequence — **not** a decorative alternation. Every section below is mapped to one of the Truvis palette tokens (`src/styles/global.css` → `@theme`).

| #   | Section                             | Background          | Token                            |
| --- | ----------------------------------- | ------------------- | -------------------------------- |
| 1   | Hero                                | Warm white          | `var(--color-bg)` `#FFFDF9`      |
| 2   | Problem statement                   | Off-white surface   | `var(--color-surface)` `#F7F5F2` |
| 3   | Inspection story (immersive scroll) | Deep primary (dark) | `var(--color-primary)` `#2E4057` |
| 4   | Social proof / testimonials         | Warm white          | `var(--color-bg)` `#FFFDF9`      |
| 5   | Blog previews                       | Off-white surface   | `var(--color-surface)` `#F7F5F2` |
| 6   | FAQ                                 | Warm white          | `var(--color-bg)` `#FFFDF9`      |
| 7   | Footer CTA (dark bookend)           | Deep primary (dark) | `var(--color-primary)` `#2E4057` |
| 8   | Footer (metadata)                   | Off-white surface   | `var(--color-surface)` `#F7F5F2` |

### Why this rhythm exists

The sequence is **intentional narrative pacing**, not arbitrary alternation:

- The opening **white hero** gives the headline maximum visual weight with no competing surface tone — the reader's first visual anchor.
- The **off-white problem section** signals "we're leaving the marketing promise and entering reality". The tonal step is gentle enough to feel like continuation, not interruption.
- The **first dark block (inspection story)** is the hinge of the whole page. Dark surfaces reduce peripheral distraction and force focus on the sticky phone mockup — this is where the reader stops skimming and starts reading.
- Returning to **white for social proof** releases the attention the dark block captured, letting testimonial cards breathe.
- **Off-white blog previews** echo the earlier problem section's tone, visually bracketing the content middle of the page.
- **White FAQ** is the final light surface — a calm "answer phase" before the commitment ask.
- The **dark footer CTA** is the second and final dark block; it bookends the dark inspection story and forms the page's commitment moment. Repeating the hinge colour at the end makes the CTA feel like a conclusion the reader has already been prepared for.

### Implementation rules

1. Never introduce a section background outside of `--color-bg`, `--color-surface`, or `--color-primary`. Accent surfaces (`--color-surface-2`, `--color-surface-3`) are reserved for cards and callouts **inside** a section — never for the section root.
2. Do not add, reorder, or remove a section without updating this table.
3. The dark-surface sections (#3 and #7) MUST use `SectionEyebrow` in its `variant="dark"` form; the light-surface sections MUST use `variant="light"` (UX-DR11).
4. Contrast ratios for text on each surface are pre-computed in `ux-design-hybrid.html` and meet WCAG AA (≥ 4.5:1 for body, ≥ 3:1 for large display). Re-validate whenever a token changes.

## Motion tokens (UX-DR32)

Every transition and animation MUST reference one of the three canonical duration tokens defined in `src/styles/global.css` `@theme`:

| Token             | Value   | Use for                                                              |
| ----------------- | ------- | -------------------------------------------------------------------- |
| `--duration-fast` | `150ms` | Hover/active feedback, tap ripples, small colour shifts              |
| `--duration-base` | `250ms` | Most UI transitions — drawer open, dropdown expand, button state     |
| `--duration-slow` | `400ms` | Larger spatial moves — full-screen modal, sticky-scroll choreography |

`@media (prefers-reduced-motion: reduce)` in `global.css` cuts every transition to `0.01ms`. Any exception for essential motion must be opted-in with a code comment citing UX-DR32.

## Content Collection access boundary (AR25)

All `getCollection()` and `getEntry()` calls go through `src/lib/content.ts`. This is enforced by convention and code review — no other file in the repo may call `getCollection()` or `getEntry()` directly.

Collections managed by this boundary:

| Collection     | Type    | Entry pattern                       |
| -------------- | ------- | ----------------------------------- |
| `blog`         | content | Markdown articles under `blog/`     |
| `faq`          | data    | JSON entries under `faq/`           |
| `testimonials` | data    | JSON entries under `testimonials/`  |
| `stats`        | data    | JSON entries under `stats/`         |
| `siteContent`  | data    | Single entry: `siteContent/landing` |

Consumers import typed helpers (`getFaqEntries()`, `getTestimonials()`, `getStats()`, `getSiteContent()`, `getAllBlogPosts()`, etc.) from `@/lib/content`. Raw `CollectionEntry` types never leak out — every helper returns a `*View` type.

## References

- Visual source of truth: `_bmad-output/planning-artifacts/ux-design-hybrid.html`
- UX spec: `_bmad-output/planning-artifacts/ux-design-specification-truvis-landing-page.md` §"Visual rhythm"
- PRD: `_bmad-output/planning-artifacts/prd-truvis-landing-page.md` UX-DR3, UX-DR11, UX-DR32
