/**
 * i18n helper — Story 1.6 (AC1 / AR17 / Decision 4d)
 *
 * Thin wrapper around Astro's built-in i18n routing. Message files live
 * at `src/i18n/{en,fr,de}/{common,landing,blog,faq}.json`. The V1 French
 * and German files are byte-for-byte copies of English (FR52); real
 * translations land in V1.2.
 *
 * Usage:
 *   import { t } from '@/lib/i18n';
 *   t('common.nav.home', 'en');                              // "Home"
 *   t('landing.problem.headline', 'en', { amount: '€2,300' });
 *
 * Features:
 *   - Dot-notation key lookup (`namespace.section.element`).
 *   - Named-placeholder substitution (`{amount}`); positional `{0}`
 *     placeholders are rejected at runtime in dev.
 *   - Fallback to `en` when a key is missing in the requested locale,
 *     with a build-time warning so V1.2 translators can catch gaps.
 *
 * Architectural boundary: all i18n reads route through this module; no
 * component imports the raw JSON files directly.
 */

export type Locale = 'en' | 'fr' | 'de';
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'fr', 'de'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

// Eagerly glob every namespace JSON file so the `t()` helper is synchronous.
// `import.meta.glob` is resolved by Vite at build time — the JSON payload
// is inlined into the bundle, which keeps the helper zero-cost at runtime.
const rawMessages = import.meta.glob<{ default: Record<string, unknown> }>(
  '../i18n/**/*.json',
  { eager: true }
);

type MessageNamespace = Record<string, unknown>;
type LocaleMessages = Record<string, MessageNamespace>;

const messages: Record<Locale, LocaleMessages> = {
  en: {},
  fr: {},
  de: {},
};

for (const [path, mod] of Object.entries(rawMessages)) {
  // path looks like `../i18n/en/common.json`
  const match = /\/i18n\/(en|fr|de)\/([^/]+)\.json$/.exec(path);
  if (!match) continue;
  const locale = match[1] as Locale;
  const namespace = match[2];
  messages[locale][namespace] = mod.default as MessageNamespace;
}

/** True when running in a dev / non-production environment. */
const isDev =
  (typeof import.meta.env !== 'undefined' && import.meta.env.DEV === true) ||
  process.env.NODE_ENV !== 'production';

// Positional placeholders like `{0}` / `{1}` are forbidden — only named
// placeholders (`{amount}`) are supported. We check for a digit-only
// placeholder name.
const POSITIONAL_PLACEHOLDER = /\{\d+\}/;

// Matches `{name}` where `name` is a valid identifier fragment. We avoid
// matching `{0}` et al by requiring at least one non-digit character.
const NAMED_PLACEHOLDER = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/**
 * Walk a dot-notation key against a locale's message tree. Returns the
 * resolved string, or `undefined` if any segment is missing or the
 * terminal value is not a string.
 */
function resolveKey(tree: LocaleMessages, key: string): string | undefined {
  const segments = key.split('.');
  if (segments.length < 2) return undefined;
  const [namespace, ...rest] = segments;
  let node: unknown = tree[namespace];
  for (const segment of rest) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Substitute named placeholders into a template string. Throws in dev
 * if the template uses positional placeholders.
 *
 * Exported for unit testing only — production callers should go through
 * `t()`, which routes through this function after resolving the key.
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number> | undefined
): string {
  if (POSITIONAL_PLACEHOLDER.test(template)) {
    const message = `[i18n] Positional placeholders are not supported. Use named placeholders like {name}. Template: ${template}`;
    if (isDev) {
      throw new Error(message);
    }
    console.warn(message);
  }
  if (!vars) return template;
  return template.replace(NAMED_PLACEHOLDER, (full, name: string) => {
    const value = vars[name];
    if (value === undefined || value === null) {
      if (isDev) {
        console.warn(
          `[i18n] Missing value for placeholder "${name}" in template: ${template}`
        );
      }
      return full;
    }
    return String(value);
  });
}

/**
 * Translate a dot-notation key into the requested locale. Falls back to
 * English when the key is missing in the requested locale, and emits a
 * build-time warning so missing-translation gaps are visible.
 */
export function t(
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  vars?: Record<string, string | number>
): string {
  const primary = resolveKey(messages[locale] ?? {}, key);
  if (primary !== undefined) {
    return interpolate(primary, vars);
  }

  if (locale !== DEFAULT_LOCALE) {
    const fallback = resolveKey(messages[DEFAULT_LOCALE] ?? {}, key);
    if (fallback !== undefined) {
      console.warn(
        `[i18n] Missing translation for "${key}" in locale "${locale}" — falling back to "${DEFAULT_LOCALE}".`
      );
      return interpolate(fallback, vars);
    }
  }

  console.warn(
    `[i18n] Missing translation for "${key}" in locale "${locale}" (no fallback found).`
  );
  // Return the key itself so the surface is obviously broken in dev and
  // still renders something in production.
  return key;
}

/**
 * Resolve a dot-notation key to an array of strings. Returns an empty
 * array if the key does not resolve to an array. Used for i18n keys
 * that hold string arrays (e.g. micro-survey options).
 */
export function tArray(key: string, locale: Locale = DEFAULT_LOCALE): string[] {
  const segments = key.split('.');
  if (segments.length < 2) return [];
  const [namespace, ...rest] = segments;
  const tree = messages[locale] ?? messages[DEFAULT_LOCALE];
  let node: unknown = tree[namespace];
  for (const segment of rest) {
    if (node == null || typeof node !== 'object') return [];
    node = (node as Record<string, unknown>)[segment];
  }
  if (Array.isArray(node) && node.every((v) => typeof v === 'string')) {
    return node as string[];
  }
  // Fallback to default locale
  if (locale !== DEFAULT_LOCALE) {
    return tArray(key, DEFAULT_LOCALE);
  }
  return [];
}

/** Type-guard that narrows an arbitrary string to a supported locale. */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}
