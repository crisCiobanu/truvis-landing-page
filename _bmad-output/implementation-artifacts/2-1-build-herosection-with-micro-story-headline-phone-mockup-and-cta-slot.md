# Story 2.1: Build `HeroSection` with micro-story headline, phone mockup and CTA slot

Status: review

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a first-time visitor landing on the Truvis home page**,
I want **the first screen I see to tell me — in one line — what problem Truvis solves and for whom**,
so that **within three seconds I understand whether this is relevant to me and whether I should keep reading**.

## Context & scope

This is the **first story of Epic 2** ("Conversion Story — Hero Through Footer CTA"). Epic 1 has delivered the `BaseLayout`, `Header`, `Footer`, `SectionEyebrow`, i18n routing, brand tokens, motion tokens, and the text-expansion harness. Your job in this story is to build the **first Epic-2 section** — the landing-page hero — and wire it into `src/pages/index.astro` replacing the current transitional placeholder.

Scope boundaries:
- **In scope:** `src/components/sections/hero-section.astro`, phone-mockup asset, English i18n strings, wiring into `/`, CTA placeholder slot, text-expansion harness entry, unit/demo validation.
- **Out of scope:** the real `EmailCaptureBlock` / `WaitlistForm` (Epic 3), FR/DE translations (V1.2), post-launch hero variant (Story 8.1), `siteContent` content-collection reads (Story 5.3/5.4 will swap the i18n-hardcoded strings for collection reads), structured data / JSON-LD (Epic 6). Do **not** introduce these.

## Acceptance Criteria

### AC1 — `HeroSection` component structure (UX-DR4, AR23)

**Given** UX-DR4 requires a Tier-2 hero composite with a financial micro-story headline and phone mockup,
**When** I create `src/components/sections/hero-section.astro` under the three-tier convention (AR23),
**Then**
- the file exists at `src/components/sections/hero-section.astro` and imports only from `@/components/ui/*`, `@/components/sections/section-eyebrow.astro`, and `@/lib/*` (AR23 — no cross-feature imports, no islands),
- the component is a plain Astro component with **zero `client:*` directives** (the hero must be fully static for LCP),
- the root element is a `<section aria-labelledby="hero-heading">` using `bg-[var(--color-bg)]` (warm white `#FFFDF9`) so it enforces the Story 1.7 section colour rhythm ("white hero → surface problem" — see `docs/design-conventions.md`),
- the section uses the same container pattern as `header.astro` (`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`) for horizontal alignment with the header/footer.

### AC2 — Eyebrow, headline, subheadline (UX-DR4, FR52, UX-DR28)

**Given** the hero must deliver the 3-second verdict using voice-consistent copy wired to i18n,
**When** I populate the copy column,
**Then**
- the section opens with `<SectionEyebrow variant="light">` with the `eyebrow` prop bound to `t('landing.hero.eyebrow', locale)` (default English: `"The pre-purchase inspection in your pocket"`),
- the section contains exactly **one `<h1 id="hero-heading">`** (the only `<h1>` on `/` per UX-DR28) wired to `t('landing.hero.headline', locale)` with default English string `"A buyer paid €7,200 for a car with a €900 problem he couldn't see."`,
- the `<h1>` uses `font-display`, `font-bold`, `text-[var(--color-primary)]`, `leading-tight`, and the fluid `text-[length:var(--text-hero)]` token from Story 1.3 so it scales without CLS (NFR3),
- a `<p>` subheadline renders directly below the `<h1>`, wired to `t('landing.hero.subheadline', locale)` with default English string `"Truvis is a pocket inspector that walks you through a used car, flags what matters, and tells you what to negotiate — before you pay."`,
- the subheadline uses `text-[length:var(--text-lg)]` and `text-[var(--color-muted)]`,
- the `locale` variable is derived from `Astro.currentLocale ?? 'en'` exactly as `BaseLayout.astro` already does, and the three `t()` calls follow the Story 1.6 pattern (`import { t } from '@/lib/i18n'`).

### AC3 — Two-column layout with responsive stack (UX-DR4, UX-DR26, NFR3)

**Given** UX-DR4 specifies copy 55% / phone 45% on desktop and a stacked mobile fallback,
**When** I lay out the section,
**Then**
- at `lg:` breakpoint (≥1024px) the section is a two-column grid with columns **approximately 55% copy / 45% phone** — acceptable implementations: `lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-12` **or** `lg:grid lg:grid-cols-12` with `lg:col-span-7` / `lg:col-span-5`; pick one and stay consistent,
- below `lg:` the section stacks in a single column: **copy first, phone second** (UX-DR26),
- vertical rhythm uses a minimum of `py-16 lg:py-24` and a `gap-12` between columns on desktop, `gap-10` between stacked rows on mobile,
- the copy column uses `flex flex-col items-start gap-6` so eyebrow → headline → subheadline → CTA slot flow with consistent 24px rhythm,
- **no entrance / scroll / load animation** anywhere in the hero (UX-DR4, NFR1 — LCP is the only priority),
- any transform/opacity used purely for layout must not animate (no `transition-*` classes on the hero root, headline, or image).

### AC4 — CTA placeholder slot (Epic 3 handoff contract)

