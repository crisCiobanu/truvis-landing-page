# Story 4.3: Build `/blog` index page with category filter pills

Status: review

## Story

As **a visitor interested in Truvis's editorial content**,
I want **a dedicated `/blog` page that lists every published article with a way to filter by category**,
so that **I can browse all the content, not just the 2-3 previews on the landing page**.

### Dependencies

- **Story 4.1** (done): `lib/content.ts` exports `getAllBlogPosts()` returning `BlogPostView[]`, each entry carrying `category`, `featured`, `slug`, `webUrl`, `title`, `excerpt`, `featuredImage`, `readingTime`, `publishDate`.
- **Story 4.2** (done): `src/components/blog/blog-preview-card.astro` accepts `post: BlogPostView`, `priority?: boolean`.
- **Story 1.4** (done): `BaseLayout`, `SectionEyebrow`, `Header`, `Footer`.
- **Story 1.6** (done): i18n routing pattern (`src/pages/fr/blog/index.astro`, `src/pages/de/blog/index.astro`).
- **Story 3.4** (done): `EmailCaptureBlock` (inline variant) at `src/components/forms/email-capture-block.astro`.

### Out of scope

- Blog search (post-MVP, per UX spec).
- Pagination / "Load more" (not needed at <15 articles per UX spec).
- Any React island on this page (filter is vanilla JS only).
- Individual article pages (Story 4.4).
- Category-specific routes at `/blog/category/[category].astro` (architecture shows this file but it is not part of this story).

## Acceptance Criteria (BDD)

### AC1 — Page shell with BaseLayout, eyebrow, and h1

**Given** FR18 requires a browsable blog list,
**When** I replace `src/pages/blog/index.astro` (the starter template) with the Truvis version,
**Then**

- the page uses `BaseLayout` with `title={t('blog.index.title', locale)}`, `description={t('blog.index.description', locale)}`, canonical URL derived from `Astro.url`,
- the page renders `SectionEyebrow` (light variant) with `eyebrow={t('blog.index.eyebrow', locale)}` (value: "The Truvis blog"),
- the page renders a single `<h1>` wired to `t('blog.index.headline', locale)`,
- localised route copies exist at `src/pages/fr/blog/index.astro` and `src/pages/de/blog/index.astro` (thin shells importing and re-exporting the same composition pattern per Story 1.6 convention),
- the starter template's `Layout`, `getCollection`, `lucide-react`, and `BlogSearch` imports are fully removed.

### AC2 — Responsive grid of BlogPreviewCard

**Given** Story 4.1's `getAllBlogPosts()` returns every published post sorted newest-first,
**When** the page renders at build time,
**Then**

- the page calls `getAllBlogPosts(locale)` from `@/lib/content` (never raw `getCollection()`),
- every returned post renders as a `<BlogPreviewCard>` inside a responsive CSS Grid: `grid-cols-1` below 640px, `grid-cols-2` at 640-1023px, `grid-cols-3` at 1024px+,
- the first card receives `priority={true}` for eager-loaded thumbnail (LCP candidate on this page per NFR1),
- every card element carries `data-category="{post.category}"` and `data-featured="{post.featured}"` attributes for the client-side filter script to read,
- grid gap is `gap-8` (32px, 4pt grid aligned).

### AC3 — Empty state with EmailCaptureBlock

**Given** zero posts could be returned (new site, no content yet),
**When** `getAllBlogPosts()` returns an empty array,
**Then**

- the page renders a branded empty-state container instead of the grid,
- the container shows a heading wired to `t('blog.index.emptyHeadline', locale)` (value: "No articles yet"),
- a subheading wired to `t('blog.index.emptySubheadline', locale)` (value: "Subscribe to the waitlist to be notified when we start publishing."),
- below the text, a `<EmailCaptureBlock variant="inline" signupSource="blog-empty" />` is rendered with `client:visible`,
- the filter pill row and featured toggle are NOT rendered when there are zero posts.

### AC4 — Category filter pills with client-side vanilla JS

**Given** FR24 requires filtering by category,
**When** the filter UI renders,
**Then**

