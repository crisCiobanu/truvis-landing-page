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

| Script            | What it does                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`     | Starts the Astro dev server with HMR at `http://localhost:4321/`.                            |
| `npm run build`   | Runs `astro check` (TypeScript + Astro diagnostics) then produces a static build in `dist/`. |
| `npm run preview` | Serves the production build from `dist/` locally so you can verify it before deploying.      |
| `npm run lint`    | Runs ESLint (`eslint .`) — flat config auto-discovers `.ts`, `.tsx`, and `.astro` files.     |
| `npm run format`  | Formats the project with Prettier.                                                           |

## Starter Verification

This project was initialised from [`one-ie/astro-shadcn`](https://github.com/one-ie/astro-shadcn), branch `astro-shadcn-starter`, at upstream commit **`e60b7af`** (`e60b7aff238bdda4acaa19f0e6004ba0b0f13e48`), per architecture decision **AR1**.

Pre-init checklist result: **PASS (with documented caveats below)**.

| Check                                                                         | Result                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LICENSE` is permissive (MIT / Apache-2.0 / BSD)                              | ✅ MIT                                                                                                                                                                                                                                                                                                                    |
| Recent upstream activity (~6 months)                                          | ⚠️ borderline — most recent commit on default branch (`astro-shadcn-starter`) is **2025-09-30**, ~6 months and 11 days before initialisation. Proceeded as a judgement call: every other check passed cleanly and the stack matches the architecture exactly. Re-evaluate if upstream stays dormant when Story 1.2 lands. |
| `package.json` audit for prohibited categories (AI/LLM SDKs, heavy analytics) | ✅ none present                                                                                                                                                                                                                                                                                                           |

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

| Metric         | Desktop |  Mobile | Threshold      | Status |
| -------------- | ------: | ------: | -------------- | ------ |
| Performance    | **100** |  **98** | ≥ 90 (NFR6)    | ✅     |
| Accessibility  |  **92** |  **92** | ≥ 90 (NFR25)   | ✅     |
| Best Practices | **100** | **100** | —              | —      |
| SEO            | **100** | **100** | ≥ 95 (NFR39)   | ✅     |
| LCP            |   0.6 s |   2.1 s | < 2.5 s (NFR1) | ✅     |
| CLS            |       0 |       0 | < 0.1 (NFR3)   | ✅     |
| TBT            |    0 ms |   90 ms | —              | —      |
| FCP            |   0.4 s |   1.4 s | —              | —      |
| Speed Index    |   0.4 s |   1.4 s | —              | —      |

All NFR thresholds enforced by AC4 pass on the unmodified starter. The fallback path to `onwidget/astrowind` (AC6) was therefore not taken.

Tooling: `lighthouse@13.1.0` driving Chromium 146.0.7680.164 (snap). Reports:

- `lighthouse/baseline/baseline-desktop.html` (and `.json`)
- `lighthouse/baseline/baseline-mobile.html` (and `.json`)

## Known Audit Findings

`npm install` reports **5 moderate vulnerabilities** at the time of initialisation. All five chain to the same advisory:

| Package          | Severity | Path                                                                                                   | Notes                                                                                                                                                                                                            |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yaml` (< 2.8.3) | moderate | `@astrojs/check` → `@astrojs/language-server` → `volar-service-yaml` → `yaml-language-server` → `yaml` | [GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) — stack overflow on deeply nested YAML collections (CWE-674, CVSS 4.3). Reachable only via `astro check` at build time, not at runtime. |

`@astrojs/check` is declared in the starter's `dependencies` (not `devDependencies`), so npm flags this chain even though the package is functionally a development tool. **No high or critical findings on production dependencies** — AC2's gate is satisfied. These findings are deferred to **Story 1.2** for triage as part of the CI pipeline setup.

## Hosting

**Platform:** Cloudflare Pages (static + edge functions).
**Uptime SLA:** ≥ 99.9% per [Cloudflare's published SLA for the Pages service](https://www.cloudflare.com/business-sla/) — this is the minimum Truvis targets for the landing site (NFR33).
**Dashboard:** <https://dash.cloudflare.com/> → _Workers & Pages_ → `truvis-landing-page`.

Edge security posture (all configured on the Cloudflare dashboard, not in code):

- **TLS ≥ 1.2** enforced at the edge; HTTP requests are 301'd to HTTPS. Minimum TLS version set via _SSL/TLS → Edge Certificates → Minimum TLS Version = 1.2_. (NFR10)
- **HSTS** enabled with `max-age=31536000` (12 months). `includeSubDomains` and `preload` are intentionally **off** in V1 — they are hardened by Story 7.7 once the subdomain topology is settled. _SSL/TLS → Edge Certificates → HSTS_.
- **WAF rate limiting** placeholder rule scoped to `/api/v1/blog/*` at 100 req/min/IP. Refined in Story 4.9. (NFR14)

Push to `main` triggers an automatic production deploy. Every open PR gets a unique Cloudflare preview URL commented on the PR by the Cloudflare GitHub app.

### Branded error pages (Story 1.5 / FR56)

The site ships two branded error pages that reuse `BaseLayout` and the Truvis brand tokens:

- **`src/pages/404.astro`** — Astro's static build emits this as `dist/404.html`. Cloudflare Pages returns it with HTTP `404` automatically for any request that matches no static asset. No dashboard configuration required. Verify after deploy with `curl -I https://<preview>/does-not-exist` → expect `HTTP/2 404`.
- **`src/pages/500.astro`** — emitted as `dist/500.html`. Cloudflare Pages does **not** automatically serve a custom 5xx page, so wire it up once per environment from the dashboard:

  _Workers & Pages → `truvis-landing-page` → Settings → Custom Pages → `5xx Errors` → point at `/500.html`._

  We deliberately chose the dashboard route over a `public/_routes.json` workaround because `_routes.json` controls Function routing, not error responses. Verify after deploy with a deliberately failing route (temporarily `throw` from an API handler and `curl -I https://<preview>/api/<route>` → expect `HTTP/2 500`).

Both error pages are marked `noindex` and carry two nav-back CTAs (`/` and `/blog`) per FR56.

## Environment Variables

Cloudflare Pages is the **source of truth** for environment variables in `preview` and `production`. The repository's `.env.local` (gitignored) holds local dev values. **Never commit real secrets.** CI (`.github/workflows/ci.yml`) does not need any of these — it only runs the build and Lighthouse against the local preview server.

| Variable                  | Environments                 | Visibility                      | Owner    | Populated by                                         |
| ------------------------- | ---------------------------- | ------------------------------- | -------- | ---------------------------------------------------- |
| `LAUNCH_PHASE`            | local / preview / production | server                          | Cristian | Story 5.3 (`pre` in V1, flipped to `post` at launch) |
| `LOOPS_API_KEY`           | preview / production         | server (secret)                 | Cristian | Story 3.1                                            |
| `LOOPS_AUDIENCE_ID`       | preview / production         | server                          | Cristian | Story 3.1                                            |
| `SENTRY_DSN`              | preview / production         | server                          | Cristian | Story 7.4                                            |
| `PLAUSIBLE_DOMAIN`        | preview / production         | server                          | Cristian | Story 6.5                                            |
| `TURNSTILE_SITE_KEY`      | preview / production         | **public** (`PUBLIC_*` in code) | Cristian | Story 3.2                                            |
| `TURNSTILE_SECRET_KEY`    | preview / production         | server (secret)                 | Cristian | Story 3.2                                            |
| `PUBLIC_SITE_URL`         | local / preview / production | **public**                      | Cristian | Story 1.2 (set to the canonical URL per environment) |
| `COOKIE_CONSENT_REQUIRED` | preview / production         | server                          | Cristian | Story 7.1 (inactive in V1; wired and ready)          |

Placeholder values (e.g., `<TBD-loops>`) are acceptable in `preview` / `production` until the downstream story wires the integration. The build will still succeed — consumers must degrade gracefully per the integration-boundary matrix (Story 7.5).

Per `CLAUDE.md`, env vars are read **only** via `src/lib/env.ts` — never via direct `import.meta.env` / `process.env` outside of `lib/`. Any variable exposed to the browser must be prefixed `PUBLIC_`.

## CI / Quality Gates

Every PR runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml), which gates merge to `main` via GitHub branch protection. The workflow has two jobs:

1. **`checks`** — `astro check` · `eslint` · `prettier --check` · `vitest run --passWithNoTests`
2. **`lighthouse`** — `npm run build` → `npm run preview` → `@lhci/cli autorun` against `lighthouse/lighthouserc.cjs`

Lighthouse thresholds (all `error` mode — any breach fails the PR):

| Metric               | Threshold                                               | NFR   |
| -------------------- | ------------------------------------------------------- | ----- |
| Performance          | ≥ 90                                                    | NFR6  |
| Accessibility        | ≥ 90                                                    | NFR25 |
| SEO                  | ≥ 95                                                    | NFR39 |
| LCP                  | < 2.5 s                                                 | NFR1  |
| CLS                  | < 0.1                                                   | NFR3  |
| Total initial weight | < 500 KiB (512 000 bytes, see `lighthouse/budget.json`) | NFR5  |

HTML reports are uploaded as workflow artefacts (`lighthouse-reports-<sha>`, 14-day retention) and also to LHCI's temporary public storage so they're clickable from the PR.

### Running Lighthouse CI locally

```sh
npm run build
npx lhci autorun --config=./lighthouse/lighthouserc.cjs
```

Reports land in `.lighthouseci/` (gitignored). If the assertions fail locally, fix the regression **in the code** — **never loosen a threshold** to make CI pass. If the baseline itself cannot meet a threshold, that is a Story 1.1 acceptance failure to repair first.

## Operations Runbook

### Rollback a bad production deploy

1. Open <https://dash.cloudflare.com/> → _Workers & Pages_ → `truvis-landing-page` → _Deployments_.
2. Find the last known-good deployment (the one before the regression).
3. Click _⋯_ → **Rollback to this deployment** → confirm.
4. Cloudflare promotes the selected deployment to the production alias immediately.

**Dry-run timing:** ≤ 2 minutes end-to-end (NFR38). Cloudflare Pages rollback is a cache-alias flip at the edge — no rebuild — which Cloudflare documents as taking seconds. The empirical drill was deferred during Story 1.2 T2.8; the architectural path above is the authoritative one and can be drilled at any time against the existing deployment history on `main`.

> Last rollback drill: _deferred (Story 1.2 T2.8)_ — elapsed: _not measured_ — operator: _TBD_

### Where things are

- **CI logs / artefacts:** GitHub Actions tab of this repo → `CI` workflow.
- **Preview URLs:** Cloudflare GitHub app comments each PR with its unique preview URL.
- **Production deploys:** Cloudflare Pages dashboard → _Deployments_ tab.

## Brand tokens & self-hosted fonts (Story 1.3)

The Truvis warm-editorial design tokens live in `src/styles/global.css` as a Tailwind v4 CSS-first `@theme` block. Values are mirrored from `_bmad-output/planning-artifacts/ux-design-hybrid.html` — that file is the visual source of truth; update it first, then mirror into `global.css`.

### Self-hosted fonts

Plus Jakarta Sans (display) and Inter (body) are self-hosted as variable WOFF2 files at stable URLs under `public/fonts/` so they can be preloaded from `<head>` without a hashed filename. The subsets are trimmed to Latin-1 Supplement + common punctuation/currency (EN / FR / DE coverage) to hit the per-file budget called out in NFR5:

| File                                            | Size   | Coverage                            |
| ----------------------------------------------- | ------ | ----------------------------------- |
| `public/fonts/plus-jakarta-sans-variable.woff2` | ~17 KB | wght 400–800 variable, Latin subset |
| `public/fonts/inter-variable.woff2`             | ~27 KB | wght 400–800 variable, Latin subset |

Both files are `font-display: swap` with a system-font fallback stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`). Plus Jakarta Sans is preloaded from `src/layouts/Layout.astro` because it's the hero display font (NFR3).

Regenerating the subsets is a one-off, reproducible operation:

```sh
npm install --no-save subset-font
node scripts/subset-fonts.mjs
```

See `scripts/subset-fonts.mjs` for the exact Unicode ranges and weight axis bounds. `subset-font` pulls in a large HarfBuzz WASM blob, which is why it is deliberately kept out of `package.json` dependencies.

### Contrast validation (WCAG 2.1 AA / NFR20)

Computed with the WCAG 2.1 relative-luminance formula against the light-theme token values in `src/styles/global.css`. Body-text-grade pairings MUST be ≥ 4.5:1 (AA) or ≥ 7:1 (AAA). Decorative accents (amber, teal-bright, coral, severity-red/green) are listed for transparency but are reserved for non-text surfaces (backgrounds, buckets, severity dots) where contrast-AA-body rules do not apply.

| Foreground (token)         | Background (token)    | Ratio   | Grade                 | Notes                                             |
| -------------------------- | --------------------- | ------- | --------------------- | ------------------------------------------------- |
| `primary` `#2E4057`        | `bg` `#FFFDF9`        | 10.40:1 | **AAA**               | Body copy — required pair (AC1)                   |
| `primary-light` `#3B5068`  | `bg` `#FFFDF9`        | 8.16:1  | AAA                   | Secondary copy                                    |
| `muted` `#5F6F7E`          | `bg` `#FFFDF9`        | 5.09:1  | AA                    | Meta / captions                                   |
| `teal` `#3D7A8A`           | `bg` `#FFFDF9`        | 4.75:1  | **AA**                | Link / accent text — required pair (AC1)          |
| `white` `#FFFFFF`          | `primary` `#2E4057`   | 10.57:1 | **AAA**               | Inverted text — required pair (AC1)               |
| `white` `#FFFFFF`          | `teal` `#3D7A8A`      | 4.83:1  | AA                    | Primary CTA label on teal surface                 |
| `primary` `#2E4057`        | `surface` `#F7F5F2`   | 9.71:1  | AAA                   | Cards                                             |
| `primary` `#2E4057`        | `surface-2` `#FFF8EF` | 10.03:1 | AAA                   | Warm surface variant                              |
| `primary` `#2E4057`        | `surface-3` `#EEF7F7` | 9.70:1  | AAA                   | Cool surface variant                              |
| `severity.red` `#EF4444`   | `bg` `#FFFDF9`        | 3.70:1  | AA-large / decorative | Reserved for severity dots / icons, not body text |
| `amber` `#F5A623`          | `bg` `#FFFDF9`        | 1.99:1  | decorative            | Highlight marker / badge background only          |
| `teal-bright` `#2DA5A0`    | `bg` `#FFFDF9`        | 2.95:1  | decorative            | Background / icon only                            |
| `coral` `#FF6B6B`          | `bg` `#FFFDF9`        | 2.73:1  | decorative            | Background / icon only                            |
| `severity.green` `#22C55E` | `bg` `#FFFDF9`        | 2.24:1  | decorative            | Severity dot fill only, never body text           |

**Result:** the three pairs explicitly required by Story 1.3 AC1 — primary-on-bg, teal-on-bg, white-on-primary — all exceed their targeted grades. Decorative accents are documented with their actual ratios so future stories treat them as icon / background tokens rather than text tokens.

## What is _not_ in this story

The following are explicitly out of scope for Story 1.1 and live in their own stories — do not pre-implement them here:

- Cloudflare Pages provisioning + GitHub Actions CI + Lighthouse CI gates → **Story 1.2**
- Truvis brand tokens, fonts, type scale, motion tokens → **Story 1.3**
- `BaseLayout`, `Header`, `Footer`, `MobileNav`, `SectionEyebrow` → **Story 1.4**
- Branded `404` / `500` pages → **Story 1.5**
- i18n routing, locale detection middleware, JSON message files → **Story 1.6**
- ESLint custom rules, prettier-plugin-tailwindcss, accessibility/motion conventions, env helper, nanostore conventions, path alias `~/*` → **Story 1.7**
