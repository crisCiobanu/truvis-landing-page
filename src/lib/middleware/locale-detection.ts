/**
 * Locale-detection middleware — Story 1.6 (AC2 / AR18 / FR51)
 *
 * Runs on every request (dev + prerender). On a first visit the
 * middleware picks the best-matching locale from either the
 * `truvis_locale` cookie (set on previous visits) or the
 * `Accept-Language` header and, when the visitor prefers French or
 * German, redirects to the matching locale prefix so future V1.2
 * translated content lives at a stable URL.
 *
 * Notes:
 *   - `/api/*`, `/keystatic/*`, `/_demo/*` and `/.well-known/*` are
 *     exempt — they must never be redirected.
 *   - Only the cookie is available server-side on first visit.
 *     `localStorage`-based preference handling is client-side and lives
 *     in a future V1.2 story (language switcher).
 *   - V1 ships English-only content for every locale prefix. The
 *     translation plumbing (`src/i18n/{en,fr,de}/*.json`) resolves the
 *     same strings until real translations land in V1.2 (FR52).
 *
 * This file is re-exported from `src/middleware.ts` (Astro's conventional
 * middleware entry point).
 */

import type { MiddlewareHandler } from 'astro';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';

const COOKIE_NAME = 'truvis_locale';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
const REDIRECTABLE_LOCALES: readonly Locale[] = ['fr', 'de'] as const;

// Paths the middleware must never redirect.
const EXEMPT_PREFIXES = ['/api/', '/keystatic/', '/_demo/', '/.well-known/'];
// SSR pages that handle locale internally via Astro.currentLocale — redirecting
// them to a locale prefix produces a 404 because Astro's file-based router
// doesn't match locale-prefixed paths for root-level SSR pages.
const EXEMPT_PATHS = ['/waitlist-confirmed'];

/** True when the request path is outside the i18n redirect scope. */
function isExempt(pathname: string): boolean {
  return (
    EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}?`))
  );
}

/** True when the URL path already starts with a locale prefix. */
function hasLocalePrefix(pathname: string): Locale | null {
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue; // `/` is the English root
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

/**
 * Parse an `Accept-Language` header and return the highest-quality
 * locale that intersects `REDIRECTABLE_LOCALES`. Returns `null` when
 * the visitor does not prefer any of our redirect targets.
 *
 * We only redirect on `fr` / `de`; English visitors stay on `/`.
 */
export function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const candidates = header
    .split(',')
    .map((entry) => {
      const [rawTag, ...params] = entry.trim().split(';');
      const tag = rawTag.trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.tag.length > 0 && c.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const candidate of candidates) {
    // Match on the base language (e.g. `fr-CA` → `fr`).
    const base = candidate.tag.split('-')[0] as Locale;
    if ((REDIRECTABLE_LOCALES as readonly string[]).includes(base)) {
      return base;
    }
  }
  return null;
}

/**
 * Serialise the persistence cookie. `SameSite=Lax`, 1-year max-age. The
 * `Secure` flag is set in non-dev environments so the cookie is only ever
 * transmitted over HTTPS in production (Cloudflare Pages always serves
 * over TLS). Dev omits `Secure` so `http://localhost` can still read/set
 * the cookie. `HttpOnly` is intentionally omitted so a future V1.2
 * client-side language switcher can sync the cookie from localStorage.
 */
function buildLocaleCookie(locale: Locale): string {
  const parts = [
    `${COOKIE_NAME}=${locale}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
  ];
  if (!import.meta.env.DEV) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  // During `astro build` in `output: 'static'` mode, every route is
  // prerendered with a synthetic request that has no meaningful headers.
  // Accessing `request.headers` in that context is a no-op and Astro
  // warns about it, so we short-circuit build-time prerender passes and
  // only run the redirect logic when there's a live request to inspect.
  //
  // Production (Cloudflare Pages): the locale-detection redirect is
  // handled by a Pages Function that mirrors this logic — tracked as a
  // follow-up to Story 1.6 (out of scope for this story, which wires the
  // Astro middleware plumbing and verifies behaviour in dev).
  //
  // In `astro dev`, `import.meta.env.DEV === true` and `isPrerendered`
  // remains `true` for static routes, so we gate on `!DEV` to still run
  // through the full pipeline per request during local development.
  if (!import.meta.env.DEV && context.isPrerendered) {
    return next();
  }

  const { request } = context;
  const url = new URL(request.url);
  const { pathname } = url;

  // 1. Never touch API / admin / demo / well-known routes.
  if (isExempt(pathname)) {
    return next();
  }

  // 2. Respect an existing locale prefix — the visitor already chose.
  const existingPrefix = hasLocalePrefix(pathname);
  if (existingPrefix) {
    return next();
  }

  // 3. Cookie preference wins over the `Accept-Language` header (FR51).
  //    NOTE: `localStorage`-based preference is a client-side concern and
  //    is out of scope for this story — a future V1.2 language switcher
  //    will sync the cookie from localStorage on load.
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieMatch = new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`).exec(
    cookieHeader
  );
  const cookieLocale = cookieMatch?.[1] as Locale | undefined;

  if (
    cookieLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
  ) {
    if (cookieLocale === DEFAULT_LOCALE) {
      // Already English — no redirect needed.
      return next();
    }
    // Redirect to the locale-prefixed URL, preserving query / hash.
    const target = new URL(`/${cookieLocale}${pathname}`, url);
    target.search = url.search;
    target.hash = url.hash;
    return new Response(null, {
      status: 302,
      headers: {
        Location: target.toString(),
        'Set-Cookie': buildLocaleCookie(cookieLocale),
      },
    });
  }

  // 4. Otherwise parse `Accept-Language` and redirect if French / German.
  const headerLocale = parseAcceptLanguage(
    request.headers.get('accept-language')
  );
  if (headerLocale) {
    const target = new URL(`/${headerLocale}${pathname}`, url);
    target.search = url.search;
    target.hash = url.hash;
    return new Response(null, {
      status: 302,
      headers: {
        Location: target.toString(),
        'Set-Cookie': buildLocaleCookie(headerLocale),
      },
    });
  }

  // 5. Fall through to English at `/`.
  return next();
};
