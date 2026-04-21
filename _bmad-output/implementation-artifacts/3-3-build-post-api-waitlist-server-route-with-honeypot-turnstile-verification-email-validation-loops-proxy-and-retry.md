# Story 3.3: Build POST `/api/waitlist` server route with honeypot, Turnstile verification, email validation, Loops proxy and retry

Status: done

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor who fills in the waitlist form and clicks "Join"**,
I want **the server to validate my submission, block spam, and forward my email to the waitlist provider**,
so that **I receive a confirmation email within seconds and know my signup was successful — while bots and junk never reach the mailing list**.

## Context & scope

This is the **third story of Epic 3** ("Waitlist Capture & Confirmation Flow"). Stories 3.1 and 3.2 provisioned the external services (Loops ESP account/audience/double-opt-in; Cloudflare Turnstile keys). This story builds the **server-side API route** that the waitlist form island (Story 3.4) will POST to. It is the single point where: (a) spam is filtered, (b) Turnstile tokens are verified, (c) email format is validated, (d) the contact is forwarded to Loops with custom fields, and (e) transient ESP failures are retried with exponential backoff.

The route runs as a **Cloudflare Pages Function** at request time — the only runtime server code in this otherwise fully-static project (`output: 'static'` in `astro.config.mjs`). Secrets (`LOOPS_API_KEY`, `TURNSTILE_SECRET_KEY`) are accessed exclusively via `src/lib/env.ts` and never leak to the client bundle (NFR12, AR Decision 2b).

Scope boundaries:
- **In scope:** `src/pages/api/waitlist.ts` (Astro API route, POST only), `src/lib/loops.ts` (Loops API client with retry), `src/lib/turnstile.ts` (Turnstile token verifier), `tests/api/waitlist.test.ts` (comprehensive mock-based tests), typed request/response interfaces, honeypot silent-reject, Turnstile server verification, email regex validation, Loops contact creation with custom fields (`signupSource`, `locale`, `launchPhase`), exponential backoff retry (3 attempts), duplicate/pending detection, structured logging (no PII), TODO comments for Sentry (epic-7) and KV queue (v1.1).
- **Out of scope:** The form island itself (Story 3.4), Turnstile client-side widget embedding (Story 3.2 provisions keys; Story 3.4 embeds the widget), Sentry error reporting (Epic 7), KV-based offline queue (v1.1), rate limiting at the WAF layer (Cloudflare dashboard config, not code), the `/api/v1/blog/*` static endpoints (Epic 4). Do **not** introduce these.

## Acceptance Criteria

### AC1 — Route shape and type contracts (AR Decision 2b, 3a, 3b)

**Given** the architecture specifies a server-side Astro API route at `POST /api/waitlist` that proxies to Loops and never exposes the API key,
**When** I create the route,
**Then**
- a new file `src/pages/api/waitlist.ts` exists and exports a single named `POST` function matching the Astro `APIRoute` signature: `export const POST: APIRoute = async ({ request }) => { ... }`,
- the file does NOT export `GET`, `PUT`, `DELETE`, or any other method — only `POST`,
- the route reads secrets via `getRequired('LOOPS_API_KEY')`, `getRequired('LOOPS_AUDIENCE_ID')`, and `getRequired('TURNSTILE_SECRET_KEY')` from `@/lib/env` — never `import.meta.env` or `process.env` directly (CLAUDE.md anti-pattern),
- the request body type is:
  ```typescript
  interface WaitlistRequest {
    email: string;
    honeypot?: string;       // hidden field — must be empty for humans
    turnstileToken: string;  // cf-turnstile-response from client widget
    signupSource?: string;   // e.g. 'hero', 'footer', 'blog-sidebar'
    locale?: string;         // e.g. 'en', 'fr', 'de'
  }
  ```
- the response body type is:
  ```typescript
  interface WaitlistResponse {
    ok: boolean;
    code: 'success' | 'invalid_email' | 'duplicate' | 'spam'
        | 'turnstile_failed' | 'esp_unavailable' | 'server_error';
    message?: string;  // human-readable, safe to display in UI
  }
  ```
