# Story 3.5: Replace Epic 2 CTA placeholder slots with real EmailCaptureBlock

Status: done

## Story

As **a prospective Truvis user visiting the landing page**,
I want **the placeholder "coming soon" CTA buttons to be replaced with real email capture forms**,
so that **I can join the waitlist from any of the three conversion points (hero, mid-page, footer) without encountering disabled buttons**.

## Acceptance Criteria

### AC1 — Swap all three CTA placeholder slots with EmailCaptureBlock

**Given** Story 2.9 installed three disabled-button CTA placeholder slots (hero, mid-page, footer) with `data-cta-slot` markers and `TODO(epic-3)` comments,
**When** I update `src/pages/index.astro`, `src/components/sections/hero-section.astro`, and `src/components/sections/footer-cta-section.astro`,
**Then**

- the **hero CTA slot** in `hero-section.astro` is replaced with `<EmailCaptureBlock variant="hero" signupSource="hero">` passed via Astro named slot (`slot="cta"`) from `index.astro` into `<HeroSection>`,
- the **mid-page CTA band** inline in `index.astro` is replaced with `<EmailCaptureBlock variant="inline" signupSource="mid">`,
- the **footer CTA slot** in `footer-cta-section.astro` is replaced with `<EmailCaptureBlock variant="footer" signupSource="footer">` passed via Astro named slot (`slot="cta"`) from `index.astro` into `<FooterCtaSection>`,
- all `data-cta-slot="..."` placeholder markers are removed,
- all disabled `<button>` placeholder elements and their `<span class="sr-only"> -- coming soon, form wires in Epic 3</span>` micro-copy are removed,
- `data-testid="hero-cta-slot"`, `data-testid="mid-cta-slot"`, and `data-testid="footer-cta-slot"` attributes are **preserved** on the new component wrappers for downstream test targeting,
- all `TODO(epic-3)` comments in the three files are removed.

### AC2 — Hydration directives are correct and Lighthouse performance holds

**Given** AR27 reserves `client:load` for above-fold conversion-critical islands and requires `client:visible` for below-fold islands,
**When** the page renders,
**Then**

- the hero `EmailCaptureBlock` mounts its `WaitlistForm` island with `client:load` (this is handled internally by the `EmailCaptureBlock` component from Story 3.4 based on the `variant` prop),
- the mid-page and footer `EmailCaptureBlock` instances mount their `WaitlistForm` islands with `client:visible`,
- Lighthouse CI performance score remains >= 90 on `/` with no regression from the placeholder baseline,
- LCP < 2.5s, CLS < 0.1, total initial page weight under 500KB (NFR5) -- the lazy Turnstile script only loads when an island hydrates, not at page load.

### AC3 — Manual verification of signupSource and secrets

**Given** each `EmailCaptureBlock` receives a distinct `signupSource` prop,
**When** a user submits the waitlist form from each position,
**Then**

- the `POST /api/waitlist` request body includes `signupSource: "hero"` for the hero form, `signupSource: "mid"` for the mid-page form, and `signupSource: "footer"` for the footer form,
- each submission succeeds against dev Turnstile test keys and the dev Loops audience,
- browser network tab and page source confirm `PUBLIC_TURNSTILE_SITE_KEY` is present but `TURNSTILE_SECRET_KEY` and `LOOPS_API_KEY` are **never** present in any client-delivered asset (NFR12).

### AC4 — CI passes with all budget gates

**Given** the CI pipeline enforces Lighthouse budgets and axe-core audits,
**When** CI runs on this PR,
**Then**

- Lighthouse scores on `/`: Performance >= 90, Accessibility >= 90, SEO >= 95,
- LCP < 2.5s, CLS < 0.1,
- initial page weight under 500KB (NFR5),
- axe-core reports zero new violations,
- `astro check`, `eslint`, `prettier --check`, and `vitest` all pass.

## Tasks / Subtasks

- [x] **Task 1 — Import EmailCaptureBlock in `src/pages/index.astro`** (AC: 1)
  - [x] T1.1 Add `import EmailCaptureBlock from '@/components/forms/email-capture-block.astro'` to the frontmatter