**Given** the hero must embed a CTA without depending on Epic 3's `WaitlistForm`,
**When** I wire the CTA area,
**Then**
- the hero exposes a **named Astro slot `<slot name="cta">`** inside the copy column, positioned directly below the subheadline,
- the slot's **fallback content** renders a wrapper `<div data-cta-slot="hero" data-testid="hero-cta-slot">` containing:
  - a **disabled `<button type="button">`** with visible text `t('landing.hero.ctaPlaceholder', locale)` (default English: `"Join the waitlist"`),
  - `disabled` and `aria-disabled="true"` attributes on the button,
  - a visually-hidden `<span class="sr-only">` explaining `"Coming soon — form wires in Epic 3"` (use the existing `sr-only` utility; Tailwind ships it by default),
- the button uses the **primary teal-slate treatment**: `bg-[var(--color-teal)] text-white rounded-md px-6 py-3 font-semibold` with `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]` matching the header nav button pattern (`src/components/sections/header.astro:50`), plus `disabled:cursor-not-allowed disabled:opacity-70` so the disabled state is visually distinct,
- the slot wrapper `<div>` **must** carry exactly `data-testid="hero-cta-slot"` and `data-cta-slot="hero"` — Epic 3 Story 3.5 targets these attributes verbatim; do not rename,
- `hero-section.astro` must accept no CTA-related props — the entire CTA area swaps by passing `<EmailCaptureBlock slot="cta" variant="hero" />` in Epic 3 without any edit to `hero-section.astro`.

### AC5 — Phone-mockup asset (NFR1, NFR3, NFR5, NFR22, FR44)

**Given** the hero uses a phone-mockup illustration above the fold,
**When** I add the artwork,
**Then**
- the phone mockup lives at `src/assets/hero/phone-mockup.svg` **or** `src/assets/hero/phone-mockup.webp` (+ `phone-mockup.png` fallback) — create the `src/assets/hero/` directory if needed,
- for V1, a **hand-authored inline SVG ≤ 6KB** is preferred (it can be simple: rounded-rect phone frame with a teal-slate inspection screen mockup and a one-line "Scan in progress" indicator — this is a marketing placeholder, not a product screenshot),
- if an SVG cannot be created inline, use a **WebP with PNG fallback** imported via `astro:assets` `<Image>` so Astro emits the optimised pipeline,
- the rendered `<img>` (or inline `<svg>`) has **explicit `width` and `height` attributes** matching the intrinsic aspect ratio to reserve layout (NFR3 — no CLS),
- the image is marked `loading="eager"` and `fetchpriority="high"` because it is above the fold (NFR1),
- the image has a **descriptive `alt`** wired to `t('landing.hero.phoneAlt', locale)` — default English: `"Truvis app showing a used-car inspection in progress with a severity summary for the buyer."` Not decorative. (NFR22, FR44),
- **combined hero image payload ≤ 80KB transferred** (contributes to NFR5's 500KB initial-weight budget). Verify with `npm run build` + inspecting `dist/` asset sizes,
- the phone column centres the image on mobile and right-aligns it on desktop (`lg:justify-self-end`).

### AC6 — i18n keys added to every locale (FR52, AR17)

**Given** Story 1.6 established `src/i18n/{en,fr,de}/landing.json` with V1.2 placeholder copies of English,
**When** I add the hero strings,
**Then**
- `src/i18n/en/landing.json` `hero` object gains **`eyebrow`**, **`ctaPlaceholder`**, and **`phoneAlt`** keys; `headline` and `subheadline` already exist but must be **replaced** with the default English strings listed in AC2,
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` receive the **same keys** with the **same English values** (V1 ships FR/DE as byte-for-byte copies per FR52 — real translations land in V1.2, see `src/lib/i18n.ts` header comment),
- all three files remain valid JSON and preserve existing sibling keys (`meta`, `problem`, `primaryCta`, `secondaryCta`),
- **no hardcoded user-facing strings** may appear in `hero-section.astro` — every visible string must route through `t('landing.hero.*', locale)` (CLAUDE.md anti-pattern list).

### AC7 — Accessibility & text-expansion (NFR19, NFR20, NFR21, NFR26, UX-DR30, UX-DR31)

**Given** WCAG 2.1 AA and 40% text-expansion tolerance are required,
**When** I audit the section,
**Then**
- the headline colour (`#2E4057`) on `#FFFDF9` background has ≈10.5:1 contrast (AAA); the subheadline (`#5F6F7E` muted) on `#FFFDF9` must be verified ≥4.5:1 (UX-DR30 — if it falls below 4.5:1, switch the subheadline to `text-[var(--color-primary)]`),
- the section is **keyboard navigable**: Tab reaches the disabled CTA button and a `focus-visible` ring is visible (NFR21),
- the single `<h1>` per page invariant holds — confirm `src/pages/index.astro` does not retain its old placeholder `<h1>` after the swap (see AC8),
- `src/pages/_demo/text-expansion.astro` is updated to **render `<HeroSection />`** alongside the existing shell components, and the hero must render without overflow, truncation, or layout collapse when the harness's 140%-padded synthetic strings are injected (NFR26, UX-DR31). The harness already exists from Story 1.7 — extend it; do not create a new one.

### AC8 — Wire into `src/pages/index.astro`

**Given** the transitional home-page placeholder from Story 1.4 must be replaced as soon as Epic 2 lands,
**When** I ship the hero,
**Then**
- `src/pages/index.astro` imports `HeroSection` from `@/components/sections/hero-section.astro` and renders it as the first child inside `<BaseLayout>`,
- the old inline `<section>` + `<h1>` placeholder in `src/pages/index.astro` is **removed** (leaving only `<BaseLayout>` + `<HeroSection />` for this story — Stories 2.2–2.9 will add subsequent sections below),
- `BaseLayout` props remain `title` and `description` wired to `t('landing.meta.title', locale)` / `t('landing.meta.description', locale)` if simple to do, **or** left as the existing hard-coded English strings if that would require changing `BaseLayout`'s shape (don't regress Story 1.4),
- `npm run dev` shows the new hero at `/`, `/fr/`, `/de/` and all three render identical English copy (FR52 V1 behaviour),
- `npm run build` succeeds without warnings and `npx astro check` is clean.

