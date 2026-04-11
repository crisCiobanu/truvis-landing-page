# Deferred Work

Issues surfaced by code reviews or dev work that are real but intentionally not fixed in the story that discovered them. Each item names the target story where it should be addressed.

---

## Deferred from: code review of story 1-1-initialise-project-from-one-ie-astro-shadcn-starter (2026-04-11)

- **`astro.config.mjs` `site: 'https://one.ie'` + RSS fallback to same** (`astro.config.mjs:7`, `src/pages/rss.xml.ts:19`) — upstream starter's production domain leaks into the sitemap + RSS feed. **Target: Story 1.2** (Cloudflare Pages + deploy config owns the real production URL).

- **`@theme { --color-*: initial; --radius-*: initial; }` reset block** (`src/styles/global.css:44-47`) — blind reviewer flagged that this may wipe the preceding `@theme` block's tokens, leaving `bg-background` / `text-foreground` / `rounded-*` utilities unresolved. Browser spot-check + Lighthouse run did not show visible breakage, so current impact is unclear. **Target: Story 1.3** — rewriting `global.css` with Truvis brand tokens; explicitly verify Tailwind v4 `@theme` merge semantics so the replacement doesn't inherit the same pattern.

- **`ModeToggle.tsx` dark-class desync** (`src/components/ModeToggle.tsx:9-14`) — adds `dark` class on mount unconditionally while setting state to `'theme-light'`; fights `ThemeInit`. **Target: Story 1.3 / 1.4.** Note: Truvis design is a warm-editorial single-palette site — this component may be deleted entirely rather than fixed.

- **`useToast` effect + `TOAST_REMOVE_DELAY`** (`src/hooks/use-toast.ts:7,1843`) — effect depends on `[state]` causing listener churn on every toast update; dismissed toasts are kept in memory for ~16 minutes. Known shadcn-starter footguns. **Target: Story 1.7** (conventions / codify hydration policy).

- **`layoutActions.initLayout()` unsafe localStorage parse** (`src/stores/layout.ts:88-95`) — `JSON.parse(saved) as LayoutState` with no shape validation and no `typeof window` guard (would crash in SSR contexts). **Target: Story 1.7** (nanostore conventions + env helper). Note: `src/stores/` will move to `src/lib/stores/` per CLAUDE.md architectural boundaries.

- **`ThemeInit.astro` MutationObserver leak** (`src/components/ThemeInit.astro:22-35`) — creates a new `MutationObserver` on every `astro:before-swap` event without disconnecting; leaks across view transitions. **Target: Story 1.3 / 1.7.** May disappear if dark mode is removed.

- **`Layout.astro` hardcoded `<html lang="en">` + viewport missing `initial-scale=1`** (`src/layouts/Layout.astro:14,17`) — breaks i18n SEO once FR/DE ship; minor mobile-usability Lighthouse warning. **Target: Story 1.4** (BaseLayout rewrite with dynamic `lang` from `Astro.currentLocale`) and **Story 1.6** (i18n routing).

- **`package.json` `name: "one"`** — still the upstream starter's name. Already flagged in story 1-1 Completion Notes. **Target: Story 1.2** (rename to `truvis-landing-page` alongside deploy config).