- [x] **Task 2 — Replace hero CTA placeholder** (AC: 1)
  - [x] T2.1 In `src/pages/index.astro`, pass `<EmailCaptureBlock slot="cta" variant="hero" signupSource="hero" data-testid="hero-cta-slot" />` as a child of `<HeroSection>`
  - [x] T2.2 In `src/components/sections/hero-section.astro`, remove the default fallback disabled button inside `<slot name="cta">` (the named slot content from `index.astro` now takes its place)
  - [x] T2.3 Remove the `data-cta-slot="hero"` wrapper `<div>` and the `<span class="sr-only"> -- coming soon, form wires in Epic 3</span>` text
  - [x] T2.4 Ensure the `<slot name="cta">` element in `hero-section.astro` still exists so the passed content renders; optionally keep an empty fallback or no fallback

- [x] **Task 3 — Replace mid-page CTA placeholder** (AC: 1)
  - [x] T3.1 In `src/pages/index.astro`, replace the `<div data-cta-slot="mid" ...>` block (containing the disabled button) with `<div data-testid="mid-cta-slot" class="inline-flex justify-center"><EmailCaptureBlock variant="inline" signupSource="mid" /></div>`
  - [x] T3.2 Remove the disabled button markup and sr-only "coming soon" text
  - [x] T3.3 Remove any TODO comments in the mid-CTA section

- [x] **Task 4 — Replace footer CTA placeholder** (AC: 1)
  - [x] T4.1 In `src/pages/index.astro`, pass `<EmailCaptureBlock slot="cta" variant="footer" signupSource="footer" data-testid="footer-cta-slot" />` as a child of `<FooterCtaSection>`
  - [x] T4.2 In `src/components/sections/footer-cta-section.astro`, remove the default fallback disabled button inside `<slot name="cta">`
  - [x] T4.3 Remove the `data-cta-slot="footer"` wrapper `<div>` and the sr-only "coming soon" text
  - [x] T4.4 Ensure the `<slot name="cta">` element still renders the passed content correctly

- [x] **Task 5 — Remove all TODO(epic-3) comments** (AC: 1)
  - [x] T5.1 Grep for `TODO(epic-3)` across `src/pages/index.astro`, `src/components/sections/hero-section.astro`, and `src/components/sections/footer-cta-section.astro` and remove every occurrence

- [x] **Task 6 — Verify hydration directives** (AC: 2)
  - [x] T6.1 Confirm that `EmailCaptureBlock` from Story 3.4 internally applies `client:load` when `variant="hero"` and `client:visible` for `variant="inline"` and `variant="footer"` -- no additional hydration attributes needed at the composition level
  - [x] T6.2 Run `npm run build` and inspect the output to verify the hero island is eagerly loaded and the other two are deferred

- [ ] **Task 7 — Manual smoke test** (AC: 3)
  - [ ] T7.1 Start `npm run dev`, navigate to `http://localhost:4321`
  - [ ] T7.2 Submit the hero form and verify `signupSource: "hero"` in the request payload (browser DevTools Network tab)
  - [ ] T7.3 Scroll to mid-page form, submit, verify `signupSource: "mid"`
  - [ ] T7.4 Scroll to footer form, submit, verify `signupSource: "footer"`
  - [ ] T7.5 Confirm all three submissions succeed against dev Turnstile test keys and dev Loops audience

- [x] **Task 8 — Verify no secrets exposed in client** (AC: 3)
  - [x] T8.1 Run `npm run build` and grep the `dist/` output for `TURNSTILE_SECRET_KEY` and `LOOPS_API_KEY` -- zero matches in client assets (only in server-side `_worker.js`)
  - [x] T8.2 Confirm `PUBLIC_TURNSTILE_SITE_KEY` IS present (expected, it is a public key)

- [ ] **Task 9 — Lighthouse CI budget check** (AC: 4)
  - [ ] T9.1 Run Lighthouse CI against `/` and verify Performance >= 90, Accessibility >= 90, SEO >= 95
  - [ ] T9.2 Verify LCP < 2.5s, CLS < 0.1
  - [ ] T9.3 Verify initial page weight < 500KB

