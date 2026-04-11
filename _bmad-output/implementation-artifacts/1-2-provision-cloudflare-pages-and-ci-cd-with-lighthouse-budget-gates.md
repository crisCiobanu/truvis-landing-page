# Story 1.2: Provision Cloudflare Pages and CI/CD with Lighthouse budget gates

Status: in-progress

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
- [ ] **T2 — Provision Cloudflare Pages** (AC: 1)
  - [ ] T2.1 Create CF Pages project linked to the GitHub repo
  - [ ] T2.2 Configure build command `npm run build`, output directory `dist/`, Node version per starter `engines`
  - [ ] T2.3 Configure env vars per environment (`preview`, `production`) with the variable names listed in AC1 — use placeholder values like `<TBD-loops>` for secrets we don't have yet
  - [ ] T2.4 Verify TLS 1.2+ + HSTS in the CF dashboard (Edge Certificates / SSL/TLS settings)
  - [ ] T2.5 Add a placeholder WAF rate-limiting rule scoped to `/api/v1/blog/*` (e.g., 100 req/min/IP) — Epic 4 / Story 4.9 will refine
  - [ ] T2.6 Trigger first production deploy by pushing a no-op commit; verify it succeeds and the live URL serves the starter
  - [ ] T2.7 Open one trivial PR to verify a unique preview URL is generated
  - [ ] T2.8 Dry-run a rollback via the CF Pages dashboard and time it; record < 2 min in README under `## Operations Runbook`
- [x] **T3 — Lighthouse CI config files** (AC: 2)
  - [x] T3.1 Create `lighthouse/lighthouserc.cjs` with the assertion thresholds in AC2 (use `@lhci/cli` config schema; config-as-code, not GUI)
  - [x] T3.2 Create `lighthouse/budget.json` enforcing total initial weight < 500KB (NFR5) and any per-resource limits the dev agent considers reasonable
  - [x] T3.3 Calibrate against the Story 1.1 baseline reports in `lighthouse/baseline/` — if the starter is borderline, set the assertion mode to `error` for the four primary metrics and `warn` for any optional ones
- [x] **T4 — GitHub Actions workflow** (file created; verification pending T1/T2 external provisioning) (AC: 2)
  - [x] T4.1 Create `.github/workflows/ci.yml` with jobs: `checks` → `lighthouse`
  - [x] T4.2 `checks` job runs `npx astro check`, `npx eslint .`, `npx prettier --check .`, `npx vitest run --passWithNoTests`
  - [x] T4.3 `lighthouse` job runs `npx @lhci/cli@0.14.x autorun` against the production build (`npm run build` → `npm run preview` → LHCI hits the local URL), reads `lighthouse/lighthouserc.cjs`, and uploads HTML reports as workflow artefacts (pinned to `0.14.x` — `@latest` for actions is forbidden per T4.4, and pinning the LHCI version also matches that spirit)
  - [x] T4.4 Pin action versions (e.g., `actions/checkout@v4`, `actions/setup-node@v4`) — never `@latest` for actions
  - [x] T4.5 Use the project's Node version (20 LTS — the starter has no `engines` field, README only requires ≥18.20.8) — `actions/setup-node@v4` with `cache: 'npm'`
  - [ ] T4.6 Open a PR that intentionally regresses perf (e.g., add a 1MB image) and verify the PR check **fails** and **blocks merge**; revert — **blocked on T1 / T2** (needs GitHub + CF Pages provisioned)
  - [ ] T4.7 Add the CI workflow's status check name to GitHub branch protection (T1.3) as a required check — **blocked on T1**
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

