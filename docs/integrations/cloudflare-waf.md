# Cloudflare WAF — Blog API Rate Limiting

## Overview

The Truvis blog content API (`/api/v1/blog/*`) is protected by a Cloudflare WAF rate limiting rule (NFR14). This prevents abuse and ensures the mobile app carousel has reliable, low-latency access to blog content.

The static JSON endpoints are also served with explicit CDN cache headers via a Cloudflare Pages Functions middleware (AR9), ensuring aggressive edge caching and resilience.

## Rule configuration

| Field                  | Value                                               |
| ---------------------- | --------------------------------------------------- |
| **Rule name**          | `Blog API rate limit - /api/v1/blog/*`              |
| **Rule ID**            | `TODO(deploy)` — record after creating in dashboard |
| **Matcher**            | `(http.request.uri.path matches "^/api/v1/blog/")`  |
| **Threshold**          | 100 requests per 60 seconds                         |
| **Counting**           | Per client IP (`ip.src`)                            |
| **Mitigation action**  | Block (HTTP 429)                                    |
| **Mitigation timeout** | 60 seconds                                          |
| **Response headers**   | `Retry-After: 60`                                   |
| **Scope**              | Production zone only (see Known Limitations)        |

### Configuration approach

The WAF rate limiting rule is configured via the **Cloudflare dashboard** (not `wrangler` CLI). Cloudflare Pages does not support WAF rule management via `wrangler.toml` or repo-level config files — WAF rate limiting rules are zone-level settings.

**Steps to reproduce:**

1. Log in to the Cloudflare dashboard
2. Select the production zone (e.g., `truvis.app`)
3. Navigate to **Security > WAF > Rate limiting rules**
4. Click **Create rule** and enter:
   - **Rule name:** `Blog API rate limit - /api/v1/blog/*`
   - **If incoming requests match:** `(http.request.uri.path matches "^/api/v1/blog/")`
   - **Rate:** 100 requests per 60 seconds
   - **Counting expression:** Per IP (`ip.src`)
   - **Then:** Block for 60 seconds (returns HTTP 429)
5. Save and deploy the rule
6. Record the rule ID in this document (replace the `TODO(deploy)` above)

**Alternative — Cloudflare API:**

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

## Cache headers

The CDN cache headers are set via a Cloudflare Pages `_headers` file at:

```
public/_headers
```

This file instructs the Cloudflare Pages CDN to add the `Cache-Control` header to all static responses matching `/api/v1/blog/*`. The `_headers` approach is used because the `@astrojs/cloudflare` adapter generates a `_worker.js` that takes priority over `functions/` directory middleware, and the blog API routes are excluded from the worker (served as static files directly from the CDN).

| Directive                | Value  | Purpose                                               |
| ------------------------ | ------ | ----------------------------------------------------- |
| `public`                 | —      | Response cacheable by any cache (CDN, browser, proxy) |
| `max-age`                | 300    | Client (browser/app) caches for 5 minutes             |
| `s-maxage`               | 86400  | CDN edge caches for 24 hours                          |
| `stale-while-revalidate` | 604800 | Serve stale for up to 7 days while async revalidating |

Since the site is `output: 'static'`, the JSON files only change when a new build deploys. The 24h `s-maxage` means the CDN re-checks at most once per day, and `stale-while-revalidate` ensures zero-downtime during revalidation.

## Verification commands

### Verify cache headers

```bash
curl -I https://<domain>/api/v1/blog/posts.json
# Expected: Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800
```

### Verify CDN cache hit

```bash
# First request (cache MISS):
curl -I https://<domain>/api/v1/blog/posts.json | grep cf-cache-status

# Second request (cache HIT):
curl -I https://<domain>/api/v1/blog/posts.json | grep cf-cache-status
```

### Verify rate limiting

```bash
for i in $(seq 1 105); do
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/v1/blog/posts.json)
  echo "Request $i: HTTP $STATUS"
  if [ "$STATUS" = "429" ]; then
    echo "Rate limited at request $i"
    curl -I https://<domain>/api/v1/blog/posts.json 2>/dev/null | grep -i retry-after
    break
  fi
done
```

## Load test results

**Methodology:**

- **Tool:** autocannon (Node.js-based HTTP benchmarking tool)
- **Target:** `/api/v1/blog/posts.json` on a Cloudflare Pages preview deployment
- **Concurrency:** 100 connections
- **Duration:** 30 seconds
- **Threshold:** p95 response time < 300ms (NFR18)

**Command:**

```bash
npx autocannon -c 100 -d 30 --renderStatusCodes https://<preview-url>/api/v1/blog/posts.json
```

**Results:**

| Metric              | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| Tool & version      | autocannon v8.0.0 (Node v24.14.1)                       |
| Total requests      | 92,592                                                   |
| Success rate        | 100% (all HTTP 200, zero 5xx)                            |
| p50 latency         | 31 ms                                                    |
| p95 latency         | 42 ms                                                    |
| p99 latency         | 48 ms                                                    |
| Max latency         | 337 ms                                                   |
| Requests/sec        | ~3,087 avg                                               |
| CDN cache hit ratio | N/A (`cf-cache-status` not present on `*.pages.dev`)     |
| Date tested         | 2026-04-27                                               |
| Preview URL         | `https://43add278.truvis-landing-page.pages.dev`         |

**NFR18 validated:** p95 = 42ms, well under the 300ms budget. Zero errors across 92k requests.

## Known limitations

1. **Shared-IP scenarios:** Corporate NAT, conference wifi, or VPN users sharing a single public IP may collectively hit the 100 req/min limit. This is acceptable for V1 given the mobile app's 5-minute cache. **V1.1 follow-up:** consider an API-key-gated higher-rate lane if abuse reports arrive from legitimate shared-IP environments.

2. **Preview deployments not covered by WAF:** Cloudflare Pages preview deployments use `*.pages.dev` subdomains on a shared Cloudflare zone. WAF rate limiting rules are scoped to the custom domain's zone (production only). The `_headers` file (cache headers) works on both preview and production since it deploys with the Pages project.

3. **Dashboard-only configuration:** The WAF rule cannot be version-controlled in the repository. Changes to the rule must be made in the Cloudflare dashboard and documented in this file.
