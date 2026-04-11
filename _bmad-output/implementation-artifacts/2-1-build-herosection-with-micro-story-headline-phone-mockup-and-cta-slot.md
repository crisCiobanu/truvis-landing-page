# Story 2.1: Build `HeroSection` with micro-story headline, phone mockup and CTA slot

Status: ready-for-dev

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

- [ ] **Task 1 — Add i18n keys** (AC2, AC4, AC6)
  - [ ] 1.1 Edit `src/i18n/en/landing.json`: replace `hero.headline` and `hero.subheadline` with the default English strings in AC2; add `hero.eyebrow`, `hero.ctaPlaceholder`, `hero.phoneAlt`.
  - [ ] 1.2 Mirror the same `hero.*` keys into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` (byte-for-byte English — FR52 V1).
  - [ ] 1.3 Verify `t('landing.hero.headline', 'en')` resolves correctly (quick `npm run dev` check or unit test).

- [ ] **Task 2 — Add the phone-mockup asset** (AC5)
  - [ ] 2.1 Create `src/assets/hero/` directory.
  - [ ] 2.2 Hand-author a compact inline SVG phone mockup (rounded-rect phone frame, teal-slate screen area, "Scan in progress" text line, simple severity summary) at ≤6KB total, OR add a ≤60KB WebP + PNG fallback pair.
  - [ ] 2.3 Confirm final delivered bytes (including any inlined SVG) are under the 80KB budget in AC5.

- [ ] **Task 3 — Create `hero-section.astro`** (AC1–AC5, AC7)
  - [ ] 3.1 Create `src/components/sections/hero-section.astro` with the component header comment, frontmatter imports (`t` from `@/lib/i18n`, `SectionEyebrow` from `@/components/sections/section-eyebrow.astro`, phone mockup import if using `astro:assets`).
  - [ ] 3.2 Derive `locale` from `Astro.currentLocale ?? 'en'`.
  - [ ] 3.3 Build the `<section aria-labelledby="hero-heading">` wrapper with container classes matching `header.astro`.
  - [ ] 3.4 Build the desktop two-column grid and the mobile stacked fallback (AC3).
  - [ ] 3.5 Render `SectionEyebrow` (light), `<h1>`, `<p>` subheadline in the copy column (AC2).
  - [ ] 3.6 Add the `<slot name="cta">` with the disabled placeholder button fallback — **data-testid must match AC4 exactly** (AC4).
  - [ ] 3.7 Render the phone mockup with `loading="eager"`, `fetchpriority="high"`, explicit width/height, and `alt` from i18n (AC5).
  - [ ] 3.8 Verify zero `client:*` directives and that all strings route through `t()` (AC1, AC6).

- [ ] **Task 4 — Wire into `src/pages/index.astro`** (AC8)
  - [ ] 4.1 Import and render `<HeroSection />` inside `<BaseLayout>`.
  - [ ] 4.2 Remove the transitional `<section>` + `<h1>` placeholder from Story 1.4.
  - [ ] 4.3 `npm run dev` — verify `/`, `/fr/`, `/de/` render the new hero with identical copy (V1 FR52 behaviour).

- [ ] **Task 5 — Extend the text-expansion harness** (AC7)
  - [ ] 5.1 Edit `src/pages/_demo/text-expansion.astro` to import and render `<HeroSection />`.
  - [ ] 5.2 Inject 140%-padded synthetic strings per the harness's existing pattern from Story 1.7.
  - [ ] 5.3 Manually inspect the demo page at mobile (375px), tablet (768px), desktop (1280px) breakpoints — no clipping, overflow, or truncation.

- [ ] **Task 6 — Accessibility & contrast audit** (AC7)
  - [ ] 6.1 Verify single `<h1>` on `/` via browser devtools.
  - [ ] 6.2 Verify Tab reaches the disabled CTA button and a visible focus ring renders.
  - [ ] 6.3 Verify `prefers-reduced-motion: reduce` is a no-op for the hero (no transitions to disable).
  - [ ] 6.4 Confirm subheadline contrast ≥4.5:1 against `#FFFDF9`. If `--color-muted` (`#5F6F7E`) fails, swap to `--color-primary`.
  - [ ] 6.5 Run the axe DevTools extension (or `@axe-core/cli` if available locally) on `/` and record zero violations.

- [ ] **Task 7 — Build, lint, type-check, Lighthouse** (AC8, AC9)
  - [ ] 7.1 `npx astro check` — clean.
  - [ ] 7.2 `npx eslint . && npx prettier --check .` — clean.
  - [ ] 7.3 `npm run build && npm run preview` — verify `dist/` is produced and hero renders.
  - [ ] 7.4 Inspect `dist/` assets: confirm phone-mockup payload ≤80KB and total initial weight ≤500KB.
  - [ ] 7.5 Let CI Lighthouse run on the PR; verify Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1. If any budget fails, fix the hero — do **not** raise budgets.

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.

### File List
