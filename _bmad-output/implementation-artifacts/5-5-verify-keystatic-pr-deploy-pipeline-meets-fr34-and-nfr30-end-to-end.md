# Story 5.5: Verify Keystatic PR-deploy pipeline meets FR34 and NFR30 end-to-end

Status: ready-for-dev

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **Cristian**,
I want **a documented, dated verification that editing content in Keystatic actually triggers a PR, triggers a rebuild, and deploys the change to the live preview environment in under five minutes**,
so that **I know the content-operations loop is ready for launch day and the <5 minute SLA is not a theoretical claim**.

## Context & scope

This is the **fifth and final story of Epic 5** ("Content Operations -- CMS, Phase Toggle & Rebuild Pipeline"). It is a **verification-only story** -- no new application code is written. It is a manual end-to-end acceptance test of the content operations pipeline built across Stories 5.1--5.4.

The deliverable is a comprehensive "Epic 5 Verification" section in `docs/launch-checklist.md` containing:
- A step-by-step verification procedure with timing measurement instructions
- Helper commands for sitemap and deploy verification
- Placeholder templates for Cristian to fill in during two manual verification runs
- Pass/fail criteria mapped to NFR30 thresholds

### What the dev agent does vs what Cristian does manually

**Dev agent creates:**
- The verification procedure, templates, and helper commands in `docs/launch-checklist.md`
- A reusable verification script at `scripts/verify-deploy-timing.sh` with curl commands and timing helpers
- Clear instructions for each manual step