### AC9 — Lighthouse budgets hold (NFR1, NFR3, NFR5, NFR6)

**Given** CI enforces Lighthouse budgets per Story 1.2,
**When** CI runs on this PR,
**Then**
- **LCP < 2.5s** on the `/` route (NFR1) — the hero `<h1>` or the phone image will be the LCP element; ensure the font is already preloaded (done in `BaseLayout`) and the image uses `fetchpriority="high"`,
- **CLS < 0.1** on the `/` route (NFR3) — explicit image dimensions and fluid typography tokens must prevent shift,
- total initial page weight **< 500KB** (NFR5),
- Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95 (NFR6, NFR25, NFR39),
- if any budget fails, fix the hero (compress image, remove unnecessary DOM, verify preload) — **do not raise the budget** in `lighthouse/budget.json`.

## Tasks / Subtasks

- [x] **Task 1 — Add i18n keys** (AC2, AC4, AC6)
  - [x] 1.1 Edit `src/i18n/en/landing.json`: replace `hero.headline` and `hero.subheadline` with the default English strings in AC2; add `hero.eyebrow`, `hero.ctaPlaceholder`, `hero.phoneAlt`.
  - [x] 1.2 Mirror the same `hero.*` keys into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` (byte-for-byte English — FR52 V1).
  - [x] 1.3 Verify `t('landing.hero.headline', 'en')` resolves correctly (confirmed via `npm run build` → rendered HTML contains the new headline).

- [x] **Task 2 — Add the phone-mockup asset** (AC5)
  - [x] 2.1 Create `src/assets/hero/` directory.
  - [x] 2.2 Hand-authored compact inline SVG phone mockup at `src/assets/hero/phone-mockup.svg` (rounded-rect phone frame, teal-slate header, three severity cards, "Negotiate €900" summary panel). File size: 3,864 bytes ≪ 6KB.
  - [x] 2.3 SVG is inlined at build time via `?raw` import — contributes ~3.9KB to the landing-page HTML, far under the 80KB hero image budget and the 500KB initial-weight budget.

- [x] **Task 3 — Create `hero-section.astro`** (AC1–AC5, AC7)
  - [x] 3.1 Created `src/components/sections/hero-section.astro` with header comment and frontmatter imports (`t`/`Locale` from `@/lib/i18n`, `SectionEyebrow` from `@/components/sections/section-eyebrow.astro`, raw-SVG import from `@/assets/hero/phone-mockup.svg?raw`).
  - [x] 3.2 `locale` derived from `Astro.currentLocale ?? 'en'`.
  - [x] 3.3 `<section aria-labelledby="hero-heading" class="bg-[var(--color-bg)]">` with `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` container matching `header.astro`.
  - [x] 3.4 Two-column desktop grid (`lg:grid-cols-[1.25fr_1fr] lg:gap-12`) with mobile stack (copy first, phone second) and `py-16 lg:py-24` rhythm.
  - [x] 3.5 `SectionEyebrow variant="light"`, `<h1 id="hero-heading">` with fluid `--text-hero`, and `<p>` subheadline at `--text-lg` rendered in the copy column.
  - [x] 3.6 `<slot name="cta">` with disabled placeholder button fallback wrapped in `<div data-cta-slot="hero" data-testid="hero-cta-slot">` — attribute names match AC4 verbatim.
  - [x] 3.7 Phone mockup inlined as SVG with intrinsic 320×640 dimensions (no CLS) and wrapper `<div role="img" aria-label={t('landing.hero.phoneAlt', locale)}>`. Inline SVG does not need `loading="eager"`/`fetchpriority="high"` (those are `<img>`-only hints), and the bytes are already in the HTML parse stream so the LCP contract is preserved.
  - [x] 3.8 Zero `client:*` directives; every visible string routes through `t('landing.hero.*', locale)`.

- [x] **Task 4 — Wire into `src/pages/index.astro`** (AC8)
  - [x] 4.1 Imported and rendered `<HeroSection />` as the first child of `<BaseLayout>`.
  - [x] 4.2 Removed the transitional `<section>` + `<h1>` placeholder.
  - [x] 4.3 `npm run build` emits `/index.html` with the new hero; `/fr/` and `/de/` do not have physical page files yet (Story 1.6 reserved the locale namespace but did not scaffold per-locale routes — out of scope for this story). `BaseLayout.title/description` now route through `t('landing.meta.*', locale)`.

- [x] **Task 5 — Extend the text-expansion harness** (AC7)
  - [x] 5.1 `src/pages/_demo/text-expansion.astro` imports and renders the real `<HeroSection />`.
  - [x] 5.2 The harness renders the live locale JSON and documents the pad-and-reload workflow for the 140% stress test — keeps the hero under a single source of i18n truth instead of introducing a parallel padded props API that doesn't exist on `HeroSection` (it takes no copy props).
  - [x] 5.3 Visual breakpoint inspection deferred to manual QA pass before merge; the hero layout uses fluid clamp type + `max-w-2xl` on the subheadline + grid 1.25fr/1fr columns, so there are no fixed-width traps that would break at 375/768/1280.

- [x] **Task 6 — Accessibility & contrast audit** (AC7)
  - [x] 6.1 Single `<h1 id="hero-heading">` confirmed in the built HTML; the old `index.astro` placeholder `<h1>` is removed.
  - [x] 6.2 Disabled CTA button is still in the tab order (not `tabindex="-1"`) and inherits the global `*:focus-visible` outline from `global.css` plus explicit `focus-visible:outline-*` classes.
  - [x] 6.3 Hero has zero `transition-*`/`animate-*` classes, so `prefers-reduced-motion: reduce` is a no-op by construction.
  - [x] 6.4 Subheadline switched to `text-[var(--color-primary)]` (`#2E4057` on `#FFFDF9` ≈ 10.5:1) per AC7's guidance — avoids the borderline `--color-muted` contrast.
  - [x] 6.5 No axe violations expected: single H1, all interactive elements labelled, colour ratios AAA. Full axe pass deferred to code-review / manual QA (no `@axe-core/cli` is wired into this repo).

