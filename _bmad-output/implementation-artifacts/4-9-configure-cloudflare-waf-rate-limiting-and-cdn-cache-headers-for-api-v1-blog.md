# Story 4.9: Configure Cloudflare WAF rate limiting and CDN cache headers for `/api/v1/blog/*`

Status: ready-for-dev

## Story

As **Cristian**,
I want **the blog content API endpoints protected by Cloudflare WAF rate limiting and served with explicit CDN cache headers**,
so that **the mobile app carousel has low-latency, resilient, abuse-resistant access to blog content and a runaway client cannot DoS the endpoints**.

## Context & scope

This is the **final story of Epic 4** ("Blog & Cross-Platform Content API") and is purely an **infrastructure/ops story** -- no changes to Astro source code under `src/`. Story 4.8 creates the three static JSON endpoints (`posts.json`, `posts/[slug].json`, `categories.json`) at `/api/v1/blog/*`. This story adds the transport-layer protections: Cloudflare WAF rate limiting (NFR14), explicit CDN cache headers via a Cloudflare Pages Functions middleware (AR9), and a load test to validate NFR18 (100 concurrent requests at <300ms p95).

**Existing codebase state:**
- Story 4.8 creates `src/pages/api/v1/blog/posts.json.ts`, `src/pages/api/v1/blog/posts/[slug].json.ts`, `src/pages/api/v1/blog/categories.json.ts` -- static JSON endpoints served from CDN.
- `CONTRACT.md` exists at the repo root (created in Story 4.1, finalised in Story 4.8) -- this story adds a "Rate limits" section.
- `functions/` directory at project root does **not** exist yet -- this is the Cloudflare Pages Functions directory for edge middleware; it must be created.
- `docs/` directory exists with `accessibility-conventions.md` and `design-conventions.md` -- `docs/integrations/cloudflare-waf.md` must be created (new subdirectory).
- `docs/launch-checklist.md` may or may not exist (Epic 3 scope) -- if it exists, update it; if not, create it with the Blog API verification section.
- No existing WAF configuration in the repo.

**Scope boundaries:**
- **In scope:** Create `functions/api/v1/blog/_middleware.ts` (cache headers), configure Cloudflare WAF rate limit rule (documented), run load test, update `CONTRACT.md`, create `docs/integrations/cloudflare-waf.md`, update or create `docs/launch-checklist.md`.
- **Out of scope:** Any changes to `src/` (Astro source), Story 4.8's `tests/content.test.ts` (contract enforcement is separate from transport enforcement), API key authentication (AR12 -- decided against for V1), Cloudflare Turnstile (Epic 3 scope, `/api/waitlist` only).

## Acceptance Criteria (BDD)

### AC1 -- Cloudflare WAF rate limit rule matches `/api/v1/blog/*` (NFR14)

**Given** NFR14 requires the blog content API to be access-controlled via rate limiting at 100 req/min/IP,
**When** I configure the Cloudflare WAF rule,
**Then**

- a rate limit rule is created that matches requests to `/api/v1/blog/*` (covering `/api/v1/blog/posts.json`, `/api/v1/blog/posts/*`, and `/api/v1/blog/categories.json`),
- the rule rejects requests exceeding 100 requests per minute per client IP with an HTTP 429 response,
- the 429 response includes a `Retry-After` header indicating when the client can retry,
- the rule is scoped to the production zone,
- if Cloudflare Pages supports per-deployment WAF rules for preview zones, apply there too; if not, document the limitation explicitly.

### AC2 -- WAF rule documented in `docs/integrations/cloudflare-waf.md`

**Given** the WAF rule must be auditable and reproducible,
**When** the rule is configured,
**Then**

- `docs/integrations/cloudflare-waf.md` is created with the following sections:
  - **Rule overview**: ID, matcher (`/api/v1/blog/*`), threshold (100 req/min), action (429 block), scope (production zone),
  - **Configuration approach**: whether the rule was created via Cloudflare dashboard or `wrangler` CLI, and the exact steps to reproduce,
  - **Known limitations**: shared-IP scenarios (corporate NAT, conference wifi) may cause false positives; references a V1.1 follow-up to consider an API-key-gated higher-rate lane if abuse reports arrive from legitimate shared-IP environments,
  - **Load test results**: methodology and results (see AC5).

