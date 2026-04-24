/**
 * WaitlistForm — Story 3.4 (AC2, AC3, AC4, AC6)
 *
 * React island handling waitlist email capture with:
 *   - Full state machine via useReducer (idle → focused → validating →
 *     submitting → success / client_error / api_error)
 *   - Turnstile invisible widget (lazy-loaded, idempotent)
 *   - Honeypot field for bot detection
 *   - Accessible markup (aria-invalid, aria-describedby, aria-live)
 *   - i18n strings via t() helper
 *
 * Consumer: <WaitlistForm client:load signupSource="hero" variant="hero" />
 */
import { useReducer, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { t, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WaitlistFormProps {
  signupSource: 'hero' | 'mid' | 'footer';
  className?: string;
  variant: 'hero' | 'inline' | 'footer';
  locale?: Locale;
}

// ---------------------------------------------------------------------------
// Turnstile lazy loader (module-level, idempotent across instances)
// ---------------------------------------------------------------------------

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (turnstileScriptPromise) return turnstileScriptPromise;
  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileScriptPromise = null;
      reject(new Error('Turnstile script failed to load'));
    };
    document.head.appendChild(script);
    setTimeout(() => {
      turnstileScriptPromise = null;
      reject(new Error('Turnstile script timeout'));
    }, 10_000);
  });
  return turnstileScriptPromise;
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type FormStatus =
  | 'idle'
  | 'focused'
  | 'validating'
  | 'submitting'
  | 'success'
  | 'client_error'
  | 'api_error';

interface FormState {
  status: FormStatus;
  email: string;
  errorMessage: string | null;
  turnstileToken: string | null;
}

type FormAction =
  | { type: 'FOCUS' }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'BLUR_VALIDATE'; locale: Locale }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_DUPLICATE'; message: string }
  | { type: 'SUBMIT_ERROR'; message: string }
  | { type: 'SET_TURNSTILE_TOKEN'; token: string }
  | { type: 'TURNSTILE_FAILED'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLIENT_ERROR'; message: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(
  email: string,
  locale: Locale
): { valid: true } | { valid: false; message: string } {
  const trimmed = email.trim();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: t('landing.waitlist.errors.invalidEmail', locale),
    };
  }
  return { valid: true };
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'FOCUS':
      if (
        state.status === 'idle' ||
        state.status === 'client_error' ||
        state.status === 'api_error'
      ) {
        return { ...state, status: 'focused', errorMessage: null };
      }
      return state;

    case 'SET_EMAIL':
      return {
        ...state,
        email: action.email,
        ...(state.status === 'client_error'
          ? { status: 'focused' as const, errorMessage: null }
          : {}),
      };

    case 'BLUR_VALIDATE': {
      if (!state.email.trim()) {
        return { ...state, status: 'idle' };
      }
      const result = validateEmail(state.email, action.locale);
      if (!result.valid) {
        return {
          ...state,
          status: 'client_error',
          errorMessage: result.message,
        };
      }
      return { ...state, status: 'idle', errorMessage: null };
    }

    case 'CLIENT_ERROR':
      return { ...state, status: 'client_error', errorMessage: action.message };

    case 'SUBMIT':
      return { ...state, status: 'submitting', errorMessage: null };

    case 'SUBMIT_SUCCESS':
      return { ...state, status: 'success' };

    case 'SUBMIT_DUPLICATE':
      return { ...state, status: 'idle', errorMessage: action.message };

    case 'SUBMIT_ERROR':
      return { ...state, status: 'api_error', errorMessage: action.message };

    case 'SET_TURNSTILE_TOKEN':
      return { ...state, turnstileToken: action.token };

    case 'TURNSTILE_FAILED':
      return { ...state, turnstileToken: null, errorMessage: action.message };

    case 'CLEAR_ERROR':
      return { ...state, errorMessage: null };

    default:
      return state;
  }
}

