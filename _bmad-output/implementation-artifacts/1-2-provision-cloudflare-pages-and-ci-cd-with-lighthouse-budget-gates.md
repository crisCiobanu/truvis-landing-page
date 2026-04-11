# Story 1.2: Provision Cloudflare Pages and CI/CD with Lighthouse budget gates

Status: review

## Story

As **Cristian (the developer)**,
I want **every PR automatically deployed to a preview URL and blocked from merging when it breaches the perf / a11y / SEO budgets**,
so that **performance, accessibility, and SEO regressions cannot land on `main`** and the perf budget becomes a build-time gate, not a hope.

## Acceptance Criteria

### AC1 — Cloudflare Pages project provisioned and deploying

**Given** the project repo exists on GitHub from Story 1.1 (push the local commit to a new GitHub repo as the first step of this story) and the architecture selects Cloudflare Pages as the host (AR3 / decision 5a),
**When** the developer creates the Cloudflare Pages project linked to the GitHub repo and configures environment variables scoped per environment (`local`, `preview`, `production`) with placeholder values for: `LAUNCH_PHASE`, `LOOPS_API_KEY`, `LOOPS_AUDIENCE_ID`, `SENTRY_DSN`, `PLAUSIBLE_DOMAIN`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `PUBLIC_SITE_URL`, `COOKIE_CONSENT_REQUIRED`,
**Then**

- push to `main` auto-builds and auto-deploys to production (AR5),
- every PR receives a unique preview deployment URL (AR5),
- TLS 1.2+ is enforced via Cloudflare with HSTS enabled (NFR10),
- Cloudflare WAF rate limiting is configured at the edge with a placeholder rule ready for the blog API in Epic 4 (AR3 / NFR14),
- rolling back to the previous deployment via the Cloudflare Pages dashboard completes in under 2 minutes (NFR38) — verified once with a deliberate trivial commit + rollback dry run,
- the hosting plan documents ≥99.9% uptime SLA in `README.md` (NFR33).

### AC2 — GitHub Actions CI workflow with hard Lighthouse gates

**Given** the architecture requires PR checks gated on Lighthouse budgets (AR4 / decision 4g / 5c),
**When** the developer adds a `.github/workflows/ci.yml` GitHub Actions workflow,
**Then**

- the workflow runs on every PR (and on push to `main`) and executes, in sequence: `astro check`, `eslint`, `prettier --check`, `vitest run` (no-op if no tests yet, but must succeed), and Lighthouse CI,
- Lighthouse CI is configured against `lighthouse/lighthouserc.cjs` with hard thresholds:
  - **Performance ≥ 90** (NFR6)
  - **Accessibility ≥ 90** (NFR25)
  - **SEO ≥ 95** (NFR39)
  - **LCP < 2.5s** (NFR1)
  - **CLS < 0.1** (NFR3)
- a `lighthouse/budget.json` enforces **total initial weight < 500KB** (NFR5),
- any threshold breach **fails** the PR check and **blocks merge** (configure GitHub branch protection on `main` to require the CI status check before merge),
- the workflow status is visible on the PR before merge,
- the workflow runs against a build of the same commit (not against the production URL) so failures are deterministic per-commit.

## Tasks / Subtasks

- [x] **T1 — Push the Story 1.1 commit to a new GitHub repo** (AC: 1)
  - [x] T1.1 Create a new GitHub repo (public, `crisCiobanu/truvis-landing-page`) — created outside this session by Cristian; repo visibility flipped from private → public to unlock rulesets API on the Free plan
  - [x] T1.2 `git remote add origin <repo-url> && git push -u origin main` — remote already configured as `git@github.com-tlp:crisCiobanu/truvis-landing-page.git`; `main` present on remote at commit `383350b`
  - [x] T1.3 Enable branch protection on `main` (require PRs, no direct push) — implemented via the **Rulesets API** (classic protection is still Pro-only for private repos; rulesets are free for public repos). Ruleset id `14946611` "main protection" is `enforcement: active` with rules: `deletion`, `non_fast_forward`, `pull_request` (0 required approvals — solo dev self-merge), `current_user_can_bypass: never`. Required-checks list is empty as specified; T4.7 will add the CI check name after the workflow has run once on the remote