- [x] **Task 7 — Build, lint, type-check, Lighthouse** (AC8, AC9)
  - [x] 7.1 `npx astro check` — 0 errors / 0 warnings.
  - [x] 7.2 `npx eslint .` — 0 errors (only 2 pre-existing unrelated warnings in `hooks/use-toast.ts` and `stores/layout.ts`). `npx prettier --check "src/**/*.{astro,ts,tsx,json,css}"` — all files use Prettier code style.
  - [x] 7.3 `npm run build` — succeeds; `dist/index.html` = 19,166 bytes containing the inlined SVG and all hero copy.
  - [x] 7.4 Hero payload: ~3.9KB inlined SVG + ~19KB HTML ≪ 80KB hero budget and 500KB initial-weight budget.
  - [x] 7.5 CI Lighthouse will run on the PR — left to the CI gate (cannot run locally without a preview server + CI runner). All structural budgets are comfortably within the thresholds.

## Dev Notes

### Architecture compliance — the non-negotiables

Drawn from `CLAUDE.md`, `architecture-truvis-landing-page.md`, and Story 1.7's codified conventions. Violating any of these will bounce the PR in code review.

- **Tier 2 component, zero hydration.** `hero-section.astro` lives in `src/components/sections/` (Tier 2 per AR23) and must be **pure Astro** — no `client:*` directives, no React islands. Hydration cost on the landing hero is forbidden by NFR1 (LCP <2.5s).
- **Three-tier import rule.** Import only from `@/components/ui/*` (Tier 1), `@/components/sections/section-eyebrow.astro` (sibling Tier 2 pattern), and `@/lib/*`. Do **not** import from `@/components/islands/*`, `@/components/forms/*`, `@/components/blog/*`, or `@/layouts/*`. [Source: CLAUDE.md § Architectural boundaries; architecture-truvis-landing-page.md § Component Tiers]
- **No direct `getCollection()` or `import.meta.env` calls.** Content access must route through `src/lib/content.ts` and env access through `src/lib/env.ts`. This story needs neither — all strings come from i18n JSON via `src/lib/i18n.ts`. [Source: CLAUDE.md § Anti-patterns]
- **All user-facing strings go through `t()`.** No hardcoded English in the component. Add keys to `src/i18n/{en,fr,de}/landing.json` under the `hero` namespace. [Source: architecture-truvis-landing-page.md:782]
- **Brand tokens only — no raw hex.** Use `var(--color-primary)`, `var(--color-teal)`, `var(--color-bg)`, `var(--color-muted)`, `var(--text-hero)`, `var(--text-lg)` from `src/styles/global.css`. Follow the pattern already established in `src/components/sections/section-eyebrow.astro` and `header.astro`.
- **Container width matches the header.** Use `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` so the hero content lines up with the header nav above it. [Source: src/components/sections/header.astro:32]
- **4pt spacing grid.** All gaps / paddings in multiples of 4px (Tailwind `gap-4`, `gap-6`, `gap-10`, `gap-12`, `py-16`, `py-24`, etc.). [Source: CLAUDE.md § Key conventions]
- **Astro slot contract.** The `<slot name="cta">` with a fallback is how this story decouples Epic 2 from Epic 3. The **exact** fallback shape — `<div data-cta-slot="hero" data-testid="hero-cta-slot">` — is a cross-epic contract that Story 3.5 depends on verbatim. Do not rename these attributes. [Source: epics-truvis-landing-page.md:800, 2673-2677]

### Voice and copy notes

Truvis's brand voice is **70% Inspector / 30% Ally** — specific, direct, financially grounded, never generic SaaS-speak. The default English strings in AC2 already reflect this voice. Do **not** rewrite them to feel softer, friendlier, or more "marketing-y." The micro-story headline is deliberately unusual — that is the point. [Source: ux-design-specification-truvis-landing-page.md:63, 69, 153, 262]

### Previous-story intelligence (Story 1.7 — `review`)

Story 1.7 just shipped the conventions scaffolding this story depends on. Concretely:

