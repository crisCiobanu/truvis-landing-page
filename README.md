# Truvis landing page

Truvis landing page — Astro 5 + Tailwind v4 + shadcn/ui + React islands.

The marketing site for **Truvis**, a used-car inspection app. Static, internationalisation-ready, conversion-focused, with a content-driven blog and a pre-launch email waitlist that flips to App Store / Google Play CTAs post-launch via a single env-var phase toggle.

> See `CLAUDE.md` for the architectural conventions, anti-patterns, and project structure that apply to this repository. The mobile app that this landing page promotes lives in a separate repository.

## Prerequisites

- **Node.js** ≥ 18.20.8 (or ≥ 20.3.0 / ≥ 22.0.0) — required by Astro 5. The starter does not pin a specific version via `engines`; any current LTS works.
- **npm** ≥ 10 (ships with the supported Node versions above).
- **OS**: macOS, Linux, or Windows with WSL2. Native Windows is untested.

## Setup

```sh
git clone git@github.com:crisCiobanu/truvis-landing-page.git
cd truvis-landing-page
npm install
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the Astro dev server with HMR at `http://localhost:4321/`. |
| `npm run build` | Runs `astro check` (TypeScript + Astro diagnostics) then produces a static build in `dist/`. |
| `npm run preview` | Serves the production build from `dist/` locally so you can verify it before deploying. |
| `npm run lint` | Lints `.ts`, `.tsx`, and `.astro` files via ESLint. |
| `npm run format` | Formats the project with Prettier. |

## Starter Verification

