# Story 5.4: Swap Epic 2/3 hard-coded strings and placeholder data to real Content Collection reads

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor to the landing page**,
I want **the hero, problem section, social proof, FAQ, footer and social media links to be real content that Cristian can edit in Keystatic — not hard-coded placeholder i18n strings**,
so that **Cristian can refine launch copy without a code deploy and the landing page has its final V1 content**.

## Context & scope

This is the **fourth story of Epic 5** ("Content Operations — CMS, Phase Toggle & Rebuild Pipeline"). Stories 5.1, 5.2 and 5.3 created the Content Collections (with schemas + seed data), the Keystatic admin UI, and the `LAUNCH_PHASE` env var mechanism respectively. This story is the **consumption side**: every section component that currently reads placeholder i18n strings via `t('landing.*', locale)` is rewired to read from the `siteContent`, `faq`, `stats` and `testimonials` Content Collections via the typed helpers in `src/lib/content.ts`.

After this story ships, the landing page is entirely content-driven. Cristian can edit any hero headline, FAQ answer, stat value or testimonial quote in Keystatic (or by editing the JSON seed files directly) and a rebuild renders the change — no code deploy required.

Scope boundaries:
- **In scope:** Rewire `HeroSection`, `ProblemSection`, `SocialProofSection`, `FaqSection`, `FooterCtaSection` and `Footer` to read from Content Collections; refactor `FaqAccordion` island to accept items as props; update `lib/content.ts` phase defaults to use `isPostLaunch()`; delete migrated i18n keys from `landing.json`; resolve all remaining `TODO(epic-5)` markers in `src/`; add social-links follow-up task to `docs/launch-checklist.md`.
- **Out of scope:** Keystatic admin UI (Story 5.2 — already done), `lib/launch-phase.ts` creation (Story 5.3 — already done), blog content collection (Epic 4), JSON-LD structured data (Epic 6), post-launch content authoring (Epic 8), real FR/DE translations (V1.2).

## Acceptance Criteria

### AC1 — Section components read from Content Collections instead of i18n

**Given** Epic 2 shipped with placeholder strings in `src/i18n/en/landing.json` for hero, problem, FAQ, social proof and footer-cta copy, and per scope those strings now move to the `siteContent` and `faq`/`stats`/`testimonials` collections,
**When** I sweep Epic 2's section components,
**Then**

- `HeroSection` (`src/components/sections/hero-section.astro`) reads from `getSiteContent()` at build time and renders `siteContent.hero.headline` / `siteContent.hero.subheadline` when `isPostLaunch() === false`, and `siteContent.hero.postLaunchHeadline` / `siteContent.hero.postLaunchSubheadline` when `isPostLaunch() === true` (falling back to the pre-launch values when post-launch fields are blank),
- `ProblemSection` (`src/components/sections/problem-section.astro`) reads from `siteContent.problem.body` (iterating the string array) and `siteContent.problem.stats` (iterating the stats array inline),
- `SocialProofSection` (`src/components/sections/social-proof-section.astro`) reads from `getStats()` and `getTestimonials()` — the phase argument is omitted so it picks up the current phase via `isPostLaunch()` inside `lib/content.ts`,
- `FaqSection` (`src/components/sections/faq-section.astro`) reads from `getFaqEntries()` and passes the items array as props to `FaqAccordion`, replacing the `landing.faq.items` i18n array entirely,
- `FooterCtaSection` (`src/components/sections/footer-cta-section.astro`) reads `siteContent.ctaLabels.preLaunchPrimary` / `postLaunchPrimary` for the CTA button label (passed as a prop or slot to `EmailCaptureBlock` if needed), and the section eyebrow/headline/subheadline remain in i18n (they are not in the `siteContent` schema — only `ctaLabels` is).

### AC2 — Footer social links from siteContent

**Given** FR11 requires social media profile links and Epic 1 wired placeholder `href: '#'` URLs in the `Footer`,
**When** I finalise FR11,
**Then**

- `Footer` (`src/components/sections/footer.astro`) reads `siteContent.socialLinks` from `getSiteContent()` and renders one link per non-empty URL,
- if a social link URL is blank or undefined it is simply not rendered (no empty `<a href="">` or `<a href="#">` tags),
- if the URLs are not yet known at the moment this story ships, the `siteContent.socialLinks` fields are left empty in the seed data and the Footer renders no social icons — a follow-up content task is added to `docs/launch-checklist.md`,
- the `TODO(epic-5)` comment from `src/pages/index.astro` line 10 is removed.