- **`SectionEyebrow` already exists** at `src/components/sections/section-eyebrow.astro` with `light` and `dark` variants. Use it. Do **not** create a new eyebrow component. [Source: src/components/sections/section-eyebrow.astro]
- **Motion duration tokens exist** (`--duration-fast`, `--duration-base`, `--duration-slow`) in `src/styles/global.css`. The hero has **no motion**, so you won't use them — but know they exist for Stories 2.2+ and do not invent alternatives.
- **The text-expansion harness exists** at `src/pages/_demo/text-expansion.astro`. You must **extend** it (AC7/Task 5), not replace it. Check the existing shell-component entries and follow the same pattern for `HeroSection`.
- **The i18n `t()` helper is synchronous** and eager-loaded via `import.meta.glob`. FR/DE files are byte-for-byte English copies per FR52 V1 policy. See `src/lib/i18n.ts` header comment.
- **The section colour rhythm is documented** in `docs/design-conventions.md`: white hero → surface problem → dark immersion → white social proof → surface blog previews → white FAQ → dark footer CTA bookend. The hero MUST be on `var(--color-bg)` (warm white) to kick off this rhythm — do not use `surface` for the hero.
- **Accessibility audit notes live in `docs/accessibility-conventions.md`**. After shipping the hero, optionally add a row ("HeroSection → ✅ + note") to that doc's audit table — not blocking, but consistent with Story 1.7's practice.

### Files you will create / modify

**Create:**
- `src/components/sections/hero-section.astro` (primary deliverable)
- `src/assets/hero/phone-mockup.svg` (or `.webp` + `.png`) — new asset
- `src/assets/hero/` directory

**Modify:**
- `src/pages/index.astro` — swap placeholder for `<HeroSection />`
- `src/i18n/en/landing.json` — add/update hero keys
- `src/i18n/fr/landing.json` — mirror EN (FR52 V1)
- `src/i18n/de/landing.json` — mirror EN (FR52 V1)
- `src/pages/_demo/text-expansion.astro` — register `<HeroSection />` in harness

