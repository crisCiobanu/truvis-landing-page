/**
 * POST /api/waitlist — Story 3.3 (AR Decision 2b, 2c, 3a, 3b)
 *
 * Server-side Astro API route that validates waitlist signups and proxies
 * to Loops. Runs as a Cloudflare Pages Function at request time.
 *
 * Validation pipeline (cheapest first):
 *   1. Parse JSON body
 *   2. Honeypot check — silent 200 for bots
 *   3. Turnstile verification — CF siteverify
 *   4. Email format validation — regex
 *   5. Loops contact creation — with retry
 */
import type { APIRoute } from 'astro';

export const prerender = false;

import { getRequired, getOptional, setRuntimeEnv } from '@/lib/env';
import { sendTransactionalEmail } from '@/lib/loops';
import { generateConfirmToken } from '@/lib/confirm-token';
import { verifyTurnstileToken } from '@/lib/turnstile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WaitlistRequest {
  email: string;
  honeypot?: string;
  turnstileToken: string;
  signupSource?: string;
  locale?: string;
}

interface WaitlistResponse {
  ok: boolean;
  code:
    | 'success'
    | 'invalid_email'
    | 'duplicate'
    | 'spam'
    | 'turnstile_failed'
    | 'esp_unavailable'
    | 'server_error';
  message?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: WaitlistResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const POST: APIRoute = async ({ request, locals }) => {
  // Inject Cloudflare Pages runtime env so getRequired()/getOptional()
  // can read server-side secrets (TURNSTILE_SECRET_KEY, LOOPS_API_KEY, etc.).
  // In test environments locals may be undefined — skip gracefully.
  const runtime = (locals as Record<string, unknown> | undefined)?.runtime as
    | { env: Record<string, unknown> }
    | undefined;
  if (runtime?.env) {
    setRuntimeEnv(runtime.env);
  }

  const startTime = Date.now();
  let signupSource = 'unknown';
  let locale = 'en';
  let turnstileVerified = false;

  try {
    // ── 1. Parse JSON body ──────────────────────────────────────────────
    let body: WaitlistRequest;
    try {
      body = (await request.json()) as WaitlistRequest;
    } catch {
      return jsonResponse(
        { ok: false, code: 'server_error', message: 'Invalid request body.' },
        400
      );
    }

    signupSource = body.signupSource ?? 'unknown';
    locale = body.locale ?? 'en';

    // ── 2. Honeypot check (cheapest — no external call) ─────────────────
    if (body.honeypot && body.honeypot.trim() !== '') {
      console.log(JSON.stringify({ event: 'waitlist_honeypot', signupSource }));
      // Silent success — bots cannot distinguish from real success (NFR15)
      return jsonResponse({ ok: true, code: 'success' }, 200);
    }

    // ── 3. Turnstile verification ───────────────────────────────────────
    const turnstileSecretKey = getRequired('TURNSTILE_SECRET_KEY');
    const clientIp =
      request.headers.get('CF-Connecting-IP') ??
      request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim();
    const turnstileResult = await verifyTurnstileToken(
      body.turnstileToken,
      turnstileSecretKey,
      clientIp ?? undefined
    );

    if (!turnstileResult.success) {
      logCompletion({
        code: 'turnstile_failed',
        signupSource,
        locale,
        turnstileVerified: false,
        startTime,
      });
      return jsonResponse(
        {
          ok: false,
          code: 'turnstile_failed',
          message: 'Security verification failed. Please try again.',
        },
        400
      );
    }

    turnstileVerified = true;

    // ── 4. Email format validation ──────────────────────────────────────
    const email = (body.email ?? '').trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      logCompletion({
        code: 'invalid_email',
        signupSource,
        locale,
        turnstileVerified,
        startTime,
      });
      return jsonResponse(
        {
          ok: false,
          code: 'invalid_email',
          message: 'Please enter a valid email address.',
        },
        400
      );
    }

    // ── 5. Send double opt-in confirmation email ─────────────────────────
    // No contact is created yet — the contact is only created when the
    // user clicks the confirmation link (/api/confirm). This avoids
    // duplicate contacts and ensures only confirmed emails enter the list.
    const loopsApiKey = getRequired('LOOPS_API_KEY');
    const launchPhase = getOptional('LAUNCH_PHASE', 'pre');
    const confirmSecret = getRequired('CONFIRM_HMAC_SECRET');
    const doiTransactionalId = getRequired('LOOPS_DOI_TRANSACTIONAL_ID');

    const tokenPayload = { email, signupSource, locale, launchPhase };
    const token = await generateConfirmToken(tokenPayload, confirmSecret);
    const origin = new URL(request.url).origin;
    const confirmParams = new URLSearchParams({
      email,
      signupSource,
      locale,
      launchPhase,
      token,
    });
    const optInUrl = `${origin}/api/confirm?${confirmParams.toString()}`;

    const emailResult = await sendTransactionalEmail({
      email,
      transactionalId: doiTransactionalId,
      dataVariables: {
        companyName: 'Truvis',
        optInUrl,
      },
      apiKey: loopsApiKey,
    });

    if (emailResult.success) {
      logCompletion({
        code: 'success',
        signupSource,
        locale,
        turnstileVerified,
        startTime,
      });
      return jsonResponse(
        {
          ok: true,
          code: 'success',
          message: 'Check your inbox to confirm your email.',
        },
        200
      );
    }

    // Transactional email failed
    logCompletion({
      code: 'esp_unavailable',
      signupSource,
      locale,
      turnstileVerified,
      startTime,
    });
    return jsonResponse(
      {
        ok: false,
        code: 'esp_unavailable',
        message:
          'Our email service is temporarily unavailable. Please try again in a few minutes.',
      },
      502
    );
  } catch (error) {
    // ── Catch-all ─────────────────────────────────────────────────────
    console.error(
      JSON.stringify({
        event: 'waitlist_unhandled_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
    logCompletion({
      code: 'server_error',
      signupSource,
      locale,
      turnstileVerified,
      startTime,
    });
    return jsonResponse(
      {
        ok: false,
        code: 'server_error',
        message: 'An unexpected error occurred. Please try again.',
      },
      500
    );
  }
};

// ---------------------------------------------------------------------------
// Structured logging (NFR11 — no PII)
// ---------------------------------------------------------------------------

function logCompletion(params: {
  code: string;
  signupSource: string;
  locale: string;
  turnstileVerified: boolean;
  startTime: number;
  retryCount?: number;
}): void {
  console.log(
    JSON.stringify({
      event: 'waitlist_submission',
      code: params.code,
      signupSource: params.signupSource,
      locale: params.locale,
      turnstileVerified: params.turnstileVerified,
      responseTimeMs: Date.now() - params.startTime,
      ...(params.retryCount !== undefined && {
        retryCount: params.retryCount,
      }),
    })
  );
}
