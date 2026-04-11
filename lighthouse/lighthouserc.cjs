/**
 * Lighthouse CI configuration — Truvis landing page
 *
 * Enforces the NFR-mapped performance / accessibility / SEO budgets
 * required by Story 1.2 AC2. Any breach fails the PR check in GitHub
 * Actions and blocks merge to `main` (branch protection enforces this).
 *
 * Thresholds:
 *   - Performance  ≥ 0.90  (NFR6)
 *   - Accessibility ≥ 0.90 (NFR25)
 *   - SEO          ≥ 0.95  (NFR39)
 *   - LCP          < 2.5s  (NFR1)
 *   - CLS          < 0.1   (NFR3)
 *   - Total initial weight < 500 KB via ./budget.json (NFR5)
 *
 * Baseline reference (Story 1.1, mobile run):
 *   Perf 98, A11y 92, SEO 100, LCP 2.1s, CLS 0
 * Assertion mode is `error` for all five primary metrics because the
 * baseline margin is tight — this matches the story Dev Notes guidance.
 */

/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      // Build the production bundle then start Astro's preview server;
      // LHCI hits the local URL so results are deterministic per commit.
      startServerCommand: 'npm run preview -- --host 127.0.0.1 --port 4321',
      startServerReadyPattern: '4321',
      url: ['http://127.0.0.1:4321/'],
      numberOfRuns: 3,
      settings: {
        // Default Lighthouse mobile emulation + simulated throttling.
        // Chrome flags are required in GitHub Actions' sandboxed runners.
        chromeFlags: '--no-sandbox --headless=new',
        // Also feed the budget JSON to Lighthouse at collect-time so
        // it produces the (informational) `performance-budget` audit —
        // useful for humans reading the HTML report, even though the
        // hard gates below use `resource-summary:*:size` instead.
        budgetPath: './lighthouse/budget.json',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // Total initial page weight (NFR5). Mirrors the `total` budget
        // in `lighthouse/budget.json` but as an actionable assertion —
        // Lighthouse's `performance-budget` audit is informational-only
        // (scoreDisplayMode: notApplicable), so an LHCI assertion on
        // it is a silent no-op. `resource-summary:total:size` has a
        // real numericValue (in bytes) and is the correct primitive.
        'resource-summary:total:size': ['error', { maxNumericValue: 512000 }],
        // Per-resource-type ceilings matching `lighthouse/budget.json`,
        // in bytes. Set to `warn` for now so a single noisy resource
        // type doesn't block a PR while we're still iterating on the
        // starter weight; Story 6.7 can promote to `error` once the
        // real content is in place.
        'resource-summary:script:size': ['warn', { maxNumericValue: 153600 }], //  150 KB
        'resource-summary:stylesheet:size': [
          'warn',
          { maxNumericValue: 61440 },
        ], // 60 KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 204800 }], // 200 KB
        'resource-summary:font:size': ['warn', { maxNumericValue: 102400 }], // 100 KB
        'resource-summary:document:size': ['warn', { maxNumericValue: 40960 }], // 40 KB
        'resource-summary:third-party:size': [
          'warn',
          { maxNumericValue: 102400 },
        ], // 100 KB
        // Best-practices is tracked but not budget-gated in V1.
        'categories:best-practices': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Free public storage — keeps HTML reports clickable from the PR
      // without needing an LHCI server. Workflow also uploads the raw
      // reports as GitHub Actions artefacts for 14 days.
      target: 'temporary-public-storage',
    },
  },
};
