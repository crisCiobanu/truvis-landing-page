/**
 * GET /api/confirm — Double opt-in confirmation endpoint
 *
 * Validates the HMAC token from the confirmation email link,
 * subscribes the contact to the mailing list, and redirects
 * to the waitlist-confirmed page.
 *
 * Query params:
 *   - email: the contact's email address
 *   - token: HMAC-SHA256 confirmation token
 */
import type { APIRoute } from 'astro';

export const prerender = false;

import { getRequired, setRuntimeEnv } from '@/lib/env';
import { validateConfirmToken } from '@/lib/confirm-token';
import { subscribeToMailingList } from '@/lib/loops';

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
  const token = url.searchParams.get('token') ?? '';

  if (!email || !token) {
    return redirect('/404', 302);
  }

  try {
    const confirmSecret = getRequired('CONFIRM_HMAC_SECRET');
    const isValid = await validateConfirmToken(email, token, confirmSecret);

    if (!isValid) {
      console.log(
        JSON.stringify({ event: 'confirm_invalid_token', email: '***' })
      );
      return redirect('/404', 302);
    }

    // Subscribe the contact to the mailing list
    const loopsApiKey = getRequired('LOOPS_API_KEY');
    const loopsAudienceId = getRequired('LOOPS_AUDIENCE_ID');

    const result = await subscribeToMailingList(email, loopsAudienceId, loopsApiKey);

    if (!result.success) {
      console.error(
        JSON.stringify({ event: 'confirm_subscribe_failed' })
      );
    }

    // Redirect to confirmation page regardless — we don't want to leak
    // whether the subscription succeeded or not
    return redirect(`/waitlist-confirmed?email=${encodeURIComponent(email)}&confirmed=true`, 302);
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