const initialState: FormState = {
  status: 'idle',
  email: '',
  errorMessage: null,
  turnstileToken: null,
};

// ---------------------------------------------------------------------------
// Error code → i18n key mapping
// ---------------------------------------------------------------------------

const ERROR_CODE_MAP: Record<string, string> = {
  turnstile_failed: 'landing.waitlist.errors.turnstileFailed',
  esp_unavailable: 'landing.waitlist.errors.espUnavailable',
  validation_error: 'landing.waitlist.errors.invalidEmail',
  invalid_email: 'landing.waitlist.errors.invalidEmail',
  server_error: 'landing.waitlist.errors.serverError',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WaitlistForm({
  signupSource,
  className,
  variant,
  locale = 'en',
}: WaitlistFormProps) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const errorId = `waitlist-error-${signupSource}`;
  const emailId = `waitlist-email-${signupSource}`;
  const labelId = `waitlist-label-${signupSource}`;

  // ── Turnstile init ──────────────────────────────────────────────────
  useEffect(() => {
    const siteKey = (import.meta.env as unknown as Record<string, string>)
      .PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.warn(
        '[WaitlistForm] PUBLIC_TURNSTILE_SITE_KEY not set — Turnstile disabled in dev'
      );
      // In dev without the key, allow form submission without Turnstile
      dispatch({ type: 'SET_TURNSTILE_TOKEN', token: 'dev-bypass' });
      return;
    }

    let mounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!mounted || !turnstileContainerRef.current) return;
        const w = window as unknown as {
          turnstile: {
            render: (el: HTMLElement, opts: Record<string, unknown>) => string;
          };
        };
        const widgetId = w.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (mounted) dispatch({ type: 'SET_TURNSTILE_TOKEN', token });
          },
          'error-callback': () => {
            if (mounted) {
              dispatch({
                type: 'TURNSTILE_FAILED',
                message: t('landing.waitlist.errors.turnstileFailed', locale),
              });
              toast.error(t('landing.waitlist.errors.turnstileFailed', locale));
            }
          },
          size: 'invisible',
          appearance: 'interaction-only',
        });
        turnstileWidgetIdRef.current = widgetId;
      })
      .catch(() => {
        if (!mounted) return;
        dispatch({
          type: 'TURNSTILE_FAILED',
          message: t('landing.waitlist.errors.turnstileFailed', locale),
        });
        toast.error(t('landing.waitlist.errors.turnstileFailed', locale));
      });

    return () => {
      mounted = false;
    };
  }, [locale]);

  // ── Submit handler ──────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Client-side validation — use CLIENT_ERROR directly (not BLUR_VALIDATE)
      // to avoid the empty-field short-circuit in BLUR_VALIDATE
      const result = validateEmail(state.email, locale);
      if (!result.valid) {
        dispatch({ type: 'CLIENT_ERROR', message: result.message });
        return;
      }

      // Honeypot check — silently fake success for bots
      const honeypotValue = honeypotRef.current?.value ?? '';
      if (honeypotValue) {
        window.location.href = '/waitlist-confirmed';
        return;
      }

      dispatch({ type: 'SUBMIT' });

      try {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.email.trim(),
            signupSource,
            honeypot: honeypotValue,
            turnstileToken: state.turnstileToken,
            locale,
          }),
        });

        const data = (await response.json()) as {
          ok: boolean;
          code: string;
          message?: string;
        };

        if (data.code === 'success') {
          // TODO(epic-6): trackEvent('waitlist_signup', { signupSource })
          dispatch({ type: 'SUBMIT_SUCCESS' });
          window.location.href = `/waitlist-confirmed?email=${encodeURIComponent(state.email)}`;
          return;
        }

        if (data.code === 'duplicate') {
          dispatch({
            type: 'SUBMIT_DUPLICATE',
            message: t('landing.waitlist.errors.duplicate', locale),
          });
          return;
        }

        // All other errors — toast
        const errorKey =
          ERROR_CODE_MAP[data.code] ?? 'landing.waitlist.errors.serverError';
        const errorMsg = t(errorKey, locale);
        dispatch({ type: 'SUBMIT_ERROR', message: errorMsg });
        toast.error(errorMsg);

        // Refresh Turnstile token for retry
        const w = window as unknown as {
          turnstile?: { reset: (widgetId?: string) => void };
        };
        if (turnstileWidgetIdRef.current) {
          w.turnstile?.reset(turnstileWidgetIdRef.current);
        }
      } catch {
        const errorMsg = t('landing.waitlist.errors.serverError', locale);
        dispatch({ type: 'SUBMIT_ERROR', message: errorMsg });
        toast.error(errorMsg);
      }
    },
    [state.email, state.turnstileToken, signupSource, locale]
  );

  const isSubmitting = state.status === 'submitting';
  const hasError =
    state.status === 'client_error' || state.status === 'api_error';
  const isButtonDisabled = !state.turnstileToken || isSubmitting;
  const isFooter = variant === 'footer';
  const showVisibleLabel = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        'flex w-full gap-3',
        variant === 'inline'
          ? 'flex-row items-start'
          : 'flex-col items-stretch sm:flex-row sm:items-start',
        className
      )}
    >
      {/* Honeypot — hidden from users, catches bots */}
      <input
        ref={honeypotRef}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Turnstile invisible widget container */}
      <div ref={turnstileContainerRef} />

      {/* Email field group */}
      <div
        className={cn(
          'flex-1',
          variant === 'inline'
            ? 'min-w-0'
            : 'w-full sm:min-w-[280px] sm:flex-[2]'
        )}
      >
        <label
          id={labelId}
          htmlFor={emailId}
          className={
            showVisibleLabel
              ? cn(
                  'mb-1 block text-[length:var(--text-sm)] font-medium',
                  'text-[var(--color-primary)]'
                )
              : 'sr-only'
          }
        >
          {t('landing.waitlist.emailLabel', locale)}
        </label>
        <input
          ref={emailInputRef}
          id={emailId}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={state.email}
          placeholder={t('landing.waitlist.placeholder', locale)}
          disabled={isSubmitting}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={state.errorMessage ? errorId : undefined}
          aria-labelledby={labelId}
          onFocus={() => dispatch({ type: 'FOCUS' })}
          onBlur={() => dispatch({ type: 'BLUR_VALIDATE', locale })}
          onChange={(e) =>
            dispatch({ type: 'SET_EMAIL', email: e.target.value })
          }
          className={cn(
            'flex h-11 w-full rounded-md border px-3 py-2 text-base shadow-sm transition-colors',
            'placeholder:text-[var(--color-faint)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-[var(--color-severity-red)] focus-visible:ring-[var(--color-severity-red)]'
              : 'border-[var(--color-border)]',
            isFooter
              ? 'bg-white/10 text-white placeholder:text-white/50'
              : 'bg-[var(--color-bg)]'
          )}
        />
        {state.errorMessage && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'mt-1.5 text-[length:var(--text-sm)]',
              state.status === 'client_error' || state.status === 'api_error'
                ? 'text-[var(--color-severity-red)]'
                : 'text-[var(--color-teal)]'
            )}
          >
            {state.errorMessage}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isButtonDisabled}
        className={cn(
          showVisibleLabel && 'sm:mt-6',
          'h-11 shrink-0 px-6 text-base font-semibold whitespace-nowrap',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isFooter
            ? 'bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-[var(--color-amber-light)]'
            : 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-bright)]'
        )}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('landing.waitlist.submitting', locale)}
          </span>
        ) : (
          t('landing.waitlist.submit', locale)
        )}
      </Button>

      {/* Aria-live region for screen readers during submission */}
      <div aria-live="polite" className="sr-only">
        {isSubmitting && t('landing.waitlist.submitting', locale)}
      </div>
    </form>
  );
}