- [x] **T2 — Provision Cloudflare Pages** (AC: 1)
  - [x] T2.1 Create CF Pages project linked to the GitHub repo — `truvis-landing-page` project on Cloudflare Pages, connected to `crisCiobanu/truvis-landing-page` via the `cloudflare-workers-and-pages[bot]` GitHub app. First attempt accidentally created a Workers-with-Static-Assets project via CF's newer auto-config wizard; deleted and recreated as a classic Pages project. The Workers auto-config PR (#2) from the deleted project leaked onto `main` and had to be reverted (PR #4).
  - [x] T2.2 Configure build command `npm run build`, output directory `dist/`, Node version per starter `engines` — the starter has no `engines` field; pinned CF Pages to Node 20 via `NODE_VERSION=20` build-time env var (same version as GitHub Actions CI).
  - [x] T2.3 Configure env vars per environment (`preview`, `production`) with the variable names listed in AC1 — 9 runtime env vars set on both `Production` and `Preview` environments in CF Pages. `LOOPS_API_KEY` and `TURNSTILE_SECRET_KEY` flagged as **Secret** (encrypted). All other values are `<TBD-*>` placeholders owned by downstream stories (3.1, 3.2, 6.5, 7.4). `PUBLIC_SITE_URL` differs per env: `https://truvis.app` for production, `https://truvis-landing-page.pages.dev` for preview. `PLAUSIBLE_DOMAIN` uses `truvis.app` / `test.truvis.app` respectively.
  - [x] T2.4 Verify TLS 1.2+ + HSTS in the CF dashboard (Edge Certificates / SSL/TLS settings) — the `truvis.app` zone is now active in Cloudflare (nameservers `bailey.ns.cloudflare.com`, `john.ns.cloudflare.com` propagated from Porkbun). Zone SSL/TLS settings: **Full (strict)** encryption, **Minimum TLS 1.2**, **TLS 1.3 on**, **Always Use HTTPS on**, **Automatic HTTPS Rewrites on**, **HSTS enabled** with `max-age=31536000` (12 months), **`includeSubDomains` OFF** and **`preload` OFF** (deliberate — Story 7.7 hardens both after subdomain topology is settled). Verified end-to-end against a temporary `test.truvis.app` custom domain attached to the Pages project: `curl -sI https://test.truvis.app/` returns `HTTP/2 200`, `strict-transport-security: max-age=31536000`, TLS 1.3 / `TLS_AES_256_GCM_SHA384` / X25519 / `CN=truvis.app`, and `http://test.truvis.app/` 301s to HTTPS.
  - [x] T2.5 Add a placeholder WAF rate-limiting rule scoped to `/api/v1/blog/*` (e.g., 100 req/min/IP) — Epic 4 / Story 4.9 will refine. Authored as a zone-level WAF rate-limit rule on `truvis.app`: expression `(http.request.uri.path contains "/api/v1/blog/")`, 100 req/1 min, per source IP, block for 10 s, default Cloudflare 429 response. Verified via `curl` burst of 120 requests to `https://test.truvis.app/api/v1/blog/burst-$i` — 35× 404 (first through) + 85× 429 (rate-limited), and a post-burst request returned `HTTP/2 429` with `retry-after: 1`. Because WAF fires before routing, the rule enforces on paths that don't yet exist in the build, exactly as the mobile app integration in Epic 4 will rely on.
  - [x] T2.6 Trigger first production deploy by pushing a no-op commit; verify it succeeds and the live URL serves the starter — first build failed because remote `main` was at the planning-only commit `383350b` (starter commits `69f3a1d` + `e42dbf5` existed only locally). Fixed by pushing those commits via PR #1 (`chore/bootstrap-astro-starter`), which self-merged under the ruleset's 0-required-approvals rule. Merge commit `c950914` rebuilt successfully on CF Pages, serving the Astro starter at `truvis-landing-page.pages.dev`: `HTTP/2 200`, `<title>Astro + shadcn/ui</title>`, `server: cloudflare`, `cf-ray: …-FRA`.
  - [x] T2.7 Open one trivial PR to verify a unique preview URL is generated — verified on PR #3 (the Story 1.2 feature branch). Cloudflare Pages auto-commented two preview URLs: per-deployment `https://f30102f9.truvis-landing-page.pages.dev` (reflecting commit hash) and per-branch alias `https://story-1-2-ci-pages-lighthous.truvis-landing-page.pages.dev`. Both served the Astro starter homepage at `HTTP/2 200`. Note: zone-level HSTS from T2.4 does not apply to `*.pages.dev` (different zone) — Story 8.5 DNS cutover is when real visitors hit the HSTS-protected `truvis.app` domain.
  - [x] T2.8 Dry-run a rollback via the CF Pages dashboard and time it; record < 2 min in README under `## Operations Runbook` — **empirical timing drill deferred at Cristian's discretion.** Main currently has 5 Cloudflare Pages deployments in history (sufficient for a drill), so the test can run any time without additional scaffolding. Cloudflare documents dashboard rollbacks as taking seconds (the deployment pointer is an edge cache flip, not a rebuild); `README.md → Operations Runbook` documents the click-path and a placeholder row `_deferred_` instead of a measured time. NFR38's < 2 min target is not empirically validated yet but the architectural path is in place and can be drilled at any time.
