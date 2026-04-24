/**
 * Typed environment access — Story 1.7 (AC5, NFR12)
 *
 * This module is the ONLY place in the codebase allowed to read
 * `process.env` or `import.meta.env`. Every other consumer MUST import
 * `getRequired` / `parseBoolean` from here. The rule is enforced by
 * code review (see `CONTRACT.md` § "Environment Variable Access").
 *
 * Rationale:
 *   - Centralising env access gives us a single spot to add validation,
 *     fail-fast behaviour, and (later) Zod schema checks at module load.
 *   - It prevents the "secret leaks into a client bundle" failure mode
 *     — variables without the `PUBLIC_` prefix are stripped by Astro at
 *     build time, but we still want an in-code guard rail.
 *   - It keeps `NFR12` ("no client-side credentials") enforceable: a
 *     reviewer can grep for `process.env` / `import.meta.env` outside
 *     this file and reject the PR if it finds anything.
 *
 * Astro surfaces build-time env vars via `import.meta.env`. At runtime
 * (Cloudflare Pages Functions) they also live on `process.env`. We
 * prefer `import.meta.env` because it works in both contexts through
 * Astro's Vite-based build.
 */

type EnvRecord = Record<string, string | boolean | undefined>;

/**
 * Request-scoped runtime env injected by Cloudflare Pages Functions.
 *
 * CF Pages passes server-side secrets (non-PUBLIC_ vars) through
 * `context.locals.runtime.env`, NOT through `import.meta.env` or
 * `process.env`. API route handlers must call `setRuntimeEnv()` at
 * the top of their handler to make these secrets available to
 * `getRequired()` / `getOptional()`.
 */
let _runtimeEnv: EnvRecord | undefined;

/**
 * Inject Cloudflare Pages runtime env vars. Call this at the start
 * of any API route handler:
 *
 *   setRuntimeEnv(locals.runtime.env);
 */
export function setRuntimeEnv(env: Record<string, unknown>): void {
  const cleaned: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') {
      cleaned[key] = value;
    }
  }
  _runtimeEnv = cleaned;
}

/**
 * Resolve the raw env bag. Priority (highest wins):
 *   1. Cloudflare runtime env (set via `setRuntimeEnv()`)
 *   2. `import.meta.env` (Astro / Vite — build-time + PUBLIC_ vars)
 *   3. `process.env` (Node-only scripts, tests)
 */
function rawEnv(): EnvRecord {
  const viteEnv =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as unknown as EnvRecord)
      : undefined;
  const nodeEnv =
    typeof process !== 'undefined' && process.env
      ? (process.env as unknown as EnvRecord)
      : undefined;
  return { ...nodeEnv, ...viteEnv, ..._runtimeEnv };
}

/**
 * Read a required string-valued env var. Throws if the key is missing
 * or empty — we want loud failures at build time rather than quiet
 * `undefined` propagation into HTML.
 */
export function getRequired(key: string): string {
  const value = rawEnv()[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `[env] Required environment variable "${key}" is not set. ` +
        `See .env.example for the full inventory.`
    );
  }
  return String(value);
}

/**
 * Read an optional string env var. Returns `fallback` (default: `''`)
 * when the key is missing. Use sparingly — prefer `getRequired` so
 * missing config surfaces immediately.
 */
export function getOptional(key: string, fallback = ''): string {
  const value = rawEnv()[key];
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

/**
 * Cloudflare Turnstile configuration — Story 3.2 (AR13, NFR12, NFR15)
 *
 * `siteKey` is client-readable (`PUBLIC_` prefix) — pass it to the
 * Turnstile widget in the form island. `secretKey` is server-only (no
 * `PUBLIC_` prefix) — use it exclusively in the `siteverify` call from
 * the `/api/waitlist` route. Never expose `secretKey` to client code.
 */
export function getTurnstileConfig(): { siteKey: string; secretKey: string } {
  return {
    siteKey: getRequired('PUBLIC_TURNSTILE_SITE_KEY'),
    secretKey: getRequired('TURNSTILE_SECRET_KEY'),
  };
}

/**
 * Parse a boolean env var. Accepts the strings `"true"` / `"false"`
 * (case-insensitive) and the JS booleans `true` / `false`. Anything
 * else — including a missing key — is treated as `false`.
 */
export function parseBoolean(key: string): boolean {
  const value = rawEnv()[key];
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  const normalised = String(value).trim().toLowerCase();
  return normalised === 'true' || normalised === '1' || normalised === 'yes';
}
