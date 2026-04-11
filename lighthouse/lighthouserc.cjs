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
        // Hand the resource-weight budgets to Lighthouse itself at
        // collect time — it produces the `performance-budget` audit,
        // which the `assert` block below then gates on. This is the
        // LHCI-supported way to combine category assertions with a
        // JSON budget file (LHCI rejects `budgetsFile` + `assertions`
        // used together).
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
        // Any breach of `lighthouse/budget.json` (total < 500 KB plus
        // per-resource-type ceilings) fails this audit → fails the PR.
        'performance-budget': 'error',
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