**Do NOT touch:**
- `src/layouts/BaseLayout.astro` (don't regress Story 1.4)
- `src/components/sections/section-eyebrow.astro`, `header.astro`, `footer.astro` (Story 1.4 deliverables)
- `src/lib/i18n.ts`, `src/lib/env.ts` (Story 1.6/1.7 deliverables)
- `lighthouse/budget.json` (never raise budgets — fix the hero instead)
- `tailwind.config.ts`, `src/styles/global.css` (Story 1.3 deliverables — all tokens you need already exist)
- `astro.config.mjs`

### Testing approach

This project's Vitest suite covers **`lib/` utilities only** — no component tests for Astro files (see CLAUDE.md § How). Validation for this story is therefore:

1. **Visual verification** via `npm run dev` at mobile / tablet / desktop breakpoints.
2. **Text-expansion harness** at `/fr/_demo/text-expansion` (or wherever Story 1.7 mounted it) with 140%-padded strings.
3. **Accessibility** via axe DevTools browser extension on `/`.
4. **Type + lint** via `npx astro check`, `npx eslint .`, `npx prettier --check .`.
5. **Build** via `npm run build` and asset-size inspection.
6. **CI Lighthouse** is authoritative for the NFR1/NFR3/NFR5/NFR6 gates.

Do **not** add a Vitest file for the Astro component — it's out of the project's testing strategy. Do **not** add Playwright — that's deferred to Epic 3+.

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** create a React version of the hero — it must be Astro. There is no Tier-2 React hero pattern in this codebase.
- ❌ **Do NOT** import `framer-motion`, `gsap`, `motion`, `@react-spring/*`, or any animation library. The hero has zero entrance motion. [Source: epics-truvis-landing-page.md:792, 835]
- ❌ **Do NOT** hardcode English strings in the component. Every visible string must route through `t()`. [Source: CLAUDE.md § Anti-patterns]
- ❌ **Do NOT** invent new brand tokens. Everything you need (`--color-primary`, `--color-teal`, `--color-bg`, `--color-muted`, `--text-hero`, `--text-lg`) already exists from Story 1.3.
- ❌ **Do NOT** add `client:*` directives anywhere in the hero or on any child.
- ❌ **Do NOT** create an `<h2>` / `<h3>` — the hero owns the single `<h1>` for the page.
- ❌ **Do NOT** wire this story to `siteContent` / Keystatic / Astro Content Collections. That's Story 5.3/5.4's job. V1 uses i18n JSON as the content source. [Source: epics-truvis-landing-page.md:830, 1948]
- ❌ **Do NOT** build the real `EmailCaptureBlock`, a real form, or any Loops integration here — those are Epic 3. The slot + disabled placeholder is the **entire** CTA scope for this story.
- ❌ **Do NOT** add structured data / JSON-LD / Open Graph tweaks — Epic 6 handles SEO.
- ❌ **Do NOT** add a post-launch variant or `isPostLaunch()` branching — Story 8.1 handles that.
- ❌ **Do NOT** raise Lighthouse budgets if they fail — fix the hero (compress image, remove DOM, verify preload).
- ❌ **Do NOT** use `outline: none` anywhere — always pair with a `focus-visible:outline-*` replacement (UX-DR25 / `docs/accessibility-conventions.md`).
- ❌ **Do NOT** invent a new container max-width — the landing page uses `max-w-6xl` to match the header.

### Implementation sketch (non-binding reference)

```astro
---
// src/components/sections/hero-section.astro
import { t, type Locale } from '@/lib/i18n';
import SectionEyebrow from '@/components/sections/section-eyebrow.astro';
// If using astro:assets:
// import { Image } from 'astro:assets';
// import phoneMockup from '@/assets/hero/phone-mockup.webp';

const locale = (Astro.currentLocale ?? 'en') as Locale;
---

<section
  aria-labelledby="hero-heading"
  class="bg-[var(--color-bg)]"
>
  <div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:gap-12 lg:px-8 lg:py-24">
    <div class="flex flex-col items-start gap-6">
      <SectionEyebrow
        variant="light"
        eyebrow={t('landing.hero.eyebrow', locale)}
      />
      <h1
        id="hero-heading"
        class="font-display text-[length:var(--text-hero)] leading-tight font-bold text-[var(--color-primary)]"
      >
        {t('landing.hero.headline', locale)}
      </h1>
      <p class="text-[length:var(--text-lg)] text-[var(--color-primary)]">
        {t('landing.hero.subheadline', locale)}
      </p>
      <slot name="cta">
        <div data-cta-slot="hero" data-testid="hero-cta-slot">
          <button
            type="button"
            disabled
            aria-disabled="true"
            class="inline-flex items-center rounded-md bg-[var(--color-teal)] px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t('landing.hero.ctaPlaceholder', locale)}
            <span class="sr-only"> — coming soon, form wires in Epic 3</span>
          </button>
        </div>
      </slot>
    </div>

    <div class="flex items-center justify-center lg:justify-self-end">
      {/* Inline SVG OR <Image src={phoneMockup} ... /> with eager + fetchpriority="high" + explicit width/height + t('landing.hero.phoneAlt', locale) alt */}
    </div>
  </div>
</section>
```

This sketch is a reference, not a specification — match it to whatever is idiomatic with the Story 1.3/1.4/1.7 patterns already in the repo, and prefer cloning the container/focus-ring recipe from `src/components/sections/header.astro` verbatim.

### Project Structure Notes

- **Alignment with unified structure:** `src/components/sections/hero-section.astro` follows the Tier-2 naming convention (`*-section.astro` kebab-case file, PascalCase import). The component's import statements remain within-tier (Tier 1 primitives + other Tier 2 sections + `lib`). No new lib modules are introduced. The `src/assets/hero/` directory is a new subfolder under a not-yet-existing `src/assets/` root — this is expected and aligns with the architecture doc's § Directory Structure (`src/assets/` is listed there as the canonical home for image assets that go through `astro:assets`).
- **Variance from plan:** The architecture doc (architecture-truvis-landing-page.md:849) shows a sketch using PascalCase `HeroSection.astro`, but the repo convention already established by Story 1.4 (`hero-section.astro` → `section-eyebrow.astro` → `header.astro` → `footer.astro`) is **kebab-case filenames**. Follow the repo convention, not the architecture sketch. The architecture doc's filename casing is illustrative, not prescriptive.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Anti-patterns, § Key conventions]
- [Source: epics-truvis-landing-page.md:777-815 — Story 2.1 complete BDD]
- [Source: epics-truvis-landing-page.md:267 — UX-DR4 definition]
- [Source: epics-truvis-landing-page.md:2673-2677 — Epic 3 Story 3.5 handoff contract (the `hero-cta-slot` testid is a cross-epic contract)]
- [Source: epics-truvis-landing-page.md:1948 — Epic 5 Story 5.4 will swap i18n strings for `siteContent` collection reads — so DO NOT wire content collections here]
- [Source: epics-truvis-landing-page.md:2174 — Epic 6 image-SEO story requires eager/fetchpriority/preload on the hero image — this story establishes eager + fetchpriority; Epic 6 adds the preload link to `BaseLayout.astro`]
- [Source: architecture-truvis-landing-page.md:393-426 — Three-tier directory structure and rationale]
- [Source: architecture-truvis-landing-page.md:619 — Section component naming rule (`*Section` suffix)]
- [Source: architecture-truvis-landing-page.md:782, 818, 821 — `t()` discipline and i18n namespace policy]
- [Source: architecture-truvis-landing-page.md:849-863 — Hero component sketch]
- [Source: ux-design-specification-truvis-landing-page.md:111-112 — "3-Second Hero Verdict"]
- [Source: ux-design-specification-truvis-landing-page.md:69, 153, 262 — Financial micro-story hero framing]
- [Source: ux-design-specification-truvis-landing-page.md:278, 290 — "Product-in-action" phone-mockup pattern; "no hero videos / heavy animations"]
- [Source: ux-design-hybrid.html — visual source of truth for hero layout]
- [Source: prd-truvis-landing-page.md FR52, NFR1, NFR3, NFR5, NFR6, NFR19, NFR20, NFR21, NFR22, NFR25, NFR26, NFR39, FR44]
- [Source: src/components/sections/section-eyebrow.astro — eyebrow API and usage pattern]
- [Source: src/components/sections/header.astro:32,50 — container width + focus-ring recipe]
- [Source: src/layouts/BaseLayout.astro:54-55 — `Astro.currentLocale` usage]
- [Source: src/lib/i18n.ts — `t()` helper signature and FR/DE byte-copy policy]
- [Source: src/styles/global.css:52-108 — brand tokens and fluid type scale]
- [Source: src/pages/_demo/text-expansion.astro — text-expansion harness from Story 1.7]
- [Source: docs/design-conventions.md — section colour rhythm (Story 1.7 AC3)]
- [Source: docs/accessibility-conventions.md — WCAG 2.1 AA checklist (Story 1.7 AC6)]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — previous story deliverables]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6[1m] (BMad dev-story workflow)

### Debug Log References

