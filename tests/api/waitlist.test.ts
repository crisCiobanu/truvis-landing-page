/**
 * Tests for POST /api/waitlist — Story 3.3 (AC9)
 *
 * All tests mock `global.fetch`. No real HTTP calls are made.
 * Env vars are set via `process.env` before each test (leveraging
 * `src/lib/env.ts` fallback to `process.env`).
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';

// ---------------------------------------------------------------------------
// We need to import the POST handler. Because it uses `@/lib/env` which reads
// env at call time (not import time), we can set process.env in beforeEach.
// ---------------------------------------------------------------------------
import { POST } from '@/pages/api/waitlist';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Request object matching what Astro passes to the route handler. */
function makeRequest(body: Record<string, unknown>): Request {
  return new Request('https://truvis.app/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Extract the parsed JSON body and status from a Response. */
async function parseResponse(res: Response) {
  const json = (await res.json()) as {
    ok: boolean;
    code: string;
    message?: string;
  };
  return { status: res.status, ...json };
}

/** Convenience: call POST with a request body. */
async function callWaitlist(body: Record<string, unknown>) {
  const request = makeRequest(body);
  // Astro APIRoute receives { request, ... } — we only use `request`
  const res = await POST({ request } as Parameters<typeof POST>[0]);
  return parseResponse(res);
}

/** Default valid request body. */
function validBody(overrides: Record<string, unknown> = {}) {
  return {
    email: 'test@example.com',
    turnstileToken: 'valid-token',
    signupSource: 'hero',
    locale: 'en',
    ...overrides,
  };
}

// Turnstile siteverify success response
function turnstileSuccess() {
  return new Response(JSON.stringify({ success: true, 'error-codes': [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Turnstile siteverify failure response
function turnstileFailure() {
  return new Response(
    JSON.stringify({
      success: false,
      'error-codes': ['invalid-input-response'],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

// Loops create success response
function loopsSuccess() {
  return new Response(JSON.stringify({ success: true, id: 'contact-123' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Loops duplicate (409) response
function loopsDuplicate() {
  return new Response(JSON.stringify({ message: 'Email already on list' }), {
    status: 409,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Loops pending (400 with pending message) response
function loopsPending() {
  return new Response(
    JSON.stringify({ message: 'Contact is pending confirmation' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}

// Loops 500 error response
function loops500() {
  return new Response(JSON.stringify({ error: 'Internal server error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Loops 429 rate limit response
function loops429(retryAfter?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (retryAfter) headers['Retry-After'] = retryAfter;
  return new Response(JSON.stringify({ error: 'Rate limited' }), {
    status: 429,
    headers,
  });
}

// ---------------------------------------------------------------------------
// Constants for URL matching
// ---------------------------------------------------------------------------
const TURNSTILE_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const LOOPS_URL = 'https://app.loops.so/api/v1/contacts/create';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/waitlist', () => {
  const originalEnv = { ...process.env };
  let mockFetch: Mock;

  beforeEach(() => {
    vi.useFakeTimers();

    // Set required env vars
    process.env.LOOPS_API_KEY = 'test-loops-key';
    process.env.LOOPS_AUDIENCE_ID = 'test-audience-id';
    process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
    process.env.LAUNCH_PHASE = 'pre';

    // Mock global fetch
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    // Suppress console.log/error in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  // ── Test 1: Honeypot rejection ──────────────────────────────────────────
  it('returns 200 success silently when honeypot is filled (bot)', async () => {
    const result = await callWaitlist(
      validBody({ honeypot: 'bot-filled-this' })
    );

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('success');
    // fetch should NEVER be called — no Turnstile, no Loops
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── Test 2: Turnstile failure ───────────────────────────────────────────
  it('returns 400 turnstile_failed when token is invalid', async () => {
    mockFetch.mockResolvedValueOnce(turnstileFailure());

    const result = await callWaitlist(
      validBody({ turnstileToken: 'bad-token' })
    );

    expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('turnstile_failed');
    // Only Turnstile was called, not Loops
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(TURNSTILE_URL);
  });

  // ── Test 3: Invalid email ──────────────────────────────────────────────
  it('returns 400 invalid_email for malformed email', async () => {
    mockFetch.mockResolvedValueOnce(turnstileSuccess());

    const result = await callWaitlist(validBody({ email: 'not-an-email' }));

    expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('invalid_email');
    // Only Turnstile was called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // ── Test 4: New subscribe success ──────────────────────────────────────
  it('returns 200 success when Loops creates contact', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockResolvedValueOnce(loopsSuccess());

    const result = await callWaitlist(validBody());

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('success');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe(LOOPS_URL);
  });

  // ── Test 5: Duplicate contact ──────────────────────────────────────────
  it('returns 200 duplicate when contact already exists', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockResolvedValueOnce(loopsDuplicate());

    const result = await callWaitlist(validBody());

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('duplicate');
  });

  // ── Test 6: Pending contact resend ─────────────────────────────────────
  it('returns 200 duplicate when contact is pending', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockResolvedValueOnce(loopsPending());

    const result = await callWaitlist(validBody());

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('duplicate');
  });

  // ── Test 7: ESP 500 retry eventually fails ─────────────────────────────
  it('returns 502 esp_unavailable after 3 failed attempts (500s)', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess()) // Turnstile OK
      .mockResolvedValueOnce(loops500()) // Attempt 1
      .mockResolvedValueOnce(loops500()) // Attempt 2
      .mockResolvedValueOnce(loops500()); // Attempt 3

    // Run the request and advance timers for retry delays
    const promise = callWaitlist(validBody());
    // Advance through all retry delays
    await vi.advanceTimersByTimeAsync(5000);

    const result = await promise;

    expect(result.status).toBe(502);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('esp_unavailable');
    // 1 Turnstile + 3 Loops attempts = 4 fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  // ── Test 8: ESP 429 with Retry-After eventually succeeds ───────────────
  it('returns 200 success after 429 then success (respects Retry-After)', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess()) // Turnstile OK
      .mockResolvedValueOnce(loops429('2')) // Attempt 1 — 429 with Retry-After: 2
      .mockResolvedValueOnce(loopsSuccess()); // Attempt 2 — success

    const promise = callWaitlist(validBody());
    // Advance timers past the Retry-After delay (2s = 2000ms)
    await vi.advanceTimersByTimeAsync(5000);

    const result = await promise;

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('success');
    // 1 Turnstile + 2 Loops attempts = 3 fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  // ── Test 9: ESP network error eventually fails ─────────────────────────
  it('returns 502 esp_unavailable after 3 network errors', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess()) // Turnstile OK
      .mockRejectedValueOnce(new Error('Network error')) // Attempt 1
      .mockRejectedValueOnce(new Error('Network error')) // Attempt 2
      .mockRejectedValueOnce(new Error('Network error')); // Attempt 3

    const promise = callWaitlist(validBody());
    await vi.advanceTimersByTimeAsync(5000);

    const result = await promise;

    expect(result.status).toBe(502);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('esp_unavailable');
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });
});
