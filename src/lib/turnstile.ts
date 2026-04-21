/**
 * Cloudflare Turnstile server-side verification — Story 3.3 (AR Decision 2c)
 *
 * Server-side only module. Verifies Turnstile tokens against the CF
 * siteverify endpoint.
 *
 * - CF Turnstile docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * - No `PUBLIC_*` env vars, no browser APIs, no `client:*` directives.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Verify a Turnstile token server-side. Returns `{ success: false }` for
 * missing tokens without making an external call.
 *
 * @param remoteip - Optional client IP (CF-Connecting-IP) to bind the
 *   token to the solver's IP and prevent replay from other IPs.
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteip?: string
): Promise<TurnstileResult> {
  // Reject missing token without calling the API
  if (!token || token.trim() === '') {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const body: Record<string, string> = {
      secret: secretKey,
      response: token,
    };
    if (remoteip) {
      body.remoteip = remoteip;
    }

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { success: false, errorCodes: ['siteverify-error'] };
    }

    const data = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    return {
      success: data.success,
      errorCodes: data['error-codes'],
    };
  } catch {
    return { success: false, errorCodes: ['network-error'] };
  }
}
