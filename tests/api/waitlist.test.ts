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

// Transactional email success response
function transactionalSuccess() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Transactional email failure response
function transactionalFailure() {
  return new Response(JSON.stringify({ error: 'Failed to send' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Constants for URL matching
// ---------------------------------------------------------------------------
const TURNSTILE_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TRANSACTIONAL_URL = 'https://app.loops.so/api/v1/transactional';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/waitlist', () => {
  const originalEnv = { ...process.env };
  let mockFetch: Mock;

  beforeEach(() => {
    // Set required env vars
    process.env.LOOPS_API_KEY = 'test-loops-key';
    process.env.LOOPS_AUDIENCE_ID = 'test-audience-id';
    process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
    process.env.LAUNCH_PHASE = 'pre';
    process.env.CONFIRM_HMAC_SECRET = 'test-hmac-secret';
    process.env.LOOPS_DOI_TRANSACTIONAL_ID = 'test-transactional-id';

    // Mock global fetch
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    // Suppress console.log/error in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
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
    // Only Turnstile was called
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

  // ── Test 4: DOI email sent successfully ────────────────────────────────
  it('returns 200 success when transactional email is sent', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockResolvedValueOnce(transactionalSuccess());

    const result = await callWaitlist(validBody());

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('success');
    // 1 Turnstile + 1 transactional email = 2 fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe(TRANSACTIONAL_URL);
  });

  // ── Test 5: Transactional email includes confirmation URL ──────────────
  it('sends transactional email with HMAC-signed confirmation URL', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockResolvedValueOnce(transactionalSuccess());

    await callWaitlist(validBody());

    const transactionalCall = mockFetch.mock.calls[1];
    const body = JSON.parse(transactionalCall[1].body as string) as Record<
      string,
      unknown
    >;

    expect(body.transactionalId).toBe('test-transactional-id');
    expect(body.email).toBe('test@example.com');

    const dataVars = body.dataVariables as Record<string, string>;
    expect(dataVars.companyName).toBe('Truvis');
    expect(dataVars.optInUrl).toContain('/api/confirm?');
    expect(dataVars.optInUrl).toContain('email=test%40example.com');
    expect(dataVars.optInUrl).toContain('signupSource=hero');
    expect(dataVars.optInUrl).toContain('token=');
  });

  // ── Test 6: DOI email failure returns 502 ──────────────────────────────
  it('returns 502 esp_unavailable when transactional email fails', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockResolvedValueOnce(transactionalFailure());

    const result = await callWaitlist(validBody());

    expect(result.status).toBe(502);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('esp_unavailable');
  });

  // ── Test 7: DOI email network error returns 502 ────────────────────────
  it('returns 502 esp_unavailable on transactional email network error', async () => {
    mockFetch
      .mockResolvedValueOnce(turnstileSuccess())
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await callWaitlist(validBody());

    expect(result.status).toBe(502);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('esp_unavailable');
  });
});