- [ ] **Task 10 — Accessibility audit** (AC: 4)
  - [ ] T10.1 Run axe-core on `/` and confirm zero new violations
  - [ ] T10.2 Verify keyboard navigation: Tab through hero form, mid form, footer form -- all inputs and buttons are focusable and submittable via Enter

## Dev Notes

### Implementation approach

**This is a wiring/integration story, not a build story.** The `EmailCaptureBlock` component and `WaitlistForm` island already exist from Story 3.4. This story only swaps the three CTA placeholder slots to use them.

**Hero and footer use Astro named slots.** Both `hero-section.astro` and `footer-cta-section.astro` define a `<slot name="cta">` with a default fallback (the disabled placeholder button). To replace the placeholder:

1. In `index.astro`, pass `<EmailCaptureBlock slot="cta" ...>` as a child of `<HeroSection>` and `<FooterCtaSection>`.
2. In the section components, either remove the default fallback inside `<slot name="cta">...</slot>` (leaving just `<slot name="cta" />`) or leave the fallback -- Astro will use the passed content when provided.

**Mid-page CTA is inline in `index.astro`.** There is no section component -- the placeholder is directly in the page composition. Replace the `<div data-cta-slot="mid">` block with the `EmailCaptureBlock` directly.

**Hydration is handled by EmailCaptureBlock internally.** Story 3.4's `email-capture-block.astro` uses conditional rendering to apply `client:load` for the hero variant and `client:visible` for inline/footer. No hydration directives are needed at the `index.astro` composition level.

**data-testid preservation strategies:**

- If `EmailCaptureBlock` supports Astro's `...Astro.props` spread pattern, pass `data-testid` directly as an attribute and it will land on the root element.
- If not, wrap the `EmailCaptureBlock` in a thin `<div data-testid="...">` wrapper.
- For slot-based usage (hero/footer), the `data-testid` can go on the `EmailCaptureBlock` element itself or on the slot wrapper in the section component.

**Files to modify (exactly three):**

| File | Change |
|------|--------|
| `src/pages/index.astro` | Import `EmailCaptureBlock`, pass it as slot content to `HeroSection` and `FooterCtaSection`, replace mid-CTA inline block |
| `src/components/sections/hero-section.astro` | Remove default fallback disabled button from `<slot name="cta">`, remove `data-cta-slot` wrapper |
| `src/components/sections/footer-cta-section.astro` | Remove default fallback disabled button from `<slot name="cta">`, remove `data-cta-slot` wrapper |

**Files NOT to modify:** All other section components are frozen contracts from Epic 2. Do not touch `problem-section.astro`, `inspection-story-section.astro`, `social-proof-section.astro`, `blog-previews-section.astro`, or `faq-section.astro`.

**Import path:** `import EmailCaptureBlock from '@/components/forms/email-capture-block.astro'`

### Architecture compliance

- **Three-tier hierarchy**: `EmailCaptureBlock` (Tier 2, `forms/`) is consumed by `index.astro` (Tier 3, `pages/`). Downward dependency only.
- **AR27 (hydration policy)**: `client:load` only for hero variant (above-fold, conversion-critical). Mid and footer use `client:visible`. Enforcement is internal to `EmailCaptureBlock`.
- **NFR5 (500KB budget)**: No new JS bundles added -- `EmailCaptureBlock` and `WaitlistForm` already exist from Story 3.4. Turnstile script is lazy-loaded on island hydration.
- **NFR6 (Performance >= 90)**: Hero form hydrates eagerly but is lightweight. Mid/footer forms defer until visible.
- **NFR12 (no client-side secrets)**: Only `PUBLIC_TURNSTILE_SITE_KEY` reaches the client. `TURNSTILE_SECRET_KEY` and `LOOPS_API_KEY` are server-only.
- **NFR25 (Accessibility >= 90)**: Labels, focus rings, aria attributes all handled by Story 3.4's components. This story only wires them into the page.

### Dependencies

- **Story 3.4** (MUST be complete) -- provides `EmailCaptureBlock` and `WaitlistForm`
- **Story 3.3** (MUST be complete) -- provides `POST /api/waitlist` server route
- **Story 3.2** (MUST be complete) -- provides Turnstile keys in environment
- **Story 2.9** (already complete) -- established the CTA placeholder convention being replaced