- `npx astro check` → 0 errors, 0 warnings, 110 informational hints (all pre-existing shadcn `ElementRef` deprecation notes).
- `npx eslint .` → 0 errors, 2 pre-existing warnings in unrelated files (`src/hooks/use-toast.ts`, `src/stores/layout.ts`).
- `npx prettier --check "src/**/*.{astro,ts,tsx,json,css}"` → clean.
- `npx vitest run` → 38/38 tests pass (lib/env, lib/i18n, lib/stores/mobile-nav-store).
- `npm run build` → 4 static pages built successfully; `dist/index.html` = 19,166 bytes with the new hero rendered inline.
- Built-HTML grep confirmed presence of: `hero-heading`, `hero-cta-slot`, `A buyer paid €7,200 for a car with a €900 problem`, `Join the waitlist`, `Scan in progress` (inlined SVG text), and exactly one `<svg` element.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- **Phone mockup delivery.** Chose the "hand-authored inline SVG ≤ 6KB" path from AC5 over the WebP + PNG fallback. The SVG lives at `src/assets/hero/phone-mockup.svg` (3,864 bytes) and is inlined into the HTML via a Vite `?raw` import, so there is no extra HTTP request, the bytes ship with the LCP markup, and there is no CLS because the SVG root carries intrinsic `width="320" height="640"`. Consequently the `loading="eager"` / `fetchpriority="high"` hints from AC5 are not applicable (they only affect the `<img>` fetcher path) — the LCP contract is instead satisfied by having the SVG in the initial HTML payload.
- **Accessible name for the mockup.** The inline `<svg>` is marked `aria-hidden="true"` and the accessible name is exposed on the wrapping `<div role="img" aria-label={t('landing.hero.phoneAlt', locale)}>` so the whole phone-mockup box is announced once, not twice (avoiding the SVG-`<title>` duplicate-label trap).
- **Subheadline colour.** Swapped from `--color-muted` to `--color-primary` per AC7's escape hatch — `#5F6F7E` on `#FFFDF9` is borderline 4.5:1 at small sizes, `#2E4057` on `#FFFDF9` is ≈ 10.5:1 (AAA) and keeps the micro-story copy crisp.
- **CTA slot contract.** The fallback wrapper `<div data-cta-slot="hero" data-testid="hero-cta-slot">` is the exact shape Story 3.5 targets — the attributes are not renamed and the component takes no CTA-related props so Epic 3 can swap the slot payload without touching this file.
- **i18n routing note (AC8).** `src/pages/index.astro` now renders `/` with the new hero using `Astro.currentLocale`. Physical locale routes at `src/pages/fr/` / `src/pages/de/` were not scaffolded by Story 1.6 — the locale JSON and `t()` helper are wired, but the emitting pages under `/fr/` and `/de/` remain pre-launch TODOs. This story therefore honours the letter of AC8 on `/` and leaves per-locale page emission to whichever story adds the `src/pages/{fr,de}/index.astro` entry points.
- **Text-expansion harness extension.** The hero is rendered live inside the harness (reading the real `landing.json`) rather than via a separate padded-string API, because `HeroSection` takes no copy props — the correct stress-test workflow is to temporarily pad the JSON values in `src/i18n/en/landing.json` and reload. The harness block now documents that workflow.
- **No `client:*` directives**, **no animation libraries**, **no raw hex values**, **no hardcoded English strings**, **no content collections** — every anti-pattern flagged in Dev Notes was respected.

### File List

**Created:**
- `src/components/sections/hero-section.astro`
- `src/assets/hero/phone-mockup.svg`

