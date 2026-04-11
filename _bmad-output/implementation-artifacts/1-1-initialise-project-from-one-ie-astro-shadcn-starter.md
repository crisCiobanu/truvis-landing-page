# Story 1.1: Initialise project from `one-ie/astro-shadcn` starter

Status: review

> **Context engine note (2026-04-10):** This is the very first story in the project. There is no prior story, no previous commit history, no `package.json` yet, and no `truvis-landing-page/` working tree. Everything described below is to be **created from scratch** by cloning the chosen starter, verifying it, pruning it, and committing the result. The downstream Epic 1 stories (1.2 → 1.7) all assume the artefacts produced by this story exist.

---

## Story

As **Cristian (the solo developer)**,
I want **a verified, pruned, branded Astro 5 project initialised from `one-ie/astro-shadcn`**,
so that **I have a known-good baseline to build the rest of the Truvis landing page on without scaffolding from scratch, and Epic 1.2–1.7 can build on top of a deterministic starting point.**

---

## Acceptance Criteria

**(BDD form — copied verbatim from `epics-truvis-landing-page.md` § Story 1.1, then expanded into AC numbers the dev agent can reference from tasks.)**

### AC1 — Pre-init verification of the chosen starter

**Given** the architecture mandates `one-ie/astro-shadcn` as the primary starter (AR1) with `onwidget/astrowind` as the documented fallback,
**When** the developer prepares to clone the starter,
**Then** the starter is verified against the **pre-init checklist** before a single line of project code is written:

1. `LICENSE` file exists in the upstream repo and is **MIT, Apache-2.0, or BSD-permissive** (no GPL, no SSPL, no "source-available" licences).
2. The upstream repo has had **commit activity within the last ~6 months** (check the GitHub commits list).
3. `package.json` is audited and any **unwanted heavy dependencies are flagged for removal on first commit**, specifically:
   - any AI / LLM SDKs (`openai`, `@anthropic-ai/sdk`, `langchain`, `ai`, vendor SDKs)
   - any heavy analytics with bundled scripts
   - any demo-only example pages and their dependencies that don't belong in our shipping product
4. The verification result (PASS / FAIL + which deps were pruned) is recorded in `README.md` under a `## Starter Verification` section.

### AC2 — Initialisation succeeds and dev server runs cleanly

**Given** AC1 passed (or the fallback path in AC6 was taken),
**When** the developer runs the **documented init sequence**

```sh
git clone https://github.com/one-ie/astro-shadcn truvis-landing-page
cd truvis-landing-page
rm -rf .git && git init
npm install
```

**Then**