This project was initialised from [`one-ie/astro-shadcn`](https://github.com/one-ie/astro-shadcn), branch `astro-shadcn-starter`, at upstream commit **`e60b7af`** (`e60b7aff238bdda4acaa19f0e6004ba0b0f13e48`), per architecture decision **AR1**.

Pre-init checklist result: **PASS (with documented caveats below)**.

| Check | Result |
| --- | --- |
| `LICENSE` is permissive (MIT / Apache-2.0 / BSD) | ✅ MIT |
| Recent upstream activity (~6 months) | ⚠️ borderline — most recent commit on default branch (`astro-shadcn-starter`) is **2025-09-30**, ~6 months and 11 days before initialisation. Proceeded as a judgement call: every other check passed cleanly and the stack matches the architecture exactly. Re-evaluate if upstream stays dormant when Story 1.2 lands. |
| `package.json` audit for prohibited categories (AI/LLM SDKs, heavy analytics) | ✅ none present |

**Pruned dependencies:** none. The starter ships several Radix-driven helpers (`recharts`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`, `input-otp`, `cmdk`, `next-themes`) that look optional at first glance but are wired into the kept `src/components/ui/*` shadcn primitives. Removing any of them would break primitives that downstream stories (1.4, Epic 2) depend on, so per AC3's "do not delete `src/components/ui/`" guidance, no production dependencies were removed.

**Added dependencies (upstream patches):** the starter ships an `astro.config.mjs` and `src/pages/rss.xml.ts` that import `@astrojs/sitemap` and `@astrojs/rss`, but neither package is declared in upstream `package.json` — `npm run dev` and `npm run build` both fail on a vanilla clone. Both packages were installed (`@astrojs/sitemap@^3.7.2`, `@astrojs/rss@^4.0.18`) to restore the starter to its intended working state. These match what Epic 6 was already going to verify, so this is not scope creep.

**Patched code (upstream defects):** `src/pages/blog/index.astro` widened two URL-search-param values (`viewMode` and `gridColumns`) into narrowed string-literal unions before passing them to `<BlogSearch />`. Without this patch, `astro check` (which runs as the first step of `npm run build`) reports two `ts(2322)` errors. Diff is two lines.

**Pruned demo content** (committed in the starter overlay commit):
- Pages: `src/pages/install.astro`, `src/pages/readme.astro`, `src/pages/mit-license.md`
- Blog seed posts: `src/content/blog/get-started.md`, `src/content/blog/one-hundred-percent-lighthouse-score.md` (Epic 4 will repopulate the blog)
- Public assets: `public/screenshots/` (entire directory of upstream marketing screenshots and a 6 MB screencast `.mov`), `public/blog-placeholder-3.jpg`

**Kept intact** (do not delete in future stories):
- All of `src/components/ui/` — shadcn/ui Tier-1 primitives consumed by Story 1.4 and Epic 2.
- `src/content/config.ts` — blog content collection schema (Epic 4 customises rather than rewrites).
- `src/pages/blog/[...slug].astro`, `src/pages/blog/index.astro`, `src/pages/rss.xml.ts` — blog scaffolding (Epic 4).
- `astro.config.mjs`, `tsconfig.json`, `tailwind.config.*`, `components.json` — Story 1.3 / 1.6 / 1.7 customise these.
- `LICENSE` — upstream's MIT licence text is preserved as required by the MIT terms.

## Baseline Lighthouse (Story 1.1)

Generated against `npm run preview` of the production build, on the pruned starter, **before any Truvis content was added**. Reports are committed under `lighthouse/baseline/` as immutable reference artefacts so Story 1.2's CI gate can be calibrated against them.

| Metric | Desktop | Mobile | Threshold | Status |
| --- | ---: | ---: | --- | --- |
| Performance | **100** | **98** | ≥ 90 (NFR6) | ✅ |
| Accessibility | **92** | **92** | ≥ 90 (NFR25) | ✅ |
| Best Practices | **100** | **100** | — | — |
| SEO | **100** | **100** | ≥ 95 (NFR39) | ✅ |
| LCP | 0.6 s | 2.1 s | < 2.5 s (NFR1) | ✅ |
| CLS | 0 | 0 | < 0.1 (NFR3) | ✅ |
| TBT | 0 ms | 90 ms | — | — |
| FCP | 0.4 s | 1.4 s | — | — |
| Speed Index | 0.4 s | 1.4 s | — | — |

All NFR thresholds enforced by AC4 pass on the unmodified starter. The fallback path to `onwidget/astrowind` (AC6) was therefore not taken.

Tooling: `lighthouse@13.1.0` driving Chromium 146.0.7680.164 (snap). Reports:
- `lighthouse/baseline/baseline-desktop.html` (and `.json`)
- `lighthouse/baseline/baseline-mobile.html` (and `.json`)

## Known Audit Findings

`npm install` reports **5 moderate vulnerabilities** at the time of initialisation. All five chain to the same advisory:

| Package | Severity | Path | Notes |
| --- | --- | --- | --- |
| `yaml` (< 2.8.3) | moderate | `@astrojs/check` → `@astrojs/language-server` → `volar-service-yaml` → `yaml-language-server` → `yaml` | [GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) — stack overflow on deeply nested YAML collections (CWE-674, CVSS 4.3). Reachable only via `astro check` at build time, not at runtime. |

`@astrojs/check` is declared in the starter's `dependencies` (not `devDependencies`), so npm flags this chain even though the package is functionally a development tool. **No high or critical findings on production dependencies** — AC2's gate is satisfied. These findings are deferred to **Story 1.2** for triage as part of the CI pipeline setup.

## What is *not* in this story

The following are explicitly out of scope for Story 1.1 and live in their own stories — do not pre-implement them here:

- Cloudflare Pages provisioning + GitHub Actions CI + Lighthouse CI gates → **Story 1.2**
- Truvis brand tokens, fonts, type scale, motion tokens → **Story 1.3**
- `BaseLayout`, `Header`, `Footer`, `MobileNav`, `SectionEyebrow` → **Story 1.4**
- Branded `404` / `500` pages → **Story 1.5**
- i18n routing, locale detection middleware, JSON message files → **Story 1.6**
- ESLint custom rules, prettier-plugin-tailwindcss, accessibility/motion conventions, env helper, nanostore conventions, path alias `~/*` → **Story 1.7**
