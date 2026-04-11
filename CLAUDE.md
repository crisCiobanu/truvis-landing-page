# CLAUDE.md

## What

Truvis landing page — the marketing site for **Truvis**, a used-car inspection app. The landing page is a static, internationalisation-ready, conversion-focused site with a content-driven blog and an email waitlist (pre-launch) that flips to App Store / Google Play CTAs (post-launch) via a single env-var phase toggle. The blog content also feeds the Truvis mobile app via a versioned static JSON API.

**Stack**: Astro 5, React 19 (islands only), TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix primitives).
**State (cross-island)**: nanostores + @nanostores/react.
**Content**: Astro Content Collections (`blog`, `faq`, `testimonials`, `stats`, `siteContent`) with Zod schemas, authored via Keystatic admin UI.
**Hosting**: Cloudflare Pages (static + edge functions for `/api/waitlist`), Cloudflare Turnstile for anti-spam, Cloudflare WAF for blog API rate limiting.
**Integrations**: Loops (ESP, double opt-in + drip), Plausible Cloud EU (cookieless analytics), Sentry EU (errors), `vanilla-cookieconsent` v3 (wired but inactive at V1 because Plausible is cookieless).
**i18n**: Astro built-in routing — English at `/`, French at `/fr/`, German at `/de/` (FR/DE content stubs ship in V1, real translations land in V1.2).
**Output**: `output: 'static'` — fully prerendered, no runtime server beyond CF Page Functions for the waitlist proxy.

> The mobile **app** that this landing page promotes is a separate codebase (Expo / React Native). This repository is the **web** project only.

## Project structure

The full directory tree is documented in `_bmad-output/planning-artifacts/architecture-truvis-landing-page.md` § "Complete Project Directory Structure". Highlights:

```
truvis-landing-page/
  src/
    pages/                    # File-based routing — THIN shells only
      index.astro             # Landing page (composes section components)
      404.astro / 500.astro   # Branded error pages
      blog/                   # Blog index, [slug], category pages
      api/
        waitlist.ts           # POST — proxies to Loops
        v1/blog/*.json.ts     # Static blog API (mobile app contract)
    components/
      ui/                     # Tier 1 — shadcn/ui primitives (kept intact from starter)
      sections/               # Tier 2 — landing page composites (Hero, Problem, FAQ, ...)
      blog/                   # Tier 2 — blog-specific composites
      forms/                  # Tier 2 — form composites
      islands/                # ALL React-hydrated components live here
    content/                  # Astro Content Collections (Zod-typed)
      config.ts
      blog/ faq/ testimonials/ stats/ site/
    layouts/                  # BaseLayout, BlogLayout
    lib/                      # Shared utilities (single source of truth per concern)
      content.ts              # All getCollection() calls go through here
      i18n.ts                 # t() helper, locale detection
      launch-phase.ts         # isPostLaunch() / LAUNCH_PHASE
      analytics.ts            # trackEvent() wrapper around Plausible
      loops.ts                # Server-side Loops client
      env.ts                  # Typed env access (no direct import.meta.env outside lib/)
      stores/                 # nanostores ($camelCase, action functions only)
      middleware/             # locale-detection middleware
    i18n/{en,fr,de}/*.json    # Translation namespaces
    styles/global.css         # Tailwind directives, font-face, motion tokens
  public/                     # Raw passthrough — favicon, robots.txt, OG images
  lighthouse/                 # lighthouserc.cjs, budget.json, baseline/ reports
  .github/workflows/ci.yml    # PR gates: astro check, eslint, prettier, vitest, Lighthouse CI
  astro.config.mjs            # i18n block, integrations
  tailwind.config.ts          # Truvis brand tokens (or @theme block in global.css for Tailwind v4 CSS-first)
  keystatic.config.ts         # Admin UI schema mirroring Content Collections
  CONTRACT.md                 # Blog API contract (versioned schema)
```

### Architectural boundaries (enforced)

- **Three-tier component hierarchy**: Tier 1 (`ui/`) → Tier 2 (`sections/` / `forms/` / `blog/`) → Tier 3 (`layouts/` + `pages/`). Strict downward dependency. Tier 1 has no business logic.
- **All client-hydrated React components live in `src/components/islands/`**. Anywhere else is assumed to be Astro (zero JS). This makes hydration cost visually obvious in the file tree.
- **Content access**: only through `src/lib/content.ts`. No direct `getCollection()` calls outside `lib/`.
- **Cross-island state**: only via nanostores in `src/lib/stores/`. Stores are `$camelCase`; never expose `.set()` directly — only action functions.
- **Env vars**: read only via `src/lib/env.ts`. Never `process.env` / `import.meta.env` outside of `lib/`. `PUBLIC_*` prefix for client-readable vars.
- **Hydration policy**: prefer `client:idle` and `client:visible`. `client:load` is reserved for above-the-fold conversion-critical islands and must live in `src/components/islands/`.