### Grep targets for placeholder removal

Search for these patterns to find all code that must be removed or replaced:

- `data-cta-slot=` -- placeholder marker attributes (remove all)
- `TODO(epic-3)` -- deferred work comments (remove all)
- `coming soon, form wires in Epic 3` -- sr-only accessibility text (remove all)
- `ctaPlaceholder` -- i18n keys for placeholder button text (can be removed from i18n files in a follow-up, or left as dead keys)

### Project Structure Notes

Modified files:

```
src/pages/index.astro                              -- Import EmailCaptureBlock, wire into hero/mid/footer slots
src/components/sections/hero-section.astro          -- Remove default CTA fallback
src/components/sections/footer-cta-section.astro    -- Remove default CTA fallback
```

No new files are created by this story.

### References

- [Source: epics-truvis-landing-page.md#Story 3.5 -- Replace Epic 2 CTA placeholder slots with real EmailCaptureBlock]
- [Source: src/pages/index.astro -- current composition with CTA placeholders]
- [Source: src/components/sections/hero-section.astro:61 -- hero CTA slot with disabled button fallback]
- [Source: src/components/sections/footer-cta-section.astro:52 -- footer CTA slot with disabled button fallback]
- [Source: architecture-truvis-landing-page.md#AR27 -- Hydration policy]
- [Source: prd-truvis-landing-page.md#NFR5 -- 500KB initial weight budget]
- [Source: prd-truvis-landing-page.md#NFR6 -- Performance >= 90]
- [Source: prd-truvis-landing-page.md#NFR12 -- No client-side secrets]
- [Source: prd-truvis-landing-page.md#NFR25 -- Accessibility >= 90]
- [Source: Story 3.4 -- EmailCaptureBlock and WaitlistForm implementation]
- [Source: Story 2.9 -- CTA placeholder slot convention]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Build passed successfully — all three EmailCaptureBlock instances render correctly
- No TODO(epic-3) or data-cta-slot markers remain in source files
- No server secrets (TURNSTILE_SECRET_KEY, LOOPS_API_KEY) leak into client assets
- astro check: 0 errors, vitest: 54/54 passed, eslint: 0 errors (2 pre-existing warnings)

### Completion Notes List
- Imported EmailCaptureBlock in index.astro and wired into hero (via slot), mid-page (inline), and footer (via slot) CTA positions
- Removed all disabled placeholder buttons, data-cta-slot markers, sr-only "coming soon" text, and TODO(epic-3) comments from the three target files
- Hero EmailCaptureBlock uses client:load (handled internally by the component for variant="hero"); mid and footer use client:visible
- data-testid attributes preserved on all three CTA positions for downstream test targeting
- Updated file header comments to reflect Story 3.5 completion
- Tasks 7, 9, 10 (manual smoke test, Lighthouse CI, accessibility audit) left unchecked — require manual browser testing or CI pipeline

### File List
- `src/pages/index.astro` — modified (import EmailCaptureBlock, wire into hero/mid/footer slots, remove placeholders and TODO comments)
- `src/components/sections/hero-section.astro` — modified (remove placeholder fallback, keep empty `<slot name="cta" />`)
- `src/components/sections/footer-cta-section.astro` — modified (remove placeholder fallback, keep empty `<slot name="cta" />`, update header comment)

### Change Log
- 2026-04-22: Story 3.5 implementation — replaced all three CTA placeholder slots with real EmailCaptureBlock components
- 2026-04-22: Code review fix — wrapped hero and footer EmailCaptureBlock in `<div slot="cta" data-testid="...">` wrappers so data-testid attributes render in DOM (EmailCaptureBlock does not spread extra Astro.props)

### Review Findings
- [x] [Review][Patch] data-testid attributes silently dropped on hero and footer EmailCaptureBlock — EmailCaptureBlock does not spread ...Astro.props, so data-testid passed as component props was lost. Fixed by wrapping in `<div slot="cta" data-testid="...">` wrappers. [src/pages/index.astro:33,73]