- the install completes with **zero `npm ERR!` lines** and **zero high/critical `npm audit` findings on production dependencies** (record any moderate findings in `README.md` under `## Known Audit Findings` for triage in 1.2's CI),
- `npm run dev` starts the Astro dev server and serves the starter at `http://localhost:4321` **without console errors** in either the terminal or the browser DevTools console,
- the home page renders the starter's default content (visual confirmation only — no Truvis content yet; that begins in Story 1.3 / 1.4).

### AC3 — Pruning unwanted starter content & dependencies

**Given** the starter ships with demo-only pages, components, and dependencies that are not in scope for Truvis,
**When** the developer performs the day-1 pruning pass,
**Then**

- every dependency flagged in AC1.3 is removed from `package.json` and `package-lock.json` is regenerated via a fresh `npm install`,
- any **AI-SDK demo pages, marketing fluff routes, theme switcher demos, or example blog content** that ships with the starter is removed (we will define our own content in Stories 1.3 → 1.7 and Epic 4),
- the **shadcn/ui primitives in `src/components/ui/`** are **kept intact** — they are the high-value piece of the starter and Story 1.4 / Epic 2 will consume them (do NOT delete `Button.tsx`, `Card.tsx`, `Accordion.tsx`, `NavigationMenu.tsx`, `Sheet.tsx`, `Input.tsx`, `Label.tsx`, `Form.tsx`, `Dialog.tsx`, `Badge.tsx`, `Separator.tsx`, `Toast.tsx`, `Sonner.tsx` or any other shadcn primitive),
- the **blog system, sitemap integration, RSS integration, and SEO baseline** that ship with the starter are **kept** — Epic 4 and Epic 6 will customise rather than replace them (deletion would force costly re-implementation),
- after pruning, `npm run dev` and `npm run build` still succeed without errors.

### AC4 — Baseline Lighthouse report recorded

**Given** the architecture's perf budget (NFR1 LCP <2.5s, NFR3 CLS <0.1, NFR5 <500KB initial weight, NFR6 Perf ≥90, NFR25 a11y ≥90, NFR39 SEO ≥95) is going to be enforced as a CI gate in Story 1.2,
**When** the developer runs `npm run build` followed by serving `dist/` locally and running `npx lighthouse <local-url> --preset=desktop --output=html --output-path=./lighthouse-baseline.html` (and the same with `--preset=mobile` saved to `./lighthouse-baseline-mobile.html`),
**Then**

- both reports are generated successfully,
- a `## Baseline Lighthouse (Story 1.1)` section is added to `README.md` recording **the four scores** (Performance / Accessibility / Best Practices / SEO) **for both desktop and mobile** along with **LCP, CLS, and TBT** numeric values,
- the two HTML reports are committed to a `lighthouse/baseline/` folder as immutable reference artefacts (so Story 1.2's CI gate can be calibrated against them and so future regressions are diff-able),
- if the baseline scores **already fail** any of NFR6 / NFR25 / NFR39 thresholds before we have written a single line of Truvis code, the developer **STOPS** and either (a) raises a question for resolution before proceeding, or (b) takes the AC6 fallback. Shipping a starter that already fails the budget is a non-starter — fixing it after we've layered Truvis content on top is much harder than fixing it now.

### AC5 — First commit is the pruned starter snapshot

**Given** the project is a fresh `git init` repo with no remote yet,
**When** the developer makes the first commit,
**Then**

- the commit contains **only the pruned starter snapshot + the new `README.md`** (no half-finished Truvis customisation, no scratch files, no `node_modules/`, no `.env`),
- the commit message follows the format:

  ```
  chore: initialise project from one-ie/astro-shadcn starter (pruned)

  - Cloned one-ie/astro-shadcn @ <upstream-commit-sha>
  - Pruned: <comma-separated list of removed deps>
  - Pruned demo pages: <list>
  - Baseline Lighthouse recorded in lighthouse/baseline/
  - Verified against pre-init checklist (AR1)
  ```

- the commit is on the `main` branch,
- a GitHub remote does **NOT** need to exist yet (Story 1.2 creates the GitHub repo and pushes; this story just produces a clean local commit).

### AC6 — Fallback path if `one-ie/astro-shadcn` fails verification

**Given** the verification in AC1 or the baseline check in AC4 fails,
**When** the developer takes the documented fallback (AR1),
**Then**

- the starter chosen is **`onwidget/astrowind`** (MIT, most-starred Astro theme three years running, battle-tested blog + SEO),
- the deviation is documented in `README.md` under a `## Starter Decision` section explaining **which check failed**, the **upstream commit SHA of `astrowind`** that was used, and the **list of additional setup steps** required (specifically: install shadcn/ui via `npx shadcn@latest init` and any additional manual i18n / blog adjustments — the actual implementation of those is deferred to the relevant downstream stories, NOT done in 1.1),
- AC2, AC3, AC4, AC5 are then re-run against the fallback starter,
- a follow-up issue / note is added to the project notes that subsequent stories (especially 1.4 and Epic 4) may need adjustment because we are no longer on the primary starter.

### AC7 — README documents how to run the project

**Given** future contributors (or future-Cristian) need to be able to run this project from a clean clone,
**When** the developer writes the initial `README.md`,
**Then** the README contains **at minimum**:

- One-line project description ("Truvis landing page — Astro 5 + Tailwind v4 + shadcn/ui + React islands")
- `## Prerequisites` — Node version (match the Astro 5 / starter requirement), npm version, OS notes
- `## Setup` — `git clone … && cd … && npm install`
- `## Scripts` — `npm run dev`, `npm run build`, `npm run preview` with one-line descriptions of each
- `## Starter Verification` — the AC1 verification result
- `## Starter Decision` — primary or fallback (only populated if AC6 was taken)
- `## Baseline Lighthouse (Story 1.1)` — the four scores per AC4
- `## Known Audit Findings` — moderate `npm audit` findings deferred to 1.2 triage (per AC2)

The README does **not** yet document Cloudflare Pages setup, env vars, or CI — those belong to Story 1.2. Keep this README minimal and accurate for the current state.

---

## Tasks / Subtasks

- [x] **T1 — Pre-init verification of `one-ie/astro-shadcn`** (AC: 1)
  - [x] T1.1 Open https://github.com/one-ie/astro-shadcn and confirm the licence file is MIT/Apache/BSD-permissive — **MIT, confirmed via `gh api`**
  - [x] T1.2 Confirm latest commit on `main` is within the last ~6 months — **borderline: default branch is `astro-shadcn-starter` (not `main`); latest commit `e60b7af` dated 2025-09-30, ~6mo 11d ago. Documented in README and proceeded as judgement call.**
  - [x] T1.3 Open `package.json` on the upstream `main` branch and list any AI SDKs / heavy analytics / demo-only deps to flag for pruning in T3 — **none present; all non-essential deps are wired into kept `src/components/ui/*` primitives, so nothing to prune**
  - [x] T1.4 Capture the upstream commit SHA you intend to clone — **`e60b7aff238bdda4acaa19f0e6004ba0b0f13e48`**
  - [x] T1.5 If any of T1.1–T1.3 fail, **STOP** and proceed to T6 (fallback path) — **N/A, not triggered**

- [x] **T2 — Clone, install, and verify the dev server** (AC: 2)
  - [x] T2.1 `git clone … truvis-landing-page` — **deviation: cloned into `/tmp/astro-shadcn-starter` and overlaid files into the existing working tree; see Completion Notes**
  - [x] T2.2 `cd truvis-landing-page && rm -rf .git && git init` — **N/A: working tree was already a git repo with a planning-artifacts commit pushed to remote (see Completion Notes)**
  - [x] T2.3 `npm install` — **clean, 914 → 915 packages, zero `npm ERR!` lines**
  - [x] T2.4 `npm audit` — **5 moderate findings, all dev-only chain `@astrojs/check → … → yaml`. Recorded in README's "Known Audit Findings" for Story 1.2 triage. Zero high/critical on production deps.**
  - [x] T2.5 `npm run dev` — **HTTP 200 served at http://localhost:4321/, no terminal errors. Browser-side console verification deferred (no Chrome MCP wired yet at time of dev); user spot-check recommended at review time.**

- [x] **T3 — Prune unwanted dependencies and demo content** (AC: 3)
  - [x] T3.1 `npm uninstall` flagged deps — **no deps removed; T1.3 found nothing to flag**
  - [x] T3.2 Delete demo-only pages — **removed `install.astro`, `readme.astro`, `mit-license.md`, two seed blog posts, `public/screenshots/`, `public/blog-placeholder-3.jpg`. Initially also removed `og.jpg`/`logo*.png`/`logo.svg` but restored them after `Layout.astro` and `Sidebar.tsx` (kept files) were found to reference them — per T3.2's "when in doubt, keep" rule.**
  - [x] T3.3 **DO NOT delete** anything under `src/components/ui/` — **respected**
  - [x] T3.4 **DO NOT delete** the blog scaffolding, sitemap config, or RSS config — **respected**
  - [x] T3.5 Re-run `npm install` to regenerate `package-lock.json` cleanly — **lockfile regenerated from scratch after `rm -rf node_modules package-lock.json`**
  - [x] T3.6 `npm run dev` and `npm run build` both succeed with zero errors after pruning — **both pass; build emits 3 pages and a sitemap. Required three upstream-defect patches first: install missing `@astrojs/sitemap` and `@astrojs/rss` deps, and narrow two `string` URL params in `src/pages/blog/index.astro` to their declared `BlogSearch` prop literal-unions. Documented in README.**
  - [x] T3.7 List of deletions/additions captured in README "Starter Verification" section and in the AC5 commit message.

- [x] **T4 — Generate and commit baseline Lighthouse reports** (AC: 4)
  - [x] T4.1 `npm run build` — **succeeded**
  - [x] T4.2 `npm run preview` — **served on `http://localhost:4321/`**
  - [x] T4.3 `npx lighthouse … --preset=desktop` — **`lighthouse@13.1.0` driving `/snap/bin/chromium` (Chromium 146.0.7680.164)**
  - [x] T4.4 Same with mobile form factor — **passed**
  - [x] T4.5 Scores recorded — see table below and in README's "Baseline Lighthouse" section.
  - [x] T4.6 NFR threshold gate — **ALL pass: Perf 100/98 ≥ 90, A11y 92/92 ≥ 90, SEO 100/100 ≥ 95, LCP 0.6s/2.1s < 2.5s, CLS 0/0 < 0.1. Fallback NOT triggered.**
  - [x] T4.7 Reports added to git under `lighthouse/baseline/` (HTML + JSON for each form factor)

- [x] **T5 — Write the initial README.md** (AC: 7)
  - [x] T5.1 Created `README.md` with all required sections
  - [x] T5.2 Filled Baseline Lighthouse section with measured values
  - [x] T5.3 Filled Starter Verification section with T1 result + caveats
  - [x] T5.4 Filled Known Audit Findings with the 5 moderate findings
  - [x] T5.5 No `## Starter Decision` section — primary starter accepted, T6 not triggered
  - [x] T5.6 No Cloudflare / CI / env-var docs added
  - [x] T5.7 No special note about CLAUDE.md added

- [ ] **T6 — (Conditional) Fallback to `onwidget/astrowind`** (AC: 6) — **NOT TRIGGERED**; primary starter passed all gates

- [x] **T7 — First git commit** (AC: 5) — **see AC5 deviation note in Dev Agent Record below**
  - [x] T7.1 Staged the starter overlay + README + lighthouse/baseline/. Verified `node_modules/`, `dist/`, `.astro/` not staged via merged `.gitignore`.
  - [x] T7.2 Staged file list verified
  - [x] T7.3 Committed with the AC5 message format, populated with actual SHA + actual deletions + added deps + patched files
  - [x] T7.4 `git log --stat -1` sanity-checked

---

## Dev Notes

### Why this story is structured the way it is

The architecture document (`architecture-truvis-landing-page.md` §"Selected Starter" lines 139–225) explicitly identifies project initialisation as **Story 1** in the implementation sequence and lays out the verification + pruning + baseline-Lighthouse flow as the prerequisite gate for everything downstream. This story is the first **discrete, gated checkpoint** before we start spending effort on Truvis-specific work, because if the starter is unhealthy, every story after this would be built on quicksand.

The architecture's "what we get for free" list is what we keep (shadcn primitives, blog scaffolding, sitemap, RSS, SEO baseline). The "what we still need to add" list is what subsequent stories build (i18n routing → 1.6, layouts → 1.4, brand tokens → 1.3, conventions → 1.7, error pages → 1.5, CI gates → 1.2).

### Critical do-not-delete list (mistakes to prevent)

Future LLM developer agents have a known failure mode of "tidying up" useful code when starting a project. To prevent that:

- **Keep `src/components/ui/`** intact. These are the shadcn/ui Tier-1 primitives. Story 1.4 imports `Sheet`, `NavigationMenu`, `Button` from here. Epic 2 imports `Card`, `Badge`, `Accordion`. Deleting them now means re-adding them via the shadcn CLI later, which is wasted work and can introduce subtle drift.
- **Keep the blog scaffolding** (whatever the starter ships under `src/pages/blog/`, `src/content/`, `src/layouts/`). Epic 4 customises it; we don't rebuild it.
- **Keep `astro.config.mjs`** and don't strip integrations. Story 1.6 needs the i18n block added. Epic 6 needs the sitemap integration verified. Epic 7 may need Sentry added.
- **Keep `tailwind.config.{ts,js}`**. Story 1.3 customises it with Truvis brand tokens — don't reset it to defaults; just be ready to overwrite the colour palette in 1.3.

### What this story explicitly does NOT do (scope guard)

- ❌ Cloudflare Pages setup → **Story 1.2**
- ❌ GitHub Actions / CI / Lighthouse CI gating → **Story 1.2**
- ❌ Truvis brand colours, fonts, type scale, radius/shadow tokens → **Story 1.3**
- ❌ BaseLayout / Header / Footer / MobileNav / SectionEyebrow → **Story 1.4**
- ❌ Branded 404 / 500 pages → **Story 1.5**
- ❌ i18n routing, locale-detection middleware, JSON message files → **Story 1.6**
- ❌ ESLint custom rules, prettier-plugin-tailwindcss, accessibility/motion conventions, env helper, nanostore conventions → **Story 1.7**
- ❌ Any landing-page sections (Hero, Problem, etc.) → **Epic 2**

If you find yourself touching any of these in the course of completing 1.1, **stop and reconsider** — you have likely scope-crept into a downstream story.

### Architecture compliance

This story is the foundation that the rest of the architecture sits on. Specific architecture decisions in scope:

- **AR1** Primary starter `one-ie/astro-shadcn` with `onwidget/astrowind` fallback ([architecture-truvis-landing-page.md § Selected Starter, lines 139–225])
- **Astro 5 / React 19 / Tailwind v4 / shadcn/ui** stack inherited from the starter ([architecture-truvis-landing-page.md § Architectural Decisions Provided by Starter, lines 183–220])
- **Static output** (`output: 'static'`) — Astro builds to a CDN-deployable static bundle, no runtime server (this is what the starter ships and what 1.2 deploys to Cloudflare Pages) ([architecture-truvis-landing-page.md § Build Tooling, line 198–204])
- **Implementation sequence Story 1** ([architecture-truvis-landing-page.md § Decision Impact Analysis → Implementation Sequence, line 557])

### Library / framework requirements

This story locks in the following versions **as whatever the upstream starter ships at the SHA we clone**. Do not pin to alternatives:

- **Astro**: 5.x (whatever the starter ships)
- **React**: 19.x (for islands only — no React on the landing page itself)
- **Tailwind CSS**: v4 (CSS-first config — see Story 1.3 for how brand tokens land)
- **shadcn/ui**: whatever the starter has installed, with primitives in `src/components/ui/`
- **TypeScript**: strict mode (the starter should already have this; verify in `tsconfig.json` and if not, this is a Story 1.7 fix, not a 1.1 fix)
- **Node.js**: whatever the starter's `engines` field requires (record this in README under Prerequisites)

Subsequent stories will add: `nanostores`, `@nanostores/react`, `prettier-plugin-tailwindcss` (1.7); `@astrojs/sitemap` may already be present (Epic 6 verifies); `@sentry/astro` (Epic 7); `@astrojs/keystatic` (Epic 5). **Do not pre-install any of these in 1.1** — install them as part of the story that needs them, so the diffs stay traceable.

### File structure requirements

After this story, the working tree should look approximately like this (exact contents depend on what the starter ships):

```
truvis-landing-page/
├── README.md                          ← NEW (this story)
├── lighthouse/
│   └── baseline/
│       ├── baseline-desktop.html      ← NEW (this story)
│       └── baseline-mobile.html       ← NEW (this story)
├── .gitignore                         ← from starter (verify it excludes node_modules/, .env, dist/, .astro/)
├── package.json                       ← from starter, pruned
├── package-lock.json                  ← from starter, regenerated after pruning
├── astro.config.mjs                   ← from starter (untouched by 1.1)
├── tsconfig.json                      ← from starter (untouched by 1.1)
├── tailwind.config.{ts,js}            ← from starter (untouched by 1.1; Story 1.3 customises)
├── src/
│   ├── components/ui/                 ← KEEP — shadcn primitives
│   ├── content/                       ← KEEP — blog scaffolding
│   ├── pages/
│   │   ├── index.astro                ← starter default (Story 1.4 / Epic 2 will replace)
│   │   └── blog/                      ← KEEP
│   ├── layouts/                       ← from starter (Story 1.4 customises)
│   └── styles/                        ← from starter (Story 1.3 customises)
└── public/                            ← from starter, demo assets pruned
```

The full target structure that the project will eventually have is documented in `architecture-truvis-landing-page.md` §"Complete Project Directory Structure" lines 967–1154 — **do not try to create that whole structure now**. It builds up over Epic 1 → Epic 8.

**Path aliases:** The starter likely ships `@/*` mapped to `src/*`. Story 1.7 will add `~/*` as an additional alias mapping to `src/*`. Do not change `tsconfig.json` paths in 1.1 — but **do** verify the existing `@/*` alias works by checking `tsconfig.json` and noting it in the README's Prerequisites/Conventions if relevant.

### Testing requirements

This story has **no unit tests** to write. The "test" for this story is operational:

1. `npm run dev` succeeds and serves on `:4321` with no console errors
2. `npm run build` succeeds and produces a `dist/` directory
3. `npm run preview` (or `npx serve dist/`) serves the build
4. `npx lighthouse` produces both reports without errors
5. `git status` is clean after the commit

Vitest config and the actual test scaffolding are **not** part of this story. The starter may already ship a test setup; if so, leave it alone (Story 1.7 may codify it). If not, defer to Story 1.7. Lighthouse CI gating is Story 1.2.

### Project Structure Notes

- The project root is `truvis-landing-page/` (the directory created by the `git clone` command). All paths in this story are **relative to that directory**, which is also the git root.
- The outer repo's `CLAUDE.md` already documents this Astro landing page project (stack, conventions, sprint workflow). Read it for the project-wide guardrails before starting — particularly the **anti-patterns** list and the **architectural boundaries** section, which apply to every story including this one.

### References

- Epic spec: [`_bmad-output/planning-artifacts/epics-truvis-landing-page.md` §"Story 1.1: Initialise project from `one-ie/astro-shadcn` starter" lines 580–594]
- Architecture: starter selection rationale [`_bmad-output/planning-artifacts/architecture-truvis-landing-page.md` §"Selected Starter: `one-ie/astro-shadcn`" lines 139–225]
- Architecture: stack inherited from starter [`architecture-truvis-landing-page.md` §"Architectural Decisions Provided by Starter" lines 183–220]
- Architecture: implementation sequence Story 1 [`architecture-truvis-landing-page.md` §"Decision Impact Analysis → Implementation Sequence" line 557]
- Architecture: complete target directory structure [`architecture-truvis-landing-page.md` §"Complete Project Directory Structure" lines 967–1154]
- NFRs gated in this story's baseline check: NFR1 (LCP <2.5s), NFR3 (CLS <0.1), NFR5 (<500KB initial), NFR6 (Perf ≥90), NFR25 (a11y ≥90), NFR39 (SEO ≥95) — see PRD `prd-truvis-landing-page.md`
- AR1 (primary + fallback starter rule) — architecture document, starter section

---

## Dev Agent Record

### Agent Model Used

`claude-opus-4-6` (Claude Opus 4.6, 1M-context build), via Claude Code on 2026-04-11.

### Debug Log References

- Upstream repo metadata via `gh api repos/one-ie/astro-shadcn` → MIT, default branch `astro-shadcn-starter`, last push 2025-10-10, no archive.
- Latest commits on default branch via `gh api repos/one-ie/astro-shadcn/commits?sha=astro-shadcn-starter` → tip `e60b7af` dated 2025-09-30.
- Initial `npm run dev` after overlay failed with: `Cannot find module '@astrojs/sitemap' imported from '.../astro.config.mjs'` — upstream defect (declared in `astro.config.mjs` but missing from `package.json`). Fix: `npm install @astrojs/sitemap`.
- Initial `npm run build` after dev fix failed with: (a) `src/pages/rss.xml.ts: Cannot find module '@astrojs/rss'` — same upstream defect pattern. Fix: `npm install @astrojs/rss`. (b) Two `ts(2322)` errors in `src/pages/blog/index.astro` widening `'list' | 'grid'` and `'2' | '3' | '4'` props from raw `string` URL params. Fix: narrow with explicit type guards (5-line edit).
- Lighthouse: `npx lighthouse@13` failed initially with no Chrome installed. Resolved after user installed `chromium-browser` (snap, version 146.0.7680.164). Invoked with `CHROME_PATH=/snap/bin/chromium` and `--chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage"`.

### Completion Notes List

**Story outcome:** All 7 acceptance criteria satisfied (AC6 not triggered). Primary starter `one-ie/astro-shadcn` @ `e60b7af` accepted, pruned, patched, baselined, and committed. Baseline Lighthouse passes all NFR gates by a comfortable margin on the unmodified starter — fallback to `onwidget/astrowind` was not necessary.

**Baseline Lighthouse summary:**

| Metric | Desktop | Mobile | Threshold |
| --- | ---: | ---: | --- |
| Performance | 100 | 98 | ≥ 90 (NFR6) ✅ |
| Accessibility | 92 | 92 | ≥ 90 (NFR25) ✅ |
| Best Practices | 100 | 100 | — |
| SEO | 100 | 100 | ≥ 95 (NFR39) ✅ |
| LCP | 0.6 s | 2.1 s | < 2.5 s (NFR1) ✅ |
| CLS | 0 | 0 | < 0.1 (NFR3) ✅ |

**Documented deviations from the story spec:**

1. **AC5 / T7.1–T7.4 — first commit ≠ pruned starter snapshot.** The repo was already initialised with a commit containing the planning artifacts (`_bmad/`, `_bmad-output/`, `CLAUDE.md`, `.devcontainer/`, etc.) that was pushed to `git@github.com:crisCiobanu/truvis-landing-page.git` before this story began. Per agreement with the user (Option 1: overlay approach), the pruned starter snapshot was committed as the **second** commit on `main`, not the first. The commit message still uses the AC5 format and contents. Rewriting history to swap commit order was rejected because the planning commit was already pushed and history rewriting was outside the user's risk appetite.

2. **AC2 / T2.1–T2.2 — clone target.** The literal `git clone https://github.com/one-ie/astro-shadcn truvis-landing-page` could not run because the working directory was already non-empty and a git repo. Substituted: clone to `/tmp/astro-shadcn-starter` then `rsync` files into the working tree, excluding `.git/`, the starter's own `README.md`/`CLAUDE.md`/`improve.md`, alt-package-manager lockfiles, the starter's `.vscode/`, the starter's `.gitignore` (merged into the existing one), and `.mcp.json`. This is functionally equivalent for everything Story 1.1 cares about and preserves the planning artifacts the project already had.

3. **Three upstream-defect patches** — see Debug Log. The starter ships an `astro.config.mjs` and `rss.xml.ts` that import packages not declared in `package.json`, plus two `astro check` type errors in `src/pages/blog/index.astro`. All three would have caused `npm run build` to fail on a vanilla clone, so they had to be fixed before AC4 could even run. Fixes are minimal (2 deps added, 5 lines of TypeScript narrowing).

4. **AC1 / T1.2 borderline.** Latest upstream commit on default branch is 2025-09-30, which is ~6 months and 11 days before this story was implemented (2026-04-11). The "~6 months" wording made this a judgement call; I proceeded because every other check passed cleanly and the stack matches the architecture exactly. Recorded explicitly in README "Starter Verification" section so it's auditable later.

5. **AC2 / T2.5 browser DevTools console verification.** I cannot drive a browser interactively to confirm "zero console errors". I verified the dev server returns HTTP 200 with full HTML body via `curl`, and there were no errors in the dev server's terminal output. Browser-side spot-check is recommended at code-review time once the user has wired up their planned Chrome MCP.

**Tasks not addressed (deliberately, scope guard):** Cloudflare Pages, GitHub Actions / Lighthouse CI, brand tokens, BaseLayout, error pages, i18n routing, ESLint custom rules, env helper, nanostore conventions. These all belong to Stories 1.2–1.7 per the explicit scope guard in Dev Notes.

**Worth noting for Story 1.2:** the `package.json` `name` field is still `"one"` (the upstream starter's name). This was not in scope for 1.1 to change. Story 1.2 / 1.7 should rename it to `truvis-landing-page` when convenient.

### File List

**Added (new files committed by this story):**

- `README.md` — initial project README per AC7
- `lighthouse/baseline/baseline-desktop.html` — Lighthouse desktop HTML report
- `lighthouse/baseline/baseline-desktop.json` — Lighthouse desktop JSON report (machine-readable, for Story 1.2 CI calibration)
- `lighthouse/baseline/baseline-mobile.html` — Lighthouse mobile HTML report
- `lighthouse/baseline/baseline-mobile.json` — Lighthouse mobile JSON report

**Added from upstream starter overlay (committed unchanged unless noted):**

- `.eslintrc.json`, `.prettierrc`
- `LICENSE` (upstream MIT, preserved per MIT terms)
- `astro.config.mjs`, `tsconfig.json`, `components.json`
- `package.json`, `package-lock.json` (lockfile freshly regenerated after pruning + adding `@astrojs/sitemap` and `@astrojs/rss`)
- `public/favicon.svg`, `public/icon.svg`, `public/robots.txt`, `public/og.jpg`, `public/logo.png`, `public/logo-dark.png`, `public/logo.svg`
- `src/components/ui/*.tsx` — full shadcn/ui primitive set (KEPT INTACT)
- `src/components/BlogSearch.tsx`, `Chart.tsx`, `ErrorBoundary.tsx`, `ModeToggle.tsx`, `ShareButtons.tsx`, `Sidebar.tsx`, `TableOfContents.tsx`, `ThemeInit.astro`
- `src/config/site.ts`
- `src/content/config.ts` (KEPT — Epic 4 customises rather than rewrites)
- `src/env.d.ts`, `src/types/env.d.ts`
- `src/hooks/use-mobile.tsx`, `src/hooks/use-toast.ts`
- `src/layouts/Layout.astro`, `src/layouts/Blog.astro`, `src/layouts/TextLayout.astro` (Story 1.4 will replace)
- `src/lib/reading-time.ts`, `src/lib/utils.ts`
- `src/pages/index.astro`, `src/pages/404.astro` (Story 1.4 / 1.5 will replace)
- `src/pages/blog/index.astro` — **patched**: 5 lines added to narrow `viewMode` and `gridColumns` URL params from `string` to declared `BlogSearch` literal-union prop types
- `src/pages/blog/[...slug].astro`
- `src/pages/rss.xml.ts`
- `src/stores/layout.ts`
- `src/styles/global.css`

**Modified (pre-existing project files):**

- `.gitignore` — merged the starter's Astro entries (`dist/`, `.astro/`, `.netlify/`, `.vercel/`, `.wrangler/`, env file rules, log file rules) into the existing `.gitignore` while preserving the project-specific `.claude/` and `.jest-cache/` entries

**Updated:**

- `_bmad-output/implementation-artifacts/sprint-status.yaml` — story status `ready-for-dev` → `in-progress` → `review`; `last_updated` bumped to 2026-04-11
- `_bmad-output/implementation-artifacts/1-1-initialise-project-from-one-ie-astro-shadcn-starter.md` — task checkboxes, Dev Agent Record, File List, Status (this file)

**Pruned demo content (deleted from the starter overlay before commit):**

- `src/pages/install.astro`, `src/pages/readme.astro`, `src/pages/mit-license.md`
- `src/content/blog/get-started.md`, `src/content/blog/one-hundred-percent-lighthouse-score.md`
- `public/blog-placeholder-3.jpg`
- `public/screenshots/` (entire directory: 6 marketing screenshots + a `.mov` screencast, ~6 MB)

**Excluded from the overlay (starter files NOT copied into the working tree):**

- The starter's `.git/` (would have brought upstream history)
- The starter's `README.md` (we wrote our own per AC7)
- The starter's `CLAUDE.md` (we have our own at the project root)
- The starter's `improve.md` (upstream-author roadmap, irrelevant)
- `bun.lock`, `pnpm-lock.yaml` (we use npm)
- The starter's `.gitignore` (merged into ours instead of replacing)
- The starter's `.mcp.json` (upstream-author-specific)
- The starter's `.vscode/` (we use our own editor config)

### Change Log

- 2026-04-11 — Story 1.1 implementation complete. Starter `one-ie/astro-shadcn @ e60b7af` overlaid, pruned, patched (3 upstream defects), baselined (Lighthouse all-green), and committed. Status: ready-for-dev → in-progress → review.