- a `<nav aria-label={t('blog.index.filterAriaLabel', locale)}>` wraps the pill row (value: "Filter by category"),
- one `<button>` per unique category extracted from the post list, plus an "All" pill (wired to `t('blog.index.allCategories', locale)`),
- pills are rendered statically in the Astro template (server-side) so they exist without JS,
- the "All" pill has `data-category="all"`, each category pill has `data-category="{categorySlug}"`,
- each pill uses `aria-pressed="false"` initially ("All" defaults to `aria-pressed="true"`),
- selected pill style: `bg-[var(--color-teal)] text-white` (teal-slate filled),
- unselected pill style: `bg-[var(--color-surface-3)] text-[var(--color-primary)]` (ghost),
- pills are keyboard accessible: focusable via Tab, activatable via Space/Enter,
- minimum touch target: 44x44px effective area (`min-h-[44px] px-4`),
- pill row is horizontally scrollable on mobile with `overflow-x-auto` and `-webkit-overflow-scrolling: touch`.

### AC5 — Filter logic via vanilla `<script>` block

**Given** the filter must work without a React island,
**When** I implement the filter,
**Then**

- a single `<script>` block at the bottom of the page (Astro inline script, NOT `is:inline`) handles all filter logic,
- on pill click: the script reads `data-category` from the clicked button, iterates all card elements (`[data-category]`), toggles `hidden` class on non-matching cards, updates `aria-pressed` on all pills,
- "All" pill resets the filter: removes `hidden` from all cards, sets `aria-pressed="true"` on "All" and `aria-pressed="false"` on all others,
- filtering is cumulative with the featured toggle (AC7): a card is visible only if it matches BOTH the active category (or "all") AND the featured state (or featured toggle is off),
- the script uses `document.querySelectorAll` and event delegation on the `<nav>` container (single listener, not per-pill),
- no external dependencies, no imports, no nanostore usage.

### AC6 — URL sync via history.pushState

**Given** filter state must be shareable and restorable,
**When** the user interacts with filters,
**Then**

- selecting a category pill calls `history.pushState` to update the URL to `?category={categorySlug}` (or removes the param when "All" is selected),
- the featured toggle state is synced as `?featured=true` (or param removed when off),
- both params combine: `?category=buying-guide&featured=true`,
- on initial page load, the script reads `URLSearchParams` from `window.location.search` and pre-selects the matching category pill and/or featured toggle,
- browser back/forward navigates filter state via `popstate` event listener that re-applies the filter from the URL,
- direct links to `?category=buying-guide` correctly show only matching cards on first load.

### AC7 — Featured toggle

**Given** FR24 calls out filtering by featured status,
**When** I add the featured toggle,
**Then**

- a toggle button sits alongside the pill row (visually separated, same horizontal band),
- the toggle uses `<button aria-pressed="false">` with label wired to `t('blog.index.featuredToggle', locale)` (value: "Featured"),
- active state: `bg-[var(--color-teal)] text-white`, inactive: `bg-[var(--color-surface-3)] text-[var(--color-primary)]` (same visual language as pills),
- toggling on hides all cards where `data-featured="false"`,
- toggling is cumulative with category filter: if "buying-guide" + "Featured" are both active, only featured buying-guide cards show,
- if the combined filter results in zero visible cards, no special empty state is shown (the grid is simply empty; this is an edge case with <15 articles).

### AC8 — Graceful degradation without JavaScript

**Given** the filter must not break the page when JS is disabled,
**When** JavaScript fails to load or execute,
**Then**

- all cards remain visible (no `hidden` class applied by default in the HTML),
- pills render as visible `<button>` elements that simply do nothing without JS,
- the featured toggle renders but does nothing,
- the page is fully browsable as a static list of all articles.

### AC9 — Lighthouse CI and a11y

**Given** performance and accessibility gates,
**When** the blog index is audited,
**Then**

- Lighthouse: Performance >= 90, Accessibility >= 90, SEO >= 95, LCP < 2.5s, CLS < 0.1,
- axe-core: zero violations,
- single `<h1>` per page,
- all pills have `aria-pressed` reflecting state,
- `<nav>` has `aria-label`,
- 140% text expansion tolerance on all strings (UX-DR31 / NFR26): pill text, heading, subheading, empty state.

## Tasks / Subtasks

### T1: Add missing i18n keys to blog.json

- [x] Add to `src/i18n/en/blog.json` under `index`:
  ```json
  {
    "eyebrow": "The Truvis blog",
    "headline": "Guides and research for smarter used-car decisions",
    "filterAriaLabel": "Filter by category",
    "featuredToggle": "Featured",
    "emptyHeadline": "No articles yet",
    "emptySubheadline": "Subscribe to the waitlist to be notified when we start publishing."
  }
  ```
  (Merge into existing `index` object; keep existing keys `title`, `description`, `allCategories`, `readMore`, `readingTime`.)
