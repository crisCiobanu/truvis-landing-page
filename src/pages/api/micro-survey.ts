/**
 * POST /api/micro-survey — Story 3.6 (AC5, FR17)
 *
 * Updates the Loops contact's `microSurveyAnswer` custom field for drip
 * segmentation. Non-critical — the client island swallows failures
 * silently and always shows a "Thanks" message.
 *
 * Validation: email + answer must be non-empty strings.
 * Rate limiting: in-memory Map, 3 requests per 60s per email.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

import { getRequired } from '@/lib/env';
import { updateContact } from '@/lib/loops';

// ---------------------------------------------------------------------------
// In-memory rate limiting
// TODO(v1.1): move rate limiting to Cloudflare KV for persistence
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 60 seconds
const RATE_LIMIT_MAX = 3;

export function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(email) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(email, recent);
  return false;
}

/** Exported for testing — clears the rate limit map between tests. */
export function resetRateLimit(): void {
  rateLimitMap.clear();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(
  body: { ok: boolean; code: string },
  status: number
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const POST: APIRoute = async ({ request }) => {
  try {
    // ── 1. Parse JSON body ─────────────────────────────────────────────
    let body: { email?: unknown; answer?: unknown };
    try {
      body = (await request.json()) as { email?: unknown; answer?: unknown };
    } catch {
      return jsonResponse({ ok: false, code: 'validation_error' }, 400);
    }

    // ── 2. Validate fields ─────────────────────────────────────────────
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const answer =
      typeof body.answer === 'string' ? body.answer.trim().slice(0, 500) : '';

    if (!email || !answer) {
      return jsonResponse({ ok: false, code: 'validation_error' }, 400);
    }

    // ── 3. Rate limit ──────────────────────────────────────────────────
    if (isRateLimited(email)) {
      return jsonResponse({ ok: false, code: 'rate_limited' }, 429);
    }

    // ── 4. Update Loops contact ────────────────────────────────────────
    const apiKey = getRequired('LOOPS_API_KEY');
    const result = await updateContact(
      email,
      { microSurveyAnswer: answer },
      apiKey
    );

    if (result.success) {
      return jsonResponse({ ok: true, code: 'success' }, 200);
    }

    return jsonResponse({ ok: false, code: 'esp_unavailable' }, 502);
  } catch {
    return jsonResponse({ ok: false, code: 'esp_unavailable' }, 502);
  }
};