### AC3 — All `TODO(epic-5)` content markers resolved

**Given** every `TODO(epic-5)` content marker in Epic 2/3/4 must be resolved,
**When** I sweep the repo for the markers,
**Then**

- every `TODO(epic-5)` marker in `src/` is either replaced with the appropriate `getSiteContent()` / `getFaqEntries()` / `getStats()` / `getTestimonials()` call, or removed because the underlying work is complete,
- specifically these four markers are resolved:
  1. `src/pages/index.astro:10` — `TODO(epic-5): wire real social URLs inside <Footer>` — REMOVE (Footer now reads from siteContent),
  2. `src/components/sections/social-proof-section.astro:23` — `TODO(epic-5): source stats + testimonial from Content Collections` — REPLACE with real reads,
  3. `src/components/sections/social-proof-section.astro:77` — `TODO(epic-5): once src/lib/launch-phase.ts ships` — REPLACE with real `isPostLaunch()` call and content reads (Story 5.3 wired the phase mechanism; this story wires the content reads),
  4. `src/components/sections/faq-section.astro:44` — `TODO(epic-5): source FAQ items from the faq Content Collection` — REPLACE with real reads,
- the corresponding placeholder i18n keys that are now owned by collections are **deleted** from `src/i18n/en/landing.json` (see Task 8 for the exact keys),
- the French and German JSON locale files (`src/i18n/fr/landing.json`, `src/i18n/de/landing.json`) retain the deleted keys as empty strings — add a top-level `"_migrationNote"` key with value `"Keys marked empty below were migrated to siteContent/faq/stats/testimonials Content Collections in Story 5.4. Re-add locale content in V1.2."` (JSON does not support comments, so this is the next best thing),
- `grep -rn 'TODO(epic-5)' src/` returns zero results after this story completes.

### AC4 — `lib/content.ts` phase defaults finalised

**Given** Story 5.1's `getTestimonials(phase?)` and `getStats(phase?)` used a hard-coded `'pre'` default with a `TODO(epic-5-phase)` comment, and Story 5.3 created `lib/launch-phase.ts` with `isPostLaunch()`,
**When** I finalise `lib/content.ts`,
**Then**

- the `getTestimonials(phase?)` and `getStats(phase?)` default parameters now default to `isPostLaunch() ? 'post' : 'pre'` instead of hard-coded `'pre'`,
- `import { isPostLaunch } from '@/lib/launch-phase'` is added to `lib/content.ts` if not already present (Story 5.3 may have already added it),
- the `// TODO(epic-5-phase)` comments at those default sites are removed,
- Story 5.3's Vitest tests (`tests/launch-phase.test.ts`) continue to pass.

### AC5 — End-to-end verification

**Given** the landing page is now entirely content-driven,
**When** I verify the end-to-end result,
**Then**