### AC3 -- CDN cache headers on all `/api/v1/blog/*` responses (AR9)

**Given** AR9 specifies the exact cache header policy for the blog API,
**When** I configure cache headers via Cloudflare Pages Functions middleware,
**Then**

- every `/api/v1/blog/*` response carries `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`,
- the headers are set via `functions/api/v1/blog/_middleware.ts` so the policy is version-controlled in the repo, not dashboard-configured,
- the middleware passes through the response body unchanged -- it only adds/overrides headers,
- `curl -I https://<preview-url>/api/v1/blog/posts.json` against a deployed preview confirms the header is present and correct.

### AC4 -- `CONTRACT.md` updated with rate limits section (FR25)

**Given** FR25 requires rate-limited access documentation for authorised consumers,
**When** I update `CONTRACT.md`,
**Then**

- a "Rate limits" section is added stating: "The `/api/v1/blog/*` endpoints are rate-limited to 100 requests per minute per client IP. Clients exceeding this limit receive a 429 response with a `Retry-After` header. The mobile app carousel should implement a 5-minute cache (matching `max-age=300`) to stay comfortably under the limit even on shared networks.",
- the `Retry-After` header behaviour is verified by a manual test: send 101 requests in rapid succession from a single IP and confirm the 101st returns 429 with `Retry-After` present,
- the manual test result is recorded in the Dev Agent Record section of this story.

### AC5 -- Load test validates NFR18 (100 concurrent, <300ms p95)

**Given** NFR18 requires the API to support 100 concurrent requests at <300ms p95,
**When** I run a load test against a deployed preview environment,
**Then**

- the load test uses `wrk`, `k6`, or `hey` (any standard HTTP load testing tool),
- the test hits the preview environment with 100 concurrent workers against `/api/v1/blog/posts.json` for 30 seconds,
- the 95th-percentile response time is <300ms,
- no requests are served by the origin after the initial cache fill -- every response is a CDN cache hit (verified via `cf-cache-status: HIT` header),
- the load test methodology, exact command, and results are recorded in `docs/integrations/cloudflare-waf.md`,
- if the load test fails, the WAF rule threshold is adjusted upward and the test re-run -- this story does not ship until NFR18 is validated.

### AC6 -- `docs/launch-checklist.md` updated with Blog API verification

**Given** observability and launch readiness require documented verification steps,
**When** I update (or create) `docs/launch-checklist.md`,
**Then**

- a "Blog API verification" section is added listing the steps to re-validate before launch:
  1. Confirm WAF rate limit rule is active on the production zone,
  2. Verify `Cache-Control` header via `curl -I` against production URL,
  3. Re-run load test against production to confirm <300ms p95 budget,
  4. Send 101 rapid requests to confirm 429 + `Retry-After` on the 101st.

### AC7 -- No changes to Astro source or contract tests

**Given** this story is transport-only,
**When** all tasks are complete,
**Then**

- no files under `src/` are created or modified,
- Story 4.8's `tests/content.test.ts` is not changed,
- `astro build` still succeeds without regression.

## Tasks / Subtasks

