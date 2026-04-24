/**
 * GET /api/confirm — Double opt-in confirmation endpoint
 *
 * Validates the HMAC token from the confirmation email link,
 * creates the contact in Loops WITH mailing list subscription,
 * and redirects to the waitlist-confirmed page.
 *
 * Query params (all HMAC-signed to prevent tampering):
 *   - email, signupSource, locale, launchPhase, token
 */
import type { APIRoute } from 'astro';

export const prerender = false;

import { getRequired, setRuntimeEnv } from '@/lib/env';
import { validateConfirmToken } from '@/lib/confirm-token';
import { addContact } from '@/lib/loops';

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  // Inject CF Pages runtime env
  const runtime = (locals as Record<string, unknown> | undefined)?.runtime as
    | { env: Record<string, unknown> }
    | undefined;
  if (runtime?.env) {
    setRuntimeEnv(runtime.env);
  }

  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase() ?? '';
  const signupSource = url.searchParams.get('signupSource') ?? 'unknown';
  const locale = url.searchParams.get('locale') ?? 'en';
  const launchPhase = url.searchParams.get('launchPhase') ?? 'pre';
  const token = url.searchParams.get('token') ?? '';

  if (!email || !token) {
    return redirect('/404', 302);
  }

  try {
    const confirmSecret = getRequired('CONFIRM_HMAC_SECRET');
    const payload = { email, signupSource, locale, launchPhase };
    const isValid = await validateConfirmToken(payload, token, confirmSecret);

    if (!isValid) {
      console.log(
        JSON.stringify({ event: 'confirm_invalid_token', email: '***' })
      );
      return redirect('/404', 302);
    }

    // Create the contact WITH mailing list subscription — this is the
    // first time a Loops contact record is created for this email.
    const loopsApiKey = getRequired('LOOPS_API_KEY');
    const loopsAudienceId = getRequired('LOOPS_AUDIENCE_ID');

    const result = await addContact({
      email,
      audienceId: loopsAudienceId,
      apiKey: loopsApiKey,
      signupSource,
      locale,
      launchPhase,
      subscribe: true,
    });

    if (!result.ok && result.code !== 'duplicate') {
      console.error(
        JSON.stringify({ event: 'confirm_create_failed', code: result.code })
      );
    }

    // Redirect to confirmation page regardless — we don't want to leak
    // whether the creation succeeded or not
    return redirect(
      `/waitlist-confirmed?email=${encodeURIComponent(email)}&confirmed=true`,
      302
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'confirm_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
    return redirect('/404', 302);
  }
};