**Cristian performs manually (after the dev agent's work is merged):**
- Logging into `/keystatic` on the preview environment
- Editing `siteContent.hero.headline`, clicking Publish
- Merging the auto-created PR via GitHub UI
- Observing and recording timing for each step
- Filling in the templates with actual measurements
- Reverting the verification changes

### Scope boundaries

- **In scope:** Documentation of verification procedure, timing templates, helper scripts, pass/fail criteria, sitemap verification commands, `docs/launch-checklist.md` update.
- **Out of scope:** Any application code changes. Fixing pipeline issues (those become follow-up stories if discovered). Keystatic or Cloudflare configuration (done in Stories 5.2 and earlier epics).

## Acceptance Criteria

### AC1 -- Verification performed on preview environment

**Given** FR34 requires any CMS change to trigger an automated rebuild + deploy and NFR30 sets the budget at <5 minutes (with agreed target of <3 minutes),
**When** I perform the verification,
**Then**

- the verification is performed against the Cloudflare Pages `preview` environment (never directly against `production`),
- the verification is run **twice** on different days to surface any intermittent CI or deployment latency.

### AC2 -- Full pipeline walkthrough timed and recorded

**Given** the loop is what needs verifying,
**When** I walk through the verification script,
**Then** the following sequence is executed and each step is timed and recorded in `docs/launch-checklist.md` under "Epic 5 verification":

1. Cristian logs into `/keystatic` on the preview environment using the GitHub OAuth flow from Story 5.2,
2. Cristian edits the `siteContent.hero.headline` field to a unique verification string (e.g., `"Verification run 2026-04-22T14:30 -- ignore"`),
3. Cristian clicks "Publish" in Keystatic,
4. A new branch and PR are automatically opened in the `truvis-landing-page` GitHub repo; the PR URL and time are recorded,
5. Cristian merges the PR via the GitHub UI; the merge time is recorded,
6. The Cloudflare Pages auto-deploy starts; the deploy start time is recorded,
7. The deploy completes and the preview URL's hero headline reflects the new verification string; the deploy end time is recorded,
8. The total elapsed time from Step 3 ("Publish" click) to Step 7 (verified on live preview) is computed and recorded.

### AC3 -- Timing thresholds enforced

**Given** NFR30 sets the hard budget at <5 minutes and target at <3 minutes,
**When** the total elapsed time is measured,
**Then**

- if total < 3 minutes: **pass, on-target** -- record the time and the story is complete,
- if 3 minutes <= total < 5 minutes: **pass, but above target** -- record the time and file a follow-up optimisation task (likely the Astro build time or the Lighthouse CI step),
- if total >= 5 minutes: **fail** -- the story is **not** complete until the cause is identified and resolved; common causes to check: Lighthouse CI cold-start latency, Astro build-time regression, content collection size growth, Cloudflare Pages deployment latency.

### AC4 -- Sitemap regeneration verified

**Given** FR34 also requires the sitemap to regenerate on every build,
**When** I verify the rebuild,
**Then**

- the post-deploy smoke check includes a `curl -I https://<preview-url>/sitemap-index.xml` confirming the file exists and is served with fresh `Last-Modified` / `ETag` headers,
- a `docs/launch-checklist.md` note confirms the sitemap's timestamp updated after the content-change deploy.

### AC5 -- Rollback path verified

**Given** rollback is also a content-operations concern,
**When** I verify the rollback path,
**Then**

- a second verification run edits `siteContent.hero.headline` back to the original value via Keystatic,
- the same <5 min budget applies to the rollback deploy,
- the entire round-trip (forward change + rollback) is completed in <10 minutes and recorded in the launch checklist.

### AC6 -- Documentation complete and environment clean

**Given** this is a verification-only story with no new code,
**When** the story is complete,
**Then**

- `docs/launch-checklist.md` contains a dated "Epic 5 verification" section with all recorded timings, PR URLs, deploy URLs, and any observed issues,
- any issues surfaced are either fixed in a follow-up story (if non-blocking) or hotfixed before the story is marked complete (if blocking),
- the verification PR and any ancillary verification-string commits are reverted or garbage-collected so the preview environment is clean at the story's end.

## Tasks / Subtasks

- [ ] **Task 1 -- Add "Epic 5 Verification" section to `docs/launch-checklist.md`** (AC: 1, 2, 3, 4, 5, 6)
  - [ ] T1.1 Open `docs/launch-checklist.md` and add a new `## Epic 5 Verification -- Content Operations Pipeline` section after the existing "Pre-Launch Verification" section
  - [ ] T1.2 Add an introductory paragraph explaining: this section documents the end-to-end verification of FR34 (CMS change triggers automated rebuild + deploy) and NFR30 (<5 min publish-to-live SLA), run against the Cloudflare Pages preview environment
  - [ ] T1.3 Add a "Prerequisites" checklist:
    - Story 5.1 complete (Content Collections with schemas and seeds)
    - Story 5.2 complete (Keystatic admin UI with GitHub OAuth)
    - Story 5.3 complete (`lib/launch-phase.ts` wired)
    - Story 5.4 complete (section components reading from Content Collections)
    - `KEYSTATIC_GITHUB_CLIENT_ID` and `KEYSTATIC_GITHUB_CLIENT_SECRET` set in CF Pages env vars
    - Preview environment deployed and accessible
  - [ ] T1.4 Add "Verification Procedure" with numbered steps matching AC2 (steps 1--8), each with a `Time:` placeholder for Cristian to fill in
  - [ ] T1.5 Add "Pass/Fail Criteria" subsection with the three-tier thresholds from AC3 (<3 min = on-target, 3--5 min = pass with follow-up, >=5 min = fail)
  - [ ] T1.6 Add "Sitemap Verification" subsection (AC4) with the exact curl command template: `curl -sI https://<preview-url>/sitemap-index.xml | grep -iE '(HTTP|last-modified|etag)'`
  - [ ] T1.7 Add "Rollback Verification" subsection (AC5) explaining the second run to revert the headline back, with timing placeholders and the <10 min round-trip budget
  - [ ] T1.8 Add "Run 1" and "Run 2" recording templates, each containing:
    - Date
    - Preview URL
    - Verification string used
    - Original headline value (to restore later)
    - Step-by-step timing table (Step | Action | Timestamp | Elapsed)
    - PR URL
    - Deploy URL
    - Sitemap curl output
    - Total elapsed time
    - Result: pass (on-target) / pass (above target) / fail
    - Rollback timing (forward + rollback total)
    - Issues observed
  - [ ] T1.9 Add "Cleanup" subsection (AC6) with checklist:
    - [ ] Verification string reverted to original headline
    - [ ] Verification branches deleted
    - [ ] Preview environment shows original content
    - [ ] Any follow-up stories filed (if timing was 3--5 min range)

- [ ] **Task 2 -- Create helper script `scripts/verify-deploy-timing.sh`** (AC: 2, 4)
  - [ ] T2.1 Create `scripts/` directory if it does not exist
  - [ ] T2.2 Write a bash script that accepts a preview URL as argument
  - [ ] T2.3 Include a `check_sitemap` function that runs `curl -sI "$URL/sitemap-index.xml"` and extracts HTTP status, `Last-Modified`, and `ETag` headers
  - [ ] T2.4 Include a `check_headline` function that runs `curl -s "$URL" | grep -o '<h1[^>]*>.*</h1>'` to extract the hero headline from the live page (or a suitable CSS selector grep)
  - [ ] T2.5 Include a `watch_deploy` function that polls the headline every 10 seconds and prints the elapsed time when the expected string appears (with a 10-minute timeout)
  - [ ] T2.6 Add usage instructions in a `--help` flag and as comments at the top of the script
  - [ ] T2.7 Make the script executable (`chmod +x`)

- [ ] **Task 3 -- Add helper commands reference to launch checklist** (AC: 2, 4)
  - [ ] T3.1 In the "Epic 5 Verification" section, add a "Helper Commands" subsection with:
    - The `scripts/verify-deploy-timing.sh` usage
    - `gh pr list --repo crisCiobanu/truvis-landing-page --state open` to check for Keystatic-created PRs
    - `gh pr view <PR_NUMBER> --repo crisCiobanu/truvis-landing-page` to inspect PR details
    - `gh run list --repo crisCiobanu/truvis-landing-page --branch main --limit 5` to check CI/deploy status after merge
    - `curl -sI https://<preview-url>/sitemap-index.xml | grep -iE '(HTTP|last-modified|etag)'` for sitemap verification
    - `curl -s https://<preview-url>/ | grep -o '<h1[^>]*>.*</h1>'` to check headline on live page

- [ ] **Task 4 -- Verify no application code changes needed** (AC: 6)
  - [ ] T4.1 Confirm this story creates/modifies only documentation and scripts -- no changes under `src/`
  - [ ] T4.2 Run `npx prettier --check docs/launch-checklist.md` to ensure formatting is clean
  - [ ] T4.3 If the helper script uses shellcheck-compatible patterns, run `shellcheck scripts/verify-deploy-timing.sh` (optional, best-effort)

## Dev Notes

### Implementation approach

This is a **documentation and tooling** story, not a code story. The dev agent's job is to prepare everything Cristian needs to perform two manual verification runs efficiently:

1. **`docs/launch-checklist.md`** gets a comprehensive new section with step-by-step instructions, timing templates, pass/fail criteria, and cleanup checklists. The templates are designed so Cristian can fill them in during the actual runs without having to think about what to record -- every field is pre-defined.

2. **`scripts/verify-deploy-timing.sh`** is a lightweight bash helper that automates the repetitive parts: checking sitemap headers, extracting the headline from the live page, and polling for deploy completion. It does NOT automate the Keystatic login, content editing, or PR merging -- those are inherently manual steps that constitute the verification.

3. The verification procedure explicitly targets the **preview environment**, never production. Cloudflare Pages creates a unique preview URL for every PR merge to `main` -- but for this verification, we care about the deploy triggered by merging the Keystatic-created PR.

### Key timing breakdown (expected)

The end-to-end pipeline consists of these segments:
- **Keystatic publish -> PR created**: Near-instant (Keystatic creates the branch and PR via GitHub API)
- **PR merge -> CI starts**: ~30s (GitHub webhook to Cloudflare Pages)
- **CI build** (the main variable): Astro build + Lighthouse CI = typically 2--4 min depending on CI runner cold-start
- **Cloudflare Pages deploy**: ~30s after build artifact is ready

The CI workflow (`.github/workflows/ci.yml`) has two sequential jobs: `checks` (lint, type-check, tests) and `lighthouse` (build + Lighthouse). The Cloudflare Pages deploy is separate from CI -- it triggers on push to `main` and runs its own build. The deploy timing depends on the CF Pages build, not the GitHub Actions CI.

### Sitemap verification details

Astro generates `sitemap-index.xml` via `@astrojs/sitemap`. After a content-only change (no new pages), the sitemap content may not change, but the `Last-Modified` header from Cloudflare should reflect the new deploy time. If Cloudflare serves cached headers, fall back to checking the deploy timestamp in the Cloudflare Pages dashboard.

### Potential issues to watch for

- **Keystatic GitHub mode quirks**: The Keystatic admin in `github` mode creates branches with a `keystatic/` prefix. If branch protection rules block pushes, the PR creation will fail.
- **CI blocking merge**: If CI checks are required on the Keystatic-created PR, the total time includes CI run time on the feature branch + deploy time after merge. This could push past the 5-min budget.
- **Cloudflare Pages build cache**: First deploy after a content-only change may be slower if the build cache expired. The two-run approach (AC1) helps surface this.

### Dependencies

- **Story 5.1**: Content Collections created (`faq`, `testimonials`, `stats`, `siteContent`) with schemas, seeds, and `lib/content.ts` helpers
- **Story 5.2**: Keystatic admin UI configured with GitHub OAuth -- Cristian must be able to log in at `/keystatic` on preview
- **Story 5.3**: `lib/launch-phase.ts` with `LAUNCH_PHASE` env var wired; CI matrix build for both phases
- **Story 5.4**: All section components reading from Content Collections instead of i18n placeholders
- **GitHub OAuth App**: Must be registered and `KEYSTATIC_GITHUB_CLIENT_ID` + `KEYSTATIC_GITHUB_CLIENT_SECRET` set in Cloudflare Pages env vars
- **Cloudflare Pages**: Preview environment must be deployed and accessible

### Existing state of `docs/launch-checklist.md`

The file exists with three sections:
- "Drip Series Content" -- 5 placeholder emails to be authored in Loops
- "Unsubscribe Handling" -- Loops-provided unsubscribe mechanism
- "Pre-Launch Verification" -- 8 checklist items (Stories 3.7, 8.4--8.7)

This story adds a new "Epic 5 Verification" section after "Pre-Launch Verification".

### Architecture compliance

- **FR34**: Content change triggers automated rebuild + deploy -- this story verifies it
- **NFR30**: Content publish -> rebuild + deploy <5 min -- this story measures it
- **AR6**: Five Content Collections managed via Keystatic -- this story validates the full loop
- No `src/` files are modified -- documentation and scripts only
- Helper script follows existing project conventions (no dependencies beyond curl and grep)

### References

- [Source: epics-truvis-landing-page.md#Story 5.5 -- Full acceptance criteria]
- [Source: architecture-truvis-landing-page.md#AR6 -- Five Content Collections via Keystatic]
- [Source: architecture-truvis-landing-page.md#FR34 -- CMS change triggers automated rebuild + deploy]
- [Source: prd-truvis-landing-page.md#NFR30 -- Content publish -> rebuild + deploy <5 min]
- [Source: docs/launch-checklist.md -- Existing checklist sections to extend]
- [Source: .github/workflows/ci.yml -- CI pipeline structure (checks + lighthouse jobs)]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