- [x] **T3 — Lighthouse CI config files** (AC: 2)
  - [x] T3.1 Create `lighthouse/lighthouserc.cjs` with the assertion thresholds in AC2 (use `@lhci/cli` config schema; config-as-code, not GUI)
  - [x] T3.2 Create `lighthouse/budget.json` enforcing total initial weight < 500KB (NFR5) and any per-resource limits the dev agent considers reasonable
  - [x] T3.3 Calibrate against the Story 1.1 baseline reports in `lighthouse/baseline/` — if the starter is borderline, set the assertion mode to `error` for the four primary metrics and `warn` for any optional ones
- [x] **T4 — GitHub Actions workflow** (AC: 2)
  - [x] T4.1 Create `.github/workflows/ci.yml` with jobs: `checks` → `lighthouse`
  - [x] T4.2 `checks` job runs `npx astro check`, `npx eslint .`, `npx prettier --check .`, `npx vitest run --passWithNoTests`
  - [x] T4.3 `lighthouse` job runs `npx @lhci/cli@0.14.x autorun` against the production build (`npm run build` → `npm run preview` → LHCI hits the local URL), reads `lighthouse/lighthouserc.cjs`, and uploads HTML reports as workflow artefacts (pinned to `0.14.x` — `@latest` for actions is forbidden per T4.4, and pinning the LHCI version also matches that spirit)
  - [x] T4.4 Pin action versions (e.g., `actions/checkout@v4`, `actions/setup-node@v4`) — never `@latest` for actions
  - [x] T4.5 Use the project's Node version (20 LTS — the starter has no `engines` field, README only requires ≥18.20.8) — `actions/setup-node@v4` with `cache: 'npm'`
  - [x] T4.6 Open a PR that intentionally regresses perf (e.g., add a 1MB image) and verify the PR check **fails** and **blocks merge**; revert — verified on **PR #5** (`test/regression-budget-fail`). First attempt used a 1.2 MB image, which Lighthouse's simulated mobile throttling only partially downloaded (~330 KB out of 1.2 MB), landing total at 437 KB — under the 500 KB gate. Root-cause analysis surfaced a separate bug: the LHCI config was asserting on `performance-budget` which is an informational-only audit (`scoreDisplayMode: notApplicable`), so the assertion was a silent no-op. Fixed in **PR #6** by switching to `resource-summary:total:size` (which has a real numericValue in bytes). Second regression attempt used a 600 KB blocking `<script>` tag (fully downloaded before `onload`) — landed total at 677 KB > 512 KB gate. PR #5 ended with `Lighthouse CI` conclusion `FAILURE` and `mergeStateStatus: BLOCKED` via the required-status-checks rule; PR #5 was closed without merging as designed.
  - [x] T4.7 Add the CI workflow's status check name to GitHub branch protection (T1.3) as a required check — added to ruleset `14946611` via API PUT. New `required_status_checks` rule lists contexts `Lint, type-check, unit tests` and `Lighthouse CI (perf / a11y / SEO budgets)`. `strict_required_status_checks_policy: false` (solo dev — no forced rebase cycle on every PR). Ruleset now enforces 4 rules total: `deletion`, `non_fast_forward`, `pull_request`, `required_status_checks`.
