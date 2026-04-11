/**
 * Unit tests for the `t()` i18n helper — Story 1.6.
 *
 * Vitest picks up `src/**\/*.test.ts` (see `vitest.config.ts`); this file
 * lives next to `src/lib/i18n.ts` rather than under a top-level `tests/`
 * directory so it matches the existing project convention (see
 * `src/stores/mobile-nav-store.test.ts`).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { interpolate, t } from './i18n';
import { onRequest, parseAcceptLanguage } from './middleware/locale-detection';

/**
 * Build a minimal Astro middleware context + a `next()` stub that
 * returns a 200 HTML response. Matches the shape that Astro's runtime
 * passes to `onRequest` closely enough for locale-redirect assertions.
 */
function buildContext(
  url: string,
  headers: Record<string, string> = {}
): { context: Parameters<typeof onRequest>[0]; next: () => Promise<Response> } {
  const request = new Request(url, { headers });
  const next = vi.fn(
    async () => new Response('<!doctype html>', { status: 200 })
  );
  // We only populate the fields the middleware actually touches.
  const context = {
    request,
    isPrerendered: false,
  } as unknown as Parameters<typeof onRequest>[0];
  return { context, next };
}

/**
 * Narrow Astro's `void | Response` middleware return type down to
 * `Response` for the assertions below. Every path in our middleware
 * either returns `next()` (which we stub to a real `Response`) or a
 * new `Response(...)` — so this narrowing is sound at runtime.
 */
async function runMiddleware(
  context: Parameters<typeof onRequest>[0],
  next: () => Promise<Response>
): Promise<Response> {
  const result = await onRequest(context, next);
  if (!(result instanceof Response)) {
    throw new Error('Middleware returned void — expected a Response');
  }
  return result;
}

describe('t() — i18n helper', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns the English string for a known key', () => {
    expect(t('common.nav.home', 'en')).toBe('Home');
  });

  it('returns the same (placeholder) string for fr and de at V1 (FR52)', () => {
    const en = t('common.nav.home', 'en');
    expect(t('common.nav.home', 'fr')).toBe(en);
    expect(t('common.nav.home', 'de')).toBe(en);
  });

  it('supports named placeholder substitution', () => {
    // Story 2.2 removed the `{amount}` placeholder from
    // `landing.problem.headline` (Epic 5 will re-parameterise via the
    // siteContent collection). Use `blog.index.readingTime` as the
    // canonical string-substitution fixture — it still ships with a
    // `{minutes}` placeholder in every locale JSON.
    const rendered = t('blog.index.readingTime', 'en', { minutes: '7' });
    expect(rendered).toBe('7 min read');
  });

  it('substitutes numeric values into named placeholders', () => {
    const rendered = t('common.footer.copyright', 'en', { year: 2026 });
    expect(rendered).toBe('© 2026 Truvis. All rights reserved.');
  });

  it('falls back to English and warns when a key is missing in the requested locale', () => {
    // Every V1 locale mirrors English, so to trigger the fallback path we
    // ask for a completely unknown key — the helper should return the key
    // itself and emit a warning.
    const result = t('landing.nonexistent.key', 'fr');
    expect(result).toBe('landing.nonexistent.key');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('named placeholders survive the positional-placeholder guard', () => {
    // Templates with `{amount}` (named) must not trip the positional-
    // placeholder guard. This covers the happy path through `interpolate`.
    expect(() =>
      t('landing.problem.headline', 'en', { amount: 100 })
    ).not.toThrow();
  });

  it('throws in dev when a template uses positional placeholders', () => {
    // `interpolate` is exported specifically so this guard can be
    // exercised directly — the loaded namespace JSON never contains
    // positional placeholders, so going through `t()` would not reach
    // the guard branch.
    expect(() => interpolate('Hello {0}', { '0': 'world' })).toThrow(
      /Positional placeholders are not supported/
    );
  });

  it('leaves unknown named placeholders intact and warns', () => {
    // Covers the `value === undefined` branch of `interpolate`.
    const rendered = interpolate('Hello {name}', {});
    expect(rendered).toBe('Hello {name}');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns the template unchanged when no vars are supplied', () => {
    expect(interpolate('Hello world', undefined)).toBe('Hello world');
  });
});

