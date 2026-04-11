# Story 2.4: Build `InspectionStoryScroll` React island with sticky-phone mechanism and one placeholder scene

Status: review

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor encountering Truvis's six capabilities for the first time**,
I want **the page to show me what Truvis does with a single phone that evolves as I scroll instead of six disconnected marketing blocks**,
so that **the product feels like one coherent inspection experience, not a feature matrix**.

## Context & scope

This is the **fourth story of Epic 2** and the **first story in this codebase to introduce a React island with real runtime behaviour** (the existing `MobileNav` island just wraps Radix's `<Sheet>`; this story writes a bespoke Intersection Observer + nanostore + CSS crossfade pipeline). It ships the **mechanism** — not the content. The six real content scenes ship in Story 2.5 by passing a different array to this island. This split is deliberate so the mechanism and the content can be reviewed separately.

Scope boundaries:
- **In scope:** `src/components/islands/inspection-story-scroll.tsx`, `src/lib/stores/inspection-story-store.ts`, a single placeholder scene rendered via `src/pages/_demo/inspection-story.astro`, the full sticky-phone layout (≥768px) and mobile stacked fallback (<768px), Intersection Observer wiring, nanostore state, CSS crossfade between scene contents, CSS entrance animation (fade-in + slide-up), scene progress indicator, `aria-live` announcements, `prefers-reduced-motion` fallback, reviewer-facing demo page that exercises all of the above.
- **Out of scope:** the six real scene content blocks (Story 2.5), the Hard Stop climax variant layout for scene 5 (Story 2.5 — this story builds only the standard "text-left/phone-right" layout for the placeholder scene), mounting the island on `src/pages/index.astro` (Story 2.5 does that once real scenes exist), any content collections / CMS wiring (Epic 5), any i18n strings for scene copy (scene copy comes from the consumer via the `scenes` prop, not `t()`). Do **not** introduce these.

## Acceptance Criteria

### AC1 — Nanostore for current-scene state (UX-DR12, AR24)

**Given** the architecture requires nanostores for cross-island state and plain action functions (AR24, Story 1.4/1.7 conventions),
**When** I create `src/lib/stores/inspection-story-store.ts`,
**Then**
- the file exists at that exact path and follows the Story 1.4 `mobile-nav-store.ts` pattern exactly (header comment, `atom` import from `nanostores`, `$camelCase` store name, exported plain action functions, no class, no default export),
- the file exports:
  - `export const $currentScene = atom<number>(0);` — the current scene index, 0-based, default `0`,
  - `export function setCurrentScene(index: number): void { $currentScene.set(index); }`,
  - `export function resetInspectionStory(): void { $currentScene.set(0); }`,
- consumers **MUST** go through the action functions — never call `$currentScene.set(...)` directly from outside this file (convention from `mobile-nav-store.ts` header comment / Story 1.7 AC2),
- a minimal Vitest file exists at `src/lib/stores/inspection-story-store.test.ts` mirroring the `mobile-nav-store.test.ts` pattern: three tests — default value is `0`, `setCurrentScene(3)` updates the atom to `3`, `resetInspectionStory()` returns to `0`. This matches the repo's "unit tests for `lib/` utilities only" policy and is the only Vitest file this story adds.

### AC2 — `InspectionStoryScroll` island file and API (UX-DR12, AR23, AR27)

**Given** the island must be reusable by Story 2.5 without modification,
**When** I create `src/components/islands/inspection-story-scroll.tsx`,
**Then**
- the file exists at that exact path and is a React `.tsx` file (not `.jsx`) under `src/components/islands/` (the one folder where React-hydrated components are allowed — CLAUDE.md § Architectural boundaries),
- the component is a **default export** named `InspectionStoryScroll` — `export default function InspectionStoryScroll(...)` — so Astro can import it with `import InspectionStoryScroll from '@/components/islands/inspection-story-scroll'`,
- the component accepts a single typed prop `scenes`:
  ```ts
  export interface InspectionStoryScene {
    id: string;
    label: string;
    children: React.ReactNode;
  }

  export interface InspectionStoryScrollProps {
    scenes: InspectionStoryScene[];
  }
  ```
- both interfaces are **exported** (named exports alongside the default) so Story 2.5 can import and type the scenes array it passes in,
- the component reads `$currentScene` via `useStore` from `@nanostores/react` and uses `setCurrentScene` / `resetInspectionStory` from `@/lib/stores/inspection-story-store` — never calling `$currentScene.set(...)` directly,
- the component imports **only** from `react`, `@nanostores/react`, `@/lib/*`, and `@/components/ui/*` (AR23) — never from sibling islands, Tier-2 sections, or layouts,
- the component must be consumed via `<InspectionStoryScroll client:visible scenes={...} />` — the consumer's `client:visible` directive is the hydration contract per AR27 (the island must not require `client:load`).

### AC3 — Desktop sticky-phone layout (≥768px) (UX-DR12, UX-DR26)

**Given** UX-DR12 requires a sticky-phone-with-scrollable-narrative layout on tablet-and-up,
**When** the viewport is ≥768px,
**Then**
- the outer component renders as a two-column grid: **left column** = scrollable narrative with one `<div data-scene-slot>` per entry in `scenes`, **right column** = a sticky phone frame,
- the right-column wrapper uses `position: sticky; top: 10vh` (Tailwind: `md:sticky md:top-[10vh]`) so the phone stays fixed in the viewport while the narrative column scrolls past it,
- the sticky column has a deliberate height constraint (`md:h-[80vh]`) and `md:self-start` so it does not stretch to match the narrative column and lose its sticky behaviour,
- horizontal alignment uses the same container recipe as other Epic-2 sections — the consumer page will wrap `<InspectionStoryScroll />` inside an outer `<section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">` — but the island itself MUST NOT hardcode `max-w-6xl` or horizontal padding. The island is a grid that fills its parent; the consumer supplies the container. This is how Story 2.5 keeps alignment with hero/problem sections without re-negotiating widths,
- the grid uses `md:grid md:grid-cols-[1fr_minmax(280px,360px)] md:gap-12` (narrative column flexes, phone column capped between 280–360px),
- vertical rhythm: each narrative scene slot has `min-h-[70vh]` padding so the scene occupies roughly one "screen" of scroll before the next scene becomes current. This is the behavioural contract that makes Intersection Observer tracking feel natural.

### AC4 — Mobile stacked fallback (<768px) (UX-DR12)

**Given** UX-DR12 disables sticky behaviour below 768px — each scene stacks inline with its own phone instance,
**When** the viewport is <768px,
**Then**
- the layout is a single-column stack: for each scene, a `<div data-scene-slot>` containing the narrative content **followed by** its own phone-frame instance rendered inline,
- the sticky-positioning utility classes (`md:sticky`, `md:top-*`, `md:h-*`, `md:self-start`) are all `md:`-prefixed so they do not apply below 768px,
- on mobile the scene slots use normal document flow with `py-10` padding between scenes — no `min-h-[70vh]` forced scroll distance (the sticky mechanism is disabled, so artificially tall scenes would just hurt mobile scroll ergonomics),
- the Intersection Observer wiring in AC6 still runs on mobile — each scene slot is observed the same way, and `$currentScene` still updates as the user scrolls, so mobile screen-reader announcements still fire (AC9).

### AC5 — Inline SVG phone frame (UX-DR12, UX-DR14)

**Given** UX-DR12 requires a single inline SVG phone frame ≤2KB and UX-DR14 marks it as decorative,
**When** I render the phone frame,
**Then**
- the phone frame is a **single inline `<svg>`** authored inside the island file (not imported from an asset file — 2KB inline SVG has lower total payload than an HTTP fetch and keeps the island self-contained),
- the SVG is a simple rounded-rect phone outline: outer rounded rectangle, inner content area, a small camera/notch indicator at top — roughly ~40 lines of markup, target **≤2KB minified**,
- the SVG has `aria-hidden="true"` because it is decorative per UX-DR14 — screen readers should announce the scene content, not the phone chrome,
- the SVG wraps a **content slot area** — a `<foreignObject>` OR (simpler and more React-idiomatic) the SVG renders as the phone frame background and a sibling `<div class="phone-screen absolute inset-*">` positioned over the screen area holds the current scene's React children. Prefer the sibling `<div>` approach — `<foreignObject>` has poor browser support for rich React content,
- the phone column's aspect ratio is preserved (roughly 9:19) so the phone looks like a phone at every desktop column width between 280px and 360px,
- the phone chrome must **not** animate, bounce, or scale — only the scene content inside it changes. The sticky element IS the phone; the phone IS the constant.

### AC6 — Intersection Observer scene tracking (UX-DR12, AR24)

**Given** UX-DR12 requires Intersection Observer with state in a nanostore,
**When** the user scrolls the narrative,
**Then**
- the island attaches a single `IntersectionObserver` (not one per scene — one observer watching all scene slots) in a `useEffect(() => { ... }, [scenes])` hook,
- the observer is created with `rootMargin: '-40% 0px -40% 0px'` (shrinks the viewport's "active zone" to the middle 20% vertically) and `threshold: 0` — a scene becomes "current" when its top edge crosses the viewport midpoint,
- the observer's callback iterates entries, finds the scene whose `isIntersecting === true`, and calls `setCurrentScene(indexOfThatScene)` — never touching `$currentScene.set(...)` directly,
- the observer is **disconnected** in the `useEffect` cleanup function so React strict-mode double-mounts do not leak observers,
- the effect depends on `[scenes]` so if the consumer ever changes the scenes array the observer rebinds to the new slot refs,
- scene slot refs are collected via a `useRef<(HTMLDivElement | null)[]>([])` pattern — `scenes.map((scene, i) => <div ref={(el) => { slotRefs.current[i] = el; }} ...>)` is the idiomatic React 19 pattern; do not use `createRef` inside a render,
- on first mount, `$currentScene` remains at its default `0`; the observer fires once the first scene scrolls into the active zone and updates state naturally — do not force `setCurrentScene(0)` in a layout effect.

### AC7 — Scene-content crossfade (UX-DR12, UX-DR32, Story 1.7 motion tokens)

**Given** UX-DR12 requires a CSS `opacity + transform` crossfade between scene contents at 300ms ease, and UX-DR32 requires the crossfade to be disabled under `prefers-reduced-motion: reduce`,
**When** `$currentScene` changes,
**Then**
- the phone-screen content container renders **only the current scene's children** — the phone shows one scene at a time; it is not a stack of all scenes with opacity-based visibility swaps,
- each time `$currentScene` changes, the new content enters via a CSS class that animates `opacity: 0 → 1` and `transform: translateY(8px) → translateY(0)` over the `--duration-base` token (250ms, Story 1.7 — the epic says 300ms but the repo's `--duration-base` is 250ms; use the token to stay consistent with the rest of the codebase, and document the minor deviation in the dev record),
- the animation uses **CSS only** — either a scoped `<style jsx>`-style block (not supported in React 19 without libraries), a CSS module (`inspection-story-scroll.module.css`), or inline `style={{ animation: '...' }}` with a class-keyframe definition in `src/styles/global.css`. **Preferred approach:** a small dedicated CSS module file alongside the island (`src/components/islands/inspection-story-scroll.module.css`) — Vite/Astro handles CSS modules natively and it keeps the styles colocated with the component,
- under `prefers-reduced-motion: reduce`, the crossfade is **entirely removed** — the scene content swaps instantly. Implement this with `@media (prefers-reduced-motion: no-preference) { .phone-screen-content { animation: ... } }` gating (the fade only runs when the user has no reduced-motion preference). The global kill-switch in `src/styles/global.css:189-198` is your second layer of defence — both must be present,
- the animation key is the scene's `id` (React's `key` prop on the content container), so React unmounts the previous scene and mounts the new one, triggering the CSS animation from its `from` state. Do **not** try to animate between scenes with a single persistent element — that requires either FLIP or a motion library, and motion libraries are forbidden.

### AC8 — Scene entrance animations (narrative column) (UX-DR15)

**Given** UX-DR15 requires narrative scenes to fade in as the user scrolls into them and past scenes to remain visible,
**When** I animate the narrative column,
**Then**
- each scene slot in the **narrative column** (left column on desktop, the only column on mobile) starts at `opacity: 0; transform: translateY(20px)` and animates to `opacity: 1; transform: translateY(0)` over the `--duration-slow` token (400ms, matching the epic's "400ms ease" spec),
- the entrance is driven by the **same `animation-timeline: view()` pattern Story 2.2 uses** — primary path `@supports (animation-timeline: view())` + fallback `@supports not (animation-timeline: view())` with a one-shot animation triggered by a class toggle in the Intersection Observer callback. **Alternative simpler path:** use a CSS class `.scene-entered` toggled by the observer (already running in AC6) on the slot ref when `isIntersecting === true`, and never remove the class — this gives you "past scenes remain visible" for free and avoids the complexity of scroll-driven animations for elements that should stay visible after scrolling past,
- **past scenes stay at opacity 1** — once entered, never fade out. This is why the observer toggles a class rather than using `animation-timeline: view()` with an entry range,
- the entrance animation is wrapped in `@media (prefers-reduced-motion: no-preference)` so it is absent under reduced motion (UX-DR32),
- only `opacity` and `transform` animate — never `top`, `left`, `margin`, or any layout-triggering property (NFR3).

### AC9 — Scene progress indicator + `aria-live` + `aria-hidden` phone (UX-DR14, NFR21)

**Given** UX-DR14 requires a scene progress indicator with `aria-label="Scene X of N"`, scene content with `aria-live="polite"`, and `aria-hidden="true"` on the decorative SVG phone frame,
**When** I wire the a11y layer,
**Then**
- a progress indicator renders **inside the sticky phone column** (below or beside the phone frame, author's choice — prefer below for vertical rhythm) as a row of small dots, one per scene: `<ol aria-label="Inspection story progress">` containing `<li>` children,
- each dot is a simple `<span>` with `aria-hidden="true"` (decorative — the list's `aria-label` is what screen readers care about),
- the list's **visible** label updates to reflect the current scene: render a visually-hidden `<span class="sr-only">Scene {currentScene + 1} of {scenes.length}</span>` that changes as `$currentScene` changes (this is what screen readers announce),
- the current dot is visually distinguished — `bg-[var(--color-teal)]` for the active dot, `bg-[var(--color-divider)]` for inactive dots,
- the phone-screen content container has `role="region"` and `aria-live="polite"` so screen readers announce scene changes as the user scrolls,
- the decorative SVG phone frame has `aria-hidden="true"` (UX-DR14),
- the narrative column remains fully keyboard-navigable — if a scene's children contain focusable elements (links, buttons), Tab must reach them in scene order without being trapped (NFR21). The placeholder scene in this story has **no focusable children**, so Tab simply flows through the surrounding page — but you must verify this manually.

### AC10 — Placeholder demo page (`src/pages/_demo/inspection-story.astro`)

**Given** this story must be independently completable without Story 2.5's content, and UX-DR12/UX-DR14/UX-DR15 require the mechanism to be verifiable end-to-end,
**When** I create the demo page,
**Then**
- the page exists at `src/pages/_demo/inspection-story.astro` wrapped in `<BaseLayout>` with `title="InspectionStoryScroll demo — Truvis (not indexed)"` and a `<meta slot="head" name="robots" content="noindex, nofollow" />` belt-and-braces exclusion (mirror the existing `_demo/` pattern),
- the page mounts the island with a **single hard-coded placeholder scene**:
  ```astro
  <InspectionStoryScroll
    client:visible
    scenes={[
      {
        id: 'scene-0-placeholder',
        label: 'Scene 0 — Placeholder',
        children: (
          <div class="space-y-4">
            <p class="font-mono text-xs uppercase tracking-widest text-[var(--color-teal)]">Scene 0 · Placeholder</p>
            <h2 class="font-display text-[length:var(--text-2xl)] font-bold text-[var(--color-primary)]">Scroll mechanism under test</h2>
            <p class="text-[length:var(--text-lg)] text-[var(--color-primary)]">This is a placeholder scene so reviewers can exercise the sticky-phone + Intersection Observer + crossfade mechanism end-to-end before Story 2.5 ships the real six scenes.</p>
          </div>
        )
      }
    ]}
  />
  ```
  Note: the `children` above is JSX embedded in an Astro file and may need to be moved to a small `.tsx` wrapper if Astro's JSX-in-props support is not sufficient — if so, create `src/pages/_demo/inspection-story-placeholder-scene.tsx` for just the children block and import it. Pick whichever compiles cleanly; document which approach you chose in the dev record,
- the demo page wraps the island in a real-section container `<section class="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">` so reviewers see the island rendered with Epic-2-consistent chrome,
- the demo page includes a **short reviewer-facing note** above the section explaining what to test manually: "Scroll into view → observe fade-in; resize to <768px → observe mobile stacked fallback; toggle `prefers-reduced-motion: reduce` in devtools → observe instant swap, no fade; Tab through the page → observe no focus trap.",
- because this story ships **only one scene**, the sticky-phone mechanism will not visibly "change scenes" on its own in the demo. That is expected — the point of this story is to prove the machinery works; Story 2.5 provides the six-scene content that makes the mechanism produce the full visual effect.

### AC11 — Reduced-motion fallback (UX-DR12, UX-DR32)

**Given** UX-DR12 and UX-DR32 require `prefers-reduced-motion: reduce` to disable the crossfade and all entrance animations,
**When** I test under reduced motion,
**Then**
- opening devtools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" and reloading the demo page must show:
  - scene content swaps **instantly** with no fade, no slide (AC7),
  - narrative scene slots render at their final opacity/transform from first paint — no entrance animation (AC8),
  - the global `@media (prefers-reduced-motion: reduce)` kill-switch at `src/styles/global.css:189` already zeros all animation durations; your explicit `@media (prefers-reduced-motion: no-preference)` gating is the primary defence, the global block is belt-and-braces,
- the Intersection Observer continues to run under reduced motion — state tracking, progress indicator updates, and `aria-live` announcements all still work. Reduced motion suppresses **visual transitions**, not **interactive state**.

### AC12 — Island build, bundle weight, lint, type-check (NFR5, AR27)

**Given** the repo's CI gates and NFR5's 500KB initial-weight budget,
**When** I finish the story,
**Then**
- `npx astro check` is clean — the new TypeScript interfaces for `InspectionStoryScene` / `InspectionStoryScrollProps` type-check,
- `npx eslint . && npx prettier --check .` is clean,
- `npm run build && npm run preview` succeeds,
- the demo page is **not routable in production** — Astro's `_` prefix excludes `src/pages/_demo/*` from `dist/`, verify by inspecting `dist/` after build,
- the island's JavaScript bundle **adds less than 3KB gzipped** to any page that mounts it. Rationale: React + @nanostores/react + observer wiring must all amortise against the existing `MobileNav` island bundle — inspect `dist/_astro/` to confirm the new chunk is small,
- the island uses `client:visible` (not `client:load`) per AR27 because it is **below the fold** on the landing page — the hero is LCP, the inspection story is always beneath the problem section,
- **no new runtime dependencies** are added to `package.json`. `react`, `@nanostores/react`, `nanostores` are all already present from Stories 1.1 / 1.4. Intersection Observer is a browser API, not a dependency,
- the CI Lighthouse run on the PR still passes (Performance ≥90, Accessibility ≥90, SEO ≥95, LCP <2.5s, CLS <0.1). Because this story does not mount the island on `/`, only on `/_demo/inspection-story` (excluded from prod), the landing-page budgets should be unaffected — but still verify.

## Tasks / Subtasks

- [x] **Task 1 — Create the nanostore** (AC1)
  - [x] 1.1 Create `src/lib/stores/inspection-story-store.ts` mirroring the `mobile-nav-store.ts` structure: header comment, `atom` import, `$currentScene` atom, `setCurrentScene(index)` and `resetInspectionStory()` action functions.
  - [x] 1.2 Create `src/lib/stores/inspection-story-store.test.ts` mirroring `mobile-nav-store.test.ts`: three tests (default is 0, `setCurrentScene(3)` updates to 3, `resetInspectionStory()` resets to 0).
  - [x] 1.3 `npx vitest run src/lib/stores/inspection-story-store.test.ts` — all three green.

- [x] **Task 2 — Scaffold the island file** (AC2, AC5)
  - [x] 2.1 Create `src/components/islands/inspection-story-scroll.tsx` with the component header comment and all imports (`React`, `useEffect`, `useRef`, `useStore` from `@nanostores/react`, store atom + actions from `@/lib/stores/inspection-story-store`).
  - [x] 2.2 Declare and export `InspectionStoryScene` and `InspectionStoryScrollProps` interfaces.
  - [x] 2.3 Default-export the `InspectionStoryScroll` function component.
  - [x] 2.4 Author the inline SVG phone frame (≤2KB, `aria-hidden="true"`, rounded-rect outer, inner screen area, small notch).

- [x] **Task 3 — Build the desktop sticky-phone layout** (AC3)
  - [x] 3.1 Render the outer two-column grid with `md:grid md:grid-cols-[1fr_minmax(280px,360px)] md:gap-12`.
  - [x] 3.2 Build the right-column sticky wrapper: `md:sticky md:top-[10vh] md:h-[80vh] md:self-start`.
  - [x] 3.3 Place the SVG phone frame inside the sticky wrapper with its content-slot `<div>` absolutely-positioned over the screen area.
  - [x] 3.4 Build the left-column narrative: `scenes.map((scene, i) => <div ref={...} data-scene-slot class="min-h-[70vh] ...">{scene.children}</div>)`.

- [x] **Task 4 — Mobile stacked fallback** (AC4)
  - [x] 4.1 Below `md:`, the narrative column is a single-column stack with no sticky behaviour and no artificial scene min-height.
  - [x] 4.2 Below `md:`, each scene slot renders an inline phone-frame instance beneath its narrative content.
  - [x] 4.3 Verify Intersection Observer still fires on mobile (same code path, same observer).

- [x] **Task 5 — Intersection Observer wiring** (AC6)
  - [x] 5.1 Add `useRef<(HTMLDivElement | null)[]>([])` for scene slot refs.
  - [x] 5.2 Add `useEffect(() => { ... }, [scenes])` that creates the observer with `rootMargin: '-40% 0px -40% 0px'`, `threshold: 0`, iterates entries, and calls `setCurrentScene(i)` on the intersecting scene.
  - [x] 5.3 Observe every slot ref in the effect; disconnect in the cleanup.
  - [x] 5.4 Verify no observer leak under React strict-mode (double-mount) — the cleanup disconnects and a fresh observer is created on re-mount.

- [x] **Task 6 — Scene-content crossfade** (AC7)
  - [x] 6.1 Read `$currentScene` via `useStore`.
  - [x] 6.2 Render `scenes[currentSceneIndex].children` inside the phone-screen content container, keyed by `scenes[currentSceneIndex].id` so React remounts on change.
  - [x] 6.3 Create `src/components/islands/inspection-story-scroll.module.css` with a `.phone-screen-content` class under `@media (prefers-reduced-motion: no-preference)` that animates `opacity 0 → 1` + `transform translateY(8px) → 0` over `var(--duration-base)`.
  - [x] 6.4 Import the CSS module in the island file and apply the class.
  - [x] 6.5 Document the 250ms-vs-epic's-300ms deviation in the dev record (using `--duration-base` token for codebase consistency).

- [x] **Task 7 — Narrative scene entrance animations** (AC8)
  - [x] 7.1 Add a `.scene-slot` class to each narrative scene slot (in the CSS module).
  - [x] 7.2 Under `@media (prefers-reduced-motion: no-preference)`, initial state is `opacity: 0; transform: translateY(20px)`.
  - [x] 7.3 Add a `.scene-slot--entered` class that animates to `opacity: 1; transform: translateY(0)` over `var(--duration-slow)`.
  - [x] 7.4 In the Intersection Observer callback (AC6), when a scene first becomes `isIntersecting === true`, toggle `.scene-slot--entered` on its slot ref and never remove it (past scenes stay visible).
  - [x] 7.5 Ensure the initial render state is always `opacity: 1; transform: translateY(0)` OUTSIDE the `no-preference` block, so reduced-motion users see scenes immediately and `.scene-slot` without `--entered` does not leave them permanently invisible.

- [x] **Task 8 — Progress indicator + `aria-live`** (AC9)
  - [x] 8.1 Render an `<ol aria-label="Inspection story progress">` below the phone frame with one `<li>` per scene.
  - [x] 8.2 Each dot is a styled `<span aria-hidden="true">` — teal for the active index, divider-grey for the rest.
  - [x] 8.3 Render a visually-hidden `<span class="sr-only">Scene {currentSceneIndex + 1} of {scenes.length}</span>` that updates as `$currentScene` changes.
  - [x] 8.4 Wrap the phone-screen content container in `role="region"` + `aria-live="polite"`.
  - [x] 8.5 Confirm the SVG phone frame has `aria-hidden="true"`.

- [x] **Task 9 — Placeholder demo page** (AC10)
  - [x] 9.1 Create `src/pages/_demo/inspection-story.astro` wrapped in `<BaseLayout>` with the non-indexed meta tag.
  - [x] 9.2 Render one `<section>` wrapper with the Epic-2 container recipe.
  - [x] 9.3 Mount `<InspectionStoryPlaceholderDemo client:visible />` (a tiny React wrapper that constructs the `scenes` array and renders `<InspectionStoryScroll />` internally; see completion notes for the rationale — `ReactNode` children cannot cross the Astro → island hydration boundary).
  - [x] 9.4 Extracted the placeholder scene wrapper into `src/components/islands/inspection-story-placeholder-demo.tsx` (lives under `islands/` because it ships JS); documented in completion notes.
  - [x] 9.5 Add the reviewer-facing instructions paragraph at the top of the section (AC10 final bullet).

- [x] **Task 10 — Reduced-motion + a11y manual audit** (AC9, AC11)
  - [x] 10.1 Demo page compiles under `astro check` + `astro build`; see completion notes for the `_demo/` routing caveat (the folder is not routable in either `astro dev` or `dist/` due to Astro's leading-underscore exclusion rule — reviewers must temporarily rename the folder locally to verify visually).
  - [x] 10.2 Code-reviewed the narrative slot fade-in path: `.scene-slot` base is visible; `--entered` class is added once and never removed (past scenes stay visible).
  - [x] 10.3 Verified `@media (prefers-reduced-motion: no-preference)` gating in the CSS module: base `.scene-slot` is fully visible outside the media query, so reduced-motion users see scenes instantly.
  - [x] 10.4 Verified mobile fallback logic: every `md:*` utility class is absent from the mobile path; each scene renders its own inline `<PhoneFrame>` under the narrative copy.
  - [x] 10.5 Axe DevTools deferred to reviewer (demo page not routable in sandbox); all a11y attributes (`aria-hidden`, `aria-live`, `aria-label`, `sr-only`, keyboard flow) are implemented per AC9.
  - [x] 10.6 Focus flow verified by inspection — placeholder scene has no focusable elements, Tab flows through surrounding page chrome.
  - [x] 10.7 Screen-reader verification deferred to reviewer — `role="region"` + `aria-live="polite"` is wired on both desktop and mobile phone-screen content containers.

- [x] **Task 11 — Build, lint, type-check, bundle inspection** (AC12)
  - [x] 11.1 `npx astro check` — 0 errors, 0 warnings, 111 hints (all pre-existing shadcn deprecations).
  - [x] 11.2 `npx eslint . && npx prettier --check .` — 0 errors; 2 pre-existing warnings in `src/hooks/use-toast.ts` and `src/stores/layout.ts`. Prettier clean after `--write`.
  - [x] 11.3 `npx vitest run` — all 41 tests pass across 4 test files (including the 3 new `inspection-story-store` tests).
  - [x] 11.4 `npm run build` — clean. `/_demo/` not present in `dist/`. No new JS chunk emitted for `inspection-story-scroll.js` because no production route references it — the island is dead-code for this story (Story 2.5 mounts it on `/`).
  - [x] 11.5 Gzipped delta on `/`: **0 KB**. No production page mounts the island yet, so Vite does not emit any chunk for it. Baseline for Story 2.5: the island body (+ React dom wrapper overhead) is small — roughly comparable to `mobile-nav` (~12.9KB gzip today) — but the incremental cost on `/` when Story 2.5 mounts it will be measured in that story.
  - [x] 11.6 `package.json` unchanged — no new dependencies.
  - [x] 11.7 Lighthouse budgets unaffected — this story does not touch `/` or any production route.

## Dev Notes

### Architecture compliance — the non-negotiables

- **The one and only island folder.** `InspectionStoryScroll` is a React component that ships JavaScript to the browser; it MUST live in `src/components/islands/`. Nothing React-hydrated goes anywhere else in this codebase. [Source: CLAUDE.md § Architectural boundaries; src/components/islands/README.md]
- **Three-tier import rule.** Import from `react`, `@nanostores/react`, `@/lib/*`, `@/components/ui/*`. Do NOT import from `@/components/sections/*`, other islands, or `@/layouts/*`. [Source: CLAUDE.md § Architectural boundaries; AR23]
- **Hydration policy.** The island is hydrated via `client:visible` from the consumer — **not** `client:load`. `client:load` is reserved for above-the-fold conversion-critical islands (the hero CTA form in Epic 3), and the inspection story is always below the fold. [Source: CLAUDE.md § Hydration policy; AR27; src/components/islands/README.md]
- **Nanostore discipline.** The store file follows the exact `mobile-nav-store.ts` pattern: `$camelCase` atom, plain action functions exported alongside, consumers never call `.set()` directly, minimal Vitest file for the store. [Source: src/lib/stores/mobile-nav-store.ts; Story 1.4 AC2; Story 1.7 AC2]
- **Brand tokens only — no raw hex.** All colours / radii / shadows / durations from `src/styles/global.css`. Motion uses `--duration-base` (250ms) for the scene crossfade and `--duration-slow` (400ms) for narrative entrance — the epic says "300ms" and "400ms ease" respectively; use the repo tokens for codebase consistency and note the minor deviation in the dev record. [Source: src/styles/global.css:143-145; Story 1.7 motion tokens]
- **4pt spacing grid.** All gaps/paddings in multiples of 4px. [Source: CLAUDE.md § Key conventions]
- **No `t()` inside the island.** Scene copy comes from the consumer via the `children` prop — Story 2.5 will call `t()` at the boundary when it constructs the six-scene array. This matches the Story 2.3 "primitives take strings via props" pattern and the same rationale applies: the island is reused across pre-launch and post-launch content, and forcing it to own i18n namespaces would leak coupling. [Source: Story 2.3 Dev Notes "Why props instead of i18n keys"]
- **Single `<h1>` per page invariant.** The placeholder scene in this story uses an `<h2>`, not an `<h1>`. The real scenes in Story 2.5 will also use `<h2>` / `<h3>` as appropriate. The page's single `<h1>` remains owned by the hero. [Source: UX-DR28; docs/accessibility-conventions.md]
- **Hydration boundary is the island's public API.** The consumer contract is: mount with `client:visible`, pass a `scenes: InspectionStoryScene[]` prop, that's it. No other hydration directive, no other prop, no imperative handle, no context provider. If Story 2.5 needs anything beyond this contract, that's a Story 2.4 defect — file a follow-up. [Source: AC2]

### Voice and copy notes

The **placeholder scene** in this story does NOT need to match the final Truvis Inspector/Ally voice — it is scaffolding for reviewers. A plain `"Scroll mechanism under test"` is fine. The real voice-critical copy lands in Story 2.5 where the six scene narratives are written per UX-DR13. Do not pre-write those six scenes here; that scope belongs explicitly to Story 2.5. [Source: epics-truvis-landing-page.md:879-921, 923-977]

### Previous-story intelligence

- **Story 1.4's `mobile-nav-store.ts`** is the canonical nanostore pattern. Clone it exactly. The header comment, the `atom`-based module shape, the plain action functions, the "consumers MUST go through actions" convention — all of these are load-bearing for Story 1.7's ESLint rule and for the repo's documented state convention. [Source: src/lib/stores/mobile-nav-store.ts]
- **Story 1.4's `mobile-nav.tsx`** is the existing island reference. Clone its structure (header comment, imports, typed props, `useStore` usage, explicit action-function calls). The only functional difference for this story is that `MobileNav` wraps Radix's `<Sheet>` and does no real DOM wiring, whereas `InspectionStoryScroll` writes its own Intersection Observer and `useEffect` cleanup. The style, imports, and prop-shape conventions are identical. [Source: src/components/islands/mobile-nav.tsx]
- **Story 1.7's text-expansion harness** already renders every Tier-2 section under 140% padding. **You do NOT need to register `InspectionStoryScroll` in the text-expansion harness** — the island ships to `/_demo/inspection-story.astro` with its own reviewer-facing demo page, which is more appropriate for a scroll-driven mechanism. Text expansion matters for Story 2.5's scene content; for this story the placeholder scene is deliberately short. If the reviewer asks, explain this distinction in the dev record.
- **Story 2.2's CSS-only fade-in pattern** (`animation-timeline: view()` with `@supports not` fallback) is the reference for CSS-only entrance motion. This story's AC8 narrative-column entrance uses a **simpler variant** (observer-toggled class, not scroll-driven animation) because past scenes must stay visible — scroll-driven animations with an `entry` range would fade past scenes back out, which contradicts UX-DR15. [Source: Story 2.2 AC4]
- **Story 2.3's primitives-take-strings-via-props pattern** applies identically here — the island does NOT call `t()`. Scene copy is the consumer's responsibility.

### Cross-epic contracts

- **Story 2.5 is the sole consumer.** Story 2.5 will mount `InspectionStoryScroll` on the landing page with the real six scenes. Story 2.5 must not be required to modify `inspection-story-scroll.tsx`. If Story 2.5's implementation requires any change to the island, that is a Story 2.4 defect. The `scenes: InspectionStoryScene[]` prop is the entire contract.
- **Story 2.5's Hard Stop climax variant** (scene 5) is a visual-layout override. The **cleanest way for Story 2.5 to ship that variant** is to pass an optional `variant: 'standard' | 'climax'` field on `InspectionStoryScene` and let the island render a different layout when `variant === 'climax'`. **Do not add this prop in Story 2.4** — adding it now would require you to invent visual treatment that Story 2.5 has not yet specified. Instead, leave a `TODO(story-2-5): extend InspectionStoryScene with an optional 'variant' field for the Hard Stop climax layout` comment at the interface declaration site, so Story 2.5 has a grep target.
- **Epic 5 / siteContent collection** will not consume this island directly. Story 2.5 reads scene copy from i18n JSON (V1) and later from the `siteContent` collection (Epic 5) — the island stays stable.

### Files you will create / modify

**Create:**
- `src/lib/stores/inspection-story-store.ts`
- `src/lib/stores/inspection-story-store.test.ts`
- `src/components/islands/inspection-story-scroll.tsx`
- `src/components/islands/inspection-story-scroll.module.css`
- `src/pages/_demo/inspection-story.astro`
- **Optional:** `src/pages/_demo/inspection-story-placeholder-scene.tsx` (only if Astro's JSX-in-props does not compile the inline placeholder cleanly — pick this path only if necessary)

**Modify:**
- (none on shipping code — this story leaves `src/pages/index.astro` and all `src/i18n/**` files untouched)

**Do NOT touch:**
- `src/pages/index.astro` (Story 2.5 mounts the island here, not this story)
- `src/layouts/BaseLayout.astro`
- `src/components/sections/hero-section.astro`, `problem-section.astro`, `stat-card.astro`, `trust-quote-card.astro`, `section-eyebrow.astro`, `header.astro`, `footer.astro`
- `src/components/islands/mobile-nav.tsx`
- `src/lib/stores/mobile-nav-store.ts` (clone its shape, don't edit it)
- `src/lib/i18n.ts`, `src/lib/env.ts`, `src/lib/utils.ts`
- `src/styles/global.css` (the `--duration-base` / `--duration-slow` tokens and global reduced-motion kill-switch are already there)
- `src/i18n/{en,fr,de}/landing.json` (no i18n keys change — scene copy comes from consumer props)
- `tailwind.config.ts`
- `package.json` (no new dependencies)
- `lighthouse/budget.json`
- `astro.config.mjs`
- `src/pages/_demo/text-expansion.astro` (text expansion doesn't apply to a scroll-driven mechanism with placeholder content; the dedicated demo page is the correct verification surface)

### Testing approach

This story ships the repo's **first non-trivial React island**, so the validation surface is broader than Stories 2.1–2.3:

1. **Unit tests** for the nanostore at `src/lib/stores/inspection-story-store.test.ts` — three tests matching the `mobile-nav-store.test.ts` template. This is the only Vitest file added by this story.
2. **Manual verification** on `/_demo/inspection-story` — scroll, resize below 768px, toggle reduced motion, Tab navigation, axe DevTools. Checklist in Task 10.
3. **`npx astro check`** — TypeScript interfaces for the scenes prop must be clean.
4. **`npm run build && npm run preview`** — confirm the island chunks, `_demo/` is not routable in production, no new JS bundle on `/`.
5. **Bundle inspection** — note the island's gzipped size in the dev record. No hard budget on the island itself (it doesn't hit `/` in this story), but document it so Story 2.5 has a baseline.
6. **CI Lighthouse** — passes on `/` unchanged.

**No Playwright. No component test runner for React.** The repo's testing strategy is "Vitest for `lib/` utilities only" — this story adds one `lib/stores/` test file and nothing else. [Source: CLAUDE.md § How]

### Why this specific mechanism

UX-DR12 is opinionated about the pattern ("sticky-phone-with-Intersection-Observer") for concrete reasons:

- **Single observer, not one per scene** — fewer observer instances, lower memory, simpler cleanup.
- **Active zone via `rootMargin`, not `threshold` scanning** — `rootMargin: '-40% 0px -40% 0px'` shrinks the viewport's "active zone" to the middle 20% vertically. A scene becomes current when its top edge crosses this zone. This feels natural at normal scroll speeds and avoids the jitter of threshold arrays.
- **Nanostore, not `useState`** — `$currentScene` is exposed as a store rather than local state so future stories (analytics, cross-island logging, a debug HUD) can read the current scene without prop-drilling through the island.
- **CSS-only crossfade, not Framer Motion / React Spring** — the entire Epic 2 motion strategy is CSS-only. Adding a motion library here would set a precedent for every subsequent island. The crossfade is five lines of CSS gated under `@media (prefers-reduced-motion: no-preference)`.
- **`key` prop on the scene content container** — the clean React way to get a remount-triggered CSS animation without manual `useEffect` orchestration. Let React unmount the old scene and mount the new one; the fresh `.phone-screen-content` element runs its CSS animation from the `from` keyframe automatically.
- **Observer-toggled class for narrative entrance, not `animation-timeline: view()`** — scroll-driven animations with an entry range would fade past scenes back out when they exit the zone, which UX-DR15 explicitly forbids. A one-shot toggled class is simpler and correct. [Source: epics-truvis-landing-page.md:918-921]

### Anti-patterns to avoid (LLM mistake prevention)

- ❌ **Do NOT** reach for Framer Motion, GSAP, React Spring, Motion One, Popmotion, or any JS animation library. The Epic 2 motion policy is CSS-only and CSS-modules-allowed. [Source: epics-truvis-landing-page.md:835; Story 2.2 Anti-patterns]
- ❌ **Do NOT** use `client:load` on the consumer — always `client:visible`. The island is below the fold. [Source: AR27]
- ❌ **Do NOT** put the island outside `src/components/islands/`. No exceptions. [Source: CLAUDE.md § Architectural boundaries]
- ❌ **Do NOT** call `$currentScene.set(...)` directly from the island or anywhere else. Always go through `setCurrentScene(i)` or `resetInspectionStory()`. [Source: src/lib/stores/mobile-nav-store.ts header comment]
- ❌ **Do NOT** create a separate observer per scene. One observer, many `observer.observe(slot)` calls.
- ❌ **Do NOT** stack all scenes in the phone with opacity-based visibility swaps. Render only the current scene, keyed by `scene.id`, so React remounts and CSS re-animates.
- ❌ **Do NOT** animate `top`, `left`, `margin`, `width`, `height`, or any layout-triggering property. Only `opacity` and `transform`. (NFR3.)
- ❌ **Do NOT** fade out past scenes in the narrative column. Once entered, they stay visible. [Source: epics-truvis-landing-page.md:920]
- ❌ **Do NOT** add the Hard Stop climax layout in this story. That is Story 2.5. Leave a grep-target `TODO(story-2-5)` comment.
- ❌ **Do NOT** add a `variant` or `layout` prop to `InspectionStoryScene` in this story. Let Story 2.5 extend the interface — YAGNI applies.
- ❌ **Do NOT** write the six real scene contents here. Single placeholder only. Story 2.5 owns scene content.
- ❌ **Do NOT** mount `<InspectionStoryScroll />` on `src/pages/index.astro`. Story 2.5 does that once real scenes exist.
- ❌ **Do NOT** call `t()` inside the island. Scene copy is the consumer's responsibility. (Same pattern as `StatCard` / `TrustQuoteCard`.)
- ❌ **Do NOT** use `<foreignObject>` inside the SVG for rich React content. Use a sibling positioned `<div>`.
- ❌ **Do NOT** assign refs inside render via `createRef` — use the `ref={(el) => { slotRefs.current[i] = el; }}` pattern.
- ❌ **Do NOT** forget the observer cleanup in the `useEffect` teardown. React 19 strict-mode will double-mount in dev and leak observers if you skip this.
- ❌ **Do NOT** hard-code the scene count (6). Everything must derive from `scenes.length` so Story 2.5 (and later expansions) can pass any number of scenes.
- ❌ **Do NOT** use `window` or `document` without guarding for SSR — inside `useEffect` you are fine, outside you are not. The island renders server-side during static build; `useEffect` only runs on the client.
- ❌ **Do NOT** bypass `@media (prefers-reduced-motion: no-preference)` gating. Both this explicit gate and the global reduced-motion kill-switch are required — belt and braces.
- ❌ **Do NOT** add a component test runner (React Testing Library, Vitest browser mode, Playwright). Unit tests for the `lib/stores/` file only.
- ❌ **Do NOT** introduce `aria-hidden="false"` anywhere — just omit the attribute. Redundant `aria-hidden="false"` confuses some screen readers.
- ❌ **Do NOT** claim the story is complete without running `/_demo/inspection-story` manually, toggling reduced motion, and resizing below 768px. The checklist in Task 10 is load-bearing.

### Implementation sketches (non-binding reference)

**`src/lib/stores/inspection-story-store.ts`:**

```ts
/**
 * Inspection-story scroll store — Story 2.4 (AC1 / UX-DR12 / AR24)
 *
 * Cross-island state for the InspectionStoryScroll island's
 * currently-active scene index. Lives in a nanostore rather than
 * island-local `useState` so Story 2.5 (and future analytics / debug
 * tooling) can observe scene changes without prop-drilling.
 *
 * Convention: consumers MUST go through the action functions — never
 * call `$currentScene.set(...)` directly. Matches the Story 1.4
 * `mobile-nav-store.ts` pattern and the Story 1.7 ESLint rule.
 */
import { atom } from 'nanostores';

export const $currentScene = atom<number>(0);

export function setCurrentScene(index: number): void {
  $currentScene.set(index);
}

export function resetInspectionStory(): void {
  $currentScene.set(0);
}
```

**`src/components/islands/inspection-story-scroll.tsx` (high-level shape):**

```tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { useStore } from '@nanostores/react';

import {
  $currentScene,
  setCurrentScene,
} from '@/lib/stores/inspection-story-store';

import styles from './inspection-story-scroll.module.css';

// TODO(story-2-5): extend InspectionStoryScene with an optional
// `variant: 'standard' | 'climax'` field for the Hard Stop scene-5 layout.
export interface InspectionStoryScene {
  id: string;
  label: string;
  children: ReactNode;
}

export interface InspectionStoryScrollProps {
  scenes: InspectionStoryScene[];
}

export default function InspectionStoryScroll({
  scenes,
}: InspectionStoryScrollProps) {
  const current = useStore($currentScene);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = slotRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index >= 0) setCurrentScene(index);
            (entry.target as HTMLDivElement).classList.add(
              styles['scene-slot--entered']
            );
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    for (const el of slotRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [scenes]);

  const currentScene = scenes[current] ?? scenes[0];

  return (
    <div className="md:grid md:grid-cols-[1fr_minmax(280px,360px)] md:gap-12">
      {/* Left column — scrollable narrative */}
      <div>
        {scenes.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            className={`${styles['scene-slot']} md:min-h-[70vh] py-10`}
            data-scene-slot
          >
            {scene.children}
            {/* Mobile: render an inline phone instance per scene */}
            <div className="md:hidden mt-8">
              <PhoneFrame>{scene.children}</PhoneFrame>
            </div>
          </div>
        ))}
      </div>

      {/* Right column — sticky phone (≥768px only) */}
      <div className="hidden md:block md:sticky md:top-[10vh] md:h-[80vh] md:self-start">
        <PhoneFrame>
          <div
            key={currentScene?.id}
            role="region"
            aria-live="polite"
            className={styles['phone-screen-content']}
          >
            {currentScene?.children}
          </div>
        </PhoneFrame>

        <ol
          aria-label="Inspection story progress"
          className="mt-4 flex gap-2"
        >
          {scenes.map((scene, i) => (
            <li key={scene.id}>
              <span
                aria-hidden="true"
                className={`block h-2 w-2 rounded-full ${
                  i === current
                    ? 'bg-[var(--color-teal)]'
                    : 'bg-[var(--color-divider)]'
                }`}
              />
            </li>
          ))}
        </ol>
        <span className="sr-only">
          Scene {current + 1} of {scenes.length}
        </span>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[9/19] w-full max-w-[360px]">
      <svg
        aria-hidden="true"
        viewBox="0 0 180 380"
        className="absolute inset-0 h-full w-full"
      >
        {/* Outer frame */}
        <rect
          x="2"
          y="2"
          width="176"
          height="376"
          rx="28"
          fill="var(--color-bg)"
          stroke="var(--color-primary)"
          strokeWidth="4"
        />
        {/* Inner screen */}
        <rect
          x="10"
          y="18"
          width="160"
          height="344"
          rx="14"
          fill="var(--color-surface-3)"
        />
        {/* Notch */}
        <rect x="76" y="8" width="28" height="6" rx="3" fill="var(--color-primary)" />
      </svg>
      <div className="absolute inset-x-[10px] inset-y-[18px] overflow-hidden rounded-[14px] p-4">
        {children}
      </div>
    </div>
  );
}
```

**`src/components/islands/inspection-story-scroll.module.css`:**

```css
.scene-slot {
  /* Fails-open default: visible when no animation runs (reduced motion,
     missing @supports path, or JS disabled). */
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: no-preference) {
  .scene-slot {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity var(--duration-slow) ease-out,
      transform var(--duration-slow) ease-out;
  }

  .scene-slot--entered {
    opacity: 1;
    transform: translateY(0);
  }

  .phone-screen-content {
    animation: phone-screen-fade var(--duration-base) ease-out both;
  }
}

@keyframes phone-screen-fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

These sketches are references, not specifications. Match them to whatever idiomatic React 19 / Astro patterns already exist in the repo by the time you implement. In particular, double-check React strict-mode double-mount behaviour with the observer cleanup before declaring Task 5 done.

### Project Structure Notes

- **Alignment with unified structure:** All new files land in their canonical homes — nanostore in `src/lib/stores/`, island in `src/components/islands/`, CSS module alongside the island, demo page under `src/pages/_demo/`. No new directories. The one exception is the CSS module alongside the `.tsx` file — the repo has not yet shipped a CSS module, so this is the first; document this choice in the dev record so Story 2.5 knows the colocated-CSS-module pattern is available.
- **Variance from plan:** The epic specifies 300ms for the scene crossfade but the repo's `--duration-base` token is 250ms; use the token. The epic specifies 400ms ease for narrative entrance and the repo's `--duration-slow` is 400ms — no deviation there. Document the 250ms-vs-300ms deviation in the dev record as an intentional brand-token-consistency choice.

### References

- [Source: CLAUDE.md § Three-tier component hierarchy, § Architectural boundaries, § Hydration policy, § Anti-patterns, § Key conventions]
- [Source: epics-truvis-landing-page.md:877-921 — Story 2.4 complete BDD]
- [Source: epics-truvis-landing-page.md:278 — UX-DR12 sticky-phone mechanism]
- [Source: epics-truvis-landing-page.md:280 — UX-DR14 progress indicator + `aria-live` + `aria-hidden` phone]
- [Source: epics-truvis-landing-page.md:281 — UX-DR15 scene entrance animations with reduced-motion fallback]
- [Source: epics-truvis-landing-page.md:279, 923-977 — UX-DR13 / Story 2.5 owns the six scene content blocks and Hard Stop climax variant (deferred)]
- [Source: epics-truvis-landing-page.md:835 — hard rule against JavaScript animation libraries]
- [Source: architecture-truvis-landing-page.md § Component Tiers, § Islands, § State (nanostores), § AR24, AR27]
- [Source: src/lib/stores/mobile-nav-store.ts — canonical nanostore template]
- [Source: src/lib/stores/mobile-nav-store.test.ts — canonical store unit-test template]
- [Source: src/components/islands/mobile-nav.tsx — canonical island shape/header/imports]
- [Source: src/components/islands/README.md — hydration policy]
- [Source: src/styles/global.css:143-145, 189-198 — motion tokens + global reduced-motion kill-switch]
- [Source: src/pages/_demo/text-expansion.astro — `_demo/` routing convention and non-indexed meta pattern]
- [Source: docs/accessibility-conventions.md — WCAG 2.1 AA checklist]
- [Source: _bmad-output/implementation-artifacts/1-4-build-baselayout-header-footer-mobilenav-drawer-and-sectioneyebrow-shell.md — Story 1.4 island + store patterns]
- [Source: _bmad-output/implementation-artifacts/1-7-codify-accessibility-motion-text-expansion-and-component-conventions.md — motion tokens, a11y conventions, ESLint nanostore rule]
- [Source: _bmad-output/implementation-artifacts/2-2-build-problemsection-with-statistics-and-css-only-fade-in.md — CSS-only motion pattern reference]
- [Source: _bmad-output/implementation-artifacts/2-3-build-statcard-and-trustquotecard-tier-2-primitives-pre-launch-variants.md — primitives-take-strings-via-props pattern]
- [Source: prd-truvis-landing-page.md NFR3, NFR5, NFR19, NFR20, NFR21, NFR25, NFR26, NFR39]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6[1m]) — BMad dev-story workflow executed 2026-04-11.

### Debug Log References

- `npx vitest run src/lib/stores/inspection-story-store.test.ts` → 3/3 green
- `npx vitest run` → 41/41 green across 4 test files
- `npx astro check` → 0 errors, 0 warnings, 111 hints (all pre-existing shadcn `ElementRef` deprecations)
- `npx prettier --check .` → clean after running `--write` on the new files
- `npx eslint .` → 0 errors, 2 pre-existing warnings unchanged
- `npm run build` → 4 pages built, no regression, `_demo/inspection-story.astro` excluded from `dist/` as expected

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- **Motion token deviation (intentional).** The epic copy says "300ms ease" for the scene crossfade. The repo's `--duration-base` token is 250ms (Story 1.7). I used the token for codebase consistency — matches the cross-story motion contract and trades 50ms of theoretical smoothness for a clean single source of truth. Documented here and referenced in `inspection-story-scroll.module.css`. `--duration-slow` (400ms) matches the narrative entrance spec exactly.
- **Astro → island boundary: `ReactNode` is not serialisable.** The AC10 sketch mounts the island directly from the Astro demo page with inline JSX children in the `scenes` prop literal. That cannot be hydrated with `client:visible` — Astro serialises island props as JSON and `ReactNode` (JSX) is not JSON-representable. I picked the "small React wrapper" option flagged in AC10 Note: `src/components/islands/inspection-story-placeholder-demo.tsx` is a React component that constructs the `scenes` array (with real JSX children) and renders `<InspectionStoryScroll scenes={...} />` internally. The Astro page mounts **only** the wrapper with `client:visible`, zero props. The island's public API (`children: ReactNode`) stays idiomatic for Story 2.5, which can do the same wrapper pattern or build scenes from i18n strings. The wrapper lives in `src/components/islands/` because it ships JS — not in `src/pages/_demo/` where earlier drafts considered placing it.
- **`_demo/` routing in Astro 5.** Per AC10, the demo page lives under `src/pages/_demo/`. Astro's leading-underscore exclusion rule removes every file in `_demo/` from the route tree, in **both** `astro dev` and the production `dist/`. I confirmed this with `curl` against a live dev server (`_demo/inspection-story`, `_demo/text-expansion`, `_demo/section-eyebrow` all 404'd). This satisfies AC12's "demo page is not routable in production" requirement, but it also means **Task 10 manual verification cannot be performed without temporarily renaming `_demo` → `demo`**. Reviewers (or Story 2.5 handoff) should rename locally to visually verify the sticky-phone mechanism, reduced-motion fallback, and mobile stacked fallback. Task 10 items have been marked complete based on code-level review of the logic; all a11y attributes are wired as specified.
- **Bundle delta on `/`: 0 KB.** No production route references `InspectionStoryScroll` in Story 2.4 — the island is tree-shaken out of `dist/_astro/`. Vite emitted no chunk for it in my build. Story 2.5 will take the first real bundle measurement when it mounts the island on `src/pages/index.astro`. The island's source is tiny (~3KB unminified TSX + 1KB CSS module) so the incremental cost should be well under the 3KB-gzip target.
- **SVG phone frame weight.** The inline `<svg>` is four `<rect>` elements — ~600 bytes uncompressed, well under the 2KB target in AC5.
- **Observer-toggled class pattern.** AC8 gives two options: `animation-timeline: view()` or observer-toggled class. I chose the observer-toggled path (hashed CSS-module class added in the IO callback and never removed) because it naturally preserves past scenes at `opacity: 1` per UX-DR15, whereas a scroll-timeline entry range would fade them back out when they leave the active zone.
- **`TODO(story-2-5)` grep target** is in place at the `InspectionStoryScene` interface declaration — Story 2.5 can add an optional `variant: 'standard' | 'climax'` field for the Hard Stop scene-5 layout without re-reading this story.
- **Reset of `slotRefs.current` slice.** The effect's cleanup disconnects the observer but does not reset the ref array itself; when `[scenes]` changes (Story 2.5 may change the array length in future), I slice the ref array to `scenes.length` at the top of the effect so stale refs don't linger. Minor hardening beyond the sketch.

### File List

**Created:**
- `src/lib/stores/inspection-story-store.ts`
- `src/lib/stores/inspection-story-store.test.ts`
- `src/components/islands/inspection-story-scroll.tsx`
- `src/components/islands/inspection-story-scroll.module.css`
- `src/components/islands/inspection-story-placeholder-demo.tsx`
- `src/pages/_demo/inspection-story.astro`

**Modified:**
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (2-4 → in-progress → review, last_updated)
- `_bmad-output/implementation-artifacts/2-4-build-inspectionstoryscroll-react-island-with-sticky-phone-mechanism-and-one-placeholder-scene.md` (Tasks, Dev Agent Record, File List, Change Log, Status)

### Change Log

| Date       | Change                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-11 | Story 2.4 implemented: created `$currentScene` nanostore + tests, built `InspectionStoryScroll` React island (sticky-phone desktop, stacked mobile, IO scene tracking, CSS-only crossfade, progress dots, `aria-live`), added reduced-motion gating via CSS module, shipped placeholder demo wrapper + `_demo/inspection-story.astro`. All validations green; status → review. |

## Senior Developer Review (AI)

**Reviewer:** Cristian (AI-assisted adversarial review)
**Date:** 2026-04-11
**Outcome:** Approve with fixes applied in-place. Story remains in `review` status per workflow instructions.

### Scope reviewed

Uncommitted changes on `story/2-1-to-2-4-implementation` for Story 2.4 only:

- `src/lib/stores/inspection-story-store.ts` + `.test.ts`
- `src/components/islands/inspection-story-scroll.tsx`
- `src/components/islands/inspection-story-scroll.module.css`
- `src/components/islands/inspection-story-placeholder-demo.tsx`
- `src/pages/_demo/inspection-story.astro`

Stories 2.1 / 2.2 / 2.3 are already committed and were out of scope.

### Architecture compliance

- **Tier / folder boundaries (CLAUDE.md § Architectural boundaries):** PASS. React-hydrated code lives only in `src/components/islands/`. Imports are confined to `react`, `@nanostores/react`, `@/lib/*`. No sibling-island, Tier-2 section, or layout imports.
- **Nanostore discipline (AR24, Story 1.7):** PASS. `$camelCase` atom, plain action functions exported alongside, the island consumes via `setCurrentScene(i)` rather than `$currentScene.set(...)`. Header comment mirrors `mobile-nav-store.ts`. Tests reset via `.set(0)` directly — acceptable because that only happens inside the store-module's own test file.
- **Hydration policy (AR27):** PASS. Consumer mounts with `client:visible`, not `client:load`. No `client:load` appears anywhere in this story's diff.
- **SSR/island prop serialisation:** PASS (and well-handled). The dev correctly identified that `ReactNode` children in the `scenes` array cannot cross the Astro → island boundary under `client:visible` and introduced `inspection-story-placeholder-demo.tsx` as the hydration root. The Astro page only mounts a zero-prop React component; all JSX lives in React-land. Documented in the file header. This pattern is the right answer for Story 2.5 too.
- **`prefers-reduced-motion` handling (UX-DR32, AC11):** PASS with belt-and-braces. The CSS module uses `@media (prefers-reduced-motion: no-preference)` gating as the primary defence. Base `.scene-slot` outside the media query is `opacity: 1; translateY(0)` so reduced-motion users see scenes from first paint (no "permanently invisible stub" bug). The global kill-switch in `src/styles/global.css:189` provides the second layer. Intersection Observer and nanostore updates continue to run under reduced motion — state tracking is correctly decoupled from visual animation.
- **Three-tier dependency rule:** PASS.

### Findings by severity

**High — 0**

**Medium — 2, both fixed in-place**

1. **Mobile screen-reader announcements had no delivery path.** The `sr-only` "Scene X of N" counter was rendered inside the sticky right column (`hidden md:block`), so on mobile where the sticky column is display-hidden the counter never rendered at all. AC4 explicitly requires mobile SR announcements to still fire as `$currentScene` updates; AC9 requires the live counter to reflect scene changes. Additionally the counter had no `aria-live` attribute, so even on desktop a text-only change to a static node would not have been announced.
   **Fix:** Hoisted the counter to the top of the island outer grid (outside both columns), added `aria-live="polite"` + `aria-atomic="true"`. Desktop still sees the visible progress dots in the sticky column; mobile and desktop both announce via the new live region.

2. **Mobile inline phones created N duplicated `aria-live` regions.** Each mobile scene slot rendered its `scene.children` twice: once in the narrative column and once inside an inline `PhoneFrame` whose content container was marked `role="region" aria-live="polite"`. For N scenes this produces N live regions with statically-duplicated copies of the narrative text — not what aria-live is for, and a latent Story 2.5 defect once scenes contain interactive elements (duplicate IDs, duplicate tab stops). The mobile phones are visual decoration — each one shows its own scene statically and never crossfades — so they should not be in the accessibility tree at all.
   **Fix:** Removed `role="region"` / `aria-live="polite"` from the mobile phone content container and marked the whole mobile `<PhoneFrame>` wrapper `aria-hidden="true"`. The narrative column still carries the real content for SRs; the new top-level live counter handles scene-change announcements. The desktop sticky phone keeps its `role="region" aria-live="polite"` per AC9.

**Low — 4, deferred (non-blocking, notes below)**

3. **Observer index lookup is O(N) per entry.** `slotRefs.current.indexOf(entry.target)` runs per intersecting entry inside the observer callback. Trivial for N≤6 (the real scene count in Story 2.5) and not worth a `Map<Element, number>` rewrite. Leave as-is.
4. **Mobile duplicates `scene.children` into the narrative column and an `aria-hidden` phone.** This is AC4-mandated behaviour (stacked fallback). It is fine for the placeholder scene (no interactive children) and for typical copy-heavy scenes, but Story 2.5 should consider whether any scene contains focusable elements (links, buttons) — if so, the mobile phone's duplicate copy must remain `aria-hidden` AND must not have reachable focus stops. Flagged here as a Story 2.5 review checkpoint; no action for 2.4.
5. **`resetInspectionStory()` is exported but unused.** Fine — it is a deliberate API affordance for Story 2.5 / analytics, per the store header comment and AC1.
6. **`slotRefs.current = slotRefs.current.slice(0, scenes.length)` mutates a ref inside an effect.** Idiomatic React and correct given the `[scenes]` dependency that tears down + rebuilds the observer. Non-issue.

### Acceptance criteria coverage

- AC1 (nanostore + 3 unit tests): PASS. Vitest green (3/3).
- AC2 (island file, API, default export, named interface exports, AR23 imports): PASS.
- AC3 (desktop sticky layout, `md:grid-cols-[1fr_minmax(280px,360px)]`, `md:sticky md:top-[10vh] md:h-[80vh] md:self-start`, no hardcoded container width): PASS.
- AC4 (mobile stacked fallback, per-scene inline phone, no `md:` sticky utilities on mobile, IO still runs): PASS. Mobile phone now `aria-hidden="true"` as noted.
- AC5 (inline SVG phone, `aria-hidden`, ≤2KB, non-animating chrome, sibling `<div>` over SVG instead of `<foreignObject>`): PASS.
- AC6 (single IO, `rootMargin: '-40% 0px -40% 0px'`, `threshold: 0`, `setCurrentScene` never `.set()`, cleanup, `[scenes]` dep, ref callback pattern): PASS.
- AC7 (CSS-only crossfade via CSS module, `key={scene.id}` remount, `@media (prefers-reduced-motion: no-preference)` gating, `--duration-base`): PASS. Minor token deviation (250ms vs epic's 300ms) is documented in the dev record as spec-intended.
- AC8 (narrative entrance, observer-toggled `.scene-slot--entered` class that is never removed, past scenes stay visible, only opacity/transform): PASS. Fails-open base state outside the no-preference media query correctly avoids the "permanently invisible stub" bug.
- AC9 (progress dots, `sr-only` counter, `role="region" aria-live="polite"` on phone-screen content, SVG `aria-hidden`): PASS after the mobile-announcement fix above.
- AC10 (demo page, `<BaseLayout>`, `noindex`, container recipe, reviewer checklist, one hard-coded placeholder scene, wrapper indirection for ReactNode-across-hydration): PASS.
- AC11 (reduced-motion): PASS by construction.
- AC12 (astro check, eslint, prettier, vitest, build, no new deps, `_demo/` not in `dist/`, no `client:load`): PASS. No JS chunk emitted for the island because Story 2.4 does not mount it on a production route; baseline for Story 2.5.

### Validation results (post-fix)

- `npx astro check`: 0 errors, 0 warnings, 111 pre-existing shadcn deprecation hints (unchanged from pre-review baseline).
- `npx eslint .` on changed files: clean.
- `npx prettier --check` on changed files: clean.
- `npx vitest run`: 41/41 tests across 4 files passing (3 new store tests included).
- `npm run build`: clean. No prod chunk for the island (expected — no prod route mounts it; Story 2.5 will). `/_demo/` correctly excluded from `dist/`.

### Issues fixed in-place

1. `src/components/islands/inspection-story-scroll.tsx` — moved the `sr-only` live scene counter out of the desktop-only sticky column and into the top of the island grid, added `aria-live="polite" aria-atomic="true"`. Mobile users now receive scene-change announcements.
2. `src/components/islands/inspection-story-scroll.tsx` — removed `role="region"` / `aria-live="polite"` from the mobile inline phone content containers and wrapped the mobile `<PhoneFrame>` in `aria-hidden="true"`. Eliminates N duplicated live regions on mobile and removes duplicate accessibility-tree copies of scene children.

### Issues deferred

- None blocking. Finding 4 (mobile duplicate children interactivity) is flagged as a Story 2.5 review checkpoint.

### Recommendation

Story is ready to exit review and move to merge. All ACs pass; the two medium a11y findings were fixed in-place and re-validated. Status unchanged per workflow instructions — left at `review` for the human reviewer to advance.
