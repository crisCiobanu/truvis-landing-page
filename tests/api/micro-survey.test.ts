/**
 * Tests for POST /api/micro-survey — Story 3.6 (AC8)
 *
 * Mocks `src/lib/loops.ts` updateContact. Env vars set via process.env.
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

// Mock loops.ts before importing the route handler
vi.mock('@/lib/loops', () => ({
  updateContact: vi.fn(),
}));

import { POST } from '@/pages/api/micro-survey';
import { resetRateLimit } from '@/pages/api/micro-survey';
import { updateContact } from '@/lib/loops';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('https://truvis.app/api/micro-survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function parseResponse(res: Response) {
  const json = (await res.json()) as { ok: boolean; code: string };
  return { status: res.status, ...json };
}

async function callMicroSurvey(body: Record<string, unknown>) {
  const request = makeRequest(body);
  const res = await POST({ request } as Parameters<typeof POST>[0]);
  return parseResponse(res);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  process.env.LOOPS_API_KEY = 'test-loops-key';
  (updateContact as Mock).mockReset();
  (updateContact as Mock).mockResolvedValue({ success: true });
  resetRateLimit();
});

afterEach(() => {
  delete process.env.LOOPS_API_KEY;
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/micro-survey', () => {
  it('returns 200 with code "success" for a valid request', async () => {
    const result = await callMicroSurvey({
      email: 'test@example.com',
      answer: 'Been burned before',
    });

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.code).toBe('success');
  });

  it('calls updateContact with the correct email and field', async () => {
    await callMicroSurvey({
      email: 'test@example.com',
      answer: 'Just curious for now',
    });

    expect(updateContact).toHaveBeenCalledWith(
      'test@example.com',
      { microSurveyAnswer: 'Just curious for now' },
      'test-loops-key'
    );
  });

  it('returns 400 with code "validation_error" when email is missing', async () => {
    const result = await callMicroSurvey({ answer: 'Some answer' });

    expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('validation_error');
  });

  it('returns 400 with code "validation_error" when answer is missing', async () => {
    const result = await callMicroSurvey({ email: 'test@example.com' });

    expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('validation_error');
  });

  it('returns 400 with code "validation_error" when email is empty string', async () => {
    const result = await callMicroSurvey({ email: '', answer: 'Some answer' });

    expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('validation_error');
  });

  it('returns 400 with code "validation_error" when answer is empty string', async () => {
    const result = await callMicroSurvey({
      email: 'test@example.com',
      answer: '',
    });

    expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('validation_error');
  });

  it('returns 502 with code "esp_unavailable" when Loops fails', async () => {
    (updateContact as Mock).mockResolvedValue({ success: false });

    const result = await callMicroSurvey({
      email: 'test@example.com',
      answer: 'Been burned before',
    });

    expect(result.status).toBe(502);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('esp_unavailable');
  });

  it('returns 429 with code "rate_limited" after 3 requests from the same email', async () => {
    const body = { email: 'rate@example.com', answer: 'Answer' };

    // First 3 should succeed
    const r1 = await callMicroSurvey(body);
    const r2 = await callMicroSurvey(body);
    const r3 = await callMicroSurvey(body);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(200);

    // 4th should be rate limited
    const r4 = await callMicroSurvey(body);

    expect(r4.status).toBe(429);
    expect(r4.ok).toBe(false);
    expect(r4.code).toBe('rate_limited');
  });

  it('does not rate limit different emails', async () => {
    for (let i = 0; i < 3; i++) {
      await callMicroSurvey({
        email: 'user-a@example.com',
        answer: 'Answer',
      });
    }

    // Different email should not be rate limited
    const result = await callMicroSurvey({
      email: 'user-b@example.com',
      answer: 'Answer',
    });

    expect(result.status).toBe(200);
  });

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('https://truvis.app/api/micro-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });

    const res = await POST({ request } as Parameters<typeof POST>[0]);
    const parsed = await parseResponse(res);

    expect(parsed.status).toBe(400);
    expect(parsed.code).toBe('validation_error');
  });
});