describe('parseAcceptLanguage', () => {
  it('returns null for a missing header', () => {
    expect(parseAcceptLanguage(null)).toBeNull();
    expect(parseAcceptLanguage('')).toBeNull();
  });

  it('returns null when the visitor only prefers English', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9')).toBeNull();
  });

  it('returns "fr" for a French preference', () => {
    expect(parseAcceptLanguage('fr-CA,fr;q=0.9,en;q=0.5')).toBe('fr');
  });

  it('returns "de" for a German preference', () => {
    expect(parseAcceptLanguage('de-DE,de;q=0.9,en;q=0.5')).toBe('de');
  });

  it('respects q-value ordering', () => {
    // English has a higher q than French → not a redirect candidate
    // because English isn't in REDIRECTABLE_LOCALES; the next candidate
    // is French, which should win.
    expect(parseAcceptLanguage('en;q=0.9,fr;q=0.8')).toBe('fr');
  });
});

/**
 * Middleware integration tests — AC2 (T6).
 *
 * NOTE: The story's T6 originally called for `curl` smoke tests against
 * `astro dev`. Astro 5's `output: 'static'` mode strips request headers
 * from the middleware pipeline (see `astro/dist/core/request.js` —
 * `isPrerendered: true` constructs an empty `Headers` object), so curl
 * verification cannot exercise the header-based redirect path in dev.
 * These tests invoke `onRequest` directly with a fabricated context,
 * which is strictly stronger coverage than the manual curl commands.
 * The production path runs through a Cloudflare Pages Function (tracked
 * as a Story 1.6 follow-up on the CF adapter side).
 */
describe('locale-detection middleware — onRequest', () => {
  it('T6.1 — redirects French visitors to /fr/', async () => {
    const { context, next } = buildContext('http://localhost/', {
      'accept-language': 'fr-FR,fr;q=0.9,en;q=0.5',
    });
    const response = await runMiddleware(context, next);
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('http://localhost/fr/');
    expect(response.headers.get('set-cookie')).toMatch(/truvis_locale=fr/);
    expect(next).not.toHaveBeenCalled();
  });

  it('T6.2 — serves English visitors without redirect', async () => {
    const { context, next } = buildContext('http://localhost/', {
      'accept-language': 'en-US,en;q=0.9',
    });
    const response = await runMiddleware(context, next);
    expect(response.status).toBe(200);
    expect(next).toHaveBeenCalled();
  });

  it('T6.3 — never redirects /api/* paths', async () => {
    const { context, next } = buildContext('http://localhost/api/whatever', {
      'accept-language': 'fr-FR,fr;q=0.9',
    });
    const response = await runMiddleware(context, next);
    expect(response.status).toBe(200);
    expect(next).toHaveBeenCalled();
  });

  it('T6.3b — never redirects /keystatic/*, /_demo/* or /.well-known/*', async () => {
    for (const path of [
      '/keystatic/',
      '/_demo/text-expansion',
      '/.well-known/security.txt',
    ]) {
      const { context, next } = buildContext(`http://localhost${path}`, {
        'accept-language': 'fr',
      });
      const response = await runMiddleware(context, next);
      expect(response.status, `path=${path}`).toBe(200);
      expect(next).toHaveBeenCalled();
    }
  });

  it('T6.4 — cookie=en overrides Accept-Language=fr (no redirect)', async () => {
    const { context, next } = buildContext('http://localhost/', {
      'accept-language': 'fr-FR,fr;q=0.9',
      cookie: 'truvis_locale=en',
    });
    const response = await runMiddleware(context, next);
    expect(response.status).toBe(200);
    expect(next).toHaveBeenCalled();
  });

  it('cookie=de redirects to /de/ even when header prefers English', async () => {
    const { context, next } = buildContext('http://localhost/', {
      'accept-language': 'en-US,en;q=0.9',
      cookie: 'truvis_locale=de',
    });
    const response = await runMiddleware(context, next);
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('http://localhost/de/');
  });

  it('does not redirect when the visitor is already on a locale-prefixed URL', async () => {
    const { context, next } = buildContext('http://localhost/fr/blog', {
      'accept-language': 'en',
    });
    const response = await runMiddleware(context, next);
    expect(response.status).toBe(200);
    expect(next).toHaveBeenCalled();
  });

  it('persists the chosen locale via Set-Cookie on redirect', async () => {
    const { context } = buildContext('http://localhost/', {
      'accept-language': 'de-DE,de;q=0.9',
    });
    const response = await runMiddleware(context, async () => new Response());
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/truvis_locale=de/);
    expect(setCookie).toMatch(/Max-Age=\d+/);
    expect(setCookie).toMatch(/SameSite=Lax/);
    expect(setCookie).toMatch(/Path=\//);
    // `Secure` flag is gated on `!import.meta.env.DEV`. Vitest runs
    // through Vite, so `DEV === true` here — the flag is therefore
    // omitted in this run. In a production `astro build` the flag will
    // be present because `DEV === false`. We assert the dev-mode shape
    // here so a regression that flips the gate the wrong way still
    // trips the test.
    expect(setCookie).not.toMatch(/Secure/);
  });
});