- [x] **T5 — Update README** (AC: 1, 2)
  - [x] T5.1 Add `## Hosting` section: Cloudflare Pages, ≥99.9% uptime SLA, link to dashboard, note about TLS / HSTS / WAF rule
  - [x] T5.2 Add `## Environment Variables` section listing each var, which env it lives in, who owns the value, and which downstream story populates it
  - [x] T5.3 Add `## CI / Quality Gates` section: Lighthouse thresholds, what blocks merge, how to run LHCI locally
  - [x] T5.4 Add `## Operations Runbook` with the rollback dry-run timing from T2.8 (placeholder row marked `pending T2.8` — measured time will be filled in when the dashboard drill runs)

## Dev Notes

### Architecture compliance

- **AR3 / Decision 5a — Cloudflare Pages** [`architecture-truvis-landing-page.md` §"Hosting — Cloudflare Pages" lines 486–499]
- **AR4 / Decision 4g — Lighthouse CI in PR checks** [`architecture-truvis-landing-page.md` §"Performance Budget Enforcement" lines 472–483]
- **Decision 5c — GitHub Actions for checks + CF Pages auto-deploy** [`architecture-truvis-landing-page.md` §"CI/CD" lines 515–522]
- **Decision 5d — Three environments (`local` / `preview` / `production`) and env var inventory** [`architecture-truvis-landing-page.md` §"Environment Configuration" lines 524–531]
- NFRs gated by this story: NFR1, NFR3, NFR5, NFR6, NFR10, NFR14, NFR25, NFR33, NFR38, NFR39

### Critical do-not-do list

- **Do NOT** put real secrets in `ci.yml`. CF Pages env vars are the source of truth for `preview` / `production`. CI uses placeholder values where needed (Lighthouse only needs the public URL and the build output).
- **Do NOT** loosen any Lighthouse threshold to make CI pass. If the baseline is below the threshold, that is a Story 1.1 acceptance failure to fix first.
- **Do NOT** skip branch protection. The whole point of this story is that the gate cannot be bypassed.

### Testing requirements

The "tests" for this story are operational:

1. A trivial PR generates a unique preview URL
2. A deliberate perf-regressing PR fails the CI check and is blocked from merge
3. A dashboard rollback completes in under 2 minutes

### Project Structure Notes

New files in this story:

```
.github/workflows/ci.yml
lighthouse/lighthouserc.cjs
lighthouse/budget.json
```

`lighthouse/baseline/` already exists from Story 1.1.

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 1.2" lines 596–618]
- Architecture: hosting [`architecture-truvis-landing-page.md` lines 486–499]
- Architecture: CI/CD [`architecture-truvis-landing-page.md` lines 515–522]
- Architecture: env config [`architecture-truvis-landing-page.md` lines 524–531]
- Architecture: perf budget enforcement [`architecture-truvis-landing-page.md` lines 472–483]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context) via BMad `dev-story` workflow.

### Debug Log References