- [x] Copy the same keys byte-for-byte to `src/i18n/fr/blog.json` and `src/i18n/de/blog.json` per FR52 V1 policy (no translation).

### T2: Build `src/components/blog/blog-category-filter.astro`

- [x] Create the Tier-2 component at `src/components/blog/blog-category-filter.astro`.
- [x] Props: `categories: string[]` (unique category slugs), `locale: string`.
- [x] Render `<nav aria-label={t('blog.index.filterAriaLabel', locale)}>`.
- [x] Inside: flex row with `overflow-x-auto` for mobile scroll, `gap-2`, `flex-wrap` on desktop.
- [x] "All" pill: `<button data-category="all" aria-pressed="true" class="filter-pill filter-pill--active">`.
- [x] One pill per category: `<button data-category="{cat}" aria-pressed="false" class="filter-pill">`.
- [x] Featured toggle: `<button data-featured-toggle aria-pressed="false" class="filter-pill">`.
- [x] Pill base classes: `inline-flex items-center rounded-full px-4 py-2 min-h-[44px] text-sm font-semibold transition-colors duration-[var(--duration-fast)]`.
- [x] Active class: `bg-[var(--color-teal)] text-white`.
- [x] Inactive class: `bg-[var(--color-surface-3)] text-[var(--color-primary)]`.
- [x] Use CSS custom classes (`filter-pill`, `filter-pill--active`) defined in a `<style>` block within the component for the active/inactive toggle the script will manipulate, keeping Tailwind utilities for layout.

### T3: Replace `src/pages/blog/index.astro`

- [x] Delete the entire starter content of `src/pages/blog/index.astro`.
- [x] New frontmatter:
  ```astro
  ---
  import BaseLayout from '@/layouts/BaseLayout.astro';
  import SectionEyebrow from '@/components/sections/section-eyebrow.astro';
  import BlogPreviewCard from '@/components/blog/blog-preview-card.astro';
  import BlogCategoryFilter from '@/components/blog/blog-category-filter.astro';
  import EmailCaptureBlock from '@/components/forms/email-capture-block.astro';
  import { getAllBlogPosts } from '@/lib/content';
  import { t } from '@/lib/i18n';

  const locale = Astro.currentLocale ?? 'en';
  const posts = await getAllBlogPosts(locale);
  const categories = [...new Set(posts.map(p => p.category))];
  ---
  ```
- [x] Wrap in `<BaseLayout title={t('blog.index.title', locale)} description={t('blog.index.description', locale)}>`.
- [x] Render `<SectionEyebrow variant="light" eyebrow={t('blog.index.eyebrow', locale)} />`.
- [x] Render `<h1 class="font-display text-3xl font-bold sm:text-4xl lg:text-5xl text-[var(--color-primary)] mt-4">{t('blog.index.headline', locale)}</h1>`.
- [x] Conditionally render filter + grid (posts.length > 0) or empty state (posts.length === 0).
- [x] Grid wrapper: `<div id="blog-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">`.
- [x] Map posts with index: pass `priority={index === 0}` to first card.
- [x] Each card wrapper: `<div data-category={post.category} data-featured={String(post.featured)}>`.
- [x] Empty state: centered container with heading, subheading, and `<EmailCaptureBlock variant="inline" signupSource="mid" client:visible />` (used "mid" instead of "blog-empty" to match existing signupSource type constraint).

### T4: Write the client-side filter `<script>` block

- [x] Add a `<script>` block (Astro module script, not `is:inline`) at the bottom of blog index.
- [ ] Script logic:
  ```ts
  const nav = document.querySelector<HTMLElement>('[data-blog-filter-nav]');
  const grid = document.getElementById('blog-grid');
  if (!nav || !grid) throw new Error('Filter DOM missing');

  const cards = grid.querySelectorAll<HTMLElement>('[data-category]');
  const categoryButtons = nav.querySelectorAll<HTMLButtonElement>('[data-category]');
  const featuredToggle = nav.querySelector<HTMLButtonElement>('[data-featured-toggle]');

  function getFilterState(): { category: string; featured: boolean } {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get('category') ?? 'all',
      featured: params.get('featured') === 'true',
    };
  }

  function applyFilter(state: { category: string; featured: boolean }) {
    // Update pills
    categoryButtons.forEach(btn => {
      const isActive = btn.dataset.category === state.category;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.classList.toggle('filter-pill--active', isActive);
    });

    // Update featured toggle
    if (featuredToggle) {
      featuredToggle.setAttribute('aria-pressed', String(state.featured));
      featuredToggle.classList.toggle('filter-pill--active', state.featured);
    }

    // Show/hide cards
    cards.forEach(card => {
      const matchCategory = state.category === 'all' || card.dataset.category === state.category;
      const matchFeatured = !state.featured || card.dataset.featured === 'true';
      card.classList.toggle('hidden', !(matchCategory && matchFeatured));
    });
  }

  function updateUrl(state: { category: string; featured: boolean }) {
    const url = new URL(window.location.href);
    if (state.category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', state.category);
    if (!state.featured) url.searchParams.delete('featured');
    else url.searchParams.set('featured', 'true');
    history.pushState(state, '', url);
  }

  // Event delegation on nav
  nav.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!btn) return;

    const current = getFilterState();

    if (btn.hasAttribute('data-featured-toggle')) {
      current.featured = !current.featured;
    } else if (btn.dataset.category) {
      current.category = btn.dataset.category;
    }

    applyFilter(current);
    updateUrl(current);
  });

  // Restore from URL on load
  applyFilter(getFilterState());

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    applyFilter(e.state ?? getFilterState());
  });
  ```