- Prettier initially flagged 281 files across the repo, including `_bmad/**`, `_bmad-output/**`, `lighthouse/baseline/**`, `CLAUDE.md`, `truvis-home-screen-refined.html`, `.devcontainer/devcontainer.json`, and four starter source files (`src/components/ui/{badge,button,sheet}.tsx`, `src/layouts/TextLayout.astro`). Resolved by adding a tight `.prettierignore` for vendored / planning / artefact paths, and formatting the four source files in place. Repo now passes `prettier --check .`.
- ESLint 9.39.x refuses legacy `.eslintrc.json`. Starter shipped only `.eslintrc.json`, so `npm run lint` was broken out-of-the-box. Migrated to flat config (`eslint.config.js`), replaced `eslint . --ext .ts,.tsx,.astro` with `eslint .` in both `package.json` and `.github/workflows/ci.yml` (flat config auto-discovers extensions). Kept the rule surface tight — `eslint:recommended`, `@typescript-eslint/recommended`, `eslint-plugin-astro/flat/recommended` — with `no-undef`/`no-redeclare`/`no-unused-vars` disabled on TS files (TypeScript owns that territory). Story 1.7 expands the ruleset with project-specific conventions. Deleted `.eslintrc.json`.
- **Lighthouse scoring discrepancy discovered (unresolved, blocking T4.6 end-to-end verification).** The Story 1.1 baseline reports in `lighthouse/baseline/` were generated with `lighthouse@13.1.0` and show mobile Performance **98**. Running `@lhci/cli@0.14.x autorun` against the same production build returns mobile Performance **0.71–0.72** (median 0.72), below the 0.90 gate. Direct `npx lighthouse@13.1.0 http://127.0.0.1:4321/` on the same preview server confirms Performance **0.95**, LCP **2.4s**, CLS **0**, TBT **160ms** — matching the baseline within run variance. The gap is **tool version drift**: `@lhci/cli@0.14.x` bundles `lighthouse@12.1.0`, and Lighthouse 12 → 13 tightened scoring (notably TBT cost of the 391KB `recharts` bundle pulled in by `src/pages/index.astro`'s `<Chart />` demo island). There is no currently published `@lhci/cli` version that ships Lighthouse 13. Escalated to Cristian (see Completion Notes).

### Completion Notes List

**What landed cleanly in this session:**

- `lighthouse/lighthouserc.cjs` — LHCI config with error-mode assertions on `categories:performance ≥ 0.90`, `categories:accessibility ≥ 0.90`, `categories:seo ≥ 0.95`, `largest-contentful-paint < 2500ms`, `cumulative-layout-shift < 0.1`, and `performance-budget` (which gates on `lighthouse/budget.json`). Best-practices is `warn`-only (no NFR gate). Uses `collect.startServerCommand = npm run preview` and `collect.settings.budgetPath` because LHCI rejects `assert.budgetsFile` + `assert.assertions` used together — this is the supported workaround and the budget file is still the single source of truth for resource-weight ceilings.
- `lighthouse/budget.json` — total < 500 KB plus per-resource ceilings (script 150 KB, stylesheet 60 KB, image 200 KB, font 100 KB, document 40 KB, third-party 100 KB, ≤ 10 third-party requests). These are conservative first-pass numbers calibrated against the Story 1.1 baseline; Story 6.7 can retighten.
- `.github/workflows/ci.yml` — two jobs (`checks` → `lighthouse`), `concurrency` group cancels superseded in-flight runs on the same ref, all actions pinned to `@v4`, Node 20 LTS, `npm ci`. The `lighthouse` job uploads `.lighthouseci/` as an artefact with 14-day retention and also publishes to LHCI temporary public storage so HTML reports are clickable from the PR body.
- `eslint.config.js` — flat config replacing the starter's broken `.eslintrc.json`. `npm run lint` now passes with 0 errors / 2 warnings (both pre-existing starter code in `src/hooks/use-toast.ts` and `src/stores/layout.ts`).
- `.prettierignore` — excludes vendored BMad tooling, planning artefacts, Lighthouse baselines, design artefacts, and devcontainer JSONC. `prettier --check .` passes clean.
- `package.json` — `lint` script switched to `eslint .` (flat-config-native).
- Starter code touched for prettier compliance only (no logic changes): `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/sheet.tsx`, `src/layouts/TextLayout.astro`.
- `README.md` — added the four required sections: `Hosting`, `Environment Variables`, `CI / Quality Gates`, `Operations Runbook`. The rollback-drill timing row is a placeholder marked `pending T2.8` for Cristian to fill in after the real Cloudflare Pages rollback dry-run.
- `.eslintrc.json` — **deleted** (superseded by `eslint.config.js`; ESLint 9 ignores it anyway).

**Local validation status:**

| Gate | Local result |
| --- | --- |
| `npx astro check` | ✅ 0 errors / 0 warnings / 110 hints |
| `npm run lint` | ✅ 0 errors / 2 warnings (pre-existing) |
| `npx prettier --check .` | ✅ all files formatted |
| `npx vitest run --passWithNoTests` | not yet run locally (no vitest installed; CI pulls it via `npx --yes vitest@^2`) |
| `npm run build` | ✅ 3 pages built |
| `npx --yes @lhci/cli@0.14.x autorun` | ❌ **perf 0.72 vs 0.90 gate** — see blocking issue below |
| `npx lighthouse@13.1.0 http://127.0.0.1:4321/` | ✅ perf 0.95, LCP 2.4s, CLS 0, TBT 160ms (matches Story 1.1 baseline) |

**Blocking issue for T4.6 and story sign-off — decision needed from Cristian:**

LHCI 0.14.x bundles Lighthouse 12.1.0. Lighthouse 12 scores the starter landing page 0.71–0.72 on mobile because `src/pages/index.astro` hydrates a 391 KB `recharts` chart (`<Chart />`, a starter demo). Lighthouse 13 scores the same page 0.95. Both numbers are honest; the gap is the TBT cost of recharts under L12's scoring curve.

Story 1.2 T4.3 explicitly prescribes `@lhci/cli`. The story's "Do NOT loosen any Lighthouse threshold to make CI pass" rule stands. Paths forward, in order of least-to-most scope deviation:

1. **Remove the Chart demo from `src/pages/index.astro`.** It's unambiguous starter cruft (the real Truvis hero is built in Story 2.1). Removing it likely pushes L12 perf above 0.90 and keeps LHCI 0.14.x as specified. Marginal scope creep: one file edit. **Recommended.**
2. **Replace `@lhci/cli` with a thin `lighthouse@13` + assertion script.** Honors the Story 1.1 baseline tool, bypasses LHCI's Lighthouse-version lag, but deviates from T4.3's prescribed tool. ~50 lines of Node.
3. **Reopen Story 1.1 for an acceptance-failure retrospective** (baseline was 98 but is not reproducible with the tool chain Story 1.2 was designed to use). Clean audit trail, highest process overhead.

Pausing here rather than picking unilaterally because the decision touches how the CI gate will behave for the next ~seven stories and the fix in Option 1 edits a file that Epic 2 Story 2.1 will rewrite anyway.

**Operational tasks for Cristian (not executable by the dev agent — require Cristian's GitHub + Cloudflare credentials):**

- **T1.1–T1.3** — Create the GitHub repo `truvis-landing-page`, push the local `main`, enable branch protection (require PRs, block direct push; required-check list empty until after T4.7).
- **T2.1–T2.8** — Cloudflare Pages project creation, env var wiring (placeholders OK), TLS 1.2 / HSTS verification, WAF placeholder rule on `/api/v1/blog/*`, first production deploy, preview-URL verification on a trivial PR, and the rollback dry-run (record the measured time in README.md → Operations Runbook → "Last rollback drill" row).
- **T4.6** — After LHCI gate is green on a trivial PR (unblocked by the blocking-issue decision above), open an intentionally regressing PR (add a 1 MB image to `public/`), verify the check fails and merge is blocked, then revert.
- **T4.7** — In GitHub branch protection settings, add the `CI / Lighthouse CI (perf / a11y / SEO budgets)` required check (or whatever name GitHub surfaces once the workflow has run once). The job name is `lighthouse` under workflow `CI` — required-check label will be `CI / Lighthouse CI (perf / a11y / SEO budgets)`.

### File List

**Added**

- `.github/workflows/ci.yml`
- `.prettierignore`
- `eslint.config.js`
- `lighthouse/budget.json`
- `lighthouse/lighthouserc.cjs`

**Modified**

- `README.md` — added `Hosting`, `Environment Variables`, `CI / Quality Gates`, `Operations Runbook` sections.
- `package.json` — `lint` script: `eslint . --ext .ts,.tsx,.astro` → `eslint .` (ESLint 9 flat config drops `--ext`).
- `src/components/ui/badge.tsx` — prettier reformat only (no logic change).
- `src/components/ui/button.tsx` — prettier reformat only (no logic change).
- `src/components/ui/sheet.tsx` — prettier reformat only (no logic change).
- `src/layouts/TextLayout.astro` — prettier reformat only (no logic change).
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — story `1-2-...` marked `in-progress`.

**Deleted**

- `.eslintrc.json` — superseded by `eslint.config.js` (ESLint 9 flat config migration).

### Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2026-04-11 | Story 1.2 implementation session: added Lighthouse CI config (`lighthouserc.cjs` + `budget.json`), GitHub Actions workflow, README operational sections, ESLint flat-config migration, `.prettierignore`. Local validation green for `astro check`, `eslint`, `prettier`, `build`. LHCI gate fails locally due to Lighthouse 12 vs 13 scoring drift on the starter's `<Chart />` demo; blocking issue recorded for Cristian's decision before continuing to T1 / T2 / T4.6 / T4.7 (which also require external provisioning). Status remains `in-progress`. | Claude Opus 4.6 (dev-story) |
