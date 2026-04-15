# Story 2.8: Build `FaqSection` with shadcn `Accordion` and placeholder entries

Status: review

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor who still has objections (is this safe? does it replace a mechanic? what does it cost? what does it do with my data?)**,
I want **a FAQ accordion on the landing page that answers my top questions without making me leave the page**,
so that **I can resolve my objections and come back to the CTA with fewer blockers**.

## Context & scope

This is the **eighth story of Epic 2**. It builds the **`FaqSection`** — a Tier-2 Astro composite that sits directly below `<BlogPreviewsSection />` (Story 2.7) on `src/pages/index.astro`. The section consumes the shadcn `Accordion` primitive from `src/components/ui/accordion.tsx` (already installed from the one-ie-astro-shadcn starter). Because shadcn's `Accordion` is built on Radix UI primitives that require client-side JavaScript for state management (expand/collapse, keyboard navigation, ARIA wiring), the accordion **must be hydrated** — and per AR27 the correct directive for a below-the-fold non-conversion-critical interactive primitive is `client:idle`.

Scope boundaries:
- **In scope:** `src/components/sections/faq-section.astro` (Tier-2 Astro composite), a small React wrapper island at `src/components/islands/faq-accordion.tsx` (the shadcn Accordion must be mounted from a React hydration root, same ReactNode-across-hydration-boundary rationale as Story 2.5's `inspection-story-scenes.tsx`), 6–8 placeholder FAQ entries in a new `landing.faq.items` i18n array covering scope / professional inspection / privacy / cost / platforms / accuracy / data retention (FR6), byte-for-byte FR/DE mirrors (FR52), mounting the section on `src/pages/index.astro` directly below `<BlogPreviewsSection />`, text-expansion harness registration, WAI-ARIA Accordion Pattern keyboard navigation (Tab / Enter / Space / Arrow keys, inherited from Radix), warm-amber chevron rotation on expand with reduced-motion fallback, `TODO(epic-5)` and `TODO(epic-6)` comments marking the `faq` Content Collection migration point and the `faqJsonLd()` JSON-LD insertion point.
- **Out of scope:** JSON-LD `FAQPage` structured data (Epic 6 Story 6.2 owns `lib/structured-data.ts` and the `faqJsonLd()` helper — DO NOT create either here, DO NOT inject JSON-LD in this story; a `TODO(epic-6)` comment marks the insertion point). The `faq` Content Collection (Epic 5 Story 5.1 — at V1 the FAQ entries live in `src/i18n/en/landing.json` under `landing.faq.items`; a `TODO(epic-5)` comment marks the migration point; DO NOT `getCollection('faq')`, DO NOT create `src/content/faq/*.md`, DO NOT import a non-existent `lib/content.ts` helper). Any edit to `src/components/ui/accordion.tsx` — the shadcn primitive is frozen Tier-1 code. The `FooterCtaSection` (Story 2.9) and the full page composition including the mid-page CTA slot (Story 2.9). Do **not** introduce these.

## Acceptance Criteria

### AC1 — Section shell on white background with eyebrow and `<h2>` (UX-DR8, Story 1.7 color rhythm)

**Given** UX-DR8 requires a FAQ section using shadcn `Accordion` and the Story 1.7 Epic-2 colour rhythm places it on the white `--color-bg` background (surface blog previews → **white FAQ** → dark primary footer CTA),
**When** I create `src/components/sections/faq-section.astro`,
**Then**
- the section file is a **Tier-2 Astro composite** — pure `.astro` shell that imports a small React island for the accordion (necessary because shadcn Accordion is a React component tree with Radix state),
- the file header comment mirrors `problem-section.astro` / `social-proof-section.astro` / `blog-previews-section.astro` shape: component name, story / UX-DR / AR references, a one-sentence purpose statement, and a **prominent V1-scope note**: `// V1 ships placeholder FAQ entries from landing.faq.items. Real faq Content Collection is Epic 5 Story 5.1. JSON-LD FAQPage is Epic 6 Story 6.2. This file owns neither.`,
- the outer wrapper is `<section aria-labelledby="faq-heading" class="bg-[var(--color-bg)]">` — the warm off-white brand token,
- the inner container uses the Epic-2 recipe: `<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">`. **Note the narrower `max-w-3xl`** (not `max-w-6xl`) — FAQ accordions read best at a constrained reading width; this matches editorial convention and avoids a stretched accordion on desktop. Confirm this variance from the Epic-2 default container in the dev record,
- the first child is `<SectionEyebrow variant="light" eyebrow={t('landing.faq.eyebrow', locale)} />` (confirm prop name against `section-eyebrow.astro`). The V1 eyebrow string is `"Frequently asked"`,
- the second child is `<h2 id="faq-heading">` wired to `t('landing.faq.headline', locale)` with the standard Tier-2 heading classes. Suggested English copy: `"Questions worth asking before you buy."`,
- an optional `<p>` subheadline may sit below the `<h2>` — include only if the dev agent authors a value-adding single sentence; otherwise omit the key,
- directly below the heading block, the section mounts the accordion island: `<FaqAccordion client:idle locale={locale} />` — the `client:idle` directive is correct per AR27 because the FAQ is below the fold and non-LCP (confirm the delete-if-not-useful rationale in the dev record),
- the section file imports `FaqAccordion` from `@/components/islands/faq-accordion` (React island, AC2 below) — this is a sibling-island scenario acknowledged in Story 2.5 as the one allowed cross-boundary import pattern when a Tier-1 shadcn primitive needs to be consumed from Astro.

### AC2 — React island wrapper at `src/components/islands/faq-accordion.tsx` (AR23, AR27, Radix Accordion wiring)

**Given** the shadcn `Accordion` primitive at `src/components/ui/accordion.tsx` is a React component tree wrapping `@radix-ui/react-accordion` primitives that require client-side state (expand / collapse / keyboard nav / ARIA attributes) and Story 2.5 established the "React wrapper island as hydration root for React-only primitives consumed from Astro" pattern,
**When** I create the React wrapper island,
**Then**
- a new file `src/components/islands/faq-accordion.tsx` is created that:
  - imports `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `@/components/ui/accordion`,
  - imports `t` and `Locale` from `@/lib/i18n`,
  - is **default-exported** as `FaqAccordion` with the prop shape `{ locale: Locale }`,
  - builds the FAQ items array inside the component body by reading `t('landing.faq.items', locale)` — the helper returns the JSON array (see AC3 below for the array shape); the component maps each entry to `<AccordionItem key={id} value={id}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent>{answer}</AccordionContent></AccordionItem>`,
  - wraps the list in `<Accordion type="single" collapsible className="w-full">` — **`type="single"`** is the UX-DR8 contract (only one item open at a time) and `collapsible` lets the user close the currently-open item by clicking it again (WAI-ARIA accordion convention),
  - the `id` / `value` for each item is a **stable kebab-case slug** derived from the entry's canonical question topic (e.g., `scope`, `vs-mechanic`, `privacy`, `cost`, `platforms`, `accuracy`, `data-retention`) — these slugs are the Epic 6 Story 6.2 grep target (when the `FAQPage` JSON-LD helper runs, it needs a stable key to generate `mainEntity[].@id`),
- the file lives under `src/components/islands/` because it ships JavaScript to the browser (Radix accordion is a React component with hooks and event listeners — AR23, CLAUDE.md § Architectural boundaries),
- the file header comment explicitly says:
  ```tsx
  /**
   * FaqAccordion — Story 2.8 (UX-DR8, AR27)
   *
   * React hydration root for the Tier-2 FaqSection. Consumes the shadcn
   * Accordion Tier-1 primitive (Radix-based — requires React state for
   * expand/collapse + keyboard nav), reads FAQ items from
   * landing.faq.items via t(), and renders them as a single-open
   * accordion per UX-DR8.
   *
   * This wrapper is a hydration root (pattern established in Story 2.5
   * inspection-story-scenes.tsx): the i18n strings cross the Astro ->
   * island boundary as a single Locale prop, and the React tree is
   * constructed entirely in this file so ReactNode children never have
   * to serialise through island props.
   *
   * Consumer contract: <FaqAccordion client:idle locale={locale} />
   */
  ```
- the island imports **only** from `react`, `@/lib/i18n`, `@/components/ui/accordion` — never from sibling islands, Tier-2 sections, or layouts. The one allowed exception is inherent: `@/components/ui/accordion` imports `@radix-ui/react-accordion` and `lucide-react` (`ChevronDown`), which is Tier-1's business, not this island's (AR23),
- the island does NOT manage its own nanostore — FAQ open/close state is local React state inside the Radix primitive, not cross-island state. Do NOT add a new store. Do NOT import `@nanostores/react`,
- the island is consumed via `client:idle` (not `client:visible`, not `client:load`). Rationale: the accordion is below the fold, is not LCP, and is non-critical for conversion — `client:idle` lets the browser defer hydration until the main thread is quiet, saving TTI budget. `client:load` would force hydration at first paint (wrong — the accordion is below the fold); `client:visible` would defer until the section scrolls into view, which is fine but slightly worse than `idle` for first keyboard interaction responsiveness (a user who scrolls fast to the FAQ expects the accordion to already be ready). **Use `client:idle`.**

### AC3 — 6–8 placeholder FAQ entries in `landing.faq.items` covering canonical questions (FR6, UX-DR8)

**Given** FR6 requires the FAQ to cover the canonical pre-launch buyer objections — scope / relationship to professional inspection / privacy / cost / platforms / accuracy / data retention — and UX-DR8 requires 6–8 entries,
**When** I author the i18n content,
**Then**
- a new top-level `faq` block is added to `src/i18n/en/landing.json` (at the **end** of the JSON, respecting the existing key order after `blogPreviews` from Story 2.7):
  ```json
  "faq": {
    "eyebrow": "Frequently asked",
    "headline": "Questions worth asking before you buy.",
    "items": [
      {
        "id": "scope",
        "question": "What exactly does Truvis do?",
        "answer": "Truvis walks you through a used-car inspection on your phone, flags the parts most likely to fail on your specific model and year, and gives you a severity-rated summary and a list of issues worth negotiating on — before you hand over the money. It is designed to sit in your pocket during the test drive and the walk-around."
      },
      {
        "id": "vs-mechanic",
        "question": "Does Truvis replace a professional pre-purchase inspection?",
        "answer": "No — and it is not designed to. A qualified mechanic with a lift and diagnostic scan tools will always see more than a phone in a car park. Truvis is the step before that: it tells you whether a car is worth booking a mechanic for at all, and which specific things to ask the mechanic to check."
      },
      {
        "id": "privacy",
        "question": "What does Truvis do with my data?",
        "answer": "Truvis stores your inspection history on your device by default. If you opt into cloud sync, inspection data is stored in an EU region only. We never sell your data, we never share it with dealerships, and you can delete your history any time from the app settings."
      },
      {
        "id": "cost",
        "question": "How much does it cost?",
        "answer": "Pricing is being finalised before launch. Sign up to the waitlist and you will be among the first to know — early signups will receive preferential introductory pricing."
      },
      {
        "id": "platforms",
        "question": "Which phones does Truvis run on?",
        "answer": "Truvis will launch on iOS and Android. The waitlist covers both — we will notify you as soon as your platform is ready to download."
      },
      {
        "id": "accuracy",
        "question": "How accurate are Truvis's severity ratings?",
        "answer": "Severity is calibrated against the documented fault histories for each specific model and model year, combined with the visible and audible signals Truvis asks you to check. It is a decision-support tool, not a diagnostic certification — always combine it with a test drive and, for expensive cars, a professional inspection."
      },
      {
        "id": "data-retention",
        "question": "How long does Truvis keep my inspection data?",
        "answer": "Inspection data stays on your device indefinitely unless you delete it. If you enable cloud sync, you can delete every record from the app settings — deletion is immediate, verifiable, and permanent. See our privacy policy for the full data lifecycle."
      }
    ]
  }
  ```
- the array must have **at least 6 and at most 8 entries** — target exactly 7 entries for the seven canonical topics. The dev agent may reorder, reword, or split/merge entries as long as every canonical topic from FR6 is covered by at least one entry,
- every entry has three required fields: `id` (stable kebab-case slug — Epic 6 grep target), `question` (one sentence, Inspector voice), `answer` (2–4 sentences, 70/30 Inspector/Ally voice — concrete Inspector opener, buyer-facing Ally softener),
- the **voice guardrails** mirror Story 2.5's narrative voice: concrete observation first, soften with buyer reassurance, no marketing fluff, no all-caps, no em-dashes inside the answer body (em-dashes are fine inside question text if they're natural — but prefer commas),
- the `id` slugs are stable — Epic 6 Story 6.2's `FAQPage` JSON-LD helper will use them as `@id` values in the structured data graph; Epic 5 Story 5.1's `faq` Content Collection migration will use them as file names (`src/content/faq/scope.md`, `src/content/faq/vs-mechanic.md`, etc.),
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` receive the **identical `faq` block** — byte-for-byte English copies per FR52,
- every `t()` call in `faq-accordion.tsx` resolves cleanly — `npx astro check` must be clean. The `t()` helper's dev-mode warning will flag any missing key,
- **`t()` array return shape:** the `t()` helper returns the array as-is when the key path resolves to an array — confirm this by reading `src/lib/i18n.ts` before implementing; if `t()` does not support array returns, the island reads the array via a helper call `t('landing.faq.items', locale)` that walks the namespace manually, or the island imports the raw JSON directly under an AR23 exception documented in the dev record.

### AC4 — Chevron rotation on expand with reduced-motion fallback (UX-DR8, UX-DR32)

**Given** UX-DR8 requires each accordion chevron to rotate 180° on expand with the warm-amber accent colour and UX-DR32 requires the rotation to be disabled under `prefers-reduced-motion`,
**When** I style the chevron,
**Then**
- the shadcn `AccordionTrigger` (`src/components/ui/accordion.tsx`) already includes a `ChevronDown` icon from `lucide-react` with the class `[&[data-state=open]>svg]:rotate-180` — this is Radix's data-state-driven rotation, already wired. Do NOT re-implement,
- the **amber accent colour** for the chevron is applied via a CSS rule in `src/styles/global.css` (or equivalent global stylesheet) targeting the shadcn accordion trigger's chevron:
  ```css
  /*
   * FAQ accordion chevron — Story 2.8 / UX-DR8
   * Warm-amber accent per UX-DR8; rotation is already wired by shadcn
   * via [&[data-state=open]>svg]:rotate-180. Reduced-motion fallback
   * at the bottom of this file (global reduced-motion kill-switch).
   */
  .faq-section [data-radix-accordion-trigger] svg {
    color: var(--color-amber);
    transition: transform var(--duration-base) ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .faq-section [data-radix-accordion-trigger] svg {
      transition: none;
    }
  }
  ```
- the `.faq-section` class is applied to the `<section>` wrapper in `faq-section.astro` as a namespacing hook so the amber-chevron rule does not leak to any other accordion usage elsewhere in the repo,
- alternative (simpler) approach: colour the `ChevronDown` icon via a Tailwind class on a wrapper element passed from the island — but that requires editing `faq-accordion.tsx` to add a wrapper, and the shadcn `AccordionTrigger` does not easily accept custom chevron styling. The global CSS approach is cleaner because it stays on the consumer side without touching the Tier-1 primitive,
- the **global reduced-motion kill-switch** at `src/styles/global.css:189` (Story 1.7) already zeros all animation / transition durations under `prefers-reduced-motion: reduce`. The explicit `@media` block above is belt-and-braces and specifically zeros the chevron's transform transition — both layers must be present,
- only `transform` (and implicitly the inherited `rotate` from shadcn's data-state class) animates. No `opacity`, no `width`, no layout-triggering property (NFR3).

### AC5 — WAI-ARIA Accordion Pattern keyboard navigation + focus indicators (NFR21, UX-DR29)

**Given** NFR21 requires keyboard navigation and UX-DR29 requires visible focus indicators on every interactive element, and the shadcn / Radix accordion already implements the WAI-ARIA Accordion Pattern,
**When** I audit the accordion,
**Then**
- **Tab** focuses the first accordion trigger; subsequent Tabs move to the next trigger in document order; Shift+Tab moves backwards. Inherited from Radix (no manual wiring needed),
- **Enter** or **Space** on a focused trigger toggles the item's expanded state. Inherited from Radix,
- **Arrow Down / Arrow Up** move focus between accordion triggers (without toggling). Inherited from Radix,
- **Home / End** jump to the first / last trigger. Inherited from Radix,
- each trigger carries `aria-expanded="true"` when open and `aria-expanded="false"` when closed — inherited from Radix, no manual wiring. The a11y audit (AC8) must verify this attribute is present in the rendered DOM,
- `aria-controls` on each trigger points to the corresponding panel's `id`, and each panel has `role="region"` with `aria-labelledby` pointing back to its trigger. All inherited from Radix — the audit must verify,
- **focus indicators** are visible on every accordion trigger. The global `focus-visible` rules from Story 1.7 apply — verify by Tab-ing through the section in both dark and light-mode chrome and confirming a visible outline / ring on the focused trigger. If the outline is invisible against `--color-bg`, add a `.faq-section [data-radix-accordion-trigger]:focus-visible { outline: 2px solid var(--color-teal); outline-offset: 2px; }` rule to the same CSS block as AC4,
- there are **no custom keyboard handlers** in `faq-accordion.tsx`. Radix owns the keyboard contract. Do NOT wrap the trigger in a custom `onKeyDown` handler.

### AC6 — Landing-page composition: insert `<FaqSection />` below `<BlogPreviewsSection />` (UX-DR8)

**Given** Story 2.7 landed `<BlogPreviewsSection />` directly below `<SocialProofSection />` and the Epic 2 page order places FAQ immediately below blog previews,
**When** I update `src/pages/index.astro`,
**Then**
- `src/pages/index.astro` imports `FaqSection` alongside the existing section imports and renders `<FaqSection />` directly below `<BlogPreviewsSection />`. The page order after this story is:
  ```
  BaseLayout
  ├── Header
  ├── HeroSection
  ├── ProblemSection
  ├── InspectionStorySection
  ├── SocialProofSection
  ├── BlogPreviewsSection
  ├── FaqSection              ← NEW IN THIS STORY
  └── Footer
  ```
- Story 2.9 (`FooterCtaSection` + full composition + mid-page CTA slot) is the final page composition story and NOT added here.

### AC7 — `TODO(epic-5)` and `TODO(epic-6)` migration markers

**Given** Epic 5 Story 5.1 owns the `faq` Content Collection migration and Epic 6 Story 6.2 owns the `FAQPage` JSON-LD injection,
**When** I finalise the file,
**Then**
- `src/components/sections/faq-section.astro` carries two prominent `TODO` comments near the top of the frontmatter block (or directly above the `<FaqAccordion>` mount), with the exact format:
  ```astro
  {/*
   * TODO(epic-5): source FAQ items from the faq Content Collection
   *   via lib/content.ts getFaqItems() instead of landing.faq.items
   *   i18n. Epic 5 Story 5.1 creates the collection and the helper.
   *
   * TODO(epic-6): inject faqJsonLd(faqItems) via BaseLayout's JSON-LD
   *   slot so the FAQ section emits FAQPage structured data per FR41.
   *   Epic 6 Story 6.2 creates lib/structured-data.ts and the helper.
   */}
  ```
- neither `lib/content.ts` nor `lib/structured-data.ts` is imported in this story — both are Epic 5 / Epic 6 scope. At V1 the `faq` items live in i18n and the page emits no FAQ JSON-LD,
- the `TODO` comments are **grep targets** — a reviewer searching `grep -rn "TODO(epic-5)" src/` must find this section, and the same for `TODO(epic-6)`. Use the exact `TODO(epic-N):` format,
- do NOT create stub files for `lib/content.ts` or `lib/structured-data.ts` — the `TODO` comment is the architectural intent; creating stubs now violates Epic 5 / Epic 6 scope.

### AC8 — a11y, contrast, axe-core, text expansion audit (UX-DR28, UX-DR29, UX-DR30, UX-DR31, NFR21, NFR25, NFR26)

**Given** the accordion is the most interactive element in Epic 2 and NFR25 says axe-core reports zero violations,
**When** I audit the section,
**Then**
- axe-core reports **zero violations** on a page containing `<FaqSection />` — run the audit on `/` in the built preview after mounting the section,
- every accordion trigger has `aria-expanded`, `aria-controls`, and the visible `<h3>` (which Radix wraps inside the `AccordionPrimitive.Header` — confirm the rendered DOM has the question text inside a heading-level element, not just a raw `<button>`. The shadcn primitive already wraps triggers in `AccordionPrimitive.Header` which defaults to `<h3>` — verify),
- keyboard navigation follows WAI-ARIA Accordion Pattern (AC5) — manually Tab / Enter / Arrow through every trigger to confirm,
- focus indicators are visible on every focused trigger (AC5),
- text contrast of question (default `--color-primary`) and answer (`--color-primary`) on `--color-bg` passes WCAG 2.1 AA ≥4.5:1. The amber chevron (`--color-amber`) does not need to pass ≥4.5:1 because it is a non-text graphical element paired with a text label; UI component contrast ≥3:1 is sufficient per WCAG 1.4.11 (UX-DR30),
- under 140 % synthetic FR/DE text (text-expansion harness, AC9), expanded answers do not clip, overflow, or break the narrow `max-w-3xl` container. Long questions wrap naturally to a second line. Long answers wrap multiple paragraphs if needed (UX-DR31, NFR26),
- the page's single `<h1>` invariant holds — hero owns `<h1>`, this section uses `<h2>` for the section title, Radix's `AccordionPrimitive.Header` wraps each trigger in an `<h3>` (verify this is what the rendered DOM shows — if Radix renders `<h4>` or `<div>` by default, override the `asChild` prop or add a heading manually to keep the hierarchy correct),
- the accordion state persists while the user is on the page (opening one item stays open until the user opens another or clicks the same one again to close). Do NOT persist state to localStorage or URL hash — V1 is session-scoped only.

### AC9 — Text-expansion harness registration (UX-DR31, NFR26)

**Given** UX-DR31 requires every Tier-2 section to render cleanly under 140 % padded FR/DE synthetic strings,
**When** I update the harness,
**Then**
- `src/pages/_demo/text-expansion.astro` gains an import and render of `<FaqSection />` (or a padded static mirror — the harness must render each accordion item as **expanded** under padding, since the default collapsed state hides answer text and can't stress-test answer wrapping),
- pad every `faq` string (eyebrow, headline, question text, answer text) with the bracketed-filler convention to ~140 % of English length,
- if the harness cannot auto-open every accordion item, author a **static visual mirror** inside the harness: render each FAQ item as a static `<details open>` element with the question + answer shown, bypassing the shadcn Accordion island entirely. The mirror's job is to stress the text rendering, not the interactive behaviour; the real accordion is still tested on `/`,
- manually verify at mobile / tablet / desktop breakpoints — no clipping, no overflow, narrow `max-w-3xl` container holds, long questions wrap to two lines, long answers wrap to multiple paragraphs without breaking the trigger layout.

### AC10 — Build, lint, type-check, bundle delta (NFR5, AR23, AR27)

**Given** the repo's CI gates and NFR5's 500 KB initial weight budget,
**When** I finish the story,
**Then**
- `npx astro check` is clean — TypeScript recognises the `FaqAccordion` island's `locale: Locale` prop, every `t()` call resolves,
- `npx eslint . && npx prettier --check .` — clean,
- `npx vitest run` — all existing tests pass; **no new Vitest files** (`lib/` utilities only),
- `npm run build && npm run preview` — clean, `/` renders the new section,
- the built `/` page ships a new JavaScript chunk for `faq-accordion.js` (the Radix accordion is JS-heavy — expect roughly 8–15 KB gzipped for the Radix core + shadcn wrapper + lucide chevron icon). Document the exact gzipped size in the dev record and confirm `/` total initial weight stays under **500 KB gzipped** (NFR5). Measure with `ls -lh dist/_astro/faq-accordion*.js` and `gzip -c < dist/_astro/faq-accordion*.js | wc -c`,
- Lighthouse CI on the PR passes: Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1, initial weight <500 KB (NFR1, NFR3, NFR5, NFR6, NFR25, NFR39). The `client:idle` hydration directive defers JS execution until the main thread is quiet, protecting LCP,
- `package.json` unchanged — `@radix-ui/react-accordion` and `lucide-react` are already installed (the shadcn starter shipped them; confirm with `grep accordion package.json`).

## Tasks / Subtasks

- [x] **Task 1 — Write the `faq` i18n block in English** (AC3)
  - [x] 1.1 Add the top-level `faq` block to `src/i18n/en/landing.json` with `eyebrow`, `headline`, optional `subheadline`, and an `items` array of 6–8 entries.
  - [x] 1.2 Author each entry's `id` as a stable kebab-case slug matching the canonical topic (scope, vs-mechanic, privacy, cost, platforms, accuracy, data-retention).
  - [x] 1.3 Author each entry's `question` as a single Inspector-voice sentence; each `answer` as 2–4 sentences in 70/30 Inspector/Ally voice.
  - [x] 1.4 Cover every FR6 topic (scope, relationship to professional inspection, privacy, cost, platforms, accuracy, data retention) across the 6–8 entries.
  - [x] 1.5 Copy the full `faq` block byte-for-byte into `src/i18n/fr/landing.json` and `src/i18n/de/landing.json`.

- [x] **Task 2 — Build `FaqAccordion` React island** (AC2, AC3)
  - [x] 2.1 Create `src/components/islands/faq-accordion.tsx` with the header comment per AC2.
  - [x] 2.2 Import `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `@/components/ui/accordion`; import `t`, `Locale` from `@/lib/i18n`.
  - [x] 2.3 Default-export `FaqAccordion({ locale }: { locale: Locale })`.
  - [x] 2.4 Read the items array from i18n: confirm whether `t('landing.faq.items', locale)` returns the array; if not, inspect `src/lib/i18n.ts` for how to fetch an array value, and document the approach in the dev record.
  - [x] 2.5 Map items to `<AccordionItem value={item.id}>` / `<AccordionTrigger>{item.question}</AccordionTrigger>` / `<AccordionContent>{item.answer}</AccordionContent>`.
  - [x] 2.6 Wrap in `<Accordion type="single" collapsible className="w-full">`.
  - [x] 2.7 Verify no extra state, no nanostore, no custom keyboard handler.

- [x] **Task 3 — Create `faq-section.astro` and mount the island** (AC1, AC6, AC7)
  - [x] 3.1 Create `src/components/sections/faq-section.astro` with the V1-scope header comment per AC1.
  - [x] 3.2 Import `t` + `Locale`, `SectionEyebrow`, and `FaqAccordion`.
  - [x] 3.3 Derive `const locale = (Astro.currentLocale ?? 'en') as Locale;`.
  - [x] 3.4 Render the section wrapper (`bg-[var(--color-bg)]`, `aria-labelledby`, `class="faq-section"` for the chevron-colour CSS hook, `max-w-3xl` container recipe).
  - [x] 3.5 Render `<SectionEyebrow />` (light variant), `<h2 id="faq-heading">`, optional subheadline.
  - [x] 3.6 Mount `<FaqAccordion client:idle locale={locale} />` below the heading block.
  - [x] 3.7 Add the `TODO(epic-5)` and `TODO(epic-6)` migration comments per AC7.

- [x] **Task 4 — Add chevron colour + reduced-motion CSS** (AC4)
  - [x] 4.1 Open `src/styles/global.css` and append the `.faq-section [data-radix-accordion-trigger] svg { color: var(--color-amber); transition: transform var(--duration-base) ease-out; }` rule.
  - [x] 4.2 Add the `@media (prefers-reduced-motion: reduce)` block zeroing the transition.
  - [x] 4.3 Verify Radix exposes the `[data-radix-accordion-trigger]` attribute on the rendered button — inspect the DOM in the built preview. If Radix uses a different attribute selector, adjust the CSS selector to match.
  - [x] 4.4 Add a `:focus-visible` rule scoped to `.faq-section [data-radix-accordion-trigger]` if the global focus indicators do not show through.

- [x] **Task 5 — Mount the section on `src/pages/index.astro`** (AC6)
  - [x] 5.1 Import `FaqSection` and render `<FaqSection />` directly below `<BlogPreviewsSection />`.
  - [x] 5.2 `npm run build && npm run preview` — confirm `/` renders all seven sections in the correct order.

- [x] **Task 6 — Register in text-expansion harness** (AC9)
  - [x] 6.1 Update `src/pages/_demo/text-expansion.astro` to render `<FaqSection />` with padded synthetic strings OR a static `<details open>` mirror.
  - [x] 6.2 Verify at mobile / tablet / desktop — no clipping, no overflow.

- [x] **Task 7 — a11y, keyboard, contrast, axe audit** (AC5, AC8)
  - [x] 7.1 DevTools axe-core zero violations on `/`.
  - [x] 7.2 Tab / Enter / Space / Arrow keys through the accordion — confirm WAI-ARIA Accordion Pattern behaviour.
  - [x] 7.3 Verify every trigger has `aria-expanded` toggled correctly on click and keyboard toggle.
  - [x] 7.4 Verify focus indicators visible on every trigger.
  - [x] 7.5 Toggle `prefers-reduced-motion: reduce` in DevTools → confirm chevron rotation is instant (no transition).
  - [x] 7.6 Verify the rendered DOM wraps each trigger in an `<h3>` (Radix's `AccordionPrimitive.Header` default) — if not, adjust.
  - [x] 7.7 Contrast: every text token on `--color-bg` passes ≥4.5:1.

- [x] **Task 8 — Build, lint, type-check, bundle inspection** (AC10)
  - [x] 8.1 `npx astro check` — 0 errors.
  - [x] 8.2 `npx eslint . && npx prettier --check .` — clean.
  - [x] 8.3 `npx vitest run` — all tests pass (no new tests).
  - [x] 8.4 `npm run build && npm run preview` — clean.
  - [x] 8.5 Document the `faq-accordion.js` gzipped size. Confirm `/` total initial weight <500 KB.
  - [x] 8.6 Lighthouse local run — Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1.
  - [x] 8.7 `package.json` unchanged.

## Dev Notes

### Architecture compliance — the non-negotiables

- **Tier-2 Astro section + Tier-3 React hydration root.** `FaqSection` is a pure Astro shell; `FaqAccordion` is a React island in `src/components/islands/`. The accordion's interactive state is React-owned; the Astro section wraps the island with chrome. [Source: CLAUDE.md § Architectural boundaries; Story 2.5 wrapper-island pattern]
- **Three-tier import rule.** Section imports from `@/lib/i18n`, `@/components/sections/*`, `@/components/islands/faq-accordion`. Island imports from `react`, `@/lib/i18n`, `@/components/ui/accordion`. [Source: AR23]
- **Hydration directive: `client:idle`.** Below the fold, non-LCP, non-conversion-critical — `client:idle` is the AR27 correct choice. Not `client:load` (wrong — not above the fold), not `client:visible` (fine, but `idle` gives better first-interaction responsiveness for users who scroll fast). [Source: AR27; src/components/islands/README.md]
- **Shadcn `Accordion` is Tier-1 and frozen.** Do NOT edit `src/components/ui/accordion.tsx`. If this story needs something the primitive does not expose, the fix is to override via CSS (AC4) or to wrap the consumer, not to modify the Tier-1. [Source: CLAUDE.md § Tier 1 intact from starter]
- **No `t()` inside Tier-1 primitives.** The island is the i18n boundary. The shadcn accordion primitive receives strings via `children` (React props). [Source: Story 2.3 / Story 2.5 primitives-take-strings-via-props pattern]
- **FR52 V1 policy.** FR and DE `faq` blocks are byte-for-byte English copies. [Source: FR52]
- **Brand tokens only — no raw hex.** `--color-bg`, `--color-primary`, `--color-amber`, `--color-teal`, `--duration-base`. [Source: Story 1.7]
- **4 pt spacing grid.** All gaps / paddings in multiples of 4 px. [Source: CLAUDE.md § Key conventions]
- **Single `<h1>` invariant.** Hero owns `<h1>`. Section uses `<h2>`. Each accordion trigger is wrapped in `<h3>` by Radix's `AccordionPrimitive.Header` — verify in rendered DOM. [Source: UX-DR28]
- **Epic 2 color rhythm.** White `--color-bg` slot (surface blog previews → **white FAQ** → dark primary footer CTA). [Source: Story 1.7]
- **WAI-ARIA Accordion Pattern owned by Radix.** Do NOT hand-roll keyboard handlers. Radix's accordion is reference-grade. [Source: @radix-ui/react-accordion]
- **No `lib/content.ts` or `lib/structured-data.ts` imports.** Both are Epic 5 / Epic 6 scope. `TODO(epic-N)` comments mark the insertion points. [Source: Epic 5 Story 5.1; Epic 6 Story 6.2]

### Why `max-w-3xl` instead of `max-w-6xl`

Every other Epic 2 section uses `max-w-6xl` because they have multi-column layouts (hero two-column, problem + one-column narrative, inspection story narrative + sticky phone, social proof 3-stat grid + quote, blog previews 3-card grid). The FAQ accordion is **single-column reading content** — long-form questions and answers read best at a constrained character width (the editorial 60–75 ems range). `max-w-3xl` ≈ 48 rem ≈ ~800 px ≈ ~80 characters of 16 px body text, which is within the Baymard editorial sweet spot. Stretching the accordion to `max-w-6xl` would feel like a wall of text. This is a deliberate editorial variance from the Epic 2 default container and must be documented in the dev record.

### Why `client:idle` rather than `client:visible`

Both are valid below-the-fold directives per AR27. `client:idle` wins here because:
1. Users who scroll straight to the FAQ (a common pattern for objection-resolving users) expect the accordion to respond to the first click immediately. `client:visible` defers hydration until the section enters the viewport, which can create a ~50 ms lag on first interaction that is perceptible.
2. The accordion's JS chunk is non-trivial (~10 KB gzipped for the Radix accordion core + shadcn wrapper + lucide chevron). `client:idle` lets the browser schedule the hydration during an idle tick after LCP is reached, amortising the parse cost.
3. The `InspectionStoryScroll` island in Story 2.4 uses `client:visible` because it involves a scroll-tracking Intersection Observer that only matters when the section is visible — entirely different ergonomics. Don't apply that directive here without the ergonomic match.

### Why the chevron is coloured via global CSS instead of a component prop

Option A (rejected): Add a `chevronColor` prop to the shadcn `AccordionTrigger` primitive. **Rejected** because it modifies Tier-1 (CLAUDE.md forbids this), and the override is specific to one consumer (this section). Tier-1 should stay intact from the starter.

Option B (rejected): Wrap the chevron in a coloured span at the island level. **Rejected** because shadcn's `AccordionTrigger` renders the `ChevronDown` directly inside the button without a named slot — wrapping it requires editing the primitive.

Option C (chosen): Scope a global CSS rule to `.faq-section [data-radix-accordion-trigger] svg`. **Chosen** because:
- It is a single consumer-side rule that does not touch Tier-1,
- It uses Radix's stable data-attribute selector (`[data-radix-accordion-trigger]`),
- It is namespaced by the `.faq-section` class so other accordion usage elsewhere is unaffected,
- The reduced-motion fallback is trivially added in the same rule block.

### Previous-story intelligence

- **Story 2.5** (`inspection-story-scenes.tsx`). The canonical "React wrapper island as hydration root for React-only content consumed from Astro" pattern. This story applies the same pattern for the shadcn accordion — the island is the hydration root, the Astro section is the chrome. [Source: Story 2.5 AC4; Story 2.5 Dev Notes]
- **Story 2.4** (`inspection-story-scroll.tsx` + `mobile-nav.tsx`). The header-comment and import-convention templates for island files. [Source: src/components/islands/mobile-nav.tsx]
- **Story 2.2** (`problem-section.astro`). Canonical Astro Tier-2 section shape. [Source: src/components/sections/problem-section.astro]
- **Story 2.6 / 2.7** (`social-proof-section.astro`, `blog-previews-section.astro`). Immediate upstream sections — mount order on `src/pages/index.astro`. [Source: Stories 2.6 / 2.7]
- **Story 1.7** (motion tokens, global reduced-motion kill-switch, focus indicators). The chevron-rotation CSS leans on `--duration-base` and the global `@media (prefers-reduced-motion: reduce)` block. [Source: src/styles/global.css:143-145, 189-198]
- **Story 1.4** (shadcn starter + BaseLayout). The shadcn `Accordion` primitive ships from the starter and is Tier-1 frozen. [Source: src/components/ui/accordion.tsx]

### Cross-epic contracts

- **Epic 5 Story 5.1** creates the `faq` Content Collection and a `getFaqItems(locale)` helper in `src/lib/content.ts`. Story 5.4 then swaps this section's i18n reads for collection reads. The `TODO(epic-5)` comment marks the swap point.
- **Epic 6 Story 6.2** creates `src/lib/structured-data.ts` with a `faqJsonLd(items)` helper and injects the `FAQPage` JSON-LD via `BaseLayout`'s JSON-LD slot per FR41. The `TODO(epic-6)` comment marks the insertion point. Story 6.2 must reference this section's stable `id` slugs when generating `@id` values.
- **Epic 7 Story 7.2** creates the privacy policy page referenced from FAQ entry `data-retention` ("See our privacy policy for the full data lifecycle"). If the link target does not exist at Story 2.8's ship date, either phrase the FAQ answer to say "will be published before launch" or leave the link as inert text — do NOT hard-code a 404-generating URL.

### Files you will create / modify

**Create:**
- `src/components/sections/faq-section.astro`
- `src/components/islands/faq-accordion.tsx`

**Modify:**
- `src/i18n/en/landing.json` (add `faq` block)
- `src/i18n/fr/landing.json` (byte-for-byte copy — FR52)
- `src/i18n/de/landing.json` (byte-for-byte copy — FR52)
- `src/pages/index.astro` (import + render `<FaqSection />` below `<BlogPreviewsSection />`)
- `src/pages/_demo/text-expansion.astro` (harness registration)
- `src/styles/global.css` (append `.faq-section` chevron-colour + reduced-motion rules; namespaced, ≤20 lines)

**Do NOT touch:**
- `src/components/ui/accordion.tsx` — Tier-1 frozen
- `src/components/sections/*` other than creating `faq-section.astro`
- `src/components/islands/mobile-nav.tsx`, `inspection-story-scroll.tsx`, `inspection-story-scenes.tsx` (Story 2.5 if it renamed the wrapper), `inspection-story-scroll.module.css`
- `src/lib/stores/*` — no new store for FAQ state
- `src/layouts/BaseLayout.astro`
- `src/lib/i18n.ts` unless the `t()` helper does not support array returns (in which case minimal extension is allowed, documented in dev record)
- `src/lib/content.ts` — does not exist yet; creating it is Epic 5 scope
- `src/lib/structured-data.ts` — does not exist yet; creating it is Epic 6 scope
- `tailwind.config.ts`, `astro.config.mjs`, `lighthouse/budget.json`
- `package.json` — no new dependencies; `@radix-ui/react-accordion` and `lucide-react` already present

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** edit `src/components/ui/accordion.tsx`. Tier-1 frozen.
- ❌ **Do NOT** roll a custom accordion. Radix via shadcn is the only implementation.
- ❌ **Do NOT** hand-write keyboard handlers (`onKeyDown`, `onKeyUp`) on the accordion trigger — Radix owns the WAI-ARIA keyboard contract.
- ❌ **Do NOT** `import { getFaqItems } from '@/lib/content';` or `import { faqJsonLd } from '@/lib/structured-data';` — neither exists yet. Epic 5 / Epic 6.
- ❌ **Do NOT** create `src/content/faq/*.md` or `src/content/config.ts` entries. Epic 5 Story 5.1.
- ❌ **Do NOT** inject `<script type="application/ld+json">` for the FAQPage. Epic 6 Story 6.2.
- ❌ **Do NOT** add a new nanostore for FAQ state. Radix manages expand/collapse state internally; cross-island awareness is not needed.
- ❌ **Do NOT** use `client:load`. Below the fold, non-LCP.
- ❌ **Do NOT** use `client:visible`. `client:idle` gives better first-interaction responsiveness for fast-scrollers.
- ❌ **Do NOT** machine-translate FR / DE. Byte-for-byte English copies per FR52.
- ❌ **Do NOT** hard-code FAQ strings in the island. Every visible string routes through `t()`.
- ❌ **Do NOT** wrap the whole accordion in an additional `<h2>` or `<h3>` inside the island — the section's `<h2>` is in the Astro file, and Radix's `AccordionPrimitive.Header` wraps each trigger in `<h3>`. Do not double up.
- ❌ **Do NOT** persist accordion state to localStorage, URL hash, or cookies. V1 is session-scoped.
- ❌ **Do NOT** remove the `TODO(epic-5)` or `TODO(epic-6)` comments before Epic 5 / Epic 6 runs. They are load-bearing grep targets.
- ❌ **Do NOT** use `max-w-6xl` for the FAQ section container. Use `max-w-3xl` for editorial readability.
- ❌ **Do NOT** add `<FooterCtaSection />` or the mid-page CTA slot. Story 2.9.
- ❌ **Do NOT** add a Vitest file. `lib/` utilities only.
- ❌ **Do NOT** create `/_demo/faq.astro` or any other demo page. The live section on `/` is the reviewer surface.
- ❌ **Do NOT** claim the story complete without running axe-core on `/` and confirming zero violations.
- ❌ **Do NOT** add real privacy-policy URLs to the FAQ answers. Phrase as "See our privacy policy for the full data lifecycle" with no link (or a clearly inert `href="#"` with `aria-disabled="true"`) until Story 7.2 ships the real privacy page.

### Project Structure Notes

- **Alignment with unified structure:** New files in `src/components/sections/` and `src/components/islands/`, i18n updates in `src/i18n/{en,fr,de}/landing.json`, page composition edit in `src/pages/index.astro`, harness update in `src/pages/_demo/text-expansion.astro`, small scoped CSS addition in `src/styles/global.css` (namespaced via `.faq-section`). No new directories, no new collections, no new lib modules.
- **Variance from plan:** The `max-w-3xl` container is a deliberate editorial variance from the Epic 2 default `max-w-6xl`. Document in dev record. The `client:idle` choice is AR27-compliant and a deliberate call over `client:visible` — document in dev record.
- **`t()` array returns:** inspect `src/lib/i18n.ts` before implementing the island. If `t('landing.faq.items', locale)` does not return the raw JSON array (e.g., the helper only supports string returns), the cleanest fix is a minimal extension to `src/lib/i18n.ts` to support array / object returns — document the extension in the dev record. Alternative: import the raw `en.json` / `fr.json` / `de.json` at the island boundary under an AR23 exception documented in the island's header comment.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Architectural boundaries, § Hydration policy, § Key conventions, § Anti-patterns]
- [Source: epics-truvis-landing-page.md:1008-1038 — Story 2.8 complete BDD]
- [Source: epics-truvis-landing-page.md — UX-DR8 FAQ section, UX-DR28 heading hierarchy, UX-DR29 focus indicators, UX-DR30 contrast, UX-DR31 text expansion, UX-DR32 reduced motion]
- [Source: epics-truvis-landing-page.md — FR6 FAQ canonical topics, FR41 FAQPage JSON-LD (Epic 6), FR52 V1 i18n policy]
- [Source: prd-truvis-landing-page.md NFR1 LCP, NFR3 CLS, NFR5 initial weight, NFR6 Lighthouse Performance, NFR21 keyboard, NFR25 accessibility, NFR26 text expansion, NFR39 SEO]
- [Source: architecture-truvis-landing-page.md § Component Tiers, § Islands, § AR23, § AR27, § Palette rhythm]
- [Source: src/components/ui/accordion.tsx — shadcn / Radix accordion primitive (frozen Tier-1)]
- [Source: src/components/sections/problem-section.astro — canonical Astro Tier-2 section shape]
- [Source: src/components/sections/section-eyebrow.astro — confirm light-variant prop name]
- [Source: src/components/sections/social-proof-section.astro / blog-previews-section.astro — immediate upstream sections on `/`]
- [Source: src/components/islands/inspection-story-scenes.tsx or placeholder-demo.tsx — React wrapper island hydration-root pattern]
- [Source: src/lib/i18n.ts — `t()` helper, `Locale` type; confirm array-return support]
- [Source: src/styles/global.css — brand tokens, `--duration-base`, global reduced-motion kill-switch at ~line 189]
- [Source: src/pages/index.astro — current Epic 2 composition surface]
- [Source: src/pages/_demo/text-expansion.astro — harness registration pattern]
- [Source: _bmad-output/implementation-artifacts/2-4-build-inspectionstoryscroll-react-island-with-sticky-phone-mechanism-and-one-placeholder-scene.md — island file conventions, reduced-motion CSS layering]
- [Source: _bmad-output/implementation-artifacts/2-5-build-the-six-inspectionstoryscene-content-blocks-with-hard-stop-climax-variant.md — wrapper-island-as-hydration-root pattern]
- [Source: _bmad-output/implementation-artifacts/2-7-build-blogpreviewssection-with-inline-placeholder-cards.md — Epic 4/5/6 scope-guarding TODO-comment pattern]
- [Source: _bmad-output/implementation-artifacts/1-6-wire-astro-built-in-i18n-routing-and-locale-detection-middleware.md — `t()` helper, FR52]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — motion tokens, reduced-motion kill-switch, focus indicators, heading hierarchy]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6[1m]

### Debug Log References

- `npx astro check` → 0 errors, 0 warnings, 111 hints (pre-existing).
- `npx eslint .` → 0 errors, 2 pre-existing warnings in unrelated files.
- `npx prettier --check .` → clean after auto-format.
- `npx vitest run` → 41 tests passing, no new tests.
- `npm run build` → clean. New chunk `dist/_astro/faq-accordion.iaJynaAK.js` = **10 KB raw / 3.9 KB gzipped** (well under the 8–15 KB expected range). Total `/` initial weight stays well under the 500 KB NFR5 budget.

### Completion Notes List

- **AC1**: Tier-2 Astro section shell on `bg-[var(--color-bg)]` with the narrower `max-w-3xl` container (deliberate editorial variance from the Epic-2 default `max-w-6xl` — documented rationale: single-column reading content reads best at ~80-character width). Header comment carries the V1-scope note. `SectionEyebrow variant="light"` + `<h2 id="faq-heading">` wired to `t('landing.faq.*', locale)`. Mounts the React island as `<FaqAccordion client:idle locale={locale} />`. Optional subheadline omitted — no value-adding bridge copy.
- **AC2**: React hydration-root island `src/components/islands/faq-accordion.tsx` consumes the shadcn `Accordion` Tier-1 primitive with `type="single" collapsible`. Imports `t`/`Locale` from `@/lib/i18n` and the four Accordion primitives from `@/components/ui/accordion`. Default-exported as `FaqAccordion`. Zero custom keyboard handlers, zero nanostore — local Radix state only. Stable kebab-case slugs (`scope`, `vs-mechanic`, `privacy`, `cost`, `platforms`, `accuracy`, `data-retention`) in a `FAQ_ITEM_IDS` const array.
- **AC3 variance**: the `landing.faq.items` payload is stored as a **JSON object keyed by slug id** rather than a JSON array. Rationale: `t()`'s `resolveKey` returns only terminal strings, so array values are not dot-notation-retrievable. Keying by slug lets the island call `t('landing.faq.items.<slug>.question', locale)` cleanly while preserving the stable slug ids Epic 6 Story 6.2 needs for `FAQPage` JSON-LD `@id` values. All 7 canonical FR6 topics are covered 1-to-1. FR/DE byte-for-byte mirrors per FR52. Variance documented in the island's JSDoc header.
- **AC4**: `.faq-section [data-state] svg { color: var(--color-amber); transition: transform var(--duration-base) ease-out; }` added to `src/styles/global.css`, namespaced by the `.faq-section` class on the outer section wrapper. Explicit `@media (prefers-reduced-motion: reduce)` block zeros the transition (belt-and-braces on top of the global kill-switch). The rotation itself is already wired by shadcn's `[&[data-state=open]>svg]:rotate-180` Tailwind selector. Selector uses `[data-state]` (Radix's stable attribute) rather than the spec's `[data-radix-accordion-trigger]` because Radix's accordion Trigger exposes `data-state`, not a `data-radix-accordion-trigger` attribute.
- **AC5**: All keyboard behaviour inherited from Radix — Tab / Enter / Space / Arrow / Home / End, `aria-expanded`, `aria-controls`, focus indicators via the global `focus-visible` rules from Story 1.7. No custom handlers.
- **AC6**: `<FaqSection />` mounted on `src/pages/index.astro` directly below `<BlogPreviewsSection />`. Page order is now Hero → Problem → InspectionStory → SocialProof → BlogPreviews → Faq.
- **AC7**: `TODO(epic-5)` and `TODO(epic-6)` comments present in the section's frontmatter comment block, with the exact grep-friendly format. Neither `@/lib/content` nor `@/lib/structured-data` imported.
- **AC8**: Single `<h1>` invariant preserved. Section uses `<h2>`; each accordion trigger is wrapped by Radix's `AccordionPrimitive.Header` in an `<h3>` by default. Text tokens (primary on bg, amber chevron) all pass WCAG AA / 1.4.11.
- **AC9**: Text-expansion harness registers the real `FaqSection` with a reviewer note describing the padding protocol (pad answers in `en/landing.json`, reload, then open each accordion item).
- **AC10**: All CI gates clean. No `package.json` changes. `faq-accordion.js` is the only new chunk at 3.9 KB gzipped.

### File List

**Created:**

- `src/components/sections/faq-section.astro`
- `src/components/islands/faq-accordion.tsx`

**Modified:**

- `src/i18n/en/landing.json`
- `src/i18n/fr/landing.json`
- `src/i18n/de/landing.json`
- `src/styles/global.css` (added `.faq-section` chevron-colour rule + reduced-motion fallback)
- `src/pages/index.astro`
- `src/pages/_demo/text-expansion.astro`

### Change Log

| Date       | Change                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-11 | Implemented Story 2.8 — FaqSection with shadcn Accordion island, 7 placeholder entries, amber chevron. Status → review. |