- HTTP status codes follow the epic AC (NOT the architecture doc's "always 200" internal convention — the epic is more specific for this route):
  - `200` — success, duplicate, or honeypot silent-reject
  - `400` — invalid email or turnstile failure
  - `429` — only if the route itself is rate-limited (future WAF passthrough)
  - `502` — ESP unavailable after retries exhausted
  - `500` — unexpected server error (catch-all)
- the response always includes `Content-Type: application/json`,
- no secret values, API keys, or internal error details appear in any response body or header (NFR12).

### AC2 — Honeypot check as first validation layer (UX-DR16, NFR15, AR Decision 2c)

**Given** the architecture requires a two-layer anti-spam approach with the honeypot checked FIRST (cheapest check, no external call),
**When** a request arrives with a non-empty `honeypot` field,
**Then**
- the route returns `200 { ok: true, code: 'success' }` immediately — bots cannot distinguish this from a real success (NFR15 "without user-facing friction"),
- the Turnstile verification is NOT called,
- the Loops API is NOT called,
- a structured log entry is emitted: `{ event: 'waitlist_honeypot', signupSource }` (no email logged — NFR11),
- the check runs before any other validation step — it is the first `if` block after parsing the body.

### AC3 — Turnstile server-side verification as second validation layer (AR Decision 2c)

**Given** the architecture requires Cloudflare Turnstile as the second anti-spam layer, verified server-side,
**When** I implement Turnstile verification,
**Then**
- a new file `src/lib/turnstile.ts` exports a `verifyTurnstileToken` function with the signature:
  ```typescript
  export async function verifyTurnstileToken(
    token: string,
    secretKey: string
  ): Promise<TurnstileResult>
  ```
  where `TurnstileResult` is `{ success: boolean; errorCodes?: string[] }`,
- the function POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with form-encoded body `{ secret, response }` (Turnstile API expects `application/x-www-form-urlencoded` OR JSON — use JSON for consistency),
- a missing token (empty string or undefined) is rejected without calling the Turnstile API — return `{ success: false, errorCodes: ['missing-input-response'] }`,
- an expired or invalid token results in `{ success: false, errorCodes: [...] }` propagated from the CF response,
- the route returns `400 { ok: false, code: 'turnstile_failed', message: 'Security verification failed. Please try again.' }` when verification fails,
- `turnstile.ts` has a file header comment referencing Story 3.3, AR Decision 2c, and the CF Turnstile docs URL,
- the module is server-side only — no `client:*` directives, no browser APIs, no `PUBLIC_*` env vars.

### AC4 — Email format validation (FR12, AR Decision 3b)

**Given** the server must validate email format before forwarding to Loops (server is the source of truth for validation — AR Decision 3b),
**When** I implement email validation,
**Then**
- a regex validates the email format: must contain `@`, a domain part with at least one `.`, and no whitespace. The regex should be pragmatic (not RFC 5322 exhaustive) — e.g., `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`,
- leading/trailing whitespace on the email is trimmed before validation,
- the email is lowercased before being sent to Loops (prevents duplicate issues from case differences),
- an invalid email returns `400 { ok: false, code: 'invalid_email', message: 'Please enter a valid email address.' }`,
- the validation runs AFTER the honeypot and Turnstile checks (no point validating email format for bots).

### AC5 — Loops contact creation with custom fields (AR Decision 3a, FR12, FR14)

**Given** Loops is the ESP and contacts must be created with metadata for drip segmentation,
**When** I implement the Loops integration,
**Then**
- a new file `src/lib/loops.ts` exports an `addContact` function:
  ```typescript
  export async function addContact(params: {
    email: string;
    audienceId: string;
    apiKey: string;
    signupSource: string;
    locale: string;
    launchPhase: string;
  }): Promise<LoopsResult>
  ```
  where `LoopsResult` is `{ ok: true; contactId?: string } | { ok: false; code: 'duplicate' | 'pending' | 'rate_limited' | 'server_error' | 'network_error'; retryable: boolean }`,
- the function POSTs to `https://app.loops.so/api/v1/contacts/create` with JSON body:
  ```json
  {
    "email": "...",
    "mailingLists": { "<audienceId>": true },
    "source": "truvis-landing-page",
    "userGroup": "waitlist-v1",
    "signupSource": "hero",
    "locale": "en",
    "launchPhase": "pre"
  }
  ```
  (custom fields: `signupSource`, `locale`, `launchPhase`; `source` and `userGroup` are Loops built-in fields),
- the `Authorization: Bearer <apiKey>` header is set on the request,
- `loops.ts` has a file header comment referencing Story 3.3, AR Decision 3a, the Loops API docs URL, and a note that this module is server-side only,
- the module never logs the API key or the email address (NFR11, NFR12).

### AC6 — Duplicate and pending contact handling (FR14)

**Given** Loops returns specific responses for contacts that already exist,
**When** a duplicate or pending contact is detected,
**Then**
- a contact that is already subscribed (Loops returns a conflict/duplicate indicator) maps to `200 { ok: true, code: 'duplicate', message: 'You are already on the waitlist! Check your inbox for our latest update.' }` — this is a friendly success, not an error,
- a contact that is pending/unconfirmed triggers a re-send of the confirmation email (if Loops supports this via the same create endpoint, or via a separate trigger) and maps to `200 { ok: true, code: 'duplicate', message: 'We have re-sent your confirmation email. Please check your inbox and spam folder.' }`,
- both cases return HTTP 200 (not 409 or 400) — from the user's perspective, they are already signed up, which is a good outcome.

### AC7 — Exponential backoff retry on transient failures (NFR17, NFR34)

**Given** the architecture requires graceful degradation on ESP failure and retry on rate limits,
**When** I implement retry logic in `src/lib/loops.ts`,
**Then**
- the retry wrapper attempts up to **3 total attempts** (1 initial + 2 retries),
- backoff delays are approximately **300ms, 700ms, 1500ms** (total budget ~2.5s to stay within CF Worker CPU time limits),
- **5xx responses** from Loops are retried,
- **Network errors** (fetch throws) are retried,
- **4xx responses** (except 429) are NOT retried — they indicate a client-side problem (bad request, auth failure),
- **429 responses** respect the `Retry-After` header if present (parse as seconds); if no `Retry-After`, use the standard backoff delay,
- after all retries are exhausted, the route returns `502 { ok: false, code: 'esp_unavailable', message: 'Our email service is temporarily unavailable. Please try again in a few minutes.' }`,
- each retry attempt is logged with attempt number and delay (no PII — NFR11),
- TODO comments mark where Sentry alerting (Epic 7) and KV-based offline queue (v1.1) should be added:
  ```typescript
  // TODO(epic-7): Report to Sentry when all retries exhausted
  // TODO(v1.1): Enqueue failed signups to KV for background retry
  ```

### AC8 — Structured console logging without PII (NFR11)

**Given** NFR11 prohibits PII in logs and the epic AC requires structured analytics logging,
**When** I add logging to the route,
**Then**
- every request logs a structured JSON object on completion:
  ```typescript
  {
    event: 'waitlist_submission',
    code: 'success' | 'duplicate' | 'invalid_email' | ...,
    signupSource: string,
    locale: string,
    turnstileVerified: boolean,
    responseTimeMs: number,
    retryCount?: number
  }
  ```
- the email address is NEVER logged — not even partially masked,
- honeypot rejections log `event: 'waitlist_honeypot'` (separate event type for monitoring),
- logs use `console.log(JSON.stringify(...))` for CF Pages Functions structured log compatibility,
- error stack traces from unexpected exceptions are logged to `console.error` but with no request body content.

### AC9 — Comprehensive Vitest test suite (CI gate)

**Given** the CI pipeline runs `npx vitest run` and all tests must pass before merge,
**When** I create the test file,
**Then**
- a new file `tests/api/waitlist.test.ts` exists with the following test cases, each using mocked `fetch` (never hitting real APIs):
  1. **Honeypot rejection** — non-empty honeypot returns `200 { ok: true, code: 'success' }`, fetch is never called
  2. **Turnstile failure** — invalid token returns `400 { ok: false, code: 'turnstile_failed' }`
  3. **Invalid email** — malformed email returns `400 { ok: false, code: 'invalid_email' }`
  4. **New subscribe success** — valid request, Loops returns success, route returns `200 { ok: true, code: 'success' }`
  5. **Duplicate contact** — Loops indicates already-subscribed, route returns `200 { ok: true, code: 'duplicate' }`
  6. **Pending contact resend** — Loops indicates pending, route returns `200 { ok: true, code: 'duplicate' }`
  7. **ESP 500 retry eventually-fails** — Loops returns 500 on all 3 attempts, route returns `502 { ok: false, code: 'esp_unavailable' }`
  8. **ESP 429 with Retry-After eventually-succeeds** — Loops returns 429 on first attempt then 200, route returns `200 { ok: true, code: 'success' }`, delay respects `Retry-After`
  9. **ESP network error eventually-fails** — fetch throws on all 3 attempts, route returns `502 { ok: false, code: 'esp_unavailable' }`
- tests mock `global.fetch` (or use `vi.stubGlobal`) — no real HTTP calls,
- tests set env vars via `process.env` before importing the route (leveraging `src/lib/env.ts` fallback to `process.env`),
- retry delay tests use `vi.useFakeTimers()` or assert on call counts without waiting for real delays (tests must run fast in CI),
- all tests pass under `npx vitest run`.

## Tasks

- [x] Task 1 (AC: 1): Create `src/pages/api/waitlist.ts` with POST export, typed request/response interfaces, and JSON parsing with error handling
- [x] Task 2 (AC: 5, 6, 7): Create `src/lib/loops.ts` — Loops API client (server-side only)
  - [x] Subtask 2.1: Define `LoopsResult` type and `addContact()` function signature
  - [x] Subtask 2.2: Implement POST to Loops contacts/create endpoint with auth header and custom fields
  - [x] Subtask 2.3: Handle duplicate detection — map Loops conflict response to `duplicate` code
  - [x] Subtask 2.4: Handle pending/unconfirmed contacts — map to `duplicate` with re-send semantics
  - [x] Subtask 2.5: Implement exponential backoff retry wrapper (3 attempts, ~300/700/1500ms delays)
  - [x] Subtask 2.6: Respect `Retry-After` header on 429 responses
  - [x] Subtask 2.7: Add TODO comments for Sentry (epic-7) and KV queue (v1.1)
- [x] Task 3 (AC: 3): Create `src/lib/turnstile.ts` — Turnstile verification helper (server-side only)
  - [x] Subtask 3.1: Define `TurnstileResult` type and `verifyTurnstileToken()` function signature
  - [x] Subtask 3.2: Implement POST to CF siteverify endpoint with JSON body
  - [x] Subtask 3.3: Handle missing token (reject without calling API)
  - [x] Subtask 3.4: Propagate error codes from CF response
- [x] Task 4 (AC: 2): Implement honeypot check as first validation step in the route — silent `200` success on bot detection, no downstream calls
- [x] Task 5 (AC: 3): Wire Turnstile verification as second validation step in the route — call `verifyTurnstileToken()`, return 400 on failure
- [x] Task 6 (AC: 4): Implement email regex validation — trim, lowercase, reject malformed with 400
- [x] Task 7 (AC: 5, 6): Wire Loops contact creation — call `addContact()` with custom fields, map result codes to response
- [x] Task 8 (AC: 8): Add structured console logging throughout the route — start timer on entry, log on every exit path, no PII
- [x] Task 9 (AC: 1): Add catch-all try/catch returning `500 { ok: false, code: 'server_error' }` with `console.error` (no body content)
- [x] Task 10 (AC: 9): Create `tests/api/waitlist.test.ts` with comprehensive mock-based tests
  - [x] Subtask 10.1: Test setup — mock fetch, set env vars, import route handler
  - [x] Subtask 10.2: Honeypot rejection (silent success, fetch not called)
  - [x] Subtask 10.3: Turnstile failure (invalid token → 400)
  - [x] Subtask 10.4: Invalid email (malformed → 400)
  - [x] Subtask 10.5: New subscribe success (Loops 200 → route 200 success)
  - [x] Subtask 10.6: Duplicate contact (Loops conflict → route 200 duplicate)
  - [x] Subtask 10.7: Pending contact resend (Loops pending → route 200 duplicate)
  - [x] Subtask 10.8: ESP 500 retry eventually-fails (3x 500 → route 502)
  - [x] Subtask 10.9: ESP 429 with Retry-After eventually-succeeds (429 then 200 → route 200)
  - [x] Subtask 10.10: ESP network error eventually-fails (3x throw → route 502)

### Review Findings

- [x] [Review][Patch] P1: Add `remoteip` to Turnstile `verifyTurnstileToken` — pass client IP from request headers to prevent token replay [`src/lib/turnstile.ts`, `src/pages/api/waitlist.ts`]
- [x] [Review][Patch] P2: Pending response message should not claim "re-sent confirmation email" — change to non-committal message [`src/pages/api/waitlist.ts:196-201`]
- [x] [Review][Patch] P3: Cap `Retry-After` delay with `Math.min(val, 5000)` to prevent worker hang on large values [`src/lib/loops.ts:59-61`]
- [x] [Review][Patch] P4: Add `export const prerender = false` — required for server-rendered API route in `output: 'static'` mode [`src/pages/api/waitlist.ts`]
- [x] [Review][Patch] P5: Wrap `.json()` in try/catch on Loops 400 handler — non-JSON body causes incorrect retry as network error [`src/lib/loops.ts:139-141`]
- [x] [Review][Patch] P6: Wrap `.json()` in try/catch on Loops success handler — non-JSON body on success retries and could cause duplicate creation [`src/lib/loops.ts:128-131`]
- [x] [Review][Patch] P7: Check `response.ok` before parsing Turnstile JSON — non-2xx HTML error page throws misleading `network-error` [`src/lib/turnstile.ts:51-59`]
- [x] [Review][Patch] P8: Log `code: 'pending'` instead of `code: 'duplicate'` for pending Loops results — enables ops to distinguish in metrics [`src/pages/api/waitlist.ts:188-189`]
- [x] [Review][Patch] P9: Pass `retryCount` to `logCompletion` on `esp_unavailable` path — AC8 schema specifies it [`src/pages/api/waitlist.ts`]

## Dev Notes

### File locations

| File | Purpose |
|------|---------|
| `src/pages/api/waitlist.ts` | Astro API route — POST handler, orchestrates validation pipeline |
| `src/lib/loops.ts` | Loops ESP client — `addContact()` with retry logic (server-side only) |
| `src/lib/turnstile.ts` | Turnstile verifier — `verifyTurnstileToken()` (server-side only) |
| `tests/api/waitlist.test.ts` | Vitest test suite — all test cases mock `fetch` |

### Astro API route pattern

Astro API routes for Cloudflare Pages export named HTTP method handlers. The file must be `.ts` (not `.astro`). Example shape:

```typescript
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  // ... validation, processing ...
  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### Architecture discrepancy — HTTP status codes

The architecture doc (`architecture-truvis-landing-page.md`) states that internal API routes should return `{ok, data}` / `{ok, error: {code, message}}` always at HTTP 200. However, the **epic AC explicitly specifies HTTP status codes** (200/400/429/502/500) for this route. **Follow the epic AC** — it is more specific and more appropriate for a form submission endpoint where the client (Story 3.4 form island) needs to distinguish error categories via status codes for UX flow control.

### Loops API specifics

- **Endpoint:** `POST https://app.loops.so/api/v1/contacts/create`
- **Auth:** `Authorization: Bearer <LOOPS_API_KEY>`
- **Content-Type:** `application/json`
- **Duplicate handling:** Loops returns a specific response when a contact already exists. Inspect the response body for duplicate indicators (e.g., `"message": "Email already on list"` or similar). Check the Loops API docs from Story 3.1 (`docs/integrations/loops.md`) for the exact response shape.
- **Custom fields:** `signupSource`, `locale`, `launchPhase` must be pre-created as custom properties in the Loops dashboard (Story 3.1 provisions these).

### Turnstile siteverify specifics

- **Endpoint:** `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
- **Body:** `{ "secret": "<TURNSTILE_SECRET_KEY>", "response": "<token-from-client>" }`
- **Response:** `{ "success": true/false, "error-codes": [...], "challenge_ts": "...", "hostname": "..." }`
- **Docs:** https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

### Env var access

Use the existing helpers from `src/lib/env.ts`:
- `getRequired('LOOPS_API_KEY')` — throws if missing (fail-fast at request time)
- `getRequired('LOOPS_AUDIENCE_ID')` — the `waitlist-v1` audience ID
- `getRequired('TURNSTILE_SECRET_KEY')` — server-side Turnstile secret

Story 3.2 adds `getTurnstileConfig()` to `env.ts` which returns `{ siteKey, secretKey }`. The route can use either `getRequired('TURNSTILE_SECRET_KEY')` directly or destructure from `getTurnstileConfig()` — prefer whichever is already merged when this story is implemented.

### Validation pipeline order

The route must execute validations in this exact order (cheapest/fastest first):

1. Parse JSON body (malformed → 400 server_error)
2. **Honeypot check** — if non-empty, return 200 success silently (zero external calls)
3. **Turnstile verification** — call CF siteverify (one external call)
4. **Email format validation** — regex check (zero external calls)
5. **Loops contact creation** — call Loops API with retry (one+ external calls)

### Testing strategy

- **Mock `global.fetch`** using `vi.stubGlobal('fetch', vi.fn())` — all Turnstile and Loops calls go through `fetch`
- **Env vars:** Set `process.env.LOOPS_API_KEY`, `process.env.LOOPS_AUDIENCE_ID`, `process.env.TURNSTILE_SECRET_KEY` in `beforeEach`
- **Fake timers:** Use `vi.useFakeTimers()` for retry delay tests — advance time programmatically to avoid slow tests
- **Request factory:** Create a helper that builds a `Request` object with the correct method, headers, and JSON body
- **No real HTTP:** Tests must pass in CI without network access

### Dependencies

- **Story 3.1** (must be complete): Loops account provisioned, `LOOPS_API_KEY` and `LOOPS_AUDIENCE_ID` available, custom fields created in Loops dashboard, `docs/integrations/loops.md` documents the API.
- **Story 3.2** (must be complete): Turnstile site and secret keys provisioned, `getTurnstileConfig()` added to `env.ts`, `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in `.env.example`.
- **Story 3.4** (depends on this story): The form island will POST to `/api/waitlist` and interpret the response codes.

## Architecture compliance

| Requirement | How this story satisfies it |
|---|---|
| NFR11 — No PII in logs | Email never logged; structured logs contain only `code`, `signupSource`, `locale`, `responseTimeMs` |
| NFR12 — No secrets in client code | All secrets read server-side via `lib/env.ts`; no secret in response body or headers |
| NFR15 — Anti-spam without friction | Honeypot silent-reject (bots see `200 success`); Turnstile invisible to humans |
| NFR17 — Retry on rate limit | 429 respects `Retry-After`; exponential backoff on transient failures |
| NFR34 — Graceful ESP degradation | Retry exhaustion returns `502 esp_unavailable` with user-friendly message; form (Story 3.4) can show retry UI |
| AR Decision 2b — Secrets in CF env | Route reads from `lib/env.ts` which resolves `import.meta.env` (CF Workers) |
| AR Decision 2c — Two-layer anti-spam | Honeypot (layer 1, checked first) + Turnstile (layer 2, server-verified) |
| AR Decision 3a — Loops ESP | Contact created via Loops API with audience, custom fields, double opt-in trigger |
| AR Decision 3b — Native form + server route | Route is the server-side handler; validates on server as source of truth |
| CLAUDE.md — env via lib/env.ts only | All env access through `getRequired()` / `getOptional()` |
| CLAUDE.md — no `getCollection()` outside lib | Not applicable — this story does not use Content Collections |
| CLAUDE.md — three-tier hierarchy | `src/lib/*` (utility tier) — no component imports, no page imports |

## References

- [Source: architecture-truvis-landing-page.md § Decision 2b — Secrets Management]
- [Source: architecture-truvis-landing-page.md § Decision 2c — Anti-Spam on Waitlist Form]
- [Source: architecture-truvis-landing-page.md § Decision 3a — Email Service Provider — Loops]
- [Source: architecture-truvis-landing-page.md § Decision 3b — Form Handling Pattern]
- [Source: prd-truvis-landing-page.md FR12, FR14, NFR11, NFR12, NFR15, NFR17, NFR34]
- [Source: epics-truvis-landing-page.md § Story 3.3]
- [Source: src/lib/env.ts — getRequired(), getOptional(), parseBoolean()]
- [Source: .env.example — LOOPS_API_KEY, LOOPS_AUDIENCE_ID, PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY]
- [Source: Cloudflare Turnstile docs — https://developers.cloudflare.com/turnstile/get-started/server-side-validation/]
- [Source: Loops API docs — https://loops.so/docs/api-reference/create-contact]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- All 54 tests pass (9 new waitlist tests + 45 existing) — no regressions
- ESLint: 0 errors, 0 warnings after removing unused `isRetryable` helper
- Prettier: all files formatted

### Completion Notes List

- Created `src/lib/loops.ts` — Loops ESP client with `addContact()`, exponential backoff retry (3 attempts, ~300/700/1500ms), `Retry-After` header support, duplicate/pending detection via 409 and 400 response body parsing, TODO markers for Sentry (epic-7) and KV queue (v1.1)
- Created `src/lib/turnstile.ts` — Turnstile server-side verifier with `verifyTurnstileToken()`, missing-token fast-reject, error code propagation from CF response
- Created `src/pages/api/waitlist.ts` — POST-only Astro API route with 5-step validation pipeline (parse → honeypot → turnstile → email → loops), typed `WaitlistRequest`/`WaitlistResponse` interfaces, structured JSON logging on every exit path (no PII), catch-all error handler
- Created `tests/api/waitlist.test.ts` — 9 comprehensive mock-based tests covering all AC9 scenarios with `vi.useFakeTimers()` for retry delay tests
- Updated `vitest.config.ts` to include `tests/**/*.test.ts` in addition to `src/**/*.test.ts`
- Validation pipeline order matches story spec: honeypot first (cheapest), then Turnstile, then email regex, then Loops
- HTTP status codes follow epic AC (200/400/502/500), not the architecture doc's "always 200" convention
- All env access via `getRequired()`/`getOptional()` from `@/lib/env` — no direct `import.meta.env` or `process.env`

### File List

**Created:**
- `src/pages/api/waitlist.ts`
- `src/lib/loops.ts`
- `src/lib/turnstile.ts`
- `tests/api/waitlist.test.ts`

**Modified:**
- `vitest.config.ts` (added `tests/**/*.test.ts` to include pattern)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-3-build-post-api-waitlist-server-route-with-honeypot-turnstile-verification-email-validation-loops-proxy-and-retry.md`

## Change Log

- 2026-04-21: Story 3.3 implemented — all 10 tasks complete, 9 tests passing, all ACs satisfied (Claude Opus 4.6)
