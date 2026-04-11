# Deferred Work — rolling log

This file aggregates items flagged during code review or dev that are real but not actionable in the current story. Each entry names its origin story and date so future stories can pick them up.

## Deferred from: code review of 1-2-provision-cloudflare-pages-and-ci-cd-with-lighthouse-budget-gates (2026-04-11)

- **`vitest` not in `devDependencies`** — Story 1.7 or first Epic 4 test story to add as a proper devDependency; meanwhile CI uses `npx --yes vitest@^2 --passWithNoTests` which is non-deterministic and silent-green.
- **LHCI audits only `http://127.0.0.1:4321/`** — broaden URL coverage (blog index, article, 404, `/fr`, `/de`) in Story 6.7 perf re-audit.
- **`resource-summary:total:size` ≠ strict "initial page weight"** — conceptual trade-off; re-evaluate methodology in Story 6.7.
- **`.cjs`/`.mjs` files may fall through flat-config Node globals gap** — Story 1.7 convention pass should wire explicit `languageOptions.globals: { ...globals.node }` and verify `lighthouserc.cjs` is actually linted.
- **LHCI `settings.preset` / `formFactor` / `aggregationMethod` not declared** — Story 6.7 should pin these explicitly so threshold behaviour is deterministic across LHCI upgrades.
- **Astro `<script lang="ts">` blocks not covered by `@typescript-eslint` recommended rules** — Story 1.7 lint-convention pass should add an Astro-specific override so TS rules apply inside `.astro` frontmatter/script blocks.
- **`startServerReadyPattern: '4321'` substring-match fragility** — tighten to `http://127\.0\.0\.1:4321` regex next time LHCI tooling is touched.
- **NFR5 wording says "500 KB" but enforcement is 500 KiB (512 000 bytes)** — per decision during 1.2 review, keep the gate and tighten PRD wording to "500 KiB" on the next PRD touch (likely Story 6.7 perf re-audit or Epic 5 content-ops pass).
- **`--max-warnings=0` on `npm run lint`** — starter has 2 pre-existing warnings (`src/hooks/use-toast.ts`, `src/stores/layout.ts`) that must be fixed first; Story 1.7 convention pass should fix the warnings and add `--max-warnings=0` to the lint script in the same commit.
