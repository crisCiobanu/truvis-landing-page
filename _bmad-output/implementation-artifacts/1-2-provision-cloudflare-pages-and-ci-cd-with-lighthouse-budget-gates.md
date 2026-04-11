# Story 1.2: Provision Cloudflare Pages and CI/CD with Lighthouse budget gates

Status: ready-for-dev

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

- [ ] **T1 — Push the Story 1.1 commit to a new GitHub repo** (AC: 1)
  - [ ] T1.1 Create a new GitHub repo (private or public per Cristian's preference) named `truvis-landing-page`
  - [ ] T1.2 `git remote add origin <repo-url> && git push -u origin main`
  - [ ] T1.3 Enable branch protection on `main` (require PRs, no direct push) — leave the required-checks list empty for now; T4 adds the CI check name
- [ ] **T2 — Provision Cloudflare Pages** (AC: 1)
  - [ ] T2.1 Create CF Pages project linked to the GitHub repo
  - [ ] T2.2 Configure build command `npm run build`, output directory `dist/`, Node version per starter `engines`
  - [ ] T2.3 Configure env vars per environment (`preview`, `production`) with the variable names listed in AC1 — use placeholder values like `<TBD-loops>` for secrets we don't have yet
  - [ ] T2.4 Verify TLS 1.2+ + HSTS in the CF dashboard (Edge Certificates / SSL/TLS settings)
  - [ ] T2.5 Add a placeholder WAF rate-limiting rule scoped to `/api/v1/blog/*` (e.g., 100 req/min/IP) — Epic 4 / Story 4.9 will refine
  - [ ] T2.6 Trigger first production deploy by pushing a no-op commit; verify it succeeds and the live URL serves the starter
  - [ ] T2.7 Open one trivial PR to verify a unique preview URL is generated
  - [ ] T2.8 Dry-run a rollback via the CF Pages dashboard and time it; record < 2 min in README under `## Operations Runbook`
- [ ] **T3 — Lighthouse CI config files** (AC: 2)
  - [ ] T3.1 Create `lighthouse/lighthouserc.cjs` with the assertion thresholds in AC2 (use `@lhci/cli` config schema; config-as-code, not GUI)
  - [ ] T3.2 Create `lighthouse/budget.json` enforcing total initial weight < 500KB (NFR5) and any per-resource limits the dev agent considers reasonable
  - [ ] T3.3 Calibrate against the Story 1.1 baseline reports in `lighthouse/baseline/` — if the starter is borderline, set the assertion mode to `error` for the four primary metrics and `warn` for any optional ones
- [ ] **T4 — GitHub Actions workflow** (AC: 2)
  - [ ] T4.1 Create `.github/workflows/ci.yml` with jobs: `setup` → `checks` → `lighthouse`
  - [ ] T4.2 `checks` job runs `npx astro check`, `npx eslint .`, `npx prettier --check .`, `npx vitest run --passWithNoTests`
  - [ ] T4.3 `lighthouse` job runs `npx @lhci/cli@latest autorun` against the production build (`npm run build` → `npm run preview` → LHCI hits the local URL), reads `lighthouse/lighthouserc.cjs`, and uploads HTML reports as workflow artefacts
  - [ ] T4.4 Pin action versions (e.g., `actions/checkout@v4`, `actions/setup-node@v4`) — never `@latest` for actions
  - [ ] T4.5 Use the project's Node version (the same one set in CF Pages, the same one in the starter's `engines`) — cache npm
  - [ ] T4.6 Open a PR that intentionally regresses perf (e.g., add a 1MB image) and verify the PR check **fails** and **blocks merge**; revert
  - [ ] T4.7 Add the CI workflow's status check name to GitHub branch protection (T1.3) as a required check
- [ ] **T5 — Update README** (AC: 1, 2)
  - [ ] T5.1 Add `## Hosting` section: Cloudflare Pages, ≥99.9% uptime SLA, link to dashboard, note about TLS / HSTS / WAF rule
  - [ ] T5.2 Add `## Environment Variables` section listing each var, which env it lives in, who owns the value, and which downstream story populates it
  - [ ] T5.3 Add `## CI / Quality Gates` section: Lighthouse thresholds, what blocks merge, how to run LHCI locally
  - [ ] T5.4 Add `## Operations Runbook` with the rollback dry-run timing from T2.8

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
### Debug Log References
### Completion Notes List
### File List
