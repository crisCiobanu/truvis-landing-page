# Story 4.5: Build related-articles navigation and social share buttons on the article page

Status: review

## Story

As **a visitor who just finished reading an article**,
I want **to see related articles I might enjoy next, and share this one to WhatsApp, Twitter/X, or via a copied link**,
so that **I can keep reading or pass it to a friend who is car shopping**.

## Acceptance Criteria (BDD)

### AC1 — Related-articles strip renders up to three posts from `getRelatedBlogPosts()`

**Given** FR20 requires navigation to related blog articles,
**When** the article page from Story 4.4 is built,
**Then**

- the page calls `getRelatedBlogPosts(slug, 3)` from `lib/content.ts` (Story 4.1) at build time,
- the function returns up to 3 posts: first by `relatedSlugs`, then same-category backfill, then recent backfill,
- the strip is rendered via `src/components/blog/blog-related-posts.astro` as a `SectionEyebrow` with eyebrow text from `t('blog.article.keepReading', locale)` + a three-column grid of `BlogPreviewCard` instances,
- grid is 3 columns at `>=1024px`, 2 columns at `>=640px`, 1 column below `640px`,
- the strip is positioned after the share buttons and before the inline CTA placeholder slot for Story 4.6,
- if the related list is empty (only one article exists), the entire strip is not rendered — no empty-state placeholder.

### AC2 — Share block with headline and three share buttons

**Given** FR21 requires sharing via social media or direct link,
**When** the article page renders,
**Then**

- a share block appears at the end of the article body, above the related-articles strip,
- the block displays a headline from `t('blog.article.shareHeadline', locale)` (EN: "Found this useful? Share it."),
- three buttons render inline: WhatsApp, Twitter/X, and "Copy link",
- each button displays a brand icon (inline SVG, <=1KB) and a visible text label,
- the block is mounted via `src/components/blog/blog-share-buttons.astro` which embeds the React island.

### AC3 — Share URL construction

**Given** share buttons need correctly encoded URLs,
**When** a user clicks WhatsApp,
**Then** the button opens `https://wa.me/?text={encodedTitle}%20{encodedUrl}` in a new tab,

**When** a user clicks Twitter/X,
**Then** the button opens `https://twitter.com/intent/tweet?text={encodedTitle}&url={encodedUrl}` with `&via={handle}` appended only if `PUBLIC_TRUVIS_TWITTER_HANDLE` is non-empty,

**When** a user clicks "Copy link",
**Then** `navigator.clipboard.writeText(postUrl)` copies the post's absolute URL, the button label transitions to "Copied!" for ~2 seconds, then reverts to "Copy link".

### AC4 — React island for share buttons with `client:visible`

**Given** the Copy-link button requires client-side state for feedback,
**When** the share buttons are implemented,
**Then**

- the island lives at `src/components/islands/article-share.tsx` and is hydrated with `client:visible` (AR27),
- the Astro wrapper `blog-share-buttons.astro` passes props: `title`, `url`, `twitterHandle`, and all i18n-resolved label strings,
- the island is the only client-side interactive element added by this story,
- a `TODO(epic-6): trackEvent('blog_share_click', {channel, postSlug})` comment is placed in each button's click handler.

### AC5 — Twitter handle env var with graceful empty fallback

**Given** the Truvis Twitter/X handle may not exist at Epic 4 time,
**When** I wire the Twitter/X `via` parameter,
**Then**

- `PUBLIC_TRUVIS_TWITTER_HANDLE` is added to `.env.example` with an empty value and a comment referencing Story 4.5,
- the value is read via `getOptional('PUBLIC_TRUVIS_TWITTER_HANDLE')` from `lib/env.ts` in the Astro layer and passed as a prop to the island,
- if empty, `&via=` is omitted from the Twitter share URL,
- a `TODO(epic-5): move social handles to siteContent collection` comment is placed at the env read site.

### AC6 — Accessibility compliance

**Given** WCAG 2.1 AA is required,
**When** I audit the share and related-articles components,
**Then**