- `astro build` succeeds with `LAUNCH_PHASE=pre` and `LAUNCH_PHASE=post`,
- `astro check` reports zero TypeScript errors,
- `npx eslint .` and `npx prettier --check .` pass,
- `npx vitest run` passes (including Story 5.3's launch-phase tests and any new tests),
- the CI Lighthouse budgets continue to pass (NFR5 total < 500KB, NFR6 Performance >= 90),
- axe-core reports zero new violations,
- the landing page renders correctly under 140% synthetic FR/DE placeholder strings (UX-DR31 / NFR26).

## Tasks / Subtasks

- [ ] **Task 1 — Update `lib/content.ts` phase defaults** (AC: 4)
  - [ ] T1.1 Open `src/lib/content.ts`. Add `import { isPostLaunch } from '@/lib/launch-phase'` at the top if not already present
  - [ ] T1.2 Find `getTestimonials(phase?: 'pre' | 'post')` — change the default value from hard-coded `'pre'` to `isPostLaunch() ? 'post' : 'pre'`. The signature becomes: `getTestimonials(phase: 'pre' | 'post' = isPostLaunch() ? 'post' : 'pre')`
  - [ ] T1.3 Find `getStats(phase?: 'pre' | 'post')` — same change
  - [ ] T1.4 Remove the `// TODO(epic-5-phase)` comments at both default sites
  - [ ] T1.5 Verify `npx vitest run` still passes (Story 5.3's `tests/launch-phase.test.ts`)

- [ ] **Task 2 — Rewire `HeroSection` to read from `siteContent`** (AC: 1)
  - [ ] T2.1 Open `src/components/sections/hero-section.astro`
  - [ ] T2.2 Add imports: `import { getSiteContent } from '@/lib/content'` and `import { isPostLaunch } from '@/lib/launch-phase'`
  - [ ] T2.3 In the frontmatter, call `const siteContent = await getSiteContent();`
  - [ ] T2.4 Compute the phase-aware headline and subheadline:
    ```ts
    const headline = isPostLaunch() && siteContent.hero.postLaunchHeadline
      ? siteContent.hero.postLaunchHeadline
      : siteContent.hero.headline;
    const subheadline = isPostLaunch() && siteContent.hero.postLaunchSubheadline
      ? siteContent.hero.postLaunchSubheadline
      : siteContent.hero.subheadline;
    ```
  - [ ] T2.5 Replace `{t('landing.hero.headline', locale)}` with `{headline}` and `{t('landing.hero.subheadline', locale)}` with `{subheadline}`
  - [ ] T2.6 Replace `{t('landing.hero.eyebrow', locale)}` with the eyebrow value. The eyebrow is NOT in the `siteContent` schema — keep it in i18n OR hardcode it if it is stable across locales. **Decision**: keep the eyebrow in i18n (`t('landing.hero.eyebrow', locale)`) since it is a UI label, not editorial content. Same for `phoneAlt`
  - [ ] T2.7 Remove the `t('landing.hero.headline', ...)` and `t('landing.hero.subheadline', ...)` calls. Keep `t('landing.hero.eyebrow', ...)` and `t('landing.hero.phoneAlt', ...)`
  - [ ] T2.8 Keep the `import { t, type Locale } from '@/lib/i18n'` import — it is still needed for eyebrow and phoneAlt

- [ ] **Task 3 — Rewire `ProblemSection` to read from `siteContent`** (AC: 1)
  - [ ] T3.1 Open `src/components/sections/problem-section.astro`
  - [ ] T3.2 Add import: `import { getSiteContent } from '@/lib/content'`
  - [ ] T3.3 In the frontmatter: `const siteContent = await getSiteContent();`
  - [ ] T3.4 Replace the three `<p>` body paragraphs with a `{siteContent.problem.body.map(paragraph => ...)}` loop. Each paragraph renders as `<p class="text-[length:var(--text-lg)] text-[var(--color-primary)]">{paragraph}</p>`
  - [ ] T3.5 The current template has three explicit `<p>` tags for `body.lede`, `body.stat`, `body.stakes`. The `siteContent.problem.body` is a `string[]`. Map over the array to render one `<p>` per entry. This is a structural change — the seed data's `body` array should have 3 entries matching the current content
  - [ ] T3.6 Replace the source note `{t('landing.problem.sourceNote', locale)}` — the source note is embedded in the stats citations in `siteContent.problem.stats`. If the problem section has a dedicated source note, keep it in i18n or add it to the siteContent schema. **Decision**: The problem section's source note (`"Source: placeholder data..."`) was always a placeholder. Remove it and rely on the individual stat `source` fields in `siteContent.problem.stats`. If the problem section needs inline stat display, iterate over `siteContent.problem.stats`
  - [ ] T3.7 Keep `t('landing.problem.eyebrow', locale)` and `t('landing.problem.headline', locale)` in i18n — or migrate headline to siteContent if present in the schema. **Check the siteContent schema**: The schema from Story 5.1 AC5 has `problem: {body: string[], stats: {label, value, source}[]}` but does NOT have `problem.eyebrow` or `problem.headline`. **Decision**: Keep eyebrow and headline in i18n. Only `body` and `stats` move to siteContent
  - [ ] T3.8 Remove unused i18n key references (`t('landing.problem.body.lede', ...)`, `t('landing.problem.body.stat', ...)`, `t('landing.problem.body.stakes', ...)`, `t('landing.problem.sourceNote', ...)`)

- [ ] **Task 4 — Rewire `SocialProofSection` to read from Content Collections** (AC: 1, 3)
  - [ ] T4.1 Open `src/components/sections/social-proof-section.astro`
  - [ ] T4.2 Remove the TODO(epic-5) comments at lines 22-24 and lines 76-88
  - [ ] T4.3 Add imports: `import { getStats, getTestimonials } from '@/lib/content'`
  - [ ] T4.4 In the frontmatter: `const stats = await getStats();` and `const testimonials = await getTestimonials();` — both omit the phase argument so they use the `isPostLaunch()` default from Task 1
  - [ ] T4.5 Replace the three explicit `<StatCard>` blocks with a dynamic loop:
    ```astro
    {stats.map((stat) => (
      <StatCard
        category={stat.category}
        value={stat.value}
        label={stat.label}
        source={stat.source}
      />
    ))}
    ```
  - [ ] T4.6 Verify that `StatCard` props match the `StatView` shape from `lib/content.ts`. Expected props: `category` (teal/amber/coral), `value` (string), `label` (string), `source` (optional string). Check `src/components/sections/stat-card.astro` for the interface
  - [ ] T4.7 Replace the `TrustQuoteCard` with a dynamic read from `testimonials[0]` (the first/featured testimonial):
    ```astro
    {testimonials.length > 0 && (
      <TrustQuoteCard
        quote={testimonials[0].quote}
        attribution={testimonials[0].attribution}
        context={testimonials[0].context}
      />
    )}
    ```
  - [ ] T4.8 Keep `t('landing.socialProof.eyebrow', locale)` and `t('landing.socialProof.headline', locale)` in i18n — they are UI labels, not collection content
  - [ ] T4.9 Keep the `<slot name="post-launch-testimonial" />` — it is Epic 8's handoff contract
  - [ ] T4.10 Remove the i18n import for the deleted keys (`landing.socialProof.stats.*`, `landing.socialProof.quote.*`). Keep the `t` import for eyebrow and headline

- [ ] **Task 5 — Rewire `FaqSection` and refactor `FaqAccordion`** (AC: 1, 3)
  - [ ] T5.1 Open `src/components/sections/faq-section.astro`
  - [ ] T5.2 Remove the TODO(epic-5) comment block at lines 42-51 (keep the TODO(epic-6) comment — it is Epic 6's scope)
  - [ ] T5.3 Add import: `import { getFaqEntries } from '@/lib/content'`
  - [ ] T5.4 In the frontmatter: `const faqItems = await getFaqEntries();`
  - [ ] T5.5 Transform the items into the shape FaqAccordion needs: `const faqProps = faqItems.map(item => ({ id: item.id, question: item.question, answer: item.answer }));`
  - [ ] T5.6 Replace `<FaqAccordion client:idle locale={locale} />` with `<FaqAccordion client:idle items={faqProps} />`
  - [ ] T5.7 Open `src/components/islands/faq-accordion.tsx`
  - [ ] T5.8 Change the `FaqAccordionProps` interface:
    ```ts
    export interface FaqAccordionProps {
      items: { id: string; question: string; answer: string }[];
    }
    ```
  - [ ] T5.9 Remove the `locale` prop, the `import { t, type Locale } from '@/lib/i18n'` import, and the `FAQ_ITEM_IDS` constant
  - [ ] T5.10 Update the component body to use `items` directly:
    ```tsx
    export default function FaqAccordion({ items }: FaqAccordionProps) {
      return (
        <Accordion type="single" collapsible className="w-full">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-[length:var(--text-lg)] text-[var(--color-primary)] hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[length:var(--text-base)] leading-relaxed text-[var(--color-primary)]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }
    ```
  - [ ] T5.11 Keep the `client:idle` directive on the island — accordion expand/collapse still requires React state
  - [ ] T5.12 Keep `t('landing.faq.eyebrow', locale)` and `t('landing.faq.headline', locale)` in `faq-section.astro` — they are UI labels, not FAQ entries

- [ ] **Task 6 — Rewire `FooterCtaSection` to read CTA labels from `siteContent`** (AC: 1)
  - [ ] T6.1 Open `src/components/sections/footer-cta-section.astro`
  - [ ] T6.2 This section currently reads eyebrow, headline, and subheadline from `t('landing.footerCta.*', locale)`. The `siteContent` schema has `ctaLabels.preLaunchPrimary` and `ctaLabels.postLaunchPrimary` but does NOT have footer-specific headline/subheadline fields
  - [ ] T6.3 **Decision**: Keep eyebrow, headline, subheadline in i18n (they are not in the siteContent schema). Only wire the CTA button label from siteContent if the `EmailCaptureBlock` needs it. Check whether `EmailCaptureBlock` reads its button label from i18n or accepts it as a prop
  - [ ] T6.4 If `EmailCaptureBlock` reads its button text from i18n (`landing.waitlist.submit`), then `ctaLabels` from siteContent is not consumed here at V1 — document this as a note and move on. The `ctaLabels` field exists in the schema for future use (Epic 8 post-launch CTA variants)
  - [ ] T6.5 If the CTA label IS needed, add `import { getSiteContent } from '@/lib/content'` and `import { isPostLaunch } from '@/lib/launch-phase'`, then compute:
    ```ts
    const siteContent = await getSiteContent();
    const ctaLabel = isPostLaunch()
      ? siteContent.ctaLabels.postLaunchPrimary
      : siteContent.ctaLabels.preLaunchPrimary;
    ```
  - [ ] T6.6 No i18n keys are deleted from `landing.footerCta` — they are still in use

- [ ] **Task 7 — Rewire `Footer` social links from `siteContent`** (AC: 2)
  - [ ] T7.1 Open `src/components/sections/footer.astro`
  - [ ] T7.2 Add import: `import { getSiteContent } from '@/lib/content'`
  - [ ] T7.3 In the frontmatter: `const siteContent = await getSiteContent();`
  - [ ] T7.4 Replace the hard-coded `socialLinks` array (lines 34-39, `href: '#'` placeholders) with a dynamic build from `siteContent.socialLinks`:
    ```ts
    const socialLinkEntries: { label: string; href: string; rel: string }[] = [];
    if (siteContent.socialLinks?.twitter) {
      socialLinkEntries.push({ label: 'Twitter / X', href: siteContent.socialLinks.twitter, rel: 'noopener me' });
    }
    if (siteContent.socialLinks?.instagram) {
      socialLinkEntries.push({ label: 'Instagram', href: siteContent.socialLinks.instagram, rel: 'noopener me' });
    }
    if (siteContent.socialLinks?.tiktok) {
      socialLinkEntries.push({ label: 'TikTok', href: siteContent.socialLinks.tiktok, rel: 'noopener me' });
    }
    if (siteContent.socialLinks?.youtube) {
      socialLinkEntries.push({ label: 'YouTube', href: siteContent.socialLinks.youtube, rel: 'noopener me' });
    }
    ```
  - [ ] T7.5 Conditionally render the "Follow" column only when `socialLinkEntries.length > 0`:
    ```astro
    {socialLinkEntries.length > 0 && (
      <div>
        <h2 class="font-display text-sm font-semibold tracking-wide text-[var(--color-primary)] uppercase">
          Follow
        </h2>
        <ul class="mt-4 flex flex-col gap-1">
          {socialLinkEntries.map((link) => (
            <li>
              <a
                href={link.href}
                rel={link.rel}
                class="inline-flex min-h-11 items-center py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-teal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
    ```
  - [ ] T7.6 Since seed data has empty `socialLinks`, the "Follow" column will NOT render at V1 — this is correct behaviour
  - [ ] T7.7 Remove the old hard-coded `socialLinks` array declaration (lines 34-39)

- [ ] **Task 8 — Remove `TODO(epic-5)` marker from `index.astro`** (AC: 2, 3)
  - [ ] T8.1 Open `src/pages/index.astro`
  - [ ] T8.2 Remove the `TODO(epic-5)` comment block at lines 10-13. Replace the entire multi-line comment with a clean description that reflects the current state (all sections now read from Content Collections)
  - [ ] T8.3 Verify `grep -rn 'TODO(epic-5)' src/` returns zero results

- [ ] **Task 9 — Delete migrated i18n keys from `landing.json`** (AC: 3)
  - [ ] T9.1 Open `src/i18n/en/landing.json`
  - [ ] T9.2 Delete these top-level keys that are now owned by Content Collections:
    - `hero.headline` — migrated to `siteContent.hero.headline`
    - `hero.subheadline` — migrated to `siteContent.hero.subheadline`
    - `problem.body` (entire object: `lede`, `stat`, `stakes`) — migrated to `siteContent.problem.body` array
    - `problem.sourceNote` — removed (sources are in `siteContent.problem.stats[].source`)
    - `socialProof.stats` (entire object: `stat1`, `stat2`, `stat3`) — migrated to `stats` Content Collection
    - `socialProof.quote` (entire object: `text`, `attribution`, `context`) — migrated to `testimonials` Content Collection
    - `faq.items` (entire object: `scope`, `vs-mechanic`, `privacy`, `cost`, `platforms`, `accuracy`, `data-retention`) — migrated to `faq` Content Collection
  - [ ] T9.3 Keys to **keep** in `landing.json` (still in use):
    - `meta.*` — page metadata
    - `hero.eyebrow`, `hero.ctaPlaceholder`, `hero.phoneAlt`, `hero.primaryCta`, `hero.secondaryCta` — UI labels
    - `problem.eyebrow`, `problem.headline` — UI labels
    - `inspectionStory.*` — not migrated (Story 2.4/2.5 scope, not siteContent)
    - `socialProof.eyebrow`, `socialProof.headline` — UI labels
    - `blogPreviews.*` — not migrated (blog Content Collection handles this via Epic 4)
    - `faq.eyebrow`, `faq.headline` — UI labels
    - `midCta.*` — not migrated
    - `waitlist.*` — form strings, not editorial content
    - `confirmation.*` — confirmation page strings
    - `footerCta.*` — still in use (eyebrow, headline, subheadline in i18n)
  - [ ] T9.4 After deletion, ensure the JSON is valid (no trailing commas, well-formed)
  - [ ] T9.5 Run `astro check` to verify TypeScript catches any remaining references to deleted keys. Fix any type errors by removing the `t()` calls that reference deleted keys

- [ ] **Task 10 — Update FR/DE locale files** (AC: 3)
  - [ ] T10.1 Open `src/i18n/fr/landing.json`
  - [ ] T10.2 Add a top-level key: `"_migrationNote": "Keys marked empty below were migrated to siteContent/faq/stats/testimonials Content Collections in Story 5.4. Re-add locale content in V1.2."`
  - [ ] T10.3 Set the same keys deleted from EN to empty strings `""` (do not delete them — they serve as a template for V1.2 translators):
    - `hero.headline: ""`, `hero.subheadline: ""`
    - `problem.body: { "lede": "", "stat": "", "stakes": "" }`
    - `problem.sourceNote: ""`
    - `socialProof.stats: { "stat1": { "value": "", "label": "", "source": "" }, ... }`
    - `socialProof.quote: { "text": "", "attribution": "", "context": "" }`
    - `faq.items: { "scope": { "question": "", "answer": "" }, ... }`
  - [ ] T10.4 Repeat for `src/i18n/de/landing.json`

- [ ] **Task 11 — Add social-links follow-up to `docs/launch-checklist.md`** (AC: 2)
  - [ ] T11.1 Open `docs/launch-checklist.md`
  - [ ] T11.2 Add a new section:
    ```markdown
    ## Social Media Links

    The `siteContent.socialLinks` fields (Twitter/X, Instagram, TikTok, YouTube) are empty at V1. Before launch:

    - [ ] Add real social media profile URLs to `src/content/siteContent/landing.json` → `socialLinks` (or via Keystatic admin UI)
    - [ ] Verify the Footer "Follow" column appears after rebuild
    ```

- [ ] **Task 12 — Build verification** (AC: 5)
  - [ ] T12.1 Run `astro build` with `LAUNCH_PHASE=pre` — must succeed
  - [ ] T12.2 Run `astro build` with `LAUNCH_PHASE=post` — must succeed
  - [ ] T12.3 Run `astro check` — zero TypeScript errors
  - [ ] T12.4 Run `npx vitest run` — all tests pass
  - [ ] T12.5 Run `npx eslint .` and `npx prettier --check .`
  - [ ] T12.6 Verify `grep -rn 'TODO(epic-5)' src/` returns zero results
  - [ ] T12.7 Visually inspect the dev server (`npm run dev`) — all sections render with seed content, no blank text, no broken layouts

## Dev Notes

### Implementation approach

**Build-time only**: All Content Collection reads happen at build time in Astro frontmatter (the `---` block). No new `client:*` directives are added. The `getSiteContent()`, `getStats()`, `getTestimonials()` and `getFaqEntries()` helpers are async (they call `getCollection()` / `getEntry()` under the hood), so they must be `await`ed in the Astro frontmatter.

**FaqAccordion refactoring**: The key architectural change is moving the `FaqAccordion` React island from an "I read my own data via `t()`" pattern to a "I receive data as props" pattern. This is cleaner because:
1. The data is static at build time — there's no reason for the island to fetch it at hydration time.
2. It removes the `@/lib/i18n` dependency from the island, making it a pure presentational component.
3. The Astro parent reads from the Content Collection, serializes the items array as a JSON prop, and the island just renders. Astro handles the serialization automatically for `client:*` islands.

**What stays in i18n vs what moves to siteContent**: The `siteContent` schema (Story 5.1 AC5) has specific fields. Not everything from `landing.json` moves. The rule is:
- **Moves to siteContent**: `hero.headline`, `hero.subheadline`, `problem.body`, `problem.stats` (source note embedded), social links, CTA labels
- **Moves to faq collection**: `faq.items.*`
- **Moves to stats collection**: `socialProof.stats.*`
- **Moves to testimonials collection**: `socialProof.quote.*`
- **Stays in i18n**: Section eyebrows, section headlines (that are NOT in the siteContent schema), form labels, button text, error messages, meta tags, alt text, inspectionStory content, blogPreviews, midCta, waitlist form strings, confirmation page strings

**Phase-aware rendering in HeroSection**: The `siteContent.hero` has both pre-launch and optional post-launch fields. The pattern is: use `isPostLaunch()` to decide which field to render, with a fallback to the pre-launch value if the post-launch field is blank/undefined. This ensures the hero always has content regardless of phase state.

### Current codebase state (verified)

- **`src/components/sections/hero-section.astro`** (87 lines): Uses `t('landing.hero.*', locale)` for eyebrow, headline, subheadline, phoneAlt. No TODO(epic-5) markers in this file. Imports `t` and `SectionEyebrow`
- **`src/components/sections/problem-section.astro`** (113 lines): Uses `t('landing.problem.*', locale)` for eyebrow, headline, 3 body paragraphs, sourceNote. No TODO(epic-5) markers. Has CSS-only fade animation
- **`src/components/sections/social-proof-section.astro`** (97 lines): Two TODO(epic-5) markers at lines 23 and 77. Three explicit `<StatCard>` with i18n. One `<TrustQuoteCard>` with i18n. Has `<slot name="post-launch-testimonial" />`
- **`src/components/sections/faq-section.astro`** (55 lines): One TODO(epic-5) marker at line 44 (plus a TODO(epic-6) that stays). Delegates to `<FaqAccordion client:idle locale={locale} />`
- **`src/components/islands/faq-accordion.tsx`** (75 lines): Reads FAQ items from `t()` using `FAQ_ITEM_IDS` constant. Must be refactored to accept `items` prop
- **`src/components/sections/footer-cta-section.astro`** (46 lines): Uses `t('landing.footerCta.*', locale)`. No TODO markers. Has `<slot name="cta" />` for EmailCaptureBlock
- **`src/components/sections/footer.astro`** (148 lines): Hard-coded `socialLinks` array at lines 34-39 with `href: '#'` placeholders. No TODO markers in this file
- **`src/pages/index.astro`** (75 lines): One TODO(epic-5) marker at line 10 about Footer social URLs. Composes all sections
- **`src/i18n/en/landing.json`** (204 lines): Full English locale file with all placeholder strings
- **`src/i18n/fr/landing.json`** and **`src/i18n/de/landing.json`**: Copies of English (FR/DE stubs per FR52 V1 policy)
- **`docs/launch-checklist.md`**: Exists with drip series content section. Needs social-links follow-up added
- **`src/lib/content.ts`**: Will exist after Story 5.1 with `getSiteContent()`, `getStats(phase?)`, `getTestimonials(phase?)`, `getFaqEntries()`. Phase defaults will have `TODO(epic-5-phase)` comments (Story 5.3 may or may not have already updated them)
- **`src/lib/launch-phase.ts`**: Will exist after Story 5.3 with `isPostLaunch()` and `getLaunchPhase()`

### Architecture compliance

- **AR6 (Five Content Collections)**: This story wires the consumption side — section components read from the collections created in Story 5.1
- **AR16 (`isPostLaunch()` from `lib/launch-phase.ts`)**: Used in HeroSection for phase-aware headline rendering and in `lib/content.ts` for phase-aware stat/testimonial filtering
- **AR25 (All `getCollection()` via `lib/content.ts`)**: Section components call `getSiteContent()`, `getStats()`, `getTestimonials()`, `getFaqEntries()` — never `getCollection()` directly
- **Three-tier hierarchy**: Section components (Tier 2) call lib helpers (Lib tier). `FaqAccordion` island receives data as props from its Astro parent (Tier 2) — no tier violations
- **Hydration policy**: No new `client:*` directives added. `FaqAccordion` stays `client:idle`. All new data reads are build-time only
- **NFR5 (500KB budget)**: Content reads happen at build time — zero additional client-side JS. The `FaqAccordion` island actually gets slightly smaller (removes `@/lib/i18n` dependency)
- **Env var convention**: `isPostLaunch()` is the only phase-state accessor. No direct `import.meta.env.LAUNCH_PHASE` reads in components
- **Content access boundary**: Only `lib/content.ts` calls `getCollection()` / `getEntry()`. Section components call the typed helpers

### Dependencies

- **Story 5.1** (MUST be complete): `src/lib/content.ts` with `getSiteContent()`, `getStats()`, `getTestimonials()`, `getFaqEntries()` and all four Content Collections with seed data
- **Story 5.3** (MUST be complete): `src/lib/launch-phase.ts` with `isPostLaunch()` — used for phase branching in HeroSection and for `lib/content.ts` phase defaults
- **Story 5.2** (should be complete): Keystatic admin UI configured — needed for end-to-end verification of content editing, but not strictly needed for the code changes
- **Story 2.6** (already complete): `StatCard` props interface (`category`, `value`, `label`, `source`)
- **Story 2.8** (already complete): `FaqAccordion` island that needs refactoring
- **Story 3.5** (already complete): `EmailCaptureBlock` wired into CTA slots

### Existing patterns to follow

- **Content helper call pattern** (from Story 5.1): All helpers are `async` — use `await` in Astro frontmatter:
  ```ts
  const siteContent = await getSiteContent();
  const stats = await getStats();
  const testimonials = await getTestimonials();
  const faqItems = await getFaqEntries();
  ```
- **Phase branching pattern** (from Story 5.3): `import { isPostLaunch } from '@/lib/launch-phase'` then `const phase = isPostLaunch() ? 'post' : 'pre'`
- **View types** (from Story 5.1): `FaqEntryView` has `{id, question, answer, order, featured, category}`. `StatView` has `{id, value, label, source, category, phase, order}`. `TestimonialView` has `{id, quote, attribution, context, phase, featured, authorImage, rating}`. `SiteContentView` has nested objects: `hero`, `problem`, `footer`, `socialLinks`, `appStoreUrls`, `ctaLabels`
- **Astro island props serialization**: When passing an array/object to a `client:*` island, Astro serializes it as JSON automatically. No manual `JSON.stringify()` needed. Just pass `items={faqProps}` and the island receives it as a typed array

### Project Structure Notes

Modified files:

```
src/lib/content.ts                                <- Update getTestimonials/getStats phase defaults
src/components/sections/hero-section.astro         <- Read headline/subheadline from siteContent
src/components/sections/problem-section.astro      <- Read body/stats from siteContent
src/components/sections/social-proof-section.astro <- Read stats + testimonials from collections
src/components/sections/faq-section.astro          <- Read FAQ items from faq collection, pass as props
src/components/islands/faq-accordion.tsx           <- Accept items as props instead of reading from t()
src/components/sections/footer-cta-section.astro   <- Wire CTA labels from siteContent (if applicable)
src/components/sections/footer.astro               <- Read social links from siteContent
src/pages/index.astro                              <- Remove TODO(epic-5) comment
src/i18n/en/landing.json                           <- Delete migrated keys
src/i18n/fr/landing.json                           <- Blank migrated keys + migration note
src/i18n/de/landing.json                           <- Blank migrated keys + migration note
docs/launch-checklist.md                           <- Add social-links follow-up task
```

No new files created.

### References

- [Source: epics-truvis-landing-page.md#Story 5.4 — Full acceptance criteria]
- [Source: architecture-truvis-landing-page.md#AR6 — Five Content Collections + Keystatic]
- [Source: architecture-truvis-landing-page.md#AR16 — LAUNCH_PHASE env var + lib/launch-phase.ts helper]
- [Source: architecture-truvis-landing-page.md#AR25 — lib/content.ts access boundary]
- [Source: prd-truvis-landing-page.md#FR11 — Social media profile links]
- [Source: prd-truvis-landing-page.md#FR31 — FAQ managed without code changes]
- [Source: prd-truvis-landing-page.md#FR32 — Testimonials managed without code changes]
- [Source: prd-truvis-landing-page.md#FR33 — Statistics managed without code changes]
- [Source: Story 5.1 — Content Collections schemas, seed data, lib/content.ts helpers]
- [Source: Story 5.3 — lib/launch-phase.ts with isPostLaunch()]
- [Source: src/components/sections/hero-section.astro — t('landing.hero.*') reads (lines 39-51)]
- [Source: src/components/sections/problem-section.astro — t('landing.problem.*') reads (lines 34-54)]
- [Source: src/components/sections/social-proof-section.astro — TODO(epic-5) markers (lines 23, 77)]
- [Source: src/components/sections/faq-section.astro — TODO(epic-5) marker (line 44)]
- [Source: src/components/islands/faq-accordion.tsx — FAQ_ITEM_IDS + t() reads (lines 44-59)]
- [Source: src/components/sections/footer.astro — placeholder social links (lines 34-39)]
- [Source: src/pages/index.astro — TODO(epic-5) marker (line 10)]
- [Source: src/i18n/en/landing.json — placeholder keys to migrate/delete]
- [Source: docs/launch-checklist.md — existing checklist to extend]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