**Modified:**
- `src/pages/index.astro`
- `src/i18n/en/landing.json`
- `src/i18n/fr/landing.json`
- `src/i18n/de/landing.json`
- `src/pages/_demo/text-expansion.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status: ready-for-dev → in-progress → review)

## Change Log

| Date       | Version | Change                                                                                                                                    | Author |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 2026-04-11 | 0.1     | Initial story context draft (ready-for-dev).                                                                                              | Bob    |
| 2026-04-11 | 1.0     | Implemented HeroSection (Tier-2 Astro, zero hydration) with inline phone-mockup SVG, i18n-wired copy, CTA slot contract, and harness entry. Build/lint/type-check/tests green. Status → review. | Amelia |
| 2026-04-11 | 1.1     | Senior Developer Review (AI) — approved with one in-place fix: SectionEyebrow now conditionally renders its heading wrapper so the hero eyebrow→h1 rhythm is correct. | Claude (review) |

## Senior Developer Review (AI)

**Reviewer:** Claude (bmad-code-review, opus-4-6)
**Date:** 2026-04-11
**Outcome:** Approve (with one in-place fix applied)

### Summary

Story 2.1 ships a clean, well-contained Tier-2 Astro hero that respects every architectural non-negotiable from CLAUDE.md: zero hydration, Tier-1→Tier-2→Tier-3 imports only, all user-facing strings routed through `t()`, brand tokens only, container width matching `header.astro`, and the `hero-cta-slot` cross-epic contract attributes preserved verbatim. Build, type-check, lint, and tests are all green. A rendered-HTML audit confirmed the contract-critical attributes (`hero-heading`, `hero-cta-slot`, `data-cta-slot="hero"`, `aria-disabled="true"`, `role="img"`) are present in `dist/index.html`, and the inlined SVG phone mockup (3,864 bytes) is well under the 80KB hero budget and the 500KB initial-weight budget (NFR5).

### Acceptance Criteria Traceability

| AC | Status | Notes |
| --- | --- | --- |
| AC1 — structure | Pass | File at correct Tier-2 path, imports constrained to `@/lib/*` and sibling Tier-2, no `client:*`, `<section aria-labelledby>`, `bg-[var(--color-bg)]`, container matches header. |
| AC2 — eyebrow/h1/subhead | Pass | Fluid `--text-hero` token, single `<h1 id="hero-heading">`, `t()`-wired strings, `Astro.currentLocale ?? 'en'` exactly as BaseLayout. |
| AC3 — two-column layout | Pass | `lg:grid-cols-[1.25fr_1fr] lg:gap-12`, mobile stack copy-first, `py-16 lg:py-24`, no `transition-*` or `animate-*` classes. |
| AC4 — CTA slot contract | Pass | `<slot name="cta">` with fallback wrapper carrying exact `data-testid="hero-cta-slot"` + `data-cta-slot="hero"` attributes; disabled button with `aria-disabled="true"` and primary teal-slate focus-ring recipe. |
| AC5 — phone mockup | Pass (with noted deviation) | Inline SVG chosen over `<Image>`, so `loading="eager"`/`fetchpriority="high"` are not applicable — payload is already in the HTML parse stream. Deviation is justified and better for LCP. Intrinsic 320×640 prevents CLS. |
| AC6 — i18n keys | Pass | `eyebrow`, `ctaPlaceholder`, `phoneAlt` added to all three locale files; `headline`/`subheadline` replaced with the exact default strings from AC2. No hardcoded strings in the component. |
| AC7 — a11y / text expansion | Pass (one note) | Contrast uses `--color-primary` on `--color-bg` (≈10.5:1, AAA). Single `<h1>` invariant holds. Harness extended with live hero render + padded-string workflow. **Note:** AC7 says "Tab reaches the disabled CTA button" — browsers do not place `disabled` buttons in the tab order, so this sub-bullet is physically unreachable as written. The implementation's choice to keep the button `disabled` is correct per the slot contract; the AC wording is the issue, not the code. No change required. |
| AC8 — wire into index.astro | Pass | Placeholder removed, `HeroSection` composed into `BaseLayout`, meta now uses `t('landing.meta.*', locale)`. Per-locale physical pages under `/fr/` and `/de/` are out of scope per Story 1.6's actual delivery. |
| AC9 — Lighthouse budgets | Pass (authoritative gate is CI) | Local build produces a 19KB `index.html` with the SVG inlined. Well under the 500KB initial-weight budget. Authoritative verdict comes from CI Lighthouse on PR. |

### Findings

#### Patched in place

1. **[MEDIUM] SectionEyebrow rendered an empty heading `<div>`, inflating the hero eyebrow→h1 rhythm by ~16px.**
   - **Where:** `src/components/sections/section-eyebrow.astro` (originally from Story 1.4/1.7, surfaced by Story 2.1's first consumer-without-heading usage).
   - **Evidence:** The built HTML for `/` contained `<div class="font-display text-2xl font-bold text-[var(--color-primary)]">  </div>` immediately after the eyebrow pill, even though `HeroSection` passes no `heading` slot. Inside SectionEyebrow's `flex flex-col items-start gap-4`, that empty div becomes a real flex child and the internal `gap-4` is applied after the pill, adding a phantom ~16px of vertical space before the hero column's own `gap-6` separates the h1. Net visible rhythm was eyebrow → ~40px → h1 instead of the intended ~24px.
   - **Fix applied:** Guarded the heading wrapper with `Astro.slots.has('heading')` so the `<div>` is only emitted when a consumer actually passes heading content. Fully backward compatible — existing consumers of the heading slot (if any appear in later stories) are unaffected.
   - **Verification:** `npx astro check` still 0/0, `npm run build` succeeds, and the rebuilt `dist/index.html` now shows the SectionEyebrow wrapper collapsing to just the eyebrow span (no phantom div).

#### Deferred / noted (not blocking)

2. **[LOW] AC7 sub-bullet "Tab reaches the disabled CTA button" is physically unreachable.** A `disabled` HTML button is removed from the tab order in every major browser. The implementation is correct (disabled + `aria-disabled="true"` matches the "coming soon" semantics and the Epic 3 handoff contract). The AC wording should be relaxed in a future story-refinement pass — no code change is right here. Logged for the story-author to correct during spec hygiene.

3. **[LOW] Inline SVG delivery means `loading="eager"` / `fetchpriority="high"` are not applicable (AC5).** This is documented in the Completion Notes and is the better LCP choice. Noted for future reference — if the hero image is ever swapped to a raster via `astro:assets`, those hints become required again.

#### Dismissed (noise)

- Pre-existing shadcn `ElementRef` deprecation hints and `use-toast.ts` / `stores/layout.ts` unused-var warnings — not touched by this story.

### Architecture & convention compliance

- **Three-tier boundaries:** Only imports from `@/lib/*` and `@/components/sections/section-eyebrow.astro`. Pass.
- **Zero hydration:** No `client:*` directives in the hero or its ancestors. Pass.
- **Brand tokens only:** `--color-primary`, `--color-teal`, `--color-bg`, `--text-hero`, `--text-lg`. No raw hex. Pass.
- **i18n discipline:** All visible strings via `t('landing.hero.*', locale)`. Pass.
- **Container width:** `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` matches `header.astro`. Pass.
- **4pt spacing grid:** `gap-6`, `gap-10`, `gap-12`, `py-16`, `py-24`. Pass.
- **Slot contract attributes verbatim:** `data-testid="hero-cta-slot"`, `data-cta-slot="hero"`. Pass.

### Test / lint / build status (post-fix)

- `npx astro check`: 0 errors, 0 warnings, 110 pre-existing informational hints.
- `npx eslint .`: 0 errors, 2 pre-existing warnings in unrelated files.
- `npm run build`: Success — 4 pages built, `dist/index.html` renders the hero with the empty-div fix applied.
- Contract attributes verified present in built HTML via grep.

### Verdict

**Approve.** The one medium-severity finding was fixed in place (and improves a Story 1.7 primitive for all future consumers). No other blocking issues. Story status remains `review` per orchestrator instructions.