- share buttons are wrapped in `<nav aria-label="Share this article">`,
- each button has a descriptive `aria-label` (e.g., "Share on WhatsApp", "Share on Twitter", "Copy article link"),
- the "Copied!" feedback fires an `aria-live="polite"` announcement for screen readers,
- all buttons are keyboard-activatable via Enter and Space (native `<button>` behaviour),
- all interactive elements meet 44x44px minimum touch target (UX-DR26),
- the share block and related strip render correctly under 140% text expansion (UX-DR31),
- axe-core reports zero violations.

### AC7 — i18n strings for share block

**Given** the project uses externalized i18n strings,
**When** I add share-related keys,
**Then**

- `src/i18n/en/blog.json` adds under `blog.article`:
  - `shareHeadline` — "Found this useful? Share it."
  - `keepReading` — "Keep reading"
  - `shareWhatsApp` — "WhatsApp"
  - `shareTwitter` — "Twitter"
  - `copyLink` — "Copy link"
  - `linkCopied` — "Copied!"
  - `shareOnWhatsApp` — "Share on WhatsApp" (aria-label)
  - `shareOnTwitter` — "Share on Twitter" (aria-label)
  - `copyArticleLink` — "Copy article link" (aria-label)
- `src/i18n/fr/blog.json` and `src/i18n/de/blog.json` mirror all keys with placeholder English values.

## Tasks / Subtasks

- [x] **Task 1 — Add i18n strings** (AC: 7)
  - [x] T1.1 Add `shareHeadline`, `keepReading`, `shareWhatsApp`, `shareTwitter`, `copyLink`, `linkCopied`, `shareOnWhatsApp`, `shareOnTwitter`, `copyArticleLink` under `article` in `src/i18n/en/blog.json`
  - [x] T1.2 Mirror all keys in `src/i18n/fr/blog.json` with placeholder English values
  - [x] T1.3 Mirror all keys in `src/i18n/de/blog.json` with placeholder English values

- [x] **Task 2 — Add `PUBLIC_TRUVIS_TWITTER_HANDLE` to `.env.example`** (AC: 5)
  - [x] T2.1 Add env var entry under a new "Social" section with empty value and Story 4.5 reference comment
  - [x] T2.2 Add `TODO(epic-5): move social handles to siteContent collection` comment above the entry

- [x] **Task 3 — Create `src/components/islands/article-share.tsx` React island** (AC: 2, 3, 4, 6)
  - [x] T3.1 Define props interface:
    ```ts
    interface ArticleShareProps {
      title: string;           // article title (pre-resolved)
      url: string;             // absolute post URL (post.webUrl)
      twitterHandle?: string;  // from PUBLIC_TRUVIS_TWITTER_HANDLE, empty = omit &via=
      labels: {
        shareHeadline: string;
        whatsApp: string;
        twitter: string;
        copyLink: string;
        linkCopied: string;
        ariaWhatsApp: string;
        ariaTwitter: string;
        ariaCopyLink: string;
      };
    }
    ```
  - [x] T3.2 Implement `useState<boolean>` for `copied` state with `useEffect` timer cleanup
  - [x] T3.3 Build WhatsApp button: `<a href="https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}" target="_blank" rel="noopener noreferrer">` with inline SVG icon
  - [x] T3.4 Build Twitter/X button: `<a href={twitterUrl} target="_blank" rel="noopener noreferrer">` where `twitterUrl` conditionally includes `&via=${twitterHandle}` only when handle is non-empty
  - [x] T3.5 Build Copy link button: `<button onClick={handleCopy}>` using async Clipboard API:
    ```ts
    async function handleCopy() {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        // Fallback: select-and-copy from a hidden textarea
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
      }
    }
    ```
  - [x] T3.6 Timer effect for "Copied!" revert (~2s):
    ```ts
    useEffect(() => {
      if (!copied) return;
      const id = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(id);
    }, [copied]);
    ```
  - [x] T3.7 Wrap all buttons in `<nav aria-label={labels.ariaShareNav || "Share this article"}>` with flex layout
  - [x] T3.8 Add `aria-live="polite"` visually-hidden region that announces "Copied!" when `copied` is true:
    ```tsx
    <span className="sr-only" aria-live="polite" role="status">
      {copied ? labels.linkCopied : ''}
    </span>
    ```
  - [x] T3.9 Each button: `aria-label` from props, `min-h-[44px] min-w-[44px]` for touch target, `focus-visible:ring-teal` focus indicator
  - [x] T3.10 Add `// TODO(epic-6): trackEvent('blog_share_click', { channel: 'whatsapp' | 'twitter' | 'copy_link', postSlug })` in each handler
  - [x] T3.11 Respect `prefers-reduced-motion` for the Copied label transition (UX-DR32): use CSS `transition-opacity` that is disabled under `@media (prefers-reduced-motion: reduce)`

