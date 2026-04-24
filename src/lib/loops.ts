/**
 * Loops ESP client — Story 3.3 (AR Decision 3a, FR12, FR14)
 *
 * Server-side only module. Creates waitlist contacts via the Loops API
 * with exponential backoff retry for transient failures.
 *
 * - Loops API docs: https://loops.so/docs/api-reference/create-contact
 * - This module NEVER logs the API key or email address (NFR11, NFR12).
 * - No `PUBLIC_*` env vars, no browser APIs, no `client:*` directives.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoopsResult =
  | { ok: true; contactId?: string }
  | {
      ok: false;
      code:
        | 'duplicate'
        | 'pending'
        | 'rate_limited'
        | 'server_error'
        | 'network_error';
      retryable: boolean;
      /** Number of retry attempts made (0 if no retries). */
      attempts: number;
    };

export interface AddContactParams {
  email: string;
  audienceId: string;
  apiKey: string;
  signupSource: string;
  locale: string;
  launchPhase: string;
  /** When false, creates the contact without subscribing to the mailing list (for double opt-in). */
  subscribe?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOOPS_CREATE_URL = 'https://app.loops.so/api/v1/contacts/create';

/** Backoff delays in ms for retry attempts (attempt index 1, 2). */
const BACKOFF_DELAYS = [300, 700, 1500];

/** Maximum total attempts (1 initial + 2 retries). */
const MAX_ATTEMPTS = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRetryDelay(attempt: number, response: Response | null): number {
  // If 429 with Retry-After, respect it
  if (response?.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (!Number.isNaN(seconds) && seconds > 0) {
        return Math.min(seconds * 1000, 5000);
      }
    }
  }
  return BACKOFF_DELAYS[attempt] ?? BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1];
}

/**
 * Sleep for `ms` milliseconds. Extracted so tests can advance fake timers.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Create a contact in Loops with custom fields for drip segmentation.
 *
 * Retries up to 3 total attempts with exponential backoff on transient
 * failures (5xx, 429, network errors). 4xx (except 429) are not retried.
 */
export async function addContact(
  params: AddContactParams
): Promise<LoopsResult> {
  const {
    email,
    audienceId,
    apiKey,
    signupSource,
    locale,
    launchPhase,
    subscribe = true,
  } = params;

  const body = JSON.stringify({
    email,
    ...(subscribe && { mailingLists: { [audienceId]: true } }),
    source: 'truvis-landing-page',
    userGroup: 'waitlist-v1',
    signupSource,
    locale,
    launchPhase,
  });

  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Wait before retry (not on first attempt)
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1, lastResponse);
      console.log(
        JSON.stringify({
          event: 'loops_retry',
          attempt: attempt + 1,
          delayMs: delay,
        })
      );
      await sleep(delay);
    }

    try {
      lastResponse = await fetch(LOOPS_CREATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body,
      });

      // Success
      if (lastResponse.ok) {
        try {
          const data = (await lastResponse.json()) as Record<string, unknown>;
          return { ok: true, contactId: data.id as string | undefined };
        } catch {
          // Contact was created but response body is not valid JSON — treat as success
          return { ok: true };
        }
      }

      // Duplicate / already subscribed — Loops returns 409
      if (lastResponse.status === 409) {
        return {
          ok: false,
          code: 'duplicate',
          retryable: false,
          attempts: attempt + 1,
        };
      }

      // Conflict indicated in body (some Loops versions use 400 with message)
      if (lastResponse.status === 400) {
        try {
          const errorData = (await lastResponse.json()) as Record<
            string,
            unknown
          >;
          const message = String(errorData.message ?? '').toLowerCase();
          if (
            message.includes('already') ||
            message.includes('duplicate') ||
            message.includes('exists')
          ) {
            return {
              ok: false,
              code: 'duplicate',
              retryable: false,
              attempts: attempt + 1,
            };
          }
          if (message.includes('pending') || message.includes('unconfirmed')) {
            return {
              ok: false,
              code: 'pending',
              retryable: false,
              attempts: attempt + 1,
            };
          }
        } catch {
          // Non-JSON 400 body — treat as non-retryable client error
        }
        // Other 400 — not retryable
        return {
          ok: false,
          code: 'server_error',
          retryable: false,
          attempts: attempt + 1,
        };
      }

      // Rate limited
      if (lastResponse.status === 429) {
        // Will retry on next iteration
        if (attempt < MAX_ATTEMPTS - 1) continue;
        return {
          ok: false,
          code: 'rate_limited',
          retryable: true,
          attempts: attempt + 1,
        };
      }

      // Server errors (5xx) — retryable
      if (lastResponse.status >= 500) {
        if (attempt < MAX_ATTEMPTS - 1) continue;
        return {
          ok: false,
          code: 'server_error',
          retryable: true,
          attempts: attempt + 1,
        };
      }

      // Other unexpected status — not retryable
      return {
        ok: false,
        code: 'server_error',
        retryable: false,
        attempts: attempt + 1,
      };
    } catch {
      // Network error — retryable
      lastResponse = null;
      if (attempt < MAX_ATTEMPTS - 1) continue;
      return {
        ok: false,
        code: 'network_error',
        retryable: true,
        attempts: attempt + 1,
      };
    }
  }

  // TODO(epic-7): Report to Sentry when all retries exhausted
  // TODO(v1.1): Enqueue failed signups to KV for background retry

  // Should not reach here, but safety net
  return {
    ok: false,
    code: 'server_error',
    retryable: false,
    attempts: MAX_ATTEMPTS,
  };
}

// ---------------------------------------------------------------------------
// Update contact — Story 3.6 (FR17)
// ---------------------------------------------------------------------------

const LOOPS_UPDATE_URL = 'https://app.loops.so/api/v1/contacts/update';

/**
 * Update custom fields on an existing Loops contact identified by email.
 *
 * Used by the micro-survey to persist the visitor's answer in the
 * `microSurveyAnswer` field for drip segmentation. Single-shot — no
 * retry logic (survey answers are non-critical; the client swallows
 * failures silently).
 */
export async function updateContact(
  email: string,
  fields: Record<string, string>,
  apiKey: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(LOOPS_UPDATE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, ...fields }),
    });
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// Subscribe to mailing list — double opt-in confirmation
// ---------------------------------------------------------------------------

/**
 * Subscribe an existing contact to a mailing list. Called after the user
 * clicks the double opt-in confirmation link.
 */
export async function subscribeToMailingList(
  email: string,
  audienceId: string,
  apiKey: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(LOOPS_UPDATE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        mailingLists: { [audienceId]: true },
      }),
    });
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// Send transactional email — double opt-in
// ---------------------------------------------------------------------------

const LOOPS_TRANSACTIONAL_URL = 'https://app.loops.so/api/v1/transactional';

/**
 * Send a transactional email via Loops (e.g. double opt-in confirmation).
 */
export async function sendTransactionalEmail(params: {
  email: string;
  transactionalId: string;
  dataVariables: Record<string, string>;
  apiKey: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(LOOPS_TRANSACTIONAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        transactionalId: params.transactionalId,
        email: params.email,
        dataVariables: params.dataVariables,
      }),
    });
    if (!response.ok) {
      let errorDetail = `status ${response.status}`;
      try {
        const body = await response.text();
        errorDetail += `: ${body}`;
      } catch {
        // ignore
      }
      console.error(
        JSON.stringify({ event: 'loops_transactional_error', error: errorDetail })
      );
      return { success: false, error: errorDetail };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(
      JSON.stringify({ event: 'loops_transactional_error', error: msg })
    );
    return { success: false, error: msg };
  }
}