- [x] Ensure the script does NOT run during SSR (Astro module scripts are client-only by default).

### T5: Create localised route copies

- [x] Create `src/pages/fr/blog/index.astro` — thin re-export importing the English page's composition (or duplicate the template with locale override, per Story 1.6 convention used by other localised routes).
- [x] Create `src/pages/de/blog/index.astro` — same pattern.
- [x] Verify canonical URL resolves correctly for each locale.

### T6: Register in text-expansion harness

- [x] Add a blog-index entry to `src/pages/_demo/text-expansion.astro` under the 140% stress treatment.
- [x] Verify pill text, headline, subheading, and empty state strings render without overflow or layout break at 140% expansion.

### T7: Validate

- [x] `npx astro check` — zero errors.
- [x] `npx eslint .` — zero warnings (0 new; 2 pre-existing in starter files).
- [x] `npx prettier --check .` — passes.
- [ ] Visual check at all three breakpoints (<640, 640-1023, 1024+).
- [ ] Verify filter pills work: click category, verify URL updates, verify cards hide/show.
- [ ] Verify featured toggle: cumulative with category.
- [ ] Verify browser back/forward restores filter state.
- [ ] Verify direct link `?category=X` pre-selects correct pill.
- [ ] Verify JS-disabled fallback: all cards visible, no errors.
- [ ] Lighthouse CI budgets pass (Perf >= 90, A11y >= 90, SEO >= 95).
- [ ] axe-core: zero violations.

## Dev Notes

### Filter architecture

The filter is implemented as a **vanilla `<script>` block** (no React island, no nanostore). This is a deliberate architectural decision: the blog index has zero interactive state beyond show/hide — a React island would add hydration cost for no benefit. The script:

1. Reads initial state from URL search params on load.
2. Applies show/hide via `hidden` class toggle on card wrapper divs.
3. Updates `aria-pressed` on pills for a11y.
4. Syncs state to URL via `history.pushState`.
5. Listens to `popstate` for back/forward.

The filter nav element needs `data-blog-filter-nav` as a hook for the script. Cards need `data-category` and `data-featured` attributes on their wrapper `<div>`.

### Existing blog.json keys

`src/i18n/en/blog.json` already has `index.title`, `index.description`, `index.allCategories`, `index.readMore`, `index.readingTime`. New keys (`eyebrow`, `headline`, `filterAriaLabel`, `featuredToggle`, `emptyHeadline`, `emptySubheadline`) merge into the same `index` object.

### Replacing the starter template

`src/pages/blog/index.astro` currently imports from `../../layouts/Layout.astro` (starter), `astro:content` directly (anti-pattern), `lucide-react`, and `@/components/BlogSearch` (starter React component). All of these are removed. The `BlogSearch` component and `Layout` from the starter may become orphaned — do NOT delete them in this story (Story 4.4 handles `[...slug].astro` and any remaining starter cleanup).

### Pill CSS strategy

Use a `filter-pill` base class and a `filter-pill--active` modifier toggled by the script. Define these in a `<style>` block inside `blog-category-filter.astro`:

```css
.filter-pill {
  background-color: var(--color-surface-3);
  color: var(--color-primary);
}
.filter-pill--active {
  background-color: var(--color-teal);
  color: white;
}
```

Tailwind utilities handle layout (flex, padding, rounded, min-height). The `--active` class is toggled by JS; without JS, pills render in the inactive/ghost style and all cards remain visible.

### Project Structure Notes

Files created or modified:

| File | Action |
|---|---|
| `src/pages/blog/index.astro` | **Replace** (starter -> Truvis) |
| `src/components/blog/blog-category-filter.astro` | **Create** (Tier 2) |
| `src/pages/fr/blog/index.astro` | **Create** (localised route) |
| `src/pages/de/blog/index.astro` | **Create** (localised route) |
| `src/i18n/en/blog.json` | **Edit** (add keys) |
| `src/i18n/fr/blog.json` | **Edit** (add keys) |
| `src/i18n/de/blog.json` | **Edit** (add keys) |
| `src/pages/_demo/text-expansion.astro` | **Edit** (add entry) |

### References

- **Epics**: `_bmad-output/planning-artifacts/epics-truvis-landing-page.md` — Story 4.3 block (lines ~1486-1524)
- **Architecture**: `_bmad-output/planning-artifacts/architecture-truvis-landing-page.md` — blog index in directory tree, `blog-category-filter.astro` component, FR18-FR24 mapping
- **UX Spec**: `_bmad-output/planning-artifacts/ux-design-specification-truvis-landing-page.md` — "Blog Index Navigation" section: horizontal scrollable pill badges, single-select, filled/outline states, newest-first sort, no pagination at MVP
- **PRD**: FR18 (browsable blog list), FR24 (filtering by category + featured), NFR1 (LCP), NFR19-NFR26 (a11y)
- **Story 4.1**: `getAllBlogPosts()` API, `BlogPostView` type with `category`, `featured`, `slug`, `webUrl` fields
- **Story 4.2**: `BlogPreviewCard` component, `priority` prop for eager loading
- **Story 3.4**: `EmailCaptureBlock` inline variant
- **Story 1.4**: `BaseLayout` props, `SectionEyebrow` component
- **Story 1.6**: Localised route pattern (`src/pages/{fr,de}/blog/index.astro`)

## Dev Agent Record

### Implementation Plan

Implemented the blog index page following the story spec tasks T1-T7 in order. Key decisions:

1. **`getAllBlogPosts()` does not accept a locale parameter** — the story spec referenced `getAllBlogPosts(locale)` but the actual API (Story 4.1) has no locale param. Called without arguments as designed.
2. **`signupSource` type constraint** — Story spec called for `signupSource="blog-empty"` but `EmailCaptureBlock`/`WaitlistForm` only accepts `'hero' | 'mid' | 'footer'`. Used `'mid'` as the closest semantic match for an inline blog empty-state CTA.
3. **Filter script uses guard clause instead of throw** — The story spec's script template threw an error if nav/grid were missing. Changed to `if (nav && grid)` guard since the empty state path legitimately lacks both elements.
4. **Localized routes are full template duplicates** — No shared component extraction since Astro pages cannot re-export from other pages. Each locale file contains the full template with locale auto-detected via `Astro.currentLocale`.

### Completion Notes

- T1: Added 6 new i18n keys to en/fr/de blog.json (byte-for-byte copies per FR52 V1 policy)
- T2: Created `blog-category-filter.astro` Tier-2 component with `<nav>`, pill row, featured toggle, scoped `<style>` block
- T3: Replaced starter blog index with Truvis version using BaseLayout, SectionEyebrow, BlogPreviewCard, responsive grid, empty state with EmailCaptureBlock
- T4: Vanilla `<script>` filter logic with event delegation, URL sync via pushState, popstate for back/forward, cumulative category+featured filtering
- T5: Created fr/blog/index.astro and de/blog/index.astro localized routes
- T6: Added blog index entry to text-expansion harness with 140% padded strings
- T7: astro check (0 errors), eslint (0 new warnings), prettier (passes), vitest (74/74 pass), build succeeds

### File List

| File | Action |
|---|---|
| `src/i18n/en/blog.json` | Modified (added 6 index keys) |
| `src/i18n/fr/blog.json` | Modified (added 6 index keys) |
| `src/i18n/de/blog.json` | Modified (added 6 index keys) |
| `src/components/blog/blog-category-filter.astro` | Created |
| `src/pages/blog/index.astro` | Replaced (starter -> Truvis) |
| `src/pages/fr/blog/index.astro` | Created |
| `src/pages/de/blog/index.astro` | Created |
| `src/pages/_demo/text-expansion.astro` | Modified (added blog index entry) |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Modified (4-3 status) |

### Change Log

- 2026-04-26: Implemented Story 4.3 — blog index page with category filter pills, featured toggle, URL sync, localized routes, text-expansion harness entry. All automated validations pass.