- [x] **Task 4 — Create inline SVG icon components** (AC: 2)
  - [x] T4.1 WhatsApp icon — simplified brand path, single `<svg>` element, `aria-hidden="true"`, `width="20" height="20"`, `fill="currentColor"`, <=1KB
  - [x] T4.2 Twitter/X icon — simplified X logo path, same constraints
  - [x] T4.3 Link/chain icon — simple chain-link SVG, same constraints
  - [x] T4.4 Icons defined inline in `article-share.tsx` or extracted to a local `const` block at file top — no separate icon library dependency

- [x] **Task 5 — Create `src/components/blog/blog-share-buttons.astro` Astro wrapper** (AC: 2, 4, 5)
  - [x] T5.1 Accept props: `title: string`, `url: string`, `locale: string`
  - [x] T5.2 Read `PUBLIC_TRUVIS_TWITTER_HANDLE` via `getOptional()` from `lib/env.ts` with `TODO(epic-5)` comment
  - [x] T5.3 Resolve all i18n label strings via `t()` at build time and pass as `labels` prop object
  - [x] T5.4 Render `<ArticleShare client:visible title={title} url={url} twitterHandle={handle} labels={labels} />`

- [x] **Task 6 — Create `src/components/blog/blog-related-posts.astro`** (AC: 1)
  - [x] T6.1 Accept props: `relatedPosts: BlogEntryView[]`, `locale: string`
  - [x] T6.2 Guard: if `relatedPosts.length === 0`, render nothing (return early or conditional block)
  - [x] T6.3 Render `SectionEyebrow` with `eyebrow={t('blog.article.keepReading', locale)}`
  - [x] T6.4 Render responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
  - [x] T6.5 Map `relatedPosts` to `<BlogPreviewCard post={post} />` instances
  - [x] T6.6 Wrap in a `<section aria-label="Related articles">` for landmark navigation

- [x] **Task 7 — Integrate into article page `src/pages/blog/[year]/[month]/[slug].astro`** (AC: 1, 2)
  - [x] T7.1 Import `getRelatedBlogPosts` from `lib/content.ts`
  - [x] T7.2 Call `const relatedPosts = await getRelatedBlogPosts(slug, 3)` in the page's frontmatter
  - [x] T7.3 Import and render `<BlogShareButtons>` after the article body `</article>` or at the end of the article body section
  - [x] T7.4 Import and render `<BlogRelatedPosts relatedPosts={relatedPosts} locale={locale} />` after share buttons, before the Story 4.6 CTA slot
  - [x] T7.5 Ensure page ordering is: article hero -> article body -> share buttons -> related articles strip -> (CTA placeholder for Story 4.6) -> footer

- [x] **Task 8 — Accessibility and text-expansion audit** (AC: 6)
  - [x] T8.1 Verify `<nav aria-label="Share this article">` wraps share buttons
  - [x] T8.2 Verify `aria-live="polite"` region announces "Copied!" state change
  - [x] T8.3 Verify all buttons meet 44x44px touch target
  - [x] T8.4 Verify keyboard activation (Enter/Space) on all buttons
  - [x] T8.5 Verify 140% text expansion does not break layout (test with longer FR/DE placeholder strings)
  - [x] T8.6 Run axe-core — zero violations

## Dev Notes

### Share URL encoding patterns