## How

This is an Astro project. Use the standard Astro / npm scripts:

```sh
npm install
npm run dev          # Astro dev server at http://localhost:4321
npm run build        # Static build to dist/
npm run preview      # Serve dist/ locally to verify the production build
npx astro check      # TypeScript + Astro diagnostics
npx eslint .         # Lint
npx prettier --check .  # Format check
npx vitest run       # Unit tests (lib utilities only)
```

CI (GitHub Actions, `.github/workflows/ci.yml`) runs all of the above plus **Lighthouse CI** with hard budget gates on every PR. Any threshold breach blocks merge:

- Performance ≥ 90 (NFR6) · Accessibility ≥ 90 (NFR25) · SEO ≥ 95 (NFR39)
- LCP < 2.5s (NFR1) · CLS < 0.1 (NFR3) · total initial weight < 500KB (NFR5)

Cloudflare Pages auto-deploys: push to `main` → production, every PR → unique preview URL.

## Key conventions

- **Path aliases**: `@/*` and `~/*` both map to `src/*` (`tsconfig.json`).
- **Tailwind CSS v4** with Truvis brand tokens (warm-editorial palette: `bg #FFFDF9`, `text/primary #2E4057`, `teal #3D7A8A`, `amber #F5A623`, severity `green/yellow/red`). 4pt spacing grid. Fluid `clamp()` typography. See `src/styles/global.css` and `_bmad-output/planning-artifacts/ux-design-hybrid.html` (the visual source of truth).
- **Fonts**: Plus Jakarta Sans (display) + Inter (body), both self-hosted variable WOFF2, subset to Latin + Latin Extended (~30KB each), `font-display: swap`, hero font preloaded.
- **Motion**: standardised duration tokens (`--duration-fast 150ms`, `--duration-base 250ms`, `--duration-slow 400ms`); global `@media (prefers-reduced-motion: reduce)` block disables non-essential transitions.
- **Accessibility**: WCAG 2.1 AA. Single `<h1>` per page. Skip-to-main link. `focus-visible` indicators (never `outline: none` without replacement). Colour never the sole indicator. All inputs have `<label>`. All shell components validated with a 140%-padded text-expansion harness at `src/pages/_demo/text-expansion.astro` (NFR26).
- **Pre/post-launch toggle**: single `LAUNCH_PHASE` env var (`pre` | `post`) read via `lib/launch-phase.ts`. Both content variants ship in V1; flipping the env var triggers a rebuild and atomic switch.
- **Blog API contract**: `/api/v1/blog/*` is the **only** data contract with the mobile app. Versioned at `/v1/`, additive-only per NFR31. Changes documented in `CONTRACT.md` at the repo root.
- **Anti-patterns** (forbidden): `process.env` outside `lib/`, `getCollection()` outside `lib/content.ts`, direct nanostore `.set()` calls from consumers, `client:load` outside `src/components/islands/`, hand-editing `package-lock.json`, hardcoding strings that should live in `src/i18n/{locale}/*.json`.

## Planning & stories

- **Architecture & PRD**: `_bmad-output/planning-artifacts/` — `architecture-truvis-landing-page.md`, `prd-truvis-landing-page.md`, `ux-design-specification-truvis-landing-page.md`, and the visual source-of-truth `ux-design-hybrid.html`.
- **Sprint status**: `_bmad-output/implementation-artifacts/sprint-status.yaml` — 8 epics, 58 stories. Check this file for current state and which story is next.
- **Story specs**: `_bmad-output/implementation-artifacts/{epic}-{story}-{kebab-title}.md`. Each story file is the dev agent's complete implementation guide (BDD acceptance criteria, tasks/subtasks, architecture compliance, references). Pick up the next `ready-for-dev` story from `sprint-status.yaml`.
- **BMad workflows**: `/bmad-create-story`, `/bmad-dev-story`, `/bmad-code-review`, `/bmad-sprint-planning`, `/bmad-sprint-status`. Skills live under `.claude/skills/`.

## Where things are decided

When in doubt about *why* a choice was made, search these in order:

1. The relevant story file in `_bmad-output/implementation-artifacts/` (most concrete; contains source citations)
2. `_bmad-output/planning-artifacts/architecture-truvis-landing-page.md` (architectural decisions with rationale and FR/NFR mappings)
3. `_bmad-output/planning-artifacts/prd-truvis-landing-page.md` (FR/NFR definitions)
4. `_bmad-output/planning-artifacts/ux-design-specification-truvis-landing-page.md` + `ux-design-hybrid.html` (visual + interaction decisions)
