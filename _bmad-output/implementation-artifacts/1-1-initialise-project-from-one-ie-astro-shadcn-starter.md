# Story 1.1: Initialise project from `one-ie/astro-shadcn` starter

Status: ready-for-dev

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

- [ ] **T1 — Pre-init verification of `one-ie/astro-shadcn`** (AC: 1)
  - [ ] T1.1 Open https://github.com/one-ie/astro-shadcn and confirm the licence file is MIT/Apache/BSD-permissive
  - [ ] T1.2 Confirm latest commit on `main` is within the last ~6 months
  - [ ] T1.3 Open `package.json` on the upstream `main` branch and list any AI SDKs / heavy analytics / demo-only deps to flag for pruning in T3
  - [ ] T1.4 Capture the upstream commit SHA you intend to clone (note it for the AC5 commit message)
  - [ ] T1.5 If any of T1.1–T1.3 fail, **STOP** and proceed to T6 (fallback path) instead of continuing this task list

- [ ] **T2 — Clone, install, and verify the dev server** (AC: 2)
  - [ ] T2.1 `git clone https://github.com/one-ie/astro-shadcn truvis-landing-page`
  - [ ] T2.2 `cd truvis-landing-page && rm -rf .git && git init`
  - [ ] T2.3 `npm install` — capture the output. Any `npm ERR!` lines → STOP and investigate; do not paper over with `--force`.
  - [ ] T2.4 `npm audit` — record moderate findings to copy into README later (T7); high/critical findings on production deps → STOP and investigate.
  - [ ] T2.5 `npm run dev` — open `http://localhost:4321`, confirm the starter renders **and** the browser DevTools console has **zero errors** (warnings about React DevTools / HMR are fine). Stop the dev server before continuing.

- [ ] **T3 — Prune unwanted dependencies and demo content** (AC: 3)
  - [ ] T3.1 For each dep flagged in T1.3, run `npm uninstall <dep>` (do NOT hand-edit `package.json` — let npm regenerate the lockfile)
  - [ ] T3.2 Delete demo-only pages from `src/pages/` that are not relevant to Truvis (anything that ships as a "showcase", AI-SDK demo, multi-theme demo, etc.) — be **conservative**: when in doubt, keep, because the Tier-1 shadcn primitives may be referenced from a demo we want to keep until Story 1.4 lands the real layout
  - [ ] T3.3 **DO NOT delete** anything under `src/components/ui/` (shadcn primitives are needed by Story 1.4 onwards)
  - [ ] T3.4 **DO NOT delete** the blog scaffolding, sitemap config, or RSS config (Epic 4 / Epic 6 will customise them)
  - [ ] T3.5 Re-run `npm install` to regenerate `package-lock.json` cleanly
  - [ ] T3.6 Run `npm run dev` and `npm run build` — both must succeed with zero errors after pruning
  - [ ] T3.7 Make a written list of every file/folder you deleted and every dep you removed — you will need this for the AC5 commit message and the README

- [ ] **T4 — Generate and commit baseline Lighthouse reports** (AC: 4)
  - [ ] T4.1 `npm run build` — must succeed
  - [ ] T4.2 `npm run preview` (or `npx serve dist/`) to serve the production build locally on a known port
  - [ ] T4.3 In a second terminal: `npx lighthouse http://localhost:4321 --preset=desktop --output=html --output-path=./lighthouse/baseline/baseline-desktop.html`
  - [ ] T4.4 Same again with `--preset=mobile --output-path=./lighthouse/baseline/baseline-mobile.html`
  - [ ] T4.5 Open both HTML reports in a browser and record Performance / Accessibility / Best Practices / SEO scores plus LCP, CLS, TBT for each
  - [ ] T4.6 If **any** of Perf<90 (NFR6), Accessibility<90 (NFR25), or SEO<95 (NFR39) at this baseline → STOP and either (a) raise the question or (b) take T6 fallback. Do not proceed to T5.
  - [ ] T4.7 Add `lighthouse/baseline/baseline-desktop.html` and `lighthouse/baseline/baseline-mobile.html` to git (these are committed reference artefacts, not gitignored)

- [ ] **T5 — Write the initial README.md** (AC: 7)
  - [ ] T5.1 Create `README.md` at the project root with all sections listed in AC7
  - [ ] T5.2 Fill in the **Baseline Lighthouse** section with the values captured in T4.5
  - [ ] T5.3 Fill in the **Starter Verification** section with the result of T1
  - [ ] T5.4 Fill in the **Known Audit Findings** section with the moderate findings from T2.4 (or "None")
  - [ ] T5.5 Leave **Starter Decision** populated only if T6 fallback was taken; otherwise omit the section or write "Primary starter (`one-ie/astro-shadcn`) used per AR1."
  - [ ] T5.6 Do **NOT** add Cloudflare / CI / env-var docs — those belong to Story 1.2
  - [ ] T5.7 The outer repo's `CLAUDE.md` already describes this Astro landing page project (no longer the mobile app) — no special note needed in README about it

- [ ] **T6 — (Conditional) Fallback to `onwidget/astrowind`** (AC: 6) — only if T1 or T4.6 failed
  - [ ] T6.1 Repeat T1 against `https://github.com/onwidget/astrowind`
  - [ ] T6.2 Re-run T2 with the new clone URL
  - [ ] T6.3 Re-run T3 (pruning will look different — astrowind ships more demo content)
  - [ ] T6.4 Re-run T4 (baseline Lighthouse)
  - [ ] T6.5 Add a `## Starter Decision` section in README explaining which check failed on `one-ie/astro-shadcn` and that astrowind was substituted, with the upstream commit SHA
  - [ ] T6.6 Add a project note that subsequent stories (especially 1.4 BaseLayout/Header/Footer and Epic 4 blog) may need adjustment because shadcn/ui will need to be installed via `npx shadcn@latest init` separately

- [ ] **T7 — First git commit** (AC: 5)
  - [ ] T7.1 `git add .` (verify with `git status` that `node_modules/`, `.env`, `dist/`, `.astro/` are not staged — the starter's `.gitignore` should handle this; if not, fix `.gitignore` first)
  - [ ] T7.2 Verify the staged file list matches expectations (pruned starter + README + lighthouse/baseline/)
  - [ ] T7.3 `git commit` with the message format in AC5, populated with the actual upstream SHA, the actual pruned-deps list, and the actual pruned-pages list
  - [ ] T7.4 `git log --stat -1` — sanity check the commit before declaring done

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

_To be filled in by the dev agent on pickup_

### Debug Log References

_To be filled in by the dev agent_

### Completion Notes List

_To be filled in by the dev agent_

### File List

_To be filled in by the dev agent_