WhatsApp expects the entire message in a single `text` parameter. Twitter/X uses separate `text`, `url`, and optional `via` params. Always use `encodeURIComponent()` for each value individually — never encode the full URL string:

```ts
// WhatsApp
const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

// Twitter/X
let twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
if (twitterHandle) {
  twUrl += `&via=${encodeURIComponent(twitterHandle)}`;
}
```

Both links open via `<a target="_blank" rel="noopener noreferrer">` — no `window.open()` needed, which avoids popup-blocker issues.

### Clipboard API with fallback

`navigator.clipboard.writeText()` requires a secure context (HTTPS or localhost) and may throw in older browsers or when the page is not focused. The `document.execCommand('copy')` fallback covers these edge cases. Both paths set `copied = true` to trigger the "Copied!" feedback.

### aria-live pattern for copy feedback

The `aria-live="polite"` region must exist in the DOM before content changes — screen readers only announce *mutations* to live regions, not initial renders. The pattern is a persistent `<span className="sr-only" aria-live="polite" role="status">` whose text content toggles between empty string and "Copied!" via the `copied` state:

```tsx
<span className="sr-only" aria-live="polite" role="status">
  {copied ? labels.linkCopied : ''}
</span>
```

### Astro wrapper approach

The `blog-share-buttons.astro` wrapper exists to:
1. Read env vars via `lib/env.ts` (server-side only, not in the React island)
2. Resolve all i18n strings at build time via `t()` and pass as a flat `labels` object
3. Mount the island with `client:visible` — the React component receives only serializable props

This follows the established pattern: Astro handles data fetching / env / i18n at build time, React islands handle client-side interactivity only.

### SVG icon sizing

Icons are sized at 20x20px with `fill="currentColor"` so they inherit the button's text colour. Wrapped in `aria-hidden="true"` since each button has its own `aria-label`. The visible text label sits beside the icon. Example structure:

```tsx
<a href={waUrl} target="_blank" rel="noopener noreferrer"
   aria-label={labels.ariaWhatsApp}
   className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2 ...">
  <WhatsAppIcon />
  <span>{labels.whatsApp}</span>
</a>
```

### Motion handling

The "Copied!" label transition uses CSS `transition-opacity` with `var(--duration-base)` (250ms). Under `prefers-reduced-motion: reduce`, the transition is instant (duration 0ms) per the global motion token convention from Story 1.7.

### Project Structure Notes

New files:

```
src/components/islands/article-share.tsx       ← React island (share buttons + copy state)
src/components/blog/blog-share-buttons.astro   ← Astro wrapper (env + i18n resolution)
src/components/blog/blog-related-posts.astro   ← Pure Astro related-articles strip
```

Modified files:

```
src/pages/blog/[year]/[month]/[slug].astro     ← Import and render share + related components
src/i18n/en/blog.json                          ← Add share and keepReading keys
src/i18n/fr/blog.json                          ← Mirror with placeholder English
src/i18n/de/blog.json                          ← Mirror with placeholder English
.env.example                                   ← Add PUBLIC_TRUVIS_TWITTER_HANDLE
```

### Architecture compliance

- **Three-tier hierarchy**: `blog-share-buttons.astro` and `blog-related-posts.astro` are Tier 2 (`components/blog/`). `article-share.tsx` is a React island in `components/islands/`. Pages consume them at Tier 3. No upward or lateral Tier 2 imports.
- **Hydration policy (AR27)**: `client:visible` for the share island — below the fold, not conversion-critical. No `client:load`.
- **Content access**: `getRelatedBlogPosts()` is called in the page frontmatter (Tier 3) via `lib/content.ts`. No direct `getCollection()` calls.
- **Env vars**: `PUBLIC_TRUVIS_TWITTER_HANDLE` read via `getOptional()` from `lib/env.ts` in the Astro wrapper, never in the React island.
- **i18n**: All user-facing strings resolved at build time via `t()` in Astro, passed as props to the island. No i18n calls inside React.
- **Cross-island state**: Not needed — the share island is self-contained with local `useState` only.
- **NFR5 (500KB budget)**: No new dependencies. Inline SVGs are <=1KB each. The island is tiny (useState + 3 buttons).
- **UX-DR26**: 44x44px touch targets via `min-h-[44px] min-w-[44px]` + padding.
- **UX-DR31**: Text expansion tolerance — flex-wrap layout for share buttons handles longer translated labels.
- **UX-DR32**: `prefers-reduced-motion` respected via global motion token convention.

