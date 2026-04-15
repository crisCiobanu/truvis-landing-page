# Story 4.6: Build the inline blog-article CTA block with pre-launch waitlist variant and post-launch slot

Status: ready-for-dev

## Story

As **a visitor who just finished an article and is now a warmer lead than five minutes ago**,
I want **a clear, in-context invitation to join the waitlist (pre-launch) or download the app (post-launch)**,
so that **the editorial content has a visible conversion path and I don't have to scroll back to the landing page to sign up**.

## Acceptance Criteria (BDD)

### AC1 — Visually distinct CTA block with warm editorial styling

**Given** FR27 requires blog article CTAs that direct readers to the waitlist (pre-launch) or app store (post-launch),
**When** I create `src/components/blog/blog-inline-cta.astro`,
**Then**

- the component renders a visually distinct block below the article body and above the related-articles strip (Story 4.5),
- the block uses `--color-surface-2` warm background with a `--color-teal` (#3D7A8A) left border accent (or top border, consistent with editorial tone),
- the block uses `--radius-lg` for rounded corners,
- the block stands out from the article prose without jarring the editorial tone.

### AC2 — Block structure with i18n-wired headline and body

**Given** all user-facing strings must route through the `t()` helper,
**When** the block renders,
**Then**

- a short headline is wired to `blog.article.inlineCta.headline` i18n key (EN: "Ready to buy smarter?"),
- a one-sentence body is wired to `blog.article.inlineCta.body` i18n key (EN: "Join thousands of car buyers who inspect with confidence."),
- a CTA area follows the body, phase-switching per AC3/AC4.

### AC3 — Phase-switch constant with Epic 5 TODO marker

**Given** `lib/launch-phase.ts` does not exist yet (Epic 5 scope) and Epic 4 must not import non-existent modules,
**When** I implement the phase switch,
**Then**

- the component does **not** import `lib/launch-phase.ts`,
- a constant `const LAUNCH_PHASE_V1: 'pre' | 'post' = 'pre';` is declared at the top of the component frontmatter,
- immediately above it: `// TODO(epic-5): replace LAUNCH_PHASE_V1 with isPostLaunch() from lib/launch-phase.ts`,
- the component conditionally renders based on `LAUNCH_PHASE_V1`.

### AC4 — Pre-launch variant renders EmailCaptureBlock

**Given** `LAUNCH_PHASE_V1 === 'pre'` (the V1 default),
**When** the block renders,
**Then**

- it renders `<EmailCaptureBlock variant="inline" signupSource="blog-article" />` from Epic 3 Story 3.4,
- the `signupSource="blog-article"` value is distinct from landing-page sources (`"hero"`, `"mid"`, `"footer"`) so Epic 6 analytics can separate blog-originated signups (FR36),
- no `client:*` directive on `blog-inline-cta.astro` itself — `EmailCaptureBlock` handles its own hydration internally.

### AC5 — Post-launch variant renders named slot with fallback placeholder

**Given** `LAUNCH_PHASE_V1 === 'post'` (activated by Epic 8),
**When** the block renders,
**Then**

- it renders a named Astro `<slot name="post-launch-cta">`,
- the slot's fallback content is a disabled "Download the app" button matching the Epic 2 placeholder pattern:
  - `<button type="button" disabled aria-disabled="true">` with teal CTA styling,
  - button label wired to `blog.article.inlineCta.downloadApp` i18n key,
  - a visually-hidden `<span class="sr-only">` with text "Coming soon — filled in Epic 8",
  - `data-cta-slot="blog-inline"` and `data-testid="blog-inline-cta-slot"` attributes for Epic 8 targeting,
- Epic 8 swaps the constant for the real `isPostLaunch()` helper and fills the slot with app store buttons.

### AC6 — Integration into article page

**Given** the CTA block is consumed by the article page from Story 4.4,
**When** I integrate it into `/blog/[year]/[month]/[slug].astro`,
**Then**

- the page renders `<BlogInlineCta />` after the related-articles strip (Story 4.5) and before `<Footer>`,
- every article page renders the same CTA (no per-article override at V1),
- FR/DE locale route wrappers also render the CTA via the shared article template.

### AC7 — i18n strings for all three locales

**Given** the project uses externalized i18n strings,
**When** I add CTA-related keys,
**Then**

- `src/i18n/en/blog.json` adds under `article.inlineCta`:
  - `headline` — "Ready to buy smarter?"
  - `body` — "Join thousands of car buyers who inspect with confidence."
  - `downloadApp` — "Download the app" (post-launch fallback button label)
- `src/i18n/fr/blog.json` and `src/i18n/de/blog.json` mirror all keys with placeholder English values.

### AC8 — Accessibility and performance

**Given** WCAG 2.1 AA and CI Lighthouse budgets are enforced,
**When** I audit the CTA block,
**Then**

- the block is wrapped in a semantic `<aside aria-label="Call to action">` (or equivalent landmark),
- the post-launch fallback button's disabled state is conveyed to assistive tech via both `disabled` and `aria-disabled="true"`,
- the visually-hidden "Coming soon" text is present for screen readers,
- the block passes 140% text expansion without layout breakage (UX-DR31),
- axe-core reports zero violations,
- CI Lighthouse budgets (Performance >= 90, Accessibility >= 90, SEO >= 95) pass.

## Tasks / Subtasks

- [ ] **Task 1 — Add i18n strings** (AC: 7)
  - [ ] T1.1 Add `article.inlineCta.headline`, `article.inlineCta.body`, `article.inlineCta.downloadApp` keys to `src/i18n/en/blog.json`
  - [ ] T1.2 Mirror all keys in `src/i18n/fr/blog.json` with placeholder English values
  - [ ] T1.3 Mirror all keys in `src/i18n/de/blog.json` with placeholder English values

- [ ] **Task 2 — Create `src/components/blog/blog-inline-cta.astro`** (AC: 1, 2, 3, 4, 5, 8)
  - [ ] T2.1 Add frontmatter with `LAUNCH_PHASE_V1` constant and `TODO(epic-5)` comment:
    ```astro
    ---
    // TODO(epic-5): replace LAUNCH_PHASE_V1 with isPostLaunch() from lib/launch-phase.ts
    const LAUNCH_PHASE_V1: 'pre' | 'post' = 'pre';

    import EmailCaptureBlock from '@/components/forms/email-capture-block.astro';
    import { t, type Locale } from '@/lib/i18n';

    const locale = (Astro.currentLocale ?? 'en') as Locale;
    ---
    ```
  - [ ] T2.2 Wrap the block in `<aside aria-label="Call to action">` with editorial styling:
    ```
    bg-[var(--color-surface-2)]
    border-l-4 border-[var(--color-teal)]
    rounded-[var(--radius-lg)]
    p-6 sm:p-8
    my-8
    ```
  - [ ] T2.3 Render headline via `t('blog.article.inlineCta.headline', locale)` in an `<h2>` or `<p>` with heading styling (`font-display`, `text-lg font-semibold`, `--color-primary`)
  - [ ] T2.4 Render body text via `t('blog.article.inlineCta.body', locale)` in a `<p>` with `--color-primary` at body size
  - [ ] T2.5 Pre-launch branch (`LAUNCH_PHASE_V1 === 'pre'`): render `<EmailCaptureBlock variant="inline" signupSource="blog-article" />`
  - [ ] T2.6 Post-launch branch (`LAUNCH_PHASE_V1 === 'post'`): render `<slot name="post-launch-cta">` with fallback:
    ```astro
    <slot name="post-launch-cta">
      <div data-cta-slot="blog-inline" data-testid="blog-inline-cta-slot">
        <!-- TODO(epic-8): replace fallback with real app store buttons -->
        <button
          type="button"
          disabled
          aria-disabled="true"
          class="inline-flex items-center rounded-md bg-[var(--color-teal)] px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {t('blog.article.inlineCta.downloadApp', locale)}
        </button>
        <span class="sr-only">Coming soon — filled in Epic 8</span>
      </div>
    </slot>
    ```
  - [ ] T2.7 Add `// TODO(epic-6): trackEvent('blog_cta_view', { placement: 'inline' })` comment in the template

- [ ] **Task 3 — Integrate into article page** (AC: 6)
  - [ ] T3.1 Import `BlogInlineCta` in `src/pages/blog/[year]/[month]/[slug].astro` (or its shared article template component)
  - [ ] T3.2 Render `<BlogInlineCta />` after the related-articles strip (Story 4.5) and before `</main>` / `<Footer>`
  - [ ] T3.3 Remove the `<!-- TODO(story-4.6): BlogInlineCta component -->` placeholder comment left by Story 4.4
  - [ ] T3.4 Verify FR/DE locale wrappers (`src/pages/fr/blog/[year]/[month]/[slug].astro`, `src/pages/de/blog/[year]/[month]/[slug].astro`) inherit the CTA via the shared template — no separate integration needed

- [ ] **Task 4 — Accessibility and text-expansion audit** (AC: 8)
  - [ ] T4.1 Verify `<aside aria-label="Call to action">` wraps the block
  - [ ] T4.2 Verify post-launch fallback button has both `disabled` and `aria-disabled="true"`
  - [ ] T4.3 Verify visually-hidden "Coming soon" `<span class="sr-only">` is present
  - [ ] T4.4 Verify 140% text expansion does not break layout (test with longer FR/DE placeholder strings)
  - [ ] T4.5 Run axe-core — zero violations
  - [ ] T4.6 Verify CI Lighthouse budgets pass

## Dev Notes

### Phase-switch pattern

This story uses the same phase-toggle strategy as Epic 2's `SocialProofSection` (Story 2.6), but with a local constant instead of a commented-out import. The progression:

1. **Story 4.6 (this story)**: `const LAUNCH_PHASE_V1: 'pre' | 'post' = 'pre';` with TODO marker
2. **Epic 5 Story 5.3**: Ships `lib/launch-phase.ts` with `isPostLaunch()`
3. **Epic 5 Story 5.4**: Sweeps all `LAUNCH_PHASE_V1` constants and replaces with `isPostLaunch()`
4. **Epic 8**: Fills the `<slot name="post-launch-cta">` with real app store buttons

The constant is typed as `'pre' | 'post'` so TypeScript catches invalid values. At V1, only the `'pre'` branch executes — the `'post'` branch (with slot fallback) is dead code that exists for Epic 8 readiness.

### EmailCaptureBlock integration

Epic 3 Story 3.4 builds `EmailCaptureBlock` as a Tier 2 Astro composite that accepts:
- `variant`: `'hero' | 'mid' | 'footer' | 'inline'` — controls layout/styling
- `signupSource`: string — passed through to the API for analytics attribution

The `variant="inline"` styling is designed for embedding within content areas (blog articles, confirmation pages). The `signupSource="blog-article"` value is distinct from landing-page sources so Epic 6 can segment conversions.

`blog-inline-cta.astro` does **not** add any `client:*` directive — `EmailCaptureBlock` manages its own island hydration internally (it embeds a `WaitlistForm` React island with `client:visible`).

### Post-launch fallback pattern

The fallback placeholder matches the exact pattern established in Epic 2 (`hero-section.astro`, `footer-cta-section.astro`):
- `data-cta-slot="blog-inline"` for Epic 8 grep-replace targeting
- `data-testid="blog-inline-cta-slot"` for testing
- `disabled` + `aria-disabled="true"` on the button
- Teal CTA button styling matching `bg-[var(--color-teal)]` pattern
- `<span class="sr-only">Coming soon — filled in Epic 8</span>` for screen readers

### Semantic markup choice

The block uses `<aside>` rather than `<section>` because it is supplementary content — a call-to-action tangential to the article's main editorial content. The `aria-label="Call to action"` provides a landmark label for screen reader navigation.

The headline inside the aside should use a heading level appropriate to its position in the document outline. If the article body ends with `<h2>` sections, the CTA headline should be an `<h2>` to maintain flat sibling structure, or a styled `<p>` to avoid adding to the document outline. Evaluate based on the article page's heading hierarchy from Story 4.4.

### Project Structure Notes

New files:

```
src/components/blog/blog-inline-cta.astro    <- Tier 2: inline CTA with phase switch
```

Modified files:

```
src/pages/blog/[year]/[month]/[slug].astro   <- Import and render BlogInlineCta (remove TODO placeholder)
src/i18n/en/blog.json                        <- Add article.inlineCta.* keys
src/i18n/fr/blog.json                        <- Mirror with placeholder English
src/i18n/de/blog.json                        <- Mirror with placeholder English
```

### Architecture compliance

- **Three-tier hierarchy (AR23)**: `blog-inline-cta.astro` is Tier 2 in `components/blog/`. It composes Tier 2 `EmailCaptureBlock` from `components/forms/` (peer Tier 2 import is acceptable — both are composites consumed by Tier 3 pages). No upward dependency on pages or layouts.
- **Hydration policy (AR27)**: No `client:*` directive on this component. `EmailCaptureBlock` handles its own hydration. The post-launch fallback is pure static HTML.
- **Content access (AR25)**: No `getCollection()` calls — this component has no content collection dependency.
- **Env vars**: No env var reads — the phase is determined by a local constant (migrated to `lib/launch-phase.ts` → `lib/env.ts` in Epic 5).
- **i18n**: All user-facing strings via `t()` from `lib/i18n.ts`. No hard-coded marketing copy.
- **NFR5 (500KB budget)**: Zero additional JS payload — the component is pure Astro with no new islands.
- **UX-DR31**: Text expansion tolerance — block uses flexible padding and `max-width` constraints inherited from the article layout. Headline and body are block-level elements that reflow naturally.

### Dependencies

- **Story 3.4** (BLOCKING for pre-launch branch): Provides `EmailCaptureBlock` at `src/components/forms/email-capture-block.astro` with `variant="inline"` and `signupSource` props. If Story 3.4 is not yet complete, the dev agent should stub the import with a `<!-- TODO(story-3.4): uncomment EmailCaptureBlock once available -->` comment and a placeholder `<div>` matching the expected dimensions.
- **Story 4.4** (BLOCKING): Provides the article page at `src/pages/blog/[year]/[month]/[slug].astro` where this component is integrated.
- **Story 4.5** (ORDERING): Provides `blog-related-posts.astro` which appears before this CTA in the page flow. If 4.5 is not yet integrated, this CTA still renders at the correct position (after article body, before footer).
- **Story 1.7** (DONE): `sr-only` utility class for visually-hidden text.
- **Epic 5 Story 5.3/5.4** (FUTURE): Replaces `LAUNCH_PHASE_V1` constant with `isPostLaunch()`.
- **Epic 8** (FUTURE): Fills `<slot name="post-launch-cta">` with real app store buttons.
- **Epic 6** (FUTURE): Wires `trackEvent('blog_cta_view')` and `trackEvent('blog_cta_click')` analytics.

### References

- [Source: epics-truvis-landing-page.md#Story 4.6 — Full acceptance criteria]
- [Source: architecture-truvis-landing-page.md#AR23 — Three-tier component hierarchy]
- [Source: architecture-truvis-landing-page.md#AR25 — Content access only via lib/content.ts]
- [Source: architecture-truvis-landing-page.md#AR27 — Hydration policy]
- [Source: ux-design-specification#UX-DR31 — 140% text expansion tolerance]
- [Source: prd-truvis-landing-page.md#FR27 — Blog article CTAs for waitlist/app store]
- [Source: prd-truvis-landing-page.md#FR36 — Separate blog vs landing-page signup analytics]
- [Source: src/components/sections/hero-section.astro — Epic 2 CTA placeholder pattern (aria-disabled, data-cta-slot)]
- [Source: src/components/sections/footer-cta-section.astro — Epic 2 CTA placeholder pattern (slot fallback)]
- [Source: src/components/sections/social-proof-section.astro — Phase-switch TODO pattern for Epic 5]
- [Source: src/i18n/en/blog.json — Existing blog i18n key structure]

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