This story landed across seven PRs (#1 bootstrap, #2 zombie revert via #4, #3 Story 1.2 feature, #5 regression drill, #6 LHCI bugfix, #7 prettierignore fix) and surfaced several real bugs in the starter / tooling chain. Notes on each:

- **Prettier initially flagged 281 files across the repo**, including `_bmad/**`, `_bmad-output/**`, `lighthouse/baseline/**`, `CLAUDE.md`, `truvis-home-screen-refined.html`, `.devcontainer/devcontainer.json`, and four starter source files. Resolved by adding a tight `.prettierignore` for vendored / planning / artefact paths, and formatting the four source files (`src/components/ui/{badge,button,sheet}.tsx`, `src/layouts/TextLayout.astro`) in place. Later also had to add `public/` to `.prettierignore` (PR #7) after the T4.6 regression probe dropped a binary file there.

- **ESLint 9.39.x refuses legacy `.eslintrc.json`.** Starter shipped only `.eslintrc.json`, so `npm run lint` was broken out-of-the-box. Migrated to flat config (`eslint.config.js`) with `eslint:recommended` + `@typescript-eslint/recommended` + `eslint-plugin-astro/flat/recommended`. Replaced `eslint . --ext .ts,.tsx,.astro` with `eslint .` in both `package.json` and `.github/workflows/ci.yml` (flat config auto-discovers extensions; `--ext` was removed in ESLint 9). Disabled `no-undef` / `no-redeclare` / `no-unused-vars` on TS files (TypeScript owns that territory). Story 1.7 will expand the ruleset with project-specific conventions. Deleted `.eslintrc.json`.

- **Remote `main` only had the planning-artifact commit.** Story 1.1's starter commits (`69f3a1d`, `e42dbf5`) existed locally but were never pushed — the first CF Pages build failed with `ENOENT package.json`. Resolved via the PR flow (PR #1 `chore/bootstrap-astro-starter`) because the ruleset from T1.3 already blocked direct push.

- **Cloudflare "Create → Pages" flow silently routed into Workers-with-Static-Assets** on the first attempt — the URL format `*.workers.dev` revealed it. Deleted that project and recreated a classic Pages project. The Workers auto-config PR (#2) that was opened by `cloudflare-workers-and-pages[bot]` at project-creation time remained on GitHub and was accidentally merged later, putting `astro.config.mjs`, `wrangler.jsonc`, `@astrojs/cloudflare`, and `wrangler` on `main`. Reverted via PR #4 — this restored `main` to the pure-static Pages deployment model defined by architecture decision 5a.

- **Lighthouse scoring drift — original blocking issue, resolved.** The Story 1.1 baseline used `lighthouse@13.1.0` and showed mobile Perf 98. `@lhci/cli@0.14.x` bundles `lighthouse@12.1.0` and scored the same starter at 0.71–0.72 — below the 0.90 gate. Root cause was the 391 KB `recharts` bundle pulled in by `<Chart client:load />` in `src/pages/index.astro` under L12's stricter TBT scoring curve. Resolved by removing the `<Chart>` demo (unambiguous starter cruft — Story 2.1 replaces the whole file anyway). After removal, LHCI against Lighthouse 12 reports "All results processed!" and `dist/_astro/` dropped from 724 KB → 340 KB (-53%).

- **LHCI `performance-budget` assertion is a silent no-op.** Discovered during T4.6 regression-PR verification. Lighthouse's `performance-budget` audit has `scoreDisplayMode: notApplicable` — it produces a data structure for humans to read but LHCI's assertion engine cannot flag it as failing, so asserting `'error'` against it lets every budget breach pass. Fixed in PR #6 by switching to `resource-summary:total:size` assertion (which has a real `numericValue` in bytes). Per-resource-type ceilings kept as `warn` for now so a single noisy resource doesn't block a PR while the starter is still in place; Story 6.7 can promote to `error` once real content lands.

- **Lighthouse's simulated mobile throttling only partially downloads large images.** First T4.6 regression attempt used a 1.2 MB image — Lighthouse captured only ~330 KB before the trace ended, total landed at 437 KB (under the 500 KB gate). Replaced with a 600 KB blocking `<script>` tag (scripts must fully download before `onload` event, so they always reach `resource-summary` in full). Total with probe: 677 KB, correctly over the 512 KB assertion.

- **GitHub branch protection (classic API) is Pro-only for private repos; Rulesets API is free for public repos.** The repo started as private on the Free plan — both `/branches/main/protection` and `/rulesets` APIs returned 403. Cristian flipped visibility to public, which unlocked the Rulesets API. Ruleset `14946611` "main protection" was then created via `gh api` with `pull_request`, `non_fast_forward`, `deletion` rules; later updated via API PUT in T4.7 to add `required_status_checks`.

### Completion Notes List

**Summary.** Story 1.2 is complete in all the ways that actually matter for the AC1/AC2 acceptance: Cloudflare Pages is provisioned and auto-deploys `main`, PRs get unique preview URLs, TLS 1.3 + 1-year HSTS is enforced at the edge, a WAF rate-limit rule is live on `/api/v1/blog/*` and verified with a 120-request burst, the GitHub Actions CI workflow enforces all five Lighthouse NFR thresholds plus total-weight budget, the ruleset on `main` requires both CI jobs to pass, and a real regression PR (PR #5) was physically blocked from merge by the combined gate. The only sub-task not empirically validated is T2.8's rollback timing drill — deferred by Cristian, documented in `README.md → Operations Runbook` with the click-path and NFR38 reference.

**Final PR trail on `main`:**

| PR | Purpose | Outcome |
| --- | --- | --- |
| **#1** `chore/bootstrap-astro-starter` | Push local Story 1.1 commits to remote so CF Pages can find a `package.json` | Merged — unblocks CF Pages build |
| **#2** `cloudflare/workers-autoconfig` (bot) | Zombie Workers-with-Assets config from the initial Workers project (deleted) | Merged in error, then reverted |
| **#3** `story/1-2-ci-pages-lighthouse` | Story 1.2 code side — Lighthouse CI configs, GitHub Actions workflow, README ops sections, ESLint 9 flat-config migration, Chart demo removal | Merged — all three checks green |
| **#4** `revert/cloudflare-workers-autoconfig` | Revert of PR #2 | Merged — restores pure-static Pages deployment model |
| **#5** `test/regression-budget-fail` | T4.6 regression drill — 600 KB blocking script pushes total weight over 512 KB | **Closed without merging**, `mergeStateStatus: BLOCKED` — this is the physical proof the gate works |
| **#6** `fix/lighthouse-budget-assertion` | T4.6 root-cause fix — gate on `resource-summary:total:size` instead of the informational-only `performance-budget` audit | Merged — budget gate now actually enforcing |
| **#7** `fix/prettierignore-public` | Permanent `.prettierignore` rule for `public/` raw passthrough assets | Merged — prevents future asset additions from tripping CI |
| **#8** `story/1-2-finalize` | This PR — story file / README / sprint-status finalisation | (this commit) |

**Local validation at final state (post-`<Chart>` removal, post-PR #6 assertion fix, post-PR #7 ignore):**

| Gate | Result |
| --- | --- |
| `npx astro check` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (2 pre-existing warnings in starter `src/hooks/use-toast.ts` and `src/stores/layout.ts`) |
| `npx prettier --check .` | ✅ clean |
| `npm run build` | ✅ 3 pages built, `dist/_astro/` 340 KB |
| `npx --yes @lhci/cli@0.14.x autorun` | ✅ "All results processed!" — all assertions pass |

**Remote verification:**

- CI run on PR #3 merge commit (`ec7cff0`) — ✅ all three checks green.
- CI run on PR #5 (regression probe) — ✅ `checks` green, ❌ `lighthouse` FAILURE on `resource-summary:total:size` 677 KB > 512 KB, `mergeStateStatus: BLOCKED` (proof of gate).
- CI run on PR #6 (lighthouse fix) — ✅ all green.
- CI run on PR #7 (prettierignore fix) — ✅ all green.
- Cloudflare Pages production URL: `https://truvis-landing-page.pages.dev/` returns 200, Astro starter homepage, `server: cloudflare`.
- `https://test.truvis.app/` returns 200, TLS 1.3, HSTS `max-age=31536000`, verified via `curl -sI`.
- WAF rate limit: 120-request burst from single IP → 35× 404 + 85× 429.

**Known follow-ups (not blockers, logged for future stories):**

- **T2.8 rollback drill** — dashboard click-through deferred at Cristian's discretion. Cloudflare documents rollback as a cache-alias flip (seconds, not minutes); NFR38's < 2 min target is architecturally satisfied but has no empirical measurement. Can be exercised any time from the existing deployment history.
- **Story 1.1 leftover working-tree changes** — `src/components/Sidebar.tsx`, `src/config/site.ts`, `src/layouts/Layout.astro`, `_bmad-output/implementation-artifacts/1-1-…md`, `_bmad-output/implementation-artifacts/deferred-work.md` all had uncommitted modifications when this session started. Intentionally not included in any Story 1.2 PR. Still dirty at session end; will be picked up by a separate Story 1.1 cleanup or by Story 1.3's first PR.
- **LHCI `lighthouse@12` vs `@13` version lag** — `@lhci/cli@0.14.x` bundles Lighthouse 12.1.0. Google hasn't shipped a newer LHCI version bundling Lighthouse 13+. The gate works correctly with Lighthouse 12 scoring (verified end-to-end), but Story 6.7's perf re-audit should re-evaluate whether to pin LHCI at 0.14.x or migrate to a direct `lighthouse@13` + assertion script if Google ships it.
- **`astro-island` hydration warnings** — `npx astro check` reports 110 hints, none of them errors. Mostly `ts(6385)` deprecations on `React.ElementRef` in the shadcn primitives. Story 1.7 addresses the shadcn / TypeScript convention pass.
- **`vitest` not yet installed** — CI pulls it via `npx --yes vitest@^2 run --passWithNoTests`. First story that actually writes a unit test (Story 1.7 or Epic 4) will add it as a devDependency.

### File List

**Added**

- `.github/workflows/ci.yml` — GitHub Actions CI workflow, two jobs (`checks` → `lighthouse`), pinned `@v4` actions, Node 20 LTS, npm cache, concurrency-cancel, artefact upload (PR #3).
- `.gitignore` (extended with `.lighthouseci/`) — PR #3.
- `.prettierignore` — excludes `_bmad/`, `_bmad-output/`, `lighthouse/baseline/`, design artefacts, devcontainer JSONC (PR #3) and `public/` raw passthrough (PR #7).
- `eslint.config.js` — ESLint 9 flat config replacing the broken starter `.eslintrc.json` (PR #3).
- `lighthouse/budget.json` — total < 500 KB + per-resource ceilings for NFR5 (PR #3).
- `lighthouse/lighthouserc.cjs` — LHCI config, assertions on Performance/A11y/SEO/LCP/CLS categories (PR #3) plus `resource-summary:total:size` total-weight gate (PR #6).

**Modified**

- `README.md` — added `Hosting`, `Environment Variables`, `CI / Quality Gates`, and `Operations Runbook` sections (PR #3); final session also updates the Operations Runbook row to mark the rollback drill as deferred instead of pending.
- `package.json` — `lint` script: `eslint . --ext .ts,.tsx,.astro` → `eslint .` (PR #3).
- `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/sheet.tsx`, `src/layouts/TextLayout.astro` — prettier reformat only, no logic change (PR #3).
- `src/pages/index.astro` — removed `<Chart client:load />` starter demo and its `@/components/Chart` import; left a placeholder comment pointing at Story 2.1 as the replacement (PR #3).
- `_bmad-output/implementation-artifacts/1-2-...md` — this story file, Dev Agent Record fully populated, task boxes ticked, status flipped to `review`.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — `1-2-…` `ready-for-dev` → `in-progress` (PR #3) → `review` (this PR).

**Deleted**

- `.eslintrc.json` — superseded by `eslint.config.js` (ESLint 9 flat config migration, PR #3).

**Not included in any Story 1.2 PR (pre-session dirty — left for separate handling)**

- `src/components/Sidebar.tsx`, `src/config/site.ts`, `src/layouts/Layout.astro`, `_bmad-output/implementation-artifacts/1-1-...md`, `_bmad-output/implementation-artifacts/deferred-work.md` — all had uncommitted Story 1.1 code-review follow-ups in the working tree when this session started.

### Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2026-04-11 | Initial Story 1.2 implementation session: authored Lighthouse CI config, GitHub Actions workflow, README ops sections, ESLint 9 flat-config migration, `.prettierignore`. Local validation green for static checks; LHCI blocked on `@lhci/cli@0.14.x` bundling `lighthouse@12.1.0` which scored the starter's `<Chart />` demo under 0.90. Paused for Cristian's decision. | Claude Opus 4.6 (dev-story) |
| 2026-04-11 | T1 Cloudflare-side work: GitHub repo flipped public, ruleset `14946611` created via API with `deletion`, `non_fast_forward`, `pull_request` rules. Solo-dev self-merge (0 approvals) enabled. | Claude Opus 4.6 (dev-story) |
| 2026-04-11 | T2.1–T2.5 Cloudflare Pages provisioning: Pages project `truvis-landing-page` connected to GitHub, `NODE_VERSION=20` build env, 9 runtime env var placeholders on production + preview, first build fixed via PR #1 bootstrap. Initial Workers auto-config mistake deleted and reverted via PR #4. `truvis.app` zone activated in CF (nameservers migrated from Porkbun). SSL/TLS Full (strict), TLS 1.2 min, TLS 1.3 on, HSTS max-age=31536000, Always Use HTTPS, verified via `curl` on `test.truvis.app` custom domain. WAF rate-limit rule on `(http.request.uri.path contains "/api/v1/blog/")` at 100/min/IP, verified with 120-req burst (35× 404, 85× 429). | Claude Opus 4.6 (dev-story) |
| 2026-04-11 | Unblocked Lighthouse scoring issue: removed `<Chart client:load />` from `src/pages/index.astro` (391 KB recharts demo). LHCI 12 now scores the starter comfortably above 0.90. PR #3 merged with all three CI checks green (including Lighthouse). Also proved T2.7 — unique preview URLs generated for PR #3. | Claude Opus 4.6 (dev-story) |
| 2026-04-11 | T4.7: added `required_status_checks` rule to ruleset `14946611` via API PUT — `Lint, type-check, unit tests` + `Lighthouse CI (perf / a11y / SEO budgets)` now required before merge. `strict_required_status_checks_policy: false`. | Claude Opus 4.6 (dev-story) |
| 2026-04-11 | T4.6: regression-PR verification surfaced a real bug — the `performance-budget` assertion was a silent no-op because the audit is informational-only. Fix shipped in PR #6 (gate on `resource-summary:total:size` instead). First regression probe (1.2 MB image) didn't trip the gate because Lighthouse's simulated throttling partially downloads images; second probe (600 KB blocking script) correctly landed total at 677 KB > 512 KB and PR #5 ended `mergeStateStatus: BLOCKED`. PR #5 closed without merging as designed. PR #7 added `public/` to `.prettierignore` (raw passthrough, binary-safe). | Claude Opus 4.6 (dev-story) |
| 2026-04-11 | Story finalisation: T2.8 rollback drill deferred at Cristian's discretion (NFR38 architectural path documented but not empirically drilled). All Dev Agent Record sections populated; story status flipped `in-progress` → `review`. | Claude Opus 4.6 (dev-story) |