### Dependencies

- **Story 4.1** — `getRelatedBlogPosts(slug, limit?)` in `lib/content.ts` and `BlogEntryView` type
- **Story 4.2** — `BlogPreviewCard` at `src/components/blog/blog-preview-card.astro`
- **Story 4.4** — Article page at `src/pages/blog/[year]/[month]/[slug].astro` to extend
- **Story 1.4** — `SectionEyebrow` at `src/components/sections/section-eyebrow.astro`
- **Story 1.7** — `sr-only` utility, focus ring pattern, motion token convention

### References

- [Source: epics-truvis-landing-page.md#Story 4.5 — Full acceptance criteria]
- [Source: architecture-truvis-landing-page.md#AR27 — Hydration policy]
- [Source: ux-design-specification#UX-DR26 — 44x44px minimum touch targets]
- [Source: ux-design-specification#UX-DR31 — 140% text expansion tolerance]
- [Source: ux-design-specification#UX-DR32 — prefers-reduced-motion respect]
- [Source: prd-truvis-landing-page.md#FR20 — Related blog article navigation]
- [Source: prd-truvis-landing-page.md#FR21 — Social sharing]
- [Source: src/components/sections/section-eyebrow.astro — SectionEyebrow interface]
- [Source: src/lib/env.ts — getOptional() for optional env vars]
- [Source: src/i18n/en/blog.json — Existing blog i18n key structure]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- No blocking issues encountered.

### Completion Notes List
- All 8 tasks and subtasks completed in a single pass.
- Created `article-share.tsx` React island with WhatsApp, Twitter/X, and Copy link buttons. Includes `useState` for "Copied!" feedback, `useEffect` timer cleanup, `aria-live` announcement, 44x44px touch targets, `focus-visible` indicators, and `motion-safe` transitions.
- Created 4 inline SVG icon components (WhatsApp, Twitter/X, Link, Check) at file top -- all `aria-hidden`, 20x20, currentColor, well under 1KB each.
- Created `blog-share-buttons.astro` Astro wrapper that resolves i18n labels at build time, reads `PUBLIC_TRUVIS_TWITTER_HANDLE` via `getOptional()`, and mounts the island with `client:visible`.
- Created `blog-related-posts.astro` with SectionEyebrow + responsive 1/2/3-column grid of BlogPreviewCard instances. Returns early when no related posts.
- Integrated both components into EN, FR, and DE article pages after the prose content, before the Story 4.6 CTA placeholder.
- Added 9 i18n keys to `en/blog.json`, mirrored in `fr/blog.json` and `de/blog.json` with placeholder English values.
- Added `PUBLIC_TRUVIS_TWITTER_HANDLE` to `.env.example` under a "Social" section with `TODO(epic-5)` comment.
- All validations pass: `astro check` 0 errors, `npm run build` succeeds for all 9 article pages (3 locales x 3 seed articles), `eslint` clean, `prettier` clean, `vitest` 74/74 tests pass with zero regressions.

### File List
- src/components/islands/article-share.tsx (new)
- src/components/blog/blog-share-buttons.astro (new)
- src/components/blog/blog-related-posts.astro (new)
- src/pages/blog/[year]/[month]/[slug].astro (modified)
- src/pages/fr/blog/[year]/[month]/[slug].astro (modified)
- src/pages/de/blog/[year]/[month]/[slug].astro (modified)
- src/i18n/en/blog.json (modified)
- src/i18n/fr/blog.json (modified)
- src/i18n/de/blog.json (modified)
- .env.example (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

### Change Log
- 2026-04-26: Implemented Story 4.5 -- related articles navigation and social share buttons on the article page.