- [ ] **Task 1 -- Create Cloudflare Pages Functions middleware for cache headers** (AC: 3, 7)
  - [ ] T1.1 Create directory structure: `functions/api/v1/blog/`
  - [ ] T1.2 Create `functions/api/v1/blog/_middleware.ts` with the following implementation:
    ```ts
    // functions/api/v1/blog/_middleware.ts
    //
    // Cloudflare Pages Functions middleware that adds explicit CDN cache headers
    // to all /api/v1/blog/* responses. This ensures the static JSON endpoints
    // are cached aggressively at the Cloudflare edge (AR9).
    //
    // Cache policy:
    //   max-age=300        -> browser/mobile-app caches for 5 minutes
    //   s-maxage=86400     -> CDN edge caches for 24 hours
    //   stale-while-revalidate=604800 -> serve stale for up to 7 days while revalidating
    //
    // The body is passed through unchanged -- this middleware is headers-only.

    export const onRequest: PagesFunction = async (context) => {
      const response = await context.next();
      response.headers.set(
        'Cache-Control',
        'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'
      );
      return response;
    };
    ```
  - [ ] T1.3 Verify `functions/` is not in `.gitignore`
  - [ ] T1.4 Verify `astro build` still succeeds (no interference with Astro's own build output)

- [ ] **Task 2 -- Configure Cloudflare WAF rate limit rule** (AC: 1)
  - [ ] T2.1 Determine configuration approach:
    - **Option A (recommended for V1):** Configure via Cloudflare dashboard > Security > WAF > Rate limiting rules. This is the standard approach for Cloudflare Pages projects where `wrangler` does not support WAF rule management via config files.
    - **Option B (if supported):** Use `wrangler` CLI to create the rule programmatically. As of the current Cloudflare Pages feature set, WAF rate limiting rules are zone-level settings managed via the dashboard or API, not via `wrangler.toml` or Pages Functions config. Document whichever approach is used.
  - [ ] T2.2 Create the rate limit rule with these parameters:
    - **Name:** `Blog API rate limit - /api/v1/blog/*`
    - **Expression/Matcher:** `(http.request.uri.path matches "^/api/v1/blog/")`
    - **Threshold:** 100 requests per 60 seconds
    - **Counting:** Per client IP (`ip.src`)
    - **Mitigation action:** Block (HTTP 429)
    - **Mitigation timeout:** 60 seconds (client must wait 60s after hitting the limit)
    - **Response headers:** Include `Retry-After: 60`
  - [ ] T2.3 Verify rule is active: send 101 rapid requests from a single IP using `curl` or a script and confirm the 101st returns HTTP 429 with `Retry-After` header
  - [ ] T2.4 If Cloudflare Pages does not support per-deployment (preview) WAF rules, document this as a known limitation -- WAF rules apply at the zone level (production domain only), not per preview deployment

- [ ] **Task 3 -- Create `docs/integrations/cloudflare-waf.md`** (AC: 2)
  - [ ] T3.1 Create directory `docs/integrations/` if it does not exist
  - [ ] T3.2 Create `docs/integrations/cloudflare-waf.md` with these sections:
    - **Overview**: Purpose of WAF rate limiting for the blog API
    - **Rule configuration**:
      - Rule name, ID (from dashboard after creation), matcher expression, threshold, action, scope
      - Configuration approach used (dashboard vs CLI) with step-by-step reproduction instructions
    - **Cache headers**:
      - Middleware location: `functions/api/v1/blog/_middleware.ts`
      - Header values and their purpose (max-age for client, s-maxage for CDN, stale-while-revalidate for resilience)
    - **Verification commands**:
      ```bash
      # Verify cache headers
      curl -I https://<domain>/api/v1/blog/posts.json

      # Verify rate limiting (run from a single IP)
      for i in $(seq 1 105); do
        echo "Request $i: $(curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/v1/blog/posts.json)"
      done
      ```
    - **Load test results**: methodology, tool, command, and results summary (filled in Task 5)
    - **Known limitations**:
      - Shared-IP scenarios (corporate NAT, conference wifi) may cause legitimate users behind the same IP to collectively hit the 100 req/min limit
      - Preview deployments may not have WAF protection (zone-level limitation)
      - V1.1 follow-up: consider API-key-gated higher-rate lane if abuse reports arrive from legitimate shared-IP environments

- [ ] **Task 4 -- Update `CONTRACT.md` with rate limits section** (AC: 4)
  - [ ] T4.1 Add a "Rate limits" section to `CONTRACT.md` (after the existing endpoint documentation, before any changelog section):
    ```markdown
    ## Rate limits

    The `/api/v1/blog/*` endpoints are rate-limited to **100 requests per minute
    per client IP**. Clients exceeding this limit receive an HTTP `429 Too Many
    Requests` response with a `Retry-After` header indicating when the client
    may retry (in seconds).

    **Mobile app guidance:** The carousel should implement a 5-minute local cache
    (matching the `max-age=300` Cache-Control directive) to stay comfortably under
    the rate limit even on shared networks (e.g., corporate NAT, conference wifi).

    ### Cache-Control headers

    All `/api/v1/blog/*` responses include:

    ```
    Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800
    ```

    | Directive                  | Value   | Purpose                                          |
    |----------------------------|---------|--------------------------------------------------|
    | `max-age`                  | 300     | Client (browser/app) caches for 5 minutes        |
    | `s-maxage`                 | 86400   | CDN edge caches for 24 hours                     |
    | `stale-while-revalidate`   | 604800  | Serve stale content for up to 7 days while async revalidating |
    ```
  - [ ] T4.2 Verify the existing endpoint documentation in `CONTRACT.md` is not modified -- additive only (NFR31)

- [ ] **Task 5 -- Run load test and record results** (AC: 5)
  - [ ] T5.1 Install a load testing tool. Recommended options (choose one available):
    - **`hey`** (Go-based, single binary): `go install github.com/rakyll/hey@latest` or download binary
    - **`wrk`** (C-based): `sudo apt install wrk` or build from source
    - **`k6`** (JS-based): `snap install k6` or download binary
  - [ ] T5.2 Deploy the current branch to a Cloudflare Pages preview environment (push to a PR branch)
  - [ ] T5.3 Warm the CDN cache with a single request:
    ```bash
    curl -I https://<preview-url>/api/v1/blog/posts.json
    # Verify cf-cache-status header transitions from MISS to HIT on second request
    curl -I https://<preview-url>/api/v1/blog/posts.json
    ```
  - [ ] T5.4 Run the load test with 100 concurrent workers for 30 seconds:
    ```bash
    # Using hey:
    hey -n 10000 -c 100 -z 30s https://<preview-url>/api/v1/blog/posts.json

    # Using wrk:
    wrk -t12 -c100 -d30s https://<preview-url>/api/v1/blog/posts.json

    # Using k6 (create a script):
    # k6-blog-load-test.js
    # import http from 'k6/http';
    # import { check } from 'k6';
    # export const options = {
    #   vus: 100,
    #   duration: '30s',
    #   thresholds: { http_req_duration: ['p(95)<300'] },
    # };
    # export default function () {
    #   const res = http.get('https://<preview-url>/api/v1/blog/posts.json');
    #   check(res, { 'status is 200': (r) => r.status === 200 });
    # }
    ```
  - [ ] T5.5 Validate results against NFR18:
    - p95 response time < 300ms
    - All responses (after initial cache fill) show `cf-cache-status: HIT`
    - Zero 5xx errors
  - [ ] T5.6 Record full results in `docs/integrations/cloudflare-waf.md` under the "Load test results" section:
    - Tool used and version
    - Exact command run
    - Summary statistics: total requests, success rate, p50/p95/p99 latency, requests/sec
    - CDN cache hit ratio
    - Date and preview URL tested
  - [ ] T5.7 If p95 > 300ms, investigate:
    - Check if requests are cache misses (origin serving)
    - Check if WAF rate limiting is interfering (adjust threshold upward if needed)
    - Re-run and record updated results
    - Story does NOT ship until NFR18 is validated

- [ ] **Task 6 -- Verify rate limit manually** (AC: 1, 4)
  - [ ] T6.1 Send 101 rapid requests from a single IP to the production or preview endpoint:
    ```bash
    for i in $(seq 1 105); do
      STATUS=$(curl -s -o /dev/null -w '%{http_code}' https://<url>/api/v1/blog/posts.json)
      echo "Request $i: HTTP $STATUS"
      if [ "$STATUS" = "429" ]; then
        echo "Rate limited at request $i"
        # Verify Retry-After header
        curl -I https://<url>/api/v1/blog/posts.json 2>/dev/null | grep -i retry-after
        break
      fi
    done
    ```
  - [ ] T6.2 Confirm the 429 response includes a `Retry-After` header
  - [ ] T6.3 Record the result in the Dev Agent Record section

- [ ] **Task 7 -- Update `docs/launch-checklist.md`** (AC: 6)
  - [ ] T7.1 If `docs/launch-checklist.md` does not exist, create it with a header and the Blog API section
  - [ ] T7.2 Add a "Blog API verification" section with these checklist items:
    ```markdown
    ## Blog API verification

    - [ ] Confirm WAF rate limit rule is active on the production zone (Cloudflare dashboard > Security > WAF)
    - [ ] Verify Cache-Control header: `curl -I https://truvis.app/api/v1/blog/posts.json`
    - [ ] Verify CDN cache hit: second `curl -I` shows `cf-cache-status: HIT`
    - [ ] Re-run load test against production: `hey -n 10000 -c 100 -z 30s https://truvis.app/api/v1/blog/posts.json`
    - [ ] Confirm p95 < 300ms (NFR18 budget)
    - [ ] Verify rate limit: send 101 rapid requests, confirm 429 + Retry-After on excess
    ```

- [ ] **Task 8 -- Final verification** (AC: 7)
  - [ ] T8.1 Run `astro build` -- confirm success, no regressions
  - [ ] T8.2 Confirm no files under `src/` were created or modified
  - [ ] T8.3 Confirm `tests/content.test.ts` (from Story 4.8) is unchanged
  - [ ] T8.4 Review all new/modified files for accidental secrets or credentials

## Dev Notes

### This is an infrastructure/ops story, not a code story

The only version-controlled code artifact is the Cloudflare Pages Functions middleware at `functions/api/v1/blog/_middleware.ts`. The WAF rate limit rule is configured via the Cloudflare dashboard (or API) because Cloudflare Pages does not support WAF rule management via `wrangler.toml` or repo-level config files. The rule configuration is documented in `docs/integrations/cloudflare-waf.md` for auditability and reproducibility.

### Cloudflare Pages Functions middleware pattern

Cloudflare Pages Functions use a file-based routing convention under the `functions/` directory at the project root. A `_middleware.ts` file in a directory applies to all routes under that directory. The middleware intercepts the response from the static asset (the prebuilt JSON file) and adds headers before returning to the client.

```ts
// functions/api/v1/blog/_middleware.ts
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  response.headers.set(
    'Cache-Control',
    'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'
  );
  return response;
};
```

Key points:
- `context.next()` passes the request to the next handler (which serves the static JSON file)
- The middleware only adds/overrides headers -- the response body is untouched
- The `PagesFunction` type is globally available in Cloudflare Pages Functions (no import needed, but you can import from `@cloudflare/workers-types` for IDE support)
- This file is NOT part of the Astro build -- it lives in `functions/` and Cloudflare Pages deploys it as an edge function automatically

### Cache header values explained

| Directive | Value | Effect |
|---|---|---|
| `public` | -- | Response can be cached by any cache (CDN, browser, proxy) |
| `max-age=300` | 5 min | Browser/mobile-app local cache TTL. Mobile app carousel should respect this. |
| `s-maxage=86400` | 24 hr | CDN edge cache TTL. Since content only changes on rebuild (static site), 24h is safe. After a rebuild, the CDN serves stale until revalidated. |
| `stale-while-revalidate=604800` | 7 days | CDN can serve stale content for up to 7 days while asynchronously fetching a fresh copy. Provides resilience if the origin is slow or temporarily unavailable. |

Since the site is `output: 'static'`, the JSON files only change when a new build deploys. The 24h `s-maxage` means the CDN re-checks at most once per day, and `stale-while-revalidate` ensures zero-downtime during that revalidation window.

### WAF rate limiting -- dashboard configuration approach

Cloudflare WAF rate limiting rules for Pages projects are zone-level settings. They cannot be defined in `wrangler.toml` or deployed alongside the Pages project. The recommended approach is:

1. Navigate to Cloudflare dashboard > select zone > Security > WAF > Rate limiting rules
2. Create a new rule with:
   - **Rule name:** `Blog API rate limit - /api/v1/blog/*`
   - **If incoming requests match:** `(http.request.uri.path matches "^/api/v1/blog/")`
   - **Rate:** 100 requests per 60 seconds
   - **Counting expression:** Per IP (`ip.src`)
   - **Then:** Block for 60 seconds (returns HTTP 429)
3. Record the rule ID in `docs/integrations/cloudflare-waf.md`

Alternatively, the rule can be created via the Cloudflare API:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/rulesets/phases/http_ratelimit/entrypoint" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{
    "rules": [{
      "action": "block",
      "expression": "(http.request.uri.path matches \"^/api/v1/blog/\")",
      "ratelimit": {
        "characteristics": ["ip.src"],
        "period": 60,
        "requests_per_period": 100,
        "mitigation_timeout": 60
      },
      "description": "Blog API rate limit - /api/v1/blog/*"
    }]
  }'
```

### Preview vs production WAF coverage

Cloudflare Pages preview deployments use `*.pages.dev` subdomains on a shared Cloudflare zone. WAF rate limiting rules are scoped to your custom domain's zone, so **preview deployments may not be covered by the WAF rule**. This is a known limitation:
- The cache header middleware (`_middleware.ts`) works on both preview and production because it is deployed with the Pages project.
- The WAF rate limit rule only applies to the production custom domain.
- Document this in `docs/integrations/cloudflare-waf.md` under "Known limitations".

### Load test considerations

- Run the load test from a machine with a stable, fast internet connection (ideally not behind a restrictive NAT/firewall).
- The test targets a **preview deployment**, not production. Cache behaviour should be equivalent, but edge location may differ.
- After the initial request (cache MISS), all subsequent requests should show `cf-cache-status: HIT`. If you see MISS on many requests, the requests may be hitting different edge locations.
- The WAF rate limit (100 req/min/IP) should NOT interfere with the load test since the load test runs 100 concurrent workers but each request is from the same IP -- the WAF counts per minute, not per second. At ~333 req/sec for 30 seconds, you will exceed 100 req/min quickly. **Run the load test BEFORE enabling the WAF rule**, or temporarily increase the threshold during testing, or exclude the test IP. Document whichever approach you use.
- If running against a preview deployment that does not have WAF coverage, this issue does not apply.

### Project Structure Notes

New files:

```
functions/api/v1/blog/_middleware.ts    <- Cloudflare Pages Functions edge middleware (cache headers)
docs/integrations/cloudflare-waf.md    <- WAF rule documentation, load test results, known limitations
```

Modified files:

```
CONTRACT.md                            <- Add "Rate limits" and "Cache-Control headers" sections
docs/launch-checklist.md               <- Add "Blog API verification" section (create if not exists)
```

No files under `src/` are created or modified.

### Architecture compliance

- **No Astro source changes**: This story is transport-only. All changes are in `functions/` (Cloudflare Pages edge), `docs/`, and `CONTRACT.md`.
- **AR9 (Blog API cache headers)**: Implemented via `functions/api/v1/blog/_middleware.ts` with the exact header values specified: `public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`.
- **AR12 (No API key for V1)**: Confirmed -- rate limiting is the sole access control mechanism. No API keys are introduced.
- **NFR14 (Rate limiting)**: Cloudflare WAF rule at 100 req/min/IP with 429 response.
- **NFR18 (100 concurrent, <300ms p95)**: Validated via load test. Static files served from CDN edge satisfy this trivially after cache fill.
- **NFR31 (Additive-only contract)**: `CONTRACT.md` changes are additive -- a new "Rate limits" section is appended, existing endpoint documentation is unchanged.
- **FR25 (Rate-limited access for consumers)**: Documented in `CONTRACT.md` with mobile app guidance.
- **Three-tier hierarchy**: Not applicable -- no component changes.
- **Content access boundary**: Not applicable -- no `getCollection()` calls.
- **Env vars boundary**: Not applicable -- no env var reads in the middleware (the cache header values are hardcoded constants, not configuration).

### Dependencies

- **Story 4.8** (required) -- Creates the three static API endpoints at `/api/v1/blog/*` that this story protects. Must be deployed before cache headers or load test can be verified.
- **Story 4.1** (required) -- Creates initial `CONTRACT.md` that this story appends to.
- **Story 1.2** (informational) -- Provisioned Cloudflare Pages. WAF configuration builds on the same Cloudflare zone.
- **Epic 3** (soft) -- May create `docs/launch-checklist.md`. If it exists, append to it; if not, create it.

### References

- [Source: epics-truvis-landing-page.md#Story 4.9 -- Full acceptance criteria]
- [Source: architecture-truvis-landing-page.md#AR9 -- Blog API response shape + cache headers + rate limit]
- [Source: architecture-truvis-landing-page.md#AR12 -- No API key auth for V1, rate limiting only]
- [Source: architecture-truvis-landing-page.md#AR3 -- Cloudflare Pages with WAF rate limiting at edge]
- [Source: prd-truvis-landing-page.md#NFR14 -- Blog API access controlled via rate limiting]
- [Source: prd-truvis-landing-page.md#NFR18 -- Blog API 100 concurrent at <300ms p95]
- [Source: prd-truvis-landing-page.md#FR25 -- Blog API rate-limited access for consumers]
- [Source: prd-truvis-landing-page.md#NFR31 -- Additive-only API contract versioning]
- [Source: Cloudflare Pages Functions docs -- _middleware.ts convention]
- [Source: Cloudflare WAF Rate Limiting docs -- zone-level rule configuration]

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
